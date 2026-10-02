---
lesson_id: cse220-10
course_id: cse220
pathway: cloud-support-engineer
title: 'Project: Run a Simulated Incident End to End'
order: 10
kind: project
competency_ids:
  - D1-S1-C01
  - D1-S1-C04
  - D6-S1-C02
objectives: []
---

## The goal

Somebody breaks a service you are supporting, without telling you what they broke. An alert fires. You run the incident from that alert to a closed postmortem, alone or with a small team, under a real clock — and you hand in the evidence.

That is the whole deliverable. You are not building anything new and you are not being marked on how fast you find the fault. You are being marked on whether you *ran an incident*: declared it, communicated it to the right people in the right words, isolated the fault across the layers with evidence rather than guesses, mitigated impact before you fully understood the cause, escalated when the criteria said to, and left behind a record that another person could use.

Incident response cannot be demonstrated on paper, which is why this is the terminal assessment for the course. Everything you built in lessons 02 through 09 — the signal inventory, the collection setup, the query library, the triage dashboard, the alert rules, the runbook, the path map, the escalation template — is an input to this project. If any of them are missing or half-finished, finish them first. You will not have time during the run.

Budget two hours: about twenty minutes of setup and role assignment, forty-five to sixty minutes for the incident itself, and the remainder for the write-up. The write-up is not optional and it is not a formality; it is over half the marks.

## What you need before you start

**A monitored service.** The storefront you have been working with, deployed in a sandbox or lab environment, or any equivalent service you have telemetry on. It must have at least two tiers, at least one dependency, and real traffic during the exercise — a load generator producing a steady rate is fine, and a service with no traffic produces no signals.

**Working telemetry from lesson 03.** Metrics, logs, and at least one log-derived metric, all verified as arriving. Run the four verification checks again before the exercise begins. Discovering during the run that a stream stopped shipping two days ago is a realistic experience but a poor use of your two hours.

**Your triage dashboard from lesson 05**, with the drill-down links working.

**At least three alert rules from lesson 06**, actually firing to somewhere you will see, with runbooks linked.

**A fault injector.** A peer, an instructor, or a partner team who will break exactly one thing at a time and will not tell you what. They also play the escalation target and the impatient stakeholder.

**Roles assigned in advance.** With three or more people: incident commander, operations lead, scribe, and the comms role held by the commander. With two: commander plus comms, and ops lead plus scribe. Alone: you hold all four and you must still produce every artifact, which is a harder exercise and a legitimate one.

## Requirements

Numbered so a reviewer can mark them one at a time. Each states what must be true, not how to do it.

**R1 — The fault is injected without your knowledge.** Your injector picks one fault from the catalogue below, applies it at a time you do not know, and records what they did and when in a sealed note. They do not answer questions about what they changed. They may answer questions about the *outside* world in character — as the payment provider's status page, or as a customer.

**R2 — Detection is by alert, and time-to-detect is recorded.** Your own alerting must be what tells you, not the injector. Record the fault injection time from the sealed note afterwards and the time your first alert fired; the difference is your time-to-detect and it is a finding either way. If no alert fires at all and you learn about it another way, that is the single most important result of the exercise and it must be stated plainly in the postmortem.

**R3 — The incident is declared within three minutes of detection.** With a declaration message containing symptom, impact, proposed severity, who is commanding, and the next update time. Timestamped.

**R4 — Severity is assigned and revisited.** Assigned at declaration against your own written definitions from lesson 08, and either confirmed or changed at least once during the run, with the reason recorded.

**R5 — Three audiences are served throughout.** At least three public status updates using the investigating, identified, monitoring, and resolved states; at least two internal stakeholder updates including customer-facing wording; and a continuous response-channel log. Every promised next-update time must be met. The impatient stakeholder will interrupt at least three times and those interruptions must not derail the technical work.

**R6 — The fault is isolated with evidence across layers.** Using the path map and the method from lesson 07. Your record must show at least three hypotheses eliminated by evidence, each with the query or command that eliminated it, and the confirmed location with the evidence that confirms it. A correct guess with no supporting evidence does not satisfy this requirement.

**R7 — Mitigation is attempted before diagnosis is complete.** At least one mitigation, announced in the channel before it is applied, with the expected effect stated in advance, one change at a time, and the observed result recorded. If the mitigation did not do what you predicted, revert it before trying the next one and record that too.

**R8 — Escalation criteria are applied.** Write your escalation criteria down *before* the run. During the incident, either escalate — with a complete seven-block packet to the correct named team, sent to your injector playing that role — or explicitly record the moment you considered escalating, which criterion you evaluated, and why you decided not to. Doing neither fails this requirement.

**R9 — A timestamped troubleshooting record is kept live.** Written during the incident, not after. Every entry has a time, the literal query or command, and the result. It must contain at least three negative findings, and every action taken against the environment, including anything you changed and did not revert.

**R10 — The incident is closed explicitly.** A closing message stating that customer impact has stopped, what the mitigation was, whether the mitigation is also the fix, total impact duration, and what happens next.

**R11 — A postmortem is produced.** Blameless, with summary, quantified impact, timeline from the earliest contributing event, detection with time-to-detect, at least three contributing causes, what went well, what was difficult, and action items each with an owner, a date, and a category of prevent, reduce impact, or improve detection — with at least one of each category.

**R12 — A knowledge-base article is produced.** For the class of problem you hit, titled with the symptom in a searching reader's words, with exact error text, diagnostic queries, numbered resolution steps with expected output, a verification step, and the failure path.

**R13 — One monitoring improvement is implemented.** Not proposed — implemented, and demonstrated. A new or corrected alert rule, a new dashboard panel, a new log-derived metric, or a new log field, chosen because the exercise showed you needed it. Show the before and after.

## The fault catalogue

Your injector picks one, at random, from a layer you have not practised. They do not tell you which layer.

**Compute.** Exhaust memory in the application process. Stop the process on one of several instances. Saturate CPU with a competing workload. Make the health check depend on a dependency, then stop the dependency. Reduce the autoscaling maximum below current demand.

**Storage.** Fill a data volume. Exhaust inodes with many small files. Remount a volume read-only. Throttle the volume below the workload's requirement. Break log rotation so the disk fills gradually during the run.

**Network.** Remove the firewall rule permitting the application tier to reach the database. Point a DNS record at a wrong address. Add a stateless subnet rule that blocks return traffic. Exhaust connections on the outbound translation gateway. Let a certificate on an internal endpoint expire.

**Dependency.** Make the payment provider return errors for a fraction of calls. Make it slow rather than failed — a five-second response instead of a timeout, which is much harder to spot. Have it return valid-looking but wrong responses.

**Configuration.** Deploy a change that introduces an unindexed query. Reduce a connection pool size. Set an aggressive client timeout that turns a slow dependency into a total failure. Change a resource label so half your dashboards silently stop matching.

The last one in that list is worth flagging: some of these faults are designed so your existing monitoring does *not* catch them cleanly. That is deliberate. Discovering a gap is a successful outcome, provided you name it in the postmortem and close it under R13.

## Constraints

- **One fault at a time.** The injector applies exactly one. If you find two problems, one of them was already there, and finding it is a bonus, not the answer.
- **Read-only probes first.** Every diagnostic that does not change the environment comes before any that does. When you must change something, announce it, do one at a time, and record it.
- **No asking the injector what they broke.** Not directly, not indirectly, not "just to check." They will answer in character as an outside party only.
- **No fixing before declaring.** Even if you spot it in the first ninety seconds, declare first. The declaration is being assessed and it takes thirty seconds.
- **Real timestamps throughout.** Not "about ten minutes in." Use one timezone and state which.
- **Automated remediation is out of scope.** Every mitigation is applied by a human in this exercise. Self-healing systems belong to a later course.
- **No formal availability-target arithmetic.** Describe impact in duration, affected requests, and affected customers. Formal recovery objectives belong to a later course.
- **Write while you work.** Artifacts reconstructed afterwards from memory are visibly different, and the reviewer will notice the gaps in the timeline.
- **A sandbox, never production.** If your only environment is production, you may run this as a tabletop with a narrated fault, but you must say so, and the technical evidence requirement is replaced by naming the exact query you would have run at each step and the result you would have expected.

## Definition of done

Every statement must be true and independently checkable by a reviewer holding only your submission.

- The sealed injection note and your alert history are both present, and the time-to-detect is stated as a number.
- A declaration message exists, timestamped within three minutes of the first alert, containing symptom, impact, severity, commander, and next update time.
- Severity was assigned at declaration and reviewed at least once with a recorded reason.
- At least three public status updates exist, using the four states, with every promised update time met. At least two internal stakeholder updates exist and include the wording to give customers.
- The troubleshooting record is continuous and timestamped, contains the literal queries, includes at least three negative findings, and records every change made to the environment.
- At least three hypotheses were eliminated by evidence, and the confirmed fault location is supported by a resource-level or flow-level signal, not only by inference.
- At least one mitigation was announced with a prediction before being applied, and the observed result is recorded against that prediction.
- The escalation packet exists with all seven blocks, or a recorded decision not to escalate that names the criterion evaluated.
- An explicit closing message exists stating impact duration and whether the mitigation is also the fix.
- The postmortem contains all nine sections, names no individual as a cause, and its action items include at least one each of prevent, reduce impact, and improve detection, all with owners and dates.
- The knowledge-base article is titled with the symptom, contains exact error text, has numbered steps with expected output, has a verification step, and has a failure path.
- One monitoring improvement is implemented and demonstrated with before-and-after evidence.
- Someone who was not present can read the submission and describe what happened, in order, without asking you a question.

## Hints

**Open the triage dashboard before you open anything else.** It exists to answer "is it real, since when, which layer" in thirty seconds. If it does not, that is a lesson 05 defect and it belongs in your postmortem.

**Ask "what changed" in the first two minutes.** In a simulated incident something definitely changed, and in a real one it usually did. Check deployment annotations, configuration history, and scaling events before you go deep on anything.

**The first symptom shape narrows the search enormously.** Timeout versus refused versus reset. All requests versus a fraction. Slow at the median versus slow only at the tail. Consult the symptom-to-layer table from lesson 07 before running a single query and you will start in the right half of the path.

**Split by instance early.** It is one query and it either eliminates half the fault catalogue or hands you the answer.

**Watch out for the fault that looks like a different layer.** The full disk that presents as connection resets. The health check that turns a slow dependency into a total outage. The steal time that presents as an application performance regression. Follow the evidence past your first instinct.

**Rollback is the highest-yield mitigation.** If anything was deployed near the onset, undo it before you understand it.

**Capture before you restart.** A restart is often the right mitigation and always destroys evidence. Grab metrics, recent logs, and process state first — thirty seconds of capture saves the whole exercise from being unexplainable.

**Meet your update times even when there is nothing to say.** "No change, still investigating, next update at 15:10" is a complete and useful update.

**Give the scribe role to someone, even if it is you.** Nobody reconstructs a timeline accurately afterwards. If you are alone, keep a terminal window open and type one line per step; it costs seconds and it is the backbone of R9, R11, and R12.

**Do not negotiate with yourself about escalating.** You wrote the criteria in advance precisely so that the decision would not be made by a tired person mid-incident. When a criterion is met, act on it.

**Write the postmortem the same day.** The details that make it valuable — the wrong turn, the query that took four attempts, the moment you nearly restarted the wrong thing — are gone within hours, and a postmortem written from a clean timeline three days later is accurate and lifeless.

**If nothing alerted, say so first.** A silent failure is the most valuable result this exercise can produce, and burying it under a good isolation story wastes it.

## What to hand in

Submit these eight things together, in one place:

1. The environment description: what was running, what telemetry was collected, and which dashboard and alert rules were live.
2. The sealed injection note, opened after the run, with the injection time.
3. The complete response-channel transcript with timestamps.
4. The troubleshooting record.
5. Every external message sent: public status updates and internal stakeholder updates, in order.
6. The escalation packet, or the recorded decision not to escalate.
7. The postmortem.
8. The knowledge-base article, plus the before-and-after evidence for your implemented monitoring improvement.
