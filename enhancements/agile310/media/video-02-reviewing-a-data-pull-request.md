---
course_id: agile310
media_id: agile310-v02
type: video-script
title: "Reviewing a Data Pull Request: Seven Questions, Blocking vs Non-Blocking"
format: screencast
target_runtime: "8 min"
related_lessons:
  - agile310-07
objectives:
  - Collaborate through reviews, working agreements, and handoff documentation
competency_ids:
  - D7-S1-C01
  - D7-S1-C02
---

## Purpose

After watching, the learner can review a transformation pull request using lesson 7's seven questions, ask for evidence alongside the diff, and write comments that say what was observed, why it matters, and what to do, clearly marked blocking or non-blocking.

## Audience and prerequisites

agile310 learners preparing for lesson 7 practice items 3 and 4.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | A pull request titled "Add borough to fct_trip_daily" on the zone-cancellations capstone. Diff: 14 lines in `fct_trip_daily.sql`. | "A teammate's pull request. Fourteen lines of SQL. It looks harmless. A diff-only review would approve it. Let's review it the way lesson 7 asks." |
| 0:20 | Diff highlight: `JOIN stg_zones z ON z.zone_id = t.pickup_zone_id` added to the fact build. | "The change joins staging zones onto trips to add borough to the fact table." |
| 0:35 | Question card 1: "What is the grain, and does this change it?" | "Question one: grain. The fact is one row per zone per day. A join can multiply rows. Is zone_id unique in stg_zones?" |
| 0:50 | Terminal: `SELECT zone_id, count(*) FROM stg_zones GROUP BY 1 HAVING count(*) > 1;` → zone 41 appears twice (renamed on 2026-03-08). | "It isn't. Zone 41 was renamed by the source and staging kept both versions. This join will double zone 41's trips from March eighth." |
| 1:15 | Comment drafted: "**Blocking.** `stg_zones` has two rows for `zone_id = 41` since the 2026-03-08 rename (query attached). Joining on it doubles zone 41's trips and cancellations, which inflates the headline zone. Suggest joining `dim_zone` (one row per zone) instead, and adding a uniqueness test on `stg_zones.zone_id` or dedup in staging." | "The comment: what I saw, with the query. Why it matters: it inflates exactly the zone our answer is about. What I'd do: join the dimension, and add the test that would have caught it. Marked blocking." |
| 1:55 | Question card 2: "What happens if this runs twice?" Diff shows the window delete-then-insert unchanged. | "Question two: idempotency. The write pattern is untouched, delete the window then insert. Fine. No comment needed; say so in the summary." |
| 2:15 | Question card 3: "Does this filter drop rows silently?" Highlight: it's an inner `JOIN`. | "Question three: an inner join is a filter. Any trip whose zone is missing from staging disappears from the totals." |
| 2:30 | Terminal: `SELECT count(*) FROM stg_trips t LEFT JOIN stg_zones z ON z.zone_id = t.pickup_zone_id WHERE z.zone_id IS NULL;` → 212. | "Two hundred twelve trips have a pickup zone not in the zones source. Today they'd be silently dropped." |
| 2:50 | Comment: "**Blocking.** Inner join drops 212 trips with unknown zones (query attached). Suggest LEFT JOIN with an 'unknown' borough, or a dim_zone 'unknown' member, so totals still reconcile with staging." | "Blocking again, with the number and a fix that keeps the reconciliation test honest." |
| 3:15 | Question card 4: "What does this do to the daily cost?" Before/after bytes scanned from the PR description: missing. | "Question four: cost. The PR doesn't say. Ask for evidence: bytes scanned for one window, before and after." |
| 3:30 | Comment: "**Non-blocking (please add before merge if easy).** Could you add bytes scanned for one window before/after to the PR description? stg_zones is small so I expect no change, but the working agreement asks for it." | "Non-blocking, and explicitly so. It's evidence, not a defect." |
| 3:50 | Question card 5: "Is there a test that would have caught the bug this fixes?" and 6: "Would an analyst understand the new column?" Diff: column named `boro`. | "Five: no new test yet; covered by the first comment. Six: the column is called 'boro'. An analyst shouldn't need the source's abbreviation." |
| 4:10 | Comment: "**Non-blocking.** Suggest `pickup_borough` and a data-dictionary entry ('borough of the pickup zone per the zones API as of the trip date')." | "Suggestion, with the exact dictionary line." |
| 4:25 | Question card 7: "Blast radius?" Diagram: fct_trip_daily → vw_cancellation_rate_by_zone_day → presentation headline. | "Seven: blast radius. This table feeds the serving view that produces the presentation headline. That's why the grain issue is blocking, not a suggestion." |
| 4:50 | Review summary comment: "Requesting changes: 2 blocking (zone 41 duplication; inner join drops 212 trips), 2 non-blocking. Write pattern and idempotency look good." | "Close with a summary: how many blocking, how many not, and what's already good. The author shouldn't have to infer your verdict." |
| 5:15 | Switch to author's view: replies to each comment. One reply disagrees: "Re unknown borough: the zones API guarantees coverage for valid zones; the 212 are test trips. I'll filter test trips in staging and add a comment + ADR-004." | "Receiving review: respond to every comment. Disagreeing is fine with a technical reason, and if it changes the design, it becomes a decision record." |
| 5:50 | Reviewer reply: "Makes sense — please add a not-null test on borough so the assumption is checked every run." | "And the reviewer turns the assumption into a test. That's a good review: the disagreement ended in something the pipeline enforces." |
| 6:20 | Checklist card with the seven questions; "Observe → Why → Do"; "Mark blocking explicitly". | "Seven questions. Ask for evidence, not just the diff. Every comment: what you observed, why it matters, what you'd do. Mark blocking explicitly." |
| 6:50 | End card: lesson 7 practice items 3 and 4. | "Now review a real change from a peer's capstone with this checklist." |

## On-screen assets and B-roll

- A mock pull request in the agile310-x01 rehearsal repo (zone 41 rename comes from that project's fake zones API).
- Query outputs shown are from the rehearsal data; regenerate before recording.

## Accessibility

- Captions; every comment's full text appears on screen and is read aloud.
- "Blocking"/"Non-blocking" shown as bold text labels, not colored badges alone.
- Code and query results zoomed; terminal 18 pt.

## Check for understanding

1. Why is an inner join a review concern even when the SQL is correct? *Answer: it filters out rows without a match, silently changing totals.*
2. What three parts should every review comment contain? *Answer: what you observed (with evidence), why it matters, and what you would do.*
3. When should a comment be marked blocking? *Answer: when merging as-is would produce wrong or misleading data, break idempotency, or create an unacceptable risk; style and nice-to-haves are non-blocking.*
