---
lesson_id: se305-05
course_id: se305
pathway: technical-sales-representative
title: Dashboards and Reporting
order: 5
kind: lesson
competency_ids:
  - D4-S1-C03
  - D4-S1-C04
objectives:
  - Build a CRM dashboard that answers a stated question rather than displaying
    everything
---

## A dashboard is an answer, not a display

Most sales dashboards are built backwards. Someone opens the report builder, sees a list of available fields, and adds everything that looks interesting. The result is fourteen tiles, none of which anybody has looked at since the week it was built, because no tile is attached to a decision.

Build it forwards instead. Every tile starts as a **decision** you have to make on a repeating cadence, and it earns its place only if it changes what you do.

```text
Decision  ->  Question  ->  Metric  ->  Filter  ->  Threshold  ->  Action
```

Read that chain right to left as a test. If you cannot name the action, delete the tile. If you cannot name the threshold at which you would take that action, you have a chart, not an instrument. If the metric does not answer the question, you have the wrong metric. And if there is no decision at the front, nothing downstream matters.

An example of the chain done properly:

- **Decision:** whether to spend next week prospecting or working existing deals.
- **Question:** does my dated pipeline for this quarter cover the gap at my real win rate?
- **Metric:** coverage — open pipeline dated this quarter, divided by remaining quota.
- **Filter:** my opportunities, open only, close date within the current quarter and not in the past.
- **Threshold:** 4.0x, which is 1 divided by my 25% win rate.
- **Action:** below 4.0x, next week is prospecting.

Six lines. That is a tile specification, and you should be able to write one for every tile on your dashboard before you build anything.

## Choose the cadence before the chart

The second thing a tile needs is a clock. A metric reviewed at the wrong frequency is either noise or news that arrives too late.

| Cadence | What it can answer | What it cannot |
| --- | --- | --- |
| Daily | Did anything break — a deal gone dark, a date passed | Anything about a rate |
| Weekly | Where does my time go next week | Whether a change worked |
| Monthly | Are the trailing-90-day rates moving | Anything about a single deal |
| Quarterly | Did the plan work, what changes next | Anything urgent |

The mistake is almost always reviewing rate metrics too often. Your discovery-to-validation conversion cannot meaningfully change in a week; looking at it weekly means reacting to two or three deals of noise. Put counts and dates on the weekly view and rates on the monthly one.

## The five fields the whole dashboard rests on

This is the point where analytics and record-keeping become the same subject. Every tile you are about to build reads from the opportunity record, and a tile is exactly as true as the field behind it. Five fields carry effectively everything.

| Field | What breaks when it is wrong |
| --- | --- |
| **Stage** | Conversion rates, weighted pipeline, aging, stage-duration benchmarks |
| **Amount** | Coverage, weighted pipeline, deal-size metrics, quota gap |
| **Close date** | Coverage, everything period-scoped, every forecast |
| **Next step and next-step date** | The stalled-deals tile; the only field that says a deal is still alive |
| **Loss reason** | The entire diagnosis in lesson 4 |

Lesson 3 already showed you what one bad field costs. Seven opportunities with close dates in the past — $196,000 — moved your coverage tile from 2.70x to 3.97x. Same quarter, same deals, opposite conclusion, and the corrupted version was the reassuring one. That asymmetry is the danger: **hygiene failures almost always flatter you**, because the errors are stale optimism rather than stale pessimism. Nobody forgets to update a deal that got better.

The same is true of the other four fields, and it is worth being precise about how each one fails.

**Stage** drifts upward. A deck emailed becomes "proposal"; a friendly conversation about pricing becomes "negotiation". Each promotion inflates the weighted pipeline and, worse, corrupts the cohort conversion rates you built your diagnosis on. Your stage entry criteria should be evidence-based and written down: proposal means the buyer has a document they have agreed to review; negotiation means you are discussing terms with someone who can sign.

**Amount** goes stale after a scope change. A deal that shrank from $40,000 to $22,000 in discovery and still says $40,000 overstates your coverage by $18,000 on its own.

**Close date** should be the date you would bet on, updated whenever your belief changes — and every change should be a deliberate act, because lesson 3's flow report counts them. Nine slips in a month is a finding.

**Next step** is the field most reps skip and the one that makes the stalled-deals tile work. An opportunity with no dated next step is not a deal; it is a hope.

**Loss reason** costs thirty seconds at the exact moment you least want to spend them, and it is the only reason lesson 4's diagnosis was possible. Free-text loss reasons are nearly worthless — you need a small closed list you use consistently, even if it is a personal convention rather than a company one.

Two habits keep all five true without ceremony. Update the record **when the event happens**, not on Friday, because a Friday reconstruction of Tuesday's call is a guess. Then spend twenty minutes on Friday on a single pass: every open opportunity has a stage matching its evidence, a close date you would bet on, and a dated next step; every deal closed this week has a reason code. That is the whole discipline. It is also what makes your pipeline usable in a forecast conversation rather than something your manager has to interrogate you about deal by deal — though the forecasting process itself belongs to se301, not here.

## Building the weekly dashboard

Six tiles. Every one has the full chain behind it, and every figure comes from lessons 2 and 3.

### Tile 1 — Quarter coverage

- **Question:** will my dated pipeline cover the gap?
- **Metric:** open pipeline dated this quarter / remaining quota.
- **Filter:** my open opportunities, close date between today and quarter end.
- **Threshold:** 4.0x.
- **Reads:** $416,000 / $154,000 = **2.70x**.
- **Action:** below threshold — prospecting is the priority, and the shortfall goes in the weekly note.

Note the filter carefully: *between today and quarter end*, not *on or before quarter end*. That single choice is what excludes the seven stale-dated opportunities and is the difference between 2.70x and 3.97x.

### Tile 2 — Stalled deals

- **Question:** which open deals have stopped moving?
- **Metric:** count and value of open opportunities beyond twice the median days-in-stage for their stage.
- **Filter:** my open opportunities, grouped by stage.
- **Threshold:** zero without a dated next step in the next seven days.
- **Reads:** **9 opportunities, $251,000** — 5 in discovery, 3 in validation, 1 in proposal.
- **Action:** each one gets advanced with a dated commitment or closed out this week.

### Tile 3 — Creation pace

- **Question:** am I sourcing enough to sustain the funnel?
- **Metric:** opportunities created this month against the sustaining rate.
- **Filter:** my opportunities, created date this month.
- **Threshold:** 11 per month (128 over twelve months is 10.7).
- **Reads:** **8 in September** — a 25% shortfall.
- **Action:** below threshold two months running is a plan change, not a nudge.

### Tile 4 — First-step conversion

- **Question:** is the leak I diagnosed actually closing?
- **Metric:** discovery-to-validation conversion, trailing 90 days.
- **Filter:** my opportunities created in the last 90 days that have since closed, plus those that advanced.
- **Threshold:** 70%.
- **Reads:** **63%**, against a trailing-twelve-month baseline of 60.4%.
- **Action:** monthly review only. Do not touch this weekly.

### Tile 5 — Date hygiene

- **Question:** can I trust tile 1?
- **Metric:** count and value of open opportunities with a close date in the past.
- **Filter:** my open opportunities, close date before today.
- **Threshold:** zero.
- **Reads:** **7 opportunities, $196,000**.
- **Action:** fix every one before the weekly review, not after.

### Tile 6 — Time to no

- **Question:** did the change I made in lesson 4 do anything?
- **Metric:** mean days alive for discovery-stage losses, trailing 90 days.
- **Filter:** my opportunities closed lost in the last 90 days that never left discovery.
- **Threshold:** 35 days.
- **Reads:** **58 days**, against a baseline of 64.
- **Action:** monthly review; this is the tile that tells you whether the diagnosis was right.

Read the six together and the week writes itself: fix seven dates, resolve nine stalled deals, and spend the remaining time prospecting because coverage is short and creation is behind. That is a dashboard doing its job — it produced a plan, not a picture.

## The same six tiles, on dirty data

Here is what the dashboard would have shown a week earlier, before hygiene.

| Tile | Dirty reading | Clean reading | Consequence of believing the dirty one |
| --- | --- | --- | --- |
| 1. Coverage | 3.97x | 2.70x | You work deals instead of prospecting, and land $50,000 short |
| 2. Stalled deals | 2 | 9 | Seven deals keep drifting because next-step dates are blank |
| 3. Creation pace | 8 | 8 | Unaffected — creation counts are hard to corrupt |
| 4. First-step conversion | 71% | 63% | Deals logged at validation without evidence flatter the step you are trying to fix |
| 5. Date hygiene | 0 | 7 | The tile only reads zero because nobody looked |
| 6. Time to no | 41 days | 58 days | Losses left open for months are excluded from a 90-day window, so the slowest deaths never appear |

Tile 6 deserves a second look, because it is the subtlest failure on the list. A trailing-90-day window over *closed* losses silently excludes the deals that are dying slowest — they have not closed yet, so they are not counted. The metric you built to catch slow deaths is systematically blind to the slowest ones. The fix is to pair it with a count of open discovery opportunities older than 60 days, which is a snapshot and cannot hide.

That is the general lesson about dashboards: a tile that can only get better by definition is not measuring anything. Ask of every tile, "what would make this look good without anything improving?" If the answer is easy, the tile is broken.

## Choosing the view

Native CRM reporting gives you four shapes, and picking the wrong one is why so many dashboards are unreadable.

**A grouped summary** — rows of opportunities grouped by one field with a count and a sum — is the right shape for the snapshot and for the stalled-deals tile. It is the default and it is usually correct.

**A cross-tab** — one field down, another across — is what you want for source against outcome, or stage against age band. It is the shape behind lesson 4's source-mix table.

**A funnel or stage summary** shows counts by stage. It is fine as a snapshot and dangerously misleading as conversion, for the reason lesson 3 gave: stage counts in a snapshot are not a cohort.

**A trend** plots one number over time. Use it only for metrics with enough volume to be stable — created counts, closed-won value — never for a rate computed over a handful of deals, where the line is mostly noise and you will read shapes into it.

Two composition rules keep a dashboard readable. Put the tiles that trigger action at the top left, where you look first, which usually means hygiene and coverage. And keep the whole thing to a single screen — a dashboard you have to scroll is a dashboard whose bottom half does not exist.

## Five tiles to delete

- **Total activity this week.** An input you can inflate. It belongs on a dashboard only when a diagnosis has specifically implicated activity volume.
- **Lifetime pipeline created.** Monotonically increasing, therefore incapable of telling you that this week was bad.
- **Unweighted total open pipeline.** $925,000 reads as four and a half quarters of quota. At a 25% win rate with $416,000 clean and dated for the quarter, it is not, and the tile invites exactly that misreading.
- **Team leaderboard.** Moves when other people close. Fails the attributable test from lesson 2.
- **Pipeline by stage as a pie chart.** A pie shows shares of a whole; a funnel is a sequence with a direction. Encoding a sequence as a circle discards the one property that mattered.

## Practice

**Exercise 1 — write the tile specs.** Pick three of the six tiles above and rewrite each as a complete six-line specification: decision, question, metric, filter, threshold, action. The filters must be precise enough that two people building them independently would return the same records — say exactly which date field, which record owner, and which status.

**Exercise 2 — build the monthly dashboard.** The weekly dashboard answers "what do I do next week?" Design the monthly one, which answers "is my plan working?" Maximum four tiles, none of which may duplicate a weekly tile. For each, state the metric, the cadence justification (why monthly and not weekly), the threshold, and the decision it feeds. At least one tile must measure a rate and at least one must measure the hygiene that makes the rates trustworthy.

**Exercise 3 — break a tile.** For each of the five fields in the table above, describe one realistic way a busy rep corrupts it in a normal week, name which tile goes wrong, and state whether the corrupted tile reads better or worse than the truth. Then say which single field you would protect first and why.

**Exercise 4 — the gaming test.** Take tiles 1, 2, 4, and 6 and answer, for each, "what could I do that makes this tile look good without selling anything more?" Then propose one paired tile or one filter change per tile that closes the loophole.

## Check your understanding

1. Name the six links in a tile specification. *(Answer: decision, question, metric, filter, threshold, action.)*
2. Why should discovery-to-validation conversion be reviewed monthly, not weekly? *(Answer: it cannot meaningfully move in a week; weekly review reacts to two or three deals of noise.)*
3. Ask "what would make this tile look good without anything improving?" of the time-to-no tile. What is the answer, and the fix? *(Answer: slow-dying deals that have not closed yet are excluded from a closed-loss window; pair it with a count of open discovery opportunities older than 60 days.)*
