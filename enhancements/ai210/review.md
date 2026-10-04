---
course_id: ai210
title: "Human-Centered AI Design — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
ai210 is one of the stronger courses in the pathway: every lesson is concrete, practice-heavy, and built around one coherent running example (a support team's AI draft-reply review screen, with a planted wrong refund window, source passages, and a reject path) that threads from prototyping (ai210-04) through interface patterns (ai210-05), trust (ai210-06), and usability testing (ai210-07). The biggest opportunities are (1) a few accuracy gaps in the WCAG material in ai210-06, (2) missing assets (both `./img/*.png` files referenced by ai210-04 and ai210-05 do not exist yet), and (3) no end-of-lesson self-checks, which this pass adds. The course-level metadata defects (truncated title, copy-pasted description) remain and need an owner decision; they are outside what this pass may change.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ai210-01 | "Description" | The course never tells learners that one running example (the draft-reply review screen) carries through lessons 04–07, so learners do not know to keep their artifacts. | Added one sentence naming the running example and telling learners to keep each lesson's artifacts, because later practice builds on them. | Applied |
| ai210-02 | "Preparing the session" | "Sponsor" and "practitioner" are used as roles before they are defined (the role table is in ai210-08). | Defined both terms at first use in one parenthetical sentence. | Applied |
| ai210-03 | "Writing success criteria for a probabilistic system" | Failure criteria are described but never shown; the template section 8 is prose only, so learners struggle with Practice step 5. | Added a three-line worked failure-criteria example using the course's support-reply scenario. | Applied |
| ai210-03 | "Writing success criteria for a probabilistic system" | The 92%/90% threshold example compares a human catch rate with a system accuracy rate, which are different measures; learners may compare them directly. | Added one sentence noting the two numbers measure different things and that the criterion must state which one is being judged. | Applied |
| ai210-04 | "The riskiest assumption goes first" | "Rank on two axes" gives no scoring method until Practice step 1 (1–5 scale). | Added the multiply-impact-by-uncertainty rule and a one-line worked example. | Applied |
| ai210-05 | "Latency: designing the wait" | The 0.1 s / a few seconds / tens of seconds bands are presented without a source; they are the widely cited response-time limits (Miller 1968; popularized by Nielsen). The lesson also does not warn against fake progress bars. | Added one sentence warning against progress indicators that do not reflect real progress. Source attribution proposed (see Open questions). | Applied (warning) / Proposed (citation) |
| ai210-06 | "Accessibility, at an awareness level" — Understandable | The live-region bullet sits under "Understandable", but WCAG files status messages under Robust (SC 4.1.3 Status Messages, Level AA). Learners asked to "record the principle it violates" (Practice step 4) will record the wrong one. | Added a parenthetical giving the correct WCAG location without moving the bullet. | Applied |
| ai210-06 | "Accessibility, at an awareness level" — Perceivable | "Meets contrast" has no threshold; learners cannot check it. | Added the WCAG AA minimums (4.5:1 normal text, 3:1 large text). | Applied |
| ai210-06 | Accessibility review checklist | The checklist targets AA, but the reduced-motion item corresponds to SC 2.3.3 Animation from Interactions, which is Level AAA. | Added a note after the checklist saying which items go beyond AA and why they are kept. | Applied |
| ai210-07 | "Planning the session" / "Practice" | The lesson recommends 5–8 participants but Practice asks for "at least three"; learners may read that as contradiction. | Added one sentence explaining that three is the practice minimum and that findings from three sessions are directional. | Applied |
| ai210-08 | "The alignment document" | Section 8's Decides / Consulted / Informed columns are a RACI variant but the term is never named, and "Responsible/Accountable" is absent. | Added one sentence naming it as a simplified RACI and explaining why one "Decides" name per row matters. | Applied |
| ai210-02 – ai210-08 | End of lesson | No self-check before the Practice work is assessed. | Added a short "## Check your understanding" block (four questions with answers in plain text) to each content lesson. | Applied |

## Depth and coverage gaps
- **Discovery with a sceptical or hostile client** (objective: Run a discovery conversation that surfaces a client's real AI automation needs rather than their first stated request). ai210-02 covers multi-stakeholder disagreement well but not the client who arrives having already bought a tool, or who wants AI to justify headcount reduction. A short role-play variant would help; drafted as a role-play card in projects/01.
- **Remote discovery and note-taking consent** (same objective). The session plan assumes a room. Many apprentices will run discovery over video; recording consent, transcript tools that themselves use AI, and data-handling of transcripts are not covered.
- **Baselines when the client measures nothing** (objective: Turn discovery findings into written requirements and success criteria a build can be judged against). ai210-03 says to record a baseline but gives no method for constructing one (e.g. a one-week time-and-tally log). Worth a paragraph or a worked example.
- **Sample-size realism for success criteria** (same objective). "100 sampled invoices" for a ≥98% threshold is fine as an illustration, but learners get no guidance on why a 20-item sample cannot evidence 98%. A one-paragraph intuition (two errors in 20 is 90%) would prevent weak criteria.
- **Prompt-iteration logging format** (objective: Produce a low-fidelity prototype of an AI-powered solution quickly and iterate it on evidence). ai210-04 says to version prompts but shows no prompt-log row; the iteration log covers rounds, not prompt diffs.
- **Generated-data privacy** (same objective). The lesson warns that generated inputs flatter the system but not that pasting real client inputs into a third-party AI tool for a content prototype may breach the constraints captured in discovery ("data can't leave our tenancy"). This is a real-world trap; flagged for an owner-approved addition.
- **Multiple-candidate and conversational states** (objective: Apply interface patterns that suit AI's probabilistic behavior, including latency, uncertainty, and error states). The state table covers single-turn interactions; multi-turn chat (context loss, conversation reset) is not covered. Probably acceptable given scope; note it for ai350/agile210.
- **Accessibility of the recipient's copy** (objective: Design AI-powered interfaces for trust, transparency, and accessibility, including disclosure and correction paths). Disclosure "travels with the output", but there is no guidance on making the travelling disclosure accessible in email or PDF.
- **Testing with the recipient audience** (objective: Plan and run a usability session on an AI prototype and turn the feedback into specific changes). ai210-07 says to test the recipient separately but gives no task examples for that audience. projects/02 includes one.
- **Remote/unmoderated sessions and the planted-error ethics** (same objective). Debriefing participants after a planted error is covered in the script; consent language that warns content may be wrong is present. Good. Unmoderated testing is not covered and probably should stay out of scope.
- **Measuring after handoff** (objective: Align stakeholders on an AI solution's goals, trade-offs, and handoff so the build survives contact with the organization). "Book the measurement" is excellent; an example of a first-measurement report would close the loop.

## Proposed additional projects
- **Drafted — projects/01-applications-intake-discovery-case-file.md (ai210-x01):** discovery role-play on the "AI to read incoming PDF applications" brief from ai210-02, producing a notes template, two-column request/need, recap email, requirements and success-criteria document, and a stakeholder map. Evidence portfolio.
- **Drafted — projects/02-draft-reply-screen-evidence-portfolio.md (ai210-x02):** take the course's draft-reply review screen from wireframe to a tested, trust-reviewed clickable prototype, with a state table checked by a small `node --test` script, two usability rounds, and a findings-to-changes table.
- Not drafted: **"Weekly management report" redesign** — the ai210-02 brief (b), carried through to an alignment document and decision log, as a capstone rehearsal for agile210.
- Not drafted: **Accessibility walkthrough swap** — two learners exchange prototypes and run the ai210-06 keyboard and greyscale walkthroughs on each other's work, reporting findings by WCAG principle.
- Not drafted: **Recipient-side disclosure lab** — write and test the travelling disclosure for an AI-drafted customer email with five non-specialist readers.
- Not drafted: **"Say no" discovery** — a brief engineered so that the honest outcome is a lookup table or a better form, not AI (ai210-02 "Listen for where AI does not fit").

## Video and animation opportunities
- **Drafted — media/video-01-walk-me-through-the-last-time.md (ai210-v01):** a replayed discovery conversation, with pauses to annotate the request vs. the need. ai210-02. Format: hybrid (role-play plus annotation). Motion helps because the skill is conversational timing — silence, follow-ups, not proposing — which text cannot show.
- **Drafted — media/video-02-the-draft-reply-screen-state-by-state.md (ai210-v02):** a screencast walking the draft-reply wireframe through every state, then the trust and accessibility review (greyscale, keyboard-only). ai210-05, ai210-06. Format: screencast.
- **Drafted — media/animation-01-ai-interaction-states.md (ai210-a01):** the AI interaction state machine, animated; doubles as the brief for the missing `ai-interaction-states.png`. ai210-05. Explainer animation.
- **Drafted — media/animation-02-calibration-not-trust.md (ai210-a02):** over-trust vs. under-trust as two gauges drifting from the reliability line. ai210-06. Explainer animation.
- Not drafted: **The fidelity ladder** (ai210-04) — a climbing animation showing cost rising per rung; would double as the brief for the missing `prototype-fidelity-ladder.png`. Explainer animation.
- Not drafted: **From observation to finding** (ai210-07) — sticky notes clustering into findings, then sorting by severity. Whiteboard.
- Not drafted: **Moderator do/don't** (ai210-07) — talking head, two short takes of the same participant moment, one rescued, one not.
- Not drafted: **The decision log six months later** (ai210-08) — short talking-head scenario showing a new stakeholder's "why does it work like that?" answered by lookup.

## Assessment ideas
- **Request vs. need sort (ai210-02):** ten client quotes; learners sort each into "stated request" or "underlying need" and justify. Auto-gradable with a key.
- **Requirement lint (ai210-03):** give eight requirements; learners flag the ones that name a technology, lack a threshold, or cannot be traced to discovery evidence.
- **Success-criterion four-property rubric (ai210-03):** score a criterion 0–4 on measure, threshold, sample, judge.
- **Rung picker (ai210-04):** five research questions; pick the lowest fidelity rung that answers each.
- **State-table completeness check (ai210-05):** the `node --test` script in projects/02 can be reused as an auto-check for any learner's state table.
- **Microcopy rubric (ai210-05):** under 25 words, no error code, no blame, names a next step — four binary checks.
- **WCAG principle mapping (ai210-06):** ten findings; learners assign each to perceivable/operable/understandable/robust and cite the SC number. Note the 4.1.3 correction applied in this pass.
- **Task vs. instruction rewrite (ai210-07):** rewrite five instructions as tasks.
- **Disagreement classifier (ai210-08):** six stakeholder statements; classify as factual, priority, misunderstanding, or position.
- **Course-level portfolio rubric:** one rubric across ai210-x01 and ai210-x02 that maps evidence to each D4-S1 competency, for use as the apprenticeship sign-off record.

## Changes applied in this pass
- `catalogue/courses/ai210/lessons/01-course-overview.md`, "Description": added a sentence naming the course's running example (the support team's draft-reply review screen) and telling learners to keep artifacts from each lesson's Practice.
- `catalogue/courses/ai210/lessons/02-discovery-identifying-ai-needs-with-clients.md`, "Preparing the session": defined "sponsor" and "practitioner" at first use.
- `catalogue/courses/ai210/lessons/02-discovery-identifying-ai-needs-with-clients.md`, new "Check your understanding" (end): four self-check questions with answers.
- `catalogue/courses/ai210/lessons/03-from-needs-to-requirements-and-success-criteria.md`, "Writing success criteria for a probabilistic system": added a sentence clarifying that a human catch rate and a system accuracy rate are different measures.
- `catalogue/courses/ai210/lessons/03-from-needs-to-requirements-and-success-criteria.md`, "Writing success criteria for a probabilistic system": added a worked failure-criteria example (never-event, maximum confident-error rate, cannot-answer behavior).
- `catalogue/courses/ai210/lessons/03-from-needs-to-requirements-and-success-criteria.md`, new "Check your understanding" (end): four questions with answers.
- `catalogue/courses/ai210/lessons/04-rapid-prototyping-with-ai-tools.md`, "The riskiest assumption goes first": added the impact × uncertainty scoring rule with a worked example.
- `catalogue/courses/ai210/lessons/04-rapid-prototyping-with-ai-tools.md`, new "Check your understanding" (end): four questions with answers.
- `catalogue/courses/ai210/lessons/05-ui-ux-patterns-for-ai-powered-products.md`, "Latency: designing the wait": added a sentence warning against progress indicators that do not reflect real progress.
- `catalogue/courses/ai210/lessons/05-ui-ux-patterns-for-ai-powered-products.md`, new "Check your understanding" (end): four questions with answers.
- `catalogue/courses/ai210/lessons/06-designing-for-trust-transparency-and-accessibility.md`, "Accessibility, at an awareness level" (Perceivable): added WCAG AA contrast minimums (4.5:1, 3:1 large text).
- `catalogue/courses/ai210/lessons/06-designing-for-trust-transparency-and-accessibility.md`, "Accessibility, at an awareness level" (Understandable): noted that WCAG places status messages under Robust, SC 4.1.3.
- `catalogue/courses/ai210/lessons/06-designing-for-trust-transparency-and-accessibility.md`, after the accessibility review checklist: noted that the reduced-motion item is AAA (SC 2.3.3) and is kept deliberately.
- `catalogue/courses/ai210/lessons/06-designing-for-trust-transparency-and-accessibility.md`, new "Check your understanding" (end): four questions with answers.
- `catalogue/courses/ai210/lessons/07-feedback-loops-testing-prototypes-with-users.md`, "Practice" (intro paragraph): added a sentence explaining that three sessions is a practice minimum and gives directional findings, not the 5–8 recommended in "Planning the session".
- `catalogue/courses/ai210/lessons/07-feedback-loops-testing-prototypes-with-users.md`, new "Check your understanding" (end): four questions with answers.
- `catalogue/courses/ai210/lessons/08-stakeholder-alignment-and-handoff.md`, "The alignment document": named section 8 as a simplified RACI and explained one decider per row.
- `catalogue/courses/ai210/lessons/08-stakeholder-alignment-and-handoff.md`, new "Check your understanding" (end): four questions with answers.

## Open questions for the course owner
- **Course metadata defects (not editable in this pass):** `course.json` title is truncated ("Human-Centered AI Desig") and the description is the duplicated ai201 text, as the sequencing rationale itself warns. Both are learner-visible. Needs an owner fix in `course.json`.
- **Missing images:** ai210-04 references `./img/prototype-fidelity-ladder.png` and ai210-05 references `./img/ai-interaction-states.png`; there is no `lessons/img/` folder, so both render as broken images today. animation-01 can serve as the brief for the second.
- **Proposed competencies:** `course.json` proposes two new D4-S1 competencies (WCAG evaluation; disclosure and correction). Lesson 06 and projects/02 assume them in spirit but cite only D4-S1-C03. A decision on adopting them affects how projects/02 is credited.
- **Disclosure regulation:** ai210-06 says disclosure is "increasingly a regulatory expectation." That is accurate in general, but this pass did not add specifics. The EU AI Act's Article 50 transparency obligations were scheduled to apply from August 2026, and there have been proposals to adjust AI Act timelines; US state laws (e.g. chatbot-disclosure statutes) vary and change. Recommend ai350 own any specific legal citations; verify before adding any here.
- **Response-time thresholds (ai210-05):** the 0.1 s / ~1 s / ~10 s limits are usually attributed to Miller (1968) and Card et al. (1991), popularized by Jakob Nielsen. Decide whether the lesson should cite a source.
- **"Five to eight participants finds the large majority of significant problems" (ai210-07):** this is the common reading of Nielsen and Landauer (1993) and is widely used, but it is contested for complex or high-variance tasks. Consider softening to "five per distinct user group per round" or citing it.
- **"Twenty times the response rate" (ai210-06, Capture):** a one-tap reason vs. free-text multiplier of 20× is stated as fact; I could not verify a source. Recommend rephrasing to "a far higher response rate" unless the author has data.
- **WCAG version:** the lesson says "WCAG" without a version. WCAG 2.2 (October 2023) is the current W3C Recommendation; WCAG 3 is a working draft. Recommend naming 2.2 so SC numbers in the checklist are unambiguous.
- **Data-handling in content prototypes (ai210-04):** should the lesson explicitly warn against running real client inputs through an unapproved third-party AI tool? It conflicts with the "data can't leave our tenancy" example in ai210-03. I did not add this because it is a policy decision for the program.
