---
course_id: db200
media_id: db200-a01
type: animation-storyboard
title: "Partition, Quorum, and the Lost Update"
target_runtime: "90 sec"
suggested_tool: "Manim"
related_lessons:
  - db200-03
objectives:
  - Explain the consistency and availability trade-offs described by CAP
competency_ids:
  - D3-S1-C03
---

## Concept and misconception it fixes

Learners treat "eventually consistent" as "slightly delayed but correct." The animation shows a three-replica cluster under a partition two ways: a majority-quorum (CP) cluster refusing writes on the minority side, and a last-write-wins (AP) cluster accepting both writes and silently discarding one. Then it shows why `W + R > N` guarantees that a read overlaps the latest write.

## Visual language (shapes, colors with color-blind-safe palette, labels)

- Replicas: three circles labeled R1, R2, R3, each showing the current value of `order.status`.
- Okabe-Ito palette: value "shipped" **blue #0072B2** with a square badge; value "cancelled" **vermillion #D55E00** with a triangle badge; stale or unknown **grey #999999** with a dashed outline. Shape badges ensure meaning survives without color.
- Network links are solid lines; a partition is a thick black zigzag with the label "partition".
- Error responses: an "✕ ERROR" text tag. Success: "✓ OK".

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | R1, R2, R3 in a triangle, all showing "pending". | Replication pulses travel along links. | "Three replicas of one order. Normally every write reaches all of them." |
| 2 | 8s | Zigzag cuts R3 off from R1 and R2. | Links to R3 snap. | "A partition. All three replicas are alive. R3 just can't reach the others." |
| 3 | 15s | CP mode banner "majority required (2 of 3)". Client West writes "cancelled" to R3. | R3 can't gather a majority; returns "✕ ERROR". Client East writes "shipped" to R1; R1+R2 acknowledge, "✓ OK". | "CP: a write needs two of three. The majority side succeeds. The isolated replica refuses. One client gets an error, and nobody gets wrong data." |
| 4 | 6s | Partition heals. R3 copies "shipped" from R1. | R3 turns blue with a square badge. | "When the link heals, R3 catches up. No conflict to resolve." |
| 5 | 18s | Reset. AP mode banner "any replica accepts writes, last-write-wins". Same two writes. | Both return "✓ OK". R1/R2 show "shipped" (t=10:00:01), R3 shows "cancelled" (t=10:00:02). | "AP: both writes succeed. Each side now tells its own clients a different story." |
| 6 | 12s | Partition heals. Timestamps compared. | "shipped" fades out on R1 and R2, replaced by "cancelled". A small ghost of "shipped" drifts off-screen labeled "discarded". | "On reconnect, the later timestamp wins. The shipped update is silently gone. Nobody saw an error. The customer's order is just wrong." |
| 7 | 15s | Quorum view: N=3, W=2 highlights R1+R2 on a write; R=2 highlights R2+R3 on a read. | The overlapping replica R2 pulses. | "Why W plus R greater than N works: any two-replica write and any two-replica read must share at least one replica. That replica has the latest value." |
| 8 | 8s | Text card: "AP doesn't mean nothing goes wrong. It means nothing tells you." | Fade. | "Choose per operation which failure your business can live with." |

## Interaction variant (optional)

A stepper where the learner sets N, W, R with sliders and toggles the partition. The visualization shows whether writes and reads succeed on each side and whether a read can return stale data, so `W=2, R=1` visibly fails the overlap check.

## Production notes

- Timestamps in scene 5 make last-write-wins concrete. Add a footnote that clock drift can make the "later" write the wrong one.
- Scene 3 reflects a MongoDB-style majority replica set; scene 5 reflects Cassandra-style defaults at `ONE`. Keep product names out of the animation itself, because the behavior depends on configuration.
- Manim's `Circle`, `Line`, and `Transform` cover every scene. Export at 1080p with captions as WebVTT.
