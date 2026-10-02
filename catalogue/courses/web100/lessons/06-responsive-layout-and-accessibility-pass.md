---
lesson_id: web100-06
course_id: web100
pathway: quality-assurance-software-engineer
title: Responsive Layout and an Accessibility Pass
order: 6
kind: lesson
competency_ids:
  - D2-S1-C02
  - D5-S1-C01
objectives:
  - Build a responsive layout and check it against basic accessibility expectations
  - Inspect a rendered page and describe what is wrong with it in reproducible terms
---

## Where this lesson sits

Every earlier lesson built one piece: structure, content elements, forms, and now the box model. This lesson does two things with all of it. First, it makes a layout responsive — one that holds up correctly at different screen widths, using the box model and selectors from Lesson 05. Second, and just as important for this pathway, it teaches you to look at a finished, rendered page the way a QA engineer does: critically, systematically, and in a way that produces a defect report someone else can act on without having to reproduce your reasoning from scratch. You cannot judge a broken responsive breakpoint, or file a usability defect that holds up, without the structure and box-model knowledge from the lessons before this one — which is why this lesson comes last.

## Building layout with Flexbox

Flexbox arranges a row (or column) of elements and distributes space between them without manual pixel math:

```css
.card-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  flex: 1 1 250px;
}
```

- `display: flex` on a container turns its direct children into flex items, laid out in a row by default.
- `gap` puts consistent spacing between items without needing margin tricks on each one individually.
- `flex-wrap: wrap` lets items drop to a new line when they no longer fit, instead of shrinking indefinitely or overflowing.
- `flex: 1 1 250px` on each card means: grow to fill available space, shrink if needed, but use 250px as the reference starting size. Combined with `flex-wrap`, this is what makes a row of cards reflow into fewer columns as the screen narrows.

## Building layout with Grid

Grid is suited to two-dimensional layout — rows and columns together:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

`repeat(auto-fit, minmax(200px, 1fr))` tells the browser: fit as many columns as will comfortably hold at least 200px each, and let each column grow evenly to fill remaining space. This single line is a responsive grid with no media query at all — the column count adjusts automatically as the container's width changes.

Flexbox and Grid solve overlapping problems; a reasonable rule of thumb is Flexbox for a single row or column of items, Grid when you're arranging in both directions at once. Both are the modern replacement for the table-based and float-based layout hacks of earlier eras — never reach for an HTML `<table>` to lay out unrelated page regions (Lesson 03).

## Media queries: rules that apply only at certain widths

```css
.card-row {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .card-row {
    flex-direction: row;
  }
}
```

This says: stack cards in a single column by default (a reasonable default for narrow, mobile-width screens), and switch to a row once the viewport is at least 768px wide. `min-width` media queries, read from narrowest to widest, are the standard "mobile-first" pattern — you write the small-screen layout as the base case and layer on wider-screen overrides, rather than the reverse.

Recall the viewport `<meta>` tag from Lesson 02:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Without it, a mobile browser renders the page at a fixed desktop-width virtual viewport (typically 980px) and then zooms it to fit the screen — every media query still fires based on that fake 980px width, not the phone's actual width, so your responsive rules simply never trigger correctly. A missing or misconfigured viewport tag is one of the most common root causes of "it looks broken only on mobile" bug reports, and it is invisible unless you specifically go check the `<head>`.

## Testing responsiveness like a tester, not a builder

Building a responsive layout and testing one are different mindsets. To build it, you pick breakpoints and write CSS. To test it, you actively look for the width where it breaks:

1. Open DevTools' device toolbar (responsive design mode) and drag the viewport width slowly from wide to narrow, watching continuously rather than only checking a couple of fixed device presets.
2. Note the exact pixel width where something goes wrong: text overlapping, a card overflowing its container, a button becoming unreachable, horizontal scroll appearing where it shouldn't.
3. Check standard breakpoints (roughly 375px for a small phone, 768px for a tablet, 1024–1280px for a small laptop) but do not stop there — real bugs often live in the gaps between them, not exactly at them.
4. Check text scaling too: browsers let a user increase the base font size, and a rigid layout with fixed-height boxes can clip enlarged text — a real accessibility failure that a plain visual check at default zoom will never catch.

## A basic accessibility pass

You have been building accessibility habits since Lesson 02 without a formal checklist. Here is one, worth running against any page before calling it done:

- **Keyboard**: Tab through the entire page. Every interactive element gets a visible focus outline, in a sensible order, and every action reachable with Enter/Space (Lesson 04).
- **Headings**: exactly one `<h1>`, and no heading level skipped (Lesson 02).
- **Landmarks**: one `<main>`, labelled `<nav>` elements if there is more than one (Lesson 02).
- **Images**: every meaningful `<img>` has descriptive `alt`; purely decorative images have `alt=""` (Lesson 03).
- **Forms**: every input has a connected `<label>`; grouped controls have a `<fieldset>`/`<legend>` (Lesson 04).
- **Color contrast**: text should be readable against its background. Browser DevTools' color picker shows a contrast ratio directly when you inspect a text color; a common minimum target is 4.5:1 for normal body text.
- **Zoom/reflow**: the page should remain usable, with no horizontal scrolling or clipped content, at 200% browser zoom.
- **Automated scan**: run an automated tool (Lighthouse's Accessibility audit, built into Chrome DevTools, or a browser extension like axe) as a fast first pass — it catches missing `alt`, missing labels, and contrast failures quickly, but it does not replace the manual keyboard and screen-reader checks above, since it cannot judge whether link text is actually descriptive or whether tab order is logical.

## Turning what you found into a defect report

Finding a problem is only half the job. A QA engineer's real output is a description another person can act on without redoing your investigation. A vague report costs the developer time reproducing the bug before they can even start fixing it; a good one hands them everything they need on the first read.

Compare these two:

> "The signup form looks weird on mobile."

versus:

> **Title**: Signup form email field overlaps submit button below 400px width
> **Steps to reproduce**: Open `/signup` in Chrome DevTools responsive mode. Set viewport width to 375px (iPhone SE preset).
> **Expected**: Email field and submit button stack vertically with visible spacing between them.
> **Actual**: At widths between roughly 340px and 400px, the submit button overlaps the bottom ~8px of the email input, partially covering it.
> **Additional notes**: The `.signup-form` container uses `flex-direction: row` with no narrower-width override; the `@media (min-width: 768px)` rule switching to row layout is missing a corresponding mobile-first column default. Also observed: the email field has no connected `<label>`, only a `placeholder`, so this is unrelated but worth a second ticket.

The second version is reproducible by anyone, gives an exact width range rather than "on mobile" in general, states expected versus actual behavior explicitly, and even points toward a likely cause without requiring the reader to trust your intuition. This is the standard to aim for on every defect you file from here forward, in this course and beyond it: precise steps, a specific width or state, and a clear statement of expected versus actual — reproducible in the literal sense that a stranger could follow your steps and see exactly what you saw.

## Practice

Take the `roster.html` page (with its card layout and contact form) you have built across this course and do the following:

1. Convert the team-member card row into a responsive layout using either Flexbox or Grid, with at least one `@media` breakpoint so cards stack in a single column below roughly 600px and lay out in multiple columns above it.
2. Slowly resize the browser (or use DevTools' responsive mode) from 320px up to 1280px, watching continuously, and find at least one real width-dependent problem — even a small one, like uneven card heights, a heading wrapping awkwardly, or the contact form's fieldset overflowing its container.
3. Run through the accessibility pass checklist above against the full page and note every item that fails, however minor — an unlabeled decorative image, a skipped heading level, low-contrast text, anything.
4. Write up your single best finding (from either step 2 or step 3) as a full defect report in the format shown above: title, steps to reproduce with a specific viewport width or state, expected behavior, actual behavior, and, if you can identify one, the likely CSS or markup cause.
