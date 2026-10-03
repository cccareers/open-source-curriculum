---
course_id: ai350
title: "AI Security & Compliance — Enhancement Review"
reviewed_lessons: 7
status: draft
---

## Summary
ai350 is one of the strongest courses in the pathway: every lesson is concrete, practitioner-scoped ("not a lawyer, not a security engineer"), and ends in a practice that produces a real artifact. The running example (a support-triage automation, order 8842, invoice 4471, a retail company with customers in California and Germany) threads cleanly through all six content lessons. The biggest opportunities are (1) runnable, code-level practice for the controls the lessons describe in prose, (2) quick self-checks at the end of each lesson, and (3) an explicit, owner-maintained register of legally time-sensitive statements so the privacy and policy lessons do not silently age.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ai350-05 | "Principles that translate into actions" (Reliability) | Says monitoring is built "in the next lesson"; monitoring is ai350-07, two lessons later (ai350-06 is policy). | Changed to "in the final lesson of this course". | Applied |
| ai350-05 | "Reading results honestly" | Says the decision rule was written "in step 1"; in the procedure, step 1 is the fairness claim and the rule is set in step 5 ("Set the rule before you look"). | Reworded to "writing the decision rule before you looked at the results". | Applied |
| ai350-06 | "Decision rights: the core of the document" | Example table puts "Issue a refund under $50" at Medium although the tier criteria place anything that "affects money" at High. Learners will notice the contradiction and not know which wins. | Added a short note explaining that the table records a deliberate, documented downgrade for a small, favourable, reversible outcome, and that adverse money decisions never downgrade. | Applied |
| ai350-07 | "A monitoring rule set" (M08) | "Groundedness score" is used without definition. | Defined inline in the M03/M08 note paragraph. | Applied |
| ai350-03 | "Third-party model exposure" | "DPA" appears in the data-class table after only the long form was used. | Minor; long form appears two lines earlier in Q6. Left as is. | Proposed (optional) |
| ai350-02 | "Mitigating this specific example", item 4 | "measurably reduces success rates" is an empirical claim with no source. | Either cite a source or soften to "tends to reduce". Owner decision. | Proposed |
| ai350-02..07 | End of lesson | No self-check before the (long) practice section. | Added a short "Check your understanding" block to each lesson. | Applied |

## Depth and coverage gaps
- **Code-level controls are described, never implemented** (objective: "Apply data-security practices to an AI workflow, covering secrets, least privilege, logging, and third-party model exposure"). The redaction table (R1–R7) and the "workflow computes the recipient" pattern are ideal for a small, testable code exercise. Drafted as project ai350-x01.
- **Layer-1 monitoring rules are tabulated but not exercised** (objective: "Monitor AI-generated content for misinformation and compliance risk and respond when monitoring fires"). M01/M02/M03/M05 are deterministic and easy to test. Drafted as project ai350-x02.
- **Injection payload variety** (ai350-02): the lesson lists obfuscation techniques (base64, white text, alt text, spreadsheet cells) but the worked example only shows plain text. A short appendix of three payload variants for the practice step would deepen it without new objectives.
- **Indirect injection through retrieval** (ai350-02): the worked example is email-borne; a second short case where the payload sits in an indexed knowledge-base article would connect to the ai350-07 stale-corpus incident.
- **Pseudonymisation worked example** (ai350-04): the pattern is described in one paragraph; a before/after prompt and the token-mapping table would make it concrete.
- **Proxy variables** (ai350-05): mentioned in one sentence; a worked example (postcode as proxy) with a paired-corpus variant would help learners test for it.
- **Reviewer-overload math** (ai350-06): the lesson gives the 200 x 90s example; a practice item asking learners to compute capacity for their own queue would reinforce it.
- **Misconception to address explicitly** (ai350-04): "pseudonymised = anonymised". The lesson states it correctly; a check-your-understanding item now targets it.

## Proposed additional projects
- **ai350-x01 Lock Down the Support-Triage Workflow** (drafted) — output validation, workflow-computed recipient, injection hold, log redaction; pytest acceptance suite.
- **ai350-x02 Layer-1 Monitor and Response Runbook for the Triage Assistant** (drafted) — implement M01/M02/M03/M05/M07, decision tiers, escape rate, and a rehearsed S2 runbook; pytest acceptance suite.
- Fairness harness (not drafted): script that expands a paired corpus (name, dialect axes) into runs, records model version, and tabulates the results table from ai350-05.
- Deletion drill (not drafted): case file for the retail example with seven stores, a learner walks the runbook and files a timed evidence log (ai350-04).
- Policy red-team (not drafted): learners swap draft policies from ai350-06 and try to find a decision the policy fails to tier.

## Video and animation opportunities
- **Indirect injection, worked end to end** — ai350-02 — seeing the email arrive, the prompt assemble, and the cc appear is far more convincing than reading it — hybrid screencast. **Drafted: media/video-01-indirect-injection-worked.md**
- **The paired-prompt bias test in one afternoon** — ai350-05 — learners struggle with "vary one axis at a time"; watching the corpus and table being built fixes it — screencast. **Drafted: media/video-02-paired-prompt-bias-test.md**
- **One channel: how data becomes instruction** — ai350-02 — invisible concept (instruction/data separation collapsing) — explainer animation. **Drafted: media/animation-01-one-channel.md**
- **The stale-corpus incident** — ai350-07 — a timeline of detection lag, triage escalation S2 to S1, and root cause outside the model — explainer animation. **Drafted: media/animation-02-stale-corpus-incident.md**
- Where copies of a prompt live (ai350-03) — whiteboard; a prompt spawning copies in run history, Slack, vendor logs, spreadsheet. Not drafted.
- Deletion request walk-through (ai350-04) — screencast across seven stores with a stopwatch. Not drafted.
- Rubber stamp vs real review (ai350-06) — talking head with approval-rate chart. Not drafted.

## Assessment ideas
- Threat-table sort: give ten one-line incidents; learners map each to a row of the ai350-02 threat table.
- "Which control first?" ordering item for the ai350-03 sequence (inventory, minimise, scope, log, vendor).
- Obligation-to-check matching: obligation names vs. workflow checks from the ai350-04 table (shuffled right column).
- Results-table interpretation (ai350-05): give a table with a one-band difference; learner applies a pre-stated rule and writes the limits statement.
- Tiering exercise (ai350-06): ten decisions, learner tiers each and justifies with the criteria wording.
- Rule-writing rubric (ai350-07): convert five vague conditions ("contains misinformation") into one of the four implementable shapes.

## Changes applied in this pass
- `02-threats-to-ai-powered-systems.md` — end of lesson: added "Check your understanding" (3 items with answers).
- `03-data-security-in-ai-workflows.md` — end of lesson: added "Check your understanding" (3 items with answers).
- `04-data-privacy-law-in-practice.md` — end of lesson: added "Check your understanding" (3 items, including pseudonymised vs anonymised).
- `05-bias-fairness-and-ethical-ai.md` — "Principles that translate into actions": corrected cross-reference to the monitoring lesson.
- `05-bias-fairness-and-ethical-ai.md` — "Reading results honestly": corrected reference to when the decision rule is written.
- `05-bias-fairness-and-ethical-ai.md` — end of lesson: added "Check your understanding".
- `06-responsible-ai-policy-for-automated-decisions.md` — "Decision rights: the core of the document": added note reconciling the under-$50 refund row with the tier criteria.
- `06-responsible-ai-policy-for-automated-decisions.md` — end of lesson: added "Check your understanding".
- `07-monitoring-ai-output-for-misinformation-and-compliance-risk.md` — "A monitoring rule set": defined "groundedness score".
- `07-monitoring-ai-output-for-misinformation-and-compliance-risk.md` — end of lesson: added "Check your understanding".

## Open questions for the course owner

### Legally time-sensitive items (verify before each cohort; no new legal specifics were added in this pass)
| Lesson | Location | Statement | Why it may change |
|---|---|---|---|
| ai350-04 | "What this lesson is and is not" | CCPA "amended by CPRA"; EU AI Act described as out of scope | California's privacy agency continues to issue regulations (including on automated decision-making technology, risk assessments, and audits); EU AI Act obligations phase in over several years. The scoping sentence may need to name newer obligations or new state laws. |
| ai350-04 | "The obligations, as workflow checks" | Breach notification: GDPR 72 hours from awareness; "state laws" | GDPR figure is stable, but US state breach-notification timelines and triggers vary and are amended frequently. |
| ai350-04 | "The obligations, as workflow checks" | Automated decision-making listed as GDPR Art. 22 only | US state rules on automated decision-making (California regulations, other state AI/ADMT laws) are new or pending; scope and effective dates have shifted. |
| ai350-04 | "Where the two regimes diverge" | CCPA applicability "thresholded on business size and data volume" | Thresholds are inflation-adjusted and have been revised; the lesson wisely avoids numbers — keep it that way. |
| ai350-04 | "Working a concrete example" | US processing of EU data needs "a transfer mechanism" | The EU–US transfer framework has been litigated repeatedly; the available mechanisms may change. Lesson correctly leaves selection to counsel. |
| ai350-04 | Opt-out row | "sale or sharing" opt-out, service-provider contract distinction | Regulatory interpretation of whether AI vendor use is "sharing" continues to evolve. |
| ai350-06 | "Prohibited uses" | Starter list (employment, credit, housing, insurance, admission, benefits; bot impersonation) | Several US jurisdictions now regulate automated employment decisions and bot disclosure; a learner's organisation may have binding rather than voluntary obligations here. Consider a sentence telling learners to check local law with counsel. |
| ai350-03 | "Third-party model exposure" | Vendor training/retention defaults differ by consumer vs API tier | Vendor terms change frequently; the lesson already tells learners to date-stamp evidence. Good. |
| ai350-07 | "Responding when monitoring fires" | "notification deadlines are short and are counted from awareness" | Correct generically; keep generic. |

### Other questions
- ai350-03 recommends 90-day rotation as "a common default". Some current guidance favours event-driven rotation plus short-lived credentials over fixed schedules for keys. Keep, or add a sentence?
- ai350-02 item 4 ("measurably reduces success rates") — do you have a source to cite, or should it be softened?
- The prerequisites list db305 and ai201; projects assume learners can run Python + pytest. Is that safe for this cohort, or should x01/x02 offer a no-code variant (the lesson practices already provide one)?
- Should the ai350-06 under-$50 refund example be changed to High instead of explained? The note added keeps the original table intact.
