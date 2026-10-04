---
course_id: cyb210
project_id: cyb210-x01
title: "Harbor Ridge Detection Validation Lab"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - cyb210-02
  - cyb210-03
objectives:
  - Deploy and tune endpoint protection so that it detects malicious behavior without burying the analyst in false positives
  - Classify a malware sample by its observed behavior and name the indicators it leaves on an endpoint
competency_ids:
  - D5-S1-C01
  - D3-S1-C03
---

## Scenario

You are the endpoint technician at **Harbor Ridge Medical Group** (the 40-clinic practice from lesson 04). The IT director has just approved a pilot of an open-source endpoint telemetry stack before the organization signs a commercial EDR contract. Her question is blunt: "Before we roll this to 1,400 workstations, prove to me that it sees the things we care about, and prove that it will not drown the help desk." Your job is to build a two-VM lab, exercise five detections with **benign** actions that produce the same telemetry as malicious ones, tune one noisy rule using the tuning ladder from lesson 02, and hand the director a one-page validation record plus a script that re-runs the check on demand.

## Scope and authorization

- Everything runs on **virtual machines you own**, on a **host-only network** with no route to the internet, your home LAN, or any employer network. Take a clean snapshot of the endpoint VM before you start.
- **No malware is used.** The only "malicious-looking" file is the industry-standard **EICAR anti-malware test string**, which is a harmless 68-byte text file that every major scanner deliberately flags. Every other trigger is a benign administrative command.
- Do not run any of these actions on a work laptop, a school machine, or anything you do not personally control. If you want to run a validation step on an organizational test host later, get written authorization first, naming the host, the window, and the actions.

## What you will build / produce

1. A working lab: one Windows 10/11 or Linux endpoint VM with a telemetry agent, one collector VM (Wazuh manager is the reference build; any platform that ingests Sysmon or `auditd` works).
2. Five validated detections, each tied to a benign trigger and a MITRE ATT&CK technique.
3. One rule tuned with a rung-2 narrowing condition, with proof it stays silent for the authorized activity and still fires for the same activity from an interactive user.
4. An exported alert file (`alerts.json`, one JSON object per line) and a learner-run acceptance script that reads it and prints PASS/FAIL per detection.
5. A one-page **validation record** for the IT director.

## Before you start

- Lessons 02 and 03 completed, especially "The tuning ladder" and "Stage 4: behavioral analysis".
- A hypervisor (VirtualBox, VMware Workstation/Fusion, Hyper-V, or UTM) with at least 12 GB RAM free.
- Reference stack: Wazuh all-in-one on the collector VM; on a Windows endpoint, the Wazuh agent plus Sysmon with a community configuration; on a Linux endpoint, the Wazuh agent with `auditd` rules for `execve`, user and group changes, and cron, **plus ClamAV** (Linux has no built-in quarantining scanner, so milestone 2 needs one): scan with `clamscan --move=/var/quarantine` or enable on-access scanning, and have the agent collect the ClamAV log so the detection and move reach the collector. Installation steps change between releases — follow the current vendor quickstart and record the versions you used.
- Python 3.9+ on whichever machine you will run the acceptance script.

## Milestones

1. **Build and attest the lab (1 h).** Two VMs on a host-only network. Prove containment positively before any trigger runs: screenshot the hypervisor's network settings showing only the host-only adapter on the endpoint; show the endpoint's routing table (`ip route` or `route print`) with no default route, or only one into the host-only network; and show that an outbound TCP attempt fails (for example `curl -m 5 https://1.1.1.1` or `Test-NetConnection 1.1.1.1 -Port 443`). Then, as supplementary evidence, show that `ping 1.1.1.1` and a DNS lookup of any public name fail, and that the collector is reachable. Screenshot each. Record the four health questions from lesson 02 for your one-endpoint "estate": inventoried, agent installed, checked in within 24 h, current content, intended policy.
2. **Trigger the EICAR check (15 min).** On the endpoint, create the EICAR test file in a temporary directory named `eicar-test`. Confirm the anti-malware layer (Microsoft Defender on Windows, ClamAV on Linux) quarantines or moves it and that the collector shows the event. This proves the **signature layer** works and teaches you where quarantine events appear. Record the event ID and the field that holds the file path.
3. **Run the five benign triggers (1.5 h).** Use the same five actions as lesson 02's Practice, Part 2 (office app or editor spawning a shell; scheduled task/cron created; renamed system binary run from temp; outbound connection to a lab host; new local admin). For each, find the raw telemetry event, then write or enable a rule so that each produces an **alert** with a stable rule ID. Tag each rule with a short label in its description, `HR-VAL-01` through `HR-VAL-05`, so the acceptance script can find them.
4. **Create and tune a false positive (1.5 h).** Schedule a benign housekeeping script (it copies and deletes 200 small files across ten directories) to run every five minutes under a dedicated service account. Confirm your file-activity rule (`HR-VAL-06`) fires on it. Tune using **rung 2**: add conditions on parent image, user, and script path. Then perform the same file activity by hand as your interactive user and confirm `HR-VAL-06` still fires.
5. **Export and verify (30 min).** Export the alerts from the validation window to `alerts.json` (one JSON object per line; on Wazuh this is the manager's alerts log). Run the acceptance script below and fix anything that fails.
6. **Write the validation record (1 h).** One page, written for the IT director (see Evidence checklist).

## Acceptance criteria

- [ ] Isolation demonstrated, not asserted: host-only adapter, no external default route, a failed outbound TCP attempt, plus failed external ping and DNS, with screenshots.
- [ ] EICAR quarantine observed, with event ID and path field recorded.
- [ ] Five rules `HR-VAL-01`..`HR-VAL-05` each fired at least once during the validation window.
- [ ] `HR-VAL-06` fired for the interactive user **after** tuning, and did **not** fire for the service account after the tuning timestamp.
- [ ] Each detection is mapped to an ATT&CK technique ID with one sentence on why a defender cares.
- [ ] The tuning record uses the exact form from lesson 02 Part 5 (rule, benign rate, rung and why not lower, conditions, verification search, owner, review date).
- [ ] The acceptance script prints `ALL CHECKS PASSED`.

## Automated checks

Save as `check_validation.py` next to your exported `alerts.json`. Set `TUNE_TIME` to the UTC timestamp at which you applied your rung-2 tuning and `SERVICE_ACCOUNT` to your service account's name. Field names below follow Wazuh's JSON alert layout (`rule.description`, `timestamp`, `data`); if your platform differs, adjust `get_desc`, `get_time`, `USER_FIELDS`, and `is_eicar_quarantine` and say so in your record.

```python
#!/usr/bin/env python3
"""Acceptance check for cyb210-x01. Reads alerts.json (JSON Lines)."""
import json, sys
from datetime import datetime, timezone

ALERTS = sys.argv[1] if len(sys.argv) > 1 else "alerts.json"
TUNE_TIME = datetime(2026, 1, 15, 14, 0, tzinfo=timezone.utc)  # <-- edit
SERVICE_ACCOUNT = "svc-housekeep"                              # <-- edit
REQUIRED = [f"HR-VAL-0{i}" for i in range(1, 6)]

def get_desc(a): return a.get("rule", {}).get("description", "")
def get_time(a):
    ts = a.get("timestamp", "").replace("Z", "+00:00")
    # Wazuh writes e.g. 2026-01-15T14:03:22.123+0000 ; normalise the offset
    if len(ts) > 5 and ts[-5] in "+-" and ts[-3] != ":":
        ts = ts[:-2] + ":" + ts[-2:]
    return datetime.fromisoformat(ts)
# Structured user fields, checked in order: Wazuh Windows/Sysmon, then Linux audit/syslog.
# auditd often records a numeric auid; if so, map it to the name or add your own field here.
USER_FIELDS = [("win", "eventdata", "user"), ("audit", "acct"), ("dstuser",), ("srcuser",)]
def get_user(a):
    for path in USER_FIELDS:
        v = a.get("data", {})
        for k in path:
            v = v.get(k) if isinstance(v, dict) else None
        if isinstance(v, str) and v.strip():
            name = v.strip().split("\\")[-1].lower()   # DOMAIN\user -> user
            return SERVICE_ACCOUNT.lower() if name == SERVICE_ACCOUNT.lower() else "other"
    return "other"

alerts = [json.loads(l) for l in open(ALERTS, encoding="utf-8") if l.strip()]
failures = []

for tag in REQUIRED:
    n = sum(tag in get_desc(a) for a in alerts)
    print(f"{tag}: {n} alert(s)")
    if n == 0:
        failures.append(f"{tag} never fired")

v6 = [a for a in alerts if "HR-VAL-06" in get_desc(a)]
after = [a for a in v6 if get_time(a) >= TUNE_TIME]
svc_after = [a for a in after if get_user(a) == SERVICE_ACCOUNT.lower()]
user_after = [a for a in after if get_user(a) != SERVICE_ACCOUNT.lower()]
print(f"HR-VAL-06 after tuning: service={len(svc_after)} interactive={len(user_after)}")
if svc_after:
    failures.append("HR-VAL-06 still fires for the service account (tuning incomplete)")
if not user_after:
    failures.append("HR-VAL-06 never fired for interactive activity after tuning (possible blind spot)")

EICAR_DIR = "eicar-test"          # <-- the directory you created the test file in (milestone 2)
QUARANTINE_EVENT_IDS = {"1117"}   # Microsoft Defender: action taken to protect the system
def is_eicar_quarantine(a):
    blob = json.dumps(a).lower()
    if "eicar" not in blob or EICAR_DIR.lower() not in blob:
        return False                  # must name the test file's path, not just mention EICAR
    eid = str(a.get("data", {}).get("win", {}).get("system", {}).get("eventID", ""))
    return eid in QUARANTINE_EVENT_IDS or "quarantin" in blob or "moved to" in blob  # ClamAV --move logs "moved to"
eicar = [a for a in alerts if is_eicar_quarantine(a)]
print(f"EICAR quarantine alerts: {len(eicar)}")
if not eicar:
    failures.append("No EICAR quarantine/block alert for the test path found")

print()
if failures:
    print("FAILED:"); [print(" -", f) for f in failures]; sys.exit(1)
print("ALL CHECKS PASSED")
```

The two checks on `HR-VAL-06` are the point of the exercise: the first proves you removed the noise, the second proves you did not create the blind spot that lesson 02 warns about.

## Evidence checklist

- Lab attestation screenshots (isolation, agent check-in).
- Five telemetry records (event type, image, command line, parent, user) and the five rule definitions.
- Tuning record in the lesson 02 form, plus the before/after alert counts for `HR-VAL-06`.
- `alerts.json` and the acceptance script output.
- The one-page validation record: what was tested, what fired, what was tuned and why, what the tuning now makes *less* visible, and the recommendation (proceed / proceed with conditions / do not proceed).

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Lab safety | Isolation asserted only | Isolation demonstrated with evidence; snapshot taken and reverted | Also documents every hypervisor sharing feature disabled |
| Detection coverage | Fewer than five rules fire | All five fire, each mapped to ATT&CK | Adds a sixth detection for a gap you found in the ATT&CK mapping |
| Tuning quality | Exclusion or rule disabled | Rung-2 narrowing with both halves proven | Explains why rungs 1 and 3 were rejected and quantifies benign rate before/after |
| Evidence | Claims without artifacts | Every claim traceable to an event or screenshot | Script adapted and documented for a second platform |
| Director-facing record | Jargon-heavy, no recommendation | Clear recommendation with residual risk | Includes a proposed weekly health metric for the pilot ring |

## Stretch goals

- Run the same five triggers on a second endpoint OS (Windows and Linux) and compare which telemetry each agent produced.
- Map your five rules on an ATT&CK Navigator layer and identify one tactic with zero coverage.
- Replace one trigger with the matching Atomic Red Team test **in the isolated lab only**, and compare the telemetry with your hand-run version.

## Reflection prompts

1. Which of your five rules would be noisiest across 1,400 real workstations, and what is the first narrowing condition you would add?
2. Your tuning made one class of activity less visible. Who should be told, and where is that written down?
3. If the director asked, "Is the EICAR test proof that we will catch ransomware?", what would you answer?

## Instructor notes

- **Common pitfall:** learners tune `HR-VAL-06` by excluding the script's directory. The acceptance script will still pass if the interactive test happens in a different directory — ask to see the rule conditions, not just the script output.
- **Time-saver:** provide a prebuilt collector OVA so the session focuses on telemetry and tuning rather than installation.
- **Shorter version (3 h):** skip the Linux path, provide the five rules, and grade only milestones 4–6.
- Some host anti-malware products will flag the EICAR string on the learner's host machine if they type it there; tell learners to create it only inside the endpoint VM.
