---
course_id: cyb130
project_id: cyb130-x02
title: "Cedar Point Least-Privilege Lab: Roles You Can Test"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - cyb130-04
  - cyb130-05
objectives:
  - Model roles and permissions that grant least privilege for a described organization
  - Trace an identity through joiner, mover, and leaver events and identify where privilege accumulates
competency_ids:
  - D2-S1-C03
---

## Scenario
Cedar Point Distribution (lesson 04's worked example) wants proof that its role table works, not just a table. You will build a miniature, disposable version of four Cedar Point roles in a container. Linux groups stand in for resource groups and directories stand in for ERP functions. Then you run an allow/deny test matrix against it. Next you play a mover event the way most organizations do it, adding the new role without removing anything, and watch the separation-of-duties test fail. Finally you fix it properly.

This lab models the **two-tier pattern** from lesson 04: people get roles, roles map to resource groups, and resources grant only resource groups. POSIX groups cannot nest, so `build.sh` does the role-to-resource-group expansion. That expansion is the job a provisioning system (SCIM, lesson 05) does in a real environment.

## Scope and authorization
- Run only in a disposable local container on a machine you own, started with `--network none`. Nothing leaves the container. Every account and file is created by the lab and is gone when the container exits.
- Do not run `build.sh` on a host or server you use for anything else. It creates users and groups.

## What you will build / produce
1. `roles.csv`, `role_map.csv`, `build.sh`, and `verify.sh` (below), plus your extensions.
2. A run log showing: a clean pass, the failing mover-without-removal run, and a clean pass after the correct mover procedure.
3. A half-page note explaining each failure in lesson 04 and 05 terms (control pair, privilege creep, direct grant).

## Before you start (prerequisites, starter files or data)
Docker, plus lessons 04 and 05. Create a folder with the four files below, then start the container:

```sh
docker run --rm -it --network none -v "$PWD":/lab -w /lab alpine:3 sh
```

`roles.csv` (people → job role)
```text
user,role
aclerk1,role-ap-clerk
asup1,role-ap-supervisor
vmaint1,role-vendor-maintainer
whop1,role-warehouse-operator
```

`role_map.csv` (job role → resource groups)
```text
role,resource_groups
role-ap-clerk,fs-finance-read;erp-invoices-write
role-ap-supervisor,fs-finance-read;erp-invoices-write;erp-payments-approve
role-vendor-maintainer,erp-vendors-write
role-warehouse-operator,wms-pick
```

`build.sh`
```sh
#!/bin/sh
# Builds the Cedar Point model: resource groups own resources; roles map to resource groups.
set -e
for g in fs-finance-read erp-invoices-write erp-payments-approve erp-vendors-write wms-pick; do addgroup -S "$g" 2>/dev/null || true; done
mkdir -p /srv/fs-finance /srv/erp/invoices /srv/erp/payments /srv/erp/vendors /srv/wms
echo "Q1 ledger" > /srv/fs-finance/ledger.txt
chgrp -R fs-finance-read /srv/fs-finance && chmod 750 /srv/fs-finance && chmod 640 /srv/fs-finance/ledger.txt
chgrp erp-invoices-write /srv/erp/invoices && chmod 770 /srv/erp/invoices
chgrp erp-payments-approve /srv/erp/payments && chmod 770 /srv/erp/payments
chgrp erp-vendors-write /srv/erp/vendors && chmod 770 /srv/erp/vendors
chgrp wms-pick /srv/wms && chmod 770 /srv/wms
chmod 755 /srv/erp
tail -n +2 roles.csv | while IFS=, read u r; do
  id "$u" >/dev/null 2>&1 || adduser -D -s /bin/sh "$u"
  grps=$(awk -F, -v r="$r" '$1==r{print $2}' role_map.csv | tr ';' ' ')
  for g in $grps; do addgroup "$u" "$g"; done
done
echo "build complete"
```

## Milestones
1. **Build and baseline.** `sh build.sh && sh verify.sh` should print `ALL CHECKS PASSED`. Save the output.
2. **Map to the role table.** For each line in `verify.sh`, name the lesson 04 role-table permission or exclusion it tests.
3. **Mover the wrong way.** `asup1` covers procurement for a month. Run `addgroup asup1 erp-vendors-write` and re-run `verify.sh`. Record both failures and explain the harm in one sentence: this person can now create a payee and approve paying it.
4. **Mover the right way.** Revert with `delgroup asup1 erp-vendors-write`. Then write `mover.sh USER NEW_ROLE`. It must print the user's current groups, remove every resource group that the new role does not include, add the new role's groups, and log each change with a UTC timestamp. Move `asup1` to `role-vendor-maintainer` and re-run `verify.sh`. The supervisor allow/deny checks will now fail because the person changed jobs. Update `roles.csv` and the expected matrix to match, and record that the test change was a deliberate decision.
5. **Direct grant.** Run `chown whop1 /srv/wms` and re-run `verify.sh`. Explain why a resource that grants a named user is invisible to a role review, then put the ownership back.
6. **Leaver.** Write `leaver.sh USER`. It must lock the account (`passwd -l`), record the user's groups to a file, remove all groups, and print the record. Run it on `whop1` and show that `verify.sh` now reports DENY for the operator's ALLOW check. Then update the matrix, because the leaver *should* be denied.

## Acceptance criteria
- [ ] Baseline `verify.sh` passes.
- [ ] The milestone 3 run shows the SoD failure, and your note names the control pair.
- [ ] `mover.sh` removes before it adds and logs each change in UTC.
- [ ] `leaver.sh` records group memberships *before* removing them, so an investigator still has them.
- [ ] Final `verify.sh` (with the updated matrix) passes, with no direct-grant failure.

## Automated checks (coding courses) / Evidence checklist (non-coding)
`verify.sh` is the acceptance test. It checks the allow/deny matrix, separation of duties, and direct grants:

```sh
#!/bin/sh
# cyb130-x02 acceptance check: expected allow/deny matrix for each role. Exit 0 = pass.
fail=0
# Run first, before the tests create files. Direct grants: no resource may grant a named user (owner must be root)
if find /srv -mindepth 1 ! -user root | grep -q .; then echo "FAIL  resource owned by a user account (direct grant)"; fail=1; fi
check(){ # user, expect(ALLOW|DENY), description, command
  if su "$1" -s /bin/sh -c "$4" >/dev/null 2>&1; then got=ALLOW; else got=DENY; fi
  if [ "$got" = "$2" ]; then echo "PASS  $1 $3 -> $got"; else echo "FAIL  $1 $3 -> $got (expected $2)"; fail=1; fi
}
check aclerk1 ALLOW "read finance ledger"     "cat /srv/fs-finance/ledger.txt"
check aclerk1 ALLOW "create invoice"          "touch /srv/erp/invoices/inv-aclerk1-$$"
check aclerk1 DENY  "approve payment"         "touch /srv/erp/payments/pay-aclerk1-$$"
check aclerk1 DENY  "edit vendor bank detail" "touch /srv/erp/vendors/v-aclerk1-$$"
check asup1   ALLOW "approve payment"         "touch /srv/erp/payments/pay-asup1-$$"
check asup1   DENY  "edit vendor bank detail" "touch /srv/erp/vendors/v-asup1-$$"
check vmaint1 ALLOW "edit vendor bank detail" "touch /srv/erp/vendors/v-vmaint1-$$"
check vmaint1 DENY  "approve payment"         "touch /srv/erp/payments/pay-vmaint1-$$"
check vmaint1 DENY  "read finance ledger"     "cat /srv/fs-finance/ledger.txt"
check whop1   ALLOW "pick in WMS"             "touch /srv/wms/pick-whop1-$$"
check whop1   DENY  "read finance ledger"     "cat /srv/fs-finance/ledger.txt"
# Separation of duties: nobody may hold both erp-vendors-write and erp-payments-approve
for u in $(tail -n +2 roles.csv | cut -d, -f1); do
  g=$(id -nG "$u")
  case " $g " in *" erp-vendors-write "*) case " $g " in *" erp-payments-approve "*) echo "FAIL  SoD break: $u"; fail=1;; esac;; esac
done
find /srv -name "*-$$" -delete   # remove test files
[ $fail -eq 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"
exit $fail
```

Expected baseline output ends in `ALL CHECKS PASSED`. Expected output after milestone 3:

```text
FAIL  asup1 edit vendor bank detail -> ALLOW (expected DENY)
FAIL  SoD break: asup1
SOME CHECKS FAILED
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Role model fidelity | Checks don't trace to the role table | Every check mapped to a permission or exclusion | Adds checks for the `role-warehouse-supervisor` and `svc-wms-integration` rows |
| Mover procedure | Adds only | Removes before adding; logs in UTC | Holds an explicit "both managers" decision file that the script reads, and treats silence as removal |
| Leaver procedure | Deletes the user | Locks, records, then removes groups | Also lists what the leaver owned (files under `/srv`) for reassignment |
| Explanation | Describes commands | Names creep, SoD pair, and direct grant correctly | Explains which failures a recertification campaign would and would not catch |

## Stretch goals
- Add `nesting.csv` and expand nested roles in `build.sh`, then show how one extra nesting line silently grants a whole population (lesson 04's "nested group drift").
- Add `expiry.csv` for temporary cover, plus a `expire.sh` that removes expired grants. Show it catching lesson 05's "temporary cover that never ended".

## Reflection prompts
- Milestone 4 made you change the tests. What stops someone from "fixing" a failing SoD test by deleting it?
- Which of these failures would a manager reviewing raw group names have missed?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners who run `verify.sh` twice in one container may see leftover files if they interrupt it. Re-run `build.sh` or start a fresh container.
- POSIX groups have no nesting and no explicit deny. Say clearly that this is a teaching model of the *pattern*, not of a directory product.
- 2-hour version: milestones 1–3 and 5 only.
