---
lesson_id: ai210-05
course_id: ai210
pathway: prompt-engineer
title: UI/UX Patterns for AI-Powered Products
order: 5
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Apply interface patterns that suit AI's probabilistic behavior, including
    latency, uncertainty, and error states
---

## Designing for a component that is usually right

Most interface conventions were built for deterministic software. A button either saves the record or reports an error. A search either matches rows or returns none. The interface can be confident because the system underneath is.

An AI-powered feature breaks three of the assumptions those conventions rest on. It is **slow and variably slow** — the same action might take one second or twenty. It is **uncertain** — the output is a good guess, sometimes a poor one, and the system's own sense of how well it did is imperfect. And it **fails in ways that look like success** — a fluent, well-formatted, completely wrong answer arrives through exactly the same path as a correct one.

Interface patterns for AI are the accumulated answers to those three problems. They exist to keep the user oriented while they wait, calibrated about how much to rely on what they get, and in control when it goes wrong. This lesson is about that mechanical layer. The patterns here are the ones that make the difference between a feature people use daily and one they try twice.

## Map the states before you draw anything

The single most common defect in AI interface design is a screen designed only for the happy path. Before laying out a screen, enumerate the states the underlying component can actually be in, and give each one a designed appearance.

![The state model of an AI-powered interaction, from idle through generating to answered, uncertain, empty, refused, or failed](./img/ai-interaction-states.png)

| State | What has happened | What the interface must do |
| --- | --- | --- |
| Idle | Nothing requested yet | Show what this can do and what a good input looks like |
| Submitted | Request accepted, nothing back | Acknowledge within ~100 ms; the input must visibly land |
| Working, fast | Result expected in a few seconds | Show activity in place; keep the user's context |
| Working, slow | Result expected in tens of seconds | Show progress or partial output; offer a way to leave and come back |
| Streaming | Output arriving progressively | Render as it arrives; make it obvious it is not finished |
| Answered, confident | Usable output | Present as a draft to be checked, not a verdict |
| Answered, uncertain | Output produced, low confidence | Say so in words; make checking easy and cheap |
| Multiple candidates | Several plausible outputs | Show a small number, comparably, with a way to pick |
| Empty | Nothing found or nothing to say | Explain why, and offer the next move |
| Refused | Out of scope, not permitted, or unsafe | Say what it will not do and what to do instead |
| Failed | Timeout, service error, malformed output | Preserve the user's input, explain plainly, offer retry |
| Interrupted | User stopped it | Keep whatever was produced; make restarting cheap |

Fill that table for each AI-powered interaction in your design and you will have caught most of the problems before you have drawn a single box. Every row without a designed appearance becomes a default browser behavior, a spinner that never ends, or a blank space, and users interpret all three as broken.

## Input: shaping intent before the model sees it

Half of a good AI experience is decided before the request is sent. Users do not know what the system can do, and an empty box tells them nothing.

**Show capability at the point of use.** A short line describing what this will do, in the user's terms, next to the control that does it. Not in documentation.

**Seed with real examples.** Two or three example inputs, drawn from actual work, are worth a page of instructions. They teach scope and phrasing simultaneously, and users edit them rather than starting cold.

**Prefer structure where the task is structured.** If the system needs a date range, a document, and a tone, ask for those three things with three controls rather than hoping a sentence contains them. Free text is a superb input for open-ended intent and a poor one for parameters you already know you need.

**Constrain rather than validate after the fact.** Where only certain inputs will work — a supported file type, a length limit, a language — make that visible in the control and enforce it before the request goes out. A ten-second wait that ends in "unsupported file" is a design failure, not a user error.

**Preserve the input.** Always. Whatever happens next, the user's typed text, uploaded file, and selected options survive it. This one rule prevents more abandonment than any other on this page.

## Latency: designing the wait

Latency is not a performance problem you can design away; it is a condition to design for. Users tolerate waiting well when they know it was heard, roughly how long it will be, and that they have not lost anything.

- **Acknowledge immediately.** Something must change within about a tenth of a second of the click. Not the result — evidence of receipt. Silence in that window makes people click again.
- **Match the indicator to the duration.** Under a second, nothing or a subtle in-place change. A few seconds, an activity indicator attached to the thing being produced. Tens of seconds, staged progress that names what is happening in the user's terms rather than the system's, plus an estimate if you can give an honest one. Never show progress that is not real: a bar that advances on a timer rather than on actual work teaches people to disbelieve every indicator you show them afterwards.
- **Stream when the output is text.** Progressive output transforms perceived speed, and it lets a user abandon a bad direction early rather than waiting for a full wrong answer. Make it unmistakable that streaming output is unfinished, and do not let actions like send or save become available until it is complete.
- **Do not block the whole interface.** Confine the busy state to the region being produced. A user who cannot scroll, read the source document, or open another item while waiting is a user learning to dread the feature.
- **Offer an exit for long work.** If a task genuinely takes minutes, let the user leave and be notified. A prototype can represent this with a notification row and a results list; the point is that the design accounts for it.
- **Always allow stop.** A visible stop control during generation, which keeps whatever has already been produced. Its presence changes how people feel about starting.
- **Design the timeout.** Decide what happens at the limit, say so plainly, keep the input, and offer retry. "Something went wrong" with a lost draft is the worst possible end to a wait.

## Uncertainty: helping people calibrate

The hardest thing an AI interface does is help a user decide how much to trust this particular output. Get it wrong in one direction and people check everything, which erases the time saving. Get it wrong in the other and they check nothing, which is how a wrong answer reaches a customer.

**Frame the output as a draft, not an answer.** Word choice and placement do most of this work. Output labelled "Suggested reply" that lands in an editable field is read differently from output labelled "Reply" in a block of finished-looking text. The framing should match what the system actually is.

**Express uncertainty in words, and make it specific.** "85% confident" means little to most users and is often not a well-founded number anyway. "This is based on two similar past cases; the policy section it references was updated last month" tells the user exactly where to look. Where you do use a coarse level — high, medium, low — pair it with the reason.

**Never rely on color alone to carry the level.** A confidence signal must survive being read in greyscale, by someone who does not perceive that color difference, or by a screen reader. Words plus an icon plus color; never color by itself.

**Localize the uncertainty.** A single confidence score for a long output is nearly useless, because most of it is fine and one clause is wrong. Where the underlying system supports it, mark the specific fields or sentences it is least sure about. Reviewers' attention is a scarce resource; spend it where the risk is.

**Show a small number of alternatives when the task is genuinely ambiguous.** Two or three comparable options, side by side, with a clear pick action. This is honest about ambiguity and often faster for the user than editing a single wrong answer. Do not do it for tasks with one right answer; choice for its own sake is a cost.

**Route by confidence where the consequence is high.** Design the flow so that low-confidence items go to a review queue rather than straight out. That decision belongs in the requirements you wrote earlier, and the interface has to express it: the user should be able to see that an item was routed, and why.

## Output: making the result workable

**Editable in place.** If the output is text the user will send, own, or file, let them change it exactly where it appears. Copying into another tool to fix a word is a small friction that reliably kills adoption.

**Regenerate with a reason.** A bare regenerate button is a slot machine. Attach the common adjustments — shorter, more formal, focus on this section — so a second attempt encodes what was wrong with the first. Keep the previous output visible or one step away, because the new one is sometimes worse.

**Show the input alongside the output.** Whatever the system read should be reachable without leaving the screen. A reviewer who has to open another window to check a source will stop checking.

**Preserve history.** Previous versions, previous attempts, and what was edited. Undo must reach across an AI action, not stop at it.

**Make accepting deliberate.** The action that commits an AI output to the world — sending, filing, submitting — should be a distinct, clearly labelled step, not something that happens as a side effect of scrolling past.

## Error states are a design surface, not an exception

Write the wording for each failure state as carefully as the happy path, because these are the moments that determine whether the feature is trusted at all.

Distinguish the kinds, because they need different words and different next steps:

- **Nothing found.** The system worked and there is genuinely no answer. Say what was searched or read, and offer a way to widen or change the input. Never present an empty state as an error.
- **Cannot answer.** The input is outside what this handles. Name the boundary — "this handles invoices, and this looks like a contract" — and point to the human path.
- **Will not answer.** A policy limit. Say plainly that it will not, and what the user can do instead. Vague refusals read as malfunctions and generate support tickets.
- **Broke.** A timeout or a service error. Plain language, no error codes as the primary message, input preserved, retry available, and an escalation path if it keeps happening.
- **Answered wrongly.** The state the user discovers, not the system. What the interface owes here is a fast, obvious way to reject the output and proceed by another route, with the rejection captured — that is the input for the improvement work in later lessons.

Two rules apply to all of them. **Never blame the user** for an input the system did not handle. And **never let a failure destroy work** — the input, the edits, and the position in the queue all survive.

## Putting it together on one screen

Applied to the draft-reply review screen from the prototyping lesson, the patterns above produce specific decisions: the drafted text sits in an editable field with the label "Drafted for you — check before sending"; the original message stays visible beside it; while generating, the panel streams with a stop control and the send button stays inactive; a low-confidence draft carries a sentence saying what it was unsure about, in words as well as an icon; when no draft can be produced, the panel says so and offers the blank composer with the customer context already filled in; and the reject path sits next to send, one tap, with the reason captured. None of that is styling. All of it comes from the state table.

## Practice

Work from the wireframe descriptions and clickable prototype you built in the previous lesson.

1. **Complete the state table.** For your main AI-powered interaction, fill every row of the state table with a specific designed appearance — what is on screen, what the wording is, what the user can do. Do not skip refused, empty, or interrupted.
2. **Write the microcopy.** Produce the exact user-facing wording for the four failure states: nothing found, cannot answer, will not answer, and broke. Under 25 words each, no error codes, no blame, each naming a next step.
3. **Design the wait.** Decide and document what the interface does at 0.1 seconds, 2 seconds, 10 seconds, and 60 seconds. Specify what streams, what stop does, and what happens at your chosen timeout.
4. **Design the uncertainty signal.** Write the low-confidence presentation for your output. It must state a reason, not only a level, and it must still communicate when rendered in greyscale. Prove that by describing what a user sees with no color at all.
5. **Update the prototype.** Add screens for at least three non-happy-path states so a person clicking through can reach them.
6. **Run a state audit with a partner.** They pick three states at random from your table and click to reach each one in your prototype. Any state they cannot reach, or that looks like a bug rather than a design, is a finding — log it and fix the two worst.

## Check your understanding

1. What are the three properties of an AI component that break conventional interface assumptions?
2. A draft is still streaming. Should Send be available? What should the user be able to do?
3. Rewrite "Confidence: 62%" as an uncertainty signal that follows this lesson.
4. What is the difference between an empty state and a failed state, and how should their wording differ?

Answers: (1) It is slow and variably slow, it is uncertain, and it fails in ways that look like success. (2) No — commit actions wait until the output is complete; the user can read the source and press Stop, keeping what has been produced. (3) Something like "Check the refund window — the policy it cites was updated last month," shown as words plus an icon, attached to the specific sentence. (4) Empty means the system worked and found nothing — say what was searched and offer the next move, never framed as an error; failed means it broke — plain language, input preserved, retry offered.
