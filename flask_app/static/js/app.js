(() => {
  const U = {
    deepClone: (v) => JSON.parse(JSON.stringify(v)),
    esc: (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    isObject: (v) => v && typeof v === "object" && !Array.isArray(v),
    readNested: (obj, key) => key.split(".").reduce((acc, part) => (U.isObject(acc) && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : null), obj),
    titleFromId: (id) => String(id || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    uniqueStrings: (list) => Array.from(new Set((Array.isArray(list) ? list : []).map((i) => String(i || "").trim()).filter(Boolean)))
  };
  window.PORTFOLIO_UTILS = U;

  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const pageId = document.body.dataset.page || "home";
  const state = {
    lang: localStorage.getItem("portfolio.lang") || (navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en"),
    theme: localStorage.getItem("portfolio.theme") || DATA.defaultTheme,
    cmdIndex: -1,
    project: { search: "", sort: "featured", tag: "all", show: localStorage.getItem("portfolio.show") || "all" },
    content: U.deepClone(DATA),
    nav: { cli: localStorage.getItem("portfolio.nav.cli") === "1", idle: false }
  };

  const getPageMap = () => state.content.pageMap || DATA.pageMap;
  const getNavStructure = () => state.content.navStructure || DATA.navStructure;
  const getRouteMap = () => state.content.routeMap || DATA.routeMap;
  const getThemes = () => state.content.themes || DATA.themes;
  const getDefaultTheme = () => getThemes().includes(state.content.defaultTheme) ? state.content.defaultTheme : DATA.defaultTheme;
  const getThemePalettes = () => state.content.themePalettes || DATA.themePalettes || {};
  const getNavIcons = () => state.content.navIcons || DATA.navIcons || {};
  const getProfile = () => state.content.profile || DATA.profile;
  const getCommandList = () => [...new Set([...(state.content.commandList || DATA.commandList || []), "edit", "studio", "cli", "savecontent", "resetcontent"])];
  const getLangPack = (lang = state.lang) => (state.content.translations && state.content.translations[lang]) || DATA.translations[lang];
  const tr = () => getLangPack(state.lang);
  const t = (key, fb = "") => { const v = U.readNested(tr(), key); return typeof v === "string" ? v : fb; };
  const nextLang = () => (state.lang === "ar" ? "en" : "ar");
  const langButtonLabel = () => (nextLang() === "ar" ? "AR" : "EN");
  const brandLogoSrc = "/static/img/squ-logo.webp?v=20260404a";
  const brandCardLines = (lang = state.lang) => lang === "ar"
    ? ["جامعة السلطان قابوس", "كلية التربية", "تقنيات التعليم والتعلم"]
    : ["Sultan Qaboos University", "College of Education", "Instructional and Learning Technology"];
  const loadingName = (lang = state.lang) => {
    const profile = getProfile();
    return lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
  };
  const loadingHint = (lang = state.lang) => (lang === "ar" ? "اضغط في أي مكان للدخول" : "Click anywhere to enter");
  const navLabel = (id, lang = state.lang) => { const p = getLangPack(lang); return (p.nav && p.nav[id]) || U.titleFromId(id); };
  const themeLabel = (id, lang = state.lang) => {
    const active = getLangPack(lang);
    const fallback = getLangPack("en");
    return (active.themes && active.themes[id]) || (fallback.themes && fallback.themes[id]) || id;
  };
  const usesStaticRender = () => document.body.dataset.staticRender === "true";
  const hrefFor = (id) => `/${id === 'home' ? '' : id}`;
  const navIcon = (id) => getNavIcons()[id] || (id.startsWith("unit-") ? "&#8250;" : id.startsWith("other-") ? "&#8250;" : "&#8226;");

  let appliedThemeVars = [];
  let navIdleTimer = null, navLastActivity = 0, navActivityBound = false;
  const NAV_IDLE_MS = 2800;

  function activeSet() {
    const set = new Set([pageId]);
    getNavStructure().forEach((item) => { if (Array.isArray(item.children) && item.children.includes(pageId)) set.add(item.id); });
    return set;
  }

  function applyThemePalette(themeId) {
    const style = document.documentElement.style;
    appliedThemeVars.forEach((n) => style.removeProperty(n));
    const palettes = getThemePalettes();
    appliedThemeVars = U.uniqueStrings(Object.values(palettes).flatMap((p) => (U.isObject(p) ? Object.keys(p) : [])));
    const active = U.isObject(palettes[themeId]) ? palettes[themeId] : {};
    appliedThemeVars.forEach((n) => { if (typeof active[n] === "string") style.setProperty(n, active[n]); });
  }

  function applyTheme(themeId) {
    const themes = getThemes();
    state.theme = themes.includes(themeId) ? themeId : getDefaultTheme();
    localStorage.setItem("portfolio.theme", state.theme);
    document.documentElement.dataset.theme = state.theme;
    applyThemePalette(state.theme);
  }

  function setLang(lang) {
    state.lang = lang === "ar" ? "ar" : "en";
    localStorage.setItem("portfolio.lang", state.lang);
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    renderLoadingScreenCopy();
    render();
  }

  function renderLoadingScreenCopy() {
    const nameEl = document.getElementById("loading-name");
    const hintEl = document.getElementById("loading-hint");
    const lang = state.lang === "ar" ? "ar" : "en";
    const dir = lang === "ar" ? "rtl" : "ltr";
    if (nameEl) {
      nameEl.lang = lang;
      nameEl.dir = dir;
      nameEl.innerHTML = Array.from(loadingName(lang)).map((char, index) => `<span class="loading-letter" data-index="${index}">${char === " " ? "&nbsp;" : U.esc(char)}</span>`).join("");
    }
    if (hintEl) {
      hintEl.lang = lang;
      hintEl.dir = dir;
      hintEl.textContent = loadingHint(lang);
    }
  }

  function getPageContent(lang, pid) {
    const pack = getLangPack(lang);
    return (pack.pages && pack.pages[pid]) || { title: U.titleFromId(pid), subtitle: "", prompt: "$ open section", sections: [], builderHtml: "", builderCss: "" };
  }

  function sanitizeCustomHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("script").forEach((node) => node.remove());
    template.content.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      });
    });
    return template.innerHTML;
  }

  function renderPageContent() {
    if (usesStaticRender()) {
      const sections = document.getElementById("page-sections");
      if (sections) {
        requestAnimationFrame(() => {
          sections.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("is-visible"), i * 80);
          });
        });
      }
      return;
    }

    const page = getPageContent(state.lang, pageId);
    const hero = document.querySelector(".hero-card");
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const hasHero = Boolean(String(page.title || "").trim() || String(page.subtitle || "").trim() || String(page.prompt || "").trim());
    const sectionList = Array.isArray(page.sections) ? page.sections : [];
    const hasBuilder = typeof page.builderHtml === "string" && page.builderHtml.trim();
    if (hero) hero.hidden = !hasHero;
    if (title) title.textContent = page.title || "";
    if (subtitle) subtitle.textContent = page.subtitle || "";
    if (prompt) prompt.textContent = page.prompt || "";
    const sections = document.getElementById("page-sections");
    if (sections) {
      sections.hidden = !hasBuilder && sectionList.length === 0;
      sections.innerHTML = hasBuilder
        ? `<style>${page.builderCss || ""}</style>${sanitizeCustomHTML(page.builderHtml)}`
        : sectionList.map((s, i) => sectionMarkup(s, i)).join("");
      requestAnimationFrame(() => {
        sections.querySelectorAll(".reveal").forEach((el, i) => {
          setTimeout(() => el.classList.add("is-visible"), i * 80);
        });
      });
    }
  }

  function sectionMarkup(section) {
    const type = section.type || "text";
    const anim = section.animation || "fade-up";
    const revealClass = anim === "none" ? "" : " reveal";
    const animAttr = anim === "none" ? "" : `data-reveal="${anim}"`;
    const header = section.title ? `<div class="section-headline"><h2>${U.esc(section.title)}</h2></div>` : "";
    let content = "";
    if (type === "text") content = `<div class="section-copy"><p>${U.esc(section.body)}</p></div>`;
    else if (type === "image") content = `<figure class="section-media">${section.imageSrc ? `<img src="${U.esc(section.imageSrc)}" alt="${U.esc(section.imageAlt || section.title)}" loading="lazy" />` : ""}${section.imageCaption ? `<figcaption class="section-caption">${U.esc(section.imageCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy"><p>${U.esc(section.body)}</p></div>` : ""}`;
    else if (type === "video") content = `<figure class="section-media">${section.videoSrc ? `<video class="section-video" controls preload="metadata" ${section.videoPoster ? `poster="${U.esc(section.videoPoster)}"` : ""}><source src="${U.esc(section.videoSrc)}" /></video>` : ""}${section.videoCaption ? `<figcaption class="section-caption">${U.esc(section.videoCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy"><p>${U.esc(section.body)}</p></div>` : ""}`;
    else if (type === "audio") content = `<figure class="section-media">${section.audioSrc ? `<audio class="section-audio" controls preload="metadata"><source src="${U.esc(section.audioSrc)}" /></audio>` : ""}${section.audioCaption ? `<figcaption class="section-caption">${U.esc(section.audioCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy"><p>${U.esc(section.body)}</p></div>` : ""}`;
    else if (type === "html") content = `<div class="section-html">${section.html || ""}</div>`;
    return `<section class="section-block ${revealClass}" ${animAttr}><div class="section-block-inner">${header}${content}</div></section>`;
  }

  function renderHeader() {
    const current = activeSet();
    const structure = getNavStructure();
    const profile = getProfile();
    const brandName = state.lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
    const brandLines = brandCardLines(state.lang);
    const navItem = (id) => `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${hrefFor(id)}"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${U.esc(navLabel(id))}</span></a></li>`;
    const navDrop = (id, children) => {
      const sub = children.map((c) => `<li><a class="submenu-link ${current.has(c) ? "active" : ""}" href="${hrefFor(c)}"><span class="nav-icon" aria-hidden="true">${navIcon(c)}</span><span class="nav-label">${U.esc(navLabel(c))}</span></a></li>`).join("");
      return `<li class="dropdown"><button class="drop-btn nav-link ${current.has(id) ? "active" : ""}" aria-expanded="false" aria-haspopup="true"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${U.esc(navLabel(id))}</span></button><ul class="submenu" role="menu">${sub}</ul></li>`;
    };
    const parts = structure.map((item) => item.children ? navDrop(item.id, item.children) : navItem(item.id)).join("");
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return;
    headerEl.innerHTML = `<header class="site-header ${state.nav.cli ? "cli-mode" : ""}" role="banner"><div class="nav-wrap terminal-card"><a class="brand" href="${hrefFor("home")}" aria-label="${U.esc(brandName)}"><span class="brand-logo-shell" aria-hidden="true"><img class="brand-logo" src="${brandLogoSrc}" alt="" decoding="async" loading="eager" /></span><span class="brand-text"><span class="brand-dot">$</span><span class="brand-name">${U.esc(brandName)}</span></span><span class="brand-card" aria-hidden="true"><span class="brand-card-line brand-card-line--primary">${U.esc(brandLines[0])}</span><span class="brand-card-line">${U.esc(brandLines[1])}</span><span class="brand-card-line">${U.esc(brandLines[2])}</span></span></a><button id="menu-toggle" class="icon-btn nav-action" aria-expanded="false" aria-controls="primary-nav"><span class="btn-icon" aria-hidden="true">&#9776;</span><span class="btn-label">${U.esc(t("ui.menu"))}</span></button><nav id="primary-nav" class="primary-nav" aria-label="Primary"><ul class="nav-list">${parts}</ul></nav><div class="tools"><div class="cmd-wrap"><div class="cmd-input-shell"><span class="cmd-prefix" aria-hidden="true">$</span><label class="sr-only" for="command-input">${U.esc(t("ui.commandLabel"))}</label><input id="command-input" autocomplete="off" spellcheck="false" /><button id="cmd-run" class="icon-btn cmd-enter" type="button" aria-label="${U.esc(t("ui.runCommand"))}">&#9166;</button></div><ul id="command-suggestions" class="suggestions" role="listbox"></ul><div id="command-output" class="cmd-output" aria-live="polite"></div></div><button id="cli-toggle" class="icon-btn nav-action ${state.nav.cli ? "active" : ""}" aria-label="CLI" aria-pressed="${state.nav.cli ? "true" : "false"}"><span class="btn-icon" aria-hidden="true">&gt;_</span><span class="btn-label">CLI</span></button><button id="theme-toggle" class="icon-btn nav-action" aria-label="${U.esc(t("ui.themeButton"))}"><span class="btn-icon" aria-hidden="true">&#9680;</span><span class="btn-label">${U.esc(t("ui.themeButton"))}</span></button><button id="lang-toggle" class="icon-btn nav-action" aria-label="${nextLang() === "ar" ? "Switch language to Arabic" : "Switch language to English"}"><span class="btn-icon" aria-hidden="true">&#127760;</span><span class="btn-label">${langButtonLabel()}</span></button></div></div></header>`;
    bindHeader();
  }

  function syncHeaderState() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    h.classList.toggle("cli-mode", state.nav.cli);
    h.classList.remove("island");
    const c = document.getElementById("cli-toggle");
    if (c) { c.classList.toggle("active", state.nav.cli); c.setAttribute("aria-pressed", String(state.nav.cli)); }
  }

  function getMorphDurationMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--cli-morph-duration").trim();
    if (raw.endsWith("ms")) return Number.parseFloat(raw) || 0;
    if (raw.endsWith("s")) return (Number.parseFloat(raw) || 0) * 1000;
    return 0;
  }

  function animateHeaderShell(header, applyState) {
    if (!header) {
      applyState();
      return;
    }
    const wrap = header.querySelector(".nav-wrap");
    if (!wrap || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyState();
      return;
    }
    const duration = Math.max(getMorphDurationMs(), 320);

    wrap.getAnimations().forEach((animation) => animation.cancel());
    const first = wrap.getBoundingClientRect();
    const firstStyle = getComputedStyle(wrap);

    applyState();

    const last = wrap.getBoundingClientRect();
    if (!first.width || !last.width) return;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;

    document.querySelectorAll(".nav-wrap-morph-proxy").forEach((node) => node.remove());
    const proxy = document.createElement("div");
    proxy.setAttribute("aria-hidden", "true");
    proxy.className = "nav-wrap-morph-proxy";
    proxy.style.position = "fixed";
    proxy.style.left = `${last.left}px`;
    proxy.style.top = `${last.top}px`;
    proxy.style.width = `${last.width}px`;
    proxy.style.height = `${last.height}px`;
    proxy.style.border = firstStyle.border;
    proxy.style.borderRadius = firstStyle.borderRadius;
    proxy.style.background = firstStyle.background;
    proxy.style.boxShadow = firstStyle.boxShadow;
    proxy.style.backdropFilter = firstStyle.backdropFilter;
    proxy.style.webkitBackdropFilter = firstStyle.webkitBackdropFilter;
    proxy.style.pointerEvents = "none";
    proxy.style.transformOrigin = "top left";
    proxy.style.willChange = "transform, opacity";
    proxy.style.zIndex = "60";
    document.body.appendChild(proxy);

    const animation = proxy.animate(
      [
        {
          transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          opacity: 0.96
        },
        {
          transform: "translate(0, 0) scale(1, 1)",
          opacity: 0.92,
          offset: 0.62
        },
        {
          transform: "translate(0, 0) scale(1, 1)",
          opacity: 0
        }
      ],
      {
        duration,
        easing: "cubic-bezier(0.18, 0.88, 0.24, 1)",
        fill: "both"
      }
    );

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      proxy.remove();
    };

    animation.addEventListener("finish", cleanup, { once: true });
    animation.addEventListener("cancel", cleanup, { once: true });
  }

  function setCliMode(active) {
    const next = Boolean(active);
    const header = document.querySelector(".site-header");
    if (state.nav.cli === next) {
      if (next) document.getElementById("command-input")?.focus();
      return;
    }
    animateHeaderShell(header, () => {
      state.nav.cli = next;
      localStorage.setItem("portfolio.nav.cli", state.nav.cli ? "1" : "0");
      syncHeaderState();
    });
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (nav) nav.classList.remove("open");
    if (menu) menu.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
    const cmd = document.getElementById("command-input");
    if (state.nav.cli && cmd) requestAnimationFrame(() => cmd.focus());
  }

  function canUseIsland() {
    if (state.nav.cli) return false;
    if (document.getElementById("primary-nav")?.classList.contains("open")) return false;
    if (document.querySelector(".submenu.open")) return false;
    if (document.getElementById("project-modal") && !document.getElementById("project-modal").hidden) return false;
    if (document.getElementById("guided-panel") && !document.getElementById("guided-panel").hidden) return false;
    if (document.getElementById("editor-panel") && !document.getElementById("editor-panel").hidden) return false;
    return true;
  }

  function markNavActive() {
    const now = Date.now();
    if (now - navLastActivity < 160) return;
    navLastActivity = now;
    const wasIdle = state.nav.idle;
    state.nav.idle = false;
    if (wasIdle) syncHeaderState();
    scheduleNavIdle();
  }

  function scheduleNavIdle() {
    if (navIdleTimer) clearTimeout(navIdleTimer);
    navIdleTimer = setTimeout(() => {
      if (canUseIsland()) { state.nav.idle = true; syncHeaderState(); }
    }, NAV_IDLE_MS);
  }

  function bindNavActivity() {
    if (navActivityBound) return;
    navActivityBound = true;
    ["pointerdown", "mousemove", "keydown", "touchstart", "scroll"].forEach((e) => document.addEventListener(e, markNavActive, { passive: true }));
    scheduleNavIdle();
  }

  function bindMenuToggle() {
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (!nav || !menu) return;
    menu.addEventListener("click", () => { markNavActive(); const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); });
  }

  function bindSubmenus() {
    document.querySelectorAll(".drop-btn").forEach((btn) => {
      const menuEl = btn.nextElementSibling;
      if (!menuEl) return;
      const close = () => { btn.setAttribute("aria-expanded", "false"); menuEl.classList.remove("open"); };
      btn.addEventListener("click", () => {
        markNavActive();
        const open = btn.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
        btn.setAttribute("aria-expanded", String(!open));
        menuEl.classList.toggle("open", !open);
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
        if (e.key === "ArrowDown") { e.preventDefault(); btn.click(); menuEl.querySelector("a")?.focus(); }
        if (e.key === "Escape") close();
      });
      menuEl.querySelectorAll("a").forEach((link) => {
        link.addEventListener("keydown", (e) => {
          const links = [...menuEl.querySelectorAll("a")]; const idx = links.indexOf(link);
          if (e.key === "ArrowDown") { e.preventDefault(); links[(idx + 1) % links.length].focus(); }
          if (e.key === "ArrowUp") { e.preventDefault(); links[(idx - 1 + links.length) % links.length].focus(); }
          if (e.key === "Escape") { e.preventDefault(); close(); btn.focus(); }
        });
      });
    });
  }

  function bindCommands() {
    const cmd = document.getElementById("command-input");
    const cmdRun = document.getElementById("cmd-run");
    const suggestions = document.getElementById("command-suggestions");
    const out = document.getElementById("command-output");
    if (!cmd || !suggestions || !out) return;

    cmd.placeholder = t("ui.commandPlaceholder");

    const suggest = (value) => {
      const query = value.trim().toLowerCase();
      const list = getCommandList().filter((c) => !query || c.includes(query)).slice(0, 10);
      state.cmdIndex = -1;
      suggestions.innerHTML = list.length ? list.map((c, i) => `<li role="option" data-idx="${i}" data-cmd="${c}">${c}</li>`).join("") : `<li class="muted">${U.esc(t("ui.noSuggestions"))}</li>`;
    };

    const run = (raw) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;
      const [command, arg] = text.split(/\s+/, 2);
      const routes = getRouteMap();
      if (command === "help") out.textContent = `${t("commands.help")} | ${t("commands.helpExtra")}`;
      else if (command === "clear") { cmd.value = ""; out.textContent = t("commands.cleared"); }
      else if (command === "theme") { const themes = getThemes(); const next = arg || themes[(themes.indexOf(state.theme) + 1) % themes.length] || getDefaultTheme(); applyTheme(next); out.textContent = `${t("commands.themeChanged")}: ${themeLabel(state.theme)}`; }
      else if (command === "lang") setLang(arg === "ar" || arg === "en" ? arg : state.lang === "ar" ? "en" : "ar");
      else if (command === "cli") { const next = arg === "on" ? true : arg === "off" ? false : !state.nav.cli; setCliMode(next); out.textContent = state.nav.cli ? t("commands.cliEnabled") : t("commands.cliDisabled"); }
      else if (command === "home") window.location.href = hrefFor("home");
      else if (routes[command]) window.location.href = hrefFor(routes[command]);
      else out.textContent = t("commands.unknown");
      suggestions.innerHTML = "";
    };

    cmd.addEventListener("input", () => { markNavActive(); suggest(cmd.value); });
    cmd.addEventListener("keydown", (e) => {
      markNavActive();
      const items = [...suggestions.querySelectorAll("li[data-cmd]")];
      if (e.key === "ArrowDown" && items.length) { e.preventDefault(); state.cmdIndex = (state.cmdIndex + 1) % items.length; }
      if (e.key === "ArrowUp" && items.length) { e.preventDefault(); state.cmdIndex = (state.cmdIndex - 1 + items.length) % items.length; }
      items.forEach((item, i) => item.classList.toggle("active", i === state.cmdIndex));
      if (e.key === "Enter") { e.preventDefault(); run((state.cmdIndex >= 0 ? items[state.cmdIndex].dataset.cmd : cmd.value) || ""); }
      if (e.key === "Escape") { suggestions.innerHTML = ""; if (!cmd.value.trim() && state.nav.cli) setCliMode(false); }
    });
    if (cmdRun) cmdRun.addEventListener("click", () => { markNavActive(); run(cmd.value || ""); cmd.focus(); });
    suggestions.addEventListener("click", (e) => { markNavActive(); const item = e.target.closest("li[data-cmd]"); if (!item) return; cmd.value = item.dataset.cmd; run(cmd.value); });
  }

  function bindThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      markNavActive();
      const themes = getThemes();
      const next = themes[(themes.indexOf(state.theme) + 1) % themes.length] || getDefaultTheme();
      applyTheme(next);
    });
  }

  function bindLangToggle() {
    const btn = document.getElementById("lang-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => { markNavActive(); setLang(state.lang === "ar" ? "en" : "ar"); });
  }

  function bindCliToggle() {
    const btn = document.getElementById("cli-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => { markNavActive(); setCliMode(!state.nav.cli); });
  }

  function bindHeader() {
    bindMenuToggle();
    bindSubmenus();
    bindCommands();
    bindThemeToggle();
    bindLangToggle();
    bindCliToggle();
    bindGuidedToggle();
  }

  function bindGuidedToggle() {
    const btn = document.getElementById("guided-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => { markNavActive(); const p = document.getElementById("guided-panel"); if (p) p.hidden = !p.hidden; });
  }

  function bindModalClose() {
    document.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => {
        const modal = el.closest(".modal") || document.getElementById("project-modal");
        if (modal) { modal.hidden = true; modal.setAttribute("aria-hidden", "true"); }
      });
    });
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.addEventListener("click", () => {
      const modal = document.getElementById("project-modal");
      if (modal) { modal.hidden = true; modal.setAttribute("aria-hidden", "true"); }
    });
  }

  function render() {
    renderHeader();
    syncHeaderState();
    renderPageContent();
  }

  function bindAll() {
    bindModalClose();
    bindNavActivity();
  }

  function init() {
    applyTheme(state.theme);
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    renderLoadingScreenCopy();
    render();
    bindAll();
    initLoadingScreen();
    createParticles();
  }

  function initLoadingScreen() {
    const screen = document.getElementById("loading-screen");
    if (!screen) return;
    if (sessionStorage.getItem("portfolio.intro-seen")) {
      screen.classList.add("hidden");
      return;
    }
    const dismiss = () => {
      sessionStorage.setItem("portfolio.intro-seen", "1");
      screen.classList.add("fade-out");
      setTimeout(() => {
        screen.classList.add("hidden");
        document.body.style.overflow = "";
      }, 800);
    };
    document.body.style.overflow = "hidden";
    screen.addEventListener("click", dismiss);
    document.addEventListener("keydown", dismiss, { once: true });
    setTimeout(dismiss, 4000);
  }

  function createParticles() {
    const container = document.createElement("div");
    container.id = "particles-bg";
    document.body.prepend(container);
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = (8 + Math.random() * 12) + "s";
      p.style.animationDelay = Math.random() * 10 + "s";
      p.style.width = p.style.height = (1 + Math.random() * 2) + "px";
      container.appendChild(p);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
