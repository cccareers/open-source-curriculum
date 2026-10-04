---
lesson_id: cyb120-10
course_id: cyb120
pathway: cybersecurity-support-technician
title: "Project: Forensic Evidence Handling Exercise"
order: 10
kind: project
competency_ids:
  - D3-S1-C02
  - D3-S1-C03
objectives: []
---

## Goal

Take a compromised lab host from first contact to a defensible evidence package. You will acquire volatile and non-volatile evidence without destroying it, prove its integrity, maintain an unbroken chain of custody, analyze the artifacts you collected, safely examine the malicious sample recovered from the host in an isolated environment, and produce an indicator set the rest of a response could act on.

The measure of success is not how much you find. It is whether a stranger — a colleague, a specialist you escalate to, an auditor a year from now — can pick up your package and rely on every item in it.

## Safety and scope

This project is blue-team work on instructor-supplied material, and the safety rules are conditions of doing it at all.

- All analysis happens in **your isolated laboratory virtual machine**. Network isolation is host-only or disconnected; shared folders, clipboard sharing, and drag-and-drop are off; a clean snapshot is taken before every run and restored after.
- The sample is **supplied by your instructor**. You will not write, modify, or deploy malicious code, and you will not run anything against a system you do not own.
- The sample is transported and stored in a **password-protected archive**, referenced by hash in all notes, with its extension neutered and every URL and address defanged in prose.
- **No live sample** is placed on a network share, in a ticket, or in a chat channel.
- **No submission to public services** without your instructor's explicit approval, and the reasoning for the decision is recorded either way.
- No credentials, real data, or production access exist inside the analysis VM.

Your **lab attestation** from lesson 07 — each control, how you verified it, the result — is attached to this project's package as its first document. If you have not produced one, produce it before you start.

## What you are given

- A running lab virtual machine that has been compromised, with a plausible business identity (host name, user, role) supplied.
- A snapshot of that VM's state, so the exercise can be repeated.
- Network telemetry from the lab environment covering the compromise window: flow records, DNS logs, and a packet capture.
- A malicious sample, supplied separately in a password-protected archive, corresponding to what is present on the host.
- An evidence storage location — a directory, share, or removable device — and a physical or simulated evidence store for any device-level item.
- Blank evidence log and chain-of-custody forms, or the format your instructor requires.

## Requirements

### Part 1 — Plan before you touch

Write the acquisition plan **before you interact with the host**. It must state, in order: what you will collect, in what sequence, why that sequence follows volatility, what tool you will use for each item, where each output will be written, and what you will hash and when. It must also state what you will *not* collect and why.

Include a **footprint statement**: the changes you expect your own activity to cause on the evidence system, before you cause them.

Have a classmate or your instructor review the plan. Record any change you made as a result.

### Part 2 — Live acquisition

Execute the plan on the running host. At minimum:

1. Photograph or screen-capture the console before anything else, including anything on screen, and note the time from a trusted source.
2. Record the host's system time against a trusted source and compute the **clock offset**.
3. Capture **memory** to external media, and hash the capture on completion.
4. Capture **volatile system state**: active connections with owning processes, listening ports, the process tree with full command lines and parent relationships, loaded modules, logged-on sessions, open files, ARP and DNS caches, routing table, services, and scheduled tasks.
5. Perform a **targeted file collection** of event logs, the relevant user profile artifacts, browser history and downloads, and any implicated files.

Keep a **full transcript** of the session: every command, with its exact time.

### Part 3 — Non-volatile acquisition

Acquire the host's storage. Document the device, verify write blocking (or, for a virtual disk, document the equivalent read-only handling and how you verified it), hash the source, create the image, hash the image, and verify the match. Produce the acquisition record with tool names and versions, start and end times, sizes, and both hashes.

If you perform a triage collection rather than a full image, say so explicitly, define the collection scope in advance, and state in the record what the collection therefore cannot show.

### Part 4 — Evidence log and chain of custody

Produce a complete evidence log covering every item, with: identifier, description, exact source, collection time in UTC, collector, method and tool version, hash and algorithm, current storage location, and current holder.

Produce chain-of-custody forms showing at least **three transfers**, one of which must be a handover to another person (a classmate acting as an evidence custodian or a specialist). Hashes are verified on receipt at every transfer and the verification is recorded.

Your evidence must be under someone's control or in secured storage at every moment. Any gap is a defect.

### Part 5 — Host and network artifact analysis

Working **only from verified copies**, analyze the evidence to answer these questions, citing the specific artifact behind each answer:

- What executed on this host, and when?
- How did it get there?
- What persistence exists, and how many separate mechanisms?
- What accounts were used, and were any created or modified?
- What network destinations were contacted, and with what cadence?
- What files were created, modified, or deleted during the incident window?
- Was anything collected or staged for exfiltration, and is there evidence it left?
- Is there evidence of anti-forensic activity — cleared logs, manipulated timestamps, self-deletion?

Corroborate every significant host claim with **network evidence collected off the host**, and say explicitly where you could not.

### Part 6 — Sample analysis

Analyze the supplied sample in your isolated VM, producing both:

**A static analysis record**: all three hashes; true file type versus extension; size; signature information; compilation or authoring timestamp with your interpretation; a capability profile; every network, path, and configuration string extracted; an entropy assessment with a packing conclusion; and, for a document sample, an enumeration of its active content without opening it in its target application.

**A dynamic analysis record** in `T+` format: process, file, configuration, network, and system behavior over a defined run period, with the snapshot reverted afterwards. If the sample shows no behavior, say so and give your assessment of whether evasion is likely, with the evidence for that view.

### Part 7 — The merged timeline

Build one UTC timeline that merges host artifacts and network telemetry for the incident. Keep the dynamic lab run as a separately dated analysis track with its recorded UTC start and `T+` offsets; compare its behavior with the incident, but never assign lab-relative times to attacker events. Every entry carries a source. Every inference is labelled with a confidence rating. Negative results are included where they define scope. Apply and record the clock offset you measured in Part 2.

### Part 8 — Indicator deliverable

Produce the indicator set in the lesson 07 format: host indicators, network indicators, a plain-language behavioral description, and an explicit **"not established"** section. Every indicator carries a confidence, a recommended action (block, alert, hunt, or record), and the false-positive risk of that action in one sentence.

### Part 9 — Footprint disclosure and escalation note

Write the section of the case record that discloses **your own footprint**: every change your activity made to the evidence system, matched against your Part 1 prediction, with any unpredicted change explained.

Then write an **escalation note of no more than 250 words** to a specialist: what you preserved, the chain of custody, exactly what you ran and when, what you concluded, and the single question you want answered. Choose a real limit you hit — packing, a memory-only artifact, deleted content — rather than inventing one.

## Constraints

- **Acquisition order follows volatility.** Any deviation is documented with its reason at the time.
- **The host is not powered off** during acquisition unless active destruction requires it, in which case the decision is recorded with its justification.
- **Hash at acquisition**, verify after every copy and every transfer, record every verification with time and person.
- **Original evidence is never analyzed directly.** All analysis is on verified working copies.
- **Never delete from the record; correct forward.** Superseded entries stay, marked.
- **All times UTC**, with the measured clock offset applied and shown.
- Tool **names and versions** recorded for every acquisition and analysis step.
- **No unsourced claims.** An artifact reference or it does not go in.
- **Defang everything** in prose; neuter sample extensions.
- **No fabrication.** "Not established" plus the source that would establish it, every time.

## Definition of done

- [ ] Lab attestation completed and attached, with each control verified rather than assumed.
- [ ] Acquisition plan written *before* first contact, reviewed, and changes recorded.
- [ ] Console captured and clock offset measured and recorded before any collection.
- [ ] Memory captured first, hashed at completion, hash recorded in two places.
- [ ] Volatile state collected covering every category listed in Part 2, with a full command transcript.
- [ ] Storage image acquired with source and image hashes **matching**, and the verification recorded.
- [ ] Evidence log complete for every item, with no field left blank.
- [ ] Chain of custody unbroken, with at least three transfers, both parties recorded, and hash verification at each receipt.
- [ ] All analysis demonstrably performed on working copies; the originals' hashes still verify at the end of the project.
- [ ] All eight artifact-analysis questions answered with cited artifacts, including honest "not established" answers.
- [ ] At least three host claims corroborated with off-host network evidence.
- [ ] Static and dynamic sample records complete, with the snapshot reverted after the run.
- [ ] At least **two distinct persistence mechanisms** identified, or a documented and defended finding that only one exists.
- [ ] Merged timeline in UTC, fully sourced, inferences labelled, offset applied, negatives included.
- [ ] Indicator deliverable contains at least eight indicators across at least four types, each with confidence, action, and false-positive risk.
- [ ] "Not established" section present and specific.
- [ ] Footprint disclosure written and compared against the Part 1 prediction.
- [ ] Escalation note under 250 words, with a single clear question.
- [ ] A classmate has audited your package and confirmed: every hash verifies, the custody chain has no gap, and every claim in your timeline can be retrieved from its cited source.

## Hints

**The plan is the project.** Most of the defects that appear in this kind of work are decided before anything is collected — wrong order, no destination prepared, no clock offset, no footprint prediction. Spend real time on Part 1 and the rest gets much easier.

**Prepare your destination before you touch the host.** Writing collected data to the evidence machine's own disk overwrites unallocated space you may have wanted, and it is a mistake you cannot undo.

**Measure the clock offset first.** It takes five seconds, it is unrecoverable afterwards, and every timestamp conclusion you draw depends on it.

**Expect the operating system to lie to you on a compromised host.** If the live tooling and the network telemetry disagree, believe the network telemetry — it was collected on a system the attacker does not control — and record the discrepancy rather than resolving it silently.

**Run static analysis before you detonate, and write down your prediction.** Comparing the prediction to the behavior is where the learning is, and it also means you know what to watch for during the run.

**Find the second persistence mechanism.** Samples in this class commonly install more than one, and the single most common eradication failure in the field is removing the obvious one. Enumerate every autostart location systematically rather than stopping at the first hit.

**Write the negatives down as you go.** "Searched all autostart locations, found two" is a finding. "Found two" is an anecdote.

**Log your own commands with times, from the first one.** Reconstructing your footprint at the end from memory is exactly the failure this whole discipline exists to prevent — and your classmate's audit will find the gap.

**Say what you could not determine, in a section with a heading.** Silence is read as either ignorance or concealment. An explicit "not established" list is the mark of an analyst who can be trusted with the things they *did* establish.
