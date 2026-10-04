---
lesson_id: dm230-02
course_id: dm230
pathway: digital-marketer
title: How Paid Search Auctions Work
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Explain how a paid search auction decides which ad shows and what it costs
  - Describe how quality signals affect cost per click and ad position
---

## What the Auction Actually Is

Most people arrive at paid search with a mental model shaped by eBay: whoever bids the most wins, and they pay what they bid. Both halves of that model are wrong, and believing them will cost you money on your first day of managing a real account.

The correct model is this. A paid search auction is a ranking contest scored on two inputs, your bid and a set of quality signals, and it is priced on a discount rule that charges you the minimum you would have needed to bid to hold the position you actually won. You never pay your bid unless you are unlucky. You frequently rank above someone who bid more than you. And the advertiser with the highest bid on the page sometimes does not appear at all.

Everything in this course rests on that mechanism. Structure, keywords, ad copy, landing pages, and bidding all exist to move one of the two inputs, and the arithmetic in this lesson is what tells you which input to move. When Northgate Heating and Air, our running example, pays $8.20 per click for an emergency AC repair click in Columbus, that number is not a price tag posted by Google. It is an output of an auction that ran in about a tenth of a second, and it is negotiable through means other than raising or lowering the bid.

Northgate is a residential heating and cooling contractor working a 25-mile radius from a single shop. A lead is a phone call over 60 seconds or a submitted "Book a Visit" form. Sixty percent of leads become booked jobs, the average repair job carries $180 in gross profit, so a repair lead is worth 0.60 x $180 = $108 in gross profit. That $108 is the ceiling on what Northgate can pay per lead before losing money, and their target is $60 per repair lead so that each one contributes $48. Hold those numbers. By the end of this lesson you will be able to say, in dollars, what a change in quality signals is worth to that business per month.

## From Query to Rendered Page

A homeowner in Westerville types "emergency ac repair columbus" at 9:14 p.m. on a July Tuesday. Between the keystroke and the pixels, roughly the following happens.

The search engine parses the query and its context: the device, the approximate location, the language setting, the time, and whatever signals it holds about this user. It then assembles the set of ads that are eligible to compete for that specific query in that specific context. Eligibility is a filter, not a contest. Being eligible only means you have earned the right to be scored.

For every eligible ad, the engine computes an Ad Rank score. Ad Rank determines both whether the ad clears the minimum bar to show at all and, among those that clear it, the order in which they appear. The engine then checks each ad against the Ad Rank threshold for each available slot, top of page and bottom of page carrying different thresholds, and fills the slots in descending Ad Rank order until it runs out of qualified ads or slots.

Finally, the engine computes a price for each ad that will actually show, using the discount rule described below. Only if the ad is clicked does that price become a charge. The auction runs on impressions; the billing runs on clicks.

This entire sequence repeats for every single query. There is no standing price list, no "we are in position two this week", and no stable CPC. When you look at an average CPC of $8.20 in a report, you are looking at the mean outcome of several hundred separate auctions with different competitors, different user contexts, and different prices.

## Step One: Eligibility and Matching

Eligibility asks a series of yes-or-no questions, and a "no" anywhere removes you from the auction entirely.

Does a keyword in your account match this query, under the match type you assigned it? Match types control how loosely a keyword can be stretched to cover a query, and they are the subject of lesson 04. For now, treat matching as a gate: Northgate's keyword `emergency ac repair` must be judged by the engine to cover the query "emergency ac repair columbus" before anything else can happen.

Is the campaign serving right now? A paused campaign, an exhausted daily budget, an ad schedule that excludes 9:14 p.m., or a geographic target that excludes the searcher's location all end the story here. Northgate's service radius is 25 miles from the shop, so a searcher in Zanesville does not trigger their ads no matter how good the keyword match is.

Is the ad approved and policy-compliant? A disapproved ad is invisible. Policy is covered in lesson 05.

Do the ad and its assets meet the format requirements for the placements available on this page? Some slots require particular asset types.

If all of those pass, you are in the auction. Notice how much of this is settings rather than skill. A large share of "my ads are not showing" tickets resolve at this stage, and the diagnostic walkthrough at the end of this lesson starts here for exactly that reason.

## Step Two: Ad Rank

Ad Rank is the score that decides order and eligibility to show in a given slot. Conceptually:

```txt
Ad Rank = bid x quality signals x context adjustments x expected asset impact

Where:
  bid                    = your maximum cost-per-click for the matched keyword
  quality signals        = a continuous estimate of expected click-through rate,
                           ad relevance, and landing page experience for THIS query
  context adjustments    = device, location, time of day, the other content on the
                           page, the nature of the query, the user's signals
  expected asset impact  = the estimated effect of your sitelinks, callouts, call
                           asset, and other extensions on performance
```

Four points matter more than the formula's exact shape.

Bid is a maximum, not an offer. It is the most you are willing to pay for a click, and it enters the score as a multiplier. Doubling your bid doubles your Ad Rank, all else equal. That is real leverage, and it is the most expensive lever available.

Quality signals are computed per query, not per keyword and not per account. Northgate's ad may carry excellent quality for "emergency ac repair" and poor quality for "hvac company", even though the same ad group serves both. The 1-to-10 Quality Score you see in the interface is a rounded, aggregated, historical summary of a continuous per-auction quality estimate. Treat the reported number as a gauge on a dashboard, not as the quantity the engine actually multiplies.

Context adjustments mean the same keyword with the same bid and the same quality can rank differently on a phone at 9 p.m. than on a desktop at 10 a.m. This is one reason your CPC moves without you touching anything.

Expected asset impact means that adding a call asset and three good sitelinks can raise Ad Rank without raising the bid. Assets are not decoration. They are an input to the score. Lesson 05 covers which ones to build.

For arithmetic in this lesson, we will use the teaching simplification `Ad Rank = bid x quality index`, where the quality index is a continuous number roughly on the same 1-to-10 scale as the reported Quality Score. That simplification is faithful enough to make every decision in this lesson correctly. It is not the production formula, and you should say so out loud if a client asks.

## Step Three: What You Actually Pay

Paid search uses a generalized second-price-style mechanic. You do not pay your bid. You pay the smallest amount that would still have kept you ahead of the advertiser directly below you, plus one cent.

Because rank is bid times quality, "the smallest amount that would have kept you ahead" has to be expressed in your own quality terms. The advertiser below you has some Ad Rank. To beat it, your bid times your quality index must exceed that Ad Rank. Solve for bid:

```txt
actual CPC = (Ad Rank of the advertiser directly below you / your quality index) + $0.01

with two caps and one floor:
  - actual CPC can never exceed your max bid
  - if nobody is below you, you pay the amount needed to clear the Ad Rank
    threshold for your slot, again divided by your quality index, plus $0.01
  - the result is a per-click price; you are charged only if the click happens
```

Read the formula for its shape before you read it for its digits. Your quality index sits in the denominator. Everything that raises your quality lowers the price of every click you win, at every position, permanently, without touching your bid. Your competitor's Ad Rank sits in the numerator, which is why a strong new entrant in your market raises your costs even if you change nothing.

The formula also explains something that surprises new managers: your CPC is set by the advertiser *below* you, not by the one above you. Beating the advertiser above you changes your position and hands you a different, usually higher, competitor-below. That is why moving up a position can raise your CPC substantially even though your bid did not change.

## The Northgate Auction, Fully Worked

Here is one auction for the query "emergency ac repair columbus" at 9:14 p.m. on a July Tuesday, four eligible advertisers, Ad Rank threshold of 40 for the slots being filled.

| Advertiser | Max bid | Quality index | Ad Rank (bid x quality) |
| --- | --- | --- | --- |
| Olentangy Air Pros | $18.00 | 3.0 | 54.0 |
| Buckeye Comfort Systems | $16.00 | 5.0 | 80.0 |
| Northgate Heating and Air | $12.00 | 8.0 | 96.0 |
| Capital City HVAC | $10.00 | 9.0 | 90.0 |

Sort by Ad Rank, descending, and the page order falls out:

| Position | Advertiser | Ad Rank | Advertiser directly below | Their Ad Rank |
| --- | --- | --- | --- | --- |
| 1 | Northgate Heating and Air | 96.0 | Capital City HVAC | 90.0 |
| 2 | Capital City HVAC | 90.0 | Buckeye Comfort Systems | 80.0 |
| 3 | Buckeye Comfort Systems | 80.0 | Olentangy Air Pros | 54.0 |
| 4 | Olentangy Air Pros | 54.0 | nobody (threshold applies) | 40.0 |

Now price each one. Divide the Ad Rank of the advertiser directly below by your own quality index, add a cent, and cap at your max bid.

```txt
Northgate     90.0 / 8.0 = 11.250   + 0.01 = $11.26   (max bid $12.00, no cap)
Capital City  80.0 / 9.0 =  8.889   + 0.01 = $8.90    (rounded from 8.8989)
Buckeye       54.0 / 5.0 = 10.800   + 0.01 = $10.81   (max bid $16.00, no cap)
Olentangy     40.0 / 3.0 = 13.333   + 0.01 = $13.34   (threshold in numerator;
                                                       max bid $18.00, no cap)
```

I rounded each result to the nearest cent. Capital City's raw figure was $8.8989 and became $8.90.

Sit with that table for a minute, because it contains four separate lessons.

Northgate bid $12.00 and took position one, beating advertisers who bid $16.00 and $18.00. Quality did that. Northgate's quality index of 8.0 multiplied a $12 bid into an Ad Rank of 96, while Olentangy's index of 3.0 dragged an $18 bid down to 54. Bidding more is a way to win. It is not the only way, and it is the expensive way.

Olentangy bid the most and finished last and paid $13.34, the highest price on the page. Poor quality is punitive twice over: it costs you position and it costs you money at the position you do get. This is not a penalty the engine imposes to be moralistic. It is arithmetic. Your quality index is the denominator of your price.

Buckeye, in position three, pays $10.81 per click. Capital City, in position two, pays $8.90. The advertiser in the better position pays less per click. Position and price are not correlated in any reliable direction, because price is set by whoever happens to be beneath you.

Northgate pays $11.26 here, which is well above their $8.20 ad group average CPC for AC Repair. That is expected. "emergency ac repair columbus" is a high-intent head term with heavy competition at 9 p.m. in July. The $8.20 average is the mean across hundreds of auctions, most of them on cheaper, longer, less contested queries. When a client asks why one keyword costs more than the account average, this is the answer.

## Ad Rank Thresholds: Why the Highest Bid Can Show Nothing

Ad Rank thresholds are minimum scores an ad must reach before it is allowed to occupy a given slot. They exist so the engine can refuse to show bad ads at any price. There is no bid high enough to override a threshold you cannot reach.

Thresholds are not one number. They vary by:

- **Slot.** The top-of-page threshold is meaningfully higher than the bottom-of-page threshold. An ad can clear the bar to appear below the organic results and fail to clear the bar to appear above them.
- **Query.** Sensitive or ambiguous queries carry higher thresholds. A query that looks navigational or informational carries a different bar than a clear commercial one.
- **Context.** Device, location, and time can shift the bar.
- **Ad quality.** The engine adjusts thresholds against the quality of the ad itself, which is another way of saying that low-quality ads face a higher hurdle than high-quality ads for the same slot.

Two operational consequences.

First, an advertiser with a very low quality index can be structurally locked out. Suppose Olentangy's quality index fell from 3.0 to 1.5 after a run of disapproved landing pages. Their Ad Rank at an $18 bid is now 27.0 against a threshold of 40. They do not show. Their spend goes to zero, their manager sees "no impressions" and raises the bid to $25, which produces an Ad Rank of 37.5. Still below 40. Still no impressions. The bid lever is the wrong lever, and no amount of pulling it will work. This is the single most common expensive misdiagnosis in paid search.

Second, thresholds explain "my ad shows sometimes". If your Ad Rank hovers near the top-of-page threshold, you clear it in favourable contexts and miss it in unfavourable ones. Your impressions look erratic and your average position, if you could still see it, would look unstable. You are not being throttled. You are sitting on a line.

## Quality Score and Its Three Components

Quality Score is the 1-to-10 number reported at the keyword level. It is a diagnostic summary of the quality signals the auction uses, aggregated over recent history for exact-match traffic on that keyword. It reports three components, each rated "Above average", "Average", or "Below average" against other advertisers competing for the same keyword over the same period.

**Expected click-through rate.** This estimates how likely your ad is to be clicked when it shows for this keyword, with position effects factored out. It is the heaviest of the three components and the hardest to move quickly, because it is largely historical. What moves it: an ad whose headline contains the searcher's actual words, an offer that answers the query's intent, and pruning the queries that drag your CTR down. Northgate's AC Repair ad group runs a 6.4% CTR while the Brand ad group runs 22%. That gap is not a failure of the AC Repair copy. Brand searchers already decided; non-brand searchers are still shopping. Expected CTR is scored against competitors on the same keyword, so the AC Repair ad group is judged against other HVAC advertisers bidding on repair terms, not against Northgate's own brand ad group.

**Ad relevance.** This measures how closely the ad's text matches the meaning of the keyword. It is the fastest of the three to move, and it is almost entirely a structural problem rather than a copywriting one. If a single ad group holds `ac repair`, `furnace install`, and `hvac maintenance plan`, no single ad can be relevant to all three, and all three keywords will report "Below average". Splitting the ad group so that each one holds a tight theme with an ad written for that theme fixes this in days. That is the whole argument for tight ad groups, and it is developed properly in lesson 03.

**Landing page experience.** This estimates whether someone who clicks gets what the ad promised, quickly, on the device they are using, without being tricked. It weighs relevance of the page content to the query, load speed, mobile usability, transparency about who you are and what you do with data, and ease of navigation. It is the slowest to move because it usually requires someone to change a website. If Northgate's `emergency ac repair` ad points at the homepage, landing page experience will read "Below average" no matter how good the homepage is, because the homepage is not about emergency AC repair. Pointing it at `northgateheatingair.com/ac-repair` with the phone number above the fold usually fixes it. Lesson 09 covers landing pages for paid traffic in depth.

A useful way to hold the three: expected CTR asks "will they click", ad relevance asks "does the ad answer the query", landing page experience asks "does the page keep the ad's promise". They are the three joints of the same chain, query to ad to page, and the chain is only as strong as its weakest joint.

## Quality Score Is a Diagnostic, Not a KPI

Quality Score is a gauge. Nobody pays you for a gauge reading.

Three reasons not to manage to it directly.

It is reported on exact-match impression history only, and it is aggregated. A keyword with fifteen impressions carries a Quality Score that is close to a default value and tells you almost nothing. Do not act on a Quality Score computed from a handful of impressions. Wait for a few hundred, in the same way you would wait for a few hundred sessions before believing a conversion rate.

It is a relative measure, scored against the other advertisers on that keyword. A "6" is not a fixed standard of goodness. If three well-funded competitors enter your market with better landing pages, your Quality Score can drop while your ads, your pages, and your performance are literally unchanged. The metric moved; your business did not.

Most damagingly, Quality Score can be gamed in ways that destroy the account. Pausing every keyword below a 5 will raise your average Quality Score and shrink your volume. Restricting to only the tightest, most branded queries will raise it further and shrink your volume more. You can drive an account to an average Quality Score of 9 and a lead count of zero.

The correct use is diagnostic and directional. Sort the keywords by cost, descending. Take the top twenty by spend. Look at the three component ratings on each. Where a high-spend keyword shows "Below average" on a component, you have found a specific, named, fixable defect that is costing real money, and the component tells you which team fixes it: ad relevance is a structure and copy job, landing page experience is a web job, expected CTR is a copy and query-hygiene job. Where a keyword spends $12 a month, ignore its Quality Score entirely.

## What a Quality Improvement Is Worth in Dollars

Vague claims about quality do not move budgets. Arithmetic does. Here is the argument you make to Northgate's owner.

Northgate's Non-brand AC Repair ad group currently averages $8.20 per click at a quality index of 5.0. Work backwards through the pricing formula to recover the average Ad Rank of the advertiser sitting below Northgate across those auctions:

```txt
actual CPC = (competitor Ad Rank / quality index) + 0.01

  8.20 = (X / 5.0) + 0.01
  8.19 =  X / 5.0
     X = 40.95
```

Now hold the competitive field constant, hold Northgate's position constant, and raise only the quality index. Suppose a month of work on ad group structure, ad copy, and the AC repair landing page moves the index from 5.0 to 7.6. Nothing about the bid changes.

```txt
new actual CPC = (40.95 / 7.6) + 0.01
               = 5.3882 + 0.01
               = 5.3982
               = $5.40   (rounded to the nearest cent)
```

The same advertiser, in the same position, against the same competitors, now pays $5.40 instead of $8.20. That is a 34% reduction in cost per click purchased entirely with quality.

What is it worth per month at Northgate's volume? Their canonical 30-day report shows the AC Repair ad group taking 390 clicks on $3,200 of spend.

```txt
Framing A - hold clicks constant, bank the savings
  Current:  390 clicks x $8.20 = $3,198   (matches the reported $3,200)
  Improved: 390 clicks x $5.40 = $2,106
  Monthly saving                = $1,092
  Annualized                    = $13,104

Framing B - hold budget constant, buy more clicks
  Improved clicks   = $3,200 / $5.40 = 592.6 -> 592 clicks
  Additional clicks = 592 - 390      = 202 more clicks per month
  At the ad group's 11% conversion rate:
    Current conversions  = 390 x 0.11 = 42.9 -> 43   (matches the report)
    Improved conversions = 592 x 0.11 = 65.1 -> 65
    Additional leads     = 22 per month
  New CPA = $3,200 / 65 = $49.23  (down from $74.42)
  Value of the extra leads = 22 x $108 = $2,376 in gross profit per month
```

I truncated fractional clicks down and rounded conversions to whole leads. Framing B is the one to present, because it converts a technical improvement into 22 more booked-job opportunities and moves the CPA from $74.42 to $49.23, which is under Northgate's $60 target for the first time. Framing A is the one to present if the budget is genuinely fixed and the owner cares about cash.

Notice what this improvement did *not* require: no bid increase, no budget increase, no new channel. It required tighter ad groups, ads that match the query, and a landing page about AC repair. That is the case for everything in the next several lessons.

## The Auction Moves: Competitors, Seasons, and the First Freeze

Nothing in the auction is stable, which means your reports will move even in weeks when you do nothing. Learn to attribute movement correctly before you react to it.

**Competitive entry and exit.** A new advertiser with a large budget raises the Ad Rank of whoever ends up beneath you, which raises your price directly through the numerator of the pricing formula. A competitor exiting has the reverse effect. If Northgate's AC Repair CPC rises from $8.20 to $9.60 over three weeks with no account changes, the first hypothesis is a competitor, not a Google policy change. The auction insights report will usually confirm it.

**Intraday and day-of-week movement.** Emergency HVAC queries spike in the evening and on weekends, when nobody can reach their usual contractor. Competition and thresholds move with them. A CPC measured on Sunday evening is not comparable to one measured on Tuesday morning.

**Seasonality.** Northgate's demand is violently seasonal. The first genuinely hot week of summer and the first hard freeze of winter are the two events that define the year. In the first-freeze week, furnace repair query volume can triple in 48 hours. Every HVAC advertiser in the metro sees the same spike, raises bids in response, and the auction reprices upward for everyone. A plausible pattern for Northgate's furnace terms during that week:

| Metric | Normal winter week | First-freeze week |
| --- | --- | --- |
| Furnace query impressions available | 3,100 | 9,400 |
| Northgate avg CPC | $8.99 | $13.50 |
| Search impression share | 46% | 19% |
| Lost IS (budget) | 5% | 58% |
| Lost IS (rank) | 49% | 23% |

Two things went wrong at once, and they are separable. Lost impression share to budget went from 5% to 58% because the daily budget stayed at its normal level while both volume and price tripled. Lost impression share to rank actually improved, from 49% to 23%, because the flood of new competitors included many with worse quality than Northgate. The correct response is a temporary budget increase, not a quality project. If you had only looked at "impression share fell from 46% to 19%" you might have concluded the opposite.

The general rule: when the auction moves, decompose the movement before you respond. Price moves are usually competitive or seasonal. Volume moves are usually budget. Position moves with stable price are usually quality or threshold effects.

## Impression Share: Is It a Money Problem or a Quality Problem?

Impression share is the single most useful diagnostic in paid search, because it decomposes your losses into the two things you can actually do something about.

```txt
Search impression share = impressions you received / impressions you were eligible for

And the three always sum to 100%:
  Search impression share
+ Search lost IS (budget)     - you were eligible, but your budget was exhausted
+ Search lost IS (rank)       - you were eligible, but your Ad Rank was too low
= 100%
```

Lost IS (budget) is a money problem. You were qualified to compete and the account had no money left that day. The fix is more budget, a better daily pacing setup, or reallocating budget from somewhere less profitable.

Lost IS (rank) is a bid or quality problem. You had money and still lost the auction, either because your Ad Rank was below the threshold or below the competitors who took the slots. The fix is a higher bid, better quality, or accepting that these auctions are not worth winning.

Here is Northgate's impression share for the same canonical 30-day period:

| Campaign / ad group | Search IS | Lost IS (budget) | Lost IS (rank) | Spend | Conv | CPA |
| --- | --- | --- | --- | --- | --- | --- |
| Brand - Northgate | 84% | 3% | 13% | $600 | 88 | $6.82 |
| Non-brand - AC Repair | 41% | 34% | 25% | $3,200 | 43 | $74.42 |
| Non-brand - Furnace Install | 29% | 6% | 65% | $1,600 | 12 | $133.33 |
| Non-brand - Maintenance Plans | 62% | 5% | 33% | $680 | 9 | $75.56 |

Read it row by row.

**Brand** at 84% impression share with only 3% lost to budget and 13% lost to rank is close to healthy. Some brand impression share is always lost to competitors bidding on your name, and some is lost to queries that mention your brand but are not really about you. At a $6.82 CPA against a $108 lead value, closing more of that 13% is nearly free money, but there is not much of it.

**AC Repair** is losing 34% to budget and 25% to rank. This is the interesting row, because it is both problems at once, and you must size the budget half before you spend a month on the quality half. Do the arithmetic:

```txt
Impressions received = clicks / CTR = 390 / 0.064 = 6,094  (rounded)
Total eligible       = 6,094 / 0.41 = 14,863              (rounded)
Impressions lost to budget = 14,863 x 0.34 = 5,053        (rounded)
Clicks foregone      = 5,053 x 0.064 = 323                (rounded)
Conversions foregone = 323 x 0.11    = 35.5 -> 35
Cost to capture them = 323 x $8.20   = $2,649
Implied CPA on the incremental spend = $2,649 / 35 = $75.69
```

So raising the AC Repair budget enough to capture what it is losing to budget would cost roughly $2,650 a month and produce roughly 35 more repair leads at about $76 each. That is above Northgate's $60 target CPA and below the $108 break-even. It is profitable but not on target, which makes it a judgement call rather than an obvious yes. It also makes the quality project from the previous section far more attractive: doing the quality work first drops the CPC to $5.40, at which point the same incremental clicks cost 323 x $5.40 = $1,744 and the incremental CPA falls to $1,744 / 35 = $49.83. Fix quality, then buy volume. That sequencing is worth roughly $900 a month on this row alone.

**Furnace Install** is losing 65% to rank and only 6% to budget. Adding budget to this campaign would accomplish nothing at all, because the money is not the constraint. The account already cannot win these auctions. The options are a higher bid, better quality, or narrower targeting so the remaining budget concentrates on auctions that are winnable. Given that the row's $133.33 CPA is already under the $180 target for replacement leads, a bid increase is defensible here, but a quality project is cheaper. Lesson 06 covers how to raise bids without losing control of the CPA.

**Maintenance Plans** at 62% share with 33% lost to rank is a mild version of the Furnace Install problem, on a small spend. It is not where you would start.

The decision rule you can carry to any account: **budget loss means buy more, rank loss means earn more.** If lost IS (budget) is large, the question is whether the incremental CPA justifies the incremental spend, and you answer that with the arithmetic above. If lost IS (rank) is large, more money changes nothing until Ad Rank moves.

One caution. Impression share is computed against the engine's own estimate of the impressions you were eligible for, which depends on your targeting. Narrowing your geographic targeting mechanically raises your impression share without producing a single extra lead, because you shrank the denominator. Never celebrate an impression share increase without checking that impressions and conversions moved too.

## Position, Top-of-Page Rate, and the End of Average Position

Average position was retired, and its removal was correct. It reported where you ranked among ads, not where you appeared on the page. An "average position 1.4" could mean you were the first ad at the bottom of the page on most impressions, which is a very different commercial outcome from being the first ad at the top.

The replacements are absolute measures of page placement:

- **Search top impression rate** is the share of your impressions that appeared anywhere above the organic results.
- **Search absolute top impression rate** is the share of your impressions that appeared as the very first ad on the page.

There are matching impression share versions, top impression share and absolute top impression share, plus lost-to-budget and lost-to-rank splits for each. Those are the ones to use when you are arguing about position, because they answer the question "how often did we get the placement we wanted, out of all the times we could have" rather than "when we showed, roughly where were we".

Sample data for Northgate's AC Repair ad group over the same 30 days:

| Metric | Value | What it says |
| --- | --- | --- |
| Search impression share | 41% | We show in 4 of every 10 eligible auctions |
| Top impression rate | 48% | Of the impressions we got, fewer than half were above the organic results |
| Absolute top impression rate | 12% | We are almost never the first ad on the page |
| Top impression share | 20% | Of all eligible auctions, we take a top slot in 1 in 5 |

For a 9 p.m. emergency query on a phone, that 12% absolute top rate matters more than it would for a considered purchase, because emergency searchers call the first credible number they see and stop searching. This is a good example of a metric whose importance depends entirely on the query's intent, and it is exactly the kind of judgement a report cannot make for you.

Two habits. First, never quote position without quoting share alongside it, because position tells you nothing about how often you showed at all. Second, remember that better position is bought with Ad Rank, and Ad Rank has two inputs. If Northgate wants a higher absolute top rate, raising the bid is the fast route and improving quality is the cheap route, and from the pricing formula you already know that the cheap route also reduces what each of those clicks costs.

## Worked Diagnosis: "My Ad Isn't Showing"

You will get this message from a client or a manager, in these exact words, several times a year. Here is how to answer it in fifteen minutes rather than a day, working from cheapest check to most expensive.

**Step 1. Stop searching for your own ad.** Typing your keyword into the search bar repeatedly generates impressions you never click, which depresses your CTR, which harms your quality signals, and it tells you nothing because your personal context is not the average user's. Use the ad preview and diagnosis tool, which simulates a search without recording an impression, and set it to the location, device, and language you actually care about.

**Step 2. Check whether it is serving at all.** In order: is the campaign enabled, is the ad group enabled, is the keyword enabled, is the ad approved, is the ad group's ad rotating with others. A disapproved ad and a paused ad group are both invisible and both take ten seconds to rule out.

**Step 3. Check the settings gates.** Is the search location inside the geographic target? Northgate targets a 25-mile radius, so a preview run from downtown Cleveland will always show nothing. Does the ad schedule cover the hour in question? Is the language setting compatible with the browser's? Is the campaign's network setting appropriate for where the person searched?

**Step 4. Check budget.** Look at the campaign's lost impression share to budget for yesterday and for the last seven days. If it reads 34% as it does for Northgate's AC Repair, the ad genuinely stops showing part of every day, usually in the afternoon and evening once the budget has paced out. This is the most common cause of "it showed this morning and not tonight", and for an HVAC advertiser whose emergency queries peak at night, it is also the most expensive.

**Step 5. Check rank.** Look at lost impression share to rank. Look at the keyword's Quality Score and its three component ratings. If lost IS (rank) is high and the component ratings are "Below average", you have a quality problem and no bid will fix it cheaply. If lost IS (rank) is high but the components are all "Average" or better, you are simply outbid, and the question becomes whether the auction is worth winning at the price it now costs.

**Step 6. Check whether the query even matches.** Pull the search terms report for the period. If the query you are worried about does not appear there and does not appear as a keyword, the issue is matching, not the auction. A negative keyword added six months ago by someone else is a frequent culprit. Lesson 04 covers negatives and search terms mining.

Applied to Northgate, on a real Thursday in July: the owner calls at 8 p.m. saying he cannot find his ad for "ac repair columbus". Step 1 says stop searching manually. Steps 2 and 3 come back clean. Step 4 shows lost IS (budget) at 34% and a daily budget that fully paces out by roughly 6 p.m. That is the answer. The ad was showing at 10 a.m. and stopped when the money ran out, and it ran out just before the evening emergency peak. The fix is not a bid change and not an ad rewrite. It is either more budget for this campaign, budget moved out of Maintenance Plans, or an ad schedule that concentrates spend in the evening hours when the emergency queries convert. Which of those three you choose is a structure and bidding question, and structure is the next lesson.

## Practice

All three exercises are paper and spreadsheet work. Do not spend any live budget. If you want to see the interface while you work, open a Google Ads account in draft or use the ad preview and diagnosis tool, which does not serve impressions.

### Exercise 1: Complete the auction table

The query is "ac repair near me open now", 8:40 p.m. on a Saturday, mobile, Columbus. The Ad Rank threshold for the slots being filled is **30.0**. Use the teaching simplification `Ad Rank = max bid x quality index` and the pricing rule `actual CPC = (Ad Rank of the advertiser directly below / your quality index) + $0.01`, capped at your max bid.

| Advertiser | Max bid | Quality index | Ad Rank | Position | Actual CPC |
| --- | --- | --- | --- | --- | --- |
| Northgate Heating and Air | $9.00 | 8.0 | ? | ? | ? |
| Buckeye Comfort Systems | $14.00 | 4.0 | ? | ? | ? |
| Capital City HVAC | $7.50 | 9.0 | ? | ? | ? |
| Olentangy Air Pros | $11.00 | 5.0 | ? | ? | ? |
| Scioto Mechanical | $6.00 | 6.0 | ? | ? | ? |

1. Compute every Ad Rank and fill the column.
2. Sort by Ad Rank to assign positions 1 through 5.
3. Compute each advertiser's actual CPC, showing the division on its own line and stating where you rounded. The last-place advertiser uses the threshold of 30.0 in the numerator.
4. In two or three sentences each, answer: (a) which advertiser bid the most and what position did they get; (b) which advertiser pays the highest price per click and why; (c) Northgate is in the lead here on a $9.00 bid. How far could Buckeye raise its bid before it takes position one from Northgate, and what would Northgate's actual CPC become at that point?

Deliverable: the completed table, your arithmetic, and the three written answers.

### Exercise 2: Budget problem or rank problem

Northgate's next 30-day period comes back as follows. The daily budget is unchanged at $200 across the account.

| Campaign | Spend | Clicks | Avg CPC | Conv | Search IS | Lost IS (budget) | Lost IS (rank) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $610 | 320 | $1.91 | 90 | 86% | 2% | 12% |
| Non-brand - AC Repair | $3,180 | 388 | $8.20 | 42 | 38% | 41% | 21% |
| Non-brand - Furnace Install | $1,610 | 179 | $8.99 | 12 | 24% | 4% | 72% |
| Non-brand - Maintenance Plans | $680 | 141 | $4.82 | 9 | 58% | 7% | 35% |

Repair-type leads (Brand, AC Repair, Maintenance Plans) are worth $108 in gross profit each, with a $60 target CPA. Furnace Install leads are replacement leads worth $432, with a $180 target CPA.

1. Compute the CPA for each campaign. Show the division.
2. For each campaign, label the primary constraint as **budget**, **rank**, or **neither**, and write one sentence of justification citing the numbers.
3. For AC Repair, estimate the incremental opportunity the way the lesson did: impressions received, total eligible impressions, impressions lost to budget, clicks foregone at the campaign's 6.4% CTR, conversions foregone at an 11% conversion rate, the cost to capture them at the current CPC, and the implied incremental CPA. State each rounding.
4. Northgate's owner will release exactly $1,500 more per month, once, and wants it spent where it earns the most. Write a recommendation of no more than 200 words naming the campaign, the amount, the expected additional leads, the expected incremental CPA, and the reason you did not put the money in the other campaigns. If your recommendation is to fix quality before spending the money, say so and defend it with arithmetic.

Deliverable: a one-page spreadsheet with the calculations and the written recommendation beneath it.

### Exercise 3: Price a quality improvement

Northgate's Non-brand Furnace Install ad group runs at an average CPC of $8.99 on a quality index of 4.0. It took 179 clicks on $1,610 of spend last month at a 4.1% CTR and a 6.7% conversion rate, producing 12 replacement leads worth $432 each.

Your proposed project is four weeks of work: split the ad group into three tighter themes, rewrite the ads so each headline carries the theme's own language, and rebuild the furnace install landing page. Your estimate is that this moves the quality index from 4.0 to 6.5. The agency will charge $2,800 for the work.

1. Work backwards through the pricing formula to recover the average Ad Rank of the advertiser sitting directly below Northgate. Show the algebra.
2. Compute the new actual CPC at a quality index of 6.5, holding that competitor Ad Rank and Northgate's position constant. Round to the nearest cent and say so.
3. Compute the monthly saving if clicks are held constant at 179.
4. Compute the alternative: how many clicks the same $1,610 buys at the new CPC, how many additional conversions that produces at a 6.7% conversion rate, the new CPA, and the gross profit value of the additional leads at $432 each.
5. State the payback period on the $2,800 fee under each of the two framings, in months, rounded up to the nearest whole month.
6. Write three sentences on why this estimate should be presented as a range rather than a point number, naming at least two things that could make the real result worse than your projection.

Deliverable: a short memo, no more than one page, with the arithmetic shown and a clear recommendation to proceed or not.

## Check your understanding

1. Using the teaching simplification, an advertiser bids $10 at a quality index of 6, and the advertiser directly below has an Ad Rank of 48. What is the actual CPC? *(Answer: 48 / 6 + $0.01 = $8.01.)*
2. A campaign shows 15% lost impression share to budget and 60% lost to rank. Will raising the budget help much? *(Answer: very little; the main constraint is Ad Rank, so the fix is quality or bid, then budget.)*
3. Why should you not search for your own ad repeatedly to check that it is showing? *(Answer: it creates impressions you never click, which drags down CTR and quality signals, and your personal context is not representative; use the ad preview and diagnosis tool instead.)*
