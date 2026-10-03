---
lesson_id: web101-03
course_id: web101
pathway: quality-assurance-software-engineer
title: Selecting and Changing DOM Nodes
order: 3
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Select and modify DOM nodes with the standard browser APIs
---

## The DOM is the object model a test walks

When a browser loads an HTML page, it doesn't just paint pixels — it builds a live tree of objects called the Document Object Model, or DOM. Every tag becomes a node in that tree, and JavaScript can read and change any of it while the page is running. This matters enormously for testing: every automated UI test tool you will ever touch — and this pathway reaches some of them later, in `agile200` — works by doing exactly what you're about to learn to do by hand: finding a node in that tree, reading its state, and asserting something about it. If you understand the DOM API directly, every test framework built on top of it will make sense as "a shortcut for what I already know how to do."

## Selecting nodes

The most common way to find an element is `document.querySelector`, which takes a CSS selector — the same kind you used in `web100` — and returns the first matching node, or `null` if nothing matches.

```js
const submitButton = document.querySelector("#submit-btn");
const firstError = document.querySelector(".error-message");
const allErrors = document.querySelectorAll(".error-message");
```

`querySelector` returns one node (or `null`). `querySelectorAll` returns a `NodeList` of every match, even if there's only one or zero. This distinction causes real bugs: code that calls `.forEach()` on the result of `querySelector` will throw, because a single node doesn't have that method — only a `NodeList` does.

Older, more specific selectors still appear in code you'll review:

```js
document.getElementById("submit-btn");       // single element, by id, no "#"
document.getElementsByClassName("error");    // live HTMLCollection
document.getElementsByTagName("input");      // live HTMLCollection
```

The word **live** matters. An `HTMLCollection` from `getElementsByClassName` automatically updates if elements are added or removed from the page after you captured it — a `NodeList` from `querySelectorAll` does not. This difference has caused real production bugs where a loop over a live collection skipped or repeated elements because the collection was changing size while the loop ran. As a tester, recognizing which kind of collection code is holding onto tells you whether "the list changed while I was iterating it" is even a plausible explanation for a bug you're seeing.

## Always check for `null`

`querySelector` and `getElementById` return `null` when nothing matches — they do not throw an error. That silence is dangerous:

```js
const banner = document.querySelector("#promo-banner");
banner.textContent = "Sale ends today"; // TypeError if #promo-banner doesn't exist
```

`Cannot set properties of null` is one of the single most common errors you will see in a browser console, and it almost always means a selector didn't match what the developer expected — a typo in an id, an element that hasn't rendered yet, or markup that changed. When you see this error while testing a page, your first move is to check: does the element the selector names actually exist in the DOM at this point? You'll practice reading exactly this kind of stack trace in Lesson 07.

## Reading and changing content

Three properties cover most of what you'll do:

```js
const heading = document.querySelector("h1");

heading.textContent;             // read: the text content only, tags stripped
heading.textContent = "Updated"; // write: replaces the text safely

heading.innerHTML;               // read: the markup inside the element
heading.innerHTML = "<em>Hi</em>"; // write: parses and inserts as HTML
```

`textContent` treats whatever you assign as plain text — safe by default. `innerHTML` parses the string as markup, which means it can inject real elements if the string ever comes from user input. A `<script>` tag inserted this way does not run, but an attribute like `<img src="x" onerror="...">` does, which is why `innerHTML` with user input is dangerous. As a QA engineer, `innerHTML` assigned from unsanitized user input is worth flagging every time you see it in a review; it is a well-known security defect class (cross-site scripting), not just a style preference.

Attributes are read and written separately from content:

```js
const link = document.querySelector("a.external");
link.getAttribute("href");
link.setAttribute("href", "https://example.com");
link.hasAttribute("target");
link.removeAttribute("target");

// Common attributes also have direct properties:
link.href;
link.id;
const checkbox = document.querySelector("#agree");
checkbox.checked;      // boolean, not a string, for checkboxes
checkbox.disabled;     // boolean
```

Notice `checkbox.checked` is a real boolean, while `checkbox.getAttribute("checked")` reflects only the initial HTML attribute and can disagree with the live state. This is a classic source of confusing bugs: a test that reads the attribute instead of the property can report a checkbox as "unchecked" when it visually is checked, because it read the wrong thing.

## Changing structure: creating, inserting, removing nodes

```js
const list = document.querySelector("#todo-list");

const item = document.createElement("li");
item.textContent = "Write test cases";
item.classList.add("todo-item");

list.appendChild(item);           // add at the end
list.insertBefore(item, list.firstChild); // moves it to the start (a node can only be in one place)

item.remove();                    // remove the node entirely
```

`classList` is the standard way to work with CSS classes:

```js
item.classList.add("done");
item.classList.remove("pending");
item.classList.toggle("highlighted");
item.classList.contains("done"); // true/false — useful in assertions
```

`classList.contains()` is worth remembering specifically: it's how you'll check, in code or in the console, whether an element currently carries a state class like `error` or `active` — which is exactly the kind of check an automated UI assertion makes under the hood.

## Traversing relationships

Sometimes you need to move relative to a node you already have, rather than re-querying the whole document:

```js
const item = document.querySelector(".todo-item");
item.parentElement;
item.children;
item.nextElementSibling;
item.previousElementSibling;
```

This matters for testing components that repeat, like a list of rows: once you've found "the row containing this text," traversal lets you find "the delete button inside that specific row" without accidentally matching a delete button in a different row.

## Practice

Using a blank HTML page with a `<ul id="todo-list">` containing three `<li>` items, and your browser console:

1. Select the list with `querySelector`, then use `querySelectorAll` to select all `<li>` items and log how many were found.
2. Create a new `<li>` with the text `"Verify DOM changes"`, give it the class `todo-item`, and append it to the list. Confirm in the Elements panel that it was added.
3. Deliberately write a selector that does **not** match anything on the page (e.g., `#does-not-exist`), then try to set its `.textContent`. Read the resulting error message carefully and write one sentence describing, in your own words, what it tells you and why it happened — this is the same kind of message you'll be diagnosing in Lesson 07.
4. Use `classList.toggle("done")` on one of your list items, then use `classList.contains("done")` to confirm the state changed. Toggle it again and confirm it changed back.

## Check your understanding

1. `document.querySelector(".row").forEach(...)` throws. Why, and what should it be?
2. A checkbox is visibly checked, but `getAttribute("checked")` returns `null`. Which value should a test read?
3. You see `Cannot set properties of null (setting 'textContent')`. What is your first check?

*Answers:* (1) `querySelector` returns a single element, which has no `forEach`; use `querySelectorAll`. (2) The `checked` property (`checkbox.checked`), which reflects live state. (3) Whether the selector actually matches an element in the DOM at that moment (typo, element not rendered yet, or markup changed).
