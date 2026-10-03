---
lesson_id: react100-09
course_id: react100
pathway: software-developer
title: Prototyping a Feature
order: 9
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C05
objectives:
  - Prototype a feature before committing to an implementation
---

## Building the wrong thing well

You can now build most of a React interface. That skill has a specific failure mode attached to it, and it is expensive: you can build the wrong thing, correctly, for three weeks.

It happens like this. A ticket says "let members reserve a tool for a date range." You have a clear picture in your head, so you start. Two days in, the calendar component is nearly done. On day four someone asks what happens when a reservation overlaps an existing one, and the answer turns out to reshape the whole interaction. On day six a member tries it and says they never think in date ranges — they think "this weekend" — and would rather pick a weekend. The calendar was well built. It was also the answer to a question nobody had asked.

A **prototype** is the tool for that problem. It is something you build in order to *learn* something, and then usually throw away. That last clause is what makes it different from ordinary development, and it is what most people get wrong: they build a prototype the way they would build the real thing, which costs the same and teaches nothing extra.

This lesson is about choosing a prototyping method that fits the uncertainty you actually have, building at the right fidelity, comparing more than one option, and making a recommendation someone else can act on. It is judgment work, and it is the kind an apprentice does with a senior developer's supervision on real tickets — which is exactly why it comes after you can build, not before.

## Start with the question

A prototype with no question is just unpaid overtime. Before you open an editor, write one sentence: **what do I not know, that this will tell me?**

Real examples of a good question:

- Will members understand a calendar picker, or do they think in named periods like "this weekend"?
- Can this list stay responsive with two thousand items, or do we need virtualization?
- Does the third-party map library we are considering support the marker clustering the design assumes?
- Do the three filters we planned actually narrow the list usefully with our real data, or does everything match everything?
- Which of these two navigation structures do members find their own requests in faster?

Each of those has an answer that changes what you build. Compare with a bad question: "what will the reservation screen look like?" You will find that out by building it; you do not need a prototype, you need a designer or a decision.

Sorting uncertainty into three types makes the method easy to pick:

**Usability uncertainty** — will people understand and succeed at this? Answered by putting something in front of a person and watching. Fidelity barely matters; paper works.

**Technical uncertainty** — is this possible, fast enough, or supported by our stack? Answered by writing real code against the real constraint, and by nothing else. A drawing cannot tell you whether a library performs.

**Product uncertainty** — is this worth building at all? Answered by the cheapest possible thing that lets someone react to a concrete proposal — a sketch, a fake screenshot, a description.

Write the question down where the work happens. When you find yourself polishing something that will not change the answer, the written question is what tells you to stop.

## The methods, cheapest first

Prototyping methods form a ladder. Climb only as high as your question requires, because every rung costs more than the one below.

**Sketch on paper.** Minutes. A pen and a page, one screen per page. Enough to have an argument about layout and flow with another person. Astonishingly effective, and undervalued precisely because it is so cheap — nobody defends a sketch they made in ninety seconds, so the conversation stays about the idea.

**Paper prototype.** Half an hour. Several sketched screens, and you play the computer: a person points at a button and you swap the page. This tests flow and comprehension, and it catches "I have no idea what that word means" faster than any software.

**Wireframe or clickable mockup.** An hour to a day, in a design tool. Grey boxes and real labels, screens linked so a person can click through. This is what a designer usually hands you, and it answers questions about structure and navigation with no code at all.

**Static React prototype.** A day or two. Real components, hard-coded data, no backend, no error handling, no persistence. This is the rung where React work begins and it is the one you will use most. It answers "how does this actually feel in a browser, with real text lengths, on a phone" — which a mockup never quite does.

**Vertical slice, or spike.** Two to five days. One narrow path built for real, all the way from interface to API, to prove a technical assumption. The distinguishing feature is depth over breadth: one thing works completely, and nothing else exists.

**Wizard of Oz.** Variable. The interface is real; the thing behind it is a human or a hard-coded script. Useful when the expensive part is the backend and the question is about the front. A "suggested tools for you" panel can be tested with a list someone picked by hand.

**Parallel prototypes.** Two or three cheap versions of the same feature, built to be compared. This is where the second competency in this lesson lives, and it is covered properly below.

There are two more distinctions worth naming, because they will come up in a planning conversation and you should know what people mean.

**Horizontal versus vertical.** A horizontal prototype covers many screens shallowly — every page exists, nothing works. It answers questions about scope and flow. A vertical prototype covers one path deeply — one feature works end to end, nothing else exists. It answers questions about feasibility. Know which one your question needs; building horizontally when the risk is technical wastes the whole exercise.

**Throwaway versus evolutionary.** A throwaway prototype is deleted once the question is answered; you keep the knowledge, not the code. An evolutionary prototype is intended to grow into the real thing. Throwaway is the honest default, and evolutionary is where projects go wrong, because "we'll clean it up later" is a promise nobody keeps under a deadline. Choose one *before* you start, say which it is out loud, and if it is evolutionary, hold it to production standards from the first line. The disaster case is building throwaway-quality code and then shipping it because it happened to work — which is how an application ends up with an important screen nobody can safely change.

## Prototyping in React

For the static React prototype — your most common rung — the point is to reach a realistic-feeling interface fast. Everything that makes production code good and slow is deliberately skipped.

**Hard-code the data, in the shape the real API will use.** Guess the field names from the spec and write a fixture file. This costs an hour and removes the entire backend from your critical path.

```jsx
export const RESERVATIONS = [
  { id: "r-1", toolId: "t-1", memberName: "Dana", start: "2026-08-07", end: "2026-08-09", state: "confirmed" },
  { id: "r-2", toolId: "t-1", memberName: "Marcus", start: "2026-08-14", end: "2026-08-15", state: "pending" },
];
```

**Use the state you know.** `useState` in a page-level component is enough for a prototype. Do not evaluate a state library, do not add routing, do not introduce an abstraction. Every one of those is a decision the prototype has not earned yet.

**Skip the things that do not affect the answer.** No loading states unless latency is the question. No error handling unless failure is the question. No persistence — refreshing the page resetting everything is acceptable and you say so up front. No tests on code you intend to delete.

**Do not skip the things that do affect the answer.** Use realistic content: real tool names, the longest owner name in your data, an empty list, a member with forty reservations. Fake content that is uniformly short and pleasant hides every layout problem you have. And check it at phone width, because "it felt cramped on my phone" is exactly the kind of finding a prototype exists to surface early.

**Keep it separate and disposable.** Put it on a branch, or behind a path that is obviously not production, or in its own scratch app. Name things so nobody mistakes it: a folder called `prototypes/reserve-v1` cannot be accidentally imported. A prototype that is entangled with production code is one you cannot delete, which means you will keep it.

**Timebox it, hard.** Decide the budget before you start — half a day, two days — and write down what "done" means: the question is answered, or you have learned that the question was wrong. When the box runs out, stop and report what you know, even if the answer is "I still do not know, and here is what it would take." Overrunning a prototype is how a two-day investigation quietly becomes a two-week build with no review.

## Comparing options

A single prototype tells you whether an idea works. Two tell you which is better, and "which is better" is usually the actual question. Building two cheap versions rather than one polished one is counterintuitive and it is one of the most reliable ways to improve a design.

Do it properly:

**Make them genuinely different.** Two variations on the same concept teach you little. A calendar range picker versus a set of named-period buttons ("this weekend", "next week", "pick dates") are different concepts, and the comparison is informative. Two different shades of the same calendar are not.

**Build them to the same fidelity, in the same amount of time.** If one is polished and one is rough, you have measured polish, not concept. This is the single most common way a comparison gets rigged, usually unconsciously, in favor of the one the developer already preferred.

**Decide the criteria before you look at the results.** Write them down first. Otherwise the criteria will quietly rearrange themselves to justify the option you liked. For a reservation picker, criteria might be: can a member complete a booking without help; how many interactions does the common case take; does it work by keyboard and at 320 pixels; how much effort is the real implementation; does it handle the overlapping-reservation case; can it be extended to recurring bookings later.

**Weight them, and be explicit about it.** Not all criteria matter equally, and stating which matter most for *this* deliverable is most of the judgment. A comparison table with a weighted score is a fine artifact — not because the arithmetic is authoritative, but because it forces you to write the weights down where a reviewer can disagree with them.

| Criterion | Weight | Calendar range | Named periods |
| --- | --- | --- | --- |
| Task completed unaided | High | 3 of 5 testers | 5 of 5 testers |
| Interactions for the common case | High | 6 | 2 |
| Handles arbitrary date ranges | Medium | Yes | No |
| Keyboard operable at 320px | High | Needs work | Straightforward |
| Estimated build effort | Medium | 5 days | 2 days |

**Say what would change your mind.** "Named periods, unless a significant share of bookings turn out to be longer than a week — we should check the data before committing" is a far stronger recommendation than a bare verdict, and it is what a senior developer is looking for.

Often the right answer is a combination — named periods for the common case with a "pick dates" escape hatch — and you only see that by building both.

## Getting feedback that is worth having

A prototype that only you have used has told you almost nothing.

**Show it to someone who is not you, and ideally not a developer.** Three or four people is plenty; usability problems cluster hard, and the first two or three people find most of them.

**Give a task, not a tour.** Do not demonstrate. Say "you want to borrow a ladder for the weekend — go ahead" and then be quiet. The silence is the method. Every time you explain something, you have destroyed the evidence you came for, because the real user will not have you sitting next to them.

**Watch what they do, not what they say.** People are polite about interfaces and unreliable about predicting their own behavior. Where they hesitated, what they clicked first, what they scrolled past, where they said "hmm" — that is the data. "Would you use this?" is a question with no informative answer.

**Ask about their situation, not your design.** "How do you decide when to return a tool?" is answerable. "Do you like this calendar?" is not.

**Write it down the same day.** One short document: the question, the method, who you showed it to, what they did, what surprised you, and what you now believe. Findings you did not write down are findings you no longer have by Thursday.

## The write-up

The deliverable of a prototype is not the prototype. It is a short recommendation someone can act on, and on a real team it is what gets reviewed. Keep it to a page:

1. **The question** you set out to answer.
2. **The method and the budget** — what you built, at what fidelity, in how long, and what you deliberately left out.
3. **What you did** — the options you built and how you tested them, including who you showed them to.
4. **What you found** — observations first, separated from your interpretation of them. This separation is what lets someone disagree with your conclusion without disputing your facts.
5. **The recommendation**, with the criteria and weights behind it.
6. **What is still unknown**, and what it would cost to find out. Naming your residual risk is a strength, not a hedge.
7. **What happens to the prototype code** — deleted, kept on a branch for reference, or promoted, and if promoted, what has to change first.

An honest "we should not build this" is a successful prototype. Three days spent to avoid three weeks is one of the highest-return things a developer does, and reporting that outcome clearly is a mark of seniority regardless of your title.

## How this goes wrong

**The prototype ships.** A demo goes well, someone asks "how long to finish it", and the honest answer — "it needs rewriting, none of it handles failure" — is unwelcome. Head it off by labeling the thing a prototype in every conversation and every screenshot, stating what it does not do at the start of every demo, and never demonstrating a prototype from the production URL.

**No question.** Two weeks of "exploring" with nothing decided at the end. Write the question first.

**Polish instead of learning.** Spending the third day on animation when the finding arrived on the first. The question is answered; stop.

**Falling in love with the first idea.** The cure is building the second one. If you cannot bring yourself to build the alternative fairly, ask someone else to build it.

**Testing with people who already know.** Your teammate who watched you build it will find nothing. Neither will you.

**Prototyping a certainty.** If the team already knows how the feature should work and no one disagrees, build it. A prototype of something nobody is uncertain about is a delay wearing a lab coat.

## Practice

Continue in the `toolshare` project, on a branch. The feature to explore: **members need to reserve a tool for a period of time in advance, and a tool that is already reserved must not be double-booked.**

1. **Write the question.** In a new `PROTOTYPE.md`, state in one sentence what you do not know that this work will tell you. Classify it as usability, technical, or product uncertainty, and say which of the methods in this lesson fits it and why. Set a budget in hours and write down what "done" means.

2. **Sketch first.** On paper, sketch at least two genuinely different approaches to choosing a reservation period. Photograph both and put them in `PROTOTYPE.md`. Spend no more than thirty minutes.

3. **Choose your two.** Pick the two approaches that are most different from each other, and justify the choice in two sentences. Discard the rest.

4. **Set the criteria before you build.** List five to seven criteria you will judge the options against, with a weight for each, and say why the high-weight ones matter for this deliverable specifically. Do this now — a criteria list written after the prototypes exist is not evidence.

5. **Build prototype A.** A static React prototype under `src/prototypes/reserve-a/`, hard-coded fixture data in the shape the API would return, no backend, no persistence, no error handling. Timebox it to three hours.

6. **Build prototype B.** Same folder convention, same three-hour box, same fidelity. If B runs long, cut scope rather than borrowing time — an unequal comparison is a worthless one.

7. **Use realistic content in both.** Include the longest plausible tool name, a member with several existing reservations, a tool with none, and a case where a requested period overlaps an existing reservation. Check both at 360 pixels wide.

8. **Test with three people.** Give each the same task — "reserve the extension ladder for next weekend" — say nothing else, and note where they hesitate, what they click first, and anything they say aloud. Do not explain. Record raw observations per person in `PROTOTYPE.md`, separately from any interpretation.

9. **Score them.** Fill in your criteria table with the evidence you gathered, including your own honest estimate of the build effort for each. Where you have no evidence for a criterion, write "not tested" rather than guessing.

10. **Write the recommendation.** One page in `PROTOTYPE.md`, following the seven-part structure in this lesson. Include what would change your mind and what remains unknown.

11. **Decide the fate of the code.** State explicitly whether each prototype is thrown away, kept for reference, or promoted. If you propose promoting one, list every specific thing that must be added or fixed before it could be merged — error handling, accessibility, real data, tests — and estimate that work.

12. **Reflect on the method.** In three or four sentences, evaluate the method you chose. Would a paper prototype have answered the question as well for less? Did you need to build both, or was one enough? Would a vertical slice have been the right call instead? This is the judgment being assessed, and an honest "I over-built for the question I had" scores well.

**Deliverable:** two comparable static React prototypes of the same feature under `src/prototypes/`, plus `PROTOTYPE.md` containing your question, sketches, pre-committed weighted criteria, raw observations from three testers, a scored comparison, a one-page recommendation with residual unknowns, an explicit decision about the code's fate, and your reflection on the method.

## Check your understanding

1. Classify each question as usability, technical, or product uncertainty: (a) "Can the grid stay smooth with two thousand tools?" (b) "Will members understand named periods like 'this weekend'?" (c) "Is a reservation feature worth building at all?"
2. You built prototype A in five hours with polished styling and prototype B in two hours with grey boxes. Testers preferred A. What did you actually measure?
3. Why must the comparison criteria be written down before you build either prototype?
4. A stakeholder loves your prototype demo and asks how long until it ships. What do you say, and what should you have done before the demo?

**Answers**

1. (a) technical, (b) usability, (c) product.
2. Mostly polish and time spent, not which concept is better. Equal fidelity and equal time are what make a comparison fair.
3. Criteria written afterwards quietly rearrange themselves to justify the option you already liked.
4. Give an honest estimate for building it properly, naming what the prototype skips (error handling, accessibility, real data, tests). Before the demo, label it a prototype and say up front what it does not do.
