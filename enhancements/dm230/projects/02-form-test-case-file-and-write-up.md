---
course_id: dm230
project_id: dm230-x02
title: "Northgate Form Test: Case File and A/B Test Write-Up"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: stretch
related_lessons:
  - dm230-08
  - dm230-10
  - dm230-11
objectives:
  - Design a valid A/B test on ads or landing pages and interpret the result
  - Implement conversion tracking and verify that it reports correctly
  - Calculate cost per acquisition, return on ad spend, and contribution for a campaign
competency_ids:
  - D3-S1-C02
  - D3-S1-C03
---

## Scenario

Northgate Heating and Air ran the landing page test from lesson 10: the current seven-field "Book a Visit" form (A) against a three-field form asking only name, phone, and ZIP (B), pooled across all non-brand traffic for eight full weeks, randomized at the user level with the campaign experiment tool. The test record said: primary metric = conversion rate (form submits plus calls over 60 seconds) per session; MDE = 50% relative; planned sample about 650 sessions per variant; read once at the end.

The owner has already seen the platform dashboard, which shows B at 16.1% against A at 11.1%, and he wants to roll B out and tell his brother-in-law, who runs a plumbing company, that "short forms add 45%." Two weeks into the test, the office manager also asked to stop it early because B was "obviously winning." You have the full export and the CRM lead log. Your job is to write the test up honestly.

## What you will build / produce

1. A reconciliation table comparing platform conversions with CRM leads by week and variant, with any discrepancy explained.
2. The corrected result: conversion rate per variant, absolute and relative lift, a pooled two-proportion z-test, and a 95% confidence interval on the difference, every line of arithmetic shown.
3. A completed test record in the lesson 10 format, including a verdict (winner, no difference detected, or inconclusive) and a caveats field.
4. A CPA and contribution comparison for both variants at the repair lead value of $108.
5. A half-page memo to the owner answering: should he roll B out, and what may he tell his brother-in-law?
6. A one-paragraph note to the office manager explaining, with the week-2 numbers, why the test was not stopped.

## Before you start (prerequisites, starter files or data)

**File 1 — `form_test_weekly.csv`** (platform-reported, from the experiment report; pooled non-brand; blended CPC for both arms $7.80; this simplified export assumes one paid click per recorded session, with no repeat sessions. In a real report, use observed spend rather than sessions x CPC)

```text
week,A_sessions,A_conv,B_sessions,B_conv
1,84,8,83,14
2,81,9,82,13
3,86,10,85,11
4,83,9,84,12
5,85,10,86,22
6,82,9,81,12
7,84,10,85,12
8,82,9,83,12
```

**File 2 — `crm_leads_by_variant.csv`** (from Northgate's CRM; each lead record carries the landing page variant in a hidden field)

```text
week,A_leads,B_leads
1,8,14
2,9,13
3,10,11
4,9,12
5,10,12
6,9,12
7,10,12
8,9,12
```

**File 3 — `change_log.txt`**

```text
Week 5, Tue: Web contractor moved the variant B thank-you page to a new
             template. Conversion tag copied into the new template "to be
             safe". Old hardcoded snippet not removed.
Week 5, Sat: Tag manager preview showed two conversion events per B
             submission. Old snippet removed.
```

**Business figures:** repair lead value $108 gross profit; target CPA $60.

## Milestones

1. **Reconcile before you compute.** Line up File 1 against File 2. Find the week where they disagree, explain the cause from File 3 using the lesson 08 defect catalogue, and decide which numbers are the truth.
2. **Compute the corrected result.** Totals, rates, lift, z, p, and the confidence interval on the difference.
3. **Compute the uncorrected result too,** so you can show what the defect would have made you conclude.
4. **Revisit week 2.** Compute the cumulative result after two weeks and its z. Explain why stopping then would have been wrong even though B was ahead.
5. **Write the test record and the two messages.**

## Acceptance criteria

- [ ] Week 5 variant B is identified as double-counted (22 platform conversions against 12 CRM leads), the cause is named as a leftover hardcoded snippet alongside the container tag, and the 10 phantom conversions are excluded.
- [ ] Corrected totals: A = 74 conversions on 667 sessions (11.09%); B = 98 on 669 (14.65%). Absolute lift about 3.6 points; relative about 32%.
- [ ] Corrected z is about 1.94 (p about 0.052) and the 95% interval on the difference runs from about 0.0 to +7.1 points, i.e. it touches zero.
- [ ] Uncorrected z is about 2.69 (p about 0.007): the tracking defect alone turned a borderline result into an apparent winner. This is stated plainly.
- [ ] The verdict is not "winner." The write-up explains why it is also not a clean "no difference detected" (the interval only just includes zero and the observed lift is below the planned 50% MDE, which the test was sized to detect), and chooses and defends a label.
- [ ] The memo recommends a decision honestly: shipping the shorter form can be justified as a judgment call (lesson 09 lists cutting unnecessary fields as a reliable safe win, and the direction of the data agrees) but must be labelled a judgment, not a tested 45% lift.
- [ ] The week-2 cumulative result (A 17/165, B 27/165, z about 1.6) is used to explain the peeking problem to the office manager in plain language.
- [ ] CPA per variant is shown with the arithmetic, using corrected conversions (A about $70.31; B about $53.25).

## Evidence checklist

- Reconciliation table (week by variant, platform vs CRM, discrepancy and cause).
- Spreadsheet with visible formulas for all statistics.
- Completed test record.
- Owner memo (half page) and office manager note (one paragraph).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Tracking reconciliation | Uses platform numbers as given | Finds and corrects the week-5 double count | Proposes the QA step and monitor that would have caught it within a day |
| Statistical arithmetic | Reports rates only | Correct z, p, and CI for corrected data | Also shows the uncorrected and week-2 results and what each would have led to |
| Verdict | "B wins" | Not a winner; label defended | Distinguishes "underpowered for this effect size" from "no effect" clearly |
| Commercial framing | CPA only | CPA and contribution per variant with $108 value | States expected rollout effect at the low end of the interval |
| Communication | Jargon-heavy | Plain-language memo with one recommendation | Gives the owner a sentence he can repeat accurately to his brother-in-law |

## Stretch goals

- Compute the sample size per variant that would have been needed to detect a 30% relative lift at 80% power from an 11% baseline, and convert it to months at 710 pooled clicks a month.
- Draft the "Caveats" line for a re-run that adds call-only traffic, and explain why calls must stay in the primary metric.

## Reflection prompts

- If you had not had the CRM log, how would you have noticed the defect?
- What would you say if the owner replied, "the dashboard says 45%, why should I believe you over Google?"

## Instructor notes (common pitfalls, how to adapt for time)

- Reference values (two-proportion test, pooled SE): corrected z = 1.94, p = 0.052, CI on difference about −0.03 to +7.14 points; uncorrected z = 2.69, p = 0.007, CI +1.4 to +8.7 points; week 2 cumulative z = 1.62, p = 0.105.
- Contribution per variant at $108 per lead: A = 74 x $108 − $5,202.60 = $2,789.40; B = 98 x $108 − $5,218.20 = $5,365.80. Learners should note that the contribution gap is real money if the effect is real, which is exactly why the honest uncertainty matters.
- The most common error is averaging the eight weekly conversion rates instead of dividing total conversions by total sessions.
- Some learners will argue for "winner" at p = 0.052. Push back with the pre-declared threshold, and accept a well-argued "direction established, magnitude unknown, ship on judgment" position.
- For a three-hour version, give learners the reconciliation already done and focus on the statistics and memo.
