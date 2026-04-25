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
  const defaultLang = "ar";
  const defaultTheme = DATA?.defaultTheme || "arabesque";
  const defaultPreferenceVersion = "20260421-ar-dark";

  if (localStorage.getItem("portfolio.defaults.version") !== defaultPreferenceVersion) {
    localStorage.setItem("portfolio.lang", defaultLang);
    localStorage.setItem("portfolio.theme", defaultTheme);
    localStorage.setItem("portfolio.defaults.version", defaultPreferenceVersion);
  }

  const APP = window.PORTFOLIO_APP || {};
  APP.U = U;
  APP.SITE_DATA = SITE_DATA;
  APP.LEGACY_DATA = LEGACY_DATA;
  APP.PAGE_DATA = PAGE_DATA;
  APP.DATA = DATA;
  APP.isReady = Boolean(DATA);
  APP.pageId = document.body.dataset.page || "home";
  APP.state = {
    lang: localStorage.getItem("portfolio.lang") || defaultLang,
    theme: localStorage.getItem("portfolio.theme") || defaultTheme,
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
  APP.getCliRouteMap = () => Object.fromEntries(
    Object.entries(APP.getRouteMap()).filter(([, target]) => target && target !== "framework-axes")
  );
  APP.getCliPageIds = () => Object.keys(APP.getPageMap()).filter((id) => id && id !== "framework-axes");
  APP.getThemes = () => APP.state.content.themes || DATA?.themes || [];
  APP.getDefaultTheme = () => APP.getThemes().includes(APP.state.content.defaultTheme) ? APP.state.content.defaultTheme : (DATA?.defaultTheme || "arabesque");
  APP.getThemePalettes = () => APP.state.content.themePalettes || DATA?.themePalettes || {};
  APP.getNavIcons = () => APP.state.content.navIcons || DATA?.navIcons || {};
  APP.getProfile = () => APP.state.content.profile || DATA?.profile || {};
  APP.getCommandList = () => U.uniqueStrings([
    "help",
    ...Object.keys(APP.getCliRouteMap()),
    ...APP.getCliPageIds(),
    "theme",
    "lang",
    "cli",
    "clear"
  ]);
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
          const normalized = U.isObject(section)
            ? U.deepClone(section)
            : { body: Array.isArray(section) ? section : String(section || "") };
          normalized.id = normalized.id || key;
          normalized.title = normalized.title || fallbackTitle;
          if (!Object.prototype.hasOwnProperty.call(normalized, "body")) normalized.body = "";
          if (!Array.isArray(normalized.body) && typeof normalized.body !== "string") {
            normalized.body = String(normalized.body || "");
          }
          return normalized;
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
      const name = APP.loadingName(lang);
      nameEl.innerHTML = lang === "ar"
        ? `<span class="loading-ar-combo" aria-label="${U.esc(name)}"><span class="loading-ar-build" aria-hidden="true">${Array.from(name)
            .map((char, index) => `<span class="loading-ar-letter" data-index="${index}">${U.esc(char)}</span>`)
            .join("")}</span><span class="loading-ar-connected" aria-hidden="true">${U.esc(name)}</span></span>`
        : Array.from(name)
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

  const pendingPageLoadKey = "portfolio.pending-page-load";

  APP.hasPendingPageLoad = () => sessionStorage.getItem(pendingPageLoadKey) === "1";

  APP.showPageLoadingShell = function showPageLoadingShell() {
    const shell = document.getElementById("page-loading-shell");
    if (!shell) return;
    document.body.classList.add("is-page-loading");
    shell.hidden = false;
  };

  APP.hidePageLoadingShell = function hidePageLoadingShell() {
    const shell = document.getElementById("page-loading-shell");
    document.body.classList.remove("is-page-loading");
    sessionStorage.removeItem(pendingPageLoadKey);
    if (shell) shell.hidden = true;
  };

  APP.beginPageTransition = function beginPageTransition(href) {
    if (!href) return;
    sessionStorage.setItem(pendingPageLoadKey, "1");
    APP.showPageLoadingShell();
    window.setTimeout(() => {
      window.location.href = href;
    }, 60);
  };

  APP.isExternalHref = function isExternalHref(href) {
    if (!href) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  };

  APP.embedUrlFor = function embedUrlFor(href) {
    if (!href) return "";
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return href;
    }

    if (/drive\.google\.com$/i.test(url.hostname)) {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
      if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      const docMatch = url.pathname.match(/\/document\/d\/([^/]+)/i);
      if (docMatch) return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
      const slideMatch = url.pathname.match(/\/presentation\/d\/([^/]+)/i);
      if (slideMatch) return `https://docs.google.com/presentation/d/${slideMatch[1]}/preview`;
      const sheetMatch = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/i);
      if (sheetMatch) return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
    }

    if (/docs\.google\.com$/i.test(url.hostname)) {
      const docMatch = url.pathname.match(/\/document\/d\/([^/]+)/i);
      if (docMatch) return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
      const slideMatch = url.pathname.match(/\/presentation\/d\/([^/]+)/i);
      if (slideMatch) return `https://docs.google.com/presentation/d/${slideMatch[1]}/preview`;
      const sheetMatch = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/i);
      if (sheetMatch) return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
      if (url.searchParams.get("embedded") === "true") return url.toString();
    }

    return url.toString();
  };

  APP.openExternalInModal = function openExternalInModal(href, options = {}) {
    const modal = document.getElementById("project-modal");
    const titleEl = document.getElementById("modal-title");
    const eyebrowEl = document.getElementById("modal-eyebrow");
    const statusEl = document.getElementById("modal-status");
    const frameEl = document.getElementById("modal-iframe");
    const fallbackEl = document.getElementById("modal-fallback");
    const fallbackCopyEl = document.getElementById("modal-fallback-copy");
    const fallbackLinkEl = document.getElementById("modal-fallback-link");
    if (!modal || !frameEl || !fallbackEl || !fallbackCopyEl || !fallbackLinkEl) return;

    const lang = APP.state?.lang === "en" ? "en" : "ar";
    const copy = {
      en: {
        eyebrow: "Embedded View",
        loading: "Loading external content inside the page.",
        fallback: "This source cannot be displayed inside the site because the provider blocks iframe embedding.",
        action: "Open In New Tab"
      },
      ar: {
        eyebrow: "عرض مضمّن",
        loading: "جار تحميل المحتوى الخارجي داخل الصفحة.",
        fallback: "لا يمكن عرض هذا المصدر داخل الموقع لأن الجهة المزودة تمنع تضمينه داخل إطار iframe.",
        action: "فتح في تبويب جديد"
      }
    }[lang];

    const embeddedHref = APP.embedUrlFor(href);
    const modalTitle = options.title || options.label || href;

    if (titleEl) titleEl.textContent = modalTitle;
    if (eyebrowEl) eyebrowEl.textContent = copy.eyebrow;
    if (statusEl) statusEl.textContent = copy.loading;
    if (fallbackCopyEl) fallbackCopyEl.textContent = copy.fallback;
    if (fallbackLinkEl) {
      fallbackLinkEl.href = href;
      fallbackLinkEl.textContent = copy.action;
    }

    fallbackEl.hidden = true;
    frameEl.hidden = false;
    frameEl.onload = () => {
      if (statusEl) statusEl.textContent = "";
      window.clearTimeout(APP.externalEmbedFallbackTimer);
    };
    frameEl.onerror = () => {
      if (statusEl) statusEl.textContent = "";
      fallbackEl.hidden = false;
    };
    frameEl.src = embeddedHref;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.clearTimeout(APP.externalEmbedFallbackTimer);
    APP.externalEmbedFallbackTimer = window.setTimeout(() => {
      if (!frameEl.hidden) {
        fallbackEl.hidden = false;
      }
    }, 2200);
  };

  APP.closeExternalModal = function closeExternalModal() {
    const modal = document.getElementById("project-modal");
    const frameEl = document.getElementById("modal-iframe");
    const fallbackEl = document.getElementById("modal-fallback");
    const statusEl = document.getElementById("modal-status");
    if (!modal || !frameEl) return;
    window.clearTimeout(APP.externalEmbedFallbackTimer);
    frameEl.src = "about:blank";
    frameEl.hidden = false;
    if (fallbackEl) fallbackEl.hidden = true;
    if (statusEl) statusEl.textContent = "";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  APP.bindPageTransitions = function bindPageTransitions() {
    if (APP.pageTransitionsBound) return;
    APP.pageTransitionsBound = true;

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a[href]");
      if (!link) return;
      if (link.dataset.bypassEmbed === "true") return;
      if (link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      if (APP.isExternalHref(href)) {
        event.preventDefault();
        APP.openExternalInModal(href, {
          title: link.dataset.embedTitle || link.getAttribute("aria-label") || link.textContent.trim()
        });
        return;
      }

      if (link.target && link.target !== "_self") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) return;

      event.preventDefault();
      APP.beginPageTransition(url.href);
    }, true);

    window.addEventListener("pageshow", () => {
      APP.hidePageLoadingShell();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") APP.closeExternalModal();
    });
  };

  window.PORTFOLIO_APP = APP;
})();
