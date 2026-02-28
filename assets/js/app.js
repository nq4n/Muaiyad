(() => {
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const pageId = document.body.dataset.page || "home";
  const path = window.location.pathname.replace(/\\/g, "/");
  const rootPrefix = /\/pages\//i.test(path) ? "../" : "";
  const navUnit = DATA.navStructure.find((x) => x.id === "unit-plan");
  const navOther = DATA.navStructure.find((x) => x.id === "other");
  const unitChildren = navUnit ? navUnit.children : [];
  const otherChildren = navOther ? navOther.children : [];
  const CONTENT_KEY = "portfolio.content.v1";
  const SHOW_KEY = "portfolio.show";
  const NAV_CLI_KEY = "portfolio.nav.cli";
  const NAV_IDLE_MS = 2800;

  const NAV_ICONS = {
    home: "&#8962;",
    philosophy: "&#9673;",
    cv: "&#9638;",
    "unit-plan": "&#9635;",
    "framework-axes": "&#8998;",
    "reflection-papers": "&#9998;",
    "graduation-project": "&#11041;",
    other: "&#8230;"
  };

  const route = {
    home: "home",
    philosophy: "philosophy",
    cv: "cv",
    unit: "unit-plan",
    framework: "framework-axes",
    reflections: "reflection-papers",
    graduation: "graduation-project",
    other: "other",
    unit1: "unit-1-intro",
    unit2: "unit-2-framework",
    unit3: "unit-3-objectives",
    unit4: "unit-4-assessment",
    unit5: "unit-5-lessons",
    unit6: "unit-6-feedback",
    unit7: "unit-7-impact",
    unit8: "unit-8-reflection",
    unit9: "unit-9-references",
    unit10: "unit-10-appendices",
    other1: "other-values",
    other2: "other-workshop",
    other3: "other-growth",
    other4: "other-peer-visits"
  };

  const commandList = Array.from(
    new Set([...(DATA.commandList || []), "edit", "studio", "cli", "savecontent", "resetcontent"])
  );

  let revealObserver = null;
  let navIdleTimer = null;
  let navLastActivity = 0;
  let navActivityBound = false;
  const pageKeys = Object.keys(DATA.pageMap);

  const deepClone = (v) => JSON.parse(JSON.stringify(v));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const todayISO = () => new Date().toISOString().slice(0, 10);

  function buildDefaultContent() {
    return {
      pages: {
        en: deepClone(DATA.translations.en.pages),
        ar: deepClone(DATA.translations.ar.pages)
      },
      projects: deepClone(DATA.projects)
    };
  }

  function normalizeSections(sections, fallbackSections) {
    const base = Array.isArray(fallbackSections) ? fallbackSections : [];
    if (!Array.isArray(sections) || !sections.length) return deepClone(base);
    const cleaned = sections
      .map((s) => ({
        title: typeof s.title === "string" ? s.title : "",
        body: typeof s.body === "string" ? s.body : ""
      }))
      .filter((s) => s.title || s.body);
    return cleaned.length ? cleaned : deepClone(base);
  }

  function normalizePage(page, fallbackPage) {
    const src = page && typeof page === "object" ? page : {};
    return {
      title: typeof src.title === "string" ? src.title : fallbackPage.title,
      subtitle: typeof src.subtitle === "string" ? src.subtitle : fallbackPage.subtitle,
      prompt: typeof src.prompt === "string" ? src.prompt : fallbackPage.prompt,
      sections: normalizeSections(src.sections, fallbackPage.sections)
    };
  }

  function normalizeProject(p, idx, fallback) {
    const source = p && typeof p === "object" ? p : {};
    const fb = fallback || {};
    const toArr = (val, def) => (Array.isArray(val) ? val.map((x) => String(x)).filter(Boolean) : def || []);
    return {
      id: typeof source.id === "string" && source.id ? source.id : fb.id || `project-${idx + 1}`,
      name: {
        en: typeof source.name?.en === "string" ? source.name.en : fb.name?.en || `Project ${idx + 1}`,
        ar: typeof source.name?.ar === "string" ? source.name.ar : fb.name?.ar || `مشروع ${idx + 1}`
      },
      summary: {
        en: typeof source.summary?.en === "string" ? source.summary.en : fb.summary?.en || "",
        ar: typeof source.summary?.ar === "string" ? source.summary.ar : fb.summary?.ar || ""
      },
      details: {
        en: typeof source.details?.en === "string" ? source.details.en : fb.details?.en || "",
        ar: typeof source.details?.ar === "string" ? source.details.ar : fb.details?.ar || ""
      },
      tags: toArr(source.tags, fb.tags || []),
      stack: toArr(source.stack, fb.stack || []),
      status: source.status === "done" ? "done" : source.status === "wip" ? "wip" : fb.status || "wip",
      featured: typeof source.featured === "boolean" ? source.featured : Boolean(fb.featured),
      complexity: Number.isFinite(Number(source.complexity))
        ? Math.max(1, Math.min(5, Number(source.complexity)))
        : Number.isFinite(Number(fb.complexity))
          ? Number(fb.complexity)
          : 3,
      created:
        typeof source.created === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.created)
          ? source.created
          : fb.created || todayISO(),
      link: typeof source.link === "string" ? source.link : fb.link || "#",
      pitch: {
        en: typeof source.pitch?.en === "string" ? source.pitch.en : fb.pitch?.en || "",
        ar: typeof source.pitch?.ar === "string" ? source.pitch.ar : fb.pitch?.ar || ""
      }
    };
  }

  function sanitizeContent(raw) {
    const defaults = buildDefaultContent();
    const source = raw && typeof raw === "object" ? raw : {};
    const out = deepClone(defaults);

    ["en", "ar"].forEach((lang) => {
      const srcPages = source.pages && source.pages[lang] && typeof source.pages[lang] === "object" ? source.pages[lang] : {};
      pageKeys.forEach((pid) => {
        const fallbackPage = defaults.pages[lang][pid] || {
          title: pid,
          subtitle: "",
          prompt: "$ open section",
          sections: []
        };
        out.pages[lang][pid] = normalizePage(srcPages[pid], fallbackPage);
      });
    });

    const incomingProjects = Array.isArray(source.projects) ? source.projects : defaults.projects;
    out.projects = incomingProjects.map((p, idx) => normalizeProject(p, idx, defaults.projects[idx]));
    if (!out.projects.length) out.projects = deepClone(defaults.projects);
    return out;
  }

  function loadContent() {
    try {
      const saved = localStorage.getItem(CONTENT_KEY);
      return saved ? sanitizeContent(JSON.parse(saved)) : buildDefaultContent();
    } catch (_) {
      return buildDefaultContent();
    }
  }

  const state = {
    lang:
      localStorage.getItem("portfolio.lang") ||
      ((navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en"),
    theme: localStorage.getItem("portfolio.theme") || DATA.defaultTheme,
    cmdIndex: -1,
    project: {
      search: "",
      sort: "featured",
      tag: "all",
      show: localStorage.getItem(SHOW_KEY) || "all"
    },
    guided: { purpose: "hiring", vibe: "minimal", show: "featured" },
    content: loadContent(),
    nav: {
      cli: localStorage.getItem(NAV_CLI_KEY) === "1",
      idle: false
    },
    editor: {
      tab: "page",
      pageLang: localStorage.getItem("portfolio.lang") || "en",
      pageId: pageId,
      draft: null
    }
  };

  const tr = () => DATA.translations[state.lang];
  const t = (key) =>
    key
      .split(".")
      .reduce((acc, k) => (acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : null), tr()) ?? "";
  const hrefFor = (id) => `${rootPrefix}${DATA.pageMap[id]}`;
  const uiText = (en, ar) => (state.lang === "ar" ? ar : en);
  const navIcon = (id) => NAV_ICONS[id] || (id.startsWith("unit-") ? "&#8250;" : id.startsWith("other-") ? "&#8250;" : "&#8226;");

  function persistContent() {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(sanitizeContent(state.content)));
  }

  function resetContent() {
    state.content = buildDefaultContent();
    localStorage.removeItem(CONTENT_KEY);
    render();
    refreshEditorForm();
    setEditorStatus(uiText("Content reset to defaults.", "تمت إعادة المحتوى للوضع الافتراضي."), false);
  }

  function getPageContent(lang, pid) {
    return state.content.pages[lang]?.[pid] || DATA.translations[lang].pages[pid];
  }

  function getProjects() {
    return Array.isArray(state.content.projects) ? state.content.projects : [];
  }

  function activeSet() {
    const s = new Set([pageId]);
    if (unitChildren.includes(pageId)) s.add("unit-plan");
    if (otherChildren.includes(pageId)) s.add("other");
    return s;
  }

  function applyTheme(theme) {
    state.theme = DATA.themes.includes(theme) ? theme : DATA.defaultTheme;
    localStorage.setItem("portfolio.theme", state.theme);
    document.documentElement.dataset.theme = state.theme;
  }

  function setLang(lang) {
    state.lang = lang === "ar" ? "ar" : "en";
    localStorage.setItem("portfolio.lang", state.lang);
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    render();
  }

  function syncHeaderState() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    header.classList.toggle("cli-mode", state.nav.cli);
    header.classList.remove("island");
    const cliBtn = document.getElementById("cli-toggle");
    if (cliBtn) {
      cliBtn.classList.toggle("active", state.nav.cli);
      cliBtn.setAttribute("aria-pressed", String(state.nav.cli));
    }
  }

  function setCliMode(active) {
    state.nav.cli = Boolean(active);
    localStorage.setItem(NAV_CLI_KEY, state.nav.cli ? "1" : "0");
    syncHeaderState();
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (nav) nav.classList.remove("open");
    if (menu) menu.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".drop-btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".submenu").forEach((sub) => sub.classList.remove("open"));
    const cmd = document.getElementById("command-input");
    if (state.nav.cli && cmd) cmd.focus();
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

  function scheduleNavIdle() {
    if (navIdleTimer) clearTimeout(navIdleTimer);
    navIdleTimer = setTimeout(() => {
      if (canUseIsland()) {
        state.nav.idle = true;
        syncHeaderState();
      }
    }, NAV_IDLE_MS);
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

  function bindNavActivity() {
    if (navActivityBound) return;
    navActivityBound = true;
    ["pointerdown", "mousemove", "keydown", "touchstart", "scroll"].forEach((evt) => {
      document.addEventListener(evt, markNavActive, { passive: true });
    });
    scheduleNavIdle();
  }

  function renderHeader() {
    const current = activeSet();
    const navItem = (id) =>
      `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${hrefFor(id)}"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${esc(t(`nav.${id}`))}</span></a></li>`;
    const navDrop = (id, children) => {
      const sub = children
        .map(
          (cid) => `<li><a class="submenu-link ${current.has(cid) ? "active" : ""}" href="${hrefFor(cid)}"><span class="nav-icon" aria-hidden="true">${navIcon(cid)}</span><span class="nav-label">${esc(t(`nav.${cid}`))}</span></a></li>`
        )
        .join("");
      return `<li class="dropdown">
        <button class="drop-btn nav-link ${current.has(id) ? "active" : ""}" aria-expanded="false" aria-haspopup="true"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${esc(t(`nav.${id}`))}</span></button>
        <ul class="submenu" role="menu">${sub}</ul>
      </li>`;
    };
    const parts = DATA.navStructure.map((n) => (n.children ? navDrop(n.id, n.children) : navItem(n.id))).join("");

    document.getElementById("site-header").innerHTML = `
      <header class="site-header ${state.nav.cli ? "cli-mode" : ""}" role="banner">
        <div class="nav-wrap terminal-card">
          <a class="brand" href="${hrefFor("home")}"><span class="brand-dot">$</span> ${esc(DATA.profile.name_en)}</a>
          <button id="menu-toggle" class="icon-btn nav-action" aria-expanded="false" aria-controls="primary-nav"><span class="btn-icon" aria-hidden="true">&#9776;</span><span class="btn-label">${esc(t("ui.menu"))}</span></button>
          <nav id="primary-nav" class="primary-nav" aria-label="Primary">
            <ul class="nav-list">${parts}</ul>
          </nav>
          <div class="tools">
            <div class="cmd-wrap">
              <div class="cmd-input-shell">
                <span class="cmd-prefix" aria-hidden="true">$</span>
                <label class="sr-only" for="command-input">${esc(t("ui.commandLabel"))}</label>
                <input id="command-input" autocomplete="off" spellcheck="false" />
                <button id="cmd-run" class="icon-btn cmd-enter" type="button" aria-label="${esc(uiText("Run command", "\u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631"))}">&#9166;</button>
              </div>
              <ul id="command-suggestions" class="suggestions" role="listbox"></ul>
              <div id="command-output" class="cmd-output" aria-live="polite"></div>
            </div>
            <button id="cli-toggle" class="icon-btn nav-action ${state.nav.cli ? "active" : ""}" aria-pressed="${state.nav.cli ? "true" : "false"}"><span class="btn-icon" aria-hidden="true">&gt;_</span><span class="btn-label">CLI</span></button>
            <button id="theme-toggle" class="icon-btn nav-action"><span class="btn-icon" aria-hidden="true">&#9680;</span><span class="btn-label">${esc(t("ui.themeButton"))}</span></button>
            <button id="lang-toggle" class="icon-btn nav-action"><span class="btn-icon" aria-hidden="true">&#127760;</span><span class="btn-label">${esc(t("ui.langButton"))}</span></button>
            <button id="guided-toggle" class="icon-btn nav-action"><span class="btn-icon" aria-hidden="true">&#10022;</span><span class="btn-label">${esc(t("ui.guidedButton"))}</span></button>
            <button id="editor-toggle" class="icon-btn nav-action"><span class="btn-icon" aria-hidden="true">&#9998;</span><span class="btn-label">${esc(uiText("Edit", "\u062A\u062D\u0631\u064A\u0631"))}</span></button>
          </div>
        </div>
      </header>
    `;
    bindHeader();
    syncHeaderState();
  }
  function bindHeader() {
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    const cmd = document.getElementById("command-input");
    const cmdRun = document.getElementById("cmd-run");
    const sug = document.getElementById("command-suggestions");
    const out = document.getElementById("command-output");
    const search = document.getElementById("project-search");

    cmd.placeholder = t("ui.commandPlaceholder");
    menu.addEventListener("click", () => {
      markNavActive();
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll(".drop-btn").forEach((btn) => {
      const menuEl = btn.nextElementSibling;
      const close = () => {
        btn.setAttribute("aria-expanded", "false");
        menuEl.classList.remove("open");
      };
      btn.addEventListener("click", () => {
        markNavActive();
        const open = btn.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
        btn.setAttribute("aria-expanded", String(!open));
        menuEl.classList.toggle("open", !open);
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          btn.click();
          menuEl.querySelector("a")?.focus();
        }
        if (e.key === "Escape") close();
      });
      menuEl.querySelectorAll("a").forEach((a) => {
        a.addEventListener("keydown", (e) => {
          const links = [...menuEl.querySelectorAll("a")];
          const idx = links.indexOf(a);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            links[(idx + 1) % links.length].focus();
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            links[(idx - 1 + links.length) % links.length].focus();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            close();
            btn.focus();
          }
        });
      });
    });

    document.getElementById("cli-toggle").addEventListener("click", () => {
      markNavActive();
      setCliMode(!state.nav.cli);
    });
    document.getElementById("theme-toggle").addEventListener("click", () => {
      markNavActive();
      const i = (DATA.themes.indexOf(state.theme) + 1) % DATA.themes.length;
      applyTheme(DATA.themes[i]);
      out.textContent = `${t("commands.themeChanged")}: ${t(`themes.${state.theme}`)}`;
    });
    document.getElementById("lang-toggle").addEventListener("click", () =>
      (markNavActive(), setLang(state.lang === "ar" ? "en" : "ar"))
    );
    document.getElementById("guided-toggle").addEventListener("click", () => {
      markNavActive();
      openGuided();
    });
    document.getElementById("editor-toggle").addEventListener("click", () => {
      markNavActive();
      openEditor();
    });

    const suggest = (value) => {
      const q = value.trim().toLowerCase();
      const list = commandList.filter((c) => !q || c.includes(q)).slice(0, 10);
      state.cmdIndex = -1;
      sug.innerHTML = list.length
        ? list.map((x, i) => `<li role="option" data-idx="${i}" data-cmd="${x}">${x}</li>`).join("")
        : `<li class="muted">${esc(t("ui.noSuggestions"))}</li>`;
    };

    const run = (raw) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;
      const [command, arg] = text.split(/\s+/, 2);
      if (command === "help")
        out.textContent = `${t("commands.help")} | ${uiText(
          "extra: cli, edit, studio, savecontent, resetcontent",
          "\u0625\u0636\u0627\u0641\u064A: cli, edit, studio, savecontent, resetcontent"
        )}`;
      else if (command === "clear") {
        cmd.value = "";
        out.textContent = t("commands.cleared");
      } else if (command === "theme") {
        applyTheme(arg || DATA.themes[(DATA.themes.indexOf(state.theme) + 1) % DATA.themes.length]);
        out.textContent = `${t("commands.themeChanged")}: ${t(`themes.${state.theme}`)}`;
      } else if (command === "lang") setLang(arg === "ar" || arg === "en" ? arg : state.lang === "ar" ? "en" : "ar");
      else if (command === "cli") {
        const next = arg === "on" ? true : arg === "off" ? false : !state.nav.cli;
        setCliMode(next);
        out.textContent = uiText(
          state.nav.cli ? "CLI mode enabled." : "CLI mode disabled.",
          state.nav.cli
            ? "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0648\u0636\u0639 CLI."
            : "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0648\u0636\u0639 CLI."
        );
      }
      else if (command === "edit" || command === "studio") openEditor();
      else if (command === "savecontent") {
        persistContent();
        out.textContent = uiText("Content saved.", "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u062D\u062A\u0648\u0649.");
      } else if (command === "resetcontent") {
        resetContent();
        out.textContent = uiText("Content reset.", "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649.");
      } else if (command === "home" && search && pageId === "home") search.focus();
      else if (route[command]) window.location.href = hrefFor(route[command]);
      else out.textContent = t("commands.unknown");
      sug.innerHTML = "";
    };

    cmd.addEventListener("input", () => {
      markNavActive();
      suggest(cmd.value);
    });
    cmd.addEventListener("keydown", (e) => {
      markNavActive();
      const items = [...sug.querySelectorAll("li[data-cmd]")];
      if (e.key === "ArrowDown" && items.length) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex + 1) % items.length;
      }
      if (e.key === "ArrowUp" && items.length) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex - 1 + items.length) % items.length;
      }
      items.forEach((it, i) => it.classList.toggle("active", i === state.cmdIndex));
      if (e.key === "Enter") {
        e.preventDefault();
        run((state.cmdIndex >= 0 ? items[state.cmdIndex].dataset.cmd : cmd.value) || "");
      }
      if (e.key === "Escape") {
        sug.innerHTML = "";
        if (!cmd.value.trim() && state.nav.cli) setCliMode(false);
      }
    });
    cmdRun?.addEventListener("click", () => {
      markNavActive();
      run(cmd.value || "");
      cmd.focus();
    });
    sug.addEventListener("click", (e) => {
      markNavActive();
      const li = e.target.closest("li[data-cmd]");
      if (!li) return;
      cmd.value = li.dataset.cmd;
      run(cmd.value);
    });
  }

  function tabsMarkup(sections) {
    if (!sections.length) {
      return `<p class="muted">${esc(uiText("No section content yet. Use Edit to add content.", "لا يوجد محتوى بعد. استخدم تحرير لإضافة المحتوى."))}</p>`;
    }
    const head = sections
      .map(
        (s, i) =>
          `<button class="tab-btn ${i === 0 ? "active" : ""}" role="tab" aria-selected="${i === 0 ? "true" : "false"}" id="tab-btn-${i}" aria-controls="tab-panel-${i}" tabindex="${i === 0 ? "0" : "-1"}">${esc(s.title || uiText(`Section ${i + 1}`, `القسم ${i + 1}`))}</button>`
      )
      .join("");
    const body = sections
      .map(
        (s, i) =>
          `<section class="tab-panel ${i === 0 ? "active" : ""}" role="tabpanel" id="tab-panel-${i}" aria-labelledby="tab-btn-${i}" ${i === 0 ? "" : "hidden"}><article class="section-card reveal" style="--reveal-delay:${i * 90}ms"><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p></article></section>`
      )
      .join("");
    return `<div class="content-tabs-wrap"><div class="content-tabs" role="tablist">${head}</div><div class="tab-panels">${body}</div></div>`;
  }

  function bindSectionTabs() {
    const wrap = document.getElementById("page-sections");
    if (!wrap) return;
    const tabs = [...wrap.querySelectorAll(".tab-btn")];
    const panels = [...wrap.querySelectorAll(".tab-panel")];
    if (!tabs.length) return;

    const setActive = (index) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => {
        const active = i === index;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
      const card = panels[index]?.querySelector(".section-card");
      if (card) {
        card.classList.remove("is-visible");
        requestAnimationFrame(() => card.classList.add("is-visible"));
      }
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => setActive(idx));
      tab.addEventListener("keydown", (e) => {
        let next = idx;
        if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== idx) {
          e.preventDefault();
          setActive(next);
          tabs[next].focus();
        }
      });
    });
  }

  function renderPage() {
    document.title = `${t("meta.siteName")} | ${t(`nav.${pageId}`)}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (value) el.textContent = value;
    });
    const page = getPageContent(state.lang, pageId);
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const wrap = document.getElementById("page-sections");
    title.textContent = page.title;
    subtitle.textContent = page.subtitle;
    prompt.textContent = page.prompt;
    wrap.innerHTML = tabsMarkup(page.sections || []);
    bindSectionTabs();
  }

  function filteredProjects() {
    const q = state.project.search.toLowerCase();
    let list = getProjects().filter((x) => {
      if (state.project.tag !== "all" && !x.tags.includes(state.project.tag)) return false;
      if (state.project.show === "featured" && !x.featured) return false;
      if (state.project.show === "ai" && !x.tags.includes("ai")) return false;
      if (q) {
        const txt = [x.name[state.lang], x.summary[state.lang], x.stack.join(" "), x.tags.join(" ")]
          .join(" ")
          .toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
    if (state.project.sort === "newest") list = list.sort((a, b) => b.created.localeCompare(a.created));
    else if (state.project.sort === "complex") list = list.sort((a, b) => b.complexity - a.complexity);
    else list = list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.created.localeCompare(a.created));
    if (state.project.show === "recent") list = list.sort((a, b) => b.created.localeCompare(a.created));
    return list;
  }

  function renderProjects() {
    const shell = document.getElementById("projects");
    if (!shell) return;
    shell.hidden = pageId !== "home";
    if (pageId !== "home") return;

    const search = document.getElementById("project-search");
    const sort = document.getElementById("project-sort");
    const tags = document.getElementById("project-tags");
    const list = document.getElementById("project-list");
    search.placeholder = t("projects.searchPlaceholder");
    sort.querySelector("option[value='featured']").textContent = t("projects.sortFeatured");
    sort.querySelector("option[value='newest']").textContent = t("projects.sortNewest");
    sort.querySelector("option[value='complex']").textContent = t("projects.sortComplex");
    search.value = state.project.search;
    sort.value = state.project.sort;

    const allTags = [...new Set(getProjects().flatMap((p) => p.tags || []))];
    tags.innerHTML = [`<button class="chip ${state.project.tag === "all" ? "active" : ""}" data-tag="all">${esc(t("projects.tagAll"))}</button>`]
      .concat(allTags.map((x) => `<button class="chip ${state.project.tag === x ? "active" : ""}" data-tag="${x}">${x}</button>`))
      .join("");

    const rows = filteredProjects();
    list.innerHTML = rows.length
      ? rows
          .map(
            (p, i) => `<article class="project-card terminal-card reveal" style="--reveal-delay:${i * 70}ms">
              <h3>${esc(p.name[state.lang])}</h3>
              <p>${esc(p.summary[state.lang])}</p>
              <p class="meta">${esc(t("projects.status"))}: ${esc(p.status === "done" ? t("projects.statusDone") : t("projects.statusWip"))}</p>
              <p class="meta">${esc(t("projects.stack"))}: ${esc((p.stack || []).join(", "))}</p>
              <div class="tag-line">${(p.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
              <button class="icon-btn details-btn" data-id="${p.id}">${esc(t("projects.details"))}</button>
            </article>`
          )
          .join("")
      : `<p class="muted">${esc(t("projects.noResults"))}</p>`;

    search.oninput = () => {
      state.project.search = search.value;
      renderProjects();
      applyRevealMotion();
    };
    sort.onchange = () => {
      state.project.sort = sort.value;
      renderProjects();
      applyRevealMotion();
    };
    tags.onclick = (e) => {
      const b = e.target.closest("[data-tag]");
      if (!b) return;
      state.project.tag = b.dataset.tag;
      renderProjects();
      applyRevealMotion();
    };
    list.querySelectorAll(".details-btn").forEach((b) => b.addEventListener("click", () => openProject(b.dataset.id)));
  }

  function closeModal() {
    const modal = document.getElementById("project-modal");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }

  function openProject(id) {
    const p = getProjects().find((x) => x.id === id);
    if (!p) return;
    const modal = document.getElementById("project-modal");
    document.getElementById("project-modal-title").textContent = p.name[state.lang];
    document.getElementById("project-modal-summary").textContent = p.summary[state.lang];
    document.getElementById("project-modal-details").textContent = p.details[state.lang];
    document.getElementById("project-modal-stack").textContent = `${t("projects.stack")}: ${(p.stack || []).join(", ")}`;
    const link = document.getElementById("project-modal-link");
    const copy = document.getElementById("project-copy-pitch");
    link.href = p.link || "#";
    link.textContent = t("projects.openLink");
    copy.textContent = t("projects.copyPitch");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(p.pitch[state.lang] || "");
        copy.textContent = t("projects.copied");
      } catch (_) {}
    };
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }

  function renderGuided() {
    document.getElementById("guided-root").innerHTML = `
      <div id="guided-panel" class="guided-panel" hidden>
        <div class="guided-backdrop"></div>
        <section class="guided-dialog terminal-card" role="dialog" aria-modal="true">
          <h2>${esc(t("guided.title"))}</h2>
          <p class="muted">${esc(t("guided.subtitle"))}</p>
          <div class="guided-group" data-kind="purpose">
            <p>${esc(t("guided.purpose"))}</p>
            <button data-value="hiring">${esc(t("guided.purposeHiring"))}</button>
            <button data-value="collaboration">${esc(t("guided.purposeCollaboration"))}</button>
            <button data-value="curiosity">${esc(t("guided.purposeCuriosity"))}</button>
          </div>
          <div class="guided-group" data-kind="vibe">
            <p>${esc(t("guided.vibe"))}</p>
            <button data-value="minimal">${esc(t("guided.vibeMinimal"))}</button>
            <button data-value="neon">${esc(t("guided.vibeNeon"))}</button>
            <button data-value="retro">${esc(t("guided.vibeRetro"))}</button>
          </div>
          <div class="guided-group" data-kind="show">
            <p>${esc(t("guided.show"))}</p>
            <button data-value="featured">${esc(t("guided.showFeatured"))}</button>
            <button data-value="recent">${esc(t("guided.showRecent"))}</button>
            <button data-value="ai">${esc(t("guided.showAi"))}</button>
          </div>
          <div class="guided-actions">
            <button id="guided-apply" class="icon-btn">${esc(t("guided.apply"))}</button>
            <button id="guided-close" class="icon-btn">${esc(t("guided.close"))}</button>
          </div>
        </section>
      </div>
    `;
    const panel = document.getElementById("guided-panel");
    panel.querySelectorAll(".guided-group button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".guided-group");
        group.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
        state.guided[group.dataset.kind] = btn.dataset.value;
      });
    });
    panel.querySelector(".guided-group[data-kind='purpose'] button[data-value='hiring']").classList.add("active");
    panel.querySelector(".guided-group[data-kind='vibe'] button[data-value='minimal']").classList.add("active");
    panel.querySelector(".guided-group[data-kind='show'] button[data-value='featured']").classList.add("active");
    document.getElementById("guided-close").onclick = () => (panel.hidden = true);
    panel.querySelector(".guided-backdrop").onclick = () => (panel.hidden = true);
    document.getElementById("guided-apply").onclick = () => {
      const themeMap = { minimal: "blue", neon: "neon", retro: "amber" };
      applyTheme(themeMap[state.guided.vibe] || "blue");
      state.project.show = state.guided.show;
      localStorage.setItem(SHOW_KEY, state.project.show);
      panel.hidden = true;
      if (pageId === "home") {
        renderProjects();
        applyRevealMotion();
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else window.location.href = `${hrefFor("home")}#projects`;
    };
  }

  function openGuided() {
    const panel = document.getElementById("guided-panel");
    if (panel) panel.hidden = false;
  }

  function ensureEditor() {
    let root = document.getElementById("editor-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "editor-root";
      document.body.appendChild(root);
    }
    root.innerHTML = `
      <div id="editor-panel" class="editor-panel" hidden>
        <div class="editor-backdrop" data-editor-close="true"></div>
        <section class="editor-dialog terminal-card" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <div class="editor-head">
            <h2 id="editor-title"></h2>
            <button id="editor-close" class="icon-btn" type="button">x</button>
          </div>
          <p id="editor-subtitle" class="muted"></p>
          <div class="editor-tabs">
            <button class="editor-tab active" data-editor-tab="page"></button>
            <button class="editor-tab" data-editor-tab="json"></button>
          </div>
          <div class="editor-pane active" data-editor-pane="page">
            <div class="editor-grid">
              <label>
                <span id="editor-lang-label"></span>
                <select id="editor-lang-select"></select>
              </label>
              <label>
                <span id="editor-page-label"></span>
                <select id="editor-page-select"></select>
              </label>
            </div>
            <label>
              <span id="editor-title-label"></span>
              <input id="editor-page-title" type="text" />
            </label>
            <label>
              <span id="editor-subtitle-label"></span>
              <textarea id="editor-page-subtitle" rows="2"></textarea>
            </label>
            <label>
              <span id="editor-prompt-label"></span>
              <input id="editor-page-prompt" type="text" />
            </label>
            <div class="editor-sections-head">
              <h3 id="editor-sections-label"></h3>
              <button id="editor-add-section" class="icon-btn" type="button"></button>
            </div>
            <div id="editor-sections-list"></div>
            <div class="editor-actions">
              <button id="editor-save-page" class="icon-btn" type="button"></button>
            </div>
          </div>
          <div class="editor-pane" data-editor-pane="json">
            <label>
              <span id="editor-json-label"></span>
              <textarea id="editor-json" rows="14"></textarea>
            </label>
            <div class="editor-actions">
              <button id="editor-copy-json" class="icon-btn" type="button"></button>
              <button id="editor-download-json" class="icon-btn" type="button"></button>
              <button id="editor-apply-json" class="icon-btn" type="button"></button>
              <button id="editor-reset-json" class="icon-btn" type="button"></button>
            </div>
          </div>
          <p id="editor-status" class="status-line" aria-live="polite"></p>
        </section>
      </div>
    `;

    const langSelect = document.getElementById("editor-lang-select");
    langSelect.innerHTML = `
      <option value="en">English</option>
      <option value="ar">العربية</option>
    `;
    const pageSelect = document.getElementById("editor-page-select");
    pageSelect.innerHTML = pageKeys
      .map((pid) => `<option value="${pid}">${esc(DATA.translations.en.nav[pid] || pid)}</option>`)
      .join("");

    root.querySelectorAll("[data-editor-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchEditorTab(btn.dataset.editorTab));
    });
    document.getElementById("editor-close").addEventListener("click", closeEditor);
    document.querySelector("[data-editor-close='true']").addEventListener("click", closeEditor);
    langSelect.addEventListener("change", () => {
      state.editor.pageLang = langSelect.value;
      loadEditorDraft();
    });
    pageSelect.addEventListener("change", () => {
      state.editor.pageId = pageSelect.value;
      loadEditorDraft();
    });
    document.getElementById("editor-add-section").addEventListener("click", () => {
      if (!state.editor.draft) return;
      state.editor.draft.sections.push({
        title: uiText("New Section", "قسم جديد"),
        body: uiText("Write your content here.", "اكتب المحتوى هنا.")
      });
      renderSectionEditors();
    });
    document.getElementById("editor-save-page").addEventListener("click", saveEditorDraft);
    document.getElementById("editor-copy-json").addEventListener("click", copyEditorJSON);
    document.getElementById("editor-download-json").addEventListener("click", downloadEditorJSON);
    document.getElementById("editor-apply-json").addEventListener("click", applyEditorJSON);
    document.getElementById("editor-reset-json").addEventListener("click", resetContent);
    document.getElementById("editor-page-title").addEventListener("input", (e) => {
      if (state.editor.draft) state.editor.draft.title = e.target.value;
    });
    document.getElementById("editor-page-subtitle").addEventListener("input", (e) => {
      if (state.editor.draft) state.editor.draft.subtitle = e.target.value;
    });
    document.getElementById("editor-page-prompt").addEventListener("input", (e) => {
      if (state.editor.draft) state.editor.draft.prompt = e.target.value;
    });
  }

  function editorStrings() {
    return {
      title: uiText("Content Studio", "استوديو المحتوى"),
      subtitle: uiText(
        "Edit your page content visually, then use JSON mode for full advanced edits (including projects).",
        "عدّل محتوى الصفحات بصريا، ثم استخدم وضع JSON للتعديلات المتقدمة الكاملة (بما فيها المشاريع)."
      ),
      tabPage: uiText("Page Editor", "محرر الصفحات"),
      tabJson: uiText("JSON Editor", "محرر JSON"),
      lang: uiText("Language", "اللغة"),
      page: uiText("Page", "الصفحة"),
      titleLabel: uiText("Page Title", "عنوان الصفحة"),
      subtitleLabel: uiText("Page Subtitle", "الوصف الفرعي"),
      prompt: uiText("Terminal Prompt", "سطر الطرفية"),
      sections: uiText("Sections", "الأقسام"),
      addSection: uiText("+ Add Section", "+ إضافة قسم"),
      savePage: uiText("Save Page", "حفظ الصفحة"),
      jsonLabel: uiText("Full Content JSON", "JSON كامل للمحتوى"),
      copyJson: uiText("Copy JSON", "نسخ JSON"),
      downloadJson: uiText("Download JSON", "تنزيل JSON"),
      applyJson: uiText("Apply JSON", "تطبيق JSON"),
      reset: uiText("Reset Content", "إعادة المحتوى"),
      remove: uiText("Remove", "حذف"),
      sectionTitle: uiText("Section Title", "عنوان القسم"),
      sectionBody: uiText("Section Body", "نص القسم")
    };
  }

  function syncEditorLocale() {
    const strings = editorStrings();
    const panel = document.getElementById("editor-panel");
    if (!panel) return;
    document.getElementById("editor-title").textContent = strings.title;
    document.getElementById("editor-subtitle").textContent = strings.subtitle;
    panel.querySelector("[data-editor-tab='page']").textContent = strings.tabPage;
    panel.querySelector("[data-editor-tab='json']").textContent = strings.tabJson;
    document.getElementById("editor-lang-label").textContent = strings.lang;
    document.getElementById("editor-page-label").textContent = strings.page;
    document.getElementById("editor-title-label").textContent = strings.titleLabel;
    document.getElementById("editor-subtitle-label").textContent = strings.subtitleLabel;
    document.getElementById("editor-prompt-label").textContent = strings.prompt;
    document.getElementById("editor-sections-label").textContent = strings.sections;
    document.getElementById("editor-add-section").textContent = strings.addSection;
    document.getElementById("editor-save-page").textContent = strings.savePage;
    document.getElementById("editor-json-label").textContent = strings.jsonLabel;
    document.getElementById("editor-copy-json").textContent = strings.copyJson;
    document.getElementById("editor-download-json").textContent = strings.downloadJson;
    document.getElementById("editor-apply-json").textContent = strings.applyJson;
    document.getElementById("editor-reset-json").textContent = strings.reset;
  }

  function setEditorStatus(msg, isError) {
    const status = document.getElementById("editor-status");
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle("error", Boolean(isError));
  }

  function switchEditorTab(tabId) {
    state.editor.tab = tabId === "json" ? "json" : "page";
    document.querySelectorAll("[data-editor-tab]").forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.editorTab === state.editor.tab)
    );
    document.querySelectorAll("[data-editor-pane]").forEach((pane) =>
      pane.classList.toggle("active", pane.dataset.editorPane === state.editor.tab)
    );
    if (state.editor.tab === "json") {
      document.getElementById("editor-json").value = JSON.stringify(sanitizeContent(state.content), null, 2);
    }
  }

  function loadEditorDraft() {
    const langSelect = document.getElementById("editor-lang-select");
    const pageSelect = document.getElementById("editor-page-select");
    if (!langSelect || !pageSelect) return;
    langSelect.value = state.editor.pageLang;
    pageSelect.value = state.editor.pageId;
    state.editor.draft = deepClone(getPageContent(state.editor.pageLang, state.editor.pageId));
    refreshEditorForm();
  }

  function refreshEditorForm() {
    const draft = state.editor.draft;
    if (!draft) return;
    document.getElementById("editor-page-title").value = draft.title || "";
    document.getElementById("editor-page-subtitle").value = draft.subtitle || "";
    document.getElementById("editor-page-prompt").value = draft.prompt || "";
    renderSectionEditors();
    if (state.editor.tab === "json") {
      document.getElementById("editor-json").value = JSON.stringify(sanitizeContent(state.content), null, 2);
    }
  }

  function renderSectionEditors() {
    const strings = editorStrings();
    const wrap = document.getElementById("editor-sections-list");
    const draft = state.editor.draft;
    if (!wrap || !draft) return;
    wrap.innerHTML = (draft.sections || [])
      .map(
        (sec, i) => `<div class="editor-section-item">
          <label>
            <span>${esc(strings.sectionTitle)} ${i + 1}</span>
            <input type="text" data-sec-input="title" data-sec-index="${i}" value="${esc(sec.title || "")}" />
          </label>
          <label>
            <span>${esc(strings.sectionBody)} ${i + 1}</span>
            <textarea rows="3" data-sec-input="body" data-sec-index="${i}">${esc(sec.body || "")}</textarea>
          </label>
          <button class="icon-btn danger-btn" data-remove-sec="${i}" type="button">${esc(strings.remove)}</button>
        </div>`
      )
      .join("");
    wrap.querySelectorAll("[data-sec-input]").forEach((field) => {
      field.addEventListener("input", () => {
        const idx = Number(field.dataset.secIndex);
        if (!draft.sections[idx]) return;
        draft.sections[idx][field.dataset.secInput] = field.value;
      });
    });
    wrap.querySelectorAll("[data-remove-sec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.removeSec);
        draft.sections.splice(idx, 1);
        renderSectionEditors();
      });
    });
  }

  function saveEditorDraft() {
    const lang = state.editor.pageLang;
    const pid = state.editor.pageId;
    const fallback = DATA.translations[lang].pages[pid];
    state.content.pages[lang][pid] = normalizePage(state.editor.draft, fallback);
    persistContent();
    if (lang === state.lang && pid === pageId) renderPage();
    if (pageId === "home") renderProjects();
    applyRevealMotion();
    setEditorStatus(uiText("Page saved.", "تم حفظ الصفحة."), false);
    document.getElementById("editor-json").value = JSON.stringify(sanitizeContent(state.content), null, 2);
  }

  async function copyEditorJSON() {
    try {
      const text = document.getElementById("editor-json").value;
      await navigator.clipboard.writeText(text);
      setEditorStatus(uiText("JSON copied.", "تم نسخ JSON."), false);
    } catch (_) {
      setEditorStatus(uiText("Copy failed.", "فشل النسخ."), true);
    }
  }

  function downloadEditorJSON() {
    try {
      const text = document.getElementById("editor-json").value;
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio-content.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setEditorStatus(uiText("JSON downloaded.", "تم تنزيل JSON."), false);
    } catch (_) {
      setEditorStatus(uiText("Download failed.", "فشل التنزيل."), true);
    }
  }

  function applyEditorJSON() {
    try {
      const raw = JSON.parse(document.getElementById("editor-json").value);
      state.content = sanitizeContent(raw);
      persistContent();
      state.editor.draft = deepClone(getPageContent(state.editor.pageLang, state.editor.pageId));
      render();
      refreshEditorForm();
      applyRevealMotion();
      setEditorStatus(uiText("JSON applied and saved.", "تم تطبيق JSON وحفظه."), false);
    } catch (_) {
      setEditorStatus(uiText("Invalid JSON. Check syntax and try again.", "JSON غير صالح. راجع الصياغة ثم حاول مرة أخرى."), true);
    }
  }

  function openEditor() {
    ensureEditor();
    syncEditorLocale();
    document.getElementById("editor-panel").hidden = false;
    state.editor.pageLang = state.lang;
    state.editor.pageId = pageId;
    switchEditorTab(state.editor.tab);
    loadEditorDraft();
    setEditorStatus(uiText("Tip: Use JSON tab to edit projects too.", "ملاحظة: استخدم تبويب JSON لتعديل المشاريع أيضا."), false);
  }

  function closeEditor() {
    const panel = document.getElementById("editor-panel");
    if (panel) panel.hidden = true;
  }

  function applyRevealMotion() {
    const items = [...document.querySelectorAll(".reveal")];
    if (revealObserver) revealObserver.disconnect();
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );
    items.forEach((el) => {
      el.classList.remove("is-visible");
      revealObserver.observe(el);
    });
  }

  function bindGlobal() {
    document.getElementById("modal-close").onclick = closeModal;
    document.getElementById("project-modal").addEventListener("click", (e) => {
      if (e.target.matches("[data-close-modal='true']")) closeModal();
    });
    document.addEventListener("click", (e) => {
      markNavActive();
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(".dropdown")) {
        document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeEditor();
        const panel = document.getElementById("guided-panel");
        if (panel) panel.hidden = true;
      }
    });
    bindNavActivity();
  }

  function render() {
    renderHeader();
    renderPage();
    renderProjects();
    renderGuided();
    if (document.getElementById("editor-panel")) syncEditorLocale();
    requestAnimationFrame(applyRevealMotion);
  }

  applyTheme(state.theme);
  setLang(state.lang);
  bindGlobal();
})();
