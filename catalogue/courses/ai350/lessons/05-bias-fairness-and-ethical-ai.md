---
lesson_id: ai350-05
course_id: ai350
pathway: prompt-engineer
title: Bias, Fairness, and Ethical AI
order: 5
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Identify bias and fairness risks in an AI automation and apply ethical AI
    principles to mitigate them
---

## Beyond what the law requires

The previous lesson dealt with obligations that someone can compel you to meet. This one deals with the larger territory: an automation can be entirely lawful, fully documented, contractually clean — and still treat some people worse than others for reasons nobody chose and nobody noticed.

That is worth stating plainly because the two get conflated. Compliance is a floor. A support triage system that quietly escalates complaints written in fluent professional English and deprioritises the same complaint written by a non-native speaker breaks no statute that you will find named in your privacy notice, and it is still a failure you own. The ethical questions are the ones you have to ask yourself, before anyone asks them of you.

You are also working under a real constraint: **you did not train the model and you cannot retrain it.** You cannot rebalance its training data or adjust its weights. What you control is everything around it — what data you feed it, how you word the instruction, which examples you show it, what you do with its output, who reviews the consequential cases, and whether to automate this task at all. That last one is a genuine option and it is the correct answer more often than people expect.

## Where bias enters a workflow you built

Bias is not one thing sitting inside the model. It enters at six identifiable points, and five of them are yours.

**The source data.** If your automation learns what "good" looks like from historical records, it inherits whatever the history contained. A prioritisation flow tuned on which past tickets got fast responses will reproduce whoever got fast responses before. A screening workflow shown past hires will reproduce past hiring.

**The prompt wording.** Instructions carry assumptions. "Flag unprofessional messages" invites the model to apply a narrow register of professionalism shaped by dialect and formality rather than content. "Assess whether the customer seems credible" invites it to guess about people from prose. Vague evaluative adjectives are where most prompt-induced bias lives.

**The examples.** Few-shot examples are the strongest steer you have, which means an unrepresentative set is the strongest bias you can introduce. Five exemplars all written in the same register teach a register, not a task.

**The retrieval corpus.** A grounded assistant answers from what you indexed. If the indexed material describes one customer segment, one region, or one product line well and the others thinly, the assistant will be confidently helpful to some users and vaguely unhelpful to others — an unevenness that never appears as an error.

**The thresholds and routing.** A confidence cutoff, a score band, an auto-close rule. These are pure design choices, and their effects land unevenly whenever the underlying score does.

**The model itself.** Real, documented, and largely outside your control — associations between names and occupations, uneven quality across languages and dialects, uneven handling of names that do not fit a Western convention. You cannot fix it. You can detect it, avoid tasks where it dominates, and constrain what it can affect.

## Principles that translate into actions

Published responsible-AI frameworks converge on a similar list. Stated abstractly they are useless to a builder, so here is each one with the action it implies for a person operating hosted models.

**Fairness.** Similar cases receive similar treatment, and treatment does not vary with characteristics irrelevant to the task. Action: test for it deliberately, with the procedure below. Fairness is not something you can assert.

**Transparency.** People affected can find out that AI was involved and what it did. Action: disclose AI involvement where output reaches a person, and keep the record of which model and prompt produced which output.

**Accountability.** A named human is answerable for the automation's behaviour. Action: put an owner's name on the workflow, not a team alias.

**Human oversight.** Consequential decisions have a person in the loop who can actually change the outcome. Action: gate adverse and irreversible actions behind review, and make sure the reviewer has the information and the time to disagree — a reviewer who approves ninety-nine of a hundred without reading is a rubber stamp, not oversight.

**Contestability.** A person affected can challenge the outcome and reach a human. Action: publish a route to a human and make sure it does not lead back into the same automation.

**Reliability.** The system performs as intended and degrades safely. Action: the monitoring you build in the final lesson of this course.

**Privacy and security.** Already covered, and part of the same duty.

Two of these carry particular weight for automations that affect people: oversight and contestability. Most public failures of automated decision systems were not failures of accuracy. They were failures of recourse — the system was wrong about someone and there was no way for that person to get it looked at.

## A bias-testing procedure you can run this week

You cannot audit a hosted model. You can audit **your workflow's behaviour on inputs that differ only in ways that should not matter.** That is a paired-prompt test, and it is well within the reach of an afternoon.

**Step 1 — State the fairness claim.** Write the sentence you want to be true, in the terms of your task. "Two support messages describing the same problem should receive the same priority regardless of the writer's name, dialect, or fluency." A vague claim cannot be tested.

**Step 2 — Build a paired corpus.** Take 10 to 20 realistic base cases. For each, produce variants that hold the substance constant and vary one attribute. Useful axes for a general business workflow: given-name origin, formal versus casual or regional English, non-native phrasing, gendered pronouns and honorifics, message length, and location. Vary one axis at a time or you will not know what caused a difference.

```text
Base case B-04, variant set: name origin
  B-04-a  "Hi, I'm James Whitfield. My order 8842 arrived damaged..."
  B-04-b  "Hi, I'm Adeola Okonkwo. My order 8842 arrived damaged..."
  B-04-c  "Hi, I'm Wei Zhang. My order 8842 arrived damaged..."
  B-04-d  "Hi, I'm Fatima Haddad. My order 8842 arrived damaged..."
  (identical text otherwise, byte for byte after the name)
```

**Step 3 — Fix the run conditions.** Same model, same version, same prompt, same temperature, and at least three runs per variant, because a single run of a stochastic system tells you nothing about a systematic difference. Record the model version — a result is only meaningful against the version you tested.

**Step 4 — Score with a rubric, not an impression.** Decide in advance what you are measuring: the assigned category, the priority level, the presence of an escalation, the tone rating, or a length. Numbers or fixed categories only. "Seemed a bit curter" is not a finding.

**Step 5 — Tabulate and apply a decision rule.**

```text
| Case | Variant axis | Runs | Priority (mean) | Escalated | Reply length (mean) |
|------|--------------|------|-----------------|-----------|---------------------|
| B-04 | name: a      | 3    | 2.0             | 0/3       | 96 words            |
| B-04 | name: b      | 3    | 3.0             | 0/3       | 61 words            |
| B-04 | name: c      | 3    | 2.7             | 0/3       | 68 words            |
| B-04 | name: d      | 3    | 3.0             | 1/3       | 58 words            |
```

Set the rule before you look: for example, a difference of one full priority band, or a 25% gap in a rate, across variants that differ only in a protected or irrelevant attribute, is a finding that must be mitigated before launch. Writing the rule first stops you from negotiating with your own results, which you will otherwise do.

**Step 6 — Investigate cause before you fix.** Re-run with the name removed entirely. If the difference disappears, the name was the driver. If it persists, look at your prompt wording, your examples, or your retrieval results.

**Step 7 — Record it.** Date, model version, prompt version, corpus, rule, results, decision. This becomes evidence, and it becomes your baseline for the next model upgrade — which is when previously fine behaviour quietly changes.

### Reading results honestly

Two interpretation errors are worth pre-empting, because both are comfortable and both are wrong.

The first is **explaining away a real difference**. You will be tempted to note that the model's replies to variant b were shorter but "still perfectly polite," or that the priority difference was "only one band, and the band boundaries are arbitrary anyway." Both may be true. Neither is a reason to dismiss the result, because the whole point of writing the decision rule before you looked at the results was to stop you from adjudicating your own system after seeing which way the evidence went. If you genuinely believe the rule was wrong, change it — in writing, with the reason, before the next test — rather than making an exception for this one.

The second is **overclaiming a clean result**. A passing test says that on these cases, along this axis, with this model version and this prompt, you found no difference beyond your threshold. It does not say the system is fair. Small corpora have limited power to detect small effects; you tested one axis and there are many; and intersections — a combination of two attributes — behave differently from either alone and are the hardest to test with a small sample. State the limits alongside the result. A reviewer trusts a record that says "no difference detected on name origin; dialect and intersectional effects untested" far more than one that says "test passed."

Finally, remember what the test is actually measuring: your workflow's behaviour, not the model's. That is a feature. You cannot fix the model, but you can and will change the prompt, the fields, the examples, and the gating — and the paired corpus is the instrument that tells you whether those changes helped.

## Mitigations, in order of effectiveness

**Remove the attribute from the input.** If the task does not need the name, strip it before the prompt. This is the strongest and cheapest fix available, and it echoes the minimisation habit from two lessons ago. Watch for proxies: a postcode, a school, a phone prefix, or a photo can carry the same signal you thought you removed.

**Narrow the task.** Ask for an extraction or a classification against explicit criteria rather than a judgement about a person. "Does this message report a damaged item, a late delivery, or a billing error?" is answerable from the text. "How frustrated is this customer, from 1 to 10?" invites the model to infer from style.

**Give explicit criteria and require the reason.** Enumerate the rubric in the prompt and make the model return the evidence for its answer, so a reviewer can see whether the reason is legitimate.

```json
{
  "priority": "P2",
  "criteria_met": ["order_damaged", "within_return_window"],
  "evidence_quote": "arrived damaged, corner crushed",
  "confidence": 0.82
}
```

An answer that cannot cite a rule and a quote should not take effect automatically.

**Constrain the output space.** Fixed categories with defined meanings surface uneven treatment as a comparable number. Free prose hides it.

**Put a human on the adverse path.** A cheap and durable pattern: automate the favourable and neutral outcomes, route every adverse or borderline one to a person. Most of the harm in automated decisions lands on people receiving the bad outcome, and this pattern removes the automation from exactly that path.

**Re-test after every change.** New model version, new prompt, new examples, new corpus — re-run the paired set. Model upgrades are not neutral with respect to fairness, and nobody will tell you when yours changes.

**Decline the task.** Some tasks should not be given to a general-purpose model at all: inferring protected characteristics, assessing credibility or emotion as a basis for treatment, ranking people, or making an eligibility decision without review. Recognising these and saying so is a professional skill, and it will occasionally be the most valuable thing you do on a project.

## Raising it with people who did not ask

Fairness findings are frequently unwelcome, arriving as they do late, from the person building the thing, about a project someone has already promised. How you raise them determines whether they get fixed.

Lead with the evidence, not the adjective. "Identical complaints received priority 2 with one name and priority 3 with another, across three runs each" is a fact people can act on. "The system is biased" invites a debate about definitions in which nothing gets measured. Quantify the exposure — how many cases a month look like this — because a decision-maker needs the scale to weigh it. Bring a specific, costed mitigation rather than an alarm; "strip the name field before the prompt, roughly an hour of work, re-test attached" is a proposal, and proposals get approved.

And keep the record whatever the decision. If the organisation decides to accept a risk you identified, that is legitimately their call to make and not yours, but the finding, the decision, the person who made it, and the date belong in the file. That record protects the people affected, because it can be revisited, and it protects you.

## Practice

Use an automation of yours that produces an output about a person — a classification, a priority, a score, a routing decision, or a drafted reply.

1. **Map the six entry points.** For your workflow, write one or two sentences on each of the six points where bias can enter, naming the specific artifact — which data, which prompt sentence, which examples, which index, which threshold. Mark the two you consider highest risk and say why.
2. **State a testable fairness claim** for your task, in one sentence, and write the decision rule you will apply to the results before you run anything.
3. **Build a paired corpus** of at least 8 base cases with at least 3 variants each along one axis you consider relevant. Keep the substance identical between variants. Save the corpus — you will need it again.
4. **Run the test.** Three runs per variant, fixed model and prompt, recorded model version. Score against a fixed rubric and complete the results table.
5. **Interpret it honestly.** State whether your decision rule was breached. If it was, run the causal check by removing the varied attribute. If it was not, say what your test would have failed to detect — every test has blind spots, and naming yours is part of the deliverable.
6. **Apply one mitigation and re-run.** Choose from the ordered list, implement it, re-run the same corpus, and record the before-and-after table.
7. **Write the fairness record**: claim, corpus, method, model and prompt versions, results, decision rule, finding, mitigation, and the date of the next scheduled re-test. Half a page is enough. Name yourself as the owner.

## Check your understanding

1. You change both the customer's name and the message's formality between two variants and see a priority difference. What can you conclude? *Nothing about either attribute specifically: vary one axis at a time, or you cannot tell which change caused the difference.*
2. You remove the name field and the difference persists. Where do you look next? *Prompt wording (vague evaluative adjectives), the few-shot examples, the retrieval results, and proxies such as postcode or phone prefix that carry the same signal.*
3. Which mitigation is both strongest and cheapest, and what is its main pitfall? *Removing the attribute from the input; the pitfall is proxies that carry the same signal.*
