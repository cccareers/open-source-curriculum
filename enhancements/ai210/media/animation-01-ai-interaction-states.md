---
course_id: ai210
media_id: ai210-a01
type: animation-storyboard
title: "Twelve States, One Screen: The AI Interaction State Model"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - ai210-05
  - ai210-04
objectives:
  - Apply interface patterns that suit AI's probabilistic behavior, including latency, uncertainty, and error states
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes
**Misconception:** an AI feature has two states, "loading" and "done", so the screen has one spinner and one result.

**Concept:** the component moves through a small state machine. Idle leads to submitted, then working, then streaming, and the path then branches into seven possible endings: answered-confident, answered-uncertain, multiple candidates, empty, refused, failed, or interrupted. Interrupted can also happen from working or streaming. Every node needs a designed appearance. A fluent wrong answer travels the *same path* as a correct one, which is why "answered" is never shown as a verdict.

This storyboard is also the production brief for the course asset `ai-interaction-states.png` referenced in ai210-05: the final frame (scene 8) is the static diagram.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- **Nodes:** rounded rectangles with a text label inside, always in words. Pre-answer states are on a horizontal "trunk". Endings fan out to the right in a vertical column.
- **Palette (Okabe–Ito, colour-blind safe):** trunk states in blue `#0072B2`; good endings in bluish green `#009E73`; endings that need attention (uncertain, multiple, empty) in orange `#E69F00`; stop endings (refused, failed, interrupted) in vermillion `#D55E00`; neutral text in near-black `#222222` on off-white `#FAFAF7`.
- **Shape redundancy:** each category also has a distinct node outline and a small glyph. Trunk nodes have a solid outline. Good endings have a check glyph. Attention endings have a dashed outline and a triangle glyph. Stop endings have a double outline and a square "stop" glyph. Every category stays distinguishable in greyscale.
- **The token:** a small filled circle labelled "request" that travels along the edges. Its *speed* encodes latency.
- **Mini-screen:** a thumbnail of the draft-reply review screen (from ai210-04) beside the active node, showing what the user sees in that state.
- **Typography:** one sans-serif font. Node labels at a minimum of 28 px at 1080p.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | One node, "Loading", with a spinner; one node, "Done". An arrow between them. Mini-screen shows a spinner. | The token slides from Loading to Done. Then a "?" glyph appears over the Done node. | VO: "Most screens are designed as if an AI feature has two states: loading and done." |
| 2 | 0:08–0:18 | "Loading" and "Done" dissolve. The trunk draws in left to right: Idle → Submitted → Working → Streaming. | Nodes pop in one at a time, each with a soft click sound. | VO: "In reality the request moves through stages. Idle. Submitted, which needs a visible acknowledgement within about a tenth of a second. Working. Streaming." |
| 3 | 0:18–0:30 | The token leaves Idle. At Submitted, the mini-screen flashes the panel border and "Drafting…". At Working, the token **slows**, with a variable-length pause shown by a small ticking ring around the token. | The token's speed varies between runs. It replays twice: once quick (1 s at Working), once slow (5 s at Working, with stage text "Reading the refund policy…" on the mini-screen). | VO: "Working is slow, and slow by a different amount each time. The same click can take one second or twenty, so the wait itself has to be designed." Caption: "Same action. Different wait." |
| 4 | 0:30–0:40 | Streaming node. The mini-screen shows text arriving and Send greyed out with the label "Available when the draft is finished". | Words fill the mini-screen. A "Stop" button pulses once. A dotted edge appears from Working and from Streaming down to a new node: **Interrupted** (double outline, stop glyph). | VO: "While it streams, make it obvious the output isn't finished, and keep Send unavailable. A stop control can interrupt at any time, and whatever was produced is kept." |
| 5 | 0:40–0:58 | From Streaming, six more edges fan out to the ending column: Answered-confident, Answered-uncertain, Multiple candidates, Empty, Refused, Failed (Interrupted is already drawn). | Edges draw one by one. As each ending appears, the mini-screen briefly shows its designed appearance: "Drafted for you — check before sending"; "Check this: the refund window…"; two drafts side by side; "No past replies match this ticket…"; "The assistant does not draft replies about legal claims…"; "Drafting stopped before it finished. Your edits are saved." | VO: "And then it branches. Confident. Uncertain. Several candidates. Nothing found. Refused. Failed. Each of these is a screen someone has to design, or the user gets a spinner that never ends, a blank space, or a browser error." |
| 6 | 0:58–1:12 | The **misconception beat.** Two tokens leave Streaming together: one labelled "correct reply", one labelled "wrong refund window". | Both tokens take the identical edge and land on the identical node, Answered-confident. They look the same: same colour, same shape. A magnifier passes over them and reveals only the label text differs. | VO: "Here's the hard part. A fluent, completely wrong answer travels exactly the same path as a correct one. The system can't always tell them apart, so the screen must never present 'answered' as a verdict. It's a draft to check." Caption: "Wrong answers look like success." |
| 7 | 1:12–1:22 | Answered-confident node gains a small outgoing dashed edge labelled "user rejects" leading off-diagram to "Escape: write it yourself" and "Capture: reason logged". | Edge draws; the label "discovered by the user, not the system" fades in beneath. | VO: "The last state is one the system never sees: answered wrongly. The user discovers it. What the interface owes them is a fast reject, a way to finish the job without the AI, and a record of why." |
| 8 | 1:22–1:30 | The full diagram, static: the trunk (with working split into fast and slow), seven endings, and the user-rejects edge, with a legend (glyph + outline + colour per category). Title: "AI interaction states". | Hold. A subtle zoom out. | VO: "Twelve states, one screen. Fill in the state table before you draw anything." Caption: "ai210-05: Map the states before you draw anything." |

## Interaction variant (optional)
- **Step-through (H5P Course Presentation or a simple HTML page):** each node is a button. Selecting it shows the mini-screen for that state, the ai210-05 table row ("What has happened" / "What the interface must do"), and a text box: "Write your own screen's wording for this state." Learners finish with an exportable state table. The file format can match the `state-table.json` used in ai210-x02, so the same `node --test` check runs on it.
- **Latency scrubber:** a slider for "seconds since click", from 0 to 60. As it moves, the mini-screen shows what should be visible at 0.1 s, 2 s, 10 s, and 60 s, matching ai210-05 Practice step 3.
- Keyboard: every node is reachable with Tab, in order along the trunk and then down the endings. Enter opens the detail, and Escape returns.

## Production notes
- Build the scene 8 frame first and export it at 1920×1080 and 1200 px wide as the `ai-interaction-states.png` lesson asset. Write its alt text from the ai210-05 caption: "The state model of an AI-powered interaction, from idle through generating to answered, uncertain, empty, refused, or failed."
- Keep node names identical to the ai210-05 state table, so learners can match the animation to the table row for row. Note that the course.json asset description includes "multiple candidates" and "interrupted", which the lesson's alt text omits; the animation follows the table.
- The latency variation in scene 3 must be visibly random across the two replays. Do not loop it identically, or the point is lost.
- Use sound only as reinforcement (node clicks), never to carry meaning. The animation must work muted with captions.
- Respect reduced motion in the interactive variant: offer a static step-through with no token movement.
- Estimated effort: about 1.5 days in Motion Canvas for an experienced animator, including the static export.
