import {
  PRESETS,
  crackEstimate,
  estimateEntropy,
  generatePassword,
  normalizeOptions,
  strengthLabel
} from "./src/password-core.js";

const state = {
  lang: initialLanguage(),
  preset: "everyday",
  password: "",
  copied: false,
  visible: true,
  timer: null,
  countdown: 45,
  options: normalizeOptions({ preset: "everyday" })
};

const dictionary = {
  ru: {
    product: "StrongPassword",
    title: "Генератор сложных паролей",
    subtitle: "Создаёт пароли локально в браузере. Без сервера, логов и аналитики.",
    preset: "Профиль",
    everyday: "Обычный аккаунт",
    finance: "Банк и финансы",
    server: "Серверы и админки",
    recovery: "Резервный код",
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
    preset: "Profile",
    everyday: "Everyday account",
    finance: "Banking and finance",
    server: "Servers and admin panels",
    recovery: "Recovery code",
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
  length: document.querySelector("[data-length]"),
  lengthValue: document.querySelector("[data-length-value]"),
  preset: document.querySelector("[data-preset]"),
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
elements.preset.addEventListener("change", applyPreset);
elements.lang.addEventListener("change", setLanguage);

for (const option of elements.options) {
  option.addEventListener("change", updateOption);
}

render();
createPassword();

function createPassword() {
  try {
    state.password = generatePassword(state.options);
    state.visible = true;
    state.countdown = 45;
    restartTimer();
    render();
  } catch (error) {
    state.password = error.message;
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
  createPassword();
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
  const entropy = estimateEntropy(state.password, state.options);
  const label = strengthLabel(entropy);
  const crack = crackEstimate(entropy);

  document.documentElement.lang = state.lang;
  elements.app.dataset.strength = label;
  elements.lang.value = state.lang;
  elements.preset.value = state.preset;
  elements.length.value = String(state.options.length);
  elements.lengthValue.textContent = String(state.options.length);
  elements.password.value = state.password || "";
  elements.password.type = state.visible ? "text" : "password";
  elements.password.placeholder = t.empty;
  elements.password.dataset.size = passwordSize(state.password);
  elements.entropy.textContent = state.password ? String(entropy) : "0";
  elements.strength.textContent = state.password ? t.strengths[label] : "-";
  elements.crack.textContent = state.password ? t.cracks[crack] : "-";
  elements.countdown.textContent = state.visible && state.password ? t.visible + " " + state.countdown + " " + t.seconds : "";
  elements.copy.textContent = state.copied ? t.copied : t.copy;
  elements.visibility.textContent = state.visible ? t.hide : t.show;

  for (const option of elements.options) {
    option.checked = Boolean(state.options[option.dataset.option]);
  }

  for (const element of elements.text) {
    element.textContent = t[element.dataset.i18n] || element.textContent;
  }

  for (const option of elements.preset.options) {
    option.textContent = t[option.value] || option.textContent;
  }
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
