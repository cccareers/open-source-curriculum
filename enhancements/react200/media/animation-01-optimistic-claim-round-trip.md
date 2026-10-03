---
course_id: react200
media_id: react200-a01
type: animation-storyboard
title: "The Optimistic Round Trip"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - react200-04
  - react200-05
objectives:
  - Manage application state in a central store
  - Handle asynchronous work and side effects in a state container
competency_ids:
  - D5-S1-C02
  - D2-S1-C04
---

## Concept and misconception it fixes

The one-way Redux cycle (component → dispatch → middleware → reducer → store → selector → component) is described in lesson 04 and shown as a static diagram (`redux-data-flow.png`). Learners then meet thunks in lesson 05 and form two misconceptions this animation targets:

1. **"The thunk changes the state."** It does not. A thunk only dispatches plain actions; reducers still make every change. The animation shows the thunk *beside* the cycle, emitting actions into it, never touching the store.
2. **"Optimistic means the server is skipped."** It does not. The request still happens; the UI simply does not wait for it. The animation runs the request in parallel with the UI update, then shows the rollback when the server says 409.

## Visual language (shapes, colors with color-blind-safe palette, labels)

Palette: Okabe–Ito, which is distinguishable under the common forms of color-vision deficiency. Every color is paired with a shape and a text label, so no meaning depends on color alone.

| Element | Shape | Color | Label |
|---|---|---|---|
| Component (`ShiftClaimPanel`) | Rounded rectangle with a button inside | Blue `#0072B2` | "ShiftClaimPanel" |
| Plain action object | Small envelope | Orange `#E69F00` | Type string written on the envelope, e.g. `claimShift/pending` |
| Thunk | Hexagon outside the main loop | Reddish purple `#CC79A7` | "claimShift thunk" |
| Middleware | Gate (two posts) on the loop | Black `#000000` outline | "middleware" |
| Reducer | Gear | Bluish green `#009E73` | "shifts reducer" |
| Store | Cylinder | Sky blue `#56B4E9` | "store" with a visible `byEventId` table |
| Network request | Dashed line with a travelling dot | Black dashed | "POST /api/events/12/shifts" |
| Server | Server rack icon | Grey `#7F7F7F` | "API" |
| Error / rejection | Envelope with a diagonal stripe pattern and a "!" glyph | Vermillion `#D55E00` | `claimShift/rejected` |
| Pending entry in store | Row with a dotted outline and an hourglass glyph | Yellow `#F0E442` fill with black text | `12: { pending: true }` |

Background white; all text black at ≥ 24 px equivalent; line weights ≥ 3 px. The loop runs clockwise and is drawn as a circle with arrowheads so direction is readable without motion.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | The loop, empty: component (top), middleware gate (right), reducer gear (bottom), store cylinder (left), selector arrow back to component. Store table shows one row: `14: { role: "general" }`. Badge on component: "My shifts (1)". | Loop draws itself clockwise; labels fade in at each stop. | "Every state change in Redux goes one way around this loop." |
| 2 | 0:08–0:16 | Component button reads "Claim a shift" for event 12. Cursor presses it. A purple hexagon (thunk) appears outside the loop, connected to the component by a thin line. | Button press ripple; hexagon pops in. | "Clicking claim dispatches a thunk. A thunk is a function, so the middleware hands it off instead of passing it to the reducer." |
| 3 | 0:16–0:28 | The hexagon emits an orange envelope `claimShift/pending` carrying `meta.arg: { eventId: 12, role: "general" }`. The envelope travels through the gate to the gear. | Envelope slides along the loop; the gear turns once. | "The thunk's first move is a plain action: pending. It carries the argument you dispatched — event 12." |
| 4 | 0:28–0:36 | Store table gains a yellow, dotted-outline row with an hourglass: `12: { pending: true }`. Selector arrow lights; component button changes to "Claiming…" (disabled); badge to "My shifts (2)". | Row slides in; button label cross-fades. | "The reducer writes a pending entry. The selector sees it, and the volunteer sees the claim immediately." |
| 5 | 0:28–0:44 (overlaps 3–4) | Simultaneously, from the hexagon, a dashed line with a moving dot travels right toward the grey API rack. A small clock icon on the line ticks. | Dot moves slowly; clock hand sweeps. | "At the same time, the real request is on its way. Optimistic doesn't skip the server — it just doesn't wait for it." |
| 6 | 0:44–0:52 | The dot reaches the API; the rack shows "409 Event full". A dot returns along the dashed line to the hexagon. | Return dot; rack flashes "409" text (no color-only flash; text appears). | "The server says no. Event 12 is full." |
| 7 | 0:52–1:04 | Hexagon emits a vermillion, striped envelope with "!" glyph: `claimShift/rejected`, payload "That shift is no longer available.", `meta.arg: { eventId: 12 }`. It travels the loop to the gear. | Envelope slides; gear turns. | "So the thunk dispatches a second plain action: rejected. It carries the message, and the same argument — so the reducer knows which entry to undo." |
| 8 | 1:04–1:14 | Store: the yellow row for 12 slides out and disappears; a new field `lastError: "That shift is no longer available."` appears. Component: button returns to "Claim a shift"; an alert box with a "!" icon and the message appears beneath it; badge returns to "My shifts (1)". | Row exits; alert slides down. | "The reducer deletes the pending entry and records why. The badge goes back to one. The volunteer is told what happened." |
| 9 | 1:14–1:24 | Freeze. Three callouts with leader lines: on the hexagon "Only dispatches"; on the gear "Only place state changes"; on `meta.arg` in both envelopes "Same argument on every lifecycle action". | Callouts draw on one by one. | "Three things to remember. The thunk only dispatches. The reducer is the only thing that changes state. And meta dot arg is how the rollback knows what to undo." |
| 10 | 1:24–1:30 | Fade to the end card: "Try it: lesson 05, practice step 9 — make event 12 reject." | Fade. | "Now break it yourself on event 12." |

## Interaction variant (optional)

Build as a step-through (Motion Canvas exported to an HTML player with scene markers, or an H5P "Course Presentation") with three controls:

- **Step** advances one action at a time, so learners can predict the next envelope before seeing it.
- **Server response toggle** — "201 Created" or "409 Event full" — branches at scene 6. With 201, scene 7 shows a blue-green `claimShift/fulfilled` envelope and the yellow row turning solid with `claimedAt` added and the hourglass removed.
- **"Remove the delete line"** toggle replays scene 8 with the rollback bug from lesson 08: the yellow row stays and the badge stays at 2. Ask: "Which line is missing from the rejected handler?"

## Production notes

- Envelope labels use the exact action type strings Redux DevTools shows (`shifts/claimShift/pending`, etc.); abbreviate to `claimShift/pending` on the envelope only if space requires, and show the full string in the caption.
- Keep the loop geometry identical to `redux-data-flow.png` (course asset list in `course.json`) so the static diagram and the animation reinforce each other; the thunk hexagon is the only new element.
- Scenes 3–5 overlap deliberately; this overlap *is* the optimistic idea. Do not serialize them for simplicity.
- Provide captions and an audio-described track; the described track should name each envelope's type and payload aloud.
- Respect `prefers-reduced-motion` in the interactive variant: replace slides with cross-fades and keep the step control.
- Runtime fits a 90-second slot; if trimmed, cut scene 9's callouts to on-screen text without VO, never scenes 5–8.
