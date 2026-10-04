---
course_id: dm201
title: "Search Engine Optimization (SEO) — Enhancement Review"
reviewed_lessons: 12
status: draft
---

## Summary
dm201 is unusually strong: technically accurate, myth-busting, and built on a single running example (Meridian Payroll) with worked arithmetic in nearly every lesson. Most of the in-lesson arithmetic checks out; five small numeric or wording errors were fixed. The biggest opportunity is **cross-lesson consistency of the Meridian dataset**: lessons were evidently written as standalone units, and several facts about the same site contradict each other between lessons (indexed counts, template traffic, number of comparison pages, the deadlines URL, author name). A learner using the instructor "data pack" in the capstone will hit these. Resolving them needs an owner decision, so they are listed as Proposed below.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm201-02 | "Crawling: fetching, politely and selectively" | Crawl-budget threshold stated as "a hundred-thousand-plus [URLs] that change daily"; Google's crawl-budget guide describes roughly 10,000+ URLs with daily-changing content (and 1M+ changing regularly). | Corrected to ten-thousand-plus. Verify against the current Google doc. | Applied |
| dm201-04 | "Seasonality, and why an average lies" | Says the 7,600 average overstates demand "March through October"; November (4,400) is also overstated and February (12,100) understated. | Corrected month ranges. | Applied |
| dm201-04 | "A worked scored table for Meridian" | "Five of those seven are existing pages"; six of the seven do-now rows are existing pages (only PayCadence alternatives, CL-004, is a build). | Corrected and cross-referenced CL-004. | Applied |
| dm201-04 | Scored table row 2 | `paycadence alternatives` shows position 29.4, which is the `paycadence pricing` position from the export; the map marks the page `to-build`, so P should arguably be 0 (score 32, next quarter not do-now). | Owner decision: either the row borrows a related query's position deliberately (say so) or the score changes. | Proposed |
| dm201-05 | Practice step 7 and "free keyword-gap comparison" | The three-way split omits the case where you already rank 1–10. | Added a one-sentence note: that is a page to defend, not a gap. | Applied |
| dm201-06 | "Full Teardown: Changes made" | Refers to "the eleven H2s shown earlier"; the outline has nine. | Corrected to nine. | Applied |
| dm201-06 | Compact table example | "Late penalty starts at 2% of the deposit" is listed for Form 941 and 940 returns; 2% is the failure-to-deposit tier, while late-filed returns carry a separate failure-to-file penalty. W-2 per-form penalty amounts are inflation-indexed. | Relabel the column "Late deposit penalty starts at" or split deposit and filing penalties; verify current IRS amounts. | Proposed |
| dm201-08 | "XML Sitemaps" | Text says the index ties together "five sitemaps" but shows three entries. | Added "(three of the five entries shown)". | Applied |
| dm201-11 | "(iii) An 18% decline isolated to one directory" | Text says 18% but the table total is 14,770 to 11,070, a 25% decline. | Changed the three "18%" references to 25%. | Applied |
| dm201-11 | "Baselines, seasonality" | "Manufacturing a 15% decline" — direction and size depend on which month is the base (about 13% or 15%). | Reworded to "a swing of roughly 13–15%". | Applied |
| dm201-12 | "What good looks like: A technical finding" | 640 + 540 + 61 does not equal 1,180; the 404 count was extrapolated from a 3-of-20 sample without saying so. | Split the 540 into about 480 archives plus about 60 404s and stated how the 404s were confirmed. | Applied |
| dm201-12 | "Suggested schedule across the ten hours" | Rows sum to 10.5 hours. | Trim one 0.75 row to 0.5 or retitle. | Proposed |

### Cross-lesson inconsistencies in the Meridian dataset (all Proposed)
| Fact | Lesson A says | Lesson B says |
|---|---|---|
| Indexed URLs | 02: 579 indexed of 790 known, 640 intended | 08: 640 submitted, 486 indexed, 154 not |
| `/templates/` performance | 03: 15,300 clicks, 7.9% CTR, ranks #2 for payroll register template | 08: "the templates section earned zero organic clicks for four months" due to a staging noindex on all 46 template pages |
| Number of comparison pages | 05: Meridian has 2 | 07 tree: 3; 08: 6 `/compare/` pages; 11: "six `/compare/` pages" |
| Blog size | 05: "41 informational blog posts and templates" | 07, 08, 09: about 310 blog posts |
| Click-depth table | 07: 447 URLs at depth 4+, "all of it is blog content" | Same lesson: the blog has 310 posts |
| Cannibalized query pages | 04: `/blog/best-payroll-software-small-business` vs `/product/payroll`, 41,600 impressions | 07: home, `/product/payroll-runs`, `/small-business-payroll`, 18,000 impressions; 11: `/product/payroll-software` vs the blog post, 16,900 impressions |
| Deadlines article URL | 02, 06, 07: `/blog/payroll-tax-deadlines` (06 explicitly says keep years out of evergreen slugs) | 09, 11: `/blog/payroll-tax-deadlines-2026`, and 09 calls that slug "good" |
| Compliance author | 06: Dana Whitfield | 09: Dana Okafor |
| January 31, 2026 deadline | 06 table: W-2 and Form 940 due February 2 (31 Jan 2026 is a Saturday) | 09 email, LinkedIn post, video script, and one-pager: "January 31"; one-pager also lists "Oct 31 — Q3 Form 941" (31 Oct 2026 is a Saturday, so due 2 Nov) |

Recommendation: add a one-page "Meridian Payroll fact sheet" to the course overview (or the capstone data pack) and reconcile each lesson to it. Where lessons describe different points in time (before and after a fix), say so explicitly in the text. The lesson 09 slug conflicts with lesson 06's own rule and is the most visible to learners.

## Depth and coverage gaps
- **Measure organic performance in Search Console and analytics and act on what it shows** (lesson 11): five excellent worked analyses, but learners never receive raw data to work. Addressed by project dm201-x01.
- **Build a prioritized keyword map from research data** (lesson 04): the clustering example uses three queries; learners need practice with borderline 2–3 overlap pairs. Addressed by dm201-x02.
- **Classify the search intent behind a query** (lesson 03): no exercise where wording and SERP disagree is pre-built; add two or three "trick" queries with mock SERPs to the practice set.
- **Apply structured data markup where a rich result is warranted** (lesson 06): `SoftwareApplication` is recommended but no JSON-LD example is given, while Organization, BreadcrumbList, and Article are. Add one.
- **Adapt one piece of content for search and for other distribution channels** (lesson 09): strong examples; consider a "bad adaptation" counter-example (blog pasted into LinkedIn) to match the course's before/after pattern.
- **Evaluate the quality of a referring domain** (lesson 10): scorecard is clear; add a calibration exercise where two learners score the same domain and compare.
- **Diagnose crawlability, speed, and mobile issues** (lesson 08): the audit table is excellent; add a short worked example of reading a robots.txt group-selection mistake (Googlebot group overriding `*`), since the lesson flags it as a common trap but never shows it.

## Proposed additional projects
- dm201-x01 Meridian Payroll: Organic Decline Case File (drafted) — inline CSV case, decision tree, ranked actions, memo.
- dm201-x02 Keyword Map for the Time-Tracking and Multi-State Launch (drafted) — clustering by overlap, intent from page-type counts, scoring.
- robots.txt and canonical "bug hunt": a deliberately broken robots.txt, two head blocks, and a sitemap extract; learners triage into tiers (lesson 08).
- Hub page brief for `/blog/payroll-taxes/`: outline, spoke list, internal-link plan (lesson 07).
- Link prospect scorecard calibration: ten described domains, score individually, then reconcile as a pair (lesson 10).
- CMS field-mapping lab: given a field table and rendered head with three planted mismatches, find them (lesson 09).

## Video and animation opportunities
- Reading the Pages report (lessons 02, 08) — screencast; classifying rows is a visual, click-through skill. **Draft: media/video-01-reading-the-pages-report.md**
- Fixing a CTR outlier (lessons 06, 11) — hybrid; shows the rule-out sequence before the rewrite. **Draft: media/video-02-fixing-a-ctr-outlier.md**
- Three gates (lesson 02) — explainer animation; time and sequential gates are invisible in static text. **Draft: media/animation-01-three-gates.md**
- SERP overlap clustering (lesson 04) — animation of two top-10 lists sliding together and matching URLs lighting up; fixes the domain-versus-URL counting trap. Not drafted.
- Pixel depth (lesson 03) — animation scrolling two SERPs side by side on a phone frame. Not drafted.
- Hub and spoke authority flow (lesson 07) — whiteboard animation of links passing value from donor pages. Not drafted.
- Render queue (lesson 08) — animation of raw HTML versus rendered DOM. Not drafted.

## Assessment ideas
- Ten-item "which gate?" quiz from Search Console status strings (lesson 02).
- Intent sort with mock SERP page-type counts, including two where wording misleads (lesson 03).
- Scoring drill: five keyword rows with band data; learners compute priority (lesson 04). Auto-gradable.
- Tier triage: twelve technical findings to sort into Tier 1/2/3 (lesson 08).
- Capstone: add a two-column rubric for the executive summary (decision clarity; ranges and assumptions) since the summary is where non-specialist communication is assessed.

## Changes applied in this pass
- dm201-02, "Crawling: fetching, politely and selectively": corrected crawl-budget threshold for daily-changing sites.
- dm201-02, end: added "Check your understanding" (four items).
- dm201-03, end: added "Check your understanding" (three items).
- dm201-04, "Seasonality, and why an average lies": corrected the over/understated month ranges.
- dm201-04, "A worked scored table for Meridian": corrected "five of seven" to "six of seven" existing pages.
- dm201-05, "The no-paid-tool path": added note on the already-ranking (1–10) case.
- dm201-06, "Full Teardown: Changes made": corrected H2 count from eleven to nine.
- dm201-08, "XML Sitemaps": clarified that three of the five sitemap entries are shown.
- dm201-11, "Baselines, seasonality": reworded the calendar-swing example.
- dm201-11, "(iii)": corrected 18% to 25% in three places to match the table.
- dm201-11, end: added "Check your understanding" (three items).
- dm201-12, "What good looks like: A technical finding": made the sitemap arithmetic add up and stated how 404s were confirmed.

## Open questions for the course owner
- Approve a canonical Meridian fact sheet and decide which version of each conflicting fact wins (see table above).
- Search Console and GA4 interface paths (Indexing > Pages labels, URL Inspection fields, Links report sections, GA4 "Advertising > Attribution", key events naming, Enhancements reports) change often. They looked right at the time of review but should be re-verified each cohort.
- Rich-result availability (FAQ restricted, HowTo removed) and the March 2024 INP replacement of FID are correct as of review; Google changes rich-result eligibility frequently.
- Lesson 02/03 references to AI overviews and zero-click behaviour are deliberately hedged; keep them hedged and date-stamp any figures added later.
- IRS penalty tiers, deposit rules, and 2026 due dates used in lessons 06 and 09 should be checked against current IRS publications before each tax year, especially weekend rollovers.
