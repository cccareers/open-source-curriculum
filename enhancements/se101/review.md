---
course_id: se101
title: "Introduction to Sales — Enhancement Review"
reviewed_lessons: 6
status: draft
---

## Summary

A strong, voice-consistent beginner course: every lesson has a clear behavioral objective, concrete dialogue, and a hands-on practice block. The biggest opportunities are (1) giving learners modeled "good vs. weak" demonstrations they can watch before practicing, since the course is explicitly a motor skill, and (2) adding quick self-checks and scored role-plays so an instructor can tell whether the behavior was actually acquired.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| se101-02 | "Handoffs are where deals leak" | The remedy ("write down what you learned... and hand it over") is stated but never shown; practice step 3 asks learners to write a handoff note with no model. | Added a three-bullet SDR-to-AE handoff note built from the Dana worked example, plus one sentence on what makes it good. | Applied |
| se101-05 | "Worked examples" → Status quo | The model rep cites "two companies I've worked with in your sector." A brand-new apprentice has no such customers, and may copy the line verbatim. | Added a short caution: cite only true references, approved case studies, the customer's own numbers, or an offer to test. | Applied |
| se101-04 | "Take the problem apart first" | The running example uses £ (£400k) while the rest of the pathway is currency-neutral or US-based. | Leave as is, or align currency across the pathway — owner decision. | Proposed |
| se101-06 | "Practice" step 1 | "The field-service scenario you have been working with" is ambiguous: Lesson 3 uses a home-services scheduler, Lesson 4 a field-service platform, Lesson 5 a maintenance product. | Name it explicitly: "the home-services scheduling scenario from Lessons 3 and 4." | Proposed |
| se101-03 | "Active listening is a set of visible behaviors" | "Count two beats" is never quantified; learners on video calls ask how long a beat is. | Add "(roughly two seconds)" after the first mention. | Proposed |
| All lessons | End of lesson | No quick self-check; learners cannot confirm understanding before the partner exercise. | Added a three-question "Check your understanding" block with answers to se101-02 through se101-06. | Applied |

## Depth and coverage gaps

- **Modeled behavior is text-only.** Every objective is a spoken behavior, but learners never see or hear one done well and badly. Video scripts with paired takes address this (objectives: "Respond to a routine objection without discounting or arguing"; "Ask for a specific, dated next step at the end of a sales conversation").
- **No scoring rubric for role-plays.** The practice blocks are excellent prompts but give observers nothing to score against. The supplementary projects include rubrics (objectives: "Use open questions and active listening to surface what a customer actually needs").
- **Remote/async conversations.** All examples are live calls. A short note on applying the playback and the dated ask over email or chat would help (objective: "Ask for a specific, dated next step at the end of a sales conversation").
- **Multi-stakeholder discovery.** Lesson 3 models one-to-one discovery only; Lesson 2 says deals stall when stakeholders are missing. A worked example of asking "who else feels this?" would bridge them (objective: "Describe the stages of a business software sales cycle and the roles involved at each stage").
- **Misconception not addressed in Lesson 4:** that the capability you map to must be the product's headline feature. The worked example implicitly corrects this; one explicit sentence would help (objective: "Translate a customer's stated problem into a matching software capability").

## Proposed additional projects

- **Drafted — se101-x01** `projects/01-discovery-to-dated-next-step-roleplay.md`: full first conversation with a persona card (Rosa, home-services scheduler), mapping table, dated ask, rubric.
- Not yet drafted — se101-x02 `projects/02-objection-drill-ladder.md`: timed objection-handling drill across the five objection types with a facilities-manager persona and an observer scorecard.
- Idea: **Handoff relay** — three learners pass one deal SDR → AE → CSM using only written handoff notes; the third learner's first call is scored on how many questions the customer had to repeat.
- Idea: **Stage-mapping case file** — given ten anonymized call summaries, place each deal on the stage line and identify which ones have moved backwards.

## Video and animation opportunities

- **Drafted — se101-v01** "That's More Than We Budgeted": weak take vs. strong take of a price objection (se101-05). Hybrid: acted scene plus host. Motion and tone matter — arms folding, pauses — which text cannot convey.
- Not yet drafted — se101-v02 "The Last Ninety Seconds": continuation vs. advance close with Priya (se101-06). The silence after the ask is the core skill and is only teachable by hearing it.
- **Drafted — se101-a01** "One Deal, Eight Stages, and the Handoffs Where Context Leaks" (se101-02). Explainer animation; makes backwards movement and lost context visible.
- Idea: whiteboard explainer for symptom / mechanism / impact / who, using the invoicing example (se101-04).
- Idea: 60-second "the two-beat pause" micro-video showing the same Priya exchange with and without the pause (se101-03).

## Assessment ideas

- Audio-clip quiz: play ten 10-second customer lines; learner labels each brush-off / objection / blocker.
- Transcript markup: give a 3-minute discovery transcript; learner tags every question open/closed/leading/stacked.
- Close scorecard (six properties from Lesson 6) usable by peers on any recorded call.
- Capstone: one recorded 15-minute call scored with the se101-x01 rubric, used as the course's summative evidence.

## Changes applied in this pass

- `catalogue/courses/se101/lessons/02-how-a-software-sale-works.md`, "Handoffs are where deals leak": added a model three-bullet handoff note from the Dana example and a sentence on why it works.
- `catalogue/courses/se101/lessons/02-how-a-software-sale-works.md`: added "Check your understanding" (3 questions with answers).
- `catalogue/courses/se101/lessons/03-questions-and-active-listening.md`: added "Check your understanding".
- `catalogue/courses/se101/lessons/04-from-customer-problem-to-product-fit.md`: added "Check your understanding".
- `catalogue/courses/se101/lessons/05-handling-everyday-objections.md`, "Worked examples": added a caution about citing only real or approved references in the evidence step.
- `catalogue/courses/se101/lessons/05-handling-everyday-objections.md`: added "Check your understanding".
- `catalogue/courses/se101/lessons/06-closing-asking-for-the-next-step.md`: added "Check your understanding".

## Open questions for the course owner

- se101-02 has `competency_ids: []` while the other lessons are mapped. Is that intentional, or should it map to a D3 (pipeline/prospecting) competency in a future frontmatter revision? (Not changed here.)
- Currency: keep £ in Lesson 4, or standardize?
- The "about ten weeks, roughly typical for a deal this size" claim in Lesson 2 is reasonable but unsourced; consider softening to "in this example" or citing a source.
- Do you want the video takes filmed with actors, or produced as animated avatars for easier localization?
