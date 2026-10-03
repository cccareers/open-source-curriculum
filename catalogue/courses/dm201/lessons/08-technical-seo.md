---
lesson_id: dm201-08
course_id: dm201
pathway: digital-marketer
title: "Technical SEO: Crawlability, Speed, and Mobile"
order: 8
kind: lesson
competency_ids:
  - D1-S1-C02
  - D1-S1-C03
objectives:
  - Diagnose crawlability, speed, and mobile issues that suppress rankings
  - Audit robots directives, sitemaps, and canonical tags on a live site
---

## Technical SEO Is Triage, Not a Checklist

Technical SEO has a bad reputation among marketers because it usually arrives as a 200-item export sorted alphabetically, with no indication of which items matter. You hand it to engineering, engineering sees 200 items, and nothing happens. The fix is a triage rule: every technical defect falls into exactly one of three tiers, and the tier tells you what it costs and how fast it must move.

**Tier 1 — Stops indexing.** The page cannot enter the index, or has been removed from it: a `noindex` on a money page, a robots.txt block on `/blog/`, a server returning 500s, a canonical pointing at a dead URL. Zero organic traffic regardless of how good the page is. No partial credit.

**Tier 2 — Misdirects indexing.** The page can be indexed, but Google indexes the wrong version, splits signals across duplicates, wastes crawl on junk, or sees something different from what visitors see. Rankings exist but land below what the content deserves. These are the most common and the most invisible, because the page "works" when you load it in a browser.

**Tier 3 — Degrades quality.** The right version is indexed, but the experience is worse than it should be: slow loading, jumping layout, tiny tap targets, a pop-up over the content. Worth fixing, but refinements — they move a page a little; they do not create rankings that were not otherwise available.

```txt
Fix in this order, always:

  TIER 1  Stops indexing        →  this week
  TIER 2  Misdirects indexing   →  this month
  TIER 3  Degrades quality      →  this quarter

Never fix a Tier 3 item before a Tier 1 item on the same site,
no matter how easy the Tier 3 item is.
```

That last line is the whole discipline. Compressing images is satisfying and visible. It is also pointless on a page carrying a `noindex` tag.

Throughout this lesson you are the SEO lead at **Meridian Payroll** (meridianpayroll.com), a small-business payroll software company with roughly 640 indexable URLs across `/`, `/pricing`, `/product/`, `/compare/`, `/help/`, `/blog/` (about 310 posts), and `/templates/`. The last three months in Search Console show 41,300 clicks, 1,240,000 impressions, 3.3% average CTR, and average position 18.4. Your competitors are PayCadence, Wagebase, and Sumner HR.

## Crawl Control: robots.txt

`robots.txt` is a plain text file at the root of a hostname — `https://meridianpayroll.com/robots.txt` — telling cooperating crawlers which paths they may request. It is the first file Googlebot fetches on a host and is cached for roughly a day, so changes are not instant.

### Syntax, precisely

The file is a sequence of **groups**. A group starts with one or more `User-agent` lines followed by rule lines applying to those agents.

- `User-agent: <name>` — names a crawler; `*` matches any crawler without its own group.
- `Disallow: /path` — do not request URLs whose path starts with `/path`.
- `Allow: /path` — carves an exception out of a broader `Disallow`.
- `Sitemap: <absolute url>` — **not** part of any group; applies to the whole file and must be absolute.
- `#` starts a comment.

Google supports two pattern characters: `*` matches any sequence and `$` anchors to the end of the path. So `Disallow: /*?sort=` blocks any URL containing `?sort=`, while `Disallow: /*.pdf$` blocks paths ending in `.pdf` but not `/guide.pdf?utm_source=email`.

**Group selection.** A crawler uses exactly one group — the most specific user-agent match for itself. Groups are never merged. Write a `User-agent: Googlebot` group and Googlebot obeys only that group, ignoring the `User-agent: *` group and any `Disallow` lines you assumed still applied. This catches people constantly.

**Rule precedence within a group.** When several rules match a URL, the **longest path pattern** wins. On a tie the least restrictive wins, so `Allow` beats `Disallow`. An empty `Disallow:` means nothing is disallowed.

**It is advisory.** robots.txt is a convention honored by well-behaved crawlers, not access control. Scrapers ignore it and anyone with a browser can load the URLs you disallow. Never use it to hide staging or customer data; use authentication.

### A complete robots.txt for Meridian Payroll

```txt
# robots.txt for https://meridianpayroll.com
# Owner: marketing. Reviewed by SEO before deploy.
# Reminder: this file controls CRAWLING, not INDEXING.

User-agent: *

# App and account areas — no public content
Disallow: /app/
Disallow: /account/
Disallow: /api/

# Internal search — infinite URL space, thin pages
Disallow: /search
Disallow: /*?q=

# Sort, view and session parameters
Disallow: /*?sort=
Disallow: /*?view=
Disallow: /*?session=

# Print views duplicate the main article
Disallow: /*/print$

# Template store checkout
Disallow: /cart
Disallow: /checkout

# But DO allow the template landing pages
Allow: /templates/

# Never block CSS, JS or images — Google needs them to render
Allow: /assets/
Allow: /*.css$
Allow: /*.js$

Sitemap: https://meridianpayroll.com/sitemap.xml
```

### Crawling is not indexing

This is the most misunderstood mechanism in technical SEO, and you need to explain it to a developer in thirty seconds.

- **Crawling** is Google requesting a URL and reading the response.
- **Indexing** is Google storing the URL and making it eligible to appear in results.

robots.txt controls only the first. It says "do not fetch this URL." It says nothing about whether the URL may appear in results. If Google discovers a blocked URL another way — an external link, a sitemap, an old redirect — it can index the URL anyway, using anchor text and surrounding context as its only evidence about the page.

The symptom: in **Indexing > Pages**, a row labeled **"Indexed, though blocked by robots.txt,"** and in the live SERP a result showing the raw URL as its title with the snippet "No information is available for this page."

Meridian blocked `/compare/` two years ago during a rewrite and never removed the block. A PayCadence affiliate links to `meridianpayroll.com/compare/paycadence`. Google indexes that URL from the link, cannot read a word of it, and serves a bare result for "meridian payroll vs paycadence" — a query with real commercial intent.

| What you want | Correct fix | Why |
| --- | --- | --- |
| The page indexed | Remove the `Disallow` line | The block was the whole problem |
| The page out of the index | Remove the `Disallow` **first**, add `noindex`, wait for a recrawl | Google must fetch the page to see the `noindex` |
| It gone right now | Remove the block, add `noindex`, then use the Removals tool for a temporary suppression | Removals is a stopgap, not a fix |
| It never public | Put it behind authentication | robots.txt is not a security control |

### noindex: the meta robots tag and the X-Robots-Tag header

To keep a URL out of the index you must tell Google **on the page itself**, in a response Google is allowed to fetch. The HTML method goes in the `head`:

```html
<head>
  <meta name="robots" content="noindex, follow">
</head>
```

`noindex` means do not include this URL; `follow` means you may still follow its links, which is what you want on a paginated archive or a thank-you page. Target one crawler with `<meta name="googlebot" content="noindex">`. The same tag carries `nosnippet`, `noarchive`, `max-snippet:[number]`, and `max-image-preview:[setting]`.

The header method sends the same instruction in the HTTP response — the only option for non-HTML files:

```txt
HTTP/1.1 200 OK
Content-Type: application/pdf
X-Robots-Tag: noindex, nofollow
Content-Length: 184320
```

Use the `meta` tag for ordinary HTML pages — thank-you pages, internal search results, thin tag archives. Use the header for non-HTML files, and for a whole directory where one server rule beats editing every file. Meridian's 46 free forms under `/templates/` are PDFs that rank instead of their landing pages and give the visitor no navigation and no call to action; `X-Robots-Tag: noindex` on `/templates/*.pdf` is the only tool that can suppress them, because a PDF has no `head` to hold a `meta` tag.

### The trap: noindex behind a robots block

```txt
robots.txt:      Disallow: /help/legacy/
/help/legacy/*:  meta robots noindex        ← never seen
```

Google is not allowed to fetch those URLs, so it never parses the `head` and never sees the `noindex`. The pages stay indexed as bare "indexed, though blocked" entries, potentially forever.

**A crawl block and a `noindex` are mutually exclusive. To remove a URL from the index, Google must be able to crawl it.** The sequence is always: remove the `Disallow`, deploy the `noindex`, verify in URL Inspection that the live test reports "Excluded by 'noindex' tag," wait for the URLs to drop out of Pages, and only then re-add the block. Most sites should skip that last step — crawl budget constrains sites with millions of URLs; on a 640-URL site it does not.

### nofollow on internal links

`rel="nofollow"` tells Google not to pass ranking signals through a link:

```html
<a href="/account/" rel="nofollow">Sign in</a>
```

Since 2019 Google treats it as a hint rather than a directive, alongside `rel="sponsored"` for paid links and `rel="ugc"` for user-generated content. On **internal** links it is almost never right.

The idea people reach for is "PageRank sculpting": `nofollow` four of ten links so the other six get more each. This stopped working in 2009. Link equity is divided across *all* links on the page and the share allocated to `nofollow` links is discarded rather than redistributed — sculpting does not concentrate authority, it evaporates it. What actually controls authority flow is which links you place and how many clicks a page sits from the home page, which is lesson 07's territory. If you do not want a page to receive internal authority, link to it less.

## Status Codes a Crawler Reads

| Code | Name | What it teaches Google | When to use it |
| --- | --- | --- | --- |
| 200 | OK | The URL exists and this is its content; eligible for indexing | Every page you want ranked |
| 301 | Moved Permanently | Permanently replaced; consolidate signals to the target and swap the indexed URL | Any permanent URL change: migrations, slug edits, merges |
| 302 | Found | Temporary; keep the original as the canonical URL | Genuinely temporary moves. A long-lived 302 is usually read as a 301, but do not rely on it |
| 304 | Not Modified | Nothing changed since the last visit; reuse the cache | Server-generated for conditional requests |
| 404 | Not Found | This URL does not exist; it drops out of the index over weeks | Content genuinely gone with no replacement |
| 410 | Gone | Deliberately and permanently removed | Same outcome as 404, processed slightly faster |
| 429 | Too Many Requests | You are rate-limiting the crawler; Googlebot slows down | Emitted by rate limiters. Sustained 429s cut crawl rate |
| 500 | Internal Server Error | The site is broken; crawl rate drops and URLs are eventually dropped | Never intentional. Always a Tier 1 investigation |
| 503 | Service Unavailable | Temporarily down; pair with `Retry-After` | Maintenance, deploys, overload. Correct for hours or days; longer and Google treats it as permanent |

**Redirect chains.** A chain is a redirect pointing at another redirect:

```txt
/blog/payroll-deadlines
    → 301 → /blog/2024/payroll-deadlines
    → 301 → /blog/payroll-tax-deadlines
    → 301 → https://meridianpayroll.com/blog/payroll-tax-deadlines-2026
    → 200
```

Google generally follows about five hops, but every hop adds latency and another link that can break later. Flatten it: point the first redirect at the final 200 URL and update internal links to that URL. Internal links should never point at a redirect.

**Loops** are worse — A redirects to B, B back to A, Google gives up and indexes nothing. They usually come from two rules fighting, such as a trailing-slash rule that adds a slash and a hostname rule that strips it. Always Tier 1.

**Soft 404s** return status 200 while showing content that means "nothing here": an empty search result, a category with no items, a deleted article rendering "sorry, that page has moved" inside your normal template. Google reports them under **Indexing > Pages > Soft 404**. They are Tier 2 — they burn crawl and leave useless URLs indexed. Fix by returning the truthful code: 404 or 410 if the content is gone, 301 if it moved, `noindex` if the page is legitimately empty for now.

## Canonicalization

The `link rel="canonical"` element in a page's `head` tells Google which URL you consider the preferred version of a set of duplicate or near-duplicate pages:

```html
<head>
  <link rel="canonical" href="https://meridianpayroll.com/templates/payroll-register">
</head>
```

There is no "duplicate content penalty." Google does not punish you for the same content on several URLs. What happens is **filtering and consolidation**: Google picks one URL from the duplicate set to show and consolidates ranking signals onto it. Your problem is not a penalty; it is that Google may pick a different URL than you would, and your links are split until it does.

**Self-referencing canonicals.** Every indexable page should carry a canonical pointing at its own clean, absolute URL — protocol and hostname included. This costs nothing and protects you from parameter versions and scrapers.

**A canonical is a hint, not a directive.** Google reserves the right to choose a different one and tells you when it has. In **URL Inspection**, compare "User-declared canonical" with "Google-selected canonical." When they disagree, Google has overruled you, and that is a finding to investigate.

| Scenario | Example | Correct treatment |
| --- | --- | --- |
| Tracking parameters | `/pricing?utm_source=newsletter` | Canonical to `/pricing`. Do not block in robots.txt — the block stops Google reading the canonical |
| Sort or view parameters | `/help/?sort=recent` | Canonical to the unsorted base; disallow the pattern only if crawl volume is a real problem |
| Filters producing distinct, valuable content | `/templates/?state=california` | If it deserves to rank, give it a real URL and a self-canonical; otherwise canonical to the base |
| Session IDs | `/blog/post?sid=9f2a1c` | Remove from URLs entirely; canonical is a backstop only |
| http and https | `http://meridianpayroll.com/pricing` | Site-wide 301 to https plus https canonicals |
| www and non-www | `www.meridianpayroll.com/pricing` | Pick one hostname, 301 the other, canonical to it |
| Trailing slash | `/product/reports` and `/product/reports/` | Pick one convention, 301 the other, fix internal links |
| Print views | `/help/w2-filing/print` | Delete it and use a print stylesheet; if it must exist, canonical to the article |
| Pagination | `/blog/page/2` | Self-canonical on **each** page. Never canonical page 2 to page 1 — that hides posts linked only from page 2 |
| Case variants and index files | `/Blog/Payroll`, `/index.html` | 301 to the lowercase directory form, enforced at the server |
| Syndicated copies elsewhere | A partner republishes your post | Ask for a canonical back to your original, or a `noindex` on their copy |

A tracking-parameter version of the pricing page:

```html
<head>
  <title>Pricing — Meridian Payroll</title>
  <link rel="canonical" href="https://meridianpayroll.com/pricing">
</head>
```

Page 2 of the blog archive — canonical to itself, not to page 1:

```html
<head>
  <title>Blog — Page 2 — Meridian Payroll</title>
  <link rel="canonical" href="https://meridianpayroll.com/blog/page/2">
  <meta name="robots" content="index, follow">
</head>
```

For non-HTML files there is no `head`, so send the canonical as a `Link` HTTP response header instead.

### Why Google ignores your canonical

When the Google-selected canonical does not match yours, it is nearly always one of these:

1. **The target is `noindex`.** You cannot consolidate onto a page you have excluded.
2. **The target redirects or 404s.** Point at the final 200 URL.
3. **The target is blocked in robots.txt.** Google cannot evaluate a page it cannot fetch.
4. **Chains.** A canonicals to B, B to C. Point everything at the final destination.
5. **Two canonical elements on one page** — usually a theme and an SEO plugin both emitting one. Google may ignore both.
6. **The canonical is outside the `head`,** or injected into the body by JavaScript. Put it in the server-rendered `head`.
7. **The pages are not actually duplicates.** Substantially different content means Google reads your canonical as a mistake.
8. **Conflicting signals.** Sitemap says A, canonical says B, links say C, redirects go to D. Make them agree.
9. **Header and HTML tag disagree.** Send one, not both with different values.

Meridian's `/compare/` pages had exactly problem 5, and the Google-selected canonical came back as `/compare/` for all six — which is why none of them ranked for their own competitor names.

## XML Sitemaps

A sitemap is a machine-readable list of URLs you want crawled and indexed. It is a discovery aid and a diagnostic instrument, not a ranking factor, and listing a URL does not guarantee indexing.

**What belongs:** URLs that are simultaneously status 200, self-canonical, indexable, and content you want in results. **What does not:** redirects, 404s, `noindex` pages, non-canonical duplicates, robots-blocked URLs, parameterized versions of pages already listed. A sitemap full of junk is worse than none, because it destroys the diagnostic value of the discovered-versus-indexed comparison. **Limits:** 50,000 URLs and 50MB uncompressed per file; larger sites split into several files under a sitemap index.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://meridianpayroll.com/</loc>
    <lastmod>2026-06-14</lastmod>
  </url>
  <url>
    <loc>https://meridianpayroll.com/pricing</loc>
    <lastmod>2026-07-02</lastmod>
  </url>
  <url>
    <loc>https://meridianpayroll.com/compare/paycadence</loc>
    <lastmod>2026-07-09</lastmod>
  </url>
</urlset>
```

The index tying Meridian's five sitemaps together (three of the five entries shown):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://meridianpayroll.com/sitemap-core.xml</loc>
    <lastmod>2026-07-09</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://meridianpayroll.com/sitemap-help.xml</loc>
    <lastmod>2026-07-08</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://meridianpayroll.com/sitemap-blog.xml</loc>
    <lastmod>2026-07-12</lastmod>
  </sitemap>
</sitemapindex>
```

**`lastmod` honesty.** The value should reflect the date the page's meaningful content last changed. Google uses it when it is consistently accurate and ignores it when it is not. Many setups stamp today's date on every URL at every build, which makes the field worthless and trains Google to disregard your freshness signals. If your platform cannot produce honest values, omit the field.

**Submission and reading.** Submit the sitemap index under **Sitemaps** in Search Console and add the `Sitemap:` line to robots.txt. The Sitemaps report shows, per file, the date last read, its status, and the discovered URL count; clicking through opens **Pages** filtered to that sitemap, splitting indexed from not-indexed with a reason for each exclusion. That split is why you segment sitemaps by section. If `sitemap-blog.xml` reports 310 discovered and 218 indexed, you know 92 posts are missing and can read the reasons — "Crawled, currently not indexed," "Duplicate without user-selected canonical" — grouped by section instead of buried site-wide.

## JavaScript and Rendering

Googlebot processes a page in two passes. It crawls the raw HTML and extracts what it can, then queues the URL for **rendering**, where a headless evergreen Chromium instance executes the JavaScript and produces the rendered DOM. That second pass is usually quick, but it is a separate queue with separate resource limits and it can lag. Anything that exists only after JavaScript runs is discovered later, less reliably, and sometimes not at all.

**What breaks:**

- **Content that appears only after a user action** — tabs, accordions, "read more" expanders fetched on click. Content hidden by CSS but present in the DOM is fine; content that does not exist until a click is invisible.
- **Links that are not links.** A `div` with an `onclick` handler is not a link and Googlebot does not click. Every crawlable destination needs an `a` element with a real `href`.
- **Routing that produces no real URLs.** Fragment routing like `/#/blog/post` gives every page the same server URL. The server must return a full HTML response per path.
- **Blocked script and style resources.** If `/assets/` is disallowed, Google renders the page without its CSS and JS and may conclude it is broken.
- **Consent walls, geo gates, and anything requiring cookies, `localStorage`, or a login.** Googlebot is stateless.

**How to test.** URL Inspection is authoritative because it shows what Google actually got:

1. Inspect the URL and choose **Test live URL** to fetch fresh rather than read the last indexed snapshot.
2. Open **View tested page**. The **HTML** tab is the **rendered HTML** — the DOM after JavaScript executed.
3. Search it for a distinctive sentence of body copy, your `title`, your canonical, and the `href` of a link you need crawled. Missing there means Google does not have it.
4. The **Screenshot** tab shows the page at render; blank or half-built is a strong signal.
5. **More info** lists resources that failed to load and JavaScript console errors.

Compare against "view page source," which shows what the server sent before JavaScript ran; developer tools' Elements panel shows the live DOM, the rough equivalent of rendered source.

```txt
In raw source?   In rendered HTML?   Verdict
     yes                yes           Safe. Server-rendered.
     no                 yes           Works, but depends on the render queue.
                                      OK for secondary content, risky for
                                      main content and navigation links.
     no                 no            Invisible to Google. Tier 1 if it is
                                      the main content or a nav link.
```

**Briefing a developer.** Frame rendering as a per-template decision, not a religious argument. Marketing pages, the blog, the help center and the comparison pages must be server-rendered or statically generated, because they have to be indexed reliably. An interactive demo or pricing calculator can be client-side as long as server-rendered copy surrounds it. The logged-in app at `/app/` can be entirely client-side and disallowed in robots.txt.

The sentence to give an engineer: *"For any template we need ranked, the main content, the title, the canonical, and the navigation links must be present in the initial HTML response, verified in URL Inspection's rendered HTML."* That is testable, and it does not dictate a framework.

## Speed and Core Web Vitals

| Metric | Measures | Good | Needs improvement | Poor |
| --- | --- | --- | --- | --- |
| **LCP** — Largest Contentful Paint | Time until the largest visible element has rendered | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **INP** — Interaction to Next Paint | Latency from a user interaction to the next visual update, across the whole visit | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** — Cumulative Layout Shift | How much visible content moves unexpectedly during load | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

INP replaced First Input Delay in March 2024 and is a harder test, because it measures every interaction in a session rather than only the first.

All three are assessed at the **75th percentile of real-user field data**, split by device class: three quarters of your real visits must meet the threshold. A page that is fast for you on office fibre and a new laptop can still fail, because that percentile is dominated by mid-range phones on ordinary mobile networks.

**Field versus lab.** Field data comes from the Chrome User Experience Report — anonymised measurements from real Chrome users over a rolling 28-day window. It is what Search Console's report shows and what Google uses as the signal, and low-traffic URLs may have no data at all. Lab data comes from a simulated load on a fixed device and network (Lighthouse, or the lab half of PageSpeed Insights) and is reproducible, instant, and diagnostic.

They disagree constantly and both are telling the truth: lab data has no INP, models one device on one connection, and misses your geographic mix, cache-hit rate, and the tags that fire only for some visitors. **Field data is the verdict, lab data is the explanation.** Never report "we fixed Core Web Vitals" on a Lighthouse score; wait for field data to move, which takes up to 28 days after the fix ships.

**Reading the report.** Start with the Mobile tab, because that is what gets indexed. Drill into an issue such as "LCP issue: longer than 2.5s (mobile)" and Search Console shows **URL groups**, clustering similar pages by template with an example URL each. That grouping tells you the problem is a template, not a page: one group of 310 URLs failing LCP with `/blog/how-to-run-payroll` as the example is one fix, not 310. After shipping, use **Validate fix**.

**The six causes of most real failures:**

| Cause | Metric hit | Concrete fix |
| --- | --- | --- |
| Oversized hero images | LCP | Responsive sizes instead of one desktop-width file; AVIF or WebP; never lazy-load the LCP image; `fetchpriority="high"`. A 2.4MB hero at 3000px on a 390px phone is the most common LCP failure |
| Render-blocking CSS and JavaScript | LCP | Inline the CSS needed above the fold, load the rest asynchronously, `defer` or `async` on scripts, strip unused theme CSS |
| Slow server response (TTFB) | LCP | Cache full pages, add a CDN, fix slow queries. At 1.8s TTFB no front-end work gets LCP under 2.5s |
| Third-party tags | INP, LCP | Audit the tag manager, remove dead tags, load chat and heatmap widgets after interaction. Usually marketing's fault and marketing's to fix |
| Fonts with no swap strategy | CLS, LCP | `font-display: swap`, self-host the files, preload the weights you use, match fallback metrics so the swap does not reflow text |
| Ads or embeds with no reserved space | CLS | Reserve exact space with `width` and `height` attributes or a CSS `aspect-ratio` box before the ad or widget loads |

**How much benefit to expect — honestly.** Core Web Vitals are a real ranking input and a modest one; Google describes page experience as a tiebreaker among results of comparable relevance. Moving a page from Poor to Good will not make an irrelevant page rank or overcome a content gap. What it reliably does is reduce abandonment before render, improve conversion rate, and remove a handicap on mobile. Sell it on those grounds, with ranking as a bonus. Promise "position 18 to position 5 by fixing LCP" and you will be wrong, and your next technical request will not be funded.

## Mobile

**Mobile-first indexing is complete.** Google crawls, renders, and indexes using a smartphone Googlebot. The mobile rendering is not a secondary version that gets checked — it *is* the index. Content that exists on your desktop layout but not your mobile layout does not exist for ranking purposes.

That makes **parity** the headline requirement: the same body copy at the same depth (truncating articles on mobile deletes that text from the index), the same headings, the same internal links (a desktop mega-menu of 40 links against a mobile menu of 6 means Google sees 6), the same structured data, images and `alt` text, and the same canonical and `meta` robots values. Responsive design gives you all of this by default; separate mobile templates and `m.` subdomains are where parity failures live.

**The viewport tag.** Without this in the `head`, a phone renders at desktop width and scales down, producing unreadable text and outright mobile-usability failure:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Do not add `user-scalable=no` or `maximum-scale=1`. Blocking pinch-zoom is an accessibility failure and gains you nothing.

**Tap targets** should be at least about 48 by 48 CSS pixels with roughly 8 pixels between them; adjacent footer links are the usual offender. **Base font size** should be at least 16 pixels.

**Intrusive interstitials.** Google has a specific signal against pop-ups covering the main content immediately on arrival from search, and against gateway pages that must be dismissed first. Legally required notices — cookie consent, age verification, login walls for genuinely gated content — are exempt, as are reasonably sized banners. A full-screen "Get 20% off your first payroll run" modal firing at zero seconds on mobile is exactly the penalized pattern, and it is a marketing decision, so it is yours to fix.

**Checking it.** Use **URL Inspection > Test live URL**, which fetches with the smartphone Googlebot by default, then **View tested page**: the Screenshot tab shows whether the page renders as a usable mobile layout or a scaled-down desktop one; the HTML tab shows whether the rendered HTML carries the full body copy, navigation links, and structured data; More info shows blocked resources. Developer tools also offer device emulation with throttling — not what Google sees, but it catches layout and tap-target problems in seconds.

## Security and Hostname Hygiene

**HTTPS.** Serve the whole site over HTTPS with a valid certificate covering every hostname you use. HTTPS is a lightweight ranking signal; more importantly, browsers flag insecure pages and a certificate expiring on a Saturday takes your organic traffic with it. Put expiry on a calendar with a named owner.

**Mixed content.** An HTTPS page loading an image, script, or stylesheet over `http://` produces mixed content. Browsers block the active kinds outright, which can break rendering — and a page that renders broken for Googlebot is a rendering problem, not a cosmetic one. Developer tools log every warning.

**One canonical hostname.** Exactly one of `https://meridianpayroll.com` or `https://www.meridianpayroll.com` serves content; the other 301s to it in a single hop.

```txt
http://meridianpayroll.com/pricing        → 301 → https://meridianpayroll.com/pricing
http://www.meridianpayroll.com/pricing    → 301 → https://meridianpayroll.com/pricing
https://www.meridianpayroll.com/pricing   → 301 → https://meridianpayroll.com/pricing
https://meridianpayroll.com/pricing       → 200
```

Each is a single hop, not a chain through the www version and then the protocol version.

**Trailing slashes.** `/product/reports` and `/product/reports/` are different URLs to a crawler. Pick a convention, enforce it with one 301 rule, emit matching canonicals, and make every internal link use it.

**After a migration** — redesign, replatform, domain change, or URL restructure — check within 48 hours that the live robots.txt is the intended one and not the staging file containing `Disallow: /`; that no staging `noindex` tags survived (the number one migration disaster); that every old URL 301s to its closest equivalent in one hop; that canonicals point at new URLs; that the new sitemap is submitted and the old one left briefly so Google sees the redirects; that Search Console covers the new hostname; and that Pages is watched daily for spikes in 404s and server errors.

## The Audit Workflow

Work in tier order. The primary tool is Search Console; the fallback is a browser or a free tool.

**Tier 1 — Does it stop indexing?**

| # | Check | Tool | Free fallback |
| --- | --- | --- | --- |
| 1 | robots.txt returns 200 and blocks no path you want ranked | Load `/robots.txt` | Same |
| 2 | CSS, JS and image directories are crawlable | URL Inspection > More info | Read robots.txt |
| 3 | Key templates carry no `noindex` | URL Inspection live test per template | View source, search `robots` |
| 4 | Home page and money pages return 200 | URL Inspection | Network tab |
| 5 | No spike in 5xx server errors | Pages report | Server logs |
| 6 | No "Blocked by robots.txt" or "Indexed, though blocked" rows | Pages report | A `site:` query |
| 7 | No redirect loops on primary paths | URL Inspection | Network tab, preserve log |
| 8 | Certificate valid, covers all hostnames | Browser padlock | Same |
| 9 | Each template's main content appears in rendered HTML | URL Inspection > HTML tab | View source plus Elements panel |

**Tier 2 — Does it misdirect indexing?**

| # | Check | Tool | Free fallback |
| --- | --- | --- | --- |
| 10 | Google-selected canonical matches user-declared canonical | URL Inspection | None — Search Console only |
| 11 | One canonical element per page, absolute, in the `head` | View source | Same |
| 12 | All four protocol and www combinations 301 in one hop; trailing-slash convention consistent | Network tab | `curl -I` |
| 13 | Sitemap holds only 200, canonical, indexable URLs | Sitemaps report | Spot-check 20 sitemap URLs |
| 14 | Discovered-versus-indexed gap per sitemap understood | Pages filtered by sitemap | None |
| 15 | No soft 404s on templated sections | Pages > Soft 404 | Review empty-state pages |
| 16 | Internal links point at final URLs, not redirects | A desktop crawler, if licensed | Check the nav and 20 body links by hand |
| 17 | Parameter URLs not indexed in volume | Pages report, `site:` and `inurl:` | Same |
| 18 | Pagination pages self-canonical and crawlable | View source on pages 2 and 3 | Same |
| 19 | Structured data validates where it exists | Rich Results Test | Enhancements reports |
| 20 | Mobile rendering has content, link and directive parity | URL Inspection screenshot and HTML | Emulation plus view source |

**Tier 3 — Does it degrade quality?**

| # | Check | Tool | Free fallback |
| --- | --- | --- | --- |
| 21 | Poor and Needs-improvement URL groups, mobile first | Core Web Vitals report | PageSpeed Insights per template |
| 22 | LCP element identified per template | PageSpeed Insights | Lighthouse |
| 23 | Viewport meta tag on every template; tap targets and font size adequate | View source and URL Inspection screenshot | Device emulation |
| 24 | No intrusive interstitial on mobile arrival from search | An organic result on a phone | Emulation, incognito |
| 25 | No mixed-content warnings; third-party tags inventoried | Developer tools console and tag manager | Network tab, third-party domains |

## Worked Audit: Meridian Payroll

The baseline — 41,300 clicks and 1,240,000 impressions at 3.3% CTR and average position 18.4 — is many impressions converting to few clicks, your first hint that the wrong URLs may be surfacing. Pages shows 640 URLs submitted across five sitemaps, 486 indexed, 154 not.

| # | Finding | Evidence | Severity | Affected URLs | Fix | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `/compare/` blocked in robots.txt since a 2024 rewrite; pages show "Indexed, though blocked" | robots.txt line `Disallow: /compare/`; Pages report, 6 URLs in that status; SERP shows a bare URL | Tier 1 — critical | 6 comparison pages | Remove the `Disallow` line; request indexing on each URL | Marketing owns robots.txt; engineering deploys |
| 2 | Staging `noindex` survived on templates after the April replatform | URL Inspection live test on `/templates/payroll-register`: "Excluded by 'noindex' tag"; view source confirms | Tier 1 — critical | 46 template landing pages | Remove the tag from the templates template; validate fix in Pages | Engineering |
| 3 | `/help/` returns intermittent 503 during the nightly reindex job | Pages report: 31 URLs in "Server error (5xx)", clustered 01:00–01:40 | Tier 1 — high | ~120 help articles | Serve cached help pages during the window; send `Retry-After` | Engineering |
| 4 | Duplicate canonical elements — theme and plugin both emit one | View source shows two canonical elements; URL Inspection reports Google-selected canonical `/compare/` | Tier 2 — high | 6 comparison pages | Disable the theme's canonical output, keep the plugin's | Engineering, verified by marketing |
| 5 | Blog sitemap lists 310 URLs; 92 not indexed, 61 "Crawled, currently not indexed" | Sitemaps report; Pages filtered to `sitemap-blog.xml` | Tier 2 — high | 92 blog posts | Triage the 61 for thin content per lesson 05; the other 31 are correctly excluded | Marketing |
| 6 | Both www and non-www serve 200 on https with no redirect | Network tab: `https://www.meridianpayroll.com/pricing` returns 200 with a self-canonical | Tier 2 — high | ~640 URLs | 301 www to non-www; update sitemap and links | Engineering |
| 7 | Trailing-slash inconsistency across `/product/` | Spot-check of 10 product URLs; 4 resolve both ways | Tier 2 — medium | ~18 product pages | One 301 rule to the no-slash form; fix links and sitemap | Engineering |
| 8 | Blog body copy is client-rendered; raw HTML has only a loading container | View source shows an empty `article`; rendered HTML has the copy | Tier 2 — medium | 310 blog posts | Server-render the blog template | Engineering |
| 9 | Nav links to `/product/reports` pass through a two-hop chain | Network tab: `/products/reports` → 301 → `/product/reports/` → 301 → `/product/reports` | Tier 2 — medium | Site-wide nav | Point the nav at the final URL; flatten to one hop | Engineering |
| 10 | 1,140 tag-archive URLs indexed with one to three posts each | `site:meridianpayroll.com inurl:/blog/tag/` plus Pages report growth | Tier 2 — medium | ~1,140 archives | `noindex, follow` on tag archives; keep the 14 category archives; drop them from the sitemap | Marketing, in the CMS |
| 11 | 46 template PDFs outrank their landing pages | Performance report: PDF URLs take 2,100 clicks, landing pages 380 | Tier 2 — medium | 46 PDF files | `X-Robots-Tag: noindex` on `/templates/*.pdf` | Engineering |
| 12 | Blog template fails LCP and CLS on mobile at the 75th percentile | Core Web Vitals: mobile group of 310 URLs, LCP 4.1s, CLS 0.24, example `/blog/how-to-run-payroll`; PageSpeed Insights names a 2.4MB hero | Tier 3 — medium | 310 blog posts | Responsive AVIF hero, `fetchpriority="high"`, no lazy-load; reserve the widget's height | Engineering |
| 13 | Full-screen promotional modal fires at 0s on mobile from organic entry | Three organic results loaded on a phone in incognito | Tier 3 — medium | Site-wide | Delay to 30s or exit intent; bottom banner under 768px | Marketing |

Findings 1 to 3 alone put more than 170 URLs back on the board; the templates section earned zero organic clicks for four months because of one leftover tag. No amount of hero-image compression would have found that.

## Practice

Run a technical audit of a live property using Search Console and free tools. Use a site you have verified access to — your employer's, a client's, or your own; if you have none, ask your instructor for the practice property.

**Steps**

1. Set the date range to the last three months and record the baseline: clicks, impressions, average CTR, average position.
2. Load `/robots.txt` and transcribe it. Write one sentence per `Disallow` rule saying what it blocks and whether that is intentional. Flag any rule touching a path you want ranked and any block on CSS, JS, or images.
3. Open **Indexing > Pages**. Record indexed and not-indexed counts and every exclusion reason with its count, flagging rows for "Indexed, though blocked by robots.txt," "Server error (5xx)," "Redirect error," "Excluded by 'noindex' tag," and "Soft 404."
4. Open **Sitemaps**. Confirm each file returns a success status, then click through to the filtered Pages report and record the discovered-versus-indexed split per sitemap.
5. Spot-check twenty URLs from a sitemap file, recording for each the status code from the Network tab, whether it is self-canonical, and whether it carries a `noindex`. Any URL failing one of the three does not belong in the sitemap.
6. Pick one URL per major template — home, a product page, a blog post, a help page. Run **URL Inspection > Test live URL** on each and record the user-declared canonical, the Google-selected canonical, whether body copy and navigation links appear in the rendered HTML, and any blocked resources or console errors. Then use view source to count canonical elements per page.
7. With "preserve log" enabled in the Network tab, load all four combinations of protocol and www for one interior page, recording the chain and hop count for each, then test both trailing-slash forms.
8. Open **Core Web Vitals**, Mobile tab. Record every URL group with its metric, value, and URL count. For the worst group, run PageSpeed Insights on the example URL and record the LCP element, the field values, and the top three lab opportunities, stating where field and lab data disagree.
9. Run the mobile checks: judge layout and tap targets from the URL Inspection screenshot, load two organic results on a phone and record any interstitial behavior, and confirm the viewport tag.
10. Work the remaining checks in the workflow above. Where you have no desktop crawler, use the stated free fallback and say so in your evidence column.
11. Assemble the table with the columns **finding, evidence, severity, affected URLs, fix, owner**. Put the tier in the severity column and sort by tier. Every row needs a specific citation — a report name and a number, a URL and a status code, a quoted robots.txt line, or a named URL Inspection field. "Looks slow" is not evidence; "Core Web Vitals report, mobile, LCP group of 310 URLs at 4.1s" is.
12. Write a three-sentence summary above the table naming the highest-cost finding, what it costs in indexed URLs or lost impressions, and what it takes to fix.

**Deliverable — Technical Findings Table.** One document containing the baseline figures, the three-sentence summary, and a findings table of at least twelve rows with the six required columns, ordered by the triage principle with Tier 1 first and an evidence citation in every row. Any row owned by engineering must state the fix in terms a developer can act on without a follow-up question.
