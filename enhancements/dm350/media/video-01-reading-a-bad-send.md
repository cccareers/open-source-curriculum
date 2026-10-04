---
course_id: dm350
media_id: dm350-v01
type: video-script
title: "Reading a Bad Send"
format: screencast
target_runtime: "7 min"
related_lessons:
  - dm350-07
objectives:
  - Read open, click, bounce, and unsubscribe metrics correctly
  - Diagnose email deliverability and performance problems and fix them
competency_ids:
  - D5-S1-C03
---

## Purpose
After watching, a learner can recompute an email report with the right denominators, use click-to-open to separate a list problem from a content problem, and walk lesson 07's triage path to a recovery plan.

## Audience and prerequisites
Apprentices who have read lesson 07 through "The Metrics, With Their Denominators". Spreadsheet access.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: a platform-style dashboard tile reads "Delivered 92%  Opens 16%  Clicks 1.2%". A Slack-style message from Ruth: "Open rate halved. Do we need better subject lines?" | "Northlight's October newsletter. The owner thinks it is a subject-line problem. In seven minutes you will know it is not, and you will be able to prove it from four numbers." |
| 0:20 | Title card: "Reading a Bad Send". | "We will rebuild the report, then walk the triage path." |
| 0:28 | Blank sheet. Rows: Sent, Hard bounces, Soft bounces, Delivered, Unique opens, Unique clicks, Unsubscribes, Complaints. Type 7,450 / 447 / 149 / formula / 1,096 / 82 / 41 / 24. Delivered cell: `=7450-447-149` → 6,854. | "Start with raw counts, not the dashboard's percentages. Sent seven thousand four hundred and fifty. Delivered is sent minus all bounces: six thousand eight hundred and fifty-four. And remember: delivered only means 'not bounced'. A message in the spam folder counts as delivered." |
| 1:05 | Add a "Rate" column. Hard bounce `=447/7450` 6.00%; soft `=149/7450` 2.00%; open `=1096/6854` 15.99%; click `=82/6854` 1.20%; unsub `=41/6854` 0.60%; complaint `=24/6854` 0.35%. Denominator shown in a third column: "sent" or "delivered". | "Bounces are over sent. Everything after delivery is over delivered. Type the denominator next to every rate, every time." |
| 1:45 | Add September column beside it: sent 5,900, bounce 3.0%, open 31%, click 2.4%, complaints 0.09%. | "Now put last month next to it." |
| 2:00 | Highlight the "Sent" cells: 5,900 → 7,450. Annotation: "+1,550 in one month". | "First fact. The list grew by one thousand five hundred and fifty in a month. That is a large change. Check the import log before assuming how the contacts arrived." |
| 2:25 | Highlight hard bounce 6.00% against the threshold card "Hard bounce under 2%; over 5% risks blocking". | "Second fact. Six percent of addresses do not exist. That is the signature of old, purchased or scraped data. Lesson 02's conference spreadsheet, uncleaned." |
| 2:50 | Highlight complaint 0.35% against "Complaint under 0.10%; 0.30% is where providers act". | "Third fact. Complaints are point three five percent, nearly four times September. People press spam when they do not recognise the sender. Twenty-four people out of nearly seven thousand, and the whole domain is at risk." |
| 3:20 | Add CTOR row: `=82/1096` → 7.48%. September CTOR `=2.4/31` → 7.74%. Draw a box around both. | "Now the number everyone skips. Click-to-open: clicks over opens. October seven point four eight percent. September about seven point seven. The people who opened behaved almost exactly the same. That points toward list and delivery issues as the first investigation; stable CTOR does not prove the content was fine." |
| 3:55 | Text overlay: "Opens fell + CTOR held + bounces and complaints up = LIST problem". | "CTOR held while bounces and complaints rose. Investigate the list and consent first; these aggregate rates cannot rule out every copy or subject-line issue." |
| 4:15 | Show lesson 07 triage path as a checklist; tick step 1 (delivery changed → list), step 2 (complaints up → consent). | "Walk the triage path in order. Step one: did delivery change? Yes, bounces up: list problem. Step two: did complaints change? Yes: consent or relevance. We can stop before step seven, 'rewrite the copy'." |
| 4:45 | Recovery plan appears in four phases: Immediate (suppress 1,550 import batch and 447 hard bounces; pause 7 days), Week 1 (verify SPF/DKIM/DMARC, blocklists, postmaster tools), Weeks 2-4 (ENGAGED tier only, 1,180 contacts, weekly), Month 2 (widen to ACTIVE; assess a lawful re-permission route for the import batch, using email only where authorized). | "The fix follows from the diagnosis. Suppress the imported batch and the hard bounces now. Check authentication and blocklists. Send only to the most engaged tier for a few weeks, then widen if bounces stay under one percent and complaints under point zero five." |
| 5:40 | A reply drafted to Ruth: "It isn't the subject line. The send grew by 1,550 contacts; 6% of all sent addresses hard-bounced and complaints rose. The import batch is our first suspect, but we need cohort-level logs to assign those bounces and complaints. Tracked opens led to clicks at about the usual rate. I've suppressed the batch and we'll rebuild over a month." | "And the message to the owner. Plain, specific, with the evidence and what you have already done." |
| 6:10 | Recap card: "Count first. Denominator on every rate. CTOR separates list from content. Triage in order." | "Count first, label every denominator, use click-to-open to tell a list problem from a content problem, and walk the triage path in order." |
| 6:35 | End card: "Practice 1, lesson 07". | "Now do the arithmetic for the next send in the practice section. Pause here." |

## On-screen assets and B-roll
- Spreadsheet template with the eight raw-count rows and a "denominator" column.
- Threshold cards from lesson 07 as overlays.
- Mock owner message (no real product UI).

## Accessibility
- Captions; every percentage read aloud with its denominator.
- Highlights carry text labels ("list problem", "threshold breached"), not colour alone.
- Zoomed spreadsheet (150%+) and visible formula bar.

## Check for understanding
1. Open rate fell from 31% to 19% and CTOR fell from 7.7% to 3.1%; bounces and complaints are normal. Which triage branch, and what do you check? *Answer: opens and CTOR both fell with a clean list, so look at placement first (authentication, one-provider split, seed tests) and then content/offer; it is not a list problem.*
2. Why is "delivered" not the same as "reached the inbox"? *Answer: delivered means only that the receiving server accepted the message; spam-folder placement is invisible to the sending platform.*
3. Why should the recovery start with the most engaged tier? *Answer: engagement from recipients is the main input to reputation; sending first to people who open and click rebuilds the signal mailbox providers use for placement.*
