---
lesson_id: react200-03
course_id: react200
pathway: software-developer
title: Nested Routes, Layouts, and Route Data
order: 3
kind: lesson
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
objectives:
  - Compose nested routes and layouts around shared data
---

## Routes nest because interfaces nest

The flat route table you finished the last lesson with has a duplication problem waiting in it. Every page needs the site header, the nav, and the footer. Paste them into eight page components and you have eight places to change when the nav gains a link, and eight chances to miss one.

The deeper problem is that URLs are already hierarchical and your flat table pretends they are not. Look at the paths:

```text
/events
/events/new
/events/:eventId
/events/:eventId/attendees
```

Those are not four unrelated strings. They are a tree. `/events` is a section; the others are things inside it. A user moving between them expects the section to stay put and only the inner part to change — the events header stays, the list is replaced by a detail panel. That expectation is not decoration; it is what makes an application feel like one place instead of four pages.

Nested routes let you say that directly. A route can have `children`, and a parent route's element stays mounted while its children swap underneath it.

### The parent renders an outlet

A parent route's element must say *where* its child goes. That is the job of one component:

```jsx
import { Outlet, NavLink } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="app">
      <header>
        <h1>Community Events Board</h1>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <main id="content">
        <Outlet />
      </main>

      <footer>
        <p>Run by volunteers.</p>
      </footer>
    </div>
  );
}
```

`<Outlet />` is a placeholder that renders whichever child route currently matches. Everything around it is written once and stays mounted across navigations — which also means any state it holds survives. A sidebar's open/closed state, a scroll position, an audio player: put them in a layout and navigation stops resetting them.

Now restructure the table so every page is a child of that layout:

```jsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import EventsLayout from "./layouts/EventsLayout.jsx";
import EventList from "./pages/EventList.jsx";
import NewEvent from "./pages/NewEvent.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

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

Three things changed and each is worth reading carefully.

**Child paths are relative.** The child is written `path: "events"`, not `path: "/events"`. React Router joins it to the parent, producing `/events`. A leading slash on a child makes it absolute and is almost always a mistake — it will not match under its parent the way you expect.

**`index: true` marks the default child.** When the URL is exactly the parent's path with nothing after it, the index route fills the outlet. So `/events` renders `EventsLayout` with `EventList` inside it, while `/events/new` renders the same layout with `NewEvent` inside. An index route has no `path` of its own; that is the whole point.

**The catch-all moved inside.** Because `*` is now a child of the root layout, an unknown URL still renders inside your header and footer instead of dropping the user onto a bare page. That is nearly always what you want.

![A route tree showing a root layout containing an events layout, which contains an index list route and a detail route, with arrows marking which outlet each child fills](./img/route-tree-and-outlets.png)

### Layout routes without a path

Sometimes several routes share a wrapper but not a URL segment. A settings area might want a sidebar around `/profile`, `/notifications`, and `/security` without introducing a `/settings` prefix. A route with an `element` and `children` but no `path` does exactly that:

```jsx
{
  element: <SettingsLayout />,
  children: [
    { path: "profile", element: <Profile /> },
    { path: "notifications", element: <Notifications /> },
  ],
}
```

This is called a pathless layout route. It contributes nothing to the URL and everything to the tree. Use it when the grouping is visual rather than hierarchical; use a real path segment when the grouping is part of what the URL means.

### Relative links

Inside a nested route, a `to` value without a leading slash resolves against the current route, not against the site root:

```jsx
// Rendered inside the route "/events/:eventId"
<Link to="attendees">Attendees</Link>   // → /events/42/attendees
<Link to="..">Back to all events</Link> // → /events
<Link to="/events">All events</Link>    // → /events, absolute
```

Relative links make a nested section portable: move the whole subtree under a different parent path and the internal links follow. Absolute links are clearer at a distance — a header nav should always be absolute, because it points at fixed destinations from anywhere in the app.

## Route data: loading before you render

Here is the pattern the last course taught you for fetching:

```jsx
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let cancelled = false;
  fetch(`/api/events/${eventId}`)
    .then((response) => response.json())
    .then((data) => !cancelled && setEvent(data))
    .catch((problem) => !cancelled && setError(problem))
    .finally(() => !cancelled && setLoading(false));
  return () => {
    cancelled = true;
  };
}, [eventId]);
```

It works, and you will write it plenty of times in your career. But look at what it costs. The component renders once with nothing, then again with a spinner, then again with data. Three states live in the component that is supposed to be displaying one. The fetch cannot start until React has mounted the component, so the network request begins *after* the render that shows the spinner — a delay you paid for nothing. And every component that loads data repeats the whole ceremony.

The data router offers a different arrangement: **the route knows what it needs, so the router fetches it before rendering the component at all.**

### Loaders

A `loader` is an async function attached to a route. React Router calls it when that route is about to match, waits for it, and renders the element only once the data is there:

```jsx
export async function eventListLoader() {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Response("Could not load events", { status: response.status });
  }
  return response.json();
}
```

Attach it in the table and read it in the component:

```jsx
{ index: true, element: <EventList />, loader: eventListLoader }
```

```jsx
import { useLoaderData, Link } from "react-router-dom";

export default function EventList() {
  const events = useLoaderData();

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <Link to={String(event.id)}>{event.title}</Link>
          <span>{event.date}</span>
        </li>
      ))}
    </ul>
  );
}
```

The component has no loading state, no error state, and no effect. It receives data and renders it. That is the whole component.

A loader receives an argument with two useful properties. `params` holds the path parameters, already matched. `request` is a standard `Request` object, which is where you read the query string and the abort signal:

```jsx
export async function eventDetailLoader({ params, request }) {
  const response = await fetch(`/api/events/${params.eventId}`, {
    signal: request.signal,
  });

  if (response.status === 404) {
    throw new Response("Not Found", { status: 404 });
  }
  if (!response.ok) {
    throw new Response("Failed to load event", { status: response.status });
  }

  return response.json();
}
```

Two habits in that snippet are not optional in real code.

**Pass `request.signal` to `fetch`.** If the user navigates away mid-load, the router aborts the request. Without the signal you leave requests in flight and race their results.

**Throw on failure; do not return an error object.** A thrown `Response` is caught by the nearest error element, which is the next section. Returning `{ error: "..." }` puts you right back in the business of branching on data shape inside the component.

Reading the query string in a loader is the same standard API you already used with `useSearchParams`:

```jsx
export async function eventListLoader({ request }) {
  const url = new URL(request.url);
  const venue = url.searchParams.get("venue") ?? "";
  const query = url.searchParams.get("q") ?? "";

  const search = new URLSearchParams();
  if (venue) search.set("venue", venue);
  if (query) search.set("q", query);

  const response = await fetch(`/api/events?${search}`);
  if (!response.ok) throw new Response("Failed to load events", { status: 500 });
  return { events: await response.json(), venue, query };
}
```

That closes the loop from the last lesson. A filter in the URL is now a filter in the fetch, automatically, because changing the search params is a navigation and every navigation re-runs the loaders for the routes that match.

### Parent loaders and shared data

The lesson objective is data *around* which layouts compose, and this is the mechanism. A parent route can have a loader too, and its children can read it:

```jsx
{
  path: "events",
  element: <EventsLayout />,
  id: "events-root",
  loader: venueLoader,
  children: [ /* … */ ],
}
```

```jsx
import { useRouteLoaderData } from "react-router-dom";

export default function VenuePicker() {
  const venues = useRouteLoaderData("events-root");
  return (
    <select>
      {venues.map((venue) => (
        <option key={venue.slug} value={venue.slug}>
          {venue.name}
        </option>
      ))}
    </select>
  );
}
```

Give the parent route an `id`, and any descendant can ask for that route's data by id with `useRouteLoaderData`. The venue list is fetched once when the user enters the events section and is available to the list, the filter, the detail page, and the create form — without a context provider, without prop drilling, and without each of them fetching it again.

This is a genuine design decision, so make it deliberately. Data belongs on the **highest route that needs it and lowest route that can have it**. Put the venue list on the root layout and you fetch it on every page including the About page. Put it on the detail route and the list page cannot see it. When you sketch a route tree during planning, annotate each node with what it loads; that annotated tree is a design artifact a senior developer can review before you write a component, and it will catch more mistakes than the code review would have.

Loaders for a matched tree run **in parallel**, not in sequence. Entering `/events/42` fires the events-section loader and the detail loader at the same time. That is a real performance property, and it is why fetching in the parent component's effect and then in the child's effect is slower: those are inherently sequential, because the child does not mount until the parent has rendered.

### Pending states

If a loader takes half a second, the old URL's page stays on screen while it runs. Users read that as a frozen app unless you tell them otherwise. `useNavigation` reports what the router is doing:

```jsx
import { Outlet, useNavigation } from "react-router-dom";

export default function EventsLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <section aria-busy={isLoading}>
      <h2>Events</h2>
      {isLoading && <p role="status">Loading…</p>}
      <div className={isLoading ? "content content--stale" : "content"}>
        <Outlet />
      </div>
    </section>
  );
}
```

`navigation.state` is `"idle"`, `"loading"`, or `"submitting"`. Notice where the indicator lives: in the layout, written once, covering every child route. That is the third payoff of nesting — cross-cutting UI concerns get one home instead of one per page.

A useful nuance: because the previous page stays visible during the load, fading it slightly is often better than replacing it with a spinner. The user keeps their context and sees that something is happening.

## Errors that stay inside the layout

`errorElement` is the route-level equivalent of a catch block. If a loader throws, or an action throws, or the route's component throws while rendering, React Router walks up the tree to the nearest route with an `errorElement` and renders that in place of everything below it:

```jsx
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <section>
        <h2>
          {error.status} — {error.statusText}
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

`isRouteErrorResponse` distinguishes a `Response` you threw on purpose — a 404, a 403 — from a genuine JavaScript exception. Show the first as a message the user can act on. Show the second as an apology, and log the details rather than printing a stack trace at a volunteer coordinator.

Where you attach the error element decides how much of the screen it replaces:

```jsx
{
  path: "/",
  element: <RootLayout />,
  errorElement: <RouteError />,       // catches anything not caught deeper
  children: [
    {
      path: "events",
      element: <EventsLayout />,
      errorElement: <RouteError />,   // keeps header, nav, and events chrome
      children: [ /* … */ ],
    },
  ],
}
```

With an error element on the events layout, a failed detail load leaves the site header and the events heading intact and swaps only the inner panel. Without it, the failure bubbles to the root and the user loses the whole page including the nav they need to escape. Put an error element at the root always, and at each major section — that is the difference between a broken feature and a broken site.

## Mutations with actions

Loaders read. Actions write. A route can declare an `action`, and a submitted router `<Form>` runs it:

```jsx
import { redirect } from "react-router-dom";

export async function newEventAction({ request }) {
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "");

  if (!title) {
    return { errors: { title: "Give the event a title." } };
  }

  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, date }),
  });

  if (!response.ok) {
    throw new Response("Could not save the event", { status: response.status });
  }

  const created = await response.json();
  return redirect(`/events/${created.id}`);
}
```

```jsx
import { Form, useActionData, useNavigation } from "react-router-dom";

export default function NewEvent() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <label htmlFor="title">Title</label>
      <input id="title" name="title" required />
      {actionData?.errors?.title && (
        <p role="alert">{actionData.errors.title}</p>
      )}

      <label htmlFor="date">Date</label>
      <input id="date" name="date" type="date" required />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save event"}
      </button>
    </Form>
  );
}
```

Notice the difference from the controlled-input forms you built in the last course. There is no `useState` per field and no `onChange` handler. The router serializes the form for you and hands the action a `FormData`. Validation errors are *returned* from the action and read with `useActionData`; failures the user cannot fix are *thrown* and land in the error element. And after a successful action, the router automatically re-runs the loaders for the matched routes, so the events list is up to date without you invalidating anything by hand.

That last behavior is worth stating plainly, because it is the thing people miss: **a successful action revalidates route data.** Write once, refetch free.

Keep the boundary clean. Route data is for data that belongs to a URL — the record this page is about, the list this page shows. It is not a general application state container: a shopping cart, a signed-in user, a draft that survives across pages, or an open/closed sidebar do not belong to any single route. That kind of state is the next lesson's subject.

## Practice

Restructure the Community Events Board from the last lesson into a nested, data-loaded application. Run a mock API however you like — `json-server`, a small Express app from your Node coursework, or a Vite dev-server middleware — but the data must come over the network, not from a module import.

1. Create a root layout with the site header, main nav, and footer, rendering `<Outlet />` for its children. Move every existing page under it as a child route and confirm the nav no longer appears in any page component.
2. Add an events layout at `path: "events"` with an events heading and its own outlet. Make the list an `index: true` child, and put `new` and `:eventId` alongside it. Verify that `/events`, `/events/new`, and `/events/42` all render the events heading.
3. Convert the events list to a loader. Delete the `useState`/`useEffect` fetch entirely; the component must end up with no loading or error state of its own.
4. Convert the detail page to a loader that reads `params.eventId`, passes `request.signal` to `fetch`, and throws a `Response` with status 404 when the API returns 404.
5. Add a venue loader to the events layout, give that route an `id`, and read it from two different descendants with `useRouteLoaderData`. Confirm in the Network tab that the venues are fetched once per entry into the section, not once per component.
6. Wire the venue filter and search box into the list loader by reading `new URL(request.url).searchParams`. Confirm that changing a filter re-runs the loader and that pasting the filtered URL into a new tab produces the same list.
7. Add `errorElement` at both the root and the events layout. Force a failure by requesting `/events/9999` and describe in `NOTES.md` exactly which parts of the page survived and why.
8. Add a pending indicator driven by `useNavigation` in the events layout. Throttle the network to "Slow 3G" in DevTools and confirm the indicator appears on every navigation within the section.
9. Build the create form as a router `<Form>` with a route action. Return a field-level error for an empty title, throw for a failed save, and redirect to the new event's detail page on success. Confirm the events list is already up to date when you navigate back to it, without any code of yours refetching it.
10. Draw your route tree as an indented list in `NOTES.md`, annotating each node with the element it renders, the data it loads, and whether it owns an error element. Write two sentences justifying why each loader sits at the level you put it.

**Deliverable:** a committed app with a two-level layout tree, all data loaded by route loaders, section-scoped error and pending states, one working action, and a `NOTES.md` containing your annotated route tree and the answers from steps 7 and 10.
