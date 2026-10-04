---
lesson_id: se310-02
course_id: se310
pathway: technical-sales-representative
title: Onboarding and the First 90 Days
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Plan an account's first 90 days so the customer reaches value before the first renewal conversation
---

## The window you actually get

A customer signs because they believed something would be different. They will decide whether it is different long before anyone asks them to renew — usually within the first three months, and often within the first three weeks, while the decision to buy is still fresh enough to be second-guessed.

That is the whole reason this lesson exists. A renewal conversation eleven months from now is not won by arguing well in month eleven. It is won or lost by whether the customer got something real out of your product early, whether the people who have to use it every day were carried across the gap between "we bought it" and "we use it," and whether you were visibly present while that happened. Everything after this lesson — reviews, risk detection, expansion — assumes the account made it through this window in one piece.

Two boundaries before we start. This is not implementation work. You are not configuring anything, writing integrations, or running training sessions; specialists do that, and doing their job badly is worse than not doing it. And this is not the twelve-month account plan from se201, which allocates a year of attention across a whole book. This is the first ninety days of one account, at the level of who is in which meeting and what has to be true when it ends. Your job in this window is narrow and non-negotiable: preserve everything the customer told you during the sale, make sure the first measurable win happens on a date, and stay the face the customer recognizes.

## The handoff is where accounts get dropped

The most common failure in the first thirty days is not a technical one. It is that the person implementing the account knows less about the customer than the customer assumes they do. The customer explains their situation for the third time to a new face, notices that nobody wrote anything down, and quietly downgrades their expectations. You will never hear about it. You will see it eight months later as an unreturned call.

Preventing that costs about forty-five minutes and one document. The handoff record is a short written summary that travels from you to the delivery team before the first customer-facing meeting, and it contains the things only you know:

- **Why they bought.** The business problem in the customer's own words, not the product category. "Dispatchers are retyping every emergency call-out into two systems and the second one is always wrong" — not "workflow inefficiency."
- **What we promised.** Every commitment made during the sale, including the ones made verbally on a call. If a sales engineer said the mobile app works offline, that is now a promise the implementation has to keep.
- **What success was defined as.** The measures the customer said would prove it worked, with whatever baseline numbers you gathered. se201 calls this the value contract; here it is the input to a meeting, and if it does not exist yet, the kickoff is where you create it.
- **Who is who.** The champion, the person who signs, the people who have to use it daily, and anyone who argued against the purchase. Say plainly who is fragile — a champion three weeks into a new job is a different risk from one who has been there nine years.
- **What we already know is hard.** The integration they mentioned in passing, the team in the second region that has not been told yet, the compliance review that is not scheduled. Sales optimism is a normal human reflex. Writing the hard parts down is how you stop it costing you the account.
- **What was deliberately not sold.** The module they asked about and you steered away from, and why. Otherwise someone promises it in week two.

The delivery team reads this before the kickoff. You confirm they have read it. That is the entire ritual, and it prevents more churn than any dashboard.

## The kickoff meeting is a working session, not a welcome

Kickoff meetings go wrong in a predictable way: the vendor presents slides about itself, everyone agrees the project is exciting, no dates are set, and the meeting produces nothing. A kickoff should produce four written artifacts and should feel slightly uncomfortable, because agreeing on dates in front of your own colleagues is uncomfortable.

Run it in this order.

1. **Replay the why.** You, not the implementation lead, restate the business problem in the customer's language and ask them to correct you. Two minutes. It tells everyone in the room, on both sides, what this project is for.
2. **Agree the success measures.** Two to four of them, each with a baseline, a target, and a named person who will supply the actual number later. If a baseline is not known today, assign someone to produce it within two weeks — after go-live, the "before" figure becomes an argument instead of a fact.
3. **Agree the first value milestone.** One specific, visible thing that will be true within thirty days. Not "phase one complete." Something a user would notice: emergency call-outs are dispatched from one system instead of two.
4. **Name the roles and the meeting rhythm.** Who owns the project on their side, who owns it on yours, when the standing checkpoint is, and how something gets escalated. Put the day-30, day-60, and day-90 reviews in calendars during the meeting, not afterwards.

Then send a written recap the same day. The recap is the artifact; the meeting was just how you made it.

## The first value milestone, and why it must be small

New sellers pick a milestone that is too big because it is more impressive. "Full rollout across all four regions by day 30" is impressive and will be missed, and a missed first milestone teaches the customer that your dates are decorative.

A good first milestone has four properties. One team can achieve it without waiting on anybody else. A person outside the project can see the difference. It is measurable with a number the customer already has. And it is genuinely useful on its own, so that if the rest of the project slowed down tomorrow, the customer would still be better off than before they bought.

Sequence the hard dependency work behind it, not in front of it. If the finance integration needs six weeks of their IT team's attention, the first milestone should not depend on the finance integration.

## A worked 90-day plan

**Tallgrass Facilities Group** is a commercial facilities-maintenance company with 380 field technicians across three regions. They bought your work-order and scheduling platform on a twelve-month term, 400 seats, starting 6 January. They bought it because emergency call-outs arrive by phone into a regional office, get written on a whiteboard, and are then retyped into their billing system — roughly 40 a day, and about one in eight is billed late or not at all. Their champion is Dana Whitfield, Director of Field Operations. The contract was signed by the CFO, Marcus Bell, whom you have met once. The IT Manager, Simon Achterberg, preferred to extend their existing system and said so in the evaluation.

The first value milestone: **the East region dispatches emergency call-outs from the platform only, with no whiteboard, by day 28** — because East is one region, needs no billing integration to start, and Dana already tracks late-billed call-outs weekly.

| Days | Who is in it | Purpose | Artifact | Exit criteria |
| --- | --- | --- | --- | --- |
| 0–3 | You and the delivery lead | Handoff: transfer the why, the promises, the baselines, the risks | Handoff record | Delivery lead confirms in writing they have read it |
| 4 | Dana, Simon, East dispatch lead, delivery lead, you | Kickoff working session | Recap with measures, baselines, milestone, dates | All three review dates in calendars |
| 5–10 | Dana, East dispatch lead | Capture baselines from their systems before go-live | Baseline record: 41 call-outs/day, 12.4% billed late, 6.5 hours/week retyping | Dana signs off on the numbers as fair |
| 5–14 | Delivery team, Simon | Configure East region; agree the data feed Simon has to provide | Configuration sign-off | Simon has a written list of exactly what he owes and by when |
| 15–18 | East dispatchers (6 people) | Training delivered by the specialist; you attend the first session | Attendance and competency check | All six dispatchers have logged in and created a live call-out |
| 19–28 | East dispatch, delivery lead | Parallel running, then whiteboard retired | Go-live note | 5 consecutive working days with zero whiteboard use |
| 30 | Dana, East dispatch lead, delivery lead, you | Day-30 review: did the milestone land, what broke, what is next | One-page milestone scorecard | Written yes or no on the milestone, and a dated fix for each miss |
| 31–50 | Delivery team, Simon | Billing feed for East; Central region configuration | Integration test result | East call-outs reach billing without retyping |
| 45 | Dana, Marcus Bell, you | Executive result review: 20 minutes, East results only, no ask | Two-page result summary | Marcus has seen a number that came from his own finance system |
| 51–60 | Central dispatch (11 people) | Central training and go-live | Go-live note | Central running on platform only |
| 60 | Dana, both dispatch leads, delivery lead, you | Day-60 review: adoption by region, first actuals against measures | Adoption summary: logins, call-outs created, late-billing rate | Every region below 80% adoption has a named owner and a date |
| 61–85 | West dispatch (9 people), Simon | West rollout; close out Simon's open items | Go-live note | West running; Simon's list empty |
| 90 | Dana, Marcus, Simon, delivery lead, you | Day-90 review: full actuals against the value contract; hand the rhythm to quarterly reviews | Value scorecard, next-quarter plan | Signed-off scorecard; the quarterly review date is booked |

This is the intended onboarding plan, not proof that each meeting happened. In the August account review in lessons 3 and 4, the day-45 executive touchpoint has not happened: Marcus joined an initial progress call on 12 January, then heard nothing further from you. That missed milestone is a risk to recover, not a completed activity to quote. Technician training is delivered by the specialist team in each region alongside the dispatcher rollout; the rep tracks completion rather than delivering it.

Read the shape of that plan rather than the specifics. The heavy contact is early. The executive touchpoint at day 45 exists to build the early executive contact into a relationship while there is good news to carry, not to sell anything — asking Marcus for money at day 45 would waste the only easy meeting you will ever get with him. The person who argued against the purchase, Simon, is given defined, visible obligations rather than being avoided, because a blocker with a task list is easier to manage than a blocker with an opinion. And the last row hands the account off to a repeating rhythm, which is what makes the next lesson possible.

## The three checkpoint reviews

Each of the day-30, day-60, and day-90 reviews answers one question. Keeping them distinct stops all three from becoming the same status meeting.

**Day 30 — did the first milestone land?** A yes or a no, not a percentage. If no, the only useful content of the meeting is why, and what date it lands instead. Do not fill the time with roadmap.

**Day 60 — is it being used, and by whom?** Adoption is where retention is actually decided, and it is uneven in a way that averages hide. An account at 74% adoption is usually not 74% everywhere; it is three regions at 95% and one at zero. Ask for the breakdown, find the team that has not started, and go and find out why in person. That team is the seat count you lose at renewal.

**Day 90 — is the promise being kept?** Now you compare the measures to their baselines with real numbers from the customer's systems. Some will be behind. Say so plainly and give the reason, because a scorecard that concedes a miss is believed and one that reports all green is not.

## When the plan slips

It will. What matters is which kind of slip it is, because the responses are different.

- **A date slips on your side.** Tell the customer before they notice, with a new date and the reason. Reps who go quiet during a delay do more damage than the delay does.
- **A date slips on their side.** Extremely common — their IT team is busy, their compliance review took four weeks. Do not let it pass silently; a slipped customer dependency is the earliest and cleanest churn signal you will ever get, and it needs a named owner and a new date in writing.
- **Adoption stalls in one team.** Go there. Not an email to the champion asking them to chase it — a conversation with that team's manager about what is actually in the way. It is usually a workflow the configuration did not account for, and it is usually fixable in a week.
- **The champion goes quiet during onboarding.** Treat this as urgent, not as them being busy. A champion who stops answering in the first ninety days has either been reassigned or has lost confidence, and both need a second relationship in the account immediately.
- **The measures turn out to be unmeasurable.** Sometimes the number you agreed at kickoff cannot actually be produced from their systems. Replace it at the day-30 review with one that can be, and record that you changed it. Two clean measures beat four aspirational ones.

Whatever happens, the record of it belongs somewhere durable — the account record, with a date. You will not remember in month ten that the West region went live thirty-two days late because their regional manager was on leave. The renewal conversation in lesson 4 is built entirely out of things like that.

## Practice

Work on **Bayfront Marine Services**, a boat-maintenance and dock-services company you have just closed.

**Account facts:** 12-month term starting 1 March, 140 seats, ARR $118,000. Champion: Priya Raman, Operations Manager, who has been in the role for seven weeks. Signed by the Managing Director, Tom Okafor, whom you met twice during the sale. They bought because work orders are handwritten on carbon-copy pads at four marinas, and roughly 15% are never invoiced at all; nobody knows the real figure. The Yard Supervisor at the largest marina, Elena Brandt, told you during the sale that "the last system they tried lasted a month." Their finance system is a 14-year-old package with no supported integration; your delivery team says a file-based export is possible but needs someone from their finance team for about two days. Priya mentioned, once, that a fifth-marina acquisition is being considered, with timing unconfirmed.

1. **Write the handoff record.** One page, covering all six elements from this lesson. Be specific about what was promised and what you know is going to be hard. Mark the two riskiest facts in the account and say why they are risky.
2. **Choose the first value milestone.** State it in one sentence, with a date relative to day 0, and defend it against all four properties from this lesson. Then write down the milestone you rejected and the reason — there should be an obvious tempting one you did not pick.
3. **Build the 90-day plan** as a table with the five columns used above: days, who is in it, purpose, artifact, exit criteria. It must include the handoff, a kickoff, a baseline capture that happens before go-live, an executive touchpoint with Tom that carries no ask, an explicit plan for Elena, the finance-team dependency with an owner and a date, and all three checkpoint reviews.
4. **Handle the baseline problem.** Nobody knows the real un-invoiced rate. Write exactly how you would establish a defensible "before" figure at Bayfront in under two weeks, naming the source of the number and stating in one sentence why the customer would accept it as fair.
5. **Run a slip.** At day 22, Priya tells you the finance person is unavailable until day 60 and Elena's marina has not started training. Write the two actions you take this week — one for each problem — with who you contact, what you ask for, and what you record on the account. Then say which of the two you would do first, and why.

## Check your understanding

1. Name four of the six items in a handoff record. *(Any four: why they bought; what we promised; what success was defined as; who is who; what we already know is hard; what was deliberately not sold.)*
2. Why was "East region dispatches from the platform only by day 28" a better first milestone than "full rollout across all three regions by day 30"? *(Answer: one team can achieve it without waiting on others, outsiders can see the difference, it is measured with a number Dana already tracks, and it is useful on its own — the full rollout would likely be missed and teach the customer your dates are decorative.)*
3. Why does the day-45 executive touchpoint carry no ask? *(Answer: its job is to build the early executive contact into a relationship while there is good news to carry; asking for money wastes the only easy meeting you will get.)*
