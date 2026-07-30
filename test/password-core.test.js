import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  characterGroups,
  estimateEntropy,
  estimateGoalEntropy,
  generateGoalPassword,
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

  it("adds a cryptographically random anchor to a goal password", () => {
    const password = generateGoalPassword("save for a trip", sequenceRandom());
    const [stem, ...anchorParts] = password.split("-");
    const anchor = anchorParts.join("-");

    assert.equal(stem, "SaveForATrip");
    assert.equal(anchor.length, 16);
    assert.match(anchor, /[a-z]/);
    assert.match(anchor, /[A-Z]/);
    assert.match(anchor, /[2-9]/);
    assert.match(anchor, /[!@#$%^&*()\-_=+\[\]{}:,.?]/);
    assert.ok(estimateGoalEntropy() >= 96);
  });

  it("rejects empty or unsupported goal text", () => {
    assert.throws(() => goalStem("   "), { code: "goal_required" });
    assert.throws(() => goalStem("🎯✨"), { code: "goal_unsupported" });
  });
});
