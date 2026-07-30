# StrongPassword

Private client-side generator for strong passwords.

## What it does

- Generates passwords entirely in the browser.
- Uses crypto.getRandomValues(), not Math.random().
- Guarantees that generated passwords include the selected character groups.
- Supports eight visibly distinct purpose levels from one-time services to
  recovery codes. Random defaults progress from 10 to 22 characters and
  deliberately alternate symbol compatibility.
- Includes an optional goal-password mode that estimates the readable phrase
  character by character and appends grouped random digits and symbols only
  when the selected profile needs them.
- Shows a live eight-segment meter and explains whether a goal profile added a
  suffix or the phrase already exceeded its minimum.
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

Goal text is also processed only in the browser. Its displayed bit count is an
explicit full-character-search estimate that excludes dictionary and
goal-aware guessing; it must not be read as measured entropy of human language.

The MCP endpoint follows the same posture: it is for public site metadata only.

See [ROADMAP.md](ROADMAP.md) for the ordered product plan.
