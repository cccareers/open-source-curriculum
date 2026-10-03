---
course_id: de102
media_id: de102-a01
type: animation-storyboard
title: "The Phone Book: Leftmost Prefix and Where a Range Stops the Seek"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - de102-05
objectives:
  - Choose an index type and column order that a given query can actually use
competency_ids:
  - D3-S1-C03
---

## Concept and misconception it fixes

Misconception: "an index on `(customer_id, ordered_at, status)` helps any query that mentions those columns." In reality a composite B-tree is sorted by the first column, then the second within ties, and so on. A query can seek only on a leftmost prefix, and once it hits a range predicate, later columns can only filter rows as they stream past, not narrow the seek.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Index leaf entries as a long horizontal strip of cells, each showing `cust | date | status` (e.g. `7 | 03-01 | shipped`).
- Cells grouped by `customer_id` with a thick divider; within a group, sorted by date.
- Seek pointer: a downward triangle in blue (#0072B2). Scanned region: a bracket in orange (#E69F00). Rows discarded by filter: grey with a strike-through line (shape cue, not only color). Returned rows: bold outline with a check icon.
- Labels "SEEK", "SCAN", "FILTER" in text beside each motion.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | A phone book page sorted by last name, then first name. | Page flips to "Okafor". | "A composite index is a phone book: sorted by the first column, then the second within ties." |
| 2 | 8s | Morph the phone book into the index strip `(customer_id, ordered_at, status)`. | Cells slide into groups. | "Here's an index on customer, then date, then status." |
| 3 | 10s | Query card: `WHERE customer_id = 7`. | Seek triangle drops straight onto group 7; bracket covers exactly that group. | "Equality on the first column: one seek, one tight range. Fast." |
| 4 | 10s | Query card: `WHERE customer_id = 7 AND ordered_at >= '03-01'`. | Seek lands on 7 at 03-01; bracket runs to the end of group 7. | "Add a range on the second column: the seek starts mid-group and scans to the end. Still tight." |
| 5 | 12s | Query card: `... AND status = 'shipped'` added. | Bracket stays the same width; cells inside with other statuses grey out with strike-through one by one. | "Now add status. The seek can't use it: within the date range, statuses aren't sorted. So status only filters rows as they pass. Same scan, fewer survivors." |
| 6 | 12s | Query card: `WHERE ordered_at >= '03-01'` alone. | Seek triangle hovers, finds no entry point, bracket stretches across the entire strip; most cells grey. | "Skip the first column, and there's no place to start. You'd read the whole index — like finding everyone named Maria in a phone book sorted by last name." |
| 7 | 10s | Reorder: a second strip `(customer_id, status, ordered_at)`. Same query as scene 5. | Seek lands on 7, then shipped, then 03-01; bracket is small with no grey cells. | "Put the equality columns first, then the range. Now all three predicates narrow the seek." |
| 8 | 10s | Rule card: "Equality first -> then range or sort -> then ride-along columns (INCLUDE)." | Rule lines appear one at a time. | "Equality, then range or sort, then anything that just rides along." |

## Interaction variant (optional)

A step-through where the learner picks predicates from checkboxes and drags column order. The strip animates SEEK / SCAN / FILTER and shows "entries read vs rows returned", mirroring `Rows Removed by Filter` in a real plan.

## Production notes

- Use real values from the de102-x01 seed data so the animation matches what learners see in `EXPLAIN`.
- Keep the strip to about 30 cells; more becomes unreadable at 1080p.
- End frame should show the matching PostgreSQL `Index Cond` vs `Filter` lines from a real plan, so the visual vocabulary maps to plan output.
