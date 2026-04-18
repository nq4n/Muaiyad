(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady) return;

  const { U } = APP;

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
      wrapper.lang = APP.state.lang;
      wrapper.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
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
        .map((item) => `<li><a class="chip" href="${APP.hrefFor(item.id)}">${U.esc(item.label)}</a></li>`)
        .join("");
    }

    if (journeyPanel && aside.paths_aria_label) journeyPanel.setAttribute("aria-label", aside.paths_aria_label);
    if (journeyPanel) journeyPanel.dataset.dotText = hero.welcome || (APP.state.lang === "ar" ? "أهلاً بكم" : "WELCOME");
    if (aboutTitle) aboutTitle.textContent = about.title || "";
    if (aboutCopy) aboutCopy.innerHTML = APP.toParagraphs(about.body || []);
    if (trainingTitle) trainingTitle.textContent = training.title || "";
    if (siteMapTitle) siteMapTitle.textContent = APP.state.lang === "ar" ? "خريطة صفحات الملف" : "Site Pages Map";
    if (siteMapField) siteMapField.setAttribute("aria-label", APP.state.lang === "ar" ? "خريطة تفاعلية لصفحات الموقع" : "Interactive site pages map");
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
    shell.lang = APP.state.lang;
    shell.dir = APP.state.lang === "ar" ? "rtl" : "ltr";

    if (heroTitle) heroTitle.textContent = hero.title || U.titleFromId(APP.pageId);
    if (heroSubtitle) heroSubtitle.innerHTML = APP.toParagraphs(hero.subtitle || "");
    if (heroPrompt) heroPrompt.textContent = hero.prompt || `$ open ${APP.pageId}`;
    const heroMeta = heroTitle ? heroTitle.closest(".cv-hero-inner")?.querySelector(".cv-hero-meta") : null;
    if (heroTitle?.closest(".cv-hero-inner") && !heroMeta) {
      heroTitle.closest(".cv-hero-inner").insertAdjacentHTML("beforeend", '<div class="cv-hero-meta" id="cv-hero-meta"></div>');
    }
    const heroMetaNode = document.getElementById("cv-hero-meta");
    if (heroMetaNode) {
      heroMetaNode.innerHTML = heroHighlights.map((item) => `<span class="cv-chip">${U.esc(item)}</span>`).join("");
      heroMetaNode.hidden = heroHighlights.length === 0;
    }

    shell.innerHTML = `
      <div class="cv-grid cv-grid--top">
        <section class="section-card cv-section cv-section--profile reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(profile.title || "", profile.icon)}
            <div class="section-copy">${APP.toParagraphs(profile.body || [])}</div>
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
            <div class="section-copy">${APP.toParagraphs(education.body || [])}</div>
          </div>
        </section>

        <section class="section-card cv-section reveal" data-reveal="fade-up">
          <div class="section-block-inner">
            ${cvHeading(teaching.title || "", teaching.icon)}
            <div class="section-copy">${APP.toParagraphs(teaching.body || [])}</div>
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
                <div class="section-copy">${APP.toParagraphs(card.body || [])}</div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section-card cv-section reveal" data-reveal="fade-up">
        <div class="section-block-inner">
          ${cvHeading(activities.title || "", activities.icon)}
          <div class="section-copy">${APP.toParagraphs(activities.body || [])}</div>
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
    const entries = order.map((key) => ({ key, ...(cards[key] || {}) })).filter((card) => card && card.title);
    if (!selector || !display || !entries.length) return;

    if (shell) {
      shell.lang = APP.state.lang;
      shell.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    }

    APP.applyHeroContent({
      title: hero.title || U.titleFromId(APP.pageId),
      subtitle: "",
      prompt: hero.prompt || `$ open ${APP.pageId}`
    });

    const currentKey = entries.some((item) => item.key === selector.dataset.activeKey) ? selector.dataset.activeKey : entries[0].key;
    const renderCard = (key) => {
      const card = entries.find((item) => item.key === key) || entries[0];
      const badges = [...(card.chips ? Object.values(card.chips) : []), ...(card.tools ? Object.values(card.tools) : [])];
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
          <div class="section-copy philosophy-copy">${APP.toParagraphs(card.body || [])}</div>
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

  function renderUnitIntroPage(page) {
    document.querySelectorAll("[data-page-copy]").forEach((element) => {
      const keys = element.dataset.pageCopy.split(".");
      let value = page;
      for (const key of keys) {
        value = value?.[key];
      }
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-page-paragraphs]").forEach((element) => {
      const keys = element.dataset.pageParagraphs.split(".");
      let value = page;
      for (const key of keys) {
        value = value?.[key];
      }
      if (Array.isArray(value)) {
        element.innerHTML = APP.toParagraphs(value);
      }
    });

    const generalDataRows = document.getElementById("unit-general-data-rows");
    const general = page.general_data || {};
    if (generalDataRows && general.table_rows) {
      generalDataRows.innerHTML = general.table_rows
        .map((row) => `<tr><th scope="row">${U.esc(row.label || "")}</th><td>${U.esc(row.value || "")}</td></tr>`)
        .join("");
    }

    const lessonDistRows = document.getElementById("unit-lesson-dist-rows");
    const lessons = page.lesson_distribution || {};
    if (lessonDistRows && lessons.table_rows) {
      lessonDistRows.innerHTML = lessons.table_rows
        .map((row) => `<tr><td>${U.esc(row.num || "")}</td><td>${U.esc(row.lesson || "")}</td><td>${U.esc(row.topics || "")}</td><td>${U.esc(row.sessions || "")}</td></tr>`)
        .join("");
    }
  }

  function renderUnitFooterNav() {
    const root = document.getElementById("unit-footer-nav-root");
    if (!root) return;

    const unitEntry = APP.getNavStructure().find((item) => item.id === "unit-plan");
    const pageIds = ["unit-plan", ...((Array.isArray(unitEntry?.children) ? unitEntry.children : []).filter((id) => id !== "unit-plan"))];
    const isUnitPage = pageIds.includes(APP.pageId);

    root.hidden = !isUnitPage;
    if (!isUnitPage) {
      root.innerHTML = "";
      return;
    }

    const footerTitle = APP.state.lang === "ar" ? "صفحات الوحدة" : "Unit Pages";
    const footerBody = APP.state.lang === "ar"
      ? "استخدم الأزرار التالية للتنقل بين خطة الوحدة وأقسامها العشرة."
      : "Jump between the unit plan and its ten sections from the footer buttons below.";
    const footerNavLabel = APP.state.lang === "ar"
      ? "تنقل تذييل صفحات الوحدة"
      : "Unit pages footer navigation";

    root.lang = APP.state.lang;
    root.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    root.innerHTML = `
      <div class="terminal-card unit-footer-nav reveal" data-reveal="fade-up">
        <div class="section-block-inner unit-footer-nav-inner">
          <header class="unit-footer-nav-head">
            <div class="section-headline">
              <h2 id="unit-footer-nav-title">${U.esc(footerTitle)}</h2>
            </div>
            <div class="section-copy unit-footer-nav-copy">
              <p>${U.esc(footerBody)}</p>
            </div>
          </header>
          <nav class="unit-footer-link-grid" aria-label="${U.esc(footerNavLabel)}">
            ${pageIds
              .map((id) => `
                <a class="chip unit-footer-link ${APP.pageId === id ? "active" : ""}" href="${APP.hrefFor(id)}"${APP.pageId === id ? ' aria-current="page"' : ""}>
                  ${U.esc(APP.navLabel(id))}
                </a>
              `)
              .join("")}
          </nav>
        </div>
      </div>
    `;
    APP.revealSections(root);
  }

  function renderReflectionPapersPage(page) {
    const container = document.querySelector(".content-container");
    const introTitle = document.getElementById("reflection-papers-intro-title");
    const introCopy = document.getElementById("reflection-papers-intro-copy");
    const papersGrid = document.getElementById("reflection-papers-grid");
    const hero = page.hero || {};
    const intro = page.intro || {};
    const papers = page.papers || {};
    const items = Array.isArray(papers.items) ? papers.items : [];

    const driveIcon = `
      <svg class="paper-platform-icon paper-platform-icon--drive" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8.5 2.2h6.3l5.5 9.5h-6.2z" fill="#4285F4"></path>
        <path d="M8.5 2.2 3 11.7l3.2 5.6 5.4-9.4z" fill="#0F9D58"></path>
        <path d="M6.2 17.3h11l3.1-5.6H9.4z" fill="#F4B400"></path>
      </svg>
    `;

    const launchIcon = `
      <svg class="paper-platform-icon paper-platform-icon--launch" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 8h8v8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        <path d="m8 16 8-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      </svg>
    `;

    if (container) {
      container.lang = APP.state.lang;
      container.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    }

    APP.applyHeroContent({
      title: hero.title || U.titleFromId(APP.pageId),
      subtitle: hero.subtitle || "",
      prompt: hero.prompt || `$ open ${APP.pageId}`
    });

    if (introTitle) introTitle.textContent = intro.title || "";
    if (introCopy) introCopy.innerHTML = APP.toParagraphs(intro.body || []);

    if (papersGrid) {
      if (papers.aria_label) papersGrid.setAttribute("aria-label", papers.aria_label);
      papersGrid.innerHTML = items
        .map((item) => {
          const href = item.href || "#";
          const isDrive = item.platform === "drive";
          const extra = isDrive && href !== "#" ? ' target="_blank" rel="noopener noreferrer"' : "";
          const icon = isDrive ? driveIcon : launchIcon;
          return `
            <article class="paper-card reveal" data-reveal="fade-up">
              <div class="terminal-card paper-link-card">
                <div class="paper-number">${U.esc(item.number || "")}</div>
                <h4>${U.esc(item.title || "")}</h4>
                <p class="paper-description">${U.esc(item.description || "")}</p>
                <a href="${U.esc(href)}" class="paper-button ${isDrive ? "paper-button--drive" : "paper-button--internal"}"${extra}>
                  <span class="paper-button-badge" aria-hidden="true">${icon}</span>
                  <span>${U.esc(papers.open_label || "Open Paper")}</span>
                </a>
              </div>
            </article>
          `;
        })
        .join("");
    }
  }

  APP.renderHomePage = renderHomePage;
  APP.renderCvPage = renderCvPage;
  APP.renderPhilosophyPage = renderPhilosophyPage;
  APP.renderUnitIntroPage = renderUnitIntroPage;
  APP.renderUnitFooterNav = renderUnitFooterNav;
  APP.renderReflectionPapersPage = renderReflectionPapersPage;
})();
