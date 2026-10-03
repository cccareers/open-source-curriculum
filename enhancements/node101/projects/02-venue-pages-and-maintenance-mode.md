---
course_id: node101
project_id: node101-x02
title: "Venue Pages and a Maintenance-Mode Switch"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - node101-05
  - node101-06
objectives:
  - Serve static assets and rendered views to a browser
  - Compose middleware to handle cross-cutting request concerns
competency_ids:
  - D5-S1-C04
  - D2-S1-C04
  - D5-S1-C02
---

## Scenario
The community center that runs the events board hosts events at a handful of venues: Rosa Parks Park, the Maker Space, Fellowship Hall, Marsh Lane Library. Volunteers keep asking "what's on at the Maker Space?", and right now the only answer is to scroll the whole list. The coordinator wants a page per venue that they can print on a flyer as a short URL.

The same coordinator has a second request. When you deploy, they want to flip a switch that puts the whole site into "down for maintenance" mode, so visitors see a polite page instead of a half-working one. The host's health check must keep passing the whole time, or the host will restart the process in the middle of your maintenance.

## What you will build / produce
- `GET /venues`: a rendered, accessible page listing every distinct venue once, each linking to its own page.
- `GET /venues/:slug`: a rendered page listing only that venue's events, inside the shared shell from lesson 06 (head, nav, footer partials, skip link, `<main id="main">`). An unknown slug renders your not-found page with status `404`.
- A **slug** for each venue: the URL-safe, lowercase, hyphenated form of its name (`"Maker Space"` → `maker-space`). Slugs are computed from the name, not stored.
- A `maintenanceGate({ enabled })` middleware factory. When enabled, it answers every request with `503 Service Unavailable` and a `Retry-After: 600` header. `/healthz` is exempt, and must be exempt because of where it sits in the stack, not because of an `if` inside the gate.
- An updated `PIPELINE.md` (from lesson 05) with the new stage in it.
- A passing automated test suite.

`503` means "the server is fine but is not serving right now; try again later." `Retry-After` tells the client how many seconds "later" means.

## Before you start (prerequisites, starter files or data)
- Your events board at the end of lesson 06: EJS views with partials, `express.static` mounted with an absolute path, and a request-id middleware from lesson 05.
- Events in the lesson 06/07 shape with `location` and `startsAt`. At least two events should share a venue, and one event title should contain `<script>alert(1)</script>` so you can prove escaping works.
- The `createApp({ events })` / `server.js` split described in the setup section of project node101-x01. Add one more option: `createApp({ events, maintenance })`. In `server.js`, pass `maintenance: process.env.MAINTENANCE === "1"`, so the switch is configuration, not code (lesson 03, "Choosing a port from the environment").
- `npm install --save-dev supertest` and a `"test": "node --test"` script.

## Milestones
1. **Design the stack on paper first.** Add rows to `PIPELINE.md` for `/healthz`, `maintenanceGate`, `express.static`, and the venue routes, in the order you plan to register them. Write the precondition each relies on. Get it read by a peer or mentor before coding (lesson 05, "The pipeline as a design artifact").
2. **Slugs.** Write a small `slugify(name)` helper: lowercase it, replace each run of non-alphanumeric characters with `-`, and trim leading and trailing hyphens. No package; this is four lines of standard library (lesson 02, criterion 4).
3. **Venue index.** Build `views/venues.ejs` and the `GET /venues` route. Deduplicate venues with a `Set`.
4. **Venue detail.** Build `views/venue.ejs` and `GET /venues/:slug`. Use semantic markup from lesson 06: one `h1` naming the venue, an `h2` per event, and `<time datetime="...">`. Unknown slug → `res.status(404).render("not-found", ...)`.
5. **Escaping check.** Confirm the hostile title renders as visible text. View the page source and find `&lt;script&gt;`.
6. **Maintenance gate.** Write the middleware factory in `src/middleware/maintenance.js`. Register `/healthz` **above** the gate and everything else below it. Then decide where `express.static` goes relative to the gate and record the decision in `PIPELINE.md`. The reference tests expect static assets to be gated too.
7. **Request ids everywhere.** Confirm `requestId` is the first middleware, so even static files and `503` responses carry `x-request-id`.
8. **Run the tests** and make them pass.
9. **Audit.** Keyboard pass, 320-pixel pass, and dev-tools accessibility audit on `/venues/maker-space`, as in lesson 06 practice step 8. Add results to `ACCESSIBILITY.md`.
10. **Try the switch for real.** `MAINTENANCE=1 npm start`, then `curl -i` a page, a static file, and `/healthz`. Paste the three status lines into `NOTES.md`.

## Acceptance criteria
- [ ] `/venues` lists each venue exactly once, with a link to `/venues/<slug>`.
- [ ] `/venues/:slug` shows only that venue's events, inside the shared partials, with valid heading order.
- [ ] An unknown slug returns a rendered page with status `404`, not `200`.
- [ ] A title containing markup is displayed as text, never executed.
- [ ] `/styles.css` is served from `public/` with a `text/css` content type, using an absolute path built from `import.meta.url`.
- [ ] With maintenance on, every route except `/healthz` returns `503` with `Retry-After`. `/healthz` returns `200` JSON.
- [ ] The gate contains no path check for `/healthz`. The exemption comes from registration order.
- [ ] Every response, including static files and `503`s, carries an `x-request-id` header. An incoming `X-Request-Id` is echoed back unchanged.
- [ ] `PIPELINE.md` matches the actual registration order.
- [ ] `npm test` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `test/venues.test.js`. It was verified passing against Express 5.2.1 and Express 4 with EJS. The assertions assume `<h1>Maker Space</h1>`, a viewport meta tag, `<main id="main">`, and `<time datetime="...">` in your markup, all of which lesson 06 asks for. If your markup differs, for example with attributes on the `h1`, adjust the regexes, not the behavior.

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

const fixture = () => [
  { id: "e-101", title: "Neighborhood Cleanup", location: "Rosa Parks Park", startsAt: "2026-08-02T14:00:00.000Z" },
  { id: "e-102", title: "Intro to Soldering", location: "Maker Space", startsAt: "2026-08-09T17:00:00.000Z" },
  { id: "e-103", title: "Repair Cafe <script>alert(1)</script>", location: "Maker Space", startsAt: "2026-08-15T10:00:00.000Z" },
];

test("the stylesheet is served from public/ as CSS", async () => {
  const res = await request(createApp({ events: fixture() })).get("/styles.css");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /text\/css/);
});

test("the venues index renders HTML with one link per distinct venue", async () => {
  const res = await request(createApp({ events: fixture() })).get("/venues");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /text\/html/);
  assert.match(res.text, /href="\/venues\/maker-space"/);
  assert.match(res.text, /href="\/venues\/rosa-parks-park"/);
  assert.equal(res.text.match(/href="\/venues\/maker-space"/g).length, 1, "each venue listed once");
});

test("a venue page lists only that venue's events, inside a shared shell", async () => {
  const res = await request(createApp({ events: fixture() })).get("/venues/maker-space");
  assert.equal(res.status, 200);
  assert.match(res.text, /<h1>Maker Space<\/h1>/);
  assert.match(res.text, /Intro to Soldering/);
  assert.doesNotMatch(res.text, /Neighborhood Cleanup/);
  assert.match(res.text, /name="viewport"/, "head partial included");
  assert.match(res.text, /<main id="main">/, "skip-link target present");
  assert.match(res.text, /<time datetime="2026-08-09T17:00:00.000Z">/);
});

test("user-supplied text is escaped, never rendered as markup", async () => {
  const res = await request(createApp({ events: fixture() })).get("/venues/maker-space");
  assert.doesNotMatch(res.text, /<script>alert\(1\)<\/script>/);
  assert.match(res.text, /&lt;script&gt;/);
});

test("an unknown venue is a rendered 404 page, not a 200", async () => {
  const res = await request(createApp({ events: fixture() })).get("/venues/the-moon");
  assert.equal(res.status, 404);
  assert.match(res.headers["content-type"], /text\/html/);
});

test("every response carries a request id, and an incoming one is honoured", async () => {
  const app = createApp({ events: fixture() });
  const fresh = await request(app).get("/venues");
  assert.ok(fresh.headers["x-request-id"]);
  const echoed = await request(app).get("/styles.css").set("X-Request-Id", "abc-123");
  assert.equal(echoed.headers["x-request-id"], "abc-123", "static responses are tagged too");
});

test("maintenance mode answers 503 with Retry-After everywhere except /healthz", async () => {
  const app = createApp({ events: fixture(), maintenance: true });
  const page = await request(app).get("/venues");
  assert.equal(page.status, 503);
  assert.ok(page.headers["retry-after"]);
  const health = await request(app).get("/healthz");
  assert.equal(health.status, 200);
  assert.equal(health.body.status, "ok");
});
```

Run it from the project root:

```bash
npm test
# equivalent:
node --test
```

Expect `ℹ pass 7` and `ℹ fail 0`. Because `public/` and `views/` are found through absolute paths built from `import.meta.url`, the tests pass no matter which directory you run them from. If they fail only when run from a different folder, your paths are relative to the working directory (lesson 06, "Serving a public directory").

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Rendered views | Pages render but repeat the shell or skip heading levels | Shared partials, one `h1`, semantic list and `time` markup, correct `404` status | Venue page also links back to `/venues` and shows an empty-state message for a venue with only past events |
| Static assets | CSS loads only when run from the project root | Absolute path, correct content type, no shadowed routes | Mounted with a deliberate `maxAge` choice, justified in `PIPELINE.md` (lesson 06 caching rules) |
| Escaping | Hostile title executes or is double-escaped | Rendered as text with `<%= %>` | Learner explains in `NOTES.md` why `<%-` is still correct for `include` |
| Middleware composition | Gate exempts `/healthz` with an `if` | Exemption comes from order; gate is a configurable factory | `PIPELINE.md` states each stage's precondition and postcondition, and a peer reviewed it before coding |
| Configuration | Maintenance is toggled by editing code | Toggled by `MAINTENANCE=1` in the environment | Startup log line states whether maintenance is on |
| Tests | Suite runs with failures | All 7 pass | Learner adds a test that static assets are (or are not) gated, matching their documented decision |

## Stretch goals
- Serve a styled maintenance page from `views/maintenance.ejs` instead of an HTML string. Make sure it cannot fail (no data lookups, lesson 08 "keep the `error` view trivial"). Then decide whether its stylesheet should bypass the gate.
- Add a `Cache-Control: public, max-age=60` header to the venue pages and explain in one sentence why that is safe for this data and how long a stale page could last.
- Add a `<link rel="canonical">` to venue pages so `/venues/Maker-Space` (case-insensitive routing) and `/venues/maker-space` are not indexed twice.

## Reflection prompts
- Why must `/healthz` be registered above the maintenance gate rather than special-cased inside it? What breaks the day someone renames the health path?
- You put `express.static` either above or below the gate. What does a visitor see in each case, and which did you choose?
- Slugs are computed, not stored. What happens to a printed flyer URL if the coordinator renames "Maker Space" to "The Maker Space"? How would lesson 04's redirects help?
- Which stage in your `PIPELINE.md` could stop a request, and what status does each one use?

## Instructor notes (common pitfalls, how to adapt for time)
- **Gate above `/healthz`:** the most common mistake. The health check returns `503`, and on a real host the process gets restarted in a loop. Have learners deploy the mistake mentally: "what does the host do with a 503 health check?"
- **Gate that forgets to `return`** after sending the `503`, then calls `next()`. That causes `ERR_HTTP_HEADERS_SENT` (lesson 05).
- **`express.static` relative path:** tests pass from the root and fail elsewhere. Good teaching moment; leave it until they hit it.
- **Venue name drift:** if fixture data has `venue` (lessons 02–04) instead of `location`, the views render `undefined`. Point them to the "event shape grows here" step in lesson 06.
- **Shorter version (2.5 hours):** skip the venue index and the accessibility audit; keep venue detail, escaping, and the gate.
- **Pairing:** one learner writes `PIPELINE.md` and the tests' expectations; the other implements. Then swap roles for the review.
