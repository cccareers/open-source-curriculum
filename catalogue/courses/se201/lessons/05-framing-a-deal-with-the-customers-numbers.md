---
lesson_id: se201-05
course_id: se201
pathway: technical-sales-representative
title: Framing a Deal with the Customer's Numbers
order: 5
kind: lesson
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
objectives:
  - Frame a deal using the prospect's own cost and revenue numbers
---

## Turning the lens around

Lessons 2 through 4 taught you to read your own economics. This lesson turns the same discipline on the buyer. The skill is not persuasion; it is arithmetic done in someone else's units, from figures they gave you, in a form their finance function can check.

There is a hard line between two sentences:

> "Our platform reduces invoice processing costs by up to 60%."

> "You told us you run 12,000 invoices a month with six clerks at roughly $58,000 fully loaded, and that 2,400 of them went out late last year at an average $38 penalty. Here is what those two lines look like at the throughput we would commit to."

The first is a claim about your product. It can be disputed, discounted, or ignored. The second is a claim about *their* operation using *their* numbers, and disputing it means disputing themselves. Any buyer who challenges the second sentence has to tell you which of their own figures was wrong — which is a conversation you want, because it makes the model better.

A frame built this way does three jobs at once. It gives your champion something they can forward without editing. It gives the economic buyer a comparison against the other things competing for the same budget. And it gives you a defensible answer to "why now," because a cost that recurs monthly is a cost that grows while the decision is pending.

## The four value levers

Every quantified benefit in a business case reduces to one of four types. Naming them explicitly keeps you from double-counting, which is the fastest way to lose credibility.

**Cost reduction.** A cost that exists today and will be smaller or gone. Real money leaves the building today and stops. This is the strongest lever and the hardest to claim honestly, because it usually implies someone stops doing something — or stops being employed.

**Cost avoidance.** A cost that does not exist yet and now never will: the two clerks they will not need to hire as volume grows, the second data center they will not build. Weaker than reduction in a CFO's eyes, but far more defensible in organizations that will not cut headcount, which is most of them.

**Revenue gain.** More sales, faster sales, higher-value sales. The most exciting lever and the least believable, because it depends on the customer executing well. Always convert revenue gain to **gross profit** before you add it to a total — a dollar of new revenue at 22% margin is 22 cents of value, and claiming the dollar is the single most common way a business case gets thrown out.

**Risk and compliance.** Penalties avoided, audit findings closed, breach exposure reduced. Usually the hardest to quantify and sometimes the only lever that matters — a regulated buyer facing a consent order does not need an ROI model.

A useful discipline: label every line in your model with its lever, and expect the buyer to trust them in exactly that order.

## Discovery questions that produce numbers

Most discovery produces adjectives. "It's slow." "It's a nightmare at month end." "We waste a ton of time." Adjectives cannot be modeled. The move is to convert each adjective into the three quantities that make it a cost:

```text
Annual cost of a problem = volume x frequency x unit cost
```

For each stated pain, you need all three, and you need them *from the customer*:

- **Volume** — how many of the thing per period? "How many invoices a month go through AP?"
- **Frequency or rate** — how often does the bad outcome occur? "What share of them go out past terms?"
- **Unit cost** — what does one occurrence cost? "What is the average late fee you pay?"

Questions that reliably produce numbers:

- "Walk me through what happens from the moment a document arrives to the moment it is paid. How long does each step take?"
- "How many people touch it, and roughly what does a fully loaded person in that role cost you?"
- "How often does it go wrong, and what happens when it does?"
- "What did you spend last year fixing that?"
- "If volume goes up 30% next year, what do you have to add?"
- "Who else in the building already has this number?"

That last one matters more than it looks. The controller has the penalty figure, the AP manager has the touch time, the systems owner has the volume. Numbers you collect from three sources and reconcile are numbers the buyer cannot walk back.

Two rules. **Never supply a number the customer did not give you.** If you have to use an industry benchmark, label it as one, in the model, visibly. And **write down who said it and when** — every line in a defensible model carries its source.

## Mapping a pain to a capability

Quantifying is half of it. The other half — the diagnostic half — is showing that your product actually addresses the *cause*, not the symptom. The chain has four links, and skipping the middle one is what makes a demo feel irrelevant:

```text
stated pain -> root cause -> capability -> measurable effect
```

Run the chain for Meridian Logistics, the freight brokerage from lesson 2.

| Stated pain | Root cause | Capability | Measured by |
| --- | --- | --- | --- |
| "We pay too many invoices late" | Approvals sit in individual inboxes with no visibility or escalation | Rule-based routing with SLA timers and escalation | Share of invoices paid within terms |
| "We miss early-payment discounts" | Average cycle time is 14 days; the discount window is 10 | Straight-through processing for matched invoices | Discount capture rate |
| "We have paid the same invoice twice" | No cross-vendor duplicate check before release | Duplicate detection at ingest against 24 months of history | Dollars of duplicates blocked |
| "Month-end close drags" | No single view of what is outstanding and where | Real-time AP aging view by approver | Days to close |

Three things this table does. It proves you listened, in their words, in column one. It shows you diagnosed rather than pattern-matched, in column two — and the root cause is where a competitor's identical feature list stops being identical. And column four pre-negotiates the success criteria, which is what lesson 6 will build a retention plan around.

Where a stated pain has no honest entry in column three, say so. "We do not solve that; here is what we do solve" buys more credibility than any feature you could stretch to fit.

## Building the baseline

The baseline is the current-state cost, in annual dollars, from the customer's own figures. Meridian's discovery produced these, sourced as noted.

| Line | Figure | Source |
| --- | --- | --- |
| AP clerks | 6 at $58,000 fully loaded = **$348,000** | AP Manager, 14 May |
| Invoice volume | 12,000/month = **144,000/year** | Systems owner, export |
| Average touch time | 4.5 minutes per invoice | AP Manager time study |
| Invoices paid late | 2,400/year at $38 average penalty = **$91,200** | Controller, GL account 6140 |
| Discount-eligible spend | $9,000,000 at 2/10 net 30 = **$180,000 available**; capturing 20% = $36,000, so **$144,000 forgone** | Controller |
| Duplicate payments | **$62,000** recovered by last year's audit | Internal audit summary |

Check the labor line against the volume line before you use it — internal consistency is what a CFO tests first:

```text
144,000 invoices x 4.5 min = 648,000 min = 10,800 hours
10,800 hours / 2,080 hours per FTE = 5.2 FTE of the 6
```

The arithmetic holds: 5.2 of the 6 clerks are consumed by invoice touches, and the remainder is exception handling and vendor calls. If it had *not* held — if the numbers implied nine clerks' worth of work from six people — you go back and ask, rather than publishing a model the buyer can dismantle in one meeting.

## Modeling the future state, conservatively

The future state is where business cases are won or discarded. The instinct is to claim the maximum. The discipline is to claim clearly less than you believe, and say so out loud.

Meridian's model, with every reduction stated:

**Labor — cost avoidance, not reduction.** The system straight-through-processes 78% of invoices, which would free about 8,400 hours, or 4 FTE. But Meridian's CFO has already said she will not cut AP headcount, and volume is growing about 20% a year. So the model claims **avoided hiring of 2.5 clerks over the next 24 months**, not eliminated ones:

```text
2.5 x $58,000 = $145,000
```

**Late-payment penalties — cost reduction.** Routing with escalation should nearly eliminate these. The model claims **70%**, not 100%:

```text
0.70 x $91,200 = $63,840
```

**Discount capture — revenue-side gain, already net.** Cycle time drops below the ten-day window for straight-through invoices. Capture goes from 20% to a claimed **65%**, not the 78% that straight-through processing would technically allow:

```text
(0.65 - 0.20) x $180,000 = $81,000
```

**Duplicate prevention — cost reduction, low confidence.** Detection should block roughly 80% of the $62,000, but last year's figure is a single audit sample, so the model halves it again:

```text
0.80 x $62,000 = $49,600, counted at 50% = $24,800
```

```text
Total conservative annual benefit = 145,000 + 63,840 + 81,000 + 24,800 = $314,640
```

Note what is *not* in the model: the faster month-end close. It is real, the buyer cares about it, and nobody produced a defensible dollar figure for it. Leave it in the narrative as an unquantified benefit and out of the total. A model with one obviously padded line contaminates every honest line next to it.

## Net benefit, ROI, and the buyer's payback

Meridian's proposed contract is the hybrid from lesson 2 — $5,450 per month at their average volume, $65,400 a year — plus a one-time **$28,000** implementation.

```text
Year 1 investment = 65,400 + 28,000 = $93,400
Year 1 net benefit = 314,640 - 93,400 = $221,240
Year 1 ROI = 221,240 / 93,400 = 237%
Monthly gross benefit = 314,640 / 12 = $26,220
Buyer payback = 93,400 / 26,220 = 3.6 months
```

Three years, assuming flat benefits and no price uplift:

```text
3-year benefit    = 3 x 314,640 = $943,920
3-year investment = 3 x 65,400 + 28,000 = $224,200
3-year net        = $719,720
```

And then the number that closes the argument — the downside case. Assume **every single benefit line lands at half** what the model claims:

```text
Halved annual benefit = $157,320
Year 1 net = 157,320 - 93,400 = $63,920
Year 1 ROI = 68%
Buyer payback = 93,400 / 13,110 = 7.1 months
```

Still positive, still under eight months. That sentence — "even if we are wrong by half, you are ahead inside eight months" — does more work than any of the optimistic figures above it, because it is the objection the CFO was already forming.

Build the sensitivity case *before* the meeting, always. A model with only one scenario reads as advocacy; a model with a downside case reads as analysis.

## Framing it for the person in front of you

The same model, three audiences, three first sentences.

**The economic buyer (CFO, VP Finance).** Lead with net and payback, not features. "Year one net of $221,240 against a $93,400 investment, payback in 3.6 months, and it stays positive at half the projected benefit." They will go straight to the assumptions; have the source column ready.

**The operational owner (AP Manager, Controller).** Lead with the workday. "Your team stops touching 78% of invoices, so the 5.2 FTE currently consumed by invoice handling drops to about 1.2, and month-end stops depending on who is in the office." Money is the consequence, not the headline.

**The technical evaluator (IT, security, systems owner).** Lead with fit and effort. Integration surface, data handling, what the implementation actually asks of their team over the $28,000 and the eight weeks. Their veto is real and it is rarely about value.

Two habits that raise the hit rate sharply. **Co-build the model with the champion** rather than presenting it finished — a champion who supplied the numbers will defend them in a room you are not in. And **send the assumptions page, not just the total**; a total with no visible arithmetic is a number the buyer's finance team will simply replace with their own.

## Closing the loop back to your economics

The buyer's case and yours are the same deal seen from two sides, and you should know both before you walk in. At the proposed hybrid price of $65,400 ARR, with the 78% gross margin and roughly $25,000 fully loaded CAC from lesson 3:

```text
Monthly gross profit = $5,450 x 0.78 = $4,251
Your CAC payback = 25,000 / 4,251 = 5.9 months
```

Now suppose the deal drags and a 25% price concession is proposed:

```text
Discounted ACV = $49,050 -> $4,088/month -> gross profit $3,188
Your CAC payback = 25,000 / 3,188 = 7.8 months
```

The concession moves your payback out by nearly two months — while the buyer's own model still shows a 237% first-year return at full price. That is worth knowing before you offer it, because the gap between those two facts is the strongest argument you have for holding price: the price is not what is standing between them and the value, and you can show it. How to trade that concession, and for what, is negotiation craft and belongs to se203.

## Practice

You have completed two discovery calls with **Alder Creek Supply**, an industrial distributor. Here are the figures, attributed as you captured them.

**From the VP of Inside Sales:**

- 22 inside sales reps, fully loaded cost $71,000 each
- Roughly 3,100 quote requests per month, "call it 37,200 a year"
- "It takes a rep about 26 minutes to build a quote by hand"
- Average quote value $4,850; overall win rate 31%
- "About 18% of quotes go out more than 48 hours after the request comes in"

**From the Sales Operations Analyst:**

- Quotes sent after 48 hours win at 12%, versus 31% for quotes sent inside 48 hours
- "We are not adding headcount this year, but volume is up 15% and the team is drowning"

**From the Controller:**

- Product gross margin is 22%
- "We credited back $214,000 last year on orders that were mispriced"

**Your proposal:** hybrid pricing at $4,200 per month including 2,000 quotes, then $0.90 per quote above that, plus a one-time $35,000 implementation. Assume the quoting engine takes average build time from 26 minutes to 7, brings the share of quotes sent past 48 hours from 18% to 4%, and prevents 75% of pricing errors.

**Exercise 1 — price the contract.** Compute Alder Creek's monthly and annual subscription cost at 3,100 quotes per month, and their total year-one investment including implementation.

**Exercise 2 — build the baseline.** Produce a current-state table with a line, a figure, and a source for each of: annual quote-building labor hours and their FTE equivalent; the annual cost of late quotes expressed in lost gross profit; and the annual cost of pricing errors. Show the arithmetic for each. State explicitly any place where two of their figures need reconciling.

**Exercise 3 — model the future state conservatively.** For each benefit line, state the lever (cost reduction, cost avoidance, revenue gain, or risk), the raw calculated benefit, the haircut you are applying, and the claimed figure. One of these lines is far larger than the others; explain in two sentences why it is the least defensible line in the model and what you would do with it. Remember to convert any revenue benefit to gross profit.

**Exercise 4 — the numbers that close it.** Compute year-one net benefit, year-one ROI, and the buyer's payback in months. Then compute the same three under a downside case where every benefit lands at half your claimed figure.

**Exercise 5 — diagnose and map.** Build the four-column pain-to-capability table for Alder Creek: stated pain in their words, root cause, capability, and the measure that would prove it worked. Include at least three rows, and include one row where the honest entry in the capability column is "we do not address this."

**Exercise 6 — the one-slide frame.** Write the frame you would put in front of the Controller: no more than six lines, every number traceable to the discovery notes above, ending with the downside case.
