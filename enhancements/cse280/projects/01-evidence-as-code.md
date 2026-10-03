---
course_id: cse280
project_id: cse280-x01
title: "Evidence as Code: Automated Control Checks with an Auditor-Ready Trail"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - cse280-04
  - cse280-07
  - cse280-10
objectives:
  - Map a written compliance requirement to a specific, testable cloud control
  - Conduct a periodic security audit and drive its findings to remediation
  - Write policy, runbook, and evidence documentation an auditor can follow
competency_ids:
  - D3-S1-C02
  - D7-S1-C01
  - D7-S1-C02
  - D5-S1-C04
---

## Scenario

The patient appointment reminder service from lessons 02–10 has two controls whose tests lesson 04 calls "mechanical": NET-02 (network access minimum necessary) and a data-protection control we will call DATA-03 (restricted buckets are encrypted at rest, versioned, and deny plaintext transport). Today their evidence is a screenshot taken the week before the audit. The compliance officer wants the mechanical half of both tests to run monthly as code, against **dated exports**, producing findings in a consistent shape and an evidence-index row with a hash for every artifact — so that the quarterly internal audit (lesson 07) starts from evidence that already exists. Everything runs offline against JSON exports; generating the exports from a real or emulated account is an optional final milestone.

## What you will build / produce

- `CONTROLS.md` — the five-column mapping rows (lesson 04) for NET-02 and DATA-03, with the test column split into **script-assertable** and **human-record** steps.
- `check_controls.py` — evaluates both controls against dated exports; writes `<date>-findings.json` and `<date>-evidence-index.tsv`; exits 1 if any Critical/High finding exists, 64 on undated input.
- `test_check_controls.py` — the suite below, passing, plus at least three tests you add.
- `FINDING.md` — one finding produced by the tool, rewritten by you into the full five-element form from lesson 07 (the tool gives the condition; you supply criteria, cause, effect, recommendation).
- `RUNBOOK.md` — a lesson 10 procedure for running the check monthly: preconditions, literal steps with expected output, `RECORD:` lines, a failure branch for "export file is undated or stale".

## Before you start (prerequisites, starter files or data)

- Python 3.9+ and `pytest`. No cloud account required.
- Fixture exports (names must start with the collection date — the tool refuses undated evidence):

`fixtures/2026-07-06-security-groups.json` (shape of `aws ec2 describe-security-groups --output json`, trimmed):

```json
{"SecurityGroups": [
 {"GroupId": "sg-0a41f9", "GroupName": "db-tier", "Tags": [{"Key": "data-classification", "Value": "restricted"}],
  "IpPermissions": [
   {"IpProtocol": "tcp", "FromPort": 5432, "ToPort": 5432, "IpRanges": [{"CidrIp": "0.0.0.0/0"}], "Ipv6Ranges": [], "UserIdGroupPairs": []},
   {"IpProtocol": "tcp", "FromPort": 5432, "ToPort": 5432, "IpRanges": [], "Ipv6Ranges": [],
    "UserIdGroupPairs": [{"GroupId": "sg-app", "Description": "App tier reads/writes customer records. CHG-1841. Owner: platform."}]}]},
 {"GroupId": "sg-app", "GroupName": "app-tier", "Tags": [{"Key": "data-classification", "Value": "restricted"}],
  "IpPermissions": [
   {"IpProtocol": "tcp", "FromPort": 8080, "ToPort": 8090, "IpRanges": [], "Ipv6Ranges": [],
    "UserIdGroupPairs": [{"GroupId": "sg-lb", "Description": "LB to app"}]}]},
 {"GroupId": "sg-lb", "GroupName": "public-lb", "Tags": [{"Key": "data-classification", "Value": "public"}],
  "IpPermissions": [
   {"IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{"CidrIp": "0.0.0.0/0", "Description": "Public HTTPS. CHG-1700. Owner: platform."}], "Ipv6Ranges": [], "UserIdGroupPairs": []}]}
]}
```

`fixtures/2026-07-06-buckets.json` (a simplified, flattened shape — real bucket settings come from several API calls; milestone 7 builds this from them):

```json
{"Buckets": [
 {"Name": "acme-prod-exports", "Classification": "restricted",
  "Encryption": null, "Versioning": "Suspended",
  "Policy": {"Statement": []}},
 {"Name": "acme-prod-assets", "Classification": "public",
  "Encryption": {"SSEAlgorithm": "AES256"}, "Versioning": "Enabled",
  "Policy": {"Statement": [{"Effect": "Deny", "Principal": "*", "Action": "s3:*",
     "Condition": {"Bool": {"aws:SecureTransport": "false"}}}]}}
]}
```

- Reference implementation shape (learners may start from this and must extend it — see milestones):

```python
#!/usr/bin/env python3
"""Evaluate NET-02 and DATA-03 against dated exports; write findings and an evidence-index row per check."""
import argparse, hashlib, json, pathlib, re, sys

TICKET = re.compile(r"\b(CHG|OPS)-\d+\b")
SCOPED = {"restricted", "confidential"}


def tags(sg):
    return {t["Key"]: t["Value"] for t in sg.get("Tags", [])}


def net02(sg_export):
    """NET-02: no internet ingress on scoped groups (except 443 on public LB),
    single-port rules, and every rule justified with a ticket reference."""
    findings = []
    for sg in sg_export["SecurityGroups"]:
        scoped = tags(sg).get("data-classification") in SCOPED
        for perm in sg.get("IpPermissions", []):
            port = (perm.get("FromPort"), perm.get("ToPort"))
            sources = ([("cidr", r.get("CidrIp"), r.get("Description", "")) for r in perm.get("IpRanges", [])]
                       + [("cidr6", r.get("CidrIpv6"), r.get("Description", "")) for r in perm.get("Ipv6Ranges", [])]
                       + [("group", p.get("GroupId"), p.get("Description", "")) for p in perm.get("UserIdGroupPairs", [])])
            for kind, src, desc in sources:
                where = f"{sg['GroupId']} ({sg.get('GroupName')}) {perm.get('IpProtocol')}/{port[0]}-{port[1]} from {src}"
                if src in ("0.0.0.0/0", "::/0") and scoped:
                    findings.append(("Critical", "NET-02", f"{where}: internet ingress on a {tags(sg).get('data-classification')} group"))
                if scoped and port[0] != port[1]:
                    findings.append(("Medium", "NET-02", f"{where}: port range wider than one port"))
                if not TICKET.search(desc or ""):
                    findings.append(("Low" if not scoped else "Medium", "NET-02", f"{where}: no justification with a change ticket"))
    return findings


def data03(bucket_export):
    """DATA-03: scoped buckets encrypt at rest, keep versions, and deny non-TLS access."""
    findings = []
    for b in bucket_export["Buckets"]:
        if b.get("Classification") not in SCOPED:
            continue
        if not b.get("Encryption"):
            findings.append(("High", "DATA-03", f"{b['Name']}: no default encryption"))
        if b.get("Versioning") != "Enabled":
            findings.append(("High", "DATA-03", f"{b['Name']}: versioning is {b.get('Versioning')}"))
        denies_plaintext = any(
            s.get("Effect") == "Deny"
            and s.get("Condition", {}).get("Bool", {}).get("aws:SecureTransport") == "false"
            for s in b.get("Policy", {}).get("Statement", []))
        if not denies_plaintext:
            findings.append(("High", "DATA-03", f"{b['Name']}: policy does not deny non-TLS requests"))
    return findings


def sha256(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--security-groups", required=True)
    ap.add_argument("--buckets", required=True)
    ap.add_argument("--out", default="out")
    args = ap.parse_args(argv)
    for p in (args.security_groups, args.buckets):
        if not re.match(r"\d{4}-\d{2}-\d{2}-", pathlib.Path(p).name):
            print(f"refusing undated evidence file: {p}", file=sys.stderr)
            return 64
    date = pathlib.Path(args.security_groups).name[:10]
    findings = net02(json.load(open(args.security_groups))) + data03(json.load(open(args.buckets)))
    out = pathlib.Path(args.out); out.mkdir(exist_ok=True)
    (out / f"{date}-findings.json").write_text(json.dumps(
        [{"severity": s, "control": c, "condition": t} for s, c, t in findings], indent=2))
    with open(out / f"{date}-evidence-index.tsv", "w") as fh:
        fh.write("CONTROL\tEVIDENCE\tSHA256\tTYPE\tCOLLECTED\n")
        for ctl, p in (("NET-02", args.security_groups), ("DATA-03", args.buckets)):
            fh.write(f"{ctl}\t{pathlib.Path(p).name}\t{sha256(p)}\texport\t{date}\n")
    for s, c, t in findings:
        print(f"{s:8} {c:8} {t}")
    return 1 if any(s in ("Critical", "High") for s, _, _ in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
```

## Milestones

1. **Map first.** Write `CONTROLS.md` rows for NET-02 and DATA-03 before touching code. Quote the requirement text verbatim (lesson 04 practice requirements 1 and 3). Mark scope assumptions and who confirms them.
2. **Run the suite** below against the reference implementation; read every finding it prints and decide whether you agree.
3. **Extend the checks**: (a) flag administrative ports (22, 3389) open to any CIDR other than a named bastion group; (b) flag egress `0.0.0.0/0` on all ports for restricted groups (lesson 04's "row 4"); (c) for DATA-03, accept customer-managed keys only for `restricted` buckets (lesson 06's key custody ladder) — provider-managed `AES256` is a finding there. Add a test for each.
4. **Write the human-record half.** The six-monthly firewall review (NET-02 step 6) cannot be asserted by script; add a `--review-record` argument that requires a dated review file and records a gap row in the evidence index if it is missing or older than 183 days.
5. **Write one full finding** from the tool's Critical output in `FINDING.md`, including the configuration-history fact a real auditor would add (when the rule appeared, by whom) as a placeholder you mark "to be pulled from configuration history".
6. **Write the runbook** for the monthly run, including where outputs are stored (outside the production account, append-only) and who reviews them.
7. **Optional real exports.** Generate a real `YYYY-MM-DD-security-groups.json` from a sandbox (or LocalStack) with the lesson 04 command, build the bucket file from `get-bucket-encryption`, `get-bucket-versioning`, and `get-bucket-policy` calls, run the tool, and attach the output. Read-only calls only; no changes to the account.

## Acceptance criteria

- [ ] `pytest -q` passes, including your three or more new tests.
- [ ] The tool refuses undated input with exit 64 and writes nothing.
- [ ] Every evidence-index row has control, filename, SHA-256, type, and collection date.
- [ ] `CONTROLS.md` separates script-assertable and human-record test steps.
- [ ] `FINDING.md` has all five elements plus severity, owner, due date, and status.
- [ ] `RUNBOOK.md` has expected output and a `RECORD:` line for every artifact-producing step.
- [ ] No real account identifiers or credentials appear in committed files.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```python
import json, pathlib, shutil
import check_controls as cc

FX = pathlib.Path(__file__).parent / "fixtures"
SG = FX / "2026-07-06-security-groups.json"
BK = FX / "2026-07-06-buckets.json"

def texts(findings, control=None):
    return [t for s, c, t in findings if control in (None, c)]

def test_internet_ingress_on_db_is_critical():
    f = cc.net02(json.loads(SG.read_text()))
    assert any(s == "Critical" and "sg-0a41f9" in t and "0.0.0.0/0" in t for s, c, t in f)

def test_public_lb_443_is_not_a_finding():
    f = cc.net02(json.loads(SG.read_text()))
    assert not any(t.startswith("sg-lb") for t in texts(f))

def test_port_range_and_missing_ticket_flagged_on_app_tier():
    f = texts(cc.net02(json.loads(SG.read_text())))
    assert any("sg-app" in t and "port range" in t for t in f)
    assert any("sg-app" in t and "change ticket" in t for t in f)

def test_justified_group_rule_passes():
    f = texts(cc.net02(json.loads(SG.read_text())))
    assert not any("from sg-app" in t for t in f)

def test_restricted_bucket_findings():
    f = texts(cc.data03(json.loads(BK.read_text())))
    assert len([t for t in f if "acme-prod-exports" in t]) == 3
    assert not any("acme-prod-assets" in t for t in f)

def test_cli_writes_dated_artifacts_and_fails_on_high(tmp_path):
    rc = cc.main(["--security-groups", str(SG), "--buckets", str(BK), "--out", str(tmp_path)])
    assert rc == 1
    assert (tmp_path / "2026-07-06-findings.json").exists()
    idx = (tmp_path / "2026-07-06-evidence-index.tsv").read_text()
    assert "NET-02" in idx and len(idx.splitlines()[1].split("\t")[2]) == 64

def test_undated_evidence_is_refused(tmp_path):
    undated = tmp_path / "export.json"; shutil.copy(SG, undated)
    assert cc.main(["--security-groups", str(undated), "--buckets", str(BK), "--out", str(tmp_path)]) == 64
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Mapping | Control statements not falsifiable | Five complete columns, scope assumptions recorded | Crosswalk notes for two frameworks with "identifier to be confirmed" where unsure |
| Automation | Checks only the happy path | All extensions implemented and tested | Findings carry stable IDs so repeat findings across months are detectable |
| Evidence quality | Undated or unhashed outputs | Dated, hashed, indexed, stored append-only | Index distinguishes continuous vs point-in-time evidence and declares gaps |
| Audit writing | Tool output pasted as the finding | Full five-element finding, proportionate effect | Recommendations address class (guardrail, drift detection), not only instance |
| Runbook | Steps without expected output | Stranger-runnable with failure branch | Survives a classmate's literal run without questions |

## Stretch goals
- Track findings month over month and mark repeats (lesson 07: "repeat findings escalate").
- Emit a SARIF or CSV report for a ticketing import.
- Port the NET-02 check to an Azure NSG export or a Google Cloud firewall-rules export.

## Reflection prompts
- Which part of NET-02 can never be automated, and why does that matter to an auditor?
- What would make an auditor distrust this tool's output, and how did you guard against it?
- Where did writing the code force you to make a control statement more precise?

## Instructor notes (common pitfalls, how to adapt for time)
- The fixture's app-tier rule spans 8080–8090 and has no ticket; the db-tier has both a bad internet rule and a good group rule — learners should see that one good rule does not excuse the bad one.
- Learners often treat the public load balancer's `0.0.0.0/0:443` as a finding; the scoping by classification tag is the point.
- The reference implementation and suite were run together during authoring (7/7 passing, Python 3.12).
- Short on time: skip milestones 4 and 7.
