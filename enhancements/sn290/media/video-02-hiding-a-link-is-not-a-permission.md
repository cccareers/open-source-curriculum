---
course_id: sn290
media_id: sn290-v02
type: video-script
title: "Hiding a Link Is Not a Permission: Testing Portal Knowledge and Catalog Access"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - sn290-05
objectives:
  - Surface the Knowledge Base and Service Catalog through the portal with the correct permissions
competency_ids:
  - D6-S1-C04
---

## Purpose

After watching, the learner can explain the four permission layers for portal knowledge, apply "deny wins" with reusable user criteria, and verify access through listing, search, and direct URL by impersonation.

## Audience and prerequisites

Learners on lesson 5 with the `dev290` portal and the `SN290 Practice` knowledge base. Demo instance has test users `nw.nurse` and `nw.contractor` and the criteria from project sn290-x01.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. | "A compliance officer calls: a contractor saw an article they should not have. You check the portal menu, and the link is not there. Case closed? No. Hiding a link is not a permission." |
| 0:15 | Title card. | "Testing portal knowledge and catalog access. Lesson five." |
| 0:20 | Animated stack of four layers: Page, Knowledge base criteria, Article criteria, ACLs. A user icon drops through; any red gate stops it. | "Portal knowledge has four layers. Can the user see the page. Can they read the knowledge base. Can they read this article. And the platform ACLs underneath. If any layer says no, the answer is no." |
| 0:50 | Screen: a knowledge base record, scroll to related lists Can Read and Cannot Read. | "Layers two and three use user criteria: reusable named bundles of roles, groups, departments, companies, locations, or users. A knowledge base has four related lists: can read, cannot read, can contribute, cannot contribute." |
| 1:15 | Open user criteria `NW - Contractors`: Groups = NW Contractors. | "Build a criterion once, name it for who it means, and attach it everywhere. Here, NW Contractors." |
| 1:30 | Northwind Clinical KB: Can read = NW - Clinical staff; Cannot read = NW - Contractors. Text overlay: "Deny wins." | "Grant broadly, then carve out with deny. A user who matches a can-read and a cannot-read is denied. Every time." |
| 1:50 | Article record: note Workflow state = Draft on one article. Overlay: "Only published articles appear." | "Before you blame criteria, check state. Draft, review, and retired articles are invisible to readers regardless of permissions." |
| 2:10 | Copy the direct URL of a clinical article as admin: `/dev290?id=kb_article&sys_id=...`. Paste into a notes pane. | "Now the test. As admin, I copy the direct URL of a clinical article. Admin sees everything, so admin proves nothing. This URL is the probe." |
| 2:30 | Impersonate `nw.nurse`. Open `/dev290?id=kb`. Clinical KB listed. Search "cart" returns the article. Paste direct URL: article opens. | "Impersonate a nurse. Check one: the knowledge home lists Clinical. Check two: search finds the article. Check three: the direct URL opens it. Three paths, three passes." |
| 3:10 | End impersonation; impersonate `nw.contractor`. KB home: no Clinical. Search "cart": no result. Paste direct URL: the page shows the article is not available. | "Now the contractor. Listing: absent. Search: absent. Direct URL: not available. That third check is the one people skip, and it is the one that finds real defects." |
| 3:50 | Whiteboard: a matrix grid, users down the side, checks across the top, with check and cross shapes filling in. | "Do this as a matrix. Three or four users, the same checks each time. Write every cell down. And re-run the whole matrix after any change to a criterion, because criteria are shared." |
| 4:20 | Screen: catalog item "Clinical cart repair": Available for = NW - Clinical staff. Impersonate contractor; category page does not show it; direct item URL `/dev290?id=sc_cat_item&sys_id=...` shows it is not available. | "The catalog works the same way, with Available for and Not available for. Same test: category page, search, and the direct item URL." |
| 5:00 | Screen: **Service Portal > Portals > dev290**, related list Search Sources. Open the knowledge source; scroll to the data fetch script. | "Search is where leaks hide. Each search source has a data-fetch script. If a custom source queries with plain GlideRecord and no permission check, it will show titles and snippets the user cannot open. Query as the user: use GlideRecordSecure, or check canRead on each record and field before returning a title or snippet." |
| 5:40 | Talking head. | "Back to the compliance call. The likely causes are a draft or wrongly published article, a missing deny, or a custom search source. Your matrix tells you which." |
| 6:00 | Recap slide: "Four layers. Deny wins. Reuse criteria. Check state first. Test listing, search, and direct URL, by impersonation." | "Four layers. Deny wins. Reuse criteria. Check state first. And test every path by impersonation." |
| 6:30 | End card. | "Now build the matrix in lesson five's practice, step seven." |

## On-screen assets and B-roll

- Four-layer gate animation (simple, could reuse shapes from sn290-a01).
- Matrix whiteboard graphic with check and cross shapes.
- Demo instance pre-loaded with project sn290-x01 users, criteria, and items.

## Accessibility

- Captions and transcript; impersonated user name is spoken aloud at every switch, and shown in a large overlay label.
- Pass/fail in the matrix uses shapes plus text, never color alone.
- URLs are read aloud in structure ("the kb article page with a sys ID parameter").

## Check for understanding

1. A user can read an article through search but the knowledge home page does not list its knowledge base. What does that suggest? *Answer: a search source is returning results without applying the same permission checks as browsing; inspect the data-fetch script.*
2. A user is in groups matched by both `NW - Clinical staff` (Can read) and `NW - Contractors` (Cannot read). Can they read the Clinical KB? *Answer: No. Deny wins.*
3. Why is testing as admin not evidence? *Answer: admin passes the checks a normal user would fail, so it cannot reveal a missing restriction.*
