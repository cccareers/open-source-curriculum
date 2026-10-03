---
course_id: ds320
media_id: ds320-v02
type: video-script
title: "Whose Decision Is It? Walking One Access Request Through the RACI"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - ds320-02
objectives:
  - Explain what a data governance program owns and who is accountable for each part
competency_ids:
  - D5-S1-C02
---

## Purpose

After watching, the learner can take an access request that lands on an engineer's desk, identify which role is accountable for each part of the decision, route it correctly, and state the custodian's own responsibilities without overstepping them.

## Audience and prerequisites

ds320 learners who have read lesson 2, "The accountability model".

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Presenter to camera; chat message on screen: "Hey, can marketing get read access to mart.customer_ltv? Need it by Thursday. Thanks!" | "A message like this lands on a data engineer's desk every week. It looks like a ticket. It's actually five separate decisions, and only one of them is yours." |
| 0:20 | Whiteboard: five role columns — Owner, Steward, Custodian (you), Privacy, Council. | "Lesson 2's five roles. Let's walk this request through them." |
| 0:35 | Whiteboard row 1: "Classify mart.customer_ltv" — A under Owner, R under Steward, C under Custodian and Privacy. | "First decision: what is this table? It holds email and a segment inferred from behaviour. The owner, head of customer operations, is accountable for the label. The steward does the work. You're consulted, because you know what the columns really contain." |
| 1:05 | Inventory entry appears: `mart.customer_ltv | owner: customer_ops | classification: Confidential | contains PD: yes`. | "If this entry exists, the first decision is already made. If it doesn't, that's your first finding: a table with no owner means every later decision has no author." |
| 1:25 | Row 2: "Approve marketing access" — A Owner, R Steward, C Custodian, C Privacy. | "Second: should marketing have access? Again the owner's call. Privacy is consulted because of purpose limitation: was this data collected for marketing at all?" |
| 1:50 | Callout: "Your job here: options and costs, not the decision." Options listed: full table; `customer_ltv_safe` view without email; aggregated by segment. | "You're consulted, and your contribution is options with their costs. Full table. A view without email. An aggregate by segment. Say what each exposes and what each takes to build." |
| 2:25 | Row 3: "Implement the grant" — A/R Custodian. SQL: `GRANT SELECT ON mart.customer_ltv_safe TO analyst_marketing;` | "Third decision: implement the approved grant. This row is yours, accountable and responsible. You decide how: to a functional role, never a person; with default privileges so next month's tables don't break; to the view, if that's what was approved." |
| 2:55 | Row 4: "Attest access still needed (quarterly)" — A Owner, R Steward, C Custodian. | "Fourth: three months from now, is the access still needed? The owner attests; you produce the membership list they review. Silence means removal, not retention." |
| 3:20 | Row 5: "Exception: marketing needs email for a vendor match" — A Council, R Owner, C Custodian, C Privacy. | "Fifth, the one that escalates: marketing says they need email for a vendor match, which breaks the standard. That's an exception. The council is accountable. The owner brings it. You and privacy are consulted. And it goes in the exception register with a compensating control and an expiry date." |
| 4:00 | Chat reply drafted on screen: "Thanks! This table is Confidential (contains email). Access needs approval from customer_ops (owner). I've opened request GOV-212 and tagged them, with three options: (1) safe view without email, ready same day; (2) segment aggregate, 1 day; (3) full table, needs owner + privacy approval and an exception if email goes to a vendor. I'll implement whichever is approved." | "So here's the reply. Not yes, not no. It names the classification, routes to the owner, offers options with costs, and says what you'll do once it's decided." |
| 4:40 | Card: "Policy -> Standard -> Control -> Evidence". Evidence example: approval record on GOV-212, grant diff, quarterly review sign-off. | "And every step leaves evidence: the approval on the ticket, the grant in the monthly diff, the review sign-off. That's what an auditor will ask for later." |
| 5:05 | Presenter to camera. | "The rule of thumb: when you're handed a decision from another row, don't make it. Name the owner, route it, and bring the technical options. Your row is implementing it correctly and proving you did." |
| 5:30 | End card: lesson 2 practice items 1 and 2. | "Now build the RACI for the five decisions in lesson 2's practice." |

## On-screen assets and B-roll

- Whiteboard RACI that fills row by row (matches lesson 2's table).
- Mock chat messages and a governance ticket (fictional IDs).

## Accessibility

- Captions; RACI letters spoken aloud as they appear ("A for accountable under owner").
- Whiteboard uses letters, not colors, to encode roles.
- Mock chat text large enough to read and also narrated.

## Check for understanding

1. Who is accountable for approving marketing's access to `mart.customer_ltv`? *Answer: the data owner (with the steward responsible and the custodian and privacy consulted).*
2. Which decision in this request is the custodian accountable for? *Answer: implementing the approved grant correctly (and producing evidence of it).*
3. Marketing wants email sent to an external vendor, against the standard. Where does that go? *Answer: an exception, approved by the council (or equivalent senior role), recorded in the exception register with justification, compensating control, and expiry.*
