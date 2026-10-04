---
lesson_id: dm201-06
course_id: dm201
pathway: digital-marketer
title: On-Page Optimization
order: 6
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Optimize a page's title, headings, metadata, and body copy for a target query
  - Apply structured data markup where a rich result is warranted
---

## What On-Page Optimization Actually Does

On-page optimization has a reputation for being fussy busywork — tweak a title, sprinkle a phrase, tick a green light in a plugin. That reputation is earned. The real job is narrower and more useful, and it has two halves.

The first half is **making the page's subject unmistakable to a machine**. A search engine arrives with no context. It cannot see your roadmap or the meeting where you decided this page was the definitive answer to "payroll tax deadlines." It has the URL, the `title` element, the headings, the body text, the links pointing in, and the markup. From those signals it decides what the page is about and which queries it could plausibly satisfy. Your job is to remove every reasonable alternative interpretation. If a smart person outside your company can read only your title, H1, and first paragraph and tell you exactly which question the page answers and for whom, a machine has a good chance too.

The second half is **making the result worth clicking**. Ranking is not the goal; a session is. A page that ranks fourth with a compelling title and description will outperform a page that ranks third with a title that says "Blog | Meridian Payroll." Meridian's Search Console shows 1,240,000 impressions and 41,300 clicks over the last three months — a 3.3% average click-through rate at an average position of 18.4. Impressions are already being earned. A meaningful share of the opportunity sits in the gap between "we were shown" and "we were chosen," and that gap is on-page work.

When the two halves conflict, know which one you are trading away. A title crammed with every variant of a phrase is marginally more legible to a machine and distinctly less clickable to a human. That trade is almost always bad.

### What on-page optimization cannot fix

Before you touch anything, be honest about the ceiling. On-page work is an amplifier, not a transformer. It cannot fix:

- **A page-type mismatch.** If the query "payroll software" returns nine comparison lists and category roundups, no title rewrite turns Meridian's product page into a roundup. Either build the page type the SERP is asking for, or accept that you are competing for the one or two slots reserved for vendors.
- **An intent mismatch.** A page selling software cannot win an informational query that wants a definition and a table of dates. Rewriting the title of the wrong page type just makes it a better-labeled wrong answer.
- **A missing page.** If nothing on the site addresses "how to correct a W-2," on-page optimization has nothing to work with.
- **A crawling or indexing problem.** If the page is blocked or not indexed, its title is irrelevant. That is lesson 08's territory.
- **A profound authority gap.** If the query is dominated by the IRS, ADP, and three publications with twenty years of history, a well-optimized page may move from position 40 to position 22 and stall. That is real progress, and it is not a first-page result. Say so out loud when you set expectations.

The practical rule: **do the intent and page-type check first, then optimize.** If you catch yourself writing a title that promises something the page does not deliver, stop — that is a content problem wearing an on-page costume.

## The Title Element

The `title` element is the highest-leverage text on the page. It is the strongest on-page statement of what the page is about, and it is usually the blue link in the search result — the thing a person reads before deciding.

### The `title` element and the H1 are different things

They serve different readers and they are allowed to differ.

- The `title` element lives in the document head. It appears in the browser tab, the search result, and link previews. Its reader is a stranger scanning ten results with no context at all.
- The H1 is the visible heading at the top of the page. Its reader has already clicked; they know where they are.

So the `title` element usually carries more context — a qualifier, a year, a brand — while the H1 can be shorter and more natural. For `/help/w-2-corrections`, a good pair is `title`: "How to Correct a W-2 with Form W-2c | Meridian Help" and H1: "How to correct a W-2."

Both describe the same subject, and neither contradicts the other. That second point matters: if your title promises "2026 deadlines" and your H1 says "Payroll basics," you have a mismatch that hurts both machine confidence and human trust. Keep them consistent in subject; let them differ in length and context. A page has exactly one `title` element and should have exactly one H1.

### Google rewrites titles, and why

Google frequently replaces the `title` element you wrote with something it generates — often the H1, an anchor text pointing at the page, or a trimmed version with the boilerplate stripped. Tool vendors have put the rewrite rate anywhere from a third to well over half of results. Treat those numbers as vendor estimates, not Google measurements, but treat the phenomenon as real.

Google rewrites when your title is:

- **Too long**, so it gets truncated or condensed.
- **Boilerplate-heavy**, especially repeated brand or category text: "Meridian Payroll Help Center | Meridian Payroll."
- **Stuffed**, with the same phrase or near-variants repeated.
- **Too vague** relative to the query, when a heading on the page is a better match.
- **Missing or empty.**

The correct response is not to fight it. Write a title so clearly better than any alternative on the page that a rewrite has nothing to improve: distinguishing term first, no repeated boilerplate, honest length, and an H1 that would also be a decent title if Google chose it instead. When you do see a rewrite in the SERP, look at what Google substituted — it is telling you what it thinks the page is about, which is free diagnostic information.

### Length: think in pixels, not characters

Search result titles are truncated by **rendered width**, not character count. The usable width is roughly **600 pixels** on desktop. Because character widths vary — an "m" is far wider than an "l" — the character equivalent floats between about 50 and 65. **Aim for 55–60 characters** as a working rule, and know that a title full of capitals and wide letters will truncate earlier than the count suggests.

Truncation is not fatal, but it is ugly and it wastes the tail. Compare:

```txt
Good  (45 chars): 2026 Payroll Tax Deadlines: Federal Due Dates
Bad   (78 chars): Blog | Payroll Tax Deadlines You Need to Know Abo...
```

The bad one spends its first six characters on "Blog," which tells a searcher nothing, and truncates before the year — losing the two facts that would have made them click. The other reason to stay under the limit: **the first 30 or so characters carry most of the decision.** People scan left to right and drop out fast.

### Front-load the distinguishing term

The distinguishing term is not always the keyword. It is whatever separates your result from the ones above and below it. On a SERP where every result says "Payroll Tax Deadlines," the differentiator is "2026" or "Federal" or "with penalty amounts." Where you are the only vendor among nine listicles, your brand may be the differentiator.

A quick test: write your title, then write the titles of the three results currently above you. If you could swap them and no one would notice, your title has no differentiator.

### Brand suffixes

The convention is `Page Subject | Brand`, for good reasons: the brand is recognizable, it sits at the end where truncation costs least, and it builds familiarity across many impressions.

Use a brand suffix on commercial and product-adjacent pages (`/pricing`, `/product/...`, `/compare/...`), where the reader wants to know whose pricing this is, and anywhere the brand is known well enough to add trust. Skip it when the title is already at the length limit and the subject needs the room — `2026 Payroll Tax Deadlines: Federal Due Dates` is better without a suffix than truncated with one — and on purely informational pages where the brand adds nothing to the decision.

Never repeat the brand twice, and never use more than one separator style across the site. Pick `|` or `-` and be consistent — this is house style, not a ranking factor.

### Uniqueness across the site

Every indexable URL should have a title no other URL has. Duplicate titles are a symptom, not a cosmetic flaw: they usually mean two pages are competing for the same thing, which is the cannibalization problem lesson 07 handles. With 640 indexable URLs you cannot check by hand. Free options: crawl your own site with a free-tier desktop crawler and sort the title column, or pull the Search Console Performance report by page and look for URLs trading impressions on the same query.

### Title templates by page type

Templates keep a 640-URL site consistent. They also go wrong when applied blindly — "Blog | {Post Title} | Meridian Payroll" wastes half the width. Use templates as a default, then hand-write the twenty pages that matter most.

| Page type | Template | Example |
|---|---|---|
| Home | `{Primary category} for {Audience} \| {Brand}` | Payroll Software for Small Business \| Meridian Payroll |
| Pricing | `{Category} Pricing: {Qualifier} \| {Brand}` | Payroll Software Pricing: Plans and Costs \| Meridian Payroll |
| Product feature | `{Feature}: {What the reader gets} \| {Brand}` | Direct Deposit Payroll: Setup, Timing, and Costs \| Meridian |
| Comparison | `{Brand} vs {Competitor}: {Category} Compared` | Meridian vs PayCadence: Payroll Software Compared |
| Help article | `How to {Task} \| {Brand} Help` | How to Correct a W-2 with Form W-2c \| Meridian Help |
| Blog post | `{Subject}: {Specific angle}` | 2026 Payroll Tax Deadlines: Federal Due Dates |
| Template asset | `Free {Asset} ({Formats}) \| {Brand}` | Free Pay Stub Template (Excel and PDF) \| Meridian |

### Worked example: seven Meridian titles

| URL | Before (chars) | After (chars) | Why |
|---|---|---|---|
| `/` | Meridian Payroll \| Payroll Software (35) | Payroll Software for Small Business \| Meridian Payroll (54) | Leads with category and audience instead of brand; "for small business" is the qualifier the positioning rests on. |
| `/pricing` | Pricing \| Meridian Payroll (26) | Payroll Software Pricing: Plans and Costs \| Meridian Payroll (60) | "Pricing" alone matches nothing; the category tells a scanner what is being priced. |
| `/product/direct-deposit` | Direct Deposit \| Meridian Payroll Software Features (51) | Direct Deposit Payroll: Setup, Timing, and Costs \| Meridian (59) | "Features" is internal vocabulary nobody searches. The three nouns after the colon are the sub-questions people ask. |
| `/compare/paycadence` | PayCadence Alternative \| Meridian Payroll (41) | Meridian vs PayCadence: Payroll Software Compared (49) | The page is a two-way comparison, so say so; "alternative" under-serves the "vs" query shape that dominates here. |
| `/help/w-2-corrections` | W-2 Corrections \| Meridian Payroll Help Center \| Meridian Payroll (65) | How to Correct a W-2 with Form W-2c \| Meridian Help (51) | Removes the duplicated brand, matches how-to phrasing, and names the specific form — the differentiator on this SERP. |
| `/blog/payroll-tax-deadlines` | Blog \| Payroll Tax Deadlines You Need to Know About in 2026 \| Meridian Payroll (78) | 2026 Payroll Tax Deadlines: Federal Due Dates (45) | Drops the useless "Blog" prefix, front-loads the year, cuts the filler clause. Brand dropped deliberately to buy room. |
| `/templates/pay-stub-template` | Pay Stub Template \| Meridian Payroll (36) | Free Pay Stub Template (Excel and PDF) \| Meridian (49) | "Free" and the file formats are what a downloader confirms before clicking; both are true, so both belong. |

Notice what none of these do: repeat the target phrase twice, chain three keywords with pipes, or promise something the page does not contain. Each change is one honest clarification.

## Meta Descriptions

Three facts, in order of how often they are misunderstood:

1. **The meta description is not a ranking factor.** It does not influence position. Google has said so repeatedly and consistently.
2. **It is a click factor.** It occupies two lines under your blue link and it is the last thing a person reads before choosing you or someone else.
3. **Google rewrites it often** — more often than titles — usually by pulling a passage from the body that matches the query more directly than your description did. If your description is generic, expect it to be replaced by a sentence from your page.

The meta keywords tag, separately, is ignored entirely by Google as a ranking signal and has been for many years. Do not spend time on it.

Write for a target of roughly **155 characters**. Longer descriptions do not break anything; they simply get cut, and desktop and mobile cut at different points.

A good meta description does three jobs at once: it **matches the promise of the query** (if the query is "payroll tax deadlines 2026," confirm 2026 dates are on the page), it **adds a differentiator** the other nine results are not offering (a table, penalty amounts, both file formats, a real price), and it **gives a concrete reason to click now** — not "learn more about." Avoid the reflex of restating the title. You have two slots; spend them on different information.

### Worked example: four Meridian descriptions

| URL | Before (chars) | After (chars) | Why |
|---|---|---|---|
| `/` | Meridian Payroll is payroll software for small business. Sign up today for the best payroll experience on the market. Trusted by thousands of businesses. (153) | Payroll software built for teams of 2 to 50. Run payroll in about four minutes, file federal and state taxes automatically, and pay $29/month plus $6 each. (154) | Replaces unverifiable superlatives with three checkable facts. Price pre-qualifies the click, raising conversion even if it lowers raw CTR. |
| `/pricing` | (missing — Google generated one from the plan table) | See Meridian's payroll pricing: three plans from $29/month plus $6 per employee. No setup fee, no annual contract, and tax filing included on every plan. (153) | Answers the three objections that stop a pricing-page click: how much, setup fee, am I locked in. |
| `/product/direct-deposit` | Direct deposit from Meridian Payroll. Fast, secure, reliable direct deposit for your employees. (95) | Run direct deposit in two business days at no extra cost. See how setup works, when funds leave your account, and what happens when a deposit is returned. (154) | "Fast, secure, reliable" is three adjectives and zero information. "Two business days" and "no extra cost" are the comparison points buyers use. |
| `/blog/payroll-tax-deadlines` | Learn about payroll tax deadlines in this helpful blog post from the Meridian Payroll team, covering everything small business owners need to know. (147) | Every 2026 federal payroll tax due date in one table: Form 941, Form 940, W-2 filing, and the monthly and semi-weekly deposit schedules, plus late penalties. (157) | Names the specific forms and the format. A searcher checking a deadline wants a table, and now they know there is one. |

Do not hand-write descriptions for all 640 URLs. Sort the Search Console Performance report by impressions, take the top 50, and do those. Let the rest be generated.

## Heading Structure

Headings are structure, not styling. If you need bigger text, that is CSS. If you need to declare that a new sub-topic begins, that is a heading. When headings get used as decoration — an H3 because H2 looked too heavy — the outline becomes noise and both readers and extraction systems lose the thread.

The rules that matter:

- **One H1 that states the page's subject.** Not the site name, not a slogan. The subject.
- **H2s are the major sub-questions.** H3s are sub-points inside those. Do not skip from H2 to H4, and do not use a heading for a single sentence that is not really a section.
- **Headings should mirror the sub-questions a searcher actually has**, in the order they would ask them. The outline is not a table of contents you invent; it is a reconstruction of the reader's thought process. The sub-questions come from work you already did: the People Also Ask box on the target SERP, the related searches at the bottom, the long-tail terms in your keyword map from lesson 04, and the questions your support team gets.

A clean outline also helps with snippet extraction. When Google builds a featured snippet or jumps a user to a section of a page, it looks for a heading that matches the query followed by a compact, self-contained answer. A wall of text gives it nothing to grab. A heading that reads "When are Form 941 deposits due?" followed by a two-sentence answer and a table is easy to extract. No snippet is ever guaranteed, but you can make the page a plausible candidate instead of an impossible one.

### Worked outline: `/blog/payroll-tax-deadlines`

```markdown
H1: 2026 payroll tax deadlines for small businesses

  (answer paragraph + summary table, before any H2)

H2: 2026 payroll tax deadlines at a glance
H2: How do I know which deposit schedule I'm on?
    H3: The monthly deposit schedule
    H3: The semi-weekly deposit schedule
    H3: The $100,000 next-day deposit rule
H2: Form 941 quarterly return deadlines
H2: Form 940 annual FUTA deadline
H2: W-2 and 1099-NEC filing deadlines
H2: State payroll tax deadlines
H2: What happens if you miss a payroll tax deadline
    H3: Failure-to-deposit penalty tiers
    H3: How to request penalty abatement
H2: How to never miss a deadline again
H2: Frequently asked questions
```

Read that outline without the body copy. You can tell exactly what the page covers and in what order, and every heading is something a person would type into a search box. That is the standard. Compare it to what the page had before — "Introduction," "Why deadlines matter," "Tips," "Conclusion" — which describes an essay, not an answer.

## Body Copy

### Answer the question in the first hundred words

Whatever the page promises, deliver something usable above the fold. A person who arrives from a search for "payroll tax deadlines" and hits three paragraphs on why compliance matters will leave. Put the direct answer first, then the nuance. For the deadlines post, the first hundred words should contain the fact that 2026 dates are covered, the two deposit schedules by name, and the three headline dates. Everything else can wait.

### Cover the entities and sub-topics the query implies

A query is a compressed request. "Payroll tax deadlines" implies Form 941, Form 940, W-2, 1099-NEC, the monthly and semi-weekly deposit schedules, EFTPS, the failure-to-deposit penalty, and state-level variation. A page that names and explains those things is demonstrably about the subject. A page that says "payroll tax deadlines" eight times and names none of them is not.

This is the honest version of what people used to call keyword density. **There is no target number of times to use a phrase, and no percentage to hit.** Write the phrase naturally where it belongs and spend your attention on coverage instead. Likewise, "LSI keywords" is not a real thing in Google's systems; the useful idea underneath it — cover the concepts a subject genuinely entails — is what you are doing here. Coverage has a limit, though: do not add a section on state unemployment insurance rates because a tool told you a competitor mentions it. Add it only if a reader of this page would want it.

### Make the good parts extractable

Two formats consistently do more work than prose:

**Definition-style paragraphs.** When a heading asks a question, answer it in the first two sentences underneath, in sentences that stand alone without the heading. "A semi-weekly depositor must deposit payroll taxes by the Wednesday after a payday falling Wednesday through Friday, and by the Friday after a payday falling Saturday through Tuesday. Your schedule is set by lookback-period tax liability, not by how often you run payroll."

**Compact tables.** Three to six columns, plain values, a real header row. A table beats a paragraph any time the information is a grid.

```markdown
| Form | Covers | 2026 due date | Late penalty starts at |
|---|---|---|---|
| 941 (Q1) | Jan-Mar | April 30 | 2% of the deposit |
| 941 (Q2) | Apr-Jun | July 31 | 2% of the deposit |
| 940 | Full year 2025 | February 2 | 2% of the deposit |
| W-2 to SSA | Full year 2025 | February 2 | $60 per form |
```

### Original data and first-hand experience are the differentiator

Every competitor can restate the IRS calendar. What they cannot copy is what you know from operating the product. Meridian processes payroll for thousands of small businesses, so it can say things nobody else can: "In our 2025 data, 11% of semi-weekly depositors missed at least one deposit date, and 68% of those misses fell in the week after a holiday." That sentence is a reason for the page to exist, a reason for someone else to link to it, and a signal of first-hand experience that no amount of rewriting produces.

Look for product data you can aggregate and anonymize, support-ticket patterns, screenshots of the real workflow, quotes from your implementation team, and a named author with relevant credentials. Content strategy at large is dm270's subject; what belongs to you here is asking, for every page, "what does this contain that only we could have written?"

### Readability and scannability

Short paragraphs — three or four lines. Front-loaded sentences. Bulleted lists where the content is genuinely a list. Bold used sparingly, on the phrase that carries the point, never on whole sentences. Define jargon at first use; "lookback period" is not common knowledge. None of this is a ranking factor in itself. All of it changes whether the page gets read.

### Internal links from body copy

Where your body copy names a concept that has its own page, link it with descriptive anchor text: from the deadlines post, link "semi-weekly deposit schedule" to the help article that explains it, and "our payroll tax filing" to the product page. Two to five contextual links per long article is a sane range, placed where a reader would genuinely want the detour rather than clustered at the bottom. Anchor text should describe the destination honestly and vary naturally — do not engineer it toward an exact phrase or a ratio. Lesson 07 has the full model.

## URL Slugs

A slug should be **readable, short, hyphenated, lowercase, and stable**.

| Bad | Better | Problem fixed |
|---|---|---|
| `/blog/2024/03/p=4417` | `/blog/payroll-tax-deadlines` | Dates and IDs communicate nothing and make the URL look stale |
| `/blog/the-ultimate-guide-to-payroll-tax-deadlines-for-small-business-owners-in-2026` | `/blog/payroll-tax-deadlines` | Length; also, the year in the slug forces an annual decision |
| `/product/dd` | `/product/direct-deposit` | Abbreviations are unreadable to both humans and machines |
| `/help/article?id=88&sess=x9f2` | `/help/w-2-corrections` | Session parameters create infinite crawlable variants |

Two specific rules for a site like Meridian's:

- **Keep the year out of evergreen slugs.** `/blog/payroll-tax-deadlines` can be updated every January. `/blog/2026-payroll-tax-deadlines` cannot, without either a new URL each year or a slug that lies. Put the year in the `title` element and the H1, where it is cheap to change.
- **Match the slug to the subject, not to the navigation.** `/help/w-2-corrections` is right whether the help center reorganizes or not.

### The cost of changing a slug

Changing a URL is not free. You must set up a permanent redirect from old to new, update every internal link that pointed at the old URL, and accept a period of ranking volatility while the change is recognized — commonly weeks. External links still pass through the redirect, but you have added a hop and some fragility.

The decision rule: **change a slug when it is actively wrong, not when it is merely imperfect.** A slug with a session parameter, a database ID, or a misspelling is worth fixing. `/product/direct-deposit-payroll` when you would prefer `/product/direct-deposit` is not. For new pages, get it right the first time — that is where slug decisions are cheap. Redirect mechanics and status codes belong to lesson 08.

## Images on the Page

Three on-page image jobs are yours; the performance side belongs elsewhere.

**Descriptive filenames.** `payroll-tax-deposit-schedule-2026.png` instead of `IMG_4471.png`. A small signal that costs nothing at upload time.

**Alt text written for accessibility first.** Alt text exists so a person using a screen reader gets the information the image carries. Write what the image conveys, in plain language, in about one sentence: `alt="Table of 2026 Form 941 due dates by quarter"`. If the image is decorative, use an empty alt attribute so screen readers skip it. Do not stuff phrases into alt text — it degrades the experience for the people the attribute exists to serve. Write it well and the search benefit follows as a side effect.

**Captions.** A caption is visible text, so everyone reads it and it counts as page content. Use one when the image needs context or a source attribution.

Compression formats, sizing, and lazy loading affect page performance and are covered in lesson 08.

## Structured Data

### What it is, and what it does not do

Structured data is machine-readable markup describing what a page contains in a shared vocabulary (schema.org). It tells a search engine explicitly, "this is an article, published on this date, by this author," rather than making it infer that.

Be precise about the benefit, because this is the most oversold topic in on-page SEO:

**Structured data does not boost rankings. It makes a page *eligible* for rich results.** A rich result — a review star, a breadcrumb trail in place of a raw URL, a product price — can substantially change your click-through rate, and click-through is worth real traffic. But the markup itself is not a ranking signal, and adding schema to a page that does not rank will not make it rank.

Eligibility is also not display. Google decides whether to show a rich result, on which query and device, and it changes its mind. **FAQ and HowTo rich results in particular have been sharply reduced in Google search** — FAQ was cut back to a small set of authoritative sites, and HowTo was removed entirely. If you add `FAQPage` markup, do it because the page genuinely has a question-and-answer section readers use, and judge it on that merit. Do not build a fake FAQ block to chase a rich result that will probably never display.

### JSON-LD is the format to use

There are three syntaxes (JSON-LD, Microdata, RDFa). **Use JSON-LD.** It is Google's recommended format, it lives in a single script block instead of being woven through your HTML, and it can be changed or removed without touching the page layout. Microdata is legacy; you will meet it on old sites and never need to write it.

### The types worth doing for Meridian

| Type | Where | Why it earns its keep |
|---|---|---|
| `Organization` | Home page, once, sitewide | Establishes the entity: legal name, logo, URL, social profiles, support contact. |
| `BreadcrumbList` | Every page below the home page | The one type with a near-reliable visible payoff: a breadcrumb trail replaces the raw URL in the result. |
| `Article` | All 310 blog posts and help articles | Declares headline, publish and modified dates, author, image. Dates matter for a page like the deadlines post. |
| `SoftwareApplication` | `/` and `/product/...` | Meridian is software, so this is the honest type. Include `offers` only if you publish real prices. |
| `Product` | Do not use here | `Product` is for goods; for SaaS, `SoftwareApplication` is correct. Using `Product` to chase price snippets is a misdeclaration. |
| `FAQPage` | Only pages with a real, visible FAQ section | Eligibility is sharply limited. Add it where the FAQ is genuine; expect no rich result. |
| `HowTo` | Skip | The rich result was retired. Use headings and a numbered list instead. |

### The absolute rule

**Markup must describe content that is visible on the page.** Every claim in the JSON-LD has to be verifiable by a person looking at the rendered page. Marking up an FAQ that is not there, an author who is not credited, a price you do not display, or a rating you did not collect is a structured data spam violation and can earn a manual action that removes rich result eligibility — sometimes sitewide. If it is not on the page, it is not in the markup.

### Complete markup blocks

Organization, on the home page:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://meridianpayroll.com/#organization",
  "name": "Meridian Payroll",
  "url": "https://meridianpayroll.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://meridianpayroll.com/img/meridian-logo.png",
    "width": 512,
    "height": 512
  },
  "description": "Payroll software for small businesses with 2 to 50 employees.",
  "foundingDate": "2016",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@meridianpayroll.com",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/meridianpayroll",
    "https://x.com/meridianpayroll"
  ]
}
```

BreadcrumbList, on the deadlines post:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://meridianpayroll.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://meridianpayroll.com/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Payroll Taxes",
      "item": "https://meridianpayroll.com/blog/payroll-taxes/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "2026 Payroll Tax Deadlines"
    }
  ]
}
```

The final item has no `item` URL — it is the current page, and Google's guidance is to omit the URL on the last crumb. Crumb names must match the trail actually rendered on the page.

Article, on the same post:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "2026 payroll tax deadlines for small businesses",
  "description": "Every 2026 federal payroll tax due date in one table, with deposit schedules and late penalties.",
  "image": ["https://meridianpayroll.com/img/2026-payroll-tax-calendar.png"],
  "datePublished": "2026-01-06T09:00:00-05:00",
  "dateModified": "2026-07-14T11:30:00-04:00",
  "author": {
    "@type": "Person",
    "name": "Dana Whitfield",
    "jobTitle": "Payroll Compliance Lead, Meridian Payroll",
    "url": "https://meridianpayroll.com/authors/dana-whitfield"
  },
  "publisher": {
    "@id": "https://meridianpayroll.com/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://meridianpayroll.com/blog/payroll-tax-deadlines"
  }
}
```

Two details worth copying: `headline` matches the visible H1, and `publisher` reuses the Organization `@id` rather than repeating the whole object. `dateModified` must be a real edit date — never touched to fake freshness.

### The optimized head

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>2026 Payroll Tax Deadlines: Federal Due Dates</title>
  <meta name="description" content="Every 2026 federal payroll tax due date in one table: Form 941, Form 940, W-2 filing, and the monthly and semi-weekly deposit schedules, plus late penalties.">
  <link rel="canonical" href="https://meridianpayroll.com/blog/payroll-tax-deadlines">
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Article", "headline": "2026 payroll tax deadlines for small businesses" }
  </script>
</head>
```

The canonical line belongs there; lesson 08 teaches what it does. Multiple JSON-LD script blocks on one page are fine — you will typically have BreadcrumbList and Article together.

### Validating

Two free validators, both worth running before you ship:

- **Google's Rich Results Test** — enter a URL or paste code; it tells you which rich result types the page is *eligible* for and lists errors and warnings. Errors block eligibility; warnings are optional fields. Ship with zero errors.
- **Schema.org's Schema Markup Validator** — broader vocabulary checking, not limited to what Google supports.

After deployment, watch the **Enhancements** section in Search Console. It reports what Google actually parsed on your live pages, at scale, with error counts by type and example URLs — which the one-URL-at-a-time testers cannot do. A validator says "this code is valid." Enhancements says "we crawled 310 of your articles and 47 are missing a required field." Believe Enhancements.

## Full Teardown: `/blog/payroll-tax-deadlines`

### Before

| Signal | Value |
|---|---|
| `title` | Blog \| Payroll Tax Deadlines You Need to Know About in 2026 \| Meridian Payroll (78 chars, truncated) |
| Meta description | Generic "learn about..." boilerplate (147 chars) |
| H1 | Payroll Tax Deadlines |
| Outline | Introduction / Why deadlines matter / Federal taxes / Tips / Conclusion |
| First 100 words | Three sentences about the importance of compliance |
| Tables | None — dates in prose |
| Structured data | None |
| Slug | `/blog/payroll-tax-deadlines` (already fine) |
| Search Console, 3 months | 61,400 impressions, 1,290 clicks, 2.1% CTR, average position 14.2 |

### Diagnosis

The impression count says Google already understands the subject and shows the page regularly. Position 14.2 with a 2.1% CTR is the fingerprint of a page shown mostly on page two whose result is not compelling on the rare occasions it reaches page one. Three problems, in priority order:

1. **The result is unclickable.** The title truncates before the year, wastes six characters on "Blog," and the description says nothing.
2. **The page does not answer the query directly.** No table, no dates in the first screen, no deposit-schedule explanation — and "which schedule am I on?" is the question underneath the query.
3. **Nothing signals recency.** For a deadline page, recency is part of relevance, and there is no `Article` markup and no visible updated date.

### Changes made

1. Title rewritten to `2026 Payroll Tax Deadlines: Federal Due Dates` (45 chars). Year front-loaded; brand dropped to buy room; "Blog" removed.
2. Meta description rewritten to name Form 941, Form 940, W-2, both deposit schedules, and penalties, and to say the dates are in a table (157 chars).
3. H1 changed to "2026 payroll tax deadlines for small businesses" — states subject and audience, agrees with the title without duplicating it.
4. Outline rebuilt to the nine H2s shown earlier, drawn from People Also Ask and the support team's most common questions.
5. First hundred words rewritten to give the three headline dates immediately.
6. Summary table of all 2026 due dates added above the first H2, plus smaller tables for deposit schedules and penalty tiers.
7. Original data added: the anonymized aggregate on missed deposits after holidays, with the sample size stated.
8. Author byline linked to a real author page with credentials; visible "Last updated" date added.
9. Four contextual internal links added to the deposit-schedule help article, the tax-filing product page, the payroll calendar template, and the Form 941 explainer.
10. `Article` and `BreadcrumbList` JSON-LD added, validated with zero errors in the Rich Results Test.
11. Images relabeled with descriptive filenames and real alt text.
12. Slug left alone — already correct, and changing it would have cost redirect risk for no gain.

### Expected effect, honestly

The title and description changes affect click-through and can show up within days of recrawl, because CTR responds as soon as the new snippet is served. A move from 2.1% to somewhere in the 3–4% range at the same position is a reasonable hope, not a promise; at 61,400 impressions that is roughly 600–1,200 additional clicks per quarter.

The content changes — table, outline, original data — affect relevance, and relevance moves slowly and unevenly. Expect nothing definitive for four to eight weeks, expect the position number to bounce, and expect the honest answer to be "we do not know yet" for at least a month. The structured data will not move position at all; if a breadcrumb trail starts showing in the result, that is the whole of its contribution.

The thing that would move this page most is not on-page at all: it currently has three internal links pointing at it from anywhere on the site. That is lesson 07's problem, and it is the bigger one.

Set the measurement up before you ship: note the change date and compare the 28 days after against the 28 days before in Search Console, filtered to this page. Lesson 11 covers doing that properly.

## Anti-Patterns

**Keyword stuffing.** Repeating a phrase past the point of natural writing. It does not help, it reads badly, and at volume it is a spam signal. If you have written "payroll tax deadlines" four times in one paragraph, you are writing for a scoring tool that does not exist.

**Over-templated titles.** Templates producing `Category | Subcategory | Page | Brand` on 400 URLs. Google strips the boilerplate itself — a rewrite you could have avoided — and you spent your 600 pixels on navigation.

**Doorway pages.** Near-identical pages built to capture query variants that all funnel to the same destination: "payroll software for restaurants," "for cafes," "for diners," differing by three words. This is an explicit spam policy violation. Build one good page unless each variant genuinely has different content.

**Hidden text.** White text on white, text behind an image, text positioned off-screen, or content hidden from users but served to crawlers. Cloaking and hidden text are policy violations with real consequences. Content in a tab or accordion a user can open is fine — the test is whether a person can reach it.

**Thin boilerplate variants.** Two hundred pages differing only by a swapped noun. This is not a "duplicate content penalty" — no such penalty exists. What happens is filtering and canonical consolidation: Google picks one version to show and ignores the rest, so you did the work of 200 pages and got the value of one.

**Marking up invisible content.** The most common structured data mistake, and worth repeating: markup describing content not on the page is a violation, not a shortcut.

**Optimizing the wrong page.** Three hours on a page with 40 impressions a quarter while a page with 61,400 impressions has a truncated title. Sort by impressions before you start.

## Practice

Optimize three pages end to end. Use pages from your employer's site if you have access; otherwise use `/pricing`, `/compare/paycadence`, and `/help/w-2-corrections` from the Meridian scenario, with the baseline numbers given in this lesson.

1. **Pick and baseline.** For each page, filter Search Console Performance to that URL for the last three months and record clicks, impressions, CTR, and average position. Export the top 20 queries.
2. **Confirm the target.** From those queries plus your keyword map, name the one query cluster the page should own. Search it and record the top five results, their page types, and their titles. If your page is the wrong type for that SERP, stop and note it — that is a finding, and it changes the recommendation.
3. **Write the title.** Draft three versions and count the characters on each. Pick one at 55–60 characters or shorter, with the distinguishing term in the first 30, no repeated boilerplate, and a brand suffix only if it earns its space. Record the count.
4. **Write the meta description.** Target 155 characters. It must confirm the query's promise, add one concrete differentiator, and give a reason to click. Do not restate the title. Record the count.
5. **Rebuild the outline.** Write one H1 and the full H2/H3 outline. Source at least four headings from People Also Ask, related searches, or real customer questions, and note the source for each.
6. **Specify body changes.** List what must change: the first-hundred-words answer, at least one extractable table or definition block, one piece of original data or first-hand experience with its source, and two to five internal links with anchor text and destinations.
7. **Decide the slug.** Keep or change, with a one-line reason. If you change it, name the redirect required and every internal link that must be updated. Default to keeping it.
8. **Choose structured data types.** Name the types warranted, and for each give the reason a rich result is plausible. If a type is not warranted, say so — "no `FAQPage`, the page has no real FAQ section" is a correct answer.
9. **Write the JSON-LD.** Produce complete, valid JSON-LD for each type chosen. Every field must correspond to something visible on the page.
10. **Validate.** Run each block through Google's Rich Results Test. Fix until you have **zero errors**. Capture the result. Note any warnings and decide, in writing, whether to resolve each.

**Deliverable: an on-page specification document.** One table with one row per page and these columns:

| Column | Contents |
|---|---|
| URL | The page |
| Target cluster | The one query cluster it should own |
| Baseline | Clicks / impressions / CTR / average position |
| New title | Full text, with character count |
| New meta description | Full text, with character count |
| Heading outline | H1 plus the H2/H3 list |
| Body changes | Numbered list of specific edits |
| Slug decision | Keep or change, plus reason |
| Structured data | Types chosen, plus the reason for each |

Attach the JSON-LD for all three pages, plus evidence that each block passes the Rich Results Test with zero errors. A reviewer should be able to hand the document to a developer and have it implemented without asking you a question.
