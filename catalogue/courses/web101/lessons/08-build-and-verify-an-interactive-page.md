---
lesson_id: web101-08
course_id: web101
pathway: quality-assurance-software-engineer
title: Build and Verify an Interactive Page
order: 8
kind: lesson
competency_ids:
  - D2-S1-C02
  - D3-S1-C02
  - D5-S1-C02
objectives:
  - Check your own interactive page against its expected behaviour and record what fails
---

## The point of this lesson is not the page

Every lesson before this one taught you one piece of the browser runtime: language basics, the DOM, events, forms, async, and the debugger. This lesson asks you to combine all of them into one small interactive page — but the deliverable that actually matters is not the page. It's the verification record you produce afterward: a written comparison of what the page was supposed to do against what it actually does, with every gap between the two stated precisely enough that someone who never saw you build it could act on your notes. A developer demos a finished feature. A QA engineer verifies one and writes down what failed. This lesson is deliberately the second thing, not the first.

## What you're building: a filtered task list

Build a single page with:

- a text input for adding a new task, plus an "Add" button
- a rendered list of tasks, each with a "Complete" toggle and a "Delete" button
- a set of filter controls — "All," "Active," "Completed" — that show only the matching tasks
- a fetch call on page load to `https://jsonplaceholder.typicode.com/todos?_limit=5` that seeds the list with five starter tasks, with a visible error state if the request fails

This deliberately exercises every competency this course has built: `document.createElement`/`appendChild` and `textContent` from Lesson 03; delegated click handling and keyboard reachability from Lesson 04; the add-task form's validation (don't allow an empty task) from Lesson 05; the seed fetch and its failure handling from Lesson 06; and the debugger from Lesson 07, which you will need the moment something above doesn't work on the first try — and something will not work on the first try. That is expected, not a sign you did something wrong.

## Write the specification before you write code

Before writing a single line, write down what "correct" means for this page, in plain sentences, one per behavior. For example:

1. Typing a task and clicking Add appends it to the list and clears the input.
2. Clicking Add with an empty or whitespace-only input does nothing and shows a validation message.
3. Clicking a task's Complete toggle marks it visually complete and it remains in the list under the "All" and "Completed" filters, but disappears under "Active."
4. Clicking Delete removes exactly that task, none other.
5. Every Add, Complete, and Delete control is operable with the keyboard alone, not just the mouse.
6. On page load, five seed tasks appear from the API. If the request fails, a visible error message appears instead of a blank or frozen list.
7. Switching filters updates the visible list without duplicating, losing, or reordering unrelated tasks.

This list is your **expected behaviour**. You cannot verify a page against expectations you never wrote down — "I'll know it if I see it" is not a verification method, it's a guess, and it produces exactly the kind of vague bug report Lesson 07 taught you to avoid writing.

## Build it

Implement the page against your own specification. Use everything from Lessons 02–07: `const`/`let`, functions, `querySelector`/`querySelectorAll`, `addEventListener` with delegation on the list container, `preventDefault()` on the add form, `classList` for the completed/active states, `async`/`await` with a `response.ok` check for the seed fetch, and the debugger the moment something behaves unexpectedly rather than guessing at a fix.

## Verify it against your own specification

Once it runs, do not assume it's correct because it looks correct. Go through your numbered specification one line at a time, test that specific behavior deliberately (including the awkward cases — an empty add, rapid double-clicks on Delete, switching filters while the seed fetch is still in flight, keyboard-only operation of every control), and record the result of each one honestly: pass, or fail with specifics.

For any line that fails, use the debugging process from Lesson 07 — reproduce it reliably, narrow the trigger, set a breakpoint where the failure becomes visible, inspect real values — before you decide whether to fix it or file it. Some failures you'll fix immediately because the cause is obvious once you see it. Others you should leave as filed defects, deliberately, even though you could fix them yourself: the point of this exercise is practicing the verification-and-reporting skill, not shipping a flawless page, and a verification record with zero findings on a first build is far more likely to mean you tested lightly than that you wrote perfect code.

## Practice

This lesson's practice **is** the lesson — complete all four parts and keep every artifact.

1. **Write the specification.** Produce your own numbered list of expected behaviors (extend the seven above with anything specific to how you built your page). This is a required artifact, written before you finish the build.

2. **Build the page** described above, using the techniques from Lessons 02 through 07.

3. **Verify deliberately.** Go through your specification line by line and test each one on purpose, including edge cases (empty input, rapid clicking, keyboard-only operation, a deliberately broken fetch URL to confirm your error state actually appears). Keep a running verification log with one row per specification line: the behavior, pass or fail, and — for anything you tested beyond the literal specification line — what you tried and what happened.

4. **File at least two real defects** you found during verification, each written in the five-part shape from Lesson 07: steps to reproduce, expected result, actual result, location (function name, line, or the specific value that was wrong — use the debugger to find it, don't guess), and severity. If your page genuinely has fewer than two bugs after your first honest pass, go find them: test a case you skipped, try the keyboard-only path all the way through, or deliberately break the fetch URL and confirm the failure is handled the way your specification says it should be. A verification pass that finds nothing has usually not looked hard enough.
