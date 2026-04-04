window.PORTFOLIO_MULTIMEDIA = ((U) => {
  const galleryStates = {};

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function triggerFileInput(accept) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.click();
    return input;
  }

  function initGalleryNavigation() {
    document.querySelectorAll(".section-gallery").forEach((gallery) => {
      const id = gallery.dataset.galleryId;
      if (!galleryStates[id]) galleryStates[id] = { current: 0 };
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
    slides.forEach((slide, idx) => { slide.classList.toggle("active", idx === state.current); });
    if (counter) counter.textContent = `${state.current + 1} / ${slides.length}`;
  }

  function handleGalleryAction(id, action) {
    if (!galleryStates[id]) return;
    const slides = document.querySelectorAll(`[data-gallery-id="${id}"] .section-gallery-slide`);
    if (!slides.length) return;
    if (action === "prev") galleryStates[id].current = (galleryStates[id].current - 1 + slides.length) % slides.length;
    else if (action === "next") galleryStates[id].current = (galleryStates[id].current + 1) % slides.length;
    updateGalleryDisplay(id);
  }

  function bindRichTextToolbar(wrap, onInput) {
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
        if (onInput) onInput(textarea.value);
        textarea.dispatchEvent(new Event("input"));
      });
    });
  }

  function bindCollapsibleGroups(wrap) {
    wrap.querySelectorAll(".inspector-group-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.closest(".inspector-group");
        const body = group.querySelector(".inspector-group-body");
        const arrow = toggle.querySelector(".inspector-group-arrow");
        const isOpen = body.classList.toggle("open");
        arrow.style.transform = isOpen ? "rotate(90deg)" : "";
      });
    });
  }

  function bindUploadButtons(wrap, section, renderPageCanvas, syncLivePagePreview, setEditorStatus, t) {
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
            renderPageCanvas();
            syncLivePagePreview();
          } catch (_) { setEditorStatus(t("editor.uploadFailed", "Upload failed."), true); }
        });
      });
    });
  }

  window.PORTFOLIO_MULTIMEDIA = {
    galleryStates, fileToBase64, triggerFileInput,
    initGalleryNavigation, updateGalleryDisplay, handleGalleryAction,
    bindRichTextToolbar, bindCollapsibleGroups, bindUploadButtons
  };
  return window.PORTFOLIO_MULTIMEDIA;
})(window.PORTFOLIO_UTILS);
