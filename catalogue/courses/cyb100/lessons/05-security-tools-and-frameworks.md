---
lesson_id: cyb100-05
course_id: cyb100
pathway: cybersecurity-support-technician
title: Security Tools and Frameworks
order: 5
kind: lesson
competency_ids:
  - D1-S1-C04
objectives:
  - Match a monitoring or response task to the right category of security tooling and to the framework function it serves
---

## A map, not a catalogue

By now you can name what a control protects, spot the weaknesses in a described environment, and rate and treat a risk. What you cannot yet do is walk into a room where six products are running and say what each one is *for*.

That is what this lesson gives you: a map of the tool categories, and the frameworks that organize them. Both halves matter, and they answer different questions. A **tool** answers "what does this software do for me?" A **framework** answers "what should we be doing at all, and have we missed a whole area?" Organizations that buy tools without a framework end up with four products that all watch endpoints and nothing that would notice data leaving. Organizations with a framework and no tools have an impressive document.

You will not learn to operate any of these here. Each gets its own treatment later in the pathway. What you need now is the ability to hear a task — "we want to know if anyone is copying client files to a personal drive" — and say confidently which *category* of tooling addresses it and which part of a framework it belongs to. That is a genuine skill, and it is the one an entry-level technician is asked for constantly, usually phrased as "would our stuff even catch that?"

## Everything starts with a record

Before any tool: **telemetry**. Almost every security tool is built on records that systems produce as a by-product of running — authentication logs, firewall connection records, process creation events on a workstation, email delivery logs, cloud service audit trails, badge reader entries.

Three properties decide whether that telemetry is usable, and all three are boring, which is why they are so often wrong.

- **Coverage.** A device that produces no logs is invisible. During an investigation, the systems nobody configured to log are exactly the ones you most want to ask about.
- **Time.** If clocks disagree, you cannot order events, and ordering events *is* the investigation. Synchronized time across every system, and timestamps recorded with a time zone, are non-negotiable.
- **Retention.** Intrusions are commonly discovered weeks or months after initial access. Logs kept for seven days answer nothing. Retention is a cost decision made in advance and regretted afterwards.

If you take one operational habit from this lesson, take this: when asked whether a tool can answer a question, first ask whether the underlying record exists, is time-correct, and still exists today.

## The categories of tooling

Grouped by the question each answers.

### Keeping things out

**Firewalls** decide which network traffic is allowed between one part of a network and another, or between the organization and the internet, based on rules. They are the boundary control everyone has heard of. Their limits are worth stating early: a firewall that permits web browsing and email — which every firewall must — permits the two routes most attacks actually take. Rule design and the network architecture around it belong to the networking course.

**Email and web filtering.** Because email is the dominant delivery route, this is one of the highest-value categories in a small organization. Filtering blocks or quarantines malicious attachments and links, checks sender authentication, and rewrites links so they can be checked at click time. Web filtering blocks known-bad destinations and enforces policy on categories of site.

**Application allow-listing** permits only approved software to execute. Very effective, and administratively heavy — which is why it appears in mature environments and rarely elsewhere.

### Deciding who gets in

**Identity and access management** is where the account lives: creating and disabling accounts, group membership, permissions, and increasingly the single sign-on that puts one identity in front of many applications. Because attacker access almost always arrives as a valid login, this category has quietly become the most important preventive one.

**Multi-factor authentication** requires more than a password. **Password managers** make unique passwords per service possible for real humans. **Privileged access management** handles the powerful accounts specifically — vaulting their credentials, granting them for a limited window, and recording their use.

### Protecting the data itself

**Encryption** in storage and in transit; **key management** to keep the keys safe and, equally, recoverable. **Data loss prevention** inspects data in email, on endpoints, or in cloud services for patterns like card numbers or record identifiers and blocks or alerts on movement that breaks policy. **Backup and recovery** is a security tool, not just an operations one: it is the control that decides whether a ransomware event is an expensive week or the end of the business. The security-relevant properties of a backup are that a copy is offline or otherwise immutable, that it is not reachable with the same administrative credentials as the thing it protects, and that a restore has been tested recently.

### Watching the network

**Intrusion detection systems** inspect traffic and raise an alert on patterns associated with attacks. **Intrusion prevention systems** do the same and can block. The distinction is exactly that: detect and tell, versus detect and stop. Sitting inline and blocking means a false positive interrupts real work, which is why plenty of organizations run in detect-only mode for months first. Network detection and response tools extend this to behavioral baselines. Deployment and tuning belong to the networking course.

### Watching the endpoint

**Antivirus** matches files against signatures of known-bad software. **Endpoint detection and response** goes further: it records process, file, registry, and network behavior on the device continuously, alerts on suspicious *patterns* rather than known files, and lets a responder investigate the recorded history and isolate the machine remotely. That last capability — network-isolate a device from a console without visiting the desk — is the single most useful containment action available to a small team. Detailed endpoint and malware work is a later course.

### Seeing everything at once

**Log management** collects logs centrally and makes them searchable, which alone solves the two biggest problems: logs that were deleted when the machine was rebuilt, and logs an attacker could edit on the machine they control.

**Security information and event management (SIEM)** builds on it. A SIEM ingests logs from many sources, normalizes them into a common shape, and applies correlation rules across them so that a sequence which looks harmless in each individual system becomes an alert. A failed login on the file server is noise. Forty failed logins across twelve accounts from one source, followed by one success, followed by that account touching a share it has never touched, is an incident — and no single system could see it, because each holds only one part. Correlation across sources is the SIEM's reason to exist. It is also the category people most often buy and then under-feed: a SIEM with two log sources is an expensive log viewer.

**Security orchestration and automated response** sits on top of a SIEM and automates repeatable reactions — enrich an alert, disable an account, open a ticket. Powerful for teams big enough to have repeatable reactions.

### Finding your own weaknesses first

**Vulnerability scanners** check systems against a database of known weaknesses and missing patches, and produce a prioritized report. Known defects are catalogued publicly with stable identifiers so that everyone refers to the same weakness, and scored for severity on a common scale — which is a starting point for prioritization, not the answer, because a critical-rated defect on an isolated test machine may matter less than a medium-rated one on the payment server. Local context always adjusts the score.

**Patch management** deploys and verifies the fixes. **Configuration and compliance scanning** compares systems to a hardened baseline. **Asset discovery** finds what is on the network at all, which is the prerequisite for every other tool in this list — an unknown device cannot be scanned, patched, or protected.

**Penetration testing** deliberately attempts to exploit weaknesses under authorization. It is a later course, and the word *authorization* is the reason.

### Coordinating the response

**Ticketing and case management** records what was seen, what was done, by whom, and when. This is not a lesser tool than the technical ones. An incident without a timeline is an incident you cannot report on, learn from, or defend.

**Threat intelligence** supplies context about what attackers are currently doing — indicators associated with active campaigns, and behavioral descriptions of particular groups. Its value depends entirely on being matched against your own telemetry; a feed nobody compares to anything is a subscription.

## Whether the tool is any good: detection quality

Two detection approaches, with opposite weaknesses.

**Signature-based** detection matches known-bad patterns — a file hash, a rule matching a specific exploit. Precise, cheap, and explains itself. It cannot see anything new, and attackers modify their tools specifically to break signatures.

**Behavior- and anomaly-based** detection models what is normal and flags deviation, or matches suspicious sequences of actions. It can catch genuinely new attacks. It produces more false alarms, needs a baseline period, and its alerts are harder to explain.

Serious tools do both. Every alert falls into one of four cells, and you should be able to name them:

| | Something bad was happening | Nothing bad was happening |
| --- | --- | --- |
| **Tool alerted** | True positive — working as intended | False positive — noise |
| **Tool stayed silent** | False negative — the dangerous one | True negative — the normal state |

False positives waste time. False negatives are missed attacks. **Tuning** is the ongoing work of trading between them, and it is never finished because the environment keeps changing.

Understand why this matters more than it sounds. Almost every well-known breach involved a tool that *did* alert, into a queue nobody could work through. A tool producing 400 alerts a day in a two-person team has a real detection rate near zero, whatever its specification says. So when you evaluate whether a tool addresses a risk, the honest questions are: does anyone look at its output, within what time, and what happens to an alert at 6 p.m. on a Friday? A detective control with no reviewer is not a control, which is the same conclusion lesson 02 reached about the quarterly access review — the principle simply scales up.

## Frameworks: the other half of the map

A framework is an organized set of expectations about what a security program should contain. It is not software, it does not detect anything, and its value is *coverage*: it tells you which areas you have nothing in.

**The NIST Cybersecurity Framework** organizes security work into six functions, and it is the most useful mental model at this level because every tool and every task drops into one of them.

- **Govern** — who decides, what the policies are, how risk is owned and reviewed, how supplier risk is managed.
- **Identify** — knowing what you have and what could go wrong: asset inventory, data mapping, risk assessment, vulnerability scanning.
- **Protect** — the preventive work: access control, training, data security, patching, configuration hardening.
- **Detect** — noticing: monitoring, logging, alerting, analysis.
- **Respond** — acting on a confirmed incident: containment, eradication, communication, reporting.
- **Recover** — returning to normal and improving: restoration, recovery planning, lessons learned.

The functions are not a sequence, and the two most commonly starved are Govern and Detect.

**The CIS Controls** are a prioritized list of specific safeguards, ordered so that an organization can start at the top and get most of the benefit early — inventory of devices and software first, then data protection, configuration, account and access management, and so on. Where the NIST functions tell you which areas exist, the CIS Controls tell you what to do on Monday. They are grouped by implementation tiers so a small organization is not expected to do everything a large one does.

**MITRE ATT&CK** is different in kind: a catalogue of the *techniques* attackers actually use, organized by the phases you met in lesson 03 — initial access, persistence, privilege escalation, lateral movement, exfiltration, impact. It is a shared vocabulary for describing adversary behavior, and its practical use is coverage mapping: for a technique that matters to us, do we have anything that would detect it? Detection rules in modern tools are frequently labelled with ATT&CK technique identifiers for exactly this reason.

**ISO/IEC 27001** describes a management system for information security, against which an organization can be formally certified — closer to how security is *governed* than to what is technically done. Sector rules add their own: payment card requirements where cards are handled, health information rules in clinical settings, data protection law almost everywhere. The pattern to recognize is that frameworks are chosen for the organization's obligations and size, and that they overlap heavily; the work of mapping one to another properly belongs to a later course.

## Matching a task to a tool and a function

Here is the routine, and it is the objective of this lesson.

1. **State the task as a question or an action.** "Would we know if…" or "we need to be able to…"
2. **Decide what the task does about an event** — prevent it, notice it, investigate it, act on it, or recover from it. This maps almost directly onto the framework function.
3. **Ask where the evidence or the enforcement point lives** — the network, the endpoint, the identity system, the data, or the process. That picks the tool category.
4. **Check the telemetry exists** — coverage, time, retention.
5. **Check somebody will act on the output.** If not, you have named a purchase, not a control.

![The six NIST Cybersecurity Framework functions with the categories of security tooling that serve each one](./img/csf-functions-tool-categories.png)

| Task | Tool category | Function |
| --- | --- | --- |
| Stop staff receiving attachments that carry known malware | Email filtering | Protect |
| Know which devices are on the network at all | Asset discovery | Identify |
| Find out which of our servers are missing published fixes | Vulnerability scanner and patch management | Identify, then Protect |
| Be alerted when one source fails logins across many accounts, then succeeds | SIEM correlation over authentication logs | Detect |
| Stop a laptop spreading malware, without visiting the desk | EDR with network isolation | Respond |
| Know whether client records were copied to a personal cloud drive | DLP, plus endpoint and cloud audit logs | Detect |
| Get the file server back after ransomware | Tested offline backups | Recover |
| Prevent a stolen password alone from granting mailbox access | Multi-factor authentication | Protect |
| Establish who approved a change six weeks ago | Centralized log management with adequate retention | Detect, supporting Respond |
| Decide who is allowed to accept a risk and how often it is reviewed | No tool — this is policy | Govern |

Note the last row. The correct answer to "which tool solves this?" is sometimes "none, and that is the finding." A technician who can say so is more useful than one who reaches for a product every time.

### Worked examples

**"Would we know if a member of staff's password had been stolen and used from abroad?"** Category of action: notice — Detect. Evidence lives in the identity system's sign-in logs. Tool category: identity logs, ideally forwarded into a SIEM so the rule can consider both the location and what the account did afterwards. Telemetry check: are sign-in logs enabled, retained for at least ninety days, and time-synchronized? Reviewer check: who sees the alert, and what do they do at the weekend? Sensible additional recommendation: MFA, because Protect is cheaper here than Detect.

**"A supplier says one of our shared documents appeared in a public folder. What happened?"** This is investigation, which is Respond, drawing on Detect capability that had to exist beforehand. Evidence lives in the cloud service's audit trail: sharing-link creation, permission changes, file access. Tool category: cloud audit logs plus log management. The realistic outcome in many small organizations is "we cannot tell, because the audit log retains thirty days" — which is itself the finding, and its treatment is a retention change, not a purchase.

**"We want to make sure the finance team cannot email a spreadsheet of card numbers outside the company."** Preventing an action — Protect, with a Detect fallback where blocking is too disruptive. Enforcement point is the data in transit through email. Tool category: DLP policy on the mail platform. Proportionality check from lesson 04: if this fires on legitimate work it will be switched off, so start in alert-only mode. Better still, apply lesson 04's avoidance test — should the firm hold those numbers at all?

**"Our insurer asks whether we can restore the practice system within 24 hours."** Recover. Tool category: backup and recovery. The tool being installed is not the answer; the answer is the date of the last successful *tested* restore and how long it took. Notice this task has a Govern component too — someone must own the target and the testing schedule.

## Choosing between products

You will occasionally be asked to compare two products. Four questions do most of the work, and none of them is about the feature list.

1. **What telemetry does it require, and do we produce it?** A tool that needs logs you do not generate will underperform its demonstration.
2. **Who operates it and how much time per week?** Match the tool to the team you actually have. A small team is usually better served by a managed service than by a powerful console nobody has time to tune.
3. **What does it do when it fails or is offline?** Fail-open or fail-closed, from lesson 02.
4. **Which framework function does it serve, and is that our weakest one?** Buying a fifth Protect tool while Detect and Recover are empty is the most common misallocation in the field, and now you can name it out loud.

## Practice

**Part 1 — Match twenty tasks.** For each task below, give (a) the tool category, (b) the NIST CSF function it primarily serves, and (c) one sentence naming the telemetry or precondition without which it cannot work. Three of these have no tool answer at all; identify them and say what the real answer is.

1. Detect a workstation making repeated connections to an unfamiliar internet address.
2. Prevent an employee from installing unapproved software.
3. Recover a client folder deleted three weeks ago.
4. Know which laptops are missing this month's operating system updates.
5. Be told when a new administrator account is created.
6. Stop a phishing email reaching a mailbox.
7. Decide how long logs must be kept.
8. Find every device connected to the office network last Tuesday.
9. Reconstruct what an attacker did on a compromised machine over the past ten days.
10. Prevent a stolen laptop's contents from being read.
11. Alert when someone downloads an unusually large volume from the file server.
12. Isolate an infected machine from the network within a minute.
13. Confirm the backups can actually be restored.
14. Know whether the firm's data appears in a published breach.
15. Establish who is authorized to approve a payment-detail change.
16. Detect an account logging in from two countries within ten minutes.
17. Enforce unique passwords per service for every member of staff.
18. Discover which internet-facing services the organization exposes.
19. Notify affected clients after a confirmed data breach.
20. Ensure a departing employee's access is removed on their last day.

**Part 2 — Find the coverage gap.** Rowan Veterinary Group (from lessons 03 and 04) currently has: antivirus on each PC, a firewall in each clinic supplied by their internet provider, and a nightly copy of the X-ray folder to a USB drive. Place each of those three into a CSF function. Then produce a six-row table, one per function, stating for each what Rowan has and what the most important missing capability is. Finish with a ranked list of the **three** capabilities you would add first, each with two sentences justifying the order using the risk ratings you produced in lesson 04. At least one of your three must not be a product.

**Part 3 — Interrogate an alert queue.** A small firm runs a SIEM that generates about 250 alerts a day into a queue watched by one part-time technician. Write a one-page assessment answering: what is this tool's realistic true detection rate, what are the three most likely causes of the volume, what would you measure over the next month to find out which cause dominates, and what would you change first? Use the four-cell table from this lesson explicitly, and state which cell the organization is currently optimizing at the expense of which other.

**Deliverable:** one document containing the twenty matches, the coverage table with its ranked three, and the alert-queue assessment.
