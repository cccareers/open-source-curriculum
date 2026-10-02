---
lesson_id: agile210-07
course_id: agile210
pathway: prompt-engineer
title: "Project: Test, Troubleshoot, and Harden"
order: 7
kind: project
competency_ids:
  - D1-S1-C04
  - D3-S1-C05
  - D5-S1-C05
objectives:
  - Test, troubleshoot, and harden the capstone until it survives realistic use
---

## Goal

This is stage 6 of 7 of your capstone. Same build, next pass.

Take the remediated solution out of the conditions you built it in and find out whether it survives realistic use. Three things happen in this stage: you **evaluate** the AI output properly against a labelled hold-out, you **break the workflow on purpose and troubleshoot** what breaks, and you **harden** it with monitoring, so that failures announce themselves instead of waiting to be noticed.

Up to now, every number you have reported came from records you were looking at while you tuned. This is where you find out what the solution does on work it has never seen.

## What you inherit from stage 06

- **A remediated build**: every High finding fixed, personal data minimised, a responsible-AI policy governing what the automation decides alone.
- **The routing table**, possibly with provisional thresholds you promised to set from evidence. Setting them is this stage's job.
- **The hold-out records** you reserved in stage 05 and have not looked at. If you have looked at them, say so and collect fresh ones — a compromised hold-out gives a number that is worse than no number, because it is confidently wrong.
- **The success criteria** from section 4 of your brief, with their baselines, targets, and stated measurement methods. This stage is where you finally run those measurements.

## Requirements

Four deliverables.

### 1. Evaluate the AI output

Build a labelled evaluation set and score against it.

- **At least 20 hold-out records**, unseen during development, representative of real traffic — including the awkward cases in the proportion they actually occur, not in the proportion that flatters you.
- **A ground truth for each**, produced by a human. You may label them yourself; someone else labelling a subset is better, and disagreements between two labellers are informative on their own.
- **Score three dimensions**, per the pathway's evaluation practice:
  - **Accuracy.** Is the output factually right against the source? For extraction, field by field. For classification, correct category. For generated text, every claim traceable to the input.
  - **Relevance.** Does the output actually answer the need — right level of detail, right form, usable by the person receiving it? An accurate output that the reviewer has to rewrite is not a good output.
  - **Bias and unfairness.** Does quality vary by the input's origin or style? Segment your results by whatever plausibly matters for your data — supplier size, language and phrasing, document format, record age, name form — and compare. This is the fairness check from stage 06 done with numbers.

Report as a table, with counts and the denominator:

| Dimension | Measure | Result | Target from brief | Met? |
| --- | --- | --- | --- | --- |
| Accuracy | Field-level correct, 9 fields × 22 records | 189/198 (95.5%) | ≥ 90% | Yes |
| Accuracy | Records fully correct on all fields | 15/22 (68%) | — | — |
| Relevance | Reviewer accepted without edit | 17/22 (77%) | ≥ 70% | Yes |
| Bias | Accuracy, top-8 suppliers vs. others | 97% vs. 88% (n=14 / n=8) | No stated target | Gap noted |
| Coverage | Handled without escalation | 18/22 (82%) | ≥ 75% | Yes |

Then **error analysis**: read every wrong output and categorise the failures. Five categories with counts beats a paragraph of impressions. Categories drive fixes; impressions do not.

Report the disappointing numbers plainly. A capstone that honestly reports 88% and explains the gap is stronger than one claiming 99% on a set that was tuned against.

### 2. Set the thresholds from evidence

Use the evaluation to set every routing threshold that was provisional.

- Compare the confidence values on correct outputs against those on wrong outputs. If they barely differ, say so — that is a real finding about your prompt, and the honest response is to route more conservatively rather than pretend the number means something.
- Choose the threshold that gives the error rate the brief can live with, and write the trade-off down: at 0.85, you catch nine of the eleven errors and send four correct records to review unnecessarily.
- Update the routing table to version 2 and re-run enough records to confirm the new behaviour.

### 3. Break it and troubleshoot

Inject at least **five realistic failures**, one at a time, and work each one under a method rather than by poking. Suggested set, adapted to your build:

| Injected failure | What you expect | What to check |
| --- | --- | --- |
| Model API returns an error or times out | Bounded retry, then failed state with alert | No duplicate side effect on retry |
| Model returns malformed or off-schema output | One repair attempt, then quarantine with raw output kept | Nothing downstream consumes it |
| Credential revoked mid-run | Clean failure, clear error, alert | Error message says what to rotate |
| Input arrives empty, oversized, or in the wrong format | Quarantined, named rule, visible | No crash, no silent pass |
| Duplicate delivery of the same record | One record, one side effect | Idempotency holds |
| The trigger stops firing entirely | Absence alert | The failure nobody gets an error for |

For each, record: what you injected, what happened, whether it matched the expectation, what you had to change, and how long it took you to work out what was wrong. That last number is your **diagnosis time**, and shortening it is what the monitoring in the next requirement is for.

Write one of these up as a short **postmortem** — incident, impact, cause, detection, fix, follow-up — choosing the one that genuinely surprised you.

### 4. Harden with monitoring

The solution has to tell someone when it is unwell. Build and **trigger** at least these four:

- **Failure alert.** A failed record or run notifies a named recipient, with enough context to start diagnosing and without leaking personal data into the notification.
- **Absence alert.** A drop below the expected run volume notifies someone. A workflow that has quietly stopped produces no errors at all, which is exactly why it is the failure that runs longest undetected.
- **Queue-age alert.** The oldest item in the human review queue past its target time raises a notification. A review gate nobody works is not a control.
- **Quality drift check.** Something that would catch the output getting worse without failing: a scheduled sample of successful outputs for human spot-check, a rate-of-escalation threshold, or a reconciliation that must balance. State which you chose and what it would catch.

Each alert must have been **fired on purpose and observed arriving**, with evidence. An untested alert is a hypothesis about a notification.

Then a short **efficiency pass**: measure per-record processing time and per-record cost, and make one improvement — remove a redundant model call, cut an over-long prompt, batch a set of API calls, replace a model step with a rule. Report before and after with the numbers.

Finally, close the loop on the brief: for every success criterion in section 4, report measured result against target, with sample sizes, including the ones you did not meet.

## A method for troubleshooting, not poking

When something breaks, the difference between twenty minutes and two hours is method. Use the same loop each time, and write it down as you go — those notes become the "common problems" section of the handover pack in stage 08.

1. **Reproduce it.** Find one record that fails reliably. An intermittent failure you cannot reproduce is a monitoring problem first and a bug second.
2. **Locate it by status.** Which state did the record stop in? Because you built the pipeline as status transitions, this narrows the search to one step immediately.
3. **Read what that step actually received.** Not what you assume it received. The stored intermediate outputs and the preserved raw payload exist for this moment.
4. **Form one hypothesis and test only it.** Change one thing. If you change two and it works, you have learned nothing and you now have an extra change to justify.
5. **Fix the cause, not the symptom.** Widening a validation rule until the error stops is not a fix; it is deleting the detector.
6. **Re-test the fix, then re-test the neighbours.** Fixes to a shared step break other paths surprisingly often.
7. **Record it.** Symptom, cause, fix, and how you would have detected it sooner. The last part is what turns an incident into a monitoring requirement.

## Constraints

- **The hold-out is spent once.** Once you tune against it, it is a development set. If you must iterate after evaluating, say so and evaluate the change on fresh records.
- **Human labels are the ground truth.** Do not use a model to grade its own output as your primary measure.
- **No new tools or techniques.** Evaluation, troubleshooting method, and monitoring all come from earlier courses.
- **Inject failures in your own build only.** Not in a client's systems, not against a third party's service beyond your own account's normal use.
- **Do not fix by loosening.** Widening a validation rule to make a failure stop appearing is not hardening.
- **Alerts must not leak.** Notification bodies get the same redaction standard as everything else after stage 06.
- **Report what you measured, not what you hoped.** Every number carries its denominator and its date.
- **Four hours.** Roughly ninety minutes on evaluation and error analysis, thirty on thresholds, one hour on failure injection and troubleshooting, one hour on monitoring and the efficiency pass. If you overrun, shrink the injected-failure set to four rather than dropping the evaluation.

## Definition of done

**Evaluation**

- At least 20 hold-out records, unseen, representative, with human ground truth.
- Accuracy, relevance, and bias each measured and reported with counts and denominators.
- Results segmented by at least one meaningful dimension, with the gap reported.
- Error analysis categorises every wrong output, with counts.
- Results compared against every success criterion in the brief, including unmet ones.

**Thresholds**

- Confidence separation between correct and incorrect outputs is examined and reported.
- Every provisional threshold is now set with a stated trade-off.
- The updated routing table is in place and re-tested.

**Troubleshooting**

- At least five realistic failures injected, one at a time, each with expected versus actual behaviour recorded.
- Every mismatch fixed and re-tested.
- Diagnosis time recorded for each.
- One postmortem written with incident, impact, cause, detection, fix, and at least two follow-ups.

**Monitoring and efficiency**

- Failure, absence, queue-age, and quality-drift detectors all built.
- Every one has been fired on purpose and observed arriving, with evidence.
- Alerts contain enough context to diagnose and no personal data that does not belong there.
- Per-record time and cost measured before and after one implemented efficiency improvement.
- No silent drops: every record from every test run ends in a countable terminal state, and the counts balance.

## Rubric

| Criterion | Not yet | Meets | Strong |
| --- | --- | --- | --- |
| Evaluation rigour | Impressions, or scores on records used in tuning | 20+ unseen records, human labels, accuracy relevance and bias reported with denominators | Segmented analysis that found a real quality gap, reported honestly |
| Error analysis | "Some outputs were wrong" | Every error categorised with counts, fixes traced to categories | A category that changed the design, not just the prompt |
| Thresholds | Unchanged guesses | Set from measured confidence separation with a stated trade-off | Honest conclusion that confidence was uninformative, handled conservatively |
| Troubleshooting | Failures described, not injected | Five injections, expected vs actual, fixes re-tested, diagnosis times | Postmortem with real follow-ups, one of which was implemented |
| Monitoring | Alerts configured but never fired | All four detectors built and observed firing, no leakage | Absence and drift detection that would genuinely catch a quiet failure |
| Efficiency | No measurement | Time and cost measured, one improvement with before and after | Improvement that cut cost materially without measurable quality loss |

## Hints

**Label before you look at the output.** Write the ground truth for the hold-out first, then run the workflow. Labelling after seeing the model's answer is how a 78% quietly becomes a 94%.

**Count instead of describing.** "Mostly good with a few issues" cannot be compared to anything. "17 of 22 accepted without edit" can be compared to the next version, to the baseline, and to the brief.

**Segment even when you expect nothing.** The two-minute comparison between the inputs that look like your development set and the ones that do not is where fairness problems actually show up.

**Read every error individually.** Categorising twelve errors takes twenty minutes and typically collapses into three causes, two of which are one prompt sentence away from fixed.

**Check whether confidence means anything.** Plot or tabulate confidence for correct and incorrect outputs. Plenty of capstones discover the model is equally confident when wrong, and knowing that is far more valuable than a threshold chosen by vibes.

**Inject one failure at a time.** Two simultaneous faults produce a confusing symptom and teach you nothing about either.

**Time your diagnosis honestly.** The diagnosis time is the metric monitoring exists to reduce, and it is the number that will convince a client the runbook matters.

**Build the absence alert even though nothing is failing.** It is the alert that catches the failure with no error message: the trigger that quietly stopped, the connector whose authorisation expired overnight.

**Alert to a person, not to a log.** A notification nobody receives is a log entry with extra steps.

**Make one efficiency improvement and measure it.** One measured change beats three unmeasured ones, and the measurement is the part that transfers to your next job.

**Keep the number that disappointed you.** The credibility of every other figure in your write-up rests on the presence of at least one that did not go your way.

## Hand in

1. The hold-out set description: size, how selected, how labelled, by whom.
2. The evaluation results table: accuracy, relevance, bias, coverage, with counts and denominators.
3. The segmented comparison and what it showed.
4. The error analysis: categories, counts, and the fixes each drove.
5. The confidence separation analysis and the final routing table with thresholds and trade-offs.
6. The failure-injection log: five or more entries with injected fault, expected, actual, fix, re-test, diagnosis time.
7. One postmortem: incident, impact, cause, detection, fix, follow-ups.
8. Evidence of all four detectors firing, redacted.
9. Per-record time and cost, before and after the efficiency improvement.
10. The success-criteria scorecard: every criterion from the brief, measured result against target, with sample size and date, including the unmet ones.
