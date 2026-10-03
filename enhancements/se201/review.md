---
course_id: se201
title: "Advanced SaaS Sales Strategies — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary

A rigorous, numerate course with an unusually consistent running example (Meridian Logistics threads through Lessons 2, 5, and 6) and fully worked arithmetic. I re-checked every worked calculation; nearly all are correct, but two interpretive/arithmetic errors in Lessons 3 and 4 were fixed. The biggest opportunity is practice that puts the numbers into a live conversation — a CFO challenging assumptions, a deal desk challenging a discount — since the course currently tests calculation far more than delivery.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| se201-04 | "Logo churn versus revenue churn" | Factual/logic error. The text concludes the cancelled accounts were "larger than average," but its own numbers show the opposite: 5 of 40 logos (12.5%) took $590,000 (12.3% of ARR), i.e. ~$118,000 each vs. a $120,000 average. The gap between 18.75% revenue churn and 12.5% logo churn comes from the $310,000 of contraction, which logo churn cannot see. | Rewrote the paragraph to locate the gap in contraction and to name both possible causes (larger-than-average leavers, or shrinking survivors). | Applied |
| se201-04 | "Concentration: the number behind the number" and "What a rep does with these numbers" | Two later sentences relied on the incorrect conclusion ("Concentration also explains…", "told us the losses are concentrated"). | Reworded both to stay consistent with the corrected paragraph. | Applied |
| se201-03 | "Watching one customer break even" | Arithmetic error: "if they churn in month 14 the company lost roughly $23,000." At month 14 cumulative gross profit is $65,520, so the loss is ~$13,230; the $23,000 figure is the month-12 value (−$22,590). | Changed to "if they churn after month 12 the company has lost roughly $22,600." | Applied |
| se201-04 | Practice, Exercise 3 question 2 | With the corrected framing, Kestrel's numbers (4/28 = 14.3% logo churn; $465,000/$3.4M = 13.7% cancelled ARR) mean the leavers were slightly *smaller* than average. Instructors' answer keys may assume the old reasoning. | Update any answer key; question itself is fine. | Proposed |
| se201-06 | "The renewal runway" | Milestones T-60 = notice deadline are specific to a 60-day notice period, but the practice uses a 45-day notice. | Add one sentence: "If the notice period differs, shift every milestone so the conversation opens 30 days before the notice date." | Proposed |
| All lessons | End of lesson | No quick self-check. | Added "Check your understanding" with worked answers to se201-02 through se201-06. | Applied |

## Depth and coverage gaps

- **Numbers in conversation.** Lessons 5 and 6 explain framing for three audiences but never model the dialogue. A modeled CFO conversation would make "Frame a deal using the prospect's own cost and revenue numbers" observable. (Drafted: se201-v01, se201-x01.)
- **Deal-desk conversation.** Lesson 3 gives the sentence to take to deal desk but no practice of defending it. Maps to "Calculate customer acquisition cost, lifetime value, and payback period from account data". (Drafted: se201-x01.)
- **Spreadsheet scaffolding.** The arithmetic is heavy; a starter spreadsheet (bridge, LTV, payback) would reduce errors and let learners focus on interpretation. Maps to "Interpret ARR, net revenue retention, and churn to judge the health of a book of business".
- **Usage-model renewal risk.** Lesson 6 covers seat utilization drift but not usage-driver decline as an early warning in usage/hybrid accounts. Maps to "Design a retention and expansion plan for an existing account".
- **Misconception worth naming:** that ROI percentage is the most persuasive number. The course implies payback is stronger for CFOs; one explicit sentence would help (Lesson 5).

## Proposed additional projects

- **Drafted — se201-x01** `projects/01-cfo-assumptions-grill-and-deal-desk-review.md`: Alder Creek business case defended to a Controller persona, then a 20% discount request defended to deal desk.
- **Drafted — se201-x02** `projects/02-brightline-renewal-rescue-account-review.md`: mock account review for the Brightline Manufacturing practice account (Lesson 6) — scorecard rebuild, stakeholder map, and a role-played meeting with the newly promoted champion.
- Idea: **Model chooser case file** — three short customer profiles (public-sector fixed budget, seasonal retailer, fast-growing startup); learner picks and defends a revenue model for each.
- Idea: **Book health triage** — five anonymized ARR bridges; rank by health and write the one-paragraph manager briefing for the worst.

## Video and animation opportunities

- **Drafted — se201-v01** "Five Minutes with Meridian's CFO: Advocacy vs. Analysis" (se201-05), hybrid good/weak take.
- **Drafted — se201-a01** "The ARR Bridge: Growing by Spending vs. Growing by Compounding" (se201-04, se201-06), Manim explainer.
- **Drafted — se201-v02** "Same Price, Three Models" (se201-02), whiteboard walkthrough of Meridian under subscription/usage/hybrid with the doubling scenario.
- Idea: animation of cumulative gross profit crossing the CAC line, with billing terms (monthly / annual prepay / 3-year prepay) toggled (se201-03). Motion makes cash payback vs. accounting payback obvious.

## Assessment ideas

- Auto-graded numeric items generated from parameterized versions of the Northgate, Riverbend, and Kestrel exercises.
- "Spot the bent number" quiz: six one-line retention claims, each using one distortion from Lesson 4's "Where these numbers get bent."
- Rubric for the Lesson 7 business case scored by a finance volunteer.

## Changes applied in this pass

- `catalogue/courses/se201/lessons/03-unit-economics-cac-ltv-and-payback.md`, "Watching one customer break even": corrected the early-churn loss figure (month 14 / $23,000 → after month 12 / $22,600).
- `catalogue/courses/se201/lessons/03-unit-economics-cac-ltv-and-payback.md`: added "Check your understanding".
- `catalogue/courses/se201/lessons/04-growth-and-retention-metrics.md`, "Logo churn versus revenue churn": corrected the interpretation of revenue vs. logo churn.
- `catalogue/courses/se201/lessons/04-growth-and-retention-metrics.md`, "Concentration: the number behind the number": reworded the dependent sentence.
- `catalogue/courses/se201/lessons/04-growth-and-retention-metrics.md`, "What a rep does with these numbers": reworded the dependent sentence.
- `catalogue/courses/se201/lessons/04-growth-and-retention-metrics.md`: added "Check your understanding".
- `catalogue/courses/se201/lessons/02-saas-revenue-models.md`: added "Check your understanding".
- `catalogue/courses/se201/lessons/05-framing-a-deal-with-the-customers-numbers.md`: added "Check your understanding".
- `catalogue/courses/se201/lessons/06-retention-and-expansion-strategy.md`: added "Check your understanding".

## Open questions for the course owner

- Benchmarks (NRR 115–130% best-in-class, quick ratio of 4, payback bands, 3:1 LTV:CAC) are widely cited industry rules of thumb but unsourced in the text; consider citing a source or labeling them as rules of thumb.
- The capped-LTV calculation uses a simple annual survival factor; acceptable for this level, but finance-trained reviewers may want discounting mentioned explicitly.
- Do you want an answer key folder for the numeric exercises? Several answers are long and error-prone to grade by hand.
