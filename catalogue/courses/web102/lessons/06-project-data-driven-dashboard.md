---
lesson_id: web102-06
course_id: web102
pathway: software-developer
title: 'Project: Data-Driven Dashboard'
order: 6
kind: project
competency_ids:
  - D2-S1-C04
  - D4-S1-C02
objectives:
  - Build working browser features in JavaScript from a written specification
---

## The goal

Build a dashboard page that loads its data over the network instead of holding it in a JavaScript literal, and then run a full defect cycle on it with another apprentice: they report, you reproduce, fix, and get the fix verified by them before you close it.

The step up from project 04 is not the rendering. It is that the data now arrives late, and sometimes it does not arrive at all. Everything you build has to be correct in four situations rather than one: while the data is still coming, when it arrives, when there is none, and when the request fails. Most beginner front-end code handles exactly the second of those, which is why most beginner front-end code shows a permanently blank page the first time a network is slow.

Two competencies are assessed and they are marked separately. Building the specified features is graded from the running page. Tracking a reported issue through fix and re-test to closure is graded from your `ISSUES.md` and your history — a dashboard that works perfectly and an empty issue log is half a project.

Budget six hours: roughly four building, two on the defect cycle.

## The specification

A program manager wants a single page summarizing volunteer shift activity across sites.

**The data source.** Shift records are served as JSON over HTTP from the same static server that serves your page — a file in your project such as `./data/shifts.json`, fetched at runtime. It is not imported, not inlined, and not pasted into a script tag. Provide at least 40 records covering at least four sites and a three-month date range, with a realistic mix of claimed and unclaimed, past and upcoming. Each record has at least: an id, a site, a title, a start time, an end time, a duration in hours, and the claiming volunteer's name or an empty value.

You may instead fetch from a public read-only API that needs no key or account, provided the rest of the requirements are met and you document the choice in `PLAN.md`.

**Summary tiles.** Across the top, at least four figures computed from the loaded data: total shifts, total volunteer hours claimed, the percentage of shifts claimed, and the number of distinct volunteers. Every figure is derived from the data at runtime; no number is written into the markup.

**A breakdown by site.** For each site, its shift count, claimed count, and total claimed hours, ordered by whichever figure the manager is most likely to act on — decide, and say why in `PLAN.md`.

**A detail table.** Every shift, showing site, title, start, duration, and volunteer or "open". The table can be sorted by at least three columns, ascending and descending, and the current sort is visible on the page.

**Filters.** The manager can narrow the whole dashboard — tiles, breakdown, and table together — by site and by claimed or open. Filters combine. Clearing them returns to everything.

**The four states.** Loading, loaded, empty, and failed are each handled explicitly and visibly, as described in R4 and R5.

**Field use.** The manager reads this on a laptop and on a phone. It must be usable at 360 pixels wide and operable from the keyboard.

## Requirements

**R1 — Data is fetched at runtime.** The page loads with no shift data in it and obtains the records with `fetch` over HTTP from the static server. Nothing renders shift content before the response arrives. There is no build step and no framework.

**R2 — The response is parsed and validated, not trusted.** After parsing, the code checks that it got an array and that each record has the fields it needs, discarding or defaulting anything malformed rather than throwing. A record missing its duration must not blank the whole dashboard.

**R3 — HTTP failures are detected.** `fetch` does not reject on a 404 or a 500 — it resolves with `response.ok` false. Your code checks `response.ok` explicitly and treats a non-ok response as a failure, distinctly from a network error that rejects.

**R4 — Loading and failure states are visible.** While the request is in flight the page shows a loading indication. On failure it shows a plain-language message saying what could not be loaded and offers a retry control that re-runs the request without a page reload. A failure never leaves a blank page and never leaves the loading indicator spinning forever. The raw error goes to the console for a developer; the message on screen is for the manager.

**R5 — The empty state is handled separately from failure.** A successful response containing zero records, or a filter combination matching nothing, shows a specific message explaining that. "No data" and "could not load" are different situations and must read differently.

**R6 — Every displayed figure is computed.** All tiles and breakdown numbers are derived from the current filtered data at render time. Hours are summed correctly, percentages round in a stated way, and the distinct-volunteer count does not double-count a volunteer who claimed three shifts. No figure is hard-coded.

**R7 — Sorting works.** At least three sortable columns, both directions, with the active column and direction indicated visually and announced to assistive technology. Sorting is applied to the data and re-rendered — the DOM is not reordered in place. Dates sort chronologically and numbers sort numerically; neither sorts as strings.

**R8 — Filters compose and drive everything.** Site and status filters apply together and update the tiles, the breakdown, and the table from one code path. Clearing restores the full view. The current filter state is visible without opening a menu.

**R9 — One state, one render.** There is a single object holding the loaded records plus the current filter and sort, and a single render path that produces the whole dashboard from it. Handlers change state and re-render. No figure or filter value is read back out of the DOM.

**R10 — Accessible and responsive.** No horizontal scrolling of the page at 360 pixels — a wide table may scroll inside its own container. The table uses real table markup with header cells. Every control is keyboard-operable with a visible focus style. The loading, empty, and error messages are announced to assistive technology rather than only appearing visually. Numbers are formatted with `Intl.NumberFormat` and dates with `Intl.DateTimeFormat`.

**R11 — The repository shows increments.** At least four feature branches merged through described pull requests, following your `CONTRIBUTING.md`. At least twelve commits with imperative summaries. `PLAN.md` is updated for this project with increments, estimates against actuals, acceptance criteria, and out-of-scope list.

**R12 — A defect cycle is completed and recorded.** Described in its own section below. This is half the project.

## The defect cycle

Pair with another apprentice. Each of you works on your own dashboard; you exchange reports, not code.

**Round 1 — report.** Once both dashboards render real data, spend forty minutes on your partner's page trying to break it, and file **at least four** defects in their `ISSUES.md` using the full report format from lesson 05: title, environment, numbered steps with exact values, expected, actual, frequency, impact, evidence. At least one must come from the network panel — throttle to a slow connection, or go offline, or edit the response to return a 404 — and at least one from a filter or sort edge case such as an empty result, a single record, or a tie.

**Round 2 — receive and reproduce.** For each report filed against you: reproduce it before touching code and record the result on the report. If you cannot, write a specific information request and have your partner answer it; do not guess and do not close it.

**Round 3 — triage.** Order your reports by impact on the manager using the page, and record the order with one line of reasoning each. State which you would escalate immediately rather than queue, and why.

**Round 4 — fix.** One branch and one commit per defect, each message stating what was wrong, what changed, why, and any behavior that must remain unchanged. Keep diffs minimal. Fix the cause, not the visible symptom.

**Round 5 — verify.** Your partner walks each original report against your fix and marks it verified or failed. A failure comes back to you and goes around again. You do not verify your own fixes.

**Round 6 — close.** Each report is closed with the cause in one or two sentences, the commit reference, the verifier's name, the date, and anything left over — including any related defect you found and filed separately rather than sneaking into the fix.

At least three of the four defects filed against you must reach verified closure. A defect that cannot be reproduced, or that you and your partner agree is not a defect, is closed with that reasoning written down; that is a legitimate outcome and it still has to be recorded.

## Constraints

- **Vanilla browser JavaScript only.** No framework, no DOM helper library, no build step. ES modules served natively.
- **No server you wrote.** The static dev server serving files is the only server. No Node, no Express, no database. Writing a backend does not earn credit here.
- **No API keys, no accounts, no secrets in the repository.** If you use a public API, it must need none.
- **At most one runtime dependency,** justified in `PLAN.md` with what you tried first. A charting library is the likely candidate and is acceptable with a written reason; everything else needs a strong one.
- **No CSS framework.**
- **No automated test framework.** Verification here is manual and recorded.

## Out of scope

Editing or creating shift records; writing data back anywhere; authentication or per-user views; real-time updates, polling, or websockets; pagination and virtualized rendering; exporting to CSV or PDF; animation; charts beyond one simple visual if you choose to add it. None of these are graded and all of them cost you requirements that are.

## Definition of done

- A clean clone served with a static server renders the dashboard with no console errors, and the page's own markup contains no shift data.
- With the network throttled to a slow connection, a loading indication is visible and is replaced by content when the data arrives.
- With the data file renamed to force a 404, the page shows a plain-language failure message and a retry control, and retry succeeds once the file is restored — with no page reload.
- With the data file replaced by an empty array, the page shows an empty-state message, not an error and not a blank area.
- A record with a missing field does not blank the dashboard.
- All tiles and breakdown figures are arithmetically correct against the loaded data, checked by hand on at least one filter combination.
- Three columns sort both ways, with dates chronological and numbers numeric, and the active sort is visible.
- Site and status filters compose, drive tiles, breakdown and table together, and clear correctly.
- At 360 pixels wide the page does not scroll horizontally; the whole dashboard is operable by keyboard with visible focus.
- Loading, empty, and error messages are announced to assistive technology.
- The repository shows at least four merged branches and twelve commits; `PLAN.md` has estimates against actuals.
- `ISSUES.md` shows at least four reports filed against you, each with reproduction result, triage position, fix commit, verification by your partner, and a closing statement — with at least three verified closed.
- `README.md` explains how to run it in ten lines or fewer.

## How you will be assessed

**Building working features from a specification.** A reviewer opens the page and works R1 through R11 in order, and they will go for the states first: throttle the network, break the URL, empty the file, corrupt a record. Handling only the happy path is the most common way this project loses marks. They will also check one tile's arithmetic by hand against a filtered view, because computed-looking numbers that are wrong are worse than no numbers.

**Tracking an issue through fix and re-test to closure.** Graded from `ISSUES.md` and the commit history together. A reviewer is looking for whether reproduction actually preceded the fix, whether the fix commit says what was wrong rather than only what changed, whether verification was done by the other person against the original steps, and whether anything closed without evidence. A cycle where one defect failed verification and went round again scores *better* than four clean closures with no record of checking, because it shows the loop working.

## Hints

**Get the fetch working before you build anything on top of it.** Increment 1 is fetching the file and dumping the records to the console with `console.table`. Everything else is easier once you know the data arrives and what shape it is.

**Remember `response.ok`.** This is the most-missed line in browser JavaScript. `fetch` only rejects when the request could not be made at all; a 404 resolves happily and `response.json()` then throws a confusing parse error on the error page's HTML. Check `response.ok` and throw your own clear error.

Here is the whole load path in one place — the check for `response.ok`, the check for an array, and per-record validation that drops what it cannot use instead of throwing (R2 and R3):

```javascript
export async function loadShifts(url) {
  const response = await fetch(url); // rejects only if the request could not be made
  if (!response.ok) {
    throw new Error(`Could not load shifts (HTTP ${response.status})`);
  }
  const data = await response.json(); // throws if the body is not valid JSON
  if (!Array.isArray(data)) {
    throw new Error("Shift data was not a list");
  }
  return data
    .filter((r) => r && typeof r.id === "string" && typeof r.site === "string")
    .map((r) => ({
      ...r,
      hours: Number.isFinite(Number(r.hours)) ? Number(r.hours) : 0,
      volunteer: typeof r.volunteer === "string" ? r.volunteer.trim() : "",
    }));
}
```

The caller does the state change, so every way of failing ends in the same place:

```javascript
async function start() {
  state.status = "loading";
  render();
  try {
    state.records = await loadShifts("./data/shifts.json");
    state.status = "ready";
  } catch (err) {
    console.error(err);           // for the developer
    state.status = "error";       // render() shows the plain-language message and Retry
  }
  render();
}
```

Retry is then just a button whose handler calls `start()` again. Decide deliberately whether a record missing its duration is dropped or kept with zero hours — this version keeps it with zero — and write that decision in `PLAN.md`, because it changes the totals.

**Model the state explicitly.** Something like `{ status: "loading" | "ready" | "error", records, error, filters, sort }`, with `render()` switching on `status`, makes R4 and R5 nearly free. Trying to infer the state from whether the array is empty is what causes the "loading forever" and "empty looks like broken" bugs.

**Compute from the filtered data, once per render.** Derive the filtered array at the top of `render()` and pass it to the tiles, the breakdown, and the table. Two code paths computing the same figure is exactly the defect from lesson 05.

**Use the network panel deliberately, not just when stuck.** Throttling and offline mode are how you produce the states in the definition of done. Test them during development, not the night before.

**Sort a copy.** `Array.prototype.sort` mutates. Sorting your loaded records in place scrambles the original order you may want back.

**Watch the date comparisons.** Compare timestamps from `Date.parse` or `getTime`, never formatted strings, and be aware that a date-only string and a date-time string parse with different assumptions about timezone. `new Date("2026-09-01")` is read as midnight UTC, while `new Date("2026-09-01T00:00")` is read as midnight in the viewer's local time. For a manager in Chicago, the first one formats as Aug 31 — a shift appears on the wrong day and falls into the wrong filter. Give every record a full date-time, and keep the data format consistent across the file.

**Put the table in its own scroll container.** That satisfies R10 without forcing you to hide columns on a phone.

**File the defects you find in your own work too.** Anything you notice but do not fix goes in `ISSUES.md` with a status. A known, recorded defect is professional; an unrecorded one is a surprise for somebody else.

**Do the defect cycle for real.** The temptation is to file four trivial reports for each other and close them in ten minutes. That produces nothing to be assessed on and it is obvious from the outside.

## What to hand in

1. The repository URL, with the dashboard on `main`, plus `PLAN.md`, `ISSUES.md`, `README.md`, and `CONTRIBUTING.md`.
2. The output of `git log --oneline --graph` for the project.
3. Links to at least four merged pull requests, including the fix branches.
4. Screenshots of all four states — loading, loaded, empty, failed — plus the dashboard at 360 pixels wide.
5. Your partner's name, and their written verification result for each defect.
6. One paragraph on the defect that took longest, what the wrong hypothesis was, and the observation that corrected it.

## Check your understanding

1. The data file is renamed and the server returns a 404 page. Without a `response.ok` check, what error do you see, and where does it come from?
2. Your state object has no `status` field, and `render()` shows "No shifts" whenever `records` is empty. Which two of the four states can the manager no longer tell apart?
3. Three records belong to Ana, one of them saved as `"Ana "`. What should the distinct-volunteer tile show for Ana, and what code makes that true?
4. Sorting the duration column ascending gives 10, 2, 3, 9. What went wrong?

**Answers.** (1) `fetch` resolves normally, then `response.json()` throws a `SyntaxError` because it is trying to parse the HTML of the 404 page. The real cause, the 404, never appears in your error. (2) Loading and empty both look like "No shifts". A failure can look the same too if the error is swallowed. (3) One volunteer. Trim the names when you parse them and ignore empty names before counting with a `Set`. (4) The values were compared as strings, so "10" sorts before "2". Compare numbers by subtracting them: `a.hours - b.hours`.
