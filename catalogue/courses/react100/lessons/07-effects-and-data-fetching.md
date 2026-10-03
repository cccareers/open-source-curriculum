---
lesson_id: react100-07
course_id: react100
pathway: software-developer
title: Effects and Data Fetching
order: 7
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Load and display remote data from a component
---

## Work that does not belong in a render

Every component you have written is a function from props and state to markup. Call it with the same inputs and you get the same output, and it changes nothing outside itself. That property is what makes React predictable, and React depends on it: it may call your component function more than once for a single update, discard the result, or call it early to prepare something it never shows.

Which means a network request cannot go in the body of a component. Neither can a timer, an event listener on `window`, a write to `localStorage`, or a subscription to anything. These are **side effects** — work that reaches outside the component and touches the world. Put a `fetch` directly in a component body and it fires on every render, and since setting state causes a render, you have written an infinite loop that hammers someone's API.

`useEffect` is the hook that gives side effects a legal place to live. It runs your function *after* React has rendered and committed the result to the DOM, and it lets you say when it should run again and how to clean up after itself. This lesson uses it for the case you will meet first and most often: loading data from a server so a component can display it.

## useEffect and the dependency array

```jsx
import { useEffect } from "react";

useEffect(() => {
  document.title = `Toolshare — ${tool.name}`;
}, [tool.name]);
```

Two arguments. The first is the effect: a function React calls after the render is on screen. The second is the **dependency array**, and it is the part that determines everything about the behavior.

After each render, React compares each value in the array to its value from the previous render, using `Object.is`. If any changed, it runs the effect again. If none changed, it skips it.

That gives three distinct behaviors, and you should be able to name which one you want before you type the brackets.

```jsx
useEffect(() => { /* ... */ });              // no array: after EVERY render
useEffect(() => { /* ... */ }, []);          // empty array: once, after the first render
useEffect(() => { /* ... */ }, [toolId]);    // runs whenever toolId changes
```

The first form is almost always a mistake — if the effect sets state, it loops. The second is for setup that happens once. The third is the one you will write most.

The dependency array is not a configuration knob you tune until the behavior looks right. It is a **statement of fact**: these are the values from the render scope that this effect reads. Every prop, state variable, or derived value your effect uses must be listed. Leaving one out means the effect closes over a stale value from an old render and quietly uses the wrong data — the same snapshot behavior from lesson 04, now with a delay attached, which makes it much harder to see.

The ESLint rule that Vite's React template installs will tell you when a dependency is missing. Take it seriously. When it complains, the answer is either to add the dependency or to restructure so the effect no longer needs it. It is almost never to silence the warning; every experienced React developer has lost an afternoon to an effect someone silenced two years earlier.

## Cleanup

If your effect starts something that keeps running, it must be able to stop it. Return a function from the effect and React will call it before the next run of that effect and once more when the component is removed from the screen:

```jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

```jsx
useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

The mental model that keeps this straight: an effect is not "run once on mount". It is a pair — **start doing this** and **stop doing this** — and React runs the pair as many times as the dependencies say. Without the cleanup half, each run stacks another interval or another listener on top of the last, and the count grows every time the component appears. That is what a memory leak looks like in a browser application, and the symptom is usually a page that gets progressively slower or a handler that fires four times per event.

React tells you when you got this wrong, in development, by mounting every component twice on purpose. Vite's template wraps your app in strict mode, which runs each effect, immediately runs its cleanup, and runs the effect again. A correctly written effect is unaffected — it starts, stops, starts. An effect with no cleanup shows the double: two intervals, two listeners, two requests in the network tab. That double request is not a bug in your code or in React; it is React showing you a missing cleanup. Do not remove strict mode to make it go away. It does not happen in a production build, and the same defect would show up in production the first time the component was shown twice.

## Loading data: the four states

Fetching is the standard use for an effect, and the important part is not the `fetch` call — you already know that. It is that a component displaying remote data is never in one state. It is in one of four, and every one of them needs markup:

- **loading** — the request is in flight and there is nothing to show yet
- **success** — data arrived and can be rendered
- **error** — the request failed, or the server said no
- **empty** — the request succeeded and returned nothing

Skipping any of these produces a specific, recognizable defect. No loading state gives a blank screen that looks broken on a slow connection. No error state gives a permanently blank screen when the API is down, with the reason visible only in the console. No empty state gives a page with a heading and nothing under it.

Here is the whole pattern:

```jsx
import { useEffect, useState } from "react";
import ToolGrid from "./ToolGrid.jsx";

export default function ToolBrowser() {
  const [tools, setTools] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch("https://api.example.org/tools");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (ignore) return;
        setTools(data);
        setStatus("success");
      } catch (caught) {
        if (ignore) return;
        setError(caught);
        setStatus("error");
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (status === "loading") {
    return <p role="status">Loading tools…</p>;
  }

  if (status === "error") {
    return (
      <div role="alert">
        <p>We could not load the tool list.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return <p>No tools have been shared yet.</p>;
  }

  return <ToolGrid tools={tools} />;
}
```

Five things in that code deserve attention.

**The effect function itself is not `async`.** An `async` function returns a promise, and React expects an effect to return either nothing or a cleanup function. Returning a promise breaks cleanup and produces a warning. Declare an `async` function inside and call it, exactly as above.

**`fetch` does not throw on a 404 or a 500.** It rejects only on a network-level failure — no connection, DNS failure, CORS refusal. A response that arrived with status 500 is a *successful* fetch as far as the promise is concerned. Checking `response.ok` is what turns an HTTP error into a JavaScript error, and skipping that check is the single most common data-fetching bug there is: you call `.json()` on an error page, get a parse failure, and spend an hour debugging JSON when the real problem was a wrong URL.

**One status string, not three booleans.** Lesson 04 argued this; here is where it earns its keep. With `isLoading`, `isError`, and `hasData` you can end up in states that make no sense — loading and error at once — and every render branch has to guard against them. One string cannot be in two states.

**The `ignore` flag is the cleanup.** More on it in a moment.

**The loading and error markup carries `role="status"` and `role="alert"`.** Without them a screen reader user gets silence while the page changes underneath them. `role="status"` announces politely when the user is idle; `role="alert"` interrupts, which is right for a failure.

## Race conditions

Now the failure mode that separates code that works on your laptop from code that works on a train.

Give the browser a tool id and it refetches when the id changes. A user clicks tool A, then quickly clicks tool B. Two requests are now in flight. There is no rule that says they come back in order — A's server call might hit a slow replica and return second. If both write to state, the screen ends up showing tool A's data while the URL and the highlighted item say tool B. Nothing errored. The data is simply wrong, and it happens intermittently, which is the worst kind of bug to reproduce.

![A timeline of two overlapping fetches where the earlier request returns last and overwrites the newer data](./img/fetch-race-timeline.png)

The fix is that **an effect that is no longer current must not write state.** The `ignore` flag does exactly that:

```jsx
useEffect(() => {
  let ignore = false;

  async function load() {
    const response = await fetch(`https://api.example.org/tools/${toolId}`);
    const data = await response.json();
    if (ignore) return;
    setTool(data);
  }

  load();
  return () => {
    ignore = true;
  };
}, [toolId]);
```

Read the sequence carefully. When `toolId` changes, React runs the cleanup for the previous effect *before* running the new one. That sets the old closure's `ignore` to `true`. The old request may still return, but its `if (ignore) return` stops it before it touches state. Each effect run has its own `ignore` variable, because each run creates a new closure — this is one of the few places where closures being per-render is exactly what you want.

The stronger version actually cancels the request rather than ignoring its result, using `AbortController`:

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function load() {
    try {
      const response = await fetch(`https://api.example.org/tools/${toolId}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      setTool(await response.json());
      setStatus("success");
    } catch (caught) {
      if (caught.name === "AbortError") return;  // expected: we cancelled it
      setError(caught);
      setStatus("error");
    }
  }

  load();
  return () => controller.abort();
}, [toolId]);
```

`controller.abort()` in the cleanup tells the browser to drop the request, which saves bandwidth as well as preventing the stale write. The catch block must ignore `AbortError` specifically, or every cancelled request will show the user an error message. Both approaches are correct; abort is better behaved, the flag is simpler, and you will see both in real codebases.

## Refetching when the input changes

Once the dependency array is honest, refetching is automatic. Put the parameter in the array and the effect re-runs when it changes:

```jsx
useEffect(() => {
  // fetch tools for `category`
}, [category]);
```

Two traps.

**An object or array dependency changes identity every render.** If you pass `filters` as an object built in the parent's body, `{ category: "power" }` is a new object each time, `Object.is` says it changed, and your effect refetches forever. Depend on primitive values — `[filters.category, filters.search]` — or hold the object in state so its identity is stable.

**Fetching on every keystroke is a denial-of-service attack on your own API.** When the dependency is a search string, debounce it: keep the typed value in one state, and copy it into a second "committed" state on a timer, with the effect depending on the committed one.

```jsx
const [searchText, setSearchText] = useState("");
const [committedSearch, setCommittedSearch] = useState("");

useEffect(() => {
  const id = setTimeout(() => setCommittedSearch(searchText), 400);
  return () => clearTimeout(id);
}, [searchText]);
```

Each keystroke cancels the pending timer and starts a new one, so the fetch effect — which depends on `committedSearch` — only fires 400 milliseconds after typing stops. This is a small, complete illustration of why cleanup exists.

## Putting it in a custom hook

When two components need the same fetching logic, you do not copy it. A **custom hook** is just a function whose name starts with `use` and which calls other hooks; it can hold state and effects on behalf of its caller.

```jsx
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        setData(await response.json());
        setStatus("success");
      } catch (caught) {
        if (caught.name === "AbortError") return;
        setError(caught);
        setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, [url]);

  return { data, status, error };
}
```

```jsx
export default function ToolBrowser({ category }) {
  const { data: tools, status, error } = useFetch(
    `https://api.example.org/tools?category=${encodeURIComponent(category)}`
  );

  if (status === "loading") return <p role="status">Loading tools…</p>;
  if (status === "error") return <p role="alert">{error.message}</p>;
  if (tools.length === 0) return <p>No tools in this category yet.</p>;
  return <ToolGrid tools={tools} />;
}
```

The component is now four lines of logic and its markup. Note that each component calling `useFetch` gets its own independent state — a hook shares *logic*, never data. Note also `encodeURIComponent` on anything a user typed before it goes into a URL.

Production applications generally use a data-fetching library rather than hand-rolling this, because caching, retries, and deduplication add up. Those belong to react200. What you need from this lesson is the model underneath every one of them, and a hand-written version you fully understand.

## Shaping what the API gives you

An API's response is designed for the API's convenience, not your component's. It will have fields you do not need, names in a different convention, dates as strings, nested objects, and — often — a wrapper around the data you actually want.

```json
{
  "meta": { "page": 1, "total": 47 },
  "results": [
    { "tool_id": 91, "tool_name": "Cordless Drill", "owner": { "display_name": "Dana" }, "created_at": "2026-07-02T14:03:00Z" }
  ]
}
```

Do the translation once, at the boundary, rather than spreading `item.owner.display_name` through six components:

```jsx
function toTool(record) {
  return {
    id: String(record.tool_id),
    name: record.tool_name,
    owner: record.owner?.display_name ?? "Unknown",
    addedAt: new Date(record.created_at),
  };
}
```

```jsx
const payload = await response.json();
setTools(payload.results.map(toTool));
```

Three benefits, all of which you will feel within a week. Your components depend on a shape you control, so a change to the API is a change to one function. The `id` is a string, so it is a safe key. And `?? "Unknown"` handles a missing field once, instead of every component guarding against `undefined`.

This is also where you decide what to do about the wrapper. Storing the whole payload and reaching into `.results` everywhere couples every component to the API's envelope; storing the mapped array and the total count as separate state does not.

## Other effects you will write

Fetching is the headline use, but the same hook covers everything that synchronizes your component with something outside React. Three you will meet soon, each showing the same start-and-stop shape.

**The document title**, which lives on `document` and not in your tree:

```jsx
useEffect(() => {
  const previous = document.title;
  document.title = `${tool.name} — Toolshare`;
  return () => {
    document.title = previous;
  };
}, [tool.name]);
```

Note the cleanup restores the previous title. Without it, navigating away leaves the tab named after a tool nobody is looking at.

**Persisting to `localStorage`**, so a filter survives a reload:

```jsx
const [category, setCategory] = useState(
  () => localStorage.getItem("category") ?? "all"
);

useEffect(() => {
  localStorage.setItem("category", category);
}, [category]);
```

The lazy initializer reads once on the first render; the effect writes whenever the value changes. Reading directly in the component body instead would hit storage on every render for no reason.

**A keyboard shortcut**, which needs a listener on `document` and must remove it:

```jsx
useEffect(() => {
  function handleKeyDown(event) {
    if (event.key === "Escape") setIsOpen(false);
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

One timing note that ties these together. An effect normally runs *after* the browser has painted the render that scheduled it. (When the render was caused by a click or a keypress, React may run the effect just before the paint instead; either way it runs after the DOM is updated, and your code should not depend on which.) That is why an effect is the wrong place to measure or adjust layout before the user sees it — you would get a visible flicker — and exactly the right place for anything the user does not need to see happen. For the work in this course, "after paint" is the only timing you need.

## When not to use an effect

Effects are overused, and an unnecessary effect is worse than no effect: it adds a render, invites stale-closure bugs, and hides where a value comes from. Three cases where beginners reach for one and should not.

**Do not use an effect to derive a value from props or state.** Filtering a list, formatting a date, computing a total — these are calculations. Do them during render.

```jsx
// wrong
const [visible, setVisible] = useState([]);
useEffect(() => {
  setVisible(tools.filter((t) => t.category === category));
}, [tools, category]);

// right
const visible = tools.filter((t) => t.category === category);
```

The wrong version renders twice for every change and can be observed in an inconsistent state in between.

**Do not use an effect to respond to a user event.** If something should happen when a button is clicked, put it in the click handler. An effect that watches a state variable in order to detect that a button was pressed is indirection with no benefit, and it will fire in situations you did not intend.

**Do not use an effect to reset state when a prop changes.** Change the component's `key` instead, as lesson 05 showed — React discards the instance and creates a fresh one, which is both simpler and correct on the first render rather than one render later.

The question to ask: *is this synchronizing my component with something outside React?* A server, the document title, a browser API, a subscription. If yes, it is an effect. If it is just deciding what to render, it is a calculation.

## Debugging fetches

Work in this order and you will diagnose almost everything in a few minutes.

**Open the network tab first, not the console.** It tells you whether a request was made at all, what URL it actually used, the status that came back, and the response body. Half of "my fetch isn't working" is a URL with an `undefined` in it, visible instantly here.

**One request or two?** Two identical requests in development is strict mode, and it is expected. Two requests in production, or dozens, means a dependency array that changes every render.

**A request that never appears** means the effect did not run. Check that the component is actually rendered and that your dependency array is not preventing the run you expect.

**Status 0 or a CORS message** is the browser blocking the response because the server did not permit your origin. That is a server-side configuration issue and no amount of client code fixes it. A public practice API will already be configured for this.

**A JSON parse error** almost always means you skipped the `response.ok` check and are parsing an HTML error page.

**State that arrives one change late** means a stale closure: a dependency is missing from the array.

**Data appears and then reverts** is a race — two effects wrote in an unlucky order. Add the ignore flag or the abort.

## Practice

Continue in the `toolshare` project. Use a public practice API that returns JSON over HTTPS with permissive CORS; your instructor will name one, and any of the common fake-data APIs works. Treat its records as tools.

1. **Move the data remote.** Replace the hard-coded array from lesson 05 with a fetch in a `useEffect` inside a `ToolBrowser` component. Keep the tool list rendering exactly as it was.

2. **Implement all four states.** Add `loading`, `error`, `empty`, and `success` branches with distinct markup, using a single `status` string state rather than booleans. Give the loading element `role="status"` and the error element `role="alert"`.

3. **See each state on purpose.** Use the network tab's throttling to see the loading state for several seconds; break the URL to see the error state; request a filter that matches nothing to see the empty state. Screenshot all three.

4. **Prove `fetch` does not throw.** Remove the `response.ok` check and point the URL at a path that returns a 404. Record what error you actually get and where it surfaces. Restore the check and record the difference in `STRUCTURE.md`.

5. **Observe strict mode.** With the effect running, count the requests in the network tab and explain in one sentence why there are two in development.

6. **Write a cleanup for a subscription.** Add a component that listens to `window` resize and stores the width in state, with a cleanup. Then delete the cleanup, mount and unmount the component several times with a toggle, and log inside the handler to show it firing multiple times per event. Restore the cleanup.

7. **Refetch on a parameter.** Add a category filter that changes the request URL, with the category in the dependency array. Confirm in the network tab that exactly one new request fires per change.

8. **Cause a race.** Add an artificial delay that is longer for one category than another, then switch categories quickly and get the wrong data on screen. Record how you reproduced it. Fix it with an ignore flag, confirm the fix, then rewrite the fix with `AbortController` and confirm the request shows as cancelled in the network tab.

9. **Debounce a search.** Wire the search box to the request. First send a request per keystroke and count them in the network tab. Then add a 400-millisecond debounce with a cleanup and count again. Record both numbers.

10. **Extract a custom hook.** Move the fetching logic into `useFetch(url)` in `src/hooks/useFetch.js`, returning `data`, `status`, and `error`. Use it from two different components and confirm each gets its own independent state.

11. **Delete an unnecessary effect.** Find or introduce an effect that only derives a value from props or state, remove it in favor of a calculation during render, and write one sentence in `STRUCTURE.md` about what the effect version could show on screen that the calculation cannot.

12. **Handle a slow first paint honestly.** Make sure that nothing in your success branch reads a property of `null` before data arrives — deliberately throttle to the slowest setting and reload several times to confirm no crash.

**Deliverable:** a `toolshare` project loading its tools from a remote API with all four states handled, a category refetch, a debounced search, a race condition demonstrably fixed, and a reusable `useFetch` hook used from two components; plus your screenshots and recorded findings for steps 3, 4, 8, and 9.

## Check your understanding

1. What is the difference between `useEffect(fn)`, `useEffect(fn, [])`, and `useEffect(fn, [toolId])`?
2. The tools API returns a 500 error page. Without a `response.ok` check, what error do you see, and why is it misleading?
3. A member clicks the Drill, then quickly the Ladder. The Drill's request returns last and the Ladder's page shows the Drill. Name two fixes.
4. In development you see two requests in the network tab for one page load. Is that a bug?
5. A component filters `tools` by `category` inside a `useEffect` that calls `setVisible`. What should it do instead?

**Answers**

1. No array runs after every render; an empty array runs once after the first render; `[toolId]` runs after the first render and again whenever `toolId` changes.
2. A JSON parse error from `.json()` reading an HTML page. It points you at parsing when the real problem is the failed request.
3. An `ignore` flag set to `true` in the cleanup, or an `AbortController` whose `abort()` is called in the cleanup. Either way, the stale request cannot write state.
4. No. Strict mode runs the effect, its cleanup, and the effect again in development to expose missing cleanups. It does not happen in production.
5. Compute `const visible = tools.filter(...)` during render. Deriving a value is a calculation, not a side effect.
