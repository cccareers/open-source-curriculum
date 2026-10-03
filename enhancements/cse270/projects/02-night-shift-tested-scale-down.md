---
course_id: cse270
project_id: cse270-x02
title: "Night Shift: A Tested Scale-Down Function, Emulated First"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cse270-08
  - cse270-09
objectives:
  - Trigger operational work from events and schedules using serverless functions
competency_ids:
  - D4-S1-C04
---

## Scenario

Before the lesson 09 project touches a real account, the team lead wants the stop/start logic proven offline: it must only touch instances tagged `env=dev`, default to dry run, do nothing on a second invocation (at-least-once delivery), restore cleanly from a fully stopped state, and fail loudly on a malformed event so the dead-letter path can catch it. You will write the function against the AWS SDK and test it with **moto**, a library that emulates AWS APIs in memory — no account, no cost. Optionally you then deploy it to LocalStack with two EventBridge schedules. Learners on Azure or Google Cloud write the same logic against their SDK and replace moto with hand-written fakes; the test cases are identical.

## What you will build / produce

- `main.py` — `handler(event, context)` (thin) and `apply_schedule(ec2, tag_key, tag_value, action, dry_run) -> dict` (all logic), returning `{"status", "changed", "would_change", "skipped"}`.
- `test_main.py` — the suite below, passing.
- `fixtures/schedule-stop.json`, `fixtures/schedule-start.json` — the constant inputs each schedule passes (`{"action": "stop"}` / `{"action": "start"}`).
- `COST.md` — the R15-style arithmetic from lesson 09 for a hypothetical dev fleet, with every rate labelled "illustrative" or cited with page and date.
- Optional: `deploy-localstack.sh` creating the function and two schedule rules on LocalStack.

## Before you start (prerequisites, starter files or data)

- Python 3.10+; `python -m venv .venv && . .venv/bin/activate && pip install "moto[ec2]>=5" boto3 pytest` and pin with `pip freeze > requirements.txt`.
- Contract: `handler` reads `TARGET_TAG` (`key=value`), `DRY_RUN` (default **true** when unset), `LOG_LEVEL`; it raises `ValueError` when the event has no `action`. `apply_schedule` must paginate `describe_instances` (use the SDK paginator) and only act on instances in the opposite state.
- Optional LocalStack: `docker run --rm -d -p 4566:4566 localstack/localstack` and `pip install awscli-local`. Lambda on LocalStack runs your function in a container, so Docker socket access is required.

## Milestones

1. **Contract first.** Write the docstrings and return shape; run the suite and watch every test fail.
2. **Dry run.** Make `test_dry_run_changes_nothing` and `test_handler_defaults_to_dry_run` pass.
3. **Act, idempotently.** Pass the stop, second-stop, and restore tests by reading state before acting — never by catching "already stopped" errors.
4. **Fail loudly.** Pass the malformed-event test; explain in a comment why guessing an action would be worse than failing.
5. **Log for an unattended run.** One line per instance acted on (with the id) and a summary line with counts. Capture the log of a test run in `fixtures/sample-log.txt`.
6. **Cost note.** Complete `COST.md` for 12 dev instances stopped 19:00–07:00 weekdays and all weekend (108 of 168 hours), net of the function's own invocation cost.
7. **Optional deploy to LocalStack** with two schedule rules (UTC, local time in a comment), invoke each once with `awslocal lambda invoke`, and show instance states changing. Then delete the rules and function.

## Acceptance criteria

- [ ] `pytest -q` passes all six tests.
- [ ] The handler contains no EC2 call; all logic is in `apply_schedule`.
- [ ] With `DRY_RUN` unset, nothing changes.
- [ ] A second identical invocation reports `changed == 0`.
- [ ] Production-tagged instances are never touched.
- [ ] `COST.md` shows the arithmetic and labels every rate.
- [ ] If the optional deploy is done, teardown commands are included and were run.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
import os, pytest, boto3
from moto import mock_aws

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")
import main


@pytest.fixture
def ec2():
    with mock_aws():
        client = boto3.client("ec2")
        ami = client.describe_images(Owners=["amazon"])["Images"][0]["ImageId"]
        def launch(env):
            r = client.run_instances(ImageId=ami, MinCount=1, MaxCount=1, TagSpecifications=[
                {"ResourceType": "instance", "Tags": [{"Key": "env", "Value": env}]}])
            return r["Instances"][0]["InstanceId"]
        ids = {"dev": [launch("dev"), launch("dev")], "prod": [launch("prod")]}
        yield client, ids


def states(client, ids):
    r = client.describe_instances(InstanceIds=ids)
    return sorted(i["State"]["Name"] for res in r["Reservations"] for i in res["Instances"])


def test_dry_run_changes_nothing(ec2):
    client, ids = ec2
    out = main.apply_schedule(client, "env", "dev", "stop", dry_run=True)
    assert out["changed"] == 0 and out["would_change"] == 2
    assert states(client, ids["dev"]) == ["running", "running"]


def test_stop_only_targets_dev(ec2):
    client, ids = ec2
    main.apply_schedule(client, "env", "dev", "stop", dry_run=False)
    assert states(client, ids["dev"]) == ["stopped", "stopped"]
    assert states(client, ids["prod"]) == ["running"]


def test_second_stop_is_a_no_op(ec2):
    client, _ = ec2
    main.apply_schedule(client, "env", "dev", "stop", dry_run=False)
    again = main.apply_schedule(client, "env", "dev", "stop", dry_run=False)
    assert again["changed"] == 0 and again["skipped"] == 2


def test_restore_from_fully_reduced_state(ec2):
    client, ids = ec2
    main.apply_schedule(client, "env", "dev", "stop", dry_run=False)
    out = main.apply_schedule(client, "env", "dev", "start", dry_run=False)
    assert out["changed"] == 2 and states(client, ids["dev"]) == ["running", "running"]


def test_handler_defaults_to_dry_run(ec2, monkeypatch):
    client, ids = ec2
    monkeypatch.setenv("TARGET_TAG", "env=dev")
    monkeypatch.delenv("DRY_RUN", raising=False)
    out = main.handler({"action": "stop"}, None)
    assert out["changed"] == 0 and states(client, ids["dev"]) == ["running", "running"]


def test_malformed_event_fails_loudly(ec2, monkeypatch):
    monkeypatch.setenv("TARGET_TAG", "env=dev")
    with pytest.raises(ValueError):
        main.handler({}, None)
```

Run: `pytest -q`. moto's `mock_aws` intercepts every boto3 call inside the fixture, so the suite cannot reach a real account even if credentials are present — but the fake environment variables at the top are set anyway as a second guard.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Event-driven design | Logic inside the handler | Thin handler; logic testable with plain arguments | Event-id deduplication for a hypothetical notification side effect |
| Safety | Dry run optional or default off | Dry run is the default and tested | Adds a "max instances per run" guard with a test |
| Idempotency | Relies on API errors | State-checked, second run is a no-op | Restore path tested from partially stopped state too |
| Cost reasoning | No numbers | Net saving with labelled rates | Compares against a scheduled ASG min-size change and says which fits this fleet |

## Stretch goals
- Add a resource-event path: an `EC2 Instance State-change Notification` fixture that triggers the lesson 05 owner-tag check on just that instance, tested with moto.
- Use `context.get_remaining_time_in_millis()` (fake it in tests with a stub object) to return a partial result cleanly.
- Port the logic to Azure Functions or Google Cloud Run functions and note what changed.

## Reflection prompts
- Which test would have caught a real outage, and which only a bill?
- What does moto not emulate that a real account will throw at you (permissions, throttling, capacity errors on start)?
- If the restore schedule fails at 07:00, who finds out, and how?

## Instructor notes (common pitfalls, how to adapt for time)
- moto 5 uses the single `mock_aws` decorator/context manager; older tutorials use `mock_ec2`, which no longer exists.
- moto's `describe_images(Owners=["amazon"])` returns a fixed catalogue of fake AMIs, which is why the fixture can launch instances without a real image ID.
- A reference implementation (about 45 lines) was used to validate this suite on moto 5.2 / Python 3.12; keep it out of learners' hands until after submission.
- Short on time: skip milestone 7 and the stretch goals.
