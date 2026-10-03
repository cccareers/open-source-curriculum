---
course_id: web102
media_id: web102-a02
type: animation-storyboard
title: "The Defect Lifecycle, Including the Arrows Backwards"
target_runtime: "75 sec"
suggested_tool: "Manim"
related_lessons:
  - web102-05
  - web102-06
objectives:
  - Track a reported defect from report through fix to verification
competency_ids:
  - D4-S1-C02
---

## Concept and misconception it fixes

**Concept:** A reported defect is a tracked unit of work that moves through states: Reported, Triaged, Reproduced, In progress, Fixed, Verified, Closed. Two paths go backward: from Reproduced back to Reported when it cannot be reproduced and needs information, and from Verified back to In progress when the fix fails.

**Misconception:** "Fixed means done", and "a failed verification means the process failed." Learners close their own fixes, and they treat the backward arrows as embarrassing rather than normal. This animation can also stand in for the missing `defect-lifecycle.png` asset listed in course.json.

## Visual language (shapes, colors with color-blind-safe palette, labels)

Okabe-Ito palette. Every state has a text label and an icon, and the two kinds of arrow differ in line style as well as colour.

| Element | Shape / style | Color (hex) | Label |
|---|---|---|---|
| State nodes | Rounded rectangles in a left-to-right line | Outline blue `#0072B2`, white fill | State name + icon (envelope, scales, repeat-arrow, wrench, check-box, double-check, archive box) |
| The defect token | Small card with "#14" | Orange `#E69F00` | `#14 Counts stale after release` |
| Forward transitions | Solid arrows | Bluish green `#009E73` | Who moves it, e.g. "reporter", "lead", "developer" |
| Backward transitions | Dashed, curved arrows below the line | Vermillion `#D55E00` | "needs info", "failed verification" |
| People | Two avatar glyphs, labelled by name | Sky blue `#56B4E9` and reddish purple `#CC79A7` | "Ana (fixer)", "Ben (verifier)" |
| Evidence attachments | Paper-clip glyphs that attach to the token | Black `#000000` | "steps", "commit 9c1e7aa", "verified by Ben" |

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Seven state nodes in a row. The token #14 sits on Reported with a "steps" paper-clip. | Nodes draw in left to right. The token drops onto Reported. | "A defect report is a piece of work with a life of its own." |
| 2 | 0:08–0:16 | The token moves to Triaged. A small severity tag "degraded" attaches. | A solid green arrow draws, labelled "lead". | "Someone assesses how bad it is and who should take it." |
| 3 | 0:16–0:28 | The token moves to Reproduced, but a "?" appears; the developer's first attempt fails. The token travels back along a dashed vermillion arrow labelled "needs info" to Reported. A new clip, "browser + exact values", attaches. Then it moves forward again through Triaged to Reproduced, and the "?" turns into a check mark. | Backward curve below the line, then forward again faster. | "If the developer can't make it happen, it goes back with a specific question, not 'cannot reproduce'. That's normal." |
| 4 | 0:28–0:38 | The token moves to In progress (Ana's avatar attaches), then to Fixed. A clip "commit 9c1e7aa" attaches. | Two green arrows. | "Ana owns it, finds the cause, and commits a minimal fix." |
| 5 | 0:38–0:44 | Ana's avatar reaches toward Verified, and a barrier with "not the fixer" blocks it. | Barrier slides down. Ana's avatar bounces back. | "The person who fixed it doesn't verify it." |
| 6 | 0:44–0:56 | Ben's avatar walks the original steps (three small numbered footprints: 1, 2, 3). On step 3 an X appears: the filtered view still shows a stale count. The token travels the dashed arrow "failed verification" back to In progress, with a new clip, "fails in Claimed filter". | Footprints appear one by one, then the X, then the backward curve. | "Ben follows the original steps. One view still shows the old count. Back to in progress, with the new observation attached. The loop is working." |
| 7 | 0:56–1:06 | Fast replay: In progress → Fixed (a clip "commit b77d012") → Verified (Ben's avatar and "verified by Ben" clip). | Quick green arrows. | "Fixed again, verified by Ben, against the original report." |
| 8 | 1:06–1:15 | The token moves to Closed. The archive box opens and shows the full stack of clips: steps, browser and values, both commits, the failed verification, verified by Ben, and the cause sentence. Both backward arrows stay visible and glow briefly. | The stack fans out, then holds. | "Closed, with the whole record. The backward arrows aren't failures. They're why 'closed' means something." |

## Interaction variant (optional)

A scrubbable timeline (H5P "Interactive Video", or a plain HTML page with a range input). Learners drag through the states. At each node a panel asks "Who moves it forward, and what must be attached first?" before revealing the answer. A branching variant lets the learner choose "close it now" at Fixed. That shows a later scene where the same defect reappears in front of the coordinator, then returns them to the branch point.

## Production notes

- Manim's `Arrow` with `stroke_dasharray`-style dashing (or `DashedVMobject`) for the backward arrows. Keep both backward arrows visible throughout once drawn.
- Use the same defect (#14, stale counts after release), commit hashes, and names (Ana, Ben) as lesson 05 and video web102-v02, so the three pieces of media reinforce each other.
- Export a still of scene 8 as a candidate `defect-lifecycle.png` for lesson 05's image reference.
- No flashing. The glow in scene 8 is a slow, 600 ms opacity rise.
- Provide a reduced-motion export (cuts between key frames) and a text description of all 8 scenes for screen-reader users.
