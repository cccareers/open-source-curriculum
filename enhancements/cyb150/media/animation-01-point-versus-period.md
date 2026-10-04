---
course_id: cyb150
media_id: cyb150-a01
type: animation-storyboard
title: "Point Versus Period: Why Today's Screenshot Proves Little"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb150-05
objectives:
  - Collect the evidence an auditor needs to confirm that a control operates as written
competency_ids:
  - D4-S1-C05
---

## Concept and misconception it fixes
Misconception: "Here's a screenshot showing the control works, so we're covered." A SOC 2 Type II examination asks whether a control operated *throughout* a period. A point-in-time artifact shows a single moment. Only records generated while the control ran can cover the period. The animation also shows why the population must be complete before an auditor samples it.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- A horizontal timeline from Jan to Jun 2026, labelled "Audit period".
- Quarterly review events are blue `#0072B2` document icons labelled "Q1 review" and "Q2 review", each showing reviewer, date, and decisions.
- A screenshot is a camera icon with a flash at "today" (July), outside the period.
- Coverage is a bluish-green `#009E73` band under the timeline, drawn only where evidence exists.
- An evidence gap is a vermillion `#D55E00` hatched region with the label "NO RECORD". Hatching means the gap does not rely on colour.
- Population records are small numbered tiles. The sample is the subset the auditor picks, outlined in orange `#E69F00` and labelled "sampled".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | The timeline appears with the "Audit period: 1 Jan – 30 Jun" label. Policy card: "POL-AC-01 3.6: review access quarterly." | Fade in. | "Meridian's policy says system owners review access every quarter. Kestrel's auditors are testing January to June." |
| 2 | 10 s | A camera flashes at July. A coverage band appears only as a thin sliver at that point, outside the period. | Flash; the sliver pulses. | "A screenshot taken today proves the control is true today. It says nothing about February." |
| 3 | 12 s | The Q1 review icon lands in early April and the coverage band fills Q1. The Q2 icon lands on 11 July, eleven days after the quarter closed, with an amber "late" tag. | Icons drop; band fills. | "What covers the period is the records the control produced as it ran: the Q1 review, then the Q2 review, completed eleven days late." |
| 4 | 10 s | Alternate branch: the Q2 icon is missing, and a hatched NO RECORD region covers Q2. A ghost icon "created in December" tries to slide in, is rejected with a ✕ and the label "fabrication". | Ghost slides and bounces off. | "If a review never happened, nothing produced later can fill the gap. Back-dating isn't evidence. It's fabrication. Report the gap instead." |
| 5 | 8 s | Return to the real branch. The late Q2 icon gets a note: "Deviation self-reported, SVC-4402". | Note attaches. | "Meridian reports the late review itself, with the cause and a ticket. A self-reported deviation is a better outcome than one the auditor discovers." |
| 6 | 16 s | A new row: 312 change-record tiles extracted from the ticket system, with the filter stated. A tile labelled "missing from hand-made list" flickers in from a second system. The auditor's hand picks 25 tiles, outlined "sampled". | Tiles fill; one flickers; the sample is highlighted. | "For controls that run hundreds of times, the auditor tests a sample, and you don't choose it. You provide the complete population from a system of record, with the filter stated. If one record is missing, the whole test fails, however good the sampled items are." |
| 7 | 16 s | Summary panel. Left: "Point in time: config screenshot, design only". Right: "Period: records generated as the control ran, plus a complete population". Footer: "Source · dates · filter · capturer · unaltered · request ID". | Panels slide in. | "Design evidence shows the control is built right. Operating evidence shows it ran, every time, all period. Label every artifact with its source, dates, filter, who captured it, and the request it answers, and never alter it." |

## Interaction variant (optional)
A drag-and-drop H5P exercise. Learners place six artifacts (config screenshot, Q1 review export, Q2 review export, revocation tickets, an undated spreadsheet, a population extract) onto the timeline or into a "doesn't cover the period" bin. Feedback explains each placement using lesson 05's six artifact properties.

## Production notes
- Dates, names, and ticket IDs match lesson 05's PBC-004 worked example (Q1 review 2026-04-06; Q2 support-ticketing review 2026-07-11; SVC-4402).
- The VO states every visual state change so the audio-described version needs no extra track.
- Pairs with project cyb150-x02, which reproduces the population-completeness trap with real data.
