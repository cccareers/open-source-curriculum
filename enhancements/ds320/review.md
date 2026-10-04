---
course_id: ds320
title: "Data Governance & Security — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary

A strong, engineer-facing governance course with a consistent running asset (`sales_ops`, growing into `acme_retail` for the project) and an excellent habit of turning every policy into a query, a configuration, or an evidence artifact. It is clear about its legal boundary. The main opportunities are (1) a few PostgreSQL specifics that will trip learners in the labs (pgaudit setup and what it can and cannot log, PostgreSQL 15 default-privilege changes, `sslmode=prefer`), and (2) automated verification: controls are demonstrated by hand, so a re-runnable test suite would make the "evidence" idea concrete and gradeable.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ds320-06 | "Audit trails: what to log" (pgaudit) | Comment says "every read and write" but the audit role only had `SELECT`, so writes were not audited; an unrelated `ALTER TABLE ... OWNER` line confused the pattern. | Grant select/insert/update/delete to the audit role; removed the owner line; added a sentence on why. | Applied |
| ds320-06 | Same section / practice item 3 | Practice asks for a pgaudit entry for a *denied* read, but denied statements never execute and are not logged by pgaudit; setup also needs `shared_preload_libraries` and a restart. | Added a paragraph on preload/restart and on where denied attempts are evidenced (server error log). | Applied |
| ds320-04 | "Implementing it: PostgreSQL" | Comment said new databases grant CREATE on `public` to PUBLIC; true only before PostgreSQL 15. | Version-qualified the comment. | Applied |
| ds320-05 | "Encryption in transit" | `sslmode` list omitted `allow`/`prefer`; `prefer` is the libpq default and silently falls back to plaintext. | Added a parenthetical. | Applied |
| ds320-04 | "Auditing what you granted" | `information_schema.role_table_grants` only shows grants involving currently enabled roles, so a monthly review run as a limited role under-reports. | Recommend running as a superuser or using `aclexplode(relacl)` from `pg_class`. | Proposed (verify exact visibility rules for the program's PostgreSQL version) |
| ds320-03 | "Building the capabilities" (erasure SQL) | `redacted_at` column is set but does not exist in the lesson's `raw.crm_contacts` schema. | Add `redacted_at timestamptz` to the schema listing or drop it from the example. | Proposed |
| ds320-03 | "CCPA: the same shape" | CCPA regulations and thresholds are amended periodically (e.g., CPPA rulemaking on automated decision-making and risk assessments). | Add a "check current regulations; dates as of writing" note and a review date. | Proposed |

## Depth and coverage gaps

- **No automated control verification.** Lessons 4-6 demonstrate controls manually. A pytest/SQL suite that asserts denied reads, forced RLS, suppression at the export edge, and erasure logging makes controls provable and doubles as the evidence pack's "method". Drafted as x01. Objective: "Classify a dataset and grant access according to least privilege".
- **Free-text columns** (`support_notes`, ticket `body`) are flagged as hard but no technique is shown (e.g., sampling-based PII scanning, restricting the column to a dedicated role). A short worked example would help. Objective: "Classify a dataset and grant access according to least privilege".
- **Restore re-application of the deletion log** is named as "the step teams forget" but never shown; a ten-line SQL job would close it. Objective: "Map GDPR and CCPA obligations onto the data a pipeline actually holds".
- **KMS practice requires a cloud account.** A local alternative (e.g., a local KMS emulator, or HashiCorp Vault's transit engine in dev mode) would let every learner do the envelope round trip. Flag as an option, not a requirement; verify the chosen tool's current licensing before recommending. Objective: "Apply encryption in transit and at rest, and manage the keys that make it meaningful".
- **Evidence-pack examples.** Lesson 6 gives the template; one fully worked pack (deletion proof) would set the quality bar. Drafted as project x02. Objective: "Produce lineage and audit evidence that answers a regulator's or auditor's question".

## Proposed additional projects

- **x01 sales_ops Least-Privilege and Suppression: Controls You Can Prove with Tests** (drafted) — lessons 03, 04, 06; local PostgreSQL + pytest.
- **x02 The Auditor's Request: Deletion Evidence Pack** (drafted) — lessons 03, 05, 06; role-play auditor request, lineage + deletion log + key evidence, graded evidence portfolio.
- Data-subject-request tabletop: three requests (GDPR access, CCPA delete, CCPA opt-out) with deadlines; teams produce runbooks and timing. Not drafted.
- Classification propagation lab with `lineage.edge` and a CI check that fails a PR introducing a Confidential-to-Internal edge. Not drafted.

## Video and animation opportunities

- **Encrypted is not verified: `require` vs `verify-full`** (ds320-05) — screencast. *Drafted: media/video-01-require-is-not-verify.md.*
- **One decision, five roles: walking the RACI** (ds320-02) — talking head + whiteboard. *Drafted: media/video-02-whose-decision-is-it.md.*
- **Envelope encryption and crypto-shredding** (ds320-05) — explainer animation. *Drafted: media/animation-01-envelope-encryption-and-crypto-shredding.md.*
- Classification propagating along lineage edges (ds320-04/06) — animation. Not drafted.
- Opt-out signal travelling to the vendor export (ds320-03) — animation showing where the suppression join must sit. Not drafted.

## Assessment ideas

- RACI sorting: ten decisions, learner assigns A/R/C/I across five roles.
- Data-map drill: given a schema, mark personal-data columns, category, and "deletable in place?".
- Policy → standard → control → evidence chain: learner writes all four for one policy line.
- Evidence-pack rubric: question precise, method reproducible (actual SQL), artifacts sufficient, gaps stated.

## Changes applied in this pass

- `04-classification-and-access-control.md`, "Implementing it: PostgreSQL": version-qualified the `public` schema default-privilege comment.
- `05-encryption-and-key-management.md`, "Encryption in transit": added `allow`/`prefer` note and why an unset `sslmode` is a finding.
- `06-data-lineage-and-audit-trails.md`, "Audit trails": audit role now granted all four DML privileges; removed the unrelated owner change; added pgaudit setup and denied-attempt evidence paragraph.

## Open questions for the course owner

- Which PostgreSQL version and which cloud provider are the reference for labs? Several details (default privileges, pgaudit availability on managed services, KMS deletion windows) depend on it.
- Is a local KMS substitute acceptable for learners without cloud access?
- Should regulation content carry a "last reviewed" date given ongoing CCPA/CPRA rulemaking and GDPR guidance updates?
- Confirm `governance-accountability-model.png` and `envelope-encryption.png` exist in `img/`.
