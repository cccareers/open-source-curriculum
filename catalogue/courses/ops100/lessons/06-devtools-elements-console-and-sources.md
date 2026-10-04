---
lesson_id: ops100-06
course_id: ops100
pathway: quality-assurance-software-engineer
title: DevTools Elements, Console, and Sources
order: 6
kind: lesson
competency_ids:
  - D3-S1-C02
  - D3-S1-C03
objectives:
  - Use Chrome DevTools to inspect and debug a running page
---

## DevTools is a QA instrument, not a developer convenience

Everything in this lesson and the next is D3-S1-C03 in practice: installing, maintaining, and using software testing programs — in this case, the browser's own built-in inspection suite. Chrome DevTools ships with every install of Chrome; opening it is not "installing" in the sense of a download, but *knowing which panel to reach for* and *keeping your habits current as the tool changes* is exactly the maintain-and-use half of that competency. A QA engineer who only knows how to click around a page is limited to reporting what a user would see. A QA engineer fluent in DevTools can report what's actually happening underneath — which is the difference between "the button doesn't work" and "the button's click handler throws a TypeError because `cart.items` is undefined on first render."

Open DevTools with `Cmd+Option+I` (macOS) or `F12` / `Ctrl+Shift+I` (Windows/Linux), or by right-clicking any element on a page and choosing "Inspect." The panels relevant to this lesson are Elements, Console, and Sources.

![The Chrome DevTools panels a QA engineer uses most, labelled: Elements, Console, Sources, Network, Performance, and Lighthouse](./img/devtools-panels.png)

## Elements: the DOM and styles as the browser sees them

The Elements panel shows the live DOM — not the original HTML source, but the tree as the browser has rendered and modified it, including anything JavaScript added or changed after page load. This distinction matters constantly: a bug report that says "the HTML is wrong" is almost always actually about what Elements shows, not what "View Source" shows, because View Source only ever shows the original file.

Click an element on the page (or use the inspect-cursor icon) to jump to it in the tree. The Styles pane on the right shows every CSS rule affecting that element, in cascade order, with overridden rules struck through — which makes Elements the fastest way to answer "why is this margin wrong" or "why isn't my color override applying." You can edit both the DOM and the CSS live, directly in the panel, to test a fix hypothesis before asking anyone to change actual code:

```text
Click the element → Styles pane shows: margin-top: 12px (from .card)
                                        margin-top: 0 (from .card--compact, struck through)
```

Live edits never persist past a page reload — that's a feature, not a limitation. It means you can experiment freely without any risk of damaging the real project.

## Console: errors, logs, and live evaluation

The Console panel is where JavaScript errors surface, where a codebase's own `console.log` statements print, and where you can type and run JavaScript directly against the current page. For debugging, errors are the first thing to check — a red stack trace in Console is frequently the fastest possible route to a defect's root cause, because it tells you the exact file, line, and type of failure:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'items')
    at CartSummary (cart.js:42)
```

That single line tells you three things immediately: what kind of error (a `TypeError` from reading a property of `undefined`), where it happened (`cart.js`, line 42), and which function was running (`CartSummary`). Click the file:line link to jump straight to that code in the Sources panel.

You can also use Console to test a hypothesis without touching the codebase at all:

```js
document.querySelectorAll('.cart-item').length
// 3

fetch('/api/cart').then(r => r.json()).then(console.log)
// inspect exactly what the API is currently returning
```

Running the same fetch the app itself would run, but by hand in Console, is one of the most direct ways to check whether a bug is on the frontend (misusing correct data) or the backend (returning wrong data in the first place) — a distinction you'll need constantly once you start writing defect reports in lesson 08.

## Sources: stepping through actual execution

The Sources panel shows every script the page has loaded, and lets you set breakpoints — points where execution pauses so you can inspect variables at that exact moment, rather than guessing from log output alone.

Click a line number in any open file to set a breakpoint, then trigger the code path (click a button, submit a form, reload). Execution pauses right there, and DevTools shows:

- **Scope**, listing every variable in reach at that line and its current value,
- **Call Stack**, showing the chain of function calls that led here: the top frame is the function you are paused in, and each frame below it is the caller that called the one above. Read from the bottom up to follow how execution got here from the original trigger (a click handler, a timer, a page load),
- Stepping controls — step over (run the next line), step into (follow a function call inside), step out (finish the current function and return to its caller).

```js
function calculateTotal(cart) {
  let total = 0;               // ← set a breakpoint here
  for (const item of cart.items) {
    total += item.price * item.quantity;
  }
  return total;
}
```

Pausing at that breakpoint and inspecting `cart` in the Scope pane will tell you immediately whether `cart.items` is the empty array you expected, `undefined`, or something with an unexpected shape — resolving in seconds a question that could otherwise take many rounds of adding and removing `console.log` lines.

## Isolating a breakdown: config, logs, or code

D3-S1-C02 — performing initial debugging by reviewing configuration files, logs, or code to locate a breakdown's source — is the point of everything above, brought together into one habit. When something's broken, work through the same three sources in order, from cheapest to check to most involved:

1. **Config first.** Is the app pointed at the right API URL? Is a feature flag set the way you expect (recall the `.env` file from lesson 02)? A wrong config value produces symptoms that look exactly like a code bug but require a completely different fix.
2. **Logs next.** Check Console for errors before you go looking through code — an uncaught exception often names the exact broken line for you.
3. **Code last**, using Sources to step through and confirm what you suspect from the config and log check, rather than reading code cold and guessing.

This ordering matters because it's the fastest path to a correct diagnosis, and misdiagnosing "config problem" as "code problem" (or the reverse) is one of the most common ways a defect report sends a developer down the wrong path entirely.

## Practice

1. Open any website in Chrome, open DevTools, and use the Elements panel's inspect-cursor to select three different elements. For each, note one CSS rule that's active and one that's overridden (struck through), and identify which selector "won" the cascade.
2. Open the Console panel on the same page and run `document.title`, then `document.querySelectorAll('a').length` to count the links on the page. Try one more expression of your own that inspects something about the page.
3. Find (or ask your instructor for) a small page with an intentional JavaScript error. Read the Console error message, click through to the file and line it names, and in the Sources panel set a breakpoint on the line just before the error. Reload, let it pause, and inspect the Scope pane to identify exactly which variable is not what the code expected.
4. Write two or three sentences describing a hypothetical bug report ("the total is wrong") and walk through, in order, which of config, logs, or code you would check first and why, based on this lesson's ordering.

## Check your understanding

1. View Source shows a `<div class="banner">`, but the Elements panel doesn't. Which one reflects what the user sees, and what might explain the difference?
2. The Console shows `TypeError: Cannot read properties of undefined (reading 'items') at CartSummary (cart.js:42)`. What three facts does that line give you?
3. The cart total is wrong on staging but right locally. Which of config, logs, or code do you check first, and what specifically?

*Answers:* (1) Elements: it shows the live DOM, so JavaScript may have removed or replaced the element after load. (2) The error type, the location (`cart.js` line 42), and the running function (`CartSummary`). (3) Config first, for example the API base URL or a feature flag that differs between environments.
