---
lesson_id: react200-08
course_id: react200
pathway: software-developer
title: Applying Directed Changes to an Existing App
order: 8
kind: lesson
competency_ids:
  - D5-S1-C03
objectives:
  - Apply a directed change to an existing application
---

## The most common task you will be given

Nearly every course you have taken starts from an empty directory. Almost no working day does. As an apprentice you will spend most of your first year changing applications other people wrote, under direction from someone more senior, in code whose reasons you do not yet know.

That is a distinct skill from building. Building rewards momentum. Changing rewards a specific kind of care: understanding enough of the existing system to make a small, correct, in-idiom modification without disturbing the parts that were working. The measure of a good directed change is that a reviewer reads the diff and can see immediately that it does what was asked and nothing else.

The failure modes are recognizable and all of them are avoidable:

- Building what you assumed was wanted rather than what was asked.
- Changing something shared without noticing who else depended on it.
- Rewriting surrounding code in your own style because you did not like it.
- Making a change that works on the screen you tested and breaks on the two you did not.
- Going silent for three days when the change turned out to be larger than described.

## Orienting in a codebase you did not write

Resist the urge to read everything. A React application of the shape you have been building has a small number of load-bearing files, and reading them in the right order gives you a working map in under an hour.

**1. `package.json`.** Which libraries, which versions, and what the scripts are called. `react-router-dom` version 6.4 or later (or a `react-router` dependency at version 7, which merged the two packages) means the data-router API from lessons 02 and 03 is available — confirm by finding `createBrowserRouter` in the router file, because a 6.4+ app can still use the older element style. Earlier versions mean the element-based routing you will need to recognize. `@reduxjs/toolkit` means slices; a bare `redux` dependency with no toolkit means hand-written reducers and a different set of conventions.

**2. The entry file, usually `src/main.jsx`.** Every provider the application depends on is here, in order. This tells you what global machinery exists at all — a store, a router, a theme, a query client, an error boundary.

**3. The router file.** This is the single most valuable file in a routed React app and the reason routing was taught first in this course. The route table is a complete map of the application's surface: every screen, its URL, its layout, its data, and its error handling, in one screenful. Read it and you know what the application does.

**4. The store configuration.** `configureStore` names every slice. That is the list of cross-cutting state in the whole app.

**5. One vertical slice, end to end.** Pick a single feature and follow it from route to component to selector to thunk to endpoint. One complete trace teaches you the codebase's conventions — file layout, naming, how errors are handled, whether selectors are exported — far better than skimming twenty files.

**6. The README, and the last thirty commits.** The README tells you how to run it. The commit log tells you what the team has been touching lately and what their messages look like, which is your best guide to what kind of change is considered normal here.

Take notes as you go. A dozen lines is enough:

```text
Router:      src/router.jsx, data router, 2 layout levels
Store:       events (loader-hydrated), shifts, preferences
Feature dirs: src/features/<name>/{Slice.js, thunks.js, components/}
Selectors:   exported from the slice file, prefix select*
Errors:      RouteError at root and at /events; thunks use rejectWithValue
Data:        route loaders for anything URL-shaped; store for cross-cutting
Tests:       none
Gotcha:      EventCard is used by EventList, MyShiftsPage, and Home
```

That last line is the kind of thing you only learn by looking, and it is exactly what will save you later.

## Reading the directive

A directed change usually arrives compressed, from someone with more context than you:

> The claim control should be on the list rows as well as the detail page. Reuse the existing panel, don't duplicate the thunk. While you're in there, the nav badge count is wrong when a claim fails — the rollback isn't decrementing it. Keep the loader signature as it is, the organizer page depends on it.

Four sentences containing a change, a constraint, a bug, and a warning. Before writing anything, take it apart.

**What is the actual change?** The claim control appears in a new place. The panel is reused, not rebuilt. Separately, a rollback bug is fixed.

**What is explicitly out of bounds?** The loader signature. That is not a suggestion; someone has told you there is a dependency you cannot see from where you are standing. Note it and check it before you finish.

**What is implied but not stated?** Several things, and this is where judgment lives. Does the list row show the same panel at the same size, or a compact version? What happens to a row's claimed state while the claim is pending? Does claiming from the list navigate anywhere? Should the list re-sort? None of that is in the four sentences.

**What is ambiguous?** "Reuse the existing panel" could mean import the same component, or extract the shared logic into a hook and render two presentations. Those are different diffs with different review outcomes.

Now restate it, before you start:

> To confirm before I start: I'll extract the claim panel so the same component renders in a list row and on the detail page, driven by a `compact` prop — the thunk and selectors stay as they are. I'll fix the rollback so the badge decrements when a claim is rejected. I am not touching the events loader signature. Two questions: should claiming from a row keep the user on the list (I assume yes), and should a pending claim on a row show the same half-state as the detail page (I assume yes)? Sounds like about a day.

Five lines, sent before any code. If your understanding is wrong, you find out now instead of at review, and the two assumptions are on the record. This costs almost nothing and is the single highest-return habit in this lesson.

## Finding the code

You know what to change. Now find where. Four techniques, in the order they usually work.

**Search for the string the user sees.** The fastest route into unfamiliar code is almost always the visible text. Grep for `Claim a shift` and you land in the component that renders it, no matter how the files are organized.

```bash
grep -rn "Claim a shift" src/
```

If the app is internationalized, grep the translation file for the text and then grep for the key.

**Follow the URL.** You know the screen. Open the router file, find the route whose path matches, and read down: element, loader, children. That gives you the component, its data source, and its layout ancestors in one step. This is the technique that routing bought you, and it works even when you have no idea what anything is called.

**Watch the store.** Open Redux DevTools, perform the action in the browser, and read the action type that appears. `shifts/claimShift/rejected` tells you the slice name, the thunk name, and the lifecycle stage. Grep the type prefix and you are in the right file. This is by far the fastest way to find where a state bug lives, and it is why the DevTools habit from lesson 04 pays off here.

**Watch the network.** The Network tab tells you which endpoint a screen calls. Grep for the path and you find the loader or thunk that calls it.

Use whichever is closest to the symptom. For "the claim button should also be here", the string search. For "the badge count is wrong", the store.

### Blast radius

Before you edit, find out who else depends on what you are about to touch. This is the step that separates a clean change from a regression, and it takes two minutes.

```bash
grep -rn "ShiftClaimPanel" src/
grep -rn "selectShiftCount" src/
grep -rn "from \"./shiftsSlice" src/
```

Three questions to answer for each thing you are changing:

- **Who imports this component?** If the answer is one file, you can change its props freely. If the answer is four, adding a required prop breaks three of them.
- **Who reads this state shape?** Changing `byEventId` from a lookup of objects to a lookup of arrays is a change to every selector and every component behind them. The selectors you exported from the slice are what contain this blast, which is the argument for them made concrete.
- **Who else calls this thunk or endpoint?** A thunk's argument shape is an interface. Adding a required field to it changes every caller.

For the directed change above, suppose the grep tells you `ShiftClaimPanel` is imported only by `EventDetail`, and `selectShiftCount` is used by the nav badge and `MyShiftsPage`. Now you know: the panel is safe to give a new optional prop, and the badge fix must be checked on both screens that use the count.

Write the blast radius into your notes. It becomes the test matrix at the end.

## Making the change

Three rules govern how the edit itself should look.

### Write in the codebase's idiom, not yours

If every other slice in the project exports selectors with a `select` prefix, yours does too. If components in this project put handlers above the return and this one puts them inline, follow the file. If the team uses `function` declarations for components and you prefer arrow consts, use declarations.

You will sometimes be right that your way is better. It does not matter. A diff that mixes a behavior change with a style change is harder to review, harder to revert, and reads as an apprentice announcing their preferences in someone else's house. Consistency inside a codebase is worth more than any individual convention.

The way to find the idiom is not to ask; it is to read the two or three files nearest to the one you are changing.

### Change the minimum

For the claim panel, the tempting version is to rewrite it "properly" while you are in there. The correct version is the smallest edit that satisfies the direction:

```jsx
// ShiftClaimPanel.jsx — before
export default function ShiftClaimPanel({ eventId }) {
  const shift = useSelector((state) => selectShiftFor(state, eventId));
  const dispatch = useDispatch();
  // …renders a heading, a role select, and a claim/release button
}
```

```jsx
// ShiftClaimPanel.jsx — after
export default function ShiftClaimPanel({ eventId, compact = false }) {
  const shift = useSelector((state) => selectShiftFor(state, eventId));
  const dispatch = useDispatch();

  if (compact) {
    return (
      <div className="claim claim--compact">
        <ClaimButton eventId={eventId} shift={shift} onAction={dispatch} />
      </div>
    );
  }
  // …unchanged full rendering
}
```

One new optional prop with a default, so every existing call site keeps working untouched. The shared button is extracted because both branches need it, not because extraction is virtuous. The thunk and the selectors are not touched at all, exactly as directed.

Then the rollback fix, which is a separate concern in the same task:

```js
// shiftsSlice.js — the rejected case
.addCase(claimShift.rejected, (state, action) => {
  if (action.meta.aborted) return;
  delete state.byEventId[action.meta.arg.eventId];   // this line was missing
  state.lastError = action.payload ?? "Could not claim that shift.";
});
```

The badge was wrong because the optimistic entry added in `pending` was never removed on rejection, so the count included a claim that had failed. One line. Finding it took ten times as long as fixing it, which is normal and is why the DevTools trace matters more than the typing.

### Do not refactor uninvited

You will find things you dislike. Duplicated markup, a component that is three hundred lines, a selector that recomputes on every render, a variable named `data2`. Leave them, and write them down.

There are two legitimate exceptions. Something that actively blocks the directed change — you cannot add the prop without extracting the button — is part of the change, and you say so in the pull request description. Something genuinely dangerous — a missing rollback that corrupts state, a credential in the source — is escalated immediately rather than fixed quietly.

Everything else goes in a list you offer afterward:

> While making this change I noticed three things I deliberately did not touch: `EventCard` duplicates the date formatting from `MyShiftsPage`, the shifts slice has no handling for `claimShift.pending` arriving twice for the same event, and `selectShiftCount` recomputes on every store change. Happy to pick any of them up as a separate ticket.

That message makes you look observant and disciplined at the same time. The same observations delivered as unrequested commits in the middle of a feature diff make you look like someone whose changes are risky to merge.

### Keep the change reviewable

Work on a branch named for the ticket, and commit in small logical steps rather than one large drop: the panel extraction, then the list-row placement, then the rollback fix. A reviewer can follow three focused commits. They cannot follow one commit called "changes". If the rollback fix turns out to be wrong, a small commit is a clean revert; a large one is surgery.

Match the team's commit message style, which you already read in step 6 of orienting.

## Verifying, which is the actual work

The change compiles and looks right on the screen you were staring at. That is the beginning of verification, not the end. Build a small matrix from the blast radius you wrote earlier: every place the changed thing appears, times every state it can be in.

For this change:

| Where | State | Expected |
| --- | --- | --- |
| Event detail | No shift held | Full panel, "Claim a shift" |
| Event detail | Shift held | Full panel, "Release this shift" |
| Event detail | Claim pending | Half-state, control disabled |
| Event detail | Claim rejected (event 12) | Reverts, message shown, badge unchanged |
| List row | No shift held | Compact panel, claim control |
| List row | Shift held | Compact panel, release control |
| List row | Claim rejected | Reverts, message shown, badge unchanged |
| Nav badge | After claim | Count increments |
| Nav badge | After failed claim | Count returns to previous value |
| `/my/shifts` | After claim from a list row | New shift appears |
| Events loader | Unchanged | Organizer page still loads |

Eleven checks, most of them ten seconds each. Three of them are the ones that matter and none of them is the one you were looking at while coding.

Three specific verification habits:

**Test the thing you were told not to break.** The directive named the loader signature and the organizer page. Load the organizer page. That check is free and it is exactly what the warning was for.

**Test the failure path deliberately.** Seed an event that is full, or make the endpoint return a 500, and run the rejection case. The bug you were asked to fix lives on the failure path, so a happy-path check proves nothing about it.

**Refresh on every screen you touched.** Routing means every state has a URL, so a refresh is a free test that the state can be reconstructed from the URL rather than only reached by clicking through.

Then read your own diff, line by line, before anyone else does:

```bash
git diff main...HEAD
```

You are looking for four things: a leftover `console.log`, a change you made and forgot about, a file that should not be in the diff at all, and any place where the diff does something the directive did not ask for. Roughly one time in three this catches something, which is a better hit rate than most code review.

## When to stop and ask

The hardest judgment in this lesson is knowing when to stop working and raise your hand. Three signals, and none of them is a failure:

**The change is materially larger than described.** You were told a day and you are half a day in with the shape still unclear. Say so now, with what you have learned: "the panel can't be reused as-is because it reads the detail route's loader data — either I lift that into the store or the list row gets a separate presentation. Which do you prefer?" Nobody minds hearing this on day one. Everyone minds hearing it on day four.

**The directive conflicts with what the code does.** You were told the rollback is not decrementing the badge, and you find the rollback is fine but the selector counts pending claims. The person who directed you had a hypothesis and it was wrong. Report the finding rather than implementing the instruction that no longer makes sense.

**You found a real problem outside the scope.** Tracing the badge, you notice that a released shift is never removed from the server. That is a separate bug, it is worse than the one you were sent for, and it needs its own report — not a quiet fix inside your diff, and not silence.

The rule of thumb: raise it as soon as you can state the problem and at least one option. A question with options gets a decision in minutes. A question without them turns into a meeting.

## Receiving review on the change

The change comes back with comments. Three kinds arrive, and they want different responses.

**A correction** — "this breaks when `eventId` is undefined" — is information. Fix it, and reply that you did.

**A preference** — "I'd use a ternary here" — is cheap. Take it. Arguing about style in someone else's codebase costs more than it can possibly win.

**A question** — "why a prop rather than two components?" — is usually genuine. Answer it with your reasoning, and be willing to be wrong. If your reasoning turns out to be right, the answer belongs in the code as a comment or in the pull request description, because the next reader will wonder the same thing.

What you should not do is silently implement a suggestion you believe is wrong. If a reviewer asks for something that breaks a requirement you know about, say so: "that would work, but AC3 requires the message to persist until dismissed and this clears it on the next render." Reviewers are frequently missing context you have, and a directed change does not mean an unthinking one.

## Practice

You need a codebase you did not write. Swap repositories with another apprentice — you take their Community Events Board, they take yours — or use a project from another cohort. If neither is possible, use your own repository from the earliest commit that has all five features and treat it as unfamiliar, with a partner choosing the directives.

**Part A — Orient (about an hour).**

1. Without running the app, produce a one-page `ORIENTATION.md` from the six-file reading order: dependencies and versions, the providers in the entry file, the full route table, the store slices, one traced vertical slice from route to endpoint, and five conventions you inferred.
2. List every component used by more than one route. You will need this later.
3. Now run the app and correct anything in your notes that was wrong. Record what you got wrong; those are the things reading alone does not tell you.

**Part B — Apply a directed change.**

Have your partner give you a written directive with at least one explicit constraint ("do not change X, because Y depends on it"). If you need one, use this: *"Put the claim control on the list rows as well as the detail page, reusing the existing panel rather than duplicating it. The nav badge is wrong after a failed claim — fix the rollback. Don't change the events loader signature; the organizer page depends on it."*

4. Take the directive apart in writing: the change, the explicit constraints, at least three things implied but unstated, and at least one genuine ambiguity.
5. Send your partner a restatement of five lines or fewer, including your assumptions and one or two questions. Do not start coding until they reply.
6. Find the relevant code using at least three of the four location techniques, and record which one got you there fastest for which part of the change.
7. Write the blast radius: every importer of every component, selector, and thunk you intend to modify. Use `grep` and paste the results.
8. Make the change on a branch, in the codebase's idiom, in at least three small commits. Any behavior change must be separate from any extraction.
9. Keep a "noticed but did not touch" list of at least three things, and write the message you would send offering them as separate tickets.

**Part C — Verify.**

10. Build a test matrix from your blast radius: every location times every state, including the pending and rejected paths. Aim for at least ten rows.
11. Run it. Include the thing you were told not to break, a deliberate failure path with seeded data, and a refresh on every screen you touched.
12. Read your own diff line by line with `git diff main...HEAD` and record anything it caught.
13. Write a pull request description with four sections: what changed, why (quoting the directive), how you verified it, and what you deliberately did not touch.

**Part D — Review and respond.**

14. Have your partner review the change and give you at least one correction, one preference, and one question. Respond to each in the way this lesson describes, and note which of the three was hardest to answer well.
15. Introduce a scope problem on purpose: have your partner give you a second directive whose premise is wrong about the code. Write the message you would send raising it, including at least one option.

**Deliverable:** a committed branch containing the directed change in small commits, plus `ORIENTATION.md`, your directive breakdown, the blast-radius grep output, the completed test matrix with results, the pull request description, and your responses to review.

## Check your understanding

1. In what order do you read an unfamiliar routed React codebase, and why does the router file come before any component?
2. The directive says "Keep the loader signature as it is, the organizer page depends on it." Where does that sentence show up again in your verification?
3. `grep` shows `ShiftClaimPanel` is imported by four files. Why is adding a required `compact` prop a bad idea, and what do you do instead?
4. You find a 300-line component with a variable named `data2` next to the code you are changing. What do you do with it?
5. Half a day into a one-day change, you discover the panel reads the detail route's loader data and cannot render in a list row as-is. What do you send, and to whom?

**Answers:** (1) `package.json`, the entry file, the router file, the store configuration, one vertical slice end to end, then the README and recent commits; the route table maps every screen, its data, and its error handling in one place. (2) As a row in the test matrix: load the organizer page and confirm it still works. (3) Three call sites would break; add an optional prop with a default (`compact = false`) so existing callers are untouched. (4) Leave it, write it on your "noticed but did not touch" list, and offer it as a separate ticket. (5) A message to the person who directed the change, stating what you found and at least one option ("lift that data into the store, or give the list row a separate presentation — which do you prefer?").
