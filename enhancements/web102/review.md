---
course_id: web102
title: "JavaScript Projects — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary

web102 is strong. The lessons are concrete, direct, and built around one consistent running example: the volunteer shift board for a coordinator, then a program manager's dashboard across sites. Specs, requirements, and definitions of done are unusually precise. The biggest opportunities are worked code where the lessons only describe the code (the `fetch` load path and the date-dependent fixture), a few small technical inaccuracies, and practice the learner can check for themselves. The course has no self-checks, and its projects have no learner-runnable checks.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| web102-02 | "Choosing, and refusing, libraries" | "A library that only ships as an ES module you must bundle is out" is confusing and technically inaccurate. Browsers run ES modules natively. What needs a bundler is CommonJS, or modules that import npm packages by bare specifier. | Reworded to name CommonJS and bare-specifier imports, and to say that a standalone ES module file fits the constraint. | Applied |
| web102-02 | "Acceptance criteria, and what "done" means" | The definition-of-done bullet "JavaScript's strict expectations" is vague, and never says what strict mode is or when it applies. | Says that `type="module"` scripts are always in strict mode, so assigning to an undeclared variable throws. | Applied |
| web102-03 | "Branches, and what they are for" | `origin`, "remote", and "upstream" are used before they are defined. | Added one sentence defining the remote and `origin`, and expanded what `-u` records. | Applied |
| web102-03 | "When a conflict happens" | "The top block is your branch" is true for merge but reversed during rebase, and the lesson teaches both. | Added a note that the sides swap during a rebase: read the marker labels. | Applied |
| web102-04 | "The specification" / "Hints" | The fixture example uses fixed dates (`2026-08-03`). Any hard-coded fixture becomes all-past within weeks, so R5 and claiming cannot be demonstrated. As of this review, the example date has already passed. | Added a hint with a relative-date helper (`at(daysFromToday, h, m)`). The spec text is unchanged. | Applied |
| web102-04 | "Hints" (localStorage `try`/`catch`) | Only reads are guarded. `setItem` can throw (storage full or blocked) and is not mentioned. | Added a sentence on guarding writes and deciding what the user sees. | Applied |
| web102-05 | "Finding the cause" | "Six panels matter", but the sixth item is a console technique, not a panel. The DevTools shortcut is given for macOS only. | Reworded to "Five panels matter, plus one way of using the console while paused"; added the Windows/Linux shortcut. | Applied |
| web102-05 | "Finding the cause" → "Bisect the history" | Manual bisecting is described, but `git bisect`, which automates it, is not mentioned. | Added a short `git bisect` command sequence with a reminder to `reset`. | Applied |
| web102-06 | "Hints" → "Remember `response.ok`" | R2, R3, and R4 are only described. This is the hardest part of the project and has no worked code. | Added a worked `loadShifts` + `start()` example covering the ok-check, array validation, per-record defaults, the status transitions, and retry. | Applied |
| web102-06 | "Hints" → "Watch the date comparisons" | The timezone warning is abstract. | Added a concrete example (`"2026-09-01"` is UTC midnight and shows as Aug 31 in Chicago), verified in Node with `TZ=America/Chicago`. | Applied |
| web102-03 | "Practice" step 8 | It asks learners to commit directly to `main`, which contradicts the "never commit to `main`" rule. This is fine for a solo practice repo, but it is not said. | Proposed: add "(this is the one time you commit to `main` directly, to practice reverting)". Not applied, because it changes the practice instructions. | Proposed |
| web102-01 | "Course Content" | Plain list with no hours per lesson or project; learners cannot see that two thirds of the time is building. | Proposed: append hours from course.json. Not applied, because it is metadata-adjacent. | Proposed |

## Depth and coverage gaps

- **No self-checks anywhere.** No lesson had a "Check your understanding" block. Added short blocks with answers to lessons 02–07 (Plan a JavaScript project as a sequence of deliverable increments; Use a team source-control workflow to manage project work; Track a reported defect from report through fix to verification; Present a finished project and explain the decisions behind it).
- **Thin worked example for the four states.** Project 06 describes loading, ready, empty, and failed but showed no code. Worked example added (Build working browser features in JavaScript from a written specification). Video web102-v01 covers the same ground on screen.
- **Event delegation is described but not shown.** Project 04's hint explains why to use event delegation but shows no code. A 6-line `list.addEventListener("click", (e) => { const btn = e.target.closest("button[data-id]"); … })` example would help (Build working browser features in JavaScript from a written specification). Proposed only. Animation web102-a01 scene 7 visualizes it.
- **Accessible names are required but never demonstrated.** R10 in project 04 requires names that identify the shift ("Claim Food bank sorting, Mon 9:00 AM"). An `aria-label` versus visually hidden text example is missing. Proposed.
- **Live regions are required but not taught.** Project 06 R10 requires announced loading and error messages. Shown in video web102-v01 (`role="status"`). A one-line mention in the 06 hints is proposed.
- **Misconception: `git restore` versus stash.** Lesson 05 says "Stash or revert the change" to confirm the fix, but `git stash` is never taught in lesson 03. Proposed: add a two-line `git stash` / `git stash pop` aside in lesson 05 (Track a reported defect from report through fix to verification).
- **Concurrency is asked about but never taught.** Project 04 says reviewers may ask what happens with two tabs open, but the `storage` event is never mentioned. The 07 self-check now points at it. A hint is proposed for 04.
- **Decision-explanation practice before the demo.** Project 07 grades R11 heavily, but there is no low-stakes rehearsal earlier. Proposed: a two-minute "explain one decision" pair exercise at the end of project 06 (Present a finished project and explain the decisions behind it).

## Proposed additional projects

- **web102-x01 Warehouse B Day-of Check-in Kiosk** (drafted, `projects/01-checkin-kiosk.md`). A site lead checks in volunteers, with late and no-show logic, persistence, and planning plus a branch-per-increment workflow. Ships 8 `node:test` acceptance checks, verified against a reference implementation in four timezones.
- **web102-x02 Hours Report Defect Sprint** (drafted, `projects/02-hours-report-defect-sprint.md`). Five incoming reports of varying quality (one vague, one not a defect) plus one unreported defect in a seeded module. Ships 9 `node:test` checks: 5 fail on the starter and all pass after correct fixes, both verified.
- **Shift swap requests** (not drafted). Two volunteers trade shifts. The coordinator approves, with conflict detection on overlapping times. Good for a second pair-programming exercise on lesson 03's review loop.
- **Site map widget, no library** (not drafted). An accessible, keyboard-operable list/map toggle of sites, built from a JSON fetch. A smaller warm-up for project 06's states.
- **Decision record kata** (not drafted). Given three short project briefs, write the lesson 02 tooling decision record for each, then defend one in 2 minutes. This bridges lesson 02 and project 07.

## Video and animation opportunities

- **Fetch does not reject on a 404**: web102-06, screencast. The failure is invisible until you produce it with the Network panel, and motion shows the states. **Drafted:** `media/video-01-fetch-does-not-reject-on-404.md`.
- **A defect report someone else can run**: web102-05, hybrid (talking head plus screencast). Shows reproduction and narrowing in real time, and the vague-to-actionable rewrite. **Drafted:** `media/video-02-a-defect-report-someone-else-can-run.md`.
- **One state, one render**: web102-04, explainer animation. Data flow is invisible. Shows the stale-count anti-pattern and event delegation surviving re-renders. **Drafted:** `media/animation-01-one-state-one-render.md`.
- **Defect lifecycle including the backward arrows**: web102-05, explainer animation. It also gives a source for the missing `defect-lifecycle.png`. **Drafted:** `media/animation-02-defect-lifecycle-backward-arrows.md`.
- **Branch, commit, PR, merge flow**: web102-03, explainer animation. The missing `branch-and-merge-flow.png` asset could come from it, along with a merge-versus-rebase comparison. Not drafted.
- **Resolving a conflict live**: web102-03, screencast. The practice in step 5, recorded end to end, including verifying in the browser afterwards. Not drafted.
- **Demo do's and don'ts**: web102-07, talking head with two short contrasting demos (narrating clicks versus narrating decisions). Not drafted.

## Assessment ideas

- **Plan critique item (02):** give a layered plan ("all HTML, all CSS, all JS, test"). The learner rewrites it as 4–5 vertical slices with acceptance criteria. Rubric: each row runnable, demonstrable, ≤ 1 day, independently checkable.
- **Commit message sort (03):** 10 real-looking messages; learners classify them as good, too vague, or diagnosis-only, and rewrite three.
- **Report triage drill (05):** 6 short reports; learners mark each as defect, feature request, needs info, or duplicate, and give one sentence of reasoning. Project x02's incoming reports can be reused.
- **Four-states screenshot check (06):** auto-checkable hand-in. Four labelled screenshots must exist, and a reviewer confirms that the empty and error messages differ.
- **Demo rubric calibration (07):** have instructors score one recorded sample demo independently, then compare to align on R10–R14 before live marking.

## Changes applied in this pass

- `02-planning-a-javascript-project.md`, "Acceptance criteria, and what "done" means": replaced the vague "strict expectations" bullet with an accurate statement about strict mode in module scripts.
- `02-planning-a-javascript-project.md`, "Choosing, and refusing, libraries": corrected "only ships as an ES module you must bundle" to name CommonJS and bare-specifier imports.
- `02-planning-a-javascript-project.md`, new "Check your understanding" at end: 4 questions with answers.
- `03-source-control-for-project-work.md`, "Branches, and what they are for": defined remote, `origin`, and what `-u` records.
- `03-source-control-for-project-work.md`, "When a conflict happens": added that the conflict sides swap during a rebase.
- `03-source-control-for-project-work.md`, new "Check your understanding" at end: 4 questions with answers.
- `04-project-interactive-page-widget.md`, "Hints" (localStorage `try`/`catch`): added that writes can throw too, and to guard them.
- `04-project-interactive-page-widget.md`, "Hints": new hint "Do not let your fixture data expire", with a relative-date helper.
- `04-project-interactive-page-widget.md`, new "Check your understanding" at end: 4 questions with answers.
- `05-debugging-and-fixing-reported-issues.md`, "Finding the cause": corrected the "six panels" count and added the Windows/Linux DevTools shortcut.
- `05-debugging-and-fixing-reported-issues.md`, "Finding the cause" (Bisect the history): added a `git bisect` command sequence.
- `05-debugging-and-fixing-reported-issues.md`, new "Check your understanding" at end: 4 questions with answers.
- `06-project-data-driven-dashboard.md`, "Hints" (Remember `response.ok`): added a worked `loadShifts` and `start()` example covering R2, R3, R4, and retry.
- `06-project-data-driven-dashboard.md`, "Hints" (Watch the date comparisons): added a concrete date-only versus date-time timezone example.
- `06-project-data-driven-dashboard.md`, new "Check your understanding" at end: 4 questions with answers.
- `07-project-portfolio-build-and-demo.md`, new "Check your understanding" at end: 3 questions with answers.
- No frontmatter, `course.json`, objectives, or section order was changed. Lesson 01 (overview) was not edited.

## Open questions for the course owner

- **Automated checks versus scope.** course.json puts "automated test frameworks" out of scope (node200 owns them). Both supplementary projects ship *provided* `node:test` acceptance checks that learners run but do not write, and they need a one-line `package.json` with `"type": "module"`. Confirm this is acceptable, or keep the checks instructor-only.
- **Missing image assets.** Lessons 03 and 05 reference `./img/branch-and-merge-flow.png` and `./img/defect-lifecycle.png`, but no `lessons/img/` folder exists, so both images are currently broken. Animation web102-a02 can supply the second.
- **Browser versions in lesson 05's example report** ("Chrome 141", "Firefox 143") were left as written. They are illustrative and will date. Consider a note that they are examples.
- **DevTools throttling preset names** have changed across Chrome versions ("Slow 3G" versus "3G", plus the 4G presets). Video v01 avoids naming one exact preset. Confirm the current names at recording time.
- **"`localStorage` can be unavailable entirely in private browsing"** (lesson 04 hints). This was true of older Safari versions; current browsers generally allow it in private windows. It was left as written, because the defensive advice is still correct. Consider softening the wording to "can be unavailable or blocked".
- **`file://` behavior** in lesson 02 ("`localStorage` is scoped oddly") varies by browser. It was not verified per browser, and the advice to always use `http://localhost` stands either way.
- **Truncated course description.** course.json's `description` is cut off mid-word ("manage t"). The sequencing rationale already flags this. Someone who knows the original text should restore it. This review does not touch course.json.
- **Competency meanings.** IDs (D2-S1-C02/C03/C04, D4-S1-C02/C05, D5-S1-C01, D1-S1-C02) were reused only where course.json already maps them. Their full text was not available to verify alignment wording.
