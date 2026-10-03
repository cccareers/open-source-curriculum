---
course_id: cse203
project_id: cse203-x01
title: "Riverside Network Rehearsal on LocalStack"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cse203-03
  - cse203-04
  - cse203-06
objectives:
  - Configure a virtual private cloud with subnets and security groups for a deployed application
  - Define and update infrastructure with Terraform, including state, variables, and modules
  - Select cloud storage and managed database services that fit a workload's durability and access needs
competency_ids:
  - D3-S1-C01
  - D4-S1-C02
  - D2-S1-C03
---

## Scenario

Riverside Community Trust (the equipment-loans customer from lesson 08) has approved the deployment, but their board wants to see the network and storage design proven before anyone spends money. You will build the network tier and the photo bucket in Terraform, apply it to a local AWS-API emulator so nothing is billed, and hand the reviewer an acceptance script that checks the design rules from lessons 03 and 04 automatically — the same rules the capstone (R4, R5, R9, R12) will be graded on.

## What you will build / produce

- A Terraform project (`versions.tf`, `main.tf`, `variables.tf`, `outputs.tf`, `dev.tfvars`, `modules/network/`) declaring: a VPC; public and private subnets across two zones via `cidrsubnet`; an internet gateway; public and private route tables; security groups `lb`, `app`, `db` via `for_each` with rules referencing groups; a versioned, public-access-blocked photo bucket with a lifecycle policy; a common tag set on everything.
- `providers-localstack.tf` (or `tflocal`) pointing the AWS provider at the emulator.
- `check_plan.py` — reads `terraform show -json tfplan` and enforces the rules below.
- `REHEARSAL.md` — what was proven offline, what can only be proven on a real account, and the commands to run both.

## Before you start (prerequisites, starter files or data)

- Terraform 1.6+ (1.10+ if you want `use_lockfile`), Docker, Python 3.9+.
- LocalStack: `docker run --rm -d --name localstack -p 4566:4566 localstack/localstack`.
- `pip install terraform-local` provides `tflocal`, which generates an override file pointing every AWS endpoint at `localhost:4566`. Alternatively write the provider block yourself:

```hcl
provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true
  endpoints {
    ec2 = "http://localhost:4566"
    s3  = "http://localhost:4566"
    sts = "http://localhost:4566"
  }
}
```

- The emulator accepts fake credentials `test`/`test`. **Never** put real credentials in this file; it is committed.
- NAT gateways, load balancers, and RDS are out of scope for the emulated run (support in the free emulator is partial); declare them behind a `var.enable_billable` flag defaulting to `false` so the same code works later on a real account.

## Milestones

1. **Scaffold and pin.** Versions pinned, `.gitignore` written, first commit before any `init`.
2. **Network module.** VPC `var.vpc_cidr`, subnets with `cidrsubnet(var.vpc_cidr, 8, i)` for public and `cidrsubnet(var.vpc_cidr, 8, i + 10)` for private, route tables and associations. No literal subnet CIDRs.
3. **Security groups.** `lb` inbound 443 from `var.allowed_cidrs` (office range plus your `/32`); `app` inbound 8080 from `lb`; `db` inbound 5432 from `app`. Every rule has a `description`. Use `aws_vpc_security_group_ingress_rule` resources (or inline rules — be consistent).
4. **Photo bucket.** Versioning, public access block, lifecycle: photos to `STANDARD_IA` at 30 days (staff look up loans for about a month), noncurrent versions expire at 90, abort multipart at 7. Justify the ages in `REHEARSAL.md`.
5. **Apply to the emulator.** `tflocal init && tflocal plan -var-file=dev.tfvars -out=tfplan && tflocal apply tfplan`. Then `tflocal plan` again and confirm *No changes*.
6. **Acceptance script.** `tflocal show -json tfplan > plan.json && python3 check_plan.py plan.json` passes.
7. **Prove it fails when it should.** Add an ingress rule `0.0.0.0/0` on 22 to `app`, re-plan, confirm the checker fails with a clear message. Remove it.
8. **Teardown.** `tflocal destroy`, `docker stop localstack`. Document how the same code would be run against a real account with `enable_billable = true` and a budget alert in place.

## Acceptance criteria

- [ ] `terraform validate` and `terraform fmt -check -recursive` pass.
- [ ] Apply succeeds on the emulator and a second plan reports no changes.
- [ ] Every subnet CIDR is computed; subnets span two zones per tier.
- [ ] No ingress rule anywhere allows `0.0.0.0/0` or `::/0`.
- [ ] Every app→db and lb→app rule uses a security group as source.
- [ ] The bucket has versioning, all four public-access-block flags, and a lifecycle with an abort-multipart rule.
- [ ] Every taggable resource carries `Environment`, `Owner`, and `ManagedBy = terraform`.
- [ ] `check_plan.py` exits non-zero on the milestone-7 violation.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
#!/usr/bin/env python3
"""check_plan.py — enforce cse203 design rules on `terraform show -json` output."""
import ipaddress, json, sys

REQUIRED_TAGS = {"Environment", "Owner", "ManagedBy"}
TAGGABLE = {"aws_vpc", "aws_subnet", "aws_security_group", "aws_s3_bucket",
            "aws_internet_gateway", "aws_route_table"}

def resources(plan):
    """Yield (address, type, after-values) for every planned resource, including modules."""
    for rc in plan.get("resource_changes", []):
        change = rc.get("change") or {}
        after = dict(change.get("after") or {})
        # values such as a referenced group's id are "known after apply" at plan time
        for key, unknown in (change.get("after_unknown") or {}).items():
            if unknown is True and after.get(key) is None:
                after[key] = "(known after apply)"
        yield rc["address"], rc["type"], after

def main(path):
    plan = json.load(open(path))
    errors = []
    by_type = {}
    for addr, typ, after in resources(plan):
        by_type.setdefault(typ, []).append((addr, after))

        if typ in TAGGABLE:
            tags = set((after.get("tags_all") or after.get("tags") or {}).keys())
            missing = REQUIRED_TAGS - tags
            if missing:
                errors.append(f"{addr}: missing tags {sorted(missing)}")

        # Standalone ingress rules
        if typ == "aws_vpc_security_group_ingress_rule":
            if after.get("cidr_ipv4") in ("0.0.0.0/0",) or after.get("cidr_ipv6") == "::/0":
                errors.append(f"{addr}: ingress open to the internet")
            if not after.get("description"):
                errors.append(f"{addr}: rule has no description")
        # Inline ingress blocks
        if typ == "aws_security_group":
            for rule in after.get("ingress") or []:
                if "0.0.0.0/0" in (rule.get("cidr_blocks") or []) or "::/0" in (rule.get("ipv6_cidr_blocks") or []):
                    errors.append(f"{addr}: inline ingress open to the internet")
                if not rule.get("description"):
                    errors.append(f"{addr}: inline rule has no description")

    # Tier-to-tier rules must reference a group (app on 8080, db on 5432), in either rule form
    TIER_PORTS = (8080, 5432)
    for addr, after in by_type.get("aws_vpc_security_group_ingress_rule", []):
        if after.get("from_port") in TIER_PORTS:
            if after.get("cidr_ipv4") or after.get("cidr_ipv6"):
                errors.append(f"{addr}: tier rule uses a CIDR, not a security group")
            elif not after.get("referenced_security_group_id"):
                errors.append(f"{addr}: tier rule has no security-group source")
    for addr, after in by_type.get("aws_security_group", []):
        for rule in after.get("ingress") or []:
            if rule.get("from_port") in TIER_PORTS:
                if rule.get("cidr_blocks") or rule.get("ipv6_cidr_blocks"):
                    errors.append(f"{addr}: inline tier rule uses a CIDR, not a security group")
                elif not rule.get("security_groups"):
                    errors.append(f"{addr}: inline tier rule has no security-group source")

    if not by_type.get("aws_s3_bucket_versioning"):
        errors.append("no aws_s3_bucket_versioning resource")
    for addr, after in by_type.get("aws_s3_bucket_versioning", []):
        status = (after.get("versioning_configuration") or [{}])[0].get("status")
        if status != "Enabled":
            errors.append(f"{addr}: versioning is {status}")
    for addr, after in by_type.get("aws_s3_bucket_public_access_block", []) or [("(none)", {})]:
        flags = [after.get(k) for k in ("block_public_acls", "block_public_policy",
                                         "ignore_public_acls", "restrict_public_buckets")]
        if not all(flags):
            errors.append(f"{addr}: public access not fully blocked")
    lifecycles = by_type.get("aws_s3_bucket_lifecycle_configuration", [])
    if not any(r.get("abort_incomplete_multipart_upload")
               for _, a in lifecycles for r in (a.get("rule") or [])):
        errors.append("no lifecycle rule aborts incomplete multipart uploads")

    # Subnets: each CIDR must sit where milestone 2's cidrsubnet() layout puts it
    # (netnum 0-9 public, 10+ private), and each tier needs >=2 subnets in >=2 zones.
    vpcs = by_type.get("aws_vpc", [])
    if len(vpcs) != 1 or not vpcs[0][1].get("cidr_block"):
        errors.append("expected exactly one aws_vpc with a known cidr_block")
    else:
        vpc = ipaddress.ip_network(vpcs[0][1]["cidr_block"])
        layout = list(vpc.subnets(prefixlen_diff=8))
        tiers = {"public": [], "private": []}
        for addr, a in by_type.get("aws_subnet", []):
            try:
                netnum = layout.index(ipaddress.ip_network(a.get("cidr_block")))
            except (TypeError, ValueError):
                errors.append(f"{addr}: CIDR {a.get('cidr_block')} is not cidrsubnet(var.vpc_cidr, 8, n)")
                continue
            tiers["public" if netnum < 10 else "private"].append(a.get("availability_zone"))
        for tier, zones in tiers.items():
            if len(zones) < 2 or len(set(zones)) < 2:
                errors.append(f"{tier} tier: expected >=2 subnets across >=2 zones, "
                              f"got {len(zones)} in {len(set(zones))}")

    for e in errors:
        print("FAIL ", e)
    print("ALL CHECKS PASSED" if not errors else f"{len(errors)} check(s) failed")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
```

Notes: `tags_all` includes provider `default_tags`, so either approach to common tags passes. The subnet check proves the CIDRs *match* the milestone 2 layout, which is what the plan can show; that they are *computed* rather than typed in is a code-review item — `grep -rn 'cidr_block *= *"' --include=*.tf .` should match nothing in the network module. Attribute shapes follow the AWS provider 5.x schema; if a check misfires on your provider version, inspect `plan.json` with `jq '.resource_changes[] | {address, type}'` and adjust — that inspection is part of the skill.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Network design | Literal CIDRs or single zone | Computed CIDRs, two zones per tier, correct route tables | Isolated db subnets with no default route, documented |
| Security groups | CIDR sources between tiers | Group-referenced tier rules, described, no public ingress | Egress narrowed for the db tier with justification |
| Storage | Versioning or block missing | All storage rules pass | Lifecycle ages tied to the customer's stated usage in writing |
| Automation | Manual inspection only | `check_plan.py` passes and catches milestone 7 | Checker runs in a pre-commit hook or Makefile target |
| Cost safety | Billable components enabled by default | `enable_billable = false` default; teardown evidenced | Real-account run plan includes budget alert and teardown checklist |

## Stretch goals
- Add a `moved` block when extracting the network module and show the plan is empty.
- Add `terraform test` (`*.tftest.hcl`) assertions with `command = plan` for the subnet count and tag rules.
- Port the checker to Open Policy Agent / Conftest and compare readability.

## Reflection prompts
- Which design rule was easiest to violate without noticing, and did the checker catch it first or did you?
- What did the emulator let you prove, and what can only a real account prove?
- How would a reviewer use your checker's output in a pull request?

## Instructor notes (common pitfalls, how to adapt for time)
- LocalStack returns fake zone names for `us-east-1`; hard-code `azs` in `dev.tfvars` rather than using the zones data source if it misbehaves.
- Learners often mix inline `ingress` blocks with standalone rule resources on the same group, causing perpetual diffs; insist on one style.
- If Docker is unavailable, milestones 1–4 plus `terraform plan` with the provider block above still produce a plan JSON as long as the provider can reach an endpoint; otherwise supply a pre-generated `plan.json` and grade the checker only.
- Short on time: skip the lifecycle rule and the stretch goals.
