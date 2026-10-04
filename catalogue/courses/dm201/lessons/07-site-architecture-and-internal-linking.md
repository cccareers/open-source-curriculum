---
lesson_id: dm201-07
course_id: dm201
pathway: digital-marketer
title: Site Architecture and Internal Linking
order: 7
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Design a site structure and internal linking plan that distributes authority
---

## What Architecture Is Actually For

Lesson 06 made one page as clear and clickable as it can be. That work has a ceiling, and the ceiling is set by everything around the page. A perfectly optimized article with three internal links pointing at it, buried four clicks from the home page, in a folder containing 310 unsorted posts, is a good page in a bad neighborhood.

Site architecture is how the pages relate to each other: the folder structure, the navigation, and the internal links. It does four jobs.

**Discovery.** A crawler finds pages by following links. A page nothing links to is a page that may never be found, or may be found once and then forgotten. Your sitemap helps, but links are the primary mechanism and the one that also carries signal.

**Authority distribution.** Links pass ranking signal, and internal links are the only links you fully control. The external links your site has earned land mostly on a handful of URLs — for Meridian, the home page and two templates. Internal linking is how that accumulated value reaches the pages that need it. You cannot create authority internally; you can decide where the authority you have goes.

**Topical grouping.** When ten pages about payroll taxes link to each other and to a shared parent page, you have made a structural claim: this site covers payroll taxes in depth, and this page is the center of it. Structure is evidence for a claim your content is already making.

**One obvious destination per query.** For any query you care about, exactly one page on your site should be the answer. When three pages compete, you have split your own signal, confused the ranking system, and made your reporting meaningless.

Everything in this lesson serves one of those four jobs. When a proposed change serves none of them, it is decoration.

## Depth and Click Distance

**Click depth** is the minimum number of clicks from the home page to a given URL. The home page is depth 0. A page in the primary navigation is depth 1. A page linked only from a page in the navigation is depth 2.

The working rule: **pages that matter should sit within about three clicks of the home page.** This is not a threshold Google publishes, and there is no cliff at four. It is a proxy for something real — a page reachable in two clicks is usually linked from strong pages, appears in navigation, and is easy to crawl, while a page at depth six is usually reachable only through pagination and gets neither links nor visitors.

Deep burial costs you twice. **Crawling:** search engines allocate finite attention per site, and pages that are hard to reach get crawled less often, so updates take longer to register and new pages take longer to appear. **Performance:** depth correlates with internal links, and internal links correlate with rankings, so deep pages usually underperform their content.

### Measuring click depth without paying for anything

Three options, cheapest first:

1. **Trace by hand.** For your twenty most important URLs, open the home page and count the clicks to reach each one using only links a visitor could see. Slow, but it produces the truth and it forces you to experience your own navigation. Twenty URLs takes about an hour.
2. **Free-tier desktop crawler.** The free tier of a desktop crawler typically covers 500 URLs, which is enough for most of Meridian's 640 and all of the important ones. Crawl depth is a standard column. Sort descending and read the bottom.
3. **Search Console cross-check.** The Pages report shows what Google has and has not indexed. URLs sitting in "Discovered — currently not indexed" for a long time are frequently deep, thinly linked pages. It is not a depth report, but the overlap is high.

Record the result as a distribution, not a list:

| Depth | URLs | Note |
|---|---|---|
| 0–1 | 14 | Home, primary nav, footer legal |
| 2 | 61 | Product, compare, pricing, help categories |
| 3 | 118 | Help articles, templates, recent blog posts |
| 4 | 173 | 110 blog posts plus 63 help and other content URLs |
| 5+ | 274 | 160 older blog posts plus 114 help and other content URLs |

That table is the diagnosis. 447 of the 640 audited content URLs (69.8%) are at depth 4 or deeper: 270 blog posts and 177 help and other content URLs. The remaining 40 of the 310 posts sit at depth 3. Deep burial affects more than the blog.

## URL Hierarchy

A URL path is a statement about where a page belongs. `/blog/payroll-taxes/form-941-guide` says: this is a blog post, it is about payroll taxes, it is specifically about Form 941. That is legible to a person reading the URL in a search result, and it is a structural signal about relationships.

**When should the folder structure mirror your information architecture?** When the categories are real and stable. If "payroll taxes" is a genuine subject area you will keep publishing into for years, a folder earns its keep. If your categories change every planning cycle, folders become a liability, because every reorganization becomes a redirect project.

Here the categories are real: payroll taxes, payroll basics, hiring and onboarding, benefits and deductions, and buying payroll software are stable subject areas for a payroll company.

### The problem with 310 flat posts

Every Meridian article lives directly under `/blog/`. That creates four specific problems:

1. **Depth.** With flat pagination, post number 200 sits behind eight "next page" clicks.
2. **No topical grouping.** Nothing structurally connects the eleven payroll tax articles. The site's depth on that subject is invisible.
3. **No hub to rank.** There is no page that could plausibly rank for the head term "payroll taxes," because no page owns it.
4. **Navigation is useless at that size.** A reader who finishes the deadlines article has no path to the rest of the payroll tax material except a "related posts" module or the search box.

### Restructuring: cost versus benefit

Moving 310 posts into five folders means 310 changed URLs, 310 permanent redirects, and every internal and external link now pointing through a redirect. You will see ranking volatility for weeks. Some pages will lose position and not fully recover.

That is a real cost, so weigh it honestly:

- **Restructure when** the current structure blocks something you need — no hubs, no grouping, severe depth — and the content is worth investing in. Meridian qualifies.
- **Do not restructure** for tidiness, for a marginal keyword in the path, or when the content itself is the actual problem. Reorganizing thin content produces organized thin content.
- **Consider the middle path.** You can build hub pages and internal links *without* moving a single URL. The hubs and links deliver most of the benefit; the folder change delivers the rest. If the migration risk is unacceptable this quarter, do the links now and the URLs later.

## The Hub-and-Spoke Model

A **hub** is a page that owns a head term and links out to everything beneath it. A **spoke** is a page that owns one long-tail question and links back up to the hub.

- The hub targets "payroll taxes" — broad, high volume, competitive, informational.
- The spokes target "payroll tax deadlines," "how to file Form 941," "semi-weekly vs monthly deposit schedule" — narrow, lower volume, winnable, specific.
- The hub links to every spoke. Every spoke links back to the hub. Spokes link sideways to each other where a reader would genuinely follow.

This works for three reasons that are not mysterious. Each spoke is now at most one click from a page in the navigation. Authority arriving on any spoke — from an external link, from anywhere — flows up to the hub and back out. And the cluster is a structural argument that this site covers this subject thoroughly.

A hub is a real page, not a category listing with a title on it. It should define the subject, summarize each sub-topic in a paragraph or two, link to the spoke that covers it in full, and be genuinely worth reading on its own. A hub that is just a list of links is a weak page and will be treated as one.

### The redesigned Meridian tree

```txt
meridianpayroll.com/
├── pricing
├── payroll-software-for-small-business      [new money page; redirect landing page, retarget home and feature]
├── product/
│   ├── payroll-runs
│   ├── direct-deposit
│   ├── tax-filing
│   ├── time-tracking
│   └── benefits-administration
├── compare/
│   ├── paycadence
│   ├── wagebase
│   ├── sumner-hr
│   └── ...                     [3 other existing comparisons; 6 total]
├── help/
│   ├── getting-started/          [category hub]
│   ├── running-payroll/          [category hub]
│   ├── taxes-and-filings/        [category hub]
│   └── troubleshooting/          [category hub]
├── blog/
│   ├── payroll-taxes/                        [HUB — 71 spokes]
│   │   ├── /blog/payroll-tax-deadlines [unchanged URL; linked spoke]
│   │   ├── form-941-guide
│   │   ├── deposit-schedules-explained
│   │   └── ...
│   ├── payroll-basics/                       [HUB — 84 spokes]
│   ├── hiring-and-onboarding/                [HUB — 52 spokes]
│   ├── benefits-and-deductions/              [HUB — 61 spokes]
│   └── payroll-software-buying/              [HUB — 42 spokes]
└── templates/
    ├── pay-stub-template
    ├── payroll-calendar-template
    └── direct-deposit-authorization-form
```

This is a hub-and-link plan: the indented spokes keep their current flat URLs, including `/blog/payroll-tax-deadlines`. The five spoke counts sum to 310; nesting shows relationships, not URL moves.

Five hubs, 310 spokes, no post deeper than three clicks: home → blog → hub → spoke. The five hub URLs are new pages that have to be written, and they are the most valuable writing on the plan.

## Navigation Surfaces

**Primary navigation** is the strongest internal signal you have, because it appears on every page. That also makes it the scarcest: every item you add dilutes the others. Seven to nine top-level items is a sane ceiling. Put the money pages there — Product, Pricing, Compare, Blog, Help — and resist adding "Resources," "Company," and "News" until someone can name the query they serve.

**Footer links** are legitimate and useful when they are a small, curated set: the five blog hubs, the main templates, the top help categories. They go wrong when the footer becomes a link farm of eighty items, which dilutes every link on it and signals nothing. If your footer needs a scrollbar, it is doing harm.

**Breadcrumbs** are cheap and effective: they show the reader where they are, they add a link from every spoke to its hub and to the section root, and they can render in the search result in place of the raw URL. Every page below the home page should have them. Lesson 06 covers the `BreadcrumbList` markup that makes the search-result version possible.

**Sidebar and related-content modules** are boilerplate, which means they carry less weight than a link inside the body copy, but they still work for discovery. Make "related" mean related — three to five posts from the same hub, chosen by topic rather than by publish date. A module that shows the five most recent posts regardless of subject is a random number generator.

**Pagination** should be sane and finite. Blog index pages numbered 1 through 32 push everything past page 3 out of reach. Once hubs exist, pagination stops being the primary discovery path for old posts, which is the real fix. Keep the paginated pages crawlable and linked, and do not rely on infinite scroll as the only way to reach older content.

**Faceted navigation** — filter combinations that generate a new URL per permutation — can produce thousands of near-identical crawlable pages and consume crawl budget on a site of any size. Meridian's help center filters are the risk here; lesson 08 covers the crawl directives that control it.

## Internal Linking Mechanics

**Internal links do two things at once.** They create the path a crawler follows, and they pass ranking signal to the destination. A link that only exists in a JavaScript menu or behind a form does neither reliably.

**Anchor text is context.** The words in the link tell the destination page's subject to both readers and machines. So write descriptive anchors: "semi-weekly deposit schedule" rather than "click here" or a bare URL. And write *varied* anchors — different pages should link to the same destination with different natural phrasings, because that is what honest writing produces. **Do not engineer anchor text toward an exact phrase or a target ratio.** There is no ratio to hit, chasing one produces stilted copy, and a site where 200 internal links all read "payroll software for small business" looks manipulated because it is. The test is whether the anchor accurately tells a reader where they are about to go.

**Contextual body links beat boilerplate links** in usefulness and probably in weight. A link inside a paragraph, placed where the reader has just formed the question it answers, gets clicked and is surrounded by relevant text. The same link in a sidebar module that appears on 310 pages is worth having and worth much less.

**Link from your strongest pages to the pages that need help.** Find your strongest pages the free way: Search Console's Links report shows external links by target URL, and the Performance report shows which pages earn the most clicks. Those are your donors. For Meridian, the home page, `/templates/payroll-calendar-template`, and `/blog/payroll-tax-deadlines` have accumulated the most external links. Adding one contextual link from a donor to a page that needs help is the cheapest ranking action available to you.

**Striking distance.** Filter the Search Console Performance report to queries where your average position is between 8 and 20. These pages already rank — Google has judged them relevant — and they are close enough that a modest push can move them onto page one. Sort by impressions, take the top twenty, and give each of them two or three contextual internal links from relevant, strong pages. This is the highest-return internal linking work there is, because you are not creating relevance from nothing; you are adding weight to a page the system already likes. It also fails cleanly: if a page does not move, you have spent ten minutes.

Two things not to do. Do not use `nofollow` on internal links to "sculpt PageRank" — it has not worked that way for many years and it just wastes the link. And do not chase a visible numeric PageRank score; none has existed publicly since 2016.

## Orphan Pages

An **orphan page** is a page with no internal links pointing to it. It exists, it may even be indexed, but nothing on your site connects to it. Orphans happen through content migrations, retired campaigns, deleted category pages, and help articles reachable only through a search widget.

Meridian has roughly 40 orphaned help articles — they were reachable from an old category page that was removed in a redesign, and now only the help search box finds them.

### Finding orphans for free

The method is a set difference: **URLs that exist** minus **URLs your navigation can reach**.

1. Get the list of URLs that exist. Your XML sitemap is the fastest source; export it to a spreadsheet. Cross-check against the Search Console Pages report, which shows indexed URLs, in case the sitemap is incomplete.
2. Get the list of URLs reachable by crawling. Run a free-tier crawler from the home page. It follows only links, so its output is exactly "what a crawler can reach from the front door."
3. Subtract. Anything in list 1 and not in list 2 is an orphan candidate.
4. Verify a sample by hand. Some will be false positives — pages behind a login, pages linked only from a page the crawler could not render.

### Fixing them

Do not reflexively add links. Triage first:

- **Valuable and getting impressions** (Search Console shows clicks or impressions): link it properly from its hub, its category page, and one or two contextual mentions in related posts. This is the group that pays.
- **Valuable but redundant** — it duplicates a better page: consolidate the useful parts into the better page and redirect.
- **Genuinely obsolete**: remove it and redirect to the closest live equivalent. An orphan you keep alive out of sentiment is a page you will re-audit every year.

For Meridian's 40, the likely split is roughly 25 worth linking from the new help category hubs, 10 worth merging, and 5 worth retiring.

## Keyword Cannibalization

Cannibalization is two or more of your own URLs competing for the same query. It is an architecture problem because it is caused by structure — pages built without a clear owner for each subject — and solved by structure.

### How it looks in Search Console

Open Performance, switch to the Queries tab, click a query, then switch to the Pages tab with that query filter still applied. Cannibalization shows as:

- Two or more URLs both receiving impressions for the same query.
- Average position for each that is mediocre — say 12 and 16 — where the query's total impressions suggest one page could do better.
- Positions that alternate over time: URL A is the ranking page in March, URL B in April, A again in May. That flip-flopping is the clearest fingerprint, because it means Google keeps changing its mind about which of your pages to show.

Meridian has three pages competing for "payroll software for small business": the home page, `/product/payroll-runs`, and a landing page at `/small-business-payroll`. This separately filtered architecture example covers the qualified query `payroll software for small business with automatic tax filing`, not lesson 04's broad family or lesson 11's exact head query. It gets 18,000 impressions in Jan–Mar 2026; the best of the three averages position 11.

### Three legitimate resolutions

**1. Consolidate and redirect.** Merge the pages into one, keep the strongest URL, redirect the others to it. Use when the pages serve the same intent and neither is meaningfully different. This is the highest-upside option and the most disruptive.

**2. Differentiate by intent.** Keep both pages and rewrite them so each serves a genuinely different query and intent. Use when there really are two distinct jobs hiding under one phrase — a commercial "buy payroll software" page and an informational "how to choose payroll software" guide. If you cannot state the difference in one sentence, this option is not available to you.

**3. Demote one.** Keep both, but make one clearly subordinate: remove it from navigation, point its internal links at the winner, and stop linking to it with the contested anchor. Use when the loser has value for another reason — an active paid campaign, an email destination — but should not compete organically.

### The decision rule

```txt
Do both pages serve the same intent and page type?
├── YES → Does either have external links or meaningful conversions?
│         ├── YES → Consolidate into the stronger URL, redirect the other
│         └── NO  → Consolidate into the better content, redirect the other
└── NO  → Can you state the difference in one sentence a customer would recognize?
          ├── YES → Differentiate by intent; rewrite titles, H1s, and body
          └── NO  → It is the same page. Consolidate.

If a page must stay live for a non-organic reason → Demote instead of removing.
```

For Meridian: same intent, same page type. `/small-business-payroll` has two external links and no conversions; `/product/payroll-runs` has product-specific content worth keeping as a feature page. The resolution is to build one money page at `/payroll-software-for-small-business`, redirect `/small-business-payroll` to it, and rewrite `/product/payroll-runs` to target "how payroll runs work" instead — a real feature page, no longer a competitor.

## Redirects at the Architecture Level

You will move URLs. Three rules:

**Use a 301 for permanent moves.** It tells search engines the move is permanent and the destination should inherit the old URL's signals. Lesson 08 covers status codes properly.

**Update your internal links to point at the final destination.** This is the step everyone skips. After a migration, internal links still point at old URLs, which now redirect. It works, but every one wastes a hop, slows the user, and leaves your own site advertising URLs you have retired. Redirects exist for external links and bookmarks you cannot edit. Your own links you can edit, so edit them.

**Avoid chains.** URL A redirects to B, B to C, C to D. Chains accumulate over years of small moves and they are fragile — one broken hop breaks everything behind it. After any restructure, crawl your site and check that every redirect resolves in one hop.

**Expect short-term volatility.** After a restructure of Meridian's size, expect four to eight weeks of unstable rankings and traffic before the new state is clear. Some pages will drop and recover; some will drop and not recover. Do not restructure in your highest-traffic month, do not restructure and redesign in the same week (you will not know which caused what), and record the change date so you can measure against it.

## Worked Example: Meridian End to End

### Diagnosis

| Finding | Evidence | Impact |
|---|---|---|
| 310 flat blog posts under `/blog/` | Crawl shows 274 URLs at depth 5+ | Two-thirds of the content is effectively unreachable and rarely recrawled |
| No hub for any subject | No URL ranks for "payroll taxes" or "payroll basics" | Head terms are unwinnable; no page owns them |
| 40 orphaned help articles | Sitemap minus crawl; confirmed by hand | Impressions with no path to them and no authority reaching them |
| Three pages competing for "payroll software for small business" | Performance report: positions alternate between 11 and 19 across three URLs | 18,000 quarterly impressions converting at a fraction of their potential |
| Footer holds 62 links | Manual count | Every footer link diluted; signals nothing |
| Site average position 18.4 | Search Console, three months | Consistent with wide, shallow coverage and weak internal support |

### The plan

1. Create five hub pages, written as substantial standalone pages, not link lists.
2. Keep the 310 posts at their existing flat `/blog/` URLs. Organize them through the five hubs and add reciprocal hub–spoke internal links; no post URL migration or redirects are needed.
3. Build the money page at `/payroll-software-for-small-business`; redirect `/small-business-payroll` to it; repurpose `/product/payroll-runs` as a feature page.
4. Add breadcrumbs sitewide.
5. Cut the footer from 62 links to 18: five hubs, three templates, four help categories, six legal and company links.
6. Link the 25 salvageable orphan help articles from their new category hubs; merge 10; retire 5.
7. Execute the internal-link plan below.

### The internal-link plan

| From page | To page | Anchor text | Placement | Reason |
|---|---|---|---|---|
| `/` (home) | `/payroll-software-for-small-business` | payroll software built for small teams | Hero sub-nav | Money page needs the strongest single link on the site |
| `/` (home) | `/blog/payroll-taxes/` | payroll tax guides | Primary nav, Resources | Makes the new hub depth 1 from day one |
| `/blog/payroll-tax-deadlines` | `/blog/payroll-taxes/` | our full payroll tax guide | First paragraph | Strongest blog page by external links; pushes authority into the new hub |
| `/blog/payroll-tax-deadlines` | `/help/taxes-and-filings/deposit-schedules` | how deposit schedules are assigned | Body, deposit section | Answers the reader's next question at the moment they form it |
| `/blog/payroll-taxes/` | `/blog/payroll-taxes/form-941-guide` | filing Form 941 quarterly | Hub body, Forms section | Hub-to-spoke; makes the spoke depth 3 |
| `/blog/payroll-taxes/` | `/product/tax-filing` | Meridian files these for you | Hub body, closing section | Sends informational traffic to a commercial page once the question is answered |
| `/templates/payroll-calendar-template` | `/blog/payroll-tax-deadlines` | the 2026 deadlines behind this calendar | Below download button | Second-strongest page by external links; supports a striking-distance page |
| `/templates/pay-stub-template` | `/help/running-payroll/reading-a-pay-stub` | what each line on a pay stub means | Body, after instructions | Orphan rescue with a genuinely relevant contextual link |
| `/pricing` | `/compare/paycadence` | see how our pricing compares to PayCadence | Below plan table | Catches price-shoppers at the comparison moment |
| `/compare/paycadence` | `/payroll-software-for-small-business` | our small-business payroll platform | Closing paragraph | Comparison pages attract links; route that value to the money page |
| `/help/taxes-and-filings/` | `/blog/payroll-taxes/` | background reading on payroll taxes | Category intro | Connects the help and blog clusters on the same subject |
| `/blog/payroll-basics/what-is-gross-pay` | `/blog/payroll-basics/` | payroll basics explained | Breadcrumb and intro | Spoke-to-hub; standard pattern across all 310 posts |
| `/blog/payroll-software-buying/` | `/compare/wagebase` | Meridian compared with Wagebase | Hub body, alternatives section | Buying-intent hub should route to comparison pages |
| `/product/direct-deposit` | `/help/running-payroll/setting-up-direct-deposit` | step-by-step direct deposit setup | Body, after overview | Product-to-help link that serves evaluators and reduces support load |
| `/blog/hiring-and-onboarding/` | `/templates/direct-deposit-authorization-form` | free direct deposit authorization form | Hub body, onboarding checklist | Sends hub traffic to a conversion asset |

Note what the anchors do: each describes its destination honestly, they vary in wording even when the destination overlaps, and none is a repeated exact phrase. That is the standard.

### Verifying the result

Nothing here is verified in a week. Set the checkpoints before you start.

**Weeks 1–2, Search Console URL Inspection.** Spot-check ten moved URLs. Confirm the new URL is the one Google has indexed and the old one reports as redirected. This checks execution, not results.

**Weeks 2–6, Links report.** The Internal Links section lists your most-linked pages. Your five new hubs should climb into the top tier, and the money page should rise. If a hub is not gaining internal links, your plan was not implemented. This report updates slowly, so do not panic at week two.

**Weeks 4–12, Performance report.** Three specific comparisons:

1. **The cannibalized query.** Filter to "payroll software for small business" and check the Pages tab. Success is one URL receiving nearly all impressions, at a better position than the previous best of 11. Alternation should stop.
2. **The rescued orphans.** Filter to those 25 URLs and compare the 90 days after against the 90 days before. They started near zero, so any consistent impression growth is real.
3. **The hubs.** New URLs start with nothing. Watch impressions appear, then queries accumulate. A hub that has no impressions after eight weeks is a content problem, not a structure problem — go read the page.

**Ongoing, site totals.** Meridian's baseline is 41,300 clicks, 1,240,000 impressions, 3.3% CTR, and average position 18.4. After a restructure, expect the position number to get *worse* before it improves, partly because newly discovered pages start low and drag the average. Judge the project on clicks to the pages you targeted, not on the site-wide average. Lesson 11 covers building that measurement properly. The shared Performance baseline covers Jan–Mar 2026; later diagnostic exports name their own scope.

## Practice

Audit and redesign the architecture of a real site. Use your employer's site if you have Search Console access; otherwise use a site you can crawl freely and pair it with the Meridian baseline numbers.

1. **Inventory.** Export the XML sitemap URL list to a spreadsheet. Record the total. Cross-check against the Search Console Pages report and note any gap between "URLs that exist" and "URLs Google has indexed."
2. **Measure click depth.** Crawl from the home page with a free-tier crawler, or trace your twenty most important URLs by hand. Produce the depth distribution table (depth, URL count, note). Name every important page sitting at depth 4 or deeper.
3. **Detect orphans.** Subtract the crawl list from the sitemap list. Verify a sample of ten by hand. For each orphan, record whether Search Console shows any impressions, and assign it to link / merge / retire.
4. **Detect cannibalization.** In Performance, sort queries by impressions and take the top thirty. For each, open the Pages tab and record whether more than one URL receives impressions. Compare two adjacent three-month windows to catch alternation. Record every confirmed case.
5. **Define hubs.** Group the site's content into three to seven subject clusters. For each, name the head term the hub will target, the URL it will live at, whether the hub page already exists, and at least five spokes it will contain.
6. **Draw the tree.** Produce the redesigned structure as a plain-text tree, marking each hub and each URL that has to move. Mark which changes are new pages, which are moves requiring redirects, and which are links only.
7. **Find your donors.** From the Links report and the Performance report, identify the five pages with the most external links and the five with the most clicks. These are the sources for your highest-value internal links.
8. **Find striking distance.** Filter Performance to average position 8–20, sort by impressions, and take the top twenty pages. These are your priority link targets.
9. **Write the plan.** Build the internal-link table, and for every row state the reason in terms of one of architecture's four jobs.

**Deliverables — three documents:**

- **A site tree** in plain text showing the redesigned structure, with hubs marked, each URL labeled new / moved / unchanged, and current click depth annotated for anything now deeper than three.
- **A cannibalization findings table** with columns: query, competing URLs, quarterly impressions, current positions, evidence of alternation, chosen resolution (consolidate / differentiate / demote), and the one-sentence justification your decision rule produced.
- **An internal-link plan of at least twenty rows** with columns: from-page, to-page, anchor text, placement, and reason. At least five rows must originate from a donor page identified in step 7, and at least eight must target a striking-distance page from step 8. No two rows may use identical anchor text for the same destination.

Add a short risk note: which changes require redirects, what could break, and the two-sentence rollback plan if organic traffic to a top-ten page drops by more than a third and stays there for three weeks.
