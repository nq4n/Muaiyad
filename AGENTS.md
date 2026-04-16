# AGENTS.md

## Mission

This repository contains a bilingual Arabic/English achievement portfolio for field training.

Default to the Flask-rendered site as the real application:

- `app.py`
- `flask_app/templates/`
- `flask_app/static/`

The root static copy:

- `index.html`
- `assets/`

is a separate prototype/legacy surface. It has diverged from the Flask app and is not automatically kept in sync.

## Source Of Truth

Use the Flask app unless the task explicitly targets the root static files.

- Real page shell: `flask_app/templates/base.html`
- Real routes: `app.py`
- Real shared JS: `flask_app/static/js/app.js`
- Real shared CSS: `flask_app/static/css/style.css`
- Real global site data: `flask_app/static/js/data/site.js`
- Real per-page content: `flask_app/static/js/data/pages/*.js`

Important:

- The root static site references `pages/*.html`, but that directory does not exist in this repo.
- Do not assume edits in `assets/` affect the Flask site.
- Do not overwrite one frontend with the other unless the user explicitly asks for parity.

If the user is actively working in `assets/*`, follow the request, but keep in mind that you are editing the standalone prototype, not the Flask site.

## Architecture

### Flask layer

- `app.py` owns `PAGES`, `NAV_STRUCTURE`, `ROUTE_MAP`, and the app entrypoint.
- `flask_app/templates/base.html` provides the shared shell and sets `<body data-page="{{ page_id }}">`.
- `flask_app/templates/pages/*.html` provides page-specific markup.

### Data layer

- `flask_app/static/js/data/site.js` holds:
  - translations
  - nav labels
  - command help text
  - theme ids and palettes
  - shared site metadata
- `flask_app/static/js/data/pages/<page>.js` holds localized page content:
  - `window.PORTFOLIO_PAGE_DATA["<page>"] = { en: ..., ar: ... }`

### Client layer

- `flask_app/static/js/app.js` hydrates the page, language toggle, theme state, CLI behavior, page rendering, and custom page interactions.
- If a template contains specific ids or `data-*` hooks, search for them in `flask_app/static/js/app.js` before renaming or removing them.

## Page Patterns

Prefer existing page patterns before inventing a new structure.

- `flask_app/templates/pages/text-triad.html`
  - good for simple three-part narrative pages
- `flask_app/templates/pages/structured-page.html`
  - good for hero + sections/cards/links/steps
- `flask_app/templates/partials/page_blueprint_macros.html`
  - shared rendering helpers for structured pages
- `flask_app/templates/pages/home.html`
  - custom home shell with JS-populated regions
- `flask_app/templates/pages/philosophy.html`
  - custom interactive shell with JS-driven tabs/content

When changing `home.html` or `philosophy.html`, inspect the matching logic in `flask_app/static/js/app.js` first. Those pages are not plain static markup.

## Editing Rules

- Keep Arabic and English content in sync. New labels, controls, and sections need both `en` and `ar`.
- Preserve RTL/LTR behavior. Do not hardcode left/right when logical styling or `dir`-aware behavior is required.
- Preserve keyboard accessibility for nav, dropdowns, CLI, and interactive panels unless the task explicitly changes behavior.
- Reuse existing structural classes when possible:
  - `section-card`
  - `terminal-card`
  - `section-block-inner`
  - `section-headline`
  - `section-copy`
  - `reveal`
- Prefer editing page data for content changes and page templates for layout changes.
- Avoid introducing a new framework, bundler, or build step. This project is plain Flask plus static assets.

## How To Change Things

### Copy/content only

Edit the matching page data file:

- `flask_app/static/js/data/pages/<page>.js`

### Shared labels, nav text, commands, themes

Edit:

- `flask_app/static/js/data/site.js`

### Layout/markup on one page

Edit:

- `flask_app/templates/pages/<page>.html`

### Shared interaction or rendering behavior

Edit:

- `flask_app/static/js/app.js`
- `flask_app/static/css/style.css`

### New page, renamed page, or route change

Update all relevant parts together:

- `app.py`
- `flask_app/static/js/data/site.js`
- `flask_app/templates/pages/<page>.html`
- `flask_app/static/js/data/pages/<page>.js`

If you add a new interactive hook in a template, wire it in `flask_app/static/js/app.js` in the same change.

## Content Drafting

For page-body writing tasks, use:

- `PWD_SYSTEM_INSTRUCTIONS.md`

That file contains the existing content prompt and style rules. Follow it instead of inventing a new content format.

Practical rule:

- For body-copy drafting, return or write HTML fragments only.
- Do not add CSS or JavaScript unless the task explicitly asks for it.

## Local Run

Use the local virtual environment already in the repo.

- Install deps: `.\flask\Scripts\python.exe -m pip install -r requirements.txt`
- Run app: `.\flask\Scripts\python.exe app.py`
- Open: `http://127.0.0.1:5000/`

`requirements.txt` currently only requires `Flask==3.0.0`.

## Verification

There is no real automated test suite in this repo. After any meaningful UI change, do a manual smoke test:

- home page
- one custom page such as `philosophy`
- one `unit-*` page
- one `other-*` page
- language toggle
- theme toggle
- CLI navigation
- mobile nav behavior

## Encoding

This project contains Arabic content. Preserve UTF-8 text.

If terminal output shows garbled Arabic, do not assume the file is broken. Check the file in the editor before rewriting strings.
