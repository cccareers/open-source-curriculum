---
lesson_id: web102-02
course_id: web102
pathway: software-developer
title: Planning a JavaScript Project
order: 2
kind: lesson
competency_ids:
  - D2-S1-C02
  - D2-S1-C03
objectives:
  - Plan a JavaScript project as a sequence of deliverable increments
  - Choose the tools and libraries a project deliverable needs
---

## What you are actually handed

On a real team, work does not arrive as "build a page." It arrives as a paragraph in a ticket, a section of a requirements document, or five minutes of somebody talking at a stand-up. Something like this:

> Members should be able to see the classes they signed up for and drop one if their plans change. The list should survive a refresh. It needs to work on a phone.

That is three sentences and it is a complete piece of work — a week of it, if you count the parts nobody wrote down. Your job before you write any code is to turn it into something you can execute against and somebody else can check. That translation is the single most useful habit in this course, and it is what the apprenticeship framework means by helping map out a work plan: you are not inventing the requirement, you are taking a specification somebody else owns and producing the ordered, estimated, checkable version of it.

Start by reading the paragraph as three separate things, because it contains three and they get confused constantly.

**Requirements** are statements about what must be true when you are done. "A member can remove a class from their list." They are about the product, and you do not get to change them without asking.

**Constraints** are limits on how you may achieve it. "It runs in the browser with no server." "It must work on a 360-pixel-wide screen." Constraints are not requirements — nobody using the page will ever notice a constraint directly — but they eliminate whole approaches, so surfacing them early saves days.

**Assumptions** are the things the paragraph did not say and you had to decide. "The list survives a refresh" says persistence but not where; you assume `localStorage` on the same device rather than an account that follows a member across devices. That assumption is probably right and it is definitely a guess. Write it down as a guess. An assumption written in the plan gets corrected in five minutes by whoever wrote the paragraph; the same assumption living only in your head gets corrected in review, after you built on it.

Then find the questions. The example above cannot be built as written, and the honest response is not to start coding, it is to ask:

- Can a member drop a class that already happened, or only future ones?
- Is dropping instant, or does it confirm first?
- What does the list look like when the member has signed up for nothing?
- Is "works on a phone" a layout requirement, a touch-target requirement, or both?

Three of those four have a cheap default you could pick yourself. The first one has a real consequence and you should not decide it alone. That is the split to look for: decide the cheap ones, record them as assumptions, and escalate the ones where being wrong means rework. Asking four questions at the start is normal and expected. Asking them after you have built the wrong thing is the thing that actually looks bad.

## Where planning sits in the lifecycle

Every team you join runs some version of the same cycle: somebody works out what is needed, somebody designs an approach, developers build it, somebody tests it, and it gets released and then maintained. The names differ and the ceremony differs enormously — a two-week sprint with a backlog, or a checklist taped to a wall — but the sequence does not, and neither does the rule that each stage produces something the next stage consumes.

You are joining that cycle in the middle. The requirements are usually not yours to write; the release is usually not yours to run. What is yours, on day one of a project, is the piece in between: taking the specification you were handed and producing a work plan against it. That plan is a real deliverable. Somebody will read it to answer "when will this be done", "what is this person blocked on", and "what did we agree we were not doing."

The important consequence is that planning is not a phase you finish. You plan, you build the first increment, you learn something that makes the plan wrong, and you update the plan. A plan that has not changed by the end of a project was either trivially easy or is not being maintained. What you must not do is let the plan go stale silently, because the moment your plan and your actual work diverge without anybody being told, every schedule built on top of it is fiction.

## What counts as an increment

Here is the mistake almost everyone makes on their first project. You break the work into the layers of the system:

1. Write all the HTML.
2. Write all the CSS.
3. Write all the JavaScript.
4. Add persistence.
5. Test everything.

That looks organized and it is a trap. Nothing works until step 3 is finished, so you have no feedback until you are three quarters done. If step 4 turns out to be harder than you thought, you find out at the end. If you run out of time, you have nothing to show — not a smaller product, *nothing*, because a page with markup and styles and no behavior does not do anything.

The alternative is to slice the work the other way: each increment is a thin vertical slice that touches every layer and ends with something that actually runs.

1. A page that renders a hard-coded list of three classes from a JavaScript array.
2. Add a class through a form; the list updates.
3. Drop a class; the list updates.
4. The list survives a refresh.
5. The empty state and the layout on a narrow screen.

Each of those is demonstrable. After increment 1 there is a page you can open. After increment 3 someone can use the thing, badly. After increment 4 it is genuinely useful. If the project is cut short at increment 3, you ship something real instead of nothing.

An increment qualifies when all four of these are true:

- **It ends in something runnable.** Not "the model layer is done" — something you can open in a browser and point at.
- **It is worth demonstrating.** If you cannot describe what a viewer would see that they could not see before, it is a task, not an increment.
- **It fits in a day or less.** Increments longer than that hide their own trouble. If one is bigger, split it.
- **It is independently checkable.** Someone else can tell whether it is finished without asking you.

Two more rules keep the slices honest. First, **do the risky part early.** If you have never used `localStorage`, and the whole feature depends on it, do not schedule it fifth — build a five-line spike in increment 1 that writes and reads one value, prove it works, then continue. Planning is partly about arranging to fail early and cheaply. Second, **do not slice by "the fun part" and "the boring part."** The empty state, the error state, and the narrow screen are requirements. Scheduling them last is how they get dropped, and they are exactly what a reviewer checks first because they are where sloppy work shows.

## Writing the work plan

A work plan is a table. It does not need a tool, it does not need a template, and a Markdown file called `PLAN.md` in the repository is a perfectly professional artifact. What it needs is one row per increment with these columns:

| # | Increment | Estimate | Acceptance criteria | Depends on |
|---|---|---|---|---|
| 1 | Render a hard-coded list | 1h | Opening `index.html` shows three classes with name, date, and location. No console errors. | — |
| 2 | Add a class via a form | 2h | Submitting the form with a name and date adds a row to the visible list. Submitting an empty name shows a message and adds nothing. | 1 |
| 3 | Drop a class | 1.5h | Each row has a remove control; using it removes that row and no other. | 1 |
| 4 | Persist across refresh | 2h | After adding two classes and reloading, both are still listed in the same order. | 2, 3 |
| 5 | Empty state and narrow layout | 1.5h | With no classes, the page shows a short explanatory message and no empty table. At 360px wide, no horizontal scrolling and every control is tappable. | 2, 3 |

Five things about that table are doing work.

**The estimates are in hours, not days, and they are yours.** An estimate is a forecast, not a promise, and the way you get better at it is by writing one down and comparing it to reality afterwards. A useful discipline: estimate the increment, then when you finish, write the actual next to it. After three projects you will know your personal multiplier, and it is almost never below 1.5.

**The total is smaller than the time available.** If you have twenty hours, plan about fourteen. The rest goes to the things you did not think of, which on every project so far have existed. A plan with no slack is a plan that is wrong by the second day.

**Dependencies are explicit.** Increment 4 cannot start before 2 and 3 because there is nothing to persist. Writing that down is how you notice when your ordering is impossible, and it is how somebody helping you knows what they can safely pick up.

**Nothing is a checkbox called "testing."** Verification belongs inside each increment's acceptance criteria, not in a bucket at the end. A row that is "done" but untested is not done, and a testing phase at the end of a plan is where schedules go to die.

**Out of scope is written down.** Add a short section under the table listing what you decided not to build: no accounts, no sharing, no editing a class after it is added, no timezone handling. Scope is defined as much by the "no" list as the "yes" list, and an explicit "no" is a decision anybody can challenge in review. An implicit one is just a thing you forgot.

Keep the plan current as you work. When increment 2 takes four hours instead of two, change the number and say so. When a requirement lands mid-project, add a row rather than quietly absorbing it — absorbed work is invisible work, and invisible work is why people think you are slow.

## Acceptance criteria, and what "done" means

Acceptance criteria are the part beginners skip and reviewers read first. Each one is a sentence describing something observable, phrased so that two different people checking it would reach the same answer.

Compare:

- "The form works." — Unverifiable. Works how? For what input?
- "Submitting the form with a name and a future date adds one row to the list, clears the form, and moves focus back to the name field. Submitting with an empty name adds nothing and shows the message 'Name is required' next to the field." — Verifiable, and notice it forced two design decisions out into the open that you would otherwise have made silently at 2am.

Write them from the outside, in terms of what someone using the page does and sees. "The `render()` function is called" is not an acceptance criterion; it is an implementation detail, and if you rename the function tomorrow, the criterion is wrong while the product is fine.

Then there is the **definition of done** — one list that applies to *every* increment, not just one. Write it once at the top of the plan:

- The acceptance criteria are all met, checked in a browser, not assumed.
- No errors in the browser console during normal use.
- The page still works with JavaScript's strict expectations: no undeclared globals, no leftover `debugger` statements.
- Any temporary logging you added has been removed.
- The change is committed with a message that explains it.
- The narrow-screen layout is not broken by the change.

The definition of done is what stops "done" from meaning "the happy path worked once on my machine." It is short, it is boring, and it is the difference between work a reviewer accepts and work a reviewer sends back.

## Choosing the tools this project needs

The other half of planning is deciding what you will build with. On a browser project the honest answer is that you need much less than you think, and the ability to say so is itself a professional skill — you are being asked to identify tooling appropriate to the deliverable, and "the deliverable does not need a build system" is a legitimate, defensible answer.

Here is the minimum kit for the projects in this course, and why each piece earns its place.

**A code editor with the language server on.** Any modern editor gives you syntax highlighting, jump-to-definition, and inline errors for JavaScript out of the box. The one setting worth checking on day one is that it shows problems as you type; catching `docuemnt.querySelector` at write time instead of run time is worth more than any library you could install.

**A static development server.** You will be tempted to double-click `index.html` and let the browser open it as `file://`. Do not. The `file://` origin behaves differently from a real one: `fetch` on local files is blocked, `localStorage` is scoped oddly, and modules loaded with `type="module"` are refused outright. Serve the folder over HTTP instead. Any of these does it with no project configuration:

```bash
npx serve .
python3 -m http.server 8000
```

Both print a `http://localhost:PORT` address. Open that. From this lesson on, every project in this course is developed against `http://localhost`, never `file://`, and roughly a third of the "it works for me" problems on this course are somebody who forgot.

**The browser's developer tools.** Already installed, and the most capable tool in the list. You will use them properly in lesson 05.

**A formatter.** Arguing about where the braces go is wasted time on a team. A formatter ends the argument by making it not a decision. Prettier is the common choice and needs no configuration to be useful:

```bash
npm install --save-dev prettier
npx prettier --write .
```

**A linter, once the project is more than one file.** ESLint catches the class of mistake a formatter cannot: an unused variable, a promise you forgot to await, a comparison that is always false. It costs ten minutes to set up and pays for itself the first time it finds a typo'd variable name that would otherwise have been a silent `undefined`.

**A package manager, only when you have a package.** If your project genuinely has no dependencies, it needs no `package.json`, and adding one to look serious is noise. The moment you add your first dev dependency, run `npm init -y`, and commit the lockfile so everyone installs the same versions.

Notice what is *not* on the list: no bundler, no transpiler, no framework, no task runner. Modern browsers run ES modules natively, so you can split your code across files with `import` and `export` and serve them directly:

```html
<script type="module" src="./js/main.js"></script>
```

```javascript
import { renderList } from "./render.js";
import { loadClasses } from "./storage.js";

renderList(loadClasses());
```

That gives you the organizational benefit of modules with zero build step. A bundler solves problems you do not have yet — hundreds of files, old browsers, npm packages that only ship CommonJS — and every one it solves it adds a configuration file, a build command, and a new category of error message between you and your code. Add tooling when a problem forces you to, and be able to name the problem.

## Choosing, and refusing, libraries

The same reasoning applies one level up. When you hit a piece of work — formatting dates, sorting a table, drawing a chart, validating a form — you have a decision, and "install something" is not automatically the right answer.

Ask these in order.

**How much code is it really?** Formatting a date as `"Mar 4, 2026"` is one call to `Intl.DateTimeFormat`, already in every browser. Sorting an array of objects by a field is one comparator function. Fading an element in is three lines of CSS. If the platform does it, use the platform: it is faster, it never breaks, and there is nothing to update.

**What does it cost the user?** Every library is bytes a phone on a bad connection has to download before your page works. A 90KB library so you can format a date is a bad trade, and it is a trade a reviewer will notice.

**Is it maintained?** Check when the last release was, how many open issues there are and whether anyone answers them, and whether the documentation matches the current version. An unmaintained dependency is a bug you will inherit.

**How hard is it to remove?** A library that does one thing behind one function you call in three places is cheap to replace. A library whose way of thinking spreads through every file is a decision you are making for the whole project, and it deserves a real conversation rather than a solo `npm install`.

**Does it fit the constraints?** In this course, "no framework, no build step" is a constraint. A library that only ships as an ES module you must bundle is out, no matter how good it is.

Charting is the honest example of when the answer flips. Writing an accessible, responsive bar chart with axes and labels from scratch is a day of work that is not what the project is assessing; a small charting library is a defensible choice with a clear reason. Write the reason down.

That is the last artifact of the planning phase and the smallest: a **decision record**, a few lines at the bottom of `PLAN.md`.

```text
## Tooling decisions

- No build step. ES modules served over a static dev server; the project is
  ~6 files and targets current browsers only. Revisit if we need npm packages
  that ship CommonJS.
- Prettier for formatting, default config. Ends style debate; no config to argue about.
- No date library. Intl.DateTimeFormat covers the one format we display.
- No charting library in this increment. If the dashboard needs axes later,
  reconsider then rather than installing speculatively.
```

Four lines, and it answers the question a reviewer or a teammate will ask in three months — "why is there no build here?" — without anybody having to reconstruct your reasoning from the file listing. The reason you write it is not ceremony. It is that a decision you cannot explain is a decision you cannot defend, and on the last project of this course you will be standing in front of people explaining exactly these choices out loud.

## Practice

You have been handed this specification. It is all you get, and it is deliberately incomplete in the way real ones are.

> **Volunteer shift board.** A volunteer coordinator wants a single page listing the shifts our volunteers have claimed. A volunteer can claim an open shift and release one they can no longer do. The page should still show the right claims when it is reopened later on the same laptop. Shifts that have already passed should be visually distinct from upcoming ones. Coordinators use this on a tablet in the field.

Produce a `PLAN.md` containing all six parts below. No application code — this exercise is the plan, and you will build against a plan like it in lesson 04.

1. **Restate the requirements** as a numbered list of statements about what must be true when the work is done. Aim for six to ten. Nothing about implementation.
2. **List the constraints and the assumptions separately.** At least three assumptions, each phrased as a guess you are making, not a fact.
3. **Write four to six open questions** you would ask the coordinator. For each, add one sentence saying what you would do if you could not get an answer today, and mark which ones you would refuse to decide alone.
4. **Break the work into four to seven increments** in a table with columns for number, increment, estimate in hours, acceptance criteria, and dependencies. Every increment must end in something runnable and demonstrable, at least two acceptance criteria per row, and the total must leave at least 25 percent slack against a 12-hour budget. Add an explicit out-of-scope list underneath.
5. **Write the definition of done** that applies to every increment — six to eight lines, all checkable by someone who is not you.
6. **Write the tooling decision record.** Name the editor setup, the dev server command you will actually run, whether you are adding a formatter or a linter, and at least two libraries you considered and rejected, each with the reason. Include one decision where you *would* accept a library and say what would have to be true for that to happen.

Then do the part people skip: hand `PLAN.md` to another apprentice and have them try to break it. Ask them to find one acceptance criterion two people could read differently, one increment that does not produce something runnable, and one assumption you stated as if it were a fact. Fix all three and note what changed at the bottom of the file.

**Deliverable:** a `PLAN.md` with all six sections, plus a short "review notes" section recording the three problems your reviewer found and what you changed.
