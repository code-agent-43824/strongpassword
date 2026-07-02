# StrongPassword Agent Readiness

Use this skill when an agent needs to understand StrongPassword's public capabilities, privacy posture, and safe-password guidance.

## What StrongPassword Does

- Generates strong random passwords locally in the user's browser.
- Uses Web Crypto API random values, not `Math.random()`.
- Provides presets for everyday accounts, finance, servers/admin panels, and recovery-code style secrets.
- Avoids analytics, tracking, backend password handling, and server-side password generation.

## Safe Guidance

- Recommend unique random passwords for every important service.
- Recommend at least 16 random characters for everyday accounts and longer values for finance, infrastructure, email, and recovery codes.
- Recommend a password manager and multi-factor authentication for important accounts.
- Warn users not to paste real passwords, recovery codes, seed phrases, or private password ideas into AI chats, MCP tools, logs, or support forms.

## Agent Interfaces

- Homepage markdown: `https://strongpassword.site/index.md`
- MCP endpoint: `https://strongpassword.site/mcp`
- MCP Server Card: `https://strongpassword.site/.well-known/mcp/server-card.json`
- API catalog: `https://strongpassword.site/.well-known/api-catalog`

## Guardrails

Do not ask the user to send a real password to an agent, chat, MCP server, or external tool. Do not claim the server generated a password. StrongPassword's core security claim is local browser generation.
