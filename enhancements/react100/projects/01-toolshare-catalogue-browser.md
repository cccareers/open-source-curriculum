---
course_id: react100
project_id: react100-x01
title: "Toolshare Catalogue Browser"
kind: supplementary-project
status: draft
hours_estimate: 8
difficulty: core
related_lessons:
  - react100-02
  - react100-03
  - react100-04
  - react100-05
objectives:
  - Break an interface into a tree of reusable components
  - Pass data through a component tree with props and composition
  - Manage component state and respond to user events
  - Render lists and conditional interfaces correctly
competency_ids:
  - D5-S1-C02
  - D2-S1-C04
---

## Scenario

The Toolshare volunteer coordinator, Dana, has been keeping the tool catalogue in a spreadsheet and emailing it to members every Friday. Members reply asking "is the ladder free?", and Dana answers by hand. The board has asked for a browse screen members can search themselves. There is no server yet, so it has to run from a data file Dana can edit. Dana has also asked for a "wanted" list so the board can see which tools members are waiting for, and a running count of it in the header.

You are building that browse screen in a fresh Vite project. It covers lessons 02 through 05 in one piece of work, with no lesson telling you which technique applies where.

## What you will build / produce

A single-page React app that:

- renders the Toolshare catalogue from `src/data/tools.js`, one card per tool, as a labelled list;
- filters by search text (case-insensitive, on the tool name) and by one category at a time;
- sorts by name or by newest;
- shows a live match count;
- shows distinct empty and filtered-to-nothing states, with a working "Clear search" button in the second;
- lets a member mark tools as wanted, with the total shown in the site header;
- lets each card expand a "Details" section, where the open/closed state belongs to the card;
- passes the supplied acceptance tests.

You will also hand in a `STRUCTURE.md` with your component tree and decisions.

## Before you start (prerequisites, starter files or data)

- Lessons 02 to 05 completed.
- Node.js 20 or later.
- Scaffold the app and install the test tools:

```bash
npm create vite@latest toolshare-browser -- --template react
cd toolshare-browser
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- Add a test script to `package.json`: `"test": "vitest"`.
- Add the `test` block to `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- The data shape. `src/data/tools.js` exports `TOOLS`, an array of at least ten objects shaped like this:

```js
export const TOOLS = [
  {
    id: "t-1",
    name: "Cordless Drill",
    description: "18V, two batteries, charger included.",
    owner: "Dana",
    category: "power",            // one of: power, garden, ladders, cleaning
    status: "Available",
    reviewCount: 4,
    addedAt: Date.parse("2026-06-12"),
  },
  // ...at least nine more, with at least one reviewCount of 0
];
```

### The interface contract

The tests depend on these names and roles. Everything else is your design.

| Element | Requirement |
|---|---|
| `src/App.jsx` | Default export `App`, accepting an optional `tools` prop that defaults to `TOOLS`. |
| Header count | Text `Wanted: N` somewhere in the site header. |
| Search | An `<input type="search">` with a visible `<label>` reading `Search tools`. |
| Categories | Buttons labelled `All`, `Power tools`, `Garden`, `Ladders`, `Cleaning`. The selected one has `aria-pressed="true"`, the others `"false"`. `All` is selected first. |
| Sort | A `<select>` labelled `Sort by` with options `name` ("Name") and `newest` ("Newest"). Default is `name`. |
| Match count | An always-rendered element with `role="status"` reading `1 tool matches` or `N tools match`. |
| Tool list | A `<ul aria-label="Tools">` with one `<li>` per visible tool. Each card has the tool name as an `<h3>`. |
| Wanted toggle | A button in each card reading `Add to wanted`, or `Remove from wanted` once the tool is wanted. |
| Details | A button in each card reading `Details`, with `aria-expanded`. When expanded, the card shows `Shared by <owner>`. |
| Reviews | `N reviews` shown only when `reviewCount > 0`. |
| Empty | With no tools at all: `No tools have been shared yet.` |
| Filtered to nothing | `No tools match "<search text>".` plus a `Clear search` button that empties the search. |

## Milestones

1. **Tree on paper (1 hour).** Box, name, and arrange the screen using lesson 02's four steps. Write the tree and a one-sentence responsibility per component into `STRUCTURE.md`. Mark where each piece of state will live *before* you write any state.
2. **Static skeleton (1 hour).** One file per component, hard-coded markup, `App.jsx` reads as a table of contents.
3. **Props and data (1.5 hours).** Drive the cards from `TOOLS` with `map` and `key={tool.id}`. Use `children` for at least one frame component (for example a `Panel` around the filters).
4. **Search, category, sort (2 hours).** All three values live in one parent; the visible list is derived during render; sorting never mutates the source array.
5. **Wanted list (1 hour).** Lift the wanted ids to the closest common ancestor of the header and the cards. Use the updater form.
6. **States and polish (1 hour).** Empty, filtered-to-nothing, the zero-reviews guard, the details disclosure.
7. **Tests green (30 min).** Run the acceptance tests, fix, and record anything you learned in `STRUCTURE.md`.

## Acceptance criteria

- [ ] At least eight components, one per file, named in PascalCase for what they are.
- [ ] `App.jsx` reads as a table of contents.
- [ ] Every list uses a stable key from the data; no index keys.
- [ ] Search, category, and sort state live in one parent; the filtered list is not stored in state.
- [ ] No props or state are mutated anywhere, including by `sort`.
- [ ] The wanted ids are stored once, as an array of ids, in the closest common ancestor of the header and the cards.
- [ ] The details open/closed state lives inside each card and follows its tool when the list is filtered or sorted.
- [ ] Every interactive control is a real `<button>`, `<input>`, or `<select>` with an accessible name.
- [ ] All tests in `src/App.test.jsx` pass.
- [ ] `STRUCTURE.md` contains the tree, the responsibilities, and the answers to the reflection prompts.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `src/App.test.jsx`, then run:

```bash
npx vitest run
```

```jsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

function deepFreeze(value) {
  Object.values(value).forEach((v) => {
    if (v && typeof v === "object") deepFreeze(v);
  });
  return Object.freeze(value);
}

// Frozen so that any mutation (push, sort, assignment) throws in the test.
const FIXTURE = deepFreeze([
  { id: "t-1", name: "Cordless Drill", description: "18V, two batteries.", owner: "Dana",
    category: "power", status: "Available", reviewCount: 4, addedAt: Date.parse("2026-06-12") },
  { id: "t-2", name: "Wet/Dry Vacuum", description: "Six gallon, with hose.", owner: "Marcus",
    category: "cleaning", status: "Out until Friday", reviewCount: 0, addedAt: Date.parse("2026-05-01") },
  { id: "t-3", name: "Extension Ladder", description: "Twenty-four foot, aluminum.", owner: "Priya",
    category: "ladders", status: "Available", reviewCount: 7, addedAt: Date.parse("2026-04-20") },
  { id: "t-4", name: "Hedge Trimmer", description: "Electric, with guard.", owner: "Dana",
    category: "garden", status: "Available", reviewCount: 2, addedAt: Date.parse("2026-07-30") },
]);

function toolList() {
  return screen.getByRole("list", { name: "Tools" });
}

function toolNames() {
  return within(toolList())
    .getAllByRole("heading", { level: 3 })
    .map((h) => h.textContent);
}

function cardFor(name) {
  return screen.getByRole("heading", { level: 3, name }).closest("li");
}

describe("Toolshare catalogue browser", () => {
  it("renders one list item per tool, sorted by name by default", () => {
    render(<App tools={FIXTURE} />);
    expect(within(toolList()).getAllByRole("listitem")).toHaveLength(4);
    expect(toolNames()).toEqual([
      "Cordless Drill",
      "Extension Ladder",
      "Hedge Trimmer",
      "Wet/Dry Vacuum",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("4 tools match");
  });

  it("filters by search text, case-insensitively, and updates the count", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    await user.type(screen.getByRole("searchbox", { name: "Search tools" }), "LADDER");
    expect(toolNames()).toEqual(["Extension Ladder"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 tool matches");
  });

  it("filters by one category at a time and reflects it with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    const garden = screen.getByRole("button", { name: "Garden" });
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    await user.click(garden);
    expect(garden).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(toolNames()).toEqual(["Hedge Trimmer"]);
  });

  it("sorts newest first without mutating the tools prop", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    // FIXTURE is frozen: calling .sort() on it directly would throw here.
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "newest");
    expect(toolNames()).toEqual([
      "Hedge Trimmer",
      "Cordless Drill",
      "Wet/Dry Vacuum",
      "Extension Ladder",
    ]);
  });

  it("shows a filtered-to-nothing state with a working Clear search button", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    const search = screen.getByRole("searchbox", { name: "Search tools" });
    await user.type(search, "chainsaw");
    expect(screen.getByText('No tools match "chainsaw".')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search).toHaveValue("");
    expect(within(toolList()).getAllByRole("listitem")).toHaveLength(4);
  });

  it("shows a distinct empty state when there are no tools", () => {
    render(<App tools={[]} />);
    expect(screen.getByText("No tools have been shared yet.")).toBeInTheDocument();
    expect(screen.queryByText(/No tools match/)).not.toBeInTheDocument();
  });

  it("counts wanted tools in the header, with state lifted above the cards", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    expect(screen.getByText("Wanted: 0")).toBeInTheDocument();
    await user.click(within(cardFor("Extension Ladder")).getByRole("button", { name: "Add to wanted" }));
    await user.click(within(cardFor("Cordless Drill")).getByRole("button", { name: "Add to wanted" }));
    expect(screen.getByText("Wanted: 2")).toBeInTheDocument();
    await user.click(within(cardFor("Cordless Drill")).getByRole("button", { name: "Remove from wanted" }));
    expect(screen.getByText("Wanted: 1")).toBeInTheDocument();
  });

  it("keeps the wanted state when the tool is filtered out and back in", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    await user.click(within(cardFor("Hedge Trimmer")).getByRole("button", { name: "Add to wanted" }));
    await user.click(screen.getByRole("button", { name: "Ladders" }));
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(
      within(cardFor("Hedge Trimmer")).getByRole("button", { name: "Remove from wanted" })
    ).toBeInTheDocument();
  });

  it("keeps each card's details state with its tool when the list changes (stable keys)", async () => {
    const user = userEvent.setup();
    render(<App tools={FIXTURE} />);
    const ladderDetails = within(cardFor("Extension Ladder")).getByRole("button", { name: "Details" });
    await user.click(ladderDetails);
    expect(within(cardFor("Extension Ladder")).getByText("Shared by Priya")).toBeInTheDocument();

    // Re-sort so the Ladder moves from position 1 to position 3. With index
    // keys, the open state would stay behind at position 1 (now the Drill).
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "newest");

    const ladderCard = cardFor("Extension Ladder");
    expect(within(ladderCard).getByRole("button", { name: "Details" })).toHaveAttribute("aria-expanded", "true");
    expect(within(ladderCard).getByText("Shared by Priya")).toBeInTheDocument();
    expect(within(cardFor("Cordless Drill")).getByRole("button", { name: "Details" })).toHaveAttribute("aria-expanded", "false");
  });

  it("never renders a bare 0 for a tool with no reviews", () => {
    render(<App tools={FIXTURE} />);
    const vacuum = cardFor("Wet/Dry Vacuum");
    expect(within(vacuum).queryByText(/reviews/)).not.toBeInTheDocument();
    expect(vacuum.textContent).not.toMatch(/\b0\b/);
    expect(within(cardFor("Extension Ladder")).getByText("7 reviews")).toBeInTheDocument();
  });
});
```

What the tests cannot check, so you check by hand and note in `STRUCTURE.md`:

- [ ] the component tree matches what you drew, confirmed in React devtools;
- [ ] no component's returned markup is longer than about one screen;
- [ ] the whole screen works with Tab, Enter, and Space alone.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Component structure | One or two large components; names describe position or styling | 8+ single-responsibility components; `App` reads as a table of contents | Also justifies one split and one non-split in `STRUCTURE.md` using the lesson's signals by name |
| Props and composition | Data passed inconsistently; props mutated or rebuilt | Data flows down; at least one component uses `children` | Prop interfaces documented in comments; a deliberate choice between object and separate props, explained |
| State and events | Derived values stored in state; mutation; wrong owner | All state in the closest common ancestor; updater form; no mutation | Can explain, unprompted, why each piece of state lives where it does |
| Lists and conditionals | Index keys, or missing empty/filtered states | Stable keys, all list states, `&&` guarded by comparisons | Uses a lookup object for status labels; extracts the list item into its own component |
| Verification | Tests not run, or failing | All acceptance tests pass | Adds at least one test of their own for an edge case the suite misses |

## Stretch goals

- Add a `StatusBadge` using a lookup object for four statuses (`available`, `out`, `maintenance`, `retired`) with a `??` fallback.
- Add a "Group by category" view that renders sections with a heading and count, keyed correctly at both levels.
- Keep the wanted ids when the page reloads by reading `localStorage` in a lazy `useState` initializer. (Writing it back needs an effect, which lesson 07 covers; leave a note if you have not reached it.)

## Reflection prompts

1. Which piece of state did you first put in the wrong place, and what told you it was wrong?
2. The details toggle is local to each card, but the wanted toggle is lifted to the top. What is the rule that decides each?
3. What did the frozen fixture catch, if anything, and what would that bug have looked like in the browser?
4. If Dana asks next month for a "most wanted" sort, which components change?

## Instructor notes (common pitfalls, how to adapt for time)

- **Suite verified.** On 2026-10-02 this suite was run against a reference implementation using React 19.3, Vitest 5.0.3, and jsdom, and every test passed. It also fails if the list uses index keys or sorts the `tools` prop in place. Pin versions in the starter if you need reproducible results.
- **Testing is not a react100 outcome.** `course.json` lists testing libraries as out of scope. The suite here is supplied as an acceptance check the learner runs, not something they are assessed on writing. Learners should not edit the test file, except to add their own tests for the "Exceeds" level.
- **Most common failure:** the details test. Learners who use `key={index}`, or who lift the details state into the parent "to be safe", fail it. Both are worth a conversation: the first is the lesson 05 bug, and the second puts state higher than it needs to be.
- **`tools.sort(...)` on the prop** throws `TypeError: Cannot assign to read only property` against the frozen fixture. That is the point; walk them to `[...tools].sort(...)`.
- **Count text.** Some learners render the count conditionally. The contract says always rendered, which is also what lesson 08 asks for in a live region.
- **Short on time (4-5 hours):** supply the static skeleton from milestone 2, drop sorting, and remove the sort test.
- **Extended (12 hours):** add the stretch goals and require a written review of a peer's `STRUCTURE.md`.
