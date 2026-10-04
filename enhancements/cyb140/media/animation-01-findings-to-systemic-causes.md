---
course_id: cyb140
media_id: cyb140-a01
type: animation-storyboard
title: "Six Findings, Five Causes"
target_runtime: "75 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cyb140-06
objectives:
  - Translate a test finding into a control weakness and a prioritized remediation recommendation
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes
Misconception: "A report is a to-do list. Fix each row." Each finding is a symptom of a control that is absent, not applied, misconfigured, bypassed, or unmonitored. Several findings usually share one cause, and fixing the cause also prevents findings nobody discovered this time. The animation uses lesson 06's worked-translation table and shows the six finding cards collapsing onto five systemic causes.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Finding cards are rectangles with a short title, in neutral grey `#999999`.
- Failure-mode badges use Okabe-Ito colours and always carry the mode's name: Absent = vermillion `#D55E00` with a hollow-circle icon; Not applied = orange `#E69F00` with a dashed-outline icon; Bypassed = reddish purple `#CC79A7` with a detour-arrow icon; Unmonitored = sky blue `#56B4E9` with a closed-eye icon. (Misconfigured is not used in this table.)
- Systemic causes are larger blue `#0072B2` hexagons with text labels.
- Priority is a numbered rail on the right.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Six finding cards in a column: Web server 14 months unpatched; Default credentials on appliance; Customer records readable across accounts; Obsolete TLS on 40 hosts; Unimpeded web-to-database movement; No alert in four days of testing. | Cards stack in. | "A report arrives with six findings. The instinct is to open six tickets." |
| 2 | 14 s | Each card gets a failure-mode badge in turn: Not applied; Absent (standard excludes appliances); Absent (endpoint check); Not applied; Bypassed; Unmonitored. | Badges stamp on, one at a time. | "Ask which control should have prevented each one, and how it failed. Not applied. Absent. Absent. Not applied. Bypassed. Unmonitored." |
| 3 | 16 s | Five hexagons appear: Incomplete asset inventory; Build standard excludes appliances; Config-management enrolment gap; Missing internal segmentation; Monitoring collects but doesn't detect. Lines connect cards to hexagons: unpatched server → inventory; default creds → build standard; TLS → enrolment gap; lateral movement → missing internal segmentation; no-alert → monitoring. The customer-records card stays alone, with a "?" asking "How many other endpoints?" | Lines draw; cards slide toward their hexagons. | "Now cluster by cause. Six findings collapse onto five systemic failures, plus one instance that raises a bigger question: how many other endpoints skip the authorization check?" |
| 4 | 10 s | Ghost cards labelled "not found this time" appear faintly behind each hexagon. | Ghosts fade in. | "Fix a cause and you also fix the findings nobody discovered this time." |
| 5 | 15 s | Priority rail: 1 Customer records (internet-facing, regulated data); 2 Default credentials (trivial fix, high impact); 3 Monitoring gap (affects every attack); 4 Inventory; 5 Enrolment gap; 6 Internal segmentation. A "CVSS order" ghost column beside it shows a different order. | Items slot into the rail; the ghost column dims. | "Then rank by priority, not score: exposure, exploitation evidence, asset criticality, compensating controls, chaining, and the effort to fix. The order differs from a CVSS sort, and the report should say why." |
| 6 | 12 s | One recommendation card expands to show six fields: Action, Assets (complete list), Owner, Deadline (SLA), Verification, Interim mitigation. | Fields fill in. | "Each action names the change, every affected asset, an owner, a deadline, how you'll verify it, and what holds the line in the meantime." |

## Interaction variant (optional)
A drag-and-drop H5P exercise. Learners stamp failure modes onto the six cards, then drag the cards to the cause hexagons. Feedback explains any mismatch using the lesson 06 table. A second round uses the learner's own lab findings from cyb140-x01 and x02.

## Production notes
- Card text matches lesson 06's worked-translation table, so learners can check against it.
- Every badge carries its text label and icon, so colour is never the only cue. The VO names each mode as its badge appears.
- No attack techniques are depicted. The content is purely defender-side analysis.
- Pairs with project cyb140-x02's finding-to-control memo.
