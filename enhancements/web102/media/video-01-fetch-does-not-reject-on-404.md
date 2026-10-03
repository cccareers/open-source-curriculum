---
course_id: web102
media_id: web102-v01
type: video-script
title: "Fetch Does Not Reject on a 404"
format: screencast
target_runtime: "7 min"
related_lessons:
  - web102-06
  - web102-05
objectives:
  - Build working browser features in JavaScript from a written specification
competency_ids:
  - D2-S1-C04
  - D4-S1-C02
---

## Purpose

After watching, the learner can write a dashboard load path that checks `response.ok`, tells a failed request apart from an empty one, and shows a loading state, an error state with a retry button, and an empty state. They can also prove each state on purpose using the Network panel.

## Audience and prerequisites

Apprentices starting project 06 (Data-Driven Dashboard). They already know `async`/`await` and the "one state, one render" pattern from project 04, and the DevTools panels from lesson 05.

## Script

The project is a cut-down version of the volunteer dashboard: `index.html`, `js/main.js`, and `data/shifts.json` with 40 shift records. It is served with `npx serve .` at `http://localhost:3000`. The browser is Chrome, with DevTools docked to the right and Network set to "Disable cache". The editor font is at least 20 pt.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. The dashboard loads normally: four tiles, a site breakdown, a table. Cut to the same page showing only the header and empty white space below. | "Same page, same code. The only difference is that on the right, the data file was renamed. No error message, no retry button, nothing. A manager opening this sees a broken page and has no idea why. Let's find out why, and then make every one of these four situations visible on purpose." |
| 0:20 | Title card: "Fetch does not reject on a 404". Below it: "Loading · Ready · Empty · Error". | "Project 06 asks for four states: loading, loaded, empty, and failed. Most first attempts handle exactly one of them." |
| 0:30 | Editor: `js/main.js`, the naive version, highlighted line by line. | "Here's the version almost everyone writes first." |
| 0:35 | Code on screen:<br>`async function start() {`<br>`  try {`<br>`    const response = await fetch("./data/shifts.json");`<br>`    state.records = await response.json();`<br>`  } catch (err) {`<br>`    state.error = "Could not load shifts";`<br>`  }`<br>`  render();`<br>`}` | "Fetch the file, parse the JSON, and if anything goes wrong, catch it. That looks safe. The trouble is in what `fetch` treats as 'going wrong'." |
| 1:00 | Terminal: `mv data/shifts.json data/shifts.json.bak`. Browser reloads. Network panel shows `shifts.json` in red with status 404. Console: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. | "I've renamed the data file. The Network panel shows a 404: the server answered, and its answer was 'not found'. Now look at the console. The error isn't 'not found'. It's a SyntaxError about a less-than sign." |
| 1:25 | Click the 404 row. Response tab shows the server's HTML "404" page. Highlight `<!DOCTYPE html>`. | "Here's where that less-than sign came from. The server sent back an HTML error page. As far as `fetch` is concerned, the request worked. A server answered. So `fetch` resolved, and `response.json()` then choked trying to read HTML as JSON." |
| 1:50 | Text card: "`fetch` rejects only when no response arrives: offline, DNS failure, CORS block. A 404 or 500 resolves with `response.ok === false`." | "This is the rule to remember. `fetch` only rejects when it couldn't get a response at all: you're offline, the host doesn't exist, or the browser blocked it. A 404 or a 500 is still a response. It resolves, and `response.ok` is false." |
| 2:10 | Editor: add the check. Type it live. | "So we check it ourselves, and throw an error that names the actual problem." |
| 2:15 | Code:<br>`const response = await fetch(url);`<br>`if (!response.ok) {`<br>``  throw new Error(`Could not load shifts (HTTP ${response.status})`); ``<br>`}`<br>`const data = await response.json();` | "If `response.ok` is false, throw an Error that includes the status. Now the console says 'HTTP 404' instead of making the next developer decode a less-than sign." |
| 2:35 | Reload. Console: `Error: Could not load shifts (HTTP 404)`. Page is still blank. | "Better for the developer. But the page is still blank, because the state never says 'error' and render has nothing to show. That's the second half of the problem." |
| 2:50 | Editor: the state object. | "Instead of guessing the state from whether the array is empty, we store it." |
| 2:55 | Code:<br>`const state = {`<br>`  status: "loading", // "loading" \| "ready" \| "error"`<br>`  records: [],`<br>`  filters: { site: "all", claim: "all" },`<br>`  sort: { key: "startsAt", dir: "asc" },`<br>`};` | "Status is one of three values: loading, ready, or error. 'Empty' isn't a separate status. It's 'ready' with zero records left after filtering, and that difference matters in a minute." |
| 3:15 | Code: the new `start()`.<br>`async function start() {`<br>`  state.status = "loading";`<br>`  render();`<br>`  try {`<br>`    state.records = await loadShifts("./data/shifts.json");`<br>`    state.status = "ready";`<br>`  } catch (err) {`<br>`    console.error(err);`<br>`    state.status = "error";`<br>`  }`<br>`  render();`<br>`}` | "Set loading and render, so something is on screen right away. Then try to load. Success sets 'ready'. Any failure sets 'error' and logs the real error for the developer. Whatever happens, we render at the end. No path leaves the spinner running forever." |
| 3:45 | Code: the top of `render()`.<br>`const status = document.querySelector("#status");`<br>`if (state.status === "loading") { status.textContent = "Loading shifts…"; return; }`<br>`if (state.status === "error") { status.textContent = "We couldn't load the shift data."; showRetry(); return; }`<br>`const visible = applyFilters(state.records, state.filters);`<br>`if (visible.length === 0) { status.textContent = "No shifts match these filters."; }` | "Render switches on the status. Loading gets a message. Error gets a plain-language message and a Retry button. Ready but empty gets a different sentence, because 'no data' and 'couldn't load' are different situations and the manager needs to know which one this is." |
| 4:15 | `index.html` showing `<p id="status" role="status" aria-live="polite"></p>`. | "The status paragraph has `role="status"`, which makes it a polite live region. A screen reader announces these messages when they change, which R10 requires." |
| 4:30 | Code: `showRetry()` creates a `<button type="button">Retry</button>` whose click handler calls `start()`. | "Retry doesn't reload the page. It just calls start again." |
| 4:40 | Browser, file still renamed. Page shows "We couldn't load the shift data." and a Retry button. Terminal: `mv data/shifts.json.bak data/shifts.json`. Click Retry. Dashboard appears. | "File missing: a clear message and a Retry button. Put the file back, press Retry, and the dashboard loads, with no page reload. That's a line from the definition of done, demonstrated." |
| 5:05 | Network panel: throttling dropdown set to the slowest built-in preset (labelled "3G" or "Slow 3G" depending on the browser version). Reload. "Loading shifts…" visible for about 2 seconds, then the content. | "Now loading. On a fast local server it lasts a few milliseconds and you'll never see it. Throttle the network, reload, and there it is. Use throttling every time you touch the load path, not just the night before hand-in." |
| 5:25 | Network panel: "Offline" preset. Reload. Console: `TypeError: Failed to fetch`. Page shows the error message. | "Offline is the other kind of failure. Here `fetch` really does reject, with a TypeError. Our catch handles both kinds the same way, and the console still says which one happened." |
| 5:45 | Terminal: `cp data/shifts.json data/shifts.full.json && echo "[]" > data/shifts.json`. Reload. Page: "No shifts match these filters." Tiles show 0. | "And empty. Replace the file with an empty array and the page says there's nothing to show, which is a different message from the failure. Tiles show zero, not NaN. If you see NaN here, you're dividing by zero somewhere." |
| 6:10 | Four-up grid of screenshots: Loading, Ready, Empty, Error, each labelled in text. | "Four states, each one produced on purpose. Those four screenshots are exactly what project 06 asks you to hand in." |
| 6:25 | Text card: "1. Check `response.ok`. 2. Store `status`; don't infer it. 3. Prove each state with the Network panel." | "Three habits: check `response.ok`, store the status instead of guessing it, and use the Network panel to make each state happen deliberately. Restore your data file, and go build the tiles." |
| 6:45 | End card: "Next: computing tiles from filtered data." | — |

## On-screen assets and B-roll

- Starter repository at two commits: `naive-load` and `four-states`, so the recording can be redone cleanly.
- `data/shifts.json` with 40 records, plus `data/shifts.full.json` as a backup.
- Title card, rule card (1:50), four-up states grid (6:10), and summary card (6:25), all in the course template.
- Zoom-ins on the Network row status column and on the Response tab.

## Accessibility

- Open captions plus a downloadable transcript. Every code block shown on screen also appears in the transcript as text, not as an image.
- The 404 row turns red in Network. The narration names the status ("a 404"), and a zoom shows the "404" text, so color is never the only cue.
- The states grid labels each pane with a text heading, not color.
- Every action in the browser is done with visible mouse movement, or announced with its keyboard shortcut. Use a cursor-highlight tool and on-screen keystroke display.
- Pause 1 second on each code change before narration moves on, so viewers using magnification can follow.

## Check for understanding

1. The server returns a 500 error page. Without a `response.ok` check, what does your `catch` receive? **Answer:** a `SyntaxError` from `response.json()` trying to parse HTML, not anything mentioning the 500.
2. Why store `status: "loading"` instead of treating an empty `records` array as "still loading"? **Answer:** an empty array is also what a successful empty response or a no-match filter produces. Inferring the state makes loading, empty, and sometimes failure look identical.
3. How do you make the loading state visible during development without changing code? **Answer:** throttle the connection in the Network panel (the slowest built-in preset, or a custom profile) and reload.
