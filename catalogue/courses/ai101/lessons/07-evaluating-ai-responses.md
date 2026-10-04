---
lesson_id: ai101-07
course_id: ai101
pathway: prompt-engineer
title: Evaluating AI Responses
order: 7
kind: lesson
competency_ids:
  - D1-S1-C04
objectives:
  - Evaluate an AI response for factual accuracy, relevance to the request, and
    bias, and act on what the evaluation shows
---

## Reading is not evaluating

Fluent text disarms people. A well-organized answer in confident prose activates every heuristic you have for "this person knows what they are talking about" — and none of those heuristics are measuring anything. The most expensive habit in this field is skimming an answer, finding it reads well, and shipping it.

Evaluation is a separate pass with its own procedure. You are asking three distinct questions, and they fail independently:

- **Accuracy** — are the claims true?
- **Relevance** — does this answer the question that was actually asked?
- **Bias** — whose perspective is being treated as the default, and who is disadvantaged by that?

An output can be flawlessly accurate and answer a different question. It can be perfectly on-target and quietly skewed. Score them separately or you will average away the problem.

## Accuracy: decompose, then check what is checkable

Do not evaluate an answer as a whole. **Break it into claims** — each individually verifiable statement — and treat each one on its own.

Take this output, produced in response to "summarize our warehouse safety policy for new hires" with the policy document supplied:

```text
All staff must complete safety induction before their first shift.
High-visibility clothing is required in all operational areas.
Forklift operators must be certified and recertified every three years.
Incidents must be reported to a supervisor within 24 hours. Under
OSHA regulation 1910.178, operators must also carry their certification
card on their person at all times.
```

Five claims. Now sort them by how they can be checked:

| Claim | Type | How to check |
| --- | --- | --- |
| Induction before first shift | Sourced — should be in the document | Find it in the source |
| High-vis in operational areas | Sourced | Find it in the source |
| Recertify every three years | Sourced | Find it in the source |
| Report within 24 hours | Sourced | Find it in the source |
| OSHA 1910.178 requires carrying the card | **Unsourced** — not from the document | External verification required |

That last row is the whole lesson. It arrived unrequested, it carries a precise-looking regulation number, and it was not in the material supplied. From lesson 03 you know the profile: **specific detail that you did not provide and the model could not have looked up.** That is where you check first, every time.

Three practical accuracy techniques:

**Check the source, not the plausibility.** The question is never "does this sound right", it is "where does this come from". For a summarization or extraction task, every claim should be findable in the source text — literally, with a find-in-page. Anything that is not findable is either an inference (sometimes fine, flag it) or an invention (never fine).

**Verify independently, and be careful how.** Asking the same model "is that correct?" is nearly worthless — it is generating a new response conditioned on a context in which the claim is already present, and it will often agree with itself. Slightly better is a fresh conversation with no prior context, which at least removes the anchoring. Genuinely reliable is a different source: the actual regulation, the actual documentation, a calculator, running the code.

**Recompute every number.** Sums, percentages, date arithmetic, unit conversions, counts. Do not read them; redo them.

Not everything is checkable, and pretending otherwise wastes effort. Sort claims into *verifiable now*, *verifiable with work*, and *not verifiable*. Then decide, deliberately, whether the not-verifiable ones can stay. Often the answer is to cut them.

## Relevance: did it answer the asked question

Relevance failures are sneakier than accuracy failures because everything in the response is true. Five recurring shapes:

**The adjacent answer.** You asked whether to pause the rollout; you received an excellent explanation of the factors involved in rollout decisions. True, well-written, not a decision.

**Scope drift.** You asked about one site; the answer generalizes to all three, or to warehouses in general. Now you cannot tell which parts apply to you.

**Hedge-and-list.** Instead of a recommendation, a balanced enumeration of every option with no position taken. Sometimes appropriate. Often it is the model avoiding the actual request.

**Ignored constraints.** You said 100 words and got 300. You said no bullet points and got bullet points. Check constraints mechanically — count the words, search for the forbidden word — because reading does not catch these reliably.

**Wrong audience.** Technically correct and pitched three levels above or below the person who has to read it.

The test is mechanical: **write down what you asked for as a list of requirements, then tick them off against the output one at a time.** If you cannot write that list, the problem is upstream in the prompt, not in the response — which is itself a useful finding.

## Bias: whose default is this

Bias in model output is not usually a slur. It is a **default** — an unstated assumption about who the normal person is — inherited from training data and reproduced without anyone choosing it. Four kinds you can actually test for:

**Representational defaults.** Which gender, age, name, or background appears when you do not specify one. Generate ten short profiles of "a warehouse supervisor" and "a nurse" and count. Uniformity is the finding.

**Framing and register.** Which dialect or phrasing is treated as "professional", whose communication style gets described as "aggressive" or "unclear". This bites hardest in tasks that rate or rewrite people's writing.

**Coverage.** Whose situation gets addressed and whose is silently omitted. A benefits summary that covers full-time salaried staff and never mentions part-time or shift workers has a coverage problem even though nothing in it is false.

**Sycophancy.** Not usually filed under bias, but it distorts output the same way: models tend to agree with the premise of the question. Ask "why is our new process working so well?" and you will get reasons, whether or not it is working. Test it directly by asking the opposite question and seeing whether you get an equally confident opposite answer.

Two tests you can run in minutes.

**The swap test.** Take the prompt, change one attribute — the name, the pronoun, the country, the job title — and hold everything else fixed. Run both several times. Differences in tone, length, assumed competence, or what gets explained are the finding.

**The default audit.** Run an unspecified prompt ten times and tabulate what the model filled in. If "a software developer" is a young man ten times out of ten, that is a default with consequences for anything you publish.

When you find bias, the response is a design change, not a scolding. Specify the attribute rather than letting the model choose it. Name the audience explicitly. Add a coverage constraint — `address part-time and shift staff explicitly` — and make it part of the template so it survives the next revision.

## A usable rubric

Judgment gets better when it is written down. This one is deliberately small enough to actually use:

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| **Accuracy** | Any false or unsourceable claim | All claims sourceable, minor imprecision | Every claim verified against source or authority |
| **Relevance** | Answers a different question | Answers it, misses a stated constraint | Answers it, all constraints met |
| **Bias** | Reproduces a harmful default, or excludes a group in scope | Unexamined defaults present, low stakes | Attributes specified or genuinely neutral; coverage checked |
| **Usability** | Needs a rewrite | Needs light editing | Usable as-is |

Two rules keep it honest. **Accuracy is a gate**: a zero there makes the total meaningless, because a beautifully relevant false answer is worse than a useless one. And **score against a written standard, not against your mood** — record the score with a one-line reason, so a later reader can tell whether "1" meant the same thing on Tuesday as on Friday.

## From one output to a real measurement

Judging a single output tells you about that output. Sampling once and shipping is the most common evaluation mistake in the field, and lesson 03's inconsistency point is why: the same prompt can produce a different answer next time.

The fix is small and unglamorous — a spreadsheet.

1. **Collect 10-30 real inputs.** Real, not invented; the messiness is the point. Cover the boundary cases and the ones you know are hard.
2. **Write the accepted output for each**, or at minimum the criteria a good one must meet. Do this *before* you look at any model output, or you will grade to what you got.
3. **Run all of them** through your current prompt.
4. **Score each on the rubric**, one row per input, with a reason column.
5. **Record the pass rate** and, crucially, **what the failures have in common**. One theme across four failures is a prompt fix. Four unrelated failures is a harder problem.
6. **Re-run the whole set after any change** — to the prompt, the model, or the settings. This is the only way to know whether an edit helped, and it will regularly tell you that a change you were sure about made things worse.

Thirty rows is not a research programme; it is an afternoon. It converts "the prompt seems better now" into "24 of 30, up from 18, and the remaining failures are all long inputs" — which is a sentence you can act on.

### Keeping the scoring honest

Two problems show up the moment more than one person scores, and both have cheap fixes.

**Scorers disagree.** Give the same five outputs to two colleagues and you will get different numbers, usually because "minor imprecision" means different things to each of them. Fix it by scoring the same five together first, arguing until the disagreements are resolved, and writing the resolutions into the rubric as examples. Ten minutes of this makes every later score comparable.

**Scorers drift.** Standards loosen over a long session, and they loosen in the direction of whatever you have been seeing. Re-scoring a few early rows at the end is a quick check; if your Friday scores differ from your Tuesday scores on identical output, your measurement moved, not the model.

Record the scores somewhere durable, with the prompt version alongside. The value of an evaluation set compounds: the second time you use it you can answer "is this better than what we had?", which is the only question anyone actually cares about.

A note on using a model to grade model output. It is legitimate at scale and it has real failure modes: a grader tends to prefer output that resembles what it would have written, tends toward leniency, and can be swayed by length and confident tone. If you use one, give it an explicit rubric, ask for a reason before the score, and calibrate it by hand-scoring a sample of its judgments. Never let it grade unsupervised on a task where you have not checked it against your own scores.

## Acting on what you found

Evaluation that ends in an opinion is a waste. Each failure type has a standard first move:

| What you found | First move |
| --- | --- |
| Invented facts | Supply the source in context; add an explicit null or "not stated" instruction |
| Wrong numbers | Move the arithmetic out of the model — calculator, script, spreadsheet |
| Answered a different question | Tighten the task block; state the deliverable as a noun |
| Constraint ignored | Make it measurable; move it adjacent to the request; verify mechanically |
| Inconsistent across runs | Lower temperature; specify format exactly; add examples |
| Fails only on hard or long inputs | Decompose into a chain; route hard cases separately |
| Skewed defaults | Specify attributes; add a coverage constraint to the template |
| Fails no matter what you do | Change capability tier — or conclude the task is not one to delegate |

That last row matters. "This should not be done by a model" is a legitimate, professional evaluation outcome, and knowing when to reach it is part of the competence. So is escalating: when the stakes are high and the verification cost approaches the cost of doing the work yourself, the honest answer is to do it yourself.

Log what you decided. A short record — date, what you changed, pass rate before and after — is what stops your team from re-litigating the same prompt every quarter.

## Practice

Reuse the ten-item test set you built in lesson 03 if you have it; extend it to twenty if you can.

1. **Decompose and verify.** Take one substantial AI output you have generated in this course. List every individual claim it makes. Mark each as sourced from your input, inferred, or unsourced. Verify every sourced claim against the source and every unsourced claim against a real external authority. Report a count of true, false, and unverifiable, and identify which claim you would have accepted on a skim.

2. **Score twenty outputs.** Build the spreadsheet: input, accepted output, model output, accuracy score, relevance score, bias score, usability score, reason. Fill in the accepted outputs before running anything. Score all twenty, report the pass rate, and write two sentences naming the single most common failure theme.

3. **Change one thing and re-measure.** Using your failure theme, make exactly one change to the prompt — the change the table above recommends. Re-run all twenty inputs. Report both pass rates side by side. If it got worse, keep the result and say what you think happened.

4. **Run a swap test and a default audit.** For a prompt you use on real work: run it ten times with an attribute left unspecified and tabulate what the model chose; then run two versions differing in exactly one attribute, five times each, and compare tone, length, and what got explained. Write a paragraph on what you found and the specific edit you made to the prompt in response. If you found nothing, describe how you would have detected a difference if there was one.

## Check your understanding

1. In the safety-policy example, why is the OSHA claim the first thing to check, even though it sounds the most authoritative?
2. A response is entirely accurate but compares all three warehouse sites when you asked only about Site 2. Which dimension failed, and how would the rubric score it?
3. You ask the same model "Is that correct?" and it says yes. How much has that told you?
4. Your pass rate goes from 18 of 30 to 16 of 30 after a prompt change you were confident about. What do you do with that result?

*Answers:* (1) It is specific detail you did not supply and that is not in the source document — the classic fabrication profile — so it needs external verification. (2) Relevance (scope drift); it answers a different question, so relevance scores 0, or 1 at best if the Site 2 answer is clearly separable. (3) Very little: the model is generating a new response conditioned on a context where the claim is already present, and tends to agree with itself. Use a fresh conversation at minimum, ideally an independent source. (4) Keep it and log it: revert or rethink the change, look at which rows newly failed, and treat it as evidence — the evaluation set did its job.
