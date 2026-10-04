---
lesson_id: net110-03
course_id: net110
pathway: cybersecurity-support-technician
title: Secure Network Architecture and Segmentation
order: 3
kind: lesson
competency_ids:
  - D2-S1-C01
objectives:
  - Design a segmented network that places each asset in a zone matching its trust level
---

## The failure this lesson prevents

Picture a twelve-year-old office network that grew one switch at a time. Everything is on `192.168.1.0/24`: laptops, the domain controller, the accounting database, four printers, the badge reader, the HVAC controller, the guest Wi-Fi, and a conference room television. There is a firewall, and it is a good one, and it is at the edge — so it inspects the roughly two percent of traffic that leaves the building and none of the ninety-eight percent that does not.

Now one laptop gets compromised through a phishing link. From that laptop, every other device on the network is one hop away with nothing in between. The database answers on 5432 because it answers everyone. The badge reader has a default password and a web interface. The HVAC controller runs firmware from 2016. The domain controller is reachable on every port it listens on. The edge firewall sees none of it, because none of it crosses the edge.

This is **lateral movement**, and it is the reason segmentation exists. The initial compromise was a user-training problem. Everything after it was an architecture problem. Segmentation does not stop the first machine from falling; it decides how much of your organization falls with it.

The design goal, stated plainly: **every asset sits in a zone whose trust level matches it, and traffic between zones is limited to what the business actually requires.** This lesson teaches you to produce that design. Lesson 04 teaches you to express it as firewall rules; here you decide *what the rules should say* before worrying about how to write them.

## Trust level, and how to assign one

"Trust level" sounds vague until you make it operational. Ask four questions about an asset:

1. **Exposure.** Can something outside your control reach it? A public web server is exposed by design; a payroll database should not be.
2. **Compromise likelihood.** How often does this class of device get owned? User laptops run browsers, open attachments, and go home. Managed servers with no interactive users do not.
3. **Blast radius.** If this device is fully controlled by an attacker, what does it reach and what does it hold? A domain controller and a conference room TV are not comparable.
4. **Manageability.** Can you patch it, run an agent on it, and log it? A device that cannot be patched — a five-year-old camera, a medical device under vendor warranty, a building controller — is permanently unpatched, and the only remaining control is where you put it.

Assets with similar answers belong together. Assets with different answers do not, even when it would be convenient. The single most common design error is grouping by *organization chart* or *physical location* instead of by trust: "the third floor VLAN" tells you nothing about what the traffic should be allowed to do.

## The standard zones

Most organizations converge on a similar set. Learn these as a starting vocabulary, not a mandatory list — a small business may collapse several, and a hospital will add more.

**Untrusted / internet.** Everything you do not control. Zero trust by definition.

**DMZ (perimeter services).** Systems that must accept connections from the internet: public web servers, a reverse proxy, an inbound mail gateway, a VPN concentrator. The defining rule of a DMZ is asymmetric: the internet may reach *into* it on specific ports, and it may **not** freely reach *back into* your internal zones. A DMZ host is treated as semi-compromised at all times, because it is the one thing strangers are allowed to talk to.

**Internal user zone.** Staff workstations and laptops. Medium trust — they are managed and patched, but they are also where phishing lands. Users need outbound internet and access to specific application services; they almost never need to reach each other. Client isolation inside the user zone is a cheap, high-value control that most networks skip.

**Server / application zone.** Internal application servers, file servers, print servers, directory services. Higher trust because they are managed, hardened, and have no browsers on them. Receives connections from the user zone on specific service ports.

**Data zone.** Databases and storage holding regulated or business-critical data. Highest trust and the most restricted. The rule to remember: **only application servers talk to databases.** A user workstation with a direct route to a database port is a design defect even if a login is still required — and note that *who is allowed to log in* is an identity question handled elsewhere in this pathway. Your job at the network layer is to make sure the packet cannot arrive in the first place.

**Management zone.** Switch and firewall management interfaces, hypervisor consoles, backup infrastructure, monitoring and logging servers, out-of-band controllers. This zone is the keys to the kingdom: anything that can reconfigure your infrastructure lives here. It should be reachable only from a small number of administrative workstations or a jump host, and it should never be reachable from the user zone at large.

**Guest / untrusted wireless.** Visitors and personal devices. Treated as internet: outbound web only, no route to any internal zone, client isolation on. A guest network that can see internal resources is a guest network that has quietly become an internal network with no onboarding process.

**IoT / OT / unmanaged devices.** Cameras, badge readers, building automation, printers, medical or industrial equipment. These are the devices you cannot patch and cannot run an agent on, so you contain them: their own zone, tightly restricted outbound, and inbound access only from the specific management systems that need them. Printers deserve a mention of their own — they are full computers with storage, they hold copies of documents, and they get forgotten during every patch cycle.

**Backup zone.** Increasingly separated on purpose. If ransomware reaches your backups, you have no recovery. Backups should be reachable *from* backup infrastructure rather than reachable *by* the systems being backed up wherever the product allows it, and administrative access should be separate from ordinary infrastructure administration.

![Zone diagram showing untrusted internet, DMZ, internal user, server, data, management, guest wireless, and IoT zones with permitted traffic directions between them](./img/segmentation-zones.png)

## North-south and east-west

**North-south** is traffic crossing your perimeter — in from the internet, out to the internet. **East-west** is traffic between systems inside your network.

By volume, east-west typically dominates by an order of magnitude. By historical attention, north-south dominates completely: the firewall budget, the rule review, the monitoring. The mismatch is the whole point of this lesson. Segmentation is fundamentally about applying policy to east-west traffic, which means putting enforcement points *inside* the network, not only at its edge.

**Microsegmentation** is the same idea pushed to its limit: policy applied per workload rather than per subnet, so two servers on the same subnet can be prevented from talking. It is typically implemented with host-based firewalls driven by a central policy, or with hypervisor-level enforcement. You do not need to build one to be useful, but you should recognize the term and know that its enabling condition is a good asset inventory. Policy per workload requires knowing what every workload is.

## The mechanisms: VLANs, subnets, and enforcement

Here is the distinction that separates people who have designed a segmented network from people who have drawn one.

A **VLAN** is a layer-2 broadcast domain — a way of making one physical switch behave like several. A **subnet** is a layer-3 address range. In practice they are mapped one to one: VLAN 40 carries `10.20.40.0/24`.

**A VLAN by itself is not a security boundary.** It stops broadcast traffic from crossing and it stops hosts from reaching each other directly at layer 2. But the moment you give those VLANs a router — and you must, or nothing works — traffic between them flows freely unless something *enforces* policy at that routing point. Splitting a flat network into eight VLANs and routing them all on one switch with no access control gives you eight subnets and exactly the same security posture you had before.

Segmentation requires three things together:

1. **Separation** — distinct VLANs and subnets per zone
2. **A chokepoint** — a single, known place where inter-zone traffic must pass: a firewall, a layer-3 switch with ACLs, or a router-on-a-stick
3. **Enforcement and logging at that chokepoint** — default-deny between zones, explicit permits, and a record of both

Practical notes on each mechanism:

- **Switch ACLs / layer-3 switch.** Fast and cheap; policy is stateless and logging is usually thin. Good for coarse zone boundaries in a small site.
- **Firewall on a stick / inter-VLAN firewall.** All inter-zone traffic is trunked to a firewall interface and routed back. Stateful, logged, easy to audit. The cost is that all east-west traffic now traverses one device, so size it for the load.
- **Host-based firewalls.** The only mechanism that segments two machines on the same subnet. Powerful, and only as good as your ability to manage the policy centrally.
- **Private VLANs / client isolation.** Prevents hosts in one VLAN from reaching each other while still reaching the gateway. Ideal for guest wireless and user zones.

Two configuration hygiene items worth stating because they are so commonly missed: **do not use VLAN 1 for anything**, and **explicitly set the native VLAN on trunk ports to an unused, empty VLAN**. Untagged traffic on a trunk defaults to the native VLAN, and leaving that as a VLAN that carries real traffic creates a path between segments that your diagram does not show.

### Wireless as a trust zone

Wireless is not a separate discipline for our purposes; it is a set of zones that happen to arrive over radio. A well-designed site typically has three SSIDs mapping to three zones: **corporate** (managed devices, lands in the internal user zone), **guest** (lands in an internet-only zone with client isolation), and **device/IoT** (lands in the restricted device zone). What matters architecturally is that the SSID determines the VLAN, and the VLAN determines what the traffic is permitted to reach. The mechanics of enterprise wireless authentication belong to another course; the design rule here is simply that **an SSID is a zone entrance and must be treated as one.**

## Building the design: a repeatable procedure

### Step 1 — Inventory the assets

You cannot zone what you have not listed. For each asset record: name, function, owner, whether it is patchable, whether it holds sensitive data, and whether anything outside the organization needs to reach it. Incomplete inventories produce a "miscellaneous" zone, and miscellaneous zones become the flat network you were trying to escape.

### Step 2 — Group by trust, then name the zones

Apply the four questions. Resist creating a zone per department. Aim for the smallest number of zones that still separates genuinely different trust levels — a small office with five well-chosen zones is far better than one with fifteen that nobody maintains.

### Step 3 — Allocate addressing you can read

Choose a scheme where the address tells you the zone. Given `10.<site>.<zone>.<host>`, an analyst reading `10.20.40.15` at 3 a.m. knows immediately it is site 20, zone 40. That is worth more than address-space efficiency.

```text
10.20.10.0/24   Management          switches, firewalls, hypervisors, logging
10.20.20.0/24   DMZ                 reverse proxy, VPN endpoint, mail gateway
10.20.30.0/24   Internal users      staff workstations and laptops
10.20.40.0/24   Servers             file, print, directory, application
10.20.50.0/24   Data                database servers
10.20.60.0/24   IoT and printers    cameras, badge readers, MFPs, HVAC
10.20.70.0/24   Guest wireless      visitor devices, internet only
10.20.80.0/24   Backup              backup servers and targets
```

Leave gaps between zone numbers. You will add a zone, and renumbering a live network is a project nobody enjoys.

### Step 4 — Write the zone-to-zone matrix

This is the deliverable that matters. Rows are source zones, columns are destination zones, and each cell says what is permitted. Start with every cell denied and add only what someone can justify.

| From \ To | Mgmt | DMZ | Users | Servers | Data | IoT | Guest | Backup | Internet |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Mgmt** | full | admin | admin | admin | admin | admin | – | admin | updates |
| **DMZ** | – | – | – | app ports | – | – | – | – | limited |
| **Users** | jump only | web | – | app ports | – | print | – | – | web/DNS |
| **Servers** | – | – | – | app ports | db ports | – | – | backup | updates |
| **Data** | – | – | – | – | cluster | – | – | backup | – |
| **IoT** | – | – | – | – | – | – | – | – | vendor only |
| **Guest** | – | – | – | – | – | – | – | – | web/DNS |
| **Backup** | – | – | – | agent | agent | – | – | – | – |
| **Internet** | – | 443/25 | – | – | – | – | – | – | – |

Read a few cells to see how much design is encoded here. **Users → Data is denied**: analysts and clerks reach data through applications, never directly. **Users → Mgmt is jump-only**: administrators get to management through a hardened jump host, not from the laptop they read email on. **DMZ → Users is denied entirely**: if the public web server is compromised, it cannot turn around and attack staff. **IoT → everything internal is denied**: the badge reader has no business initiating a connection to a file server. **Internet → anything but DMZ is denied**, which is the north-south rule most organizations already have.

Every "–" in that matrix is a lateral movement path that does not exist. That is the product you are shipping.

### Step 5 — Justify every permit in one sentence

For each non-denied cell, write who needs it, for what, and on which ports. If nobody can produce the sentence, the permit does not go in. This document becomes the input to your firewall rule set in the next lesson, and later it becomes the thing an auditor reads instead of interrogating you.

### Step 6 — Decide where the chokepoints are and how traffic reaches them

Draw the physical and logical path. Which device routes between which zones? Does inter-zone traffic actually traverse the enforcement point, or does a second path exist — a dual-homed server with an interface in two zones, a hypervisor bridging VLANs, a management VLAN reachable from a user port? **A host with interfaces in two zones is a router that your policy does not control**, and finding those is a standard part of reviewing someone else's design.

### Step 7 — Plan for exceptions before they arrive

Every real network needs a few: the vendor who supports the HVAC system, the developer who needs temporary database access, the finance package that requires an unusual port. Decide in advance that exceptions are (a) written down with an owner, (b) as narrow as possible in source, destination, and port, and (c) given an expiry date. Undocumented, permanent, forgotten exceptions are how a segmented network decays back into a flat one over five years.

## A worked design: a 40-person medical clinic

**The assets.** Twenty-two clinical and administrative workstations; an electronic health records application server; the EHR database; a file server; a domain controller; six networked printers/scanners; eleven IP cameras and two badge readers; four networked medical devices under a vendor support contract that forbids patching; a public appointment-booking website; guest Wi-Fi in the waiting room; a backup appliance; the network gear itself.

**The trust analysis.** The medical devices cannot be patched and cannot run an agent — permanently unpatchable, so containment is the only available control. The cameras and badge readers are unmanaged and network-facing. Workstations are managed but have browsers and email. The EHR database holds regulated health data and is the highest-value asset in the building. The booking website must accept connections from strangers.

**The zones.** Management, DMZ (booking site and VPN endpoint), Clinical Workstations, Servers (EHR app, file, directory), Data (EHR database), Medical Devices, Building/IoT (cameras, badge readers, printers), Guest Wireless, Backup. Nine zones for forty people, which sounds like a lot until you notice that seven of them contain things that must never talk to each other.

**Two decisions worth defending.** First, the medical devices get their own zone rather than sharing the IoT zone, because their permitted flows are completely different — they must reach the EHR application server on one specific port, and nothing else, in either direction. Sharing a zone with cameras would force you to widen the camera policy to fit. Second, the guest wireless is not merely "restricted"; it is routed straight out with no path to any internal zone at all, which makes it the easiest zone in the building to reason about and the one least likely to be misconfigured later.

**The permit that requires the most care.** Clinical Workstations → Servers on the EHR application port, and Servers → Data on the database port. Two hops, and no shortcut between hop one's source and hop two's destination. A clinician's workstation is never permitted to reach the database directly. That single denied cell is the difference between a compromised workstation reading one clinician's session and a compromised workstation reading every patient record in the practice.

## Reviewing someone else's segmentation

You will be asked to check designs more often than to create them. A short checklist that finds most real problems:

- Is there any zone whose members you cannot enumerate? That is the flat network hiding.
- Does any host have interfaces in two zones?
- Can the user zone reach a management interface — of a switch, a firewall, a hypervisor, a printer's admin page?
- Can any zone reach the data zone other than the application tier?
- Is guest traffic genuinely isolated, including from the printers?
- Is the native VLAN on trunk ports set to an unused VLAN?
- Do unpatchable devices have both restricted inbound *and* restricted outbound policy? Outbound is the one people forget, and it is the one that matters when the device is already compromised.
- Is there a written matrix at all, and does it match what the devices are actually configured to do?

That last question is usually the interesting one.

## Practice

Work on paper and in your own lab; do not apply any of this to a network you do not administer.

**Exercise 1 — Zone a real inventory.** Take the clinic asset list above and add four items your own workplace or school has that it does not: name them yourself. Produce a table with one row per asset and columns for exposure, compromise likelihood, blast radius, and patchability, then assign each asset to a zone. Where two assets you expected to group together end up in different zones, write one sentence explaining which of the four questions split them.

**Exercise 2 — Addressing plan and matrix.** For your zoned inventory, produce:

- An addressing plan in the `10.<site>.<zone>.<host>` style, one line per zone, with a gap of at least ten between zone numbers
- A complete zone-to-zone matrix, every cell filled with either a permit description or a dash
- A justification list: one sentence per permitted cell naming who needs it and for what

Deny by default. If you end up with more than about a quarter of the cells permitted, go back and challenge them.

**Exercise 3 — Build two zones and prove the boundary.** In your lab hypervisor, create two virtual networks representing a user zone and a server zone, with a third VM routing between them. Place a client in the user zone and a service in the server zone. Then:

1. Confirm the client can reach the service, and capture the traffic at the router to prove it passes through the chokepoint.
2. Add a second service on a different port in the server zone that your matrix says the user zone must not reach, and configure the router so it cannot.
3. From the client, attempt both, and record which produced a response and which produced a timeout.
4. Write a three-sentence verification note: what you tested, what you observed, and what evidence proves the boundary is enforced rather than merely drawn.

**Exercise 4 — Find the flaw.** A colleague submits this design for review: *"Six VLANs — users, servers, printers, cameras, guest, and management — all trunked to a single layer-3 switch that routes between them. The firewall sits at the internet edge. Management is VLAN 1. The hypervisor host has a management interface and also carries the server VLAN. Guest Wi-Fi is on its own VLAN with a rule blocking it from the server VLAN."* Write a numbered review listing every problem you can find and the specific change that fixes each. There are at least five.

## Check your understanding

1. A colleague splits a flat network into eight VLANs routed on one layer-3 switch with no ACLs. What changed for an attacker on a compromised laptop, and what is missing?
2. In the clinic design, why do the medical devices get their own zone rather than sharing the IoT zone?
3. Using the `10.<site>.<zone>.<host>` plan, which zone is `10.20.60.14` in, and should it be able to initiate a connection to `10.20.40.20`?
4. Name the review-checklist item that finds "a router your policy does not control."

**Answers:** (1) Almost nothing — broadcast domains are separated, but inter-VLAN traffic routes freely; a chokepoint with default-deny enforcement and logging is missing. (2) Their permitted flows are completely different (one port to the EHR application server only); sharing a zone would force a wider policy for the cameras. (3) IoT and printers (zone 60); no — the matrix denies IoT to everything internal. (4) "Does any host have interfaces in two zones?"
