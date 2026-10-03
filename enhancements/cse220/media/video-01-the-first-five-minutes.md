---
course_id: cse220
media_id: cse220-v01
type: video-script
title: "The First Five Minutes of an Outage"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - cse220-08
objectives:
  - Act correctly in the first thirty minutes of a service outage
competency_ids:
  - D6-S1-C02
  - D5-S1-C01
---

## Purpose
After watching, the learner can declare an incident within three minutes of an alert, assign roles out loud, ask "what changed" first, and post a first public update that commits to a next-update time without speculating about cause.

## Audience and prerequisites
Apprentices who have read lesson 08. Uses the storefront checkout incident (v2.14.1 release at 13:58, error ratio 22% from 14:05). Hybrid: presenter on camera in a corner, screen showing the incident channel, the triage dashboard, and a status-page draft.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Phone buzz. Alert card: `CheckoutErrorRatioHigh — 22% for 3m — runbook: runbooks/checkout-errors`. Clock overlay 14:07:10. | "14:07. The pager fires. Over the next five minutes you'll make the decisions that decide how the next hour goes. Most people spend those five minutes silently typing queries. We're going to do something different." |
| 0:20 | Presenter on camera. | "First rule: going quiet is the most expensive thing you can do. Everyone outside the response will assume nothing is happening, and they'll start interrupting you." |
| 0:35 | Triage dashboard, row 1: error ratio 22% (red, labelled BREACHED), p95 normal-ish, traffic normal. Clock 14:07:40. | "Thirty seconds on the triage dashboard. Is it real? Yes — 22% against a normal of 0.05%. Since when? 14:05. Traffic's normal, so it's not a surge. That's enough to declare." |
| 1:00 | Incident channel. Presenter types the declaration from lesson 08, line by line. Clock 14:08:20. | "Declaring an incident. Storefront checkout, production. Symptom: error ratio 22%, started 14:05, ongoing. Impact: roughly one in five checkout attempts failing. Severity: SEV2, proposed. I'm incident commander. Next update 14:25. — Five facts and a commitment. Thirty seconds." |
| 1:35 | On camera, lower-third: "Start high, downgrade later". | "Why SEV2 and not SEV3? Customers can't buy. When you're between two levels, take the higher one. It's easy to stand people down and hard to summon them late." |
| 1:55 | Channel: "Priya, you're ops lead. I'm IC and comms. Sam, can you scribe?" Replies: "ack ops", "ack scribe". Clock 14:09:00. | "Roles, out loud, and confirmed. I'm commander *and* comms — that's fine in a small team. What's not fine is the ops lead also doing comms. The person in the queries can't also be writing to customers." |
| 2:25 | Dashboard row 5: deployment annotation "v2.14.1 13:58". Channel: "What changed in the last hour? I see v2.14.1 at 13:58." Clock 14:09:30. | "Now the highest-yield question in incident response: what changed? There's a release seven minutes before onset. That's not proof. But it's the first thing to check." |
| 3:00 | Channel: Priya: "Proposing rollback to v2.14.0. If it's the cause, error ratio should drop within 3 min." IC: "Approved. Go." Scribe line appears in timeline doc. Clock 14:10:10. | "Mitigate first, diagnose second. We don't need to know which line broke to undo the release. Notice the shape: announced before it's done, with a prediction, approved by the commander, recorded by the scribe." |
| 3:40 | Status page draft: "14:12 — Investigating: some customers are unable to complete checkout. Browsing and account access are unaffected. Next update by 14:45." Clock 14:11:30. | "Public status page. What's affected, what's not affected, next update time. No cause, no component names, no 'we think it's the database'. Saying what's *not* broken reduces unrelated reports." |
| 4:15 | Channel: stakeholder "Any news?? Sales is asking." IC reply: "SEV2, rollback in progress, next internal update 14:25. Customer wording: 'We're aware of an issue affecting checkout and are working on it.'" | "The first stakeholder interruption arrives on schedule. Answer it fully, give them the words to use with customers, and point to the next update. Then go back to commanding." |
| 4:45 | Dashboard: error ratio line drops to 0.06% at 14:13. Channel: Priya "Error ratio at baseline. Rollback effective." | "Prediction met. That supports the hypothesis — it doesn't prove the mechanism. The incident isn't over: the bad release must not be redeployed, and someone needs to find out why." |
| 5:15 | Checklist overlay: ✔ Dashboard 30 s ✔ Declared by 14:08 ✔ Roles confirmed ✔ What changed? ✔ Mitigation announced with prediction ✔ Public update with next time ✔ Stakeholder answered. | "Seven things in five minutes, and only one of them was a query." |
| 5:45 | On camera. | "None of this is heroic. It's a script you rehearse until it's boring, so that when it's 3 a.m. and you're scared, the boring script runs instead of the panic." |
| 6:15 | Practice prompt: "Lesson 08, Exercise 2: write your first five minutes, timestamped." | "Now write your own first five minutes, timestamped, for the same alert." |

## On-screen assets and B-roll
- Incident channel mock (any chat tool), triage dashboard from project cse220-x01, status-page mock.
- Clock overlay throughout so learners see elapsed time.

## Accessibility
- Captions; all on-screen messages are read aloud verbatim.
- Status colours on the dashboard paired with text labels (BREACHED / NORMAL).
- Provide the declaration, role message, and status update as copyable text.

## Check for understanding
1. Why does the commander avoid running queries? *Answer: Once deep in a query, nobody is coordinating, communicating, or deciding — the response stalls.*
2. What three elements must every public update contain? *Answer: What's affected (and not affected), current state, and the next update time.*
3. The rollback did not reduce errors. What next? *Answer: Record the result, revert or confirm the rollback state, and try the next single mitigation — one change at a time.*
