---
lesson_id: dm201-05
course_id: dm201
pathway: digital-marketer
title: Competitive and Content Gap Analysis
order: 5
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Analyze competing sites to find realistic ranking opportunities
  - Produce a content gap list from a competitor comparison
---

## Three kinds of competitor

Ask a sales director who Meridian Payroll competes with and you get a list of companies that show up in deals. Ask Google the same question and you get a different list. Both are correct, because "competitor" means three different things and only one of them governs your SEO plan.

**Business competitors** are companies that take revenue you wanted. For Meridian: PayCadence, Wagebase, Sumner HR. They appear on the sales battlecard and in win/loss reviews.

**SERP competitors** are whoever occupies the top ten results for the queries in your keyword map. That set includes business competitors, but it also includes review publishers, comparison sites, government pages, forums, calculator tools, and accounting-industry media — organizations that will never bid against you in a deal but stand between you and the click.

**Feature competitors** are products that solve one slice of the job. A standalone time-clock app or a pay-stub generator is not trying to be a payroll platform, but it owns queries inside your map because it owns that slice.

The set that governs your plan is the **SERP competitor set**, for one blunt reason: those are the pages you must outrank. If `bizreviewsite.com` holds three of the top ten slots on your most valuable cluster, then the shape of your opportunity is determined by `bizreviewsite.com`, whatever the battlecard says.

This mismatch is normal and it is worth naming explicitly for stakeholders before you present anything, because "why isn't Sumner HR at the top of your analysis?" is a question you will be asked. The honest answer is that Sumner HR wins deals and loses SERPs, and those are separate problems.

You come into this lesson with the keyword map from lesson 04: clusters, page types, and priority scores. That map is the input. Nothing here re-opens keyword expansion or scoring, and nothing here covers what you do to a page once you decide to build it — that is lesson 06 for the page, lesson 10 for anything off-site.

## Building the competitor set empirically

Do not guess and do not accept a list. Derive the set from the SERPs your map already points at.

The procedure:

1. Take your top 10–15 priority clusters from the keyword map.
2. For each, search the primary keyword in a clean browser session on the same day, and record the top 10 organic URLs. Ignore ads and note SERP features separately.
3. Count, per domain: total appearances, appearances in the top 3, median position, and how many distinct clusters it shows up in.
4. Rank by appearances, then break ties on top-3 count.
5. Cut to a workable four to six.

Meridian sampled 12 clusters, giving 120 organic slots:

```txt
DOMAIN                          APPEARANCES  TOP-3  MEDIAN POS  CLUSTERS (of 12)
paycadence.com                       26        11       4.0           11
bizreviewsite.com                    18         7       5.0            9
wagebase.com                         17         5       6.0           10
smallbizportal.com                   11         2       7.0            8
sumnerhr.com                          9         2       7.0            7
techroundup.com                       8         3       5.5            6
meridianpayroll.com                   7         1       8.0            6
accountingtoday-style-pub.com         6         2       6.0            5
payrollcostcalc.com                   3         1       6.0            3
forumsite.com                         3         0       8.5            3
irs.gov                               2         2       2.0            2
all other domains (9 of them)        10         0       8.0            —
```

Read the count columns together, not separately. Appearances say *breadth*; top-3 count says *strength*. `wagebase.com` appears in more clusters than `bizreviewsite.com` (10 versus 9) but converts far fewer of those appearances into top-3 slots (5 versus 7). Breadth without strength usually means a site with wide coverage and thin individual pages, which is a very different opponent from a site with narrow coverage and dominant pages.

Three things in that table should change how you think:

- **Meridian is present in half the clusters at a median position of 8.0.** Presence is not the problem; strength is. That reframes the whole plan from "we need content" to "we need better content on pages we already have."
- **Sumner HR is fifth, below two publishers.** The sales team's number-three business competitor is a minor SERP competitor. Say so out loud.
- **`irs.gov` appears twice, both times in the top 3.** You are not going to outrank the IRS on a tax-form query. Clusters where a government page owns the top of the SERP are clusters where your realistic ceiling is position 4, and you should price the work accordingly.

The cut for Meridian: **PayCadence, Wagebase, Sumner HR** as vendor competitors and **bizreviewsite.com, smallbizportal.com** as publisher competitors. Five is enough. Beyond six the analysis stops changing decisions and starts consuming days.

One note on publishers. You cannot "beat" a review publisher in the sense of taking its business — it has none you want. But you can outrank it on specific queries, and more usefully you can understand what it satisfies that you do not, which is the format gap discussed later.

## Profiling a competitor

Once the set is cut, profile each one on dimensions that predict what you would have to do to displace them.

**Which site sections rank.** Not the whole domain — the folders. Sample the URLs you recorded and bucket them by path. If 70% of a competitor's ranking URLs live under `/blog/`, its organic strength is editorial. If they live under `/product/` and `/pricing`, its strength is commercial pages, which is a much harder wall for you because those pages also convert.

Bucketing PayCadence's 26 recorded appearances by first path segment:

```txt
/compare/     9   commercial comparison pages, median position 3.0
/blog/        8   editorial, median position 5.5
/product/     5   feature pages, median position 4.0
/help/        3   help center, median position 7.0
/pricing      1   median position 2.0
```

That distribution is the whole strategy in five lines. PayCadence's center of gravity is `/compare/`, its comparison pages outrank its own blog, and its help center trails everything. Meridian's equivalent bucket, by contrast, puts 4 of 7 appearances under `/templates/` — free downloads, top of funnel, no commercial intent behind them.

**Page type per intent.** For each cluster, note which page type the competitor points at it. Competitors reveal their strategy in this mapping, and a competitor pointing a blog post at a commercial query is often leaving an opening: a blog post that ranks on a buying query is usually there because nothing better exists, not because a blog post is the right answer.

**Content depth and format.** Length is a weak proxy on its own, but *structure* is informative: does the winning page have a comparison table, a calculator, downloadable assets, screenshots, an FAQ, original data? Record the format, not just the word count.

**Publishing cadence.** Sample 20 dated URLs in the competitor's blog and note the spread. Four posts a month is a team; four a year is a contractor. This tells you what pace you must sustain, not just what you must build once.

**Visible internal structure.** Read the main navigation, the footer, and any hub pages. Navigation is a public declaration of what a site considers important, and hub pages tell you how they cluster topics. You can see this on any site for free in ten minutes.

**Referring-domain profile at category level.** Do not chase individual links here. Categorize: is the competitor's link profile mostly industry media, mostly directories, mostly customer sites, mostly its own tools being cited? A profile built on cited original data is a different opponent from one built on directory listings. Vendor tools give you counts and estimated strength; treat both as inputs, not verdicts.

**Brand strength and branded search share.** Look at how much of a competitor's visible organic footprint is its own brand name. You can approximate this for free: search the brand, see how many of the top ten results the brand itself owns, and check whether "brand + review", "brand + pricing", "brand + alternatives" appear in autocomplete. A competitor whose brand fills eight of its own top ten and generates a full set of modifier suggestions has demand you cannot copy quickly.

For your own site, Search Console makes this measurable rather than estimated: filter the Performance report to `Query contains` your brand name and compare those clicks to the total. Meridian's brand filter returns 6,900 of 41,300 clicks — about 17% branded, which is low and consistent with a company whose organic footprint is built on free templates rather than on people looking for Meridian specifically. Low branded share is a weakness, but it also means the "PayCadence alternatives" style of query is a genuine opening: you compete for a competitor's brand demand by having the better comparison page, which is a legitimate and widely used tactic.

**What a paid competitive suite adds.** If your employer licenses one, a competitive analysis suite will give you a competitor's estimated ranking keyword set, an automatic keyword-gap report between two or more domains, an estimated organic traffic figure per domain and per page, and a referring-domain list with vendor strength scores. The genuine saving is coverage and speed: an estimated ranking-keyword export takes seconds and would take you days by hand. What it does not do is tell you *why* a page wins, which is the part that decides your plan. Every suite output should be treated as a candidate list you then verify by opening the SERP and the page.

A standing caution: every third-party number you use here — Domain Rating, Domain Authority, estimated traffic, keyword difficulty — is a **vendor estimate produced by a model**. None of them is a Google signal, Google does not publish or use them, and two vendors will disagree about the same site. They are useful for sorting a list. They are not evidence, and you should never write "we cannot rank because their DR is 68" in a document a stakeholder reads.

## The competitor matrix

Put the profile in one table so it can be argued with. Meridian against its three vendor competitors:

| Dimension | Meridian | PayCadence | Wagebase | Sumner HR |
| --- | --- | --- | --- | --- |
| Indexable URLs (sampled) | ~640 | ~2,900 | ~1,400 | ~410 |
| SERP appearances (12 clusters) | 7 | 26 | 17 | 9 |
| Top-3 appearances | 1 | 11 | 5 | 2 |
| Strongest section | `/templates/` | `/compare/` and `/blog/` | `/blog/` | `/product/` |
| Comparison pages | 2 | 34 | 11 | 0 |
| Help center indexed | partial | full | full | none |
| Blog cadence (last 6 mo) | 3/mo | 11/mo | 6/mo | 1/mo |
| Original data or tools | none | salary calculator, annual report | pay-schedule tool | none |
| Referring-domain character | customer sites, a few directories | industry media citing their report | mixed media and directories | directories |
| Branded search visibility | low | high | medium | medium |
| Obvious weakness | thin commercial pages | help center is shallow | comparison pages are old | almost no content operation |

Read across the rows and the plan writes itself. PayCadence wins because it runs an actual content operation with 34 comparison pages, a cited annual report, and eleven posts a month; you are not going to out-publish it this quarter. Wagebase wins on breadth but its comparison pages are stale. Sumner HR barely competes organically at all — it is a sales-led company, and any cluster where Sumner HR is the only vendor ranking is a soft cluster.

Meridian's row is the interesting one: 640 URLs producing 7 appearances and 1 top-3 slot, with its single strongest section being free templates. That is a site whose best asset is its giveaway, not its product pages.

## Five kinds of gap

A "content gap" is not one thing. Naming the type tells you what to build and how much it costs.

### 1. Keyword gap

**Definition.** Queries where a competitor ranks and you do not appear at all.

**Detection.** Two paths. With a paid suite, pull the competitor's ranking keyword set and subtract yours. Without one: for each of your priority clusters, list the competitor URLs you recorded, then check your own Search Console query export for those query shapes. Anything with competitor presence and zero rows in your export is a keyword gap.

**Worked example.** Meridian's Search Console export has no rows containing "garnishment." PayCadence has `/help/wage-garnishment-guide` ranking 3rd on `payroll garnishment rules` and 5th on `how to process a wage garnishment`. Meridian's own site-search logs show 540 internal searches for "garnishment" with zero results. Gap confirmed from two independent directions.

### 2. Topic gap

**Definition.** An entire subject area the competitor covers and you do not — broader than a single query.

**Detection.** Read the competitor's navigation and hub pages, then list their topic groupings against yours. A sitemap read (below) makes this fast.

**Worked example.** Wagebase has a nine-page hub at `/guides/multi-state-payroll/` covering nexus, reciprocity, remote employees, and state registration. Meridian has one paragraph on a product page. That is not one missing article; it is a missing topic, and it maps to a cluster Meridian scored at 29 in the keyword map.

### 3. Format gap

**Definition.** You cover the topic, but not in the format the SERP rewards.

**Detection.** For each priority cluster, record the *format* of the top five results: comparison table, calculator, downloadable template, video, forum thread, listicle, product page. Compare to what you have.

**Worked example.** On `payroll software pricing`, four of the top five results are pages with a visible price table plus a per-employee cost breakdown, and one is a calculator at `payrollcostcalc.com`. Meridian's `/pricing` shows three plan tiers and a "contact us" tier with no per-employee arithmetic anywhere. Meridian covers pricing; it does not cover it in the format that ranks.

### 4. Depth gap

**Definition.** Same topic, same format, but the competitor's page answers substantially more of the question.

**Detection.** Take the top-ranking page and your page, list the sub-questions each answers, and diff the lists. Depth is measured in questions resolved, not words.

**Worked example.** On `switch payroll providers`, PayCadence's guide answers: when in the year to switch, what data to export, what happens to year-to-date totals, how to handle open garnishments, what to tell employees, and a timeline. Meridian's post answers three of those six and stops. Same topic, same format, half the substance — which is why Meridian sits at 11.3 and PayCadence at 2.

### 5. Funnel-coverage gap

**Definition.** You cover one stage of the buyer's journey and not the others, so you are absent from the SERPs where decisions get made.

**Detection.** Tag every cluster in your map by funnel stage, then count your existing pages per stage. Do the same for the competitor.

**Worked example.** Meridian has 41 informational blog posts and templates, 6 product pages, and 2 comparison pages. PayCadence has 34 comparison pages. Meridian is well covered at the top of the funnel and nearly absent at the comparison stage, which is exactly where buying decisions are made. That is a funnel-coverage gap, and it is the single most expensive gap on this list to leave open.

## The no-paid-tool path

Every step above works without a subscription. It takes longer and the outputs are qualitatively better, because you read the pages instead of reading a model's summary of them.

**Manual SERP sampling.** The foundation. One clean browser session, one day, top 10 organic results recorded per priority cluster. Budget about 4 minutes per query. Twelve clusters is under an hour and it is the single highest-value hour in this lesson.

**The `site:` operator.** Search `site:paycadence.com` plus a term to enumerate what a competitor has published on a subject:

```txt
site:paycadence.com compare          → 34 results, all under /compare/
site:paycadence.com garnishment      → 6 results, help center + 2 blog posts
site:paycadence.com "multi-state"    → 3 results
site:paycadence.com inurl:/pricing   → 4 results, incl. /pricing/per-employee
```

Result counts shown by any search engine are rough estimates, not inventory, so use them for shape and not for arithmetic. The URLs themselves are the real output.

**Reading the XML sitemap.** Almost every site publishes one at `/sitemap.xml` or lists it in `/robots.txt`. It is a machine-readable list of what the competitor considers worth indexing, often with last-modified dates:

```xml
<url>
  <loc>https://paycadence.com/compare/paycadence-vs-wagebase</loc>
  <lastmod>2026-05-14</lastmod>
</url>
```

Paste the sitemap into a spreadsheet, split the URLs on `/`, and pivot on the first path segment. In ten minutes you have a folder-level inventory of the competitor's whole site plus, from the last-modified dates, their refresh cadence. This is the fastest topic-gap detector that exists and it costs nothing.

**Reading navigation and hubs.** The main nav, the footer, and any `/guides/` or `/resources/` index page tell you how the competitor groups topics and which groups they consider commercially important enough to put one click from the homepage.

**Comparing your Search Console query set against the sampled SERPs.** This is the free substitute for a paid keyword-gap report, and it is more trustworthy for the queries it covers because your side of the comparison is counted data rather than modeled. Export your queries as in lesson 04, then for each competitor URL you recorded ask: do I have any query rows in this shape? Three outcomes:

```txt
competitor ranks + you have rows at position 11-30   → depth or format gap, you are close
competitor ranks + you have rows past position 30    → weak page exists, likely a rewrite
competitor ranks + you have no rows at all           → true keyword gap, needs a build
```

That three-way split is most of a gap list on its own, and it maps directly to effort: rewrite, rebuild, or build.

## Realism: can you actually rank?

A gap list without a realism filter is a wish list. Five checks, applied to each candidate.

**SERP homogeneity.** Are the top ten results all the same page type from the same class of site? A perfectly homogeneous SERP — ten vendor product pages, all from established platforms — is telling you Google has settled the question and is confident. Displacing a settled SERP requires being clearly better on the dimension it has settled on. A heterogeneous SERP — two product pages, a forum thread, a listicle, a government page, a video — is telling you Google is still unsure. Uncertainty is opportunity.

Score it quickly by counting distinct page types in the top ten:

```txt
1-2 distinct page types   settled SERP, high bar, expect a long programme
3-4 distinct page types   normal, winnable with a clearly better page
5+ distinct page types    unsettled, or the query is ambiguous — check intent before investing
```

The last case is worth a pause. A very mixed SERP sometimes means genuine opportunity and sometimes means Google cannot tell what the query wants, in which case whatever you build may satisfy only a fraction of searchers. Lesson 03's intent reading is the check to run before you commit.

**Do forums and user-generated content rank?** If a Reddit-style thread or a Q&A page holds a top-ten slot, Google could not find a good enough purpose-built page. That is the clearest opening signal there is. On `payroll software for 10 employees`, `forumsite.com/thread/payroll-recommendations` sits at position 8 — a business with a real answer should be able to take that slot.

**Are the ranking pages strong at page level, or coasting on the domain?** This distinction decides most go/no-go calls. A thin 500-word page on a very large domain outranking better pages is coasting: the page itself is beatable, the domain is doing the work, and a genuinely better page from a smaller site can displace it over time. A page with original data, a working tool, deep coverage, and visible investment is strong at page level, and beating it means out-investing it. Judge this by opening the page and reading it, not by looking up a vendor score.

**How much resource does the winning page represent?** Estimate honestly. PayCadence's comparison pages carry a feature matrix, screenshots, and migration notes each — call it three to five days of work per page including design and review. If you cannot commit that, do not put the cluster in this quarter's plan.

**Time to result.** Give ranges with reasons, never dates:

| Situation | Typical range | Why |
| --- | --- | --- |
| Improving a page already at 8–15 | 4–10 weeks | Already crawled, indexed, and trusted for the topic; you are changing quality, not identity |
| New page, low-homogeneity SERP, few strong pages | 3–6 months | Needs discovery, indexing, and a period of Google testing it against incumbents |
| New page, homogeneous commercial SERP | 9–18 months, may not arrive | Incumbents have accumulated links and engagement over years and are still working |
| Any cluster where a government or reference site owns the top 3 | ceiling is position 4 | Those results rarely move for informational queries |

These are typical ranges observed across sites, not promises. Anything can be knocked sideways by an algorithm update, a competitor's investment, or a technical problem on your own site. Say that in the document.

## The gap list

The deliverable is a table someone can act on. Columns: gap type, evidence, target cluster, page type needed, estimated effort, and a go / no-go verdict with reasoning.

| # | Gap type | Evidence | Target cluster | Page type needed | Effort | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Funnel coverage | PayCadence has 34 `/compare/` pages, Meridian has 2; comparison SERPs have no Meridian presence | PayCadence competitive | Comparison page | 4 days | **Go** — highest-value stage, competitor proves the format works |
| 2 | Depth | PayCadence's switching guide answers 6 sub-questions, Meridian's answers 3; positions 2 vs 11.3 | Provider migration | Rewrite existing blog post | 2 days | **Go** — page exists at 11.3, cheapest possible win |
| 3 | Format | 4 of top 5 on pricing show per-employee cost tables; one is a calculator; `/pricing` shows tiers only | Pricing | Add cost breakdown to `/pricing` | 3 days | **Go** — commercial page, small change, position 7.9 already |
| 4 | Keyword | 540 zero-result internal searches for "garnishment"; PayCadence ranks 3rd; Meridian has no rows | Garnishments | Help-center article | 1.5 days | **Go** — proven internal demand, low competition |
| 5 | Topic | Wagebase runs a 9-page multi-state hub; Meridian has one paragraph | Multi-state payroll | Hub plus 4 supporting pages | 9 days | **Go** — but Q2, not now; scope is a project not a page |
| 6 | Format | `forumsite.com` holds position 8 on a core commercial cluster | Company size fit | Improve `/product/payroll-small-teams` | 2 days | **Go** — a forum thread ranking is an open door |
| 7 | Depth | Wagebase comparison pages last modified 2024 per sitemap | Wagebase competitive | Comparison page | 4 days | **Go** — stale incumbent, favourable timing |
| 8 | Keyword | Meridian shows 14,100 impressions at position 48.2, no dedicated page | Certified payroll | Help-center article | 2 days | **Go** — demand counted, not estimated |
| 9 | Funnel coverage | No page addressing "is it worth switching mid-year" though sales hears it weekly | Provider migration | Supporting blog post | 1 day | **Go** — cheap, supports gap 2 |
| 10 | Topic | `irs.gov` and two payroll-tax publishers own the top 3 on federal deposit-schedule queries | Payroll tax deposits | Reference article | 3 days | **No-go** — see below |
| 11 | Format | Top 3 on `payroll cost calculator` are interactive tools; Meridian has none | Payroll cost | Interactive calculator | 12+ days eng. | **No-go this quarter** — needs engineering; revisit as a roadmap item |
| 12 | Depth | PayCadence's annual industry report is cited by trade media | Category authority | Original research | 20+ days | **No-go this quarter** — real opportunity, wrong sequence; build the comparison layer first |

### The worked no-go: row 10

Take row 10 seriously, because knowing when not to build is the harder half of this skill.

The cluster is `payroll tax deposit schedule` and its siblings, around 3,600 estimated searches a month — respectable volume, plausibly relevant to a payroll company. Here is why the verdict is no-go.

**The SERP is homogeneous and settled.** All ten results are reference-style explainers. Positions 1 and 2 are `irs.gov` pages; position 3 is a long-standing payroll-tax publication. There is no forum result, no video, no listicle. Google is not uncertain here.

**The top results are strong at page level, not coasting.** The IRS pages are the primary source. Every other page on the SERP is a derivative of them. You cannot be more authoritative about federal deposit schedules than the agency that sets them, and no amount of page quality changes that.

**The realistic ceiling is low.** With positions 1–3 effectively fixed, Meridian's best plausible outcome is position 4 or 5. At that depth on an informational query, expect a click-through rate in the low single digits — call it 4% of 3,600, roughly 145 sessions a month.

**The business value is low.** This is a problem-aware query. Someone checking a deposit schedule is doing a compliance task, not choosing software. At Meridian's observed problem-aware conversion behavior, 145 sessions a month is a fraction of a trial.

**The cost is not low.** Three days to write, plus a standing obligation to keep it accurate every time a threshold changes. Publishing tax guidance you do not maintain is worse than not publishing it.

Put together: capped upside, near-zero commercial value, real recurring maintenance cost. Those same three days spent on row 4 (garnishments, 1.5 days) and row 9 (mid-year switching, 1 day) address proven internal demand at a commercial stage of the funnel. **No-go, revisit only if the page becomes a supporting asset inside a larger compliance hub.**

Note the shape of that reasoning: SERP evidence, then ceiling, then value, then cost. A no-go written that way survives contact with a stakeholder who wanted the page. "It's too competitive" does not.

One boundary note: local, international, and e-commerce product-feed competitive analysis each have their own methods and are out of scope here.

## Practice

Analyze the SERP competitors for a real site — the site your employer assigns you, or Meridian Payroll from the course dataset — and produce a competitor matrix and a gap list.

1. **Choose 12 priority clusters** from your lesson 04 keyword map. If you do not have one, use the twelve highest-volume commercial queries the site should care about.
2. **Sample the SERPs.** In a clean browser session, on one day, record the top 10 organic URLs for each cluster. Record ads and SERP features separately. Note the sample date.
3. **Build the appearance-count table.** Per domain: total appearances, top-3 appearances, median position, and how many of the 12 clusters it appears in. Sort by appearances, break ties on top-3 count.
4. **Cut to three vendor competitors and up to two publishers.** Write one sentence per cut explaining why each made the list, and one sentence naming any business competitor that did *not* make it and why.
5. **Profile each of the three.** For each: which folders rank, page type per intent, format of the winning pages, blog cadence from 20 sampled dated URLs, navigation and hub structure, referring-domain character at category level, and branded search visibility. Use the `site:` operator and the XML sitemap; label every third-party number as a vendor estimate.
6. **Build the competitor matrix** with your site as the first column and at least ten dimension rows, ending with an "obvious weakness" row for each competitor.
7. **Run the free keyword-gap comparison.** Export your Search Console queries, then classify every competitor URL you recorded into the three-way split: you rank 11–30, you rank past 30, or you have no rows at all.
8. **Write the gap list.** At least ten rows, with columns for gap type, evidence, target cluster, page type needed, estimated effort in days, and a go / no-go verdict with reasoning. Use all five gap types at least once.
9. **Apply the realism filter** to every row: SERP homogeneity, presence of forums or user-generated content, page-level strength versus domain coasting, resource represented by the winning page, and a time-to-result range with its reason.
10. **Include at least one no-go** and write its reasoning in the order used above: SERP evidence, realistic ceiling, business value, cost.

**Deliverable.** One document containing:

- **The competitor matrix** — your site plus three competitors, at least ten dimensions, with the appearance-count table that justified the competitor selection.
- **The gap list** — at least ten rows with all six columns filled, all five gap types represented, and at least one fully reasoned no-go.

You will be assessed on whether the competitor set was derived from observed SERPs rather than assumed, whether every gap row cites evidence you can point at, and whether the go/no-go verdicts are defensible to someone who disagrees with them.
