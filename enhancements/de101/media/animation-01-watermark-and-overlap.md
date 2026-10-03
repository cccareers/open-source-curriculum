---
course_id: de101
media_id: de101-a01
type: animation-storyboard
title: "The Watermark, the Late Commit, and the Overlap Window"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - de101-06
  - de101-07
objectives:
  - Explain the difference between ETL and ELT and when each is appropriate
  - Build a repeatable ingestion job that reads from a file, an HTTP API, and a database
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
---

## Concept and misconception it fixes

Misconception: "if I read everything with `updated_at > last watermark`, I get every change exactly once." In reality a transaction can commit *after* your read with an `updated_at` *before* your watermark (lesson 6 practice 3b), so the row is skipped forever. The fix is an overlap window plus an idempotent load, and advancing the watermark only after success.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Horizontal timeline, left to right, labelled in clock times 01:58 to 02:03.
- Rows as small rounded rectangles stamped with their `updated_at`. Committed rows: solid fill blue (#0072B2). Uncommitted (in-flight transaction): dashed outline orange (#E69F00) with a padlock icon.
- The watermark: a vertical bar in vermillion (#D55E00) with a flag labelled "watermark".
- The overlap window: a shaded band in sky blue (#56B4E9) at 30% opacity, labelled "re-read window".
- Missed row: gets a "MISSED" tag with an X icon (shape, not only color). Duplicates: "DUP" tag with a two-square icon.
- Destination table on the right: a stack of rows with a key column.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Timeline with rows stamped 01:58, 01:59, 02:00 dropping onto it. | Rows fall in at their timestamps. | "Every row in the source carries an updated_at timestamp." |
| 2 | 10s | At 02:00:00 a reader sweeps left to right and copies rows to the destination. Watermark flag plants at 02:00:00. | Sweep line; copies fly right. Flag drops. | "The 02:00 run reads everything up to now and records the highest timestamp it saw as the watermark." |
| 3 | 12s | An orange dashed row stamped 01:59:58 sits near the flag with a padlock. At 02:00:05 the padlock opens and the row turns solid blue. | Padlock unlock animation; row solidifies behind the flag. | "But this transaction started at 01:59:58 and didn't commit until 02:00:05. When the run read, it wasn't visible yet." |
| 4 | 12s | Next run at 03:00 sweeps from the flag rightward only. The 01:59:58 row stays behind, gets the MISSED tag. | Sweep starts at flag; the stranded row greys out. | "The next run asks for rows after 02:00:00. The late row is stamped earlier. It's never read. No error, just a hole." |
| 5 | 12s | Rewind. Shaded overlap band extends from 01:00 to the flag. Second run sweeps from the start of the band. | Band slides open; sweep starts earlier; late row is captured. | "Fix: re-read a safety window, say one hour before the watermark. The late row falls inside the window and is captured." |
| 6 | 12s | Destination shows rows already loaded being sent again; they get DUP tags, then a MERGE-on-key funnel collapses them to one each. | Duplicate rows slide into a funnel labelled "merge on order_id" and emerge as single rows. | "The window re-reads rows you already have. That's safe only because the load is idempotent: a merge on the key, or delete-and-insert by partition." |
| 7 | 12s | A run fails midway (red lightning icon). Two versions: left, flag moves forward anyway, leaving a gap labelled "permanent hole"; right, flag stays put. | Left flag jumps; gap appears. Right flag stays; next run re-covers. | "And advance the watermark only after the load succeeds. A watermark moved on a failed run creates a gap no later run will fill." |
| 8 | 12s | Summary card with three icons: window band, merge funnel, flag-with-check. | Icons pop in one by one. | "Overlap the read. Make the load idempotent. Move the watermark last." |

## Interaction variant (optional)

A scrubbable timeline where the learner drags the commit time of the late row and the overlap width. A counter shows "rows missed" and "rows re-read". Learners discover that overlap must exceed the longest expected commit delay, and that larger windows cost re-reads but never correctness.

## Production notes

- Keep timestamps legible at 1080p (minimum 28 px).
- Captions must name "MISSED" and "DUP" aloud; icons carry the meaning without color.
- Reuse the exact runner names from lesson 7 (`overlap(since, minutes=60)`, `store.set`) in scene 7's on-screen code snippet so learners connect the picture to the code.
