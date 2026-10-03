---
course_id: cse101
media_id: cse101-a02
type: animation-storyboard
title: "The Life of a Shoot: Storage Classes Over Ten Years"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - cse101-05
  - cse101-07
objectives:
  - Choose a cloud storage class and lifecycle policy that fits a workload's access pattern
competency_ids:
  - D2-S1-C03
---

## Concept and misconception it fixes
Learners tier by age alone. The animation follows one Talbot & Vine shoot (400 files × 45 MB) through hot → infrequent → cold classes, showing the two meters that move in opposite directions (storage price falls, access price rises) and the two traps: deleting before the minimum duration, and an accidental bulk read from a cold class.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Four horizontal shelves top to bottom: Hot (solid fill, #0072B2), Infrequent (striped, #56B4E9), Cold (dotted, #E69F00), Archive (cross-hatched, #CC79A7). Each shelf labelled with name, "storage $/GB-month" bar, and "read $/GB" bar.
- The shoot: a stack of 400 small file tiles bundled as one box labelled "Shoot 0412 · 18 GB".
- Two running meters at bottom: "Storage this month" and "Reads this month". Values illustrative and labelled so.
- Timeline ruler along the top: Day 0, 14, 30, 365, 3650.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Shoot box lands on Hot shelf at Day 0. Many read arrows hit it. | Read arrows flicker rapidly; storage meter small, read meter ~0. | "A new shoot: read constantly for two or three weeks. Hot storage costs more to keep and nothing extra to read." |
| 2 | 10s | Timeline reaches Day 30; box slides down to Infrequent shelf. Read arrows thin out to one every few seconds. | Storage meter drops by about half; tiny read charge blips. | "After a month, reads drop. Infrequent access halves the storage price and adds a small fee per read." |
| 3 | 10s | Day 365: box slides to Cold (immediate-retrieval) shelf. Almost no arrows. | Storage meter drops further. | "After a year, a client revision maybe twice a decade. Cold storage is a fraction of the price — and still opens instantly." |
| 4 | 12s | Freeze. A ghost box labelled "Archive?" hovers over the Archive shelf with an hourglass "minutes to hours to retrieve (most archive classes)". | Hourglass spins; a client icon taps foot. | "Why not archive? Most archive classes take minutes to hours to retrieve, and the studio's clients expect a reprint file the same day. Check the class you are offered; retrieval time outranks price." |
| 5 | 12s | Side-panel trap #1: a different bundle "Scratch exports" drops into Infrequent and is deleted at Day 5. A bill slip prints "billed for 30 days". | Slip slides out. | "Trap one: minimum duration. Delete after five days from a 30-day class and you still pay for thirty." |
| 6 | 12s | Trap #2: a robot icon labelled "indexer job" sweeps across Cold shelf reading everything. Read meter spikes above a year's storage savings line. | Read meter bar shoots up past a dashed line "1 year of savings". | "Trap two: a bulk read of cold data — a backup check, an indexer — can cost more than a year of savings." |
| 7 | 8s | Trap #3: ten thousand tiny 2 KB tiles drop onto Archive; a per-object overhead badge multiplies. | Tiles pile up; meter rises instead of falling. | "Trap three: tiny objects. Per-object overhead makes cold tiers cost more for small files." |
| 8 | 8s | Summary card: "Tier by size AND access frequency — never by age alone." with the shoot box on the Cold shelf and a "No expiration: legal record" tag. | Tag stamps on. | "Big, rarely read, needs instant access, never deleted. That's the policy — and it's a choice you write down." |

## Interaction variant (optional)
A scrubbable timeline (H5P "Interactive Video" or a small web widget): learners drag the day marker and see which shelf the shoot occupies and the month's illustrative cost; a quiz overlay at Day 365 asks "Cold or Archive for this studio?" with feedback citing retrieval time.

## Production notes
- Numbers are illustrative; show "illustrative prices" in a corner throughout. Do not quote any provider's live prices in the asset.
- The Talbot & Vine scenario matches lesson 10 and project cse101-x01 — keep the file size (45 MB) and the "never deleted" requirement consistent.
- Manim: one `Shelf` class, one `Bundle` class; meters as `ValueTracker`-driven bars.
