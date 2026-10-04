---
course_id: net110
title: "Network Security Fundamentals — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

net110 is excellent technical writing. It has one consistent addressing plan (`10.<site>.<zone>.<host>`) across lessons 02–07, worked captures and rule sets, and two realistic projects (Meridian Freight, Kestrel Diagnostics). The biggest opportunity is **automated verification**. The lessons rightly say "test the deny, not just the allow", but learners have no reusable harness that does it, and no exercise turns the narration method into a repeatable detection. The two supplementary projects add both. The media assets target the dynamic concepts that prose handles least well: the handshake and state table, first-match ordering, and encapsulation and landing zones.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| net110-02 | "Ports and services" table | "25 / 587 / 465 — SMTP submission" conflates relay (25) with client submission (587/465). | Split the description. | Applied |
| net110-04 | "The same policy in open-source syntax" | The `iptables` sequence sets `-P INPUT DROP` first, which locks out a learner working over SSH. | Added a lab-safety note: add accepts first, policy last, over SSH. | Applied |
| net110-06 | "IPsec" | Uses IKEv1 "phase 1/phase 2" terms while recommending IKEv2. Learners won't find those words in IKEv2 logs. | Added a note mapping the terms to `IKE_SA_INIT`/`IKE_AUTH`. | Applied |
| net110-07 | "Checking a configuration" | `openssl s_client -tls1_1` can fail on the *client* under OpenSSL 3 default security levels. That gives a false "server refuses TLS 1.1". | Added a caution and the `@SECLEVEL=0` retry. | Applied |
| net110-02 | "IPv4 and CIDR" | "`/31` … means 'this link'" is correct for point-to-point links (RFC 3021), but learners may read it as a general rule. | Add "(point-to-point links)". | Proposed |
| net110-05 | "Reading a rule" | The `threshold:` keyword is shown. Newer Suricata documentation favors `detection_filter`/`threshold.config` for some uses. | Verify against current Suricata docs; add a note if needed. | Proposed |
| net110-08 | "The environment" → DHCP extract | `10.14.30.79`'s lease ends 03/12 07:12, but the host is active all day on 03/12. This is either a deliberate attribution trap or an error. | Confirm intent. If deliberate, add a hint; if not, extend the lease. | Proposed |
| net110-04 | "The same policy in open-source syntax" | `log prefix \"…\"` escaping in `nft add rule` lines is shell-fragile. | Suggest writing rules in an `.nft` file loaded with `nft -f` (as x01 does). | Proposed |

## Depth and coverage gaps

- **No reusable verification harness** (*Write and order firewall rules that implement a stated access requirement without opening unintended paths*; *Design a segmented network that places each asset in a zone matching its trust level*). Addressed by x01: a containerized four-zone lab with a probe script that tests allows and adjacent denies and reports drop vs. reject.
- **Narration never becomes detection** (*Read addressing, ports, and protocol behavior well enough to say what a captured network conversation is doing*; *Choose detection or prevention placement for an IDS/IPS sensor and interpret the alerts it produces*). Addressed by x02: a seeded synthetic day, a learner-written triage script, and a pytest suite that rewards precision.
- **No Check your understanding blocks** in lessons 02–07. Added to all six.
- **Subnetting practice is thin.** The lesson explains CIDR but never has learners compute ranges. Added one item in lesson 02's check. A 10-item drill (prefix → range, usable hosts, "is this IP in this rule?") would help the firewall lessons.
- **IPv6 policy is warned about but never practiced.** Proposed as an x01 stretch goal.
- **TLS 1.3 handshake** is described but never shown in a capture. A short screencast reading a ClientHello (SNI, offered suites) would support *Choose encryption and key-handling appropriate to data in transit and data at rest*.
- **Misconception not addressed directly:** "VPN = trusted." Covered by animation a02 and the lesson 06 check.

## Proposed additional projects

- **x01 — HR Application Segmentation Lab: Build the Chokepoint, Prove the Denies** (drafted). Docker Compose, nftables router, `verify.py`. A run with the reference rules was verified in this pass.
- **x02 — Meridian Freight, Friday: Flow-Triage Script** (drafted). Generator and pytest suite were tested end to end against a reference solution in this pass.
- **x03 — Kestrel Build-Day Verification in GNS3/Packet Tracer** (not drafted). Learners build the lesson 09 branch in a simulator and run their R10 checklist.
- **x04 — Lab CA and TLS Hardening Check** (not drafted). Create a small CA, issue certs, and run a script that asserts TLS 1.2+ only, AEAD-only suites, a SAN present, and a full chain served.
- **x05 — Subnet and Rule-Membership Drill** (not drafted). Python `ipaddress`-based self-check generator.

## Video and animation opportunities

- **Open / closed / filtered handshake reading:** net110-02/04, screencast. **Drafted: `media/video-01-open-closed-filtered.md`.**
- **WireGuard `AllowedIPs` as an ACL:** net110-06, screencast. **Drafted: `media/video-02-allowedips-is-an-acl.md`.**
- **Stateful firewall plus first-match walk:** net110-02/04, explainer animation. **Drafted: `media/animation-01-stateful-firewall-handshake.md`.**
- **Encapsulation, outer header, landing zone, MTU:** net110-06/07, explainer animation. **Drafted: `media/animation-02-tunnel-landing-zone.md`.**
- **CIDR and subnet boundaries:** net110-02, animation. Bits sliding between network and host portions as the prefix changes. Not drafted.
- **NAT attribution chain:** net110-02, whiteboard. Public IP to NAT log to DHCP lease to inventory. Not drafted.
- **SPAN oversubscription vs. TAP:** net110-05, explainer showing silent drops. Not drafted.
- **TLS 1.3 handshake and ECDHE forward secrecy:** net110-07, animation. Not drafted.

## Assessment ideas

- Flag-reading quiz: ten tcpdump lines; learner states initiator and outcome.
- Rule-ordering items: present 4–6 rules; learner names the shadowed and redundant rules (reuses lesson 04 Exercise 2 style).
- `conn_state` matching: SF/S0/REJ/RSTO paired with plain-language outcomes.
- Encryption mismatch items: given a data state and an adversary, pick the control that actually addresses it.

## Changes applied in this pass

- `02-networking-refresher-for-defenders.md`, "Ports and services": clarified SMTP 25 (relay) vs. 587/465 (submission).
- `02-networking-refresher-for-defenders.md`, new "Check your understanding" (end): `/25` math, REJ narration, NAT attribution logs, ICMP.
- `03-secure-network-architecture-and-segmentation.md`, new "Check your understanding" (end): VLAN vs. enforcement, medical-device zone, address-to-zone reading, dual-homed hosts.
- `04-firewalls-and-rule-design.md`, "The same policy in open-source syntax": SSH lockout caution for `-P INPUT DROP`.
- `04-firewalls-and-rule-design.md`, new "Check your understanding" (end): stateful return traffic, shadowing, adjacent-path tests, DNS egress.
- `05-intrusion-detection-and-prevention.md`, new "Check your understanding" (end): first sensor placement, `$HOME_NET`, alert vs. flow evidence, SPAN oversubscription.
- `06-vpns-and-remote-access.md`, "IPsec": mapped phase 1/2 terms to IKEv2 exchange names.
- `06-vpns-and-remote-access.md`, new "Check your understanding" (end): vendor scoping, phase 2 failures, landing zone, MTU.
- `07-encryption-in-transit-and-at-rest.md`, "Checking a configuration": OpenSSL client security-level caution for the TLS 1.1 check.
- `07-encryption-in-transit-and-at-rest.md`, new "Check your understanding" (end): FDE adversary, cipher-suite reading, SAN, envelope encryption.

## Open questions for the course owner

- **x01 was executed once, on Docker Desktop for macOS.** It passed with the reference rules (see its instructor notes). It has not been tested on a native Linux host, where `firewalld` or `br_netfilter` settings may interfere. Run it once on your reference lab image before class.
- **v02** uses `wg syncconf wg0 <(wg-quick strip wg0)`. Confirm this against the installed `wireguard-tools` version, or fall back to `wg-quick down/up`.
- **Lesson 08 DHCP lease for `10.14.30.79`:** deliberate or an error? (See the clarity table.)
- **Suricata `threshold:` syntax:** confirm it is still the recommended form for the version you teach.
- Should net110 adopt Packet Tracer/GNS3 for learners without Docker-capable machines? x03 is proposed for that path.
