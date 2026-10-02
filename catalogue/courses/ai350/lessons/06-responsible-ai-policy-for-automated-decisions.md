---
lesson_id: ai350-06
course_id: ai350
pathway: prompt-engineer
title: Responsible-AI Policy for Automated Decisions
order: 6
kind: lesson
competency_ids:
  - D6-S1-C04
objectives:
  - Write a responsible-AI policy stating what an automation may decide, what a
    human must decide, and how decisions are recorded
---

## Why a policy, and why you write it

Everything so far has been a control you applied yourself: a threat model, an inventory, a redaction rule, a fairness test. Each of those holds for as long as you are the person maintaining the workflow. The moment somebody else edits it, or a new automation is built next to it, or you move on, the reasoning evaporates and only the configuration remains.

A responsible-AI policy is how the reasoning survives. It is a short written document that answers three questions for a class of automations: **what may the automation decide on its own, what must a human decide, and how is each decision recorded.** Everything else in such a policy is supporting detail.

The reason you write it rather than waiting for someone else to is simple. Policies written by people who have never built an automation come back as either "AI must not make any decisions," which is unimplementable and therefore ignored, or "use AI responsibly," which decides nothing. You know where the decision points actually are, because you built them. What you produce is a draft that a manager, a privacy reviewer, or counsel then owns and approves — you are not the approver, and the document is not in force until someone with authority says it is.

Keep it short. A two-page document that people read beats a twenty-page document that lives in a folder. The test of a good policy is that a colleague can look at a new automation idea and tell, in under a minute, whether it is allowed.

## Decision rights: the core of the document

Start by listing every decision your automations make. Be literal — a decision is any point where the system's output changes what happens next.

Then tier them. Three tiers is enough, and the criteria should be about consequence to a person, not about technical sophistication.

| Tier | Criteria | Default rule |
| --- | --- | --- |
| Low | Reversible, no effect on an individual's money, access, standing, or record. Wrong output costs time only. | Automation may act alone. Sampled review after the fact. |
| Medium | Reaches a person or an external party, or writes to a system of record. Reversible with effort. | Automation proposes, human approves before it takes effect. |
| High | Affects money, eligibility, access, employment, safety, or legal standing. Adverse or hard to reverse. | Human decides. Automation may inform, summarise, or draft, but never determine the outcome. |

Now assign every decision in your automations to a tier and write the resulting table. This is the artifact people will actually use.

```text
| Decision                                   | Tier | Rule                                  |
|--------------------------------------------|------|---------------------------------------|
| Classify ticket topic                       | Low  | Automated; 5% sampled weekly          |
| Draft reply text                            | Med  | Agent reviews and edits before sending|
| Set ticket priority                         | Low  | Automated; escalation path published  |
| Auto-close a ticket as resolved             | Med  | Automated only if customer confirmed  |
| Issue a refund under $50                    | Med  | Agent one-click approval, logged      |
| Issue a refund over $50                     | High | Supervisor decides; AI drafts summary |
| Deny a warranty claim                       | High | Human decides; AI must not pre-fill    |
| Flag an account for fraud review            | High | AI flags only; no account action taken|
| Publish content to the public website       | Med  | Named editor approves each item       |
```

### Finding the decisions you did not know you had

Most people list four or five decisions and stop, because they are listing the ones with obvious names. The interesting ones hide inside steps that look purely technical.

A **filter** is a decision. Choosing which five documents to retrieve determines what the model can possibly say, and therefore what the customer is told. A **default** is a decision: what happens when the model returns low confidence, or nothing, or malformed output — routing to a general queue rather than a specialist one is a choice about who gets helped how quickly. An **ordering** is a decision, because a priority queue means somebody waits. A **threshold** is a decision, and it is usually a number someone picked in an afternoon and nobody has revisited. Even a **summary** is a decision when a human then acts on the summary rather than the source: whatever the model omitted has effectively been decided as irrelevant, by the model, on that person's behalf.

The test for whether something is a decision worth listing is not how sophisticated the step is. It is: **if this were wrong, would anyone be worse off, and would they know?** A step that fails that test is plumbing. A step that passes it belongs in the table, even if it is a single line of configuration.

Two drafting notes. **Adverse outcomes climb a tier.** Approving something and denying it are not symmetric: the denial is the one that needs a person, because that is where the harm and the need for recourse live. And **"human approves" must mean something.** If a person is asked to approve two hundred items an hour, you have automated the decision and added a signature. Write the review capacity into the policy — how many items per reviewer per hour is realistic, and what happens to the queue when the volume exceeds it.

### Making human oversight real

"A human reviews it" is the most-written and least-honoured sentence in responsible-AI documents. If your policy is going to rely on it, specify what makes it true.

A reviewer needs four things. **Time**, expressed as a number: if the queue is 200 items and the realistic review takes 90 seconds each, you have committed five hours of someone's day, and the policy should say whose. **Information sufficient to disagree** — the model's output alone is not reviewable, because the reviewer has no basis to judge it. Show the source the answer was drawn from, the criteria the model claims were met, and the confidence, so that disagreeing is a matter of looking rather than of intuition. **Authority**, meaning the reviewer is permitted to reject without needing to justify it upward; a reviewer who must build a case to say no will say yes. And a **fallback for overload**: when volume exceeds capacity, the system must degrade in a defined way — hold the queue, drop to a slower manual path, or turn the automation off — because the undefined behaviour is always that review quietly becomes approval.

Then measure it. The approval rate, the edit rate, and the time spent per item are the numbers that reveal whether oversight is happening. A 99.8% approval rate at eight seconds per item is a rubber stamp, and it is better to know that and change the tier than to keep the sentence in the policy.

## Prohibited uses

The shortest and most valuable section. It stops arguments before they start, and it is where the ethical work from the previous lesson becomes enforceable.

A defensible starter list, to be adapted to your organisation:

- No automated final decision on employment, credit, housing, insurance, education admission, or benefits eligibility.
- No inference or recording of protected characteristics — race, ethnicity, religion, health, sexual orientation, union membership — from free text.
- No emotional or credibility assessment of a person used as a basis for how they are treated.
- No personal, regulated, or secret data sent to a model vendor that is not on the approved list.
- No AI-generated content published in the organisation's name without a named human approver.
- No automation that impersonates a human when a person asks whether they are talking to a machine.
- No use of a personal AI account for company data.

Each item should be a rule someone could be shown to have broken. "Use AI ethically" cannot be broken and therefore is not a rule.

## Recording decisions

The third question — how decisions are recorded — is the one most drafts skip, and the one that determines whether you can answer any question about the system three months later. A customer asks why they were denied. A reviewer asks whether the automation has become uneven. A privacy request asks what data drove an outcome. All three need the same record.

Define a **decision record**: the fields written every time a tiered decision is made. Keep it metadata-heavy and content-light, in line with your logging rules.

```json
{
  "decision_id": "dec_2026_07_14_0912",
  "workflow": "support-triage",
  "decision_type": "priority_assignment",
  "tier": "low",
  "subject_ref": "cust_88213",
  "model": "vendor-model-name, version 2026-04",
  "prompt_version": "triage-v7",
  "inputs_summary": "inbound email, 412 chars, order 8842",
  "output": { "priority": "P2", "criteria_met": ["order_damaged"] },
  "confidence": 0.82,
  "human_reviewer": null,
  "human_action": null,
  "outcome": "routed_to_queue_b",
  "timestamp": "2026-07-14T09:12:44Z"
}
```

Four fields carry most of the value. **Model and prompt version** let you explain a change in behaviour and re-test after an upgrade. **Human reviewer and action** distinguish a genuine review from a rubber stamp, and make the approval rate measurable. **Confidence or criteria met** shows the basis. **Subject reference** — a pointer rather than the person's data — lets you retrieve the record for a rights request without duplicating personal data into a second store.

State the retention period for decision records in the policy, and state who may read them.

Three constraints keep the record from becoming a liability of its own. **It must not duplicate personal data** — hence the subject reference rather than the customer's details, and the summary rather than the full input. Your redaction rules apply here exactly as they do to logs. **It must be retrievable by subject**, or it cannot serve a rights request and cannot answer "why was this person treated this way." And **it must be written by the workflow, not by a person**, because any record that depends on someone remembering to fill it in will be complete for three weeks and then sporadic. Build the write step into the automation template so new workflows inherit it.

The payoff is concrete and arrives sooner than you expect. When a customer disputes an outcome, you can say what the system did and on what basis. When behaviour changes after a vendor updates a model, the version fields let you locate the change instead of speculating. When a reviewer asks whether the automation treats people evenly, the records are the sample. And when something goes wrong, the record is the difference between an incident you can explain and one you can only apologise for.

## A policy template

Adapt this. Every bracketed item is a decision your organisation makes, not one you fill in on its behalf.

```markdown
# Responsible AI Policy — [scope: team / product / workflow family]

Owner: [name, role]     Approved by: [name, role, date]
Version: [n]            Next review: [date]

## 1. Purpose and scope
Which systems this covers: [automations using hosted AI models within
[scope]]. What it does not cover: [model development, personal
productivity use, ...]. This policy supplements [privacy policy,
security policy, acceptable use policy].

## 2. Principles
The [n] principles this organisation holds itself to, one line each:
fairness, transparency, accountability, human oversight,
contestability, reliability, privacy and security.

## 3. Approved uses
Tasks AI systems may be used for within scope: [drafting, summarising,
classifying, extracting, ...]. New uses require [approval route].

## 4. Prohibited uses
[The enumerated list. Each item a rule that can be broken.]

## 5. Decision rights
Tier definitions (low / medium / high) and the decision table.
Default when a decision is not listed: treat as high and ask.

## 6. Human oversight
Who reviews what, the expected review capacity, what a reviewer must be
shown in order to disagree, and what happens when the queue exceeds
capacity ([hold, degrade to manual, ...]).

## 7. Data rules
Approved model vendors. Data classes permitted per vendor. What must
never enter a prompt. Retention for prompts, outputs, and decision
records. Reference to the data inventory for each in-scope workflow.

## 8. Transparency and disclosure
Where AI involvement is disclosed to users and in what words. How a
person reaches a human. How a person contests an outcome.

## 9. Fairness testing
Which workflows require a documented fairness test before launch, the
method, and the re-test triggers (model change, prompt change,
[n] months elapsed).

## 10. Records
Decision record fields, where stored, retention, who may access.

## 11. Monitoring
What is monitored, by whom, at what frequency, and the thresholds that
trigger action. [See the monitoring standard.]

## 12. Incidents and escalation
What counts as an AI incident. Who to notify and within what time.
Immediate containment expectations. Where the write-up is filed.

## 13. Roles
Workflow owner, approver, reviewer, privacy contact, security contact.
Named people, not aliases.

## 14. Exceptions
How to request one, who may grant it, maximum duration, where recorded.

## 15. Review
Reviewed [annually] and on [material change to law, vendor, or scope].
```

Sections 5, 6, and 10 are the ones that make it a policy rather than a statement of values. If time is short, write those three properly and sketch the rest.

Notice how much of the document is already written. Section 7 is your data inventory and vendor questionnaire from the security lesson. Section 9 is the fairness testing procedure and the record you produced from it. Section 11 is the monitoring work in the next lesson. The policy is largely an index to artifacts you have built, which is precisely why it is worth writing after the practice rather than before: a policy assembled from real controls describes a system that exists, and one written first describes a system somebody hopes for.

Two drafting habits are worth adopting. **Write in the active voice with a named actor** — "the workflow owner reviews the decision table each quarter" rather than "decision tables are reviewed periodically," because the passive version has no one to ask when it does not happen. And **prefer numbers to adjectives**: "within two business days" beats "promptly," "5% weekly" beats "regularly," and "review capacity of 60 items per reviewer per hour" beats "adequate resourcing." Every adjective in a policy is a future argument.

## Getting it adopted

A policy nobody approves is a draft, and a policy nobody can follow is theatre. Four practical moves.

**Name a single owner.** One person, by name, accountable for the document and for keeping it current. Shared ownership is no ownership.

**Route it to a real approver.** Your manager, a privacy or legal contact, and whoever owns security. Ask for a decision by a date. Include a one-paragraph summary of what changes for people day to day, because that is what determines whether it gets signed.

**Provide an exceptions path.** Without one, people simply violate the policy quietly when it blocks real work. With one, you learn where the policy is wrong. Time-limit every exception and record it.

**Make compliance the easy path.** Build the decision record into the workflow template so it happens by default. Put the approved-vendor list where people connect tools. A policy that requires extra effort at every step decays within a quarter.

Finally, write down what you were unsure about. A policy draft that says "we have not decided whether auto-closing tickets is medium or high tier, and here is the argument each way" gets a real answer from a real decision-maker. One that quietly guesses gets approved and then breaks.

## Practice

1. **Enumerate the decisions.** For your automation, or the family of automations your team runs, list every point where output changes what happens next. Aim for at least eight entries; if you have fewer, you are describing steps rather than decisions.
2. **Tier each one** against the criteria table, and write the decision-rights table in the format shown. For every medium and high entry, state who the human is by role.
3. **Stress-test three rows.** For three of your entries, write what happens when the automation is wrong — who is affected, how they find out, and how it gets fixed. If the answer to "how do they find out" is "they do not," raise the tier.
4. **Draft the prohibited-use list** for your context: at least six items, each phrased so that a violation would be identifiable.
5. **Design the decision record** for your workflow: the exact field list, where it is written, its retention, and who can read it. Check it against your redaction rules from the security lesson — the record must not become a new store of personal data.
6. **Write the policy.** Two pages, using the template, with sections 5, 6, 10, and 12 complete and the rest at least sketched. Fill in the owner and reviewer names. Mark unresolved questions explicitly as open questions with the argument on each side.
7. **Send it for approval.** Identify the actual person who would approve it, write the covering paragraph, and — if your circumstances allow — send it and record what came back. Note every place your draft was corrected; that feedback is the most useful part of the exercise.
