---
course_id: dm230
title: "Pay-Per-Click (PPC) Advertising — Enhancement Review"
reviewed_lessons: 12
status: draft
---

## Summary
dm230 is rigorous and unusually honest about uncertainty: nearly every lesson works the Northgate numbers end to end, and the statistics in lesson 10 are correct line by line. The in-lesson arithmetic checked out almost everywhere; nine small errors were fixed. The main weakness, as in dm201, is **cross-lesson consistency of the Northgate dataset**. Several lessons present different "canonical 30-day" impression share figures, opposite device findings, and conflicting business hours, founding dates, and plan prices. A learner comparing lessons will notice, and the capstone (Kestrel) is unaffected but the practice exercises are. These need an owner decision and are listed as Proposed. Ad-platform UI names, thresholds, and targeting options change often; those are flagged in Open questions rather than rewritten.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm230-02 | "Worked Diagnosis" | Typo: "a daily budget that fully pacing out". | "fully paces out". | Applied |
| dm230-04 | "New exact keywords" | Says rows 2, 4, 6, 8, 10 "all clear the promotion bar", but rows 8 and 10 have 2 conversions on 11 and 9 clicks, below the lesson's own bar (3+ conversions, or 20+ clicks clearly above average). | Rows 2, 4, 6 clear it; 8 and 10 rest on the suburb pattern. | Applied |
| dm230-04 | "Negative keywords", one-word paragraph | The explanation of `-salary` / `-"salary"` / `-[salary]` was self-contradictory. | Rewritten: broad and phrase identical for one word; exact blocks only the standalone query. | Applied |
| dm230-04 | "The arithmetic of the recovered spend" | "The seven rows verdicted Negative" — there are eight (row 17, the competitor name, is also Negative). | Named the seven as junk rows and explained why row 17 is excluded. | Applied |
| dm230-05 | "Flag it and fix it", Draft 4 | "Switch to Northgate & Save 20%" counted as 29 characters; it is 30. | Corrected to [30]. | Applied |
| dm230-06 | "Seasonality and Budget Pacing" | "Roughly $8,000 has moved out of March and September" — March and September account for only about $3,950; the full shift ($7,904) comes from six shoulder months. | Restated with the check arithmetic. | Applied |
| dm230-09 | "The Anatomy of a Page", offer | Offer example used a $89 diagnostic; every other lesson and the ads use $79, and the lesson's own rule is that the page must repeat the ad's number. | Changed to $79, applied to the repair. | Applied |
| dm230-10 | "Choosing the Primary Metric" | "Same 10,000 impressions each" but the table shows 9,800 and 9,750. | "Roughly 10,000". | Applied |
| dm230-10 | "The Test Record" | MDE recorded as +40% relative with 650 clicks planned; the two-proportion formula needs about 926 per variant at a 40% MDE from an 11% baseline. 650 matches a 50% MDE (614). | Changed the record's MDE to +50% with the 614 figure. | Applied |
| dm230-11 | "The Brand Search Problem" | "Overstates the account's performance by roughly 50 percent" — on the lesson's own assumptions the honest total is about $5,670 to $7,570 against a reported $14,224, i.e. the report is roughly double. | Restated with the arithmetic. | Applied |
| dm230-08 | "The Verification Routine", step 8 | Checking attribution end to end implies clicking a live ad, which conflicts with lesson 02's "do not search for your own ad" and the course's no-live-spend rule. | Add a note: do this only in a live, approved account, or verify GCLID capture with a test URL parameter on the landing page and CRM field instead. | Proposed |

### Cross-lesson inconsistencies in the Northgate dataset (all Proposed)
| Fact | Where | Values |
|---|---|---|
| AC Repair impression share (same "canonical 30 days") | 02 / 04 / 06 / 11 | 41% IS, 34% lost budget, 25% rank / 34% IS / 41%, 22%, 37% / 61%, 6%, 33% (11 labels its table "assumed") |
| Furnace Install IS | 02 / 06 / 11 | 29/6/65 / 34/3/63 / 53/21/26 |
| Maintenance Plans IS | 02 / 06 / 11 | 62/5/33 / 29/0/71 / 47/39/14 |
| AC Repair device split | 06 vs 09 | 06: mobile 289 clicks at 12.1%, desktop 7.7% (mobile converts better). 09: mobile 304 at 9.2%, desktop 17.6% (mobile converts worse). Opposite conclusions. |
| Business hours | 04, 05 vs 06, 09 | 04/05: open 24/7, "same flat rate at 2am". 06: nobody answers midnight to 6am. 09: "7:00am to 9:00pm, seven days". |
| Founding / tenure | 03 / 05 / 09 | "Family Owned Since 1994" / "Since 2003", "22 years" / "Founded in 1987" |
| Maintenance plan price | 05 / 08 / 11 | "$19/mo" / "$149 annual plan, $95 value" / "$189 a year, $95 GP" |
| tCPA data threshold | 03 vs 06 | "15 to 30 conversions per 30 days" vs "roughly 30" |

Recommendation: publish a one-page "Northgate fact sheet" in the course overview (hours, founding year, plan price, canonical 30-day table including impression share and device split), reconcile lessons to it, and where a lesson deliberately uses a different month, say so in the text. The device contradiction (06 vs 09) is the most important because the two lessons draw opposite recommendations from it.

## Depth and coverage gaps
- **Set budgets, bidding strategies, and targeting for a stated campaign goal** (lesson 06): the freeze-week protocol is described but never worked from data. Addressed by project dm230-x01.
- **Design a valid A/B test on ads or landing pages and interpret the result** (lesson 10): all practice results are clean. Real tests break on tracking and peeking; addressed by dm230-x02, which includes a double-counting defect that flips the verdict.
- **Implement conversion tracking and verify that it reports correctly** (lesson 08): the "seeded defects" exercise depends on an instructor-supplied evidence pack that does not exist in the repo. dm230-x02 partly fills this; a standalone evidence pack (debugger log, settings screenshot description, CRM export) should be authored.
- **Plan a paid social campaign and choose the audiences for it** (lesson 07): Northgate's paid social test is sized but no creative is drafted; consider a short worked creative brief.
- **Write compliant ad copy and assets that match the query and the landing page** (lesson 05): strong. Consider adding a worked price-asset/promotion-asset policy example since those carry their own rules.
- **Judge campaign performance on return on investment** (lesson 11): the practice month's answers are not provided anywhere for instructors; add an answer key.

## Proposed additional projects
- dm230-x01 Northgate First-Freeze Furnace Repair: Campaign Brief (drafted) — last-winter data, freeze-week sizing, build, compliance, protocol.
- dm230-x02 Northgate Form Test: Case File and A/B Test Write-Up (drafted) — reconciliation, corrected statistics, test record, client memo.
- Loom & Larder creative fatigue case: weekly data for three concepts; learners set refresh triggers and decide rotation (lesson 07).
- Ashby LinkedIn audience spec and frequency budget: filter-stack and capacity arithmetic with a sales-capacity constraint (lesson 07).
- Inherited-account audit role-play: the lesson 03 "HVAC Ads" account, with the learner presenting the audit to the owner's nephew (lesson 03).
- Location and schedule leak hunt: a 90-day location and hour report with planted leaks (lesson 06).

## Video and animation opportunities
- Why the highest bid lost (lesson 02) — whiteboard; the auction is invisible and fast, and doing the division on screen fixes the eBay model. **Draft: media/video-01-why-the-highest-bid-lost.md**
- Mining the search terms report (lesson 04) — screencast of the weekly routine. **Draft: media/video-02-mining-the-search-terms-report.md**
- Peeking manufactures winners (lesson 10) — Manim animation of A/A tests crossing significance. **Draft: media/animation-01-peeking-manufactures-winners.md**
- Budget versus rank (lessons 02, 06) — animated impression-share bar splitting into share, lost-to-budget, lost-to-rank, with the freeze week as the example. Not drafted.
- Message match chain (lesson 05, 09) — query to ad to page, with a break shown at each link. Not drafted.
- Conversion lag (lesson 08) — animation of conversions trickling in over 30 days for AC Repair vs Furnace Install. Not drafted.
- The CPM chain (lesson 07) — animated funnel from CPM to contribution showing how CTR and page CVR multiply. Not drafted.

## Assessment ideas
- Auction drill generator: random bids and quality indices; learners compute rank and CPC (lesson 02). Auto-gradable.
- Match-type sorter: ten queries against one keyword under three match types (lesson 04), with the caveat that platform behaviour evolves.
- Copy compliance quiz: twelve headlines, identify the policy category or "compliant" (lesson 05).
- Sample-size and run-length calculator exercise with a yes/no "can this account power it?" (lesson 10).
- Contribution reconciliation check: a report with one planted rounding error to find (lesson 11).

## Changes applied in this pass
- dm230-02, "Worked Diagnosis": typo fix (paces out).
- dm230-02, end: added "Check your understanding" (three items).
- dm230-04, "New exact keywords": aligned promotions with the stated promotion bar.
- dm230-04, "Negative keywords": rewrote the one-word negative paragraph for accuracy.
- dm230-04, "The arithmetic of the recovered spend": clarified seven junk rows versus the competitor row.
- dm230-05, "Flag it and fix it": corrected a character count (29 to 30).
- dm230-06, "Seasonality and Budget Pacing": corrected the reallocation statement with check arithmetic.
- dm230-09, "The Anatomy of a Page": diagnostic offer changed from $89 to $79 to match the ads.
- dm230-10, "Choosing the Primary Metric": "roughly 10,000 impressions".
- dm230-10, "The Test Record": MDE corrected to +50% to match the planned sample.
- dm230-11, "The Brand Search Problem": restated the overstatement with the honest range.
- dm230-11, end: added "Check your understanding" (three items).

## Open questions for the course owner
- Approve a Northgate fact sheet and decide which values win in the inconsistency table above.
- Platform facts that change often and should be re-verified each cohort (not changed in this pass): RSA limits (15 headlines/30 characters, 4 descriptions/90 characters); Ad Strength labels; match-type behaviour (close variants, phrase and broad semantics); smart-bidding treatment of bid adjustments (in particular, Google has historically applied device adjustments to target CPA as target modifiers, which lesson 06 says are ignored — verify); RLSA minimum list sizes; availability of life-event and homeownership targeting on Search; Meta default attribution setting (7-day click, 1-day view) and newer engaged-view options; Meta's ~50 events per week learning guidance; Meta homeowner targeting for the lesson 07 Northgate test (homeownership-based targeting may not be available on Meta in the US); LinkedIn objective names; "global site tag" now being called the Google tag; Google's guidance increasingly favouring enhanced conversions for leads over GCLID-only offline import, and GBRAID/WBRAID on iOS.
- Ad policy specifics (trademark use in copy, superlatives, health claims, personalized advertising) vary by country and change; lesson 05 already says so — keep the "read the policy centre before launch" instruction prominent.
- Lesson 10 test-record dates are 2024 while the rest of the course is set in 2025–2026; harmless but could be updated.
- Lesson 08 practice step 6 references an instructor evidence pack that is not in the repository.
