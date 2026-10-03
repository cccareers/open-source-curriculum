---
course_id: net110
media_id: net110-a02
type: animation-storyboard
title: "Inside the Tunnel: Encapsulation, the Outer Header, and Where the Packet Lands"
target_runtime: "100 sec"
suggested_tool: "Manim"
related_lessons:
  - net110-06
  - net110-07
objectives:
  - Select and configure a remote-access or site-to-site VPN appropriate to a stated requirement
  - Choose encryption and key-handling appropriate to data in transit and data at rest
competency_ids:
  - D2-S1-C01
  - D2-S1-C05
---

## Concept and misconception it fixes

Misconception: "Once traffic is on the VPN, it's inside the network and trusted." The animation shows tunnel-mode encapsulation (inner packet wrapped, encrypted, given a new outer header), what an observer on the internet can and cannot see, and then the key lesson 06 point: the decrypted packet **lands in a zone**, where firewall rules still decide what it reaches. A second pass shows MTU overhead causing "small works, large hangs".

## Visual language

- Inner packet: a card with header `10.30.4.12 → 10.20.40.22 TCP 443` and a payload strip.
- Encryption: card slides into an opaque box with a padlock and the label "ESP / WireGuard ciphertext"; a new outer header strip attaches: `198.51.100.42 → 203.0.113.10 UDP 51820` (WireGuard pass) or `UDP 4500` (IPsec NAT-T pass).
- Internet as a wide grey band with an "observer" eye icon that can read only the outer strip.
- HQ drawn as rooms (zones) behind a door: VPN landing zone `10.20.90.0/24` (or the branch's own matrix row), Servers, Data, Mgmt.
- Okabe-Ito: blue #0072B2 inner (cleartext) data, black/grey outer header, orange #E69F00 padlocked ciphertext, vermillion #D55E00 blocked, bluish green #009E73 permitted. Shapes and labels carry meaning without color.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Branch workstation creates the inner packet card. | Card pops in. | "A branch workstation sends a normal packet to an HQ server — private addresses on both ends." |
| 2 | 12 s | At the branch gateway, the card is checked against `AllowedIPs`/selectors (`10.20.0.0/16` ✓), then slides into a padlocked box; an outer header attaches. | Card shrinks into box; header clicks on. | "The gateway sees the destination is in the tunnel's scope, encrypts the whole packet, and wraps it in a new outer header between the two public addresses." |
| 3 | 12 s | Box crosses the internet band. Observer eye reads the outer strip (highlight) and bounces off the padlock. Text bubble: "Two public IPs, UDP 51820, size, timing." | Eye scans; padlock glints. | "Anyone on the path sees two public addresses, a UDP port, size and timing. Not the inner addresses, not the payload." |
| 4 | 10 s | At HQ gateway: integrity check ✓, decrypt, then source check against the peer's `AllowedIPs` (`10.30.0.0/16` ✓). | Box opens; card emerges. | "HQ verifies it wasn't modified, decrypts it, and checks the inner source is one this peer is allowed to send from." |
| 5 | 14 s | Card arrives at the **VPN landing zone door**, not inside the server room. A rule panel appears: `allow BRANCH → 10.20.40.22 tcp/443`. Card proceeds to the server ✓. | Door opens for this card only. | "Now the part people skip. The packet lands in a zone of its own, and the firewall rules decide where it may go. This one is permitted: one server, one port." |
| 6 | 14 s | A second inner card from the branch targets `10.20.10.5:22` (Mgmt). It is encrypted, crosses, decrypts fine — then hits the landing-zone rules: no permit; default deny ✗ with log line. | Same journey; blocked at the door. | "Same tunnel, same perfect encryption — aimed at the management zone. The tunnel delivers it faithfully. The rule set stops it. Encryption protects the trip; it doesn't grant trust." |
| 7 | 16 s | MTU pass: a large inner card (1500 bytes) plus outer header overhead exceeds a 1500-byte path; a ruler shows overflow. With DF set, a router returns "fragmentation needed" (ICMP type 3 code 4) — but a "Block all ICMP" sign intercepts it ✗. Sender keeps resending; a "hung transfer" spinner appears. Fix: tunnel MTU lowered (e.g., ~1420) / MSS clamp; packets fit ✓. | Ruler overflow; ICMP message blocked; then resized packets flow. | "Encapsulation adds bytes. Small packets fit; big ones don't. If someone blocked all ICMP, the 'too big' message never arrives and large transfers hang. Lower the tunnel MTU or clamp MSS." |
| 8 | 14 s | Summary: three panels — "Tunnel = safe trip", "Zone rules = which rooms", "MTU = leave room for the wrapper". | Panels slide in. | "A tunnel is a safe trip to your door. Zone rules decide which rooms. And leave room for the wrapper." |

## Interaction variant

Toggle-driven explainer: learners switch between "lands in internal zone" and "lands in own zone", and between `AllowedIPs = 10.30.0.0/16` and `0.0.0.0/0`, then fire preset packets (to server, to mgmt, spoofed source) to see which reach their target. A slider sets tunnel MTU to show where large transfers start to hang.

## Production notes

- Addresses follow lesson 06 (HQ `10.20.0.0/16`, branch `10.30.0.0/16`, outer `203.0.113.10` / `198.51.100.42`, landing pool `10.20.90.0/24`).
- Overhead numbers are illustrative; label them "approx." The lesson's "around 1420 for WireGuard on a 1500-byte path" figure is the one to show.
- Do not imply the outer observer learns nothing: size and timing metadata are visible, matching lesson 02 and 07's "residue" message.
