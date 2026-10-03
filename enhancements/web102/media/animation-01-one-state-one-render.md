---
course_id: web102
media_id: web102-a01
type: animation-storyboard
title: "One State, One Render"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - web102-04
  - web102-06
objectives:
  - Build working browser features in JavaScript from a written specification
competency_ids:
  - D2-S1-C04
---

## Concept and misconception it fixes

**Concept:** In the shift board, the state array is the single source of truth. Every interaction follows the same loop: event, then change state, then `render()` rebuilds the view, then the DOM. Nothing flows backward from the DOM into the state.

**Misconception:** "Update the row that changed." Learners write handlers that patch one row's text and also bump a counter element. When the release handler forgets the counter, the result is the stale-count defect from lesson 05. Learners also attach listeners to buttons that `render()` then replaces, so the board "works once". The animation shows both failures, then the loop that prevents them.

## Visual language (shapes, colors with color-blind-safe palette, labels)

Okabe-Ito palette, chosen to stay distinguishable for the common forms of color-vision deficiency. Every element also has a text label and a distinct shape, so color is never the only cue.

| Element | Shape | Color (hex) | Label |
|---|---|---|---|
| State (the `shifts` array) | Rounded rectangle holding 4 record "cards" | Blue `#0072B2` | `state` |
| `render()` | Gear / hexagon | Orange `#E69F00` | `render()` |
| DOM (the page) | Browser-window frame with rows | Neutral grey `#999999` outline, white fill | `the page` |
| Event | Small lightning-bolt glyph | Vermillion `#D55E00` | `click` |
| Correct flow arrows | Solid arrows | Bluish green `#009E73` | — |
| Wrong flow (anti-pattern) | Dashed arrows with an X glyph | Vermillion `#D55E00` | "patch" |
| Claimed record | Card with filled check-mark icon | Sky blue `#56B4E9` fill | `claimedBy: "Ana"` |
| Open record | Card with hollow circle icon | White fill, blue outline | `claimedBy: ""` |

Text uses the course sans-serif at 28 pt minimum. On-screen code uses the course monospace on a dark `#1E1E1E` background with contrast at least 7:1.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | The page frame on the right shows the shift board: 4 rows, and a counts bar reading "Open 3 · Claimed 1". | Rows fade in top to bottom. | "This is the shift board from project 04. Here's a bug you'll probably write." |
| 2 | 0:08–0:22 | A click bolt hits row 2's Claim button. A dashed vermillion arrow labelled "patch" goes from the handler straight to row 2, which changes to "Ana". A second dashed arrow goes to the counts bar, which updates to "Open 2 · Claimed 2". | The bolt strikes; the two dashed arrows draw in sequence. | "The handler patches the row, then patches the count. Two places to update." |
| 3 | 0:22–0:36 | A click bolt hits row 2's Release button. One dashed arrow updates the row back to open. No arrow reaches the counts bar, which stays at "Claimed 2". A warning triangle with "stale" appears beside the counts. | The second arrow starts, fizzles out, and an X glyph appears where it stopped. | "Release patches the row and forgets the count. The page now disagrees with itself, and there's no single place that holds the truth." |
| 4 | 0:36–0:46 | Wipe. Three zones appear left to right: `state` (blue box with 4 cards), `render()` (orange gear), and `the page`. Solid green arrows join state to render() and render() to the page. | Zones slide in. Arrows draw left to right. | "Now the pattern from R2. One state. One render. The page is just its output." |
| 5 | 0:46–0:58 | A click bolt hits the page's Claim button. A green arrow labelled `handler` curves back above the zones to `state` (not to the page). The card for s2 flips from open (hollow circle) to claimed (check mark, `"Ana"`). | The card flips. Then the gear spins once, and the whole page frame dissolves and redraws, rows and counts together. | "The handler changes only the state. Then render() rebuilds everything from it: rows, counts, filter view, all at once." |
| 6 | 0:58–1:08 | Same for Release: the card flips back, the gear spins, and the page redraws with counts "Open 3 · Claimed 1". A check-mark badge "counts correct" appears. | Same motion as scene 5, faster. | "Release does the same. The counts can't go stale, because nothing updates them except render()." |
| 7 | 1:08–1:20 | Inset: one listener icon pinned to the list container, labelled `list.addEventListener("click", …)`. During the redraw the rows dissolve, but the listener stays pinned to the container. Ghost frame on the left: listeners pinned to individual buttons vanish when the rows dissolve. | Side-by-side split. The left buttons dissolve and take their listeners with them (X glyph). The right container stays; its listener persists. | "Because render() replaces the buttons, put one listener on the container and read the button's data-id. That listener survives every render." |
| 8 | 1:20–1:30 | The final loop diagram, held: `click → change state → render() → page`, with a red dashed "page → state" arrow crossed out. | Gentle pulse along the green loop. | "Event, state, render. Never read the truth back out of the page." |

## Interaction variant (optional)

A step-through interactive, built as a single HTML page with no framework, consistent with the course toolkit. Learners click "Claim" or "Release" on a mini board. A side panel shows the `state` array as a live `console.table`-style grid, and a counter shows how many times `render()` has run (mirroring `console.count("render")` from lesson 05). A toggle switches to "patch mode", which uses the anti-pattern so learners can produce the stale count themselves. It can also be exported as an H5P "Course Presentation" with the 8 scenes as slides.

## Production notes

- Build the scenes in Motion Canvas with one reusable `Zone` component for state, render, and page. Scenes 5 and 6 reuse the same timeline at 1.5× speed.
- Keep the shift titles and names consistent with the course fixture: "Food bank sorting", "Van loading", Ana, Ben, "Warehouse B".
- Record the VO separately and align it to scene boundaries. The captions file is generated from the VO column above.
- Provide a static poster frame (scene 8) for the lesson page and print handouts.
- Avoid flashing: the redraw in scenes 5 and 6 is a 250 ms cross-fade, not a flash.
- Respect reduced motion: export a version with cuts instead of tweens for learners who have `prefers-reduced-motion` set, if the player can serve alternates.
