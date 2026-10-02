---
lesson_id: net110-09
course_id: net110
pathway: cybersecurity-support-technician
title: 'Project: Secure Network Design for a Branch Office'
order: 9
kind: project
competency_ids:
  - D2-S1-C01
  - D1-S1-C05
  - D2-S1-C05
objectives: []
---

## The goal

Produce a **secure network design document** for a new branch office: complete enough that a network technician could build it from your document, and specific enough that a reviewer could check every control against a stated requirement.

The first project asked you to read a network somebody else built. This one asks you to build one. Three judgments are being assessed, and they are three of the things this course taught:

- Can you **place assets in zones matching their trust level** and connect the site with a correctly scoped tunnel?
- Can you **write and order firewall rules** that implement your zone policy without opening paths nobody asked for?
- Can you **choose encryption and key handling** appropriate to each state your data exists in?

Budget five hours. Roughly one hour on inventory and zoning, one on addressing and the zone matrix, one and a half on the rule set, one on the tunnel and encryption plan, half an hour on the review checklist and cleanup. You are producing a document, not a build — but every part of it must be specific enough to be implemented without a follow-up conversation.

## The client

**Kestrel Diagnostics** is a regional medical laboratory. Headquarters is an existing, well-segmented site you are not redesigning. You are designing **the new Ravensworth branch**, opening in eleven weeks, and its connection back to headquarters.

### The site

A single leased floor: reception, a specimen intake counter, a laboratory area, six administrative desks, two clinician consulting rooms, and a small comms cupboard. One internet circuit with a static public address. A second, cellular backup circuit is budgeted.

### What will be on the network

**People and their devices**

- 6 administrative staff on managed laptops, wired and wireless
- 4 laboratory technicians on managed workstations, wired
- 2 clinicians on managed laptops, wireless, who also work from home
- Reception uses one managed workstation
- Visitors and patients in the waiting area expect Wi-Fi

**Systems at the branch**

- 3 networked analyzers (blood chemistry, hematology, urinalysis). Vendor-supported under contract; **the contract forbids the customer from patching them or installing any software**. Each must send results to the laboratory information system at headquarters. Each has a vendor-accessible management interface on TCP 8443.
- 1 specimen label printer at the intake counter, and 2 general office multifunction printers
- 1 local file cache server for large imaging files, so technicians are not pulling everything across the link
- 1 badge reader at the main door and 1 at the laboratory door
- 4 IP cameras: two on entrances, two in the specimen storage area
- 1 environmental monitor on the specimen refrigerator, which must alert when temperature drifts
- 1 wireless controller and 3 access points
- Network gear: one firewall/router, two switches, and a small uninterruptible power supply with a network management card

**Systems at headquarters that branch users need** (headquarters addressing is `10.5.0.0/16`)

- Laboratory information system application: `10.5.40.30`, HTTPS
- Laboratory information system database: `10.5.50.30`, TCP 1433 — reached only by the application tier
- File server: `10.5.40.20`, SMB
- Directory services: `10.5.40.10`, standard directory and authentication ports
- Internal DNS and NTP: `10.5.40.10` and `10.5.40.11`
- Patch/update server: `10.5.40.5`
- Print server: `10.5.40.15`
- Backup infrastructure: `10.5.80.5`
- Network management and logging: `10.5.10.20`

**Stated requirements from the client**

1. Patient test results are regulated health data. The client's compliance officer has asked, in writing, "what protects this data at every point?" and expects a specific answer per point.
2. Analyzer results must reach the laboratory information system reliably. A results backlog is a clinical problem, not an IT problem.
3. The vendor supporting the analyzers needs periodic remote access to their management interfaces. The vendor has asked for "a VPN into the branch network."
4. The two clinicians must reach the laboratory information system from home.
5. Patient and visitor Wi-Fi must exist and must not be able to reach anything belonging to the laboratory.
6. The local file cache must be backed up. Headquarters' backup team owns the backup infrastructure.
7. The branch must keep working if the link to headquarters drops — at minimum, staff must be able to work locally and results must queue rather than be lost.
8. The client's insurer requires that laptops be protected against loss and theft.

### Constraints you must design within

- The analyzers cannot be patched, cannot run an agent, and their vendor has published no hardening guidance.
- The environmental monitor speaks only unauthenticated HTTP and SMTP. This is not negotiable; the device is what it is.
- Two of the cameras are the same model deployed at headquarters, where a firmware review found a hardcoded management account that cannot be removed.
- Budget allows one firewall at the branch, not a separate internal firewall.
- Headquarters will not accept a design in which the branch can reach `10.5.0.0/16` generally.

## Requirements

Numbered so a reviewer can grade them one at a time.

**R1 — Asset inventory and trust analysis.** A table with one row per asset (group identical devices, and say how many are in each group) and columns for: what it is, what it does, exposure, compromise likelihood, blast radius, patchability, and whether it handles regulated data. Then a paragraph naming the three assets you consider highest risk and why. A reviewer must be able to check your later sections against this table and find nothing unaccounted for.

**R2 — Zone design.** Name your zones, and for each state its trust level, which assets it contains, and the single sentence that justifies its separate existence. Where you split two device types that a naive design would combine, say which of the four trust questions split them. Where you combined two things, say why the combination is safe.

**R3 — Addressing plan.** One line per zone, in a readable scheme, with gaps for growth, and stating the branch supernet you would request from headquarters so that branch addressing does not collide with any other site. Include the tunnel's own addressing.

**R4 — Zone-to-zone matrix.** A complete matrix, every cell filled with either a permit description or a dash, including headquarters and the internet as columns and rows. Every permit gets a one-sentence justification in an accompanying list naming who needs it and for what. Deny by default.

**R5 — Firewall rule set.** Implement the matrix as an ordered rule table with the columns from lesson 04: ID, action, source, destination, service, log, comment with owner and reference. It must:

- Be ordered so that no rule is shadowed
- End with an explicit, logged default deny
- Contain **no** return-traffic rules, and a one-sentence note saying why not
- State, per boundary, whether you drop or reject, and why
- Include your egress policy for each zone, not only inbound rules
- Contain at least one rule with an expiry date, and say what happens when it expires
- Use named objects rather than bare addresses in at least the zone definitions

Then, beneath the table, list three rules a hurried implementer would have written more widely than you did, and state the exact path each would have opened.

**R6 — Site-to-site connectivity.** Design the branch-to-headquarters tunnel:

- Protocol family and why, given the equipment and the requirement
- Traffic selectors or `AllowedIPs`, written out exactly — and note that headquarters will not accept a design that reaches `10.5.0.0/16` generally
- Authentication method and why
- Key parameters: encryption, integrity, key exchange group, forward secrecy, lifetimes
- Dead peer detection or keepalive settings, and MTU handling
- What happens on the cellular backup circuit, and what monitoring alerts when the primary tunnel drops
- How requirement 7 is satisfied: what still functions with the tunnel down, and how analyzer results survive the outage

**R7 — Remote access design.** Two separate designs, because they are two different problems:

- **The clinicians.** Remote-access VPN or brokered application access, which zone the far end lands in, split or full tunnel with a stated reason, what is logged, and how a lost laptop is revoked.
- **The analyzer vendor.** The vendor asked for "a VPN into the branch network." Write your answer to them: what you will provide instead, the exact scope, how it is enabled and disabled, what is logged, and one sentence explaining to a non-technical stakeholder why the request as stated was refused.

**R8 — Encryption plan.** A table with one row per body of data, covering at minimum: analyzer results in transit branch-to-headquarters, results at rest in the laboratory information system database, imaging files on the local cache server, backups of the cache server, data on staff laptops, data on the clinicians' laptops at home, camera footage, and log data. Each row states the data, its state, the adversary the control addresses, the specific control and algorithm or protocol version, who holds the key, the rotation interval, and the recovery path.

Then add a short section answering the compliance officer's question directly, in language they will understand, in under 200 words.

**R9 — Key handling.** A separate short table listing every key or certificate in your design: what it protects, how it is generated, where it is stored, who may access it, rotation, revocation, and escrow. Finish with two sentences naming the key whose compromise would be worst and the compensating control that limits the damage.

**R10 — Monitoring and verification plan.** Where you would place a sensor and whether it is detection or prevention, using lesson 05's vocabulary and stating how traffic reaches it. Then a verification checklist a technician runs on build day: at least eight tests, each with the action, the expected result, and the evidence that proves it. At least three tests must verify that something is **blocked**, and at least one must verify that a control fails in the intended direction.

**R11 — Review checklist and known compromises.** Run the segmentation review checklist from lesson 03 against your own design and record the answers. Then list every place you knowingly accepted a risk you could not eliminate, what the residual risk is, what compensating control you applied, and who at the client should sign off on it.

## Constraints

- **Vendor-neutral.** Generic rule tables, open-source or protocol-level configuration syntax. Do not design around one appliance's feature list.
- **Every control traces to a requirement or a stated risk.** A control with no requirement behind it is scope you cannot defend in a budget meeting.
- **Stay inside this course's boundaries.** Which zones may talk, which rules enforce it, and which encryption protects the data are yours. *Which people* hold which roles, how they authenticate, and how privileges are granted belong to the identity course — where your design depends on those, state the dependency in one line and move on. Cloud-hosted services are out of scope; assume headquarters is on-premises. If your design produces an incident, the response process is out of scope; your monitoring plan ends at the alert.
- **No design that requires the analyzers or the environmental monitor to change.** Design around them. That is the actual job.
- **Specificity.** "Restrict access appropriately" is not a design. Name the source, the destination, the port, and the direction.
- **Length.** Eight to fourteen pages including tables. If you are past fifteen, you are explaining networking rather than designing a network.

## Definition of done

1. Every asset in the client description appears in R1 and in exactly one zone in R2.
2. The R4 matrix has no empty cells, and every permit has a justification sentence.
3. Every permitted cell in R4 appears as at least one rule in R5, and every rule in R5 traces back to a permitted cell. A reviewer can check this in both directions.
4. No rule in R5 is shadowed, and the set ends with an explicit logged deny.
5. The tunnel in R6 has explicit selectors that do not include `10.5.0.0/16` as a whole, and a stated behavior when it is down.
6. R7 contains a written refusal of the vendor's request as stated, with an alternative of equal or better usefulness to them.
7. The R8 table has a row for every data body listed, none of which is answered with "encrypted" alone — each names the adversary and the key holder.
8. Every key in R9 has a storage location that is not a configuration file or a repository, and a tested revocation path.
9. R10's checklist has at least eight tests, at least three of which verify a block.
10. R11 lists at least three accepted risks with compensating controls and a named sign-off.
11. The unpatchable analyzers, the plaintext environmental monitor, and the cameras with a hardcoded account are each addressed explicitly, by containment rather than by remediation.
12. A network technician who has never spoken to you could build the branch from your document.

## Hints

- **Start with the assets that cannot be fixed.** The analyzers, the environmental monitor, and the cameras constrain the design more than anything the users need. Design their containment first and the rest of the zoning tends to fall out of it.
- **The analyzers have two completely different flows** — results outbound to headquarters, and vendor management inbound. Those have different sources, different directions, and different risk. Do not let one rule cover both.
- **The environmental monitor speaks plaintext.** You cannot encrypt what it sends. So the question becomes: what can it reach, who can reach it, and what is the smallest possible segment it can live in? Note also that it needs to *send an alert*, which means an outbound path you must scope rather than deny.
- **"A VPN into the branch network" is the wrong shape of request**, and refusing it well is part of the assessment. Think about what the vendor actually needs: reachability to three specific addresses on one port, on request, logged, with an off switch.
- **Requirement 7 is a design constraint, not a footnote.** Ask what breaks when the tunnel drops: name resolution, time, authentication, results delivery, printing. Some of those need a local answer, and deciding which is a real architectural decision.
- **Two hops, never one.** Branch users reach the laboratory information system application; the application reaches its database. There is no rule anywhere in your set that lets a branch workstation reach `10.5.50.30`.
- **Egress is half the rule set.** The unpatchable devices especially: their outbound policy is the control that matters once they are compromised, and it is the one most designs forget.
- **Wireless is three zones, not one network.** Corporate, patient/guest, and device — and the SSID is the zone entrance.
- **Encryption in transit terminates somewhere.** Say where. If TLS ends at the branch firewall and the traffic is cleartext for the last hop, that hop is a segment you have just made security-relevant.
- **The insurer's requirement in item 8 is about a specific adversary** — physical loss. Name the control that addresses it, and be explicit about the adversary it does *not* address, because the compliance officer will otherwise assume it covers more than it does.
- **Backups are data at rest, offsite, owned by another team.** That combination is where encryption plans usually have a hole. Ask who holds the key and whether it survives the branch burning down.
- **Write the verification checklist before you finish the rule set.** If a rule cannot be tested, you cannot prove it works, and you will discover that faster from the test side.
