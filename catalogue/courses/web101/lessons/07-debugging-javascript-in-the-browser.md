---
lesson_id: web101-07
course_id: web101
pathway: quality-assurance-software-engineer
title: Debugging JavaScript in the Browser
order: 7
kind: lesson
competency_ids:
  - D2-S1-C01
  - D3-S1-C02
objectives:
  - Debug a broken page in the browser and describe the defect precisely
---

## From "it's broken" to a located, reproducible defect

Everything in this course so far has been building toward this lesson. You can now read variables, functions, and control flow; you can select and change DOM nodes; you can trace how events travel through a page; and you understand why asynchronous code produces timing-dependent bugs. Debugging is where all of that becomes a practical skill: turning a vague complaint like "the save button doesn't work" into a specific, reproducible, located claim like "clicking Save with an empty title throws a `TypeError` in `validateForm` at line 14, because `title` is `null` instead of an empty string." That second sentence is a defect a developer can act on immediately. The first sentence is not. The gap between them is what this lesson closes, and closing it is a direct, named competency for a QA engineer: initial debugging by reviewing code, logs, or configuration to locate a breakdown's source, and reporting it clearly through a bug-tracking system.

## Reading a stack trace

When JavaScript throws an uncaught error, the console shows a stack trace — a record of which function called which function, down to the one that actually failed.

```
Uncaught TypeError: Cannot read properties of null (reading 'value')
    at validateForm (app.js:14:23)
    at HTMLFormElement.<anonymous> (app.js:32:5)
```

Read a stack trace from the top down. The first line names the error and, often, exactly what went wrong (`Cannot read properties of null (reading 'value')` means code tried to access `.value` on something that was `null`). The lines below it, `at functionName (file:line:column)`, are the call chain: `validateForm` is where it actually failed, called from an anonymous handler at line 32, which was itself the form's submit listener. `app.js:14:23` is not decoration — it's a direct pointer to the exact line and character where you should look first. Every stack trace you've triggered accidentally in the past six lessons was this same information; you now have the vocabulary to use it deliberately.

## Console methods beyond `console.log`

```js
console.log("basic message", someValue);
console.warn("something's off, but not fatal");
console.error("this is a real failure");
console.table(arrayOfObjects);   // renders an array of objects as a table
console.group("Validation");     // groups subsequent logs, collapsible
console.log("checking email");
console.groupEnd();
```

`console.table` is worth learning specifically for this pathway: when you're inspecting an array of records (users, form errors, API results), a table is dramatically faster to scan than a wall of nested object logs. `console.warn`/`console.error` also color-code in the console and are filterable, which matters once a page is logging many things at once and you need to isolate just the errors.

## Breakpoints: pausing execution instead of guessing

`console.log` requires you to predict, in advance, what you want to inspect. A breakpoint pauses execution entirely at a specific line, and lets you inspect *everything* in scope at that exact moment — no prediction required.

In your browser's DevTools, open the **Sources** panel, find the JavaScript file, and click the line number where you want to pause. When execution reaches that line, the browser freezes there and DevTools shows:

- every local variable's current value, live, in the Scope panel
- the full call stack, exactly like the one from an uncaught error, but for code that's still running
- controls to **step over** (run this line, don't enter function calls it makes), **step into** (follow execution into a called function), and **step out** (finish the current function and pause at the point it returns to)
- **Resume** to let the page run normally until the next breakpoint

You can also set a breakpoint directly from code with the `debugger` statement, which pauses exactly as if you'd clicked a line number in DevTools — useful when you want a breakpoint to travel with a file you're sharing, or to pause inside code you can't easily find in the Sources tree:

```js
function validateForm(title) {
  debugger;
  return title.trim().length > 0;
}
```

**Conditional breakpoints** — right-click a line number and choose "Add conditional breakpoint" — pause only when an expression you supply is true. This is essential for bugs that depend on a specific value, like a loop that only fails on its 47th iteration: an unconditional breakpoint there would require you to click Resume forty-six times first.

## A worked debugging walkthrough

Suppose a bug report says: "The delete button in the todo list sometimes removes the wrong item." Here is the process, not just the tools:

1. **Reproduce it first.** Before touching any code, get the failure to happen in front of you, reliably if possible. If you can't reproduce it, you don't yet have a defect you can locate — you have a report you need more information about.
2. **Narrow the trigger.** Does it happen on every row, or only after adding a row dynamically? Only after deleting one row and then another? This narrowing is itself debugging — you're forming and testing a hypothesis about the cause before you've opened the debugger at all.
3. **Set a breakpoint where the failure becomes visible** — inside the delete handler, on the line that identifies which row to remove.
4. **Inspect the actual values**, not the ones you assumed were there. If the handler uses event delegation (Lesson 04) and reads `event.target.closest("li")`, check in the Scope panel whether `event.target` really is the button you clicked, or something else — a common cause of "wrong item deleted" bugs is a delegated handler matching the wrong ancestor because of overlapping selectors or stale indices captured in a closure.
5. **Confirm the fix, don't just believe it.** Once you've changed something, re-run the exact reproduction steps from step 1 and confirm the specific failure no longer happens — not just that the page "looks fine."

## Filing what you found

A defect a developer can act on immediately has a predictable shape. At minimum:

- **Steps to reproduce** — specific and numbered, starting from a known page state (e.g., "1. Load the todo list with 3 items. 2. Click the third item's Delete button.")
- **Expected result** — what should have happened
- **Actual result** — what actually happened, stated as plainly as the stack trace or observed behavior allows
- **Location, if you found one** — file and line from the stack trace, or the function name and the specific value that was wrong (`event.target` resolved to the wrong `<li>` because two rows shared a class name)
- **Severity/category** — is this a crash, a silent failure, a cosmetic issue, an accessibility gap? Categorizing accurately is part of what makes a bug-tracking system usable at scale; a tracker full of everything marked "critical" is as useless as one with no severity at all

Compare "delete button is broken" against: "Steps: load list with 3 items, delete item 2, then delete the new item 2 (originally item 3). Expected: item 3 (now item 2) is removed. Actual: item 1 is removed instead. Location: the delegated click handler in `app.js` computes the row index from a value captured when the list first loaded, instead of re-reading `event.target.closest('li')` at click time." The second version is filed once and never needs a clarifying question. That is the standard this lesson is training you toward.

## Practice

You are given (write it yourself, deliberately, to have something real to debug) a small todo list page where deleting an item sometimes removes the wrong row: build the list from Lesson 04's delegation pattern, but introduce the bug on purpose by having the delete handler capture the row's index in a variable *when the list is built*, rather than reading `event.target.closest("li")` at click time.

1. Reproduce the bug: add a fourth item after the page loads, delete an item near the middle, and observe that the wrong row disappears. Write down your exact repro steps.
2. Set a breakpoint inside the delete handler and step through it once. Inspect `event.target` in the Scope panel and confirm, with real values, why the wrong row was targeted.
3. Fix the handler to read `event.target.closest("li")` at click time instead of using the captured index, and re-run your exact repro steps from step 1 to confirm the fix holds.
4. Write a complete defect report for the *original* bug (before your fix) using the five-part shape above — steps to reproduce, expected, actual, location, severity — as if you were filing it for someone else to fix, even though you already know the answer.
