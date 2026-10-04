---
lesson_id: dm230-07
course_id: dm230
pathway: digital-marketer
title: Paid Social Campaigns
order: 7
kind: lesson
competency_ids:
  - D3-S1-C01
  - D4-S1-C01
objectives:
  - Plan a paid social campaign and choose the audiences for it
  - Compare paid social and paid search for a given objective
---

## Demand Capture and Demand Creation

Everything that is different about paid social follows from one fact: on search, the person told you what they want. On social, nobody told you anything.

A search ad is demand capture. Someone typed "ac repair columbus ohio" into a box, which is a declaration of intent so explicit that it does most of your targeting for you. Your job is to be present, be relevant, and be affordable. The keyword is the audience.

A paid social ad is demand creation, or at minimum demand interruption. Nobody opens Instagram to buy a saucepan. You are inserting an offer into a scrolling session that was about something else entirely, and you are paying for the privilege whether or not the interruption lands. There is no query to match. There is no intent signal handed to you for free.

Three consequences fall out of that, and if you internalize them you will be ahead of most people running social budgets.

**Creative carries the load.** On search, a mediocre ad against a great keyword still works, because the intent does the persuading. On social, the creative is the entire persuasion mechanism. The difference between your best creative concept and your fifth-best is routinely 3x to 5x on cost per acquisition, which is a far wider spread than anything you can achieve by tuning bids. Time spent on creative on social is worth more than time spent on settings.

**The audience replaces the keyword.** Since no query exists, you build the audience definition yourself, and it becomes the thing that determines whether your money reaches anyone who could plausibly buy. That is what the middle half of this lesson is about.

**Your expectations for conversion rate and attribution have to move.** A visitor arriving from an exact-match search for your product converts at some rate. A visitor arriving from an interruption converts at a fraction of it. If you carry search benchmarks over to social and judge social by them, you will kill a working campaign. Loom & Larder's landing page converts search traffic at a rate it will never hit on cold social traffic, and its social landing page conversion rate of 2.4% is not a failure, it is the category.

## The Arithmetic Has a Different Shape

Search is priced per click. Social is priced per thousand impressions. That single difference reorganizes the whole calculation.

On search you start from CPC and multiply outward. On social you start from CPM and have to earn your way down to a click, because the click-through rate is now a variable you pay for rather than a number you observe. A social campaign with a 0.6% CTR and a social campaign with a 1.6% CTR are buying impressions at the same price and getting clicks at prices that differ by a factor of nearly three.

The chain is always:

```txt
CPM  ->  impressions  ->  CTR  ->  clicks  ->  effective CPC
     ->  landing page conversion rate  ->  orders or leads
     ->  cost per order  ->  ROAS and contribution
```

Every one of those arrows is a multiplication or a division, and every one of them compounds. A 20% improvement in CTR and a 20% improvement in landing page conversion rate together produce 44% more orders at fixed spend, because 1.2 x 1.2 = 1.44. Cost per order falls by 1 - 1/1.44 = 30.6%. This is why social people obsess over creative and landing pages and mostly ignore bid settings.

## Loom & Larder on Meta, End to End

Loom & Larder sells direct-to-consumer kitchen goods. Average order value is $68 at a 55% gross margin, so gross profit per order is $68.00 x 0.55 = $37.40. Break-even ROAS is 1 / 0.55 = 1.82. Their Meta prospecting numbers are a $14.50 CPM, a 1.1% CTR, and a 2.4% landing page conversion rate.

Work it per 1,000 impressions, because that is the unit you are actually buying:

```txt
Cost of 1,000 impressions                        = $14.50
Clicks       = 1,000 x 0.011                     = 11.0 clicks
Effective CPC = $14.50 / 11.0                    = $1.3182  -> $1.32
Orders       = 11.0 x 0.024                      = 0.264 orders
Cost per order = $14.50 / 0.264                  = $54.9242 -> $54.92
Revenue per order                                = $68.00
ROAS         = $68.00 / $54.92                   = 1.2382   -> 1.24
Break-even ROAS                                  = 1.82
Gross profit per order                           = $37.40
Contribution per order = $37.40 - $54.92         = -$17.52
```

Read the last line. At these numbers Loom & Larder loses $17.52 on every order they buy from Meta prospecting. A 1.24 ROAS against a 1.82 break-even is not "close." It is a business paying $54.92 to earn $37.40.

Scale it so the size is visible. At $150/day for a 30-day month, spend is $4,500:

```txt
Orders   = $4,500 / $54.92        = 81.9  -> about 82 orders
Revenue  = 82 x $68.00            = $5,576
Gross profit = 82 x $37.40        = $3,066.80
Contribution = $3,066.80 - $4,500 = -$1,433.20
```

That is a $1,433 monthly loss, and it will look like a success in the Meta dashboard, which will report $5,576 of revenue against $4,500 of spend and call it a 1.24 ROAS without ever mentioning that your break-even is 1.82. **The platform does not know your margin.** This is the single most common way a small ecommerce brand loses money profitably-looking for six months.

So what has to change? Three levers, each with its own arithmetic.

| Scenario | CTR | Clicks / 1k | eCPC | Page CVR | Orders / 1k | Cost per order | ROAS | Contribution per order |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | 1.1% | 11.0 | $1.32 | 2.4% | 0.264 | $54.92 | 1.24 | -$17.52 |
| Better creative | 1.6% | 16.0 | $0.91 | 2.4% | 0.384 | $37.76 | 1.80 | -$0.36 |
| Better landing page | 1.1% | 11.0 | $1.32 | 3.2% | 0.352 | $41.19 | 1.65 | -$3.79 |
| Both | 1.6% | 16.0 | $0.91 | 3.2% | 0.512 | $28.32 | 2.40 | +$9.08 |

Neither lever alone is enough. Creative alone gets you to a 1.80 ROAS against a 1.82 break-even, which is the definition of running to stand still. The landing page alone gets you to 1.65. Both together get you to 2.40 and $9.08 of contribution per order, which at 159 orders a month ($4,500 / $28.32) is $1,444 of monthly contribution. That is a swing of nearly $2,900 a month from two changes.

There is a fourth lever the table does not show: average order value. If a bundle lifts AOV from $68 to $85 at the same 55% margin, gross profit per order becomes $46.75 and the baseline contribution goes from -$17.52 to -$8.17. Better, still negative. AOV is a slower lever than creative and it does not move break-even ROAS at all, since break-even depends on margin percentage, not order size.

And a fifth: repeat purchase. If 30% of first-time buyers order again within twelve months at the same AOV, lifetime gross profit per acquired customer is $37.40 x 1.30 = $48.62. Still below $54.92 at baseline. If you are going to argue that a campaign is profitable on lifetime value rather than first order, you have to actually have the repeat rate, and you have to be honest that you are financing the gap in the meantime. State the assumption inline whenever you use it.

## Ashby Field Software on LinkedIn, End to End

Ashby sells B2B software to trade contractors. LinkedIn CPC runs $9 to $14; use $11.50. Landing page conversion to demo request is 6%. Demo-to-close is 20%. First-year contract value is $9,000 at 70% gross margin, so a closed customer is worth $6,300 in gross profit and a demo request is worth 0.20 x $6,300 = $1,260.

LinkedIn is bought on CPC as often as on CPM, so this one is closer to search arithmetic:

```txt
Cost per click                                = $11.50
Landing page conversion to demo               = 6%
Cost per demo request = $11.50 / 0.06         = $191.67
Value of a demo request                       = $1,260.00
Contribution per demo = $1,260.00 - $191.67   = $1,068.33
Return per dollar = $1,260.00 / $191.67       = 6.57
```

Notice how different this looks from Loom & Larder. Ashby is buying $1,260 of gross profit for $191.67. The break-even cost per demo is $1,260, so they are running at 15% of break-even. The correct reaction to a 6.57x return is not "great, ship it," it is "we are spending far too little."

How much could they spend? Set an allowable cost per demo that reserves the contribution the business wants. If Ashby wants to keep 60% of the demo's gross profit:

```txt
Allowable cost per demo = $1,260 x 0.40       = $504.00
Allowable CPC = $504.00 x 0.06                = $30.24
```

They could pay $30.24 a click, nearly three times the current $11.50, and still keep 60% of the margin. That is enormous headroom, and it means the binding constraint on Ashby's spend is not price. It is one of two other things.

**Constraint one: audience inventory.** LinkedIn cannot show ads to people who are not there. Work out the ceiling:

```txt
At $5,000/month:  clicks = $5,000 / $11.50   = 434.8
At $10,000/month: clicks = $10,000 / $11.50  = 869.6
At a 0.45% CTR, impressions needed for 869.6 clicks
                = 869.6 / 0.0045             = 193,244 impressions
Across a 60,000-member audience, that is a frequency of
                  193,244 / 60,000           = 3.2 per month
```

A monthly frequency of 3.2 across the entire eligible audience is aggressive but survivable. At $20,000 a month the frequency would be 6.4, at which point CPCs rise, CTR falls, and you are paying more to annoy the same people. So roughly $10,000 a month is the practical ceiling of this audience, not $50,000.

**Constraint two: sales capacity.** At $5,000/month Ashby gets 434.8 x 0.06 = 26.1 demo requests. At $10,000/month, 52.2. If Ashby has two account executives who can each run 20 real demos a month, 40 is their ceiling and the 52 would produce a backlog, slow follow-up, and a falling close rate. In B2B this is the constraint far more often than media price is, and it is why "just spend more" is a bad recommendation to make without asking who is taking the calls.

```txt
At $5,000/month:
  Clicks 434.8  ->  Demos 26.1  ->  Closed 5.2  ->  Gross profit $32,760
  Contribution = $32,760 - $5,000 = $27,760
```

## Objectives, and the Most Expensive Beginner Mistake

Every social platform makes you pick a campaign objective first, and the objective tells the delivery system what to optimize for. Meta's family runs roughly awareness, traffic, engagement, leads, app promotion, and sales. LinkedIn's runs awareness, consideration (traffic, engagement, video views), and conversions (lead generation, website conversions, job applicants).

The mistake is choosing an upstream objective for a downstream goal, usually because the upstream objective produces prettier numbers. Somebody wants sales, picks Traffic because clicks are cheap and the report looks busy, and ends up with a campaign optimized to find people who click on things.

Here is what that costs, on $1,500 of Loom & Larder spend:

| Objective chosen | eCPC | Clicks | Page CVR | Orders | Cost per order |
| --- | --- | --- | --- | --- | --- |
| Traffic | $0.62 | 2,419 | 0.6% | 14.5 | $103.45 |
| Sales (purchase) | $1.32 | 1,136 | 2.4% | 27.3 | $54.95 |

The traffic campaign bought clicks at less than half the price and produced orders at nearly twice the price. It did exactly what it was told: find the cheapest available clicks. The people who click cheaply are, on average, not the people who buy. Cheap clicks are not a goal.

The rule is simple and worth memorizing: **optimize for the event you actually want, as far down the funnel as your data volume allows.** The qualifier at the end matters, and it is the subject of the fragmentation section below.

## The Structure of a Social Campaign

The hierarchy maps almost one-to-one onto what you learned in search, with the labels changed:

```txt
Search                          Social (Meta)                  Social (LinkedIn)
------                          -------------                  -----------------
Campaign  (objective, budget)   Campaign  (objective, budget)  Campaign group
Ad group  (keywords, bids)      Ad set    (audience, budget,   Campaign (audience,
                                           placement, schedule) budget, format)
Ad        (headlines, desc.)    Ad        (creative, copy)     Ad (creative, copy)
```

The boundaries are the same idea in a different costume. In search, the ad group is the unit at which you control what triggers the ad; on social, the ad set is the unit at which you control who sees it. In both, the level below is the message and the level above is the money.

Two structural details specific to social:

**Budget can live at the campaign level or the ad set level.** Campaign-level budget (Meta calls it Advantage campaign budget) lets the system move money between ad sets toward whichever is performing. Ad set budgets guarantee each audience gets a fixed amount. Use campaign-level budget when the ad sets are genuinely interchangeable and you want efficiency. Use ad set budgets when you have a strategic reason to guarantee spend somewhere, such as keeping a retargeting audience funded so it never goes dark.

**The ad set is also where placement, schedule, and optimization event live.** Which means every additional ad set fragments not only budget but learning. Hold that thought.

## Audiences on Meta

Meta's audience tools fall into three families, and they differ in where the data comes from.

**Core and detailed targeting** is Meta's own inference about people: age, gender, location, plus detailed targeting built from interests, behaviours, and demographics. "Interested in cooking," "engaged shoppers," "recently moved." It requires no data from you, which is its appeal and its weakness. It is Meta guessing, at scale, from engagement signals. Detailed targeting is the least precise tool in the box and the most over-used by beginners, who stack six interests together and believe they have built something.

**Custom audiences** are built from your data, and they are far stronger:

- **Customer list.** Upload hashed emails or phone numbers. Match rates typically run 50% to 70%.
- **Website traffic.** People who hit specific pages or fired specific events in a lookback window. Requires the pixel and event setup that lesson 08 covers.
- **Engagement.** People who watched a percentage of a video, opened an instant form, engaged with the Instagram or Facebook account. This one requires no tracking on your site at all, which makes it the retargeting pool you can build first.

**Lookalike audiences** take a custom audience as a seed and find people who resemble it. The quality of a lookalike is almost entirely determined by the quality of the seed. Meta requires at least 100 members from a single country; the practical floor is more like 1,000, and several thousand is better.

Loom & Larder's available seeds, ranked:

| Seed audience | Size | Seed quality |
| --- | --- | --- |
| Top 25% of purchasers by 12-month revenue | 1,150 | Highest signal, smallest sample |
| All purchasers, 180 days | 4,600 | Strong signal, workable sample |
| Add to cart without purchase, 180 days | 11,300 | Medium |
| All site visitors, 180 days | 96,000 | Weak; mostly bounces |
| Video 25% viewers, 365 days | 210,000 | Weakest; a scroll is not intent |

The tension is visible in the first two rows. The best seed is the smallest, and 1,150 is right at the practical floor. The workhorse choice for Loom & Larder is a 1% lookalike of "all purchasers, 180 days" at 4,600 seeds. Testing a lookalike of the top-25% seed is worth doing as a second ad set, but only if the budget can give it a fair trial, which on a $150/day account it probably cannot.

A 1% lookalike in the United States is roughly 2.2 million people, a 5% is roughly 11 million, and a 10% is roughly 22 million. Those are approximations from a US Meta base in the low hundreds of millions, and the exact figure does not matter; the ratio does. Larger percentages mean looser resemblance and more room for the delivery system to work, which is now usually a good thing rather than a bad one.

**Broad targeting plus a strong signal is the modern default.** Set location, an age floor, and almost nothing else; give the campaign a well-defined conversion event to optimize toward; put excellent creative in front of it. The delivery system knows more about who buys kitchen goods than the interest taxonomy does, and modern optimization has largely closed the gap that hand-built targeting used to fill. The condition attached is critical: broad only works when the conversion signal is firing often enough for the system to learn from. On a campaign producing four purchases a week, broad targeting is a coin flip. Which brings us to the arithmetic that governs everything.

## Audiences on LinkedIn

LinkedIn's audience data is self-reported professional data, which makes it the most accurate firmographic targeting available and also the most expensive. The dimensions worth knowing:

- **Job title.** Precise, but title language varies enormously across companies. "Service Manager" and "Operations Manager" and "Dispatch Supervisor" may be the same person at three contractors.
- **Job function plus seniority.** More robust than titles because it normalizes across naming conventions. Function "Operations" plus seniority "Manager, Director, Owner" catches people whose title you never thought of.
- **Member skills.** Broad and noisy; useful as an OR alongside something tighter.
- **Company size, industry, company names, company growth rate.** The firmographic layer. Company list upload (account-based marketing) is the most precise tool LinkedIn offers.
- **Matched audiences.** Contact lists, company lists, website retargeting, and engagement retargeting (video viewers, form openers, single-image ad engagers).

Here is Ashby's actual targeting spec, written the way you should hand it to a colleague:

```txt
CAMPAIGN: Ashby - Demo Request - Prospecting - US

Location:            United States (Recent or permanent location)
Language:            English
Audience expansion:  OFF
LinkedIn Audience Network: OFF for the first 4 weeks (test separately)

INCLUDE (all of the following must be true):

  Company industry:
    Construction
    Consumer Services
    Facilities Services
    Utilities

  AND Company headcount:
    11-50 employees
    51-200 employees

  AND (Job titles OR Job function+seniority):
    Job titles:
      Operations Manager, Service Manager, Field Service Manager,
      Dispatch Manager, General Manager, Owner, President,
      Vice President of Operations, Director of Operations
    OR
      Job function: Operations, Business Development, Support
      AND Job seniority: Manager, Director, VP, Owner, CXO

EXCLUDE:

  Company list: ashby_current_customers.csv (1,400 companies)
  Company list: ashby_open_opportunities.csv (210 companies)
  Job titles containing: Consultant, Recruiter, Student, Intern
  Job function: Human Resources, Legal, Arts and Design

ESTIMATED AUDIENCE SIZE: ~60,000 members
```

Watch the size shrink as filters stack. These are illustrative estimates, but the shape is real:

| Filter stack | Estimated members |
| --- | --- |
| All US LinkedIn members | ~230,000,000 |
| AND the four target industries | ~4,100,000 |
| AND company headcount 11-200 | ~1,600,000 |
| AND job titles OR function+seniority | ~210,000 |
| AND seniority floor applied | ~74,000 |
| AND exclusions (customers, pipeline, title exclusions) | ~60,000 |

LinkedIn will let a campaign run at 300 members. That does not mean it should. The practical range for a B2B prospecting campaign is roughly 20,000 to 400,000; Ashby's 60,000 sits comfortably inside it.

**Too narrow starves delivery.** Below about 20,000 members, LinkedIn struggles to find enough eligible auctions, delivery becomes lumpy, frequency climbs fast, and CPCs inflate because you are competing for a tiny pool. If Ashby cut the spec down to a single title at a single company size, they might land at 6,000 members, and $5,000 a month across 6,000 people is a frequency high enough to make those 6,000 people resent them.

**Too broad wastes it.** Drop the seniority filter and the audience jumps back to 210,000, more than tripling. You would now be paying $11.50 a click to reach field technicians and administrative staff who cannot buy software. LinkedIn's precision is what you are paying the premium for; refusing to use it is the worst of both worlds.

## Audience Size, Overlap, and Fragmentation

This is the section that quietly determines whether a small social budget works at all.

**Overlap.** If you run a "cooking interest" ad set, a lookalike of purchasers, and a broad ad set simultaneously, the same person is eligible in all three. Your ad sets bid against each other in the same auction, which raises your own CPM. Meta's audience overlap tool will show you the percentage; anything above about 20% overlap between two ad sets means you should probably merge them or add mutual exclusions.

**Fragmentation is worse than overlap.** Every ad set needs enough conversion events to optimize. Meta's guidance has long been roughly 50 optimization events per ad set per week to exit the learning phase. Do the arithmetic on Loom & Larder's $150/day budget.

```txt
Total budget                          = $150/day = $1,050/week
Cost per purchase                     = $54.92
Purchases per week, entire account    = $1,050 / $54.92 = 19.1

Split into 8 ad sets:
  Budget per ad set                   = $150 / 8 = $18.75/day = $131.25/week
  Purchases per ad set per week       = $131.25 / $54.92 = 2.4
  Weeks to reach 50 purchase events   = 50 / 2.4 = 20.9 weeks
```

Eight ad sets produce 2.4 purchases each per week. Twenty-one weeks to exit learning, by which time the creative is dead and the season has changed. You have not built eight tests. You have built eight underpowered auctions that will never resolve, plus a reporting table that invites you to make decisions on two-purchase samples. "Ad set C is winning, it has 4 purchases and ad set F only has 1" is noise, full stop.

Now notice something uncomfortable: even the **entire undivided account** produces only 19.1 purchases a week, well short of 50. One ad set at the full $150/day still would not exit learning on a purchase optimization event. So the fix is not merely consolidation; it is choosing a more frequent optimization event.

```txt
Clicks per day = $150 / $1.32                    = 113.6
Add-to-cart rate (assume 3.5x the purchase rate) = 8.4% of clicks
Add-to-carts per day = 113.6 x 0.084             = 9.5
Add-to-carts per week                            = 66.8
```

Sixty-seven weekly add-to-cart events clears the 50 threshold comfortably. So the working structure for Loom & Larder at $150/day is **one or two ad sets, optimized to add-to-cart, not eight ad sets optimized to purchase.** Then, as budget grows past roughly $400 a day, purchase optimization becomes viable and you switch.

The same logic on LinkedIn. Splitting Ashby's 60,000-member audience into six title-based campaigns at $5,000/month:

```txt
Budget per campaign  = $5,000 / 6      = $833/month = $27.40/day
Clicks per campaign  = $833 / $11.50   = 72.4/month
Demos per campaign   = 72.4 x 0.06     = 4.3/month
```

Four demos a month per campaign, with a $191.67 cost per demo that has a margin of error wider than the differences you are trying to detect. Keep it as one campaign until the budget can give each split a real sample. The general rule: **do not create an ad set you cannot afford to fund to significance.**

## Creative Formats and the First Three Seconds

| Format | Strongest at | Watch out for |
| --- | --- | --- |
| Single image | Fast production, clear single offer, retargeting reminders | Ceiling is low; fatigues fastest |
| Video | Demonstration, before-and-after, founder voice, cold prospecting | Expensive to make; needs a hook in the first seconds |
| Carousel | Multiple products, step-by-step explanations, feature walkthroughs | Most people never swipe past card two; front-load |
| Collection / catalog | Ecommerce retargeting against a product feed | Requires a clean product feed |
| Lead form / instant form | Removing landing page friction on mobile, B2B lead capture | Lower-intent leads; add qualifying questions to compensate |
| Document / thought leadership (LinkedIn) | B2B credibility, long-form value before the ask | Slower path to conversion |

Instant forms deserve a specific note because the trade is real and quantifiable. A LinkedIn lead form pre-fills the member's profile data, which typically raises form completion rate substantially over a landing page, but the leads are lower intent because the person never had to visit your site. For Ashby, a form fill obtained in two taps is not the same asset as a demo request from someone who read the page. If a lead form doubles your lead volume and halves your demo-show rate, you have moved numbers and not results. Track show rate, not just lead count.

**The hook rule.** On a scrolling feed, the overwhelming majority of the drop-off happens in the first two to three seconds. Practical consequences:

- The product or the problem must be visible in the very first frame. Logo animations and slow establishing shots are money set on fire.
- The claim, question, or tension must land by second three, in on-screen text as well as audio, because most feed video is watched with sound off.
- Burn in captions. Do not rely on the platform's auto-captions.
- Shoot vertical. A cropped horizontal video in a vertical feed reads as repurposed and gets skipped.
- Native-feeling creative outperforms polished advertising in most feeds. An ad that looks like an ad is pre-filtered by an audience with ten years of practice at ignoring ads.

**Three to five distinct concepts beat twenty near-identical variants.** This is a claim about variance. Twenty variants that differ in headline font, button colour, and stock photo are twenty samples from the same underlying idea; the spread between them is small and mostly noise. Three genuinely different concepts, say a founder-to-camera explanation, a customer-problem demonstration, and a straight product-in-use shot, sample from three different underlying ideas, and the spread between those is routinely 3x to 5x on cost per acquisition.

There is a budget argument too. With twenty ads in one ad set, Meta will concentrate delivery on one or two within days and the other eighteen will accumulate a few hundred impressions each and tell you nothing. You paid for twenty and learned about two. With four, all four get a real trial.

## Creative Fatigue

Social creative decays. The same audience sees the same ad repeatedly, response falls, and your cost per acquisition rises without you changing a single setting. Here is Loom & Larder running one creative at $150/day for four weeks, in a fixed audience:

| Week | Spend | Impressions | Reach | Frequency | Clicks | CTR | eCPC | Orders | Cost per order |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | $1,050 | 72,400 | 51,700 | 1.40 | 869 | 1.20% | $1.21 | 22 | $47.73 |
| 2 | $1,050 | 72,400 | 43,100 | 1.68 | 796 | 1.10% | $1.32 | 19 | $55.26 |
| 3 | $1,050 | 72,400 | 33,800 | 2.14 | 674 | 0.93% | $1.56 | 15 | $70.00 |
| 4 | $1,050 | 72,400 | 26,400 | 2.74 | 543 | 0.75% | $1.93 | 11 | $95.45 |
| **Total** | **$4,200** | **289,600** | | | **2,882** | **1.00%** | **$1.46** | **67** | **$62.69** |

The pattern is the signature of fatigue and you should be able to recognize it instantly: **spend flat, impressions flat, reach falling, frequency rising, CTR falling, cost per order rising.** Reach falls because the delivery system has already exhausted the responsive part of the audience and is re-serving the same people. Nothing about the market changed. The ad got old.

The financial damage: 67 orders at $62.69 each is $4,200 of spend producing 67 x $37.40 = $2,505.80 of gross profit, a loss of $1,694.20. And it did not have to be that bad. Week 1 at $47.73 per order was already above the $37.40 break-even, but week 4 at $95.45 was catastrophic, and a refresh at the end of week 2 would have avoided most of it.

Write the refresh trigger down in advance so you are not making the call emotionally:

- **Frequency above 2.0 in a rolling 7-day window** for a prospecting audience. Retargeting audiences tolerate higher frequency, roughly 3 to 4, because intent is higher and the audience is smaller by design.
- **CTR falls 25% below the creative's own week-one baseline.** Here that threshold is 1.20% x 0.75 = 0.90%. Week 3's 0.93% is on the line; week 4's 0.75% is far past it.
- **Cost per order exceeds break-even for seven consecutive days.** For Loom & Larder that is $37.40.

Whichever fires first, rotate. Refreshing means a genuinely new concept, not a recoloured version of the tired one. A new headline on the same video buys you about a week. Also note that fatigue is per audience: the same creative may be exhausted in a 60,000-person retargeting pool and completely fresh in a 2.2-million-person lookalike.

## Coordinating Organic and Paid

Organic social and paid social are usually run by different people with different metrics, which wastes the single most useful thing organic produces: free creative testing data.

**Organic is a free test bed.** Loom & Larder posts four to six times a week. Each post is an unpaid impression test of a hook, an angle, and a format against a warm audience. The posts that outperform on saves, shares, and watch-through are the concepts most likely to survive contact with a cold paid audience. Instead of guessing which of five concepts to build ads around, you look at eight weeks of organic data and build the ads around the two that already worked. This costs nothing and it is the highest-return coordination available.

Be careful about the transfer, though. Organic engagement comes from an audience that already follows you. A post that overperforms because your existing customers found it funny may not survive in front of strangers. Treat organic performance as a prior that shortens the list of candidates, not as proof.

**Boosting a proven post versus building a purpose-made ad.** Boosting takes an existing organic post and puts paid delivery behind it. It is worth doing when the post already has genuine engagement (comments and shares, not just likes), because that social proof carries over and is not reproducible in a purpose-made ad. It is not worth doing when you need a real call to action, a specific landing page, proper conversion optimization, or the full ad set controls, because boosted posts run a stripped-down set of options. The general rule: **boost for reach and social proof on a proven post; build a purpose-made ad for conversion.** If a boosted post performs, rebuild it as a proper campaign ad rather than pouring budget into the boost.

**Retarget organic engagers.** This is the cheapest audience in a new account and it needs no site tracking. Anyone who watched 50% of a video, engaged with the account in the last 90 days, or opened an instant form is a warm custom audience. For a brand just starting paid, this list often exists before the pixel data does.

A one-week coordinated calendar for Loom & Larder, at $150/day total:

| Day | Organic | Paid |
| --- | --- | --- |
| Mon | Reel: "three-minute weeknight pan sauce," product in frame, no call to action | Prospecting ad set live, $100/day, add-to-cart optimization, creative = top organic reel from two weeks ago |
| Tue | Carousel: "why a heavy-bottom pan actually changes the food" | Prospecting continues |
| Wed | Story poll: "cast iron or carbon steel?" | Prospecting continues; check frequency |
| Thu | Feed post: customer photo repost with permission | Retargeting ad set live, $30/day: 30-day site visitors plus 50% video viewers, purchase optimization |
| Fri | Reel: 20-second product-in-use, no talking | Prospecting + retargeting; $20/day third creative concept enters test |
| Sat | Quiet | Retargeting continues |
| Sun | Recap post, link to the bundle | All ad sets continue; weekly review of frequency, CTR, cost per order |

Total daily paid spend is $100 + $30 + $20 = $150. Note what the calendar does: the organic side keeps producing candidate creative, the paid side runs last month's winning organic concept against cold traffic, and the retargeting ad set catches the people that both sides warmed up. That is coordination rather than two teams posting into the same feed.

## Measurement Honesty

Everything the ad platform tells you about its own performance was graded by the platform. This is not a conspiracy, it is a structural fact, and you have to work around it.

**Attribution windows.** Meta's default is 7-day click plus 1-day view. That means Meta claims credit for a purchase made up to seven days after someone clicked an ad, and up to one day after someone merely **saw** one without clicking. View-through credit is where most of the argument lives: a person who scrolled past your ad, thought nothing of it, and later searched your brand name and bought will be counted by Meta as a Meta conversion, and by Google as a search conversion, and by your email platform if a newsletter was in the path.

**The sums do not add up, and cannot.** A real month for Loom & Larder:

| Source | Reported revenue |
| --- | --- |
| Meta Ads Manager | $12,100 |
| Google Ads | $7,900 |
| Email platform | $6,200 |
| **Sum of platform claims** | **$26,200** |
| **Actual Shopify revenue, all sources** | **$18,400** |

The platforms collectively claim 142% of the revenue that actually happened ($26,200 / $18,400 = 1.424). None of them is lying. Each is answering "did a person who touched me buy?" and many people touched more than one.

**Use blended numbers as the sanity check.** Marketing efficiency ratio is total revenue divided by total ad spend:

```txt
Total revenue                       = $18,400
Total ad spend ($4,500 Meta + $2,200 Google) = $6,700
Blended MER = $18,400 / $6,700      = 2.746  -> 2.75
Break-even ROAS                     = 1.82
Gross profit = $18,400 x 0.55       = $10,120
Contribution = $10,120 - $6,700     = $3,420
```

Blended MER cannot be inflated by attribution arguments because it uses one revenue number from the system of record. It is coarse (it cannot tell you which channel earned it) but it is honest, and it is the number that determines whether the business made money.

**Prove incrementality when the decision is expensive.** The question that matters is not "how many conversions did Meta report?" but "how many of those would have happened anyway?" Two practical approaches:

- **Geographic holdout.** Turn the channel off in 15% of markets for four weeks, matched to a control set on prior revenue, and compare revenue trajectories. Clean, but it costs you the revenue in the holdout markets.
- **Audience holdout / platform lift study.** Both major platforms offer a study in which a randomized share of your target audience is withheld from your ads and the difference in conversion rate is measured. Cheaper and easier than a geo test, but you are again relying on the platform to grade the platform, so treat the result as directional.

Either way, read the result honestly: a lift test on a small budget over two weeks is very unlikely to produce a conclusive number, and a "23% lift" with a confidence interval spanning zero is not a result. Lesson 10 covers how to size and read those tests properly, and lesson 08 covers making the underlying conversion data trustworthy in the first place. Both apply here in full.

## Search, Social, or Both

The decision is almost always about whether the demand already exists and whether the buyer already knows they have the problem.

| Objective | Search | Social | Recommendation and reasoning |
| --- | --- | --- | --- |
| Emergency HVAC repair, same day | Excellent | Poor | **Search, heavily.** The demand is acute, self-identifying, and time-boxed. A person with a dead AC is typing, not scrolling, and no creative can manufacture a broken compressor. Social's only role is name recognition that improves search CTR later. |
| New kitchen product launch, DTC | Weak | Excellent | **Social first, search second.** Nobody searches for a product category they have never seen. Creative has to demonstrate the thing before demand can exist. Add a small search campaign on brand and on the closest generic category term to capture the demand social creates. |
| B2B SaaS demo pipeline, trade contractors | Moderate | Excellent | **Both, weighted to social (LinkedIn).** Search volume for "field service software" exists but is thin and expensive, and it misses everyone who has not yet framed their problem as a software problem. LinkedIn's firmographic targeting reaches the right 60,000 people whether or not they are searching. Keep search for the high-intent bottom of the funnel and competitor terms. |
| Maintenance plan renewal push, existing customers | Poor | Excellent | **Social, using customer match.** These people are not searching for you; they already bought from you. A customer list custom audience reaches them at low CPM with a message they have context for. Search can only catch the small fraction who happen to look you up. |

The pattern: search wins where intent is explicit, urgent, and already articulated. Social wins where you have to create the intent, where you need to reach a defined group of people who are not currently looking, or where you already know exactly who to talk to. Most mature accounts run both, with search capturing the demand and social creating and re-engaging it.

## Paid Social for Northgate

Search wins emergency repair for Northgate and it is not close. The economics of the AC Repair campaign, $8.20 clicks converting at 11% for a $74 CPA against a $108 lead value, exist because the searcher has an emergency. Meta cannot produce a broken compressor and cannot get in front of someone in the ninety minutes between the failure and the phone call.

But there are three places paid social earns its budget for Northgate, and they all involve demand that search cannot reach.

**Replacement season awareness.** A homeowner with a 16-year-old furnace is not searching for anything. They will search in November, once, in a panic, and whoever they call is largely determined by whether they recognize a name. A replacement lead is worth $432 in gross profit against a $180 target CPA, which is generous enough to fund a longer, less certain path. Size the test:

```txt
Monthly test budget                              = $2,000
Local CPM (assume $18 for a tight geo)           = $18.00
Impressions = $2,000 / $18 x 1,000               = 111,111
Clicks at a 0.9% CTR = 111,111 x 0.009           = 1,000
Effective CPC = $2,000 / 1,000                   = $2.00
Leads at a 1.1% landing page conversion rate     = 11.0
Cost per replacement lead = $2,000 / 11          = $181.82
```

That lands almost exactly on the $180 target CPA, which means it is worth testing and not worth assuming. Run it for the eight weeks before the freeze, with a homeowner-only geo-fenced audience inside the 25-mile radius, and judge it on booked estimates rather than on Meta's reported form fills.

**Maintenance plan retargeting.** Upload the customer list, exclude existing plan holders, and target past repair customers with a plan offer. This is cheap (warm audience, small, high CPM but tiny reach requirement), it is the one place Northgate has data no competitor has, and search cannot reach these people at all because they are not searching.

**Replacement page retargeting.** Anyone who visited the system replacement page and did not convert is a person actively considering an $8,500 purchase. A 30-day retargeting audience against that page, with a financing-focused creative, is the highest-intent social audience Northgate can build.

What paid social should not do for Northgate: compete with search for emergency repair, run broad awareness with no offer, or absorb budget that Furnace Install search is currently losing to rank. Test it with money that is genuinely incremental, and hold replacement leads to the $180 target ($432 break-even), repair leads to the $60 target ($108 break-even), and direct maintenance-plan sales to their separate $95 first-year break-even. A $189 annual plan sale is not a repair lead.

## Practice

You are producing a complete paid social plan for two very different businesses. Everything lives in a spreadsheet, a written spec document, and **draft or unpublished ad sets** in Meta Ads Manager and LinkedIn Campaign Manager. Nothing is published and no live money is spent at any point.

**Scenario A — Loom & Larder on Meta.** Budget $150/day. Use CPM $14.50, CTR 1.1%, landing page conversion rate 2.4%, AOV $68, gross margin 55%.

**Scenario B — Ashby Field Software on LinkedIn.** Budget $5,000/month. Use CPC $11.50, landing page conversion to demo 6%, demo-to-close 20%, first-year contract $9,000 at 70% gross margin.

**Deliverable 1 — Objective and structure.**

1. For each scenario, state the campaign objective you would select and one sentence on the specific event you are optimizing toward. Explain in two sentences why the objective one step upstream would cost you money.
2. Draw the account structure for each: campaign, ad sets or campaigns, ads. State how many ad sets you are creating and where the budget lives (campaign level or ad set level), with a reason.

**Deliverable 2 — Audience specs.**

3. Write the Meta audience specification for Loom & Larder in a plain-text block: the prospecting audience (including whether you are going broad or building a lookalike, and the seed you would use with its size), and the retargeting audience with its lookback window and its exclusions.
4. Write the LinkedIn audience specification for Ashby in a plain-text block, in the same format as the Ashby spec in this lesson: location, includes with AND/OR logic made explicit, excludes, and your estimated audience size.
5. For the LinkedIn spec, produce a filter-stack table showing your estimated audience size after each filter is applied. State whether your final size is inside the workable range and what you would change if it came in under 20,000.

**Deliverable 3 — Fragmentation check (this one is mandatory and it is where most plans fail).**

6. For each scenario, compute events per ad set per week: budget per ad set divided by your cost per optimization event. Show the division.
7. Compare that number to a threshold of roughly 50 optimization events per ad set per week. If your structure fails the test, either reduce the number of ad sets or move to a higher-frequency optimization event, and show the arithmetic for the version that passes.
8. State in one sentence the minimum budget at which you would split into more ad sets.

**Deliverable 4 — Creative.**

9. Write three genuinely distinct creative concepts per scenario (six total). For each: the format, the first-three-seconds hook written out as it would appear on screen, the core claim, and the call to action. The three concepts must differ in idea, not in styling.
10. For each concept, name the one thing you are actually testing with it, so a losing concept teaches you something.
11. Write your creative refresh trigger: the frequency threshold, the CTR decay threshold expressed against a week-one baseline, and the cost-per-result threshold. Use your own break-even figure for the third one.

**Deliverable 5 — Budget and expected results (spreadsheet).**

12. For Loom & Larder, build the full chain per 1,000 impressions: CPM, clicks, effective CPC, orders, cost per order, ROAS, break-even ROAS, gross profit per order, contribution per order. Then scale it to a 30-day month at $150/day. Show every division.
13. State plainly whether the baseline campaign is profitable. If it is not, model at least two improvement scenarios with the arithmetic and state the minimum CTR and landing page conversion rate combination that reaches break-even.
14. For Ashby, compute cost per demo, contribution per demo, demos per month, closed customers per month, gross profit, and contribution. Then compute the allowable cost per demo at a stated contribution target and compare it to your actual.
15. For Ashby, compute the audience frequency implied by your budget (clicks, then impressions at an assumed CTR, then impressions divided by audience size) and state whether the budget is inside the audience's capacity. State your CTR assumption inline.
16. State the non-media constraint on Ashby's spend and how many demos per month their sales capacity can absorb. Make an assumption if you need to and label it.

**Deliverable 6 — One-week organic and paid coordination calendar.**

17. Build a seven-day table for Loom & Larder with an organic column and a paid column. Every paid row states the ad set, the daily amount, and the optimization event. The daily paid amounts must total $150.
18. At least one paid creative must be sourced from a proven organic post, and you must say which post and what evidence made it "proven."
19. Include one retargeting ad set fed by organic engagement, and name the specific engagement event that builds it.

**Deliverable 7 — Search versus social judgement.**

20. Write a short recommendation for Northgate Heating & Air: which of their four campaigns' objectives should stay on search only, and what specific paid social test (audience, budget, offer, duration, success threshold) you would run. Use the $432 replacement lead value and the $180 target CPA, and show the cost-per-lead arithmetic for your proposed test.

**Deliverable 8 — Build it, paused.**

21. In Meta Ads Manager, build the Loom & Larder campaign and ad sets as **drafts**. In LinkedIn Campaign Manager, build the Ashby campaign in **draft** status. Enter the objective, the budget, the audience spec, the placements, and the schedule.
22. Before you finish, confirm and screenshot that both are unpublished or draft and that no ad is eligible to deliver.

**What a reviewer should be able to do with your submission:** find the cell where you decided the campaign was or was not profitable, and check your division.
