---
course_id: cse280
media_id: cse280-v02
type: video-script
title: "Writing a Finding That Survives Pushback"
format: screencast
target_runtime: "8 min"
related_lessons:
  - cse280-07
  - cse280-04
objectives:
  - Conduct a periodic security audit and drive its findings to remediation
competency_ids:
  - D7-S1-C02
---

## Purpose
After watching, the learner can turn a raw observation into a five-element finding (condition, criteria, cause, effect, recommendation) with severity and metadata, defend it using criteria rather than opinion, and write a closure record that includes independent verification and residual risk.

## Audience and prerequisites
Apprentices in lesson 07. Screen shows an editor and the evidence folder. Uses observation 1 from the lesson 07 practice (db-tier open to 0.0.0.0/0).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Slack-style message: "hey the db SG is wide open lol, someone should fix". | "This is an observation. It's true, it matters, and as written it will never get fixed — no owner, no criteria, no date. Let's make it a finding." |
| 0:20 | Editor: heading `FINDING INT-2026-Q3-004` and metadata block (Severity, Control, Owner, Due, Status) left blank. | "Five elements, plus metadata. We'll fill the metadata last, because severity should come from reasoning, not from how the observation made you feel." |
| 0:40 | Evidence folder: `evidence/2026-07-06-security-groups.json`; jq output showing the rule. | "Condition first: what you observed, and how. Resource ID, the exact rule, the dated export it's in. Configuration history gives the date it appeared and the session that added it." |
| 1:20 | Condition paragraph typed (as in lesson 07). | "No adjectives. 'sg-0a41f9 permits tcp/5432 from 0.0.0.0/0, observed in this file, present since 19 May, 48 days of the period.'" |
| 1:50 | Criteria paragraph typed, cursor highlighting "NET-02". | "Criteria: what should be true and where that comes from. This is the element amateurs skip, and without it the finding is just your opinion. NET-02 from the control mapping, which traces to section 4.5 of the customer addendum." |
| 2:30 | Cause paragraph typed. | "Cause: mechanism, not blame. Added in the console during incident INC-2210, never reverted, not in the infrastructure code, and no drift detection to notice. Note there's no name of a careless person here." |
| 3:10 | Effect paragraph typed. | "Effect: proportionate. Patient data reachable from any internet host; credentials still required; no unauthorised logins observed; commitments in the addendum not met. Calling everything catastrophic gets your whole report discounted." |
| 3:50 | Recommendation list typed: 1 Immediate, 2 Structural, 3 Preventive, 4 Process. | "Recommendations: one for the instance, three for the class — drift detection, an org guardrail denying 0.0.0.0/0 on database ports, and an incident-closure step that reverts or codifies emergency changes. Fix only the rule and you write this finding again next quarter." |
| 4:30 | Severity table from lesson 07; ticks against "internet reachable", "restricted data", "whole period". Metadata filled: Critical, Due 7 days. | "Now severity, from the published scale: internet-reachable, restricted data, most of the period. Critical, fix within seven days. Owner named. Status open." |
| 5:00 | Role-play overlay: "Finding owner: 'This is overstated — you need a password to get in.'" | "The owner pushes back. Don't argue about how bad it feels. Point at criteria: NET-02 is about network reachability, not authentication. The control requires a named source. The rule has none. The criteria carry the argument." |
| 5:40 | Closure record typed: action with CHG, verification by A. Reyes, new dated export, prevention, residual. | "Closing it takes four things: fixed through change control, verified by someone who didn't make the change, evidenced with a new dated export, and prevented. Then the residual line — the guardrail covers database ports only. Partial fixes described as complete come back to bite." |
| 6:40 | Side-by-side: original Slack message vs finished finding. | "Same fact. One is a complaint. The other gets fixed, gets verified, and stops the next one." |
| 7:10 | End card: "Lesson 07, Exercise 2: write three findings." | "Your turn: three findings, at least one that's an evidence gap rather than a technical one." |

## On-screen assets and B-roll
- The finding and closure texts from lesson 07, typed live (pre-rehearsed).
- `jq '.SecurityGroups[] | select(.GroupId=="sg-0a41f9")'` against the fixture from project cse280-x01.

## Accessibility
- Captions; each element's heading is read aloud before its text.
- Severity table ticks use ✓ symbols with labels.
- Provide the finished finding and closure record as text.

## Check for understanding
1. Which element turns an opinion into a finding? *Answer: Criteria — the cited control, policy, or benchmark item.*
2. Why must verification be done by someone other than the fixer? *Answer: Self-verification lets findings close while still true; independence is part of the evidence.*
3. What is a "residual" line for? *Answer: To record the part not yet remediated as tracked risk, instead of describing partial remediation as complete.*
