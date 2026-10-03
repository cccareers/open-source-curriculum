---
course_id: cyb140
project_id: cyb140-x02
title: "Juice Shop Evidence Packets and the Finding-to-Control Memo"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - cyb140-05
  - cyb140-06
objectives:
  - Identify common web application vulnerability classes and describe the evidence that confirms each one
  - Translate a test finding into a control weakness and a prioritized remediation recommendation
competency_ids:
  - D6-S1-C03
  - D1-S1-C03
---

## Scenario
Meridian Freight Systems is evaluating an off-the-shelf web shop for its merchandise store. Your supervisor has set up a local copy of **OWASP Juice Shop**, a deliberately insecure training application maintained by OWASP, as a stand-in, and asked you for two things. First, three evidence packets that meet lesson 05's standard (request, response, baseline, account context, timestamps, redaction), each in a different OWASP category, one of them a broken-access-control finding shown with two user sessions. Second, a one-page memo translating those findings into control failures and a prioritized remediation plan (lesson 06), written for Meridian's IT manager.

## Scope and authorization
- Juice Shop runs **only** as a container on your own machine, attached to a Docker `--internal` network. Your browser and tools reach it from a tools container on that network, or through a port bound to `127.0.0.1` if your instructor approves that variant.
- Never test the public Juice Shop demo instances or any other deployed site. They belong to someone else, and "it's a training app" is not authorization.
- Depth ceiling: **identify and evidence**. Prove existence, not extent: one record, one marker. No data harvesting, no automated brute force, no denial-of-service, and no attacks on the host or the Docker daemon.
- You create two customer accounts yourself (user A and user B). These are the only accounts you use.
- Stop conditions from your lesson 02 ROE apply. In particular, if the app becomes unresponsive, stop, log the time and your last action, and restart the container only with your supervisor's approval.

## What you will build / produce
1. `functional-map.md`: lesson 05 Part 1 (endpoints, parameters, roles, entry points).
2. `findings.json`: at least three **confirmed** findings across three OWASP categories (one of them A01), plus any candidates or suspicions you could not confirm, in the schema the checker enforces.
3. `memo.md` (one page): for each finding, the control that should have prevented it, the failure mode (absent / not applied / misconfigured / bypassed / unmonitored), whether a detective control would have fired, and a remediation with owner, SLA deadline, verification, and interim mitigation. Rank by priority, not CVSS, and justify any inversion.
4. A passing run of `check_findings.py`.

## Before you start (prerequisites, starter files or data)
Lessons 05 and 06 and your lesson 02 ROE. Docker; internet access once, to pull images.

```sh
docker pull bkimminich/juice-shop
docker network create --internal --subnet 10.141.0.0/24 lab141        # pick another private /24 if this overlaps
docker run -d --rm --name juice-shop --network lab141 --ip 10.141.0.20 bkimminich/juice-shop
docker run --rm -it --network lab141 -v "$PWD":/work cyb140-tools sh   # tools image from cyb140-x01, or any image with curl
# inside: curl -s http://juice-shop:3000/ | head -c 200   (Docker's embedded DNS resolves the container name)
```

Each finding in `findings.json` uses this structure:

```json
{
  "id": "F1",
  "title": "Customer can read another customer's basket by changing an identifier",
  "owasp": "A01:2021",
  "cwe": "CWE-639",
  "state": "confirmed",
  "affected": ["http://juice-shop:3000/rest/basket/<id>"],
  "severity": "High - any registered customer can read any basket; regulated data not observed",
  "evidence": {
    "request": "GET /rest/basket/<B's id>\nAuthorization: Bearer ***",
    "response": "{\"id\": <B's id>, \"UserId\": <redacted>, ...one field shown...}",
    "baseline": "Same request for A's own basket id returns A's basket",
    "account_context": "Session of user A (customer role); user B created by tester",
    "timestamp": "2026-10-05T10:14:02-05:00",
    "log_ref": "activity.log line 14"
  },
  "reproduction_steps": ["Log in as A", "Note A's basket id", "Request B's basket id in A's session"],
  "control": "Server-side object-level authorization on basket endpoints",
  "failure_mode": "absent",
  "recommendation": {"action": "...", "owner": "...", "deadline": "...", "verification": "...", "interim": "..."}
}
```

Mask tokens and cookies as `***` or `<redacted>` **when you capture them**, not later.

## Milestones
1. **Map before testing.** Write the functional map. Mark entry points where input reaches a query, a file path, a rendered page, or an outbound request.
2. **Two sessions.** Register users A and B. Log every action with a timestamp in `activity.log`.
3. **A01 packet.** Use your map to find an object identifier that the server should check against the requester. Capture the baseline (A's own object) and the proof (exactly one of B's objects, redacted to a single identifying marker).
4. **Two more categories.** Choose from A02 (transport or cryptography configuration), A03 (a benign marker rendered as markup instead of text, with no script payloads), A05 (verbose errors, exposed directories or files), or A09 (log the effect of your own failed login at a recorded time, then look for it). Record anything you could not confirm as `suspicion` or `candidate`, with what would move it up a level.
5. **Translate.** Write the control and failure mode for every finding, then cluster them. Is any of them evidence of a pattern?
6. **Prioritize and recommend.** Use lesson 06's six fields and six priority factors. Include one formal risk-acceptance recommendation, or explain why none is appropriate.
7. **Check and clean up.** Run the checker, then stop the container, remove the network, and log the cleanup.

## Acceptance criteria
- [ ] `check_findings.py` prints `ALL CHECKS PASSED`.
- [ ] The A01 packet shows two sessions and exactly one of user B's records, redacted to one marker.
- [ ] Every confirmed finding has a baseline. Every suspicion says what evidence is missing.
- [ ] The memo ranks by priority, names an owner and SLA for each action, and has a verification step for each.
- [ ] No token, cookie value, password, or personal-looking data appears anywhere in the package.

## Automated checks (coding courses) / Evidence checklist (non-coding)
`check_findings.py`. Run it as `python3 check_findings.py findings.json`:

```python
#!/usr/bin/env python3
"""cyb140-x02 acceptance check for findings.json. Usage: python3 check_findings.py findings.json"""
import json, re, sys
F = json.load(open(sys.argv[1]))
OWASP = {f"A{n:02d}" for n in range(1, 11)}
MODES = {"absent", "not applied", "misconfigured", "bypassed", "unmonitored"}
STATES = {"confirmed", "suspicion", "candidate"}
SECRET = [(re.compile(r"eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}"), "unredacted JWT"),
          (re.compile(r"(?i)authorization:\s*bearer\s+(?!\*{3}|<redacted>)\S{8,}"), "unredacted bearer token"),
          (re.compile(r"(?i)(cookie|set-cookie):[^\n]*=(?!\*{3}|<redacted>)[A-Za-z0-9%._-]{12,}"), "unredacted cookie value"),
          (re.compile(r"(?i)\"password\"\s*:\s*\"(?!\*{3}|<redacted>)[^\"]+\""), "password in evidence"),
          (re.compile(r"\b\d{13,16}\b"), "possible card number")]
fails = []
cats = set()
for f in F:
    fid = f.get("id", "?")
    for k in ("id", "title", "owasp", "cwe", "state", "affected", "evidence", "severity", "control", "failure_mode", "recommendation"):
        if not f.get(k): fails.append(f"{fid}: missing {k}")
    if f.get("owasp", "")[:3] not in OWASP: fails.append(f"{fid}: owasp must start A01..A10")
    else: cats.add(f["owasp"][:3])
    if not re.fullmatch(r"CWE-\d+", f.get("cwe", "")): fails.append(f"{fid}: cwe must look like CWE-639")
    if f.get("state") not in STATES: fails.append(f"{fid}: state must be confirmed/suspicion/candidate")
    if f.get("failure_mode") not in MODES: fails.append(f"{fid}: failure_mode must be one of {sorted(MODES)}")
    ev = f.get("evidence", {})
    if f.get("state") == "confirmed":
        for k in ("request", "response", "baseline", "account_context", "timestamp", "log_ref"):
            if not ev.get(k): fails.append(f"{fid}: confirmed finding needs evidence.{k}")
        if ev.get("timestamp") and not re.search(r"(Z|[+-]\d\d:?\d\d)$", ev["timestamp"]):
            fails.append(f"{fid}: timestamp needs a time zone offset")
        if not f.get("reproduction_steps"): fails.append(f"{fid}: confirmed finding needs reproduction_steps")
    blob = json.dumps(f)
    for rx, why in SECRET:
        if rx.search(blob.replace("\\n", "\n")): fails.append(f"{fid}: {why}")
    rec = f.get("recommendation", {})
    for k in ("action", "owner", "deadline", "verification"):
        if not rec.get(k): fails.append(f"{fid}: recommendation.{k} missing")
    for a in f.get("affected", []):
        if not re.match(r"^https?://(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|juice-shop[:/])", a):
            fails.append(f"{fid}: affected asset '{a}' is not a lab address")
if sum(f.get("state") == "confirmed" for f in F) < 3: fails.append("need >= 3 confirmed findings")
if len(cats) < 3: fails.append("confirmed findings must span >= 3 OWASP categories")
if not any(f.get("owasp", "").startswith("A01") and f.get("state") == "confirmed" for f in F):
    fails.append("need a confirmed A01 Broken Access Control finding (two-session evidence)")
for m in fails: print("FAIL", m)
print(f"{len(F)} findings checked: " + ("ALL CHECKS PASSED" if not fails else f"{len(fails)} problem(s)"))
sys.exit(1 if fails else 0)
```

Expected passing output: `3 findings checked: ALL CHECKS PASSED`. A packet with an unmasked token fails like this:

```text
FAIL F1: unredacted JWT
FAIL F1: unredacted bearer token
```

The checker covers structure and redaction only. Whether the evidence actually proves the claim is judged with the rubric.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Proof vs suspicion | States suspicions as findings | Every state is accurate; baselines are present | Each suspicion names the exact evidence that would confirm it, and routes it to code review where appropriate |
| Minimum necessary proof | Multiple records or unredacted data | One record, one marker, redacted at capture | Explains in the packet why the extent of exposure is *inferred*, not demonstrated |
| Control translation | "Needs patching" | Named control plus one of the five failure modes, with detective-control status | Identifies a systemic cause shared by two findings |
| Remediation plan | Generic advice | Six-field recommendations, ranked by priority | Ranking inverts CVSS order at least once, with the reason stated |

## Stretch goals
- Write the lesson 06 "two write-ups of one problem" for the A01 finding: an engineering ticket and a 250-word manager summary.
- Add an A09 logging finding using your own failed-login timestamp as the instrument.

## Reflection prompts
- Where did you most want to take "just one more record"? What stopped you, and what would the consequence have been on a client system?
- Which of your findings would a scanner have caught, and which needed you to understand what the application is *for*?

## Instructor notes (common pitfalls, how to adapt for time)
- Juice Shop has a built-in scoreboard and published solutions. This project grades evidence quality and control translation, not challenge count, so solutions do not undermine it.
- Learners often paste whole JSON responses. The checker catches tokens but not excess records; review A01 packets by hand for the one-record rule.
- The `owasp` field uses the 2021 labels the lesson uses. If the lesson moves to the 2025 edition, update the examples (see the review's open question).
- 3-hour version: the A01 packet plus one other category, and a memo for those two only.
