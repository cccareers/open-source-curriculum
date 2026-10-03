---
course_id: cyb100
title: "Introduction to Cybersecurity — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary
cyb100 is a strong, unusually precise introductory course: every lesson teaches a reusable routine (three-question control reading, six-step environment review, risk sentence plus matrix, task-to-tool-to-function mapping) and the practice is cumulative across Harlow & Finch, Rowan Veterinary Group, and Kestrel Property Management. The biggest opportunity is hands-on reinforcement: the course is deliberately paper-only, so learners never *see* a control fail (an untested backup, a RAID mirror of a deletion) or get automated feedback on whether their risk ratings are internally consistent. The two supplementary projects close both gaps without changing the course's defensive, conceptual scope.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb100-02 | "Practice" (Part 2) | The 30-person accounting firm is unnamed, yet the deliverable note says "lesson 03 works on the same firm" — learners do not know that firm is Harlow & Finch. | Name the firm in Part 2. | Applied |
| cyb100-04 | "Worked example" (Risk 1) | "Impossible-travel logins" used without definition; the term is not explained until lesson 05 (and only implicitly). | Add a one-clause gloss. | Applied |
| cyb100-05 | "Frameworks: the other half of the map" | CIS Controls described as "grouped by implementation tiers"; the CIS term is Implementation Groups (IG1–IG3). "Tiers" also collides with NIST CSF Implementation Tiers, a different concept. | Use the CIS term and add a caution about the collision. | Applied |
| cyb100-05 | "Whether the tool is any good: detection quality" | "Almost every well-known breach involved a tool that did alert" is an unsourced statistical claim. | Soften to "Many well-known breaches..." | Applied |
| cyb100-06 | "Requirements" R3 vs. "The client" | R3 asks learners to evaluate "the firewall in the internet router", but the client description never mentions a router or firewall. Learners following the "do not assert facts the description does not support" rule (Definition of done #9) are put in an impossible position. | Add the router to "Where it lives". | Applied |
| cyb100-02 | "Practice" Part 2 item 1 | 60-day password rotation is a deliberately weak control, but nothing tells the learner current guidance (NIST SP 800-63B) discourages forced periodic change; strong learners may rate it "adequate". | Proposed: add a hint in the instructor key rather than the lesson (keeps the discovery). | Proposed |
| cyb100-03 / -04 | Practice scenarios | Rowan takes "card payment details over the phone" — this is the natural hook for the lesson 04 avoidance example (payment links) but is not called out. | No change needed in lesson; covered by project x02 instructor notes. | Proposed |

## Depth and coverage gaps
- **No observable failure of a control** (objective: *Explain confidentiality, integrity, and availability, and use them to describe what a security control is protecting*). The RAID-is-not-a-backup and untested-restore failure modes are described but never demonstrated. Project x01 adds a safe, local container exercise that makes both visible.
- **No consistency feedback on risk ratings** (objective: *Rate a risk by likelihood and impact and choose a mitigation strategy for it*). Learners hand-read the 5×5 matrix; misreads are common and are graded manually. Project x02 ships a learner-runnable validator.
- **Missing misconception: "residual risk must be lower in both axes."** Lesson 04 shows MFA moving likelihood only; a short note that most controls move one axis would help. Covered in video v02 narration and project x02 rubric.
- **Lesson 05 lacks a worked example of a *false negative*** (the dangerous cell). The four-cell table is clear but every example is about alert volume. Suggested addition for a later pass: the Kestrel antivirus "green tick" as a false-negative case (objective: *Match a monitoring or response task to the right category of security tooling and to the framework function it serves*).
- **No self-check items** in content lessons; each ends with a long graded practice set. Short "Check your understanding" blocks were added to lessons 02–05.

## Proposed additional projects
- **x01 — Harlow & Finch: The Backup That Wasn't** (drafted, `projects/01-harlow-finch-backup-that-wasnt.md`): local-container lab demonstrating that a mirror is not a backup and that only a tested restore proves availability; includes a hash-based verification script.
- **x02 — Rowan Risk Register Validator** (drafted, `projects/02-rowan-risk-register-validator.md`): CSV risk register for Rowan Veterinary Group checked by a learner-runnable Python script for sentence form, matrix consistency, and treatment completeness.
- Kestrel tabletop: a 45-minute facilitated walk through the R7 bank-detail runbook with role cards (director, accounts clerk, IT contractor). Not drafted.
- "Would our stuff even catch that?" card sort: 30 task cards mapped to tool category and CSF function, done in pairs, with an answer key derived from lesson 05's table. Not drafted.
- Control-reading flashcards for the six control functions with Harlow & Finch examples. Not drafted.

## Video and animation opportunities
- **Reading a control in three questions** — cyb100-02 — the routine is the core skill and benefits from modelling out loud — talking head + whiteboard. **Drafted: `media/video-01-reading-a-control.md`.**
- **From finding to treatment: one Harlow & Finch risk end to end** — cyb100-04 — shows a risk sentence, two ratings, matrix lookup, inherent vs residual — screencast of a spreadsheet. **Drafted: `media/video-02-finding-to-treatment.md`.**
- **RAID mirrors your mistakes** — cyb100-02 — a deletion/encryption propagating instantly to both disks while an offline copy stays intact is invisible on paper — explainer animation. **Drafted: `media/animation-01-raid-is-not-a-backup.md`.**
- **Intrusion phases with defensive interrupts** — cyb100-03 — a timeline where each phase lights up a defensive opportunity — explainer animation. Not drafted (asset `intrusion-phases-defensive-opportunities.png` exists as a static base).
- **Inherent to residual on the 5×5** — cyb100-04 — a dot sliding across the matrix as each control is applied — short animation. Not drafted.

## Assessment ideas
- Five-item "which property broke?" quick check with deliberately two-property items (as in lesson 02 Part 1) for auto-grading.
- Matrix-reading drill: 10 likelihood/impact pairs, learner reads priority; auto-graded against the lesson 04 matrix (the validator in x02 contains the lookup table).
- Rubric row for R3 in the Kestrel project: "failure circumstance names a specific condition (who/when/what)" vs "generic"; already implied by Definition of done #3, worth making explicit in the instructor rubric.
- Task-to-function matching quiz drawn from lesson 05 Part 1 (20 items already exist; three "no tool" items make good distractor checks).

## Changes applied in this pass
- `lessons/02-security-principles-and-terminology.md`, "Practice": named the Part 2 firm as Harlow & Finch so the cross-reference to lesson 03 resolves.
- `lessons/02-security-principles-and-terminology.md`, end of lesson: added "Check your understanding" (3 questions with answers).
- `lessons/03-threats-vulnerabilities-and-attack-methods.md`, end of lesson: added "Check your understanding" (3 questions with answers).
- `lessons/04-risk-and-mitigation-basics.md`, "Worked example" Risk 1: defined impossible-travel alerting inline.
- `lessons/04-risk-and-mitigation-basics.md`, end of lesson: added "Check your understanding" (3 questions with answers).
- `lessons/05-security-tools-and-frameworks.md`, "Whether the tool is any good": softened unsourced "almost every well-known breach" claim.
- `lessons/05-security-tools-and-frameworks.md`, "Frameworks": corrected CIS "implementation tiers" to Implementation Groups (IG1–IG3) and flagged the NIST Tiers name collision.
- `lessons/05-security-tools-and-frameworks.md`, end of lesson: added "Check your understanding" (3 questions with answers).
- `lessons/06-project-baseline-security-review.md`, "The client" / "Where it lives": added the internet router with its built-in firewall so requirement R3 is answerable from the description.

## Open questions for the course owner
- **Locale.** The course uses £ amounts, "right-to-rent checks", and "first-floor office above a shop" (UK conventions), while the pathway describes an *indentured* (US Registered Apprenticeship) learner. Should scenarios be localized to US currency and US regulatory hooks (e.g., state breach-notification laws)? Not changed in this pass.
- **NIST CSF version.** Lesson 05 uses the six CSF 2.0 functions (Govern added in Feb 2024). Confirm the course standardizes on CSF 2.0 everywhere in the pathway (cyb150 should match).
- **Password-rotation item.** Should the instructor key state that forced periodic rotation is discouraged by NIST SP 800-63B (absent evidence of compromise)? Verify against the current 800-63B revision before publishing.
- **Kestrel R3 router.** The added router sentence states the firewall is "left at the provider's default settings"; confirm this matches the intended answer key.
- **Lab use in x01.** Lesson 06 says "nothing in this project requires a lab". x01 is a supplementary, optional local-container exercise; confirm the owner is happy for cyb100 to include an optional lab.
