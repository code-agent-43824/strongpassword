import http from "node:http";
import { fileURLToPath } from "node:url";

const PROTOCOL_VERSION = "2025-11-25";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([PROTOCOL_VERSION, "2025-03-26"]);
const PORT = Number(process.env.PORT || process.env.MCP_PORT || 3003);
const HOST = process.env.HOST || "127.0.0.1";

const allowedOrigins = new Set([
  "https://strongpassword.site",
  "https://www.strongpassword.site",
  "http://localhost:3002",
  "http://127.0.0.1:3002"
]);

const resources = [
  {
    uri: "site://strongpassword/about",
    name: "about",
    title: "About StrongPassword",
    description: "What the StrongPassword website does and how it is positioned.",
    mimeType: "text/markdown",
    text: `# StrongPassword

StrongPassword is a free web password generator focused on privacy and practical security.

The public website is https://strongpassword.site/.

The generator runs in the user's browser. It is designed for users who need random passwords for ordinary accounts, finance, infrastructure, and recovery-code scenarios.
`
  },
  {
    uri: "site://strongpassword/privacy",
    name: "privacy",
    title: "Privacy posture",
    description: "Privacy and data-handling guarantees for generated passwords.",
    mimeType: "text/markdown",
    text: `# Privacy posture

StrongPassword generates passwords locally in the browser.

Generated passwords are not sent to a StrongPassword backend, not logged by this MCP endpoint, and not exposed through MCP resources or tools. This MCP server is intentionally read-only and publishes only public site information.
`
  },
  {
    uri: "site://strongpassword/security",
    name: "security",
    title: "Security model",
    description: "High-level implementation notes for the generator.",
    mimeType: "text/markdown",
    text: `# Security model

The browser generator uses Web Crypto API random values, not Math.random().

The UI lets the user choose password length, character groups, and whether to avoid ambiguous characters. Password quality estimates are informational and do not replace a password manager, unique passwords per service, or multi-factor authentication.
`
  },
  {
    uri: "site://strongpassword/mcp",
    name: "mcp",
    title: "MCP read-only contract",
    description: "What this MCP endpoint exposes and what it deliberately refuses to do.",
    mimeType: "text/markdown",
    text: `# MCP read-only contract

This MCP endpoint is provided for agent compatibility and public documentation discovery.

It exposes public resources and prompts only. It does not generate passwords, store passwords, inspect user input, call external services, or provide write-capable tools.
`
  }
];

const prompts = [
  {
    name: "explain-safe-password-choice",
    title: "Explain Safe Password Choice",
    description: "Explain how to choose a safe password without asking the MCP server to generate one.",
    arguments: []
  },
  {
    name: "summarize-strongpassword-site",
    title: "Summarize StrongPassword",
    description: "Summarize the public site, privacy posture, and read-only MCP contract.",
    arguments: []
  }
];

export function handleJsonRpc(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return jsonRpcError(message?.id ?? null, -32600, "Invalid Request");
  }

  if (!Object.hasOwn(message, "id")) {
    return null;
  }

  switch (message.method) {
    case "initialize":
      return jsonRpcResult(message.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          resources: {},
          prompts: {},
          tools: {}
        },
        serverInfo: {
          name: "strongpassword-readonly",
          version: "1.0.0"
        },
        instructions:
          "Read-only MCP endpoint for public StrongPassword site information. It does not generate, store, log, or transmit passwords."
      });

    case "ping":
      return jsonRpcResult(message.id, {});

    case "resources/list":
      return jsonRpcResult(message.id, {
        resources: resources.map(({ text, ...resource }) => resource)
      });

    case "resources/read":
      return readResource(message.id, message.params);

    case "resources/templates/list":
      return jsonRpcResult(message.id, { resourceTemplates: [] });

    case "prompts/list":
      return jsonRpcResult(message.id, { prompts });

    case "prompts/get":
      return getPrompt(message.id, message.params);

    case "tools/list":
      return jsonRpcResult(message.id, { tools: [] });

    case "tools/call":
      return jsonRpcError(message.id, -32601, "This MCP server is read-only and exposes no tools.");

    default:
      return jsonRpcError(message.id, -32601, "Method not found");
  }
}

export function createServer() {
  return http.createServer(async (request, response) => {
    if (request.url === "/health") {
      sendJson(response, 200, { ok: true, name: "strongpassword-readonly" });
      return;
    }

    if (request.url !== "/mcp") {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    if (!isSupportedProtocolVersion(request.headers["mcp-protocol-version"])) {
      sendJson(response, 400, jsonRpcError(null, -32600, "Unsupported MCP protocol version"));
      return;
    }

    if (!isAllowedOrigin(request.headers.origin)) {
      sendJson(response, 403, { error: "Origin is not allowed" });
      return;
    }

    if (request.method === "GET" || request.method === "DELETE") {
      sendJson(response, 405, { error: "SSE sessions are not supported by this read-only endpoint" });
      return;
    }

    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const body = await readBody(request);
      const parsed = JSON.parse(body);

      if (Array.isArray(parsed)) {
        sendJson(response, 400, jsonRpcError(null, -32600, "JSON-RPC batches are not supported"));
        return;
      }

      const result = handleJsonRpc(parsed);
      if (result === null) {
        response.writeHead(202).end();
        return;
      }

      sendJson(response, 200, result);
    } catch (error) {
      const code = error.message === "Request body too large" ? 413 : 400;
      sendJson(response, code, jsonRpcError(null, -32700, error.message || "Parse error"));
    }
  });
}

function readResource(id, params = {}) {
  const resource = resources.find((item) => item.uri === params.uri);
  if (!resource) {
    return jsonRpcError(id, -32602, "Unknown resource URI");
  }

  return jsonRpcResult(id, {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.text
      }
    ]
  });
}

function getPrompt(id, params = {}) {
  const prompt = prompts.find((item) => item.name === params.name);
  if (!prompt) {
    return jsonRpcError(id, -32602, "Unknown prompt name");
  }

  const text = prompt.name === "explain-safe-password-choice"
    ? "Explain how to choose unique, high-entropy passwords while preserving the StrongPassword privacy model. Do not ask the MCP server to generate or receive a password."
    : "Summarize StrongPassword's public purpose, local-only password generation, and read-only MCP endpoint.";

  return jsonRpcResult(id, {
    description: prompt.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text
        }
      }
    ]
  });
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  };
}

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.has(origin);
}

function isSupportedProtocolVersion(version) {
  return !version || SUPPORTED_PROTOCOL_VERSIONS.has(version);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 65536) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(PORT, HOST, () => {
    console.error(`StrongPassword read-only MCP listening on http://${HOST}:${PORT}/mcp`);
  });
}
