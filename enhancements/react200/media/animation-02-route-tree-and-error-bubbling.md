---
course_id: react200
media_id: react200-a02
type: animation-storyboard
title: "Outlets, Parallel Loaders, and Where the Error Lands"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - react200-03
objectives:
  - Compose nested routes and layouts around shared data
competency_ids:
  - D2-S1-C04
  - D5-S1-C02
---

## Concept and misconception it fixes

Lesson 03 asks learners to hold three invisible things in their heads at once: which outlet each matched route fills, that loaders for a matched tree run in parallel, and how far up the tree a thrown error travels before something catches it. The static asset `route-tree-and-outlets.png` covers the first. This animation adds the other two and fixes these misconceptions:

1. **"Loaders run parent first, then child."** They run at the same time for the matched routes.
2. **"An error element on a layout keeps that layout on screen."** The catching route's own element is replaced; only routes *above* it stay mounted. To keep a section's chrome, catch the error one level lower (a pathless child route).

## Visual language (shapes, colors with color-blind-safe palette, labels)

Okabe–Ito palette. Each color is paired with a shape or pattern and a text label.

| Element | Shape | Color | Label |
|---|---|---|---|
| Route node (tree, left half of frame) | Rounded rectangle | Blue `#0072B2` outline, white fill | Path segment, e.g. `events`, `:eventId`, `(pathless)` |
| Matched route | Same, filled | Sky blue `#56B4E9` fill | Plus a check-mark glyph |
| Screen region (right half) | Nested rectangles (browser mock) | Thin black outline | Element name: `RootLayout`, `EventsLayout`, `EventDetail` |
| Outlet | Dashed rectangle inside a layout | Black dashed | "Outlet" |
| Loader | Progress bar attached under a node | Orange `#E69F00` | `venueLoader`, `eventDetailLoader` |
| Thrown error | Diamond with "!" glyph and diagonal stripes | Vermillion `#D55E00` | "404" |
| Error element | Rectangle with a "!" icon and stripes | Vermillion `#D55E00` outline | `RouteError` |
| "Stays mounted" | Solid outline plus padlock glyph | Bluish green `#009E73` | "stays" |

Tree on the left and screen on the right are linked: each node has a thin leader line to the screen region it renders. Text ≥ 24 px; white background.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:10 | Left: tree `/` → `events` → `(index)`, `new`, `:eventId`. Right: empty browser mock with URL bar. | Tree grows top-down. | "A nested route table is a tree. The URL picks a path through it." |
| 2 | 0:10–0:22 | URL bar types `/events/42`. Nodes `/`, `events`, `:eventId` fill sky blue with check marks. Right: `RootLayout` rectangle appears; its dashed outlet receives `EventsLayout`; that outlet receives `EventDetail`. Leader lines connect each node to its box. | Boxes nest one into the next, like drawers. | "Each matched route renders inside its parent's outlet. Root, then events, then the detail page." |
| 3 | 0:22–0:34 | Rewind URL to blank and retype `/events/42`. Orange bars appear under `events` (`venueLoader`) and `:eventId` (`eventDetailLoader`) at the same instant and fill side by side; a vertical "start" line runs through both bars' left edges. Screen boxes stay grey until both bars are full, then render. | Bars fill in parallel at different speeds; screen renders when the slower one completes. | "Before rendering, the router runs the loaders for every matched route — at the same time, not one after another." |
| 4 | 0:34–0:42 | Inset: two `useEffect` boxes stacked; the child's bar cannot start until the parent's is full (staircase). Label: "effects: sequential". Beside it, the parallel bars from scene 3, label: "loaders: parallel". | Side-by-side comparison. | "Fetching in effects is a staircase, because a child can't mount until its parent has rendered." |
| 5 | 0:42–0:52 | URL changes to `/events/9999`. `eventDetailLoader` bar turns into a vermillion striped diamond "404" that lifts off the `:eventId` node. Only the root has an error element (a small "!" badge on `/`). The diamond travels up: `:eventId` (no badge) → `events` (no badge) → `/` (badge). | Diamond moves up the tree, pausing at each node; a "no catcher" cross mark appears at the first two. | "The detail loader throws. The error climbs the tree looking for the nearest error element." |
| 6 | 0:52–1:00 | Caught at `/`. Right: the whole `RootLayout` box, including header and nav, is replaced by a `RouteError` box. | Replacement wipe from the root box outward. | "The root caught it — so the root's own element is replaced. Header and nav are gone." |
| 7 | 1:00–1:08 | Reset. Add a "!" badge to `events`. Repeat the climb: the diamond stops at `events`. Right: `RootLayout` keeps a green padlock "stays"; the `EventsLayout` box — including its "Events" heading — is replaced by `RouteError` inside the root outlet. | Climb is shorter; wipe is smaller. | "Catch it at the events route, and everything above it stays. But the events layout itself is replaced — its heading goes too." |
| 8 | 1:08–1:16 | Reset. Insert a `(pathless)` node between `events` and its children and give it a "!" badge. `events` keeps its own badge, now drawn smaller and labelled "fallback". The diamond climbs one step and stops at `(pathless)`. Right: `RootLayout` and `EventsLayout` both show green padlocks; only the inner `EventDetail` area is replaced by `RouteError`. | Smallest wipe. | "Catch it on a pathless child, and only the panel is replaced. The rule: the catching route's element is what gets swapped out." |
| 9 | 1:16–1:20 | End card text: "Highest route that needs the data, lowest that can have it. Catch errors just above what you're willing to lose." | Fade. | "Put data as high as it's needed, and catch errors just above what you're willing to lose." |

## Interaction variant (optional)

A scrubbable explorer (Motion Canvas or a small React page with the same SVG):

- Learners toggle error-element badges on any node and pick a failing loader; the player animates the climb and the replacement, then asks "Which boxes survived?" before revealing.
- A URL field accepts `/events`, `/events/new`, `/events/42`, `/about` and re-runs scenes 2–3 for that path, showing which loaders fire.
- Keyboard: Tab between nodes, Space toggles a badge, Enter runs the failure.

## Production notes

- Tree and screen must match the route table in lesson 03 and `video-02-where-the-error-lands.md` (Code D), including the pathless child.
- Keep the left/right linkage visible throughout; the leader lines are what turn the tree into the screen.
- Scene 7 is the correction of a common misconception (and of an earlier wording in lesson 03, fixed in this pass); hold it for a full beat before scene 8.
- Captions and an audio-described track; the described track names each replaced region and each surviving region aloud.
- Respect `prefers-reduced-motion` in the interactive version: replace the climb with a sequential highlight and the wipes with cross-fades.
