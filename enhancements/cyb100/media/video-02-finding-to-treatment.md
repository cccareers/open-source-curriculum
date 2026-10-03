---
course_id: cyb100
media_id: cyb100-v02
type: video-script
title: "From Finding to Treatment: One Risk, End to End"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cyb100-04
objectives:
  - Rate a risk by likelihood and impact and choose a mitigation strategy for it
competency_ids:
  - D1-S1-C02
---

## Purpose
After watching, the learner can turn a lesson 03 finding into a risk sentence, rate it with a justification per rating, read the matrix, pick a primary response, and state the residual risk honestly.

## Audience and prerequisites
Learners who have completed cyb100-03 and read the scales and matrix in cyb100-04. A spreadsheet with the lesson 04 matrix is shown; no software skills required.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Screen: lesson 03 Harlow & Finch finding #4 highlighted: "Unsupported operating system on reception." | "This is a finding from Harlow & Finch: the reception PC runs an operating system whose vendor support ended two years ago. On its own, that's not a risk yet. Let's turn it into one, rate it, and decide what to do — the whole lesson 04 routine in seven minutes." |
| 0:25 | Spreadsheet row, column "Risk statement". Template appears in grey: "[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]". | "Step one: write the sentence. Threat actor or event, exploits weakness, affecting asset, resulting in harm. If you can't fill all four slots, you have a fragment, not a risk." |
| 0:45 | Text typed: "Commodity malware exploits the unsupported, unpatchable reception PC on the flat office network, reaching the client file server and making seven years of tax records unavailable and possibly disclosed." | "Commodity malware — the opportunistic kind, not a targeted attacker — exploits the unsupported reception PC, which sits on the same network as everything else, reaching the client file server, making seven years of tax records unavailable and possibly disclosed. Notice the harm names the asset, the property, and the scale." |
| 1:30 | Column "Likelihood (12 months)". Dropdown shows the five words. "Possible" selected. Justification typed: "Not internet-facing, but unpatchable, on a flat network, and used daily to browse and open attachments." | "Step two: likelihood, over the next twelve months — always state the period. It's not exposed to the internet directly, which pulls it down. But it can never be patched, it's on a flat network, and the receptionist browses and opens attachments on it every day. That's Possible. And the justification goes right next to the rating, in one sentence." |
| 2:15 | Column "Impact". "Major" selected. Justification typed: "Seven years of client tax records; confidentiality and availability both at stake; notification obligations likely." | "Impact, against the worst credible outcome — not the worst imaginable. Seven years of client tax records, confidentiality and availability both at stake, likely notification duties. Major. Not Severe: the firm would survive, painfully." |
| 2:50 | Matrix appears beside the sheet; cursor traces row "Possible" to column "Major"; cell "High" glows with a thick outline. | "Step three: read the matrix. Row Possible, column Major: High. Don't multiply numbers in your head — read the cell. The matrix is deliberately lopsided toward severe impact." |
| 3:15 | Four response cards: Reduce, Transfer, Avoid, Accept. | "Step four: choose one primary response. Reduce, transfer, avoid, or accept. The reflex is 'reduce' — add antivirus, add a firewall rule. Ask the first test from the lesson: does the control address the actual weakness? The weakness is that this machine can never be fixed while it exists." |
| 3:50 | "Avoid" card moves into the row. Action typed: "Replace the booking software so the PC can be retired. Interim reduce: remove the PC's access to the client share." Owner: "Office manager". | "So the primary response is Avoid: replace the appointment-booking software and retire the PC. That's the only answer that removes the weakness. While procurement happens, an interim Reduce: take away the PC's access to the client file share. Owner: the office manager. A control with no owner degrades into a note." |
| 4:40 | Residual columns. Interim residual: "Unlikely × Major = Medium". After retirement: note "risk removed with the asset". | "Step five: residual risk — of the same risk statement. With the interim measure, the chance that this PC becomes the path to the client files drops to Unlikely: it can still be compromised, and the network is still flat, but it no longer has access to the client share. If that path is still found, the harm is the same seven years of client records, so impact stays Major. Read the matrix: Medium. Once the PC is retired, this specific risk goes away with it. Avoidance is the one response that can genuinely do that." |
| 5:30 | Contrast slide: "Risk 1 (mailbox fraud): MFA moves likelihood only. Residual Unlikely × Major = Medium. Not Rare." | "Compare that with lesson 04's mailbox risk. MFA moves likelihood, not impact — and it doesn't take it to Rare, because prompts get approved by tired people and sessions get stolen. Most controls move one axis. Say which one." |
| 6:05 | Acceptance template on screen: "Accepted by [named person] on [date], because [reason]; review by [date]." | "Whatever residual is left, someone with authority accepts it, by name, with a date and a review date. That's not you. Your job is to make the decision possible and informed." |
| 6:30 | Recap list of five steps. | "Sentence. Likelihood with a reason. Impact with a reason. Read the matrix. One primary response, an owner, and an honest residual. Now do the same for Rowan Veterinary Group in your practice." |

## On-screen assets and B-roll
- Spreadsheet template with the lesson 04 columns and dropdowns (same columns as project cyb100-x02).
- Lesson 04 matrix rendered as a table with cell text labels.
- Four response cards.

## Accessibility
- Captions; every typed cell is read aloud verbatim.
- Matrix highlight uses a thick outline plus the spoken cell value, never colour alone; matrix cells carry text labels.
- Screen zoom at 150% minimum during typing; cursor highlighted.
- Transcript provided with the completed spreadsheet row.

## Check for understanding
1. Why is "We have an unpatched server" not a risk? *Answer: it is only a vulnerability; a risk needs an actor/event, weakness, asset, and harm.*
2. Rare × Severe gives what priority, and why? *Answer: High — the matrix keeps severe impacts high because the organization gets no second attempt.*
3. Why was Avoid the primary response for the reception PC? *Answer: the weakness (no vendor patches) cannot be fixed while the machine exists, so only removing the activity/asset addresses it.*
