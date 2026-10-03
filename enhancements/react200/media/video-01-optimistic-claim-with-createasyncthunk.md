---
course_id: react200
media_id: react200-v01
type: video-script
title: "Claim, Confirm, Roll Back: An Optimistic Thunk in Redux DevTools"
format: screencast
target_runtime: "8 min"
related_lessons:
  - react200-04
  - react200-05
objectives:
  - Handle asynchronous work and side effects in a state container
  - Manage application state in a central store
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
---

## Purpose

After watching, the learner can build an optimistic `createAsyncThunk` with a `pending` apply, `fulfilled` confirm, and `rejected` rollback, and can read all three lifecycle actions in Redux DevTools to prove the rollback worked.

## Audience and prerequisites

Apprentices who have finished lesson 04 (slices, selectors, DevTools) and are partway through lesson 05. They have the Community Events Board running with a `shifts` slice and a mock API in which event 12 is seeded full and returns `409`.

## Script

Code blocks referenced as **Code A–D** are listed in full under "Code shown on screen" below; type them live in the order given.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Browser, Community Events Board, `/events/14`. Cursor clicks "Claim a shift". Button changes to "Release this shift" instantly. Then `/events/12`: button flips to "Claiming…", then back to "Claim a shift" and an alert box appears reading "That shift is no longer available." | "Two clicks. The first one worked. The second one also *looked* like it was working — and then the app changed its mind and told you why. That second click is the one this video is about." |
| 0:20 | Title card: "Claim, Confirm, Roll Back". Subtitle: "Optimistic updates with createAsyncThunk". | "We're going to build that behavior with `createAsyncThunk`, and then prove it works by reading the actions in Redux DevTools rather than trusting what the screen shows." |
| 0:30 | VS Code, `src/features/shifts/shiftsSlice.js`, showing the synchronous slice from lesson 04 with `shiftClaimed`. | "Here's where we left the shifts slice in lesson 04. `shiftClaimed` updates the store, but nothing talks to a server. A reducer isn't allowed to — it has to be pure. So the request goes in a thunk." |
| 0:45 | Type **Code A** (the thunk) below the imports. | "Start with the thunk. The first argument is the type prefix, `shifts/claimShift`. The second is the payload creator: it receives the argument the component dispatched — an event id and a role — and a `thunkApi` object, from which we take `rejectWithValue`. It posts the role to the event's shifts endpoint." |
| 1:40 | Highlight `if (!response.ok)`. | "Remember that `fetch` does not reject on a 409. It resolves with a response whose `ok` is false. Skip this check and a full event counts as a success. `rejectWithValue` hands the reducer a message we chose, instead of whatever happened to be thrown." |
| 2:00 | Scroll to `createSlice`. Add `lastError: null` to `initialState`. Type **Code B** (`extraReducers`). | "Now the three lifecycle actions. They're defined by the thunk, not by this slice, so they go in `extraReducers`. Pending applies the claim and clears any old error. Fulfilled replaces it with the server's record. Rejected deletes it and stores the message." |
| 3:00 | Highlight `action.meta.arg` in the pending case, then in the rejected case. | "Here's what makes optimism possible. `action.meta.arg` is the exact argument the component dispatched, and it rides along on all three actions. So `pending` can apply the claim before the server says anything, and `rejected` knows which event to undo — without us threading the id through an error." |
| 3:20 | Highlight `delete state.byEventId[...]`. | "This `delete` is the rollback. Without it, the pending entry stays in the store, the nav badge counts a claim that failed, and you've got the exact bug lesson 08 asks you to fix." |
| 3:35 | Open `ShiftClaimPanel.jsx`. Show **Code C**. | "The panel reads one entry and branches on it. Three states, not two: nothing held, pending, confirmed. And if there's a last error, it renders an alert with a dismiss button, so the message stays until the volunteer has read it." |
| 4:05 | Browser with Redux DevTools docked right. Clear the action log. Navigate to `/events/14`. Click "Claim a shift". | "Now prove it. DevTools open, log cleared. Claim on event 14 — this one has space." |
| 4:15 | DevTools list shows `shifts/claimShift/pending`, then `shifts/claimShift/fulfilled`. Click `pending`, Diff tab: `byEventId › 14: { role: "general", pending: true }`. Click `fulfilled`, Diff: `pending: true → false`, `claimedAt` added. | "Two actions. On `pending`, the diff shows the entry appearing with `pending: true` — that's the instant feedback. On `fulfilled`, the same entry flips to `pending: false` and gains a `claimedAt` from the server." |
| 4:45 | Navigate to `/events/12`. Click "Claim a shift". DevTools shows `pending`, then `rejected`. | "Event 12 is seeded full. Watch the log." |
| 4:55 | Click `rejected`. Action tab: `payload: "That shift is no longer available."`, `meta.arg: { eventId: 12, role: "general" }`, `meta.requestStatus: "rejected"`. Diff tab: `byEventId › 12` removed, `lastError` set. | "`pending`, then `rejected`. The payload is our message from `rejectWithValue`. `meta.arg` is the argument that let us find event 12. The diff shows the entry removed and `lastError` set. The store is back where it started, plus an explanation." |
| 5:25 | Point at the nav badge: "My shifts (1)". | "The badge says one — the confirmed shift on event 14. The failed claim was counted for half a second and then uncounted. That's the rollback, visible in the UI and provable in the log." |
| 5:40 | Click the `pending` action for event 12, then "Jump". UI shows "Claiming…" on event 12. Jump to `rejected`. UI shows the alert. | "Time travel makes the in-between state easy to inspect. Jump to `pending` and you see exactly what a volunteer sees while the request is in flight. Jump to `rejected` and you see the recovery." |
| 6:05 | Editor. Add **Code D** (the `condition` option) as the third argument to `createAsyncThunk`. | "One more failure mode: a double-click sends two requests. The `condition` option runs before the thunk starts and can cancel it. It reads live state with `getState`, and if this event already has an entry — pending or confirmed — it returns false." |
| 6:30 | Browser, Network tab. Tab to "Claim a shift" on event 15, press Space twice quickly. One POST appears. DevTools shows one `pending` and one `fulfilled`. | "Two presses. One request, one pending, one fulfilled. The second dispatch saw the pending entry and stopped before anything was sent." |
| 6:50 | Lower-third checklist over the running app: "pending applies from meta.arg / fulfilled confirms / rejected deletes and explains / double-click sends one request". | "So when you build one of these, check four things. Does `pending` apply the change from `meta.arg`? Does `fulfilled` replace it with the server's version? Does `rejected` delete it *and* tell the user? And does a double-click send one request?" |
| 7:15 | Slide: "When not to be optimistic" — "Payments", "Irreversible actions", "Failures that are common". | "Optimism is right when failure is rare and being briefly wrong is cheap. A shift claim on a busy drive is borderline — that's a product decision, and lesson 07 is about raising it with your PM rather than deciding it alone." |
| 7:40 | End card: "Try it: lesson 05, practice step 9". | "Build it, break it on event 12, and read the log. If the diff on `rejected` doesn't show the entry removed, you've found your bug." |

### Code shown on screen

**Code A — the thunk**

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
      return rejectWithValue(
        response.status === 409
          ? "That shift is no longer available."
          : "Could not claim that shift.",
      );
    }
    return response.json();
  },
);
```

**Code B — lifecycle handlers**

```js
extraReducers(builder) {
  builder
    .addCase(claimShift.pending, (state, action) => {
      const { eventId, role } = action.meta.arg;
      state.byEventId[eventId] = { role, pending: true };
      state.lastError = null;
    })
    .addCase(claimShift.fulfilled, (state, action) => {
      const { eventId, role, claimedAt } = action.payload;
      state.byEventId[eventId] = { role, claimedAt, pending: false };
    })
    .addCase(claimShift.rejected, (state, action) => {
      if (action.meta.aborted) return;
      delete state.byEventId[action.meta.arg.eventId];
      state.lastError = action.payload ?? "Could not claim that shift.";
    });
},
```

**Code C — the panel**

```jsx
import { useDispatch, useSelector } from "react-redux";
import {
  claimShift,
  releaseShift,
  selectShiftFor,
  selectLastError,
  shiftErrorDismissed,
} from "./shiftsSlice.js";

export default function ShiftClaimPanel({ eventId }) {
  const shift = useSelector((state) => selectShiftFor(state, eventId));
  const error = useSelector(selectLastError);
  const dispatch = useDispatch();

  let control;
  if (shift?.pending) {
    control = (
      <button type="button" disabled>
        Claiming…
      </button>
    );
  } else if (shift) {
    control = (
      <button type="button" onClick={() => dispatch(releaseShift({ eventId }))}>
        Release this shift
      </button>
    );
  } else {
    control = (
      <button
        type="button"
        onClick={() => dispatch(claimShift({ eventId, role: "general" }))}
      >
        Claim a shift
      </button>
    );
  }

  return (
    <div className="claim">
      {control}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => dispatch(shiftErrorDismissed())}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

**Code D — deduplication**

```js
{
  condition({ eventId }, { getState }) {
    if (getState().shifts.byEventId[eventId]) return false;
  },
}
```

## On-screen assets and B-roll

- Community Events Board app at the lesson 05 stage, with event 12 seeded full in the mock API and a 400 ms artificial delay on the shifts endpoint so the pending state is visible on camera.
- Redux DevTools extension docked right; font size increased to at least 16 px; action filter cleared before each take.
- Editor theme with high contrast; font size at least 18 px; line numbers on.
- Checklist overlay at 6:50 as a lower-third text card.
- `releaseShift`, `selectShiftFor`, `selectLastError`, and `shiftErrorDismissed` exist in the slice before recording (they match project `react200-x01`), so Code C compiles on camera.
- Slide at 7:15 in the course template.

## Accessibility

- Burned-in captions plus a separate `.vtt` file; code is read aloud at the level of "type prefix", "payload creator", and each case name, so a listener can follow without seeing the screen.
- Every DevTools state is narrated in words ("the entry appears with pending true", "the entry is removed"), not just shown.
- The rollback is never conveyed by color alone: the alert has text, `role="alert"`, and the button label changes from "Claiming…" back to "Claim a shift".
- The 6:30 demo is keyboard-only (Tab to the button, Space to activate) with a visible focus ring.
- Provide the full transcript and the final code as a downloadable file beside the video.

## Check for understanding

1. Which action carries the argument the component dispatched, and on which lifecycle actions is it available?
   **Answer:** `action.meta.arg`, available on `pending`, `fulfilled`, and `rejected`.
2. A 409 response reaches the `fulfilled` case and the claim stays. What is missing from the payload creator?
   **Answer:** The `if (!response.ok)` check returning `rejectWithValue(...)`; `fetch` does not reject on HTTP error statuses.
3. In DevTools, what should the diff on the `rejected` action show for a correct rollback?
   **Answer:** The `byEventId` entry for that event removed, and `lastError` set to the message.
