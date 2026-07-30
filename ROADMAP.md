# StrongPassword roadmap

StrongPassword remains privacy-first: passwords, personal goals, and generator
inputs must stay on the user's device. No analytics, password backend, or
agent-facing secret generation is planned.

## 1. Goal-password mode

Add goal passwords as one optional generator mode, not as a replacement for
fully random passwords.

- Accept a short personal intention locally in the browser.
- Convert it to a compatible readable stem.
- Add an independent cryptographically random anchor.
- Count only the random anchor in the entropy estimate.
- Warn that the goal itself may be predictable and that every service needs a
  unique password.
- Keep MCP and WebMCP from accepting goals or returning passwords.

## 2. Purpose-based profiles

Replace broad technical presets with clear service-purpose profiles. Each
profile should explain why its defaults were selected.

- One-time or disposable service.
- Social network.
- Government service.
- Banking and finance.
- AI service.
- Primary email and password manager.
- Server or administrator access.
- Recovery code.

The purpose selects a safe default length and character policy; advanced users
can still customize compatible settings. A "one-time" account must not imply
that weak or reused passwords are safe.

## 3. Security and usability review

- Test random output invariants and goal-anchor entropy.
- Verify that goals and passwords never enter requests, logs, storage, URLs, or
  agent APIs.
- Review keyboard, screen-reader, mobile, and copy/hide behavior.
- Document the threat model and limitations in plain language.

## 4. Content and positioning

- Publish RU/EN guidance for memorable passphrases, unique passwords, MFA, and
  password managers.
- Position the goal mode as personal meaning plus independent randomness, never
  as security derived from a predictable life goal.

## 5. Maintenance

- Keep CI, backups, production smoke tests, dependencies, and security headers
  healthy.
- Maintain MCP and discovery metadata when standards change.
- Do not add OAuth, A2A, commerce, or other integrations only to improve an
  agent-readiness score.
