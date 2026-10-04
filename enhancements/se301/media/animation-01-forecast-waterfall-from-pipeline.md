---
course_id: se301
media_id: se301-a01
type: animation-storyboard
title: "From $1.25M Pipeline to a $690K Forecast: Where the Optimism Goes"
target_runtime: "90 sec"
suggested_tool: "Manim"
related_lessons:
  - se301-08
objectives:
  - Produce a defensible forecast from CRM opportunity data
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes

Misconception: "weighted pipeline is the forecast." The animation walks Lesson 8's twelve-deal pipeline through each step — default weighting, calibration, slippage — as a shrinking stack of deal blocks, then lays the reconciled numbers against quota and the commit line.

## Visual language

- Each deal is a horizontal block whose width is its amount, labeled with deal number and account name.
- Okabe-Ito: closed-won bluish green #009E73 (solid); commit blue #0072B2 (solid); best case sky blue #56B4E9 (dotted outline); pipeline grey #999999 (dashed outline). Quota line vermillion #D55E00, labeled "Quota $800K"; commit line black, labeled.
- Running total counter at the right.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Closed-won block $310K on the left; twelve deal blocks stacked to the right totaling $1.25M open. | Blocks slide in. | "Three hundred ten thousand closed. One-point-two-five million open. Quota: eight hundred thousand." |
| 2 | 14s | Each block shrinks to amount × default stage probability; labels show "80%", "25%" etc. Counter: $551,750 + $310,000 = $861,750. | Blocks compress horizontally. | "Weight each deal by its stage's default probability. Eight-sixty-one — above quota. Looks fine." |
| 3 | 10s | Arbor Health block (Discovery, $240K) highlighted; its $60K weighted slice pulses. | Pulse. | "But a quarter of a Discovery deal is sixty thousand dollars of forecast from a buyer who hasn't seen a proposal." |
| 4 | 14s | Probabilities swap to observed rates (72/55/35/18/8%). Blocks shrink again. Counter: $480,600 + $310,000 = $790,600. Label "−$71,150 of configuration optimism." | Labels flip, blocks shrink. | "Use your own history instead of the defaults. Seventy-one thousand disappears." |
| 5 | 16s | Calendar strip along the bottom; deals dated in the last ten days (2, 3, 6, 7, 9, 12) slide to the right edge, and 40% of each spills past the quarter boundary into "next quarter." Counter: $689,140. | Blocks split at the boundary line. | "Will they close *this* quarter? Deals dated in the last ten days historically land in-period about sixty percent of the time. Another hundred thousand slips." |
| 6 | 14s | Final ladder: Commit $590K — Forecast ~$690K — Best case $885K — Quota $800K, as horizontal reference lines. Gap between forecast and quota bracketed "≈ $110K short." | Lines draw; bracket appears. | "Commit five-ninety. Forecast about six-ninety. Upside to eight-eighty-five. Honest call in week three: short by about a hundred ten thousand unless best case converts." |
| 7 | 14s | Coverage gauge: $1.25M ÷ $490K = 2.6×, needle short of a 3× mark; label "Need ≈ $220K more pipeline." | Needle moves. | "And coverage tells you what to do today: about two hundred twenty thousand more pipeline, created early enough to close." |

## Interaction variant

Spreadsheet-backed interactive: learner edits stage probabilities, the in-period slippage rate, or moves a deal's close date; the blocks and counters update. Preset buttons for the Lesson 8 Practice 2 stress scenarios (Calder slips; Negotiation 60%; all late-dated deals slip).

## Production notes

- All figures must match Lesson 8 exactly; generate them from the same spreadsheet used to check the lesson.
- Keep deal labels readable at 1080p; abbreviate account names if needed but keep numbers.
