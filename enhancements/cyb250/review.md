---
course_id: cyb250
title: "Security Awareness and Social Engineering Defense — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

cyb250 is a mature, ethically careful course: the three-question recognition method, the non-punitive reporting design, and the simulation ethics constraints are excellent and should be preserved exactly. The biggest opportunity is **rehearsal and quantitative practice**: learners write about verification and metrics but never perform a verification under pressure or compute a metric from data. The two supplementary projects close those gaps (a role-play drill and a data-driven scorecard with an automated check). One technical misstatement about "alignment" in lesson 03 was corrected.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cyb250-03 | "Why it got through" → "Alignment passed on a domain the user cannot see" | Technically wrong: if SPF passes on a domain that differs from the visible From, alignment has *failed*, not passed. Contradicts cyb210-05. | Retitled to "Authentication passed…" and added two sentences on what DMARC alignment does and does not cover. | Applied |
| cyb250-05 | "Four levels, at working depth" | The model is unnamed, so learners cannot look it up. | Named it (Kirkpatrick model). | Applied |
| cyb250-03 | "An annotated artifact" | Uses "Priya Raman" as the impersonated Finance Director; cyb210-06 uses the same name for an accounts-payable victim. Cross-course name reuse may confuse learners taking both. | Rename one of them in a future revision. | Proposed |
| cyb250-03 | "An annotated artifact" | `X-Received-Domain-Age` is a fictional header; learners may search for it in real mail. | Add "(a fictional header standing in for your gateway's domain-age enrichment)". | Proposed |
| cyb250-04 | "Simulations, and the ethics…" | "In some jurisdictions employee monitoring and testing carries specific legal obligations" — correct but abstract. | Add one example per major jurisdiction class (e.g., works-council consultation, data-protection impact assessment) once verified by legal. | Proposed |
| cyb250-05 | "Measurement" → metrics table | "Denominator" used without the delivered/at-work rule until later in the section. | Move or repeat the denominator note next to the table. | Proposed |

## Depth and coverage gaps

- **No rehearsal of verification under pressure** (*Explain the psychological levers social engineers use and recognize them in a described interaction*). Practice is analysis of written scenarios only. Addressed by x01 (scripted role-play with observer sheet, peers only).
- **No computation of metrics** (*Deliver a short awareness session and choose metrics that show whether behavior actually changed*). Learners critique a dashboard but never compute report rate with a correct denominator. Addressed by x02 with synthetic data and a checker.
- **No Check your understanding blocks** in lessons 02–05. Added.
- **Inward-facing social engineering** (callers impersonating customers/tenants) is mentioned only in lesson 06's hints. A short worked example in lesson 03 would support *Analyze a suspicious message, decide what to do with it, and route it to the right people*.
- **Deepfake voice** is covered conceptually; a verification-phrase or call-back norm for executives' assistants would make it actionable (lesson 04 executive row).
- **Accessibility of delivered sessions** is required in lesson 04 but lesson 05's session plan template has no accessibility line; add one.

## Proposed additional projects

- **x01 — Merrow Fields Service Desk: Caller Verification Standard and Role-Play Drill** (drafted).
- **x02 — Merrow Fields Quarterly Scorecard From Raw Data** (drafted; generator and checker tested end to end in this pass).
- **x03 — Ardleigh Contact Centre Tenant-Verification Procedure** (not drafted): inward-facing social engineering; artifact is a call-flow and a verification question set that avoids publicly known data.
- **x04 — Report-Button Rollout Plan** (not drafted): configure the mail platform's report button in a test tenant, write the acknowledgement messages, and measure report latency with seeded test messages sent only to consenting lab accounts.
- **x05 — Champions Network Charter** (not drafted): one-page charter, recruitment message, and monthly intelligence-relay template.

## Video and animation opportunities

- **Three questions vs. red-flag lists** — cyb250-02 — reconstruction plus freeze-frame annotation makes levers visible; hybrid. **Drafted: `media/video-01-three-questions.md`.**
- **Fixing a click-rate dashboard** — cyb250-05 — denominators and difficulty are easy to show on a spreadsheet; screencast. **Drafted: `media/video-02-click-rate-lies.md`.**
- **BEC payment diversion timeline** — cyb250-03 — a two-week, three-party process with a shrinking recall window; explainer animation. **Drafted: `media/animation-01-bec-payment-diversion.md`.**
- **Report-to-purge race** — cyb250-03/05 — one report at minute 4 protecting 200 recipients; short explainer (not drafted).
- **Adversary-in-the-middle session capture** — cyb250-03 — why MFA does not stop token theft; animation (not drafted; coordinate with identity courses).
- **Handling "I clicked"** — cyb250-05 — talking-head modelling of the thank-first, facts-fast response (not drafted).

## Assessment ideas

- Lever-identification quiz: ten one-paragraph interactions; learner names every lever and the terminal action.
- "Why it got through" short-answer item graded on accuracy (no claim that authentication proves truthfulness) and tone (no blame).
- Policy-statement testability check: learner marks five statements testable/untestable and rewrites the untestable ones.
- Observer-sheet rubric from x01 reused as a practical sign-off for service desk apprentices.

## Changes applied in this pass

- `03-phishing-vishing-and-business-email-compromise.md`, "Why it got through": corrected "Alignment passed" to "Authentication passed" and explained what DMARC alignment does and does not cover.
- `03-phishing-vishing-and-business-email-compromise.md`, new "Check your understanding" (end): AiTM exposure, lookalike explanation, scope, payment routing.
- `05-delivering-training-and-measuring-behavior-change.md`, "Measurement" → "Four levels": named the Kirkpatrick model.
- `05-delivering-training-and-measuring-behavior-change.md`, new "Check your understanding" (end): difficulty normalisation, clicker report rate, practice segment, leading vs. lagging.
- `02-how-social-engineering-works.md`, new "Check your understanding" (end): commitment sequence, grammar tells, in-message numbers, witness-not-suspect.
- `04-building-an-awareness-program.md`, new "Check your understanding" (end): deskless delivery, testable policy, lure ethics, reporting procedure priority.

## Open questions for the course owner

- Confirm whether naming the Kirkpatrick model is wanted (the lesson may have avoided names deliberately).
- Cross-course name collision ("Priya Raman" in cyb210-06 and cyb250-03): which should change?
- x01 role-play: confirm the institution's policy on recording peer role-plays before suggesting recordings.
- Lesson 04 legal points on employee monitoring vary by jurisdiction; the lesson rightly avoids specifics, but the course owner may want a jurisdiction-specific instructor note.
- Statistics: the course avoids industry loss figures, which I recommend keeping; I did not add any.
