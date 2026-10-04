---
lesson_id: cse280-08
course_id: cse280
pathway: cloud-support-engineer
title: High Availability and Disaster Recovery
order: 8
kind: lesson
competency_ids:
  - D7-S1-C03
objectives:
  - Design a cloud architecture that meets a stated recovery time and recovery
    point objective
---

## Why a governance course teaches resilience

Availability is not usually filed under compliance, and it belongs there anyway. Every framework surveyed in lesson 03 has something to say about it, from a different angle: a SOC 2 examination that includes the availability criteria examines your recovery capability directly; the HIPAA Security Rule's administrative safeguards address contingency planning, data backup, and emergency operation; data protection regimes speak of the ability to restore availability and access to personal data after an incident; and NIST catalogues have a contingency planning family of their own.

More practically: an obligation to protect data is meaningless if the data can vanish. Confidentiality, integrity, and availability are the three properties every security programme is built on, and availability is the one engineers reliably treat as an operations concern and forget to evidence.

Then there is the commercial angle. Your customer contracts probably contain availability commitments, and a customer's own compliance programme may require them to obtain recovery assurances from suppliers. When a security questionnaire asks "what is your RTO?", the person asking is not being curious.

## Two different problems that get one name

**High availability** is about surviving a *component* failure without a meaningful interruption. An instance dies, a zone loses power, a disk fails — and the service keeps serving because there was already another one running. HA is designed in advance, operates automatically, and its success is measured in seconds and in nobody noticing.

**Disaster recovery** is about restoring service after a failure large enough that the surviving capacity is not enough: a whole region degraded, an account compromised, a database dropped by a bad migration, a ransomware event. DR involves a decision, a procedure, and usually a human. Its success is measured in hours and in how much data was lost.

They are not points on one scale; they defend against different failure domains and they use different mechanisms. The practical error is assuming that a highly available architecture is automatically recoverable. A database replicated synchronously across three zones is superbly available and offers no protection whatsoever against `DELETE FROM appointments` — the deletion replicates faithfully to all three copies in milliseconds. HA protects against infrastructure failing. It does not protect against your own software, your own people, or someone with your credentials.

Enumerate the failure domains explicitly when designing, because each needs a different answer:

| Failure domain | Example | Typically answered by |
| --- | --- | --- |
| Instance / process | A virtual machine dies | Multiple instances behind a load balancer, health checks |
| Zone | A data centre loses power or network | Multi-zone deployment, zone-redundant managed services |
| Region | A regional service degradation | Cross-region DR, replicated data, a documented failover |
| Account / subscription | Credentials compromised, resources deleted | Isolated backup account, immutable copies, guardrails |
| Data corruption | Bad migration, application bug | Point-in-time recovery, backups with sufficient history |
| Malicious deletion or encryption | Ransomware, insider | Immutable backups, separate credentials, versioning |
| Dependency | A third-party or provider service is down | Graceful degradation, documented manual fallback |
| Human error | Wrong environment, wrong flag | Change control, guardrails, blast-radius limits |

The last four are the ones teams miss, and they are the ones that hurt most, because none of them are solved by adding another zone.

## RTO and RPO: the only two numbers that matter

Every resilience conversation should converge on two numbers, per workload.

**Recovery time objective** is how long the service may be unavailable. It is measured *forward* from the moment of failure to the moment service is restored.

**Recovery point objective** is how much data you may lose. It is measured *backward* from the moment of failure to the most recent recoverable state.

![A failure event on a timeline, with the recovery point objective measured backward to the last recoverable data and the recovery time objective measured forward to service restoration](./img/rto-rpo-timeline.png)

Being precise about the endpoints prevents most confusion:

- The RTO clock starts at the *failure*, not at the moment somebody noticed. If detection takes forty minutes, forty of your minutes are gone before anyone has done anything. Time to detect is inside the RTO, which is why the monitoring and alerting work from cse220 is load-bearing here.
- The RTO clock stops when the service is genuinely usable by customers, not when the infrastructure is running. Warm caches, DNS propagation, and dependent services all sit inside it.
- RPO is determined by the *interval* of your data protection, not by its duration. Hourly snapshots give you an RPO of one hour regardless of how long a snapshot takes. Asynchronous replication gives you an RPO equal to the replication lag, which you should measure rather than assume.

These numbers are business decisions, not engineering ones. The correct source is whoever owns the service and its contracts. Your role is to state honestly what the current architecture achieves, what a target would cost, and where the two do not meet. An engineer who invents an RTO because nobody would give them one has just committed the company to a number.

Two related terms appear in the same conversations. **Maximum tolerable downtime** is the point beyond which the harm becomes unacceptable — the RTO should be comfortably inside it. And **service level objectives or agreements** are about routine availability percentages, which is a different measurement from recovery after a disaster; do not let a "99.9% uptime" commitment be treated as an answer to "what is your RTO".

## High availability patterns

The building blocks are the same across providers, under different names.

**Redundancy across zones.** Availability zones are physically separated facilities within a region, connected with low-latency links. Running at least two instances of every tier in different zones is the baseline, and it is cheap relative to what it buys. The subtlety people miss: capacity. If two zones each run at 60% and one fails, the survivor cannot absorb the load, and you have built an architecture that fails over into an overload. Size for the failure case, or make autoscaling fast enough to matter — and test which.

**Health checks that check the right thing.** A load balancer removing an unhealthy instance is the mechanism that makes redundancy work, and it only works if the health check reflects real health. A check that returns 200 because the web server is up, while the database connection pool is exhausted, keeps a dead instance in rotation. A deep health check that verifies dependencies is better, with one caveat: if every instance's health check depends on a shared dependency, a blip in that dependency marks the entire fleet unhealthy at once. Distinguish a *liveness* check from a *readiness* check, and be deliberate about which one the load balancer uses.

**Stateless application tiers.** If any instance can serve any request, replacement is trivial. State pushed to a managed database, cache, or object store is state that somebody else replicates for you. Session affinity is the usual culprit in the other direction — it turns instance loss into user-visible loss.

**Zone-redundant managed services.** Managed databases offer multi-zone configurations with automatic failover; managed object storage is typically multi-zone by default; managed load balancers and queues likewise. Choosing the redundant configuration at provisioning time is a checkbox that later costs a redesign. This is the "how you configured it" half of the shared responsibility split from lesson 02, and it is exactly the kind of thing an auditor will ask you to evidence.

**Quorum and the odd number.** Anything that elects a leader or votes needs an odd number of members across an odd number of zones, or a split can leave you with no majority and therefore no writes.

**Graceful degradation.** The most under-used pattern. Decide in advance which functionality can be shed. In our appointment reminder service, if the SMS provider is unreachable, the right behaviour is probably to queue messages and keep the booking flow working, not to fail the booking. A degradation plan is worth writing down because it is an engineering decision with a business owner.

## Disaster recovery strategies

There is a well-known ladder of DR approaches, and its value is that each rung has a characteristic RTO and RPO band and a characteristic cost. Choosing a rung is the core design decision.

**Backup and restore.** Data is backed up; on disaster, infrastructure is rebuilt and data restored. Cheapest by a wide margin. RTO measured in hours to days, dominated by how long it takes to stand up infrastructure and move data. RPO equal to the backup interval. Entirely viable — and *only* viable — if the infrastructure is defined as code, because rebuilding by hand under pressure is where this strategy fails.

**Pilot light.** The core of the system, usually the data layer, is running and replicating in the recovery region; everything else exists as code and is dormant. RTO in tens of minutes to a couple of hours, RPO low because replication is continuous. Costs a fraction of the full environment.

**Warm standby.** A scaled-down but complete and running copy in the recovery region. Failover means redirecting traffic and scaling up. RTO in minutes. More expensive, and it has an underrated advantage: the standby is *running*, so it is continuously proving that the deployment works, which the pilot light does not.

**Active/active.** Full capacity in multiple regions, serving traffic simultaneously. RTO approaching zero, RPO approaching zero for synchronously replicated data. Most expensive, and much the hardest to build correctly — data consistency across regions, conflict handling, and the fact that a bad deployment now reaches all regions at once. Choose it because latency or a genuine near-zero RTO demands it, not because it sounds strongest.

| Strategy | Typical RTO | Typical RPO | Relative cost | Fails when |
| --- | --- | --- | --- | --- |
| Backup and restore | Hours to days | Backup interval | Lowest | Infrastructure is not codified |
| Pilot light | Tens of minutes to hours | Minutes | Low | The dormant parts have never been deployed |
| Warm standby | Minutes | Seconds to minutes | Medium | Capacity is too small to absorb real load |
| Active/active | Near zero | Near zero | Highest | Consistency and deployment safety are not solved |

### Replication and its honest trade-off

The data layer determines RPO, and there are only two shapes.

**Synchronous** replication acknowledges a write only when the replica has it. RPO effectively zero. The cost is latency on every single write, proportional to distance — fine across zones, usually unacceptable across regions — and a behaviour worth understanding: if the replica is unreachable, the system must choose between refusing writes and dropping to asynchronous. Know which yours does.

**Asynchronous** replication acknowledges locally and ships changes after. No latency penalty, works over long distances, and the RPO is the replication lag. That lag is a live number that grows under load and during network trouble — precisely when a disaster is most likely. **Monitor replication lag and alert on it**, because an unmonitored asynchronous replica is an RPO claim nobody is checking.

And the point from earlier, restated because it is the most common design error in this whole area: replication is not backup. It faithfully replicates deletions, corruption, and encryption by ransomware. Both are required, and lesson 09 is about the other one.

## Designing to a stated objective

The method is to work backwards from the numbers rather than forwards from the architecture.

1. **Get the objectives in writing**, per workload, from the business owner.
2. **Enumerate the failure domains** you intend to survive, and explicitly name the ones you do not. A design that says "we do not attempt to survive a simultaneous two-region provider outage" is a better design document than one that is silent.
3. **Choose a strategy per tier.** Tiers can differ, and usually should — the appointment database might warrant warm standby while the marketing site is backup-and-restore.
4. **Walk the dependency list**, which is where designs fail. For each dependency, ask "does this exist in the recovery region, and does it work there?"
5. **Decompose the RTO into a budget** with named phases, and check the arithmetic against reality.
6. **State the residual gap.** If the design achieves 90 minutes against a 60-minute objective, say so, quantify what closing it costs, and let the owner decide. Do not quietly write 60 in the document.

Step 4 deserves a checklist of its own, because these are the items that turn a two-hour failover into a two-day one:

- **DNS**: who can change it, how fast does the record's time-to-live let traffic move, is it automated
- **Identity**: does the identity provider work if the primary region is the one hosting it
- **Secrets**: are credentials replicated to the recovery region, and does the recovery workload have permission to read them
- **Container images and artifacts**: is the registry regional
- **Infrastructure code and its state**: can you run the pipeline if the region hosting your CI is down
- **Certificates**: are they regional, and are they issued for the failover names
- **Third parties**: does the SMS provider allow calls from the recovery region's addresses, and is there an allow-list to update
- **The runbook itself**: is it readable when the environment is down — a runbook stored only in the failed region is a lesson people learn once

A worked budget for the appointment service, given a stated 60-minute RTO and 15-minute RPO:

```text
WORKLOAD: appointment booking + reminders
Stated RTO: 60 min      Stated RPO: 15 min      Owner: Clinical Platform

Failure domains in scope: instance, zone, region, data corruption,
malicious deletion. Out of scope: simultaneous multi-region provider
outage (accepted, reviewed annually).

Strategy: multi-zone HA within region; pilot light cross-region.

RTO BUDGET
  Detect                    5 min   automated alert on regional health
  Declare (human decision) 10 min   on-call → incident lead, criteria in
                                    runbook DOC-045 §3
  Promote replica           5 min   managed DB cross-region promotion
  Deploy app tier          15 min   pipeline against recovery region, images
                                    pre-replicated to regional registry
  Secrets + config          3 min   replicated key vault, verified quarterly
  DNS cutover              10 min   record TTL 60s + propagation margin
  Smoke test + open         7 min   scripted checks, documented pass criteria
  ---------------------------------
  Total                    55 min   against 60 min objective — 5 min margin

RPO POSITION
  Async cross-region replication, measured lag p95 = 4 min, alert at 10 min.
  Position: 4-10 min against a 15-minute objective. Backups additionally
  provide point-in-time recovery for corruption scenarios (lesson 09).

RESIDUAL / GAPS
  - 5-minute margin is thin; a slow deploy consumes it. Tracked as risk
    BCP-R-03, owner Clinical Platform, review after next failover test.
  - SMS provider allow-lists the primary region's egress addresses only.
    Recovery-region addresses not yet allow-listed — reminders would fail
    after failover. OPEN, ticket OPS-4502. This is the single largest gap.
  - DNS change currently requires a person with an account only two people
    hold. Bus factor 2. Tracked BCP-R-04.
```

That document is worth more than the architecture diagram it summarizes, for one reason: the gaps section. A DR design without a stated residual is a design that has not been thought about hard enough, and the SMS allow-list item is exactly the kind of thing that is invisible until the day it is not.

## Testing, and why the untested plan does not count

A disaster recovery plan that has never been executed is a hypothesis. Auditors know this, which is why the question is rarely "do you have a plan" and almost always "when did you last test it, and what happened".

Three levels of test, in increasing order of cost and value:

**Tabletop.** Everyone walks through the runbook verbally against a scenario. Cheap, schedulable, and surprisingly effective at finding gaps of the "who has that access?" kind. It cannot prove anything technical.

**Component or partial failover.** Fail over one tier, or promote a replica in an isolated environment, or restore into a recovery region without moving customer traffic. Most of the value, most of the time.

**Full failover.** Move real traffic. The only test that proves the whole thing, including the parts nobody thought about, and the only one that produces a real measured RTO. Schedule it, announce it, define abort criteria in advance, and treat the measured time as data rather than as a grade.

Whichever you run, the artifact is what survives, and it should record: the scenario, the date, who participated, the timeline of what happened at what time, the measured recovery time and data loss against the objectives, what failed or surprised you, and the actions arising with owners. A test where nothing went wrong usually means the test was too easy; a test that surfaces four problems has done its job, and the write-up saying so is the evidence an auditor wants to see.

A note on cadence: annual is the common minimum, and it should also be triggered by material change — a new region, a database engine upgrade, a re-architecture. And every DR test should feed the runbook. If the person running the test had to deviate from the written steps, the written steps are wrong, and fixing them is part of closing the test.

## Practice

The appointment service currently runs in a single region: an application tier across two zones behind a load balancer, a managed database with a same-region standby in a second zone, object storage for exports in the same region, secrets in a regional secrets manager, container images in a regional registry, and DNS at the provider. The SMS provider allow-lists your egress addresses. Infrastructure is about 70% defined in code; the load balancer and DNS records were created by hand.

The business owner has stated: **RTO 60 minutes, RPO 15 minutes**, and separately that a full-day outage would be "unacceptable to our clinical customers".

**Exercise 1 — Write the DR design record (the main artifact).**

Produce a design record in the format above containing: the stated objectives and their source, the failure domains in scope and explicitly out of scope, the chosen strategy per tier with a one-line justification referencing the ladder, a decomposed RTO budget with named phases and minute allocations summing to a total, an RPO position naming the replication mechanism and how lag is measured, and a residual/gaps section. The gaps section must be honest — this environment cannot currently meet the objective, and the record's job is to say so and quantify it.

**Exercise 2 — Walk the dependency list.**

Go through the dependency checklist in this lesson item by item against the described environment. For each, state whether it works in a recovery region today, and if not, what specifically must change. At least four items in this environment are broken or unknown; find them. For the one you consider most likely to be discovered only during a real disaster, write a single sentence explaining why it would stay invisible until then.

**Exercise 3 — Justify the strategy choice.**

Write a short comparison of pilot light versus warm standby for this specific workload, in terms the business owner can evaluate: what each achieves against the stated 60-minute RTO, roughly how the costs relate, what operational burden each adds, and which you recommend and why. Then state the one condition that would change your recommendation.

**Exercise 4 — Design the test.**

Write the plan for the next DR test: scenario, level (tabletop, partial, or full) with justification, participants by role, what will be measured and how you will measure it, abort criteria, and the exact artifact the test will produce. Then write the empty test record template that the test will fill in, including fields for measured RTO and measured RPO against objectives.

**Exercise 5 — Answer the questionnaire.**

A customer's security questionnaire asks: "Describe your disaster recovery capability, including RTO, RPO, and the date of your most recent test." Write the answer as you would send it today, given that the environment above has never had a DR test. It must be accurate, must not overstate, must distinguish what is designed from what is proven, and must not invent a test date. Then write, in one sentence, what you would need to do before you could send a materially better answer.

## Check your understanding

1. A database is synchronously replicated across three zones. Does that meet a 15-minute RPO against a bad migration that deletes rows? *(No — replication copies the deletion; only point-in-time recovery or backups recover from it.)*
2. Detection takes 20 minutes. Does that count against a 60-minute RTO? *(Yes — the RTO clock starts at the failure, not at detection.)*
3. Your DR budget totals 55 minutes against a 60-minute objective but has never been executed. What can you truthfully claim? *(That the design targets 55 minutes; it is unproven until a test measures it.)*
