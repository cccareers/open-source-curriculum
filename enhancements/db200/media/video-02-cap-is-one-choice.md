---
course_id: db200
media_id: db200-v02
type: video-script
title: "CAP Is One Choice, Not Pick Two"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - db200-03
objectives:
  - Explain the consistency and availability trade-offs described by CAP
competency_ids:
  - D3-S1-C03
---

## Purpose

After watching, the learner can explain why the only real CAP decision is what a system does during a partition, and can state a CP or AP choice per operation in business terms.

## Audience and prerequisites

Learners starting lesson 03. Assumes they know what a replica is.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard: the familiar CAP triangle with "pick two" scrawled under it. Presenter crosses out "pick two". | "You've probably seen this triangle with 'pick any two' under it. That framing causes more bad design reviews than anything else in distributed data. Let's replace it with something accurate." |
| 0:25 | Draw two boxes, "Node A" (Region East) and "Node B" (Region West), joined by a line. Clients on each side. | "Two copies of the events board's data, one in each region. Normally they replicate to each other, and everyone sees the same thing." |
| 0:50 | Draw a jagged X through the line. Label: "partition — both nodes alive". | "Now the link between them fails. Both nodes are running. Both can reach their own clients. They just can't reach each other. That's a partition, and on real networks it isn't rare enough to ignore." |
| 1:20 | A write arrives at Node A: "RSVP: Dana → Intro to Soldering". Two arrows branch: "accept" and "refuse". | "A write lands on Node A. It can't tell Node B. Node A has exactly two options. Accept the write, or refuse it. There's no third box." |
| 1:50 | Under "accept": Node B still shows the old seat count. Label "AP: available, may be wrong". | "Accept, and Node A stays available. But Node B's clients see the old seat count, and when the link heals, the two copies have to be reconciled. That's the AP choice." |
| 2:20 | Under "refuse": client gets an error. Label "CP: correct, may be unavailable". | "Refuse, and nothing can disagree. But Dana gets an error, and from her side the system is down. That's the CP choice." |
| 2:50 | Write "C = linearizable (every read sees the latest write)" and "≠ ACID's C (constraints hold)". | "One definition matters a lot here. The C in CAP means every replica agrees, so every read sees the latest write. It isn't the C in ACID, which is about your constraints. Same letter, different idea." |
| 3:20 | Circle P. Write "not optional with >1 node". Cross out "CA". | "Partition tolerance isn't something you choose. If you have more than one machine, partitions will happen. So 'CA' isn't a real option for a distributed system. The only choice is what to do when the partition comes: C or A." |
| 3:55 | Table on board: Operation / Choice / Why. Rows: "Reserve last seat — CP — oversell costs trust", "Like a post — AP — a lost like is harmless", "Update display name — AP + read-your-writes — user must see own change". | "And you make that choice per operation, not per system. Reserving the last seat on a sold-out workshop: refuse during a partition, because overselling is worse than an error. A like on a post: accept it, because a lost like hurts nobody. A display-name change: accept it, but make sure the person who changed it sees the change." |
| 5:00 | Write "PACELC: else → Latency vs Consistency". | "One more thing. CAP only covers partitions, which are rare. The rest of the time, PACELC says you're still trading latency against consistency. Waiting for a majority of replicas in three regions adds a cross-region round trip to every write, every day." |
| 5:45 | Write "AP doesn't mean nothing goes wrong. It means nothing tells you." | "If you remember one sentence from this video, make it this one. In an AP system the failure moves from your error dashboard into your data, where it shows up weeks later as a ticket nobody can reproduce." |
| 6:20 | Recap: three bullets. | "One choice, only during partitions. Make it per operation. Say it in business terms: which kind of wrong is cheaper here?" |
| 6:45 | End card: lesson 03 practice item 3. | "Practice item 3 gives you six operations. Choose CP or AP for each, with one sentence of business justification." |

## On-screen assets and B-roll

- Whiteboard or tablet-drawn illustration; keep drawings to boxes, lines, and labels.
- Optional lower-third with the Gilbert and Lynch 2002 citation when the theorem is named.

## Accessibility

- Captions plus WebVTT. Every drawn label is read aloud as it's written.
- CP and AP branches are distinguished by text labels and position (left/right), not color.
- Provide a text transcript including the final per-operation table.

## Check for understanding

1. Why is "CA" not a real choice for a system on more than one machine? *Answer: partitions will happen, so a system has to decide what to do during one. "CA" only describes a single node, or a system with no plan for partitions.*
2. Is reserving the last seat on a sold-out event CP or AP, and why? *Answer: CP. Refusing during a partition is better than selling the same seat twice.*
3. What does PACELC add to CAP? *Answer: when there's no partition, you still trade latency against consistency.*
