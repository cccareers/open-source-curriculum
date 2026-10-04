---
course_id: alg100
title: "Intro to Data Structures and Algorithms — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary
An unusually well-targeted DSA course for QA learners: every structure and algorithm is tied back to test design, and the defect-tracker running example (`DEF-101`, `defectsById`, `knownDefects`, `isValidOrder`) carries cleanly into the lesson 07 capstone. The main weaknesses were technical traps the text didn't name (string vs numeric comparison in binary search and `.sort()`, recursion and `shift()` limits, `getComputedStyle` vs hex colors, the direction of the import graph), most now fixed in place. Biggest opportunity: runnable projects that make learners *measure* cost and boundary behavior instead of only reading about it.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| alg100-03 | "Why the shape of your data matters" | Implied maps cannot answer positional questions at all; ignored that `Map` and objects keep insertion order (with integer-like key exception). | Added a parenthetical on `Map`/object iteration order. | Applied |
| alg100-04 | "Binary search: exploit sorted order" | String `<` on ids silently breaks at `DEF-1000`/`DEF-99`; the lesson's own ids would break as the tracker grows. | Added a paragraph on comparison-order mismatch and numeric comparison or zero-padding. | Applied |
| alg100-05 | "Why sorting is worth implementing by hand" | No warning that default `.sort()` sorts numbers as strings and mutates in place. | Added a warning with examples. | Applied |
| alg100-05 | "What 'cost' buys you as a developer" | Cost claims had no concrete numbers. | Added measured comparison counts (bubble 999,000 vs merge about 5,000 at n=1,000; re-verified in this pass). | Applied |
| alg100-06 | "Breadth-first traversal: go wide before you go deep" | "Queue" and "call stack" used without definitions; no note on `shift()` cost or recursion depth limits. | Defined both; added a scale note. | Applied |
| alg100-06 | "Walking the DOM to isolate a failure" | `pageRoot` undefined; real DOM `style` vs computed style and `rgb()` format would make the predicate never match. | Added a paragraph explaining both. | Applied |
| alg100-06 | "Traversing a graph: dependency chains" | Claimed the same walk from `auth.js` finds what's downstream, but `imports` points the other way. | Added `reverseGraph` and the correct output; fixed a stray leading space. | Applied |
| alg100-07 | "Maintaining a database of known defects" | `regressionCasesFromDefects` produced cases `runCases` could not read (`input` vs `order`, no expected value); defects for two different functions mixed in one list. | Added `expectValid`, aligned field names, and explained one list per function. | Applied |
| alg100-02 | "A second worked example" | `isValidUsername(null)` throws; the decomposition never asked about non-string input. | Added a "fifth bucket" paragraph. | Applied |
| alg100-04 | "Tracing the steps" | Image `./img/binary-search-steps.png` does not exist. | Proposed: produce from video v01's whiteboard frames. | Proposed |
| alg100-07 | "Practice" step 4 | Suggests a floating-point defect (`0.1 + 0.2`) but `isValidOrder` uses `===`, so the learner's replay will *fail* with no guidance on whether that is expected. | Proposed: one sentence saying a failing replay of an unfixed defect is the expected result. | Proposed |

## Depth and coverage gaps
- "Implement a sort and explain what it costs": no discussion of stability (equal keys keeping their order), which matters when sorting defects by severity then date.
- "Choose a data structure that fits the data you are holding": no practice measuring the cost difference (array `.includes` vs `Set.has`) at scale; project x01 adds measured comparisons for search.
- "Traverse a tree or graph structure": no worked iterative DFS with an explicit stack; animation a01 visualises stack vs queue; project x02 requires an iterative BFS on a 50,000-node chain.
- "Use complexity and edge-case reasoning to design test data": no guidance on generating large test data programmatically (`Array.from({ length })`), and `Array(10000).fill({ price: 1 })` shares one object across all items, a subtle trap worth naming.
- "Decompose a problem into steps a computer can follow": strong; check-your-understanding blocks now close lessons 02 to 07.

## Proposed additional projects
- x01 Defect Store and Numeric ID Search (drafted; `node --test` suite verified 7/7 against a reference solution).
- x02 Change Blast Radius: Which Tests Should Run? (drafted; suite verified 7/7, including a 50,000-module chain under 1s).
- Severity-then-date stable sort for a triage view, with tests that detect an unstable sort.
- Test data generator: produce boundary and large datasets for `isValidOrder` from a spec object.

## Video and animation opportunities
- Binary search boundary bugs and the string-comparison trap (lesson 04, screencast). Drafted: `media/video-01-binary-search-boundaries.md`.
- DFS vs BFS with visible stack and queue, plus cycle detection (lesson 06, explainer animation). Drafted: `media/animation-01-bfs-vs-dfs.md`.
- Bubble vs merge comparison counts racing on growing inputs (lesson 05, explainer animation). Not drafted.
- Smoke-then-regression pipeline using `validateChange` (lesson 07, screencast). Not drafted.
- Map vs array lookup as "look in the labelled drawer" vs "check every drawer" (lesson 03, whiteboard). Not drafted.

## Assessment ideas
- Trace tables: learner fills `low`/`mid`/`high` for a given search.
- Predict comparison counts for bubble/merge at n=10, 20, 40, then run and compare.
- "Pick the structure" scenario cards with a one-sentence justification.
- Capstone rubric for lesson 07 practice: each test case labelled with the procedure step that produced it.

## Changes applied in this pass
Note: most edits below were applied earlier in this pass by a session that ended before writing this review; they are listed from the current lesson text.
- `catalogue/courses/alg100/lessons/02-computational-thinking-and-problem-decomposition.md`, "A second worked example: decomposing a validation function": added the non-string-input bucket paragraph.
- `catalogue/courses/alg100/lessons/03-arrays-lists-and-maps-in-javascript.md`, "Why the shape of your data matters": added iteration-order parenthetical.
- `catalogue/courses/alg100/lessons/04-linear-and-binary-search.md`, "Binary search: exploit sorted order": added the string-comparison trap paragraph.
- `catalogue/courses/alg100/lessons/05-sorting-and-comparing-approaches.md`, "Why sorting is worth implementing by hand": added default `.sort()` warning.
- `catalogue/courses/alg100/lessons/05-sorting-and-comparing-approaches.md`, "What 'cost' buys you as a developer": added measured comparison counts.
- `catalogue/courses/alg100/lessons/06-trees-and-graph-traversal.md`, "Breadth-first traversal: go wide before you go deep": defined queue and call stack; added scale note.
- `catalogue/courses/alg100/lessons/06-trees-and-graph-traversal.md`, "Walking the DOM to isolate a failure": added `pageRoot`/computed-style paragraph.
- `catalogue/courses/alg100/lessons/06-trees-and-graph-traversal.md`, "Traversing a graph: dependency chains": added `reverseGraph` example and output; removed a stray leading space.
- `catalogue/courses/alg100/lessons/07-complexity-edge-cases-and-test-data-design.md`, "Maintaining a database of known defects": added `expectValid`, aligned field names with `runCases`, explained per-function defect lists.
- Lessons 02 to 07: appended a "Check your understanding" block with answers.

## Open questions for the course owner
- Missing asset: `lessons/img/binary-search-steps.png`.
- Projects use ES modules (`"type": "module"`) while lessons show plain functions; confirm the module convention for the pathway (node100 uses CommonJS).
- Should the course mention stable sorting and `Array.prototype.toSorted()` (non-mutating, newer runtimes)? Not added, to keep scope.
