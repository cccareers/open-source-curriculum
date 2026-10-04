---
course_id: sn360
media_id: sn360-v02
type: video-script
title: "Building \"Where Is My Case?\" in Virtual Agent"
format: screencast
target_runtime: "9 min"
related_lessons:
  - sn360-07
objectives:
  - Build a Virtual Agent topic that resolves a common customer request without a human agent
competency_ids:
  - D3-S1-C03
---

## Purpose

After watching, the learner can build the lesson 7 case status topic: lookup before the first question, a three-way branch on case count, a picker, a status card in customer wording, and a handoff with an out-of-hours path, then test it with the four contact scenarios.

## Audience and prerequisites

Learners on lesson 7 with Virtual Agent available on a CSM PDI (plugin availability varies; record what was activated). Test contacts: one with no cases, one with one case, one with six cases, one with a resolved-not-closed case.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Portal chat as Sunil: types "any update?" Bot immediately shows his one open case card. | "Sunil types 'any update?' and gets his case. He never typed a case number. That is the whole design in one exchange." |
| 0:15 | Title card. | "Building 'Where is my case?'" |
| 0:20 | Virtual Agent Designer: create topic "Check case status"; properties: description, category, availability for authenticated customer contacts on the customer portal. | "Properties first. Availability is a design decision: this topic reads customer data, so it is only offered to signed-in contacts." |
| 0:50 | Add training phrases: "any update on my case", "case status", "what's happening with my ticket", "has anyone looked at my case", "update please". | "Utterances come from real chats and case short descriptions. Customers say 'any update', not 'I would like to inquire'." |
| 1:15 | Add Script utility node; paste the lesson 7 script with state exclusion `'3,6,7'` and comment "closed, resolved, cancelled: confirm in your choice list". | "Node one is a lookup, before any question. The script limits to five, reads display values, and writes to topic variables: the count and the payload. Check your state values; hard-coded integers are the classic bug." |
| 2:05 | Show the case state choice list on `sn_customerservice_case` with values. | "Here are the values on this instance. Match them before you trust the script." |
| 2:25 | Add Decision node on `case_count`: branches 0, 1, 2+. | "Branch on none, one, or several." |
| 2:45 | Branch 0: Bot response "I don't see any open cases for you." then Boolean "Would you like to open one?" true -> topic block "Create a case". | "Zero cases does not dead-end. It offers the adjacent topic." |
| 3:10 | Branch 1: Card response bound to the single case: number, summary, customer-facing status, last update. | "One case: show it." |
| 3:30 | Branch 2+: Picker over the payload (number + summary), then Card for the chosen case. | "Several: let them pick. Never ask for free text when you can offer a list." |
| 3:55 | Status node: Bot response with customer-facing wording ("Waiting for your reply" instead of "Awaiting Info"), the last customer-visible comment, and the response commitment from the case's SLA. | "The real answer to 'any update?' is the latest customer-visible comment and when we will respond next. Use the same status wording as the portal and quote the SLA so the bot agrees with the contract." |
| 4:35 | Boolean "Does that answer your question?" false -> Decision: agents available? yes -> Live agent transfer with transcript and case sys_id; no -> Bot response with next response time, plus an action that adds a customer-visible comment to the case "Customer requested an update via chat". | "If not, hand off with context. Out of hours, tell them when someone will respond and record on the case that they chased it." |
| 5:30 | Extract the identification steps into a topic block "Identify contact"; call it from this topic. | "Identify-the-customer belongs in a topic block you reuse everywhere." |
| 6:00 | Test in the conversation simulator as four contacts: none, one, six, resolved-not-closed. | "Now test it the way it will be used: no cases, one, six, and one resolved but not closed. Decide whether that last one should appear, and make the script match the decision." |
| 7:00 | Simulate an unentitled or unauthenticated user: topic not offered. | "Then as someone who should not see it. The availability condition must hide it." |
| 7:20 | Type "order status" and "where is my part": confirm they do not route here. | "Finally, collisions. 'Order status' should not land in case status. Fix overlaps before both topics are live." |
| 7:50 | Recap slide. | "Look up before you ask. Branch on count. Speak the customer's language. Quote the SLA. Always leave an exit." |
| 8:30 | End card. | "Lesson 7 practice steps 2 to 4 next." |

## On-screen assets and B-roll

- PDI with four prepared test contacts and cases.
- Designer zoomed to 125 percent; node names visible.

## Accessibility

- Captions and transcript including the full node outline from lesson 7.
- Chat demonstrations narrated message by message.
- Recommend learners check the topic with keyboard-only navigation in the portal chat widget.

## Check for understanding

1. Why does the lookup run before the first question? *Answer: so a customer with one open case is shown it immediately and never types a case number.*
2. Why exclude state values by checking the instance's choice list? *Answer: integer values can differ from assumptions; wrong values make the topic return nothing in production.*
3. What should happen when no agent is available? *Answer: tell the customer the next response time from the SLA, record the chase on the case, and end gracefully.*
