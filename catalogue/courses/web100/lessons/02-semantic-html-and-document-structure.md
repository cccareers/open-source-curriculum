---
lesson_id: web100-02
course_id: web100
pathway: quality-assurance-software-engineer
title: Semantic HTML and Document Structure
order: 2
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
objectives:
  - Write semantic HTML that gives a page a testable, accessible structure
---

## Why structure matters to a tester, not just a builder

When you test a web page, you rarely get to work from the developer's mental model of it. You get the rendered result and, if you go looking, the markup underneath. If that markup is a flat pile of `<div>` and `<span>` tags with no meaning attached, every test you write has to guess at intent: "the third div inside the second div is probably the login button." That guess breaks the moment a developer reorders the page.

Semantic HTML is HTML where the tag names describe what the content *is*, not just how it should look. A `<button>` is a button. A `<nav>` is navigation. A `<h2>` is a second-level heading. Screen readers, browser accessibility trees, and automated test frameworks all read these tags to build a map of the page — the same map a sighted user builds by looking at layout and color. Non-semantic markup erases that map. Semantic markup is what makes a page inspectable: you can query it by role and label instead of by fragile position.

This lesson is about writing that structure correctly, from the outermost document down to individual sectioning elements. Everything you build here becomes the skeleton every later lesson — forms, styling, responsive layout — hangs off of.

## The anatomy of an HTML document

Every HTML document starts with the same shell:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Team Roster</title>
  </head>
  <body>
    <!-- visible content goes here -->
  </body>
</html>
```

A few details matter more than they look like they should:

- `<!doctype html>` tells the browser to render in standards mode. Without it, some browsers fall back to "quirks mode," where CSS box sizing and other rules behave differently. As a tester, a missing doctype is worth flagging — it can make a page render inconsistently across browsers in ways that are hard to reproduce later.
- `lang="en"` on `<html>` tells assistive technology (and translation tools) what language the content is in. A missing or wrong `lang` attribute is a real accessibility defect, and it is one of the first things an automated accessibility scanner checks.
- The viewport `<meta>` tag is what makes a page respond to screen width at all; you will lean on it heavily in Lesson 06.
- `<title>` is what shows in the browser tab and what a screen reader announces first when a page loads. An empty or generic title (like every page on a site being titled "Home") is a usability defect worth reporting.

## Sectioning elements: giving the page a skeleton

HTML5 added a set of elements whose whole job is to describe the large-scale regions of a page:

```html
<body>
  <header>
    <h1>Team Roster</h1>
    <nav aria-label="Primary">
      <a href="#roster">Roster</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <section id="roster" aria-labelledby="roster-heading">
      <h2 id="roster-heading">Current Roster</h2>
      <article>
        <h3>Jordan Lee</h3>
        <p>QA Engineer, joined 2023.</p>
      </article>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Example Co.</p>
  </footer>
</body>
```

Most of these tags map to a **landmark**, a named region exposed directly in the browser's accessibility tree: `header` (banner), `nav` (navigation), `main` (main), `aside` (complementary), and `footer` (contentinfo). There are three details worth knowing precisely. A `<section>` only becomes a landmark (a "region") when it has an accessible name, which is one reason the example gives it `aria-labelledby`. An `<article>` is a meaningful grouping but not a landmark. And `<header>`/`<footer>` only count as the page's banner/contentinfo when they are not nested inside an `<article>`, `<section>`, or `<main>`. Landmarks being in the accessibility tree means:

- A screen reader user can jump straight to `main` and skip repeated navigation on every page.
- Browser DevTools and automated accessibility audits (Lighthouse, axe) both check whether a page has exactly one `main`, whether headings are present and in a sane order, and whether landmarks are labelled when there is more than one of the same kind — the `aria-label="Primary"` on `<nav>` above exists because a page can have more than one `nav` (primary, footer, breadcrumb), and each one needs a way to be told apart.
- A `role="..."` attribute exists to add landmark meaning to an element that cannot otherwise carry it (rare, and a last resort) — but a real `<nav>` or `<main>` is always preferable to a `<div role="navigation">`, because the browser already understands the real tag without help.

A page built entirely from `<div>`s can *look* identical to a page built this way. That is exactly the trap: two pages can be visually indistinguishable and structurally opposite. One is testable by landmark and role; the other is testable only by counting divs, which is exactly the kind of test that breaks on the next redesign.

## Headings describe a document outline, not font sizes

It is common to see `<h3>` used somewhere because "it's the right size" rather than because it is the right level in the outline. Resist that. Headings (`h1`–`h6`) are supposed to nest like an outline:

```html
<h1>Team Roster</h1>
  <h2>Current Roster</h2>
    <h3>Jordan Lee</h3>
  <h2>Contact</h2>
```

A page should have exactly one `<h1>` describing what the page is, and every other heading should describe a subsection of the level above it, without skipping a level. Skipping from `<h1>` straight to `<h3>` is a defect an accessibility audit will flag, because a screen reader user navigating by heading level will wonder what happened to the missing `<h2>`. If you need something to look smaller, that is a job for CSS, covered starting in Lesson 05 — never for the wrong heading tag.

## Choosing the right element for the job

A recurring theme in semantic HTML is: prefer the element whose built-in behavior matches your intent, instead of a generic element plus extra styling and JavaScript to fake it.

| Intent | Wrong | Right |
| --- | --- | --- |
| Clickable action | `<div onclick="...">` | `<button>` |
| List of items | Sequence of `<p>` tags | `<ul>`/`<ol>` with `<li>` |
| Emphasis | `<span style="font-weight:bold">` | `<strong>` |
| Self-contained content | `<div class="post">` | `<article>` |

A real `<button>` is keyboard-focusable, activates on both click and Enter/Space, and is announced as "button" by a screen reader — all for free, with no JavaScript required. A `<div>` styled to look like a button gets none of that unless you painstakingly rebuild it with `tabindex`, keydown handlers, and an ARIA role. As a QA engineer, a fake button built from a `<div>` is a specific, reportable class of bug: it usually fails keyboard-only navigation testing even when it looks fine and works fine with a mouse.

## Attributes that carry meaning beyond the visible text

A few attributes matter regardless of which element they sit on:

- `id` gives an element a unique, stable handle in the page. It is the single most useful thing for an automated test to select on — `document.getElementById('roster')` or a test framework's `#roster` selector doesn't care about surrounding markup changes the way a positional selector does. IDs must be unique per page; a duplicate `id` is a real defect, not a style nit, because it makes `id`-based lookups ambiguous.
- `alt` on `<img>` describes the image for anyone who cannot see it, and it is what an automated accessibility check looks for first. An empty `alt=""` is correct and intentional for a purely decorative image; a missing `alt` attribute entirely is an error.
- `aria-label` and `aria-labelledby` provide an accessible name when visible text alone doesn't do it — for example, an icon-only button, or disambiguating two `<nav>` elements as shown above.

None of these are decorations. Each one is something a test, a screen reader, or an accessibility auditor will actually read.

## Reading a page's structure like a tester

Open any real page's DevTools, go to the Elements panel, and look for exactly the things this lesson covered: is there one `main`? One `h1`? Do headings nest without skipping levels? Are interactive things real `<button>`/`<a>` elements, or `<div>`s pretending? Are `id`s unique? This is the habit you are building — reading structure critically is a skill you'll use in every lesson that follows, and directly in Lesson 06's accessibility pass.

## Practice

Using a plain text editor, build a single HTML file, `roster.html`, for a small team page:

1. Include the full document shell: `<!doctype html>`, `<html lang="en">`, a `<head>` with `<meta charset>`, the viewport meta tag, and a `<title>`.
2. Add a `<header>` containing an `<h1>` and a `<nav>` with at least two links, labelled with `aria-label` since the page will also have a footer nav.
3. Add a `<main>` containing one `<section>` with a heading and at least two `<article>` elements, each representing one team member, each with its own heading one level below the section heading.
4. Add a `<footer>` with a second, differently-labelled `<nav>` (for example, "Legal") and a copyright line.
5. Give each `<article>` a unique `id` (for example `id="member-jordan-lee"`).
6. Open the file in a browser, then open DevTools and confirm in the Elements/Accessibility panel that your landmarks (`header`, `nav` ×2, `main`, `footer`) and heading outline appear correctly and that both `nav` elements are distinguishable by their accessible names.

## Check your understanding

1. Two pages look identical. One uses `<header>`, `<nav>`, and `<main>`; the other uses only `<div>`s. Name one test you can write against the first that you cannot write reliably against the second.
2. A page goes from `<h1>` straight to `<h3>` because the `<h3>` "is the right size". What do you report, and what is the fix?
3. When does a `<section>` show up as a landmark in the accessibility tree?

*Answers:* (1) For example, "the page has exactly one `main`" or "jump to the navigation named Primary"; the `div` version can only be found by position. (2) A skipped heading level; use `<h2>` and change the size with CSS. (3) Only when it has an accessible name, for example through `aria-labelledby` pointing at its heading.
