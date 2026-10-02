---
lesson_id: de210-02
course_id: de210
pathway: data-engineer
title: Pipeline Architecture and Orchestration Concepts
order: 2
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Describe what an orchestrator guarantees that a cron job does not
---

## From a job you run to a pipeline that runs itself

Everything you have built so far has had a human in the loop. You started the Spark job, you watched the log, you noticed when the output looked wrong, and you re-ran it. A **pipeline** is the same work with the human removed from the normal path and moved to the exception path. That single change is what forces every idea in this course.

Once nobody is watching, you have to answer questions that never came up before. If step three fails, does step four run anyway? If the source was empty at 6 a.m. and full at 7 a.m., who notices? If the same job runs twice, do you get twice the rows? If today's run has to be redone next month with corrected source data, what exactly do you re-run, and what does it overwrite? If someone asks on Friday why Wednesday's revenue number changed, can you say which run produced it?

An **orchestrator** is the piece of software whose job is to answer those questions consistently, for every pipeline in your organisation, so that each individual pipeline does not have to reinvent an answer. Understanding what it guarantees — and what it does not — is the point of this lesson. Airflow arrives in the next lesson as one implementation of these ideas, not as the definition of them.

## The anatomy of a batch pipeline

Almost every batch pipeline you will build or inherit has the same four-layer shape, whatever the tools.

**Extract / ingest.** Move raw data from a system you do not control into storage you do control. The output is a faithful copy — as close to the source bytes as practical, with nothing thrown away and nothing cleaned. This layer is deliberately dumb, because it is the layer most likely to break, and a dumb layer is a cheap layer to re-run.

**Land / raw.** The immutable arrival zone: object storage files or raw warehouse tables, written once per run, never edited in place. This is your ability to rebuild everything downstream without going back to the source, which matters because sources delete history, change schemas, and rate-limit you.

**Transform / model.** Clean, conform, join, and aggregate into tables that a consumer can actually use. This is where business logic lives, and where the rest of the course spends the most time.

**Serve.** The tables, extracts, and files that a dashboard, a model, or another team reads. The contract with the outside world.

Two ordering conventions sit on top of this shape and you will hear both names constantly. **ETL** transforms data on the way in, before it is stored in the destination — the historical pattern, appropriate when the destination is expensive, rigid, or cannot do the computation. **ELT** loads raw data into the destination first and transforms inside it, which is the dominant modern pattern because warehouses and lakehouses are now cheap and powerful enough to do the work, and because keeping the raw copy means you can change your mind about the transformation later without re-extracting. Most pipelines you build in this course are ELT with a thin extract step, but the orchestration concepts are identical either way.

## Why the DAG is the right abstraction

Write down a pipeline's steps and the dependencies between them and you have drawn a **directed acyclic graph**: nodes are units of work, edges mean "must finish before", and there are no cycles, because a step that depends on itself can never start.

That structure is not a diagramming convention; it is what makes automation tractable. From a DAG the orchestrator can derive, without you telling it:

- **What can run in parallel.** Any two tasks with no path between them are independent. Extracting from four APIs is four tasks with no edges between them, so they run at once — no thread pools in your code.
- **What must run in order.** A transform depends on its ingest; the edge is the whole specification.
- **What to skip when something fails.** If ingest fails, everything reachable from it is unrunnable, and the orchestrator marks it so rather than running it against missing data.
- **What to re-run after a fix.** Repair the failing task, and the set of work still outstanding is exactly the tasks downstream of it.
- **Where the critical path is.** The longest chain through the graph, which is the only chain worth optimising if you want the pipeline to finish earlier.

Compare that to a single script with the steps in sequence. The script has an implicit graph — a straight line — which throws away every parallelism opportunity and gives the runtime no way to reason about partial progress. When it dies at step seven, the only recovery primitive available is "run the whole thing again", and that is only safe if steps one through six can be repeated harmlessly. Usually nobody checked.

## What cron gives you, and where it stops

`cron` is a trigger. It runs a command at a time. That is genuinely useful, and for a single self-contained job with no dependents it may be all you need. But a trigger is only the first of the guarantees a production pipeline requires, and the gap is worth enumerating precisely, because "we already have cron" is an argument you will have to answer.

**Dependencies.** Cron schedules by clock time, so dependencies get expressed as guesses: ingest at 02:00, transform at 03:00, and hope ingest takes less than an hour. The day ingest takes seventy minutes, transform runs on yesterday's data and nobody is told. An orchestrator expresses the dependency directly — transform starts when ingest *succeeds*, however long that takes — and if ingest fails, transform does not run at all.

**Retries and backoff.** A cron job that fails has failed until tomorrow. An orchestrator retries a task a configured number of times with a delay between attempts, which resolves the large fraction of failures that are transient: a network blip, a rate limit, a warehouse restart. It retries *that task*, not the whole pipeline.

**State and history.** Cron keeps no record. Whether last night's run succeeded, how long it took, whether it ran at all, and what it produced are all questions you answer by reading logs, if the logs still exist. An orchestrator persists a row per task per run: state, start, end, duration, attempt number, log pointer. That history is the raw material for every alert and every diagnosis later in the course.

**Visibility and alerting.** Cron mails output to a local mailbox nobody reads. An orchestrator has a UI showing every run's state, and hooks that fire on failure, on retry, and on a run being late.

**Catchup and backfill.** If the machine is down from Friday to Monday, cron simply misses three runs, permanently. An orchestrator knows which intervals it owes and can run them — and can be told deliberately to re-run a past range after you fix a bug, which is the single most common operational task in data engineering.

**Concurrency control.** Two cron entries firing at once against the same table will happily corrupt it; a job that overruns its schedule will start a second copy on top of the first. An orchestrator gives you per-task and per-pipeline concurrency limits and resource pools, so a slow run does not multiply.

**Parameterisation by time window.** A cron job knows only "now". An orchestrator hands each run the *data interval* it is responsible for, which is what makes re-running a past window produce that window's data rather than today's. This is the quiet one, and the most important — the next section is entirely about it.

**Portability of the definition.** A crontab is machine state. A pipeline definition is code in version control, reviewed, tested, and deployed like any other code.

![Side by side comparison of a cron schedule and an orchestrated DAG for the same pipeline, showing time-guessed dependencies against real ones, per-task retries, and persisted run state](./img/cron-vs-orchestrator.png)

None of this means an orchestrator is free. It is a service to run, a new failure mode, and a body of concepts a team has to learn. The honest rule: use a scheduler when the unit of work is one command with no dependents and no consequence to a missed run; use an orchestrator the moment something else depends on the output, or someone would need to be told when it fails.

## The data interval, and why runs are named after the past

The mental shift that trips up most engineers coming from cron is this: an orchestrated run is not identified by *when it executed*, but by *which slice of data it is responsible for*.

A daily pipeline that runs at 02:00 on the 6th is processing the 5th's data — that is the interval that just closed. The orchestrator therefore labels that run with the 5th, and every task in it receives the interval's start and end as parameters. Your code must use those parameters and never `now()` or `today()`.

The payoff is enormous, and it is the whole basis of reliable backfilling. Because the run is a pure function of its interval, re-running the run for the 5th next month reproduces the 5th's output exactly. If instead your query says `WHERE created_at >= CURRENT_DATE - 1`, the same re-run silently produces *last month's* window under the 5th's label, and you have quietly corrupted history.

Two related properties follow.

**Idempotency** means running a task twice for the same interval leaves the system in the same state as running it once. Achieve it by making each run *replace* its own slice rather than append to a pile: write to a partition path or table partition keyed by the interval and overwrite it, or perform a merge keyed on a business key. An unconditional `INSERT` is the classic non-idempotent write, and it is why one retry becomes a duplicated day.

**Completeness** means knowing when an interval's data has actually all arrived. Sources are late, clocks disagree, and events created at 23:59 can land at 00:07. The usual tools are a delay before the run starts, a watermark that tracks how far the source has definitively progressed, and a policy for reprocessing a window when late data shows up. Decide the policy explicitly; the alternative is deciding it accidentally.

## Full refresh, incremental, and how to choose

Every table you build is produced one of two ways, and the choice is an engineering trade-off you should be able to defend.

A **full refresh** rebuilds the whole target from the whole source every run. It is trivially idempotent, self-healing after any upstream bug, and utterly simple to reason about. It also costs time and money proportional to total history, and eventually stops fitting inside the window you have.

An **incremental** load processes only the new or changed slice and merges it into the target. It scales with new data rather than total data, which is the only way large tables stay affordable. The costs are real: you need a reliable change signal (an `updated_at` column, a sequence, a change feed), a merge key, a plan for hard deletes at the source, and a periodic full rebuild to repair drift.

The practical default is: full refresh until it hurts, then incremental with a documented full-rebuild procedure. What matters most for this lesson is that either choice must remain idempotent per interval — an incremental load that appends rather than merges is a duplicate generator waiting for its first retry.

## Failure is a design input, not an accident

A pipeline that assumes success is a pipeline that will lie to you. Design for these, explicitly:

- **Transient failures** — timeouts, throttles, restarts. Handled with retries and exponential backoff, so most never reach a human.
- **Poison inputs** — one malformed record that kills the task on every retry. Retrying forever cannot help; you need to quarantine the record and continue, or fail loudly and stop.
- **Partial writes** — the task died halfway through writing. This is why you write to a temporary location and then publish atomically, rather than mutating the target in place.
- **Upstream lateness** — the source is fine but not ready. Handled by waiting with a timeout rather than proceeding on incomplete data.
- **Silent wrongness** — the run succeeded and the data is bad. No orchestrator catches this for you; it is why validation gates exist, and it is the subject of a later lesson.

Two decisions belong to you rather than the tool. **Fail open or fail closed?** A pipeline feeding an executive dashboard should usually fail closed — publish nothing rather than something wrong. A pipeline feeding an internal exploratory dataset might reasonably fail open and carry on with a warning. **Who is told, and how urgently?** A failure with no route to a person is indistinguishable from silence.

## A reference architecture to build against

Hold this picture for the rest of the course. Sources — APIs, file drops, and operational databases — are pulled by ingest tasks into a raw landing zone partitioned by data interval and never edited. Transformation tasks read the raw zone and build layered models: a staging layer that renames and types columns one-for-one, an intermediate layer that joins and enriches, and a mart layer that serves consumers. Validation gates sit between the layers and stop bad data from being promoted. The whole graph is one or more DAGs, scheduled by interval or triggered by an event, with every run's state and timing recorded. Lineage and documentation are generated from the same definitions, so that a consumer can trace any served column back through the layers to the raw file and the run that produced it.

Everything you build from here fills in a piece of that picture.

## Practice

Work these on paper and in a repository — no orchestrator is required yet. Keep your written answers; you will re-read them in later lessons.

1. **Audit a cron-run job.** Take a scheduled job you have written or been given (a script, a notebook, a scheduled query — anything). Write down, for each of the eight guarantees in this lesson, whether the job currently has it and, if not, what would go wrong the first time that gap is exercised. Rank the gaps by how much damage they would do.

2. **Draw the DAG.** For the same job, decompose the work into tasks at the granularity you would want to retry independently, and draw the dependency graph. Mark which tasks can run in parallel, identify the critical path, and state how long the pipeline would take if every task took one unit of time.

3. **Find the `now()` bugs.** Search the code for `now()`, `today()`, `CURRENT_DATE`, `datetime.now`, and any hard-coded "yesterday" arithmetic. For each hit, rewrite the expression to use an injected interval start and end instead, and explain in one sentence what would have happened if that run had been re-executed six months later.

4. **Make one write idempotent.** Pick a task that writes data. Describe its current write semantics precisely (append, insert, overwrite whole table, merge). Then specify an idempotent version: what the partition or merge key is, what gets replaced, and what a second execution for the same interval would do. If the current version duplicates on re-run, show the exact duplicate that would appear.

5. **Choose a load strategy and defend it.** For one target table, estimate total row count, daily new rows, and whether rows are ever updated or deleted at the source. Decide full refresh or incremental, and write a short justification that names the change-detection column, the merge key, and the conditions under which you would run a full rebuild.

6. **Write the failure policy.** For your pipeline, produce a one-page policy that states: which failures retry and how many times; whether the pipeline fails open or closed and why; what the maximum acceptable lateness is before someone should be told; and who is told. Be specific enough that a teammate could implement it without asking you a question.
