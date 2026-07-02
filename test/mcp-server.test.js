import assert from "node:assert/strict";
import { test } from "node:test";
import { handleJsonRpc } from "../mcp-server.js";

test("initializes as a read-only MCP server", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "test-client", version: "0.0.0" }
    }
  });

  assert.equal(response.result.protocolVersion, "2025-11-25");
  assert.deepEqual(response.result.capabilities.tools, {});
  assert.match(response.result.instructions, /does not generate/);
});

test("lists public resources only", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 2,
    method: "resources/list"
  });

  const uris = response.result.resources.map((resource) => resource.uri);
  assert.ok(uris.includes("site://strongpassword/privacy"));
  assert.ok(uris.includes("site://strongpassword/faq"));
  assert.ok(uris.includes("site://strongpassword/mcp"));
});

test("reads the privacy resource without exposing passwords", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 3,
    method: "resources/read",
    params: { uri: "site://strongpassword/privacy" }
  });

  assert.equal(response.result.contents[0].mimeType, "text/markdown");
  assert.match(response.result.contents[0].text, /not sent to a StrongPassword backend/);
  assert.doesNotMatch(response.result.contents[0].text, /generated password:/i);
});

test("reads safe-password FAQ answers", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 6,
    method: "resources/read",
    params: { uri: "site://strongpassword/faq" }
  });

  const text = response.result.contents[0].text;
  assert.match(text, /How do I make a safe password/);
  assert.match(text, /Use a unique random password/);
  assert.match(text, /Do not send real passwords/);
});

test("returns no callable tools", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/list"
  });

  assert.deepEqual(response.result.tools, []);
});

test("refuses tool calls", () => {
  const response = handleJsonRpc({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: { name: "generate_password" }
  });

  assert.equal(response.error.code, -32601);
  assert.match(response.error.message, /read-only/);
});
