---
lesson_id: web102-07
course_id: web102
pathway: software-developer
title: 'Project: Portfolio Build and Demo'
order: 7
kind: project
competency_ids:
  - D2-S1-C04
  - D1-S1-C02
objectives:
  - Present a finished project and explain the decisions behind it
---

## The goal

Build one browser project you chose and scoped yourself, then stand in front of people and demonstrate it live — the working software, and the reasoning behind the decisions you made building it.

This is the piece you will show to an employer, so it is yours in a way the last two were not: nobody hands you the specification. You write it, you get it approved, you build it, and then you explain it out loud to an audience who has not seen it before and cannot read your code while you talk.

Two competencies are assessed and they are marked separately and equally. The first is the software: does it work, does it meet the specification you wrote, is it built well enough to show someone. The second is the presentation: can you plan and deliver a clear, well-structured spoken explanation of a technical thing to a room. Excellent software presented badly fails half of this project, and that is not a technicality — a developer who cannot explain their work is a developer whose work gets rewritten by somebody who can.

Budget seven hours: about five building, one preparing and rehearsing the demo, one for the demo session itself and the demos you watch.

## Choosing what to build

Pick something you would be willing to put on a job application. The best choice is usually a small tool that solves a real problem you actually have, because you will be asked why you built it and "it was on the list" is a weak answer.

It must fit these boundaries:

- It runs entirely in the browser: HTML, CSS, vanilla JavaScript, the DOM, `fetch`, `localStorage`.
- It is genuinely finishable in about five hours of building. Scope down until it is, then scope down once more.
- It is materially different from the shift board and the dashboard. A third table with filters is not a portfolio piece.
- It has at least one meaningful interaction and at least one non-trivial technical decision you can talk about for two minutes.
- It contains nothing you cannot show publicly: no real personal data, no employer's data, no credentials.

Workable shapes, if you need a starting point: a tool that turns a text input into something structured and useful; a small planner or tracker with persistence and sensible states; a page that fetches from a public no-key API and does something the API's own page does not; an accessible reimplementation of a common widget that is usually built badly; a visualization of a small public dataset you find interesting.

Before you write any code, write a one-page specification and get it approved by your instructor or lead. It must state: what the thing is in two sentences, who would use it and for what, the five to eight requirements that define done, the four to six increments you will build in with estimates, what is explicitly out of scope, and the technical decision you expect to be the interesting one. This is the same planning work as lesson 02, and getting the scope signed off before you build is exactly what stops a portfolio project from being 80 percent finished forever.

An unapproved scope is the most common way this project goes wrong. If you cannot get sign-off within the first hour, build the smallest version of your idea rather than waiting.

## Build requirements

**R1 — It meets the specification you got approved.** Every requirement in your approved one-pager is met, or is explicitly listed at hand-in as dropped with a reason. A dropped requirement you declare costs you very little; one a reviewer discovers costs a lot.

**R2 — It runs from a clean clone.** Clone, serve statically, open the URL, and it works — no build step, no manual setup step, no file you forgot to commit. `README.md` says how in ten lines or fewer.

**R3 — It is state-driven.** One place holds the application state, one render path produces the view from it, handlers change state and re-render. No information lives only in the DOM.

**R4 — Every state a user can reach is handled.** Empty, loading if anything is asynchronous, error, and the ordinary case. Invalid input is rejected with a message that says what to do instead. Nothing silently does nothing.

**R5 — It is accessible and responsive.** Usable at 360 pixels wide with no horizontal page scrolling, fully operable by keyboard with visible focus, controls with accessible names, and text that meets contrast expectations. This is a requirement, not polish — it is one of the first things a technically literate interviewer checks.

**R6 — The console is clean.** No errors and no leftover debug logging during normal use.

**R7 — The code is organized and readable by a stranger.** At least three ES modules with clear responsibilities, no globals on `window`, consistent formatting, no commented-out blocks, no dead code, and names that say what things are. Somebody will read this file in an interview.

**R8 — The history shows the work.** At least four feature branches merged following your `CONTRIBUTING.md`, at least twelve commits with useful messages, `PLAN.md` current with estimates against actuals, and any known defects recorded in `ISSUES.md` with their status rather than left as surprises.

## Demo requirements

The demo is a live session of **ten minutes presenting plus five minutes of questions**, delivered to an audience of at least three people — your cohort, your instructor, and ideally at least one person who is not a developer.

**R9 — It is live, and it is the running software.** You drive the actual application in front of the audience. A recorded video, an animated mock-up, or a walk through screenshots does not satisfy this. Slides may support the demo but must not replace it; if you use them, no more than five and none of them a wall of text.

**R10 — It follows a planned structure.** Not a tour of your files and not a chronological account of your week. This shape works and you should have a reason if you deviate:

1. **The problem**, in under a minute. Who has it, why it matters. No jargon.
2. **The demo itself**, four to five minutes. Drive one realistic path through the software from a user's point of view, in a sensible order, narrating what you are doing and why — not what the audience can already see.
3. **The decisions**, two to three minutes. Two or three real choices you made, each stated as: what the options were, what you chose, and what you traded away. This is the part being assessed most closely.
4. **What is not done**, under a minute. Known limitations, defects you recorded, what you would do next. Honesty here reads as competence, not weakness.
5. **Questions**, five minutes.

**R11 — You explain decisions, not features.** At least two of your decisions must be discussed with a real alternative you considered and rejected, and the trade-off you accepted. "I used `localStorage` because it's easy" is not a decision explanation. "I needed it to survive a refresh but not to follow the user to another device, and I did not want an account system for a tool used once a day, so `localStorage` — the trade is that clearing site data loses everything, which I tell the user in the empty state" is.

**R12 — It is pitched at the audience.** At least one person watching is not a developer. Introduce a technical term the first time you use it, in five words, or avoid it. If nobody who is not a developer could say afterwards what your project does, the demo has failed regardless of how good the code is.

**R13 — It fits the time.** Ten minutes means between nine and eleven. You will be timed. Running long is the most common failure and it always costs the "what is not done" section, which is the one that makes you look senior. Rehearse out loud at least twice, timing yourself, and cut until it fits — the second rehearsal must be against a clock with somebody watching.

**R14 — You handle the questions.** Answer directly, briefly, and honestly. If you do not know, say "I don't know, here is how I would find out" — that answer scores well and a bluffed one scores zero. If a question is really a suggestion, say what you think of it. Expect at least one question about something you did not build and at least one about why you did something the way you did.

**R15 — There is a fallback.** Live demos fail: wifi drops, a file gets served from cache, a laptop decides to update. Have a plan you can execute in fifteen seconds — the project running locally with no network dependency, a second device, or a short screen recording of the main path held in reserve. Say what your fallback is in your notes. Using the fallback because something genuinely broke is not a penalty; standing there with nothing is.

## Constraints

- **Browser only.** No server you wrote, no framework, no build step, no CSS framework. ES modules served statically.
- **No API keys, accounts, or secrets.** Any API you use must be public and keyless.
- **At most two runtime dependencies,** each justified in `PLAN.md` with what you tried first.
- **Original work.** Starting from a tutorial's finished project is not a portfolio piece. Code you adapted from elsewhere is cited in the README, and you must be able to explain every line of it.
- **Nothing on screen you would not show a stranger.** Check your bookmarks bar, notifications, and any test data before you present.
- **Five hours of building.** If you are over, cut scope, do not cut the demo preparation.

## Out of scope

Backends, databases, authentication, deployment pipelines, containers, and automated test frameworks. Later courses own these. Publishing the finished page somewhere public is optional and earns no marks, though it is a good idea for your own use afterwards.

## Definition of done

- A clean clone plus a static server gives a working application, per a README of ten lines or fewer.
- Every requirement in the approved specification is met or declared dropped with a reason.
- Empty, error, invalid-input, and ordinary states all behave sensibly; the console is clean.
- At 360 pixels wide there is no horizontal page scrolling; everything is keyboard-operable with visible focus and named controls.
- State drives the render; no information lives only in the DOM; at least three modules and no globals on `window`.
- History shows at least four merged branches and twelve commits; `PLAN.md` has estimates against actuals; `ISSUES.md` records known defects with status.
- The demo was delivered live, to at least three people, driving the running software, within nine to eleven minutes.
- The demo covered problem, demonstration, decisions, and limitations, in that order.
- At least two decisions were explained with the alternative considered and the trade-off accepted.
- Every question was answered directly, including at least one honest "I don't know" if one arose.
- A fallback existed and was named in the notes.
- `DEMO.md` is committed, containing the outline, the decisions you planned to explain, your two rehearsal timings, the fallback plan, and — added afterwards — the questions you were asked with your answers and what you would change next time.

## How you will be assessed

**Building working features.** A reviewer clones the repository, runs it, and works through your own approved specification requirement by requirement, then goes after the edges: empty input, a very long input, the keyboard only, a narrow window, the console. They will read two files of your code and judge whether a stranger could work in it. Because you wrote the specification, its ambition is part of the assessment — a trivially scoped project done perfectly and a slightly-too-ambitious one that is honest about what it did not finish both score fine; an over-scoped project presented as complete does not.

**Preparing and delivering an oral presentation.** Marked live, against R9 through R15, on: whether the demo had a structure the audience could follow rather than a wander; whether you explained decisions with alternatives and trade-offs rather than listing features; whether you were understandable to the non-developer in the room; whether you kept to time; whether you looked at your audience rather than reading; and whether your answers in the question period were direct and honest. Nervousness costs you nothing. Being unprepared, over-running, reading a script, or hiding a limitation costs you a lot.

You are also expected to watch every other demo in the session and ask at least one real question in each — questions are part of the assessment for the person asking as well as the person answering.

## Hints

**Choose smaller than you want to.** The strongest portfolio pieces in this course are small tools that are completely finished and completely explained. Nobody is impressed by an ambitious half-thing, and you cannot demo a half-thing in ten minutes.

**Write the demo outline in the first hour, before you build.** It tells you what must exist for the demo to work, which is the correct order to build in. If a feature does not appear in the demo, ask whether it needs to exist at all.

**Keep a decisions log as you go.** Every time you choose between two approaches, write two lines in `PLAN.md`: what you picked and what you rejected. Reconstructing those the night before produces vague answers, and vague answers are exactly what R11 is testing.

**Prepare your demo data in advance and commit it.** Typing into a form live is slow and error-prone. Have the state you want already loaded, or a one-click way to load it, and make sure the data is realistic — a demo full of `asdf` and `test 1` undercuts everything else you say.

**Rehearse standing up, out loud, with a timer.** Reading your outline silently takes four minutes and tells you nothing. Speaking it takes eleven. The gap between those two numbers is where every over-run comes from.

**Cut the setup, not the substance.** When you are over time, the fix is almost never in the demonstration; it is in the two minutes of preamble about how you got the idea. Start closer to the software.

**Do not narrate your clicks.** "Now I click here, and here" tells the audience what they can see. Say why: "I'll add a shift the way a coordinator would at the start of a week."

**Increase your font size and close everything else.** Your terminal, your editor, and the browser at a size readable from the back of the room. Do this before the session, not during it.

**Practice the "I don't know" out loud once.** People bluff under pressure because they have never rehearsed the alternative. It is one sentence and it costs you nothing.

**Have the fallback open in another window before you start.** A fallback you have to find is not a fallback.

## What to hand in

1. The repository URL, with the project on `main`, plus `README.md`, `PLAN.md`, `ISSUES.md`, `DEMO.md`, and `CONTRIBUTING.md`.
2. Your approved one-page specification, and a note of anything you dropped from it and why.
3. The output of `git log --oneline --graph`, and links to at least four merged pull requests.
4. Screenshots of the finished project, including one at 360 pixels wide.
5. `DEMO.md` completed after the session: outline, planned decision explanations, two rehearsal timings, fallback plan, the questions you were asked with your answers, and three sentences on what you would do differently next time.
6. The names of the people who watched, and your timed length.
