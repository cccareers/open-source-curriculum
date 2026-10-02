---
lesson_id: react100-10
course_id: react100
pathway: software-developer
title: Working from a Project Plan
order: 10
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Work from a project plan to deliver a feature increment
---

## The gap between "build this" and building it

On your own projects, the plan lives in your head and it is good enough, because you are the only person it has to coordinate. On a team it fails immediately. Someone else is waiting on the API shape you chose. A designer needs to know which screen you are starting with. A QA engineer needs to know what "done" means before you are done. A project manager needs to say, on Thursday, whether the release date still holds — and the only information they have is what you told them.

This lesson is about the work between receiving a specification and delivering a working increment of it: reading the spec properly, turning it into a work plan someone else can read, sequencing it so that value arrives early, and reporting progress honestly enough that the plan stays true. It is a genuine skill with its own failure modes, and it is the one an apprentice is most often assessed on in their first months, because it determines whether you can be given work at all.

Everything here is grounded in React work, and the running example is the reservation feature you prototyped in lesson 09. The plan is for building it for real.

## Where your ticket sits

You do not need a treatise on software development lifecycles. You need to know which phase your work is in, what came before it, and what happens after — because that tells you who to ask, what you can assume, and what you must not decide alone.

Whatever the process is called, the same phases exist:

**Requirements.** Someone decided what problem is being solved and roughly for whom. Output: a specification, a set of user stories, or in a formal shop a software requirements specification. You are usually a reader here, but you are expected to ask questions, and questions asked at this stage are free.

**Design.** How it will be built: interaction design, the component structure from lesson 02, the data shapes, the API contract. Apprentices contribute under supervision, and the prototyping from lesson 09 often lives here.

**Implementation.** Your main phase. Code, review, merge.

**Testing.** In an incremental team this overlaps implementation continuously rather than following it. Someone other than you exercises the feature against the acceptance criteria.

**Deployment and maintenance.** Release, monitoring, and the defects that come back.

The difference between waterfall and iterative delivery is not whether those phases exist; it is how big a batch goes through them at once. Waterfall runs them once for a large scope. An agile process runs the same sequence for a small slice, every week or two. Either way, when you are handed a ticket, three questions tell you where you stand: **has the design been agreed, or am I deciding it? Who signs off that this is done? What is the deadline this sits inside?** A developer who does not know the answers is guessing.

## Reading a specification

Read the whole thing before writing anything. Then read it again looking for what is missing, because what is missing is where your week goes.

A specification you can build from has four parts, and you should check for each one explicitly.

**The problem and the user.** Who has this problem, and what happens today without the feature? "Members currently ask in the group chat whether a tool is free, and get double-booked" tells you far more than "add reservations". If the spec has no user and no problem, you cannot make the twenty small judgment calls that building it requires.

**The scope, including what is out.** A spec that says what is *not* included is worth twice one that does not. If it does not say, write your own out-of-scope list and get it confirmed — that list is the cheapest insurance available.

**Acceptance criteria.** Specific, observable statements that will be true when the feature works. These are what QA tests against and what you build against. Good ones read like this:

- A member can select a start date and an end date and submit a reservation request for an available tool.
- A member cannot submit a reservation whose period overlaps an existing confirmed reservation for that tool; attempting it shows an error naming the conflicting dates.
- A reservation cannot start in the past.
- The tool detail page lists the tool's upcoming confirmed reservations in date order.
- The reservation form is fully operable by keyboard and meets the project's WCAG AA commitment.

Notice they are observable — someone else can check each one without reading your code — and that none of them describes an implementation. "Uses a calendar component" is not an acceptance criterion; it is a design decision that may or may not be yours.

**Constraints.** Deadline, browser support, the design system, the accessibility level, the API you must use, anything you may not change.

When something is missing, ask — in writing, in the ticket, so the answer is where the next person will look. Two habits make those questions land well. Ask them in one batch rather than trickling them out over three days. And ask each one with a proposed answer attached: "The spec does not say whether a member can reserve their own tool. I propose allowing it, since it is how they block out dates for their own use. Confirm?" That is a question a busy person can answer in five seconds, and it demonstrates you have thought about it. A bare "what should happen here?" costs them the same thinking you were meant to do.

The one thing you must not do is quietly decide an ambiguity in your own favor because asking felt slow. That is how a feature gets built, reviewed, tested, and then rejected in the demo.

## From specification to work plan

Now the part that is specifically yours: turning the spec into a sequence of tasks. Do this in writing before you start, even for two days of work. It takes half an hour and it is what makes your estimate mean anything.

**Step one: name the pieces.** Use lesson 02's method on the mockup — what components exist, which are new, which already exist and need changing. Add the non-component pieces: data shapes, API calls, validation rules, state and where it lives.

For the reservation feature:

```text
New components:   ReservationForm, DateRangeField, ConflictNotice,
                  ReservationList, ReservationRow
Changed:          ToolDetail (host the form and the list),
                  AvailabilityBadge (show "reserved until")
Data:             Reservation { id, toolId, memberId, start, end, state }
API:              GET /tools/:id/reservations, POST /reservations
Logic:            overlap detection, past-date validation
State:            form values in ReservationForm; the reservation list
                  fetched in ToolDetail
```

**Step two: cut it into tasks that can be finished.** A good task is between half a day and two days, produces something demonstrable, and has a clear finish line. Bigger than two days and you cannot report progress on it honestly; smaller than half a day and the tracking overhead exceeds the work.

Cut **vertically** wherever you can — a thin slice that goes all the way through — rather than horizontally by layer. "All the components, then all the state, then all the API calls" gives you nothing that works until the very end and a plan whose progress you cannot see. "Display existing reservations end to end" gives you something demonstrable on day one.

```text
T1  Fixture data + Reservation shape agreed with the API owner        0.5d
T2  ReservationList renders confirmed reservations from fixtures      0.5d
T3  ToolDetail fetches real reservations; loading/error/empty states  1.0d
T4  ReservationForm with controlled date fields, no validation        1.0d
T5  Client-side validation: required, not past, end after start       0.5d
T6  Overlap detection + ConflictNotice                                1.0d
T7  Submit to the API; success, failure, and in-flight states         1.0d
T8  Accessibility pass: labels, errors, focus, live region            0.5d
T9  Responsive pass at 320px and 400% zoom                            0.5d
```

**Step three: mark the dependencies and the unknowns.** T7 depends on the API existing; if it does not yet, that is a dependency on another person and it belongs in the plan as a risk, not as an assumption. Mark anything you have not done before — for most people here that is T6 — because those are the estimates most likely to be wrong.

**Step four: estimate, and say how confident you are.** Estimate each task, not the whole feature; small estimates are much better than large ones, and their errors partly cancel. Estimate the work you will actually do, which includes reading existing code, writing the pull request description, review, and rework — a task "done except for review" is not done. Then add a contingency for the whole plan, name it as contingency rather than hiding it inside the tasks, and give a range instead of a point: "seven days, with an eighth if the overlap logic surprises me." A range is honest and a point estimate presented as certainty is not.

Two things people underestimate every single time: integrating with an API someone else is still building, and the accessibility and responsive passes when they were left to the end. The second is avoidable — build to the standard as you go and the pass at the end is a check rather than a rewrite.

**Step five: order them.** Riskiest thing first, when you can. If T6 is the piece that might be much harder than you think, doing it on day two means the bad news arrives while there is still time to react. Doing it on day seven means the bad news arrives at the deadline. Beyond that, order so that something is demonstrable as early as possible — a plan that can show progress every second day is a plan that survives contact with a stakeholder.

## The artifact

Write the plan somewhere the team looks: the ticket, the tracker, a short document linked from it. It needs six things and it should fit on one screen.

1. **What is being delivered**, in one or two sentences.
2. **The acceptance criteria** you are building against, copied or linked, so there is no drift between your understanding and the spec.
3. **The task list**, with estimates and order.
4. **Dependencies** — what you need from other people, by when, and who owns each.
5. **Risks and assumptions** — anything you decided in the absence of an answer, flagged so a reviewer can correct it cheaply.
6. **Your definition of done** for the increment: criteria met, reviewed and merged, accessibility check passed, no known defects above minor, documentation and notes updated.

That last item deserves emphasis because it is the most common source of a disagreement at the end of a sprint. Agree what done means at the start, in writing, and "done" stops being an opinion.

## Delivering the increment

A plan is worth something only if the way you work lets you report against it.

**Work in small, complete pieces.** One task, one branch, one pull request. A pull request that changes six files and does one thing gets reviewed in twenty minutes; one that changes sixty and does four things sits for two days and gets a shallow review. Small increments are not a courtesy to the reviewer — they are what keeps your progress visible and your rework cheap.

**Keep the application working.** Every merge should leave the app in a state you could show someone. If a piece cannot be finished in one go, land the parts that are safe and keep the incomplete part out of the user's path until it is ready.

**Write the pull request for the reviewer.** What changed, why, what you tested, what you deliberately did not do, and anything you want a second opinion on. Link the ticket. A reviewer who has to reconstruct your intent from a diff reviews the diff, not the intent.

**Follow the team's source-control conventions rather than your own.** Branch naming, commit message format, whether the branch is rebased or merged, who approves. These vary by shop and they are not worth an argument; find out on day one and comply.

**Keep notes as you go.** What you changed, decisions you made and why, and anything that must not be changed by someone else without care — the overlap comparison being inclusive at the boundaries, say, or a hard-coded timezone assumption. Those notes are what let the next person modify your work safely, and they are much cheaper to write while you remember than to reconstruct later.

## Reporting progress

The plan's real function is to make honest reporting possible. Three rules.

**Report against the plan, not against your feelings.** "T3 and T4 are merged, T5 is in review, I am starting T6 today" is information. "Going well" is not.

**Raise a slip the day you see it, not the day it is due.** A task that was estimated at one day and is on its second morning is news, and it is news with options attached — cut scope, get help, change the order. The same news on Friday afternoon has no options. Nobody on a functioning team is upset by an early warning; they are upset by a late surprise. This one behavior does more for your reputation as an apprentice than any amount of clever code.

**Distinguish a blocker from a difficulty.** A blocker is something you cannot proceed through without someone else — a missing API, an access credential, an unanswered decision. Say so immediately, name what you need and from whom, and switch to another task while you wait. A difficulty is something hard that you are making progress on; timebox it, and if the box runs out, ask. A common and useful team norm is that thirty to sixty minutes stuck on the same thing is the point at which you ask, because the cost of your time exceeds the cost of interrupting someone.

Keep the tracker current — move the card when the state changes, not in a batch on Friday — because a project manager reading a stale board makes commitments on your behalf that are not true.

**Communicate outward as well as upward.** If the reservation API's shape changed, the person building against it needs to know from you. If the design is ambiguous at 320 pixels, the designer needs to know before you invent an answer. If an acceptance criterion cannot be tested as written, tell QA while there is time to reword it. Coordinating with the people around your ticket is a large part of what "working from a plan" means in practice.

## When the plan changes

It will. New information arrives, an estimate was wrong, someone changes their mind.

**Scope added mid-flight is a change, not a favor.** "While you're in there, could you also…" is a reasonable request and it has a cost. Say yes with the cost attached: "That is about a day, which pushes T8 and T9 past Thursday. Do you want it in this increment or the next?" Make the trade-off visible and let the person who owns the deadline decide. Absorbing changes silently is how a plan becomes fiction and how a developer ends up blamed for a slip they reported to nobody.

**An estimate that is wrong should be re-estimated, once, out loud.** Not quietly extended day by day. Say what you found, what it now looks like, and what you would cut to hold the date.

**Update the plan when it changes.** A plan that no longer matches reality is worse than none, because people are still making decisions from it. Editing the task list and the estimate takes five minutes and keeps the artifact true.

## Practice

Work from the reservation feature you prototyped in lesson 09. Your instructor will supply a short written specification; if none is supplied, write one for the acceptance criteria listed in this lesson and have it reviewed before you plan against it.

1. **Interrogate the spec.** Read it twice and write, in a new `PLAN.md`, the four parts you can identify — problem and user, scope, acceptance criteria, constraints — and everything you cannot. List at least five genuine ambiguities.

2. **Ask well.** Turn each ambiguity into a written question with a proposed answer attached, in one batch, in the format you would post in a ticket. Have your instructor or a peer answer them in role, and record the answers.

3. **Write the acceptance criteria** you will build against — six to ten of them, each observable by someone who cannot read your code, none of them describing an implementation.

4. **Break the feature down.** List the new components, the changed components, the data shapes, the API calls, the validation rules, and where each piece of state will live.

5. **Cut the tasks.** Produce a task list of six to twelve items, each between half a day and two days, each demonstrable, cut vertically rather than by layer. Mark dependencies on other people and flag the tasks you have never done before.

6. **Estimate and sequence.** Estimate each task, state your confidence, add named contingency, and give a range for the total. Order them riskiest-first and so that something is demonstrable by the end of day one. Write a sentence justifying the position of your riskiest task.

7. **Publish the plan.** Assemble `PLAN.md` with all six required sections including your definition of done for the increment, and have it reviewed by a peer or your instructor before you write any code. Record the feedback and what you changed.

8. **Deliver two increments.** Build the first two tasks in the plan, one branch and one pull request each, following your team's or your instructor's source-control conventions. Each pull request description must state what changed, why, what you tested, and what you left out.

9. **Report daily.** For at least three working days, post a short written status against the plan: what is done, what is in progress, what is next, anything blocked. Keep them all in `PLAN.md`.

10. **Handle a change.** Your instructor will inject a scope change or a new constraint partway through. Respond in writing with the impact on the plan, at least two options, and a recommendation — do not simply absorb it. Then update the plan.

11. **Slip something on purpose.** Choose one task, and when it goes past its estimate — or simulate that it has — write the slip report you would send: what happened, the revised estimate, what you would cut to hold the date, and what you need from anyone else.

12. **Keep change notes.** Maintain a short notes file recording what you changed, the decisions you made and why, and anything a future developer must not alter without care.

13. **Review the plan against reality.** At the end, write a paragraph comparing your estimates to what actually happened. Which task was most wrong and why? What would you estimate differently next time? An honest analysis of a bad estimate is worth more than a lucky good one.

**Deliverable:** `PLAN.md` containing your spec analysis, batched questions with answers, acceptance criteria, component and data breakdown, an estimated and sequenced task list, dependencies, risks, a definition of done, at least three daily status reports, your response to the injected change, a slip report, and your closing estimate review; plus two merged pull requests delivering the first two tasks, and a notes file recording your decisions.
