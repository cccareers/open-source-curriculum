---
course_id: sn280
media_id: sn280-v01
type: video-script
title: "Pinning Down \"Four Hours\": Configuring and Testing an SLA"
format: hybrid
target_runtime: "9 min"
related_lessons:
  - sn280-08
  - sn280-03
objectives:
  - Define SLAs, OLAs, and schedules that measure the commitment the business actually made
competency_ids:
  - D2-S1-C04
---

## Purpose
After watching, the learner can turn a contract sentence into a schedule and an SLA definition with explicit start, pause, and stop conditions, and can prove the configuration with a short test SLA and the `task_sla` record.

## Audience and prerequisites
Learners who have completed sn280 lessons 3 and 8 reading. A PDI with ITSM demo data; admin. Familiarity with hold reasons from lesson 3.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, contract excerpt on screen: "Priority 1 incidents will be resolved within four hours." | "Every SLA starts as a sentence like this, and every one of these sentences is hiding four decisions. If you configure before you've made them, the number you produce will be trusted — and wrong." |
| 0:20 | Four cards appear: "Four hours of what?", "Starting when?", "Paused when?", "What if priority changes?" | "Four hours of what — wall clock or working hours? Starting when? Paused when? And what if the priority changes halfway? Let's answer each one on the instance." |
| 0:40 | Screencast: System Scheduler > Schedules > New. Name "Northwind Business Hours", Time zone set explicitly. Add schedule entry: Mon–Fri 08:00–18:00, repeats weekly. | "Decision one is the schedule. New schedule: Northwind Business Hours. First field I set is the time zone, deliberately — leave it blank and you'll be measuring someone else's working day. One entry: weekdays, eight to six." |
| 1:15 | Create "Northwind Holidays" with two dates; back on business hours, add it under Child Schedules with Type = Exclude. | "Holidays are their own schedule, excluded from this one. Two dates for now. Now a holiday doesn't count as working time." |
| 1:40 | Create "24x7" schedule (or show existing). | "And a 24x7 schedule. A P1 outage doesn't wait for Monday." |
| 1:55 | Service Level Management > SLA Definitions > New. Name "NW P1 Resolution", Type SLA, Table Incident, Duration 4 hours, Schedule 24x7. | "Now the definition. Type SLA — not OLA, not underpinning contract. Table: incident. Four hours, against the 24x7 schedule." |
| 2:20 | Start condition tab: Priority is 1 - Critical. Highlight retroactive start (unticked). | "Decision two, start. Priority is 1 - Critical. Retroactive start stays off — for now. I'll come back to it." |
| 2:40 | Pause condition tab: State is On Hold AND Hold reason is Awaiting Caller. | "Decision three, pause — and this is where SLAs lose credibility. Not 'state is On Hold'. On Hold *and* reason Awaiting Caller. Waiting on the caller isn't Northwind's clock. Waiting on a vendor is." |
| 3:10 | Stop condition: State is Resolved. Callout: "Resolved, not Closed". | "Stop: Resolved. Not Closed — the technician restored service at Resolved; closing is paperwork." |
| 3:25 | Save. Insert and Stay → rename "NW P1 Resolution — TEST", duration 10 minutes, add Start condition: Short description starts with [SLATEST]. | "Nobody's going to wait four hours to test this. Insert and stay to copy it, call it TEST, make it ten minutes — and add a start condition so it only attaches to records whose short description starts with SLATEST. That keeps it away from real tickets." |
| 3:55 | New incident: "[SLATEST] North MRI workstation down", Impact 1, Urgency 1. Save. Task SLAs related list shows two rows. | "Create a P1 with the tag. Scroll down: Task SLAs. Two attached — the real four-hour one and our ten-minute test, ticking independently on the same incident." |
| 4:20 | Open TEST task_sla: show Start time, Planned end time, Business elapsed, Actual elapsed, Business elapsed percentage. | "Open the test one. Start time, planned end — ten minutes out. Business elapsed and actual elapsed are both counting." |
| 4:40 | Jump-cut "2 minutes later". Set State On Hold, Hold reason Awaiting Caller. Save. Back to task_sla: Stage = Paused. | "Two minutes in, I put it on hold — awaiting caller. The task SLA's stage reads Paused." |
| 5:00 | Jump-cut "3 minutes later". Back to In Progress. task_sla: Pause duration ≈ 3 min; business elapsed ~2 min; actual ~5 min. | "Three minutes later, back to In Progress. Look at the numbers: about two minutes business elapsed, about five actual, three minutes of pause. That gap is the caller's time." |
| 5:30 | On Hold with reason Awaiting Vendor; wait 2 min; stage still In progress; business elapsed increased. | "Now on hold again, but awaiting vendor. Stage stays In progress, and business elapsed keeps climbing. Exactly what we decided." |
| 6:00 | 50% notification in System Logs > Emails (if warning configured); then breach: Has breached = true, stage still In progress. | "Once it crosses its target, Has breached flips to true — and the timer keeps running. A breach doesn't stop the clock; you still want to know how late it was." |
| 6:30 | Try to resolve without close code → blocked by data policy (from lesson 3). Fill close code, resolve. task_sla stage = Completed. | "Resolve it — the data policy from lesson 3 insists on a close code first. Now resolved, and the task SLA moves to Completed." |
| 6:50 | Talking head + whiteboard: P2 at Friday 16:00, 8 business hours → Monday 14:00. | "Same thinking for 'one business day'. It isn't twenty-four hours. Eight working hours from four p.m. Friday is two on Friday plus six on Monday — due at two p.m. Monday. Put that exact example in front of the customer and get a signature." |
| 7:30 | Back to definition: retroactive start option explained; P2→P1 scenario diagram. | "Decision four, reprioritization. If a P2 becomes a P1, does the P1 clock start now, or from when the incident was logged? Retroactive start makes it the latter. Both are defensible. It's the customer's call, written down — not your default." |
| 8:10 | Show SLA design note template table (columns: table, condition, start, pause, stop, duration, schedule, type, warnings). | "Which brings us to the real deliverable: the SLA design document. One row per SLA, plus every ambiguity and the decision taken. When someone disputes a number in month four, this is what you produce." |
| 8:40 | End card: "Deactivate your TEST SLA when done." | "Last thing: deactivate your TEST SLA when you're finished. Then try the pause with a different hold reason and predict the numbers before you look." |

## On-screen assets and B-roll
- PDI with ITSM demo data; the data policy from lesson 3 already in place.
- Jump-cut cards showing elapsed real time ("3 minutes later").
- Whiteboard graphic for the Friday→Monday arithmetic (reuse sn280-a01 scene 4 still).
- Producer note: module names (System Scheduler > Schedules; Service Level Management > SLA Definitions), the warning mechanism (SLA flow vs notification), and `task_sla` field labels vary by release — verify before recording.

## Accessibility
- Captions and transcript; every numeric value on the `task_sla` record is read aloud.
- The Paused/In progress stage is announced verbally, not only shown.
- Zoom ≥ 150% on condition builders; color is never the only indicator (the stage text is shown).
- Provide the condition strings in the transcript as text.

## Check for understanding
1. Why did the TEST SLA keep counting while the incident was on hold awaiting a vendor? — *The pause condition requires hold reason Awaiting Caller; a vendor wait is still Northwind's commitment.*
2. What happened to the SLA after it breached? — *Has breached became true and the timer kept running until the stop condition (Resolved).*
3. A P2 of 8 business hours starts Friday 16:00 on an 08:00–18:00 schedule. When is it due? — *Monday 14:00, unless Monday is a holiday.*
