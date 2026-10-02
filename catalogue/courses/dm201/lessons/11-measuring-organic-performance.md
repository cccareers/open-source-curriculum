---
lesson_id: dm201-11
course_id: dm201
pathway: digital-marketer
title: Measuring Organic Performance
order: 11
kind: lesson
competency_ids:
  - D6-S1-C01
  - D6-S1-C03
objectives:
  - Measure organic performance in Search Console and analytics and act on what
    it shows
  - Turn an organic traffic finding into a prioritized action
---

## Measuring Organic Performance

Most SEO reporting is decoration. Someone screenshots a line going up, pastes it into a deck, and nobody learns anything. The skill that separates a competent apprentice from a decorative one is this: you can look at a set of organic numbers, work out what is really happening, and name the single next action worth doing.

This lesson teaches that skill end to end — what Search Console and analytics each measure and, just as importantly, what they cannot, how to tell a real change from noise, how to run a finding from raw numbers to a prioritized action with the arithmetic shown, and how to report it honestly to someone who will hold you to it.

We stay with Meridian Payroll throughout. The baseline: about 640 indexable URLs, and the last three months in Search Console show **41,300 clicks, 1,240,000 impressions, 3.3% average CTR, average position 18.4**.

## 1. The measurement stack and the split it enforces

There is a hard line down the middle of organic measurement, and it falls at the moment of the click.

**Search Console owns everything before the click.** It sits inside Google's search infrastructure and knows the query someone typed, whether your result was shown, where it sat, and whether it was clicked. It knows nothing about what happened next, because once the user leaves Google, Google's record ends.

**Analytics owns everything after the click.** Google Analytics 4 sits in a tag on your site. It sees a visitor arrive, what they did, whether they started a trial. It cannot see the query, because Google does not pass query data to destination sites. GA4 tells you a session came from organic search; it will not tell you which search.

Neither tool answers a full business question alone. The job is **joining them at the landing-page level**, because the landing page is the only field both systems record. That join is the core technique of this lesson.

| Question | Search Console | GA4 | How you actually answer it |
| --- | --- | --- | --- |
| Which query brought this visit? | Yes (aggregate) | No | Search Console, at the page level, never per session |
| How many people saw us and did not click? | Yes | No | Search Console impressions minus clicks |
| Where do we rank for a query? | Yes (average) | No | Search Console average position, with heavy caveats |
| Did the visitor convert? | No | Yes | GA4 key events by landing page |
| How long did they stay, what else did they read? | No | Yes | GA4 engagement metrics |
| Which query drove revenue? | Partly | Partly | Neither — you infer it by joining at landing page, and you say "inferred" |
| Did organic clicks fall because of ranking or because of demand? | Yes | No | Search Console impressions versus position, compared period to period |
| Are Search Console clicks and GA4 organic sessions the same number? | — | — | No, and they never will be. Expect a 5–20% gap. |

That last row saves you an argument every quarter. Search Console counts a click on a search result; GA4 counts a session that started on your site. Between them sit ad blockers, consent banners, bounced-before-tag-fired visits, redirects, prefetching, and different time zones and session rules. **The two numbers will not match, and neither is broken.** Make Search Console the official click number and use GA4 for what happens afterwards.

## 2. Search Console Performance in depth

The Performance report is where most of your measurement time goes. Learn it properly.

### The four metrics, exactly

- **Impressions.** Your URL appeared in a result set the user actually saw. The subtlety that trips people up: if the result requires scrolling or pagination to be visible, the impression is only counted once it is scrolled or paginated into view. **This means page-two results record far fewer impressions than the query's real demand.** Remember this — it changes the arithmetic in worked analysis (ii).
- **Clicks.** A click that took the user to your site. Clicking a result, going back, and clicking it again in the same search counts once.
- **CTR.** Clicks divided by impressions, for whatever slice you are looking at. It is computed on the filtered set, so it changes as you filter.
- **Average position.** The average of the topmost position your site occupied for each impression, across the impressions in the slice.

### The dimensions

Across the top of the report sit **Queries, Pages, Countries, Devices, Search appearance, Dates**. Each is a way of slicing the same underlying data. The habit that makes you good at this: **never read one dimension alone.** A change in the totals means nothing until you have looked at it split by page, by device, and by country.

`Search appearance` is under-used. It splits your data by result type — for Meridian that might include FAQ-style results, video results, or Discover if it is enabled. If a rich result type disappears, this is the report that shows you.

### Filtering, regex, and comparisons

Every dimension can be filtered, and filters stack. Three moves you should be fluent in:

1. **Filter to a directory.** Page → Custom → Contains → `/help/`. Everything on screen is now the help center only. This is how you isolate a section.
2. **Brand versus non-brand.** Query → Custom → Doesn't contain → `meridian`. Now you are looking at demand that does not already know who you are, which is the number that reflects your SEO work rather than your marketing spend. Do the inverse to watch branded search demand.
3. **Regex filters.** Both Query and Page support "Custom (regex)", using RE2 syntax. Useful patterns:

```txt
Questions only (query regex):
  ^(how|what|why|when|can|do|does|is|are)\b

Comparison and alternatives intent (query regex):
  (vs|versus|alternative|compare|competitor)

Two directories at once (page regex):
  /(templates|help)/

Exclude paginated and parameter URLs (page regex, "Doesn't match"):
  (\?|/page/)
```

**Date comparison** is the button next to the date range. Compare like for like: "Previous period" and "Same period last year" are both there. Use them constantly — a number with nothing to compare it to is not evidence.

### Domain property versus URL-prefix property

This catches people out. A **domain property** is verified through DNS and covers every subdomain and both protocols: `meridianpayroll.com`, `www.meridianpayroll.com`, `help.meridianpayroll.com`, http and https, all in one bucket. A **URL-prefix property** covers only URLs beginning with that exact prefix, so `https://meridianpayroll.com/` excludes the `www` version and excludes any subdomain.

Consequence: two properties on what looks like the same site will report different totals, and neither is wrong. Before you compare this month to a number in last quarter's deck, check the two numbers came from the same property type. Where you have the choice, use a domain property for reporting and keep URL-prefix properties for isolating a specific subdomain.

### The caveats, in full

These are not footnotes. Not knowing them is how apprentices report confidently wrong conclusions.

**Average position is an average of averages, and it moves for reasons that are not ranking changes.** Meridian's site average is 18.4. If Meridian publishes 40 new blog posts that debut around position 45, the site average gets worse even though nothing already ranking moved and clicks went up. Conversely, if a set of position-70 pages stops appearing entirely, the average improves while traffic falls. **Never report site-wide average position as a headline.** Report it per page, per query, and only alongside impressions and clicks.

**Roughly half of queries are withheld.** Google anonymizes queries that are rare enough to identify an individual. Those impressions and clicks are in your totals, but the query rows are missing. So **the query rows never sum to the total**, sometimes by more than half. This is normal, permanent, and not a bug. Say "of the queries Search Console shows us" in any report where the distinction matters.

**The window is 16 months.** Data older than that is gone. If you want year-over-year comparisons next year, export and archive monthly, starting now.

**Data lags one to two days**, and the most recent day or two is often incomplete. Never diagnose from yesterday. Give it 72 hours.

**A filtered total is not a subset of the unfiltered total.** Filter to queries containing "payroll" and the clicks shown will be far below the corresponding share of the site total, because anonymized queries cannot match any query filter. Similarly, average position under a filter is computed over the filtered impressions only, so it is a different statistic, not a slice of the same one. **Do not do arithmetic across filtered and unfiltered views.**

### Exporting and working in a spreadsheet

The web interface caps what you can see and cannot join anything. Real work happens in a spreadsheet.

The Export button (top right) offers Google Sheets, Excel, and CSV, and exports the currently filtered view with all its tabs — queries, pages, countries, devices, dates — as separate sheets. It is capped around 1,000 rows per tab: enough for most page-level analysis, not enough for query-level work on a large site. Two free ways past the cap: pull narrower slices (one directory, one month at a time) and stack them, or connect the property to **Looker Studio**, which is free, reads Search Console directly, handles more rows, and can email a scheduled report.

The standard sheet is one row per URL: `url`, `clicks`, `impressions`, `ctr`, `position`, the previous-period equivalents, computed deltas, then GA4 columns joined by URL. Add a `page_group` column — `/help/`, `/blog/`, `/templates/`, `/compare/`, `/product/`, `/pricing` — because almost every useful conclusion comes from grouping, not from individual URLs.

## 3. Search Console beyond Performance

Three other reports matter for measurement. Each belongs to a different lesson for the *fixing*; here you are only reading them.

**Indexing > Pages** is a health metric to track over time. It splits your URLs into indexed and not-indexed, with a reason for each non-indexed bucket: "Crawled – currently not indexed", "Discovered – currently not indexed", "Excluded by 'noindex' tag", "Duplicate without user-selected canonical", "Not found (404)", "Page with redirect", and others. Meridian has about 640 indexable URLs; write down the indexed count each month. A sudden move in either direction is one of the fastest ways to spot a technical regression, as worked analysis (iii) shows. Lesson 08 owns fixing what you find here.

**Links** gives you top linking sites, top linked pages, and top linking text. For measurement you watch the referring-domain count and its composition month to month, not the total. Lesson 10 owns acquisition.

**Manual Actions** should say "No issues detected". Check it monthly and on day one of any site you inherit. Lesson 10 covers what a manual action means and what reconsideration involves.

## 4. Analytics 4 for organic

GA4 answers the after-the-click half. Four things you need to get right.

**How the organic channel is defined, and how it breaks.** GA4 assigns each session a default channel group from its source and medium. "Organic Search" means the medium is `organic` and the source is recognized as a search engine. That definition breaks in ordinary ways:

- A link that should be organic arrives with UTM parameters and gets bucketed by the UTM instead.
- A redirect chain, an app browser, or a strict privacy setting strips the referrer, and the session lands in **Direct**.
- A source GA4 does not recognize as a search engine lands in **Unassigned** or **Referral**.
- Someone tags an internal link with UTMs, restarting attribution mid-visit and stealing credit from the original source.

That last one is the most common self-inflicted measurement wound. **Never put UTM parameters on internal links.**

**The UTM point from lesson 09.** When you distribute a post to a newsletter or social with UTM tags — `utm_medium=email`, `utm_medium=social` — those sessions land in Email and Organic Social, *not* Organic Search. That is correct and you must keep it that way. Organic Search must never be credited with distribution traffic; if it is, you will conclude SEO is working when what is working is your newsletter. When you report "organic grew 14%", be able to state that the growth is in the Organic Search channel specifically.

**Sessions, users, and engaged sessions.** A *user* is a browser or device identifier. A *session* is a group of events starting with `session_start`, ending after 30 minutes of inactivity by default. An *engaged session* lasted longer than 10 seconds, had a key event, or had 2+ page views. Engaged sessions are usually the more honest denominator for content pages, because a 4-second bounce is not a visit in any meaningful sense.

**Key events and the attribution caveat.** GA4 counts key events (formerly conversions) as events, and an event can fire more than once per session, so key event counts are not visitor counts. More importantly, the default acquisition reports use last-click attribution, which systematically undercredits organic in a considered purchase. A Meridian buyer reads `/help/payroll-tax-deadlines` from a search on Tuesday, returns via a branded search Thursday, clicks a newsletter link the following week, and starts a trial. Last-click gives the trial to Email. The Advertising > Attribution section lets you compare models; the honest way to report is to show both the last-click and assisted views and say which one you used.

**Two more caveats.** *Thresholding*: when Google Signals is enabled and volumes are low, GA4 withholds rows to prevent identifying individuals, so small segments can silently under-report — a notice icon appears on the report. *Definition drift*: default channel groupings have changed between GA4 versions and can be customised, so a year-over-year comparison may be comparing two different definitions of "organic".

## 5. Choosing the right metric per page type

The commonest reporting mistake is applying one metric to every page. A help article and a pricing page do different jobs.

| Page type | Primary metric | Secondary metric | Metric that will mislead you |
| --- | --- | --- | --- |
| Help articles (`/help/`) | Non-brand clicks, and support-ticket deflection | Engaged sessions | Trial starts — these readers are usually existing customers, so a 0.2% conversion rate looks like failure and is not |
| Blog posts (`/blog/`) | Non-brand clicks and impression growth | Scroll or engaged-session rate, plus links earned | Bounce-equivalent metrics — an informational query answered in 40 seconds is a success |
| Comparison pages (`/compare/`) | Trial starts | CTR at position, because these pages compete on the SERP snippet | Raw sessions — this is a small, high-value audience and volume is the wrong ambition |
| Templates (`/templates/`) | Downloads and email captures, plus referring domains earned | Assisted key events over 90 days | Direct trial conversion rate — see worked analysis (iv) |
| Pricing (`/pricing`) | Trial starts and trial-start rate | Branded impressions as a demand proxy | Organic clicks as a target — most pricing traffic arrives internally, and chasing organic clicks here distorts the page |

Write down the primary metric for each page group *before* you look at the data. Choose it afterwards and you will choose the one that flatters you.

## 6. Baselines, seasonality, and telling a real change from noise

**Compare like for like.** Organic traffic to a B2B product like Meridian has a hard weekly cycle: weekdays high, weekends low. A 28-day comparison beats a 30-day one, because 28 days contains exactly four of each weekday. Comparing 1–31 March against 1–28 February compares 23 business days against 20, manufacturing a 15% "decline" out of the calendar alone.

**Month-over-month versus year-over-year.** Month-over-month is sensitive and noisy: it catches regressions fast and produces false alarms. Year-over-year controls for seasonality and is the number to report to executives, but it moves too slowly to catch a broken deployment. Use both. For Meridian, year-over-year is essential: payroll search demand spikes in late December and January as employers handle year-end, and again around quarterly tax deadlines, so a January-versus-November comparison is meaningless.

**Minimum detectable change.** Before you react, ask whether this is bigger than normal week-to-week variation. Meridian's 41,300 clicks per quarter is roughly 3,180 a week. If normal variation is ±6%, anything inside ±190 clicks is noise. A 4% week is not a finding; a 22% week is. For a single URL getting 40 clicks a month almost nothing is a finding, so group small pages before analysing them.

**Segment before concluding.** Split any total change by **device**, **country**, and **page group** before naming a cause. A "12% decline" that is entirely mobile is a different problem from one spread evenly. A decline confined to one country is often a SERP-layout or competitor change in that market. A decline confined to one directory is almost always something you did.

Here is the diagnostic sequence, as a tree. Work it top to bottom and stop at the first branch the evidence supports.

```txt
ORGANIC CLICKS DROPPED. START HERE.
|
+-- Q0. Is the drop older than 3 days?
|      NO  -> STOP. Search Console lags 1-2 days. Wait.
|      YES -> continue
|
+-- Q1. Did IMPRESSIONS fall too?
|
|   NO (impressions flat/up, clicks down) -> it is a CTR problem
|   |    +-- Position also flat?
|   |    |     YES -> SERP-FEATURE CHANGE or SNIPPET CHANGE
|   |    |            Evidence: search the query yourself; look for a new
|   |    |            AI/feature block, more ads, a competitor's better
|   |    |            snippet. Check Search appearance dimension for a
|   |    |            result type that vanished. Confirm your title/meta
|   |    |            were not rewritten in a deploy.
|   |    +-- Position got worse -> go to Q2
|
|   YES (impressions fell) -> continue
|
+-- Q2. Is the drop confined to ONE page group / directory?
|
|   YES -> SITE CHANGE or TECHNICAL REGRESSION
|   |    Evidence for technical: Indexing > Pages shows the indexed count
|   |    for that directory falling, or a not-indexed reason spiking
|   |    ("Excluded by 'noindex'", "Not found (404)", "Page with
|   |    redirect"). URL Inspection on 3 sample URLs confirms.
|   |    Evidence for site change: the deploy log shows a template,
|   |    URL, or navigation change dated to the drop. -> lesson 08 / 09
|
|   NO (spread across the whole site) -> continue
|
+-- Q3. Does GA4 organic disagree with Search Console clicks?
|
|   GA4 down, Search Console FLAT -> TRACKING BREAK, not a traffic loss
|   |    Evidence: tag missing on the affected template, consent banner
|   |    change, GA4 property/stream edit, or traffic reclassified into
|   |    Direct or Unassigned. Check channel totals: if Direct rose by
|   |    about what Organic lost, it is attribution, not traffic.
|
|   Both down together -> continue
|
+-- Q4. Did the same drop happen this week last year?
|
|   YES -> SEASONAL. Evidence: year-over-year curve shows the same
|   |      shape; impressions fell but average position held; the
|   |      decline is in non-brand informational queries.
|
|   NO -> continue
|
+-- Q5. Did position drop across many unrelated queries and pages at once,
        starting on a single date, with competitors moving too?
        YES -> likely a BROAD GOOGLE UPDATE
               Evidence: a sharp, dated, site-wide position shift; Google
               has confirmed a ranking update covering that date; the same
               dates show movement for PayCadence and Wagebase on the
               queries you track manually. Do NOT conclude this first --
               it is the diagnosis of last resort, and it is the one
               people reach for to avoid finding their own mistake.
```

That last warning matters. "It was an update" is the most over-used diagnosis in SEO, and it is usually reached before anyone checks the Pages report.

## 7. Five worked analyses

Each of these runs from raw numbers, through diagnosis, to **one** prioritized action with the expected impact shown as arithmetic.

### (i) Position 6.8, 41,000 impressions, 1.4% CTR — a click-through problem

| Metric | `/compare/meridian-vs-paycadence` | Meridian pages at position 6–8 |
| --- | --- | --- |
| Impressions (90 days) | 41,000 | — |
| Clicks | 574 | — |
| CTR | 1.4% | 4.1% (site benchmark) |
| Average position | 6.8 | 6–8 |

**Diagnosis.** The page ranks fine. Position 6.8 means page one, and 41,000 impressions confirm real demand. But comparable Meridian pages at the same position earn 4.1% and this one earns 1.4% — a third of the rate. That is not a ranking problem, it is a *result-appearance* problem: the snippet is not persuading people to click.

Rule out the alternatives first. Check the Search appearance dimension for a result type that disappeared. Search the query manually to see whether a feature block or several ad slots sit above the organic results and depress CTR for everyone — if so, 1.4% may be the realistic ceiling and the finding is dead. Check the device split, because good desktop CTR with terrible mobile CTR points at a truncated title. And remember 6.8 is an average: this page may sit at 3 for some queries and 14 for others, so open its query breakdown before assuming a stable position.

Assume those checks pass and the title is a generic "Meridian Payroll | Compare".

**Action:** rewrite the title and meta description for this page (lesson 06 owns the method).

**Expected impact.**

```txt
Current:  41,000 impressions x 1.4%  =   574 clicks / 90 days
Benchmark:41,000 impressions x 4.1%  = 1,681 clicks / 90 days
Gap                                  = 1,107 clicks

Do not claim the gap. Claim a partial close.
Assume the rewrite recovers 50% of the gap:  +554 clicks / 90 days
                                             ~185 clicks / month

At the /compare/ page's measured 3.4% trial-start rate:
  554 x 3.4% = ~19 trials over 90 days

Effort: about 1 hour.
```

Nineteen trials for one hour of work, on a page nobody was worried about. That is why CTR analysis outranks almost everything else in the backlog.

### (ii) 23 URLs in positions 11–20 — the striking-distance play

Filter Performance to position between 11 and 20, export, sort by impressions.

| URL group (top 8 of 23) | Impressions (90d) | Clicks | CTR | Avg position |
| --- | --- | --- | --- | --- |
| `/blog/payroll-tax-deadlines-2026` | 11,400 | 154 | 1.4% | 11.6 |
| `/blog/semimonthly-vs-biweekly` | 8,900 | 98 | 1.1% | 12.9 |
| `/help/correcting-a-payroll-run` | 6,700 | 74 | 1.1% | 13.4 |
| `/templates/new-hire-checklist` | 5,200 | 47 | 0.9% | 14.8 |
| `/blog/payroll-for-seasonal-staff` | 4,300 | 39 | 0.9% | 15.2 |
| `/compare/meridian-vs-wagebase` | 3,600 | 36 | 1.0% | 12.1 |
| `/help/w2-vs-1099-basics` | 2,300 | 18 | 0.8% | 16.9 |
| `/blog/first-payroll-checklist` | 1,600 | 11 | 0.7% | 18.0 |
| **Subtotal (8 URLs)** | **44,000** | **477** | **1.1%** | **13.6** |
| Remaining 15 URLs | 24,000 | 212 | 0.9% | 16.4 |

**Diagnosis.** These pages already rank; they are on the wrong side of the page break. They need incremental improvement — better intent match, stronger internal links, refreshed content — not new pages. This is the highest-leverage cluster on most sites.

**Expected impact, with the impression subtlety made explicit.** Because impressions are only counted once a result is scrolled or paginated into view, page-two URLs record far fewer impressions than their query's real demand. Moving to page one lifts *both* impressions and CTR, and you must model both.

```txt
Baseline, 8 URLs:      44,000 impressions,  477 clicks (1.1%)

Assume 5 of the 8 reach positions 6-9 (be conservative:
you will not move all of them, and some will move and slip back).

Those 5 currently:     ~36,600 impressions,  ~412 clicks

Impression uplift from page 2 -> page 1: assume 2.0x
  (range 1.5x - 3.0x; this is the least certain number here)
  36,600 x 2.0 = 73,200 impressions

CTR at positions 6-9, Meridian's own benchmark: 3.8%
  73,200 x 3.8% = 2,782 clicks / 90 days

Gain = 2,782 - 412 = +2,370 clicks / 90 days  (~790 / month)

Sensitivity, because the multiplier is a guess:
  at 1.5x uplift -> 54,900 x 3.8% = 2,086 -> gain +1,674
  at 3.0x uplift -> 109,800 x 3.8% = 4,172 -> gain +3,760

Report as: "+1,700 to +3,800 clicks per quarter if 5 of 8 move
to page one, with the range driven by the impression uplift."

Effort: about 4 hours per URL x 8 = 32 hours.
```

Always show the sensitivity range when a step in your arithmetic is an assumption. A single number implies a precision you do not have.

### (iii) An 18% decline isolated to one directory

Site organic clicks fell 18% month over month. Segment by page group first.

| Page group | Clicks, prior month | Clicks, this month | Change |
| --- | --- | --- | --- |
| `/blog/` | 6,900 | 6,780 | −2% |
| `/help/` | 4,100 | 590 | **−86%** |
| `/templates/` | 2,050 | 2,010 | −2% |
| `/compare/` | 480 | 470 | −2% |
| `/product/`, `/pricing`, `/` | 1,240 | 1,220 | −2% |
| **Total** | **14,770** | **11,070** | **−25%** |

**Diagnosis.** The site-wide "18%" was an average hiding a catastrophe in one directory and nothing anywhere else — everything except `/help/` moved within noise. Working the tree: impressions fell too (Q1 → yes) and the drop is confined to one directory (Q2 → yes), which points at a site change or technical regression, not an algorithm update.

Confirm it in **Indexing > Pages**, filtered to `/help/`:

| Pages report bucket, `/help/` | Prior month | This month |
| --- | --- | --- |
| Indexed | 186 | 14 |
| Excluded by 'noindex' tag | 3 | 175 |
| Crawled – currently not indexed | 8 | 8 |

That is unambiguous. Run **URL Inspection** on three sample help URLs; each will report exclusion by a `noindex` tag, and the live test will show the tag in the served HTML. Then check the deploy log for a release dated to the start of the decline. The usual cause is a staging configuration promoted to production, putting `noindex` on a whole template.

**Action:** remove the `noindex` from the help article template and request validation in the Pages report. Lesson 08 owns the fix and the validation flow.

**Expected impact.**

```txt
Lost: 4,100 - 590 = 3,510 clicks / month

Recovery is not instant. Google must recrawl and reindex 175 URLs.
Expect a staged return over 2-6 weeks, depending on crawl frequency
for that section. Do not promise a date.

Expected recovery: 85-100% of the 3,510 clicks within 6 weeks.
Rankings usually return close to where they were when the page was
simply hidden rather than devalued, but "usually" is not "always"
and you should say so.

Effort: about 1 hour of engineering plus verification.
```

One hour to recover roughly 3,500 clicks a month. Notice that this finding was invisible in the site total — a mild 18% dip — and became obvious the moment it was segmented by directory. **Always segment before you conclude.**

### (iv) A template page with traffic and near-zero conversions

| Metric | `/templates/payroll-register-template` |
| --- | --- |
| Organic sessions / month (GA4) | 8,400 |
| Engaged session rate | 71% |
| Average engagement time | 2m 14s |
| Trial starts | 11 |
| Trial-start rate | 0.13% |
| Site benchmark trial-start rate | 2.1% |
| Referring domains earned (Search Console Links) | 34 |

**Diagnosis.** The temptation is to call this page a failure and cut it. That is wrong, for a reason visible in the data: 71% engaged sessions and 2m 14s of engagement mean the page is doing exactly what visitors want. They searched for a free payroll register form, they got one, and they are satisfied. They are not shopping for payroll software today, and no amount of optimisation makes a form-downloader into a buyer this week.

This is an **intent and page-type mismatch in the measurement, not in the page.** You applied the pricing page's metric to a top-of-funnel asset — and the table in section 5 says explicitly that direct trial conversion rate is the misleading metric for templates. Meanwhile 34 referring domains is a strong result that no conversion report was showing you.

**Action:** change the measured outcome and add one appropriate next step — an email capture for a related resource, plus a contextual in-page link to `/product/payroll-software` for the minority who are shopping. Do not gate the download; gating destroys both the links and the goodwill.

**Expected impact.**

```txt
8,400 sessions x 3.5% email capture rate = 294 emails / month
  (3.5% is Meridian's measured rate on comparable ungated assets)

Historical: 4% of resource-list emails start a trial within 90 days
  294 x 4% = ~12 trials / month from nurture

Plus contextual product link, 1.5% click-through:
  8,400 x 1.5% = 126 product-page visits
  126 x 6% trial rate on /product/ = ~8 trials / month

Total: ~20 trials / month vs the 11 currently recorded.

And the honest framing for the report: this page's PRIMARY job is
downloads and links (34 referring domains, see lesson 10). Trials
are a secondary benefit. Report it against downloads.

Effort: about 6 hours.
```

### (v) Two URLs alternating for one query — cannibalization

Filter Performance to the exact query `payroll software for small business`, then switch to the Pages tab.

| URL | Impressions (90d) | Clicks | Avg position |
| --- | --- | --- | --- |
| `/product/payroll-software` | 9,100 | 74 | 12.4 |
| `/blog/best-payroll-software-small-business` | 7,800 | 61 | 14.1 |

**Diagnosis.** Two of your own URLs are competing for one query, and neither is winning. Google is uncertain which page answers it, and the signals — internal links, external links, relevance — are split across both.

**How to confirm it, because two URLs on one query is not automatically cannibalization.** Sometimes both legitimately rank in the same result set, which is fine. The confirming evidence is *alternation*: export the query filtered by day, with the page dimension, and read the daily pattern.

```txt
Day    /product/payroll-software    /blog/best-payroll-software...
----   -------------------------    -----------------------------
Mar 03      pos 11.8, 142 impr            -- not shown --
Mar 04      pos 12.1, 138 impr            -- not shown --
Mar 05      -- not shown --               pos 13.9, 129 impr
Mar 06      -- not shown --               pos 14.4, 121 impr
Mar 07      -- not shown --               pos 14.0, 133 impr
Mar 08      pos 12.6, 130 impr            -- not shown --
Mar 09      pos 11.9, 141 impr            -- not shown --
Mar 10      -- not shown --               pos 13.7, 126 impr
```

They swap; they rarely appear together. That is the fingerprint. If both appeared on most days at stable, different positions, you would have two legitimate results and no problem.

**Action:** consolidate. Pick the page whose type matches the query's intent — this query is commercial-investigational, so `/product/payroll-software` wins — redirect the blog post to it, fold any genuinely unique content across, and repoint the internal links (lesson 07 owns the internal linking method).

**Expected impact.**

```txt
Combined today: 16,900 impressions, 135 clicks, ~0.8% CTR

Consolidating merges the split signals. Assume the single page
lands at position 8-10 rather than 12-14.

Impressions after consolidation (page 1 visibility, 2.0x on the
merged base of 16,900):        ~33,800
CTR at positions 8-10:            3.1%
  33,800 x 3.1% = ~1,048 clicks / 90 days

Gain = 1,048 - 135 = +913 clicks / 90 days (~304 / month)

Confidence is MODERATE, not high. Consolidation usually helps and
occasionally does nothing, and the position estimate is the weakest
link in this chain. State it as "+400 to +1,000 clicks per quarter".

Effort: about 3 hours, plus a redirect that must be monitored
for 30 days.
```

## 8. Prioritizing the resulting actions

Five findings, one backlog, limited hours. You need a scoring model so the ordering is defensible rather than a matter of taste.

Score each finding 1–5 on three axes, then compute:

```txt
Priority score = (Impact x Confidence) / Effort

Impact     1 = under 100 clicks/month   5 = over 2,000 clicks/month
Confidence 1 = speculative              5 = mechanism proven in the data
Effort     1 = under 2 hours            5 = over 40 hours
```

Applied to the five findings:

| # | Finding | Action | Impact | Conf. | Effort | Score | Rank |
| --- | --- | --- | --- | --- | --- | --- | --- |
| iii | `/help/` noindex regression | Remove `noindex`, request validation | 4 | 5 | 1 | **20.0** | 1 |
| i | Compare page 1.4% CTR at position 6.8 | Rewrite title and meta | 4 | 4 | 1 | **16.0** | 2 |
| ii-a | Striking distance, first 3 URLs | Refresh and re-link 3 pages | 4 | 3 | 2 | **6.0** | 3 |
| v | Cannibalized commercial query | Consolidate and redirect | 3 | 3 | 2 | **4.5** | 4 |
| ii-b | Striking distance, remaining 5 URLs | Refresh and re-link 5 pages | 4 | 3 | 3 | **4.0** | 5 |
| iv | Template conversion mismatch | Change metric, add email capture | 2 | 2 | 3 | **1.33** | 6 |

Three things to take from that table.

**A regression fix beats an opportunity every time.** Finding (iii) has neither the largest impact nor the best story, but it is certain and takes an hour. Recovering something you broke is cheaper than earning something new.

**Splitting a large item changes its priority, legitimately.** Finding (ii) scored 3.75 as one 32-hour block and was buried. Split into a first batch of three URLs it scores 6.0, moves up, and teaches you whether the play works before you commit the other 20 hours.

**A low score is not a rejection.** Finding (iv) ranks last because its click impact is small and its confidence low — but its real value was reframing how the page is measured, which cost nothing and stopped someone deleting a page that has earned 34 referring domains. Record it; do it when there is room.

## 9. Reporting

### The monthly table

| Metric | This month | Last month | Same month last year | Change (MoM) | Change (YoY) |
| --- | --- | --- | --- | --- | --- |
| Organic clicks (Search Console) | 14,820 | 11,070 | 12,940 | +33.9% | +14.5% |
| Non-brand clicks | 9,910 | 6,480 | 8,700 | +52.9% | +13.9% |
| Branded clicks | 4,910 | 4,590 | 4,240 | +7.0% | +15.8% |
| Impressions | 431,000 | 402,000 | 388,000 | +7.2% | +11.1% |
| CTR | 3.4% | 2.8% | 3.3% | +0.6pp | +0.1pp |
| Indexed pages (Pages report) | 631 | 459 | 604 | +172 | +27 |
| Organic sessions (GA4) | 13,410 | 10,020 | 11,660 | +33.8% | +15.0% |
| Engaged session rate | 68% | 67% | 66% | +1pp | +2pp |
| Organic trial starts | 281 | 209 | 244 | +34.4% | +15.2% |
| Referring domains | 412 | 406 | 361 | +6 | +51 |

Report CTR changes in **percentage points**, never as a percentage of a percentage. "CTR rose 21%" is ambiguous and usually misleading; "CTR rose from 2.8% to 3.4%, up 0.6 points" is not.

### The four-part narrative

The table is evidence. The narrative is the product. Four paragraphs, always in this order.

**What changed.** The facts, no interpretation. "Organic clicks rose 33.9% month over month to 14,820 and 14.5% year over year. Non-brand clicks rose 52.9%. Almost all of the month-over-month gain is the recovery of the help center."

**Why.** The diagnosis with its evidence. "Last month's figures were depressed by a `noindex` tag applied to the help article template in the 4 March release. It was removed on 29 March and 172 pages have been reindexed, visible in the Pages report. The correct comparison is therefore year over year, which shows underlying growth of 14.5%. The remaining month-over-month gain comes from the compare-page title rewrites, where CTR moved from 1.4% to 3.1%."

**What we did.** Actions taken and their measured effect so far, including anything that did not work. "Removed the `noindex` and requested validation. Rewrote titles and meta descriptions on six `/compare/` pages. Began refreshing the first three striking-distance URLs."

**What we will do next.** The ranked list from section 8, with hours. "Complete the striking-distance refresh for the remaining five URLs (20 hours), consolidate the cannibalized commercial query (3 hours), and add a monthly Pages-report check to the release checklist so a `noindex` regression is caught in days rather than a month."

That fourth paragraph turns a report into a plan, and its last sentence — the process change that prevents the failure recurring — is what a good manager will actually remember.

### Setting expectations, and honest forecasting

Two rules govern everything you say about the future.

**Never give a single number.** Give a range with the assumptions that produced it, and name the assumption carrying the most risk. Not "we'll hit 18,000 clicks next month" but: "16,000 to 19,000 clicks next month. The floor assumes the help center stays indexed and normal seasonality; the ceiling assumes three striking-distance refreshes reach page one. The weakest assumption is the impression uplift multiplier, modeled at 2.0x with a plausible range of 1.5x to 3.0x."

**Never promise a ranking or a timeline.** You do not control the ranking system, you cannot see competitors' plans, and updates land without notice. What you can honestly commit to are the *actions* — pages shipped, titles rewritten, regressions fixed — and the leading indicators you will watch. A stakeholder who understands the mechanism will forgive a miss; one who was promised a number will not. And when you are wrong, say so first and quickly, with the reason: forecasting is worth only what its track record is worth.

## Practice

Run a complete measurement cycle on a real property. You need Search Console access, and GA4 if you can get it — if GA4 is unavailable, do every step except the join and say so in the memo.

**Deliverable:** a findings memo containing at least five findings — each with evidence, a diagnosis, one prioritized action, and the expected-impact arithmetic — plus the ranked action list.

1. **Record the property's shape.** Domain property or URL-prefix property, and one line on what that includes and excludes. Check **Manual Actions** and record the result.
2. **Pull the last three months.** Set the range to the last 3 months, turn on comparison to the previous period, and export all tabs. Note totals for clicks, impressions, CTR, and average position.
3. **Build the working sheet.** One row per URL: `url`, `clicks`, `impressions`, `ctr`, `position`, previous-period equivalents, computed deltas, and a `page_group` you assign by directory. Group every URL.
4. **Join analytics at the landing page.** Export GA4 sessions, engaged session rate, and key events by landing page for the same period, filtered to Organic Search. Join to your sheet by URL. Note the Search Console-to-GA4 gap as a percentage and state why it exists — do not try to reconcile it.
5. **Verify the channel is clean.** Check that no internal links carry UTM parameters and that no UTM-tagged distribution traffic is counted as Organic Search. If it is, that is a measurement finding.
6. **Segment the totals.** Break the period-over-period change down by device, by country, and by page group. One sentence each on whether the change is uniform or concentrated.
7. **Set the noise floor.** Calculate normal week-to-week variation in clicks. State the minimum change you will treat as a real finding, and discard anything smaller.
8. **Find your five findings.** At least one of each: a CTR outlier (good position, poor CTR); a striking-distance cluster in positions 11–20; a page group that moved differently from the rest; a page whose traffic and conversion behavior disagree; and a query where two of your URLs appear. Use the decision tree on each.
9. **Write each finding up** in a fixed structure: a small data table, the diagnosis with the evidence that confirms it, the alternatives you ruled out and how, one action, and the expected impact as arithmetic — showing a sensitivity range wherever a step is an assumption.
10. **Score and rank all five** with `(Impact × Confidence) / Effort`. Split any item over 20 hours into a staged first batch and re-score it. Produce the ranked table with hours.
11. **Write the four-part narrative** — what changed, why, what we did, what we will do next — in under 400 words, with one forecast expressed as a range plus the assumption that carries the most risk.
12. **Name one process change** that would have caught your worst finding earlier, and say where it would live: a release checklist, a monthly report, or a monitoring alert.
