---
course_id: web101
project_id: web101-x02
title: "Filtered Task List: Testable Logic and a Verification Log"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - web101-03
  - web101-04
  - web101-06
  - web101-08
objectives:
  - Select and modify DOM nodes with the standard browser APIs
  - Handle user events while keeping interactive behaviour reachable from the keyboard
  - Fetch data asynchronously and handle the failure cases
  - Check your own interactive page against its expected behaviour and record what fails
competency_ids:
  - D5-S1-C02
  - D5-S1-C01
  - D2-S1-C02
  - D3-S1-C02
---

## Scenario

Lesson 08's filtered task list is the page your team demos next week. Last time, "Delete removes the wrong task" and "switching filters duplicates tasks" were found by hand, late. This time your lead wants the list logic split into pure functions with an automated suite, the DOM layer kept thin, and a verification log against the lesson 08 specification that names every failure precisely.

## What you will build / produce

- `tasks.js`: pure functions with no DOM access:
  - `addTask(tasks, title, nextId)` returns `{ tasks, error }`. It trims the title and collapses inner whitespace. An empty or whitespace-only title (including `undefined`/`null`) returns the *same* array plus the error `"Enter a task before adding it."`.
  - `toggleComplete(tasks, id)`, `deleteTask(tasks, id)`: return new arrays and change only the task with that id.
  - `filterTasks(tasks, filter)` for `"all" | "active" | "completed"`. It keeps the original order and throws `Unknown filter: <name>` for anything else.
  - `seedFromApi(todos)`: maps jsonplaceholder todos to `{ id, title, completed }`.
- `index.html` + `app.js`: the lesson 08 page, rendering from a single `tasks` array through these functions. It uses delegated events, real `<button>`s, and a visible error state for the seed fetch.
- `verification-log.md`: one row per lesson 08 spec line (columns: spec line, how tested, result, evidence, defect id), plus at least two five-part defect reports.

## Before you start (prerequisites, starter files or data)

- Lessons 03 to 08; Node 18+.
- To use one file in both Node and the browser, end `tasks.js` with:

```javascript
if (typeof module !== "undefined") module.exports = { addTask, toggleComplete, deleteTask, filterTasks, seedFromApi };
if (typeof window !== "undefined") Object.assign(window, { addTask, toggleComplete, deleteTask, filterTasks, seedFromApi });
```

## Milestones

1. Write the lesson 08 specification (seven lines plus your own) before any code.
2. Implement `tasks.js` until the acceptance tests pass.
3. Build the page. Every handler does three things: call a pure function, replace `tasks`, and re-render. Delete reads the id from `event.target.closest("li").dataset.id` at click time, never from a captured index.
4. Seed fetch: check `response.ok`, then render or show a visible error. Test it with a broken URL and with the request blocked in DevTools.
5. Verify line by line, including the edge cases: keyboard-only, rapid double-click on Delete, and switching filters while the seed fetch is in flight (throttle the network in DevTools). Log every result.

## Acceptance criteria

- [ ] `node --test tasks.test.js` passes.
- [ ] `tasks.js` contains no `document` or `window` reads except the final export line.
- [ ] Every control is a native `<button>` or form control and works with Tab, Enter and Space.
- [ ] A failed seed fetch shows a visible message, not a blank list.
- [ ] The verification log covers every spec line, with evidence for each fail.
- [ ] At least two defect reports have steps, expected, actual, location (function and value) and severity.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `tasks.test.js` and run `node --test tasks.test.js`. Verified in this pass: 8/8 pass against a reference implementation.

```javascript
// Run with: node --test tasks.test.js   (Node 18 or newer)
const test = require("node:test");
const assert = require("node:assert/strict");
const { addTask, toggleComplete, deleteTask, filterTasks, seedFromApi } = require("./tasks.js");

const start = [
  { id: 1, title: "Write test cases", completed: false },
  { id: 2, title: "Verify DOM changes", completed: true },
  { id: 3, title: "File defect report", completed: false },
];

test("addTask appends a trimmed task and does not mutate the input", () => {
  const copy = structuredClone(start);
  const { tasks, error } = addTask(start, "  Check   keyboard path ", 4);
  assert.equal(error, null);
  assert.deepEqual(tasks.at(-1), { id: 4, title: "Check keyboard path", completed: false });
  assert.equal(tasks.length, 4);
  assert.deepEqual(start, copy);
});

test("addTask rejects empty and whitespace-only titles with a message", () => {
  for (const title of ["", "   ", "\t\n", undefined, null]) {
    const { tasks, error } = addTask(start, title, 4);
    assert.equal(tasks, start, "the same array comes back unchanged");
    assert.equal(error, "Enter a task before adding it.");
  }
});

test("toggleComplete flips exactly one task, by id, both ways", () => {
  const once = toggleComplete(start, 3);
  assert.deepEqual(once.map((t) => t.completed), [false, true, true]);
  const twice = toggleComplete(once, 3);
  assert.deepEqual(twice, start);
  assert.notEqual(once, start, "returns a new array");
});

test("deleteTask removes exactly the task with that id, even after earlier deletes", () => {
  const afterFirst = deleteTask(start, 2);
  const afterSecond = deleteTask(afterFirst, 3);
  assert.deepEqual(afterSecond.map((t) => t.id), [1]);
  assert.deepEqual(deleteTask(start, 99), start, "unknown id changes nothing");
});

test("filterTasks returns the right subset and keeps original order", () => {
  assert.deepEqual(filterTasks(start, "all").map((t) => t.id), [1, 2, 3]);
  assert.deepEqual(filterTasks(start, "active").map((t) => t.id), [1, 3]);
  assert.deepEqual(filterTasks(start, "completed").map((t) => t.id), [2]);
  assert.deepEqual(filterTasks([], "active"), []);
});

test("switching filters never loses or duplicates tasks", () => {
  const active = filterTasks(start, "active");
  const completed = filterTasks(start, "completed");
  assert.equal(active.length + completed.length, start.length);
  assert.deepEqual([...active, ...completed].map((t) => t.id).sort(), [1, 2, 3]);
});

test("filterTasks throws on an unknown filter instead of showing nothing", () => {
  assert.throws(() => filterTasks(start, "Done"), /Unknown filter: Done/);
});

test("seedFromApi maps the jsonplaceholder shape and ignores extra fields", () => {
  const apiTodos = [
    { userId: 1, id: 1, title: "delectus aut autem", completed: false },
    { userId: 1, id: 4, title: "et porro tempora ", completed: true },
  ];
  assert.deepEqual(seedFromApi(apiTodos), [
    { id: 1, title: "delectus aut autem", completed: false },
    { id: 4, title: "et porro tempora", completed: true },
  ]);
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Logic/DOM separation | Logic mixed into handlers | Pure module plus thin render layer | Adds a test for a bug found during verification before fixing it |
| Events and keyboard | Mouse-only or per-row listeners | Delegated listener; all controls keyboard-operable | Focus is managed sensibly after a delete |
| Async failure handling | Blank list on failure | Visible error for 404 and blocked network | Retry button, plus a test of `seedFromApi` edge cases |
| Verification log | Only "pass/fail" | Evidence per line; two located defects | Finds a timing defect (filter during fetch) and explains its cause |

## Stretch goals

- Persist tasks to `localStorage` and add a test for a pure `serialize`/`deserialize` pair.
- Add the Playwright check `getByRole("button", { name: "Delete Verify DOM changes" })`. This requires accessible names on the per-row buttons, for example `aria-label`. Not verified in this pass.

## Reflection prompts

- Which defects did the unit tests catch, and which only appeared in the browser? Why?
- Was any "failure" in your log really a gap in your specification?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: mutating `tasks` inside `toggleComplete`; rendering from the filtered array and then deleting by its index; ids from `dataset` are strings, so compare with `Number(...)`. The suite uses numbers, and `dataset.id` is a frequent real defect learners should find and log.
- If jsonplaceholder is unavailable, serve a local `todos.json` with `npx serve` or any static server.
- Short on time: skip the in-flight-fetch edge case.
