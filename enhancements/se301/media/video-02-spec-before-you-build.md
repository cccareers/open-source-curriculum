---
course_id: se301
media_id: se301-v02
type: video-script
title: "Spec Before You Build: The Welcome Message That Sent Five Times"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - se301-06
objectives:
  - Design an automation or workflow that removes manual steps from a sales process
competency_ids:
  - D3-S1-C04
  - D3-S1-C05
---

## Purpose

After watching, the learner can tell a trigger (an event) from a condition (a state). The learner can also write the four most-skipped spec sections (suppression, re-entry, exit conditions, failure handling) before opening any automation builder.

## Audience and prerequisites

Learners who have read Lesson 6 through "The workflow spec." Platform-neutral; uses Lesson 6's worked spec 1 (inbound speed-to-lead) and the Waypoint Fleet Systems context.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard. A phone with five identical text notifications: "Thanks for your interest in Waypoint!" | "A prospect at a trucking company fills in your demo form five times, because the page was slow. Your workflow thanks them five times, creates five opportunities, and assigns them to three different reps. Nobody wrote anything wrong. They just didn't write down enough." |
| 0:20 | Title card: "The seven parts." Draws seven boxes: Trigger, Enrollment criteria, Conditions/branches, Actions, Waits, Exit conditions, Suppression & re-entry. | "Every automation builder in every platform assembles the same seven parts. The bugs live in the last two, which are the ones people skip." |
| 0:45 | Draws a lightning bolt labelled EVENT and a light switch labelled STATE. | "First, the distinction that fixes most bugs. A trigger is an event. It happens once and it's gone. A condition is a state. It's true or false whenever you look." |
| 1:00 | Writes: "When deal amount > $50,000". Draws 200 deal cards all lighting up at once after a "bulk edit" arrow. | "'When the deal amount is over fifty thousand' is a state. Two hundred existing deals already match it. Hang it on a broad trigger like 'any deal updated' and the next bulk edit enrolls all two hundred at once." |
| 1:25 | Rewrites: "Trigger: Amount field CHANGED. Condition: new value > $50,000". One card lights. | "Correct version: trigger on the event, meaning the amount field changed, then check the state, meaning the new value is over fifty thousand. One card lights. Ask of every automation: what exactly is the moment?" |
| 1:45 | Title: "Writing the spec." Blank spec template appears with headings. | "Now the spec, on paper, before the builder. Here's speed-to-lead for Waypoint." |
| 1:55 | Fills in: Name: INBOUND — Web form — Acknowledge, assign, task. Purpose: remove the steps between form submission and first attempt. Owner: sales ops, reviewed monthly. | "A name anyone can read, one sentence of purpose, and a named human owner." |
| 2:15 | Trigger: "Contact submits 'Request a demo' form." Enrollment: "Email or phone present; not already on an open opportunity; not tagged do-not-contact." | "Trigger and enrollment criteria. Notice 'not already on an open opportunity'. That one line stops the duplicate deal." |
| 2:35 | Suppression: "Existing customers; partner-owned contacts; anyone opted out." Highlighted with a shield icon. | "Suppression: who must never get this. Existing customers asking for a demo of a new module should not get a new-prospect welcome." |
| 2:55 | Re-entry: "Max once per 30 days. Second submission → notify existing owner instead." The five-notification phone becomes one notification plus an internal ping. | "Re-entry: what happens if the trigger fires again. This is the line that would have stopped the five texts." |
| 3:15 | Actions table drawn: set source and first-inbound date; round-robin owner by region; acknowledgement naming the rep; notify owner; task due in 30 minutes; at +2 hours, branch on whether activity is logged; escalate to team lead; +1 business day second-attempt task. | "Actions, in order, with timing, and which record each one touches." |
| 3:45 | Exit conditions: "Owner logs activity; contact replies on any channel; opportunity created; contact opts out." Highlighted with a door icon. | "Exit conditions: every reason to stop early. A reply is a hard exit on anything outbound. The most embarrassing automation failure is the follow-up sent to someone who already answered." |
| 4:05 | Failure handling: "No owner match → inbound queue + notify team lead. Never leave a record unowned." | "Failure handling: what happens when an action can't complete. An unmatched region shouldn't produce an orphan lead that sits there for a week." |
| 4:20 | Success measure: "Median minutes from form to first logged outbound activity; target < 30 min for 80% of leads." Test plan: four test contacts drawn as stick figures labelled matching / existing customer / no region / duplicate within 30 days. | "And a success measure plus a test plan, including the suppression case and the duplicate case." |
| 4:45 | Arrow to a builder screen (generic), toggle shown OFF, then "Test with your own email and phone," then "Watch enrollment count in the first hour." | "Build it inactive. Test it with records you control. When it goes live, check the enrollment count in the first hour. If you expected twenty and see two thousand, the first hour is the cheapest time to find out." |
| 5:10 | Recap: seven boxes with the last two circled; EVENT vs STATE icons. | "Trigger on events, check states, and write suppression, re-entry, exits, and failure handling before you click anything." |
| 5:30 | Practice prompt. | "Pause. Spec the trigger and condition for: 'Create a task when a deal has been in Negotiation for fourteen days.'" |
| 5:45 | Sample answer. | Host VO: "There's no event at day fourteen, so use a scheduled daily trigger. Condition: stage is Negotiation, days in stage is at least fourteen, no open task already exists. Re-entry: once per deal per stage entry. Exit: stage changes or the deal closes." |
| 6:10 | End card. | |

## On-screen assets and B-roll

- Whiteboard drawings (Excalidraw-style), generic builder mock-up, phone notification graphic.
- Completed spec as a downloadable one-page template.

## Accessibility

- Captions; every drawn label is also spoken.
- Event and state shown with distinct icons (lightning bolt and switch) and text.
- Spec template provided as an accessible document with real headings.

## Check for understanding

1. Which spec line would have prevented the five welcome messages? *(Answer: the re-entry rule — maximum once per 30 days, with a second submission notifying the existing owner instead.)*
2. Rewrite "When the deal amount is over $50,000" as a correct trigger plus condition. *(Answer: trigger when the amount field changes; condition that the new value is over $50,000.)*
3. Why should a reply always be an exit condition on outbound automation? *(Answer: otherwise the system keeps sending to someone who has already engaged a human, which damages the relationship and the sender's reputation.)*
