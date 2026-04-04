(() => {
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const pageId = document.body.dataset.page || "home";
  const path = window.location.pathname.replace(/\\/g, "/");
  const rootPrefix = /\/pages\//i.test(path) ? "../" : "";
  const visualAssetPrefix = `${rootPrefix}assets/vendor/grapesjs/`;
  const CONTENT_KEY = "portfolio.content.v2";
  const LEGACY_CONTENT_KEY = "portfolio.content.v1";
  const SHOW_KEY = "portfolio.show";
  const NAV_CLI_KEY = "portfolio.nav.cli";
  const NAV_IDLE_MS = 2800;

  let revealObserver = null;
  let navIdleTimer = null;
  let navLastActivity = 0;
  let navActivityBound = false;
  let appliedThemeVars = [];
  let previewPending = false;

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  const SECTION_TYPES = ["text", "image", "video", "audio", "gallery", "html"];
  const SECTION_ANIMATIONS = ["fade-up", "slide-left", "slide-right", "zoom-in", "none"];
  const SECTION_LAYOUTS = ["stack", "split"];
  const SECTION_SPANS = ["full", "wide", "half", "third"];
  const SECTION_ALIGNS = ["start", "center", "end"];
  const SECTION_THEMES = ["default", "accent", "outline", "plain"];
  const SECTION_PADDINGS = ["sm", "md", "lg"];
  const uniqueStrings = (list) =>
    Array.from(
      new Set(
        (Array.isArray(list) ? list : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      )
    );

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const galleryStates = {};

  function initGalleryNavigation() {
    document.querySelectorAll(".section-gallery").forEach((gallery) => {
      const id = gallery.dataset.galleryId;
      if (!galleryStates[id]) {
        galleryStates[id] = { current: 0 };
      }
      updateGalleryDisplay(id);
    });
  }

  function updateGalleryDisplay(id) {
    const gallery = document.querySelector(`[data-gallery-id="${id}"]`);
    if (!gallery) return;
    const state = galleryStates[id];
    const slides = gallery.querySelectorAll(".section-gallery-slide");
    const counter = document.querySelector(`[data-gallery-counter="${id}"]`);
    if (!slides.length) return;
    state.current = Math.max(0, Math.min(state.current, slides.length - 1));
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === state.current);
    });
    if (counter) counter.textContent = `${state.current + 1} / ${slides.length}`;
  }

  function handleGalleryAction(id, action) {
    if (!galleryStates[id]) return;
    const slides = document.querySelectorAll(`[data-gallery-id="${id}"] .section-gallery-slide`);
    if (!slides.length) return;
    if (action === "prev") {
      galleryStates[id].current = (galleryStates[id].current - 1 + slides.length) % slides.length;
    } else if (action === "next") {
      galleryStates[id].current = (galleryStates[id].current + 1) % slides.length;
    }
    updateGalleryDisplay(id);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function createMediaUploadHandler(section, fieldKey, accept, previewSelector) {
    return async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith(accept.split("/")[0])) return;
      try {
        const base64 = await fileToBase64(file);
        section[fieldKey] = base64;
        renderPageCanvas();
        syncLivePagePreview();
      } catch (_) {
        setEditorStatus(t("editor.uploadFailed", "Upload failed."), true);
      }
    };
  }

  function triggerFileInput(accept) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.click();
    return input;
  }
  const readNested = (obj, key) =>
    key.split(".").reduce((acc, part) => (isObject(acc) && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : null), obj);
  const formatText = (template, vars) =>
    String(template || "").replace(/\{(\w+)\}/g, (_, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ""));
  const titleFromId = (id) =>
    String(id || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  function buildDefaultContent() {
    return deepClone(DATA);
  }

  function fallbackPageConfig(pid, label) {
    return { title: label || titleFromId(pid), subtitle: "", prompt: "$ open section", sections: [], builderHtml: "", builderCss: "" };
  }

  function normalizeSectionType(type, fallback = "text") {
    return SECTION_TYPES.includes(type) ? type : SECTION_TYPES.includes(fallback) ? fallback : "text";
  }

  function normalizeSectionAnimation(animation, fallback = "fade-up") {
    return SECTION_ANIMATIONS.includes(animation) ? animation : SECTION_ANIMATIONS.includes(fallback) ? fallback : "fade-up";
  }

  function normalizeSectionLayout(layout, fallback = "stack") {
    return SECTION_LAYOUTS.includes(layout) ? layout : SECTION_LAYOUTS.includes(fallback) ? fallback : "stack";
  }

  function normalizeSectionSpan(span, fallback = "full") {
    return SECTION_SPANS.includes(span) ? span : SECTION_SPANS.includes(fallback) ? fallback : "full";
  }

  function normalizeSectionAlign(align, fallback = "start") {
    return SECTION_ALIGNS.includes(align) ? align : SECTION_ALIGNS.includes(fallback) ? fallback : "start";
  }

  function normalizeSectionTheme(theme, fallback = "default") {
    return SECTION_THEMES.includes(theme) ? theme : SECTION_THEMES.includes(fallback) ? fallback : "default";
  }

  function normalizeSectionPadding(padding, fallback = "md") {
    return SECTION_PADDINGS.includes(padding) ? padding : SECTION_PADDINGS.includes(fallback) ? fallback : "md";
  }

  function createSectionTemplate(type = "text") {
    return {
      type: normalizeSectionType(type, "text"),
      title: "",
      body: "",
      imageSrc: "",
      imageAlt: "",
      imageCaption: "",
      videoSrc: "",
      videoPoster: "",
      videoCaption: "",
      audioSrc: "",
      audioCaption: "",
      galleryImages: [],
      html: "",
      animation: "fade-up",
      layout: "stack",
      span: "full",
      align: "start",
      theme: "default",
      padding: "md",
      bgColor: "",
      textColor: "",
      borderColor: ""
    };
  }

  function normalizeSection(section, fallbackSection) {
    const src = isObject(section) ? section : {};
    const fb = isObject(fallbackSection) ? fallbackSection : createSectionTemplate("text");
    const srcStyle = isObject(src.style) ? src.style : {};
    const fbStyle = isObject(fb.style) ? fb.style : {};
    const type = normalizeSectionType(src.type, fb.type || "text");
    const toArr = (v) => (Array.isArray(v) ? v.filter((item) => isObject(item)) : []);
    const out = {
      type,
      title: typeof src.title === "string" ? src.title : fb.title || "",
      body: typeof src.body === "string" ? src.body : fb.body || "",
      imageSrc:
        typeof src.imageSrc === "string"
          ? src.imageSrc
          : typeof src.image === "string"
            ? src.image
            : fb.imageSrc || "",
      imageAlt: typeof src.imageAlt === "string" ? src.imageAlt : fb.imageAlt || "",
      imageCaption: typeof src.imageCaption === "string" ? src.imageCaption : fb.imageCaption || "",
      videoSrc: typeof src.videoSrc === "string" ? src.videoSrc : fb.videoSrc || "",
      videoPoster: typeof src.videoPoster === "string" ? src.videoPoster : fb.videoPoster || "",
      videoCaption: typeof src.videoCaption === "string" ? src.videoCaption : fb.videoCaption || "",
      audioSrc: typeof src.audioSrc === "string" ? src.audioSrc : fb.audioSrc || "",
      audioCaption: typeof src.audioCaption === "string" ? src.audioCaption : fb.audioCaption || "",
      galleryImages: toArr(src.galleryImages || fb.galleryImages || []),
      html: typeof src.html === "string" ? src.html : fb.html || "",
      animation: normalizeSectionAnimation(src.animation, fb.animation || "fade-up"),
      layout: normalizeSectionLayout(src.layout ?? srcStyle.layout, fb.layout ?? fbStyle.layout ?? "stack"),
      span: normalizeSectionSpan(src.span ?? srcStyle.span, fb.span ?? fbStyle.span ?? "full"),
      align: normalizeSectionAlign(src.align ?? srcStyle.align, fb.align ?? fbStyle.align ?? "start"),
      theme: normalizeSectionTheme(src.theme ?? srcStyle.theme, fb.theme ?? fbStyle.theme ?? "default"),
      padding: normalizeSectionPadding(src.padding ?? srcStyle.padding, fb.padding ?? fbStyle.padding ?? "md"),
      bgColor:
        typeof (src.bgColor ?? srcStyle.bgColor) === "string" ? String(src.bgColor ?? srcStyle.bgColor) : fb.bgColor || fbStyle.bgColor || "",
      textColor:
        typeof (src.textColor ?? srcStyle.textColor) === "string"
          ? String(src.textColor ?? srcStyle.textColor)
          : fb.textColor || fbStyle.textColor || "",
      borderColor:
        typeof (src.borderColor ?? srcStyle.borderColor) === "string"
          ? String(src.borderColor ?? srcStyle.borderColor)
          : fb.borderColor || fbStyle.borderColor || ""
    };
    return out.title || out.body || out.imageSrc || out.imageCaption || out.videoSrc || out.audioSrc || out.galleryImages.length || out.html ? out : null;
  }

  function normalizeSections(sections, fallbackSections) {
    const base = (Array.isArray(fallbackSections) ? fallbackSections : []).map((section) => normalizeSection(section)).filter(Boolean);
    if (!Array.isArray(sections) || !sections.length) return deepClone(base);
    const cleaned = sections.map((section, index) => normalizeSection(section, base[index])).filter(Boolean);
    return cleaned.length ? cleaned : deepClone(base);
  }

  function normalizePage(page, fallbackPage) {
    const src = isObject(page) ? page : {};
    const fb = isObject(fallbackPage) ? fallbackPage : fallbackPageConfig("", "");
    return {
      title: typeof src.title === "string" ? src.title : fb.title,
      subtitle: typeof src.subtitle === "string" ? src.subtitle : fb.subtitle,
      prompt: typeof src.prompt === "string" ? src.prompt : fb.prompt,
      sections: normalizeSections(src.sections, fb.sections),
      builderHtml:
        typeof src.builderHtml === "string"
          ? src.builderHtml
          : typeof src.visualHtml === "string"
            ? src.visualHtml
            : fb.builderHtml || "",
      builderCss:
        typeof src.builderCss === "string"
          ? src.builderCss
          : typeof src.visualCss === "string"
            ? src.visualCss
            : fb.builderCss || ""
    };
  }

  function normalizeStringMap(source, fallback, allowExtra) {
    const src = isObject(source) ? source : {};
    const fb = isObject(fallback) ? fallback : {};
    const out = {};
    Object.keys(fb).forEach((key) => {
      out[key] = typeof src[key] === "string" ? src[key] : fb[key];
    });
    if (allowExtra) {
      Object.entries(src).forEach(([key, value]) => {
        if (typeof value === "string") out[key] = value;
      });
    }
    return out;
  }

  function normalizeProfile(profile, fallback) {
    const src = isObject(profile) ? profile : {};
    const fb = isObject(fallback) ? fallback : {};
    return {
      name_en: typeof src.name_en === "string" ? src.name_en : fb.name_en || "",
      name_ar: typeof src.name_ar === "string" ? src.name_ar : fb.name_ar || "",
      role_en: typeof src.role_en === "string" ? src.role_en : fb.role_en || "",
      role_ar: typeof src.role_ar === "string" ? src.role_ar : fb.role_ar || "",
      bio_en: typeof src.bio_en === "string" ? src.bio_en : fb.bio_en || "",
      bio_ar: typeof src.bio_ar === "string" ? src.bio_ar : fb.bio_ar || "",
      location: typeof src.location === "string" ? src.location : fb.location || "",
      links: {
        github: typeof src.links?.github === "string" ? src.links.github : fb.links?.github || "#",
        linkedin: typeof src.links?.linkedin === "string" ? src.links.linkedin : fb.links?.linkedin || "#",
        email: typeof src.links?.email === "string" ? src.links.email : fb.links?.email || "#"
      }
    };
  }

  function normalizeProject(project, idx, fallback) {
    const source = isObject(project) ? project : {};
    const fb = isObject(fallback) ? fallback : {};
    const toArr = (value, def) => (Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : def || []);
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

  function normalizeProjects(list, fallback) {
    const defaults = Array.isArray(fallback) ? fallback : [];
    const incoming = Array.isArray(list) ? list : defaults;
    const out = incoming.map((project, idx) => normalizeProject(project, idx, defaults[idx]));
    return out.length ? out : deepClone(defaults);
  }

  function normalizePageMap(map, fallback) {
    const out = isObject(fallback) ? deepClone(fallback) : {};
    if (!isObject(map)) return out;
    Object.entries(map).forEach(([id, href]) => {
      if (typeof id === "string" && typeof href === "string" && href.trim()) out[id] = href.trim();
    });
    return out;
  }

  function normalizeRouteMap(routeMap, fallback, pageMap) {
    const validPages = new Set(Object.keys(pageMap));
    const out = {};
    Object.entries(isObject(fallback) ? fallback : {}).forEach(([alias, target]) => {
      if (typeof target === "string" && validPages.has(target)) out[String(alias).toLowerCase()] = target;
    });
    if (!isObject(routeMap)) return out;
    Object.entries(routeMap).forEach(([alias, target]) => {
      if (typeof alias === "string" && typeof target === "string" && validPages.has(target)) out[alias.toLowerCase()] = target;
    });
    return out;
  }

  function normalizeNavStructure(structure, fallback, pageMap) {
    const validPages = new Set(Object.keys(pageMap));
    const normalizeItem = (item) => {
      if (!isObject(item) || typeof item.id !== "string" || !validPages.has(item.id)) return null;
      const children = uniqueStrings(item.children).filter((child) => validPages.has(child) && child !== item.id);
      return children.length ? { id: item.id, children } : { id: item.id };
    };
    const fb = (Array.isArray(fallback) ? fallback : []).map(normalizeItem).filter(Boolean);
    const incoming = (Array.isArray(structure) ? structure : []).map(normalizeItem).filter(Boolean);
    return incoming.length ? incoming : fb;
  }

  function normalizeCommandList(list, fallback) {
    const incoming = uniqueStrings(Array.isArray(list) && list.length ? list : fallback);
    return incoming.length ? incoming : ["help", "home"];
  }

  function normalizeThemeList(list, fallback, palettes) {
    const fromList = uniqueStrings(Array.isArray(list) && list.length ? list : fallback);
    const fromPalettes = uniqueStrings(Object.keys(isObject(palettes) ? palettes : {}));
    return uniqueStrings(fromList.length ? fromList : fromPalettes);
  }

  function normalizeThemePalettes(palettes, fallback, themeIds) {
    const allThemes = uniqueStrings([...(themeIds || []), ...Object.keys(isObject(fallback) ? fallback : {}), ...Object.keys(isObject(palettes) ? palettes : {})]);
    const out = {};
    allThemes.forEach((themeId) => {
      out[themeId] = {};
      Object.entries(isObject(fallback?.[themeId]) ? fallback[themeId] : {}).forEach(([key, value]) => {
        if (/^--[\w-]+$/.test(key) && typeof value === "string") out[themeId][key] = value;
      });
      Object.entries(isObject(palettes?.[themeId]) ? palettes[themeId] : {}).forEach(([key, value]) => {
        if (/^--[\w-]+$/.test(key) && typeof value === "string") out[themeId][key] = value;
      });
    });
    return out;
  }

  function normalizeGuidedOptions(options, fallback) {
    const src = isObject(options) ? options : {};
    const fb = isObject(fallback) ? fallback : {};
    const takeList = (value, def) => {
      const list = uniqueStrings(Array.isArray(value) && value.length ? value : def);
      return list.length ? list : [];
    };
    return {
      purpose: takeList(src.purpose, fb.purpose),
      vibe: takeList(src.vibe, fb.vibe),
      show: takeList(src.show, fb.show),
      vibeThemeMap: normalizeStringMap(src.vibeThemeMap, fb.vibeThemeMap || {}, true)
    };
  }

  function normalizeLanguagePack(pack, fallback, pageIds, themeIds) {
    const src = isObject(pack) ? pack : {};
    const fb = isObject(fallback) ? fallback : {};
    const guidedSrc = isObject(src.guided) ? src.guided : {};
    const guidedFb = isObject(fb.guided) ? fb.guided : {};
    const out = {
      meta: normalizeStringMap(src.meta, fb.meta || {}),
      ui: normalizeStringMap(src.ui, fb.ui || {}),
      projects: normalizeStringMap(src.projects, fb.projects || {}),
      commands: normalizeStringMap(src.commands, fb.commands || {}),
      editor: normalizeStringMap(src.editor, fb.editor || {}),
      nav: {},
      pages: {},
      guided: {
        title: typeof guidedSrc.title === "string" ? guidedSrc.title : guidedFb.title || "",
        subtitle: typeof guidedSrc.subtitle === "string" ? guidedSrc.subtitle : guidedFb.subtitle || "",
        purpose: typeof guidedSrc.purpose === "string" ? guidedSrc.purpose : guidedFb.purpose || "",
        vibe: typeof guidedSrc.vibe === "string" ? guidedSrc.vibe : guidedFb.vibe || "",
        show: typeof guidedSrc.show === "string" ? guidedSrc.show : guidedFb.show || "",
        apply: typeof guidedSrc.apply === "string" ? guidedSrc.apply : guidedFb.apply || "",
        close: typeof guidedSrc.close === "string" ? guidedSrc.close : guidedFb.close || "",
        options: {
          purpose: normalizeStringMap(guidedSrc.options?.purpose, guidedFb.options?.purpose || {}, true),
          vibe: normalizeStringMap(guidedSrc.options?.vibe, guidedFb.options?.vibe || {}, true),
          show: normalizeStringMap(guidedSrc.options?.show, guidedFb.options?.show || {}, true)
        }
      },
      themes: {}
    };
    pageIds.forEach((pid) => {
      const fallbackLabel = typeof fb.nav?.[pid] === "string" ? fb.nav[pid] : titleFromId(pid);
      out.nav[pid] = typeof src.nav?.[pid] === "string" ? src.nav[pid] : fallbackLabel;
      const fallbackPage = isObject(fb.pages?.[pid]) ? fb.pages[pid] : fallbackPageConfig(pid, out.nav[pid]);
      out.pages[pid] = normalizePage(src.pages?.[pid], fallbackPage);
    });
    themeIds.forEach((themeId) => {
      out.themes[themeId] =
        typeof src.themes?.[themeId] === "string"
          ? src.themes[themeId]
          : typeof fb.themes?.[themeId] === "string"
            ? fb.themes[themeId]
            : themeId;
    });
    return out;
  }

  function sanitizeContent(raw) {
    const defaults = buildDefaultContent();
    const legacy =
      isObject(raw) && !isObject(raw.translations) && (isObject(raw.pages) || Array.isArray(raw.projects))
        ? {
            translations: {
              en: { pages: isObject(raw.pages?.en) ? raw.pages.en : {} },
              ar: { pages: isObject(raw.pages?.ar) ? raw.pages.ar : {} }
            },
            projects: Array.isArray(raw.projects) ? raw.projects : undefined
          }
        : raw;
    const source = isObject(legacy) ? legacy : {};
    const out = deepClone(defaults);
    out.pageMap = normalizePageMap(source.pageMap, defaults.pageMap);
    const pageIds = Object.keys(out.pageMap);
    out.profile = normalizeProfile(source.profile, defaults.profile);
    out.navIcons = normalizeStringMap(source.navIcons, defaults.navIcons || {}, true);
    out.routeMap = normalizeRouteMap(source.routeMap, defaults.routeMap || {}, out.pageMap);
    out.navStructure = normalizeNavStructure(source.navStructure, defaults.navStructure || [], out.pageMap);
    out.commandList = normalizeCommandList(source.commandList, defaults.commandList || []);
    out.guidedOptions = normalizeGuidedOptions(source.guidedOptions, defaults.guidedOptions || {});
    out.themes = normalizeThemeList(source.themes, defaults.themes || [], { ...(defaults.themePalettes || {}), ...(isObject(source.themePalettes) ? source.themePalettes : {}) });
    if (!out.themes.length) out.themes = uniqueStrings(defaults.themes || []);
    out.defaultTheme =
      typeof source.defaultTheme === "string" && out.themes.includes(source.defaultTheme)
        ? source.defaultTheme
        : out.themes.includes(defaults.defaultTheme)
          ? defaults.defaultTheme
          : out.themes[0];
    if (!out.themes.includes(out.defaultTheme)) out.themes.unshift(out.defaultTheme);
    out.themePalettes = normalizeThemePalettes(source.themePalettes, defaults.themePalettes || {}, out.themes);
    ["en", "ar"].forEach((lang) => {
      out.translations[lang] = normalizeLanguagePack(source.translations?.[lang], defaults.translations[lang], pageIds, out.themes);
    });
    out.projects = normalizeProjects(source.projects, defaults.projects);
    return out;
  }

  function loadContent() {
    try {
      const saved = localStorage.getItem(CONTENT_KEY) || localStorage.getItem(LEGACY_CONTENT_KEY);
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
    project: { search: "", sort: "featured", tag: "all", show: localStorage.getItem(SHOW_KEY) || "all" },
    guided: { purpose: "", vibe: "", show: "" },
    content: loadContent(),
    nav: { cli: localStorage.getItem(NAV_CLI_KEY) === "1", idle: false },
    editor: {
      tab: "page",
      pageLang: localStorage.getItem("portfolio.lang") || "en",
      pageId,
      draft: null,
      jsonDraft: null,
      navLabel: "",
      selection: { kind: "title" },
      visualEditor: null,
      visualDrafts: {},
      visualLoadedKey: "",
      visualLoading: false,
      inlineOpen: false
    }
  };

  const getPageMap = () => (isObject(state.content.pageMap) ? state.content.pageMap : DATA.pageMap);
  const getPageKeys = () => Object.keys(getPageMap());
  const getNavStructure = () => (Array.isArray(state.content.navStructure) ? state.content.navStructure : DATA.navStructure);
  const getRouteMap = () => (isObject(state.content.routeMap) ? state.content.routeMap : DATA.routeMap);
  const getThemes = () => (Array.isArray(state.content.themes) && state.content.themes.length ? state.content.themes : DATA.themes);
  const getDefaultTheme = () =>
    typeof state.content.defaultTheme === "string" && getThemes().includes(state.content.defaultTheme)
      ? state.content.defaultTheme
      : DATA.defaultTheme;
  const getThemePalettes = () => (isObject(state.content.themePalettes) ? state.content.themePalettes : DATA.themePalettes || {});
  const getNavIcons = () => (isObject(state.content.navIcons) ? state.content.navIcons : DATA.navIcons || {});
  const getProfile = () => (isObject(state.content.profile) ? state.content.profile : DATA.profile);
  const getGuidedOptions = () => (isObject(state.content.guidedOptions) ? state.content.guidedOptions : DATA.guidedOptions || {});
  const getCommandList = () =>
    Array.from(new Set([...(Array.isArray(state.content.commandList) ? state.content.commandList : DATA.commandList || []), "edit", "studio", "cli", "savecontent", "resetcontent"]));
  const getLangPack = (lang = state.lang) => state.content.translations?.[lang] || DATA.translations[lang];
  const tr = () => getLangPack(state.lang);
  const t = (key, fallback = "") => {
    const value = readNested(tr(), key);
    return typeof value === "string" ? value : fallback;
  };
  const nextLang = () => (state.lang === "ar" ? "en" : "ar");
  const langButtonLabel = () => (nextLang() === "ar" ? "AR" : "EN");
  const brandLogoSrc = `${rootPrefix}assets/img/squ-logo.webp?v=20260404a`;
  const brandCardLines = (lang = state.lang) =>
    lang === "ar"
      ? ["جامعة السلطان قابوس", "كلية التربية", "تقنيات التعليم والتعلم"]
      : ["Sultan Qaboos University", "College of Education", "Instructional and Learning Technology"];
  const loadingName = (lang = state.lang) => {
    const profile = getProfile();
    return lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
  };
  const loadingHint = (lang = state.lang) => (lang === "ar" ? "اضغط في أي مكان للدخول" : "Click anywhere to enter");
  const navLabel = (id, lang = state.lang) => getLangPack(lang).nav?.[id] || titleFromId(id);
  const themeLabel = (id, lang = state.lang) =>
    getLangPack(lang).themes?.[id] || getLangPack("en").themes?.[id] || id;
  const hrefFor = (id) => `${rootPrefix}${getPageMap()[id] || getPageMap().home || "index.html"}`;
  const navIcon = (id) => getNavIcons()[id] || (id.startsWith("unit-") ? "&#8250;" : id.startsWith("other-") ? "&#8250;" : "&#8226;");
  const editorStrings = () => tr().editor || {};

  function persistContent() {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(sanitizeContent(state.content)));
    localStorage.removeItem(LEGACY_CONTENT_KEY);
  }

  function syncGuidedState() {
    const options = getGuidedOptions();
    const syncKey = (key, fallback) => {
      const list = Array.isArray(options[key]) && options[key].length ? options[key] : [fallback];
      if (!list.includes(state.guided[key])) state.guided[key] = list[0];
    };
    syncKey("purpose", "hiring");
    syncKey("vibe", "minimal");
    syncKey("show", "featured");
  }

  function getPageContent(lang, pid) {
    return getLangPack(lang).pages?.[pid] || fallbackPageConfig(pid, navLabel(pid, lang));
  }

  function getProjects() {
    return Array.isArray(state.content.projects) ? state.content.projects : [];
  }

  function activeSet() {
    const set = new Set([pageId]);
    getNavStructure().forEach((item) => {
      if (Array.isArray(item.children) && item.children.includes(pageId)) set.add(item.id);
    });
    return set;
  }

  function applyThemePalette(themeId) {
    const style = document.documentElement.style;
    appliedThemeVars.forEach((name) => style.removeProperty(name));
    const palettes = getThemePalettes();
    appliedThemeVars = uniqueStrings(Object.values(palettes).flatMap((palette) => (isObject(palette) ? Object.keys(palette) : [])));
    const active = isObject(palettes[themeId]) ? palettes[themeId] : {};
    appliedThemeVars.forEach((name) => {
      if (typeof active[name] === "string") style.setProperty(name, active[name]);
    });
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
      nameEl.innerHTML = Array.from(loadingName(lang)).map((char, index) => `<span class="loading-letter" data-index="${index}">${char === " " ? "&nbsp;" : esc(char)}</span>`).join("");
    }
    if (hintEl) {
      hintEl.lang = lang;
      hintEl.dir = dir;
      hintEl.textContent = loadingHint(lang);
    }
  }

  function resetContent() {
    state.content = buildDefaultContent();
    state.editor.jsonDraft = sanitizeContent(state.content);
    state.editor.visualDrafts = {};
    state.editor.visualLoadedKey = "";
    localStorage.removeItem(CONTENT_KEY);
    localStorage.removeItem(LEGACY_CONTENT_KEY);
    syncGuidedState();
    syncEditorPageOptions();
    const pageKeys = getPageKeys();
    if (!pageKeys.includes(state.editor.pageId)) state.editor.pageId = pageKeys[0] || "home";
    state.editor.navLabel = navLabel(state.editor.pageId, state.editor.pageLang);
    state.editor.draft = deepClone(getPageContent(state.editor.pageLang, state.editor.pageId));
    state.editor.selection = { kind: "title" };
    if (!getThemes().includes(state.theme)) state.theme = getDefaultTheme();
    applyTheme(state.theme);
    render();
    refreshEditorForm();
    renderJSONBuilder();
    setEditorStatus(t("editor.resetDone"), false);
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
      localStorage.setItem(NAV_CLI_KEY, state.nav.cli ? "1" : "0");
      syncHeaderState();
    });
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (nav) nav.classList.remove("open");
    if (menu) menu.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".drop-btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".submenu").forEach((sub) => sub.classList.remove("open"));
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
    if (state.editor.inlineOpen) return false;
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
    ["pointerdown", "mousemove", "keydown", "touchstart", "scroll"].forEach((eventName) => {
      document.addEventListener(eventName, markNavActive, { passive: true });
    });
    scheduleNavIdle();
  }
  function renderHeader() {
    const current = activeSet();
    const structure = getNavStructure();
    const profile = getProfile();
    const brandName = state.lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
    const brandLines = brandCardLines(state.lang);
    const navItem = (id) =>
      `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${hrefFor(id)}"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${esc(navLabel(id))}</span></a></li>`;
    const navDrop = (id, children) => {
      const sub = children
        .map(
          (childId) =>
            `<li><a class="submenu-link ${current.has(childId) ? "active" : ""}" href="${hrefFor(childId)}"><span class="nav-icon" aria-hidden="true">${navIcon(childId)}</span><span class="nav-label">${esc(navLabel(childId))}</span></a></li>`
        )
        .join("");
      return `<li class="dropdown">
        <button class="drop-btn nav-link ${current.has(id) ? "active" : ""}" aria-expanded="false" aria-haspopup="true"><span class="nav-icon" aria-hidden="true">${navIcon(id)}</span><span class="nav-label">${esc(navLabel(id))}</span></button>
        <ul class="submenu" role="menu">${sub}</ul>
      </li>`;
    };
    const parts = structure.map((item) => (item.children ? navDrop(item.id, item.children) : navItem(item.id))).join("");

    document.getElementById("site-header").innerHTML = `
      <header class="site-header ${state.nav.cli ? "cli-mode" : ""}" role="banner">
        <div class="nav-wrap terminal-card">
          <a class="brand" href="${hrefFor("home")}" aria-label="${esc(brandName)}">
            <span class="brand-logo-shell" aria-hidden="true"><img class="brand-logo" src="${brandLogoSrc}" alt="" decoding="async" loading="eager" /></span>
            <span class="brand-text"><span class="brand-dot">$</span><span class="brand-name">${esc(brandName)}</span></span>
            <span class="brand-card" aria-hidden="true">
              <span class="brand-card-line brand-card-line--primary">${esc(brandLines[0])}</span>
              <span class="brand-card-line">${esc(brandLines[1])}</span>
              <span class="brand-card-line">${esc(brandLines[2])}</span>
            </span>
          </a>
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
                <button id="cmd-run" class="icon-btn cmd-enter" type="button" aria-label="${esc(t("ui.runCommand"))}">&#9166;</button>
              </div>
              <ul id="command-suggestions" class="suggestions" role="listbox"></ul>
              <div id="command-output" class="cmd-output" aria-live="polite"></div>
            </div>
            <button id="cli-toggle" class="icon-btn nav-action ${state.nav.cli ? "active" : ""}" aria-label="CLI" aria-pressed="${state.nav.cli ? "true" : "false"}"><span class="btn-icon" aria-hidden="true">&gt;_</span><span class="btn-label">CLI</span></button>
            <button id="theme-toggle" class="icon-btn nav-action" aria-label="${esc(t("ui.themeButton"))}"><span class="btn-icon" aria-hidden="true">&#9680;</span><span class="btn-label">${esc(t("ui.themeButton"))}</span></button>
            <button id="lang-toggle" class="icon-btn nav-action" aria-label="${nextLang() === "ar" ? "Switch language to Arabic" : "Switch language to English"}"><span class="btn-icon" aria-hidden="true">&#127760;</span><span class="btn-label">${langButtonLabel()}</span></button>
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
    const suggestions = document.getElementById("command-suggestions");
    const out = document.getElementById("command-output");
    const search = document.getElementById("project-search");
    if (!nav || !menu || !cmd || !suggestions || !out) return;

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
        document.querySelectorAll(".drop-btn").forEach((item) => item.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((item) => item.classList.remove("open"));
        btn.setAttribute("aria-expanded", String(!open));
        menuEl.classList.toggle("open", !open);
      });
      btn.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          btn.click();
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          btn.click();
          menuEl.querySelector("a")?.focus();
        }
        if (event.key === "Escape") close();
      });
      menuEl.querySelectorAll("a").forEach((link) => {
        link.addEventListener("keydown", (event) => {
          const links = [...menuEl.querySelectorAll("a")];
          const idx = links.indexOf(link);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            links[(idx + 1) % links.length].focus();
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            links[(idx - 1 + links.length) % links.length].focus();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            close();
            btn.focus();
          }
        });
      });
    });

    document.getElementById("cli-toggle")?.addEventListener("click", () => {
      markNavActive();
      setCliMode(!state.nav.cli);
    });
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      markNavActive();
      const themes = getThemes();
      const next = themes[(themes.indexOf(state.theme) + 1) % themes.length] || getDefaultTheme();
      applyTheme(next);
      out.textContent = `${t("commands.themeChanged")}: ${themeLabel(state.theme)}`;
    });
    document.getElementById("lang-toggle")?.addEventListener("click", () => {
      markNavActive();
      setLang(state.lang === "ar" ? "en" : "ar");
    });

    const suggest = (value) => {
      const query = value.trim().toLowerCase();
      const list = getCommandList().filter((command) => !query || command.includes(query)).slice(0, 10);
      state.cmdIndex = -1;
      suggestions.innerHTML = list.length
        ? list.map((command, idx) => `<li role="option" data-idx="${idx}" data-cmd="${command}"><span class="cmd-suggestion-icon">›</span>${command}</li>`).join("")
        : `<li class="muted">${esc(t("ui.noSuggestions"))}</li>`;
    };

    let typeTimer = null;
    const typeOutput = (text, element = out) => {
      if (typeTimer) clearTimeout(typeTimer);
      element.textContent = text;
    };

    const run = (raw) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;
      const [command, arg] = text.split(/\s+/, 2);
      const routes = getRouteMap();
      if (command === "help") typeOutput(`${t("commands.help")} | ${t("commands.helpExtra")}`);
      else if (command === "clear") {
        cmd.value = "";
        out.textContent = "";
      } else if (command === "theme") {
        const themes = getThemes();
        const next = arg || themes[(themes.indexOf(state.theme) + 1) % themes.length] || getDefaultTheme();
        applyTheme(next);
        typeOutput(`${t("commands.themeChanged")}: ${themeLabel(state.theme)}`);
      } else if (command === "lang") {
        setLang(arg === "ar" || arg === "en" ? arg : state.lang === "ar" ? "en" : "ar");
        typeOutput(`${t("commands.langChanged")}: ${state.lang === "ar" ? "العربية" : "English"}`);
      } else if (command === "cli") {
        const next = arg === "on" ? true : arg === "off" ? false : !state.nav.cli;
        setCliMode(next);
        typeOutput(state.nav.cli ? t("commands.cliEnabled") : t("commands.cliDisabled"));
      } else if (command === "edit") toggleInlineEditor();
      else if (command === "studio") openEditor({ tab: state.editor.draft?.builderHtml?.trim() ? "visual" : state.editor.tab, preserveDraft: true });
      else if (command === "savecontent") {
        persistContent();
        typeOutput(t("commands.contentSaved"));
      } else if (command === "resetcontent") {
        resetContent();
        typeOutput(t("commands.contentReset"));
      } else if (command === "home" && search && pageId === "home") search.focus();
      else if (routes[command]) {
        typeOutput(`${t("commands.moved")}: ${navLabel(routes[command])}`);
        setTimeout(() => { window.location.href = hrefFor(routes[command]); }, 600);
      } else typeOutput(t("commands.unknown"));
      suggestions.innerHTML = "";
    };

    cmd.addEventListener("input", () => {
      markNavActive();
      out.textContent = "";
      suggest(cmd.value);
    });
    cmd.addEventListener("keydown", (event) => {
      markNavActive();
      const items = [...suggestions.querySelectorAll("li[data-cmd]")];
      if (event.key === "ArrowDown" && items.length) {
        event.preventDefault();
        state.cmdIndex = (state.cmdIndex + 1) % items.length;
      }
      if (event.key === "ArrowUp" && items.length) {
        event.preventDefault();
        state.cmdIndex = (state.cmdIndex - 1 + items.length) % items.length;
      }
      items.forEach((item, idx) => item.classList.toggle("active", idx === state.cmdIndex));
      if (event.key === "Enter") {
        event.preventDefault();
        run((state.cmdIndex >= 0 ? items[state.cmdIndex].dataset.cmd : cmd.value) || "");
      }
      if (event.key === "Escape") {
        suggestions.innerHTML = "";
        if (!cmd.value.trim() && state.nav.cli) setCliMode(false);
      }
    });
    cmdRun?.addEventListener("click", () => {
      markNavActive();
      run(cmd.value || "");
      cmd.focus();
    });
    suggestions.addEventListener("click", (event) => {
      markNavActive();
      const item = event.target.closest("li[data-cmd]");
      if (!item) return;
      cmd.value = item.dataset.cmd;
      run(cmd.value);
    });
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

  function editorPageKey(lang = state.editor.pageLang, pid = state.editor.pageId) {
    return `${lang}:${pid}`;
  }

  function defaultVisualBuilderCss() {
    return `
      .page-visual-root {
        display: grid;
        gap: 16px;
        color: inherit;
      }
      .visual-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 16px;
      }
      .visual-card {
        grid-column: span 12;
        padding: 24px;
        border: 1px solid rgba(57, 255, 143, 0.24);
        border-radius: 18px;
        background: rgba(8, 15, 33, 0.78);
        color: inherit;
      }
      .visual-card.wide { grid-column: span 8; }
      .visual-card.half { grid-column: span 6; }
      .visual-card.third { grid-column: span 4; }
      .visual-card img {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 12px;
      }
      .visual-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        align-items: start;
      }
      .visual-card h2,
      .visual-card p {
        margin-top: 0;
      }
      @media (max-width: 900px) {
        .visual-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        .visual-card,
        .visual-card.wide { grid-column: span 6; }
        .visual-card.half { grid-column: span 3; }
        .visual-card.third { grid-column: span 2; }
      }
      @media (max-width: 700px) {
        .visual-grid,
        .visual-split { grid-template-columns: 1fr; }
        .visual-card,
        .visual-card.wide,
        .visual-card.half,
        .visual-card.third { grid-column: auto; }
      }
    `;
  }

  function structuredSectionsToBuilderHtml(page) {
    const sections = Array.isArray(page?.sections) ? page.sections : [];
    const rows = sections
      .map((section, index) => {
        const block = normalizeSection(section, createSectionTemplate("text")) || createSectionTemplate("text");
        const type = normalizeSectionType(block.type, "text");
        const spanClass = normalizeSectionSpan(block.span, "full");
        if (type === "image") {
          return `<section class="visual-card ${spanClass}">
            <div class="visual-split">
              <div>
                ${block.title ? `<h2>${esc(block.title)}</h2>` : ""}
                ${block.body ? `<p>${esc(block.body)}</p>` : ""}
              </div>
              <div>
                ${block.imageSrc ? `<img src="${esc(block.imageSrc)}" alt="${esc(block.imageAlt || block.title || `Image ${index + 1}`)}" />` : `<div>${esc(t("editor.imagePlaceholder", "Add an image URL to preview it here."))}</div>`}
                ${block.imageCaption ? `<p>${esc(block.imageCaption)}</p>` : ""}
              </div>
            </div>
          </section>`;
        }
        if (type === "html") {
          return `<section class="visual-card ${spanClass}">
            ${block.title ? `<h2>${esc(block.title)}</h2>` : ""}
            <div>${block.html ? sanitizeCustomHTML(block.html) : ""}</div>
          </section>`;
        }
        return `<section class="visual-card ${spanClass}">
          ${block.title ? `<h2>${esc(block.title)}</h2>` : ""}
          ${block.body ? `<p>${esc(block.body)}</p>` : ""}
        </section>`;
      })
      .join("");
    return `<div class="page-visual-root"><div class="visual-grid">${rows || `<section class="visual-card"><p>${esc(t("ui.noContentYet"))}</p></section>`}</div></div>`;
  }

  function currentVisualPayload() {
    const key = editorPageKey();
    const cached = state.editor.visualDrafts[key];
    if (cached) return cached;
    const page = state.editor.draft || fallbackPageConfig(state.editor.pageId, state.editor.navLabel);
    return {
      html: page.builderHtml || structuredSectionsToBuilderHtml(page),
      css: page.builderCss || defaultVisualBuilderCss()
    };
  }

  function loadExternalStyleOnce(id, href) {
    return new Promise((resolve, reject) => {
      let link = document.getElementById(id);
      if (link) {
        resolve();
        return;
      }
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load ${href}`));
      document.head.appendChild(link);
    });
  }

  function loadExternalScriptOnce(id, src) {
    return new Promise((resolve, reject) => {
      let script = document.getElementById(id);
      if (script) {
        if (script.dataset.loaded === "1") {
          resolve();
          return;
        }
        script.addEventListener("load", () => resolve(), { once: true });
        script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = "1";
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  function sectionTabLabel(section, index) {
    const type = normalizeSectionType(section?.type);
    const typeLabel =
      type === "image"
        ? t("editor.itemImageBlock", "Image")
        : type === "video"
          ? t("editor.itemVideoBlock", "Video")
          : type === "audio"
            ? t("editor.itemAudioBlock", "Audio")
            : type === "gallery"
              ? t("editor.itemGalleryBlock", "Gallery")
              : type === "html"
                ? t("editor.itemHtmlBlock", "HTML")
                : t("editor.itemTextBlock", "Text");
    return section?.title || `${typeLabel} ${index + 1}`;
  }

  function sectionAnimationAttrs(section) {
    const animation = normalizeSectionAnimation(section?.animation, "fade-up");
    return {
      animation,
      revealClass: animation === "none" ? "" : " reveal",
      attr: animation === "none" ? `data-section-animation="none"` : `data-reveal="${animation}" data-section-animation="${animation}"`
    };
  }

  function sectionContentMarkup(section, index) {
    const block = normalizeSection(section, createSectionTemplate("text")) || createSectionTemplate("text");
    const type = normalizeSectionType(block.type, "text");
    const header = block.title ? `<div class="section-headline"><h2>${esc(block.title)}</h2></div>` : "";
    if (type === "image") {
      return `<div class="section-block-inner">
        ${header}
        <figure class="section-media">
          ${block.imageSrc ? `<img src="${esc(block.imageSrc)}" alt="${esc(block.imageAlt || block.title || `Image ${index + 1}`)}" loading="lazy" />` : `<div class="section-placeholder">${esc(t("editor.imagePlaceholder", "Add an image URL to preview it here."))}</div>`}
          ${block.imageCaption ? `<figcaption class="section-caption">${esc(block.imageCaption)}</figcaption>` : ""}
        </figure>
        ${block.body ? `<div class="section-copy"><p>${esc(block.body)}</p></div>` : ""}
      </div>`;
    }
    if (type === "video") {
      return `<div class="section-block-inner">
        ${header}
        <figure class="section-media">
          ${block.videoSrc ? `<video class="section-video" controls preload="metadata" ${block.videoPoster ? `poster="${esc(block.videoPoster)}"` : ""}>
            <source src="${esc(block.videoSrc)}" />
            ${esc(t("editor.videoNotSupported", "Your browser does not support video playback."))}
          </video>` : `<div class="section-placeholder">${esc(t("editor.videoPlaceholder", "Add a video URL to preview it here."))}</div>`}
          ${block.videoCaption ? `<figcaption class="section-caption">${esc(block.videoCaption)}</figcaption>` : ""}
        </figure>
        ${block.body ? `<div class="section-copy"><p>${esc(block.body)}</p></div>` : ""}
      </div>`;
    }
    if (type === "audio") {
      return `<div class="section-block-inner">
        ${header}
        <figure class="section-media section-audio-wrap">
          ${block.audioSrc ? `<audio class="section-audio" controls preload="metadata">
            <source src="${esc(block.audioSrc)}" />
            ${esc(t("editor.audioNotSupported", "Your browser does not support audio playback."))}
          </audio>` : `<div class="section-placeholder">${esc(t("editor.audioPlaceholder", "Add an audio URL to preview it here."))}</div>`}
          ${block.audioCaption ? `<figcaption class="section-caption">${esc(block.audioCaption)}</figcaption>` : ""}
        </figure>
        ${block.body ? `<div class="section-copy"><p>${esc(block.body)}</p></div>` : ""}
      </div>`;
    }
    if (type === "gallery") {
      const images = block.galleryImages || [];
      const galleryMarkup = images.length
        ? `<div class="section-gallery" data-gallery-id="gallery-${index}">
            <div class="section-gallery-track">
              ${images.map((img, gi) => `<div class="section-gallery-slide" data-gallery-index="${gi}">
                <img src="${esc(img.src || "")}" alt="${esc(img.alt || block.title || `Gallery ${index + 1} - Image ${gi + 1}`)}" loading="lazy" />
                ${img.caption ? `<figcaption class="section-caption">${esc(img.caption)}</figcaption>` : ""}
              </div>`).join("")}
            </div>
            <div class="section-gallery-controls">
              <button class="icon-btn gallery-prev" data-gallery-action="prev" data-gallery-id="gallery-${index}" aria-label="Previous image">&#8249;</button>
              <span class="section-gallery-counter" data-gallery-counter="gallery-${index}">1 / ${images.length}</span>
              <button class="icon-btn gallery-next" data-gallery-action="next" data-gallery-id="gallery-${index}" aria-label="Next image">&#8250;</button>
            </div>
          </div>`
        : `<div class="section-placeholder">${esc(t("editor.galleryPlaceholder", "Add images to the gallery to preview them here."))}</div>`;
      return `<div class="section-block-inner">
        ${header}
        ${galleryMarkup}
        ${block.body ? `<div class="section-copy"><p>${esc(block.body)}</p></div>` : ""}
      </div>`;
    }
    if (type === "html") {
      return `<div class="section-block-inner">
        ${header}
        <div class="section-copy">
          <div class="section-html">${block.html ? sanitizeCustomHTML(block.html) : `<div class="section-placeholder">${esc(t("editor.htmlLabel", "Custom HTML"))}</div>`}</div>
        </div>
      </div>`;
    }
    return `<div class="section-block-inner">
      ${header}
      ${block.body ? `<div class="section-copy"><p>${esc(block.body)}</p></div>` : ""}
    </div>`;
  }

  function sectionInlineStyle(section, index) {
    const styles = [`--reveal-delay:${index * 90}ms`];
    if (String(section?.bgColor || "").trim()) styles.push(`--section-bg:${String(section.bgColor).trim()}`);
    if (String(section?.textColor || "").trim()) styles.push(`--section-text:${String(section.textColor).trim()}`);
    if (String(section?.borderColor || "").trim()) styles.push(`--section-border:${String(section.borderColor).trim()}`);
    return styles.join(";");
  }

  function tabsMarkup(sections) {
    if (!sections.length) return `<p class="muted">${esc(t("ui.noContentYet"))}</p>`;
    const body = sections
      .map((section, idx) => {
        const animation = sectionAnimationAttrs(section);
        return `<article class="section-card section-card-${normalizeSectionType(section?.type)} section-theme-${normalizeSectionTheme(section?.theme)} section-span-${normalizeSectionSpan(section?.span)} section-pad-${normalizeSectionPadding(section?.padding)}${animation.revealClass}" ${animation.attr} style="${esc(sectionInlineStyle(section, idx))}" data-page-editor-select="section" data-page-editor-index="${idx}" data-section-type="${esc(normalizeSectionType(section?.type))}" data-layout="${esc(normalizeSectionLayout(section?.layout))}" data-align="${esc(normalizeSectionAlign(section?.align))}"><span class="section-badge">${esc(sectionTabLabel(section, idx))}</span>${sectionContentMarkup(section, idx)}</article>`;
      })
      .join("");
    return `<div class="page-block-grid">${body}</div>`;
  }

  function activateSectionTab(index) {
    return index;
  }

  function isModalPagePreviewActive() {
    const panel = document.getElementById("editor-panel");
    return Boolean(
      panel &&
        !panel.hidden &&
        state.editor.tab === "page" &&
        state.editor.draft &&
        state.editor.pageId === pageId &&
        state.editor.pageLang === state.lang
    );
  }

  function isInlinePagePreviewActive() {
    return Boolean(state.editor.inlineOpen && state.editor.draft && state.editor.pageId === pageId && state.editor.pageLang === state.lang);
  }

  function isLivePagePreviewActive() {
    return isInlinePagePreviewActive() || isModalPagePreviewActive();
  }

  function renderSavedCurrentPage(withMotion = true) {
    renderPage();
    if (pageId === "home") renderProjects();
    if (withMotion) requestAnimationFrame(applyRevealMotion);
    else document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    initGalleryNavigation();
  }

  function attachPageEditorTarget(element, selection) {
    if (!element) return;
    const nextSelection = selection.kind === "section" ? { kind: "section", index: Number(selection.index) || 0 } : { kind: selection.kind };
    element.dataset.pageEditorSelect = nextSelection.kind;
    if (nextSelection.kind === "section") element.dataset.pageEditorIndex = String(nextSelection.index);
    else delete element.dataset.pageEditorIndex;
    element.onclick = () => {
      if (!isLivePagePreviewActive()) return;
      state.editor.selection = nextSelection.kind === "section" ? { kind: "section", index: nextSelection.index } : { kind: nextSelection.kind };
      renderPageItemEditor();
    };
  }

  function syncPageSelectionTargets() {
    const live = isLivePagePreviewActive();
    const selection = normalizeEditorSelection();
    document.body.classList.toggle("editor-live-page", live);
    document.querySelectorAll("[data-page-editor-select]").forEach((element) => {
      if (!(element instanceof HTMLElement)) return;
      const kind = element.dataset.pageEditorSelect;
      const index = Number(element.dataset.pageEditorIndex);
      const active = live && (kind === "section" ? selection.kind === "section" && selection.index === index : selection.kind === kind);
      element.classList.toggle("active-editor-target", active);
    });
  }

  function bindPageEditorTargets() {
    attachPageEditorTarget(document.getElementById("page-title"), { kind: "title" });
    attachPageEditorTarget(document.getElementById("page-subtitle"), { kind: "subtitle" });
    attachPageEditorTarget(document.getElementById("page-prompt"), { kind: "prompt" });
    document.querySelectorAll(".section-card[data-page-editor-select='section']").forEach((card, index) => {
      attachPageEditorTarget(card, { kind: "section", index });
    });
    syncPageSelectionTargets();
  }

  function bindSectionTabs() {
    return;
  }

  function renderPage() {
    const previewLabel = isLivePagePreviewActive() ? String(state.editor.navLabel || "").trim() || navLabel(pageId) : navLabel(pageId);
    document.title = `${t("meta.siteName")} | ${previewLabel}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (value) el.textContent = value;
    });
    const page = isLivePagePreviewActive() ? state.editor.draft : getPageContent(state.lang, pageId);
    const hero = document.querySelector(".hero-card");
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const wrap = document.getElementById("page-sections");
    if (!title || !subtitle || !prompt || !wrap) return;
    const hasHero = Boolean(String(page.title || "").trim() || String(page.subtitle || "").trim() || String(page.prompt || "").trim());
    const hasBuilder = typeof page.builderHtml === "string" && page.builderHtml.trim();
    const sections = Array.isArray(page.sections) ? page.sections : [];
    if (hero) hero.hidden = !hasHero;
    title.textContent = page.title || "";
    subtitle.textContent = page.subtitle || "";
    prompt.textContent = page.prompt || "";
    wrap.hidden = !hasBuilder && sections.length === 0;
    if (hasBuilder) {
      wrap.innerHTML = `<style>${page.builderCss || ""}</style>${sanitizeCustomHTML(page.builderHtml)}`;
    } else {
      wrap.innerHTML = tabsMarkup(sections);
    }
    attachPageEditorTarget(title, { kind: "title" });
    attachPageEditorTarget(subtitle, { kind: "subtitle" });
    attachPageEditorTarget(prompt, { kind: "prompt" });
    bindPageEditorTargets();
  }

  function filteredProjects() {
    const query = state.project.search.toLowerCase();
    let list = getProjects().filter((project) => {
      if (state.project.tag !== "all" && !(project.tags || []).includes(state.project.tag)) return false;
      if (state.project.show === "featured" && !project.featured) return false;
      if (state.project.show === "ai" && !(project.tags || []).includes("ai")) return false;
      if (query) {
        const text = [project.name[state.lang], project.summary[state.lang], (project.stack || []).join(" "), (project.tags || []).join(" ")]
          .join(" ")
          .toLowerCase();
        if (!text.includes(query)) return false;
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
    if (!search || !sort || !tags || !list) return;

    search.placeholder = t("projects.searchPlaceholder");
    sort.querySelector("option[value='featured']").textContent = t("projects.sortFeatured");
    sort.querySelector("option[value='newest']").textContent = t("projects.sortNewest");
    sort.querySelector("option[value='complex']").textContent = t("projects.sortComplex");
    search.value = state.project.search;
    sort.value = state.project.sort;

    const allTags = [...new Set(getProjects().flatMap((project) => project.tags || []))];
    tags.innerHTML = [`<button class="chip ${state.project.tag === "all" ? "active" : ""}" data-tag="all">${esc(t("projects.tagAll"))}</button>`]
      .concat(allTags.map((tag) => `<button class="chip ${state.project.tag === tag ? "active" : ""}" data-tag="${tag}">${tag}</button>`))
      .join("");

    const rows = filteredProjects();
    list.innerHTML = rows.length
      ? rows
          .map(
            (project, idx) => `<article class="project-card terminal-card reveal" style="--reveal-delay:${idx * 70}ms">
              <h3>${esc(project.name[state.lang])}</h3>
              <p>${esc(project.summary[state.lang])}</p>
              <p class="meta">${esc(t("projects.status"))}: ${esc(project.status === "done" ? t("projects.statusDone") : t("projects.statusWip"))}</p>
              <p class="meta">${esc(t("projects.stack"))}: ${esc((project.stack || []).join(", "))}</p>
              <div class="tag-line">${(project.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
              <button class="icon-btn details-btn" data-id="${project.id}">${esc(t("projects.details"))}</button>
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
    tags.onclick = (event) => {
      const chip = event.target.closest("[data-tag]");
      if (!chip) return;
      state.project.tag = chip.dataset.tag;
      renderProjects();
      applyRevealMotion();
    };
    list.querySelectorAll(".details-btn").forEach((button) => button.addEventListener("click", () => openProject(button.dataset.id)));
  }

  function closeModal(id = "project-modal") {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }

  function openProject(id) {
    const project = getProjects().find((item) => item.id === id);
    if (!project) return;
    const modal = document.getElementById("project-modal");
    const link = document.getElementById("project-modal-link");
    const copy = document.getElementById("project-copy-pitch");
    if (!modal || !link || !copy) return;
    document.getElementById("project-modal-title").textContent = project.name[state.lang];
    document.getElementById("project-modal-summary").textContent = project.summary[state.lang];
    document.getElementById("project-modal-details").textContent = project.details[state.lang];
    document.getElementById("project-modal-stack").textContent = `${t("projects.stack")}: ${(project.stack || []).join(", ")}`;
    link.href = project.link || "#";
    link.textContent = t("projects.openLink");
    copy.textContent = t("projects.copyPitch");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(project.pitch[state.lang] || "");
        copy.textContent = t("projects.copied");
      } catch (_) {}
    };
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }
  function guidedLabel(kind, value) {
    return readNested(tr(), `guided.options.${kind}.${value}`) || value;
  }

  function renderGuided() {
    syncGuidedState();
    const guided = getGuidedOptions();
    const groupMarkup = (kind, titleKey) => {
      const values = Array.isArray(guided[kind]) ? guided[kind] : [];
      return `<div class="guided-group" data-kind="${kind}">
        <p>${esc(t(`guided.${titleKey}`))}</p>
        ${values.map((value) => `<button data-value="${esc(value)}">${esc(guidedLabel(kind, value))}</button>`).join("")}
      </div>`;
    };
    document.getElementById("guided-root").innerHTML = `
      <div id="guided-panel" class="guided-panel" hidden>
        <div class="guided-backdrop"></div>
        <section class="guided-dialog terminal-card" role="dialog" aria-modal="true">
          <h2>${esc(t("guided.title"))}</h2>
          <p class="muted">${esc(t("guided.subtitle"))}</p>
          ${groupMarkup("purpose", "purpose")}
          ${groupMarkup("vibe", "vibe")}
          ${groupMarkup("show", "show")}
          <div class="guided-actions">
            <button id="guided-apply" class="icon-btn">${esc(t("guided.apply"))}</button>
            <button id="guided-close" class="icon-btn">${esc(t("guided.close"))}</button>
          </div>
        </section>
      </div>
    `;
    const panel = document.getElementById("guided-panel");
    if (!panel) return;
    panel.querySelectorAll(".guided-group button").forEach((button) => {
      if (button.dataset.value === state.guided[button.closest(".guided-group").dataset.kind]) button.classList.add("active");
      button.addEventListener("click", () => {
        const group = button.closest(".guided-group");
        group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        state.guided[group.dataset.kind] = button.dataset.value;
      });
    });
    document.getElementById("guided-close").onclick = () => (panel.hidden = true);
    panel.querySelector(".guided-backdrop").onclick = () => (panel.hidden = true);
    document.getElementById("guided-apply").onclick = () => {
      const themeTarget = getGuidedOptions().vibeThemeMap?.[state.guided.vibe];
      if (themeTarget) applyTheme(themeTarget);
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

  function syncJSONTextareaFromDraft() {
    const box = document.getElementById("editor-json");
    if (box && state.editor.jsonDraft) box.value = JSON.stringify(state.editor.jsonDraft, null, 2);
  }

  function syncJSONDraftFromTextarea() {
    const box = document.getElementById("editor-json");
    if (!box) return true;
    try {
      state.editor.jsonDraft = sanitizeContent(JSON.parse(box.value));
      return true;
    } catch (_) {
      setEditorStatus(t("editor.invalidJson"), true);
      return false;
    }
  }

  function jsonNodeType(value) {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (isObject(value)) return "object";
    return "string";
  }

  function defaultJSONValue(type) {
    switch (type) {
      case "number":
        return 0;
      case "boolean":
        return true;
      case "object":
        return {};
      case "array":
        return [];
      case "null":
        return null;
      default:
        return "";
    }
  }

  function encodeJSONPath(path) {
    return encodeURIComponent(JSON.stringify(path));
  }

  function decodeJSONPath(raw) {
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch (_) {
      return [];
    }
  }

  function getJSONNodeAtPath(root, path) {
    return path.reduce((acc, key) => (acc == null ? acc : acc[key]), root);
  }

  function setJSONNodeAtPath(root, path, value) {
    if (!path.length) {
      state.editor.jsonDraft = value;
      return;
    }
    const parent = getJSONNodeAtPath(root, path.slice(0, -1));
    if (parent == null) return;
    parent[path[path.length - 1]] = value;
  }

  function removeJSONNodeAtPath(root, path) {
    if (!path.length) return;
    const parent = getJSONNodeAtPath(root, path.slice(0, -1));
    const key = path[path.length - 1];
    if (Array.isArray(parent)) parent.splice(Number(key), 1);
    else if (isObject(parent)) delete parent[key];
  }

  function renameJSONKey(root, path, nextKey) {
    if (!path.length) return { ok: false, reason: "root" };
    const parent = getJSONNodeAtPath(root, path.slice(0, -1));
    const prevKey = path[path.length - 1];
    if (!isObject(parent) || Array.isArray(parent)) return { ok: false, reason: "parent" };
    const trimmed = String(nextKey || "").trim();
    if (!trimmed) return { ok: false, reason: "invalid" };
    if (trimmed === prevKey) return { ok: true, path };
    if (Object.prototype.hasOwnProperty.call(parent, trimmed)) return { ok: false, reason: "duplicate" };
    const entries = Object.entries(parent);
    const idx = entries.findIndex(([key]) => key === prevKey);
    entries[idx] = [trimmed, parent[prevKey]];
    Object.keys(parent).forEach((key) => delete parent[key]);
    entries.forEach(([key, value]) => {
      parent[key] = value;
    });
    return { ok: true, path: [...path.slice(0, -1), trimmed] };
  }

  function jsonTypeOptions(selected) {
    const strings = editorStrings();
    const types = ["string", "number", "boolean", "object", "array", "null"];
    return types
      .map((type) => `<option value="${type}" ${type === selected ? "selected" : ""}>${esc(strings[`type${type.charAt(0).toUpperCase()}${type.slice(1)}`] || type)}</option>`)
      .join("");
  }

  function renderJSONBuilderNode(value, path) {
    const strings = editorStrings();
    const type = jsonNodeType(value);
    const encodedPath = encodeJSONPath(path);
    const lastKey = path[path.length - 1];
    const isArrayItem = typeof lastKey === "number";
    const keyControl = !path.length
      ? `<span class="json-node-key-label">${esc(strings.rootLabel || "Site Config")}</span>`
      : isArrayItem
        ? `<span class="json-node-key-label">${esc((strings.itemLabel || "Item") + " " + (Number(lastKey) + 1))}</span>`
        : `<input class="json-node-key" data-json-role="key" data-json-path="${encodedPath}" value="${esc(lastKey)}" />`;

    let body = "";
    if (type === "object" || type === "array") {
      const items = (type === "array" ? value.map((item, idx) => [idx, item]) : Object.entries(value)).map(([key, child]) =>
        renderJSONBuilderNode(child, [...path, key])
      );
      const addControls =
        type === "object"
          ? `<div class="json-node-add">
              <input data-json-role="new-key" placeholder="${esc(strings.keyLabel || "Key")}" />
              <select data-json-role="new-type">${jsonTypeOptions("string")}</select>
              <button class="icon-btn" data-json-action="add-field" data-json-path="${encodedPath}" type="button">${esc(strings.addField || "+ Add Field")}</button>
            </div>`
          : `<div class="json-node-add">
              <select data-json-role="new-type">${jsonTypeOptions("string")}</select>
              <button class="icon-btn" data-json-action="add-item" data-json-path="${encodedPath}" type="button">${esc(strings.addItem || "+ Add Item")}</button>
            </div>`;
      body = `<div class="json-node-children">${items.join("") || `<p class="muted json-empty">(${type})</p>`}</div>${addControls}`;
    } else if (type === "boolean") {
      body = `<select class="json-node-value" data-json-role="value" data-json-path="${encodedPath}" data-json-type="boolean">
        <option value="true" ${value ? "selected" : ""}>true</option>
        <option value="false" ${!value ? "selected" : ""}>false</option>
      </select>`;
    } else if (type === "number") {
      body = `<input class="json-node-value" data-json-role="value" data-json-path="${encodedPath}" data-json-type="number" type="number" step="any" value="${esc(String(value))}" />`;
    } else if (type === "null") {
      body = `<p class="muted json-empty">null</p>`;
    } else {
      body = `<textarea class="json-node-value" data-json-role="value" data-json-path="${encodedPath}" data-json-type="string" rows="${String(value).includes("\n") || String(value).length > 90 ? 3 : 1}">${esc(value)}</textarea>`;
    }

    return `<div class="json-node" style="--json-depth:${path.length}">
      <div class="json-node-head">
        <div class="json-node-title">${keyControl}</div>
        <div class="json-node-tools">
          <select data-json-role="type" data-json-path="${encodedPath}" ${!path.length ? "disabled" : ""}>${jsonTypeOptions(type)}</select>
          ${path.length ? `<button class="icon-btn danger-btn" data-json-action="remove-node" data-json-path="${encodedPath}" type="button">${esc(strings.removeNode || strings.remove || "Remove")}</button>` : ""}
        </div>
      </div>
      <div class="json-node-body">${body}</div>
    </div>`;
  }

  function renderJSONBuilder() {
    const wrap = document.getElementById("editor-json-builder");
    if (!wrap) return;
    if (!state.editor.jsonDraft) state.editor.jsonDraft = sanitizeContent(state.content);
    wrap.innerHTML = renderJSONBuilderNode(state.editor.jsonDraft, []);

    wrap.oninput = (event) => {
      const field = event.target.closest("[data-json-role='value']");
      if (!field) return;
      const path = decodeJSONPath(field.dataset.jsonPath);
      const type = field.dataset.jsonType;
      if (type === "string") setJSONNodeAtPath(state.editor.jsonDraft, path, field.value);
      if (type === "number") setJSONNodeAtPath(state.editor.jsonDraft, path, Number(field.value || 0));
      syncJSONTextareaFromDraft();
      setEditorStatus(t("editor.builderUpdated"), false);
    };

    wrap.onchange = (event) => {
      const field = event.target;
      if (field.dataset.jsonRole === "key") {
        const result = renameJSONKey(state.editor.jsonDraft, decodeJSONPath(field.dataset.jsonPath), field.value);
        if (!result.ok) {
          setEditorStatus(result.reason === "duplicate" ? t("editor.duplicateKey") : t("editor.invalidKey"), true);
          renderJSONBuilder();
          return;
        }
        syncJSONTextareaFromDraft();
        renderJSONBuilder();
        setEditorStatus(t("editor.builderUpdated"), false);
      }
      if (field.dataset.jsonRole === "type") {
        setJSONNodeAtPath(state.editor.jsonDraft, decodeJSONPath(field.dataset.jsonPath), defaultJSONValue(field.value));
        syncJSONTextareaFromDraft();
        renderJSONBuilder();
        setEditorStatus(t("editor.builderUpdated"), false);
      }
      if (field.dataset.jsonRole === "value" && field.dataset.jsonType === "boolean") {
        setJSONNodeAtPath(state.editor.jsonDraft, decodeJSONPath(field.dataset.jsonPath), field.value === "true");
        syncJSONTextareaFromDraft();
        setEditorStatus(t("editor.builderUpdated"), false);
      }
    };

    wrap.onclick = (event) => {
      const button = event.target.closest("[data-json-action]");
      if (!button) return;
      const action = button.dataset.jsonAction;
      const path = decodeJSONPath(button.dataset.jsonPath);
      if (action === "remove-node") {
        removeJSONNodeAtPath(state.editor.jsonDraft, path);
      } else if (action === "add-item") {
        const scope = button.closest(".json-node-add");
        getJSONNodeAtPath(state.editor.jsonDraft, path).push(defaultJSONValue(scope.querySelector("[data-json-role='new-type']").value));
      } else if (action === "add-field") {
        const scope = button.closest(".json-node-add");
        const keyInput = scope.querySelector("[data-json-role='new-key']");
        const newKey = keyInput.value.trim();
        const target = getJSONNodeAtPath(state.editor.jsonDraft, path);
        if (!newKey) {
          setEditorStatus(t("editor.invalidKey"), true);
          return;
        }
        if (Object.prototype.hasOwnProperty.call(target, newKey)) {
          setEditorStatus(t("editor.duplicateKey"), true);
          return;
        }
        target[newKey] = defaultJSONValue(scope.querySelector("[data-json-role='new-type']").value);
      }
      syncJSONTextareaFromDraft();
      renderJSONBuilder();
      setEditorStatus(t("editor.builderUpdated"), false);
    };
  }

  function syncEditorPageOptions() {
    const pageSelect = document.getElementById("editor-page-select");
    if (!pageSelect) return;
    const pageKeys = getPageKeys();
    if (!pageKeys.includes(state.editor.pageId)) state.editor.pageId = pageKeys[0] || "home";
    pageSelect.innerHTML = pageKeys.map((pid) => `<option value="${pid}">${esc(navLabel(pid, state.editor.pageLang))}</option>`).join("");
    pageSelect.value = state.editor.pageId;
  }

  function addEditorSection(type) {
    if (!state.editor.draft) return;
    const sectionType = normalizeSectionType(type, "text");
    const section = createSectionTemplate(sectionType);
    section.title = editorStrings().defaultSectionTitle || "New Section";
    if (sectionType === "text" || sectionType === "image") section.body = editorStrings().defaultSectionBody || "Write your content here.";
    if (sectionType === "html") section.html = `<div>${esc(editorStrings().defaultSectionBody || "Write your content here.")}</div>`;
    state.editor.draft.sections.push(section);
    state.editor.selection = { kind: "section", index: state.editor.draft.sections.length - 1 };
    renderPageItemEditor();
  }

  function addEditorSectionFromTemplate(templateId) {
    if (!state.editor.draft) return;
    const strings = editorStrings();
    const templates = {
      hero: { type: "text", title: strings.templateHeroTitle || "Welcome", body: strings.templateHeroBody || "A bold introduction to your content. Replace this with your own message.", span: "wide", theme: "accent", padding: "lg", align: "center" },
      testimonial: { type: "text", title: strings.templateTestimonialTitle || "What People Say", body: strings.templateTestimonialBody || "\"This is a testimonial quote. Replace it with real feedback from your students or colleagues.\"", theme: "outline", align: "center" },
      timeline: { type: "html", title: strings.templateTimelineTitle || "Timeline", html: `<div class="section-html"><ul style="list-style:none;padding:0;display:grid;gap:12px;"><li><strong>2026</strong> - Current milestone or achievement</li><li><strong>2025</strong> - Previous achievement</li><li><strong>2024</strong> - Earlier milestone</li></ul></div>` },
      twoColumn: { type: "text", title: strings.templateTwoColTitle || "Two Column Section", body: strings.templateTwoColBody || "Left column content.", layout: "split", span: "wide" },
      imageWithText: { type: "image", title: strings.templateImgTextTitle || "Image with Text", body: strings.templateImgTextBody || "Supporting text for this image.", imageSrc: "https://placehold.co/800x500/png", imageAlt: "Placeholder image", layout: "split", span: "wide" },
      videoEmbed: { type: "video", title: strings.templateVideoTitle || "Video Presentation", body: strings.templateVideoBody || "A video presentation or demonstration.", videoSrc: "" },
      audioEmbed: { type: "audio", title: strings.templateAudioTitle || "Audio Recording", body: strings.templateAudioBody || "An audio recording or podcast episode.", audioSrc: "" },
      galleryBlock: { type: "gallery", title: strings.templateGalleryTitle || "Photo Gallery", body: strings.templateGalleryBody || "A collection of images.", galleryImages: [{ src: "https://placehold.co/800x500/png", alt: "Gallery image 1" }, { src: "https://placehold.co/800x500/png", alt: "Gallery image 2" }, { src: "https://placehold.co/800x500/png", alt: "Gallery image 3" }] },
      callToAction: { type: "html", title: strings.templateCtaTitle || "Call to Action", html: `<div style="text-align:center;padding:20px;"><a href="#" style="display:inline-block;padding:12px 28px;border-radius:999px;background:var(--accent);color:#09110b;text-decoration:none;font-weight:700;">${strings.templateCtaText || "Take Action"}</a></div>`, theme: "accent", align: "center" },
      divider: { type: "html", title: "", html: `<hr style="border:none;border-top:1px solid var(--border);margin:16px 0;" />`, padding: "sm" }
    };
    const template = templates[templateId];
    if (!template) return;
    const section = { ...createSectionTemplate(template.type), ...template };
    state.editor.draft.sections.push(section);
    state.editor.selection = { kind: "section", index: state.editor.draft.sections.length - 1 };
    renderPageItemEditor();
  }

  function ensureInlineEditor() {
    let root = document.getElementById("inline-editor-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "inline-editor-root";
      document.body.appendChild(root);
    }
    root.innerHTML = `
      <aside id="inline-editor-panel" class="inline-editor-panel" hidden>
        <section class="inline-editor-shell terminal-card" role="complementary" aria-label="Quick editor">
          <div class="inline-editor-head">
            <div class="inline-editor-copy">
              <p id="inline-editor-kicker" class="inline-editor-kicker"></p>
              <h2 id="inline-editor-title"></h2>
              <p id="inline-editor-subtitle" class="muted"></p>
            </div>
            <div class="inline-editor-top-actions">
              <button id="inline-editor-open-studio" class="icon-btn" type="button"></button>
              <button id="inline-editor-save" class="icon-btn" type="button"></button>
              <button id="inline-editor-close" class="icon-btn" type="button">x</button>
            </div>
          </div>
          <div class="inline-editor-toolbar">
            <div class="inline-editor-page-meta">
              <span id="inline-editor-current-page" class="inline-editor-page-title"></span>
              <code id="inline-editor-page-path" class="inline-editor-page-path"></code>
              <span id="inline-editor-sections-count" class="muted"></span>
            </div>
            <div class="editor-card-tools">
              <select id="inline-editor-add-kind"></select>
              <button id="inline-editor-add-section" class="icon-btn" type="button"></button>
            </div>
          </div>
          <section id="inline-editor-visual-note" class="editor-card inline-editor-note" hidden>
            <p id="inline-editor-visual-text" class="muted"></p>
            <div class="editor-actions">
              <button id="inline-editor-edit-visual" class="icon-btn" type="button"></button>
              <button id="inline-editor-use-structured" class="icon-btn danger-btn" type="button"></button>
            </div>
          </section>
          <div class="inline-editor-body">
            <section class="editor-card inline-editor-items-card">
              <div class="editor-card-head">
                <h3 id="inline-editor-items-label"></h3>
              </div>
              <div id="inline-editor-items" class="editor-page-canvas inline-editor-items"></div>
            </section>
            <section class="editor-card inline-editor-inspector-card">
              <div class="editor-card-head">
                <h3 id="inline-editor-inspector-label"></h3>
              </div>
              <div id="inline-editor-inspector" class="editor-page-inspector"></div>
            </section>
          </div>
          <p id="inline-editor-status" class="status-line" aria-live="polite"></p>
        </section>
      </aside>
    `;

    document.getElementById("inline-editor-close").addEventListener("click", () => closeInlineEditor());
    document.getElementById("inline-editor-save").addEventListener("click", saveEditorDraft);
    document.getElementById("inline-editor-open-studio").addEventListener("click", () => {
      openEditor({ tab: state.editor.draft?.builderHtml?.trim() ? "visual" : "page", preserveDraft: true });
    });
    document.getElementById("inline-editor-add-section").addEventListener("click", () => {
      const val = document.getElementById("inline-editor-add-kind")?.value;
      if (val.startsWith("tpl:")) addEditorSectionFromTemplate(val.replace("tpl:", ""));
      else addEditorSection(val);
    });
    document.getElementById("inline-editor-edit-visual").addEventListener("click", () => {
      openEditor({ tab: "visual", preserveDraft: true });
    });
    document.getElementById("inline-editor-use-structured").addEventListener("click", clearVisualDraft);
  }

  function syncInlineEditorLocale() {
    const panel = document.getElementById("inline-editor-panel");
    if (!panel) return;
    const strings = editorStrings();
    document.getElementById("inline-editor-kicker").textContent = strings.quickKicker || "Same-Page Editor";
    document.getElementById("inline-editor-title").textContent = strings.quickTitle || "Quick Edit";
    document.getElementById("inline-editor-subtitle").textContent =
      strings.quickHint || "Select something on the page or from the list, then edit it here.";
    document.getElementById("inline-editor-open-studio").textContent = strings.openStudio || "Open Studio";
    document.getElementById("inline-editor-save").textContent = strings.savePage || "Save Page";
    document.getElementById("inline-editor-add-section").textContent = strings.addSection || "+ Add Block";
    document.getElementById("inline-editor-items-label").textContent = strings.canvasLabel || "Page Items";
    document.getElementById("inline-editor-inspector-label").textContent = strings.inspectorLabel || "Selected Item";
    document.getElementById("inline-editor-visual-text").textContent =
      strings.visualPageHint || "This page is currently using a visual layout. Structured block edits are saved, but they will not show until you switch back to blocks.";
    document.getElementById("inline-editor-edit-visual").textContent = strings.editVisual || "Edit Visual Layout";
    document.getElementById("inline-editor-use-structured").textContent = strings.useStructured || "Use Structured Blocks";
    document.getElementById("inline-editor-add-kind").innerHTML = `
      <optgroup label="${esc(strings.basicBlocks || "Basic Blocks")}">
        <option value="text">${esc(strings.typeTextBlock || "Text Block")}</option>
        <option value="image">${esc(strings.typeImageBlock || "Image Block")}</option>
        <option value="video">${esc(strings.typeVideoBlock || "Video Block")}</option>
        <option value="audio">${esc(strings.typeAudioBlock || "Audio Block")}</option>
        <option value="gallery">${esc(strings.typeGalleryBlock || "Gallery Block")}</option>
        <option value="html">${esc(strings.typeHtmlBlock || "HTML Block")}</option>
      </optgroup>
      <optgroup label="${esc(strings.templates || "Templates")}">
        <option value="tpl:hero">${esc(strings.templateHero || "Hero Section")}</option>
        <option value="tpl:testimonial">${esc(strings.templateTestimonial || "Testimonial")}</option>
        <option value="tpl:timeline">${esc(strings.templateTimeline || "Timeline")}</option>
        <option value="tpl:twoColumn">${esc(strings.templateTwoCol || "Two Column")}</option>
        <option value="tpl:imageWithText">${esc(strings.templateImgText || "Image with Text")}</option>
        <option value="tpl:callToAction">${esc(strings.templateCta || "Call to Action")}</option>
        <option value="tpl:divider">${esc(strings.templateDivider || "Divider")}</option>
      </optgroup>
    `;
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
            <button class="editor-tab" data-editor-tab="visual"></button>
            <button class="editor-tab" data-editor-tab="builder"></button>
            <button class="editor-tab" data-editor-tab="json"></button>
          </div>
          <div class="editor-pane active" data-editor-pane="page">
            <div class="editor-page-shell">
              <section class="editor-card">
                <div class="editor-card-head">
                  <h3 id="editor-essentials-label"></h3>
                  <a id="editor-open-page" class="icon-btn editor-link-btn" href="#" target="_blank" rel="noopener noreferrer"></a>
                </div>
                <div class="editor-grid">
                  <label>
                    <span id="editor-lang-label"></span>
                    <select id="editor-lang-select"></select>
                  </label>
                  <label>
                    <span id="editor-page-label"></span>
                    <select id="editor-page-select"></select>
                  </label>
                  <label>
                    <span id="editor-page-path-label"></span>
                    <input id="editor-page-path" type="text" readonly />
                  </label>
                </div>
                <p id="editor-sections-count" class="muted"></p>
              </section>
              <div class="editor-page-workspace">
                <section class="editor-card">
                  <div class="editor-card-head">
                    <h3 id="editor-canvas-label"></h3>
                    <div class="editor-card-tools">
                      <select id="editor-add-kind"></select>
                      <button id="editor-add-section" class="icon-btn" type="button"></button>
                    </div>
                  </div>
                  <div id="editor-page-canvas" class="editor-page-canvas"></div>
                </section>
                <section class="editor-card">
                  <div class="editor-card-head">
                    <h3 id="editor-inspector-label"></h3>
                  </div>
                  <div id="editor-page-inspector" class="editor-page-inspector"></div>
                </section>
              </div>
            </div>
            <div class="editor-actions">
              <button id="editor-save-page" class="icon-btn" type="button"></button>
            </div>
          </div>
          <div class="editor-pane" data-editor-pane="visual">
            <p id="editor-visual-hint" class="muted"></p>
            <div class="editor-actions">
              <button id="editor-save-visual" class="icon-btn" type="button"></button>
              <button id="editor-clear-visual" class="icon-btn danger-btn" type="button"></button>
            </div>
            <div class="editor-visual-shell">
              <div id="editor-visual-canvas" class="editor-visual-canvas"></div>
            </div>
          </div>
          <div class="editor-pane" data-editor-pane="builder">
            <p id="editor-builder-hint" class="muted"></p>
            <div id="editor-json-builder" class="json-builder"></div>
          </div>
          <div class="editor-pane" data-editor-pane="json">
            <label>
              <span id="editor-json-label"></span>
              <p id="editor-json-hint" class="muted"></p>
              <textarea id="editor-json" rows="18"></textarea>
            </label>
            <input id="editor-import-file" type="file" accept="application/json,.json" hidden />
            <div class="editor-actions">
              <button id="editor-copy-json" class="icon-btn" type="button"></button>
              <button id="editor-download-json" class="icon-btn" type="button"></button>
              <button id="editor-import-json" class="icon-btn" type="button"></button>
              <button id="editor-format-json" class="icon-btn" type="button"></button>
              <button id="editor-apply-json" class="icon-btn" type="button"></button>
              <button id="editor-reset-json" class="icon-btn" type="button"></button>
            </div>
          </div>
          <p id="editor-status" class="status-line" aria-live="polite"></p>
        </section>
      </div>
    `;

    const langSelect = document.getElementById("editor-lang-select");
    const addKind = document.getElementById("editor-add-kind");
    langSelect.innerHTML = `
      <option value="en">English</option>
      <option value="ar">العربية</option>
    `;
    document.getElementById("editor-add-kind").innerHTML = `
      <optgroup label="${esc(strings.basicBlocks || "Basic Blocks")}">
        <option value="text">${esc(strings.typeTextBlock || "Text Block")}</option>
        <option value="image">${esc(strings.typeImageBlock || "Image Block")}</option>
        <option value="video">${esc(strings.typeVideoBlock || "Video Block")}</option>
        <option value="audio">${esc(strings.typeAudioBlock || "Audio Block")}</option>
        <option value="gallery">${esc(strings.typeGalleryBlock || "Gallery Block")}</option>
        <option value="html">${esc(strings.typeHtmlBlock || "HTML Block")}</option>
      </optgroup>
      <optgroup label="${esc(strings.templates || "Templates")}">
        <option value="tpl:hero">${esc(strings.templateHero || "Hero Section")}</option>
        <option value="tpl:testimonial">${esc(strings.templateTestimonial || "Testimonial")}</option>
        <option value="tpl:timeline">${esc(strings.templateTimeline || "Timeline")}</option>
        <option value="tpl:twoColumn">${esc(strings.templateTwoCol || "Two Column")}</option>
        <option value="tpl:imageWithText">${esc(strings.templateImgText || "Image with Text")}</option>
        <option value="tpl:callToAction">${esc(strings.templateCta || "Call to Action")}</option>
        <option value="tpl:divider">${esc(strings.templateDivider || "Divider")}</option>
      </optgroup>
    `;
    syncEditorPageOptions();

    root.querySelectorAll("[data-editor-tab]").forEach((button) => {
      button.addEventListener("click", () => switchEditorTab(button.dataset.editorTab));
    });
    document.getElementById("editor-close").addEventListener("click", closeEditor);
    document.querySelector("[data-editor-close='true']").addEventListener("click", closeEditor);
    langSelect.addEventListener("change", () => {
      const hadLivePreview = isLivePagePreviewActive();
      if (state.editor.tab === "visual") cacheVisualDraft();
      state.editor.pageLang = langSelect.value;
      syncEditorPageOptions();
      loadEditorDraft(hadLivePreview);
    });
    document.getElementById("editor-page-select").addEventListener("change", () => {
      const hadLivePreview = isLivePagePreviewActive();
      if (state.editor.tab === "visual") cacheVisualDraft();
      state.editor.pageId = document.getElementById("editor-page-select").value;
      loadEditorDraft(hadLivePreview);
    });
    document.getElementById("editor-add-section").addEventListener("click", () => {
      const val = document.getElementById("editor-add-kind")?.value;
      if (val.startsWith("tpl:")) addEditorSectionFromTemplate(val.replace("tpl:", ""));
      else addEditorSection(val);
    });
    document.getElementById("editor-save-page").addEventListener("click", saveEditorDraft);
    document.getElementById("editor-save-visual").addEventListener("click", saveVisualDraft);
    document.getElementById("editor-clear-visual").addEventListener("click", clearVisualDraft);
    document.getElementById("editor-copy-json").addEventListener("click", copyEditorJSON);
    document.getElementById("editor-download-json").addEventListener("click", downloadEditorJSON);
    document.getElementById("editor-import-json").addEventListener("click", () => document.getElementById("editor-import-file").click());
    document.getElementById("editor-format-json").addEventListener("click", formatEditorJSON);
    document.getElementById("editor-apply-json").addEventListener("click", applyEditorJSON);
    document.getElementById("editor-reset-json").addEventListener("click", resetContent);
    document.getElementById("editor-import-file").addEventListener("change", importEditorJSON);
  }

  function syncEditorLocale() {
    const strings = editorStrings();
    const panel = document.getElementById("editor-panel");
    if (!panel) return;
    document.getElementById("editor-title").textContent = strings.title || "";
    document.getElementById("editor-subtitle").textContent = strings.subtitle || "";
    panel.querySelector("[data-editor-tab='page']").textContent = strings.tabPage || "";
    panel.querySelector("[data-editor-tab='visual']").textContent = strings.tabVisual || "Visual Builder";
    panel.querySelector("[data-editor-tab='builder']").textContent = strings.tabBuilder || "";
    panel.querySelector("[data-editor-tab='json']").textContent = strings.tabJson || "";
    document.getElementById("editor-essentials-label").textContent = strings.essentials || "";
    document.getElementById("editor-canvas-label").textContent = strings.canvasLabel || "";
    document.getElementById("editor-inspector-label").textContent = strings.inspectorLabel || "";
    document.getElementById("editor-add-kind").innerHTML = `
      <option value="text">${esc(strings.typeTextBlock || "Text Block")}</option>
      <option value="image">${esc(strings.typeImageBlock || "Image Block")}</option>
      <option value="html">${esc(strings.typeHtmlBlock || "HTML Block")}</option>
    `;
    document.getElementById("editor-lang-label").textContent = strings.lang || "";
    document.getElementById("editor-page-label").textContent = strings.page || "";
    document.getElementById("editor-page-path-label").textContent = strings.pagePathLabel || "";
    document.getElementById("editor-open-page").textContent = strings.openPage || "";
    document.getElementById("editor-add-section").textContent = strings.addSection || "";
    document.getElementById("editor-save-page").textContent = strings.savePage || "";
    document.getElementById("editor-visual-hint").textContent = strings.visualHint || "";
    document.getElementById("editor-save-visual").textContent = strings.saveVisual || "Save Visual Layout";
    document.getElementById("editor-clear-visual").textContent = strings.clearVisual || "Clear Visual Layout";
    document.getElementById("editor-builder-hint").textContent = strings.builderHint || "";
    document.getElementById("editor-json-label").textContent = strings.jsonLabel || "";
    document.getElementById("editor-json-hint").textContent = strings.jsonHint || "";
    document.getElementById("editor-copy-json").textContent = strings.copyJson || "";
    document.getElementById("editor-download-json").textContent = strings.downloadJson || "";
    document.getElementById("editor-import-json").textContent = strings.importJson || "";
    document.getElementById("editor-format-json").textContent = strings.formatJson || "";
    document.getElementById("editor-apply-json").textContent = strings.applyJson || "";
    document.getElementById("editor-reset-json").textContent = strings.reset || "";
  }

  function setEditorStatus(message, isError) {
    ["editor-status", "inline-editor-status"].forEach((id) => {
      const status = document.getElementById(id);
      if (!status) return;
      status.textContent = message || "";
      status.classList.toggle("error", Boolean(isError));
    });
  }

  function cacheVisualDraft() {
    const key = state.editor.visualLoadedKey;
    const editor = state.editor.visualEditor;
    if (!key || !editor) return;
    state.editor.visualDrafts[key] = {
      html: editor.getHtml(),
      css: editor.getCss()
    };
  }

  function registerVisualBlocks(editor) {
    if (!editor || editor.__muBlocksReady) return;
    editor.__muBlocksReady = true;
    const blocks = editor.BlockManager;
    blocks.add("mu-text-card", {
      label: "Text Card",
      category: "Portfolio",
      content: `<section class="visual-card"><h2>Heading</h2><p>Write your content here.</p></section>`
    });
    blocks.add("mu-image-card", {
      label: "Image Card",
      category: "Portfolio",
      content: `<section class="visual-card half"><img src="https://placehold.co/800x500/png" alt="Placeholder" /><h2>Image Block</h2><p>Add caption or supporting text here.</p></section>`
    });
    blocks.add("mu-video-card", {
      label: "Video Card",
      category: "Portfolio",
      content: `<section class="visual-card"><h2>Video</h2><video controls style="width:100%;border-radius:12px;"><source src="" /></video><p>Video description or caption.</p></section>`
    });
    blocks.add("mu-audio-card", {
      label: "Audio Card",
      category: "Portfolio",
      content: `<section class="visual-card third"><h2>Audio</h2><audio controls style="width:100%;"><source src="" /></audio><p>Audio description or caption.</p></section>`
    });
    blocks.add("mu-two-column", {
      label: "Two Columns",
      category: "Layout",
      content: `<section class="visual-card"><div class="visual-split"><div><h2>Left column</h2><p>Content on the left.</p></div><div><h2>Right column</h2><p>Content on the right.</p></div></div></section>`
    });
    blocks.add("mu-button", {
      label: "Button",
      category: "Portfolio",
      content: `<div class="visual-card third"><a href="#" style="display:inline-block;padding:12px 18px;border-radius:999px;text-decoration:none;background:#39ff8f;color:#07110d;">Action</a></div>`
    });
    blocks.add("mu-custom-code", {
      label: "Custom HTML",
      category: "Portfolio",
      content: `<section class="visual-card"><div><strong>Custom block</strong><p>Edit this block and replace it with your own HTML.</p></div></section>`
    });
  }

  async function ensureVisualEditorReady() {
    if (state.editor.visualEditor) return state.editor.visualEditor;
    if (state.editor.visualLoading) return null;
    state.editor.visualLoading = true;
    try {
      await loadExternalStyleOnce("grapesjs-style", `${visualAssetPrefix}grapes.min.css`);
      await loadExternalScriptOnce("grapesjs-script", `${visualAssetPrefix}grapes.min.js`);
      if (!window.grapesjs) throw new Error("GrapesJS not available");
      const editor = window.grapesjs.init({
        container: "#editor-visual-canvas",
        height: "70vh",
        fromElement: false,
        storageManager: false,
        noticeOnUnload: false,
        selectorManager: { componentFirst: true },
        deviceManager: {
          devices: [
            { id: "desktop", name: "Desktop", width: "" },
            { id: "tablet", name: "Tablet", width: "768px", widthMedia: "992px" },
            { id: "mobile", name: "Mobile", width: "375px", widthMedia: "576px" }
          ]
        }
      });
      registerVisualBlocks(editor);
      state.editor.visualEditor = editor;
      return editor;
    } finally {
      state.editor.visualLoading = false;
    }
  }

  async function openVisualBuilder() {
    if (!state.editor.draft) return;
    const strings = editorStrings();
    setEditorStatus(strings.visualLoading || "Loading visual builder...", false);
    try {
      const editor = await ensureVisualEditorReady();
      if (!editor) return;
      const key = editorPageKey();
      const payload = currentVisualPayload();
      if (state.editor.visualLoadedKey !== key) {
        editor.setComponents(payload.html);
        editor.setStyle(payload.css);
        state.editor.visualLoadedKey = key;
      }
      if (typeof editor.refresh === "function") editor.refresh();
      setEditorStatus(strings.visualReady || "Visual builder ready.", false);
    } catch (_) {
      setEditorStatus(strings.visualLoadFailed || "Visual builder failed to load.", true);
    }
  }

  function saveVisualDraft() {
    if (!state.editor.visualEditor || !state.editor.draft) return;
    const key = editorPageKey();
    const html = state.editor.visualEditor.getHtml();
    const css = state.editor.visualEditor.getCss();
    state.editor.visualDrafts[key] = { html, css };
    state.editor.draft.builderHtml = html;
    state.editor.draft.builderCss = css;
    saveEditorDraft();
    setEditorStatus(editorStrings().visualSaved || "Visual layout saved.", false);
  }

  function clearVisualDraft() {
    if (!state.editor.draft) return;
    const key = editorPageKey();
    delete state.editor.visualDrafts[key];
    state.editor.visualLoadedKey = "";
    state.editor.draft.builderHtml = "";
    state.editor.draft.builderCss = "";
    saveEditorDraft();
    if (state.editor.tab === "visual") void openVisualBuilder();
    setEditorStatus(editorStrings().visualCleared || "Visual layout cleared.", false);
  }

  function switchEditorTab(tabId) {
    const hadLivePreview = isLivePagePreviewActive();
    if (state.editor.tab === "json" && tabId !== "json") syncJSONDraftFromTextarea();
    if (state.editor.tab === "visual" && tabId !== "visual") cacheVisualDraft();
    state.editor.tab = tabId === "json" ? "json" : tabId === "builder" ? "builder" : tabId === "visual" ? "visual" : "page";
    document.querySelectorAll("[data-editor-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.editorTab === state.editor.tab);
    });
    document.querySelectorAll("[data-editor-pane]").forEach((pane) => {
      pane.classList.toggle("active", pane.dataset.editorPane === state.editor.tab);
    });
    if (!state.editor.jsonDraft) state.editor.jsonDraft = sanitizeContent(state.content);
    if (state.editor.tab === "json") syncJSONTextareaFromDraft();
    if (state.editor.tab === "builder") renderJSONBuilder();
    if (state.editor.tab === "page" && state.editor.draft) renderPageItemEditor();
    if (state.editor.tab === "visual" && state.editor.draft) void openVisualBuilder();
    if (hadLivePreview && !isLivePagePreviewActive()) renderSavedCurrentPage();
  }

  function loadEditorDraft(hadLivePreview) {
    const langSelect = document.getElementById("editor-lang-select");
    const pageSelect = document.getElementById("editor-page-select");
    if (langSelect) langSelect.value = state.editor.pageLang;
    if (pageSelect) {
      syncEditorPageOptions();
      pageSelect.value = state.editor.pageId;
    } else {
      const pageKeys = getPageKeys();
      if (!pageKeys.includes(state.editor.pageId)) state.editor.pageId = pageKeys[0] || "home";
    }
    state.editor.navLabel = navLabel(state.editor.pageId, state.editor.pageLang);
    state.editor.draft = deepClone(getPageContent(state.editor.pageLang, state.editor.pageId));
    state.editor.selection = { kind: "title" };
    refreshEditorForm();
    if (state.editor.tab === "visual") void openVisualBuilder();
    if (hadLivePreview && !isLivePagePreviewActive()) renderSavedCurrentPage();
  }

  function syncEditorPageDetails() {
    const pathInput = document.getElementById("editor-page-path");
    const openLink = document.getElementById("editor-open-page");
    const count = document.getElementById("editor-sections-count");
    if (!pathInput || !openLink || !count) return;
    pathInput.value = getPageMap()[state.editor.pageId] || "";
    openLink.href = hrefFor(state.editor.pageId);
    count.textContent = formatText(editorStrings().sectionsCount || "Sections: {n}", { n: (state.editor.draft?.sections || []).length });
    const option = [...document.getElementById("editor-page-select").options].find((item) => item.value === state.editor.pageId);
    if (option) option.textContent = (state.editor.navLabel || "").trim() || navLabel(state.editor.pageId, state.editor.pageLang);
  }

  function normalizeEditorSelection() {
    const draft = state.editor.draft;
    const current = state.editor.selection || { kind: "title" };
    if (current.kind === "section") {
      const max = (draft?.sections || []).length - 1;
      if (max < 0) return { kind: "title" };
      return { kind: "section", index: Math.max(0, Math.min(max, Number(current.index) || 0)) };
    }
    return ["nav", "title", "subtitle", "prompt"].includes(current.kind) ? current : { kind: "title" };
  }

  function editorSelectionKey(selection) {
    return selection.kind === "section" ? `section:${selection.index}` : selection.kind;
  }

  function editorSectionTypeLabel(type) {
    const strings = editorStrings();
    if (type === "image") return strings.typeImageBlock || "Image Block";
    if (type === "video") return strings.typeVideoBlock || "Video Block";
    if (type === "audio") return strings.typeAudioBlock || "Audio Block";
    if (type === "gallery") return strings.typeGalleryBlock || "Gallery Block";
    if (type === "html") return strings.typeHtmlBlock || "HTML Block";
    return strings.typeTextBlock || "Text Block";
  }

  function editorSelectionLabel(selection) {
    const strings = editorStrings();
    if (selection.kind === "nav") return strings.itemNav || strings.navTitleLabel || "Menu Label";
    if (selection.kind === "title") return strings.itemTitle || strings.titleLabel || "Page Title";
    if (selection.kind === "subtitle") return strings.itemSubtitle || strings.subtitleLabel || "Page Subtitle";
    if (selection.kind === "prompt") return strings.itemPrompt || strings.prompt || "Terminal Prompt";
    if (selection.kind === "section") {
      const section = state.editor.draft?.sections?.[selection.index];
      return `${editorSectionTypeLabel(normalizeSectionType(section?.type))} ${selection.index + 1}`;
    }
    return strings.selectItemHint || "Select an item";
  }

  function editorSelectionPreview(selection) {
    const draft = state.editor.draft;
    if (!draft) return "";
    if (selection.kind === "nav") return state.editor.navLabel || navLabel(state.editor.pageId, state.editor.pageLang);
    if (selection.kind === "title") return draft.title || "";
    if (selection.kind === "subtitle") return draft.subtitle || "";
    if (selection.kind === "prompt") return draft.prompt || "";
    if (selection.kind === "section") {
      const section = draft.sections?.[selection.index];
      if (!section) return "";
      const stype = normalizeSectionType(section.type);
      if (stype === "image") return `${section.title || ""}\n${section.imageSrc || ""}\n${section.imageCaption || section.body || ""}`.trim();
      if (stype === "video") return `${section.title || ""}\n${section.videoSrc || ""}\n${section.videoCaption || section.body || ""}`.trim();
      if (stype === "audio") return `${section.title || ""}\n${section.audioSrc || ""}\n${section.audioCaption || section.body || ""}`.trim();
      if (stype === "gallery") return `${section.title || ""}\n${(section.galleryImages || []).length} images`.trim();
      if (stype === "html") return `${section.title || ""}\n${section.html || ""}`.trim();
      return `${section.title || ""}\n${section.body || ""}`.trim();
    }
    return "";
  }

  function buildPageEditorItems() {
    const draft = state.editor.draft;
    if (!draft) return [];
    return [
      { kind: "nav", title: editorSelectionLabel({ kind: "nav" }), preview: state.editor.navLabel || navLabel(state.editor.pageId, state.editor.pageLang) },
      { kind: "title", title: editorSelectionLabel({ kind: "title" }), preview: draft.title || "" },
      { kind: "subtitle", title: editorSelectionLabel({ kind: "subtitle" }), preview: draft.subtitle || "" },
      { kind: "prompt", title: editorSelectionLabel({ kind: "prompt" }), preview: draft.prompt || "" },
      ...(draft.sections || []).map((section, index) => ({
        kind: "section",
        index,
        title: editorSelectionLabel({ kind: "section", index }),
        preview: editorSelectionPreview({ kind: "section", index })
      }))
    ];
  }

  function syncInlineEditorMeta() {
    const panel = document.getElementById("inline-editor-panel");
    if (!panel || !state.editor.draft) return;
    document.getElementById("inline-editor-current-page").textContent =
      String(state.editor.navLabel || "").trim() || navLabel(state.editor.pageId, state.editor.pageLang);
    document.getElementById("inline-editor-page-path").textContent = getPageMap()[state.editor.pageId] || "";
    document.getElementById("inline-editor-sections-count").textContent = formatText(
      editorStrings().sectionsCount || "Sections: {n}",
      { n: (state.editor.draft.sections || []).length }
    );
    document.getElementById("inline-editor-visual-note").hidden = !String(state.editor.draft.builderHtml || "").trim();
  }

  function renderPageCanvas() {
    const wrap = document.getElementById("editor-page-canvas");
    const draft = state.editor.draft;
    if (!wrap || !draft) return;
    const selection = normalizeEditorSelection();
    state.editor.selection = selection;
    wrap.innerHTML = buildPageEditorItems()
      .map((item) => {
        const key = item.kind === "section" ? `section:${item.index}` : item.kind;
        return `<button class="editor-layer ${key === editorSelectionKey(selection) ? "active" : ""}" data-editor-select="${item.kind}" ${item.kind === "section" ? `data-editor-index="${item.index}"` : ""} type="button">
          <span class="editor-layer-title">${esc(item.title)}</span>
          <span class="editor-layer-preview">${esc(item.preview || editorStrings().itemPreview || "")}</span>
        </button>`;
      })
      .join("");
    wrap.querySelectorAll("[data-editor-select]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editor.selection =
          button.dataset.editorSelect === "section"
            ? { kind: "section", index: Number(button.dataset.editorIndex) }
            : { kind: button.dataset.editorSelect };
        renderPageItemEditor();
      });
    });
  }

  function renderPageInspector() {
    const wrap = document.getElementById("editor-page-inspector");
    const draft = state.editor.draft;
    if (!wrap || !draft) return;
    const strings = editorStrings();
    const selection = normalizeEditorSelection();
    state.editor.selection = selection;
    const selectedLabel = editorSelectionLabel(selection);
    const selectedPreview = editorSelectionPreview(selection);

    if (selection.kind === "nav") {
      wrap.innerHTML = `<div class="editor-inspector-shell">
        <p class="muted">${esc(selectedLabel)}</p>
        <label>
          <span>${esc(strings.navTitleLabel || "Menu Label")}</span>
          <input id="editor-selected-nav" type="text" value="${esc(state.editor.navLabel || "")}" />
        </label>
        <p class="muted">${esc(strings.itemPreview || "Preview")}: ${esc(selectedPreview)}</p>
      </div>`;
      document.getElementById("editor-selected-nav").addEventListener("input", (event) => {
        state.editor.navLabel = event.target.value;
        syncEditorPageDetails();
        scheduleLivePreview();
      });
      return;
    }

    if (selection.kind === "title" || selection.kind === "subtitle" || selection.kind === "prompt") {
      const map = {
        title: { label: strings.titleLabel || "Page Title", value: draft.title || "", rows: 1 },
        subtitle: { label: strings.subtitleLabel || "Page Subtitle", value: draft.subtitle || "", rows: 3 },
        prompt: { label: strings.prompt || "Terminal Prompt", value: draft.prompt || "", rows: 1 }
      };
      const field = map[selection.kind];
      wrap.innerHTML = `<div class="editor-inspector-shell">
        <p class="muted">${esc(selectedLabel)}</p>
        <label>
          <span>${esc(field.label)}</span>
          ${field.rows > 1 ? `<textarea id="editor-selected-text" rows="${field.rows}">${esc(field.value)}</textarea>` : `<input id="editor-selected-text" type="text" value="${esc(field.value)}" />`}
        </label>
        <p class="muted">${esc(strings.itemPreview || "Preview")}: ${esc(selectedPreview)}</p>
      </div>`;
      document.getElementById("editor-selected-text").addEventListener("input", (event) => {
        draft[selection.kind] = event.target.value;
        scheduleLivePreview();
      });
      return;
    }

    const section = draft.sections?.[selection.index];
    if (!section) {
      wrap.innerHTML = `<p class="muted">${esc(strings.selectItemHint || "Select an item from the page to edit it.")}</p>`;
      return;
    }
    const sectionType = normalizeSectionType(section.type, "text");
    const sectionAnimation = normalizeSectionAnimation(section.animation, "fade-up");
    const sectionLayout = normalizeSectionLayout(section.layout, "stack");
    const sectionSpan = normalizeSectionSpan(section.span, "full");
    const sectionAlign = normalizeSectionAlign(section.align, "start");
    const sectionTheme = normalizeSectionTheme(section.theme, "default");
    const sectionPadding = normalizeSectionPadding(section.padding, "md");
    const typeOptions = SECTION_TYPES.map(
      (type) => `<option value="${type}" ${type === sectionType ? "selected" : ""}>${esc(editorSectionTypeLabel(type))}</option>`
    ).join("");
    const animationOptions = SECTION_ANIMATIONS.map((animation) => {
      const labelMap = {
        "fade-up": strings.animationFadeUp || "Fade Up",
        "slide-left": strings.animationSlideLeft || "Slide Left",
        "slide-right": strings.animationSlideRight || "Slide Right",
        "zoom-in": strings.animationZoomIn || "Zoom In",
        none: strings.animationNone || "No Animation"
      };
      return `<option value="${animation}" ${animation === sectionAnimation ? "selected" : ""}>${esc(labelMap[animation])}</option>`;
    }).join("");
    const layoutOptions = SECTION_LAYOUTS.map((layout) => {
      const labelMap = {
        stack: strings.layoutStack || "Stack",
        split: strings.layoutSplit || "Split"
      };
      return `<option value="${layout}" ${layout === sectionLayout ? "selected" : ""}>${esc(labelMap[layout])}</option>`;
    }).join("");
    const spanOptions = SECTION_SPANS.map((span) => {
      const labelMap = {
        full: strings.spanFull || "Full Width",
        wide: strings.spanWide || "Wide",
        half: strings.spanHalf || "Half",
        third: strings.spanThird || "Third"
      };
      return `<option value="${span}" ${span === sectionSpan ? "selected" : ""}>${esc(labelMap[span])}</option>`;
    }).join("");
    const alignOptions = SECTION_ALIGNS.map((align) => {
      const labelMap = {
        start: strings.alignStart || "Left",
        center: strings.alignCenter || "Center",
        end: strings.alignEnd || "Right"
      };
      return `<option value="${align}" ${align === sectionAlign ? "selected" : ""}>${esc(labelMap[align])}</option>`;
    }).join("");
    const themeOptions = SECTION_THEMES.map((theme) => {
      const labelMap = {
        default: strings.themeDefault || "Default",
        accent: strings.themeAccent || "Accent",
        outline: strings.themeOutline || "Outline",
        plain: strings.themePlain || "Plain"
      };
      return `<option value="${theme}" ${theme === sectionTheme ? "selected" : ""}>${esc(labelMap[theme])}</option>`;
    }).join("");
    const paddingOptions = SECTION_PADDINGS.map((padding) => {
      const labelMap = {
        sm: strings.paddingSm || "Compact",
        md: strings.paddingMd || "Normal",
        lg: strings.paddingLg || "Large"
      };
      return `<option value="${padding}" ${padding === sectionPadding ? "selected" : ""}>${esc(labelMap[padding])}</option>`;
    }).join("");
    const typeSpecificFields =
      sectionType === "image"
        ? `<div class="inspector-group" data-group="media">
            <button class="inspector-group-toggle" data-toggle-group="media" type="button">
              <span class="inspector-group-arrow">&#8250;</span>
              <span>${esc(strings.mediaContent || "Media Content")}</span>
            </button>
            <div class="inspector-group-body">
              <label>
                <span>${esc(strings.imageUrlLabel || "Image URL")}</span>
                <div class="field-with-upload">
                  <input id="editor-selected-section-image" type="text" value="${esc(section.imageSrc || "")}" placeholder="https://..." />
                  <button class="icon-btn upload-btn" data-upload-action="image" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                </div>
              </label>
              <label>
                <span>${esc(strings.imageAltLabel || "Image Alt Text")}</span>
                <input id="editor-selected-section-alt" type="text" value="${esc(section.imageAlt || "")}" />
              </label>
              <label>
                <span>${esc(strings.imageCaptionLabel || "Image Caption")}</span>
                <input id="editor-selected-section-caption" type="text" value="${esc(section.imageCaption || "")}" />
              </label>
              <label>
                <span>${esc(strings.sectionBody || "Section Body")}</span>
                <div class="rich-text-wrap">
                  <div class="rich-text-toolbar" data-rich-toolbar="body">
                    <button type="button" data-rich-action="bold" title="Bold"><strong>B</strong></button>
                    <button type="button" data-rich-action="italic" title="Italic"><em>I</em></button>
                    <button type="button" data-rich-action="link" title="Link">&#128279;</button>
                    <button type="button" data-rich-action="ul" title="List">&#8226;</button>
                  </div>
                  <textarea id="editor-selected-section-body" rows="5">${esc(section.body || "")}</textarea>
                </div>
              </label>
            </div>
          </div>`
        : sectionType === "video"
          ? `<div class="inspector-group" data-group="media">
              <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                <span class="inspector-group-arrow">&#8250;</span>
                <span>${esc(strings.mediaContent || "Media Content")}</span>
              </button>
              <div class="inspector-group-body">
                <label>
                  <span>${esc(strings.videoUrlLabel || "Video URL")}</span>
                  <div class="field-with-upload">
                    <input id="editor-selected-section-video" type="text" value="${esc(section.videoSrc || "")}" placeholder="https://... or .mp4" />
                    <button class="icon-btn upload-btn" data-upload-action="video" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                  </div>
                </label>
                <label>
                  <span>${esc(strings.videoPosterLabel || "Poster Image URL")}</span>
                  <div class="field-with-upload">
                    <input id="editor-selected-section-video-poster" type="text" value="${esc(section.videoPoster || "")}" placeholder="https://..." />
                    <button class="icon-btn upload-btn" data-upload-action="poster" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                  </div>
                </label>
                <label>
                  <span>${esc(strings.videoCaptionLabel || "Video Caption")}</span>
                  <input id="editor-selected-section-video-caption" type="text" value="${esc(section.videoCaption || "")}" />
                </label>
                <label>
                  <span>${esc(strings.sectionBody || "Section Body")}</span>
                  <textarea id="editor-selected-section-body" rows="4">${esc(section.body || "")}</textarea>
                </label>
              </div>
            </div>`
          : sectionType === "audio"
            ? `<div class="inspector-group" data-group="media">
                <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                  <span class="inspector-group-arrow">&#8250;</span>
                  <span>${esc(strings.mediaContent || "Media Content")}</span>
                </button>
                <div class="inspector-group-body">
                  <label>
                    <span>${esc(strings.audioUrlLabel || "Audio URL")}</span>
                    <div class="field-with-upload">
                      <input id="editor-selected-section-audio" type="text" value="${esc(section.audioSrc || "")}" placeholder="https://... or .mp3" />
                      <button class="icon-btn upload-btn" data-upload-action="audio" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                    </div>
                  </label>
                  <label>
                    <span>${esc(strings.audioCaptionLabel || "Audio Caption")}</span>
                    <input id="editor-selected-section-audio-caption" type="text" value="${esc(section.audioCaption || "")}" />
                  </label>
                  <label>
                    <span>${esc(strings.sectionBody || "Section Body")}</span>
                    <textarea id="editor-selected-section-body" rows="4">${esc(section.body || "")}</textarea>
                  </label>
                </div>
              </div>`
            : sectionType === "gallery"
              ? `<div class="inspector-group" data-group="media">
                  <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                    <span class="inspector-group-arrow">&#8250;</span>
                    <span>${esc(strings.mediaContent || "Media Content")}</span>
                  </button>
                  <div class="inspector-group-body">
                    <div class="gallery-editor">
                      <div class="gallery-editor-header">
                        <span>${esc(strings.galleryImagesLabel || "Gallery Images")} (${(section.galleryImages || []).length})</span>
                        <div class="gallery-editor-actions">
                          <button class="icon-btn" id="editor-gallery-add-url" type="button">${esc(strings.galleryAddUrl || "+ URL")}</button>
                          <button class="icon-btn" id="editor-gallery-upload" type="button">${esc(strings.galleryUpload || "+ Upload")}</button>
                        </div>
                      </div>
                      <div class="gallery-editor-list" id="editor-gallery-list">
                        ${(section.galleryImages || []).map((img, gi) => `<div class="gallery-editor-item" data-gallery-img="${gi}">
                          <div class="gallery-editor-thumb">
                            ${img.src ? `<img src="${esc(img.src)}" alt="${esc(img.alt || "")}" />` : `<div class="section-placeholder">No image</div>`}
                          </div>
                          <div class="gallery-editor-fields">
                            <input class="gallery-img-src" data-gallery-field="src" data-gallery-img="${gi}" type="text" value="${esc(img.src || "")}" placeholder="Image URL" />
                            <input class="gallery-img-alt" data-gallery-field="alt" data-gallery-img="${gi}" type="text" value="${esc(img.alt || "")}" placeholder="Alt text" />
                            <input class="gallery-img-caption" data-gallery-field="caption" data-gallery-img="${gi}" type="text" value="${esc(img.caption || "")}" placeholder="Caption" />
                          </div>
                          <button class="icon-btn danger-btn gallery-img-remove" data-gallery-remove="${gi}" type="button">&times;</button>
                        </div>`).join("")}
                        ${(section.galleryImages || []).length === 0 ? `<p class="muted">${esc(strings.galleryEmpty || "No images yet. Add URLs or upload files.")}</p>` : ""}
                      </div>
                    </div>
                    <label>
                      <span>${esc(strings.sectionBody || "Section Body")}</span>
                      <textarea id="editor-selected-section-body" rows="3">${esc(section.body || "")}</textarea>
                    </label>
                  </div>
                </div>`
              : sectionType === "html"
                ? `<div class="inspector-group" data-group="content">
                    <button class="inspector-group-toggle" data-toggle-group="content" type="button">
                      <span class="inspector-group-arrow">&#8250;</span>
                      <span>${esc(strings.contentLabel || "Content")}</span>
                    </button>
                    <div class="inspector-group-body">
                      <label>
                        <span>${esc(strings.htmlLabel || "Custom HTML")}</span>
                        <textarea id="editor-selected-section-html" rows="10">${esc(section.html || "")}</textarea>
                      </label>
                    </div>
                  </div>`
                : `<div class="inspector-group" data-group="content">
                    <button class="inspector-group-toggle" data-toggle-group="content" type="button">
                      <span class="inspector-group-arrow">&#8250;</span>
                      <span>${esc(strings.contentLabel || "Content")}</span>
                    </button>
                    <div class="inspector-group-body">
                      <label>
                        <span>${esc(strings.sectionBody || "Section Body")}</span>
                        <div class="rich-text-wrap">
                          <div class="rich-text-toolbar" data-rich-toolbar="body">
                            <button type="button" data-rich-action="bold" title="Bold"><strong>B</strong></button>
                            <button type="button" data-rich-action="italic" title="Italic"><em>I</em></button>
                            <button type="button" data-rich-action="link" title="Link">&#128279;</button>
                            <button type="button" data-rich-action="ul" title="List">&#8226;</button>
                          </div>
                          <textarea id="editor-selected-section-body" rows="6">${esc(section.body || "")}</textarea>
                        </div>
                      </label>
                    </div>
                  </div>`;
    wrap.innerHTML = `<div class="editor-inspector-shell">
      <p class="muted">${esc(selectedLabel)}</p>
      <div class="editor-section-actions">
        <button class="icon-btn" id="editor-selected-move-up" type="button" ${selection.index === 0 ? "disabled" : ""}>${esc(strings.moveUp || "Move Up")}</button>
        <button class="icon-btn" id="editor-selected-move-down" type="button" ${selection.index === draft.sections.length - 1 ? "disabled" : ""}>${esc(strings.moveDown || "Move Down")}</button>
        <button class="icon-btn" id="editor-selected-duplicate" type="button">${esc(strings.duplicate || "Duplicate")}</button>
        <button class="icon-btn danger-btn" id="editor-selected-remove" type="button">${esc(strings.remove || "Remove")}</button>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.blockTypeLabel || "Block Type")}</span>
          <select id="editor-selected-section-type">${typeOptions}</select>
        </label>
        <label>
          <span>${esc(strings.animationLabel || "Animation")}</span>
          <select id="editor-selected-section-animation">${animationOptions}</select>
        </label>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.gridWidthLabel || "Grid Width")}</span>
          <select id="editor-selected-section-span">${spanOptions}</select>
        </label>
        <label>
          <span>${esc(strings.layoutLabel || "Layout")}</span>
          <select id="editor-selected-section-layout">${layoutOptions}</select>
        </label>
        <label>
          <span>${esc(strings.alignLabel || "Text Align")}</span>
          <select id="editor-selected-section-align">${alignOptions}</select>
        </label>
        <label>
          <span>${esc(strings.stylePresetLabel || "Style Preset")}</span>
          <select id="editor-selected-section-theme">${themeOptions}</select>
        </label>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.paddingLabel || "Padding")}</span>
          <select id="editor-selected-section-padding">${paddingOptions}</select>
        </label>
        <label>
          <span>${esc(strings.backgroundColorLabel || "Background Color")}</span>
          <input id="editor-selected-section-bg" type="text" value="${esc(section.bgColor || "")}" placeholder="#101826" />
        </label>
        <label>
          <span>${esc(strings.textColorLabel || "Text Color")}</span>
          <input id="editor-selected-section-text-color" type="text" value="${esc(section.textColor || "")}" placeholder="#f5fbff" />
        </label>
        <label>
          <span>${esc(strings.borderColorLabel || "Border Color")}</span>
          <input id="editor-selected-section-border-color" type="text" value="${esc(section.borderColor || "")}" placeholder="rgba(57,255,143,0.34)" />
        </label>
      </div>
      <label>
        <span>${esc(strings.sectionTitle || "Section Title")}</span>
        <input id="editor-selected-section-title" type="text" value="${esc(section.title || "")}" />
      </label>
      ${typeSpecificFields}
    </div>`;
    document.getElementById("editor-selected-section-title").addEventListener("input", (event) => {
      section.title = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-type").addEventListener("change", (event) => {
      section.type = normalizeSectionType(event.target.value, "text");
      if (!section.animation) section.animation = "fade-up";
      renderPageItemEditor();
    });
    document.getElementById("editor-selected-section-animation").addEventListener("change", (event) => {
      section.animation = normalizeSectionAnimation(event.target.value, "fade-up");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-span").addEventListener("change", (event) => {
      section.span = normalizeSectionSpan(event.target.value, "full");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-layout").addEventListener("change", (event) => {
      section.layout = normalizeSectionLayout(event.target.value, "stack");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-align").addEventListener("change", (event) => {
      section.align = normalizeSectionAlign(event.target.value, "start");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-theme").addEventListener("change", (event) => {
      section.theme = normalizeSectionTheme(event.target.value, "default");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-padding").addEventListener("change", (event) => {
      section.padding = normalizeSectionPadding(event.target.value, "md");
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-bg").addEventListener("input", (event) => {
      section.bgColor = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-text-color").addEventListener("input", (event) => {
      section.textColor = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-border-color").addEventListener("input", (event) => {
      section.borderColor = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-body")?.addEventListener("input", (event) => {
      section.body = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-image")?.addEventListener("input", (event) => {
      section.imageSrc = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-alt")?.addEventListener("input", (event) => {
      section.imageAlt = event.target.value;
    });
    document.getElementById("editor-selected-section-caption")?.addEventListener("input", (event) => {
      section.imageCaption = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-html")?.addEventListener("input", (event) => {
      section.html = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-video")?.addEventListener("input", (event) => {
      section.videoSrc = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-video-poster")?.addEventListener("input", (event) => {
      section.videoPoster = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-video-caption")?.addEventListener("input", (event) => {
      section.videoCaption = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-audio")?.addEventListener("input", (event) => {
      section.audioSrc = event.target.value;
      scheduleLivePreview();
    });
    document.getElementById("editor-selected-section-audio-caption")?.addEventListener("input", (event) => {
      section.audioCaption = event.target.value;
      scheduleLivePreview();
    });
    wrap.querySelectorAll(".gallery-img-src").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].src = event.target.value;
        scheduleLivePreview();
      });
    });
    wrap.querySelectorAll(".gallery-img-alt").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].alt = event.target.value;
      });
    });
    wrap.querySelectorAll(".gallery-img-caption").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].caption = event.target.value;
        scheduleLivePreview();
      });
    });
    wrap.querySelectorAll(".gallery-img-remove").forEach((button) => {
      button.addEventListener("click", (event) => {
        const idx = Number(event.target.dataset.galleryRemove);
        section.galleryImages.splice(idx, 1);
        renderPageItemEditor();
      });
    });
    document.getElementById("editor-gallery-add-url")?.addEventListener("click", () => {
      section.galleryImages.push({ src: "", alt: "", caption: "" });
      renderPageItemEditor();
    });
    document.getElementById("editor-gallery-upload")?.addEventListener("click", async () => {
      const input = triggerFileInput("image/*");
      input.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          const base64 = await fileToBase64(file);
          section.galleryImages.push({ src: base64, alt: file.name, caption: "" });
          renderPageItemEditor();
        } catch (_) {
          setEditorStatus(t("editor.uploadFailed", "Upload failed."), true);
        }
      });
    });
    wrap.querySelectorAll(".upload-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.uploadAction;
        const acceptMap = { image: "image/*", video: "video/*", audio: "audio/*", poster: "image/*" };
        const fieldMap = { image: "imageSrc", video: "videoSrc", audio: "audioSrc", poster: "videoPoster" };
        const input = triggerFileInput(acceptMap[action] || "image/*");
        input.addEventListener("change", async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const base64 = await fileToBase64(file);
            section[fieldMap[action]] = base64;
            scheduleLivePreview();
          } catch (_) {
            setEditorStatus(t("editor.uploadFailed", "Upload failed."), true);
          }
        });
      });
    });
    wrap.querySelectorAll(".inspector-group-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.closest(".inspector-group");
        const body = group.querySelector(".inspector-group-body");
        const arrow = toggle.querySelector(".inspector-group-arrow");
        const isOpen = body.classList.toggle("open");
        arrow.style.transform = isOpen ? "rotate(90deg)" : "";
      });
    });
    wrap.querySelectorAll(".rich-text-toolbar button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const action = button.dataset.richAction;
        const textarea = button.closest(".rich-text-wrap").querySelector("textarea");
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const wrappers = { bold: ["**", "**"], italic: ["*", "*"], link: ["[", "](url)"], ul: ["\n- ", ""] };
        const [before, after] = wrappers[action] || ["", ""];
        const insert = before + (selected || "text") + after;
        textarea.value = textarea.value.substring(0, start) + insert + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + (selected || "text").length;
        textarea.dispatchEvent(new Event("input"));
      });
    });
    document.getElementById("editor-selected-duplicate").addEventListener("click", () => {
      draft.sections.splice(selection.index + 1, 0, deepClone(section));
      state.editor.selection = { kind: "section", index: selection.index + 1 };
      renderPageItemEditor();
    });
    document.getElementById("editor-selected-remove").addEventListener("click", () => {
      draft.sections.splice(selection.index, 1);
      state.editor.selection = { kind: "section", index: selection.index };
      renderPageItemEditor();
    });
    document.getElementById("editor-selected-move-up").addEventListener("click", () => {
      if (selection.index <= 0) return;
      const temp = draft.sections[selection.index - 1];
      draft.sections[selection.index - 1] = draft.sections[selection.index];
      draft.sections[selection.index] = temp;
      state.editor.selection = { kind: "section", index: selection.index - 1 };
      renderPageItemEditor();
    });
    document.getElementById("editor-selected-move-down").addEventListener("click", () => {
      if (selection.index >= draft.sections.length - 1) return;
      const temp = draft.sections[selection.index + 1];
      draft.sections[selection.index + 1] = draft.sections[selection.index];
      draft.sections[selection.index] = temp;
      state.editor.selection = { kind: "section", index: selection.index + 1 };
      renderPageItemEditor();
    });
  }

  function renderInlineItems() {
    const wrap = document.getElementById("inline-editor-items");
    const draft = state.editor.draft;
    if (!wrap || !draft) return;
    const selection = normalizeEditorSelection();
    state.editor.selection = selection;
    wrap.innerHTML = buildPageEditorItems()
      .map((item) => {
        const key = item.kind === "section" ? `section:${item.index}` : item.kind;
        return `<button class="editor-layer ${key === editorSelectionKey(selection) ? "active" : ""}" data-inline-select="${item.kind}" ${item.kind === "section" ? `data-inline-index="${item.index}"` : ""} type="button">
          <span class="editor-layer-title">${esc(item.title)}</span>
          <span class="editor-layer-preview">${esc(item.preview || editorStrings().itemPreview || "")}</span>
        </button>`;
      })
      .join("");
    wrap.querySelectorAll("[data-inline-select]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editor.selection =
          button.dataset.inlineSelect === "section"
            ? { kind: "section", index: Number(button.dataset.inlineIndex) }
            : { kind: button.dataset.inlineSelect };
        renderInlineEditor();
        scheduleLivePreview();
      });
    });
  }

  function renderInlineInspector() {
    const wrap = document.getElementById("inline-editor-inspector");
    const draft = state.editor.draft;
    if (!wrap || !draft) return;
    const strings = editorStrings();
    const selection = normalizeEditorSelection();
    state.editor.selection = selection;
    const selectedLabel = editorSelectionLabel(selection);
    const selectedPreview = editorSelectionPreview(selection);
    const bind = (role, eventName, handler) => {
      wrap.querySelector(`[data-inline-role='${role}']`)?.addEventListener(eventName, handler);
    };

    if (selection.kind === "nav") {
      wrap.innerHTML = `<div class="editor-inspector-shell">
        <p class="muted">${esc(selectedLabel)}</p>
        <label>
          <span>${esc(strings.navTitleLabel || "Menu Label")}</span>
          <input data-inline-role="nav" type="text" value="${esc(state.editor.navLabel || "")}" />
        </label>
        <p class="muted">${esc(strings.itemPreview || "Preview")}: ${esc(selectedPreview)}</p>
      </div>`;
      bind("nav", "input", (event) => {
        state.editor.navLabel = event.target.value;
        syncEditorPageDetails();
        scheduleLivePreview();
      });
      return;
    }

    if (selection.kind === "title" || selection.kind === "subtitle" || selection.kind === "prompt") {
      const map = {
        title: { label: strings.titleLabel || "Page Title", value: draft.title || "", rows: 1 },
        subtitle: { label: strings.subtitleLabel || "Page Subtitle", value: draft.subtitle || "", rows: 3 },
        prompt: { label: strings.prompt || "Terminal Prompt", value: draft.prompt || "", rows: 1 }
      };
      const field = map[selection.kind];
      wrap.innerHTML = `<div class="editor-inspector-shell">
        <p class="muted">${esc(selectedLabel)}</p>
        <label>
          <span>${esc(field.label)}</span>
          ${field.rows > 1 ? `<textarea data-inline-role="text" rows="${field.rows}">${esc(field.value)}</textarea>` : `<input data-inline-role="text" type="text" value="${esc(field.value)}" />`}
        </label>
        <p class="muted">${esc(strings.itemPreview || "Preview")}: ${esc(selectedPreview)}</p>
      </div>`;
      bind("text", "input", (event) => {
        draft[selection.kind] = event.target.value;
        scheduleLivePreview();
      });
      return;
    }

    const section = draft.sections?.[selection.index];
    if (!section) {
      wrap.innerHTML = `<p class="muted">${esc(strings.selectItemHint || "Select an item from the page to edit it.")}</p>`;
      return;
    }

    const sectionType = normalizeSectionType(section.type, "text");
    const sectionAnimation = normalizeSectionAnimation(section.animation, "fade-up");
    const sectionLayout = normalizeSectionLayout(section.layout, "stack");
    const sectionSpan = normalizeSectionSpan(section.span, "full");
    const sectionAlign = normalizeSectionAlign(section.align, "start");
    const sectionTheme = normalizeSectionTheme(section.theme, "default");
    const sectionPadding = normalizeSectionPadding(section.padding, "md");
    const typeOptions = SECTION_TYPES.map(
      (type) => `<option value="${type}" ${type === sectionType ? "selected" : ""}>${esc(editorSectionTypeLabel(type))}</option>`
    ).join("");
    const animationOptions = SECTION_ANIMATIONS.map((animation) => {
      const labelMap = {
        "fade-up": strings.animationFadeUp || "Fade Up",
        "slide-left": strings.animationSlideLeft || "Slide Left",
        "slide-right": strings.animationSlideRight || "Slide Right",
        "zoom-in": strings.animationZoomIn || "Zoom In",
        none: strings.animationNone || "No Animation"
      };
      return `<option value="${animation}" ${animation === sectionAnimation ? "selected" : ""}>${esc(labelMap[animation])}</option>`;
    }).join("");
    const layoutOptions = SECTION_LAYOUTS.map((layout) => {
      const labelMap = { stack: strings.layoutStack || "Stack", split: strings.layoutSplit || "Split" };
      return `<option value="${layout}" ${layout === sectionLayout ? "selected" : ""}>${esc(labelMap[layout])}</option>`;
    }).join("");
    const spanOptions = SECTION_SPANS.map((span) => {
      const labelMap = {
        full: strings.spanFull || "Full Width",
        wide: strings.spanWide || "Wide",
        half: strings.spanHalf || "Half",
        third: strings.spanThird || "Third"
      };
      return `<option value="${span}" ${span === sectionSpan ? "selected" : ""}>${esc(labelMap[span])}</option>`;
    }).join("");
    const alignOptions = SECTION_ALIGNS.map((align) => {
      const labelMap = { start: strings.alignStart || "Left", center: strings.alignCenter || "Center", end: strings.alignEnd || "Right" };
      return `<option value="${align}" ${align === sectionAlign ? "selected" : ""}>${esc(labelMap[align])}</option>`;
    }).join("");
    const themeOptions = SECTION_THEMES.map((theme) => {
      const labelMap = {
        default: strings.themeDefault || "Default",
        accent: strings.themeAccent || "Accent",
        outline: strings.themeOutline || "Outline",
        plain: strings.themePlain || "Plain"
      };
      return `<option value="${theme}" ${theme === sectionTheme ? "selected" : ""}>${esc(labelMap[theme])}</option>`;
    }).join("");
    const paddingOptions = SECTION_PADDINGS.map((padding) => {
      const labelMap = { sm: strings.paddingSm || "Compact", md: strings.paddingMd || "Normal", lg: strings.paddingLg || "Large" };
      return `<option value="${padding}" ${padding === sectionPadding ? "selected" : ""}>${esc(labelMap[padding])}</option>`;
    }).join("");
    const typeSpecificFields =
      sectionType === "image"
        ? `<div class="inspector-group" data-group="media">
            <button class="inspector-group-toggle" data-toggle-group="media" type="button">
              <span class="inspector-group-arrow">&#8250;</span>
              <span>${esc(strings.mediaContent || "Media Content")}</span>
            </button>
            <div class="inspector-group-body">
              <label>
                <span>${esc(strings.imageUrlLabel || "Image URL")}</span>
                <div class="field-with-upload">
                  <input data-inline-role="section-image" type="text" value="${esc(section.imageSrc || "")}" placeholder="https://..." />
                  <button class="icon-btn upload-btn" data-upload-action="image" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                </div>
              </label>
              <label>
                <span>${esc(strings.imageAltLabel || "Image Alt Text")}</span>
                <input data-inline-role="section-alt" type="text" value="${esc(section.imageAlt || "")}" />
              </label>
              <label>
                <span>${esc(strings.imageCaptionLabel || "Image Caption")}</span>
                <input data-inline-role="section-caption" type="text" value="${esc(section.imageCaption || "")}" />
              </label>
              <label>
                <span>${esc(strings.sectionBody || "Section Body")}</span>
                <div class="rich-text-wrap">
                  <div class="rich-text-toolbar" data-rich-toolbar="body">
                    <button type="button" data-rich-action="bold" title="Bold"><strong>B</strong></button>
                    <button type="button" data-rich-action="italic" title="Italic"><em>I</em></button>
                    <button type="button" data-rich-action="link" title="Link">&#128279;</button>
                    <button type="button" data-rich-action="ul" title="List">&#8226;</button>
                  </div>
                  <textarea data-inline-role="section-body" rows="5">${esc(section.body || "")}</textarea>
                </div>
              </label>
            </div>
          </div>`
        : sectionType === "video"
          ? `<div class="inspector-group" data-group="media">
              <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                <span class="inspector-group-arrow">&#8250;</span>
                <span>${esc(strings.mediaContent || "Media Content")}</span>
              </button>
              <div class="inspector-group-body">
                <label>
                  <span>${esc(strings.videoUrlLabel || "Video URL")}</span>
                  <div class="field-with-upload">
                    <input data-inline-role="section-video" type="text" value="${esc(section.videoSrc || "")}" placeholder="https://... or .mp4" />
                    <button class="icon-btn upload-btn" data-upload-action="video" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                  </div>
                </label>
                <label>
                  <span>${esc(strings.videoPosterLabel || "Poster Image URL")}</span>
                  <div class="field-with-upload">
                    <input data-inline-role="section-video-poster" type="text" value="${esc(section.videoPoster || "")}" placeholder="https://..." />
                    <button class="icon-btn upload-btn" data-upload-action="poster" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                  </div>
                </label>
                <label>
                  <span>${esc(strings.videoCaptionLabel || "Video Caption")}</span>
                  <input data-inline-role="section-video-caption" type="text" value="${esc(section.videoCaption || "")}" />
                </label>
                <label>
                  <span>${esc(strings.sectionBody || "Section Body")}</span>
                  <textarea data-inline-role="section-body" rows="4">${esc(section.body || "")}</textarea>
                </label>
              </div>
            </div>`
          : sectionType === "audio"
            ? `<div class="inspector-group" data-group="media">
                <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                  <span class="inspector-group-arrow">&#8250;</span>
                  <span>${esc(strings.mediaContent || "Media Content")}</span>
                </button>
                <div class="inspector-group-body">
                  <label>
                    <span>${esc(strings.audioUrlLabel || "Audio URL")}</span>
                    <div class="field-with-upload">
                      <input data-inline-role="section-audio" type="text" value="${esc(section.audioSrc || "")}" placeholder="https://... or .mp3" />
                      <button class="icon-btn upload-btn" data-upload-action="audio" title="${esc(strings.uploadFile || "Upload file")}">&#9654;</button>
                    </div>
                  </label>
                  <label>
                    <span>${esc(strings.audioCaptionLabel || "Audio Caption")}</span>
                    <input data-inline-role="section-audio-caption" type="text" value="${esc(section.audioCaption || "")}" />
                  </label>
                  <label>
                    <span>${esc(strings.sectionBody || "Section Body")}</span>
                    <textarea data-inline-role="section-body" rows="4">${esc(section.body || "")}</textarea>
                  </label>
                </div>
              </div>`
            : sectionType === "gallery"
              ? `<div class="inspector-group" data-group="media">
                  <button class="inspector-group-toggle" data-toggle-group="media" type="button">
                    <span class="inspector-group-arrow">&#8250;</span>
                    <span>${esc(strings.mediaContent || "Media Content")}</span>
                  </button>
                  <div class="inspector-group-body">
                    <div class="gallery-editor">
                      <div class="gallery-editor-header">
                        <span>${esc(strings.galleryImagesLabel || "Gallery Images")} (${(section.galleryImages || []).length})</span>
                        <div class="gallery-editor-actions">
                          <button class="icon-btn" id="inline-gallery-add-url" type="button">${esc(strings.galleryAddUrl || "+ URL")}</button>
                          <button class="icon-btn" id="inline-gallery-upload" type="button">${esc(strings.galleryUpload || "+ Upload")}</button>
                        </div>
                      </div>
                      <div class="gallery-editor-list" id="inline-gallery-list">
                        ${(section.galleryImages || []).map((img, gi) => `<div class="gallery-editor-item" data-gallery-img="${gi}">
                          <div class="gallery-editor-thumb">
                            ${img.src ? `<img src="${esc(img.src)}" alt="${esc(img.alt || "")}" />` : `<div class="section-placeholder">No image</div>`}
                          </div>
                          <div class="gallery-editor-fields">
                            <input class="gallery-img-src" data-gallery-field="src" data-gallery-img="${gi}" type="text" value="${esc(img.src || "")}" placeholder="Image URL" />
                            <input class="gallery-img-alt" data-gallery-field="alt" data-gallery-img="${gi}" type="text" value="${esc(img.alt || "")}" placeholder="Alt text" />
                            <input class="gallery-img-caption" data-gallery-field="caption" data-gallery-img="${gi}" type="text" value="${esc(img.caption || "")}" placeholder="Caption" />
                          </div>
                          <button class="icon-btn danger-btn gallery-img-remove" data-gallery-remove="${gi}" type="button">&times;</button>
                        </div>`).join("")}
                        ${(section.galleryImages || []).length === 0 ? `<p class="muted">${esc(strings.galleryEmpty || "No images yet. Add URLs or upload files.")}</p>` : ""}
                      </div>
                    </div>
                    <label>
                      <span>${esc(strings.sectionBody || "Section Body")}</span>
                      <textarea data-inline-role="section-body" rows="3">${esc(section.body || "")}</textarea>
                    </label>
                  </div>
                </div>`
              : sectionType === "html"
                ? `<div class="inspector-group" data-group="content">
                    <button class="inspector-group-toggle" data-toggle-group="content" type="button">
                      <span class="inspector-group-arrow">&#8250;</span>
                      <span>${esc(strings.contentLabel || "Content")}</span>
                    </button>
                    <div class="inspector-group-body">
                      <label>
                        <span>${esc(strings.htmlLabel || "Custom HTML")}</span>
                        <textarea data-inline-role="section-html" rows="10">${esc(section.html || "")}</textarea>
                      </label>
                    </div>
                  </div>`
                : `<div class="inspector-group" data-group="content">
                    <button class="inspector-group-toggle" data-toggle-group="content" type="button">
                      <span class="inspector-group-arrow">&#8250;</span>
                      <span>${esc(strings.contentLabel || "Content")}</span>
                    </button>
                    <div class="inspector-group-body">
                      <label>
                        <span>${esc(strings.sectionBody || "Section Body")}</span>
                        <div class="rich-text-wrap">
                          <div class="rich-text-toolbar" data-rich-toolbar="body">
                            <button type="button" data-rich-action="bold" title="Bold"><strong>B</strong></button>
                            <button type="button" data-rich-action="italic" title="Italic"><em>I</em></button>
                            <button type="button" data-rich-action="link" title="Link">&#128279;</button>
                            <button type="button" data-rich-action="ul" title="List">&#8226;</button>
                          </div>
                          <textarea data-inline-role="section-body" rows="6">${esc(section.body || "")}</textarea>
                        </div>
                      </label>
                    </div>
                  </div>`;

    wrap.innerHTML = `<div class="editor-inspector-shell">
      <p class="muted">${esc(selectedLabel)}</p>
      <div class="editor-section-actions">
        <button class="icon-btn" data-inline-role="move-up" type="button" ${selection.index === 0 ? "disabled" : ""}>${esc(strings.moveUp || "Move Up")}</button>
        <button class="icon-btn" data-inline-role="move-down" type="button" ${selection.index === draft.sections.length - 1 ? "disabled" : ""}>${esc(strings.moveDown || "Move Down")}</button>
        <button class="icon-btn" data-inline-role="duplicate" type="button">${esc(strings.duplicate || "Duplicate")}</button>
        <button class="icon-btn danger-btn" data-inline-role="remove" type="button">${esc(strings.remove || "Remove")}</button>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.blockTypeLabel || "Block Type")}</span>
          <select data-inline-role="section-type">${typeOptions}</select>
        </label>
        <label>
          <span>${esc(strings.animationLabel || "Animation")}</span>
          <select data-inline-role="section-animation">${animationOptions}</select>
        </label>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.gridWidthLabel || "Grid Width")}</span>
          <select data-inline-role="section-span">${spanOptions}</select>
        </label>
        <label>
          <span>${esc(strings.layoutLabel || "Layout")}</span>
          <select data-inline-role="section-layout">${layoutOptions}</select>
        </label>
        <label>
          <span>${esc(strings.alignLabel || "Text Align")}</span>
          <select data-inline-role="section-align">${alignOptions}</select>
        </label>
        <label>
          <span>${esc(strings.stylePresetLabel || "Style Preset")}</span>
          <select data-inline-role="section-theme">${themeOptions}</select>
        </label>
      </div>
      <div class="editor-grid">
        <label>
          <span>${esc(strings.paddingLabel || "Padding")}</span>
          <select data-inline-role="section-padding">${paddingOptions}</select>
        </label>
        <label>
          <span>${esc(strings.backgroundColorLabel || "Background Color")}</span>
          <input data-inline-role="section-bg" type="text" value="${esc(section.bgColor || "")}" placeholder="#101826" />
        </label>
        <label>
          <span>${esc(strings.textColorLabel || "Text Color")}</span>
          <input data-inline-role="section-text-color" type="text" value="${esc(section.textColor || "")}" placeholder="#f5fbff" />
        </label>
        <label>
          <span>${esc(strings.borderColorLabel || "Border Color")}</span>
          <input data-inline-role="section-border-color" type="text" value="${esc(section.borderColor || "")}" placeholder="rgba(57,255,143,0.34)" />
        </label>
      </div>
      <label>
        <span>${esc(strings.sectionTitle || "Section Title")}</span>
        <input data-inline-role="section-title" type="text" value="${esc(section.title || "")}" />
      </label>
      ${typeSpecificFields}
    </div>`;

    bind("section-title", "input", (event) => {
      section.title = event.target.value;
      scheduleLivePreview();
    });
    bind("section-type", "change", (event) => {
      section.type = normalizeSectionType(event.target.value, "text");
      if (!section.animation) section.animation = "fade-up";
      renderInlineEditor();
    });
    bind("section-animation", "change", (event) => {
      section.animation = normalizeSectionAnimation(event.target.value, "fade-up");
      scheduleLivePreview();
    });
    bind("section-span", "change", (event) => {
      section.span = normalizeSectionSpan(event.target.value, "full");
      scheduleLivePreview();
    });
    bind("section-layout", "change", (event) => {
      section.layout = normalizeSectionLayout(event.target.value, "stack");
      scheduleLivePreview();
    });
    bind("section-align", "change", (event) => {
      section.align = normalizeSectionAlign(event.target.value, "start");
      scheduleLivePreview();
    });
    bind("section-theme", "change", (event) => {
      section.theme = normalizeSectionTheme(event.target.value, "default");
      scheduleLivePreview();
    });
    bind("section-padding", "change", (event) => {
      section.padding = normalizeSectionPadding(event.target.value, "md");
      scheduleLivePreview();
    });
    bind("section-bg", "input", (event) => {
      section.bgColor = event.target.value;
      scheduleLivePreview();
    });
    bind("section-text-color", "input", (event) => {
      section.textColor = event.target.value;
      scheduleLivePreview();
    });
    bind("section-border-color", "input", (event) => {
      section.borderColor = event.target.value;
      scheduleLivePreview();
    });
    bind("section-body", "input", (event) => {
      section.body = event.target.value;
      scheduleLivePreview();
    });
    bind("section-image", "input", (event) => {
      section.imageSrc = event.target.value;
      scheduleLivePreview();
    });
    bind("section-alt", "input", (event) => {
      section.imageAlt = event.target.value;
    });
    bind("section-caption", "input", (event) => {
      section.imageCaption = event.target.value;
      scheduleLivePreview();
    });
    bind("section-html", "input", (event) => {
      section.html = event.target.value;
      scheduleLivePreview();
    });
    bind("section-video", "input", (event) => {
      section.videoSrc = event.target.value;
      scheduleLivePreview();
    });
    bind("section-video-poster", "input", (event) => {
      section.videoPoster = event.target.value;
      scheduleLivePreview();
    });
    bind("section-video-caption", "input", (event) => {
      section.videoCaption = event.target.value;
      scheduleLivePreview();
    });
    bind("section-audio", "input", (event) => {
      section.audioSrc = event.target.value;
      scheduleLivePreview();
    });
    bind("section-audio-caption", "input", (event) => {
      section.audioCaption = event.target.value;
      scheduleLivePreview();
    });
    wrap.querySelectorAll(".gallery-img-src").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].src = event.target.value;
        scheduleLivePreview();
      });
    });
    wrap.querySelectorAll(".gallery-img-alt").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].alt = event.target.value;
      });
    });
    wrap.querySelectorAll(".gallery-img-caption").forEach((input) => {
      input.addEventListener("input", (event) => {
        const idx = Number(event.target.dataset.galleryImg);
        if (section.galleryImages[idx]) section.galleryImages[idx].caption = event.target.value;
        scheduleLivePreview();
      });
    });
    wrap.querySelectorAll(".gallery-img-remove").forEach((button) => {
      button.addEventListener("click", (event) => {
        const idx = Number(event.target.dataset.galleryRemove);
        section.galleryImages.splice(idx, 1);
        renderInlineEditor();
      });
    });
    document.getElementById("inline-gallery-add-url")?.addEventListener("click", () => {
      section.galleryImages.push({ src: "", alt: "", caption: "" });
      renderInlineEditor();
    });
    document.getElementById("inline-gallery-upload")?.addEventListener("click", async () => {
      const input = triggerFileInput("image/*");
      input.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          const base64 = await fileToBase64(file);
          section.galleryImages.push({ src: base64, alt: file.name, caption: "" });
          renderInlineEditor();
        } catch (_) {
          setEditorStatus(t("editor.uploadFailed", "Upload failed."), true);
        }
      });
    });
    wrap.querySelectorAll(".upload-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.uploadAction;
        const acceptMap = { image: "image/*", video: "video/*", audio: "audio/*", poster: "image/*" };
        const fieldMap = { image: "imageSrc", video: "videoSrc", audio: "audioSrc", poster: "videoPoster" };
        const input = triggerFileInput(acceptMap[action] || "image/*");
        input.addEventListener("change", async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const base64 = await fileToBase64(file);
            section[fieldMap[action]] = base64;
            scheduleLivePreview();
          } catch (_) {
            setEditorStatus(t("editor.uploadFailed", "Upload failed."), true);
          }
        });
      });
    });
    wrap.querySelectorAll(".inspector-group-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.closest(".inspector-group");
        const body = group.querySelector(".inspector-group-body");
        const arrow = toggle.querySelector(".inspector-group-arrow");
        const isOpen = body.classList.toggle("open");
        arrow.style.transform = isOpen ? "rotate(90deg)" : "";
      });
    });
    wrap.querySelectorAll(".rich-text-toolbar button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const action = button.dataset.richAction;
        const textarea = button.closest(".rich-text-wrap").querySelector("textarea");
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const wrappers = { bold: ["**", "**"], italic: ["*", "*"], link: ["[", "](url)"], ul: ["\n- ", ""] };
        const [before, after] = wrappers[action] || ["", ""];
        const insert = before + (selected || "text") + after;
        textarea.value = textarea.value.substring(0, start) + insert + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + (selected || "text").length;
        textarea.dispatchEvent(new Event("input"));
      });
    });
    bind("duplicate", "click", () => {
      draft.sections.splice(selection.index + 1, 0, deepClone(section));
      state.editor.selection = { kind: "section", index: selection.index + 1 };
      renderInlineEditor();
      syncLivePagePreview();
    });
    bind("remove", "click", () => {
      draft.sections.splice(selection.index, 1);
      state.editor.selection = { kind: "section", index: selection.index };
      renderInlineEditor();
      syncLivePagePreview();
    });
    bind("move-up", "click", () => {
      if (selection.index <= 0) return;
      const temp = draft.sections[selection.index - 1];
      draft.sections[selection.index - 1] = draft.sections[selection.index];
      draft.sections[selection.index] = temp;
      state.editor.selection = { kind: "section", index: selection.index - 1 };
      renderInlineEditor();
      syncLivePagePreview();
    });
    bind("move-down", "click", () => {
      if (selection.index >= draft.sections.length - 1) return;
      const temp = draft.sections[selection.index + 1];
      draft.sections[selection.index + 1] = draft.sections[selection.index];
      draft.sections[selection.index] = temp;
      state.editor.selection = { kind: "section", index: selection.index + 1 };
      renderInlineEditor();
      syncLivePagePreview();
    });
  }

  function refreshInlineEditorLists() {
    syncInlineEditorMeta();
    renderInlineItems();
  }

  function renderInlineEditor() {
    const panel = document.getElementById("inline-editor-panel");
    if (!panel) return;
    panel.hidden = !state.editor.inlineOpen;
    document.body.classList.toggle("editor-inline-open", state.editor.inlineOpen);
    if (!state.editor.inlineOpen || !state.editor.draft) return;
    syncInlineEditorLocale();
    refreshInlineEditorLists();
    renderInlineInspector();
  }

  const debouncedSyncPreview = debounce(() => {
    previewPending = false;
    syncLivePagePreview();
  }, 200);

  function scheduleLivePreview() {
    if (!isLivePagePreviewActive()) {
      syncPageSelectionTargets();
      return;
    }
    previewPending = true;
    debouncedSyncPreview();
  }

  function syncLivePagePreview() {
    if (!isLivePagePreviewActive()) {
      syncPageSelectionTargets();
      return;
    }
    renderSavedCurrentPage(false);
  }

  function renderPageItemEditor() {
    syncEditorPageDetails();
    renderPageCanvas();
    renderPageInspector();
        renderInlineEditor();
        scheduleLivePreview();
  }

  function refreshEditorForm() {
    const draft = state.editor.draft;
    if (!draft) return;
    renderPageItemEditor();
    if (state.editor.tab === "json") syncJSONTextareaFromDraft();
    if (state.editor.tab === "builder") renderJSONBuilder();
  }

  function saveEditorDraft() {
    const lang = state.editor.pageLang;
    const pid = state.editor.pageId;
    const fallback = getPageContent(lang, pid);
    const nextNav = String(state.editor.navLabel || "").trim() || navLabel(pid, lang);
    state.content.translations[lang].nav[pid] = nextNav;
    state.content.translations[lang].pages[pid] = normalizePage(state.editor.draft, fallback);
    state.editor.jsonDraft = sanitizeContent(state.content);
    persistContent();
    syncEditorPageOptions();
    if (lang === state.lang) renderHeader();
    if (lang === state.lang && pid === pageId) renderPage();
    if (pageId === "home") renderProjects();
    applyRevealMotion();
    setEditorStatus(t("editor.saved"), false);
    syncJSONTextareaFromDraft();
    renderJSONBuilder();
  }

  async function copyEditorJSON() {
    try {
      await navigator.clipboard.writeText(document.getElementById("editor-json").value);
      setEditorStatus(t("editor.jsonCopied"), false);
    } catch (_) {
      setEditorStatus(t("editor.copyFailed"), true);
    }
  }

  function downloadEditorJSON() {
    try {
      const text = document.getElementById("editor-json").value;
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "portfolio-content.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setEditorStatus(t("editor.jsonDownloaded"), false);
    } catch (_) {
      setEditorStatus(t("editor.downloadFailed"), true);
    }
  }

  function formatEditorJSON() {
    try {
      const raw = JSON.parse(document.getElementById("editor-json").value);
      state.editor.jsonDraft = sanitizeContent(raw);
      syncJSONTextareaFromDraft();
      renderJSONBuilder();
      setEditorStatus(t("editor.jsonFormatted"), false);
    } catch (_) {
      setEditorStatus(t("editor.invalidJson"), true);
    }
  }

  async function importEditorJSON(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      state.editor.jsonDraft = sanitizeContent(raw);
      syncJSONTextareaFromDraft();
      renderJSONBuilder();
      switchEditorTab("json");
      setEditorStatus(t("editor.jsonImported"), false);
    } catch (_) {
      setEditorStatus(t("editor.importFailed"), true);
    }
  }

  function applyEditorJSON() {
    try {
      if (state.editor.tab === "json" && !syncJSONDraftFromTextarea()) return;
      if (!state.editor.jsonDraft) state.editor.jsonDraft = sanitizeContent(state.content);
      state.content = sanitizeContent(state.editor.jsonDraft);
      state.editor.visualDrafts = {};
      state.editor.visualLoadedKey = "";
      syncGuidedState();
      if (!getThemes().includes(state.theme)) state.theme = getDefaultTheme();
      persistContent();
      applyTheme(state.theme);
      render();
      state.editor.jsonDraft = sanitizeContent(state.content);
      state.editor.draft = deepClone(getPageContent(state.editor.pageLang, state.editor.pageId));
      refreshEditorForm();
      renderJSONBuilder();
      applyRevealMotion();
      setEditorStatus(t("editor.jsonApplied"), false);
    } catch (_) {
      setEditorStatus(t("editor.invalidJson"), true);
    }
  }

  function hideInlineEditor() {
    state.editor.inlineOpen = false;
    document.body.classList.remove("editor-inline-open");
    const panel = document.getElementById("inline-editor-panel");
    if (panel) panel.hidden = true;
  }

  function openInlineEditor() {
    ensureInlineEditor();
    if (document.getElementById("editor-panel") && !document.getElementById("editor-panel").hidden) closeEditor();
    state.editor.inlineOpen = true;
    state.editor.tab = "page";
    state.editor.pageLang = state.lang;
    state.editor.jsonDraft = sanitizeContent(state.content);
    const pageKeys = getPageKeys();
    state.editor.pageId = pageKeys.includes(pageId) ? pageId : pageKeys[0] || "home";
    document.getElementById("inline-editor-panel").hidden = false;
    loadEditorDraft();
    renderInlineEditor();
    setEditorStatus(editorStrings().quickHint || t("editor.tip"), false);
  }

  function closeInlineEditor(restorePage = true) {
    const hadInlinePreview = isInlinePagePreviewActive();
    hideInlineEditor();
    if (restorePage && hadInlinePreview && !isModalPagePreviewActive()) renderSavedCurrentPage();
    else syncPageSelectionTargets();
  }

  function toggleInlineEditor() {
    if (state.editor.inlineOpen) closeInlineEditor();
    else openInlineEditor();
  }

  function openEditor(options = {}) {
    const config = typeof options === "string" ? { tab: options } : options || {};
    const nextTab = config.tab || state.editor.tab || "page";
    const pageKeys = getPageKeys();
    const nextPageId = pageKeys.includes(pageId) ? pageId : pageKeys[0] || "home";
    const preserveDraft = Boolean(config.preserveDraft && state.editor.draft && state.editor.pageId === nextPageId && state.editor.pageLang === state.lang);
    if (state.editor.inlineOpen) hideInlineEditor();
    ensureEditor();
    syncEditorLocale();
    document.getElementById("editor-panel").hidden = false;
    state.editor.pageLang = state.lang;
    state.editor.jsonDraft = sanitizeContent(state.content);
    state.editor.pageId = nextPageId;
    if (preserveDraft) refreshEditorForm();
    else loadEditorDraft();
    switchEditorTab(nextTab);
    setEditorStatus(t("editor.tip"), false);
  }

  function closeEditor() {
    const hadModalPreview = isModalPagePreviewActive();
    if (state.editor.tab === "visual") cacheVisualDraft();
    const panel = document.getElementById("editor-panel");
    if (panel) panel.hidden = true;
    if (hadModalPreview && !isInlinePagePreviewActive()) renderSavedCurrentPage();
    else syncPageSelectionTargets();
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
      { threshold: 0.05, rootMargin: "0px 0px 10% 0px" }
    );
    items.forEach((el) => {
      el.classList.remove("is-visible");
      revealObserver.observe(el);
    });
  }

  function bindGlobal() {
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("project-modal")?.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal='true']")) closeModal();
    });
    document.addEventListener("click", (event) => {
      markNavActive();
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(".dropdown")) {
        document.querySelectorAll(".drop-btn").forEach((button) => button.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((menu) => menu.classList.remove("open"));
      }
      const galleryBtn = event.target.closest("[data-gallery-action]");
      if (galleryBtn) {
        handleGalleryAction(galleryBtn.dataset.galleryId, galleryBtn.dataset.galleryAction);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal("project-modal");
        closeModal("raw-html-modal");
        closeEditor();
        closeInlineEditor();
        const panel = document.getElementById("guided-panel");
        if (panel) panel.hidden = true;
      }
    });
    bindNavActivity();
  }

  function render() {
    syncGuidedState();
    renderHeader();
    renderPage();
    renderProjects();
    renderGuided();
    if (document.getElementById("editor-panel")) {
      syncEditorLocale();
      syncEditorPageOptions();
      if (state.editor.tab === "builder") renderJSONBuilder();
      if (state.editor.tab === "json") syncJSONTextareaFromDraft();
    }
    if (state.editor.inlineOpen && (state.editor.pageLang !== state.lang || state.editor.pageId !== pageId)) {
      const pageKeys = getPageKeys();
      state.editor.pageLang = state.lang;
      state.editor.pageId = pageKeys.includes(pageId) ? pageId : pageKeys[0] || "home";
      loadEditorDraft();
    }
    if (document.getElementById("inline-editor-panel")) renderInlineEditor();
    requestAnimationFrame(applyRevealMotion);
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

  syncGuidedState();
  applyTheme(state.theme);
  setLang(state.lang);
  bindGlobal();
  initLoadingScreen();
  createParticles();
})();
