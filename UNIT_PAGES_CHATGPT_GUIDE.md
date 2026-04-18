# Unit Pages ChatGPT Guide

This brief is for layout and theme work on the unit pages only. It is based on the real Flask app data under `flask_app/static/js/data/pages/unit-*.js`, plus the active theme setup in `app.py`, `flask_app/static/js/data/site.js`, and the shared CSS.

## Goal Of This File

- Give ChatGPT a reliable design brief for the unit pages before making layout or theme decisions.
- Summarize what each unit page currently contains in the real Flask app.
- Clarify the active theme system and the visual constraints already in place.
- Help organize the unit pages as one coherent sequence instead of treating each page as an isolated design.

## Scope

- Unit sequence: `unit-plan`, `unit-1-intro`, `unit-2-framework`, `unit-3-objectives`, `unit-4-assessment`, `unit-5-lessons`, `unit-6-feedback`, `unit-7-impact`, `unit-8-reflection`, `unit-9-references`, `unit-10-appendices`
- The subject is a Grade 6 robotics unit taught through VEXcode VR.
- Keep Arabic and English versions aligned.
- Preserve RTL/LTR behavior.
- The real app is the Flask site, not the root prototype.

## Current Theme System

- Active themes exposed to the real site: `arabesque` and `light`
- Default theme: `arabesque`
- `arabesque`: dark charcoal background, warm parchment text, gold accent, ornamental geometry, formal and academic mood
- `light`: warm sand / paper background, bronze-gold accent, softer ornamental overlays, lighter archival mood
- Extra palettes exist in `themePalettes` but are not active in the current `themes` array: `neon`, `amber`, `blue`
- Current command help and route setup only expose `theme [arabesque|light]`, so those are the real switchable themes unless the system is expanded

## Existing Layout Patterns

- `unit-1-intro` is a custom page with a dedicated hero, two tables, and several narrative sections
- `unit-2-framework` through `unit-8-reflection` currently render as hero + stacked section cards from JS data
- `unit-plan`, `unit-9-references`, and `unit-10-appendices` are still placeholder-level pages
- A shared footer navigator now exists on all unit pages and links across the full unit sequence

## Page-By-Page Content Summary

### `unit-plan`

- Current state: placeholder only
- Mentions: overview, implementation notes, next action
- Layout direction: treat as a gateway / cover page for the unit, not as a dense content page yet

### `unit-1-intro`

- Purpose: orient the reader to the robotics unit
Mentions:
- Unit overview and rationale for teaching robotics through VEXcode VR
- General unit data table with grade, duration, tool, domains, methods, prerequisites, and assessment types
- Lesson distribution table for 8 lessons
- Cross-curricular links with math, science, and life skills
- Learning context and pedagogical rationale
- Layout direction: strong introduction/dashboard page with overview first, evidence tables in the middle, rationale/context at the end

### `unit-2-framework`

- Purpose: academic and pedagogical foundation
Mentions:
- Introduction to the theoretical framework
- Cognitive theories, developmental considerations, age characteristics
- Teaching strategies and assessment frameworks
- Key terms, critical reading, and conclusion
- Layout direction: scholarly reference page, dense but structured, works well with anchored sections or a formal research-paper feel

### `unit-3-objectives`

- Purpose: define learning outcomes clearly
Mentions:
- General objectives
- Specific knowledge objectives
- Specific skill objectives
- Specific affective objectives
- Layout direction: taxonomy page, hierarchy matters more than narrative flow; number-led cards, grouped lists, or a domain-based matrix fit well

### `unit-4-assessment`

- Purpose: explain how student learning is measured
Mentions:
- Assessment overview
- Diagnostic assessment
- Formative assessment during learning
- Short quizzes
- Practical activity
- Summative assessment
- Conclusion
- Layout direction: process / cycle layout; diagnostic-to-formative-to-summative progression should be visually obvious

### `unit-5-lessons`

- Purpose: explain how lesson plans were prepared
Mentions:
- Lesson planning approach
- Required planning elements
- Educational activities
- Variety of teaching strategies
- Assessment inside plans
- Individual differences and planning flexibility
- Note about appendices
- Layout direction: planning board / workflow page with clear instructional-design structure

### `unit-6-feedback`

- Purpose: document feedback as an instructional process
Mentions:
- Feedback overview
- Types and modes of feedback
- Synchronous oral feedback
- Asynchronous written feedback
- Coverage of learning domains
- Individual differences
- Self and peer assessment
- Role of feedback in improving learning
- Note linking back to appendices
- Layout direction: feedback loop / support system page; should feel practical and classroom-centered

### `unit-7-impact`

- Purpose: measure learning impact through data and reflection
Mentions:
- Impact overview
- Assessment data used
- Analysis methods and use of technology
- Before/after comparison
- Interpretation of results
- Discussion for improvement
- Graph analysis
- Conclusion
- Layout direction: evidence and analytics page; charts, score summaries, comparison blocks, and findings-style sections fit best

### `unit-8-reflection`

- Purpose: reflective teaching-practice page
Mentions:
- Feedback as a teaching practice
- Feedback types and modes
- Synchronous oral feedback
- Asynchronous written feedback
- Feedback across learning domains
- Individual differences
- Self and peer assessment
- Role of feedback in learning improvement
- Note
- Layout direction: reflective companion to `unit-6-feedback`; content overlaps heavily with unit 6, so the visual distinction should come from a more reflective, evaluative framing

### `unit-9-references`

- Current state: placeholder only
- Mentions: overview, implementation notes, next action
- Layout direction: future bibliography / sources page; use minimal, reference-oriented styling when real content is added

### `unit-10-appendices`

- Current state: placeholder only
- Mentions: overview, implementation notes, next action
- Layout direction: future evidence archive / attachments page; think documents, attachments, proof items, and supporting files

## Theme Organization Suggestions

- Keep the whole unit inside one visual family. Do not make every page feel like a different site.
- Use `arabesque` as the formal academic baseline and `light` as the cleaner archival baseline.
Suggested clustering:
- Foundation cluster: `unit-plan`, `unit-1-intro`, `unit-2-framework`, `unit-3-objectives`
- Teaching-process cluster: `unit-4-assessment`, `unit-5-lessons`, `unit-6-feedback`
- Evidence-and-reflection cluster: `unit-7-impact`, `unit-8-reflection`
- Archive cluster: `unit-9-references`, `unit-10-appendices`
- Vary density, section rhythm, and accent emphasis by cluster instead of inventing a brand-new theme per page.
- Do not let placeholder pages (`unit-plan`, `unit-9`, `unit-10`) dominate the theme decisions until their real content is written.

## High-Value Design Notes

- Unit 1 is the best candidate for an orientation-heavy layout with tables and summary blocks.
- Unit 2 and Unit 3 are the most content-dense academic pages and need the strongest information architecture.
- Unit 4 through Unit 8 should feel like a sequence: assessment, planning, feedback, impact, then reflection.
- Unit 7 is the best page for charts or data visualizations.
- Unit 8 should feel more reflective than Unit 6 even though the content themes overlap.
