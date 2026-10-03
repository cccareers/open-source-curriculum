---
lesson_id: ai201-10
course_id: ai201
pathway: prompt-engineer
title: Integrating AI into Existing Operations
order: 10
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Integrate an AI workflow into an existing operation with a rollout plan people will actually adopt
---

## Working automations that nobody uses

The most common outcome for a well-built internal automation is not failure. It is a quiet, polite abandonment: the workflow runs, the queue fills, and the team keeps doing it the old way because the old way is theirs and the new way arrived on a Tuesday with no warning. Six weeks later someone turns it off.

Integration is the discipline that prevents this. It is half systems work — deciding which system stays authoritative, where your workflow writes, how the two stay consistent — and half change work, which is about people whose job you are altering. Both halves are engineering problems in the sense that they have designs, failure modes, and tests. Neither is optional, and the people half is the one that actually kills projects.

You have a working automation from the previous lessons and a baseline from your process map. This lesson turns those into a rollout plan someone will sign, a runbook someone can operate, and a coexistence design that does not corrupt the systems the business already depends on.

## Mapping the seam

Start with the systems. Draw the boundary between what your workflow owns and what it merely touches.

**Name the system of record for every field.** For each field your workflow reads or writes, one system is authoritative. The CRM owns the customer's contact details. The ticketing system owns case status. Your workflow's table owns the AI classification, the confidence, the review state, and the audit trail. Write this down as a table, because ambiguity here becomes a data-quality incident later.

**Decide the write pattern.** Three options, in increasing order of risk:

- *Read-only.* Your workflow reads from the system of record and writes nothing back, keeping its outputs in its own store. Safest, and often enough for a first phase. The cost is that people must look in two places.
- *Write to a dedicated field.* Your workflow writes only into fields created for it — `ai_category`, `ai_confidence`, `ai_reviewed_by`. Nothing existing is overwritten, and a rollback is a matter of ignoring those fields.
- *Write to existing operational fields.* Your workflow sets the real status, the real assignee, the real due date. Most valuable, highest risk, and it requires that your idempotency and state gating from lesson 03 are genuinely sound, because now a duplicate run moves real work.

Earn the third by running the second successfully. A phase-one automation that writes to dedicated fields lets the team compare the AI's answer with their own for a month, and that comparison is the strongest adoption argument available to you — far stronger than a demo.

**Handle the two-way problem.** If a person edits a record your workflow also writes, decide who wins and make it visible. The usual answer: human edits always win, and your workflow stops writing to a record once a human has touched the field (a `human_overridden` flag, checked before every write). Silent overwriting of a person's correction is how you lose a team permanently.

**Check the boring integration constraints** before you promise a date: API rate limits at your real volume, permission scopes for the service account, whether the sandbox reflects production, field-level permissions, and what happens to your workflow during the system's maintenance windows.

## Coexistence patterns

You do not switch a process from manual to automated. You move it along a ladder, and each rung is a real operating mode with its own exit criteria.

| Mode | What the automation does | What the person does | Exit criterion to advance |
| --- | --- | --- | --- |
| **Shadow** | Runs on live data, writes to its own store only. Output invisible to the team. | Everything, unchanged. | Agreement rate with human decisions above target over N cases |
| **Suggest** | Writes a visible suggestion alongside the work. | Everything, but can see the suggestion. | Team reports the suggestion is usually right; measured acceptance above target |
| **Assist** | Prepares the work: drafts, pre-fills, classifies, routes. | Reviews and completes every case. | Review time down, edit rate stable, zero unrecovered incidents |
| **Auto with review** | Completes the work; a person approves before anything external happens. | Approves, edits, or rejects. | Wrong-approval rate near zero at agreed sampling |
| **Auto with sampling** | Completes and acts; a sample is reviewed after the fact. | Reviews the sample and the exceptions. | Only where the scope contract permits it |

Two rules about the ladder. **Shadow mode is not optional** — it is the cheapest possible way to discover that your classifier disagrees with the team 30% of the time, and discovering that after go-live costs you the team's trust. And **the customer-facing steps in this course stop at "auto with review."** Advancing past that gate is a business decision requiring named accountability and measured evidence, not a rollout milestone you tick off.

Write explicit exit criteria with numbers and a minimum sample, agreed before the phase starts. "We will advance from shadow to suggest when agreement with the reviewer exceeds 90% over 200 consecutive cases, measured over at least two weeks." Without pre-agreed criteria, the advance decision gets made by whoever is most enthusiastic that week.

## The pilot

Scope the pilot to be small enough to fail safely and real enough to prove something.

**One team, one queue, one process.** Not three departments. Not the whole inbox — one category from it.

**A defined window** with a start and an end date, typically two to six weeks, plus a scheduled decision point. A pilot with no end date becomes a permanent unsupported system.

**Measured against the baseline you already have.** Your process map gave you annual hours, median and 90th-percentile cycle time, error rate, and exception volume. Measure the same things, the same way, over the pilot. Same-way matters: if you change the definition of cycle time between baseline and pilot, your result is not evidence of anything.

**Success criteria set in advance**, including the criteria for stopping. Write both:

```text
PILOT: Quote-request triage, Quotes team, 4 weeks from 2026-04-06.

Success (all must hold at the decision point):
- Median time to first response: 5.4h baseline -> under 2.5h
- Classification agreement with reviewer: >= 90% over >= 200 cases
- Draft edit rate: <= 60%, with no draft sent containing an invented fact
- Team survey: >= 4 of 6 reviewers say the queue is easier than before

Stop immediately if:
- Any customer receives an unreviewed automated message
- Wrong-fact rate in reviewed drafts exceeds 2% in any week
- Median time to first response exceeds the 5.4h baseline in any week
- The team asks to stop
```

That last stop condition is real and it should be in writing. A team that cannot stop a pilot has been given a mandate, not a pilot, and they will disengage accordingly.

**Choose the pilot team for candour, not enthusiasm.** The team that will tell you it is worse is more valuable than the team that will be polite about it.

## The people half

The systems work is the easy half. Here is what the other half requires.

**Talk to the affected team before you build, not at launch.** They know the exceptions you did not observe, and they will tell you if they are consulted and not if they are informed. The process-mapping lesson had you shadow them; keep them involved through the build, and show them the ugly version early.

**Answer the job question honestly and first.** People whose work you are automating are asking one question, whether or not they say it out loud. Not answering it does not make it go away; it makes it the subject of every conversation you are not in. If the intent is redeploying time to higher-value work, say so specifically — which work, whose decision, on what timeline. If headcount is genuinely affected, that is a decision above your level and it must be communicated by whoever owns it, before the rollout, not discovered from a workflow. Do not promise things you do not control.

**Give the team authority over the automation.** Reviewers who can reject, reclassify, override, and switch the automation off for their queue will engage with it. Reviewers who can only approve will rubber-stamp it, which destroys both the safety property and the feedback signal you need.

**Identify the named roles** and get real people into them before launch:

- **Process owner** — the business person accountable for the outcome, who can say stop.
- **Workflow owner** — the person who maintains it after you move on. If this is unfilled, you do not have a rollout, you have a demo with a longer tail.
- **Reviewers** — named, trained, with the queue in their working routine and time allocated for it.
- **Escalation contact** — who a reviewer asks when the automation does something strange.

**Train on the exceptions, not the happy path.** A twenty-minute session covering how to reject, what the confidence score means and does not mean, what to do when the queue backs up, and who to call. Then sit with each reviewer for their first few real cases.

## The runbook

The runbook is what makes the automation supportable by someone who did not build it. One page, stored with the workflow, kept current.

```text
RUNBOOK: quote-intake-triage

PURPOSE       One paragraph: what it does, for whom, and what breaks if it stops.
OWNERS        Process owner, workflow owner, escalation contact, with contact details.
SCHEDULE      Triggers, cadence, expected daily volume, quiet hours.
DEPENDENCIES  Systems and credentials touched; who administers each; rate limits.
NORMAL        What a healthy day looks like: run counts, queue depth, typical latency.
MONITORING    Alerts that exist, what each means, who receives it.
COMMON ISSUES Symptom -> likely cause -> first action. At least the five you have seen.
MANUAL FALLBACK  Exact steps to run the process by hand. Must be tested, not assumed.
KILL SWITCH   How to stop it in under two minutes, who may, and what happens in flight.
ROLLBACK      How to revert to the previous state, including any data written.
CHANGE LOG    Date, change, who, why.
```

Two entries carry disproportionate weight.

**The kill switch must be genuinely fast and genuinely available.** A single flag the workflow checks at its first step, flippable by the process owner without your help, at 6pm, from a phone. Test it. Then define what happens to work in flight: cases already in a review queue should remain workable, cases mid-run should land in a recoverable state, and the team should be told the switch was thrown.

**The manual fallback must be tested.** Run the process by hand for a day, with the runbook as the only instruction, performed by someone other than its author. Six months in, the people who remember the manual process will have moved on, and an untested fallback is a rumour.

## The decision point

At the end of the pilot, hold an actual meeting with the actual numbers and make one of four calls: **advance** a rung, **extend** with named changes, **hold** at the current mode, or **stop**. Write the decision, the evidence, and the date.

Bring: baseline versus pilot on every agreed metric, the incident list with resolutions, the team's feedback in their words, the running cost, and your honest recommendation including what you would do differently. Present the numbers that disappoint you first — a rollout report that only contains good news teaches the room to discount all of it, and the one thing that has to survive this meeting is that people believe your measurements.

## Practice

Take the workflow you built in lesson 08 or 09 and produce a complete integration package for it, then execute the first phase.

1. **Map the seam.** A table naming, for every field the workflow reads or writes, the system of record, the write pattern (read-only, dedicated field, operational field), and the conflict rule when a human edits it. Implement the `human_overridden` check for at least one field and prove your workflow stops writing to it.
2. **Choose the coexistence mode** for phase one and write exit criteria with a number and a minimum sample for each subsequent rung. Justify why you are not starting further up the ladder.
3. **Write the pilot plan**: team, queue, window, decision date, the baseline figures from your process map, success criteria, and stop conditions including a team-requested stop.
4. **Name the four roles** with real people, and note for each what they must be able to do that they cannot do today. If you cannot name a workflow owner, write down what that means for the project.
5. **Run shadow mode for at least a week** on live or realistic data. Log the automation's decision alongside the human's for every case and compute the agreement rate. Report the three cases where they disagreed most instructively and what you changed as a result.
6. **Write the runbook**, all eleven sections. Include at least five real common issues drawn from problems you actually hit.
7. **Build and test the kill switch.** Flip it, confirm the workflow stops at its first step within two minutes, and document what happened to work in flight. Have someone other than you flip it, using only the runbook.
8. **Test the manual fallback.** Have someone else run the process by hand from the runbook for at least three cases. Every place they had to ask you a question is a gap in the runbook; fix them all.
9. **Hold the decision point** with a peer or the process owner. Present baseline versus pilot, the incidents, and a recommendation. Write down the decision, the evidence, and one thing you would design differently next time.
