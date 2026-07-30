import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PRESETS,
  buildGoalPassword,
  characterGroups,
  estimateCrackYears,
  estimateEntropy,
  estimateGoalLetterEntropy,
  generatePassword,
  goalStem,
  normalizeOptions,
  strengthLabel
} from "../src/password-core.js";

function sequenceRandom() {
  let value = 0;
  return (max) => {
    value = (value + 7) % max;
    return value;
  };
}

describe("password core", () => {
  it("normalizes length bounds", () => {
    assert.equal(normalizeOptions({ length: 3 }).length, 8);
    assert.equal(normalizeOptions({ length: 100 }).length, 64);
  });

  it("requires at least one character group", () => {
    assert.throws(() => characterGroups({
      lower: false,
      upper: false,
      digits: false,
      symbols: false
    }));
  });

  it("generates requested length and selected groups", () => {
    const password = generatePassword({
      length: 20,
      lower: true,
      upper: true,
      digits: true,
      symbols: true
    }, sequenceRandom());

    assert.equal(password.length, 20);
    assert.match(password, /[a-z]/);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[2-9]/);
    assert.match(password, /[!@#$%^&*()\-_=+\[\]{}:,.?]/);
  });

  it("estimates stronger entropy for longer passwords", () => {
    const shortEntropy = estimateEntropy("A2b!A2b!", { length: 8 });
    const longEntropy = estimateEntropy("A2b!A2b!A2b!A2b!", { length: 16 });

    assert.ok(longEntropy > shortEntropy);
    assert.equal(strengthLabel(140), "excellent");
  });

  it("builds a compatible goal stem from Russian text", () => {
    assert.equal(goalStem("  звонить маме каждую неделю  "), "ZvonitMameKazhduyuNedelyu");
  });

  it("counts goal text letter by letter under the explicit brute-force model", () => {
    assert.equal(Math.round(estimateGoalLetterEntropy("abcdefghij")), 47);
    assert.equal(Math.round(estimateGoalLetterEntropy("абвгдежзий")), 50);
  });

  it("keeps a sufficiently long goal convenient without a suffix", () => {
    const result = buildGoalPassword(
      "звонить маме каждую неделю",
      { targetBits: PRESETS.finance.targetBits },
      sequenceRandom()
    );

    assert.equal(result.password, "ZvonitMameKazhduyuNedelyu");
    assert.equal(result.suffixEntropy, 0);
    assert.equal(result.additionalLetters, 0);
  });

  it("adds grouped random digits and symbols only when letters are insufficient", () => {
    const result = buildGoalPassword(
      "спорт",
      { targetBits: PRESETS.finance.targetBits },
      sequenceRandom()
    );
    const [stem, suffix] = result.password.split("-");

    assert.equal(stem, "Sport");
    assert.match(suffix, /^[2-9]+[!@#$%&*?]+$/);
    assert.ok(result.digitCount > 0);
    assert.ok(result.symbolCount > 0);
    assert.ok(result.totalEntropy >= PRESETS.finance.targetBits);
    assert.ok(result.additionalLetters > 0);
  });

  it("maps purpose profiles to years rather than astronomical targets", () => {
    assert.ok(estimateCrackYears(PRESETS.disposable.targetBits) >= 1.5);
    assert.ok(estimateCrackYears(PRESETS.social.targetBits) >= 10);
    assert.ok(estimateCrackYears(PRESETS.finance.targetBits) >= 100);
    assert.equal(PRESETS.disposable.length, 10);
    assert.equal(PRESETS.finance.length, 11);
  });

  it("rejects empty or unsupported goal text", () => {
    assert.throws(() => goalStem("   "), { code: "goal_required" });
    assert.throws(() => goalStem("🎯✨"), { code: "goal_unsupported" });
  });
});
