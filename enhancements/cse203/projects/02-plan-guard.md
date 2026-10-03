---
course_id: cse203
project_id: cse203-x02
title: "Plan Guard: Block Dangerous Terraform Plans"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - cse203-05
  - cse203-06
objectives:
  - Explain the principles that make infrastructure declarative, reproducible, and reviewable
  - Define and update infrastructure with Terraform, including state, variables, and modules
competency_ids:
  - D4-S1-C02
---

## Scenario

Lesson 05's review exercise showed a plan that would open SSH to the internet and destroy a database replica, presented as a routine change. At Riverside Community Trust the contractor who inherits your environment will be reviewing plans alone. You will build a small tool that reads a saved Terraform plan and refuses — with a clear explanation — any plan that replaces or destroys a protected resource type or opens an inbound port to the internet. It runs entirely offline against plan JSON files, so it costs nothing and needs no cloud account.

## What you will build / produce

- `plan_guard.py` — reads `terraform show -json` output and exits 0 (safe), 1 (blocked), printing one line per finding.
- `fixtures/` — at least five plan JSON files (provided starters below plus two you write).
- `test_plan_guard.py` — pytest suite, passing.
- `POLICY.md` — the human-readable rule the tool enforces, and the override process (who may approve a blocked plan and how it is recorded).

## Before you start (prerequisites, starter files or data)

- Python 3.9+, `pip install pytest`. Terraform is optional (only needed to generate your own fixtures).
- Minimal fixture shape — Terraform's JSON plan format lists each change's `actions`:

```json
{"resource_changes": [
  {"address": "aws_db_instance.main", "type": "aws_db_instance",
   "change": {"actions": ["delete", "create"], "after": {}}},
  {"address": "aws_instance.app", "type": "aws_instance",
   "change": {"actions": ["update"], "after": {"instance_type": "t3.large"}}}
]}
```

- `actions` values: `["create"]`, `["update"]`, `["delete"]`, `["no-op"]`, `["read"]`, and replacement as `["delete","create"]` or `["create","delete"]` (the latter when `create_before_destroy` is set).

## Milestones

1. **Write POLICY.md first.** Protected types: `aws_db_instance`, `aws_rds_cluster`, `aws_ebs_volume`, `aws_s3_bucket`, `aws_efs_file_system` (extend for your provider). Rules: block delete or replace on protected types; block any ingress open to `0.0.0.0/0`/`::/0` except port 443 on resources whose address contains `lb`; warn (not block) on any replace of other types.
2. **Classify actions.** Implement `classify(actions) -> "create"|"update"|"replace"|"delete"|"noop"`.
3. **Implement rules.** Each finding prints `BLOCK <address>: <reason>` or `WARN <address>: <reason>`.
4. **Fixtures.** Create `safe_tag_change.json`, `db_replace.json`, `ssh_open.json`, `lb_https_open.json` (allowed), `cbd_replace_instance.json` (warn only). Write two more from real plans if you have Terraform: generate with `terraform plan -out=p && terraform show -json p > fixtures/x.json`.
5. **Tests.** Make the suite below pass, then add a test for each of your own fixtures.
6. **Wire it in.** Add a `Makefile` target `make plan` that runs `terraform plan -out=tfplan`, `terraform show -json tfplan > plan.json`, then `python3 plan_guard.py plan.json`.

## Acceptance criteria

- [ ] Replace of a protected type is blocked regardless of action ordering.
- [ ] Delete of a protected type is blocked.
- [ ] Public ingress is blocked except 443 on the load balancer group.
- [ ] Tag-only and instance-size updates pass.
- [ ] Output names the resource address and the reason on one line.
- [ ] `POLICY.md` names who can override and how the override is recorded.
- [ ] `pytest` passes with at least seven tests.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
# test_plan_guard.py
import json, subprocess, sys, pathlib
import pytest
from plan_guard import classify, evaluate

def plan(*changes):
    return {"resource_changes": [
        {"address": a, "type": t, "change": {"actions": act, "after": after or {}}}
        for a, t, act, after in changes]}

@pytest.mark.parametrize("actions,expected", [
    (["create"], "create"), (["update"], "update"), (["delete"], "delete"),
    (["delete", "create"], "replace"), (["create", "delete"], "replace"),
    (["no-op"], "noop"), (["read"], "noop"),
])
def test_classify(actions, expected):
    assert classify(actions) == expected

def test_db_replace_blocked():
    f = evaluate(plan(("aws_db_instance.main", "aws_db_instance", ["delete", "create"], {})))
    assert any(x.level == "BLOCK" and "aws_db_instance.main" in x.address for x in f)

def test_bucket_delete_blocked():
    f = evaluate(plan(("aws_s3_bucket.photos", "aws_s3_bucket", ["delete"], {})))
    assert [x.level for x in f] == ["BLOCK"]

def test_ssh_open_blocked():
    after = {"from_port": 22, "to_port": 22, "cidr_ipv4": "0.0.0.0/0"}
    f = evaluate(plan(("aws_vpc_security_group_ingress_rule.app_ssh",
                       "aws_vpc_security_group_ingress_rule", ["create"], after)))
    assert any(x.level == "BLOCK" for x in f)

def test_lb_https_allowed():
    after = {"from_port": 443, "to_port": 443, "cidr_ipv4": "0.0.0.0/0"}
    f = evaluate(plan(("aws_vpc_security_group_ingress_rule.lb_https",
                       "aws_vpc_security_group_ingress_rule", ["create"], after)))
    assert not any(x.level == "BLOCK" for x in f)

def test_instance_resize_passes():
    f = evaluate(plan(("aws_instance.app", "aws_instance", ["update"], {"instance_type": "t3.large"})))
    assert f == []

def test_instance_replace_warns_only():
    f = evaluate(plan(("aws_instance.app", "aws_instance", ["create", "delete"], {})))
    assert [x.level for x in f] == ["WARN"]

def test_cli_exit_codes(tmp_path):
    p = tmp_path / "p.json"
    p.write_text(json.dumps(plan(("aws_db_instance.main", "aws_db_instance", ["delete"], {}))))
    r = subprocess.run([sys.executable, "plan_guard.py", str(p)], capture_output=True, text=True)
    assert r.returncode == 1 and "BLOCK" in r.stdout
```

`evaluate(plan_dict)` returns a list of findings with `.level`, `.address`, `.reason` (a `dataclass` is fine).

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Plan literacy | Treats `update` and `replace` alike | Correctly classifies all action shapes incl. create-before-destroy | Also reports `# forces replacement` attributes from `resource_changes[].change.replace_paths` |
| Policy | Rules only in code | POLICY.md with protected types and override process | Override requires a named approver recorded in the PR, and the tool reads an allowlist file |
| Tests | Fewer than five | Suite passes, seven+ tests | Fixtures generated from real plans included |
| Usability | Stack traces on bad input | One line per finding, correct exit codes | `--json` output for CI annotation |

## Stretch goals
- Read `replace_paths` and print the attribute that forces each replacement.
- Support Azure (`azurerm_mssql_database`, `azurerm_storage_account`) and Google (`google_sql_database_instance`, `google_storage_bucket`) protected types from a YAML config.
- Run it automatically in a pipeline (cse270 lesson 06 territory — optional preview).

## Reflection prompts
- Which rule would you most expect a teammate to ask to override, and is your override process strong enough?
- What can a plan never tell you (hint: `(known after apply)`), and how does that limit any automated guard?
- Where does this tool end and human review begin?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners often check only `["delete","create"]`; the create-before-destroy order is the trap test.
- Data sources appear with `["read"]` — they must not be flagged.
- Short on time: drop milestone 6 and the Makefile.
