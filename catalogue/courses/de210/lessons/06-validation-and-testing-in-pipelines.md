---
lesson_id: de210-06
course_id: de210
pathway: data-engineer
title: Validation and Testing in Pipelines
order: 6
kind: lesson
competency_ids:
  - D2-S1-C03
  - D2-S1-C01
objectives:
  - Add validation gates that stop bad data before it reaches a consumer
---

## From profiling to enforcement

Earlier in this pathway you learned to **profile** a dataset: compute null rates, distinct counts, min and max, distributions, and the pattern of the values in a column, in order to understand what you had. Profiling is analysis, performed by a human, at a moment in time.

This lesson is about the automated descendant of that work. A **validation gate** is a check that runs inside a live pipeline, on every run, with a *consequence*: when the data does not meet the standard, the pipeline stops, quarantines, or alerts, and the bad data does not reach the consumer. The profile tells you what "normal" looks like; the gate enforces it forever afterwards, at three in the morning, without you.

The distinction that makes gates worth building is the difference between two failure modes. A pipeline that **fails loudly** costs you a morning. A pipeline that **succeeds with wrong data** costs you the organisation's trust in every number you publish, and you often do not find out for weeks. Almost every design decision in this lesson trades a little more of the first to eliminate the second.

## Clean first, then check

Validation is not a substitute for cleaning. A great many "anomalies" are simply raw data in its natural state, and the right response is a documented transformation in the staging layer, not an alert. Clean what is deterministic and knowable; validate what should never happen.

The cleaning work that belongs in staging, in roughly the order you apply it:

**Structural coercion.** Cast strings to the types they represent, parse timestamps into a single timezone (store UTC; convert at the edge), strip byte-order marks and non-breaking spaces, and normalise Unicode so that visually identical strings compare equal. Mojibake such as `Ã©` where `é` belongs is an encoding mismatch at ingest, not a data problem — fix the reader, not the rows.

**Canonicalisation.** Trim whitespace, fold case for identifiers and codes, standardise country and currency codes to a single standard, normalise phone numbers and postcodes to one format, and map the eleven spellings of a status field onto your four. Do this in one place — a staging model or a shared macro — so that every downstream comparison sees the same form.

**Null and sentinel handling.** Source systems encode "unknown" as an empty string, `"NULL"`, `"N/A"`, `-1`, `0`, and `1900-01-01`. Decide per column which of those mean null, convert them once, and record the decision in the column's description. Then decide the policy for genuine nulls: default them, propagate them, or reject the row. Silently defaulting a null amount to zero is how a revenue figure quietly goes wrong.

**Deduplication.** Establish the grain and enforce it. The standard pattern keeps the most recently ingested version of each key:

```sql
select *
from (
    select *,
           row_number() over (
               partition by order_id
               order by _ingested_at desc, updated_at desc
           ) as rn
    from {{ source('raw', 'orders') }}
)
where rn = 1
```

Note that this *chooses* a winner. Two rows with the same key and genuinely conflicting content are a source problem; picking the latest is a defensible convention, but it must be a stated convention rather than an accident of the `ORDER BY`.

**Referential tidying.** Decide how unmatched foreign keys are represented — an "unknown" dimension row is usually better than a null, because it survives inner joins and keeps totals correct.

Everything above is deterministic and repeatable, which is what makes it cleaning. When the correct response requires judgement, or when the input violates something you assert can never happen, it is a validation matter instead.

## The seven checks worth writing

Validation checks fall into a small number of families. Cover these and you have covered most of what actually goes wrong.

**Schema and type.** Do the expected columns exist, with the expected types, and has anything been added or removed? Schema drift is the single most common cause of downstream breakage, and it is trivially detectable: compare the current column set against the recorded contract and fail on a removal or a type change.

**Uniqueness and grain.** Is the key unique at the grain you claim? A duplicated key is the fault that most reliably inflates a metric, because a fan-out join multiplies rows invisibly.

**Nullability and domain.** Are required fields present, are enumerated values within the allowed set, are numeric fields inside plausible bounds, do dates fall in a sane range? A `quantity` of −3 or an `order_date` in 2087 is not a rounding error; it is a source bug you should catch on arrival.

**Referential integrity.** Does every foreign key resolve? Warehouses do not enforce constraints, so this is on you. Orphan rows are the reason a fact table's total does not match the sum of a dimension's slices.

**Freshness.** Is the newest record recent enough? This is the check that catches the most damaging failure of all: a pipeline that succeeds while the source has quietly stopped sending. A green run over stale data looks exactly like a green run over fresh data unless someone is checking timestamps.

**Volume.** Is the row count for this run inside its expected range? Compare against a fixed floor for cheap protection, and against a rolling baseline for real coverage:

```sql
with today as (
    select count(*) as n from {{ ref('fct_orders') }}
    where order_date = '{{ ds }}'
),
baseline as (
    select avg(n) as mean_n, stddev(n) as sd_n
    from (
        select order_date, count(*) as n
        from {{ ref('fct_orders') }}
        where order_date between date('{{ ds }}') - 28 and date('{{ ds }}') - 1
        group by 1
    )
)
select today.n, baseline.mean_n
from today, baseline
where today.n < baseline.mean_n - 3 * baseline.sd_n
   or today.n > baseline.mean_n + 3 * baseline.sd_n
```

Volume checks catch half-loaded files, a filter that became too aggressive, and a source that duplicated its export. Be careful with the baseline: weekly seasonality is real, so compare like days, and exclude known outliers or the baseline will absorb the anomaly you are trying to detect.

**Distribution and reconciliation.** Has the *shape* of the data moved, even though every row is individually valid? A null rate that jumps from 2% to 40%, a currency mix that flips, a category that vanishes, an average order value that doubles — each is a legitimate change or a serious bug, and only a check will tell you which. Reconciliation is the strongest version of this: compare your warehouse's totals against the source system's own totals for the same window, and alert on a difference beyond a tolerance. It is the only check that verifies the pipeline as a whole rather than one of its steps.

## Where the gates go

A check with no placement is just a query. Gates belong at the boundaries between layers, because that is where you can still stop the damage.

**At ingest, on the raw data.** Cheap structural checks only: the file parsed, the manifest matched, the row count is not zero, the required columns exist. The goal is to reject a corrupt delivery before it costs you a transformation run.

**Between raw and staging.** Contract enforcement: schema, types, key uniqueness, domain validity. This is the busiest gate, and the natural home for row-level quarantine.

**Between staging and marts.** Business-rule checks: referential integrity, invariants such as "an order's line items sum to its total", grain assertions on the fact table.

**Before publication.** Freshness, volume, reconciliation, and any check that concerns the dataset as a whole rather than its rows. This is the last gate, and the one that decides whether consumers see the new data at all.

In dbt terms these map onto tests declared on sources, on staging models, and on marts, executed in dependency order by `dbt build` so a failure stops its dependents. In Airflow terms they map onto explicit check tasks placed between the corresponding groups. Most real pipelines use both: dbt tests for anything expressible as "this query should return no rows", and orchestrator tasks for cross-system checks such as reconciliation against a source API.

## Choosing the consequence

For every check, decide in advance what happens when it fires. There are four legitimate answers, and picking the wrong one is how teams end up ignoring alerts.

**Block.** The task fails, downstream tasks do not run, nothing is published. Correct for anything that would make the output wrong rather than incomplete: a broken key, a failed reconciliation, a schema removal.

**Quarantine and continue.** Bad rows are diverted to a rejects table with a reason; good rows proceed. Correct when records fail independently and partial data is genuinely useful. The rejects table is a first-class output, not a bin:

```sql
insert into quality.rejected_orders
select
    r.*,
    case
        when r.order_id is null                   then 'missing_order_id'
        when r.amount_usd < 0                     then 'negative_amount'
        when r.status not in ('pending','paid','shipped','cancelled')
                                                  then 'unknown_status'
    end                                            as reject_reason,
    '{{ ds }}'                                     as data_interval,
    '{{ run_id }}'                                 as run_id
from {{ ref('stg_orders_candidate') }} r
where r.order_id is null
   or r.amount_usd < 0
   or r.status not in ('pending','paid','shipped','cancelled')
```

A quarantine with nobody reading it is a silent data-loss mechanism. Pair it with a threshold — if more than a small percentage of rows are rejected, that is no longer a row problem, it is a source problem, and the gate should block.

**Warn.** Record and notify, publish anyway. Correct for signals that are frequently benign: a modest distribution shift, a null rate rising within tolerance. Everything you set to warn must have a named owner who looks at warnings, or you have simply written a check with no consequence.

**Circuit-break.** The strongest form of block: freeze the *published* dataset at its last known-good state and route consumers to it, rather than merely failing the run. This is what "stop bad data before it reaches a consumer" means in its full form, and it needs a publication step that is separable from the build step — build into a staged relation, validate it, and only then swap it into the consumer-facing name.

```python
    build_candidate >> run_quality_gates >> publish_swap
```

With that shape, a failed gate leaves consumers on yesterday's correct data instead of today's wrong data, and the fix is a re-run rather than a restoration.

## Writing checks that people trust

Coverage is not the goal; *trustworthiness* is. Three failure modes ruin a validation suite.

**Too many checks that never fire** cost run time and attention and teach nobody anything. Prefer a small set aimed at the failures you have actually seen or can specifically imagine.

**Checks that fire constantly** are worse than no checks, because a team that mutes one alert learns to mute all of them. If a check fires most weeks and the response is always "that's fine", either the threshold is wrong, the data genuinely changed and the check is stale, or it should never have been an error. Fix or delete it — a permanently red check is a broken instrument.

**Checks with no diagnostic value** tell you something failed without telling you what. Every check should surface the offending rows or the offending number. dbt's convention of "the test query returns the failing rows" is exactly right; carry it into hand-written checks by storing failures rather than only raising.

Three practical habits: derive thresholds from the profile rather than inventing them, so a bound reflects real history; set thresholds where a *human decision* changes, not where the data looks tidy; and version thresholds in code so a loosened bound is a reviewed change rather than a quiet edit.

## Resolving what a gate catches

Detection is half the job. The other half is a repeatable resolution loop, and it is the same loop every time.

**Triage.** Read the failure's rows. Is this a source problem, an ingestion problem, a transformation problem, or a stale check? Distinguish "the data is wrong" from "the data changed and our rule is out of date" before touching anything — they have opposite fixes.

**Contain.** Confirm consumers are not reading the bad data. If the gate blocked or circuit-broke, they are not, and you have time. If bad data escaped, that comes first: revert the publication or restore the previous partition.

**Diagnose.** Trace the offending rows upstream through the layers, using the audit columns your ingestion adds. `_source_file`, `_run_id`, and `_ingested_at` are what turn "some rows are wrong" into "the 03:00 run of the partner file on the 5th brought them", which is usually most of the answer.

**Fix at the right level.** Repair the source if it is a source bug and you can influence it. Repair the transformation if the logic is wrong. Loosen or tighten the check if the rule was wrong. Never repair by editing the marts by hand — a manual `UPDATE` on a derived table is undone by the next run and invisible to everyone.

**Reprocess.** Re-run the affected intervals. This is the payoff for idempotency: because every task replaces its own slice, backfilling the four days between the bug and its discovery reproduces them correctly, with no residue from the bad runs.

**Close the loop.** Add the check that would have caught it sooner, or tighten the one that caught it late. A quality suite should grow by one rule per incident, not by fifty rules written in one enthusiastic afternoon.

Keep a short record of each incident — what fired, what the cause was, what was reprocessed. It takes ten minutes and it is what stops the same failure being diagnosed from scratch three months later.

## Practice

Extend the pipeline you have been building. Every gate you add must have a stated consequence and be exercised with data that actually triggers it.

1. **Write the contract.** For your main raw table, profile it and record a contract: expected columns and types, the grain, required fields, allowed values for each enumerated column, plausible numeric and date ranges, and the expected daily row-count range with its baseline period. Check it into the repository as YAML or Markdown.

2. **Clean deterministically.** In your staging model, implement type coercion, timestamp normalisation to UTC, trimming and case-folding of codes, sentinel-to-null conversion for at least two sentinel values you actually found, and de-duplication to the declared grain with an explicit tie-break. Document each rule in the model's YAML description.

3. **Gate the raw-to-staging boundary.** Add schema, uniqueness, not-null, and accepted-values checks at that boundary. Corrupt the raw data four ways — remove a column, duplicate a key, null a required field, introduce an unknown status — and confirm each is caught by the right check and reports the offending rows.

4. **Build a quarantine path.** Convert your row-level checks from blocking to quarantine-and-continue: rejected rows land in a rejects table with a reason, an interval, and a run id, while valid rows proceed. Then add a threshold so that a reject rate above a level you choose escalates to a blocking failure. Demonstrate both behaviours with a small and a large batch of bad rows, and justify your threshold in one sentence.

5. **Detect a volume anomaly.** Implement the rolling-baseline volume check against your fact table. Load a day at roughly half its normal size and confirm it fires. Then load a day that is legitimately low — a weekend or a holiday, if your data has one — and record whether you got a false positive. Adjust the baseline to compare like days and re-test.

6. **Detect a freshness failure.** Add a freshness check on your source and set thresholds from the ingestion schedule. Simulate a stopped source by skipping one interval's ingest, then run the pipeline and confirm the freshness gate fails even though every task succeeded. Write two sentences on what would have happened without it.

7. **Detect a distribution shift.** Add a check on the null rate or category mix of one column, with a threshold derived from four weeks of history. Inject data that shifts it, confirm the check fires, and then argue in writing whether this particular check should block or warn.

8. **Reconcile against the source.** Write a check that compares the warehouse's row count and summed amount for one interval against the same figures pulled directly from the source system, with a stated tolerance. Run it against a clean interval and against one where you have deliberately dropped rows during ingest.

9. **Add the circuit-breaker.** Restructure the DAG so that models build into a staged relation, gates run against it, and a publish step swaps it into the consumer-facing name only on success. Force a gate failure and confirm the consumer-facing table still holds the previous good data. Record the swap mechanism you used and whether it is atomic on your warehouse.

10. **Run the resolution loop.** Take the failure from exercise 9, work it end to end — triage, contain, diagnose using the audit columns, fix at the correct level, reprocess the affected intervals, and add or tighten one check. Write a half-page incident note covering each step and the interval range you backfilled.
