---
course_id: dm301
title: "Web Analytics and Optimization — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
An unusually rigorous analytics course: one fixed Kestrel Outfitters baseline that every table reconciles to, noise-floor and standard-error arithmetic a learner can do in a meeting, and a pre-registered falsification condition that pays off in lesson 06. Almost every figure checks out. The fixes needed are a few percentage misstatements, a scorecard noise floor quoted at the wrong time scale, and a free-delivery calculation that left out tablet orders. The biggest opportunity: the capstone's Track B depends on "an exported dataset your instructor supplies" that does not exist in the repository; project x01 drafts it.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm301-03 | "The Denominator Problem" | "twenty-fold overstatement" — 24.68% / 1.32% is 18.7x. | "nearly twenty-fold (24.68 ÷ 1.32 = 18.7)". | Applied |
| dm301-03 | "Telling a Real Move From Normal Variation" | 235 → 210 sessions described as a 12% decline; it is 10.6% (25 ÷ 235). | Changed to 11 percent with the division shown, in both sentences. | Applied |
| dm301-03 | "The Scorecard" | Noise-floor line quoted the weekly floor (±0.21pp) on a 28-day vs 28-day scorecard; the 28-day floor is about ±0.11pp. | Line now states both, with the 28-day arithmetic. The "+0.03pp — within noise" verdict still holds. | Applied |
| dm301-05 | "Decision three: deciding not to act" | Repeats the 12% figure. | Changed to 11 percent. | Applied |
| dm301-05 | "Decision one" / "The Decision Memo" | "100 to 160 additional purchases if completion reaches 23 to 26 percent": 26% gives 150, not 160. | Changed to 100 to 150 with the multiplication shown; memo example updated to match. | Applied |
| dm301-07 | "Triangulating" | Text says "four instruments deep"; the table has five rows (GA4, usability test, scroll map, recordings, exit survey). | "five instruments deep". | Applied |
| dm301-08 | "Guardrails, and Rates That Lie" (free delivery) | Whole-business view gave up $6.95 on desktop orders but omitted tablet's 21 orders ($146). | Added the tablet line: net -$841; break-even 77 more orders; desktop-only equivalent 41.9% → 52.6%. | Applied |
| dm301-08 | "Guardrails, and Rates That Lie" | Kestrel's own proposal (show delivery cost earlier) is exactly the denominator-shrinking risk the section describes, but the lesson never says so. | Added a short paragraph tying the guardrail to the proposal. | Applied |
| dm301-08 | "Writing the Proposal" vs "Can You Even Measure It?" | The treatment happens on the product page and cart, but the sample-size calculation uses only mobile checkouts. Learners may not see that a product-page change needs a test unit (sessions or users) assigned upstream. | Add one sentence on assigning variants at session or user level and reading the effect at checkout. | Proposed |
| dm301-05 | "Decision two" | 396 guide signups are divided by 5,800 guide sessions, but 5,800 is organic-only (lesson 04) while 396 is from all channels (lesson 03 scorecard). | Note the mismatch or use all-channel guide sessions. | Proposed |

## Depth and coverage gaps
- **Track B dataset missing.** Lesson 09 asks instructors to supply Kestrel exports (channel, device, landing page, Search Console, qualitative outputs) and forbids the mobile-checkout finding. Nothing in the repo supplies non-checkout data to find. Drafted as project x01, with CSVs described inline and two planted findings plus one planted noise trap (objective: Turn an analytics finding into a specific marketing decision).
- **Verification practice without a live site.** Lesson 02's ten-step routine needs a property; learners without one only read about it. A "broken DebugView captures" exercise (double-firing purchase, missing currency, purchase on page load) would let them practise diagnosis from evidence (objective: Set up a GA4 property and verify that it collects the events a business cares about). Drafted as project x02.
- **New vs returning and cohort views** are named in lesson 03 ("Retention") but never worked. A short worked example would support the capstone's "returning versus new" suggestion.
- **Search Console query-level work**: lesson 04 joins at landing page only. A small example of reading query rows for one page (with the anonymised-query caveat) would deepen the cross-tool objective.
- **Misconception worth a check item**: "bounce rate in GA4 means the same thing as in Universal Analytics". The lesson states the definition; a quiz item would test it.

## Proposed additional projects
- **x01 Kestrel Track B Dataset and Desktop Path Audit** (drafted) — supplied CSVs and a findings worksheet for the capstone's Track B.
- **x02 Broken Tag Case File** (drafted) — five DebugView-style captures and a release note; learner diagnoses each and writes the verification report.
- Outlet store measurement plan: define `find_store` parameters, a 40-mile segment, and a scorecard for the third quarterly goal.
- Guide-to-subscriber experiment plan: the contextual signup offer from lesson 05, taken through sizing, sample size, guardrails and pre-registration.
- Usability study on the Trail Notes guides with three participants, focused on guide-to-product paths.

## Video and animation opportunities
- **Is it a signal? The two-SE test in a meeting** (lesson 05) — whiteboard walkthrough of the three worked tests. Drafted: `media/video-01-is-it-a-signal.md`.
- **Running the verification routine** (lesson 02) — screencast of Tag Assistant, DebugView and Realtime on a test site, including a deliberate double fire. Drafted: `media/video-02-verifying-a-purchase-event.md`.
- **Mix shift / Simpson's paradox** (lesson 05) — animation where every segment bar falls while the blended bar rises as the mix tilts. Drafted: `media/animation-01-every-segment-fell.md`.
- **Sample size vs funnel depth** (lesson 08) — animation of required sessions shrinking as the test moves from site-wide 1.32% to checkout 17.1%. Not drafted.
- **The line at the click** (lesson 04) — animation showing Search Console's view ending and GA4's beginning at the click, joined at the landing page. Not drafted.

## Assessment ideas
- Quick calc (lesson 03): compute the 28-day noise floor for a property with 20,000 sessions at 2.0% conversion.
- Quick check (lesson 02): which of five events should be key events, with one-line reasons.
- Quick check (lesson 06): rewrite three leading usability tasks as scenario tasks.
- Rubric line for every analysis deliverable: "every rate printed with its count and denominator".

## Changes applied in this pass
- `catalogue/courses/dm301/lessons/03-kpis-and-user-behavior-reports.md`, "The Denominator Problem": overstatement ratio corrected to nearly twenty-fold with the division.
- `catalogue/courses/dm301/lessons/03-kpis-and-user-behavior-reports.md`, "Telling a Real Move From Normal Variation": decline corrected to 11 percent (two sentences).
- `catalogue/courses/dm301/lessons/03-kpis-and-user-behavior-reports.md`, "The Scorecard": noise-floor line restated for 28-day periods with arithmetic, weekly figure kept.
- `catalogue/courses/dm301/lessons/05-from-data-to-decisions.md`, "Decision one" and "The Decision Memo": range corrected to 100-150 with arithmetic.
- `catalogue/courses/dm301/lessons/05-from-data-to-decisions.md`, "Decision three": decline corrected to 11 percent.
- `catalogue/courses/dm301/lessons/07-heatmaps-recordings-and-user-feedback.md`, "Triangulating": "four" → "five" instruments.
- `catalogue/courses/dm301/lessons/08-conversion-rate-optimization.md`, "Guardrails, and Rates That Lie": tablet orders added to the free-delivery whole-business check; new paragraph linking the guardrail to Kestrel's own proposal.

## Open questions for the course owner
- **GA4 specifics to re-verify before publishing (not changed here):** data-retention options (2 or 14 months on standard properties), the 25-parameter and 50-custom-dimension limits, the engaged-session thresholds (10 seconds is the default and is adjustable), how a session spanning midnight is attributed to dates in reports, and the Search Console link requirements and report-collection publishing step. These match current documentation as far as this reviewer knows, but Google changes them; add a "checked on" date.
- The claim that "roughly half of queries are withheld" in Search Console varies widely by site; consider "a large and variable share".
- Shipping: lesson 02 says `value` excludes shipping, and lesson 08 treats the $6.95 as margin given up. Confirm the intended assumption (does Kestrel's $36.12 gross profit include shipping revenue?).
- Which heatmap/recording vendor and usability-testing panel does the program license (sequencing rationale item 2)?
