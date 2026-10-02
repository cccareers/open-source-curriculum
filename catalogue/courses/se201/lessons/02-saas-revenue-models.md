---
lesson_id: se201-02
course_id: se201
pathway: technical-sales-representative
title: SaaS Revenue Models
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Explain how subscription, usage-based, and hybrid revenue models change what
    a SaaS deal is worth
---

## Why the revenue model decides what a deal is worth

Two reps close deals on the same day. Both write "$72,000" on the whiteboard. One of them has locked in $6,000 a month for three years with a contractual floor. The other has sold a meter that will read whatever the customer's business happens to do next quarter — it could be $4,000 a month in a slow season and $9,000 in a peak. The headline number is identical. The value of the two deals to your company is not, and neither is the conversation you should be having with the buyer.

A revenue model is the rule that converts customer behavior into your revenue. It determines three things a technical sales representative has to be able to speak to: how predictable the revenue is, how the account grows without you doing anything, and what the buyer is actually agreeing to risk. Everything later in this course — acquisition cost, payback, retention — sits on top of the model, because you cannot compute the payback on a number you cannot forecast.

Before the models themselves, get the vocabulary exact. Sellers use these words loosely and it costs them credibility in front of a finance buyer.

**MRR** — monthly recurring revenue. The normalized monthly value of contracted, recurring revenue as of right now. One-time fees are not in it.

**ARR** — annual recurring revenue. MRR times twelve, or the annualized value of the recurring contract. ARR is a *snapshot* of a run rate, not a sum of what was collected over the past year. This distinction matters enormously and lesson 4 returns to it.

**ACV** — annual contract value. The recurring value of one contract for one year. If a three-year contract totals $216,000 in recurring fees, its ACV is $72,000.

**TCV** — total contract value. Everything the customer is committed to over the whole term, including one-time implementation and services fees. The same contract with a $28,000 implementation fee has a TCV of $244,000 and an ACV of $72,000.

**Bookings vs. revenue.** A booking is a signed commitment. Revenue is recognized as the service is delivered — typically ratably, month by month. A twelve-month contract signed in December books $72,000 this year and recognizes about $6,000 of it. Sales is usually measured on bookings; the company is valued on recurring revenue. When a buyer's controller asks "what does this hit our P&L this year," they are asking a recognition question, not a bookings question.

## Subscription pricing

The customer pays a fixed recurring fee for access, most often per seat, sometimes as a flat platform fee per entity, site, or tier.

Its defining property is **predictability**. Both sides know the number twelve months out. Your company can forecast it, your finance team can recognize it evenly, and the buyer can put it in a budget line without a variance conversation. That predictability is worth real money — subscription revenue is typically valued higher per dollar than volatile revenue, which is why a lot of companies keep a subscription floor even when they price on usage.

Its weakness is that it is **decoupled from value delivered**. A customer who bought 150 seats and uses 40 of them is paying for 110 seats of nothing. That customer is not going to expand; they are going to arrive at renewal with a spreadsheet showing 27% utilization and ask for a 70% reduction. Shelfware is the number one source of contraction in seat-based businesses, and it is visible to you months in advance if you look.

Growth in a subscription model requires an *event*: the customer hires, opens a location, adds a department, or buys a module. Nothing grows on its own.

**Qualifying implication.** With seat pricing you must qualify the *deployed user population*, not the licensable one. "How many people could use this?" is the wrong question. "How many people will have this open on a Tuesday morning in March?" is the right one.

## Usage-based pricing

The customer pays per unit of consumption — per document processed, per API call, per gigabyte stored, per transaction, per message sent.

Its defining property is **alignment**. The customer pays in proportion to the value they take, so the first purchase is small and low-risk, and the account grows automatically as the customer's own business grows. A usage account that never gets a sales touch can still expand 30% in a year because the customer opened two new warehouses.

Its weakness is **volatility in both directions**. Your revenue inherits the customer's seasonality, their cost-cutting cycles, and their engineering team's decision to add a caching layer. A single efficiency change on their side can cut your ARR overnight without anyone churning. Forecasting is genuinely harder, and finance will discount an unbounded meter when they value the book.

Buyers have a matching anxiety: an uncapped meter is a budget risk. Procurement will ask for a cap, a not-to-exceed, or an alert threshold. Being ready with that answer removes the most common late-stage objection in usage deals.

**Qualifying implication.** You have to qualify the *driver*, and you have to qualify its trend and its variance. Not "how many documents do you process," but "what did the last twelve months look like month by month, and what is the plan for next year?" A flat driver means a flat account.

## Hybrid pricing

A committed platform fee plus a metered component above an included allowance. This is where most of the market has landed, because it takes the best property of each model.

The platform fee gives you a **floor** — a contractual minimum that survives a bad quarter at the customer, and that finance can treat as recurring. The meter gives you **upside** that tracks the customer's growth. For the buyer, the included allowance converts an open-ended meter into a budgetable base with a known marginal rate.

Hybrids introduce their own vocabulary. A **commit** is a spend the customer promises over the term (often in exchange for a lower unit rate); overage above the commit bills at list or a stepped rate. A **ramp** raises the committed amount in year two and year three, matching a rollout schedule. **Rollover** or **burn-down** terms decide whether unused commit expires — a detail buyers care about more than sellers expect.

**Qualifying implication.** You are qualifying two things at once: the size of the base the buyer will commit to, and the shape of the meter above it. Sizing the commit too high is the fastest way to a hostile renewal; sizing it too low leaves the floor worthless.

## Worked example: one customer, three models

Meridian Logistics processes documents for a freight brokerage. Their volume averages **12,000 documents per month**, with a slow month around 8,300 and a December peak of 17,600. Last year's actual total was **149,000 documents**. They would deploy roughly 150 users.

**Model A — subscription, 150 seats at $40/seat/month.**

```text
150 seats x $40           =  $6,000 / month
MRR                       =  $6,000
ARR                       =  $6,000 x 12 = $72,000
3-year TCV (flat)         =  $216,000
```

With a 5% annual uplift written into the contract:

```text
Year 1 = $72,000
Year 2 = $72,000 x 1.05 = $75,600
Year 3 = $75,600 x 1.05 = $79,380
TCV                      = $226,980
```

The floor is the whole contract: $72,000 arrives whether they process 8,000 documents or 18,000. It also does not move if volume doubles.

**Model B — usage, $0.50 per document.**

```text
Average month: 12,000 x $0.50 = $6,000
Slow month:     8,300 x $0.50 = $4,150
Peak month:    17,600 x $0.50 = $8,800
Actual last year: 149,000 x $0.50 = $74,500
```

Same average, and slightly more revenue than Model A on last year's real volume — but the monthly range is $4,150 to $8,800, a swing of better than 2:1. Annualizing any single month gives an answer between $49,800 and $105,600. If you quote the peak month as ARR, you will miss your number in February.

**Model C — hybrid, $3,000/month platform fee including 5,000 documents, then $0.35 per document.**

```text
Average month: $3,000 + (12,000 - 5,000) x $0.35 = $3,000 + $2,450 = $5,450
Slow month:    $3,000 + ( 8,300 - 5,000) x $0.35 = $3,000 + $1,155 = $4,155
Peak month:    $3,000 + (17,600 - 5,000) x $0.35 = $3,000 + $4,410 = $7,410
Annualized at average volume = $5,450 x 12 = $65,400
Contractual floor            = $3,000 x 12 = $36,000
```

Model C produces the lowest expected revenue of the three — $65,400 against $72,000 and $74,500 — and it is very often the best deal to sell. It has a guaranteed $36,000 floor, it captures the December peak, and if Meridian wins a large shipper next year and doubles to 24,000 documents a month, the account goes to $3,000 + 19,000 × $0.35 = $9,650/month, or **$115,800 ARR**, without a renegotiation. Model A stays at $72,000 in that same scenario until someone opens a seat conversation.

That is the whole point of the comparison. "What is this deal worth?" has no answer until you say *under which model, at what volume, with what floor*.

## The same choice, seen from the buyer's side

You are not the only one for whom the model changes the value of the deal. The buyer is evaluating three things you should be able to name before they do.

**Budget predictability.** Some organizations genuinely cannot approve a variable line. Public sector, regulated entities, and anyone operating on a fixed appropriation will take a worse average price for a fixed number. Others — particularly finance teams under a cost-control mandate — actively prefer spend that falls when their own volume falls. Ask which one you are dealing with; the answer often decides the model on its own.

**Approval threshold.** Almost every buyer has a dollar line above which a purchase changes category: another signature, a procurement process, a board item. A $72,000 annual subscription may sit above the line while a $36,000 committed floor with metered usage sits below it. The model can change who has to say yes, and therefore how long the deal takes.

**Risk of being wrong.** A buyer who is uncertain whether the product will work wants the smallest possible first commitment, which favors usage. A buyer who is certain and wants the best rate will trade commitment for price, which favors a subscription or a large hybrid commit. Uncertainty is a signal about the model, not just about the deal's odds.

There is a fourth consideration that catches sellers out: **capitalization**. Some buyers can capitalize a multi-year prepaid license and expense a monthly subscription, or vice versa, and the accounting treatment can matter more to a controller than the total. You do not need to advise on it. You need to ask whether it matters and get the right person into the room if it does.

## Where model choice goes wrong

Five failures account for most of the damage, and all five are visible before signature.

**Sizing a commit at the customer's peak.** Meridian's December is 17,600 documents. A commit built on December means eleven months a year of paying for capacity they do not use, and a renewal conversation that starts with a demand for a 40% reduction. Size the commit near the *trough*, and let the meter capture the peaks.

**Selling seats to a buyer who cannot deploy them.** A 150-seat contract with no onboarding plan is a 40-seat renewal. If nobody on the customer's side owns adoption, the seat count is aspirational.

**Choosing usage for a flat driver.** Usage pricing only outperforms when the driver grows. If the customer's volume has been flat for three years, you have taken all the volatility risk and none of the upside.

**Confusing a booking with revenue in your own forecast.** A three-year TCV of $226,980 is not $226,980 of ARR. Reps who report TCV as ARR are the reason finance distrusts sales numbers.

**Ignoring the overage conversation until the first overage invoice.** In hybrid and usage deals, the first surprise bill is the most common cause of an early, hostile renegotiation. Set the alert threshold, the cap, and the escalation path in the contract, and tell the buyer's finance contact they exist.

## Turning the model into qualifying questions

The model tells you what to go find out. Take these into discovery.

| If you are selling | Qualify | Red flag |
| --- | --- | --- |
| Seats | Deployed users, not licensed users; onboarding plan; who owns adoption | Buyer wants to license "everyone" on day one |
| Usage | 12 months of driver history; next year's plan; variance; who owns the budget for a variable line | Driver is flat or declining; no one will name a volume |
| Hybrid | Realistic commit level; what the meter measures; overage rate and cap; ramp schedule | Buyer wants a commit set at their peak month |

Two more habits worth building now. First, always ask which model the buyer's *own* finance team prefers — some organizations cannot approve a variable line at all, and some strongly prefer opex that scales down. Second, know the difference between what a model does for your ARR and what it does for your commission plan; they are not always aligned, and the deal that is right for the company is the one to sell.

A quick note on scope: this lesson is about how the *structure* of revenue changes a deal's worth. Discount authority, concession trading, and negotiation tactics belong to Advanced Negotiation (se203), and how these numbers show up on a pipeline dashboard belongs to se305.

## Practice

**Exercise 1 — price the same account three ways.**

Northgate Interiors is a 400-person design firm. They estimate 90 people would use your product daily. Their driver — rendered project files — ran 6,400 last year, month by month: 380, 410, 470, 520, 610, 660, 700, 640, 590, 540, 470, 410.

Your three published models are:

- Subscription: $55 per seat per month
- Usage: $1.10 per rendered file
- Hybrid: $2,200 per month including 300 files, then $0.85 per file

Compute, showing the arithmetic:

1. Year-one ARR under each model at last year's actual volume.
2. The best month and worst month under the usage model, annualized. State the range.
3. The contractual floor under the hybrid model.
4. What each model produces if Northgate grows its file volume 40% next year.

**Exercise 2 — recommend and defend.**

In no more than 200 words, recommend one model to Northgate and justify it in two directions: what it does for your company's revenue predictability, and what it does for their budget risk. Name one term you would add to protect the weaker side of the model you chose.

**Exercise 3 — vocabulary under pressure.**

Northgate signs a three-year hybrid contract with a 4% annual uplift on the platform fee and a one-time $14,000 implementation fee. Assume last year's volume repeats each year. State the ACV, the TCV, and the ARR you would report on the day of signature — and explain in one sentence why the implementation fee is in one of those numbers and not the others.
