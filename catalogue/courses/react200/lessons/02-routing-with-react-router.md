---
lesson_id: react200-02
course_id: react200
pathway: software-developer
title: Routing with React Router
order: 2
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Add client-side routing to a React application
---

## The problem routing actually solves

Every React app you built in the last course had one screen. If it had more than one view, you probably did something like this:

```jsx
const [view, setView] = useState("list");

return (
  <main>
    {view === "list" && <EventList onSelect={() => setView("detail")} />}
    {view === "detail" && <EventDetail />}
  </main>
);
```

That works, and it is the right first instinct. It also breaks in five ways the moment anyone other than you uses the app.

The URL never changes, so a user cannot bookmark the event they are looking at. They cannot send the link to a colleague. Pressing the browser Back button leaves the app entirely instead of going back one screen. Refreshing the page dumps them back on the list. And because `view` is a string in one component's state, every component that needs to know "where are we" has to have it passed down.

The fix is to stop storing the current screen in React state and start storing it in **the URL**. The address bar is already a piece of application state — one the browser manages, persists across refresh, records in history, and lets the user edit. Routing is the discipline of treating it that way.

### Server routing versus client routing

When you click a plain link, the browser does something dramatic: it throws away the entire page, requests a new document from the server, parses it, and starts over. Your React app unmounts. Every piece of state is gone. There is a visible flash.

Client-side routing avoids all of that. The router intercepts the click, calls the browser's History API to change the URL without a request, and re-renders the part of your component tree that should differ. No document fetch, no flash, no lost state.

The History API is doing the real work, and it is worth seeing directly once so the router stops feeling like magic. Open the console on any page and run:

```js
history.pushState({}, "", "/events/42");
```

The address bar changes. No request is made. Nothing else happens, because nothing was listening. React Router is the thing that listens: it watches for history changes and re-renders your app against the new path.

One consequence bites every learner exactly once. If the user is on `/events/42` and presses Refresh, the browser *does* send a real request for `/events/42` to whatever server is hosting your files. In development, Vite handles this for you. In production, the host must be configured to return `index.html` for any path it does not recognize, so your app boots and the router reads the path. If deployed routes 404 on refresh but work when clicked, that is the cause, and the fix is server configuration, not React.

## Setting up

Start from a Vite React project and add the router:

```bash
npm create vite@latest events-client -- --template react
cd events-client
npm install
npm install react-router-dom
npm run dev
```

React Router version 6.4 introduced a second way to declare routes — a plain data structure rather than nested JSX elements — and it is the one this course uses throughout. The older approach, where you wrap your app in `<BrowserRouter>` and render `<Routes>` and `<Route>` as elements, still works and you will meet it in existing codebases. It cannot do what the next lesson needs, so learn the data router now and recognize the older style when you see it.

### The route table

Create `src/router.jsx`:

```jsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import EventList from "./pages/EventList.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/events", element: <EventList /> },
  { path: "/events/:eventId", element: <EventDetail /> },
  { path: "/about", element: <About /> },
  { path: "*", element: <NotFound /> },
]);
```

Read that as a table, because that is what it is. Each object says: when the path matches this pattern, render this element. `createBrowserRouter` compiles the array into a matcher and subscribes to history changes.

Then hand the router to React in `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

Notice what is gone: there is no `<App />` any more. The router *is* the top of your tree now, and it decides which page component to render. That is the mental shift. Your app is no longer one component that shows different things; it is a set of pages selected by the URL.

A page component is nothing special:

```jsx
export default function Home() {
  return (
    <section>
      <h1>Community Events Board</h1>
      <p>Find something happening near you this week.</p>
    </section>
  );
}
```

Start the dev server and type `/about` into the address bar. The `About` page renders. Type `/nonsense` and the `*` route catches it.

### Route matching rules

Four rules cover almost everything you will hit.

**Matching is on path segments, not string prefixes.** `/events` matches the path `/events` exactly. It does not match `/events/42` — that is a different route.

**Dynamic segments start with a colon.** `:eventId` matches exactly one segment of any value and captures it under that name. `/events/:eventId` matches `/events/42` and `/events/potluck-2026`, but not `/events/42/edit`, which has an extra segment.

**Static beats dynamic.** If you have both `/events/new` and `/events/:eventId`, the URL `/events/new` matches the static route. React Router ranks routes by specificity rather than by array order, so you do not have to hand-sort your table the way older routers required. This is why `{ path: "*" }` can sit anywhere in the array and still only catch what nothing else claimed.

**Trailing slashes are normalized.** `/events` and `/events/` reach the same route.

Do not add a route for `/index.html` or for asset paths. Those are files the server serves; the router never sees them.

## Navigating without reloading

A raw anchor tag is a full page load, and a full page load defeats the entire point. React Router gives you a component that renders a real anchor — with a real `href`, so middle-click, right-click-copy, and screen readers all behave — but intercepts the plain left-click:

```jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section>
      <h1>Community Events Board</h1>
      <Link to="/events">Browse all events</Link>
    </section>
  );
}
```

Use `<Link>` for every internal navigation. Use a plain `<a href>` only for external URLs, `mailto:`, and file downloads. There is a quick way to tell whether you got it right: click the link and watch the browser's reload indicator. If the tab spinner runs, you did a document load.

For navigation that should show whether it is the current page — a header nav, a sidebar — there is a variant that knows:

```jsx
import { NavLink } from "react-router-dom";

export default function SiteNav() {
  return (
    <nav aria-label="Main">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/events">Events</NavLink>
      <NavLink to="/about">About</NavLink>
    </nav>
  );
}
```

`<NavLink>` adds the class `active` when its `to` matches the current URL, and it sets `aria-current="page"` for you, which is the accessible way to say "you are here". You can also pass a function to `className` or `style` for finer control:

```jsx
<NavLink
  to="/events"
  className={({ isActive }) => (isActive ? "nav-item nav-item--current" : "nav-item")}
>
  Events
</NavLink>
```

That `end` prop on the Home link matters. Without it, `to="/"` is considered active for every path in the app, because every path starts with `/`. `end` means "active only on an exact match." Nearly every nav bar needs it on the root link and nowhere else.

### Navigating from code

Some navigation is not a click on a link — it follows a save, a login, or a redirect after a delete. For that, use the hook:

```jsx
import { useNavigate } from "react-router-dom";

export default function CreateEventButton() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/events/new");
  }

  return (
    <button type="button" onClick={handleClick}>
      Add an event
    </button>
  );
}
```

Two options are worth knowing now.

`navigate("/events", { replace: true })` replaces the current history entry instead of pushing a new one. Use it after a successful form submission so that Back does not return the user to a form they already submitted, and after a redirect so Back does not bounce them straight forward again.

`navigate(-1)` goes back one entry, exactly like the browser button. Useful for a "Cancel" control on a detail screen.

Do not reach for `useNavigate` when a link would do. A link is keyboard-accessible, focusable, previewable on hover, and openable in a new tab; a `<button>` with `onClick` is none of those. The rule of thumb: if the user is choosing where to go, that is a link. If the app is deciding where they go after something happened, that is `useNavigate`.

## Reading data out of the URL

Now the payoff. Once the URL carries state, components read from it rather than from props threaded down through a tree.

### Path parameters

`useParams` returns the dynamic segments the current route captured:

```jsx
import { useParams, Link } from "react-router-dom";

export default function EventDetail() {
  const { eventId } = useParams();

  return (
    <article>
      <h1>Event {eventId}</h1>
      <Link to="/events">Back to all events</Link>
    </article>
  );
}
```

The key on the returned object is the name you wrote after the colon in the route path, so `:eventId` gives you `params.eventId`. Two things are always true of these values and both cause bugs:

**They are always strings.** `/events/42` gives you `"42"`, not `42`. Compare with care and coerce explicitly if the value is going into arithmetic or a strict equality check against a numeric id.

**They are user input.** Anyone can type `/events/does-not-exist`. A component that assumes the id resolves to a record will crash on a URL a stranger typed. For now, guard it:

```jsx
const event = events.find((item) => String(item.id) === eventId);

if (!event) {
  return <p>We could not find that event.</p>;
}
```

The next lesson replaces that guard with something better, but never leave the case unhandled.

### Query parameters

Path segments identify *which thing*. Query parameters describe *how you want to see it*: a filter, a sort, a page number, a search term. They belong in the URL for exactly the same reasons a path does — a filtered list should be linkable and survive a refresh.

`useSearchParams` gives you a pair shaped like `useState`, except the value lives in the address bar:

```jsx
import { useSearchParams } from "react-router-dom";

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const venue = searchParams.get("venue") ?? "";
  const query = searchParams.get("q") ?? "";

  function handleVenueChange(nextVenue) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (nextVenue) {
        next.set("venue", nextVenue);
      } else {
        next.delete("venue");
      }
      return next;
    });
  }

  return (
    <section>
      <label htmlFor="venue">Venue</label>
      <select
        id="venue"
        value={venue}
        onChange={(event) => handleVenueChange(event.target.value)}
      >
        <option value="">All venues</option>
        <option value="rosa-parks-park">Rosa Parks Park</option>
        <option value="maker-space">Maker Space</option>
      </select>
      <p>
        Showing {query ? `matches for "${query}"` : "all events"}
        {venue ? ` at ${venue}` : ""}.
      </p>
    </section>
  );
}
```

`searchParams` is a standard `URLSearchParams` object, not a plain object, so you read with `.get(name)` and it returns `null` when the key is absent — hence the `?? ""`. Four details are worth internalizing:

- **Build the next value from the previous one.** Passing a bare object to `setSearchParams` replaces the whole query string, silently dropping the user's search term when they change the venue filter. The updater form above preserves the rest.
- **Delete rather than set empty.** `?venue=` in the URL is ugly and reads as a real filter for an empty venue. Removing the key is the honest representation of "no filter."
- **Every change pushes a history entry by default.** For a select that is usually fine. For a text input that updates on every keystroke it is awful — Back has to be pressed thirty times to escape. Pass `{ replace: true }` for high-frequency updates.
- **Query values are strings too**, and just as untrusted as path params. `?page=banana` will arrive.

### Knowing where you are

`useLocation` returns the current location object when you need more than parameters:

```jsx
import { useLocation } from "react-router-dom";

export default function DebugBar() {
  const location = useLocation();
  return <pre>{location.pathname + location.search + location.hash}</pre>;
}
```

The common real uses are analytics ("record a page view when `pathname` changes") and preserving a destination through a redirect — sending an unauthenticated user to `/login` with `state: { from: location }` so you can send them back afterward. `location.state` is data attached to a history entry; it survives Back and Forward but not a refresh, so never put anything you cannot regenerate in it.

## Redirects, 404s, and the shape of a real route table

Two route patterns show up in every application.

A **catch-all** handles anything unmatched. Give it a real page, not a blank screen: say what happened and offer a link back to somewhere useful.

```jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you asked for does not exist or has moved.</p>
      <Link to="/">Go to the home page</Link>
    </section>
  );
}
```

A **redirect** moves an old or shorthand URL to its real home. In the data-router API, that is a route with a `loader` that throws a redirect:

```jsx
import { redirect } from "react-router-dom";

{
  path: "/calendar",
  loader: () => redirect("/events"),
}
```

Loaders are the next lesson's subject; this is the one use of them you need today. Keep old URLs working with redirects rather than deleting them — links you do not control point at them.

Putting it together, a realistic table for the events client:

```jsx
export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/events", element: <EventList /> },
  { path: "/events/new", element: <NewEvent /> },
  { path: "/events/:eventId", element: <EventDetail /> },
  { path: "/venues/:venueSlug", element: <VenueDetail /> },
  { path: "/about", element: <About /> },
  { path: "/calendar", loader: () => redirect("/events") },
  { path: "*", element: <NotFound /> },
]);
```

Eight lines that describe the entire navigable surface of the application. That is the second reason to like the data-router form: the route table is a document a reviewer can read. When you plan a feature in lesson 06, this table is one of the artifacts you will produce before writing a component.

You may have noticed the repetition coming: every one of these pages will need the same header, nav, and footer around it. Solving that without pasting a layout into eight components is exactly what nested routes do, and that is the next lesson.

## Practice

Build the routed shell of the Community Events Board. Use a hard-coded array of events in a module for now — data loading arrives in the next lesson.

1. Scaffold a Vite React app, install `react-router-dom`, and create `src/data/events.js` exporting at least six event objects with `id`, `title`, `date`, `venue`, `venueSlug`, and `description`.
2. Create `src/router.jsx` with `createBrowserRouter` and routes for `/`, `/events`, `/events/new`, `/events/:eventId`, `/venues/:venueSlug`, `/about`, and a `*` catch-all. Render it from `main.jsx` with `RouterProvider`.
3. Build a nav component using `NavLink` for Home, Events, and About. Style the active link. Put `end` on the Home link, then remove it, observe that Home is highlighted on every page, and put it back.
4. In the events list, render each event's title as a `Link` to its detail URL. Confirm in DevTools that clicking one does not reload the document.
5. In `EventDetail`, read `eventId` with `useParams`, find the matching event, and render a clear "not found" message when the id matches nothing. Verify by typing `/events/9999` into the address bar.
6. Add a venue filter and a text search to the events list, both stored in the URL with `useSearchParams`. The venue select should push a history entry; the search box should use `{ replace: true }`. Prove both behaviors with the Back button.
7. Make the filter state survive a refresh: apply a venue and a search term, copy the URL, open it in a new tab, and confirm the same filtered list appears.
8. Add a `/calendar` route that redirects to `/events`, and confirm the address bar ends on `/events`.
9. On the detail page, add a "Cancel" button that calls `navigate(-1)` and a "Back to all events" `Link`. Write two sentences in `NOTES.md` explaining when each is the right control.
10. Deliberately break one thing and fix it: change `path: "/events/:eventId"` to `path: "/events/:id"` without changing the component, observe what `useParams` returns, and record what the failure looked like.

**Deliverable:** a committed app whose entire navigable surface is described by one route table, where every screen is linkable, refreshable, and reachable with the Back button, plus a `NOTES.md` holding your answers from steps 9 and 10.
