---
lesson_id: PREAPP-W4-02
course_id: PREAPP-W4
pathway: tech-pre-apprenticeship
title: Working with LLMs
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
objectives:
  - Prompt Claude and ChatGPT with structure, comparing outputs and judging fitness for purpose
  - Structure prompts with role, context, task, and output format
---

## The gap between a question and a prompt

Most people type into Claude or ChatGPT the same way they type into a search bar: a short line, no context, and a hope that the model guesses right. Sometimes it does. More often you get something plausible, generic, and unusable — and because it reads well, you waste ten minutes editing it before admitting it was never close.

A prompt is not a question. A prompt is a **brief**. When you hand work to a new teammate, you tell them who they are on this job, what they need to know, what you want done, and what form the finished thing should take. Do less than that and you get back whatever they assumed. Models behave the same way, except they never ask a clarifying question unless you invite one — they just fill the gaps with the most average answer available.

Today you build every prompt out of four named parts, run them in both Claude and ChatGPT, and get honest about which output you would actually stake your pipeline on.

## Role, context, task, output format

**Role** tells the model whose judgment to apply. "You are a sales development rep at an early-stage software company selling to operations managers" narrows the vocabulary, the assumptions, and the level of detail. Skip it and the model writes as a generic assistant, which is why unroled output sounds like a brochure.

**Context** is the raw material — the facts the model cannot know. The company, the person, what you already tried, what happened last time, the constraint you are under. This is where most prompts fail: people ask for a personalized message and supply nothing to personalize with. If the only thing the model knows is the job title, the only thing it can write is a job-title message.

**Task** is the single verb you want performed. Write, summarize, compare, rewrite, list, critique. One task per prompt. When you stack three tasks into one ask, the model does the first one well and the other two thin.

**Output format** is the shape you want back. Three bullets. A subject line under fifty characters and a body under ninety words. A table with these columns. A numbered list where each item names a source. Specifying format is the cheapest quality gain available to you, because it converts a vague standard into something you can check at a glance.

Here is the same request, before and after.

```text
Write me a cold email for a prospect at Northwind Logistics.
```

```text
ROLE: You are a sales development rep at a small warehouse-software
company. You sell to operations managers at regional logistics firms.

CONTEXT: Prospect is Dana Ruiz, Director of Operations at Northwind
Logistics, a 140-person regional carrier. Their careers page lists four
open dispatcher roles. I have not contacted her before. Our product
cuts manual dispatch scheduling time.

TASK: Draft a first-touch email that opens on the hiring signal, not on
our product.

OUTPUT FORMAT:
- Subject line, under 50 characters
- Body, under 90 words, no bullet points
- One question at the end that is answerable in a sentence
- Below the draft, list every factual claim the email makes
```

That last format line matters more than it looks. Asking the model to list the claims it made turns an unverifiable paragraph into a checklist you can work through in thirty seconds. You will use that trick all week.

## Running the same prompt in two models

The program uses both Claude and ChatGPT, and you should treat that as an advantage rather than a chore. Two capable models given identical input produce meaningfully different work, and the differences are where your judgment gets exercised.

Paste the structured prompt above into both, unchanged. Change nothing between runs — same wording, same context, no follow-ups. If you edit the prompt between models you are comparing your edits, not the models.

Then read both outputs looking for specific differences rather than a general vibe:

- **Length and density.** Did one respect the ninety-word cap and the other drift past it? Format compliance is a real signal.
- **Invented specifics.** Did either name a metric, a customer, a dollar figure, or a detail about Northwind that you never supplied? Circle it. That is a fabrication, and it does not matter how good the sentence is.
- **Tone.** Does one sound like a person and the other like marketing copy? Read both aloud. The one you would be embarrassed to have read back to you on a call is the one that loses.
- **The question at the end.** Is it actually answerable in a sentence, or is it a disguised pitch?
- **Claim list quality.** Did the model honestly enumerate its own claims, or did it list two and skip the third?

## Judging fitness for purpose

Fluency is not fitness. Models are extremely good at sounding right, and that is precisely the trap. The output that reads most smoothly is often the one carrying the most unsupported specifics, because confident writing and hedged writing sound different even when they are equally uninformed.

Judge on these four, in this order:

1. **Verifiability.** Can you check every factual claim against something real — the careers page, the company site, the person's profile? Anything you cannot check gets cut or verified before the message goes out. This is the first gate, and it outranks everything below it.
2. **Task fit.** Did it do the task you asked for? A beautiful product pitch is a failure when you asked for an opener on a hiring signal.
3. **Format compliance.** Did it hold the constraints? A model that ignores an explicit ninety-word cap will ignore your other instructions too.
4. **Tone and authenticity.** Would you send this under your own name, to this specific person?

Then pick — and be able to say why in one sentence. "ChatGPT's version was tighter but invented a headcount figure, so I took Claude's and shortened it myself" is a real judgment. "ChatGPT's just sounded better" is not, and it will not survive a question from your instructor.

Fitness also depends on the job. For summarizing a long page into three checkable bullets, you want the model that stays close to the source. For rewriting a stiff paragraph into your own voice, you want the one with the better ear. There is no permanently better model, only a better model for this task — which is why you run both and keep notes.

## Building a prompt library

By Friday you will have written a lot of prompts, and rewriting them from memory each morning is exactly the kind of waste this week is about eliminating. Keep a running document. For each prompt worth reusing, save: the full four-part prompt, which model you ran it in, one line on what the output was good for, and one line on what it got wrong. That document is the raw material for your automation project on Thursday — a prompt you run more than three times a week is an automation candidate.

## Practice

Work these against your own live pipeline, not sample data.

1. **Rewrite three vague prompts.** Take three one-line asks you have actually typed into a model this month. Rewrite each into the four-part structure with real context from your pipeline. Label the four parts explicitly so an instructor can see them.
2. **Run the head-to-head.** Take your strongest rewritten prompt and run it unchanged in both Claude and ChatGPT. Save both outputs side by side in one document.
3. **Score both outputs** against the four criteria — verifiability, task fit, format compliance, tone. Mark every invented specific with a highlight and note how you would verify it.
4. **Write your one-sentence verdict.** Name which output you would send, why, and what you would still change by hand before sending it.
5. **Break a prompt on purpose.** Take your best prompt, delete the output format section, and rerun it in the same model. Write two sentences on exactly what degraded. Keep this for the group debrief.
6. **Start your prompt library.** Save the two prompts from today that you expect to reuse, each with its model, its use, and its known weakness.
