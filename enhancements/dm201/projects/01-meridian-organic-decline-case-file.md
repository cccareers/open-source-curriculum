---
course_id: dm201
project_id: dm201-x01
title: "Meridian Payroll: Organic Decline Case File"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - dm201-02
  - dm201-08
  - dm201-11
objectives:
  - Measure organic performance in Search Console and analytics and act on what it shows
  - Turn an organic traffic finding into a prioritized action
  - Diagnose crawlability, speed, and mobile issues that suppress rankings
competency_ids:
  - D6-S1-C01
  - D6-S1-C03
  - D1-S1-C03
---

## Scenario

It is the Monday after month-end at Meridian Payroll. The marketing director forwards you one line from the exec dashboard: "Organic clicks down 11% month over month. What happened and what are we doing about it?" She needs a memo by Wednesday. Your job is to work the lesson 11 decision tree on the data below, separate the real problems from noise, and put a ranked action list in front of her with the arithmetic shown.

Two things are going on at once in this data, and they need different owners. Finding both, and not inventing a third, is the exercise.

## What you will build / produce

1. A working sheet joining the five files below, with a `page_group` column and computed CTR and deltas.
2. A noise-floor calculation from the weekly series.
3. A decision-tree trace for each page group that moved more than the noise floor, naming the branch you stopped at and the evidence.
4. Two to four findings written in the lesson 11 structure (data table, diagnosis, alternatives ruled out, one action, expected impact with a sensitivity range).
5. A ranked action table scored with `(Impact x Confidence) / Effort`.
6. A four-part memo (what changed, why, what we did, what we will do next) under 400 words.

## Before you start (prerequisites, starter files or data)

All data is from the Meridian Payroll domain property, comparing two 28-day windows in 2026 (previous = P, August 4–31; current = C, September 1–28). Template landing pages have recovered from the April–July incident. The September theme release reintroduces the comparison canonical defect; this is a new regression, not the July audit snapshot. Paste each block into a spreadsheet.

**File 1 — `page_groups_28d.csv`** (Search Console, Pages tab grouped by directory)

```text
page_group,clicks_P,impr_P,pos_P,clicks_C,impr_C,pos_C
/blog/,5200,270000,21.0,3950,268000,21.3
/help/,1900,52000,14.8,1880,51500,14.9
/templates/,4900,63000,11.0,4850,62400,11.1
/compare/,600,11000,12.5,380,7200,15.9
/product/ + /pricing + /,1000,18000,10.2,990,17800,10.3
```

**File 2 — `blog_top_queries_28d.csv`** (Search Console, Queries tab filtered to Page contains `/blog/`)

```text
query,clicks_P,impr_P,pos_P,clicks_C,impr_C,pos_C
what is a payroll register,610,22000,4.1,240,21800,4.2
how to calculate payroll taxes,480,19500,6.3,300,19900,6.2
semi monthly vs biweekly payroll,1410,13300,4.8,1380,13100,4.7
difference between w2 and 1099,390,16200,7.9,170,16000,8.0
what is futa tax,350,12400,5.5,140,12600,5.4
```

**File 3 — `pages_report_compare.txt`** (Indexing > Pages, filtered to the `/compare/` sitemap)

```text
Reason                                              P     C
Indexed                                             6     0
Duplicate, Google chose different canonical than    0     6
  user
```

Deploy log excerpt: `Day 9 of window C — theme updated to v4.2 (marketing site)`.

**File 4 — `ga4_organic_sessions_28d.csv`** (GA4, Organic Search channel, by landing page group)

```text
page_group,sessions_P,sessions_C,trial_starts_P,trial_starts_C
/blog/,4720,3610,9,7
/help/,1730,1700,3,3
/templates/,4460,4400,10,10
/compare/,550,345,19,12
/product/ + /pricing + /,920,905,31,30
```

**File 5 — `weekly_clicks.csv`** (all organic clicks, last eight weeks; window C is weeks 5 to 8)

```text
week,clicks
1,3400
2,3460
3,3360
4,3380
5,3220
6,3050
7,2900
8,2880
```

Manual SERP note, recorded on day 20 of window C in a private window: an AI overview now appears above the organic results for `what is a payroll register`, `difference between w2 and 1099`, and `what is futa tax`. It did not appear when the same queries were checked in window P.

## Milestones

1. **Totals and noise floor.** Confirm total clicks P = 13,600 and C = 12,050 (−11.4%). From weeks 1 to 4, estimate normal week-to-week variation and state the smallest change you will treat as real.
2. **Segment.** Compute clicks change and CTR for each page group. Name which groups moved beyond noise.
3. **Trace each moving group through the decision tree.** For each, record Q1 (did impressions fall?), Q2 (confined to one group?), Q3 (does GA4 agree?), and the branch you stopped at.
4. **Write the findings.** One per real problem. For each, rule out at least two alternatives explicitly.
5. **Estimate impact with ranges,** using File 4 trial-start rates where a commercial outcome is involved.
6. **Score, rank, and write the memo.**

## Acceptance criteria

- [ ] The sheet shows `/blog/` clicks down about 24% with impressions and average position essentially flat, and `/compare/` clicks down about 37% with impressions down about 35% and position worse.
- [ ] `/help/`, `/templates/`, and the product group are explicitly classified as within noise.
- [ ] The `/blog/` finding is diagnosed as a CTR problem from a SERP-feature change (decision tree Q1 = no, position flat), with File 2 showing the drop concentrated in three simple-answer queries while `semi monthly vs biweekly payroll` held.
- [ ] The `/compare/` finding is diagnosed as a technical regression confined to one directory (Q1 = yes, Q2 = yes), linked to the theme update and the duplicate-canonical defect from lesson 08, and assigned to engineering with a verification step in URL Inspection.
- [ ] GA4 is used to confirm both are real traffic changes, not a tracking break (GA4 moved in the same direction as Search Console).
- [ ] The memo does not blame a Google update, and says why not.
- [ ] The `/compare/` fix ranks first despite losing fewer clicks, with the trial arithmetic shown (19 to 12 trials, about 7 per 28-day window).
- [ ] The `/blog/` action is honest about the ceiling: you cannot remove an AI overview; the realistic responses are to accept the loss on simple-answer queries, re-point effort to queries that need a tool or file, or give the page a reason to click that the overview cannot satisfy.

## Evidence checklist

- Working spreadsheet with all five source tables and computed columns.
- Decision-tree trace for each moving page group (a short table is fine).
- Findings write-ups with data tables and arithmetic.
- Ranked action table.
- Memo (under 400 words).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Segmentation | Reports only the −11% total | Isolates `/blog/` and `/compare/`, classifies others as noise | States the noise floor numerically and applies it consistently |
| Diagnosis | Names a cause without evidence | Correct branch for both findings with evidence | Rules out two alternatives per finding, including tracking and seasonality |
| Impact arithmetic | Single numbers | Ranges with assumptions | Names the weakest assumption and how to test it |
| Prioritization | Ranks by click volume | Uses the scoring model and puts the regression first | Splits or stages an action and re-scores it |
| Communication | Data dump | Four-part memo under 400 words | Includes a process change that would catch the regression in days |

## Stretch goals

- Pull a 16-month view of the three affected informational queries (assume you have it) and explain what you would need to see to rule out seasonality more firmly.
- Draft the release-checklist line that would have caught the canonical regression, and where in the deploy process it runs.

## Reflection prompts

- Which of the two findings would you have spotted from the dashboard total alone? Why does segmentation matter more than the headline?
- Which number in your memo are you least confident in, and what would change your mind?

## Instructor notes (common pitfalls, how to adapt for time)

- Reference values: `/blog/` CTR 1.93% to 1.47%; `/compare/` CTR 5.45% to 5.28% (CTR roughly held there — the loss is impressions and position, a different branch from `/blog/`). Weeks 1 to 4 vary by about ±2% around 3,400; weeks 6 to 8 are 10 to 16% below that average and clearly real.
- The three AI-overview queries lost 370 + 220 + 210 = 800 clicks; `how to calculate payroll taxes` lost 180 with no feature noted, so learners should flag it as unexplained rather than force it into the same story.
- Common error: treating the `/compare/` drop as a CTR problem because CTR is the first column people look at. Impressions fell, so Q1 is "yes."
- Common error: recommending a title rewrite for the AI-overview pages and promising recovery. Credit answers that are honest about the ceiling.
- For a three-hour version, provide Files 1 and 3 only and skip the weekly noise floor.
