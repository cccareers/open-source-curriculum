---
lesson_id: web102-04
course_id: web102
pathway: software-developer
title: 'Project: Interactive Page Widget'
order: 4
kind: project
competency_ids:
  - D2-S1-C04
  - D5-S1-C01
objectives:
  - Build working browser features in JavaScript from a written specification
---

## The goal

Build the volunteer shift board as a working page, entirely in the browser, from the specification below — and land it as a sequence of reviewed increments in version control rather than as one finished lump.

Two things are being assessed and they are independent of each other. The first is whether the page does what the specification says, checked against the specification line by line by somebody who did not watch you build it. The second is whether the repository shows the work: branches per increment, commits that describe real changes, a merge history a reviewer can follow. A perfect page delivered in a single commit called "done" fails half of this project. So does a beautiful commit history attached to a page that does not run.

Budget six hours. If you are three hours in and nothing renders in a browser, stop and read the hints.

## What you start from

Your `PLAN.md` from lesson 02 and the repository conventions you wrote in lesson 03. Update the plan to match this specification — it is more precise than the paragraph you planned against, and some of your assumptions are now answered. Keep the old assumptions in the file with a note about which turned out to be right; that record is part of the hand-in.

## The specification

A volunteer coordinator needs a single page showing the shifts their volunteers can claim.

**The data.** The board starts from a fixed list of shifts defined in your JavaScript. Each shift has an id, a title, a location, a start time, an end time, and the name of the volunteer who claimed it, which is empty when the shift is open. Provide at least eight shifts spread across past and future dates, at least three of which start unclaimed.

```javascript
export const SHIFTS = [
  {
    id: "s1",
    title: "Food bank sorting",
    location: "Warehouse B",
    startsAt: "2026-08-03T09:00",
    endsAt: "2026-08-03T12:00",
    claimedBy: "",
  },
  // ...at least seven more
];
```

**Claiming.** Each open shift has a control to claim it. Using it asks for the volunteer's name, records it against that shift, and updates the display immediately. A claim with an empty or whitespace-only name is rejected with a visible message and changes nothing.

**Releasing.** Each claimed shift has a control to release it. Using it clears the volunteer name and returns the shift to the open state, immediately.

**Past shifts.** A shift whose end time is in the past is visually distinct from an upcoming one and cannot be claimed or released. Its controls are disabled, not hidden, and it remains readable.

**Persistence.** Claims survive a page reload on the same device and browser. The starting list of shifts does not need to be editable; only the claim state must persist.

**Counts.** The page shows, at all times, how many shifts are open and how many are claimed, counting upcoming shifts only. These update as claims change.

**Filtering.** The coordinator can switch between three views: all upcoming shifts, open shifts only, and claimed shifts only. The current view is obvious from looking at the page.

**Empty state.** When the current view has no shifts in it, the page shows a short sentence explaining that rather than an empty container.

**Field use.** Coordinators use this on a tablet, one-handed, outdoors. It must be usable at 360 pixels wide with no horizontal scrolling, every interactive control must be reachable by keyboard, and every control must say what it does to a screen reader.

## Requirements

Numbered so a reviewer can grade them one at a time.

**R1 — It runs from a static server.** Opening the project's URL on a local static server shows the board with no console errors, no network requests to anything external, and no build step. `npx serve .` or equivalent is the entire run instruction.

**R2 — Rendering is driven by state, not by patching the DOM.** There is one array of shifts held in JavaScript that is the single source of truth, and one render function that produces the visible list from it. Every interaction changes the state and then re-renders. No handler edits the text of a row directly, and no piece of information is stored only in the DOM.

**R3 — Claiming works to spec.** Claiming an open upcoming shift records a non-empty trimmed name and updates that row, the counts, and the current filter view. An empty or whitespace-only name produces a visible message next to the control and changes no state.

**R4 — Releasing works to spec.** Releasing a claimed upcoming shift clears the name and returns the row to the open state, with counts updated.

**R5 — Past shifts are inert.** Every shift whose end time has passed renders in a visually distinct style and its claim and release controls carry the `disabled` attribute. Clicking or activating them by keyboard does nothing to the state. The past/upcoming decision is made from the current time when the page renders, not hard-coded.

**R6 — Claims persist.** Claims are stored in `localStorage` under a single named key and restored on load. Reloading after three claims shows exactly those three claims. If the stored value is missing, corrupt, or unparseable, the page loads with all shifts open and does not throw — it must not show a blank page because of bad stored data.

**R7 — Counts are correct.** The open and claimed counts reflect upcoming shifts only, are correct on first load, and update on every claim, release, and filter change.

**R8 — Filters work.** Three views — all, open, claimed — each showing exactly the right shifts. The active filter is visually indicated and communicated to assistive technology. Switching filters does not lose claim state.

**R9 — Empty states exist.** Each filter view that can be empty shows a specific one-sentence message when it is. "No open shifts right now" is a message; a blank area is not.

**R10 — Accessible and responsive.** No horizontal scrolling at 360 pixels wide. Every control reachable and operable with Tab and Enter or Space, with a visible focus style. Every button has an accessible name that identifies its shift, not just "Claim". Times are rendered in a human-readable form using `Intl.DateTimeFormat`, and each also carries a machine-readable `datetime` attribute on a `time` element. Text contrast is legible outdoors.

**R11 — The code is organized.** At least three JavaScript modules loaded natively with `type="module"` — at minimum, the data, the storage read/write, and the rendering. No global variables leaking onto `window`. No function longer than about forty lines.

**R12 — The repository shows increments.** At least four feature branches, one per increment from your plan, each merged into `main` through a pull request with a description saying what changed, why, and how to check it. At least twelve commits total with imperative summaries; at least three carry a body explaining a decision. `main` is never committed to directly after the initial scaffold. Branches are deleted after merge.

**R13 — The plan is current at hand-in.** `PLAN.md` reflects what you actually built: estimates against actuals for every increment, any increment you added or dropped and why, and the assumptions marked as confirmed or corrected.

## Constraints

- **Vanilla browser JavaScript only.** No React, Vue, Svelte, jQuery, or any UI framework or DOM helper library.
- **No build step.** ES modules served directly. No bundler, transpiler, or task runner.
- **No server, no network.** No `fetch`, no API, no backend of any kind. All data is local. Remote data is project 06's subject and using it here does not earn credit.
- **No CSS framework.** Write the styles yourself. They do not need to be beautiful; they need to be legible, responsive, and accessible.
- **At most one runtime dependency, and only with a written justification** in `PLAN.md` naming what it does and what you tried first. Dev-only tools like a formatter or linter do not count against this.
- **`localStorage` only** for persistence. No cookies, no IndexedDB.
- **No secrets, no personal data.** Volunteer names in your fixture data are invented.

## Out of scope

Named so you do not spend hours on them: adding, editing, or deleting shifts; user accounts, login, or telling volunteers apart; syncing between devices or browsers; server-side anything; automated tests; animation and visual polish beyond legibility; internationalization beyond formatting a date; drag-and-drop. None of these raise your grade and all of them crowd out the requirements that do.

## Definition of done

Every statement is independently checkable by somebody holding only your repository URL.

- A clean clone, served with a static server, renders the board with no console errors.
- Claiming, releasing, filtering, and the counts all behave exactly as R3, R4, R7, and R8 state.
- Past shifts render distinctly and their controls are disabled and inert.
- Claims survive a reload; a deliberately corrupted `localStorage` value loads a working page rather than a broken one.
- Every filter view shows a specific message when it is empty.
- At 360 pixels wide there is no horizontal scrolling, and the whole board can be operated with the keyboard alone with a visible focus indicator.
- Every interactive control has an accessible name identifying its shift.
- The state array is the only source of truth; no information lives only in the DOM.
- At least three ES modules, no globals on `window`.
- `main`'s history shows at least four merged feature branches and at least twelve commits, with no direct commits to `main` after the scaffold.
- Every merged pull request has a description with what, why, and how to check.
- `PLAN.md` shows estimates against actuals and the fate of every assumption.
- `README.md` explains how to run it in ten lines or fewer.

## How you will be assessed

**Building working features from a specification.** A reviewer opens your page and walks R1 through R11 in order, checking each against what the page actually does — not against what you meant. Requirements pass or fail individually, so a board that meets nine of eleven scores far better than one that meets six and has a beautiful animation. Expect the reviewer to try the ugly paths first: claim with a name of three spaces, reload after claiming, hit the filter buttons with the keyboard, resize to 360 pixels, and put garbage in `localStorage` before loading.

**Following the source-control workflow.** Graded from the repository, against the `CONTRIBUTING.md` you wrote in lesson 03. A reviewer will read your commit history, open two or three commits at random and judge whether the message explains the change, check that branches match your own naming convention, and look for the things that indicate rushing: a commit called "wip", a 900-line commit touching everything, changes pushed straight to `main`. Your own conventions are the standard you are held to, which is exactly how it works on a team.

Expect one question in review that you cannot answer by reading your code aloud — something like why you chose that `localStorage` key, or what happens if two browser tabs have the board open at once. Having an honest answer, including "I did not handle that and here is what I would do," is worth more than a confident guess.

## Hints

**Build the render function first and call it after every change.** The whole project is easier if there is exactly one place that turns state into HTML. Write `render()` in increment 1 and resist ever updating the DOM anywhere else.

**Rebuilding the list on every change is fine here.** Eight rows is nothing. Clearing a container and rebuilding it is simpler and less buggy than working out which row changed, and performance will not be a problem at this scale.

**Do not build HTML strings from data you did not write.** A volunteer name goes into the page as text, via `textContent` or a created text node — not by pasting it into an HTML string. This is a habit worth forming now even though the data is yours today.

**Use event delegation.** One click listener on the list container, checking which control was activated via a `data-id` attribute on the button, survives re-rendering. Attaching listeners to individual buttons means reattaching them every render, and forgetting to is a classic "works once" bug.

**Store the smallest thing that works.** You need the claim state, not a copy of every shift. A map of shift id to volunteer name is enough, and it means changing your fixture list later does not corrupt saved data.

**Wrap the `localStorage` read in a `try`/`catch` and validate the result.** `JSON.parse` throws on garbage, and storage can be unavailable entirely in private browsing. R6 is asking specifically about this path, so test it: open devtools, edit the stored value to `not json`, reload. Writes can fail too — `setItem` throws when storage is full or blocked by the browser's settings — so wrap the write as well, and decide what the coordinator sees when a claim could not be saved.

**Compare times as timestamps, not strings.** `new Date(shift.endsAt).getTime() < Date.now()` is unambiguous; comparing formatted strings is not.

**Do not let your fixture data expire.** If you hard-code dates like `"2026-08-03T09:00"`, every shift becomes a past shift a few weeks after you write them, and the reviewer opens a board where nothing can be claimed. Build the dates relative to today instead, so the mix of past and upcoming shifts is the same whenever the page is opened:

```javascript
function at(daysFromToday, hours, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const SHIFTS = [
  { id: "s1", title: "Food bank sorting", location: "Warehouse B",
    startsAt: at(-2, 9), endsAt: at(-2, 12), claimedBy: "Ana" },
  { id: "s2", title: "Van loading", location: "Warehouse B",
    startsAt: at(1, 8), endsAt: at(1, 10), claimedBy: "" },
  // ...
];
```

`setDate` rolls over month ends correctly, so `at(-2, 9)` on the 1st of a month lands on the right day of the previous month.

**Disabled means the `disabled` attribute.** Styling a button grey while it still fires its handler is not disabled, and a keyboard user will find that out before your reviewer does.

**Check the keyboard before you check the styling.** Tab through the whole page early. If you built controls out of `div` elements, you will discover it while it is still cheap to change them to `button`.

**Branch per increment, and merge before starting the next one.** The temptation at hour four is to keep working on one long branch. Resist it; R12 is graded on what the history shows, and a history cannot be reconstructed afterwards honestly.

## What to hand in

1. The repository URL, with `main` holding the finished board, plus `PLAN.md`, `README.md`, `CONTRIBUTING.md`, and `.gitignore`.
2. The output of `git log --oneline --graph` for the whole project.
3. Links to your merged pull requests, at least four.
4. A screenshot of the board at 360 pixels wide, in each of the three filter views.
5. Three sentences naming the hardest defect you hit, how you found it, and what the fix was.

## Check your understanding

Answer these before you hand in. If you cannot, the gap is probably in your code too.

1. A volunteer name is stored only in a row's text, and the counts are computed by counting rows with a certain class. Which requirement does that break, and what goes wrong when a filter hides some rows?
2. You attached a click listener to each Claim button inside `render()`. Claiming works once, then the buttons stop responding — or start firing twice. Why, and what is the fix?
3. What should the page do when `localStorage` contains `{"s1": 42}` instead of a name?
4. Why is styling a past shift's button grey not enough to satisfy R5?

**Answers.** (1) R2 — the DOM is acting as the source of truth. Hidden or re-rendered rows change what you count, so the numbers depend on the current view instead of the state. (2) Re-rendering replaces the buttons, so listeners attached to the old ones either disappear or pile up if you attach without clearing. Use one delegated listener on the list container and read `data-id`. (3) Treat it as invalid: ignore that entry, or fall back to all shifts open, and keep the page working (R6). (4) A grey button still fires its handler on click and on Enter or Space. Only the `disabled` attribute stops activation and tells assistive technology the control is unavailable.
