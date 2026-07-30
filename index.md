# StrongPassword

StrongPassword is a private, client-side strong password generator.

## What it does

- Generates passwords entirely in the browser.
- Uses the Web Crypto API through `crypto.getRandomValues()`, not `Math.random()`.
- Supports eight purpose levels for one-time, social, AI, government, banking,
  primary-email/password-manager, infrastructure, and recovery scenarios.
- Shows a live eight-segment meter. Random defaults progress from 10 to 22
  characters and alternate symbol compatibility, so every purpose change is
  visible.
- Offers an optional goal-password mode that counts the readable phrase
  character by character and adds grouped random digits and symbols only when
  the selected profile needs them.
- Shows entropy, strength, and brute-force estimates locally.
- Avoids analytics, tracking, backend password handling, and server-side password generation.

## Purpose targets

- The eight goal-password minimums rise through about 2, 4, 7, 15, 29, 58, 83,
  and 117 years. Every purpose therefore has its own step.
- Recovery codes use the longest random default: 22 characters.
- Estimates assume 10 billion offline guesses per second and average discovery
  halfway through the search space.

## Privacy model

Passwords are created on the user's device. StrongPassword does not receive, store, log, analyze, or transmit generated passwords.

Goal text is also processed only on the user's device. Its displayed bit count
is a conditional character-by-character full-search estimate. It explicitly
excludes dictionary and goal-aware guessing and is not measured entropy of
human language. When letters miss the purpose target, the browser recommends
adding words and appends random digits followed by random symbols. The purpose
meter explicitly says whether a suffix was added or the phrase already
exceeded the selected minimum.

The optional MCP endpoint is read-only. It publishes public site metadata, safe-password FAQ content, and prompts only. It does not generate, receive, store, log, or transmit passwords.

## Useful URLs

- Site: https://strongpassword.site/
- Privacy: https://strongpassword.site/privacy.html
- Security: https://strongpassword.site/security/
- MCP endpoint: https://strongpassword.site/mcp
- MCP Server Card: https://strongpassword.site/.well-known/mcp/server-card.json
- API catalog: https://strongpassword.site/.well-known/api-catalog
- Agent Skills index: https://strongpassword.site/.well-known/agent-skills/index.json
