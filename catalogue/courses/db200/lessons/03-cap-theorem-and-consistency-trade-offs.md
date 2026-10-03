---
lesson_id: db200-03
course_id: db200
pathway: software-developer
title: CAP Theorem and Consistency Trade-offs
order: 3
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Explain the consistency and availability trade-offs described by CAP
---

## The problem CAP is about

Every store in the last lesson replicates. Your data exists on more than one machine, because one machine dies, one data center loses power, and one disk fails silently at 3am. Replication is not optional at any serious scale.

The moment there is more than one copy, a question appears that had no meaning in a single-node PostgreSQL: **what happens when the copies cannot talk to each other?**

That situation is a **network partition**. It is not a hypothetical. A switch fails, a cable is cut by a backhoe, a cloud region loses its interconnect, a misapplied firewall rule drops traffic between two subnets, or — most commonly and most annoyingly — the network is not down but is slow enough that nodes time each other out and *believe* they are partitioned. The nodes are all alive. Each side can still be reached by clients. They simply cannot reach each other, and neither side can tell the difference between "the other half is unreachable" and "the other half is dead."

```text
        clients                          clients
           |                                |
        [ node A ] ---- X  network  X ---- [ node B ]
        [ node C ]         split            [ node D ]
```

A write arrives at node A. Node A cannot reach node B. It has exactly two options and there is no third:

1. **Accept the write anyway.** Node A stays available. Node B now serves stale data to its own clients, and when the network heals the two halves have diverged and something has to reconcile them.
2. **Refuse the write.** The data stays consistent everywhere, because nowhere accepted a change that could not be propagated. The client gets an error or a timeout. From the user's point of view, the system is down.

That is the whole of CAP, before any of the formalism. During a partition, you either serve possibly-wrong answers or you serve no answer. There is no configuration flag that gets you both, and any vendor implying otherwise is describing how *rare* their partitions are, not how they escaped the choice.

## Stating it properly

The theorem, proved by Gilbert and Lynch in 2002 from a conjecture of Eric Brewer's, uses three terms that are narrower than their English meanings. Getting the definitions right is most of understanding it.

**Consistency (C)** here means *linearizability*: every read sees the most recent completed write, as if there were a single copy of the data and all operations happened one at a time in some order everyone agrees on. This is not the C in ACID. ACID's C is "the database never violates your declared constraints." CAP's C is about agreement between replicas. Two different ideas, one unfortunate letter, and confusing them is the single most common error in these conversations.

**Availability (A)** means every request to a **non-failing** node gets a non-error response, in finite time. Note what that excludes: a node that has crashed is not a counterexample, and "responded slowly" is treated as not having responded at all.

**Partition tolerance (P)** means the system keeps operating when the network drops or delays messages between nodes arbitrarily.

The theorem: **you cannot have all three simultaneously.** You must give one up.

And here is the part that turns it from trivia into a decision framework: **P is not a choice you get to make.** Networks partition. If you have more than one node, you will have partitions, and a system that requires the network to be perfect is a system that breaks the first time it is not. So "CA" is not a real category — it describes a single-node database, or a distributed system that happens to be unpartitioned so far and has no plan for the day it is.

What you actually choose is what to do **during** a partition:

- **CP** — preserve consistency, sacrifice availability. The minority side stops accepting writes, and often stops accepting reads too. Clients see errors until the partition heals. Examples: MongoDB with a replica set, HBase, etcd, ZooKeeper, and Postgres with synchronous replication.
- **AP** — preserve availability, sacrifice consistency. Every side keeps accepting reads and writes. The copies diverge and are reconciled later. Examples: Cassandra, Riak, DynamoDB in its eventually consistent mode, and DNS, which is the AP system you have used every day of your life without noticing.

A useful reframing: CP systems fail *loudly and correctly*, AP systems fail *quietly and completely*. Which failure mode your business can absorb is a business question, not a technical one, which is exactly why this lesson is tagged to a feasibility competency rather than a design one.

## What each choice looks like in practice

Abstractions are easy to nod at. Make each one concrete with the same scenario: a two-region deployment, and the link between regions goes down for four minutes.

**A CP store — MongoDB replica set.** A replica set has one primary that takes writes and secondaries that replicate from it. Elections require a majority. With three nodes split 2–1, the majority side keeps or elects a primary and carries on. The lone minority node steps down to secondary and **refuses writes**. Its clients get errors. Four minutes of write failures in that region, and when the link heals, that node catches up from the majority's log. Nothing was lost and nothing conflicted. The cost was measured in failed requests.

Note what a majority requirement implies: a two-node cluster is worse than useless for CP, because a 1–1 split has no majority and *both* sides stop. This is why you see odd node counts and arbiter nodes everywhere in CP systems.

**An AP store — Cassandra.** Every replica accepts writes. During the four minutes, region A records `status = "shipped"` and region B records `status = "cancelled"` for the same order, and both succeed. Both regions serve their own answer to their own users. Clients elsewhere may read either. When the link heals, Cassandra reconciles — by default with last-write-wins on the cell timestamp, so one of those two updates silently disappears. Nobody got an error. Somebody's order is wrong.

That last sentence is the honest summary of AP, and you should say it out loud in design reviews: **AP does not mean nothing goes wrong. It means nothing tells you.** The failure moves from your error dashboard into your data, where it surfaces weeks later as a support ticket that nobody can reproduce.

Neither choice is the smart one in general. Refusing a shopping-cart addition because a switch died is a bad trade — take the write, sort it out later, the worst case is a duplicate item. Accepting two conflicting withdrawals from the same account is a much worse trade — refuse, and let the customer retry. Same theorem, opposite answers, because the cost of being wrong is different by three orders of magnitude.

![A two-region cluster during a network partition, showing the CP path where the minority side refuses writes and the AP path where both sides accept writes and diverge](./img/cap-partition-choice.png)

## The trade you make when nothing is broken

CAP only describes behavior during a partition, and partitions are rare. This makes CAP an incomplete guide, because it says nothing about the other 99.9% of the time — which is where nearly all of your actual latency and cost live.

Daniel Abadi's **PACELC** extends it and is the more useful formulation for real decisions:

> **If** there is a **P**artition, choose between **A**vailability and **C**onsistency; **E**lse, choose between **L**atency and **C**onsistency.

The "else" branch is the one you feel every day. If a write must be acknowledged by a majority of replicas before it returns, and those replicas are in three regions, then every write pays a cross-region round trip — perhaps 80 to 150 milliseconds — forever, partition or not. If it only has to reach one local replica, the write returns in a millisecond and the other regions catch up shortly after.

So the classifications get longer and more honest. Cassandra is PA/EL: available under partition, low-latency otherwise, consistency last both times. MongoDB is harder to label, and published classifications disagree. Abadi's original 2012 paper called it PA/EC. Recent versions default to majority-acknowledged writes, which behave much more like PC/EC, but default reads can still return data that is later rolled back. The honest answer depends on the read and write concerns you configure, and that's the general lesson: these labels describe configurations, not products. DynamoDB lets you pick per request. Google Spanner is PC/EC and buys back the latency with atomic clocks and satellite time sync, which is an excellent illustration of the principle that you can beat these trade-offs only by spending an implausible amount of money.

When you are asked "is this design feasible," PACELC is the sharper question, because latency is a number you can put in a requirements document and consistency-under-partition is not.

## The consistency spectrum

"Consistent or eventually consistent" is a false binary. There is a ladder between them, and knowing the rungs lets you ask for exactly as much as you need instead of paying for the top.

**Strong / linearizable.** Every read sees the latest committed write. Simplest to reason about, most expensive to provide.

**Sequential and causal consistency.** Everyone sees operations in the same order, or at least in an order that respects cause and effect: if a reply was written after a post, nobody ever sees the reply before the post. Causal consistency is remarkably close to "what users expect" at much less than the cost of linearizability.

**Read-your-writes.** You always see your own updates, even if others do not yet. This one guarantee removes most of the perceived weirdness of eventual consistency, because the person most likely to notice a stale read is the person who just made the change.

**Monotonic reads.** Once you have seen a value, you never see an older one. Without this you get the genuinely maddening bug where refreshing a page toggles between two versions because your requests are landing on different replicas.

**Eventual consistency.** If writes stop, all replicas converge, eventually. No promise about when, and no promise about what you see in the meantime.

The practical skill is picking the lowest rung that keeps your users out of trouble, per operation rather than per system. Within one application: the account balance on the transfer screen needs strong consistency; the same balance on the marketing dashboard is fine an hour stale; the "your profile has been updated" page needs read-your-writes and nothing more.

## Tuning it yourself: quorums

Many stores let you buy consistency per request instead of per cluster, using three numbers:

- **N** — how many replicas hold each piece of data.
- **W** — how many must acknowledge a write before it returns success.
- **R** — how many must respond to a read before it returns.

The rule is that **W + R > N gives you strong consistency**, because the write set and the read set must overlap in at least one replica, and that replica has the latest value.

```text
N = 3

W=3, R=1   fast reads, slow writes, no writes during any partition
W=1, R=3   fast writes, slow reads
W=2, R=2   quorum both ways — strong, and survives one node down
W=1, R=1   fastest, eventually consistent, survives almost anything
```

`W=2, R=2` with `N=3` is the workhorse setting for a reason: `2 + 2 > 3`, so reads are strongly consistent, and losing any single node still leaves two, so both reads and writes continue. Losing two nodes stops writes, which is the CP behavior appearing exactly where the arithmetic says it should.

Cassandra spells these as consistency levels — `ONE`, `QUORUM`, `LOCAL_QUORUM`, `ALL` — set per statement, so one query in your application can be strongly consistent and the next one not. DynamoDB offers a `ConsistentRead` flag that costs double the read capacity units, which is a rare case of a vendor pricing the trade-off directly in dollars and telling you the number. MongoDB expresses the same idea as write concern (`w: "majority"`) and read concern (`"majority"`, `"linearizable"`, `"local"`).

Two things quorums do not give you. They do not give you transactions: two separate quorum writes are still two separate operations, and a reader can observe one without the other. And they do not remove the latency cost — `QUORUM` across three regions means every operation waits for a second region.

## When copies disagree: conflict resolution

An AP system will have divergent copies, so it needs a rule for reconciling them. There are only a few, and each leaks into your application design.

**Last-write-wins.** Compare timestamps, keep the newer. Simple, and the default in Cassandra and DynamoDB. It silently discards the loser, and it depends on clocks across machines agreeing — which they do not, quite, so a node with a clock drifted two seconds into the future can win every conflict it participates in.

**Vector clocks / sibling values.** The store detects that two writes were concurrent rather than ordered, keeps both, and hands both to your application to resolve. Nothing is lost, and now your code has a branch for "what if there are two carts" that you must actually write.

**CRDTs** — conflict-free replicated data types. Structures designed so that merging is deterministic and order-independent: a grow-only counter, an add-wins set. Merges are automatic and correct, but only certain data types fit the model.

**Application-level merge.** You own it. The classic worked example is Amazon's shopping cart: merge the two carts by union, so a partition can only ever cause an item to reappear after being removed. That is deliberate — Amazon decided a resurrected item is a smaller loss than a dropped one, because the customer can remove it again and cannot buy something they never saw.

Notice the pattern in every one of those. Somebody made a domain decision about which kind of wrong is cheaper. That decision cannot be made by the database, and it cannot be made by you alone; it is made with the product owner, in the language of customer impact.

## Bringing this to a feasibility conversation

You will not usually be the person who decides the data store. You will be in the room while it is decided, and your value there is the ability to convert this material into consequences that non-engineers can weigh. Three dimensions, and you should be ready to speak to all three.

**Technical feasibility.** Which operations genuinely need linearizable reads, and which are fine at some lower rung? What is the smallest set of strongly consistent operations that keeps the product correct? Where can a partition split the system — regions, availability zones, one rack? What is the reconciliation rule when copies diverge, and does the domain even have a sensible one? If the answer to that last question is "there is no acceptable way to merge two versions of this record," you have just proved the workload is CP, and that is a finding worth stating plainly.

**Operational feasibility.** Who is paged when the cluster loses quorum, and do they know what to do? A CP system's failure is an outage, which is loud, well-understood, and usually recoverable by waiting. An AP system's failure is data divergence, which requires a person who understands the reconciliation model to diagnose weeks later. Ask whether the team has that person, whether the store is managed or self-run, and how a version upgrade is performed. A design that is technically excellent and operationally unstaffable is not feasible.

**Economic feasibility.** Strong consistency across regions costs money in three places: capacity, because you need enough replicas for a majority and often an odd node that stores nothing useful; latency, which converts into conversion rate on anything customer-facing; and support, because the alternative — eventual consistency — generates tickets that are expensive to investigate. Put numbers on the ones you can. "Cross-region quorum adds roughly 90ms to every checkout write, and we know from the last release that 100ms costs about 1% of completed checkouts" is an argument that a business stakeholder can act on. "Cassandra is AP" is not.

The output of that conversation is a written recommendation naming the consistency requirement per operation, the failure behavior the business is accepting, and the cost of the alternative that was rejected. You will write exactly that document in this course's closing project.

Two failure modes to avoid when you are the one making the case. Do not treat CAP as a menu of three from which you pick two — you have one real choice, and it only applies during partitions. And do not let the conversation stay at the level of the whole system; almost no real application has a single consistency requirement, and the most valuable thing you can contribute is usually the observation that four of these eleven operations need strong consistency and the other seven do not.

## Practice

1. Write plain-language definitions of the three CAP terms without looking at this lesson, then compare against it. Pay particular attention to your definition of consistency, and write one sentence distinguishing CAP's C from ACID's C.
2. Explain in a short paragraph why "CA" is not a meaningful choice for a system running on more than one machine.
3. For each scenario, state CP or AP, name the consistency rung you would ask for, and give the one-sentence business justification.
   - Recording a debit against a bank account balance.
   - Recording a "like" on a social post.
   - Reserving the last seat on a flight.
   - Serving a product catalog page.
   - Appending to an audit log used in regulatory reporting.
   - Updating a user's display name.
4. With `N = 5`, list every `W` and `R` combination that gives strong consistency. For each, state how many node failures writes survive and how many reads survive. Then say which combination you would choose for a write-heavy workload and why.
5. A payments team proposes a three-region active-active deployment on Cassandra with consistency level `LOCAL_QUORUM`. Write a one-page feasibility note for the tech lead: what works, what specifically breaks during a cross-region partition, what it would cost to fix, and what you would recommend instead. Cover technical, operational, and economic angles in separate paragraphs, and end with a recommendation rather than a list of concerns.
6. Find the documented default consistency behavior for two stores from different families, using vendor documentation, and cite the pages. Note for each whether the default is the safe choice or the fast one, and what happens to an application whose author never changed it.

**Deliverable:** a `consistency-notes.md` file containing your answers to steps 1 through 4 and step 6, plus a separate `feasibility-note.md` holding the one-page note from step 5.

## Check your understanding

1. In one sentence each, how does CAP's C differ from ACID's C?
2. A three-node MongoDB replica set splits 2–1. What happens on each side?
3. With `N = 3`, does `W = 2, R = 1` give you strong consistency? Why or why not?
4. Why does Cassandra's default conflict resolution make clock drift a correctness problem?

*Answers:* (1) CAP's C means every replica agrees, so every read sees the latest write (linearizability). ACID's C means the database never violates your declared constraints. (2) The two-node side keeps or elects a primary and accepts writes. The lone node steps down and refuses writes until the partition heals. (3) No. `2 + 1 = 3` is not greater than 3, so a read can land on the one replica that missed the write. (4) Last-write-wins compares timestamps from different machines, so a node whose clock runs ahead wins conflicts it should lose.
