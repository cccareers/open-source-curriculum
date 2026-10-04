---
lesson_id: cyb120-05
course_id: cyb120
pathway: cybersecurity-support-technician
title: Incident Documentation and Chain of Custody
order: 5
kind: lesson
competency_ids:
  - D3-S1-C01
  - D3-S1-C02
objectives:
  - Document an incident timeline and preserve evidence so that it survives later review
---

## Why this comes before the forensics

You might expect a course to teach evidence collection first and record-keeping afterwards. This one does it the other way round on purpose, because the failure mode it prevents is the most common one in the field: a responder who collects first and documents later produces findings nobody can rely on.

The reason is simple and slightly uncomfortable. Everything you do during an incident is destructive to some degree. You log into a host and the logon is recorded, timestamps change, memory shifts. You copy a file and access times may update. You reboot a machine and the running state is gone forever. None of that is avoidable — response requires touching things. What makes it acceptable is that you can say afterwards, precisely, what you touched, when, why, and what state the thing was in before you touched it. That record is not paperwork about the investigation. It *is* the investigation's credibility.

And the record has to be made *at the time*. Human memory for sequences of events under pressure is poor, and it degrades in a specific and dangerous way: it reorganizes events into the story you later believed, so that the memory feels vivid and confident while being wrong about the order. A note written at 14:22 is evidence. The same note written from memory at 19:00 is a reconstruction, and an honest analyst has to label it as one.

Ask who reads your documentation later, and the standard becomes obvious:

- The next analyst on shift, who has to continue your work without you.
- Your manager, who has to decide whether to escalate.
- The post-incident review, which cannot examine decisions it cannot see.
- Legal counsel, deciding whether a notification obligation has been triggered.
- The cyber insurance carrier, deciding whether the claim is supported.
- A regulator, potentially years later.
- Occasionally, a court, where an opposing party's job is to find the gap.

You will not know which of these apply while the incident is running. So you write to the strictest plausible standard from the first minute, because you cannot retroactively make notes contemporaneous.

## The case record

Every incident gets a single case record with a single identifier, and that identifier appears on every note, every file, every evidence item, and every message about the case. A simple convention is enough — `IR-<year>-<sequence>`, as in `IR-2026-0031` — but it must be assigned at declaration and used without exception. Two people working the same incident under two different names is a real and expensive failure.

A workable case record has these sections. The order matters less than the fact that each exists and is filled as you go rather than at the end.

**Header.** Case ID, title, current severity, current status, incident type, the declaring person and declaration time in UTC, the incident lead, and the time zone convention statement ("all times UTC unless explicitly marked").

**Summary.** Three to five sentences, rewritten as understanding changes, always reflecting *current* belief. Anyone should be able to read only this and know where the case stands. Keep the previous versions — how the summary changed over time is itself part of the story.

**Timeline.** The chronological record. This is the heart of the case record and it gets its own section below.

**Affected assets and accounts.** A table: identifier, type, role, status (suspected, confirmed compromised, contained, cleared), and owner. This is the scope, made explicit, and it is the thing people most often carry in their heads and then get wrong.

**Evidence inventory.** Every item collected, with its identifier, hash, and location. Own section below.

**Indicators.** The indicators derived from the case, in the form lesson 04 described, with confidence and context.

**Actions taken.** Every change *you* made — containment actions, blocks, resets, isolations — with time, actor, authorization, and result. Keep this separate from the timeline of attacker activity, or your after-action analysis will be a swamp. Two columns of history, one of what they did and one of what you did, is the single most useful structural choice in a case record.

**Open questions.** Things you do not know, with who owns finding out. This section is a mark of a competent responder rather than a confession of ignorance, and it is the first thing a colleague picking up your case should read.

**Communications log.** Who was told what, when, and by whom — including notifications to management, legal, users, and any external party.

**Decisions.** Significant decisions with the reasoning at the time and who made them. Recorded *at the time*, before the outcome is known, so the review can assess the decision on the information available rather than with hindsight.

## Writing the timeline

The timeline is where documentation is won or lost, and it has a small number of rules that are worth learning as habits rather than as guidelines.

**One line, one observation, in UTC.** Every entry has a time, a source, and a statement. If a single log record supports two claims, write two lines.

**Separate observation from inference, visibly.** This is the rule that most improves a responder's work. An observation is what a source shows. An inference is what you think it means. Both belong in the timeline; confusing them is how a plausible early guess becomes the received truth of the incident by mid-afternoon and survives unchallenged into the report.

```text
Times UTC; attacker observations 2026-03-10, response action 2026-03-11.
14:02:11Z [OBS ] EDR event 40912 on WKS-4471: WINWORD.EXE (pid 6640)
                 spawned powershell.exe (pid 8812), cmdline includes
                 "-nop -w hidden -enc". Analyst: M. Okafor.
14:02:19Z [OBS ] Proxy log 8871223: WKS-4471 GET
                 hxxp://cdn-updates-cache[.]example/win/upd.ps1 - 200,
                 41229 bytes, content-type text/plain.
14:02:19Z [INF ] The encoded command at 14:02:11 likely retrieved the
                 script observed at 14:02:19. NOT YET CONFIRMED - decoding
                 of the command line is pending. Confidence: medium.
2026-03-11 10:18Z [ACT ] Network isolation applied to WKS-4471 and WKS-2210
                 via endpoint agent.
                 Authorized by S. Vance (IR lead) at 10:16Z. Hosts left
                 powered on. Performed by M. Okafor. Result: confirmed
                 isolated at 10:19Z, agents still reporting.
```

Four tags carry a lot: `OBS` for observed fact, `INF` for inference, `ACT` for something the response team did, and `COM` for a communication. Some teams add `DEC` for decisions. Use whatever your team uses, but use something, and never let an inference into the record without its label and its confidence.

**Cite the source of every observation.** Not "the proxy showed" but the specific log, the record identifier where one exists, and enough detail that someone else can retrieve the same record. An observation that cannot be re-derived from its source is an assertion.

**Say who.** Every entry names the analyst. On a busy case, four people are writing into the same timeline and "we checked the mail gateway" is useless three days later.

**Record negatives.** "Searched all workstation event logs for scheduled-task creation matching the pattern; no results outside WKS-4471 and WKS-2210" is one of the most valuable lines you can write. Negatives define scope, they are the only evidence that a question was asked, and without them the report cannot distinguish "we looked and found nothing" from "nobody looked."

**Never delete; correct forward.** If an entry is wrong, add a new entry that corrects it and mark the original as superseded. A record with visible corrections is credible. A record that has been silently tidied is not, and a tidied record is worse than a messy one in every forum where it will be read.

**Write plainly and without blame.** "The user opened the attachment at 14:02" is a fact. "The user carelessly opened the attachment" is an opinion that will be quoted back at you and will, quite predictably, make the next user hesitate to report their own mistake. Describe actions and systems, not character.

**Timestamp discipline for the awkward cases.** When a source records local time, write the UTC conversion and the original in parentheses. When a host's clock is known to be wrong, record the observed skew and mark every entry derived from that host. When you only know a range, write the range — `between 13:45Z and 14:02Z` — rather than picking a point. When the time comes from a file system timestamp, say which timestamp it is, because created, modified, and accessed times mean different things and are manipulable.

**Screenshots have rules too.** Capture the whole window including the clock and the address or query bar, not a cropped fragment. Note in the timeline what you captured, when, and from where. A screenshot is a convenience, not primary evidence — always record the underlying source so the finding does not rest on an image.

## Evidence: what makes it survive review

An evidence item is anything you preserved to support a finding: a disk image, a memory capture, a packet capture, an exported log set, a quarantined file, a physical device, a photograph. The techniques for acquiring these are lesson 06's subject. What makes them *hold up* is four properties, and they are your responsibility from the moment the item exists.

**Authenticity** — it is what you say it is, from where you say it came.
**Integrity** — it has not changed since collection, and you can prove it.
**Completeness** — the collection is not a selective slice that flatters a conclusion.
**Custody** — every person who has held it, and every place it has been, is accounted for continuously.

### Integrity through hashing

A cryptographic hash is the mechanism that makes integrity provable. Compute the hash of an item at the moment of collection, record it, and any later party can recompute it and confirm the item is unchanged. If the hash matches, the bytes are the same. If it does not, something changed and you have to find out what.

```text
$ sha256sum IR-2026-0031-E002.dd
3f1c9b0d4a77e2f5c8ab1d6e90724c3fbb5a1e8d02c47f6a9b3d5e70118cc24a  IR-2026-0031-E002.dd
```

Practical rules that make hashing actually work:

- **Hash at the moment of acquisition**, not later. A hash computed an hour after collection proves the item has not changed since *then*, which is not the claim you need.
- **Record the hash in two places**: the evidence log and the case timeline, both with the time it was computed and by whom.
- **Verify after every copy and every move.** Copy the image to the evidence server, rehash, confirm the value matches, and record the verification. Storage does silently corrupt, and a verification you did not do is one you cannot claim.
- **Use a current algorithm.** SHA-256 is the sensible default. MD5 and SHA-1 remain in wide use and many tools emit them; recording them alongside SHA-256 costs nothing and helps when comparing against older reference data, but they should not be your only integrity claim.
- **Hash the original, and work only on copies.** Every subsequent analysis happens against a verified working copy. If you damage a working copy, you make another from the original. If you damage the original, the case is damaged.

### Labelling and the evidence log

Every item gets a unique identifier the moment it exists, and the identifier is written on the item — a physical label on a device, a filename convention for a digital item. A convention that carries the case, a sequence, and the source is enough:

```text
IR-2026-0031-E001  Memory capture, WKS-4471, 14:31Z 2026-03-11
IR-2026-0031-E002  Disk image, WKS-4471 internal drive, 15:04Z–15:52Z 2026-03-11
IR-2026-0031-E003  Packet capture, VLAN 14 span, 14:05Z-15:00Z 2026-03-10
IR-2026-0031-E004  Exported proxy logs, 2026-03-01 to 2026-03-10
IR-2026-0031-E005  Laptop, WKS-4471, asset tag 88214, physical custody
IR-2026-0031-E006  Flow search export, saved 09:52Z 2026-03-11
```

The evidence log records, for every item: identifier; description; the exact source (make, model, serial, asset tag, or system and log name); collection time in UTC; the collector; the method and tool with version; the hash and algorithm; the current storage location; and the current holder.

That "method and tool with version" field is easy to skip and worth insisting on. Tools have bugs, and a finding produced by a version later shown to mishandle a data structure needs to be re-examined. Nobody can find those findings if the tool version was never written down.

### Chain of custody

Chain of custody is the continuous, documented record of who had the item, from collection to disposal. The word that carries the weight is *continuous*. A single unexplained gap — an hour where nobody can say where the drive was — is enough for a reviewer to set the item aside, and everything that item supported goes with it.

The transfer record is simple and it is not optional:

```text
Item: IR-2026-0031-E002  Disk image, WKS-4471 internal drive
SHA-256: 3f1c9b0d4a77...cc24a

Date/Time (UTC)   Released by     Received by     Purpose / Location
2026-03-11 15:52  M. Okafor       M. Okafor       Acquisition; held on
                                                  forensic workstation FW-01
2026-03-11 16:40  M. Okafor       D. Aguilar      Transfer to evidence
                                                  store; safe #2, shelf B
2026-03-12 09:15  D. Aguilar      L. Park         Analysis; working copy
                                                  made and verified,
                                                  original returned 09:40
2026-03-12 09:40  L. Park         D. Aguilar      Return to safe #2

Hash verified on receipt at each transfer: yes / initials
```

Rules that keep a chain intact:

- **Every transfer is signed by both parties**, with the date and time. "I left it on his desk" is not a transfer.
- **The item is under someone's control or in secured storage at every moment.** Secured means access-controlled and access-logged: a locked safe or cabinet with a documented key holder for physical items; a restricted directory or dedicated evidence system with logging for digital ones.
- **Verify the hash on receipt** for digital items and record the verification. It converts the chain from a claim about people into a claim about mathematics.
- **Record purpose, not just movement.** Why the item moved matters as much as that it moved.
- **Handle originals as little as possible.** Every access is an entry in the chain and an opportunity for error; work from verified copies.
- **The chain continues to disposal.** Evidence is retained for a defined period set by policy and any legal hold, and its destruction or return is recorded like any other transfer.

For physical items there are additional habits: photograph the device in place before moving it, including any visible screen; record serial numbers and asset tags; use tamper-evident bags with recorded seal numbers; note the physical condition; and never leave an item in a vehicle or an unlocked room, however briefly.

### Legal hold and the duty to preserve

When litigation, regulatory action, or law enforcement involvement is reasonably anticipated, the organization has a duty to preserve relevant material, and normal deletion routines must stop. In practice this means suspending log rotation and retention expiry for the relevant systems, halting the reuse or reimaging of affected hardware, preserving mailboxes, and telling everyone involved in writing.

Destroying material that should have been preserved — **spoliation** — is treated seriously, and it does not require bad intent. A backup rotation that overwrites the relevant month while the case is open is spoliation by neglect, and it is the commonest form.

Two things are within your scope as a responder, and you should treat them as reflexes. First, **raise the question early**: when an incident involves regulated data, employee conduct, a third party, or anything that might become a dispute, ask your lead whether a hold applies. Asking is never wrong. Second, **when a hold is in place, know what it covers** and be able to name what routine processes would otherwise delete. The compliance machinery around notification deadlines and regulator obligations belongs to cyb150; what belongs to you is the preservation reflex and the awareness that a clock may be running.

## Documenting while it is happening

All of this is easy to agree with and hard to do at 14:22 with three people asking questions. Some practical technique.

**Keep the note-taking channel separate from the discussion channel.** Discussion is threaded, fast, and full of half-thoughts. The case record is linear and considered. Copy facts from one to the other deliberately.

**Adopt the two-person pattern when you can.** One person works, one person records. It feels like a luxury and it roughly doubles the value of the resulting record, because the working analyst narrates and the scribe timestamps. On a small team, the scribe role can rotate hourly.

**Write before you act, for actions.** Before a containment step, write the intended action, the authorization, and the expected effect; afterwards add the result. Writing first takes thirty seconds and it catches the unauthorized action before it happens rather than after.

**Use a fixed entry format** so entries are fast to write and fast to scan. Time, tag, source, statement, analyst. Muscle memory beats deliberation when you are tired.

**Never trust a tool to be your record.** Query histories expire, consoles clear, and product retention is not your retention. If a finding matters, copy the evidence into the case record with its source reference.

**Do a five-minute pass at the end of every shift or major phase.** Reread your own entries, resolve anything you wrote in shorthand, mark inferences that have since been confirmed or refuted, and update the summary and the open questions. Then write a handover note: current status, what is in flight, what you touched, what you would do next, and what you are uncertain about.

## What a good record looks like from the outside

Here is a short passage from a case record, showing what a competent hour reads like. Notice that nothing in it is clever — it is entirely a matter of discipline.

```text
IR-2026-0031  Suspected document-delivered intrusion, finance workstation
Times UTC, 2026-03-11 unless dated. Lead: S. Vance. Record maintained by M. Okafor.

09:41Z [DEC ] Declared incident, SEV2. Basis: unauthorized code execution
              confirmed on two hosts with an active outbound channel; no
              evidence yet of server access or data movement. Decided by
              S. Vance.
09:44Z [COM ] Notified IT operations manager (R. Bell) by phone that two
              finance workstations may require isolation. No action requested
              of them yet.
09:52Z [OBS ] Flow records for 198.51.100.44, 2026-02-09 to present:
              two internal hosts only - 10.14.7.51 (WKS-4471) from
              2026-03-10 14:03Z, 10.14.9.22 (WKS-2210) from 2026-03-10 13:52Z. Query and result set saved
              as IR-2026-0031-E006 (flow search export). Analyst: M. Okafor.
09:55Z [OBS ] NEGATIVE: same query against all server subnets returns no
              results. No server has contacted this address in the retained
              period (30 days). Analyst: M. Okafor.
10:03Z [INF ] WKS-2210's earlier start time (13:52Z vs 14:03Z) suggests it
              may be the initial entry point rather than WKS-4471.
              NOT CONFIRMED - mail gateway records for both users not yet
              reviewed. Confidence: low. Owner: L. Park.
10:05Z [OPEN] Q1: Which host was first? Q2: Did either user receive the same
              message? Q3: Is svc_backup activity at 2026-03-10 14:07Z related?
              Owners: L. Park (Q1, Q2), M. Okafor (Q3).
10:18Z [ACT ] Network isolation applied to WKS-4471 and WKS-2210 via endpoint
              agent. Authorized by S. Vance 10:16Z. Both hosts left powered
              on to preserve memory. Performed by M. Okafor. Result: both
              confirmed isolated at 10:19Z; agents still reporting.
```

Read it as a stranger would. The severity has a stated basis reflecting what was known at declaration; later evidence of data movement or server access requires reassessment. The scope query is saved as evidence rather than described. There is a negative result establishing that servers were checked. The containment names its authorizer and its evidence-preserving choice. The most interesting idea in the passage is labelled as an unconfirmed inference with low confidence and an owner. And the open questions are numbered and assigned.

Nothing there required expertise. It required someone deciding, at the start, that the record was going to be worth reading.

## Practice

**Exercise 1 — Separate observation from inference.** Your instructor supplies a raw analyst chat transcript from a simulated incident. Rewrite it as a proper timeline: every entry tagged `OBS`, `INF`, `ACT`, or `COM`, in UTC, with source citation and analyst name. Mark every place where the transcript states an inference as though it were a fact, and write one sentence per case on the wrong conclusion a reader could have drawn.

**Exercise 2 — Fix a broken chain.** Here is a custody record for a laptop hard drive. Identify every defect and write the corrected record, adding any field that is missing entirely.

```text
3/10   Mike    took drive from machine
3/10   Mike    imaged it, md5 was ok
3/11           gave to Dana
3/13   Dana    Lisa analyzed it and gave it back
3/20           returned to IT for reimaging
```

Then write a paragraph, as if to your manager, explaining which findings from that drive you would now be unwilling to rely on and why.

**Exercise 3 — Build the evidence log.** For a scenario your instructor supplies involving at least four evidence items of different kinds, produce a complete evidence log with every field this lesson lists, plus a chain-of-custody form for the two physical items. Include at least one transfer to an external party (for example a specialist forensics vendor) and show how the record handles it.

**Exercise 4 — Prove and break integrity.** In your lab, create a small file, compute and record its SHA-256, copy it, verify the copy, and record the verification as you would in a case. Then modify a single byte of the copy and recompute. Document the result exactly as you would if this had happened unexpectedly to real evidence, including the entry you would write in the timeline and the three things you would immediately check.

**Exercise 5 — Reconstruct from a bad record.** Your instructor gives you a deliberately poor case record — missing times, no sources, blame language, inferences stated as facts, and no negatives. Write a one-page assessment naming every specific question the record cannot answer, what would have had to be recorded to answer each, and which two defects you would fix first if the team could only change two habits.

**Exercise 6 — Run a live documentation drill.** Working in pairs with a scenario supplied by your instructor, run thirty minutes of simulated response with one person acting and one recording, then swap roles for a second thirty minutes. Produce a complete case record for both halves. Afterwards, exchange records with another pair and review each other's against a checklist you build from this lesson — every action authorized and attributed, every observation sourced, every inference labelled, negatives present, no blame language, times in UTC, and a usable handover note at the end.

## Check your understanding

1. Your note written at 19:00 describes what you did at 14:22. How must it be labelled, and why? *As a reconstruction, not a contemporaneous note — memory under pressure reorders events into the story you later believed.*
2. You hashed a disk image an hour after acquiring it. What does that hash prove, and what does it not? *It proves the image has not changed since that hash was taken; it does not prove the image is unchanged since collection.*
3. An entry in the timeline is wrong. What do you do? *Never delete; add a correcting entry and mark the original as superseded.*
