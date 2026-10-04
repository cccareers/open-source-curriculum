---
course_id: web101
media_id: web101-v02
type: video-script
title: "Breakpoints, Not Guesses: Debugging 'Delete Removes the Wrong Row'"
format: screencast
target_runtime: "7 min"
related_lessons:
  - web101-07
  - web101-04
objectives:
  - Debug a broken page in the browser and describe the defect precisely
competency_ids:
  - D2-S1-C01
  - D3-S1-C02
---

## Purpose
After watching, the learner can reproduce an intermittent UI bug, pause inside the handler with a breakpoint (including a conditional one), compare live values in the Scope pane, and write the located five-part defect report from lesson 07.

## Audience and prerequisites
web101 learners at lesson 07. Chrome, and the lesson 07 practice page with the planted bug: the delete handler uses an index captured when the list was first built.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Todo page with three rows: "Write test cases", "Verify DOM changes", "File defect report". | "The ticket says: 'Delete sometimes removes the wrong item.' 'Sometimes' is the important word. Before we open any tools, we make it happen on purpose." |
| 0:20 | Click Delete on row 1; row 1 disappears. Click Delete on "Verify DOM changes"; "File defect report" disappears instead. | "Delete the first row: fine. Now delete 'Verify DOM changes'. Instead, 'File defect report' vanished. Reproduced. I'm writing down those exact steps now, before I forget them." |
| 0:50 | Notes panel: "1. Load page (3 items). 2. Delete 'Write test cases'. 3. Delete 'Verify DOM changes'. Actual: 'File defect report' removed; 'Verify DOM changes' remains." | "Narrowing: does it happen on the first delete? No. Only after an earlier delete. That's already a strong hint that something is remembering old positions." |
| 1:15 | DevTools > Sources > `app.js`. The handler: `button.addEventListener("click", (event) => { list.children[rowIndex].remove(); });` inside a `forEach((row, rowIndex) => ...)` that ran at page load. | "Open Sources and find the delete handler. Each button's listener uses `rowIndex`, a value captured once when the page loaded." |
| 1:40 | Click the line-number gutter on the `remove()` line; a blue marker appears. Reload and repeat steps 1 and 2. Execution pauses on step 2's click. | "Set a breakpoint on the line that removes the row, reload, and follow the steps again. On the second delete, the page freezes, paused right there." |
| 2:05 | Scope pane: `rowIndex: 1`. Console (while paused): `list.children[1].textContent` → "File defect report Delete"; `event.target.closest("li").textContent` → "Verify DOM changes Delete". | "Now read real values instead of guessing. `rowIndex` is 1, captured when 'Verify DOM changes' was the second row. But after the first delete, index 1 is 'File defect report'. And the button I actually clicked is inside 'Verify DOM changes'. The click target is right. The index is stale." |
| 2:45 | Step over (F10). "File defect report" disappears in the page behind the overlay. | "Step over the line and watch it happen. The stale index removes whatever row now sits at position 1. That's the whole bug, observed rather than assumed." |
| 3:05 | Reload; delete row 1, then delete "File defect report" (captured index 2). Console: `TypeError: Cannot read properties of undefined (reading 'remove')`. | "Same bug, different symptom: the last row's stored index now points past the end, so this time it throws. One cause, two symptoms. Your report should mention both." |
| 3:25 | Right-click the gutter > "Add conditional breakpoint…" with `list.children[rowIndex] !== event.currentTarget.closest("li")`. Resume; repeat steps; it pauses only on the bad click. | "If this happened once in fifty clicks, an ordinary breakpoint would pause every time. A conditional breakpoint pauses only when the row at the stored index isn't the row that holds the clicked button: the exact moment the bug happens." |
| 4:00 | Fix: replace with delegated `list.addEventListener("click", (event) => { if (event.target.matches(".delete-btn")) event.target.closest("li").remove(); });`. Reload and rerun the exact repro steps. | "The fix reads the row at click time, using delegation from lesson 04. Then the most skipped step: rerun the same repro steps exactly. 'Verify DOM changes' is the one that's removed. Fixed, and confirmed." |
| 4:35 | Bug tracker form, filled: Steps; Expected "the clicked row is removed"; Actual "row 1 is removed"; Location "`app.js` delete handler uses `rowIndex` captured at load; after an earlier delete it points at a different row (or past the end, which throws a TypeError)"; Severity "Major: silent data loss in the list, workaround is reload". | "And the report. Five parts. The location line names the variable and the wrong value. A developer can fix this without reproducing it first." |
| 5:20 | Slide: "Reproduce → Narrow → Breakpoint where it shows → Read real values → Confirm the fix with the same steps". | "That's the method. Same five steps for any bug that 'sometimes' happens." |
| 5:45 | End card: "Try it: lesson 07 practice". | "Now build the buggy page yourself and find it with a breakpoint, not a guess." |

## On-screen assets and B-roll
- Planted-bug `app.js` (per-button listeners that capture `rowIndex` at load) and the fixed delegated version.
- The defect-report form graphic shared with web100 and ops100 videos.

## Accessibility
- Captions; Scope and Console values are read aloud.
- The breakpoint marker is pointed out by its line number, not only by its blue color.
- Keyboard shortcuts are spoken (F8 resume, F10 step over).

## Check for understanding
1. Why did the first delete work and the second fail? *Answer: The index was captured at load. After one deletion the positions shifted, but the stored index did not.*
2. What condition would you use for a conditional breakpoint here? *Answer: `list.children[rowIndex] !== event.currentTarget.closest("li")`, which is true only when the stored index no longer matches the clicked row.*
3. Which step proves the fix, and why can't you skip it? *Answer: Rerunning the original repro steps exactly. "Looks fine" on a different path does not show that this failure is gone.*
