---
course_id: ai210
media_id: ai210-a02
type: animation-storyboard
title: "Calibration, Not Trust"
target_runtime: "70 sec"
suggested_tool: "Manim"
related_lessons:
  - ai210-06
objectives:
  - Design AI-powered interfaces for trust, transparency, and accessibility, including disclosure and correction paths
competency_ids:
  - D4-S1-C03
---

## Concept and misconception it fixes
**Misconception:** the goal of AI interface design is to maximize user trust, so more trust means a better design.

**Concept (from ai210-06):** the target is *calibration*: a user's confidence in an output should track how reliable that output actually is. Over-trust looks like adoption until an error reaches a customer. Under-trust looks like rejection, because checking everything erases the time saved. Disclosure, transparency, and correction are the design levers that move users toward the calibration line.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- **Main chart:** a square plot. The x-axis is "How reliable this output actually is" (low to high). The y-axis is "How much the user relies on it" (low to high). A diagonal reference line is labelled "Calibrated", in solid near-black `#222222`.
- **Outputs:** each output is a dot, plotted at its true reliability (x) and the operator's reliance (y). Dots are drafted replies from the course's support-team example.
- **Regions:** above the diagonal is shaded orange `#E69F00` with a diagonal hatch, labelled "Over-trust". Below it is shaded sky blue `#56B4E9` with a dot pattern, labelled "Under-trust". Both are distinguished by pattern and label as well as hue (Okabe–Ito palette).
- **The wrong-refund-window draft:** a dot with a hollow ring and the label "wrong refund window".
- **Lever icons:** three labelled pills that slide in from the right: "Disclosure", "Sources one click away", "Reject beside Send".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0:00–0:08 | A single dial labelled "Trust", with the needle at the bottom. | The needle sweeps to maximum. A "goal?" tag wobbles, then is crossed out with a strikethrough line. | VO: "It's tempting to make the goal 'more trust'. That's the wrong dial." |
| 2 | 0:08–0:18 | The dial morphs into the plot. The axes draw, then the diagonal labelled "Calibrated". | The axes extend, and the diagonal draws from the bottom-left to the top-right. | VO: "The real target is calibration. How much people rely on an output should match how reliable it actually is. The ideal is this line." |
| 3 | 0:18–0:32 | ~20 dots appear, all clustered near the top: high reliance regardless of reliability. Over-trust region fills in with hatch. The hollow-ring "wrong refund window" dot sits top-left: low reliability, high reliance. | Dots drop in and settle high. The ring dot pulses once. A small envelope icon detaches from it and flies off-frame toward a label "Customer". | VO: "Over-trust looks like adoption. Every draft gets sent, sources are never opened, and review becomes a rubber stamp. Until the wrong refund window goes out, and the company has to honour it." |
| 4 | 0:32–0:44 | Reset. Now dots cluster near the bottom: low reliance even on reliable drafts. Under-trust region fills with dots. A small stopwatch icon above them spins fast. | Dots settle low. The stopwatch shows the minutes adding up. | VO: "Under-trust looks like rejection. Operators recheck every draft against the policy, which takes longer than writing it, and they quietly go back to doing it by hand." |
| 5 | 0:44–0:60 | Reset to the scattered over-trust cluster. The three lever pills slide in one at a time. | With each pill, dots move toward the diagonal. "Disclosure": the dot cloud shifts slightly. "Sources one click away": low-reliability dots drop noticeably. "Reject beside Send": the ring dot drops into the under-diagonal band, and a tick appears beside it with the label "caught". | VO: "Design moves the dots. Disclosure tells people a machine was involved. Sources one click away let them check the specific line. A Reject button as easy as Send makes disagreeing cheap. Together, people rely on good drafts and catch the bad one." |
| 6 | 1:00–1:10 | The dots now hug the diagonal. Question card overlays: "What in this design would tell someone the output is worth checking?" | Hold, slight zoom on the question. | VO: "So ask the question from the trust review. What in your design would make a careful user slow down and check? If the answer is nothing, you've designed for trust, not for calibration." |

## Interaction variant (optional)
An HTML or H5P version with three toggles (Disclosure, Sources, Reject placement) that move the dot cloud. Show the count of "wrong drafts sent" and "minutes spent rechecking good drafts" updating as each toggle changes. Make clear in the UI that the numbers are illustrative, not data. Every toggle is a labelled checkbox reachable by keyboard, and the counters update in a polite live region.

## Production notes
- The dot movements in scene 5 are **illustrative**. Do not show numeric axes or percentages, which would imply a measured study. If the owner wants numbers, source them from a learner's own ai210-07 session data.
- Region labels must stay on screen whenever the shading is visible, so the meaning never depends on hue.
- Keep the support-team example consistent with the course: refund window, sources, Reject beside Send.
- Works muted. All VO is captioned, and each scene has a caption line.
- Estimated effort: about 1 day in Manim, mainly spent tuning the scene 5 easing.
