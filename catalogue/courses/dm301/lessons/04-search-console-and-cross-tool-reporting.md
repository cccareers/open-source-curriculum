---
lesson_id: dm301-04
course_id: dm301
pathway: digital-marketer
title: Search Console and Cross-Tool Reporting
order: 4
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Combine Search Console and analytics data to answer a measurement question
  - Build a report a non-technical stakeholder can act on
---

## Start From the Question, Not From the Tool

The most common way an apprentice wastes a day is by opening a tool and looking around. You will find something. It will be interesting. It will not be the answer to anything anybody asked, because nobody asked anything.

A **measurement question** is a question specific enough that you can say, before you start, what kind of evidence would answer it and what would settle it either way. Kestrel's owner has one this month, and it is a good one:

> "We spend real money on the Trail Notes guides. Are they bringing in the right people, or are they just bringing in readers?"

That is answerable. It is also unanswerable with one tool, which is why this lesson exists. Search Console knows who found Kestrel and what they were looking for. GA4 knows what they did afterwards. Neither one knows the other half.

## The Line Falls at the Click

There is a hard boundary down the middle of organic measurement and it falls at the moment somebody clicks a search result.

**Search Console owns everything before the click.** It lives inside Google's search infrastructure. It knows the query typed, whether your page was shown, roughly where it sat, and whether it was clicked. It knows nothing about what happened next, because once the visitor leaves Google, Google's record of the visit ends.

**GA4 owns everything after the click.** It lives in a tag on your site. It sees a session begin, what was viewed, whether a purchase happened. It does not know the query, because search engines do not pass query text to destination sites. GA4 will tell you a session came from organic search; it will never tell you which search.

| Question | Search Console | GA4 | How you answer it |
| --- | --- | --- | --- |
| What did they search for? | Yes, in aggregate | No | Search Console, at page level, never per session |
| How many saw us and did not click? | Yes | No | Impressions minus clicks |
| Roughly where do we rank? | Yes, as an average | No | Average position, with heavy caveats |
| Did they buy? | No | Yes | GA4 key events by landing page |
| How engaged were they? | No | Yes | GA4 engagement metrics |
| Which query produced revenue? | Partly | Partly | Neither. You infer it by joining at the landing page, and you label it inferred |
| Do the two tools agree on traffic? | — | — | No, and they never will |

That last row is the one that saves you an argument every quarter, and it gets its own section below.

## The Four Search Console Metrics, Precisely

**Impressions.** Your URL appeared in a result set the user actually saw. The subtlety: a result that requires scrolling or a page-two click to become visible only records an impression once it is scrolled or paginated into view. Results buried deep therefore record far fewer impressions than the query's real demand.

**Clicks.** A click through to your site. Clicking, going back, and clicking the same result again in one search counts once.

**CTR.** Clicks divided by impressions, computed over whatever slice is currently on screen. It changes as you filter, because both of its components do.

**Average position.** The average of the topmost position your site held for each impression in the slice.

Four caveats change conclusions, and not knowing them is how apprentices report confidently wrong things.

**Average position is an average of averages and moves for reasons that are not ranking changes.** Kestrel's site average is 14.2. Publish twenty new guides that debut around position 40 and the site average gets worse while nothing that already ranked moved and clicks went up. Never headline a site-wide average position. Report it per page, alongside impressions and clicks.

**Roughly half of queries are withheld.** Google anonymizes queries rare enough to identify an individual. Those clicks and impressions are inside your totals, but the query rows are missing, so **query rows never sum to the total** — sometimes by more than half. Write "of the queries Search Console shows us" whenever the distinction matters.

**Filtered totals are not slices of unfiltered totals.** Anonymized queries cannot match any query filter, so filtering to queries containing "boots" returns far less than the real "boots" traffic. Do not do arithmetic across filtered and unfiltered views.

**The window is 16 months, and data lags one to two days.** Never diagnose from yesterday. Export monthly if you want year-over-year comparisons next year.

## Linking Search Console to GA4

You can link a Search Console property to a GA4 property in the admin section, which adds two reports under Acquisition: Queries, and Google organic search traffic by landing page. Two practical notes. The link must be made by someone who is an owner on the Search Console property and an editor on the GA4 property, so it usually requires a short conversation rather than a click. And **the reports are hidden until you publish them to a report collection** — a linked property with nothing visible is the single most common "the link is broken" support question, and it is not broken.

What the link gives you is convenience: the two data sets side by side, joined at the landing page, in one interface. What it does not give you is a per-session query. Nothing does. The link does not change the boundary; it just puts both sides of it on one screen.

Do the join in a spreadsheet anyway, at least the first few times. You will understand what the built-in report is doing, and you will be able to add columns it does not have.

## The Join

The landing page is the only field both systems record for the same visit, so **the landing page is the join key**. Here is Kestrel's 28-day period, Search Console on the left, GA4 organic sessions and purchases on the right.

| Landing page | SC clicks | SC impr. | CTR | Avg pos | GA4 sessions | Purchases | CVR | Engagement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/guides/how-to-pack-a-daypack` | 3,410 | 96,000 | 3.6% | 9.4 | 3,120 | 9 | 0.29% | 71% |
| `/collections/rain-jackets` | 2,180 | 71,000 | 3.1% | 11.8 | 2,010 | 61 | 3.03% | 60% |
| `/guides/sleeping-bag-temperature-ratings` | 1,940 | 88,000 | 2.2% | 13.1 | 1,780 | 4 | 0.22% | 69% |
| `/collections/hiking-boots` | 1,760 | 39,000 | 4.5% | 8.2 | 1,620 | 48 | 2.96% | 58% |
| `/products/kestrel-ridgeline-28` | 1,120 | 21,000 | 5.3% | 6.9 | 1,040 | 39 | 3.75% | 56% |
| `/guides/breaking-in-hiking-boots` | 980 | 44,000 | 2.2% | 15.6 | 900 | 3 | 0.33% | 73% |
| All other pages | 6,810 | 235,000 | 2.9% | 17.9 | 6,330 | 34 | 0.54% | 47% |
| **Total** | **18,200** | **594,000** | **3.1%** | **14.2** | **16,800** | **198** | **1.18%** | **58%** |

Before reading it, check it. GA4's organic sessions sum to 16,800 and its purchases to 198, which are exactly the Organic Search row from your traffic acquisition report. If a join does not reconcile to a total you already trust, stop and find out why before you interpret a single row.

## Answering the Question

Now answer what the owner asked, using only what the table supports.

**The guides bring the traffic.** The three guide pages together account for 6,330 of 18,200 clicks — 35 percent of all organic clicks — from 228,000 impressions.

**They almost never produce a same-session purchase.** Sixteen purchases across 5,800 organic sessions, a 0.28 percent conversion rate against 1.18 percent for organic overall and 3.0 percent on the collection pages.

**They are not failing at what they are good at.** Engagement rates of 69 to 73 percent are the highest on the site. These pages are read.

**One of them is under-earning its own visibility.** `/guides/sleeping-bag-temperature-ratings` records 88,000 impressions — more than the rain jackets collection — and converts them to clicks at 2.2 percent from position 13.1. `/guides/how-to-pack-a-daypack` sits at position 9.4 and earns 3.6 percent. The gap is mostly position, not persuasion, and that is a content and search problem rather than an analytics one. Note it and hand it to whoever owns organic search.

Now the part that makes you useful rather than merely correct. **The table cannot tell you whether guide readers come back and buy later.** GA4's default reports are session-scoped and last-click; a reader who returns three weeks later through a branded search or an email will be counted under that later channel. Formal attribution modeling is outside this course, and pretending otherwise would be the easiest way to mislead your own client.

So say what you can support and name the gap:

> Guides bring 35 percent of organic clicks, are read thoroughly, and rarely produce a sale in the same visit. Whether they produce sales *later* is not something this data answers. What we can do about it is measurable: 396 of last period's 1,340 newsletter signups came from guide pages, and email converts at 2.20 percent against a 1.32 percent site average. If a guide's job is to produce a subscriber, we can measure that this month.

That paragraph is worth more than any chart, because it converts an unanswerable question into an answerable one and proposes the measurement.

## Why the Two Tools Disagree, and What to Do About It

Search Console reports **18,200 clicks**. GA4 reports **16,800 organic sessions**. That is a gap of 1,400, or **7.7 percent**, and it is completely normal.

They are counting different things. Search Console counts a click on a search result. GA4 counts a session that started on your site and whose tag executed. Between those two events sit ad blockers, declined consent, visitors who leave before the tag runs, redirects, prefetching, sessions that GA4 attributes to a different channel because a campaign parameter was present, and two systems using different time zones and different day boundaries.

Expect a gap in the range of roughly 5 to 20 percent, with Search Console higher. Three rules:

**Do not try to reconcile it.** You cannot, and the attempt consumes days.

**Pick one as the official click number and be consistent.** Search Console for clicks, GA4 for what happened after. Never present both in the same column of the same table.

**Watch the gap as a monitor.** A gap that has been stable at 7 to 8 percent for six months and suddenly becomes 30 percent is a tracking break — probably a tag missing from a template — and you have just found it for free.

## Building the Report a Non-Technical Stakeholder Can Act On

Kestrel's owner runs a retail business. She does not want your table. She wants to know what to do on Monday.

A report is a **decision document**. One page, this order:

```txt
1. THE QUESTION       one line, in her words, not yours
2. THE ANSWER         one paragraph, leading with the conclusion
3. THE EVIDENCE       the smallest table that supports it
4. WHAT I RECOMMEND   one or two actions, each with an effort and an expected effect
5. WHAT I CANNOT TELL YOU YET   and what it would take to find out
```

Five habits make it credible.

**Lead with the answer.** Method goes at the bottom or in an appendix. A report that opens with "I exported Search Console filtered to the last 28 days" has lost the reader before the finding.

**Translate the metric into her language.** Not "organic sessions with a landing page in the guides directory." Rather: "about a third of the people who find us through Google arrive on a how-to article."

**Show the arithmetic for any money claim** so she can check it rather than trust it. One line of division is enough.

**State the uncertainty in the report, not in a footnote.** A report that admits its limits is trusted more, not less, and it protects you when somebody acts on a number you never claimed was precise.

**Name a next step even when the answer is "we do not know."** "I cannot tell you whether guide readers buy later; here is the one change that would let us find out next month" is a useful answer. "Inconclusive" is not.

Two things to leave out. Do not include a metric because it was in the export — every row should be there because it supports the answer. And do not include average position as a headline, for the reason above; if you must show it, show it per page with impressions beside it.

Here is the evidence table for the guides report, cut down to what actually supports the answer. Compare it to the nine-column join above.

```txt
Where Google visitors arrive, and what they do        (28 days)

  Page type          Visits from Google   Read it   Bought same visit
  ------------------------------------------------------------------
  How-to guides                   5,800       71%          16
  Category pages                  3,630       59%         109
  Product pages                   1,040       56%          39
  Everything else                 6,330       47%          34
  ------------------------------------------------------------------
  Total                          16,800       58%         198

  Guides bring the most visitors and the fewest same-visit sales.
  396 of last period's newsletter signups came from guide pages.
```

Four columns, no jargon, and the conclusion is visible without anybody being told it. That is the deliverable.

## Practice

You need Search Console access to a property, and GA4 access to the same site if possible. If you cannot get GA4, do every step except the join and say so explicitly in your memo — stating what you could not do is part of the skill.

**Part 1 — Write the question.** Before opening anything, write one measurement question in a stakeholder's words, plus one sentence saying what evidence would answer it and one sentence saying what would prove you wrong. If you cannot write the second sentence, the question is not specific enough yet.

**Part 2 — Record the property's shape.** Domain property or URL-prefix property, and one line on what that includes and excludes. Note the date range you are using and why it is that length.

**Part 3 — Build the join.** Export Search Console clicks, impressions, CTR, and position by page for a 28-day window. Export GA4 sessions, engagement rate, and key events by landing page for the same window, filtered to organic search. Join by URL in a spreadsheet. Add a `page_group` column, because almost every useful conclusion comes from grouping rather than from single URLs.

**Part 4 — Reconcile to a total you trust.** Confirm that your GA4 columns sum to the organic totals in the standard report. If they do not, find out why before continuing and write down the cause.

**Part 5 — Measure the gap.** Compute Search Console clicks minus GA4 organic sessions as a percentage. State the figure, list at least three reasons it exists, and write the one sentence you would put in a report so that nobody asks you to make the numbers match.

**Part 6 — Answer the question.** Three to five findings, each with the numbers that support it, and each with one alternative explanation you ruled out and how. At least one finding must be a page whose click performance and post-click performance disagree.

**Part 7 — Write the one-page report.** Use the five-part structure. Include the cut-down evidence table with no more than five columns and no jargon. Include one recommendation with an effort estimate and an expected effect. Include the "what I cannot tell you yet" section, and make sure formal attribution appears in it rather than in your conclusions.

**Part 8 — Read it aloud to somebody outside marketing.** Ask them to tell you, without prompting, what you are recommending and why. Whatever they get wrong is a defect in your report, not in their attention. Rewrite that part and note what you changed.
