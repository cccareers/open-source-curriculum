---
course_id: react200
media_id: react200-v02
type: video-script
title: "Where the Error Lands: Layouts, Loaders, and errorElement"
format: screencast
target_runtime: "7 min"
related_lessons:
  - react200-02
  - react200-03
objectives:
  - Compose nested routes and layouts around shared data
  - Add client-side routing to a React application
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
---

## Purpose

After watching, the learner can choose which route owns a loader and which route owns an `errorElement`, and can predict exactly which parts of the page survive a failed load, using the rule that the catching route's own element is the thing replaced.

## Audience and prerequisites

Apprentices midway through lesson 03. They have a root layout and an events layout with an `<Outlet />`, and can read a `createBrowserRouter` route table. A mock API serves `/api/events`, `/api/events/:id` (returning `404` for unknown ids), and `/api/venues`.

## Script

Code blocks referenced as **Code A–D** are listed in full under "Code shown on screen" below.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open, two browser windows side by side, both at `/events/9999`. Left: the whole page is replaced by "Something went wrong" — no header, no nav. Right: site header, nav, and the "Events" heading are still there; only the inner panel shows "404 — Not Found. We could not find that event." with a "Back to all events" link. | "Same app. Same bad URL. On the left, the volunteer is stranded — no nav, nothing to click. On the right, they lose one panel and keep everything they need to recover. The only difference between these two is where one line of the route table sits." |
| 0:25 | Title card: "Where the Error Lands". | "Let's build the right-hand version on purpose, and see why it works." |
| 0:30 | VS Code, `src/router.jsx`, **Code A** (the nested table without loaders or error elements). Cursor traces the indentation: root, events, index, `new`, `:eventId`. | "Here's our nested table from lesson 03. Root layout at the top. Inside it, the events layout. Inside that, three children: the list as the index route, the create form, and the detail page. Each layout renders an `<Outlet />`, and the outlet is where the matched child appears." |
| 1:00 | Split view: route table left, running app right at `/events/42`. Overlay draws a box around the header (labelled "RootLayout"), a box around the "Events" heading (labelled "EventsLayout"), and a box around the detail content (labelled "EventDetail"). | "Read the screen as the table. The outer box is the root layout. Inside it, the events layout. Inside that, whatever the URL selected. Three nested boxes, three nested routes." |
| 1:25 | Editor. Add the loaders: `loader: venueLoader` and `id: "events-root"` on the events route, `loader: eventDetailLoader` on `:eventId`. Show **Code B** (the detail loader). | "Now data. The venue list is needed by the list, the detail page, and the create form — everything inside events, nothing outside it. So it goes on the events layout route, with an `id` so children can ask for it. The detail record belongs to one URL, so it goes on the detail route." |
| 2:00 | Highlight the `throw new Response(...)` with `statusText`. | "When the API says 404, the loader throws a `Response`. The first argument becomes the message the error page shows. And set `statusText` yourself — a `Response` you build by hand doesn't fill it in from the status code." |
| 2:20 | Browser DevTools Network tab, filter "api". Navigate `/events` → `/events/42`. Two requests at the moment of entering the section: `/api/venues` and `/api/events`; then on clicking the event, only `/api/events/42`. | "Watch the network. Entering the section fetches venues once. Clicking into an event fetches only the event — the venue loader doesn't re-run, because the events layout's own part of the URL didn't change." |
| 2:45 | Hard refresh at `/events/42` with the Network waterfall visible: `/api/venues` and `/api/events/42` start at the same time. | "Refresh on the detail page and both loaders fire at once, in parallel. If these were `useEffect` fetches, the child's request couldn't start until the parent had rendered. Loaders don't wait for each other." |
| 3:05 | Editor. Show **Code C** (`RouteError`). Add `errorElement: <RouteError />` to the root route only. | "Now errors. Here's an error element. `isRouteErrorResponse` tells a `Response` we threw on purpose apart from a real crash. We'll attach it to the root route first — only the root." |
| 3:30 | Browser at `/events/9999`. Whole page replaced, nav gone. | "Bad id. The detail loader throws. React Router walks *up* the tree looking for the nearest `errorElement`. The detail route has none, the events layout has none, the root has one — so the root's error element replaces everything below the root. Including the header and nav. That's the stranded volunteer from the start." |
| 4:00 | Overlay animation on the route table: a highlight starting at `:eventId`, stepping up to `events`, then `"/"`, stopping there. | "Say it as a rule: an error replaces everything from the route that caught it, downward." |
| 4:15 | Editor. Add `errorElement: <RouteError />` to the events route. Browser at `/events/9999`: header and nav survive, but the "Events" heading is gone; the error fills the space where the events section was. | "Add an error element on the events layout. Same bad URL. Now the walk up the tree stops at the events route — so the root layout, header, and nav stay. But look: the 'Events' heading is gone too. The route that catches the error swaps out its *own* element. The events layout caught it, so the events layout is what got replaced." |
| 4:35 | Overlay restates the rule as text: "The catching route's element is replaced. Everything above it stays." | "That's the rule in one line: the catching route's element is replaced; everything above it stays." |
| 4:45 | Editor. Wrap the events children in a pathless route that has only an `errorElement` (**Code D**). Browser at `/events/9999`: header, nav, and "Events" heading all survive; only the inner panel shows "404 — Not Found", the message, and the link. | "So if we want the heading to survive, we catch one level lower. A pathless child route — no path, no element, just an error element and the children. It renders inside the events outlet, so when the detail fails, only the panel is replaced. That's the right-hand window from the start." |
| 5:05 | Browser at `/`; stop the mock API. Click the "Events" nav link. | "It's not only 404s. Stop the API and enter the section." |
| 5:10 | The venue loader on the events layout fails; the events-route error element shows the failure message below the site header; the nav is still clickable. Tab key moves focus to "Home" in the nav; Enter navigates away successfully. | "This time the events layout's own loader failed, so the pathless child can't help — it's below the failure. The error element on the events route catches it, which is why we kept that one as a fallback. The volunteer can still use the nav to leave — you can see me tab to Home and go there with the keyboard." |
| 5:25 | Slide: "Rule of thumb" — "Error element at the root: always." / "Error element at each major section, and inside it for child errors." / "Data on the highest route that needs it and the lowest that can have it." | "So two placement rules. Error elements: always at the root, and at every major section — plus a pathless one inside the section when you want its chrome to survive a child's failure — because that's the difference between a broken feature and a broken site. Loaders: on the highest route that needs the data and the lowest route that can have it." |
| 5:55 | Editor: `NOTES.md` with the annotated tree (shown under "On-screen assets"). | "And write it down. An indented tree with what each node renders, loads, and catches is a design artifact a senior developer can review in a minute — it's the route map you'll put in your implementation plan in lesson 06." |
| 6:25 | Back to the two side-by-side windows from the cold open. | "Same bad URL, two outcomes, one line of difference. Now you know which line, and why." |
| 6:40 | End card: "Try it: lesson 03, practice step 7". | "Request `/events/9999` in your own app, and write down exactly which parts of the page survived and why. If you can predict it before you press Enter, you've got it." |

### Code shown on screen

**Code A — the nested table (starting point)**

```jsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "events",
        element: <EventsLayout />,
        children: [
          { index: true, element: <EventList /> },
          { path: "new", element: <NewEvent /> },
          { path: ":eventId", element: <EventDetail /> },
        ],
      },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

**Code B — the detail loader**

```jsx
export async function eventDetailLoader({ params, request }) {
  const response = await fetch(`/api/events/${params.eventId}`, {
    signal: request.signal,
  });

  if (response.status === 404) {
    throw new Response("We could not find that event.", {
      status: 404,
      statusText: "Not Found",
    });
  }
  if (!response.ok) {
    throw new Response("Failed to load event", { status: response.status });
  }

  return response.json();
}
```

**Code C — the error element**

```jsx
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <section>
        <h2>
          {error.status} — {error.statusText || "Error"}
        </h2>
        <p>{error.data}</p>
        <Link to="/events">Back to all events</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>Something went wrong</h2>
      <p>{error?.message ?? "Unknown error"}</p>
    </section>
  );
}
```

**Code D — final table**

```jsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,              // last resort: replaces RootLayout
    children: [
      { index: true, element: <Home /> },
      {
        path: "events",
        id: "events-root",
        element: <EventsLayout />,
        loader: venueLoader,
        errorElement: <RouteError />,          // EventsLayout's own loader failed
        children: [
          {
            errorElement: <RouteError />,      // child failed: renders in the events outlet
            children: [
              { index: true, element: <EventList />, loader: eventListLoader },
              { path: "new", element: <NewEvent />, action: newEventAction },
              { path: ":eventId", element: <EventDetail />, loader: eventDetailLoader },
            ],
          },
        ],
      },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

## On-screen assets and B-roll

- Community Events Board at the lesson 03 stage; mock API that can be stopped on camera.
- Network throttling off for the waterfall shot at 2:45 but with a 300 ms server delay so the parallel bars are visible.
- Box overlay at 1:00 (three nested outlined rectangles with text labels, not color-only) and the step-up highlight at 4:00. These reuse the visual language of `animation-02-route-tree-and-error-bubbling.md`.
- `NOTES.md` shown at 5:55:

```text
/                     RootLayout       errorElement
  (index)             Home
  events              EventsLayout     loader: venues (id events-root)   errorElement
    (pathless)        —                                                  errorElement
      (index)         EventList        loader: events (?venue, ?q)
      new             NewEvent         action: create
      :eventId        EventDetail      loader: one event (404 → thrown Response)
  about               About
  *                   NotFound
```

## Accessibility

- Captions and a transcript; every overlay label is spoken ("the outer box is the root layout").
- The survive-or-replace comparison is conveyed by which text remains on screen (header, nav, "Events" heading), described aloud, never by color.
- The 5:10 shot demonstrates recovery by keyboard with a visible focus ring.
- Code font at least 18 px; the route table is shown in full before any edits so a screen-magnifier user can find their place.

## Check for understanding

1. Error elements sit on the root and on the events layout route only (no pathless child). The detail loader throws. What stays on screen?
   **Answer:** The root layout (header, nav, footer). The events layout route caught the error, so its own element — including the "Events" heading — is replaced by the error element.
2. Why does navigating from `/events` to `/events/42` not re-run the venue loader?
   **Answer:** The venue loader is on the events layout route, whose own part of the URL and search params did not change, so React Router does not revalidate it by default.
3. A teammate moves the venue loader to the root route "so it's available everywhere." What is the cost?
   **Answer:** Venues are fetched on every page in the app, including Home and About, which do not use them.
