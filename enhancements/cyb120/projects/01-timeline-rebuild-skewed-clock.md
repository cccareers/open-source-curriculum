---
course_id: cyb120
project_id: cyb120-x01
title: "IR-2026-0031 Timeline Rebuild with a Skewed Clock"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cyb120-03
  - cyb120-05
  - cyb120-06
objectives:
  - Document an incident timeline and preserve evidence so that it survives later review
  - Triage an alert queue and decide which alerts become incidents
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
  - D1-S1-C04
---

## Scenario
It is the morning of 2026-03-11. You are picking up IR-2026-0031 from M. Okafor's shift. The case record has the WKS-4471 events, but the WKS-2210 material arrived overnight from three teams in three formats: the endpoint export from WKS-2210 (whose clock was found to run **3 minutes fast**), the web proxy export (which the network team exports in **local office time, America/Chicago**, with no offset), and UTC exports from the mail gateway, flow collector, and directory. S. Vance wants one merged, sourced, tagged UTC timeline before the 10:00Z stand-up, and the answer to one question: *which host was first, and how did the second one get infected?*

## Scope and authorization
Everything here is synthetic text describing malicious activity. No sample, no live system, no network access. Work in any folder on a machine you own. The defanged indicators (`hxxp`, `[.]`) must stay defanged.

## What you will build / produce
1. `timeline.csv` — the merged UTC timeline.
2. `conversions.md` — every time conversion you applied, with its basis.
3. A 150-word answer to S. Vance's question, separating observation from inference.

## Before you start (prerequisites, starter files or data)
Lessons 03, 05, and 06. Python 3.9+. Create a folder `ir-0031/` with these files exactly:

`mail_gateway.log` (UTC)
```text
2026-03-10T13:44:02Z msgid=MG-77120 from=billing@ledger-notice[.]example to=r.singh@corp attach=Q1_reconciliation.docm verdict=delivered
2026-03-10T14:01:55Z msgid=MG-77188 from=r.singh@corp to=j.ruiz@corp attach=Q1_reconciliation.docm verdict=delivered note=internal-forward
```

`edr_wks2210.log` (host clock; see asset note)
```text
2026-03-10T13:54:07 evt=50211 host=WKS-2210 user=CORP\r.singh process_create parent=WINWORD.EXE image=powershell.exe cmdline="powershell.exe -nop -w hidden -enc SQBFAFgA..."
2026-03-10T14:01:41 evt=50240 host=WKS-2210 task_create name="OneDriveSyncMaintenance" trigger=logon
```

`edr_wks4471.log` (UTC, clock verified)
```text
2026-03-10T14:02:11Z evt=40912 host=WKS-4471 user=CORP\j.ruiz process_create parent=WINWORD.EXE image=powershell.exe
2026-03-10T14:06:44Z evt=40960 host=WKS-4471 task_create name="OneDriveSyncMaintenance" trigger=logon
```

`proxy.log` (local time, America/Chicago, no offset recorded)
```text
2026-03-10 08:51:19 rec=8871101 src=10.14.9.22 GET hxxp://cdn-updates-cache[.]example/win/upd.ps1 200 41229
2026-03-10 09:02:19 rec=8871223 src=10.14.7.51 GET hxxp://cdn-updates-cache[.]example/win/upd.ps1 200 41229
2026-03-10 09:31:40 rec=8871990 src=10.14.7.51 POST hxxp://files-share[.]example/upload 200 123731968
```

`flow.csv` (UTC)
```text
start,src,dst,dport,bytes
2026-03-10T13:52:00Z,10.14.9.22,198.51.100.44,443,3180
2026-03-10T14:03:00Z,10.14.7.51,198.51.100.44,443,3044
```

`auth.log` (UTC)
```text
2026-03-10T14:07:03Z rec=A-99120 result=FAILURE user=svc_backup src=10.14.9.22 target=FS-07 (first of 12 failures through 14:07:05Z)
2026-03-10T14:07:06Z rec=A-99133 result=SUCCESS user=svc_backup src=10.14.9.22 target=FS-07
```

`asset_note.txt`
```text
WKS-2210 = 10.14.9.22, user r.singh, Finance. Clock checked 2026-03-11 08:30Z against NTP: host reads 3 min 00 s AHEAD of UTC. EDR export is in host local time = UTC by config, so subtract 180 s.
WKS-4471 = 10.14.7.51, user j.ruiz, Finance. Clock verified.
Network team confirms server-side searches for 198.51.100.44 on all server subnets (2026-02-09 to 2026-03-11) returned zero results. Query ref: Q-SRV-0311.
```

## Milestones
1. **Read everything first.** List every source, its time basis, and the conversion it needs, in `conversions.md`. Note that the US switched to daylight time on 2026-03-08, so on 2026-03-10 America/Chicago is UTC−5, not UTC−6.
2. **Normalize.** Convert every timestamp to `YYYY-MM-DDTHH:MM:SSZ`. Subtract 180 s from WKS-2210 EDR times; add 5 h to proxy times.
3. **Write the timeline** with columns `utc_time,tag,source,source_ref,statement,analyst,confidence`. Tags: `OBS`, `INF`, `ACT`, `COM`. One observation per line. `confidence` is required for `INF` rows (HIGH/MEDIUM/LOW) and empty otherwise.
4. **Add negatives.** At least two `OBS` rows whose statement starts with `NEGATIVE:` (e.g., the server-subnet search).
5. **Infer, labelled.** Add at least three `INF` rows: which host was first; how WKS-4471 was infected; whether the 118 MB POST is exfiltration (note what is *not* established — the archive contents).
6. **Answer S. Vance** in 150 words.
7. Run the checker and fix every failure.

## Acceptance criteria
- [ ] Every line is UTC with a `Z` suffix and the file is sorted ascending.
- [ ] Every row has a `source` and a retrievable `source_ref` (record id, event id, msgid, or query ref).
- [ ] WKS-2210's spawn appears at 13:51:07Z (skew corrected) and precedes its proxy download at 13:51:19Z.
- [ ] Proxy rows are converted with UTC−5 (DST), e.g. 14:31:40Z for the POST.
- [ ] ≥ 2 `NEGATIVE:` rows and ≥ 3 `INF` rows, each `INF` with a confidence.
- [ ] The answer to S. Vance states WKS-2210 was first and WKS-4471 was infected via an internal forward, marking which parts are inference.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `check_timeline.py` and run `python3 check_timeline.py timeline.csv`:

```python
#!/usr/bin/env python3
import csv, re, sys
rows = list(csv.DictReader(open(sys.argv[1], newline="", encoding="utf-8-sig")))
need = ["utc_time", "tag", "source", "source_ref", "statement", "analyst", "confidence"]
fails = []
if not rows or any(c not in rows[0] for c in need):
    sys.exit(f"FAIL: header must be {','.join(need)}")
ts = re.compile(r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$")
prev = ""
for i, r in enumerate(rows, start=2):
    t = r["utc_time"].strip()
    if not ts.match(t): fails.append(f"line {i}: time not UTC 'YYYY-MM-DDTHH:MM:SSZ': {t}")
    if t < prev: fails.append(f"line {i}: not sorted ({t} after {prev})")
    prev = max(prev, t)
    if r["tag"] not in {"OBS", "INF", "ACT", "COM"}: fails.append(f"line {i}: bad tag {r['tag']}")
    if not r["source"].strip() or not r["source_ref"].strip(): fails.append(f"line {i}: missing source/source_ref")
    if not r["analyst"].strip(): fails.append(f"line {i}: missing analyst")
    if r["tag"] == "INF" and r["confidence"] not in {"HIGH", "MEDIUM", "LOW"}:
        fails.append(f"line {i}: INF row needs confidence HIGH/MEDIUM/LOW")
    if r["tag"] != "INF" and r["confidence"].strip():
        fails.append(f"line {i}: confidence belongs only on INF rows")
    if re.search(r"https?://|\d+\.\d+\.\d+\.\d+/|\w\.example\b", r["statement"]) and "198.51.100.44" not in r["statement"]:
        fails.append(f"line {i}: indicator not defanged")

def has(time, ref):
    return any(r["utc_time"] == time and ref in r["source_ref"] for r in rows)
anchors = {
    ("2026-03-10T13:44:02Z", "MG-77120"): "mail delivery to r.singh",
    ("2026-03-10T13:51:07Z", "50211"): "WKS-2210 spawn with -180 s skew applied",
    ("2026-03-10T13:51:19Z", "8871101"): "WKS-2210 proxy GET converted from CDT (UTC-5)",
    ("2026-03-10T13:58:41Z", "50240"): "WKS-2210 task creation with skew applied",
    ("2026-03-10T14:01:55Z", "MG-77188"): "internal forward to j.ruiz",
    ("2026-03-10T14:31:40Z", "8871990"): "118 MB POST converted from CDT",
}
for (t, ref), why in anchors.items():
    if not has(t, ref): fails.append(f"missing or mis-timed anchor: {why} (expected {t}, ref {ref})")
if sum(r["statement"].startswith("NEGATIVE:") for r in rows) < 2: fails.append("need >= 2 NEGATIVE: rows")
if sum(r["tag"] == "INF" for r in rows) < 3: fails.append("need >= 3 INF rows")
for f in fails: print("FAIL", f)
print(f"{len(rows)} rows checked, {len(fails)} problems")
sys.exit(1 if fails else 0)
```

Expected output for a passing timeline: `17 rows checked, 0 problems` (row count varies). Common failing output when the DST change is missed: `FAIL missing or mis-timed anchor: WKS-2210 proxy GET converted from CDT (UTC-5) (expected 2026-03-10T13:51:19Z, ref 8871101)`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Normalization | Some sources left in local/host time | All converted; conversions documented with basis | Explains what wrong story the uncorrected order tells (WKS-2210 download *before* its spawn) |
| Sourcing and tagging | Some rows unsourced or untagged | Every row sourced and tagged; checker passes | Source refs let a classmate retrieve every record in under a minute |
| Observation vs inference | Inferences stated as fact | Every inference tagged with confidence and what would confirm it | Separates "first host" (MEDIUM: limited to retained data) from "infection path" (HIGH: msgid + timing) |
| Negatives and scope | None | ≥ 2 negatives that define scope | Names the data that would push the start earlier (mail logs before 13:44Z, DNS) |
| Answer to the lead | Restates the timeline | 150 words, correct, labelled | Flags notification-relevant gap: archive contents not established |

## Stretch goals
- Add the flow cadence: generate 30 rows of 60 s beacons for each host and compute the mean and standard deviation of intervals in a short script; put the result in an `INF` row.
- Write the lesson 05 handover note (≤ 200 words) from your timeline alone.

## Reflection prompts
- Which conversion would you most likely have missed under time pressure, and what habit would catch it?
- Where did you want to write "clearly"? What evidence replaced it?

## Instructor notes (common pitfalls, how to adapt for time)
- The two traps are deliberate: the 3-minute host skew (sign errors are common — the host is *ahead*, so subtract) and DST (UTC−5 on 2026-03-10, not −6).
- The data follows the next-day-response reading of IR-2026-0031 (see review.md open question); regenerate if the case chronology changes.
- 2-hour version: give learners `conversions.md` pre-filled and have them build and check the timeline only.
