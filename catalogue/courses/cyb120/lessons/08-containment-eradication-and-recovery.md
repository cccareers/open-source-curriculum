---
lesson_id: cyb120-08
course_id: cyb120
pathway: cybersecurity-support-technician
title: Containment, Eradication, and Recovery
order: 8
kind: lesson
competency_ids:
  - D3-S1-C05
objectives:
  - Choose containment, eradication, and recovery actions that stop an incident without destroying evidence or the business
---

## The decision, not the button

You already know how to isolate a host from your endpoint security course. You know how to disable an account from your access control course. You know how to write a firewall rule. This lesson does not reteach any of that, and it will not tell you which menu item to click.

It is about the decision that comes before the click, because the mechanics are the easy part. Almost every serious mistake made in the back half of an incident is a decision error, not an execution error: containing before scope was known, reimaging before evidence was captured, rotating one password when forty were exposed, restoring from a backup taken after the compromise began, declaring recovery because everyone was tired, or taking an action nobody had the authority to take.

There is a second thing this lesson is about, and it is the harder skill: **you will almost never own the systems you need to change.** The workstation belongs to desktop support. The firewall belongs to networking. The account belongs to identity management. The application belongs to a product team. The decision to take a revenue-generating service offline belongs to a business owner. Remediation is a coordination problem wearing a technical costume, and the responder who can get five teams to act correctly and in the right order is worth more than the one who knows the most commands.

## Containment: the six criteria

Containment stops the incident getting worse. That is its only job. It does not fix, remove, or restore. And there is never one obvious containment action — there is a set of options, each with a different profile, and choosing among them is a judgment you should be able to defend out loud.

Six criteria decide it. Run them explicitly for anything consequential; with practice it takes two minutes.

**1. Potential damage if you do nothing.** What gets worse in the next hour? Data exfiltrated, more hosts compromised, more accounts taken, files encrypted, a service degraded. Ransomware actively encrypting a file share and a dormant implant on a spare laptop sit at opposite ends of this scale, and they justify very different urgency.

**2. Evidence preservation need.** How likely is this to become a legal, regulatory, insurance, or HR matter — and what would the chosen action destroy? Powering off destroys memory. Reimaging destroys the disk. Blocking at the perimeter destroys nothing but reveals you. If the case involves regulated data, an employee, a third party, or a potential dispute, the evidence cost of every option rises sharply.

**3. Service availability cost.** What breaks, for whom, and for how long? Two users losing laptops for a day is not the same as a warehouse stopping. Quantify it in business terms, not technical ones — and be honest that this criterion is what other people in the room will care about most.

**4. Time and resources required.** An action you can take in ninety seconds and one that needs a four-hour change window are not comparable options during an active intrusion. Sometimes the imperfect action available now beats the ideal action available this evening.

**5. Effectiveness and durability.** Does this actually stop the activity, and does it keep stopping it? Blocking one address stops one channel; a competent implant has a fallback. Isolating the host stops everything from that host. Ask what the attacker's next move is after your action, because they get one.

**6. Duration and exit.** How long can this hold, and what ends it? A temporary firewall rule needs an owner and a review date, or it becomes permanent, undocumented, and eventually the cause of an outage nobody can explain.

Notice that criteria 2 and 3 pull against 1 and 5. That tension is the entire decision, and naming it explicitly is what makes the choice defensible rather than reflexive.

## The containment ladder

Options, roughly from narrowest to broadest. The skill is choosing the narrowest action that actually stops the growth.

**Network-isolate a host, leaving it running.** The default first choice for a compromised endpoint. It stops command and control and lateral movement while preserving memory, running processes, and disk. Most endpoint tooling can do this while keeping its own management channel open. Cost is one user's productivity.

**Disable or restrict an account.** Right when the compromise is credential-based rather than host-based. Consider whether disabling tips off the attacker and whether the account is used by a service that will fail loudly — disabling a service account can take an application down, so find out what depends on it *before* you do it, not after.

**Force a credential reset.** Broader than disabling, and the scope question is the hard part: this account, this population, or every account that could have been exposed? Getting this wrong in the small direction is a leading cause of an attacker returning a week later.

**Block a destination** at the resolver, proxy, or firewall. Cheap and fast, protects hosts you have not yet found, and it is *visible to the attacker*. Consider blocking at the resolver while leaving the address unblocked so any *other* infected host still reveals itself by attempting the connection.

**Segment or isolate a network zone.** Right when the spread is host-to-host across a subnet. Large blast radius; needs the network team and usually a business decision.

**Stop or degrade a service.** Shut down the affected application, disable a feature, take a server out of the load balancer, or put the service into a read-only mode. Almost always requires the business owner.

**Quarantine or block a file** by hash across the estate. Precise, and trivially defeated by recompilation, so pair it with a behavioral detection.

**Remove a system from the domain, or disable a trust relationship.** Heavy, occasionally necessary in directory-level compromises, and never a decision made alone.

**Power off.** The nuclear option. Instant, absolute, and it destroys all volatile evidence. Justified when destruction is active and outpacing anything else available — a host encrypting a share you cannot otherwise disconnect. Rare. Document the reasoning when you do it, because it *will* be asked about.

**Two special cases worth having decided in advance.**

*Watching instead of acting.* Occasionally the right answer is to leave a contained-but-live channel in place while you finish scope, so that the attacker does not learn they are detected and accelerate. This is a legitimate strategy and it is not a junior decision — it requires explicit senior authorization, a written justification, a hard time limit, and continuous monitoring with a pre-agreed trigger for immediate containment. If it is ever proposed and nobody writes down the abort condition, that is your cue to ask for it.

*Simultaneous containment.* When you have found multiple footholds, contain them **together** rather than one at a time. Sequential containment gives the attacker warning and time to move to the foothold you have not reached yet. This is worth planning explicitly: list every action, assign each to a person, agree a time, and execute in one window.

## Writing the containment decision

Every consequential containment action gets a short written decision before it happens. Ninety seconds to write, and it is the artifact that makes the difference between a decision and a reflex.

```text
Containment decision  IR-2026-0031-CD02       Proposed 10:14Z 2026-03-10

Action        Simultaneous network isolation of WKS-2210 and WKS-4471 via
              endpoint agent. Both hosts left POWERED ON. Disable
              svc_backup? NO - see below.
Scope basis   Flow search across 30 days for 198.51.100.44 returns these two
              hosts only; server subnets negative (IR-2026-0031 timeline
              09:52Z, 09:55Z).
Damage if not Active C2 on both hosts; svc_backup authenticated to FS-07 at
              14:07Z yesterday, so lateral movement is in progress.
Evidence      Memory capture required before any reboot or reimage. Isolation
              preserves memory, processes, and disk. No power-off.
Business cost Two users lose workstations, est. 1 day. No production service
              affected. Users' managers notified before action.
Effectiveness Stops C2 and lateral movement from both known hosts. Does NOT
              address an unknown third foothold; retro hunt continues.
Duration      Until eradication complete on both hosts; review at 17:00Z.
Not doing     Perimeter block of 198.51.100.44 is deliberately deferred so
              that any third infected host reveals itself by attempting the
              connection. Review at 17:00Z.
              svc_backup NOT disabled - the nightly backup depends on it and
              the account's exposure is unconfirmed. Instead: alert on every
              use, and the credential is rotated in the eradication window
              tonight with the backup team on standby. Owner: D. Aguilar.
Coordination  Desktop support (isolation), identity team (svc_backup
              monitoring), backup team (standby tonight).
Authorized by S. Vance, IR lead, 10:16Z. Executed by M. Okafor 10:18Z.
Result        Both hosts confirmed isolated 10:19Z, agents still reporting.
```

Read the two most valuable fields. **"Not doing"** records the options considered and rejected with their reasons — this is what a post-incident review needs and almost never gets, and it is what stops someone re-proposing the same idea at hour six. And **"coordination"** names the other teams, which is the field that most often turns out to be the reason an action failed.

## Working with the teams who own the systems

You are asking people to do disruptive things to systems they are responsible for, often at short notice, often with incomplete information. How you ask determines whether it happens.

**Know who owns what before the incident.** If you are working out who administers the finance file server while the finance file server is being encrypted, you have already lost twenty minutes. This is a preparation activity and it is a genuinely useful thing for an apprentice to own.

**Ask for the outcome, and give the reason.** "We need WKS-4471 isolated from the network in the next ten minutes; it is beaconing to attacker infrastructure and we have confirmed lateral movement" gets a faster response than "please isolate WKS-4471." People move faster when they understand why, and they push back usefully when they know something you do not — "isolating that host will stop the payroll run" is information you needed.

**Say what you need, what you do not need, and what must not happen.** The instruction that most often gets missed is the negative one: *do not reboot it, do not reimage it, do not log in with a domain administrator account.* Say those explicitly and confirm they were heard. A well-meaning technician who reimages a host to "get the user working again" destroys the investigation, and it happens constantly.

**Get authorization from the right person and record it.** Know from your incident response plan who can authorize what. If the plan is silent and the action is significant, escalate rather than assume. "The security team disconnected our production system without asking" is a conversation that damages the relationship you need for the next incident.

**Give a clear brief for each team.** Different audiences need different things: desktop support needs the host name, the action, the negative instructions, and a contact; the network team needs the addresses, the rule, and the duration; the identity team needs the accounts and the scope of the reset; the application owner needs the impact, the expected duration, and the criteria for restoration. Legal and communications need impact and data-exposure facts, not technical detail. The clock and evidence rules around notification and regulator obligations are handled by your compliance course; your job here is to give them accurate facts fast and to flag when you think a clock may be running.

**Close the loop.** Confirm each action was actually completed and verify it independently where you can. "Isolated" in a ticket and "no traffic observed from that host since 10:19Z" are different claims, and only the second one is evidence.

## Eradication

Eradication removes the attacker's presence and closes the way in. Two jobs, and organizations that do only the first get compromised again by the same actor within weeks.

**The three gates before eradication starts.**

*Scope is complete enough.* You have hunted for every indicator across the estate and across your retained history, and the results have stopped growing. If new hosts are still appearing, you are still in detection and analysis.

*Evidence is captured.* Memory and disk acquisition for anything that will be rebuilt is done and verified. **This gate is absolute.** Once a host is reimaged the evidence is gone permanently, and no amount of later regret recovers it. If the business genuinely cannot wait, that is an explicit decision by a named person, written down along with what will consequently be unknowable.

*The plan is simultaneous.* Eradication across multiple hosts happens in one coordinated window. Cleaning host A on Monday and host B on Wednesday gives the attacker two days to re-establish from B.

**Clean or rebuild?** The default answer for a confirmed compromise involving code execution is **rebuild**, and the reasoning is uncomfortable but sound: you cannot prove a system is clean, you can only fail to find anything. Removing known artifacts leaves you certain about the artifacts you found and uncertain about everything else.

Rebuild when: the compromise involved code execution with unclear capability; administrative or system-level privileges were obtained; the intrusion had time to establish multiple footholds; the host is a server or otherwise high-value; there are signs of tooling designed to hide; or the case may be examined later.

Cleaning is defensible when: the activity was fully characterized and its capability is known; it never obtained elevated privileges; the affected component is well-bounded, such as a malicious browser extension or a mailbox rule; and heightened monitoring will follow. Cleaning is always the *judgment* option and it should be recorded as such.

A rebuild means from known-good media or a trusted image — not from a backup of the compromised system, and not by "restoring" the operating system while keeping the profile. Data is restored from a backup that predates the compromise, and the date the compromise began is a finding from your timeline, not a guess. If the timeline says the first host was compromised on 2 March, a backup from 6 March is not clean, however convenient it is.

**Credential rotation, scoped honestly.** Any credential that was present, cached, typed, or reachable on a compromised system must be considered exposed. That means the logged-on users, any account used to administer the host, service accounts running on it, credentials stored in files or browsers, and application secrets and API keys accessible from it. Where a system holding credential material for many accounts was compromised, the population is much larger and the rotation is a project — one that needs planning with the identity team so it does not itself become an outage. Rotation also has an *order*: rotate before you remove the attacker's access and they may simply re-steal the new credentials; rotate after, and there is a window. Plan the sequence deliberately with the identity team rather than doing it ad hoc.

**Close the entry vector, and every persistence mechanism.** The initial access route gets fixed: the vulnerability patched, the exposed service removed from the internet, the mail gateway rule corrected, the excessive permission revoked. And every persistence mechanism found in analysis gets removed *everywhere*, not only where it was first found. Lesson 07's sample had two persistence mechanisms; removing one and not the other leaves the host compromised while looking clean.

**Verify eradication rather than assuming it.** For every removal, confirm the artifact is gone. For every indicator, re-run the hunt across the estate and record the negative. For the entry vector, test that the fix holds. Write each verification down — "removed" is a claim, "removed and verified absent across all 412 hosts at 18:40Z" is a finding.

## Recovery

Recovery returns to normal operations and *proves* the return is safe. It has four parts and a set of criteria, and the criteria have to be written before the pressure to skip them arrives.

**Restore** from clean sources: rebuilt systems, verified backups from before the compromise, reinstalled applications, reconfigured to a hardened baseline rather than to whatever the configuration was before.

**Validate** before returning to service. Three separate checks: the system functions and the owner agrees it functions; the indicators are absent; and the security posture is right — patched, hardened, logging enabled and flowing to your central collection, endpoint agent installed and reporting. That last one gets forgotten constantly, and a rebuilt host that is not sending logs is a blind spot you created yourself.

**Return in stages.** Bring systems back progressively rather than all at once, with the least critical or most easily observed first. A problem then appears on one system rather than forty. Between stages, look.

**Monitor with heightened sensitivity**, and mean something specific by it: every indicator from the case loaded as a detection rule; the affected hosts and accounts on an explicit watch list; a named owner; a defined period with a review date. Thirty days is a common default. Put the end date in the calendar so it is reviewed rather than quietly forgotten.

**Recovery criteria, written in advance.** Otherwise the criterion becomes "the business is tired of waiting." A workable set:

```text
Recovery criteria - IR-2026-0031
[ ] All identified compromised hosts rebuilt from known-good images
[ ] Data restored from backups dated before 2026-03-09 (first observed
    compromise 2026-03-10 13:44Z; margin of one day applied)
[ ] All exposed credentials rotated - list of 14 accounts attached,
    identity team sign-off
[ ] Entry vector closed: mail gateway rule for macro-enabled documents
    corrected and tested with a benign sample
[ ] All case indicators deployed as detections; retro hunt across 90 days
    complete with results recorded
[ ] No indicator observed anywhere in the environment for 7 consecutive days
[ ] Logging and endpoint agents confirmed reporting on all rebuilt hosts
[ ] System owners have tested and accepted each restored service
[ ] Heightened monitoring configured, owner named, review date set
```

**Standing down is a decision, announced.** A named person declares the response over and says so explicitly. Incidents that fade out leave people uncertain for days whether they are still on, and they never get a proper post-incident review.

**If it comes back.** Reinfection during recovery means one of three things: eradication was incomplete, scope was incomplete, or the entry vector is still open. Treat it as a new incident with the old case attached, and re-run scope from the beginning rather than assuming the new event is a copy of the old one. Do not simply reapply the same remediation harder — the fact that it recurred is evidence that a premise was wrong, and finding the wrong premise is the whole job.

## Three cases where the decision differs

**Ransomware.** The clock dominates and encryption is destructive, so containment is aggressive: isolate affected hosts immediately, and disconnect or restrict the file shares being encrypted rather than waiting. Still capture memory where you can, because keys and process state occasionally live there. Do not reimage the first affected host — it is the best evidence of entry. Backups are now both the recovery path and a target, so verify their integrity and their isolation from the compromised environment early, and check whether backups themselves were reachable from the compromised credentials. Restoration order is a business decision made against a dependency map, not a technical preference. And any question about payment is a leadership, legal, and insurance matter that a responder does not touch.

**Business email compromise.** There may be no malware and no compromised endpoint at all — the compromise is an identity. Containment is credential and session focused: reset the credential, and then explicitly **revoke active sessions and tokens**, because a password reset alone does not evict an attacker holding a live session. Remove attacker-created inbox rules and forwarding addresses, and check whether any were created on *other* mailboxes. Review what the identity could reach in every connected platform, and check for registered authentication methods the attacker may have added, which is the most commonly missed persistence in this class of incident. Recovery includes checking for fraudulent transactions, which involves finance, not just security.

**Insider or employee-related.** The technical decision is now secondary to a process one. Involve human resources and legal *before* acting, because premature technical action can compromise both the investigation and the organization's legal position. Evidence handling standards go up, not down, because this class of case is the most likely to be formally examined. Containment may deliberately be delayed or made covert on legal advice. And your access to the case is likely to be restricted — which is correct, and not a slight.

## The mistakes, listed plainly

Every one of these is common, and each has a one-line prevention.

- **Reimaging before acquisition.** Gate eradication on verified evidence capture, in writing.
- **Containing before scope.** Hunt for the indicator across the estate before you act, and act on everything at once.
- **Rotating too few credentials.** List everything reachable from the compromised system, not everything you noticed.
- **Restoring from a backup taken after the compromise began.** Take the compromise start date from the timeline, and add margin.
- **Removing one persistence mechanism.** Remove every mechanism found in analysis, everywhere, and verify.
- **Forgetting the entry vector.** Eradication is not complete until the door is closed and tested.
- **Rebuilt hosts with no logging or agent.** Put it in the validation checklist.
- **Temporary rules with no owner or expiry.** Every temporary control gets both, recorded.
- **Declaring recovery because everyone is tired.** Write the criteria before the fatigue arrives.
- **Taking an action nobody authorized.** Know who can approve what; escalate rather than assume.

## Practice

**Exercise 1 — Run the six criteria.** For each scenario, work through all six containment criteria in writing and choose an action, then name the option you rejected and why. (a) A file server is encrypting a shared drive right now. (b) A developer laptop beacons hourly to an unfamiliar address; scope is not complete. (c) A domain administrator account authenticated from an unfamiliar country at 03:00. (d) A public-facing web application is serving a malicious script to visitors. (e) A departing employee downloaded 40 GB from a document platform last night.

**Exercise 2 — Write two decision records.** Choose two scenarios from exercise 1 and produce complete containment decision records in the format used in this lesson, including the "not doing" and "coordination" fields. Then have a classmate play the system owner and challenge your decision; revise the record based on anything they raise that you had not considered, and mark what changed.

**Exercise 3 — Clean or rebuild.** For each of six situations your instructor supplies, decide clean or rebuild and justify it in three sentences against the criteria in this lesson. For every "clean" decision, write the additional monitoring you would put in place and the specific evidence that would make you change your mind and rebuild after all.

**Exercise 4 — Scope the credential rotation.** Given a compromised host description including its logged-on users, the administrative accounts used on it, the service accounts running on it, stored browser credentials, and an application secret in a configuration file, produce the full rotation list with an owner and a sequence for each item. Then write the two-paragraph brief you would send the identity team, including what must not happen and what you need confirmed back.

**Exercise 5 — Build and defend recovery criteria.** For the case followed through this course, write a complete recovery criteria checklist, with a stated compromise start date and the margin you applied to backup selection. Then write the two-paragraph message you would send a business owner who is pushing to restore service four hours before your criteria will be met — acknowledging their cost, stating your specific risk, and offering a concrete partial option rather than a refusal.

**Exercise 6 — Coordinate a simultaneous eradication.** Plan an eradication window for a three-host, one-service-account incident. Produce: the action list with an owner per action, the sequence and timing, the specific negative instructions for each team, the verification step for each action and who performs it, the rollback position if something fails, and the communication plan for the affected users. Then run it as a tabletop with classmates playing desktop support, networking, identity, and a business owner, and write up every place the plan proved incomplete.
