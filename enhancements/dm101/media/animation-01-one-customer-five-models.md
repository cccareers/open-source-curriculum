---
course_id: dm101
media_id: dm101-a01
type: animation-storyboard
title: "One Customer, Five Attribution Models"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - dm101-07
objectives:
  - Trace a conversion back through the channels that contributed to it
competency_ids:
  - D6-S1-C02
---

## Concept and misconception it fixes

The misconception: "the analytics tool tells us which channel caused the sale." The animation shows a single parent's eleven-day path to booking a tutoring trial (from lesson 07), then redistributes the same $252 of expected trial value under five attribution models. The learner sees that the journey never changes; only the rule changes, and each rule flatters a different channel.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Timeline: horizontal line, days 1 to 11, ticks labelled.
- Each touch is a rounded square with a text label and a distinct icon: paid social (play-button icon), organic search (magnifier), email (envelope), paid brand search (magnifier with a dollar badge).
- Palette (Okabe-Ito): paid social #E69F00 orange, organic search #56B4E9 sky blue, email #009E73 green, paid search #0072B2 blue. Every block also carries its text label and icon so meaning never depends on colour.
- Credit is shown as a stack of 252 small coins split into labelled bars with dollar values printed on each bar.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Empty timeline, a parent avatar at the left. | Avatar walks onto day 1. | "Meet one parent. Eleven days from first glimpse to booking a trial." |
| 2 | 14 s | Touches appear: Day 1 paid social video (no click); Day 3 organic blog post; Day 3 newsletter signup; Day 8 email click; Day 11 paid brand ad, then "Trial booked." | Each block drops onto its day with a soft tick sound. | "A video ad she didn't click. A blog post from a search. A newsletter signup. An email she clicked. Then she searched the brand name and clicked an ad." |
| 3 | 6 s | Coin stack labelled "$252 expected trial value" rises above day 11. | Stack grows. | "This trial is worth two hundred fifty-two dollars in expected gross margin. Who gets the credit?" |
| 4 | 10 s | Model label "Last click." All coins fly to the paid search block. Bar: Paid search $252. | Coins arc to day 11. | "Last click: paid search gets all of it. Brand search looks miraculous." |
| 5 | 10 s | Coins rewind to stack. Label "First touch." Coins fly to paid social. Bar: Paid social $252. | Rewind, then arc to day 1. | "First touch includes the observed impression, so social gets everything. First click would instead credit organic search." |
| 6 | 12 s | Label "Linear." Coins split equally to the four channels: $63 each. | Four streams. | "Linear: equal shares. Paid social, organic, email, and paid search, sixty-three dollars each." |
| 7 | 12 s | Label "Position-based 40/20/40." Paid social $100.80, paid search $100.80, organic $25.20, email $25.20. | Two thick streams to the ends, thin streams to the middle. | "Position-based: forty percent to the first touch, forty to the last, twenty shared in the middle." |
| 8 | 8 s | Label "Time decay." Heavier stream toward day 11, lighter toward day 1; bars without exact values, marked "weights vary by tool settings." | Gradient stream. | "Time decay leans toward the most recent touches. The exact weights depend on the tool's settings." |
| 9 | 10 s | All five bar charts shrink into a row. The journey above them is unchanged and glows. | Zoom out. | "Five answers. One journey. The journey never changed; only the rule did. State your model, use it consistently, and never compare reports built on different ones." |

## Interaction variant (optional)

A step-through H5P or simple web widget: the learner chooses a model from a dropdown and drags a slider for the position-based split; bars update live. A second tab lets the learner remove the paid social touch and see that last-click totals do not change, prompting the question "so would cutting it cost anything?" with a link to the holdout idea in lesson 07.

## Production notes

- Dollar values: linear $63 x 4 = $252; position-based 40/20/40 gives $100.80 + $25.20 + $25.20 + $100.80 = $252. Trial value is 30% x $840 = $252; a booking is not yet a paying student. Count four acquisition touches, including the observed impression; the newsletter signup is an outcome within the organic visit, not an additional touch. These are conceptual models, not a list of models available in GA4.
- Keep the time-decay scene qualitative; half-life settings vary by tool and this course does not teach tool configuration.
- Narration must not imply any model is "correct." End on the incrementality point.
