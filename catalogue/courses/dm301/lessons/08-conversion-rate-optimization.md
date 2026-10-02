---
lesson_id: dm301-08
course_id: dm301
pathway: digital-marketer
title: Conversion Rate Optimization
order: 8
kind: lesson
competency_ids:
  - D6-S2-C02
objectives:
  - Propose and justify a change intended to lift conversion rate
---

## Conversion Rate Optimization Is a System, Not a Page

An earlier course in this pathway taught you to improve a landing page receiving paid traffic: one page, one audience, one intent, arriving primed by an ad. This lesson widens the frame to the whole journey — every route into the site, every step between arrival and purchase, and the steps that happen on a phone six days after the first visit. The mechanics you learned there still apply. What changes is where you point them and how you decide.

This is an introduction. Two hours buys you the decision framework and the arithmetic, not a testing programme.

Kestrel's funnel, from lesson 03, in relative terms:

```txt
                          Rate     Sessions at this step
  Session -> view_item    46.1%          21,300
  view_item -> cart       24.0%           5,120
  cart -> begin_checkout  48.4%           2,480
  checkout -> purchase    24.7%             612
```

## Where the Leverage Actually Is

The instinct is to attack the biggest drop. That instinct is wrong, and here is the arithmetic that shows why.

A funnel is multiplicative. Improve any step by 10 percent *relative to itself* and the same proportion of extra people reach the end, regardless of which step it is.

```txt
  A 10% RELATIVE improvement at each step, one at a time:

  Session -> view_item    46.1% -> 50.7%   +2,125 item viewers  -> +61 purchases
  view_item -> cart       24.0% -> 26.4%     +511 carts         -> +61 purchases
  cart -> begin_checkout  48.4% -> 53.2%     +246 checkouts     -> +61 purchases
  checkout -> purchase    24.7% -> 27.2%      +62 purchases     -> +62 purchases

  All four are worth about 61 orders per 28 days.
  61 x $36.12 gross profit = about $2,200 per period, roughly $28,600 a year.
```

Every step is worth the same. So the question is not "where is the biggest drop?" — it is **"where is a 10 percent relative improvement easiest and best evidenced?"**

Three things make a step easier to improve.

**A comparable population already does much better.** Mobile checkout completes at 17.1 percent while desktop completes at 41.9 percent. That gap is proof the step is achievable at a higher rate, which is a far stronger prior than any benchmark.

**You have evidence about the mechanism.** From lessons 06 and 07 you know precisely what goes wrong and in what words customers describe it. Compare that to "session to item view," where you have no evidence at all and would be guessing.

**The step is small enough to test.** More on this below, and it is the constraint that decides most programmes.

All three point at mobile checkout. Kestrel's CRO plan for the quarter is one step of one funnel on one device, and that focus is a strength rather than a limitation.

## Writing the Proposal

A proposal has to be specific enough to be wrong. Fill every slot:

> **Because** 4 of 5 usability participants first saw delivery cost on the third checkout screen and two stopped there, 11 of 20 recorded abandoned mobile sessions ended on that screen, only 21 percent of mobile product-page visitors scroll far enough to reach the shipping accordion, and 38 of 84 exit-survey respondents named delivery cost or time unprompted — **we believe that** showing the delivery cost and the free-delivery threshold on the product page and in the cart **will increase** mobile checkout completion from 17.1 percent to at least 21 percent **for** mobile sessions, **measured by** `purchase` divided by `begin_checkout`, mobile segment, over a full 28-day period.

Four properties make that usable. The evidence is named and comes from four independent instruments. The change is **one** change, not a redesign. The predicted effect is a number with a mechanism behind it. And the metric is unambiguous, including its denominator and its segment.

Now size it honestly, and price being wrong.

```txt
  Mobile checkouts per period                       1,690
  Current completion 17.1%                            289 purchases
  At 21%              1,690 x 0.21   =                355 purchases
  At 24%              1,690 x 0.24   =                406 purchases

  Gain at 21%    66 x $36.12  =  $2,384 per period, about $31,000 a year
  Gain at 24%   117 x $36.12  =  $4,226 per period, about $54,900 a year

  Downside if it moves 3 points the WRONG way and runs unnoticed
  for two periods:
    1,690 x 0.141 = 238 purchases; 51 fewer x $36.12 = $1,842 per period
    Two periods = $3,684
```

Give the range, name the assumption carrying the risk — here, that the price surprise is the binding constraint rather than the payment methods seven survey respondents mentioned — and always state the downside. A recommendation with no downside stated is a sales pitch.

## Can You Even Measure It?

This is the section that separates people who test from people who talk about testing, and it is where most enthusiasm dies. Before proposing any experiment, work out whether your traffic can detect the effect you are hoping for.

A workable rule of thumb for the sessions needed **per variant**, for an 80 percent chance of detecting a real effect at conventional confidence:

```txt
  n per variant  =  16 x p(1-p) / (difference)^2

  where p is the average of the two rates and the difference is
  expressed in the same units (0.0132 for 1.32%, not 1.32).
```

Run it three times on Kestrel.

```txt
  (a) Site-wide, 1.32% -> 1.45%   (a 10% relative lift)
      p = 0.01386   difference = 0.00132
      n = 16 x 0.013668 / 0.00000174 = about 125,500 per variant
      251,000 sessions total, at 46,200 per period = about 5 months

  (b) Site-wide, 1.32% -> 1.65%   (a 25% relative lift)
      p = 0.01485   difference = 0.0033
      n = 16 x 0.014630 / 0.00001089 = about 21,500 per variant
      43,000 sessions total = about 26 days

  (c) Mobile checkout, 17.1% -> 22%
      p = 0.1955    difference = 0.049
      n = 16 x 0.157280 / 0.002401 = about 1,050 per variant
      2,100 mobile checkouts, at 1,690 per period = about 5 weeks
```

Three conclusions, and they govern everything Kestrel does.

**(a) is not testable.** Waiting five months guarantees that seasonality, site changes, and staff turnover contaminate the result. Small sitewide lifts are real and are simply beyond a business of this size to measure. Say so rather than running the test badly.

**(b) is borderline and only for a large change.** A 25 percent sitewide lift is not something a copy tweak produces. Reserve this budget for something substantial.

**(c) is comfortably runnable.** Testing deep in the funnel works because the base rate is high, so the same relative improvement is a much larger absolute difference, and the arithmetic rewards that quadratically. **Test where rates are high and populations are narrow.**

Two constraints on top of the arithmetic. Run for **whole weeks**, never stopping mid-week, because weekday and weekend behavior differ. And **do not stop early because the result looks good** — checking repeatedly and stopping at the first favorable moment manufactures significant results out of nothing, and it is the single most common way a small testing programme fools itself.

## When You Cannot Test

Most changes at a business Kestrel's size cannot be tested, and the honest response is to change how you *decide*, not to pretend the test happened.

**Ship it when broken is obvious.** If the mobile size chart is unreadable, you do not need an experiment to establish that unreadable is worse than readable. Fix it and move on.

**Ship and monitor, with a pre-registered threshold.** Ship the change, define in advance the metric, the window, and the number that would make you revert, and hold yourself to it. Then be honest about the weakness: a before-and-after comparison cannot separate your change from everything else that happened that month. Write that limitation into the report rather than letting someone discover it.

**Use a holdout when the change is expensive.** Withhold the change from a defined slice of traffic for a defined period. Weaker than a proper split test and far better than nothing.

**Refuse.** Some proposals are unmeasurable, unevidenced, and expensive. "We cannot detect an effect that small with our traffic, and here is the arithmetic" is a complete professional answer.

## Guardrails, and Rates That Lie

A conversion rate is a fraction, and fractions improve when the denominator shrinks. Every CRO proposal needs guardrail metrics that catch this.

Hide the checkout button from hesitant visitors and completion rate rises beautifully while orders fall. So alongside the primary metric, always watch: the **count** at the step above, **revenue per session**, **average order value**, and **returns or cancellations**, because a change that pushes people into buying the wrong thing shows up weeks later in the returns queue.

Here is the trap in full, using the most popular idea in ecommerce.

```txt
  PROPOSAL: free delivery on everything. Currently $6.95, charged on all orders.

  Mobile-only view (the one people present):
    Mobile completion 17.1% -> 24%   289 -> 406 orders
    Gross profit per order falls $36.12 -> $29.17
    Before   289 x $36.12 = $10,439
    After    406 x $29.17 = $11,843          +$1,404 per period

  Whole-business view (the one that matters):
    The $6.95 is given up on EVERY order, including desktop's 302,
    which were converting fine.
      Desktop cost   302 x $6.95 = $2,099 per period
    Net effect  $1,404 - $2,099 = -$695 per period

  For free delivery to break even, desktop must also gain:
    $2,099 / $29.17 = 72 more desktop orders
    302 -> 374, which is desktop completion 41.9% -> 51.9%
    a 24% relative lift on a step that is already performing well.
```

The mobile-only slide shows a win. The whole-business arithmetic shows a loss unless a fairly optimistic desktop lift also materializes. That is not an argument against free delivery — it is an argument for computing the effect on the whole business, in gross profit, before recommending anything. **Optimize revenue and profit; conversion rate is the diagnostic, not the goal.**

## The Line You Do Not Cross

Some tactics raise conversion rate and should not be used. The rule is not negotiable: **a claim on the site must be true.**

A countdown that resets on reload is a lie. "Only 2 left" that is hardcoded is a lie. Invented purchase notifications are a lie. A pre-ticked subscription box, an unsubscribe buried three screens deep, or a cancel flow deliberately made confusing are all conversion tactics and all of them trade a permanent asset for a temporary number.

There is a measurement argument as well as an ethical one, and it is worth having ready. Deceptive urgency raises the order count and lowers order quality, so your conversion metric improves while returns, chargebacks, and support load rise on a delay. You will have optimized toward a number that has come loose from the money — which is the failure this entire course has been teaching you to detect.

## Practice

Use Kestrel's data, or your own property if you have one.

**Part 1 — Locate the leverage.** Build the funnel with step-to-step rates. Compute what a 10 percent relative improvement at each step is worth in orders and gross profit. Then rank the steps by *ease*, not by size of drop, and justify the top-ranked one on all three criteria: a comparable population doing better, evidence about the mechanism, and testability.

**Part 2 — Write the proposal.** Full form, every slot. The evidence must name at least two independent instruments. One change, not a redesign. Predicted effect as a number with a mechanism.

**Part 3 — Size it and price being wrong.** Show the arithmetic for the gain at two levels of success and for the downside if the change moves the metric the wrong way and runs unnoticed for two periods.

**Part 4 — Run the sample-size arithmetic.** For your proposal, compute sessions needed per variant and the calendar time at your actual traffic. Then compute it for a 10 percent relative sitewide lift and state plainly whether that is testable. If your test would take more than six weeks, redesign it — deeper in the funnel, larger predicted effect, or narrower segment — and show the new arithmetic.

**Part 5 — Choose a decision method.** Split test, ship and monitor, holdout, or refuse. Justify it, and if it is not a split test, write the sentence you would put in the report describing what your evidence cannot rule out.

**Part 6 — Set guardrails.** Name the primary metric with its denominator and segment, at least three guardrails including one that would catch denominator shrinkage, and the pre-registered threshold that would make you revert. Date it.

**Part 7 — The whole-business check.** Take one proposal that costs margin — free delivery, a discount, an extended returns window — and compute its effect on gross profit across the entire business, not only the segment it targets. State what would have to be true elsewhere for it to break even.

**Part 8 — Ethics pass.** List every claim your proposed change would make on the page and, beside each, the source that makes it true. Delete anything with no source, and write one sentence on how a deceptive version of your change would show up in the data weeks later.
