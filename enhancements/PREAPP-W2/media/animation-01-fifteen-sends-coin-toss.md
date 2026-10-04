---
course_id: PREAPP-W2
media_id: PREAPP-W2-a01
type: animation-storyboard
title: "Fifteen Sends Is a Coin Toss"
target_runtime: "90 sec"
suggested_tool: "Manim"
related_lessons:
  - PREAPP-W2-03
objectives:
  - A/B test message variants against real reply data and adapt tone and ask by audience
competency_ids:
  - D1-S3-C01
---

## Concept and misconception it fixes

Misconception: "Variant A got 3 replies out of 15 and B got 1, so A is three times better." The animation shows two *identical* messages sent to two groups of 15 producing different reply counts by chance alone, over and over. Then it shows that a gap repeated across tests is what earns the right to change your control message.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Each send is a small envelope icon. A reply turns the envelope into an open envelope with a speech bubble.
- Variant A envelopes are blue (#0072B2) and labeled "A"; variant B are orange (#E69F00) and labeled "B". Letters always visible, so color is never the only cue.
- A tally box under each group shows "replies / sent" and the percentage.
- A neutral gray (#999999) "chance band" shading appears behind the bar chart in scene 4.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-10s | Two rows of 15 envelopes, labeled A and B. Above both: the *same* message text, with a label "A and B are identical." | Envelopes fly out to the right. | "Let's cheat. A and B are the exact same message. Same words. Same kind of contacts. Fifteen each." |
| 2 | 10-22s | Replies come back randomly: A gets 3, B gets 1. Tally shows 20.0% vs 6.7%. A banner pops up: "A is 3x better!" | Envelopes open one by one at random times; banner bounces in. | "A gets three replies, B gets one. Twenty percent versus under seven. Three times better? But they're the same message." |
| 3 | 22-40s | Rewind icon. Run it again five times in quick succession; tallies change each time: 2-2, 1-3, 4-1, 2-1, 0-2. Each result is stacked as a row on the right. | Fast replays, each result row sliding into a stack. | "Run the same experiment again. And again. Sometimes A wins, sometimes B, sometimes it's a tie. Nothing changed but luck — which fifteen people happened to check their messages that week." |
| 4 | 40-55s | The stacked results become a dot plot of "A rate minus B rate." Gray band shows the range where most of the dots fall, labeled "what chance alone produces." The original 3-to-1 dot sits inside it. | Dots fall onto a horizontal axis; band fades in. | "At fifteen sends, a gap like three-to-one sits comfortably inside what chance produces. You haven't measured your writing. You've measured noise." |
| 5 | 55-72s | New scenario: A and B are now genuinely different (B has a post-hook). Three tests run: B wins 5-3, 5-2, 6-3. Each win stacks with a check icon and a date label (Mon-Tue, Wed-Thu, Mon-Tue). | Three short runs; checks accumulate. | "Now the messages really are different. One test, B wins — interesting. Two tests, same direction, different contacts, different days. Three. That's a pattern." |
| 6 | 72-90s | A log card fills in: "Test 02 | Variable: opening line | A: 18 sent, 2 replies (11.1%) B: 18 sent, 5 replies (27.8%) | Read: same direction twice. Adopting post-hook as new control." | Text types onto the card; "new control" stamps on. | "So write it like a professional: direction, numbers, 'small sample,' next action. Change your control only when the direction repeats." |

## Interaction variant (optional)

A web "reply simulator": the learner sets a true reply rate for A and B (e.g., both 15%) and a sample size per variant, then clicks "Send" repeatedly. A running tally shows how often the "worse" message appears to win. Sliders let them see that the false-winner rate drops as the sample size grows. Can be built in a spreadsheet with RAND() as a low-tech version.

## Production notes

- Use a fixed random seed per scene so the specific 3-to-1 and replay outcomes match the script; generate them from a true rate of about 13% so the numbers are realistic.
- Avoid statistical jargon on screen (no "p-value"). The lesson explicitly teaches directional reads at novice scale; keep this consistent with the "Reading small numbers honestly" section.
- Keep the A/B letters on every envelope for color-independent reading.
