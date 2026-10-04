---
lesson_id: dm201-03
course_id: dm201
pathway: digital-marketer
title: Search Intent and the Modern SERP
order: 3
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Classify the search intent behind a query and match it to an appropriate
    page type
  - Read a SERP layout to judge the real opportunity for a query
---

## Intent is the question relevance actually asks

Lesson 02 left you at the third gate: Google retrieves a candidate set, ranks it, and assembles a results page. The dominant question there is not "does this page contain the words in the query." It is **"is this the kind of thing the searcher wanted?"**

Two pages can both mention "payroll software pricing" a dozen times. One is a pricing table with plan tiers and a "start free trial" button; the other is a 2,000-word essay on how SaaS pricing models evolved. For `payroll software pricing`, the essay is irrelevant however well written, because the person typing it wants numbers and a plan. Intent is the searcher's underlying goal, and matching it is a **page-type decision**, not a word-choice decision.

The rule that makes this expensive to get wrong: **a page-type mismatch cannot be fixed with on-page tweaks.** If the query wants a comparison table and you published a blog post, no title rewrite, no heading restructure, and no amount of link building closes the gap. The systems are not confused about what your page is; they have correctly identified it as the wrong kind of thing. The only fixes are to change the page type, build the right one instead, or stop targeting the query — all bigger decisions than an on-page edit, which is why intent classification happens *before* you write anything.

Meridian Payroll's Search Console data shows mismatch at scale. In the healthy Jan–Mar 2026 window the site has 41,300 clicks from 1,240,000 impressions — 3.3% average CTR at average position 18.4. By section:

| Section | Impressions | Clicks | CTR | Avg position |
| --- | --- | --- | --- | --- |
| `/blog/...` | 812,000 | 15,900 | 2.0% | 21.6 |
| `/templates/...` | 194,000 | 15,300 | 7.9% | 11.2 |
| `/help/...` | 148,000 | 5,600 | 3.8% | 14.9 |
| `/compare/...` | 51,000 | 2,700 | 5.3% | 12.4 |
| `/product/...` | 27,000 | 1,300 | 4.8% | 16.1 |
| `/pricing` | 8,000 | 500 | 6.3% | 8.7 |

The blog produces 65% of impressions and 38% of clicks. Some of that is normal — informational queries sit higher in the funnel. But 2.0% CTR at position 21.6 is also the fingerprint of pages appearing for queries they were never the right answer to.

## The four intent classes, with tests that discriminate

The standard definitions are vague enough to argue about, so use a test for each.

### Informational — "I want to know"

**Test: would a well-written answer, with nothing to buy and no brand attached, fully satisfy this person?** If yes, informational. Examples: `what is a payroll register`, `how to calculate federal payroll tax`, `when are 941 deposits due`.

It splits into two sub-shapes the SERP reflects. **Simple-answer** queries have one short correct answer (`what is form 941`) and the SERP fills with an AI overview, a featured snippet, and People Also Ask — Google answers in place. **Deep-explanation** queries need length and structure (`how to set up payroll for the first employee`), and the SERP shows long guides and often a video.

### Navigational — "I want to go to a specific place"

**Test: is there exactly one result that would satisfy this person, and does the query name it?** Examples: `meridian payroll login`, `paycadence pricing`, `wagebase support phone number`.

Your own brand's navigational queries are worth defending: your login, pricing, and help pages should own them, with sitelinks pointing at the right places. Someone else's brand is almost never worth targeting with a page pretending to be them — one exception below.

### Commercial investigation — "I want to decide"

**Test: is the person choosing between options rather than buying now or just learning?** Look for plural nouns, superlatives, comparison words, category language. Examples: `best payroll software for small business`, `paycadence vs wagebase`, `sumner hr alternatives`.

The highest-value class for Meridian — budget and timeline but no vendor yet. Also the most competitive, and these SERPs are usually full of review sites rather than vendors.

### Transactional — "I want to do it now"

**Test: is there a specific action that ends this search, and is the searcher ready to take it?** Examples: `free payroll register template excel`, `payroll tax calculator`, `meridian payroll free trial`.

"Transactional" does not require money. Downloading a template and using a calculator are transactions of attention, and they are among the most commercially useful queries Meridian can serve, because the person is mid-task right now.

### The hard borderline cases

**Bare category nouns.** `payroll software` could be a beginner, a buyer starting a shortlist, or someone hunting a specific vendor. Google usually resolves these toward commercial investigation, but read the SERP rather than assume.

**Product-adjacent how-tos.** `how to run payroll` looks purely informational, but the SERP often mixes step-by-step guides with vendor pages, because doing it and doing it with a tool overlap. Mixed intent; handled below.

**Competitor names.** `paycadence pricing` is navigational — the person wants PayCadence's own page. A Meridian `/compare/paycadence` page can legitimately appear, because a slice of that audience is comparison shopping. The line: your comparison must be *honest and useful about the competitor*, not a bait page pretending to be them. Misrepresenting whose site a visitor is on is a spam-policy problem and a brand problem.

**Calculator and template queries.** `payroll tax calculator` looks informational because it produces a number. It is transactional: the person wants a working tool this session, and a 1,500-word explanation of payroll mathematics loses to any page with an input box.

## The SERP is the answer key

The most important method in this lesson. **Do not classify intent by reasoning about the words. Classify it by reading what already ranks.**

Google has vastly more behavioral evidence about a query than you do — billions of sessions, click patterns, refinements, reformulations. The top ten results are the current output of all of it, so whatever page *types* dominate them are the types Google's systems have concluded satisfy this query. You are not guessing at intent; you are reading a verdict already rendered.

The procedure:

1. **Search the query in a clean context** — incognito, signed out. That removes personalization but not localization or device effects, so a single observation is directional evidence, not proof.
2. **Write down the elements in vertical order**, including ads and every feature. Order matters more than presence.
3. **Classify each of the top ten organic results by page type**, not domain: guide, roundup, comparison, product, pricing, category, tool, template download, help doc, forum thread, video.
4. **Count the page types.** Seven of ten the same means unambiguous intent. A five-four split means mixed.
5. **Look at who ranks**: vendors, review sites, affiliates, forums, institutional sites.
6. **Note what the features do to the click** — how far down the first organic result sits.

Three minutes per query, and it out-classifies anyone reasoning from words alone. When you cannot access a keyword suite — assume you often cannot — this still works, because the SERP is free.

## Query type to page type

Once you have the classification, the page type follows. This table is your mapping, with the format cues that belong to each type.

| Intent | Query shape | Correct page type | Format cues the type needs |
| --- | --- | --- | --- |
| Informational (simple) | `what is a payroll register` | Help doc or short guide | Definition in the first 60 words, one clear example, short sections |
| Informational (deep) | `how to set up payroll for a new employee` | Long guide | Numbered steps, screenshots or tables, a checklist, clear scope |
| Informational (reference) | `2026 payroll tax deadlines` | Dated reference page | A table, an explicit year, a visible last-updated date, annual maintenance |
| Commercial (category) | `best payroll software for small business` | Roundup or category page | Multiple named options, criteria stated up front, a comparison table, a verdict |
| Commercial (head-to-head) | `paycadence vs wagebase` | Comparison page | Two-column feature table, pricing side by side, honest "choose X if…" |
| Commercial (displacement) | `sumner hr alternatives` | Alternatives page | 5–8 options with one-line reasons, not just your own product |
| Commercial (qualified) | `payroll software for 10 employees` | Segment landing page | Explicit fit statement, pricing for that size, relevant proof |
| Transactional (buy) | `payroll software pricing` | Pricing page | Plan tiers, actual numbers, what's included, a clear next step |
| Transactional (tool) | `payroll tax calculator` | Interactive tool | Input fields above the fold, instant result, explanation below |
| Transactional (download) | `free payroll register template` | Template page | Preview of the file, format options, download without a wall if possible |
| Navigational (own brand) | `meridian payroll login` | The actual destination | Correct title, no interstitial, fast, sitelinks configured |
| Support | `meridian payroll direct deposit not working` | Help doc | Symptom in the heading, cause, steps, escalation path |

Two rules fall out. First, **the page type must be recognisable within two seconds of landing.** A comparison page whose first screen is three paragraphs of prose is a blog post in costume, and searchers and Google's systems both read it as one. Second, **one page type per URL.** The commonest Meridian blog failure is the post trying to be a guide, a comparison, and a pitch at once; it does all three badly. Lesson 06 covers how to build each type; here you decide which.

## Mixed and ambiguous intent: serve, split, or skip

Some SERPs genuinely show two or three page types because the query attracts different people. When the top ten split 6/4 or 5/3/2, you have three options.

**Serve one.** Pick the dominant type, build the best version, accept you will not capture everyone. Correct when one type clearly leads (7+ of 10), or when the minority type is one you should not build.

**Split.** Build two pages for adjacent queries, each owning its intent, linked to each other. Correct when the intents map to distinct phrasings you can separate — `how to run payroll` gets a guide, `payroll software for small business` gets a product page. Splitting is not publishing two near-identical pages; that produces the canonical consolidation from lesson 02.

**Skip.** Decline the query — when the dominant page type is one you cannot credibly produce, or when the query belongs to a different kind of organization. Meridian should not chase `irs form 941 instructions`; the IRS owns that and should.

A worked judgement. For `how to run payroll` the SERP shows six long guides, two vendor product pages, one video, one government page. Verdict: **split.** Publish `/blog/how-to-run-payroll` as a genuine step-by-step for someone doing it manually in a spreadsheet, linking to `/product/payroll-runs` for people who decide they want software. A pitch stops being one of the six guides Google is choosing among.

## Intent drifts, sometimes on a schedule

**Seasonal drift.** `payroll tax deadlines` is informational-reference all year, but in the first three weeks of January and again in late March, Meridian's Search Console data shows its impressions rising roughly fourfold with average position flat — more people, same page. `w2 form` drifts harder: in January it takes on a transactional edge and the SERP puts the IRS form and template pages ahead of explanatory articles. Check seasonal queries in season, not in July.

**Event drift.** A tax law change, a launch, or a publicised outage flips a query overnight. `payroll direct deposit delay` is normally a support query; the week a major bank has an ACH incident it becomes a news query and Top Stories appears above everything.

**Slow structural drift.** Queries that were informational five years ago turn commercial as a category matures; `payroll automation` has drifted this way. Re-read your top twenty SERPs annually. The cost is an hour; the failure mode is defending a page type that stopped being correct.

## Modifiers give intent away

Modifiers are reliable enough to prioritize which queries to check first, never reliable enough to skip checking.

| Modifier family | Examples | Usually signals |
| --- | --- | --- |
| Question words | how, what, why, when, does | Informational |
| Process words | steps, guide, tutorial, checklist | Informational (deep) |
| Superlatives | best, top, leading | Commercial investigation |
| Comparison | vs, versus, compared to, alternatives | Commercial investigation |
| Qualifiers | for small business, for 10 employees, for restaurants | Commercial (qualified) |
| Price words | pricing, cost, how much, cheap, free | Transactional or commercial |
| Action words | buy, download, get, generate, calculate, sign up | Transactional |
| Tool words | calculator, template, generator, tool | Transactional |
| Support words | not working, error, fix, troubleshoot, reset | Support |
| Brand names | meridian, paycadence, wagebase | Navigational |
| Year stamps | 2026, this year | Freshness demanded |

The trap: `free` is ambiguous. `free payroll template` is transactional; `free payroll software` is commercial investigation and returns roundups; `is payroll software free` is informational. The modifier narrows the field; the SERP decides.

## SERP anatomy: what is actually on the page

A modern results page is not ten blue links. Every element above your result changes what your ranking is worth. Read them in order.

**Ads.** Paid results appear above the organic results and sometimes below, marked "Sponsored." On a commercial query they can occupy the first screen entirely. Count them, note the space, move on. **How paid search works — bidding, budgets, ad copy, Quality Score — is dm230's subject and not taught here.**

**AI overviews.** A generated summary with source links. It pushes organic results well down and answers simple informational queries in place. Being cited drives some traffic; being outranked by one on a simple-answer query costs a lot. Triggering is inconsistent, so record what you see on the day rather than treating it as permanent.

**Featured snippets.** A single extracted answer — paragraph, list, or table — at or near the top of the organic results, drawn from a page that already ranks. Winning one is a formatting job: answer directly, in the snippet's format, near the relevant heading. Valuable on deep-explanation queries, often self-defeating on simple ones where the snippet answers fully and the click never happens.

**People Also Ask.** An expanding list of related questions — free evidence about the sub-questions behind a query and where Google sees ambiguity. It also eats vertical space and expands on click.

**Knowledge panels.** Entity information for a company, person, or thing, usually the right rail on desktop. Your company's panel on a branded query is good; a competitor's on your query is not something content dislodges.

**Sitelinks.** Extra links beneath a single result, usually the top one on a branded query. Not directly controllable; influenced by clear site structure — lesson 07.

**Video carousels and image packs.** A horizontal strip inserted into the organic results. A video carousel high on the page means a chunk of this audience wants to watch, and your text page competes for a smaller share.

**Top Stories.** News results, only on queries with live news demand. Present on a query you consider evergreen? Something has happened.

**Product grids and review stars.** Shopping-style results and star ratings in some snippets. E-commerce product-feed SEO is out of scope in this course.

**Forum and discussion results.** Reddit, Quora, and specialist threads now appear prominently on many commercial and troubleshooting queries. When they rank, people want candid peer opinion rather than vendor copy — usually meaning nearby vendor pages are not trusted here.

**Related searches.** Query variations at the foot of the page. Free evidence about adjacent intents.

## Pixel depth, and what a ranking is worth

The consequence of all that furniture: **position 1 does not mean top of the page.** What matters is how many vertical pixels a searcher travels before the first organic result, because on a phone that is scrolls.

Two Meridian queries, on a desktop viewport roughly 800 pixels tall:

```txt
QUERY A: "what is a payroll register"        QUERY B: "how do i void a payroll check"
--------------------------------------      --------------------------------------
   0px  search box                              0px  search box
  95px  AI overview (expanded)                 95px  Organic result 1
 640px  People Also Ask                       255px  Organic result 2
 890px  Organic result 1  <-- first click     415px  Organic result 3
                                              575px  People Also Ask
Depth to first organic: ~890px                Depth to first organic: ~95px
Screens of scroll on mobile: ~2.5             Screens of scroll on mobile: ~0
```

Same "position 1" in both cases. Radically different value.

Now the CTR question, framed honestly. Published click-through curves put position 1 on a plain ten-blue-links SERP somewhere around a quarter to a third of clicks, dropping steeply after position 3. On a feature-heavy SERP — ads, an AI overview, People Also Ask above the first organic result — the same position 1 commonly takes a fraction of that, plausibly closer to a tenth, because most of the audience is answered above the fold or clicks the furniture.

Treat those as **ranges with reasons, not a table to plug numbers into.** The published curves come from different data sets, years, query mixes, and device splits, and none is Google-published; a precise-looking CTR-by-position table is among the most confidently wrong artifacts in this industry. Carry forward the *shape*: the first three organic positions take most of the organic clicks, and everything above them takes its share first.

Your own data beats every published curve. Meridian's `/templates/` pages earn 7.9% CTR at position 11.2 while `/blog/` pages earn 2.0% at 21.6. Part is position; part is SERP shape, because template queries return clean, feature-light results where a download is what people want, while the blog's informational queries return AI overviews and People Also Ask that answer in place.

## The zero-click reality, stated honestly

A large share of searches end without a click to any website. Estimates vary by study, device, and whether "click" includes Google's own properties, and published figures disagree substantially — quote ranges and cite the source, never a single number.

The direction and mechanism are not in dispute. Simple factual questions are increasingly answered on the results page by AI overviews, featured snippets, and knowledge panels. The searcher is satisfied; nobody visits a site. You cannot optimize that away.

The strategic response: **stop measuring a query by whether you can rank for it, and start measuring it by whether ranking produces anything.** Queries whose answer fits in a sentence are increasingly not worth a page. Queries needing a tool, a document, a decision between named options, a real price, or a personal judgement still generate clicks, because the answer does not fit on the results page. That is why Meridian's `/templates/` section outperforms its blog per impression fourfold: you cannot put a downloadable spreadsheet in an AI overview.

Two footnotes. Appearing in a zero-click SERP still has brand value, partly observable as impressions without clicks in Search Console. And your page still has to *deserve* the snippet or citation — clear, accurate, structured, current.

## Judging the real opportunity

Classification tells you what to build. Opportunity judgement tells you whether to bother. Six questions, in order.

**1. Who ranks?**

- *Review sites and affiliates dominating*: the query is monetised by third parties. You can often rank, rarely first, and you are one voice among many.
- *Vendors' own pages ranking*: Google accepts first-party pages here. Good news for Meridian.
- *Forums high up*: people distrust vendor copy here. A vendor page can rank but must be unusually candid to hold.
- *Government or institutional sites*: you are competing with the source of truth. Usually a skip, or an angle rather than a duplicate.
- *One brand owning the page*: a navigational query for that brand.

**2. Is the result set homogeneous?** Ten pages of one type means Google is confident and you must match that type exactly. A mixed set means room for a different angle and less certainty about what wins.

**3. Are the ranking pages strong at page level, or coasting on the domain?** The most useful question and the one people skip. Open the top three and read them as pages. Do they answer the query well, use the right format, show current figures, carry the specifics a knowledgeable reader needs? Or are they thin pages ranking because a very strong site published them? A thin page on a strong domain is a real opportunity — you can beat the page without beating the domain, especially on long, specific queries. An excellent page on a strong domain is not worth your next quarter.

Two cautions. Page-level strength is a judgement call; write down your reasoning so you can check it later. And any third-party domain metric — Domain Rating, Domain Authority, Trust Flow — is a **vendor estimate from a vendor's own link crawl**, not a Google signal.

**4. Does the furniture take the click?** Do the pixel-depth read. If an AI overview and People Also Ask sit above every organic result and the query has a one-sentence answer, position 1 is worth far less than the ranking implies. Say so before someone spends three months earning it.

**5. Can you credibly produce the winning page type?** If it is a comparison of eight competitors, can you write it honestly? If it is a calculator, can engineering build it? An opportunity you cannot execute is not one.

**6. Would a visitor from this query ever become a customer?** `what is a payroll register` and `payroll software for 10 employees` are both winnable. Only one contains a buyer.

Then say no out loud when the answer is no. A defensible "do not target" verdict reads: *the SERP is dominated by page types we cannot credibly produce, the ranking pages are strong at page level, and an AI overview answers the query above them.*

## Three worked reads for Meridian

### Read 1 — `how to calculate payroll taxes` (informational)

```txt
SERP STACK (incognito, desktop, US, observed 14 Jun 2026)
------------------------------------------------------------
[ AI overview - 6 sentences + 4 source links ]
[ People Also Ask - 4 questions ]
 1. irs.gov/businesses/small-businesses ......... government guide
 2. accountingtoday.com/guide ................... long editorial guide
 3. paycadence.com/blog/calculate-payroll-taxes .. vendor blog guide
 4. [ Video carousel - 3 results ]
 5. nolo.com/legal-encyclopedia ................. legal reference
 6. wagebase.com/resources/payroll-tax-guide ..... vendor blog guide
 7. reddit.com/r/smallbusiness ................... forum thread
 8. investopedia.com ............................. reference article
[ Related searches ]
```

**Classification:** informational, deep-explanation. Nine of nine organic results are explanatory; not one is a product or pricing page. No ambiguity.

**Page-type verdict:** a long guide at `/blog/how-to-calculate-payroll-taxes` with a worked example at real 2026 rates, a table of employer and employee shares, and a downloadable worksheet. Not a product page, and not a guide with a pitch stapled on — the two vendor blogs here rank because they are genuine guides.

**Opportunity verdict: proceed, with limited expectations.** Vendor content clearly ranks (positions 3 and 6), so Google accepts first-party pages. But the AI overview plus People Also Ask push the first organic result far down, the IRS owns the definitive answer, and this is top of funnel. Expect tens of thousands of impressions at a CTR near the blog's 2.0%. The value is not the clicks — it is the worksheet download capturing the slice of that audience with an immediate payroll task.

### Read 2 — `best payroll software for small business` (commercial investigation)

```txt
SERP STACK (incognito, desktop, US, observed 14 Jun 2026)
------------------------------------------------------------
[ Sponsored - 4 ads, ~430px  (mechanics belong to dm230) ]
 1. pcmag.com/picks/the-best-payroll-software ... editorial roundup
 2. nerdwallet.com/best/small-business/payroll .. editorial roundup
 3. forbes.com/advisor/business/software ........ editorial roundup
 4. reddit.com/r/smallbusiness "what payroll..." . forum thread
[ People Also Ask - 4 questions ]
 5. techradar.com/best/best-payroll-software .... editorial roundup
 6. capterra.com/payroll-software ............... software directory
 7. paycadence.com/best-payroll-software ........ vendor roundup
 8. business.com/payroll-services ............... editorial roundup
[ Related searches ]
```

**Classification:** commercial investigation. Eight of nine organic results present multiple named options with criteria and a verdict. Nobody's homepage ranks.

**Page-type verdict:** if Meridian targets this at all, it must be a **roundup naming and fairly assessing competitors including PayCadence, Wagebase, and Sumner HR** — the type Google is choosing among. A Meridian homepage or product page cannot rank here; wrong type, and no on-page work changes that.

**Opportunity verdict: no-go for the head query; redirect the effort.** Four ads consume the first screen, the top five organic results are editorial publishers whose whole business is these roundups, and PayCadence's own roundup sits at position 7 — even the strongest vendor play lands below the fold. These pages are strong at page level, not coasting. Take the same buyer to queries where a vendor can win: head-to-head `/compare/...` pages, `alternatives` queries, and qualified variants like `payroll software for 10 employees`. Note the Reddit thread at position 4 — buyers want peer opinion here, which is a customer-story problem, not a page you can publish.

### Read 3 — `free payroll register template excel` (transactional)

This is the healthy March 2026 template read, before lesson 08's April–July noindex incident. The template-versus-blog CTR comparison above uses Jan–Mar 2026.

```txt
SERP STACK (incognito, desktop, US, observed 14 Mar 2026)
------------------------------------------------------------
[ Sponsored - 1 ad, ~110px ]
 1. templatelab.com/payroll-register ............ template download
 2. meridianpayroll.com/templates/payroll-register template download
 3. microsoft.com/templates ..................... template download
 4. wagebase.com/templates/payroll-register ..... template download
 5. smartsheet.com/payroll-templates ............ template download
[ People Also Ask - 3 questions ]
 6. exceldemy.com/payroll-register-template ..... tutorial + download
 7. sumnerhr.com/resources/templates ............ template download
[ Related searches ]
```

**Classification:** transactional (download). Seven of seven results offer a file. No AI overview, one ad. Nothing explanatory ranks above a download.

**Page-type verdict:** a template page — file preview, XLSX plus Google Sheets plus PDF, a short "how to use this" beneath the download, no email wall in front of the file. Meridian already ranks second with exactly this.

**Opportunity verdict: proceed and defend.** Near-zero furniture above the organic results, vendor pages ranking freely, a page type cheap to produce and improve, and a searcher performing a payroll task right now. This family is why `/templates/` earns 7.9% CTR against the blog's 2.0%. The defensive work is unglamorous: keep the file current for the tax year, add the formats competitors offer, keep the download one click away.

## Twelve queries, classified

Verdicts are Meridian-specific and assume no keyword volume data — lesson 04 adds that layer and will move some rows.

| Query | Class | Page type | Notable SERP features | Verdict |
| --- | --- | --- | --- | --- |
| `what is a payroll register` | Informational (simple) | Help doc | AI overview, PAA | No-go — answered above the fold |
| `how to calculate payroll taxes` | Informational (deep) | Long guide | AI overview, PAA, video | Go — low CTR, feeds template download |
| `2026 payroll tax deadlines` | Informational (reference) | Dated reference | PAA, no AI overview | Go — annual refresh, high seasonal demand |
| `how to run payroll` | Mixed (info + commercial) | Guide, linked to product | AI overview, video | Go — split; guide stays a guide |
| `best payroll software for small business` | Commercial (category) | Roundup | 4 ads, forum result, PAA | No-go — publishers own it |
| `paycadence vs wagebase` | Commercial (head-to-head) | Comparison page | Few features | Go — vendor comparisons rank |
| `sumner hr alternatives` | Commercial (displacement) | Alternatives page | PAA, forum result | Go — must list real alternatives |
| `payroll software for 10 employees` | Commercial (qualified) | Segment landing page | 2 ads, PAA | Go — buyer intent, less crowded |
| `payroll software pricing` | Transactional (buy) | Pricing page | Ads, PAA | Go — own the branded slice |
| `free payroll register template excel` | Transactional (download) | Template page | 1 ad only | Go — defend position |
| `payroll tax calculator` | Transactional (tool) | Interactive tool | Calculator widget, PAA | Conditional — only if engineering builds it |
| `meridian payroll login` | Navigational (own brand) | Login page | Sitelinks | Go — defend, never let a blog outrank it |

Read the pattern, not the rows. Every "no-go" is a query where the furniture takes the click or the required page type belongs to someone whose entire business is that page type. Every "go" is a query where a real page — a comparison, a tool, a file, a price — is what the searcher needs, and that cannot be summarised away.

## Practice

Classify a real query set by reading live SERPs. You need a browser and a private window. No paid tools required; if you have a keyword suite, do not open it — this is about SERP evidence, and volume and difficulty belong to lesson 04.

**Build the query set**

1. Pick a real site: your employer's, your cohort's practice site, or a business you know well. With Search Console access, open **Performance > Search results > Queries**, set the range to the last 3 months, export the top 40. Without access, write 15 queries you genuinely believe that business's customers type.
2. Select **at least fifteen queries** covering all four classes: three or more informational, two navigational, four commercial investigation, four transactional, and two genuinely ambiguous. The ambiguous ones are the point — do not quietly drop them.

**Read each SERP**

3. Search each query in a **private window, signed out**, using a fresh tab each time.
4. Record the elements **in vertical order**, including ads and every feature. Note how far down the **first organic result** sits — screen-heights are fine if you cannot measure pixels.
5. Classify the **top ten organic results by page type** (guide, roundup, comparison, product, pricing, category, tool, template, help doc, forum, video) and count them.
6. Note **who ranks**: vendors, review sites or affiliates, forums, institutional sites, or one brand dominating.
7. Open the **top three results** and judge each as strong at page level or thin-on-a-strong-domain, with one sentence of reasoning. Label any third-party domain metric as a vendor estimate.
8. Assign the intent class from page-type counts, not query wording. Where they disagree, **the SERP wins** — flag those rows, they teach the most.
9. Assign the page type from the mapping table, then check whether the site already has one. Note mismatches.
10. Give a **go / no-go verdict** with one sentence citing SERP evidence, not preference.
11. Repeat one query on a phone. Note what changed in element order, how much further down the first organic result sits, and what that implies for desktop-only reads.

**Deliverable — one table plus a short verdict note**

Submit a table with one row per query and these exact columns:

```txt
Query | Intent class | Evidence from the SERP | Correct page type |
SERP features present (in order) | Depth to first organic | Go / No-go | Reasoning (1 sentence)
```

Requirements: fifteen rows minimum; the Evidence column must cite page-type counts ("7/10 roundups, no vendor pages"), never intuition; two rows minimum must be a genuine no-go with a defensible reason; one must be a query where the wording suggested one class and the SERP proved another.

Beneath the table, add a note of no more than 200 words: the three queries representing the best real opportunity and why; the one query the site serves with the **wrong page type** and what type it should be; and the one query you would formally stop targeting. Come ready to defend the no-go verdicts — those are the ones people argue with.

## Check your understanding

1. The top ten for `payroll software for restaurants` shows six vendor landing pages, two roundups, one forum thread, and one video. What is the intent class, and what page type should Meridian build? *(Answer: commercial investigation, qualified; six of ten vendor pages means a segment landing page is the type Google accepts.)*
2. Why can position 1 be worth very different amounts on two queries? *(Answer: SERP furniture — ads, AI overviews, People Also Ask — changes the pixel depth to the first organic result and how many searchers are answered before they reach it.)*
3. A stakeholder wants a blog post to rank for `payroll tax calculator`. What do you tell them? *(Answer: the query is transactional (tool); a post is the wrong page type and no on-page work closes that gap. Build a calculator or stop targeting the query.)*
