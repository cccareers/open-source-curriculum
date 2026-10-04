---
lesson_id: dm201-04
course_id: dm201
pathway: digital-marketer
title: Keyword Research
order: 4
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Build a prioritized keyword map from research data
  - Evaluate keywords on volume, difficulty, and business value
---

## The deliverable is a map, not a list

Most keyword research ends with a spreadsheet of 400 phrases sorted by search volume. That artifact is nearly useless: nobody can act on it, it does not say what to build or which page owns which phrase, and six months later nobody can say whether it worked.

The deliverable here is a **keyword map** — a table where every row is a *cluster of queries that should be answered by one page*, and names the page that will answer it. One target page per cluster. It answers four questions:

1. What do people actually type?
2. Which of those queries want the same answer, and therefore belong on one page?
3. Which page — existing or not yet built — owns that cluster?
4. In what order do we do the work?

The last question makes it a *prioritized* map rather than an inventory. You will always find more opportunity than hours, and the map forces a decision about sequence.

You classified search intent and read SERP layouts in lesson 03. Here intent is an *input* — a column in the map — while this lesson covers where keyword data comes from, what the numbers mean, how to cluster, and how to score. Lesson 05 asks who else already ranks for your map; lesson 07 stops two pages fighting over one cluster.

Throughout you work for **Meridian Payroll** (meridianpayroll.com), a small-business payroll software company with roughly 640 indexable URLs across `/`, `/pricing`, `/product/...`, `/compare/...`, `/help/...`, `/blog/...`, and `/templates/...`. Its Search Console property shows 41,300 clicks and 1,240,000 impressions over three months, a 3.3% average CTR, and an average position of 18.4. That last number is the interesting one: Meridian is *seen* enormously and clicked rarely, which is what living on page two looks like.

## Where keywords actually come from

The biggest quality difference between amateur and professional keyword research is the seed list. Amateurs start with a tool; professionals start with recorded human language and only then reach for a tool. A seed is a short phrase describing a real thing a customer wants, and you need 20 to 60 before expansion is worth doing.

### Support tickets and help-desk search

Your support queue is a transcript of every place your product confused someone. Export 90 days of ticket subjects and run a frequency count. Meridian's 3,180 tickets produced these patterns:

```txt
TICKET PHRASE PATTERN            COUNT   SEED IT PRODUCES
"how do I add a contractor"        214   pay a 1099 contractor
"wrong tax withheld"               187   payroll tax withholding error
"can I run an off-cycle check"     141   off-cycle payroll
"W-2 not showing"                  133   employee W-2 access
"change pay frequency"              96   semi-monthly vs biweekly payroll
"importing from PayCadence"         88   switch payroll providers
```

Two of those — pay frequency and switching providers — are not support problems. They are *acquisition* topics that surfaced in support because the customer came in the wrong door. Those are gold.

### Sales-call objections

Ask whoever takes demo calls for the ten objections they hear most, in the customer's words, not the sales deck's. Meridian's list:

- "Does it file the state taxes for me or do I still do that?"
- "We have people in three states."
- "We're on Wagebase and the migration scares me."
- "Is there a per-employee fee on top?"
- "Do you do time tracking or do I need something else?"

Every one maps to a query typed before anyone contacts you: "does it file the state taxes" becomes the seed *automatic payroll tax filing*, "is there a per-employee fee" becomes *payroll software pricing per employee*.

### Site search logs

If your site has an internal search box, its logs are the highest-signal free data you will get: people already on your site, telling you in their own words what they could not find. Meridian's top 10 for a quarter, zero-result queries flagged:

```txt
query                              searches   zero-result
payroll calendar 2026                  1,412   no
certified payroll                        980   YES
add contractor                           864   no
w2 download                              791   no
pay stub template                        602   YES
garnishment                              540   YES
multi state payroll                      498   YES
biweekly vs semimonthly                  341   no
tip credit                               288   YES
sui rate                                 271   YES
```

Six zero-result queries. Each is a page that does not exist and someone on your site wanted — a content gap found for free, before opening a single keyword tool.

### Community forums, review sites, and comment threads

Go where your buyers argue with each other: subreddits for small-business owners and bookkeepers, accounting forums, and the question and review sections of software review sites. You are mining for phrasing you would never have invented and for the *comparison frames* people use. Review text for PayCadence will contain lines like "we left because support was US-only during business hours" — that is *payroll software with 24/7 support* as a live query shape.

### Your vocabulary versus your customer's

This is the failure that quietly wrecks otherwise-good research. Product teams name things. Customers do not know those names.

```txt
MERIDIAN'S INTERNAL WORD       WHAT THE CUSTOMER TYPES        VOLUME GAP
payroll run                    run payroll                    customer term wins ~9x
compensation record            pay stub                       customer term wins ~40x
off-cycle disbursement         bonus check / extra paycheck   customer term wins decisively
workforce onboarding module    new hire paperwork             customer term wins ~15x
tax service tier               payroll tax filing service     roughly even
```

The rule: **write the map in the customer's vocabulary, with a translation column for internal readers.** You are not renaming the product; you are naming the page.

## Free-first expansion

Expansion turns 40 seeds into 800 candidates. Do the free work first — not because free is virtuous, but because free sources are grounded in real query streams while paid sources are grounded in models.

### Exporting queries from Search Console

The Performance report is the only tool this course assumes you have, and for a site that already ranks for anything it is the best keyword source there is: not an estimate, but a log of queries where your pages were actually shown. For Meridian:

1. Open the meridianpayroll.com property and go to **Performance → Search results**.
2. Set the date range to the last 3 months — the working default. Longer ranges give more rows but blur recent change; use 16 months only when studying seasonality.
3. Turn on all four metric tiles: Clicks, Impressions, CTR, Average position. Enable clicks alone and you miss every high-impression, zero-click query, which is exactly the opportunity set.
4. Set search type to **Web** unless you specifically want Image or Video.
5. Click the **Queries** tab under the chart.
6. Click **Export → Download CSV**. You get the top rows by clicks, capped at roughly 1,000 per export.
7. To beat the cap, re-run with a **filter**: Query contains "payroll", then "w2", then "template", one export per filter. Each filtered export gets its own allowance, so ten filters cover far more than one unfiltered pull.
8. Also export per-page: on the **Pages** tab click a URL to filter, then switch back to Queries. You now see the queries that page appears for, which is how you detect two of your pages competing for one query.

Meridian's 3-month unfiltered export begins like this:

```csv
query,clicks,impressions,ctr,position
payroll software,318,84200,0.38%,24.1
payroll software for small business,904,41600,2.17%,12.6
free payroll templates,2140,29800,7.18%,6.2
how to calculate overtime pay,61,26300,0.23%,31.7
paycadence pricing,44,18900,0.23%,29.4
semi monthly vs biweekly payroll,1830,17200,10.64%,4.8
certified payroll report,12,14100,0.09%,48.2
payroll software pricing,506,9700,5.22%,7.9
switch payroll providers,88,3100,2.84%,11.3
payroll software for 10 employees,141,2600,5.42%,6.6
```

Read that as a diagnostic, not a list. Three patterns jump out:

- **`certified payroll report`: 14,100 impressions, 12 clicks, position 48.2.** Shown for a query with no real page behind it. Demand proven, supply absent — this is a build.
- **`how to calculate overtime pay`: 26,300 impressions at position 31.7.** Same shape: enormous demand, no dedicated asset.
- **`semi monthly vs biweekly payroll`: position 4.8, 10.64% CTR.** Already working. Leave it alone and treat it as Meridian's template for "good."

**The caveat that matters most:** Search Console only shows queries you *already appear for*, and is blind by construction to everything else. If Meridian has no page about garnishments, garnishment queries never appear in this export no matter how much demand exists. It describes your current footprint, not the territory beyond it — that is what the rest of expansion is for.

Two more caveats. Rare queries are anonymized and omitted, so impression totals exceed the sum of your query rows, and that gap is real demand you cannot see individually. And position is an average, so "18.4" may be position 6 on desktop mixed with 30 on mobile.

### Autocomplete, People Also Ask, and related searches

**Autocomplete.** Type your seed, read the suggestions, then type the seed plus each letter of the alphabet — "payroll software a", "payroll software b" — recording what comes back. An alphabet sweep on one seed typically yields 60–120 real query shapes. Suggestions are somewhat personalized, so use a clean browser profile.

**People Also Ask.** The accordion of questions on the SERP; expanding one loads more, so a single seed walks into 40+ questions. Record them verbatim. For "payroll software for small business" Meridian collected:

```txt
What is the easiest payroll software for a small business?
How much does payroll software cost per employee?
Can I do payroll myself without software?
Do I need payroll software for one employee?
What happens if you file payroll taxes late?
Is QuickBooks payroll worth it for 5 employees?
How long does it take to switch payroll providers?
```

**Related searches.** The block at the bottom of the SERP. Fewer ideas than PAA, better at surfacing *adjacent* topics — the ones that show where a cluster's boundary is.

### The modifier matrix

Autocomplete gives you what exists. A modifier matrix gives you what *should* exist, systematically: cross a base term against **qualifier** (who or what constraint), **format** (shape of answer), **audience**, and stage-of-need language.

Worked matrix for the base term **payroll software**:

```txt
BASE       payroll software, payroll service, payroll system, payroll app
QUALIFIER  for small business, for 5 employees, for 10 employees, for contractors,
           for restaurants, with time tracking, with benefits, with direct deposit,
           free, cheap, simple
FORMAT     pricing, cost, reviews, comparison, alternatives, vs, checklist, template,
           guide, calculator
AUDIENCE   for accountants, for bookkeepers, for startups, for nonprofits, for franchises
STAGE      how to choose, best, top rated, switching to, migrating from, is it worth it
```

Cross-multiplying gives a candidate grid, most of it junk. The discipline is to *generate mechanically, then validate each cell against autocomplete or Search Console* — if Google will not suggest it and you have never had an impression for it, treat it as unproven. A slice:

```txt
BASE                × QUALIFIER              → CANDIDATE                                  VALIDATED?
payroll software    × for small business     → payroll software for small business        yes (autocomplete + GSC)
payroll software    × for 10 employees       → payroll software for 10 employees          yes (GSC, 2,600 impr)
payroll software    × with time tracking     → payroll software with time tracking        yes (autocomplete)
payroll software    × for restaurants        → payroll software for restaurants           yes (autocomplete)
payroll software    × for franchises         → payroll software for franchises            no  (no suggestion, no impressions)
payroll app         × for nonprofits         → payroll app for nonprofits                 no
payroll service     × alternatives           → payroll service alternatives               weak (brand form wins instead)
payroll software    × alternatives + brand   → paycadence alternatives                    yes (GSC, 18,900 impr on pricing)
```

The matrix is also how you find the *comparison* and *alternatives* space `/compare/...` serves, and the template queries feeding `/templates/...`.

### What a paid keyword suite adds

Treat a commercial keyword research suite as a category, not a product: outputs are broadly the same and your workflow should not depend on which one your employer licenses. An export typically gives you, per query:

- an **estimated monthly search volume**, usually a rounded twelve-month average
- a **difficulty score** 0–100, the vendor's model of how hard ranking looks
- a **cost-per-click estimate** sampled from advertiser auction data
- **SERP features present**, and sometimes the **top ranking URLs** with vendor link metrics
- a **parent topic** grouping, the vendor's guess at which queries share a SERP

What it really buys you is *coverage of queries you do not rank for* — Search Console's exact blind spot — plus a competitor's ranking keyword set in one action instead of by hand, sometimes twenty hours down to one. It is not a truth machine; every number there is a model output. Without one, the no-paid-tool workflow below reaches the same map with more labour and coarser volume data.

## Reading the numbers honestly

Every number you are about to put in the map is either an estimate, an average, or a vendor opinion. Knowing which is which stops you making expensive mistakes.

### What "monthly search volume" actually is

Monthly search volume is not a count of searches last month. In every mainstream source it is:

- a **rounded twelve-month average**, so a term that got 40,500 searches one month and near-nothing for eleven reports as "7,600 a month";
- **grouped across near-identical variants**, so "payroll software small business", "payroll software for small businesses", and "small business payroll software" may all report the same figure — adding them triple-counts one pool of demand;
- **rounded to buckets** — 10, 20, 30, 50, 70, 90, 110, 140, 170, 210, 260, 320, 390, 480, 590, 720, 880, 1,000, 1,300 and up, which is why volumes cluster on those numbers;
- **an estimate for anyone but Google**, modeled from clickstream panels, advertiser data, and extrapolation.

So: never sum volumes across a cluster and call the total "addressable demand," never treat 720 versus 880 as meaningful, and never let a stakeholder read a volume figure as a traffic forecast. Treat volume as *bands*, which is what the rubric below does.

### Seasonality, and why an average lies

Meridian sells to employers, and employer tasks are calendar-bound. A keyword tool reports 7,600 a month for **w2 deadline for employers**. The actual twelve months:

```txt
Jan  40,500   Apr   1,900   Jul     880   Oct   1,600
Feb  12,100   May   1,300   Aug     880   Nov   4,400
Mar   3,600   Jun   1,000   Sep   1,000   Dec  22,200

Annual total 91,360   /12 = 7,613  → reported as "7,600/mo"
```

December and January together are 62,700 searches — 68.6% of the year. The "7,600 a month" figure is wrong in every single month: it overstates demand March through November and understates it in December through February — catastrophically in December and January.

Three decisions fall out:

1. **Publish and index early.** A page live on January 5 missed December entirely and competes for January while Google is still deciding what it is. For a December–January term, publish by early November so the page gets 6–8 weeks to be crawled, indexed, and to accumulate internal links and early impressions before demand arrives.
2. **Judge seasonal pages year-over-year.** A 70% drop from January to March is the calendar, not a problem. March against last March is the only honest read.
3. **Score seasonal terms on peak, not average**, because peak is the number the page will actually meet.

Detect seasonality free: Search Console with a 16-month range on a filtered query, or a public search-trends tool. Both show the shape without absolute numbers.

### The long tail and zero-volume queries

Most search demand is not in head terms. It is spread across an enormous number of low-frequency, highly specific queries — the long tail — and a large share of daily queries have never been searched before in that exact form.

The counter-intuitive consequence: **a query reporting zero volume can still be worth targeting.** "Zero volume" means "below this vendor's reporting threshold," not "nobody searches it." Meridian's Search Console shows real impressions and clicks for queries every commercial tool reports as 0–10 a month.

A zero-volume query earns a row when it is **highly specific and commercial** ("payroll software that files 941 automatically" is a person about to buy), when it is **one of thirty siblings a single page can serve**, or when it appears in **site search logs or support tickets**, which proves humans want it whatever a vendor model says. It does not earn a row when it is a lone phrasing with no siblings and no commercial angle.

### Impressions as a truer demand signal

Where you already appear, Search Console impressions beat vendor volume estimates, because impressions are counted rather than modeled — Google actually served a result set containing your URL.

Meridian's `certified payroll report` shows 14,100 impressions in three months at position 48.2 — roughly 4,700 a month while sitting deep on page five, where almost nobody looks. True demand is therefore well above 4,700, and a vendor tool reporting "4,400 a month" is consistent with that, giving you two independent signals instead of one guess.

Limits: impressions exist only where you rank, they inflate where you rank on a page nobody scrolls to, and they are suppressed for anonymized rare queries. Best signal *inside* your footprint; vendor volume is your only signal *outside* it.

### Difficulty scores are vendor models

Every commercial keyword difficulty score is a model output, usually driven by the count and vendor-estimated strength of links pointing at currently ranking pages. So are site-level scores like Domain Rating and Domain Authority. **These are vendor estimates. They are not Google signals, Google neither publishes nor uses them, and two vendors will score the same keyword differently.**

Use them like a weather forecast: directionally useful, granularity fake. Difficulty 71 versus 74 is noise; 18 versus 74 is a real difference in the shape of the SERP. In the rubric below difficulty enters as a five-point band, never a raw number, so fake precision cannot leak into the decision. The honest replacement is to read the SERP yourself, which is lesson 05's territory.

## Commercial value

Volume tells you how many people, difficulty how hard, neither whether you want them. That is business value — the column stakeholders care about most and researchers fill in worst.

### Funnel stage and expected conversion behavior

Map every cluster to a stage and to a **specific behavior you expect** from someone who lands there. If you cannot name the behavior, the value score is speculative.

```txt
STAGE              QUERY SHAPE            MERIDIAN EXAMPLE              EXPECTED BEHAVIOR              TRIAL RATE
problem-aware      "how do I", "what is"  how to calculate overtime pay reads, maybe grabs a template  0.1-0.4%
solution-aware     category + qualifier   payroll software for restaurants  reads, views pricing       1.5-4%
vendor-comparison  "best", "vs", "alts"   paycadence alternatives       compares, starts trial          4-9%
purchase-ready     brand + pricing        meridian payroll pricing      starts trial or contacts sales  12-25%
retention/support  "how do I in Meridian" add a contractor meridian     solves problem, does not churn  n/a
```

Those rates are illustrative; replace them with your own site's numbers, which lesson 11 covers. The *ordering* is stable everywhere, and explains why a 320-a-month comparison query beats a 22,000-a-month how-to.

Arithmetic makes it concrete. `how to calculate overtime pay` at 22,200 a month: rank 4th at 8% CTR ≈ 1,780 sessions, at 0.2% ≈ 3.6 trials. `paycadence alternatives` at 880 a month: rank 3rd at 11% CTR ≈ 97 sessions, at 7% ≈ 6.8 trials. Under a twentieth of the traffic, nearly double the trials.

### Cost-per-click as a proxy for commercial intent

Cost-per-click estimates are useful for one narrow reason: **CPC is a market price advertisers pay with their own money, so it is other people's revealed judgment about how commercially valuable a click is.** "payroll software for small business" pricing at $28 while "what is a pay stub" prices at $1.10 is a crowd of advertisers with conversion data telling you which query buys.

That is all it is. Auction mechanics, budgets, Quality Score, and ad copy belong to dm230; do not put a paid-search plan in a keyword map. Two failure modes: a high CPC on a low-volume term can be two advertisers in a bidding fight rather than a market, and some valuable queries carry a low CPC because advertisers have not found them — an advantage if you can rank organically.

### The business value score you assign yourself

Vendor data does not know your margins, sales cycle, or which segment churns. The final judgment is yours, in an explicit 0–5 column with written definitions so it means the same thing when a colleague fills it in:

```txt
5  buying decision for our core segment            payroll software for 10 employees
4  vendor comparison or migration intent           paycadence alternatives, switch payroll providers
3  solution-aware, core segment, no vendor named   payroll software with time tracking
2  problem-aware, adjacent to a paid feature       certified payroll report
1  problem-aware, general audience, weak tie       how to calculate overtime pay
0  wrong audience or no path to revenue            payroll jobs near me
```

Write the definitions once in the map's documentation and hold everyone to them, or "value" becomes "whatever the person filling the cell felt that morning."

## Clustering by SERP overlap

This is the mechanism that turns a list into a map. Two queries belong on one page if **Google already treats them as wanting the same answer**, which you can observe directly: search both, record the top 10 organic URLs for each, count the URLs in both sets. High overlap means Google decided one document satisfies both; low overlap means different jobs and different pages.

The working rule: **4 or more shared URLs in the top 10 → same page. 2–3 → judgment call, look at page types. 0–1 → separate pages.**

Meridian sampled three queries on the same day in a clean browser session:

```txt
QUERY A: payroll software for small business
 1 paycadence.com/small-business-payroll
 2 wagebase.com/payroll/small-business
 3 bizreviewsite.com/best-payroll-software
 4 sumnerhr.com/products/payroll
 5 accountingtoday-style-pub.com/best-small-business-payroll
 6 paycadence.com/blog/choosing-payroll-software
 7 meridianpayroll.com/product/payroll
 8 wagebase.com/blog/payroll-guide
 9 smallbizportal.com/payroll-software-guide
10 sumnerhr.com/blog/small-business-payroll

QUERY B: best payroll software for small business
 1 bizreviewsite.com/best-payroll-software
 2 accountingtoday-style-pub.com/best-small-business-payroll
 3 smallbizportal.com/payroll-software-guide
 4 paycadence.com/small-business-payroll
 5 techroundup.com/best-payroll-2026
 6 wagebase.com/payroll/small-business
 7 bizreviewsite.com/payroll-comparison
 8 sumnerhr.com/products/payroll
 9 meridianpayroll.com/product/payroll
10 forumsite.com/thread/payroll-recommendations

QUERY C: payroll software pricing
 1 paycadence.com/pricing
 2 wagebase.com/pricing
 3 meridianpayroll.com/pricing
 4 sumnerhr.com/pricing
 5 bizreviewsite.com/payroll-software-cost
 6 payrollcostcalc.com/
 7 paycadence.com/pricing/per-employee
 8 smallbizportal.com/how-much-payroll-software-costs
 9 wagebase.com/pricing/plans
10 techroundup.com/payroll-pricing-compared
```

Now count:

```txt
A ↔ B   7 shared URLs   paycadence/small-business-payroll, wagebase/payroll/small-business,
                        bizreviewsite/best-payroll-software, accountingtoday-style/best-small-
                        business-payroll, sumnerhr/products/payroll, smallbizportal/guide,
                        meridian/product/payroll                        → SAME PAGE
A ↔ C   1 shared URL    overlap is only at domain level, not URL level  → SEPARATE PAGES
B ↔ C   1 shared URL    bizreviewsite appears twice but at two
                        different URLs, which is not an overlap         → SEPARATE PAGES
```

Note the trap in that last row: **overlap is counted at URL level, not domain level.** `bizreviewsite.com/best-payroll-software` and `bizreviewsite.com/payroll-software-cost` are two documents. Count domains and you will cluster everything into mush.

A and B are one cluster on one page; C is its own cluster on `/pricing`. Three queries, two map rows. SERPs move, so sample every query in a cluster on the same day, record the date, and re-sample borderline pairs quarterly. A paid suite's "parent topic" feature does this at scale — verify a sample by hand first, since automated clusterers reliably over-merge near-duplicate phrasings.

### Cannibalization: the failure mode clustering prevents

**Keyword cannibalization** is two or more of your own pages targeting one cluster. Google picks one per query, often inconsistently over time. Symptoms:

- Filter Search Console to one query, open the Pages tab, see two of your URLs each holding a fraction of the impressions.
- Average position oscillates — 9, then 22, then 11 — as Google swaps which page it serves.
- Neither page accumulates the internal links or engagement one consolidated page would.

Meridian has this now: `/blog/best-payroll-software-small-business` and `/product/payroll` both appear for the "payroll software for small business" cluster, the product page averaging 12.6, the blog post drifting between 18 and 34, impressions split roughly 70/30.

Mapping by cluster is the *prevention* — with one `target_url` per cluster you cannot accidentally commission two pages for one job. The *cure* for cannibalization that already exists (consolidating, redirecting, canonicalizing, rebalancing internal links) is structural work belonging to lesson 07. Here, detect it, flag it in the status column, and create no more.

Note also that topical overlap incurs no "duplicate content penalty." There is no such penalty. What happens is *filtering and canonical consolidation*: Google picks one URL to represent the content and the others do not show. The impact feels like a penalty; the mechanism is not one, and the difference matters because the fix is consolidation, not deletion out of fear.

## Prioritization: a scoring rubric

You cannot do 180 clusters; you will do maybe 12 this quarter. Scoring makes the choice defensible, repeatable, and arguable in public — a stakeholder who disagrees has to argue with a band definition, not with your taste. Five factors, each 0–5. Three read off published bands:

| Score | V — monthly volume (peak if seasonal) | D — vendor difficulty, inverted | P — current average position |
| --- | --- | --- | --- |
| 5 | 10,000+ | 0–14 | 4–10 |
| 4 | 3,000–9,999 | 15–29 | 11–20 |
| 3 | 1,000–2,999 | 30–44 | 21–40 |
| 2 | 300–999 | 45–59 | 41+ |
| 1 | 50–299 | 60–74 | not ranking, relevant page exists |
| 0 | under 50 | 75+ | no page exists |

**I — Intent match**, turning lesson 03's classification into a number: 5 = the SERP is dominated by exactly the page type we would build, on sites like ours; 3 = mixed, our page type appears but is not dominant; 1 = dominated by a page type we cannot or should not build; 0 = the query wants something we are not (jobs board, government form, news). **B — Business value**, the 0–5 scale above.

P deliberately rewards near-misses: a cluster at position 12 with a decent page is weeks of work, a cluster with no page is months. Where no vendor difficulty score exists, use the manual proxy below.

**The formula.** Weight business value and effort-to-result most heavily:

```txt
Priority = (3 × B) + (2 × I) + (2 × D) + (2 × P) + (1 × V)

Maximum possible = 15 + 10 + 10 + 10 + 5 = 50
```

Bands: **38+ do now**, **28–37 next quarter**, **18–27 backlog**, **under 18 not unless something changes**. Publish the formula alongside the map: a stakeholder who wants a term moved up must change a band with a reason, and the map re-sorts. Far better than "I think we should do this one."

### A worked scored table for Meridian

Sixteen clusters. Volume and difficulty are vendor estimates; position comes from the 3-month Search Console export.

| # | Primary keyword | Vol | KD | Pos | V | D | I | B | P | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | payroll software for 10 employees | 320 | 19 | 6.6 | 2 | 4 | 5 | 5 | 5 | **45** |
| 2 | paycadence alternatives | 880 | 24 | 29.4 | 2 | 4 | 5 | 4 | 3 | **38** |
| 3 | payroll software pricing | 1,300 | 38 | 7.9 | 3 | 3 | 5 | 5 | 5 | **44** |
| 4 | switch payroll providers | 590 | 26 | 11.3 | 2 | 4 | 4 | 4 | 4 | **38** |
| 5 | certified payroll report | 4,400 | 31 | 48.2 | 4 | 3 | 3 | 2 | 2 | **26** |
| 6 | payroll software with time tracking | 1,600 | 44 | none | 3 | 3 | 5 | 4 | 0 | **31** |
| 7 | payroll software for small business | 12,100 | 71 | 12.6 | 5 | 1 | 4 | 5 | 4 | **38** |
| 8 | best payroll software for small business | 8,100 | 74 | 21.4 | 4 | 1 | 3 | 4 | 3 | **30** |
| 9 | payroll software | 74,000 | 78 | 24.1 | 5 | 0 | 3 | 4 | 3 | **29** |
| 10 | semi monthly vs biweekly payroll | 6,600 | 15 | 4.8 | 4 | 4 | 5 | 2 | 5 | **38** |
| 11 | free payroll templates | 5,400 | 18 | 6.2 | 4 | 4 | 4 | 3 | 5 | **39** |
| 12 | how to calculate overtime pay | 22,200 | 28 | 31.7 | 5 | 4 | 3 | 1 | 3 | **28** |
| 13 | what is a pay stub | 14,800 | 12 | none | 5 | 5 | 3 | 0 | 0 | **21** |
| 14 | payroll garnishment rules | 2,900 | 22 | none | 3 | 4 | 3 | 2 | 0 | **23** |
| 15 | w2 deadline for employers (peak Jan) | 40,500 | 20 | none | 5 | 4 | 4 | 2 | 0 | **27** |
| 16 | multi state payroll | 1,900 | 41 | none | 3 | 3 | 4 | 4 | 0 | **29** |

Show your arithmetic. Two rows in full:

**Row 1 — payroll software for 10 employees.** Volume 320 is in the 300–999 band → V = 2. Vendor difficulty 19 is in 15–29 → D = 4. The SERP is vendor product and pricing pages on companies exactly like Meridian, the page type Meridian would build → I = 5. The query names Meridian's core segment and is a buying decision → B = 5. Position 6.6 is in the 4–10 band → P = 5.

```txt
Priority = 3(5) + 2(5) + 2(4) + 2(5) + 1(2)
         = 15  + 10   + 8    + 10   + 2
         = 45
```

45 sits comfortably in "do now," and rightly: top business value, an easy difficulty band, and already at position 6.6 so a modest improvement converts directly into traffic that buys.

**Row 9 — payroll software.** Volume 74,000 → V = 5, the maximum. Difficulty 78 → D = 0. The SERP mixes review publishers, category pages, and the largest vendors; Meridian's page type appears but is not dominant → I = 3. Real commercial intent but broad and not segment-specific → B = 4. Position 24.1 → P = 3.

```txt
Priority = 3(4) + 2(3) + 2(0) + 2(3) + 1(5)
         = 12  + 6    + 0    + 6    + 5
         = 29
```

29 — "next quarter" at best, despite by far the largest volume on the list. The rubric stopped the biggest number from winning, which is the whole point of scoring.

Sorted descending, the do-now set is rows 1, 3, 11, 2, 4, 7, 10 — and six of those seven are *existing pages needing work*, not new builds (only row 2, the PayCadence alternatives page, has to be built; see CL-004 in the map below). That is normal and it is good news: improving a page at position 12 is the cheapest traffic in SEO.

## The keyword map artifact

Write it down as a CSV or sheet with a fixed column spec, so it can be diffed, reviewed, and handed to whoever builds the pages.

```txt
cluster_id          string   Stable short id, e.g. CL-014. Never reused.
cluster_name        string   Human label for the job the page does
primary_keyword     string   The query the page is titled for; highest-value cluster member
secondary_keywords  string   Pipe-separated members the same page must satisfy
intent              enum     informational | commercial | transactional | navigational
page_type           enum     product | pricing | comparison | help | blog | template | hub
target_url          string   The one URL owning this cluster; "(new)" prefix if unbuilt
status              enum     live-ok | live-needs-work | cannibalized | to-build | parked
volume              integer  Primary keyword's monthly volume (peak if seasonal)
difficulty          integer  Vendor difficulty 0-100, or manual proxy score
value_score         integer  Your 0-5 business value
priority            integer  Computed 0-50 from the formula
owner               string   Person accountable
notes               string   Seasonality, cannibalization detail, SERP sample date
```

A ten-row extract of the Meridian map:

```csv
cluster_id,cluster_name,primary_keyword,secondary_keywords,intent,page_type,target_url,status,volume,difficulty,value_score,priority
CL-001,Small business payroll category,payroll software for small business,best payroll software for small business|small business payroll software|payroll software for small businesses,commercial,product,/product/payroll,cannibalized,12100,71,5,38
CL-002,Company size fit,payroll software for 10 employees,payroll software for 5 employees|payroll for 10 employees|small team payroll software,commercial,product,/product/payroll-small-teams,live-needs-work,320,19,5,45
CL-003,Pricing,payroll software pricing,payroll software cost|how much does payroll software cost|payroll cost per employee,commercial,pricing,/pricing,live-needs-work,1300,38,5,44
CL-004,PayCadence competitive,paycadence alternatives,paycadence competitors|alternatives to paycadence|paycadence vs,commercial,comparison,/compare/paycadence-alternatives,to-build,880,24,4,38
CL-005,Provider migration,switch payroll providers,how to change payroll companies|payroll migration checklist|leaving payroll provider,commercial,blog,/blog/switch-payroll-providers,live-needs-work,590,26,4,38
CL-006,Template library entry,free payroll templates,payroll template|payroll register template|pay stub template,informational,template,/templates,live-ok,5400,18,3,39
CL-007,Pay frequency explainer,semi monthly vs biweekly payroll,biweekly vs semi monthly|pay frequency comparison|24 vs 26 pay periods,informational,blog,/blog/semi-monthly-vs-biweekly-payroll,live-ok,6600,15,2,38
CL-008,Time tracking feature,payroll software with time tracking,payroll and time tracking software|integrated time clock payroll,commercial,product,(new) /product/time-tracking,to-build,1600,44,4,31
CL-009,Certified payroll,certified payroll report,wh-347 form|certified payroll requirements|prevailing wage reporting,informational,help,(new) /help/certified-payroll,to-build,4400,31,2,26
CL-010,Multi-state payroll,multi state payroll,payroll for employees in multiple states|out of state employee payroll,commercial,product,(new) /product/multi-state,to-build,1900,41,4,29
CL-011,Year-end W-2 deadlines,w2 deadline for employers,w2 filing deadline|when are w2s due|form w-2 due date,informational,blog,(new) /blog/w2-deadline-employers,to-build,40500,20,2,27
```

Two conventions worth adopting. `(new)` in `target_url` makes unbuilt pages visible in a sort, so you can count how much of the quarter is construction versus improvement. And `status = cannibalized` on CL-001 is a standing flag: that row cannot be closed until lesson 07's consolidation work is done.

## The complete no-paid-tool workflow

With no keyword suite you still get a genuine map. It costs more hours and gives coarser volume estimates; every other column comes out *better*, because you looked at the SERPs yourself.

1. **Seeds from human language.** Support tickets, sales objections, site search logs, forums, review text. Target 40 seeds, 3–4 hours.
2. **Search Console harvest.** The eight-step export above, repeated with 8–12 `Query contains` filters to break the row cap. Deduplicate. Meridian yields roughly 2,400 unique queries — real counted data.
3. **Autocomplete sweep.** Base suggestions plus an alphabet sweep on your top 15 seeds, about 10 minutes each. 600–1,200 raw candidates before dedupe.
4. **People Also Ask.** For your top 10 clusters, expand twice and record verbatim. These become secondary keywords and, in lesson 06, on-page headings.
5. **Related searches.** Bottom of each priority SERP; use them to check cluster boundaries.
6. **Modifier matrix.** Build the grid; mark each cell validated or not against steps 2–5.
7. **Volume without a suite.** Three fallbacks in order of quality: for queries you rank for, treat Search Console impressions as a floor (a query at position 30 is served far less than true demand); use a free search-trends tool for *relative* comparison between two terms, which is enough to assign a band; or rank-order by autocomplete position, since more-suggested terms are generally more-searched. You get bands, and the rubric only needs bands.
8. **Difficulty without a vendor score.** Count, out of the top 10: results from sites in your own category and size class; large national publishers or platforms; forums or user-generated content; titles only loosely about the query. Score manually — 0–1 category peers means very hard, 4+ peers plus a forum result means very winnable. More work than reading a vendor number, and a better signal, because you are observing the actual competitive set rather than a link-count model.
9. **Commercial proxy without CPC data.** Count the ads on the SERP. Four ads at the top says the market has found this query converts; zero ads on a 20,000-a-month query usually means traffic nobody has monetized.
10. **Cluster by hand.** Sample top-10 URLs per candidate, apply the 4-of-10 rule, about 4 minutes each. For 120 candidates that is roughly 8 hours — the most expensive step and the one that most improves the map.
11. **Score, sort, and write the CSV.**

Total for a site Meridian's size: 25–30 hours. A suite cuts it to roughly 10. Both produce a usable map.

## Anti-patterns

**Chasing head terms you cannot win.** "payroll software" at 74,000 a month is intoxicating and, from position 24, a two-year project. The rubric scored it 29 for a reason: the head term becomes achievable as a *consequence* of owning the long tail around it, never as a starting move.

**One page per keyword variant.** Building `/blog/payroll-software-small-business`, `/blog/best-payroll-software-small-business`, and `/blog/small-business-payroll-software` is the most common way beginners manufacture cannibalization. Overlap of 4+ means one page; the one-URL-per-cluster rule exists to stop this.

**Ignoring intent because the volume is good.** "payroll jobs" has serious volume and belongs to job seekers. Meridian could rank and gain nothing but bounce. Volume without intent match never becomes a business number.

**Optimizing for volume instead of revenue.** The overtime-pay cluster produces roughly 20 times the sessions of the PayCadence-alternatives cluster and roughly half the trials. Report both, prioritize the second, and make sure the number you show a stakeholder is trials or pipeline, not sessions.

**Translating the map into keyword stuffing.** The map says which queries a page must satisfy; it does not say to repeat them a set number of times. There is no keyword density target, no correct number of mentions, no such thing as "LSI keywords," and the meta keywords tag has not been a ranking factor for many years. The secondary-keywords column is a *coverage checklist* — does the page genuinely answer all of these? — and lesson 06 turns that into headings and copy a human wants to read.

**Building the map once and never touching it.** SERPs change, seasons turn, rankings move. Re-sample borderline clusters and refresh positions quarterly, or you will fight battles you have already won.

**Letting a number become a promise.** Never say "we will rank first in three months." Honest ranges: an existing page at position 8–15 often moves meaningfully in 4–10 weeks after real improvement; a new page in a low-difficulty space usually takes 3–6 months to settle; a competitive commercial term against established sites is a 9–18 month programme that may never fully arrive. The reasons are crawl and index latency, the time a page takes to accumulate links and engagement, and the fact that competitors are working too. Give ranges, give reasons, revise with data.

One boundary note: local search, international targeting, and e-commerce product-feed optimization each have their own keyword conventions and are out of scope for this course.

## Practice

Build a complete, prioritized keyword map for a real site — the site your employer assigns you, or Meridian Payroll if you are working from the course dataset. Minimum 40 rows.

1. **Collect seeds (target 40)** from at least three human sources: support tickets, an interview with whoever takes sales or intake calls, and site search logs. Where a source genuinely does not exist, substitute forum and review-site mining and say so. Record each seed with its source.
2. **Export Search Console queries** for the last 3 months with all four metrics enabled, then run at least six more exports using `Query contains` filters to break the row cap. Deduplicate into one sheet and note the unique-query total.
3. **Expand.** Alphabet autocomplete sweep on your ten strongest seeds, People Also Ask for the same ten, plus related searches. Build a modifier matrix for your two biggest base terms with at least four axes, marking each cell validated or unvalidated.
4. **Estimate volume and difficulty.** Use a keyword suite if you have one; otherwise use the fallbacks — impressions-as-floor, a free trends tool for relative comparison, and the manual top-10 count. State which method produced each column.
5. **Cluster.** Sample the top 10 organic URLs per candidate primary keyword and apply the 4-of-10 rule. Record your SERP sample date. Produce at least 40 clusters, and for three borderline pairs show the overlap count and your verdict.
6. **Assign intent, page type, and target URL.** One URL per cluster, no exceptions. Prefix unbuilt pages `(new)`. Flag any cluster where Search Console shows two of your URLs on one query as `cannibalized`.
7. **Score.** Assign V, D, I, B, P from the published bands and compute `Priority = 3B + 2I + 2D + 2P + V`. Do not adjust a score without changing a band definition.
8. **Sort descending** and apply the do-now / next-quarter / backlog / no bands.
9. **Check seasonality.** Identify at least one seasonal cluster, pull its 16-month shape, and record the peak month and a recommended publish date in notes.

**Deliverable.** Two artifacts, submitted together:

- **`keyword-map.csv`** — at least 40 rows using this lesson's exact column spec: `cluster_id, cluster_name, primary_keyword, secondary_keywords, intent, page_type, target_url, status, volume, difficulty, value_score, priority, owner, notes`.
- **`top-five-rationale.md`** — 400–600 words on why your top five are the top five. For each, name the evidence (volume source, difficulty method, SERP observation, business-value reasoning) and say what would have to be true for you to be wrong. Show full arithmetic for two rows, and name one high-volume cluster you deliberately deprioritized, with the reason.

You will be assessed on whether the map is genuinely a map — one target page per cluster, clusters justified by observed SERP overlap, scores traceable to published bands — and on whether the rationale distinguishes counted data from vendor estimates.
