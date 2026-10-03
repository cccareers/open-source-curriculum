---
lesson_id: web101-06
course_id: web101
pathway: quality-assurance-software-engineer
title: Asynchronous JavaScript and Fetching Data
order: 6
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Fetch data asynchronously and handle the failure cases
---

## Where flaky tests are born

Every other lesson so far has run synchronously: your code executes top to bottom, in order, and finishes before the next line starts. Fetching data from a server breaks that assumption completely — the request goes out, and the rest of your code keeps running *before* the response comes back. This gap between "I asked" and "I got an answer" is where an enormous share of real-world bugs live, and it is specifically where automated tests become **flaky** — passing sometimes and failing other times with no code change at all, because the test checked the page's state before an async operation had actually finished. Understanding asynchronous JavaScript is what lets you tell the difference between a genuinely broken feature and a test that simply didn't wait long enough.

## The problem, demonstrated

```js
function loadUser() {
  let user;
  fetch("/api/user/1")
    .then((response) => response.json())
    .then((data) => { user = data; });

  console.log(user); // undefined — this line runs before the fetch finishes
}
```

This is not a bug in `fetch`. It is `fetch` working exactly as designed: it starts the network request and immediately hands control back to whatever called it, so the browser isn't frozen waiting on the network. `console.log(user)` runs while the request is still in flight, long before `.then()` has a chance to fire. If you remember one thing from this lesson, remember that this pattern — reading a value that an async operation was supposed to set, on the very next line — is one of the most common defects you will find in real code, and one of the most common causes of a flaky test you will be asked to diagnose.

## Promises: a value that arrives later

`fetch()` returns a `Promise` — an object representing a value that doesn't exist yet but will, eventually, either resolve (succeed) or reject (fail).

```js
fetch("/api/user/1")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Request failed:", error));
```

`.then()` schedules a callback for when the promise resolves; you can chain several, each receiving the previous one's return value. `.catch()` catches a rejection anywhere earlier in the chain. Leaving `.catch()` off is itself a defect worth flagging: an unhandled rejection often fails silently in the UI — the page just looks like nothing happened — while the actual error sits unreported in the console, which is exactly the kind of gap between "what the user sees" and "what the code knows" that your future bug reports will need to close.

## `async`/`await`: the same thing, read top to bottom

```js
async function loadUser() {
  try {
    const response = await fetch("/api/user/1");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}
```

`await` pauses execution *within this function* until the promise settles, without freezing the rest of the page. `async`/`await` is not a different mechanism from promises — it's the same promise chain, written to read like synchronous code, with `try`/`catch` doing the job `.catch()` did before. Most application code you review from here on will use this style; recognize both, since older code and some libraries still use `.then()` chains directly.

## `fetch` does not reject on HTTP error status

This is the single most-missed detail in `fetch`-based code, and it produces a specific, common defect class: `fetch`'s promise only rejects on a genuine network failure (DNS failure, no connection, CORS block). A `404 Not Found` or a `500 Internal Server Error` response still **resolves successfully** — `fetch` delivered a response, it just wasn't a good one. You must check `response.ok` (or `response.status`) yourself:

```js
async function loadUser(id) {
  const response = await fetch(`/api/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to load user ${id}: ${response.status}`);
  }
  return response.json();
}
```

Code that skips this check will happily try to parse an HTML error page as JSON, or silently render an empty user profile with no indication anything went wrong. As a tester, "what does this page do when the API returns a 500" is a question you should be able to answer by reading the fetch code before you ever have to simulate the failure — and simulating it (e.g., with your browser's dev tools set to block the request, which you'll practice using in the next lesson) is exactly how you'd confirm your prediction.

## Timing, `setTimeout`, and why "just add a wait" is not a fix

```js
setTimeout(() => {
  console.log("This runs later, not now");
}, 1000);
console.log("This runs first");
```

`setTimeout` schedules code to run after a delay, but does not block anything in between — the two `console.log` calls above run in reverse order from how they appear in the file. This same mechanism is often the quiet cause of a flaky UI test: a developer adds `setTimeout(() => { spinner.hidden = true; }, 300)` to make a loading spinner feel smooth, and a test that checks "spinner is hidden" immediately after triggering the action fails intermittently, depending on how fast the test runner happens to be on a given day. The correct fix, in both real code and in tests, is never "wait longer and hope" — it's to make the code (or the test) actually wait *for the specific event that matters* (the fetch resolving, the DOM update happening) rather than for an arbitrary clock duration.

## Practice

Using a page with a `<button id="load-btn">Load user</button>` and an empty `<div id="result">`, and any public test API such as `https://jsonplaceholder.typicode.com/users/1`:

1. Write an `async` function that fetches the user, checks `response.ok`, and on success sets `#result`'s `textContent` to the user's name. On failure, set `#result`'s `textContent` to a clear error message instead of leaving it blank. Wire it to the button's `click` event.
2. Deliberately break the URL (e.g., request `/users/999999` or a nonexistent path) and confirm your error branch runs and produces a message a real user could understand — not just `undefined` or a blank screen.
3. Add a `console.log` immediately after the line that calls your fetch function (outside of it, in the click handler) and another one inside the function right after the `await` resolves. Run it once and write down the actual order the two logs printed in, versus the order you predicted before running it — this is the exact habit of verifying your mental model against real async behavior that the debugging lesson builds on next.

## Check your understanding

1. The API returns `500`. Does `await fetch(url)` throw? What should the code check?
2. A test checks for the user's name right after clicking "Load user" and fails one run in five. What is the likely cause, and what is the correct fix?
3. In what order do these print: `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");`?

*Answers:* (1) No; `fetch` resolves with the response. Check `response.ok` (or `response.status`) and throw or show an error. (2) The test reads the DOM before the fetch resolves; wait for the name to appear (the specific event), not for a fixed delay. (3) A, C, B: even a 0 ms timeout runs after the current code finishes.
