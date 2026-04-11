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

  const SITE_DATA = window.PORTFOLIO_SITE_DATA || null;
  const LEGACY_DATA = window.PORTFOLIO_DATA || null;
  const PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};
  const DATA = SITE_DATA || LEGACY_DATA;
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
  const getPageDataset = (pid = pageId, lang = state.lang) => {
    const pageSet = PAGE_DATA[pid];
    if (!pageSet) return null;
    return pageSet[lang] || pageSet[lang === "ar" ? "en" : "ar"] || null;
  };

  let appliedThemeVars = [];
  let navIdleTimer = null, navLastActivity = 0, navActivityBound = false;
  const NAV_IDLE_MS = 2800;

  function activeSet() {
    const set = new Set([pageId]);
    if (pageId === "framework-axes") set.add("reflection-papers");
    getNavStructure().forEach((item) => { if (Array.isArray(item.children) && item.children.includes(pageId)) set.add(item.id); });
    return set;
  }

  function toParagraphs(value) {
    const parts = Array.isArray(value)
      ? value
      : String(value || "")
          .split(/\n\s*\n/)
          .map((item) => item.trim())
          .filter(Boolean);
    return parts.map((part) => `<p>${U.esc(part)}</p>`).join("");
  }

  function normalizeStructuredPage(raw, pid = pageId) {
    if (!U.isObject(raw)) return null;
    if (U.isObject(raw.hero)) {
      const sections = Object.entries(raw)
        .filter(([key]) => key !== "hero")
        .map(([key, section], index) => {
          const fallbackTitle = t("ui.sectionFallback", "Section {n}").replace("{n}", String(index + 1));
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
    const pageData = normalizeStructuredPage(getPageDataset(pid, lang), pid);
    if (pageData) return { ...pageData, builderHtml: "", builderCss: "" };
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

  function applyHeroContent(page) {
    const hero = document.querySelector(".hero-card");
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const hasHero = Boolean(String(page.title || "").trim() || String(page.subtitle || "").trim() || String(page.prompt || "").trim());
    if (hero) hero.hidden = !hasHero;
    if (title) title.textContent = page.title || "";
    if (subtitle) subtitle.textContent = page.subtitle || "";
    if (prompt) prompt.textContent = page.prompt || "";
  }

  function revealSections(root) {
    if (!root) return;
    requestAnimationFrame(() => {
      root.querySelectorAll(".reveal").forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), i * 80);
      });
    });
  }

  function renderHomePage(page) {
    const wrapper = document.querySelector(".home-stack");
    const quickLinks = document.getElementById("home-quick-links");
    const quickLinksNav = document.getElementById("home-quick-links-nav");
    const aboutTitle = document.getElementById("home-about-title");
    const aboutCopy = document.getElementById("home-about-copy");
    const trainingTitle = document.getElementById("home-training-title");
    const trainingRows = document.getElementById("home-training-rows");
    const journeyPanel = document.getElementById("home-journey-panel");
    const siteMapTitle = document.getElementById("home-site-map-title");
    const siteMapField = document.getElementById("home-site-map-field");
    const hero = page.hero || {};
    const quick = page.quick_links || {};
    const about = page.about || {};
    const training = page.field_training || {};
    const aside = page.aside || {};

    if (wrapper) {
      wrapper.lang = state.lang;
      wrapper.dir = state.lang === "ar" ? "rtl" : "ltr";
    }

    document.querySelectorAll("[data-home-field]").forEach((node) => {
      const key = node.dataset.homeField;
      node.textContent = hero[key] || "";
    });

    if (quickLinksNav && quick.aria_label) quickLinksNav.setAttribute("aria-label", quick.aria_label);
    if (quickLinks) {
      quickLinks.innerHTML = [
        { id: "cv", label: quick.cv },
        { id: "philosophy", label: quick.philosophy }
      ]
        .filter((item) => item.label)
        .map((item) => `<li><a class="chip" href="${hrefFor(item.id)}">${U.esc(item.label)}</a></li>`)
        .join("");
    }

    if (journeyPanel && aside.paths_aria_label) journeyPanel.setAttribute("aria-label", aside.paths_aria_label);
    if (journeyPanel) journeyPanel.dataset.dotText = hero.welcome || (state.lang === "ar" ? "أهلاً بكم" : "WELCOME");
    if (aboutTitle) aboutTitle.textContent = about.title || "";
    if (aboutCopy) aboutCopy.innerHTML = toParagraphs(about.body || []);
    if (trainingTitle) trainingTitle.textContent = training.title || "";
    if (siteMapTitle) siteMapTitle.textContent = state.lang === "ar" ? "خريطة صفحات الملف" : "Site Pages Map";
    if (siteMapField) siteMapField.setAttribute("aria-label", state.lang === "ar" ? "خريطة تفاعلية لصفحات الموقع" : "Interactive site pages map");
    if (trainingRows) {
      trainingRows.innerHTML = Object.values(training.rows || {})
        .map((row) => `<tr><th scope="row">${U.esc(row.label || "")}</th><td>${U.esc(row.value || "")}</td></tr>`)
        .join("");
    }
  }

  function renderCvPage(page) {
    const shell = document.getElementById("cv-shell");
    const heroTitle = document.getElementById("cv-page-title");
    const heroSubtitle = document.getElementById("cv-page-subtitle");
    const heroPrompt = document.getElementById("cv-page-prompt");
    const hero = page.hero || {};
    const profile = page.professional_profile || {};
    const info = page.personal_academic_information || {};
    const education = page.education || {};
    const teaching = page.teaching_training_experience || {};
    const skills = page.skills || {};
    const activities = page.activities_courses || {};
    const facts = Array.isArray(info.items) ? info.items : [];
    const skillCards = Array.isArray(skills.cards) ? skills.cards : [];
    const heroHighlights = Array.isArray(hero.highlights) ? hero.highlights : [];

    const cvIcon = (name) => {
      const icons = {
        profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.86 0-7 1.79-7 4v1h14v-1c0-2.21-3.14-4-7-4Z"/></svg>',
        identity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/></svg>',
        education: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-4 9 4-9 4-9-4Z"/><path d="M7 11v4c0 1.66 2.24 3 5 3s5-1.34 5-3v-4"/></svg>',
        teaching: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H4z"/><path d="M9 19h6M12 16v3"/></svg>',
        skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M18.36 5.64l-2.83 2.83M8.47 15.53l-2.83 2.83"/><circle cx="12" cy="12" r="3.5"/></svg>',
        activity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V8M12 19V5M19 19v-9"/></svg>',
        name: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 1.57-6 3.5V19h12v-1.5C18 15.57 15.31 14 12 14Z"/></svg>',
        id: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v10H4z"/><path d="M8 10h8M8 14h4"/></svg>',
        specialization: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14M7 16V8l5-3 5 3v8"/></svg>',
        college: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-5 9 5"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 18h18"/></svg>',
        university: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-4 9 4-9 4-9-4Z"/><path d="M6 12v5M18 12v5M9 13.5v3.5M15 13.5v3.5M3 19h18"/></svg>',
        semester: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z"/><path d="M8 12h3M13 12h3M8 16h3"/></svg>',
        school: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l8-4 8 4v11"/><path d="M9 20v-5h6v5M8 11h.01M16 11h.01"/></svg>',
        professional: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20h10M9 20v-6h6v6M6 8h12l-1 6H7L6 8Zm2-3h8v3H8z"/></svg>',
        visual: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
        technology: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8M9 4v3l-3 5a5 5 0 1 0 12 0l-3-5V4M8 17h8"/></svg>',
        pedagogy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h11a2 2 0 0 1 2 2v10H8a2 2 0 0 0-2 2Z"/><path d="M8 7H6a2 2 0 0 0-2 2v10h13"/></svg>'
      };
      return icons[name] || icons.skills;
    };

    const cvHeading = (title, iconName) => `
      <div class="section-headline cv-heading">
        <span class="cv-icon cv-icon--heading" aria-hidden="true">${cvIcon(iconName)}</span>
        <h2>${U.esc(title || "")}</h2>
      </div>
    `;

    if (!shell) return;
    shell.lang = state.lang;
    shell.dir = state.lang === "ar" ? "rtl" : "ltr";

    if (heroTitle) heroTitle.textContent = hero.title || U.titleFromId(pageId);
    if (heroSubtitle) heroSubtitle.innerHTML = toParagraphs(hero.subtitle || "");
    if (heroPrompt) heroPrompt.textContent = hero.prompt || `$ open ${pageId}`;
    const heroMeta = heroTitle ? heroTitle.closest(".cv-hero-inner")?.querySelector(".cv-hero-meta") : null;
    if (heroTitle?.closest(".cv-hero-inner") && !heroMeta) {
      heroTitle.closest(".cv-hero-inner").insertAdjacentHTML("beforeend", '<div class="cv-hero-meta" id="cv-hero-meta"></div>');
    }
    const heroMetaNode = document.getElementById("cv-hero-meta");
    if (heroMetaNode) {
      heroMetaNode.innerHTML = heroHighlights
        .map((item) => `<span class="cv-chip">${U.esc(item)}</span>`)
        .join("");
      heroMetaNode.hidden = heroHighlights.length === 0;
    }

    shell.innerHTML = `
      <div class="cv-grid cv-grid--top">
        <section class="section-card cv-section cv-section--profile reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(profile.title || "", profile.icon)}
            <div class="section-copy">${toParagraphs(profile.body || [])}</div>
          </div>
        </section>

        <section class="section-card cv-section cv-section--info reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(info.title || "", info.icon)}
            ${info.intro ? `<p class="cv-section-intro">${U.esc(info.intro)}</p>` : ""}
            <div class="cv-facts-grid">
              ${facts.map((item) => `
                <article class="cv-fact-card">
                  <span class="cv-icon cv-icon--fact" aria-hidden="true">${cvIcon(item.icon)}</span>
                  <p class="cv-fact-label">${U.esc(item.label || "")}</p>
                  <h3 class="cv-fact-value">${U.esc(item.value || "")}</h3>
                </article>
              `).join("")}
            </div>
          </div>
        </section>
      </div>

      <div class="cv-grid cv-grid--narrative">
        <section class="section-card cv-section reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(education.title || "", education.icon)}
            <div class="section-copy">${toParagraphs(education.body || [])}</div>
          </div>
        </section>

        <section class="section-card cv-section reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(teaching.title || "", teaching.icon)}
            <div class="section-copy">${toParagraphs(teaching.body || [])}</div>
          </div>
        </section>
      </div>

      <section class="section-card cv-section cv-section--skills reveal" data-reveal="fade-up">
        <div class="section-block-inner">
          ${cvHeading(skills.title || "", skills.icon)}
          ${skills.intro ? `<p class="cv-section-intro">${U.esc(skills.intro)}</p>` : ""}
          <div class="cv-skill-grid">
            ${skillCards.map((card) => `
              <article class="cv-skill-card">
                <div class="cv-skill-head">
                  <span class="cv-icon cv-icon--skill" aria-hidden="true">${cvIcon(card.icon)}</span>
                  <h3 class="cv-skill-title">${U.esc(card.title || "")}</h3>
                </div>
                <div class="section-copy">${toParagraphs(card.body || [])}</div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section-card cv-section reveal" data-reveal="fade-up">
        <div class="section-block-inner">
          ${cvHeading(activities.title || "", activities.icon)}
          <div class="section-copy">${toParagraphs(activities.body || [])}</div>
        </div>
      </section>
    `;
  }

  function renderPhilosophyPage(page) {
    const shell = document.querySelector(".philosophy-shell");
    const selector = document.getElementById("philosophy-selector");
    const display = document.getElementById("philosophy-display");
    const hero = page.page && page.page.hero ? page.page.hero : {};
    const cards = page.page && page.page.cards ? page.page.cards : {};
    const order = ["entry", "learning", "teacher", "learner", "diversity", "technology", "assessment", "growth", "values"];
    const entries = order
      .map((key) => ({ key, ...(cards[key] || {}) }))
      .filter((card) => card && card.title);
    if (!selector || !display || !entries.length) return;

    if (shell) {
      shell.lang = state.lang;
      shell.dir = state.lang === "ar" ? "rtl" : "ltr";
    }

    applyHeroContent({
      title: hero.title || U.titleFromId(pageId),
      subtitle: "",
      prompt: hero.prompt || `$ open ${pageId}`
    });

    const currentKey = entries.some((item) => item.key === selector.dataset.activeKey) ? selector.dataset.activeKey : entries[0].key;

    const renderCard = (key) => {
      const card = entries.find((item) => item.key === key) || entries[0];
      const badges = [
        ...(card.chips ? Object.values(card.chips) : []),
        ...(card.tools ? Object.values(card.tools) : [])
      ];
      const points = card.points ? Object.values(card.points) : [];
      const extraPoints = card.extra_points ? Object.values(card.extra_points) : [];
      selector.dataset.activeKey = card.key;
      selector.querySelectorAll(".philosophy-selector-btn").forEach((button) => {
        const active = button.dataset.key === card.key;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      display.classList.remove("is-visible");
      display.innerHTML = `
        <article class="philosophy-display-card">
          ${card.kicker ? `<p class="philosophy-card-kicker">${U.esc(card.kicker)}</p>` : ""}
          <div class="section-headline"><h2>${U.esc(card.title)}</h2></div>
          <div class="section-copy philosophy-copy">${toParagraphs(card.body || [])}</div>
          ${badges.length ? `<div class="philosophy-tags">${badges.map((item) => `<span class="philosophy-tag">${U.esc(item)}</span>`).join("")}</div>` : ""}
          ${points.length ? `<ul class="philosophy-points">${points.map((item) => `<li>${U.esc(item)}</li>`).join("")}</ul>` : ""}
          ${extraPoints.length ? `<div class="philosophy-extra">${card.extra_title ? `<h3>${U.esc(card.extra_title)}</h3>` : ""}<ul class="philosophy-points">${extraPoints.map((item) => `<li>${U.esc(item)}</li>`).join("")}</ul></div>` : ""}
          ${card.closing_note ? `<p class="philosophy-note">${U.esc(card.closing_note)}</p>` : ""}
        </article>
      `;
      requestAnimationFrame(() => display.classList.add("is-visible"));
    };

    selector.innerHTML = entries
      .map((card) => `<button class="philosophy-selector-btn${card.key === currentKey ? " active" : ""}" type="button" role="tab" aria-selected="${card.key === currentKey ? "true" : "false"}" data-key="${card.key}">${U.esc(card.title)}</button>`)
      .join("");

    selector.onclick = (event) => {
      const button = event.target.closest(".philosophy-selector-btn");
      if (!button) return;
      renderCard(button.dataset.key);
    };

    renderCard(currentKey);
  }

  function bindStaticPageCopy() {
    const rawPage = getPageDataset(pageId, state.lang);
    if (!rawPage) return;
    if (pageId === "home") {
      renderHomePage(rawPage);
      initHomeJourneyField();
      initHomeSiteMap();
      return;
    }
    if (pageId === "cv") {
      renderCvPage(rawPage);
      return;
    }
    if (pageId === "philosophy") {
      renderPhilosophyPage(rawPage);
    }
  }

  function renderPageContent() {
    if (usesStaticRender()) {
      const sections = document.getElementById("page-sections");
      bindStaticPageCopy();
      revealSections(sections);
      return;
    }

    const page = getPageContent(state.lang, pageId);
    const sectionList = Array.isArray(page.sections) ? page.sections : [];
    const hasBuilder = typeof page.builderHtml === "string" && page.builderHtml.trim();
    applyHeroContent(page);
    const sections = document.getElementById("page-sections");
    if (sections) {
      sections.hidden = !hasBuilder && sectionList.length === 0;
      sections.innerHTML = hasBuilder
        ? `<style>${page.builderCss || ""}</style>${sanitizeCustomHTML(page.builderHtml)}`
        : sectionList.map((s, i) => sectionMarkup(s, i)).join("");
      revealSections(sections);
    }
  }

  function sectionMarkup(section) {
    const type = section.type || "text";
    const anim = section.animation || "fade-up";
    const revealClass = anim === "none" ? "" : " reveal";
    const animAttr = anim === "none" ? "" : `data-reveal="${anim}"`;
    const header = section.title ? `<div class="section-headline"><h2>${U.esc(section.title)}</h2></div>` : "";
    let content = "";
    if (type === "text") content = `<div class="section-copy">${toParagraphs(section.body)}</div>`;
    else if (type === "image") content = `<figure class="section-media">${section.imageSrc ? `<img src="${U.esc(section.imageSrc)}" alt="${U.esc(section.imageAlt || section.title)}" loading="lazy" />` : ""}${section.imageCaption ? `<figcaption class="section-caption">${U.esc(section.imageCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "video") content = `<figure class="section-media">${section.videoSrc ? `<video class="section-video" controls preload="metadata" ${section.videoPoster ? `poster="${U.esc(section.videoPoster)}"` : ""}><source src="${U.esc(section.videoSrc)}" /></video>` : ""}${section.videoCaption ? `<figcaption class="section-caption">${U.esc(section.videoCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "audio") content = `<figure class="section-media">${section.audioSrc ? `<audio class="section-audio" controls preload="metadata"><source src="${U.esc(section.audioSrc)}" /></audio>` : ""}${section.audioCaption ? `<figcaption class="section-caption">${U.esc(section.audioCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "html") content = `<div class="section-html">${section.html || ""}</div>`;
    return `<section class="section-block ${revealClass}" ${animAttr}><div class="section-block-inner">${header}${content}</div></section>`;
  }

  function initHomeJourneyField() {
    const field = document.getElementById("home-journey-field");
    const panel = document.getElementById("home-journey-panel");
    const wordmark = document.getElementById("home-journey-wordmark");
    const nextWordText = panel?.dataset.dotText || (state.lang === "ar" ? "أهلاً بكم" : "WELCOME");
    if (!field || !wordmark) return;
    if (field.dataset.ready === "1") {
      field._journeySetText?.(nextWordText);
      return;
    }
    field.dataset.ready = "1";

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: true });
    const wordContext = wordmark.getContext("2d", { alpha: true });
    if (!context || !wordContext) return;
    field.appendChild(canvas);

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const wordSample = document.createElement("canvas");
    const wordSampleContext = wordSample.getContext("2d", { alpha: true, willReadFrequently: true });
    let width = 0;
    let height = 0;
    let wordWidth = 0;
    let wordHeight = 0;
    let wordOffsetX = 0;
    let wordOffsetY = 0;
    let wordText = nextWordText;
    let wordPoints = [];
    let rafId = 0;

    const buildWordPoints = () => {
      if (!wordSampleContext || !wordWidth || !wordHeight) return;
      const text = String(wordText || "").trim();
      wordPoints = [];
      wordContext.clearRect(0, 0, wordWidth, wordHeight);
      if (!text) return;

      wordSample.width = wordWidth;
      wordSample.height = wordHeight;
      wordSampleContext.clearRect(0, 0, wordWidth, wordHeight);

      const styles = getComputedStyle(document.documentElement);
      const fontFamily = styles.getPropertyValue("--font-ar").trim() || "Tahoma, Segoe UI, sans-serif";
      const isArabic = /[\u0600-\u06FF]/.test(text);
      let fontSize = isArabic ? Math.floor(wordHeight * 0.82) : Math.floor(wordHeight * 0.9);
      const paddingX = isArabic ? 16 : 18;

      do {
        wordSampleContext.clearRect(0, 0, wordWidth, wordHeight);
        wordSampleContext.font = `700 ${fontSize}px ${fontFamily}`;
        wordSampleContext.textBaseline = "middle";
        wordSampleContext.textAlign = "center";
        wordSampleContext.direction = isArabic ? "rtl" : "ltr";
        wordSampleContext.fillStyle = "#ffffff";
        wordSampleContext.fillText(text, Math.round(wordWidth * 0.5), Math.round(wordHeight * 0.54));
        fontSize -= 2;
      } while (fontSize > 18 && wordSampleContext.measureText(text).width > wordWidth - paddingX * 2);

      const image = wordSampleContext.getImageData(0, 0, wordWidth, wordHeight).data;
      const gap = wordWidth < 220 ? 3 : wordWidth < 320 ? 4 : 5;
      for (let y = 0; y < wordHeight; y += gap) {
        for (let x = 0; x < wordWidth; x += gap) {
          const alpha = image[(y * wordWidth + x) * 4 + 3];
          if (alpha < 110) continue;
          wordPoints.push({
            x,
            y,
            seed: ((x * 13.13) + (y * 7.31)) % 360
          });
        }
      }
    };

    const setWordText = (value) => {
      wordText = String(value || "").trim();
      buildWordPoints();
      if (prefersReducedMotion) draw(performance.now());
    };

    const resize = () => {
      const rect = field.getBoundingClientRect();
      const wordRect = wordmark.getBoundingClientRect();
      width = Math.max(Math.floor(rect.width), 1);
      height = Math.max(Math.floor(rect.height), 1);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      wordWidth = Math.max(Math.floor(wordRect.width), 1);
      wordHeight = Math.max(Math.floor(wordRect.height), 1);
      wordOffsetX = wordRect.left - rect.left;
      wordOffsetY = wordRect.top - rect.top;
      wordmark.width = wordWidth * pixelRatio;
      wordmark.height = wordHeight * pixelRatio;
      wordmark.style.width = `${wordWidth}px`;
      wordmark.style.height = `${wordHeight}px`;
      wordContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      buildWordPoints();
    };

    const draw = (time) => {
      if (!width || !height) resize();
      context.clearRect(0, 0, width, height);
      wordContext.clearRect(0, 0, wordWidth, wordHeight);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      if (wordPoints.length) {
        const localPointerX = pointer.x - wordOffsetX;
        const localPointerY = pointer.y - wordOffsetY;
        const repelRadius = wordWidth < 220 ? 36 : 48;
        wordPoints.forEach((point, index) => {
          const driftX = prefersReducedMotion ? 0 : Math.sin((time * 0.0015) + point.seed) * 0.7;
          const driftY = prefersReducedMotion ? 0 : Math.cos((time * 0.0013) + point.seed + index * 0.02) * 0.7;
          const dx = point.x - localPointerX;
          const dy = point.y - localPointerY;
          const distance = Math.hypot(dx, dy) || 1;
          const influence = Math.max(0, 1 - distance / repelRadius);
          const repel = influence * influence * 18;
          const drawX = point.x + driftX + (dx / distance) * repel;
          const drawY = point.y + driftY + (dy / distance) * repel;
          const alpha = 0.46 + influence * 0.48;
          const radius = 1.1 + influence * 0.7;
          wordContext.fillStyle = `rgba(247, 226, 177, ${alpha})`;
          wordContext.beginPath();
          wordContext.arc(drawX, drawY, radius, 0, Math.PI * 2);
          wordContext.fill();
        });
      }

      const cols = width < 700 ? 10 : 14;
      const rows = width < 700 ? 6 : 8;
      const nodes = [];
      const gapX = width / (cols - 1);
      const gapY = height / (rows - 1);
      const waveScale = prefersReducedMotion ? 3 : 10;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const baseX = col * gapX;
          const baseY = row * gapY;
          const wave = Math.sin(time * 0.0012 + col * 0.48 + row * 0.22) * waveScale
            + Math.cos(time * 0.001 + row * 0.4) * waveScale * 0.52;
          const dx = (pointer.x - baseX) / Math.max(width, 1);
          const dy = (pointer.y - baseY) / Math.max(height, 1);
          const influence = Math.max(0, 1 - Math.hypot(dx * 1.8, dy * 1.8));
          const offsetX = (pointer.x - baseX) * influence * 0.035;
          const offsetY = wave - influence * 14;
          nodes.push({
            x: baseX + offsetX,
            y: baseY + offsetY,
            row,
            col,
            glow: influence
          });
        }
      }

      context.lineWidth = 1;
      nodes.forEach((node, index) => {
        const right = nodes[index + 1];
        const below = nodes[index + cols];
        if (right && right.row === node.row) {
          context.strokeStyle = `rgba(214, 177, 109, ${0.08 + (node.glow + right.glow) * 0.12})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(right.x, right.y);
          context.stroke();
        }
        if (below) {
          context.strokeStyle = `rgba(214, 177, 109, ${0.04 + (node.glow + below.glow) * 0.08})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(below.x, below.y);
          context.stroke();
        }
      });

      nodes.forEach((node) => {
        context.fillStyle = `rgba(247, 241, 229, ${0.45 + node.glow * 0.42})`;
        context.beginPath();
        context.arc(node.x, node.y, 1.25 + node.glow * 1.4, 0, Math.PI * 2);
        context.fill();
      });

      if (!prefersReducedMotion) rafId = window.requestAnimationFrame(draw);
    };

    const handleMove = (event) => {
      const rect = field.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      if (prefersReducedMotion) draw(performance.now());
    };

    const handleLeave = () => {
      pointer.tx = width * 0.5;
      pointer.ty = height * 0.5;
      if (prefersReducedMotion) draw(performance.now());
    };

    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    resize();
    handleLeave();
    setWordText(nextWordText);
    field.addEventListener("pointermove", handleMove, { passive: true });
    field.addEventListener("pointerleave", handleLeave);
    if (resizeObserver) resizeObserver.observe(field);
    if (prefersReducedMotion) draw(0);
    else rafId = window.requestAnimationFrame(draw);

    field._journeySetText = setWordText;
    field._journeyCleanup = () => {
      window.cancelAnimationFrame(rafId);
      field.removeEventListener("pointermove", handleMove);
      field.removeEventListener("pointerleave", handleLeave);
      resizeObserver?.disconnect();
    };
  }

  function initHomeSiteMapLegacy() {
    const field = document.getElementById("home-site-map-field");
    const nodeLayer = document.getElementById("home-site-map-nodes");
    if (!field || !nodeLayer) return;

    const defs = [
      { id: "home", center: true },
      { id: "cv", angle: 236, orbitX: 1.08, orbitY: 1.05 },
      { id: "unit-plan", angle: 312, orbitX: 1.08, orbitY: 1.02 },
      { id: "reflection-papers", angle: 18, orbitX: 1.1, orbitY: 0.82 },
      { id: "conceptual-axes", angle: 54, orbitX: 1.02, orbitY: 0.98 },
      { id: "framework-axes", angle: 82, orbitX: 1.04, orbitY: 1.2 },
      { id: "philosophy", angle: 112, orbitX: 0.5, orbitY: 1.38 },
      { id: "graduation-project", angle: 146, orbitX: 1.1, orbitY: 1.03 },
      { id: "other", angle: 188, orbitX: 1.04, orbitY: 0.82, branch: true },
      { id: "other-values", parent: "other", branchIndex: 0 },
      { id: "other-workshop", parent: "other", branchIndex: 1 },
      { id: "other-growth", parent: "other", branchIndex: 2 },
      { id: "other-peer-visits", parent: "other", branchIndex: 3 },
      { id: "other-parent-communication", parent: "other", branchIndex: 4 }
    ];

    const parentById = defs.reduce((acc, def) => {
      if (def.parent) acc[def.id] = def.parent;
      return acc;
    }, {});

    const childIdsByParent = defs.reduce((acc, def) => {
      if (!def.parent) return acc;
      if (!acc[def.parent]) acc[def.parent] = [];
      acc[def.parent].push(def.id);
      return acc;
    }, {});

    const links = [
      ["home", "cv"],
      ["home", "unit-plan"],
      ["home", "reflection-papers"],
      ["home", "conceptual-axes"],
      ["home", "framework-axes"],
      ["home", "philosophy"],
      ["home", "graduation-project"],
      ["home", "other"],
      ["other", "other-values"],
      ["other", "other-workshop"],
      ["other", "other-growth"],
      ["other", "other-peer-visits"],
      ["other", "other-parent-communication"]
    ];

    if (!field._siteMapReady) {
      field._siteMapReady = true;
      nodeLayer.innerHTML = "";
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;
      field.prepend(canvas);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      let activeId = null;
      let width = 0;
      let height = 0;
      let rafId = 0;

      const syncMetrics = () => {
        nodes.forEach((node) => {
          node.width = Math.max(node.el.offsetWidth || 0, node.center ? 128 : 110);
          node.height = Math.max(node.el.offsetHeight || 0, node.center ? 56 : 46);
        });
      };

      const updateActiveState = () => {
        const activeParent = activeId ? parentById[activeId] : null;
        nodeLayer.querySelectorAll(".home-site-map-node").forEach((node) => {
          const id = node.dataset.id;
          node.classList.toggle("is-active", id === activeId || id === activeParent);
        });
      };

      const clampPoint = (node, x, y) => {
        const padX = width < 720 ? 10 : 16;
        const padY = width < 720 ? 10 : 16;
        const halfW = (node.width || 0) * 0.5;
        const halfH = (node.height || 0) * 0.5;
        return {
          x: Math.min(Math.max(x, padX + halfW), width - padX - halfW),
          y: Math.min(Math.max(y, padY + halfH), height - padY - halfH)
        };
      };

      const linkIsActive = (from, to) => {
        if (!activeId) return false;
        const activeParent = parentById[activeId] || null;
        if (activeId === from || activeId === to) return true;
        if (activeParent && (from === activeParent || to === activeParent)) return true;
        return activeId === from && Array.isArray(childIdsByParent[from]) && childIdsByParent[from].includes(to);
      };

      const nodes = defs.map((def, index) => {
        const link = document.createElement("a");
        link.className = `home-site-map-node${def.center ? " is-center" : ""}${def.branch ? " is-branch" : ""}${def.parent ? " is-child" : ""}`;
        link.dataset.id = def.id;
        link.href = hrefFor(def.id);
        link.textContent = navLabel(def.id);
        const activate = () => {
          activeId = def.id;
          updateActiveState();
        };
        const deactivate = () => {
          activeId = null;
          updateActiveState();
        };
        link.addEventListener("mouseenter", activate);
        link.addEventListener("mouseleave", deactivate);
        link.addEventListener("focus", activate);
        link.addEventListener("blur", deactivate);
        nodeLayer.appendChild(link);
        return {
          ...def,
          el: link,
          phase: 0.8 + index * 0.72
        };
      });

      const resize = () => {
        const rect = field.getBoundingClientRect();
        width = Math.max(Math.floor(rect.width), 1);
        height = Math.max(Math.floor(rect.height), 1);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        syncMetrics();
        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        pointer.x = width * 0.5;
        pointer.y = height * 0.5;
      };

      const drawLine = (a, b, active) => {
        const midX = (a.x + b.x) * 0.5;
        const midY = (a.y + b.y) * 0.5;
        const curveX = midX + (b.y - a.y) * 0.08;
        const curveY = midY - (b.x - a.x) * 0.08;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.quadraticCurveTo(curveX, curveY, b.x, b.y);
        context.strokeStyle = active ? "rgba(214, 177, 109, 0.52)" : "rgba(214, 177, 109, 0.16)";
        context.lineWidth = active ? 1.8 : 1;
        context.stroke();
      };

      const render = (time) => {
        if (!width || !height) resize();
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        context.clearRect(0, 0, width, height);

        const centerX = width * 0.5;
        const centerY = height * (width < 720 ? 0.42 : 0.5);
        const radiusX = width * (width < 720 ? 0.28 : 0.31);
        const radiusY = height * (width < 720 ? 0.25 : 0.31);
        const driftX = ((pointer.x / Math.max(width, 1)) - 0.5) * 18;
        const driftY = ((pointer.y / Math.max(height, 1)) - 0.5) * 14;
        const positions = {};
        const otherChildren = nodes.filter((node) => node.parent === "other");

        nodes.forEach((node, index) => {
          const floatX = reduced ? 0 : Math.sin(time * 0.00075 + node.phase) * 6;
          const floatY = reduced ? 0 : Math.cos(time * 0.00065 + node.phase * 1.2) * 6;

          if (node.parent) return;
          const angle = ((node.angle || 0) * Math.PI) / 180;
          const x = node.center
            ? centerX + driftX * 0.12
            : centerX + (Math.cos(angle) * radiusX * (node.orbitX || 1)) + (driftX * 0.28) + floatX;
          const y = node.center
            ? centerY + driftY * 0.12
            : centerY + (Math.sin(angle) * radiusY * (node.orbitY || 1)) + (driftY * 0.22) + floatY;
          positions[node.id] = clampPoint(node, x, y);
        });

        if (positions.other) {
          const tallestChild = otherChildren.reduce((max, node) => Math.max(max, node.height || 0), 0);
          const branchGap = tallestChild + (width < 720 ? 10 : 14);
          const branchOffsetX = width < 720 ? Math.max(width * 0.12, 56) : Math.max(width * 0.1, 88);
          const branchTotalHeight = branchGap * Math.max(otherChildren.length - 1, 0);
          const branchStartY = Math.min(
            Math.max(positions.other.y - (branchGap * 0.65), 16),
            height - 16 - branchTotalHeight
          );

          otherChildren.forEach((node, index) => {
            const branchFloatX = reduced ? 0 : Math.sin(time * 0.00055 + node.phase) * 3.5;
            const branchFloatY = reduced ? 0 : Math.cos(time * 0.00048 + node.phase) * 2.5;
            const x = positions.other.x - branchOffsetX + branchFloatX;
            const y = branchStartY + (index * branchGap) + branchFloatY;
            positions[node.id] = clampPoint(node, x, y);
          });
        }

        links.forEach(([from, to]) => {
          if (!positions[from] || !positions[to]) return;
          const active = linkIsActive(from, to);
          drawLine(positions[from], positions[to], active);
        });

        nodes.forEach((node, index) => {
          const point = positions[node.id];
          if (!point) return;
          const active = node.id === activeId || parentById[activeId] === node.id;
          const scale = active ? 1.05 : node.center ? 1 : node.parent ? 0.96 : 0.98 + ((index % 3) * 0.01);
          node.el.style.left = `${point.x}px`;
          node.el.style.top = `${point.y}px`;
          node.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
          node.el.style.zIndex = active ? "2" : node.center ? "2" : "1";
          context.fillStyle = active ? "rgba(214, 177, 109, 0.95)" : "rgba(247, 241, 229, 0.72)";
          context.beginPath();
          context.arc(point.x, point.y, node.id === "home" ? 3.4 : node.parent ? 2 : 2.1, 0, Math.PI * 2);
          context.fill();
        });

        if (!reduced) rafId = window.requestAnimationFrame(render);
      };

      const handleMove = (event) => {
        const rect = field.getBoundingClientRect();
        pointer.tx = event.clientX - rect.left;
        pointer.ty = event.clientY - rect.top;
      };

      const handleLeave = () => {
        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        activeId = null;
        nodeLayer.querySelectorAll(".home-site-map-node").forEach((node) => node.classList.remove("is-active"));
      };

      const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
      field.addEventListener("pointermove", handleMove, { passive: true });
      field.addEventListener("pointerleave", handleLeave);
      resizeObserver?.observe(field);
      resize();
      field._siteMapSyncMetrics = syncMetrics;
      field._siteMapResize = resize;
      field._siteMapRender = render;
      field._siteMapReduced = reduced;
      if (reduced) render(0);
      else rafId = window.requestAnimationFrame(render);

      field._siteMapCleanup = () => {
        window.cancelAnimationFrame(rafId);
        field.removeEventListener("pointermove", handleMove);
        field.removeEventListener("pointerleave", handleLeave);
        resizeObserver?.disconnect();
      };

      field._siteMapNodes = nodes;
    }

    (field._siteMapNodes || []).forEach((node) => {
      node.el.textContent = navLabel(node.id);
      node.el.href = hrefFor(node.id);
      node.el.classList.toggle("is-center", node.id === "home");
      node.el.classList.toggle("is-branch", node.id === "other");
      node.el.classList.toggle("is-child", parentById[node.id] === "other");
    });
    field._siteMapResize?.();
    if (field._siteMapReduced) field._siteMapRender?.(0);
  }

  function initHomeSiteMap() {
    const field = document.getElementById("home-site-map-field");
    const nodeLayer = document.getElementById("home-site-map-nodes");
    if (!field || !nodeLayer) return;

    const rows = [
      ["cv", "unit-plan"],
      ["other-values", "reflection-papers"],
      ["other-workshop", "conceptual-axes"],
      ["other-growth", "framework-axes"],
      ["other-peer-visits", "graduation-project"],
      ["other-parent-communication", "philosophy"]
    ];

    const defs = [
      { id: "home", center: true },
      ...rows.flatMap(([leftId, rightId], row) => ([
        { id: leftId, side: "left", row },
        { id: rightId, side: "right", row }
      ]))
    ];
    const links = defs.filter((def) => !def.center).map((def) => ["home", def.id]);

    if (!field._siteMapReadyBalanced) {
      field._siteMapCleanup?.();
      field._siteMapReadyBalanced = true;
      field._siteMapNodes = null;
      nodeLayer.innerHTML = "";
      field.querySelector("canvas")?.remove();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;
      field.prepend(canvas);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      let activeId = null;
      let width = 0;
      let height = 0;
      let rafId = 0;

      const nodes = defs.map((def, index) => {
        const link = document.createElement("a");
        link.className = `home-site-map-node${def.center ? " is-center" : ""}`;
        link.dataset.id = def.id;
        link.href = hrefFor(def.id);
        link.textContent = navLabel(def.id);
        const activate = () => {
          activeId = def.id;
          updateActiveState();
        };
        const deactivate = () => {
          activeId = null;
          updateActiveState();
        };
        link.addEventListener("mouseenter", activate);
        link.addEventListener("mouseleave", deactivate);
        link.addEventListener("focus", activate);
        link.addEventListener("blur", deactivate);
        nodeLayer.appendChild(link);
        return {
          ...def,
          el: link,
          phase: 0.8 + index * 0.72
        };
      });

      const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));

      const updateActiveState = () => {
        nodeLayer.querySelectorAll(".home-site-map-node").forEach((node) => {
          node.classList.toggle("is-active", node.dataset.id === activeId);
        });
      };

      const syncMetrics = () => {
        nodes.forEach((node) => {
          node.width = Math.max(node.el.offsetWidth || 0, node.center ? 128 : 110);
          node.height = Math.max(node.el.offsetHeight || 0, node.center ? 56 : 46);
        });
      };

      const clampPoint = (node, x, y) => {
        const padX = width < 720 ? 10 : 18;
        const padY = width < 720 ? 10 : 18;
        const halfW = (node.width || 0) * 0.5;
        const halfH = (node.height || 0) * 0.5;
        return {
          x: Math.min(Math.max(x, padX + halfW), width - padX - halfW),
          y: Math.min(Math.max(y, padY + halfH), height - padY - halfH)
        };
      };

      const resize = () => {
        const rect = field.getBoundingClientRect();
        width = Math.max(Math.floor(rect.width), 1);
        height = Math.max(Math.floor(rect.height), 1);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        syncMetrics();
        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        pointer.x = width * 0.5;
        pointer.y = height * 0.5;
      };

      const drawLine = (a, b, active) => {
        const midX = (a.x + b.x) * 0.5;
        const midY = (a.y + b.y) * 0.5;
        const curveX = midX + (b.y - a.y) * 0.08;
        const curveY = midY - (b.x - a.x) * 0.08;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.quadraticCurveTo(curveX, curveY, b.x, b.y);
        context.strokeStyle = active ? "rgba(214, 177, 109, 0.52)" : "rgba(214, 177, 109, 0.16)";
        context.lineWidth = active ? 1.8 : 1;
        context.stroke();
      };

      const render = (time) => {
        if (!width || !height) resize();
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        context.clearRect(0, 0, width, height);

        const centerNode = nodesById.home;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const driftX = ((pointer.x / Math.max(width, 1)) - 0.5) * (width < 720 ? 8 : 12);
        const driftY = ((pointer.y / Math.max(height, 1)) - 0.5) * (width < 720 ? 6 : 10);
        const positions = {};
        const rowPairs = rows.map(([leftId, rightId]) => [nodesById[leftId], nodesById[rightId]]);
        const rowGap = width < 720 ? 10 : 14;
        const rowHeights = rowPairs.map(([leftNode, rightNode]) => Math.max(leftNode?.height || 0, rightNode?.height || 0));
        const totalRowsHeight = rowHeights.reduce((sum, value) => sum + value, 0) + (rowGap * Math.max(rowHeights.length - 1, 0));
        const startY = Math.max((height - totalRowsHeight) * 0.5, width < 720 ? 12 : 18);
        const leftX = width * (width < 720 ? 0.2 : 0.22);
        const rightX = width * (width < 720 ? 0.8 : 0.78);

        positions.home = clampPoint(centerNode, centerX + (driftX * 0.22), centerY + (driftY * 0.22));

        let cursorY = startY;
        rowPairs.forEach(([leftNode, rightNode], index) => {
          const rowHeight = rowHeights[index];
          const y = cursorY + (rowHeight * 0.5) + (driftY * 0.14);
          if (leftNode) positions[leftNode.id] = clampPoint(leftNode, leftX + (driftX * 0.1), y);
          if (rightNode) positions[rightNode.id] = clampPoint(rightNode, rightX + (driftX * 0.1), y);
          cursorY += rowHeight + rowGap;
        });

        links.forEach(([from, to]) => {
          if (!positions[from] || !positions[to]) return;
          const active = activeId === from || activeId === to;
          drawLine(positions[from], positions[to], active);
        });

        nodes.forEach((node) => {
          const point = positions[node.id];
          if (!point) return;
          const pulse = reduced || node.center ? 0 : Math.sin(time * 0.0007 + node.phase) * 0.006;
          const active = node.id === activeId;
          const scale = active ? 1.04 : node.center ? 1 : 0.985 + pulse;
          node.el.style.left = `${point.x}px`;
          node.el.style.top = `${point.y}px`;
          node.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
          node.el.style.zIndex = active ? "2" : node.center ? "2" : "1";
          context.fillStyle = active ? "rgba(214, 177, 109, 0.95)" : "rgba(247, 241, 229, 0.72)";
          context.beginPath();
          context.arc(point.x, point.y, node.id === "home" ? 3.4 : 2.1, 0, Math.PI * 2);
          context.fill();
        });

        if (!reduced) rafId = window.requestAnimationFrame(render);
      };

      const handleMove = (event) => {
        const rect = field.getBoundingClientRect();
        pointer.tx = event.clientX - rect.left;
        pointer.ty = event.clientY - rect.top;
      };

      const handleLeave = () => {
        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        activeId = null;
        updateActiveState();
      };

      const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
      field.addEventListener("pointermove", handleMove, { passive: true });
      field.addEventListener("pointerleave", handleLeave);
      resizeObserver?.observe(field);
      resize();
      field._siteMapResize = resize;
      field._siteMapRender = render;
      field._siteMapReduced = reduced;
      if (reduced) render(0);
      else rafId = window.requestAnimationFrame(render);

      field._siteMapCleanup = () => {
        window.cancelAnimationFrame(rafId);
        field.removeEventListener("pointermove", handleMove);
        field.removeEventListener("pointerleave", handleLeave);
        resizeObserver?.disconnect();
      };

      field._siteMapNodes = nodes;
    }

    (field._siteMapNodes || []).forEach((node) => {
      node.el.textContent = navLabel(node.id);
      node.el.href = hrefFor(node.id);
      node.el.classList.toggle("is-center", node.id === "home");
      node.el.classList.remove("is-branch", "is-child");
    });
    field._siteMapResize?.();
    if (field._siteMapReduced) field._siteMapRender?.(0);
  }

  function renderHeader() {
    const current = activeSet();
    const structure = getNavStructure();
    const profile = getProfile();
    const brandName = state.lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
    const brandLines = brandCardLines(state.lang);
    const navItem = (id) => `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${hrefFor(id)}"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${U.esc(navLabel(id))}</span></a></li>`;
    const navDrop = (id, children) => {
      const childItems = children.filter((c) => c !== id);
      if (!childItems.length) return navItem(id);
      const sub = childItems.map((c) => `<li><a class="submenu-link ${current.has(c) ? "active" : ""}" href="${hrefFor(c)}"><span class="nav-icon" aria-hidden="true">${navIcon(c)}</span><span class="nav-label">${U.esc(navLabel(c))}</span></a></li>`).join("");
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
