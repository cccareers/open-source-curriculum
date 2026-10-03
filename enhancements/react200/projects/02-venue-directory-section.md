---
course_id: react200
project_id: react200-x02
title: "Venue Directory: A Nested, Data-Loaded Section"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: core
related_lessons:
  - react200-02
  - react200-03
  - react200-08
objectives:
  - Add client-side routing to a React application
  - Compose nested routes and layouts around shared data
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
---

## Scenario

Volunteers keep asking the Community Events Board team "where is Maker Space, and is it step-free?" The PM has asked for a venue directory: a list of venues, a page per venue showing its upcoming events, and a filter for step-free access that can be bookmarked and shared. An older version of the site published links to `/places`, and those links are still on partner organizations' pages, so they must keep working.

Your lead's direction, in the compressed form you practiced reading in lesson 08:

> Add a /venues section with its own layout. Load the venue list once for the whole section, not per page. The step-free filter goes in the URL. A bad slug should show a not-found message inside the section, not blow away the site nav. Keep /places working.

## What you will build / produce

1. A `/venues` section with a `VenuesLayout` (heading "Venues" plus an `<Outlet />`), an index `VenueList`, and a `:venueSlug` `VenueDetail`.
2. A section-level loader (route `id: "venues-root"`) that fetches `/api/venues` once per entry into the section, read by both children with `useRouteLoaderData`.
3. A detail loader that fetches `/api/venues/:venueSlug/events` and throws a `404` `Response` when the slug is not in the venue list.
4. A step-free filter stored as `?stepFree=1` with `useSearchParams`.
5. Error handling that keeps the "Venues" heading on screen when a child fails: a pathless child route holding an `errorElement` inside the venues layout, plus a fallback `errorElement` on the layout route itself for when the section loader fails.
6. A `/places` redirect to `/venues`.
7. An annotated route tree in `NOTES.md` and a passing acceptance-test suite.

### The contract the tests rely on

| Item | Detail |
|---|---|
| `routes` (named export) | `src/routes.jsx` exports the route array; `src/router.jsx` becomes `createBrowserRouter(routes)`. Tests build a memory router from the same array. |
| `GET /api/venues` | `[{ slug, name, stepFree }]` |
| `GET /api/venues/:slug/events` | `[{ id, title, date }]` |
| Venue list | Each venue is a `Link` whose text is the venue name, pointing to `/venues/<slug>`. A checkbox labelled "Step-free access only" controls `?stepFree=1`. |
| Venue detail | `<h3>` with the venue name; one `Link` per event to `/events/<id>`; "No upcoming events at this venue." when empty. |
| Not found | Inside the section: text "We could not find that venue." and a `Link` "Back to all venues". |

## Before you start (prerequisites, starter files or data)

- Lessons 02 and 03 complete: you have a root layout with `<Outlet />`, an events section, loaders, and error elements.
- Add venue data and the two endpoints to your mock API. Seed at least four venues, at least two with `stepFree: true`, and one venue with no events.
- Test tooling as in project `react200-x01` (`vitest`, `jsdom`, Testing Library, `jest-dom`, and the `src/test/setup.js` file).

## Milestones

1. **Extract the route array.** Move the array out of `createBrowserRouter` into `src/routes.jsx` and export it. The app behaves exactly as before. Commit. (This is a directed-change habit from lesson 08: a pure extraction, committed alone.)
2. **Section skeleton.** Add `VenuesLayout` at `path: "venues"` under the root layout, with an index child and a `:venueSlug` child rendering placeholder text. Add `Venues` to the main nav with `NavLink`. Commit.
3. **Section data.** Add `venuesLoader` and `id: "venues-root"` on the layout route. Render the list from `useRouteLoaderData("venues-root")`. Commit.
4. **Detail data.** Add `venueDetailLoader({ params, request })`: pass `request.signal` to `fetch`, throw `new Response("We could not find that venue.", { status: 404, statusText: "Not Found" })` when the API returns 404. Read the venue name from the section data, not from a second venue fetch. Commit.
5. **Filter in the URL.** Add the step-free checkbox. Checked sets `stepFree=1`; unchecked deletes the key (lesson 02: delete rather than set empty). Commit.
6. **Errors and redirects.** Wrap the index and `:venueSlug` children in a pathless route `{ errorElement: <VenueError />, children: [...] }` so child failures render inside `VenuesLayout`'s outlet, and add a fallback `errorElement` on the venues layout route itself. Add a `/places` route whose loader returns `redirect("/venues")`. Commit.
7. **Prove it.** Make the test sketch pass unedited, then write the annotated route tree in `NOTES.md`.

## Acceptance criteria

- [ ] `/venues`, `/venues/maker-space`, and `/venues/nowhere` all show the "Venues" heading and the site nav.
- [ ] Moving from the list to a detail page does not refetch `/api/venues` (one request in the Network tab).
- [ ] `/venues?stepFree=1` shows only step-free venues, survives a refresh, and can be pasted into a new tab.
- [ ] Unchecking the filter removes `stepFree` from the URL entirely.
- [ ] `/venues/nowhere` shows "We could not find that venue." inside the section, below the "Venues" heading, with a link back.
- [ ] `/places` lands on `/venues` with the address bar showing `/venues`.
- [ ] Every internal navigation uses `Link` or `NavLink`; no document reload occurs.
- [ ] `NOTES.md` contains the route tree annotated with element, loader, and error element per node, plus two sentences on why the venue loader sits on the layout route.
- [ ] `npx vitest run` passes.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Run with:

```bash
npx vitest run src/routes.test.jsx
```

`src/routes.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes.jsx";

// If your root layout uses the Redux store (for example a shift badge),
// wrap <RouterProvider> in <Provider store={makeStore()}> here.

const venues = [
  { slug: "maker-space", name: "Maker Space", stepFree: true },
  { slug: "rosa-parks-park", name: "Rosa Parks Park", stepFree: true },
  { slug: "old-library", name: "Old Library", stepFree: false },
  { slug: "quiet-hall", name: "Quiet Hall", stepFree: false },
];

const eventsByVenue = {
  "maker-space": [{ id: 12, title: "Repair Cafe", date: "2026-10-18" }],
  "rosa-parks-park": [],
  "old-library": [{ id: 19, title: "Book Swap", date: "2026-10-25" }],
  "quiet-hall": [],
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fakeApi(input) {
  const url = new URL(typeof input === "string" ? input : input.url, "http://localhost");
  const path = url.pathname;

  if (path === "/api/venues") return Promise.resolve(json(venues));

  const match = path.match(/^\/api\/venues\/([^/]+)\/events$/);
  if (match) {
    const list = eventsByVenue[match[1]];
    return Promise.resolve(list ? json(list) : json({ message: "Not found" }, 404));
  }

  // Anything else the root layout loads (events, etc.) gets an empty list.
  return Promise.resolve(json([]));
}

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

function venueCalls() {
  return fetch.mock.calls.filter(([input]) => {
    const raw = typeof input === "string" ? input : input.url;
    return new URL(raw, "http://localhost").pathname === "/api/venues";
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(fakeApi));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("venues section", () => {
  it("renders the list inside the section layout", async () => {
    renderAt("/venues");
    expect(await screen.findByRole("heading", { name: "Venues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maker Space" })).toHaveAttribute(
      "href",
      "/venues/maker-space",
    );
    expect(screen.getAllByRole("link", { name: /^(Maker Space|Rosa Parks Park|Old Library|Quiet Hall)$/ })).toHaveLength(4);
  });

  it("keeps the layout and does not refetch venues when opening a venue", async () => {
    const user = userEvent.setup();
    renderAt("/venues");

    await user.click(await screen.findByRole("link", { name: "Maker Space" }));

    expect(await screen.findByRole("heading", { level: 3, name: "Maker Space" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Venues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /repair cafe/i })).toHaveAttribute("href", "/events/12");
    expect(venueCalls()).toHaveLength(1);
  });

  it("shows a real empty state for a venue with no events", async () => {
    renderAt("/venues/quiet-hall");
    expect(await screen.findByText("No upcoming events at this venue.")).toBeInTheDocument();
  });
});

describe("step-free filter", () => {
  it("reads the filter from the URL", async () => {
    renderAt("/venues?stepFree=1");
    expect(await screen.findByRole("link", { name: "Maker Space" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Old Library" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Step-free access only" })).toBeChecked();
  });

  it("writes the filter to the URL and removes it when cleared", async () => {
    const user = userEvent.setup();
    const router = renderAt("/venues");
    const box = await screen.findByRole("checkbox", { name: "Step-free access only" });

    await user.click(box);
    await waitFor(() => expect(router.state.location.search).toBe("?stepFree=1"));

    await user.click(screen.getByRole("checkbox", { name: "Step-free access only" }));
    await waitFor(() => expect(router.state.location.search).toBe(""));
  });
});

describe("errors and redirects", () => {
  it("shows not-found inside the section for an unknown slug", async () => {
    renderAt("/venues/nowhere");
    expect(await screen.findByText("We could not find that venue.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Venues" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to all venues" })).toHaveAttribute("href", "/venues");
  });

  it("redirects the legacy /places URL", async () => {
    const router = renderAt("/places");
    await waitFor(() => expect(router.state.location.pathname).toBe("/venues"));
    expect(await screen.findByRole("heading", { name: "Venues" })).toBeInTheDocument();
  });
});
```

Notes on the sketch:

- Exporting the route array (milestone 1) is what makes this testable: the test uses the same routes as the app, under `createMemoryRouter` instead of `createBrowserRouter`.
- The not-found test passes only if the detail error is caught *below* the venues layout (the pathless child route). If the only error element is on the venues layout route, React Router replaces `VenuesLayout` itself and the "Venues" heading disappears; if it is only on the root, the site nav disappears too. Both fail the test — the lesson 03 rule ("the catching route's element is replaced") made executable.
- The single-fetch test relies on React Router's default revalidation: a parent loader is not re-run when only a child segment changes. Toggling the step-free filter *does* re-run it (search params changed); that is expected.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Route structure | Venue pages are flat routes repeating the heading | Layout route with index and dynamic children; child paths relative | Pathless or index decisions justified in `NOTES.md` |
| Data placement | Venues fetched per page, or on the root | One section loader with an `id`, read by both children | Route tree in `NOTES.md` annotated per node with loader and error element, and the "highest that needs it, lowest that can have it" reasoning stated |
| URL as state | Filter in `useState`; lost on refresh | `?stepFree=1` via the updater form; key deleted when off | Filter combined with an existing `q` param without dropping it, proven by a test you add |
| Error handling | Bad slug crashes or shows a blank page | Thrown 404 `Response` is caught by a pathless child route inside the section, with a way back; layout-level fallback present | Error element distinguishes thrown responses from exceptions with `isRouteErrorResponse`, and `NOTES.md` explains which route catches which failure |
| Directed-change discipline | One large commit | Extraction committed separately from behavior changes | PR description lists what was deliberately not touched |
| Tests | Tests edited to pass | All sketch tests pass unedited | One extra test for a case you chose |

## Stretch goals

- Add a `/venues/:venueSlug/events/:eventId` child that renders the event detail inside the venue page, reusing your existing detail loader.
- Add a `useNavigation` pending indicator in `VenuesLayout` and test it with a deferred `fetch`.
- Add a "Copy link to this filter" button that writes `window.location.href` to the clipboard.

## Reflection prompts

- What would have broken if you had put the venue loader on the root route instead? On the detail route?
- Which of your old `/places` links did you check, and how would you find links you do not control?
- Which test failed first, and what did the failure teach you about the router?

## Instructor notes (common pitfalls, how to adapt for time)

- **Error element on the layout route only.** The most common failure of the not-found test: the heading vanishes because the layout route caught the error and its own element was replaced. Ask the learner to say which route caught it before changing code.
- **Leading slash on a child path** (`path: "/venues/:venueSlug"` inside the layout's children) breaks matching. Point learners to lesson 03, "Child paths are relative."
- **Second venue fetch in the detail loader** to get the name. The tests count `/api/venues` calls; read the name from `useRouteLoaderData("venues-root")` instead.
- **`setSearchParams({ stepFree: "1" })`** drops other params. Accept it for the core tests, but it costs the "Exceeds" column for URL state.
- **Missing `statusText`.** If the error page shows "404 — " with nothing after the dash, the thrown `Response` has no `statusText`; see the lesson 03 note.
- **Test environment:** some combinations of Node, jsdom, and React Router raise an error that a request `signal` is not an `AbortSignal` when loaders run under `createMemoryRouter`. This is unverified for current versions; see "Open questions" in `review.md`. If it appears, record the versions and try the `happy-dom` environment before changing application code.
- **Shorter version (4 hours):** drop the filter and its two tests; keep the layout, section loader, not-found, and redirect.
