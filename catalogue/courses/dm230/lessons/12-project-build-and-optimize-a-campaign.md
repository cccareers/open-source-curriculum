---
lesson_id: dm230-12
course_id: dm230
pathway: digital-marketer
title: "Project: Build, Run, and Optimize a Paid Campaign"
order: 12
kind: project
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
  - D3-S1-C03
objectives: []
---

## Goal

Take a new client from a cold brief to a complete, launch-ready paid search account, and then prove you can read performance data and decide what to change. You will deliver two things: an **unlaunched build** that a reviewer could switch on tomorrow without editing it, and an **optimization analysis** written against a supplied month of performance data.

Nothing in this project runs live. Everything stays in drafts, paused campaigns, planning tools, and a spreadsheet. The work is judged on whether your arithmetic is right, your structure is defensible, and your decisions follow from your numbers rather than from taste.

## Scenario

**Kestrel Roofing and Gutters** is a residential roofing contractor based in Columbus, Ohio. They install and replace asphalt shingle roofs, do storm and leak repairs, and sell gutter guard systems. They serve a 30-mile radius. They have never run paid search; they have a website with a homepage, a services page, and a contact form, and a Google Business Profile with 61 reviews at 4.7 stars.

The owner has agreed to a **$150 per day** budget and wants leads, defined as a phone call over 60 seconds or a submitted "Get a Free Inspection" form.

**Unit economics, as supplied by the owner:**

- Average roofing job: **$4,100**, at a **22 percent gross margin**.
- Average gutter guard installation: **$1,800**, at the same **22 percent gross margin**.
- **25 percent** of leads become a sold job, for both product lines.
- The owner will not go below a 40 percent contribution margin on marketing, meaning he wants at least 40 cents of every break-even dollar left over after paying for the lead.

**Competitive context:** four national lead-generation aggregators bid on every roofing term in the market, plus two local competitors with larger budgets. Storm season in central Ohio runs late spring through summer, and repair demand spikes for roughly ten days after a hail event.

Everything you need is in this brief. Any figure not supplied here is an assumption you must label.

## Requirements

Deliver all ten items. Show your arithmetic in every place a number appears.

**1. Unit economics and targets.**
Derive, with the division shown: gross profit per roofing job, gross profit per gutter job, gross profit per lead for each product line, break-even CPA for each, break-even ROAS for the business, and the target CPA implied by the owner's 40 percent contribution requirement. Also derive the monthly budget from $150 a day. State every rounding decision.

**2. Account and campaign structure.**
Produce the full account tree as a text diagram: campaigns, ad groups, and the settings that live at each level. Separate brand from non-brand. Justify each split in one sentence, and say what you would have to be able to do differently for that split to earn its own campaign. Apply a consistent naming convention and state the convention explicitly.

**3. Keyword plan.**
At least 40 keywords, organized by ad group, each with a match type and a stated reason for that match type. Include estimated monthly volume and an estimated CPC for each (use the planning tools; label estimates as estimates). Add a **negative keyword list** of at least 25 terms, grouped by the reason they are negative, and say which are account-level, which are campaign-level, and why. At minimum your negatives must address free/DIY intent, employment searches, materials-only searches, and out-of-service-area terms.

**4. Ad copy and policy check.**
Write two responsive search ads per non-brand ad group: at least 10 headlines and 3 descriptions each. Give the **character count for every headline and description** and confirm each is within limits. Then run a written policy compliance check: for each ad, list any claim that would need substantiation, name the policy category it falls under, and either supply the substantiation or rewrite the claim. Pay particular attention to superlatives, guarantees, pricing claims, urgency, and anything implying insurance outcomes.

**5. Budget allocation and bid strategy.**
Split the $150 a day across campaigns and defend the split with the lead-value arithmetic from item 1, not with intuition. Choose a bid strategy per campaign and **apply the course's conversion-volume heuristic**: state the planning/evaluation benchmark you use per 30 days, distinguish it from any platform eligibility rule, compare it to what the campaign will realistically produce, and pick accordingly. If a campaign cannot support automated bidding yet, say what you will run instead and what threshold would trigger a switch.

**6. Targeting plan.**
Geography, radius, location-intent setting, ad schedule, device bid considerations, and any audience layers, each with a one-line justification tied to the business. Address what happens to schedule and budget during a hail event.

**7. Conversion tracking plan.**
Specify every conversion action, which are primary and which are secondary, the counting method for each, the attribution window, and the value assigned to each. Include the tracking implementation approach and a **QA checklist a reviewer could execute**: at least eight checks, each with the expected result and how you would tell a false positive from a real one. Name at least three defects this checklist would catch.

**8. Landing page critique.**
Critique the page you would send Roof Replacement traffic to. Identify at least six specific problems, then write **at least three prioritized conversion-lift hypotheses** in the form "changing X will improve Y because Z." Rank them by expected impact over implementation effort and say what evidence supports each. Include a wireframe or annotated description of the page you would build instead.

**9. One fully specified A/B test.**
Pick one of your hypotheses and design the test. You must state: the single changed variable and what is held constant, the primary metric and why, two secondary metrics, the baseline, the minimum detectable effect and why you chose it, the required sample per variant calculated from the two-proportion formula with every line of arithmetic shown, the run length stated separately from sample size and justified against the business cycle, the randomization mechanism and tooling, and the stop rule. Then give an **explicit verdict on whether this account can power this test** using its real click volume. If it cannot, say so plainly and state which alternative you are taking: pool traffic upward, raise the MDE, or decline to test.

**10. ROI analysis and optimization plan.**
The account has now been running for 30 days and produced the report below. This is the only performance data you have and you may not invent more.

| Campaign | Impr | Clicks | CTR | Avg CPC | Spend | Conv | Conv rate | Lost IS (budget) | Lost IS (rank) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand - Kestrel | 1,730 | 364 | 21.04% | $1.65 | $600 | 88 | 24.18% | 0% | 4% |
| NB - Roof Replacement | 8,350 | 359 | 4.30% | $6.40 | $2,300 | 24 | 6.69% | 6% | 34% |
| NB - Roof Repair | 5,620 | 324 | 5.77% | $3.55 | $1,150 | 31 | 9.57% | 27% | 15% |
| NB - Gutter Guards | 2,940 | 111 | 3.78% | $4.60 | $510 | 3 | 2.70% | 3% | 41% |
| **Total** | **18,640** | **1,158** | **6.21%** | **$3.94** | **$4,560** | **146** | **12.61%** | — | — |

Treat Brand, Roof Replacement, and Roof Repair conversions as **roofing leads**. Treat Gutter Guards conversions as **gutter leads**. Use the close rates and margins from the scenario.

Produce:

- A contribution table for all four campaigns: spend, leads, revenue, gross profit, contribution, and ROAS. Sum it and confirm that the campaign contributions add up to total gross profit minus total spend.
- A written **diagnosis per campaign** that names the observation, the likely cause, and the action. Decompose at least two CPAs into CPC and conversion rate to support the diagnosis. Use the impression share columns.
- An incrementality adjustment on Brand: assume 70 percent of brand leads would have arrived without the ad, recompute brand's incremental CPA and contribution, and restate the account's honest total.
- **Three defended optimization actions**, each with the arithmetic behind the expected effect, a forecast stated as a range rather than a point, and the condition that would make you reverse it. At least one must be a budget reallocation of $400 a month or more.
- A one-paragraph client verdict of under 200 words, in plain language, leading with money, naming the weakest campaign, and disclosing one thing you do not know.

## Constraints

These are not suggestions. A submission that violates any of them is returned unassessed.

- **Everything stays in draft, paused, or sandbox.** No campaign may be enabled. No ad may serve. No experiment may be launched.
- **No live ad spend and no live traffic.** If you have access to a real account, use a paused campaign or a draft. If you do not, use Google Ads' planning and preview tools, or build the account structure in a spreadsheet and a document.
- **Use only the figures supplied in this brief**, plus assumptions you label clearly and inline. Write "assumption:" before each one and say why the assumption is reasonable.
- **No invented conversion data.** The 30-day table is the only performance data that exists. Do not add a second month, do not add segment breakdowns that were not given, and do not report a test result you did not compute from supplied numbers.
- **Reproducible by a reviewer.** Every number must be traceable to a supplied figure or a labelled assumption through arithmetic that is visible. A spreadsheet with formulas is acceptable and preferred; a spreadsheet of pasted values is not.
- **Cite the policy category for any compliance finding.** "This looks risky" is not a finding. Name the category and the specific text.
- **Every claim in your ad copy must be substantiable** from the scenario or from a labelled assumption. You may use the 4.7-star rating and 61 reviews because they are given. You may not claim "Columbus's #1 roofer," a warranty length, a price, an insurance outcome, or a response time that is not in this brief.
- **Statistical honesty is enforced.** Do not declare a winner, a trend, or an improvement from a sample that cannot support it. Writing "this account cannot power that test" is a correct answer and will score better than a confident answer built on 40 clicks.

## What to Submit

1. A build document containing items 1 through 8: the account tree, keyword plan, negative lists, ad copy with character counts, policy check, budget and bidding plan, targeting plan, tracking plan with QA checklist, and landing page critique with hypotheses.
2. A spreadsheet with visible formulas covering the unit economics, the budget allocation, the sample size calculation, and the full contribution analysis.
3. A one-page test record for item 9, in the format used in this course.
4. A performance report for item 10, ending with the client verdict paragraph.
5. Evidence that the build exists and is not live: exported campaign settings, or screenshots showing paused or draft status.

## Definition of Done

A reviewer should be able to tick every line of this list.

- [ ] Gross profit per lead, break-even CPA, and target CPA are derived for both product lines with the division shown.
- [ ] Break-even ROAS is computed as one divided by gross margin, and stated.
- [ ] Monthly budget is derived from the daily budget, with the day count stated.
- [ ] The account tree shows every campaign and ad group, uses one stated naming convention consistently, and separates brand from non-brand.
- [ ] Every campaign-level setting is listed at the campaign level and not confused with an ad group setting.
- [ ] At least 40 keywords appear, each with a match type and a reason.
- [ ] At least 25 negatives appear, grouped by reason, with the level each sits at.
- [ ] Two responsive search ads exist per non-brand ad group, with at least 10 headlines and 3 descriptions each.
- [ ] Every headline and description carries a character count and every count is within limits.
- [ ] Each flagged claim names a policy category and is either substantiated or rewritten.
- [ ] The budget split is justified by lead-value arithmetic, and the arithmetic is shown.
- [ ] Each bid strategy choice states its planning/evaluation volume benchmark, distinguishes it from platform eligibility, and compares it to what the campaign produces.
- [ ] The targeting plan covers geography, radius, location intent, schedule, devices, and audiences, each with a justification.
- [ ] Every conversion action is listed with counting method, attribution window, primary or secondary status, and value.
- [ ] The tracking QA checklist has at least eight executable checks with expected results, and names three defects it would catch.
- [ ] The landing page critique names at least six specific problems and at least three hypotheses, each stated as "changing X will improve Y because Z," and ranked.
- [ ] The A/B test specifies one variable, the primary metric, the baseline, the MDE, the sample size with full arithmetic, the run length separately, the tooling, and the stop rule.
- [ ] The A/B test contains an explicit yes or no verdict on whether this account can power it, with the click-volume division shown.
- [ ] The contribution table covers all four campaigns and reconciles: campaign contributions sum to total gross profit minus total spend.
- [ ] Every campaign has a written diagnosis with observation, cause, and action.
- [ ] At least two CPAs are decomposed into CPC and conversion rate.
- [ ] The brand incrementality adjustment is computed and the account's honest total contribution is restated.
- [ ] Three optimization actions are defended with arithmetic, each with a forecast range and a reversal condition.
- [ ] At least one action is a budget reallocation of $400 a month or more.
- [ ] The client verdict is under 200 words, leads with money, names the weakest campaign, and discloses an unknown.
- [ ] Every assumption in the submission is labelled as an assumption.
- [ ] Nothing is live. Evidence of draft or paused status is attached.

## How This Is Assessed

Weighting, so you know where to spend your effort:

| Area | Weight | What earns the marks |
| --- | --- | --- |
| Arithmetic correctness | 25% | Every number reconciles; rounding stated; totals add up |
| ROI analysis and decisions | 25% | Diagnoses follow from the data; actions follow from the diagnoses |
| Test design and statistical honesty | 20% | Valid design, correct sample size, honest verdict on feasibility |
| Build quality | 20% | Structure, keywords, negatives, copy, tracking, targeting |
| Policy and ethics | 10% | Claims substantiated, categories cited, nothing overstated |

Two things will fail an otherwise strong submission: a contribution table that does not reconcile, and a confident claim built on a sample that cannot support it.

## Hints

**Do the lead-value arithmetic first.** It drives every other decision in this project. Until you know what a roofing lead is worth and what a gutter lead is worth, you cannot set a budget split, you cannot pick a bid target, you cannot judge a campaign, and you cannot tell whether the gutter campaign is a problem or a rounding error. Twenty minutes on item 1 will save you three hours later.

**The two product lines have different economics.** They share a margin but not a job size, so they do not share a break-even CPA. Any analysis that applies one lead value to the whole account is wrong before it starts.

**Check the conversion-volume test before you choose a smart bidding strategy.** Use the course's roughly 30-conversions-in-30-days planning and evaluation heuristic at the strategy level; it is not a universal platform requirement. Look at the conversion column in the supplied table and ask which campaigns clear it. Roof Replacement (24) and Gutter Guards (3) do not. Deciding what to run in a campaign that cannot yet support automation is part of the assessment, not a gap in the brief.

**The search terms report is where the money hides.** You do not have one for Kestrel, which is exactly why your negative list has to anticipate the leaks rather than react to them. Think about who else types roofing words: people looking for jobs, people looking for materials, people wanting free government programs, people in cities you do not serve, people researching how to do it themselves, and the aggregators' own brand names. Then write the negatives that would have caught those before they cost anything.

**Diagnose CPA by decomposing it.** CPA is CPC divided by conversion rate. Two campaigns with the same bad CPA can have opposite causes and opposite fixes. Do the division before you form an opinion.

**Impression share tells you which lever to pull.** Lost share to budget is a money problem. Lost share to rank is a bid or quality problem. One campaign in the supplied table is starved of budget while clearing its target comfortably, which is the easiest win in the account. Another is losing 41 percent to rank on almost no volume, which is a very different conversation.

**Be willing to write "this account cannot power that test."** At $150 a day, most of the tests a marketer would like to run are impossible, and saying so is a professional judgment rather than an admission of failure. The submissions that lose marks here are the ones that quietly reduce the sample size until the calendar works.

**Do not let a good ROAS hide a bad contribution.** Compute break-even ROAS from the margin and compare, every time. Twenty-two percent is a thin margin, and thin margins have unforgiving break-even points.

**Write the client paragraph last and write it for the owner, not for a marketer.** He does not know what impression share is. He knows what a sold roof is worth. If you cannot explain your recommendation in his vocabulary, you probably do not believe it yet.
