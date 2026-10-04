---
course_id: agile210
media_id: agile210-v01
type: video-script
title: "Write a Brief That Can Fail"
format: talking-head
target_runtime: "6 min"
related_lessons:
  - agile210-02
objectives:
  - Scope a capstone around a real client problem and write a solution brief with measurable success criteria
competency_ids:
  - D4-S1-C01
  - D4-S1-C05
---

## Purpose
After watching, the learner can turn a soft stakeholder goal into a five-line success criterion (metric, baseline, target, method, owner) and write the sentence that would prove it not met.

## Audience and prerequisites
Capstone learners at the start of agile210-02, before the discovery conversation. Assumes ai210 discovery and requirements work.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Presenter to camera. Lower third: "agile210 · Stage 02: Scoping". | "Your capstone doesn't fail at hour thirty-eight when the demo goes badly. It fails at hour three, when you write a brief nobody could ever prove wrong. Let's fix that before you build anything." |
| 0:20 | On-screen text: "We want AI to reduce manual effort on invoices." | "Here's what our client, an office manager, said in the first conversation. It's a reasonable thing to want. It's also impossible to fail. Any build at all 'reduces manual effort'." |
| 0:45 | Text: "Walk me through the last time you did this." | "So you ask the question from this lesson: walk me through the last time you did this. And you write down the answer word for word." |
| 1:05 | B-roll: hands at a desk, PDF invoice, spreadsheet; captions of what she said: "open the email, download the PDF, retype supplier, number, date, total into the tracking sheet, check the total against the line items". | "She opens the email, downloads the PDF, retypes four fields into the tracking sheet, and checks the total. About forty invoices a week. And when you ask 'what makes one of these hard?', she says the scanned ones from two small suppliers, and statements that look like invoices." |
| 1:40 | Five-line block builds line by line: Metric: Median time from invoice arrival to it appearing in the tracking sheet / Baseline: 41 minutes (sample of 20 invoices, week of 3 March, timed by the office manager) / Target: Under 5 minutes for at least 80% of invoices / Method: Timestamp on arrival vs timestamp on the created row, over a 25-invoice test batch / Owner: Office manager confirms the sample is representative. | "Now turn the soft goal into a criterion. Metric: something two people would measure identically. Baseline: a real number, with its sample and its date. Target: a threshold with a percentage. Method: how you'll measure it, which forces you to build the timestamps in. Owner: who confirms it's fair." |
| 2:40 | Highlight "41 minutes (sample of 20 … week of 3 March)". | "The baseline is the line people skip. Without the sample and the date, 'we improved it' is an assertion. With them, it's evidence." |
| 3:00 | Text: "Not met if: fewer than 20 of the 25 test invoices appear in the sheet within 5 minutes of arrival." | "Then the test from this lesson: write the sentence that proves the criterion not met. If you can write it, the criterion is measurable. If you can't, it isn't." |
| 3:30 | Three more criteria appear as one-liners: quality (extraction accuracy above 90% on supplier, number, date, total against a 30-document labelled sample); coverage (at least 75% handled without escalation); usability (office manager runs it from the documentation without asking). | "Three to five criteria. Speed, quality, coverage, and where it applies, usability. Notice coverage: seventy-five percent handled cleanly with the rest cleanly escalated is a good design. A hundred percent handled badly is not." |
| 4:10 | Text: "Saves £40,000 a year" struck through → "per-invoice saving × weekly volume, shown as arithmetic". | "Watch for criteria you can't measure in forty hours. 'Saves forty thousand a year' isn't checkable here. Measure the per-invoice saving and show the arithmetic." |
| 4:35 | Three-column list: In scope (top eight suppliers, PDF attachments to accounts inbox) / Out of scope, deliberately (scanned photos and handwriting — route to manual) / Out of scope, for now (statements and credit notes). | "Then draw the boundary. Each out-of-scope item gets a reason, so it reads as a decision, not an oversight. And name the escape hatch: where the scanned invoices go." |
| 5:05 | Email mock: to office manager, subject "Where is this wrong?", sections 3, 4, 5 attached. | "Finally, send sections three, four, and five to the stakeholder with one question: where is this wrong? The corrections you get back are the whole value of the exercise. No corrections usually means it was too vague to disagree with." |
| 5:35 | Checklist card: real baseline with sample and date; threshold target; method you will instrument; a "not met" sentence; reasons on every out-of-scope line. | "That's a brief that can fail, which is exactly what makes it worth passing." |

## On-screen assets and B-roll
- Generic office B-roll (hands, invoices with redacted or invented supplier names, spreadsheet).
- Text builds for the criterion block (copied verbatim from agile210-02 "Writing measurable success criteria").
- Mock email with fictitious addresses.

## Accessibility
- Captions and transcript; all text builds are read aloud in full.
- Strikethrough is accompanied by narration ("struck out") and a replacement label, not shown by color only.
- High-contrast text cards, minimum 32 px at 1080p.

## Check for understanding
1. What two things must a baseline include besides the number? *Answer: the sample (size and what it was) and the date it was measured.*
2. Rewrite "the solution should be accurate" as a measurable criterion. *Answer (example): field-level extraction accuracy of at least 90% on supplier, number, date, and total against a 30-document labelled hold-out, scored in stage 07, sample confirmed by the office manager.*
3. Why does every out-of-scope item need a reason? *Answer: without one it reads as an oversight; with one it reads as a decision the stakeholder can agree or disagree with.*
