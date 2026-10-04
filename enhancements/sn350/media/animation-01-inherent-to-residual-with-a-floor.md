---
course_id: sn350
media_id: sn350-a01
type: animation-storyboard
title: "Inherent to Residual, and Why the Floor Rule Exists"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - sn350-05
objectives:
  - Build a risk register with a scoring methodology and run a risk assessment against it
competency_ids:
  - D10-S1-C05
---

## Concept and misconception it fixes

Shows a risk moving across a 5x5 likelihood-by-impact grid as controls are applied, and what happens when a control fails. Misconceptions fixed: (1) controls reduce impact (usually they reduce likelihood); (2) a rare, severe risk is "Low" because 1 x 5 = 5; (3) residual scores stay put when a linked control fails.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- 5x5 grid, likelihood on the vertical axis (1 to 5, labelled Rare to Almost certain), impact on the horizontal (Negligible to Severe).
- Band regions shaded in a sequential single-hue palette (light to dark) and also labelled in text: Low, Moderate, High, Critical.
- The risk is a circle token labelled "Privileged access (Northwind)"; inherent position as a hollow ring left behind.
- Controls as small shield icons labelled "Access review" and "Dormancy indicator".
- Failure shown by a cracked shield plus the word "Failed".

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Empty grid with axis labels and band labels. | Grid draws. | "Five levels of likelihood over twelve months. Five levels of impact, worst credible case." |
| 2 | 8 s | Token appears at likelihood 4, impact 5: cell shows "20, Critical". | Token drops in. | "Inherent risk: likely, severe. Twenty. Critical." |
| 3 | 12 s | Two shields slide onto the token; text "Controls 60% effective". Token moves *down* the likelihood axis to 2 (4 x 0.4 = 1.6, rounds to 2); stays at impact 5. Hollow ring remains at (4,5). Cell shows "10". | Vertical move only; arrow labelled "likelihood reduced". | "Controls make the event less likely. They rarely make it cheaper. So the token moves down, not left." |
| 4 | 10 s | The cell (2,5) would read "Moderate" by product; a floor bar slides in across the impact-5 column labelled "Impact 5: never below High". Band label for the token changes to "High". | Floor bar slides; label swaps. | "By product it is Moderate. The floor rule says severe impact is never below High. Residual 10, band High." |
| 5 | 10 s | Side demo: a ghost token at (1,5) "Rare, Severe = 5". Without floor, label "Low" with a question mark; with floor, "High". | Ghost token flickers between labels. | "Without the floor, a rare catastrophe sits politely at the bottom of the list." |
| 6 | 12 s | Wrong-way demo: token slides *left* along impact to 3 with a cross through the arrow and label "Not this: impact unchanged by an access review". Returns. | Slide left, cross, bounce back. | "Treating impact as reducible is how residual scores become fiction." |
| 7 | 12 s | Access review shield cracks ("Failed"); effectiveness text drops to 20%. Token moves up to likelihood 3 (4 x 0.8 = 3.2, rounds to 3): cell "15, High". | Shield cracks; token rises. | "When a linked control fails its attestation, effectiveness drops and residual recomputes upward. Visibly. Automatically." |
| 8 | 8 s | Summary card. | Text builds. | "Controls move likelihood. Floors apply after the arithmetic. Failures push residual back up." |

## Interaction variant (optional)

A scrubbable widget: sliders for inherent likelihood, impact, and control effectiveness; a toggle for the floor rule. The token moves live and the band label updates, with the formula `max(1, round(L x (1 - e))) x I` shown beneath.

## Production notes

- Arithmetic matches the lesson 5 `residualScore` function exactly; do not change the rounding without changing the lesson.
- Band thresholds follow the lesson 5 sample JSON (Low 1-5, Moderate 6-11, High 12-19, Critical 20-25).
- Avoid red/green; the sequential palette plus text labels must carry band meaning.
