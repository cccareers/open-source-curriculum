---
course_id: agile310
title: "Data Engineering Capstone Project — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary

A well-designed capstone. It teaches little that is new on purpose: it gives learners clear milestone briefs with testable definitions of done and governance criteria carried forward from ds320, and ends with a stakeholder delivery. The writing is direct and the "prove it, don't assert it" stance is consistent throughout. The main gaps are (1) no worked reference implementation or rehearsal path, so learners meet every hard property (idempotency, watermark ordering, missed-run alerting) for the first time on a metered cloud account, and (2) the stakeholder-presentation and handoff skills are described well but never practised with a model or rubric.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| agile310-03 | "Infrastructure as code" | Script uses `${PROJECT}` without checking it under `set -u`, so it fails with an unbound-variable error; `cloud` CLI is a placeholder but not labelled as one. | Added `PROJECT="${PROJECT:?set PROJECT}"` and a comment that `cloud` stands in for the provider CLI. | Applied |
| agile310-02 | "Making it concrete once" | The worked example's "Warehouse external tables" for staging conflicts with lesson 5's requirement that staging deduplicate and type data (an external table cannot deduplicate on its own; a view over it can). | Change "external tables" to "views over external tables" in the layer table. | Proposed |
| agile310-04 | "Requirements" item 3 | "Incremental ingestion with a watermark" for a bulk file drop is ambiguous: many file sources have no "changed since". | Add one sentence: for file drops, the watermark is the set of processed file names/checksums (a processed-files registry, as in de210-04). | Proposed |
| agile310-06 | "Requirements" item 4 | "Missed-run alert" placement is not stated; a check inside the same workflow cannot detect that the workflow never ran (de210-07 makes this point). | Add "the missed-run check must run independently of the workflow it monitors". | Proposed |
| agile310-08 | "Requirements" | Panel composition and grading rubric are described in prose but no scoring rubric is published to learners. | Publish the rubric used by the panel. | Proposed |

## Depth and coverage gaps

- **No rehearsal path before cloud spend.** Learners first exercise idempotency, watermark-after-write, and backfill on the metered account. A local dress rehearsal with tests reduces cost and failure. Drafted as x01. Objective: "Ingest source data into a landing zone reliably and repeatably".
- **No worked design document.** Lesson 2 gives the outline and a layer table; an annotated two-page example for the zone-cancellations question would set the bar. Partly covered in x01 milestone 1. Objective: "Scope an end-to-end pipeline against a stated business question and document the architecture".
- **Handoff and presentation lack models.** A sample one-page summary, a sample runbook entry, and a recorded model presentation would make lessons 7-8 concrete. Drafted as x02 (handoff evidence portfolio) and video-01/02. Objectives: "Collaborate through reviews, working agreements, and handoff documentation"; "Present the finished pipeline and its findings to a non-engineering audience".
- **Cost estimation** before building is asked for in review questions ("roughly what is it per run?") but no method is shown. A worked back-of-envelope (bytes scanned x price, storage per GB-month) would help, with prices left to the learner's provider and date. Objective: "Stand up a cloud data environment with sensible cost and access controls".

## Proposed additional projects

- **x01 Zone Cancellations Dress Rehearsal: Milestones 1-2 Locally, with Tests** (drafted) — lessons 02, 04, 05.
- **x02 The Silent Handoff: Runbook, Decision Records, and a Peer Takeover** (drafted) — lessons 06, 07; non-coding evidence portfolio with role-play and checklist.
- Design-doc review clinic: three seeded flawed design documents; learners apply the six critical questions and write blocking/non-blocking comments. Not drafted.
- Cost forecast exercise: estimate monthly cost from the design doc, compare to the actual cost report after Milestone 3, explain the gap. Not drafted.

## Video and animation opportunities

- **Lead with the answer** (agile310-08) — talking head with slide mock-ups. *Drafted: media/video-01-lead-with-the-answer.md.*
- **Reviewing a data pull request** (agile310-07) — screencast walking the seven review questions on a real diff with blocking/non-blocking comments. *Drafted: media/video-02-reviewing-a-data-pull-request.md.*
- **The run that never happened** (agile310-06) — explainer animation. *Drafted: media/animation-01-the-run-that-never-happened.md.*
- Least-privilege workload identities (agile310-03) — animation showing the transform identity denied on the landing prefix. Not drafted.
- Grain statement to primary-key test (agile310-05) — whiteboard. Not drafted.

## Assessment ideas

- Design-document rubric keyed to the nine sections and the six critical questions.
- Milestone review "evidence bingo": each definition-of-done item mapped to the artefact that proves it (query, run id, screenshot, log line).
- Presentation rubric: answer in first three minutes, numbers with scale, two volunteered caveats, real cost figure, one failure narrative, honest "I don't know".
- Silent-handoff score: number of questions the peer needed to ask (lower is better), with each question logged as a documentation defect.

## Changes applied in this pass

- `03-cloud-environment-setup-and-cost-aware-design.md`, "Infrastructure as code, and why week four cares": added `PROJECT` guard and a comment labelling `cloud` as a provider-CLI placeholder.

## Open questions for the course owner

- Which cloud provider does the program fix? The course is deliberately provider-neutral; a provider appendix (service names, CLI translations, budget setup path) would remove a recurring first-week blocker. UI paths should be verified at authoring time.
- Is a local rehearsal (x01) acceptable as preparation, given lesson 4 requires the graded run in the cloud account?
- What is the approved dataset list? The zone-cancellations example implies a taxi-trip dataset; confirm licence and that synthetic alternatives are available.
- Confirm `capstone-reference-architecture.png` exists in `img/`.
