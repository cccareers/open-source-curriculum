---
course_id: react200
project_id: react200-x01
title: "Volunteer Drive: Optimistic Shift Claims and My Shifts"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - react200-04
  - react200-05
  - react200-07
objectives:
  - Manage application state in a central store
  - Handle asynchronous work and side effects in a state container
competency_ids:
  - D5-S1-C02
  - D2-S1-C04
---

## Scenario

The autumn volunteer drive for the Community Events Board starts in six weeks. The API team has shipped the shift endpoints from the implementation plan in lesson 06, and your lead has assigned you ticket VOL-114: volunteers claim and release shifts from the event detail page, see every shift they hold on `/my/shifts`, and see a count in the nav. The PM has signed off on these acceptance criteria (a subset of the ones you wrote in lesson 07):

- AC2 — Activating "Claim a shift" shows the shift as claimed immediately, before the server responds.
- AC3 — If the server rejects the claim, the claim is removed and the volunteer is told why, in a message that persists until dismissed or navigated away from.
- AC4 — A volunteer who already holds a shift sees "Release this shift" instead, and activating it removes the shift.
- Double-clicking "Claim a shift" sends one request, not two.

Event 12 is seeded full on staging, so a claim on it returns `409`.

## What you will build / produce

Inside your existing Community Events Board repository:

1. A `shifts` slice whose state is `{ byEventId, lastError }`, with `claimShift` and `releaseShift` thunks built with `createAsyncThunk`, an optimistic `pending` handler, a `rejected` rollback, and a `condition` that blocks a duplicate claim.
2. A `ShiftClaimPanel` component that renders three visible states: unclaimed, pending, and claimed.
3. A `MyShiftsPage` at `/my/shifts` and a `ShiftBadge` in the root layout nav.
4. A `makeStore(preloadedState)` factory so tests (and the app) can build a fresh store.
5. A passing Vitest + React Testing Library suite (sketch below) and a QA hand-off note in the lesson 07 format.

### The contract the tests rely on

| Export | File | Behavior |
|---|---|---|
| `makeStore(preloadedState?)` | `src/app/store.js` | Returns `configureStore({ reducer: { shifts, preferences, … }, preloadedState })`. Also export `store = makeStore()` for the app. |
| `claimShift({ eventId, role })` | `src/features/shifts/shiftsSlice.js` | `POST /api/events/:eventId/shifts` with body `{ role }`. On `201` returns `{ eventId, role, claimedAt }`. On any non-OK status, `rejectWithValue("That shift is no longer available.")` for `409`, otherwise `"Could not claim that shift."`. `condition` returns `false` when the event already has an entry in `byEventId`. |
| `releaseShift({ eventId })` | same | `DELETE /api/events/:eventId/shifts`. On `204` returns `{ eventId }` (do not call `response.json()` on a 204). |
| `selectShiftCount(state)` | same | Number of keys in `byEventId`, pending entries included (the claim is shown, so it is counted). |
| `selectLastError(state)` | same | `state.shifts.lastError`. |
| `shiftErrorDismissed()` | same | Clears `lastError`. |
| `ShiftClaimPanel` (default) | `src/features/shifts/ShiftClaimPanel.jsx` | Props `{ eventId }`. Unclaimed: button "Claim a shift". Pending: disabled button "Claiming…". Claimed: button "Release this shift". When `lastError` is set: a `role="alert"` element containing the message and a "Dismiss" button. |
| `ShiftBadge` (default) | `src/features/shifts/ShiftBadge.jsx` | Renders `My shifts (N)` as a `Link` to `/my/shifts`. |
| `MyShiftsPage` (default) | `src/features/shifts/MyShiftsPage.jsx` | Heading "My shifts". One list item per shift with a `Link` to `/events/:eventId` whose text includes the role. Empty state text "You have no shifts yet." |

## Before you start (prerequisites, starter files or data)

- Lessons 02–05 complete; your app has a root layout, an events section with loaders, and the two-slice store from lesson 04.
- Your mock API (Express, `json-server` plus custom routes, or Vite middleware) can serve the three shift endpoints, with event 12 returning `409`.
- Install the test tooling:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- Add to `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
```

- Create `src/test/setup.js`:

```js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- Add `"test": "vitest"` to the `scripts` block of `package.json`.

## Milestones

1. **Store factory.** Refactor `src/app/store.js` to export `makeStore(preloadedState)` and `store = makeStore()`. The app still runs exactly as before. Commit.
2. **Slice and thunks.** Rework `shiftsSlice` to the `{ byEventId, lastError }` shape. Add `claimShift` with `pending` (add `{ role, pending: true }` from `action.meta.arg`), `fulfilled` (replace with the confirmed record, `pending: false`), and `rejected` (delete the entry, set `lastError`, ignore `meta.aborted`). Add `releaseShift`. Add the `condition`. Export the selectors. Commit.
3. **Panel.** Build `ShiftClaimPanel` with all three states and the dismissible alert. Put it on `EventDetail`. Commit.
4. **My shifts and badge.** Add the `/my/shifts` route under the root layout and the badge in the nav. Commit.
5. **Tests green.** Copy the acceptance sketch below into `src/features/shifts/shifts.test.jsx` and make every test pass without editing the tests. Commit.
6. **Hand-off.** Write `docs/vol-114-handoff.md` using the six sections from lesson 07, including the seeded event 12 and at least two edge cases you did not test.

## Acceptance criteria

- [ ] Claiming shows "Claiming…" (disabled) before the request resolves, then "Release this shift".
- [ ] A `409` reverts the claim, shows "That shift is no longer available." in a `role="alert"` element, and leaves the badge count unchanged from before the attempt.
- [ ] The alert persists until "Dismiss" is activated or the user navigates away.
- [ ] Double-clicking "Claim a shift" produces exactly one `POST`.
- [ ] Releasing a held shift returns the panel to "Claim a shift" and decrements the badge.
- [ ] `/my/shifts` lists each held shift linking to its event, and shows "You have no shifts yet." when empty.
- [ ] No component outside `shiftsSlice.js` reads `state.shifts.byEventId` directly.
- [ ] Store state contains only serializable values (no `Date`, no `Error` objects); the Redux Toolkit dev check prints no warnings.
- [ ] `npx vitest run` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Run with:

```bash
npx vitest run src/features/shifts
```

`src/features/shifts/shifts.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { makeStore } from "../../app/store.js";
import { claimShift, selectShiftCount } from "./shiftsSlice.js";
import ShiftClaimPanel from "./ShiftClaimPanel.jsx";
import ShiftBadge from "./ShiftBadge.jsx";
import MyShiftsPage from "./MyShiftsPage.jsx";

// --- helpers ---------------------------------------------------------------

function jsonResponse(body, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderWithStore(ui, preloadedState) {
  const store = makeStore(preloadedState);
  const router = createMemoryRouter(
    [
      { path: "/", element: ui },
      { path: "/my/shifts", element: <MyShiftsPage /> },
      { path: "/events/:eventId", element: <p>Event detail</p> },
    ],
    { initialEntries: ["/"] },
  );
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return { store, router };
}

const heldShift = {
  shifts: {
    byEventId: {
      19: { role: "greeter", claimedAt: "2026-10-01T10:00:00.000Z", pending: false },
    },
    lastError: null,
  },
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// --- AC2: optimistic claim -------------------------------------------------

describe("claiming a shift", () => {
  it("shows the claim before the server answers, then confirms it", async () => {
    const user = userEvent.setup();
    const server = deferred();
    fetch.mockReturnValueOnce(server.promise);

    const { store } = renderWithStore(<ShiftClaimPanel eventId={7} />);
    await user.click(await screen.findByRole("button", { name: "Claim a shift" }));

    // Before the server responds
    expect(screen.getByRole("button", { name: "Claiming…" })).toBeDisabled();
    expect(selectShiftCount(store.getState())).toBe(1);

    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain("/api/events/7/shifts");
    expect(init.method).toBe("POST");

    server.resolve(
      jsonResponse({ eventId: 7, role: "general", claimedAt: "2026-10-02T09:00:00.000Z" }, 201),
    );

    expect(await screen.findByRole("button", { name: "Release this shift" })).toBeEnabled();
    expect(selectShiftCount(store.getState())).toBe(1);
  });

  it("sends one request when the button is double-clicked", async () => {
    const user = userEvent.setup();
    fetch.mockReturnValue(new Promise(() => {})); // never resolves

    renderWithStore(<ShiftClaimPanel eventId={7} />);
    await user.dblClick(await screen.findByRole("button", { name: "Claim a shift" }));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not start a second claim for an event already claimed (condition)", async () => {
    const store = makeStore(heldShift);
    await store.dispatch(claimShift({ eventId: 19, role: "greeter" }));
    expect(fetch).not.toHaveBeenCalled();
  });
});

// --- AC3: rollback on rejection --------------------------------------------

describe("a rejected claim", () => {
  it("reverts, explains itself, and leaves the badge where it was", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce(jsonResponse({ message: "Event is full" }, 409));

    const { store } = renderWithStore(
      <>
        <ShiftBadge />
        <ShiftClaimPanel eventId={12} />
      </>,
    );

    await user.click(await screen.findByRole("button", { name: "Claim a shift" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That shift is no longer available.",
    );
    expect(screen.getByRole("button", { name: "Claim a shift" })).toBeEnabled();
    expect(selectShiftCount(store.getState())).toBe(0);
    expect(screen.getByRole("link", { name: /my shifts \(0\)/i })).toBeInTheDocument();
  });

  it("keeps the message until it is dismissed", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce(jsonResponse({ message: "Event is full" }, 409));

    renderWithStore(<ShiftClaimPanel eventId={12} />);
    await user.click(await screen.findByRole("button", { name: "Claim a shift" }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// --- AC4: release ----------------------------------------------------------

describe("releasing a shift", () => {
  it("returns the panel to the unclaimed state and decrements the badge", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

    renderWithStore(
      <>
        <ShiftBadge />
        <ShiftClaimPanel eventId={19} />
      </>,
      heldShift,
    );

    expect(await screen.findByRole("link", { name: /my shifts \(1\)/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Release this shift" }));

    expect(await screen.findByRole("button", { name: "Claim a shift" })).toBeEnabled();
    expect(screen.getByRole("link", { name: /my shifts \(0\)/i })).toBeInTheDocument();
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
  });
});

// --- My shifts page --------------------------------------------------------

describe("/my/shifts", () => {
  it("links each held shift to its event", async () => {
    renderWithStore(<MyShiftsPage />, heldShift);
    const link = await screen.findByRole("link", { name: /greeter/i });
    expect(link).toHaveAttribute("href", "/events/19");
  });

  it("has a real empty state", async () => {
    renderWithStore(<MyShiftsPage />);
    expect(await screen.findByText("You have no shifts yet.")).toBeInTheDocument();
  });
});
```

Notes on the sketch:

- `fetch` is replaced per test with `vi.stubGlobal`, so no server needs to run. `Response` is the Node global (Node 18 or later).
- The router in `renderWithStore` exists only so `Link` has a router context. These routes have no loaders.
- If a test fails because a label differs ("Claim shift" instead of "Claim a shift"), fix the component, not the test. The labels come from the acceptance criteria QA will test against.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| State shape and ownership | Event records copied into the store, or shifts held as an array | `{ byEventId, lastError }`, keyed by event id, serializable, events stay in loaders | `NOTES.md` justifies the shape and names one thing deliberately kept out of the store |
| Async lifecycle | Only the happy path is handled | `pending`, `fulfilled`, and `rejected` all handled; `rejectWithValue` used; aborted rejections ignored | `condition` and an `addMatcher` rule are used where repetition is real, with a one-line justification |
| Optimistic UX | Claim waits for the server, or a failure reverts silently | Three visible states; rollback shows a persistent, dismissible alert | Pending state is announced to screen readers and keyboard focus stays on the control after rollback |
| Encapsulation | Components index into `state.shifts` | All reads go through exported selectors | Selectors that derive arrays are memoized and the re-render count is measured |
| Tests | Some tests edited to pass | All sketch tests pass unedited | One additional test of your own covers a case from your "not tested" list |
| Hand-off | No note, or happy path only | Six-section note with seeded event 12 and untested cases | QA tester (a peer) completes the note without asking a question |

## Stretch goals

- Hydrate the slice from `GET /api/me/shifts` in a `/my/shifts` route loader that dispatches a thunk and awaits it (lesson 05, "Where this meets the router"). Handle the `condition`/`unwrap()` interaction.
- Replace the hand-written `byEventId` handling with `createEntityAdapter` and keep every test passing.
- Add an `addMatcher` rule that sets a shared `lastError` for any rejected thunk in the slice.

## Reflection prompts

- Which acceptance criterion was hardest to make observable in a test, and why?
- Where did you have to choose between the store and a route loader, and what tipped the decision?
- What would change if the PM decided claims should not be optimistic after all? Which files would you touch?

## Instructor notes (common pitfalls, how to adapt for time)

- **Calling `response.json()` on a 204.** The release thunk throws a parse error and the test sees a rejection. Return `{ eventId }` from `meta.arg` instead.
- **Storing the caught `Error` in `lastError`.** Trips the serializability check; store the message string.
- **Badge counts confirmed shifts only.** The test expects pending entries to count, because the UI already shows them as claimed. If your cohort disagrees, change the contract table and the test together and record the decision; that disagreement is a good lesson 07 discussion.
- **`condition` too broad.** A `condition` that checks the slice's overall status, copied from lesson 05's `fetchEvents`, blocks claims on every other event. Check only `byEventId[eventId]`.
- **Shorter version (4–5 hours):** skip milestone 4 and the `/my/shifts` tests; keep the store factory, slice, panel, and the claim/rollback tests.
- **Test environment:** if React Router throws an error about `AbortSignal` under jsdom, see the open question in `enhancements/react200/review.md`; these tests avoid loaders, so it should not occur here.
