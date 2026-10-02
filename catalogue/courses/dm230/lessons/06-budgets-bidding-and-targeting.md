---
lesson_id: dm230-06
course_id: dm230
pathway: digital-marketer
title: Budgets, Bidding, and Targeting
order: 6
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Set budgets, bidding strategies, and targeting for a stated campaign goal
---

## Two Different Ways to Be Wrong About Money

There are two knobs in a paid search account that control how much you spend and who you spend it on, and beginners conflate them constantly. The budget is a ceiling on total outflow. The bid is a price you are willing to pay per unit of attention. They fail differently, they are diagnosed differently, and they are fixed differently.

A campaign that is budget-limited stops showing at 3pm because the money ran out. A campaign that is bid-limited shows all day and loses most of its auctions. Both look like "not enough traffic" in a weekly report. If you raise the budget on a bid-limited campaign, nothing happens: there was already unspent budget. If you raise the bid on a budget-limited campaign, you get fewer clicks at a higher price and burn through the budget even earlier. Getting this diagnosis right is the difference between an account that improves and one that thrashes.

Targeting is the third leg. Budget says how much, bidding says how much per auction, and targeting says which auctions you are eligible for at all. A perfect bid strategy pointed at the wrong 25 miles of the map spends efficiently on people who will never buy from you.

This lesson works entirely against Northgate Heating & Air: a residential HVAC contractor in the Columbus, Ohio metro, servicing a 25-mile radius from a single shop, running four search campaigns on a total budget of $200 a day.

## What a Daily Budget Actually Is

The number you type into a campaign's daily budget field is not a hard daily cap. It is an input to a monthly calculation.

Google multiplies your daily budget by 30.4 (the average days in a month) to get your monthly charging limit. At $200 a day:

```txt
Daily budget:              $200.00
Average days per month:      30.4
Monthly charge ceiling:    $200.00 x 30.4 = $6,080.00
```

Within that month, Google may spend up to twice your daily budget on any single day. On a hot Tuesday in July when everyone's AC dies at once, a $200/day campaign can legitimately charge you $400. It compensates by spending less on slow days, and if the month ends with you having been charged more than $6,080, the difference is credited back as an overdelivery adjustment. The month is the unit of truth. The day is a pacing hint.

Two practical consequences. First, do not panic and cut the budget the morning after a $380 day; you will only starve the rest of the month. Second, the 2x cap is a real ceiling on how much you can capture in a demand spike. If the first freeze produces five times normal demand, a $200/day budget cannot spend more than $400 that day no matter how much profitable demand exists. Capturing a spike requires raising the daily budget in advance, which is the seasonality problem we get to at the end.

Also note where the budget lives. In Google Ads a budget is set at the campaign level, not the ad group level. Ad groups inside a campaign compete for the same pool. If you want to guarantee that furnace install spend cannot be eaten by AC repair spend, they must be separate campaigns. That is a structure decision (covered in lesson 03) with a direct budget consequence.

## What $200 a Day Actually Buys

A budget is meaningless until you convert it into clicks, then leads, then jobs. Do this arithmetic before you launch anything, for every ad group, using the ad group's own CPC and conversion rate. Northgate's benchmarks:

| Ad group | Avg CPC | CTR | Conversion rate | Lead type | Lead value |
| --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $1.90 | 22% | 28% | Repair | $108 |
| Non-brand - AC Repair | $8.20 | 6.4% | 11% | Repair | $108 |
| Non-brand - Furnace Install | $8.99 | 4.1% | 6.7% | Replacement | $432 |
| Non-brand - Maintenance Plans | $4.79 | 6.3% | 6.3% | Repair | $108 |

The Maintenance Plans conversion rate is derived from the canonical 30-day report (9 conversions on 142 clicks = 6.34%, rounded to 6.3%); its CTR of 6.3% is an assumption, since that figure is not in the report.

Now put the whole $200 into each one, hypothetically, to see what a dollar is worth in each place.

AC Repair at $8.20 CPC:

```txt
Clicks per day     = $200.00 / $8.20   = 24.39  -> about 24 clicks/day
Leads per day      = 24.39 x 0.11      = 2.68   -> about 2.7 leads/day
Leads per month    = 2.68 x 30.4       = 81.5   -> about 80 leads/month
CPA                = $8.20 / 0.11      = $74.55
Contribution/lead  = $108.00 - $74.55  = $33.45
Monthly contribution = 81.5 x $33.45   = $2,726
```

Furnace Install at $8.99 CPC:

```txt
Clicks per day     = $200.00 / $8.99   = 22.25  -> about 22 clicks/day
Leads per day      = 22.25 x 0.067     = 1.49
Leads per month    = 1.49 x 30.4       = 45.3   -> about 45 leads/month
CPA                = $8.99 / 0.067     = $134.18
Contribution/lead  = $432.00 - $134.18 = $297.82
Monthly contribution = 45.3 x $297.82  = $13,491
```

Brand at $1.90 CPC:

```txt
Clicks per day     = $200.00 / $1.90   = 105.26
Leads per day      = 105.26 x 0.28     = 29.47
Leads per month    = 29.47 x 30.4      = 896
CPA                = $1.90 / 0.28      = $6.79
```

Maintenance Plans at $4.79 CPC:

```txt
Clicks per day     = $200.00 / $4.79   = 41.75
Leads per day      = 41.75 x 0.063     = 2.63
Leads per month    = 2.63 x 30.4       = 79.9  -> about 80 leads/month
CPA                = $4.79 / 0.063     = $76.03
Contribution/lead  = $108.00 - $76.03  = $31.97
```

Two things fall out immediately. Furnace Install returns more contribution per dollar than anything else, because a replacement lead is worth four times a repair lead. And the Brand number is fiction. There are not 896 people a month searching "northgate heating air" in Columbus. Brand is limited by how many people already know the name, not by budget. The canonical 30-day report shows Brand actually delivered 316 clicks and 88 conversions on $600 of spend. Any budget above roughly $20/day on Brand simply goes unspent.

That is the first lesson of budget arithmetic: the calculation gives you a ceiling, and then market inventory gives you the real number. Always check the arithmetic against the impression share data before you believe it.

## Working Backwards From a Goal Instead of Forwards From a Budget

Most budget planning runs forwards: here is $200 a day, what do we get? The more useful direction is backwards: here is what we need, what does it cost?

Northgate's owner says: "We need 40 replacement leads next month. Install crews are idle."

```txt
Target replacement leads:                          40
Furnace Install conversion rate:                   6.7%
Clicks required        = 40 / 0.067              = 597.0 clicks
Cost at $8.99 CPC      = 597.0 x $8.99           = $5,367.03
Implied CPA            = $5,367.03 / 40          = $134.18
```

Now hold that against reality. The total monthly budget is $6,080. This single goal consumes $5,367, which is 88% of everything, leaving $713 for brand defense, emergency repair, and maintenance plans combined during a month when repair revenue also has to happen. The goal and the budget are not compatible.

Note carefully that the goal is not unprofitable. A $134.18 CPA on a lead worth $432 is well inside the $180 target CPA. Contribution per lead is $432.00 - $134.18 = $297.82. Forty of them is $11,913 in gross profit contribution. The economics are excellent. The problem is that the budget cannot fund it and still fund the rest of the business.

Then check the second constraint: is the traffic even available? Suppose the Furnace Install search impression share is 34%. Current delivery is 178 clicks a month.

```txt
Clicks at 34% impression share:            178
Clicks at 100% impression share (est.)   = 178 / 0.34 = 523.5
Maximum leads at 100% IS                 = 523.5 x 0.067 = 35.1
```

Even if Northgate won every single available auction and spent whatever it took, this market produces about 35 furnace install leads a month, not 40. The goal is not merely expensive, it is arithmetically unreachable inside 30 days on this channel.

So one of the inputs has to change, and you present the owner with the options and their prices rather than nodding and running out of money on day 22:

1. **Move the timeline.** 40 leads over six weeks instead of four. At $134.18 per lead that is $5,367 spread over 45 days, or $119/day dedicated to Furnace Install. Still hard alongside everything else, but not impossible.
2. **Move the conversion rate.** Lift the Furnace Install landing page from 6.7% to 7.7% and the required clicks drop to 40 / 0.077 = 519.5, which fits inside the 523-click ceiling. This is the cheapest lever available and it is why lesson 09 exists.
3. **Move the goal.** 30 replacement leads costs 30 / 0.067 = 447.8 clicks x $8.99 = $4,025.70, which fits the budget with $2,054 left for everything else and is comfortably inside available inventory.
4. **Move the budget.** Ask for the extra money explicitly, with the contribution arithmetic attached. Forty leads producing $11,913 in contribution is a good trade for $5,367 in spend, if the cash exists.
5. **Add a channel.** Replacement demand can be created, not just captured. That is the paid social conversation in lesson 07.

The habit to build is this: never accept a target without immediately dividing it by a conversion rate and multiplying by a CPC. Ninety seconds of arithmetic converts an impossible request into a negotiation with numbers on both sides.

## Allocating a Fixed $200 a Day Across Four Campaigns

Given $200/day and four campaigns, you have to split it. Here is a defensible split, expressed both ways:

| Campaign | Daily budget | Monthly (x30.4) | Share |
| --- | --- | --- | --- |
| Brand - Northgate | $19.74 | $600 | 9.9% |
| Non-brand - AC Repair | $105.26 | $3,200 | 52.6% |
| Non-brand - Furnace Install | $52.63 | $1,600 | 26.3% |
| Non-brand - Maintenance Plans | $22.37 | $680 | 11.2% |
| **Total** | **$200.00** | **$6,080** | **100%** |

Now defend it, which means showing the contribution each slice produces, using the canonical 30-day report.

| Campaign | Spend | Conv | Lead value | Gross profit | CPA | Contribution | Contribution per $1 spent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $600 | 88 | $108 | $9,504 | $6.82 | $8,904 | $14.84 |
| Non-brand - AC Repair | $3,200 | 43 | $108 | $4,644 | $74.42 | $1,444 | $0.45 |
| Non-brand - Furnace Install | $1,600 | 12 | $432 | $5,184 | $133.33 | $3,584 | $2.24 |
| Non-brand - Maintenance Plans | $680 | 9 | $108 | $972 | $75.56 | $292 | $0.43 |
| **Total** | **$6,080** | **152** | | **$20,304** | **$40.00** | **$14,224** | **$2.34** |

Read the last column. Every dollar into Brand returns $14.84 in contribution, but Brand is capped at about $600 by how many people search the name. Every dollar into Furnace Install returns $2.24 and there is unexploited inventory (34% impression share). Every dollar into AC Repair returns $0.45, and Maintenance Plans returns $0.43.

The defense of the split therefore reads like this:

- **Brand gets exactly what it can spend and no more.** Fund it fully, cap it near observed demand, and never let it compete for budget with the campaigns that can actually absorb money. A brand campaign that runs out of budget at noon is an unforced error; it is the cheapest contribution in the account.
- **Furnace Install is underfunded relative to its marginal return.** It has the second-best contribution per dollar and 66% of its impressions are unwon. If any campaign should get incremental money, it is this one.
- **AC Repair gets the largest share anyway**, because it is the volume engine and the operational backbone. Repair jobs keep technicians paid and feed the replacement funnel: a technician standing in front of a 16-year-old furnace is the best replacement lead source Northgate has. Judged purely on contribution per dollar it looks weak; judged as the top of the replacement pipeline it earns its slice. Say that out loud in the plan rather than letting it be an accident.
- **Maintenance Plans gets the smallest slice** and is on probation. $292 of monthly contribution barely clears the cost of managing it. It survives because maintenance customers become repair and replacement customers, not because of its own arithmetic.

A budget allocation you cannot defend in this form is not an allocation, it is a habit.

## Capped by Budget Versus Capped by Rank

Impression share metrics tell you which failure you have. Search impression share, search lost impression share (budget), and search lost impression share (rank) sum to 100%.

| Campaign | Search IS | Lost IS (budget) | Lost IS (rank) |
| --- | --- | --- | --- |
| Brand - Northgate | 82% | 1% | 17% |
| Non-brand - AC Repair | 41% | 22% | 37% |
| Non-brand - Furnace Install | 34% | 3% | 63% |
| Non-brand - Maintenance Plans | 29% | 0% | 71% |

**Lost IS (budget)** means you were eligible and would have won, but the campaign was out of money. The fix is more money, or the same money spread better (tighter schedule, tighter geography, fewer keywords).

**Lost IS (rank)** means you were in the auction and lost on Ad Rank. The fix is a higher bid, or better quality signals, or both. Ad Rank is bid multiplied by quality signals (lesson 02), so raising quality is the cheaper of the two fixes when it is available.

Read the table. AC Repair is losing 22 points to budget. Furnace Install is losing 63 points to rank and essentially nothing to budget: pouring money in would do nothing at current bids. Maintenance Plans is losing 71 points to rank with zero budget loss, which means its bids or its quality are far below the competitive set.

**Which do you fix first?** Fix rank problems before budget problems, for one arithmetic reason: raising a budget on a campaign whose average CPA is already at your target adds volume at roughly the current CPA, but raising a bid changes the CPA of every click including the ones you were already winning. That makes bid changes higher-risk and higher-leverage, so you want to know their effect before you scale spend on top of them.

The exception is when a campaign is both cheap and budget-capped, which is exactly AC Repair. Its CPA is $74.42 against a break-even of $108, so every additional lead carries $33.58 of contribution. Estimate the size of the opportunity:

```txt
Current: 41% IS, 390 clicks, 43 conv, $3,200 spend
Clicks if IS rose to 63% (recover the budget loss):
   390 x (63 / 41)             = 599.3 clicks
Additional clicks              = 599.3 - 390 = 209.3
Additional spend at $8.21      = 209.3 x $8.21 = $1,718.35
Additional conv at 11%         = 209.3 x 0.11 = 23.0
Additional contribution        = 23.0 x $33.58 = $772.34
```

Roughly $1,718 more spend to earn roughly $772 more contribution. Worth doing, with one honest caveat: marginal clicks are usually worse than average clicks. The impressions you are currently losing to budget skew toward late-day and lower-intent queries, so a realistic marginal CPA is 15% to 25% worse than the $74.42 average. At a 20% worse marginal CPA of $89.30, contribution per marginal lead falls to $108.00 - $89.30 = $18.70, and 23 leads produce $430 rather than $772. Still positive. Still worth funding. But quote the pessimistic number when you ask for the money.

## The Bid Strategies, One at a Time

Every bid strategy answers a single question: given this auction, what should we pay? They differ in what they optimize and what data they require to do it.

| Strategy | Optimizes for | Data required | Main risk |
| --- | --- | --- | --- |
| Manual CPC | Nothing. You set a max CPC per keyword or ad group. | None | You cannot adjust per auction, so you leave money on the table in both directions |
| Maximize clicks | The largest number of clicks the budget will buy | None | Buys cheap, low-intent clicks; ignores whether anyone converts |
| Maximize conversions | The largest number of conversions the budget will buy | Working conversion tracking, some conversion history | Will spend the full budget regardless of CPA; no cost ceiling |
| Target CPA | Conversions at an average cost you specify | Roughly 30 conversions in the trailing 30 days | Set too low, delivery collapses; set too high, you overpay |
| Maximize conversion value | The largest total conversion value the budget will buy | Conversion values assigned per action | Garbage values produce garbage bids |
| Target ROAS | A ratio of conversion value to spend | Values plus roughly 50 conversions in 30 days | Same as above, plus a much higher data bar |
| Target impression share | A share of impressions at a chosen position | None | Ignores conversions entirely; will pay almost anything |

A few notes that matter more than the table.

**Maximize clicks is not a conversion strategy.** It optimizes for the cheapest clicks available, which on a non-brand HVAC campaign means informational queries and cheap late-night traffic. It has one legitimate use: a brand-new campaign with zero conversion history where you need traffic in order to learn anything at all. Always pair it with a max CPC cap, because without one it will happily discover a $0.40 click that converts at 0%.

**Maximize conversions has no cost ceiling.** It spends your daily budget every day and tries to buy as many conversions as that money allows. That is fine when your budget is the real constraint and your break-even CPA is comfortably above whatever it produces. It is dangerous when you have a hard CPA requirement, because nothing in the strategy is trying to hit one.

**Target CPA is maximize conversions with a price constraint.** The system bids up on auctions it thinks will convert and bids down on ones it does not, aiming for your average. It is the workhorse for lead generation with a known lead value.

**Target ROAS is target CPA for businesses whose conversions are not all worth the same.** Northgate's are not: a repair lead is worth $108 and a replacement lead is worth $432. If you feed those values into the conversion actions, a value-based strategy will correctly bid four times as hard for a replacement lead. That is genuinely better than tCPA, which would treat all leads as interchangeable. The catch is the data requirement.

**Target impression share is a defensive tool, not an efficiency tool.** It buys position and nothing else. Its correct home is a brand campaign where you want to sit above a competitor bidding on your name and you already know the CPA is trivially low. Always attach a maximum CPC bid limit. Without one, a competitor who raises their bid drags yours up with no ceiling.

## The Conversion Volume Prerequisite

Automated bidding is a statistical model. Models need observations. The working rule of thumb is that a target-based strategy needs roughly 30 conversions in the trailing 30 days at the level the strategy runs, and value-based targeting wants closer to 50. Below that the model is fitting noise and your results will swing wildly for reasons that have nothing to do with your target.

Apply the test to Northgate directly from the canonical 30-day report:

| Campaign | Conv / 30 days | Conv / day | Meets ~30 threshold? | Days to accumulate 30 conv |
| --- | --- | --- | --- | --- |
| Brand - Northgate | 88 | 2.93 | Yes, comfortably | 10.2 |
| Non-brand - AC Repair | 43 | 1.43 | Yes | 21.0 |
| Non-brand - Furnace Install | 12 | 0.40 | No | 75.0 |
| Non-brand - Maintenance Plans | 9 | 0.30 | No | 100.0 |

A campaign producing 9 conversions in 30 days cannot support target CPA. At 0.30 conversions per day, the model would need 100 days to see 30 events, by which time the season has changed and the data is stale. If you set a tCPA on it anyway, you will get a strategy making confident-looking decisions on almost no evidence: three good days followed by two weeks of near-zero delivery.

So the recommendation set for Northgate is:

| Campaign | Conv/30d | Strategy | Setting |
| --- | --- | --- | --- |
| Brand - Northgate | 88 | Target impression share | Absolute top, 80% share, max CPC bid limit $3.50 |
| Non-brand - AC Repair | 43 | Target CPA | $60, adjusted no more than 15% per change |
| Non-brand - Furnace Install | 12 | Maximize conversions, no target | Budget-capped at $52.63/day; revisit at 30 conv/30d |
| Non-brand - Maintenance Plans | 9 | Manual CPC | Max CPC $5.00, tight negatives, monthly review |

Two ways to escape the volume trap, both with caveats.

**Portfolio bid strategies** pool conversions across campaigns. Furnace Install plus Maintenance Plans is 12 + 9 = 21 conversions in 30 days, still short of 30. Adding AC Repair gets you 43 + 12 + 9 = 64, which clears the bar. But a single tCPA across that portfolio would treat a $432 replacement lead identically to a $108 repair lead and bid the same for both, which destroys the exact economics you are trying to protect. Pooling only works when the pooled conversions are worth the same.

**Value-based bidding** solves that. Assign $108 to repair-lead conversion actions and $432 to the replacement-lead action, then run maximize conversion value across the non-brand portfolio. Now 64 conversions of mixed value are a legitimate pool because the system knows they are not interchangeable. Note what happens to the target arithmetic when your conversion values are entered as gross profit rather than revenue: break-even ROAS becomes 1.00, not 1 divided by your margin. At a $60 target CPA on a $108 lead, the equivalent target ROAS is $108 / $60 = 1.80. On a replacement lead at a $180 target, it is $432 / $180 = 2.40. A single blended tROAS between 1.80 and 2.40 is a compromise; pick 2.00 and watch the mix.

That entire structure depends on the conversion values being right and the conversions actually firing. Every automated bid strategy is exactly as good as the conversion data feeding it, and no better. Lesson 08 is where you learn to make that data trustworthy; until then, treat any automated strategy result as provisional.

## Setting a Target CPA That Is Honest

Derive the target from the economics, not from a feeling.

```txt
Repair lead gross profit value:                     $108.00
Desired contribution per lead:                      $ 48.00
Target CPA = $108.00 - $48.00                     = $ 60.00
```

That is where Northgate's $60 comes from. It is not "what we can afford," it is "what leaves $48 on the table after media." Break-even is $108; anything below that is technically profitable, and the $48 is a policy decision about how much of the margin the business wants to keep rather than reinvest into growth.

Now stress-test it. What happens if you set the target somewhere else? Work from the implied maximum CPC, since a target CPA is really a statement about what you will pay per click:

```txt
Implied max CPC = target CPA x conversion rate
At 11% conversion rate:
   tCPA $35  ->  $35 x 0.11 = $3.85
   tCPA $50  ->  $50 x 0.11 = $5.50
   tCPA $60  ->  $60 x 0.11 = $6.60
   tCPA $75  ->  $75 x 0.11 = $8.25   (roughly today's $8.21 CPC)
   tCPA $95  ->  $95 x 0.11 = $10.45
```

Today's average CPC on AC Repair is $8.21, which means today's de facto target is about $75. Anything materially below that requires bidding less than you currently do, and bidding less means losing auctions. Here is a modeled scenario table. The click and conversion columns are estimates, not measurements, so treat them as a shape rather than a forecast:

| tCPA | Implied max CPC | Est. clicks/mo | Est. conv | Est. spend | Actual CPA | Contribution/lead | Total contribution |
| --- | --- | --- | --- | --- | --- | --- | --- |
| $35 | $3.85 | 95 | 10 | $352 | $35.20 | $72.80 | $728 |
| $50 | $5.50 | 190 | 20 | $1,007 | $50.35 | $57.65 | $1,153 |
| $60 | $6.60 | 250 | 27 | $1,590 | $58.89 | $49.11 | $1,326 |
| $75 (today) | $8.25 | 390 | 43 | $3,200 | $74.42 | $33.58 | $1,444 |
| $95 | $10.45 | 520 | 55 | $5,226 | $95.02 | $12.98 | $714 |

Read down the tCPA $35 row. Bids fall from $8.21 to under $4.00, Northgate loses most of the auctions it currently wins, impression share collapses from 41% to something in the mid-teens, and monthly leads fall from 43 to about 10. Each of those 10 leads is beautifully cheap and carries $72.80 of contribution, and the business is still worse off: $728 of total contribution instead of $1,444. Efficiency at the expense of volume is not automatically a win.

Now read the tCPA $95 row. Volume rises to about 55 leads, but contribution per lead collapses to $108.00 - $95.02 = $12.98 and total contribution falls to $714. Also note the spend: $5,226 against an allocated budget of $3,200. The budget cap would stop it long before the target did, which means you would end up with a campaign that is simultaneously budget-limited and running a slack target, the worst of both worlds.

Is $12.98 a lead still worth doing? Sometimes. It is worth doing if those leads are genuinely incremental, if the crews have idle capacity that fixed costs are being paid for anyway, and if repair customers reliably become replacement customers later. It is not worth doing if $12.98 does not cover the office time to book the job, if the marginal leads are lower quality than the average (they usually are), or if the cash is needed elsewhere. Say which of those you believe and why.

The interesting result in that table is that total contribution peaks near today's $75, not at the "correct" $60. That is not a mistake. The contribution-maximizing CPA and the target CPA are different objects: the first maximizes this month's profit, the second reserves margin the business has decided it needs. Both are legitimate. You just have to know which one you are optimizing and say so.

## The Learning Period, and Why Fiddling Destroys Performance

When you switch bid strategies, or move a target by a meaningful amount, Google Ads enters a learning period, typically about seven days and sometimes up to two weeks. During it, performance is unstable by design: the system is deliberately exploring auctions it is unsure about in order to build a model.

The failure mode is a manager who checks on day three, sees CPA at $91 against a $60 target, panics, drops the target to $45, restarts learning, checks on day three again, sees CPA at $120 because delivery has gone sideways, and raises it back. That account is permanently in learning and will never produce a stable number. Every change resets the clock.

The arithmetic of why patience is required: AC Repair produces 1.43 conversions a day. A seven-day learning period is about 10 conversions. Ten conversions cannot distinguish a $60 CPA from a $75 CPA; the noise on that sample is larger than the difference you are trying to see. Even 14 days is only 20 conversions. Lesson 10 covers how to reason about sample size properly; for now, the operating rules:

1. Change a target no more than once every 14 days, and preferably every 21.
2. Change it by no more than 15% to 20% at a time. Going from $75 to $60 is a 20% cut, which is the largest single step you should take. If you want $60 and you are at $95, do $95, then $80, then $68, then $60.
3. Never change the target and the budget and the targeting in the same week. You will not know which one did it.
4. Do not judge a strategy inside its learning period. Judge it on the two weeks after learning ends.

## Bid Adjustments, and Where They Still Apply

Bid adjustments are percentage modifiers applied to bids for a device, location, time, or audience. They were the primary tuning mechanism when everyone bid manually. Under automated bidding, most of them are ignored, because the strategy is already making that judgment per auction with more signal than you have.

Under target CPA, maximize conversions, maximize conversion value, and target ROAS:

- **Device adjustments are ignored**, except for -100%, which still excludes the device entirely.
- **Ad schedule bid adjustments are ignored**, but the ad schedule itself still controls when ads are eligible to run at all.
- **Location bid adjustments are ignored**, but location targets and exclusions still control eligibility.
- **Audience bid adjustments are ignored in targeting mode and in observation mode**, but audience membership still feeds the model as a signal.
- **Demographic adjustments are ignored**, except -100% exclusions.

What still works under automated bidding: eligibility controls (what you target and exclude), seasonality adjustments for known short-term spikes, and data exclusions for periods when your tracking was broken. Under manual CPC and maximize clicks, every adjustment above still applies normally, which is one reason manual bidding remains defensible on low-volume campaigns like Maintenance Plans.

The practical takeaway: on automated campaigns, stop trying to express preferences as percentages and start expressing them as eligibility. If mobile converts twice as well, you do not need a +50% mobile adjustment; the strategy already knows. If a device converts so badly you would never want it, exclude it.

## Targeting: Geography

Northgate services a 25-mile radius from one shop. There are three ways to express that and they are not equivalent.

**Radius targeting** draws a circle. It is the closest match to a service area and it ignores administrative boundaries, which is correct: a customer 8 miles away in an unincorporated township is a fine customer.

**City or metro targeting** selects named places. It is easier to read in reports and it respects how people actually describe where they live, but it will include the far side of a large metro. The Columbus metro stretches well past 25 miles from any single point.

**Zip code targeting** is the most precise and the most work. It is the right choice when technician drive time genuinely differs by neighbourhood, or when some zips are affluent enough to skew toward replacement rather than repair.

For Northgate, use a 25-mile radius as the base, then layer zip-level exclusions for areas the shop refuses to drive to and zip-level reporting so you can see where the replacement leads come from.

Now the setting that leaks the most money. Location options offer two behaviours: **presence** (people in your targeted locations) and **presence or interest** (people in, or regularly in, or showing interest in your targeted locations). The second is the default in many setups, and it is what produces the classic leak: someone in Phoenix searching "AC repair Columbus Ohio" because they are researching a rental property, a relocation, or their parents' house. They match your location because of interest. They click. They never book.

Look at a location report for AC Repair over the canonical 30 days:

| Location | Clicks | Conv | Spend at $8.21 | CPA |
| --- | --- | --- | --- | --- |
| Columbus, OH metro (inside radius) | 291 | 37 | $2,389.11 | $64.57 |
| Delaware County, OH (inside radius) | 44 | 5 | $361.24 | $72.25 |
| Ohio, outside the 25-mile radius | 31 | 1 | $254.51 | $254.51 |
| Outside Ohio | 24 | 0 | $197.04 | n/a |
| **Total** | **390** | **43** | **$3,201.90** | **$74.46** |

The out-of-state row is $197.04 of pure waste in one month, $2,364 a year, on a campaign whose entire monthly budget is $3,200. The out-of-radius Ohio row is worse in a subtler way: one conversion at $254.51 is a lead the crew probably will not drive to.

Closing the leak takes three settings, in this order:

1. Set location options to **Presence: people in or regularly in your targeted locations**. This alone kills most of the out-of-state traffic.
2. Add **location exclusions** for the states and metros that keep appearing in the report. Exclusions apply on top of targeting.
3. Add city-name negative keywords for neighbouring metros that keep showing up in the search terms report. Cleveland, Cincinnati, Dayton. That belongs to keyword work (lesson 04), but it is the third layer of the same fence.

Then check the location report again in 30 days. Geography leaks reopen when you add campaigns, because settings do not always inherit.

## Targeting: Ad Schedule

Ad schedule controls the hours and days your ads are eligible. Here is AC Repair segmented by hour block over the canonical 30 days:

| Hour block | Clicks | Conv | Conv rate | Spend at $8.21 | CPA |
| --- | --- | --- | --- | --- | --- |
| 12am - 6am | 22 | 1 | 4.5% | $180.62 | $180.62 |
| 6am - 9am | 48 | 6 | 12.5% | $394.08 | $65.68 |
| 9am - 12pm | 78 | 11 | 14.1% | $640.38 | $58.22 |
| 12pm - 3pm | 84 | 10 | 11.9% | $689.64 | $68.96 |
| 3pm - 6pm | 76 | 8 | 10.5% | $623.96 | $77.99 |
| 6pm - 9pm | 58 | 5 | 8.6% | $476.18 | $95.24 |
| 9pm - 12am | 24 | 2 | 8.3% | $197.04 | $98.52 |
| **Total** | **390** | **43** | **11.0%** | **$3,201.90** | **$74.46** |

The shape is exactly what you would expect from a business where a lead is mostly a phone call: mornings convert because someone answers the phone, evenings and overnight convert worse because nobody does. The 9am to 12pm block converts at 14.1% and costs $58.22 per lead, already under the $60 target. The overnight block costs $180.62 per lead, well above the $108 break-even.

But be careful here, because this is exactly where beginners fabricate certainty. The overnight block has **one conversion on 22 clicks**. One. If that single caller had not rung, the block's conversion rate would be 0%; if two had, it would be 9.1%, which is unremarkable. You cannot make a -50% decision on one event. The 9pm to midnight block has two conversions on 24 clicks and is no better.

The honest procedure:

1. Aggregate to 90 days before making hour-level decisions, so the thin cells have enough volume to mean something.
2. Prefer coarse blocks over 24 individual hours. Seven blocks with 20 to 90 clicks each are already thin; 24 hourly rows would be almost pure noise.
3. Make structural decisions where the mechanism is obvious, not just where the number is extreme. Northgate does not answer the phone between midnight and 6am, so a lead generated then is a voicemail. That is a reason to act, and it does not depend on the sample.

Given all that, the schedule change to make is not a bid adjustment (which automated bidding ignores anyway) but an eligibility change and an operational one:

- Keep ads running overnight only if there is call forwarding or an after-hours answering service, because emergency HVAC calls at 2am are real and lucrative when someone picks up.
- If there is no after-hours coverage, turn the schedule off from midnight to 5am and redirect that $180 a month into the 9am to noon block where CPA is $58.22.
- On a manual-bid campaign like Maintenance Plans, a -20% adjustment on the 6pm to midnight window is legitimate and will actually apply.

## Targeting: Device

Segment the same campaigns by device.

AC Repair, 30 days:

| Device | Clicks | Conv | Conv rate | Spend at $8.21 | CPA |
| --- | --- | --- | --- | --- | --- |
| Mobile | 289 | 35 | 12.1% | $2,372.69 | $67.79 |
| Desktop | 78 | 6 | 7.7% | $640.38 | $106.73 |
| Tablet | 23 | 2 | 8.7% | $188.83 | $94.42 |
| **Total** | **390** | **43** | **11.0%** | **$3,201.90** | **$74.46** |

Furnace Install, 30 days:

| Device | Clicks | Conv | Conv rate | Spend at $8.99 | CPA |
| --- | --- | --- | --- | --- | --- |
| Mobile | 96 | 5 | 5.2% | $863.04 | $172.61 |
| Desktop | 68 | 7 | 10.3% | $611.32 | $87.33 |
| Tablet | 14 | 0 | 0.0% | $125.86 | n/a |
| **Total** | **178** | **12** | **6.7%** | **$1,600.22** | **$133.35** |

The two tables tell opposite stories and both are believable. Emergency repair is a mobile behaviour: the AC dies, you are standing in a hot house, you search on your phone and you tap the call button. Seventy-four percent of AC Repair clicks are mobile and they convert at 12.1%.

Replacement is a research behaviour: an $8,500 purchase gets discussed at a kitchen table on a laptop, often with a spouse, often across several sessions. Desktop is 38% of Furnace Install clicks but 58% of its conversions, and desktop CPA is half of mobile CPA.

What to do with that:

- On AC Repair, make sure the mobile experience is genuinely a call. A click-to-call asset, a phone number in the header, a form that is thumb-friendly, page load fast enough that a person in a hot house does not bounce. Do not exclude desktop; at $106.73 it is still under the $108 break-even.
- On Furnace Install, do not exclude mobile either, even at $172.61 against a $180 target, because mobile is frequently the first touch in a multi-session replacement research path and the last-click report undercounts it. Do consider a separate mobile experience whose primary action is "text us a photo of your unit" rather than "book an appointment," because the mobile visitor is not ready to book.
- Tablet is 6% and 8% of clicks respectively with almost no conversions. Not worth a decision either way. Leave it and stop looking at it.

## Targeting: Audiences

Audiences on search do not replace keywords. The keyword is still the intent signal. Audiences layer information about who the searcher is on top of what they searched.

**Observation mode** adds the audience to the campaign for reporting and, on manual bidding, for adjustment. It does not restrict who sees the ad. **Targeting mode** restricts delivery to members of that audience only. The default choice on search is observation, almost always. Targeting mode on a search campaign shrinks an already-small audience to a fraction of itself and usually starves delivery. Reserve it for genuinely narrow plays: a "current customers only" campaign promoting a maintenance plan renewal, for example.

The audience types worth knowing:

**Remarketing lists for search ads (RLSA)** are lists of people who have been to your site, applied to your search campaigns. Someone who visited the furnace replacement page last week and is now searching "furnace install cost columbus" is a very different prospect from a cold searcher. On observation you will see their conversion rate separately; on manual bidding you can bid up for them. Google requires a minimum list size for search (in the low thousands) before a list is usable, which is a real constraint for a single-location contractor. Northgate's replacement page visitors over 90 days may or may not clear it; check before you plan around it.

**Customer match** uploads a hashed customer list. For Northgate this is the most valuable list in the account: every past repair customer, segmented by the age of the equipment on file. A homeowner whose furnace was 14 years old at the last service visit is a replacement lead waiting to happen. Use it two ways: as an observation layer on Furnace Install to see how past customers convert, and as an exclusion on Maintenance Plans so you stop paying to acquire people who already have a plan.

**In-market segments** are Google's inference that someone is actively shopping a category. "HVAC systems" and "home improvement" are the relevant ones. Add them in observation to Furnace Install and watch whether in-market members convert at a materially different rate. They often do, and it is free information.

**Life event segments** cover things like "recently moved" and "recently purchased a home." These map directly onto Northgate's replacement funnel: a new homeowner inherits equipment they know nothing about, and the first cold snap in a new house is a classic replacement trigger. Layer "recently moved" onto Furnace Install and Maintenance Plans in observation. If the conversion rate justifies it, build a dedicated campaign with copy written for new homeowners.

**Detailed demographics** include homeownership status, which for a residential HVAC contractor is the single most useful demographic in the account. Renters do not buy furnaces. Excluding renters is one of the few demographic exclusions worth making, and -100% exclusions still apply under automated bidding.

Here is a sensible audience layer plan for Northgate:

| Campaign | Audience | Mode | Purpose |
| --- | --- | --- | --- |
| Non-brand - AC Repair | Site visitors, 30 days | Observation | Measure repeat-visit conversion lift |
| Non-brand - AC Repair | Customer match, past customers | Observation | Identify how much revenue is repeat business |
| Non-brand - Furnace Install | In-market: HVAC systems | Observation | Validate the segment before acting |
| Non-brand - Furnace Install | Life event: recently moved | Observation | Test the new-homeowner hypothesis |
| Non-brand - Furnace Install | Customer match, equipment 12+ years | Observation | Highest-value list in the account |
| Non-brand - Maintenance Plans | Customer match, existing plan holders | Exclusion | Stop paying to reacquire subscribers |
| All non-brand | Homeownership: renters | Exclusion | Renters do not buy HVAC systems |

## Seasonality and Budget Pacing

A flat $200 a day is wrong for this business, and it is wrong in a way that costs real money.

Northgate's demand is not evenly distributed. It spikes on the first genuinely hot week of summer and the first hard freeze of winter, and it collapses in the shoulder months when the weather is pleasant and nobody thinks about their furnace. A flat budget overspends in March, when clicks are cheap because nobody is bidding but nobody is buying either, and underspends in July, when a click is expensive because it is worth a lot.

Same annual money, redistributed:

| Month | Daily budget | Month total (x30.4) | Rationale |
| --- | --- | --- | --- |
| Jan | $180 | $5,472 | Cold-weather repair demand, post-holiday cash caution |
| Feb | $150 | $4,560 | Steady furnace repair, low replacement intent |
| Mar | $120 | $3,648 | Deepest shoulder month; harvest budget for summer |
| Apr | $150 | $4,560 | Early AC tune-up and maintenance plan season |
| May | $210 | $6,384 | Build maintenance plan volume ahead of the heat |
| Jun | $280 | $8,512 | First hot week; peak emergency repair |
| Jul | $280 | $8,512 | Sustained peak |
| Aug | $230 | $6,992 | Heat tapering, replacement conversations start |
| Sep | $150 | $4,560 | Shoulder month; harvest for the freeze |
| Oct | $200 | $6,080 | Pre-freeze furnace tune-ups and replacement planning |
| Nov | $260 | $7,904 | First freeze; peak furnace repair and replacement |
| Dec | $190 | $5,776 | Cold demand continues, holiday attention drops |
| **Total** | **avg $200** | **$72,960** | Identical annual spend to a flat $200/day |

The annual total is unchanged. The distribution is not. Roughly $8,000 has moved out of March and September and into June, July, and November.

Two mechanics worth calling out.

**Pulling budget forward for the freeze.** The first freeze is a three-to-five day event, and it produces four to six times normal emergency furnace demand. Your daily budget can only overdeliver to 2x, so a $260/day November budget can absorb at most $520 on the day of the freeze. If demand is 5x, you leave money on the table. The fix is to raise the daily budget in advance, based on the forecast, not in reaction. When the ten-day forecast shows the first sustained sub-freezing night, raise the furnace repair campaign's daily budget to $500 or $600 for that window and pull the money back out of the following two weeks. Practically: watch the forecast, act 48 hours out, revert once the spike passes.

**Seasonality adjustments for automated bidding.** Google Ads offers a seasonality adjustment where you tell the system to expect a conversion-rate change over a specific short window. This is the right tool for a known 3-day promotion or a known demand spike, and it prevents an automated strategy from spending the first two days of the spike learning that something changed. It is explicitly not for gradual seasonal trends; the model handles those on its own. Use it for the freeze week, not for "winter."

One more thing about pacing. Budgets do not roll over. Money unspent in March is gone, not banked. So a pacing plan is a plan you have to actually execute in the interface every month; putting it in a spreadsheet and forgetting it produces the flat budget you were trying to avoid.

## Where Automation Genuinely Beats You, and Where It Does Not

An honest accounting, because both overclaiming and underclaiming here cost money.

**Automation genuinely wins at per-auction bidding.** For a single query, the system knows the device, the operating system, the time of day, the exact query text, the user's location down to a fine grain, whether they are on a remarketing list, their recent search history, and how similar users behaved. It computes a bid in the time it takes to load the results page, thousands of times an hour. A human cannot do this at all, not slowly, not ever. If you have enough conversion volume to feed it, automated bidding will beat a manual bidder on the same account. This is not marketing copy; it is a straightforward consequence of having more information and more computation.

**Automation is mediocre or worse at everything upstream of the bid.** It does not choose what counts as a conversion. If you count every form fill including the ones from vendors, it will confidently optimize toward vendor spam. It does not build your account structure, write your negative keyword lists, decide how much of the budget goes to furnace install versus AC repair, judge whether a lead was any good after the call, notice that your out-of-state clicks are worthless, or tell you that your target CPA embeds an assumption about margin that is now out of date. Those are all your job, and they are where most of the available improvement in a small account lives.

**Automation is actively dangerous with thin or dirty data.** A target CPA on 9 conversions a month is not smarter than manual bidding; it is manual bidding with a random number generator attached. A maximize conversion value strategy fed the wrong values will bid hardest for the least valuable thing in your account.

The practical division of labour: let the machine set prices, and keep for yourself the decisions about what is worth buying. Which means the highest-leverage work you do on a bidding project is usually not the bidding. It is defining the conversion actions correctly, valuing them correctly, and cleaning the targeting so the machine is choosing among good options in the first place.

## Practice

You are building a complete budget, bidding, and targeting plan for Northgate Heating & Air for the coming month. Everything is built in a spreadsheet and in a **paused draft campaign**. No campaign is enabled and no live money is spent at any point.

**The brief you have been given:** Northgate wants **20 replacement leads and 45 repair leads** next month. The budget is fixed at **$200/day ($6,080/month)**. Use the benchmark and canonical report figures from this lesson.

**Deliverable 1 — Feasibility arithmetic (spreadsheet).**

1. For each of the two goals, work backwards: required leads divided by the relevant conversion rate gives required clicks; required clicks times the relevant CPC gives required spend. Show every division and multiplication as a separate cell so a reviewer can follow it.
2. Sum the two required spends and compare to $6,080. State plainly whether the goals fit the budget.
3. If they do not fit, produce three options with numbers attached: a reduced goal that fits, the extra budget required to hit the stated goal, and a conversion-rate improvement that would close the gap. State the required conversion rate to two decimal places.
4. Check the inventory constraint too: using the impression share table in this lesson, estimate the maximum clicks each campaign could get at 100% impression share and flag any goal that exceeds it.

**Deliverable 2 — Budget allocation (spreadsheet).**

5. Allocate the $200/day across all four campaigns. Show daily budget, monthly budget (daily x 30.4), and percentage share. The daily column must total exactly $200.00.
6. For each campaign, add columns for expected clicks, expected conversions, expected CPA, contribution per lead, and total monthly contribution, using the benchmark CPCs and conversion rates.
7. Write two to four sentences per campaign defending its slice. Reference contribution per dollar spent, the impression share table, and any strategic reason (such as feeding the replacement funnel) that overrides the pure arithmetic.

**Deliverable 3 — Bid strategy selection (spreadsheet).**

8. Build a table with one row per campaign and these columns: conversions in the trailing 30 days, conversions per day, whether the campaign passes the ~30-conversions-in-30-days test, chosen bid strategy, and the target value if any.
9. For every campaign that fails the volume test, write the fallback strategy you chose and one sentence on what would have to change for you to switch to a target-based strategy.
10. For the campaigns where you set a target CPA, derive the target from lead value minus desired contribution, showing the subtraction. Then compute the implied maximum CPC (target CPA times conversion rate) and compare it to the campaign's current average CPC. If the implied max CPC is more than 20% below the current CPC, write down what you expect to happen to volume.
11. Write your change cadence rule: how often you will move a target, by how much, and what you will not change at the same time.

**Deliverable 4 — Targeting settings (written spec).**

12. **Geography:** state your targeting method (radius, city, or zip), the radius or list, the presence versus presence-or-interest setting you chose and why, and any location exclusions.
13. **Ad schedule:** produce a day-part table for at least one campaign showing hours, and state your schedule decision. If you make an hour-level decision on fewer than 30 conversions in a cell, write a sentence acknowledging that the cell is under-powered and explaining why you acted anyway (or why you did not).
14. **Device:** state your device decisions for AC Repair and Furnace Install separately, with the conversion rate and CPA figures that justify each. Note explicitly which of your decisions would be ignored by your chosen bid strategy.
15. **Audiences:** list at least four audience layers, each with the campaign it attaches to, observation or targeting mode, and its purpose. Include at least one exclusion.

**Deliverable 5 — Seasonality plan (spreadsheet).**

16. Produce a twelve-month daily-budget pacing table whose average is $200/day and whose annual total is $72,960. Add a one-line rationale per month.
17. Write your freeze-week protocol: what forecast trigger you watch, how far in advance you act, what you raise the daily budget to, and where you take the money back from.

**Deliverable 6 — The paused draft campaign.**

18. In a Google Ads account, build **one** of the four campaigns as a draft or paused campaign. Enter the daily budget, the bid strategy and target, the location targeting and location options, the ad schedule, the device settings, and at least one audience in observation mode.
19. Confirm before you finish that the campaign status is paused or draft and that no ads are eligible to serve. Take a screenshot of the settings summary showing the paused status.

**What a reviewer should be able to do with your submission:** disagree with your budget split, and find the exact cell containing the arithmetic that produced it.
