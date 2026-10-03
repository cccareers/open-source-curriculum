---
lesson_id: se305-03
course_id: se305
pathway: technical-sales-representative
title: Reading a Pipeline Report
order: 3
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Read a pipeline report for conversion, velocity, and coverage, and say what
    it implies
---

## What a pipeline report actually is

"Pipeline report" is three different documents wearing one name, and confusing them is the most common analytical mistake reps make.

**A snapshot** shows the open pipeline as it stands right now: how many opportunities sit in each stage and what they are worth. It answers "what do I have?" It cannot answer any question about conversion, because it contains no closed deals.

**A cohort** takes a set of opportunities created in some window and follows them to their fate. It answers "what happens to deals like mine?" This is the only report that produces trustworthy conversion rates.

**A flow report** counts movement over a period: opportunities created, advanced, pushed back, won, lost. It answers "what changed?" and it is the one that catches a pipeline going quietly stale.

You need all three, and you need to know which one you are looking at before you read a single number off it. A conversion rate computed from a snapshot — dividing the count in one stage by the count in the previous stage — is one of the most misleading figures in sales, because a stage that is emptying fast looks like it converts brilliantly and a stage where deals are piling up looks like it converts badly.

## The snapshot, and what it cannot tell you

Here is your open pipeline again, unchanged from lesson 2, on 30 September.

| Stage | Open opportunities | Value | Average deal |
| --- | --- | --- | --- |
| Discovery | 14 | $364,000 | $26,000 |
| Solution validation | 9 | $270,000 | $30,000 |
| Proposal | 6 | $186,000 | $31,000 |
| Negotiation | 3 | $105,000 | $35,000 |
| **Total** | **32** | **$925,000** | **$28,906** |

Three things this table does tell you honestly.

**The shape is roughly right.** Counts fall as stages advance, which is what a functioning funnel looks like. A pipeline with more deals in proposal than in discovery is either about to have a very good quarter or has stopped prospecting.

**Deal size rises with stage.** $26,000 at discovery climbing to $35,000 at negotiation. That could mean larger deals survive longer — or it could mean you inflate amounts as deals progress, which is a data-quality question you can answer by comparing the amount field's creation value to its current value.

**Your open deals are bigger than your won deals.** The open average is $28,906 against a won average of $28,500 and a **lost** average of $30,500. Since your losses skew large, an open pipeline that skews large is not automatically good news.

And the one thing it cannot tell you: nothing here is a conversion rate. Fourteen at discovery and nine at validation is not a 64% conversion. Those are different deals at different ages. For conversion you need a cohort.

## The cohort report: real conversion

Take every opportunity you created in the trailing twelve months that has since **closed** — 24 won and 72 lost, 96 in total — and record the furthest stage each one reached. The 32 still open are deliberately excluded, because their fate is unknown and including them would understate every rate.

| Furthest stage reached | Opportunities | Share of the 96 | Step conversion |
| --- | --- | --- | --- |
| Discovery (all of them) | 96 | 100% | — |
| Solution validation | 58 | 60.4% | 60.4% |
| Proposal | 36 | 37.5% | 62.1% |
| Negotiation | 30 | 31.3% | 83.3% |
| Closed won | 24 | 25.0% | 80.0% |

Check the arithmetic yourself: 58 / 96 = 60.4%; 36 / 58 = 62.1%; 30 / 36 = 83.3%; 24 / 30 = 80.0%. And the bottom line, 24 / 96 = 25.0%, is exactly the win rate from lesson 2. That is the reconciliation you should always run — **the cohort's cumulative conversion has to equal your win rate**, or your stage data and your outcome data disagree and one of them is wrong.

Read the step-conversion column and the story is immediate. Once a deal reaches proposal you are strong: 83.3% of proposals reach negotiation and 80.0% of negotiations close won. The damage is entirely in the first two steps, where you lose 39.6% and then a further 37.9%. Of every 100 opportunities you create, only 37 ever see a proposal.

Now turn the same table inside out and count where deals **died**:

| Died in stage | Count | Mean days alive |
| --- | --- | --- |
| Discovery | 38 | 64 |
| Solution validation | 22 | 118 |
| Proposal | 6 | 145 |
| Negotiation | 6 | 169 |
| **All losses** | **72** | **96** |

The counts follow directly from the cohort: 96 − 58 = 38 died in discovery, 58 − 36 = 22 died in validation, 36 − 30 = 6 died in proposal, 30 − 24 = 6 died in negotiation. The weighted mean is (38 × 64 + 22 × 118 + 6 × 145 + 6 × 169) / 72 = 6,912 / 72 = 96 days, matching the lost-cycle figure from lesson 2.

The line that should stop you is the first one. **Thirty-eight deals took an average of 64 days to die in discovery.** Your median won deal closes in 61 days. You are spending longer on your earliest-stage losses than on your entire winning cycle. That single row is worth more than every other observation in this lesson, and lesson 4 is about what to do with it.

## Stage duration for the deals that worked

The same cohort, restricted to the 24 wins, gives you the time budget of a successful deal.

| Stage | Mean days in stage, won deals |
| --- | --- |
| Discovery | 18 |
| Solution validation | 21 |
| Proposal | 19 |
| Negotiation | 16 |
| **Total** | **74** |

That sums to the 74-day mean won cycle from lesson 2. Now you have a benchmark you can apply to any open deal: a discovery opportunity that has been sitting for 40 days is at more than double the duration of a deal that eventually wins. It is not necessarily dead, but it is no longer behaving like a winner, and it should be treated as an exception rather than as normal pipeline.

This is the most practical output of a cohort report. It converts "how long is too long?" from a judgement call into a number.

## Weighted pipeline, and where the weights come from

Weighting multiplies each open deal by the probability that it closes.

Most CRMs ship with default stage probabilities — often something like 10%, 30%, 60%, 90% — that were chosen by whoever configured the system and have never been checked against a single real outcome. Your cohort gives you real ones. The probability of winning from a stage is the wins divided by the number of deals that reached that stage:

```text
From discovery:            24 / 96 = 25.0%
From solution validation:  24 / 58 = 41.4%
From proposal:             24 / 36 = 66.7%
From negotiation:          24 / 30 = 80.0%
```

Apply both sets to the same open pipeline:

| Stage | Open value | Default probability | Weighted | Your probability | Weighted |
| --- | --- | --- | --- | --- | --- |
| Discovery | $364,000 | 10% | $36,400 | 25.0% | $91,000 |
| Solution validation | $270,000 | 30% | $81,000 | 41.4% | $111,780 |
| Proposal | $186,000 | 60% | $111,600 | 66.7% | $124,062 |
| Negotiation | $105,000 | 90% | $94,500 | 80.0% | $84,000 |
| **Total** | **$925,000** | | **$323,500** | | **$410,842** |

The two answers differ by **$87,342**, about 27%. The defaults understate your early stages badly and overstate your negotiation stage — your negotiations convert at 80%, not 90%, so one in five deals you have already called "in negotiation" does not close.

Two cautions before you trust your own weights. First, they are derived from 96 opportunities, and the negotiation figure rests on just 30 — one different outcome moves it more than three points. Second, a weighted total is a **portfolio** estimate. It is meaningful across thirty-two deals and meaningless on one: no individual deal closes for $84,000 out of $105,000. Never quote a weighted figure for a single opportunity.

## Aging: the deals that stopped moving

A snapshot plus stage duration gives you an aging report. Take the 32 open opportunities and flag any that has been in its current stage for more than twice the median time deals normally spend there.

| Stage | Open | Median days in stage | Beyond 2x median | Value flagged |
| --- | --- | --- | --- | --- |
| Discovery | 14 | 22 | 5 | $130,000 |
| Solution validation | 9 | 27 | 3 | $90,000 |
| Proposal | 6 | 16 | 1 | $31,000 |
| Negotiation | 3 | 12 | 0 | $0 |
| **Total** | **32** | | **9** | **$251,000** |

Nine of your 32 open opportunities — 28% of the count and 27% of the value — are stalled by their own stage's standard. That $251,000 is still being counted as pipeline, still supporting your coverage ratio, and still, in most reps' heads, "in play".

The action a stalled deal calls for is not a follow-up email. It is a decision: advance it with a dated next step and a named person, or close it out. A stalled opportunity that stays open costs you twice — once in the attention it absorbs and once in the false coverage it supplies.

## Flow: what actually changed this month

The third report counts movement over a window. September looked like this.

| Movement in September | Count | Value |
| --- | --- | --- |
| Created | 8 | $214,000 |
| Advanced a stage | 11 | $318,000 |
| Pushed to a later close date | 9 | $265,000 |
| Moved backward a stage | 2 | $57,000 |
| Closed won | 2 | $46,000 |
| Closed lost | 6 | $171,000 |

Read it as a balance. You created 8 opportunities and resolved 8 (2 won, 6 lost), so the pipeline count is flat. But you needed **10.7 new opportunities a month** to sustain last year's rate — 128 created over twelve months — so 8 is a 25% shortfall in creation, and the effect will land two months from now, not this month.

The row that should worry you most is "pushed to a later close date": 9 opportunities worth $265,000 moved right. Deals that slip once slip again. Nine slips in a month against 32 open deals means 28% of your pipeline had its date rewritten, and every one of those rewrites was a small, invisible downgrade of a forecast that still looks unchanged.

## Reading the report for coverage, and finding the lie

Now put the reports together against the question that actually matters this quarter.

```text
Q4 quota                        $200,000
Closed-won so far in Q4          $46,000
Remaining gap                   $154,000
Open, close date within Q4      $612,000 across 21 opportunities
Coverage as reported            $612,000 / $154,000 = 3.97x
Break-even coverage             1 / 0.25 = 4.0x
```

Read literally, you are a hair under the line — 3.97x against 4.0x. But run the hygiene check before you believe it: **seven of those 21 opportunities have a close date that is already in the past**, and they carry $196,000. They appear in a "closing this quarter" filter only because the filter catches every date at or before the end of Q4, including dates that expired in July.

```text
Clean Q4 pipeline    = $612,000 - $196,000 = $416,000 across 14 opportunities
Clean coverage       = $416,000 / $154,000 = 2.70x
Expected value       = $416,000 x 0.25 = $104,000
Gap                  = $154,000
Expected shortfall   = $50,000
```

That is the whole lesson in one calculation. The same CRM, the same quarter, the same deals — and the difference between a report you trust and a report you clean is the difference between "on the line" and "$50,000 short with four weeks left". Seven stale date fields were worth a 1.27x swing in coverage.

**Say what it implies, not what it shows.** "Coverage is 2.70x" is a reading. The implication is a sentence with a decision in it: *at my real win rate, my dated Q4 pipeline expects $104,000 against a $154,000 gap, so I need either $200,000 of additional Q4-dated pipeline in the next two weeks or a materially better win rate on the fourteen deals I have — and only one of those is available to me this late in a quarter.*

## Six ways a pipeline report lies

- **Stale close dates.** Demonstrated above. Any date in the past is a data error, not a forecast.
- **Snapshot conversion.** Dividing one stage's count by the previous stage's count in a snapshot. Use a cohort.
- **Stage inflation.** Deals logged in proposal because a deck was sent, not because a proposal was accepted for review. Inflation always flatters the late-stage conversion rates and destroys the weighted total.
- **Whale distortion.** One $180,000 deal supplying most of the coverage means your ratio is really a single yes-or-no event. Always recompute coverage with the largest deal removed and look at both numbers.
- **Sample size.** Six losses in proposal and six in negotiation cannot support a confident claim about either stage. State the count next to every rate you quote.
- **Survivorship in the cohort.** Excluding the 32 still-open deals is correct for conversion, but if your open pipeline is unusually old or unusually large, the closed cohort no longer represents what you are working now. Re-run it quarterly.

## Practice

All figures come from the tables in this lesson.

**Exercise 1 — rebuild the cohort.** From the "died in stage" table alone (38 / 22 / 6 / 6 losses and 24 wins), reconstruct the full cohort conversion table: opportunities reaching each stage, share of the 96, and step conversion. Verify that your cumulative conversion equals the 25.0% win rate, and show the check.

**Exercise 2 — reweight the pipeline.** Suppose a review of your open deals finds that four opportunities currently sitting in proposal, worth $124,000 in total, have never had a proposal formally reviewed by the buyer and belong back in solution validation. Rebuild the open-pipeline snapshot with those four moved, then recompute the weighted total using your own cohort probabilities. State the new weighted figure, the change from $410,842, and what that change tells you about stage discipline.

**Exercise 3 — the coverage argument.** Your manager looks at the same report and says coverage is 3.97x, which is fine. Write the four-sentence reply that changes their mind. It must name the seven stale opportunities, show the recomputed coverage and expected value, compare both to the $154,000 gap, and end with the specific thing you are asking for.

**Exercise 4 — read the flow.** Using the September movement table, answer three questions with arithmetic: how far below the sustaining rate was creation, what share of the open pipeline had its close date pushed, and what the six September losses were worth relative to a month's share of quota. Then write the single sentence you would put at the top of your monthly note.

## Check your understanding

1. A snapshot shows 14 deals in discovery and 9 in validation. Is the discovery-to-validation conversion 64%? *(Answer: no — those are different deals at different ages. Conversion needs a cohort of closed opportunities.)*
2. What reconciliation should you always run on a cohort table? *(Answer: cumulative conversion from the first stage to closed won must equal your win rate.)*
3. Why does the "closing this quarter" filter overstate coverage, and what filter fixes it? *(Answer: it includes open deals whose close dates have already passed; filter for close dates between today and quarter end.)*
