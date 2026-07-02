# StrongPassword

Private client-side generator for strong passwords.

## What it does

- Generates passwords entirely in the browser.
- Uses crypto.getRandomValues(), not Math.random().
- Guarantees that generated passwords include the selected character groups.
- Supports presets for everyday accounts, finance, infrastructure and recovery codes.
- Shows local entropy and brute-force estimates.
- Ships as a static site. No backend is required.

## Run locally

Any static file server works:

    npx http-server . -p 3002 -c-1

Then open http://localhost:3002.

The optional read-only MCP endpoint can run alongside the static site:

    npm run start:mcp

It listens on http://127.0.0.1:3003/mcp by default and exposes only public
site resources and prompts. It deliberately provides no tools and does not
generate, receive, store or log passwords.

## Verify

    npm test
    npm run check

## Privacy

Passwords are generated in the browser and are never sent to a server. The deployed site should be served with restrictive security headers and without analytics.

The MCP endpoint follows the same posture: it is for public site metadata only.
