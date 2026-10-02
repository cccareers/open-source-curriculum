---
lesson_id: agile200-10
course_id: agile200
pathway: quality-assurance-software-engineer
title: Demo, Presentation, and Retrospective
order: 10
kind: lesson
competency_ids:
  - D1-S1-C03
  - D1-S1-C04
  - D2-S1-C02
objectives:
  - Present finished work and run a retrospective
---

## Closing the loop, out loud

Everything you've built — the environment, the strategy, the tests, the defect record, the verified release — has been documented in tools and tickets. This lesson is about presenting it to people, out loud, clearly enough that someone who hasn't been following along understands what you did and why it can be trusted. Then it's about turning three weeks of sprint experience into specific, honest lessons instead of a vague feeling that "it went okay." Both of these close out the capstone before Lesson 11's sprint puts everything into practice for real.

## Preparing the demo

A demo is not a live improvisation — it is a short, rehearsed presentation with a live product underneath it. Structure it around a script, even a brief one:

```text
Demo Script
1. One sentence: what the product is and who it's for
2. Walk the single most-important path (from Lesson 02) live
3. Show one or two supporting features, briefly
4. State the release verification result: what was tested, what passed
5. Name one known limitation honestly
6. Open for questions
```

Rehearse it at least once end to end before presenting, on the actual release build — not a version you patched five minutes ago and haven't re-run. Time it: a demo that runs long loses the room; one that's too thin looks unprepared. Aim for five to ten minutes of structured walkthrough, leaving room for questions.

## Delivering the presentation

D1-S1-C03 is about delivering a clear, structured spoken explanation of information and ideas — the demo script above is the structure; delivery is what makes it land:

- **State the point before the detail.** Say what you're about to show before you show it — "next I'll demonstrate the checkout flow, which was our highest-risk path" — so the audience knows what to watch for.
- **Narrate what you're doing on screen.** Silence while you click around leaves the audience guessing; a short spoken description of each action keeps them oriented.
- **Match pace to complexity.** Slow down for anything unfamiliar to the audience; move briskly through anything routine.
- **Answer questions directly.** If you don't know the answer, say so and say how you'd find out — that's a more credible answer than guessing.

If you're presenting with teammates, decide roles ahead of time (who drives the keyboard, who narrates, who fields questions) so the handoffs between speakers are smooth rather than awkward — that coordination is itself an example of D1-S1-C04, communicating and working collaboratively with your team, extended into a shared presentation.

## Collecting feedback during the demo

Treat your demo audience the way you treated the real user in Lesson 08: a source of usability and functionality feedback you can act on. After the walkthrough, ask specifically — "was anything in that flow confusing?" or "is there anything you expected to see that wasn't there?" — rather than the generic "any questions?" which tends to produce silence. Capture what you hear using the same diagnosis/recommendation format from Lesson 08, and file anything actionable into your defect database as a lower-priority item, even though the capstone's formal testing window has closed; it's still useful record-keeping and it's exactly what D2-S1-C02 asks you to be able to do — turn feedback on usability and functionality into something concrete.

## Running the retrospective

A retrospective is a structured look back at how the sprint actually went, aimed at specific, actionable change — not a complaint session and not a victory lap. Use this format, the fuller version of the quick end-of-sprint check-in from Lesson 03:

```text
Retrospective: <sprint or project name>

1. What went well
   (specific, not "everything" — name the actual practice or decision)

2. What didn't go well
   (specific, blameless — describe the situation, not a person)

3. What surprised us
   (things that turned out different from what we expected in Lesson 02/05)

4. Action items
   (concrete, owned, and — if the course continues — checkable next time)
```

Ground each item in something concrete from your board's outcomes log (Lesson 03) or your defect database (Lesson 07) rather than impressions — "we opened 9 defects in week 2 versus 3 in week 1, right after we skipped writing tests alongside two features" is a retrospective finding you can act on; "testing felt rushed" is not, on its own. If you're on a team, give everyone a turn to contribute to each section before moving to the next — a retrospective one person dominates misses what everyone else actually experienced.

## Practice

Write and rehearse a demo script for your capstone using the structure above, timed to five to ten minutes, and present it live to at least one person who has not been closely following your project (a classmate on a different capstone, or your instructor). During the demo, ask at least two specific feedback questions and record what you hear using the diagnosis/recommendation format. Immediately afterward, run a full retrospective using the four-part format above, grounding at least two entries in specific numbers from your outcomes log or defect database, and write down at least one concrete, owned action item you would carry into the next sprint.
