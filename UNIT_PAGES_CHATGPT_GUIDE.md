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

## Page Guidance

### `unit-plan`

This page functions as a gateway to the unit. Use a large hero or cover panel with the unit's title and a brief summary. Below, add short notes about the upcoming content and implementation, but keep the page light; avoid dense academic text.

### `unit-1-intro`

Begin with a strong introductory section explaining why robotics is being taught with VEXcode VR. Follow this with two clearly styled tables: one summarising general unit data (grade, duration, tool, domains, methods, prerequisites and assessment types) and another showing the lesson distribution. After the tables, provide cross-curricular links and a narrative section covering learning context and pedagogical rationale. Use clear headings and group related paragraphs together so readers move smoothly from overview to evidence and then to rationale.

### `unit-2-framework`

Treat this as a scholarly reference page. Start with an introduction to the theoretical framework, then separate sections for cognitive theories, developmental considerations and age characteristics. Follow with sections on teaching strategies, assessment frameworks, key terms and critical readings, and end with a conclusion. Maintain tight information architecture: use anchored section headings and a formal research-paper rhythm to organise the dense material.

### `unit-3-objectives`

Focus on hierarchy rather than narrative flow. Use separate blocks or lists for general objectives and each set of specific objectives (knowledge, skills and affective). Numbered lists or domain-based groupings help readers scan the objectives quickly.

### `unit-4-assessment`

This page should illustrate the assessment process. Begin with an overview and then present each assessment type - diagnostic, formative, short quizzes, practical activity and summative - in sequence. A visual flow or cycle diagram can emphasise progression. Conclude with a summary of how these assessments support learning outcomes.

### `unit-5-lessons`

Use a planning board or workflow layout. Start by explaining the lesson planning approach, then break the page into sections for required planning elements, educational activities and the variety of teaching strategies. Next, describe assessment embedded within plans and how individual differences and flexibility are handled. End with a brief note pointing to appendices. Card-style panels or a columned layout can support the structured planning feel.

### `unit-6-feedback`

Present feedback as an ongoing classroom support system. Begin with a general overview, then separate sections for types and modes (oral vs. written), synchronous and asynchronous feedback, coverage across learning domains, individual differences, self and peer assessment, and the role of feedback in improving learning. A loop or cycle visual can reinforce the notion that feedback is an iterative process.

### `unit-7-impact`

Make this an evidence-driven analytics page. Start with an overview of what was measured, then move to sections on the data used, analysis methods and technology, before/after comparisons, interpretation of results, discussion for improvement and graph analysis. Use charts, score summaries and comparison blocks prominently to make the findings clear. Conclude with a short summary linking back to learning objectives.

### `unit-8-reflection`

This page mirrors the feedback themes but adopts a more reflective tone. Open with a discussion of feedback as a teaching practice and then revisit the types and modes of feedback, synchronous vs. asynchronous methods, domain coverage, individual differences, self/peer assessment and the role of feedback in learning improvement. Instead of process diagrams, lean on narrative commentary, reflective questions and summarising callouts to encourage evaluation.

### `unit-9-references`

Currently a placeholder. When populated, organise sources in a minimal, reference-oriented style: use clear citations, bibliographic entries and potentially a search/filter widget. Avoid dense prose; the page should support quick reference.

### `unit-10-appendices`

Also a placeholder. Design this page as an archive for documents and supporting files. Use a simple document list or card gallery for attachments so users can access evidence and supplementary materials easily.

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
