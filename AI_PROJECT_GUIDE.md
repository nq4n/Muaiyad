# AI Project Guide

This file explains the purpose of the main folders and files in this repository.

## What This Project Is

This repository contains a bilingual Arabic/English achievement portfolio for field training.

There are two frontend surfaces in the repo:

1. The real application:
   `app.py` + `flask_app/templates/` + `flask_app/static/`
2. A separate legacy/static prototype:
   `index.html` + `assets/`

Important:

- The Flask app is the source of truth.
- The root static prototype is not automatically synced with the Flask app.
- If you change `assets/*`, you are changing the prototype, not the real Flask-rendered site.

## Top-Level Structure

| Path | Purpose |
| --- | --- |
| `.git/` | Git history and repository metadata. |
| `.github/` | GitHub automation and deployment settings. |
| `.github/workflows/static.yml` | GitHub Pages deployment workflow that uploads the repository as a Pages artifact. |
| `assets/` | Legacy static prototype assets for the standalone `index.html` surface. |
| `flask/` | Local Python virtual environment used to run the project. |
| `flask_app/` | Main application code: templates, static assets, and source JSON data. |
| `__pycache__/` | Generated Python bytecode cache. Safe to ignore. |
| `AGENTS.md` | Repository-specific working rules for agents and maintainers. Explains source of truth, editing rules, and verification expectations. |
| `AI_PROJECT_GUIDE.md` | This guide file. |
| `app.py` | Flask entrypoint, route definitions, page registry, nav structure, route aliases, and API endpoints. |
| `index.html` | Entry file for the legacy static prototype, not the Flask app. |
| `portfolio_base_README.md` | Original build/specification prompt for the earlier static portfolio version. |
| `PWD_SYSTEM_INSTRUCTIONS.md` | Prompt instructions for drafting page body content only. |
| `requirements.txt` | Python dependencies for the Flask app. Currently minimal. |
| `unit intro.md` | Working content/draft document related to unit introduction material. |

## Main Application: `flask_app/`

### `flask_app/data/`

These files look like structured content/reference material used during development.

| Path | Purpose |
| --- | --- |
| `flask_app/data/field_training_achievement_file.json` | Source-style JSON describing portfolio sections, quick links, projects, and other achievement file content. |
| `flask_app/data/structured_pages.json` | Structured content blueprint for page writing and organization, especially page-section planning. |

### `flask_app/templates/`

This folder contains the Flask-rendered HTML templates.

| Path | Purpose |
| --- | --- |
| `flask_app/templates/base.html` | Shared page shell used by the Flask app. Loads shared CSS, data files, and JavaScript. Sets the page id on `<body>`. |
| `flask_app/templates/partials/` | Shared reusable template partials. |
| `flask_app/templates/partials/page_blueprint_macros.html` | Macros/helpers used by structured page templates. |
| `flask_app/templates/pages/` | Page-level templates for each route. |

#### Template Patterns

| Path | Purpose |
| --- | --- |
| `flask_app/templates/pages/structured-page.html` | Reusable page pattern for hero + structured sections/cards/steps/links. |
| `flask_app/templates/pages/text-triad.html` | Reusable page pattern for simple three-part narrative pages. |

#### Current Page Templates

| Path | Purpose |
| --- | --- |
| `flask_app/templates/pages/home.html` | Custom home page shell. JS fills in the live content regions and interactive visuals. |
| `flask_app/templates/pages/philosophy.html` | Custom educational philosophy page with JS-driven tab/selector behavior. |
| `flask_app/templates/pages/cv.html` | CV page shell used with JS-rendered sections and cards. |
| `flask_app/templates/pages/unit-plan.html` | Unit plan overview page template. |
| `flask_app/templates/pages/unit-1-intro.html` | Unit 1 introduction page template. |
| `flask_app/templates/pages/unit-2-framework.html` | Unit 2 theoretical framework page template. |
| `flask_app/templates/pages/unit-3-objectives.html` | Unit 3 objectives page template. |
| `flask_app/templates/pages/unit-4-assessment.html` | Unit 4 assessment page template. |
| `flask_app/templates/pages/unit-5-lessons.html` | Unit 5 lesson preparation page template. |
| `flask_app/templates/pages/unit-6-feedback.html` | Unit 6 feedback page template. |
| `flask_app/templates/pages/unit-7-impact.html` | Unit 7 learning impact page template. |
| `flask_app/templates/pages/unit-8-reflection.html` | Unit 8 teaching reflection page template. |
| `flask_app/templates/pages/unit-9-references.html` | Unit 9 references page template. |
| `flask_app/templates/pages/unit-10-appendices.html` | Unit 10 appendices page template. |
| `flask_app/templates/pages/conceptual-axes.html` | Custom conceptual axes page shell with connector/canvas logic handled in JS. |
| `flask_app/templates/pages/reflection-papers.html` | Reflection papers page template. |
| `flask_app/templates/pages/graduation-project.html` | Graduation/research project page template. |
| `flask_app/templates/pages/other.html` | Other section landing page template. |
| `flask_app/templates/pages/other-values.html` | Professional values scenarios page template. |
| `flask_app/templates/pages/other-workshop.html` | Workshop page template. |
| `flask_app/templates/pages/other-growth.html` | Professional growth evidence page template. |
| `flask_app/templates/pages/other-peer-visits.html` | Peer visit exchange evidence page template. |
| `flask_app/templates/pages/other-parent-communication.html` | Parent communication form page template. |

#### Template/Route Note

`app.py` still references:

- `pages/framework-axes.html`

That file is currently not present in the working tree. This is a known route/template mismatch.

### `flask_app/static/`

This folder holds the frontend assets used by the Flask app.

#### `flask_app/static/css/`

The shared CSS was split into a small entry file plus focused partials.

| Path | Purpose |
| --- | --- |
| `flask_app/static/css/style.css` | CSS entry file loaded by `base.html`. Imports the partial stylesheets in order. |
| `flask_app/static/css/shell.css` | Base theme variables, typography, shell layout, navbar, terminal cards, shared structure, and global component styling. |
| `flask_app/static/css/content.css` | Page/content components, section layouts, CV styling, media/gallery/editor styles, and general content-oriented rules. |
| `flask_app/static/css/effects.css` | Loading screen styles, transitions, particles, hover effects, reveal effects, and animation-related rules. |
| `flask_app/static/css/restored-layouts.css` | Large page-specific layout tuning and responsive refinements, especially for home, philosophy, and conceptual axes sections. |

#### `flask_app/static/img/`

| Path | Purpose |
| --- | --- |
| `flask_app/static/img/portfolio-crest.svg` | Project crest/branding asset. |
| `flask_app/static/img/squ-logo.webp` | Sultan Qaboos University logo used in the site header/branding. |

#### `flask_app/static/vendor/`

| Path | Purpose |
| --- | --- |
| `flask_app/static/vendor/grapesjs/` | Third-party GrapesJS assets kept locally. |

#### `flask_app/static/js/`

This folder contains the shared client logic and the content data files used by the Flask app.

| Path | Purpose |
| --- | --- |
| `flask_app/static/js/app.js` | Small bootstrap/entry script. Starts the site, applies theme/language, renders pages, binds global behavior, and creates background effects. |
| `flask_app/static/js/data.js` | Older aggregated data file used by the static/legacy architecture, not the main Flask source-of-truth data path. |
| `flask_app/static/js/app/` | Split shared JS modules for the Flask app. |
| `flask_app/static/js/data/` | Content and translation data used by the Flask app. |

##### `flask_app/static/js/app/`

| Path | Purpose |
| --- | --- |
| `flask_app/static/js/app/core.js` | Shared app state, utility helpers, translations, theme/language functions, hero helpers, and general content helpers. |
| `flask_app/static/js/app/page-renderers.js` | JS rendering logic for pages like home, CV, philosophy, and unit intro. |
| `flask_app/static/js/app/conceptual-axes.js` | Specialized rendering and connector/canvas logic for the conceptual axes page. |
| `flask_app/static/js/app/home-journey.js` | Interactive animated journey/wordmark visual used on the home page. |
| `flask_app/static/js/app/home-site-map.js` | Interactive home page site map visualization and node-link layout logic. |
| `flask_app/static/js/app/header.js` | Header rendering, dropdown menus, CLI command bar, theme toggle, language toggle, and nav interaction logic. |

##### `flask_app/static/js/data/`

| Path | Purpose |
| --- | --- |
| `flask_app/static/js/data/site.js` | Global bilingual site data: translations, nav labels, command labels/help, themes, palettes, profile info, and shared metadata. |
| `flask_app/static/js/data/pages/` | Per-page bilingual content files. Each file usually sets `window.PORTFOLIO_PAGE_DATA["page-id"]`. |

##### Current Page Data Files

| Path | Purpose |
| --- | --- |
| `flask_app/static/js/data/pages/home.js` | Localized data for the home page. |
| `flask_app/static/js/data/pages/philosophy.js` | Localized data for the philosophy page. |
| `flask_app/static/js/data/pages/cv.js` | Localized data for the CV page. |
| `flask_app/static/js/data/pages/unit-plan.js` | Localized data for the unit plan overview page. |
| `flask_app/static/js/data/pages/unit-1-intro.js` | Localized data for unit 1 introduction. |
| `flask_app/static/js/data/pages/unit-2-framework.js` | Localized data for unit 2 theoretical framework. |
| `flask_app/static/js/data/pages/unit-3-objectives.js` | Localized data for unit 3 objectives. |
| `flask_app/static/js/data/pages/unit-4-assessment.js` | Localized data for unit 4 assessment. |
| `flask_app/static/js/data/pages/unit-5-lessons.js` | Localized data for unit 5 lesson plans. |
| `flask_app/static/js/data/pages/unit-6-feedback.js` | Localized data for unit 6 feedback. |
| `flask_app/static/js/data/pages/unit-7-impact.js` | Localized data for unit 7 learning impact. |
| `flask_app/static/js/data/pages/unit-8-reflection.js` | Localized data for unit 8 reflection. |
| `flask_app/static/js/data/pages/unit-9-references.js` | Localized data for unit 9 references. |
| `flask_app/static/js/data/pages/unit-10-appendices.js` | Localized data for unit 10 appendices. |
| `flask_app/static/js/data/pages/conceptual-axes.js` | Localized data for the conceptual axes page, including its link catalog and axes content. |
| `flask_app/static/js/data/pages/reflection-papers.js` | Localized data for the reflection papers page. |
| `flask_app/static/js/data/pages/graduation-project.js` | Localized data for the graduation/research project page. |
| `flask_app/static/js/data/pages/other.js` | Localized data for the top-level other page. |
| `flask_app/static/js/data/pages/other-values.js` | Localized data for professional values scenarios. |
| `flask_app/static/js/data/pages/other-workshop.js` | Localized data for workshop content. |
| `flask_app/static/js/data/pages/other-growth.js` | Localized data for professional growth evidence. |
| `flask_app/static/js/data/pages/other-peer-visits.js` | Localized data for peer visit exchange evidence. |
| `flask_app/static/js/data/pages/other-parent-communication.js` | Localized data for the parent communication form page. |

##### Data/Route Note

`app.py` still references:

- `flask_app/static/js/data/pages/framework-axes.js`

That file is currently not present in the working tree. This matches the missing template noted above.

## Legacy Static Prototype

The root prototype is useful for reference, but it is not the active Flask surface.

### Root Prototype Entry

| Path | Purpose |
| --- | --- |
| `index.html` | Entry page for the old static version of the portfolio. |

### `assets/`

| Path | Purpose |
| --- | --- |
| `assets/css/` | Shared CSS for the legacy static prototype. |
| `assets/css/style.css` | Main stylesheet for the legacy prototype. |
| `assets/img/` | Image assets for the legacy prototype. |
| `assets/img/squ-logo.webp` | University logo for the legacy prototype. |
| `assets/js/` | JavaScript for the legacy prototype. |
| `assets/js/app.js` | Main prototype behavior. |
| `assets/js/content.js` | Prototype content rendering helpers/content logic. |
| `assets/js/data.js` | Prototype global/site data. |
| `assets/js/links.json` | Prototype link mapping/content references. |
| `assets/js/multimedia.js` | Prototype media-specific behavior. |
| `assets/js/utils.js` | Prototype helper utilities. |
| `assets/vendor/grapesjs/` | Local GrapesJS vendor files for the prototype side. |
| `assets/vendor/grapesjs/grapes.min.css` | GrapesJS stylesheet. |
| `assets/vendor/grapesjs/grapes.min.js` | GrapesJS script. |

### Legacy Note

The prototype expects `pages/*.html`, but that directory does not exist in the current repo. This is one reason the Flask app should be treated as the real application.

## `app.py` Responsibilities

`app.py` is the backend entrypoint and owns the site registry.

Main responsibilities:

- Creates the Flask application.
- Defines the `PAGES` dictionary.
- Defines `NAV_STRUCTURE`.
- Defines `NAV_ICONS`.
- Defines `ROUTE_MAP` for CLI-style shortcuts.
- Defines available themes and the default theme.
- Provides `/` and `/<page_id>` routes.
- Provides lightweight JSON API endpoints:
  - `/api/data`
  - `/api/lang/<lang>`

## How To Edit The Project Safely

Use this map when deciding where to edit:

| Goal | Main file(s) to edit |
| --- | --- |
| Change text/content on one page | `flask_app/static/js/data/pages/<page>.js` |
| Change shared translations/nav/theme labels | `flask_app/static/js/data/site.js` |
| Change markup for one page | `flask_app/templates/pages/<page>.html` |
| Change shared JS behavior | `flask_app/static/js/app.js` and/or `flask_app/static/js/app/*.js` |
| Change shared CSS behavior | `flask_app/static/css/style.css` and/or its imported partials |
| Add or rename a page | `app.py`, template file, page data file, and any related nav/route data |

## Practical Maintenance Notes

- Always treat the Flask app as the real site.
- Keep Arabic and English content in sync.
- Preserve RTL/LTR behavior.
- When editing `home.html`, `philosophy.html`, or `conceptual-axes.html`, inspect their related JS modules first.
- The split CSS and JS files exist to keep future edits smaller and easier to manage.
- `framework-axes` is still referenced in routing/data logic but its template/data files are currently missing, so that page should be treated as incomplete until restored or removed from `app.py`.
