---
lesson_id: ai101-02
course_id: ai101
pathway: prompt-engineer
title: How Generative AI Models Work
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Explain in plain language how a generative AI model turns a prompt into a
    response, and what a token, a context window, and a temperature setting each
    control
---

## One sentence, then the details

A generative language model is a very large statistical function that takes a sequence of text and predicts what text comes next, one small piece at a time, and then feeds its own prediction back in and does it again.

That is genuinely the whole mechanism. Everything that follows in this lesson is an unpacking of four words in that sentence — *sequence*, *piece*, *predicts*, and *again* — because each one corresponds to a control you will use for the rest of your career: the context window, the token, the probability distribution, and the sampling loop.

It is worth saying plainly what the sentence does **not** contain. There is no database of facts being searched. There is no reasoning engine consulting rules. There is no memory of you between conversations unless a product feature deliberately adds one. When you send a message to ChatGPT, Claude, or Gemini, you are not querying a knowledge base; you are handing a text sequence to a function and asking it to continue that sequence plausibly. Hold on to that, because it explains far more behavior than any amount of anthropomorphizing will.

## Tokens: the unit the model reads and writes

The model does not see letters, and it does not see words. It sees **tokens** — chunks of text drawn from a fixed vocabulary, typically somewhere around 50,000 to 200,000 entries depending on the model. A token is usually a common word, a word fragment, a piece of punctuation, or a run of whitespace.

Rules of thumb that hold up well enough for planning:

- In ordinary English, **one token averages about four characters**, or roughly **0.75 words**. A hundred words is around 130 tokens.
- Common whole words are single tokens. `the`, `city`, `apple` each cost one.
- Rare, technical, or invented words get split. `Tokenization` might arrive as `Token` + `ization`. A product code like `XJ-4471B` might become five or six tokens.
- Non-English text is usually less efficient — the same meaning can cost two or three times more tokens in a language the vocabulary was not optimized for.
- Whitespace and punctuation are tokens too. The leading space in ` city` is normally part of the token.

Here is the same sentence shown as a model might split it, with `|` marking the boundaries:

```text
The| quick| brown| fox| jumps| over| the| lazy| dog|.
Un|remark|ably|,| tok|eniz|ation| of| rare| words| costs| more|.
```

Ten tokens for the first sentence, thirteen for the second, even though the second sentence has only seven words to the first's nine. That asymmetry is the first practical consequence: **you are billed and limited in tokens, not in words**, so dense jargon and unusual identifiers cost you more than plain prose saying the same thing.

The second consequence is subtler and worth internalizing early. Because the model never sees individual characters inside a token, character-level questions are structurally awkward for it. Asking "how many letter R's are in this word" or "reverse this string" is asking a system that perceives `straw` + `berry` to reason about something it cannot directly observe. It will often get it right anyway, by pattern rather than by counting, and it will sometimes get it confidently wrong. That is not a bug in a particular model; it falls out of the representation.

## Prediction: from a sequence to a distribution

Give the model a sequence of tokens. It runs them through its network and produces, for **every single token in its vocabulary**, a number saying how likely that token is to come next. Not one answer — a full ranked distribution over tens of thousands of candidates.

Suppose the sequence so far is `The capital of France is`. A plausible distribution over the next token:

```text
" Paris"        0.91
" the"          0.03
" a"            0.01
" located"      0.01
" now"          0.004
...  (tens of thousands more, each near zero)
```

Now suppose the sequence is `My favorite color is`. The distribution is much flatter:

```text
" blue"         0.24
" green"        0.15
" red"          0.12
" purple"       0.09
" black"        0.07
...
```

Same machinery, different shape. A **peaked** distribution means the context strongly determines what comes next — factual completions, closing brackets in code, the second half of a fixed phrase. A **flat** distribution means many continuations are about equally reasonable — creative writing, open opinion, the start of a list.

This is where those numbers come from: the model was trained by being shown enormous quantities of text with the next token hidden, guessing it, and being adjusted whenever it guessed badly. Repeat that a staggering number of times and you get a function whose guesses encode a great deal about grammar, facts, formats, styles, and the shape of arguments — because all of that helps predict text. Training ends at some point. After that the weights are frozen, which is why every model has a **knowledge cutoff** and why the model has no way to know what happened last week unless you put it in the prompt or the product wraps a search tool around it.

![A prompt is split into tokens, the model produces a probability distribution over the next token, one token is sampled, and the loop repeats with that token appended](./img/next-token-prediction.png)

## The sampling loop, and what temperature controls

Having a distribution is not the same as having an answer. Something has to **choose** a token, and that choice is where your settings live.

The simplest strategy is *greedy*: always take the highest-probability token. It produces flat, repetitive text and tends to fall into loops. So real systems sample randomly from the distribution, and give you knobs to reshape it first.

**Temperature** rescales the distribution before sampling. Low temperature exaggerates the differences between candidates, making the likely ones even more likely; high temperature flattens the differences, giving unlikely candidates a real chance. The allowed range depends on the provider — commonly `0` to `1` or `0` to `2` — and on either scale `1` means "use the distribution as computed".

Take the flat `My favorite color is` example. Roughly what happens at three settings:

| Setting | Effect on the distribution | Behavior you observe |
| --- | --- | --- |
| `temperature: 0` | Collapses to the single top choice | Nearly deterministic. Same prompt, same output, run after run. |
| `temperature: 0.7` | Mild sharpening | Sensible variety. The common default for chat. |
| `temperature: 1.4` | Substantial flattening | Surprising word choices, more novelty, more drift and more errors. |

A related knob you will meet is **top-p** (nucleus sampling), which trims the candidate list to the smallest set whose probabilities add up to `p` — say 0.9 — and samples only from that. Temperature changes the *shape* of the distribution; top-p changes *how much of the tail is allowed to exist*. Many interfaces expose both. Change one at a time.

The practical guidance is boring and correct:

- **Extraction, classification, data cleanup, code, anything you will compare across runs:** temperature at or near `0`.
- **Drafting, brainstorming, naming, rewriting for tone:** `0.7` to `1.0`.
- **Deliberate weirdness:** above `1.0`, and expect to throw work away.

One trap: low temperature buys you *consistency*, not *correctness*. A confidently wrong answer at temperature `0` is wrong the same way every time. Turning the dial down makes a model repeatable, never truthful.

Once a token is sampled it is **appended to the sequence** and the whole process runs again with the longer sequence as input. The model does not plan the paragraph and then type it. Each token is chosen with the previous ones visible and none of the later ones decided. That is why asking a model to "think through the steps before answering" changes results: the intermediate text it produces becomes part of the input for every token after it, so reasoning it has actually written down is available to condition on, while reasoning it never wrote is not.

It is also why a model rarely backtracks. Once a wrong turn is in the sequence it is context, and the most plausible continuation of a confident wrong sentence is a confident wrong paragraph defending it. Starting a fresh conversation is often more effective than arguing, because it removes the bad tokens from the input rather than adding more on top.

### Where the loop stops

Generation does not run forever. It ends in one of three ways, and telling them apart saves you real debugging time.

The model can emit a special **end-of-turn token**, its learned signal for "this response is complete". That is the normal, healthy ending. Or generation hits a **maximum output length** set by the interface or by you, in which case the text simply stops — sometimes mid-sentence, sometimes mid-bracket. Or the application supplies a **stop sequence**, a string that means "cut here", used to keep a model from continuing past a structure you want.

The second case is the one that fools people. Output truncated by a length cap looks exactly like a model that lost the thread, and the instinct is to rewrite the prompt. The fix is to raise the cap or ask for a shorter answer. Lesson 08 shows you the field in an API response that tells you which of the three actually happened.

### Why the same prompt gives different answers

Now you can explain something that mystifies most new users. Ask a model the same question twice and get two different replies — not two contradictory facts necessarily, but different wording, different structure, sometimes different substance.

Nothing has changed about the model. Its weights are frozen. What changed is that sampling drew a different token somewhere early, and every subsequent token was then conditioned on a slightly different sequence. Small divergence at token nine becomes a visibly different paragraph by token ninety.

Two consequences you will lean on for the rest of the course. Testing a prompt once tells you about one sample, not about the prompt. And when you genuinely need repeatability, the lever is temperature — with the caveat already stated, that repeatable and correct are different properties.

## The context window

The **context window** is the maximum number of tokens the model can have in front of it at once — your instructions, any documents you pasted, the entire conversation so far, *and* the response it is generating. It is one budget covering all of it.

Sizes vary widely by model, from a few thousand tokens on small older models to hundreds of thousands or more on current large ones. Whatever the number, three facts about it matter.

**Everything counts.** In a chat interface, the whole visible conversation is normally resent on every turn. That is why a long conversation feels slower and costs more near the end: each new message is being processed alongside all the previous ones.

**Running out has consequences.** Depending on the system, exceeding the window either errors outright or silently drops the oldest content. Silent dropping is the dangerous one, because the symptom is a model that "forgets" the instruction you gave it forty messages ago — an instruction that is genuinely no longer in the input.

**Big is not the same as attentive.** Material in the middle of a very long context tends to be used less reliably than material at the beginning or end. If a constraint truly matters, restate it near your actual request rather than trusting that it survives from page one.

There is no memory outside this window. When a product says an assistant "remembers" your preferences, some feature is storing them and re-inserting them into the context on later turns. It is plumbing, not recall.

## Putting the mental model to work

A quick worked example. A learner writes:

```text
Write about our new scheduling app.
```

The sequence is short and the topic is wide open, so the distribution at nearly every step is flat. What comes back is generic marketing prose — not because the model failed, but because you asked for a continuation of an under-determined sequence and it gave you the most average one.

Now the improved version:

```text
You are writing a product update note for existing customers.

Product: ShiftLine, an internal scheduling app used by shift managers
at three warehouse sites.
New in this release: managers can now copy last week's schedule into
the current week, and staff receive a text message when their shift
changes.

Write 120-150 words, plain language, second person, no exclamation
marks. End with a single sentence telling readers where to send
feedback: the #shiftline channel.
```

Sample output:

```text
ShiftLine's latest update focuses on the two things you told us cost
you the most time each week. You can now copy last week's schedule
straight into the current week, then adjust only the shifts that
actually changed, instead of rebuilding the grid from scratch every
Monday. Staff no longer have to check the board to find out about a
change: when you move or reassign a shift, the affected person gets a
text message right away, with the new day and start time.

Both changes are live now at all three sites, and neither requires any
setup on your part. If something looks wrong or you have an idea for
what we should tackle next, send it to the #shiftline channel.
```

Read that improvement in terms of the mechanism, not in terms of politeness. Every added line is context that **sharpens the distribution** at each step: naming the audience narrows the register, listing the two features removes the model's need to invent any, and stating a word count and a closing sentence constrains the shape of the ending. You did not ask more nicely. You gave the prediction function more to condition on.

## Practice

Work through all four. You can use any chat assistant you have access to; where a setting is not exposed in the interface, note that and reason about the expected effect instead.

1. **Count tokens by hand, then check yourself.** Take a 100-word paragraph of your own writing that contains at least three unusual words — a product name, an acronym, a technical term. Estimate its token count using the 0.75-words-per-token rule. Then check it with a tokenizer tool — several providers publish one that shows the exact split for their models. If you cannot find one, you can ask a chat assistant to split and count, but treat its answer as a second estimate rather than a measurement: from lesson 03, counting and describing its own internals are exactly what a model does unreliably. Compare, and write two sentences on where your estimate was off and why.

2. **Make the distribution peak and flatten.** Write one prompt whose next token is nearly forced (a well-known fact, a fixed phrase) and one whose next token is wide open (an opinion, a creative opening line). Run each three times in fresh conversations. Record which one gave you identical or near-identical output each time, and explain the result in terms of distribution shape.

3. **Move the temperature.** Using a playground or API console that exposes the setting, run this exact prompt at `0`, at `0.7`, and at `1.5` (or the highest value your tool allows, if it caps below that), three times each: `Give a name for a mobile app that helps warehouse staff swap shifts. Reply with the name only.` Put the nine results in a table. Then state which setting you would ship for a naming brainstorm and which for generating a product code, and say why in one sentence each.

4. **Exhaust a context window on purpose.** Start a fresh conversation with a specific, checkable instruction — for example, `For the rest of this conversation, end every reply with the word BANANA.` Then have a long, ordinary conversation of at least thirty exchanges about anything. Every ten messages, note whether the instruction is still being followed. Write a short paragraph on what you observed, and describe one change to how you would place that instruction if it genuinely had to hold for a hundred messages.

## Check your understanding

1. A 300-word paragraph full of part numbers and acronyms comes back at far more than 400 tokens. Why?
2. You set temperature to `0` and get the same wrong answer five times in a row. What does that tell you about temperature?
3. Forty messages into a conversation, the assistant stops following an instruction you gave in your first message. Name two possible causes, and one change that would make the instruction hold.
4. A response ends mid-sentence. Before rewriting the prompt, what should you check?

*Answers:* (1) The 0.75-words-per-token rule holds for ordinary prose; rare and invented strings split into several tokens each. (2) Low temperature makes output repeatable, not correct — it picks the same top candidate every time, even when that candidate is wrong. (3) The instruction may have been silently dropped when the conversation outgrew the context window, or it may simply be attended to less because it sits far from your latest request; restate it near the request (or put it in the system prompt, lesson 04). (4) Whether generation hit a maximum output length rather than ending naturally — raise the cap or ask for less.
