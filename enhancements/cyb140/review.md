---
course_id: cyb140
title: "Supervised Penetration Testing & Vulnerability Assessment — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary
cyb140 handles a sensitive subject well. Authorization comes before technique, the depth ceiling ("validate and demonstrate") is stated in every lesson, and the course ends on the defender's side, turning findings into control failures and prioritized remediation. The main gaps are reproducibility and currency. Every hands-on exercise depends on an unspecified "instructor-provided lab range", so a self-paced learner cannot practise. A few reference details are also dated (the OWASP Top 10 edition, the CVSS version), and one example mislabels its address range. This pass adds two runnable, locally isolated labs with a scope guard and evidence checkers, plus clarity and currency fixes.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb140-04 | "The most common junk artifact..." | Calls the example addresses "documentation addresses", but `10.10.10.0/24` is a private (RFC 1918) range, not a documentation range (RFC 5737). | Reworded to "placeholder lab addresses from a private range". | Applied |
| cyb140-04 | "How a vulnerability scanner reaches a conclusion" (CVSS) | Describes CVSS 3.1 metrics (scope, temporal) without naming the version. CVSS 4.0 (2023) changes both. | Added a version note. | Applied |
| cyb140-05 | "The taxonomy you will be asked about" | Says "the current edition" while listing the 2021 OWASP Top 10, which a newer edition has superseded. | Labelled the list as the 2021 edition and told learners to check which edition their client cites. | Applied |
| cyb140-02 / -07 | Scenario names | Lesson 02 uses ACME Logistics and lesson 07 uses Meridian Freight Systems. Both are logistics firms, and the switch is never explained. | Proposed: make lesson 02's fragment a prior Meridian engagement, or say the two are different clients. | Proposed |
| cyb140-03 | "Tooling, described honestly" | Names Metasploit and Kali; vendor neutrality is otherwise strong. | No change. The intake names these tools, and the treatment is accountability-focused. | — |

## Depth and coverage gaps
- **No self-contained lab** (objective: *Run an authorized vulnerability scan in a lab environment and separate true findings from false positives*). Project x01 provides a two-container target set on a Docker `--internal` network, a `preflight.py` scope guard that refuses public, unlisted, or excluded targets, and a verifier that checks every scan's XML against the scope and the approval log. All of it was tested end to end.
- **Validation practice has no designed false positives.** x01 supplies a six-candidate export with three constructed false positives (not reproduced, precondition absent, not reachable) and one unable-to-validate, matching lesson 07's R5 requirement.
- **Application evidence is not checkable** (objective: *Identify common web application vulnerability classes and describe the evidence that confirms each one*). x02 adds an OWASP Juice Shop lab and a `findings.json` checker for structure and redaction (JWTs, bearer tokens, cookies, passwords, card-like numbers).
- **Finding-to-control practice relies on the learner's own lab findings**, which vary (objective: *Translate a test finding into a control weakness and a prioritized remediation recommendation*). The animation and x02's memo provide a fixed worked set.
- **No "Check your understanding" blocks.** Added to lessons 02–06.

## Proposed additional projects
- **x01 Meridian Freight: A Scope-Guarded Scan and Validation Record** (drafted; `projects/01-meridian-scope-guarded-scan.md`). Tested with Docker 29: nginx target, nmap from a tools container, internet confirmed unreachable.
- **x02 Juice Shop Evidence Packets and the Finding-to-Control Memo** (drafted; `projects/02-juice-shop-evidence-and-controls.md`). The checker was tested against good and bad sample packets. The Juice Shop container itself was not launched in this pass.
- Deconfliction tabletop: a SOC analyst sees the tester's traffic, and the learner must resolve "is this you?" from their activity log within five minutes. Not drafted.
- Retest exercise: given a prior report and a "remediated" lab, produce remediated / partial / not-remediated determinations with fresh evidence (lesson 03, phase 7). Not drafted.

## Video and animation opportunities
- **Redline a scope** (cyb140-02): reading a scope line by line suits an annotated screencast. **Drafted: `media/video-01-redline-a-scope.md`.**
- **From scanner claim to finding** (cyb140-04): five-step validation of lab candidates, as a screencast. **Not drafted.** An attempt in this pass was interrupted and the partial file was removed; this should be re-scoped and drafted in a later pass.
- **Six findings, four causes** (cyb140-06): clustering findings onto systemic control failures, as an explainer animation. **Drafted: `media/animation-01-findings-to-systemic-causes.md`.**
- **Stop-condition flowchart** (cyb140-02): halt, record, preserve, notify, wait. A short animation. Not drafted.

## Assessment ideas
- Scope quiz: "May I send this packet?" items answered only from the rewritten ACME scope (used in video v01).
- Determination drill: 10 candidate rows, each to be assigned confirmed / false positive / unable to validate / out of scope, with the reason category.
- Failure-mode matching: findings mapped to absent / not applied / misconfigured / bypassed / unmonitored.
- Rubric line for lesson 07: "Recognized the planted stop condition and escalated instead of writing a finding."

## Changes applied in this pass
- `lessons/02-authorization-scope-and-rules-of-engagement.md`, end of lesson: added "Check your understanding".
- `lessons/03-the-assessment-methodology.md`, end of lesson: added "Check your understanding".
- `lessons/04-vulnerability-scanning-and-validating-findings.md`, opening section: corrected "documentation addresses" to private lab addresses.
- `lessons/04-vulnerability-scanning-and-validating-findings.md`, CVSS bullet: added a CVSS 3.1 vs 4.0 note.
- `lessons/04-vulnerability-scanning-and-validating-findings.md`, end of lesson: added "Check your understanding".
- `lessons/05-common-application-weaknesses.md`, "The taxonomy you will be asked about": labelled the list as the 2021 edition.
- `lessons/05-common-application-weaknesses.md`, end of lesson: added "Check your understanding".
- `lessons/06-reading-findings-as-a-defender.md`, end of lesson: added "Check your understanding".

## Open questions for the course owner
- **OWASP Top 10 edition.** Should lesson 05 move to the newer edition? Several categories were regrouped. I did not verify the final category list in this pass, so the lesson now names its edition instead of claiming to be current.
- **CVSS 4.0.** Should the course teach 4.0 metrics as primary? Scanner support varies by vendor.
- **Lab policy for Docker and Juice Shop.** Confirm learners may run Docker locally and pull `bkimminich/juice-shop` and `nginx:1.25-alpine`. Both projects need internet once, to pull images; after that they run on internal networks.
- **Legal references.** Lesson 02 summarizes the CFAA and international equivalents accurately at a general level. Consider whether to mention *Van Buren v. United States* (2021) on "exceeds authorized access". Not added, because legal framing should be reviewed by counsel.
- **Second video.** The missing cyb140 v02 script needs drafting in a later pass.
