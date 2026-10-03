---
course_id: de210
project_id: de210-x02
title: "Event-Triggered partner_x Ingest with a Sweep, Locally"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - de210-07
  - de210-08
objectives:
  - Trigger pipeline work from cloud events instead of a fixed schedule
  - Instrument a pipeline so that a failed or late run is detected and diagnosed quickly
competency_ids:
  - D6-S1-C02
  - D6-S2-C03
  - D5-S2-C03
  - D1-S1-C03
---

## Scenario

The `partner_x` refund files from lesson 4 now arrive unpredictably between 04:00 and 09:00, sometimes in bursts of dozens. Finance wants refunds visible within minutes of arrival instead of the next morning. You will rebuild the trigger as event-driven — "function decides, orchestrator does" — but without a cloud account: a filesystem watcher stands in for object-storage notifications, a SQLite table stands in for the queue (with visibility timeout, retries, and a dead-letter queue), and a plain Python "handler" stands in for the serverless function. The design, the failure modes, and the tests are the same ones lesson 8 asks you to reason about in the cloud.

## What you will build / produce

- `events/queue.py` — a SQLite-backed queue: `send`, `receive(visibility_s)`, `ack`, `nack`, with `attempts` and a `dead_letter` table after N attempts.
- `events/notifier.py` — watches `incoming/partner_x/` and enqueues an event only when a `_SUCCESS` marker is created (the notification filter).
- `events/handler.py` — consumes events, derives a deterministic run id from the prefix, and calls `trigger_run(run_id, conf)`; treats "run id already exists" as success.
- `events/trigger.py` — a local stand-in for the orchestrator API that records runs in `ops.runs` and rejects duplicate run ids with a 409-style exception (or calls a real Airflow `/dags/{id}/dagRuns` endpoint if you have Airflow running from de210-x01).
- `events/sweep.py` — the scheduled safety net: lists `incoming/partner_x/*/_SUCCESS`, compares against `ops.processed_prefixes`, and triggers anything missing.
- `tests/test_events.py` — the suite below, passing.
- `RUNBOOK.md` — what to do when the DLQ is non-empty; how to trace one file end to end by correlation id.

## Before you start (prerequisites, starter files or data)

- Python 3.11, `pip install pytest watchdog` (watchdog for the notifier; tests drive the queue directly so they do not depend on filesystem timing).
- Reuse `fake_sources/drop.py` from de210-x01 to create deliveries: `drop.py --ds 2024-03-05 --root incoming/` writes CSVs then `_SUCCESS` last.
- Correlation id: the notifier stamps each event with `corr_id = sha1(prefix)[:12]`; every log line, queue row, run row, and loaded row carries it.

## Milestones

1. **Queue semantics.** Implement at-least-once delivery: a received message is invisible for `visibility_s`; if not acked, it reappears with `attempts + 1`; after 3 attempts it moves to `dead_letter`.
2. **Filter at the source.** The notifier ignores data files and enqueues once per `_SUCCESS`.
3. **Idempotent trigger.** The handler derives `run_id = "evt__" + prefix.replace("/", "_")`. A duplicate delivery hits the existing run id and is acked as success. Record processing *after* the trigger succeeds, never before (the ordering trap noted in lesson 8).
4. **Poison handling.** An event pointing at a missing prefix fails every attempt and lands in the DLQ; an alert function fires when DLQ depth > 0.
5. **Coalesce a burst.** Drop 40 deliveries in one minute; implement a debounce window so the handler triggers one run per window covering all ready prefixes, and record runs triggered and total duration with and without coalescing.
6. **Sweep.** Disable the notifier, drop two deliveries, run the sweep, and show both processed exactly once.
7. **Trace.** Given a file name, produce its full history from the correlation id.

## Acceptance criteria

- [ ] `pytest -q` passes.
- [ ] Three deliveries of the same event produce exactly one run.
- [ ] A trigger failure on first attempt is retried and eventually succeeds; the event is not lost.
- [ ] Poison events reach the DLQ after the configured attempts and the alert fires once.
- [ ] The sweep closes a gap without duplicating anything the event path already handled.
- [ ] `RUNBOOK.md` has a five-line DLQ procedure and a worked correlation-id trace.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# tests/test_events.py
import pytest

from events import handler, queue, sweep, trigger


@pytest.fixture()
def env(tmp_path, monkeypatch):
    db = tmp_path / "ops.db"
    q = queue.Queue(db, max_attempts=3)
    t = trigger.LocalTrigger(db)
    (tmp_path / "incoming/partner_x/2024-03-05").mkdir(parents=True)
    (tmp_path / "incoming/partner_x/2024-03-05/_SUCCESS").write_text("")
    return tmp_path, q, t


def event(prefix):
    return {"prefix": prefix, "corr_id": "abc123", "source": "partner_x"}


def test_duplicate_deliveries_trigger_one_run(env):
    root, q, t = env
    for _ in range(3):
        q.send(event("incoming/partner_x/2024-03-05"))
    handler.drain(q, t, root=root, visibility_s=0)
    assert t.count_runs() == 1
    assert q.depth() == 0


def test_trigger_failure_is_retried_not_lost(env, monkeypatch):
    root, q, t = env
    calls = {"n": 0}
    real = t.trigger_run

    def flaky(run_id, conf):
        calls["n"] += 1
        if calls["n"] == 1:
            raise ConnectionError("orchestrator unavailable")
        return real(run_id, conf)

    monkeypatch.setattr(t, "trigger_run", flaky)
    q.send(event("incoming/partner_x/2024-03-05"))
    handler.drain(q, t, root=root, visibility_s=0)   # first attempt fails, message reappears
    handler.drain(q, t, root=root, visibility_s=0)   # second attempt succeeds
    assert t.count_runs() == 1
    assert q.dead_letter_depth() == 0


def test_poison_event_goes_to_dlq(env):
    root, q, t = env
    q.send(event("incoming/partner_x/1999-01-01"))     # prefix does not exist
    for _ in range(4):
        handler.drain(q, t, root=root, visibility_s=0)
    assert q.dead_letter_depth() == 1
    assert t.count_runs() == 0


def test_sweep_closes_gap_without_duplicates(env):
    root, q, t = env
    q.send(event("incoming/partner_x/2024-03-05"))
    handler.drain(q, t, root=root, visibility_s=0)
    (root / "incoming/partner_x/2024-03-06").mkdir(parents=True)
    (root / "incoming/partner_x/2024-03-06/_SUCCESS").write_text("")   # no event: notifier was down
    triggered = sweep.run(root / "incoming/partner_x", t)
    assert triggered == ["incoming/partner_x/2024-03-06"]
    assert t.count_runs() == 2
    assert sweep.run(root / "incoming/partner_x", t) == []


def test_run_ids_are_derived_from_the_event(env):
    root, q, t = env
    q.send(event("incoming/partner_x/2024-03-05"))
    handler.drain(q, t, root=root, visibility_s=0)
    assert t.run_ids() == ["evt__incoming_partner_x_2024-03-05"]
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Delivery semantics | Assumes exactly-once | Derived run ids; duplicates harmless; record-after-trigger ordering | Explains at-least-once failure windows with a sequence diagram |
| Failure handling | Retries forever | Bounded attempts, DLQ, alert on depth | DLQ replay tool with idempotent re-drive |
| Safety net | None | Sweep closes gaps idempotently | Sweep and event path share one processed-prefixes contract, tested |
| Observability | Unstructured logs | Correlation id end to end | Trace produced from a file name in under a minute |

## Stretch goals

- Swap the local pieces for MinIO bucket notifications and a real queue, keeping the handler and tests unchanged.
- Trigger the real `orders_event_ingest` DAG from de210-x01's Airflow via its REST API.

## Reflection prompts

- Which part of this design would be hardest to debug in a real cloud, and how does the correlation id help?
- When would you keep a scheduled trigger instead of switching to events?

## Instructor notes (common pitfalls, how to adapt for time)

- The most common bug is writing the dedupe/processed record before the trigger call; `test_trigger_failure_is_retried_not_lost` catches it.
- `visibility_s=0` makes tests deterministic; mention that real queues need a visibility timeout longer than the handler's runtime.
- Short on time: skip coalescing (milestone 5); keep the sweep.
