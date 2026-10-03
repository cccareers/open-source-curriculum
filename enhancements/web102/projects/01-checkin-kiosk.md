---
course_id: web102
project_id: web102-x01
title: "Warehouse B Day-of Check-in Kiosk"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - web102-02
  - web102-03
  - web102-04
objectives:
  - Plan a JavaScript project as a sequence of deliverable increments
  - Use a team source-control workflow to manage project work
  - Build working browser features in JavaScript from a written specification
competency_ids:
  - D2-S1-C02
  - D2-S1-C04
  - D5-S1-C01
---

## Scenario

The shift board from project 04 tells the volunteer coordinator who *claimed* each shift. It does not tell the site lead at Warehouse B who actually *showed up*. Right now the site lead stands at the loading-dock door with a printed list and a pen. At 9:20 she has no quick way to see who is late, who has not come at all, and whether to phone the backup list.

She wants a page on the warehouse tablet that does this:

> Show today's claimed shifts for this site in start-time order. When a volunteer arrives, I tap their row to check them in, and the page records the time. If I tap the wrong row, I can undo it. Anyone who arrived more than ten minutes after their start is marked late. Anyone who has not checked in fifteen minutes after their start is marked as a no-show, so I know to call the backup list. Show me the counts at the top. If the tablet restarts, today's check-ins must still be there.

This is the same running example as the rest of the course: same volunteers, same sites, same no-framework browser toolkit. It is a new feature built to someone else's specification.

## What you will build / produce

- A single-page check-in kiosk in vanilla JavaScript, served from a static server, with no build step and no framework.
- A pure logic module, `js/checkin.js`, that follows the function contract below exactly. The acceptance tests import it.
- At least two more ES modules: rendering (`js/render.js`) and wiring (`js/main.js`). Your shift fixture goes in `js/data.js`.
- A `PLAN.md` with four to six increments, estimates against actuals, acceptance criteria, an out-of-scope list, and a tooling decision record (lesson 02).
- A repository history with one branch per increment, merged through described pull requests, following your `CONTRIBUTING.md` from lesson 03.

## Before you start (prerequisites, starter files or data)

- Finish lessons 02 and 03, and ideally project 04. Reuse your `CONTRIBUTING.md`.
- Node.js 20 or newer, used only to run the acceptance tests. The page itself needs no Node.
- Create this layout:

```text
checkin-kiosk/
├── index.html
├── package.json          # only so Node treats .js files as ES modules
├── PLAN.md
├── README.md
├── CONTRIBUTING.md
├── js/
│   ├── checkin.js        # pure logic: no DOM, no localStorage global
│   ├── data.js
│   ├── render.js
│   └── main.js
└── tests/
    └── checkin.test.js   # copy from "Automated checks" below
```

`package.json` contains one line. Lesson 02 says not to add a `package.json` you do not need. Here you need it: without it, Node treats `js/checkin.js` as CommonJS and the tests cannot import it. Record that reason in your tooling decisions.

```json
{ "type": "module", "private": true }
```

### The function contract for `js/checkin.js`

Every time is a number of milliseconds (`Date.getTime()` or `Date.now()`). A `checkins` object maps shift id to arrival time, for example `{ "s1": 1791029400000 }`. Functions never mutate their arguments; they return new values. That keeps "one state, one render" from project 04 intact.

| Function | Returns |
|---|---|
| `todaysShifts(shifts, site, now)` | The shifts at `site` whose start falls on the same **local** calendar day as `now` and whose `claimedBy` is not blank, sorted by start time. |
| `statusOf(shift, checkins, now)` | `"on-time"` if checked in no more than 10 minutes after start; `"late"` if checked in later than that; `"no-show"` if not checked in and `now` is more than 15 minutes after start; otherwise `"expected"`. |
| `checkIn(checkins, shiftId, at)` | A new object with `shiftId` set to `at`. If the shift is already checked in, returns the existing arrival unchanged (a second tap must not overwrite the real arrival time). |
| `undoCheckIn(checkins, shiftId)` | A new object without `shiftId`. |
| `summarize(shifts, checkins, now)` | `{ expected, "on-time", late, "no-show" }` counts for the given shifts. |
| `loadCheckins(storage, key)` | The saved object, or `{}` if the value is missing, not JSON, not a plain object, or `getItem` throws. Entries whose value is not a finite number are dropped. |
| `saveCheckins(storage, key, checkins)` | `true` on success; `false` if `setItem` throws. Never throws. |
| `storageKey(site, now)` | `` `checkins:v1:${site}:${YYYY-MM-DD}` `` using the local date, so tomorrow starts clean. |

`storage` is passed in, not read from the global. In the page you pass `window.localStorage`. In the tests you pass a fake. This is the same seam the "store the smallest thing that works" hint in project 04 points toward.

### Fixture data

Build fixture dates relative to today (see the "Do not let your fixture data expire" hint in project 04), so the kiosk always has a morning to show. Include at least eight shifts across two sites. Include at least one shift that started more than 15 minutes ago, one that starts within the next hour, one open (unclaimed) shift, and one shift tomorrow.

## Milestones

1. **Plan (45 min).** Write `PLAN.md`: restate the requirements, list assumptions (for example: "the tablet's clock is correct", "one tablet per site"), write two or more open questions, and draw up the increment table. Get a peer to find one ambiguous acceptance criterion and fix it.
2. **Increment 1: today's list renders (1 h).** `todaysShifts` plus a render of name, title, and formatted start time. Run the tests: the `todaysShifts` test passes.
3. **Increment 2: check in and undo (1.5 h).** One delegated click listener on the list. Rows show their status in text, not only in color. All `checkIn` and `undoCheckIn` tests pass.
4. **Increment 3: statuses and counts update over time (1 h).** Re-render every 30 seconds with `setInterval`, so "expected" turns into "no-show" without a reload. Counts sit at the top. The `statusOf` and `summarize` tests pass.
5. **Increment 4: persistence that survives bad data (1 h).** `loadCheckins` and `saveCheckins` with the key from `storageKey`. If a save fails, show a visible "Could not save. Check-ins will be lost on reload." banner. All tests pass.
6. **Increment 5: field use (45 min).** Large touch targets, 360 px with no horizontal scroll, visible focus, and accessible names such as "Check in Ana for Food bank sorting, 9:00 AM".

Each increment is its own branch, pull request, and merge.

## Acceptance criteria

- [ ] `npx serve .` (or `python3 -m http.server 8000`) serves a page that lists only today's claimed shifts for the selected site, in start order, with no console errors.
- [ ] Tapping a row's Check in control records the current time, shows "Checked in 9:04 AM" (or similar), and updates the counts immediately.
- [ ] Tapping Check in a second time does not change the recorded arrival time.
- [ ] Undo returns the row to expected or no-show (whichever is correct for the current time) and updates the counts.
- [ ] Without a reload, a row that was "expected" becomes "no-show" within one minute of passing start + 15 minutes.
- [ ] Each status is shown as a text label plus an icon or shape, not by color alone.
- [ ] After three check-ins and a reload, the same three check-ins and their times are shown.
- [ ] Setting the stored value to `not json` in the Application panel and reloading gives a working page with no check-ins and no error.
- [ ] At 360 px there is no horizontal page scroll. Every control can be reached with Tab and activated with Enter or Space, and its accessible name includes the volunteer and the shift.
- [ ] `node --test` passes all eight acceptance tests.
- [ ] At least four merged feature branches and ten or more commits with imperative summaries. `PLAN.md` shows estimates against actuals.

## Automated checks (coding courses)

These are **acceptance checks provided to you**. They are not tests you must write. Automated test frameworks belong to a later course (node200). The checks use Node's built-in `node:test` runner, so there is nothing to install. They exercise only `js/checkin.js`, which is why that module must stay free of DOM and global `localStorage` access.

Save as `tests/checkin.test.js`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  todaysShifts,
  statusOf,
  checkIn,
  undoCheckIn,
  summarize,
  loadCheckins,
  saveCheckins,
  storageKey,
} from "../js/checkin.js";

// Fixed "now": 3 Oct 2026, 09:20 local time. Every time below is local.
const NOW = new Date("2026-10-03T09:20").getTime();
const at = (hhmm) => new Date(`2026-10-03T${hhmm}`).getTime();

const SHIFTS = [
  { id: "s1", site: "Warehouse B", title: "Food bank sorting", startsAt: "2026-10-03T09:00", endsAt: "2026-10-03T12:00", claimedBy: "Ana" },
  { id: "s2", site: "Warehouse B", title: "Van loading", startsAt: "2026-10-03T08:00", endsAt: "2026-10-03T10:00", claimedBy: "Ben" },
  { id: "s3", site: "Warehouse B", title: "Afternoon sort", startsAt: "2026-10-03T13:00", endsAt: "2026-10-03T16:00", claimedBy: "Chen" },
  { id: "s4", site: "Warehouse B", title: "Open shift", startsAt: "2026-10-03T13:00", endsAt: "2026-10-03T16:00", claimedBy: "" },
  { id: "s5", site: "Eastside Pantry", title: "Intake desk", startsAt: "2026-10-03T09:00", endsAt: "2026-10-03T11:00", claimedBy: "Dee" },
  { id: "s6", site: "Warehouse B", title: "Tomorrow", startsAt: "2026-10-04T09:00", endsAt: "2026-10-04T12:00", claimedBy: "Eli" },
];

class FakeStorage {
  constructor(initial = {}) { this.data = { ...initial }; }
  getItem(k) { return k in this.data ? this.data[k] : null; }
  setItem(k, v) { this.data[k] = String(v); }
}

test("todaysShifts: one site, today only, claimed only, sorted by start", () => {
  const ids = todaysShifts(SHIFTS, "Warehouse B", NOW).map((s) => s.id);
  assert.deepEqual(ids, ["s2", "s1", "s3"]);
});

test("statusOf: on-time, late, expected, and no-show", () => {
  const s1 = SHIFTS[0]; // starts 09:00
  assert.equal(statusOf(s1, { s1: at("09:10") }, NOW), "on-time"); // exactly 10 min is not late
  assert.equal(statusOf(s1, { s1: at("09:11") }, NOW), "late");
  assert.equal(statusOf(s1, {}, at("09:15")), "expected");          // exactly 15 min is not a no-show
  assert.equal(statusOf(s1, {}, at("09:16")), "no-show");
});

test("checkIn does not mutate and does not overwrite an earlier arrival", () => {
  const before = {};
  const after = checkIn(before, "s1", at("09:05"));
  assert.deepEqual(before, {});
  assert.equal(after.s1, at("09:05"));
  const again = checkIn(after, "s1", at("09:30"));
  assert.equal(again.s1, at("09:05"));
});

test("undoCheckIn removes only that shift and does not mutate", () => {
  const before = { s1: at("09:05"), s2: at("08:00") };
  const after = undoCheckIn(before, "s1");
  assert.deepEqual(after, { s2: at("08:00") });
  assert.equal(before.s1, at("09:05"));
});

test("summarize counts every status for the given shifts", () => {
  const today = todaysShifts(SHIFTS, "Warehouse B", NOW);
  const counts = summarize(today, { s1: at("09:12") }, NOW);
  assert.deepEqual(counts, { expected: 1, "on-time": 0, late: 1, "no-show": 1 });
});

test("loadCheckins survives missing, corrupt, and wrong-shaped data", () => {
  const key = "k";
  assert.deepEqual(loadCheckins(new FakeStorage(), key), {});
  assert.deepEqual(loadCheckins(new FakeStorage({ k: "not json" }), key), {});
  assert.deepEqual(loadCheckins(new FakeStorage({ k: "[1,2]" }), key), {});
  assert.deepEqual(loadCheckins(new FakeStorage({ k: "null" }), key), {});
  assert.deepEqual(loadCheckins(new FakeStorage({ k: '{"s1":"soon","s2":5}' }), key), { s2: 5 });
  const throwing = { getItem() { throw new Error("SecurityError"); } };
  assert.deepEqual(loadCheckins(throwing, key), {});
});

test("saveCheckins round-trips and reports failure instead of throwing", () => {
  const store = new FakeStorage();
  assert.equal(saveCheckins(store, "k", { s1: 1 }), true);
  assert.deepEqual(loadCheckins(store, "k"), { s1: 1 });
  const full = { setItem() { throw new Error("QuotaExceededError"); } };
  assert.equal(saveCheckins(full, "k", { s1: 1 }), false);
});

test("storageKey is versioned and scoped to site and local date", () => {
  assert.equal(storageKey("Warehouse B", NOW), "checkins:v1:Warehouse B:2026-10-03");
});
```

Run from the project root:

```bash
node --test
```

With no arguments, `node --test` finds `tests/checkin.test.js` by its `.test.js` name. Expect `ℹ pass 8` and `ℹ fail 0`. The checks use local times throughout, so they pass in any timezone. They were verified against a reference implementation under UTC, America/Los_Angeles, Asia/Kolkata, and Pacific/Auckland. A failing check prints the expected and actual values. Treat that output like a defect report from lesson 05: reproduce it, form a hypothesis, then fix it.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Plan as increments | Layered rows ("all HTML", "all JS"), or no acceptance criteria | Four to six vertical slices, each runnable and checkable, with slack and an out-of-scope list | Actuals recorded and the plan revised mid-project with a written reason |
| Built to specification | Fewer than 6 of the acceptance criteria met, or fewer than 6 of 8 checks pass | All acceptance criteria met and 8 of 8 checks pass | Also handles a clock that crosses midnight while the page is open, with the reasoning written up |
| State-driven code | Status read back from the DOM or row classes | One state object and one `render()`; the logic module is pure and DOM-free | Rendering is cheap enough to run every 30 s with no flicker or lost focus |
| Accessibility in the field | Color is the only status cue, or controls are unreachable by keyboard | Text plus shape cues, 360 px works, every control is named and keyboard-operable | Focus is kept on the same row after check-in re-renders |
| Source-control workflow | Commits made directly to `main`, or "wip" commits | One branch per increment, described pull requests, imperative messages | Bodies explain the 10/15-minute boundary decisions with reference to the spec |

## Stretch goals

- A site selector that remembers the last site used. It must not break `storageKey` scoping.
- A "copy no-show list" button that puts the names on the clipboard as text, for pasting into a group message.
- Keep focus on the row you just acted on after `render()` rebuilds the list.

## Reflection prompts

- Which of your assumptions turned out to be wrong, and when did you find out?
- The boundaries are "more than 10 minutes" and "more than 15 minutes". Where in your code does "more than" versus "at least" live, and how would a reviewer know you chose it on purpose?
- Why does passing `storage` in as an argument make the code easier to check than calling `localStorage` directly?

## Instructor notes (common pitfalls, how to adapt for time)

- **Most common failure:** `checkIn` overwrites an existing arrival time. Learners call it on every tap.
- **Second most common:** comparing date strings, or using `toISOString().slice(0, 10)` for "today". That is the UTC date, and it is wrong in the evening for learners west of UTC. The local-date test catches it.
- **`setInterval` without re-rendering from state:** learners patch the status text in place and break "one state, one render".
- **Short on time (3 h):** drop milestone 6 and the persistence banner. Keep the tests for `checkIn`, `statusOf`, and `loadCheckins`.
- **Pairing variant:** one learner owns `checkin.js` against the tests, the other owns `render.js` and `main.js`. They integrate through pull requests. This exercises lesson 03's review loop for real.
- **Reference implementation (instructors only; remove before handing this brief to learners).** This passes all eight checks. It was verified with Node 24 under four timezones:

```javascript
const LATE_AFTER_MIN = 10;
const NO_SHOW_AFTER_MIN = 15;
const MIN = 60 * 1000;

export function todaysShifts(shifts, site, now) {
  const day = new Date(now).toDateString();
  return shifts
    .filter((s) => s.site === site && s.claimedBy.trim() !== "")
    .filter((s) => new Date(s.startsAt).toDateString() === day)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function statusOf(shift, checkins, now) {
  const start = new Date(shift.startsAt).getTime();
  const arrived = checkins[shift.id];
  if (arrived !== undefined) {
    return arrived > start + LATE_AFTER_MIN * MIN ? "late" : "on-time";
  }
  return now > start + NO_SHOW_AFTER_MIN * MIN ? "no-show" : "expected";
}

export function checkIn(checkins, shiftId, at) {
  if (checkins[shiftId] !== undefined) return checkins;
  return { ...checkins, [shiftId]: at };
}

export function undoCheckIn(checkins, shiftId) {
  const { [shiftId]: _removed, ...rest } = checkins;
  return rest;
}

export function summarize(shifts, checkins, now) {
  const counts = { expected: 0, "on-time": 0, late: 0, "no-show": 0 };
  for (const s of shifts) counts[statusOf(s, checkins, now)] += 1;
  return counts;
}

export function loadCheckins(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return {};
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean = {};
    for (const [id, at] of Object.entries(parsed)) {
      if (Number.isFinite(at)) clean[id] = at;
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveCheckins(storage, key, checkins) {
  try {
    storage.setItem(key, JSON.stringify(checkins));
    return true;
  } catch {
    return false;
  }
}

export function storageKey(site, now) {
  const d = new Date(now);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `checkins:v1:${site}:${yyyy}-${mm}-${dd}`;
}
```
