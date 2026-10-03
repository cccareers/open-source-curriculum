---
course_id: react100
media_id: react100-v02
type: video-script
title: "The Index-Key Bug, Live"
format: screencast
target_runtime: "6 min"
related_lessons:
  - react100-05
objectives:
  - Render lists and conditional interfaces correctly
competency_ids:
  - D2-S1-C04
---

## Purpose

After watching, the learner can reproduce the index-key bug on demand, explain from React's point of view why state ends up attached to the wrong item, and fix it with a key that comes from the data.

## Audience and prerequisites

Apprentices working through lesson 05 (Lists, Keys, and Conditional Rendering). They can render a list with `map` and have seen the "Each child in a list should have a unique key prop" warning. They know from lesson 04 that state belongs to a component instance.

## Script

Screen setup: VS Code left (font size 20), browser right with React Developer Tools open on the Components tab. Toolshare app running with three tools.

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Browser. Three Toolshare cards: Cordless Drill, Wet/Dry Vacuum, Extension Ladder, each with a "Requested" checkbox and a "Remove" button. Cursor ticks "Requested" on the Wet/Dry Vacuum. Then clicks "Remove" on the Cordless Drill. Now two cards remain, and the *Extension Ladder* shows as requested. | "I asked to borrow the vacuum. I removed the drill. Now the app says I've requested the ladder. Nobody typed anything wrong, the data's fine, and there's no error. This is the index-key bug, and by the end of this video you'll see exactly what React did and why." |
| 0:25 | Title card: "The Index-Key Bug, Live". | "Let's take it apart." |
| 0:30 | VS Code: `ToolGrid.jsx` (Code A). `key={index}` highlighted. | "Here's the list. It maps over `tools` and renders a `ToolCard` for each, and the key is the array index. This is the most common way a key gets written, and the warning in the console goes away, so it looks done." |
| 0:50 | VS Code: `ToolCard.jsx` (Code B). The `useState(false)` line highlighted. | "And here's the card. It has its own piece of state, `isRequested`. Remember from lesson 04: state belongs to a component instance. Hold on to that, because the question is which instance." |
| 1:10 | Diagram overlay on top of the browser. Three slots stacked: `key 0 → Drill (requested: no)`, `key 1 → Vacuum (requested: yes)`, `key 2 → Ladder (requested: no)`. | "Here's what React has in memory after I tick the vacuum. Three component instances, identified by key. Key zero holds the drill. Key one holds the vacuum, and its state says requested. Key two holds the ladder." |
| 1:35 | Diagram animates: the Drill row is removed from the "data" column on the left. The data column now reads `Vacuum, Ladder`. New keys computed beside it: `0, 1`. | "Now I remove the drill. The array is now vacuum, ladder. React renders again, and the map hands out keys again by position: the vacuum gets key zero, the ladder gets key one." |
| 2:00 | Diagram: React matches keys. `key 0` instance (state: no) is now given Vacuum's props. `key 1` instance (state: yes) is given Ladder's props. `key 2` instance is crossed out. | "React's job is to match the new list to the old one, and the key is the only thing it uses. Key zero existed before, so it keeps that instance, which has the drill's state, not requested, and gives it the vacuum's props. Key one keeps the instance whose state says requested, and gives it the ladder. Key two is gone, so that instance is destroyed." |
| 2:35 | Back to the browser. Ladder shows as requested. A label: "state stayed with the position". | "So the ladder looks requested and the vacuum doesn't. The state stayed with the position, because we told React that position was identity." |
| 2:50 | React DevTools Components panel. Expand `ToolGrid`. Hover each `ToolCard`; the panel shows `key: "0"`, `"1"` and the `isRequested` hook value. | "You can see it directly in React DevTools. Each `ToolCard` shows its key and its state. Key one has `isRequested: true`, and its props say Extension Ladder." |
| 3:10 | VS Code. Change `key={index}` to `key={tool.id}` (Code C). Save. | "The fix is one word. Use the tool's id. An id belongs to the item, not to where the item happens to sit." |
| 3:25 | Browser reloads. Repeat: tick Vacuum, remove Drill. Vacuum still shows requested. DevTools shows `key: "t-2"` with `isRequested: true`. | "Same steps. Tick the vacuum, remove the drill. The vacuum is still requested. In DevTools, the key is `t-2`, the vacuum's id, so the state followed the vacuum." |
| 3:45 | Diagram replay with id keys: `t-1` crossed out, `t-2` and `t-3` keep their instances. | "With ids, removing the drill destroys exactly the drill's instance. The others are matched to themselves." |
| 4:00 | VS Code: a text input added inside `ToolCard` for a note (Code D). Revert to `key={index}` briefly. Type "Need it Saturday" into the vacuum's note, then click a "Sort by name" button. The note jumps to a different card. | "It's not only `useState`. Anything the browser holds inside an item does the same: text in an input you haven't made controlled yet, focus, scroll position, an open `details` element. Here's the note I typed for the vacuum. I sort the list, and the note moves to a different tool." |
| 4:25 | Revert to `key={tool.id}`. Repeat. The note stays with the vacuum. | "Back to ids, and it stays put." |
| 4:35 | Text card: "Index keys are safe only if the list never reorders, filters, inserts, or deletes, and its items have no state." | "So when is the index fine? Only when the list is completely static, never reordered, filtered, inserted into, or deleted from, and the items hold no state. A hard-coded footer qualifies. Almost nothing else does." |
| 4:55 | VS Code: Code E, `addTool` with `crypto.randomUUID()`. | "If your data has no id, give it one when the item is created, not during render. `crypto.randomUUID()` generates one, and because it's stored on the item, it's stable." |
| 5:15 | VS Code: the anti-pattern `key={Math.random()}` typed, then a big `✕` over it. | "What you must never do is invent the key at render time. A random key gives every item a new identity on every render. React throws away the whole list each time, and every bit of state goes with it." |
| 5:35 | Recap card. | "Keys are identity. Take them from the data. And when items seem to swap their state after a delete or a sort, check the key first. Now open the lesson 05 lab, step four, and reproduce this yourself." |
| 6:00 | End card. | (no narration) |

### Code shown

Code A, `src/components/ToolGrid.jsx` with the bug:

```jsx
import ToolCard from "./ToolCard.jsx";

export default function ToolGrid({ tools, onRemove }) {
  return (
    <ul className="tool-grid" aria-label="Tools">
      {tools.map((tool, index) => (
        <ToolCard key={index} tool={tool} onRemove={onRemove} />
      ))}
    </ul>
  );
}
```

Code B, `src/components/ToolCard.jsx`:

```jsx
import { useState } from "react";

export default function ToolCard({ tool, onRemove }) {
  const [isRequested, setIsRequested] = useState(false);

  return (
    <li className="tool-card">
      <h3>{tool.name}</h3>
      <label>
        <input
          type="checkbox"
          checked={isRequested}
          onChange={(event) => setIsRequested(event.target.checked)}
        />
        Requested
      </label>
      <button type="button" onClick={() => onRemove(tool.id)}>
        Remove
      </button>
    </li>
  );
}
```

The parent that owns the list (shown briefly at 1:35):

```jsx
const [tools, setTools] = useState([
  { id: "t-1", name: "Cordless Drill" },
  { id: "t-2", name: "Wet/Dry Vacuum" },
  { id: "t-3", name: "Extension Ladder" },
]);

function handleRemove(toolId) {
  setTools((previous) => previous.filter((tool) => tool.id !== toolId));
}
```

Code C, the fix:

```jsx
{tools.map((tool) => (
  <ToolCard key={tool.id} tool={tool} onRemove={onRemove} />
))}
```

Code D, the uncontrolled note added to `ToolCard`:

```jsx
<label>
  Note
  <input type="text" defaultValue="" />
</label>
```

Code E, ids at creation time:

```jsx
function handleAddTool(name) {
  setTools((previous) => [...previous, { id: crypto.randomUUID(), name }]);
}
```

## On-screen assets and B-roll

- Key-matching diagram (1:10–2:35, replayed at 3:45). Three rows; each row has a key tag on the left, a component instance box in the middle, and a state chip on the right. Use Okabe-Ito colors with shape and label redundancy: instance boxes are outlined black; the "requested: yes" chip is bluish green `#009E73` with a `✓`, and "requested: no" is white with a dash `–`. A destroyed instance gets a vermillion `#D55E00` `✕` and diagonal hatching.
- Data column (left of the diagram) in a monospace font, so learners see that the array and the instances are two separate things.
- Title card, the "when are index keys safe" text card, and the recap card: "Keys are identity. Take them from the data. Items swap state after delete or sort? Check the key."
- End card: "Next: lesson 05 lab, step 4."

## Accessibility

- Captions supplied as `.vtt` and matching the narration exactly; code identifiers spelled as written.
- Every visual change is narrated: "the ladder now shows as requested", not "look what happened".
- State in the diagram is shown by icon and text (`✓ yes` / `– no`), not by color alone.
- The checkbox and Remove button are operated by keyboard at least once (3:25), with the focus ring visible.
- Editor font 20px or larger; browser at 125 percent zoom; the DevTools panel enlarged with its own zoom.
- A transcript with all code listings is published under the video.

## Check for understanding

1. A list uses `key={index}`. Each item has a "Details" toggle with its own state. You open the third item's details, then sort the list so that item moves to the top. Which item shows its details open?
   **Answer:** Whichever item now sits third. The state stayed with key 2, the position.
2. Why does `key={Math.random()}` make inputs lose focus on every keystroke?
   **Answer:** Each render gives every item a new key, so React destroys and recreates every component, including the focused input.
3. Your data has no id. Where should you create one, and where must you not?
   **Answer:** When the item is created, stored on the item (for example with `crypto.randomUUID()`), never during render.
