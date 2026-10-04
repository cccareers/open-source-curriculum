---
course_id: sn330
media_id: sn330-v01
type: video-script
title: "Designing Meridian's Onboarding: The Activity Set Table"
format: whiteboard
target_runtime: "8 min"
related_lessons:
  - sn330-06
  - sn330-10
objectives:
  - Design a lifecycle event that coordinates onboarding or offboarding activities across departments
competency_ids:
  - D4-S1-C03
---

## Purpose

After watching, the learner can turn an onboarding requirement into an activity set table with set-level conditions, start-date anchors, owners, activity types, and blocking flags, and explain why conditions belong on sets.

## Audience and prerequisites

Learners on lesson 6, before the course project. No instance needed; the video is a whiteboard walkthrough using the Meridian Logistics scenario from lesson 10.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard: a messy spreadsheet photo labelled "Meridian onboarding tracker" with 30 rows. | "Meridian Logistics hires about forty people a month. Their onboarding works, mostly. It fails quietly: laptops arrive late, accounts appear on day three, and nobody knows until the new hire says so." |
| 0:20 | Title card. | "Designing a lifecycle event: the activity set table." |
| 0:25 | Draw four nested boxes: Lifecycle event > Activity set > Activity; beside it, a separate box "Lifecycle event case (one per hire)". | "Four objects. The lifecycle event is the definition. Activity sets group activities that share a condition and a timing anchor. Activities are the units of work. And a lifecycle event case is one run, for one person." |
| 0:55 | Draw a timeline with "Start date = day 0" in the middle; tick marks at -14, -10, -2, 0, +7, +30. | "Everything hangs off one driving date. For onboarding, the start date. Every due date is relative to it." |
| 1:15 | Write table headers: Set (condition), Activity, Type, Owner, Anchor, Blocking, Employee-visible. | "Before you touch the instance, you write this table. One row per activity." |
| 1:30 | Fill rows: Pre-boarding (always): Verify right-to-work documents / HR task / HR shared services / Start -14d / Yes / No. Background check / Integration trigger / Vendor / -14d / Yes / No. | "Pre-boarding runs for everyone. Right-to-work verification is an HR task for shared services. The background check is an integration trigger, not a task telling someone to log in to a vendor site. Both block: if either fails, onboarding stops." |
| 2:15 | Rows: Provisioning (always): Order laptop / Catalog request / IT / -10d / No / No. Assign workspace / Catalog request / Facilities / -5d / No / No. | "Provisioning. Here is the most important choice in the table. The laptop is a catalog request into IT's existing queue. Not an HR task. IT works it the way they always do, and IT never needs to read the HR case." |
| 2:50 | Circle "Catalog request" and draw an arrow to a box "IT queue: sees requested item only". Cross out a dashed arrow from IT to "HR case". | "That one decision solves a security requirement and a workload problem at the same time. If you make everything an HR task, the coordinator gets thirty tasks and emails five departments. That is the spreadsheet again." |
| 3:20 | Rows: Relocation (relocating = true): Engage relocation vendor / HR task / Mobility team / -30d / No. | "Now conditions. Relocation applies to about one hire in twenty. The condition goes on the set, once, not on each of its eight activities. When the policy changes, you edit one condition." |
| 3:50 | Rows: Immigration (sponsorship required), Manager track (hire is a people manager). Mark both conditional. | "Two more conditional sets: immigration, owned by the immigration COE, and a manager track for people leaders." |
| 4:15 | Rows: Day one (always): Collect badge / HR task / Facilities / 0 / No. First 30 days (always): Enrol in benefits / Employee to-do / New hire / +1 to +30 / No / Yes. Acknowledge code of conduct / Acknowledgement / New hire / +7 / Yes / Yes. | "Day one and the first thirty days. Notice the new hire's own items are to-dos and acknowledgements, not HR tasks. The acknowledgement produces an auditable record: that is the point of it. Benefits enrollment has a legal deadline, so it gets reminders and an escalation, not just a due date." |
| 5:00 | Highlight the Owner column; count "HR" entries. | "Now read the owner column. If you wrote HR eleven times, you have designed a coordinator's inbox, not a distributed process." |
| 5:20 | Highlight the Blocking column; draw an arrow from failed background check to a stop sign before Provisioning and Day one. | "Read the blocking column. A failed background check must stop downstream sets, notify the right people, and close the case in a defensible state." |
| 5:50 | Timeline: drag "Start date" one week later; arrows show open activities shift, completed ones stay, coordinator bell icon rings. | "Two hard problems. The date moves: decide that open activities reschedule, completed ones stay, and the coordinator is told. Then test it." |
| 6:20 | Timeline: start date only 3 days away; the -14 and -10 ticks fall in the past and turn into warning triangles. | "The timeline is compressed: a hire starting in three days. Never create an activity that is already overdue with no signal. Make it due now and escalate, or warn the coordinator at creation." |
| 6:50 | Write four test personas: standard US hire, relocating hire, sponsorship hire, manager hire, plus "missing country". | "Test with a population, not one perfect user: the four conditional profiles, plus someone with missing data. Predict which sets each should get, then compare." |
| 7:20 | Recap: "Conditions on sets. Anchor to the start date. Catalog requests for other departments. Decide blocking. Test date moves." | "Conditions on sets. Anchor to the start date. Let other departments work in their own queues. Decide what blocks. And test the date moving." |
| 7:45 | End card. | "Write your offboarding table next: lesson 6, practice step 1." |

## On-screen assets and B-roll

- Whiteboard or tablet; pre-printed table grid to save drawing time.
- Timeline graphic reusable in animation sn330-a01.

## Accessibility

- Captions and transcript; the completed table is provided as a text table in the transcript.
- Highlighting uses circles and arrows, not color alone; blocking rows are marked with the word "Yes".
- Handwriting at large size; narration reads every cell written.

## Check for understanding

1. Why put the relocation condition on the activity set instead of on each relocation activity? *Answer: it is written once and governs every activity in the set; policy changes are one edit.*
2. Why is IT laptop provisioning a catalog request rather than an HR task? *Answer: IT works in its existing queue without HR case access, and the coordinator is not turned into a relay.*
3. A hire starts in three days. What must not happen to the "-14 days" background check activity? *Answer: it must not be silently created already overdue; it should be due immediately with escalation, or trigger a coordinator warning.*
