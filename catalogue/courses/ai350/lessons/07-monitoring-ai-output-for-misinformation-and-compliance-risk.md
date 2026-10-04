---
lesson_id: ai350-07
course_id: ai350
pathway: prompt-engineer
title: Monitoring AI Output for Misinformation and Compliance Risk
order: 7
kind: lesson
competency_ids:
  - D6-S1-C05
objectives:
  - Monitor AI-generated content for misinformation and compliance risk and
    respond when monitoring fires
---

## The problem with launch-day quality

You tested the workflow. The outputs were good. You shipped it. Six weeks later it is producing something you would never have approved, and nobody noticed for four of those weeks.

This is the normal outcome, not an unlucky one, and it has four ordinary causes. **Inputs drift**: real users write things your test cases did not, and a system tuned on twenty clean examples meets a thousand messy ones. **Facts go stale**: the price changed, the policy changed, the product was discontinued, and the assistant is still confidently quoting what it learned or what your retrieval corpus still contains. **The system changes underneath you**: a vendor updates a model version, a colleague edits the prompt, a retrieval index is rebuilt — and behaviour shifts without any change you would call a deployment. **Scale exposes the tail**: a failure mode that occurs once in five hundred outputs is invisible in testing and routine in production.

Two categories of failure matter enough to build for. **Misinformation** is content that is confidently wrong — a fabricated policy, an invented citation, a hallucinated part number, an obsolete price, a made-up commitment. **Compliance risk** is content that may be accurate and is still not allowed — a claim that constitutes financial, medical, or legal advice, a promise the organisation cannot honour, a disclosure of another person's data, an unlicensed quotation, a discriminatory statement, a missing required disclaimer.

Monitoring is the practice that catches both before they compound. It is also what keeps the policy you wrote in the previous lesson honest: a document that says human review happens is worth nothing without a number showing that it does.

## Four layers, in order of cost

Do not attempt to review everything by hand. Layer the coverage.

**Layer 1 — Pre-publication automated checks.** Deterministic rules that run on every output before it reaches anyone. Cheap, instant, and catch the categorical failures: forbidden phrases, missing disclaimers, malformed structure, personal data patterns, links to unapproved domains, numbers that do not appear in the source. This is where the highest-severity rules belong, because it is the only layer that prevents rather than detects.

**Layer 2 — Model-assisted screening.** A second model call that scores an output against a rubric — is this claim supported by the provided source, does this read as advice, is the tone appropriate. Useful for judgements rules cannot express. It is a screen, not an oracle: it has its own error rate, and it must never be the only thing standing between a high-tier output and a customer.

**Layer 3 — Sampled human review.** A person reads a random sample plus everything the first two layers flagged, against a written rubric. This is the layer that discovers failure modes you did not anticipate, which is exactly what layers 1 and 2 cannot do by construction.

**Layer 4 — Feedback and regression.** Signals from the world — thumbs-down, agent edits, complaints, escalations — plus a fixed regression set you re-run on every change. The regression set is what turns "the vendor updated the model" from an unknown into a measured result.

## A monitoring rule set

This is the artifact. Write it as a table so it can be reviewed by someone who is not you, and so each rule has an owner and an action rather than just a condition.

```text
| ID  | Layer | Condition                                                   | Severity | Action                                      |
|-----|-------|-------------------------------------------------------------|----------|---------------------------------------------|
| M01 | 1     | Output contains a URL whose domain is not on the allow list  | High     | Block; hold for human                       |
| M02 | 1     | Output contains an email address or phone not in the input   | High     | Block; hold for human; log potential leak    |
| M03 | 1     | Output cites a price, SKU, or date absent from the source doc| High     | Block; hold for human                       |
| M04 | 1     | Required disclaimer string missing from a public reply        | Med      | Auto-append disclaimer; count occurrence     |
| M05 | 1     | Output matches advice phrases ("you should invest", "diagnose")| High    | Block; route to named reviewer               |
| M06 | 1     | JSON invalid or a required field missing                      | Med      | Retry once, then route to human              |
| M07 | 1     | Output length outside 20-400 words                            | Low      | Flag for sample review                       |
| M08 | 2     | Groundedness score below 0.7 against provided sources         | High     | Hold for human                               |
| M09 | 2     | Tone screen returns "dismissive" or "argumentative"           | Med      | Hold for human                               |
| M10 | 3     | Random 5% of all outputs                                      | n/a      | Weekly human review against rubric           |
| M11 | 3     | 100% of outputs on medium/high-tier decisions                 | n/a      | Review before effect (per policy s.5)        |
| M12 | 4     | Thumbs-down rate over 7 days exceeds 8%                       | Med      | Investigate within 2 business days           |
| M13 | 4     | Agent edits over 40% of drafts before sending                 | Med      | Prompt review; treat as quality regression   |
| M14 | 4     | Model or prompt version changed                               | High     | Run regression set before resuming automation|
| M15 | 4     | Any customer complaint mentioning AI output                   | High     | Incident triage within 1 business day        |
```

Three design points worth internalising. **Every rule names an action, not just a condition** — a rule that fires into a dashboard nobody watches is not a control. **Severity determines whether you block or flag**: blocking is expensive and correct for anything irreversible or public. And **M14 is the rule people forget**, even though a silent model upgrade is the single most common cause of "it worked last month."

M03 and M08 deserve a note. A **groundedness score** (M08) is a rating — produced here by a second model call, usually on a 0 to 1 scale — of how fully the output's claims are supported by the source text you supplied; 0.7 is a starting threshold to calibrate against your own reviewed samples, not a standard. The most reliable defence against fabrication in a grounded workflow is to require that specifics come from the retrieved source and to check them mechanically. Extract the numbers, dates, and identifiers from the output and confirm each appears in the source text. It is a crude check and it catches a remarkable share of confident invention.

### Writing conditions you can actually implement

A rule set is only as good as the precision of its conditions, and this is where most first drafts fail. "Output contains misinformation" is a wish. Convert each failure mode into something a step can evaluate.

Four shapes cover nearly everything. A **pattern match** asks whether specified text is present or absent — forbidden phrases, a required disclaimer, an email or card-number pattern, a domain outside the allow list. A **structural check** asks whether the output parses and carries the fields you demanded, which is why returning JSON with a fixed schema is a monitoring decision as much as a formatting one. A **traceability check** extracts every specific — numbers, dates, identifiers, proper nouns — and confirms each appears in the source you supplied, which is the workhorse against fabrication. A **comparison** measures the output against a baseline: length distribution, category mix, refusal rate, or the fraction of runs that hit a particular branch, all of which shift visibly when something upstream has changed.

Where none of the four fits, you have a judgement, and judgements go to layer 2 or layer 3. That triage is the point of writing the conditions out: it tells you honestly how much of your rule set is deterministic and how much rests on a second model or a human, and a rule set that is entirely judgement is a review process wearing a rule set's clothing.

## Sampling and the review rubric

Random sampling is not optional garnish; it is the only layer that finds unknown failure modes. Make it small enough to sustain: 5% of a low-volume workflow, or a fixed 30 items per week for a high-volume one, is far better than an ambitious 20% that is skipped after a fortnight. Stratify the sample so it includes some of each category the workflow produces, and always over-sample the outputs your automated layers flagged.

Reviewers need a rubric, or you will get impressions instead of data.

```text
For each sampled output, mark yes / no / n-a:

  A. Factually correct against the source or the system of record
  B. Every specific (number, date, name, policy) traceable to a source
  C. No claim the organisation is not permitted to make
  D. Required disclaimers present
  E. No personal data other than the recipient's own
  F. Tone appropriate and consistent with brand guidance
  G. Would I have sent this unedited?

Any "no" on A, B, C, or E is a defect. Record the output id, the rule
that should have caught it, and whether an existing rule failed or a new
rule is needed.
```

Item G is quietly the most informative question in the rubric, and the last column of the recording instruction is the one that improves the system: every defect that got past the automated layers should either strengthen an existing rule or create a new one. That feedback loop is the whole point of layer 3.

## Metrics worth tracking

Four numbers, reviewed at the same cadence as the sample.

**Escape rate** — defects found in human review divided by outputs reviewed. This is your headline quality number, and the only one that measures what actually reached people.

**Block rate and its precision** — how often layer 1 blocks, and what fraction of blocks were genuine. A block rate climbing without a corresponding rise in real defects means a rule has become miscalibrated and reviewers are learning to dismiss it.

**Human agreement rate** — how often reviewers approve without edit. Near 100% means either excellent quality or a rubber stamp, and the sample tells you which.

**Time to correct** — from a defect reaching a person to the correction being live. This is the number that matters most when something goes wrong publicly.

Keep a baseline from the first stable month. A metric without a baseline cannot show drift, and drift is the thing you are watching for.

## Responding when monitoring fires

A detection that produces no response is surveillance, not control. Write the response path before you need it; the moment you need it is the worst moment to design it.

**1. Triage — decide severity in minutes, not hours.**

```text
S1  Published or sent, affects many people, or discloses personal data,
    or makes a prohibited claim.            -> act now, notify owner + privacy/security
S2  Reached one person, materially wrong, correctable. -> act today
S3  Caught before publication, or cosmetic.            -> log, fix in normal work
```

**2. Contain.** For S1 this comes before diagnosis. Pause the automation or switch it to human-approval mode — build that switch in advance and know where it is. Stop the specific step rather than the whole business process where you can, and hold the queue rather than dropping it.

**3. Correct.** Fix the output that reached people: retract the post, send the correction, update the record. Say plainly what was wrong. A correction that hedges about the cause damages more trust than the original error.

**4. Notify.** Follow the escalation section of your policy. The workflow owner always. The privacy contact whenever personal data was involved, promptly, because notification deadlines are short and are counted from awareness. The manager for anything customer-facing. The vendor if you believe the platform behaved incorrectly.

**5. Diagnose.** Which layer should have caught it? Establish what changed — model version, prompt version, retrieval index, input mix — using the decision records you designed in the previous lesson. This is where those records earn their keep.

**6. Prevent.** Add or fix the rule, add the case to the regression set, and re-run. Then decide whether the tier was right: a defect that reached a customer through an automated path is evidence that the decision belonged one tier higher.

**7. Write it up.** Half a page: what happened, when, how detected, how many affected, what was done, what changed. File it where the next person will find it. The write-up is also the honest answer to "has this ever happened before," which someone will eventually ask.

A worked example makes the sequence concrete. A weekly sample turns up a reply quoting a 60-day return window; the policy says 30. Triage puts it at S2 — one customer, materially wrong, correctable. Containment is unnecessary if it is isolated, so the first real question is whether it is: a search of the last month's outputs for "60 day" finds eleven more. That reclassifies it to S1 and the automation goes to human-approval mode within the hour. Correction is eleven emails, sent the same day, stating the correct window plainly and honouring the incorrect one for anyone who already relied on it — a decision that belongs to the business, which is why the owner is notified rather than consulted afterwards. Diagnosis finds the cause in the retrieval corpus: an outdated policy page was indexed alongside the current one, and the model was faithfully quoting a real document. Prevention is therefore not a prompt change at all but a corpus fix, plus rule M03 extended to check policy figures against the system of record, plus the case added to the regression set. The write-up notes the detection lag — four weeks — which is the finding with the most value in it, because it says the sampling rate was too low for this workflow's volume.

Note what that example demonstrates. The model did not hallucinate; the pipeline fed it stale ground truth. Monitoring output is how you discover problems whose causes are nowhere near the model, and a response process that jumps straight to "fix the prompt" will keep missing them.

## Keeping it running

Monitoring decays faster than anything else you build, because it produces no visible value on the days it finds nothing. Three habits keep it alive: put the review on a calendar with a named owner rather than leaving it to spare time; re-run the regression set on every change rather than every release, since AI systems change without releases; and review the rule set itself quarterly, retiring rules that never fire and adding the ones your defects have taught you. A rule set that has not changed in a year is not stable, it is unmaintained.

## Practice

Use the workflow you have carried through this course.

1. **Enumerate failure modes.** List at least eight specific ways your workflow's output could be wrong or not allowed, in the concrete terms of your domain — not "hallucination," but "invents a return window that is not in our policy." Split them into misinformation and compliance risk.
2. **Write your rule set.** Produce the table in the format above, with at least ten rules covering all four layers. Each rule needs an id, a condition precise enough to implement, a severity, and an action.
3. **Implement two layer-1 rules** in the actual workflow — a forbidden-phrase or pattern check and a specifics-traceability or structure check. Verify each by crafting an input that triggers it and confirming the output is blocked or held rather than merely logged.
4. **Build the regression set.** Ten to twenty fixed inputs with known-good expectations, including at least three that previously produced a bad output and the paired-prompt cases from the fairness lesson. Store it where a colleague could run it. Run it once and record the baseline.
5. **Run one sampled review.** Take 15 real or simulated outputs, score them against the rubric, and record the escape rate. For every defect, name the rule that should have caught it and add or amend that rule.
6. **Write the response runbook** for your workflow: the severity definitions, the exact containment step including where the pause switch is, who is notified for each severity with their contact, and the correction path. Keep it to one page.
7. **Rehearse it.** Simulate an S2 — take one bad output you have actually produced and walk the runbook end to end, timing yourself. Record where you had to guess or search for something, and fix the runbook so the next person does not have to.

## Check your understanding

1. Which monitoring layer is the only one that prevents rather than detects, and what belongs there? *Layer 1, pre-publication automated checks; the highest-severity deterministic rules belong there.*
2. In the 60-day worked example, why would "fix the prompt" have been the wrong response? *The model faithfully quoted a real but outdated page in the retrieval corpus; the cause was the corpus, so the fix was removing the stale page and checking policy figures against the system of record.*
3. Your vendor silently updates the model. Which rule fires and what does it require? *M14: run the regression set before resuming automation.*
