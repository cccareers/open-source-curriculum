---
lesson_id: cyb140-03
course_id: cyb140
pathway: cybersecurity-support-technician
title: The Assessment Methodology
order: 3
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Describe each phase of a supervised penetration test and what the tester is accountable for in it
---

## Why a methodology exists at all

An assessment without a methodology is a person poking at things until something interesting happens. It produces findings, sometimes good ones, and it is worthless as a professional product — because nobody can say what was covered, nobody can reproduce a result, two testers on the same target produce incomparable answers, and the client cannot tell the difference between "we found nothing here" and "we never looked here."

A methodology fixes all four problems by imposing a phase structure with defined inputs, defined outputs, and a defined exit condition per phase. It also does something less obvious and more important for you: it tells a supervisor exactly what to delegate. An assistant is not handed "go test the network." An assistant is handed a phase, a target subset, a tool, and an evidence standard, and is accountable for the artifact that phase produces. Knowing the phase model is therefore knowing your own job description.

Several published methodologies exist and they agree far more than they differ. **NIST SP 800-115**, the *Technical Guide to Information Security Testing and Assessment*, is the one most often cited in US public-sector and regulated work; it splits assessment into planning, discovery, attack, and reporting, and it is deliberately conservative about what testing may do. The **Penetration Testing Execution Standard (PTES)** gives the most granular commercial phase model — pre-engagement interactions, intelligence gathering, threat modeling, vulnerability analysis, exploitation, post-exploitation, reporting — and is a good vocabulary source even where a firm does not follow it literally. The **OWASP Web Security Testing Guide (WSTG)** is not a phase model but a test-case catalog for web applications, and it is what you will actually work from in the next lesson but one. The **OSSTMM** takes a measurement-oriented view and is worth knowing by name. Firms typically run a house methodology derived from one of these, mapped to whatever compliance regime the client is answering to.

Use whichever your engagement specifies. The phase names below follow the common commercial shape; if your employer calls phase three "enumeration" instead of "discovery," the work is the same.

![The phases of a supervised assessment, from pre-engagement through reporting and retest, showing what enters and leaves each phase and where the supervisor's approval gates sit](./img/assessment-phases.png)

## Knowing what kind of assessment you are on

Before the phases, one piece of vocabulary that people get wrong constantly and that clients get sold wrong almost as often. These are five different products.

**A vulnerability scan** is an automated check of a target set against a database of known weaknesses. It is fast, broad, cheap, repeatable, and shallow. It finds missing patches and obvious misconfigurations. It cannot find a business logic flaw, cannot chain two low-severity issues into a serious one, and produces false positives that a human must resolve. Run monthly or continuously.

**A vulnerability assessment** is a scan plus human analysis: validation, deduplication, contextual risk rating, and prioritized recommendations. The output is a prioritized list of weaknesses, not a demonstration that any of them can be exploited. This is the product an entry-level assistant contributes to most.

**A penetration test** goes further: a human attempts, within scope, to demonstrate that specific weaknesses can actually be exploited and what an attacker would gain. The output is a set of proven attack paths with impact. It is narrower than a scan and deeper.

**A red team engagement** is different in kind. Its objective is not coverage of a target list but achievement of a specific goal — reach this data, move to this system — while evading detection, over weeks, usually unannounced. Its real subject is the defenders, not the systems. Assistants do not lead these.

**An audit** checks conformance to a standard or policy. It asks whether a control is documented, implemented, and evidenced — not whether a determined adversary can defeat it. An audit can pass while a penetration test fails, and that is not a contradiction; they measure different things.

Two more terms you will hear. A **purple team** exercise runs offensive activity and defensive monitoring side by side and deliberately shares information in real time, to tune detection. A **bug bounty** is a standing, public invitation to test within a published scope in exchange for payment per valid finding — note that the published scope *is* the authorization, and that testing outside it carries the same legal consequences as testing anything else without permission.

Also fix these three axes, because they appear in every scope document:

- **Black box / gray box / white box** — how much information the tester is given. Black box means little more than a target list; white box means architecture documents, configurations, and often source. Gray box, the commonest, means credentials and a description. More information does not make the test easier to pass; it makes coverage better per hour spent, which is why white box usually finds more.
- **Credentialed / uncredentialed** — whether tools authenticate to the target. A credentialed scan reads actual installed package versions and configuration; an uncredentialed one infers from the outside and is far noisier.
- **External / internal** — the network position the test runs from. Internal testing routinely finds a far larger issue set, which tells you something about how organizations invest.

## Phase 1 — Pre-engagement

**Purpose:** establish that the engagement is lawful, bounded, resourced, and understood.

This is lesson 02's material, appearing here as a phase because it is one. Authorization is confirmed, scope is verified against ownership records, the ROE is signed, contacts are exchanged, the window is booked, source addresses are registered with the client, credentials are issued, and any third-party notification is filed.

**What the assistant is accountable for:** verifying that every target on the list is covered by the signed scope; loading exclusions into every tool that will be used and confirming the tool honors them; confirming that testing infrastructure originates from the registered addresses; setting up the evidence store and the activity log. Nothing here is glamorous and every one of these is a job that goes badly when skipped.

**Exit condition:** signed authorization on file, verified target list, tools configured with exclusions, contacts confirmed reachable.

## Phase 2 — Information gathering

**Purpose:** build an accurate picture of the target's attack surface before touching it hard.

Split this in two. **Passive** information gathering uses sources that do not touch the target: public registration records for domains and address ranges, certificate transparency logs, public DNS data, published documentation, job postings that name technologies, public code repositories, and search engine results. It is quiet and it is legally the least fraught, though "publicly available" does not license you to act on what you find outside scope.

**Active** information gathering touches the target: DNS resolution against the target's own servers, host discovery across the in-scope range, and reading what services advertise about themselves. The moment you go active, you are inside the authorization and inside the window, and every action belongs in the log.

The output is an asset inventory: which addresses are alive, what names map to them, what the network shape appears to be, and what the organization looks like from outside. Attack surface is not just hosts — it is also the software estate, the third-party dependencies, and the entry points a real adversary would find first.

Two disciplines matter here more than any tool. First, **provenance**: every entry in your inventory records where it came from and when, because inventories decay and a stale one produces findings against systems that no longer exist. Second, **boundary discipline**: passive sources will hand you assets that are not in scope. Record them as out of scope and do not touch them. This is the phase where scope creep most often begins.

**What the assistant is accountable for:** a complete, sourced, timestamped asset inventory with an explicit out-of-scope column, and confirmation that nothing outside the authorized list was touched.

## Phase 3 — Discovery and enumeration

**Purpose:** determine, for each in-scope host, what is listening and what it is.

This is the first phase with a heavy technical footprint: port and service enumeration, version detection, and the beginning of configuration observation. Lesson 04 covers the mechanics and the tooling. What belongs here is the *methodological* point: enumeration output is raw material, not findings. A list of open ports is not a vulnerability report, and handing a client one is the most common way an inexperienced tester embarrasses their employer.

Enumeration is also where the first real safety decisions appear. Aggressive timing can degrade fragile services. Some device classes — legacy industrial controllers, medical devices, older network printers, embedded appliances — are known to fail on ordinary scan traffic that any modern server ignores. Where those exist in scope, the timing, the port set, and the check set are all decided in advance by the supervisor and written down. An assistant does not turn up the aggression to save time.

**What the assistant is accountable for:** complete coverage of the assigned target subset, machine-readable output preserved with timestamps, a written note of any host that behaved abnormally, and the throttling settings actually used recorded alongside the results.

## Phase 4 — Vulnerability analysis

**Purpose:** turn observations into candidate findings, then turn candidate findings into confirmed ones.

Two activities, and conflating them is a career-limiting habit. **Identification** is matching what you observed against known weakness data — a service version against vulnerability databases, a configuration against a hardening baseline, an exposed function against a class of weakness. **Validation** is establishing that the candidate is real on *this* system in *this* configuration. Lesson 04 is largely about validation, because the gap between a scanner's claim and a defensible finding is where most of an assistant's value sits.

Threat modeling belongs here too, in a lightweight form: given what this organization does and what this system holds, which of these candidates actually matters? A missing patch on an internet-facing authentication service and the same missing patch on an isolated test box are the same technical fact and two entirely different findings.

**What the assistant is accountable for:** a candidate list with each item traced to the specific observation that produced it; a validation status per item with the evidence attached; a false-positive determination with a stated reason for anything dismissed. "Dismissed as FP" with no reason is not a determination, it is a guess.

## Phase 5 — Exploitation, and where it stops

**Purpose:** demonstrate, within the depth the scope permits, that a validated weakness has real consequences.

This phase carries the highest risk and the tightest constraints, and it is the phase where your role as an *assistant* is most restrictive. Three points define it.

**The scope sets the rung.** Lesson 02 described a ladder: report only, validate without exploiting, exploit to prove impact, exploit and pivot. Whichever rung the scope names is a hard ceiling. Nothing in this course goes above "validate and demonstrate," and no exercise in this course involves exploiting anything outside the isolated lab range.

**The supervisor decides what runs.** In a supervised engagement, the assistant does not select an exploitation action. The supervisor selects it, states the target, states the expected effect, and states the stop condition; the assistant executes exactly that and records the result. This is not bureaucracy. Exploitation actions can crash services, corrupt data, lock accounts, and trigger real incident response, and the person accountable for those consequences must be the person choosing them.

**Minimum necessary impact.** Prove existence, not extent. If access is obtained, the demonstration is a screenshot showing the access and a single innocuous marker — not a data dump, not a new account, not a persistence mechanism, not a change to anything. Every professional methodology says this and every serious incident involving a testing firm involved somebody ignoring it.

**Post-exploitation** in a commercial test means documenting what the access implies and then stopping: what privileges were obtained, what would be reachable from here, what data was in scope of the access. It does *not* mean building a foothold. Persistence, credential harvesting, control evasion, and log manipulation are excluded from ordinary engagements and are entirely out of scope for this course — the first because it leaves the client worse off, the last because it destroys the evidence your own report depends on.

**Cleanup is part of the phase, not an afterthought.** Anything created during testing is enumerated as it is created and removed at the end, with the removal recorded. An artifact left behind on a client system is a finding against you.

**What the assistant is accountable for:** executing only the approved action; recording the exact action, its options, its timestamp, and its outcome; capturing evidence to the standard the ROE sets; stopping at the stated boundary; declaring every artifact created; escalating instantly if the effect was not the expected one.

### Tooling, described honestly

The intake for this course names two tools, and they are worth describing as categories rather than as recipes.

**Kali Linux is a distribution, not a capability.** It is a Linux build that ships with several hundred security tools already installed and configured, plus the drivers and dependencies they need. Its value is that it removes a day of setup and gives a team a common baseline, so a supervisor can say "use the standard image" and know what is on it. It confers no authority and no special legitimacy; running Kali does not make an action authorized, and the same tools run on any Linux system. What matters professionally is that a testing platform is built from a known image, kept updated, kept isolated from your personal life, encrypted at rest because it will hold client data, and rebuilt or wiped between engagements so one client's data never sits on the same disk as another's.

**Metasploit is an exploitation framework**, which means a library of modules organized by target and weakness, a mechanism for delivering a payload, a session manager for interacting with a result, and — the part people undersell — a database and logging layer. A supervised assistant's relationship with it is narrow: run the module the supervisor named, with the options the supervisor specified, against a lab target, and record what happened. The framework is genuinely useful to a *defender* for two reasons beyond the obvious. First, it is a catalog: browsing module metadata tells you which weaknesses have reliable public tooling behind them, which is a strong signal for prioritization — a weakness with a mature public module is meaningfully more likely to be used against you than one that needs original research. Second, its output is evidence: the module name and version, the target, the options set, the timestamps, and the session record together form a reproducible account of a test action, and that account is what goes in the report appendix.

It also produces artifacts a defender should be able to recognize on the other side: distinctive process and service creation, unusual outbound connections from a server that normally makes none, authentication events at odd hours from unexpected sources. Part of the reason a support technician studies offensive tooling is to recognize its footprint in a log — which is exactly the skill cyb120 was building.

Nothing in this course provides module selections, payload configurations, or exploitation chains, and none is needed to meet the objective. What you are accountable for is the discipline around the tool, not the tool's contents.

## Phase 6 — Reporting

**Purpose:** produce the artifact the client actually bought.

Everything before this is inputs. The report is the product, and in a well-run firm it consumes as much time as the testing did. Its standard shape:

- **Executive summary** — what was tested, what the overall risk posture is, and the three or four things that matter, in language a non-technical executive can act on. No jargon that is not defined in the same sentence.
- **Scope and methodology** — what was in scope, what was excluded, when, from where, by whom, at what depth, and what limitations applied. This section is what makes "we found nothing here" meaningful.
- **Findings**, each with: a title, a severity with the rating method stated, affected assets, a description of the weakness, the evidence, reproduction steps, business impact, and a recommendation.
- **Appendices** — raw output, tool versions, the activity log, and the artifact declaration.

Two properties separate a good finding from a bad one. It is **reproducible**: someone else, given the report, can confirm it. And it is **actionable**: the recommendation names the specific change on the specific asset, not a platitude. "Improve patch management" is not a recommendation. "Upgrade the package on these six hosts, then verify by re-running the check in appendix C" is.

**What the assistant is accountable for:** drafting findings from their own work, with evidence attached and severity justified; ensuring every claim traces to a log entry; making sure the affected-asset list is complete rather than illustrative; and redacting sensitive data out of screenshots before the draft leaves the evidence store.

## Phase 7 — Remediation support and retest

**Purpose:** close the loop.

The report is delivered and walked through with the client. Questions are answered. The client remediates on their own schedule, and after an agreed interval a retest verifies the specific findings. A retest is not a new assessment: it is a targeted re-execution of the original checks, and its output states, per finding, remediated / partially remediated / not remediated, with fresh evidence. This is also where an assistant most often works independently, because the checks are already written down.

Lesson 06 takes the whole of this phase from the defender's side, which is where your career actually sits.

## Practice

Every hands-on element below is confined to the instructor-provided, isolated lab range against the intentionally vulnerable target systems supplied for this course, under the lab authorization and the rules of engagement you drafted in lesson 02. Do not touch any address outside that range.

**Part 1 — Distinguish the products.** A client says: "We need a penetration test for our compliance audit. We have 900 servers and a budget for five days." Write a 300-word response that (a) names what a five-day engagement across 900 servers can and cannot establish, (b) states which of the five assessment types their stated need actually calls for, (c) explains the difference between an audit and a penetration test in terms the client can use with their auditor, and (d) proposes a combination of products that meets the real requirement. Do not agree to the request as stated.

**Part 2 — Build a phase checklist.** Produce a working checklist for a supervised assessment covering all seven phases. For each phase, write: the inputs required to start, the specific tasks assigned to an assistant, the artifact that must exist at the end, and the exit condition that lets the phase close. Every artifact must be a nameable file or document, not an activity. Keep it to two pages — this is a document you should be able to work from, not read once.

**Part 3 — Map a lab engagement.** Treating your lab range as the client, write a one-page engagement plan: perspective, depth ceiling, phases you will execute, target subset per phase, tools per phase, evidence store layout, and the naming convention for every artifact. Include the throttling and timing settings you intend to use in the discovery phase and one sentence on why they are conservative.

**Part 4 — Phase-exit evidence.** Execute phases 2 and 3 against your lab range only, and produce the two artifacts your Part 2 checklist requires: a sourced asset inventory with an out-of-scope column, and a discovery output set with machine-readable files preserved and timestamps intact. Attach the corresponding activity log entries. You are being graded on the completeness and provenance of the artifacts, not on how much you found.

**Part 5 — Tool accountability note.** Choose one tool available on the standard lab image. In no more than 400 words, write the note a supervisor would want before letting an assistant run it: what category of tool it is, what it does to a target, what evidence it produces and in what format, what its known failure modes are, what could go wrong on a fragile system, what settings you would fix in advance, and what you would escalate. Do not include any command that would exploit a target — describe accountability, not offense.

**Part 6 — Supervision boundary drill.** For each situation, write two or three sentences: what you do, what you do not do, and what you escalate.

1. Your assigned discovery subset is complete an hour early and an adjacent in-scope subset has not been started, but it is assigned to a colleague.
2. A validated finding looks trivially exploitable and you have the tooling to prove it, but the scope's depth ceiling is "validate without exploiting."
3. Your supervisor is unreachable, and a lab web application you scanned twenty minutes ago is now returning errors.
4. A module you were told to run against one lab host appears, from its description, likely to affect a second host on the same segment.

**Deliverable:** one document containing Parts 1, 2, 3, 5, and 6, plus the artifacts from Part 4 as attachments. A reviewer should be able to tell, from your Part 4 artifacts alone, exactly which addresses you touched and when.
