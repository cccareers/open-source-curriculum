---
lesson_id: ai102-15
course_id: ai102
pathway: prompt-engineer
title: Testing, Cost, and Reliability
order: 15
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Test a no-code AI build and account for its running cost, quota limits, and failure modes before handing it over
---

## The three questions before handover

You are about to give something you built to someone else to depend on. They will ask three questions, and if you cannot answer all three with evidence, the honest answer is that the build is not finished.

**Does it work?** Not "did it work when I tried it," but: here is the set of cases it handles, here is what it does with each, and here is the record of the last time I checked.

**What does it cost to run?** A number per month, with the arithmetic shown, at a stated volume — and what happens to that number when volume triples.

**What does it do when something breaks?** For each way it can fail: what happens, who finds out, and how long recovery takes.

No-code builds skip all three more often than coded ones, for a specific reason. There is no compiler, no test suite, no code review — nothing forces the questions to be asked. The tooling makes it trivially easy to ship something that appears to work, and the gap between "appears to work" and "can be depended on" is exactly this lesson.

## Environments: somewhere to test that is not production

You cannot test properly against live data, and the first job is somewhere else to run.

**Duplicate the workflow.** Both platforms let you copy a scenario or a Zap. Name copies unambiguously — a `[TEST]` prefix — because an untitled duplicate left running is one of the most common causes of duplicate records in the whole no-code world.

**Point the copy at test data.** A separate base or a separate table, a sandbox account on the external API, a test channel rather than the customer-facing one. This is where lesson 11's separate credentials become operational rather than theoretical: the test copy should be *incapable* of writing to production, not merely configured not to.

**Keep a fixture set.** A small, stable, deliberately awkward collection of input records that you re-use for every test round: the normal case, the empty optional field, the very long text, the wrong date format, the non-English input, the one with quotes and newlines in it, the duplicate of an existing key. Store them as records in your database so anyone can re-run the same set, and add a row every time production surprises you.

Two practices make this sustainable. **Version your workflows** by exporting a copy of the definition before any significant change, or by using the platform's own version history where it exists, so "it worked last Tuesday" has a recoverable meaning. And **keep a change log** — date, what changed, who changed it, what was re-tested — because in a no-code build there is no commit history and the change log is the only record that a change ever happened.

## What to test

Testing a no-code AI build has four layers, and skipping any one leaves a class of defect.

**Layer 1 — each step in isolation.** Every step's own test button, with a fixture that exercises it. Cheap and catches configuration errors: a wrong field mapping, a missing content type, a header typo.

**Layer 2 — the whole path, end to end.** Run a fixture through the entire workflow and inspect the destination, not the run log. The question is not "did every step return success" but "is the record correct, is the message readable, did the right person get it."

**Layer 3 — the branches.** Every branch you built in lesson 07, including the fallback, exercised with an input that reaches it. A branch never executed is a branch never tested, and the fallback is the one people never trigger deliberately.

**Layer 4 — the failure paths.** The six-case matrix from lesson 07 — bad input, auth failure, rate limit, downstream outage, duplicate event, oversized batch — plus the model-specific failures from lesson 08: unparseable output, schema-valid but wrong, refusal, and drift. For each, verify three things: what the destination contains afterwards, whether an exception was recorded, and whether a human was told.

Record the results as a table, one row per case, and keep it with the build. That table *is* the answer to "does it work," and it is worth more to whoever inherits this than any amount of prose.

```text
CASE                        EXPECTED                       ACTUAL   DATE
Normal request              1 record, 1 message            pass     2026-03-04
Empty deadline              record created, no date        pass     2026-03-04
Duplicate source id         no new record                  pass     2026-03-04
Body over 10,000 chars      truncated, flag set            pass     2026-03-04
Model returns prose         exception row, no bad write    pass     2026-03-04
Category outside enum       routed to human review         pass     2026-03-04
API returns 429             retried, then succeeded        pass     2026-03-04
API returns 422             exception with payload         pass     2026-03-04
Credential revoked          alert within 1 minute          pass     2026-03-04
Batch of 200 items          capped at 50, exception        pass     2026-03-04
```

Two things separate a real test round from a performative one. **Re-run the whole table after every change**, because no-code changes have non-local effects — adding a step renumbers references, and changing a field type breaks a mapping three workflows away. And **test with volume at least once**: fire fifty events in quick succession and watch what happens to rate limits, concurrency, ordering, and your platform's own queueing. A workflow tested one event at a time will surprise you the first busy morning.

For the AI steps specifically, the evaluation sets from lessons 08 and 13 are part of this round, not separate from it. Re-run them, record the scores, and treat a drop as a blocker.

## Costing a no-code AI build

The cost has three components, and people routinely account for one of them.

**Platform units.** Tasks or operations, as established in lessons 03 and 04. Count them per run from an actual execution rather than by counting boxes on the canvas, because searches, iterators, and routers multiply. Then multiply by expected runs per month.

**Model tokens.** Input plus output, per model call, at the provider's published rate. A workable estimate is four characters per token. Remember that your prompt's fixed parts — system message, rules, examples — are paid on *every* call, and in a high-volume automation they usually dominate the variable content.

**Everything else.** Seats on each platform, the database plan, the interface builder, the chatbot platform, the API you are calling if it charges, and storage. These are usually the largest number and the one nobody includes because it is not per-run.

Do the arithmetic explicitly. For the intake automation at 1,000 requests per month:

```text
PLATFORM UNITS
  Operations per run (measured from a real execution)          11
  Runs per month                                            1,000
  Units per month                                          11,000
  Plan required and its price                              [look up]

MODEL TOKENS  (triage step)
  Prompt fixed part (system + rules + 2 examples)        ~  900 tokens
  Variable input (cleaned body, avg 1,600 chars)         ~  400 tokens
  Output (JSON object)                                   ~  120 tokens
  Per call: 1,300 in + 120 out
  Per month: 1,300,000 in + 120,000 out
  At published rates for the chosen model                  [compute]

FIXED
  Automation platform plan, database plan, interface plan,
  chatbot platform, seats                                   [sum]

TOTAL PER MONTH                                             [sum]
COST PER REQUEST                                            total / 1,000
```

Then produce the same figure at **three volumes** — your expected volume, three times it, and ten times it. Non-linearity is the point of the exercise: platform plans step rather than scale smoothly, so tripling volume may double the bill or quintuple it depending on where a tier boundary falls. Find the boundary and say where it is.

Finally, compare against the thing it replaces. If the process currently takes a person ninety seconds per request, 1,000 requests is 25 hours a month, and that is the number the business case rests on. State it honestly, including the cases where the automation does not pay for itself and is justified by speed or consistency instead.

## Reducing cost, in order of leverage

When the number is too high, work through these in order. The first three usually deliver more than the rest combined.

**Filter earlier.** Every run that never starts costs nothing. Move conditions into a database view so the trigger does not fire, per lesson 07. A filter that removes 60% of runs removes 60% of the entire bill.

**Do not call the model when you do not need to.** A great many "AI" steps are doing work that a lookup table, a formula field, or a keyword rule does deterministically, more accurately, and for free. Reserve the model for the genuinely ambiguous cases, and route the obvious ones around it. This is the single most under-used cost lever in no-code AI.

**Right-size the model.** Test the cheaper model against your evaluation set before assuming you need the expensive one. Where accuracy is equivalent, the saving is often an order of magnitude.

**Trim the prompt.** Fixed prompt content is paid on every call forever. Once behaviour is stable, remove examples one at a time and re-run the evaluation set; keep only the ones whose removal measurably hurts.

**Cache what does not change.** Values fetched from an API that change monthly do not need fetching hourly. Store them in your database and read from there.

**Batch.** Where the destination API accepts arrays, one call for 50 items instead of 50 calls. Where a digest would do, replace 200 immediate notifications with one scheduled summary.

**Consolidate steps.** Two formatting steps that could be one inline expression, in a platform that charges per step, is a real saving at volume.

## Quotas, and running out of them

Cost is a bill. A **quota** is a wall, and hitting one is an outage.

Four quotas apply to almost every build in this course, and you should know the current number for each on your plan: platform tasks or operations per month; model provider rate limits and any spending cap; database API requests per second and record limits; and the destination API's own rate limits.

The failure when you hit one is worse than expensive, because it is usually silent. The platform stops running workflows, or queues them until the next cycle. The model provider returns errors. Nobody is told, because no step failed in a way that produced an alert. You find out when someone asks why nothing has happened since Tuesday.

So instrument it deliberately.

**Alert on consumption, not on failure.** Set an alert at 70% and again at 90% of each monthly quota, on a scheduled workflow that reads the platform's usage figures where an API exposes them, or that counts your own runs in the database where it does not.

**Alert on the absence of runs.** A scheduled check that raises an alarm if a workflow that should run hourly has not run in three hours. This catches quota exhaustion, a disabled workflow, a dead trigger, and a broken credential — four different failures with one identical symptom, and no other alert catches any of them.

**Keep headroom.** Size the plan for peak, not average. A month-end spike that is three times normal is common, and a plan sized to the average will fail exactly when the business is busiest.

**Decide the degradation behaviour.** When you are near a limit, what should give way? Usually: keep the customer-facing path, pause the reporting and enrichment. Deciding that in advance and implementing it as a switch is far better than deciding it during an incident.

## Naming the failure modes

Write down every way this build can fail, what happens, who notices, and how long recovery takes. The list is short and it is the most useful page in the handover document.

```text
FAILURE                     EFFECT                  DETECTED BY        RECOVERY
Platform outage             nothing runs            no-runs alert      wait; replay queue
Quota exhausted             runs queue or stop      70/90% alert       upgrade or pause
Credential expired/revoked  401 on every call       401 alert          rotate per L11
API rate limited            slow, some retries      429 in run history backoff (automatic)
Destination API down        5xx, retries, then DLQ  failure alert      replay from DLQ
Model unparseable output    exception row           exception alert    fix prompt, replay
Model quality drift         wrong values, no error  weekly eval run    re-tune, re-eval
Source schema change        mappings return empty   empty-value check  remap, re-test
Webhook not delivered       events silently missing reconciliation job re-sync window
Someone edits the workflow  anything                change log         restore version
```

Two rows in that table deserve attention because they are the ones with no natural alarm. **Model quality drift** produces valid-looking wrong answers and is only caught by re-running an evaluation set on a schedule. And **silently missing webhook deliveries** are invisible by construction — the fix is the reconciliation sweep from lesson 10, a scheduled job that queries the source for recent objects and fills gaps.

For each row, state a recovery time you are willing to commit to, and check that the detection mechanism is fast enough to meet it. A four-hour recovery target with a weekly detection mechanism is not a plan.

## The handover document

The build is finished when someone else can run it. That means a document, and it is short.

```text
1. What it does           One paragraph, plus the trigger-data-action sentence.
2. Diagram                The systems and the direction data flows between them.
3. Components             Every workflow, table, interface, and bot, with links.
4. Credentials            The connection register from lesson 11.
5. Configuration          Every value someone might need to change, and where.
6. Test table             The case table, with the date last run.
7. Cost                   The arithmetic, at three volumes, with the plan tiers.
8. Quotas and alerts      Limits, thresholds, who receives each alert.
9. Failure modes          The table above, with recovery steps.
10. Runbook               For each alert: what it means and the first three actions.
11. Change log            Dated, with what was re-tested.
12. Owners                Named team for the build, the content, and the escalations.
13. Known limitations     What it does not handle, and what would break it.
```

Section 13 is the one that earns trust. A handover claiming everything works is not believed and should not be; one that names the three things that would break this build tells the reader you understand it.

Then test the document the only way that works: **hand it to someone who did not build this and ask them to make one small change and re-run the test table.** Every question they have to ask you is a defect in the document. Fix those, and the build is done.

## Practice

Use the full build from lessons 03 through 14.

1. **Stand up a test environment.** Duplicate your main workflow with a `[TEST]` prefix, point it at a test base and sandbox credentials, and demonstrate that it is *incapable* of writing to production — not merely configured not to. Describe what you had to change to make that true.

2. **Build the fixture set.** At least ten fixture records covering the awkward cases in this lesson, stored in your database. Include one drawn from something that actually surprised you during earlier lessons.

3. **Run all four test layers and produce the table.** One row per case with expected, actual, and date, covering isolated steps, end to end, every branch including the fallback, and the ten failure cases. Fix everything that fails and re-run the whole table.

4. **Test under volume.** Fire 50 events within two minutes. Report what happened to run duration, rate limits, ordering, duplicates, and platform queueing, and state the events-per-minute your build sustains without degradation.

5. **Re-run your evaluation sets.** Run the AI-step set from lesson 08 and the grounding set from lesson 13, record the scores, and compare with the last recorded run. Explain any movement.

6. **Cost it properly.** Measure the units consumed per run from a real execution. Compute platform units, model tokens, and fixed costs at your expected volume, three times, and ten times, showing the arithmetic and citing published rates with the date you checked. Identify every plan-tier boundary you cross and state the cost per request at each volume.

7. **Cut the cost by a third.** Apply the levers in order and measure after each. Report what you changed, the saving from each change, and whether accuracy moved on your evaluation sets. If you cannot reach a third, say what stopped you.

8. **Instrument the quotas.** Find the current limit for all four quota types on your plans, with URLs and dates. Implement a 70% and 90% consumption alert for at least one, and a no-runs alert for a workflow that should run on a schedule. Prove the no-runs alert by disabling the workflow.

9. **Complete the failure-mode table.** Every row filled for your build, with a real detection mechanism and a committed recovery time. For any row where detection is slower than the recovery target, either improve the detection or revise the target, and say which you chose.

10. **Write and test the handover document.** All thirteen sections. Then give it to someone who did not build this, ask them to make one small configuration change and re-run three rows of your test table, and log every question they had to ask you. Fix the document and note what you changed.
