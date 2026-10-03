---
course_id: cse220
media_id: cse220-a01
type: animation-storyboard
title: "Why the Average Lies"
target_runtime: "80 sec"
suggested_tool: "Manim"
related_lessons:
  - cse220-02
  - cse220-04
  - cse220-05
objectives:
  - Choose the signals that tell you whether a cloud service is healthy
  - Analyze logs and metrics to locate a performance bottleneck
competency_ids:
  - D6-S1-C01
  - D1-S1-C03
---

## Concept and misconception it fixes
Learners graph average latency and average per-instance p99s. The animation shows 1,000 requests where 10 take 8 s: the mean (≈130 ms) looks fine while p99 exposes the tail; then shows why averaging per-instance p99s is wrong and summing histogram buckets is right.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Each request is a dot on a horizontal latency axis (log scale, labelled ms).
- Fast requests: small circles #0072B2. Slow requests: larger squares #D55E00 (shape differs, not just colour).
- Mean: dashed vertical line labelled "mean". Percentiles: solid vertical lines labelled "p50", "p95", "p99".
- Histogram buckets: labelled bars with boundaries printed underneath.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 10s | 990 circles pile up around 50 ms. | Dots rain onto axis. | "A thousand checkout requests. Nine hundred and ninety take about fifty milliseconds." |
| 2 | 8s | 10 squares land at 8,000 ms, far right. | Squares drop with a thud. | "Ten take eight seconds." |
| 3 | 8s | Dashed "mean" line slides to ~130 ms. A green "OK" badge appears near a threshold at 500 ms. | Line slides. | "The average is about 130 milliseconds. Under any threshold you'd set. Looks healthy." |
| 4 | 10s | p50 line at 50 ms; p99 line jumps to the squares region. | Lines snap in. | "Percentiles tell the truth. The median is fifty. The p99 lives with the slow ones." |
| 5 | 10s | One user icon makes 20 calls (20 dots highlighted). Probability meter fills to "≈18% saw ≥1 slow call". | Meter animates. | "And if one page makes twenty calls, almost one user in five hits at least one eight-second wait." |
| 6 | 12s | Three instance boxes, each with its own p99 label: 120 ms, 140 ms, 7,900 ms. A wrong calculation "average = 2,720 ms" is crossed out. | Strike-through. | "Now three instances. Averaging their p99s gives a number that isn't the fleet p99 at all. Percentiles don't average." |
| 7 | 14s | Each instance's histogram bars slide down and stack into one combined histogram; fleet p99 line computed from combined buckets. | Bars stack and sum. | "Buckets do add up. Sum the histograms, then take the percentile. That's what histogram metrics are for." |
| 8 | 8s | Summary card: "Graph p50 and p99 together. Aggregate buckets, not percentiles." | Fade. | "Watch the median and the tail together, and aggregate buckets — never percentiles." |

## Interaction variant (optional)
A slider controls how many of the 1,000 requests are slow (0–50); learners watch mean, p95, and p99 move at different speeds. A second toggle switches between "average of p99s" and "p99 of summed buckets".

## Production notes
- Numbers match lesson 02's worked example (990 × 50 ms, 10 × 8 s, mean ≈130 ms); scene 5 uses 1 − 0.99²⁰ ≈ 18%.
- Use a log-scale axis but label it clearly; offer a linear-scale still for comparison.
