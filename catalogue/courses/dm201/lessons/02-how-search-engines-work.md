---
lesson_id: dm201-02
course_id: dm201
pathway: digital-marketer
title: How Search Engines Crawl, Index, and Rank
order: 2
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Explain how crawling, indexing, and ranking determine whether a page can
    appear in search results
  - Describe the major categories of ranking factors and their relative weight
---

## Three gates, not three steps

A page shows up in Google's results only if it passes three gates in order. Google's documentation calls them crawling, indexing, and serving. Most people read that as a pipeline flowing smoothly downhill. Read it instead as gates, each of which can slam shut — that is how you will use the model when a page is missing and someone asks you why.

```txt
   Gate 1: CRAWLING          Gate 2: INDEXING           Gate 3: SERVING
   Did a search engine       Did the engine decide      For this specific query,
   fetch this URL?           to store this page?        did this page get retrieved,
                                                        ranked, and displayed?
        |                         |                          |
   fails if:                 fails if:                   fails if:
   - never discovered        - thin / duplicate          - not relevant to the query
   - blocked from fetching   - a different URL was       - outranked by 9+ others
   - server errored            chosen as canonical       - a SERP feature took the space
   - redirected away         - noindex present           - filtered as spam
   - timed out               - low perceived value
```

The gates are strictly sequential. A page never crawled cannot be indexed; a page not indexed cannot rank, however good the writing. When a stakeholder says "we published that page three weeks ago and it isn't ranking," your first job is not the title tag. It is finding which gate the page is stuck at. Optimizing a page Google has never fetched is like repainting a car with no engine.

Your running example all course is **Meridian Payroll** (meridianpayroll.com), a small-business payroll software company with about 640 indexable URLs across `/pricing`, `/product/...`, `/compare/...`, `/help/...`, `/blog/...`, and `/templates/...`. Over the last three months Search Console reports **41,300 clicks, 1,240,000 impressions, 3.3% average CTR, and average position 18.4** — plenty of pages through all three gates and sitting on page two. The shared Performance baseline covers Jan–Mar 2026; later diagnostic exports name their own scope.

## Discovery: how a URL becomes known at all

Before crawling there is discovery. Google keeps a list of URLs it knows about, and a URL not on that list will never be fetched. Four practical ways onto it.

**Internal links.** The dominant mechanism. When Googlebot fetches `/blog/` and finds an anchor pointing at `/blog/payroll-tax-deadlines`, that URL enters the crawl queue. This is why an orphan page — one nothing on your site links to — is the classic invisible page. Lesson 07 covers structuring internal links so nothing goes orphan.

**External links.** A link from another site does the same job, faster in practice because high-traffic sites are crawled more often. A mention of a Meridian template on a small-business forum can get that URL discovered before your own sitemap does.

**XML sitemaps.** A submitted file listing the URLs you want considered. A sitemap is a *hint*: it gets URLs discovered; it does not get them crawled on a schedule and certainly does not get them indexed. Lesson 08 owns sitemap format and submission.

**Redirects and other references.** An old URL 301-redirecting to a new one discovers the new one. URLs also surface from RSS feeds and, sometimes, from links in rendered JavaScript.

Discovery has its own Search Console state, the one people misread most: **"Discovered – currently not indexed."** Google knows the URL exists and has *not fetched it yet*. Nothing about the content has been evaluated, because nothing has been read. Usual causes: the site's crawl priority is low, the page sits many clicks deep, or Google recently fetched a batch of similar pages and judged the pattern low-value. The fix is almost never on the page — it is more internal links from frequently crawled pages, or a section that demonstrably produces pages worth fetching.

## Crawling: fetching, politely and selectively

A crawler requests URLs over HTTP and stores the response. Googlebot identifies itself in the user-agent string and comes in variants — the smartphone crawler is primary for almost all sites, a desktop crawler is used less often, plus specialised agents such as Googlebot-Image and Googlebot-News. Other engines run their own: Bingbot, DuckDuckBot, and increasingly AI crawlers with their own opt-out mechanisms.

Two things govern how much of your site gets fetched:

**Crawl rate limit** — how fast Google will hit your server without degrading it. If your server returns 5xx errors or slows down, Googlebot backs off automatically, sometimes for days. This is the most common self-inflicted crawl problem: a site goes down for four hours during a deploy, Googlebot hits a wall of 503s, and crawl volume stays depressed for a week.

**Crawl demand** — how much Google *wants* to fetch from you, driven by how popular and how frequently updated your URLs appear.

Together those are called crawl budget. The honest version: **Meridian Payroll, at 640 indexable URLs, is unlikely to need crawl-budget optimization.** [Google's guidance](https://developers.google.com/crawling/docs/crawl-budget) primarily covers roughly a million-plus URLs that change regularly, ten-thousand-plus that change daily, or sites with a large share of discovered-but-not-indexed URLs. These are rough categories, not thresholds or a guarantee that a small site cannot have crawl-capacity problems. A 3-million-URL marketplace with faceted navigation has a real one, because the crawler can burn its whole allocation on `?color=blue&size=m&sort=price` variants and never reach the new category pages. A 640-URL brochure-and-blog site has a *discovery* or *quality* problem being misdiagnosed as a budget problem. Investigate server errors, discovery, and quality before treating this small site as a crawl-budget project.

What makes crawling stop or fail:

| Cause | What Googlebot sees | Effect |
| --- | --- | --- |
| Server 5xx errors | 500, 502, 503 | Crawl rate throttled; repeated 5xx can drop pages from the index |
| Timeouts | No response in time | Treated like an error; retried less often |
| 403 / 401 | Access denied | Not crawled; common when staging auth leaks to production |
| Blocked by robots.txt | Disallow rule matched | Never fetched at all (lesson 08 covers the syntax) |
| Redirect chains | 301 → 301 → 301 → 200 | Followed, but long chains waste fetches and can be abandoned |
| Soft 404s | A 200 status on an "not found" page | Page may be dropped as low-value |

Note the asymmetry: `robots.txt` blocks *crawling*, not indexing. A blocked URL that other sites link to can still appear as a bare URL with no description, because Google knows it exists but was never allowed to read it. Lesson 08 works through it properly.

## The render step and the JavaScript queue

Fetching HTML is not always enough. Modern sites often deliver a shell and build the visible content with JavaScript in the browser. Google handles this with a second pass: after the initial fetch the URL enters a **render queue**, where a headless Chrome instance executes the JavaScript and produces the final DOM, which is what gets indexed.

The consequences:

- Rendering is deferred — usually minutes to hours, but it is a separate queue with its own backlog. JavaScript-only content is indexed on a delay relative to server-rendered content.
- Links that only exist after JavaScript execution are discovered on that same delay. If your navigation uses click handlers rather than real anchor elements with `href` attributes, those links may not be found at all.
- If the JavaScript fails — a blocked script file, a third-party API timing out, an error on the crawler's browser version — Google indexes the empty shell. The page looks fine to you and blank to the index.
- Not every search engine renders as thoroughly as Google. Assume less capable crawlers exist.

The diagnostic is in your hands: URL Inspection's live test shows the rendered HTML and a screenshot of what Googlebot produced. If your main copy is missing there, you have found the problem, and it is an engineering ticket, not a content ticket.

## Indexing: selection, not storage

Here is where most mental models break. Indexing is not "Google saves a copy of everything it crawls." Indexing is a **selection decision**, and Google crawls far more than it keeps. It processes the page — extracts text, understands the layout, reads structured data, identifies the language, evaluates the content — then decides two things:

1. **Is this page worth including at all?**
2. **If several URLs contain essentially the same content, which one represents the group?**

That second question is canonicalization. When Meridian has `/templates/payroll-register`, `/templates/payroll-register?utm_source=newsletter`, and `/blog/free-payroll-register` all carrying substantially the same content, Google picks one URL as the canonical and folds the others into it, consolidating their signals — including links — onto the winner. **This is consolidation, not a penalty.** There is no "duplicate content penalty." The harm is losing control of which URL represents the content and diluting your signals across near-identical pages — a real cost, but a different one, and calling it a penalty leads people to delete pages that should have been consolidated with a canonical tag. Lesson 08 covers that tag.

**Crawled but not indexed** is the state that panics clients. Google fetched the page, read it, and chose not to include it — because it is thin, because it duplicates something the site or the web already has, because its section has a pattern of low-value pages, or because the site's quality signals are weak enough that borderline pages don't make the cut. Republishing at a new URL does not fix it. Making the page meaningfully better, or merging it into a stronger one, sometimes does. Sometimes the right answer is that the page should not exist.

### The Search Console states you must be able to explain

These are the exact strings in **Indexing > Pages**. Keep plain-English translations ready for a stakeholder:

| State | What it actually means | Is it a problem? |
| --- | --- | --- |
| Discovered – currently not indexed | Google knows the URL; has not fetched it yet | Sometimes. Watch for growth; usually a crawl-priority or internal-linking issue |
| Crawled – currently not indexed | Fetched and read; not selected for the index | Often. A content quality or duplication judgement |
| Duplicate, Google chose a different canonical than user | You declared a canonical; Google disagreed and picked another URL | Investigate. Your declared canonical is being overridden |
| Alternate page with proper canonical tag | This URL correctly points at another canonical; working as intended | No |
| Excluded by 'noindex' tag | The page explicitly asks not to be indexed | Only if unintentional — check every one |
| Page with redirect | The URL redirects elsewhere; the target is what matters | No |
| Not found (404) | Gone | Only if the URL should exist or has links pointing at it |
| Blocked by robots.txt | Crawling disallowed | Only if unintentional |
| Soft 404 | Returns 200 but looks like an error/empty page | Yes — fix the status code or the content |

The most valuable habit in this report: **classify every non-indexed reason as intentional or unintentional.** A site with 150 non-indexed URLs, all intentional, is healthy. A site with 20 where 12 are unintentional is not.

### Reading the Pages report on Meridian

Here is a 12 September 2026 follow-up export from Meridian's Pages report, joined to the 640 intended content URLs and 150 audited variants or retired URLs. This 790-URL cohort excludes the separate tag-archive and PDF inventories in lesson 08; it is not the whole domain-property total. The April–July template noindex incident has been fixed; the remaining unintended exclusions are listed below.

```txt
Pages export: audited 790-URL cohort                       Snapshot: 12 Sep 2026

  Indexed pages ................................. 579
  Not indexed ................................... 211
  Total URLs in cohort .......................... 790

Why pages aren't indexed
  Reason                                              Pages    Trend
  --------------------------------------------------------------------
  Alternate page with proper canonical tag              74     flat
  Excluded by 'noindex' tag                             41     flat
  Duplicate, Google chose a different canonical         38     +12
  Page with redirect                                    29     flat
  Crawled - currently not indexed                       17     +5
  Discovered - currently not indexed                     6     +6
  Not found (404)                                        4     +4
  Blocked by robots.txt                                  2     flat
  --------------------------------------------------------------------
  Total                                                211
```

Do the arithmetic out loud; this is how you brief a client. Of 790 URLs in this cohort, 150 are non-indexed *on purpose*: print, tracking and duplicate filtered variants correctly declaring a canonical (74), print views and internal search pages carrying noindex (41), old URLs redirecting to replacements (29), two admin paths blocked in robots.txt, four genuine 404s. That leaves 640 URLs Meridian intends to have indexed — and 579 are. The 61-URL gap is 38 duplicate-canonical disputes, 17 crawled-not-indexed, 6 discovered-not-indexed. **That gap is the technical indexing agenda for this cohort**, and the +12 duplicate-canonical row goes first because it is the only reason growing fast enough that the cause is still findable.

### URL Inspection: indexed version vs live test

URL Inspection answers "what does Google currently know about this one URL." It has two modes, and confusing them will waste your afternoon.

**The default view is the indexed version** — Google's stored knowledge from the last crawl: whether the URL is on Google, last crawl date, the crawler that fetched it, whether crawling and indexing were allowed, the user-declared canonical, the Google-selected canonical, and detected enhancements. This is historical: fix a noindex tag an hour ago and this view still shows the old state.

**"Test live URL" fetches the page right now**, telling you whether the *current* version could be indexed and giving you rendered HTML, a screenshot, the HTTP response, and any resources that failed to load. This is the mode for verifying a fix.

The common misreading: the live test says "URL is available to Google" and the person concludes the page is indexed. It is not — the live test only says it *could* be. Only the indexed view's "URL is on Google" means it is in there. Requesting indexing is a nudge into a priority crawl queue, not a guarantee, and hammering it does nothing.

## Serving: how a result page gets assembled

The third gate. The common wrong model is that Google keeps a fixed leaderboard per keyword and you climb it. What actually happens is that **results are assembled per query, at query time.**

**Query understanding.** The system interprets what you typed: spelling correction, synonym expansion, entity recognition, language detection, and a read on what would satisfy the query. "payroll taxes due" and "when do I have to deposit payroll taxes" resolve to close to the same need. Lesson 03 is entirely about this.

**Retrieval.** From an index of hundreds of billions of pages, a candidate set that plausibly matches is pulled — a coarse, fast filter. Miss the candidate set and nothing else about your page matters for that query.

**Ranking.** Candidates are scored by many ranking systems weighing relevance, quality, usability, and context, producing an ordered list.

**Re-ranking and assembly.** Further passes adjust the list — diversity so the top ten aren't ten pages from one domain, freshness boosts, spam demotions — then the page is assembled with whatever features the query triggers: an AI overview, a featured snippet, People Also Ask, a video carousel. Lesson 03 covers reading that layout.

Two consequences to know cold. The same URL can hold position 4 for one query and 40 for a near-synonym, because candidate sets and scoring differ per query. And position is personal and contextual — device, language, and approximate location all change results, which is why "I searched and we're number 2" from a colleague in your office is not data, while Search Console's average position across real impressions is. Local SEO is out of scope here.

## Signal, ranking system, spam filter: three different things

These three get used interchangeably by people who should know better, and mixing them up produces bad recommendations.

A **signal** is an input — a measurable property of a page, site, link, or query. The words in your title element; the number and quality of sites linking to you; whether the page loads acceptably on a phone. Signals are ingredients.

A **ranking system** consumes signals and affects ordering. Google publishes a guide to its ranking systems; named ones include the helpfulness-oriented systems, link-analysis systems, the passage-based ranking system, the reviews system, and the freshness systems. Systems are recipes. Google distinguishes ranking *systems* (ongoing) from historical ranking *updates* (one-time events like Penguin and Panda, retired names for things now baked into continuous systems). Anyone talking about "recovering from Penguin" in 2026 is reading a decade-old map.

A **spam filter** is a gate, not a score. Systems like SpamBrain identify content and behavior violating the spam policies — scaled content abuse, site reputation abuse, link spam, cloaking, doorway pages — and either neutralize the offending signals or remove the pages. A spam filter does not shave points off a score you can offset elsewhere. It removes you from consideration. You stop violating the policy and, for a manual action, request a reconsideration review.

So: **signals feed systems; systems produce an ordering; spam filtering gates who is eligible to be ordered at all.** When you write a recommendation, know which of the three you are talking about.

## Ranking factor categories and their honest weight

You will be asked "what are the ranking factors?" There is no honest list of 200 with percentages beside them: Google does not publish weights, the weights are query-dependent by design, and any blog post handing you a pie chart made it up. Describe the categories, and be honest about relative importance *and* uncertainty.

### 1. Content relevance and query-document match — the largest category

If a page does not address the query, nothing else saves it. Relevance is judged from the words on the page and their meaning, the topic covered, how directly the question is answered, and increasingly from semantic rather than literal string matching. Passage-level analysis means a well-written section deep in a long page can surface for a specific query even when the page as a whole is broader.

What this does **not** mean: no keyword density target, no "use the phrase four times," and no such thing as LSI keywords — that term was lifted from an unrelated 1980s retrieval technique and applied to something Google does not do. Write the page so it genuinely covers what the searcher asked, in their language, and relevance largely takes care of itself. Lesson 06 covers the on-page mechanics.

### 2. Links and off-site signals — large, and the hardest to fake

Links from other sites remain one of the most important independent signals, precisely because they are one of the few not under the site owner's control. The mechanism descends from PageRank: a link is a vote, votes from well-connected pages count more, value flows through the graph. Two corrections to folklore. There has been no publicly visible numeric PageRank since 2016; anyone quoting yours is quoting a third-party estimate. And "PageRank sculpting" with `nofollow` has not worked since 2009 — the attribute stopped conserving flow and now simply drops it.

Domain Rating, Domain Authority, and Trust Flow are **vendor estimates from vendor link crawls**. Google neither computes nor uses them, and a page can rank above another with triple the DR. Treat them as rough comparative shorthand and label them as estimates every time one goes in a deck. Lesson 10 covers ethical link acquisition — and why link buying, private blog networks, reciprocal schemes, and directory blasts are named spam-policy violations with real consequences, not clever shortcuts.

### 3. Site and page quality signals — large, diffuse, slow-moving

Google's systems try to approximate whether content is helpful, reliable, and made for people rather than search engines. Two ideas dominate.

The **helpful content idea**, now folded into Google's core ranking systems rather than a separate update, asks whether content shows first-hand expertise, satisfies the visitor, and would exist if search engines did not. Its teeth: unhelpful content anywhere on a site can weigh on the whole site, which is why publishing 400 thin AI-spun posts to "cover more keywords" is now actively dangerous rather than merely useless.

**E-E-A-T** — Experience, Expertise, Authoritativeness, Trustworthiness — comes from the **Search Quality Rater Guidelines**, the manual used by human raters who evaluate result quality so Google can test whether changes to its systems worked. Raters do not set rankings. E-E-A-T is not a score and there is no dial; it describes what Google's systems *try to approximate* from many signals, and it matters most on "Your Money or Your Life" topics — health, finance, safety, legal. Payroll compliance is close enough to YMYL that Meridian should care: named authors with real credentials, accurate and dated tax figures, citations to the IRS. An "E-E-A-T optimization" checklist with a score at the end is folklore.

### 4. Page experience and technical health — real, small, a tiebreaker at best

Core Web Vitals and the broader page experience signals (HTTPS, mobile usability, no intrusive interstitials) are genuine inputs. They are also, by Google's repeated statements, small — a tiebreaker among comparably relevant results. **A fast site cannot rescue an irrelevant page.** Be relevant, be good, then be fast. Technical health matters enormously at gates 1 and 2, not gate 3: a site that crawls badly or renders empty is not competing at all. Lesson 08 covers the metrics and thresholds.

### 5. Freshness — query-dependent, sometimes decisive, usually irrelevant

Some queries "deserve freshness": breaking news, this year's tax deadlines, "best payroll software 2026." Recency is a strong input there and a two-year-old page loses regardless of quality. For "what is a payroll register," freshness barely matters and a well-maintained 2019 page can hold position 1 indefinitely. Knowing which targets deserve freshness tells you which pages need a genuine annual update — revised figures and new information, not a changed date stamp, which does nothing.

### 6. User context — device, language, location

Results vary by device, interface language, and location. Name it, note that it makes any single manual search a weak measurement, and move on: location-driven results belong to local SEO, which this course does not cover.

### 7. Spam filtering — a gate across all of the above

As established: not a score. Eligibility.

### A defensible way to say it out loud

> "Relevance and content quality do most of the work; off-site links are the strongest independent corroboration; page experience is a small tiebreaker; freshness matters on some queries and not others; and spam filtering decides whether you're eligible at all. The weights are query-dependent and Google doesn't publish them, so anyone quoting percentages is guessing."

## What is not a ranking factor

Memorize these, because someone who read a 2011 blog post will ask you to implement several of them:

- **The meta keywords tag.** Ignored since 2009, publicly. Filling it in wastes your time and tells competitors your targets.
- **Keyword density.** No target percentage exists; repeating a phrase to hit a number produces worse pages.
- **Domain Authority / Domain Rating / Keyword Difficulty.** Vendor estimates, not signals.
- **Bounce rate and time on page from Google Analytics.** Google does not rank you on your Analytics data.
- **Social share counts** as a direct signal. Social distribution can *earn* links and coverage, which are signals; the count is not.
- **Submitting your site** via submission services. Discovery happens through links and sitemaps.
- **Engineered exact-match anchor text at scale.** A link-spam violation, not an optimization.

## Where reliable information comes from

Check the primary source before you repeat a claim.

| Source | What it is good for |
| --- | --- |
| Google Search Central documentation | The canonical reference on crawling, indexing, structured data, and the spam policies |
| Google's "ranking systems" guide | The current, named list of systems, and which historical updates are retired |
| Google Search Status Dashboard | Whether a live incident or a confirmed ranking update is in progress right now |
| Search Quality Rater Guidelines | Where E-E-A-T and YMYL are actually defined, in context |
| Search Central blog and release notes | Confirmed changes with dates |
| Search Console Help | Exact definitions of every report state |

Everything else — including this lesson — is interpretation. When a conference talk contradicts Search Central, Search Central wins. When you cannot find a primary source, say "I believe, but cannot confirm" rather than asserting. That habit separates a credible SEO from a merely confident one.

## Worked example: tracing one Meridian URL through all three gates

Meridian published `/blog/payroll-tax-deadlines` on **6 January 2026 at 09:14 UTC** — a 1,400-word article describing the 2026 federal deposit schedule in prose, with a downloadable calendar. The on-page deadline tables are added in lesson 06’s July optimization. On publish the CMS linked it from the `/blog/` index and added it to the XML sitemap, and an editor linked it from `/help/payroll-tax-setup`.

### The server log

```txt
66.249.66.14 - - [06/Jan/2026:14:22:07 +0000] "GET /sitemap.xml HTTP/1.1" 200 18442 "-" "Googlebot/2.1 (+http://www.google.com/bot.html)"
66.249.66.9  - - [06/Jan/2026:14:23:51 +0000] "GET /blog/ HTTP/1.1" 200 41209 "-" "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) ... Googlebot/2.1"
66.249.66.9  - - [07/Jan/2026:22:07:33 +0000] "GET /help/payroll-tax-setup HTTP/1.1" 200 33871 "-" "... Googlebot/2.1"
66.249.66.21 - - [08/Jan/2026:03:41:18 +0000] "GET /blog/payroll-tax-deadlines HTTP/1.1" 200 52318 "-" "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) ... Googlebot/2.1"
66.249.66.21 - - [08/Jan/2026:03:41:19 +0000] "GET /assets/app.4f2a.js HTTP/1.1" 200 118904 "-" "... Googlebot/2.1"
66.249.66.21 - - [08/Jan/2026:03:41:20 +0000] "GET /assets/deadline-table.css HTTP/1.1" 200 9122 "-" "... Googlebot/2.1"
66.249.66.14 - - [14/Jan/2026:06:12:44 +0000] "GET /blog/payroll-tax-deadlines HTTP/1.1" 304 0 "-" "... Googlebot/2.1"
66.249.66.9  - - [05/Feb/2026:19:55:02 +0000] "GET /blog/payroll-tax-deadlines HTTP/1.1" 200 52411 "-" "... Googlebot/2.1"
```

Read what the log says. The sitemap was fetched five hours after publish; the `/blog/` index carrying the new internal link a minute later. The article itself was not fetched for another **37 hours** after discovery (42 hours 27 minutes after publication), at 03:41 on 8 January, by the smartphone crawler. Its CSS and JS came in the following two seconds — the render step gathering resources. The 14 January fetch returned **304 Not Modified**: the server said "unchanged since your last visit" and Googlebot spent almost nothing. The next full fetch was a month later.

### The gate-by-gate trace

| Date | Gate | Search Console state | What is happening |
| --- | --- | --- | --- |
| 6 Jan 09:14 | — | URL is not on Google | Published. Nothing knows it exists yet |
| 6 Jan 14:23 | Discovery | Discovered – currently not indexed | Found via the `/blog/` index link and the sitemap. Never fetched |
| 8 Jan 03:41 | Crawl | Crawled – currently not indexed | Fetched, 200, rendered. Under evaluation; **not yet a problem** |
| 10 Jan | Index | URL is on Google | Selected. Google-selected canonical matches the declared one |
| 12 Jan | Serve | 3 impressions, avg position 61.2 | First appearances, deep on page six. Zero clicks |
| 27 Jan | Serve | 190 impressions, 4 clicks, avg position 34.5 | Settling as Google gathers relevance evidence |
| 17 Apr | Serve | 1,910 impressions, 71 clicks, avg position 12.7, CTR 3.7% | Established at the page two, in striking distance |

Four lessons live in that table.

**"Crawled – currently not indexed" on day two is normal.** It is a snapshot mid-evaluation, not a verdict. Judge it at three to four weeks, not at 48 hours. "Fixing" the page on 9 January would have fixed nothing.

**Publish to first impression was six days; first impression to a settled position, about fourteen weeks.** A typical shape for a new page on an established site with existing crawl demand — a brand-new domain with no external links routinely takes longer, and weak internal linking can stretch it to months. Give ranges with reasons. Never promise a timeline; you do not control the queue.

**Position improved without anyone touching the page.** Between January and April it picked up two internal links from newer posts and one external link from an accountancy newsletter, and started collecting real query data. Early positions are provisional, and judging a page in its first fortnight produces panic edits that destroy the evidence you needed.

**One 304 saved a full fetch.** Trivia at Meridian's size. At three million URLs, conditional-request handling decides whether the crawler ever reaches your new pages.

Had that article shipped with no internal link from `/blog/`, it would have sat at "Discovered – currently not indexed" on the sitemap alone for weeks, while a junior analyst rewrote the title tag on a page Google had never read. The gate model exists to stop you doing that.

## Practice

Trace a real property through all three gates. Use a Search Console property you have verified access to — your employer's site, your cohort's practice site, or a personal site you own. URL Inspection needs Full or Owner access.

**Part A — Trace one URL from publish to impression**

1. In **Indexing > Pages**, open the **Indexed** list and pick a URL published in the last 90 days. Record it and, from the CMS, its exact publish date and time.
2. Run **URL Inspection**. Record: "URL is on Google" or not; last crawl date and time; the crawler that fetched it (smartphone or desktop); "Crawl allowed"; "Indexing allowed"; the user-declared canonical; the Google-selected canonical.
3. Open **View crawled page > HTML** and confirm your main body copy is in what Google stored. Then **Test live URL**, open the rendered HTML, and confirm the same. Note any difference, and any failed page resources listed.
4. Compute the **discovery-to-crawl gap** (publish to first crawl) and the **crawl-to-index gap** (first crawl to first impression). Get the first-impression date from **Performance > Search results**: filter to that page, set the range to since publish, switch to the **Date** tab, find the first day with impressions above zero.
5. Plot the page's weekly average position and impressions from publish to today, and write one sentence on whether it is improving, flat, or declining.
6. If your host exposes server logs, pull every Googlebot request for that URL with its status codes. If you cannot, say so explicitly in the write-up and rely on URL Inspection's last-crawl data — knowing which evidence you have is part of the skill.

**Part B — Categorize every non-indexed reason on the property**

7. In **Indexing > Pages**, open **Why pages aren't indexed**. Copy every reason and page count into a table, plus the indexed count and total known URLs; check that indexed plus not-indexed equals the total.
8. For each reason, open **three example URLs**. Decide whether the reason is **intentional** (the page is meant to be excluded) or **unintentional** (it should be indexed and isn't).
9. Write a plain-English explanation of each reason in your own words, one or two sentences a non-SEO stakeholder would understand. Do not paste Google's help text.
10. For each unintentional reason, name the gate it fails at (crawl, index, or canonical dispute) and the first action you would take.
11. Compute the property's **intended-indexable count** as the Meridian example does: total known URLs minus intentional exclusions. State the gap to the indexed count and which reasons make it up.

**Deliverable — two artifacts, submitted together**

- **A one-page trace** of your URL: publish timestamp, discovery-to-crawl gap, crawl-to-index gap, first-impression date, current position and impressions, crawler, canonical status, whether rendered HTML matched crawled HTML, and a two-sentence conclusion on which gate (if any) slowed it down. If a gap looks unusual against Meridian's six days, say why.
- **A categorized non-indexed table** with columns: Reason, Page count, Intentional or unintentional, Plain-English explanation, Gate it fails at, First action — ending with the intended-indexable arithmetic and one sentence naming the most urgent row and why.

Bring both to your next session. You will defend one "intentional" judgement out loud, so open the example URLs rather than guessing from the label.

## Check your understanding

1. A page shows "Crawled – currently not indexed" 48 hours after publishing. What do you do? *(Answer: inspect for an obvious `noindex`, canonical, rendering, or content problem and preserve the current evidence. If checks are clean, monitor rather than rewrite solely because of the status; there is no guaranteed indexing deadline.)*
2. A URL is blocked in robots.txt and also carries a `noindex` tag, yet it still appears in results as a bare URL. Why? *(Answer: the block stops Google fetching the page, so it never sees the `noindex`; it indexes the URL from links alone. Remove the block so the `noindex` can be read.)*
3. A colleague says the site's Domain Rating of 41 is "holding back rankings." What is wrong with that sentence? *(Answer: Domain Rating is a vendor estimate from a vendor's link crawl; Google neither computes nor uses it. Talk about the actual links and pages instead.)*
4. Which Search Console view proves a page is in the index: the URL Inspection default view or the live test? *(Answer: the default indexed view saying "URL is on Google." The live test only says the current version could be indexed.)*
