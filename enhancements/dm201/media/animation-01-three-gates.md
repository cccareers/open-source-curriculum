---
course_id: dm201
media_id: dm201-a01
type: animation-storyboard
title: "Three Gates: One Article's Journey From Publish to Page One"
target_runtime: "100 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - dm201-02
objectives:
  - Explain how crawling, indexing, and ranking determine whether a page can appear in search results
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes

Misconception: "we published it, so it should rank" — or its sibling, "it isn't ranking, so let's rewrite the title." The animation follows `/blog/payroll-tax-deadlines` from lesson 02 through discovery, crawl, index, and serving, using the real timestamps from the lesson's server log and gate-by-gate table. It shows that each gate is sequential, that waiting at a gate is normal, and that the fix for a page stuck at gate 1 is never on the page.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- The article is a document card labelled `/blog/payroll-tax-deadlines`.
- Three vertical gates spaced left to right, each with a text label: CRAWL, INDEX, SERVE. A small "Discovery" queue sits before gate 1.
- Gate states use shape plus colour: open gate (bars raised, label "OPEN"), closed gate (bars down, label "CLOSED"), waiting (hourglass icon).
- Palette (Okabe-Ito): gates #0072B2 blue; the article card #E69F00 orange; Googlebot as a small #009E73 green robot icon; Search Console status ribbon #CC79A7 reddish purple with text.
- A timeline ruler runs along the bottom with dates 3 Mar to 12 Jun 2026.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6 s | Empty stage, three closed gates. Article card appears at far left with "3 Mar 09:14 — Published." | Card fades in. | "Meridian publishes a new article. Right now, nothing on the internet knows it exists." |
| 2 | 10 s | Two link arrows grow toward the card: one from a `/blog/` index card, one from a `sitemap.xml` card. Card slides into the Discovery queue. Status ribbon: "Discovered – currently not indexed." | Arrows draw; card moves into queue. | "Links from the blog index and the sitemap put it on Google's list. Discovered. Not fetched. Nothing has been read yet." |
| 3 | 8 s | Hourglass over the queue; timeline ticks forward 41 hours. | Hourglass flips. | "It waits forty-one hours. That's normal. You don't control this queue." |
| 4 | 10 s | Green robot fetches the card; HTTP "200" badge appears; two small asset cards (CSS, JS) fly to the robot. Gate 1 raises to OPEN. Ribbon: "Crawled – currently not indexed." | Robot moves, gate lifts. | "5 March: Googlebot's smartphone crawler fetches it, plus the CSS and JavaScript to render it. Gate one: open." |
| 5 | 8 s | Card sits before gate 2 with a magnifying glass scanning it. Caption box: "Not a verdict. Under evaluation." | Scan line passes over card. | "Crawled but not indexed. On day two that isn't a problem. Google is still deciding." |
| 6 | 8 s | Gate 2 raises. Ribbon: "URL is on Google." Small check: "Google-selected canonical = declared." | Gate lifts; card passes. | "7 March: selected for the index. The canonical Google chose matches the one Meridian declared." |
| 7 | 14 s | Gate 3 is a scoreboard showing query `payroll tax deadlines` with position 61.2, then animating to 34.5 (24 Mar), then 12.7 (12 Jun). Impressions counter rises 3 to 190 to 1,910; clicks 0 to 4 to 71. | Number tweens along the timeline. | "Serving is per query. First impressions on page six. Two weeks later, page four. Three months on, the edge of page one, without anyone touching the page." |
| 8 | 8 s | Two small link arrows join the card mid-timeline: "2 internal links (new posts)", "1 external link (accountancy newsletter)". | Arrows draw in. | "What changed? Two internal links and one external link, and time for Google to gather evidence." |
| 9 | 14 s | Rewind effect. Alternate path: the `/blog/` link arrow is removed. Card sits in Discovery with hourglass for weeks; a hand icon edits the title on the card repeatedly; ribbon stays "Discovered – currently not indexed." Caption: "Fixing the page doesn't open gate 1." | Rewind, then loop of title edits with no gate change. | "Now the version without the blog link. The page sits at discovery for weeks while someone rewrites a title Google has never read. The fix was a link, not the page." |
| 10 | 14 s | All three gates shown with one-line diagnostic under each: CRAWL — "URL Inspection: last crawl?", INDEX — "Pages report: which reason?", SERVE — "Performance: which query, which position?" | Labels type on. | "When a page isn't ranking, find the gate first. Crawl, index, then serve. Only then decide what to change." |

## Interaction variant (optional)

A scrubbable timeline (H5P interactive video or a small web widget): learners drag the date slider and the Search Console status ribbon, gate states, and metrics update. Add three "what would you do?" pause points (day 2, day 6, day 20) with multiple-choice answers; the correct answer at day 2 is "wait."

## Production notes

- All dates, positions, impressions, and clicks come from lesson 02's worked example. Keep them identical so the animation reinforces the lesson.
- Status strings must match Search Console wording as used in lesson 02; check the live interface before production in case labels have changed.
- Do not depict any real Google interface; use stylised ribbons.
- Keep the robot friendly and generic; avoid any Google logo or trademarked mascot.
