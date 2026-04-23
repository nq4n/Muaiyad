(() => {
  const APP = window.PORTFOLIO_APP;
  if (!APP || !APP.isReady || APP.started) return;

  APP.started = true;

  function render() {
    APP.renderHeader();
    APP.syncHeaderState();
    APP.renderPageContent();
    APP.renderUnitFooterNav?.();
  }

  function bindAll() {
    APP.bindModalClose();
    APP.bindNavActivity();
  }

  function initLoadingScreen() {
    const screen = document.getElementById("loading-screen");
    const introKey = "portfolio.intro-seen.20260421v5";
    if (!screen) return;
    if (sessionStorage.getItem(introKey)) {
      screen.classList.add("hidden");
      return;
    }
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const minIntroMs = reducedMotion ? 1200 : 3200;
    const autoDismissMs = reducedMotion ? 2000 : 4400;
    let readyToDismiss = false;
    let dismissed = false;

    const armDismiss = () => {
      readyToDismiss = true;
      screen.classList.add("is-ready");
    };

    const dismiss = () => {
      if (!readyToDismiss || dismissed) return;
      dismissed = true;
      document.removeEventListener("keydown", handleKeydown);
      sessionStorage.setItem(introKey, "1");
      screen.classList.add("fade-out");
      setTimeout(() => {
        screen.classList.add("hidden");
        document.body.style.overflow = "";
      }, 800);
    };

    const handleKeydown = () => dismiss();

    document.body.style.overflow = "hidden";
    screen.addEventListener("click", dismiss);
    document.addEventListener("keydown", handleKeydown);
    setTimeout(armDismiss, minIntroMs);
    setTimeout(dismiss, autoDismissMs);
  }

  function createParticles() {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const existing = document.getElementById("particles-bg");
    if (existing) existing.remove();
    if (reducedMotion) return;

    const container = document.createElement("div");
    container.id = "particles-bg";
    const fragment = document.createDocumentFragment();
    const particleCount = APP.pageId === "home" ? 10 : window.innerWidth < 720 ? 12 : 18;
    const syncVisibility = () => {
      container.classList.toggle("is-paused", document.hidden);
    };

    document.body.prepend(container);
    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${8 + (Math.random() * 12)}s`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.width = particle.style.height = `${1 + (Math.random() * 2)}px`;
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility, { passive: true });
  }

  function init() {
    const hadPendingPageLoad = APP.hasPendingPageLoad?.();
    if (hadPendingPageLoad) APP.showPageLoadingShell?.();
    APP.setRenderHandler(render);
    APP.applyTheme(APP.state.theme);
    document.documentElement.lang = APP.state.lang;
    document.documentElement.dir = APP.state.lang === "ar" ? "rtl" : "ltr";
    APP.renderLoadingScreenCopy();
    render();
    bindAll();
    APP.bindPageTransitions?.();
    initLoadingScreen();
    createParticles();
    if (hadPendingPageLoad) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => APP.hidePageLoadingShell?.());
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
