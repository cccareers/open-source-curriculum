---
lesson_id: dm201-09
course_id: dm201
pathway: digital-marketer
title: Publishing SEO Content in a CMS
order: 9
kind: lesson
competency_ids:
  - D2-S1-C02
  - D2-S1-C01
objectives:
  - Publish and optimize SEO content in a content management system
  - Adapt one piece of content for search and for other distribution channels
---

## Where the Words Meet the Machine

You have a finished draft. Someone researched the keyword, someone wrote the piece, someone edited it. None of that reaches a searcher until the piece is correctly entered into a content management system, published at a sensible URL, wired into the rest of the site, and adapted for the channels where your audience spends time.

This lesson is about that step and only that step. Planning what to write, editorial calendars, and the craft of writing belong to dm270. How to compose a title tag or a heading structure belongs to lesson 06; here you learn where those values live in a CMS and how what you type in a field becomes what ships in the HTML.

The running example is **Meridian Payroll** (meridianpayroll.com), a small-business payroll software company with about 640 indexable URLs across `/`, `/pricing`, `/product/`, `/compare/`, `/help/`, `/blog/` (roughly 310 posts) and `/templates/`. Search Console shows 41,300 clicks and 1,240,000 impressions over the last three months at 3.3% CTR and average position 18.4. You are publishing `/blog/payroll-tax-deadlines` and then adapting it for four other channels. The shared Performance baseline covers Jan–Mar 2026; later diagnostic exports name their own scope.

## The CMS Mental Model That Transfers

Every CMS is the same three things wearing different clothes. Learn the model once and you can be productive in an unfamiliar system in an afternoon.

**Content types.** A CMS stores content as records of a defined type — a post, a page, a help article, a product. Each type has its own fields and its own SEO behavior, which is why a change that works on your blog may do nothing on your product pages.

**Templates.** A template is the code that turns a record into HTML. It decides which fields appear in the visible page, which appear in the `head`, which are ignored entirely, and what markup wraps each one. You usually do not own the template — a theme author, an agency, or your engineering team does.

**The editor versus the theme.** The editor is where you type. The theme is what renders. They are separate layers, and the gap between them is where publishing bugs live.

That gap produces the single most important rule in this lesson:

```txt
What you type in a field is NOT necessarily what ships in the HTML.

  field value  →  template logic  →  rendered HTML  →  what Google sees

The only proof is view source on the published URL.
Never assume. Always look.
```

Three ways the gap bites. A theme may truncate your meta description at 120 characters even though the field let you type 200. It may ignore your SEO title field and print the post title in the `title` element. It may inject its own canonical alongside your plugin's, giving the page two conflicting canonicals — the defect lesson 08 found on Meridian's comparison pages. In all three the field looks right in the editor and the output is wrong.

## The Seven Fields That Decide SEO Output

These seven exist in every CMS. The labels change, the location changes, the behavior does not.

### 1. The SEO title field versus the on-page H1 field

This is the confusion that costs more organic traffic than any other CMS mistake, so be precise about it.

- The **SEO title** (sometimes "meta title," "SEO title tag," "browser title," "document title") becomes the `title` element in the `head`. It is what search engines read and what usually appears as the blue link in a result. It is never visible on the page itself.
- The **H1** is the visible headline at the top of the article, rendered as an `h1` element in the body.

They serve different readers. The `title` competes on a crowded results page against nine other listings and is truncated around 580 pixels — call it 55 to 60 characters. The `h1` greets someone who has already clicked and can be longer and more human.

The trap is leaving the SEO title empty. Most systems fall back to the post title, which is usually also the source of the `h1`, so you get an identical `title` and `h1`. Sometimes that is fine. Often it is not: your `h1` may read "Everything Small Businesses Need to Know About Payroll Tax Deadlines in 2026" — 78 characters cut off mid-word in the SERP.

Worse, some themes wire these fields the other way round, printing the SEO title as the visible headline or ignoring your override entirely. **You cannot know which behavior your theme has without publishing one post and reading the source.** Do that once per content type and write the answer down for your team.

**Failure mode:** blank SEO title, so the `title` inherits a 78-character headline, gets truncated in results, and your CTR sits below what the position deserves.

### 2. The slug and permalink structure

The **slug** is the last segment of the URL — `payroll-tax-deadlines`. The **permalink structure** is the site-wide pattern that decides what comes before it: `/blog/{slug}`, `/{year}/{month}/{slug}`, `/?p=1841`.

Slug rules: lowercase, hyphens between words, no unnecessary stop words, no dates unless the content is genuinely time-stamped, short enough to read in a snippet. `payroll-tax-deadlines` is good; `everything-small-businesses-need-to-know-about-payroll-tax-deadlines-in-2026` is not.

Permalink structure is a one-time architectural decision, and changing it rewrites every URL on the site — every old URL then needs a one-hop 301. Date-based structures are the usual regret: `/2026/01/payroll-tax-deadlines` visibly ages the piece and makes an evergreen refresh awkward.

**Failure mode:** editing the slug of a post that is already indexed and ranking without setting up a redirect, which turns a ranking URL into a 404 and throws away every link pointing at it.

### 3. The meta description or excerpt field

The meta description becomes the `meta` description element. It is not a ranking factor; it is ad copy for a free ad slot, and its job is to earn the click. Google rewrites it more often than not, choosing a passage that matches the query better, but a good description still wins the impressions where it is used.

Many systems conflate this with the **excerpt**, the short summary shown on archive pages. Depending on the theme, one field may feed both, or the excerpt may leak into the description when the description is blank, or an auto-generated excerpt may take the first 55 words of the article — usually a throat-clearing sentence, not a pitch.

**Failure mode:** the description field is left empty, the theme auto-fills from the opening sentence, and 310 blog posts ship with descriptions beginning "In this article we will look at..." Aim for 140 to 160 characters, written for the searcher.

### 4. The canonical override field

Most SEO plugins and modern CMS platforms expose a field where you can force the canonical URL. Left blank it emits a self-referencing canonical, which is what you want more than 95% of the time.

Use the override only when you know exactly why: a piece republished from another site of yours, a landing page that duplicates an existing article for a campaign, a variant page that exists for a partner. Lesson 08 covers the mechanics and the reasons Google sometimes ignores your choice.

**Failure mode:** an override copied from a duplicated post. Someone clones an existing post to save typing, the canonical field comes along with the clone, and the new post canonicals to the old one — so the new post is never indexed. Always check the canonical field on any post created by duplication.

### 5. The robots or noindex toggle

A switch, usually labeled something like "allow search engines to show this page." Off means the template writes `noindex` into the `head`.

Use it for thank-you pages, gated-download confirmation pages, internal landing pages, near-duplicate campaign variants, and thin archives. Never use it on anything you want ranked, and remember from lesson 08 that a `noindex` cannot be seen if the URL is also blocked in robots.txt.

**Failure mode:** the site-wide "discourage search engines" switch left on after a staging build or a relaunch, applying `noindex` to every URL. This is the number one launch disaster in the trade. It is also invisible from the editor. Check it on launch day and again a week later.

### 6. The featured image, social image, and alt text

The **featured image** is the record's main image, used in archive listings and often as the social preview. Some systems separate a dedicated **social image**; when they do not, the featured image is what gets shared.

Three things to get right. Size it correctly — a 4000-pixel-wide photo straight from a camera is the most common cause of a failing LCP on a blog template. Name the file descriptively before upload: `payroll-tax-calendar-2026.jpg`, not `IMG_4471.jpg`. And write **alt text** describing the image for someone who cannot see it: "Calendar showing 2026 federal payroll tax deposit due dates." Alt text is an accessibility requirement first and an image-search signal second; decorative images take empty alt text.

**Failure mode:** alt text used as a keyword dumping ground. It helps nothing, and it makes the page hostile to screen-reader users.

### 7. Taxonomy: categories, tags, and the archives they generate

Categories and tags are the CMS's built-in classification system, and they are the quiet source of index bloat.

- **Categories** are a small, planned hierarchy — the shelves of your content library. Meridian uses fourteen: Payroll Basics, Tax Compliance, Benefits, Hiring, and so on. Every post gets exactly one.
- **Tags** are freeform labels. They multiply. One writer types "payroll taxes," another types "payroll tax," a third types "Payroll Tax," and you now have three tags with two posts each.

The problem is that **every term you create silently generates an archive page** — `/blog/category/tax-compliance`, `/blog/tag/payroll-taxes` — and by default those are indexable. That is how Meridian ended up with 1,140 indexed tag archives holding one to three posts apiece, which lesson 08's audit found as a Tier 2 finding.

The decision rule:

| Archive type | Index it? | Why |
| --- | --- | --- |
| Category with 8 or more posts and a written intro | Yes | A genuine hub page; can rank for the topic and passes internal links |
| Category with fewer than 8 posts | Usually no | Too thin to be useful; revisit as it grows |
| Tag archives | No, by default | Near-duplicates of each other and of category pages |
| Author archives on a one-author blog | No | Duplicates the blog index |
| Date archives | No | No search demand, pure duplication |

Set `noindex, follow` on the archives you exclude — `follow` so link equity still flows through to the posts — and keep those URLs out of your sitemap.

**Failure mode:** letting every writer invent tags freely. Agree a fixed tag vocabulary, or turn tags off.

## The Same Seven Fields in Three System Shapes

The fields do not move. Their location and their owner do.

**A traditional CMS with an SEO plugin.** The editor screen holds the content fields — title, body, excerpt, featured image, categories, tags — and the plugin adds a panel below it holding the SEO title, meta description, canonical override, robots toggle, and social preview fields. Permalink structure lives in a site-wide settings screen, not on the post. **Template ownership:** the theme plus the plugin, which is why duplicate-output conflicts are common here — when both want to write the `title` or the canonical, you get two.

**A visual site builder.** Content and layout are the same object; you drag blocks onto a canvas. SEO fields sit in a per-page settings panel reached from the page list, holding the SEO title, description, slug, social image, and an indexing toggle. Canonical overrides are sometimes unavailable, and if so that constraint has to be part of your content plan, because you cannot fix a duplication problem after the fact. **Template ownership:** the platform. Fewer conflicts, less control, and you generally cannot change what the `head` emits.

**A headless CMS with a separate front end.** The CMS stores structured content and knows nothing about HTML, so SEO fields exist only if someone built them into the content model: typically `seoTitle`, `metaDescription`, `slug`, `canonicalUrl`, a `noIndex` boolean, an `ogImage` reference, and taxonomy relations, often grouped into an "SEO" object per content type. The front-end application reads those fields and writes the `head`. **Template ownership:** the front-end developers, entirely. If a field you need does not exist, no plugin will add it — it is a development ticket. Once the mapping is built correctly it is consistent everywhere.

Whatever the shape, do this on your first day in a new system: publish one test record, view source on the live URL, and write a mapping table from field name to output element.

## Open Graph and Twitter/X Card Fields

Open Graph and Twitter/X card fields control the **preview card** shown when your URL is pasted into a social network, chat app, or messaging tool. They are not ranking factors. They matter because a link with a proper image, title, and description gets clicked far more often than a bare URL.

In most systems these default from your SEO fields: `og:title` from the SEO title, `og:description` from the meta description, `og:image` from the featured image. Override them when the social framing should differ — search rewards specificity, social rewards curiosity and a strong image.

Two practical notes. Platforms cache the card aggressively, so a fixed image may take days to appear; each has a card-validator tool that forces a refresh. And `og:image` wants a landscape image around 1200 by 630 pixels — a tall image gets cropped badly in feed.

## The Publishing Checklist

**Before you publish (13 checks)**

| # | Check | Why |
| --- | --- | --- |
| 1 | Correct content type selected | Content type determines the template and the URL pattern |
| 2 | Slug is short, lowercase, hyphenated, no stop words | Readable in results; permanent once indexed |
| 3 | SEO title completed, not left to fall back | Prevents a truncated headline becoming the `title` |
| 4 | H1 present exactly once and matches the reader's expectation | One `h1` per page; the visible promise of the article |
| 5 | Meta description written, 140–160 characters | It is your free ad copy |
| 6 | Heading hierarchy is sequential, no skipped levels | Structure for readers, screen readers, and parsers |
| 7 | Canonical field blank unless there is a stated reason | Blank means self-canonical, which is right almost always |
| 8 | Robots toggle set to indexable | Catches the cloned-post and staging defaults |
| 9 | Featured image set, sized under about 200KB, descriptively named | The most common cause of a failing LCP |
| 10 | Alt text written for every meaningful image | Accessibility first, image search second |
| 11 | One category assigned; tags from the agreed vocabulary only | Prevents archive bloat |
| 12 | Internal links out to 3–5 relevant existing pages | Distributes authority and gives context (lesson 07) |
| 13 | Preview rendered on a phone-width viewport | Mobile rendering is what gets indexed |

**At publish (3 checks)**

| # | Check | Why |
| --- | --- | --- |
| 14 | Publish date correct and in the right time zone | Feeds `lastmod` and any displayed date |
| 15 | Author assigned to a real person with a bio | Supports the experience signals in lesson 02 |
| 16 | Status is Published, not Scheduled or Pending review | The single most common "why is it not live" answer |

**After you publish (6 checks)**

| # | Check | Why |
| --- | --- | --- |
| 17 | View source and confirm `title`, description, canonical, robots | Proves field-to-output mapping; the only real evidence |
| 18 | Load the live URL on a phone | Confirms the mobile rendering carries the full content |
| 19 | URL Inspection live test in Search Console | Confirms Google can fetch, render, and index it |
| 20 | Add inbound internal links from at least 3 existing pages | New posts have no authority until something links to them |
| 21 | Confirm the URL appears in the XML sitemap | Discovery; also confirms it is treated as indexable |
| 22 | Share the social preview once and check the card renders | Catches a missing or badly cropped `og:image` |

## Worked Publication: `/blog/payroll-tax-deadlines`

This is the initial 6 January 2026 publication, before lesson 06's July optimization. The original article describes the dates in prose and offers a downloadable calendar; its on-page tables and stronger search copy come later. This example demonstrates correct field mapping, not optimized copy: the generic title and description are the weaknesses diagnosed in lesson 06. Here is every field, with the exact value entered.

| Field | Value entered |
| --- | --- |
| Content type | Blog post |
| Post title (drives H1) | Payroll Tax Deadlines |
| Slug | `payroll-tax-deadlines` |
| Permalink structure (site setting) | `/blog/{slug}` |
| SEO title | Blog \| Payroll Tax Deadlines You Need to Know About in 2026 \| Meridian Payroll |
| Meta description | Learn about federal payroll tax deadlines for small businesses in 2026, why timely payments matter and how to prepare for filing and deposit dates. |
| Excerpt | A month-by-month calendar of 2026 federal payroll tax deadlines for small employers. |
| Canonical override | (blank — self-canonical) |
| Robots toggle | Indexable |
| Featured image | `payroll-tax-calendar-2026.jpg`, 1200 × 630, 148KB |
| Featured image alt text | Calendar grid showing 2026 federal payroll tax deposit and filing due dates |
| Category | Tax Compliance |
| Tags | `payroll-tax` (from the agreed vocabulary) |
| Open Graph title | The 2026 Payroll Tax Calendar Every Small Employer Needs |
| Open Graph description | Deposit dates, filing dates, and the penalty schedule if you miss one. |
| Open Graph image | Same as featured image |
| Author | Dana Whitfield, Payroll Compliance Lead |
| Publish date | 2026-01-06 09:14 UTC |

The rendered `head` on the published URL, with the mapping visible:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog | Payroll Tax Deadlines You Need to Know About in 2026 | Meridian Payroll</title>
  <meta name="description" content="Learn about federal payroll tax deadlines for small businesses in 2026, why timely payments matter and how to prepare for filing and deposit dates.">
  <link rel="canonical" href="https://meridianpayroll.com/blog/payroll-tax-deadlines">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="The 2026 Payroll Tax Calendar Every Small Employer Needs">
  <meta property="og:description" content="Deposit dates, filing dates, and the penalty schedule if you miss one.">
  <meta property="og:url" content="https://meridianpayroll.com/blog/payroll-tax-deadlines">
  <meta property="og:image" content="https://meridianpayroll.com/img/payroll-tax-calendar-2026.jpg">
  <meta name="twitter:card" content="summary_large_image">
</head>
```

Read that against the field table and the mapping is exact: the SEO title became `title`, the post title did not; the meta description field became the description element and the excerpt did not appear in the `head` at all; the blank canonical field produced a self-referencing canonical; the indexable toggle produced `index, follow`; the featured image became `og:image`.

**Post-publish QA, and what a pass looks like.**

1. **View source.** Confirm the `title` is the SEO title and not the post title, exactly one canonical element exists and points at this URL, the robots value is `index, follow`, and the description matches what you typed. *Pass:* all four correct, one canonical only.
2. **Mobile check.** Load the live URL on a phone. *Pass:* the full article text is present, the calendar table scrolls horizontally inside its own container rather than pushing the page sideways, and no modal covers the content on arrival.
3. **URL Inspection live test.** In Search Console, inspect the URL and run **Test live URL**, then open **View tested page**. *Pass:* "URL is available to Google," the rendered HTML contains a distinctive sentence from the body and the `href` values of your internal links, no page resources are blocked, and the user-declared canonical matches the URL. Then click **Request indexing**.
4. **Internal links in.** Add a contextual link from three existing pages: `/help/payroll-tax-basics`, `/blog/quarterly-941-filing-guide`, and the `/blog/category/tax-compliance` intro. *Pass:* each link uses descriptive anchor text, sits in body copy rather than a footer, and points at the final URL with no redirect.
5. **Sitemap check.** Confirm the URL appears in `sitemap-blog.xml` and that `lastmod` reflects today. *Pass:* present, with an honest date.

## Updating Content

Most of your publishing work will be updates, not new posts, and the recurring question is whether to edit the existing URL or publish a new one.

```txt
Is the target query the same as before?
  |
  ├─ YES → Is the page ranking or holding links?
  |         ├─ YES → EDIT IN PLACE. Never change the URL.
  |         └─ NO  → EDIT IN PLACE anyway. A new URL starts from zero.
  |
  └─ NO  → Is this genuinely a different topic?
            ├─ YES → NEW URL. Leave the old post alone, or 301 it
            |        if it is now redundant.
            └─ NO  → EDIT IN PLACE.
```

The default is edit in place. A URL accumulates history, internal links, and external links; publishing a near-identical piece at a new URL throws that away and creates a duplicate you then have to consolidate. Change a slug only when the URL is actively wrong — a typo, a stale year, a restructure — and always with a one-hop 301.

**Honest date handling.** Do not touch the publish date for a typo fix, a broken-link repair, or a light edit. There is no ranking trick in a fresh date, and there is a credibility cost when a reader sees "Updated last week" on an article still citing 2023 figures. If the platform supports it, show both an original publish date and a last-updated date, and change the updated date only when the content genuinely changed.

**When a refresh justifies a new publish date.** When the substance is materially different: rewritten sections, new data replacing outdated figures, a changed recommendation, added scope. Meridian's annual deadline refresh is exactly this — every date changes — so a new publish date is honest. Update `lastmod` in the sitemap and re-run the post-publish QA, because a substantial edit can break a canonical or a robots setting just as easily as a new post can.

## Adapting One Asset for Four Channels

Publishing to your site is one distribution channel. The same research can serve four or five more, and the principle that makes it work is this: **each channel gets a native format, not a copy-paste.** A blog post pasted into LinkedIn reads as a wall of text and gets no reach. A blog post pasted into an email gets deleted. The asset is the *research*; the article is one expression of it.

```txt
CHANNEL ADAPTATION MATRIX — asset: 2026 payroll tax deadline research

Channel        Format          Length        Job of the piece      Primary CTA
-----------    ------------    ----------    ------------------    ---------------
Website/SEO    Long article    1,800 words   Rank + convert        Free calendar
Email          Plain-text      180 words     Reactivate + remind   Read the post
LinkedIn       Native post     140 words     Reach + credibility   Comment / link
Short video    30-45s script   ~110 words    Awareness             Link in caption
One-pager      PDF / slide     1 page        Sales + partner use   Book a demo

Rule: never post the same words twice. Same facts, native format.
```

### The email

```markdown
Subject: The 2026 payroll deadline you are most likely to miss
Preview text: February 2 is closer than it looks.

Hi Priya,

Most small employers get the quarterly deadlines right and then miss
February 2 — the day W-2s go to employees, Form 940 is due, and Q4's
Form 941 lands. Three obligations, one date.

We put every 2026 federal payroll deadline into one calendar, month by
month, with the penalty schedule for each. It took our compliance team a
week to assemble and it will take you four minutes to read.

**See the 2026 calendar** → [link]

If you would rather have it on the wall, the printable version is at the
bottom of the post.

— Dana Whitfield, Payroll Compliance Lead, Meridian
```

One hook instead of twelve months of dates, a named reason to care, a single call to action, and a length that survives a phone screen.

### The LinkedIn post

```markdown
February 2, 2026 is three deadlines wearing one hat.
January 31 falls on a Saturday, so the standard filing dates roll forward.

W-2s to employees. Form 940 for the year. Form 941 for Q4.

Every small employer I talk to has the quarterly rhythm down. Year-end is
where it breaks, because three obligations land on the same square of the
calendar and the Q4 one feels like it belongs to last year.

The penalty for a late deposit starts at 2%; after an IRS notice,
the highest tier can reach 15%. These are deposit penalties, separate from filing penalties.
On a $40,000 late deposit, $800
becomes $6,000.

We mapped all twelve months of 2026 federal payroll deadlines into one
calendar. Free, no gate. Link in the comments.

What is the deadline your team always has to be reminded about?
```

Short lines for the mobile feed, one concrete number with the arithmetic done, the link in the first comment rather than the post, and a question at the end because comments are what earn reach.

### The short-video script outline

```txt
0:00-0:04  HOOK (on camera, no intro)
           "February 2nd is three payroll filing deadlines, not one.
            Most small employers only remember two."

0:04-0:12  PROBLEM (b-roll: calendar with the date circled)
           "W-2s to your employees. Form 940 for the year.
            Form 941 for the fourth quarter. Same day."

0:12-0:24  STAKES (on-screen text: 2% → 15%)
           "Late deposit penalties start at 2 percent and climb
            to 15 at the IRS notice threshold. Filing penalties are separate.
            On a forty-thousand-dollar deposit that's eight hundred
            dollars turning into six thousand."

0:24-0:35  PAYOFF (screen recording: scroll the calendar)
           "We built a calendar with all twelve months of 2026
            federal payroll deadlines. Free, no email required."

0:35-0:42  CTA
           "Link's in the caption. Save this before February."

CAPTION: Three deadlines, one date. The full 2026 payroll calendar → [link]
```

### The one-page summary

A single slide or PDF for the sales team and for partner accountants:

```markdown
2026 FEDERAL PAYROLL DEADLINES — AT A GLANCE

Standard filing dates in 2026
  Feb 2 — 2025 W-2s to employees and SSA, 2025 Form 940, Q4 2025 Form 941
  Apr 30 — Q1 Form 941
  Jul 31 — Q2 Form 941
  Nov 2 — Q3 Form 941

Deposit schedules
  Monthly depositors: normally the 15th of the following month.
  Weekend/holiday rollovers and the $100,000 next-day rule also apply.
  Semi-weekly depositors: Wednesday or Friday, depending on payday.

What a late deposit costs (separate from late filing)
  1–5 days late 2% · 6–15 days 5% · over 15 days 10%
  · 15% after the IRS notice threshold (see source below)

How Meridian helps
  Automatic deposit scheduling, filing reminders 10 days out, and a
  compliance dashboard showing every upcoming obligation.

Full calendar: meridianpayroll.com/blog/payroll-tax-deadlines
```

The dates follow [IRS Publication 509 (2026)](https://www.irs.gov/pub/irs-pdf/p509.pdf): February 2 covers the 2025 year-end forms, while November 2 covers Q3 2026. Qualifying timely deposits allow extra return-filing time. Under the [IRS deposit penalty rules](https://www.irs.gov/payments/failure-to-deposit-penalty), 15% applies more than ten days after the first notice, or on receipt of an immediate-payment demand, whichever is earlier. These tiers replace each other; they do not add up. On $40,000, 2% = $800 and 15% = $6,000.

### Syndication and canonical rules

When the same piece is republished somewhere else — a partner blog, an industry publication, a content platform — you have two acceptable outcomes and one bad one.

| Situation | What to ask for | Fallback |
| --- | --- | --- |
| Partner republishes the full piece | A `link rel="canonical"` on their copy pointing at your original URL | A `noindex` on their copy |
| Partner will not add either | An excerpt of no more than 30% with a prominent link to your full piece | Decline the syndication |
| You republish your own piece on a platform you control | Canonical on the copy back to your original | `noindex` on the copy |

The bad outcome is a full duplicate with no canonical and no `noindex` on a site with more authority than yours, which can result in their copy being the version Google shows. A canonical is only a hint, so ask a partner for all three: canonical back to the original, a followed link in the first two paragraphs, and no headline edit that changes the topic.

Put in writing: the canonical or `noindex` commitment, the link and its placement, the publication date (ideally a few days after yours), and how long the copy stays up.

### UTM tagging so lesson 11 can measure this

Every non-organic link you publish should be tagged, or the traffic lands in analytics as "direct" and none of this work is attributable. Use a consistent convention: lowercase, hyphens not spaces, `source` = the platform, `medium` = the channel class, `campaign` = the asset.

```txt
Email:
https://meridianpayroll.com/blog/payroll-tax-deadlines
  ?utm_source=newsletter&utm_medium=email&utm_campaign=payroll-deadlines-2026

LinkedIn (organic post):
https://meridianpayroll.com/blog/payroll-tax-deadlines
  ?utm_source=linkedin&utm_medium=social&utm_campaign=payroll-deadlines-2026

Short video caption:
https://meridianpayroll.com/blog/payroll-tax-deadlines
  ?utm_source=youtube&utm_medium=social&utm_campaign=payroll-deadlines-2026
  &utm_content=short-feb2

One-pager PDF (sales + partners):
https://meridianpayroll.com/blog/payroll-tax-deadlines
  ?utm_source=sales-onepager&utm_medium=partner&utm_campaign=payroll-deadlines-2026

NEVER tag internal site-to-site links. UTMs on internal links
break the session and overwrite the real acquisition source.
```

Two rules that keep the data clean. Tagged URLs create parameter versions of your page, which is exactly why every page carries a self-referencing canonical to the clean URL — lesson 08's tracking-parameter scenario. And never put a UTM on a link from one page of your own site to another.

## Practice

Publish a draft into a CMS with every field completed correctly, then build the four-channel adaptation pack.

Use any CMS you can publish to: your employer's site, a client site, or a free personal blog. Use a supplied draft or one you have written; this exercise is about publishing and adaptation, not about writing the piece.

**Steps**

1. Identify the content type you are publishing into and note the URL pattern it produces.
2. Publish one throwaway test record first. View source on the live URL and write your **field-to-output mapping table**: field name in the editor, the element it produced, and whether the value survived intact. Note anything the theme overrode. Delete the test record afterwards.
3. Enter the real draft. Complete all seven fields deliberately: SEO title (55–60 characters, distinct from the H1), slug, meta description (140–160 characters), canonical (blank unless you have a stated reason), robots toggle set to indexable, featured image under about 200KB with descriptive alt text, and one category plus tags from a vocabulary you write down.
4. Complete the Open Graph title, description, and image, overriding the SEO fields where the social framing should differ.
5. Add outbound internal links to three to five existing pages using descriptive anchor text.
6. Work the 13 pre-publish checks, then publish.
7. Run the post-publish QA: view source and record the `title`, description, canonical, and robots values as they actually shipped; load the URL on a phone; run a URL Inspection live test and record the verdict, the rendered-HTML confirmation, and the user-declared canonical; add inbound internal links from three existing pages; confirm the URL is in the sitemap. Record a pass or fail with evidence for each.
8. Build the adaptation pack: an email of about 180 words with subject line and preview text; a LinkedIn post of about 140 words formatted for a mobile feed; a 30–45 second video script with timecodes and a caption; and a one-page summary. Write the actual copy, not a description of it.
9. Tag every link in the pack with UTMs using one documented convention, and list them in a table with the channel each belongs to.
10. Write three sentences on the syndication position for this piece: whether you would syndicate it, what you would require from a partner, and what you would do if they refused.

**Deliverable — Publication and Distribution Pack.** One document containing: the published URL; the field-by-field completion table with the exact value entered in each field; the rendered `head` block copied from view source; the QA results with a pass or fail and evidence for each of the five checks; and the four-channel adaptation pack with the full adapted copy and the UTM-tagged link for each channel.
