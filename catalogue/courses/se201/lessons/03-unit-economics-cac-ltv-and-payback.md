---
lesson_id: se201-03
course_id: se201
pathway: technical-sales-representative
title: "Unit Economics: CAC, LTV, and Payback"
order: 3
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Calculate customer acquisition cost, lifetime value, and payback period from
    account data
---

## What unit economics answer

A SaaS company spends money now to acquire revenue that arrives slowly, in monthly slices, for as long as the customer stays. Unit economics are the three numbers that tell you whether that trade is a good one, measured on a single customer rather than on the whole company:

- **CAC** — customer acquisition cost. What it cost, all in, to win one customer.
- **LTV** — lifetime value. The gross profit that customer will generate before they leave.
- **Payback period** — how many months of that customer's gross profit it takes to earn the CAC back.

These are not finance-department decorations. They are the reason your territory is shaped the way it is, the reason a discount that looks small can make a deal unprofitable, and the reason "we'll take any customer" is a bad strategy. A rep who can compute them can argue about compensation, segment focus, and deal desk decisions with evidence instead of opinion.

## CAC: what counts, and what does not

CAC is a ratio: the sales and marketing cost of a period divided by the customers acquired in that period.

```text
CAC = total sales and marketing cost / new customers acquired
```

Every argument about CAC is really an argument about the numerator. Three conventions are common and they give very different answers.

**Paid CAC** counts only advertising and program spend. It is the smallest number, it is easy to compute, and it is close to meaningless for a company with a direct sales team, because it excludes the salespeople.

**Fully loaded CAC** counts everything that exists to acquire customers: marketing programs, sales salaries and benefits, commissions and bonuses, sales tooling, sales leadership, enablement, and an allocation for sales operations. This is the number that matters and the one used in every comparison in this course.

**Blended vs. segmented CAC.** Blended CAC divides all the spend by all the new customers, which is a real number that describes no real customer. Segmented CAC splits both the numerator and denominator by segment, channel, or product. The gap between them is usually the most interesting fact in the model.

Two costs are commonly and correctly *excluded*: the cost of serving existing customers (that is cost of goods sold, and it belongs in gross margin), and the cost of retaining or expanding existing customers (which belongs to a separate expansion-cost calculation, not to CAC). If a customer success manager spends her whole quarter on renewals, her salary is not CAC.

Timing is the other trap. Spend in a quarter does not produce customers in the same quarter — a 90-day sales cycle means Q3's spend produced Q4's logos. Rigorous models lag the numerator by roughly one sales cycle. Simple models do not, and are wrong by however much the spend changed quarter over quarter.

## Worked example: computing CAC

Here is a real-shaped quarter for a company selling document automation software.

| Sales and marketing cost, Q3 | Amount |
| --- | --- |
| Marketing programs and events | $180,000 |
| Sales salaries and benefits (5 AEs, 2 SDRs) | $420,000 |
| Commissions paid | $95,000 |
| Sales tooling and data | $35,000 |
| Sales leadership and enablement allocation | $70,000 |
| **Total** | **$800,000** |

The company closed **32 new customers** in Q3.

```text
Blended fully loaded CAC = $800,000 / 32 = $25,000 per customer
```

Now split it. Twenty-four of those customers were small businesses and eight were enterprises, and the cost attribution looks like this:

```text
SMB segment:        $170,000 spend / 24 customers = $7,083 CAC
Enterprise segment: $630,000 spend /  8 customers = $78,750 CAC
```

The blended $25,000 sits between two numbers that differ by a factor of eleven. No customer costs $25,000 to acquire. Any decision made on the blended figure — headcount, territory design, whether to keep an enterprise motion — is being made on a number that describes nothing. Segment first, always.

## Gross margin, and why LTV is a profit number

A customer paying you $800 a month does not hand you $800 of value. Hosting, support, customer success, third-party API fees, and payment processing all consume part of it. What is left is **gross profit**, and gross margin is its percentage.

```text
Gross margin = (revenue - cost of goods sold) / revenue
```

For this company, gross margin is **78%**. So $800 of monthly revenue is $624 of monthly gross profit.

Every serious LTV and payback calculation uses gross profit, not revenue. Using revenue overstates LTV by whatever your COGS is — at 78% margin, by about 28%. When someone quotes you an LTV, the first question is always "on revenue or on margin?"

## LTV: three ways to get it, in increasing honesty

**The simple form.** If a customer churns at a constant monthly rate `c`, their expected lifetime is `1 / c` months.

```text
Average lifetime (months) = 1 / monthly churn rate
LTV = monthly revenue per account x gross margin / monthly churn rate
```

Apply it to the SMB segment. Average SMB contract is $9,600 ACV, so $800 per month. Monthly logo churn is **2.0%**.

```text
Average lifetime = 1 / 0.02 = 50 months (about 4.2 years)
Monthly gross profit = $800 x 0.78 = $624
LTV = $624 / 0.02 = $31,200
```

Now the enterprise segment. Average enterprise contract is $72,000 ACV, so $6,000 per month, with **8% annual** logo churn. Convert to monthly before using the formula — this is where most people go wrong:

```text
Monthly churn = 0.08 / 12 = 0.00667
Average lifetime = 1 / 0.00667 = 150 months (12.5 years)
Monthly gross profit = $6,000 x 0.78 = $4,680
LTV = $4,680 / 0.00667 = $701,649, call it $702,000
```

**Why the simple form flatters you.** It assumes churn stays constant forever and it ignores the time value of money. A dollar of gross profit in year eleven is not worth a dollar today, and a 12.5-year projected lifetime is longer than most SaaS products have existed. Serious models cap the horizon — commonly at three or five years — or discount future cash flows. A five-year cap on the enterprise number gives:

```text
5-year capped LTV = $4,680 x 60 months x (survival adjustment)
Naive 5-year gross profit = $280,800
With 8%/yr attrition: $56,160 x (1 + 0.92 + 0.85 + 0.78 + 0.72) = about $239,000
```

That is a third of the uncapped figure. Both are "LTV." Ask which one.

**Expansion changes the picture entirely.** If accounts grow after purchase, revenue per account is not constant and the simple formula understates badly. The metric that captures this is net revenue retention, and lesson 4 builds it properly.

## LTV:CAC — the ratio, and what it hides

```text
LTV:CAC = LTV / CAC
```

```text
SMB:        $31,200 / $7,083  = 4.4 : 1
Enterprise: $702,000 / $78,750 = 8.9 : 1
```

The conventional rule of thumb is that **3:1 is healthy**. Below about 1:1 you are destroying value on every sale. Far above 5:1 usually does not mean brilliance; it means underinvestment — you could profitably spend more to acquire more, and you are leaving growth on the table.

The ratio has a serious blind spot: it says nothing about *time*. Enterprise looks nearly twice as good as SMB here on a ratio basis, but that 8.9:1 is collected over a projected 12.5 years, and it required $78,750 of cash out the door before a dollar came back. A company with limited cash can be killed by an excellent LTV:CAC ratio. That is what payback period is for.

## CAC payback period

```text
CAC payback (months) = CAC / (monthly revenue per account x gross margin)
```

```text
SMB:        $7,083  / ($800 x 0.78 = $624)    = 11.4 months
Enterprise: $78,750 / ($6,000 x 0.78 = $4,680) = 16.8 months
```

Check the blended number as well, to see the distortion again. New ARR in Q3 was 24 × $9,600 + 8 × $72,000 = $230,400 + $576,000 = **$806,400**, over 32 customers, so the average new contract is $25,200 ACV or $2,100 per month.

```text
Blended payback = $25,000 / ($2,100 x 0.78 = $1,638) = 15.3 months
```

Fifteen point three months is the average of two experiences — an SMB motion that pays back in under a year and an enterprise motion that takes nearly a year and a half — and it is the right number for neither.

Two conventions you must distinguish. **Gross-margin payback** (above) uses gross profit and is the standard. **Revenue payback** uses revenue and gives a shorter, friendlier number: $25,000 / $2,100 = 11.9 months. When someone tells you their payback is under twelve months, ask which denominator. The difference here is 3.4 months.

Rough benchmarks: under 12 months is strong, 12 to 18 months is normal for mid-market, 18 to 24 months is tolerable in enterprise if retention is genuinely high, and beyond 24 months you are financing your customers.

![Cumulative gross profit from one customer crossing the CAC line at the payback month](./img/cac-payback-timeline.png)

## Watching one customer break even

Payback is an abstraction until you watch the cumulative gross profit climb toward the CAC line. Here is the SMB customer — $7,083 of CAC, $624 of gross profit a month — month by month.

| Month | Cumulative gross profit | Against $7,083 of CAC |
| --- | --- | --- |
| 3 | $1,872 | -$5,211 |
| 6 | $3,744 | -$3,339 |
| 9 | $5,616 | -$1,467 |
| 11 | $6,864 | -$219 |
| 12 | $7,488 | **+$405 — paid back** |
| 18 | $11,232 | +$4,149 |
| 24 | $14,976 | +$7,893 |
| 50 | $31,200 | +$24,117 — the full LTV |

And the enterprise customer, at $78,750 of CAC and $4,680 a month:

| Month | Cumulative gross profit | Against $78,750 of CAC |
| --- | --- | --- |
| 6 | $28,080 | -$50,670 |
| 12 | $56,160 | -$22,590 |
| 16 | $74,880 | -$3,870 |
| 17 | $79,560 | **+$810 — paid back** |
| 24 | $112,320 | +$33,570 |
| 36 | $168,480 | +$89,730 |

Two things fall out of these tables that the ratios cannot show you. First, for seventeen months the enterprise customer is a **liability**, and if they churn after month 12 the company has lost roughly $22,600 on them despite everything having looked fine. Every early-life churn is a loss, not a smaller gain. Second, the SMB customer spends the remaining thirty-eight months of their life as pure profit — which is precisely why retention, not acquisition, is where SaaS margins are made. Lesson 4 is the direct consequence of these two tables.

## Payback is a cash question, so billing terms move it

Everything above assumed monthly billing. Change how the money arrives and the *cash* payback changes even though the accounting payback does not.

Take the enterprise deal — $72,000 ACV, 78% margin, $78,750 CAC — billed three ways.

```text
Monthly billing:
  gross profit arrives at $4,680/month
  cumulative crosses $78,750 in month 17

Annual prepay:
  $72,000 x 0.78 = $56,160 of gross profit arrives in month 1
  next $56,160 arrives in month 13 -> cumulative $112,320
  cash payback: month 13

Three-year prepay ($216,000 up front):
  $216,000 x 0.78 = $168,480 arrives in month 1
  cash payback: month 1
```

This is why annual and multi-year prepayment are worth conceding something for, and why finance teams will approve a discount for prepaid multi-year that they will refuse on a monthly deal of the same headline value. You are not just locking in the term; you are removing the cash hole entirely. When you ask for approval on a prepaid deal, say that out loud — "this is a month-one cash payback" is a much stronger sentence than "they wanted a discount."

The mirror image is also true. A monthly-billed deal with a long ramp — where the customer's committed spend steps up in years two and three — has the CAC in month zero and the revenue in month twenty. That structure can be right for the customer and still be the wrong deal to sign at the end of a cash-constrained quarter.

## Getting the denominator right

Almost every CAC dispute you will witness is a fight about what counts as one customer.

**Expansion deals are not new customers.** Selling a second department at an existing account is expansion. Putting it in the denominator makes CAC look smaller and makes the sales team look more efficient than it is. New logos only.

**Free-to-paid conversions.** If a product has a free tier, the acquisition cost of the free user is real and was spent months earlier. Companies that count only the paid conversion event understate CAC substantially.

**Multi-product companies.** A customer who buys two products is one customer. Counting them twice halves the apparent CAC.

**Partner and channel-sourced deals.** These have a different cost structure — usually lower direct sales cost and a revenue share that shows up in COGS instead. Blending them with direct deals distorts both the numerator and the margin.

The practical test: if the CAC someone quotes you moved a lot from last quarter, ask what changed in the denominator before you believe anything changed in the business.

## What a rep actually does with these numbers

**Discounting is a payback decision.** Take the enterprise deal: $72,000 ACV, $78,750 CAC, 78% margin, 16.8-month payback. Cut the price 20%:

```text
New ACV = $57,600 -> $4,800/month -> gross profit $3,744/month
Payback = $78,750 / $3,744 = 21.0 months
```

A 20% discount added **4.2 months** of payback. It also cut LTV from $702,000 to $561,600 and the ratio from 8.9:1 to 7.1:1. That is the sentence to have ready when you ask deal desk for approval: not "the customer wants 20% off," but "20% moves payback from 16.8 to 21.0 months; here is what I got in exchange."

**Term length changes CAC recovery.** A multi-year prepaid contract collects cash up front, which shortens the *cash* payback even when the accounting payback is unchanged. That is why annual and multi-year prepay are usually worth more concession than they cost.

**Segment focus is a payback argument.** If you want to argue for more SMB coverage, the argument is not "SMB is easier." It is "SMB pays back in 11.4 months against enterprise's 16.8, so the same dollar of quota-carrying cost recycles 1.5 times faster."

**Mix matters more than any individual deal.** Winning one more enterprise logo adds $78,750 of CAC and $6,000 of monthly gross profit. Winning eleven SMB logos costs about the same ($77,913) and adds $6,864 of monthly gross profit — with the money back five months sooner.

## Where these numbers lie

- **Blended everything.** Already covered, and still the most common failure.
- **CAC on the wrong denominator.** Counting expansion deals as "new customers" deflates CAC. New logos only.
- **Churn measured on logos when the money is concentrated.** Losing your two largest accounts and keeping thirty small ones can be a 6% logo churn rate and a 40% revenue disaster. Lesson 4 fixes this.
- **Lifetimes longer than the company.** A 2% monthly churn implies a 50-month average life. If the product is three years old, that is an extrapolation, not an observation.
- **Ignoring the ramp.** A rep hired today produces nothing for two quarters, but their salary is in the numerator now. Fast-growing companies look artificially expensive for this reason.
- **Payback quoted on revenue.** Always ask.

## Practice

Riverbend Analytics closed its fiscal Q2 with the following data.

| Sales and marketing cost, Q2 | Amount |
| --- | --- |
| Marketing programs | $145,000 |
| Sales salaries and benefits | $510,000 |
| Commissions | $88,000 |
| Tooling, data, and sales ops allocation | $57,000 |
| **Total** | **$800,000** |

New customers acquired: **45**, split as **36 mid-market** and **9 enterprise**. Cost attribution is $288,000 to mid-market and $512,000 to enterprise.

- Mid-market: average ACV $14,400; monthly logo churn 1.5%
- Enterprise: average ACV $96,000; annual logo churn 6%
- Company gross margin: **72%**

**Exercise 1 — compute the model.** Show every step.

1. Blended fully loaded CAC.
2. Segmented CAC for mid-market and for enterprise.
3. Monthly gross profit per account in each segment.
4. LTV in each segment, using the simple churn formula. Convert the enterprise annual churn to monthly first.
5. LTV:CAC in each segment.
6. Gross-margin CAC payback in each segment, and the blended payback.

**Exercise 2 — the discount question.** An enterprise prospect wants 15% off list. Recompute that account's ACV, monthly gross profit, LTV, LTV:CAC, and payback at the discounted price. State in one sentence, with the numbers, what you would tell deal desk.

**Exercise 3 — recommend.** Riverbend can fund exactly one additional quota-carrying rep, in mid-market or in enterprise. Write a short recommendation (150 words maximum) using at least three of the numbers you calculated. Name one figure in the dataset you do not trust and say what you would need to see to trust it.

## Check your understanding

1. A customer pays $1,000 a month at 80% gross margin and churns at 2.5% a month. What is the simple LTV? *(Answer: $1,000 × 0.80 / 0.025 = $32,000.)*
2. With $12,000 of CAC, what is that customer's gross-margin payback, and what would the revenue payback be? *(Answer: $12,000 / $800 = 15 months gross-margin; $12,000 / $1,000 = 12 months revenue. Always ask which one you are being quoted.)*
3. Why can an 8.9:1 LTV:CAC ratio still be a problem for a cash-constrained company? *(Answer: the ratio ignores time; the CAC is spent up front and may take well over a year to recover, so the company carries the cash hole.)*
