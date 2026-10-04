---
course_id: react100
media_id: react100-v01
type: video-script
title: "State Is a Snapshot: Why Your Count Is One Click Behind"
format: screencast
target_runtime: "6 min"
related_lessons:
  - react100-04
objectives:
  - Manage component state and respond to user events
competency_ids:
  - D2-S1-C04
---

## Purpose

After watching, the learner can predict what a state variable holds inside an event handler, explain why three `setCount(count + 1)` calls add one rather than three, and choose the updater form when the next state depends on the current one.

## Audience and prerequisites

Apprentices partway through lesson 04 (State and Event Handling). They have used `useState` once and written an `onClick` handler. They have the `toolshare` Vite project running. No knowledge of closures beyond "a function can read variables from the scope it was created in".

## Script

Screen setup: VS Code on the left (font size 20, light theme), browser on the right at 50 percent width with the console docked at the bottom. Toolshare app running at `http://localhost:5173`.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Browser only. A Toolshare tool card reading "Cordless Drill — Requests: 0" and a "Request ×3" button. Cursor clicks the button once. The number changes to 1. Caption: "Expected 3." | "This button is supposed to add three requests. I click it once and get one. No error, nothing in the console. The code isn't broken in any way a linter can see. It's built on a wrong idea about what a state variable is, and in the next six minutes we're going to fix that idea." |
| 0:20 | Title card: "State Is a Snapshot". Lesson 04 tag in the corner. | "State is a snapshot. Here's what that means and why it matters." |
| 0:28 | VS Code. `src/components/RequestCounter.jsx` open, showing Code A (below). The three `setCount` lines are highlighted. | "Here's the component. One piece of state, `count`, starting at zero. The handler calls `setCount(count + 1)` three times, then logs `count`. Before I click, make a prediction: what does the console print, and what does the screen show? Pause the video if you want to commit to an answer." |
| 0:50 | Split screen. Click the button. Console prints `0`. Screen shows `Requests: 1`. A label points at each. | "The console says zero. The screen says one. Both are surprising if you think of `count` as a variable that changes. They're exactly right if you think of it as a photograph." |
| 1:05 | VS Code. The line `const [count, setCount] = useState(0);` highlighted. An annotation slides in: "`count` is a const, created fresh on every render." | "Look at the declaration. `count` is a `const`. It isn't a box that React reaches into and updates. Every time React renders this component, it calls the function again, and that call gets its own `count` with the value React handed it for that render. During the first render, `count` is zero, and it stays zero for the whole life of that render." |
| 1:35 | Annotation over the handler: a bracket labelled "defined during render #1, sees count = 0". | "The handler was created during that render, so it sees that render's `count`. When you click, the handler runs, and every reference to `count` inside it is zero, forever. That's the snapshot." |
| 1:55 | The three lines step-highlight one at a time. Beside each, an overlay shows the arithmetic: `setCount(0 + 1)`. | "So walk through the three calls. First: zero plus one. `setCount(1)`. Second: `count` is still zero, because nothing reassigned it. `setCount(1)` again. Third: same thing. You've told React three times that the next value is one." |
| 2:20 | The `console.log(count)` line highlighted, overlay "0". | "And the log runs straight after, still inside the same snapshot, so it prints zero. Calling a setter doesn't change the variable you're holding. It sends React a request: 'next render, use this value.'" |
| 2:40 | Simple diagram replaces the editor for ten seconds: a queue box labelled "Next render" containing three cards "→ 1", "→ 1", "→ 1". An arrow to "Render #2: count = 1". | "React collects those requests, which is called batching, and then renders once. The last request says one, so render two gets `count` equals one. That's the number on screen." |
| 2:55 | Back to VS Code. Code B typed in live, replacing the three lines. | "Here's the fix. Instead of handing `setCount` a value, hand it a function. React calls that function with the latest pending value, not with your snapshot." |
| 3:15 | Overlay beside each line: `previous = 0 → 1`, `previous = 1 → 2`, `previous = 2 → 3`. | "First updater: previous is zero, returns one. Second: React passes in the one that's now queued, returns two. Third: two becomes three. The updates are applied in order, each building on the last." |
| 3:35 | Save. Browser reloads. Click the button. Screen shows `Requests: 3`. | "Save, click, and the count goes to three." |
| 3:45 | Click again. Shows 6. Console now logs `3`. | "Click again: six. And notice the console logged three this time, not six. The log is still reading the snapshot from the render the click happened in. The updater fixed the state; it didn't change what a snapshot is." |
| 4:05 | Text card: "Rule: if the next state is computed from the current state, use the updater function." | "So here's the rule to take away. If the next state is computed from the current state, use the updater. `setCount(c => c + 1)` is always safe. `setCount(count + 1)` is fine only when it happens once per event with nothing asynchronous in between." |
| 4:25 | VS Code: Code C, the Toolshare wanted-list toggle from lesson 04, `handleToggleWanted` highlighted. | "This isn't only about counters. Here's the wanted-list toggle from this lesson. The next list depends on the current list, so it uses the updater form. If a member double-clicks two cards quickly, both clicks build on the latest list instead of both reading the same stale one." |
| 4:50 | VS Code: Code D, the "one click behind" bug: a handler that sets `searchText` then immediately filters using `searchText`. The second line flashes. | "The snapshot also explains the other classic bug: 'my value is one keystroke behind'. Here the handler sets the search text, then filters using `searchText` on the next line. But that's still the old snapshot. The filter runs on what was typed before this keystroke." |
| 5:15 | Code D fixed: `const next = event.target.value; setSearchText(next);` and the filter removed from the handler and moved to the component body as a derived value. | "Two fixes. If you need the new value inside the handler, keep it in a local variable, `next`, and use that. Better still, don't filter in the handler at all. Compute the filtered list during render, from state, and it's always in step." |
| 5:40 | Recap card with three lines (see On-screen assets). | "So: a state variable is a snapshot of one render. Setters request the next render; they don't change the variable you're holding. When the next value depends on the current one, pass an updater. Now go to step three of the lesson 04 lab and break this on purpose yourself." |
| 6:00 | End card. | (no narration) |

### Code shown

Code A, `src/components/RequestCounter.jsx`, as first shown:

```jsx
import { useState } from "react";

export default function RequestCounter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);
  }

  return (
    <div className="tool-card">
      <h3>Cordless Drill</h3>
      <p>Requests: {count}</p>
      <button type="button" onClick={handleClick}>
        Request ×3
      </button>
    </div>
  );
}
```

Code B, the handler after the fix:

```jsx
function handleClick() {
  setCount((previous) => previous + 1);
  setCount((previous) => previous + 1);
  setCount((previous) => previous + 1);
  console.log(count);
}
```

Code C, from lesson 04's worked example:

```jsx
function handleToggleWanted(toolId) {
  setWantedIds((previous) =>
    previous.includes(toolId)
      ? previous.filter((id) => id !== toolId)
      : [...previous, toolId]
  );
}
```

Code D, the "one keystroke behind" bug:

```jsx
function handleSearchChange(event) {
  setSearchText(event.target.value);
  setVisibleTools(tools.filter((tool) => tool.name.toLowerCase().includes(searchText)));
}
```

Code D fixed:

```jsx
const [searchText, setSearchText] = useState("");

const visibleTools = tools.filter((tool) =>
  tool.name.toLowerCase().includes(searchText.toLowerCase())
);

function handleSearchChange(event) {
  const next = event.target.value;
  setSearchText(next);
}
```

## On-screen assets and B-roll

- Title card: "State Is a Snapshot", with the lesson 04 tag.
- Batching diagram (2:40): a box labelled "Next render" holding three cards `→ 1`. Use the course's Okabe-Ito palette: cards in sky blue `#56B4E9` with black text, and the arrow in black.
- Arithmetic overlays (1:55, 3:15): monospace, black on a pale yellow `#F0E442` callout at 30 percent opacity, so they read as annotations, not code.
- Rule card (4:05) and recap card (5:40). Recap text:
  1. A state variable is a snapshot of one render.
  2. Setters request the next render; they do not change the variable you hold.
  3. Next value depends on the current one? Use an updater.
- End card: "Next: lesson 04 lab, step 3 — reproduce the snapshot bug."

## Accessibility

- Closed captions burned in on request and supplied as a `.vtt` file, matching the narration word for word. Code identifiers in captions are spelled as written (`setCount`, not "set count").
- Every on-screen result is also spoken: the narration says "the console says zero, the screen says one" rather than "as you can see".
- Overlays and highlights use a thick outline plus a label, not color alone. The highlighted line also has a `▶` marker in the gutter.
- The button is activated with the keyboard (Tab, then Enter) at least once, at 3:35, and the focus ring is visible on screen.
- Editor font at least 20px; the browser zoomed to 125 percent so the counter is legible on a phone.
- No flashing; transitions are cuts or fades under 300ms.
- A text transcript with all four code listings is published under the video.

## Check for understanding

1. A handler runs `setCount(count + 2); setCount(count + 2);` with `count` at 1. What is on screen after the click?
   **Answer:** 3. Both calls compute `1 + 2` from the same snapshot.
2. Inside the same handler, after `setCount((c) => c + 5)`, you `console.log(count)`. `count` was 4. What prints, and why?
   **Answer:** 4. The log reads the snapshot from the render the click happened in; the updater only affects the next render.
3. Which of these should use the updater form, and why? (a) `setSearchText(event.target.value)` (b) toggling a tool id in `wantedIds`.
   **Answer:** (b). Its next value is computed from the current list. (a) replaces the value with something that does not depend on the previous state.
