---
lesson_id: net110-06
course_id: net110
pathway: cybersecurity-support-technician
title: VPNs and Remote Access
order: 6
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Select and configure a remote-access or site-to-site VPN appropriate to a stated requirement
---

## The controlled exception

Everything in lessons 03 and 04 was about drawing boundaries and refusing traffic that crosses them. A VPN is the deliberate exception: a way to let specific traffic cross an untrusted network — usually the internet — as if it had never left your control.

That framing matters, because the most common architectural error with VPNs is treating the tunnel as an endpoint rather than an entrance. A tunnel does not make a remote laptop trustworthy. It moves that laptop's traffic safely to your door. What happens after the door is still a segmentation question, and it is still your answer to give.

So define what a VPN actually provides:

- **Confidentiality** — the payload is encrypted, so an observer on the path sees ciphertext.
- **Integrity** — modification in transit is detected and the packet is discarded.
- **Authentication of the peer** — each end proves it is who it claims to be, so an interposed party cannot impersonate the far end.
- **Optionally, network reachability** — the remote endpoint can address internal resources as though locally attached.

And what it does not provide:

- **Any assurance about the endpoint's health.** An infected laptop with a valid tunnel is an infected laptop inside your network. Posture checks are a separate control.
- **Any decision about who may do what.** The tunnel authenticates a *peer*; user identity, multi-factor, and role-based authorization are covered elsewhere in this pathway. What you own here is which network zones the tunnel reaches.
- **Protection of data at rest** at either end. That is lesson 07.
- **Protection from a compromised peer.** If the far end is owned, the tunnel faithfully and securely delivers whatever it sends.

## Two shapes of VPN

### Site-to-site

Connects two networks. A gateway at each site holds the tunnel; hosts behind the gateways are unaware it exists and simply route to each other. Typical for a branch office reaching headquarters, a data centre pair, or a permanent partner link.

Characteristics: always on, gateway-to-gateway, small number of tunnels, configured once and monitored. The traffic selectors — which source and destination ranges go through the tunnel — are part of the configuration, which means a site-to-site VPN is *also* a segmentation statement. Deciding that the branch's `10.30.0.0/16` may reach headquarters' `10.20.40.0/24` and nothing else is exactly the same kind of decision as a zone matrix cell.

### Remote-access

Connects a single device to a network. The user's laptop or phone runs a client, authenticates, receives an address from a pool, and routes some or all of its traffic through the tunnel.

Characteristics: many tunnels, transient, per-user, and dependent on client software you must distribute and maintain. Almost all the operational effort in VPNs lives here.

A third arrangement worth naming: **per-application or zero-trust access**, where instead of joining a device to a network you broker individual connections to individual applications after authenticating each one. It is displacing traditional remote-access VPNs in many organizations. It is worth knowing the term and the idea — access to an application rather than access to a network — while the mechanics of the identity brokering belong to the identity course.

## The protocols

### IPsec

IPsec is not one protocol but a framework operating at the network layer, which is why it can carry anything IP without applications knowing.

**Two modes:**

- **Transport mode** protects the payload of an IP packet, leaving the original header. Host-to-host use.
- **Tunnel mode** encapsulates the entire original packet inside a new one. This is what gateways use, and it is why a site-to-site tunnel can carry private addressing across the internet.

**Two protections:**

- **ESP (Encapsulating Security Payload)** — encryption plus integrity. This is what you use.
- **AH (Authentication Header)** — integrity only, no encryption. Effectively obsolete for new designs, and it breaks through NAT.

**Establishment happens in two phases**, negotiated by IKE (Internet Key Exchange; use IKEv2, not IKEv1):

- **Phase 1 / IKE SA** — the two peers authenticate each other and build a secure channel for negotiation. They agree an encryption algorithm, an integrity algorithm, a Diffie-Hellman group for key agreement, and a lifetime.
- **Phase 2 / Child SA** — inside that channel, they negotiate the parameters for the actual data tunnel, including the **traffic selectors** naming which subnets the tunnel carries.

"Phase 1" and "phase 2" are IKEv1 terms that everyone still uses. In IKEv2 the same two steps happen in the first two exchanges (`IKE_SA_INIT` and `IKE_AUTH`), which build the IKE SA and the first Child SA together, so you will see those names in IKEv2 logs instead.

A **security association (SA)** is a one-directional agreed set of parameters and keys. Every working tunnel has at least two, one per direction. When you troubleshoot IPsec, you are almost always asking "did phase 1 complete, and if so, did phase 2, and do the selectors match?"

A concrete parameter set for a branch tunnel, expressed generically:

```text
Phase 1 (IKEv2)
  authentication      certificate (preferred) or pre-shared key
  encryption          AES-256-GCM
  integrity/PRF       SHA-384
  DH group            19 (256-bit elliptic curve) or 14 (2048-bit MODP)
  SA lifetime         8 hours
  dead peer detection enabled, 30s interval

Phase 2 (Child SA)
  protocol            ESP, tunnel mode
  encryption          AES-256-GCM
  PFS group           19
  SA lifetime         1 hour
  local selector      10.20.0.0/16
  remote selector     10.30.0.0/16
```

Three of those lines carry most of the security value. **Perfect forward secrecy** (the PFS group) means each rekey derives fresh key material, so recovering one key does not retroactively expose earlier traffic. **Certificate authentication** beats a pre-shared key, because a PSK is a shared secret sitting in two configurations and in whatever email it was sent in; if you must use one, make it long and random, and record where it is stored. And the **selectors** are your segmentation statement — write them as narrowly as the requirement allows, not as `0.0.0.0/0` because it was easier.

**NAT traversal** deserves a note: ESP is IP protocol 50, not a TCP or UDP port, so NAT devices cannot track it. NAT-T encapsulates ESP in UDP 4500 to solve this. Two firewall consequences: permit UDP 500 (IKE) and UDP 4500 (NAT-T) to your gateway, and expect a tunnel behind NAT to need NAT-T enabled at both ends.

### TLS-based VPNs

These carry the tunnel inside a TLS session, usually on TCP 443. The dominant practical advantage is traversal: port 443 outbound works from hotels, airports, and restrictive guest networks where IKE is blocked. Client software is generally easier to deploy, and the same TLS certificate machinery from lesson 07 applies.

The classic caveat is **TCP-over-TCP**: running a TCP tunnel inside a TCP session means two retransmission timers stacked on each other, and on a lossy link both fire and performance collapses. Prefer implementations that can run over UDP with TCP as fallback.

### WireGuard

WireGuard is a modern, deliberately minimal design that is worth learning because it makes the concepts unusually legible.

- **Fixed cryptography.** No negotiation and no cipher suites — one modern set, take it or leave it. Nothing to misconfigure and no downgrade to negotiate.
- **Peers identified by public key.** Each peer has a key pair. The public key *is* the identity.
- **Cryptokey routing.** Each peer configuration lists `AllowedIPs`: the set of addresses that peer is permitted to send from and that will be routed to it. This one field is simultaneously the routing table and the access control list, which is a genuinely elegant idea and a useful way to think about tunnel scoping.
- **UDP only, single port**, and silent by default — an unauthenticated packet gets no reply at all.
- **Stateless in feel.** No connection to establish; the tunnel is up when packets flow.

A minimal site-to-site pair. Site A gateway:

```text
[Interface]
Address = 10.99.0.1/30
ListenPort = 51820
PrivateKey = <site-a-private-key>

[Peer]
# Site B branch gateway
PublicKey = <site-b-public-key>
AllowedIPs = 10.30.0.0/16, 10.99.0.2/32
Endpoint = 198.51.100.42:51820
PersistentKeepalive = 25
```

Site B gateway:

```text
[Interface]
Address = 10.99.0.2/30
ListenPort = 51820
PrivateKey = <site-b-private-key>

[Peer]
# Site A headquarters gateway
PublicKey = <site-a-public-key>
AllowedIPs = 10.20.0.0/16, 10.99.0.1/32
Endpoint = 203.0.113.10:51820
PersistentKeepalive = 25
```

Read the `AllowedIPs` lines as the policy they are. Site A will route traffic destined for `10.30.0.0/16` into the tunnel, and — the security half — it will **discard any packet arriving from Site B whose source is not in that range**. If you widened this to `0.0.0.0/0`, the branch could inject traffic claiming any source address whatsoever. Narrow `AllowedIPs` is the same discipline as narrow IPsec selectors and narrow firewall rules, in a third syntax.

`PersistentKeepalive` sends a small packet every 25 seconds to hold open the NAT mapping on the side behind NAT. Set it on the side that is behind NAT; it is unnecessary on a side with a static public address.

## Selecting a VPN for a stated requirement

Work through the requirement in this order.

**1. What is being connected — networks or devices?** Two or more networks that must reach each other continuously is site-to-site. Individual users on devices is remote-access. A partner who needs one application is arguably neither and should be looked at as brokered application access.

**2. What must be reachable, exactly?** Name source ranges, destination ranges, and services. This becomes your selectors or `AllowedIPs`, and it is the difference between a tunnel that is a scoped exception and a tunnel that is a hole.

**3. Which zone does the far end land in?** This is the question people forget. A remote-access VPN should terminate in its own zone with its own address pool, and traffic from that zone into your internal zones should be governed by the firewall rules you wrote in lesson 04 — not permitted wholesale because "they are on the VPN." A vendor's tunnel should land in a zone that reaches exactly the one system they support.

**4. What endpoints must be supported?** Managed corporate laptops can run anything you deploy. Personal phones, a partner's hardware you do not administer, or an appliance with only IPsec support all constrain the choice.

**5. What network conditions must it survive?** Restrictive guest networks and hotel Wi-Fi push you toward TLS on 443. High-latency or lossy links push you away from TCP-based tunnels.

**6. What is the availability requirement?** A permanent site link may need redundant tunnels to two gateways, dead peer detection, and monitoring that alerts when it drops. A once-a-quarter vendor session needs none of that.

**7. What must be logged?** Connection start and stop, peer identity, assigned address, and bytes transferred, at minimum, correlated to your other logs. Without the assigned-address-to-user mapping, a VPN pool has the same attribution problem NAT does in lesson 02.

### Split tunnel or full tunnel

For remote access, decide whether **all** the client's traffic goes through the tunnel, or only traffic destined for internal ranges.

**Full tunnel** routes everything through the corporate network. Consistent policy — the client's web browsing passes your filtering, proxying, and monitoring — and no path where a device bridges the internet and your network simultaneously. Costs: bandwidth and concentrator capacity for all remote internet traffic, latency for the user, and video calls that route across the country and back.

**Split tunnel** routes only internal ranges through the tunnel; everything else goes direct. Efficient and pleasant to use. Costs: the device is simultaneously on your network and on an untrusted one, and its general internet activity is invisible to you.

There is no universal answer. A defensible middle path is a split tunnel that also forces DNS and specific sensitive destinations through the tunnel, combined with endpoint protection that does the filtering locally. Whatever you choose, write down the reasoning — this is one of the decisions a reviewer will ask you to justify.

## The landing zone: where segmentation and tunnels meet

This is the part of VPN design that gets skipped most often and costs the most when it is wrong, so it gets its own section.

When a tunnel comes up, the far end acquires reachability into your network. The question "reachability to what?" has three possible answers, and only one of them is defensible.

**The bad answer: the tunnel lands in an internal zone.** Remote users receive addresses out of the staff subnet, or the branch's traffic arrives already inside the server zone. Everything those zones can reach, the tunnel can reach. Your zone matrix from lesson 03 now has a door in it that the matrix does not show, and no firewall rule governs traffic through that door because the traffic never crosses a boundary.

**The worse answer: the tunnel lands nowhere in particular.** The concentrator is dual-homed with an interface in several zones, so it is a router your policy does not control — exactly the flaw the segmentation review checklist looks for.

**The right answer: the tunnel lands in its own zone.** Remote-access clients get an address pool that is a distinct subnet, `10.20.90.0/24` say, treated as a zone in its own right. Site-to-site tunnels terminate on the firewall, and the remote site's ranges are treated as an external zone with their own matrix row. Then the firewall rules from lesson 04 govern what that zone reaches, in exactly the same way and with exactly the same review discipline as everything else.

Concretely, the remote-access design for a staff VPN becomes two artifacts rather than one: a tunnel configuration, and this.

```text
ID  Action  Source            Destination     Service    Log  Comment
--  ------  ----------------  --------------  ---------  ---  ------------------------------
10  allow   VPN-POOL          10.20.40.22     tcp/443    yes  Remote staff to HR app
20  allow   VPN-POOL          10.20.40.24     tcp/443    yes  Remote staff to finance app
30  allow   VPN-POOL          10.20.40.10     udp/53     yes  Internal DNS resolution
40  allow   VPN-POOL          10.20.40.10     tcp/88,389 yes  Domain authentication
99  deny    VPN-POOL          any             any        yes  Default deny from VPN zone
```

Read the last line as the point of the exercise. A remote worker reaches four things. They do not reach the file server, the management zone, the database, or each other, because nothing permits it. The tunnel gave them a safe path to your door; the rule set decided which rooms they enter.

The same discipline applies to the branch tunnel: the remote site's `10.30.0.0/16` gets a matrix row, and that row is not "full." A compromised branch should not be able to reach headquarters' management zone, and the only thing that prevents it is a rule you wrote.

Two supporting habits. **Give each population its own pool** — staff, vendors, and administrators on different subnets — so that rules can distinguish them without depending on identity attributes. And **log the pool-address-to-session mapping**, because an alert naming `10.20.90.37` is otherwise as unresolvable as an alert naming a NAT address in lesson 02.

## Troubleshooting a tunnel

You will spend more time on this than on designing tunnels, and the diagnosis is far faster if you work in a fixed order rather than guessing.

**1. Is the outer traffic arriving at all?** Capture on the outer interface of both gateways and look for the negotiation packets — UDP 500 and 4500 for IPsec, your chosen UDP port for WireGuard, TCP 443 for a TLS VPN. If one side is sending and the other sees nothing, the problem is upstream: a firewall rule, an ISP filter, or a wrong endpoint address. This one capture eliminates half the possible causes.

**2. Did authentication succeed?** For IPsec, did phase 1 complete? Log messages naming an authentication or proposal failure point at a certificate problem, a mismatched pre-shared key, or an identity that does not match what the peer expects. For WireGuard, an unauthenticated packet is silently discarded by design, so a wrong public key produces *no error at all* — just a tunnel that never carries traffic. Verify the keys are the pair you think they are.

**3. Did the parameters match?** A phase 1 that completes and a phase 2 that fails is almost always mismatched proposals or mismatched selectors. Both ends must agree on encryption, integrity, group, and — critically — the traffic selectors. A common failure is one side configured with a `/16` selector and the other with a `/24`.

**4. Is the tunnel up but traffic not flowing?** Now suspect routing and policy. Does each side have a route sending the remote ranges into the tunnel? Does the firewall permit the traffic once it exits the tunnel — remembering that traffic emerging from a tunnel still crosses a zone boundary and still needs a rule? Does the far end's `AllowedIPs` or selector actually include the source you are sending from?

**5. Small packets work, large ones hang.** This is the MTU signature. Confirm with progressively larger pings using the do-not-fragment flag, then fix by lowering the tunnel MTU or clamping TCP MSS. Check also whether someone has blocked all ICMP and broken path MTU discovery, as lesson 02 warned.

**6. It works for a while, then stops.** Suspect rekey failure, an idle timeout evicting state, or a NAT mapping expiring on the side behind NAT. Check the rekey logs and set a keepalive.

The general shape: **outer connectivity, then authentication, then parameter agreement, then routing and policy, then MTU, then time-dependent behavior.** Working the list in order beats intuition almost every time, and it produces a record of what you eliminated — which is what you hand to the vendor if you have to open a support case.

## Operating a VPN

**MTU.** Encapsulation adds overhead, so the usable payload inside a tunnel is smaller than on the underlying link. If the resulting packets exceed the path MTU and fragmentation is prevented — often because someone blocked all ICMP, per lesson 02 — you get the signature symptom: small requests work, large transfers hang. Set the tunnel interface MTU appropriately (commonly around 1420 for WireGuard on a 1500-byte path, lower for IPsec) or clamp TCP MSS at the gateway.

**Rekeying and lifetimes.** Both IPsec phases rekey on a timer. Short lifetimes limit the exposure of any one key at the cost of more negotiation. The hour/eight-hour pattern above is a common, sane default.

**Dead peer detection and keepalives.** Without them, a tunnel can appear up on one side long after the other has gone, and traffic disappears into it. Enable DPD on IPsec; use `PersistentKeepalive` behind NAT on WireGuard.

**Monitoring.** Treat the tunnel as an asset: alert on tunnel down, on repeated authentication failures, on connections from unexpected geographies, and on concurrent sessions for one identity from distant places. Feed these to the same monitoring you built in lesson 05.

**Key and credential hygiene.** Private keys never leave the device that generated them. Pre-shared keys are long, random, unique per tunnel, and stored in a secret manager rather than a runbook. When someone leaves or a device is lost, there must be a revocation path you have actually tested — a certificate revocation, a removed peer entry, a disabled account. An untested revocation path is a theory.

**Gateway hardening.** The concentrator is internet-facing by necessity, which makes it a DMZ asset by the definitions in lesson 03: patched promptly, management interface not exposed, logging on, and covered by the sensor placement from lesson 05.

## Three requirements, three answers

**A branch office of twelve people needs continuous access to headquarters file and application servers.** Site-to-site, permanent, gateway to gateway. Selectors limited to the branch user range and the specific headquarters server subnet — not the whole headquarters address space, and specifically not the management zone. IKEv2 with certificate authentication, PFS on, DPD enabled, monitored for tunnel-down. Users never install anything.

**Forty staff work from home on managed laptops and need the internal HR and finance applications.** Remote-access. Terminate in a dedicated VPN zone with its own pool, then use firewall rules to permit that zone only to the specific application servers on the specific ports. TLS-based on 443 for traversal from arbitrary networks. Split tunnel with forced internal DNS, documented as a deliberate decision. Log the address-to-user mapping so an alert naming a pool address can be resolved to a person.

**A vendor needs occasional access to support one HVAC controller.** Neither a general remote-access account nor a full site-to-site. A dedicated tunnel — or better, brokered access to that one system — landing in a zone that reaches exactly `10.20.60.14` on exactly the management port it requires, enabled by request rather than standing, logged, and with an expiry date on the firewall rule as in lesson 04. The failure mode to avoid is a vendor account on the general VPN with the same access as an employee.

## Practice

Use two lab virtual machines you own. Do not build tunnels into any network you do not administer.

**Exercise 1 — Select and justify.** For each requirement, state: site-to-site or remote-access, which protocol family and why, the exact traffic selectors or `AllowedIPs` you would configure, which zone the far end lands in, split or full tunnel where applicable, and one operational setting (MTU, DPD, keepalive, lifetime, or logging) you would not leave at default. Four to six sentences each.

1. A retail chain's eight stores each need their point-of-sale systems to reach one payment application server at headquarters, and nothing else at headquarters.
2. A field engineer needs full access to diagnostic tools on a corporate laptop from customer sites whose guest Wi-Fi blocks everything except web traffic.
3. A contract developer, on their own laptop, needs access to one internal Git server for a three-month engagement.

**Exercise 2 — Build a tunnel.** Configure a WireGuard tunnel between two lab VMs on different virtual networks, with a routing VM between them if your lab supports it.

1. Generate a key pair on each peer. Confirm that no private key is ever transferred between machines, and say in one sentence how you know.
2. Write both configurations with `AllowedIPs` set as narrowly as the topology allows.
3. Bring the tunnel up and confirm traffic passes between the two internal addresses.
4. Capture traffic on the outer interface with `tcpdump` and show that the payload is not readable while the outer UDP headers are. Note the source and destination ports you observe.

**Exercise 3 — Prove the scoping works.** With the tunnel up, deliberately test the boundary:

1. From peer B, attempt to reach an address at site A that is **not** covered by `AllowedIPs`. Record the result.
2. Widen `AllowedIPs` on the site A peer entry to `0.0.0.0/0`, retry, and record what changes.
3. Restore the narrow configuration.

Then write three sentences explaining, in terms a reviewer would accept, what `AllowedIPs` enforced in step 1 and what risk step 2 introduced.

**Exercise 4 — The operational half.** For the tunnel you built, produce a one-page operations note containing: the MTU you set and how you determined it, what you would monitor and what would page someone, where each key is stored, the exact steps to revoke peer B's access, and how you would confirm the revocation actually took effect. Then perform the revocation and confirm it.

## Check your understanding

1. A vendor asks for "a VPN into the branch network" to support one HVAC controller. What do you offer instead?
2. Phase 1 completes but phase 2 fails. What are the two most likely causes?
3. Remote users receive addresses from the staff subnet `10.20.30.0/24`. Why is that the "bad answer" for the landing zone?
4. Small pings across a new tunnel work; file copies hang. What is the likely cause and fix?

**Answers:** (1) Access scoped to that one device on its one management port — a dedicated tunnel or brokered access landing in a zone with a single, logged, expiring rule — not general network access. (2) Mismatched proposals (encryption, integrity, group) or mismatched traffic selectors (for example `/16` on one side and `/24` on the other). (3) The tunnel lands inside an internal zone, so it reaches everything that zone reaches and no firewall rule governs it. (4) MTU: encapsulation overhead plus blocked ICMP "fragmentation needed"; lower the tunnel MTU or clamp TCP MSS.
