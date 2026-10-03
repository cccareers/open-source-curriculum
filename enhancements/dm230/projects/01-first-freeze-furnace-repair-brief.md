---
course_id: dm230
project_id: dm230-x01
title: "Northgate First-Freeze Furnace Repair: Campaign Brief"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - dm230-03
  - dm230-04
  - dm230-05
  - dm230-06
objectives:
  - Structure a paid account into campaigns and ad groups that can be optimized
  - Select keywords and match types, and use negatives to protect budget
  - Write compliant ad copy and assets that match the query and the landing page
  - Set budgets, bidding strategies, and targeting for a stated campaign goal
competency_ids:
  - D3-S1-C01
  - D2-S1-C03
  - D7-S2-C02
---

## Scenario

It is mid-September. Northgate Heating and Air's seasonal Furnace Repair campaign (`NGH-SRCH-NB-FurnaceRepair-COL25-SEASONAL` in the lesson 03 tree) has been paused since March. The owner wants it relaunched before the first hard freeze and asks for a one-document campaign brief he can approve in one sitting. Last year the campaign ran out of money during freeze week while the phones were ringing for competitors; he does not want that again, and he does not want to blow the November budget either.

You have last year's weekly data (below), the account economics from the course, and the lesson 06 pacing plan (November daily account budget $260). The Furnace Repair campaign produces repair leads worth $108 in gross profit, with a $60 target CPA.

## What you will build / produce

A campaign brief of four to six pages containing:

1. **Goal and economics:** lead value, break-even CPA, target CPA, implied maximum CPC at target and at break-even for the campaign's conversion rate (show the multiplication).
2. **Structure:** the campaign's ad groups (two or three), each with its landing page path, keyword theme, and a one-sentence justification against the lesson 03 volume test.
3. **Keywords and negatives:** 15 to 25 keywords with match types and reasons; a negative list of at least 20 terms marked shared, campaign, or ad group level, including the ad group negatives that keep furnace *install* queries out of this campaign.
4. **Ads and assets:** one responsive search ad per ad group (at least 10 headlines and 3 descriptions, every character count shown), a sitelink and callout set, a call asset schedule, and a completed lesson 05 compliance checklist with a substantiation table.
5. **Bidding and budget:** the bid strategy (pass or fail the conversion-volume test with the numbers shown), the normal daily budget, and a written freeze-week protocol: trigger, timing, budget level, and where the money comes back from.
6. **Targeting:** radius, presence setting, ad schedule tied to Northgate's actual phone coverage, device notes, and at least two audience layers in observation.
7. **Measurement:** which conversion actions count, the conversion-lag caution for reading freeze week, and the three numbers you will report on the Monday after the freeze.

## Before you start (prerequisites, starter files or data)

**File 1 — `furnace_repair_last_winter.csv`** (last year's campaign at a $110 daily budget; "freeze" = first sustained sub-freezing night on 5 November)

```text
week_start,impressions,clicks,spend,avg_cpc,conversions,search_is,lost_is_budget,lost_is_rank
2025-10-20,1450,102,739.50,7.25,12,48%,4%,48%
2025-10-27,1480,104,769.60,7.40,12,47%,6%,47%
2025-11-03,1790,114,1539.00,13.50,15,19%,58%,23%
2025-11-10,2050,140,1190.00,8.50,17,41%,22%,37%
```

**File 2 — `phone_coverage.txt`**

```text
Office answers 7:00am to 9:00pm, seven days.
After-hours answering service: contracted October through March,
  forwards emergency calls to the on-call tech.
No answering service April through September.
```

**Policy note for copy:** Northgate's $79 diagnostic and "no overtime charges" are true and published on the landing pages. Any response-time promise must be supported by dispatch data you state as an assumption.

## Milestones

1. **Economics first.** Compute break-even and target CPA and the implied CPC ceilings using last year's conversion rate (compute it from File 1).
2. **Read last winter.** For each week, compute CTR, conversion rate, CPA, and eligible impressions (impressions divided by search impression share). Identify the week the campaign was budget-limited and by how much.
3. **Size freeze week.** Estimate what capturing the lost-to-budget share in the freeze week would have cost and produced, at that week's CPC and conversion rate. Decide how much of it is worth buying against the $108 break-even and $60 target. Write the protocol.
4. **Build structure, keywords, negatives.**
5. **Write ads, assets, and the compliance check.**
6. **Write targeting and measurement sections.** Assemble the brief with a one-paragraph summary on page one.

## Acceptance criteria

- [ ] Freeze week is identified as budget-limited (58% lost to budget) with lost-to-rank actually improving from 47% to 23%, matching the lesson 02 pattern, and the brief says the fix is budget, not a quality project.
- [ ] Eligible impressions in freeze week are computed (about 9,400) and the cost of capturing the full budget loss is shown (about 5,450 impressions, about 350 clicks at 6.4% CTR, about $4,700 at $13.50, about 46 leads at 13.2%, CPA about $103).
- [ ] The brief concludes that full capture lands just under break-even and well above target, and recommends partial capture with a stated daily cap and reasoning (for example, raising the daily budget for three to five days rather than matching total demand).
- [ ] The bid-strategy choice applies the volume test: about 50 conversions a month in season passes a roughly 30-per-30-days test, but the campaign restarts cold after seven months dark, so the brief either pre-activates two weeks early or starts on a conservative strategy and states the switch threshold.
- [ ] The ad schedule uses File 2: overnight serving is justified only because the answering service is contracted October through March.
- [ ] Ad group negatives route install and replacement queries to the Furnace Install campaign.
- [ ] Every headline is 30 characters or fewer and every description 90 or fewer, with counts shown; no unsupported superlatives, response-time claims are labelled with their source, and the $79 matches the landing page.
- [ ] The freeze-week report section warns against judging CPA in the first days because of conversion lag (lesson 08).

## Evidence checklist

- Campaign brief document (four to six pages).
- Spreadsheet with economics, last-winter analysis, and freeze-week sizing, formulas visible.
- Draft or paused campaign export or screenshot showing nothing is live.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Economics | Uses CPA without derivation | Derives ceilings from lead value and conversion rate | Shows how the ceilings move if freeze-week conversion rate differs |
| Diagnosis of last winter | Says "ran out of money" | Separates budget loss from rank loss with numbers | Explains why rank loss fell during the spike |
| Freeze protocol | "Raise the budget" | Trigger, timing, level, and payback source stated | Caps the spend using marginal CPA reasoning and names the reversal signal |
| Build quality | Generic keywords and ads | Tight ad groups, routed negatives, compliant counted copy | Copy written for the emergency mindset with substantiation for every claim |
| Measurement | No plan | Conversion actions and lag caution stated | Defines the Monday-after report and what would change the protocol next year |

## Stretch goals

- Write the seasonality adjustment you would enter for freeze week (dates and expected conversion-rate change) and explain why it is not used for "winter" as a whole.
- Draft the October budget reallocation memo: Furnace Repair at $60 a day comes out of AC Repair, per lesson 03. Show the AC Repair contribution you are giving up.

## Reflection prompts

- What would you have done differently if lost IS to rank had risen during the freeze instead of falling?
- Which claim in your ad copy was hardest to substantiate, and what did you do about it?

## Instructor notes (common pitfalls, how to adapt for time)

- Reference values: conversion rates by week 11.8%, 11.5%, 13.2%, 12.1%; CPAs $61.63, $64.13, $102.60, $70.00. Eligible impressions about 3,021, 3,149, 9,421, 5,000.
- Freeze-week full capture: 9,421 x 58% = 5,464 impressions; x 6.4% = about 350 clicks; x $13.50 = about $4,720; x 13.2% = about 46 leads; CPA about $103. Marginal clicks are usually worse than average, so learners should treat $103 as optimistic.
- Learners often forget that a daily budget can only overdeliver to about 2x, so "raise it the morning of the freeze" is too late; the protocol should act on the forecast 48 hours out (lesson 06).
- Some learners will put furnace install keywords in this campaign. Point them back to lesson 03's margin argument.
- For a three-hour version, drop the ads and assets section and supply a finished keyword list.
