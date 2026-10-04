---
lesson_id: ai101-06
course_id: ai101
pathway: prompt-engineer
title: Few-Shot Examples and Prompt Chaining
order: 6
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Apply few-shot examples and multi-step prompt chains to tasks a single
    prompt cannot do well
---

## Two ways past the limits of one prompt

Everything so far has assumed one well-built prompt does the job. Often it does. When it does not, the reason is usually one of two things, and each has its own remedy.

Either **you cannot say in words what you want** — the standard is real but tacit, a house style or a labeling judgment you recognize when you see it and cannot fully specify. The remedy is to stop describing and start demonstrating: **few-shot examples**.

Or **the task is genuinely several tasks** — it requires reading a hundred pages, or deciding something and then acting on the decision, or producing a draft and then holding it to a standard. Cramming those into one request produces work that is mediocre at every step. The remedy is decomposition: **prompt chaining**.

The two combine constantly. A chain step that needs a tacit standard gets examples. That is where this lesson ends up.

## Few-shot: showing instead of telling

The vocabulary is simple. **Zero-shot** is instructions only. **One-shot** includes a single worked example. **Few-shot** includes several — typically two to eight input-output pairs — before the real input.

Why it works follows directly from lesson 02. The model predicts the continuation of a sequence. If the sequence is three pairs of the form *input, then output in a particular shape and style*, the most probable continuation of a fourth input is an output in that same shape and style. You are not teaching the model in any lasting sense — nothing is being trained, and the examples vanish when the conversation ends. You are shaping one distribution, on this call.

Here is a task where instructions struggle. A team routes incoming messages into three buckets, but their definition of "urgent" is idiosyncratic: it depends on whether a customer is blocked from working, not on how upset they sound.

Zero-shot attempt:

```text
Classify each message as URGENT, NORMAL, or LOW. Urgent means the
customer is blocked.
```

Run it and you find "blocked" gets interpreted as ordinary English — anything with strong emotion becomes urgent, and a calmly worded total outage becomes normal. The distinction lives in the team's judgment, not in the word.

Few-shot version:

```text
Classify each support message as URGENT, NORMAL, or LOW.

Message: "This is completely unacceptable, third time this month the
report formatting is wrong."
Label: NORMAL

Message: "quick q - where do I change my notification email?"
Label: LOW

Message: "No one on the night shift can log in. We're writing the
schedule on paper."
Label: URGENT

Message: "Invoice PDF has our old logo on it. Not a rush but should be
fixed before we send the quarterly batch."
Label: NORMAL

Message: "Site 2 scanners are offline, nothing is being received"
Label: URGENT

Message: "The export button has been greyed out since this morning and
that's our only way to get the payroll file out."
Label:
```

Sample output:

```text
URGENT
```

Read the examples carefully, because they were chosen, not collected. The first is angry but not blocking, and it teaches that emotion is not the signal. The third is calm but blocking, teaching the converse. The fourth has a deadline but a workaround. Together they draw a boundary that the one-sentence instruction gestured at but could not enforce.

### Choosing examples

The examples are the prompt. Five principles:

**Cover the boundary, not the middle.** Obvious cases teach nothing. Include the pairs that a new hire would get wrong — the angry-but-not-blocked, the calm-but-blocked.

**Keep the format rigidly identical.** Same labels, same field names, same punctuation, same spacing, in every example. Inconsistency in the examples produces inconsistency in the output, and it is the single most common reason few-shot underperforms.

**Balance the labels.** Four `URGENT` examples and one `LOW` biases the model toward `URGENT`. Where the real distribution is genuinely lopsided, note that in the instruction rather than encoding it in the example counts.

**Watch the order.** Models are somewhat sensitive to example ordering, and the last example is the most influential. Do not end on your rarest class. If output looks skewed, shuffling the examples is a cheap diagnostic.

**Use real inputs.** Invented examples are too clean — they lack the typos, the missing punctuation, the half-sentences of real traffic. The messiness is information.

How many? Start with three to five. Add examples only where you can point at a specific error they fix. Beyond eight or so, you are usually spending context on diminishing returns, and if you find yourself wanting thirty, that is a signal pointing toward lesson 08's discussion of when tuning beats prompting.

### When few-shot is not the answer

Instructions are better when the rule is genuinely statable — `dates as YYYY-MM-DD` needs no demonstration. Examples cost tokens on every single call, so at scale a rule that works is cheaper than examples that work. And examples can **over-narrow**: if all five of yours are one sentence long, the model may treat brevity as part of the pattern and truncate a legitimately long answer. Vary the incidental features you do not want copied.

Finally, be careful what you demonstrate. If one example silently omits a field because that input lacked it, you have taught the model that omitting fields is acceptable. Every example is a rule, including the ones you did not mean to write.

### Examples for shape, not just for judgment

Few-shot is not only for tacit standards. It is also the fastest way to lock down an **output shape** that a format description keeps failing to enforce.

If you have written three increasingly detailed paragraphs describing a table layout and the model still varies the column order, stop describing and show two complete rows. A demonstrated shape is followed far more reliably than a described one, because it is the literal pattern the next-token prediction is continuing.

The same applies to edge behavior you have described and not achieved. An instruction that says "use null when the value is absent" is much stronger when one of your examples actually contains an absent value and the demonstrated output actually contains the null:

```text
Input: "Order A-102, Dana Whitfield, 3 crates, 240.00 USD, ordered 2024-03-04"
Output: {"order_id":"A-102","date":"2024-03-04","currency":"USD"}

Input: "following up on B-887 for the pallet jacks, comes to 1,847.50"
Output: {"order_id":"B-887","date":null,"currency":null}

Input: "C-441, 6 crates for Site 2, 3 March, 512 euros"
Output:
```

The second example is doing all the work. It is the one that makes `null` a thing the model has seen happen rather than a thing it has been told about.

### How many examples, actually

Do not decide by intuition. Decide by measurement, using the evaluation habit lesson 07 formalizes: hold ten to twenty real inputs aside, run your prompt with two examples, then four, then six, and score each run. You will typically see a sharp improvement from zero to two or three, a smaller one to five or six, and then noise.

Stopping at the plateau is not fussiness. Every example is paid for on every single call — in tokens, in money, and in the context space you might need for the actual input. A six-example block that scores the same as a three-example block is a permanent tax on the whole system.

## Chaining: splitting the job

A prompt chain is several prompts run in sequence, each taking the previous output as part of its input. You are trading calls, latency, and money for reliability and inspectability — usually a good trade for anything that runs more than once.

Four reasons a chain beats a big prompt:

**Attention.** A prompt with six instructions gets six mediocre attempts. A chain gives each step the model's full effort.

**Inspectability.** When one prompt does everything and the answer is wrong, you have one place to look and no idea where the failure was. When four prompts do it, you read four intermediate outputs and find the bad one in a minute. This is worth more than everything else on this list.

**Different settings per step.** Extraction at temperature `0`, drafting at `0.8`. One prompt cannot have two temperatures.

**Different models per step.** From lesson 03: cheap model for the mechanical step, strong model for the judgment step. Most of the cost savings in real systems come from this.

![A three-step chain: an extract step feeding a decide step feeding a draft step, with the intermediate output visible between each pair and a human review point before the final step](./img/prompt-chain-flow.png)

### Patterns worth knowing

**Sequential pipeline.** Extract, then transform, then format. Each step's output is the next step's input. The common case.

**Map-reduce.** Split a large input into chunks, run the same prompt over each ("map"), then run a combining prompt over the results ("reduce"). This is how you summarize a document that does not fit in the context window. Two details matter: overlap your chunks slightly at the boundaries so a sentence split across two chunks is not lost by both, and make the map prompt output something compact and uniform, because the reduce step has to fit all of them at once.

**Generate then critique then revise.** Step one drafts. Step two, given the draft and an explicit checklist, reports only the problems. Step three revises using the draft plus that list. This works better than asking for a self-corrected draft in one call, because in a single call the critique is generated after the draft is already committed and tends to rationalize it — whereas in step three the criticism is *input*, present in the context before a single revision token is chosen.

**Route then handle.** A cheap classification step decides which of several specialist prompts to run. A billing question and a technical question get genuinely different treatment, and neither prompt has to hedge for the other's case.

**Decide then act.** One step produces a structured decision — a JSON object with a choice and a reason — and a later step consumes it. Keeping the decision in a machine-readable form is what lets you branch, log, count, and audit.

### Passing state between steps

The rule: **the last step should not need the first step's raw input.** If it does, your decomposition is leaking.

Make intermediate outputs structured and minimal. JSON or a rigid template beats prose, because the next prompt can be written against a known shape. Prose intermediates drift, and drift becomes a parsing problem three steps later.

And label the provenance of everything you pass forward. A step receiving both the original document and an earlier extraction should be told which is which:

```text
Below are two inputs.

<<<SOURCE>>> is the original message from the customer.
<<<FACTS>>> is a structured extraction produced from it in an earlier
step. Where the two disagree, trust <<<SOURCE>>>.
```

### The chain's real risk

**Errors propagate and get laundered.** A wrong date extracted at step one is a fact by step three, and every downstream step will treat it with the confidence of an input rather than the suspicion of a guess. Long chains do not average out their errors; they compound them.

Three defenses, all cheap:

- **Validate between steps.** If step one is supposed to return five fields, check that it returned five fields before spending money on step two. This is ordinary programming, not prompting.
- **Keep a null path.** Every step needs a defined output for "I could not do this" — and the next step needs an instruction for what to do when it sees one. Without that, uncertainty gets resolved by invention at the first step and never revisited.
- **Put the human at the highest-leverage point.** Usually just after the step that makes an irreversible or expensive commitment, and just before anything that reaches a customer. A chain with a review point is not a failure of automation; it is what makes automation deployable.

Keep chains short. Three to five steps handles most real work. If you are at nine, look for steps that only exist because an earlier one was under-specified.

### What a chain costs

A chain is not free, and being honest about the price is part of designing one.

**Calls multiply.** Four steps is four requests, four sets of tokens, four opportunities for a network failure. **Latency adds up**, because sequential steps cannot overlap — four steps at two seconds each is eight seconds, which is fine for a batch job and unacceptable behind a button someone is waiting on. And **the same context gets re-sent**, so a chain that passes the full source document to every step can easily cost more in total than the single prompt it replaced.

Three ways to keep the bill sane, all of which you have already met. Pass the *smallest sufficient* intermediate — the extracted JSON, not the original email — which is the same discipline that stops your decomposition leaking. Put the cheap capability tier on the mechanical steps and reserve the expensive one for judgment; this is normally where most of the savings live. And where two steps do not depend on each other, run them at the same time rather than in sequence, which costs the same and takes as long as the slower one.

The map-reduce pattern deserves a specific warning here: mapping over sixty chunks is sixty calls. Done carelessly, summarizing one large document costs more than a whole day of ordinary use. Make the map prompt terse and its output small.

### Debugging a chain

When a chain produces a bad final answer, resist the urge to edit the last prompt — the last step is where you *noticed* the problem, rarely where it started. Work in this order:

1. **Read the intermediates from the top.** Find the first output that is wrong. This takes a minute and is right more often than any amount of theorizing.
2. **Ask whether that step was given what it needed.** Very often the step is fine and the input was already missing something, in which case you have found the real first failure one step earlier.
3. **Fix that step in isolation.** Run it alone, with the exact input it received, until it is right. Do not run the whole chain to test one step.
4. **Re-run the whole chain** on your held-aside inputs to check that the fix did not shift the shape of an output a later step depends on.

This is the payoff of inspectability, and it is why intermediates are worth saving even when the chain succeeds — a stored trace of a good run is what you compare a bad run against.

## A worked chain

Turning a messy customer email into a logged incident record and a reply. One prompt would do all three jobs badly.

**Step 1 — extract**, temperature `0`:

```text
Extract the facts from the message between the <<<MSG>>> markers.

Return JSON with exactly these keys: customer_site (string),
systems_affected (array of strings), people_blocked (integer or null),
first_noticed (string or null), workaround_in_use (string or null).

Use null for anything not stated. Do not infer. Return JSON only.

<<<MSG>>>
Hi - the handheld scanners at Site 2 have been down since this morning.
Six of us can't receive any stock, so we're writing receipts by hand
for now. Can someone look at this today?
<<<MSG>>>
```

Output:

```json
{"customer_site":"Site 2","systems_affected":["handheld scanners"],
"people_blocked":6,"first_noticed":"this morning","workaround_in_use":
"writing receipts by hand"}
```

**Step 2 — decide**, temperature `0`, with the few-shot examples from earlier in this lesson supplying the urgency standard:

```text
Given the extracted facts below, return JSON with exactly these keys:
severity (URGENT, NORMAL, or LOW), reason (one sentence),
needs_human_review (true or false).

Set needs_human_review to true if severity is URGENT, or if
people_blocked is null.

[few-shot examples here]

Facts: [step 1 output]
```

Output:

```json
{"severity":"URGENT","reason":"Six staff cannot receive stock and are
recording by hand.","needs_human_review":true}
```

**Step 3 — draft**, temperature `0.6`, run only after a person has confirmed step 2:

```text
You are a support lead replying to the customer.

Write a reply of 90 words or fewer that acknowledges the specific
systems affected, states that this is being treated as urgent, and asks
exactly one question: whether the scanners were rebooted since the issue
began. Do not promise a fix time. Use only the facts provided.

Facts: [step 1 output]
Assessment: [step 2 output]
```

Now consider what you gained. Step 1 is verifiable against the email by eye. Step 2's decision is a logged, countable record, and its standard lives in one editable place. Step 3 cannot invent a system name because it never saw the raw email. And the review gate sits precisely where a wrong call is expensive — before a customer is told their outage is routine.

## Practice

1. **Build a few-shot classifier for a real judgment.** Choose a categorization you or your team actually make where the rule is partly tacit. Write a zero-shot prompt and test it on ten real inputs; record the errors. Then add four to six examples chosen specifically to fix those errors, keeping the format identical and the labels balanced. Re-test on the same ten. Report both accuracy counts and name the one example that fixed the most.

2. **Break your own few-shot prompt.** Take the working prompt from exercise 1 and make three deliberately damaged copies: one where the example formats are inconsistent, one where the labels are heavily imbalanced, and one where the rarest label is the last example. Run all three on the same ten inputs and record what each did to the results.

3. **Convert a bad single prompt into a chain.** Find a prompt you have written that tries to do three or more things. Decompose it into three or four steps. For each step, write the prompt, state its temperature, name its expected output shape, and define its null output. Run the chain on two real inputs, saving every intermediate. Then compare against the original single prompt on the same inputs and write a short paragraph on what improved and what it cost you in calls and time.

4. **Add critique and a checkpoint.** Take the chain from exercise 3 and insert a critique step that receives the draft plus an explicit checklist and returns only a list of problems, followed by a revision step that takes both. Run it. Then deliberately corrupt one field in the first step's output, run the chain again, and record how far the bad value travelled and which of your validation checks — if any — caught it. State where you would place the human review point and why.

## Check your understanding

1. Your few-shot classifier labels every angry message URGENT. What is the most likely problem with your examples, and how do you fix it?
2. Give two reasons why "generate, then critique, then revise" across three calls works better than asking for a self-corrected draft in one call.
3. In the worked chain, why can step 3 not invent a system name?
4. A chain's final reply contains a wrong date. Where do you start looking, and why not the last prompt?

*Answers:* (1) The examples do not cover the boundary — include angry-but-not-blocked and calm-but-blocked messages, keep their format identical, and balance the labels. (2) The critique is generated separately rather than rationalizing a draft already committed in the same response, and in the revision step the criticism is already present as input before any revision token is chosen; you can also inspect the critique. (3) It never sees the raw email — only the extracted facts and the assessment — and is told to use only the facts provided. (4) Read the intermediates from the top and find the first wrong output; the last step is where you noticed the error, rarely where it started.
