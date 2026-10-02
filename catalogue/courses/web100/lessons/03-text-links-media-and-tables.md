---
lesson_id: web100-03
course_id: web100
pathway: quality-assurance-software-engineer
title: Text, Links, Media, and Tables
order: 3
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Use common page elements such as text, links, media, and tables correctly
---

## Beyond the skeleton

Lesson 02 gave you a page's landmark structure: header, nav, main, sections, headings. This lesson fills that structure in with the elements you will meet on almost every page you ever test — paragraphs and text-level markup, links, images and other media, and tables. Each has a correct usage and a set of common misuses, and knowing the difference is what lets you tell a developer "this link is broken" versus "this is not actually a link."

## Text content: paragraphs and inline meaning

Block-level text belongs in `<p>` tags, not in `<br>`-separated lines inside a `<div>`:

```html
<p>The staging environment resets nightly at 02:00 UTC.</p>
<p>Report any data loss in the #qa-staging channel.</p>
```

Two paragraphs, two `<p>` tags. A wall of text broken only by `<br>` reads as a single paragraph to a screen reader and to any test that expects paragraph-level structure.

Inline elements carry meaning within a line of text:

```html
<p>This field is <strong>required</strong> and must be a valid <code>YYYY-MM-DD</code> date.</p>
```

- `<strong>` means "this is important," and browsers render it bold by default — but the meaning, not the boldness, is the point. `<em>` is the equivalent for stress emphasis, rendered italic by default.
- `<code>` marks inline code or literal values, like a field name or a format string. It is not just "smaller monospace font" — it tells a reader and a test both that this token is literal, not descriptive prose.
- `<b>` and `<i>` still exist and still render bold/italic, but they carry no semantic meaning — reach for `<strong>`/`<em>` (or `<code>`) first, and use `<b>`/`<i>` only for a case that is genuinely just stylistic (a book title styled as italic, say) with no "importance" or "emphasis" behind it.

Lists are their own structure, not paragraphs separated by dashes:

```html
<ul>
  <li>Chrome 124+</li>
  <li>Firefox 125+</li>
  <li>Safari 17+</li>
</ul>
```

Use `<ul>` for an unordered set, `<ol>` when order matters (like numbered test steps), and `<li>` for every item. A screen reader announces "list, 3 items" and lets a user navigate item by item — text that merely *looks* like a list because of manual dashes gets none of that.

## Links: what makes an `<a>` a real link

```html
<a href="/docs/staging-reset">staging reset schedule</a>
```

An `<a>` needs an `href` to be a real, keyboard-focusable, screen-reader-announced link. `<a>` without `href` (sometimes used as a click hook for JavaScript) is not a link to assistive technology — it won't get focus in tab order and won't be announced as "link." If something behaves like a link, it should be a real `<a href="...">`; if it behaves like a button that performs an action without navigating, it should be a real `<button>`, not an `<a>` with `href="#"` or `href="javascript:void(0)"`. This distinction is one of the most common defects you will file as a QA engineer: an element that looks like a link but is keyboard-untestable, or a link used where a button belongs and so triggers a page navigation nobody wanted.

Link text itself matters for testability and accessibility:

```html
<!-- Bad: ambiguous out of context -->
<a href="/docs/staging-reset">click here</a>

<!-- Good: descriptive on its own -->
<a href="/docs/staging-reset">staging reset schedule</a>
```

Screen reader users often navigate a page by pulling up a list of all links on it, read out of visual context. "Click here" repeated five times on a page tells that user nothing. Link text should describe the destination.

Two attributes worth knowing:

- `target="_blank"` opens a link in a new tab. When you use it, pair it with `rel="noopener"` — without it, the new page has partial access to the opening page's `window` object, a real security consideration.
- Links to a section of the current page use a fragment: `<a href="#roster">Jump to roster</a>`, matching a target element's `id="roster"` — the same `id` attribute you used for test selectors in Lesson 02, doing double duty for navigation.

## Media: images and video with a text fallback

```html
<img src="team-photo.jpg" alt="The QA team at the 2026 offsite, standing in front of a whiteboard" />
```

Every meaningful `<img>` needs `alt` text describing its content and purpose, not just its filename. A purely decorative image (a background flourish with no informational content) gets `alt=""` — an empty string, not a missing attribute — which tells assistive technology to skip it silently rather than announce a meaningless label. Automated accessibility scanners flag a missing `alt` attribute as an error and an empty one on a clearly meaningful image as a warning worth a human look.

Video and audio follow the same fallback principle, extended:

```html
<video controls width="640">
  <source src="demo.mp4" type="video/mp4" />
  <track kind="captions" src="demo-captions.vtt" srclang="en" label="English" />
  Your browser does not support embedded video.
</video>
```

`controls` gives keyboard-operable play/pause/volume for free. The `<track>` element supplies captions — required for anyone testing accessibility compliance, and worth checking for on any page with video content. The text between the opening and closing `<video>` tags is a fallback shown only if the browser can't play video at all.

## Tables: for tabular data, not layout

A table is for genuinely tabular data — rows and columns of related values — never for arranging unrelated page regions, which is a decades-old misuse CSS layout (Lesson 05) now handles properly.

```html
<table>
  <caption>Browser support matrix</caption>
  <thead>
    <tr>
      <th scope="col">Browser</th>
      <th scope="col">Minimum version</th>
      <th scope="col">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Chrome</th>
      <td>124</td>
      <td>Fully supported</td>
    </tr>
    <tr>
      <th scope="row">Safari</th>
      <td>17</td>
      <td>Video captions render slightly differently</td>
    </tr>
  </tbody>
</table>
```

- `<caption>` names the table for anyone, sighted or not — treat a table with no caption as missing a title.
- `<thead>`/`<tbody>` separate the header row from the data rows.
- `<th scope="col">` marks a column header; `<th scope="row">` marks a row header. The `scope` attribute is what lets a screen reader announce "Browser: Chrome, Minimum version: 124" for a given cell instead of just reading raw numbers — without it, a table is far harder to interpret non-visually, and it is exactly the kind of attribute an accessibility audit checks cell by cell.
- `<td>` holds a plain data cell.

A table missing `<th>` entirely, using `<td>` for what is clearly a header row, is a common defect: it looks identical to a sighted user (styling can make any cell bold) but loses all of its structural meaning to assistive technology and to any test that queries by header.

## Practice

Extend the `roster.html` file from Lesson 02 (or start a fresh file if you prefer) to add a new section, `<section id="team-info">`, containing:

1. A paragraph of introductory text using at least one `<strong>` and one `<code>` span correctly (for example, marking a required field name).
2. An unordered list of at least three items (for example, tools the team uses).
3. Two links: one to an external page (with correct `target="_blank" rel="noopener"` if it opens a new tab) with descriptive link text, and one internal fragment link to another `id` already on the page.
4. One `<img>` with meaningful `alt` text, and one more `<img>` that is purely decorative with `alt=""`.
5. A table with a `<caption>`, a `<thead>` row of column headers using `scope="col"`, and at least two data rows in `<tbody>` — for example, a table of team members' names and roles.

Open the page in DevTools and confirm: every link is a real `<a href>`, every image has an `alt` attribute (empty or descriptive, deliberately), and the table's headers show `scope` in the Elements panel.
