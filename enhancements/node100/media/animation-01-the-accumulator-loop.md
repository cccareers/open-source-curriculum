---
course_id: node100
media_id: node100-a01
type: animation-storyboard
title: "The Accumulator Loop, One Pass at a Time"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - node100-04
  - node100-06
objectives:
  - Repeat work with the looping constructs Node provides
  - Model data with objects and arrays
competency_ids:
  - D5-S1-C02
---

## Concept and misconception it fixes
Learners often declare the accumulator *inside* the loop (so it resets to `0` every pass) or believe `for...of` gives them an index. This animation shows the accumulator living outside the loop body, surviving every pass, while the loop variable `result` is created fresh for each element and disappears at the closing brace.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Okabe-Ito palette: array cells in neutral grey `#999999`; the current element highlighted with a blue `#0072B2` outline; a "fail" status uses vermillion `#D55E00` plus a ✗ glyph; "pass" uses bluish green `#009E73` plus a ✓ glyph (shape always accompanies color).
- The accumulator `failureCount` is a labelled box sitting *above* a dashed rounded rectangle labelled `{ loop body }`.
- The loop variable `result` is a card that slides into the dashed rectangle and fades out at the end of each pass.
- Code panel on the left shows the lesson 06 loop; the active line has a yellow `#F0E442` gutter marker plus a ▶ arrow.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | Code panel with `let failureCount = 0;` and the `for (const result of results)` loop. Right: three result cards (fail, pass, pass) in a row. | ▶ on `let failureCount = 0;`; the `failureCount: 0` box drops in above the dashed body. | "The accumulator is declared once, before the loop, so it can survive every pass." |
| 2 | 10s | Pass 1. | Card 1 (✗ fail) copies down into the dashed body, labelled `result`. ▶ moves to `if (result.status === "fail")`; the comparison renders as `"fail" === "fail" → true`. | "Pass one: `result` is the first object. Its status is fail, so the condition is true." |
| 3 | 6s | Increment. | ▶ on the increment line; `failureCount` box flips 0 → 1 with a counter roll. | "The accumulator goes from zero to one." |
| 4 | 4s | End of pass 1. | `result` card fades out at the closing brace; the `failureCount: 1` box stays. | "At the closing brace, `result` is gone. `failureCount` is not." |
| 5 | 10s | Pass 2 (✓ pass). | New `result` card; comparison renders `"pass" === "fail" → false`; increment line greyed and skipped; counter stays 1. | "Pass two: false, so we skip the increment. The count stays at one." |
| 6 | 8s | Pass 3 (✓ pass). | Same as scene 5, faster. | "Pass three: same story." |
| 7 | 6s | Loop exits. | ▶ on `console.log(failureCount)`; box pulses; terminal shows `1`. | "One checkable answer, built one pass at a time." |
| 8 | 12s | Misconception replay: code moves `let failureCount = 0;` inside the loop body. | Replay with the box now inside the dashed body; it resets to 0 at the start of every pass and vanishes at each closing brace; the final `console.log` shows `ReferenceError`. | "Declare it inside the loop and it resets every pass, then disappears at the brace. That's block scope from lesson 02." |
| 9 | 8s | Summary card. | Three bullets build: "Accumulator outside", "Loop variable fresh each pass", "One answer after the loop". | "Outside, fresh each pass, one answer at the end." |

## Interaction variant (optional)
Build as a step-through (H5P Course Presentation or a small HTML page) with "Next pass" and "Previous pass" buttons and an editable `results` array so learners can add a fourth result and predict the final count before stepping.

## Production notes
- Keep code font at least 28px at 1080p; animate only one thing at a time.
- Narration and captions must be timed so the comparison text is on screen before it is read.
- Reuse the same three `results` objects from lesson 06 so learners recognise the data.
