import assert from "node:assert/strict";
import { request } from "node:http";
import { test } from "node:test";
import { createServer, handleJsonRpc } from "../mcp-server.js";

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

test("negotiates the requested supported protocol version", () => {
  const initialize = (protocolVersion) => handleJsonRpc({
    jsonrpc: "2.0",
    id: 7,
    method: "initialize",
    params: { protocolVersion }
  });

  assert.equal(initialize("2025-03-26").result.protocolVersion, "2025-03-26");
  assert.equal(initialize("2025-11-25").result.protocolVersion, "2025-11-25");
  assert.equal(initialize("1900-01-01").result.protocolVersion, "2025-11-25");
});

test("rejects null resource and prompt parameters as invalid params", () => {
  const resource = handleJsonRpc({
    jsonrpc: "2.0",
    id: 8,
    method: "resources/read",
    params: null
  });
  const prompt = handleJsonRpc({
    jsonrpc: "2.0",
    id: 9,
    method: "prompts/get",
    params: null
  });

  assert.deepEqual(resource, {
    jsonrpc: "2.0",
    id: 8,
    error: { code: -32602, message: "Invalid resource parameters" }
  });
  assert.equal(prompt.id, 9);
  assert.equal(prompt.error.code, -32602);
});

test("returns JSON-RPC invalid params over HTTP without exposing an exception", async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const body = JSON.stringify({ jsonrpc: "2.0", id: 10, method: "resources/read", params: null });
  const { payload, status } = await new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1",
      port,
      path: "/mcp",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { responseBody += chunk; });
      response.on("end", () => resolve({
        status: response.statusCode,
        payload: JSON.parse(responseBody)
      }));
    });
    req.on("error", reject);
    req.end(body);
  });

  assert.equal(status, 200);
  assert.equal(payload.id, 10);
  assert.equal(payload.error.code, -32602);
  assert.doesNotMatch(payload.error.message, /Cannot read properties/);
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
  assert.match(text, /Use a unique password/);
  assert.match(text, /10 billion offline guesses per second/);
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
