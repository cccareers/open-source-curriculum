---
lesson_id: agile310-07
course_id: agile310
pathway: data-engineer
title: Reviews, Working Agreements, and Handoff
order: 7
kind: lesson
competency_ids:
  - D7-S1-C01
  - D7-S1-C02
objectives:
  - Collaborate through reviews, working agreements, and handoff documentation
---

## The pipeline is finished; the work is not

You have a system that runs itself. Right now it is legible to exactly one person, and that person is you. Every naming decision, every workaround, every "this looks wrong but it is correct because the source does X" lives in your head.

That is the normal end state of a solo build and it is the condition this lesson exists to fix. A data engineer's output is not a pipeline; it is a pipeline plus the shared understanding that lets an analyst trust it, a software engineer integrate with it, a data scientist build on it, and a colleague take it over when you move on. This lesson is about that second half — the two competencies it tags are working effectively with analysts, scientists, and software engineers, and documenting data models, pipelines, and architecture.

It sits here, between the last build milestone and delivery, on purpose. Review practice and documentation taught before there is anything to review is theory. You have real work in flight, with real decisions you now half-remember, which is exactly the material this needs.

## The three people who consume your work

Collaboration goes better when you stop treating "stakeholders" as one audience. Three roles routinely depend on a data engineer, they want different things, and giving each of them the other's version is the most common source of friction.

**The data analyst** consumes your tables. What they need from you is *semantics*: what a row means, what a column means, what is missing and why, and when the data last updated. They will not read your orchestration code, ever. If your fact table has a column called `trips_adj` and the only definition is in a SQL comment, you have made their week harder in a way they may not even report — they will just guess, and their guess will be wrong in a chart somebody presents.

**The data scientist** consumes your data as raw material and cares about the properties that break models: history and its completeness, whether values were ever restated, sampling and filtering you applied, and above all whether a column contains information from the future relative to the row's date. They will ask you point-in-time questions no analyst ever asks. The honest answer to "has this column ever been backfilled with a later version of the truth?" is worth more than any performance number.

**The software engineer** owns the system on the other side of your ingestion, or consumes your output through an interface. They care about contracts and blast radius: what your job does to their API, what your retry behaviour looks like under load, what happens to them if your pipeline is down, and how much notice they get before a schema they depend on changes.

Write one paragraph each for these three audiences about your own capstone. It is a ten-minute exercise and it usually exposes at least one thing you know and have never written down.

## Working agreements

A working agreement is a short, explicit statement of how a team operates, written down before it is needed. Teams that have one argue less, because the argument was had once in the calm rather than repeatedly in the heat.

For a data team, the ones that earn their place are narrow and testable:

- **Definition of done for a data change.** For example: tests pass, the data dictionary is updated, the change ran once on real data, and a peer approved it. Not "it works."
- **Branch and review policy.** Nothing merges to the main branch without one review. Yes, even for a solo capstone — your reviewer is your peer or your instructor.
- **Schema change notice.** Breaking changes to a consumed table get announced a stated number of days ahead, with the migration path. Additive changes need no notice.
- **Ownership and response.** Who is responsible for the pipeline, and what happens when it fails outside working hours. In a capstone this is you, but writing it makes the concept concrete.
- **Where decisions live.** Design decisions in the repository, not in chat. Chat is where decisions get made; the repository is where they are recorded.
- **How data quality issues get reported.** A consumer who spots a wrong number needs one obvious channel and a shape for the report: which table, which rows, what they expected.

Keep it to a page, at `docs/working-agreements.md`. The value is not in the document being comprehensive; it is in the arguments it retires.

## Cadence, briefly

This program delivers work in a rhythm — a milestone, a review, a demo — and that rhythm is what "agile" means in this course's title. It is a delivery cadence, not a curriculum. You are not being assessed on Scrum, and this is not the place to learn it as a framework.

What is worth taking from the surrounding practice is the small set of ceremonies you will meet in any team that works this way, and what each is actually for:

- A **short daily sync** exists to surface blockers, not to report status. The useful contribution is "I am stuck on X and have been for a day", not a list of everything you did.
- **Planning** converts a goal into the smallest set of things that can be finished. The capstone's milestones are your planning increments.
- A **review or demo** shows working software to the people who asked for it. Working, not described. Your milestone reviews are these.
- A **retrospective** improves the process rather than the product. One thing to keep, one thing to change, is enough.

Two habits from that rhythm are worth more than any ceremony. **Make progress visible before it is finished** — a half-built pipeline shown early gets you a correction that costs an hour instead of a rebuild that costs a day. And **raise blockers on the day they appear**. A blocker you sit on for three days has cost the project three days; a blocker you raise the same morning frequently turns out to be somebody else's five-minute answer.

## Reviewing data code

Code review for pipelines is not the same as code review for application code, because the code can be correct while the data is wrong. A review that only reads the diff misses most of what matters.

Ask for evidence alongside the diff. A pull request that changes a transformation should include the before-and-after row counts, or the test output, or a screenshot of the affected rows. Reviewing a SQL change without the numbers is guessing politely.

The questions that find real problems:

- **What is the grain, and does this change it?** Most data bugs are grain bugs.
- **What happens if this runs twice?** Idempotency regressions sneak in through innocent-looking changes.
- **Does this filter drop rows silently?** An inner join is a filter. A `WHERE` on a nullable column is a filter. Both quietly change totals.
- **What does this do to the daily cost?** A new join or an unpartitioned scan can multiply the bill without changing a single output value.
- **Is there a test that would have caught the bug this fixes?** If not, the fix is not complete.
- **Would an analyst understand the new column from its name and its dictionary entry alone?**
- **What is the blast radius if this is wrong — one chart, or every downstream table?**

Give feedback so it can be acted on. Say what you observed, why it matters, and what you would do — in that order. "This join is on `zone_id` but `dim_zone` has duplicate `zone_id` rows in the loaded data, which will inflate the trip counts; can you add a uniqueness test on the dimension?" is a comment somebody can fix in ten minutes. "Are you sure about this join?" is a comment that generates a conversation and no change.

Distinguish blocking from non-blocking. Mark the things that must change before merge, and mark the rest as suggestions, explicitly. Reviewers who do not separate the two get either ignored or resented, and both outcomes cost you the review.

Receiving review well is the same skill from the other side. Assume the reviewer read carefully and misunderstood something you wrote badly, rather than that they misread. Respond to every comment, even if the response is "good catch, fixed" or "I disagree, because the source guarantees uniqueness here — I have added a comment saying so." Silence on a comment reads as refusal. And where a review changes your mind, say so; it is the cheapest way to make the next review honest.

## The documentation that actually gets read

Most project documentation is written once, at the end, and never opened. The documents that survive share two properties: they are short, and each one answers a question somebody actually asks. Five artefacts cover a data pipeline, and together they are the handoff pack you will submit with your final delivery.

**The README** answers "what is this and how do I run it?" One paragraph on what the pipeline does and for whom, the architecture diagram, the prerequisites, the commands to deploy and to run a window, and a map of the repository. Keep it under two screens. If it is longer, the extra belongs in one of the documents below.

**The runbook** answers "it is broken, what do I do?" You started this in Milestone 3. It should contain how to see whether the pipeline is healthy, how to trigger a run, how to backfill, the failure modes you have actually seen with symptom, diagnosis and fix, the freshness expectation, and who to contact. Runbooks are written in the imperative and are read by someone under pressure — short numbered steps, no narrative.

**The data dictionary** answers "what does this column mean?" Every table with its grain, every column with a one-line definition, its type, its nullability, and its source. The version that gets used is the one attached to the tables themselves in the warehouse catalog; a spreadsheet that lives elsewhere goes stale within weeks.

**The architecture document** answers "how does this fit together, and why?" You wrote the first version in lesson 2. Update it to describe what you actually built — including the places where you deviated from the plan and why. A design document that still describes the plan rather than the system is worse than none, because it will be trusted.

**Decision records** answer "why is it like this?" A handful of short entries, each with the context, the decision, and the consequences. Two paragraphs each. Capstone-sized examples: why the landing zone is immutable, why partitions are overwritten rather than merged, why streaming was declined, why the source with better data was rejected on licensing. These are the documents your future self will thank you for, because the reasoning behind a decision is the first thing to evaporate.

Two rules keep all five honest. **Documentation lives in the repository and changes by pull request**, so it is reviewed like code and diffs are visible. And **each document has exactly one job**; the moment the README starts explaining failure modes, both it and the runbook start rotting.

## The handoff itself

A handoff is done when somebody else can operate the system without you. That is a test, not a claim, and it is worth running as one.

The receiving engineer needs five things: access (accounts, roles, secrets, repository), the documents above, one walkthrough conversation, one supervised run, and a named list of known gaps and open risks. That last item is the one people omit out of embarrassment, and it is the most valuable — an honest "the schema change alert has never fired in anger, so I do not know that it works" saves the next person a week of misplaced trust.

Run the test properly: give a peer your repository and your access, and let them run and diagnose the pipeline while you say nothing. Every question they have to ask you is a defect in the documentation. Write each one down as it happens, then fix the document rather than answering better next time.

## Practice

1. **Write your working agreements.** One page, at `docs/working-agreements.md`, covering at least the six items listed above. Where you are working solo, write the agreement as if there were a team of three — the point is the explicitness.
2. **Write the three consumer paragraphs.** One each for an analyst, a data scientist, and a software engineer who depends on your capstone, saying what they need to know about it. Note anything you discovered you had never written down, and add it to the right document.
3. **Review a peer's change properly.** Take a real pull request from a peer's capstone, or a change of your own from earlier in the course. Run the seven review questions against it, and leave written comments that each say what you observed, why it matters, and what you would do — with blocking and non-blocking clearly separated.
4. **Receive a review.** Have a peer review one of your transformation changes with the same questions. Respond to every comment in writing. Where you disagree, argue the technical point and record the outcome in a decision record if it changes the design.
5. **Write three decision records.** Pick three real choices from your build — a modelling decision, a reliability decision, and something you declined to build. Two paragraphs each: context, decision, consequences.
6. **Assemble and test the handoff pack.** Bring the README, runbook, data dictionary, architecture document, and decision records to a state you would hand over. Then run the silent handoff test with a peer: they operate your pipeline, trigger a run, and diagnose a failure you have injected, while you take notes and say nothing. Log every question they had to ask, fix the documents, and record what changed.
