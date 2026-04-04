window.PORTFOLIO_UTILS = (() => {
  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  const uniqueStrings = (list) =>
    Array.from(
      new Set(
        (Array.isArray(list) ? list : [])
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      )
    );
  const readNested = (obj, key) =>
    key.split(".").reduce((acc, part) => (isObject(acc) && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : null), obj);
  const formatText = (template, vars) =>
    String(template || "").replace(/\{(\w+)\}/g, (_, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ""));
  const titleFromId = (id) =>
    String(id || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  }

  const SECTION_TYPES = ["text", "image", "video", "audio", "gallery", "html"];
  const SECTION_ANIMATIONS = ["fade-up", "slide-left", "slide-right", "zoom-in", "none"];
  const SECTION_LAYOUTS = ["stack", "split"];
  const SECTION_SPANS = ["full", "wide", "half", "third"];
  const SECTION_ALIGNS = ["start", "center", "end"];
  const SECTION_THEMES = ["default", "accent", "outline", "plain"];
  const SECTION_PADDINGS = ["sm", "md", "lg"];

  window.PORTFOLIO_UTILS = {
    deepClone, esc, todayISO, isObject, uniqueStrings, readNested, formatText, titleFromId,
    debounce, throttle,
    SECTION_TYPES, SECTION_ANIMATIONS, SECTION_LAYOUTS, SECTION_SPANS, SECTION_ALIGNS, SECTION_THEMES, SECTION_PADDINGS
  };
  return window.PORTFOLIO_UTILS;
})();
