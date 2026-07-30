const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*?_-";
const AMBIGUOUS = "il1IoO0|\\/\x60'\";~<>";
const GOAL_DIGITS = "23456789";
const GOAL_SYMBOLS = "!@#$%&*?";
const GOAL_STEM_MAX_LENGTH = 32;
const GOAL_INPUT_MAX_LENGTH = 80;
const OFFLINE_GUESSES_PER_SECOND = 10_000_000_000;
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

const CYRILLIC_TO_LATIN = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya"
};

export const PURPOSE_PROFILES = {
  disposable: profile(1.5, 10),
  social: profile(10, 11, false),
  government: profile(100, 11),
  finance: profile(100, 11),
  ai: profile(10, 11, false),
  primary: profile(100, 11),
  server: profile(100, 11),
  recovery: profile(100, 11)
};

export const PRESETS = PURPOSE_PROFILES;

export function normalizeOptions(options = {}) {
  const preset = PRESETS[options.preset] || PRESETS.social;
  const merged = { ...preset, ...options };
  const length = Number.isFinite(Number(merged.length)) ? Number(merged.length) : preset.length;

  return {
    length: Math.max(8, Math.min(64, Math.round(length))),
    lower: merged.lower !== false,
    upper: merged.upper !== false,
    digits: merged.digits !== false,
    symbols: merged.symbols !== false,
    avoidAmbiguous: merged.avoidAmbiguous !== false
  };
}

export function characterGroups(options) {
  const normalized = normalizeOptions(options);
  const groups = [];

  if (normalized.lower) groups.push(LOWER);
  if (normalized.upper) groups.push(UPPER);
  if (normalized.digits) groups.push(DIGITS);
  if (normalized.symbols) groups.push(SYMBOLS);

  const cleaned = groups
    .map((group) => normalized.avoidAmbiguous ? removeCharacters(group, AMBIGUOUS) : group)
    .filter(Boolean);

  if (cleaned.length === 0) {
    throw new Error("At least one character group must be enabled.");
  }

  if (normalized.length < cleaned.length) {
    throw new Error("Password length is too short for the selected groups.");
  }

  return cleaned;
}

export function generatePassword(options = {}, random = secureRandomInt) {
  const normalized = normalizeOptions(options);
  const groups = characterGroups(normalized);
  const pool = groups.join("");
  const password = [];

  for (const group of groups) {
    password.push(pick(group, random));
  }

  while (password.length < normalized.length) {
    password.push(pick(pool, random));
  }

  return shuffle(password, random).join("");
}

export function generateGoalPassword(goal, options = {}, random = secureRandomInt) {
  return buildGoalPassword(goal, options, random).password;
}

export function buildGoalPassword(goal, options = {}, random = secureRandomInt) {
  const targetBits = normalizeTargetBits(options.targetBits);
  const stem = goalStem(goal);
  const letterEntropy = estimateGoalLetterEntropy(goal);
  const missingBits = Math.max(0, targetBits - letterEntropy);
  let suffixLength = Math.ceil(missingBits / 3);

  if (suffixLength === 1) suffixLength = 2;

  const digitCount = suffixLength ? Math.ceil(suffixLength / 2) : 0;
  const symbolCount = suffixLength ? Math.floor(suffixLength / 2) : 0;
  const digits = randomCharacters(GOAL_DIGITS, digitCount, random);
  const symbols = randomCharacters(GOAL_SYMBOLS, symbolCount, random);
  const suffix = `${digits}${symbols}`;
  const suffixEntropy = suffixLength * 3;

  return {
    password: suffix ? `${stem}-${suffix}` : stem,
    letterEntropy: Math.round(letterEntropy),
    suffixEntropy,
    totalEntropy: Math.round(letterEntropy + suffixEntropy),
    targetBits,
    missingBits: Math.max(0, Math.ceil(targetBits - letterEntropy)),
    additionalLetters: Math.max(0, Math.ceil(missingBits / Math.log2(26))),
    digitCount,
    symbolCount
  };
}

export function goalStem(goal) {
  const normalized = String(goal ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, GOAL_INPUT_MAX_LENGTH);

  if (!normalized) {
    throw goalError("goal_required");
  }

  const transliterated = [...normalized]
    .map((character) => {
      const lower = character.toLowerCase();
      if (Object.hasOwn(CYRILLIC_TO_LATIN, lower)) {
        return CYRILLIC_TO_LATIN[lower];
      }
      return character;
    })
    .join("");

  const words = transliterated.match(/[a-z0-9]+/gi) || [];
  const stem = words
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
    .slice(0, GOAL_STEM_MAX_LENGTH);

  if (!stem) {
    throw goalError("goal_unsupported");
  }

  return stem;
}

export function estimateGoalLetterEntropy(goal) {
  const normalized = normalizeGoal(goal);
  let sourceEntropy = 0;

  for (const character of normalized) {
    if (/[a-z]/i.test(character)) {
      sourceEntropy += Math.log2(26);
    } else if (/[а-яё]/i.test(character)) {
      sourceEntropy += Math.log2(33);
    } else if (/[0-9]/.test(character)) {
      sourceEntropy += Math.log2(10);
    }
  }

  const stem = goalStem(goal);
  const outputEntropy = [...stem].reduce((total, character) => {
    if (/[a-z]/i.test(character)) return total + Math.log2(26);
    if (/[0-9]/.test(character)) return total + Math.log2(10);
    return total;
  }, 0);

  return Math.min(sourceEntropy, outputEntropy);
}

export function estimateEntropy(password, options = {}) {
  if (!password) return 0;
  const poolSize = characterGroups(normalizeOptions(options)).join("").length;
  return Math.round(password.length * Math.log2(poolSize));
}

export function strengthLabel(entropy) {
  if (estimateCrackYears(entropy) >= 100) return "excellent";
  if (estimateCrackYears(entropy) >= 25) return "strong";
  if (estimateCrackYears(entropy) >= 1.5) return "good";
  if (entropy >= 56) return "fair";
  return "weak";
}

export function crackEstimate(entropy) {
  const years = estimateCrackYears(entropy);
  if (years >= 100) return "centuries";
  if (years >= 10) return "decades";
  if (years >= 1) return "years";
  if (years >= 1 / 12) return "months";
  return "short";
}

export function estimateCrackYears(entropy) {
  if (!Number.isFinite(entropy) || entropy <= 0) return 0;
  return (2 ** (entropy - 1)) / (OFFLINE_GUESSES_PER_SECOND * SECONDS_PER_YEAR);
}

export function targetBitsForYears(years) {
  const normalizedYears = Math.max(0.01, Number(years) || 0.01);
  return Math.ceil(Math.log2(
    2 * OFFLINE_GUESSES_PER_SECOND * SECONDS_PER_YEAR * normalizedYears
  ));
}

export function secureRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error("Random max must be a positive integer.");
  }

  const cryptoRef = globalThis.crypto;
  if (!cryptoRef?.getRandomValues) {
    throw new Error("Secure browser random generator is unavailable.");
  }

  const range = 0x100000000;
  const limit = range - (range % max);
  const values = new Uint32Array(1);

  do {
    cryptoRef.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % max;
}

function pick(chars, random) {
  return chars[random(chars.length)];
}

function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = random(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function removeCharacters(input, characters) {
  const blocked = new Set([...characters]);
  return [...input].filter((char) => !blocked.has(char)).join("");
}

function normalizeGoal(goal) {
  return String(goal ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, GOAL_INPUT_MAX_LENGTH);
}

function normalizeTargetBits(targetBits) {
  const numeric = Number(targetBits);
  return Number.isFinite(numeric) ? Math.max(32, Math.min(96, Math.round(numeric))) : 64;
}

function randomCharacters(pool, length, random) {
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += pick(pool, random);
  }
  return result;
}

function profile(targetYears, length, symbols = true) {
  return Object.freeze({
    targetYears,
    targetBits: targetBitsForYears(targetYears),
    length,
    lower: true,
    upper: true,
    digits: true,
    symbols
  });
}

function goalError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}
