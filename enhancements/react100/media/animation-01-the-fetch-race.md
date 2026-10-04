---
course_id: react100
media_id: react100-a01
type: animation-storyboard
title: "The Fetch Race"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - react100-07
objectives:
  - Load and display remote data from a component
competency_ids:
  - D2-S1-C04
---

## Concept and misconception it fixes

**Misconception:** "Requests come back in the order I sent them, so the last thing I clicked is what ends up on screen."

**Concept:** Two overlapping fetches can resolve in either order. If every response writes to state, whichever arrives *last* wins, even if it belongs to a selection the member has already left. The fix is that an effect run that is no longer current must not write state: the cleanup sets `ignore = true` (or calls `controller.abort()`), so the stale response is dropped at the door.

This animates the static asset `fetch-race-timeline.png` named in `course.json` and referenced in lesson 07's "Race conditions" section, and adds the fix.

## Visual language (shapes, colors with color-blind-safe palette, labels)

Palette: Okabe-Ito, which stays distinguishable under the common forms of color-vision deficiency. Every color is paired with a text label or shape, so nothing depends on hue alone.

| Element | Shape | Color | Label |
|---|---|---|---|
| Browser (the `ToolDetail` component) | Rounded rectangle, left third of frame | Outline black `#000000`, fill white | "ToolDetail — showing: …" |
| Server | Rounded rectangle, right third | Outline black, fill light grey `#E5E5E5` | "Toolshare API" |
| Request/response for the Drill (`toolId = t-1`) | Circle with a drill glyph | Orange `#E69F00` | "t-1 Drill" |
| Request/response for the Ladder (`toolId = t-3`) | Square with a ladder glyph | Blue `#0072B2` | "t-3 Ladder" |
| Timeline | Horizontal axis across the bottom, ticks every 100ms | Black | "time →" |
| Stale / wrong | Diagonal hatch overlay plus a `✕` icon | Vermillion `#D55E00` | "STALE" |
| Correct / current | Solid outline plus a `✓` icon | Bluish green `#009E73` | "CURRENT" |
| `ignore` flag | Small toggle pill attached to each effect run | Off: white with black text "ignore = false"; On: black with white text "ignore = true" | — |

Typography: one sans-serif face at a minimum of 32px at 1080p; code in a monospace face at 28px or more. Requests and responses differ by shape (circle and square) as well as color, so the animation reads in greyscale.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:06 | Browser box reads "ToolDetail — showing: (nothing)". Server box on the right. Timeline empty. | Boxes fade in. | "A member opens the Drill, then quickly switches to the Ladder." |
| 2 | 0:06–0:14 | At t = 0ms an orange circle "t-1 Drill" leaves the browser. Code inset top-left: ``useEffect(() => { … fetch(`/tools/${toolId}`) … }, [toolId]);`` with `toolId = "t-1"`. | Circle travels slowly toward the server along an upper lane, while a matching orange bar starts growing on the timeline. | "Selecting the Drill runs the effect. Request one goes out." |
| 3 | 0:14–0:22 | At t = 150ms the browser header changes to "showing: Ladder (loading…)". A blue square "t-3 Ladder" leaves along a lower lane. Code inset updates `toolId = "t-3"`. | Square moves quickly. A blue bar starts on the timeline under the orange one. | "One hundred and fifty milliseconds later she picks the Ladder. Request two goes out. Both are now in flight." |
| 4 | 0:22–0:30 | The server box shows two queues. The orange circle is caught in a slow lane labelled "slow replica". The blue square passes straight through. | Orange circle pulses slowly in place; blue square bounces off the server and returns. | "Nothing says they come back in order. The Drill request happens to hit a slow server." |
| 5 | 0:30–0:38 | The blue square arrives at the browser at t = 400ms. The browser updates to "showing: Ladder" with a green `✓ CURRENT` badge. | Square docks into the browser; the badge pops in. The blue timeline bar ends. | "The Ladder response arrives first. The screen shows the Ladder. So far, so good." |
| 6 | 0:38–0:48 | The orange circle finally returns at t = 900ms and docks. The browser switches to "showing: Drill", while the selection highlight in the sidebar still says Ladder. A vermillion hatch and `✕ STALE` cover the panel. | The circle docks with a thud; hatch wipes in left to right. The orange timeline bar ends *after* the blue one, and the two end points are linked by a label: "last to arrive wins". | "Then the Drill response lands and overwrites it. The member asked for the Ladder and is looking at the Drill. No error. Just wrong data." |
| 7 | 0:48–0:52 | Freeze. Text: "Bug: an old effect run wrote state." | Everything dims except the text. | "The bug: an effect run that's no longer current still wrote state." |
| 8 | 0:52–1:02 | Rewind to scene 3. Each request now carries an `ignore` pill: orange has "ignore = false", blue has "ignore = false". At the instant the blue request leaves, a "cleanup" arrow hits the orange run and flips its pill to "ignore = true". Code inset shows the cleanup: `return () => { ignore = true; };` | Quick rewind effect (timeline scrubs backward). The pill flip is a single 200ms toggle animation. | "Replay it with a cleanup. When toolId changes, React runs the old effect's cleanup first. That flips the old run's ignore flag to true." |
| 9 | 1:02–1:12 | Blue arrives first, as before: `✓ CURRENT`. Then orange arrives, reaches the browser's edge, and stops at a door labelled `if (ignore) return;`. It fades out without touching the panel. The panel stays "showing: Ladder ✓". | Orange circle bumps the door, then dissolves. | "The Ladder lands and renders. The Drill still comes back, but its own ignore flag is true, so it returns before touching state. The screen stays correct." |
| 10 | 1:12–1:20 | Split end frame. Left: `ignore` flag, with the caption "drop the stale response". Right: `AbortController`, with the orange circle shown being cut mid-lane and the caption "cancel the stale request". Both captioned "Lesson 07 — Race conditions". | The two halves slide in together. | "Ignoring the result, or aborting the request. Either way, only the current effect run may write state." |

## Interaction variant (optional)

A scrubbable timeline as an H5P Interactive Video or a small React widget. The learner drags a slider to set the Drill response delay (100–1200ms) and toggles "cleanup on/off". With cleanup off, any delay greater than the Ladder's (250ms) produces the stale frame. With cleanup on, it never does. Include a "Predict" step before each run ("Which tool will the screen show?") and reveal the answer afterwards. The widget could reuse the `ToolDetail` code from lesson 07 with a fake `fetch` that resolves after the chosen delay.

## Production notes

- Build in Motion Canvas so the code insets are real, syntax-highlighted code and the timeline can be generated from the two delay values. The same scene file can then produce the interactive variant's frames.
- Hold every state-changing frame (scenes 5, 6, and 9) for at least two seconds so captions can be read.
- Export at 1920×1080, 30fps, with captions as a separate `.vtt` and an audio-described version that narrates shape and position changes ("the orange circle, the Drill request, arrives last").
- Respect reduced motion where the player supports it: offer a version with cuts instead of travel animations.
- The still frame at the end of scene 6 can replace the in-house `fetch-race-timeline.png` asset listed in `course.json`.
- Timings in ms are illustrative; say so in the transcript so no learner takes them as real network figures.
