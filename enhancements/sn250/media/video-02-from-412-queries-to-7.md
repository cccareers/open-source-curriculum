---
course_id: sn250
media_id: sn250-v02
type: video-script
title: "From 412 Queries to 7: Debugging and Tuning a Slow Script"
format: screencast
target_runtime: "9 min"
related_lessons:
  - sn250-10
  - sn250-03
objectives:
  - Debug a failing script and reduce the cost of an expensive query
  - Query, create, and update records from server-side script using GlideRecord and GlideSystem
competency_ids:
  - D7-S1-C01
  - D7-S1-C04
---

## Purpose
After watching, the learner can find a silent logic bug with the debug method from lesson 10, then measure and cut a script's database cost using SQL debug, dot-walking, caching, and GlideAggregate.

## Audience and prerequisites
sn250 learners at lesson 10. PDI with demo incidents (a few hundred is enough; numbers in narration are from the recording instance and should be re-measured).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Scripts - Background with the lesson 10 "BEFORE" report script. Run; output shows numbers; elapsed "4.8 s". | "This script works. It lists active incidents with their group and manager, and counts per group. It also takes nearly five seconds on a small instance. Before we make it fast, let's make sure it's right." |
| 0:20 | Output shows every incident listed as "active" including some closed ones. | "Look closely: some of these incidents are closed. The report says active. Something's wrong, and there's no error." |
| 0:35 | Card: "1 Reproduce · 2 State expectation · 3 Find where · 4 Explain · 5 Verify by reversing". | "The method from the lesson. Reproduce: done, it's every run. Expectation: only rows where active is true. Now find *where* reality diverges — not why yet." |
| 0:55 | Scroll to an injected bug: `if (gr.active) { rows.push(...) }` after a query without `addQuery('active', true)`. | "Here. Someone removed the addQuery and filtered in the loop instead — with if gr dot active. That's a GlideElement, an object. Always truthy. Every row passes." |
| 1:20 | Add log line `gs.info('[report] active=' + gr.getValue('active') + ' typeof=' + typeof gr.active)`; run with `setLimit(3)`. Output: `active=false typeof=object`. | "Prove it with one log line that prints the value and the type. Value false, type object. Explained." |
| 1:45 | Fix: restore `gr.addQuery('active', true)`; remove the if. Re-run: closed incidents gone. Reverse the fix: they return. Re-apply. | "Fix it where it belongs — in the query, so the database filters. Then verify by reversing: undo the fix, the bug returns; redo it, it's gone. Now we know it was this, not something else." |
| 2:20 | Navigate System Diagnostics > Session Debug > Debug SQL (label may vary). Re-run script; output pane fills with SQL statements. | "Now speed. Don't guess — count. Turn on SQL debug for your session and run it again." |
| 2:40 | Scroll; counter overlay "412 statements". Highlight repeated `SELECT ... FROM sys_user_group WHERE sys_id = ...`. | "Four hundred and twelve statements. And look at the pattern: the same group query, over and over, one per incident. Then a user query per incident for the manager." |
| 3:05 | Code: the two `new GlideRecord` inside `while (gr.next())`. | "That's a query inside a loop — two of them. Two hundred incidents means four hundred extra queries." |
| 3:25 | Replace manager lookup with dot-walk `grp.manager.name.toString()`; replace per-row group GlideRecord with `groupInfo()` cache function from lesson 10. | "First fix: cache. Look each group up once, keep it in an object, and dot-walk to the manager's name. Sixty incidents in the same group now cost one lookup, not sixty." |
| 4:05 | Run with SQL debug: "74 statements". | "Seventy-four. Better. What's left?" |
| 4:20 | Highlight the counting loop `counts[groupId]++`. | "This loop's only job for half its life is counting. A loop that only counts is GlideAggregate wearing a disguise." |
| 4:40 | Replace with GlideAggregate COUNT grouped by assignment_group. Add `addNotNullQuery('assignment_group')` and `setLimit(500)` on the row query; remove the in-loop `continue`. | "Let the database count, grouped by assignment group. And move the 'skip empty group' test out of the loop into the query, so we never fetch rows only to discard them. Add a limit while we're here." |
| 5:15 | Run: "7 statements" (plus cache misses as distinct groups appear — narrate the actual number on recording). Elapsed timer using GlideDateTime: three runs, median. | "Seven statements plus one per distinct group. Time it three times and take the middle number — the first run of anything is slower." |
| 5:45 | Turn off SQL debug. | "Switch SQL debug off. Left on, it slows every page you open." |
| 6:00 | Script Debugger: set breakpoint in a before business rule (from lesson 4), save an incident from the form; debugger pauses; inspect `current.priority`, `previous.priority`. | "One more tool, for logic with branches: the Script Debugger. Breakpoint on a business rule, save a form, and it pauses with current and previous in front of you." |
| 6:35 | Card: "Pauses only your own synchronous transaction — not async rules, jobs, or other users." | "Know its limit: it only pauses scripts running in your own session. Async rules and scheduled jobs won't stop here — use tagged log lines for those." |
| 7:00 | Debug Business Rule output listing rules in order for the save. | "And when a value changes and you didn't change it, Debug Business Rule lists every rule that ran, in order. Usually the culprit is the rule you didn't know existed." |
| 7:30 | Recap card: "Bug: find where, then why, then reverse. Speed: count statements, kill queries in loops, aggregate, filter in the query, bound." | "Correct first, then fast. Count, don't guess." |
| 8:00 | End card: "Try it: practice 5–8 in lesson 10. Report statement counts, not seconds." | "Your turn: run the practice exercises and report statement counts. Seconds depend on the instance; query counts don't." |

## On-screen assets and B-roll
- The BEFORE and AFTER scripts from lesson 10, plus the injected `if (gr.active)` bug variant.
- Statement counts are illustrative; re-measure during recording and update narration and title if materially different.
- Overlay counter for statement totals.

## Accessibility
- Captions; every code change narrated; statement counts spoken.
- Debug output zoomed; key lines highlighted with outline + label.
- Transcript contains before/after code.

## Check for understanding
1. Why did `if (gr.active)` let closed incidents through? — *`gr.active` is a GlideElement object, always truthy; compare `getValue('active') === 'true'` or filter in the query.*
2. What single number best shows a query-in-a-loop problem? — *The SQL statement count from SQL debug.*
3. Why won't the Script Debugger stop in an async business rule? — *It only pauses synchronous scripts in your own session; async rules run on background workers.*
