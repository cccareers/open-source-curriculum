---
lesson_id: ai101-03
course_id: ai101
pathway: prompt-engineer
title: Capabilities, Limitations, and Model Choice
order: 3
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Describe what current generative models are reliably good at, where they
    fail, and how to choose a model for a task
---

## The question behind the question

"Is AI good at this?" is not a useful question. "Good at" hides the thing that actually decides whether you can ship: **how bad is a wrong answer here, and how cheaply can I detect one?**

Some tasks are forgiving. A first draft of an email that comes back mediocre costs you thirty seconds and a rewrite. Some tasks are unforgiving. A dosage, a legal deadline, a customer's account balance — wrong is expensive and often invisible until later. The same model, at the same quality, is a fine tool for the first and a liability for the second.

So this lesson gives you three things: a map of what current generative models do reliably, a map of the specific ways they fail, and a procedure for picking a model once you know which map you are standing on. The names you will see here — ChatGPT, Claude, Gemini — are the widely used general-purpose chat assistants, and the reasoning transfers to whatever their successors are called, because the axes you choose along change much more slowly than the products do.

## What they are reliably good at

The strongest pattern: **models are best when the information is already in front of them and the work is transformation.** Ranked roughly by how much you can trust the output with light checking:

**Transformation of text you supplied.** Rewriting for tone, changing reading level, converting prose to a table, translating between formats, tightening or expanding a passage, fixing grammar. The source material is in the context window, the model's job is to restate it, and errors are usually visible on a read-through. This is the highest-confidence category by a wide margin.

**Summarization and extraction from provided text.** Condensing a document you pasted, pulling every date or dollar amount out of a contract, turning meeting notes into action items. Reliable, with one caveat you must design around: the model may quietly include something that was not in the source. Checking summaries against the source is a real step, and lesson 07 makes it systematic.

**Classification and routing.** Deciding whether a support ticket is billing, technical, or account access. Tagging sentiment. Flagging whether a paragraph mentions a competitor. Well-defined categories plus a handful of examples gets you accuracy that is often competitive with a human doing the same repetitive labeling, and unlike a human it does not degrade at hour six.

**Drafting from a brief.** Emails, job descriptions, outlines, test plans, documentation skeletons, boilerplate code. The value here is the blank page problem, not final quality. A draft that is 70% right and takes you five minutes to fix beats forty minutes of staring.

**Explanation and rephrasing of well-established material.** Explaining a common concept at a chosen level, generating analogies, producing practice questions. Strong on the settled and long-documented, weaker as the subject gets more niche or more recent.

**Code assistance in widely used languages.** Writing small functions, explaining unfamiliar code, translating between languages, generating tests, diagnosing an error message. Strong on common patterns, and it has the enormous advantage that you can *run* the output — a verification channel most tasks do not offer.

**Ideation and volume.** Forty subject lines, twenty edge cases you have not considered, ten counterarguments. Here even a low hit rate is fine, because you are the filter and the cost per bad idea is zero.

Notice what the strong categories share: the input is present, the output is checkable, and a mistake is cheap or visible.

## Where they fail

These are not rumors about one bad model. They are structural, they follow from the next-token mechanism in the previous lesson, and every current model has them to some degree.

**Fabrication.** The failure that will bite you first. A model asked for something it does not have will often produce a fluent, well-formatted, entirely invented answer: a citation that does not exist, a function in a library that was never written, a statistic with a plausible source attached. It happens because the system is optimizing for plausible continuation, and a plausible-looking citation is a good continuation regardless of whether the paper exists. The tell is *specificity without a source in the context*. Precise-looking detail that you did not supply and the model cannot have looked up is exactly where to check.

**Confidence is uninformative.** The prose tone of a wrong answer looks identical to the prose tone of a right one. You cannot use certainty language as a quality signal. Asking a model how confident it is produces another generated sentence, not a measurement — though asking it to *name what it is unsure about* sometimes surfaces genuinely useful flags.

**Arithmetic and counting.** Multi-digit multiplication, percentage chains, summing a column, counting items or characters. It gets many of these right and some of them wrong in ways that look right. Any number that matters should be produced by a calculator or a script, or at minimum recomputed.

**The knowledge cutoff.** Training ended on a date. Anything after it is unknown unless a search tool is attached or you paste it in. Worse, models are frequently wrong about *what* their cutoff is, and about today's date. Never ask a bare model about current events, current prices, current versions, or current staff.

**Anything private.** Your company's policies, your codebase, last quarter's numbers, a specific customer's history. None of it is in the model. It will still answer, generically or invented. If you did not put it in the context, it is not there.

**Long chains of dependent reasoning.** Each step conditions on the previous ones, so an error at step three is inherited by steps four through nine and rationalized rather than caught. Puzzles with many interacting constraints, long proofs, and intricate multi-hop deductions are the weak spot. Decomposition helps a great deal, which is the subject of lesson 06.

**Faithfulness to fiddly constraints.** Exact word counts, "use every one of these fifteen terms", rigid templates over long outputs, "never mention X". Compliance degrades as output length and constraint count grow. Verify mechanically rather than trusting.

**Self-knowledge.** A model's account of its own architecture, training data, limits, or reasoning is generated text about itself, not introspection. Treat it as unverified.

**Inconsistency.** Sampling means the same prompt can produce a different answer, including a differently *correct* answer. If you test once and ship, you have measured one sample.

**Bias inherited from training data.** Defaults about who occupies which role, which dialect reads as "professional", which region is the unmarked case. This is a quality problem with real consequences, and lesson 07 treats detecting and acting on it as a skill in its own right.

## Choosing a model

Once you know what the task needs, selection stops being about brand loyalty. Six axes, roughly in the order they eliminate options:

**1. Modality.** Does the task need to read images, produce images, handle audio, or accept a PDF? Modality is usually a hard filter — a text-only model cannot be prompted into reading a screenshot.

**2. Context window.** Estimate your largest realistic input in tokens (words ÷ 0.75), add your expected output, and add headroom. A 40-page document is roughly 20,000 words, so about 27,000 tokens, and it will not fit anywhere near a small window. If nothing fits, the answer is not a bigger model — it is chunking the input, which lesson 06 covers.

**3. Capability tier.** Every provider ships a range: small and fast, mid, and large or reasoning-focused. Larger models are better at multi-step reasoning, unusual formats, and long instructions; they cost more and answer slower. The right starting move is almost always to prototype on a strong model to find out whether the task is achievable at all, then try to move down a tier and measure whether quality actually dropped. Guessing the tier up front wastes money in one direction and time in the other.

**4. Cost.** Priced per token, usually with input and output priced differently and output costing several times more. The number that matters is **cost per completed task**, not per million tokens. A cheap model that needs three attempts and a review is not cheap. Multiply by volume before you have an opinion: a two-cent task is nothing once and $200 at ten thousand a day.

The full arithmetic includes two costs that never appear on the invoice: the **retry cost** when an answer is unusable, and the **verification cost** — the human minutes spent checking. On a task where a person must read every output carefully, verification usually dwarfs the API bill, which flips the calculation entirely. It can be correct to pay four times more per call for a model whose output needs a glance rather than a review. Lesson 08 does this arithmetic with real numbers.

**5. Latency.** A user waiting on a screen tolerates a couple of seconds; an overnight batch tolerates minutes. Streaming — showing tokens as they arrive — changes *perceived* latency without changing total time, and is often the cheapest fix for an interactive feature.

**6. Constraints that are not technical.** Where data may be processed, what your organization has approved, whether the provider trains on your inputs by default, and what happens when one vendor has an outage. These regularly override every axis above them, and finding out late is expensive.

A worked comparison. Two tasks that a beginner would assume need the same model:

| | Tag 50,000 support tickets by category, nightly batch | Draft an incident summary for an executive from a messy 30-page log |
| --- | --- | --- |
| Modality | Text | Text |
| Context needed | Small — one ticket at a time | Large — the whole log |
| Capability tier | Small model, with a few examples | Strong model; judgment and synthesis |
| Cost sensitivity | Very high — 50,000 calls | Low — a few per week |
| Latency | Irrelevant, runs overnight | Minutes are fine |
| Choice | Cheapest model that passes an accuracy bar you measured | Largest context, strongest reasoning available |

Same organization, same day, two different correct answers. That is the normal case.

### Two things that complicate the picture

Modern assistants are not always a bare model, and the difference matters for what you can expect.

**Tools change the limitation, not the model.** When a product can search the web, run code, or read a file you uploaded, several of the failures above are genuinely mitigated: search partially addresses the knowledge cutoff, a code interpreter fixes arithmetic properly by actually computing. But this is architecture around the model, not a smarter model, and it brings its own failure mode — the model still has to decide *whether* to use the tool and how to read what comes back. A search-enabled assistant can still answer from memory when it should have looked, and can still summarize a retrieved page inaccurately. Know which capabilities are switched on in the product you are using, because it changes what you must verify.

**Reasoning-focused variants trade time for depth.** Several providers ship models that generate an extended internal working-out before answering. They are meaningfully better on multi-step problems and meaningfully slower and dearer. They do not fix fabrication; a longer chain of reasoning about something the model does not know produces a more elaborate wrong answer. Reach for them when the difficulty is *structural* — many interacting constraints — not when it is *factual*.

### Making the choice stick

Two habits make this durable. **Build a small task-specific test set** — ten to thirty real inputs with known good outputs — and run any candidate model against it. Vendor benchmarks tell you about the vendor's benchmark; your thirty examples tell you about your job. And **write the prompt so the model is swappable**: keep the model name in one place in your notes or config, avoid leaning on quirks of one provider's phrasing, and re-run your test set when you switch. Models get replaced on the vendor's schedule, not yours.

## A short worked probe

You can learn a model's edges in ten minutes by probing them deliberately.

A weak probe:

```text
Are you good at math?
```

This asks the model to generate a sentence about itself — a self-knowledge question, which is exactly the thing it is unreliable at. You will get a hedged paragraph and learn nothing.

A strong probe:

```text
Answer with the number only, no working shown.

What is 4,178 x 6,394?
```

Then check it against a calculator, and run it three times. Sample output across three runs:

```text
26,714,132
26,714,132
26,713,832
```

The correct product is 26,714,132. Two runs right, one wrong, all three delivered with identical confidence and no signal distinguishing them. That single experiment teaches you more about the arithmetic limitation, the inconsistency limitation, and the uselessness of confidence than any amount of reading — and it is a template you can point at any capability you are unsure about.

## Practice

1. **Build a capability map for your own work.** List eight tasks you actually do in a normal week. For each, write the task, whether the needed information would be inside the prompt or expected to come from the model's training, how you would detect a wrong answer, and what a wrong answer would cost. Then sort them into "delegate freely", "delegate and verify", and "do not delegate", and defend the two closest calls in a sentence each.

2. **Probe four limitations.** Design one prompt each to expose fabrication, arithmetic error, the knowledge cutoff, and constraint-following failure. Run each three times in fresh conversations. Record the outputs verbatim and mark which were wrong. For each limitation, write one sentence on how a person who did not know about it would have been fooled.

3. **Make a selection decision and justify it.** For each of these three scenarios, choose a capability tier and name the axis that decided it: (a) a browser tool that rewrites a sentence as you type, used a few thousand times a day; (b) a weekly job summarizing every clause in a set of 60-page vendor contracts; (c) an internal helper that routes incoming email into six folders. Write no more than three sentences per scenario, and for each state the one measurement you would take before committing.

4. **Build a ten-item test set.** Pick one real recurring task from exercise 1. Collect ten genuine inputs and write the output you would accept for each. Run all ten through two different models or two capability tiers. Score each output pass or fail against your own accepted answer, and report the two pass rates plus one sentence on which model you would use and why. Keep the file — you will reuse this test set in lesson 07.
