---
course_id: cyb140
project_id: cyb140-x01
title: "Meridian Freight: A Scope-Guarded Scan and Validation Record"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cyb140-02
  - cyb140-03
  - cyb140-04
objectives:
  - Read and write the authorization and scope documents that make a security test lawful and bounded
  - Run an authorized vulnerability scan in a lab environment and separate true findings from false positives
competency_ids:
  - D3-S1-C04
  - D1-S1-C01
---

## Scenario
Your supervisor at the assessment firm hands you a small piece of the Meridian Freight Systems engagement (lesson 07): two booking-portal hosts, rebuilt as containers in your own lab, plus a six-line candidate list exported from the firm's scanner. Before you send a packet, she wants three things. First, a machine-checkable scope file. Second, a guard that refuses any target the scope does not cover. Third, an evidence package she can verify without asking you a question. Then she wants the six candidates triaged into confirmed, false positive, unable to validate, or out of scope, each with a reason she can check.

## Scope and authorization
- **Every target in this project is a container you start yourself, on your own machine, on a Docker network created with `--internal`.** That network has no route to the internet or your home or office LAN. Verify this (milestone 2) before scanning.
- Scanning or testing any system you do not own, or have no written authorization to test, is prohibited. In most jurisdictions it is a crime (lesson 02). This includes your employer's network, your ISP's equipment, cloud addresses, and "just a quick check" of a public site.
- `preflight.py` (below) must approve every target before every scan. It refuses public addresses, unlisted addresses, excluded addresses, unnamed testers, and anything outside the window. Do not edit it to make a refusal go away. A refusal is a stop condition: log it and ask your supervisor.
- Depth ceiling: **validate and demonstrate**. No exploitation, no brute-forcing, no denial-of-service, no `intrusive` or `exploit` NSE script categories.

## What you will build / produce
1. `scope.json`: a machine-readable scope (fields below) plus a one-paragraph human-readable ROE summary in `roe.md`, in the lesson 02 structure.
2. `activity.log`: the lesson 02 activity log. `preflight.py` appends to it automatically, and you add your own lines for every other action.
3. `scans/`: the machine-readable nmap output (`-oA`), with SHA-256 hashes recorded in `evidence.md`.
4. `inventory.csv`: the lesson 04 asset inventory with a provenance column.
5. `validation.csv`: one row per candidate, using the lesson 04 five-step validation.
6. A passing run of `verify_evidence.py`.

## Before you start (prerequisites, starter files or data)
Docker, plus lessons 02–04. You need internet access **once**, to build the tools image and pull `nginx`. After that, everything runs on the internal network.

`tools/Dockerfile`
```dockerfile
FROM alpine:3
RUN apk add --no-cache nmap nmap-scripts curl python3
WORKDIR /work
```

`target/default.conf` (Meridian booking host t10, with a deliberate misconfiguration)
```nginx
server { listen 80; root /usr/share/nginx/html; location /files/ { autoindex on; } server_tokens on; }
```

Create `target/files/bookings-sample.txt` containing one line of synthetic text. Then set up the lab:

```sh
docker build -t cyb140-tools tools
docker network create --internal --subnet 10.140.0.0/24 lab140   # if this overlaps an existing network, pick another private /24 and update scope.json
docker run -d --rm --name t10 --network lab140 --ip 10.140.0.10 \
  -v "$PWD/target/default.conf":/etc/nginx/conf.d/default.conf:ro \
  -v "$PWD/target/files":/usr/share/nginx/html/files:ro nginx:1.25-alpine
docker run -d --rm --name t11 --network lab140 --ip 10.140.0.11 nginx:1.25-alpine
echo 10.140.0.1 > exclusions.txt        # the Docker gateway is never a target
docker run --rm -it --network lab140 --ip 10.140.0.5 -v "$PWD":/work cyb140-tools sh
```

`scope.json` template (fill it in, with the window in your own time zone and offset):
```json
{
  "engagement": "CYB140-LAB-MERIDIAN",
  "authorized_by": "Instructor (supervisor), lab authorization v1, acknowledged 2026-10-05",
  "testers": ["apprentice01"],
  "window_start": "2026-10-05T09:00:00-05:00",
  "window_end": "2026-10-05T17:00:00-05:00",
  "in_scope": ["10.140.0.10", "10.140.0.11"],
  "exclusions": ["10.140.0.1"],
  "depth": "validate-and-demonstrate",
  "source_ip": "10.140.0.5"
}
```

`preflight.py` (the scope guard):
```python
#!/usr/bin/env python3
"""Scope guard for cyb140 lab work. Refuses to approve any target that is not
explicitly in scope, is excluded, is not a private lab address, or falls outside
the authorized window. Usage: python3 preflight.py scope.json TESTER TARGET [TARGET...]"""
import ipaddress, json, sys, datetime

def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    scope = json.load(open(sys.argv[1]))
    tester, targets = sys.argv[2], sys.argv[3:]
    now = datetime.datetime.now(datetime.timezone.utc)
    errors = []
    for k in ("engagement", "authorized_by", "testers", "window_start", "window_end",
              "in_scope", "exclusions", "depth", "source_ip"):
        if not scope.get(k):
            errors.append(f"scope file missing '{k}' - not an authorization")
    if errors:
        report(errors, tester, targets, now); return 2
    start = datetime.datetime.fromisoformat(scope["window_start"])
    end = datetime.datetime.fromisoformat(scope["window_end"])
    if start.tzinfo is None or end.tzinfo is None:
        errors.append("window times must carry a UTC offset")
    elif not (start <= now <= end):
        errors.append(f"outside testing window {start.isoformat()} .. {end.isoformat()}")
    if tester not in scope["testers"]:
        errors.append(f"tester '{tester}' is not named in the scope")
    nets = [ipaddress.ip_network(x, strict=False) for x in scope["in_scope"]]
    excl = [ipaddress.ip_network(x, strict=False) for x in scope["exclusions"]]
    for t in targets:
        try:
            ip = ipaddress.ip_address(t)
        except ValueError:
            errors.append(f"{t}: use IP addresses only; hostnames can resolve out of scope"); continue
        if not ip.is_private or ip.is_loopback:
            errors.append(f"{t}: not a private lab address - REFUSED")
        if not any(ip in n for n in nets):
            errors.append(f"{t}: not in in_scope list")
        if any(ip in n for n in excl):
            errors.append(f"{t}: on the EXCLUSION list")
    report(errors, tester, targets, now)
    return 1 if errors else 0

def report(errors, tester, targets, now):
    status = "APPROVED" if not errors else "REFUSED"
    line = f"{now.isoformat(timespec='seconds')} | {tester} | preflight {status} | {' '.join(targets)}"
    for e in errors:
        print("REFUSED:", e)
    if not errors:
        print("APPROVED:", " ".join(targets))
    with open("activity.log", "a") as log:
        log.write(line + ("" if not errors else " | " + "; ".join(errors)) + "\n")

if __name__ == "__main__":
    sys.exit(main())
```

Supplied scanner candidate export (`candidates.txt`), synthetic, for triage:
```text
C1  10.140.0.10:80   Directory listing enabled on /files/                  config observation
C2  10.140.0.10:80   Web server version disclosed in Server header         config observation
C3  10.140.0.11:80   Directory listing enabled on /files/                  config observation
C4  10.140.0.10:443  Deprecated TLS protocol version accepted              config observation
C5  10.140.0.10:80   PHP version affected by CVE-XXXX-2222 (CVSS 9.8)      version inference
C6  10.140.0.11:80   Weak administrative password on management console   requires credentials (none issued)
```

## Milestones
1. **Scope and ROE.** Complete `scope.json` and `roe.md`. List three stop conditions as observable triggers with actions.
2. **Prove isolation.** From the tools container, show that `curl -m 5 https://example.com` fails and log the result. If it succeeds, **stop**: your network is not internal.
3. **Preflight.** Run `python3 preflight.py scope.json apprentice01 10.140.0.10 10.140.0.11`. Also try one deliberately bad target (`10.140.0.1`) and keep the refusal in the log as evidence that the guard works.
4. **Discover and enumerate.** `nmap -sV -Pn -p- --max-rate 200 --excludefile exclusions.txt -oA scans/$(date -u +%Y%m%dT%H%M%SZ)-lab 10.140.0.10 10.140.0.11`. Build `inventory.csv` from the XML, with provenance.
5. **Validate the six candidates** with lesson 04's five steps. Reproduce with `curl -s`/`curl -sI`, corroborate with a second method, check preconditions (is PHP present at all?) and reachability (is 443 open?), then decide. Three candidates are false positives by construction, one cannot be validated with what you were issued, and two are real. Your reasons must say *how you know*.
6. **Evidence.** Hash every file in `scans/` into `evidence.md`. For C1 and C2, save the request/response pair, redacted, with timestamps that match `activity.log`.
7. **Verify** with the script below. Then stop the containers and remove the network, and log the cleanup (artifact declaration).

## Acceptance criteria
- [ ] `verify_evidence.py` prints `ALL CHECKS PASSED`.
- [ ] `activity.log` shows the isolation test, at least one REFUSED preflight, and an APPROVED preflight before every scan.
- [ ] No address outside `10.140.0.10–11` appears in any scan file, inventory, or note.
- [ ] `validation.csv` has all six candidates: C1 and C2 confirmed, C3–C5 false positives with checkable reasons, C6 unable to validate (no credentials issued, and testing credentials is out of scope).
- [ ] The cleanup is logged.

## Automated checks (coding courses) / Evidence checklist (non-coding)
`verify_evidence.py`. Run it as `python3 verify_evidence.py scope.json scans activity.log validation.csv`:

```python
#!/usr/bin/env python3
"""cyb140-x01 acceptance check. Proves every scan stayed in scope and was pre-approved.
Usage: python3 verify_evidence.py scope.json scans/ activity.log validation.csv"""
import csv, datetime, glob, hashlib, ipaddress, json, sys, xml.etree.ElementTree as ET
scope_f, scan_dir, log_f, val_f = sys.argv[1:5]
scope = json.load(open(scope_f))
nets = [ipaddress.ip_network(x, strict=False) for x in scope["in_scope"]]
excl = [ipaddress.ip_network(x, strict=False) for x in scope["exclusions"]]
approvals = []
for line in open(log_f):
    parts = [p.strip() for p in line.split("|")]
    if len(parts) >= 4 and "preflight APPROVED" in parts[2]:
        approvals.append((datetime.datetime.fromisoformat(parts[0]), set(parts[3].split())))
fails = 0
def bad(m):
    global fails; fails += 1; print("FAIL", m)
xmls = sorted(glob.glob(f"{scan_dir}/*.xml"))
if not xmls: bad("no machine-readable scan output (*.xml) preserved")
for x in xmls:
    root = ET.parse(x).getroot()
    started = datetime.datetime.fromtimestamp(int(root.get("start")), datetime.timezone.utc)
    args = root.get("args", "")
    if "--excludefile" not in args: bad(f"{x}: scan not run with --excludefile")
    for h in root.iter("host"):
        a = h.find("address").get("addr")
        ip = ipaddress.ip_address(a)
        if not any(ip in n for n in nets): bad(f"{x}: {a} is OUT OF SCOPE")
        if any(ip in n for n in excl): bad(f"{x}: {a} is EXCLUDED")
        if not any(t <= started and a in tg and (started - t).total_seconds() < 3600 for t, tg in approvals):
            bad(f"{x}: no preflight APPROVED for {a} in the hour before scan start {started.isoformat()}")
    print(f"ok   {x} sha256={hashlib.sha256(open(x,'rb').read()).hexdigest()[:16]}...")
rows = list(csv.DictReader(open(val_f, newline="", encoding="utf-8-sig")))
need = {"candidate", "check_type", "reproduce", "corroborate", "preconditions", "reachability", "determination", "reason"}
if not rows or not need <= set(rows[0]): bad(f"validation.csv needs columns {sorted(need)}")
else:
    d = [r["determination"].strip().lower() for r in rows]
    for r in rows:
        if r["determination"].strip().lower() not in {"confirmed", "false positive", "unable to validate", "out of scope"}:
            bad(f"bad determination: {r['determination']}")
        if len(r["reason"].split()) < 5: bad(f"'{r['candidate']}': reason too short to check")
    if d.count("false positive") < 3: bad("need >= 3 false positives with reasons (or a documented search)")
    if "unable to validate" not in d: bad("need >= 1 'unable to validate'")
print("ALL CHECKS PASSED" if not fails else f"{fails} CHECK(S) FAILED")
sys.exit(1 if fails else 0)
```

Expected passing output:
```text
ok   scans/20261005T150210Z-lab.xml sha256=e039f34f5d309fc7...
ALL CHECKS PASSED
```

If a scan ran without a matching approval, you will see something like `FAIL scans/...xml: no preflight APPROVED for 10.140.0.10 in the hour before scan start ...`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Scope and ROE | Missing fields or vague wording ("related systems") | Every field is present, specific, and has an offset-bearing window | ROE stop conditions map one-to-one to actions, and a peer can work from them unaided |
| Guarded execution | Scans without approval | Every scan was pre-approved; refusals are logged | Explains why the guard refuses hostnames (resolution can drift out of scope) |
| Validation | Repeats the scanner's claims | Six determinations with checkable reasons | Separates "precondition absent" (C5) from "not reachable" (C4) from "not reproduced" (C3) in the wording |
| Evidence | Screenshots only | Raw XML with hashes; request/response pairs; times match the log | A classmate reproduces C1 from `evidence.md` alone |

## Stretch goals
- Add a credentialed check: create an SSH-enabled target with a known package version, then show the difference between banner inference and a package query (lesson 04 "backported patches").
- Extend `preflight.py` to refuse targets during a declared change-freeze date list.

## Reflection prompts
- Which refusal did you trigger by accident, and what would it have meant on a real engagement?
- Which false positive would a busy analyst most likely have forwarded to a client, and why?

## Instructor notes (common pitfalls, how to adapt for time)
- Some Docker installations already use part of `10.0.0.0/8` or `172.16.0.0/12`. Learners must pick a free private /24 and update the scope. That's a good, real scope-hygiene moment.
- Publishing ports from an `--internal` network does not work. Learners scan from the tools container on the same network, which is the intended design.
- Tested with Docker 29 and `nginx:1.25-alpine`: nmap reported `80/tcp open http nginx 1.25.5`, and the tools container could not reach the internet.
- 3-hour version: provide a completed `scope.json` and have learners do milestones 2–7.
