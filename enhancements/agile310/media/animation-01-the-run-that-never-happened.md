---
course_id: agile310
media_id: agile310-a01
type: animation-storyboard
title: "The Run That Never Happened: Fail Before Publish and Alert on Missing Success"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - agile310-06
objectives:
  - Orchestrate, monitor, and harden the pipeline so it survives a bad run
competency_ids:
  - D1-S1-C03
  - D6-S1-C02
---

## Concept and misconception it fixes

Two misconceptions from Milestone 3: (1) "a failure alert covers outages" — if the schedule is disabled or the trigger never fires, nothing fails, so nothing alerts; only a freshness or missed-run check catches it; (2) "tests protect the analyst" — only if they run *before* the serving layer is published.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Workflow as six boxes left to right: `ingest_trips`, `ingest_zones` (parallel), `stage`, `build_warehouse`, `run_tests`, `publish_serving`.
- Success: blue fill (#0072B2) with a check glyph. Failure: vermillion (#D55E00) with an X glyph. Never ran: dashed outline, grey, with a "–" glyph.
- Analyst icon reading from a "serving" table card on the right. Alert bell icon top right.
- A 24-hour clock ring around the scene.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Normal night: boxes turn blue in order; serving card updates its "as of" date; analyst nods. | Sequential fill. | "A normal night: ingest, stage, build, test, publish. The analyst sees fresh data." |
| 2 | 12s | Bad night, wrong order: `publish_serving` happens before `run_tests`. Tests fail after publish; bell rings, but the serving card already shows a doubled number. | Publish fills, then tests turn red; bell rings. | "Put the tests after publish and they become a smoke detector in an empty house. The alarm is real; the damage is already done." |
| 3 | 10s | Reorder: `run_tests` slides in front of `publish_serving`. Replay the bad night: tests red, publish dashed and grey, serving card keeps yesterday's correct number; bell rings. | Boxes swap; replay. | "Fail before you publish. Now a failing test stops the run, the analyst keeps yesterday's correct data, and someone is told." |
| 4 | 10s | Transient failure: `ingest_trips` turns red, small retry arrows loop with growing gaps (1, 2, 4), then turns blue; no bell. | Retry loop. | "A source blip is absorbed by bounded retries with backoff. No human needed, no alert." |
| 5 | 14s | The quiet outage: the schedule toggle flips off. Clock ring passes 02:00, 06:00, 12:00. All boxes stay dashed grey. Bell stays silent. Serving card "as of" date stops advancing and starts to fade. | Clock spins; nothing else moves. | "Now the worst night. Someone disables the schedule. Nothing runs, so nothing fails, so the failure alert never fires. The data just gets older." |
| 6 | 12s | A separate watchman icon outside the workflow checks "last successful run older than 26h?" at 06:00 next day; bell rings with message "No successful run for window 2026-03-14; expected by 04:00; see runbook §2". | Watchman lifts a lantern; bell rings. | "The fix is a check that lives outside the workflow and asks one question: when did we last succeed? If it's older than the freshness promise, alert." |
| 7 | 8s | Alert message zoomed: run id, stage, window, where to look next. | Text types out. | "Every alert names the run, the stage, the window, and where to look next, so the person covering for you doesn't have to call you." |
| 8 | 6s | Summary card with three icons: shield before publish, retry loop, watchman. | Icons pop in. | "Test before publish. Retry what's transient. Alert on the absence of success." |

## Interaction variant (optional)

A scenario picker (transient source error, failing data test, disabled schedule, hung stage) where the learner first predicts which alert fires (none / failure / missed-run / timeout) and whether the analyst sees bad, stale, or fresh data, then plays the animation to check.

## Production notes

- Stage names should match the learner's Milestone 3 workflow terms in lesson 6 ("ingest each source, then stage, then build the warehouse layer, then run the tests, then publish serving").
- Use "26 hours" from lesson 6's example freshness expectation.
- Explain in the caption of scene 6 why the watchman cannot live inside the workflow it monitors.
