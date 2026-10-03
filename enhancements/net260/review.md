---
course_id: net260
title: "Cloud and Application Security — Enhancement Review"
reviewed_lessons: 12
status: draft
---

## Summary

net260 is a strong capstone. The clinic running example, artifact formats, and authorization discipline carry through every lesson, so each lesson builds on the last. The biggest opportunity is that **almost every hands-on exercise needs a cloud account**. Learners without one, or institutions that cannot provision sandboxes, currently have no way to practise the audit and pipeline skills. The two supplementary projects can be done fully offline or locally, each with a tested automated check. I also corrected two technical points: a garbled access row in lesson 04's reachability table, and Rego syntax and scope in lesson 09.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| net260-04 | "1. Draw the tiers and decide reachability" | The admin row was garbled ("via bastion or SSM/Bastion/IAP") and listed port 22, which contradicts section 5's "agent-based: no inbound rule at all". | Reworded the row and added a footnote that agent-based session services need no inbound rule. | Applied |
| net260-09 | "Infrastructure-as-code scanning" (Rego rule) | The rule checks only that *an* encryption configuration exists, yet the text says it enforces the PHI key. It also uses pre-1.0 Rego syntax, which OPA 1.0+ rejects by default. | Added two sentences on both points. | Applied |
| net260-09 | "Static analysis — your own code" | `semgrep ci --config auto --baseline-commit` may not be valid for `semgrep ci`, which normally pulls rules from the Semgrep platform; `--baseline-commit` is documented for `semgrep scan`. | Verify and switch to `semgrep scan --config auto --baseline-commit ... --error` if needed. | Proposed |
| net260-07 | "Detections worth writing" | `root-or-global-admin-used` mixes AWS (`userIdentity.type == Root`) and Azure (`GlobalAdministrator`) terms in one match without saying so. | Add a comment that the rule is pseudo-code spanning providers. | Proposed |
| net260-03 | "Conditions: the part everyone skips" | The example grant expires via `aws:CurrentTime`. Learners may think this deletes the grant; it only stops matching. | Add "(the statement remains; review still required)". | Proposed |
| net260-02 | "Why this matters to an incident" | The incident note says "Object ACLs allow public read". Newer AWS buckets disable ACLs by default (Object Ownership), so learners may not be able to reproduce this in a lab. | Add a lab note, or use a bucket policy instead. | Proposed |

## Depth and coverage gaps

- **No offline or no-account path.** Most Practice sections need a lab cloud account. Addressed by x01 (an offline IAM export audit, covering *Apply least-privilege identity and access policy to a cloud account and detect over-permissive grants*) and x02 (a local container gate harness, covering *Insert automated security checks into a delivery pipeline at the stage where each is effective* and *Harden cloud compute and container workloads against the misconfigurations that cause most cloud incidents*).
- **No Check your understanding blocks** in lessons 02–10. Added to all nine.
- **Escalation-path detection is described but never automated.** x01 encodes lesson 03's table and tests it, including the PassRole case.
- **"Prove the gate fails" is a one-time manual exercise** (lesson 09 Exercise 3; project 12 D2). x02 turns it into a regression harness that was run end to end in this pass.
- **Log analysis has no provided dataset in the lessons.** Lesson 07 Exercises 4–5 depend on an instructor export. A synthetic 30-day CloudTrail-shaped dataset seeded with the lesson 07 sequence would support *Detect unauthorized access in cloud audit logs and route the signal to a responder*. Proposed as x03.
- **Azure and Google Cloud are named, but every worked example is AWS-shaped.** At least one alternate worked example per lesson (for instance, lesson 03's audit as Azure role assignments with scope) would back up the "provider-neutral" claim.
- **Misconception not addressed directly:** "a private interconnect is encrypted". This is stated in lesson 04, and is worth adding to the lesson 05 check or the assessment items.

## Proposed additional projects

- **x01 — clinic-prod Access Audit, Offline** (drafted). Synthetic export, learner-written checker, and a 7-test pytest suite, verified against a reference solution.
- **x02 — clinic-app Gate Harness: Prove Every Pipeline Gate Fails, Automatically** (drafted). gitleaks, trivy, checkov, and an image-user check. Ran end to end in this pass (`ALL GATES PROVEN`, 20/20).
- **x03 — Synthetic CloudTrail Week** (not drafted). A seeded JSON-lines log with the lesson 07 attack sequence hidden among routine calls. The learner writes three tiered detections, and tests assert hits and false-positive counts.
- **x04 — LocalStack or OpenTofu Drift Drill** (not drafted). Apply a declaration to a local emulator, change it out of band, and detect and triage the drift with `plan -detailed-exitcode`.
- **x05 — OWASP Juice Shop, Local, Two-Account IDOR Hunt** (not drafted). Run locally only, seed two accounts, and write findings in the lesson 08 format.

## Video and animation opportunities

- **Reading a control-plane record** (net260-07; screencast). **Drafted: `media/video-01-reading-a-cloudtrail-record.md`.**
- **SSRF to metadata, with severity changed by IMDSv2 and role scope** (net260-06/08; hybrid). **Drafted: `media/video-02-ssrf-to-metadata.md`.**
- **IAM evaluation: implicit deny, explicit deny, allow, and scope** (net260-03; explainer animation). **Drafted: `media/animation-01-iam-policy-evaluation.md`.**
- **Pipeline gates vs. detectors, and promotion by digest** (net260-09/10; explainer animation). **Drafted: `media/animation-02-pipeline-gates.md`.**
- **Shared responsibility stack sliding across IaaS, PaaS, and SaaS** (net260-02; animation). Not drafted.
- **Envelope encryption and crypto-shredding** (net260-05; animation in which one key deletion makes every copy unreadable). Not drafted.
- **Public vs. private subnet decided by the route table** (net260-04; whiteboard). Not drafted.

## Assessment ideas

- Responsibility-assignment items: six incidents, each answered with the layer, provider or customer, and the preventing control (as in lesson 02 Exercise 3).
- Escalation-path spotting: give learners policy snippets and ask "which principals are effectively admin?" These can be auto-graded with the x01 checker.
- Requirement-to-key-tier matching, graded on the "deciding phrase" (lesson 05).
- Log-record triage: six records judged benign, suspicious, or malicious, naming the deciding field (lesson 07).
- Check-placement drag-and-drop (animation a02 interaction variant).

## Changes applied in this pass

- `04-securing-cloud-networks.md`, "1. Draw the tiers and decide reachability": fixed the garbled admin-access row and footnoted that agent-based sessions need no inbound rule.
- `09-devsecops-security-in-the-pipeline.md`, "Infrastructure-as-code scanning": added notes on the Rego rule's limited check (encryption present vs. PHI key) and on OPA 1.0 syntax.
- New "Check your understanding" blocks at the end of `02-cloud-shared-responsibility.md`, `03-cloud-identity-and-access-management.md`, `04-securing-cloud-networks.md`, `05-data-protection-and-encryption-in-the-cloud.md`, `06-workload-and-container-hardening.md`, `07-cloud-logging-and-monitoring.md`, `08-application-security-assessment.md`, `09-devsecops-security-in-the-pipeline.md`, and `10-secure-deployment-and-configuration-management.md` (3–4 questions each, with answers).

## Open questions for the course owner

- **Semgrep CLI:** confirm whether `semgrep ci --config auto --baseline-commit` is valid for the version you teach, or switch the example to `semgrep scan`.
- **OPA version:** which version do learners pin? The lesson's Rego should match it; I added a note rather than rewriting the rule.
- **Gitleaks subcommands:** x02 uses `detect --no-git`, which worked with the image current on 2026-10-02. Newer releases also offer `dir` and `git`, so confirm which your pinned version expects.
- **checkov check IDs** `CKV_AWS_24` and `CKV_AWS_25` worked in this pass. Re-confirm per cohort.
- **AWS CLI and console paths** in v02 (`modify-instance-metadata-options`, the 401 wording) and v01 (log query UI) should be checked against current documentation before recording.
- **Bucket ACLs:** should the lesson 02 incident be reworded for buckets created with ACLs disabled by default?
- Is a sandbox cloud account guaranteed for every learner? If not, should x01, x02, and the proposed x03 become required alternatives for lessons 03, 07, and 09?
