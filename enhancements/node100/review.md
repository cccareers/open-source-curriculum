---
course_id: node100
title: "Introduction to Programming with Node JS — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary
A tight, well-sequenced course whose every lesson points at the lesson 07 assertion script; voice and examples (test results, `square`, `slugify`, `mathUtils`) are consistent. The biggest problems were two correctness traps in lesson 07: a worked example whose expected value is silently wrong, and a "break it on purpose" practice step that would not actually produce a failure. Biggest opportunity: more end-to-end practice that combines loops, data shapes, and assertions on realistic QA data.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| node100-07 | "Checking another program's behavior, not just a bare function" | Case `{ input: "  Trim   Me  ", expected: "trim---me" }` is wrong (`slugify` returns `"trim-me"`). The text hints learners should trace it but never resolves it, so a learner can conclude `slugify` is buggy. | Added a paragraph resolving the trace, stating the 2 passed / 1 failed output, and naming "is the code wrong or is the expected value wrong?" as the lesson. | Applied |
| node100-07 | "Practice" step 3 | Suggested break (change `clamp`'s `<` to `<=`) produces identical output at the boundary, so no check fails and the learner thinks their checker is broken. | Replaced with breaks that are actually detectable and explained why the original one is not. | Applied |
| node100-03 | "Truthy and falsy values" | "Exactly six values" is inaccurate (`-0`, `0n`, and `document.all` are also falsy). | Reworded to "six values you will meet constantly" plus a parenthetical on `-0` and `0n`. | Applied |
| node100-03 | "Practice" step 1 | Ranges "1 and 14 inclusive" / "15 and 24 inclusive" leave gaps for non-integers (0.5, 14.5 fall through to "hot"). | Proposed: phrase as `celsius < 15` and `celsius < 25`, or state inputs are whole numbers. | Proposed |
| node100-07 | "What an assertion actually is" | `require("assert")` is fine, but newer Node docs prefer `require("node:assert")` and recommend strict mode; learners will meet both. | Proposed: one-sentence note that `node:assert` and `assert` are the same module. | Proposed |
| node100-05 | "Decomposing a larger problem" | `applyBulkDiscount` uses floating-point math; learners asserting `strictEqual(applyBulkDiscount(110.1), 99.09)` will hit rounding failures with no explanation. | Proposed: short note on floating point and comparing rounded values or integer cents. | Proposed |
| node100-06 | "Practice" step 2 | Asks learners to use `try`/`catch` "you don't need to understand yet", but it is not introduced until lesson 07. | Proposed: suggest commenting out the line after observing the error instead. | Proposed |

## Depth and coverage gaps
- No lesson ends with a self-check; added "Check your understanding" blocks to lessons 02 to 07 (all objectives).
- "Run JavaScript with Node and declare variables with the right scope": no coverage of reading a stack trace (file:line) from a Node error, the first thing a QA engineer does with a failing script.
- "Write a small assertion script that checks another program's behaviour": the course stops at hand-rolled loops; a short bridge to `node --test` would prepare learners for real runners (projects x01/x02 do this without changing the objective).
- "Write a small assertion script that checks another program's behaviour": no mention of process exit codes; CI tools read the exit code, not the console text. Covered in project x01.
- "Break a larger problem into small, independently testable functions": no worked example of choosing test cases (boundaries, empty input, invalid input) for a decomposed function. Covered by the projects and video v01.
- "Model data with objects and arrays": no guidance on what to do when an entry does not match the declared shape (validation). Added a check question; project x01 requires throwing on unknown status.

## Proposed additional projects
- x01 Test Results Summarizer (drafted, `projects/01-test-results-summarizer.md`, verified acceptance tests, 6 passing against a reference solution).
- x02 Response Log Checker (drafted, `projects/02-response-log-checker.md`, verified acceptance tests, 5 passing against a reference solution).
- Retry helper: implement `withRetries(fn, maxRetries)` (reuses `maxRetries`/`attemptCount` from lesson 02 and the `while` loop from lesson 04) and assert the attempt count.
- CSV row validator: check each row of a small hard-coded CSV string against a shape comment and report invalid rows.

## Video and animation opportunities
- Arrange/act/assert with `slugify`, including the wrong-expected-value moment (lesson 07, screencast). Drafted: `media/video-01-your-first-assertion-script.md`.
- Truthy/falsy "zero is not missing" bug (lessons 02 to 03, hybrid). Drafted: `media/video-02-the-zero-is-not-missing-trap.md`.
- Accumulator loop pass by pass, plus the "declared inside the loop" misconception (lessons 04, 06, explainer animation). Drafted: `media/animation-01-the-accumulator-loop.md`.
- Block scope as nested boxes that appear and vanish at braces (lesson 02, explainer animation). Not drafted.
- `const` binding vs object contents: an arrow that cannot move while the object it points to changes (lesson 06, whiteboard). Not drafted.
- try/catch control flow jumping to `catch` and back into the loop (lesson 07, explainer animation). Not drafted.

## Assessment ideas
- Predict-the-output items for each lesson (scope errors, truthy/falsy, loop traces).
- "Find the wrong test" item: give a checker with one wrong expected value; learner identifies which and why.
- Mutation exercise rubric for lesson 07: learner makes three deliberate breaks; checker must catch at least two; learner explains the one it missed.
- Short code review: a tangled function to decompose, graded on naming and purity.

## Changes applied in this pass
- `catalogue/courses/node100/lessons/03-conditional-logic-and-boolean-expressions.md`, "Truthy and falsy values": corrected "exactly six" falsy values claim.
- `catalogue/courses/node100/lessons/07-your-first-assertion-script.md`, "Checking another program's behavior, not just a bare function": added paragraph resolving the `"trim---me"` expected-value trap and showing the correct output.
- `catalogue/courses/node100/lessons/07-your-first-assertion-script.md`, "Practice" step 3: replaced an undetectable deliberate break with detectable ones and explained why.
- Lessons 02, 03, 04, 05, 06, 07: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Should the `"trim---me"` case stay as a deliberate trap (now resolved in text) or be corrected in the code block itself? This pass kept the trap and added the resolution.
- Course uses CommonJS (`require`/`module.exports`). Is that the intended module system for the pathway, given newer Node tooling defaults increasingly to ES modules?
- Projects use `node:test`, which needs Node 18+. Confirm the minimum Node version learners are told to install.
- `course.json` `description` appears truncated ("breaking larger"); not edited per the rules.
