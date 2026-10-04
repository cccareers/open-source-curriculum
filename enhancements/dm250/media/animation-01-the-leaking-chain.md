---
course_id: dm250
media_id: dm250-a01
type: animation-storyboard
title: "The Leaking Chain"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - dm250-06
objectives:
  - Measure social campaign effectiveness with platform and web analytics
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes
Misconception: a campaign with poor sales is failing at one dramatic point, usually "the content" or "the website". Reality from lesson 06: losses compound multiplicatively across five links (exposure → attention → response → visit → outcome), so modest leaks at several links look catastrophic at the bottom, and the useful skill is finding which link to fix. The animation shows people as particles flowing down five stacked pipes, losing particles at each joint, and then shows that fixing one joint (Fernwood's bio link) changes the outcome more than adding reach at the top.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Five horizontal pipe segments stacked vertically, each labelled in text: EXPOSURE, ATTENTION, RESPONSE, VISIT, OUTCOME.
- Particles: small circles. Flowing particles in blue (#0072B2); particles that leak out in orange (#E69F00) with a short downward drip motion, so loss is shown by **motion and colour and a counter**, never colour alone.
- Ratio badges at each joint: white rectangle, black text, e.g. "3.33%".
- Background off-white (#F7F7F7); text near-black (#222222). Okabe-Ito palette throughout.
- One counter at the bottom: "Orders this month".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-8s | Empty stacked pipes with labels. | Labels fade in top to bottom. | "Every social metric measures one link in a chain." |
| 2 | 8-18s | A wide stream of 118,400 (label) blue particles enters EXPOSURE. | Particles pour in; label "Reach 118,400 (July)". | "In July, Fernwood reached a hundred and eighteen thousand people." |
| 3 | 18-30s | Joint EXPOSURE→RESPONSE: most particles drip out orange; badge "Profile visits / reach 3.33%". | Heavy orange drip; remaining stream thins sharply. | "Only about three in a hundred did anything about it." |
| 4 | 30-40s | Joint RESPONSE→VISIT: badge "Clicks / profile visits 18.6%". | Further orange drip. | "Of those, fewer than one in five clicked through." |
| 5 | 40-48s | Joint VISIT→OUTCOME: badges "Sessions / clicks 80.4%", "Orders / sessions 6.97%". Counter ticks to 41. | Small drip at visit (tag loss), larger at outcome. | "Forty-one orders. No single joint looks like a disaster. Together they are." |
| 6 | 48-58s | Rewind effect. Top stream doubles in width; counter labelled "What if we doubled reach?" | Particles double at top; but the response joint's badge stays 3.33%; ghost counter shows a rise that is partly reach from people far from Asheville. | "The instinct is to pour more in at the top. But the extra reach came from a café Reel watched by people nowhere near the cafés, and it converted worse." |
| 7 | 58-70s | Rewind again. Top stream back to normal. RESPONSE→VISIT joint narrows its leak: badge animates 18.6% → 29.6%. Label: "Bio link points at the grind guide (August)". | Orange drip at that joint visibly shrinks; outcome stream thickens. | "Fix one joint instead. Pointing the bio link at the thing the content was about moved clicks per profile visit from about nineteen to about thirty percent." |
| 8 | 70-80s | All five badges visible; the improved joint outlined with a thick dashed border and the word "FIXED". | Hold. | "Find the leaking joint, fix it, then measure again. That is the whole diagnostic skill." |

## Interaction variant (optional)
Build as a scrubbable H5P or small web interactive: five sliders, one per joint ratio, and a live "orders" counter. Learners set July's ratios, then try "double reach" versus "raise one joint by ten points" and see which moves orders more. Include a reset to July values and a readout of every ratio as text.

## Production notes
- Ratios come from lesson 06's July report and the August case file (project dm250-x01): July clicks/profile visits 731 / 3,940 = 18.55%; August 975 / 3,298 = 29.6%. Keep labels at one decimal place.
- Particle counts are illustrative; do not imply one particle = one person. Add a small "not to scale" note in the corner.
- Captions burned in; VO pace about 140 wpm; all numbers also appear as on-screen text.
- Avoid flashing; drip motion should ease out over at least 400 ms.
