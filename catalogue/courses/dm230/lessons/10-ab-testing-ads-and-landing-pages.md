---
lesson_id: dm230-10
course_id: dm230
pathway: digital-marketer
title: A/B Testing Ads and Landing Pages
order: 10
kind: lesson
competency_ids:
  - D3-S1-C02
objectives:
  - Design a valid A/B test on ads or landing pages and interpret the result
---

## What an A/B Test Actually Is

An A/B test is a randomized comparison. You take one stream of traffic, split it at random into two groups, show each group a different version of one thing, and measure a metric you named in advance. That is the whole apparatus. Its only purpose is to answer a single question: is the difference I am looking at real, or is it noise?

That question sounds modest. It is not. Marketing is full of numbers that move for no reason. A landing page that converts at 11 percent this week and 13 percent next week has not necessarily improved. A new ad that gets a better click-through rate for three days has not necessarily won. Conversion is a coin-flip process at the level of the individual visitor, and small samples of coin flips wander. The entire value of a test is that it puts a bound on how much of the observed gap could be wandering.

Paid media is one of the very few places a marketer can genuinely run this kind of experiment. Most marketing work does not permit it. You cannot randomize which searchers see your organic listing. You cannot show half the market your billboard and half the market a different billboard and know who was in which group. But in a paid account you control the traffic, you can buy more of it on demand, the platform will randomize assignment for you at the user or auction level, and the same instrumentation measures both arms. Email is the other place this works cleanly. Almost everywhere else, "we tested it" means "we changed it and then the number moved."

So treat this capability as valuable and do not squander it by running tests that cannot answer anything. A badly designed test is worse than no test, because it produces a number that feels like evidence and gets acted on.

## The Anatomy of a Valid Test

Five things have to be true before a comparison deserves the word test.

**A single changed variable.** Version B differs from version A in exactly one respect that you can name in a sentence.

**Random and simultaneous assignment.** Visitors are allocated to A or B by chance, not by time, geography, device, or which one the platform felt like serving. Both versions run over the same calendar days. If A ran in March and B ran in April, you have not tested a headline, you have tested March against April.

**A pre-declared primary metric.** One metric, chosen before launch, that decides the outcome. You may look at others; they do not get a vote.

**A pre-declared sample size and end date.** You calculate how much traffic you need before you launch, and you commit to a stopping point.

**No peeking and stopping.** You do not check the numbers every morning and call it when the gap looks good.

Every failure mode in the rest of this lesson is one of those five being violated.

## One Variable at a Time

Suppose Northgate Heating and Air runs an ad test where version B changes the headline from "24/7 Emergency AC Repair" to "AC Broken? We Can Be There Today," swaps the sitelink set, and changes the final URL to a different landing page. B wins by 30 percent on conversion rate.

What did you learn? That this bundle of three changes beats that bundle of three changes, in this account, at this moment. You cannot decompose it. Maybe the headline was worth plus 45 percent and the new landing page was worth minus 15 percent. Maybe the headline did nothing and the landing page did everything. You now have to keep all three changes forever because you do not know which one is load-bearing, and you have learned nothing you can carry to the furnace campaign.

This is not always wrong. A deliberate bundle test, sometimes called a champion-challenger test, is a legitimate thing to run when the account is small and you need a big effect to be measurable at all. What is wrong is running a bundle test and then reporting it as if you had learned that the headline works. Be explicit about which kind you are running:

- **Isolation test.** One variable. Slow, small effects, but the finding is transferable.
- **Bundle test.** Many variables at once. Faster to reach significance because the combined effect is bigger, but the finding is "this page beats that page" and nothing more.

Small accounts should usually run bundle tests, and should say so out loud. The failure is not the bundle. The failure is the false attribution afterward.

## Choosing the Primary Metric

Northgate gets paid for booked jobs, not for clicks. So the primary metric on an ad test is conversion rate, or better, cost per acquisition. Click-through rate is a diagnostic, not a verdict.

Here is why that matters, with numbers. Two AC Repair ads, same ad group, same 30-day window, roughly 10,000 impressions each.

| Variant | Impressions | Clicks | CTR | Spend | Conversions | Conv rate | CPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A: "24/7 Emergency AC Repair - Licensed Techs" | 9,800 | 627 | 6.40% | $5,141.40 | 69 | 11.00% | $74.51 |
| B: "Free AC Estimate - No Obligation, Call Now" | 9,750 | 796 | 8.16% | $6,527.20 | 58 | 7.29% | $112.54 |

Work the arithmetic. B's CTR is 796 / 9,750 = 8.164 percent, rounded to 8.16 percent. A's is 627 / 9,800 = 6.398 percent, rounded to 6.40 percent. The relative CTR lift is (8.16 - 6.40) / 6.40 = 27.5 percent. If your primary metric were CTR, B is a clear winner and you would roll it out.

Now look at money. Spend is clicks times the $8.20 average CPC for this ad group: 627 x $8.20 = $5,141.40 and 796 x $8.20 = $6,527.20. Conversions fell from 69 to 58. Conversion rate fell from 69 / 627 = 11.00 percent to 58 / 796 = 7.29 percent. CPA rose from $5,141.40 / 69 = $74.51 to $6,527.20 / 58 = $112.54, an increase of 51 percent. B spent $1,385.80 more and produced 11 fewer leads.

The mechanism is obvious in hindsight. "Free estimate, no obligation" is an attractive offer to people who are shopping, comparing, and not yet committed. It pulled in more clicks from a worse population. The word "free" is one of the most reliable CTR levers in existence and one of the most reliable CPA destroyers.

The rule: **your primary metric is the one you get paid on, or the closest thing to it that the test can actually measure.** For Northgate that is CPA or conversion rate. Use CTR to explain a result, never to decide one.

## Baseline, Minimum Detectable Effect, and Sample Size

Three inputs decide how much traffic a test needs.

**Baseline.** The conversion rate of the control, measured before you start. For Northgate's AC Repair ad group, the baseline is 11 percent.

**Minimum detectable effect (MDE).** The smallest improvement you care about, stated in advance. Not the improvement you hope for. The smallest one that would change what you do. Pick a relative lift of 20 percent: 11 percent becomes 13.2 percent, because 0.11 x 1.20 = 0.132.

**Confidence and power.** Confidence, conventionally 95 percent, controls how often you declare a winner that is not real. Power, conventionally 80 percent, controls how often you miss a winner that is real. The z-values are 1.96 for 95 percent two-sided confidence and 0.84 for 80 percent power.

The standard sample size formula for comparing two proportions:

```txt
n per variant =
  ( Z_alpha * sqrt( 2 * p_bar * (1 - p_bar) )
    + Z_beta  * sqrt( p1*(1-p1) + p2*(1-p2) ) )^2
  / (p2 - p1)^2

where  p1    = baseline conversion rate
       p2    = baseline x (1 + MDE)
       p_bar = (p1 + p2) / 2
       Z_alpha = 1.96   (95% confidence, two-sided)
       Z_beta  = 0.84   (80% power)
```

Plug in the AC Repair numbers, one step at a time.

```txt
p1    = 0.110
p2    = 0.132
p_bar = (0.110 + 0.132) / 2 = 0.121

First term:
  2 * 0.121 * 0.879      = 0.212718
  sqrt(0.212718)         = 0.46121
  1.96 * 0.46121         = 0.90397

Second term:
  0.110 * 0.890          = 0.09790
  0.132 * 0.868          = 0.114576
  sum                    = 0.212476
  sqrt(0.212476)         = 0.46095
  0.84 * 0.46095         = 0.38720

Numerator:
  (0.90397 + 0.38720)^2  = 1.29117^2 = 1.66712

Denominator:
  (0.132 - 0.110)^2      = 0.022^2   = 0.000484

n = 1.66712 / 0.000484   = 3,444.5
```

Round up, always, when sizing a test: **3,445 clicks per variant, call it 3,500.** That is 7,000 clicks total.

Two sanity notes on that number. First, it scales brutally with MDE. Halve the effect you want to detect and the requirement roughly quadruples, because the denominator is squared. Second, raising power from 80 percent to 90 percent (Z_beta = 1.28) pushes the same test to about 4,600 clicks per variant. If someone quotes you a sample size without stating the MDE and the power, the number is meaningless.

## From Sample Size to Calendar Time

A sample size is not a plan until you divide it by your traffic.

The AC Repair ad group gets **390 clicks per month**. A 50/50 split gives each variant 195 clicks per month.

```txt
Required per variant   = 3,500 clicks
Available per variant  = 390 / 2 = 195 clicks per month

Time to complete = 3,500 / 195 = 17.9 months
```

Eighteen months. Northgate's seasonality turns over twice in that window, competitors change, Google changes the auction, and the business will have replaced the ad four times for unrelated reasons. **This ad group cannot run this test.** Say that plainly rather than starting it anyway and reading it after six weeks.

You have exactly three honest responses.

**Pool traffic upward.** Run the test at campaign or account level rather than in one ad group. Northgate's non-brand campaigns together produce 390 + 178 + 142 = 710 clicks per month. That brings 7,000 clicks down to 7,000 / 710 = 9.9 months. Better, still not viable, and pooling only works if the change genuinely applies everywhere.

**Test a bigger change.** Raise the MDE. If you are willing to only detect a 50 percent relative lift, 11 percent to 16.5 percent, rerun the arithmetic:

```txt
p1 = 0.110, p2 = 0.165, p_bar = 0.1375

  2 * 0.1375 * 0.8625 = 0.237188 ; sqrt = 0.48702 ; x 1.96 = 0.95456
  0.110*0.890 = 0.09790
  0.165*0.835 = 0.137775
  sum = 0.235675 ; sqrt = 0.48546 ; x 0.84 = 0.40779

  (0.95456 + 0.40779)^2 = 1.36235^2 = 1.85600
  (0.165 - 0.110)^2     = 0.055^2   = 0.003025

n = 1.85600 / 0.003025 = 613.6  ->  614 per variant
```

614 per variant is 1,228 clicks total, which at 390 clicks per month is 3.1 months, or 1.7 months if you pool all non-brand traffic. That is a real test. The catch is that only a large change can produce a 50 percent lift, so this forces you toward rewriting the offer rather than swapping a word.

**Accept that you cannot test it.** For a small account this is frequently the right answer and it is not a failure. Make the change on judgment, document that it was a judgment call and not a tested result, and watch the trend. The professional behaviour is refusing to dress a judgment call up as an experiment.

## "It's Winning After 40 Clicks"

This is the single most common way marketers fool themselves, so work it in full.

Variant A: 4 conversions in 40 clicks, a 10 percent conversion rate. Variant B: 8 conversions in 40 clicks, a 20 percent conversion rate. B looks twice as good. Somebody wants to pause A this afternoon.

Start with each variant on its own. The standard error of a proportion is `sqrt(p * (1-p) / n)`.

```txt
Variant A: p = 0.10, n = 40
  SE = sqrt(0.10 * 0.90 / 40) = sqrt(0.00225) = 0.0474
  95% CI = 0.10 +/- 1.96 * 0.0474 = 0.10 +/- 0.093
         = 0.7% to 19.3%

Variant B: p = 0.20, n = 40
  SE = sqrt(0.20 * 0.80 / 40) = sqrt(0.00400) = 0.0632
  95% CI = 0.20 +/- 1.96 * 0.0632 = 0.20 +/- 0.124
         = 7.6% to 32.4%
```

Variant A's plausible range runs from almost zero to 19.3 percent. Variant B's runs from 7.6 percent to 32.4 percent. Those intervals overlap across an enormous stretch. A could truly be a 19 percent converter that got unlucky; B could truly be an 8 percent converter that got lucky.

Now test the difference directly. Under the assumption that the two variants are identical, pool them: 12 conversions in 80 clicks, so p_pooled = 0.15.

```txt
SE_pooled = sqrt( 0.15 * 0.85 * (1/40 + 1/40) )
          = sqrt( 0.1275 * 0.05 )
          = sqrt( 0.006375 )
          = 0.0798

z = (0.20 - 0.10) / 0.0798 = 1.25

two-sided p-value for z = 1.25  ~=  0.21
```

Read that last line carefully. **If the two variants were exactly identical, you would still see a gap this large or larger about 21 percent of the time.** One test in five. That is not evidence. And the confidence interval on the difference runs from about minus 5.5 percentage points to plus 25.5 percentage points, which is to say the data are equally consistent with B being worse than A.

The intuition worth carrying: at 40 clicks the difference between 4 conversions and 8 conversions is four events. Four. If two of B's converters had bounced instead and one of A's had converted, the result reverses. Acting on it is a coin flip dressed as analysis, and the reason it feels like analysis is that the percentages have decimal places.

A crude field heuristic that will keep you out of most trouble: **you need roughly 100 conversions per variant, not 100 clicks, before a modest effect is measurable.** For a 20 percent relative lift on an 11 percent baseline, the 3,445-click requirement implies about 379 conversions in the control arm.

## The Peeking Problem

Suppose you do size the test properly, then check it every morning and agree to stop as soon as significance appears. You have just broken it.

A significance threshold of 5 percent means that on any single look at the data, a truly null test has a 5 percent chance of crossing the line by luck. Look repeatedly and you get repeated chances to cross it. Roughly:

| Number of looks | Chance of a false "winner" |
| --- | --- |
| 1 | 5% |
| 2 | 8% |
| 5 | 14% |
| 10 | 20% |

Check daily for a month and the number climbs past one in four. Since a wandering test crosses the line and then wanders back, a policy of "stop as soon as it is significant" catches every upward excursion and none of the downward ones. It is a machine for manufacturing winners out of nothing.

The fix is not complicated. Set the sample size, set the end date, and read the test once at the end. If you genuinely need to look early, look only for breakage: a variant that is not serving, tracking that is not firing, a policy disapproval. Looking to check for damage is fine. Looking to decide is not.

There are legitimate statistical methods that permit early stopping, sequential testing and group sequential boundaries among them, and they work by spending your error budget deliberately across planned interim looks. What they never do is let you look whenever you feel like it against a fixed 5 percent threshold.

## Run Length Is Not the Same Thing as Sample Size

Two separate constraints. You need enough traffic, and you need enough calendar.

Even if you could accumulate 7,000 clicks in three days, you should not read the test after three days, because three days is not a business cycle. Northgate's demand is not uniform:

- **Weekday versus weekend.** Emergency AC calls spike on weekend afternoons when nobody can reach their usual contractor. Furnace install research happens on weeknights.
- **Time of day.** A 2 a.m. searcher with no AC in July is a different buyer from a 10 a.m. searcher in October.
- **Payday effects.** An $8,500 system replacement converts differently in the first week of the month than the third.
- **Seasonality.** The first freeze of the winter can triple furnace-related search volume in 48 hours, and it will land inside one arm's exposure and not the other if your run is short and your split is anything other than perfectly simultaneous.

The rule: **run for at least one complete week, and prefer two.** Whole weeks, not seven-plus-two days, so both variants get the same number of each weekday. If your business has a monthly cycle, run a month. If the first freeze lands mid-test, note it in the record and consider whether it changed the population enough to invalidate the comparison. A test that ran only across the freeze week is a test of "ads during a demand spike," which may not generalize to February.

And the corollary: if hitting your sample size would take 18 months, extending the run does not rescue the test. Sample size and run length are two gates and you must clear both.

## Reading a Result

Northgate ran a genuine campaign-level ad experiment across all non-brand traffic for eight weeks, testing a rewritten responsive search ad that changed the offer emphasis from "24/7 emergency service" to "Same-Day Repair, Flat-Rate Pricing, No Overtime Charges" and matched it to the same landing page. This is a bundle test on the copy, deliberately, because the account cannot power an isolation test.

| Variant | Impressions | Clicks | CTR | Spend | Conversions | Conv rate | CPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A (control) | 10,240 | 655 | 6.40% | $5,371.00 | 72 | 10.99% | $74.60 |
| B (challenger) | 10,180 | 668 | 6.56% | $5,477.60 | 105 | 15.72% | $52.17 |

The arithmetic, shown:

```txt
CTR A         = 655 / 10,240   = 6.396%  -> 6.40%
CTR B         = 668 / 10,180   = 6.562%  -> 6.56%
Spend A       = 655 x $8.20    = $5,371.00
Spend B       = 668 x $8.20    = $5,477.60
Conv rate A   = 72 / 655       = 10.992% -> 10.99%
Conv rate B   = 105 / 668      = 15.719% -> 15.72%
CPA A         = $5,371.00 / 72 = $74.597 -> $74.60
CPA B         = $5,477.60 / 105 = $52.167 -> $52.17

Absolute lift = 15.72% - 10.99% = 4.73 percentage points
Relative lift = 4.73 / 10.99    = 43.0%
CPA change    = ($52.17 - $74.60) / $74.60 = -30.1%
```

Now the significance check. Pooled conversion rate is 177 / 1,323 = 13.379 percent.

```txt
SE_pooled = sqrt( 0.13379 * 0.86621 * (1/655 + 1/668) )
          = sqrt( 0.115893 * 0.0030237 )
          = sqrt( 0.00035043 )
          = 0.01872

z = 0.0473 / 0.01872 = 2.53   ->  two-sided p ~= 0.011
```

And the confidence interval on the difference, which matters more than the p-value:

```txt
SE_diff = sqrt( 0.1099*0.8901/655 + 0.1572*0.8428/668 )
        = sqrt( 0.00014934 + 0.00019834 )
        = 0.01865

95% CI  = 0.0473 +/- 1.96 * 0.01865
        = +1.1 to +8.4 percentage points
        = roughly +10% to +76% in relative terms
```

Report it like this: **B beat A. The improvement is somewhere between about 1 and 8 percentage points of conversion rate; the point estimate of 4.7 points is the middle of a wide range, and the honest expectation after rollout is somewhere in that range rather than exactly 43 percent.** That last sentence is what separates a competent analyst from a deck-builder. The direction is established. The magnitude is not, and it will almost certainly regress toward the low end when you roll it out.

There are exactly three verdicts a test can produce, and you owe the client the right one.

**Winner.** The interval on the difference excludes zero in the direction you want, you hit your planned sample and run length, and the effect is large enough to matter commercially. Roll out the winner to 100 percent of traffic, record the expected effect as the low end of the interval rather than the point estimate, and start the next test.

**No difference detected.** You hit the planned sample size, the test was properly powered for your MDE, and the interval on the difference comfortably contains zero. This is a real, useful, publishable result. It means the variable you tested does not move this metric by at least your MDE in this account. Keep the control, because it is the incumbent and switching has a cost, and now stop spending time on that variable. Marketers routinely treat this as a wasted month. It is not. Knowing that button colour does not matter is worth exactly as much as knowing that the offer does, and it stops the team relitigating it.

**Inconclusive because underpowered.** You did not hit the planned sample, or you never calculated one, and the interval spans both a meaningful gain and a meaningful loss. This is not "B is slightly ahead." It is "this test answered nothing." Your options are to keep running if the calendar allows, to restart with a bigger change so a bigger MDE is acceptable, or to stop and make the decision on judgment while labelling it a judgment. What you may not do is report the leading variant as a winner.

## A Landing Page Test

The AC Repair landing page work produced a hypothesis: the form asks for seven fields, including full street address and a preferred time window, and cutting it to three fields (name, phone, ZIP) will lift form completion because people in a hot house with a broken AC will not fill in seven fields on a phone.

Design the test.

- **Unit of randomization:** the visitor, held consistent across sessions, so a returning visitor sees the same version.
- **Single variable:** form fields only. The headline, hero image, phone number, trust badges, and the ad pointing at the page all stay identical.
- **Primary metric:** form submissions plus calls per session, since a shorter form might simply push people to call. If you measured form submissions alone you could "win" by moving conversions to a channel you are not counting.
- **Baseline:** 11 percent.
- **MDE:** removing four fields is a substantial change, so a 30 percent relative lift, 11 percent to 14.3 percent, is defensible. Running the formula with p1 = 0.110 and p2 = 0.143 gives about 1,590 sessions per variant, 3,180 total.
- **Traffic check:** AC Repair sends 390 clicks per month, so 3,180 / 390 = 8.2 months. Not viable in one ad group. Pooling all non-brand traffic onto the tested page pattern gives 710 per month and 3,180 / 710 = 4.5 months. Still long. Raising the MDE to a 50 percent relative lift drops it to 614 per variant, 1,228 total, which is 1.7 months on pooled non-brand traffic. **Verdict: run it pooled, at a 50 percent MDE, for two months, and accept that a 20 percent improvement will be invisible to this test.**
- **Run length:** eight full weeks, which covers both weekday and weekend demand and two full payday cycles.

The rule you must not break: **do not change the ad while the landing page test is running.** The ad determines who arrives. A different headline pulls a different mix of intent, device, and urgency, so the two page versions would be receiving two different populations and the comparison collapses. If both need testing, test them sequentially, or run a proper factorial design with enough traffic to estimate the interaction, which this account does not have.

The same logic runs in reverse. While you are testing ads, freeze the landing page. And while any test is running, freeze the bid strategy, the budget, and the geo targeting, because all three change the traffic mix.

## Beyond This Lesson

Two families of method exist that relax the constraints above, and you should know they exist without pretending you can run them yet.

**Multi-armed bandits** shift traffic toward the better-performing arm continuously rather than holding a fixed split until the end. They earn more money during the test and give a less precise estimate of the effect, which is the right trade when you are choosing among many creatives and a wrong choice is cheap. They are not the right trade when you need a defensible number.

**Sequential and Bayesian methods** allow principled early stopping by controlling error across planned interim analyses, or by reporting the probability that B beats A rather than a p-value. They are genuinely better than fixed-horizon testing for most commercial work. They also require tooling and discipline that a small local account rarely has.

Both are outside this lesson. Neither one rescues a test with 40 clicks per arm.

## Test Tooling and How Delivery Breaks It

Google Ads gives you campaign **drafts and experiments**: you copy a campaign into a draft, edit the draft, and launch it as an experiment with a stated traffic split, commonly 50/50. The platform randomizes at the user level, holds both arms simultaneous, and reports them side by side. This is the correct tool for landing page tests, bid strategy tests, and structural tests. **Ad variations** apply a specified text change across many ads and report the two versions against each other; that is the correct tool for a copy test that spans a campaign.

Meta Ads Manager and LinkedIn Campaign Manager both provide native split-test tools that randomize the audience and prevent the two cells from overlapping. Use the native tool rather than launching two ad sets and comparing them, for the same reason described next.

Here is the trap that ruins most homemade tests. **Putting two ads in one ad group and comparing them is not a randomized experiment.** The auction picks which ad to serve on each impression, and it picks based on predicted performance for that query, that user, that device, that time. Two consequences:

- **Unequal delivery.** One ad will accumulate far more impressions than the other, often within days. You end up with 8,000 impressions on A and 900 on B, which means B is not underperforming, B is undersampled.
- **Non-random assignment.** The system serves each ad to the queries and users where it predicts that ad will do best. That is a confound, not a coin flip. It also means the ad that starts with a small early advantage gets served more, which entrenches the advantage.

Ad rotation settings are commonly offered as the fix: set rotation to serve ads more evenly rather than optimizing. It helps, and it is worth doing if you must run an in-ad-group comparison, but it evens impressions without making assignment random with respect to query and user, and platforms treat even rotation as a suggestion that degrades over time. Prefer the experiment framework. If you cannot, at minimum set rotation to even, verify that impression counts stayed within roughly 10 percent of each other, and disclose the limitation in your write-up.

One more delivery hazard: a variant that gets disapproved for policy, or that has a lower quality signal and therefore a higher CPC, is not being tested on equal terms. Check that both arms actually served for the full window and that their costs per click are comparable before you interpret anything.

## Rigor as an Obligation, Not a Preference

Everything above has an ethical edge, because the person paying for the media is relying on you to tell them what is true.

**Do not p-hack.** Segmenting a null result by device, then by geography, then by hour of day until something crosses 95 percent is not analysis. With twenty segments you expect one false positive by construction. If you are going to segment, declare the segments in advance and adjust your threshold accordingly.

**Do not rerun until you like the answer.** Restarting a test because the challenger lost, with no change to the design, is peeking with extra steps.

**Do not report a 3 percent lift as a win when the interval spans zero.** Write "no difference detected." Nobody has ever been fired for that sentence, and plenty of accounts have been quietly wrecked by a string of imaginary 3 percent wins that never compounded into anything measurable at the revenue line.

**Do not report the metric that flatters you.** If you declared conversion rate as the primary metric and CTR is the only thing that improved, you report that conversion rate did not improve, and you note the CTR movement as a secondary observation.

## The Test Record

Every test gets a one-page record, written before launch and completed after. It takes ten minutes and it is the reason your account has institutional memory instead of a series of forgotten opinions.

```txt
TEST RECORD

Test ID:          NG-AD-2024-07
Account:          Northgate Heating & Air
Surface:          Non-brand campaigns, responsive search ad copy
Hypothesis:       Leading with same-day availability and flat-rate
                  pricing will raise conversion rate versus leading
                  with 24/7 emergency positioning, because price
                  uncertainty is the stated hesitation in call notes.
Variants:         A = control RSA (24/7 emergency)
                  B = challenger RSA (same-day, flat-rate, no overtime)
Changed:          Headline set and description 1. Landing page,
                  extensions, bids, budget, geo all held constant.
Primary metric:   Conversion rate (form + call over 60s)
Secondary:        CTR, CPA, call duration
Baseline:         10.99%
MDE:              +50% relative (formula gives 614 per variant;
                  650 planned for a small margin)
Sample planned:   650 clicks per variant
Run planned:      8 full weeks, 2024-05-06 to 2024-06-30
Stop rule:        Read once at end of window. No interim decisions.
Split:            50/50, campaign experiment, user-level
RESULT
Sample actual:    655 / 668 clicks
Conv rate:        10.99% vs 15.72%
Difference:       +4.73 pp (95% CI +1.1 to +8.4 pp)
Significance:     z = 2.53, p ~= 0.011
Verdict:          Winner - B
Decision:         Roll B to 100% on 2024-07-01. Forecast the gain
                  at the low end of the interval (+1 pp) for
                  budgeting purposes.
Caveats:          Bundle test on copy; cannot attribute the gain to
                  flat-rate pricing specifically. Ran across the
                  first hot week of summer, which may inflate
                  urgency-based response.
```

The caveats field is the one people skip and the one that saves you a year later when the result does not replicate.

## Practice

Work in a paused campaign, a draft, or an unlaunched experiment. Nothing in this exercise requires live spend, and you must not start one.

**Part 1: Design a test (deliverable: a completed test record).**

You are given this hypothesis for Northgate's Furnace Install campaign: *"Adding a financing message ('$0 down, 60 months, approved in minutes') to the ad copy will raise conversion rate, because a $8,500 replacement is a financing decision for most households."*

1. Write the hypothesis, the single changed variable, and what you are explicitly holding constant.
2. Declare the primary metric and justify it in one sentence. Declare two secondary metrics you will observe but not decide on.
3. State the baseline. Use the Furnace Install ad group figures: 6.7 percent conversion rate, $8.99 average CPC, 178 clicks per month.
4. Choose an MDE and defend the choice. Then calculate the required sample per variant using the two-proportion formula from this lesson, showing every line of arithmetic. Round up.
5. Convert the sample size into calendar time using the ad group's real click volume. Show the division.
6. Write an explicit verdict: **can this ad group power this test, yes or no?** If no, state which of the three responses you are taking (pool traffic upward, raise the MDE, or decline to test) and redo the arithmetic for that response.
7. State the run length separately from the sample size, and justify it against Northgate's business cycle and seasonality. Note that a furnace test running from October to December sits on top of the first freeze.
8. Specify the tooling: which mechanism you would use to run this, and what you will check to confirm delivery was not unequal.
9. Build the experiment as a **draft or paused experiment only**. Do not launch it. Screenshot or export the configuration as evidence.

**Part 2: Interpret three results (deliverable: three written decisions).**

Each table below is a completed test on Northgate's AC Repair traffic. All spend figures use the ad group's $8.20 average CPC. For each one, compute the relative lift on the primary metric, estimate whether the difference is distinguishable from zero, choose one of the three verdicts (winner, no difference detected, inconclusive because underpowered), and write two or three sentences telling Northgate's owner what you are going to do and why.

*Result 1*

| Variant | Impressions | Clicks | CTR | Spend | Conversions | Conv rate | CPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | 12,400 | 806 | 6.50% | $6,609.20 | 89 | 11.04% | $74.26 |
| B | 12,300 | 848 | 6.89% | $6,953.60 | 128 | 15.09% | $54.33 |

*Result 2*

| Variant | Impressions | Clicks | CTR | Spend | Conversions | Conv rate | CPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1,150 | 74 | 6.43% | $606.80 | 8 | 10.81% | $75.85 |
| B | 1,180 | 78 | 6.61% | $639.60 | 11 | 14.10% | $58.15 |

*Result 3*

| Variant | Impressions | Clicks | CTR | Spend | Conversions | Conv rate | CPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | 9,800 | 627 | 6.40% | $5,141.40 | 69 | 11.00% | $74.51 |
| B | 9,750 | 796 | 8.16% | $6,527.20 | 58 | 7.29% | $112.54 |

For each result, use the pooled two-proportion z calculation shown earlier in the lesson:

```txt
p_pooled = (conv_A + conv_B) / (clicks_A + clicks_B)
SE       = sqrt( p_pooled * (1 - p_pooled) * (1/clicks_A + 1/clicks_B) )
z        = (rate_B - rate_A) / SE

|z| >= 1.96  ->  distinguishable from zero at 95%
|z| <  1.96  ->  not distinguishable
```

For Result 3 specifically, state which metric moved in which direction and explain in plain language, to a non-technical business owner, why the variant with the better click-through rate is the one you are shutting off.

**Part 3: One paragraph.** Pick whichever of the three results you found hardest to call, and write the paragraph you would send the client. No jargon, no p-values, one recommendation, and an honest statement of what you do not know.
