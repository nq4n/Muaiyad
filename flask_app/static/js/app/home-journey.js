(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady) return;

  const FRAME_INTERVAL = 1000 / 30;

  function initHomeJourneyField() {
    const field = document.getElementById("home-journey-field");
    const panel = document.getElementById("home-journey-panel");
    const wordmark = document.getElementById("home-journey-wordmark");
    const nextWordText = panel?.dataset.dotText || (APP.state.lang === "ar" ? "أهلاً بكم" : "WELCOME");
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
    let cols = 14;
    let rows = 8;
    let gapX = 0;
    let gapY = 0;
    let waveScale = 10;
    let rafId = 0;
    let lastFrameTime = 0;
    let isPageVisible = !document.hidden;
    let isFieldVisible = true;
    let themeId = "";
    let palette = {
      word: "247, 226, 177",
      line: "214, 177, 109",
      node: "247, 241, 229"
    };

    const syncPalette = () => {
      const nextTheme = document.documentElement.dataset.theme || "";
      if (nextTheme === themeId) return;
      const styles = getComputedStyle(field);
      palette = {
        word: styles.getPropertyValue("--journey-word-rgb").trim() || "247, 226, 177",
        line: styles.getPropertyValue("--journey-line-rgb").trim() || "214, 177, 109",
        node: styles.getPropertyValue("--journey-node-rgb").trim() || "247, 241, 229"
      };
      themeId = nextTheme;
    };

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

    const drawFrame = (time) => {
      if (!width || !height) resize();
      syncPalette();
      context.clearRect(0, 0, width, height);
      wordContext.clearRect(0, 0, wordWidth, wordHeight);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const isLightTheme = themeId === "light";

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
          const alpha = (isLightTheme ? 0.72 : 0.46) + influence * (isLightTheme ? 0.24 : 0.48);
          const radius = (isLightTheme ? 1.25 : 1.1) + influence * 0.7;
          wordContext.fillStyle = `rgba(${palette.word}, ${Math.min(alpha, 0.98)})`;
          wordContext.beginPath();
          wordContext.arc(drawX, drawY, radius, 0, Math.PI * 2);
          wordContext.fill();
        });
      }

      const nodes = [];
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
          const alpha = (isLightTheme ? 0.16 : 0.08) + (node.glow + right.glow) * (isLightTheme ? 0.14 : 0.12);
          context.strokeStyle = `rgba(${palette.line}, ${Math.min(alpha, 0.4)})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(right.x, right.y);
          context.stroke();
        }
        if (below) {
          const alpha = (isLightTheme ? 0.1 : 0.04) + (node.glow + below.glow) * (isLightTheme ? 0.1 : 0.08);
          context.strokeStyle = `rgba(${palette.line}, ${Math.min(alpha, 0.3)})`;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(below.x, below.y);
          context.stroke();
        }
      });

      nodes.forEach((node) => {
        const alpha = (isLightTheme ? 0.62 : 0.45) + node.glow * (isLightTheme ? 0.28 : 0.42);
        context.fillStyle = `rgba(${palette.node}, ${Math.min(alpha, 0.96)})`;
        context.beginPath();
        context.arc(node.x, node.y, (isLightTheme ? 1.35 : 1.25) + node.glow * 1.4, 0, Math.PI * 2);
        context.fill();
      });
    };

    const stopLoop = () => {
      if (!rafId) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const queueFrame = () => {
      if (prefersReducedMotion || rafId || !isPageVisible || !isFieldVisible) return;
      rafId = window.requestAnimationFrame(render);
    };

    const render = (time) => {
      rafId = 0;
      if (!isPageVisible || !isFieldVisible) return;
      if (lastFrameTime && (time - lastFrameTime) < FRAME_INTERVAL) {
        queueFrame();
        return;
      }
      lastFrameTime = time;
      drawFrame(time);
      queueFrame();
    };

    const drawIfNeeded = () => {
      if (prefersReducedMotion || (!rafId && isPageVisible && isFieldVisible)) {
        drawFrame(performance.now());
      }
    };

    const resumeLoop = () => {
      lastFrameTime = 0;
      if (prefersReducedMotion) {
        drawFrame(performance.now());
        return;
      }
      queueFrame();
    };

    const setWordText = (value) => {
      wordText = String(value || "").trim();
      buildWordPoints();
      drawIfNeeded();
    };

    const resize = () => {
      const rect = field.getBoundingClientRect();
      const wordRect = wordmark.getBoundingClientRect();
      syncPalette();
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

      cols = width < 700 ? 10 : 14;
      rows = width < 700 ? 6 : 8;
      gapX = width / Math.max(cols - 1, 1);
      gapY = height / Math.max(rows - 1, 1);
      waveScale = prefersReducedMotion ? 3 : 10;

      buildWordPoints();
      drawIfNeeded();
    };

    const handleMove = (event) => {
      const rect = field.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      drawIfNeeded();
    };

    const handleLeave = () => {
      pointer.tx = width * 0.5;
      pointer.ty = height * 0.5;
      drawIfNeeded();
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (!isPageVisible) {
        stopLoop();
        return;
      }
      resumeLoop();
    };

    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    const intersectionObserver = typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          isFieldVisible = entries[0]?.isIntersecting ?? true;
          if (!isFieldVisible) {
            stopLoop();
            return;
          }
          resumeLoop();
        }, { threshold: 0.08 })
      : null;

    resize();
    handleLeave();
    setWordText(nextWordText);
    field.addEventListener("pointermove", handleMove, { passive: true });
    field.addEventListener("pointerleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
    if (resizeObserver) resizeObserver.observe(field);
    if (intersectionObserver) intersectionObserver.observe(field);
    if (prefersReducedMotion) drawFrame(0);
    else queueFrame();

    field._journeySetText = setWordText;
    field._journeyCleanup = () => {
      stopLoop();
      field.removeEventListener("pointermove", handleMove);
      field.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }

  APP.initHomeJourneyField = initHomeJourneyField;
})();
