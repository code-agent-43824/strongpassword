import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  characterGroups,
  estimateEntropy,
  generatePassword,
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
});
