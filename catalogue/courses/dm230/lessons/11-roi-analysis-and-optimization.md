---
lesson_id: dm230-11
course_id: dm230
pathway: digital-marketer
title: ROI Analysis and Optimization
order: 11
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Judge campaign performance on return on investment and decide what to change
  - Calculate cost per acquisition, return on ad spend, and contribution for a
    campaign
---

## The Metric Ladder

Every paid account produces the same stack of numbers, and they are not equally important. Ordered from furthest-from-money to closest:

1. **Impressions.** How many times an ad was eligible and shown. A volume ceiling, nothing more.
2. **Clicks.** How many people came. Still not money.
3. **Click-through rate (CTR).** Clicks divided by impressions. A relevance signal, useful for diagnosing ad copy and match quality.
4. **Cost per click (CPC).** What you paid for arrival. An input cost.
5. **Conversions.** How many leads or sales the traffic produced. Now you are measuring an outcome, but only if your tracking is correct.
6. **Conversion rate.** Conversions divided by clicks. Measures the page and the offer, mostly.
7. **Cost per acquisition (CPA).** Spend divided by conversions. The first number a business owner recognizes.
8. **Return on ad spend (ROAS).** Revenue divided by spend. Money in, money out.
9. **Contribution.** Gross profit minus ad spend. What actually stayed in the business.

Only the last two are money, and only the last one is unambiguous. Everything above them is a diagnostic that helps you explain why the money numbers look the way they do. A campaign with a great CTR and a negative contribution is a campaign that is losing money efficiently.

The professional habit is to always climb to the bottom two rungs before forming an opinion, and to use the top seven only to explain what you find there.

## Definitions, as Formulas

```txt
CTR             = clicks / impressions
CPC             = spend / clicks
Conversion rate = conversions / clicks
CPA             = spend / conversions
ROAS            = revenue attributed / spend
Gross profit    = revenue x gross margin
Contribution    = gross profit - ad spend
Break-even CPA  = gross profit per conversion
Break-even ROAS = 1 / gross margin
Target CPA      = break-even CPA - required contribution per conversion
```

Note two things. **ROAS is computed on revenue, not profit**, which is exactly why it misleads people. And **break-even ROAS is the reciprocal of gross margin**, which means the same ROAS figure means completely different things at two different businesses.

## Working the Canonical Report

Here is Northgate Heating and Air's last 30 days. Every derived column is computed below the table so you can check the division yourself.

| Campaign / ad group | Spend | Clicks | Avg CPC | Conv | CPA |
| --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $600 | 316 | $1.90 | 88 | $6.82 |
| Non-brand - AC Repair | $3,200 | 390 | $8.21 | 43 | $74.42 |
| Non-brand - Furnace Install | $1,600 | 178 | $8.99 | 12 | $133.33 |
| Non-brand - Maintenance Plans | $680 | 142 | $4.79 | 9 | $75.56 |
| **Total** | **$6,080** | **1,026** | **$5.93** | **152** | **$40.00** |

```txt
Avg CPC
  Brand           $600   / 316   = $1.899  -> $1.90
  AC Repair       $3,200 / 390   = $8.205  -> $8.21
  Furnace Install $1,600 / 178   = $8.989  -> $8.99
  Maintenance     $680   / 142   = $4.789  -> $4.79
  Blended         $6,080 / 1,026 = $5.926  -> $5.93

CPA
  Brand           $600   / 88    = $6.818  -> $6.82
  AC Repair       $3,200 / 43    = $74.419 -> $74.42
  Furnace Install $1,600 / 12    = $133.33
  Maintenance     $680   / 9     = $75.556 -> $75.56
  Blended         $6,080 / 152   = $40.00

Conversion rate
  Brand           88 / 316 = 27.85%
  AC Repair       43 / 390 = 11.03%
  Furnace Install 12 / 178 =  6.74%
  Maintenance      9 / 142 =  6.34%
```

Every figure is rounded to the cent or to two decimal places, and the rounding is stated. When you build a report, round at the end, never in the middle, or your totals stop reconciling.

## From Leads to Revenue and Gross Profit

CPA on its own cannot tell you whether a campaign is good. A $133.33 CPA is catastrophic if a lead is worth $50 and outstanding if a lead is worth $432. You have to walk the lead through the sales funnel.

Northgate's funnel, from the client:

- 60 percent of leads become a booked job.
- An average repair job is $410 revenue and $180 gross profit.
- An average system replacement is $8,500 revenue and $2,400 gross profit, and 18 percent of replacement leads close.

```txt
Repair lead
  Revenue per lead      = 0.60 x $410   = $246.00
  Gross profit per lead = 0.60 x $180   = $108.00

Replacement lead
  Revenue per lead      = 0.18 x $8,500 = $1,530.00
  Gross profit per lead = 0.18 x $2,400 = $432.00
```

Brand, AC Repair, and Maintenance Plans generate repair-type leads. Furnace Install generates replacement leads. That single distinction reorders the entire account, as you are about to see.

## The Contribution Table

| Campaign | Spend | Leads | GP / lead | Revenue / lead | Revenue | Gross profit | Contribution | ROAS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $600 | 88 | $108 | $246 | $21,648 | $9,504 | $8,904 | 36.08 |
| Non-brand - AC Repair | $3,200 | 43 | $108 | $246 | $10,578 | $4,644 | $1,444 | 3.31 |
| Non-brand - Furnace Install | $1,600 | 12 | $432 | $1,530 | $18,360 | $5,184 | $3,584 | 11.48 |
| Non-brand - Maintenance Plans | $680 | 9 | $108 | $246 | $2,214 | $972 | $292 | 3.26 |
| **Total** | **$6,080** | **152** | — | — | **$52,800** | **$20,304** | **$14,224** | **8.68** |

```txt
Brand
  Revenue      = 88 x $246   = $21,648
  Gross profit = 88 x $108   = $9,504
  Contribution = $9,504  - $600   = $8,904
  ROAS         = $21,648 / $600   = 36.08

AC Repair
  Revenue      = 43 x $246   = $10,578
  Gross profit = 43 x $108   = $4,644
  Contribution = $4,644  - $3,200 = $1,444
  ROAS         = $10,578 / $3,200 = 3.3056 -> 3.31

Furnace Install
  Revenue      = 12 x $1,530 = $18,360
  Gross profit = 12 x $432   = $5,184
  Contribution = $5,184  - $1,600 = $3,584
  ROAS         = $18,360 / $1,600 = 11.475 -> 11.48

Maintenance Plans
  Revenue      = 9 x $246    = $2,214
  Gross profit = 9 x $108    = $972
  Contribution = $972    - $680   = $292
  ROAS         = $2,214  / $680   = 3.2559 -> 3.26

Totals
  Revenue      = 21,648 + 10,578 + 18,360 + 2,214 = $52,800
  Gross profit =  9,504 +  4,644 +  5,184 +   972 = $20,304
  Contribution = $20,304 - $6,080 = $14,224
  Check        = 8,904 + 1,444 + 3,584 + 292 = $14,224   OK
  Blended ROAS = $52,800 / $6,080 = 8.684 -> 8.68
```

Look at what just happened to the ranking. By CPA, Furnace Install is the worst campaign in the account at $133.33, more than three times the blended $40.00, and it is the one every junior analyst proposes cutting. By contribution it is the **second best campaign**, producing $3,584 a month, more than twice what AC Repair produces on half the budget. Contribution per dollar of spend makes it starker:

```txt
Brand           $8,904 / $600   = $14.84 of contribution per $1 spent
Furnace Install $3,584 / $1,600 = $2.24
AC Repair       $1,444 / $3,200 = $0.45
Maintenance     $292   / $680   = $0.43
```

AC Repair takes 53 percent of the budget and returns 10 percent of the contribution. That is the finding of the month, and no amount of staring at the CPA column would have produced it.

## ROAS Is Not Profitability

ROAS answers "how many dollars of revenue did each dollar of spend bring back." It says nothing about whether those revenue dollars carry any profit. The bridge is break-even ROAS, which is the reciprocal of gross margin.

Loom and Larder, the direct-to-consumer kitchen goods brand, runs a 55 percent gross margin.

```txt
Break-even ROAS = 1 / 0.55 = 1.818 -> 1.82

A campaign at 1.6 ROAS, spending $1,000:
  Revenue      = $1,000 x 1.6  = $1,600
  Gross profit = $1,600 x 0.55 = $880
  Contribution = $880 - $1,000 = -$120

At exactly 1.82 ROAS, spending $1,000:
  Revenue      = $1,820
  Gross profit = $1,820 x 0.55 = $1,001
  Contribution = $1,001 - $1,000 = +$1
```

A 1.6 ROAS campaign looks like it is returning 60 percent more than it costs. It is losing $120 for every $1,000 spent, and if you scale it you lose faster. Anyone who reports "we hit a 1.6 ROAS this month" without stating the break-even is reporting a loss as a win.

Now do Northgate, where the margins are different again.

```txt
Repair margin      = $180   / $410   = 43.90%
  Break-even ROAS  = 1 / 0.4390 = 2.278 -> 2.28

Replacement margin = $2,400 / $8,500 = 28.24%
  Break-even ROAS  = 1 / 0.2824 = 3.541 -> 3.54
```

So AC Repair's 3.31 ROAS clears the 2.28 repair break-even with room. It would have been a losing campaign at the same 3.31 if it sold replacements, because replacements carry a thinner margin and need 3.54. There is no such thing as a good ROAS number in the abstract. **The only correct question is "what is this business's break-even ROAS," and the answer is one divided by its gross margin.**

## Break-Even CPA and Target CPA

For lead generation, CPA is a friendlier currency than ROAS because the lead value is a fixed, knowable number.

```txt
Break-even CPA (repair lead)      = $108
Break-even CPA (replacement lead) = $432

Target CPA is break-even minus the contribution you require:
  Repair:      $108 - $48  target contribution = $60
  Replacement: $432 - $252 target contribution = $180
```

Contribution per lead is then just break-even minus actual CPA, and total contribution is that times lead count. It reconciles exactly to the table above:

```txt
Brand           ($108 - $6.82)   x 88 = $101.18 x 88 = $8,903.84
AC Repair       ($108 - $74.42)  x 43 = $33.58  x 43 = $1,443.94
Furnace Install ($432 - $133.33) x 12 = $298.67 x 12 = $3,584.04
Maintenance     ($108 - $75.56)  x  9 = $32.44  x  9 =   $291.96
```

Judged against target rather than break-even: Brand is far under target and should be scaled if volume allows. Furnace Install at $133.33 is comfortably under its $180 target. AC Repair at $74.42 and Maintenance at $75.56 both miss the $60 repair target while still clearing break-even, so they make money but not enough of it.

## The Brand Search Problem

Brand shows a $6.82 CPA and a 36.08 ROAS. It is the most spectacular line in the account and you should distrust it.

The people clicking that ad searched for "Northgate Heating and Air." They already knew the company. Many of them would have scrolled two centimetres and clicked the free organic result. Every one of those is a lead the business would have received for nothing, and the $600 spent on them bought a lead that was already coming. That portion of the reported return is not earned, it is borrowed from organic.

The honest way to think about it is **incremental** contribution: only the leads that would not otherwise have arrived count.

```txt
Assume 70% of brand clicks would have converted organically anyway.
  Incremental leads       = 88 x 0.30      = 26.4
  Incremental CPA         = $600 / 26.4    = $22.73
  Incremental gross profit = 26.4 x $108   = $2,851.20
  Incremental contribution = $2,851.20 - $600 = $2,251.20

Pessimistic: assume 90% would have arrived anyway.
  Incremental leads       = 8.8
  Incremental CPA         = $600 / 8.8     = $68.18
  Incremental contribution = (8.8 x $108) - $600 = $350.40
```

Brand survives even the pessimistic assumption, because a $1.90 CPC is cheap enough that a small incremental share still pays. But $8,904 was never the real number. Somewhere between $350 and $2,251 is, and reporting $8,904 to the owner overstates the account's performance by roughly 50 percent, since brand is 63 percent of reported contribution.

The only way to settle it is a **brand holdout test**: split the service area into two randomly assigned halves, turn brand search off in one half for four weeks, and measure **total** leads in each half from all sources, not paid leads. If total leads hold up where brand is off, brand was mostly cannibalizing organic. Be honest about the power problem: 88 brand conversions a month split across two geographic halves is about 44 per arm, which by the sample size logic of the previous lesson is nowhere near enough to detect a modest effect. Run it for a quarter, or accept that you are reasoning from an assumption and label the assumption in the report.

## Blended, Channel, and Campaign Reporting

The blended $40.00 CPA in the canonical report is a number that hides both the best and worst campaigns in the account. It averages a $6.82 brand lead with a $133.33 replacement lead as though they were the same thing, when they are not even the same product.

Worse, blended figures move when the mix moves, with no change in performance anywhere. Suppose brand demand rises 20 percent seasonally and nothing else changes:

```txt
Brand: 106 conversions for $720 spend (same $6.79 CPA)
All other campaigns unchanged.

New total spend = $6,080 - $600 + $720 = $6,200
New total conv  = 152 - 88 + 106       = 170
New blended CPA = $6,200 / 170         = $36.47
```

Blended CPA "improved" 8.8 percent. Not one campaign got better. This is why blended numbers belong in a report only as a headline, never as a diagnosis, and why a client who is only shown blended figures cannot tell a good month from a favourable mix.

The reporting discipline is three layers: **blended** for the top-line business answer, **channel** for the budget conversation across search, social, and organic, and **campaign or ad group** for every decision you actually make. Optimize at the level you can act on.

## Lifetime Value Versus First Purchase

The Maintenance Plans campaign looks marginal at $292 of contribution on $680 of spend. But a maintenance plan customer is not a one-transaction relationship.

Assume, and label this as an assumption, that a plan sells for $189 a year with $95 of gross profit, and that 70 percent of members renew each year, giving an average of about 2.3 renewal years beyond the first.

```txt
Additional lifetime gross profit per booked member = 2.3 x $95 = $218.50
Booked members per lead                            = 0.60
Additional lifetime value per lead = 0.60 x $218.50 = $131.10

Lifetime lead value  = $108 + $131.10 = $239.10
Break-even CPA on first purchase     = $108
Break-even CPA on lifetime value     = $239.10
```

At $75.56 this campaign clears both, so the conclusion does not change. But a $150 CPA would look like a loser on first purchase and a winner on lifetime, and that is a decision you must make deliberately. Two cautions. **The lifetime money arrives over three years and the ad spend leaves today**, so a business without cash cannot fund a lifetime-value strategy no matter how good the arithmetic looks. And a renewal rate assumed today is not a renewal rate measured; use first-purchase economics as the default and lifetime economics as a stated, evidenced exception.

## Attribution Changes the Numbers Without Changing the Business

The 152 conversions in the report are 152 conversions under one attribution model. Change the model and the same month produces a different table.

| Campaign | Conv (last click) | CPA | Conv (data driven) | CPA |
| --- | --- | --- | --- | --- |
| Brand - Northgate | 88 | $6.82 | 71.4 | $8.40 |
| Non-brand - AC Repair | 43 | $74.42 | 51.9 | $61.66 |
| Non-brand - Furnace Install | 12 | $133.33 | 17.3 | $92.49 |
| Non-brand - Maintenance Plans | 9 | $75.56 | 11.4 | $59.65 |
| **Total** | **152** | **$40.00** | **152.0** | **$40.00** |

Last-click attribution gives full credit to the final touch, which systematically flatters brand, because brand search is usually the last thing someone does before converting. A data-driven model distributes credit across the touchpoints, moving conversions out of brand and into the non-brand campaigns that created the demand. The total is unchanged, the business is unchanged, and AC Repair moves from $74.42 to $61.66, from missing its $60 target to nearly hitting it.

Two rules follow. **Pick one model and report it consistently.** Switching models between months, or quoting whichever model makes the campaign look best, is a form of lying with true numbers. **When you do change models, restate history** so the trend line is comparable, and say in the report that you changed it.

## From Analysis to Action

Analysis that does not end in a decision is a hobby. Use this mapping. Impression share figures are assumed for this example and would come from the account's own reporting.

| Campaign | Search IS | Lost IS (budget) | Lost IS (rank) |
| --- | --- | --- | --- |
| Brand - Northgate | 95% | 1% | 4% |
| Non-brand - AC Repair | 61% | 6% | 33% |
| Non-brand - Furnace Install | 53% | 21% | 26% |
| Non-brand - Maintenance Plans | 47% | 39% | 14% |

| What you observe | Most likely cause | Action | Applies to |
| --- | --- | --- | --- |
| High CPA, low conversion rate, normal CPC | Landing page or offer | Rewrite the page, test a stronger offer, check message match | Furnace Install (6.74% conv rate) |
| High CPA, high CPC, healthy conversion rate | Bids, keyword choice, or quality signals | Tighten match types, add negatives, improve ad relevance, lower bids | AC Repair ($8.21 CPC, 11.03% conv rate) |
| Low volume, high lost IS to budget | Money | Raise the budget, but only if CPA clears the target | Maintenance Plans (39% lost to budget) |
| Low volume, high lost IS to rank | Bids or quality | Raise bids or improve quality; verify the extra clicks still clear break-even | AC Repair (33%), Furnace Install (26%) |
| Good CPA, low volume, low lost IS | Demand ceiling | Do not raise bids; expand keywords, geography, or channel | Brand (95% IS, nothing left to buy) |
| Strong ROAS, negative contribution | Margin | Recompute break-even ROAS; cut, reprice, or raise AOV | Loom and Larder at 1.6 ROAS |

The diagnosis rule underneath the table: **decompose CPA into its two factors before acting.** CPA equals CPC divided by conversion rate. A high CPA is either an expensive click or a weak page, and the two have completely different fixes. Furnace Install's $133.33 comes from a $8.99 CPC divided by a 6.74 percent conversion rate. AC Repair's $74.42 comes from a $8.21 CPC divided by an 11.03 percent conversion rate. Same auction, same market; the difference is almost entirely on the page.

## A Worked Reallocation

The obvious move, and the wrong one, is to take $500 a month from Furnace Install, the worst CPA in the account, and give it to AC Repair. Forecast it.

```txt
FURNACE INSTALL loses $500 (new spend $1,100)
  Clicks       = $1,100 / $8.99 = 122.4
  Conversions  = 122.4 x 6.742% = 8.25
  Gross profit = 8.25 x $432    = $3,564
  Contribution = $3,564 - $1,100 = $2,464
  Change       = $2,464 - $3,584 = -$1,120

AC REPAIR gains $500 (new spend $3,700)
  Marginal clicks cost more than average because you are buying
  further into the auction. Assume marginal CPC is 15% above
  average: $8.21 x 1.15 = $9.44.
  Extra clicks      = $500 / $9.44 = 53.0
  Extra conversions = 53.0 x 11.026% = 5.84
  Extra gross profit = 5.84 x $108 = $631
  Change            = $631 - $500  = +$131

NET CHANGE = -$1,120 + $131 = -$989 per month
```

The intuitive optimization destroys about $990 a month of contribution, roughly 7 percent of the account's total, because it moves money from $432 leads into $108 leads. **Defend not doing it.**

Now run the reverse, which the impression share table supports because Furnace Install is losing 21 percent of its impression share to budget.

```txt
AC REPAIR loses $500 (new spend $2,700)
  Clicks       = $2,700 / $8.21 = 328.9
  Conversions  = 328.9 x 11.026% = 36.3
  Gross profit = 36.3 x $108    = $3,920
  Contribution = $3,920 - $2,700 = $1,220
  Change       = $1,220 - $1,444 = -$224

FURNACE INSTALL gains $500 (new spend $2,100)
  Marginal CPC assumed 15% above average: $8.99 x 1.15 = $10.34
  Extra clicks      = $500 / $10.34 = 48.4
  Extra conversions = 48.4 x 6.742%  = 3.26
  Extra gross profit = 3.26 x $432   = $1,408
  Change            = $1,408 - $500  = +$908

NET CHANGE = -$224 + $908 = +$684 per month
```

State the uncertainty honestly, because two assumptions are doing real work. If Furnace Install's marginal CPC is 40 percent above average rather than 15 percent, the gain drops to about +$434. If the incremental Furnace clicks convert 20 percent worse than the existing ones, which is likely since you are buying lower-intent inventory, the gain drops again. With both pessimistic assumptions the net is about +$200. So: **expected +$684 per month, plausible range roughly +$200 to +$900, and since Furnace Install produces only 12 leads a month, a single month of data will not confirm or refute this.** Commit to reviewing it over a full quarter and to reversing it if contribution falls.

The deeper move, which the analysis also supports, is that AC Repair's real problem is a 33 percent lost impression share to rank on a campaign whose CPA already misses target. Buying more of it is not the fix. Fixing the click cost and the page is.

## Reporting to a Business Owner

A monthly performance report should contain, in this order:

1. **The one-paragraph verdict.** The only part most clients read.
2. **The money table.** Spend, leads, cost per lead, estimated gross profit, contribution, by campaign. Not impressions. Not CTR.
3. **What changed this month and why**, with the arithmetic behind each change.
4. **What you propose next month**, with a forecast and a stated uncertainty.
5. **What you do not know**, including which numbers rest on assumptions the client supplied.
6. **Appendix.** Every diagnostic metric, for whoever wants it.

The verdict for Northgate's month, written the way you would actually send it:

> The account produced 152 leads for $6,080 in October, an average of $40 per lead. After running those leads through your close rates and job margins, we estimate they generated about $20,300 in gross profit, leaving roughly $14,200 after ad costs. The strongest line is furnace replacement: it looks expensive at $133 per lead, but a replacement lead is worth about $432 to you, so it returned close to $3,600. The weakest is AC repair, which took over half the budget and returned about $1,400, because clicks there cost $8.21 and the page converts at 11 percent. Next month I want to move $500 from AC repair into furnace replacement, which I expect to add somewhere between $200 and $900 in monthly contribution, and I want to rebuild the AC repair page. One caution: the brand campaign accounts for most of the reported return, and some of those customers would have found you without the ad, so the true figure is lower than $14,200. I would like to run a test to find out how much lower.

Notice what that paragraph does. It leads with money, not clicks. It states the arithmetic in plain words. It names the weakest line rather than hiding it. It gives a forecast with a range instead of a point estimate. And it volunteers the one fact that makes the agency's own numbers look worse.

That last one is the ethical duty of this job. You are the only person in the room who understands where these numbers come from, which means you are the only person who can cherry-pick them, which means the honesty has to come from you. Do not report ROAS when contribution is negative. Do not switch attribution models to rescue a bad month. Do not quote the blended CPA when it is being carried by brand. Do not present a 3 percent movement as a trend. Clients forgive a bad month. They do not forgive discovering, eighteen months in, that the reporting was designed to protect the retainer.

## Practice

Spreadsheet work only. No live spend, no campaign changes.

Northgate's following month, which spans the first freeze of the winter, produced the report below. Furnace Repair is a new campaign. Lead types follow the same rule as before: **Brand, AC Repair, Furnace Repair, and Maintenance produce repair leads; Furnace Install produces replacement leads.**

| Campaign | Spend | Clicks | Avg CPC | Conv | Lost IS (budget) | Lost IS (rank) |
| --- | --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $710 | 371 | $1.91 | 101 | 2% | 6% |
| Non-brand - AC Repair | $2,400 | 291 | $8.25 | 30 | 4% | 31% |
| Non-brand - Furnace Repair | $1,900 | 214 | $8.88 | 26 | 22% | 18% |
| Non-brand - Furnace Install | $2,100 | 227 | $9.25 | 14 | 9% | 27% |
| Non-brand - Maintenance Plans | $540 | 118 | $4.58 | 6 | 41% | 12% |
| **Total** | **$7,650** | **1,221** | **$6.26** | **177** | — | — |

Funnel figures, unchanged: 60 percent of leads book; repair job $410 revenue and $180 gross profit; replacement job $8,500 revenue and $2,400 gross profit with an 18 percent close rate. Repair lead value $108, replacement lead value $432. Target CPA $60 on repair leads and $180 on replacement leads.

1. **Compute the derived metrics for every campaign and for the account.** Conversion rate, CPA, revenue, gross profit, contribution, and ROAS. Show the division for each. Confirm that the sum of campaign contributions equals total gross profit minus total spend; if it does not, find your rounding error.
2. **Rank the campaigns two ways**: by CPA and by contribution. Write one sentence explaining why the two rankings disagree.
3. **Compute break-even ROAS** for repair work and for replacement work from the margins given, and state for each campaign whether its ROAS clears its own break-even.
4. **Write a diagnosis for each campaign** using the framework table in this lesson. Name the observation, the likely cause, and the action. Use the impression share columns. Decompose at least two CPAs into CPC and conversion rate to justify the diagnosis.
5. **Adjust brand for incrementality.** Assume 70 percent of brand leads would have arrived organically. Recompute brand's incremental CPA and incremental contribution, and restate the account's total contribution on that basis. State how much lower the honest number is.
6. **Propose a budget reallocation** of at least $500 a month between two campaigns. Forecast the contribution change with explicit arithmetic, using a marginal CPC assumption you state and defend. Give a range, not a single number, and say what would make you reverse the decision.
7. **Explain the blended CPA.** The account's blended CPA is $43.22, up from $40.00 last month. Compute how much of that movement is explained by the mix of campaigns changing rather than by any campaign getting worse. Show your working.
8. **Draft the one-paragraph client verdict.** Under 200 words, no jargon, leading with money. It must name the weakest campaign, contain one forecast with a range, and disclose one thing you do not know.

Submit the spreadsheet with formulas visible, the written diagnoses, and the verdict paragraph.
