---
course_id: sn360
media_id: sn360-a01
type: animation-storyboard
title: "First Matching Queue Wins: Routing Northwind's Cases"
target_runtime: "85 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn360-08
objectives:
  - Automate case routing and assignment using matching rules, queues, and agent capacity
competency_ids:
  - D3-S1-C04
---

## Concept and misconception it fixes

Advanced Work Assignment evaluates queues in order and the first matching queue takes the item; eligibility (skills, groups) and capacity then decide who is offered it. Misconceptions fixed: "the most specific queue wins automatically", "an item always finds the right agent", and "a catch-all means routing is fine".

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Work items as cards with badges: "Premium" (star icon), "Controller" (gear icon), "German" (text "DE"), "Chat" (speech bubble).
- Five queues as horizontal lanes stacked top to bottom, numbered 1 to 5 with names from the lesson 8 table.
- Agents as circles with skill tags and a capacity meter (filled segments with a number "2/8").
- Offer as a dashed arrow from queue to agent; accept as solid; timeout as an hourglass icon with the word "Timed out".
- Okabe-Ito palette: lanes alternate light grey/white; badges use icons and text so color is supplementary.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Five queue lanes appear top to bottom: 1 Live chat, 2 Premium controller, 3 German, 4 All controller, 5 Catch-all. | Lanes slide in. | "Queues are checked top to bottom. The first match takes the item." |
| 2 | 10 s | Card "Premium + Controller" drops from the top, tests lane 1 (no match, small cross), lane 2 (match, check), settles in lane 2. | Card bounces through lanes. | "A Premium controller case skips chat and lands in Premium controller." |
| 3 | 10 s | Lane 2 offers to an eligible agent with "Model 4400" skill and capacity 3/8; agent accepts; meter becomes 4/8. | Dashed then solid arrow; meter fills. | "Eligible agents with capacity get the offer. Accepting consumes capacity." |
| 4 | 14 s | Card "Premium + Controller + DE" drops: matches lane 2 first, never reaches lane 3. Offered to an agent without "DE" tag; a speech bubble shows "?" Caption highlights the conflict. | Card stops at lane 2; agent puzzled icon. | "A German Premium controller case also matches lane 2 first, and may reach an agent who does not read German." |
| 5 | 10 s | Split screen: Option A adds "DE" skill requirement to lane 2; Option B swaps lanes 2 and 3 (German above Premium). Labels: "A: Premium speed + language", "B: language first, slower Premium". | Lanes reorder in B. | "There is no configuration that avoids the choice. Surface it; let the customer decide." |
| 6 | 10 s | Card "Controller" arrives at 2 a.m.: lane 4 matches; all eligible agents show "Away". Hourglass, then "Overflow: notify duty supervisor". | Card waits; hourglass; supervisor bell. | "Nobody eligible? Overflow must be configured, or the item waits invisibly." |
| 7 | 10 s | A new badly-written queue inserted at position 4 with an impossible condition; cards fall through to lane 5 Catch-all; a counter on lane 5 climbs 3, 7, 15 with label "weekly catch-all volume". | Cards stream to bottom. | "A catch-all means nothing fails to route. It also hides broken queues. Watch its volume." |
| 8 | 8 s | Summary card. | Text builds. | "Order is policy. Eligibility and capacity decide who. Configure overflow. Watch the catch-all." |

## Interaction variant (optional)

Drag-to-reorder lanes and toggle skill requirements, then drop sample cards and see which lane and agent they reach. Include a challenge: route all five sample cards correctly with no German case reaching a non-German agent.

## Production notes

- Queue names, capacities (case 8, chat 3), and the 30-second chat timeout match the lesson 8 worked example.
- Exact AWA terminology for offers, presence states, and overflow behavior should be checked against the target release before final narration (see review.md).
- Provide a reduced-motion version with step-by-step cuts.
