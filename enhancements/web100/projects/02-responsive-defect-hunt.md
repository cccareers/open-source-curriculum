---
course_id: web100
project_id: web100-x02
title: "Responsive Defect Hunt and Report Pack"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - web100-05
  - web100-06
objectives:
  - Apply CSS selectors, the cascade, and the box model to control page layout
  - Build a responsive layout and check it against basic accessibility expectations
  - Inspect a rendered page and describe what is wrong with it in reproducible terms
competency_ids:
  - D5-S1-C02
  - D2-S1-C02
  - D5-S1-C01
---

## Scenario

Your team is about to ship the signup page from lesson 06's defect-report example. A developer hands you a stylesheet with planted layout bugs and asks for two things: a fixed, mobile-first stylesheet, and a pack of defect reports good enough that someone who never saw the page could reproduce each bug.

## What you will build / produce

- `signup.html` and `styles.css` (starter below), with a fixed `styles-fixed.css`.
- `defects.md`: at least four defect reports in the lesson 06 format (title, steps with an exact viewport width, expected, actual, likely cause).
- `layout.test.js`: the provided automated check, passing against your fixed stylesheet.

## Before you start (prerequisites, starter files or data)

Starter `signup.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sign up | Team Roster</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main>
      <h1>Create your account</h1>
      <form class="signup-form" action="/signup" method="post">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" required />
        <button type="submit" id="submit-button" class="primary">Create account</button>
      </form>
      <div class="card-row">
        <article class="card"><h2>Fast</h2><p>Set up in a minute.</p></article>
        <article class="card"><h2>Private</h2><p>Your data stays yours.</p></article>
        <article class="card"><h2>Free</h2><p>No credit card needed.</p></article>
      </div>
    </main>
  </body>
</html>
```

Starter `styles.css`:

```css
.signup-form { display: flex; flex-direction: row; }
.card-row { display: flex; }
.card { width: 300px; padding: 16px; border: 1px solid #ccc; height: 120px; }
#submit-button { background: #1a73e8; color: #ffffff; }
.primary { background: #9ccc65; }
p { color: #bbbbbb; }
@media (min-width: 768px) { .signup-form { flex-direction: row; } }
```

## Milestones

1. Predict, in writing, what each rule does at 375px and 1280px before opening the page.
2. Drag the viewport from 1280px to 320px in DevTools responsive mode. Log every problem with the exact width range where it appears.
3. Inspect each card's box model; record content, padding, border, margin, and the rendered width. Explain the difference from the declared `width`.
4. Explain, using specificity, why `.primary` never turns the button green. Decide with your "developer" whether it should.
5. Write `styles-fixed.css`: `box-sizing: border-box`, mobile-first column defaults, a breakpoint that switches to rows, wrapping cards, no fixed heights that clip enlarged text, contrast of at least 4.5:1 for body text.
6. Write at least four defect reports. Run the automated check.

## Acceptance criteria

- [ ] The missing viewport meta tag is reported as its own defect and fixed in `signup.html`.
- [ ] Every defect report names an exact width or width range and a reproducible starting state.
- [ ] `styles-fixed.css` contains a universal `box-sizing: border-box` rule.
- [ ] The base (no media query) `.signup-form` and `.card-row` layouts are single-column; a `min-width` media query switches them to rows.
- [ ] No `.card` rule sets a fixed `height`.
- [ ] Body text color has at least 4.5:1 contrast against white (checked in the DevTools color picker or by the test).
- [ ] `node --test layout.test.js` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `layout.test.js` and run `CSS=styles-fixed.css node --test layout.test.js`. It checks the stylesheet text and computes the contrast ratio with the WCAG formula; it does not render the page, so the DevTools steps above are still required.

```javascript
// Zero-dependency checks. Run with: CSS=styles-fixed.css node --test layout.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const css = fs.readFileSync(process.env.CSS || "styles-fixed.css", "utf8");
const html = fs.readFileSync(process.env.PAGE || "signup.html", "utf8");
const stripMedia = (text) => text.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
const baseCss = stripMedia(css);
const ruleBody = (text, selector) => {
  const esc = selector.replace(/[.#]/g, (c) => "\\" + c);
  const m = text.match(new RegExp(`(^|[},\\s])${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[2] : "";
};

function luminance(hex) {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("page has a viewport meta tag", () => {
  assert.match(html, /<meta\b[^>]*name="viewport"[^>]*width=device-width/i);
});

test("border-box sizing is applied to everything", () => {
  assert.match(css, /\*\s*(,[^{]*)?\{[^}]*box-sizing:\s*border-box/);
});

test("mobile-first: base layout is a single column", () => {
  for (const sel of [".signup-form", ".card-row"]) {
    const body = ruleBody(baseCss, sel);
    const isColumn = /flex-direction:\s*column/.test(body) || !/display:\s*(flex|grid)/.test(body) ||
      /grid-template-columns:\s*1fr\s*;/.test(body);
    assert.ok(isColumn, `${sel} should be single-column outside media queries`);
  }
});

test("a min-width media query switches to a wider layout", () => {
  assert.match(css, /@media[^{]*min-width:\s*\d+px[^{]*\{[\s\S]*(flex-direction:\s*row|grid-template-columns)/);
});

test("cards do not use a fixed height", () => {
  assert.doesNotMatch(ruleBody(baseCss, ".card"), /(^|[^-])height:\s*\d/);
});

test("paragraph text has at least 4.5:1 contrast against white", () => {
  const color = (ruleBody(baseCss, "p").match(/color:\s*(#[0-9a-fA-F]{3,6})/) || [])[1];
  assert.ok(color, "set an explicit hex color on p");
  assert.ok(contrast(color, "#ffffff") >= 4.5, `${color} on white is ${contrast(color, "#ffffff").toFixed(2)}:1`);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Cascade and box model | Fixes by trial and error | Explains specificity and box-sizing outcomes with numbers from DevTools | Predicts outcomes correctly before inspecting |
| Responsive layout | Works at preset widths only | Mobile-first, no overflow from 320px to 1280px | Also holds at 200% text zoom with no clipping |
| Defect reports | Vague ("broken on mobile") | Exact widths, steps, expected vs actual, likely cause | Each report also states impact on users and a suggested check to prevent regression |
| Automated check | Failing | Passing | Learner adds a test for a defect they found |

## Stretch goals

- Rebuild `.card-row` with `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` and compare behavior to your Flexbox version.
- Add a visible `:focus-visible` outline to the button and inputs and include it in a report.

## Reflection prompts

- Which bug was invisible at the device presets but obvious while dragging?
- Which of your reports would a developer be able to fix without asking you a question? Which not, and why?

## Instructor notes (common pitfalls, how to adapt for time)

- Planted defects: missing viewport tag; row-only form with a redundant media query; non-wrapping cards that overflow below about 1000px; content-box cards rendering 334px wide; fixed card height that clips at larger text; `.primary` losing to `#submit-button`; `#bbbbbb` body text (about 1.9:1 on white).
- The `.primary` specificity issue is a "decide, don't just fix" item: either change the selector or delete the dead rule; both are acceptable if explained.
- The test's CSS matching is regex-based; it expects one rule per selector in the base stylesheet.
- Short on time: require two defect reports instead of four.
