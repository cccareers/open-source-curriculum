---
course_id: dm250
project_id: dm250-x02
title: "Grind Clinic Community Week"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - dm250-04
objectives:
  - Manage a community and monitor brand sentiment
  - Respond to negative feedback without escalating it
competency_ids:
  - D4-S1-C02
---

## Scenario

Wednesday 15 July. Alex ran the first free grind clinic at the Downtown café this morning (lesson 03's calendar). It was busier than planned: 40 people came for 15 places, some waited 25 minutes, and a regular posted about it. Tomás is covering the queue alone this afternoon because June is at a wholesale account. You have the inbound items from 10:00 to 16:00 and a sample of July mentions to code for the monthly sentiment row.

## What you will produce
1. A **triage table** for all 12 inbound items: tree branch (lesson 04), public/private/both/none, owner, response window.
2. **Written replies** for at least six items, signed with a human name, using acknowledge → own → remedy → private where it applies.
3. **Sentiment coding** of the 20 mentions with your rule for each hard case, then a second-coder comparison.
4. A **one-paragraph brief** for Priya on what today means for the clinic's next date.

## Before you start
Use lesson 04's triage tree, escalation matrix, SLA (4 working hours; 1 hour for safety/legal), and coding rules. Do not name or discuss an employee publicly.

**`inbound_jul15.csv`**
```csv
id,time,channel,author,text
1,10:12,IG comment,@marigoldbrews,"Waited 25 min outside and then got told it was full. Not a great look for a 'free clinic'."
2,10:40,IG DM,@jt_pourover,"Is there going to be another one? Couldn't get in."
3,11:05,FB comment,Laura P.,"The guy running it was so patient with my ancient grinder. Coffee is actually good now!!"
4,11:20,Google review,R. Haines,"1 star. Clinic was chaos and the barista with the beard ignored me."
5,11:48,FB comment,Dev S.,"Do you sell the grinder you were using?"
6,12:15,IG comment,@cuppa_karen,"lol 'free' clinic to sell you $19 bags"
7,12:30,FB DM,Asheville Citizen-Times (reporter),"Doing a piece on local coffee shops' community events. Can someone talk to me about the clinic?"
8,13:02,IG comment,@spamcoinz,"🔥🔥 DM us to 10x your followers 🔥🔥"
9,13:40,FB comment,Marta L.,"My son has a nut allergy and I think the pastry sample on the clinic table had almonds. Was that labelled?"
10,14:10,IG story tag,@hikingwithhazel,"[photo of her kitchen grinder] dialed in at Fernwood today!"
11,14:55,LinkedIn comment,Office manager at Blue Ridge Dental,"Could you run one of these for our staff?"
12,15:30,IG comment,@marigoldbrews,"Still no reply? Cool."
```

**`mentions_july_sample.csv`** (code each POSITIVE / NEUTRAL / NEGATIVE / EXCLUDED)
```csv
id,text
m1,"Fernwood's cold brew is the only thing getting me through this heat"
m2,"Anyone know Fernwood's Sunday hours?"
m3,"Third late subscription box in a row. Done."
m4,"Great coffee, terrible wait at Downtown, will be back though"
m5,"Great coffee, terrible wait at Downtown, not worth it anymore"
m6,"Fernwood Elementary bake sale this Saturday!"
m7,"Cool, another week without my order @fernwoodcoffee"
m8,"Tried the Nyeri lot. Pricey but honestly worth it"
m9,"@fernwoodcoffee tagged in a photo, no caption"
m10,"Fernwood vs. the chain place: not even close, Fernwood every time"
m11,"Why is the Nyeri $24 now??"
m12,"The grind clinic was packed, couldn't get in, hope they do another"
m13,"Shoutout to the Fernwood barista who remembered my order"
m14,"Fernwood's new mugs are ugly lol"
m15,"Subscription finally arrived on time, nice"
m16,"Is Fernwood still doing wholesale for offices?"
m17,"Fernwood Drive is closed for repaving"
m18,"Defending Fernwood here, the shipping thing was the carrier and they refunded me fast"
m19,"meh"
m20,"Fernwood clinic was chaos but I learned a ton"
```

## Milestones
1. Triage all 12 items in under 20 minutes using only the tree; note any item where two branches seemed to apply and which you chose.
2. Draft replies; read each aloud; strike any line that names staff, cites policy first, or argues facts.
3. Code the 20 mentions alone, then swap with a classmate (or use the instructor key) and compute your agreement rate.
4. Write the brief.

## Acceptance criteria
- [ ] Item 9 goes down branch 2 (allergen): holding line only, escalated to Priya within 1 hour, no public investigation.
- [ ] Item 7 gets no public reply and is routed to Priya.
- [ ] Item 8 is hidden/reported, not answered; item 6 is not treated as abuse (it contains a grievance) and is answered or reacted to proportionately.
- [ ] Item 4's reply does not mention or defend the employee.
- [ ] Item 12 is recognised as an SLA consequence of item 1 and answered with ownership.
- [ ] Item 11 is routed to June with a public acknowledgement and a named next step.
- [ ] Sentiment codes follow lesson 04's written rules; m6 and m17 are EXCLUDED; m4 and m5 differ.
- [ ] Agreement rate is computed as matches ÷ 20 and compared with the lesson's "more than about a fifth disagree" rule.

## Evidence checklist
Triage table, six or more replies, coded mentions with rules applied, agreement calculation, brief to Priya.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Triage accuracy | Two or more safety/legal items mis-routed | All branch 2 and 6 items correct | Notes the item that is both praise and a complaint (m20/3) and how to log it |
| De-escalation | Defensive or policy-first replies | Acknowledge, own, remedy, private; signed | Closes the loop publicly where it creates proof (item 1/12) |
| Sentiment coding | Inconsistent across similar items | Rules applied consistently; exclusions logged | Proposes a rule tightening for the item pair that caused disagreement |
| Operational insight | Treats each item alone | Links items 1, 2, 12 to a capacity problem | Recommends a sign-up cap and waitlist with a measurable trigger |

## Stretch goals
- Compute an NSS for the 20-mention sample (with n stated) and explain why you would not report it as July's NSS.
- Write the Friday "what are you brewing this weekend" ritual post that turns item 10 into user content, with the permission request.

## Reflection prompts
- Which reply was hardest to write without conceding a fact you have not checked?
- Which coding rule did you disagree with, and what would you change?

## Instructor notes
Suggested sentiment key: POSITIVE m1, m8, m10, m13, m15, m18, m20 (mixed, tilts positive on "learned a ton"); NEUTRAL m2, m4 (mixed, says they will return, so neutral by the lesson rule), m9, m12, m16, m19; NEGATIVE m3, m5, m7, m11, m14; EXCLUDED m6, m17. That gives 7 positive, 6 neutral, 5 negative, 2 excluded (20). m12 is the hardest (complaint-shaped but hopeful); accept NEUTRAL or NEGATIVE if the learner states the rule they used. For pacing, items 1-12 make a good 15-minute timed drill in class; replies can be homework.
