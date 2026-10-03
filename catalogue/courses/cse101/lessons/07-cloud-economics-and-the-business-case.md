---
lesson_id: cse101-07
course_id: cse101
pathway: cloud-support-engineer
title: Cloud Economics and the Business Case
order: 7
kind: lesson
competency_ids:
  - D2-S1-C02
  - D2-S1-C03
objectives:
  - Estimate what a cloud workload costs and explain the business case for
    running it in the cloud
---

## Why the bill is a technical document

A cloud invoice is not a finance artifact that happens to mention servers. It is a direct readout of engineering decisions — mostly two of them: which compute abstraction you chose, and which storage class you put the data in. Everything you learned in lessons 03 and 05 has a price attached, and this lesson is where the two get priced.

That is why cost is a support engineer's problem rather than someone else's. When a bill jumps 40%, the person who can answer why is the person who understands that a container service scaled to sixty replicas overnight, or that versioning was enabled on a bucket six months ago and nothing ever expired the old versions. Nobody in finance can find that. You can.

The structural change from owning hardware is worth stating precisely. Buying a server is **capital expenditure**: a large payment up front, depreciated over three to five years, sized for the peak load you expect to reach in year three and therefore idle for most of years one and two. Cloud is **operating expenditure**: no payment up front, a bill every month proportional to what you used, and the ability to stop paying by deleting the thing. The money moves from a purchasing decision made once by a committee to a thousand small decisions made continuously by engineers — which is faster, and which is also how organizations wake up to a bill nobody chose.

## The meters

Almost everything on a cloud bill is one of six meters. Learn these and an unfamiliar pricing page becomes readable.

| Meter | Unit | Driven by |
| --- | --- | --- |
| Compute time | vCPU-second, instance-hour, GB-second | Size × how long it runs |
| Storage volume | GB-month | How much you keep × what class it is in |
| Requests / operations | per 1,000 or per million | How chatty the application is |
| Data transfer | GB moved | Where the bytes go — especially out to the internet |
| Provisioned capacity | IOPS, throughput, connections | Reserved performance, billed whether used or not |
| Licences and add-ons | per hour, per seat | Commercial software, support plans, premium features |

Three properties of this list cause most of the confusion in practice.

**Storage is a rate, not a purchase.** A gigabyte-month is a gigabyte held for a month. 100 GB held for half a month costs the same as 50 GB held for the full month. This is why "we deleted it, why is it still on the bill" has an honest answer: you paid for the time it existed.

**Data transfer is directional and asymmetric.** Getting data in is nearly always free. Getting data out to the internet is nearly always the most expensive gigabyte on the bill. Between zones in one region is usually cheap; between regions is more; out to the public internet is most. A media-heavy application's bill is often more egress than anything else, and the estimate that missed it was off by a factor of three.

**Provisioned capacity bills whether you use it or not.** A stopped virtual machine's disk still costs. A reserved database's provisioned IOPS still cost. Idle allocated things are the single largest source of waste in the industry, and they are invisible in a dashboard that only shows utilization.

### Pricing models for compute

The same compute can be bought five ways, and the choice is worth a large multiple.

| Model | How it works | Discount | Risk | Fits |
| --- | --- | --- | --- | --- |
| On-demand | Pay per second, no commitment | none (baseline) | none | Spiky, unknown, short-lived |
| Reserved / committed use | Commit to a quantity for 1 or 3 years | 30–60% | You pay even if unused | Steady baseline load |
| Spot / preemptible | Bid on spare capacity | 60–90% | Reclaimed with seconds of notice | Batch, fault-tolerant, restartable |
| Serverless / consumption | Pay per invocation and per millisecond | n/a | Cost scales with traffic, unbounded | Spiky, event-driven, idle-heavy |
| Dedicated / bare metal | Whole physical host | premium | Cost | Licensing or compliance requirements |

The competent pattern in most organizations is a blend: commit to the baseline you are confident about, serve the variable middle on-demand, run anything interruptible on spot, and use serverless for the work that would otherwise sit idle. Committing 100% of current usage for three years is not thrift, it is a bet that your architecture will not change — and it will.

Serverless deserves a specific warning because it is where beginners get the arithmetic wrong in both directions. At low volume it is close to free and beats a virtual machine that must run all day. At high steady volume, per-invocation pricing keeps charging while a fixed instance stops. There is a crossover point, it is computable, and computing it is a normal part of the design conversation. And because a function's CPU allocation usually scales with its configured memory, raising memory can *lower* total cost when it shortens the duration by more than the ratio — one of the few genuinely counterintuitive results in cloud pricing.

### Pricing consequences of storage class

Lesson 05 taught the classes; here is the money. Colder classes cut the gigabyte-month rate substantially — commonly to roughly half for infrequent access and a small fraction for archive — while adding three charges that do not exist in the hot class: a per-gigabyte retrieval fee, a minimum storage duration billed regardless of early deletion, and a minimum billable object size.

The practical rule from lesson 05 restated as arithmetic: tiering pays when `size × months_kept` is large and `reads_per_month` is near zero. When either condition fails, tiering costs money. Ten million tiny objects moved to archive is a bill increase. A 40 TB archive read once for an audit can produce a retrieval charge larger than the annual saving.

## Estimating a workload

An estimate is a table of line items with an arithmetic trail. It is not a number, and a number with no trail cannot be corrected, defended, or reused.

The method has five steps:

1. **Inventory the resources.** Every component the workload needs, including the boring ones — disks, load balancers, log storage, backups, the monitoring service, the support plan.
2. **Quantify each one in its meter's unit.** Hours running, gigabyte-months held, requests per month, gigabytes leaving.
3. **Apply published prices** for a specific region, and record the region and date. Prices differ by region and change over time; an undated estimate rots.
4. **Sum, then add a contingency** of 15–25% for the things you forgot. You will have forgotten something; everyone does, and it is usually egress or logs.
5. **State assumptions explicitly** — traffic volume, growth rate, retention period, hours of operation. The assumptions are where the argument will actually happen.

### Worked estimate

A small business runs an internal order-management application. The requirements: about 120 concurrent users during business hours, a database of roughly 200 GB, 6 TB of scanned order documents growing 400 GB per month, and about 500 GB of outbound traffic per month as staff download documents. Business hours are 12 hours a day, weekdays. Uptime expectations are ordinary — an hour of downtime is annoying, not catastrophic.

The design, reading straight off lessons 03 and 05: containers on a managed platform for the application, because it is a long-running request/response service; a managed relational database, because nobody here should be patching a database engine; object storage for documents, tiered because they are read heavily for a month and then almost never; and a load balancer in front.

| Line item | Quantity | Unit price | Monthly |
| --- | --- | --- | --- |
| App containers, 2 × 2 vCPU / 4 GB, always on | 1,460 instance-hours | $0.10 / hour | $146.00 |
| App containers, burst replica, 6 h/weekday | 130 instance-hours | $0.10 / hour | $13.00 |
| Managed database, 2 vCPU / 8 GB, always on | 730 hours | $0.28 / hour | $204.40 |
| Database storage, provisioned | 300 GB-month | $0.12 / GB-month | $36.00 |
| Database backups, 7-day retention | 300 GB-month | $0.09 / GB-month | $27.00 |
| Object storage, hot (last 30 days) | 400 GB-month | $0.023 / GB-month | $9.20 |
| Object storage, infrequent (days 31–365) | 4,400 GB-month | $0.0125 / GB-month | $55.00 |
| Object storage, archive (older) | 1,200 GB-month | $0.004 / GB-month | $4.80 |
| Storage requests | 3M reads, 0.4M writes | $0.0004 / 1k reads, $0.005 / 1k writes | $3.20 |
| Load balancer | 730 hours | $0.025 / hour | $18.25 |
| Data transfer out to internet | 500 GB | $0.09 / GB | $45.00 |
| Log and metric storage | 40 GB ingested | $0.50 / GB | $20.00 |
| **Subtotal** | | | **$581.85** |
| Contingency at 20% | | | $116.37 |
| **Estimated monthly total** | | | **$698.22** |

The prices above are illustrative round numbers in the right order of magnitude, not quotes; in real work every one is replaced with a figure from a cited pricing page for a named region on a named date.

Now read the table for what it teaches, because that is the actual skill:

- **Compute plus database is 63% of the bill.** Sizing decisions dominate. Right-sizing the database by one step down, if the measurements support it, saves more than every storage optimization combined.
- **Six terabytes of documents cost $69 a month.** Storage is cheap and the tiering saved about $70/month against keeping it all hot — real, but not where the leverage is. Beginners spend a week on storage tiering and never look at the always-on database.
- **Egress is $45 for half a terabyte** — more than the entire archive tier. If staff started downloading 5 TB a month, that line becomes $450 and the shape of the bill changes completely.
- **The burst replica costs $13.** Elasticity is cheap when you actually use it. Running that second replica 24/7 instead would cost $146.

### Now reduce it

With the estimate in hand, the optimization conversation becomes specific rather than a vague instruction to spend less.

**Commit the baseline.** The database and the two application replicas run continuously and will exist in a year. A one-year commitment at roughly 35% off turns $350.40 of always-on compute into about $228 — a $122/month saving for a commitment that carries almost no risk, since the workload is not going away.

**Right-size from measurement.** If the database sits at 15% CPU with comfortable memory, one size down halves that line. If it sits at 75%, leave it alone. This requires the measurement discipline from lesson 03 — a guess in either direction costs money or causes an incident.

**Schedule non-production.** A development environment that mirrors production and runs 168 hours a week can run 50 instead. That is a 70% cut on an environment nobody uses at night, and it is the single easiest saving in cloud, routinely left on the table.

**Tier and expire.** Already done here. Add the noncurrent-version and incomplete-upload rules from lesson 05, which cost nothing and prevent silent accumulation.

**Reduce egress rather than pay for it.** Put a content delivery network in front of repeatedly downloaded documents; cached bytes are cheaper than origin egress and the documents are read many times each in their first month.

**Delete the unused.** Unattached disks, old snapshots, idle load balancers, forgotten test instances, log retention set to "forever" by default. This is unglamorous, it is usually 5–15% of a bill, and nobody does it unless someone is assigned to.

Applied together, those move the estimate from roughly $700 to somewhere near $500 without changing what the application does. That is the number worth reporting: not "we optimized," but "we removed $200 a month, here is which line item each dollar came from."

## Governance: seeing the money before the invoice

Three mechanisms, in the order you should implement them.

**Tagging or labelling.** Every resource carries key-value metadata — environment, team, application, cost centre. Cost reports then group by those keys, and "which team spent this" becomes answerable. Tags are only useful if they are complete, so enforce them: most platforms can refuse creation of an untagged resource or flag it automatically. Retrofitting tags across a sprawling account is miserable work, which is the argument for starting on day one.

**Budgets and alerts.** A threshold with a notification, ideally with a forecast so you learn on the 8th that the month is trending 60% over, rather than on the 1st of the next month. Set them per account and per project. A budget alert is the cheapest incident detection in cloud, and it catches things no technical monitor does — a runaway retry loop, a misconfigured autoscaler, a cryptomining process on a compromised instance.

**Showback and chargeback.** Showback reports each team's spend without moving money; chargeback actually bills it internally. Showback is usually enough, because most overspending is unawareness rather than indifference. Teams that can see their number tend to fix it.

### Reading a cost anomaly

The routine when a bill jumps, in order:

1. **Which service** grew? Group the bill by service and compare to last month.
2. **Which meter** within that service — compute time, storage volume, requests, egress?
3. **Which resource, account, or tag** — the grouping that makes the change one line rather than many.
4. **When** did it start? Daily granularity turns "this month is high" into "it started on the 14th at 2 p.m.," and that timestamp usually matches a deployment or a configuration change.
5. **What changed then?** Correlate with deployments, autoscaling events, and the audit log from lesson 06.

Most anomalies resolve to a small set of causes: a scaling rule that scaled and never scaled back; a forgotten large resource created for a test; a data-transfer pattern that changed, often because something moved to another region; a retry storm hammering a metered API; versioning or logging enabled without expiry; or a spot workload that fell back to on-demand.

## The business case, honestly

The argument for cloud is usually made badly — "it's cheaper" — and that claim is often false. Here is the defensible version.

**Elasticity has real value when demand is variable.** A workload that needs ten machines for four hours a month and one otherwise costs a fraction of the hardware you would buy for the peak. If demand is flat, this benefit is zero and you should not claim it.

**Speed of provisioning is usually the largest benefit and it is rarely measured.** Minutes instead of a procurement cycle means experiments that would never have been approved get run. The value shows up as products shipped earlier, not as a line on the invoice.

**Capital is not tied up.** No large up-front purchase, no three-year depreciation on hardware chosen against a forecast that was wrong.

**Managed services remove work you were doing badly.** A managed database costs more per hour than a self-installed one on a raw instance, and it is usually cheaper in total because patching, backup verification, failover, and the 3 a.m. recovery all disappear. Compare total cost of ownership including labour, or the comparison is dishonest.

**Global reach and resilience are purchasable.** Multiple regions and zones are a checkbox and a bill instead of a construction project.

And the counter-arguments, which you should raise yourself before someone else does:

- **Steady, predictable, high load can be cheaper on owned hardware** at sufficient scale. Several well-known companies have moved workloads back for exactly this reason and published the numbers.
- **Egress fees make data-heavy workloads expensive** and make leaving expensive — which is part of why the fees exist.
- **Data gravity is real.** Once petabytes live in one provider, the compute follows, because moving the data costs more than the compute does.
- **Cost is now a continuous engineering concern.** Nobody could accidentally buy forty servers on a Tuesday. Anybody can accidentally launch forty instances.
- **Skills and tooling are a real, recurring cost** that a hardware comparison usually ignores.

A business case that names both columns is believed. One that lists only benefits is discounted by whoever reads it, and rightly.

## Practice

**Part 1 — Build an estimate.** A veterinary practice with four clinics wants to move its records system to the cloud. It has 60 staff logging in during a 10-hour day, a 400 GB database, 12 TB of imaging files growing 500 GB per month (each image read heavily for two weeks, then rarely, but must be retrievable within seconds for seven years), and about 1 TB per month of outbound traffic.

Produce a full line-item estimate in the format used in this lesson. Use **real published prices** from any one provider, and cite the pricing pages and the date. Your table must include compute, database, both database and object storage, requests, load balancing, egress, logging, backups, and a contingency. Below it, list every assumption you made, and state which single assumption, if wrong, would change the total the most.

**Part 2 — Optimize it.** Produce a second table showing at least five specific reductions to your part 1 estimate. Each row must name the change, the line item affected, the dollar saving, and the risk or trade-off accepted. At least one must be a compute-abstraction or sizing change and at least one a storage-class or lifecycle change. Give the new total and the percentage reduction. Then name one saving you deliberately did **not** take and explain why the risk was not worth it.

**Part 3 — Find the crossover.** For a single API endpoint that takes 200 ms per request and needs 512 MB of memory, compute the monthly cost as a serverless function and as a continuously running container, at 10,000, 1,000,000, and 50,000,000 requests per month. Use real published prices. Show the arithmetic, state the approximate crossover volume, and write two sentences on what other factors besides price should influence the choice at a volume near the crossover.

**Part 4 — Investigate an anomaly.** A customer's bill went from $2,100 to $5,800 in one month. You have access to the cost console with grouping by service, meter, resource, tag, and day. Write the investigation as an ordered list of the exact queries you would run, and for each one state what result would confirm or eliminate a hypothesis. Then write the four-sentence update you would send the customer after the first hour, before you have the answer. That update must say what you know, what you do not, what you are doing, and when you will report next.

**Part 5 — Write the business case.** One page, for the veterinary practice, arguing for or against the migration. It must include: the estimated monthly run cost from parts 1 and 2, a comparison against the total cost of ownership of buying servers for four clinics (state your labour and hardware assumptions), the three strongest non-cost benefits with the specific way each applies to *this* business, at least two honest risks or drawbacks, and a clear recommendation. No jargon a practice manager would need explained — lesson 09 is about that skill, and this is where you start practising it.

**Deliverable:** one document containing both estimate tables with cited prices, the crossover arithmetic, the anomaly investigation plan with its customer update, and the one-page business case.

## Check your understanding

1. In the worked estimate, which two lines would you investigate first if asked to cut the bill by 20%, and why those? *(Compute and the managed database — together about 63% of the subtotal.)*
2. A customer deletes 2 TB on the 15th and asks why it is on this month's invoice. What is the one-sentence answer? *(Storage is billed in gigabyte-months, so they paid for the half-month the data existed.)*
3. Why is committing 100% of current usage for three years risky even when the workload is steady? *(It bets the architecture will not change; any right-sizing or move to another abstraction leaves the commitment paying for unused capacity.)*
