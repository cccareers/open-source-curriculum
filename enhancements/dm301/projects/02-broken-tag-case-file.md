---
course_id: dm301
project_id: dm301-x02
title: "Broken Tag Case File: Verifying Kestrel's Purchase Event"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: warm-up
related_lessons:
  - dm301-02
objectives:
  - Set up a GA4 property and verify that it collects the events a business cares about
  - Explain how events, sessions, and users are counted
competency_ids:
  - D6-S1-C01
---

## Scenario

Kestrel's contractor shipped a checkout release on Tuesday. On Thursday the owner notices GA4 revenue for Wednesday is $9,900 while the order system says $5,418. You do not have access to the site code, only to the captures your colleague took during a verification pass and the release note. Your job is to diagnose every defect from evidence, rank them, and write the verification report the lesson 02 routine would have produced.

This is for learners who cannot run lesson 02's routine on a live property; it practises reading evidence rather than generating it.

## What you will produce
1. A **defect table**: capture, what it shows, which verification step would have caught it, effect on reports, fix.
2. A **reconciliation** of GA4 revenue vs the order system for Wednesday, explaining the gap with arithmetic.
3. A **verification report** (date, tester, device, steps, observed payloads, pass/fail) for the re-test after fixes.
4. A **limitations note** for the owner, under 150 words.

## Before you start

**`release_note.txt`**
```txt
v2.14 (Tue): new order confirmation template; moved GA4 purchase tag into
the tag manager container. Old hardcoded gtag purchase snippet "should be
removed next sprint".
```

**Capture A — Tag Assistant, checkout page loaded, no action taken**
```txt
Tags fired: Google tag (G-XXXXXXXXXX) ✓   GA4 event: begin_checkout ✓
```

**Capture B — DebugView, after placing test order KO-2026-120031 ($86.00)**
```json
[
 {"event_name":"purchase","params":{"transaction_id":"KO-2026-120031","value":86.0,"currency":"USD","items":[{"item_id":"RID-28-SLA","price":86.0,"quantity":1}]}},
 {"event_name":"purchase","params":{"transaction_id":"KO-2026-120031","value":86.0,"currency":"USD","items":[{"item_id":"RID-28-SLA","price":86.0,"quantity":1}]}}
]
```

**Capture C — DebugView, refresh of the confirmation page**
```json
{"event_name":"purchase","params":{"transaction_id":"","value":86.0,"currency":"USD","items":[]}}
```

**Capture D — DebugView, second test order KO-2026-120032 placed on a phone**
```json
{"event_name":"purchase","params":{"transaction_id":"KO-2026-120032","value":"86.00","items":[{"item_id":"TRL-BT-42","price":86.0,"quantity":1}]}}
```

**Capture E — Traffic acquisition, Wednesday, top referral sources**
```txt
pay.example-payments.com   212 sessions   58 purchases
```

**`wednesday_orders.txt`**
```txt
Order system: 63 orders, $5,418 item revenue (63 x $86.00)
GA4: 115 purchase events, $9,900 revenue
```

## Milestones
1. Read each capture and write, in one sentence, what fired and what should have fired.
2. Map each defect to lesson 02's ten-step routine and admin settings.
3. Reconcile Wednesday: quantify the event and revenue gaps, distinguish DebugView fires from processed reports, and state which gaps these captures cannot explain.
4. Write the re-test plan and the limitations note.

## Acceptance criteria
- [ ] Capture B shows a double fire, consistent with the leftover snippet and container tag. Same-ID purchases from the same user in a web stream should be deduplicated in processed reporting; the capture alone does not prove inflated reported revenue.
- [ ] Capture C is identified as a refresh re-fire with an empty `transaction_id`. An empty string is a reused ID: GA4 deduplicates purchases carrying it, risking collapsed orders; it is different from omitting the parameter.
- [ ] Capture D's missing `currency` and string-typed `value` are flagged, with the effect on revenue reporting stated as uncertain rather than guessed.
- [ ] Capture E suggests a payment-provider attribution problem. Confirm the checkout handoff and session continuity, then configure unwanted referrals where appropriate; the table alone does not establish the cause.
- [ ] Capture A is recognised as correct behaviour (no purchase on checkout load).
- [ ] The reconciliation shows its arithmetic and states what portion of the gap is explained and what is not.
- [ ] The limitations note does not use "accurate" without "compared to what".

## Evidence checklist
Defect table, reconciliation, verification report for the re-test, limitations note.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Diagnosis | Finds one or two defects | Finds all four and confirms A is correct | Ranks defects by revenue impact with arithmetic |
| Routine mapping | Generic "test more" | Each defect tied to a numbered verification step | Proposes a monitoring signal that would catch a recurrence without a debugger |
| Reconciliation | Asserts "double counting" | Arithmetic shows how events exceed orders | States the residual it cannot explain and what data would |
| Communication | Jargon | Owner can act on the note | Names the one number she should not reconcile against the order system |

## Stretch goals
- Explain how you would investigate malformed IDs in collected payloads and processed transaction data. An Exploration cannot recover empty-ID events already deduplicated away.
- Propose a key-event and data-quality changelog entry for this release (lesson 05, "Definition drift").

## Reflection prompts
- Which defect would you have missed if you had tested only on desktop?
- Which defect would have looked like a marketing result rather than a tracking bug?

## Instructor notes
The observed gaps are 115 - 63 = 52 purchase events and $9,900 - $5,418 = $4,482. Neither can be reconciled exactly from these sampled captures. Capture B proves two fires but not two processed purchases: [Google documents web-stream deduplication for the same user's transaction ID, including empty-string IDs](https://support.google.com/analytics/answer/12313109?hl=en). Capture C can collapse malformed purchases instead of inflating them. Request a transaction-level export, stream and user identifiers, reporting scope, and tag logs before assigning counts to each defect. The $10 difference between $9,900 and 115 x $86 = $9,890 is unexplained, not rounding: all supplied orders are exactly $86. Accept a quantified residual and a concrete investigation plan rather than an invented reconciliation. Capture E concerns attribution rather than directly explaining the purchase-count gap. Capture D needs the documented numeric value and currency; do not infer its processed revenue from this capture alone.
