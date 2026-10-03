---
course_id: cyb210
title: "Endpoint Security & Malware Defense — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary

cyb210 is technically strong, well sequenced, and unusually disciplined about lab safety; the worked examples (backup-agent tuning, the jrivera behavior chain, the eight-finding backlog, the header triage) are the best parts of the course. The biggest opportunity is **hands-on verification**: every Practice section asks for a written artifact, but none gives the learner a way to check their own lab state or configuration automatically. The two supplementary projects add that, and the media assets target the two concepts learners most often get wrong (SPF/DKIM "pass" as trust, and exclusion vs. suppression).

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb210-03 | "Stage 2: basic static" → Structure and entropy | "Entropy" used without definition or scale; learners cannot tell what "near the theoretical maximum" means. | Define Shannon entropy in bits/byte (0–8), say where code and text typically sit, and caution against a single cut-off. | Applied |
| cyb210-03 | "Worked example: reading a behavior chain" | Tells learners to decode `-enc` but not that the payload is UTF-16LE, so a plain base64 decode looks garbled. | Add the UTF-16LE detail and a lab-safe decode command. | Applied |
| cyb210-04 | "Vocabulary you have to use precisely" → CVSS | No mention that v3.1 and v4.0 coexist; learners will see different scores for the same CVE. | One sentence: same bands, different scores, record the version. | Applied |
| cyb210-02 | "Tuning: the actual craft" | "Benign rate" is used as a measured quantity but never given a unit. | Suggest stating it as alerts per endpoint per day (or per rule per day) in the tuning record. | Proposed |
| cyb210-05 | "DMARC" tag table | `pct=` is presented as permanent; the DMARCbis revision replaces it with a `t=` testing flag. | Add a footnote once DMARCbis is published as an RFC (see Open questions). | Proposed |
| cyb210-05 | "Worked example: triaging a reported message" | `dis=` is interpreted in the bullets but never defined in the tag table (it is a receiver result field, not a published tag). | Add one line: "`dis=` is the disposition the receiver actually applied." | Proposed |
| cyb210-06 | "Requirements" | R3 text is long; learners lose the order-of-volatility sequence. | Add a short numbered capture order (memory → network state → processes/sessions → temp files → disk) in R3 or in the Hints. | Proposed |

## Depth and coverage gaps

- **No self-check of lab state** (all four objectives). Practice sections end in documents; nothing lets learners verify that a rule fired, a tuned rule is silent, or a DNS record is valid. Addressed by projects x01 and x02 with acceptance scripts.
- **No "Check your understanding" blocks** in lessons 02–05. Added to all four (*Deploy and tune endpoint protection…*, *Classify a malware sample…*, *Prioritize a patch backlog…*, *Configure email authentication and filtering…*).
- **Patch prioritization is never computed** (objective: *Prioritize a patch backlog using severity, exposure, and business impact*). Learners rank by reasoning only; a small exercise joining a scanner CSV to the KEV catalogue and EPSS scores would make the four-input model concrete. Proposed as project x03 (not drafted).
- **Signature layer is never exercised** (objective 1). The EICAR test file is the standard, safe way to show signature detection and quarantine; added in x01.
- **Linux/macOS persistence is listed but never practised** (objective 2). Consider a benign "persistence diff" drill: learner creates a cron entry and a systemd user timer, enumerates before/after, and diffs.
- **Misconception not addressed**: that a DMARC pass means a message is safe. Display-name impersonation and compromised-partner mail both pass. Covered in v01 and x02 artifact #5.
- **MTA-STS / TLS-RPT** are named but not shown as records; a single example record would help (objective 4).

## Proposed additional projects

- **x01 — Harbor Ridge Detection Validation Lab** (drafted, `projects/01-detection-validation-lab.md`): Wazuh/Sysmon or auditd lab, EICAR + five benign triggers, rung-2 tuning, Python acceptance check over exported alerts.
- **x02 — Harbor Ridge Mail Authentication Lab** (drafted, `projects/02-mail-authentication-lab.md`): containerised authoritative DNS, SPF/DKIM/DMARC records, recursive SPF lookup counter and DMARC stage checker, synthetic evidence verdicts.
- **x03 — KEV/EPSS Backlog Scorer** (not drafted): learner joins a synthetic scanner export to the CISA KEV JSON feed and FIRST EPSS CSV, implements their lesson 04 matrix in Python, and an acceptance test asserts the two identical-CVSS findings land in a defensible order.
- **x04 — Persistence Diff Drill** (not drafted): benign persistence on Windows (Run key, scheduled task) and Linux (cron, systemd timer) in a lab VM; learner scripts the before/after enumeration and diff.
- **x05 — Northgate Tabletop Re-run** (not drafted): second scenario for the lesson 06 runbook (Linux server with no isolation capability) to test runbook generality.

## Video and animation opportunities

- **SPF/DKIM/DMARC header reading** — cyb210-05 — learners misread "pass"; screencast of real header. **Drafted: `media/video-01-spf-pass-is-not-trust.md`.**
- **Tuning without blind spots** — cyb210-02 — the verification search is invisible in prose; hybrid talking head + console demo. **Drafted: `media/video-02-tuning-without-blind-spots.md`.**
- **Mail alignment flow** — cyb210-05 — three domains and alignment are spatial; explainer animation. **Drafted: `media/animation-01-mail-alignment.md`.**
- **Behavior chain growth** — cyb210-03 — a process tree unfolding over time is exactly what motion shows well. **Drafted: `media/animation-02-behavior-chain.md`.**
- **Deployment rings and detect-only promotion** — cyb210-02 / -04 — whiteboard animation of ring waves and soak periods (not drafted).
- **Pyramid of Pain** — cyb210-03 — attacker cost rising per tier; short explainer (not drafted).
- **Isolation vs. power-off** — cyb210-06 — what evidence survives each; whiteboard (not drafted).

## Assessment ideas

- Ten-item header-reading quiz: each item an `Authentication-Results` line; learner states which domain each mechanism checked and whether DMARC passes.
- Tuning-record rubric (reuse x01 rubric row "Tuning quality") applied to lesson 02 Practice Part 4.
- Backlog-ranking oral defence: learner picks any two adjacent findings in their lesson 04 ranking and argues the order from the four inputs in under two minutes.
- Magic-byte flash cards (`MZ`, `7F 45 4C 46`, `50 4B 03 04`, `25 50 44 46`, `D0 CF 11 E0`).

## Changes applied in this pass

- `02-endpoint-protection-and-edr.md`, new "Check your understanding" (end): four questions with answers on exclusions, coverage math, benign-context true positives, suppression vs. exclusion.
- `03-malware-behavior-and-triage.md`, "Stage 2: basic static": defined Shannon entropy (0–8 bits/byte) and cautioned against single cut-offs.
- `03-malware-behavior-and-triage.md`, "Worked example: reading a behavior chain": added the UTF-16LE detail for `-EncodedCommand` and a lab-safe decode command.
- `03-malware-behavior-and-triage.md`, new "Check your understanding" (end): magic bytes, Pyramid of Pain ordering, packed-sample outcome, hash vs. upload.
- `04-patch-and-vulnerability-management.md`, "Vocabulary you have to use precisely": noted CVSS v3.1/v4.0 coexistence; record the version.
- `04-patch-and-vulnerability-management.md`, new "Check your understanding" (end): identical-CVSS separation, scan coverage, pending reboots, exception entry contents.
- `05-email-security-and-phishing-defense.md`, new "Check your understanding" (end): alignment, SPF lookup counting, `p=none`, post-click account actions.

## Open questions for the course owner

- **DMARCbis**: the IETF revision of DMARC removes `pct=` (replaced by `t=`) and changes how the organizational domain is found. Its RFC status should be checked before the next revision; the lesson currently teaches `pct=` as the rollout dial.
- **Wazuh field names** in x01's acceptance script and v02's sample rule follow the Wazuh JSON alert layout as I understand it (`rule.description`, `win.eventdata.*`); verify against the version you standardise on.
- **Sysmon signer fields**: v02 notes that signature fields appear on image-load events rather than process or file events; confirm against the current Sysmon schema before recording.
- **EICAR on hosts**: some institutional endpoint products block creating the EICAR file even inside VMs via shared clipboard; confirm the lab image works on managed school machines.
- Lesson 02 states Sysmon "produces almost exactly this set" including authentication events; Sysmon does not log logons (Windows Security log does). Consider rewording to "Sysmon plus the Windows Security log".
- Should x03 (KEV/EPSS scorer) be drafted? It would be the course's only coding exercise and depends on learners having Python.
