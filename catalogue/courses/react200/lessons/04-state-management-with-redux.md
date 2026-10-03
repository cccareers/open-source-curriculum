---
lesson_id: react200-04
course_id: react200
pathway: software-developer
title: State Management with Redux
order: 4
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Manage application state in a central store
---

## When component state stops being enough

You know three ways to hold state already. `useState` puts it in one component. Lifting it puts it in a common ancestor and passes it down. Route loaders put it in the URL's data. Each is right for a large class of problems, and you should exhaust them before reaching for anything else.

The case they do not cover looks like this. The events board grows a "my shifts" feature: a volunteer can sign up for an event from the list, from the detail page, or from a modal in the site header, and a badge in the nav shows how many shifts they hold. Now ask where that state lives.

It cannot live in the list, because the detail page changes it. It cannot live in the detail page, because the list shows it. Lift it to the common ancestor and the common ancestor is the root layout, which means the shift data is now passed through the events layout, the list, and the row component — three components that do not use it and only exist to carry it. That threading is **prop drilling**, and it is not merely tedious. Every intermediate component now re-renders when shifts change, every one of them has a prop in its signature that its own tests have to supply, and moving any of them in the tree breaks the chain.

It cannot live in a route loader either, because it does not belong to a route. It is true on every page.

React Context solves the drilling but not the rest: a context whose value is an object re-renders every consumer whenever any part of that object changes, and it gives you no structure for *how* the value is updated, so update logic scatters across whichever components happen to call the setter.

A **store** is the answer to that specific shape of problem: state that many unrelated parts of the tree read and write, whose update rules you want in one reviewable place.

Say the negative version out loud too, because over-applying this is the most common failure mode. Do not put a form's in-progress field values in the store. Do not put a modal's open flag in the store unless something far away opens it. Do not put server data in the store just because it came from a server — a route loader is usually better. Most components in a well-built React app touch no store at all.

## Redux Toolkit, and what it replaced

Redux is a small idea wrapped in a lot of history. The idea:

- All shared state lives in one plain-object **store**.
- You never mutate it. To change it you **dispatch an action** — a plain object describing what happened.
- A **reducer** is a pure function `(state, action) => newState`. Given the same inputs it always produces the same output, and it never performs I/O.
- Components **select** the slices of state they care about and re-render when those change.

The reputation Redux has for boilerplate comes from how you used to write that: hand-rolled action type constants, action creator functions, a switch statement per reducer, immutable updates typed out by hand with spread operators, and manual store wiring. You will see all of it in older codebases.

**Redux Toolkit** is the official package that replaced that ceremony, and it is what you learn here. It generates action types and creators from your reducers, lets you write updates that *look* mutable while producing new state underneath, and configures the store with sensible middleware and DevTools already attached.

```bash
npm install @reduxjs/toolkit react-redux
```

Two packages: `@reduxjs/toolkit` is Redux itself, `react-redux` is the binding that connects it to components.

## A slice

A **slice** is one feature's piece of the state tree plus the reducers that change it. Create `src/features/shifts/shiftsSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byEventId: {},
  note: "",
};

const shiftsSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    shiftClaimed(state, action) {
      const { eventId, role } = action.payload;
      state.byEventId[eventId] = { role, claimedAt: new Date().toISOString() };
    },
    shiftReleased(state, action) {
      delete state.byEventId[action.payload.eventId];
    },
    noteChanged(state, action) {
      state.note = action.payload;
    },
    allShiftsCleared(state) {
      state.byEventId = {};
    },
  },
});

export const { shiftClaimed, shiftReleased, noteChanged, allShiftsCleared } =
  shiftsSlice.actions;

export default shiftsSlice.reducer;
```

Four things are happening in that file.

**`name` prefixes the generated action types.** The reducer `shiftClaimed` becomes the action type `"shifts/shiftClaimed"`. You will see those strings in DevTools and in logs, and the prefix is what keeps two features' actions distinct.

**`reducers` generates matching action creators.** `shiftsSlice.actions.shiftClaimed` is a function: call it with a payload and you get `{ type: "shifts/shiftClaimed", payload: { … } }`. You never write that object literal yourself.

**`state.byEventId[eventId] = …` is not the mutation it looks like.** Redux Toolkit runs your reducer against an Immer draft. Immer records what you touched and produces a new immutable state from the recording. This is the single largest quality-of-life difference from old Redux, where that line would have been a nested spread three levels deep.

**Reducers are pure.** No `fetch`, no `Math.random()`, no reading `localStorage`. The `new Date().toISOString()` above is technically a violation of that rule — it makes the reducer non-deterministic and it is a real thing reviewers flag. The correct version computes the timestamp where the action is created and passes it in the payload. Note it now; the `prepare` callback later in this lesson is how you do it properly.

Two rules follow from Immer and are easy to break:

```js
// WRONG — reassigning the parameter throws away the draft entirely
reducers: {
  reset(state) {
    state = initialState;      // the store does not change
  },
}

// RIGHT — either mutate the draft's properties, or return a new value
reducers: {
  reset() {
    return initialState;       // returning replaces the state
  },
}
```

And you must not do both in one reducer. Mutate the draft *or* return a value; mixing them throws.

### Naming actions

Name an action for **what happened**, not for what should change. `shiftClaimed` describes an event in the world; `setShifts` describes a setter. The difference matters because one action can be handled by several reducers. `userLoggedOut` can clear shifts, clear a cart, and reset preferences, each slice deciding for itself. `setShifts` can only ever do one thing, and it pushes the decision about *what* changing means back into the component that dispatched it.

Past tense, feature-scoped, describing a fact: `shiftClaimed`, `filterCleared`, `venueSelected`.

## Designing the state shape

This is the part that deserves your slowest thinking, because the shape is the hard-to-change decision. Components can be rewritten in an afternoon; a state shape that every feature reads is a migration.

**Keep it flat and keyed, not nested and arrayed.** Compare:

```js
// Harder to work with
{ shifts: [ { eventId: 12, role: "setup" }, { eventId: 19, role: "greeter" } ] }

// Easier
{ byEventId: { 12: { role: "setup" }, 19: { role: "greeter" } } }
```

With the array, "do I hold event 19?" is a scan, and updating one entry means mapping the whole array to build a new one. With the keyed object, both are a direct lookup. When order matters, keep an `ids` array alongside the lookup table — that is the shape Redux Toolkit's `createEntityAdapter` builds for you, and it is worth reading about once you are comfortable here.

**Store the minimum; derive the rest.** If the store holds `byEventId`, do not also store `shiftCount`. A count is a function of the data, and two representations of the same fact will disagree within a month. Derive it when you read.

**Do not duplicate what a route loader already owns.** The event records themselves come from the API per route. Storing a copy in Redux gives you two versions of every event and a synchronization problem nobody asked for. The store holds *your* shifts — the cross-cutting fact — and the loader holds the events.

**Everything in the store must be serializable.** Plain objects, arrays, strings, numbers, booleans, and null. No `Date` objects, no `Map`, no `Set`, no class instances, no functions, no promises. Store an ISO string instead of a `Date`. Redux Toolkit ships a development-mode check that warns when you break this, and you should never silence it — serializability is what makes time-travel debugging, state persistence, and error-report snapshots possible.

Write the shape down before you write the slice. A short block in your implementation plan, with a one-line comment per key explaining what owns it, is exactly the kind of design artifact a senior developer can review in two minutes and correct before it costs you a week.

## Configuring the store

`src/app/store.js`:

```js
import { configureStore } from "@reduxjs/toolkit";
import shiftsReducer from "../features/shifts/shiftsSlice.js";
import preferencesReducer from "../features/preferences/preferencesSlice.js";

export const store = configureStore({
  reducer: {
    shifts: shiftsReducer,
    preferences: preferencesReducer,
  },
});
```

The keys of that `reducer` object become the top-level keys of your state. With the slices above, the whole store is:

```js
{
  shifts: { byEventId: {}, note: "" },
  preferences: { theme: "system", compactList: false },
}
```

Each slice reducer owns its own branch and can neither see nor touch the others. That isolation is the reason a store scales past a handful of features.

`configureStore` also sets up the Redux DevTools connection and installs default middleware, including the serializability and immutability checks mentioned above. In old Redux all of that was manual and most projects got some of it wrong.

Now make the store available to the tree, in `main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./app/store.js";
import { router } from "./router.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
```

The Redux provider wraps the router provider. It uses context under the hood, which is what lets any component at any depth reach the store without a single prop.

![The one-way Redux cycle: a component dispatches an action, middleware passes it to the reducers, the store produces new state, and subscribed selectors re-render the components that read the changed data](./img/redux-data-flow.png)

## Reading and writing from components

Two hooks do all the work.

```jsx
import { useSelector, useDispatch } from "react-redux";
import { shiftClaimed, shiftReleased } from "../features/shifts/shiftsSlice.js";

export default function ShiftButton({ eventId }) {
  const claimed = useSelector((state) => Boolean(state.shifts.byEventId[eventId]));
  const dispatch = useDispatch();

  if (claimed) {
    return (
      <button type="button" onClick={() => dispatch(shiftReleased({ eventId }))}>
        Release this shift
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => dispatch(shiftClaimed({ eventId, role: "general" }))}
    >
      Claim a shift
    </button>
  );
}
```

`useSelector` takes a function from the whole state to the piece you want. It subscribes the component to the store and re-renders it when the **selected value** changes — compared with `Object.is` by default, not deep equality. That reference comparison is the single most important performance fact about Redux in React, and it produces one classic bug:

```jsx
// BAD — a new array every call, so this re-renders on every dispatch anywhere
const claimedEvents = useSelector((state) => Object.keys(state.shifts.byEventId));

// BAD — a new object every call, same problem
const summary = useSelector((state) => ({
  count: Object.keys(state.shifts.byEventId).length,
  note: state.shifts.note,
}));
```

Both selectors build a fresh value each time they run. The new value is never `Object.is`-equal to the old one, so the component re-renders after every action in the entire application, including ones from unrelated features. Recent versions of React Redux also run a development-only check that calls your selector twice with the same state and logs a console warning when the two results are not the same reference — if you see a warning that a selector "returned a different result when called with the same parameters," this is the bug it is pointing at. The fixes, in order of preference:

```jsx
// 1. Select a primitive
const count = useSelector((state) => Object.keys(state.shifts.byEventId).length);

// 2. Select stable references separately
const byEventId = useSelector((state) => state.shifts.byEventId);
const note = useSelector((state) => state.shifts.note);

// 3. Memoize the derivation (next section)
```

**Select narrowly.** `useSelector((state) => state.shifts)` re-renders on any change to any shifts field. `useSelector((state) => state.shifts.note)` re-renders only when the note changes. Multiple small selector calls in one component are normal, idiomatic, and cheaper than one broad one.

`useDispatch` returns the dispatch function. Call it with an action produced by an action creator. Dispatch is synchronous: by the time it returns, the reducers have run and the new state is in place.

## Selectors as a public interface

Writing `state.shifts.byEventId[eventId]` inside a component couples that component to the exact state shape. Do it in fifteen components and the shape is frozen. Export selectors from the slice file instead, and the shape becomes an implementation detail of that one file:

```js
// in shiftsSlice.js
export const selectShiftsByEventId = (state) => state.shifts.byEventId;
export const selectShiftFor = (state, eventId) => state.shifts.byEventId[eventId];
export const selectShiftCount = (state) =>
  Object.keys(state.shifts.byEventId).length;
export const selectNote = (state) => state.shifts.note;
```

```jsx
const count = useSelector(selectShiftCount);
const shift = useSelector((state) => selectShiftFor(state, eventId));
```

Now a change to the shape is a change to one file. This is the same encapsulation argument you would make about any module boundary, and it is worth making early, because retrofitting selectors across an app that grew without them is genuinely unpleasant work.

For derived values that are expensive or that build a new object or array, memoize with `createSelector`:

```js
import { createSelector } from "@reduxjs/toolkit";

export const selectClaimedEventIds = createSelector(
  [selectShiftsByEventId],
  (byEventId) => Object.keys(byEventId).map(Number).sort((a, b) => a - b),
);
```

`createSelector` takes input selectors and a combiner. It runs the combiner only when an input's result changes, and otherwise returns the previous output — the *same reference* — so `useSelector` sees no change and skips the re-render. This is the proper fix for the "new array every time" bug.

One caveat that depends on your version. In Redux Toolkit 1.x (which bundles Reselect 4), a memoized selector caches exactly one result, so a selector parameterized per component instance — `selectShiftFor(state, eventId)` built with `createSelector` — will thrash if fifty rows each call it with a different id: every call evicts the previous row's result. Redux Toolkit 2.x bundles Reselect 5, whose default memoizer keeps a result per set of arguments, which removes most of that thrash. Check `npm ls @reduxjs/toolkit` before you rely on either behavior. On both versions the simplest advice holds: for per-item lookups that return an existing object, prefer a plain function like the one above (it returns a stable reference already, so there is nothing to memoize), or read the lookup table once in the parent and index into it.

## Adding a second slice, and one action many slices handle

Add `src/features/preferences/preferencesSlice.js`:

```js
import { createSlice } from "@reduxjs/toolkit";

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: { theme: "system", compactList: false },
  reducers: {
    themeChanged(state, action) {
      state.theme = action.payload;
    },
    compactListToggled(state) {
      state.compactList = !state.compactList;
    },
  },
});

export const { themeChanged, compactListToggled } = preferencesSlice.actions;
export default preferencesSlice.reducer;
```

Now suppose signing out should clear shifts and reset preferences. The wrong instinct is a component that dispatches two actions. The right one is a single action that both slices listen to, using `extraReducers`:

```js
// in a shared file, e.g. src/features/session/sessionActions.js
import { createAction } from "@reduxjs/toolkit";
export const userSignedOut = createAction("session/userSignedOut");
```

```js
// in shiftsSlice.js
const shiftsSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: { /* … */ },
  extraReducers(builder) {
    builder.addCase(userSignedOut, () => initialState);
  },
});
```

`extraReducers` handles actions defined *elsewhere*; `reducers` defines actions this slice owns. Each slice decides independently what signing out means for it. The component dispatches one fact and stays ignorant of the consequences — which is the whole argument for event-shaped action names.

### Preparing payloads

Remember the impure timestamp from the first slice. The fix is a `prepare` callback, which runs when the action is created rather than when it is reduced:

```js
reducers: {
  shiftClaimed: {
    reducer(state, action) {
      const { eventId, role, claimedAt } = action.payload;
      state.byEventId[eventId] = { role, claimedAt };
    },
    prepare(eventId, role) {
      return {
        payload: { eventId, role, claimedAt: new Date().toISOString() },
      };
    },
  },
}
```

Callers now write `dispatch(shiftClaimed(eventId, "setup"))`. That is a change to the action creator's signature: `prepare` receives the arguments the caller passes, so the earlier `ShiftButton` call `shiftClaimed({ eventId, role: "general" })` must become `shiftClaimed(eventId, "general")`, or it will store an object under the key `"[object Object]"`. Grep for every caller when you add a `prepare`. The reducer is pure again — given the same action it always produces the same state — and the timestamp is captured once, at the moment the thing actually happened. `prepare` is also where you would generate an id or normalize an argument list.

## Debugging with DevTools

Install the Redux DevTools browser extension. `configureStore` already connected to it, so open it and you get, for free, a list of every action with its type and payload, the full state tree after each one, a diff view showing exactly which keys changed, and time travel — click an earlier action and the UI re-renders as it was.

Use it as your first move, not your last. When a component shows the wrong thing, the question "did the action fire, and did the state change the way I expected?" splits the problem in half immediately:

- **No action in the list** — the dispatch never ran. Look at the event handler.
- **Action fired, state unchanged** — the reducer is wrong, or you reassigned the draft parameter.
- **State correct, UI stale** — the selector is wrong, or you are reading from the wrong branch.

That triage takes ten seconds and beats reading through components hoping to spot the mistake.

Two more habits. Add a `.filter` on noisy action types when a list gets long. And when you report a bug to a senior developer, export the state from DevTools and attach it — a reproducible state snapshot is worth several paragraphs of description.

Everything in this lesson has been synchronous: dispatch an action, the reducer runs, the state is new before dispatch returns. Real applications also need to talk to a server, and a reducer is forbidden from doing that. Where the `fetch` goes, and how a loading state gets modeled, is the next lesson.

## Practice

Add a cross-cutting "my shifts" feature to the Community Events Board you built in the previous lesson. The event data stays in route loaders; only the volunteer's own shifts and preferences go in the store.

1. Install `@reduxjs/toolkit` and `react-redux`. Create `src/app/store.js` with `configureStore`, and wrap the router provider with the Redux provider in `main.jsx`.
2. Before writing code, write the state shape into `NOTES.md`: every top-level key, its type, and one line saying what it is for. Justify in one sentence why the shifts are keyed by event id rather than held in an array.
3. Build `shiftsSlice` with `shiftClaimed`, `shiftReleased`, `noteChanged`, and `allShiftsCleared`. Use a `prepare` callback so `claimedAt` is set at action-creation time and the reducer stays pure.
4. Build `preferencesSlice` with `themeChanged` and `compactListToggled`, and register both slices in the store.
5. Add a shift button to the event list rows and to the detail page. Both must be the same component, reading and writing the same store state. Claim a shift from the list, navigate to the detail page, and confirm it shows as claimed.
6. Add a badge in the root layout's nav showing the shift count, using a selector exported from the slice. No component may reference `state.shifts.byEventId` directly except the slice file.
7. Introduce the re-render bug on purpose: write a selector that returns `Object.keys(...)` inline, add a `console.log` to the badge component, and dispatch an unrelated preferences action. Record how many times the badge re-rendered. Then fix it with `createSelector` and record the number again.
8. Create a `userSignedOut` action with `createAction` and handle it in both slices with `extraReducers`. A single "Sign out" button must reset both branches with one dispatch.
9. Try to store a `Date` object in the store instead of an ISO string. Read the serializability warning Redux Toolkit prints, paste it into `NOTES.md`, and explain in one sentence why the check exists.
10. Using Redux DevTools, claim two shifts, toggle the compact list, then time-travel back to before the first claim and confirm the UI matches. Export the state as JSON and commit it as `notes/state-snapshot.json`.
11. Answer in `NOTES.md`: name one piece of state currently in your app that should *not* move into the store, and say what should own it instead.

**Deliverable:** a committed app with a two-slice store, selectors as the only public read path, a cross-cutting action handled by both slices, and a `NOTES.md` documenting your state-shape design, your re-render measurements, and your answer to step 11.

## Check your understanding

1. Name one piece of Community Events Board state that belongs in the store and one that does not, and say what owns the second one instead.
2. A reducer contains `state = { ...state, note: "" }` and the note never clears. Why, and what are the two correct ways to write it?
3. Why is `userSignedOut` handled in `extraReducers` rather than `reducers` in the shifts slice?
4. `useSelector((state) => Object.keys(state.shifts.byEventId))` makes the badge re-render on every preferences toggle. Explain the mechanism in one sentence and give the fix.
5. DevTools shows `shifts/shiftClaimed` with the right payload, and the state diff shows the new entry, but the button still says "Claim a shift". Which part of the cycle do you inspect next?

**Answers:** (1) In: the volunteer's shifts (read by the nav badge, list, and detail page). Out: the event records (owned by route loaders), a form's in-progress field values (owned by the form), or the current filter (owned by the URL). (2) Reassigning the parameter discards the Immer draft; write `state.note = ""` or `return { ...state, note: "" }`. (3) The action is defined elsewhere (`createAction` in a shared file); `reducers` is only for actions the slice owns. (4) The selector builds a new array every time, which is never `Object.is`-equal to the last one, so every dispatch counts as a change; select a primitive or memoize with `createSelector`. (5) The selector or the component reading it: the action fired and the state changed, so the stale UI is on the read side.
