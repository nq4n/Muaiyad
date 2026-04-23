(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady) return;

  const { U } = APP;
  let navIdleTimer = null;
  let navLastActivity = 0;
  let navActivityBound = false;
  const NAV_IDLE_MS = 2800;

  function renderHeader() {
    const current = APP.activeSet();
    const structure = APP.getNavStructure();
    const profile = APP.getProfile();
    const brandName = APP.state.lang === "ar" ? profile.name_ar || profile.name_en : profile.name_en || profile.name_ar;
    const brandLines = APP.brandCardLines(APP.state.lang);
    const navItem = (id) => `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${APP.hrefFor(id)}"><span class="nav-icon" aria-hidden="true">${APP.navIcon(id)}</span><span class="nav-label">${U.esc(APP.navLabel(id))}</span></a></li>`;
    const navDrop = (id, children) => {
      const childItems = children.filter((child) => child !== id);
      if (!childItems.length) return navItem(id);
      const sub = childItems
        .map((child) => `<li><a class="submenu-link ${current.has(child) ? "active" : ""}" href="${APP.hrefFor(child)}"><span class="nav-icon" aria-hidden="true">${APP.navIcon(child)}</span><span class="nav-label">${U.esc(APP.navLabel(child))}</span></a></li>`)
        .join("");
      return `<li class="dropdown"><button class="drop-btn nav-link ${current.has(id) ? "active" : ""}" aria-expanded="false" aria-haspopup="true"><span class="nav-icon" aria-hidden="true">${APP.navIcon(id)}</span><span class="nav-label">${U.esc(APP.navLabel(id))}</span></button><ul class="submenu" role="menu">${sub}</ul></li>`;
    };
    const parts = structure.map((item) => (item.children ? navDrop(item.id, item.children) : navItem(item.id))).join("");
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return;

    headerEl.innerHTML = `<header class="site-header ${APP.state.nav.cli ? "cli-mode" : ""}" role="banner"><div class="nav-wrap terminal-card"><a class="brand" href="${APP.hrefFor("home")}" aria-label="${U.esc(brandName)}"><span class="brand-logo-shell" aria-hidden="true"><img class="brand-logo" src="${APP.brandLogoSrc}" alt="" decoding="async" loading="eager" /></span><span class="brand-text"><span class="brand-dot">$</span><span class="brand-name">${U.esc(brandName)}</span></span><span class="brand-card" aria-hidden="true"><span class="brand-card-line brand-card-line--primary">${U.esc(brandLines[0])}</span><span class="brand-card-line">${U.esc(brandLines[1])}</span><span class="brand-card-line">${U.esc(brandLines[2])}</span></span></a><button id="menu-toggle" class="icon-btn nav-action" aria-expanded="false" aria-controls="primary-nav"><span class="btn-icon" aria-hidden="true">&#9776;</span><span class="btn-label">${U.esc(APP.t("ui.menu"))}</span></button><nav id="primary-nav" class="primary-nav" aria-label="Primary"><ul class="nav-list">${parts}</ul></nav><div class="tools"><div class="cmd-wrap"><div class="cmd-input-shell"><span class="cmd-prefix" aria-hidden="true">$</span><label class="sr-only" for="command-input">${U.esc(APP.t("ui.commandLabel"))}</label><input id="command-input" autocomplete="off" spellcheck="false" /><button id="cmd-run" class="icon-btn cmd-enter" type="button" aria-label="${U.esc(APP.t("ui.runCommand"))}">&#9166;</button></div><ul id="command-suggestions" class="suggestions" role="listbox"></ul><div id="command-output" class="cmd-output" aria-live="polite"></div></div><button id="cli-toggle" class="icon-btn nav-action ${APP.state.nav.cli ? "active" : ""}" aria-label="CLI" aria-pressed="${APP.state.nav.cli ? "true" : "false"}"><span class="btn-icon" aria-hidden="true">&gt;_</span><span class="btn-label">CLI</span></button><button id="theme-toggle" class="icon-btn nav-action" aria-label="${U.esc(APP.t("ui.themeButton"))}"><span class="btn-icon" aria-hidden="true">&#9680;</span><span class="btn-label">${U.esc(APP.t("ui.themeButton"))}</span></button><button id="lang-toggle" class="icon-btn nav-action" aria-label="${APP.nextLang() === "ar" ? "Switch language to Arabic" : "Switch language to English"}"><span class="btn-icon" aria-hidden="true">&#127760;</span><span class="btn-label">${APP.langButtonLabel()}</span></button></div></div></header>`;
    bindHeader();
  }

  function syncHeaderState() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    header.classList.toggle("cli-mode", APP.state.nav.cli);
    header.classList.remove("island");
    const cliToggle = document.getElementById("cli-toggle");
    if (cliToggle) {
      cliToggle.classList.toggle("active", APP.state.nav.cli);
      cliToggle.setAttribute("aria-pressed", String(APP.state.nav.cli));
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
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.96 },
        { transform: "translate(0, 0) scale(1, 1)", opacity: 0.92, offset: 0.62 },
        { transform: "translate(0, 0) scale(1, 1)", opacity: 0 }
      ],
      { duration, easing: "cubic-bezier(0.18, 0.88, 0.24, 1)", fill: "both" }
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
    if (APP.state.nav.cli === next) {
      if (next) document.getElementById("command-input")?.focus();
      return;
    }
    animateHeaderShell(header, () => {
      APP.state.nav.cli = next;
      localStorage.setItem("portfolio.nav.cli", APP.state.nav.cli ? "1" : "0");
      syncHeaderState();
    });
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (nav) nav.classList.remove("open");
    if (menu) menu.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".drop-btn").forEach((button) => button.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".submenu").forEach((submenu) => submenu.classList.remove("open"));
    const cmd = document.getElementById("command-input");
    if (APP.state.nav.cli && cmd) requestAnimationFrame(() => cmd.focus());
  }

  function canUseIsland() {
    if (APP.state.nav.cli) return false;
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
    const wasIdle = APP.state.nav.idle;
    APP.state.nav.idle = false;
    if (wasIdle) syncHeaderState();
    scheduleNavIdle();
  }

  function scheduleNavIdle() {
    if (navIdleTimer) clearTimeout(navIdleTimer);
    navIdleTimer = setTimeout(() => {
      if (canUseIsland()) {
        APP.state.nav.idle = true;
        syncHeaderState();
      }
    }, NAV_IDLE_MS);
  }

  function bindNavActivity() {
    if (navActivityBound) return;
    navActivityBound = true;
    ["pointerdown", "mousemove", "keydown", "touchstart", "scroll"].forEach((eventName) => {
      document.addEventListener(eventName, markNavActive, { passive: true });
    });
    scheduleNavIdle();
  }

  function bindMenuToggle() {
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    if (!nav || !menu) return;
    menu.addEventListener("click", () => {
      markNavActive();
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  function bindSubmenus() {
    document.querySelectorAll(".drop-btn").forEach((button) => {
      const menuEl = button.nextElementSibling;
      if (!menuEl) return;
      const close = () => {
        button.setAttribute("aria-expanded", "false");
        menuEl.classList.remove("open");
      };
      button.addEventListener("click", () => {
        markNavActive();
        const open = button.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".drop-btn").forEach((node) => node.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((submenu) => submenu.classList.remove("open"));
        button.setAttribute("aria-expanded", String(!open));
        menuEl.classList.toggle("open", !open);
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          button.click();
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          button.click();
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
            button.focus();
          }
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

    cmd.placeholder = APP.t("ui.commandPlaceholder");

    const suggest = (value) => {
      const query = value.trim().toLowerCase();
      const list = APP.getCommandList().filter((command) => !query || command.includes(query)).slice(0, 10);
      APP.state.cmdIndex = -1;
      suggestions.innerHTML = list.length
        ? list.map((command, index) => `<li role="option" data-idx="${index}" data-cmd="${command}">${command}</li>`).join("")
        : `<li class="muted">${U.esc(APP.t("ui.noSuggestions"))}</li>`;
    };

    const run = (raw) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;
      const [command, arg] = text.split(/\s+/, 2);
      const routes = APP.getCliRouteMap ? APP.getCliRouteMap() : APP.getRouteMap();
      const pageIds = new Set(APP.getCliPageIds ? APP.getCliPageIds() : Object.keys(APP.getPageMap?.() || {}));
      if (command === "help") out.textContent = `${APP.t("commands.help")} | ${APP.t("commands.helpExtra")}`;
      else if (command === "clear") {
        cmd.value = "";
        out.textContent = APP.t("commands.cleared");
      } else if (command === "theme") {
        const themes = APP.getThemes();
        const next = arg || themes[(themes.indexOf(APP.state.theme) + 1) % themes.length] || APP.getDefaultTheme();
        APP.applyTheme(next);
        out.textContent = `${APP.t("commands.themeChanged")}: ${APP.themeLabel(APP.state.theme)}`;
      } else if (command === "lang") APP.setLang(arg === "ar" || arg === "en" ? arg : APP.state.lang === "ar" ? "en" : "ar");
      else if (command === "cli") {
        const next = arg === "on" ? true : arg === "off" ? false : !APP.state.nav.cli;
        setCliMode(next);
        out.textContent = APP.state.nav.cli ? APP.t("commands.cliEnabled") : APP.t("commands.cliDisabled");
      } else if (command === "home") {
        out.textContent = `${APP.t("commands.moved")}: home`;
        window.location.href = APP.hrefFor("home");
      } else if (routes[command]) {
        out.textContent = `${APP.t("commands.moved")}: ${routes[command]}`;
        window.location.href = APP.hrefFor(routes[command]);
      } else if (pageIds.has(command)) {
        out.textContent = `${APP.t("commands.moved")}: ${command}`;
        window.location.href = APP.hrefFor(command);
      }
      else out.textContent = APP.t("commands.unknown");
      suggestions.innerHTML = "";
    };

    cmd.addEventListener("input", () => {
      markNavActive();
      suggest(cmd.value);
    });
    cmd.addEventListener("keydown", (event) => {
      markNavActive();
      const items = [...suggestions.querySelectorAll("li[data-cmd]")];
      if (event.key === "ArrowDown" && items.length) {
        event.preventDefault();
        APP.state.cmdIndex = (APP.state.cmdIndex + 1) % items.length;
      }
      if (event.key === "ArrowUp" && items.length) {
        event.preventDefault();
        APP.state.cmdIndex = (APP.state.cmdIndex - 1 + items.length) % items.length;
      }
      items.forEach((item, index) => item.classList.toggle("active", index === APP.state.cmdIndex));
      if (event.key === "Enter") {
        event.preventDefault();
        run((APP.state.cmdIndex >= 0 ? items[APP.state.cmdIndex].dataset.cmd : cmd.value) || "");
      }
      if (event.key === "Escape") {
        suggestions.innerHTML = "";
        if (!cmd.value.trim() && APP.state.nav.cli) setCliMode(false);
      }
    });
    if (cmdRun) {
      cmdRun.addEventListener("click", () => {
        markNavActive();
        run(cmd.value || "");
        cmd.focus();
      });
    }
    suggestions.addEventListener("click", (event) => {
      markNavActive();
      const item = event.target.closest("li[data-cmd]");
      if (!item) return;
      cmd.value = item.dataset.cmd;
      run(cmd.value);
    });
  }

  function bindThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      markNavActive();
      const themes = APP.getThemes();
      const next = themes[(themes.indexOf(APP.state.theme) + 1) % themes.length] || APP.getDefaultTheme();
      APP.applyTheme(next);
    });
  }

  function bindLangToggle() {
    const btn = document.getElementById("lang-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      markNavActive();
      APP.setLang(APP.state.lang === "ar" ? "en" : "ar");
    });
  }

  function bindCliToggle() {
    const btn = document.getElementById("cli-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      markNavActive();
      setCliMode(!APP.state.nav.cli);
    });
  }

  function bindGuidedToggle() {
    const btn = document.getElementById("guided-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      markNavActive();
      const panel = document.getElementById("guided-panel");
      if (panel) panel.hidden = !panel.hidden;
    });
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

  function bindModalClose() {
    document.querySelectorAll("[data-close-modal]").forEach((element) => {
      element.addEventListener("click", () => {
        APP.closeExternalModal?.();
      });
    });
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        APP.closeExternalModal?.();
      });
    }
  }

  APP.renderHeader = renderHeader;
  APP.syncHeaderState = syncHeaderState;
  APP.setCliMode = setCliMode;
  APP.bindNavActivity = bindNavActivity;
  APP.bindHeader = bindHeader;
  APP.bindModalClose = bindModalClose;
})();
