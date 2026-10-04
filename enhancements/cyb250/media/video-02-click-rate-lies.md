---
course_id: cyb250
media_id: cyb250-v02
type: video-script
title: "Why a Falling Click Rate Can Mean Nothing: Fixing an Awareness Dashboard"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cyb250-05
objectives:
  - Deliver a short awareness session and choose metrics that show whether behavior actually changed
competency_ids:
  - D5-S1-C05
---

## Purpose

After watching, the learner can identify at least five problems in a completion-and-click-rate dashboard and replace them with behavior metrics that have correct denominators, difficulty labels, and no individual-level exposure.

## Audience and prerequisites

Apprentices working on lesson 05, Practice Parts 3 and 4. Basic spreadsheet familiarity.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | The lesson 05 "Q3 Security Awareness Results" dashboard fills the screen, green status badge glowing. | "This dashboard is going to the board. Completion ninety-seven percent. Click rate down from eleven to four — a sixty-four percent improvement. Looks great. Almost every line is misleading. Let's fix it." |
| 0:20 | Highlight line 1: "Training completion: 97%". Margin note: "Measures attendance". | "Line one: completion. It measures that people were assigned and clicked through a module. That's attendance, not behavior. Keep it for the auditor, move it off the headline." |
| 0:45 | Highlight line 2: click rate 11% → 4%. Two lure thumbnails appear side by side, labelled "Q2: hard (internal-looking, real-project reference)" and "Q3: easy (generic parcel notice)". Both thumbnails are blurred placeholders, not lure content. | "Line two. Click rate is mostly a measure of how hard the lure was. Q2 used a hard, targeted-looking lure. Q3 used an easy generic one. Comparing them as progress is comparing two different tests. Without a difficulty label, this number tells you about the campaign designer, not the workforce." |
| 1:30 | Spreadsheet screencast: columns `sent`, `delivered`, `clicked`, `reported`. Formula bar shows `=clicked/sent`. Cursor changes it to `=clicked/delivered`. Value changes. | "And check the denominator. This sheet divides by messages sent. Quarantined messages were never seen by anyone. Use delivered to inbox, and exclude people who weren't at work." |
| 2:05 | Highlight line 3: "Top 10 repeat clickers forwarded to line managers". Stop icon with "Ethics" label. | "Line three is an ethics problem, not an accuracy problem. Naming individuals to their managers turns a measurement into a punishment. The next quarter, people learn to avoid the test, not the attack — and they stop reporting their own mistakes. Report at team and cohort level only, and offer support privately." |
| 2:40 | Highlight line 4: "Awareness emails sent: 14". Label: "Activity, not outcome". | "Line four counts our effort. Nobody's behavior is in it." |
| 2:55 | Highlight line 5: "620 reported, 580 not malicious — 94% false positives". Re-label as "Report volume: 620 (40 real threats caught by people)". | "Line five is the most damaging. It frames harmless reports as failure. A rising stream of 'I wasn't sure' reports means people are willing to tell you. Punish that and your time-to-report on the real ones goes up. Those forty real threats reported by people — that's the story." |
| 3:35 | New blank scorecard template. Rows fill in one by one with definition, denominator, source, leading/lagging. | "Now build the replacement. Report rate: reported over delivered. Leading. Median time to first report. Leading. Report rate among people who clicked — that one tells you whether the no-blame culture is real. Share of real campaigns first detected by a human report — that's awareness as a detection control in one number. Time from first report to purge — that's our process, not theirs." |
| 4:40 | Callout: "Coverage: simulations reach 27% of staff (mailbox holders only)". | "And state coverage honestly. If simulations only reach people with mailboxes, say that the depots and contractors aren't in this number, and say how you'll measure them instead — reports from personal phones, verification calls to the service desk." |
| 5:10 | Narrative box: "What the numbers do not prove." | "Every scorecard needs one paragraph on what the numbers don't prove. Small teams are noise. A new mail gateway or a real attack in the same week moves everything. Say so before someone numerate says it for you." |
| 5:40 | Top-of-page summary appears (three sentences, see assets). | "And lead with the answer. Something like this." |
| 6:10 | Presenter voice over final page. | "A mature awareness function recommends controls that make its own metric less important — like mandatory payment-change callbacks. That's the fastest way to be believed." |
| 6:40 | End card: "Practice Part 4 — write your own review." | "Your turn: Practice Part 4." |

## On-screen assets and B-roll

- The dashboard text from lesson 05 Practice Part 4, rendered as a slide.
- Sample corrected summary (on screen at 5:40): "Staff reported 40 real malicious messages this quarter; three of four credential-harvesting campaigns were first caught by a person, at a median of nine minutes. Simulation report rate rose on a harder lure, but simulations still reach only mailbox holders (27% of staff). We are asking the board to approve mandatory callback verification for supplier bank changes."
- Spreadsheet with synthetic data (can reuse `cyb250-x02` generated files).

## Accessibility

- Captions; every spreadsheet value that changes is read aloud.
- Highlights use thick outlines and margin labels, not color alone.
- Spreadsheet zoomed to 150%+; formula changes shown in an enlarged inset.

## Check for understanding

1. Why can't a click rate drop from 11% to 4% be called a 64% improvement without more information? *Answer: the lures may differ in difficulty and denominators may differ; without a difficulty label and consistent delivered-based denominators the comparison is not like for like.*
2. What does "report rate among those who clicked" tell you? *Answer: whether people who made a mistake feel safe reporting it — a direct measure of the no-blame culture.*
3. Name the ethics problem in the original dashboard. *Answer: forwarding named repeat clickers to line managers, which is punitive and corrupts future data.*
