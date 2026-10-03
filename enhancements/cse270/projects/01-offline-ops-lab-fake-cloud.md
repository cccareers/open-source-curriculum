---
course_id: cse270
project_id: cse270-x01
title: "Offline Ops Lab: Test-Driven Scripts Against a Fake Cloud"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: warm-up
related_lessons:
  - cse270-02
  - cse270-03
  - cse270-04
objectives:
  - Write Bash scripts that automate repetitive cloud operations tasks safely
  - Write Python scripts that query and manage cloud resources through a provider CLI or SDK
competency_ids:
  - D4-S1-C01
---

## Scenario

Lessons 02 and 04 deliberately use a generic `cloud` CLI so the shape of the work is visible without provider trivia — but that CLI does not exist, so learners cannot run the examples as written, and every mistake in a destructive loop costs a real sandbox. This lab supplies a small fake `cloud` command (about 90 lines of Python) that keeps its "account" in a local JSON file, supports exactly the verbs the lessons use, paginates, and can be told to fail. You will build lesson 02's `tag-audit.sh` and lesson 04's `orphan-report.py` against it, with an acceptance suite that proves dry run, idempotency, the empty case, authentication checks, stream separation, and pagination — at zero cost and zero risk. Then you translate the finished script to your real provider's CLI.

## What you will build / produce

- `tag-audit.sh` — lesson 02 practice, passing `test_tag_audit.py`.
- `orphan-report.py` — lesson 04 practice (snapshots whose `volume_id` is missing or not in the volume list), passing `test_orphan_report.py` (you write it, modelled on the Bash suite).
- `TRANSLATION.md` — each fake `cloud` command you used, with the equivalent real command for your cse203 provider, and anything that did not translate cleanly (pagination flags, output shapes).

## Before you start (prerequisites, starter files or data)

- Bash 4+, `jq`, Python 3.10+, `pip install pytest`; `shellcheck` recommended.
- Save the fake CLI as `cloud` (executable) and put its directory on `PATH`. State lives in the file named by `FAKECLOUD_STATE`.

```python
#!/usr/bin/env python3
"""Fake `cloud` CLI for cse270 practice. State lives in $FAKECLOUD_STATE (JSON)."""
import json, os, sys

STATE = os.environ.get("FAKECLOUD_STATE", "fakecloud-state.json")

def load():
    with open(STATE) as fh:
        return json.load(fh)

def save(s):
    with open(STATE, "w") as fh:
        json.dump(s, fh, indent=2)

def fail(msg, code=1):
    print(f"cloud: error: {msg}", file=sys.stderr)
    sys.exit(code)

def opt(args, name, default=None):
    if name in args:
        i = args.index(name)
        if i + 1 >= len(args):
            fail(f"{name} needs a value", 2)
        return args[i + 1]
    return default

def emit(obj, args):
    if opt(args, "--format") != "json":
        fail("only --format json is supported by this fake", 2)
    print(json.dumps(obj))

def project_items(s, kind, args):
    project = opt(args, "--project")
    if not project:
        fail("--project is required", 2)
    if project not in s["projects"]:
        fail(f"project {project} not found or permission denied", 1)
    return s["projects"][project].setdefault(kind, [])

def paged(items, args):
    size = int(opt(args, "--page-size", "1000"))
    start = int(opt(args, "--page-token", "0"))
    page = {"items": items[start:start + size]}
    if start + size < len(items):
        page["next_page_token"] = str(start + size)
    return page

def main(argv):
    s = load()
    if s.get("fail_next"):
        s["fail_next"] -= 1; save(s); fail("503 service unavailable (injected)", 1)
    cmd = [a for a in argv if not a.startswith("--")][:3]
    if argv[:2] == ["auth", "whoami"]:
        if not s.get("authenticated", True):
            fail("not authenticated", 1)
        print(json.dumps({"principal": "apprentice@example.test"})); return 0
    if cmd[:2] == ["compute", "instance"] and cmd[2:] == ["list"]:
        emit(paged(project_items(s, "instances", argv), argv), argv); return 0
    if argv[:4] == ["compute", "instance", "tag", "set"]:
        iid, kv = argv[4], argv[5]
        key, _, val = kv.partition("=")
        for inst in project_items(s, "instances", argv):
            if inst["id"] == iid:
                inst.setdefault("tags", {})[key] = val; save(s); return 0
        fail(f"instance {iid} not found", 1)
    if cmd[:2] == ["compute", "volume"] and cmd[2:] == ["list"]:
        emit(paged(project_items(s, "volumes", argv), argv), argv); return 0
    if cmd[:2] == ["compute", "snapshot"] and cmd[2:] == ["list"]:
        emit(paged(project_items(s, "snapshots", argv), argv), argv); return 0
    if argv[:3] == ["compute", "snapshot", "delete"]:
        sid, items = argv[3], project_items(s, "snapshots", argv)
        keep = [x for x in items if x["id"] != sid]
        if len(keep) == len(items):
            fail(f"snapshot {sid} not found", 1)
        items[:] = keep; save(s); return 0
    fail(f"unknown command: {' '.join(argv)}", 2)

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

- Seed state (`seed.json`). Note the deliberate traps: `i-004` has no `tags` key at all, `i-006` has a tag value with spaces, `snap-c` has no `volume_id`, and `empty` is a project with nothing in it.

```json
{"authenticated": true, "fail_next": 0,
 "projects": {"sandbox": {
   "instances": [
     {"id": "i-001", "state": "running", "tags": {"owner": "ana", "env": "dev"}},
     {"id": "i-002", "state": "stopped", "tags": {"env": "dev"}},
     {"id": "i-003", "state": "running", "tags": {}},
     {"id": "i-004", "state": "running"},
     {"id": "i-005", "state": "running", "tags": {"owner": "raj"}},
     {"id": "i-006", "state": "stopped", "tags": {"env": "dev name with spaces"}},
     {"id": "i-007", "state": "running", "tags": {}}
   ],
   "volumes": [{"id": "vol-1"}, {"id": "vol-2"}],
   "snapshots": [
     {"id": "snap-a", "volume_id": "vol-1", "created": "2026-01-02T00:00:00Z"},
     {"id": "snap-b", "volume_id": "vol-9", "created": "2026-01-05T00:00:00Z"},
     {"id": "snap-c", "created": "2026-02-01T00:00:00Z"},
     {"id": "snap-d", "volume_id": "vol-2", "created": "2026-09-30T00:00:00Z"}
   ]},
  "empty": {"instances": [], "volumes": [], "snapshots": []}}}
```

- Supported commands: `auth whoami`; `compute instance list|volume list|snapshot list --project P --format json [--page-size N] [--page-token T]`; `compute instance tag set ID key=value --project P`; `compute snapshot delete ID --project P`. Set `"authenticated": false` to simulate a logged-out session, or `"fail_next": 2` to make the next two calls fail with a 503 (for lesson 04's retry work).

## Milestones

1. **Run the fake by hand.** `cp seed.json state.json; export FAKECLOUD_STATE=$PWD/state.json PATH=$PWD:$PATH; cloud compute instance list --project sandbox --format json --page-size 3 | jq .` — read the `next_page_token`.
2. **Write `tag-audit.sh`** following lesson 02's practice steps 1–6, dry run first.
3. **Run the acceptance suite** below until green. Do not edit the tests to pass; edit the script.
4. **Write `orphan-report.py`** following lesson 04's practice steps 1–7, using `--page-size 2` so pagination is exercised, CSV to stdout, logs to stderr.
5. **Write `test_orphan_report.py`**: at minimum, the CSV has a header and one row per snapshot; `snap-b` is `fail`, `snap-c` is `unknown`, `snap-a` and `snap-d` are `pass`; with `"fail_next": 2` the run still succeeds via retries; with `"fail_next": 10` it exits 1 with a traceback in stderr.
6. **Translate.** Fill `TRANSLATION.md`, then run the real `tag-audit.sh` against your sandbox with `--dry-run` only, and attach the output.

## Acceptance criteria

- [ ] `pytest test_tag_audit.py` passes (7 tests; shellcheck test may skip if not installed).
- [ ] `pytest test_orphan_report.py` passes with the cases in milestone 5.
- [ ] Neither script contains a hard-coded project.
- [ ] `TRANSLATION.md` maps every command and notes at least one non-trivial difference.
- [ ] A real-provider dry-run transcript is attached, and no real run was made without the instructor's sign-off.

## Automated checks (coding courses) / Evidence checklist (non-coding)

`test_tag_audit.py` — the script must tag every instance missing `--tag` with `--value` (default `unassigned`), print `changed=<n>` in its stderr summary, and exit 64 on usage errors:

```python
import json, os, shutil, subprocess, pathlib, pytest

HERE = pathlib.Path(__file__).parent
SCRIPT = os.environ.get("SCRIPT", str(HERE / "tag-audit.sh"))

@pytest.fixture
def env(tmp_path):
    state = tmp_path / "state.json"
    shutil.copy(HERE / "seed.json", state)
    e = dict(os.environ, FAKECLOUD_STATE=str(state), PATH=f"{HERE}:{os.environ['PATH']}")
    return e, state

def run(env, *args):
    return subprocess.run([SCRIPT, *args], env=env[0], capture_output=True, text=True, timeout=30)

def untagged(state, key="owner"):
    s = json.loads(state.read_text())
    return sorted(i["id"] for i in s["projects"]["sandbox"]["instances"] if key not in (i.get("tags") or {}))

def test_missing_project_is_usage_error(env):
    r = run(env, "--tag", "owner")
    assert r.returncode == 64 and "Usage" in r.stderr

def test_dry_run_changes_nothing_and_names_ids(env):
    before = env[1].read_text()
    r = run(env, "--project", "sandbox", "--tag", "owner", "--dry-run")
    assert r.returncode == 0
    assert env[1].read_text() == before
    for iid in ["i-002", "i-003", "i-004", "i-006", "i-007"]:
        assert iid in r.stdout, f"dry run should name {iid}"

def test_real_run_then_idempotent(env):
    assert run(env, "--project", "sandbox", "--tag", "owner").returncode == 0
    assert untagged(env[1]) == []
    r2 = run(env, "--project", "sandbox", "--tag", "owner")
    assert r2.returncode == 0 and "changed=0" in r2.stderr

def test_empty_project_is_zero_iterations(env):
    r = run(env, "--project", "empty", "--tag", "owner")
    assert r.returncode == 0 and "changed=0" in r.stderr

def test_unauthenticated_stops_before_acting(env):
    s = json.loads(env[1].read_text()); s["authenticated"] = False
    env[1].write_text(json.dumps(s))
    before = env[1].read_text()
    r = run(env, "--project", "sandbox", "--tag", "owner")
    assert r.returncode != 0
    assert env[1].read_text() == before, "no instance may be tagged before the auth check"

def test_logs_go_to_stderr_with_timestamps(env):
    r = run(env, "--project", "sandbox", "--tag", "owner")
    lines = [l for l in r.stderr.splitlines() if l.strip()]
    assert lines and all(l[:4].isdigit() and "[" in l for l in lines)
    assert r.stdout.strip() == ""

def test_shellcheck_clean():
    if not shutil.which("shellcheck"):
        pytest.skip("shellcheck not installed")
    assert subprocess.run(["shellcheck", SCRIPT]).returncode == 0
```

Run with `pytest -q`. The suite copies `seed.json` into a temp directory per test, so runs never interfere with each other or with your hand-testing state.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Safety | Dry run added after the destructive path | Dry run, idempotency, auth check, and empty case all pass | Default is dry run; `--apply` required to mutate, tests updated accordingly |
| Correctness | Fails on `i-004` (no tags key) or spaces | All seven tests pass | Adds a test for a failing tag call mid-loop (R11-style partial failure) |
| Python | Reads first page only | Paginated, correlated with a set, CSV/stderr separated | Narrow retries with jitter proven by `fail_next` tests |
| Translation | Commands only | Commands plus differences | Notes pagination and output-shape differences with real JSON samples |

## Stretch goals
- Extend the fake with `compute instance stop|start` and write lesson 09's scale-down logic as a script first.
- Add a `bats` suite for the Bash script alongside the pytest one.
- Run both suites in the lesson 06 pipeline as the `test` stage.

## Reflection prompts
- Which test failed first, and what habit from lesson 02 would have prevented it?
- What does the fake not simulate that a real provider will do to you (rate limits, eventual listing, partial failures)?
- How would you convince a colleague your script is safe to run on Friday afternoon?

## Instructor notes (common pitfalls, how to adapt for time)
- The `i-004` record (no `tags` key) breaks naive `jq` filters like `.tags.owner == null` only in some shapes; `(.tags // {}) | has($t)` is the robust form.
- Learners who pipe into `while` get `changed=0` on the real run and fail `test_real_run_then_idempotent` — a useful, visible failure.
- The fake is intentionally permissive about flag order; real CLIs are not. `TRANSLATION.md` is where that gap is surfaced.
- Short on time: do milestones 1–3 and 6 only.
