---
course_id: cyb210
media_id: cyb210-a02
type: animation-storyboard
title: "Four Minutes on jrivera's Laptop: A Behavior Chain Grows"
target_runtime: "100 sec"
suggested_tool: "Manim"
related_lessons:
  - cyb210-03
  - cyb210-02
objectives:
  - Classify a malware sample by its observed behavior and name the indicators it leaves on an endpoint
competency_ids:
  - D3-S1-C03
  - D5-S1-C01
---

## Concept and misconception it fixes

Misconception: "Malware triage means finding out the family name." The animation grows the lesson 03 worked-example process tree in real time, tagging each node with the behavior it represents and the pyramid tier of its indicator, so the learner sees that classification and urgency come from the chain of behaviors — not from a vendor label. It also shows *where* the earliest high-value detection opportunity sits (office app spawning a shell).

## Visual language

- Timeline ruler along the bottom, 09:14:00 → 09:18:10, with a playhead.
- Process nodes as rounded rectangles; parent→child edges as arrows. File writes as document icons; network events as dotted lines to a cloud labelled `203.0.113.44`; persistence as a clock icon.
- Behavior tags (pill shapes) appear beside nodes: "Initial access", "Execution", "C2", "Persistence", "Defense evasion". Each tag also carries an ATT&CK-style short label in text.
- Okabe-Ito palette: sky blue #56B4E9 benign/expected processes; orange #E69F00 suspicious; vermillion #D55E00 high-urgency; bluish green #009E73 for "detection opportunity" markers. Shape and text carry meaning without color (e.g., a ★ marks detection opportunities).
- A side panel, "Five questions", with five rows that fill in as evidence appears: wants / spreads / persists / talks / damage done.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Empty canvas; `OUTLOOK.EXE` node; document icon `Remittance_0472.docm` drops into Temp. | Playhead at 09:14:02; icon falls. | "09:14. Outlook writes a macro-enabled document to Temp." |
| 2 | 8 s | `WINWORD.EXE` child appears. Tag: "Initial access — user opened attachment". | Edge draws. | "The user opens it." |
| 3 | 12 s | `cmd.exe` child of Word. ★ marker and green ring pulse. Tag: "Execution — office app spawns shell". | Node shakes once; ★ appears. | "Word spawns a command shell. This almost never happens legitimately — it's your earliest, highest-value detection point." |
| 4 | 12 s | `powershell.exe -nop -w hidden -enc …` child. A speech bubble decodes the base64 into "download and run…" text (generic, no real payload). | Base64 string scrambles into plain words. | "Encoded PowerShell. Decoding a command line is reading, not reverse engineering — it's in scope." |
| 5 | 10 s | Dotted line to cloud: DNS `cdn-update-service[.]example → 203.0.113.44`. Five-questions panel: "Talks: yes". | Dotted line animates outward. | "It resolves a domain dressed up as an update service." |
| 6 | 10 s | File icon `svcupd.exe` written to Roaming; new node `svcupd.exe` starts. | Icon lands; node blooms. | "A payload lands in a user-writable folder and runs." |
| 7 | 10 s | `schtasks.exe` child with clock icon "OneDriveSync every 15 min". Panel: "Persists: yes". | Clock ticks. | "A scheduled task named to look like a sync client. Cleanup must remove this." |
| 8 | 12 s | Three dotted pulses at 09:15:10, 09:16:10, 09:17:10, each ~400 bytes, evenly spaced on the ruler with a "60 s" bracket. Tag: "C2 beacon". | Pulses fire in rhythm. | "Small, uniform, every sixty seconds. That's a beacon — someone may be on the other end." |
| 9 | 10 s | `vssadmin.exe delete shadows` child; screen edge flashes vermillion border with text "Ransomware precursor". Panel: "Damage done: recovery points destroyed". | Border pulse once (no strobe). | "Shadow copies deleted. This changes the urgency of everything above it." |
| 10 | 8 s | Zoom out to full tree, all tags visible; panel complete. Caption: "Classified by behavior — no family name required." | Slow pull-back. | "Loader, remote access, persistence, beaconing, ransomware staging. You know what to do — and you never needed the family name." |

## Interaction variant

Scrubbable timeline: learners drag the playhead and, at each pause point, choose which behavior tag applies and which pyramid tier the indicator belongs to (hash, IP, domain, host artifact, tool, TTP). A final screen asks them to pick a containment action (isolate / power off / wait and observe) with feedback citing the beacon and shadow-copy evidence.

## Production notes

- Use only the defanged domain and documentation IP from lesson 03. Do not show any real decoded payload; the decoded text in scene 4 is a generic English paraphrase.
- Avoid rapid flashing (keep under 3 flashes/second, per WCAG 2.3.1).
- The same template can render the lesson 06 Northgate scenario (`NG-LT-0412`, `wsynchost.exe`) as a second pass for the runbook project.
