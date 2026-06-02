/* ============================================================
   Innovate-learning.no — shared site behavior
   Theme, language, scroll reveals, and tweak application.
   Tweak values live in localStorage so they carry across pages.
   ============================================================ */
(function () {
  var LS_THEME = "il-theme";
  var LS_LANG = "il-lang";
  var LS_TWEAKS = "il-tweaks";

  var TONES = {
    warm:    { hue: 75,  chroma: 0.012 },
    neutral: { hue: 110, chroma: 0.004 },
    cool:    { hue: 252, chroma: 0.012 }
  };

  var DEFAULT_TWEAKS = {
    headlineFont: "Schibsted Grotesk",
    radius: 22,
    tone: "warm",
    accent: "#2f9e6b"
  };

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  function getTweaks() {
    var raw = read(LS_TWEAKS, null);
    if (!raw) return Object.assign({}, DEFAULT_TWEAKS);
    try { return Object.assign({}, DEFAULT_TWEAKS, JSON.parse(raw)); }
    catch (e) { return Object.assign({}, DEFAULT_TWEAKS); }
  }

  function applyTweaks(t) {
    var root = document.documentElement;
    var tone = TONES[t.tone] || TONES.warm;
    root.style.setProperty("--tone-hue", tone.hue);
    root.style.setProperty("--tone-chroma", tone.chroma);
    root.style.setProperty("--radius", (t.radius || 22) + "px");
    root.style.setProperty("--brand-base", t.accent || DEFAULT_TWEAKS.accent);
    var fam = t.headlineFont || DEFAULT_TWEAKS.headlineFont;
    root.style.setProperty("--font-display", '"' + fam + '", system-ui, sans-serif');
  }

  function saveTweaks(t) {
    write(LS_TWEAKS, JSON.stringify(t));
    applyTweaks(t);
  }

  /* ---- theme ---- */
  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
    }
  }
  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    write(LS_THEME, next);
    applyTheme(next);
  }

  /* ---- language (dictionary i18n) ---- */
  var I18N = {};
  function registerI18n(dict) { I18N = dict || {}; translate(currentLang()); }
  function currentLang() { return document.documentElement.getAttribute("data-lang") || "no"; }
  function tval(key, lang) {
    var e = I18N[key];
    if (!e) return null;
    return e[lang] != null ? e[lang] : (e.no != null ? e.no : e.en);
  }
  function translate(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = tval(el.getAttribute("data-i18n"), lang);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = tval(el.getAttribute("data-i18n-html"), lang);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var v = tval(el.getAttribute("data-i18n-ph"), lang);
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var v = tval(el.getAttribute("data-i18n-aria"), lang);
      if (v != null) el.setAttribute("aria-label", v);
    });
  }
  function applyLang(lang) {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "no" ? "nb" : "en");
    var btns = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-lang-btn") === lang ? "true" : "false");
    }
    translate(lang);
    window.dispatchEvent(new CustomEvent("il:lang", { detail: lang }));
  }
  function setLang(lang) {
    write(LS_LANG, lang);
    applyLang(lang);
  }

  /* ---- expose ---- */
  window.IL = {
    getTweaks: getTweaks,
    saveTweaks: saveTweaks,
    applyTweaks: applyTweaks,
    DEFAULT_TWEAKS: DEFAULT_TWEAKS,
    setLang: setLang,
    currentLang: currentLang,
    registerI18n: registerI18n,
    toggleTheme: toggleTheme
  };

  /* ---- apply persisted state ASAP ---- */
  applyTheme(read(LS_THEME, "light"));
  applyLang(read(LS_LANG, "no"));
  applyTweaks(getTweaks());

  /* ---- wire up after DOM ready ---- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    applyTheme(read(LS_THEME, "light"));
    applyLang(read(LS_LANG, "no"));

    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", toggleTheme);
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-btn")); });
    });

    var yr = document.querySelectorAll("[data-year]");
    for (var i = 0; i < yr.length; i++) yr[i].textContent = new Date().getFullYear();

    /* reveal on scroll */
    var items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && items.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add("in"); });
    }
  });
})();
