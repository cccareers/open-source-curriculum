---
course_id: ds320
project_id: ds320-x01
title: "sales_ops Least-Privilege and Suppression: Controls You Can Prove with Tests"
kind: supplementary-project
status: draft
hours_estimate: 7
difficulty: core
related_lessons:
  - ds320-03
  - ds320-04
  - ds320-06
objectives:
  - Classify a dataset and grant access according to least privilege
  - Map GDPR and CCPA obligations onto the data a pipeline actually holds
  - Produce lineage and audit evidence that answers a regulator's or auditor's question
competency_ids:
  - D5-S1-C01
  - D5-S1-C02
  - D5-S1-C03
---

## Scenario

The `sales_ops` warehouse from lessons 2-6 (`raw.crm_contacts`, `raw.orders`, `raw.web_events`, `mart.customer_ltv`) is about to be opened to marketing analysts and tier-1 support agents, and the nightly vendor audience export is being turned on. The data owner (head of customer operations) has approved the access model on one condition: every control must be **provable on demand** by a script an auditor can re-run, not by a screenshot. You will implement the controls in a local PostgreSQL and write a pytest suite that is, in effect, the evidence pack's "method" section.

This is engineer-facing work, not legal advice. Where an obligation depends on a legal decision, your deliverable routes the question rather than answering it.

## What you will build / produce

- `docker-compose.yml` running PostgreSQL 16.
- `sql/01_schema.sql` and `sql/02_seed.sql` — the `sales_ops` schema with synthetic data (below).
- `sql/10_classification.sql` — `governance.column_classification` populated for every column.
- `sql/20_access.sql` — roles, grants, default privileges, safe view, row-level security.
- `sql/30_privacy.sql` — `privacy.suppression_list`, `privacy.deletion_log`, the export view `exports.campaign_audience_v`, and an erasure procedure.
- `sql/40_detective.sql` — two detective-control queries as views.
- `tests/test_controls.py` — the suite below, passing.
- `EVIDENCE.md` — a four-section evidence pack (question, method, artifacts, attestation) answering: "Show that marketing analysts cannot read customer email, and that opted-out subjects never reach the vendor export."

## Before you start (prerequisites, starter files or data)

- Docker, Python 3.10+, `pip install pytest "psycopg[binary]"`.
- **Synthetic data** (`02_seed.sql`, deterministic via `setseed(0.2)` and `generate_series`):
  - `raw.crm_contacts`: 1,000 rows; `contact_id` 1-1000; `full_name` `'Contact ' || id`; `email` `'c' || id || '@example.test'`; `phone`; `country` in `DE, FR, GB, US`; `region` in `eu, uk, us_ca, us_other`; `marketing_consent` boolean; `created_at`.
  - `raw.orders`: 4,000 rows referencing contacts; `amount_cents`, `currency`, `placed_at`.
  - `raw.web_events`: 10,000 rows with `ip_address` (`10.x.x.x`), `device_id`, `session_id`.
  - `mart.customer_ltv`: built by `INSERT ... SELECT` from the raw tables: `contact_id`, `email`, `region`, `lifetime_value_cents`, `first_order_at`, `segment`.
  - Never use real personal data. The `.test` domain is reserved and cannot deliver mail.
- Roles to create: `analyst_marketing`, `support_tier1`, `engineer_pipeline` (NOLOGIN functional roles) and login users `dana` (analyst), `sam` (support, region `eu`), `svc_pipeline` (pipeline).

## Milestones

1. **Classify.** Populate `governance.column_classification` for every column in the four tables using the four-label scheme. Direct and online identifiers are Confidential at minimum. Write one-line justifications in the `data_category` column or a comments file.
2. **Revoke and grant.** Revoke defaults from `PUBLIC`; grant schema and table privileges to functional roles only; set `ALTER DEFAULT PRIVILEGES` for `mart`. Marketing reads `mart.customer_ltv_safe` (no `email`); support reads `mart.customer_ltv` restricted by RLS to `region = current_setting('app.user_region', true)`, with `FORCE ROW LEVEL SECURITY`. Explain in a comment where `app.user_region` would be set in production and why `sam` cannot set it.
3. **Suppress at the edge.** Create `exports.campaign_audience_v` that joins `mart.customer_ltv` to `privacy.suppression_list` with an anti-join and requires `marketing_consent = true`. The vendor export job may read only this view.
4. **Erase surgically.** Write `privacy.erase_subject(contact_id int, actor text)`: nulls identifiers in `raw.crm_contacts` and `mart.customer_ltv`, leaves `raw.orders` intact (seven-year tax retention, pending legal confirmation), and appends to `privacy.deletion_log`.
5. **Detect.** Create `governance.v_unclassified_columns` (columns with no registry row) and `governance.v_grant_drift` (grants in `information_schema.table_privileges` not present in an `governance.approved_grants` table you populate from your access model).
6. **Test.** Make `tests/test_controls.py` pass. Then introduce three deliberate defects (a stray `GRANT SELECT ON ALL TABLES IN SCHEMA raw TO analyst_marketing`, a new unclassified column, removing the suppression join) and show the right test fails for each. Restore.
7. **Write the evidence pack.** Use the test file and its output as the method and artifacts. Include at least one honest gap (for example: no audit log of reads yet; `information_schema` visibility limits).

## Acceptance criteria

- [ ] `docker compose up -d && for f in sql/*.sql; do psql -f $f; done && pytest -q` passes from scratch.
- [ ] No privilege is granted to an individual login role except role membership.
- [ ] Every column of every `sales_ops` table appears in the classification registry.
- [ ] Each deliberate defect in milestone 6 causes exactly the expected test to fail (captured output in `EVIDENCE.md`).
- [ ] `EVIDENCE.md` has all four sections, includes the actual SQL/pytest used, and states at least one gap with owner and date.
- [ ] At least three yes/no questions for legal/privacy are listed (for example: "Does pseudonymizing `contact_id` in `raw.orders` satisfy an erasure request where tax retention applies?").

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_controls.py -- run against the local container.
import os

import psycopg
import pytest

ADMIN = os.environ.get("ADMIN_DSN", "postgresql://postgres:postgres@localhost:5432/sales_ops")


def connect_as(user):
    # Users are created with password = username in 20_access.sql (local test only).
    return psycopg.connect(f"postgresql://{user}:{user}@localhost:5432/sales_ops", autocommit=True)


@pytest.fixture(scope="module")
def admin():
    with psycopg.connect(ADMIN, autocommit=True) as c:
        yield c


def test_every_column_is_classified(admin):
    rows = admin.execute("SELECT * FROM governance.v_unclassified_columns").fetchall()
    assert rows == [], f"unclassified: {rows}"


def test_analyst_cannot_read_email_from_mart(admin):
    with connect_as("dana") as c:
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            c.execute("SELECT email FROM mart.customer_ltv LIMIT 1")
        cols = [d.name for d in c.execute("SELECT * FROM mart.customer_ltv_safe LIMIT 1").description]
        assert "email" not in cols


def test_analyst_cannot_read_raw(admin):
    with connect_as("dana") as c:
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            c.execute("SELECT 1 FROM raw.crm_contacts LIMIT 1")


def test_support_sees_only_own_region(admin):
    with connect_as("sam") as c:
        c.execute("SET app.user_region = 'eu'")   # in production set by the trusted connection layer
        regions = {r[0] for r in c.execute("SELECT DISTINCT region FROM mart.customer_ltv")}
        assert regions == {"eu"}


def test_rls_is_forced(admin):
    forced = admin.execute("""
        SELECT relforcerowsecurity FROM pg_class
        WHERE oid = 'mart.customer_ltv'::regclass""").fetchone()[0]
    assert forced is True


def test_no_direct_grants_to_login_users(admin):
    rows = admin.execute("""
        SELECT grantee, table_schema, table_name, privilege_type
        FROM information_schema.table_privileges
        WHERE grantee IN ('dana', 'sam', 'svc_pipeline')""").fetchall()
    assert rows == [], rows


def test_no_grant_drift(admin):
    rows = admin.execute("SELECT * FROM governance.v_grant_drift").fetchall()
    assert rows == [], f"grants not in approved model: {rows}"


def test_suppressed_subject_never_exported(admin):
    cid = admin.execute("""
        SELECT contact_id FROM raw.crm_contacts WHERE marketing_consent LIMIT 1""").fetchone()[0]
    admin.execute("""
        INSERT INTO privacy.suppression_list (contact_id, scope, opted_out_at)
        VALUES (%s, 'sale_or_share', now()) ON CONFLICT DO NOTHING""", (cid,))
    n = admin.execute(
        "SELECT count(*) FROM exports.campaign_audience_v WHERE contact_id = %s", (cid,)).fetchone()[0]
    assert n == 0


def test_no_unconsented_subject_exported(admin):
    n = admin.execute("""
        SELECT count(*) FROM exports.campaign_audience_v a
        JOIN raw.crm_contacts c USING (contact_id)
        WHERE NOT c.marketing_consent""").fetchone()[0]
    assert n == 0


def test_erasure_removes_identifiers_keeps_orders_and_logs(admin):
    cid = 42
    orders_before = admin.execute(
        "SELECT count(*) FROM raw.orders WHERE contact_id = %s", (cid,)).fetchone()[0]
    admin.execute("SELECT privacy.erase_subject(%s, 'pytest')", (cid,))
    email, name = admin.execute(
        "SELECT email, full_name FROM raw.crm_contacts WHERE contact_id = %s", (cid,)).fetchone()
    assert email is None and name is None
    assert admin.execute(
        "SELECT email FROM mart.customer_ltv WHERE contact_id = %s", (cid,)).fetchone()[0] is None
    assert admin.execute(
        "SELECT count(*) FROM raw.orders WHERE contact_id = %s", (cid,)).fetchone()[0] == orders_before
    logged = admin.execute(
        "SELECT count(*) FROM privacy.deletion_log WHERE subject_key = %s::text", (cid,)).fetchone()[0]
    assert logged >= 1


def test_pipeline_cannot_drop_schema(admin):
    with connect_as("svc_pipeline") as c:
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            c.execute("DROP SCHEMA mart CASCADE")
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Classification | Table-level only | Every column labelled with justification; propagation to mart shown | Lineage-based propagation check flags a mislabelled derived column |
| Least privilege | Grants to people or `PUBLIC` | Functional roles, safe view, forced RLS, default privileges | Time-bounded break-glass role with alerting described |
| Privacy capabilities | Suppression as an analyst filter | Suppression and consent at the export edge; erasure logged | Restore-replay procedure re-applies `deletion_log` after a snapshot restore |
| Evidence | Screenshots | Reproducible pytest method and outputs in the four-section pack | Pack states gaps with owner, date, and compensating control |
| Routing legal questions | Decides lawfulness | Lists yes/no questions with owner | Links each question to the specific table/column it affects |

## Stretch goals

- Enable `pgaudit` (lesson 6) for `raw.crm_contacts` and add a test that parses the log for the analyst's denied attempt (from the server error log) and the pipeline's write.
- Add `lineage.edge` rows for `mart.customer_ltv` and a test that fails if any Internal column has a Confidential upstream.

## Reflection prompts

- Which of your controls is preventive, which detective, and which would you add a corrective response to first?
- If the data owner asked "can marketing see email?", what exactly would you send them, and why is a test run better than a screenshot?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners frequently test RLS as the table owner or superuser and conclude it works; `test_rls_is_forced` and testing as `sam` prevent that.
- `information_schema.table_privileges` only shows rows where the current role is grantor, grantee, or a member of the grantee; run `v_grant_drift` as a superuser or use `pg_class.relacl` via `aclexplode` for a complete view. Verify on your PostgreSQL version.
- Passwords equal to usernames are for a throwaway local container only; say so explicitly to learners.
- Short on time: provide `01_schema.sql` and `02_seed.sql`; learners write access, privacy, and tests.
