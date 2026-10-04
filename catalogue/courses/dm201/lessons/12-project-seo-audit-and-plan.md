---
lesson_id: dm201-12
course_id: dm201
pathway: digital-marketer
title: "Project: SEO Audit and 90-Day Plan"
order: 12
kind: project
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
  - D1-S1-C03
  - D6-S1-C01
objectives: []
---

## Goal

Produce a complete SEO audit of one real website and a defensible 90-day plan for improving its organic performance, then present both to a stakeholder who is not an SEO.

Everything in this course has been a piece of this. You have traced how a page gets crawled, indexed, and chosen. You have classified intent, built a keyword map, profiled competitors, optimized a page, restructured a site, audited the technical layer, published in a CMS, planned link acquisition, and read Search Console. The capstone asks the question a client actually asks: *given all of that, what is wrong with my site, what should we do first, and what will it be worth?*

The deliverable is a decision document, not a data dump. A findings table with forty rows and no priority order is worth less than one with twelve rows in the order they should be fixed. You are being assessed on judgment as much as on thoroughness.

## The scenario

You are the SEO specialist at an agency. A client has signed a 90-day engagement and handed you read access to their Google Search Console property and their analytics. They have one developer available for roughly eight hours a month, one writer available for roughly twenty hours a month, and no budget for paid link placements or new tooling beyond what is already in place. They want to know where organic search is leaking value and what the first quarter of work should be.

Your audit has to survive contact with those constraints. A recommendation that requires a site rebuild is not a recommendation; it is a wish.

## Choose your site

Pick one, in this order of preference:

1. **A real site you have verified access to in Google Search Console.** Your employer's site, a client's site, a non-profit you volunteer for, or your own. This is by far the best option because the measurement half of the project becomes real.
2. **A real site you do not own.** You can still audit everything visible from the outside — SERPs, page source, robots.txt, sitemaps, site structure, page speed field data in PageSpeed Insights — but you will have to state clearly in the audit which findings you could not verify without Search Console access, and substitute observable proxies. This is a legitimate variation; agencies pitch this way constantly.
3. **The Meridian Payroll scenario** used throughout this course, if your instructor supplies the data pack. Use this only if the first two are impossible, because it removes the hardest and most valuable part of the work: dealing with a site nobody designed to be convenient for you.

Whichever you choose, the site must have at least thirty indexable pages and some existing organic traffic. A brand-new site with no history cannot support the measurement sections.

For Meridian, keep the data-pack snapshot scopes intact: Jan–Mar 2026 is the healthy Performance baseline; 12 May is the dirty-sitemap example; 31 July is the submitted-URL incident audit; 12 September is the 790-URL follow-up cohort. A technical finding from one snapshot is not a current defect in another unless its evidence confirms that. Tag archives and PDFs are outside the 640 intended content URLs.

Write your choice, the access you have, and any limitations it imposes into the first page of the audit. Stating your evidence boundaries is part of the professional standard here.

## What you will hand in

| # | Deliverable | Format | Roughly |
| --- | --- | --- | --- |
| 1 | Executive summary | 1 page, prose | 400–600 words |
| 2 | Baseline performance snapshot | Table + short narrative | 1 page |
| 3 | Opportunity analysis: keyword map | Spreadsheet | 40+ rows |
| 4 | Opportunity analysis: competitor matrix and gap list | Tables | 4–6 competitors, 10+ gaps |
| 5 | Technical and indexation findings | Table | 12+ rows, triaged |
| 6 | On-page and architecture findings | Table + 3 worked page specs | 10+ rows |
| 7 | Off-page assessment | Table + narrative | 1–2 pages |
| 8 | The 90-day plan | Table + narrative | 2–3 pages |
| 9 | Measurement plan | Table | 1 page |
| 10 | Stakeholder walkthrough | Slides or a talk-track document | 10–15 minutes |

Submit as one document with appendices, plus the spreadsheet, plus the walkthrough. Name the file with the site and the date.

## Requirements

### Part A — Baseline and scope

Before you diagnose anything, establish what "now" looks like. An audit with no baseline cannot demonstrate improvement later, and a plan with no baseline has nothing to forecast against.

Required:

- A performance snapshot from the last full three months in Search Console: total clicks, total impressions, average CTR, average position. Include the same figures for the equivalent period one year earlier if the property has the history, and note explicitly if it does not.
- The same period from analytics: organic sessions, engaged sessions or equivalent, and conversions or key events attributable to organic landing pages. If conversion tracking does not exist on the site, say so and name it as a finding — it usually is one.
- A breakdown by page group. Group URLs by directory or template (`/blog/`, `/product/`, `/help/`, `/pricing`, and so on) and report clicks, impressions, and average position per group. This single table will drive most of your prioritization, because it shows you where the volume and where the waste both live.
- Device and country splits, reported only to the extent they change a conclusion.
- Indexation state from the Indexing > Pages report: how many URLs are indexed, and the top non-indexed reasons with counts.
- A scope statement: what is in this audit, what is deliberately out, and what you could not access.

Explicitly out of scope for this project, and you should say so in the scope statement rather than half-covering them: local search and map results, international targeting and hreflang, e-commerce product feeds, and paid search. Paid search in particular belongs to a different course and a different budget line; if the client raises it, note it as a referral, not a recommendation you make here.

### Part B — Opportunity analysis

This part exercises the competency in keyword research and competitive analysis, and it is the part most people rush. The audit's credibility rests on whether your targets are real.

Required:

1. **A keyword map of at least 40 rows** in the format from lesson 04: cluster, primary keyword, secondary keywords, intent classification, page type required, target URL (existing or "new"), estimated volume, difficulty estimate with its source named, business value score, current position if any, and priority. Every row must be traceable to a source — Search Console query export, SERP observation, autocomplete, a suite export, or customer language. Rows with no source are guesses and will be marked as such.
2. **Intent classification evidence** for at least ten of the clusters: for each, one line on what the live SERP actually shows and why that determines the page type. This is the check that stops you from proposing a blog post for a query that only returns product pages.
3. **A SERP-competitor set of four to six domains**, derived from appearance counts across your priority clusters, not from the client's opinion of who they compete with. Include the appearance-count table that produced the set.
4. **A competitor matrix** covering, for each competitor: which site sections rank, the page types they use per intent, typical content depth and format, publishing cadence where observable, visible internal structure, and the referring-domain picture at a category level. Label every third-party metric as a vendor estimate.
5. **A gap list of at least ten rows** with gap type (keyword, topic, format, depth, funnel coverage), the evidence, the target cluster, the page type needed, an effort estimate in writer-hours, and a go / no-go verdict with one sentence of reasoning. At least two rows must be **no-go**, with the reason stated. An analyst who finds only opportunities is not analyzing.

### Part C — Technical and indexation findings

Required: a findings table of at least twelve rows, ordered by the triage principle from lesson 08 — findings that *stop* indexing first, findings that *misdirect* indexing second, findings that *degrade* quality third.

Each row needs:

| Column | What goes in it |
| --- | --- |
| Finding | One sentence, specific. "Faceted filter URLs are crawlable and generating 4,100 near-duplicate URLs", not "crawl issues". |
| Evidence | Where you saw it: the report, the URL, the response header, the screenshot reference. |
| Severity | Blocking / misdirecting / degrading, plus scale (how many URLs). |
| Affected URLs | A count and an example set of three. |
| Fix | The specific change, written so a developer could act on it. |
| Owner | Developer, marketer, or CMS-configurable by you. |
| Effort | Hours, against the eight developer-hours a month you actually have. |

You must audit and report on, at minimum: `robots.txt` contents and correctness, robots meta and header directives, HTTP status codes across a sample crawl including redirect chains, canonical implementation, XML sitemap contents and accuracy, whether JavaScript rendering hides content or links, Core Web Vitals field data at the 75th percentile, mobile rendering parity, and HTTPS and hostname consistency.

If a check comes back clean, say so in one line. "No issues found in the sitemap" is a finding too, and it stops the reviewer wondering whether you looked.

### Part D — On-page and architecture findings

Required:

1. **A findings table of at least ten rows** covering on-page and structural problems: title and metadata weaknesses at scale, heading structure problems, thin or duplicated pages, intent mismatches between a URL and the query it ranks for, click depth problems, orphan pages, and keyword cannibalization. Cannibalization must be evidenced from Search Console data showing two URLs alternating for one query, not asserted.
2. **Three complete page specifications** in the lesson 06 format, for three pages you have chosen because they matter: one page with high impressions and poor CTR, one page in striking distance (average position roughly 11 to 20), and one page that needs to exist but does not yet. Each spec includes target cluster, new `title` with character count, new meta description, full heading outline, the substantive body changes, the slug decision, the structured data types warranted with a reason, and the internal links that should point to it.
3. **An internal link plan of at least fifteen rows**: from-page, to-page, anchor text, placement, and reason. Anchors must be descriptive and varied. If every anchor in your table is the exact target keyword, that is a defect, and it will be marked as one.
4. **A site tree** showing the current structure and the proposed structure, with click depth marked for the pages that matter.

### Part E — Off-page assessment

Required:

- A read of the current link profile from the Search Console Links report: top linking sites, top linked pages, top linking text, and what that pattern tells you. Note whether the linked pages are the pages that matter commercially — usually they are not, and that gap is itself an opportunity via internal linking.
- A check of the Manual Actions report, reported either way.
- A scored evaluation of at least eight prospect domains using the lesson 10 scorecard, with at least two rejections and their reasons.
- Two to four off-page plays selected for this specific client, each with the effort it costs, the realistic return, and the leading indicator you would watch. Every play must be compatible with Google's link spam policies and with a client who has no budget for placements. If you cannot honestly recommend link acquisition inside 90 days for this site — sometimes you cannot, because the pages are not yet worth linking to — say that and explain what has to be true first.

### Part F — The 90-day plan

This is the deliverable the client actually buys. Required:

1. **A prioritized action list** scored with an explicit model. Use impact, confidence, and effort, define your scoring bands in the document, and show the score for every action. The ranking must follow from the scores; if you override a score, say why in one line.
2. **A month-by-month schedule** across three months, with each action assigned to a month and an owner, and with the monthly totals fitting inside eight developer-hours and twenty writer-hours. If your plan exceeds the capacity, it fails — cut it and say what you cut and why.
3. **Dependencies made explicit.** Some work is ordered: you do not rewrite titles on pages that are about to be consolidated, and you do not pitch a resource page a link to an article that has not been published yet.
4. **Expected outcomes stated as ranges with assumptions**, never as single numbers and never as guarantees. Show the arithmetic. For example: "Nine striking-distance URLs currently averaging position 13.4 with 62,000 combined monthly impressions. If four of them move into positions 5–8, and those four currently account for 24,000 of the 62,000 monthly impressions, a 3 to 5 percentage-point CTR improvement gives 24,000 × 0.03 to 24,000 × 0.05 = 720–1,200 additional clicks a month. Assumptions: impressions hold flat, no competitor displacement, changes ship in month one so effect is visible in months two and three."
5. **A risk section**: what could make this plan wrong. Broad search updates, a competitor's investment, seasonality, a site migration already scheduled, the developer being pulled onto something else.

### Part G — Measurement plan

Required: a table of what you will measure, at what cadence, from which tool, and what threshold would count as a real change rather than noise. Cover at minimum the site-level baseline metrics, the per-page-group metrics, the specific pages you are changing, indexation health, and the leading indicators for the off-page plays.

Include one line per metric on what you would do if it moves the wrong way. A measurement plan with no decision rules is a reporting plan.

### Part H — Executive summary and walkthrough

The summary is one page, written for someone who will not read the appendices. It states the current position, the three things that matter most, what you propose to do about them in 90 days, what it will cost in hours, and what you expect it to be worth as a range. No jargon that is not immediately defined. No table.

The walkthrough is ten to fifteen minutes of you presenting it. Prepare for the four questions you will always be asked:

- "Why this first and not that?"
- "How confident are you in that number?"
- "How long until we see something?"
- "What happens if we do nothing?"

## Constraints

- **One site, real data.** No hypothetical sites invented for convenience.
- **Google Search Console is the assumed tool.** Free tools — PageSpeed Insights, the Rich Results Test, a browser's developer tools, Google Analytics, a free crawler tier — are all fair. If you have access to a paid suite you may use it, but every finding must also be reproducible or at least defensible without one, and every vendor metric must be labeled as an estimate.
- **Capacity limits are real**: eight developer-hours a month, twenty writer-hours a month, no paid placements, no new tooling spend.
- **No spam tactics.** Any recommendation that violates Google's spam policies — bought links, exchange schemes, private networks, doorway pages, scaled thin content, hidden text, marked-up content that is not on the page — fails the project outright regardless of the rest of its quality.
- **Every finding needs evidence.** A claim with no report name, URL, or observation behind it is an opinion. Opinions are allowed if labeled as such and used sparingly.
- **No guarantees.** Ranges with assumptions, always.
- **Out of scope**: local search, international and hreflang, product feeds, paid search, and anything requiring a rebuild the client cannot fund.
- **Anonymize if needed.** If the site is a real client's and you cannot share the name, redact the domain consistently and say so.

## Suggested schedule across the ten hours

| Hours | Work |
| --- | --- |
| 0.5 | Site selection, access check, scope statement |
| 1.5 | Part A baseline: exports, page-group table, indexation state |
| 2.0 | Part B opportunity analysis: keyword map, competitor set, gap list |
| 1.5 | Part C technical audit and findings table |
| 1.5 | Part D on-page and architecture findings, three page specs, link plan |
| 0.5 | Part E off-page assessment |
| 1.5 | Part F the 90-day plan and the arithmetic |
| 0.5 | Part G measurement plan |
| 0.5 | Part H executive summary and walkthrough prep |

The most common time sink is Part B, because it is the part where the data is messiest. If you are running long, cut the keyword map to exactly forty well-sourced rows rather than chasing eighty half-sourced ones. Coverage is not the point; defensibility is.

## What good looks like

Reviewers mark this project mostly on the quality of individual rows, so here is the standard, shown rather than described. Each example below is the same finding written badly and then written well.

### A technical finding

Weak:

```txt
Finding: Sitemap issues.
Evidence: Search Console.
Severity: High.
Fix: Fix the sitemap.
```

Strong:

```txt
Finding: In the 12 May 2026 dirty-sitemap audit, the XML sitemap lists 1,180 URLs but the site has 640 intended content pages;
         the extra 540 are 480 duplicate tag-archive URLs that all carry a
         canonical pointing elsewhere, plus 60 URLs that now return 404.
Evidence: /sitemap.xml fetched 12 May; URL count from the Sitemaps report
         ("Discovered URLs 1,180"); a spot-check of 20 non-archive URLs found 3 returning 404,
         triggering a full status check that counted the 60 dead URLs above
         (the sample percentage is not extrapolated to the sitemap). The full URL-level join to the Pages export identifies all 480 archives under
         "Alternate page with proper canonical tag"; its whole-property total
         is not this 1,180-URL sitemap cohort.
Severity: Misdirecting. Not blocking indexation of the money pages, but it
         wastes crawl attention and makes the Sitemaps report useless as a
         health signal.
Affected: 540 URLs. Examples: /blog/tag/payroll-tax/, /blog/tag/federal-payroll/, /help/old-w4/
Fix: Regenerate the sitemap to include only canonical, indexable, 200-status
         URLs. In the CMS SEO settings, exclude duplicate tag archives and any URL
         with a noindex flag. Resubmit and confirm Discovered drops to ~640.
Owner: Marketing (CMS setting), no developer time required.
Effort: 0.5 hours.
```

The difference is not length. It is that the second version can be acted on by someone who was not in the room, and it can be checked afterwards.

### A keyword map row

Weak: `payroll software | 40500 | hard | high priority`

Strong:

```csv
cluster,primary_keyword,intent,page_type,target_url,volume,volume_source,difficulty,difficulty_source,value,current_position,priority
payroll-software-smb,payroll software for small business,commercial,product,/product/payroll,12100,suite export Jan–Mar 2026,71,vendor estimate (suite),5,12.6,38
payroll-tax-deadlines,payroll tax deadlines 2026,informational,blog,/blog/payroll-tax-deadlines,14800,suite export Apr–Jun 2026,34,vendor estimate (suite),3,14.2,34
```

Priority uses lesson 04's 0–50 formula, not an ordinal rank. Row one is V5 D1 I4 B5 P4: 15 + 8 + 2 + 8 + 5 = 38. Row two is V5 D3 I3 B3 P4: 9 + 6 + 6 + 8 + 5 = 34. The 14,800 figure is vendor monthly volume; Search Console impressions are a separate measure.

Every number has a source, difficulty is labeled as an estimate, and the row says what page type the SERP demands.

### An impact estimate

Weak: "Fixing titles will increase traffic by 30%."

Strong: "Eleven `/help/` URLs average position 7.9 with 96,000 combined monthly impressions and a 1.9% CTR, well under what that position band normally returns. The titles are all the raw help-article headline with no brand or context. If a rewrite lifts CTR into the 3.5–4.5% range, that is roughly 1,500 to 2,500 additional clicks a month. Assumptions: impressions hold flat, positions do not move, changes ship in month one and are measurable from month two. Confidence: medium — the CTR gap is large and the cause is visible, but a share of these impressions may sit below the fold on feature-heavy SERPs, which would cap the gain."

### A no-go verdict

Weak: silence — the gap simply is not in the list.

Strong: "**No-go: 'best payroll software' (22,000/mo).** Every result on page one is a review or affiliate publication; the only vendor-owned page ranks eleventh and has been there for two years. A vendor's own page is structurally disadvantaged for this query. Revisit only if we can earn coverage on those publications instead, which is an off-page play, not a content play."

## Definition of done

The project is complete when every one of these is true. Check them yourself before submitting.

**Baseline and scope**

- [ ] Site named, access level stated, evidence limitations disclosed
- [ ] Three-month Search Console snapshot present with all four metrics
- [ ] Analytics organic figures present, or their absence named as a finding
- [ ] Page-group table present with clicks, impressions, and average position per group
- [ ] Indexation state reported with non-indexed reasons and counts
- [ ] Scope statement names what is out, including local, international, feeds, and paid

**Opportunity analysis**

- [ ] Keyword map has at least 40 rows and every row names its source
- [ ] Every cluster has an intent classification and a required page type
- [ ] At least ten clusters carry SERP evidence for the classification
- [ ] Competitor set derived from appearance counts, with the table shown
- [ ] Competitor matrix covers all required dimensions for 4–6 domains
- [ ] Gap list has at least ten rows, including at least two reasoned no-gos
- [ ] Every third-party metric is labeled as a vendor estimate

**Technical**

- [ ] Findings table has at least twelve rows with all seven columns filled
- [ ] Rows are ordered blocking, then misdirecting, then degrading
- [ ] `robots.txt`, robots directives, status codes, canonicals, sitemaps, rendering, Core Web Vitals, mobile parity, and HTTPS all explicitly checked
- [ ] Clean checks reported as clean rather than omitted
- [ ] Every fix is written so a developer could act on it without asking you a question

**On-page and architecture**

- [ ] Findings table has at least ten rows
- [ ] Cannibalization claims are evidenced from query-level data, not asserted
- [ ] Three complete page specs present, one per required category
- [ ] Internal link plan has at least fifteen rows with varied, descriptive anchors
- [ ] Current and proposed site trees present with click depth marked

**Off-page**

- [ ] Links report read and interpreted, not just pasted
- [ ] Manual Actions checked and reported either way
- [ ] At least eight prospects scored, at least two rejected with reasons
- [ ] Every proposed play is policy-compliant and fits a zero-placement-budget client

**Plan and measurement**

- [ ] Every action scored with a stated model; ranking follows the scores
- [ ] Month-by-month schedule fits inside 8 developer-hours and 20 writer-hours per month
- [ ] Dependencies and ordering constraints stated
- [ ] Expected outcomes given as ranges with the arithmetic and the assumptions shown
- [ ] Risk section present
- [ ] Measurement table names metric, cadence, tool, noise threshold, and decision rule

**Communication**

- [ ] Executive summary is one page, prose, jargon defined, no table
- [ ] Walkthrough runs 10–15 minutes and answers the four standard questions
- [ ] No guarantee language anywhere in the document
- [ ] No recommendation that violates search engine spam policies

## Assessment rubric

| Dimension | Weight | What full marks looks like |
| --- | --- | --- |
| Evidence quality | 20% | Every finding traceable to a named report, URL, or observation. Uncertainty labeled. Vendor estimates labeled. |
| Diagnostic accuracy | 20% | Findings are real, correctly categorized, and correctly severity-ranked. No myths. No misread metrics. |
| Opportunity analysis | 15% | Keyword map is sourced, clustered, and intent-classified. Competitor set is empirical. Gap list includes reasoned rejections. |
| Prioritization judgment | 20% | The order is defensible, fits the capacity constraint, respects dependencies, and the scoring model is explicit. |
| Arithmetic and forecasting | 10% | Impact math is shown, assumptions stated, results given as ranges. No guarantees. |
| Communication | 15% | A non-specialist could read the summary and make a decision. The walkthrough survives the four questions. |

A project that violates a spam policy, fabricates data, or presents a forecast as a guarantee does not pass regardless of its score on the other dimensions.

## Hints

**Start with the page-group table.** Grouping URLs by directory and summing clicks, impressions, and average position per group is thirty minutes of work that will tell you where the audit should spend its attention. A directory with 300,000 impressions and a 1.1% CTR is a different problem from one with 4,000 impressions at position 42, and you should know which you have before you start crawling anything.

**Export first, analyze second.** Pull your Search Console query and page exports at the start of the session and work from a spreadsheet. The interface is fine for looking; it is bad for counting. Remember that query rows will never sum to the reported totals because a large share of queries are withheld for privacy, and do not spend an hour trying to reconcile it.

**Let the SERPs settle arguments.** Whenever you are unsure whether a page type is right, whether a keyword is winnable, or whether intent has shifted, open the SERP. The results are the answer key. Screenshot or transcribe what you see so the evidence goes into the document rather than staying in your head.

**Separate "cannot be indexed" from "is not ranking".** These get conflated constantly and they are completely different problems with completely different owners. Work through indexation first; a page that is not in the index cannot have a ranking problem.

**Write the fix as an instruction, not a complaint.** "Canonical tags on paginated URLs point to page one, which prevents pages two onward from being indexed; change them to self-referencing canonicals" is actionable. "Canonical issues" is not.

**Do the capacity arithmetic early.** Total your effort estimates before you write the schedule. Almost every first draft of this plan exceeds the client's capacity by a factor of two or three, and discovering that after you have written the narrative means rewriting the narrative.

**Pick the striking-distance play if you need a quick win.** URLs already averaging positions 11 to 20 have proven relevance and need the smallest push. Improving titles, refreshing the content, and adding three internal links from strong pages is cheap, and it is the fastest honest thing you can show a client in ninety days. Say clearly that it is a first-quarter play, not a strategy.

**Do not recommend link acquisition for a page nobody would link to.** If the strongest asset on the site is a thin product page, the honest sequence is: build something worth citing, then pitch it. Saying so is a mark of judgment, not a gap in the plan.

**Report the clean checks.** Reviewers and clients both read absence as oversight. One line per clean check costs nothing and buys credibility.

**Rehearse the walkthrough out loud, once, with a timer.** The gap between a document you understand and a document you can explain in twelve minutes is larger than it looks, and closing it is the actual skill being assessed here.

**Keep a decisions log as you go.** Every time you choose between two defensible options — which competitor set, which pages to spec, which action goes in month one — write one line about why. When someone challenges the plan, that log is your answer, and reconstructing it afterwards is much harder than capturing it in the moment.
