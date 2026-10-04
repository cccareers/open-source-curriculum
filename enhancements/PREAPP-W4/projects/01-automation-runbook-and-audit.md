---
course_id: PREAPP-W4
project_id: PREAPP-W4-x01
title: "Automation Runbook and Accuracy Audit"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - PREAPP-W4-02
  - PREAPP-W4-03
  - PREAPP-W4-04
objectives:
  - Prompt Claude and ChatGPT with structure, comparing outputs and judging fitness for purpose
  - Use AI to accelerate research and personalization while critiquing drafts for accuracy and authenticity
  - Design and build a working automation with a measurable time-saved estimate
competency_ids:
  - D3-S1-C01
  - D3-S2-C02
  - D3-S3-C01
---

## Scenario

An operations lead at an employer partner watches your Week 4 demo and says: "Nice. If you left tomorrow, could someone else on my team run this? And how do I know it isn't making things up?" Most automations built in a week cannot answer either question. This project makes yours answer both — with a one-page **runbook** a peer can follow, and an **accuracy audit** that tests the automation's output against its sources.

The runbook and audit together become your **AI Prompt Engineering rotation artifact** for the Week 7 Outreach Portfolio.

## What you will produce

1. **Runbook** (one page): what the automation does, trigger, inputs, steps, output, how to check the output, known failure cases, and the time-saved calculation with its inputs.
2. **Accuracy audit**: the automation run on five real inputs, every factual claim in the output checked against a source, results tallied.
3. **Model comparison note**: the automation's core prompt run unchanged in both Claude and ChatGPT on one input, scored on verifiability, task fit, format compliance, and tone.
4. **Ledger updates**: Week 4 numbers row, caption card, dated reflection.

## Before you start (prerequisites, starter files or data)

- Your Week 4 automation runs end to end (Lesson 4 definition of done), or is close.
- Your before/after timings (at least two each).
- Your prompt library (Lesson 2, Practice 6).
- Your evidence ledger. If you recorded `send_minutes` in Week 1, use it as a "before" reference.

Audit table template:

```text
Input # | Claim in output | Source it should come from | Verified? (Y / N / Overstated) | Note
1       | "4 open dispatcher roles" | careers page, 5/12 | Y |
1       | "scaling rapidly"         | none              | Overstated | inference, not in source
...
TOTAL: __ claims | __ verified | __ unsupported | __ overstated
```

## Milestones

1. **Write the runbook** (45 min). Use these headings: Purpose · Trigger · Inputs (and where they come from) · Steps (numbered, one sentence each) · Output (and where it lands) · How to check the output · Known failures · Time saved (calculation with inputs). Keep it to one page.
2. **Run the accuracy audit** (75 min). Run the automation on five real inputs, including your messiest one. List every factual claim in every output. Check each against its source and mark it Verified, Unsupported, or Overstated (Lesson 3's "overstated inference"). Tally. Compute `audit_verified_pct` as verified claims ÷ total factual claims × 100; record N/A if there are no factual claims, and explain what output checks you used instead.
3. **Fix one failure** (30 min). If the audit found no failures, record that result and test an additional edge case; do not invent an error. Otherwise, pick the most common failure from the audit and change the prompt or template to prevent it (for example: require a source number per bullet, add a NOT SUPPORTED section). Re-run on the same five inputs and record the new tally.
4. **Head-to-head** (30 min). Run the automation's core prompt unchanged in both Claude and ChatGPT on one input. Score both on the four criteria from Lesson 2 and write a one-sentence verdict.
5. **Peer run** (20 min). Give a partner only the runbook. They run your automation on one input without asking you anything. Note every place they hesitated, and fix the runbook.
6. **Update the ledger** (20 min). Week 4 row with new columns `automation_minutes_saved_per_week` and `audit_verified_pct`. Caption card for the runbook + audit. Dated reflection: hard, boring, surprising — and whether you enjoyed the building or the judging more.

## Acceptance criteria

- [ ] Runbook is one page, has all eight headings, and a peer ran the automation from it alone.
- [ ] Audit covers five real inputs and every factual claim, with a tally.
- [ ] One observed failure type was addressed and the re-run tally shows the effect (even if small), or a failure-free audit is documented with an additional edge-case check.
- [ ] Head-to-head comparison uses an unchanged prompt and the four criteria, with a reasoned verdict.
- [ ] The time-saved calculation shows measured inputs, upkeep, and payback.
- [ ] Nothing in the automation sends outreach without human review.
- [ ] Ledger updated with row, caption card, reflection.

## Evidence checklist

- Runbook document
- Audit table (before and after the fix)
- Both model outputs, side by side, with scores
- Partner's hesitation notes
- Ledger updated

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Runbook usability | Peer needed help to run it | Peer ran it from the runbook alone | Runbook includes a "what to do when it fails" step for each known failure |
| Audit rigor | Spot-checked a few claims | Every claim on five inputs checked and tallied | Distinguishes unsupported from overstated, and identifies which input types cause each |
| Improvement | No change after the audit | One targeted fix, re-run, tally compared | Fix generalizes; learner explains why it worked |
| Model judgment | "One sounded better" | Four-criteria scores and a reasoned one-sentence verdict | Notes which model to use for which step of the automation, with evidence |
| Time-saved honesty | Estimated or remembered times | Measured times, upkeep, payback shown | Includes checking time in "after" and states the uncertainty |

## Stretch goals

- Add a second automation step for a different repetitive task and document it in the same runbook.
- Run the audit again a week later on fresh inputs to see whether accuracy holds.

## Reflection prompts

- What percentage of claims were unsupported before your fix? Would you have caught them by reading the output once?
- Which part of this work would you want to do every day: writing prompts, building the workflow, or checking the output?

## Instructor notes (common pitfalls, how to adapt for time)

- **Pitfall: excluding checking time.** Learners often time only the automation's run. Insist that "after" includes the human review.
- **Pitfall: confidential data in tools.** Re-state Lesson 4's constraint: nothing pasted into a tool the program has not cleared.
- **Pitfall: the audit is skipped because the output "looks right."** Fluency is not fitness (Lesson 2). The audit is the core of the project.
- **Short on time:** Milestones 1, 2, and 6 (about 2.3 hours).
- **Arc:** fourth link (`enhancements/PREAPP-ARC.md`). In Week 5, learners can replace one manual step in this runbook with their TypeScript script.
