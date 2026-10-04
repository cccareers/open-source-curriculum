---
course_id: dm101
project_id: dm101-x01
title: "Tutoring Company Measurement Case File"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - dm101-02
  - dm101-07
objectives:
  - Select the right KPIs for a campaign goal and read a basic performance report
  - Trace a conversion back through the channels that contributed to it
competency_ids:
  - D6-S1-C02
---

## Scenario

You have just joined the tutoring company from the measurement lesson as a marketing coordinator. Last month's report (205 trials against a target of 150) went well, and the owner now wants a second month read before she approves next quarter's budget. This time the paid social manager is arguing that his channel was "robbed" by last-click reporting, and the paid search manager is arguing that her channel should get the whole budget. The owner wants one page that tells her who is right, what she can and cannot conclude, and what to do next.

Business facts, unchanged from the lesson: a trial converts to a paying student 30% of the time, and a paying student is worth $840 in gross margin. The CPA ceiling for a trial is still $70.

## What you will build / produce

1. A KPI sheet: the primary KPI, its target, three diagnostics, and one vanity metric you refuse to judge the month by.
2. A one-page stakeholder report in the five-part structure from lesson 07 (goal and target, result, why, recommendation, what you cannot tell yet).
3. An attribution worksheet crediting the converted journeys in the path export below under last click, first click, linear, and position-based (40/40/20) models.
4. A test proposal: one holdout or comparison test that would settle the paid social argument, with its duration and the decision rule written in advance.

## Before you start (prerequisites, starter files or data)

Copy each block below into a spreadsheet (they are comma-separated; paste, then use "split text to columns").

**File 1 — `channel_month2.csv`** (channel totals, last-click attribution)

```text
channel,spend,sessions,trial_page_views,trials
paid_search,5400,4300,1290,121
paid_social,4200,10400,1150,31
email,0,2600,780,66
organic_search,0,3100,620,22
direct_unassigned,0,1900,410,19
```

**File 2 — `device_split_month2.csv`** (all channels combined)

```text
device,sessions,trial_page_views,trials
desktop,7600,1820,161
mobile,14700,2430,98
```

**File 3 — `paths_sample.csv`** (eight converted journeys exported from the analytics tool; each row is one person, touches in order)

```text
person,touch_1,touch_2,touch_3,touch_4
P01,paid_social,organic_search,email,paid_search_brand
P02,paid_search_generic,,,
P03,paid_social,email,,
P04,organic_search,email,paid_search_brand,
P05,paid_social,paid_search_brand,,
P06,email,,,
P07,paid_social,organic_search,paid_search_brand,
P08,direct_unassigned,,,
```

**File 4 — `brand_search_weekly.csv`** (branded search impressions, before and during a two-week paid social pause in the same region last year)

```text
week,paid_social_status,brand_search_impressions
W1,on,3820
W2,on,3910
W3,paused,3150
W4,paused,3040
W5,on,3760
W6,on,3880
```

## Milestones

1. **Compute before you interpret.** Add CPA and conversion-rate-per-session columns to File 1 and a total row. State the denominator in every column header.
2. **Primary KPI against target.** One sentence: met or missed, by how much, at what blended CPA.
3. **Find the worst step.** Use the trial-page-view column to locate where each channel's traffic drops out. Then use File 2 to check whether the problem is a channel problem or a device problem.
4. **Attribute.** For the eight journeys in File 3, give each converting person one unit of credit and split it under each of the four models. Produce a table of channel totals per model.
5. **Read the side evidence.** Use File 4 to estimate what paid social contributes to branded search. Say clearly what this does and does not prove.
6. **Write the report and the test proposal.**

## Acceptance criteria

- [ ] CPA and conversion-rate columns are correct, and every rate names its denominator.
- [ ] The report states the primary KPI result against the 150-trial target and the $70 ceiling in its first two lines.
- [ ] The mobile versus desktop gap (desktop about 2.1% trials per session, mobile about 0.7%) is identified and discussed as a possible cause that cuts across channels.
- [ ] The attribution table shows that paid social receives zero last-click credit in the sample but the largest first-click credit.
- [ ] The report does not declare paid social a success or a failure on the basis of attribution models alone; it names the test that would decide.
- [ ] The LTV arithmetic (30% x $840 = $252 per trial) is shown and used to comment on the $70 ceiling.
- [ ] "What I cannot tell you yet" names at least two real limits (sample size of the path export, unassigned traffic, seasonality).

## Evidence checklist

- Spreadsheet with the four source tables and your calculated columns.
- Attribution worksheet (one table, four models).
- One-page report (PDF or document).
- Test proposal (half a page) with a decision rule written before any results.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| KPI selection | Several KPIs, none primary | One primary KPI with target, diagnostics separated | Also names and justifies a refused vanity metric |
| Report reading | Describes numbers | Finds the worst step with numbers | Separates channel effects from the device effect |
| Attribution | One model only | Four models, correct arithmetic | Explains which manager each model flatters and why |
| Honesty about limits | No limits stated | Two limits stated | Limits tied to the specific test that would resolve them |
| Recommendation | Opinion | One action with cost | Action plus decision rule and a date to revisit |

## Stretch goals

- Rebuild the channel table with branded and non-branded paid search separated (assume 45 of the 121 paid search trials came from brand terms) and rewrite the recommendation.
- Draft the UTM naming convention the team should adopt so that next month's `direct_unassigned` row shrinks.

## Reflection prompts

- Which number in this case would you have quoted first before taking this course, and why would it have misled the owner?
- What would have to be true for the paid social manager to be right?

## Instructor notes (common pitfalls, how to adapt for time)

- Reference figures: blended CPA = $9,600 / 259 trials, about $37.07; paid social CPA = $4,200 / 31, about $135.48; paid search CPA = $5,400 / 121, about $44.63.
- Path-sample last-click credit: paid_search_brand 4, paid_search_generic 1, email 2 (P03, P06), direct 1, paid_social 0. First click: paid_social 4, organic_search 1, email 1, paid_search_generic 1, direct 1.
- File 4 shows roughly a 20% drop in branded search impressions during the pause. Learners should say this is suggestive of an awareness effect, not proof of incremental trials, because it is last year's data, one region, and an impressions metric rather than a conversion.
- The most common error is averaging the two channel CPAs instead of dividing total spend by total trials.
- For a two-hour version, drop milestones 5 and 6 and supply the attribution table half-completed.
