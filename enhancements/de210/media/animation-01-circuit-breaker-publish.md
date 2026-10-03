---
course_id: de210
media_id: de210-a01
type: animation-storyboard
title: "Build, Gate, Swap: How a Circuit Breaker Keeps Bad Data Away from Consumers"
target_runtime: "75 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - de210-06
objectives:
  - Add validation gates that stop bad data before it reaches a consumer
competency_ids:
  - D2-S1-C03
  - D2-S1-C01
---

## Concept and misconception it fixes

Misconception: "if a test fails, the pipeline stops, so consumers are safe." When tests run after models are built in place, the consumer-facing table already contains the bad data by the time the test fails. A circuit breaker separates *build* from *publish*: build into a candidate relation, gate it, and swap it into the consumer-facing name only on success.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Tables as stacked-row cards with a name tag (`marts.fct_orders`, `candidate.fct_orders`).
- Good rows: solid blue (#0072B2) with a check glyph. Bad rows: orange (#E69F00) with an exclamation glyph — glyphs carry the meaning, color reinforces.
- Gates as turnstiles labelled "unique", "volume", "reconcile".
- Consumer: a dashboard icon labelled "Finance, 07:00".
- A clock top right.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Dashboard reads from `marts.fct_orders` (all good rows). Clock 02:00. | A thin line connects dashboard to table. | "Finance reads fct_orders every morning." |
| 2 | 12s | Naive design: the nightly build writes directly into `marts.fct_orders`; a batch with duplicate rows (orange) flows in. Tests run after. | Orange rows slide into the live table; a test turnstile turns red afterwards. | "In the naive design, models build in place and tests run afterwards. By the time the test fails, the bad rows are already live." |
| 3 | 8s | Dashboard at 07:00 shows revenue doubled; a red alert arrives late. | Number on dashboard jumps. | "Finance sees double revenue. The failure was caught, just too late." |
| 4 | 10s | Rewind. New design: build arrow points to `candidate.fct_orders`, a separate card. Live table untouched. | Build fills candidate card. | "Circuit breaker: build into a candidate table instead." |
| 5 | 12s | Candidate passes through three turnstiles. The "unique" turnstile stops; orange duplicates are highlighted with their order_ids listed. | Turnstile locks; rows listed in a side panel. | "Gates run against the candidate. The uniqueness gate fails and shows exactly which keys are duplicated." |
| 6 | 8s | `publish_swap` arrow stays grey and dashed; the live table keeps its previous good rows. Dashboard at 07:00 shows yesterday's correct number with a small "data as of 03-04" note. | Clock advances; nothing changes on the live table. | "Publish never runs. Consumers stay on the last known-good data. Late, but right." |
| 7 | 10s | Next night: candidate built cleanly; all turnstiles green; swap arrow animates; live table replaced atomically in one step. | Cards swap places in a single motion. | "When every gate passes, publish swaps the candidate in as one atomic step. Consumers never see a half-built table." |
| 8 | 7s | Summary: `build_candidate >> run_quality_gates >> publish_swap`. | Code line types out. | "Build. Gate. Swap. Three tasks, and a failed check costs a morning instead of the organisation's trust." |

## Interaction variant (optional)

A step-through where the learner toggles which gate fails (none, unique, volume, reconcile) and chooses the consequence (block, quarantine, warn). The live table and dashboard update to show what consumers see in each case, reinforcing the "choose the consequence in advance" section of lesson 6.

## Production notes

- Use real names from the course DAG (`build_candidate`, `run_quality_gates`, `publish_swap`) so the animation maps directly onto lesson 6 practice item 9.
- In scene 7, add a footnote: "Swap atomicity depends on the warehouse (e.g., table rename or `CREATE OR REPLACE` in a transaction); verify on yours." This mirrors the lesson's instruction to record whether the swap is atomic.
