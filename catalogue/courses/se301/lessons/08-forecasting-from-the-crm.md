---
lesson_id: se301-08
course_id: se301
pathway: technical-sales-representative
title: Forecasting from the CRM
order: 8
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Produce a defensible forecast from CRM opportunity data
---

## What a forecast actually is

A forecast is a statement, made in advance, about how much revenue will close in a defined period, together with the method and assumptions behind it. That last clause is what separates a forecast from a guess. A number on its own is unfalsifiable and unimprovable. A number with a stated method can be checked, corrected, and made better next quarter.

Four terms get used interchangeably and mean different things:

| Term | Means |
| --- | --- |
| **Pipeline** | The total value of everything currently open. A capacity measure, not a prediction. |
| **Forecast** | What you expect to actually close in the period. |
| **Commit** | The portion of the forecast you are personally standing behind. |
| **Quota / target** | What you are *supposed* to close. Has no causal relationship to the first three. |

The last row matters more than it looks. The most common failure in sales forecasting is a rep or manager producing a forecast that happens to equal quota, quarter after quarter. That is not a forecast; it is a wish stated in the grammar of a forecast, and everyone downstream can tell.

**Why it matters that you get it right.** Your forecast is an input to decisions made by people who never meet your buyers. Hiring plans, inventory and capacity commitments, implementation staffing, cash planning, and in public companies the guidance given to investors all sit downstream of the aggregation of numbers like yours. A rep who forecasts $400,000 and delivers $250,000 has not merely missed; they have caused somebody to commit resources against revenue that did not exist. A rep who forecasts $250,000 and delivers $400,000 has caused a different problem — an implementation team with no capacity and a manager who now discounts everything that rep says.

The professional standard is not optimism and it is not conservatism. It is **calibration**: when you say 80%, it should happen about eight times out of ten.

This lesson takes you as far as producing and presenting the number. Diagnosing *why* the funnel behaves as it does — conversion analysis, velocity decomposition, the analytics discipline behind sales performance — is se305's subject, and it starts where this lesson stops.

## The inputs, and their quality

A forecast is arithmetic performed on four fields you have already met.

- **Amount** — expected value, in one consistent convention.
- **Close date** — expected close, which decides which period the deal lands in.
- **Stage** — how far the buyer has progressed.
- **Probability or forecast category** — the confidence attached, either derived from stage or set by judgment.

Everything in lesson 7 is a precondition for this lesson. A forecast built on deals with past close dates, inflated stages, and placeholder amounts is precise garbage. **Before forecasting, run the hygiene pass.** In practice, forecasting week should begin with the four saved views from the previous lesson, and no forecast should be produced from a pipeline that still fails them.

## Four methods

There are four ways to turn opportunity records into a number. Mature teams use several and reconcile them, because agreement between independent methods is evidence and disagreement is a question worth asking.

### 1. Stage-weighted

Multiply each open deal's amount by the probability attached to its stage and sum the result.

*Strengths:* mechanical, fast, unbiased by mood, and it uses every deal in the pipeline.

*Weaknesses:* it assumes the stage probabilities are true, which they usually are not, because they are frequently the defaults nobody calibrated. It also implicitly assumes every deal closes inside the period, which is false. And it gives you a number that no single deal can produce — the weighted value of a $120,000 deal at 80% is $96,000, but the actual outcome is $120,000 or nothing. Weighted forecasts are only meaningful across a portfolio of deals, and they are unstable for a rep carrying five.

### 2. Category or commit-based judgment

Sort deals into confidence buckets — commit, best case, pipeline, omitted — and roll up the buckets. The forecast is closed-won plus commit; the ceiling is closed-won plus commit plus best case.

*Strengths:* it uses what the rep knows that the record does not, and it produces a number a person can be held to.

*Weaknesses:* it is only as good as the honesty of the person categorizing, and it is vulnerable in both directions — happy ears in one rep, sandbagging in another.

### 3. Historical conversion rates

Instead of the platform's default probabilities, use *your* observed win rate by stage over the last several quarters. If deals in Proposal have historically closed 55% of the time, use 55% and not the 60% in the pipeline configuration.

*Strengths:* grounded in evidence about how your business actually behaves.

*Weaknesses:* it needs enough closed deals to be meaningful — a few dozen at minimum — and it assumes the recent past predicts the near future, which is wrong after a pricing change, a product launch, or a market shift.

### 4. Run-rate

Take recent performance and extend it: last four quarters' average, or this quarter's pace to date extrapolated to the full period.

*Strengths:* immune to pipeline data quality entirely, which makes it a genuinely independent check.

*Weaknesses:* blind to everything specific — a doubled team, a seasonal collapse, one enormous deal.

## The worked calculation

Here is one rep's open pipeline for a quarter, with $310,000 already closed-won and a quota of $800,000. Stage probabilities are the pipeline defaults from lesson 7.

| # | Account | Amount | Stage | Default prob. | Close date | Forecast category |
| --- | --- | ---: | --- | ---: | --- | --- |
| 1 | Calder Logistics | $120,000 | Negotiation | 80% | Sep 12 | Commit |
| 2 | Northwind Foods | $85,000 | Proposal | 60% | Sep 26 | Best Case |
| 3 | Arbor Health | $240,000 | Discovery | 25% | Sep 30 | Pipeline |
| 4 | Vale Manufacturing | $45,000 | Negotiation | 80% | Aug 15 | Commit |
| 5 | Pinnacle Freight | $60,000 | Solution Validation | 40% | Sep 20 | Best Case |
| 6 | Redwood Retail | $150,000 | Proposal | 60% | Sep 29 | Best Case |
| 7 | Harbor Insurance | $30,000 | Qualifying | 10% | Sep 28 | Pipeline |
| 8 | Stanton Logistics | $95,000 | Discovery | 25% | Sep 15 | Pipeline |
| 9 | Meridian Group | $200,000 | Solution Validation | 40% | Sep 30 | Pipeline |
| 10 | Cobalt Energy | $75,000 | Proposal | 60% | Aug 29 | Commit |
| 11 | Fairview Clinics | $40,000 | Negotiation | 80% | Sep 5 | Commit |
| 12 | Orchard Systems | $110,000 | Qualifying | 10% | Sep 30 | Pipeline |

**Total open pipeline: $1,250,000.**

### Step 1 — stage-weighted, using the default probabilities

| # | Amount × probability | Weighted |
| --- | --- | ---: |
| 1 | 120,000 × 0.80 | $96,000 |
| 2 | 85,000 × 0.60 | $51,000 |
| 3 | 240,000 × 0.25 | $60,000 |
| 4 | 45,000 × 0.80 | $36,000 |
| 5 | 60,000 × 0.40 | $24,000 |
| 6 | 150,000 × 0.60 | $90,000 |
| 7 | 30,000 × 0.10 | $3,000 |
| 8 | 95,000 × 0.25 | $23,750 |
| 9 | 200,000 × 0.40 | $80,000 |
| 10 | 75,000 × 0.60 | $45,000 |
| 11 | 40,000 × 0.80 | $32,000 |
| 12 | 110,000 × 0.10 | $11,000 |
| | **Weighted open pipeline** | **$551,750** |

Add the $310,000 already closed: **$861,750**.

### Step 2 — the category roll-up

| Category | Deals | Value |
| --- | --- | ---: |
| Closed Won | — | $310,000 |
| Commit | 1, 4, 10, 11 | $280,000 |
| Best Case | 2, 5, 6 | $295,000 |
| Pipeline | 3, 7, 8, 9, 12 | $675,000 |

- **Commit forecast** = 310,000 + 280,000 = **$590,000**
- **Best case ceiling** = 310,000 + 280,000 + 295,000 = **$885,000**

Note immediately that the weighted number ($861,750) is nearly the best-case ceiling and $270,000 above the commit. That gap is not an error — it is the signature of the weighted method, which credits every early-stage deal with a slice of value. A quarter of the $240,000 Discovery deal is $60,000 of forecast produced by a buyer who has not yet seen a proposal.

### Step 3 — recalculate with calibrated win rates

Suppose the last four quarters of closed deals give these actual win rates by the stage a deal had reached:

| Stage | Default | Observed |
| --- | ---: | ---: |
| Qualifying | 10% | 8% |
| Discovery | 25% | 18% |
| Solution Validation | 40% | 35% |
| Proposal | 60% | 55% |
| Negotiation | 80% | 72% |

Rerunning the same twelve deals against the observed rates:

| # | Calculation | Weighted |
| --- | --- | ---: |
| 1 | 120,000 × 0.72 | $86,400 |
| 2 | 85,000 × 0.55 | $46,750 |
| 3 | 240,000 × 0.18 | $43,200 |
| 4 | 45,000 × 0.72 | $32,400 |
| 5 | 60,000 × 0.35 | $21,000 |
| 6 | 150,000 × 0.55 | $82,500 |
| 7 | 30,000 × 0.08 | $2,400 |
| 8 | 95,000 × 0.18 | $17,100 |
| 9 | 200,000 × 0.35 | $70,000 |
| 10 | 75,000 × 0.55 | $41,250 |
| 11 | 40,000 × 0.72 | $28,800 |
| 12 | 110,000 × 0.08 | $8,800 |
| | **Calibrated weighted open** | **$480,600** |

Plus closed: **$790,600**. Calibration alone removed $71,150 of optimism that was sitting in the pipeline configuration.

### Step 4 — adjust for slippage

Weighting answers *will this deal be won?* It does not answer *will it be won in this period?* Look at the close dates: deals 2, 3, 6, 7, 9 and 12 all land in the final ten days of the quarter, and deals 3, 9 and 12 alone — $550,000, or 44% of the open pipeline — are dated the last day.

Suppose your history says deals dated in the last ten days of a period actually close inside that period about 60% of the time. Their calibrated weighted contribution is 46,750 + 43,200 + 82,500 + 2,400 + 70,000 + 8,800 = **$253,650**. Applying the 60% in-period rate:

253,650 × 0.60 = $152,190, a reduction of **$101,460**.

Slippage-adjusted weighted open pipeline: 480,600 − 101,460 = **$379,140**. Plus closed: **$689,140**.

### Step 5 — reconcile

| Method | Number |
| --- | ---: |
| Closed won to date | $310,000 |
| Commit (judgment) | $590,000 |
| Weighted, default probabilities | $861,750 |
| Weighted, calibrated win rates | $790,600 |
| Weighted, calibrated plus slippage | $689,140 |
| Best case ceiling | $885,000 |
| Quota | $800,000 |

The honest reading: **commit $590,000, forecast approximately $690,000, upside to $885,000, against a quota of $800,000.** That is a projected miss of roughly $110,000 unless something in the Best Case column converts, and saying so in week three of the quarter is worth vastly more to your company than saying "we're on track" and saying something different in week twelve.

### Step 6 — the coverage check

Coverage compares open pipeline to the gap you still have to close.

Remaining gap = 800,000 − 310,000 = **$490,000**.
Coverage = 1,250,000 ÷ 490,000 = **2.6×**.

If your business historically needs about 3× coverage to hit a number, 2.6× is thin: you would need roughly $1,470,000 of open pipeline, about **$220,000 more**, and it needs to be created early enough in the period to close inside it. Coverage is the one forecast measure that points at an action you can take today, which is why it belongs on the same page as the forecast.

### Step 7 — the risks the arithmetic does not show

Three things in this pipeline should be stated out loud alongside the number.

**Concentration.** The largest deal is 19% of open pipeline; the four commit deals are the whole of the open commit, and one of them ($120,000, Calder) is 43% of that $280,000 — about 20% of the $590,000 commit forecast including closed business. If Calder slips, the commit misses regardless of anything else.

**Date clustering.** 44% of open pipeline is dated the last day of the quarter. Close dates that all land on a period boundary are usually not forecasts at all — they are placeholders — and they are the single most common reason a quarter that looked fine in week ten misses in week thirteen.

**Stage-to-date mismatch.** Deal 3 is $240,000, in Discovery, dated 30 September. A deal that has not yet reached solution validation almost certainly cannot complete evaluation, proposal, negotiation and signature in the remaining weeks. Either the date is wrong or the stage is. Find out which, because it is worth $43,200 of weighted forecast today and nothing at all if the date is fiction.

## Calibration: making the weights yours

Default stage probabilities are somebody else's guess about somebody else's business. Replacing them with your own numbers is straightforward and pays for itself immediately.

Take every opportunity closed in the last four to six quarters — you need enough volume to be meaningful, on the order of dozens rather than a handful. For each, record the furthest stage it reached and whether it was won. Then, for each stage, compute won ÷ (won + lost) among the deals that reached it. That ratio is your real probability at that stage.

Two refinements worth making once you have the basics:

**Segment where the segments genuinely differ.** New business and renewals have very different curves; so do enterprise and SMB, and inbound and outbound. Do not segment so finely that each bucket has six deals in it.

**Measure duration too.** For each stage, record the median days deals spend there. That gives you the slippage adjustment used above, and it lets you sanity-check any deal whose close date is closer than the remaining stages' median durations allow.

Recalibrate quarterly, and always after a pricing change, a product launch, a segment shift, or a change in how stages are defined. The last one is easy to forget: rewriting your exit criteria invalidates the win rates measured against the old ones.

## The human failure modes

The arithmetic is the easy part.

**Happy ears.** A good call becomes a raised probability. The defense is exit criteria: a deal moves because a criterion was met, not because the conversation went well.

**Sandbagging.** Deliberately forecasting low so that beating it looks impressive. It is as damaging as over-forecasting and harder to detect, because nobody complains about good news. It shows up in the accuracy record as consistent one-directional bias.

**Anchoring to quota.** Building the forecast from the target backwards. Watch for it in yourself: if you find you have adjusted a probability *after* seeing the total, you are doing this.

**Sunk cost.** The deal you have worked for nine months keeps its slot in the forecast because of the effort invested. The effort is spent either way; only the buyer's current state is evidence.

**The heroic close date.** Moving a date into the period because it is needed there. Every rep does it once. The record of pushes in lesson 7 is what makes it visible.

**Silence.** Not raising a slip until the last week. A miss reported in week four is a problem the company can respond to; the same miss reported in week thirteen is a crisis with somebody's credibility attached.

## The forecast artifact

Do not submit a number. Submit a short document — half a page is plenty — containing:

1. **The number**, with the period it covers and the convention it uses.
2. **The method**, named, with the probabilities or categories applied.
3. **Closed to date**, and the gap remaining.
4. **The named deals in commit**, each with amount, close date, and the one thing that has to happen.
5. **Upside**, named, with what would have to change for each deal to convert.
6. **Risks**, explicitly: concentration, clustering, deals whose stage and date disagree.
7. **Coverage**, and how much additional pipeline the period needs.
8. **What changed since last week**, and why.

Then **snapshot it**. Save the forecast — a saved report, an export, a dated file — so that at period end you can compare what you said to what happened. Systems that offer forecast submission do this for you; where yours does not, an exported CSV in a dated folder is entirely sufficient.

Two habits complete the practice. **Report the change, not just the level:** "$690,000, down $40,000 since last week because Meridian's decision moved to next quarter" is a far more useful sentence than "$690,000." And **state your confidence in the number itself** — a forecast in week two of a quarter with 2.6× coverage deserves a wider range than the same number in week eleven with the commit deals in legal review.

## Measuring your own accuracy

Keep a record, quarter by quarter: forecast, actual, and the difference as a percentage of actual. Two things to look for.

**Bias** is the average signed error. If you are consistently 15% over, that is a correctable habit, and the correction is mechanical.

**Variance** is how much your error moves around. High variance with no bias means your process is noisy rather than optimistic — usually a data-quality or stage-definition problem rather than a judgment problem.

A rep who can show four quarters of forecasts within a tight band is trusted in a way that no amount of confidence in a meeting produces. That trust is the actual deliverable of this lesson. The number is just how you demonstrate it.

## Practice

Use the dataset in this lesson for parts 1 and 2 so your arithmetic can be checked, then move to your own pipeline.

**1. Reproduce and extend the calculation.** Build the twelve-deal table in a spreadsheet and reproduce every number in steps 1 to 6. Then add a thirteenth deal — Ridgeway Transit, $180,000, Proposal, closing 22 September, Best Case — and recompute: total pipeline, default-weighted, calibrated-weighted, slippage-adjusted, the category roll-up, and the coverage ratio. State in one sentence how the forecast call changes.

**2. Stress the assumptions.** Recompute the calibrated, slippage-adjusted forecast under three scenarios: (a) Calder Logistics slips to next quarter; (b) the observed Negotiation win rate is 60% rather than 72%; (c) every close date in the last ten days of the quarter is moved to the following period. Present the three results in one table and identify which single assumption the forecast is most sensitive to.

**3. Calibrate from real history.** From any CRM you have access to, or from a dataset your instructor provides, pull closed opportunities from the last several periods with their furthest stage and outcome. Compute the observed win rate and median duration per stage. Compare them to the probabilities configured in the pipeline and write one paragraph on where the configuration is misleading and by how much.

**4. Forecast your own pipeline, three ways.** Run the hygiene pass from lesson 7 first and note what you fixed. Then produce the number by category judgment, by calibrated weighting, and by run-rate. Put the three side by side, explain the largest divergence, and state which you would submit and why.

**5. Write the artifact.** Produce the half-page forecast document using all eight elements above, for a real or realistic pipeline. It must name the commit deals individually with the one thing each needs, state the coverage gap in dollars, and identify at least two risks that the arithmetic alone does not show.

**6. Start the accuracy record.** Snapshot the forecast from part 5 with today's date. Create the tracking table — period, forecast, actual, error, signed error — and enter this period's forecast row. If you have access to past periods, backfill them and compute your bias.

## Check your understanding

1. A rep's forecast equals quota for four quarters running. What is the likely problem? *(Answer: anchoring to quota — the forecast is built backwards from the target.)*
2. Why can the default-weighted number sit far above the commit? *(Answer: weighting credits every early-stage deal with a slice of value, even buyers who have not yet seen a proposal, and assumes every deal closes inside the period.)*
3. Remaining gap $300,000; open pipeline $750,000; your business needs 3× coverage. How much more pipeline do you need? *(Answer: 3 × $300,000 = $900,000 needed, so $150,000 more — and it must be created early enough to close inside the period.)*
