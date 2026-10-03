---
lesson_id: se305-02
course_id: se305
pathway: technical-sales-representative
title: The Metrics That Drive Decisions
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
  - D4-S1-C04
objectives:
  - Choose the small set of sales metrics that should drive a rep's weekly
    decisions
---

## Too many numbers, almost none of them yours

Open any CRM reporting menu and you can produce several hundred distinct metrics before lunch. Almost none of them will change what you do on Tuesday. A rep who tries to watch all of them ends up watching none of them, and a rep who watches the wrong five ends up optimising something that was never the problem.

So the first analytical skill in this course is not calculation. It is **selection** — deciding which small set of numbers deserves your attention every week, and being able to say why the rest do not. Everything after this lesson assumes you have made that cut.

A metric earns a place on a rep's weekly list only if it passes four tests.

**It is actionable at your level.** You can change it, or at least push on it, with the actions available to you in the next five working days. Net revenue retention is a real and important number; nothing you do next Tuesday moves it.

**It is attributable to you.** It describes your territory, your opportunities, your behaviour. A company-wide figure that mixes eight reps and three segments tells you about the company, not about you.

**It updates fast enough to steer by.** A number that only becomes meaningful after four quarters is a scoreboard, not a steering wheel. You want figures that move within a quarter and can be sanity-checked within a month.

**Gaming it does not help you.** If you can improve the number without improving the business, someone eventually will — including you, unintentionally. "Meetings booked" is easy to inflate. "Opportunities that reached technical validation" is much harder to fake.

### What se201 already gave you, and where it belongs

You already know the SaaS vocabulary from Advanced SaaS Sales Strategies: annual contract value and annual recurring revenue, customer acquisition cost, lifetime value, CAC payback period, gross and net revenue retention, churn. Those are **company and segment** metrics. They set the shape of your territory, they explain why a discount is expensive, and you use them to argue a deal — but you do not manage your week with them.

| Metric | Whose number it is | Your weekly use |
| --- | --- | --- |
| ARR, ACV | Company / account | Sizing a deal, not steering a week |
| CAC, CAC payback | Segment | Judging whether a deal is worth working |
| LTV, LTV:CAC | Segment | Arguing for focus and against discounting |
| Net revenue retention | Company / installed base | Almost never a weekly rep lever |
| Win rate | **Yours** | Every week |
| Average deal size | **Yours** | Every week |
| Sales cycle length | **Yours** | Every week |
| Pipeline coverage | **Yours** | Every week |
| Pipeline velocity | **Yours** | Monthly, as a capacity check |

The right-hand block is what this lesson computes. The left-hand block is recalled, not re-taught — go back to se201 if any of those definitions are shaky, because lesson 3 assumes them.

## The data you will use for the rest of this course

You sell transportation-management software for Meridian Freight Software into a mid-market territory. Your annual quota is **$800,000**. Here is your trailing twelve months, straight out of the opportunity object.

| Trailing 12 months | Figure |
| --- | --- |
| Opportunities created | 128 |
| Closed won | 24 |
| Closed lost | 72 |
| Still open | 32 |
| Won annual contract value | $684,000 |
| Lost annual contract value | $2,196,000 |
| Mean days from creation to close, won deals | 74 |
| Median days from creation to close, won deals | 61 |
| Mean days from creation to close, lost deals | 96 |

And here is your open pipeline as it stands on 30 September, the start of the last month of Q4.

| Stage | Open opportunities | Value | Average deal |
| --- | --- | --- | --- |
| Discovery | 14 | $364,000 | $26,000 |
| Solution validation | 9 | $270,000 | $30,000 |
| Proposal | 6 | $186,000 | $31,000 |
| Negotiation | 3 | $105,000 | $35,000 |
| **Total** | **32** | **$925,000** | **$28,906** |

Two more facts you need: your quarterly quota is $200,000, and you have already closed **$46,000** of it this quarter.

Every number in lessons 3 and 4 comes from these three tables. When a figure appears later, you should be able to trace it back here.

## Win rate

```text
Win rate (by count) = closed-won opportunities / (closed-won + closed-lost)
```

```text
Win rate = 24 / (24 + 72) = 24 / 96 = 25.0%
```

Notice what the denominator is **not**. It is not 128. Open opportunities have not decided anything yet, and including them drags the rate toward zero for no reason other than that you have been busy. Win rate is computed on **resolved** opportunities only.

There is a second version, and the gap between them is informative.

```text
Win rate (by value) = won ACV / (won ACV + lost ACV)
```

```text
Win rate (by value) = $684,000 / ($684,000 + $2,196,000)
                    = $684,000 / $2,880,000 = 23.75%
```

Your count win rate is 25.0% and your value win rate is 23.75%. That gap is small but it points in a specific direction: the deals you lose are bigger than the deals you win. Check it directly — average won deal is $684,000 / 24 = **$28,500**, average lost deal is $2,196,000 / 72 = **$30,500**. You are winning the smaller half of your opportunities. That is a real finding, and it is invisible if you only ever look at the count version.

**Where win rate misleads.** It is a ratio, so it is fragile at small denominators. If you had only twelve resolved deals, one different outcome would move the rate by eight points, and you would be tempted to explain a rounding artefact. It is also easy to inflate by never logging the opportunities you expect to lose — a rep with a 60% win rate and thirty opportunities a year is usually telling you about their record-keeping, not their selling.

## Average deal size

```text
Average deal size = won ACV / won deals = $684,000 / 24 = $28,500
```

Now look at the distribution rather than the mean. Two of your twenty-four wins were unusually large — one at $96,000 and one at $88,000, $184,000 between them. Strip those out and the other twenty-two wins total $500,000, an average of **$22,727**. Your median win is about **$24,000**.

The mean is $28,500 and the median is $24,000. Whenever the mean sits well above the median, a small number of large deals is carrying the average, and any plan built on "I need X deals at my average" is quietly assuming you land another whale. Use the **median** for planning your deal count and the **mean** for capacity arithmetic, and say which one you are using.

## Sales cycle length

```text
Sales cycle length = days from opportunity creation to close
```

Your won deals average 74 days and your median won deal is 61. Your **lost** deals average 96 days.

That last figure is the interesting one, and most reps never compute it. Your losses take 22 days longer than your wins. You are spending more time to reach "no" than to reach "yes". Multiply it out: 72 losses at 96 days is 6,912 opportunity-days spent to arrive at nothing. Every one of those days was a day you could have spent on a deal that was going to close, or on creating a new one.

The metric that follows from this is not "shorten my sales cycle". It is "**shorten my losses**". Those are entirely different plans, and only the second one is available to you next week. Lesson 4 puts a number on it.

Measure cycle from **opportunity creation**, not from first touch and not from the day you decided it was serious. Reps who start the clock late report flatteringly short cycles that no forecast can use.

## Pipeline coverage

Coverage is the only metric here that answers a question about the future.

```text
Pipeline coverage = open pipeline for the period / remaining quota for the period
```

```text
Q4 quota                       $200,000
Closed-won so far in Q4         $46,000
Remaining gap                  $154,000
```

Of your 32 open opportunities, 21 carry a close date inside Q4, worth **$612,000**.

```text
Coverage = $612,000 / $154,000 = 3.97x
```

A coverage number is meaningless without your win rate beside it, because the ratio you need is set by the rate at which pipeline converts.

```text
Break-even coverage = 1 / win rate = 1 / 0.25 = 4.0x
```

You are at 3.97x against a break-even of 4.0x. Put it in dollars and the implication is sharper:

```text
Expected value = $612,000 x 0.25 = $153,000
Gap            = $154,000
Shortfall      = $1,000
```

You do not have a comfortable quarter. You have a quarter where you make quota **only if everything behaves exactly like the average**, and nothing ever does. Coverage at exactly 1 / win rate is not "on track"; it is a coin flip with no margin. Most teams set their coverage target at roughly 1.2 to 1.5 times break-even — for a rep with a 33% win rate, whose break-even is 3x, that means asking for 3.6x to 4.5x rather than 3x — precisely because slippage is normal.

Three ways coverage lies, all of which lesson 3 shows you how to catch: opportunities with a close date already in the past still counted as "this quarter"; deals sitting in a stage they have not earned; and a single large deal supplying most of the coverage, so the ratio is really one binary event wearing a percentage.

## Pipeline velocity

Velocity combines four of the metrics above into a rate of dollars per day.

```text
Pipeline velocity = (open opportunities x win rate x average deal size) / cycle length in days
```

```text
Velocity = (32 x 0.25 x $28,500) / 74
         = (32 x $7,125) / 74
         = $228,000 / 74
         = $3,081 per day
```

Over a 90-day quarter that is $277,297 of capacity against a $200,000 quarterly quota, which sounds comfortable — and it directly contradicts the coverage number you just computed. Both are correct, because they answer different questions. Coverage asks "will the specific deals dated for this quarter cover this quarter's gap?" Velocity asks "at my current rates, what does this machine produce per day in steady state?" A thin quarter inside a healthy run rate is exactly what those two figures together describe.

Velocity has one honest use and one dishonest one. Honestly, it tells you **which lever is worth pulling**, because the four inputs are separable. Multiply opportunity count by 1.2 and velocity goes up 20%; cut cycle length by 20% and velocity goes up 25%. Dishonestly, it gets quoted as a forecast, which it is not — it assumes the whole open pipeline turns over every cycle length and is instantly replaced.

Always run the sanity check:

```text
Implied opportunities per year = 32 open / 74 days x 365 = 158
Actual opportunities created   = 128
```

The model assumes you source 158 opportunities a year and you sourced 128. Velocity is therefore overstating your real capacity by roughly 23%. Quote it as a capacity ceiling, never as a number you expect to bank.

## Putting the five together

| Metric | Your figure | What it would take to move it |
| --- | --- | --- |
| Win rate | 25.0% | Better qualification, better late-stage execution |
| Average deal size | $28,500 mean / $24,000 median | Segment focus, multi-product, term length |
| Sales cycle | 74 mean / 61 median won; 96 lost | Faster disqualification above all |
| Coverage | 3.97x against a 4.0x break-even | More created pipeline, or a higher win rate |
| Velocity | $3,081 per day | Any of the four inputs |

There are exactly four ways to close a revenue gap, and they map one-to-one onto the first four rows: more opportunities, a higher win rate, bigger deals, or a shorter cycle. Your quota is $800,000 and you delivered $684,000, a gap of **$116,000**. Each single-lever fix looks like this:

```text
Deals needed at $28,500 average = $800,000 / $28,500 = 28.07, call it 28

Volume only:      28 wins at a 25% win rate needs 112 resolved opps (you had 96)
Win rate only:    28 wins from 96 resolved opps needs a 29.2% win rate (you had 25.0%)
Deal size only:   $800,000 / 24 wins = $33,333 average (you had $28,500), up 17%
Cycle only:       28 / 24 = 1.169x more turns, so 74 / 1.169 = 63 days (you had 74)
```

Four plans, all arithmetically valid, wildly different in what they ask of you. Choosing between them is not a preference — it is a diagnosis, and lessons 3 and 4 are how you make it.

## Using the numbers on a live deal

Metric literacy is not only a weekly review habit; it is also how you decide whether an opportunity deserves your time, and how you frame it once it does.

**Qualifying with your own economics.** A prospect wants a $9,000-a-year configuration of your product. Your mid-market segment CAC is roughly $12,000 per new customer and your average deal is $28,500. At $9,000 of ACV the deal never pays back inside a normal retention window, and it consumes a slot in a pipeline where the median deal is $24,000. The right move is a smaller-touch motion or a partner, not a heroic effort. Note the shape of that argument: it is your CAC and your median deal size, not a feeling about the account.

**Framing with the buyer's economics.** The same discipline runs in the other direction. A shipper doing 40,000 loads a year at $18 of avoidable detention cost per load is carrying $720,000 of annual leakage; a 15% reduction is $108,000, against a $28,500 subscription. That is a payback conversation the buyer's finance team can check, and it is why deal size and cycle length are connected — deals framed in the buyer's numbers close faster and discount less.

**Reading the cycle before you promise a date.** If your median won cycle is 61 days, an opportunity created on 15 November is a Q1 deal, not a Q4 deal, no matter what the close-date field says. Coverage built on close dates that ignore your own cycle length is fiction, and lesson 3 shows you what that fiction costs.

## What not to put on your weekly list

- **Total activity counts.** Calls, emails, and touches are inputs you can inflate without selling anything. Track them only when a specific diagnosis points at them.
- **Lifetime pipeline created.** A cumulative number that only goes up cannot tell you whether this week was good.
- **Unweighted total pipeline value.** $925,000 of open pipeline sounds like four and a half times your quarterly quota. At a 25% win rate and with only $612,000 dated for the quarter, it is not.
- **Leaderboard rank.** It moves when other people's deals close. It fails the attributable test.
- **Anything you cannot compute yourself.** If you cannot reproduce the number from records you can see, you cannot argue with it when it is wrong.

## Practice

Use the Meridian data above. Show your arithmetic for everything.

**Exercise 1 — rebuild the metric card.** From the two data tables, compute: win rate by count, win rate by value, mean and median deal size, mean and median won cycle, mean lost cycle, Q4 pipeline coverage, break-even coverage, and pipeline velocity. Write each as a single line with the calculation visible, as though you were pasting it into a note for your manager.

**Exercise 2 — the four levers.** Your quota rises to $900,000 next year with no change to your territory. Compute what each of the four single-lever plans would require: the opportunity count, the win rate, the average deal size, and the cycle length that would each get you there on their own, holding the other three constant. State which one you would actually pursue and what evidence in the tables supports that choice. You have not diagnosed anything yet, so say plainly what you would need to check first.

**Exercise 3 — select your five.** Below are twelve candidate metrics. Score each against the four tests from the start of this lesson (actionable, attributable, timely, hard to game), then choose the five you would put on a weekly review and justify each exclusion in one sentence.

1. Net revenue retention
2. Opportunities created this month
3. Emails sent this week
4. Discovery-to-validation conversion, trailing 90 days
5. Open pipeline dated for this quarter
6. Company ARR
7. Average days in current stage for open deals
8. Your rank on the team leaderboard
9. Win rate, trailing 12 months
10. Number of open opportunities with no dated next step
11. Segment CAC payback
12. Median won deal size, trailing 12 months

**Exercise 4 — the honest caveat.** Pick two of the figures you computed in Exercise 1 and write one sentence each explaining why a manager should not act on it yet. At least one of your two answers must be about sample size.

## Check your understanding

1. A rep has 20 wins, 60 losses, and 40 open opportunities. What is the win rate, and why is 120 the wrong denominator? *(Answer: 20 / 80 = 25%. Open deals have not decided anything; win rate uses resolved opportunities only.)*
2. Your mean won deal is $28,500 and your median is $24,000. Which do you use to plan how many deals you need, and why? *(Answer: the median — the mean is being pulled up by a few large deals, so planning on it assumes another whale.)*
3. Your win rate is 20%. What is break-even coverage, and roughly what target would a team set? *(Answer: 1 / 0.20 = 5.0x break-even; a target of roughly 6x to 7.5x, 1.2–1.5 times break-even.)*
