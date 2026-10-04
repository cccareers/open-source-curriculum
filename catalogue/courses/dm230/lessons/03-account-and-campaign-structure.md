---
lesson_id: dm230-03
course_id: dm230
pathway: digital-marketer
title: Account and Campaign Structure
order: 3
kind: lesson
competency_ids:
  - D3-S1-C01
objectives:
  - Structure a paid account into campaigns and ad groups that can be optimized
---

## Structure Is Not Tidiness

New managers treat account structure as housekeeping, something you do so the interface looks organized. It is not. Structure is the only mechanism you have for controlling where money goes and for reading what happened afterwards. Every optimization you will ever perform depends on being able to say "this spend produced these results", and you can only say that about units the platform reports separately. An account with one campaign and one ad group is not a messy account. It is an account with exactly one number, and one number cannot be optimized.

Hold two sentences for the rest of this lesson.

**A campaign is a budget boundary and a targeting boundary.** Money is allocated at the campaign level and cannot cross campaign lines. Geography, schedule, network, and bid strategy are also set there. If you want to be able to spend more on AC repair without spending more on furnace installation, they must be different campaigns. There is no other way.

**An ad group is a message boundary.** Keywords and ads live together in an ad group, and every keyword in that ad group is served by the same set of ads. If you want the searcher who typed "emergency ac repair" to see the words "emergency ac repair" in the headline, then that keyword needs to live with ads written for it, and not with `hvac maintenance plan`.

Almost every structural decision in this lesson is an application of one of those two sentences. When you cannot decide whether something deserves its own campaign, ask whether you want to control its budget or its targeting separately. When you cannot decide whether something deserves its own ad group, ask whether it needs a different message.

We build this on Northgate Heating and Air, the residential HVAC contractor in the Columbus metro that runs through this whole course. Northgate spends $200 a day, roughly $6,080 a month across 30.4 days. Repair leads are worth $108 in gross profit with a $60 target CPA; replacement leads are worth $432 with a $180 target CPA. Structure is what makes it possible to hold those two very different targets in the same account.

## The Hierarchy

```txt
Account                    (billing, conversion actions, account-level assets,
  │                         shared budgets, shared negative keyword lists,
  │                         portfolio bid strategies, audience lists)
  │
  ├── Campaign             (BUDGET, bid strategy, networks, locations, ad
  │     │                   schedule, languages, start/end dates, campaign
  │     │                   negatives, campaign-level assets)
  │     │
  │     ├── Ad group       (default max CPC, keywords, ads, ad group
  │     │     │             negatives, ad-group-level assets, audiences)
  │     │     │
  │     │     ├── Keywords         (individual bid overrides, final URLs)
  │     │     ├── Ads              (responsive search ads; headlines,
  │     │     │                     descriptions, final URL, paths)
  │     │     └── Assets           (sitelinks, callouts, structured snippets,
  │     │                           call, location, price, promotion, image)
  │     └── Ad group
  └── Campaign
```

Four levels, and the level a setting lives on determines what you can and cannot control independently. That is worth a table you can refer back to.

| Setting | Level it lives at | Why it matters |
| --- | --- | --- |
| Daily budget | Campaign | Money cannot move between campaigns on its own. This is the master control. |
| Bid strategy | Campaign (or a portfolio spanning campaigns) | One strategy per campaign. You cannot run manual CPC on brand and target CPA on non-brand inside one campaign. |
| Networks (Search, Search partners, Display expansion) | Campaign | Turning on Display expansion inside a search campaign silently changes what you are buying. |
| Locations and location options | Campaign | Northgate's 25-mile radius is a campaign setting, not an account setting. |
| Ad schedule (dayparting) | Campaign | You cannot run brand 7am–9pm and non-brand evenings-only inside one campaign. |
| Languages | Campaign | |
| Start and end dates | Campaign | How a seasonal campaign gets switched off cleanly. |
| Device bid adjustments | Campaign, and ad group for some strategies | |
| Campaign negative keywords and negative lists | Campaign (lists are shared at account level) | |
| Default max CPC | Ad group | The bid that applies to every keyword in the group unless overridden. |
| Keywords | Ad group | |
| Ads (responsive search ads) | Ad group | Every keyword in the group is served by these ads. This is the message boundary. |
| Ad group negative keywords | Ad group | Used to force traffic into the correct ad group. |
| Assets (sitelinks, callouts, call, and so on) | Account, campaign, or ad group | More specific overrides less specific. |
| Final URL | Ad, with keyword-level override | |
| Conversion actions | Account, with campaign-level goal overrides | Which conversions a campaign optimizes toward. |

Read the table once for content and once for consequence. Anything on a campaign row is something you gave up controlling separately the moment you merged two things into one campaign. That is the real cost of a lazy structure, and it is invisible until you need the control and discover you do not have it.

A few of the rows deserve a note. **Assets** cascade: an asset set at the account level appears everywhere it is not overridden, one set at the campaign level overrides the account, and one set at the ad group level overrides both. That means a callout like "Family Owned Since 1994" belongs at the account level, while a sitelink to `/emergency-ac-repair` belongs on the emergency ad group only. **Conversion actions** are defined once at the account level, but which of them a campaign optimizes toward can be overridden per campaign. That override is how you tell one campaign to chase form fills and another to chase phone calls, and it is one of the few genuinely important settings that people forget exists. And **default max CPC** at the ad group is only a default; individual keywords can carry their own bids, which is useful under manual bidding and irrelevant under most automated strategies.

## Structure Versus Segmentation

Before you split anything, ask a cheaper question: can I just segment the report?

Reporting segments let you break an existing row apart after the fact, without changing the account at all. You can segment almost any report by day, week, hour of day, day of week, device, network, top versus other placement, click type, and conversion action. If the only reason you wanted a separate campaign was to see those numbers apart, you do not need a separate campaign. You need to click the segment button.

Structure is required for two things segments cannot deliver: **control** and **message**.

| I want to... | Can a report segment do it? | So what do I need? |
| --- | --- | --- |
| See mobile performance separately | Yes, segment by device | Nothing structural |
| Spend less on mobile | No, but a bid adjustment can | A campaign-level bid adjustment |
| See evening performance separately | Yes, segment by hour of day | Nothing structural |
| Stop serving after 6 p.m. | No | A campaign, with its own ad schedule |
| See brand and non-brand separately | No, there is no "brand" segment | Separate campaigns |
| Cap what brand can spend | No | Separate campaigns |
| Show a different headline to "emergency ac repair" | No | A separate ad group |
| Send a query to a different landing page | No | A separate ad group, or a keyword-level URL |
| Hold two lead types to two CPA targets | No | Separate campaigns, or separate portfolios |

The pattern in the right-hand column is exactly the two boundary sentences from the top of this lesson. Anything about money or targeting needs a campaign. Anything about the words the searcher sees needs an ad group. Everything else is probably a segment or a bid adjustment, and building a campaign for it costs you data without buying you anything.

This is also the discipline that keeps accounts from sprawling. The most common cause of a 40-campaign account at a business with 150 leads a month is somebody building structure to answer reporting questions that a segment would have answered for free.

## Segmentation Axes: When Something Earns Its Own Campaign

There are six axes on which real accounts get split. For each one, the test is the same: do you need separate budget, separate targeting, or separate reporting badly enough to pay the cost of another campaign?

**Service line.** The most common and usually the right first cut. Northgate's AC repair, furnace install, and maintenance-plan campaign repair leads have different lead values ($108 versus $432 versus $108), different CPCs ($8.20 versus $8.99 versus $4.79), different conversion rates (11% versus 6.7% versus a small-volume number), and different seasons. They cannot share a budget or a CPA target without one of them subsidizing another invisibly. Split them.

**Intent stage.** "emergency ac repair" and "how much does ac repair cost" are the same service line and completely different moments. The first person wants a phone number in the next ninety seconds. The second is researching and may buy in three weeks. If you want to bid differently on those, or send them to different pages, or hold them to different CPA targets, they need to be separated. At Northgate's scale, intent stage is usually an ad group split rather than a campaign split, because the volume does not justify two budgets.

**Geography.** Split by geography when the economics genuinely differ, not because you can. Northgate serves one 25-mile radius from one shop, so one geographic target is correct. If they opened a second shop in Dayton with a different crew and a different capacity constraint, that would be a second campaign, because you would want to control Dayton's budget independently of Columbus's. A multi-location franchise with fifteen markets is the classic case for geographic campaign splits.

**Brand versus non-brand.** Not optional. This gets its own section below because getting it wrong corrupts every number in the account.

**Margin.** When two products have very different contribution per sale, they cannot share a CPA target. Northgate's replacement leads are worth four times a repair lead. A single campaign optimizing to a single target CPA will either overpay for repairs or underpay for replacements, and probably both at once.

**Seasonality.** When something must be switched off for months at a time, it needs to be a campaign so you can pause it without collateral damage. Pausing an ad group inside a shared campaign leaves that campaign's budget and bid strategy to redistribute in ways you did not plan.

There are two axes people split on that usually do not earn it. Match type is one; modern match type behaviour makes match-type campaigns far less useful than they were, and it is covered properly in lesson 04. Device is another; device bid adjustments handle it without a structural split unless you have genuinely different landing pages and offers by device.

## Brand and Non-Brand: Why the Split Is Mandatory

Someone searching "northgate heating and air" and someone searching "emergency ac repair" have almost nothing in common except that they both end up on Northgate's site. Mixing them in one campaign causes three distinct failures.

**Failure one: budget cannibalization.** Brand clicks cost $1.90 and convert at 28%. Non-brand AC repair clicks cost $8.20 and convert at 11%. Under a shared budget and any strategy that chases volume, cheap clicks win, and brand quietly absorbs money that was supposed to go to acquisition. The reverse also happens and is worse. On the first genuinely hot day of summer, non-brand emergency traffic floods in, the shared $200 daily budget is exhausted by mid-afternoon, and Northgate's own brand ad stops showing at exactly the hour when the most people are looking them up after seeing their van. Buckeye Comfort's conquest ad shows in its place, on a query containing Northgate's name, for $1.90 a click.

Size that using an explicitly uniform click-rate assumption across the 14 staffed hours. Brand takes 316 clicks over the report's 30 days, about 10.53 clicks a day. Losing the final six staffed hours, 3pm to 9pm, costs roughly 10.53 x (6 / 14) = 4.51 clicks, which at a 28% conversion rate is 1.26 expected leads, worth about $136.51 in gross profit. Fifteen such peak days across a summer is about $2,048, and that is before counting the leads a competitor picked up on your own brand name. Separate campaigns with separate budgets make this structurally impossible, because brand's $20 a day cannot be consumed by non-brand no matter what the auction does.

**Failure two: incompatible economics in one bid strategy.** A campaign has one bid strategy. Brand should be bid to hold near-total impression share cheaply. Non-brand should be bid to a CPA target. Those are different jobs and they cannot both be done by one setting.

**Failure three, and the expensive one: the reporting lies.** Here is Northgate's canonical 30-day report.

| Campaign / ad group | Spend | Clicks | Avg CPC | Conv | CPA |
| --- | --- | --- | --- | --- | --- |
| Brand - Northgate | $600 | 316 | $1.90 | 88 | $6.82 |
| Non-brand - AC Repair | $3,200 | 390 | $8.21 | 43 | $74.42 |
| Non-brand - Furnace Install | $1,600 | 178 | $8.99 | 12 | $133.33 |
| Non-brand - Maintenance Plans | $680 | 142 | $4.79 | 9 | $75.56 |
| **Total** | **$6,080** | **1,026** | **$5.93** | **152** | **$40.00** |

Now imagine all four of those were one campaign called "Search". The only number you would see is the total row.

```txt
Blended CPA = $6,080 / 152 conversions = $40.00

Against Northgate's $60 target CPA for a repair lead, $40.00 looks like a
33% outperformance. The agency puts it on the first slide of the review.

Strip out brand:
  Non-brand spend       = $6,080 - $600 = $5,480
  Non-brand conversions = 152 - 88      = 64
  Non-brand CPA         = $5,480 / 64   = $85.625 -> $85.63

Against the same $60 target, non-brand is missing by 43%.
```

Two numbers, computed from the same month, pointing in opposite directions. The blended $40.00 is arithmetically true and operationally worthless, because 88 of the 152 conversions, 58% of them, came from people who typed the company's name. Those people were going to find Northgate anyway through one channel or another. The $600 spent to catch them at $6.82 apiece is excellent value, and it is not customer acquisition. Blending it into the acquisition number lets a failing non-brand program hide behind a working brand program for as long as nobody breaks out the rows.

The blend lies a second time, more subtly, because it mixes lead types. Furnace Install leads are replacements worth $432; the other three rows are repairs worth $108. Price the contribution properly:

```txt
Naive blended contribution (all 152 leads priced at $108):
  152 x ($108 - $40.00) = 152 x $68.00 = $10,336

Correct segmented contribution:
  Brand           88 x $108 - $600   = $8,904
  AC Repair       43 x $108 - $3,200 = $1,444
  Furnace Install 12 x $432 - $1,600 = $3,584
  Maint. Plans     9 x $108 - $680   =   $292
                                      -------
                            Total     $14,224
```

The naive figure understates total contribution by nearly $3,900 because it prices replacement leads as repairs, and it simultaneously overstates how well acquisition is working. Both errors come from the same cause: reporting units that do not match economic units. Structure is what makes reporting units match economic units.

A note on what "brand" means in practice. Brand campaigns hold the company name and its common variants and misspellings. Everything else is non-brand. Competitor names, if you bid on them, belong in a third bucket, because they behave like neither: high intent, terrible quality signals, poor conversion rates, and a distinct policy and ethics profile. Keep them separate so you can judge them honestly and kill them if they do not work.

## How Many Ad Groups, and How Tight

An ad group exists to hold a set of keywords that can honestly be served by the same ads. That is the entire test. If you cannot write three headlines that are genuinely relevant to every keyword in the group, the group is too broad.

Consider a group holding `ac repair`, `furnace install`, and `hvac maintenance plan`. The only headline that fits all three is something like "Heating and Cooling Services", which fits nothing well. Now consider a group holding only `emergency ac repair`, `ac repair emergency`, and `same day ac repair`. The headline writes itself: "Emergency AC Repair, Columbus", "Arrival Window Confirmed", "Open 7am-9pm, No Overtime". Every searcher sees their own words back.

That is message match, and it pays three times over. It raises click-through rate because the ad visibly answers the query. It raises the ad relevance component of Quality Score, which lowers cost per click through the pricing formula you worked in lesson 02. And it lets you point the ad at a specific landing page, `northgateheatingair.com/emergency-ac-repair` rather than the homepage, which raises the landing page experience component too. One structural decision moves all three quality components in the same direction.

Put a number on the first of those three. Ad copy craft is lesson 05's subject, so ignore the wording quality here and look only at what the structure permits.

| Query typed | Headline a shared "General HVAC" ad group can offer | Headline a themed ad group can offer |
| --- | --- | --- |
| emergency ac repair columbus | Heating and Cooling Services | Emergency AC Repair, Columbus |
| how much does ac repair cost | Heating and Cooling Services | AC Repair Cost, Upfront Pricing |
| hvac maintenance plan | Heating and Cooling Services | HVAC Maintenance Plan, $189/yr |

The left column is not badly written. It is structurally incapable of matching, because one ad has to cover three unrelated intents. Now price the difference at Northgate's volume, holding impressions fixed so that only the click-through rate changes.

```txt
Northgate's tight AC Repair ad group: 390 clicks at a 6.4% CTR
  Impressions = 390 / 0.064 = 6,093.75 -> 6,094  (rounded)

Suppose those same keywords sat in a single untargeted ad group and the CTR
fell to 4.4%, which is roughly what a generic ad earns on specific queries:
  Clicks = 6,094 x 0.044 = 268.1 -> 268
  Clicks lost = 390 - 268 = 122 per month  (a 31% reduction)

At the ad group's 11% conversion rate:
  Conversions on 390 clicks = 42.9 -> 43   (matches the report)
  Conversions on 268 clicks = 29.48 -> 29
  Leads lost = 14 per month

Gross profit lost = 14 x $108 = $1,512 per month
Cost avoided on the 122 clicks not bought = 122 x $8.20 = $1,000.40
Net contribution lost = $1,512 - $1,000 = $512 per month
```

I rounded impressions to the nearest whole number and truncated conversions down to whole leads in this conservative example. The $512 a month is the conservative figure, because it counts only the direct click effect. It ignores the second and third payoffs: the lower expected CTR also drags the quality index down, which raises the cost of every remaining click, and the generic ad has to point somewhere generic, which drags landing page experience down too. Those effects compound, which is why badly structured accounts do not perform slightly worse than well structured ones. They perform much worse.

The practical rule for a business Northgate's size: **three to six ad groups per campaign, each holding five to twenty closely related keywords, each with its own responsive search ad and its own landing page.** Fewer than three and you are probably under-segmented. More than eight and you should check the volume arithmetic in the next section before you commit.

Two failure patterns to recognize. The first is the "everything" ad group, usually named "Keywords" or "General", which accumulates whatever nobody knew where else to put. It always has the worst relevance scores in the account and it always contains the account's most expensive mistakes. The second is the orphan: an ad group with two keywords and forty impressions a month, created for a theme that does not have real search volume. Fold orphans back into their nearest neighbour.

## The Northgate Account Tree

Here is an illustrative account tree, with rounded daily budgets that sum to the $200 daily allocation. The baseline report totals $6,080; this simplified tree totals the same monthly allocation at 30.4 days, but its individual rounded campaign budgets differ slightly from the precise split in lesson 06. It shows one representative keyword theme per ad group and the proposed staffed-hour schedule, which removes the baseline report's outside-hours traffic. Lesson 04 covers how those keyword themes get built and controlled; treat the keywords here as illustration of scope, not as a finished keyword list.

```txt
Northgate Heating & Air  (account)
│  Conversion actions:  Phone Call >60s ($108 repair; separate replacement action) [primary]
│                       Book a Visit - Repair ($108) [primary]
│                       Book a Visit - Replacement ($432) [primary]
│                       Contact page view  [secondary]
│  Shared negative lists:  NGH_NEG_Jobs, NGH_NEG_DIY, NGH_NEG_OutOfArea
│  Account assets: callouts, structured snippets, location, call
│
├── NGH-SRCH-BR-Core-COL25                          $20/day   Manual CPC $3.00
│   │  Geo: Columbus OH, 25 mi radius | Search network only | 7am-9pm, seven days
│   ├── ag: brand-core            e.g. northgate heating and air
│   └── ag: brand-plus-service    e.g. northgate heating air ac repair
│
├── NGH-SRCH-NB-ACRepair-COL25                      $105/day  tCPA $60
│   │  Geo: Columbus OH, 25 mi radius | Search network only | 7am-9pm, seven days
│   ├── ag: emergency-ac-repair   e.g. emergency ac repair columbus
│   │        -> /emergency-ac-repair
│   ├── ag: ac-not-cooling        e.g. ac not blowing cold air
│   │        -> /ac-repair
│   ├── ag: ac-repair-general     e.g. ac repair near me
│   │        -> /ac-repair
│   └── ag: ac-repair-cost        e.g. how much does ac repair cost
│            -> /ac-repair-pricing
│
├── NGH-SRCH-NB-FurnaceInstall-COL25                $53/day   Max Conversions, no target
│   │  Geo: Columbus OH, 25 mi radius | Search network only | 7am-9pm, seven days
│   ├── ag: furnace-replacement   e.g. furnace replacement columbus
│   │        -> /furnace-installation
│   ├── ag: new-furnace-cost      e.g. new furnace cost installed
│   │        -> /furnace-installation-cost
│   └── ag: hvac-system-replace   e.g. hvac system replacement
│            -> /system-replacement
│
├── NGH-SRCH-NB-MaintPlans-COL25                    $22/day   Manual CPC $5.00
│   │  Geo: Columbus OH, 25 mi radius | Search network only | 7am-9pm, seven days
│   ├── ag: hvac-maintenance-plan e.g. hvac maintenance plan columbus
│   │        -> /maintenance-plans
│   └── ag: ac-tune-up            e.g. ac tune up special
│            -> /maintenance-plans
│
└── NGH-SRCH-NB-FurnaceRepair-COL25-SEASONAL        PAUSED  ($60/day when on)
    │  Runs 15 Oct - 31 Mar | Geo: Columbus OH, 25 mi | Search only | 7am-9pm, seven days
    ├── ag: emergency-furnace-repair  e.g. emergency furnace repair
    │        -> /emergency-furnace-repair
    ├── ag: furnace-not-heating       e.g. furnace blowing cold air
    │        -> /furnace-repair
    └── ag: no-heat                   e.g. no heat in house
             -> /emergency-furnace-repair

Budget check: 20 + 105 + 53 + 22 = $200/day active.
              Furnace Repair is paused in this window; when it activates in
              October its $60/day comes out of AC Repair, which falls to $45.
```

Notice what the tree buys you. Five separate budget dials. Three different bid strategies chosen for three different economic situations. A CPA target of $60 on repair leads and $180 on replacement leads, coexisting in the same account without either contaminating the other. A landing page per ad group. And a report where every row means something.

Notice also what is deliberately not split. There is no separate mobile campaign, no separate campaign per match type, and no separate campaign per zip code. Each of those would triple the campaign count and divide the data by three, for control nobody at this scale needs.

## Naming Conventions That Survive a Year

You will not manage this account forever. Someone will inherit it, possibly you, eighteen months from now, with no memory of why anything is the way it is. Names are the only documentation that ships with the account.

A convention is worth having only if it is mechanical. Write it down, follow it without exception, and make it sortable and filterable. Here is the pattern used above:

```txt
CAMPAIGN:
  <Account>-<Channel>-<BrandFlag>-<ServiceLine>-<Geo>[-<Modifier>]

  Account     3-letter account code            NGH
  Channel     SRCH | PMAX | DISP | VID | SOC   SRCH
  BrandFlag   BR | NB | COMP                   NB
  ServiceLine PascalCase, no spaces            ACRepair
  Geo         market code + radius             COL25
  Modifier    optional: SEASONAL, TEST, LP-A   SEASONAL

AD GROUP:
  <theme>-<intent>            lowercase, hyphenated, no account prefix
                              (the campaign already carries the context)
```

Eight names produced by that pattern:

```txt
NGH-SRCH-BR-Core-COL25
NGH-SRCH-BR-Competitor-Defense-COL25
NGH-SRCH-NB-ACRepair-COL25
NGH-SRCH-NB-FurnaceInstall-COL25
NGH-SRCH-NB-FurnaceRepair-COL25-SEASONAL
NGH-SRCH-NB-MaintPlans-COL25
NGH-SRCH-NB-ACRepair-COL25-TEST-tCPA45
NGH-SRCH-COMP-Conquest-COL25
```

Four rules that make names survive.

**Put the most stable element first and the most volatile last.** Account, channel, and brand flag never change. Test modifiers change constantly. Sorting alphabetically then groups everything sensibly.

**Never encode anything that lives in a setting.** Do not put the budget or the bid amount in the name. Budgets change weekly and the name will be wrong within a month, and a wrong name is worse than no name.

**Use one separator for structure and never inside a field.** Hyphens between fields, PascalCase inside them. This makes automated filters and bulk-sheet parsing possible.

**Make test names self-documenting and dated in the description field, not the name.** `TEST-tCPA45` tells you what is being tested. When the test concludes, the modifier comes off and the campaign either dies or becomes the standard.

Apply the same discipline to shared assets: `NGH_NEG_Jobs` and `NGH_NEG_OutOfArea` tell the next person exactly what is inside them, where `Negative list 1` tells them nothing and will not be maintained.

## Over-Segmentation Starves the Machine

Everything above pushes toward more separation. There is a hard limit in the other direction, and it is a data limit rather than an aesthetic one.

Automated bidding works by modelling conversion probability from observed conversions. A campaign that produces very few conversions per month gives the model almost nothing to learn from, and the model falls back toward broad averages. Precisely how many conversions are needed varies, but the working guidance for target CPA is roughly 30 conversions in 30 days at the strategy level for this course's planning and evaluation exercises. This is a teaching heuristic, not a universal platform eligibility requirement; sparse data makes local evaluation less reliable. Lesson 06 explains the distinction.

Do the arithmetic on Northgate's Furnace Install campaign.

```txt
Furnace Install, 30 days: 178 clicks, $1,600 spend, 12 conversions

As one campaign with 3 ad groups:
  conversions per campaign per month = 12        (thin, but a single tCPA
                                                  strategy sees all 12)
  clicks per ad group per month      = 178 / 3   = 59.3 -> 59

Split into 6 ad groups "for tighter message match":
  clicks per ad group per month      = 178 / 6   = 29.7 -> 29
  conversions per ad group per month = 12 / 6    = 2

Now try to detect an improvement in one of those ad groups. Its baseline
conversion rate is 6.7% on 29 clicks, or 1.9 conversions. Suppose a rewrite
lifts it to 9.0%:
  expected conversions = 29 x 0.090 = 2.6

You are asking someone to tell the difference between 2 conversions and 3
conversions in a month. That difference is indistinguishable from luck. At
this volume you would need roughly a year of data to call the result.
```

The conclusion is not "never segment". It is that segmentation has a cost paid in statistical power, and you should only pay it where the volume can afford it. Northgate's AC Repair campaign, at 390 clicks and 43 conversions a month, can carry four ad groups comfortably. Furnace Install, at 178 clicks and 12 conversions, should carry two or three and no more. Maintenance Plans, at 142 clicks and 9 conversions, should carry two.

A practical test before you split anything: divide the current monthly conversions by the number of pieces you are proposing. If any piece lands below about 10 conversions a month, you are splitting for tidiness, not for control, and you should stop. And if a split is genuinely necessary for message match but destroys the bidding data, that is an argument for a portfolio bid strategy, which is the next section.

## Shared Budgets and Portfolio Bid Strategies

Two account-level features are really structural tools, and both exist to soften the rigid boundaries campaigns impose.

A **shared budget** lets several campaigns draw from one pool. Northgate could put the three non-brand repair-type campaigns on a single $180-a-day shared budget so that a slow furnace day releases money to AC repair automatically. The benefit is that money follows demand without you touching anything. The cost is that you lose the per-campaign spending cap, which is the whole point of a campaign boundary. Use a shared budget when the campaigns share an economic target and you genuinely do not care which one spends the money. Never put brand and non-brand on a shared budget, because the entire reason brand is separate is to protect its money.

A **portfolio bid strategy** applies one bid strategy across several campaigns, so they pool their conversion data for the model. This is the correct answer to the thin-data problem when you need structural separation for message or reporting reasons but each piece is too small to learn on its own. Northgate could pool AC Repair and Maintenance Plans in a repair-lead portfolio at a $60 target CPA: 43 + 9 = 52 monthly conversions, each worth $108. Keep Furnace Install separate. Its $180 replacement-lead CPA is a business benchmark, not a configured bidding target; mixing $432 replacement leads with $108 repair leads under one shared target would erase their different economics. The seasonal Furnace Repair campaign can join the repair pool when active, while each campaign keeps its own budget and pause control.

The general shape: use separate campaigns for control, and use portfolios to restore the statistical power that separation cost you. Lesson 06 covers the bid strategies themselves and when each one is appropriate.

## Structure and Seasonality

Northgate's year has two events: the first genuinely hot week of summer and the first hard freeze of winter. Structure is how you prepare for them.

The **Furnace Repair** campaign in the tree above is paused for roughly seven months a year. Making it a campaign rather than an ad group is what allows a clean seasonal switch: pause it, and its budget is simply not spent, with no side effects on anything else. Had those ad groups lived inside the AC Repair campaign, pausing them in April would leave the AC Repair campaign's bid strategy and budget to redistribute across the remaining groups in ways you did not choose, and the campaign's historical performance data would be a blend of two unrelated seasons.

The **Maintenance Plans** campaign is deliberately active year-round at a small $22 a day, during staffed hours. Its reported conversions are repair-type service leads worth $108, not completed plan purchases. Plans sold separately cost $189 a year and produce $95 of first-year gross profit; any recurring value requires a separate purchase and retention calculation. Always-on small campaigns also keep quality signals warm; a campaign that has been dark for five months restarts with stale data and usually needs two or three weeks to settle.

Three seasonal moves worth planning in advance.

**Pre-season activation.** Turn Furnace Repair on two weeks before you expect the first freeze, not the morning of. Bid conservatively, let quality signals accumulate on real traffic, and be in position when volume triples rather than trying to enter a repriced auction from a cold start.

**Budget reallocation, planned in writing.** Northgate's $200 a day is a hard cap. When Furnace Repair activates at $60, that money must come out of AC Repair, which drops from $105 to $45. Decide this in September, not on the night of the freeze.

**Seasonal ad schedules.** Emergency queries concentrate in the evening in summer and can arrive overnight in winter. Northgate's baseline service and contact hours remain 7am to 9pm, seven days. Schedule call-led ads within those hours; overnight form submissions do not imply an answered call or overnight dispatch. Ad schedules are a campaign setting, which is another reason emergency campaigns are separate from research-intent campaigns.

## Restructuring an Inherited Mess

Most of the accounts you will touch already exist and most of them are badly built. The instinct is to delete everything and start clean on Monday. Resist it, because a rebuild carries three real costs.

New campaigns have no conversion history, so automated bid strategies restart their learning period, typically one to two weeks of degraded and erratic performance. New ad groups and keywords have no quality signal history, so Quality Score reverts toward defaults and CPCs rise until history rebuilds. And if you delete rather than pause the old structure, you lose the ability to compare before and after, which means you will never be able to prove the restructure worked.

Work in four stages.

**Stage 1: audit before you touch anything.** Export 90 days of data at the keyword and search-term level. Answer, in writing: where does the money actually go; which keywords have ever converted; what fraction of spend is brand; what fraction of spend went to search terms that are not commercially relevant at all; which campaign settings are wrong (geography, networks, schedule); what conversion actions exist and whether they are trustworthy. Do not propose a structure until you can answer all six. Half the accounts you audit will have a settings problem, such as Display expansion silently on inside a search campaign, that is worth more than any restructure.

**Stage 2: fix settings and stop the bleeding.** Settings changes are cheap, reversible, and do not reset learning. Fix the geographic targeting, turn off unintended networks, apply obvious negative keyword lists, and pause the keywords that have spent real money over 90 days with zero conversions. Do this in week one and let it run for two weeks. Frequently this alone recovers 20 to 30 percent of wasted spend, and it establishes a clean baseline for everything after.

**Stage 3: migrate one service line at a time.** Build the new campaign for the highest-spend service line, in draft, with the correct structure and naming. Point it at the same conversion actions as the old account, so history and reporting stay comparable. Launch it, and pause the corresponding keywords in the old campaign the same day so the two are never competing for the same query. Run for two to three weeks. Compare CPA and conversion volume against the baseline from stage 2. Only then move to the next service line.

**Stage 4: retire, do not delete.** When a legacy campaign is fully superseded, pause it and rename it with a `ZZ-LEGACY-` prefix so it sorts to the bottom. Its data stays queryable for year-over-year comparisons, and if the new structure underperforms you can restore it in an afternoon.

Two things to preserve at all costs through any restructure. Keep the same conversion actions with the same names and the same counting rules, because changing them mid-migration makes before-and-after comparison impossible and you will never know whether the restructure helped. And keep a written change log with dates, because when performance moves three weeks later, the only way to attribute it is to know exactly what changed and when. Lesson 08 covers conversion tracking and why its integrity is the foundation everything else stands on.

## Practice

All of this work happens in a spreadsheet and in a Google Ads Editor draft or an unpublished draft campaign. Do not publish anything and do not spend any live budget.

### The inherited account

You have taken over Northgate Heating and Air's Google Ads account from the owner's nephew. This is the entire account.

```txt
HVAC Ads  (account)
│  Conversion actions: "Website visit" [primary], "Phone click" [primary]
│  Shared negative lists: none
│
└── Campaign: "Search Campaign 1"              $200/day, Maximize Clicks
    │   Locations: United States
    │   Networks: Search + Search Partners + Display expansion ON
    │   Ad schedule: none (all hours, all days)
    │   Languages: All
    │
    └── Ad group: "Keywords"                   default max CPC $3.00
        │
        ├── 400 keywords, all broad match. A representative sample:
        │     northgate heating and air
        │     northgate hvac columbus
        │     ac repair
        │     ac repair columbus
        │     emergency ac repair
        │     ac not blowing cold air
        │     how much does ac repair cost
        │     furnace repair
        │     furnace not heating
        │     furnace installation cost
        │     new furnace price
        │     hvac maintenance plan
        │     ac tune up
        │     air conditioner
        │     how does an air conditioner work
        │     hvac jobs near me
        │     hvac technician salary columbus
        │     free ac repair
        │     ac repair columbus ga
        │     buckeye comfort systems
        │     ...380 more
        │
        └── Ads: 1 responsive search ad
              H1: Northgate Heating & Air
              H2: HVAC Services in Ohio
              H3: Call Today
              D1: Heating and cooling services. Call now.
              Final URL: northgateheatingair.com   (homepage, all keywords)
```

Last 30 days: $6,080 spent, 2,410 clicks, avg CPC $2.52, 61 conversions, blended CPA $99.67. The owner's targets are unchanged: repair leads worth $108 with a $60 target CPA, replacement leads worth $432 with a $180 target CPA.

### Exercise 1: Audit

1. List every **settings** defect you can find, at campaign level, and state in one sentence what each one is costing. There are at least five.
2. From the 20-keyword sample, sort every keyword into one of four buckets: **brand**, **non-brand commercial**, **negative keyword** (should never trigger an ad), or **separate campaign** (commercially real but does not belong with the rest). Justify every keyword you put in the negative bucket in half a sentence.
3. The account's conversion actions are "Website visit" and "Phone click". Write two sentences on why the reported 61 conversions and $99.67 CPA cannot be trusted, and what you would need to change before any optimization decision is defensible.

### Exercise 2: Rebuild the tree

1. Produce a corrected account tree in the same indented text format as the Northgate tree in this lesson. It must include: campaign names following a stated convention, a daily budget for each campaign summing to $200, a bid strategy for each campaign, the geographic and network settings, ad groups within each campaign, one representative keyword theme per ad group, and a landing page path per ad group.
2. Write your naming convention as an explicit pattern with the field definitions, then list **eight** campaign names your pattern produces for this account. At least one must be seasonal and at least one must be a test.
3. Write a rationale of 300 to 400 words defending your structure. It must explicitly answer: why brand is separate; how many ad groups you gave each campaign and why that number and not double it; which segmentation axes you used and which you deliberately did not; and whether you used a shared budget or a portfolio bid strategy anywhere, and why.
4. Include a **volume check**: for each campaign you created, estimate its monthly conversions using the figures in this lesson and state whether that campaign has enough conversion volume to support an automated bid strategy on its own. Where it does not, say what you will do about it.

### Exercise 3: The migration plan

1. Write a four-week migration plan as a dated table with columns for week, action, expected effect, and the metric you will watch. It must not involve deleting anything, must fix settings before it changes structure, and must migrate service lines one at a time in an order you justify.
2. State exactly which conversion actions the new campaigns will use, and why they must be the same ones the old campaign used during the comparison window.
3. Name the three things most likely to go wrong in weeks two and three, and for each one write the specific number you would look at to detect it and the threshold at which you would roll back.

Deliverable: one document containing the audit, the corrected tree in a text block, the naming convention with its eight names, the rationale, the volume check, and the migration plan. A Google Ads Editor draft of the corrected structure, unpublished, is an acceptable substitute for the tree diagram if you export it as text.
