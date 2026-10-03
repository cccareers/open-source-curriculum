---
lesson_id: de101-08
course_id: de101
pathway: data-engineer
title: Data Quality Fundamentals
order: 8
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Apply profiling and quality checks to a raw dataset before it is used downstream
---

## Wrong data is worse than no data

A pipeline that fails loudly costs an afternoon. A pipeline that quietly delivers wrong numbers costs trust, and trust is the only real asset a data team has. Once an executive has been embarrassed by a chart, every future number from your team gets checked by hand, and the value of everything you built collapses.

So the last stage of this course is the one that protects all the others: knowing what is actually in a dataset before anyone depends on it, cleaning what can be cleaned, and refusing to let the rest through silently.

The word "quality" is too vague to act on, so break it into dimensions you can measure:

- **Completeness.** Are the values that should be present actually present? Are all the rows here — did the file have 40,000 rows yesterday and 4,000 today?
- **Validity.** Do values conform to their rules? Is `state_code` one of the fifty valid codes? Is `email` shaped like an email? Is `quantity` positive?
- **Accuracy.** Do values match reality? This is the hardest dimension because it usually cannot be checked from inside the data — it requires a second source or a human who knows.
- **Consistency.** Do related values agree? Does the order header total equal the sum of its lines? Does the customer count in this table match the customer table?
- **Uniqueness.** Is each real-world thing represented once? Are there two rows for the same order id?
- **Timeliness.** Is the data current enough for its purpose? Freshness is a quality attribute, and a perfectly clean table that stopped updating on Tuesday is a broken table.

Every check you write serves one of these. Naming which one keeps a check suite from turning into an unstructured pile of assertions.

## Profiling: look before you build

**Profiling is the systematic description of a dataset before you write a line of transformation logic.** It is the most commonly skipped step in data engineering and the one that saves the most time, because almost every assumption you would have made silently gets tested in ten minutes.

Profile every new source, and re-profile when a source changes. What you are gathering:

**Structural facts.** Row count, column count, column names, and the type each column actually holds versus the type it is declared as. A column declared numeric that arrives as text with thousands separators is a five-minute discovery or a three-week mystery.

**Per-column statistics.** For every column: null count and null rate, number of distinct values, and the most frequent values with their counts. For numerics: min, max, mean, and a few percentiles. For dates: min and max, plus a count by month. For text: min and max length, and the distinct patterns present.

**Candidate keys.** Which column, or combination, is unique? If nothing is unique, you do not yet know the grain, and you cannot safely join or deduplicate.

**Relationships.** Do foreign keys resolve? How many `order_lines` rows reference a `product_id` that is not in `products`?

Here is a profiler small enough to keep in your toolbox and run against anything.

```python
import pandas as pd

def profile(df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    rows = []
    for col in df.columns:
        s = df[col]
        non_null = s.dropna()
        top = non_null.value_counts().head(top_n)
        rows.append({
            "column": col,
            "dtype": str(s.dtype),
            "rows": len(s),
            "nulls": int(s.isna().sum()),
            "null_rate": round(float(s.isna().mean()), 4),
            "distinct": int(non_null.nunique()),
            "is_unique": bool(non_null.is_unique and s.isna().sum() == 0),
            "min": non_null.min() if len(non_null) else None,
            "max": non_null.max() if len(non_null) else None,
            "min_len": int(non_null.astype(str).str.len().min()) if len(non_null) else None,
            "max_len": int(non_null.astype(str).str.len().max()) if len(non_null) else None,
            "top_values": "; ".join(f"{v!r}={c}" for v, c in top.items()),
        })
    return pd.DataFrame(rows)
```

The same work in SQL, when the data has already landed:

```sql
SELECT
  COUNT(*)                                              AS row_count,
  COUNT(order_status)                                   AS status_non_null,
  COUNT(*) - COUNT(order_status)                        AS status_nulls,
  COUNT(DISTINCT order_id)                              AS distinct_orders,
  COUNT(*) - COUNT(DISTINCT order_id)                   AS duplicate_orders,
  MIN(placed_at)                                        AS earliest,
  MAX(placed_at)                                        AS latest
FROM staging_orders;

-- what values does this column actually take?
SELECT order_status, COUNT(*) AS n
FROM staging_orders
GROUP BY order_status
ORDER BY n DESC;
```

That second query is the highest-value ten seconds in this lesson. Run it on every low-cardinality column of every new source. It is how you discover that `order_status` has seven values rather than the four in the documentation, that three of them differ only by capitalization, and that one is the empty string.

### Reading a profile

Findings and what they should make you ask:

| Observation | Question it raises |
| --- | --- |
| A column is 100% null | Is it deprecated, or did extraction drop it? |
| Null rate jumped from 2% to 40% | Did the source change, or did the extract break? |
| `distinct` equals `rows` on a supposed category column | It is an identifier, not a category |
| `distinct` is 2 on a supposed identifier | Extraction is returning the same page twice |
| `max_len` is exactly 50 on many values | Something upstream truncated at a column width |
| `max` date is in the future | A timezone bug, a default sentinel, or free-text entry |
| `min` numeric is `-999` or `0` on an amount | A sentinel value standing in for "missing" |
| Row count is 30% of yesterday's | A partial file, or a filter that changed meaning |

Sentinel values deserve their own warning. `-1`, `0`, `9999`, `1900-01-01`, `"N/A"`, `"unknown"`, and the literal string `"NULL"` are all real-world stand-ins for missing data. If you do not detect them, they silently enter your averages. A `-999` in an age column drags a cohort mean into nonsense, and nobody notices for a quarter.

## Cleaning: the decisions, not the code

Cleaning is where you convert raw values into believed values. The mechanics are easy; the discipline is in deciding what a cleaning step is allowed to do and writing that decision down.

The governing rule: **clean in the staging layer, never in the raw layer, and never in place.** Raw stays exactly as received so that any cleaning decision can be revisited. Cleaning produces a new table.

### Standardization

Whitespace, casing, and formatting variation cause more failed joins than any genuinely hard problem.

```sql
SELECT
  TRIM(customer_name)                              AS customer_name,
  LOWER(TRIM(email))                               AS email,
  UPPER(TRIM(state_code))                          AS state_code,
  REGEXP_REPLACE(phone, '[^0-9]', '', 'g')         AS phone_digits,
  CAST(NULLIF(TRIM(order_total), '') AS NUMERIC)   AS order_total
FROM raw_customers;
```

Standardize to a canonical form and apply it identically on both sides of every join. `"  Ohio"`, `"OHIO"`, and `"ohio"` are three groups in a `GROUP BY` and one value in the real world.

Categorical values usually need an explicit mapping rather than a formatting rule, because the variants are not mechanical:

```sql
CASE LOWER(TRIM(order_status))
  WHEN 'paid'      THEN 'paid'
  WHEN 'payment_received' THEN 'paid'
  WHEN 'shipped'   THEN 'shipped'
  WHEN 'cancelled' THEN 'cancelled'
  WHEN 'canceled'  THEN 'cancelled'
  ELSE 'unknown'
END AS order_status
```

Note the `ELSE 'unknown'` rather than `ELSE NULL` or a silent pass-through of the original. Unmapped values must be countable, because the day the source adds an eighth status you want a number that rises, not a value that quietly flows through as itself.

### Types and dates

Cast explicitly and handle failure explicitly. An implicit cast that errors takes down the whole load for one bad row; an implicit cast that succeeds wrongly is worse.

Dates are the richest source of quiet corruption. `03/04/2024` is 3 April or 4 March depending on which side of an ocean it was typed, and nothing in the data tells you which. Establish the source's convention by asking, not by inspecting — inspection only works when a day value exceeds twelve, which for a small sample it may never do. Store timestamps in UTC with an explicit offset recorded on ingestion, and be suspicious of any date that is exactly midnight for every row, which usually means a time component was discarded somewhere.

### Missing values

For every column with nulls you have four options, and choosing thoughtlessly is the defect:

1. **Leave it null.** Almost always right for facts. A missing value is information; it means "we do not know."
2. **Impute a default.** Only when the null genuinely means a known value — a missing discount that truly means zero discount. Never impute an average into a fact table; that is fabrication, and downstream nobody can tell your invention from a measurement.
3. **Reject the row.** Right when the row is unusable — no primary key, no date to place it on.
4. **Flag it.** Keep the row, add a boolean column recording that the value was missing. Best of both when downstream consumers differ in what they can tolerate.

Whichever you choose, record it in the data dictionary. "`shipping_cost` is null when the order predates 2022, when we did not capture it" is the sentence that stops six future people from investigating the same anomaly.

### Deduplication

First establish what a duplicate *is*, which requires knowing the grain. Exact duplicates — byte-identical rows — usually come from your own pipeline re-ingesting a window and are harmless once you deduplicate on the key. Key duplicates — two rows with the same `order_id` and different contents — are the interesting case, and they usually mean you have captured two versions of a changing record.

The standard resolution is to keep the most recent version per key:

```sql
DELETE FROM staging_orders a
USING staging_orders b
WHERE a.order_id = b.order_id
  AND (a.updated_at < b.updated_at
       OR (a.updated_at = b.updated_at AND a.ctid < b.ctid));
```

`ctid` is PostgreSQL's physical row identifier, used here only as a tie-breaker when two versions share the same `updated_at`; other engines have no equivalent, and there you deduplicate into a new table instead: `ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) = 1`. That version also honours the "never in place" rule above, so prefer it when you can.

Before deleting anything, count what you are about to remove and compare it to what you expected. A dedup step that suddenly removes 40% of rows is not a dedup step working well; it is a symptom.

Fuzzy duplicates — the same customer entered twice with a typo — are a genuinely hard problem involving normalization, blocking, and similarity scoring. Recognize them, count them, and escalate rather than silently merging. Merging two customers who are actually different people is a much more expensive error than leaving two records for one person.

## Validation: checks that run every time

Profiling is what you do once, by hand, to understand a source. **Validation is what runs on every load, forever.** Write checks as code, in version control, next to the pipeline.

Assign every check a **severity**, because not all failures deserve the same response:

- **Blocking.** The pipeline stops and nobody consumes the output. Reserve this for checks where publishing would be worse than publishing nothing: primary key not unique, row count zero, required column absent.
- **Quarantine.** Offending rows are routed to a side table with the failure reason; the rest proceed. Right for row-level validity failures in a large batch.
- **Warn.** Recorded and alerted, load proceeds. Right for anomaly signals that are often benign, like a 15% volume change.

```python
def validate(df, run_id):
    failures = []
    def check(name, condition, severity, detail=""):
        if not condition:
            failures.append({"run_id": run_id, "check": name,
                             "severity": severity, "detail": detail})

    check("row_count_positive", len(df) > 0, "blocking")
    check("order_id_unique", df["order_id"].is_unique, "blocking",
          detail=f"{len(df) - df['order_id'].nunique()} duplicate keys")
    check("order_id_not_null", df["order_id"].notna().all(), "blocking")
    check("status_in_domain",
          df["order_status"].isin({"pending", "paid", "shipped", "cancelled"}).all(),
          "quarantine",
          detail=str(sorted(set(df["order_status"]) -
                            {"pending", "paid", "shipped", "cancelled"})))
    check("total_non_negative", (df["order_total"] >= 0).all(), "quarantine")
    check("placed_at_not_future",
          (df["placed_at"] <= pd.Timestamp.utcnow()).all(), "warn")
    check("freshness",
          df["placed_at"].max() >= pd.Timestamp.utcnow() - pd.Timedelta(days=2),
          "warn", detail=f"latest={df['placed_at'].max()}")
    return failures
```

The categories worth covering on any dataset:

- **Schema.** Expected columns exist; types are as expected. A source that adds a column is usually fine; one that removes or renames one breaks everything downstream, and you want to know at ingestion rather than from an analyst.
- **Key integrity.** Primary key unique and non-null; foreign keys resolve. `SELECT COUNT(*) FROM order_lines l LEFT JOIN products p ON p.product_id = l.product_id WHERE p.product_id IS NULL` should be zero, and if it is not, that number is a fact about the source you should report upstream.
- **Domain.** Categorical values within their allowed set; numerics within plausible bounds; dates within a plausible window.
- **Cross-field consistency.** `shipped_at` is not before `placed_at`. `quantity * unit_price` equals `extended_price` to the cent.
- **Reconciliation.** The total in your table matches the source's own reported total. This is the only check in the list that can catch an *accuracy* problem, and it is worth the effort to obtain a control total from the source.
- **Volume and freshness.** Today's row count is within a sensible band of the recent average; the newest record is recent enough. These two catch the majority of real incidents, because most breakage shows up as "nothing arrived" or "far too little arrived."

### Quarantine properly

```sql
CREATE TABLE quarantine_orders (
  run_id        VARCHAR(32)  NOT NULL,
  quarantined_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_name    VARCHAR(100) NOT NULL,
  reason        TEXT,
  payload       TEXT         NOT NULL   -- the original raw record
);
```

The payload is the whole original record so the row can be repaired and replayed. And a quarantine table must have an owner and a review cadence; one that nobody reads is a delete with a comforting name.

### Track quality over time

Write every check result to a small history table — run id, check name, severity, pass or fail, and the measured value. Two things become possible that a pass/fail alone cannot give you. You can see a **trend**: a null rate creeping from 1% to 9% over three weeks is invisible per-run but obvious in a chart, and it is usually the early warning of an upstream change. And you can set thresholds from **observed history** rather than guessing — "row count within three standard deviations of the last 30 days" adapts as the business grows, where a hard-coded 10,000 will alert every Monday and never on the day it matters.

### Where the checks belong

Push each check as far upstream as it can go. A validity rule that a source system could enforce at entry — a dropdown instead of a free-text field — is worth one conversation and removes the problem permanently, and that conversation is exactly the upstream collaboration from lesson 2. Rules the source will not enforce become ingestion-time checks. Business-rule checks belong at the curated layer, right where the logic they guard lives.

Finally, close the loop: when a check catches something, tell the source owner with specifics — the run, the count, three example records. Data quality that is only ever repaired downstream is a treadmill; data quality fixed at the source is finished work.

A note on scope: these checks are written by hand here on purpose, so you understand precisely what each one asserts. Frameworks that declare check suites, and the broader disciplines of governance, lineage, and handling of sensitive data, come later in this pathway. The judgement is what transfers.

## Practice

You will need a deliberately messy dataset. Take the e-commerce database from lesson 4 and export `orders` joined to `customers` as CSV, adding an `order_total` column computed as `SUM(quantity * unit_price)` from `order_lines` (the lesson 3 `orders` table has no total of its own), then corrupt it — or have a classmate corrupt it, which is better because you will not know what to look for. Introduce at least: 3% nulls in two columns, some duplicate `order_id` values with differing contents, at least four capitalization and spelling variants of `order_status`, some `order_total` values as text with currency symbols and thousands separators, a `-999` sentinel in a numeric column, mixed date formats, some emails with leading and trailing whitespace, a handful of `customer_id` values that exist in no customer record, and one date in the year 2087.

**1. Profile blind.** Without opening the file in a spreadsheet or looking at how it was corrupted, run a profiler over it and produce a profile table covering every column. Then write a findings memo of at most one page listing every anomaly you detected, what you suspect caused each, and what you would ask the source owner. Only then compare against the actual list of corruptions. Score yourself: what did you miss, and what would have caught it?

**2. Design the cleaning, then justify it.** For each anomaly, write down the decision *before* writing code: standardize, impute, flag, reject, or escalate — and one sentence of why. Pay particular attention to the `-999` and the 2087 date, and state explicitly what you would do if you could not reach the source owner for a week.

**3. Implement it.** Build a `raw` to `staging` transformation, in SQL or Python, that applies your decisions. It must not modify the raw data. Emit the row count at each step so the losses are visible, and produce a short before-and-after comparison: rows in, rows quarantined, rows out, and the distinct value counts of each categorical column before and after standardization.

**4. Write the check suite.** Implement at least ten checks spanning schema, key integrity, domain, cross-field consistency, volume, and freshness. Assign each a severity and justify the blocking ones — a check suite where everything blocks will be switched off by the first person woken up by it. Run the suite against both the raw and the cleaned dataset and show the two result sets side by side.

**5. Prove the quarantine works.** Route failing rows to a quarantine table with the reason and original payload attached. Then repair three quarantined rows by hand, replay them through the staging transformation, and show they land correctly without duplicating anything already loaded.

**6. Report it.** Produce a one-page data quality report for this dataset, aimed at the analyst who will use it: what the dataset contains, its grain, which columns you would trust without reservation, which come with caveats and what those caveats are, what you rejected and why, and how fresh the data is. This is the artifact that determines whether your work gets used, so write it for a reader who does not know what you did.
