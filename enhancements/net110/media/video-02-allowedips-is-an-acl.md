---
course_id: net110
media_id: net110-v02
type: video-script
title: "AllowedIPs Is an Access List: Scoping a WireGuard Branch Tunnel"
format: screencast
target_runtime: "8 min"
related_lessons:
  - net110-06
objectives:
  - Select and configure a remote-access or site-to-site VPN appropriate to a stated requirement
competency_ids:
  - D2-S1-C01
---

## Purpose

After watching, the learner can configure a WireGuard site-to-site tunnel between two lab VMs, explain that `AllowedIPs` is both the routing table and the source-address filter, and demonstrate what widening it to `0.0.0.0/0` changes.

## Audience and prerequisites

Apprentices on lesson 06, before Exercises 2 and 3. Two Linux lab VMs with WireGuard tools installed (`wg`, `wg-quick`).

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Diagram: Site A (HQ, `10.20.0.0/16`, outer `203.0.113.10`) and Site B (branch, `10.30.0.0/16`, outer `198.51.100.42`), a dashed tunnel `10.99.0.0/30`. | "A tunnel is a controlled exception — a door, not a room. Today we'll build the branch tunnel from lesson 06 and prove that one line in the config decides which rooms the branch can enter." |
| 0:25 | Terminal on Site A: `umask 077; wg genkey \| tee a.key \| wg pubkey > a.pub; cat a.pub`. Same on Site B. | "Keys first. Each side generates its own key pair, on the machine that will use it. umask 077 so the private key is readable only by its owner. We copy only the public key across — the private key never leaves the box. That's how you'll answer Exercise 2's 'how do you know' question." |
| 1:15 | Editor: Site A `/etc/wireguard/wg0.conf` exactly as in lesson 06, with `AllowedIPs = 10.30.0.0/16, 10.99.0.2/32`. | "Here's Site A. Interface address, listen port, private key. One peer: Site B's public key, its endpoint, a keepalive — and AllowedIPs." |
| 1:45 | Zoom on `AllowedIPs`. Two arrows appear: outbound "route these into the tunnel", inbound "accept only these as source". | "AllowedIPs does two jobs at once. Outbound, it's a route: traffic for 10.30-dot-anything goes into this tunnel, to this peer. Inbound, it's a filter: a decrypted packet from this peer is dropped unless its source is in this list. Routing table and access list, one line." |
| 2:30 | Bring up both: `sudo wg-quick up wg0`. Then `sudo wg show`. Highlight "latest handshake". | "Bring it up on both sides. wg show tells us there's been a handshake and bytes are moving. If the keys were wrong, you'd see… nothing. No error. WireGuard silently ignores packets it can't authenticate — remember that when you troubleshoot." |
| 3:10 | From Site B: `ping -c3 10.20.40.22` succeeds. Outer-interface capture on Site A: `sudo tcpdump -ni eth0 udp port 51820 -X -c 4` shows UDP 51820 with unreadable payload. | "From the branch, ping a headquarters server. It works. On HQ's outer interface, all we see is UDP 51820 between the two public addresses, payload unreadable. The outer header is visible; the inner conversation isn't." |
| 3:50 | On Site B, add a secondary address simulating a host outside the branch range: `sudo ip addr add 172.16.5.5/32 dev lo`. Ping from that source: `ping -c3 -I 172.16.5.5 10.20.40.22`. Fails. On Site A, `sudo wg show wg0` transfer counters rise but nothing reaches 10.20.40.22 (capture on Site A's inner interface shows nothing). | "Now the security half. On the branch, I add an address that is not in the branch range and ping HQ from it. The packet is encrypted, delivered, decrypted — and dropped by Site A, because its source isn't in AllowedIPs for this peer." |
| 4:45 | Edit Site A's peer `AllowedIPs = 0.0.0.0/0`. `sudo wg syncconf wg0 <(wg-quick strip wg0)`. Repeat the ping from `172.16.5.5`. It now reaches the HQ server (reply routing may fail; capture on HQ's inner interface shows the echo request arriving). | "Now I widen Site A's entry to 0.0.0.0 slash 0 and resync. Same ping. This time the request arrives at the HQ server — with a source address the branch should never be able to claim. A compromised branch could now inject traffic pretending to be anyone." |
| 5:45 | Warning card: "0.0.0.0/0 also makes this peer the route for everything." | "And there's a second effect: 0.0.0.0/0 in AllowedIPs, with wg-quick, also installs routes sending all of Site A's traffic into the tunnel. In a lab that breaks your SSH session; in production it's an outage. Restore the narrow line." |
| 6:15 | Restore config; `wg syncconf` again; re-run both pings — branch range works, 172.16.5.5 fails. | "Narrow again. Branch range works; the stranger doesn't." |
| 6:40 | Slide: the VPN-POOL rule table from lesson 06 "The landing zone". | "Last point. AllowedIPs scopes what the *tunnel* accepts. What the branch reaches once inside is still the firewall's job — the landing-zone rules from lesson 06. A tunnel delivers traffic to your door. The rule set decides which rooms." |
| 7:20 | Recap: "Generate keys where they live. AllowedIPs = route + filter. Narrow it. Land the tunnel in a zone." | "Generate keys where they live. Treat AllowedIPs as an ACL. Keep it narrow. And land every tunnel in a zone with its own rules." |
| 7:45 | End card: "Now: Exercises 2 and 3." | — |

## On-screen assets and B-roll

- Two Linux VMs on separate host-only networks with a routing VM or bridged "internet" segment using documentation addresses.
- The lesson 06 configs, keys redacted to `<site-a-private-key>` on screen (blur real lab keys).
- Two-arrow "route + filter" overlay graphic.
- Production check: confirm the `wg syncconf <(wg-quick strip wg0)` idiom against the installed `wireguard-tools` version before recording; `wg-quick down/up` is an acceptable fallback.

## Accessibility

- Captions; all commands in the description as text.
- Route/filter arrows labelled with words, not just color.
- Ping success/failure narrated and shown as text output, not only by icon.

## Check for understanding

1. Name the two things `AllowedIPs` controls for a peer. *Answer: which destinations are routed to that peer, and which source addresses are accepted from it after decryption.*
2. A WireGuard tunnel shows no handshake and no errors in the logs. What is the first thing to check? *Answer: that each side has the correct public key for the other (and the endpoint/port is reachable); unauthenticated packets are silently dropped.*
3. Why is a narrow `AllowedIPs` not a substitute for landing-zone firewall rules? *Answer: it limits what the tunnel accepts and routes, not which internal services the branch can reach; that is decided by zone rules.*
