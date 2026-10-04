---
course_id: dm301
media_id: dm301-v01
type: video-script
title: "Is It a Signal? The Two-Standard-Error Test"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - dm301-05
  - dm301-03
objectives:
  - Separate a real signal from normal variation
  - Turn an analytics finding into a specific marketing decision
competency_ids:
  - D6-S1-C03
---

## Purpose
After watching, a learner can compute the standard error of a difference between two rates by hand, express a gap in standard errors, and say "finding", "marginal" or "noise" in a meeting with the arithmetic to back it.

## Audience and prerequisites
Apprentices who have read lesson 03's "Telling a Real Move From Normal Variation". A calculator with a square-root key.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard. Two numbers written large: "Organic social 0.54%" and "Referral 0.71%". A hand underlines the gap. | "Somebody in a meeting says referral converts a third better than organic social, so we should move budget. Is that a finding? You can answer in under a minute, and this video shows you how." |
| 0:20 | Title written at top: "Is it a signal?" | "One formula. Three Kestrel examples. One rule of thumb." |
| 0:30 | Write: `SE of a difference = √[ p1(1−p1)/n1 + p2(1−p2)/n2 ]`. Label p = rate, n = how many it was measured on. | "Every rate wobbles. How much depends on the rate and on how many observations it was measured on. To compare two rates, add their wobbles under one square root. That is the standard error of the difference." |
| 1:05 | Write the rule in a box: "< 2 SE: not a finding. > 3 SE: hard to argue with. 2-3: marginal." | "Then divide the gap by that number. Under two standard errors, it is not a finding. Over three, it is hard to argue with. In between, you say marginal and you collect more data." |
| 1:25 | Example 1 header: "Mobile vs desktop checkout completion". Write: mobile 289 / 1,690 = 0.171; desktop 302 / 720 = 0.419. | "Example one, the big one from lesson 03. Mobile completes 289 of 1,690 checkouts, seventeen point one percent. Desktop completes 302 of 720, forty-one point nine." |
| 1:50 | Compute line by line: `0.171 × 0.829 / 1690 = 0.0000839`; `0.419 × 0.581 / 720 = 0.000338`; sum `0.000422`; √ = `0.0206` → "2.1 points". | "Seventeen point one percent times eighty-two point nine percent, over 1,690. Then the same for desktop. Add them, take the square root: about two point one percentage points." |
| 2:30 | Write: gap 24.8 points ÷ 2.1 = "≈ 12 SE". Circle it. | "The gap is twenty-four point eight points. Divided by two point one: about twelve standard errors. That is not a close call. It will not go away next month." |
| 2:50 | Example 2 header: "Email vs site". Write: email 108 / 4,900 = 2.20%; site 1.32%. `0.022 × 0.978 / 4900` → √ → 0.21 points. Gap 0.88 ÷ 0.21 ≈ 4 SE. | "Example two. Email converts at two point two percent on 4,900 sessions, against the site's one point three two. Here the site rate is so well measured we treat it as fixed and only use email's wobble: about point two one points. The gap is point eight eight. About four standard errors. Real." |
| 3:35 | Beside it, write in a callout: "Real ≠ better channel. Selection: subscribers already chose Kestrel." | "But real only means 'not an accident of sampling'. It does not mean email is a better tactic. Email subscribers already chose Kestrel. The number is solid; the interpretation still needs care." |
| 4:00 | Example 3 header: back to the opening numbers. organic social 22 / 4,100; referral 15 / 2,100. Compute: `0.00537 × 0.9946 / 4100 = 0.0000013`; `0.00714 × 0.9929 / 2100 = 0.0000034`; sum `0.0000047`; √ = `0.0022` → 0.22 points. | "Example three, the meeting question. Twenty-two purchases on 4,100 sessions against fifteen on 2,100. Do the same arithmetic: the standard error is about point two two points." |
| 4:40 | Write gap 0.18 ÷ 0.22 ≈ "0.8 SE — noise". Cross out "move budget". | "The gap is point one eight points. Less than one standard error. Twenty-two purchases and fifteen purchases are the same number as far as any decision is concerned." |
| 5:00 | Write: "What to say in the meeting". Sentence appears: "That gap is smaller than one standard error, so I would not move budget on it. If we want to know, we need about four times the traffic or a different metric." | "Say it plainly and kindly, and offer the path to an answer. Quadrupling the sample roughly halves the standard error." |
| 5:30 | Side panel: "Then walk the impostors": calendar, definition drift, tracking break, mix shift. | "And even a difference that passes the test can have the wrong cause. Before you write the conclusion, walk the four impostors from lesson 05: calendar shape, a definition that changed, a tracking break, and mix shift." |
| 6:00 | Recap box with the formula, the rule, and the three verdicts: 12 SE finding; 4 SE real but selected; 0.8 SE noise. | "One formula, one rule, three verdicts. Write the counts beside every rate and you can do this in the meeting rather than after it." |
| 6:30 | End card: "Practice Part 1, lesson 05". | "Now find one overwhelming, one marginal, and one noisy comparison in your own data. Pause here." |

## On-screen assets and B-roll
- Whiteboard or tablet drawing; numbers written large enough for a phone screen.
- A printable one-page "SE card" with the formula, rule, and a worked line.

## Accessibility
- Captions; every handwritten number is also read aloud in full.
- Verdicts written as words ("finding", "noise"), not only circled or coloured.
- Transcript includes each computation line as text.

## Check for understanding
1. Page A converts 30 of 1,000 sessions; page B converts 45 of 1,000. About how many standard errors apart are they? *Answer: SE = √(0.03×0.97/1000 + 0.045×0.955/1000) = √(0.0000291 + 0.0000430) = √0.0000721 ≈ 0.0085 (0.85 points); gap 1.5 points ≈ 1.8 SE — not a finding.*
2. Why can a 4-SE difference still be a misleading basis for "email is our best channel"? *Answer: selection — email audiences already chose the brand, so the rate reflects the audience as well as the channel.*
3. What happens to the standard error if you collect four times as much data? *Answer: it roughly halves, because n is under a square root.*
