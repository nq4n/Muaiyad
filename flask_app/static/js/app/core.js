(() => {
  const U = {
    deepClone: (value) => JSON.parse(JSON.stringify(value)),
    esc: (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])),
    isObject: (value) => value && typeof value === "object" && !Array.isArray(value),
    readNested: (obj, key) => key.split(".").reduce((acc, part) => (U.isObject(acc) && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : null), obj),
    titleFromId: (id) => String(id || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()),
    uniqueStrings: (list) => Array.from(new Set((Array.isArray(list) ? list : []).map((item) => String(item || "").trim()).filter(Boolean)))
  };
  window.PORTFOLIO_UTILS = U;

  const SITE_DATA = window.PORTFOLIO_SITE_DATA || null;
  const LEGACY_DATA = window.PORTFOLIO_DATA || null;
  const PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};
  const DATA = SITE_DATA || LEGACY_DATA;
  const detectedLang = navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";

  const APP = window.PORTFOLIO_APP || {};
  APP.U = U;
  APP.SITE_DATA = SITE_DATA;
  APP.LEGACY_DATA = LEGACY_DATA;
  APP.PAGE_DATA = PAGE_DATA;
  APP.DATA = DATA;
  APP.isReady = Boolean(DATA);
  APP.pageId = document.body.dataset.page || "home";
  APP.state = {
    lang: localStorage.getItem("portfolio.lang") || detectedLang,
    theme: localStorage.getItem("portfolio.theme") || DATA?.defaultTheme || "arabesque",
    cmdIndex: -1,
    project: { search: "", sort: "featured", tag: "all", show: localStorage.getItem("portfolio.show") || "all" },
    content: DATA ? U.deepClone(DATA) : {},
    nav: { cli: localStorage.getItem("portfolio.nav.cli") === "1", idle: false }
  };
  APP.brandLogoSrc = "/static/img/squ-logo.webp?v=20260404a";
  APP.renderHandler = () => {};
  APP.setRenderHandler = (handler) => {
    APP.renderHandler = typeof handler === "function" ? handler : () => {};
  };

  APP.getPageMap = () => APP.state.content.pageMap || DATA?.pageMap || {};
  APP.getNavStructure = () => APP.state.content.navStructure || DATA?.navStructure || [];
  APP.getRouteMap = () => APP.state.content.routeMap || DATA?.routeMap || {};
  APP.getThemes = () => APP.state.content.themes || DATA?.themes || [];
  APP.getDefaultTheme = () => APP.getThemes().includes(APP.state.content.defaultTheme) ? APP.state.content.defaultTheme : (DATA?.defaultTheme || "arabesque");
  APP.getThemePalettes = () => APP.state.content.themePalettes || DATA?.themePalettes || {};
  APP.getNavIcons = () => APP.state.content.navIcons || DATA?.navIcons || {};
  APP.getProfile = () => APP.state.content.profile || DATA?.profile || {};
  APP.getCommandList = () => [...new Set([...(APP.state.content.commandList || DATA?.commandList || []), "edit", "studio", "cli", "savecontent", "resetcontent"])];
  APP.getLangPack = (lang = APP.state.lang) => (APP.state.content.translations && APP.state.content.translations[lang]) || DATA?.translations?.[lang] || {};
  APP.tr = () => APP.getLangPack(APP.state.lang);
  APP.t = (key, fallback = "") => {
    const value = U.readNested(APP.tr(), key);
    return typeof value === "string" ? value : fallback;
  };
  APP.nextLang = () => (APP.state.lang === "ar" ? "en" : "ar");
  APP.langButtonLabel = () => (APP.nextLang() === "ar" ? "AR" : "EN");
  APP.brandCardLines = (lang = APP.state.lang) => lang === "ar"
    ? ["جامعة السلطان قابوس", "كلية التربية", "تقنيات التعليم والتعلم"]
    : ["Sultan Qaboos University", "College of Education", "Instructional and Learning Technology"];
  APP.loadingName = (lang = APP.state.lang) => {
    const profile = APP.getProfile();
    return lang === "ar" ? profile.name_ar || profile.name_en || "" : profile.name_en || profile.name_ar || "";
  };
  APP.loadingHint = (lang = APP.state.lang) => (lang === "ar" ? "اضغط في أي مكان للدخول" : "Click anywhere to enter");
  APP.navLabel = (id, lang = APP.state.lang) => {
    const pack = APP.getLangPack(lang);
    return (pack.nav && pack.nav[id]) || U.titleFromId(id);
  };
  APP.themeLabel = (id, lang = APP.state.lang) => {
    const active = APP.getLangPack(lang);
    const fallback = APP.getLangPack("en");
    return (active.themes && active.themes[id]) || (fallback.themes && fallback.themes[id]) || id;
  };
  APP.usesStaticRender = () => document.body.dataset.staticRender === "true";
  APP.hrefFor = (id) => `/${id === "home" ? "" : id}`;
  APP.navIcon = (id) => APP.getNavIcons()[id] || (id.startsWith("unit-") ? "&#8250;" : id.startsWith("other-") ? "&#8250;" : "&#8226;");
  APP.getPageDataset = (pid = APP.pageId, lang = APP.state.lang) => {
    const pageSet = PAGE_DATA[pid];
    if (!pageSet) return null;
    return pageSet[lang] || pageSet[lang === "ar" ? "en" : "ar"] || null;
  };

  let appliedThemeVars = [];

  APP.activeSet = function activeSet() {
    const set = new Set([APP.pageId]);
    if (APP.pageId === "framework-axes") set.add("reflection-papers");
    APP.getNavStructure().forEach((item) => {
      if (Array.isArray(item.children) && item.children.includes(APP.pageId)) set.add(item.id);
    });
    return set;
  };

  APP.toParagraphs = function toParagraphs(value) {
    const parts = Array.isArray(value)
      ? value
      : String(value || "")
          .split(/\n\s*\n/)
          .map((item) => item.trim())
          .filter(Boolean);
    return parts.map((part) => `<p>${U.esc(part)}</p>`).join("");
  };

  APP.normalizeStructuredPage = function normalizeStructuredPage(raw, pid = APP.pageId) {
    if (!U.isObject(raw)) return null;
    if (U.isObject(raw.hero)) {
      const sections = Object.entries(raw)
        .filter(([key]) => key !== "hero")
        .map(([key, section], index) => {
          const fallbackTitle = APP.t("ui.sectionFallback", "Section {n}").replace("{n}", String(index + 1));
          return {
            id: key,
            title: section && section.title ? section.title : fallbackTitle,
            body: Array.isArray(section && section.body) ? section.body : String((section && section.body) || "")
          };
        });
      return {
        title: raw.hero.title || U.titleFromId(pid),
        subtitle: raw.hero.subtitle || "",
        prompt: raw.hero.prompt || `$ open ${pid}`,
        sections
      };
    }
    if (U.isObject(raw.page) && U.isObject(raw.page.hero)) {
      return {
        title: raw.page.hero.title || U.titleFromId(pid),
        subtitle: Array.isArray(raw.page.hero.body) ? raw.page.hero.body[0] || "" : raw.page.hero.subtitle || "",
        prompt: raw.page.hero.prompt || `$ open ${pid}`,
        sections: []
      };
    }
    return null;
  };

  APP.applyThemePalette = function applyThemePalette(themeId) {
    const style = document.documentElement.style;
    appliedThemeVars.forEach((name) => style.removeProperty(name));
    const palettes = APP.getThemePalettes();
    appliedThemeVars = U.uniqueStrings(Object.values(palettes).flatMap((palette) => (U.isObject(palette) ? Object.keys(palette) : [])));
    const active = U.isObject(palettes[themeId]) ? palettes[themeId] : {};
    appliedThemeVars.forEach((name) => {
      if (typeof active[name] === "string") style.setProperty(name, active[name]);
    });
  };

  APP.applyTheme = function applyTheme(themeId) {
    const themes = APP.getThemes();
    APP.state.theme = themes.includes(themeId) ? themeId : APP.getDefaultTheme();
    localStorage.setItem("portfolio.theme", APP.state.theme);
    document.documentElement.dataset.theme = APP.state.theme;
    APP.applyThemePalette(APP.state.theme);
  };

  APP.setLang = function setLang(lang) {
    APP.state.lang = lang === "ar" ? "ar" : "en";
    localStorage.setItem("portfolio.lang", APP.state.lang);
    document.documentElement.lang = APP.state.lang;
    document.documentElement.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    APP.renderLoadingScreenCopy();
    APP.renderHandler();
  };

  APP.renderLoadingScreenCopy = function renderLoadingScreenCopy() {
    const nameEl = document.getElementById("loading-name");
    const hintEl = document.getElementById("loading-hint");
    const lang = APP.state.lang === "ar" ? "ar" : "en";
    const dir = lang === "ar" ? "rtl" : "ltr";

    if (nameEl) {
      nameEl.lang = lang;
      nameEl.dir = dir;
      nameEl.innerHTML = Array.from(APP.loadingName(lang))
        .map((char, index) => `<span class="loading-letter" data-index="${index}">${char === " " ? "&nbsp;" : U.esc(char)}</span>`)
        .join("");
    }

    if (hintEl) {
      hintEl.lang = lang;
      hintEl.dir = dir;
      hintEl.textContent = APP.loadingHint(lang);
    }
  };

  APP.getPageContent = function getPageContent(lang, pid) {
    const pageData = APP.normalizeStructuredPage(APP.getPageDataset(pid, lang), pid);
    if (pageData) return { ...pageData, builderHtml: "", builderCss: "" };
    const pack = APP.getLangPack(lang);
    return (pack.pages && pack.pages[pid]) || { title: U.titleFromId(pid), subtitle: "", prompt: "$ open section", sections: [], builderHtml: "", builderCss: "" };
  };

  APP.sanitizeCustomHTML = function sanitizeCustomHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("script").forEach((node) => node.remove());
    template.content.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      });
    });
    return template.innerHTML;
  };

  APP.applyHeroContent = function applyHeroContent(page) {
    const hero = document.querySelector(".hero-card");
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const hasHero = Boolean(String(page.title || "").trim() || String(page.subtitle || "").trim() || String(page.prompt || "").trim());
    if (hero) hero.hidden = !hasHero;
    if (title) title.textContent = page.title || "";
    if (subtitle) subtitle.textContent = page.subtitle || "";
    if (prompt) prompt.textContent = page.prompt || "";
  };

  APP.revealSections = function revealSections(root) {
    if (!root) return;
    requestAnimationFrame(() => {
      root.querySelectorAll(".reveal").forEach((element, index) => {
        setTimeout(() => element.classList.add("is-visible"), index * 80);
      });
    });
  };

  window.PORTFOLIO_APP = APP;
})();
