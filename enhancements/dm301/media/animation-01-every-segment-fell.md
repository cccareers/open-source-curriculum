---
course_id: dm301
media_id: dm301-a01
type: animation-storyboard
title: "Every Segment Fell, and the Total Rose"
target_runtime: "70 sec"
suggested_tool: "Manim"
related_lessons:
  - dm301-05
objectives:
  - Separate a real signal from normal variation
competency_ids:
  - D6-S1-C03
---

## Concept and misconception it fixes
Misconception: if the site-wide conversion rate went up, performance improved. Lesson 05's mix-shift example shows every device segment's conversion rate falling while the blended rate rises from 1.32% to 1.47%, because sessions shifted toward desktop (which converts about three times better) after a mobile-heavy paid social campaign paused. The animation makes the weighting visible: the blended rate is a weighted average, and the weights moved.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Three vertical bars for Mobile, Desktop, Tablet conversion rates, each labelled with its value in text.
- Beneath each bar, a horizontal "weight" block whose width equals the segment's share of sessions, labelled with session count.
- A fourth bar, "Blended", drawn as a balance-beam pointer sliding along a 0.8%-2.6% scale.
- Colours (Okabe-Ito): Mobile blue #0072B2, Desktop vermillion #D55E00, Tablet bluish green #009E73; each segment also carries a text label and a distinct hatch pattern (solid, diagonal, dotted).
- Down arrows "▼" next to falling segment bars; "▲" on the blended bar.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-8s | Period A: Mobile 0.89%, Desktop 2.50%, Tablet 1.17%. Weights: 32,300 / 12,100 / 1,800 sessions. Blended pointer at 1.32%. | Bars rise into place; pointer settles. | "Period A. Mobile converts at point eight nine percent, desktop at two point five. Most of the traffic is mobile. Blended: one point three two." |
| 2 | 8-16s | Label: "Blended = weighted average". The pointer is shown as a balance point over the weight blocks. | Weight blocks pulse once in turn. | "The blended rate is not an average of the three bars. It is weighted by how many sessions each one has." |
| 3 | 16-30s | Transition to Period B. Mobile bar shrinks 0.89% → 0.86% (▼). Desktop 2.50% → 2.45% (▼). Tablet stays 1.17%. | Bars dip slightly; ▼ markers appear. | "Period B. Mobile gets slightly worse. Desktop gets slightly worse. Tablet is flat." |
| 4 | 30-44s | Weight blocks change: Mobile 32,300 → 26,000 (shrinks), Desktop 12,100 → 16,900 (grows). Caption tag: "Mobile-heavy paid social paused". | Blocks resize smoothly; the balance point shifts right toward desktop. | "But the mix changes. A mobile-heavy campaign was paused, so mobile sessions fall and desktop's share grows." |
| 5 | 44-54s | Blended pointer slides from 1.32% to 1.47% (▲). Counter: purchases 612 → 659. | Pointer moves; counter ticks. | "Every segment got worse, and the blended rate rose to one point four seven percent." |
| 6 | 54-64s | Two text panels side by side: "Headline: conversion up 0.15 points" vs "Reality: every device converted worse; the mix moved". | Panels slide in. | "Report the headline alone and you will be congratulated for a decline." |
| 7 | 64-70s | Rule card: "When a blended rate moves, check whether the mix moved." | Hold. | "Whenever a blended rate moves, split it, and check the shares." |

## Interaction variant (optional)
Two sliders: one for each segment's conversion rate, one for the mobile/desktop split. Learners try to make the blended rate rise while lowering every segment. Readouts show all values as numbers; include a "Reset to Kestrel" button.

## Production notes
- Values from lesson 05: Period A 32,300 / 12,100 / 1,800 sessions, 289 / 302 / 21 purchases; Period B 26,000 / 16,900 / 1,800 sessions, 224 / 414 / 21 purchases; totals 46,200 → 44,700 sessions, 612 → 659 purchases.
- Use a broken axis only if labelled; otherwise keep the 0-3% axis so the small segment dips stay honest (they are small, and that is the point).
- Captions burned in; on-screen numbers at least 36px at 1080p.
