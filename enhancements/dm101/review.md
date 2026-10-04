---
course_id: dm101
title: "Introduction to Digital Marketing — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary
dm101 is a strong survey course: concrete worked examples (the HVAC split plan, LedgerLoop positioning, Ridgeview Roofing email read, the tutoring-company report), a consistent voice, and a capstone that genuinely integrates copy, measurement, and compliance. The two arithmetic errors found (lesson 02 budget saving, lesson 03 word-count claim) were fixed. The biggest opportunity is more data-driven practice: learners read numbers in every lesson but rarely work from a raw dataset, so the supplementary projects supply CSV case files.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| dm101-02 | "Sizing a channel from the goal" | Saving from raising booking rate 6% to 8% stated as "roughly $4,300"; correct figure is $3,750 (gap falls from 1,600 to 975 sessions at $6). | Corrected arithmetic, showed both budgets. | Applied |
| dm101-03 | "A before-and-after" | Claims "word count dropped by roughly a third"; the original block is 34 words and the rewrite about 43. | Reworded: length roughly the same, every word now works, three claims checkable. | Applied |
| dm101-07 | "Tracing a conversion back through channels" | Linear row says "split evenly across all four" while the path shows six rows (newsletter signup and email click are both email). | Named the four channels. | Applied |
| dm101-07 | "Three practical points" / Tag your links | "Campaign parameters" described but never shown; the capstone requires a worked example URL. | Added a UTM example and a consistency warning. | Applied |
| dm101-04 | "Reading a results page" and "Organic search work versus paid search work" | The SERP element list is described twice in nearly the same words. | Propose trimming the second description to one sentence pointing back to "Reading a results page". Not applied (would delete text). | Proposed |
| dm101-05 | "Engaging" worked example | The poor reply cites "ASE-certified" mechanics, an automotive credential, at a bike shop. It works as a deliberately bad reply but may read as an author error. | Consider "certified mechanics" or add a note. | Proposed |
| dm101-06 | "A worked read of a campaign result" | "The click step had already capped the outcome near the target with no margin" is hard to parse. | Rephrase: "41 clicks meant even a perfect page could only just beat the target of 25 if most clickers booked." | Proposed |

## Depth and coverage gaps
- **Read a basic performance report** (lesson 07): every report is pre-aggregated. Learners need practice computing CPA and rates from raw rows and spotting a device split. Addressed by project dm101-x01.
- **Plan an organic social presence** (lesson 05): the presence plan has no data input. Learners should pick pillars from a post-performance export. Addressed by dm101-x02.
- **Design a basic email lifecycle sequence** (lesson 06): no worked example of what to do with someone who never opens the welcome series (sunset rule). Exit rules are mentioned in practice but not modelled.
- **Recognize signals of brand sentiment** (lesson 05): sentiment examples are all monthly. A week-level example would show how fast an event becomes visible.
- **Trace a conversion back through the channels** (lesson 07): holdouts are explained in one paragraph with no worked example. dm101-x01 includes a pause-test data set.
- **Apply data-privacy and advertising-policy requirements** (lesson 08): coverage is US federal plus California plus GDPR. Learners in other US states are told "other states have comparable laws" with no example; consider a one-row comparison with a second state after legal review.
- **Explain how search engines decide which pages to rank** (lesson 04): AI-generated answers on the results page are mentioned in one paragraph; worth a short example of a zero-click informational query.

## Proposed additional projects
- dm101-x01 Tutoring Company Measurement Case File (drafted): KPI sheet, report, four-model attribution worksheet, pause-test proposal from inline CSV data.
- dm101-x02 Half Step Coffee: 30-Day Content Calendar and Welcome Series (drafted): data-backed pillars, calendar sized to capacity, welcome series, reply playbook, consent memo.
- Ridgeview Roofing subject-line A/B write-up: given two subject variants and their results at low volume, write up why the test is inconclusive and what volume would be needed (lesson 03 and 06).
- Meridian Community Clinic compliance red-team: a deliberately flawed plan learners must audit against the pre-flight checklist (lesson 08).
- Bike shop sentiment week: a daily mention log with an injected event for learners to detect and brief on (lesson 05).

## Video and animation opportunities
- Find the leaking step (lessons 02, 07): whiteboard funnel walk-through; motion shows drop-off. **Draft: media/video-01-find-the-leaking-step.md**
- LedgerLoop copy teardown (lesson 03): screencast with track changes; seeing deletions in real time teaches the review pass. **Draft: media/video-02-ledgerloop-copy-teardown.md**
- One customer, five attribution models (lesson 07): explainer animation; credit visibly moving between channels fixes the "the tool knows the cause" misconception. **Draft: media/animation-01-one-customer-five-models.md**
- Crawl, index, rank (lesson 04): explainer animation of a page passing or failing each gate. Not drafted.
- Complaint reply in four moves (lesson 05): talking head plus on-screen reply drafting. Not drafted.
- Paid, earned, owned over 12 months (lesson 02): animated line chart of the HVAC Plan A versus Plan B. Not drafted.

## Assessment ideas
- Five-item intent sort (lesson 04) as an auto-graded quiz.
- "Which number is the KPI?" drag-and-drop: given a goal and ten metrics, sort into KPI / diagnostic / vanity (lesson 07).
- Copy rubric for the capstone section 4 with the competitor-name-swap test as a gate criterion.
- Compliance spot-the-problem: six short scenarios with a fixed answer key (lesson 08 Part 1 already provides the items; add the key for instructors).

## Changes applied in this pass
- dm101-02, "Sizing a channel from the goal": corrected the budget saving from about $4,300 to $3,750 and showed the working.
- dm101-03, "A before-and-after": corrected the word-count claim; clarified what actually improved.
- dm101-04, end of lesson: added "Check your understanding" (three items with answers).
- dm101-06, end of lesson: added "Check your understanding" (three items with answers).
- dm101-07, attribution table: named the four channels in the linear row.
- dm101-07, "Three practical points": added a worked UTM-tagged URL and a casing-consistency warning.

## Open questions for the course owner
- course.json description is still truncated ("customer engag"); the sequencing rationale flags this. Confirm the inferred scope.
- Lesson 08 privacy details (GDPR 72-hour breach notification, CPRA thresholds and under-16 opt-in, honoring browser opt-out preference signals, US commercial email rules) were accurate as of the reviewer's knowledge but change frequently; recommend an annual legal check. US state privacy laws have multiplied; the lesson's "other US states now have comparable laws" may need a date stamp.
- Lesson 08 "Special ad categories" lists housing, employment, and credit. Some platforms have renamed or expanded these categories (for example to broader financial products and services, and separate rules for social issue and political ads). Verify against current platform policy before the next cohort; not changed here.
- Lesson 06 open-rate caveat is correct in substance; consider naming the mail-client privacy features only if the owner wants vendor-specific content.
- Lesson 05 "Reaction mix" assumes platforms expose reaction types; availability varies and changes.
