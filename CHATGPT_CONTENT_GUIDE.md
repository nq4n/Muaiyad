# ChatGPT HTML Content Guide

Use this file when you want ChatGPT to help you draft page content for this portfolio.

The goal is simple:

- help you build the body content under the existing navbar
- keep the site shell, theme, and layout untouched
- return HTML content that you can review, edit, and place yourself

## Editing Model

This workflow is:

- human-led editing
- AI-assisted drafting

That means:

- you decide the final content
- you choose what stays, what changes, and what gets removed
- ChatGPT helps you draft, expand, rewrite, or structure the HTML
- ChatGPT is not the owner of the page content

## No In-Page Editor

There is no edit button in the site UI.

That means:

- content is not edited from inside the page
- content is prepared with ChatGPT, then reviewed by you
- final content is pasted directly into the project files
- the files are the source of truth

## What ChatGPT Should Return

Ask ChatGPT to return:

- an HTML fragment only
- semantic content blocks
- draft content that fits a terminal-style portfolio

Do not ask ChatGPT to return:

- JSON
- a full HTML document
- CSS files
- JavaScript
- navbar changes
- theme changes
- page-wide layout changes

## Visual Direction

The page already has:

- a CLI-inspired shell
- restrained Arabic geometric atmosphere in the background
- strong cards, spacing, and typography

The content should support that style, not fight it.

That means:

- keep reading areas clean
- use short headings
- avoid heavy decoration inside the content itself
- prefer strong structure over visual noise

## Content Stacking

Good page flow:

1. Open with context or overview.
2. Show method, process, or artifact.
3. Show evidence, reflection, or result.
4. End with impact, takeaway, or next step.

Recommended length:

- short page: 2 sections
- standard page: 3 to 4 sections
- long page: 4 to 6 sections

## Preferred HTML Structure

Use the existing classes so the content inherits the site styling.

The point is to give you a strong draft that is easy for you to adjust manually.

Base section pattern:

```html
<section class="section-card reveal" data-reveal="fade-up">
  <div class="section-block-inner">
    <div class="section-headline">
      <h2>Section Title</h2>
    </div>
    <div class="section-copy">
      <p>First paragraph.</p>
      <p>Second paragraph.</p>
    </div>
  </div>
</section>
```

Useful existing classes:

- `section-card`
- `reveal`
- `section-block-inner`
- `section-headline`
- `section-copy`
- `section-media`
- `section-caption`
- `section-html`

Useful reveal values:

- `fade-up`
- `slide-left`
- `slide-right`
- `zoom-in`
- `none`

## Writing Rules

Keep the writing compact and concrete.

- headings should be short
- paragraphs should be short
- prefer 1 to 3 paragraphs per section
- avoid filler openings
- use specific methods, dates, tools, outcomes, and evidence
- keep the tone professional and direct
- English should be concise and polished
- Arabic should be natural and professional, not literal

## HTML Rules

Safe tags:

- `section`
- `div`
- `h2`
- `h3`
- `p`
- `ul`
- `ol`
- `li`
- `strong`
- `em`
- `blockquote`
- `figure`
- `img`
- `figcaption`
- `a`

Avoid unless truly necessary:

- `table`
- inline styles
- scripts
- forms
- iframes

## Lists

Use lists only when the content is naturally list-shaped.

Good example:

```html
<section class="section-card reveal" data-reveal="fade-up">
  <div class="section-block-inner">
    <div class="section-headline">
      <h2>Design Priorities</h2>
    </div>
    <div class="section-copy">
      <p>The work focused on three priorities:</p>
      <ul>
        <li>clear learning outcomes</li>
        <li>practical classroom use</li>
        <li>evidence-based assessment</li>
      </ul>
    </div>
  </div>
</section>
```

Avoid long bullet dumps.

## Media

Only use images if the asset already exists in the repo.

Example:

```html
<section class="section-card reveal" data-reveal="zoom-in">
  <div class="section-block-inner">
    <div class="section-headline">
      <h2>Artifact Snapshot</h2>
    </div>
    <figure class="section-media">
      <img src="assets/img/example.webp" alt="Artifact preview" loading="lazy" />
      <figcaption class="section-caption">Short caption.</figcaption>
    </figure>
    <div class="section-copy">
      <p>Explain what the viewer should notice.</p>
    </div>
  </div>
</section>
```

Do not invent file paths.

## Good Content Shape

A strong section usually has:

- one clear heading
- one idea per section
- one short supporting example or explanation
- one direct outcome or reflection

That usually works better than:

- very long essays
- too many nested blocks
- visually noisy markup
- repeated filler language

## System Prompt

Use this as the system prompt when asking ChatGPT to help you draft page content:

```text
You are assisting a human editor who is building body content for a bilingual terminal-style portfolio website.

Return HTML fragments only.

Rules:
- Do not return JSON.
- Do not return a full HTML document.
- Do not include html, head, or body tags.
- Do not include JavaScript.
- Do not include CSS unless explicitly requested.
- Keep content readable, structured, and visually calm.
- Use semantic HTML.
- Use existing classes where helpful:
  section-card, reveal, section-block-inner, section-headline, section-copy, section-media, section-caption.
- Keep headings short.
- Keep paragraphs concise.
- Prefer concrete evidence, outcomes, and reflection over filler.
- Match a professional portfolio tone.
- Arabic must read naturally.
- English must be polished and concise.
- Treat the human as the final editor.
- Produce drafts that are easy to revise manually.
```

## User Prompt Template

Use this as the user prompt:

```text
Help me draft the body content for the page "<PAGE_ID>" as an HTML fragment only.

Context:
- Topic: <TOPIC>
- Audience: <AUDIENCE>
- Goal of the page: <GOAL>
- Tone: professional, compact, clear
- Language: <English or Arabic>
- Length: <short / standard / long>

Content requirements:
- Use 3 to 4 stacked sections unless I specify otherwise.
- Use the site's existing classes when useful.
- Keep the content readable inside a terminal-style portfolio.
- Do not change the navbar, theme, or global layout.
- Do not return JSON.
- Do not return a full document.
- Make the output easy for me to edit manually afterward.

Optional source notes:
<PASTE YOUR RAW NOTES HERE>
```

## Where To Paste The Result

Paste the final HTML fragment into:

- `translations.en.pages["PAGE_ID"].builderHtml`
- `translations.ar.pages["PAGE_ID"].builderHtml`

If a page truly needs page-specific CSS, put only the minimum CSS into:

- `translations.en.pages["PAGE_ID"].builderCss`
- `translations.ar.pages["PAGE_ID"].builderCss`

Default rule:

- prefer HTML content only
- add custom CSS only when the content cannot fit the existing system cleanly
- do not assume there is an edit button in the site

## Recommended Workflow

1. Write your raw notes first.
2. Ask ChatGPT to turn those notes into an HTML fragment draft.
3. Review the structure, tone, and accuracy yourself.
4. Edit the returned HTML manually as needed.
5. Paste the final version into the correct `builderHtml` field.

Use ChatGPT as a drafting partner, not as the final editor.
