---
lesson_id: react100-04
course_id: react100
pathway: software-developer
title: State and Event Handling
order: 4
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Manage component state and respond to user events
---

## The thing your app has been missing

Everything you have built so far is a function of its inputs. Data goes in at the top, flows down through props, and comes out as markup. Run it twice with the same data and you get the same screen twice. That is a real property and you should not give it up lightly — but it also means nothing on the page can *change*, and an interface nobody can change is a poster.

State is the memory that makes a component interactive. It is a value the component owns, that survives between renders, and that — this is the whole trick — **tells React to re-render when it changes**. Combined with event handlers, which are how a click or a keystroke reaches your code, it gives you the loop that every React application runs on: an event happens, state changes, React re-renders, the screen matches the new state.

Getting this loop right is the single highest-value thing in the course. Almost every confusing React bug a beginner hits — a value that is one click behind, a list that does not update, a component that renders forever — is a misunderstanding of something in this lesson.

## Why an ordinary variable does not work

Try the obvious thing first, so you know why it fails:

```jsx
export default function RequestCounter() {
  let count = 0;

  function handleClick() {
    count = count + 1;
    console.log("count is now", count);
  }

  return (
    <div>
      <p>Requests: {count}</p>
      <button onClick={handleClick}>Request this tool</button>
    </div>
  );
}
```

Click it. The console shows 1, 2, 3. The screen shows 0 forever.

Two separate things are wrong, and both are fundamental.

**Nothing told React to re-render.** React ran your function once, got markup describing "Requests: 0", and put that on screen. Changing a variable afterwards does not make React run the function again. There is no watcher; React does not observe your variables.

**Even if it did re-render, the variable would reset.** `let count = 0` is a local declaration inside the function. Every call creates a new one, initialized to zero. Local variables do not survive between renders — that is what "local" means.

State fixes exactly those two problems: it persists across renders, and assigning to it schedules a re-render.

## useState

```jsx
import { useState } from "react";

export default function RequestCounter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>Requests: {count}</p>
      <button onClick={handleClick}>Request this tool</button>
    </div>
  );
}
```

`useState(0)` returns an array of two things, which you destructure: the current value, and a function that replaces it. The naming convention is `[thing, setThing]` and you should follow it without exception — every React developer alive reads code by that pattern.

`useState` is a **hook**, one of a small set of functions React provides whose names all start with `use`. Hooks come with two rules that are not negotiable and are enforced by the linter Vite set up for you:

**Call hooks only at the top level of a component function.** Never inside an `if`, a loop, or a nested function. React identifies your state by *call order*, so a hook that is sometimes skipped shifts every hook after it onto the wrong value.

**Call hooks only from components or from other hooks.** A plain helper function cannot use `useState`.

Both rules come from the same implementation detail: React keeps a list of state slots per component instance and walks it in order on every render. As long as the order is stable, `count` is always slot zero.

The argument to `useState` is the **initial value**, used only on the very first render of that component. On every render after that it is ignored, which surprises people who pass a prop to it and expect the state to track the prop. It does not; state is initialized once and then it is yours.

## Events

React attaches handlers with camelCased props on elements: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onFocus`, `onBlur`, `onMouseEnter`. The value you pass is a **function**, not a call:

```jsx
<button onClick={handleClick}>Request</button>     {/* correct: pass the function */}
<button onClick={handleClick()}>Request</button>   {/* wrong: calls it during render */}
```

The second line runs `handleClick` while React is building the markup and passes its return value — usually `undefined` — as the handler. If that handler sets state, you have just created an infinite render loop: render calls the function, the function sets state, the state change causes a render. When your dev server locks up and the console fills with a "too many re-renders" error, look for a missing arrow function first.

When a handler needs an argument, wrap it in an inline arrow so you are still passing a function:

```jsx
<button onClick={() => setStatus("Out")}>Mark as out</button>
<button onClick={() => addRequest(tool.id)}>Request</button>
```

The handler receives an event object with the properties you would expect:

```jsx
function handleClick(event) {
  console.log(event.type);            // "click"
  console.log(event.target);          // the DOM element clicked
  console.log(event.currentTarget);   // the element the handler is attached to
  event.preventDefault();             // stop the browser's default behavior
  event.stopPropagation();            // stop the event bubbling to ancestors
}
```

React passes a lightly wrapped version of the native browser event, with the same interface across browsers. The native one is on `event.nativeEvent` if you ever need it, which is rare.

`preventDefault` matters for elements with built-in behavior: a link that navigates, a form that reloads the page. `stopPropagation` matters when a clickable thing sits inside another clickable thing — a delete button inside a card that is itself a link. Events bubble upward through the tree, so without it, one click fires both handlers.

Two practical notes. A `<div>` with an `onClick` is not a button: it cannot be focused, it does not respond to the Enter or Space key, and a screen reader announces nothing useful. Use a real `<button>` and let the browser do that work. And keep handlers small — a handler that runs twenty lines of logic is a handler nobody can test or reuse. Have it call a named function.

## State is a snapshot

This is the single most misunderstood thing in React, so read it twice and then prove it to yourself in the lab.

```jsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  console.log(count);
}
```

Starting from 0, that logs `0` and leaves the count at `1`. Not 3.

Here is why. `count` is a `const` created during a particular render. For the whole life of that render — including inside every handler defined in it — `count` is a fixed number. It is a **snapshot**. Calling `setCount` does not reach back and change that constant; it tells React "the next value of this state is 1" and schedules a re-render. So all three calls compute `0 + 1` and set the same value, and the `console.log` prints the snapshot it closed over, which is still 0.

The fix, when a new value depends on the previous one, is to pass a function instead of a value. React calls it with the latest pending value:

```jsx
function handleClick() {
  setCount((previous) => previous + 1);
  setCount((previous) => previous + 1);
  setCount((previous) => previous + 1);
}
```

That gives you 3, because the three updates are queued and applied in order.

The rule to carry out of here: **if the next state is computed from the current state, use the updater function.** `setCount(count + 1)` is fine when it happens once per event and no async work is involved, and `setCount(c => c + 1)` is always fine. When in doubt, use the updater.

The related behavior is **batching**. React does not re-render after each `setState` call — it collects every update triggered by one event and re-renders once with all of them applied. Setting three pieces of state in one handler produces one render, not three. This is why the screen never flickers through intermediate states and why you cannot read the new value immediately after setting it. If you need to act on the new value, either compute it into a local variable first or do the work in the next render.

## Never mutate state

State values must be **replaced**, not modified in place. This is the second-biggest source of "why didn't it update".

React decides whether to re-render by comparing the new state to the old with `Object.is` — essentially `===`. Mutating an object leaves the reference identical, so the comparison says "nothing changed" and React skips the render. Your data is different and the screen is not.

For objects, build a new one with the spread operator and override what changed:

```jsx
const [tool, setTool] = useState({ name: "Cordless Drill", status: "Available", owner: "Dana" });

// wrong — same object, no re-render
tool.status = "Out";
setTool(tool);

// right — a new object
setTool({ ...tool, status: "Out" });

// right, and safer when several updates can queue up
setTool((previous) => ({ ...previous, status: "Out" }));
```

Note the parentheses around the object literal in the arrow function. Without them, JavaScript reads `{` as the start of a function body.

Nested objects need the spread at each level you change:

```jsx
setTool((previous) => ({
  ...previous,
  owner: { ...previous.owner, phone: "555-0143" },
}));
```

For arrays, use the methods that return a new array and avoid the ones that mutate:

```jsx
const [requested, setRequested] = useState([]);

setRequested([...requested, toolId]);                          // add to the end
setRequested([toolId, ...requested]);                          // add to the front
setRequested(requested.filter((id) => id !== toolId));         // remove
setRequested(requested.map((id) => (id === oldId ? newId : id))); // replace one
setRequested([...requested].sort());                           // sort a copy
```

`push`, `pop`, `splice`, `sort`, and `reverse` all mutate. `sort` and `reverse` are the ones that catch people, because they look harmless; copy first with a spread and sort the copy.

This discipline is not React being fussy. Treating state as immutable is what lets React compare cheaply, what makes renders predictable, and what stops one component quietly corrupting data another component is showing.

## Choosing what state to have

Half of state bugs are really state *design* bugs. Three rules cover most of it.

**Do not put in state anything you can calculate from state.** If you have `tools` and `searchText` in state, the filtered list is not state — it is a value you compute during render:

```jsx
const [tools, setTools] = useState(initialTools);
const [searchText, setSearchText] = useState("");

const visibleTools = tools.filter((tool) =>
  tool.name.toLowerCase().includes(searchText.toLowerCase())
);
```

Storing `visibleTools` in state instead means keeping it in sync with two other values by hand, forever, and forgetting once. Derived values are just variables. Compute them.

**Split unrelated state, group state that changes together.** A search string and a selected category are independent — two `useState` calls. The three fields of one draft request change as a unit and are submitted as a unit — one object is reasonable. There is no penalty for having several `useState` calls in a component; the penalty is for grouping things that have nothing to do with each other into a bag you then have to spread carefully on every update.

**Avoid states that contradict each other.** If you have `isLoading` and `isError` as separate booleans, some code path will eventually set both to true, and the screen will claim to be loading and failed at once. A single `status` string with the values `"idle"`, `"loading"`, `"success"`, and `"error"` cannot be in two states at once. That pattern becomes important in lesson 07 and it is worth adopting the habit now.

One more mechanism you will occasionally want: if the initial value is expensive to compute, pass a function to `useState` instead of a value, and React will call it only on the first render:

```jsx
const [items, setItems] = useState(() => expensiveSetup());
```

Written as `useState(expensiveSetup())` the function runs on every render and the result is thrown away every time but the first.

## Where state lives

State belongs to one component. Deciding which one is a design decision, and it is the one that most often gets made wrong.

The rule is: **state lives in the closest common ancestor of every component that needs it.** Put it lower and the components that need it cannot reach it. Put it higher and every unrelated component in between re-renders for no reason and the code gets harder to follow.

Walk it through on Toolshare. `SearchInput` displays what was typed. `ToolGrid` shows the results. They are siblings, so neither can own the search text. Their closest common ancestor is `BrowsePage`, so `BrowsePage` owns it and hands each child what it needs. Moving state up like this is called **lifting state up**, and you will do it constantly.

![Search text stored in a parent component and passed down as a value to one child and as a setter function to another](./img/lifting-state-up.png)

The mechanics are exactly the props you already know, plus one new idea: **a function is a value, so a parent can pass a child the ability to request a change.**

```jsx
import { useState } from "react";
import SearchInput from "./SearchInput.jsx";
import ToolGrid from "./ToolGrid.jsx";

export default function BrowsePage({ tools }) {
  const [searchText, setSearchText] = useState("");

  const visibleTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="browse-page">
      <SearchInput value={searchText} onSearchChange={setSearchText} />
      <p>{visibleTools.length} tools match</p>
      <ToolGrid tools={visibleTools} />
    </div>
  );
}
```

```jsx
export default function SearchInput({ value, onSearchChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search tools"
    />
  );
}
```

`SearchInput` has no state at all. It receives the current value and a function to call when the user types, and it decides nothing. That makes it trivially reusable and trivially testable — it is a pure function of its props. A component like this is called **controlled**, and lesson 06 builds every form input this way.

Two conventions in that code are worth naming. Props that carry a function are named `onSomething` from the caller's side, and the handler inside is named `handleSomething`. And the child passes up *data* — `event.target.value` — rather than the event object. A parent should not need to know that the value came from an input element.

Data still flows one way. The value goes down, the request to change it goes up as a function call, and the parent decides what to do about it. React people call this pattern "data down, actions up", and it is the whole architecture.

## A worked example, end to end

Everything above assembled into one small feature: a member marks tools as wanted, and a running tally appears in the header. Two components that are nowhere near each other in the tree need the same data, which is the situation that forces every decision in this lesson.

The tally is shown by `SiteHeader`. The toggle is inside `ToolCard`, several levels down. Their closest common ancestor is `App`, so `App` owns the state.

```jsx
import { useState } from "react";
import SiteHeader from "./components/SiteHeader.jsx";
import ToolGrid from "./components/ToolGrid.jsx";

export default function App({ tools }) {
  const [wantedIds, setWantedIds] = useState([]);

  function handleToggleWanted(toolId) {
    setWantedIds((previous) =>
      previous.includes(toolId)
        ? previous.filter((id) => id !== toolId)
        : [...previous, toolId]
    );
  }

  return (
    <>
      <SiteHeader wantedCount={wantedIds.length} />
      <main>
        <ToolGrid
          tools={tools}
          wantedIds={wantedIds}
          onToggleWanted={handleToggleWanted}
        />
      </main>
    </>
  );
}
```

```jsx
export default function ToolCard({ tool, isWanted, onToggleWanted }) {
  return (
    <article className="tool-card">
      <h3>{tool.name}</h3>
      <button
        type="button"
        className={isWanted ? "btn btn--on" : "btn"}
        onClick={() => onToggleWanted(tool.id)}
      >
        {isWanted ? "Remove from wanted" : "Add to wanted"}
      </button>
    </article>
  );
}
```

Six decisions are packed into those twenty lines, and each one is a rule from earlier in this lesson.

The state is a **list of ids**, not a `isWanted` flag on each card. A flag inside `ToolCard` would be invisible to the header, and there would be no single place to count.

`wantedCount` is **derived at the call site** — `wantedIds.length` — rather than stored as its own state that must be kept in step.

The toggle uses the **updater form**, because the next list is computed from the current one and two rapid clicks must not both read the same snapshot.

Both branches **build a new array**. `filter` and the spread return new arrays; `push` and `splice` would have mutated and rendered nothing.

`ToolCard` receives `isWanted` as a **boolean it does not compute**, so the card stays a pure function of its props. `ToolGrid` decides it with `wantedIds.includes(tool.id)` as it renders each card.

And the handler travels **down as a prop**, named `onToggleWanted` from the caller's side and `handleToggleWanted` where it is defined. The card knows what happened; `App` decides what it means.

If you only remember one shape from this lesson, remember this one. Nearly every interactive feature you build for the rest of the course is a variation on it.

## What a re-render actually is

Worth being precise, because the word "render" makes people imagine the browser repainting.

When state changes, React calls your component function again. It calls the functions of that component's children too. Each call returns a new description of what the UI should look like. React compares that description with the previous one and changes only the real DOM nodes that actually differ. An input keeps its focus, a scrolled div keeps its scroll position, and a paragraph whose text is unchanged is not touched.

So a re-render is cheap and normal, and "my component re-rendered" is not a bug. What it does mean is that **every line in your component body runs again on every render**. A `console.log` at the top fires each time. A random number generated in the body changes each time. Anything expensive computed in the body is recomputed each time. Keep the body a straightforward function of props and state, and put anything that reaches outside the component — timers, subscriptions, network requests — where it belongs, which is the subject of lesson 07.

You will also notice, in development, that things sometimes happen twice. Vite's template wraps your app in strict mode, which deliberately double-invokes component bodies to surface accidental side effects. That is a development-only check, it does not happen in a production build, and the correct response is to make the body side-effect free rather than to switch it off.

## The bugs you will actually hit

**"My state is one click behind."** You are reading the snapshot after setting it. Use the value you just computed, not the state variable, or move the work to the next render.

**"Nothing updates when I change the array."** You mutated it. Look for `push`, `splice`, or `sort` and replace with a copy.

**"Too many re-renders."** You called a handler during render instead of passing it — `onClick={setOpen(true)}` — or you called a setter unconditionally in the component body.

**"Only the last of my three updates applied."** They all computed from the same snapshot. Use updater functions.

**"The child does not see the new value."** Check that the parent actually holds the state and that the prop is spelled the same in both files. React devtools shows the live state of every component, and it is faster than any amount of logging.

**"My state resets when I did not expect it."** A component that gets unmounted and remounted loses its state. That usually means its position in the tree changed, which is a structural problem, not a state one.

## Practice

Continue in the `toolshare` project. This is the longest lab in the course so far; work through it in order.

1. **Prove a plain variable fails.** Build the broken `RequestCounter` from the top of this lesson, click it, and record what the console shows versus what the screen shows. Then convert it to `useState` and confirm both agree.

2. **Add a request counter to the card.** Give `ToolCard` its own `requestCount` state and a "Request this tool" button that increments it. Render several cards and confirm each card's counter is independent — this is what "state belongs to a component instance" means in practice.

3. **Reproduce the snapshot bug.** In one handler, call your setter three times with `count + 1` and log `count` afterwards. Record the result. Convert to updater functions, record the new result, and write two sentences in `STRUCTURE.md` explaining the difference.

4. **Toggle with state.** Add an `isFavorite` boolean to `ToolCard` with a button that flips it using an updater function, and use it to switch the button's `className` and label text between two values.

5. **Mutate on purpose.** Add an object state to a component holding a tool's `name` and `status`. Write a handler that mutates the field and calls the setter with the same object. Confirm the screen does not update. Fix it with a spread, and write down in `STRUCTURE.md` why React could not tell that anything changed.

6. **Immutable array updates.** Add a `selectedCategories` array state to `FilterBar`, with buttons that add a category if absent and remove it if present, using only non-mutating operations. Render the current selection with `selectedCategories.join(", ")` and a count.

7. **Lift state up.** Move search text into `BrowsePage`, pass `value` and `onSearchChange` down to `SearchInput`, compute a filtered array in `BrowsePage`, and show the match count. `SearchInput` must end with no state of its own.

8. **Derive, do not store.** Deliberately add a second state variable holding the filtered results and update it inside the search handler. Then find a sequence of interactions that makes it disagree with the search text. Delete it and compute the value during render instead. Write down the sequence you found.

9. **Design a status state.** Replace any pair of related booleans in your app with a single string state that can hold `"idle"`, `"loading"`, or `"error"`, and use it to set a class on the page container. Write one sentence on what the boolean pair allowed that the string does not.

10. **Handle events properly.** Add a "Clear search" button that resets the search text, and make sure the button is a real `<button>` element. Confirm with the keyboard alone — Tab to it and press Enter — that it works without a mouse.

11. **Cause the infinite loop.** Write `onClick={handleClick()}` instead of `onClick={handleClick}` on a handler that sets state, read the error in the console, and then fix it. This one is worth causing once deliberately, because you will cause it accidentally later.

12. **Trace renders.** Put a `console.log` with the component's name at the top of `BrowsePage`, `ToolGrid`, and `ToolCard`. Type one character in the search box and record how many times each logs. Write two sentences in `STRUCTURE.md` on why children re-render when a parent's state changes.

**Deliverable:** a `toolshare` project with a working search that filters cards, per-card interactive state, a category selector using immutable array updates, and a `STRUCTURE.md` containing your written answers to steps 3, 5, 8, 9, and 12.
