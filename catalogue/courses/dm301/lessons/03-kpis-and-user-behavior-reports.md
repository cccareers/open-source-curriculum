---
lesson_id: dm301-03
course_id: dm301
pathway: digital-marketer
title: KPIs and User Behavior Reports
order: 3
kind: lesson
competency_ids:
  - D6-S1-C02
objectives:
  - Choose KPIs for a marketing goal and read behavior reports against them
  - Segment a report to compare audiences, channels, or landing pages
---

## From a Goal to a Number You Can Read

You already know the difference between a metric and a key performance indicator: a metric is anything countable, a KPI is the small set of metrics chosen in advance, with targets, that tell you whether a stated goal is being met. This lesson is about the next step, which is where most people fail. It is turning that principle into a specific report, opened in a specific place, with a specific denominator, segmented in a way that shows you something.

Kestrel Outfitters has three goals this quarter, and each needs a different report.

| Goal | Primary KPI | Target | Supporting behavior metrics |
| --- | --- | --- | --- |
| Sell more gear without more traffic | Session conversion rate | 1.32% to 1.60% | Funnel step rates, checkout completion by device |
| Make the Trail Notes guides earn their keep | Newsletter signups from guide landing pages | 340 per 28 days | Engagement rate, guide-to-product click rate |
| Get the outlet store used | `find_store` events from within 40 miles | 220 per 28 days | Store page engaged sessions, on-site searches for "outlet" |

Three things are worth noticing about that table before you go any further.

Each goal has **one** primary KPI. A goal with three co-equal KPIs cannot be judged, because they will disagree and whoever presents will quote the flattering one.

Each target was **set before the period**, not chosen afterwards. Targets set afterwards are always met.

And the supporting metrics are **diagnostics, not scorekeepers**. Their job is to explain why the KPI moved, not to be reported as achievements.

## The Denominator Problem

Kestrel's 28-day baseline produces three defensible conversion rates from exactly the same 612 purchases.

```txt
Session conversion rate     612 / 46,200 sessions        =  1.32%
User conversion rate        612 / 34,000 users           =  1.80%
Checkout completion rate    612 / 2,480 begin_checkout   = 24.68%
```

None is wrong. They answer three different questions: how often does a visit end in a sale, how often does a person end in a sale, and how often does someone who has already decided to buy actually manage to. Reporting the third as "our conversion rate" would be a nearly twenty-fold overstatement (24.68 ÷ 1.32 = 18.7), and it happens constantly, usually by accident.

The rule is short and it will save you more arguments than anything else in this course: **state the denominator every single time.** "Conversion rate 1.32 percent, sessions" costs you four words and removes an entire category of misunderstanding. When you inherit a report that quotes a bare percentage, your first job is to find out what it was divided by, and your second is to discover that nobody knows.

The same discipline applies to rate versus count. A rate can rise because the numerator grew or because the denominator shrank, and only one of those is good news. If Kestrel cuts a poorly targeted paid social campaign, session conversion rate goes up immediately — 612 purchases over 44,900 sessions instead of 46,200 is 1.36 percent — while the business earned exactly the same money. Always report the rate and both of its components together.

## Where the Numbers Live

GA4 has two surfaces, and knowing which one a question belongs to saves an enormous amount of clicking.

**Reports** is the pre-built section: Realtime, plus the life-cycle collection of Acquisition, Engagement, Monetization, and Retention. Reports are fast, unsampled, and rigid. Use them for the recurring numbers.

**Explorations** is the flexible surface: free-form tables, funnel exploration, path exploration, segment overlap. Explorations can do things reports cannot — arbitrary dimension combinations, multi-step funnels, segments built from event conditions — at the cost of possible sampling at high volumes and a dependency on your data retention setting.

The reports you will actually use at Kestrel:

**Acquisition, split two ways.** *User acquisition* reports on the channel that first brought a user; *Traffic acquisition* reports on the channel that started each session. They answer different questions and they will not agree. For "which channel is bringing new people," use user acquisition. For "which channel drove the sessions that converted this month," use traffic acquisition. Say which one you used.

**Engagement, Pages and screens.** Views, users, average engagement time, and key events per page. This is a *page* report — a visit that touched six pages appears in six rows — so it cannot be used to count visits.

**Engagement, Landing page.** Sessions grouped by the first page of the session, with engagement and key events attached. This is the report to use when you are judging where traffic *arrives*, and it is one of the highest-yield reports in the whole tool.

**Engagement, Events.** Event counts and the users behind them. The first place to look when a number moves and you suspect collection rather than behavior.

**Monetization, Ecommerce purchases.** Item-level views, adds to cart, purchases, and revenue. Requires the `items` array to be populated correctly, which is why lesson 02 spent time on it.

**Retention.** New versus returning users and their cohort behavior. For Kestrel this matters because gear is a repeat purchase on a long cycle.

## Reading Kestrel's Behavior Reports

Here is the traffic acquisition report for the 28-day baseline. Sessions and purchases both sum to the totals you already know, which is your check that nobody has quietly filtered something.

| Session default channel group | Sessions | Purchases | Session CVR | Revenue |
| --- | --- | --- | --- | --- |
| Organic Search | 16,800 | 198 | 1.18% | $17,028 |
| Direct | 9,400 | 142 | 1.51% | $12,212 |
| Paid Search | 7,300 | 121 | 1.66% | $10,406 |
| Email | 4,900 | 108 | 2.20% | $9,288 |
| Organic Social | 4,100 | 22 | 0.54% | $1,892 |
| Referral | 2,100 | 15 | 0.71% | $1,290 |
| Paid Social | 1,300 | 6 | 0.46% | $516 |
| Unassigned | 300 | 0 | 0.00% | $0 |
| **Total** | **46,200** | **612** | **1.32%** | **$52,632** |

Read it as a professional would.

**Email converts at 2.20 percent, the best rate on the table, on the fourth-largest volume.** That is the most interesting cell here. It does not mean email is the best channel in some absolute sense — an email list is people who already chose you, so a high conversion rate is partly a property of the audience rather than of the channel's skill. It does mean that the marginal value of one more subscriber is high, which connects directly to Kestrel's second goal.

**Organic Search brings a third of all sessions and converts below the site average.** Before concluding anything, notice that "Organic Search" is a bucket containing both people searching for a rain jacket and people reading a guide about packing a daypack. Lesson 04 splits it properly.

**Organic Social and Paid Social both convert under 0.6 percent.** Resist the obvious conclusion. Social traffic is frequently discovery traffic that converts later through a different channel, and last-click reporting will always make it look worthless. This course does not model attribution, so what you can honestly say is narrow: *these sessions rarely end in a purchase in the same session.* That is a fact. "Social does not work" is not one.

**`Unassigned` is 300 sessions with zero purchases.** This is a data-quality row, not an audience. It means GA4 could not classify the source. Three hundred out of 46,200 is 0.6 percent and is tolerable; if it grows past a couple of percent, you have a tagging problem to chase before you interpret anything else on this table.

## Segmenting Until the Finding Appears

The single most important habit in this lesson: **an aggregate number is a hiding place. Split it before you conclude anything.**

Split Kestrel's same 46,200 sessions by device.

| Device | Sessions | Share | Purchases | Session CVR |
| --- | --- | --- | --- | --- |
| Mobile | 32,300 | 69.9% | 289 | 0.89% |
| Desktop | 12,100 | 26.2% | 302 | 2.50% |
| Tablet | 1,800 | 3.9% | 21 | 1.17% |
| **Total** | **46,200** | **100%** | **612** | **1.32%** |

There it is. **Seventy percent of Kestrel's traffic converts at roughly one third of the desktop rate**, and the blended 1.32 percent shows no sign of it. Desktop is a quarter of the visits and half the orders.

Size the gap before you get excited, because "close the gap" is not a realistic ambition — mobile shopping genuinely converts lower than desktop almost everywhere, for reasons including browsing context and payment friction that no site fully overcomes.

```txt
Mobile at its current 0.89%      32,300 x 0.0089 =   289 purchases
Mobile at desktop's 2.50%        32,300 x 0.0250 =   808 purchases   (not realistic)
Mobile at 1.30%, a modest lift   32,300 x 0.0130 =   420 purchases

Realistic gain                   420 - 289 = 131 purchases / 28 days
Gross profit at $36.12           131 x $36.12 = $4,731 / 28 days
Annualized (x 13 periods)        about $61,500
```

State the unrealistic number *and* the realistic one. The first shows the size of the territory; the second is what you are actually proposing. An analyst who only ever quotes the ceiling gets believed once.

Now go one level deeper and split the funnel by device, because "mobile converts worse" is a symptom and not a location.

| Funnel step (sessions with the event) | Mobile | Desktop | Tablet | Total |
| --- | --- | --- | --- | --- |
| Sessions | 32,300 | 12,100 | 1,800 | 46,200 |
| `view_item` | 14,600 | 5,800 | 900 | 21,300 |
| `add_to_cart` | 3,380 | 1,540 | 200 | 5,120 |
| `begin_checkout` | 1,690 | 720 | 70 | 2,480 |
| `purchase` | 289 | 302 | 21 | 612 |

Convert to step-to-step rates, which is the only form in which a funnel is readable.

```txt
                        Mobile    Desktop    Tablet     All
Session -> view_item     45.2%     47.9%     50.0%    46.1%
view_item -> add_to_cart 23.2%     26.6%     22.2%    24.0%
add_to_cart -> checkout  50.0%     46.8%     35.0%    48.4%
checkout -> purchase     17.1%     41.9%     30.0%    24.7%
```

The first three rows are unremarkable — mobile is slightly worse at browsing to cart and slightly better at cart to checkout, and none of those differences is large. The fourth row is the whole story. **Mobile visitors who start checkout complete it 17.1 percent of the time; desktop visitors complete 41.9 percent of the time.** Everything upstream is roughly fine. The problem is in mobile checkout, in a step that only 1,690 mobile sessions per period even reach.

That is what segmentation buys you. You began with "conversion rate is 1.32 percent," which is not actionable, and finished with "mobile checkout completion is 17.1 percent against 41.9 percent on desktop," which points a team at one screen. Lessons 06 through 08 are about finding out why and fixing it.

Three mechanics you need in the tool. **Comparisons** are the pill-shaped filters at the top of a standard report; you can hold up to five side by side, which is how the device table above is built without leaving Reports. **Segments** are richer and live in Explorations; they can be user-scoped, session-scoped, or event-scoped, and that scope choice changes the answer, so read it before you build. **Secondary dimensions** add a column to a standard report and are the fastest way to split a channel by device or a landing page by country.

One caution about splitting. Every split reduces the count in each cell, and small cells move violently. The tablet column above holds 21 purchases in a whole period; a change of five purchases is a 24 percent swing and means nothing at all. Split until the finding appears, then stop, and check what the cell counts became.

## Landing Pages: Where Traffic Arrives and What It Does

The landing page report is where behavior analysis pays for itself, because two pages receiving comparable traffic and converting an order of magnitude apart is the most actionable fact available in analytics.

| Landing page | Sessions | Engagement rate | Purchases | Session CVR |
| --- | --- | --- | --- | --- |
| `/collections/rain-jackets` | 4,910 | 61% | 148 | 3.01% |
| `/collections/hiking-boots` | 3,880 | 59% | 117 | 3.02% |
| `/guides/how-to-pack-a-daypack` | 3,460 | 74% | 11 | 0.32% |
| `/products/kestrel-ridgeline-28` | 2,240 | 57% | 84 | 3.75% |
| `/guides/sleeping-bag-temperature-ratings` | 2,010 | 71% | 5 | 0.25% |
| `/` (home) | 6,120 | 48% | 96 | 1.57% |
| All other pages | 23,580 | 50% | 151 | 0.64% |
| **Total** | **46,200** | **54%** | **612** | **1.32%** |

The guides have the highest engagement rates on the site and almost no purchases. There are two conclusions available and only one of them is defensible.

The indefensible one is "the guides do not work, cut them." The defensible one begins by noticing that **you have applied a collection page's metric to a top-of-funnel asset.** Someone searching how to pack a daypack is not shopping today; they are researching, and 74 percent engagement says the page did its job well. Judging that page on same-session purchases guarantees the answer "failure" no matter how good the page is.

What you should do instead is decide what the guides are *for* and measure that. If the answer is "capture an email address so we can sell to them in three weeks," then the guide's KPI is newsletter signups, not purchases — which is precisely why it is Kestrel's second quarterly goal, with a target of 340. If nobody can say what the guides are for, that is the real finding, and it belongs at the top of your report.

## Telling a Real Move From Normal Variation

Here is where reporting becomes honest or stops being worth anything. Kestrel's numbers wobble. Some of the wobble is information and most of it is not.

Take a single page: `/collections/trail-running-shoes` had **210 sessions** last week and **235** the week before, an **11 percent decline** (25 ÷ 235). Somebody will put that in a slide.

It is nothing. Here is why, and you should be able to do this arithmetic in your head by the end of the course.

For a count of events, week-to-week variation of roughly the square root of the count is ordinary. The square root of 210 is about 14.5, so a swing of 15 sessions either way is unremarkable and a swing of 25 is well inside two of those. An 11 percent change on a count of 210 is noise wearing a percentage sign.

The same logic in the other direction is what makes percentages so dangerous. Small denominators produce large percentages. **Always print the counts next to the rates**, and if a stakeholder's deck contains a percentage with no count beside it, ask for the count before you discuss the percentage.

Now do it for the site KPI, which is a rate rather than a count. Kestrel runs about 11,550 sessions a week at a 1.32 percent conversion rate, giving about 153 purchases. The ordinary variation in a proportion is roughly the square root of `p(1-p)/n`:

```txt
p = 0.0132, n = 11,550

  p(1-p)          = 0.0132 x 0.9868 = 0.013026
  0.013026 / 11550                  = 0.00000113
  square root                       = 0.00106  = 0.106 percentage points

  Ordinary weekly range (about two of those, either side):
    1.32% +/- 0.21pp  ->  1.11% to 1.53%
```

Read what that says. **A weekly conversion rate anywhere between 1.11 and 1.53 percent is consistent with nothing having changed at all.** In relative terms that is roughly plus or minus 16 percent. So a week that comes in 12 percent below the previous week — on the *whole site*, with 11,550 sessions behind it — is still not evidence of anything.

And the same calculation on a single page with 200 sessions:

```txt
p = 0.0132, n = 200

  0.013026 / 200      = 0.0000651
  square root         = 0.00807  = 0.81 percentage points

  Ordinary range: 1.32% +/- 1.6pp  ->  0% to 2.9%
```

The page's true conversion rate could be anything from zero to more than double the site average and you would not be able to tell. Two hundred sessions cannot support a conversion-rate conclusion. Full stop.

Four habits follow from this and they are non-negotiable.

**Calculate a noise floor before you look.** Decide, in advance, how large a move you will treat as real. Anything smaller does not get discussed.

**Compare like periods.** Twenty-eight days against twenty-eight days, never a 31-day month against a 28-day one. Twenty-eight days contains exactly four of every weekday, which matters enormously for a retailer whose weekend traffic differs from its weekday traffic.

**Never diagnose from a single week.** Look at eight or twelve weeks of the same number and ask whether the latest point is outside its own historical range. A line chart with a normal range on it settles arguments that a two-point comparison starts.

**Report changes in the right units.** A conversion rate moving from 1.32 percent to 1.45 percent moved **0.13 percentage points**, and is also a "10 percent increase." Both are true; the second sounds five times more impressive and is the one that gets quoted. Give the percentage-point change first.

## The Scorecard

Pull it together into something you would actually send. One period, one page, targets set in advance, counts beside rates.

```txt
KESTREL OUTFITTERS - 28 days ending 5 April       (prior period in brackets)

  PRIMARY
  Session conversion rate     1.32%  [1.29%]   target 1.60%   +0.03pp - within noise
  Purchases                     612  [598]                    +14
  Revenue                   $52,632  [$51,428]                +2.3%

  DIAGNOSTIC
  Sessions                   46,200  [46,340]                 flat
  Engagement rate               54%  [53%]                    +1pp
  Checkout completion        24.68%  [24.9%]                  flat
    mobile                    17.1%  [17.4%]                  flat - the gap is stable
    desktop                   41.9%  [41.2%]                  flat
  Newsletter signups          1,340  [1,190]                  +12.6%
    of which from guides        396  [352]     target 340    target met

  NOISE FLOOR THIS PERIOD
  Session CVR moves smaller than about +/- 0.15pp between these 28-day periods
  are not reported as changes under the two-SE rule of thumb.
  Difference SE: sqrt[pC(1-pC)/46,200 + pP(1-pP)/46,340]
  where pC = 612/46,200 and pP = 598/46,340; SE = 0.075pp.
  Two of those = 0.15pp. Recompute for other periods and sample sizes.
```

Notice what that scorecard does. It puts the target next to the KPI. It labels the small moves as noise rather than dressing them up. It carries the counts beside the rates. And its most useful line is the mobile-versus-desktop checkout split, which is not a KPI at all — it is the diagnostic that tells you where next quarter's work is.

## Practice

Use a GA4 property you have access to. The public demo property is fine for parts 2 through 5 if you have no site of your own; say so if you use it.

**Part 1 — Goals to KPIs.** For each of the following, name one primary KPI with the denominator stated, a target you would propose and how you derived it, two diagnostics, and one metric you expect a stakeholder to ask for that you would refuse to judge the goal by, with a one-sentence reason for the refusal.

1. Kestrel wants the outlet store visited by more local customers.
2. Kestrel wants to stop losing people at checkout on phones.
3. Kestrel wants the Trail Notes guides to contribute to revenue.
4. Kestrel wants repeat purchases from customers who bought a pack last spring.

**Part 2 — Rebuild the funnel.** In your property, build a funnel exploration with at least four steps for whatever the site's main journey is. Produce the step-to-step rate table, then rebuild the same funnel with a device breakdown. Report the worst step overall and the worst step on mobile, and state how many sessions sit behind each cell.

**Part 3 — Segment until something appears.** Take one aggregate number from your property and split it three different ways — by device, by channel, and by landing page or country. For each split, write one sentence saying whether the aggregate was hiding anything. Then name the smallest cell in your tables and say whether you would be willing to draw a conclusion from it.

**Part 4 — Denominator audit.** Find three percentages in your property's standard reports. For each, write down exactly what the numerator and denominator are, and construct one sentence that would be a genuine misreading of that percentage if the denominator were assumed to be something else.

**Part 5 — Noise floor.** Compute the ordinary weekly variation for your property's conversion rate using the arithmetic in this lesson. State the range in percentage points and in relative terms. Then find one week in the last twelve where the number moved and decide, using your own floor, whether it was a finding. Show the working.

**Part 6 — Build the scorecard.** One page, in the format above: primary KPI with denominator and target, three to five diagnostics, prior-period comparison over matched-length periods, counts beside rates, and an explicit noise-floor line. Then write three sentences underneath saying what you would investigate next and why — and one sentence naming something on the scorecard you deliberately did not treat as a change.
