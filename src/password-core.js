const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}:,.?";
const AMBIGUOUS = "il1IoO0|\\/\x60'\";~<>";
const GOAL_STEM_MAX_LENGTH = 32;
const GOAL_INPUT_MAX_LENGTH = 80;

const CYRILLIC_TO_LATIN = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya"
};

export const PRESETS = {
  everyday: { length: 16, lower: true, upper: true, digits: true, symbols: true },
  finance: { length: 22, lower: true, upper: true, digits: true, symbols: true },
  server: { length: 28, lower: true, upper: true, digits: true, symbols: true },
  recovery: { length: 32, lower: true, upper: true, digits: true, symbols: false }
};

export const GOAL_ANCHOR_OPTIONS = Object.freeze({
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: true
});

export function normalizeOptions(options = {}) {
  const preset = PRESETS[options.preset] || PRESETS.everyday;
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

export function generateGoalPassword(goal, random = secureRandomInt) {
  const stem = goalStem(goal);
  const anchor = generatePassword(GOAL_ANCHOR_OPTIONS, random);
  return `${stem}-${anchor}`;
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

export function estimateGoalEntropy() {
  const poolSize = characterGroups(GOAL_ANCHOR_OPTIONS).join("").length;
  return Math.round(GOAL_ANCHOR_OPTIONS.length * Math.log2(poolSize));
}

export function estimateEntropy(password, options = {}) {
  if (!password) return 0;
  const poolSize = characterGroups(normalizeOptions(options)).join("").length;
  return Math.round(password.length * Math.log2(poolSize));
}

export function strengthLabel(entropy) {
  if (entropy >= 128) return "excellent";
  if (entropy >= 96) return "strong";
  if (entropy >= 72) return "good";
  if (entropy >= 56) return "fair";
  return "weak";
}

export function crackEstimate(entropy) {
  if (entropy >= 128) return "centuries";
  if (entropy >= 96) return "decades";
  if (entropy >= 72) return "years";
  if (entropy >= 56) return "months";
  return "short";
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

function goalError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}
