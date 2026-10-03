---
course_id: cyb120
media_id: cyb120-v01
type: video-script
title: "Triage in Four Questions: Working the Shift Queue"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cyb120-03
objectives:
  - Triage an alert queue and decide which alerts become incidents
competency_ids:
  - D1-S1-C04
  - D2-S1-C02
---

## Purpose
After watching, the learner can cluster a queue by entity, apply the four triage questions in order, and assign precise dispositions, including a benign true positive.

## Audience and prerequisites
Learners who have read cyb120-03 through "The triage procedure". The six-alert queue from the lesson is shown in a plain text editor; no SIEM is required.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | The six-alert queue (A-101 to A-106) in an editor, SEV column highlighted. | "Start of shift. Six alerts. The tool says two are high. Here's the first habit: the severity column is a factory default that knows nothing about this company. We'll use it as an input, not an answer." |
| 0:25 | Cursor sorts rows by ENTITY; A-101, A-102, A-103 group under WKS-4471. | "Before working anything, cluster. Sort by entity. Three of these six are the same workstation, WKS-4471, within five minutes. That's one investigation, not three." |
| 0:50 | Side panel shows the raw lines: EDR 14:02:11, proxy 14:02:19, IDS 13:58. | "Put them in time order using the raw logs, not the queue. At 14:02:11 Word spawns PowerShell. Eight seconds later the proxy sees a script downloaded. But the IDS alert says 13:58 — before either. That's either clock skew or an earlier connection. Write it down as an open question; don't smooth it over." |
| 1:30 | Four boxes appear: Real? Authorized? Blast radius? What else? | "Now the four questions, always in this order. One: is it real? Two: is it authorized? Three: what's the blast radius if it's bad? Four: what else looks like this?" |
| 1:50 | Box 1 ticks: "3 independent sources agree". | "Real: endpoint, proxy, and network sensor all agree. Three independent witnesses." |
| 2:05 | Box 2: change calendar open, empty. | "Authorized: the change calendar's empty, and nobody can offer a benign reason for a document launching a hidden, encoded script on a finance workstation." |
| 2:25 | Box 3: asset inventory row "WKS-4471 · Finance · non-privileged · maps finance share". | "Blast radius — and notice we ask this third, before going deep. Finance workstation, non-privileged user, but it maps the finance share. Sensitive data in reach." |
| 2:50 | Box 4: query typed: `dst_ip=198.51.100.44 OR url="*cdn-updates-cache[.]example*" last 30d` → result: WKS-4471, WKS-2210. | "What else: pivot on the strongest fact — the destination and the URL — across thirty days. A second workstation, WKS-2210, appears, starting earlier. That's what turns 'a workstation' into 'an intrusion'." |
| 3:20 | Disposition stamp: "INCIDENT — declare (lesson 02)". | "Disposition: incident. Declare it with a UTC timestamp, two corroborating sources, scope, and severity." |
| 3:40 | A-105 row: DLP 240 MB upload, WKS-3307. | "A-105: 240 megabytes to personal cloud storage. Looks scary, labelled high. Real? The proxy confirms it. Authorized? We ask the manager: this is a designer with an approved exception for moving large asset files." |
| 4:10 | Two stamps side by side: "FALSE POSITIVE" struck through; "BENIGN TRUE POSITIVE" circled. | "So what is it? Not a false positive. The rule fired correctly and the activity happened. It's a benign true positive. Call it a false positive and someone 'fixes' a rule that works. Instead: record the exception and propose encoding it so it stops costing twenty minutes a week." |
| 4:45 | A-104 row: svc_backup 12 failures then success from 10.14.9.22. | "A-104 is marked only medium. Real: yes. Authorized: no — svc_backup should log in from the backup server, and 10.14.9.22 is a workstation. Blast radius: high, because service accounts often reach every file server. And look — 10.14.9.22 is WKS-2210, the host from our pivot. The quiet medium alert just joined the incident." |
| 5:30 | A-106 row: PUA quarantined. | "A-106: potentially unwanted app, quarantined. Real, against policy, blocked. One pivot first — is it on forty machines? If not, route to desktop support." |
| 5:55 | Final worked order list with one-line reasons. | "Worked order: the WKS-4471 cluster plus A-104 as one incident, then the A-105 exception note, then the A-106 referral. Ordered by impact times confidence, not the SEV column." |
| 6:25 | Talking-head inset. | "Every disposition gets the four answers written down. A closed alert with no reasoning looks exactly like one nobody examined. Now do Exercise 2 yourself, and time each record." |

## On-screen assets and B-roll
- Lesson 03 queue, raw log excerpts, a mock change calendar, and an asset inventory row.
- Four-box triage overlay, reused per alert; disposition stamps.

## Accessibility
- Captions; every query and log line on screen is read aloud.
- Disposition stamps differ by text and shape (strike-through vs circle), not colour alone.
- Editor at 18 pt minimum; cursor highlight; no fast scrolling.
- Transcript includes all queries in copyable text.

## Check for understanding
1. Why cluster before triaging individual alerts? *Several alerts often belong to one investigation; clustering prevents duplicate work and two analysts unknowingly working halves of the same intrusion.*
2. A-105 was authorized. Why is it not a false positive? *The activity happened and the rule matched what it was meant to catch; it is a benign true positive.*
3. What turned A-104 from a separate medium alert into part of the incident? *Its source IP 10.14.9.22 is WKS-2210, the host found by pivoting on the C2 destination.*
