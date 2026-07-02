# StrongPassword

StrongPassword is a private, client-side strong password generator.

## What it does

- Generates passwords entirely in the browser.
- Uses the Web Crypto API through `crypto.getRandomValues()`, not `Math.random()`.
- Supports presets for everyday accounts, finance, infrastructure, and recovery-code style secrets.
- Shows entropy, strength, and brute-force estimates locally.
- Avoids analytics, tracking, backend password handling, and server-side password generation.

## Recommended settings

- Everyday accounts: at least 16 random characters.
- Banking and finance: around 22 random characters.
- Servers and admin panels: around 28 random characters.
- Recovery-code style secrets: around 32 random characters.

## Privacy model

Passwords are created on the user's device. StrongPassword does not receive, store, log, analyze, or transmit generated passwords.

The optional MCP endpoint is read-only. It publishes public site metadata, safe-password FAQ content, and prompts only. It does not generate, receive, store, log, or transmit passwords.

## Useful URLs

- Site: https://strongpassword.site/
- Privacy: https://strongpassword.site/privacy.html
- Security: https://strongpassword.site/security/
- MCP endpoint: https://strongpassword.site/mcp
- MCP Server Card: https://strongpassword.site/.well-known/mcp/server-card.json
- API catalog: https://strongpassword.site/.well-known/api-catalog
- Agent Skills index: https://strongpassword.site/.well-known/agent-skills/index.json
