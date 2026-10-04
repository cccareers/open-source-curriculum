---
course_id: sn102
media_id: sn102-a02
type: animation-storyboard
title: "The Flow That Waits"
target_runtime: "75 sec"
suggested_tool: "Excalidraw+screen recording"
related_lessons:
  - sn102-08
objectives:
  - Explain how workflow automation moves work through the platform without manual handoffs
competency_ids:
  - D2-S1-C05
  - D7-S1-C02
---

## Concept and misconception it fixes
The lesson 8 rule of thumb — "if it waits, it is a flow; if it reacts, it is a rule" — is abstract until you see time pass. Learners imagine automation as instant, or imagine a flow "running" for four days. The animation contrasts a business rule (fires and finishes in a blink) with the Software Licence flow (pauses at approvals, persists, resumes), and shows the handoffs that disappeared compared with the email version.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Hand-drawn Excalidraw style. Left third: "Email version" with four inbox icons and dashed arrows labelled "forward". Right two thirds: "Platform version".
- Records: rounded cards (REQ, RITM, Approval, SCTASK). Flow steps: numbered boxes 1–8 from the lesson's text block.
- Waiting steps: hourglass icon + "WAITING" text, sky blue `#56B4E9`. Immediate steps: lightning icon + "instant", orange `#E69F00`. Human action: person icon, bluish green `#009E73`.
- A day counter in the top-right corner (Day 1 09:00 → Day 4 14:00).

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0–10s | Email version: employee → manager → IT → employee; envelopes travel slowly; one gets stuck with "?" at the manager's inbox. | Envelopes move; one stalls. | "The email version: every arrow is a handoff, and handoffs are where work disappears." |
| 2 | 10–18s | Platform version: employee submits "Software Licence" in Employee Center; REQ and RITM cards appear. | Cards pop in. | "On the platform, submitting the catalog item creates a request and a requested item. Nobody forwarded anything." |
| 3 | 18–26s | Small inset: a before business rule (lightning) stamps a Due date on the RITM in a blink. Timer reads "0.05 s". | Flash; done. | "A business rule reacts instantly — it stamps a due date and it's finished." |
| 4 | 26–40s | Flow column: steps 1 (look up manager, instant) → 2 (Ask for approval — hourglass). Approval card appears in the manager's "My Approvals". Day counter runs Day 1 → Day 3. Flow box shows "paused — saved". | Flow halts at step 2; counter spins; a small "state saved" disk icon. | "The flow asks for approval — and stops. Not running, not polling: paused, with its place saved. Two days pass." |
| 5 | 40–48s | Manager taps Approve on phone. Flow resumes at step 3/4: cost check → under threshold, skip step 4 (greyed). | Arrow resumes; step 4 greys with "skipped: under threshold". | "The manager approves. The flow resumes exactly where it paused. The licence is cheap, so the second approval is skipped." |
| 6 | 48–60s | Step 5 creates SCTASK in "Software Asset" group queue; step 6 hourglass; Day 3 → Day 4; a group member (not the original person — "on holiday" tag on another) picks it up and closes it. | Task card moves into a queue; another member grabs it. | "A catalog task lands in a group's queue, not one person's inbox. Someone's on holiday? A colleague picks it up. The flow waits for it to close." |
| 7 | 60–68s | Steps 7–8: RITM Closed Complete; requester notified. Execution log panel slides in listing each step with timestamps; 80% of the elapsed bar highlighted on step 2. | Log fills; bar highlights. | "Item closed, requester told. And the execution log shows where the time went: most of it waiting for the manager." |
| 8 | 68–75s | Split: rule (lightning, "reacts") vs flow (hourglass, "waits"). | Both icons pulse. | "If it reacts, it's a rule. If it waits, it's a flow." |

## Interaction variant (optional)
Clickable step-through (H5P Course Presentation): learner clicks each step to reveal whether it waits or runs instantly, and must predict which group member picks up the task.

## Production notes
- Use step wording from lesson 8's text block exactly so learners can match it.
- Flow Designer is reached through Workflow Studio on recent releases; avoid showing release-specific UI — keep to diagrams.
- Provide captions and a text alternative describing the day counter and the paused state.
