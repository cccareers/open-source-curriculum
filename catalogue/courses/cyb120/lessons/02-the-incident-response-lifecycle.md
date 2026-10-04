---
lesson_id: cyb120-02
course_id: cyb120
pathway: cybersecurity-support-technician
title: The Incident Response Lifecycle
order: 2
kind: lesson
competency_ids:
  - D3-S1-C01
  - D1-S1-C02
objectives:
  - Walk an incident through preparation, detection, containment, eradication, recovery, and lessons learned, naming the decision made at each handoff
---

## Why a lifecycle at all

The first time you sit in on a real incident, the thing that will strike you is how little of it looks like the technical work you trained for. People are asking questions out of order. Someone wants to reimage a laptop that has not been examined yet. Someone else wants to know whether to tell customers. The legal team wants to know if data left the building. And the actual analysis — the part you are good at — keeps getting interrupted.

The lifecycle exists to make that survivable. It is not a bureaucratic ritual and it is not a checklist you tick to satisfy an auditor. It is a shared vocabulary that lets six people who are all under pressure agree on one thing: *which part of the problem are we working on right now?* When someone says "we are still in detection and analysis, we are not containing yet," a whole class of premature action stops happening. That sentence is worth more than any tool in your kit.

The version used across this pathway has six phases:

1. **Preparation** — everything you do before anything happens.
2. **Detection and analysis** — noticing, and then deciding what you noticed.
3. **Containment** — stopping the bleeding without destroying the patient.
4. **Eradication** — removing the attacker's foothold.
5. **Recovery** — returning to normal operations, verified.
6. **Post-incident activity** — learning, and changing something.

You will see other numberings. Some frameworks fold containment, eradication, and recovery into a single phase; some split preparation into policy and readiness. The names differ, the shape does not. What matters is not memorizing a diagram — it is knowing, for each boundary between phases, **what decision gets made there, who makes it, and what evidence they need to make it**. That is the whole lesson.

![The six phases of the incident response lifecycle arranged as a loop, with the decision made at each phase boundary labelled](./img/ir-lifecycle-phases.png)

One structural note before we walk it. The lifecycle is drawn as a loop, not a line, and the loop is not decoration. Post-incident activity feeds preparation. And within a single case, you will frequently go *backwards*: you contain, then discover a second compromised host you missed, and you are back in detection and analysis with a containment already in place. A responder who believes the phases run strictly forward will suppress the inconvenient new evidence rather than reopen the earlier phase. Expect to loop. Say out loud when you are looping.

## Phase 1: Preparation

Preparation is everything you did before the phone rang, and it is the phase with the highest return on effort — which is exactly why it is the phase that gets skipped.

Preparation has two halves that are easy to confuse. **Preparing to respond** is building the capability: the plan, the roles, the contact list, the tooling, the training. **Preventing incidents** is reducing how often you need that capability: patching, hardening, segmentation, access control — the material of your earlier courses. Both belong in the phase. As a support technician, your contribution is usually concrete and unglamorous, and it usually falls in the first half.

**The incident response plan.** Every organization that responds seriously has one written down. A usable plan answers a small number of questions, and you should be able to find each answer in under a minute:

- What counts as an incident here, as opposed to an event?
- Who declares one, and how do they do it at 2am on a Sunday?
- What are the severity levels and what does each one trigger?
- Who is on the response team, what are their roles, and how are they reached?
- Who is authorized to disconnect a production system? To take a server offline? To reset a domain administrator's credentials?
- Who talks to executives, to customers, to law enforcement, to regulators, to insurers?
- Where does evidence go, and who is responsible for it?
- What are the notification obligations and their clocks?

Notice how few of those are technical. A plan is mostly an authority map. Its purpose is to have already answered the questions that are impossible to answer calmly while a domain controller is behaving strangely.

You will contribute to a plan long before you own one. Realistic apprentice contributions include: maintaining the asset and contact information the plan depends on; writing or correcting a playbook for an incident type you have actually handled; keeping the escalation list current; testing that the out-of-band communication channel works; and — most valuably — reporting the gap you hit during a real response so the plan gets fixed. That last one is a genuine skill. "The plan says to contact the system owner, and there is no system owner listed for the finance file server" is a first-class contribution to an incident response plan.

**Playbooks.** The plan is organizational; a playbook is procedural, one per incident type. Phishing with a credential-harvesting link. Ransomware detected on a workstation. Confirmed malware beaconing outbound. Lost or stolen laptop. Suspected insider data exfiltration. A good playbook is short, ordered, and tells you what to *capture* before you act. A ransomware playbook that begins "isolate the host from the network" and never says "photograph the ransom note and record the exact time it appeared" is going to cost the investigation an hour of guessing.

**Readiness that has nothing to do with tools.** Do the responders have accounts that still work when the directory service is the thing under attack? Is there a communication channel that does not depend on the possibly-compromised corporate email? Are backups tested — not "taken," *tested* by a restore? Is there a clean, isolated lab machine for examining suspicious files? Is there somewhere physically secure to store evidence? Does anyone know the phone number of the cyber insurance carrier? Each of these has ruined a real response by being absent.

**Preparation as risk mitigation.** The link between preparation and the risk work from your earlier courses is direct: every control you help maintain changes what an incident *costs*. Network segmentation does not stop an intrusion, but it decides whether the intrusion reaches one subnet or forty. Multi-factor authentication does not prevent phishing, but it decides whether a harvested password is an incident or an event. Centralized logging with adequate retention decides whether you can answer "when did this start?" or have to write "unknown." When you are asked to contribute to risk mitigation, this is the framing that makes your input useful: name the control, and name the incident cost it changes.

**The handoff out of preparation** is not a decision — it is an event. Something happens. What matters is that when it happens, the plan already exists.

## Phase 2: Detection and analysis

This phase begins with a signal and ends with a *declaration*. Everything in between is analysis, and it is the intellectual core of the job.

The signal can come from anywhere. Your monitoring stack fires an alert. A user calls the help desk because their machine is slow and the fan will not stop. An external party — a bank, a partner, a threat intelligence provider, a researcher, occasionally law enforcement — tells you they see traffic from your address space that you should look at. A backup job fails oddly. Someone finds a file they cannot open with an extension they do not recognize.

Two distinctions do most of the work here.

**Event versus incident.** An event is any observable occurrence. A failed login is an event. Ten thousand failed logins is still, technically, a set of events. An incident is an event or set of events that actually or imminently jeopardizes the confidentiality, integrity, or availability of information or systems — or violates policy. The transition from event to incident is a *human judgment* and it is the single most consequential judgment in this phase. Declare too readily and you exhaust your team on noise until nobody believes the next declaration. Declare too slowly and the attacker gets more time, which is the only resource they cannot buy.

**Precursor versus indicator.** A precursor suggests an incident *may* occur: a vulnerability disclosure for software you run, reconnaissance scanning against your perimeter, a threat actor announcing intent to target your sector. An indicator suggests an incident *has* occurred or is occurring: antivirus quarantining a file, a host beaconing to a known-bad address on a schedule, a user reporting an unexpected password reset email, an unexplained new administrative account. Precursors are rarely actionable in the moment but they are enormously useful for prioritization; indicators are what you triage.

The analysis inside this phase is a loop: validate the signal, scope it, and characterize it.

**Validate.** Is this real? Alerts misfire, tools misconfigure, and a surprising fraction of "incidents" are a scheduled task somebody forgot to document. Validation means going to a second, independent source. If the endpoint tool says a process made an outbound connection, does the network log agree that the connection happened? If the two sources disagree, you do not yet have a fact; you have a question.

**Scope.** How far does it go? This is where responses most often fail, and they fail in the same direction every time: the team fixes the one machine they were told about, and two weeks later the attacker returns from the second machine nobody looked at. Scoping questions: what else did this account touch? What else connected to that address? What other hosts have that file hash, that filename, that scheduled task, that registry value? Do not contain until you have made a genuine attempt at scope — and then contain anyway, on schedule, with your best current scope, because scope is never truly finished.

**Characterize.** What kind of incident is this, and how bad? Type drives the playbook. Severity drives everything else: who is woken up, how fast you must act, how much business disruption is acceptable, whether legal and communications are engaged now or later.

Severity models vary; a workable one has three or four levels defined in terms of concrete facts, not adjectives:

```text
SEV1  Confirmed compromise affecting production systems or regulated data;
      or active, spreading destructive activity (e.g. ransomware encrypting
      shares). Immediate 24/7 response. Executive and legal notified at once.

SEV2  Confirmed compromise of a single host or account with no evidence of
      spread or data access; or a control failure exposing sensitive data.
      Immediate response during any hours. Management notified within 1 hour.

SEV3  Suspicious activity requiring investigation, contained by existing
      controls; or policy violation with no data impact. Business-hours
      response. Documented, reviewed at the daily stand-up.
```

Two rules that hold everywhere. **Start high and downgrade.** Standing people down is easy; summoning them late is expensive. **Severity is about impact, not technical interest.** An elegant attack against an isolated lab host is SEV3. A misconfigured share exposing payroll data to every employee is not technically interesting at all and it is SEV1.

**The handoff decision at the end of this phase is: is this an incident, and at what severity?** It is made by whoever the plan says makes it — a SOC lead, an on-call analyst, an incident commander. It requires: at least two corroborating sources for the core observation, a first-pass scope, an incident type, and a stated impact. It is written down, with a timestamp, because that timestamp starts every clock that follows, including regulatory ones. Everything that happens next is authorized by that declaration.

## Phase 3: Containment

Containment is the phase where you first do something the attacker can see, and that is why it is the phase most in need of a decision made deliberately rather than reflexively.

The goal is narrow: **stop the incident getting worse.** Not fix it, not remove the attacker, not restore service. Stop the growth. Containment is almost always a trade against three other things, and naming the trade is the skill:

**Speed against evidence.** Pulling the power cord on a compromised host contains it instantly and destroys everything in memory — the running malicious processes, network connections, decryption keys, injected code that exists nowhere on disk. Once it is gone, it is gone.

**Containment against detection.** Blocking the attacker's command-and-control address tells them, immediately, that they have been found. A sophisticated adversary who learns they are detected may accelerate: exfiltrate what they have, deploy destructive payloads, or burn their access to make attribution harder. Sometimes the right decision is to monitor a contained-but-live channel while you complete scope.

**Containment against the business.** Disconnecting the segment that runs the warehouse stops the incident and stops the warehouse. That may be exactly right. It is not your call alone, and the plan should say whose call it is.

Containment usually comes in two stages. **Short-term containment** is fast and often crude: isolate the host from the network, disable the account, block the domain at the resolver, shut down the affected service, remove a system from the load balancer. **Long-term containment** is what holds while you work: a temporary firewall rule, a rebuilt-and-clean host standing in for the quarantined one, tightened monitoring on the affected segment, an enforced password reset for a population of accounts.

You already know the mechanics of endpoint isolation from your endpoint security course, so this course does not reteach the button. What it teaches is the sentence you say before you press it:

```text
Proposed containment, 10:14 UTC, 2026-03-11 (IR-2026-0031).
Action:    Network-isolate WKS-4471 and WKS-2210 via the endpoint agent. Leave both powered on.
Rationale: Both hosts are beaconing outbound every 60s to 198.51.100.44. Isolation
           stops the channel while preserving memory and running processes.
Cost:      Two users lose access to their workstations. No production service affected.
Evidence:  Memory capture will be taken before any reboot or reimage.
Risk:      Attacker will observe loss of the channel and may have other footholds;
           scope on the two hosts that contacted the same address is not complete.
Decision:  Approved by S. Vance, 10:16 UTC; executed 10:18 UTC; confirmed 10:19 UTC.
```

That is a contained decision. It names the action, the reason, the cost, the evidence protection, and the residual risk, and it records who approved it. It takes ninety seconds to write and it is the difference between a decision and a reflex. Note the deliberate choice to leave the host powered on: unless the machine is actively destroying data, isolating while running preserves far more evidence than powering off. The detailed reasoning about what containment to choose in what situation is lesson 08's subject; here the point is only that the choice exists and is recorded.

**The handoff decision at the end of containment is: has the incident stopped growing, and is the evidence we need preserved?** If the answer to either is no, you are not out of containment, no matter how much pressure exists to move on. The most common failure at this boundary is declaring containment because an action was *taken*, rather than because growth was *verified to have stopped*. Verification means going back to the monitoring: the beacon has not recurred, the account has not authenticated, no new hosts show the indicator.

## Phase 4: Eradication

Eradication removes the attacker's presence and closes the way they got in. Those are two separate jobs and skipping the second is how organizations get compromised twice by the same actor in a month.

Removal covers the artifacts: malicious files, malicious services and scheduled tasks, attacker-created accounts, modified system configuration, unauthorized software, injected code. Closing the door covers the initial access vector and every persistence mechanism: the unpatched service, the exposed remote-access port, the reused credential, the phishing-susceptible process, the excessive permission that allowed lateral movement.

Two hard-won rules.

**Eradication requires scope to be complete, and scope is completed in phase 2.** If you clean a machine before you know how many machines are involved, you have taught the attacker which indicators you detect while leaving them a foothold to return through. Where scope is genuinely uncertain and the compromise is deep, the industry-standard answer is rebuild rather than clean: reimage from known-good media and restore data from a backup taken before the compromise. Deciding *when* rebuilding is warranted is lesson 08's material; the phase-level point is that eradication is gated on scope.

**Eradication is where evidence dies.** Reimaging a host destroys the disk contents. If forensic acquisition has not happened, it will not happen. The rule is simple and absolute: *acquire before you eradicate.* If the business cannot wait for acquisition, that is a decision someone with authority makes explicitly and it is written down, along with what will consequently be unknowable.

**The handoff decision at the end of eradication is: is the attacker's access removed, and is the entry vector closed?** Both halves. "The malware is gone" is not eradication if the vulnerable service is still reachable from the internet.

## Phase 5: Recovery

Recovery restores normal operations and then proves they are normal. It is the phase most likely to be declared complete by someone who is tired.

The work has four parts, in order. **Restore** systems from clean sources — verified backups, rebuilt images, reinstalled applications. **Validate** that the restored systems function and are actually clean: the service works, the indicators are absent, the patched vulnerability is confirmed patched, configuration matches the hardened baseline. **Return** to production, usually in stages rather than all at once, so a problem shows up on one system rather than forty. **Monitor** with deliberately heightened sensitivity for a defined period.

That last part is the one that gets dropped, and it is the one that catches the return. Heightened monitoring means something specific: the indicators from this incident are loaded as detection rules, the affected accounts and hosts are on a watch list, and someone has the job of looking. Set the period explicitly — two weeks, thirty days, whatever the case warrants — and put an end date on it so it actually gets reviewed rather than quietly ignored.

Recovery also needs *criteria written in advance*, because otherwise the criterion becomes "the business is tired of waiting." Reasonable criteria: no indicator observed for a defined window; monitoring restored to full coverage on the affected systems; the vulnerability confirmed remediated; affected credentials rotated; the system owner has tested and accepted the restored service.

**The handoff decision at the end of recovery is: are we confident enough to return to normal operations and stand the response down?** It belongs to a named person, it should be a stated decision rather than a gradual fade, and it is announced so that everyone knows the response is over. Incidents that trail off without a closing statement leave people uncertain for days whether they are still on call.

## Phase 6: Post-incident activity

The last phase is where the organization gets stronger, and it is worth being honest that it is the phase most often skipped because the pressure that created the incident has now gone away.

A post-incident review is a structured meeting, held while memory is fresh — within two weeks is a good target — attended by the people who did the work and not only their managers. It answers a fixed set of questions:

- What exactly happened, and when? (This is the timeline, and it comes straight from documentation written during the incident.)
- How well did we do against our own plan and playbooks?
- What information was needed sooner than it was available?
- What would have detected this earlier?
- What would have prevented it?
- What did we do that we should not have, and what did we not do that we should have?
- What specific changes will we make, who owns each, and by when?

The last question is the only one that produces value. A review that generates insight and no owned, dated action items is a therapy session. The output is a small number of concrete items — a detection rule to write, a log source to onboard, a playbook step to add, a permission to revoke, a backup to start testing.

**Blamelessness is a technique, not a courtesy.** The purpose of a review is to surface what actually happened, and the only reliable way to get that is to make it safe to say "I clicked the link" or "I skipped the capture because I was rushing." The moment a review becomes a search for the responsible individual, people begin managing their exposure instead of contributing facts, and you lose exactly the details that would have prevented the next one. Describe systems and decisions, not people: "the alert was not reviewed for four hours because the queue had 300 open items" is useful; "the analyst ignored the alert" is not.

**This is the loop closing.** Every action item from a post-incident review is a contribution to preparation. That is the sense in which the lifecycle is a circle rather than a list, and it is the mechanism by which an organization actually improves rather than merely surviving repeatedly.

## Walking a case through the phases

An abstract lifecycle is hard to hold. Here is one small case, phase by phase, with the decision at each handoff called out.

This simplified walkthrough is a separate incident from IR-2026-0031; its times are local office time on an unspecified Tuesday.

**The signal.** At 09:14 on a Tuesday, the help desk logs a ticket: a finance clerk reports that a spreadsheet she opened from an email "did nothing," and that her machine has been slow since.

**Detection and analysis.** The analyst pulls the endpoint telemetry for that workstation. At 09:02 a document opened, and four seconds later a script interpreter launched as a child process of the document application — an unusual parent-child relationship. At 09:03 that interpreter made an outbound HTTPS connection to a hosting provider address never before seen in the environment, and has repeated the connection roughly every sixty seconds since. Validation: the network egress logs independently confirm the connections and their regularity. Scoping: a search across the environment for the same destination address returns one other workstation, in a different department, showing the same pattern beginning at 08:51.

*Handoff decision:* two hosts show confirmed unauthorized code execution with an active outbound channel. This is an incident. Severity 2 — confirmed compromise, no evidence yet of data access or spread to servers. Declared at 09:41, entered in the case record.

**Containment.** Options considered and recorded: isolate both hosts at the endpoint agent; block the destination at the egress proxy; do both; do nothing yet and watch. Blocking at the proxy alone would alert the attacker while leaving both hosts free to move laterally inside the network. Isolating both hosts stops lateral movement and the channel; it costs two users their workstations for the day. Both are isolated at 09:58, left powered on so that memory is preserved. The destination is not yet blocked at the proxy, so that any *third* host still attempting the connection becomes visible.

*Handoff decision:* by 10:30, no further beacons from the two hosts, no new hosts observed contacting the address, and memory captures from both are complete. Growth has stopped and evidence is preserved. Containment holds.

**Eradication.** Analysis of the captures identifies a scheduled task providing persistence and the delivery email in both mailboxes. Scope is re-run against those new indicators: still two hosts. The mail is purged from all mailboxes; both workstations are rebuilt from clean images after acquisition is verified complete; the mail gateway rule that allowed the attachment type is corrected; the affected users' credentials are reset.

*Handoff decision:* the persistence is removed on both hosts, the delivery vector is closed at the gateway, and no other host shows the indicators. Eradication complete at 16:20.

**Recovery.** Both workstations are returned to their users with data restored from Friday's backup, which predates the compromise. The users confirm their applications work. All indicators from the case are loaded as detection rules. Heightened monitoring is set for thirty days with a named owner and a review date.

*Handoff decision:* recovery criteria met — clean rebuilds, restored and accepted by users, indicators monitored, entry vector closed. The response is stood down at 17:45 with an explicit closing message.

**Post-incident.** Held the following Monday. Findings: the alert on anomalous child processes existed but was routed to a queue nobody was reviewing daily; the second host had been beaconing for twenty-three minutes before the *user-reported* ticket surfaced it, which means the report beat the tooling. Action items: route that alert class to the primary queue (owner: SOC lead, two weeks); add the parent-child pattern to the phishing playbook (owner: the responding analyst, one week); measure the daily queue backlog weekly (owner: SOC lead, ongoing).

Read that case again and notice how little of it is tool operation. What carried it was: a declaration with a timestamp, a scope attempt before containment, a containment decision with its cost written down, acquisition before rebuild, criteria before recovery, and three owned action items at the end. That is the lifecycle doing its job.

## Practice

**Exercise 1 — Locate the phase.** For each of the following, name the lifecycle phase it belongs to and, in one sentence, what would go wrong if it were done in the phase before or after.

1. Resetting the password of a user whose credential appears in a public breach dump.
2. Capturing the memory of a workstation that is beaconing outbound.
3. Adding a new detection rule for a technique observed six weeks ago.
4. Testing whether the restore procedure for the finance file server actually works.
5. Removing a scheduled task the attacker created for persistence.
6. Telling the affected department that they can use their machines again.
7. Searching every host for a file hash you have just recovered from one host.
8. Writing down the phone number of the cyber insurance carrier.

**Exercise 2 — Write the declaration.** Using the finance-clerk case above, write the incident declaration exactly as you would enter it in a case record. It must contain: timestamp in UTC, incident type, proposed severity with a one-sentence justification tied to impact, the two corroborating observations, current known scope, and the name of the person declaring. Keep it under 150 words. Then write a second version of the same declaration at the moment *before* the second host was found, and note in one sentence what changed about the severity and why.

**Exercise 3 — Name the trade.** For each containment option below, write the three-part trade: what it stops, what it costs the business, and what evidence it risks destroying. Then choose one and write the full containment decision block in the format shown in this lesson.

1. A file server is encrypting files rapidly across a shared drive. Options: power it off at the wall; isolate it at the switch port; stop the file-sharing service; do nothing while you capture memory.
2. A developer's laptop is beaconing to an unfamiliar address once an hour. Options: isolate the laptop; block the address at the perimeter for everyone; leave it and monitor for another two hours to complete scope.
3. A service account is authenticating to systems it has never touched before. Options: disable the account; reset its credential; leave it enabled and alert on every use.

**Exercise 4 — Audit a plan against reality.** Take the incident response plan from your workplace or lab environment (or a published sample plan your instructor supplies) and answer the eight preparation questions listed in this lesson from it, writing down the section and page for each answer. For every question you cannot answer within sixty seconds, write a one-paragraph gap note in this form: what the plan says now, what the responder would actually do at 2am, what specifically should be added, and which phase of a real incident the gap would hurt. Bring the three most serious gaps to the group.

**Exercise 5 — Build a phase-boundary checklist.** Produce a single-page checklist for your own use with four sections — declaring an incident, entering containment, entering eradication, and standing down. Each section lists the *evidence* required before that boundary can be crossed and the *named role* who crosses it. Test it by walking the finance-clerk case through it line by line, and mark any item you could not have satisfied from the case narrative. Those marks are the items you will find missing in real cases too.

**Exercise 6 — Run the loop.** With two or three classmates, take any incident from the last year that has been publicly written up, and reconstruct it as a phase walk-through with the five handoff decisions named. Where the public account does not say, write "unknown" rather than guessing — then note, for each unknown, what documentation during the incident would have made it knowable. Finish by writing three post-incident action items in the form *change / owner / date*, and argue for which single one you would do first if you could only do one.

## Check your understanding

1. What decision is made at the end of detection and analysis, and what must exist before it is made? *Whether this is an incident and at what severity; it needs at least two corroborating sources, a first-pass scope, an incident type, and a stated impact — written down with a UTC timestamp.*
2. Containment was "done" because the host was isolated. Why might the phase still not be over? *Containment ends when growth is verified to have stopped and evidence is preserved, not when an action was taken; check the monitoring for recurring beacons, logins, or new hosts.*
3. Why is a severity rule like "start high and downgrade" safer than the reverse? *Standing people down is cheap; summoning them late costs the time the attacker needs.*
