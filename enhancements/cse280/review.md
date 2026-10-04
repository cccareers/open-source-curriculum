---
course_id: cse280
title: "Cloud Compliance & Governance — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary
A mature, practitioner-grade course. One running scenario (the patient appointment reminder service) carries from the responsibility split through mapping, identity, data protection, audit, DR, backup, documentation, and training, and the course is disciplined about hedging legal facts and routing determinations to counsel. The biggest opportunity is **hands-on evidence generation**: almost every artifact is written by hand from a described inventory, so learners rarely see a dated export, a hash, a verified restore, or a mechanical control test actually run. Two tested, zero-cost projects close that gap. A few technical inaccuracies (invalid YAML, the credential report's blind spot for federated users) were fixed in place.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cse280-09 | "Designing the backup policy" YAML | `backup_policy: appointments-db` followed by indented keys is invalid YAML (a scalar cannot have children). | `backup_policy:` with `name: appointments-db` as the first child. | Applied |
| cse280-07 | "Gathering evidence" — credential report | Described as listing "every user"; it lists IAM users and root only, so in a federated account (which lesson 05 recommends) the human population is missing. | Clarified scope and the need to pair it with role-assignment and identity-provider exports. | Applied |
| cse280-10 | RUN-12 step 1 | Same blind spot inside the auditor-facing runbook; "if the report is stale, wait 4 hours" misdescribes the 4-hour regeneration limit. | Corrected expected output, regeneration note, and added a NOTE on federated identities. | Applied |
| cse280-04 | "The mapping row" export command | `Values=vpc-prod` is not a valid VPC ID format; learners may copy it. | Replace with `vpc-0123456789abcdef0` and a comment "your production VPC ID". | Proposed |
| cse280-06 | Classification tag example | `primary-region: eu-west-1` for a scenario framed mainly around HIPAA (US); not wrong, but invites "why Europe?" | Either keep and note the service has EU customers, or use a neutral placeholder. | Proposed |
| cse280-05 | "Guardrails and grants" — Azure bullet | "Role assignment restrictions" is vague; the closer mechanisms are Azure Policy deny effects and deny assignments (via blueprints/deployment stacks). | Verify current Azure terminology and tighten. | Proposed |

## Depth and coverage gaps
- **Running a mechanical control test** ("Map a written compliance requirement to a specific, testable cloud control"; "Conduct a periodic security audit and drive its findings to remediation"). Lesson 04 says steps 2–4 of the NET-02 test "are things a script can assert" but never shows the script. Drafted as project x01 (tested: 7/7).
- **A real restore with honest measurement** ("Implement and verify backup and restoration procedures"). Lesson 09's main artifact asks for a real restore "using whatever you have"; learners without an account improvise. Drafted as project x02 with a Docker drill (executed end to end during authoring: 8/8 verification checks).
- **Evidence integrity** ("Write policy, runbook, and evidence documentation an auditor can follow"). Lesson 10 lists tamper-resistance properties but not hashing; adding a SHA-256 column to the evidence index is a small, concrete improvement (used in x01).
- **Key-unreachable backup failure** ("Implement and verify backup and restoration procedures"). Lesson 09 states the principle; x02 milestone 3a makes learners watch it happen.
- **Training effectiveness measurement** ("Deliver a compliance training session to a technical or non-technical audience"). Lesson 11 covers coverage and check-for-understanding; a 30-day follow-up behaviour check (e.g. sample tickets for redaction) would show whether behaviour moved. Not drafted.
- **Check your understanding** blocks were added to lessons 03 and 08; lessons 02, 04, 06 and 07 would benefit from the same.

## Proposed additional projects
- **x01 — Evidence as Code: Automated Control Checks with an Auditor-Ready Trail** (drafted, tested).
- **x02 — Restore Drill in a Box: Timed, Verified, and Honestly Recorded** (drafted, tested).
- Questionnaire answer library: 40 real-shaped questionnaire items, learners build consistent answers and a routing column (lesson 03).
- Access review simulation with a generated 200-row inventory containing planted mover gaps and orphaned machine identities (lesson 05).
- DR tabletop kit: scenario cards with injects (SMS allow-list, DNS access holder on leave) and a scoring sheet (lesson 08).

## Video and animation opportunities
- **"Are you HIPAA compliant?"** — lessons 02–03; talking head; tone and wording are the skill. *Drafted: media/video-01-are-you-hipaa-compliant.md.*
- **Writing a finding that survives pushback** — lesson 07; screencast. *Drafted: media/video-02-writing-a-finding.md.*
- **RTO, RPO, and why replication is not backup** — lessons 08–09; explainer animation. *Drafted: media/animation-01-rto-rpo-timeline.md.*
- **Envelope encryption and key custody** — lesson 06; explainer animation. *Drafted: media/animation-02-envelope-encryption.md.*
- The governance loop (define → implement → monitor → evidence → assess → remediate) — lesson 02; short whiteboard; not drafted.
- Privilege creep over five years of role changes — lesson 05; animation; not drafted.

## Assessment ideas
- "Mine or route?" sorting quiz with 20 customer questions and model replies.
- Falsifiability drill: ten control statements; learners mark which can be false and rewrite the rest.
- Evidence rejection set: lesson 10 exercise 4 extended to 10 items with a scoring key.
- Restore record audit: give a record with three hidden overclaims (RPO claimed, self-verified, no deviations) for learners to find.

## Changes applied in this pass
- `09-backup-and-restoration-procedures.md`, "Designing the backup policy": fixed invalid YAML.
- `07-conducting-a-security-audit.md`, "Gathering evidence": credential report scope and federated-identity blind spot.
- `10-policy-runbooks-and-audit-evidence.md`, RUN-12 step 1: corrected expected output, regeneration behaviour, and federated-identity note.
- `03-the-framework-landscape.md`: appended "Check your understanding".
- `08-high-availability-and-disaster-recovery.md`: appended "Check your understanding".

## Open questions for the course owner
- **Unverified / to confirm with compliance or counsel before publishing**: no framework identifiers, notification windows, retention periods, or penalty figures were added anywhere in these enhancements, by design. Confirm the Azure guardrail terminology in lesson 05 and the exact AWS credential-report regeneration interval (stated in the edit as "at most once every 4 hours", per current AWS documentation as understood; verify).
- x02 uses `openssl enc` with a local key file to stand in for a cross-account KMS key. Acceptable as a teaching stand-in, or would you prefer the drill target a cloud free tier with real KMS for the "key unreachable" milestone?
- x01's bucket export is a simplified, flattened shape (real data comes from several API calls). Keep the simplification, or supply a real multi-call collector script?
