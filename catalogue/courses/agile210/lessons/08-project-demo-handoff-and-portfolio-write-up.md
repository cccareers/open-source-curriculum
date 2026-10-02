---
lesson_id: agile210-08
course_id: agile210
pathway: prompt-engineer
title: "Project: Demo, Handoff, and Portfolio Write-Up"
order: 8
kind: project
competency_ids:
  - D4-S1-C04
  - D4-S1-C05
objectives:
  - Demonstrate the capstone, hand it over with documentation, and write it up
    for a portfolio
---

## Goal

This is stage 7 of 7 of your capstone, the last pass over the same build.

Put the solution in front of the people it was built for, **collect real feedback and act on it**, **demonstrate** the finished thing, **hand it over** with documentation somebody else can operate from, and **write it up** as a portfolio artefact that will still make sense to a stranger in a year.

The temptation at this point is to treat the remaining hours as presentation polish. Resist it. The first requirement below is a real feedback session with a real user, and it will change the solution — that is why it comes before the demo rather than after.

## What you inherit from stage 07

- **A tested, hardened build**, with monitoring that has been observed firing.
- **The evaluation results**, including the numbers that disappointed you. They go in the write-up unedited.
- **The success-criteria scorecard** against the brief. This is the spine of both the demo and the write-up.
- **The findings and remediation table** from stage 06, whose accepted risks become documented known limitations.
- **The postmortem and the failure-injection log**, which become the troubleshooting section of your runbook.
- **The interface designs** from stage 03, which are about to be tested by someone who did not design them.

## Requirements

Four deliverables.

### 1. User feedback session, and one refinement from it

Sit a real user — the person who feels the pain, or your instructor in that role — in front of the solution and **watch them use it**. Not a walkthrough where you drive. They drive.

Structure it:

- **Give them two or three real tasks**, phrased as outcomes rather than steps. "Process the invoices that came in this morning" — not "click here, then here".
- **Say almost nothing.** When they get stuck, wait. The stuck moments are the entire value of the session; the instinct to rescue them destroys the data.
- **Record what happens, not what they say about it.** Where they hesitated, what they misread, what they clicked that did nothing, what they expected to see and did not, which output they trusted and which they double-checked.
- **Ask afterwards**, in this order: what would you change first, what would stop you using this, and what did you expect that wasn't there.
- **Ask about the AI specifically.** Could they tell which parts were generated? Did they know what to do when they disagreed with it? Did they trust it more or less than they should have?

Write it up as an observation log:

| # | Task | What happened | What it means | Severity |
| --- | --- | --- | --- | --- |
| 1 | Clear the review queue | Approved three items without opening the source document | Interface makes approving easier than checking | High |
| 2 | Handle a flagged record | Looked for a "send back" action, found only reject | Missing escalate affordance at this touchpoint | Medium |

Then **implement at least two refinements** from what you observed, at least one of which is High. Show the before and the after, and re-test with the same user or a second one where you can. A feedback session with no change made is a survey, not a feedback loop.

If the session surfaces something you cannot fix in the hours remaining, it goes in the known-limitations list with a note on what you would do — honest, and much more credible than silence.

### 2. Demonstration

A live demonstration to your instructor and, where possible, your stakeholder. Fifteen to twenty minutes plus questions. Structure:

1. **The problem, in the client's words** — thirty seconds, no technology mentioned.
2. **What it does now** — one paragraph, plain language.
3. **A real record, live, end to end.** Real input, actual run, the human review step performed properly, the real output. Not a recording, not a rehearsed happy path with a pre-made record.
4. **A failure, deliberately** — a low-confidence result, a quarantined input, or an injected fault — showing what the system does when it does not know. This is the part that distinguishes a builder from a demo.
5. **The numbers** — the success-criteria scorecard, met and unmet, with sample sizes.
6. **Risk and limits** — what it must not decide alone, what personal data it holds, the accepted risks, the known limitations.
7. **Cost and next increment** — per-record cost at real volume, and the "out of scope, for now" list from your brief as a proposal.

Expect to be asked: where is it wrong most often, what happens when the model is unavailable, who can turn it off, what would break first at ten times the volume, and what would you do differently. Prepare an answer to each. "I don't know" with a stated way to find out is an acceptable answer; a confident wrong one is not.

### 3. Handover package

Write it for the person who inherits this and has never seen it. The test is not whether it is complete; it is whether they can operate it without you.

```markdown
# <Solution name> — operations pack

## What this does and who it is for
One paragraph, plain language, plus the process it replaced.

## How to run it
Normal operation: what is automatic, what a human does, when.
Where the review queue lives and what "done" looks like.

## What normal looks like
Expected volumes, expected escalation rate, expected timings.
So an operator can recognise abnormal without being told.

## Accounts, access, and credentials
Which accounts, who owns them, what needs rotating and how often.
No secrets in this document — only where they live and who holds them.

## Monitoring and alerts
Each alert, what it means, who receives it, what to do first.

## Common problems and fixes
From the stage-07 injection log and the postmortem.
Symptom, likely cause, first thing to check, fix.

## Manual fallback
How to do the work by hand if the solution is unavailable.

## How to turn it off
The kill switch: where it is, who can use it, what happens to
work already in flight.

## What it must not do
The responsible-AI policy boundaries, in operator language.

## Data and privacy
What is held, for how long, what deletes it, how to handle a
request from an individual about their data.

## Known limitations
Everything it does not handle, plus the accepted risks from the review.

## Change log and prompt versions
What changed, when, and which prompt versions are live.
```

Two sections must be **tested, not written**: someone other than you performs the **manual fallback** for at least one case using only the document, and someone other than you uses the **turn-it-off** procedure. Every question they have to ask you gets folded back into the pack — that list of questions is the real quality measure of your documentation.

Add a short **alignment note**: what the stakeholder originally asked for, what was actually delivered, where the two differ and why, and what you and they agreed happens next. Get them to confirm it. A handover neither party has agreed to is a handover that is disputed later.

### 4. Portfolio write-up

Two to four pages, plus screenshots, written for a reader who has not met you and is deciding whether you can do this work.

- **The problem and its context**, with real numbers.
- **What you built**, with an architecture diagram — the stage-03 component map, updated to match what actually exists.
- **The decisions you made and why**, especially where you chose a rule over a model, narrowed scope, or changed the design after a finding. Decisions with reasons are what distinguish a professional artefact from a screenshot gallery.
- **Results**, from the scorecard: measured, with sample sizes and dates, including what was not met.
- **What went wrong and what you did about it** — the postmortem, the injected failures, the feedback session findings. This section is usually the most persuasive one in the whole document, and it is the one people cut first.
- **Risk, privacy, and responsible AI**, summarised honestly, with the accepted risks named.
- **What you would do next**, and what you would do differently with the forty hours again.

Redaction rules apply throughout: no credentials, no personal data, no client-confidential material without permission. Where the client is confidential, describe the domain generically and say you have done so.

## Constraints

- **Demonstrate live on real input.** A pre-recorded happy path is not a demonstration of a working solution.
- **Show a failure.** A demo without one is a sales pitch.
- **The feedback session is real observation.** You do not drive, and you do not narrate. Watching is the requirement.
- **At least two refinements are implemented, not just recommended.**
- **The handover pack must work without you.** Two of its sections are tested by someone else, and that test is part of the deliverable.
- **No new features in this stage.** Refinements from feedback and documentation only. The build closed at the end of stage 07; adding a feature now means shipping something untested.
- **Nothing gets quietly dropped.** Every unmet criterion, accepted risk, and known limitation appears in the demo, the handover pack, and the write-up. If it is in one, it is in all three.
- **No credentials or personal data anywhere in the artefacts**, including in screenshots and slides.
- **Four hours.** Roughly one hour on the feedback session and refinements, half an hour preparing the demo, one hour on the handover pack and its tests, and ninety minutes on the write-up.

## Definition of done

**Feedback**

- A real user completed real tasks unaided while you observed.
- An observation log records behaviour, not just opinions, with severities.
- Trust and disclosure were explicitly probed: could the user tell what was AI-generated, and did they know what to do when they disagreed.
- At least two refinements implemented, at least one High, with before and after evidence.
- Anything unfixable is recorded as a known limitation with a proposed remedy.

**Demonstration**

- Delivered live, on real input, within time.
- The human review step was performed as part of the run, not skipped.
- A deliberate failure case was shown and explained.
- The success-criteria scorecard was presented, unmet criteria included.
- Risks, limits, cost at real volume, and the next increment were covered.
- Questions were answered without overclaiming.

**Handover**

- Every section of the operations pack is filled with specifics.
- No secret values appear anywhere in it.
- The manual fallback was executed by someone else from the document alone.
- The turn-it-off procedure was executed by someone else.
- Every question they asked you has been folded back into the pack.
- The alignment note states asked-for versus delivered, the differences and reasons, and the agreed next steps, confirmed by the stakeholder.

**Write-up**

- Two to four pages covering problem, build, decisions, results, failures, risk, and next steps.
- Architecture diagram matches what actually exists.
- Every number carries its sample size and date.
- At least one honest account of something that did not work.
- Fully redacted.

## Rubric

| Criterion | Not yet | Meets | Strong |
| --- | --- | --- | --- |
| Feedback session | Asked the user for opinions; nothing changed | Real observation, logged with severities, two refinements implemented | A refinement that changed the design, re-tested with a user |
| Demonstration | Recorded or rehearsed happy path | Live, real input, review step performed, failure case shown, numbers presented | Handled hard questions without overclaiming; explained a limitation unprompted |
| Handover | A document listing steps | Complete pack, no secrets, fallback and shutdown both tested by someone else | Their questions visibly folded back in; a genuinely operable pack |
| Alignment | No record of what was agreed | Asked-for vs delivered, differences with reasons, next steps confirmed | Divergences surfaced early and agreed at the time, not explained afterwards |
| Write-up | Screenshots with captions | Problem, build, decisions, results with denominators, failures, risk, next | Reasoning that would convince a hiring manager you can be trusted with a client |

## Hints

**Run the feedback session before you polish anything.** Every hour spent perfecting a screen the user then misreads is an hour spent twice.

**Silence is the technique.** The pause while someone works out what to click is uncomfortable and it is the most valuable data in the session. Count to ten before you help.

**Two users beat twenty questions.** You will hear the same two problems from both, and that is your fix list.

**Demo the failure with confidence.** Showing a low-confidence result routing to review and being caught is the single most convincing thing in the whole demonstration. It says you built a system, not a trick.

**Rehearse once, end to end, on a record you have never processed.** Almost every capstone demo that goes badly does so because it was only ever rehearsed on a record that was already in the system.

**Write the handover pack as if you are leaving tomorrow.** The word "obviously" appearing in your documentation is a reliable sign you have skipped a step the reader needs.

**Test the pack on a person, not on yourself.** You cannot un-know how your own build works. Someone else attempting the fallback will find the gap in ten minutes.

**Keep the unmet criterion in every artefact.** Consistency across demo, handover, and write-up is what makes the whole package credible; a limitation that appears in one document and not another reads as concealment.

**Write down what you would do differently.** Reflection with specifics is the difference between "I built a thing" and "I know how to build things", and it is what a reader is actually assessing.

**Screenshot as you go, redacted.** Reconstructing evidence after the fact at the end of forty hours is miserable and it shows.

## Hand in

1. The feedback observation log, with severities.
2. The two or more refinements, with before-and-after evidence and any re-test.
3. Demonstration: the record of the live session — the run evidence, the failure case shown, and your slides or notes if used.
4. The success-criteria scorecard as presented, unmet criteria included.
5. The complete handover operations pack, redacted.
6. Evidence that the manual fallback and the turn-it-off procedure were each performed by someone other than you, plus the list of questions they asked and how the pack changed.
7. The alignment note, confirmed by the stakeholder.
8. The portfolio write-up, two to four pages with the updated architecture diagram.
9. A one-page reflection: what you would do differently with the forty hours, and what you would build next.
