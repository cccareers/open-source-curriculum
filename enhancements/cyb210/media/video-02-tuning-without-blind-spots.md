---
course_id: cyb210
media_id: cyb210-v02
type: video-script
title: "Tuning a Noisy Rule Without Creating a Blind Spot"
format: hybrid
target_runtime: "8 min"
related_lessons:
  - cyb210-02
objectives:
  - Deploy and tune endpoint protection so that it detects malicious behavior without burying the analyst in false positives
competency_ids:
  - D5-S1-C01
---

## Purpose

After watching, the learner can take a noisy behavioral rule, choose the lowest workable rung of the tuning ladder, write narrowing conditions, and run the verification search that proves no blind spot was created.

## Audience and prerequisites

Apprentices who have read lesson 02 through "The tuning ladder". The demo uses a Wazuh + Sysmon lab like the one in lesson 02's Practice; the reasoning is platform-neutral.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, presenter at desk. Lower third: "Alert fatigue is a design problem." | "Two thousand endpoints. One rule that fires once per endpoint per month on normal activity. That's sixty-seven alerts a day. Five minutes each, and one rule eats most of an analyst's day. Within two weeks they stop reading it. That's not laziness — it's a rule nobody measured. Let's fix one properly." |
| 0:35 | Screencast: alert list filtered on rule "Rapid file modification across many directories", 60 hits per night, 01:00–04:00. | "Here's our noisy rule, from the lesson's first worked example. Sixty hits a night, always overnight, always on servers." |
| 0:55 | Grouping view: a table pivoted by parent image, user, host. One row dominates: `C:\Program Files\BackupVendor\agent\bkagent.exe`, user `svc-backup`, 58 of 60. | "Rule one of tuning: never tune from a single alert. Pull thirty days and group by parent process, user, command line, and host. Here, fifty-eight of sixty come from one signed binary, running as one service account. Two don't. Remember those two." |
| 1:35 | On-screen ladder graphic, six rungs, rung 6 "Exclude from inspection" highlighted with a warning icon. | "The tempting fix is to exclude the backup directory. That's rung six — the bottom. It tells the agent to stop looking at a folder full of your most valuable data, on servers. An attacker who reads the same vendor documentation you did will put their payload exactly there." |
| 2:05 | Ladder graphic, rung 1 highlighted: "Fix the environment". | "Start at the top. Rung one: is the alert telling us something we should change? A backup job touching many files is its job. Nothing to fix in the environment. Move down." |
| 2:25 | Ladder, rung 2 highlighted: "Add a narrowing condition". Screencast: rule editor. | "Rung two: add conditions so the rule still fires for this behavior from anything else. We'll require three things together: the parent image is this exact path, the process is signed by this vendor, and the user is svc-backup." |
| 2:50 | Rule XML shown (Wazuh-style child rule, level 0 to suppress the specific case): see asset A1. Each condition highlighted as it's read. | "In Wazuh, a clean way is a child rule that matches the parent rule and our three conditions, and drops the level to zero — no alert, but the event is still stored and searchable. That's suppression, not exclusion. The telemetry survives." |
| 3:30 | Split screen: left "Suppression — telemetry kept", right "Exclusion — agent stops looking". | "Say it out loud, because it's the most consequential mistake in the lesson: suppression hides the alert and keeps the data. Exclusion throws away the data. You almost always want suppression." |
| 3:55 | Screencast: run the verification search: original rule condition AND NOT (our three conditions), last 30 days. Result: 2 events. | "Now the step everyone skips. Search the last thirty days for the rule's original condition minus our new conditions. If our tuning is right, what's left are the events we still care about. We get two." |
| 4:25 | Open the two events: one is `robocopy.exe` run by an admin's named account during a documented migration; one is `bkagent.exe` from `C:\Users\Public\bkagent.exe`, user `svc-backup`. | "Look at them. One is an admin's robocopy during a documented migration — fine, and correctly still visible. The other is bkagent dot exe — but running from C colon Users Public. Same name, same account, wrong path. If we'd tuned by filename, that would be silent. That's the event this whole video is about." |
| 5:10 | Highlight: path condition saved it; signature check would also fail. | "Our path condition caught it; the signer condition would have too. That's why good tuning uses parent path, signer, user, and command line together. One condition is easy for an attacker to satisfy by accident. Three is not." |
| 5:35 | Screencast: trigger test in lab. (a) Scheduled housekeeping script as service account → no alert. (b) Same file activity by hand as interactive user → alert fires. | "Prove both halves in the lab. The scheduled job runs: silent. Same file activity from an interactive session: the alert fires. Silent where we meant, loud everywhere else." |
| 6:15 | Tuning record template filled in on screen (see asset A2). | "Write it down in the record format from Practice Part 5: rule name, benign rate before — sixty a night — rung two and why not rung one, the exact conditions, the verification search, an owner, and a review date ninety days out." |
| 7:00 | Talking head. | "The question a reviewer should be able to answer from your record is: what did this tuning make less likely to fire, and what visibility did we keep? If they can't, the tuning isn't finished — no matter how quiet the console is." |
| 7:40 | End card: "Try it: Practice Part 4." | "Go do Practice Part 4. Make a false positive, tune it, and prove both halves." |

## On-screen assets and B-roll

**A1 — example suppression rule (illustrative; confirm field names against your Wazuh/Sysmon decoder before recording):**

```xml
<group name="local,tuning,">
  <rule id="100250" level="0">
    <if_sid>100200</if_sid>  <!-- the noisy file-modification rule -->
    <field name="win.eventdata.image" type="pcre2">(?i)^C:\\Program Files\\BackupVendor\\agent\\bkagent\.exe$</field>
    <field name="win.eventdata.user" type="pcre2">(?i)\\svc-backup$</field>
    <description>TUNED: backup agent bulk file activity (owner: endpoint team, review 2026-04-01)</description>
  </rule>
</group>
```

Note for production: Sysmon file-create events (ID 11) and process-creation events (ID 1) do not carry a signer field; signature fields appear on image-load events (ID 7). Verify against the current Sysmon schema before recording. If the platform cannot express a signer condition on this event type, say so on screen and rely on path + user + parent.

**A2 — tuning record template** (from lesson 02 Practice Part 5) as a slide.

B-roll: ladder graphic (reuse across courses), console screenshots with hostnames from the lab only.

## Accessibility

- Captions; all on-screen code is read or summarised in narration.
- Ladder graphic uses rung numbers and text labels; the highlighted rung is indicated by a thick outline and an arrow, not color alone.
- Keyboard-driven demo with visible key overlays for search shortcuts.
- Transcript includes A1 and A2 as text.

## Check for understanding

1. Why is a directory exclusion for the backup folder worse than a rung-2 condition? *Answer: exclusion stops inspection entirely in a high-value location; rung 2 keeps telemetry and alerts on the same behavior from any other process or user.*
2. What does the verification search look for? *Answer: events matching the original rule but not the new conditions, to confirm the remaining hits are the ones you still care about and that the tuning did not accidentally match everything.*
3. Name two narrowing conditions stronger than a filename. *Answer: any two of full image path, signer, user context, parent process, command-line pattern.*
