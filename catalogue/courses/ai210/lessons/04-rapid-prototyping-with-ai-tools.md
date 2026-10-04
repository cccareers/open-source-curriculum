---
lesson_id: ai210-04
course_id: ai210
pathway: prompt-engineer
title: Rapid Prototyping with AI Tools
order: 4
kind: lesson
competency_ids:
  - D4-S1-C02
objectives:
  - Produce a low-fidelity prototype of an AI-powered solution quickly and
    iterate it on evidence
---

## Prototypes are questions, not small products

A prototype is not a first draft of the build. It is an instrument for answering a question you cannot answer by arguing. That distinction decides everything else: what you make, how rough it can be, how long you spend, and when you throw it away.

Before you make anything, write the question down. "Will operators trust a draft reply they did not write?" is a question. "Can the model produce a usable summary from these documents?" is a question. "Build a prototype of the thing" is not, and a prototype built without a question tends to grow into a small, fragile, unfinished product that nobody can evaluate and nobody wants to delete.

Prototypes are especially load-bearing in AI work because two of the biggest unknowns cannot be reasoned about from a specification. The first is output quality on the client's actual messy inputs, which no amount of discussion will predict. The second is how it feels to work with a system that is usually right — a thing people are famously bad at imagining until they have done it for ten minutes. A prototype converts both from opinion into observation, cheaply, before the estimate is committed.

## The riskiest assumption goes first

You cannot prototype everything, and you should not try. Go back to the assumptions section of your requirements document and rank each assumption on two axes: how badly the project fails if it is wrong, and how uncertain you are about it. The one that scores highest on both is what this prototype is for. A simple way to rank: score each axis from 1 to 5 and multiply. "Operators will accept a machine-drafted reply" at impact 5, uncertainty 4 scores 20; "the data fits in one prompt" at impact 3, uncertainty 2 scores 6. Prototype the 20 first.

Typical top-of-list assumptions in AI-powered work:

- The model can produce output of acceptable quality from the client's real, unclean inputs.
- Operators will accept a machine-drafted output rather than rewriting it from scratch.
- The interaction fits into the ten seconds an operator actually has per item.
- People will notice and correct a wrong output rather than passing it along.
- The output is understandable to the person on the receiving end.

Each of those needs a different prototype. The first needs no interface at all — a folder of real inputs, a prompt, and a spreadsheet of results answers it in an afternoon. The second and fourth need an interface but no working model. Building a system that does both at once takes ten times as long and answers neither question cleanly, because when it disappoints you will not know which half disappointed.

## The fidelity ladder

Fidelity is not quality. A low-fidelity prototype is not a bad prototype; it is one that deliberately leaves out everything not needed to answer the question. Climb the ladder only when the rung you are on stops answering.

![A ladder of prototype fidelity from sketch to functional slice, showing what each rung answers and what it costs](./img/prototype-fidelity-ladder.png)

**Rung 1 — Sketch.** Pen and paper, or a whiteboard photo. Minutes. Answers: does this flow make sense at all, and have we agreed on what we are talking about? Sketches are also the cheapest way to hold a design conversation with a client, because nobody is afraid to disagree with a drawing that took two minutes.

**Rung 2 — Wireframe.** A structural layout of each screen: what is on it, in what hierarchy, in what order, with real labels. Still grey boxes and text, no color, no styling. Answers: is the right information present, is anything missing, is the sequence right?

**Rung 3 — Clickable low-fidelity prototype.** The wireframes linked so a person can move through the flow by clicking. Answers: does the sequence hold up when someone drives it, where do people hesitate, what do they expect to happen next?

**Rung 4 — Wizard of Oz.** The interface is fake; a human behind the curtain produces the output. Answers: how does the interaction feel when it works, and what do people do with the output? This is the rung most teams skip, and it is the highest-value rung in AI design, because it separates "is the interaction right?" from "is the model good enough?" entirely.

**Rung 5 — Content prototype.** No interface: real inputs, real prompts, real outputs, collected in a document or spreadsheet. Answers: is the output good enough, and what does a bad one look like? Runs happily in parallel with rungs 1–4 and is usually the fastest route to a hard number.

**Rung 6 — Functional slice.** One narrow path, genuinely working end to end. Expensive. Justified only once the flow and the output quality are both settled and the remaining question is whether the pieces hold together.

Two rules keep the ladder honest. **Never climb a rung to impress someone** — a polished prototype invites feedback about the polish and suppresses feedback about the idea, which is precisely the feedback you came for. And **say the fidelity out loud** every time you show one, because a client who thinks they are seeing a nearly finished product will react to it as one.

## Working tool-neutrally

You do not need a design tool to build any of rungs 1 through 5. What you need is a way to make a layout, a way to link layouts together, and a way to run real inputs through a prompt.

- **Sketches and wireframes**: paper, a whiteboard, a slide deck, a document. Slides are an underrated wireframing tool: one slide per screen, boxes and text, and the deck itself gives you the sequence.
- **Clickable low-fidelity**: any tool with internal links between pages will do it — slide decks with hyperlinked shapes, linked documents, a stack of images with clickable regions. Whatever your team already has is the right answer.
- **Wizard of Oz**: two people, a shared document, a chat window, and a rule about response timing.
- **Content prototypes**: a folder of real inputs, your prompt, and a table of results.

The prototype is disposable, so the tool matters far less than the speed of change. Choose whatever lets you alter the thing in front of someone in under a minute, and never let tool choice become a reason the prototype has not started.

## Using AI tools to build the prototype faster

The competency is rapid prototyping *using AI tools*, and the tools help in two distinct places. The first is obvious: the AI component is part of what you are prototyping. The second is less obvious and often saves more time — AI tools are excellent at manufacturing the raw material a prototype needs.

**Generating test inputs.** The most common reason a prototype stalls is that you cannot get real data quickly enough. You can generate a plausible corpus in minutes: forty support tickets in the client's domain, a dozen invoices with realistic variation, application forms with the kinds of gaps real ones have. Two cautions. Generated inputs are systematically cleaner and more grammatical than real ones, so they flatter the system; use them to build the flow, and validate quality against real inputs before you believe any number. And never substitute generated data for real data when the question is "does the output quality hold up" — that question only real inputs can answer.

**Generating the awkward cases on purpose.** Ask for the inputs that should be hard: the ambiguous one, the one in another language, the one that is out of scope, the one that is empty, the one that contains an instruction. These are how you populate the failure states your design has to handle, and they are tedious to invent by hand.

**Drafting interface copy variants.** Labels, empty-state messages, and confidence wording are cheap to generate in threes and much easier to choose between than to write cold. You still own the final wording.

**Summarizing your own iteration notes** between rounds, so that the log stays current rather than being reconstructed at the end.

Prompt iteration is itself a prototyping activity, and it deserves the same discipline as the rest. Keep each version of the prompt, note what you changed and why, and re-run against the same fixed sample. A prompt improved by unrecorded fiddling is a prompt you cannot reproduce, explain to a build team, or hand over — and it will be the thing everyone asks you about later.

## Describing a wireframe in words

Written wireframe descriptions travel further than drawings — they can be reviewed by someone who was not in the room, argued with in a comment thread, and reused as build notes. Write one per screen, in the same shape every time.

```text
SCREEN: Draft reply review
PURPOSE: Operator reviews an AI-drafted reply and sends, edits, or rejects it.
ENTRY:   Operator clicks an item in the queue.

REGIONS, top to bottom
  1. Context header
     - Customer name, ticket ID, received time.
     - Original message, collapsed to 3 lines, expandable.
  2. Draft reply panel  [the primary object on this screen]
     - The drafted text, in an editable field, focused on load.
     - Label above it: "Drafted for you — check before sending."
     - The three source passages the draft drew on, listed beneath,
       each expandable to show the surrounding paragraph.
  3. Assessment strip
     - A plain-language note on how confident the system is, and why.
     - Shown as words, not only as a color or an icon.
  4. Actions, in priority order
     - Primary:   Send reply
     - Secondary: Save edits and send
     - Tertiary:  Reject and write from scratch  (asks a one-tap reason)
     - Always available: Back to queue, changes kept.

STATES TO SHOW
  - Draft ready (default).
  - Still generating.
  - No draft could be produced.
  - Draft produced but flagged low confidence.

WHAT THIS SCREEN IS TESTING
  Whether operators read the source passages before sending, and whether
  the reject path is discoverable enough to be used instead of a rushed send.
EXPLICITLY NOT ON THIS SCREEN
  Queue management, bulk actions, historical performance.
```

Notice the last two blocks. Every wireframe description should name the question it is testing and the things it deliberately excludes; both are how you stop a prototype from drifting into a specification while nobody is watching.

## Iterating on evidence

An iteration is not a redesign. It is a change made because something specific happened, and it should be traceable to that thing. The discipline that makes this work is a log kept as you go, because the reason for a change is obvious on the day and unrecoverable a fortnight later.

| # | Question this round asks | What we built | What we ran it against | What we observed | Change made | Question for next round |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Can the model draft usable replies from real tickets? | Prompt + 30 real tickets | 30 tickets, mixed types | 21 usable as-is, 6 needed edits, 3 wrong on policy | Add policy extract to prompt context | Do the 3 policy failures disappear? |
| 2 | Same | Revised prompt | Same 30 + 20 new | 0 policy errors on old set, 2 on new | Note that policy coverage is input-dependent; log as risk | Will operators notice a policy error at all? |
| 3 | Do operators check sources before sending? | Clickable wireframe, wizard-of-oz drafts | 4 colleagues, 6 items each | Sources opened on 5 of 24 items | Move sources above the send button; label them | Does placement change source-opening rate? |

Three habits make the log worth keeping. **Keep the sample fixed across rounds** when you are testing a change, so that a difference in results is attributable to the change rather than to a new set of inputs — then add fresh inputs deliberately, as a separate check, the way round 2 above does. **Record the failures, not just the counts**, because the shape of the failures is what tells you what to change. And **timebox each round** — half a day is plenty for the lower rungs. A round that runs long has usually stopped being a question and started being a build.

Iterate on one variable at a time where you can. If you change the prompt and the layout in the same round, an improvement tells you nothing about which one caused it. When you must change several things at once because time is short, write that down too, so that later you know the round produced a direction rather than a finding.

Finally, know when to stop. Stop when the question is answered — including when the answer is no. A prototype that demonstrates the idea does not work has done its job and saved the client the build; report it as a result, not as a failure. Stop also when you notice yourself fixing things nobody asked about, adding a settings screen, or worrying about how it looks. Those are all symptoms of a prototype that has outlived its question.

## Practice

Use the requirements document from the previous lesson, or a partner's.

1. **Rank your assumptions.** Score each assumption in section 9 for impact and uncertainty on a 1–5 scale. Pick the highest-scoring one and write it as a single testable question at the top of a page.
2. **Choose a rung and justify it.** In two sentences, say which rung of the fidelity ladder answers your question and why the rung below it does not.
3. **Build a content prototype.** Gather at least 15 realistic sample inputs — real if you can get them, deliberately messy if you cannot. Run them through a prompt. Record each result as usable, needs-editing, or wrong, and write one line on what each wrong one got wrong.
4. **Write two wireframe descriptions** using the template, for the two screens that carry the interaction. Each must include a states list, the question it tests, and an explicit exclusions block.
5. **Make it clickable** with whatever tool you already have. The only requirement is that a person can move through the flow without you narrating it.
6. **Run two logged iterations.** Round one: run your content prototype against the fixed sample, make one change based on what failed, and re-run against the same sample. Round two: put the clickable prototype in front of two people, watch without helping, and make one change based on what you saw. Fill in every column of the iteration log for both rounds.
7. **Write the stop note.** In three sentences: what question you asked, what the evidence said, and what you would do next — including whether the honest answer is to stop.

## Check your understanding

1. Your riskiest assumption is "operators will notice a wrong draft." Which rung of the fidelity ladder answers it most cheaply, and why not a functional slice?
2. Why should you not quote a quality number measured on AI-generated test inputs?
3. You changed the prompt and the layout in the same round, and results improved. What can you conclude?
4. Your prototype shows the idea does not work. Is that a failed prototype?

Answers: (1) Wizard of Oz (or a clickable prototype with seeded drafts, including a planted wrong one) — it tests the interaction without needing a working model; a functional slice costs far more and mixes interface and model quality. (2) Generated inputs are cleaner than real ones and flatter the system; only real inputs answer "does quality hold up." (3) Only a direction, not a finding — you cannot tell which change caused it; record that in the log. (4) No — it answered its question and saved the client the build. Report it as a result.
