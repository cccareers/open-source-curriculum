---
course_id: ops100
title: "Git / Chrome Devtools — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
A practical, well-ordered tooling course with a consistent cart running example (`fix/cart-quantity`, the out-of-stock commit message, `cart.js` errors, `/api/cart/update`) that carries from Git through DevTools to the defect report and the deploy project. The text is mostly accurate; the clearest error was a backwards description of the Call Stack pane. Biggest opportunities: hands-on Git *recovery* practice against a realistic shared remote (the lessons describe revert, reset, and reflog but never let learners feel the consequence on a teammate), and verifiable artifacts for the DevTools lessons.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ops100-06 | "Sources: stepping through actual execution" | Call Stack described as "top to bottom for what's about to happen next", which is wrong: frames are callers, not future steps. | Rewrote: top frame is the paused function; frames below are its callers; read bottom-up for the trigger. | Applied |
| ops100-02 | "Why a QA engineer needs a real shell" | `cd $_` used with no explanation. | Added an inline comment. | Applied |
| ops100-02 | "Cloning a project and running it locally" | No mention of `npm ci`, which is what CI uses and the cleanest way to match the lockfile. | Added a parenthetical. | Applied |
| ops100-04 | "Working with a remote" | Says `pull` always merges; newer Git asks about divergent branches and teams may set `pull.rebase`. | Added a short note. | Applied |
| ops100-04 | "Merging and merge conflicts" | No escape hatch when a merge goes wrong. | Added `git merge --abort` and the `git status` mid-merge cue. | Applied |
| ops100-07 | "Network: what's actually being requested, and how it went" | No mention of "Disable cache", so learners see cached sizes and misjudge first-visit weight. | Added a parenthetical. | Applied |
| ops100-03 | "Inspecting history" | Uses `src/cart.ts` while lessons 06 to 08 use `cart.js`. | Proposed: align file names across the course. | Proposed |
| ops100-05 | "Reading a diff like a reviewer, not an author" | The example diff (zeroing out-of-stock totals) contradicts the lesson 03 commit message (count out-of-stock at their real quantity). Could be a deliberate review finding, but it is not framed as one. | Proposed: frame it explicitly as "the diff disagrees with the commit message; flag it". | Proposed |
| ops100-09 | "Definition of done" | "Lint/test scripts ... passed ... against the live deployment" is not meaningful for lint; post-deploy checks are smoke checks against the URL. | Proposed: "re-run the smoke checks against the live URL". | Proposed |
| ops100-07 | "Lighthouse: a structured audit in one click" | Category list and mobile throttling defaults change between Lighthouse versions. | Proposed: add "categories as of the current Chrome version". | Proposed |

## Depth and coverage gaps
- "Use Git to record, inspect, and recover work": recovery is described but never practised against a shared remote with a teammate; project x01 adds a verified lab.
- "Work on a shared repository using branches, merges, and pull requests": no coverage of `git log --graph --oneline --all` for seeing divergence, or of protected branches.
- "Use Chrome DevTools to inspect and debug a running page": no practice page is supplied for lesson 06 practice step 3 ("ask your instructor"); video v01 specifies one.
- "Audit a page's network activity, performance, and accessibility from the browser": no guidance on capturing evidence (HAR export, Performance trace export, Lighthouse JSON/HTML report) for attaching to tickets.
- "Deploy a site publicly and verify it behaves as expected": no example of an automated post-deploy smoke check; project x02 adds one, including the GitHub Pages `/<repo>/` root-relative link pitfall.
- "Set up a local development environment that mirrors how the project really runs": `.nvmrc` mentioned but `nvm use` without arguments (which reads it) is not shown.
- Added "Check your understanding" to lessons 02 to 08 (lesson 09 is the project).

## Proposed additional projects
- x01 Cart Rescue: Revert a Bad Push and Recover a Deleted Fix (drafted; setup script plus a read-only `node --test` checker, verified: 2/7 on a fresh lab, 7/7 after a reference rescue).
- DevTools evidence pack: given a planted-bug demo page, produce a defect report with a HAR excerpt, a breakpoint screenshot, and a Lighthouse finding. Not drafted.
- x02 Post-Deploy Smoke Check for Your Public Site (drafted, `projects/02-post-deploy-smoke-check.md`; zero-dependency `node --test` suite with an in-process local server, verified 6/6 against a reference implementation; no internet needed).
- PR documentation review drill: a provided PR with three code/doc mismatches to find and comment on. Not drafted.

## Video and animation opportunities
- Console to defect report on a planted cart bug (lessons 06 to 08, screencast). Drafted: `media/video-01-console-to-defect-report.md`.
- Revert vs reset on a shared branch, plus reflog rescue (lessons 03 to 04, explainer animation). Drafted: `media/animation-01-revert-vs-reset.md`.
- Resolving a real merge conflict, including `git merge --abort` and asking the other author (lesson 04, screencast). Drafted: `media/video-02-resolving-a-merge-conflict.md`.
- Network waterfall and throttling: finding the one slow request (lesson 07, screencast). Not drafted.
- Deploy-and-verify walkthrough on a static host (lesson 09, screencast). Not drafted.

## Assessment ideas
- Command-choice quiz: scenario cards ("pushed a bad commit to shared main", "unstaged change to discard") with the correct command and why.
- Stack-trace and Call Stack reading items.
- Defect report rubric shared with web100/web101 (title, environment, steps, expected/actual, evidence, severity).
- Lighthouse finding rewrite: weak to strong feedback, graded on specificity.

## Changes applied in this pass
- `catalogue/courses/ops100/lessons/02-command-line-and-local-development-setup.md`, "Why a QA engineer needs a real shell": explained `$_`.
- `catalogue/courses/ops100/lessons/02-command-line-and-local-development-setup.md`, "Cloning a project and running it locally": added `npm ci` note.
- `catalogue/courses/ops100/lessons/04-branching-merging-and-team-workflow.md`, "Working with a remote": noted `pull.rebase` and the divergent-branches prompt.
- `catalogue/courses/ops100/lessons/04-branching-merging-and-team-workflow.md`, "Merging and merge conflicts": added `git merge --abort`.
- `catalogue/courses/ops100/lessons/06-devtools-elements-console-and-sources.md`, "Sources: stepping through actual execution": corrected the Call Stack description.
- `catalogue/courses/ops100/lessons/07-devtools-network-performance-and-accessibility.md`, "Network: what's actually being requested, and how it went": added "Disable cache" note.
- Lessons 02 to 08: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Missing assets: `img/git-branch-merge.png` (lesson 04) and `img/devtools-panels.png` (lesson 06); no course in the catalogue has an `img/` folder yet, so this may be a pending asset pass.
- DevTools labels ("Fetch/XHR" filter, "Disable cache", Lighthouse categories) are from current Chrome and may shift between versions; verify before recording.
- The ops100-x01 lab needs Git 2.28+ (for `--initial-branch`) and bash; Windows learners need WSL or Git Bash. Confirm the supported setup.
- Should lesson 05's out-of-stock diff stay as a deliberate contradiction of lesson 03's commit message (good review practice) or be aligned?
