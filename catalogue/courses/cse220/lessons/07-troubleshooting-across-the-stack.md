---
lesson_id: cse220-07
course_id: cse220
pathway: cloud-support-engineer
title: Troubleshooting Across Network, Storage, and Compute
order: 7
kind: lesson
competency_ids:
  - D1-S1-C01
  - D3-S1-C03
objectives:
  - Isolate a fault across the network, storage, and compute layers of a cloud service
---

## Bisection beats intuition

Everything so far has built visibility. This lesson turns it on a live fault, and it is the first one that crosses layers, because real faults do not respect the boundary between "network problem" and "storage problem." A full disk on one instance presents as intermittent connection resets. An undersized security group rule presents as a database that is "down." A depleted burst balance presents as an application that suddenly got slow for no reason anyone can name.

The skill being built is **fault isolation**: narrowing "something is broken" to a specific component and a specific reason, with evidence, fast enough to matter. The method is bisection. Take the path a request travels, cut it in half, determine which half contains the fault, and repeat. Ten hops need about four cuts. Guessing needs luck.

What makes bisection possible is having the path written down before you need it — the request-path map you drew in lesson 02. If you do not have one for the service in front of you, drawing it is the correct first move, not a delay.

## The path, and the questions at each hop

For the storefront, the checkout path looks like this:

```text
client
  → DNS resolution
  → public load balancer          (listener, TLS termination, health checks)
  → target group / backend pool   (which instances are considered healthy?)
  → application instance          (compute: CPU, memory, process)
  → local storage                 (disk: logs, temp files, inodes)
  → private network path          (routes, firewall rules, NAT, DNS)
  → managed database              (connections, storage, replication)
  → external payment provider     (egress path, TLS, third-party health)
```

Each arrow is a place a request can die. Each box is a place it can be delayed. At every hop there are exactly three questions:

**Can it get there?** Is there a route, is the port open in the firewall rules, does the name resolve, is TLS negotiating?

**Is the destination able to answer?** Is the process running, is the resource saturated, is it refusing new connections?

**Is the answer correct and timely?** Right status, right payload, within the time the caller will wait?

Isolation is walking the path and answering those three questions in a sequence that halves the search space each time. Start in the middle, not at one end. If you can reach the database from an application instance and the query returns quickly, the entire back half of the path is exonerated in one move and you now investigate the front half.

## Symptom to layer: the lookup table

Faults present through a small number of symptom shapes, and each shape narrows the search dramatically before you run anything.

| Symptom | Most likely layer | Why |
| --- | --- | --- |
| Connection times out, no response at all | Network | Packets are being dropped silently — firewall rule, missing route, wrong subnet |
| Connection refused, immediately | Compute | The host is reachable; nothing is listening on that port |
| Connection resets mid-transfer | Network or compute | Idle timeouts, MTU mismatch, process crash, connection-table exhaustion |
| Name does not resolve | Network (DNS) | Resolver configuration, private zone, split-horizon |
| TLS handshake fails | Network or configuration | Expired or wrong certificate, protocol or cipher mismatch, name mismatch |
| Uniformly slow, all requests | Compute or a shared dependency | A shared resource is saturated |
| Slow only at the tail | Storage, garbage collection, or one bad instance | A subset is hitting a constraint the rest is not |
| Slow, high `iowait` | Storage | CPU idle waiting on the device |
| Slow, high `steal` | Compute | Hypervisor throttling or exhausted credits |
| Errors on some requests, fine on others | Compute | One instance in a pool is bad |
| Everything fails after a fixed period of load | Storage or quota | Burst credits, provisioned throughput, connection limits |
| Writes fail, reads fine | Storage | Full disk, no inodes, read-only remount, full volume |
| Process disappears and restarts | Compute (memory) | Out-of-memory kill; look for kill events, not application errors |
| Intermittent failures with no pattern | Network | Connection tracking, ephemeral port exhaustion, one unhealthy backend |

Use it as a prior, not a conclusion. It tells you where to cut first.

## Compute layer

The compute layer is where the process lives, and its faults are the most familiar and the easiest to over-diagnose.

**CPU.** Split it as lesson 04 described. `user` is your code, `system` is syscall and network overhead, `iowait` is a storage problem, `steal` is the platform not giving you cycles. That last one is specific to cloud and catches people out: burstable instance types accumulate credits while idle and spend them under load, and when the balance hits zero the instance is throttled to its baseline — often a small fraction of what it was delivering an hour ago. Symptom: everything was fine, then everything got slow, no deployment, no traffic change. Check the credit balance metric before you check anything else on a burstable type. Also check the run queue: length above core count means threads are waiting for CPU, which is the saturation signal utilization alone does not give you.

**Memory.** Watch *available*, not free. A container or instance that runs out does not degrade politely — the kernel kills the largest process and the application log simply stops mid-sentence. The evidence is in the system log or the orchestrator's events, as a kill record, and in a restart count that incremented. If you are investigating "the service disappeared for forty seconds and came back," check restart counts and kill events first. Also watch for the slow version: a working set that has outgrown memory shows up as a collapsing cache hit rate, rising page faults, and rising read traffic to disk, and it presents as a storage problem.

**Process and health checks.** Is the process running, listening on the expected port, and answering its health endpoint? Cloud health checks are a common source of self-inflicted outages: a health check that is too aggressive removes healthy instances under load, concentrating traffic on the remainder, which then also fail their checks. A pool that is emptying itself while traffic is flat is nearly always this. Check the health-check path, its timeout, and its unhealthy threshold, and check whether the check touches a dependency — a health endpoint that queries the database will fail every instance the moment the database is slow, turning a degradation into a total outage.

**Autoscaling.** Scaling actions are events; overlay them. A group that is scaling in and out repeatedly is oscillating, which usually means the scaling metric and the cooldown are fighting. A group that has hit its maximum is at a ceiling and will not help you no matter what the metric says.

## Storage layer

Storage faults are the ones most often misread, because they present as CPU or application problems.

**Capacity.** Free bytes and free inodes, on *every* mount, not just root. A filesystem with 40 percent free space and no free inodes fails every create with an error that never mentions inodes. Log volumes fill during incidents — the incident produces more logging, which fills the disk, which produces new failures on top of the original one. This compounding is common enough to check reflexively.

**Throughput and IOPS ceilings.** Managed volumes have provisioned limits, and some types run on a burst model exactly like burstable compute. The signature is identical: fine for a while, then a cliff. Compare current throughput and operations per second against the provisioned ceiling for the volume type and size; on many platforms the ceiling scales with size, so a small volume can be the constraint regardless of how much space is free.

**Latency and queue depth.** Average wait time per operation and queue depth are the saturation signals. Rising queue depth with flat throughput means the device is at its limit. Rising wait time with low utilization suggests the problem is elsewhere — a network-attached volume whose *network* path is congested, which is a real and confusing failure.

**Object and file storage.** Different failure modes: request rate limits per prefix, eventual-consistency surprises on listings, permission errors that present as not-found, and cross-region latency that is invisible until someone moves a bucket. For a mounted network filesystem, check the mount is still there and has not silently remounted read-only, which produces write failures with a healthy-looking mount in every dashboard.

**The read-only remount.** Worth its own mention. When a volume detects errors, many systems remount it read-only to protect data. The instance stays up, health checks that only read may still pass, and every write fails. It is a spectacular source of confusion because the box looks alive.

## Network layer

Network faults are the highest-value ones for a cloud support engineer to be good at, because they are the ones application teams cannot diagnose themselves.

**Names.** Start with DNS. Does the name resolve, to what, and from *where you are standing*? Private zones, split-horizon views, and search domains mean the same name can resolve differently from two instances in the same account. Resolution that works from your laptop and fails from the instance is a routine finding.

**Routes.** Does the source subnet have a route to the destination? Is it going where you think — through a gateway, a peering connection, a private endpoint, or out to the internet and back? Asymmetric routing, where the outbound and return paths differ, produces intermittent failures that resist every other diagnosis.

**Filtering rules.** Cloud networks filter in at least two places: an instance-level rule set (security group, network security group, firewall rule) and a subnet-level one (network ACL). The instance-level ones are usually stateful, meaning a permitted outbound connection's return traffic is automatically allowed. The subnet-level ones are often stateless, which means you must permit the return traffic explicitly, including ephemeral port ranges. Forgetting that is one of the most common causes of "outbound works, replies never arrive."

**Address translation and gateways.** Private instances reaching the internet go through a translation gateway with its own connection limits and its own throughput ceiling. Port exhaustion on that gateway presents as intermittent connection failures under load, from many instances at once, with nothing wrong on any of them.

**Connection tracking and ephemeral ports.** Both the instance and the gateway maintain a table of active connections with a finite size. A service opening many short-lived connections can exhaust either. Symptom: intermittent failures that correlate with load and clear on their own.

**Packet size.** Path MTU mismatches, common across tunnels and peering links, let the handshake succeed and then hang the first large transfer. Symptom: small requests fine, large responses hang.

**TLS.** Expiry, name mismatch, an incomplete certificate chain that a browser tolerates and a strict client rejects, and protocol or cipher mismatch after a platform upgrade. Test with a client that prints the negotiated details rather than one that hides them.

## Flow logs: the network's evidence

Flow logs are the network layer's equivalent of an access log. Each record summarizes one traffic flow over an interval: source and destination address, source and destination port, protocol, packet and byte counts, an accept-or-reject verdict, and the interval's start and end. All three major providers offer them, they are off by default, and they are the single most useful network diagnostic you have — provided they were enabled *before* the fault. Turn them on for the subnets you support as routine practice.

The verdict field is what makes them powerful. A REJECT record tells you a rule denied the traffic and names both ends and the port, which converts "the database is unreachable" into "traffic from the application subnet to port 5432 is being denied" in one query. Just as important is the **absence** of records: if you see outbound records and no return flow at all, the traffic left and nothing came back, which points at routing or at the far end rather than at your filtering rules.

The query patterns follow lesson 04's shape.

```text
# 1. Is anything being rejected between the app tier and the database?
source vpc-flow-logs
| filter src_addr in APP_SUBNET and dst_addr in DB_SUBNET
| stats count() as flows, sum(packets) as pkts by action, dst_port
| sort flows desc
```

```text
# 2. Who is being rejected, overall, in the last 30 minutes?
source vpc-flow-logs
| filter action = "REJECT"
| stats count() as rejects by src_addr, dst_addr, dst_port
| sort rejects desc
| limit 20
```

```text
# 3. Is one instance's traffic missing entirely? (compare to its peers)
source vpc-flow-logs
| filter dst_port = 5432 and action = "ACCEPT"
| stats count() as flows, sum(bytes) as bytes by src_addr, bin(5m)
| sort bin asc
```

```text
# 4. Is the egress path to the payment provider healthy?
source vpc-flow-logs
| filter dst_addr = PAYMENT_PROVIDER_RANGE
| stats count() as flows, countif(action="REJECT") as rejects,
        sum(bytes) as bytes by bin(1m)
| sort bin asc
```

```text
# 5. Connection volume per source - hunting port or table exhaustion
source vpc-flow-logs
| filter src_addr in APP_SUBNET
| stats count_distinct(src_port) as distinct_ports by src_addr, bin(1m)
| sort distinct_ports desc
```

Four things to know before you rely on them. Flow logs are **sampled and aggregated over an interval**, typically one to ten minutes, so they show flows rather than packets and they arrive with delay — they are not a packet capture and will not show you a retransmission. They cover traffic that reaches the network interface, so traffic dropped by a *subnet-level* rule may appear differently from traffic dropped at the instance level; know which your provider records. They can be enormous on a busy subnet, so filter tightly and bound the window. And they capture addresses, not application context — you will be translating addresses to instances constantly, which is much easier if your instances are consistently tagged.

Alongside flow logs, every provider offers a **connectivity test** or **reachability analyzer** tool that evaluates the configured path between two resources and reports where it would be blocked, without sending traffic. It is fast, safe to run during an incident, and it answers "is this even allowed" definitively. Reach for it before you start editing rules.

| Concept | Amazon | Azure | Google Cloud |
| --- | --- | --- | --- |
| Flow records | VPC Flow Logs | NSG flow logs, VNet flow logs | VPC Flow Logs |
| Instance-level filtering | Security group (stateful) | Network security group (stateful) | VPC firewall rule (stateful) |
| Subnet-level filtering | Network ACL (stateless) | NSG on subnet | Hierarchical firewall policy |
| Path analysis tool | Reachability Analyzer | Network Watcher connection troubleshoot | Connectivity Tests |
| Live capture | Traffic Mirroring | Packet capture | Packet Mirroring |
| Outbound translation | NAT Gateway | NAT Gateway | Cloud NAT |
| Private service access | VPC endpoint | Private Endpoint | Private Service Connect |

## Working a fault safely

Three disciplines separate a professional isolation from thrashing.

**Change one thing at a time, and write down what you changed.** Two simultaneous changes make the result uninterpretable, and one of them is now an undocumented modification to production that nobody will remember next week. Keep a running list: time, what you changed, why, what happened, whether you reverted it.

**Prefer read-only probes.** Resolve a name, run the connectivity analyzer, query flow logs, read a metric, check a health endpoint. Every one of those is free and reversible. Restarting a process destroys the evidence in its memory and often clears the symptom without revealing the cause; adding capacity masks a saturation problem; widening a firewall rule "to test" is a security change made under time pressure that will still be there in a year. If you must do something invasive, say so out loud, get agreement, and record it. Lesson 08 covers when the balance tips toward acting before you understand — during an outage it often does — but the rule holds that you record it either way.

**Ask what changed.** Deployments, configuration changes, scaling actions, certificate rotations, quota changes, dependency incidents, and traffic shifts. A fault with a sharp start time almost always has a change within thirty minutes of it. This question resolves more incidents than any tool.

## A worked isolation

14:12. Reports that checkout fails intermittently. Roughly one attempt in four returns an error; the rest succeed normally. Started around 13:50.

**Shape the symptom.** Intermittent, a specific fraction, same for every customer. "Errors on some requests, fine on others" points at one bad member of a pool. The fraction is a strong hint: one in four failing across a pool of four instances would be exactly one instance.

**Confirm scope.** Group the error ratio by instance. Three instances at 0.1 percent, one at 96 percent. The bisection is nearly over already and it took one query. Note that the load balancer has not removed the bad instance, which tells you its health check is passing — so whatever is broken is not on the health-check path.

**Which layer?** Read the failing requests on that instance. They error at the point of writing an order record, with a message about being unable to create a temporary file. That is a storage symptom, not the network symptom the word "intermittent" first suggested.

**Confirm at the resource.** Disk used on `/var/lib/app` is 100 percent on that instance and 61 percent on the other three. Free inodes are fine, so it is bytes. The metric shows a steady climb starting at 09:30 and hitting the ceiling at 13:47 — three minutes before the reported start, which is a satisfying alignment.

**Why did it fill?** The application log directory on that instance holds four days of files where the others hold one. Log rotation stopped running on that host. The rotation job's own log shows it failing since a configuration change on the 11th.

**Why only that instance?** The change on the 11th was applied by hand during a previous incident and never made it into the configuration management that rebuilt the others. That is the contributing cause, and it is the part that matters for lesson 09.

**Why did nothing alert?** The disk alert was set at "above 90 percent," which was true for eleven minutes before failures began. Nobody was paged because it was ticket severity. A time-to-exhaustion alert of the kind lesson 06 describes would have fired hours earlier, when the fill rate first made the outcome predictable.

Notice the pattern. The symptom said "network." The table said "one bad pool member." The evidence said "storage." The cause said "configuration drift." Following the evidence rather than the first instinct took about eight minutes, and every step is written down and reproducible.

## Practice

Use the storefront, its request-path map from lesson 02, and its telemetry from lessons 03 through 06.

**Exercise 1 — Complete the path map.** Extend the map to name, for each hop, the three isolation questions and the exact signal, query, or command you would use to answer each. Include DNS, TLS termination, health checks, the private path to the database, and the egress path to the payment provider. This becomes your isolation checklist.

**Exercise 2 — Flow log queries.** Write the five flow-log queries above against your own subnet and address ranges, plus two more: one that detects whether return traffic is missing for an established outbound flow, and one that identifies the top talkers on a subnet by byte volume. For each, state what result would incriminate the network and what result would exonerate it.

**Exercise 3 — Differential diagnosis.** For each symptom set, name the two most likely causes, the single query or command that best distinguishes them, and the result you expect from each cause.

1. Every request to the storefront times out after exactly 30 seconds. The load balancer reports zero healthy targets. The instances are running and their processes are listening.
2. The service was fine for three hours after a traffic increase, then latency rose fivefold over ten minutes and stayed there. No deployment. CPU utilization is 45 percent with `iowait` at 30 percent.
3. About 2 percent of database connections fail with a timeout, randomly, at all hours, worse at peak. No instance is a standout. Database CPU is 20 percent.
4. Checkout works from instances in one availability zone and fails from the other. Both zones' instances are healthy and identically configured.
5. The application log stops mid-line and resumes ninety seconds later with a startup banner. The load balancer reported the instance unhealthy for that period. No error precedes the gap.

**Exercise 4 — Run an isolation.** In a sandbox account or a lab environment, break something on purpose and work it. Good candidates: remove a firewall rule permitting the application tier to reach the database; fill a data volume; point a name at the wrong address; make the health check depend on a dependency and then stop the dependency. Have a peer break it without telling you which. Work the fault to a named cause using only telemetry and read-only probes, keeping a timestamped log of every step, every query, and every hypothesis you eliminated. Target: cause identified in under twenty minutes.

**Exercise 5 — Write the isolation record.** From your exercise 4 log, write the record a reviewer would read: the symptom as first reported, the path map with the hop where the fault sat, each hypothesis with the evidence that eliminated it, the confirmed cause, the evidence that confirms it, and what you would check to be certain. Then add the two questions you should have asked earlier and did not.

**Exercise 6 — Close the loop.** For the fault you isolated, state which existing alert should have caught it and did not, and write the corrected rule using the method from lesson 06. If no alert covers it at all, write a new one and say why it did not exist before.
