---
lesson_id: cyb210-02
course_id: cyb210
pathway: cybersecurity-support-technician
title: Endpoint Protection and EDR
order: 2
kind: lesson
competency_ids:
  - D5-S1-C01
objectives:
  - Deploy and tune endpoint protection so that it detects malicious behavior without burying the analyst in false positives
---

## Why the endpoint is the control point

You have already studied the network perimeter and the identity perimeter. Both are real, and both leak. Traffic is encrypted end to end, so the network sensor increasingly sees metadata rather than content. Identity controls tell you *who* authenticated, not what that session then did to the machine. The endpoint is the one place where an attack has to become concrete: a process has to start, a file has to be written, a registry key or a launch agent has to be created, a connection has to leave. Whatever the attacker's cleverness upstream, at the endpoint they must execute something, and execution is observable.

That is the entire argument for endpoint protection. Not "antivirus is required by the auditor" — although it usually is — but "this is the layer where the abstract becomes the specific." As a support technician, the endpoint agent is the instrument you will read most often, and the quality of your work is bounded by how well you understand what it can and cannot see.

This lesson is about two things that people wrongly treat as separate jobs: **deploying** endpoint protection so that it is actually running everywhere it should be, and **tuning** it so that the alerts it produces are worth reading. A perfectly deployed agent that generates 400 alerts a day on your backup software is not a security control; it is a noise generator with a compliance checkbox attached. A beautifully tuned rule set that is missing from 18% of your laptops is not a security control either. You need both, and they are the same skill applied at two ends of the same pipeline.

## From signatures to behavior: what actually changed

It helps to know how the category got here, because every generation of the technology is still present in a modern agent and each one fails differently.

**Signature antivirus.** The original model: keep a database of known-bad file hashes and byte patterns, scan files on write and on access, block matches. It is fast, cheap, and has near-zero false positives on a well-maintained signature set. Its weakness is definitional — it can only recognize what somebody has already seen and published. An attacker who changes one byte changes the hash. Automated packing and re-encoding make producing a novel-looking sample trivial and free. Signature detection is now a *floor*, not a strategy: it clears the enormous volume of commodity, recycled malware cheaply so that better detection is not wasted on it. Open-source `ClamAV` is a good example of this generation and is still useful exactly where its strengths lie, such as scanning file uploads and mail attachments.

**Heuristic and static-analysis detection.** Instead of matching the whole file, match structural properties: unusual section names, very high entropy suggesting packing, an import table containing only the functions needed to load code at runtime, a document containing an auto-executing macro. YARA rules, which you will meet properly in lesson 03, live here. This generation catches families rather than samples, but it produces meaningful false positives because legitimate software also packs itself, obfuscates itself, and loads code at runtime.

**Behavioral detection / endpoint protection platforms (EPP).** Watch what a process *does* while it does it, and score the sequence. A document that spawns a scripting host that spawns a network connection that writes an executable to a temporary directory is a chain that almost never occurs in legitimate work, regardless of the bytes involved. This is where malware detection stopped being about files. It is also where false positives became a real operational problem, because legitimate administration tools do individually suspicious things all day.

**Endpoint detection and response (EDR).** The insight is that no detection engine will ever be right every time, so the agent should record a rich, queryable history of endpoint activity — process creations with full command lines and parent lineage, module loads, file and configuration changes, network connections, authentication events, script contents — and stream it to a central store. Detection then becomes a query problem you can improve after the fact, and *response* becomes possible: isolate the host from the network, kill and quarantine, collect an artifact, roll back a change. EDR is what makes the difference between "the agent blocked something on Tuesday" and "here is the full story of what happened on that machine, and here is what we did about it."

**Extended detection and response (XDR)** is the same idea widened to correlate endpoint telemetry with mail, identity, and cloud telemetry. Treat it as a data-integration claim rather than a new detection technique; the endpoint part of it is what you are learning here.

Modern agents are all of the above stacked. When you read a detection, your first question should be *which layer produced this*, because a signature hit, a static-heuristic hit, a behavioral chain, and a machine-learning score have completely different reliability profiles and demand completely different follow-up.

## What the agent actually collects

You cannot tune what you cannot picture. Here is the telemetry a competent endpoint agent produces. The names differ per vendor; the categories do not. On Windows, the open-source `Sysmon` utility produces almost exactly this set and is the standard way to learn it without a commercial licence; on Linux, `auditd` plus `osquery` covers similar ground; `Wazuh` is a widely used open-source platform that collects and rules over all of it.

| Telemetry | What it records | Why it matters |
| --- | --- | --- |
| Process creation | Image path, full command line, hashes, user, parent process, parent command line | The single most valuable event type. Most detections are really parent/child + command-line patterns |
| Module / image load | DLLs and shared objects loaded into a process, signed or not | Catches injection and side-loading |
| File events | Creates, writes, renames, deletes, with path and process | Ransomware, staging directories, dropped payloads |
| Configuration persistence | Registry keys, scheduled tasks, services, cron, systemd units, launch agents | Persistence is where attackers must commit an artifact |
| Network connections | Process, destination address and port, DNS queries | Command and control, exfiltration, lateral movement |
| Authentication and logon | Logon type, source host, account | Credential abuse, lateral movement |
| Script and command content | PowerShell script blocks, shell history, WMI activity | Fileless attacks leave no file, but they leave a command |
| Removable media / device | USB mass storage attach | A real initial access path in some environments |

![The endpoint detection pipeline, from raw agent telemetry through detection logic to alert triage and response actions](./img/edr-detection-pipeline.png)

Two properties of this table matter more than its contents. First, **process creation with full command line and parent lineage carries most of the detection value**. If you can only get one thing turned on, get that. Second, **the telemetry is retained even when nothing alerts**, which is what lets you go back after Thursday's mail incident and ask "did that attachment ever run on any machine?" A tool that only records its own alerts cannot answer that question, and answering that question is most of the job.

## Prevention modes: what the agent is allowed to do

Detection tells you. Prevention stops it. Every agent exposes some version of these actions, and part of deployment is deciding which are enabled, where, and at what confidence threshold.

- **Block on write / block on execute.** Refuse to let the file land or run. Highest value, highest risk of an outage if wrong.
- **Quarantine.** Move the file to a protected store and remove it from its original location, reversibly. Better than delete, because a false positive is recoverable.
- **Process termination.** Kill the offending process tree.
- **Host isolation (network containment).** Cut the machine off from everything except the management console. This is the single most valuable response action in the tool and is central to lesson 06's project.
- **Rollback.** Some agents journal file changes and can restore files a ransomware process encrypted. Treat it as a bonus, never as a backup strategy.
- **Tamper protection.** Prevent a local administrator — including an attacker who obtained local administrator — from stopping the service, uninstalling the agent, or excluding a directory. If tamper protection is off, everything else in this lesson is optional from the attacker's point of view. Turn it on.

Confidence-graded response is the norm: high-confidence detections block automatically, medium-confidence detections alert a human, low-confidence signals are recorded for hunting only. Getting that ladder right is exactly the tuning problem.

## Deploying the agent

Deployment sounds like a packaging exercise and is really a coverage exercise. The questions that decide whether it succeeded are all about what you *missed*.

**1. Inventory first, agent second.** You cannot claim coverage against a denominator you do not have. Reconcile at least two independent sources — the directory service's computer objects, the DHCP or network access control view of what is actually on the wire, the asset or procurement list — and treat the union as the population. Every serious under-coverage finding I have seen came from a machine class nobody had listed: the lab bench workstations, the contractor laptops, the server the finance team never told anyone about, the build agents.

**2. Decide platform coverage honestly.** Windows workstations are the easy case. Servers need a different policy, because a scanning agent that is fine on a laptop can be an availability problem on a busy database host. macOS and Linux endpoints need explicit plans; "we only do Windows" is a decision, so write it down as one rather than letting it happen. Mobile device management is a separate discipline and out of scope for this course.

**3. Roll out in rings, in detect-only mode first.** The standard pattern is four waves: a pilot ring of security and IT staff, an early-adopter ring of a few dozen tolerant users, a broad ring, and a final ring of the fragile and the critical — executives, production servers, anything with a hard uptime commitment. Each ring runs in **detect-only** (alert, do not block) long enough to see a full business cycle, typically a week, including whatever happens at month end. Promote a ring to blocking only after its alert volume is understood.

**4. Baseline the machine you are protecting.** An agent watches for deviation, which presupposes something to deviate from. A secure configuration baseline — a documented, applied, verified standard configuration such as a CIS Benchmark — narrows the set of things that legitimately happen on the endpoint and therefore makes every behavioral rule sharper. Disabling unnecessary services, removing local administrator rights from daily-use accounts, and enforcing script execution policy each remove entire categories of false positive *and* entire categories of attack. Baselining is a distinct skill with its own evidence trail; treat it here as the precondition that makes tuning tractable.

**5. Instrument agent health as a first-class metric.** An agent can be installed and useless: stopped service, definitions three weeks stale, no check-in for eleven days, telemetry channel disabled by a misapplied policy. Build a report answering four questions and review it weekly — how many endpoints in the inventory have an agent, how many checked in during the last 24 hours, how many have current content, and how many are in the intended policy. Any endpoint failing any of the four is an open finding, not a background annoyance.

**6. Handle exclusions as exceptions, not as configuration.** Vendors of backup, development, database, and imaging software all publish "recommended antivirus exclusions." Some are genuinely necessary. Every one of them is also a place an attacker can hide a payload with no detection at all, and attackers are perfectly capable of reading the same vendor documentation you did. Rules: exclude the narrowest thing that solves the problem, prefer a process-based exclusion over a whole-directory one, prefer a specific path over a wildcard, never exclude a user-writable directory such as a temp or downloads folder, record who asked and why, and put an expiry date on it.

## Tuning: the actual craft

Here is the number that governs your life. Suppose you have 2,000 endpoints and a detection rule that fires, on average, once per endpoint per month on benign activity. That is 67 alerts a day from one rule. If a human spends five minutes confirming each one, that rule alone consumes most of a working day, forever, and the analyst doing it will start closing them without looking within two weeks. That behavior — alert fatigue — is not a character flaw. It is the predictable result of a rule that was deployed without measuring its benign rate.

So the first principle of tuning is: **measure the benign rate before you decide the rule's fate.** Detect-only mode exists for this.

### The vocabulary you need to be precise about

- **True positive** — the rule fired and the activity was actually malicious.
- **False positive** — the rule fired and the activity was benign.
- **True positive, benign context** — the activity really is what the rule describes, and it is authorized. Your administrator really did run a remote command with a credential-harvesting tool's exact syntax, during a sanctioned test. This is not the same as a false positive and must not be tuned away the same way.
- **False negative** — the rule did not fire and the activity was malicious. The expensive one, and the one you cannot count directly, which is why every tuning decision must be justified by what it *stops* seeing.
- **Precision** — of the alerts this rule produced, what fraction were worth acting on. This is the number you tune.
- **Suppression versus exclusion.** *Suppression* stops an alert from being shown while the underlying telemetry is still collected and still searchable. *Exclusion* stops the agent from inspecting or recording the thing at all. Suppression is nearly always what you want; exclusion is a hole. Confusing these two is the most consequential mistake in this lesson.

### The tuning ladder

When a rule is too noisy, walk down this ladder and stop at the first rung that works. Every step down loses you visibility, so stopping early is the whole point.

1. **Fix the environment instead of the rule.** The alert is telling you something true: an unmanaged remote-access tool is installed on 40 machines, a script runs from a world-writable directory, a service account interactively logs on. Removing the cause removes the alerts *and* removes the risk. This rung is skipped constantly and it is the highest-value one.
2. **Add a condition that narrows the rule.** Not "ignore `powershell.exe`" but "ignore `powershell.exe` when the parent is the patch management agent's service binary, running as SYSTEM, with a command line matching the deployment wrapper." Good narrowing conditions are parent process, signing certificate, full command-line pattern, user context, and destination. A rule with three conditions is far harder for an attacker to satisfy accidentally than a rule with one.
3. **Suppress a specific, described instance.** Same narrowing logic, but applied as an alert-level suppression with an owner, a reason, and a review date. Telemetry retained.
4. **Downgrade severity rather than silence.** Move it from "page someone" to "appears in the daily review queue" or "hunting data only." Many rules are valuable in aggregate and worthless individually.
5. **Disable the rule.** Legitimate when the rule does not apply to your environment at all — a Linux-specific rule on a Windows-only estate, a rule for a product you do not run. Illegitimate as a way to make Tuesday quieter. Record the decision and who accepted the risk.
6. **Exclude from inspection.** Last resort, narrowest possible scope, expiry date, named owner, and a compensating control written next to it.

Never tune based on a single alert. Pull the last 30 days of that rule's firings, group them by parent process, command line, user, and host, and look at the shape. Tuning from one example produces either a rule that is still noisy or a hole you cannot see.

### Worked example 1: the backup agent that looks like ransomware

A behavioral rule named "rapid file modification across many directories" fires 60 times a night, always between 01:00 and 04:00, always on servers, always with the same parent process — the backup vendor's binary, signed by the vendor, running as a service account.

The lazy fix is to exclude the backup directory. That is rung 6, and it hands an attacker a directory the agent never looks at, on servers, where the data is.

The correct fix is rung 2: add conditions requiring the parent image to be that specific signed binary, running under that specific service account, from its installed path. Now the same file-modification behavior from any other process still alerts. Then verify the tuning did what you meant: search the last 30 days for the rule's original condition *minus* your new conditions and confirm the remaining hits are the ones you care about. That verification search is the step people skip, and it is the step that catches a typo in an exclusion pattern that accidentally matched everything.

### Worked example 2: the administrator who looks like an attacker

A rule fires on remote service creation from a workstation. The investigation shows it was a systems administrator using a legitimate remote-management tool during a sanctioned maintenance window.

This is not a false positive. The rule correctly described the activity; the activity was authorized. Tuning it away means an attacker performing the identical action is invisible, and this specific action — remotely creating a service on another host — is one you want to see every single time.

The right answer is procedural rather than technical: administrators perform this work from designated management hosts, using named accounts, within announced windows. The rule then narrows to "remote service creation from a source that is *not* a designated management host," which is both quieter and strictly more valuable than it was before. This is rung 1 wearing a disguise — you changed the environment, and the rule got sharper as a side effect.

### Worked example 3: the machine-learning verdict on the in-house tool

The agent's static machine-learning engine quarantines a small internal utility written by the company's own developers, scored "malicious, high confidence." It is unsigned, freshly compiled, statically linked, and does something unusual with network sockets. Every one of those is a feature the model weighs, and the model has never seen this file before because it exists in one company.

Two fixes, and you want both. Short term, restore from quarantine and allow it by file hash — hash-based allow-listing is precise and breaks the moment the file changes, which is exactly the property you want. Long term, get internal software code-signed with an organizational certificate and allow by publisher, so the next build does not repeat the incident. Never allow by filename or by directory; both are trivially satisfied by an attacker who can write a file.

## Knowing whether the tuning worked

Four measures, reviewed on a schedule, will tell you more than any dashboard.

- **Alerts per analyst per day**, and the fraction closed as benign. If more than roughly three quarters of what a human opens is benign, the pipeline is broken and you are training people to ignore it.
- **Rule-level precision**, tracked over time. Sort your rules by volume; the top five are almost always where the tuning work is.
- **Coverage against a technique framework.** Map your enabled rules to MITRE ATT&CK techniques and look at the blank areas. This turns "we have 900 rules" into "we have no coverage of persistence via scheduled task," which is an actionable sentence.
- **Detection validation.** Periodically confirm your rules still fire. Open-source Atomic Red Team provides small, documented, reversible test procedures for individual ATT&CK techniques; run them **only in an isolated lab environment or an explicitly authorized test host, never against production without written authorization**, and confirm each produced the alert you expected. A rule nobody has ever seen fire is a hypothesis, not a control.

Note what validation is not: it is not running malware. It is executing a benign action that produces the same observable behavior, so the detection logic is exercised without any hostile code involved.

## Practice

You will build the deployment-and-tuning artifact that a technician is actually asked for. Work in a lab environment only.

**Lab requirements.** Use two virtual machines you control on an isolated host-only network: one endpoint VM and one collector VM. Take a clean snapshot of the endpoint VM before you start so you can revert. **No malware of any kind is used in this exercise** — every action below is a benign administrative command chosen because it produces the same telemetry a malicious action would.

**Part 1 — Stand up telemetry.** Install an endpoint agent capable of process, file, and network telemetry. Open-source options that work for this exercise: Wazuh with the Sysmon integration on a Windows endpoint, or Wazuh with `auditd` on a Linux endpoint. Confirm the endpoint appears in the console, is checking in, and is on the policy you intended.

**Part 2 — Produce and read telemetry.** On the endpoint VM, perform these five benign actions, and for each one find the corresponding event in the collector and record the event type, the process image, the full command line, the parent process, and the user context:

1. Launch a command shell from a text editor or office application.
2. Create a scheduled task (or cron job) that runs a script one minute from now.
3. Copy a signed system binary to a temporary directory under a different name and run it.
4. Make an outbound network connection to a host on your isolated lab network.
5. Create a new local user account and add it to the local administrators group.

For each, write one sentence naming the ATT&CK-style technique the action resembles and one sentence on why a defender would care.

**Part 3 — Write two detection rules.** Using the rule syntax of the platform you chose, write one rule for action 1 (office application spawning a shell) and one for action 5 (local administrator group modification). Trigger each and confirm it fires.

**Part 4 — Generate and tune a false positive.** Write a small benign script — a backup or housekeeping script that touches many files in many directories — and schedule it to run under a service account. Confirm your file-activity detection fires on it. Now tune it using **rung 2 of the tuning ladder**: add conditions on parent image, user context, and path so that the scheduled script no longer alerts, while the same file activity from an interactive user session still does. Prove both halves: show the tuned rule staying silent for the script, and show it firing when you perform the same file activity by hand.

**Part 5 — The write-up.** Produce one document containing:

- A coverage table for your lab: inventory, agents installed, agents checked in during the last 24 hours, agents on current content, agents in the intended policy.
- The five telemetry records from Part 2.
- Both rules from Part 3, with the alert each produced.
- A tuning record for Part 4 in this exact form: rule name, observed benign rate, which rung of the ladder you used and why not a lower one, the exact conditions added, the verification search you ran to confirm you had not created a blind spot, the owner, and the review date.
- One paragraph naming a detection your tuning made *less* likely to fire, and what compensating visibility you would keep.

A reviewer should be able to disagree with your tuning decision and find your reasoning written down.
