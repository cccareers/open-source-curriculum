---
lesson_id: agile310-08
course_id: agile310
pathway: data-engineer
title: Final Delivery and Stakeholder Presentation
order: 8
kind: project
competency_ids:
  - D7-S1-C03
  - D7-S1-C01
objectives:
  - Present the finished pipeline and its findings to a non-engineering audience
---

## Goal

Deliver the capstone: a live demonstration of the running pipeline and a presentation of what it found, given to an audience that does not write code, backed by a repository and handoff pack somebody else could pick up on Monday.

This is the final graded deliverable of the Data Engineer pathway. Everything before it was building; this is the part where the building becomes worth something to somebody else. The two competencies assessed are presenting findings and improvements to stakeholders (D7-S1-C03) and working effectively with analysts, scientists, and software engineers (D7-S1-C01) — the second one because your audience contains all three, and a delivery that only speaks to engineers has missed most of the room.

Budget five hours: roughly two to prepare the artefacts, two to build and rehearse the presentation, and one for the delivery and the questions.

## The scenario

You are presenting to a panel standing in for the people who would sponsor this work: an operations manager who would act on the answer, an analyst who would query your tables, and one engineer. The manager has fifteen minutes and no patience for architecture for its own sake. The analyst wants to know whether they can trust the numbers. The engineer wants to know what happens when it breaks.

You have twenty minutes: roughly fifteen to present and demonstrate, five for questions. Somebody in the room will ask a hard question, and how you answer it is part of the assessment.

## Requirements

Deliver four things.

**1. A presentation, twenty minutes including questions.** Structured for the non-engineering audience: the question, the answer, how you know the answer is right, what you built, what it costs, what it would take to run it for real, and what you would do next. Slides or a document — the medium does not matter, the sequence does.

**2. A live demonstration.** Not screenshots. Trigger or show a real run, open the run history, run the serving query against the real warehouse, and read the answer aloud. Two to three minutes inside the presentation. Have a recorded fallback for the case where the network fails you, and say clearly that it is a recording if you use it.

**3. The finished repository and handoff pack.** The pipeline code, infrastructure scripts, transformation SQL, tests, and the five documents from lesson 7: README, runbook, data dictionary, architecture document, and decision records. Everything current with what actually runs.

**4. A one-page written summary.** For the people who will not attend: the question, the answer with its key numbers, the caveats, the cost to operate, and one recommendation. Plain language throughout — an operations manager should be able to read it without asking anybody what a word means. This is the artefact most likely to outlive the presentation.

**Governance acceptance criteria**, carried forward and graded here:

- No sensitive value appears in a slide, a screenshot, a demo query result, or the written summary. Check your live demo output specifically — a `SELECT *` on stage in front of a panel is how sensitive fields get shown.
- The caveats section is honest and specific: known data quality issues, the period the data covers, what the pipeline does not handle, and any assumption a reader would need in order not to be misled by your headline number.
- Data sources are attributed with their licence, and the public or synthetic nature of the data is stated.
- The account teardown plan is stated: what gets deleted, when, and what is preserved for your portfolio.

## Constraints

- **Twenty minutes, hard.** Overrunning is a failure of preparation, and it is the single most common way a good capstone presents badly. Rehearse against a timer.
- **No unexplained jargon.** Every technical term either gets one plain-language sentence or gets cut. "Idempotent" becomes "running it twice does not double the numbers." "Partitioned" becomes "the table is filed by date so a query only reads the days it needs."
- **Lead with the answer, not the architecture.** The question and its answer come first, inside the first three minutes. The pipeline is how you got there, not the point.
- **No claim without evidence you can show.** If you say it is reliable, be able to open the run history. If you say it is cheap, have the figure. If you say the data is correct, have the test output. A panel will ask, and a claim you cannot support undermines the ones you can.
- **No live code editing.** If the demo breaks, narrate what should happen, show the fallback, and move on. Debugging on stage costs you the room and the clock.
- **The demo runs against your real deployed environment**, not a local copy.
- **You present alone.** Even if you worked with peers, this delivery is individual.

## Definition of done

You are finished when all of these are true.

- The presentation has been delivered live, within twenty minutes including questions, to the panel.
- The business question and its answer were stated in the first three minutes, in plain language, and a listener with no data background could repeat the answer afterwards.
- The headline number is accompanied by the query or table that produces it, and you can run that query on request.
- The live demonstration ran against the deployed environment: a real run or run history, and a real query returning a real result.
- You stated at least two caveats that limit the answer, unprompted, before the questions.
- You gave the operating cost of the pipeline as a real figure, with the basis stated (per run, per day, or per month).
- You described one measured improvement you made, with the before and after numbers.
- You described one thing that went wrong during the build and what you changed as a result. A capstone with no failure narrative is either untrue or untested.
- You answered every panel question either with evidence or with an explicit "I do not know, and here is how I would find out." Guessing in front of the panel counts against you; the honest non-answer does not.
- The repository is complete and current: a reviewer following the README alone can deploy and run the pipeline for one window.
- All five handoff documents exist, are in the repository, and describe the system as built rather than as planned.
- The one-page summary exists, is free of unexplained jargon, and contains the answer, the caveats, the cost, and one recommendation.
- No sensitive value appears in any delivered artefact, including demo output.
- The teardown plan is stated, and the portfolio-safe subset of the work is identified.

## Hints

**Write the last slide first.** What is the one sentence you want the manager to repeat to somebody else tomorrow? Everything in the presentation either supports that sentence or is cut. This single habit fixes more capstone presentations than any amount of design work.

**Use the pyramid.** Answer first, then the three reasons it holds, then the detail behind each. Technical people instinctively present in build order — sources, then ingestion, then modelling, then the answer — and lose the room a third of the way through. Build order is the wrong order for an audience that only cares about the destination.

**Two minutes of architecture, no more.** One diagram, four boxes, described in terms of what each does for the audience: "this is where the raw data lands untouched, so that if I make a mistake later I can rebuild without going back to the source." The panel does not need service names.

**Give the numbers a scale.** "3.4 million trips" means nothing on its own. "3.4 million trips, about eighteen months of activity across sixty zones" is a picture. Every headline number should carry the comparison that makes it interpretable.

**Rehearse the demo against a failing network.** Decide in advance what you show if it will not connect, have it open in another window, and practise the sentence you say while switching. Panels forgive a network; they do not forgive five minutes of silence.

**Rehearse the timing out loud, twice.** Reading slides silently takes half the time of saying them. Most people overrun by forty percent on the first live run, and the fix is not talking faster.

**Prepare the four questions you are afraid of.** How do you know these numbers are right? What happens if it breaks at 3 a.m.? What would this cost at ten times the data? What would you do differently? Write two-sentence answers now, and the questions become the strongest part of your delivery instead of the weakest.

**Lead the caveats yourself.** A limitation you volunteer reads as rigour; the same limitation extracted by a panel member reads as an oversight. This is the highest-leverage thirty seconds in the presentation.

**Convert reliability into consequence.** Do not say "the pipeline has retry logic and alerting." Say "when the source was down for two hours last Tuesday, the pipeline recovered on its own and nobody was paged — here is the run." One concrete incident lands better than any description of your design.

**Show the run history, not the code.** Nobody in that room wants to read your SQL, including the engineer. The run history is a picture of a system that works; the code is a wall of text that proves nothing at presentation speed.

**Have the repository open before you start.** If somebody asks to see the runbook, the delay while you find it costs more than the answer gains.

**Take a screenshot of everything before teardown.** The account gets deleted; your portfolio does not have to be. The architecture diagram, the run history, the cost report, and the serving query result are what you will show at an interview in six months, and they are much harder to reconstruct afterwards.
