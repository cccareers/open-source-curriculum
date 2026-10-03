---
course_id: web102
project_id: web102-x02
title: "Hours Report Defect Sprint"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - web102-05
  - web102-06
  - web102-03
objectives:
  - Track a reported defect from report through fix to verification
  - Report a defect with enough detail for someone else to reproduce it
competency_ids:
  - D4-S1-C02
  - D4-S1-C05
  - D5-S1-C01
---

## Scenario

The program manager from project 06 has been using a volunteer hours report that a previous apprentice built. That apprentice has moved to another team. The report's calculations live in one module, `js/report.js`. This week five messages arrived in the team's issue tracker, and they are not all equally good. One is excellent. One is too vague to act on. One describes behavior the specification actually requires. Two are real defects. There is also at least one defect that nobody has reported yet.

You have been assigned the module. Your job is not "make the numbers right". It is to drive every report to a recorded, verified outcome: reproduced or sent back for information, triaged, fixed with a minimal change, verified by somebody else, and closed with a cause. That includes the report you close as "not a defect" and the defect you find and report yourself.

## What you will produce

- An `ISSUES.md` covering six items: the five incoming reports plus one report you write. Each item shows the full trail from lesson 05: reproduction result (or information request), triage position with one line of reasoning, diagnosis with the tool or observation that confirmed it, fix commit, verifier's name, and closing statement.
- One fix branch per real defect, each with a minimal diff and a commit message that says what was wrong, what changed, why, and what must remain unchanged.
- A passing run of the provided acceptance checks, with a before-and-after record of which checks failed.

## Before you start (prerequisites, starter files or data)

- Finish lesson 05. Project 06 is helpful but not required.
- Node.js 20 or newer, for the acceptance checks. You also need a static server for the page you wire up in step 2 of the milestones.
- Create a repository with this layout and commit it to `main` as the starting scaffold, **before** you change anything:

```text
hours-report/
├── package.json        # { "type": "module", "private": true }
├── index.html          # you write a minimal page in milestone 2
├── data/shifts.json    # you write 12+ records in milestone 2
├── js/report.js        # starter below, defects included
└── tests/report.test.js
```

### Starter `js/report.js` (contains planted defects)

```javascript
// js/report.js - Volunteer hours report.
// Starter code for web102-x02. It contains planted defects. Do not fix
// anything until a defect has been reported and reproduced.

export async function loadShifts(fetchFn, url) {
  const response = await fetchFn(url);
  const data = await response.json();
  return parseShifts(data);
}

export function parseShifts(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((r) => r && typeof r.id === "string" && typeof r.site === "string")
    .map((r) => ({
      id: r.id,
      site: r.site,
      title: String(r.title ?? ""),
      startsAt: String(r.startsAt ?? ""),
      hours: Number.isFinite(Number(r.hours)) ? Number(r.hours) : 0,
      volunteer: typeof r.volunteer === "string" ? r.volunteer.trim() : "",
    }));
}

export function totalClaimedHours(records) {
  return records.reduce((sum, r) => sum + r.hours, 0);
}

export function distinctVolunteers(records) {
  return new Set(records.map((r) => r.volunteer)).size;
}

export function percentClaimed(records) {
  const claimed = records.filter((r) => r.volunteer !== "").length;
  return Math.round((claimed / records.length) * 100);
}

export function sortRecords(records, key, direction = "asc") {
  const sign = direction === "desc" ? -1 : 1;
  return [...records].sort(
    (a, b) => String(a[key]).localeCompare(String(b[key])) * sign,
  );
}
```

`hours` is a number of hours. `volunteer` is an empty string when the shift is open. The specification for this module, agreed with the manager, says:

1. Total claimed hours counts only claimed shifts.
2. Distinct volunteers counts each person once, ignoring surrounding whitespace, and never counts an open shift.
3. Percent claimed is rounded to the nearest whole number, and is `0` when there are no records.
4. Sorting by a numeric column sorts numerically, and sorting never reorders the caller's array.
5. A failed HTTP response rejects with an error that names the HTTP status. It must not surface as a JSON parse error.

### The incoming reports (copy into `ISSUES.md` as received; do not edit them)

```text
#1  Title: Total claimed hours includes open shifts
    Environment: Chrome, report page on main @ (scaffold commit).
    Steps: 1. Load data/shifts.json with at least one open shift.
           2. Read the "Hours claimed" tile.
    Expected: Sum of hours for shifts with a volunteer (spec item 1).
    Actual: Equals the sum of hours for every shift, open or claimed.
    Frequency: Every time. Impact: I report these hours to our funder.

#2  Title: volunteer number wrong
    Body: the volunteers number looks off sometimes?? can someone check

#3  Title: Percentage is rounded
    Body: 2 of 3 shifts claimed shows 67%. Should show 66.7%.

#4  Title: Page says "Unexpected token '<'" when the data file is missing
    Steps: Rename data/shifts.json, reload.
    Expected: A message saying the shift data could not be loaded.
    Actual: Console shows SyntaxError: Unexpected token '<'. The page shows our
            generic error, but the logged error does not say the file was missing.

#5  Title: Empty data file shows NaN%
    Steps: Replace data/shifts.json with [] and reload.
    Expected: 0% claimed.  Actual: "NaN%".
```

## Milestones

1. **Run the checks before touching anything (15 min).** Run `node --test` and save the output to `ISSUES.md` under "Baseline". Expect five failures. Do **not** use the failing test names as a substitute for reproduction: a failing check tells you something disagrees with the specification, not what a user sees.
2. **Build a reproduction harness (45 min).** Write a minimal `index.html` that fetches `./data/shifts.json` with `loadShifts(fetch, url)` and shows the four figures and a table sortable by hours. Write at least 12 records across two sites, including one open shift, one name with a trailing space, and durations of both 9 and 10 hours. Commit this on a branch and merge it. It is not a fix.
3. **Reproduce and respond (1 h).** For each of the five reports, follow the steps literally in the browser and record what you saw. For #2, do not guess: write a specific information request (which figure, what value, what was expected, which data) and have your partner answer it in role as the manager. Then rewrite #2 as a complete report. For #3, quote spec item 3 and close it as working as specified, with a polite explanation to the reporter.
4. **Find and report the unreported defect (30 min).** Exercise every feature, including sorting, on the edge cases from lesson 05. Write report #6 in the full format, with exact values.
5. **Triage (15 min).** Order the real defects by impact on the manager, with one line of reasoning each. State which one you would escalate immediately rather than queue, and why. Hint: #1 feeds a number that goes to a funder.
6. **Fix (1.5 h).** One branch and one commit per defect. Keep each diff minimal. Fix the cause: for #2 and #5, ask what *else* is wrong for the same reason. After each fix, run `node --test` and record which check turned green.
7. **Verify and close (45 min).** Your partner walks each original report's steps in the browser against your branch and marks it verified or failed. Then confirm that each defect reappears when you temporarily revert its fix. Close each item with the cause, the commit, the verifier, and the date.

## Acceptance criteria

- [ ] `ISSUES.md` holds six items, each with a final status: closed-fixed for five of them (#1, #2, #4, #5, #6) and closed-not-a-defect for #3. #2 is fixed only after its information request has been answered.
- [ ] Every fixed item records a reproduction *before* the date of its fix commit.
- [ ] #2 contains the information request and the answer, and is rewritten to the full report format.
- [ ] #6 was written by you and meets every section of lesson 05's report format.
- [ ] One fix branch per real defect, merged through a pull request. No fix touches more than the lines needed, and there is no reformatting.
- [ ] Every fix commit body states what was wrong and what must stay unchanged.
- [ ] Each fix is verified by your partner against the original steps, not by you.
- [ ] `node --test` reports `pass 9` and `fail 0` on `main` at hand-in.
- [ ] The rounding check (#3) still passes. You did not "fix" a non-defect.

## Automated checks (coding courses)

These checks are **provided to you**, not written by you. Automated test frameworks are taught in a later course (node200). They use Node's built-in runner and need no install. Save as `tests/report.test.js`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadShifts,
  parseShifts,
  totalClaimedHours,
  distinctVolunteers,
  percentClaimed,
  sortRecords,
} from "../js/report.js";

const RECORDS = parseShifts([
  { id: "s1", site: "Warehouse B", title: "Food bank sorting", startsAt: "2026-09-01T09:00", hours: 3, volunteer: "Ana" },
  { id: "s2", site: "Warehouse B", title: "Van loading", startsAt: "2026-09-02T08:00", hours: 2, volunteer: "Ben" },
  { id: "s3", site: "Eastside Pantry", title: "Intake desk", startsAt: "2026-09-03T10:00", hours: 10, volunteer: "" },
  { id: "s4", site: "Eastside Pantry", title: "Restock", startsAt: "2026-09-04T13:00", hours: 9, volunteer: "Ana " },
]);

test("parseShifts discards malformed records instead of throwing", () => {
  const out = parseShifts([{ id: "ok", site: "A", hours: 1 }, null, { site: "no id" }, 42]);
  assert.equal(out.length, 1);
  assert.deepEqual(parseShifts({ not: "an array" }), []);
});

test("Report #1: total claimed hours counts claimed shifts only", () => {
  assert.equal(totalClaimedHours(RECORDS), 3 + 2 + 9);
});

test("Report #2: distinct volunteers ignores open shifts and trims names", () => {
  assert.equal(distinctVolunteers(RECORDS), 2); // Ana, Ben
});

test("Report #3 (not a defect): percent claimed rounds to a whole number", () => {
  const three = RECORDS.slice(0, 3); // 2 of 3 claimed
  assert.equal(percentClaimed(three), 67);
});

test("Report #5: percent claimed is 0, not NaN, when there are no records", () => {
  assert.equal(percentClaimed([]), 0);
});

test("Self-found defect: hours sort numerically, not as strings", () => {
  const ids = sortRecords(RECORDS, "hours", "asc").map((r) => r.id);
  assert.deepEqual(ids, ["s2", "s1", "s4", "s3"]); // 2, 3, 9, 10
});

test("sortRecords does not mutate its input", () => {
  const before = RECORDS.map((r) => r.id);
  sortRecords(RECORDS, "hours", "desc");
  assert.deepEqual(RECORDS.map((r) => r.id), before);
});

test("Report #4: a 404 rejects with an error naming the HTTP status", async () => {
  const fake404 = async () => ({
    ok: false,
    status: 404,
    json: async () => { throw new SyntaxError("Unexpected token '<'"); },
  });
  await assert.rejects(loadShifts(fake404, "./data/shifts.json"), /404/);
});

test("loadShifts parses a successful response", async () => {
  const fakeOk = async () => ({
    ok: true,
    status: 200,
    json: async () => [{ id: "s1", site: "A", hours: 2, volunteer: "Ana" }],
  });
  const out = await loadShifts(fakeOk, "./data/shifts.json");
  assert.equal(out.length, 1);
  assert.equal(out[0].hours, 2);
});
```

Run from the project root:

```bash
node --test
```

On the starter code, expect `ℹ pass 4` and `ℹ fail 5`. The five failing checks map to reports #1, #2, #4, #5, and the unreported defect. The four passing checks guard behavior that must not change, including the #3 rounding rule. After all fixes, expect `ℹ pass 9` and `ℹ fail 0`. Both results were verified with Node 24.

Note: `node --test tests/` (passing a directory) does not work on current Node versions. Use `node --test` with no arguments, or `node --test tests/report.test.js`.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Reproduction before fix | Fixes made straight from the failing test names | Every item reproduced in the browser and recorded before its fix | Narrowed to the shortest failing sequence, with the variable that triggers it named |
| Report quality (#2 rewrite and #6) | Missing environment, steps, or expected source | All lesson 05 sections, exact values, observation kept separate from hypothesis | A reader could triage it without opening the code |
| Handling non-defects and vague reports | #3 "fixed" or #2 closed as "cannot reproduce" | #3 closed citing the spec; #2 sent back with a specific request | The reply to #3 also suggests a documentation change so it is not reported again |
| Minimal, causal fixes | Reformatting in fix diffs, or symptoms patched | One cause per commit; commit message says what must not change | Notices that #2 and #5 share a cause pattern (open or empty records not handled) and says so |
| Verification and closure | Self-verified, or closed without evidence | Partner-verified against the original steps; revert-and-reproduce recorded | At least one fix failed verification and went around the loop, with that recorded |

## Stretch goals

- Use `git bisect` on a partner's branch where they hid a regression among ten commits, and record the commands and the first bad commit.
- Add a seventh check for a defect you found that is not covered by the provided checks. Record that you went beyond the brief, since automated tests belong to node200.

## Reflection prompts

- Which report cost you the most time, and was the cost in the report or in the code?
- How did you tell the manager that #3 was not a defect, and how would you word it differently for a more senior reporter?
- The provided checks went red to green. What did walking the browser steps tell you that the checks could not?

## Instructor notes (common pitfalls, how to adapt for time)

- **Planted defects and causes (instructors only):** #1 `totalClaimedHours` sums every shift. #2 `distinctVolunteers` counts `""` as a volunteer, so the count is one too high whenever an open shift exists. Trimming is already done in `parseShifts`, which is why "Ana " is not the bug, and that makes a good wrong hypothesis to discuss. #4 there is no `response.ok` check. #5 `percentClaimed` divides by zero. #6 (unreported) `sortRecords` compares numbers as strings, so 10 sorts before 9. #3 is working as specified.
- **Learners fixing straight from test names** skip the competency. Ask for the browser reproduction screenshot for each item.
- **Learners "fixing" #3** by removing `Math.round`: the guard check catches this. Use it as the discussion of severity, priority, and "who owns the specification".
- **Short on time (2.5 h):** pre-supply `index.html` and `data/shifts.json`, and drop milestone 2.
- **Reference fix (instructors only; remove before handing this brief to learners).** This passes all nine checks:

```javascript
// js/report.js - Volunteer hours report.
// Starter code for web102-x02. It contains planted defects. Do not fix
// anything until a defect has been reported and reproduced.

export async function loadShifts(fetchFn, url) {
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Could not load shifts (HTTP ${response.status})`);
  }
  const data = await response.json();
  return parseShifts(data);
}

export function parseShifts(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((r) => r && typeof r.id === "string" && typeof r.site === "string")
    .map((r) => ({
      id: r.id,
      site: r.site,
      title: String(r.title ?? ""),
      startsAt: String(r.startsAt ?? ""),
      hours: Number.isFinite(Number(r.hours)) ? Number(r.hours) : 0,
      volunteer: typeof r.volunteer === "string" ? r.volunteer.trim() : "",
    }));
}

export function totalClaimedHours(records) {
  return records
    .filter((r) => r.volunteer !== "")
    .reduce((sum, r) => sum + r.hours, 0);
}

export function distinctVolunteers(records) {
  return new Set(records.map((r) => r.volunteer).filter((v) => v !== "")).size;
}

export function percentClaimed(records) {
  if (records.length === 0) return 0;
  const claimed = records.filter((r) => r.volunteer !== "").length;
  return Math.round((claimed / records.length) * 100);
}

export function sortRecords(records, key, direction = "asc") {
  const sign = direction === "desc" ? -1 : 1;
  return [...records].sort(
    (a, b) => {
      const x = a[key];
      const y = b[key];
      const order = typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y));
      return order * sign;
    },
  );
}
```
