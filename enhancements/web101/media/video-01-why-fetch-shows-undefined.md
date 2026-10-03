---
course_id: web101
media_id: web101-v01
type: video-script
title: "Why Your Fetch Shows undefined (and Why 404 Isn't an Error)"
format: screencast
target_runtime: "7 min"
related_lessons:
  - web101-06
  - web101-07
objectives:
  - Fetch data asynchronously and handle the failure cases
competency_ids:
  - D5-S1-C02
---

## Purpose
After watching, the learner can predict the order of async logs, explain why a value read on the next line is `undefined`, and handle both a network failure and an HTTP error status with a visible message.

## Audience and prerequisites
web101 learners at lesson 06. A local page with `<button id="load-btn">Load user</button>` and `<div id="result"></div>`, opened in Chrome. Uses the public test API `https://jsonplaceholder.typicode.com` (availability not guaranteed; see production notes).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Page with the Load user button; console open. | "Here's a bug you will see in real code and in flaky tests: data that's 'there' but reads as undefined. Let's make it happen on purpose." |
| 0:15 | Type in `app.js`: `function loadUser() { let user; fetch("https://jsonplaceholder.typicode.com/users/1").then((r) => r.json()).then((data) => { user = data; console.log("2: inside then", data.name); }); console.log("1: after fetch", user); }` and wire it to the button. | "We start a fetch, store the result in `user`, and log `user` on the next line. I've numbered the logs by the order I *wrote* them." |
| 0:45 | Click. Console: `1: after fetch undefined`, then `2: inside then Leanne Graham`. | "Look at the order. The line after `fetch` runs first, and `user` is still undefined. Then, a moment later, the `then` runs with the real data." |
| 1:05 | Diagram overlay: a timeline with "request sent" → "your code keeps going" → "response arrives" → ".then runs". | "`fetch` sends the request and returns immediately with a promise. Your code doesn't wait. The callback runs when the response arrives, which is always after the current code finishes." |
| 1:35 | Rewrite: `async function loadUser() { const response = await fetch(url); const data = await response.json(); document.querySelector("#result").textContent = data.name; }` | "`async` and `await` let you write it top to bottom. `await` pauses *this function* until the promise settles, while the page stays responsive." |
| 2:00 | Click. `#result` shows `Leanne Graham`. | "Now the name shows up, because we only touch the DOM after the data exists." |
| 2:15 | Change URL to `/users/999999`. Click. `#result` shows empty text; no error in console. | "Now the unhappy path. Ask for a user that doesn't exist. The box is blank, and there's no error. Nothing tells the user anything went wrong." |
| 2:35 | Network panel: request row shows status `404`. Response body `{}`. | "The Network panel says 404. But `fetch` didn't throw. A `fetch` promise only rejects when there's no usable response at all, like being offline. A 404 or 500 is still a response, so it resolves." |
| 3:05 | Add: `if (!response.ok) { throw new Error(`Failed to load user: ${response.status}`); }` and wrap the body in `try { ... } catch (error) { result.textContent = "Sorry, we couldn't load that user. Please try again."; console.error(error); }` | "So you check `response.ok` yourself, and throw if it's false. The `catch` turns any failure into a message a person can understand, and keeps the technical detail in the console for the next tester." |
| 3:40 | Click. `#result`: "Sorry, we couldn't load that user. Please try again." Console: `Error: Failed to load user: 404`. | "Visible message for the user, precise error for us." |
| 3:55 | Network panel: right-click the request → "Block request URL" (exact menu wording may vary by Chrome version). Restore URL to `/users/1`; click. | "Now the other failure: the network itself. Block the request in DevTools and click again." |
| 4:15 | `#result` shows the same friendly message; console: `TypeError: Failed to fetch`. | "This time `fetch` really does reject, with `TypeError: Failed to fetch`, and the same `catch` handles it. One handler, both failure cases." |
| 4:35 | Unblock. Slide: "Two failure cases: no response (rejects) / bad response (resolves, check `ok`)". | "Remember the two failure cases. No response: the promise rejects. Bad response: it resolves, and you must check." |
| 5:00 | Show a test-like check: clicking, then immediately `document.querySelector("#result").textContent === "Leanne Graham"` in the console returns `false`; a second later, `true`. | "Here's how this turns into a flaky test. Check the result immediately after clicking and it's false. Check a moment later and it's true. Same code, different answer, depending on timing." |
| 5:30 | Slide: "Don't: wait 2 seconds. Do: wait for the name to appear." | "The fix is never 'wait two seconds'. It's 'wait for the specific thing': the text to appear, the request to finish. Test tools have functions for exactly that, and you'll meet them later in the pathway." |
| 6:00 | Defect report on screen: Title "User panel stays blank with no message when the user API returns 404"; Steps; Expected; Actual; Location "`loadUser` in app.js parses the body without checking `response.ok`"; Severity "Major: silent failure". | "And if you find code that skips the `ok` check, here's the report. Notice the location line: you read the code, so you can say exactly why." |
| 6:40 | End card. | "In the lesson practice, predict the log order before you run it, then write down what actually happened." |

## On-screen assets and B-roll
- The three versions of `app.js` (then-chain, async without `ok` check, final).
- Timeline diagram for 1:05; two-failure-cases slide.

## Accessibility
- Captions and transcript; every console line is read aloud.
- Network panel status codes are spoken ("four oh four") and highlighted with a box and label, not color alone.
- All actions use visible menus or spoken shortcuts.

## Check for understanding
1. Which line prints first: a `console.log` right after `fetch(...)`, or one inside `.then`? *Answer: The one after `fetch`; the callback runs after the response arrives.*
2. The API returns 500. Without a `response.ok` check, does the `catch` block run? *Answer: Not because of the status; `fetch` resolves. It might run later if parsing the body fails, but the status itself is not treated as an error.*
3. A test fails intermittently because it reads `#result` too early. What is the right fix? *Answer: Wait for the expected text or the request to complete, not a fixed delay.*
