---
course_id: dm201
media_id: dm201-v01
type: video-script
title: "Reading the Pages Report: Intentional or Unintentional?"
format: screencast
target_runtime: "8 min"
related_lessons:
  - dm201-02
  - dm201-08
objectives:
  - Explain how crawling, indexing, and ranking determine whether a page can appear in search results
  - Audit robots directives, sitemaps, and canonical tags on a live site
competency_ids:
  - D1-S1-C03
  - D1-S1-C02
---

## Purpose

After watching, the learner can open Search Console's Indexing > Pages report, classify every non-indexed reason as intentional or unintentional, compute the intended-indexable gap, and pick the first row to investigate.

## Audience and prerequisites

Learners who have read lesson 02 through "The Search Console states you must be able to explain." Search Console access to any property is helpful but not required; the video uses lesson 02's 12 September 2026 export, joined to the 790-URL audited cohort. It excludes tag archives and downloadable PDFs; it is not a whole-property total.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Mock-up of Pages export, audited cohort (12 Sep 2026): Indexed 579, Not indexed 211. A red "211" is circled. | "Two hundred eleven pages not indexed. Most people see that number and panic. By the end of this video you'll know that most of those pages are supposed to be there, and which handful actually need you." |
| 0:20 | Title card. | "Reading the Pages report: intentional or unintentional." |
| 0:30 | Scroll to "Why pages aren't indexed" table (eight reasons from lesson 02). | "Here is the table that matters. Eight reasons. Our job is to sort every row into one of two buckets: the site meant this, or the site did not." |
| 0:50 | Add a third column on screen labelled "Intentional?" | "Add a column. We fill it in by opening examples, never by reading the label alone." |
| 1:05 | Click "Alternate page with proper canonical tag — 74". Example URLs list: /help/w2-filing/print, /templates/?state=ca, /pricing?utm_source=newsletter. | "Seventy-four alternates. Open three examples. A print view, a filtered template view, a tracking-parameter version of pricing. Each one points its canonical at the clean URL. That's working as designed. Intentional." |
| 1:40 | Column fills: "Yes". | "Mark it yes." |
| 1:45 | Click "Excluded by 'noindex' tag — 41". Examples: /help/form-940-filing/print, /search?q=w2, /thank-you. | "Forty-one noindex. Print views, internal search, a thank-you page. All things we don't want in results. Intentional — but this is the row to check every single time, because a stray noindex on a real page looks identical in this list." |
| 2:15 | Presenter opens a fourth example: /templates/payroll-register. Cursor hovers. | "Imagine one of these examples was a template landing page. That single URL would turn this row from 'fine' into a Tier 1 finding. That is why you open examples." |
| 2:35 | "Page with redirect — 29", "Blocked by robots.txt — 2", "Not found (404) — 4". Quick clicks. | "Redirects: old URLs pointing at new ones. Intentional. Two robots-blocked URLs: the admin paths. Intentional. Four 404s: genuinely deleted pages with no replacement. Intentional, as long as nothing important links to them." |
| 3:10 | Arithmetic panel appears: 74 + 41 + 29 + 2 + 4 = 150. 790 cohort URLs − 150 = 640 intended indexable. 640 − 579 indexed = 61 gap. | "Now the arithmetic. One hundred fifty intentional exclusions. Seven hundred ninety audited URLs minus one fifty is six hundred forty pages Meridian actually wants indexed. Five hundred seventy-nine are. The gap is sixty-one. That's the technical indexing agenda for this cohort." |
| 3:50 | Highlight remaining rows: Duplicate, Google chose different canonical — 38 (+12); Crawled – currently not indexed — 17 (+5); Discovered – currently not indexed — 6 (+6). | "Three rows make up those sixty-one. And look at the trend column. The duplicate-canonical row grew by twelve. That's the one to open first, because it's growing fast enough that the cause is still findable." |
| 4:20 | Click into the duplicate-canonical row; open URL Inspection on /compare/paycadence. Fields visible: User-declared canonical: /compare/paycadence. Google-selected canonical: /compare/. | "URL Inspection on one example. We declared this page canonical to itself. Google picked the compare index page instead. Google has overruled us." |
| 4:50 | View source, browser find for "canonical" shows two link elements. | "View source and search for canonical. Two of them. A theme and a plugin both writing one. That's problem five on the lesson 08 list, and it's an engineering ticket with a one-line fix." |
| 5:25 | Back to Pages; open "Crawled – currently not indexed — 17". Examples: three thin blog posts under 300 words. | "Crawled, not indexed. Google read these and declined. Open them. Three very thin posts. The fix is not a resubmit button. It's making them meaningfully better, merging them, or admitting they shouldn't exist." |
| 6:00 | Open "Discovered – currently not indexed — 6". Example URLs all new /help/ articles. URL Inspection shows "Referring page: none detected" and sitemap only. | "Discovered, not indexed. Google knows these exist and hasn't fetched them. All six are new help articles found only through the sitemap. Nothing links to them. The fix is internal links from pages Google already crawls often." |
| 6:35 | Final table on screen with all columns: Reason, Count, Intentional?, Gate, First action. | "Here's the finished table. Every row sorted, every unintentional row matched to a gate and a first action." |
| 7:00 | Warning card: "Live test ≠ indexed." | "One trap before you go. After you fix something, the live test will say the URL is available to Google. That doesn't mean it's indexed. Only the default view saying 'URL is on Google' means that." |
| 7:25 | End card with practice prompt from lesson 02 Part B. | "Now do this on your own property. Open three examples per row. Never classify from the label." |

## On-screen assets and B-roll

- Mock-up screenshots of Indexing > Pages, URL Inspection (indexed and live views), and view-source for Meridian Payroll. Build these as static mock-ups; do not record a real customer's property.
- An arithmetic overlay panel reused at 3:10.
- Note for production: Search Console labels and layout change; re-check the mock-ups against the live interface before recording and adjust narration if a label has changed.

## Accessibility

- Captions verbatim. All on-screen numbers are spoken.
- The "Intentional?" column uses the words Yes and No, not only colour.
- Cursor movements are narrated ("click the duplicate-canonical row") so the demo is followable without seeing the pointer.
- Zoom to at least 150% on tables so text is legible at 720p.

## Check for understanding

1. A row reads "Excluded by 'noindex' tag — 41." Why can't you mark it intentional without opening examples? **Answer:** a stray noindex on a page you want ranked looks identical in the list; only the examples show whether any money pages are in it.
2. Total known URLs 900, intentional exclusions 220, indexed 610. What is the gap? **Answer:** 900 − 220 = 680 intended; 680 − 610 = 70 URLs.
3. Which non-indexed row should you open first, and why? **Answer:** the unintentional row that is growing fastest, because the cause is recent and still findable.
