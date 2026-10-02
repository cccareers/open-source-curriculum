---
lesson_id: se201-04
course_id: se201
pathway: technical-sales-representative
title: Growth and Retention Metrics
order: 4
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Interpret ARR, net revenue retention, and churn to judge the health of a
    book of business
---

## ARR is a snapshot, not a sum

Lesson 2 defined ARR as annual recurring revenue. The single most common error made with it is treating it as "revenue we collected last year." It is not. **ARR is the annualized value of the recurring contracts in force at a moment in time.** It answers "if nothing changed from today, what would the next twelve months look like?"

That matters because it makes ARR comparable across two dates, and the *difference* between two ARR snapshots is where all the information lives. A book that went from $4.8M to $5.5M grew $700,000 — but that single fact is compatible with a healthy business and with a business in serious trouble, and the rest of this lesson is about telling them apart.

Three exclusions keep ARR honest. One-time fees — implementation, training, professional services — are never in ARR. Non-recurring overage is a judgment call; recurring, predictable overage usually is included, one-off spikes usually are not. And ARR counts *contracted* revenue, not invoiced revenue: a customer who has signed but not yet gone live is in ARR from the contract start date, not from first login.

## The ARR bridge

The bridge (also called the ARR walk or waterfall) decomposes the change between two snapshots into five components. It is the single most useful artifact for judging a book of business, and every one of the metrics below is derived from it.

```text
Beginning ARR
  + New       (ARR from customers who were not customers at the start)
  + Expansion (additional ARR from customers who were)
  - Contraction (ARR lost from customers who downgraded but stayed)
  - Churn     (ARR lost from customers who left entirely)
= Ending ARR
```

The distinctions are strict and worth memorizing, because loose bookkeeping here is how a bad book gets reported as a good one.

- **New vs. expansion.** A new *logo* is an organization that was not a customer. A new department at an existing customer is expansion, however new it feels to sell.
- **Contraction vs. churn.** Contraction is a surviving customer paying less: fewer seats, a lower tier, a reduced commit. Churn is the contract ending. A customer who drops from $80,000 to $5,000 is $75,000 of contraction, not churn, and that distinction hides real damage if you only watch logo counts.
- **Reactivation.** A returning former customer is usually counted as new; some companies break it out. Know which convention your company uses before you quote a number.

![The five components of an ARR bridge from beginning to ending ARR](./img/arr-bridge.png)

## Worked example: a full year on one book

A senior rep's book at the start of the fiscal year: **40 accounts, $4,800,000 ARR**. Over the year:

| Component | Accounts | ARR |
| --- | --- | --- |
| Beginning ARR | 40 | $4,800,000 |
| New logos | 11 | +$860,000 |
| Expansion | — | +$720,000 |
| Contraction | — | -$310,000 |
| Churn | 5 | -$590,000 |
| **Ending ARR** | **46** | **$5,480,000** |

```text
Ending ARR = 4,800,000 + 860,000 + 720,000 - 310,000 - 590,000 = $5,480,000
Net growth = 5,480,000 - 4,800,000 = $680,000
Growth rate = 680,000 / 4,800,000 = 14.2%
```

Fourteen percent growth. Now compute what is underneath it.

## Logo churn versus revenue churn

**Logo churn rate** counts customers.

```text
Logo churn = customers lost / customers at start = 5 / 40 = 12.5%
```

**Gross revenue churn** counts money leaving, from both contraction and cancellation.

```text
Gross revenue churn = (contraction + churn) / beginning ARR
                    = (310,000 + 590,000) / 4,800,000
                    = 900,000 / 4,800,000 = 18.75%
```

Notice that revenue churn (18.75%) is materially worse than logo churn (12.5%). That tells you the accounts that left were **larger than average**: five accounts representing 12.5% of the count took 12.3% of the ARR in cancellations alone, plus $310,000 of downgrades from survivors. When revenue churn exceeds logo churn, your losses are concentrated at the top of the book — the most expensive kind.

The reverse pattern — logo churn well above revenue churn — means you are losing small accounts and keeping big ones. That is usually a self-service or SMB tail problem, and it is far less urgent.

## Gross revenue retention and net revenue retention

These two are the headline retention metrics, and the difference between them is the whole story.

**GRR** measures how much of the starting revenue base survived, ignoring expansion. It cannot exceed 100%.

```text
GRR = (beginning ARR - contraction - churn) / beginning ARR
    = (4,800,000 - 310,000 - 590,000) / 4,800,000
    = 3,900,000 / 4,800,000 = 81.25%
```

**NRR** measures the same base *including* expansion from those same customers. It can exceed 100%, and when it does, the existing book grows on its own.

```text
NRR = (beginning ARR + expansion - contraction - churn) / beginning ARR
    = (4,800,000 + 720,000 - 310,000 - 590,000) / 4,800,000
    = 4,620,000 / 4,800,000 = 96.25%
```

Both metrics deliberately exclude new logos. That is the point: they isolate what happened to the customers you already had, so that a big new-logo quarter cannot paper over a leaking base.

**Now read the book.** Growth was 14.2% and it looked fine. But NRR is 96.25%, meaning the existing base *shrank* by $180,000 over the year. Every dollar of the $680,000 in growth — and then some — came from new logos. Connect that to lesson 3: at roughly $1 of fully loaded CAC per $1 of new ARR, that $860,000 of new business cost something close to $860,000 to acquire, and $180,000 of it was immediately consumed refilling the leak. This book is growing by spending, not by compounding.

Contrast the benchmark. A book at 100% NRR replaces itself with no sales effort. A book at 120% NRR grows a fifth every year if the rep sells nothing at all. Best-in-class enterprise SaaS runs 115–130%; 100–110% is solid; below 100% means the base is a bucket with a hole, and above about 90% GRR is the usual floor for a healthy enterprise product.

## The quick ratio

A compact way to express the same tension: how many dollars are you adding for every dollar you lose?

```text
Quick ratio = (new + expansion) / (contraction + churn)
            = (860,000 + 720,000) / (310,000 + 590,000)
            = 1,580,000 / 900,000 = 1.76
```

A quick ratio of 4 or better is generally considered efficient growth. At 1.76, this book runs hard to move slowly: nearly $0.57 of every growth dollar is being spent replacing something that was already there.

## Same growth, different books

Two reps finish the year with identical ARR. Look at what it cost each of them.

**Rep A** — beginning ARR $2,000,000.

```text
Expansion   +$120,000
Contraction  -$60,000
Churn       -$300,000
NRR = (2,000,000 + 120,000 - 60,000 - 300,000) / 2,000,000
    = 1,760,000 / 2,000,000 = 88.0%
New logos required to reach $2,300,000 = 2,300,000 - 1,760,000 = $540,000
```

**Rep B** — beginning ARR $2,000,000.

```text
Expansion   +$380,000
Contraction  -$40,000
Churn        -$90,000
NRR = (2,000,000 + 380,000 - 40,000 - 90,000) / 2,000,000
    = 2,250,000 / 2,000,000 = 112.5%
New logos required to reach $2,300,000 = 2,300,000 - 2,250,000 = $50,000
```

Same $2,300,000 ending ARR. Rep A had to source, qualify, and close **$540,000** of net-new business; Rep B had to close **$50,000**. At roughly a dollar of CAC per dollar of new ARR, Rep A's identical result consumed close to half a million dollars of company money that Rep B's did not. If both are paid the same commission on ending ARR, the compensation plan is broken — and if you are Rep A, the fix is not more prospecting, it is finding out why $360,000 walked out of a $2M base.

## Net new ARR: how much you have to sell to stand still

Retention metrics become operational the moment you use them to size next year's quota. Rearrange the bridge to solve for the new-logo requirement:

```text
Required new ARR = target ending ARR - (beginning ARR x NRR)
```

Take the $4,800,000 book and set a 20% growth target — an ending ARR of $5,760,000.

```text
At the actual 96.25% NRR:
  base carries forward to 4,800,000 x 0.9625 = $4,620,000
  required new ARR = 5,760,000 - 4,620,000 = $1,140,000

At 110% NRR:
  base carries forward to 4,800,000 x 1.10 = $5,280,000
  required new ARR = 5,760,000 - 5,280,000 = $480,000
```

The same growth target, on the same book, costs **$660,000 more of net-new selling** at 96% retention than at 110%. Priced at roughly a dollar of fully loaded CAC per dollar of new ARR — the ratio from lesson 3 — that is $660,000 of company money spent to occupy the same position. This is the single most useful sentence a rep can carry out of this lesson: *retention is a quota reduction*.

Run it the other way, too. At 96.25% NRR, selling nothing at all means the book ends the year at $4,620,000. The first $180,000 you sell buys you nothing; it refills the hole. Reps who feel like they are running to stand still usually are, and now they can prove it.

## Converting between periods without lying

Retention and churn rates are period-specific, and the arithmetic to move between periods is compounding, not multiplication. This is a very common error and it is always in the flattering direction.

**Churn does not scale linearly.** A 2% monthly churn rate is not 24% annually:

```text
Annual survival = (1 - 0.02)^12 = 0.98^12 = 0.7847
Annual churn    = 1 - 0.7847 = 21.5%
```

**Retention compounds the same way.** A quarterly NRR of 97% sounds nearly flat. Over a year:

```text
(0.97)^4 = 0.885 -> 88.5% annual NRR
```

An 11.5% annual decline in the base, from a number that looked like a rounding error each quarter.

**And expansion compounds upward.** A quarterly NRR of 104% is:

```text
(1.04)^4 = 1.170 -> 117% annual NRR
```

Whenever someone quotes you a retention figure, get the period. Quarterly and annual figures of the same magnitude describe completely different businesses.

## Concentration: the number behind the number

Averages assume the book is evenly distributed. Books are never evenly distributed.

The 40-account, $4,800,000 book has an average account size of $120,000. But suppose the top five accounts hold $1,900,000 of it:

```text
Top 5 accounts / total ARR = 1,900,000 / 4,800,000 = 39.6%
Remaining 35 accounts      = 2,900,000, averaging $82,857
```

Losing one top-five account — call it $420,000 — is 8.75% of the entire book from a single logo churn of 2.5%. No blended metric will warn you about that in advance; only the distribution will. Compute two things for your own book and keep them current: the share of ARR held by your top five accounts, and the largest single-account ARR as a percentage of the whole. Those two numbers are your real exposure, and they are what a manager should hear before any average.

Concentration also explains the earlier finding that revenue churn exceeded logo churn. When money is concentrated, the *identity* of who leaves matters more than how many leave.

## Cohorts, because averages hide the trend

A single blended NRR is a weighted average over customers who joined at different times, under different products, at different prices. Splitting by **cohort** — the group of customers that started in the same period — is what reveals whether things are improving or decaying.

| Cohort | Accounts | Initial ARR | End of yr 1 | End of yr 2 | End of yr 3 |
| --- | --- | --- | --- | --- | --- |
| 2022 | 12 | $980,000 | $1,010,000 (103%) | $1,120,000 (114%) | $1,060,000 (108%) |
| 2023 | 15 | $1,240,000 | $1,190,000 (96%) | $1,150,000 (93%) | — |
| 2024 | 9 | $760,000 | $700,000 (92%) | — | — |

The blended 96.25% is arithmetic that averages a genuinely good 2022 cohort against two progressively worse ones. Every year's new customers retain worse than the year before at the same age. That is a trend the blended number cannot show and a rep can act on: something changed in what was sold, who it was sold to, or what was promised, starting in 2023.

Read cohorts *at equal age*. Comparing a three-year-old cohort's retention to a six-month-old cohort's tells you nothing.

## Where these numbers get bent

Retention metrics are reported by the people they judge, which is reason enough to know the standard distortions.

**Downgrade recorded as a renewal.** A customer who cuts from $80,000 to $30,000 has renewed. The logo count is unharmed and the renewal rate looks perfect. Only the contraction line — and therefore NRR — shows the $50,000. Any company reporting only "renewal rate" is hiding this.

**Churn deferred by a short extension.** A three-month extension granted to an account that has already decided to leave moves the churn into the next reporting period. Watch for accounts on unusually short terms.

**NRR quoted on a filtered base.** "NRR among customers with more than $50,000 of ARR" is a legitimate cohort and an illegitimate headline. Always ask what population the denominator covers.

**One enormous expansion carrying the number.** In a small book, a single account tripling can pull NRR above 100% while everything else leaks. Compute NRR with the largest expansion removed; if the answer changes by more than a few points, the headline is one account, not a trend.

**Churn defined by cancellation date rather than notice date.** A customer who gave notice in March and whose contract ends in September is already gone. Reporting them as retained through Q2 is technically true and practically dishonest.

**Down-sell counted as expansion because a new module was added.** A customer who drops 60 seats and buys one add-on has contracted. Netting the two inside a single "account change" line hides both.

None of these require bad faith. They are what happens when nobody agrees on definitions, which is why the ARR bridge — five explicit lines that must sum to the ending number — is the artifact to insist on. If the bridge does not tie out, one of the five lines is doing work it should not be.

## What a rep does with these numbers

**Rank your book by revenue at risk, not by account count.** Gross revenue churn told us the losses are concentrated. Sort accounts by ARR, look at the top 20%, and ask what would happen if any one of them left. That number, not the count, is your exposure.

**Treat contraction as an early warning, not a small loss.** Downgrades almost always precede cancellation by a renewal cycle or two. A $310,000 contraction year is a forecast of next year's churn line.

**Know your own NRR before you ask for territory.** "Give me more accounts" is a weak argument. "My book runs 118% NRR and I have capacity for six more accounts" is a strong one.

**Separate the two jobs.** New-logo work and base work compete for the same hours, and the metrics above are how you decide the split. A book at 88% NRR does not need more prospecting; it needs lesson 6.

One scope note: these are the health metrics of a *book of business*. Pipeline coverage, conversion rates, and forecast accuracy — the numbers that describe deals not yet closed — belong to Sales Analytics (se305), and the mechanics of tracking them in a CRM belong to se301.

## Practice

Kestrel Software's mid-market book started the fiscal year at **28 accounts and $3,400,000 ARR**. During the year:

- 7 new logos totaling **$520,000**
- Expansion from existing accounts: **$295,000**
- Contraction from existing accounts: **$210,000**
- 4 accounts cancelled, totaling **$465,000**

**Exercise 1 — build the bridge.** Lay out the ARR bridge as a table and compute ending ARR, net growth in dollars, and the growth rate as a percentage.

**Exercise 2 — compute the metrics.** Show your arithmetic for each.

1. Logo churn rate.
2. Gross revenue churn rate.
3. GRR.
4. NRR.
5. The quick ratio.

**Exercise 3 — interpret.** Answer these in complete sentences, each citing at least one number you computed.

1. Is this book healthier or less healthy than it looks from the growth rate alone? Why?
2. Compare logo churn to gross revenue churn. What does the relationship between them tell you about the *size* of the accounts that left?
3. How much new ARR would this rep have needed to source if NRR had been 110% instead of what it was, holding ending ARR constant?

**Exercise 4 — one page for your manager.** The book's three largest accounts are $410,000, $355,000, and $290,000 of ARR — 31% of the starting book across three logos. Write a short assessment (250 words maximum) of this book's health that a sales manager could act on. It must name a specific number for the concentration risk, state whether the immediate priority is new logos or the existing base, and justify that choice with the retention metrics rather than with an opinion.
