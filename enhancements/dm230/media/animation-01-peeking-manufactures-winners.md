---
course_id: dm230
media_id: dm230-a01
type: animation-storyboard
title: "Peeking Manufactures Winners"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - dm230-10
objectives:
  - Design a valid A/B test on ads or landing pages and interpret the result
competency_ids:
  - D3-S1-C02
---

## Concept and misconception it fixes

Misconception: "If I check the test every day and stop as soon as it is significant, I just find the answer faster." The animation runs an A/A test (two identical versions) and plots the running z-score day by day. The line wanders and briefly crosses the significance band; a "stop when significant" rule would declare a winner at that moment, even though there is no real difference. It then shows many simulated A/A tests at once to make lesson 10's peeking table visible: one look gives about a 5% false-winner rate, ten looks about 20%.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Horizontal axis: days 1 to 56. Vertical axis: z-score from −3 to +3.
- Shaded band above +1.96 and below −1.96 labelled "would be called significant" (hatched pattern plus label, not colour alone).
- Running z line: #0072B2 blue, 3 px. A small eye icon marks each daily "peek."
- The moment the line enters the band: a #D55E00 vermillion flag with the text "STOP? 'B wins!'" and a dotted outline.
- Multi-test panel: many thin grey lines (#999999), with any line that ever enters the band redrawn in #E69F00 orange and a counter labelled "false winners".
- Label at top: "A/A test: both versions identical."

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6 s | Two identical landing page thumbnails labelled A and B, with an equals sign. | Thumbnails slide in. | "Two versions of a page. They are identical. Any difference you see is luck." |
| 2 | 6 s | Empty chart with the significance bands drawn and labelled. | Bands fade in. | "Each day we compute a z-score. Outside these bands, a single, planned read would call the difference significant." |
| 3 | 16 s | Running z line draws day by day, wandering between −1 and +1.5, then rising to +2.1 on day 9. Eye icons appear at each day. | Line draws at 3 days per second, pauses on day 9. | "Watch it wander. Day nine: it crosses the line." |
| 4 | 6 s | Vermillion flag pops up at day 9: "STOP? 'B wins!'" | Flag bounces once. | "If your rule is 'stop as soon as it's significant,' you stop here and roll out B. But B is identical to A." |
| 5 | 10 s | Line continues past day 9, falls back to around 0, ends day 56 at +0.4. Flag fades to outline. | Line resumes drawing. | "Keep going, and it drifts back. Read once, at the planned end, and there's nothing there. Which is the truth." |
| 6 | 16 s | Chart shrinks to a corner; a panel fills with 100 grey A/A lines drawn together. Lines that ever enter a band turn orange; counter climbs. Side table: 1 look 5%, 2 looks 8%, 5 looks 14%, 10 looks 20%. | Lines draw simultaneously; counter ticks. | "Now run a hundred identical tests. Read each one once at the end, and about five cross the line by chance. Peek ten times each, and about twenty do. Peek every day, and more than one in four." |
| 7 | 10 s | Rule card: "Set sample size. Set end date. Read once. Peek only for breakage." | Card types on. | "The fix is boring. Decide the sample size and the end date before you start. Read the result once. If you must look early, look only for breakage: an arm not serving, a tag not firing." |
| 8 | 10 s | Callback: lesson 10's "4 of 40 vs 8 of 40" with z = 1.25 and p ≈ 0.21. | Numbers fade in beside a small chart. | "And remember: eight conversions against four, on forty clicks each, isn't a winner either. One identical test in five would look at least that lopsided." |

## Interaction variant (optional)

A browser-based simulator (for example a small p5.js or Observable notebook): learners set baseline rate, daily traffic, number of days, and how often they peek; press "Run 200 A/A tests"; the tool reports the share that ever cross the band versus the share significant at the final read. A toggle switches B to a true +30% lift so learners can also see how many real effects a fixed-horizon test detects at their traffic level.

## Production notes

- Generate the single-run line from a seeded simulation so the day-9 crossing is reproducible; a baseline of 11% and about 40 sessions per arm per day is close to Northgate's pooled traffic.
- The false-winner percentages shown must match lesson 10's table (5%, 8%, 14%, 20%); round the simulated counter to those in narration if the simulation differs slightly, and note that they are approximate.
- Keep the vertical axis labelled "z-score" in plain text; avoid introducing p-values in the main animation beyond scene 8.
