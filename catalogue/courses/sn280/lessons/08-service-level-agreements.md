---
lesson_id: sn280-08
course_id: sn280
pathway: servicenow-implementation-specialist
title: Service Level Agreements
order: 8
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Define SLAs, OLAs, and schedules that measure the commitment the business actually made
---

## The commitment, and the clock that measures it

An SLA implementation is where a customer's process documentation meets arithmetic, and the arithmetic usually wins the argument.

The contract says "priority 1 incidents are resolved within four hours." Ask four questions and the sentence falls apart. Four hours of what — wall clock, or working hours? Starting when — when the user noticed, when they called, when the incident was logged, or when it was correctly prioritized as P1? Does the clock keep running while you are waiting for the user to call you back? What happens if the incident is reprioritized to P2 an hour in?

None of those questions have obvious answers, and every one of them changes the measured result by hours. Your job is to get them answered in writing before you configure anything, because an SLA that measures the wrong thing is worse than no SLA — it produces a number that people trust and act on, and the number is wrong.

## Three kinds of agreement

The platform models all three with the same machinery, and the distinction is about who the parties are.

An **SLA** (service level agreement) is a commitment from the IT organization to the business or the customer. "P1 incidents resolved in four hours." It is the one the business sees.

An **OLA** (operational level agreement) is a commitment between internal teams that supports an SLA. "The network team responds to escalated tickets within thirty minutes." OLAs exist so an SLA breach can be attributed. Without them, when the four-hour SLA breaches, all you know is that IT was late.

An **underpinning contract** is a commitment from a third-party supplier. "The hardware vendor delivers a replacement part within one business day." Configured identically; the reason to distinguish it is that the remedy for a breach is contractual rather than managerial.

On the platform, all three are records on the SLA definition table with a `type` distinguishing them, and all three produce records on `task_sla`. The design implication is important: **a single task can carry several SLA records at once** — a response SLA, a resolution SLA, and an OLA for the second-line team, all ticking independently against the same incident.

## How the mechanism actually works

An **SLA definition** is a rule. When a task matches its conditions, the platform attaches a **`task_sla`** record to that task, and the `task_sla` is the thing that runs. It holds the start time, the planned end time, the elapsed time, the percentage consumed, and the eventual outcome.

The definition has five configuration surfaces, and every one of them corresponds to one of the questions in the opening paragraph.

**The table and conditions.** Which records get this SLA. `incident` where `priority` is 1. `sc_req_item` where the catalog item is one of a named set. Be precise: an over-broad condition attaches SLAs to records nobody intended to measure, and each attached SLA is a live timer doing work.

**Start condition.** When the clock begins. The three common choices, and their consequences:
- *On record creation.* Simple and defensible, and it means a mis-triaged record burns its budget while sitting at the wrong priority.
- *When priority is set / when assigned.* Fairer to the fulfilment team, easier for the business to dispute.
- *Relative to a field* — a needed-by date, a scheduled start. Necessary for request items with a promised delivery date.

**Pause condition.** When the clock stops. This is where SLA configuration earns or loses credibility, and it is almost always tied to the hold reasons you configured in lesson 3. Pausing on "Awaiting Caller" and "Awaiting Vendor" is defensible: those are not your clock. Pausing on "Awaiting Problem" is a negotiation, because the customer is still without service. Pausing on state "On Hold" *regardless of reason* is the lazy configuration, and it lets a team stop every clock by parking records.

**Stop condition.** When the SLA is satisfied. For a resolution SLA it is state Resolved, not Closed — the technician restored service; the close is administrative. For a response SLA it is typically the first work note or the first assignment to an individual. Getting response wrong is common: "the record was assigned to a group" is not a response, because a group is not a person and assignment is often automatic.

**Duration and schedule.** The length of the commitment, and the calendar it is measured against.

## Schedules are the whole game

A duration means nothing without a schedule. "Four hours" against a 24x7 schedule and "four hours" against an 8x5 schedule are different commitments, and an incident logged at 4pm on a Friday resolves at 8pm Friday under one and at noon on Monday under the other.

A **schedule** (`cmn_schedule`) is a set of time spans plus a set of exclusions. The pieces:

- **Spans** define the working periods — weekdays 08:00 to 18:00, or all day every day.
- **Child schedules** can be excluded, which is how holidays work: a holiday schedule containing the customer's non-working days is subtracted from the working schedule.
- **Time zone.** The single most-missed configuration item on any SLA implementation. A schedule has a time zone, and it can also be configured to float relative to the record — to the caller's time zone, or the assignment group's, or the instance's. Decide explicitly. A global customer running one 8x5 schedule in the head office's time zone is telling its Asia-Pacific users their incidents do not start until the afternoon.

Build at minimum three schedules for a typical ITSM engagement: a 24x7 schedule, a business-hours schedule with the customer's real hours, and a holiday schedule referenced by the business-hours one. Then map each SLA to one deliberately. P1 resolution is nearly always 24x7 — a critical outage does not wait for Monday. P4 resolution is nearly always business hours.

The platform gives you two elapsed-time measures on the `task_sla` record, and understanding the difference prevents a whole category of confused conversations: **business elapsed time** counts only time inside the schedule, while **actual elapsed time** counts wall clock. Breach is determined against business elapsed time; the actual figure is what the frustrated user experienced. Report both.

## Duration types

The **duration type** field determines how the planned end time is computed:

- **User-defined duration.** A fixed span — four hours, two business days — measured against the schedule from the start time. This covers most incident and change SLAs.
- **Relative duration.** Computed by a script against a duration-calculation record, for commitments the fixed form cannot express: "end of the next business day," "by 5pm on the third working day." The platform ships relative duration examples; write new ones only when the requirement genuinely needs them.

For request items, the promised delivery is often a date the requester chose. That is a relative duration keyed to a variable on the request, and it is one of the legitimate cases for the more complex form.

**Retroactive start** deserves a specific mention. If the SLA's start condition is met later than the record's creation — say the SLA attaches when priority is set to 1, thirty minutes after logging — retroactive start makes the clock begin at an earlier field's timestamp rather than at attachment. Use it where the business's commitment genuinely began at the earlier moment, and be aware that it can attach an SLA that is already breached the instant it is created.

## Warnings and escalation

An SLA that only tells you about a breach after it has happened is a reporting artifact, not a control. The value is in the warning.

Each SLA definition can have a **workflow or flow attached** that runs as the SLA progresses, with the percentage consumed available as a trigger. The standard pattern is three stages:

- At 50%: notify the assigned individual. Informational.
- At 75%: notify the assignment group manager. A prompt to reassign or escalate.
- At 100%: notify the service owner and flag the record. This is the breach.

Configure this with the same noise budget from lesson 3. A 50% warning on a five-day P4 SLA is an email nobody needs. Apply warnings to the SLAs where a human can still change the outcome, which in practice means the short ones.

Two further behaviors to configure deliberately. **What happens on breach** — the SLA record is marked breached and continues running, which is correct, because you still want to know how late it eventually was. And **what happens when the record changes such that the SLA no longer applies** — a P1 downgraded to P3. The definition can be configured to cancel the SLA, which is usually right, but the P1 clock's history should remain visible on the record so a reprioritization cannot be used to erase a breach.

## Attaching SLAs to requests

Everything above applies to `sc_req_item` as well as to `incident`, with two differences worth stating.

**Attach to the RITM, not the REQ.** The RITM is what the requester experiences as "my request," and a REQ containing a mouse and a server should not have one delivery commitment.

**The commitment is usually per item, not per priority.** A laptop's five-day fulfilment target and an access request's four-hour target are properties of the item, not of a priority field nobody sets on requests. Configure the SLA definition's condition against the catalog item, or against a fulfilment-target field maintained on the item, so adding a new item does not require a new SLA definition.

The second form is much better and is worth the extra effort: a single SLA definition whose duration comes from a target held on the catalog item scales to a catalog of two hundred items. Two hundred SLA definitions do not.

## Worked example: pinning down "four hours"

The customer's contract says: *"Priority 1 incidents will be resolved within four hours. Priority 2 within one business day. All incidents acknowledged within thirty minutes."*

Turned into configuration, with each ambiguity resolved and recorded:

**The acknowledgement commitment** is a response SLA, not a resolution SLA. Ambiguity: what counts as acknowledgement? Resolved as *first work note added by a member of the assignment group*, because assignment happens automatically and does not represent a human seeing the record. Duration 30 minutes. Schedule: 24x7 for P1 and P2, business hours for P3 and below — which means three definitions or one definition with a relative duration, and the customer chooses.

**P1 resolution.** Four hours, 24x7 schedule, because a critical outage does not observe office hours. Start on record creation, with retroactive start not used. Pause on hold reason "Awaiting Caller" only — the customer initially wanted to pause on any hold, and was talked out of it when shown that it would let a team stop every clock. Stop on state Resolved.

**P2 resolution.** "One business day" is the ambiguous one. It does not mean 24 hours; it means one working day. Configured as an 8-hour user-defined duration against the business-hours schedule, which subtracts the holiday schedule. A P2 logged at 4pm Friday, with an 08:00–18:00 schedule, is due at 2pm Monday — and the customer is shown that specific example and signs off on it before go-live.

**Reprioritization.** A P2 escalated to P1 cancels the P2 SLA and attaches a P1 SLA with retroactive start from the incident's creation time, because the business's position is that it was always a P1 and IT mis-triaged it. This is a *customer decision*, not a default; the alternative — starting the P1 clock at the moment of escalation — is equally defensible and is what the fulfilment teams asked for. It is written into the SLA design document either way.

**An OLA underneath.** The network team's 30-minute engagement target on escalated P1s is an OLA on `incident`, conditioned on assignment group, 24x7, so that a breached P1 can be attributed rather than argued about.

**What gets reported.** Attainment percentage per SLA definition per month; breach count by assignment group; and the list of breached records with their pause history. That last one is the audit trail that keeps the pause configuration honest.

The deliverable from this exercise is not the configuration. It is the two-page **SLA design document** that records every one of those decisions, signed by the service owner. When someone disputes a number in month four, that document is what you produce.

## Keeping SLAs honest after go-live

Three maintenance realities to design for.

**SLA repair.** When a definition changes, existing `task_sla` records do not recompute themselves. The platform provides an SLA repair mechanism that recalculates attached SLAs against the current definition. Know it exists, understand that running it over a large volume is expensive, and treat a definition change on a live instance as a change request rather than a quick edit.

**Attainment that is suspiciously high.** If a customer's SLA attainment is 99.8%, the SLA is not measuring anything. Either the targets are far looser than the actual work, or the pause conditions are being used to park the clock. Look at pause duration as a proportion of total duration; if a meaningful share of incidents spend most of their life paused, the process has found the loophole.

**Definitions that no longer attach.** A condition referencing a category that was retired quietly stops matching, and nobody notices because absence of SLA records looks like absence of problems. Build a report of records with no attached SLA where one was expected, and review it monthly.

## Practice

Work in a personal developer instance, capturing your work in one named update set.

1. **Schedules.** Build three schedules: a 24x7 schedule, a business-hours schedule matching 08:00–18:00 Monday to Friday, and a holiday schedule containing at least three dates. Configure the business-hours schedule to exclude the holidays. Verify the exclusion by checking whether a holiday date is inside the schedule.

2. **Resolution SLA.** Create a P1 resolution SLA on `incident`: four hours, 24x7, start on creation, stop on Resolved. Create a P1 incident and confirm a `task_sla` record attaches with the planned end time you expect.

3. **Business-hours SLA.** Create a P2 resolution SLA of eight hours against your business-hours schedule. Create a P2 incident with a created time late on a Friday afternoon and record the planned end time. Show your arithmetic and confirm it matches the platform's.

4. **Pause.** Configure the P1 SLA to pause when the hold reason is "Awaiting Caller" and only then. Put an incident on hold with that reason, wait, then take it off hold. Compare business elapsed time to actual elapsed time and explain the gap. Then put an incident on hold with a different reason and confirm the clock kept running.

5. **Response SLA.** Create a 30-minute response SLA that stops on the first work note rather than on assignment. Test that automatic assignment does not satisfy it.

6. **Warnings.** Attach warning notifications at 50% and 75% to one SLA. Demonstrate at least the 50% notification firing — shorten the duration to something testable rather than waiting.

7. **Request SLA.** Attach an SLA to `sc_req_item` for a catalog item you built in the previous lesson. Then write two or three sentences describing how you would restructure it so that two hundred catalog items with different fulfilment targets need one SLA definition rather than two hundred.

8. **Design document.** Write the SLA design document for the customer requirement in the worked example. One row per SLA, with columns for table, condition, start, pause, stop, duration, schedule, type, and warning actions — plus a short section recording every ambiguity you resolved and the decision taken. This document, not the configuration, is the graded artifact.

## Check your understanding

1. A P2 resolution SLA of 8 business hours against an 08:00–18:00 weekday schedule starts at 16:00 on Friday. When is it due? *14:00 on Monday (2 hours Friday, 6 hours Monday), assuming Monday is not a holiday.*
2. Why is "pause whenever state is On Hold" a weak configuration? *Any team can stop every clock by parking records; pause only on reasons that are genuinely not your clock.*
3. Which elapsed-time value decides a breach, and which did the user experience? *Business elapsed time decides breach; actual elapsed time is what the user lived through.*
4. Why attach request SLAs to the RITM rather than the REQ? *The RITM is the unit the requester experiences; one REQ can hold items with very different targets.*
