---
lesson_id: se305-04
course_id: se305
pathway: technical-sales-representative
title: Diagnosing Your Own Funnel
order: 4
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Diagnose where a personal funnel is leaking and name the likely cause
---

## Diagnosis is a procedure, not an intuition

You now have a metric card and you can read a pipeline report. This lesson turns both into a diagnosis: a defensible statement of **where** your funnel leaks, **how much** the leak is worth, and **why** it is most likely happening.

The reason this needs a procedure is that the obvious answer is usually wrong. Ask a rep who missed quota what went wrong and you will hear "I need more pipeline" almost every time, because volume is the only lever most people have a feel for. Sometimes that is right. Often the same rep is sitting on a conversion problem that more pipeline would only make more expensive.

The procedure has six steps.

1. **Establish the baseline.** Your own rates, computed from a closed cohort.
2. **Find a reference.** Your own prior period, the team median, or a stated benchmark. A rate with nothing to compare it to cannot be judged.
3. **Rank the gaps by value, not by size.** The biggest percentage gap is frequently not the biggest dollar leak.
4. **Generate candidate causes** at the leaking step — at least four, including at least one measurement cause.
5. **Test each with a discriminating check** — a query you can actually run in the CRM whose result differs depending on which cause is true.
6. **Name one change**, with a measurable target and a review date.

Steps 1 through 3 are arithmetic. Steps 4 and 5 are where analysis stops being safe and starts being useful. Step 6 is the whole point, and it belongs to lesson 6.

## Step 1 and 2: your baseline against a reference

Your baseline is the cohort from lesson 3. The reference here is the median of the eight reps in your segment, which your manager can pull from the same reports.

| Metric | You | Team median | Gap |
| --- | --- | --- | --- |
| Opportunities created, trailing 12 months | 128 | 121 | +7 |
| Discovery to solution validation | 60.4% | 74% | **−13.6 pts** |
| Solution validation to proposal | 62.1% | 71% | **−8.9 pts** |
| Proposal to negotiation | 83.3% | 78% | +5.3 pts |
| Negotiation to won | 80.0% | 76% | +4.0 pts |
| Win rate | 25.0% | 31% | −6.0 pts |
| Average won deal | $28,500 | $27,200 | +$1,300 |
| Median won cycle | 61 days | 58 days | +3 days |
| Mean days alive, discovery losses | 64 | 33 | **+31 days** |

Four rows are fine or better than fine. You create slightly more opportunities than the median rep, your deals are slightly larger, your cycle is within three days, and your late-stage execution — proposal onward — is the best part of your funnel. Whatever is wrong, it is not closing ability, it is not deal size, and it is not effort.

Two rows are badly off, and they are adjacent: the first two steps of the funnel. One row is off by an enormous margin: your discovery-stage losses take nearly twice as long to die as the median rep's.

That is already a much more specific statement than "I need more pipeline." But it is not yet a diagnosis, because you have not priced it.

## Step 3: price the leak

A percentage gap tells you nothing about how much money is at stake. To price a step, ask what your annual won ACV would have been if that one step had matched the reference and everything downstream had stayed exactly as it is.

**Discovery to solution validation, 60.4% to 74%.**

```text
Reaching validation at 74%:   96 x 0.74 = 71 opportunities (you had 58)
Additional opportunities:     71 - 58 = 13
Carried through your own rates:
  13 x 0.621 (to proposal)    = 8.07
  8.07 x 0.833 (to negotiation) = 6.72
  6.72 x 0.800 (to won)       = 5.38 additional wins
Value at your $28,500 average: 5.38 x $28,500 = $153,330
```

**Solution validation to proposal, 62.1% to 71%.**

```text
Reaching proposal at 71%:     58 x 0.71 = 41.2 opportunities (you had 36)
Additional opportunities:     5.2
  5.2 x 0.833                 = 4.33
  4.33 x 0.800                = 3.46 additional wins
Value:                        3.46 x $28,500 = $98,610
```

**Proposal to negotiation and negotiation to won.** Both are already above the reference. Closing a gap that does not exist is worth nothing, and trying to improve a step where you are already the strongest on the team is the least productive use of a quarter available to you.

| Leak | Percentage gap | Annual value |
| --- | --- | --- |
| Discovery to validation | −13.6 pts | **$153,330** |
| Validation to proposal | −8.9 pts | $98,610 |
| Proposal to negotiation | none | — |
| Negotiation to won | none | — |

Your quota gap last year was $116,000. The first leak alone is worth more than the miss.

There is a second currency to price, and in this case it is nearly as important as the first. Your 38 discovery-stage losses each consumed 64 days:

```text
Your discovery losses:        38 x 64 = 2,432 opportunity-days
At the team median of 33:     38 x 33 = 1,254 opportunity-days
Capacity returned:            1,178 opportunity-days
Divided by your 74-day mean won cycle: 15.9 additional deal slots a year
```

Nearly sixteen slots. At a 25% win rate and a $28,500 average deal, sixteen additional slots is roughly four wins and $114,000 — and it costs nothing but faster no's. Note that this is a **capacity** figure of the kind lesson 2 warned about: it is a ceiling that assumes you refill every freed slot, not a forecast. Quote it as a ceiling.

## Step 4: candidate causes

Now, and only now, you get to have a theory. The rule is that you must generate several before you test any, because the first explanation that occurs to you is usually the one that flatters you most.

For the discovery-to-validation step, five candidates are worth taking seriously.

**A. Weak qualification.** You take opportunities into discovery that never had a buyer, a budget, or a reason to act. This predicts that losing deals will lack a named economic buyer and a quantified problem far more often than advancing ones do.

**B. No compelling event.** The problem is real but nothing forces a decision this year, so deals drift rather than die. This predicts loss reasons clustering on "no decision" and "no budget this cycle" and long times alive.

**C. Lead source mix.** Some sources produce opportunities that were never going to convert. This predicts that discovery deaths concentrate in specific sources rather than spreading evenly.

**D. Discovery execution.** You are not surfacing a quantified problem in the first meetings, so there is nothing for the buyer to validate. This predicts poor conversion **within** a source that converts well for other reps.

**E. A measurement cause: stage definition drift.** You create an opportunity on any first conversation, while other reps only create one after a qualification bar is met. If so, your discovery stage contains something different from theirs and part of the 13.6-point gap is a definitional artefact, not a selling problem.

Candidate E matters more than it looks. If it is true, then fixing "conversion" by changing when you log an opportunity would improve the number without improving anything real — exactly the gaming failure that lesson 2's fourth test is designed to catch. Rule it in or out first, because it changes how you read every other check.

## Step 5: discriminating checks

A check is only useful if different causes predict different results. Here is what the CRM gives back.

**Check 1 — qualification evidence at the point of death.** For the 96 closed opportunities, compare the presence of a named economic buyer on the account.

```text
Deals that died in discovery (38):  9 had a named economic buyer  = 23.7%
Deals that reached validation (58): 47 had a named economic buyer = 81.0%
```

That is a very large separation, and it supports candidate A directly.

**Check 2 — loss reasons for the 38 discovery deaths.**

| Loss reason | Count | Mean days alive |
| --- | --- | --- |
| No decision / went quiet | 17 | 78 |
| No budget this cycle | 8 | 61 |
| No compelling event | 6 | 57 |
| Chose a competitor | 3 | 44 |
| Chose to build in-house | 2 | 39 |
| Not a product fit | 2 | 33 |
| **Total** | **38** | **64** |

Thirty-one of 38 deaths — 82% — are variations on "nothing forced a decision". Only five were lost to a competitor or an in-house build, which is to say only five were lost to anyone. Candidates A and B are both supported, and they are really the same finding seen from two sides: you are opening opportunities where no decision was ever going to be made, and then waiting a long time to admit it.

**Check 3 — source mix across the closed cohort.**

| Source | Created | Won | Win rate | Died in discovery |
| --- | --- | --- | --- | --- |
| Inbound demo request | 22 | 9 | 40.9% | 4 |
| Partner referral | 12 | 6 | 50.0% | 1 |
| Marketing event list | 26 | 4 | 15.4% | 15 |
| Self-sourced outbound | 36 | 5 | 13.9% | 18 |
| **Total** | **96** | **24** | **25.0%** | **38** |

Sixty-two of your 96 opportunities came from event lists and self-sourced outbound. Those two sources produced **33 of your 38 discovery deaths and only 9 of your 24 wins**. Candidate C is supported strongly.

But read the caveats out loud, because they change what you can claim. Partner referral is twelve opportunities; one different outcome swings that 50% by eight points, so "partner referrals convert best" is a hint, not a fact. And inbound volume is not yours to control — telling yourself "work more inbound" is a wish, not a plan, unless marketing agrees to send you more.

**Check 4 — the measurement question.** Pull the median number of days between account creation and opportunity creation, for you and for the two reps with the highest discovery-to-validation rates.

```text
You:              1 day
Comparison rep 1: 12 days
Comparison rep 2: 9 days
```

You open an opportunity the day the account appears. They wait until something has happened. Candidate E is at least partly true: some of your 13.6-point gap is that your discovery stage begins earlier than theirs.

That does not let you off. An opportunity opened on day one is not a measurement trick if you then spend 64 days on it — the days are real whether or not the record is. But it does mean your honest target is not the full 74%, because part of that gap is definitional.

## The four ways to miss, and telling them apart

Every quota miss reduces to one of four causes, and the diagnosis you have just run is really the process of choosing between them.

| Cause | The signature in the data | The check |
| --- | --- | --- |
| **Volume** | Rates at or above reference, opportunity count below the sustaining rate | Compare created per month to quota / (win rate x deal size) |
| **Conversion** | Opportunity count fine, one or more step rates below reference | Cohort conversion table against a reference |
| **Deal size** | Rates fine, count fine, average and median deal below reference | Median deal size by segment and by source |
| **Cycle** | Everything fine on rates but deals resolve too slowly to fit the period | Mean and median cycle, plus days alive for losses |

Your signature is unambiguous. Volume is above the team median. Deal size is above the team median. Cycle on wins is within three days. Conversion at the first two steps is far below, and the time cost of losses is double. **You have a qualification-driven conversion problem with a severe time-to-no component**, concentrated in two lead sources, and partly overstated by an early stage-entry habit.

That sentence is a diagnosis. Compare it to "I need more pipeline" — which, given a 25.0% win rate and a first step that already discards 39.6% of what you create, would have cost you more time for the same result.

## What a diagnosis is allowed to claim

Three disciplines separate a diagnosis from an opinion with numbers attached.

**Name the sample size beside every rate.** "80.0% negotiation-to-won" rests on 30 deals. "50% partner referral win rate" rests on 12. The first is worth planning around; the second is worth watching.

**Distinguish correlation from cause.** Deals with a named economic buyer convert at 81%. That does not prove that naming an economic buyer causes conversion — it is at least as likely that good deals make the buyer easy to find. The check still discriminates usefully, but the claim you can defend is "the absence of a named buyer is a reliable early signal of a deal that will die", not "add a buyer name and the deal converts".

**Say which figure you do not trust.** In this dataset it is the proposal and negotiation loss counts, six each. Anything you conclude about those two stages is one deal away from reversing.

## From diagnosis to a testable change

A diagnosis that does not end in a change is a hobby. The change should be one thing, aimed at the priced leak, with a target you could lose a bet on.

**The change.** Before an opportunity is logged as discovery, it must have a named economic buyer and a problem stated in the buyer's own numbers. Any discovery opportunity that reaches day 21 without both is closed out with a loss reason, not nurtured.

**The targets.** Discovery-to-validation conversion from 60.4% to 70% within two quarters — 70% rather than the team's 74% because part of that gap is the stage-entry definition you are also changing. Mean days alive for discovery losses from 64 to 35.

**The expected value.**

```text
At 70%:  96 x 0.70 = 67.2 reaching validation (you had 58)
         +9.2 opportunities
         9.2 x 0.621 x 0.833 x 0.800 = 3.81 additional wins
         3.81 x $28,500 = $108,585
```

**What you give up.** Opportunity count will fall, possibly sharply, because the two weakest sources supply most of the deals that will now fail the bar. Say so in advance, in writing, or the first month of the experiment will look like a collapse in prospecting.

**The review date.** Ninety days, on the trailing-90-day version of the same two metrics — not the trailing-twelve-month version, which will barely move in a quarter and will tell you nothing.

## Practice

**Exercise 1 — price a different leak.** Suppose the team medians were unchanged but your rates were: discovery to validation 71%, validation to proposal 70%, proposal to negotiation 61%, negotiation to won 74%, on the same 96 closed opportunities and the same $28,500 average deal. Build the cohort table, identify which step now leaks most, price each gap in annual ACV using the method above, and state which one you would attack. Show every step.

**Exercise 2 — design the checks.** For the leak you chose in Exercise 1, write four candidate causes — at least one of which must be a measurement cause — and for each, one discriminating check you could run in a CRM report. A check counts only if you can say, before running it, what result would make you believe the cause and what result would make you abandon it.

**Exercise 3 — argue with the source table.** Using the source-mix table in this lesson, a colleague concludes: "Stop all outbound and work only inbound and partner referrals." Write a 150-word response that uses at least three figures from the table, names the sample-size problem, names the reason the recommendation is not fully within your control, and proposes a smaller change that is.

**Exercise 4 — the four-cause triage.** For each of these three reps, name which of the four causes is most likely and state the one additional figure you would pull to confirm it.

- Rep A: 164 opportunities created, 33% win rate, $19,400 average deal against a team median of $27,200, 55-day median cycle, attainment 71%.
- Rep B: 74 opportunities created, 34% win rate, $29,100 average deal, 60-day median cycle, attainment 68%.
- Rep C: 131 opportunities created, 26% win rate, $28,900 average deal, 118-day median won cycle against a team median of 58, attainment 79%.

## Check your understanding

1. Why rank leaks by dollars rather than by percentage-point gap? *(Answer: a large gap at a step with little downstream flow can be worth less than a smaller gap earlier in the funnel; dollars show what fixing it is actually worth.)*
2. What makes a check "discriminating"? *(Answer: different candidate causes predict different results, and you can say before running it what result would make you believe or abandon each cause.)*
3. Deals with a named economic buyer convert at 81%. What can you claim, and what can't you? *(Answer: you can claim the absence of a named buyer is a reliable early warning; you cannot claim that adding a name causes conversion.)*
