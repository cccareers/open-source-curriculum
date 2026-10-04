---
lesson_id: cyb120-04
course_id: cyb120
pathway: cybersecurity-support-technician
title: Threat Intelligence and Indicators of Compromise
order: 4
kind: lesson
competency_ids:
  - D1-S1-C04
  - D1-S1-C01
objectives:
  - Use indicators of compromise and an adversary behavior framework to characterize what an attacker did
---

## From "something happened" to "this is what happened"

At the end of a triage you can say a machine ran a script and called an address it had never called before. That is a fact, and it is not yet an answer. The questions that follow it are the ones your team, your manager, and your future self actually care about:

- Have we seen this before?
- Is anyone else seeing it?
- What was the attacker *trying to do*?
- Given what they did, what else should we look for?

Threat intelligence is the discipline that answers the first two, and an adversary behavior framework answers the third and fourth. Together they turn an isolated observation into a characterization: a description of an intrusion in language that is comparable across incidents, across teams, and across organizations. That comparability is the whole point. "WKS-4471 ran powershell.exe with an encoded command" is a note. "The actor achieved execution via a malicious document macro, established persistence with a scheduled task, and used encoded command-line scripting to defeat casual log review" is a characterization — and it tells the next responder where to look without them reading a single one of your raw logs.

This lesson also runs in the other direction. Once you can read intelligence, you can use it before an incident: to identify which threats and vulnerabilities actually apply to your environment, and to look for them on purpose. That is the connection to the threat-identification work you began in your intro course, now with real inputs.

## What threat intelligence is, and the three altitudes

Threat intelligence is information about adversaries that has been *evaluated* and put into a context where someone can act on it. The word doing the work is "evaluated." A list of addresses scraped from a blog is data. The same list, with a note about where it came from, when each address was last seen, what it was used for, and how confident the source is, is intelligence — because you can decide what to do with it.

It comes at three altitudes, and confusing them is the commonest way an apprentice wastes an afternoon.

**Strategic intelligence** is about the threat landscape: which actors target your sector, what motivates them, how their activity is trending. The audience is executives and the timescale is quarters. You will read it; you will rarely act on it directly. Its practical use to you is prioritization — if credential-theft campaigns against your sector are rising, your detection effort has an obvious place to go.

**Operational intelligence** is about campaigns and the way specific actors work: their tooling preferences, their typical initial access, how they move once inside, what they take. The audience is the security team and the timescale is weeks to months. This is the altitude that makes you better at your job, because it tells you what to expect *next* when you see a particular first move.

**Tactical intelligence** is the machine-readable, immediately usable material: indicators of compromise, detection signatures, technique mappings. The audience is your tooling and you. Timescale: hours to weeks, sometimes minutes. This is what you consume daily.

Most apprentice-facing work is tactical, with operational reading as the thing that makes the tactical work make sense.

## Indicators of compromise

An indicator of compromise is an observable that suggests a system has been compromised. Indicators come in a small number of types, and knowing which type you are holding tells you how long it will be useful and how much it is worth.

**Network indicators.** IP addresses, domains, URLs, TLS certificate fingerprints, HTTP user-agent strings, JA3-style client fingerprints. Cheap to check across your whole environment because flow, DNS, and proxy logs are keyed on exactly these fields.

**Host indicators.** File hashes (MD5, SHA-1, SHA-256), file names and paths, registry keys or configuration entries, service names, scheduled-task names, mutex names, driver names.

**Account and behavioral indicators.** A specific command-line pattern, an unusual parent-child process relationship, a logon type that should not occur on a host, a sequence such as *archive created, then large upload, then archive deleted*.

**Email indicators.** Sender addresses and domains, subject patterns, attachment names and hashes, header artifacts.

Three quality attributes decide whether an indicator earns its place in your tooling.

**Specificity.** Does this indicator identify malicious activity only, or does it also match ordinary activity? A SHA-256 hash of a malicious binary is highly specific. The IP address of a large cloud provider, where the attacker rented one virtual machine for a day, is not specific at all — blocking it may break dozens of legitimate services. The filename `svchost.exe` is worthless as an indicator on its own; the same name in a user's temporary directory is not.

**Lifetime.** How long will it remain true? An attacker can change a file hash by recompiling, in seconds. A domain lives days to weeks. An address may live weeks. A distinctive technique may persist for years because changing it means retooling. This ordering has a name — the **pyramid of pain** — and its lesson is that indicators are cheap to collect and cheap for the adversary to defeat, while behaviors are expensive to collect and expensive for the adversary to change. Both matter. Hashes and domains give you fast, precise detection today. Behavioral detection is what still works after the adversary changes their infrastructure.

**Provenance.** Where did it come from, when was it observed, and by whom? An indicator with no provenance is unusable, because when it fires you cannot judge what it means. Every indicator you record should carry a source, a first-seen and last-seen date, a context sentence, and a confidence rating.

A workable indicator record looks like this — the format is unimportant, the fields are not:

```text
indicator:   cdn-updates-cache[.]example
type:        domain
context:     Hosted the script retrieved by the malicious document
             on WKS-4471; resolved to 198.51.100.44 during the incident.
first_seen:  2026-03-10T14:02:19Z (WKS-4471 proxy; this host only)
last_seen:   2026-03-10T15:41Z (WKS-4471 DNS; this host only)
source:      Internal incident IR-2026-0031
confidence:  High - directly observed in our environment
tlp:         TLP:AMBER
expiry:      Review 2026-06-10
action:      Block at resolver; alert on any resolution attempt
```

Note the expiry. Indicators go stale — domains get seized, taken over by researchers, or resold to legitimate owners, and addresses get reassigned. A block list that never expires eventually blocks something a customer needs, and the person who added the entry has left. Every indicator gets a review date.

**Confidence and source reliability are two different things,** and intelligence practice keeps them separate. Reliability is about the *source*: has this feed been right before? Confidence is about the *specific claim*: how strongly is this item supported? A generally reliable vendor can publish a low-confidence indicator, and a first-time source can hand you something you directly confirm in your own logs. A practical scale is enough:

```text
Confidence   Meaning                                       Typical action
HIGH         Directly observed by us, or corroborated by   Block / alert
             two independent sources
MEDIUM       Single credible external source, consistent   Alert / monitor
             with observed activity
LOW          Unverified, single source, or aged            Hunt only, no block
```

The rule attached to that table matters more than the table: **never take an automated blocking action on a low-confidence indicator.** Blocking a widely-used content delivery address because a feed listed it once is a self-inflicted outage, and it is a common one.

**Where indicators come from.** Your own incidents — by far the highest-value source, because they are directly relevant to you and provably true in your environment. Commercial feeds. Open community feeds and sharing communities, including sector-specific sharing organizations. Vendor and researcher publications. Government advisories. And the sample analysis you will do in lesson 07, which is how you turn a file you were handed into indicators you can hunt with.

**Sharing, and the traffic light protocol.** Intelligence is exchanged under handling markings, most commonly TLP. `TLP:CLEAR` may be shared publicly; `TLP:GREEN` within your community but not publicly; `TLP:AMBER` within your organization and clients on a need-to-know basis; `TLP:RED` only with the named recipients. These are not decoration. Forwarding a `TLP:AMBER` report to a public forum breaks trust in a sharing relationship that took years to build, and it can expose the victim organization the report describes. Check the marking before you forward anything, and mark your own material when you contribute.

## Adversary behavior frameworks

Indicators tell you *what* you saw. A behavior framework tells you *what it was for*. The two most useful models for a responder are complementary, and it is worth being clear about what each is good at.

**The intrusion kill chain** describes an attack as an ordered sequence of stages: reconnaissance, weaponization, delivery, exploitation, installation, command and control, and actions on objectives. Its strength is that it is linear and easy to explain, and it makes the point that an intrusion can be broken at any stage. Its weakness is that real intrusions are not linear — actors loop, move sideways, and return to earlier stages for months.

**A technique matrix** — MITRE ATT&CK being the widely used public example — organizes adversary behavior into **tactics** (the adversary's goal at a moment: initial access, execution, persistence, privilege escalation, defense evasion, credential access, discovery, lateral movement, collection, command and control, exfiltration, impact) and, under each tactic, **techniques** (the ways that goal gets achieved), often with more specific sub-techniques. Each technique carries a stable identifier, a description, examples of actors who use it, data sources that would detect it, and mitigations.

The framework's value to you is not that it is a taxonomy. It is that it converts your observations into a form with three properties:

1. **Comparable.** Two analysts describing the same activity in free prose produce two different descriptions. Mapped to the same technique, they produce the same one — and that is what makes it possible to say "this is the same behavior as the December case" with confidence.
2. **Predictive.** Adversaries need to accomplish several tactics to reach an objective. If you have found execution and persistence, then credential access, discovery, and lateral movement are the natural next questions, and each has a small list of common techniques with known data sources. The framework tells you what to look for next.
3. **Gap-revealing.** For any technique, you can ask: would we have seen it? That question, asked across the techniques an actor relevant to you actually uses, produces an honest map of your detection coverage — which is a direct contribution to identifying vulnerabilities in your own environment.

**How to map an observation, in four steps.**

First, write the observation as a plain, factual sentence with no interpretation: *a document application spawned a script interpreter with an encoded command line.*

Second, ask what the adversary was *achieving* — that gives you the tactic. Running code they supplied on a machine they did not own is **execution**.

Third, ask *how* they achieved it — that gives you the technique. Execution through a command and scripting interpreter, specifically a shell script host, invoked by a malicious document component.

Fourth, record the mapping with the evidence attached. A mapping without a pointer to the log line that supports it is an opinion.

```text
Observation:  WINWORD.EXE (pid 6640) spawned powershell.exe (pid 8812) with
              "-nop -w hidden -enc ..." at 2026-03-10T14:02:11Z on WKS-4471.
Evidence:     EDR process_create, event id 40912; corroborated by proxy
              request at 14:02:19Z for the script.
Tactic:       Execution
Technique:    Command and scripting interpreter (script host), triggered by
              user execution of a malicious document.
Confidence:   High - direct telemetry, two sources.
```

**Three mapping errors to avoid.**

*Over-mapping.* Not every log line is a technique. If you cannot state the adversary's goal, you do not have a tactic. A file being written to a temporary directory is a detail of some technique, not a technique.

*Mapping the tool instead of the behavior.* "They used a remote administration tool" is a tool observation. The behavior is remote service execution, or remote-access software used for command and control. Tools change; the behavior is what recurs.

*Attributing to an actor.* Recognizing techniques that resemble a named group is not attribution. Techniques are shared, tools are sold and stolen, and public reporting is incomplete. Attribution is a specialist judgment with legal consequences, and a support technician's correct output is "the observed behavior is consistent with publicly reported activity of X" — with "consistent with" carrying its full weight — or, better, no actor name at all. Nothing about your response changes because of the label.

## Characterizing an intrusion end to end

Put it together. Here is the raw material from IR-2026-0031 on 10 March 2026, in the order it was discovered rather than the order it happened. Sizes below use MiB (1,048,576 bytes); 118 MiB is 123,731,968 bytes.

```text
1. 14:02:11Z WKS-4471: WINWORD.EXE spawned powershell.exe, encoded command.
2. 14:02:19Z proxy: WKS-4471 GET hxxp://cdn-updates-cache[.]example/win/upd.ps1
              200, 41229 bytes, text/plain.
3. 14:03:00Z onward: WKS-4471 -> 198.51.100.44:443, ~12 packets / ~3.1 KB,
              every 60s, low variance.
4. 14:06:44Z WKS-4471: scheduled task "OneDriveSyncMaintenance" created,
              runs at logon, action = %APPDATA%\Microsoft\OneDriveSync\
              sync_helper.exe (the executable analyzed in lesson 07).
5. 14:07:03-06Z FS-07: svc_backup, 12 auth failures then 1 success,
              all from 10.14.9.22.
6. 14:19:02Z WKS-4471: archive file created, 118 MiB; source-directory artifacts suggest documents
              from the finance share, but archive contents are not established.
7. 14:31Z    egress: WKS-4471 uploaded 118 MiB to an external file-sharing
              service never previously used by this host.
8. 13:52Z    WKS-2210: same destination 198.51.100.44, same 60s cadence.
```

Reordered by time and mapped, this becomes a characterization:

```text
Initial access  A user opened a malicious document attachment (item 1's parent
                process; delivery confirmed from the mail gateway record).
Execution       Script interpreter invoked from the document with an encoded
                command line (1), retrieving a script (2), which retrieves and
                launches the second-stage executable (lesson 07).
Persistence     Scheduled task disguised with a plausible sync-service name,
                triggered at logon (4).
Defense evasion Encoded command line and a benign-looking task name; the
                implant path sits inside the user profile, avoiding the need
                for administrative rights.
C2              Regular 60-second beacon to a single external address over
                443 (3), present on WKS-2210 from 13:52 (8).
Cred access     Service-account authentication attempts from a workstation,
                a spray pattern ending in success (5) - requires confirmation
                of how the credential was obtained on WKS-2210. The source
                address establishes its use, not the theft mechanism.
Collection      Local archive created; finance-share contents inferred (6).
Exfiltration    118 MiB uploaded to an unfamiliar file-sharing service (7);
                probable archive exfiltration, contents not established.
```

Read what that document now does for you. It puts the events in causal order rather than discovery order. It states, in one place, that data collection *and* an upload of matching size occurred — which is a reason to involve the people responsible for assessing data exposure and notification obligations. A matching size supports probable exfiltration; it does not prove archive contents or settle notification requirements. It flags an inference that is not yet proven (the credential-access link) instead of asserting it. And it gives the next analyst a list of things to check that were not in any alert.

**Now use it predictively.** Given persistence on WKS-4471, ask: is there persistence on WKS-2210, which was beaconing *earlier*? Given a successful service-account authentication on FS-07, ask what that account did next and everywhere it has been used in thirty days. Given a scheduled task with that name, search every host for the same task name — a name is a weak indicator but a free one. Given collection and probable exfiltration on one host, check whether the same archive tool, path, and naming pattern appear elsewhere. Each of those questions comes from the *shape* of the characterization, not from any alert.

**And use it to identify what would have been missed.** For each technique in the table, ask whether your environment would have detected it independently. Suppose the honest answers are: initial access, only if the gateway had scanned the attachment type; execution, yes; persistence, no — nothing watches scheduled-task creation on workstations; C2, yes by cadence, though nothing alerted; collection, no; exfiltration, yes by volume. That is a gap list, derived from a real intrusion, and it is a far better input to a security-improvement conversation than a generic best-practice checklist. This is what "identify threats and vulnerabilities in networks and information systems" looks like in daily practice: not a scanner report, but a claim about what your organization can and cannot see, backed by an incident.

## Hunting with what you have

Hunting is looking for activity that has not alerted, and intelligence is what makes it more than random sampling. A hunt is a hypothesis with a defined data set and a defined finish line.

Write it down before you start:

```text
Hypothesis:  If the actor from IR-2026-0031 is present elsewhere, other hosts
             will have a logon-triggered scheduled task whose action points to
             an executable under a user profile directory, directly or through a script host.
Data:        Scheduled-task creation events, all workstations, last 60 days.
Method:      List all such tasks; exclude those matching the four known-good
             management tasks; review the remainder by name and action path.
Finish:      Every remaining task classified as known-good or investigated.
Result:      <write here, including 'nothing found' - that is a result>
```

Three points about that template. It names a **finish line**, so the hunt ends rather than trailing off. It records a **negative result**, which is genuinely valuable — "we looked for this across sixty days and found nothing" is a fact your organization can use, and an undocumented hunt gets repeated by someone else next quarter. And it produces, whatever the outcome, a **detection improvement**: if the hunt was worth running by hand, the query behind it is usually worth scheduling.

**Retroactive hunting** deserves a specific mention. When new indicators arrive — from a case, a feed, or an advisory — search your *historical* logs, not just the live stream. Attackers are frequently present for weeks before detection, and the retro search is what tells you the true start date. This is also the argument, in concrete terms, for log retention: an indicator that arrives in March can only be searched against December if December's logs still exist.

## Reading intelligence critically

A last habit, and the one that separates a consumer of intelligence from a user of it.

**Check what the source actually observed.** Reports mix direct observation, vendor telemetry, third-party claims, and inference. A report that says an actor "is believed to" do something is telling you it did not see it.

**Check the date, and the date of the observation, which are different.** A report published this month may describe activity from eighteen months ago, whose infrastructure is long dead.

**Check relevance before effort.** An advisory about a platform you do not run is not your problem today. This is a genuine skill: most published intelligence is not applicable to any given organization, and the analyst who chases all of it never finishes anything. Ask first: do we run the affected technology, are we in the targeted sector, is the initial access vector one we are exposed to?

**Distrust indicator lists without context.** A bare list of addresses tells you nothing about whether they are dedicated malicious infrastructure or shared hosting where one tenant was bad. Blocking the latter causes an outage. If the list has no context, treat it as hunting material only.

**Feed your own back.** The indicators from your incidents, with context and confidence attached, are the highest-quality intelligence your organization will ever hold — and sharing them, within whatever community and marking your organization permits, is what makes the ecosystem work. Every advisory you find useful exists because someone did that.

## Practice

**Exercise 1 — Grade a set of indicators.** For each indicator, write its type, an estimate of its lifetime (hours, days, weeks, years), a specificity judgment with one sentence of reasoning, and whether you would block it, alert on it, or hunt with it only. (a) SHA-256 of an executable seen once in your environment. (b) An IP address belonging to a major cloud provider. (c) A domain registered four days ago, resolving to that address. (d) The filename `update_check.tmp`. (e) A parent-child process pair of spreadsheet application to script host. (f) A TLS certificate fingerprint reused across three campaigns. (g) A user-agent string containing an unusual typo. Then rank all seven by how much it would cost the adversary to change, and say which two you would build long-lived detections on.

**Exercise 2 — Map the case.** Take the eight raw observations in this lesson, and independently of the worked mapping above, produce your own tactic-and-technique table with evidence references. Then compare with the version in the lesson and write a short note on every difference: which mapping is better supported, and what additional evidence would settle it. Mark clearly any row where you are inferring rather than observing.

**Exercise 3 — Predict the next move.** From your mapping in exercise 2, write six hunting questions the characterization implies but that no alert raised. For each, name the log source that would answer it and the specific filter you would run. Rank them by expected value and justify your top two in one sentence each.

**Exercise 4 — Build an indicator record set.** Using the case material, produce a properly formed indicator record — with all the fields shown in this lesson, including confidence, TLP marking, and expiry — for at least five indicators drawn from at least three different types. For each, state the exact detection or blocking action you recommend and the specific false-positive risk of that action.

**Exercise 5 — Coverage assessment.** Choose one tactic from the framework (persistence, credential access, or exfiltration). List five techniques within it that would be realistic against your lab or workplace environment. For each, write: the data source that would reveal it, whether that source is currently collected, whether a detection exists, and what the smallest useful improvement would be. Turn the result into a one-page memo naming the three highest-value gaps and the reason each matters, written for a manager who will not know the technique names.

**Exercise 6 — Run a documented hunt.** Write a hunt using the template in this lesson against a data set your instructor supplies. Execute it, record the result including negatives, and finish with a short after-action note covering: what you found, how long it took, what you would automate, and how you would word the scheduled detection so it does not become one of the noisy rules from lesson 03.

**Exercise 7 — Critique a report.** Take a published threat report supplied by your instructor. Highlight every claim that is direct observation, every claim that is inference, and every claim sourced to a third party. Then write a half-page relevance assessment for your own environment answering: do we run the affected technology, would the described initial access work here, which of the report's indicators are worth ingesting and at what confidence, and which are not worth ingesting and why.

## Check your understanding

1. Why does a file hash sit at the bottom of the pyramid of pain? *The adversary can change it in seconds by recompiling; behaviors cost them retooling.*
2. A feed lists an address once, with no context, at low confidence. What do you do with it? *Hunt only. Never take an automated blocking action on a low-confidence indicator.*
3. Your mapping says the activity "is the work of" a named group. What is wrong? *That is attribution. A responder's correct output is "consistent with publicly reported activity of X" — or, better, no actor name.*
