---
lesson_id: dm101-04
course_id: dm101
pathway: digital-marketer
title: How Search Marketing Works
order: 4
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Explain how search engines decide which pages to rank
  - Distinguish organic search work from paid search work
---

## Three jobs a search engine does

Search marketing makes sense only once you know what the machine on the other side is doing. A search engine performs three distinct jobs, and a page can fail at any one of them independently.

**Crawling.** Automated programs follow links around the web and fetch pages. A page that no link points to, or that is blocked from fetching, is invisible no matter how good it is.

**Indexing.** The engine parses each fetched page, works out what it is about, and stores it. A crawled page is not necessarily an indexed page — near-duplicate pages, thin pages, and pages the engine judges to add nothing often get dropped here.

**Ranking.** When someone searches, the engine selects from the index the small set of pages it believes best answer *that query for that person right now*, and orders them.

The practical consequence: "we're not ranking" has at least three different causes. Before debating ranking factors, confirm the page is fetchable and in the index at all. Diagnosing in that order — crawl, then index, then rank — saves enormous amounts of wasted effort.

## What ranking actually optimizes for

There is no scoreboard where a page earns points. A ranking system is trying to predict which result will satisfy the person who typed the query. Everything called a "ranking factor" is a signal that helps make that prediction.

Two consequences that beginners routinely miss:

**Ranking is query-specific.** A page does not "rank number one." It ranks number one *for a query*, on a *device*, sometimes in a *location*, at a *point in time*. The same page can be first for one phrasing and absent for a near-synonym.

**Intent is the first filter.** Search engines classify what the searcher wants before they compare pages. Four common intent types:

| Intent | Example query | What ranks |
| --- | --- | --- |
| Informational | "how to reconcile a bank statement" | Guides, explainers, videos |
| Navigational | "ledgerloop login" | The specific site being sought |
| Commercial investigation | "best bookkeeping software for small firms" | Comparisons, reviews, roundups |
| Transactional | "buy quickbooks license" | Product and checkout pages |

This is why the most common SEO failure is not technical. A company writes a product page and targets "how to reconcile a bank statement." The intent is informational; the page is transactional; it will not rank regardless of how well built it is. **Match the page type to the intent, or nothing else matters.**

## The major categories of ranking factors

Engines use a large and changing set of signals, and no one outside them has the full list. What is stable is the *categories*, and being able to reason with the categories is what this lesson is for.

### 1. Relevance: does the page answer this query?

- The query's words and closely related concepts appearing in meaningful places: the title element, headings, the opening paragraph, the body.
- Coverage of the subtopics a good answer includes. A page on bank reconciliation that never mentions outstanding checks is incomplete, and engines can tell.
- Semantic match, not exact-string match. Modern engines understand that "car" and "automobile" are the same concept; stuffing an exact phrase 40 times is both useless and penalized.

### 2. Content quality and trustworthiness

- Depth and originality relative to what already ranks. A page that restates the top result adds no reason to rank it.
- Signals of expertise and accountability: a named author with real credentials, citations, a dated last-review, a real organization behind the site.
- Accuracy, which matters far more for topics that affect health, safety, finances, or legal standing. Engines apply a visibly higher bar to those.

### 3. Authority and links

- Links from other sites act as votes. Quality dominates quantity: one link from a well-regarded industry publication outweighs hundreds from low-value directories.
- Relevance of the linking site matters. A link from an accounting association counts for a bookkeeping page in a way a link from an unrelated site does not.
- Internal links matter too. They tell the engine which of your own pages are important and what they are about.

### 4. Technical accessibility

- The page can be crawled (not blocked in `robots.txt`, not behind a login) and indexed (no accidental `noindex` tag).
- It renders without requiring the engine to execute fragile scripts to see the main content.
- Correct signals for duplicates, so several URLs showing the same content consolidate rather than compete.
- A logical site structure with internal links, so important pages are a few clicks from the home page.

### 5. Experience signals

- Page speed, especially on mobile connections.
- Mobile usability — most searches happen on phones.
- Layout stability and absence of intrusive interstitials that cover the content.
- Site security (`https`).

These are real but usually **tiebreakers**. A fast, secure, beautifully built page that does not answer the query still loses to a slower page that does.

### 6. Context: location, personalization, and freshness

- Local intent changes results completely. "Plumber" returns different results in Fresno than in Boston, and proximity plus local business listings dominate.
- Freshness is weighted by topic. For "tax filing deadline" recency is critical; for "how compound interest works" a ten-year-old page can be perfectly current.

### What does not move rankings

Half of what beginners are told about SEO is folklore. A short list of things that are either myths or so weak they are not worth planning around:

- **Keyword density.** There is no target percentage. Repeating a phrase to hit a ratio produces worse copy and no benefit.
- **Meta keywords.** A tag that major engines have ignored for many years.
- **Submitting your site to hundreds of directories.** Low-quality links at volume range from useless to actively harmful.
- **Publishing frequency by itself.** Ten thin posts a month do not outrank one page that genuinely answers the query. Freshness helps where the topic is time-sensitive; it is not a general reward for activity.
- **Exact-match phrasing in the domain name.** Long since discounted.
- **Word count as a target.** Longer pages often rank because thorough answers need room, not because length is scored. Padding a 900-word answer to 2,500 words makes it worse.
- **Buying links.** Explicitly against major engines' guidelines and a genuine risk to the site.

The useful mental filter: **if a tactic would not make the page better for the person who typed the query, it is unlikely to help for long.** Engines are trying to predict satisfaction, so tactics that fake a signal without improving the result are exactly what each update is built to discount.

### Reading a results page

Practitioners read the results page itself as evidence before doing any work, because it tells you what the engine currently believes the query means.

Typical elements on a commercial query:

- **Paid ads** at the top, and sometimes at the bottom, labelled as sponsored.
- **A shopping or product block** for transactional retail queries.
- **A local pack** — a map plus two or three business listings — when the query has local intent. Local ranking is driven mostly by proximity, the completeness and accuracy of the business listing, categories, and review volume and rating, not by the website alone.
- **A featured snippet**, an extracted answer placed above the standard results.
- **"People also ask"**, an expandable list of related questions that is a free map of the subtopics a thorough page should cover.
- **Video, image, and news blocks**, whichever formats the engine believes satisfy this query.
- **The standard organic list**, usually ten links.

Three things to read off it:

1. **What page type wins.** If nine of ten results are comparison articles, a product page will not break in. Build the page type that is already winning.
2. **How much room is left.** A query whose first screen is three ads, a shopping block, and a map has very little organic value on mobile, no matter what the search volume number says.
3. **What the subtopics are.** The "people also ask" questions and the headings inside the ranking pages tell you what coverage the engine considers complete.

This reading takes two minutes and prevents weeks of work aimed at a query that cannot be won with the asset you were planning to build.

### Working the categories: a diagnosis

A regional accounting firm publishes a 1,400-word guide, "How to reconcile a bank statement," and it does not rank. Walk the categories:

```text
Crawlable?          Yes — it is linked from the blog index and returns 200.
Indexed?            Yes — the exact title appears in a site: search.
Intent match?       Yes — informational query, informational guide.
Relevance depth?    The top three results all cover outstanding
                    checks, deposits in transit, and bank errors.
                    This guide covers none of the three.
Authority?          Domain has 11 referring sites; the pages ranking
                    above it have 300+ each.
Technical?          Loads in 1.2s, mobile-friendly, https.
```

The diagnosis is coverage and authority, not technology. Rewriting the guide to cover the three missing subtopics is the highest-value action, followed by earning links from the state CPA association and the local chamber. Speeding the page from 1.2 seconds to 0.9 would change nothing. Being able to reach that conclusion — identifying *which* factors are the constraint in a given scenario — is the skill this lesson is assessed on.

## Organic search work versus paid search work

Both put you on a results page. Almost everything else differs.

| | Organic search | Paid search |
| --- | --- | --- |
| How placement is won | Earned by ranking | Bought at auction, per click |
| Time to first result | Weeks to months | Hours |
| Cost per additional visit | Effectively zero once ranking | Roughly linear — every click billed |
| Control over position | Indirect, never guaranteed | Direct, within budget and quality limits |
| Persistence | Continues after work stops, decays slowly | Stops the day spend stops |
| Message control | Engine may rewrite the snippet | You write the ad, within policy |
| Testing speed | Slow — one change, weeks to read | Fast — days |
| Typical day's work | Research, writing, page structure, technical fixes, earning links | Query and keyword management, budgets and bids, ad copy, landing-page testing |

The results page itself mixes both. A commercial query typically shows paid ads at the top, sometimes a shopping or map block, then organic results, plus features like a featured snippet, "people also ask," reviews, and video. On a phone, the paid block can occupy most of the first screen. This is why "we're number one" needs a follow-up question: number one in the organic list can still sit below several ads.

One shared concept is worth knowing at survey depth: paid search is not a pure highest-bidder auction. Engines also score how relevant and useful the ad and its landing page are for the query, and a more relevant advertiser can win a better position at a lower cost per click than a less relevant one bidding more. So relevance work pays off in both columns — the mechanism differs, the discipline does not.

### What the two jobs look like day to day

Because both roles exist as separate jobs in most organizations, it helps to know what each person is actually doing with their week.

**The organic side.** Deciding which queries are worth pursuing and which are unwinnable. Auditing what already exists before writing anything new — most sites have more to fix than to add. Writing or commissioning pages that match intent and cover the subtopics. Structuring titles, headings, and internal links. Working with developers on crawl and index problems, speed, and duplicates. Earning links and mentions, which is largely relationship and PR work rather than technical work. Watching rankings and organic traffic on a horizon of months.

**The paid side.** Deciding which queries are worth paying for and what a click is worth, which comes from the unit economics. Writing ads and the landing pages behind them. Setting budgets and monitoring cost per click and cost per conversion. Adding negative terms so the ads stop showing on irrelevant queries — a large share of wasted spend lives here. Running tests, reading results in days rather than months, and shifting budget between what is working and what is not.

The shared skill is **intent**. Both roles are asking the same question — what does the person typing this actually want — and both build an asset that answers it. That is why the two sides should be planned together even when they are staffed separately.

### When to use which

- **Need traffic this week, or testing whether a market exists?** Paid. It buys speed and data.
- **Query is high volume and permanently relevant to your business?** Organic. Paying per click forever for something you could rank for is a rent you never stop paying.
- **Query converts extremely well and competitors are bidding on it?** Both. Ranking organically and buying the ad on the same high-value query is normal practice.
- **Brand-name queries?** You will usually rank first organically; whether to also buy the ad depends on whether competitors are bidding on your name.
- **Tiny budget, long-lived content business?** Organic, with the honest expectation of a slow start.

Note the sequencing that follows from the table: paid search is often the *research tool* for organic. If a term converts at 8% in paid over 400 clicks, that is strong evidence it is worth six months of organic effort. If it converts at 0.2%, you just saved six months.

## Two things that trip up newcomers

**Branded and non-branded queries are different businesses.** A query containing your company name comes from someone who already knows you; a query describing the problem comes from someone who may not. Reports that blend the two will always look excellent, because branded traffic converts extremely well and required no persuasion. Separate them in every analysis. Growth lives almost entirely in the non-branded column.

**Rankings are not the goal.** A page can rank first for a phrase nobody searches, or first for a phrase that never leads to a customer. The chain that matters is: the query is one your buyers actually type, you rank where they will see you, they click, and the page does its job. A ranking report with no traffic or conversion attached to it is a vanity artifact. That connection — from ranking, to visit, to outcome — is what the measurement lesson makes concrete.

Related: search results now increasingly include answers assembled directly on the results page, which can satisfy a query without a click. That does not change the ranking factors in this lesson, but it does change the expected click volume for purely informational queries, and it is another reason to judge search work by outcomes rather than positions.

## Practice

**Part 1 — Intent sort.** For each query, name the intent type and the kind of page that should rank. Then say whether you would pursue it with organic work, paid, or both, and why.

```text
1.  "espresso machine descaling instructions"
2.  "best espresso machine under $500"
3.  "breville barista express manual"
4.  "espresso machine repair near me"
5.  "buy espresso machine free shipping"
```

**Part 2 — Diagnose the constraint.** For each scenario, name the single ranking factor category that is most likely the constraint and the first action you would take. Give one sentence of justification each.

1. A page ranks well on desktop and is nearly absent on mobile. Content is identical.
2. A new 3,000-word guide has been live for four months. It is thorough and well written, on a site with fewer than 10 referring domains, competing against pages on major publications.
3. A product category page does not appear in a `site:` search of the domain at all.
4. A store's "emergency locksmith" page ranks on page four in its own city while three local competitors with thinner pages rank above it.
5. A well-linked, fast page targeting "what is an invoice factoring rate" returns nothing; the pages that rank are all calculators and explainers, and this page is a pricing page.

**Part 3 — Split the work.** A bicycle repair shop has $2,000 a month. Write a half-page plan that divides effort between organic and paid. Name at least three specific organic tasks tied to the factor categories in this lesson, at least two paid tasks, and state what you expect to see at 30 days and at 6 months from each side. Be explicit about what you are *not* doing and why.
