---
course_id: ai201
media_id: ai201-a02
type: animation-storyboard
title: "The Funnel Must Balance"
target_runtime: "75 sec"
suggested_tool: "Manim"
related_lessons:
  - ai201-04
  - ai201-11
objectives:
  - Build a workflow that ingests, cleans, and routes business data without manual handling
  - Diagnose an automation failure from logs and execution history and repair the underlying cause
competency_ids:
  - D3-S1-C01
  - D3-S1-C05
---

## Concept and misconception it fixes

Misconception: "Every run is green, so the pipeline is working." A silently dropped record leaves no failed run, no error, and no ticket. The only place it shows up is the arithmetic: records in must equal records out across every terminal bucket. The animation makes the reconciliation identity from lessons 04 and 11 visible, then replays lesson 11's postmortem: a renamed source field silently pushes requests into the `triage_review` bucket. In that version the funnel still balances but changes shape, which is why lesson 11 asks you to chart the shape as well as the totals.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- **Records**: small circles flowing left to right through stage gates labeled `ingest`, `normalize`, `validate`, `dedupe`, `enrich`, and `route`.
- **Terminal buckets**: three containers at the right, labeled `routed`, `duplicate`, and `quarantined`. Each has a distinct fill pattern (solid, diagonal hatch, dots) and its label.
- **Counter rail**: running counts at the top, `received = routed + duplicate + quarantined`, with the equality sign shown as `=` when balanced and as a struck-through `≠` when not.
- **Palette** (Okabe-Ito): records sky blue `#56B4E9`; routed bluish green `#009E73`; duplicate yellow `#F0E442` with a dark outline; quarantined vermillion `#D55E00`; a "lost" record is a hollow grey outline. Patterns and labels carry the meaning without color.
- **Execution-history strip** at the bottom: a row of run icons, each with a check mark or a cross.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0-10s | Pipeline stages appear in order. 100 circles enter `ingest`. The counter rail reads `received 100`. | Circles stream in. | "A batch of 100 intake rows enters the pipeline from lesson 04." |
| 2 | 10-24s | Circles flow through. 5 peel off at `dedupe` into `duplicate`, 6 at `validate` into `quarantined`, and 89 reach `routed`. The rail reads `100 = 89 + 5 + 6`, and the `=` glows. | Circles split at the gates; the counters tick up. | "Every record lands somewhere you can see and count. 89 routed, 5 duplicates, 6 quarantined. A hundred in, a hundred out." |
| 3 | 24-38s | Replay with a bug: a filter after `validate` drops 4 circles, which fade into hollow outlines and vanish. The execution strip shows all green checks. The rail reads `100 ≠ 85 + 5 + 6`. | The four circles fade out; the `≠` pulses with a strike mark. | "Now a filter quietly drops four. Every run is still green. Nothing failed, so nothing alerted. The only evidence is that the numbers stop adding up." |
| 4 | 38-46s | Zoom on the `≠`. Caption box: "Missing: 4. Find the gap before anything else." | Camera push-in. | "The reconciliation count is your alarm. If it doesn't balance, you have a bug, even when the dashboard is green." |
| 5 | 46-64s | New day, lesson 11 incident. The source renames `request_type`. The totals balance (`100 = 100 + 0 + 0` at the route stage), but inside `routed` a sub-bar for `triage_review` jumps from 8% to 100%. A weekly bar chart beside it shows the triage share spiking. | The sub-bar grows; the weekly chart adds a tall bar. | "A balanced funnel can still be wrong. In lesson 11's incident every request fell back to 'other' and went to triage review. The totals balanced. The shape didn't. So chart the shape every week. Your eye catches a change faster than any threshold does." |
| 6 | 64-75s | Summary card: Count every stage. Balance in = out. Chart the shape. Alert on absence. | Items appear in sequence. | "Count it, balance it, chart it. That's how a silent failure becomes a loud one." |

## Interaction variant (optional)

A scrubbable timeline with a "bug" dropdown: none, silent filter, renamed field, or duplicate-key race. Each option replays the flow and shows which detector would fire (reconciliation, shape chart, absence alert, or none). Learners predict the detector before pressing Play. This works as an H5P interactive video with a question at scene 3 ("Which number tells you something is wrong?").

## Production notes

- Counts are illustrative but must reconcile on screen exactly. Script them as constants, not random draws.
- Use the stage names exactly as lesson 04 writes them (`ingest`, `normalize`, `validate`, `deduplicate`/`dedupe`, `enrich`, `route`). The on-screen label may abbreviate `deduplicate` to `dedupe` for width. Say "deduplicate" in the voiceover.
- Lesson 04 lists six reconciliation counts (`received`, `normalized`, `valid`, `quarantined`, `duplicate`, `routed`). This animation simplifies to the terminal identity. A caption in scene 2 should note that the intermediate counts are logged too.
- Lesson 04 quarantines model-output parse failures at `enrich`. If scene 2 is extended, send one circle from `enrich` into `quarantined` to show that quarantine can happen at more than one stage.
