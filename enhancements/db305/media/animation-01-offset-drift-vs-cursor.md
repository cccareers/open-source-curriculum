---
course_id: db305
media_id: db305-a01
type: animation-storyboard
title: "Offset Drift vs Cursor: Why Rows Go Missing"
target_runtime: "70 sec"
suggested_tool: "Manim"
related_lessons:
  - db305-03
objectives:
  - Pull data from an API into a workflow, handling pagination, rate limits, and error responses
competency_ids:
  - D5-S1-C01
---

## Concept and misconception it fixes
Misconception: "Offset paging is fine; I just ask for the next 100." On a live table, inserts during the pull shift rows across page boundaries, causing both duplicates and misses. A cursor marks a position in the result set and is stable under concurrent writes. Secondary point: the no-progress guard catches a cursor that is not being passed.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Rows are horizontal bars labelled with order ids (ORD-1001 …). Already-fetched rows: blue (#0072B2) with a check mark. Duplicated rows: orange (#E69F00) with "x2". Missed rows: vermillion (#D55E00) outline, dashed, with "MISSED". Newly inserted rows: bluish green (#009E73) with "NEW".
- Page windows are bracket frames labelled "offset 0–4", "offset 5–9" (scaled down to 5 rows per page for readability).
- Cursor shown as a bookmark tab attached to a specific row.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | A column of 12 rows, newest first, sorted by `placed_at desc`. | Rows fade in top to bottom. | "A live orders table, newest first. We'll fetch it five rows at a time." |
| 2 | 8s | Bracket "offset 0–4" over rows 1–5; they turn blue with checks. | Bracket slides on; checks pop. | "Page one: offset zero, limit five." |
| 3 | 10s | Two green NEW rows insert at the top; every existing row slides down two places. | Smooth slide. | "While we're between pages, two new orders arrive at the top. Everything shifts down." |
| 4 | 10s | Bracket "offset 5–9" now covers what were rows 4–8: rows 4 and 5 are fetched again (orange x2). | Bracket slides; orange tags. | "Page two asks for offset five. But rows four and five moved into that window. We fetch them twice." |
| 5 | 8s | The two NEW rows at the top are outlined dashed vermillion "MISSED". | Pulse on missed rows. | "And the two new orders sit above our window. We'll never see them in this run." |
| 6 | 4s | Reset to original 12 rows. Title "Cursor". | Wipe transition. | "Same table. This time with a cursor." |
| 7 | 8s | Page one fetched; a bookmark tab attaches below row 5 labelled `next_cursor`. | Bookmark drops in. | "After page one, the API gives us a cursor: a bookmark at our place in the result set." |
| 8 | 8s | Two NEW rows insert at top; rows slide down; the bookmark moves with row 5. | Rows and bookmark slide together. | "New orders arrive. The bookmark moves with the row it marks." |
| 9 | 6s | Page two fetched starting after the bookmark: rows 6–10, no duplicates. | Bracket + checks. | "Page two continues exactly where we left off. No duplicates." |
| 10 | 6s | Caption inset: "New rows are picked up by the next incremental pull (updated_since with overlap)." Small arrow to the green rows. | Fade. | "The new orders get picked up by the next incremental pull, which is what updated_since and the overlap are for." |
| 11 | 8s | Bug variant: bookmark is NOT passed (label "cursor dropped"); page two equals page one; a red stop sign "no-progress guard: every id already seen" appears. | Page one highlight repeats; stop sign. | "And if the cursor isn't passed, page two is page one again. The no-progress guard stops the run instead of looping until the budget is gone." |

## Interaction variant (optional)
Step-through with a slider for "inserts between pages" (0–5) and a toggle "offset / cursor"; counters show duplicates and misses. Implementable as an H5P interactive or a small HTML canvas.

## Production notes
- Use the db305-03 order ids and terminology (`next_cursor`, `has_more`, `updated_since`).
- Five rows per page is a deliberate simplification of the lesson's 100; state it in the opening caption.
- Captions in WebVTT; audio description reads the tag labels ("duplicated", "missed", "new") as they appear.
