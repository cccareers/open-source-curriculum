---
lesson_id: ai201-09
course_id: ai201
pathway: prompt-engineer
title: Customer-Service Automation and Escalation
order: 9
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Design a customer-service automation with explicit confidence thresholds and escalation to a person
---

## The design problem is where to stop

Triage decides what a message is and who should handle it. Customer-service automation decides something harder: whether the system should handle a request at all, and what happens the moment it should not. Get that boundary wrong in the permissive direction and the automation confidently tells a customer something untrue. Get it wrong in the restrictive direction and you have built an expensive forwarding service.

The boundary is drawn with three artifacts, and this lesson builds all three: a **scope contract** saying what the automation may do, a **confidence model** producing a defensible number, and an **escalation design** specifying when a person takes over and what they receive when they do.

None of this is optional polish. A customer-service automation with no explicit thresholds does not have permissive thresholds — it has invisible ones, set by whatever the model happened to output, and nobody can audit them.

## The scope contract

Write down, before building, exactly what the automation is permitted to do. Two lists, both explicit.

**Allowed actions.** Not topics — actions. "Answer questions about published delivery windows using the published schedule." "Send a copy of an existing invoice to the email address already on the account." "Record a change of delivery instruction on an order that has not shipped." Each allowed action names its data source and its precondition.

**Forbidden actions**, named individually even where they seem obvious: quoting a price not in the published rate table, promising a date, issuing a refund or credit, acknowledging fault, waiving a fee, changing account ownership, disclosing anything about a third party, discussing a legal matter or a regulator, giving safety guidance.

Then the standing rules, which apply to every request regardless of category:

- The automation may only assert facts retrieved from an approved source in this run. No prior knowledge, no plausible defaults.
- Where a fact is missing, the request escalates. It never gets estimated.
- Anything not on the allowed list escalates by default. **The default is escalate, not attempt.**
- Every outbound message to a customer is reviewed by a person before it is sent, for the duration of this course's designs. Where an organization later chooses to auto-send a narrow category, that decision is made with measured evidence and named accountability, not by loosening a threshold quietly.

That last point deserves plain speech. Auto-handling in the tables below means "handled without a human writing the reply" — the reply still passes a human review gate before it leaves. The confidence machinery exists to decide how much scrutiny a case gets and where the human's attention should go, not to remove the human.

## Building a confidence signal worth trusting

A model's self-reported confidence is one weak input. Treat it as a signal, not an authority: it is poorly calibrated, it moves when you change the prompt, and it is systematically overconfident on requests that are just outside its knowledge — precisely the cases you care about.

Combine four independent signals instead:

**Classification confidence.** The model's own score for what the request is. Useful mostly at the low end; a score of 0.4 is meaningfully informative, a score of 0.95 is not.

**Retrieval quality.** Did the grounding step find relevant policy content, and how relevant? A retrieval that returns nothing above a similarity floor means the automation has no basis to answer, no matter how confident the model sounds. In practice this is your strongest signal.

**Rule checks.** Deterministic preconditions for the allowed action: the order exists, it has not shipped, the requester's email matches the account, the invoice is not in dispute. These are binary and they are the cheapest signal you have.

**Request complexity.** Multiple questions in one message, conditional phrasing ("if X then can you also"), a stated deadline, an attachment, a reference to a previous unresolved contact. Each is a reason to route to a person, and each is detectable with plain logic.

Combine with a conservative rule rather than an average. Averaging lets a strong signal hide a fatal one:

```text
handling_tier =
  ESCALATE       if requires_human OR rule_check_failed OR retrieval_hits = 0
                    OR complexity_flags >= 2 OR sentiment = negative
                    OR requested_action NOT IN allowed_actions
  ESCALATE       if classification_confidence < 0.70
  ASSISTED       if classification_confidence < 0.90 OR retrieval_top_score < 0.75
                    OR complexity_flags = 1
  AUTO_DRAFT     otherwise
```

Note that the escalate conditions are checked first and any one of them wins. This is a deliberate asymmetry: escalating a case that could have been handled costs a few minutes of someone's time; handling a case that should have escalated costs a customer.

![Confidence thresholds routing requests into auto-draft, assisted, and escalate tiers](./img/confidence-routing-thresholds.png)

## Setting the thresholds with evidence

The numbers above are placeholders until you measure. Setting them properly takes a labeled set and an afternoon.

**Build the set.** 150 to 300 real requests, hand-labeled with the correct category, the correct action, and — critically — whether an automated answer *would have been correct*. That last label is what you are actually optimizing, and it can only be assigned by someone who knows the business.

**Run the pipeline in shadow.** Process every request through classification, retrieval, and drafting without sending anything. Record all four signals and the draft.

**Score the drafts.** A knowledgeable reviewer marks each draft: correct and complete, correct but incomplete, or wrong. Wrong means it asserted something untrue or made a commitment.

**Plot and choose.** For each candidate threshold, compute two rates over the cases that threshold would auto-draft: the **wrong rate** and the **volume share**. Now the decision is explicit — at a 0.90 floor you draft 46% of volume with a 2% wrong rate; at 0.80 you draft 68% with a 9% wrong rate.

Choose using the cost of a wrong answer, not by preference. Ask the business owner directly: how many wrong customer answers per hundred is acceptable? For a billing question the answer is near zero. For "what are your opening hours" it is higher. This is why thresholds are **per category**, not global:

| category | auto-draft floor | assisted band | notes |
| --- | --- | --- | --- |
| `hours_and_locations` | 0.80 | 0.60-0.80 | Published facts, low harm |
| `order_status` | 0.90 | 0.75-0.90 | Requires order match |
| `document_resend` | 0.90 | 0.75-0.90 | Identity check must pass |
| `billing_question` | 0.95 | 0.85-0.95 | Money; narrow allowed actions |
| `complaint` | never | never | Always escalate |
| `legal_or_safety` | never | never | Always escalate, priority route |

Once calibrated, these per-category floors replace the placeholder 0.70 and 0.90 in the tier rule above: each category uses its own auto-draft floor and assisted band, and anything below its assisted band escalates. The escalate-wins conditions stay global and are still checked first.

Write the chosen numbers, the measured wrong rate at each, and the date into a threshold record stored with the workflow. When someone asks in six months why the floor is 0.9, the evidence is attached. Re-measure after any prompt, model, or knowledge-base change — a threshold calibrated against a prompt you have since edited is a number with no meaning.

## Escalation design

Escalation is a feature you design, not a failure you fall into. Four parts.

**Triggers.** Beyond the tier rule: negative sentiment at any confidence, a second contact on the same case within 24 hours, a third message in one thread, a stated deadline inside the SLA, a high-value account flag, any mention on the `requires_human` list, and an explicit customer request for a person. That last one is absolute — a customer asking for a human gets a human, immediately, with no attempt to resolve first.

**The handoff payload.** A warm handoff, not a dumped ticket. Everything the agent needs on one screen:

```json
{
  "case_id": "CASE-2026-0318-0093",
  "escalated_at": "2026-03-18T09:41:12Z",
  "escalation_reason": "retrieval_hits = 0",
  "escalation_trigger_rule": "no approved source covers 'international pallet surcharge'",
  "customer": {
    "name": "Dana Reyes",
    "company": "Northwind Freight",
    "account_tier": "standard",
    "open_cases": 1,
    "contacts_last_30d": 2
  },
  "request_summary": "Asks whether the international surcharge applies to a Tuesday pickup of 12 pallets to Ontario.",
  "classification": {"category": "billing_question", "confidence": 0.62, "priority": "normal"},
  "conversation": [
    {"at": "2026-03-18T09:38:02Z", "from": "customer", "text": "..."},
    {"at": "2026-03-18T09:39:44Z", "from": "automation", "text": "Acknowledged receipt, no answer given."}
  ],
  "what_the_automation_did": [
    "Classified as billing_question (0.62)",
    "Searched policy base for 'international surcharge' - 0 results above threshold",
    "Did not draft a response",
    "Sent acknowledgement only"
  ],
  "known_facts": {"order_reference": null, "invoice_number": null, "account_balance_current": true},
  "suggested_starting_point": "Rate table does not cover cross-border surcharges. Confirm with pricing before replying.",
  "sla_due_at": "2026-03-18T11:41:12Z"
}
```

Three fields in that payload earn their keep. `escalation_reason` and `escalation_trigger_rule` tell the agent why they have it, which prevents them repeating work the automation already did. `what_the_automation_did` tells them what the customer has already been told — nothing is more damaging than an agent contradicting an earlier automated message. `suggested_starting_point` is advisory and clearly labeled as such.

**What the customer experiences.** The customer is told, plainly and immediately, that a person is taking over and when to expect them. No pretending the automation is a person; no silence while the case moves queues. If the handoff happens mid-conversation, the agent's first message acknowledges what was already discussed.

**Capacity and time.** Escalation into an empty queue at 6pm on Friday is not escalation. Design for business hours: outside them, the acknowledgement states the next business day and the case ages against a clock that only runs during working hours. Set a backstop timer — a case sitting in an escalation queue past its SLA notifies a named person, and past double the SLA notifies their manager. And handle the overload case: when the escalation queue exceeds a defined depth, the automation gets *more* conservative, not less, and the acknowledgement message tells customers response times are extended.

## Failure modes and their fallbacks

Decide the fallback for each failure before it happens. In every case the answer is the same shape: degrade toward the human, never toward a guess.

| failure | fallback |
| --- | --- |
| Model API unavailable or timing out | Acknowledge receipt, route the whole queue to humans, alert the owner |
| Retrieval returns nothing above the floor | Escalate with `retrieval_hits = 0`; never answer from model memory |
| Model returns unparseable output | One retry, then escalate with the raw output attached |
| Knowledge base stale (source older than N days) | Downgrade the tier by one; flag staleness on the reviewer's screen |
| Customer sends a language you do not support | Escalate immediately with the original text |
| Same case escalated twice | Route to a lead, not back into the general queue |

## Measuring the system

Four measures, and the tension between them is the point.

**Deflection or containment rate** — share of contacts resolved without a human writing a substantive reply. This is the number sponsors ask for, and it is meaningless alone.

**Wrong-answer rate** — share of automated drafts a reviewer marks as untrue or over-committing. Measured continuously by sampling reviewed cases, not just at launch. This is the number that must stay near zero.

**Escalation quality** — of escalated cases, what share did the agent judge should have been escalated? Too high a share of unnecessary escalations means your thresholds are wasting money; any share of missed escalations is a safety problem.

**Customer outcome** — resolution time and satisfaction for automated versus human-handled cases, segmented by category. If deflection rises while satisfaction falls, you are not deflecting contacts, you are deferring them.

Report all four together, always. A deflection rate quoted without a wrong-answer rate is a claim with the risk removed from it.

## Practice

Design and build a customer-service automation for one narrow service domain — a support desk, a booking service, an internal help desk, or a membership organization.

1. **Write the scope contract.** At least five allowed actions, each with its data source and precondition, and an explicit forbidden list. Have someone who knows the domain challenge it and record what they moved from allowed to forbidden.
2. **Assemble a labeled set** of at least 100 real or realistic requests. For each, record the correct category, the correct action, and whether an automated answer would have been correct.
3. **Build the pipeline in shadow mode**: classify, retrieve grounding content, compute rule checks and complexity flags, draft. Send nothing. Log all four confidence signals per case.
4. **Have a knowledgeable reviewer score every draft** as correct-and-complete, correct-but-incomplete, or wrong.
5. **Calibrate.** For at least four candidate thresholds, tabulate auto-draft volume share against wrong rate. Choose per-category floors, and write the threshold record with the numbers, the measured wrong rate, the sample size, and the date. Justify each floor in one sentence referencing the cost of a wrong answer in that category.
6. **Implement the tier rule** with escalate-wins-first ordering, and verify with three crafted cases: one that trips only `requires_human`, one that trips only zero-retrieval, and one high-confidence case with two complexity flags. All three must escalate.
7. **Build the escalation path**: the handoff payload with every field above, the customer-facing acknowledgement, business-hours handling, and a backstop timer that notifies a named person past SLA.
8. **Test the failure modes.** Break retrieval, break the model call, and feed unparseable output. Confirm each degrades toward a human and that the customer is acknowledged in every case.
9. **Prove the review gate.** Demonstrate that no path in your workflow sends a customer message without a `status = approved` transition performed by a person. Then report your four measures over the labeled set, together, in one table.

## Check your understanding

1. A request has classification confidence 0.96 and strong retrieval, but the order has already shipped, so the rule check fails. Which tier, and why not average the signals? *Answer: ESCALATE. Escalate conditions are checked first and any one wins. Averaging would let three strong signals hide the one that makes an automated answer wrong.*
2. Does AUTO_DRAFT mean the reply is sent without a person? *Answer: no. In this course's designs every customer-facing reply passes a human review gate. The tier only decides how much scrutiny the case gets and whether a draft is prepared.*
3. A customer writes "can I talk to a person?" in an otherwise simple `hours_and_locations` question. What happens? *Answer: they get a person, immediately. An explicit request for a human is an absolute escalation trigger, whatever the confidence.*
