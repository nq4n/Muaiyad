(() => {
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const pageId = document.body.dataset.page || "home";
  const path = window.location.pathname.replace(/\\/g, "/");
  const rootPrefix = /\/pages\//i.test(path) ? "../" : "";
  const unitChildren = DATA.navStructure.find((x) => x.id === "unit-plan").children;
  const otherChildren = DATA.navStructure.find((x) => x.id === "other").children;

  const state = {
    lang:
      localStorage.getItem("portfolio.lang") ||
      ((navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en"),
    theme: localStorage.getItem("portfolio.theme") || DATA.defaultTheme,
    cmdIndex: -1,
    project: {
      search: "",
      sort: "featured",
      tag: "all",
      show: localStorage.getItem("portfolio.show") || "all"
    },
    guided: { purpose: "hiring", vibe: "minimal", show: "featured" }
  };

  const route = {
    home: "home",
    philosophy: "philosophy",
    cv: "cv",
    unit: "unit-plan",
    framework: "framework-axes",
    reflections: "reflection-papers",
    graduation: "graduation-project",
    other: "other",
    unit1: "unit-1-intro",
    unit2: "unit-2-framework",
    unit3: "unit-3-objectives",
    unit4: "unit-4-assessment",
    unit5: "unit-5-lessons",
    unit6: "unit-6-feedback",
    unit7: "unit-7-impact",
    unit8: "unit-8-reflection",
    unit9: "unit-9-references",
    unit10: "unit-10-appendices",
    other1: "other-values",
    other2: "other-workshop",
    other3: "other-growth",
    other4: "other-peer-visits"
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tr = () => DATA.translations[state.lang];
  const t = (key) =>
    key.split(".").reduce((acc, k) => (acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : null), tr()) ?? "";
  const hrefFor = (id) => `${rootPrefix}${DATA.pageMap[id]}`;
  const activeSet = () => {
    const s = new Set([pageId]);
    if (unitChildren.includes(pageId)) s.add("unit-plan");
    if (otherChildren.includes(pageId)) s.add("other");
    return s;
  };

  function applyTheme(theme) {
    state.theme = DATA.themes.includes(theme) ? theme : DATA.defaultTheme;
    localStorage.setItem("portfolio.theme", state.theme);
    document.documentElement.dataset.theme = state.theme;
  }

  function setLang(lang) {
    state.lang = lang === "ar" ? "ar" : "en";
    localStorage.setItem("portfolio.lang", state.lang);
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    render();
  }

  function renderHeader() {
    const current = activeSet();
    const navItem = (id) =>
      `<li><a class="nav-link ${current.has(id) ? "active" : ""}" href="${hrefFor(id)}">${esc(t(`nav.${id}`))}</a></li>`;
    const navDrop = (id, children) => {
      const sub = children
        .map((cid) => `<li><a class="submenu-link ${current.has(cid) ? "active" : ""}" href="${hrefFor(cid)}">${esc(t(`nav.${cid}`))}</a></li>`)
        .join("");
      return `<li class="dropdown">
        <button class="drop-btn nav-link ${current.has(id) ? "active" : ""}" aria-expanded="false" aria-haspopup="true">${esc(t(`nav.${id}`))}</button>
        <ul class="submenu" role="menu">${sub}</ul>
      </li>`;
    };
    const parts = DATA.navStructure.map((n) => (n.children ? navDrop(n.id, n.children) : navItem(n.id))).join("");

    document.getElementById("site-header").innerHTML = `
      <header class="site-header" role="banner">
        <div class="nav-wrap terminal-card">
          <a class="brand" href="${hrefFor("home")}"><span class="brand-dot">$</span> ${esc(DATA.profile.name_en)}</a>
          <button id="menu-toggle" class="icon-btn" aria-expanded="false" aria-controls="primary-nav">${esc(t("ui.menu"))}</button>
          <nav id="primary-nav" class="primary-nav" aria-label="Primary">
            <ul class="nav-list">${parts}</ul>
          </nav>
          <div class="tools">
            <div class="cmd-wrap">
              <label class="sr-only" for="command-input">${esc(t("ui.commandLabel"))}</label>
              <input id="command-input" autocomplete="off" spellcheck="false" />
              <ul id="command-suggestions" class="suggestions" role="listbox"></ul>
              <div id="command-output" class="cmd-output" aria-live="polite"></div>
            </div>
            <button id="theme-toggle" class="icon-btn">${esc(t("ui.themeButton"))}</button>
            <button id="lang-toggle" class="icon-btn">${esc(t("ui.langButton"))}</button>
            <button id="guided-toggle" class="icon-btn">${esc(t("ui.guidedButton"))}</button>
          </div>
        </div>
      </header>
    `;
    bindHeader();
  }

  function bindHeader() {
    const nav = document.getElementById("primary-nav");
    const menu = document.getElementById("menu-toggle");
    const cmd = document.getElementById("command-input");
    const sug = document.getElementById("command-suggestions");
    const out = document.getElementById("command-output");
    const search = document.getElementById("project-search");

    cmd.placeholder = t("ui.commandPlaceholder");
    menu.addEventListener("click", () => {
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
        const open = btn.getAttribute("aria-expanded") === "true";
        document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
        btn.setAttribute("aria-expanded", String(!open));
        menuEl.classList.toggle("open", !open);
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          btn.click();
          menuEl.querySelector("a")?.focus();
        }
        if (e.key === "Escape") close();
      });
      menuEl.querySelectorAll("a").forEach((a) => {
        a.addEventListener("keydown", (e) => {
          const links = [...menuEl.querySelectorAll("a")];
          const idx = links.indexOf(a);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            links[(idx + 1) % links.length].focus();
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            links[(idx - 1 + links.length) % links.length].focus();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            close();
            btn.focus();
          }
        });
      });
    });

    document.getElementById("theme-toggle").addEventListener("click", () => {
      const i = (DATA.themes.indexOf(state.theme) + 1) % DATA.themes.length;
      applyTheme(DATA.themes[i]);
      out.textContent = `${t("commands.themeChanged")}: ${t(`themes.${state.theme}`)}`;
    });
    document.getElementById("lang-toggle").addEventListener("click", () => setLang(state.lang === "ar" ? "en" : "ar"));
    document.getElementById("guided-toggle").addEventListener("click", openGuided);

    const suggest = (value) => {
      const q = value.trim().toLowerCase();
      const list = DATA.commandList.filter((c) => !q || c.includes(q)).slice(0, 8);
      state.cmdIndex = -1;
      sug.innerHTML = list.length
        ? list.map((x, i) => `<li role="option" data-idx="${i}" data-cmd="${x}">${x}</li>`).join("")
        : `<li class="muted">${esc(t("ui.noSuggestions"))}</li>`;
    };
    const run = (raw) => {
      const text = raw.trim().toLowerCase();
      if (!text) return;
      const [command, arg] = text.split(/\s+/, 2);
      if (command === "help") out.textContent = t("commands.help");
      else if (command === "clear") {
        cmd.value = "";
        out.textContent = t("commands.cleared");
      } else if (command === "theme") {
        applyTheme(arg || DATA.themes[(DATA.themes.indexOf(state.theme) + 1) % DATA.themes.length]);
        out.textContent = `${t("commands.themeChanged")}: ${t(`themes.${state.theme}`)}`;
      } else if (command === "lang") {
        setLang(arg === "ar" || arg === "en" ? arg : state.lang === "ar" ? "en" : "ar");
      } else if (command === "home" && search && pageId === "home") {
        search.focus();
      } else if (route[command]) {
        window.location.href = hrefFor(route[command]);
      } else out.textContent = t("commands.unknown");
      sug.innerHTML = "";
    };

    cmd.addEventListener("input", () => suggest(cmd.value));
    cmd.addEventListener("keydown", (e) => {
      const items = [...sug.querySelectorAll("li[data-cmd]")];
      if (e.key === "ArrowDown" && items.length) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex + 1) % items.length;
      }
      if (e.key === "ArrowUp" && items.length) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex - 1 + items.length) % items.length;
      }
      items.forEach((it, i) => it.classList.toggle("active", i === state.cmdIndex));
      if (e.key === "Enter") {
        e.preventDefault();
        run((state.cmdIndex >= 0 ? items[state.cmdIndex].dataset.cmd : cmd.value) || "");
      }
      if (e.key === "Escape") sug.innerHTML = "";
    });
    sug.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-cmd]");
      if (!li) return;
      cmd.value = li.dataset.cmd;
      run(cmd.value);
    });
  }

  function renderPage() {
    document.title = `${t("meta.siteName")} | ${t(`nav.${pageId}`)}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (value) el.textContent = value;
    });
    const p = tr().pages[pageId];
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const prompt = document.getElementById("page-prompt");
    const wrap = document.getElementById("page-sections");
    title.textContent = p.title;
    subtitle.textContent = p.subtitle;
    prompt.textContent = p.prompt;
    wrap.innerHTML = p.sections
      .map((s) => `<article class="section-card"><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p></article>`)
      .join("");
  }

  function filteredProjects() {
    const q = state.project.search.toLowerCase();
    let list = DATA.projects.filter((x) => {
      if (state.project.tag !== "all" && !x.tags.includes(state.project.tag)) return false;
      if (state.project.show === "featured" && !x.featured) return false;
      if (state.project.show === "ai" && !x.tags.includes("ai")) return false;
      if (q) {
        const txt = [x.name[state.lang], x.summary[state.lang], x.stack.join(" "), x.tags.join(" ")].join(" ").toLowerCase();
        if (!txt.includes(q)) return false;
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
    search.placeholder = t("projects.searchPlaceholder");
    sort.querySelector("option[value='featured']").textContent = t("projects.sortFeatured");
    sort.querySelector("option[value='newest']").textContent = t("projects.sortNewest");
    sort.querySelector("option[value='complex']").textContent = t("projects.sortComplex");
    search.value = state.project.search;
    sort.value = state.project.sort;

    const allTags = [...new Set(DATA.projects.flatMap((p) => p.tags))];
    tags.innerHTML = [`<button class="chip ${state.project.tag === "all" ? "active" : ""}" data-tag="all">${esc(t("projects.tagAll"))}</button>`]
      .concat(allTags.map((x) => `<button class="chip ${state.project.tag === x ? "active" : ""}" data-tag="${x}">${x}</button>`))
      .join("");

    const rows = filteredProjects();
    list.innerHTML = rows.length
      ? rows
          .map(
            (p) => `<article class="project-card terminal-card">
              <h3>${esc(p.name[state.lang])}</h3>
              <p>${esc(p.summary[state.lang])}</p>
              <p class="meta">${esc(t("projects.status"))}: ${esc(p.status === "done" ? t("projects.statusDone") : t("projects.statusWip"))}</p>
              <p class="meta">${esc(t("projects.stack"))}: ${esc(p.stack.join(", "))}</p>
              <div class="tag-line">${p.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
              <button class="icon-btn details-btn" data-id="${p.id}">${esc(t("projects.details"))}</button>
            </article>`
          )
          .join("")
      : `<p class="muted">${esc(t("projects.noResults"))}</p>`;

    search.oninput = () => {
      state.project.search = search.value;
      renderProjects();
    };
    sort.onchange = () => {
      state.project.sort = sort.value;
      renderProjects();
    };
    tags.onclick = (e) => {
      const b = e.target.closest("[data-tag]");
      if (!b) return;
      state.project.tag = b.dataset.tag;
      renderProjects();
    };
    list.querySelectorAll(".details-btn").forEach((b) => b.addEventListener("click", () => openProject(b.dataset.id)));
  }

  function closeModal() {
    const modal = document.getElementById("project-modal");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }
  function openProject(id) {
    const p = DATA.projects.find((x) => x.id === id);
    if (!p) return;
    const modal = document.getElementById("project-modal");
    document.getElementById("project-modal-title").textContent = p.name[state.lang];
    document.getElementById("project-modal-summary").textContent = p.summary[state.lang];
    document.getElementById("project-modal-details").textContent = p.details[state.lang];
    document.getElementById("project-modal-stack").textContent = `${t("projects.stack")}: ${p.stack.join(", ")}`;
    const link = document.getElementById("project-modal-link");
    const copy = document.getElementById("project-copy-pitch");
    link.href = p.link || "#";
    link.textContent = t("projects.openLink");
    copy.textContent = t("projects.copyPitch");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(p.pitch[state.lang]);
        copy.textContent = t("projects.copied");
      } catch (_) {}
    };
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }

  function renderGuided() {
    document.getElementById("guided-root").innerHTML = `
      <div id="guided-panel" class="guided-panel" hidden>
        <div class="guided-backdrop"></div>
        <section class="guided-dialog terminal-card" role="dialog" aria-modal="true">
          <h2>${esc(t("guided.title"))}</h2>
          <p class="muted">${esc(t("guided.subtitle"))}</p>
          <div class="guided-group" data-kind="purpose">
            <p>${esc(t("guided.purpose"))}</p>
            <button data-value="hiring">${esc(t("guided.purposeHiring"))}</button>
            <button data-value="collaboration">${esc(t("guided.purposeCollaboration"))}</button>
            <button data-value="curiosity">${esc(t("guided.purposeCuriosity"))}</button>
          </div>
          <div class="guided-group" data-kind="vibe">
            <p>${esc(t("guided.vibe"))}</p>
            <button data-value="minimal">${esc(t("guided.vibeMinimal"))}</button>
            <button data-value="neon">${esc(t("guided.vibeNeon"))}</button>
            <button data-value="retro">${esc(t("guided.vibeRetro"))}</button>
          </div>
          <div class="guided-group" data-kind="show">
            <p>${esc(t("guided.show"))}</p>
            <button data-value="featured">${esc(t("guided.showFeatured"))}</button>
            <button data-value="recent">${esc(t("guided.showRecent"))}</button>
            <button data-value="ai">${esc(t("guided.showAi"))}</button>
          </div>
          <div class="guided-actions">
            <button id="guided-apply" class="icon-btn">${esc(t("guided.apply"))}</button>
            <button id="guided-close" class="icon-btn">${esc(t("guided.close"))}</button>
          </div>
        </section>
      </div>
    `;
    const panel = document.getElementById("guided-panel");
    panel.querySelectorAll(".guided-group button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".guided-group");
        group.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
        state.guided[group.dataset.kind] = btn.dataset.value;
      });
    });
    panel.querySelector(".guided-group[data-kind='purpose'] button[data-value='hiring']").classList.add("active");
    panel.querySelector(".guided-group[data-kind='vibe'] button[data-value='minimal']").classList.add("active");
    panel.querySelector(".guided-group[data-kind='show'] button[data-value='featured']").classList.add("active");
    document.getElementById("guided-close").onclick = () => (panel.hidden = true);
    panel.querySelector(".guided-backdrop").onclick = () => (panel.hidden = true);
    document.getElementById("guided-apply").onclick = () => {
      const themeMap = { minimal: "blue", neon: "neon", retro: "amber" };
      applyTheme(themeMap[state.guided.vibe] || "blue");
      state.project.show = state.guided.show;
      localStorage.setItem("portfolio.show", state.project.show);
      panel.hidden = true;
      if (pageId === "home") {
        renderProjects();
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else window.location.href = `${hrefFor("home")}#projects`;
    };
  }

  function openGuided() {
    const panel = document.getElementById("guided-panel");
    if (panel) panel.hidden = false;
  }

  function bindGlobal() {
    document.getElementById("modal-close").onclick = closeModal;
    document.getElementById("project-modal").addEventListener("click", (e) => {
      if (e.target.matches("[data-close-modal='true']")) closeModal();
    });
    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(".dropdown")) {
        document.querySelectorAll(".drop-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        document.querySelectorAll(".submenu").forEach((s) => s.classList.remove("open"));
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        const panel = document.getElementById("guided-panel");
        if (panel) panel.hidden = true;
      }
    });
  }

  function render() {
    renderHeader();
    renderPage();
    renderProjects();
    renderGuided();
  }

  applyTheme(state.theme);
  setLang(state.lang);
  bindGlobal();
})();
