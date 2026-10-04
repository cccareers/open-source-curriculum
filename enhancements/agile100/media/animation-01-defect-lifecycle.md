---
course_id: agile100
media_id: agile100-a01
type: animation-storyboard
title: "The Defect Lifecycle: Why Fixed Is Not Closed"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - agile100-07
objectives:
  - Track defects from discovery through verified closure
competency_ids:
  - D2-S1-C04
  - D2-S1-C01
  - D3-S1-C05
---

## Concept and misconception it fixes

A defect moves through states: New, Confirmed, In Progress, Fixed, Verified, Closed, with a Reopened loop when verification fails. The misconception: "Fixed" means done. Learners (and many teams) jump from the developer's "should be fixed now" straight to Closed. The animation shows a ticket card physically travelling the pipeline, being blocked at the Verified gate until the original repro steps are re-run, and bouncing back through Reopened once. It also shows the "Age" counter ticking, so learners see a stalled defect as something visible rather than invisible.

## Visual language

- **Ticket card:** a rounded rectangle labelled "BUG-150 Guest checkout 500" with a small Age counter ("Age: 0d") in the top-right corner.
- **States:** six labelled stations on a horizontal track, left to right: New, Confirmed, In Progress, Fixed, Verified, Closed. Reopened is a station on a lower track with a curved arrow back to In Progress.
- **Palette (Okabe-Ito, color-blind safe):**
  - Track and neutral stations: grey `#999999`
  - QA-owned transitions (Confirmed, Verified, Closed): blue `#0072B2`
  - Developer-owned transitions (In Progress, Fixed): orange `#E69F00`
  - Reopened / failure: vermillion `#D55E00`
  - Passing check mark: bluish green `#009E73`
- **Never color alone:** QA-owned stations also carry a magnifying-glass icon; developer-owned stations carry a wrench icon; Reopened carries a circular-arrow icon and a dashed outline. Pass is a check mark, fail is an X.
- **Labels:** sans-serif, minimum 28 px at 1080p, high contrast on a white background.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 6s | Empty track with six stations and the lower Reopened station. Title "Fixed is not Closed." | Stations fade in left to right. | "Every defect has a life. Here's the one most teams cut short." |
| 2 | 8s | BUG-150 card appears at New. Small "repro steps" sheet attached to the card (3 numbered lines). | Card drops in; steps sheet unfolds. Age shows "0d". | "QA files BUG-150 with exact steps: logged out, add item, Place Order, 500." |
| 3 | 8s | Card at Confirmed (blue, magnifying glass). A second QA avatar runs the steps; X icon shows the failure reproduced. | Card slides right; magnifier sweeps over steps. | "Before anyone spends time on a fix, the repro is confirmed. Otherwise a developer may chase something that's really user error or a one-off environment problem." |
| 4 | 8s | Card at In Progress (orange, wrench). Owner tag "@dev-han" attaches. Age ticks to "1d". | Card slides; wrench rotates; Age counter increments. | "Triage sets severity, priority, and an owner. Now it's in progress." |
| 5 | 8s | Card at Fixed (orange). Speech bubble from developer: "Should be fixed now." A ghost "shortcut" arrow tries to jump straight to Closed. | Ghost dashed arrow extends toward Closed, then is stopped by a gate that drops at Verified with a lock icon. | "The developer says it's fixed. The tempting shortcut is straight to Closed. That gate exists for a reason." |
| 6 | 10s | At the Verified gate, QA re-runs the original 3 repro steps. Step 3 shows an X: still 500 for guests using a saved address. | Steps tick one by one: check, check, X. Gate stays closed. | "Verification means re-running the original steps, plus nearby paths. Here, one variant still fails." |
| 7 | 8s | Card drops to Reopened (vermillion, dashed outline, circular arrow), then curves back to In Progress. A note attaches: "Still fails with saved address; see attempt 2." Age ticks to "2d". | Card arcs down, then back up along curved arrow. | "So it's reopened, with the same rigor as the original report: what was tried, what still fails, and anything new." |
| 8 | 8s | Card returns to Fixed, then Verified. All steps plus a regression row ("logged-in checkout") show check marks. Gate lifts. | Steps tick green-check; gate rises. | "Second fix. Original steps pass. A quick regression on logged-in checkout passes too. Now it's Verified." |
| 9 | 6s | Card slides to Closed (blue). Age freezes at "2d". | Card settles; subtle pulse. | "Closed only after verification, not on the developer's word." |
| 10 | 10s | Zoom out to a tracking table (ID, Title, Severity, State, Owner, Age) with BUG-142 Verified 3d, BUG-150 Closed 2d, and a new row BUG-163 Critical In Progress, Age "4d" with a flag icon. | Table rows slide in; the 4d cell pulses with a flag icon. | "And keep watching the Age column. A Critical stuck In Progress for four days is something to raise in standup, even if nobody asked." |

Total: 80 seconds.

## Interaction variant

Build as a step-through (H5P "Course Presentation" or a simple web page with Next/Back): at scene 5 the learner chooses "Close it" or "Verify it". Choosing Close shows a short consequence frame (customer support ticket "Still can't check out as guest") and returns them to the choice. At scene 6 the learner can drag each repro step onto Pass or Fail before the result is revealed.

## Production notes

- Keep the card text identical to the Lesson 07 worked example (BUG-150, guest checkout 500, @dev-han) so learners recognise it.
- The "saved address" variant in scene 6 is an invented detail for the animation; it does not appear in the lesson. Keep it, or swap to any plausible variant the course owner prefers.
- BUG-163 in scene 10 is a new, fictional ID chosen not to collide with IDs used in the lessons (142, 150, 151, 155, 160).
- Export captions as `.vtt`. The VO script above doubles as the transcript.
- Respect reduced-motion: provide a static poster version (all states with the card's path drawn as a numbered line) for learners who disable animation.
