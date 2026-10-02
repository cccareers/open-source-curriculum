---
lesson_id: react100-11
course_id: react100
pathway: software-developer
title: 'Project: Build and Demo a React Application'
order: 11
kind: project
competency_ids:
  - D2-S1-C04
  - D1-S1-C02
objectives:
  - Present a working React application and the reasoning behind it
---

## The goal

Build a complete React application of your own, from an empty Vite project to something a stranger can use, and then stand up in front of the group and explain it in ten minutes.

Both halves are the deliverable, and they are weighted seriously. An application nobody can follow you through is half a project, and a polished presentation about an application that does not work is worth nothing at all. The pairing is deliberate: on a real team you will be asked to demonstrate what you built and defend the decisions inside it far more often than you will be asked to write a novel algorithm, and the developers who can do that are the ones who get given the interesting work.

Everything you need is in lessons 02 through 10. This project asks you to use all of it at once, on a problem you chose, without a lesson telling you which technique applies.

Budget the full ten hours: roughly seven on building, one on preparing the presentation, one on rehearsing and fixing what rehearsal exposes, and one in reserve. The reserve is not optional — something will break the day before.

## What to build

Choose your own application, subject to the shape below. Pick something you can describe to a stranger in one sentence and finish in seven hours. Ambition is not what is being marked here; completeness is.

Your application must be a single-page React application with:

- **A list of items** loaded from a remote API, rendered from data, with search or filtering.
- **A detail view** for a single item, shown in the same page.
- **A form** that creates or edits something, with validation.
- **State that is shared** between at least two sibling components, lifted to their common parent.

Workable ideas, if you do not have one: a public-library search over an open books API; a recipe browser with a "what's in my kitchen" filter; a transit-line status board; a plant-care tracker; a job-application tracker; a language flashcard reviewer; a museum-collection browser. Anything with a list, a detail, and a form qualifies.

Continuing your `toolshare` project is allowed, but only if you take it meaningfully further than lesson 09 left it, and you must say clearly in the presentation what is new. A fresh application is usually the safer choice, because it forces you to build the whole structure yourself.

You need a real data source. Use any free public API that returns JSON over HTTPS and allows browser requests, or a mock API service you have populated with your own records. If your chosen API has no write endpoint, your form may submit to local state instead — say so in the presentation, and make the request path realistic anyway with an in-flight state and a failure branch.

## Requirements

Numbered so a reviewer can grade them one at a time. Each states what must be true, not how to type it.

**R1 — A deliberate component structure.** The application is composed of at least eight components, each with a single stated responsibility, in a hierarchy you designed rather than one that accumulated. No component's returned markup exceeds roughly one screen. Files are one component each, named for the component, in a structure a stranger can navigate.

**R2 — Data flows down through props.** Components receive what they need as props. No component reaches into another's internals, no prop is mutated, and at least two components are used more than once with different props. At least one component uses `children` or an element prop for composition rather than a configuration flag.

**R3 — State lives in the right place, and only where needed.** Every piece of state is held by the closest common ancestor of the components that need it. At least one piece of state is lifted from where it was first written to a parent because a sibling needed it. No value that can be calculated from props or state is stored in state.

**R4 — Events are handled correctly.** User actions are handled by handlers on semantic elements. State that depends on previous state uses the updater form. Objects and arrays in state are replaced, never mutated.

**R5 — Lists are rendered with stable keys.** Every list is rendered from data with a key derived from the item's identity, never from its array index. The list handles all of its states: populated, loading, error, genuinely empty, and filtered-to-nothing — with distinct, actionable messages for the last two.

**R6 — A form built from controlled inputs.** Every field is controlled, with a defined initial value of the correct type. The form submits through a `<form>` element with `preventDefault`. Validation runs on submit and on blur, produces messages that say what to do, and blocks submission while invalid. An in-flight state disables the submit and a failure is shown to the user.

**R7 — Remote data, handled honestly.** At least one `useEffect` loads data from the API, checks `response.ok`, and handles loading, success, error, and empty states with a single status value rather than competing booleans. The effect cleans up correctly: no state is written by a request that is no longer current. Refetching driven by a filter or a selection must not produce a race, and a search-driven request must be debounced.

**R8 — Accessible to the level the pathway commits to.** Semantic elements throughout; a heading outline with one `<h1>` and no skipped levels; landmarks and a skip link; every control with an accessible name; every form field with an associated `<label>` and errors wired with `aria-describedby` and `aria-invalid`; a visible focus style; full keyboard operation with a sensible tab order; dynamic changes announced through a live region; text contrast of at least 4.5:1; and no state signaled by color alone. An automated scan of every view must report no critical issues.

**R9 — Responsive and reflowable.** The application is usable at 360 pixels wide and at 320 pixels of effective width under 400 percent zoom, with no horizontal scrolling, clipping, or overlap. Layout adapts at breakpoints chosen from your content, expressed in `rem`. Tappable targets are at least 44 pixels.

**R10 — It runs from a clean clone.** Someone who has never seen your machine can clone the repository, run `npm install` and `npm run dev`, and use the application. Any API key or base URL is read from an environment variable, with a committed `.env.example` and the real `.env` gitignored. No key appears anywhere in the repository's history.

**R11 — A README a stranger can use.** Under one page: what the application does, who it is for, how to run it, what data source it uses, and a short list of what you would do next. No screenshots of code, no marketing.

**R12 — A decision record.** A `DECISIONS.md` listing at least five decisions you made and the reasoning behind each: your component boundaries, where a particular piece of state lives, why you chose that data source, a trade-off you accepted, and something you deliberately left out. Two or three sentences each. This is the document your presentation is built from.

**R13 — Real commit history.** The work is visible in the repository as a series of commits with meaningful messages. One commit called "final" is not acceptable evidence of how the application was built.

**R14 — A live demonstration.** Specified in full below.

## The presentation

This is a graded deliverable in its own right, and it is the one most people under-prepare. Ten minutes, plus five for questions, delivered live to the group.

**Structure it like this, and rehearse to the clock:**

1. **The problem, in under a minute.** What does this application do, for whom, and why would anyone open it? Start here, not with your file tree. An audience that does not know what the thing is for cannot follow anything you say afterwards.

2. **A live demonstration, three to four minutes.** Drive the running application through one complete, realistic task from start to finish — find something, look at it, submit the form, see the result. Narrate what you are doing and why a user would do it. Show at least one thing going wrong on purpose: a validation failure, or an empty search. Do not click through every screen you built; one story told well beats a tour.

3. **Two or three decisions and their reasoning, three to four minutes.** This is the core of the talk, and the part that separates a demo from a presentation. Pick decisions from `DECISIONS.md` where there was a real alternative, and for each one say what the options were, what you chose, and why. Show the relevant code only if it makes the point faster than words — five to fifteen lines on screen, at a font size the back row can read, never a whole file.

4. **What you would do next, under a minute.** What is unfinished, what you would change knowing what you know now, and what you would build with another week. Naming a weakness in your own work is a strength; a reviewer will find it anyway, and finding it yourself first is the difference between a developer who is learning and one who is defending.

5. **Questions, five minutes.** Expect to be asked why you put a piece of state where you put it, what happens if the API is down, how the interface works for someone using a keyboard only, and what the hardest part was. "I don't know, and here's how I'd find out" is a perfectly good answer and much better than a confident guess.

**Requirements for the delivery itself:**

- **You must demonstrate the running application live**, not a video and not screenshots. Have it already running, on the correct screen, with your browser windows and tabs arranged before you start.
- **Slides are optional and strictly limited.** If you use them, no more than five, and no slide with more than about twenty words on it. Nobody reads a slide and listens to you at the same time. Diagrams and screenshots are welcome; paragraphs are not.
- **Rehearse out loud at least twice, timed.** Silently reading your notes is not rehearsal and will not reveal that your demo takes six minutes.
- **Prepare for the demo failing.** Have fallback screenshots of the key screens, and know how to keep talking while something loads. If the network dies, the presentation continues.
- **Speak to the audience, not the screen.** Face the room, keep your terminal font large, and close every notification before you begin.

**What a strong presentation sounds like:** it explains before it demonstrates, it demonstrates one coherent story, it justifies choices instead of narrating code line by line, it names its own limitations, it finishes on time, and it answers the actual question that was asked.

**What a weak one sounds like:** a file-by-file tour of the repository, a reading of the code aloud, a demo with no narration, "as you can see" pointing at something nobody can see, running over time and being cut off before the interesting part, and defensiveness when questioned.

## Constraints

- **Hooks and function components only.** No class components.
- **No router and no external state-management library.** Switching between list and detail is done with state you own. Both belong to react200, and using them here removes the thing being assessed.
- **No component library and no CSS framework.** Write your own CSS. You may use a small utility for dates or formatting, but the interface must be yours.
- **No TypeScript required** and none expected. Plain JSX.
- **No backend of your own.** Use a public API or a hosted mock. Building a server is a different course.
- **No testing framework required.** Manual verification against the requirements is what is being assessed here.
- **The application must run locally.** Deploying it is welcome and adds nothing to the grade; a live URL is not a substitute for a working local clone.
- **Your own work.** Using documentation and reading examples is expected. Submitting a tutorial project, or code you cannot explain line by line under questioning, fails the project outright. Every question in the review is aimed at something you should be able to explain about your own application.

## Out of scope

Named explicitly so you do not spend your ten hours on them: routing and URL state; a global store; authentication, accounts, and permissions; server-side rendering; a build or deployment pipeline; automated tests; animation libraries; internationalization; offline support; and performance optimization beyond not doing anything obviously wasteful. None of these will raise your grade, and each one will crowd out a requirement that will.

## Definition of done

Every statement below must be true and independently checkable by a reviewer with your repository and fifteen minutes.

- A clean clone plus `npm install` plus `npm run dev` produces a running application, following the README alone.
- The application loads real data from a remote API and displays it.
- Search or filtering narrows the list, and selecting an item shows its detail view.
- The form validates, blocks an invalid submit with useful messages, shows an in-flight state, and reports failure.
- All five list states can be produced by a reviewer: populated, loading, error, empty, and filtered-to-nothing.
- Breaking the API URL produces a visible error state, not a blank page and not a crash.
- Every list uses a stable non-index key.
- No mutation of props or state anywhere in the code.
- No value is stored in state that could be calculated during render.
- The entire application can be operated from the keyboard, with focus always visible, and the primary task completed without a mouse.
- An automated accessibility scan of every view reports no critical issues.
- The application reflows without horizontal scrolling at 320 pixels of effective width.
- No API key or secret exists in the repository; `.env.example` is committed and `.env` is ignored.
- `README.md` and `DECISIONS.md` are present and meet R11 and R12.
- The commit history shows the work.
- The presentation was delivered live, within the time limit, including a live demonstration and at least two justified decisions, and questions were answered.

## How you will be assessed

Two competencies are marked separately.

**Building program features using appropriate languages and development methods.** Graded against R1 through R13, as evidence. A reviewer will clone the repository, run it, complete the primary task, break the API on purpose, empty the search, tab through the interface, run an accessibility scan, shrink the window, and read the code for mutation, index keys, derived state, and effect cleanup. Partial credit comes from requirements passed, so a smaller application that satisfies every requirement scores considerably better than an ambitious one with three requirements half-done. Choose scope accordingly.

**Preparing and delivering an oral presentation that clearly conveys information, concepts, and ideas.** Graded on the delivery, against five things: whether the audience understood what the application does and why within the first minute; whether the demonstration told one coherent story rather than touring the code; whether the decisions were explained with their alternatives rather than narrated; whether you kept to time; and whether the answers to questions were accurate and honest. Nerves cost you nothing. Being inaudible, running over, reading from a script, or being unable to explain your own code cost you a great deal.

## Hints

**Choose scope on day one and write it down.** The most common way this project goes wrong is an application twice the size of the ten hours available, half-finished in every direction. Write your one-sentence description, list the requirements, and cut anything not serving them.

**Build a vertical slice first.** Fetch the list and render it, badly styled, on the first afternoon. Everything else attaches to something that already works. Do not build all the components first and connect them at the end.

**Do the accessibility and responsive work as you go.** Both R8 and R9 are hours of retrofitting if left to the end and nearly free if built in from the start. Label a field when you create it; check a new component at 360 pixels while it is fresh.

**Check the API before you commit to it.** Ten minutes with `fetch` in the browser console tells you whether it allows browser requests, whether it needs a key, what the response shape is, and whether it is fast enough. Discovering a CORS refusal on day three is a rewrite.

**Keep your fixture data.** Build against a hard-coded array first, then swap in the fetch. When something breaks later you can swap back and find out in one minute whether the problem is your component or the network.

**Write `DECISIONS.md` while you decide, not at the end.** The reasoning is vivid on the day and vague by the weekend, and this file is the raw material for the strongest part of your presentation.

**Prepare demo data deliberately.** Know exactly what you will search for, and check that it returns good results. A demo that opens with an empty result set because you typed something at random is an avoidable start.

**Rehearse the first ninety seconds until it is automatic.** That is where nerves do their damage. If the opening comes out cleanly, the rest tends to follow.

**Practice the demo on the machine and screen you will present from,** at the resolution you will use, with the font sizes you will use. Code that is legible on your laptop is invisible on a projector.

**Have an answer ready for "what was hardest?"** You will be asked. The best answer names a specific problem, what you tried, and what actually resolved it.

## What to hand in

Submit these five things together:

1. The repository URL, with `README.md`, `DECISIONS.md`, `.env.example`, and a real commit history.
2. A one-sentence description of what the application does and who it is for.
3. Your presentation materials — slides if you used them, plus your fallback screenshots.
4. Confirmation that you completed a full keyboard pass and an automated accessibility scan, with the scan output attached.
5. The live presentation itself, delivered on the scheduled date and within the time limit.
