---
lesson_id: web101-04
course_id: web101
pathway: quality-assurance-software-engineer
title: Events and User Interaction
order: 4
kind: lesson
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
objectives:
  - Handle user events while keeping interactive behaviour reachable from the keyboard
---

## Events are the interactions a test simulates

Everything a user does to a page — clicking, typing, pressing Tab, submitting a form — fires an event. JavaScript listens for those events and runs code in response. This is the second half of what makes a page "interactive," and it's the half that matters most to you as a future tester: when you eventually write an automated UI test, that test will not literally move a mouse. It will dispatch the same events you're about to learn to attach handlers for. Understanding events from the inside means you'll be able to predict what a test tool is actually doing, and diagnose it when it doesn't behave the way the visible page suggests it should.

## Attaching a listener

```js
const button = document.querySelector("#save-btn");

button.addEventListener("click", function (event) {
  console.log("Save clicked");
});
```

`addEventListener` takes an event name (no `on` prefix, unlike the older `onclick` attribute) and a function to run when that event fires. You can attach more than one listener to the same element and event — both run. The older pattern, `button.onclick = function () {...}`, only allows one handler per element and gets silently overwritten if a second script sets it again; recognize it in legacy code, but prefer `addEventListener` in anything you write.

Common events you'll work with constantly:

| Event | Fires when |
| --- | --- |
| `click` | element is clicked (mouse or via Enter/Space when focused) |
| `input` | a form field's value changes, as the user types |
| `change` | a form field loses focus after its value changed |
| `submit` | a form is submitted |
| `keydown` / `keyup` | a key is pressed or released |
| `focus` / `blur` | an element gains or loses keyboard focus |

## The event object

Every handler receives an event object describing what happened:

```js
document.querySelector("#email").addEventListener("input", function (event) {
  console.log(event.target.value); // the current value of the field
  console.log(event.type);         // "input"
});
```

`event.target` is the actual element the event happened on — critical when a handler is shared across several elements, since it tells you which one triggered this particular call. `event.preventDefault()` stops the browser's default behavior for that event, most commonly used to stop a form from actually submitting (and reloading the page) while you validate it first:

```js
document.querySelector("#signup-form").addEventListener("submit", function (event) {
  event.preventDefault();
  // validation logic goes in Lesson 05
});
```

If you ever see a bug report that says "the form always reloads the page even though validation should have blocked it," a missing or misplaced `preventDefault()` is the first thing to suspect.

## Event delegation: one listener, many elements

Attaching a separate listener to every row in a table that might grow or shrink is wasteful, and it breaks for rows added after the listener was attached. The standard fix is **event delegation**: attach one listener to a stable parent, and use `event.target` to figure out which child was actually interacted with.

```js
document.querySelector("#todo-list").addEventListener("click", function (event) {
  if (event.target.matches(".delete-btn")) {
    event.target.closest("li").remove();
  }
});
```

`event.target.matches(selector)` checks whether the clicked element matches a CSS selector. `closest()` walks up from the clicked element to find the nearest ancestor matching a selector — here, the whole `<li>` row that contains the button that was clicked. Delegation is common enough in real applications that recognizing the pattern will save you from misreading "why does clicking work on rows added after page load" as a bug when it's actually the intended design — or, just as often, correctly flagging it as a bug when delegation was needed but the developer forgot it.

## Event flow: capture, target, and bubble

An event doesn't just fire on the element it happened to. It travels through the DOM tree in three phases: it **captures** downward from the document to the target, fires **at** the target, then **bubbles** back upward through every ancestor. This is what makes delegation possible — a click on a button bubbles up to the parent list, where your one listener catches it.

![Event capture, target, and bubble phases traveling through a DOM tree, with handler positions marked at each phase](./img/dom-event-flow.png)

By default, `addEventListener` listens during the bubble phase. You can opt into capture-phase listening with a third argument:

```js
parentElement.addEventListener("click", handler, { capture: true });
```

You'll rarely need capture phase yourself, but understanding that bubbling is happening explains a real class of bugs: a click handler on an outer container firing when the user clicked something deep inside it, because the event bubbled up and nothing stopped it. `event.stopPropagation()` halts that bubbling — and its overuse is itself a common defect, because it can silently prevent a legitimate outer handler (like a modal's "click outside to close") from ever running.

## Keyboard reachability: interactive means reachable without a mouse

A control that only responds to `click` is not actually accessible — a keyboard-only or switch-device user cannot trigger a `click` event on a `<div>` by pressing Tab and Enter, because a plain `<div>` is never part of the tab order and never receives keyboard events by default. This is not a nice-to-have; it is the difference between a page that works and one that silently excludes an entire category of user, and testing for it is squarely your job as a QA engineer, tied directly to this course's accessibility competency.

The reliable fix is to use real interactive elements — `<button>`, `<a href="...">`, native form controls — because browsers give them keyboard behavior for free: they're in the tab order, and Enter or Space fires their `click` event automatically.

```html
<!-- Wrong: looks clickable, invisible to a keyboard user -->
<div class="btn" onclick="save()">Save</div>

<!-- Right: keyboard-reachable and click-reachable, for free -->
<button class="btn" id="save-btn">Save</button>
```

When you truly cannot avoid a non-native element acting as a control, you must manually restore what the browser would have given you automatically:

```js
const customControl = document.querySelector(".custom-toggle");
customControl.setAttribute("tabindex", "0");   // put it in the tab order
customControl.setAttribute("role", "button");  // announce it to screen readers

customControl.addEventListener("click", activate);
customControl.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
});
```

As a tester, the fastest accessibility check you can run on any interactive-looking element takes ten seconds: unplug the mouse, mentally, and press Tab repeatedly. If a control never receives visible focus, or receives focus but Enter does nothing, that is a real, filable defect — not a matter of opinion.

## Practice

Build a small page with a list of at least three items, each with a "Delete" `<button>`, plus one custom `<div class="toggle">Show details</div>` styled to look clickable.

1. Attach a single delegated `click` listener to the list's parent element that removes the row when its Delete button is clicked. Confirm it still works after you add a fourth row dynamically with `createElement`/`appendChild`.
2. Attach a `keydown` listener that logs which key was pressed every time focus is inside the list, and confirm in the console that pressing Tab moves focus between the Delete buttons.
3. Test the `<div class="toggle">` with only your keyboard: Tab to it, then press Enter. Write down what happened (or didn't). Then fix it using `tabindex`, `role="button"`, and a `keydown` handler so Enter and Space both activate it the same way a click does. Re-test with the keyboard only and confirm the fix worked.
