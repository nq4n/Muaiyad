(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady) return;

  const { U, PAGE_DATA } = APP;

  function isConceptualReflectionButton(button) {
    const text = `${button?.ref || ""} ${button?.label || ""}`.toLowerCase();
    return text.includes("reflection") || text.includes("تأمل");
  }

  function conceptualAxesButtonKind(button, linkMeta = {}) {
    const text = `${button?.ref || ""} ${button?.label || ""}`.toLowerCase();
    if (isConceptualReflectionButton(button)) return "reflection";
    if (text.includes("video") || text.includes("فيديو")) return "video";
    if (text.includes("certificate") || text.includes("شهادة")) return "certificate";
    if (text.includes("website") || text.includes("site") || text.includes("موقع")) return "site";
    if (linkMeta.pageId) return "internal";
    if (linkMeta.href && linkMeta.href !== "#") return "external";
    return "placeholder";
  }

  function conceptualAxesIcon(kind) {
    const icons = {
      reflection: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20.5H7z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="M14 3.5v4h4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="M10 12h5M10 16h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path></svg>',
      video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="6" width="11" height="12" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"></rect><path d="m11 10.3 3.5 1.9-3.5 1.9Z" fill="currentColor"></path><path d="m16 10 3.5-2v8L16 14" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path></svg>',
      certificate: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9.5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M9.5 13.5 8 20l4-2 4 2-1.5-6.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>',
      site: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M4.5 12h15M12 4.5a12 12 0 0 1 0 15M12 4.5a12 12 0 0 0 0 15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path></svg>',
      internal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h8v8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="m8 16 8-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path></svg>',
      external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="m19 5-8.5 8.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path><path d="M10 7H7.5A2.5 2.5 0 0 0 5 9.5v7A2.5 2.5 0 0 0 7.5 19h7a2.5 2.5 0 0 0 2.5-2.5V14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>',
      placeholder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 7 4-7 4-7-4 7-4Zm-7 8 7 4 7-4M5 12v4l7 4 7-4v-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>'
    };
    return icons[kind] || icons.placeholder;
  }

  function resolveConceptualAxesLink(button, catalog = {}) {
    const meta = U.isObject(catalog?.[button?.ref]) ? catalog[button.ref] : {};
    const href = meta.pageId ? APP.hrefFor(meta.pageId) : (meta.href || "#");
    const kind = conceptualAxesButtonKind(button, meta);
    const isExternal = !meta.pageId && href !== "#" && /^https?:\/\//i.test(href);
    return { href, meta, kind, isExternal };
  }

  function conceptualAxesButtonMarkup(button, catalog) {
    const { href, kind, isExternal } = resolveConceptualAxesLink(button, catalog);
    const extra = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `
      <a class="axes-link-button axes-link-button--${U.esc(kind)}" href="${U.esc(href)}"${extra}>
        <span class="axes-link-label">${U.esc(button?.label || "")}</span>
        <span class="axes-link-icon" aria-hidden="true">${conceptualAxesIcon(kind)}</span>
      </a>
    `;
  }

  function conceptualAxesSectionMarkup(axis, index, catalog) {
    const axisId = axis?.id || `axis-${index + 1}`;
    const primaryButtons = (Array.isArray(axis?.buttons) ? axis.buttons : []).filter((button) => !isConceptualReflectionButton(button));
    const reflectionButtons = (Array.isArray(axis?.buttons) ? axis.buttons : []).filter((button) => isConceptualReflectionButton(button));
    const number = String(index + 1).padStart(2, "0");
    return `
      <section class="axes-section reveal" data-reveal="fade-up" id="${U.esc(axisId)}" aria-labelledby="axes-section-title-${index}">
        <div class="axes-panel">
          <div class="axes-flow">
            <canvas class="axes-link-canvas" aria-hidden="true"></canvas>
            <article class="section-card axes-card">
              <div class="section-block-inner axes-card-inner">
                <header class="axes-card-banner">
                  ${axis?.kicker ? `<p class="axes-card-kicker">${U.esc(axis.kicker)}</p>` : ""}
                  <div class="axes-card-title-row">
                    <h2 class="axes-card-title" id="axes-section-title-${index}">${U.esc(axis?.title || "")}</h2>
                    <span class="axes-card-number" aria-hidden="true">${U.esc(number)}</span>
                  </div>
                </header>
                <div class="section-copy axes-card-copy">${APP.toParagraphs(axis?.body || [])}</div>
              </div>
            </article>
            <div class="axes-link-stage">
              ${primaryButtons.length ? `<div class="axes-link-list axes-link-list--primary">${primaryButtons.map((button) => conceptualAxesButtonMarkup(button, catalog)).join("")}</div>` : ""}
              ${reflectionButtons.length ? `<div class="axes-link-list axes-link-list--reflection">${reflectionButtons.map((button) => conceptualAxesButtonMarkup(button, catalog)).join("")}</div>` : ""}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function drawConceptualAxesPolyline(context, points) {
    if (!context || points.length < 2) return;
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) {
      context.lineTo(points[index][0], points[index][1]);
    }
    context.stroke();
  }

  function initConceptualAxesConnectors(root) {
    const flows = [...root.querySelectorAll(".axes-flow")];
    if (!flows.length) return () => {};

    const drawFlow = (flow) => {
      const canvas = flow.querySelector(".axes-link-canvas");
      const card = flow.querySelector(".axes-card");
      if (!canvas || !card) return;

      const rect = flow.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(Math.round(rect.width * ratio), 1);
      canvas.height = Math.max(Math.round(rect.height * ratio), 1);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const styles = getComputedStyle(flow);
      const lineColor = styles.getPropertyValue("--axes-line").trim() || "rgba(214, 177, 109, 0.34)";
      const lineWidth = Number.parseFloat(styles.getPropertyValue("--axes-line-width")) || 2.2;
      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";

      const relativeRect = (node) => {
        const nodeRect = node.getBoundingClientRect();
        return {
          top: nodeRect.top - rect.top,
          right: nodeRect.right - rect.left,
          bottom: nodeRect.bottom - rect.top,
          left: nodeRect.left - rect.left,
          width: nodeRect.width,
          height: nodeRect.height,
          centerX: nodeRect.left - rect.left + (nodeRect.width * 0.5),
          centerY: nodeRect.top - rect.top + (nodeRect.height * 0.5)
        };
      };

      const cardRect = relativeRect(card);
      const primaryRects = [...flow.querySelectorAll(".axes-link-list--primary .axes-link-button")].map(relativeRect);
      const reflectionRect = flow.querySelector(".axes-link-list--reflection .axes-link-button");
      const reflection = reflectionRect ? relativeRect(reflectionRect) : null;
      const cardAnchorX = cardRect.centerX;
      const cardAnchorY = cardRect.bottom;

      if (!primaryRects.length && reflection) {
        drawConceptualAxesPolyline(context, [
          [cardAnchorX, cardAnchorY],
          [cardAnchorX, reflection.top - 10]
        ]);
        return;
      }

      if (primaryRects.length) {
        const minPrimaryTop = Math.min(...primaryRects.map((item) => item.top));
        const topRailY = cardAnchorY + Math.max(26, Math.min(54, (minPrimaryTop - cardAnchorY) * 0.42 || 36));
        const primaryLeft = Math.min(...primaryRects.map((item) => item.centerX));
        const primaryRight = Math.max(...primaryRects.map((item) => item.centerX));

        drawConceptualAxesPolyline(context, [
          [cardAnchorX, cardAnchorY],
          [cardAnchorX, topRailY]
        ]);

        if (primaryRects.length > 1) {
          drawConceptualAxesPolyline(context, [
            [primaryLeft, topRailY],
            [primaryRight, topRailY]
          ]);
        }

        primaryRects.forEach((item) => {
          drawConceptualAxesPolyline(context, [
            [item.centerX, topRailY],
            [item.centerX, item.top - 8]
          ]);
        });

        if (reflection) {
          const collectorY = Math.max(...primaryRects.map((item) => item.bottom)) + 22;
          const collectorLeft = Math.min(primaryLeft, reflection.centerX);
          const collectorRight = Math.max(primaryRight, reflection.centerX);

          primaryRects.forEach((item) => {
            drawConceptualAxesPolyline(context, [
              [item.centerX, item.bottom],
              [item.centerX, collectorY]
            ]);
          });

          drawConceptualAxesPolyline(context, [
            [collectorLeft, collectorY],
            [collectorRight, collectorY]
          ]);

          drawConceptualAxesPolyline(context, [
            [reflection.centerX, collectorY],
            [reflection.centerX, reflection.top - 8]
          ]);
        }
      }
    };

    const resizeHandler = () => flows.forEach(drawFlow);
    let observer = null;
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(resizeHandler);
      flows.forEach((flow) => observer.observe(flow));
    } else {
      window.addEventListener("resize", resizeHandler);
    }

    requestAnimationFrame(resizeHandler);
    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resizeHandler);
    };
  }

  function renderConceptualAxesPage(page) {
    const shell = document.getElementById("conceptual-axes-shell");
    const titleEl = document.getElementById("axes-page-title");
    const noteEl = document.getElementById("axes-page-note");
    const copyEl = document.getElementById("axes-page-copy");
    const navLabelEl = document.getElementById("axes-page-nav-label");
    const navHintEl = document.getElementById("axes-page-nav-hint");
    const navEl = document.getElementById("axes-page-nav");
    const promptEl = document.getElementById("axes-page-prompt");
    if (!shell) return;

    shell._axesCleanup?.();

    const hero = U.isObject(page?.hero) ? page.hero : {};
    const axes = Array.isArray(page?.axes) ? page.axes : [];
    const pageSet = U.isObject(PAGE_DATA[APP.pageId]) ? PAGE_DATA[APP.pageId] : {};
    const catalog = U.isObject(pageSet?.shared?.linkCatalog) ? pageSet.shared.linkCatalog : {};

    if (titleEl) titleEl.textContent = hero.title || U.titleFromId(APP.pageId);
    if (noteEl) {
      noteEl.textContent = hero.subtitle || "";
      noteEl.hidden = !hero.subtitle;
    }
    if (copyEl) copyEl.innerHTML = APP.toParagraphs(hero.body || []);
    if (navLabelEl) {
      navLabelEl.textContent = hero.access_label || "";
      navLabelEl.hidden = !hero.access_label;
    }
    if (navHintEl) {
      navHintEl.textContent = hero.access_hint || "";
      navHintEl.hidden = !hero.access_hint;
    }
    if (navEl) {
      navEl.setAttribute("aria-label", hero.access_label || hero.title || U.titleFromId(APP.pageId));
      navEl.innerHTML = axes.map((axis, index) => `
        <a class="axes-nav-chip" href="#${U.esc(axis?.id || `axis-${index + 1}`)}">
          <span class="axes-nav-index">${U.esc(String(index + 1).padStart(2, "0"))}</span>
          <span>${U.esc(axis?.title || "")}</span>
        </a>
      `).join("");
    }
    if (promptEl) promptEl.textContent = hero.prompt || `$ open ${APP.pageId}`;

    shell.lang = APP.state.lang;
    shell.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    shell.innerHTML = axes.map((axis, index) => conceptualAxesSectionMarkup(axis, index, catalog)).join("");
    APP.revealSections(shell);
    shell._axesCleanup = initConceptualAxesConnectors(shell);
  }

  function bindStaticPageCopy() {
    const rawPage = APP.getPageDataset(APP.pageId, APP.state.lang);
    if (!rawPage) return;
    if (APP.pageId === "home") {
      APP.renderHomePage(rawPage);
      APP.initHomeJourneyField();
      APP.initHomeSiteMap();
      return;
    }
    if (APP.pageId === "cv") {
      APP.renderCvPage(rawPage);
      return;
    }
    if (APP.pageId === "philosophy") {
      APP.renderPhilosophyPage(rawPage);
      return;
    }
    if (APP.pageId === "unit-1-intro") {
      APP.renderUnitIntroPage(rawPage);
      return;
    }
    if (APP.pageId === "conceptual-axes") {
      renderConceptualAxesPage(rawPage);
      return;
    }
    if (APP.pageId === "reflection-papers") {
      APP.renderReflectionPapersPage(rawPage);
      return;
    }
  }

  function sectionMarkup(section) {
    const type = section.type || "text";
    const anim = section.animation || "fade-up";
    const revealClass = anim === "none" ? "" : " reveal";
    const animAttr = anim === "none" ? "" : `data-reveal="${anim}"`;
    const header = section.title ? `<div class="section-headline"><h2>${U.esc(section.title)}</h2></div>` : "";
    let content = "";

    if (type === "text") content = `<div class="section-copy">${APP.toParagraphs(section.body)}</div>`;
    else if (type === "image") content = `<figure class="section-media">${section.imageSrc ? `<img src="${U.esc(section.imageSrc)}" alt="${U.esc(section.imageAlt || section.title)}" loading="lazy" />` : ""}${section.imageCaption ? `<figcaption class="section-caption">${U.esc(section.imageCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${APP.toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "video") content = `<figure class="section-media">${section.videoSrc ? `<video class="section-video" controls preload="metadata" ${section.videoPoster ? `poster="${U.esc(section.videoPoster)}"` : ""}><source src="${U.esc(section.videoSrc)}" /></video>` : ""}${section.videoCaption ? `<figcaption class="section-caption">${U.esc(section.videoCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${APP.toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "audio") content = `<figure class="section-media">${section.audioSrc ? `<audio class="section-audio" controls preload="metadata"><source src="${U.esc(section.audioSrc)}" /></audio>` : ""}${section.audioCaption ? `<figcaption class="section-caption">${U.esc(section.audioCaption)}</figcaption>` : ""}</figure>${section.body ? `<div class="section-copy">${APP.toParagraphs(section.body)}</div>` : ""}`;
    else if (type === "html") content = `<div class="section-html">${section.html || ""}</div>`;

    return `<section class="section-block ${revealClass}" ${animAttr}><div class="section-block-inner">${header}${content}</div></section>`;
  }

  function renderPageContent() {
    if (APP.usesStaticRender()) {
      const sections = document.getElementById("page-sections");
      bindStaticPageCopy();
      APP.revealSections(sections);
      const heroSection = document.querySelector(".page-hero.reveal");
      if (heroSection) {
        heroSection.classList.add("is-visible");
      }
      return;
    }

    const page = APP.getPageContent(APP.state.lang, APP.pageId);
    const sectionList = Array.isArray(page.sections) ? page.sections : [];
    const hasBuilder = typeof page.builderHtml === "string" && page.builderHtml.trim();
    APP.applyHeroContent(page);
    const sections = document.getElementById("page-sections");
    if (!sections) return;

    sections.hidden = !hasBuilder && sectionList.length === 0;
    sections.innerHTML = hasBuilder
      ? `<style>${page.builderCss || ""}</style>${APP.sanitizeCustomHTML(page.builderHtml)}`
      : sectionList.map((section, index) => sectionMarkup(section, index)).join("");
    APP.revealSections(sections);
  }

  APP.renderConceptualAxesPage = renderConceptualAxesPage;
  APP.bindStaticPageCopy = bindStaticPageCopy;
  APP.renderPageContent = renderPageContent;
  APP.sectionMarkup = sectionMarkup;
})();
