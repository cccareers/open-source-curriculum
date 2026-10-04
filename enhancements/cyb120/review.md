---
course_id: cyb120
title: "Threat Analysis & Incident Response — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary
cyb120 is deep, practitioner-grade, and consistently defensive: every lesson ties back to one running case (IR-2026-0031, the macro-document intrusion on WKS-4471/WKS-2210) and teaches decisions rather than buttons. The biggest problem is that the running case does not hold together: dates, times, host roles, and IP addresses conflict across lessons 02, 03, 05, 06, and 08. That is a real issue in a course whose core message is timeline discipline, because learners who cross-check (as exercises tell them to) will find contradictions. This pass fixes the unambiguous ones and proposes a reconciliation for the rest. The biggest addition opportunity is learner-runnable practice data: lessons 03, 05, 06, and 09 all depend on "instructor-supplied" packages that do not yet exist in the repo.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb120-02 | "Practice", Exercise 4 | Refers to "the nine preparation questions"; the Phase 1 list has eight. | Change to "eight". | Applied |
| cyb120-03 | "A worked triage" | Narrative says "a download at 14:02 (A-103), a script interpreter spawning... at 14:02 (A-102)". The queue stamps A-103 at 14:03, and the lesson's own logs show the spawn (14:02:11) *before* the download (14:02:19). The "right order" given is the wrong order. | Reorder: spawn (A-102) then download (A-103), with the seconds from the raw logs. | Applied |
| cyb120-03 | Queue table and A-105 analysis | A-105 (benign designer upload) is on **WKS-2210**, but lessons 04–06 make WKS-2210 the *first infected finance host* (r.singh). Same host name, two incompatible identities. | Rename the designer's host in lesson 03 to WKS-3307. | Applied |
| cyb120-05 | "What a good record looks like from the outside" | WKS-2210 is given IP 10.14.6.19; lessons 03 and 06 tie 10.14.9.22 to WKS-2210 (svc_backup spray source). | Use 10.14.9.22. | Applied |
| cyb120-05 | Same section | Header has no date while entries at 09:41Z reference activity "from 14:03Z" and "from 13:51Z", which only makes sense if the record is from the next day. | Add "2026-03-11" to the header and date the referenced flows. | Applied |
| cyb120-08 | "Writing the containment decision" | Decision record dated "Proposed 10:14Z 2026-03-10" but says svc_backup authenticated "at 14:07Z yesterday". Date contradicts text. | Change to 2026-03-11. | Applied |
| cyb120-07 | "Dynamic analysis" behavior record | `T+0:45` (self-deletion) appears after `T+2:31`; a timeline lesson should not show an out-of-order record. | Move the line into chronological position. | Applied |
| cyb120-02, -05, -06, -08 | Containment/acquisition times | Response dates and containment times conflict with the March 10 upload. | Canonical next-day response: March 10 intrusion/upload; March 11 declaration 09:41Z, containment authorized 10:16Z, executed 10:18Z, confirmed 10:19Z, memory 14:31Z, disk 15:04–15:52Z. Align examples, evidence filenames and custody dates; retain March 10 network evidence. | Applied |
| cyb120-07 | "Triage" / "From analysis to indicators" | Delivered file is `invoice_march.pdf_` (a PE "disguised as PDF"), but the case's delivery was `Q1_reconciliation.docm` → `upd.ps1`. The behavioral description reconciles them (macro → script → executable), but the indicator table calls the PE the "delivered executable". | Proposed: relabel as "second-stage executable retrieved by the script" or state that the sample is a separate lure from the same campaign. | Proposed |
| cyb120-04 | "Indicators of compromise" | "JA3-style client fingerprints" is used without definition. | Proposed gloss: a hash of TLS client-hello parameters identifying client software. Also note JA4 has largely succeeded JA3 (verify before asserting). | Proposed |

## Depth and coverage gaps
- **No learner-runnable data** for log normalization, timeline building, and custody practice (objective: *Document an incident timeline and preserve evidence so that it survives later review*). Lessons 03 Ex. 5, 05 Ex. 1/3/5, 06 Ex. 4, and project 09 all say "your instructor supplies". Project x01 ships a small synthetic package plus a timeline checker.
- **Hashing/custody practice is described but not auto-checked** (objective: *Collect and analyze host and network artifacts without altering the evidence*). Project x02 adds a custody-continuity and hash-verification script.
- **Safe sample practice** (objective: *Analyze a suspicious file in an isolated lab environment and extract indicators to hunt with*): the lesson correctly requires instructor samples, but there is no zero-risk warm-up. x02 uses the EICAR anti-malware test file and synthetic artifacts, so learners can practice the static workflow (hash, true type, strings, password-protected archive, defanging) before handling real samples.
- **Misconception not addressed:** "a password reset ends a BEC incident". Lesson 08 covers session revocation well; a short contrasting worked example in lesson 02's Phase 3 would help (objective: *Choose containment, eradication, and recovery actions that stop an incident without destroying evidence or the business*).
- **Lesson 03 "Watching network traffic on purpose"** would benefit from a numeric worked example of interval variance for beaconing (mean/standard deviation of intervals) to support Exercise 3; x01 includes one.
- **Check your understanding** blocks are missing from all content lessons; added to 02–08.

## Proposed additional projects
- **x01 — IR-2026-0031 Timeline Rebuild with a Skewed Clock** (drafted, `projects/01-timeline-rebuild-skewed-clock.md`): synthetic multi-source logs (one local-time source, one host with +3 min skew) normalized into a tagged UTC timeline; Python checker validates format, sorting, sourcing, tags, and confidence on inferences, and asserts the skew was applied.
- **x02 — Evidence Locker: Custody and Safe-Sample Drill** (drafted, `projects/02-evidence-locker-custody-drill.md`): local, network-isolated container; acquire synthetic artifacts, hash, maintain custody CSV, and do static triage on the EICAR test file; a script verifies hashes and custody continuity.
- Beacon-finder notebook: compute interval statistics over a supplied flow CSV and rank pairs by regularity (supports lesson 03 Ex. 3). Not drafted.
- BEC tabletop with session-token revocation and MFA-method audit role cards (lesson 08). Not drafted.
- "Not established" writing drill: rewrite five over-confident report sentences into confirmed/assessed/unknown form (lesson 11). Not drafted.

## Video and animation opportunities
- **Triage in four questions** — cyb120-03 — modelling the fixed order (real → authorized → blast radius → what else) on the six-alert queue — screencast. **Drafted: `media/video-01-four-question-triage.md`.**
- **Hash at every hand-off** — cyb120-05/06 — chain of custody as a live demonstration of hashing, copying, verifying, and a one-byte change — screencast. **Drafted: `media/video-02-hash-at-every-handoff.md`.**
- **What disappears when you pull the plug** — cyb120-06 — order of volatility as layers evaporating on power-off vs. isolation — explainer animation. **Drafted: `media/animation-01-order-of-volatility.md`.**
- **Phase loop with handoff gates** — cyb120-02 — the lifecycle loop, including going backwards when a second host appears — animation. Not drafted.
- **Pyramid of pain** — cyb120-04 — indicators climbing from hash to TTP, with adversary cost rising — animation. Not drafted.

## Assessment ideas
- Disposition quiz: 10 short alert vignettes, choose false positive / benign true positive / suspicious-unresolved / incident (auto-gradable; lesson 03).
- Timeline tagging drill: 12 lines, tag OBS/INF/ACT/COM and spot the inference stated as fact.
- Custody-form defect hunt (lesson 05 Ex. 2) converted to a checklist rubric with the 8 expected defects listed for instructors.
- Rubric row for lesson 08 decision records: "Not doing" field present and reasoned; abort condition stated for any watch-instead-of-act option.

## Changes applied in this pass
- `lessons/02-the-incident-response-lifecycle.md`, "Practice" Ex. 4: "nine" → "eight" preparation questions.
- `lessons/02-the-incident-response-lifecycle.md`, end: added "Check your understanding".
- `lessons/03-detection-sources-logs-and-alert-triage.md`, "A worked triage": corrected the WKS-4471 cluster order and times (spawn 14:02:11, download 14:02:19).
- `lessons/03-detection-sources-logs-and-alert-triage.md`, queue table: A-105 host renamed WKS-2210 → WKS-3307 to avoid colliding with the infected finance host used in lessons 04–06.
- `lessons/03-detection-sources-logs-and-alert-triage.md`, end: added "Check your understanding".
- `lessons/04-threat-intelligence-and-indicators-of-compromise.md`, end: added "Check your understanding".
- `lessons/05-incident-documentation-and-chain-of-custody.md`, "What a good record looks like from the outside": dated the record 2026-03-11, dated the referenced flows 2026-03-10, and corrected WKS-2210's IP to 10.14.9.22.
- `lessons/05-incident-documentation-and-chain-of-custody.md`, end: added "Check your understanding".
- `lessons/06-digital-forensics-fundamentals.md`, end: added "Check your understanding".
- `lessons/07-malware-analysis-for-responders.md`, behavior record: moved `T+0:45` self-deletion line into chronological order.
- `lessons/07-malware-analysis-for-responders.md`, end: added "Check your understanding".
- `lessons/08-containment-eradication-and-recovery.md`, containment decision record: date 2026-03-10 → 2026-03-11 to match "yesterday".
- `lessons/08-containment-eradication-and-recovery.md`, end: added "Check your understanding".

## Open questions for the course owner
- **Case chronology reconciled.** The next-day response above preserves lesson 11’s next-day detection and lesson 08’s detailed decision record. Lesson 02’s simplified finance-clerk walkthrough is explicitly a separate case. Lesson 03’s A-104 is provisionally separate pending correlation; the video adds the host-IP mapping and merges it into IR-2026-0031.
- **JA3/JA4.** Confirm whether to mention JA4 (newer TLS fingerprinting) — not verified in this pass.
- **Lab tooling.** Lessons are vendor-neutral by design; x02 uses common Linux utilities (`sha256sum`, `file`, `strings`, `zip`). Confirm these are acceptable in the standard lab image.
- **EICAR handling.** Host antivirus will quarantine the EICAR file if it touches the host filesystem; x02 creates it only inside the container's own filesystem (not the host-mounted volume) and archives it before it reaches the host. Confirm the program's lab policy allows EICAR on learner machines.
