---
course_id: dm201
project_id: dm201-x02
title: "Meridian Payroll: Keyword Map for the Time-Tracking and Multi-State Launch"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - dm201-03
  - dm201-04
  - dm201-05
objectives:
  - Build a prioritized keyword map from research data
  - Evaluate keywords on volume, difficulty, and business value
  - Classify the search intent behind a query and match it to an appropriate page type
competency_ids:
  - D1-S1-C01
  - D1-S1-C03
---

## Scenario

Meridian Payroll is launching two features next quarter: built-in time tracking and multi-state payroll. Product marketing has sent you eight queries "we definitely need to rank for" and wants one page per query. You suspect several of them belong on the same page, at least one belongs to the IRS or a state labor department, and at least one is worth more than the rest put together. Turn the list into a defensible slice of the lesson 04 keyword map before anyone commissions eight pages.

## What you will build / produce

1. A clustering worksheet applying the 4-of-10 SERP overlap rule, with a written verdict on every borderline pair.
2. An intent and page-type call for each cluster, citing the SERP page-type counts.
3. Scored map rows using the lesson 04 bands and formula `Priority = 3B + 2I + 2D + 2P + V`, in the lesson 04 CSV column spec.
4. A half-page reply to product marketing: which pages to build, in what order, which query you will not target, and why one page per query is the wrong plan.

## Before you start (prerequisites, starter files or data)

**File 1 — `candidates.csv`** (vendor volume and difficulty are vendor estimates; position is Meridian's 3-month Search Console average, blank if Meridian has no impressions)

```text
id,query,volume,kd,meridian_position,meridian_ranking_url
A,payroll software with time tracking,1600,44,,
B,time clock app with payroll,880,38,,
C,employee time tracking for small business,2900,52,34.0,/blog/time-tracking-tips
D,how to track employee hours,4400,21,22.5,/blog/tracking-hours
E,free timesheet template,9900,26,,
F,multi state payroll,1900,41,,
G,payroll for remote employees in different states,590,29,,
H,overtime rules by state,3600,33,,
```

**File 2 — `serp_page_types.csv`** (top-10 organic results, counted by page type; sampled the same day, private window, US desktop)

```text
id,vendor_product,roundup,guide,template_download,forum,government_or_legal,video,app_store
A,7,2,0,0,1,0,0,0
B,6,3,0,0,0,0,0,1
C,4,5,0,0,1,0,0,0
D,0,0,8,1,0,0,1,0
E,0,0,1,9,0,0,0,0
F,4,0,5,0,0,1,0,0
G,3,0,6,0,0,1,0,0
H,0,0,3,0,0,6,0,1
```

**File 3 — `serp_overlap.csv`** (count of identical URLs shared in the two top-10 lists; URL level, not domain level)

```text
pair,shared_urls
A-B,6
A-C,3
B-C,2
C-D,2
D-E,1
F-G,4
G-H,1
F-H,0
```

**Business value definitions** (from lesson 04): 5 buying decision for core segment; 4 vendor comparison or migration intent; 3 solution-aware, core segment, no vendor named; 2 problem-aware, adjacent to a paid feature; 1 problem-aware, general audience, weak tie; 0 wrong audience or no path to revenue.

## Milestones

1. **Cluster.** Apply the overlap rule to every pair in File 3. For the 2 to 3 shared-URL pairs, use File 2 page types to decide.
2. **Classify intent and page type** for each resulting cluster, citing counts ("7/10 vendor product pages").
3. **Score.** Assign V, D, I, B, P from the bands with one line of reasoning per score. Use peak volume if you judge any query seasonal and say so.
4. **Write the map rows** with `cluster_id`, `target_url` (prefix `(new)` for unbuilt pages), and `status`.
5. **Write the reply** to product marketing.

## Acceptance criteria

- [ ] A and B are one cluster (6 shared URLs) on one new product page; F and G are one cluster (4 shared) on one new page.
- [ ] A–C (3 shared) is resolved by page type, not by gut: C's SERP is majority roundups, A's is majority vendor pages, so they are separate jobs.
- [ ] D is mapped to the existing `/blog/tracking-hours` as `live-needs-work`, not to a new page.
- [ ] E is recognised as a template page, and the reply notes it feeds the time-tracking feature without being a buying query.
- [ ] H is a reasoned no-go or backlog: government and legal reference pages hold 6 of 10 results (intent score low), and Meridian would carry a maintenance obligation across 50 states.
- [ ] Every score is traceable to a published band, and vendor numbers are labelled as estimates.
- [ ] The reply proposes fewer than eight pages and explains the cannibalization risk of one page per query.

## Evidence checklist

- Clustering worksheet with overlap verdicts.
- Scored table (V, D, I, B, P, priority) with one line of reasoning per cell.
- Map rows in the lesson 04 CSV format.
- Reply to product marketing (half a page).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Clustering | One page per query, or clusters by topic feel | Applies the overlap rule; borderline pairs resolved with page types | Notes what re-sampling would change and when to re-check |
| Intent and page type | Inferred from wording | Cited from SERP counts | Flags where wording and SERP disagree |
| Scoring | Raw numbers, invented weights | Bands and formula applied correctly | Sensitivity: shows which single score change would reorder the top two |
| Business judgment | Volume wins | Business value drives the order | Explains why the highest-volume query is not first |
| Communication | Lists scores | Clear build order with a no-go | Anticipates product marketing's objection and answers it |

## Stretch goals

- Re-score cluster C as a roundup page Meridian could credibly publish (an honest "best time tracking for small business" list including competitors). Does it move bands?
- Draft the secondary-keyword coverage checklist for the A/B page from People Also Ask (assume you collected five questions; write plausible ones and mark them as needing verification).

## Reflection prompts

- Which query did your instinct rank first before you scored it, and where did the rubric disagree?
- What would make you reverse the H verdict?

## Instructor notes (common pitfalls, how to adapt for time)

- Indicative scores (learners may defend different bands with reasons): A/B cluster V3 D3 I5 B4 P0 = 31; C V3 D2 I3 B3 P3 = 28; D V4 D4 I5 B2 P3 = 34; E V4 D4 I5 B2 P0 = 28; F/G V3 D3 I4 B4 P0 = 29 (matches lesson 04); H V4 D3 I1 B1 P0 = 15.
- Expect learners to rank E first on volume. The rubric should push it below A/B and D because of business value.
- D outranking A/B surprises people: it is an existing page at position 22.5 in an easy difficulty band. That is the lesson 04 point about near-misses being cheap.
- Common error: summing A and B volumes into "2,480 addressable demand." Volumes are not additive across variants.
- For a two-hour version, give learners the clusters and ask only for intent, scores, and the reply.
