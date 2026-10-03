---
course_id: ai101
title: "Fundamentals of AI & Prompt Engineering — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary

ai101 is a strong, unusually coherent entry course: every lesson ties technique back to the next-token mental model from lesson 02, the running scenario (ShiftLine, three warehouse sites, Site 2 scanners, Dana Whitfield's order, the URGENT/NORMAL/LOW triage standard) carries cleanly from prompt anatomy through the API script, and the practice sets are concrete and measurable. The biggest opportunity is not content but **assessability and currency**: there are no "check your understanding" items for a learner to self-test against, the API lesson is the only hands-on coding moment and has no test harness, and several vendor-specific details (temperature ranges, header versions, response field names, illustrative prices) need an owner-side currency check before each cohort.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ai101-02 | "Tokens: the unit the model reads and writes" | Token counts in the worked example are wrong: the first split line shows 10 tokens (text says nine), the second shows 13 (text says fourteen). A learner who counts the pipes will lose trust in the example. | Corrected to "Ten" and "thirteen"; the point (rarer words cost more per word) still holds. | Applied |
| ai101-02 | "The sampling loop, and what temperature controls" | "Typical ranges run from 0 to about 2" is provider-specific; some APIs cap temperature at 1, so the 1.4 / 1.5 examples will be rejected on those platforms. | Clarified that the range depends on the provider (commonly 0–1 or 0–2) and that 1.0 is "as computed" either way. | Applied |
| ai101-02 | Practice, exercise 1 | Asks the learner to have a chat assistant count its own tokens. Lesson 03 ("Self-knowledge", "Arithmetic and counting") explains that this is exactly what models are unreliable at, so the check is not a check. | Point learners to a provider tokenizer tool where available, and treat a chat assistant's count as another estimate. | Applied |
| ai101-02 | Practice, exercise 3 | Uses temperature 1.5, which exceeds the maximum on providers capped at 1. | Added a one-line fallback: use the highest value your tool allows. | Applied |
| ai101-04 | "Context" | "XML-ish tags in backticks" is ambiguous — learners may think the backticks are part of the delimiter. | Reworded to "XML-style tags such as `<email>` and `</email>`". | Applied |
| ai101-05 | "One source, four families" | British spelling "centres" in an otherwise US-spelled course ("center of gravity" in the opening). | Normalized to "centers". | Applied |
| ai101-06 | "A worked chain" | Step 1 refers to "the message between the <<<MSG>>> markers" but the message itself is never shown, so learners cannot verify the step 1 output against its input — the very inspectability the lesson argues for. | Added the source email inside the step 1 prompt, consistent with the extracted JSON (Site 2, handheld scanners, six people, this morning, writing receipts by hand). | Applied |
| ai101-08 | "A script you can actually run" | Introduced as "Fifteen lines" that "writes the results to a file"; the script is roughly fifty lines and prints to the terminal. | Changed to "A short script ... prints the results with a token total". | Applied |
| ai101-08 | "What comes back" | `stop_reason` is explained for the Claude API only, although the section already gives the OpenAI text path. Learners using the other provider will look for a field that does not exist. | Added the OpenAI chat completions equivalent (`finish_reason`, with `stop` / `length`). | Applied |
| ai101-08 | "Cost and latency, concretely" | "Every provider SDK has this built in" is an absolute claim that is hard to keep true. | Softened to "The official SDKs from the major providers generally have this built in". | Applied |
| ai101-03 | "Choosing a model", axis 2 | "A 40-page document is roughly 20,000 words" assumes ~500 words per page without saying so. | Proposed: add "(at about 500 words a page)". Left as-is — low risk. | Proposed |

## Depth and coverage gaps

- **No self-check items anywhere** (all objectives). Each lesson ends in substantial practice but has nothing a learner can use in five minutes to know whether they understood the reading. Added "Check your understanding" blocks to lessons 02–08.
- **Lesson 02 — context window example is qualitative only** ("Explain in plain language how a generative AI model turns a prompt into a response, and what a token, a context window, and a temperature setting each control"). A single worked budget (system prompt + pasted doc + history + reserved output = window) would make "one budget covering all of it" concrete. Proposed for a later pass; covered in the animation storyboard and in the new check-your-understanding item.
- **Lesson 03 — model selection has no worked cost-per-completed-task example with verification time** ("Describe what current generative models are reliably good at, where they fail, and how to choose a model for a task"). The text promises lesson 08 does the arithmetic, but lesson 08 only covers API cost, not the human verification minutes that the lesson 03 argument hinges on. Suggest one table in lesson 08 adding reviewer minutes × hourly rate.
- **Lesson 04/05 — prompt injection is mentioned once** ("Write a structured prompt using role, task, context, constraints, and output format"). The "Fence it off" paragraph is good; a misconception worth stating explicitly is that delimiters *reduce* but do not *eliminate* injection risk. ai350 (security) picks this up downstream, so a pointer sentence is enough.
- **Lesson 05 — image creation has no evaluation step** ("Adapt prompting technique to the task type, including text generation, summarization, extraction, and image creation"). The four-pass exercise is good; add a bias/representation check on the generated careers-page image (who appears by default as "warehouse supervisor"), which links naturally to lesson 07's default audit.
- **Lesson 06 — no worked map-reduce example** ("Apply few-shot examples and multi-step prompt chains to tasks a single prompt cannot do well"). The pattern is described well but only the sequential chain is worked end to end. A short map prompt + reduce prompt pair over a long incident log would round it out.
- **Lesson 07 — LLM-as-grader paragraph is dense** ("Evaluate an AI response for factual accuracy, relevance to the request, and bias, and act on what the evaluation shows"). A tiny worked grader prompt (rubric in, reason then score out) would make "ask for a reason before the score" actionable. Project 02 partly covers this.
- **Lesson 08 — no testing story for the script** ("Call a hosted model API from a simple script and describe when fine-tuning or a tuned system prompt is the right adaptation"). The lesson lists retry, timeout, and label validation as "the next three things you would add" but gives no way to check them without spending money. Project 01 adds an offline, stubbed test suite for exactly these.
- **Misconception not addressed anywhere:** "temperature 0 is fully deterministic." Lesson 02 says "nearly deterministic", which is right; a sentence on why (provider-side batching and floating-point non-determinism can still vary output) would pre-empt confusion when learners see variation at 0 in exercise 3.

## Proposed additional projects

- **Drafted — `projects/01-site2-ticket-triage-pipeline.md` (ai101-x01):** turn the lesson 08 classifier into a tested batch triage tool with few-shot examples, label validation, `stop_reason` checks, retry with backoff, and a cost report; pytest suite runs offline with the HTTP call stubbed.
- **Drafted — `projects/02-shiftline-prompt-kit-and-eval.md` (ai101-x02):** build a four-family prompt kit (summary, extraction, transformation, generation) for ShiftLine feedback emails and a 15-row evaluation sheet; one measured prompt change; includes an offline checker for extraction JSON shape and word-count constraints.
- **Not drafted — Long incident log map-reduce:** summarize a 30-page warehouse incident log (exceeds a small context window) with chunk overlap, terse map output, and a reduce step; measure call count and cost against a single long-context call.
- **Not drafted — Model selection memo:** run the lesson 03 ten-item test set across two capability tiers, compute cost per completed task including reviewer minutes, and write a one-page recommendation.
- **Not drafted — Bias audit of a careers page:** generate ten job-posting drafts and ten images for "warehouse supervisor" and "payroll clerk", run the default audit and swap test, and submit the template edits made in response.

## Video and animation opportunities

- **Drafted — `media/video-01-reading-an-api-response.md` (ai101-v01):** lesson 08; screencast walking through one request and its JSON response, then forcing `stop_reason: max_tokens`. Motion helps because learners need to see where the text lives in nested JSON and watch a truncation happen.
- **Drafted — `media/video-02-fixing-a-prompt-one-block-at-a-time.md` (ai101-v02):** lesson 04; hybrid screencast of the refining loop on the weekly status update, naming the failed block each pass. Watching the one-change-per-run discipline is more persuasive than reading it.
- **Drafted — `media/animation-01-next-token-loop-and-temperature.md` (ai101-a01):** lesson 02; the generation loop with a live probability bar chart that sharpens and flattens as a temperature dial moves, plus the context-window budget filling up. The concept is invisible and dynamic.
- **Drafted — `media/animation-02-error-laundering-in-a-chain.md` (ai101-a02):** lesson 06; a wrong value entering at the extract step and gaining "confidence" as it passes downstream, then the same chain with a validation gate catching it.
- **Not drafted — Context window "silent drop" (lesson 02):** whiteboard animation of the BANANA instruction scrolling out of the window during a long conversation.
- **Not drafted — Claim decomposition (lesson 07):** screencast highlighting each claim in the safety-policy summary and color-tagging sourced vs. unsourced.
- **Not drafted — Fine-tuning ladder (lesson 08):** explainer animation climbing the six-rung adaptation ladder with cost and reversibility meters.

## Assessment ideas

- **Token estimation quick check (02):** give three short strings (plain English, product code, non-English sentence) and ask learners to rank them by tokens per word, then reveal tokenizer results.
- **Temperature matching (02):** match five tasks (extract invoice totals, brainstorm app names, generate unit tests, write a tagline, classify tickets) to low / moderate / high temperature with one-line justification.
- **Block diagnosis (04):** present five flawed outputs with their prompts; learner names the single block that failed and writes the one-line edit. Score: correct block + edit that addresses it.
- **Family identification (05):** ten workplace requests; learner names the task family and the characteristic failure to guard against.
- **Chain design rubric (06):** criteria — each step has one job, structured intermediate, defined null path, validation between steps, human gate placed after the irreversible step, temperature stated per step.
- **Evaluation calibration exercise (07):** pairs score the same five outputs on the course rubric independently, then reconcile; graded on the written reconciliation notes, not the scores.
- **API response reading (08):** given three raw JSON responses (normal, truncated, rate-limited error), learner states what happened and the next action for each.
- **Adaptation decision (08):** extend practice 4 with a short rubric: correct rung, cheaper rungs ruled out with a reason, a named measurement taken first.

## Changes applied in this pass

- `02-how-generative-ai-models-work.md`, "Tokens: the unit the model reads and writes": corrected the token counts in the split example from nine/fourteen to ten/thirteen.
- `02-how-generative-ai-models-work.md`, "The sampling loop, and what temperature controls": stated that the allowed temperature range is provider-specific (commonly 0–1 or 0–2).
- `02-how-generative-ai-models-work.md`, "Practice" exercise 1: replaced "ask a chat assistant to count tokens" as the check with a provider tokenizer tool, noting a chat assistant's count is only another estimate.
- `02-how-generative-ai-models-work.md`, "Practice" exercise 3: added a fallback for tools that cap temperature below 1.5.
- `02-how-generative-ai-models-work.md`: added "Check your understanding" block at the end.
- `03-capabilities-limitations-and-model-choice.md`: added "Check your understanding" block at the end.
- `04-prompt-anatomy-and-core-patterns.md`, "Context": clarified the XML-style tag delimiter wording.
- `04-prompt-anatomy-and-core-patterns.md`: added "Check your understanding" block at the end.
- `05-prompting-across-task-types.md`, "One source, four families": normalized "centres" to "centers".
- `05-prompting-across-task-types.md`: added "Check your understanding" block at the end.
- `06-few-shot-examples-and-prompt-chaining.md`, "A worked chain": added the source customer message inside the step 1 prompt so the extraction can be checked against its input.
- `06-few-shot-examples-and-prompt-chaining.md`: added "Check your understanding" block at the end.
- `07-evaluating-ai-responses.md`: added "Check your understanding" block at the end.
- `08-working-with-model-apis.md`, "What comes back": added the OpenAI chat completions equivalent of `stop_reason` (`finish_reason`: `stop` / `length`).
- `08-working-with-model-apis.md`, "A script you can actually run": intro corrected from "Fifteen lines ... writes the results to a file" to "A short script ... prints the results with a token total" to match the code.
- `08-working-with-model-apis.md`, "Cost and latency, concretely": softened "Every provider SDK has this built in".
- `08-working-with-model-apis.md`: added "Check your understanding" block at the end.

## Open questions for the course owner

- **Vendor API details need a currency check each cohort.** Lesson 08 hard-codes the `anthropic-version: 2023-06-01` header, the `/v1/messages` and `/v1/chat/completions` endpoints, `max_tokens` as the OpenAI-side length field, and the `end_turn` / `max_tokens` stop reasons. These were correct at the time of the reviewer's knowledge, but OpenAI has introduced newer interfaces (and newer parameter names for output length on some models), and header versions can change. Please verify against current provider docs before release; I did not change them.
- **Temperature ranges and defaults.** The "0.7 is the common default for chat" claim and the 0–2 range are provider-specific. I clarified the range in the text; please confirm the default statement is still accurate for the tools learners will use.
- **Illustrative pricing ($3 / $15 per million tokens).** Labelled illustrative in the lesson, which is correct; confirm it is still a reasonable order of magnitude so the worked example does not look odd next to live price pages.
- **Context window sizes** ("a few thousand tokens on small older models to hundreds of thousands or more") — deliberately vague and fine, but worth re-reading each year.
- **Vocabulary size claim** ("around 50,000 to 200,000 entries") — plausible for current tokenizers; not verified against specific models.
- **Batch endpoints and discounts** (lesson 08 lever 4) — availability and discount levels vary by provider; no specifics were added.
- **OSHA 1910.178 example (lesson 07).** The lesson correctly treats the "must carry the card" claim as unsourced and requiring verification. If the course owner wants to close the loop with the actual answer, it should be verified against the current regulation text by someone qualified; I did not add a statement about what the regulation requires.
- **Images.** `./img/next-token-prediction.png`, `prompt-skeleton.png`, and `prompt-chain-flow.png` are referenced but no `img/` folder exists under `catalogue/courses/ai101/lessons/`. The assets list in `course.json` describes them; they still need to be produced.
- **Proposed competency** in `course.json` (model selection under cost/latency constraints) is still pending; the media and projects here do not cite it.
- **Fine-tuning availability.** Lesson 08 discusses fine-tuning conceptually and correctly; which providers and model tiers currently offer hosted fine-tuning changes often and is not named, which is the right call — keep it that way.
