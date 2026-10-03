---
course_id: db100
media_id: db100-a01
type: animation-storyboard
title: "Where Join Rows Come From: Matches, Phantoms, and Fan-out"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - db100-04
objectives:
  - Combine and summarize data across tables with joins and aggregation
competency_ids:
  - D2-S1-C04
---

## Concept and misconception it fixes

Learners picture a join as "looking up" a value, one output row per input row. In fact a join produces one row per matching pair, so it can drop rows (inner join, no match), invent a row of NULLs (left join, no match), or multiply rows (two one-to-many joins). Each of these changes what an aggregate counts. The animation makes row creation visible so `count(*)` errors and fan-out become predictable.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Rows are rounded rectangles labelled with real seed values (e.g. "Rosa Parks Park", "Neighborhood Cleanup").
- Palette (Okabe-Ito): venues **blue #0072B2**, events **orange #E69F00**, registrations **bluish green #009E73**, categories **reddish purple #CC79A7**, NULL placeholder **grey #999999 with dashed outline and the text "NULL"**.
- Every color is paired with a table-name label and a distinct shape edge (solid, double, dotted), so meaning never depends on color alone.
- A counter badge in the top right shows the current `count(*)` value.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Two columns: 4 venue rows (left), events (right) with connecting lines from `venue_id`. | Lines draw from each event to its venue. | "A join pairs rows that satisfy the ON condition. One output row per matching pair." |
| 2 | 12s | Inner join venues→events. Matched pairs slide together into wide rows in an output area. Riverside Library has no line. | Riverside Library fades out; the online event (venue NULL) on the right also fades. | "Inner join: rows with no partner disappear. Riverside Library and the online Q&A are gone, with no error." |
| 3 | 14s | Reset. Left join venues→events. Riverside Library slides to output joined to a grey dashed "NULL" block. | NULL block materializes beside it; counter shows `count(*) = 1` for that venue, then a second counter `count(e.event_id) = 0`. | "Left join: the unmatched venue survives, joined to a row of NULLs. count(*) counts that row as 1. count(e.event_id) sees NULL and counts 0." |
| 4 | 12s | Zoom on Neighborhood Cleanup with its 5 registration rows (green) attached. | 5 output rows stack up; counter = 5. | "Join registrations: one event with five signups becomes five rows. That's correct. You asked for pairs." |
| 5 | 18s | Now attach Cleanup's 2 categories (purple: Outdoors, Civic). | Each of the 5 rows splits into 2; stack grows to 10; counter flips 5→10 with a shake. | "Add categories: every signup pairs with every category. Five times two is ten. Nothing errored, but your signup count just doubled." |
| 6 | 12s | Venue total: Rosa Parks Park counter climbs to 22; a ghost label "true: 11". | Duplicated rows highlight in pairs with a matching outline. | "Across Rosa Parks Park's events, 11 real signups become 22 rows. This is fan-out." |
| 7 | 10s | Two fixes side by side: (a) categories join removed, stack collapses to 11; (b) registrations pre-aggregated into one row per event "signups: 5", then joined. | Stacks collapse. | "Fix it: don't join what you aren't using, or aggregate before you join." |
| 8 | 4s | Title card: "Before you count: what made these rows?" | Fade. | "Before you trust a count, ask what made each row." |

## Interaction variant (optional)

A step-through (H5P "Course Presentation" or a small web page) where the learner toggles JOIN / LEFT JOIN and adds or removes the categories join, and sees the row stack and the `count(*)` vs `count(col)` badges update. A scrub bar lets them pause on scene 5 and predict the number before it appears.

## Production notes

- All numbers come from lesson 02's seed data and were checked against PostgreSQL 15: Rosa Parks Park 11 registrations, 22 after joining categories; Fellowship Hall 8 vs 14; Maker Space 8 vs 8.
- Keep row labels at 24px or larger for mobile. Export captions as WebVTT.
- Reuse the shapes in the lesson 06 ERD so the visual language carries across the course.
