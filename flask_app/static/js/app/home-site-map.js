(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady) return;
  const FRAME_INTERVAL = 1000 / 30;

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
        link.href = APP.hrefFor(def.id);
        link.textContent = APP.navLabel(def.id);
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

        nodes.forEach((node) => {
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
          const branchStartY = Math.min(Math.max(positions.other.y - (branchGap * 0.65), 16), height - 16 - branchTotalHeight);

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
          drawLine(positions[from], positions[to], linkIsActive(from, to));
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
      node.el.textContent = APP.navLabel(node.id);
      node.el.href = APP.hrefFor(node.id);
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
      let rowGap = 14;
      let startY = 0;
      let leftX = 0;
      let rightX = 0;
      let rowHeights = [];
      let totalRowsHeight = 0;
      let rafId = 0;
      let lastFrameTime = 0;
      let isPageVisible = !document.hidden;
      let isFieldVisible = true;

      const nodes = defs.map((def, index) => {
        const link = document.createElement("a");
        link.className = `home-site-map-node${def.center ? " is-center" : ""}`;
        link.dataset.id = def.id;
        link.href = APP.hrefFor(def.id);
        link.textContent = APP.navLabel(def.id);
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
      const rowPairs = rows.map(([leftId, rightId]) => [nodesById[leftId], nodesById[rightId]]);

      function updateActiveState() {
        nodeLayer.querySelectorAll(".home-site-map-node").forEach((node) => {
          node.classList.toggle("is-active", node.dataset.id === activeId);
        });
      }

      function syncMetrics() {
        nodes.forEach((node) => {
          node.width = Math.max(node.el.offsetWidth || 0, node.center ? 128 : 110);
          node.height = Math.max(node.el.offsetHeight || 0, node.center ? 56 : 46);
        });
        rowHeights = rowPairs.map(([leftNode, rightNode]) => Math.max(leftNode?.height || 0, rightNode?.height || 0));
        totalRowsHeight = rowHeights.reduce((sum, value) => sum + value, 0) + (rowGap * Math.max(rowHeights.length - 1, 0));
      }

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

      const drawFrame = (time) => {
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

        positions.home = clampPoint(centerNode, centerX + (driftX * 0.22), centerY + (driftY * 0.22));

        let cursorY = startY;
        rowPairs.forEach(([leftNode, rightNode], index) => {
          const rowHeight = rowHeights[index] || 0;
          const y = cursorY + (rowHeight * 0.5) + (driftY * 0.14);
          if (leftNode) positions[leftNode.id] = clampPoint(leftNode, leftX + (driftX * 0.1), y);
          if (rightNode) positions[rightNode.id] = clampPoint(rightNode, rightX + (driftX * 0.1), y);
          cursorY += rowHeight + rowGap;
        });

        links.forEach(([from, to]) => {
          if (!positions[from] || !positions[to]) return;
          drawLine(positions[from], positions[to], activeId === from || activeId === to);
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
      };

      const stopLoop = () => {
        if (!rafId) return;
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      };

      const queueFrame = () => {
        if (reduced || rafId || !isPageVisible || !isFieldVisible) return;
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
        if (reduced || (!rafId && isPageVisible && isFieldVisible)) {
          drawFrame(performance.now());
        }
      };

      const resumeLoop = () => {
        lastFrameTime = 0;
        if (reduced) {
          drawFrame(performance.now());
          return;
        }
        queueFrame();
      };

      function resize() {
        const rect = field.getBoundingClientRect();
        width = Math.max(Math.floor(rect.width), 1);
        height = Math.max(Math.floor(rect.height), 1);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        rowGap = width < 720 ? 10 : 14;
        leftX = width * (width < 720 ? 0.2 : 0.22);
        rightX = width * (width < 720 ? 0.8 : 0.78);
        syncMetrics();
        startY = Math.max((height - totalRowsHeight) * 0.5, width < 720 ? 12 : 18);

        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        pointer.x = width * 0.5;
        pointer.y = height * 0.5;
        drawIfNeeded();
      }

      const handleMove = (event) => {
        const rect = field.getBoundingClientRect();
        pointer.tx = event.clientX - rect.left;
        pointer.ty = event.clientY - rect.top;
        drawIfNeeded();
      };

      const handleLeave = () => {
        pointer.tx = width * 0.5;
        pointer.ty = height * 0.5;
        activeId = null;
        updateActiveState();
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

      field.addEventListener("pointermove", handleMove, { passive: true });
      field.addEventListener("pointerleave", handleLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
      resizeObserver?.observe(field);
      intersectionObserver?.observe(field);
      resize();
      field._siteMapResize = resize;
      field._siteMapRender = drawFrame;
      field._siteMapReduced = reduced;
      if (reduced) drawFrame(0);
      else queueFrame();

      field._siteMapCleanup = () => {
        stopLoop();
        field.removeEventListener("pointermove", handleMove);
        field.removeEventListener("pointerleave", handleLeave);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };

      field._siteMapNodes = nodes;
    }

    (field._siteMapNodes || []).forEach((node) => {
      node.el.textContent = APP.navLabel(node.id);
      node.el.href = APP.hrefFor(node.id);
      node.el.classList.toggle("is-center", node.id === "home");
      node.el.classList.remove("is-branch", "is-child");
    });
    field._siteMapResize?.();
    if (field._siteMapReduced) field._siteMapRender?.(0);
  }

  APP.initHomeSiteMapLegacy = initHomeSiteMapLegacy;
  APP.initHomeSiteMap = initHomeSiteMap;
})();
