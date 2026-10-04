---
course_id: ds320
project_id: ds320-x02
title: "The Auditor's Request: A Deletion Evidence Pack for acme_retail"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ds320-03
  - ds320-05
  - ds320-06
objectives:
  - Map GDPR and CCPA obligations onto the data a pipeline actually holds
  - Apply encryption in transit and at rest, and manage the keys that make it meaningful
  - Produce lineage and audit evidence that answers a regulator's or auditor's question
competency_ids:
  - D5-S1-C02
  - D5-S1-C01
  - D5-S1-C03
---

## Scenario

Six weeks ago `acme_retail` (the lesson 7 asset) received a verified GDPR erasure request from an EU customer who is also on the vendor audience list. Today an external auditor emails the data owner:

> "For subject reference DSR-2026-0147, please show that personal data was erased or de-identified from every in-scope system by the date recorded, that it no longer reaches the advertising vendor, and how you would ensure it does not reappear after a backup restore. Please include your method so that we can re-perform it."

The data owner forwards it to you, the custodian, with one line: "Can you assemble the evidence? Privacy will sign the attestation." You will produce the evidence pack using lesson 6's four-section template (question, method, artifacts, attestation), run a role-play review with a peer playing the auditor, and record the gaps you find. This is evidence work, not legal judgement: questions about whether something satisfies the law are routed to privacy.

## What you will build / produce

- `evidence/DSR-2026-0147/pack.md` — question, method, artifacts, attestation, gaps.
- `evidence/DSR-2026-0147/queries.sql` — every query the method uses, runnable as-is.
- `evidence/DSR-2026-0147/artifacts/` — query outputs (CSV), configuration exports, log excerpts, each named and dated.
- `evidence/DSR-2026-0147/review-notes.md` — the auditor role-play: every question the "auditor" asked, your answer, and any follow-up action.
- `privacy/restore_replay.sql` — the job that re-applies `privacy.deletion_log` after a snapshot restore (lesson 3 calls this "the step teams forget").

## Before you start (prerequisites, starter files or data)

- The local PostgreSQL and schema from ds320-x01 (or your lesson 7 build), with `privacy.deletion_log`, `privacy.suppression_list`, and `lineage.run` / `lineage.edge`.
- **Seed the scenario** (synthetic only): pick `contact_id = 314` as DSR-2026-0147. Six weeks ago (relative to your run date) execute the erasure procedure and log it; add the subject to the suppression list with scope `sale_or_share`; emit a `lineage.run` row for the erasure job with `code_ref`, `executed_by`, and parameters.
- **Seed one deliberate gap**: leave one copy of the subject's email in a `debug.export_2026_08` table that is not in the data map. Your evidence process should find it.
- If you have a cloud KMS sandbox, add the key-usage evidence (key policy export and a `Decrypt` log excerpt); otherwise describe exactly which artifact you would export and mark it as a gap.

## Milestones

1. **Restate the question precisely.** Subject reference, systems in scope (from your data map), the claimed completion date, and the three sub-questions: erased everywhere in scope, no longer exported, restore-safe.
2. **Write the method before running it.** List each check as a query or command with the source it runs against: `privacy.deletion_log` rows; `lineage.run` for the erasure job; a post-deletion search across every table holding an identifier (generate this search from `governance.column_classification` where `data_category = 'direct_identifier'`, not from memory); the export view and the last three export files; the snapshot retention setting; `restore_replay.sql`.
3. **Run it and collect artifacts.** Save outputs with timestamps (UTC) and the principal that ran them.
4. **Find and state the gap.** The registry-driven search should find the `debug.export_2026_08` copy; the hand-written list from memory would not. Record the gap with breach, owner, remediation, date, and whether it changes the attestation.
5. **Write the restore replay.** A SQL job that, after a restore, re-applies every `deletion_log` entry newer than the snapshot time and records its own run in `lineage.run`. Test it by restoring a copy of the schema from a dump taken before the erasure.
6. **Role-play the review.** A peer plays the auditor for 20 minutes using the question bank below; you answer only from the pack. Log every question you could not answer from the pack and fix the pack.
7. **Route the legal questions.** At least three yes/no questions to privacy (for example: "Does retaining `raw.orders` rows with the subject's `contact_id` for seven-year tax purposes, with identifiers removed from `crm_contacts`, meet the erasure obligation for DSR-2026-0147?").

## Acceptance criteria

- [ ] `pack.md` has the four sections in order and fits in about four pages plus artifacts.
- [ ] Every claim in the pack points to a named artifact file; every artifact is produced by a query in `queries.sql`.
- [ ] The post-deletion search is generated from the classification registry, and its output is included.
- [ ] The seeded gap is found and recorded, with remediation and owner.
- [ ] `restore_replay.sql` is demonstrated: before replay the restored copy contains the subject; after replay it does not; a `lineage.run` row records the replay.
- [ ] A second person re-runs `queries.sql` and gets the same artifacts (note any differences and why).
- [ ] At least three yes/no questions are routed to privacy; no legal conclusion is asserted by the custodian.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Evidence checklist (an assessor ticks each against the submitted folder):

- [ ] Question restated with subject reference, systems, dates, and three sub-questions.
- [ ] Method lists who ran each query, when (UTC), against which source.
- [ ] `deletion_log` excerpt for the subject, with actor and completion timestamps for each system.
- [ ] `lineage.run` row(s) for the erasure job showing `status = succeeded`, `code_ref`, `executed_by`.
- [ ] Registry-driven identifier search output showing zero live matches after remediation (and the pre-remediation finding).
- [ ] Export proof: `exports.campaign_audience_v` returns zero rows for the subject; last three export files grep-clean for the subject's email hash.
- [ ] Snapshot retention configuration export showing the expiry window.
- [ ] Restore replay demonstration output (before/after counts) and its `lineage.run` row.
- [ ] Key evidence (policy export and usage log) or an explicit gap entry explaining its absence.
- [ ] Gaps section: each with breach, compensating control, owner, expiry/remediation date.
- [ ] Attestation block naming the reviewer role (privacy), date, and exactly what is asserted.
- [ ] Review notes from the auditor role-play, with follow-ups closed or tracked.

**Auditor question bank (for the role-play):**
1. How do you know the list of systems searched is complete?
2. Who could have modified `deletion_log` after the fact?
3. Show me the subject is absent from the file that went to the vendor last night.
4. What happens if you restore last month's snapshot tomorrow?
5. Your logs contain query text. Does the audit trail itself now hold this person's data?
6. Why is the order history still present?

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Question framing | Vague restatement | Precise subject, scope, dates, sub-questions | Scope derived from data map with version/date cited |
| Method reproducibility | Prose description | Every check is a committed query, re-run by a peer | Queries parameterised by subject reference and run date |
| Completeness | Hand-picked tables | Registry-driven search; seeded gap found | Adds a detective control so the gap class cannot recur |
| Restore safety | Not addressed | Replay job demonstrated with lineage record | Replay scheduled automatically after any restore |
| Honesty and routing | Claims perfection | Gaps stated with owners; legal questions routed | Attestation scope precisely limited to what the evidence shows |

## Stretch goals

- Turn the pack into a parameterised script that generates the folder for any subject reference.
- Add a tamper-evidence step: hash each artifact and record the hashes in an append-only table.

## Reflection prompts

- Which auditor question was hardest to answer from the pack alone, and what did you add?
- How would the pack change if crypto-shredding (lesson 5) had been the erasure mechanism for the landing zone?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners tend to search only the tables they remember; insist the search is generated from the registry, which is the point of lesson 4's machine-readable classification.
- Keep all data synthetic; the subject is fictional.
- The attestation is signed by the privacy role, not the custodian; marking the custodian as attester is a common error worth discussing.
- Short on time: skip the KMS evidence and the restore replay; keep the registry-driven search and the gap.
