# StrongPassword roadmap

StrongPassword remains privacy-first: passwords, personal goals, and generator
inputs must stay on the user's device. No analytics, password backend, or
agent-facing secret generation is planned.

## 1. Goal-password mode — completed

Add goal passwords as one optional generator mode, not as a replacement for
fully random passwords.

- Accept a short personal intention locally in the browser.
- Convert it to a compatible readable stem.
- Estimate letters character by character under an explicit full-search model.
- State that this estimate excludes dictionary and goal-aware guessing.
- If the phrase misses the selected target, recommend adding letters and append
  a separate random group of digits followed by symbols.
- Keep MCP and WebMCP from accepting goals or returning passwords.

## 2. Purpose-based profiles — completed

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

The selector is an immediately visible eight-level card ladder:
one-time, social, AI, government, finance, primary email/manager, server/admin,
and recovery. Random-password defaults progress through 10, 12, 12, 14, 14,
16, 18, and 22 characters; symbol support alternates between neighbouring
levels so changing purpose has an obvious result without making every password
needlessly long. Recovery is intentionally the longest.

The final selector UI exposes both modes in one two-position switch and all
eight purposes in a responsive card grid. Each card shows its level and the
relevant length/symbol policy or goal threshold, so no option is hidden behind
a dropdown.

All eight goal-password minimums are distinct, progressing from 60 to 66 bits
(roughly two, four, seven, 15, 29, 58, 83, and 117 years under the stated
model). The live explanation says whether the purpose added a suffix or whether
the human phrase already exceeds the selected minimum. This keeps the selector
meaningful without damaging a convenient goal password just to make a switch
look active. Estimates assume an offline rate of 10 billion guesses per second
and average discovery halfway through the search space.
Advanced users can still customize compatible settings. A "one-time" account
must not imply that reused passwords are safe.

## 3. Security and usability review

- Test random output invariants, conditional letter estimates, suffix grouping,
  and profile targets.
- Verify that goals and passwords never enter requests, logs, storage, URLs, or
  agent APIs.
- Review keyboard, screen-reader, mobile, and copy/hide behavior.
- Document the threat model and limitations in plain language.

## 4. Content and positioning

- Publish RU/EN guidance for memorable passphrases, unique passwords, MFA, and
  password managers.
- Position the goal mode as personal meaning plus a clearly conditional
  character-search estimate, with random suffix assistance when needed.

### Ideas to explore (not committed features)

- Present a goal password as a private reminder of a personal intention that
  the user may type regularly, not merely as a string with a strength score.
  Possible themes include a habit, a savings goal, or staying in touch with
  someone. Do not collect or publish users' actual intentions.
- Explore local-only, easy-to-type variants derived from an intention, with
  clear length and uniqueness guidance and an optional random suffix when the
  selected target is not met.
- Test whether this framing helps people remember unique passwords without
  implying that personal meaning adds entropy. Warn that an attacker who knows
  or guesses the intention may defeat the displayed character-search estimate;
  recommend a password manager and MFA for important accounts.

## 5. Maintenance

- Keep CI, backups, production smoke tests, dependencies, and security headers
  healthy.
- Maintain MCP and discovery metadata when standards change.
- Do not add OAuth, A2A, commerce, or other integrations only to improve an
  agent-readiness score.
