---
course_id: web100
title: "HTML / CSS Basics — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary
Strong, tester-focused course with a consistent running example (`roster.html` / Team Roster, Jordan Lee, the contact/signup form) and good "why this matters to QA" framing. Main problems are a few overstated or outdated technical claims (landmarks, `noopener`, cascade order, inline box behavior) and a missing box-model image. Biggest opportunity: hands-on "repair this broken page" practice with automated checks, so learners practice *finding* defects and not only building correct markup.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| web100-02 | "Sectioning elements: giving the page a skeleton" | Says `section` and `article` are landmarks. `article` never is; `section` is a region landmark only with an accessible name; `header`/`footer` lose landmark status when nested in `article`/`section`/`main`. | Rewrote the sentence with the role mapping and the three precise caveats. | Applied |
| web100-03 | "Links: what makes an `<a>` a real link" | `noopener` explanation is outdated: current major browsers imply `noopener` for `target="_blank"`. | Kept the advice; added that it is now a browser default and why to write it anyway. | Applied |
| web100-04 | "Error messages that are actually connected to the field" | Practice asks for static `role="alert"` text; static alerts present at page load are usually not announced, which learners may "test" and conclude is broken. | Added a paragraph on alert timing and the web101 hand-off. | Applied |
| web100-05 | "The cascade: what happens when rules conflict" | List says "roughly in this priority" with specificity first and `!important` third, but `!important` outranks specificity. | Added an explicit precedence sentence (importance, then specificity, then source order). Cascade layers and origins are intentionally not introduced. | Applied |
| web100-05 | "Display: how a box behaves in the flow" | "Two display values" then lists three; inline margin/padding described as "inconsistent". | Fixed count; described precisely (vertical margin ignored, vertical padding painted but does not affect line layout). | Applied |
| web100-05 | "The box model" | Image `./img/box-model.png` does not exist in the course folder; learners see a broken image. | Proposed: export a still from animation web100-a01 or add the asset. | Proposed |
| web100-06 | "Turning what you found into a defect report" | Example title says "below 400px" but actual says "between roughly 340px and 400px"; notes describe the cause in a slightly confusing double negative. | Proposed: align title with the range and simplify the cause sentence. | Proposed |
| web100-06 | "A basic accessibility pass" | "200% browser zoom" with no horizontal scroll merges two WCAG criteria (Resize Text at 200%, Reflow at 320 CSS px / 400%). | Proposed: name both so learners aren't told 200% is the reflow threshold. | Proposed |
| web100-04 | "Input types: let the browser do the validating" | `type="email"` validation is described as rejecting text "with no `@`"; actual rules are a bit stricter and messages vary by browser. | Proposed: "rejects text that is not shaped like an email address (for example, missing `@`)". | Proposed |

## Depth and coverage gaps
- "Inspect a rendered page and describe what is wrong with it in reproducible terms": only one worked defect report, at the end of the course. Lessons 02 to 05 each describe a reportable defect but never show the report. Video v02 and project x02 add practice.
- "Write semantic HTML that gives a page a testable, accessible structure": no "find the defects" exercise; all practice is build-from-scratch. Project x01 adds a repair exercise with planted defects.
- "Build form controls that are labelled, keyboard reachable, and straightforward to identify in a test": the testing-library mention (`getByLabelText`) is not connected to any example of a test; project x01 includes an optional Playwright `getByLabel`/`getByRole` sketch.
- "Apply CSS selectors, the cascade, and the box model to control page layout": no worked specificity calculation with numbers (for example 0-1-0 vs 1-0-0), and no mention of DevTools' struck-through overridden declarations, which is the most practical cascade debugging aid.
- "Build a responsive layout and check it against basic accessibility expectations": no focus-visible styling guidance; removing outlines with `outline: none` is a top real-world defect.
- No lesson had a self-check; added "Check your understanding" to lessons 02 to 06.

## Proposed additional projects
- x01 Roster Page Structure Repair (drafted; zero-dependency `node --test` structure suite verified: 8/8 pass on a reference page, fails on a page with a missing `alt`; optional Playwright + axe sketch not run).
- x02 Responsive Defect Hunt and Report Pack (drafted; zero-dependency layout/contrast suite verified: 6/6 pass on a reference fix, 5/6 fail on the starter).
- Browser support table audit: convert a screenshot of a support matrix into an accessible table and verify it with a screen reader.
- "Spot the fake controls": a page with 10 controls, some native and some div-based; learner classifies each by keyboard behavior alone and files reports.

## Video and animation opportunities
- Keyboard-only form check (lesson 04, screencast). Drafted: `media/video-01-keyboard-only-form-check.md`.
- Find the breaking width and write the defect (lessons 05 to 06, screencast). Drafted: `media/video-02-writing-a-reproducible-layout-defect.md`.
- Box model layering, content-box vs border-box (lesson 05, explainer animation). Drafted: `media/animation-01-the-box-model-unfolds.md` (also a source for the missing image).
- Same page, two accessibility trees: div soup vs semantic markup side by side (lesson 02, explainer animation). Not drafted.
- Specificity scoreboard: rules competing for one element (lesson 05, explainer animation). Not drafted.
- Flex-wrap and `auto-fit` reflow as the viewport narrows (lesson 06, explainer animation). Not drafted.

## Assessment ideas
- Markup triage quiz: 10 snippets, learner labels each "correct" or names the defect and lesson rule.
- Predict-the-color specificity items with mixed class/ID/element/`!important`.
- Box model arithmetic items (both `box-sizing` values).
- Defect report rubric (title specificity, steps, expected/actual, width, cause) reused across courses.

## Changes applied in this pass
- `catalogue/courses/web100/lessons/02-semantic-html-and-document-structure.md`, "Sectioning elements: giving the page a skeleton": corrected which elements are landmarks and when.
- `catalogue/courses/web100/lessons/03-text-links-media-and-tables.md`, "Links: what makes an `<a>` a real link": updated `noopener` explanation for current browser defaults.
- `catalogue/courses/web100/lessons/04-forms-labels-and-accessible-inputs.md`, "Error messages that are actually connected to the field": added `role="alert"` timing note and web101 hand-off.
- `catalogue/courses/web100/lessons/05-css-selectors-cascade-and-box-model.md`, "The cascade: what happens when rules conflict": clarified precedence order.
- `catalogue/courses/web100/lessons/05-css-selectors-cascade-and-box-model.md`, "Display: how a box behaves in the flow": fixed value count and inline margin/padding description.
- Lessons 02, 03, 04, 05, 06: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Missing asset `catalogue/courses/web100/lessons/img/box-model.png`: add it, or should the editor use a still from animation a01?
- Should the course name WCAG criteria (1.4.3 contrast, 1.4.4 resize text, 1.4.10 reflow) explicitly, or keep the plain-language checklist?
- Chrome settings path for font size and DevTools labels (device toolbar, Accessibility pane) are written from general knowledge and may differ by version; verify before recording.
- Project x01's Playwright/axe sketch was not executed in this pass (requires `npm install` and browser download).
