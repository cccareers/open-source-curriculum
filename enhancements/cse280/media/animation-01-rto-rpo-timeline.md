---
course_id: cse280
media_id: cse280-a01
type: animation-storyboard
title: "RTO, RPO, and Why Replication Is Not Backup"
target_runtime: "85 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cse280-08
  - cse280-09
objectives:
  - Design a cloud architecture that meets a stated recovery time and recovery point objective
  - Implement and verify backup and restoration procedures
competency_ids:
  - D7-S1-C03
  - D7-S1-C04
---

## Concept and misconception it fixes
Three misconceptions: the RTO clock starts at detection (it starts at failure); RPO is how long a backup takes (it is the interval to the last recoverable point); and a synchronously replicated database is protected against a bad `DELETE` (it replicates the deletion). The animation uses the appointment service's 60-minute RTO / 15-minute RPO and the lesson 08 budget.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Horizontal timeline with clock labels. Failure event: a lightning icon labelled "FAILURE 08:00".
- RPO bracket extends **left** (backward) from failure, hatched pattern, labelled "data lost".
- RTO bracket extends **right** (forward), solid fill #0072B2, subdivided into labelled budget phases.
- Database copies as cylinders labelled "zone A", "zone B", "zone C", "backup vault (other account)".
- Data rows as small stacked bars; deleted rows shown with an "X" and dashed outline (not colour alone).

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Timeline; snapshots marked as dots every hour; failure at 08:00. | Failure icon strikes. | "08:00. The database is lost." |
| 2 | 10s | RPO bracket stretches back to the last snapshot at 07:00: "60 min of data lost". Target bracket "15 min" overlaid, too short. | Bracket stretches. | "Recovery point is measured backward — to the last copy you can restore. Hourly snapshots: up to an hour lost. The objective is fifteen minutes." |
| 3 | 8s | Dots replaced by a continuous line labelled "point-in-time log". Bracket shrinks to "≤ 5 min". | Line draws. | "Continuous point-in-time recovery shrinks it to minutes — if it's enabled and tested." |
| 4 | 14s | RTO bracket grows right from the failure through phases: Detect 5, Declare 10, Promote 5, Deploy 15, Secrets 3, DNS 10, Smoke test 7 = 55. A marker at 60 min. | Each phase segment slides in with its label. | "Recovery time is measured forward from the failure — not from when someone noticed. Detection is inside it. This design budgets 55 minutes against 60." |
| 5 | 8s | A sixth segment "SMS allow-list missing" appears, flashing "unknown". Total exceeds 60. | Overflow. | "And the gap nobody saw: the SMS provider doesn't allow the recovery region. Designs fail on dependencies." |
| 6 | 14s | Three zone cylinders with synchronous arrows. A `DELETE FROM appointments` command hits zone A; X marks propagate to B and C in milliseconds. | Deletion ripples. | "Now the classic mistake. Three zones, synchronous replication — superbly available. A bad delete replicates to every copy instantly." |
| 7 | 12s | Backup vault cylinder in a separate account box with a lock icon "immutable". Restore arrow returns rows to a new instance. | Rows reappear. | "Only a backup in a separate account, which production credentials can't delete, brings the rows back." |
| 8 | 11s | Summary card: "RPO ← backward to last restorable point. RTO → forward from failure. Replication ≠ backup. Untested = unproven." | Fade in. | "Backward for RPO, forward for RTO, and neither counts until a test measures it." |

## Interaction variant (optional)
Sliders for snapshot interval, detection time, and deploy time; the RPO and RTO brackets resize and turn the target marker to "met / not met" (text label). A toggle swaps "replica" for "backup" in scene 6.

## Production notes
- Numbers match lesson 08's worked budget (55 min) and the lesson 09 restore record (67 min measured) — consider an end tag: "Measured in test: 67 min. Objective not met." to reinforce honesty.
- Keep "zone" and "account" boxes visually distinct; the account boundary is the point of scene 7.
