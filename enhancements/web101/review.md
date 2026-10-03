---
course_id: web101
title: "JavaScript in the DOM — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
A coherent, tester-minded course: every lesson ties back to "what a test or a bug report needs", and the todo list, signup form, and load-user examples recur cleanly through the capstone. The most serious problem was in lesson 05's `showErrors` example, which pointed `aria-describedby` at an id that never existed and never cleared stale ARIA state, so it taught the exact defect the lesson warns about. Biggest opportunity: pure, unit-testable versions of the course's logic (validation, filtering) with runnable tests, so the "verify" half of the course has an automated counterpart.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| web101-05 | "Displaying errors so a user (and a screen reader) can find them" | `aria-describedby` set to `${field}-error` but the message element was never given that id; stale `aria-invalid` never removed. | Added `message.id`, added clearing of `aria-invalid`/`aria-describedby`, and explained both in the bullets. | Applied |
| web101-03 | "Reading and changing content" | "`<script>`-adjacent attack surface" is vague; `<script>` inserted via `innerHTML` does not execute, event-handler attributes do. | Replaced with a precise explanation and the `onerror` example. | Applied |
| web101-03 | "Changing structure: creating, inserting, removing nodes" | `insertBefore` comment says "add at the start" right after appending the same node; learners think it now exists twice. | Comment now says it moves the node. | Applied |
| web101-04 | "Attaching a listener" (events table) | `change` described only as "loses focus"; checkboxes, radios, and `select` fire it immediately. | Expanded the table row. | Applied |
| web101-02 | "Functions: three ways to write one" | Typo "no its own `this`". | Fixed. | Applied |
| web101-07 | "Practice" step 2 | Says inspecting `event.target` will reveal why the wrong row was targeted, but in the planted bug `event.target` is correct and the captured index is stale. | Reworded to inspect the captured index against `list.children`. | Applied |
| web101-05 | "Reading form values" | The signup form markup has no `<label>`s, contradicting web100 lesson 04 and making label-based tests impossible. | Proposed: add `<label for>` to the three inputs (code block edit, owner decision). | Proposed |
| web101-04 | "Event flow: capture, target, and bubble" | Image `./img/dom-event-flow.png` does not exist. | Proposed: produce from animation web101-a01. | Proposed |
| web101-05 | "Writing validation logic" | `email.includes("@")` is presented without caveat; learners may copy it as real validation. | Proposed: one sentence noting it is a deliberately minimal rule (project x01 hardens it). | Proposed |
| web101-06 | "Practice" | Depends on jsonplaceholder.typicode.com being up; no offline fallback. | Proposed: offer a local `user.json` file alternative. | Proposed |

## Depth and coverage gaps
- "Validate form input and report errors to the user clearly": no worked example of testing the validation function in isolation from the DOM; project x01 adds a pure module with a `node --test` suite.
- "Fetch data asynchronously and handle the failure cases": failure handling shown for HTTP status only; no example of a JSON parse failure or a timeout (`AbortController`). Covered partly by video v01 (network block).
- "Handle user events while keeping interactive behaviour reachable from the keyboard": no mention of visible focus styling or of `:focus-visible`; no example of moving focus to the first invalid field after submit.
- "Debug a broken page in the browser and describe the defect precisely": no coverage of the Network panel as a debugging source (status codes, response bodies), although lesson 06 promises it "in the next lesson".
- "Check your own interactive page against its expected behaviour and record what fails": no template for the verification log; project x02 supplies one (spec line, how tested, result, evidence, defect id).
- No lesson had a self-check; added "Check your understanding" to lessons 02 to 08.

## Proposed additional projects
- x01 Signup Form: Testable Validation and Accessible Errors (drafted; `node --test` suite verified, 9/9 pass against a reference solution; Playwright stretch sketch not run).
- x02 Filtered Task List: Testable Logic and a Verification Log (drafted, `projects/02-task-list-logic-and-verification-log.md`; `node --test` suite verified 8/8 against a reference implementation).
- Debugging case file: a provided broken todo page with five planted bugs (null selector, missing `preventDefault`, stale index, missing `response.ok`, div toggle); learner files five located defect reports. Not drafted.

## Video and animation opportunities
- Async ordering, `response.ok`, and blocked requests (lessons 06 to 07, screencast). Drafted: `media/video-01-why-fetch-shows-undefined.md`.
- Bubbling and delegation, including keyboard Enter and the div that never gets focus (lesson 04, explainer animation). Drafted: `media/animation-01-event-bubbling-and-delegation.md`.
- Breakpoints, Scope panel, and conditional breakpoints on the stale-index bug, showing both symptoms (wrong row removed, and a TypeError past the end) (lesson 07, screencast). Drafted: `media/video-02-breakpoints-on-the-stale-index-bug.md`.
- Live vs static collections shrinking during a loop (lesson 03, explainer animation). Not drafted.
- Spec-first verification walkthrough of the lesson 08 page (talking head plus screencast). Not drafted.

## Assessment ideas
- Predict-the-log-order items for promises, `await`, and `setTimeout`.
- Stack-trace reading items: given a trace, name the failing function, line, and the likely null selector.
- Defect report rubric shared with web100 and ops100 (title, steps, expected, actual, location, severity).
- Practical: given a page, find and report three keyboard-accessibility failures.

## Changes applied in this pass
- `catalogue/courses/web101/lessons/02-javascript-essentials-for-the-browser.md`, "Functions: three ways to write one": fixed comment typo.
- `catalogue/courses/web101/lessons/03-selecting-and-changing-dom-nodes.md`, "Reading and changing content": made the `innerHTML` XSS explanation precise.
- `catalogue/courses/web101/lessons/03-selecting-and-changing-dom-nodes.md`, "Changing structure: creating, inserting, removing nodes": clarified that `insertBefore` moves an existing node.
- `catalogue/courses/web101/lessons/04-events-and-user-interaction.md`, "Attaching a listener": corrected the `change` event description.
- `catalogue/courses/web101/lessons/05-forms-validation-and-error-messages.md`, "Displaying errors so a user (and a screen reader) can find them": fixed the missing message id and stale ARIA state in `showErrors`, and updated the explanatory bullets.
- `catalogue/courses/web101/lessons/07-debugging-javascript-in-the-browser.md`, "Practice" step 2: pointed learners at the stale captured index rather than `event.target`.
- Lessons 02 to 08: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Should the lesson 05 signup markup gain `<label>`s? This pass did not change that code block, so the course stays consistent with lesson 08's build.
- Missing assets: `lessons/img/dom-event-flow.png` (lesson 04).
- DevTools menu wording ("Block request URL", "Add conditional breakpoint") is from general knowledge of Chrome and may vary by version.
- jsonplaceholder.typicode.com availability and its 404 response for `/users/999999` were not live-checked in this pass.
