---
lesson_id: cse270-04
course_id: cse270
pathway: cloud-support-engineer
title: Python for Cloud Automation
order: 4
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Write Python scripts that query and manage cloud resources through a provider CLI or SDK
---

## Where Bash stops paying

The script you wrote in the last project is fine. Keep it. Bash is the right tool for a sequence of commands with a little branching, and rewriting a working shell script in Python because Python is nicer is a waste of an afternoon.

Here is where it stops being fine. Take the snapshot pruner and add three ordinary operational requirements: only delete snapshots whose parent volume is already gone, retry the delete twice when the API returns a rate-limit error, and write a CSV of what was removed for the finance team. Now you are correlating two lists on a key, tracking per-item retry state, and formatting structured output — and every one of those is a paragraph of awkward Bash with an array of associative arrays in it.

The line is roughly this. Reach for Bash when the work is *run these commands in this order and stop if one fails*. Reach for Python when the work involves **structured data you have to hold in memory**, **relationships between records**, **control flow per item** such as retries and partial failure, or **output somebody else consumes as data**. Pagination pushes you over the line almost on its own, because it turns one call into a loop with accumulating state.

Everything from the Bash lesson still applies, and it is not optional because the language changed. Fail loudly, quote your inputs, offer a dry run, be idempotent, log what you did, exit with a meaningful status. The rest of this lesson is how each of those looks in Python.

## The shape of an operations script

Operations scripts in Python have a conventional skeleton. Use it; the familiarity is worth more than any personal style.

```python
#!/usr/bin/env python3
"""Prune snapshots whose parent volume no longer exists."""

import argparse
import logging
import sys

log = logging.getLogger("prune-snapshots")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, help="Project or subscription id")
    parser.add_argument("--keep", type=int, required=True, help="Snapshots to retain")
    parser.add_argument("--dry-run", action="store_true", help="Print, do not delete")
    parser.add_argument("--verbose", action="store_true", help="Debug logging")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        stream=sys.stderr,
    )
    ...
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Four details are doing real work. `argparse` gives you `--help`, type coercion, and required-flag enforcement for free — `type=int` means a non-numeric `--keep` is rejected before your code runs, which took a regex in Bash. `main` returns an integer and `sys.exit` passes it to the caller, so the script has an honest exit status. Logging is configured to write to **standard error** with a timestamp, leaving standard output clean for data. And the `if __name__` guard means the file can be imported by a test without executing anything.

This is where the boundary of the course sits, so it is worth stating plainly: you are writing scripts, not applications. No web framework, no plugin architecture, no packaging for distribution. A single file with functions in it is the target shape, and a second module is justified only when two scripts genuinely share code.

The one piece of environment hygiene you do need is a virtual environment and a pinned dependency list, because the pipeline in a later lesson will have to reproduce it:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install requests
pip freeze > requirements.txt
```

## Two ways to reach the cloud

You have two options, and both are legitimate.

**Shell out to the provider CLI.** You already know the commands, the CLI already handles authentication, and every example in your provider's documentation translates directly. The cost is that you are parsing JSON out of a subprocess and depending on the CLI being installed.

**Use the provider SDK.** You get typed objects, built-in pagination helpers, and built-in retry behaviour. The cost is another dependency, a second set of documentation, and API names that do not match the CLI verbs you already know.

For the scripts in this course, either is acceptable. Start with the CLI if the task is a thin wrapper around commands you already run; move to the SDK when you find yourself re-parsing the same JSON in three scripts. What matters is that you do whichever one properly.

## Calling the CLI without opening a hole

`subprocess.run` is the correct tool, and there is exactly one way to call it safely:

```python
import json
import subprocess


def cloud_json(args: list[str]) -> dict:
    """Run the provider CLI and parse its JSON output."""
    cmd = ["cloud", *args, "--format", "json"]
    log.debug("running: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(
            f"{' '.join(cmd)} failed with status {result.returncode}: "
            f"{result.stderr.strip()}"
        )
    return json.loads(result.stdout)
```

Pass a **list**, never a string, and never set `shell=True`. With a list, arguments go to the process exactly as written — a resource name containing a space or a semicolon is one argument, not two commands. `shell=True` re-introduces every quoting hazard from the Bash lesson and adds command injection on top, and there is no cloud-operations task that requires it.

`capture_output=True` with `text=True` gives you `stdout` and `stderr` as strings. `check=False` plus an explicit status test lets you raise an error message that includes the command and the CLI's own complaint; `check=True` raises a `CalledProcessError` whose default message tells you nothing about *why*. Also set a `timeout=` on any call that could hang — a scheduled script blocked forever on a network call is worse than one that fails.

If you go the SDK route the shape is the same, with the SDK's own client in place of `cloud_json`. Everything below applies to both.

## Filtering structured data

Once the data is a Python object, the manipulation that was painful in Bash becomes ordinary:

```python
from datetime import datetime, timedelta, timezone

def stale_snapshots(project: str, older_than_days: int) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    snapshots = cloud_json(["compute", "snapshot", "list", "--project", project])
    volumes = {v["id"] for v in cloud_json(["compute", "volume", "list", "--project", project])["items"]}

    stale = []
    for snap in snapshots["items"]:
        created = datetime.fromisoformat(snap["created"].replace("Z", "+00:00"))
        if created < cutoff and snap.get("volume_id") not in volumes:
            stale.append(snap)
    return sorted(stale, key=lambda s: s["created"])
```

The `set` of volume ids is the point. That membership test is what made this task unreasonable in Bash, and it costs one line here. Note `snap.get("volume_id")` rather than `snap["volume_id"]`: cloud APIs omit fields rather than returning nulls, and `.get` returns `None` instead of raising `KeyError` on a record you did not anticipate. Never assume a field is present because it was present in the record you looked at.

Timestamps are a recurring trap. Compare timezone-aware datetimes only, and always work in UTC. Mixing a naive `datetime.now()` with a parsed API timestamp raises a `TypeError`, and if you fix it by dropping the timezone instead of adding one, you get an off-by-hours bug that only appears in some regions.

## Pagination

Most list APIs return a page at a time. A script that reads the first page and stops looks completely correct and quietly ignores most of your estate — this is the single most common defect in first-attempt inventory scripts.

```python
def list_all_instances(project: str) -> list[dict]:
    instances: list[dict] = []
    token: str | None = None
    while True:
        args = ["compute", "instance", "list", "--project", project, "--page-size", "100"]
        if token:
            args += ["--page-token", token]
        page = cloud_json(args)
        instances.extend(page.get("items", []))
        token = page.get("next_page_token")
        if not token:
            return instances
```

Two safeguards are worth adding in real scripts: a maximum page count so a server bug cannot loop forever, and a debug log line per page. If you use an SDK, look for its paginator helper before writing this by hand — most have one, and it will handle the token protocol correctly.

## Retries that do not make things worse

Rate limits and transient server errors are normal, not exceptional. Retry them; do not retry anything else.

```python
import random
import time

RETRYABLE = {429, 500, 502, 503, 504}


def with_retries(fn, *, attempts: int = 4, base: float = 1.0):
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except TransientCloudError as err:
            if attempt == attempts or err.status not in RETRYABLE:
                raise
            delay = base * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
            log.warning("attempt %d failed (%s); retrying in %.1fs", attempt, err, delay)
            time.sleep(delay)
```

Each retry waits twice as long as the last — that is the exponential part — plus a small random amount, the *jitter*. Jitter matters more than it looks: without it, twenty scripts that hit the same rate limit all retry at exactly the same moment and rate-limit each other again in lockstep.

Never retry on a permission error, a not-found, or a malformed request. Those will fail identically the second time and the only thing you gain is a longer wait before the operator sees the real problem. And be very careful retrying a *create*: if the first attempt actually succeeded and the response was lost, a blind retry makes two resources. Retry reads freely; retry writes only when the operation is idempotent or the API accepts a client-supplied idempotency key.

## Dry run and idempotency, again

Same discipline, Python syntax. Route every mutation through one place:

```python
class Runner:
    def __init__(self, dry_run: bool) -> None:
        self.dry_run = dry_run
        self.changed = 0

    def do(self, description: str, action) -> None:
        if self.dry_run:
            log.info("DRY RUN: would %s", description)
            return
        action()
        self.changed += 1
```

```python
runner.do(
    f"delete snapshot {snap['id']} created {snap['created']}",
    lambda: cloud_json(["compute", "snapshot", "delete", snap["id"]]),
)
```

The description is passed separately and includes real identifiers, so the dry-run output is reviewable. Idempotency works exactly as it did in Bash — read current state, compute the difference, act only on the difference:

```python
existing = {b["name"] for b in list_buckets(project)}
for name in wanted:
    if name in existing:
        log.info("bucket %s already exists; skipping", name)
        continue
    runner.do(f"create bucket {name}", lambda n=name: create_bucket(n))
```

The `n=name` default argument is not decoration. A `lambda` closing over the loop variable captures the *variable*, not its value, so without it every deferred call would use the last name in the list. This is a real bug that appears the moment you collect actions and run them later.

## Failing well

Let exceptions carry the detail, catch them where you can make a decision, and keep the exit status honest:

```python
def main(argv=None) -> int:
    args = parse_args(argv)
    ...
    failures = 0
    for snap in targets:
        try:
            runner.do(f"delete snapshot {snap['id']}", lambda s=snap: delete(s["id"]))
        except RuntimeError:
            log.exception("failed to delete %s", snap["id"])
            failures += 1

    log.info("done: examined=%d changed=%d failed=%d dry_run=%s",
             len(targets), runner.changed, failures, args.dry_run)
    return 1 if failures else 0
```

`log.exception` inside an `except` block writes the message *and* the traceback, which is what a person debugging a scheduled run at 6am actually needs. A bare `except:` or `except Exception: pass` anywhere in an operations script is a defect — it converts a failure into a silent success, and silent successes are how a broken nightly job goes unnoticed for a month.

For output somebody else consumes, print data to standard output while diagnostics go to standard error. Because the two streams are separate, `./prune.py --project acme > report.csv` gives a clean file and still shows you the log:

```python
import csv

writer = csv.writer(sys.stdout)
writer.writerow(["snapshot_id", "created", "size_gb"])
for snap in deleted:
    writer.writerow([snap["id"], snap["created"], snap["size_gb"]])
```

## Practice

Work against the provider account you used in cse203. Keep everything in one file.

1. **Skeleton and arguments.** Create `orphan-report.py` with the shebang, a module docstring, `argparse`, logging configured to standard error, `main(argv)` returning an int, and the `if __name__` guard. Flags: `--project` (required), `--older-than-days` (`type=int`, default 30), `--dry-run`, `--verbose`. Confirm `--help` reads correctly and that a non-numeric `--older-than-days` is rejected with a non-zero exit.

2. **Wrap the CLI.** Write `cloud_json(args)` using `subprocess.run` with a list, `capture_output=True`, `text=True`, and an explicit status check that raises with the command and the captured stderr in the message. Call it once and print the number of records returned. Then deliberately pass a bad subcommand and confirm your error message names both the command and the CLI's complaint.

3. **Paginate.** Turn the list call into a loop that follows the page token until it is absent, logging one debug line per page. Set `--page-size` small — 5 or 10 — so you can prove more than one page is fetched, and check the total against what the console shows.

4. **Correlate two lists.** Fetch a second resource type and build a `set` of its ids. Report every record of the first type that is older than the cutoff *and* whose parent id is not in that set. Use timezone-aware UTC datetimes throughout, and use `.get()` for any field that might be missing.

5. **Emit two streams.** Write the findings to standard output as CSV with a header row, and every diagnostic to standard error. Prove the separation by redirecting standard output to a file and confirming the log still appears on your terminal and the file contains only CSV.

6. **Add the mutation, safely.** Add a `Runner` with a `dry_run` flag and use it to tag each orphaned resource `review=pending`. Run with `--dry-run` and verify the output names real ids. Run it for real, then run it again and confirm the second run reports everything already tagged and exits 0.

7. **Make it survive a failure.** Add retry-with-backoff around the mutating call for rate-limit and 5xx statuses only. Then force a failure on one resource — revoke a permission, or pass one deliberately invalid id — and confirm the script logs it with a traceback, continues to the remaining resources, prints a summary with a non-zero failure count, and exits 1.
