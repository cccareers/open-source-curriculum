---
lesson_id: react200-05
course_id: react200
pathway: software-developer
title: Async Flows and Side Effects
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Handle asynchronous work and side effects in a state container
---

## Why a reducer cannot fetch

The store you built in the last lesson is entirely synchronous. Dispatch, reduce, new state, done. That is not an accident of the design, it is the design: a reducer must be a pure function of its inputs, because purity is what makes the state predictable, the DevTools time travel work, and a bug reproducible from a state snapshot and an action list.

A network request is the opposite of pure. It takes unknown time, it can fail, it can return different data on identical calls, and it has to happen somewhere.

That somewhere is a **middleware**. Middleware sits between `dispatch` and the reducers and can inspect, delay, transform, or swallow what passes through. Redux Toolkit installs one by default called **thunk**, and the whole of it is roughly this:

```js
const thunk = (store) => (next) => (action) => {
  if (typeof action === "function") {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};
```

Read it once and the mystery is gone. Normally `dispatch` receives a plain object and passes it to the reducers. If it receives a *function* instead, the thunk middleware calls that function, handing it `dispatch` and `getState`, and the function does whatever it likes — including awaiting a `fetch` and dispatching several plain actions along the way.

So the rule stands: reducers stay pure, and all the messy asynchronous work lives in functions that dispatch into them.

## Modelling a request as state

Before any code, decide what a component needs to know about an in-flight request. There are four possibilities and each needs a distinct rendering:

- Nothing has been asked for yet.
- A request is in flight.
- A request succeeded and there is data.
- A request failed and there is an error.

Two booleans cannot express that. `{ loading: false, error: null }` is ambiguous between "never asked" and "succeeded with an empty list" — which is exactly the bug that renders "No events found" for half a second before the data arrives. Use one status field with named values:

```js
const initialState = {
  entities: {},
  ids: [],
  status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};
```

Four states, mutually exclusive, impossible to hold two at once. The component reads one field and branches once. When you see `isLoading`, `isError`, `hasLoaded`, and `isEmpty` as four separate booleans in a codebase, that is eight impossible combinations waiting to be rendered, and someone will eventually hit one.

Keep the error a **string**, not the caught object. Error instances are not serializable, and stuffing one in the store trips the serializability check for good reason. Extract the message at the boundary.

## createAsyncThunk

Writing the thunk by hand teaches you the shape, so do it once:

```js
export function fetchEvents() {
  return async (dispatch) => {
    dispatch(eventsLoading());
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      dispatch(eventsLoaded(await response.json()));
    } catch (error) {
      dispatch(eventsFailed(error.message));
    }
  };
}
```

Three action types, a try/catch, and the same eleven lines repeated for every request in the app. `createAsyncThunk` generates all of it:

```js
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (filters = {}, thunkApi) => {
    const search = new URLSearchParams();
    if (filters.venue) search.set("venue", filters.venue);
    if (filters.query) search.set("q", filters.query);

    const response = await fetch(`/api/events?${search}`, {
      signal: thunkApi.signal,
    });

    if (!response.ok) {
      return thunkApi.rejectWithValue(`Could not load events (${response.status})`);
    }

    return response.json();
  },
);
```

The first argument is a type prefix. From it, `createAsyncThunk` generates three action types — `events/fetchEvents/pending`, `/fulfilled`, and `/rejected` — and dispatches them around your function automatically. The second argument is the **payload creator**: it receives the single argument the caller passed and a `thunkApi` object, and whatever it returns becomes the `fulfilled` action's payload.

`thunkApi` carries more than you will use at first, but four members earn their place:

- **`signal`** — an `AbortSignal` tied to this thunk. Pass it to `fetch` so the request can be cancelled.
- **`rejectWithValue(value)`** — return this to reject with a *controlled* payload. Without it, a rejection carries a serialized copy of whatever was thrown, which for a network failure is a generic message and for an HTTP error is nothing useful. With it, you decide exactly what the reducer receives.
- **`getState()`** — read current state to make a decision.
- **`dispatch`** — dispatch other actions, including other thunks.

### Handling the lifecycle actions

The thunk's three actions are defined outside the slice, so they go in `extraReducers`:

```js
import { createSlice } from "@reduxjs/toolkit";
import { fetchEvents } from "./eventsThunks.js";

const eventsSlice = createSlice({
  name: "events",
  initialState: { entities: {}, ids: [], status: "idle", error: null },
  reducers: {
    eventsCleared(state) {
      state.entities = {};
      state.ids = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.entities = {};
        state.ids = [];
        for (const event of action.payload) {
          state.entities[event.id] = event;
          state.ids.push(event.id);
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export const { eventsCleared } = eventsSlice.actions;
export default eventsSlice.reducer;
```

Note the rejected case. `action.payload` holds whatever you passed to `rejectWithValue`; `action.error.message` is the fallback for an unexpected throw — a `TypeError` in your own payload creator, for instance. Handle both. Clearing `error` in the pending case matters too: without it a retry shows the previous failure alongside a spinner.

`builder.addCase` is one of three matchers. `addMatcher` handles anything satisfying a predicate, which is how you write one rule for every pending thunk in a slice, and `addDefaultCase` is the fallback. Start with `addCase` and reach for `addMatcher` when the repetition is real.

### Dispatching, and what comes back

```jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "./eventsThunks.js";

export default function EventList() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);
  const ids = useSelector((state) => state.events.ids);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchEvents());
    }
  }, [status, dispatch]);

  if (status === "loading") return <p role="status">Loading events…</p>;
  if (status === "failed") {
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => dispatch(fetchEvents())}>
          Try again
        </button>
      </div>
    );
  }
  if (status === "succeeded" && ids.length === 0) return <p>No events scheduled.</p>;

  return (
    <ul>
      {ids.map((id) => (
        <EventRow key={id} id={id} />
      ))}
    </ul>
  );
}
```

That `status === "idle"` guard is doing real work, but be precise about which work. It stops the effect from refetching on later renders: once the first dispatch moves `status` to `"loading"` and then `"succeeded"`, re-renders do not fire another request.

It does **not** stop the doubled request in development. In StrictMode (React 18 and later), React mounts the component, runs the effect, runs its cleanup, and runs the effect again — all against the *same render*, so the second run reads the same `status` variable the first one did, which is still `"idle"`. The store has moved on to `"loading"`, but the effect's closure cannot see that. You will see two requests in the Network tab in development and one in production. The fix that actually reads live state is the `condition` option in the next section, because it calls `getState()` at dispatch time instead of trusting a value captured during render.

Dispatching a thunk returns a promise, and it is a promise that **does not reject** when your request fails — it resolves with either the fulfilled or the rejected action. That surprises everyone once:

```jsx
async function handleRefresh() {
  const action = await dispatch(fetchEvents());
  if (fetchEvents.rejected.match(action)) {
    console.warn("refresh failed:", action.payload);
  }
}
```

If you would rather have a real rejection, `.unwrap()` gives you one — it resolves with the payload or throws the error, so ordinary try/catch works:

```jsx
async function handleRefresh() {
  try {
    const events = await dispatch(fetchEvents()).unwrap();
    console.log(`loaded ${events.length} events`);
  } catch (message) {
    console.warn("refresh failed:", message);
  }
}
```

Use `.unwrap()` when the *component* needs to react to the outcome — close a dialog on success, keep a form open on failure. Skip it when the store's status field is the only thing that needs to know.

## Not fetching the same thing twice

Three components each dispatch `fetchEvents` on mount and you have made three identical requests. The `condition` option cancels a thunk before it starts:

```js
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (filters, thunkApi) => { /* … */ },
  {
    condition(filters, { getState }) {
      const { status } = getState().events;
      if (status === "loading" || status === "succeeded") {
        return false;
      }
    },
  },
);
```

Returning `false` cancels the thunk before it starts: no pending action and no request. By default no `rejected` action reaches your reducers either, so a cancelled duplicate does not put your slice into a failed state. The promise returned from `dispatch` still settles the way every thunk promise does — it resolves with a rejected action whose `meta.condition` is `true`, which you can ignore. The one place that bites is `.unwrap()`: on a condition-cancelled thunk, `unwrap()` throws, so code that awaits `dispatch(fetchEvents()).unwrap()` must expect that or skip `unwrap()`.

Because `condition` reads the store at dispatch time, it also fixes the StrictMode double request from the previous section: the second effect run dispatches, `condition` sees `"loading"`, and nothing is sent.

`condition` is the right tool for deduplication and for cheap caching ("we already have this, do not fetch again"). It is not a substitute for a real cache with expiry — when you need that, the answer is RTK Query, mentioned at the end of this lesson.

### Cancelling in-flight work

A user types in a search box and each keystroke fires a request. Four requests are in flight, they resolve out of order, and the list ends up showing results for `"pot"` after the results for `"potluck"` arrived. This is a **race condition**, and it is the most common async bug in front-end code.

The abort signal handles it:

```jsx
useEffect(() => {
  const promise = dispatch(fetchEvents({ query }));
  return () => promise.abort();
}, [query, dispatch]);
```

The promise returned by dispatching a thunk has an `abort()` method. Calling it fires the signal you passed to `fetch`, the browser cancels the request, and the thunk dispatches `rejected` with `action.meta.aborted` set to true. Handle that case by *not* treating it as an error:

```js
.addCase(fetchEvents.rejected, (state, action) => {
  if (action.meta.aborted) return;   // superseded, not failed
  state.status = "failed";
  state.error = action.payload ?? action.error.message ?? "Unknown error";
});
```

Debounce as well as abort, for a search box. To **debounce** is to wait until a value has stopped changing for a set time — say 300 ms — before acting on it. Aborting stops the stale result from winning; debouncing stops you making the request at all until the user pauses. Both, together, are how a search field should behave. A small hook is enough:

```jsx
import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);   // a new keystroke cancels the pending update
  }, [value, delay]);

  return debounced;
}
```

```jsx
const debouncedQuery = useDebouncedValue(query, 300);

useEffect(() => {
  const promise = dispatch(fetchEvents({ query: debouncedQuery }));
  return () => promise.abort();
}, [debouncedQuery, dispatch]);
```

The input stays bound to `query`, so typing feels instant; only the request waits. Note that this search thunk should not share the `condition` from the previous section unchanged — a status of `"succeeded"` would block every new search. Compare the requested query with the one already loaded, or give search its own thunk.

## Optimistic updates

Claiming a shift over the network takes a few hundred milliseconds. Waiting for the round trip before the button changes makes the app feel broken. An **optimistic update** applies the change immediately and reverts if the server disagrees:

```js
export const claimShift = createAsyncThunk(
  "shifts/claimShift",
  async ({ eventId, role }, { rejectWithValue }) => {
    const response = await fetch(`/api/events/${eventId}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      return rejectWithValue("That shift is no longer available.");
    }
    return response.json();
  },
);
```

```js
extraReducers(builder) {
  builder
    .addCase(claimShift.pending, (state, action) => {
      const { eventId, role } = action.meta.arg;
      state.byEventId[eventId] = { role, pending: true };
    })
    .addCase(claimShift.fulfilled, (state, action) => {
      state.byEventId[action.payload.eventId] = {
        role: action.payload.role,
        pending: false,
      };
    })
    .addCase(claimShift.rejected, (state, action) => {
      delete state.byEventId[action.meta.arg.eventId];
      state.lastError = action.payload ?? "Could not claim that shift.";
    });
}
```

`action.meta.arg` is the argument the thunk was dispatched with, and it is available on all three lifecycle actions. That is what makes the rollback possible: the rejected handler knows which event to undo without you threading the id through the error.

Be honest about when this is appropriate. Optimism is right when failure is rare and the consequence of being briefly wrong is small — a toggle, a like, a draft save. It is wrong when the operation is expensive, irreversible, or where showing the user a success that later evaporates would be worse than a short wait. Payments are not optimistic. And whichever you choose, the failure path must be visible: a silent revert is more confusing than a spinner ever was.

The `pending: true` flag lets the button render a third state — claimed-but-not-confirmed — which is usually kinder than a hard binary.

## Thunks that are not fetches

"Async work and side effects" is broader than the network. Anything a reducer must not do belongs in a thunk.

**Reading state to decide.** A thunk can inspect the store before acting:

```js
export const claimNextAvailable = () => (dispatch, getState) => {
  const { ids, entities } = getState().events;
  const claimed = getState().shifts.byEventId;
  const next = ids.find((id) => !claimed[id] && entities[id].spotsLeft > 0);
  if (next) dispatch(claimShift({ eventId: next, role: "general" }));
};
```

That is a plain thunk — a function, not a `createAsyncThunk` — and it is the right tool when there is no request lifecycle to model.

**Talking to browser APIs.** Persisting preferences to `localStorage`, writing to the clipboard, or starting a timer are all side effects. Do them in a thunk, or in the listener middleware below.

**Reacting to other actions.** Redux Toolkit's listener middleware runs a callback when a matching action is dispatched, which keeps the "when X happens, also do Y" logic out of your components:

```js
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { themeChanged } from "../features/preferences/preferencesSlice.js";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: themeChanged,
  effect: async (action) => {
    localStorage.setItem("theme", action.payload);
  },
});
```

```js
export const store = configureStore({
  reducer: { events: eventsReducer, shifts: shiftsReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
```

Note the shape of that `middleware` option. You must start from `getDefaultMiddleware()` — replacing the array outright removes the thunk middleware and the development checks, and then every thunk in your app stops working: dispatching one throws an error saying actions must be plain objects, because nothing is left to intercept the function.

## Where this meets the router

You now have two mechanisms that can load data, which raises a fair question: which one?

Use a **route loader** for data that belongs to the URL — the record this page is about, the list this page shows. The router gives you parallel loading, automatic revalidation after actions, and a component with no loading state at all. That is a better outcome than a thunk for the same job.

Use a **thunk** for data and effects that outlive a route — the volunteer's own shifts, a cart, a session, a notification queue — and for mutations whose in-flight state several components must see.

When you need both, a loader can dispatch a thunk and await it, so the route still waits for the data but the result lands in the store:

```js
export async function eventsLoader() {
  await store.dispatch(fetchEvents()).unwrap();
  return null;
}
```

Import the store directly in the loader module; loaders run outside React, so there are no hooks available. If `fetchEvents` has the `condition` option from earlier, the second visit to this route will be cancelled by `condition` and `.unwrap()` will throw, sending the user to the error element; drop `.unwrap()` here or check the status before dispatching. Use this sparingly. Every piece of data you move from the loader into the store is a piece you now have to invalidate yourself.

One honest final note. Most of what you wrote in this lesson — request status, deduplication, cancellation, revalidation — is generic plumbing, and Redux Toolkit ships a library that generates it: **RTK Query**, imported from `@reduxjs/toolkit/query/react` when you want the React hooks (the plain `@reduxjs/toolkit/query` entry point has no hooks). Define an endpoint and you get a hook with caching, deduplication, refetching, and tag-based invalidation. It is the recommended tool for server data in a new Redux application. You learned the manual version first because you will maintain codebases full of it, because RTK Query's behavior is only legible once you know what it is automating, and because the parts of async state that are genuinely yours — optimistic updates, cross-slice reactions, browser side effects — are still written exactly as above.

## Practice

Extend the Community Events Board with a store-managed async layer. Point it at a mock API you can make fail on demand; a route in your Express server that returns a 500 for a particular query is ideal.

1. Create `eventsSlice` with the four-value `status` field and a keyed `entities`/`ids` shape, plus a `fetchEvents` thunk built with `createAsyncThunk`. Handle all three lifecycle actions in `extraReducers`.
2. Render the list from the store, branching once on `status`. All four states must have distinct output, including a real empty state that is not shown while loading.
3. Make the API fail. Confirm the failure message you set with `rejectWithValue` appears, then add a "Try again" button and confirm it clears the error before retrying.
4. Under StrictMode, count the requests in the Network tab with the `status === "idle"` guard and again with it removed, and record in `NOTES.md` what you saw and why the guard alone did not prevent the double request in development. Restore the guard; step 5 fixes the duplicate properly.
5. Add a `condition` option so that mounting three components that all dispatch `fetchEvents` produces exactly one request. Prove it in the Network tab.
6. Wire the search box to `fetchEvents({ query })` with no debounce and an artificial server delay that is longer for shorter queries. Reproduce the out-of-order race and describe the wrong result you saw.
7. Fix the race by returning `promise.abort()` from the effect cleanup and passing `thunkApi.signal` to `fetch`. Skip the failed state when `action.meta.aborted` is true. Confirm the aborted requests show as cancelled in the Network tab and that no error is rendered.
8. Add a 300 ms debounce on top of the abort and count the requests for typing the word "potluck" before and after.
9. Convert shift claiming to an optimistic `createAsyncThunk`: apply on `pending` using `action.meta.arg`, confirm on `fulfilled`, revert on `rejected` with a visible message. Render the `pending: true` state differently from the confirmed state. Make the server reject one specific event id so you can demonstrate the rollback.
10. Add the listener middleware to persist the theme preference to `localStorage`, prepending it to `getDefaultMiddleware()`. Then deliberately replace the middleware array instead of prepending, observe that every thunk stops working, read the error, and restore it.
11. Write a short section in `NOTES.md` naming every piece of data in your app and stating whether it is owned by a route loader or by the store, with one sentence of justification each.

**Deliverable:** a committed app with a status-modelled async slice, deduplicated and cancellable requests, one optimistic mutation with a working rollback, a persisted preference via listener middleware, and a `NOTES.md` holding your race-condition write-up, your request counts, and the loader-versus-store ownership table.

## Check your understanding

1. Why can a reducer not call `fetch`, and what does the thunk middleware do differently when `dispatch` receives a function?
2. Why is `status: "idle" | "loading" | "succeeded" | "failed"` better than `loading` and `error` booleans? Name the bug the booleans cause.
3. `await dispatch(fetchEvents())` finishes without throwing, but the request failed. Why, and what are the two ways to detect the failure?
4. Results for "pot" appear after results for "potluck". What two techniques fix this, and what does each one prevent?
5. A claim is applied in `pending` and the server returns 409. Which value lets the `rejected` handler know which event to roll back?

**Answers:** (1) A reducer must be pure and synchronous; the thunk middleware calls the function with `dispatch` and `getState` instead of passing it to the reducers, so async work happens outside them. (2) One field makes the four states mutually exclusive; two booleans cannot tell "never asked" from "succeeded with nothing," which flashes "No events found" before the data arrives. (3) A dispatched thunk's promise resolves with either the fulfilled or the rejected action; check `fetchEvents.rejected.match(action)` or call `.unwrap()` inside try/catch. (4) Abort the superseded request (stops a stale result winning) and debounce the input (stops the request being sent until the user pauses). (5) `action.meta.arg`, the argument the thunk was dispatched with.
