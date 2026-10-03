---
course_id: dm350
media_id: dm350-v02
type: video-script
title: "Specify the Workflow Before You Build It"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - dm350-06
objectives:
  - Build an automated nurture workflow with entry criteria, branching, and exits
competency_ids:
  - D7-S1-C02
---

## Purpose
After watching, a learner can write a workflow specification with all seven anatomy parts, spot the two parts most often missed (suppression and exits), and derive a test plan from the specification before opening any automation tool.

## Audience and prerequisites
Apprentices who have read lesson 06 through "The Anatomy of a Workflow". No CRM access needed.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head (the instructor) at a desk. Lower third: "Northlight Bookkeeping, checklist nurture". | "A workflow that goes wrong is wrong continuously, to a list that grows every day, often for weeks before anyone notices. So we write it down before we build it. Here is how." |
| 0:20 | Cut to screen: a blank document titled "WORKFLOW: Checklist Nurture v2". Seven empty headings: Entry, Enrollment, Actions, Delays, Branches, Suppression, Goal and exits. | "Seven parts. Every platform names them differently and every platform has all seven. Miss one and you have built a machine with a known defect." |
| 0:45 | Fill ENTRY: `form submission = "The Quarterly Close Checklist" AND marketing_consent_status = opted_in`. Tag: "trigger-based". | "Entry first. Trigger-based: it fires once, when the form is submitted. Not a list filter that re-evaluates every time any data changes, because that is how a Friday import emails two thousand people about a guide they never downloaded." |
| 1:25 | ENROLLMENT: "existing contacts: NO; re-enrollment: NO". | "Two questions, answered on purpose. Pull in everyone who already matches? No. Let someone enter twice? No." |
| 1:45 | GOAL AND EXITS block filled: goal = fit call booked; exits = unsubscribed, disqualified, client, dormant; END at day 21 → long-term newsletter, lifecycle stage unchanged. | "Now write the exits before the emails. The goal: a fit call booked, which removes the contact immediately. Then every other way out: unsubscribed, disqualified, became a client, went dormant. And the end of the sequence has a destination too, the long-term newsletter. Notice we do not push their lifecycle stage backwards; lesson 06 forbids automatic backwards moves." |
| 2:40 | SUPPRESSION: paste the global list from lesson 06 (opted out, hard bounced, Do Not Email, disqualified, dormant, open deal, fit call in last 30 days, 2+ marketing emails in 7 days). | "Suppression is the global 'never' list. The last line is the frequency cap, and it is the only defence against three well-behaved workflows burying one person in nine emails a week." |
| 3:20 | ACTIONS, DELAYS, BRANCHES: day 0 property writes and transactional delivery; day 2 branch on business_type with the default branch marked; day 5 pricing-view signal → task; day 6 re-send branch; day 14 score branch → handoff. | "Now the sequence. Day zero writes data before it sends anything. Day two branches on business type, and the default branch is real copy, because half the database has no business type. Day five is a signal, not a goal: a pricing-page view creates a task for a human but does not end the sequence. Day fourteen is the handoff, and it exits." |
| 4:30 | Annotate "wait until 09:00 recipient local time" with a note: "Portland office, Boston contacts". | "Delays are 'wait until nine a.m. in the recipient's time zone', not 'wait three days'. A ten a.m. send scheduled on Boston time arrives at seven in Portland." |
| 4:55 | Split screen: spec on the left; on the right a test plan builds itself, one test per risky line (happy path, default branch, sparse data, goal mid-flight, unsubscribe, suppressed contact, frequency cap, re-entry, time zone, volume). | "Here is the payoff. Every risky line in the spec becomes a test. Default branch? Test a contact with unknown business type. Goal? Book a call on day three and check nothing else sends. Re-entry? Submit the form twice." |
| 5:55 | Launch gate text: "All ten pass + 10% holdout for 30 days." | "Then the launch gate: all ten pass, and hold out ten percent for the first month. If the enrolled group qualifies at thirty-four percent and the holdout at twenty-six, the workflow earns its keep. If both are twenty-six, you just learned something a dashboard never would." |
| 6:35 | Back to talking head. Checklist on screen: "Properties first. Skeleton with minute delays. Emails one at a time. Real delays. Test plan. Launch in the morning, watch the first hour." | "When you do build it: properties first, then the skeleton with delays set to minutes, then emails one at a time, then real delays, then the tests. And never turn it on at five p.m. on a Friday." |
| 7:15 | Kill-switch card: "Who can pause everything at 22:00? Two names." | "Last thing: write the kill switch. Which workflows to pause, in what order, and two people who can do it at ten at night." |
| 7:35 | End card: "Practice 2-4, lesson 06: specify the client onboarding workflow." | "Your turn: specify Northlight's client onboarding sequence, then write its ten-case test plan. Pause here." |

## On-screen assets and B-roll
- Specification template with the seven headings.
- Lesson 06's Checklist Nurture v2 spec as the worked example.
- Test plan template (case, setup, expected result, pass/fail).

## Accessibility
- Captions; spec text is shown large and read aloud where it carries meaning.
- Talking-head segments have a described-visuals transcript.
- No information conveyed only by highlight colour; each annotation has a text tag.

## Check for understanding
1. Which two anatomy parts are most often missed, and what failure does each cause? *Answer: suppression (emails to people who opted out, are in a sales conversation, or are over the frequency cap) and exit criteria (continuing to send "book a call" after the call was booked).*
2. Why is a pricing-page view handled as a task rather than an exit? *Answer: it is a signal of interest, not the goal; exiting would drop the contact from the sequence at the first flicker of intent.*
3. What does a 10% holdout tell you that the workflow's own goal rate cannot? *Answer: whether the workflow caused the improvement, by comparing enrolled contacts with similar contacts who received nothing.*
