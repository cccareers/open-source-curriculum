---
course_id: dm270
project_id: dm270-x01
title: "Harvest Lane Q2 Content Performance Case File"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - dm270-07
  - dm270-02
objectives:
  - Measure content performance and decide what to publish next
  - Choose content KPIs that reflect the goal of the piece
competency_ids:
  - D6-S1-C02
  - D6-S1-C03
---

## Scenario

It is 1 July. The Q1 report in lesson 07 made three decisions: retire "Garden Design Ideas", add a next step to the soil calculator (target 68 signups in 90 days), and give "Why Seedlings Get Leggy" a full distribution window (target about 93 signups). The four tomato posts were merged in March. Marcus Bell has seen that total sessions fell and wants to know whether content "stopped working".

You have the Q2 (April to June) export. Your job is to judge the Q1 decisions honestly, separate seasonality from decay, catch a data defect before it misleads anyone, and write the one-page Q2 report with the next quarter's decisions.

## What you will produce

1. A performance table with every derived column (engagement rate, signup rate, value, value per hour, change vs prior 90 days).
2. A **scorecard of the three Q1 decisions**: predicted, actual, verdict.
3. A **verdict per row** from the lesson 07 six-verdict table.
4. A **refresh ranking** by recoverable value for the guides that declined.
5. The **one-page Q2 content report** in the lesson 07 format, including "What we are not doing" and "Caveats".

## Before you start

Value per signup: **$108** (lesson 07). Production hours are the original build hours, used for value per hour.

**File 1 — `harvestlane_q2_content.csv`** (landing-page sessions from analytics; signups = seed-subscription signups attributed to the landing page)

```csv
url,type,pillar,sessions,engaged_sessions,signups,last_updated,production_hours,sessions_prior_90d
/guides/raised-bed-depth,guide,Getting it built right,7900,4820,61,2026-01-06,11,10650
/tools/soil-calculator,tool,Getting the soil right,6400,5080,118,2026-01-13,16,6300
/guides/zone-5-8-planting-calendar,guide,What to plant,3100,1810,96,2026-01-20,6,5340
/guides/where-to-put-a-raised-bed,guide,Getting it built right,2050,1210,13,2026-01-27,9,2180
/guides/start-indoors-february-zone-6,guide,What to plant,900,560,21,2026-02-10,7,3760
/guides/why-seedlings-get-leggy,guide,When it goes wrong,5200,3830,88,2026-03-03,12,1940
/guides/tomatoes-in-a-raised-bed,guide,What to plant,4400,2900,71,2026-03-17,8,0
/guides/frost-dates,guide,When it goes wrong,3300,1950,40,2026-03-24,5,4100
/blog/meet-elena,post,none,140,61,0,2025-11-04,3,210
/blog/spring-sale-recap,post,none,95,30,1,2026-04-02,2,0
```

**File 2 — `harvestlane_q2_notes.txt`**

```txt
Site-wide organic sessions, Q2 2025 vs Q1 2025 (last year):   -31%
Site-wide organic sessions, Q2 2026 vs Q1 2026 (this year):   -29%
Pinterest pin set for the depth guide re-shared 14 Apr. The pins were
  published WITHOUT utm parameters. Direct-traffic sessions landing on
  /guides/raised-bed-depth: Q1 410, Q2 1,020.
Zone planting calendar: Q2 2025 sessions 4,950 (same page, before the
  January 2026 update). Peak monthly sessions ever: 2,600 (Feb 2026).
  Current monthly run rate: about 1,030.
The tomatoes guide replaced four posts merged on 17 Mar; the four old
  URLs redirect to it.
```

## Milestones

1. **Reconcile.** Totals: 33,485 sessions; 22,251 engaged; 509 signups; 79 production hours. Fix any row that does not reconcile in your sheet before going further.
2. **Derive the columns** and show the arithmetic for at least three rows.
3. **Seasonality check.** For each row with a prior-90-day figure, compare its change to the site-wide seasonal change before calling anything decay.
4. **Find the defect.** Use File 2 to explain what the untagged pins did to the depth guide's channel numbers and what you would fix.
5. **Score the Q1 decisions** against their stated targets.
6. **Assign verdicts, rank refreshes, write the report.**

## Acceptance criteria

- [ ] Every rate shows its numerator and denominator.
- [ ] Each Q1 decision is scored as predicted vs actual with a one-line verdict (worked / partly / did not).
- [ ] "Start Indoors in February" is not called decay; the reason is stated.
- [ ] The two `none`-pillar posts are handled with the small-numbers rule (no rate conclusions on 140 or 95 sessions).
- [ ] At least one row is given "Leave alone" with a defence.
- [ ] The refresh ranking uses the lesson 07 recoverable-value formula with arithmetic shown.
- [ ] The tagging defect is named in the report's Caveats with the fix.
- [ ] The report fits on one page and leads with decisions.

## Evidence checklist

- Spreadsheet with formulas.
- Q1 decision scorecard.
- Verdict table.
- Refresh ranking.
- One-page Q2 report.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| KPI fit | Judges every page on signups alone | Uses the job of the piece (e.g. calculator judged on next-step signups) | Names a page whose KPI should change and why |
| Seasonality and decay | Treats every decline as decay | Compares against the -29% site-wide seasonal change | Uses the year-ago figure for the planting calendar |
| Data hygiene | Misses the untagged pins | Explains the direct-traffic rise and proposes tagging | Estimates the effect on reported channel mix and flags it in caveats |
| Decision quality | Verdicts without numbers | Every verdict cites a rate or volume | Expected effects given as ranges with a re-measure date |
| Report | Leads with a chart or totals | Lesson 07 format, one page | Includes a trade-off the team is accepting on purpose |

## Stretch goals

- Propose the Q3 editorial calendar change that follows from your verdicts (which slot moves to which pillar).
- Write the two-sentence message to Marcus explaining why total sessions fell while signups held.

## Reflection prompts

- Which Q1 decision would you have scored differently if you had looked only at sessions?
- What would you need to know to be sure the calculator's improvement came from the new next step?

## Instructor notes

Key figures: library engagement 22,251 / 33,485 = 66.5%; signup rate 509 / 33,485 = 1.52%; value 509 x $108 = $54,972; value per hour $54,972 / 79 = $696. Q1 decision scorecard: calculator signups 41 → 118 against a target of 68 (worked; signup rate 0.67% → 1.84%); leggy seedlings 31 → 88 against about 93 (largely worked; sessions 1,940 → 5,200); retirement of Garden Design Ideas: row gone, total traffic down as predicted. Seasonality: depth guide -25.8% (10,650 → 7,900) is inside the -29% seasonal change, so not decay; and some of its organic sessions are really untagged Pinterest traffic sitting in Direct (410 → 1,020). Start Indoors in February -76% is a February topic in April-June: seasonal by definition, "Leave alone" until January. Planting calendar 5,340 → 3,100 (-42%) is worse than seasonal, and its year-ago Q2 was 4,950; recoverable value = (2,600 - 1,030) x 0.0310 x $108 = about $5,256 per month, making it the top refresh. The none-pillar posts: 1 signup on 95 sessions is not a 1.05% rate worth discussing.

Pitfalls: computing signup rate on engaged sessions; reading the tomatoes guide's missing prior figure as zero growth; recommending more Pinterest without fixing the tags. To fit 3 hours, drop the refresh ranking.
