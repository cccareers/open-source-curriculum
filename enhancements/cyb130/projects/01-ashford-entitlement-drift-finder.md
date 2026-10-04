---
course_id: cyb130
project_id: cyb130-x01
title: "Ashford Entitlement Drift Finder"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - cyb130-04
  - cyb130-05
  - cyb130-06
objectives:
  - Trace an identity through joiner, mover, and leaver events and identify where privilege accumulates
  - Model roles and permissions that grant least privilege for a described organization
competency_ids:
  - D2-S1-C03
---

## Scenario
Ashford Community Housing (lessons 04 and 05) liked your manual discrepancy list. Next quarter they do not want to pay someone to repeat it by eye. The IT manager asks for a small script that reads four exports (HR, directory, the role model, and approved add-ons) plus the separation-of-duties pairs from lesson 04. It must flag the five things lesson 05's "Detecting what the process missed" section says to look for. Run it every month and it becomes the evidence behind the recertification campaign.

## Scope and authorization
- Synthetic CSV data only. No directory, tenant, or HR system is queried.
- If you later point a version of this script at a real export, you need written approval from the data owner. The export contains personal data, so handle it under your organization's data-handling rules, and never copy it to personal devices or public repositories.

## What you will build / produce
1. `audit.py` (Python 3.9+, standard library only), usable as `python3 audit.py --asof YYYY-MM-DD FIXTURE_DIR OUT.csv`.
2. `findings.csv` with columns `account,finding_type,detail`. `finding_type` is one of:
   - `ORPHANED`: enabled account whose HR record is not `active`
   - `UNOWNED`: no HR record and no `owner`
   - `DORMANT`: last logon more than 90 days before `--asof`
   - `DRIFT`: one row per group held beyond the job role's expected groups and not covered by an unexpired add-on; `detail` is the group name
   - `SOD_BREAK`: holds both groups of a pair
3. A one-page memo to Ashford's IT manager: the top five findings in business language (lesson 05's "this person can approve payments..." style), each with an owner and remediation.

## Before you start (prerequisites, starter files or data)
Create `fixtures/` with these five files.

`fixtures/hr.csv`
```text
employee_id,name,account,job_role,status,end_date
40881,M Okonkwo,mokonkwo,procurement-manager,active,
41102,D Rao,drao,improvement-lead,left,2026-04-30
41390,S Okoye,sokoye,hr-generalist,active,
41455,K Brooks,kbrooks,ap-clerk,active,
41720,T Okafor,tokafor,sysadmin,active,
41881,F Diallo,fdiallo,hr-generalist,active,
```

`fixtures/roles.csv`
```text
job_role,expected_groups
procurement-manager,role-base-employee;role-procurement-manager;role-vendor-maintainer
improvement-lead,role-base-employee;role-improvement
hr-generalist,role-base-employee;role-hr-generalist
ap-clerk,role-base-employee;role-ap-clerk
sysadmin,role-base-employee;role-sysadmin
```

`fixtures/directory.csv`
```text
account,enabled,last_logon,owner,groups
mokonkwo,yes,2026-07-24,,role-base-employee;role-ap-clerk;role-ap-supervisor;role-vendor-maintainer;role-procurement-manager;fs-hr-read
drao,yes,2026-07-25,,role-base-employee;role-team-leader;role-housing-officer;fs-finance-read;role-sysadmin
sokoye,yes,2026-07-25,,role-base-employee;role-hr-generalist
kbrooks,yes,2026-07-25,,role-base-employee;role-ap-clerk
tokafor,yes,2026-07-25,,role-base-employee;role-finance-clerk
tokafor-adm,yes,2026-07-22,tokafor,Domain Admins
fdiallo,yes,2026-02-11,,role-base-employee;role-hr-generalist;fs-finance-read
jbarnes,yes,2025-08-30,,role-base-employee;role-sysadmin;Domain Admins
svc-backup,yes,2026-07-26,tokafor,Domain Admins
helpdesk-shared,yes,2026-07-25,,role-helpdesk-tier1
volunteer-kiosk,yes,2026-01-04,,role-base-employee
```

`fixtures/addons.csv`
```text
account,group,approved_until
fdiallo,fs-finance-read,2025-12-31
mokonkwo,fs-hr-read,2024-04-30
sokoye,fs-hr-read,2026-12-31
```

`fixtures/sod.csv`
```text
group_a,group_b
role-vendor-maintainer,role-ap-supervisor
role-vendor-maintainer,role-ap-clerk
```

## Milestones
1. **Predict by hand.** Before coding, list the findings you expect for each account. This is the lesson 05 Part 3 skill, and it becomes your own test oracle.
2. **Load and join.** Read the five files and join the directory to HR on `account`.
3. **Implement one finding type at a time,** in this order: UNOWNED, ORPHANED, DORMANT, SOD_BREAK, DRIFT. Run the tests after each.
4. **Handle add-ons.** An add-on only excuses a group while `approved_until >= asof`.
5. **Explain the edge cases** in comments: why `svc-backup` is *not* unowned, why `drao`'s DRIFT is not reported (he is a leaver, so the whole account is the finding), and why `tokafor-adm` is owned by `tokafor`.
6. **Write the memo.** Translate group names into business statements.

## Acceptance criteria
- [ ] `python3 test_audit.py` prints `ALL TESTS PASSED`.
- [ ] Your hand prediction from milestone 1 is attached, with any differences explained.
- [ ] The memo names Maya Okonkwo's separation-of-duties break in business terms and assigns an owner.
- [ ] The memo says which findings need a human decision rather than an automatic disable (shared and kiosk accounts, service accounts).

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `test_audit.py` next to `audit.py`:

```python
#!/usr/bin/env python3
"""Acceptance tests for cyb130-x01. Run: python3 test_audit.py"""
import csv, subprocess, sys, tempfile, os

out = os.path.join(tempfile.mkdtemp(), "findings.csv")
r = subprocess.run([sys.executable, "audit.py", "--asof", "2026-07-27", "fixtures", out],
                   capture_output=True, text=True)
assert r.returncode == 0, f"audit.py failed:\n{r.stderr}"
rows = list(csv.DictReader(open(out, newline="")))
assert rows and set(rows[0]) >= {"account", "finding_type", "detail"}, "findings.csv needs account,finding_type,detail"
got = {(x["account"], x["finding_type"], x["detail"]) for x in rows}
types = {(a, t) for a, t, _ in got}

must = [
    ("drao", "ORPHANED"),            # leaver still enabled, and used after last day
    ("jbarnes", "UNOWNED"), ("helpdesk-shared", "UNOWNED"), ("volunteer-kiosk", "UNOWNED"),
    ("fdiallo", "DORMANT"), ("jbarnes", "DORMANT"), ("volunteer-kiosk", "DORMANT"),
    ("mokonkwo", "SOD_BREAK"),
]
for m in must:
    assert m in types, f"missing finding {m}"
for grp in ("role-ap-clerk", "role-ap-supervisor", "fs-hr-read"):
    assert ("mokonkwo", "DRIFT", grp) in got, f"missing DRIFT for mokonkwo/{grp}"
assert ("tokafor", "DRIFT", "role-finance-clerk") in got, "missing DRIFT tokafor/role-finance-clerk"
assert ("fdiallo", "DRIFT", "fs-finance-read") in got, "expired add-on must be DRIFT"

must_not = [("sokoye", None), ("kbrooks", None), ("svc-backup", "UNOWNED"), ("tokafor-adm", "UNOWNED"),
            ("mokonkwo", "DORMANT"), ("drao", "DRIFT")]
for acct, t in must_not:
    bad = [x for x in got if x[0] == acct and (t is None or x[1] == t)]
    assert not bad, f"false positive: {bad}"
print(f"ALL TESTS PASSED ({len(rows)} findings)")
```

Expected output: `ALL TESTS PASSED (14 findings)`. The count can differ if you also report a group that is *missing* from a role. If you add that as a `MISSING` type, the tests still pass.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Correctness | Some tests fail | All tests pass | Adds tests for your own edge cases (disabled accounts ignored, malformed dates rejected) |
| Lifecycle reasoning | Treats every flag as "delete" | Classifies each finding and names who decides | Links each finding to the lifecycle event that missed it (mover without removal, leaver not processed) |
| Least-privilege reasoning | Reports drift without judgement | Separates drift that is a real over-entitlement from a role model that is out of date | Proposes a role-model fix where drift is systemic (e.g. `tokafor` holds `role-finance-clerk` instead of `role-sysadmin`) |
| Memo | Group names and jargon | Business language with an owner for each item | Ranks by harm and states the residual risk of the shared accounts that cannot be removed |

## Stretch goals
- Add `--sod-only` and `--format markdown` options for the recertification pack.
- Read nested groups from a `nesting.csv` (`parent,child`) and compute effective membership before the checks, as in lesson 04's effective-permissions section.

## Reflection prompts
- Which finding would a monthly script never catch, but a human reviewer would?
- Lesson 05 warns about metrics that look useful but mislead. Which count from this script could mislead leadership?

## Instructor notes (common pitfalls, how to adapt for time)
- The usual bug is treating every group outside the role as drift, even when an unexpired add-on covers it (`sokoye`'s `fs-hr-read` add-on is unexpired but she doesn't hold the group, so it should produce no finding).
- Learners often flag `svc-backup` as unowned. The fixture gives it an owner on purpose. Discuss whether `Domain Admins` on a backup service account is still a finding the script cannot see (it is; see lesson 04).
- 3-hour version: provide the CSV loading code and have learners implement only DRIFT and SOD_BREAK.
