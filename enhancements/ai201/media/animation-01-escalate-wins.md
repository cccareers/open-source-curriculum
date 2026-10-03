---
course_id: ai201
media_id: ai201-a01
type: animation-storyboard
title: "Escalate Wins: Why Signals Are Not Averaged"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ai201-09
  - ai201-08
objectives:
  - Design a customer-service automation with explicit confidence thresholds and escalation to a person
competency_ids:
  - D3-S1-C03
---

## Concept and misconception it fixes

Misconception: "Combine the confidence signals into one score, average them, and set a threshold on the average." Averaging lets three strong signals hide one fatal one. A request with 0.95 classification confidence and a good retrieval score, but a failed rule check (the order has already shipped), averages to "looks fine" and gets a draft it should never have had.

The animation shows lesson 09's tier rule as a sequence of gates: escalate conditions are checked first, and any one of them wins. Only a request that clears every escalate gate reaches the confidence bands (ASSISTED or AUTO_DRAFT). It also shows that AUTO_DRAFT still ends at a human review gate. This matches the course asset `confidence-routing-thresholds.png`, so the two should share visual language.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- **Requests**: rounded rectangles ("cards") carrying a short label ("Where's order NW-4471?") and four small signal meters underneath: CLASSIFY, RETRIEVAL, RULES, COMPLEXITY.
- **Escalate gates**: hexagons in a vertical column on the left, each labeled with its condition (`requires_human`, `rule_check_failed`, `retrieval_hits = 0`, `complexity_flags >= 2`, `sentiment = negative`, `action not allowed`, `confidence < 0.70`).
- **Tiers**: three lanes on the right labeled ESCALATE, ASSISTED, and AUTO_DRAFT. Each lane carries a distinct icon (person, person with pencil, document) so tier is never conveyed by color alone.
- **Human review gate**: a doorway icon labeled "Reviewed by a person" at the end of the ASSISTED and AUTO_DRAFT lanes.
- **Palette** (Okabe-Ito, color-blind-safe): ESCALATE vermillion `#D55E00`; ASSISTED orange `#E69F00`; AUTO_DRAFT bluish green `#009E73`; neutral cards grey `#999999`; gate outlines blue `#0072B2`. Signal meters use fill level plus a numeric label, never color alone.
- **Typography**: one sans family, minimum 32px at 1080p for labels and 40px for captions.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-8s | A single request card: "Can you change delivery on NW-4471 to Friday?" Its meters read CLASSIFY 0.95, RETRIEVAL 0.88, RULES FAIL (order shipped), COMPLEXITY 0. | Card slides in; meters fill one after another. | "Four signals on one request. Three look great. One says stop: the order has already shipped." |
| 2 | 8-20s | A blender labeled "average". The four meters pour in and a single gauge reads 0.71, "looks fine". The card heads for the AUTO_DRAFT lane. | Meters drain into the blender; the gauge needle settles; the card glides right. | "Average them and the failed rule disappears into a respectable 0.71. A draft gets written promising a change that can't happen." |
| 3 | 20-26s | Freeze. A red X stamps over the blender with the text "Averaging hides the fatal signal". | Hard cut to freeze, then the stamp. | "That's the failure lesson 09 is built to prevent." |
| 4 | 26-42s | Rewind. The same card enters the hexagon column. Gate 1 `requires_human` lights and passes. Gate 2 `rule_check_failed` lights and catches. | The card moves down the column, pausing at each gate; the catching gate pulls the card left into the ESCALATE lane. | "Instead, check the escalate conditions first, one at a time. The first one that's true wins. Rule check failed: escalate. The 0.95 never gets a vote." |
| 5 | 42-58s | A second card, "What time does the Columbus depot open?", passes every hexagon, reaches a two-step comparator `< 0.90 ?` that reads 0.93, then `retrieval_top_score < 0.75 ?` that reads 0.91, and lands in AUTO_DRAFT. | The card passes each gate with a soft check tick, then reaches the bands. | "A request that clears every escalate gate is then placed by confidence. Here that's high confidence and strong retrieval, so it gets an auto draft." |
| 6 | 58-68s | The AUTO_DRAFT lane ends at the review doorway. A person icon reads the draft and approves it, and only then does an envelope leave. | The draft card stops at the doorway, the person icon nods, and the envelope exits. | "Auto draft doesn't mean auto send. In this course every customer reply passes a person first." |
| 7 | 68-80s | A side-by-side cost scale. Left pan: "Escalated, but could have been handled: a few minutes of staff time". Right pan: "Handled, but should have escalated: a customer told something untrue". The right pan drops hard. | The scale tips. | "The asymmetry is deliberate. An unnecessary escalation costs minutes. A missed one costs a customer." |
| 8 | 80-90s | Summary card listing: Escalate gates first. Any one wins. Then confidence bands, set per category. Every reply is reviewed. | Items appear in sequence. | "Escalate first, any one wins, then the bands, and a person before anything is sent." |

## Interaction variant (optional)

A step-through H5P "Course Presentation", or a small web widget where the learner sets the four signal values for a card with sliders and toggles, presses Play, and watches which gate catches it. Include a toggle labeled "Average instead" that shows how the same card would route under averaging. Add five preset cards drawn from lesson 09's practice step 6 (only `requires_human`, only zero retrieval, high confidence with two complexity flags), plus a preset per category using lesson 09's per-category floors (for example `billing_question` at 0.95).

## Production notes

- Threshold numbers come straight from lesson 09's tier rule (0.70, 0.90, 0.75) and must be updated if the lesson changes. Add a caption in scene 5 stating that per-category floors replace these placeholders once calibrated.
- Reuse the hexagon and lane shapes in the course diagram `confidence-routing-thresholds.png` so the still and the motion version teach the same picture.
- Scene 2's 0.71 is illustrative: the mean of 0.95, 0.88, 0 (failed rule), and 1.0 (zero complexity, inverted) is about 0.71. Keep the on-screen footnote "illustrative average" so nobody mistakes it for a lesson formula.
- Audio: a short tick per gate passed and a lower tone when a gate catches, so the logic is audible as well as visible. Captions carry the same information.
