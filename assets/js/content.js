window.PORTFOLIO_CONTENT = ((U) => {
  const { deepClone, isObject, uniqueStrings, titleFromId } = U;

  function fallbackPageConfig(pid, label) {
    return { title: label || titleFromId(pid), subtitle: "", prompt: "$ open section", sections: [], builderHtml: "", builderCss: "" };
  }

  function normalizeSectionType(type, fallback = "text") {
    return U.SECTION_TYPES.includes(type) ? type : U.SECTION_TYPES.includes(fallback) ? fallback : "text";
  }

  function normalizeSectionAnimation(animation, fallback = "fade-up") {
    return U.SECTION_ANIMATIONS.includes(animation) ? animation : U.SECTION_ANIMATIONS.includes(fallback) ? fallback : "fade-up";
  }

  function normalizeSectionLayout(layout, fallback = "stack") {
    return U.SECTION_LAYOUTS.includes(layout) ? layout : U.SECTION_LAYOUTS.includes(fallback) ? fallback : "stack";
  }

  function normalizeSectionSpan(span, fallback = "full") {
    return U.SECTION_SPANS.includes(span) ? span : U.SECTION_SPANS.includes(fallback) ? fallback : "full";
  }

  function normalizeSectionAlign(align, fallback = "start") {
    return U.SECTION_ALIGNS.includes(align) ? align : U.SECTION_ALIGNS.includes(fallback) ? fallback : "start";
  }

  function normalizeSectionTheme(theme, fallback = "default") {
    return U.SECTION_THEMES.includes(theme) ? theme : U.SECTION_THEMES.includes(fallback) ? fallback : "default";
  }

  function normalizeSectionPadding(padding, fallback = "md") {
    return U.SECTION_PADDINGS.includes(padding) ? padding : U.SECTION_PADDINGS.includes(fallback) ? fallback : "md";
  }

  function createSectionTemplate(type = "text") {
    return {
      type: normalizeSectionType(type, "text"),
      title: "", body: "", imageSrc: "", imageAlt: "", imageCaption: "",
      videoSrc: "", videoPoster: "", videoCaption: "",
      audioSrc: "", audioCaption: "",
      galleryImages: [],
      html: "", animation: "fade-up", layout: "stack", span: "full", align: "start",
      theme: "default", padding: "md", bgColor: "", textColor: "", borderColor: ""
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
      imageSrc: typeof src.imageSrc === "string" ? src.imageSrc : typeof src.image === "string" ? src.image : fb.imageSrc || "",
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
      bgColor: typeof (src.bgColor ?? srcStyle.bgColor) === "string" ? String(src.bgColor ?? srcStyle.bgColor) : fb.bgColor || fbStyle.bgColor || "",
      textColor: typeof (src.textColor ?? srcStyle.textColor) === "string" ? String(src.textColor ?? srcStyle.textColor) : fb.textColor || fbStyle.textColor || "",
      borderColor: typeof (src.borderColor ?? srcStyle.borderColor) === "string" ? String(src.borderColor ?? srcStyle.borderColor) : fb.borderColor || fbStyle.borderColor || ""
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
      builderHtml: typeof src.builderHtml === "string" ? src.builderHtml : typeof src.visualHtml === "string" ? src.visualHtml : fb.builderHtml || "",
      builderCss: typeof src.builderCss === "string" ? src.builderCss : typeof src.visualCss === "string" ? src.visualCss : fb.builderCss || ""
    };
  }

  function normalizeStringMap(source, fallback, allowExtra) {
    const src = isObject(source) ? source : {};
    const fb = isObject(fallback) ? fallback : {};
    const out = {};
    Object.keys(fb).forEach((key) => { out[key] = typeof src[key] === "string" ? src[key] : fb[key]; });
    if (allowExtra) Object.entries(src).forEach(([key, value]) => { if (typeof value === "string") out[key] = value; });
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
      name: { en: typeof source.name?.en === "string" ? source.name.en : fb.name?.en || `Project ${idx + 1}`, ar: typeof source.name?.ar === "string" ? source.name.ar : fb.name?.ar || `مشروع ${idx + 1}` },
      summary: { en: typeof source.summary?.en === "string" ? source.summary.en : fb.summary?.en || "", ar: typeof source.summary?.ar === "string" ? source.summary.ar : fb.summary?.ar || "" },
      details: { en: typeof source.details?.en === "string" ? source.details.en : fb.details?.en || "", ar: typeof source.details?.ar === "string" ? source.details.ar : fb.details?.ar || "" },
      tags: toArr(source.tags, fb.tags || []), stack: toArr(source.stack, fb.stack || []),
      status: source.status === "done" ? "done" : source.status === "wip" ? "wip" : fb.status || "wip",
      featured: typeof source.featured === "boolean" ? source.featured : Boolean(fb.featured),
      complexity: Number.isFinite(Number(source.complexity)) ? Math.max(1, Math.min(5, Number(source.complexity))) : Number.isFinite(Number(fb.complexity)) ? Number(fb.complexity) : 3,
      created: typeof source.created === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.created) ? source.created : fb.created || U.todayISO(),
      link: typeof source.link === "string" ? source.link : fb.link || "#",
      pitch: { en: typeof source.pitch?.en === "string" ? source.pitch.en : fb.pitch?.en || "", ar: typeof source.pitch?.ar === "string" ? source.pitch.ar : fb.pitch?.ar || "" }
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
    Object.entries(map).forEach(([id, href]) => { if (typeof id === "string" && typeof href === "string" && href.trim()) out[id] = href.trim(); });
    return out;
  }

  function normalizeRouteMap(routeMap, fallback, pageMap) {
    const validPages = new Set(Object.keys(pageMap));
    const out = {};
    Object.entries(isObject(fallback) ? fallback : {}).forEach(([alias, target]) => { if (typeof target === "string" && validPages.has(target)) out[String(alias).toLowerCase()] = target; });
    if (!isObject(routeMap)) return out;
    Object.entries(routeMap).forEach(([alias, target]) => { if (typeof alias === "string" && typeof target === "string" && validPages.has(target)) out[alias.toLowerCase()] = target; });
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
      Object.entries(isObject(fallback?.[themeId]) ? fallback[themeId] : {}).forEach(([key, value]) => { if (/^--[\w-]+$/.test(key) && typeof value === "string") out[themeId][key] = value; });
      Object.entries(isObject(palettes?.[themeId]) ? palettes[themeId] : {}).forEach(([key, value]) => { if (/^--[\w-]+$/.test(key) && typeof value === "string") out[themeId][key] = value; });
    });
    return out;
  }

  function normalizeGuidedOptions(options, fallback) {
    const src = isObject(options) ? options : {};
    const fb = isObject(fallback) ? fallback : {};
    const takeList = (value, def) => { const list = uniqueStrings(Array.isArray(value) && value.length ? value : def); return list.length ? list : []; };
    return { purpose: takeList(src.purpose, fb.purpose), vibe: takeList(src.vibe, fb.vibe), show: takeList(src.show, fb.show), vibeThemeMap: normalizeStringMap(src.vibeThemeMap, fb.vibeThemeMap || {}, true) };
  }

  function normalizeLanguagePack(pack, fallback, pageIds, themeIds) {
    const src = isObject(pack) ? pack : {};
    const fb = isObject(fallback) ? fallback : {};
    const guidedSrc = isObject(src.guided) ? src.guided : {};
    const guidedFb = isObject(fb.guided) ? fb.guided : {};
    const out = {
      meta: normalizeStringMap(src.meta, fb.meta || {}), ui: normalizeStringMap(src.ui, fb.ui || {}),
      projects: normalizeStringMap(src.projects, fb.projects || {}), commands: normalizeStringMap(src.commands, fb.commands || {}),
      editor: normalizeStringMap(src.editor, fb.editor || {}), nav: {}, pages: {},
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
      out.themes[themeId] = typeof src.themes?.[themeId] === "string" ? src.themes[themeId] : typeof fb.themes?.[themeId] === "string" ? fb.themes[themeId] : themeId;
    });
    return out;
  }

  function buildDefaultContent(DATA) { return deepClone(DATA); }

  function sanitizeContent(raw, DATA) {
    const defaults = buildDefaultContent(DATA);
    const legacy = isObject(raw) && !isObject(raw.translations) && (isObject(raw.pages) || Array.isArray(raw.projects))
      ? { translations: { en: { pages: isObject(raw.pages?.en) ? raw.pages.en : {} }, ar: { pages: isObject(raw.pages?.ar) ? raw.pages.ar : {} } }, projects: Array.isArray(raw.projects) ? raw.projects : undefined } : raw;
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
    out.defaultTheme = typeof source.defaultTheme === "string" && out.themes.includes(source.defaultTheme) ? source.defaultTheme : out.themes.includes(defaults.defaultTheme) ? defaults.defaultTheme : out.themes[0];
    if (!out.themes.includes(out.defaultTheme)) out.themes.unshift(out.defaultTheme);
    out.themePalettes = normalizeThemePalettes(source.themePalettes, defaults.themePalettes || {}, out.themes);
    ["en", "ar"].forEach((lang) => { out.translations[lang] = normalizeLanguagePack(source.translations?.[lang], defaults.translations[lang], pageIds, out.themes); });
    out.projects = normalizeProjects(source.projects, defaults.projects);
    return out;
  }

  window.PORTFOLIO_CONTENT = {
    fallbackPageConfig, normalizeSectionType, normalizeSectionAnimation, normalizeSectionLayout,
    normalizeSectionSpan, normalizeSectionAlign, normalizeSectionTheme, normalizeSectionPadding,
    createSectionTemplate, normalizeSection, normalizeSections, normalizePage, normalizeStringMap,
    normalizeProfile, normalizeProject, normalizeProjects, normalizePageMap, normalizeRouteMap,
    normalizeNavStructure, normalizeCommandList, normalizeThemeList, normalizeThemePalettes,
    normalizeGuidedOptions, normalizeLanguagePack, buildDefaultContent, sanitizeContent
  };
  return window.PORTFOLIO_CONTENT;
})(window.PORTFOLIO_UTILS);
