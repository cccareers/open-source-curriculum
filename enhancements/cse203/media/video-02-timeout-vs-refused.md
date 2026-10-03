---
course_id: cse203
media_id: cse203-v02
type: video-script
title: "Timeout Means Blocked, Refused Means Arrived"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cse203-03
objectives:
  - Configure a virtual private cloud with subnets and security groups for a deployed application
competency_ids:
  - D3-S1-C01
---

## Purpose
After watching, the learner can work the six-step connectivity ladder from lesson 03 and tell a routing or security-group block (timeout) from a listening problem (refused) using `curl`, `nc`, and `ss`.

## Audience and prerequisites
Apprentices who have built the lesson 03 two-tier layout. The demo uses that layout: bastion in a public subnet, app instance in a private subnet with nginx on 8080.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Ticket: "I can't reach the server." | "The most common ticket in cloud networking has five words and no detail. Here's how to find the broken layer in under five minutes." |
| 0:15 | Diagram of the two-tier VPC with six numbered checkpoints: DNS, Route, Security group, ACL, Listening, Health. | "Work from the outside in and stop at the first layer that explains the symptom. And watch the clock on every failure — how long it takes to fail is a clue." |
| 0:40 | Terminal on bastion: `time nc -vz 10.42.11.20 8080`. Output after ~2 min: `nc: connect to 10.42.11.20 port 8080 (tcp) timed out`. `real 2m10s`. | "From the bastion to the app on 8080. It hangs, then times out. A timeout means the packet went somewhere and nothing came back. Something dropped it silently. That's routing, a security group, or a network ACL — never the application." |
| 1:20 | Console: `app-sg` inbound rules: `8080 from lb-sg`, `22 from bastion-sg`. | "Check the target's security group. 8080 is allowed from the load balancer's group. The bastion isn't in that group. That's our block — and it's correct design. The bastion has no business on 8080." |
| 1:55 | Add temporary rule `8080 from bastion-sg`, description "temporary — demo, remove today". Re-run `nc`: `Connection to 10.42.11.20 8080 port [tcp/*] succeeded!` in 0.01 s. | "To prove it, add a temporary rule, described so it gets removed. Instantly connected. Now remove it." |
| 2:25 | SSH to app via bastion. Edit nginx `listen 127.0.0.1:8080;`, reload. From bastion with temp rule restored: `nc -vz` → `Connection refused` in 0.003 s. | "Now a different break. I'll make nginx listen only on loopback. Same command from the bastion — refused, in three milliseconds. Refused means the packet *arrived*, and the machine said nothing is listening there for you." |
| 3:10 | On app: `ss -tlnp \| grep 8080` → `LISTEN 0 511 127.0.0.1:8080`. | "On the machine, `ss -tlnp` shows what's bound. 127.0.0.1 — only local connections. Fix the listen address, reload, and it works." |
| 3:40 | Public route table: remove `0.0.0.0/0 → igw`. From laptop `ssh bastion` hangs; `time` shows ~75 s timeout. | "Third break: delete the public subnet's default route. SSH to the bastion now times out. Same symptom as a security group block — so the ladder says check the route next." |
| 4:15 | Console: route table shows only `10.42.0.0/16 local`. Restore route; SSH succeeds. | "Only the local route. No path to the internet gateway, so no return path. Restore it." |
| 4:40 | Diagram: instance in private subnet with a public IP; arrow from internet stops at the NAT gateway. Caption: "Public IP + private subnet = unreachable." | "One classic trap: an instance in a private subnet with a public IP. It's unreachable from the internet, because its route sends traffic to a NAT gateway, and NAT doesn't accept inbound connections." |
| 5:10 | Summary table on screen: Symptom / Time / Likely layer. Timeout (seconds–minutes) → route, SG, NACL. Refused (instant) → nothing listening on that address and port. 502/503 from LB → target health. | "So: timeout, blocked — check routes, security groups, then ACLs. Refused, arrived — check what's listening. Errors from a load balancer — check target health first." |
| 5:50 | Cleanup: remove temporary rule; confirm `app-sg` rules back to two. | "And always remove your temporary rules. A test rule left in place is next quarter's audit finding." |
| 6:20 | End card: six-step ladder as text. | "DNS, route, security group, ACL, listening, health. Outside in, stop at the first one that explains it." |

## On-screen assets and B-roll
- The lesson 03 lab with addresses from `10.42.0.0/16`; real IDs blurred or replaced with placeholders.
- A visible stopwatch overlay during each `nc`/`ssh` attempt.

## Accessibility
- Captions; durations spoken aloud, not only shown.
- Diagram uses labels and line styles (solid = allowed path, dashed = blocked) in addition to colour.
- Provide the command list and the summary table as text.

## Check for understanding
1. `curl` to a public load balancer returns `502 Bad Gateway` instantly. Which ladder step first? *Answer: Target health (step 6) — the request arrived at the balancer, which had no healthy target.*
2. Why does a security-group block produce a timeout rather than a refusal? *Answer: Security groups drop disallowed packets silently; nothing sends a rejection back.*
3. What makes a stateless network ACL able to break return traffic while a security group can't? *Answer: ACLs evaluate each direction separately, so the ephemeral-port response can be denied; security groups are stateful.*
