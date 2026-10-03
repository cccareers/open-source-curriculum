---
course_id: sn350
media_id: sn350-v02
type: video-script
title: "Show the Denominator: An Honest, Secure GRC Dashboard"
format: screencast
target_runtime: "7 min"
related_lessons:
  - sn350-10
objectives:
  - Build risk and compliance dashboards that perform well and expose data only to authorized readers
competency_ids:
  - D9-S1-C01
  - D9-S1-C02
  - D9-S1-C05
---

## Purpose

After watching, the learner can build an executive compliance widget that shows its denominator and separates untested from failed, measure a report's row count before publishing, and verify a dashboard as four personas including a user with no groups.

## Audience and prerequisites

Learners on lesson 10 with controls, results, and risks from earlier lessons on a PDI.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | A dashboard tile reading "94% compliant". | "Ninety-four percent compliant. A director will ask two questions: out of how many, and what is untested? If the tile cannot answer, it is not ready." |
| 0:15 | Title card. | "Show the denominator." |
| 0:20 | Slide: two audiences. Operational (lists, filtered to me) vs Executive (few trended numbers). | "Two products. Operational views are lists filtered to the person. Executive views are a few trended numbers. Never one artifact for both." |
| 0:45 | Report designer: new report on controls, bar chart grouped by authority document, stacked by compliance result with values Effective / Not effective / Not tested. | "Build posture by authority document. Stack the bar by result, and keep 'not tested' as its own segment. Merge it with failed, or drop it, and a program can look better by testing less." |
| 1:30 | Add bar labels showing counts, and a subtitle "Out of N controls, as of <date>". | "Show counts, not just percentages, and put the as-of date on it. Executive material gets screenshotted and forwarded." |
| 1:55 | Operational report: "My open issues" with condition Owner is (dynamic) Me. | "Operational: one report, filtered dynamically to the logged-in user. No per-team copies." |
| 2:20 | Background script: run lesson 10 row-count diagnostic with the trend report's encoded query; output "Rows scanned by this report: 612,000". | "Before publishing the trend, measure. Six hundred thousand indicator results. That is not a live report." |
| 2:45 | Show a Performance Analytics indicator "Controls effective %" (formula) with daily collection and a breakdown by authority document; widget shows time series. | "Aggregate at collection, not at read. A PA indicator computes this once a day and stores the score. The widget reads scores, and history starts when collection starts." |
| 3:20 | Show before-query business rule on the risk table from lesson 10, highlight the deny-by-default branch. | "Now access. Reports respect row-level rules. Where the rule is complex, add it centrally, at query time. Note the deny branch: a user with no groups sees nothing, not everything." |
| 3:50 | Impersonate four personas in turn: admin, practitioner, control owner in one group, user with no groups. Show the risk widget for each. | "Test as four people. Admin sees all. Practitioner sees all. The control owner sees only risks on entities their group supports. The user with no groups sees an empty widget." |
| 4:40 | Callout on the empty widget: "Empty here means 'no access', not 'zero risk'." | "That empty widget must never be read as zero risk. Say so in the widget title or description." |
| 5:00 | Slide: "Aggregates leak", e.g. "Critical risks in Payments: 3". | "Counts can leak what rows cannot. Where an aggregate is sensitive, restrict the widget and the dashboard, and remember PA scores are a separate access surface." |
| 5:30 | Scheduled report record: Run as field highlighted. | "Scheduled email renders once, as one identity, for everyone on the list. Run it as an identity suitable for the least privileged recipient, or send a link." |
| 6:00 | Recap slide. | "Denominator on every percentage. Untested separate from failed. Measure rows before publishing. Test as four personas. Deny by default." |
| 6:40 | End card. | "Do lesson 10 practice step 5 next." |

## On-screen assets and B-roll

- Pre-built PDI data with enough controls in each result to make the stacked bar meaningful.
- Persona switch overlay showing the impersonated user's name in large text.

## Accessibility

- Captions and transcript; chart values read aloud.
- Stacked bar segments use patterns and data labels in addition to color; the video recommends the same for learners' dashboards.
- Persona names spoken and displayed.

## Check for understanding

1. Why must "not tested" be a separate segment from "not effective"? *Answer: merging or dropping it lets the compliance percentage rise by testing less.*
2. A trend widget scans 600,000 rows live. What should you do? *Answer: move the aggregate to a Performance Analytics indicator (collected scores) or narrow the window.*
3. A user with no groups opens the risk dashboard and sees an empty chart. Is that correct, and how should it be read? *Answer: yes, deny-by-default; it means no access, not zero risk.*
