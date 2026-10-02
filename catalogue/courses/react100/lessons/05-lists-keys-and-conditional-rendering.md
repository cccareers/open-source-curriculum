---
lesson_id: react100-05
course_id: react100
pathway: software-developer
title: Lists, Keys, and Conditional Rendering
order: 5
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Render lists and conditional interfaces correctly
---

## Markup you did not write by hand

Every real interface renders things it cannot know in advance. Forty tools, or none. A "you have unread requests" banner that is usually absent. A card that shows a "Reserve" button to members and an "Edit" button to owners. So far you have written every element out by hand, which works for exactly as long as you know the contents at the time you write the file.

This lesson covers the two mechanisms that replace hand-written markup: turning a collection of data into a collection of elements, and choosing between alternatives at render time. Neither requires new React API — it is all ordinary JavaScript inside braces. What is genuinely new, and what this lesson spends most of its time on, is **keys**: a small requirement with unusually severe consequences when you get it wrong.

## Rendering a collection

Remember that a JSX element is a plain value. So an array of elements is just an array of values, and React knows how to render one — it renders each item in order.

```jsx
const tools = [
  { id: "t-1", name: "Cordless Drill", owner: "Dana", status: "Available" },
  { id: "t-2", name: "Wet/Dry Vacuum", owner: "Marcus", status: "Out until Friday" },
  { id: "t-3", name: "Extension Ladder", owner: "Priya", status: "Available" },
];

export default function ToolGrid() {
  return (
    <div className="tool-grid">
      {tools.map((tool) => (
        <ToolCard key={tool.id} name={tool.name} owner={tool.owner} status={tool.status} />
      ))}
    </div>
  );
}
```

Three cards, one definition, and the array can hold three items or three hundred without the component changing. That is the whole idea, and it is why `map` — not `forEach`, not a `for` loop — is the tool you reach for. `map` *returns* a new array, and returning a value is the only thing JSX braces can use. `forEach` returns `undefined` and renders nothing; a `for` loop is a statement and cannot go inside braces at all.

If you prefer a loop, build the array above the `return` and interpolate it:

```jsx
export default function ToolGrid({ tools }) {
  const cards = [];
  for (const tool of tools) {
    cards.push(<ToolCard key={tool.id} name={tool.name} owner={tool.owner} />);
  }
  return <div className="tool-grid">{cards}</div>;
}
```

That is legal and occasionally clearer when the loop body is complicated. `map` is the convention, and mixing both in one file for no reason is noise.

Two syntax details that trip everyone up once. When your arrow function body is multi-line JSX, use parentheses for an implicit return — `(tool) => ( ... )` — or braces plus an explicit `return`. Writing `(tool) => { <ToolCard /> }` returns `undefined` and renders nothing at all, silently. And the whole `map` call sits inside JSX braces, so you will have a `{` before it and a `}` after it; a missing one produces a syntax error whose message points at a line several below the actual mistake.

## Keys

Every element produced by a list needs a `key` prop. Leave it out and React logs a warning in the console; get it wrong and you get bugs that look like the framework is broken.

Here is what a key is for. When state changes, React produces a new description of the UI and compares it to the previous one. For a list, it must answer a question that is genuinely ambiguous: the old list had three cards and the new list has three cards — are these *the same three items*, possibly reordered, or are they different items? The DOM nodes it keeps, moves, or destroys depend on the answer, and so does the state inside each of those components.

React cannot work that out from position alone. The key is you telling it: this element corresponds to that data item. A key is an **identity**, not a label.

Which means a key must be:

**Stable.** The same item gets the same key on every render, forever. `key={Math.random()}` gives every item a new identity every render, so React destroys and rebuilds the entire list each time — losing focus, losing scroll, losing every piece of component state, and doing the maximum possible amount of DOM work.

**Unique among siblings.** Two items in the same list may not share a key. Keys in different lists never interfere, so two separate lists can both use `key="1"` without any problem.

**Derived from the data, not from the position.** This is the one that costs people a day.

The best key is almost always an id that came with the data — a database id, a slug, a UUID. If your data has no id, add one when you create the item rather than inventing one at render time:

```jsx
function addTool(name) {
  setTools((previous) => [...previous, { id: crypto.randomUUID(), name }]);
}
```

`crypto.randomUUID()` is built into the browser. Generating the id at creation time makes it part of the item and therefore stable. Generating it during render makes it noise.

## Why the index is a trap

You will see `key={index}` everywhere, including in tutorials, and it appears to work. Here is the case where it does not, in enough detail that you will recognize it in the wild.

```jsx
{tools.map((tool, index) => (
  <ToolCard key={index} name={tool.name} />
))}
```

Suppose `ToolCard` has its own state — a "requested" toggle, or a text input for a note. The list is Drill (index 0), Vacuum (index 1), Ladder (index 2). You mark the Vacuum as requested; that state lives in the card at index 1. Now the Drill is removed from the array. The list becomes Vacuum (index 0), Ladder (index 1).

React compares by key. Key 0 existed before and still exists, so it keeps that component and updates its props from Drill to Vacuum — but it keeps the *state*, which belonged to the Drill's card. Key 1 keeps the Vacuum's "requested" state and now displays the Ladder. Key 2 is gone, so that component is destroyed.

The result on screen: the Ladder appears to be requested, and the Vacuum does not. Nobody typed anything wrong. The data is correct. The state simply stayed with the position instead of following the item, because you told React that position was identity.

The same bug hits uncontrolled DOM state that React does not manage at all: focus, text selection, scroll position inside an item, the open/closed state of a `<details>` element, and the contents of an input you have not turned into a controlled input yet.

Index keys are safe in exactly one situation: the list is static — never reordered, never filtered, never inserted into or deleted from — and its items have no state. A hard-coded footer nav qualifies. Almost nothing else does, and the cost of using a real id everywhere is zero, so just use a real id everywhere.

Two more anti-patterns to name. **Do not use the array's own values as a key unless they are genuinely unique** — two tools named "Hammer" produce duplicate keys and React will warn and mis-match them. And **do not put the key on the wrong element.** The key belongs on the outermost element returned by `map`, the one whose siblings it is being distinguished from — not on some element inside a component you rendered:

```jsx
{/* wrong: the key is inside ToolCard, where its siblings are not the list */}
{tools.map((tool) => <ToolCard tool={tool} />)}

{/* right: the key is on the element map produced */}
{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
```

`key` is also not a normal prop. Your component cannot read `props.key`; React consumes it. If the child needs the id for anything, pass it a second time under another name: `<ToolCard key={tool.id} id={tool.id} />`.

When each item needs to render several elements with no wrapper, use the long form of fragment, which can take a key:

```jsx
import { Fragment } from "react";

{tools.map((tool) => (
  <Fragment key={tool.id}>
    <dt>{tool.name}</dt>
    <dd>{tool.owner}</dd>
  </Fragment>
))}
```

The `<>` shorthand cannot take a key, which is the one time you need the spelled-out form.

## Shaping the list before you render it

Filtering, sorting, and slicing are ordinary array work, and they belong above the `return` where they are readable, not crammed into the JSX:

```jsx
export default function ToolGrid({ tools, searchText, category, sortBy }) {
  const query = searchText.trim().toLowerCase();

  const visible = tools
    .filter((tool) => (category === "all" ? true : tool.category === category))
    .filter((tool) => tool.name.toLowerCase().includes(query))
    .sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : a.addedAt - b.addedAt
    );

  return (
    <div className="tool-grid">
      {visible.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

Three things in that snippet are worth marking.

`filter` and `map` return new arrays, so chaining them never touches `tools`. `sort`, however, **mutates the array it is called on** — and here that array is the fresh one `filter` just produced, so it is safe. Calling `tools.sort(...)` directly on a prop or on state would be a real bug: it would reorder data you do not own, and because the reference did not change, React would not re-render. Sort a copy: `[...tools].sort(...)`.

The list is derived during render, exactly as lesson 04 argued. There is no `visibleTools` state to keep in sync, because there is no way for it to fall out of sync.

And `localeCompare` is the right way to sort strings for a human reader. Plain `<` comparison sorts by character code, which puts every capital letter before every lowercase one and mangles accented characters.

Once a list item's markup grows past a few lines, extract it into its own component. A `map` callback returning thirty lines of JSX is unreadable, and it hides the fact that the item is a thing with a name.

## Conditional rendering

Deciding what to show is the other half of this lesson, and React has no special syntax for it. You return different values from ordinary JavaScript.

**Early return** is the clearest option when a whole component has two shapes:

```jsx
export default function ToolDetail({ tool }) {
  if (!tool) {
    return <p className="empty">Select a tool to see its details.</p>;
  }

  return (
    <article>
      <h2>{tool.name}</h2>
      <p>{tool.description}</p>
    </article>
  );
}
```

**Returning `null`** renders nothing at all:

```jsx
export default function DepositNotice({ tool }) {
  if (!tool.requiresDeposit) return null;
  return <p className="notice">This tool requires a refundable deposit.</p>;
}
```

`null`, `undefined`, `true`, and `false` all render as nothing. That is a deliberate feature, and it makes the next two patterns work.

**The ternary**, for choosing between two pieces of markup inline:

```jsx
<div className="tool-card__status">
  {tool.isAvailable
    ? <span className="badge badge--available">Available</span>
    : <span className="badge badge--out">Out until {tool.dueBack}</span>}
</div>
```

**Logical AND**, for showing something or nothing:

```jsx
{tool.requiresDeposit && <p className="notice">Deposit required.</p>}
```

`&&` returns its right side when the left side is truthy and its left side otherwise. When the left side is `false`, React renders nothing, which is what you want.

Except when the left side is `0`, and this is the classic React bug:

```jsx
{tool.reviewCount && <p>{tool.reviewCount} reviews</p>}
```

With zero reviews, `tool.reviewCount` is `0`, `&&` returns `0`, and React renders numbers — so a bare `0` appears on your page. The same happens with an empty string in some layouts. Always guard with a real boolean:

```jsx
{tool.reviewCount > 0 && <p>{tool.reviewCount} reviews</p>}
```

Make that a reflex: **the left side of `&&` in JSX is always a comparison, never a raw value.**

Nested ternaries are the other thing to avoid. Once you have three or more cases, a ternary chain becomes unreadable, and a lookup object or a small function is much better:

```jsx
const STATUS_LABEL = {
  available: "Available now",
  out: "Currently out",
  maintenance: "Being repaired",
  retired: "No longer shared",
};

function StatusBadge({ status }) {
  const label = STATUS_LABEL[status] ?? "Unknown";
  return <span className={`badge badge--${status}`}>{label}</span>;
}
```

That reads as data, extends with one line, and cannot produce a mismatched branch. Use `??` rather than `||` for the fallback so that a legitimately empty string is not swallowed.

## Hiding versus not rendering

There are two ways to make something invisible, and they are not interchangeable.

```jsx
{isOpen && <FilterPanel />}                                  {/* not rendered */}
<div className={isOpen ? "panel" : "panel is-hidden"}>…</div> {/* rendered, hidden by CSS */}
```

The first removes the component from the tree. React unmounts it, its DOM nodes are destroyed, and — this is the consequence people trip over — **all of its state is discarded**. Close the filter panel and reopen it, and every input inside is back to its initial value.

The second keeps the component mounted and lets CSS hide it. State survives, because nothing was unmounted.

Neither is right in general. Not rendering is the default: it keeps the DOM small, it stops hidden components doing work, and it means nothing invisible is reachable by keyboard or announced by a screen reader — a genuine correctness issue, since `visibility: hidden` and `display: none` do hide content from assistive technology but a merely off-screen element does not. Choose CSS hiding when you specifically want the state kept, or when the thing is expensive to build and toggled often.

The same choice explains a bug you will hit: "my panel keeps forgetting what I typed." Nothing is wrong; you unmounted it. Either keep it mounted, or lift the value into a parent that stays mounted — which is the lesson 04 pattern, applied for a new reason.

## The states a list can be in

A list is not one thing. It has at least four visible states, and forgetting the middle two is one of the most common gaps between a student project and a professional one:

- **Populated** — items exist, render them.
- **Empty** — the collection is legitimately empty. Say so, in words a person can act on.
- **Filtered to nothing** — items exist but none match the current filter. This is *not* the same message as empty, because the fix is different: clear the search, not add a tool.
- **Too many** — enough items that you need paging or a cap. Worth thinking about even if you decide to render them all.

Loading and error states also belong to a list, and they arrive in lesson 07 with real data. Structure your component so they will fit.

```jsx
export default function ToolGrid({ tools, visible, searchText, onClearSearch }) {
  if (tools.length === 0) {
    return (
      <div className="empty-state">
        <p>No tools have been shared yet.</p>
        <p>Be the first — add a tool from your account page.</p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="empty-state">
        <p>No tools match "{searchText}".</p>
        <button type="button" onClick={onClearSearch}>Clear search</button>
      </div>
    );
  }

  return (
    <div className="tool-grid">
      {visible.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
```

An empty state should say what happened and what to do next. "No results" is a dead end; "No tools match 'ladder' — clear the search" is a path forward. This costs ten minutes and is the difference between an interface that feels finished and one that feels abandoned.

## Grouping data before you render it

Flat lists are the easy case. Real screens group: tools by category, reservations by month, messages by day. The instinct is to reach for nested loops inside JSX, and the result is unreadable. Do the grouping as data, above the `return`, and render the result.

```jsx
function groupByCategory(tools) {
  const groups = new Map();
  for (const tool of tools) {
    if (!groups.has(tool.category)) groups.set(tool.category, []);
    groups.get(tool.category).push(tool);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}
```

```jsx
export default function GroupedToolList({ tools }) {
  const groups = groupByCategory(tools);

  return (
    <div>
      {groups.map((group) => (
        <section key={group.category}>
          <h3>{group.category} ({group.items.length})</h3>
          <ul>
            {group.items.map((tool) => (
              <li key={tool.id}>{tool.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

Returning an *array* of `{ category, items }` rather than a plain object is deliberate. Objects have no guaranteed iteration order for numeric-looking keys, and an array lets you sort the groups themselves — alphabetically, or by size, or in a fixed order you define. It also gives each group an obvious stable key.

The grouping function is a plain function of its input with no React in it, which means you can read it, reason about it, and move it to a `src/lib/` file the moment a second component needs it. Keeping data transformation outside components is a habit worth building early; a component that both computes and renders is twice as hard to change as two things that each do one job.

## How long is too long

At some point a list is big enough to be slow, and it is useful to know roughly where that point is so you neither optimize prematurely nor ship something unusable.

Rendering a few hundred simple items is not a problem. React creates the elements, the browser lays them out, and nobody notices. Somewhere in the low thousands — earlier if each item is a complex component with images — you start to see a delay on the first render and a stutter when the list re-renders.

Three responses, in the order you should consider them.

**Render less.** Paging, a "show more" button, or a filter that requires at least two characters before it matches anything. This is nearly always the right answer, because a person cannot use two thousand rows anyway, and it costs you an afternoon rather than a dependency.

**Do less work per item.** An item that formats a date, computes a total, and builds three class strings on every render multiplies by the item count. Precompute once in the grouping or filtering step above.

**Virtualize.** Render only the rows that are on screen and swap them as the user scrolls, using a library built for it. This genuinely works and it costs you: keyboard navigation, find-on-page, and screen-reader behavior all become your problem. Reach for it when the first two are not enough and not before, and treat it as a decision to discuss rather than one to make quietly.

What you should not do is guess. Open the performance panel, record an interaction, and look at where the time actually goes. Lists are a place where intuition is unusually bad — the cost is frequently in something other than the number of rows, such as an image with no dimensions forcing repeated layout.

## Two more things keys can do

**Keys can force a reset.** Because a key is identity, changing a component's key tells React "this is a different thing now" — the old one is discarded, state and all, and a fresh one is created. That is occasionally exactly what you want:

```jsx
<ToolDetail key={selectedToolId} tool={selectedTool} />
```

Select a different tool and any state inside `ToolDetail` — a scroll position, a note in progress — starts fresh rather than lingering from the previous tool. This is a sharp tool. Used deliberately it is elegant; used by accident it is the "my state keeps resetting" bug from lesson 04.

**Nested lists need keys at every level.** Each `map` is its own sibling group with its own key requirement:

```jsx
{categories.map((category) => (
  <section key={category.id}>
    <h3>{category.name}</h3>
    <ul>
      {category.tools.map((tool) => (
        <li key={tool.id}>{tool.name}</li>
      ))}
    </ul>
  </section>
))}
```

The inner keys only need to be unique within their own `<ul>`, not across the whole page.

## Debugging lists

**Nothing renders and there is no error.** Your `map` callback has braces and no `return`, or you used `forEach`.

**The console warns about a missing key.** Read the component name in the warning; the key belongs on the element that `map` returns.

**"Objects are not valid as a React child."** You interpolated an object instead of a string — `{tool}` instead of `{tool.name}`. React can render strings, numbers, elements, and arrays of those; a plain object is not renderable.

**A stray `0` appears on the page.** The `&&` bug. Add a comparison.

**Items behave as if they swapped identities after a delete or reorder.** Index keys. Switch to a stable id and the bug disappears entirely.

**Everything flashes and inputs lose focus on every keystroke.** Keys that change every render — a random value, a timestamp, or an index that shifts.

## Practice

Continue in the `toolshare` project. Replace the hand-written cards from the previous lessons with data-driven rendering.

1. **Create the data.** Add `src/data/tools.js` exporting an array of at least ten tool objects, each with a unique string `id`, plus `name`, `description`, `owner`, `category` (one of at least three values), `status`, and a numeric `reviewCount` where at least one tool has `0`.

2. **Render the list.** Rewrite `ToolGrid` to take a `tools` array prop and render one `ToolCard` per item with `map` and a stable `key`. Delete the hand-written cards.

3. **Cause the key warning.** Remove the `key` temporarily, read the exact console warning, then put it back and write the warning text into `STRUCTURE.md`.

4. **Reproduce the index-key bug.** Switch the key to the array index. Give `ToolCard` an `isRequested` boolean state with a toggle button. Mark the second card as requested, then remove the first tool from the array with a "Remove" button. Record which card shows as requested afterwards. Switch back to `key={tool.id}`, repeat the exact sequence, and record the result. Write a short paragraph in `STRUCTURE.md` explaining what React did differently.

5. **Filter and sort.** Add controls for a search string, a category, and a sort order (name or newest), hold all three in `BrowsePage` state, and derive the visible array during render. Sort without mutating the source array, and prove it by logging the original array's first item before and after.

6. **Handle all four list states.** Implement the populated, empty, and filtered-to-nothing states with distinct messages, and make the filtered-to-nothing state include a working "Clear search" button. Test the empty state by starting from an empty array.

7. **Conditional badges.** Render an availability badge with a ternary that produces different markup and a different class for available and out. Then render a deposit notice with `&&`.

8. **Trigger the zero bug.** Render `{tool.reviewCount && <p>{tool.reviewCount} reviews</p>}` and find the card that shows a bare `0`. Fix it with a comparison and note the fix in `STRUCTURE.md`.

9. **Replace a ternary chain.** Write a status badge that handles four statuses using nested ternaries, then rewrite it with a lookup object and a fallback using `??`. Keep the second version.

10. **Nest a list.** Add a view that groups tools by category — an outer `map` over categories with an inner `map` over that category's tools — with correct keys at both levels.

11. **Use a key to reset.** Add a `ToolDetail` component with a local `note` state and render it with `key={selectedToolId}`. Type a note, select a different tool, and confirm the note clears. Remove the key, repeat, and confirm the note persists. Write one sentence on when each behavior is the one you want.

12. **Extract the item.** If your `map` callback is longer than about five lines, move its body into a component and confirm the key stayed on the element `map` returns.

**Deliverable:** a `toolshare` project rendering ten or more tools from data with working search, category filter and sort, all three list states, correct keys throughout, and a `STRUCTURE.md` containing your recorded results for steps 3, 4, 8, and 11.
