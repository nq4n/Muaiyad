You are Codex. Build a complete, production-ready bilingual (Arabic + English) personal portfolio website with a CLI/terminal theme, matching the SAME navbar pages + dropdown structure as this Wix site:
https://moatazalbriki.wixsite.com/final-portfolio

IMPORTANT
- Must run by opening index.html (no build tools, no backend).
- Use pure HTML + CSS + JavaScript only.
- Fully responsive + accessible (ARIA, keyboard nav, focus states).
- Support RTL/LTR properly (Arabic RTL, English LTR).
- Provide language toggle (AR/EN) and auto-switch document dir + font.
- Provide terminal-style vibe + buttons + interactive flow + project showcase.

NAVBAR STRUCTURE (must match exactly)
Top navbar (sticky) with these main items:
1) الرئيسية / Home
2) الفلسفة التربوية / Educational Philosophy
3) السيرة الذاتية / CV
4) خطة الوحدة / Unit Plan  (dropdown with 10 subpages below)
   - 1- مقدمة الوحدة / 1- Unit Introduction
   - 2- الإطار النظري / 2- Theoretical Framework
   - 3- الأهداف العامة والخاصة / 3- General & Specific Objectives
   - 4- طرق قياس تعلم الطلبة / 4- Measuring Student Learning
   - 5- إعداد خطط الدروس / 5- Lesson Plans Preparation
   - 6- التغذية الراجعة / 6- Feedback
   - 7- قياس أثر التعلم / 7- Measuring Learning Impact
   - 8- التأمل في الممارسات التدريسية / 8- Reflection on Teaching Practices
   - 9- المراجع العلمية / 9- References
   - 10- الملاحق / 10- Appendices
5) محاور الإطار المفاهيمي / Conceptual Framework Axes
6) الأوراق التأملية / Reflection Papers
7) مشروع التخرج / Graduation Project
8) أخرى / Other (dropdown with 4 subpages below)
   - سيناريوهات القيم المهنية / Professional Values Scenarios
   - الورشة / Workshop
   - أدلة النمو المهني / Professional Growth Evidence
   - أدلة تبادل الزيارات / Peer Visit Exchange Evidence

ROUTING / PAGES
- Implement as a multi-page static site (recommended) with one HTML file per page (clean URLs).
- Provide a shared navbar component via JS injection OR repeat the header cleanly.
- Each page must have BOTH Arabic and English content available via toggle (same page, different language text).

FILE TREE (deliver exactly these; add more only if necessary)
/
  index.html
  pages/
    philosophy.html
    cv.html
    unit-plan.html
    unit-1-intro.html
    unit-2-framework.html
    unit-3-objectives.html
    unit-4-assessment.html
    unit-5-lessons.html
    unit-6-feedback.html
    unit-7-impact.html
    unit-8-reflection.html
    unit-9-references.html
    unit-10-appendices.html
    framework-axes.html
    reflection-papers.html
    graduation-project.html
    other.html
    other-values.html
    other-workshop.html
    other-growth.html
    other-peer-visits.html
  assets/
    css/style.css
    js/data.js
    js/app.js
    img/ (optional)

CLI / TERMINAL THEME (site-wide)
- Dark terminal background, subtle grid/noise, glowing accents (not too tacky).
- Blinking cursor effects, typewriter animation in hero areas.
- “Terminal window” cards for sections and content blocks.
- Three switchable themes via CSS variables: Neon Green, Amber Retro, Blue Night.
- Theme switcher button + also via terminal command.

INTERACTIVITY (must)
1) Navbar system
- Sticky navbar with dropdown menus (Unit Plan + Other).
- Mobile hamburger menu.
- Active page highlighting.
- Keyboard accessible dropdowns (Enter/Space, Esc closes, arrow navigation if possible).

2) Terminal command bar (global)
- A small command input (in navbar or hero) that navigates pages by commands:
  help, home, philosophy, cv, unit, framework, reflections, graduation, other,
  unit1..unit10, other1..other4, theme, lang, clear
- Autocomplete suggestions dropdown.

3) Guided Mode (global)
- A “guided mode” widget (modal or panel) with button choices:
  - الهدف؟ / Purpose: توظيف (Hiring), تعاون (Collaboration), فضول (Curiosity)
  - النمط؟ / Vibe: Minimal, Neon, Retro
  - اعرض؟ / Show: Featured, Recent, AI Projects
- Based on choices:
  - Change theme
  - Navigate to Projects section on Home
  - Filter showcased projects

PROJECT SHOWCASE (Home page)
- Data-driven from assets/js/data.js.
- Must include “nerdy projects” placeholders but editable:
  - EduPack (AI-assisted SCORM/xAPI generator)
  - IAS (exam OCR + grading pipeline)
  - Local AI Workflow (ComfyUI / video loops)
  - CLI Portfolio (this site)
  - Noise Cancellation Tool (Python + Tkinter)
  - AI Study Web App (learning + chat tools)
- Cards with tags, stack, status (WIP/Done), links.
- Filters: search, tag chips, sort (Featured / Newest / Most complex).
- Modal details on click + “Copy pitch” button.

CONTENT STYLE (bilingual + reusable)
- Store all text in a translation map in data.js:
  translations = { ar: {...}, en: {...} }
- Store profile data in data.js:
  profile = { name_ar, name_en, role_ar, role_en, bio_ar, bio_en, location, links... }
- Each page should have real-looking placeholder content in both languages,
  written in simple, professional style (no lorem ipsum).

RTL/LTR RULES
- When Arabic is active:
  - <html dir="rtl" lang="ar">
  - Proper alignment, spacing, punctuation.
- When English is active:
  - <html dir="ltr" lang="en">
- Smooth toggle without reload (but it’s okay if you reload for multi-page consistency).

ACCESSIBILITY + QUALITY
- Skip-to-content link.
- Focus outlines visible.
- ARIA for menus, modals, command suggestions.
- No broken links: use real internal links, external placeholders (#).
- Fast: minimal JS, no heavy libraries, no big images by default.

DELIVERABLE
- Print the full file tree.
- Then output complete code for each file in order:
  1) index.html
  2) ALL pages/*.html
  3) assets/css/style.css
  4) assets/js/data.js
  5) assets/js/app.js

Do not give explanations—only the deliverables + code.