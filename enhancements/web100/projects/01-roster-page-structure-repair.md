---
course_id: web100
project_id: web100-x01
title: "Roster Page Structure Repair"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - web100-02
  - web100-03
  - web100-04
objectives:
  - Write semantic HTML that gives a page a testable, accessible structure
  - Use common page elements such as text, links, media, and tables correctly
  - Build form controls that are labelled, keyboard reachable, and straightforward to identify in a test
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
---

## Scenario

A contractor rebuilt the Team Roster page you have been working on all course. It looks right in a browser, but your test lead's automated checks keep breaking because nothing has a stable handle, and a screen reader user reported they "can't find the contact form". You are asked to repair the markup without changing how the page looks, then prove the repair with an automated structure check.

## What you will build / produce

- `roster.html`: the repaired page (starter below).
- `structure.test.js`: the provided zero-dependency check suite, passing against your file.
- `repair-log.md`: a table of every defect you fixed: line, what was wrong, which lesson rule it broke, what you changed.

## Before you start (prerequisites, starter files or data)

- Lessons 02 to 04 complete; Node 18 or newer for the automated checks.
- Starter `roster.html` (contains at least 12 deliberate defects):

```html
<html>
  <head>
    <title></title>
  </head>
  <body>
    <div class="header">
      <div class="big-title">Team Roster</div>
      <div class="nav"><a onclick="go('roster')">Roster</a> <a href="#">Contact</a></div>
    </div>
    <div class="main">
      <h3>Current Roster</h3>
      <div class="post" id="member">
        <h4>Jordan Lee</h4>
        <img src="jordan.jpg" />
        <p>QA Engineer, joined 2023.<br>Owns the staging reset checks.</p>
      </div>
      <div class="post" id="member">
        <h4>Sam Ortiz</h4>
        <img src="divider.svg" />
      </div>
      <h3>Browser support</h3>
      <table>
        <tr><td><b>Browser</b></td><td><b>Minimum version</b></td></tr>
        <tr><td>Chrome</td><td>124</td></tr>
      </table>
      <h3>Contact</h3>
      <form>
        <input type="text" placeholder="Name" />
        <input type="text" placeholder="Email" />
        <div class="btn" onclick="send()">Send</div>
      </form>
    </div>
    <div class="footer">&copy; 2026 Example Co. <a href="/privacy">click here</a></div>
  </body>
</html>
```

## Milestones

1. Read the starter in DevTools (Elements and Accessibility panes) and list every defect in `repair-log.md` *before* fixing anything. Aim for 12.
2. Fix the document shell and landmarks (lesson 02).
3. Fix headings, images, paragraphs, the table, and links (lesson 03).
4. Fix the form: labels, input types, `required`, a real submit button (lesson 04).
5. Run `PAGE=roster.html node --test structure.test.js` and fix until it passes.
6. Keyboard pass: Tab from the top; every link, field, and button gets focus in order. Record the result in the log.

## Acceptance criteria

- [ ] Doctype, `lang`, viewport meta, and a specific `<title>` are present.
- [ ] Landmarks: one `header`, one `main`, one `footer`; two `nav`s with different `aria-label`s (add a "Legal" nav for the privacy link).
- [ ] Exactly one `h1`; no skipped heading levels.
- [ ] Both member `article`s have unique `id`s (`member-jordan-lee`, `member-sam-ortiz`).
- [ ] Jordan's photo has descriptive `alt`; the divider has `alt=""`.
- [ ] The table has a `caption`, `thead`, `th scope="col"`, and `th scope="row"`.
- [ ] No `<a>` without `href`, no `href="#"` used as an action, no clickable `div`; link text is descriptive.
- [ ] Every form control has a connected `<label for>`; email uses `type="email"`; at least two fields are `required`.
- [ ] `node --test structure.test.js` passes; repair log lists at least 12 fixes with the lesson rule each broke.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `structure.test.js` next to your page and run `PAGE=roster.html node --test structure.test.js`. These are text-based smoke checks; they cannot replace the keyboard pass in milestone 6.

```javascript
// Zero-dependency structure checks. Run with: node --test structure.test.js
// Point it at your file with: PAGE=roster.html node --test structure.test.js
// These are text-based smoke checks, not a real HTML parser: they catch the
// common defects from web100 lessons 02-04 but cannot prove a page is accessible.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync(process.env.PAGE || "roster.html", "utf8");
const count = (re) => (html.match(re) || []).length;
const attrValues = (tag, attr) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*\\b${attr}="([^"]*)"`, "gi"))].map((m) => m[1]);

test("document shell: doctype, lang, viewport, non-empty title", () => {
  assert.match(html, /^\s*<!doctype html>/i);
  assert.match(html, /<html\b[^>]*\blang="[a-z]{2}(-[A-Za-z]+)?"/i);
  assert.match(html, /<meta\b[^>]*name="viewport"[^>]*width=device-width/i);
  assert.match(html, /<title>\s*\S[^<]*<\/title>/i);
});

test("exactly one <main> and exactly one <h1>", () => {
  assert.equal(count(/<main\b/gi), 1);
  assert.equal(count(/<h1\b/gi), 1);
});

test("heading levels never skip on the way down", () => {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    assert.ok(levels[i] <= levels[i - 1] + 1, `h${levels[i - 1]} is followed by h${levels[i]}`);
  }
});

test("every <nav> has an accessible name when there is more than one", () => {
  const navs = [...html.matchAll(/<nav\b([^>]*)>/gi)].map((m) => m[1]);
  if (navs.length > 1) {
    for (const attrs of navs) assert.match(attrs, /aria-label(ledby)?="[^"]+"/);
    const names = navs.map((a) => (a.match(/aria-label="([^"]+)"/) || [])[1]);
    assert.equal(new Set(names).size, names.length, "nav labels must be different");
  }
});

test("ids are unique", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, []);
});

test("every <img> has an alt attribute (empty is allowed for decoration)", () => {
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgs) assert.match(img, /\balt="/, `missing alt: ${img}`);
});

test("every visible input, select and textarea has a matching <label for>", () => {
  const labelFors = new Set(attrValues("label", "for"));
  const controls = html.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
  for (const c of controls) {
    if (/type="(hidden|submit|button)"/i.test(c)) continue;
    const id = (c.match(/\bid="([^"]+)"/) || [])[1];
    const hasAria = /aria-label(ledby)?="[^"]+"/.test(c);
    assert.ok(hasAria || (id && labelFors.has(id)), `no connected label: ${c}`);
  }
});

test("links are real links and buttons are real buttons", () => {
  assert.equal(count(/<a\b(?![^>]*\bhref=)[^>]*>/gi), 0, "<a> without href");
  assert.equal(count(/href="(#|javascript:[^"]*)"/gi), 0, 'href="#" or javascript: used as a button');
  assert.equal(count(/<div\b[^>]*onclick=/gi), 0, "clickable <div>");
});
```

Optional (requires `npm install -D @playwright/test @axe-core/playwright` and `npx playwright install chromium`; not verified in this pass): a browser-level check of the accessibility tree.

```javascript
// roster.spec.js — run with: npx playwright test
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const path = require("node:path");

test("roster page structure", async ({ page }) => {
  await page.goto("file://" + path.resolve("roster.html"));
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Legal" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveAttribute("type", "email");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Semantic structure | Some divs replaced; landmarks or headings still wrong | All landmarks and heading outline correct | Explains in the log why each landmark choice matters for a test |
| Content elements | Some images, links, or table cells still misused | All `alt`, link, list, and table rules met | Adds a `<caption>` and row headers that read well aloud |
| Forms | Labels missing or not connected | All controls labelled, typed, and keyboard reachable | Adds a `fieldset`/`legend` group and explains its purpose |
| Evidence | Fewer than 8 fixes logged | 12+ fixes logged with lesson rule; tests pass | Finds a defect the tests do not catch and explains why |

## Stretch goals

- Run Lighthouse's Accessibility audit before and after; include both scores and the remaining manual-only findings.
- Add a skip link (`<a href="#main-content">Skip to main content</a>`) and confirm it is the first Tab stop.

## Reflection prompts

- Which defect would have hurt an automated test the most? Which would have hurt a keyboard user the most? Were they the same?
- Which of your fixes does the text-based test suite *not* catch?

## Instructor notes (common pitfalls, how to adapt for time)

- Planted defects: no doctype; no `lang`; no viewport; empty title; div landmarks; `h3` as top heading and no `h1`; duplicate `id="member"`; missing `alt` (x2); `<br>` paragraph; table without `th`/caption; `<a>` without `href`; `href="#"`; "click here"; placeholder-only inputs; email as `type="text"`; div button.
- Learners often wrap the privacy link in a second nav but forget a distinct label, or give `alt="image"`.
- The regex suite does not parse HTML; a learner who writes valid but unusual markup (single-quoted attributes) may get false failures. Tell them to use double quotes or adapt the test.
- Short on time: skip the table and footer nav and the matching criteria.
