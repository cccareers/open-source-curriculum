---
course_id: cse203
media_id: cse203-a01
type: animation-storyboard
title: "A Request's Path Through the Two-Tier VPC"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - cse203-03
  - cse203-04
objectives:
  - Configure a virtual private cloud with subnets and security groups for a deployed application
competency_ids:
  - D3-S1-C01
---

## Concept and misconception it fixes
Learners blur routing (can a packet get there?) and security groups (is it allowed?), and believe a public IP alone makes an instance reachable. The animation follows one HTTPS request from a staff laptop through the Riverside layout to the database and back, showing the route-table check and the security-group check as two separate gates.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- VPC: large rounded rectangle labelled `10.42.0.0/16`. Zones A and B as two vertical lanes.
- Subnets: public (light, solid border, label "public 10.42.0.0/24") and private (dashed border, "private 10.42.10.0/24"); db subnets dotted border.
- Route gate: a signpost icon labelled "route table"; security gate: a shield icon labelled with the SG name.
- Packet: a small envelope labelled "443" or "8080" or "5432" (port number always printed on it).
- Colours (Okabe-Ito): allowed path #009E73 solid line; blocked #D55E00 with an "X" and the word "dropped"; return traffic #0072B2 dashed line labelled "response (stateful)".

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Internet cloud left, VPC right. Laptop labelled "office 203.0.113.10". | Envelope "443" leaves laptop. | "A staff member opens the equipment-loans app." |
| 2 | 10s | Envelope reaches internet gateway, then route signpost of public subnet ("0.0.0.0/0 → igw"). | Signpost turns green; envelope proceeds to load balancer. | "Routing first: the public subnet has a route to the internet gateway, so the packet can arrive." |
| 3 | 10s | Shield `lb-sg: 443 from office range`. | Shield checks source label, glows green. | "Then permission: lb-sg allows 443 from the office range. Allowed." |
| 4 | 10s | LB forwards new envelope "8080" into private subnet zone A. Shield `app-sg: 8080 from lb-sg` checks envelope's badge "from lb-sg". | Green. | "The balancer forwards on 8080. app-sg allows 8080 from lb-sg — the source is a group, not an address." |
| 5 | 10s | App sends envelope "5432" to db subnet. Shield `db-sg: 5432 from app-sg`. | Green; db icon pulses. | "The app queries the database. db-sg allows 5432 only from app-sg." |
| 6 | 10s | Responses travel back along dashed blue lines without passing shields again. | Shields stay dim as responses pass. | "Responses flow back automatically. Security groups are stateful — no return rules needed." |
| 7 | 12s | Second laptop "mobile 198.51.100.7" sends "443". lb-sg shield turns orange with X, envelope fades with "dropped — no reply". A stopwatch counts up to "timeout". | Stopwatch ticks. | "From outside the office range: dropped silently. The user sees a timeout, not a refusal." |
| 8 | 12s | App instance gets a public IP badge. Envelope from internet tries to reach it directly; private subnet signpost reads "0.0.0.0/0 → NAT". Envelope bounces at NAT. | Envelope stops at NAT with "NAT accepts no inbound". | "A public IP on a private-subnet instance doesn't help. Its route points at NAT, and NAT only lets connections out." |
| 9 | 8s | Summary: two gates side by side "Route: can it get there?" and "Security group: is it allowed?". | Gates pulse alternately. | "Two separate gates. Both must say yes." |

## Interaction variant (optional)
Clickable step-through: learners toggle a route or a security-group rule off and press "send"; the packet shows where it stops and whether the client sees timeout or refused (refused only when the "app listening" toggle is set to loopback).

## Production notes
- Use the cse203 addressing (`10.42.0.0/16`, office `203.0.113.0/24`) so it matches lesson 08 and project x01.
- Keep port numbers on every envelope; the port is how learners match packets to rules.
- Export a still of scene 9 as a reference card.
