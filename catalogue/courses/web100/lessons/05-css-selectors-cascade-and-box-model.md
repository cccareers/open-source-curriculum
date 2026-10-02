---
lesson_id: web100-05
course_id: web100
pathway: quality-assurance-software-engineer
title: CSS Selectors, the Cascade, and the Box Model
order: 5
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Apply CSS selectors, the cascade, and the box model to control page layout
---

## From markup to layout

Everything so far has been about markup: what elements mean and how they are structured. CSS is the layer on top that decides how that structure renders — position, size, color, spacing. As a tester, CSS matters for two reasons: it is where most visual bugs live, and it is what makes a page's *actual* rendered size and position different from what the HTML alone would suggest. You cannot debug a misaligned button or a clipped input without understanding how CSS selects elements, resolves conflicts, and computes size.

## Selectors: choosing which elements a rule applies to

A CSS rule is a selector plus a block of declarations:

```css
p {
  color: #222;
}
```

This applies to every `<p>` on the page. Selectors get more specific from there:

```css
.warning {
  color: #b00020;
}

#submit-button {
  background-color: #1a73e8;
}

nav a {
  text-decoration: none;
}

input[type="email"] {
  border-color: #999;
}
```

- A class selector (`.warning`) matches any element with `class="warning"`. Classes are the normal way to style a reusable pattern; the same class can appear on many elements.
- An ID selector (`#submit-button`) matches the one element with that `id`. Since `id` values must be unique per page (Lesson 02), an ID selector always targets exactly one element — which is also why IDs are valuable for automated test selectors, not just for CSS.
- A descendant selector (`nav a`) matches an `<a>` anywhere inside a `<nav>`, however deeply nested.
- An attribute selector (`input[type="email"]`) matches elements by an attribute's value, useful for targeting a specific input type without adding an extra class.

## The cascade: what happens when rules conflict

"Cascading" in Cascading Style Sheets means multiple rules can apply to the same element, and CSS has a defined order for resolving conflicts. Three factors matter, roughly in this priority:

1. **Specificity** — a more specific selector wins over a less specific one, regardless of source order. Specificity is scored roughly as: inline `style` attribute beats ID selectors, which beat class/attribute selectors, which beat plain element selectors.
2. **Source order** — when specificity ties, the rule that appears later in the stylesheet (or in a later stylesheet) wins.
3. **`!important`** — a declaration marked `!important` overrides normal specificity rules entirely. It is a blunt instrument: reach for it rarely, because once one team member uses it to "win" a conflict, the next person who needs to override that rule has no clean way to do so short of another `!important`.

```css
p { color: black; }         /* specificity: 1 element */
.note { color: gray; }      /* specificity: 1 class — wins over the rule above */
#final-note { color: red; } /* specificity: 1 id — wins over both rules above */
```

```html
<p id="final-note" class="note">This text is red.</p>
```

As a tester, the cascade explains a specific class of bug: a style change made in one place that doesn't take effect because a more specific rule elsewhere still wins. "I changed the color and nothing happened" is very often a specificity problem, not a caching problem — and knowing to check the cascade, rather than immediately blaming the browser, saves real debugging time.

## The box model: what an element's size actually means

Every rendered element is a rectangular box made of four layered regions, from the inside out: **content**, **padding**, **border**, and **margin**.

![The CSS box model: content, padding, border, and margin, and how each contributes to an element's rendered size](./img/box-model.png)

- **Content** is the actual text or child elements.
- **Padding** is space inside the border, between the content and the border — it is part of the element's own background.
- **Border** is a visible (or invisible) line around the padding.
- **Margin** is space outside the border, separating this element from its neighbors — it has no background, it's pure spacing.

```css
.card {
  width: 300px;
  padding: 16px;
  border: 1px solid #ccc;
  margin: 24px;
}
```

Here is the detail that causes the most confusion, and the most bugs: by default, `width: 300px` sets the width of the **content box only**. Padding and border are added *on top* of that 300px, so this `.card`'s actual rendered width is 300 + 16 + 16 + 1 + 1 = 334px. A margin of 24px then pushes neighboring elements 24px further away, but margin is not part of the element's own size — it's spacing around it.

This default is called `box-sizing: content-box`, and it is why a design that specifies "this box is 300px wide" can render wider than 300px once padding and border are added — a classic layout bug. The fix, used almost universally in real projects, is:

```css
* {
  box-sizing: border-box;
}
```

With `border-box`, `width: 300px` means the padding and border are now included *inside* that 300px — the content area shrinks to make room, but the element's total rendered width stays exactly 300px. Most modern CSS resets apply `box-sizing: border-box` globally, for exactly this reason. When you inspect an element in DevTools and its rendered size doesn't match its declared `width`, the box model — and specifically which `box-sizing` is in effect — is the first thing to check.

## Reading the box model in DevTools

Every modern browser's DevTools has a box model diagram in its Elements/Inspector panel: select any element, and you'll see nested rectangles labeled content, padding, border, and margin, each with its computed pixel values. This is the ground truth for "how big is this thing actually rendering, and why." When you file a layout bug — "this button overlaps the field next to it" — screenshotting or noting the box model values (margin especially) turns a vague visual complaint into a specific, reproducible measurement a developer can act on immediately.

## Display: how a box behaves in the flow

Two `display` values matter most at this stage:

- `display: block` — the element takes the full available width and stacks vertically; `<div>`, `<p>`, `<section>`, and heading elements are block by default.
- `display: inline` — the element only takes as much width as its content and sits in line with surrounding text; `<span>`, `<a>`, and `<strong>` are inline by default. Margin and padding on an inline element behave inconsistently for top/bottom spacing — another common source of "why isn't my margin working" bugs.
- `display: inline-block` — a hybrid: sits in line like `inline`, but respects `width`, `height`, and vertical padding/margin like `block`.

Getting `display` wrong is a frequent cause of "this element won't respect the width/height I gave it" — if an element is still `inline`, top/bottom margin and an explicit `width` are silently ignored by the layout, which looks like a CSS bug but is really a display-type mismatch.

## Practice

Using the `roster.html` page from earlier lessons (or a fresh page with a few `<div class="card">` elements), write a stylesheet `styles.css` and link it with `<link rel="stylesheet" href="styles.css">` in the `<head>`:

1. Add a universal rule setting `box-sizing: border-box` on all elements.
2. Style each team-member `<article>` from Lesson 02 as a "card": a fixed `width`, `padding`, a visible `border`, and a `margin` separating cards from each other.
3. Add a class selector (for example `.card--lead`) that overrides the border color for one card, and add an ID selector on a different single card that overrides both border color and background color — apply both a class and an ID to the same element somewhere and predict, before checking, which color wins.
4. Open DevTools, select one of your cards, and read its box model diagram. Record the four numbers (content, padding, border, margin) and confirm the rendered total width matches what `border-box` predicts, not what plain `width` alone would suggest.
5. Change one card's `display` from block to `inline` temporarily, observe what breaks (width and vertical margin), then change it back.
