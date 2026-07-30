import {
  PRESETS,
  buildGoalPassword,
  estimateCrackYears,
  estimateEntropy,
  generatePassword,
  normalizeOptions,
  strengthLabel
} from "./src/password-core.js";

const state = {
  lang: initialLanguage(),
  mode: "random",
  preset: "social",
  goal: "",
  goalResult: null,
  password: "",
  error: "",
  copied: false,
  visible: true,
  timer: null,
  countdown: 45,
  options: normalizeOptions({ preset: "social" })
};

const dictionary = {
  ru: {
    product: "StrongPassword",
    title: "Генератор сложных паролей",
    subtitle: "Создаёт пароли локально в браузере. Без сервера, логов и аналитики.",
    preset: "Назначение",
    mode: "Режим",
    randomMode: "Случайный пароль",
    goalMode: "Пароль-цель",
    goalLabel: "Что вы хотите помнить или изменить?",
    goalPlaceholder: "Например: звонить маме каждую неделю",
    goalHint: "Оценка считается побуквенно и не учитывает словарный или целевой подбор. Текст остаётся только в браузере.",
    goalRequired: "Сначала введите цель.",
    goalUnsupported: "Используйте буквы русского или латинского алфавита и цифры.",
    disposable: "Одноразовый сервис",
    social: "Соцсети",
    government: "Госуслуги",
    finance: "Банк и финансы",
    ai: "AI-сервисы",
    primary: "Основная почта / менеджер",
    server: "Серверы и админки",
    recovery: "Резервный код",
    level: "Уровень",
    characters: "знаков",
    withSymbols: "со спецсимволами",
    withoutSymbols: "без спецсимволов",
    profileMinimum: "минимум для цели",
    profileActual: "сейчас",
    profileGoalPending: "Введите цель — назначение определит, нужен ли хвост.",
    profileGoalEnough: "Фраза уже перекрывает минимум, поэтому пароль не меняется.",
    profileGoalSuffix: "Фраза ниже минимума — назначение добавило хвост.",
    targetYears: "Ориентир полного перебора",
    years: "лет",
    year: "год",
    yearsFew: "года",
    months: "месяцев",
    goalEnough: "Букв достаточно; дополнительный хвост не нужен.",
    goalMore: "Для выбранного уровня лучше добавить ещё",
    letters: "букв. Пока добавлен хвост:",
    digitsCount: "цифр",
    symbolsCount: "символов",
    length: "Длина",
    lower: "a-z",
    upper: "A-Z",
    digits: "2-9",
    symbols: "Символы",
    avoidAmbiguous: "Без похожих символов",
    generate: "Сгенерировать",
    copy: "Копировать",
    copied: "Скопировано",
    show: "Показать",
    hide: "Скрыть",
    entropy: "Энтропия",
    strength: "Стойкость",
    crack: "Оценка перебора",
    local: "Всё происходит на этом устройстве",
    privacy: "Приватность",
    security: "Безопасность",
    source: "GitHub",
    empty: "Нажмите «Сгенерировать»",
    visible: "Скроется через",
    seconds: "с",
    strengths: {
      weak: "слабый",
      fair: "средний",
      good: "хороший",
      strong: "сильный",
      excellent: "очень сильный"
    },
    cracks: {
      short: "слишком быстро",
      months: "месяцы",
      years: "годы",
      decades: "десятилетия",
      centuries: "столетия"
    }
  },
  en: {
    product: "StrongPassword",
    title: "Strong password generator",
    subtitle: "Creates passwords locally in your browser. No backend, logs or analytics.",
    preset: "Purpose",
    mode: "Mode",
    randomMode: "Random password",
    goalMode: "Goal password",
    goalLabel: "What do you want to remember or change?",
    goalPlaceholder: "For example: call my mother every week",
    goalHint: "The estimate counts characters and excludes dictionary or goal-aware guessing. The text stays only in your browser.",
    goalRequired: "Enter a goal first.",
    goalUnsupported: "Use Latin or Cyrillic letters and numbers.",
    disposable: "One-time service",
    social: "Social networks",
    government: "Government services",
    finance: "Banking and finance",
    ai: "AI services",
    primary: "Primary email / manager",
    server: "Servers and admin panels",
    recovery: "Recovery code",
    level: "Level",
    characters: "characters",
    withSymbols: "with symbols",
    withoutSymbols: "without symbols",
    profileMinimum: "goal minimum",
    profileActual: "current",
    profileGoalPending: "Enter a goal; the purpose will decide whether a suffix is needed.",
    profileGoalEnough: "The phrase already exceeds the minimum, so the password stays unchanged.",
    profileGoalSuffix: "The phrase is below the minimum, so the purpose added a suffix.",
    targetYears: "Full-search target",
    years: "years",
    year: "year",
    yearsFew: "years",
    months: "months",
    goalEnough: "There are enough letters; no extra suffix is needed.",
    goalMore: "For this profile, add about",
    letters: "letters. A suffix was added for now:",
    digitsCount: "digits",
    symbolsCount: "symbols",
    length: "Length",
    lower: "a-z",
    upper: "A-Z",
    digits: "2-9",
    symbols: "Symbols",
    avoidAmbiguous: "Avoid look-alikes",
    generate: "Generate",
    copy: "Copy",
    copied: "Copied",
    show: "Show",
    hide: "Hide",
    entropy: "Entropy",
    strength: "Strength",
    crack: "Crack estimate",
    local: "Everything happens on this device",
    privacy: "Privacy",
    security: "Security",
    source: "GitHub",
    empty: "Press Generate",
    visible: "Hidden in",
    seconds: "s",
    strengths: {
      weak: "weak",
      fair: "fair",
      good: "good",
      strong: "strong",
      excellent: "excellent"
    },
    cracks: {
      short: "too fast",
      months: "months",
      years: "years",
      decades: "decades",
      centuries: "centuries"
    }
  }
};

const elements = {
  app: document.querySelector("[data-app]"),
  password: document.querySelector("[data-password]"),
  entropy: document.querySelector("[data-entropy]"),
  strength: document.querySelector("[data-strength]"),
  crack: document.querySelector("[data-crack]"),
  countdown: document.querySelector("[data-countdown]"),
  error: document.querySelector("[data-error]"),
  modes: document.querySelectorAll("[data-mode]"),
  goalField: document.querySelector("[data-goal-field]"),
  goal: document.querySelector("[data-goal]"),
  goalFeedback: document.querySelector("[data-goal-feedback]"),
  profileCard: document.querySelector("[data-profile-card]"),
  profileHint: document.querySelector("[data-profile-hint]"),
  purposeMeta: document.querySelectorAll("[data-purpose-meta]"),
  randomSettings: document.querySelectorAll("[data-random-setting]"),
  length: document.querySelector("[data-length]"),
  lengthValue: document.querySelector("[data-length-value]"),
  presets: document.querySelectorAll("[data-preset]"),
  options: document.querySelectorAll("[data-option]"),
  copy: document.querySelector("[data-copy]"),
  visibility: document.querySelector("[data-visibility]"),
  generate: document.querySelector("[data-generate]"),
  lang: document.querySelector("[data-lang]"),
  text: document.querySelectorAll("[data-i18n]")
};

elements.generate.addEventListener("click", createPassword);
elements.copy.addEventListener("click", copyPassword);
elements.visibility.addEventListener("click", toggleVisibility);
elements.length.addEventListener("input", updateLength);
elements.goal.addEventListener("input", updateGoal);
elements.goal.addEventListener("keydown", generateGoalOnEnter);
elements.lang.addEventListener("change", setLanguage);

for (const option of elements.options) {
  option.addEventListener("change", updateOption);
}

for (const mode of elements.modes) {
  mode.addEventListener("change", setMode);
}

for (const preset of elements.presets) {
  preset.addEventListener("change", applyPreset);
}

render();
createPassword();
registerWebMcpTools();

function createPassword() {
  try {
    if (state.mode === "goal") {
      state.goalResult = buildGoalPassword(state.goal, {
        targetBits: PRESETS[state.preset].targetBits
      });
      state.password = state.goalResult.password;
    } else {
      state.goalResult = null;
      state.password = generatePassword(state.options);
    }
    state.error = "";
    state.visible = true;
    state.countdown = 45;
    restartTimer();
    render();
  } catch (error) {
    state.password = "";
    state.error = error.code || "goal_required";
    clearInterval(state.timer);
    render();
  }
}

async function copyPassword() {
  if (!state.password) return;
  await navigator.clipboard.writeText(state.password);
  state.copied = true;
  render();
  setTimeout(() => {
    state.copied = false;
    render();
  }, 1200);
}

function toggleVisibility() {
  state.visible = !state.visible;
  if (state.visible) {
    state.countdown = 45;
    restartTimer();
  } else {
    clearInterval(state.timer);
    state.countdown = 0;
  }
  render();
}

function updateLength(event) {
  state.options = normalizeOptions({ ...state.options, length: Number(event.target.value) });
  render();
  createPassword();
}

function updateOption(event) {
  const key = event.target.dataset.option;
  state.options = normalizeOptions({ ...state.options, [key]: event.target.checked });
  render();
  createPassword();
}

function applyPreset(event) {
  state.preset = event.target.value;
  state.options = normalizeOptions({ preset: state.preset, ...PRESETS[state.preset] });
  render();
  if (state.mode === "random" || state.goal.trim()) {
    createPassword();
  }
}

function setMode(event) {
  state.mode = event.target.value === "goal" ? "goal" : "random";
  state.error = "";
  render();
  if (state.mode === "random" || state.goal.trim()) {
    createPassword();
  } else {
    state.password = "";
    clearInterval(state.timer);
    render();
  }
}

function updateGoal(event) {
  state.goal = event.target.value.slice(0, 80);
  state.goalResult = null;
  state.error = "";
  render();
}

function generateGoalOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    createPassword();
  }
}

function setLanguage(event) {
  const target = event.target.value === "en" ? "/en/" : "/ru/";
  if (window.location.pathname !== target) {
    window.location.assign(target);
    return;
  }
  state.lang = event.target.value;
  render();
}

function restartTimer() {
  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.countdown -= 1;
    if (state.countdown <= 0) {
      state.visible = false;
      clearInterval(state.timer);
    }
    render();
  }, 1000);
}

function render() {
  const t = dictionary[state.lang] || dictionary.ru;
  const entropy = state.mode === "goal"
    ? state.goalResult?.totalEntropy || 0
    : estimateEntropy(state.password, state.options);
  const label = strengthLabel(entropy);
  const crackYears = estimateCrackYears(entropy);

  document.documentElement.lang = state.lang;
  elements.app.dataset.strength = label;
  elements.lang.value = state.lang;
  for (const mode of elements.modes) {
    mode.checked = mode.value === state.mode;
  }
  for (const preset of elements.presets) {
    preset.checked = preset.value === state.preset;
  }
  elements.goal.value = state.goal;
  elements.goal.placeholder = t.goalPlaceholder;
  elements.goalField.hidden = state.mode !== "goal";
  for (const setting of elements.randomSettings) {
    setting.hidden = state.mode === "goal";
  }
  elements.length.value = String(state.options.length);
  elements.lengthValue.textContent = String(state.options.length);
  elements.password.value = state.password || "";
  elements.password.type = state.visible ? "text" : "password";
  elements.password.placeholder = t.empty;
  elements.password.dataset.size = passwordSize(state.password);
  elements.entropy.textContent = state.password ? String(entropy) : "0";
  elements.strength.textContent = state.password ? t.strengths[label] : "-";
  elements.crack.textContent = state.password ? formatCrackTime(crackYears, t) : "-";
  elements.countdown.textContent = state.visible && state.password ? t.visible + " " + state.countdown + " " + t.seconds : "";
  elements.error.textContent = state.error === "goal_unsupported"
    ? t.goalUnsupported
    : state.error
      ? t.goalRequired
      : "";
  elements.goalFeedback.textContent = goalFeedback(t);
  elements.goalFeedback.dataset.warning = String(
    Boolean(state.goalResult?.additionalLetters)
  );
  renderPurposeChoices(t);
  renderProfile(t, entropy);
  elements.copy.textContent = state.copied ? t.copied : t.copy;
  elements.visibility.textContent = state.visible ? t.hide : t.show;

  for (const option of elements.options) {
    option.checked = Boolean(state.options[option.dataset.option]);
  }

  for (const element of elements.text) {
    element.textContent = t[element.dataset.i18n] || element.textContent;
  }

}

function renderPurposeChoices(t) {
  for (const meta of elements.purposeMeta) {
    const profile = PRESETS[meta.dataset.purposeMeta];
    if (state.mode === "goal") {
      meta.textContent =
        `${formatCrackTime(estimateCrackYears(profile.targetBits), t)} · ${t.profileMinimum}`;
      continue;
    }
    const symbolPolicy = profile.symbols ? t.withSymbols : t.withoutSymbols;
    meta.textContent = `${profile.length} ${t.characters} · ${symbolPolicy}`;
  }
}

function renderProfile(t, entropy) {
  const profile = PRESETS[state.preset];
  const symbolPolicy = profile.symbols ? t.withSymbols : t.withoutSymbols;
  const target = formatCrackTime(estimateCrackYears(profile.targetBits), t);

  elements.profileCard.dataset.level = String(profile.level);

  if (state.mode === "goal") {
    const goalState = !state.goalResult
      ? t.profileGoalPending
      : state.goalResult.additionalLetters
        ? t.profileGoalSuffix
        : t.profileGoalEnough;
    elements.profileHint.textContent =
      `${t.level} ${profile.level}/8 · ${t.profileMinimum}: ${target}. ${goalState}`;
    return;
  }

  const actual = state.password
    ? formatCrackTime(estimateCrackYears(entropy), t)
    : "-";
  elements.profileHint.textContent =
    `${t.level} ${profile.level}/8 · ${profile.length} ${t.characters} · ` +
    `${symbolPolicy} · ${t.profileActual}: ${actual}`;
}

function goalFeedback(t) {
  if (state.mode !== "goal" || !state.goalResult) return "";
  if (state.goalResult.additionalLetters === 0) return t.goalEnough;
  return `${t.goalMore} ${state.goalResult.additionalLetters} ${t.letters} ` +
    `${state.goalResult.digitCount} ${t.digitsCount} + ` +
    `${state.goalResult.symbolCount} ${t.symbolsCount}.`;
}

function formatCrackTime(years, t) {
  if (years >= 100) return `100+ ${t.years}`;
  if (years >= 1) {
    const rounded = Math.max(1, Math.round(years));
    return `≈ ${rounded} ${yearUnit(rounded, t)}`;
  }
  const months = Math.max(1, Math.round(years * 12));
  return `≈ ${months} ${t.months}`;
}

function yearUnit(years, t) {
  if (state.lang !== "ru") return years === 1 ? t.year : t.years;
  const lastTwo = years % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return t.years;
  const last = years % 10;
  if (last === 1) return t.year;
  if (last >= 2 && last <= 4) return t.yearsFew;
  return t.years;
}

function passwordSize(password) {
  if (password.length > 48) return "xs";
  if (password.length > 36) return "sm";
  if (password.length > 24) return "md";
  return "lg";
}

function initialLanguage() {
  const lang = document.documentElement.lang;
  if (lang === "en" || window.location.pathname.startsWith("/en/")) return "en";
  return "ru";
}

function registerWebMcpTools() {
  const modelContext = navigator.modelContext;
  if (!modelContext?.registerTool) return;

  const controller = new AbortController();
  const tools = [
    {
      name: "strongpassword.get_safe_password_faq",
      description: "Return safe-password guidance without generating or receiving a password.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {}
      },
      execute: async () => ({
        guidance: [
          "Use a unique random password for every important service.",
          "Choose a purpose profile appropriate to the account value and expected lifetime.",
          "Do not reuse passwords across services.",
          "Store passwords in a reputable password manager.",
          "Enable multi-factor authentication on important accounts.",
          "Do not paste real passwords, seed phrases, recovery codes, or private password ideas into AI chats, MCP tools, logs, or support forms.",
          "StrongPassword generates passwords locally in the browser so the secret does not leave the device."
        ]
      })
    },
    {
      name: "strongpassword.recommend_settings",
      description: "Recommend StrongPassword generator settings for a use case without returning a password.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          useCase: {
            type: "string",
            enum: [
              "disposable",
              "social",
              "government",
              "finance",
              "ai",
              "primary",
              "server",
              "recovery"
            ]
          }
        }
      },
      execute: async ({ useCase = "social" } = {}) => {
        const preset = PRESETS[useCase] ? useCase : "social";
        return {
          preset,
          settings: {
            ...normalizeOptions({ preset, ...PRESETS[preset] }),
            targetYears: PRESETS[preset].targetYears,
            targetBits: PRESETS[preset].targetBits,
            level: PRESETS[preset].level
          },
          privacy: "This tool returns settings only. It does not generate, inspect, store, or transmit a password."
        };
      }
    }
  ];

  for (const tool of tools) {
    try {
      modelContext.registerTool(tool, { signal: controller.signal });
    } catch {
      return;
    }
  }

  window.addEventListener("pagehide", () => controller.abort(), { once: true });
}
