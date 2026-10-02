---
lesson_id: net110-04
course_id: net110
pathway: cybersecurity-support-technician
title: Firewalls and Rule Design
order: 4
kind: lesson
competency_ids:
  - D1-S1-C05
objectives:
  - Write and order firewall rules that implement a stated access requirement without opening unintended paths
---

## What a firewall actually decides

A firewall is a decision engine. For every packet or connection that reaches it, it answers one question — allow, deny, or drop — by walking a list of rules and acting on the first one that matches. That is nearly the whole mechanism. The difficulty is not in the engine; it is in the list.

In the previous lesson you produced a zone-to-zone matrix: a statement of which zones may talk to which, on what. This lesson turns that statement into a rule set. Those two artifacts should be readable against each other, cell by cell and rule by rule, by someone who was not in the room when either was written. When they diverge — and they will, because change requests arrive faster than documentation gets updated — the divergence is the finding.

The objective is precise, so hold yourself to it: rules that implement a **stated** access requirement, **without opening unintended paths**. Almost anyone can write a rule that makes the application work. The skill being taught is writing the *narrowest* rule that makes the application work, and being able to demonstrate that nothing else got through with it.

## Kinds of firewall, and what each can see

**Packet filter (stateless).** Examines each packet in isolation against source address, destination address, protocol, and ports. Fast, cheap, and blind: it has no idea whether a packet is part of a conversation you allowed. Stateless filtering requires you to write rules for return traffic by hand, which is where classic mistakes live. Mostly encountered now as router and switch ACLs.

**Stateful inspection.** Keeps a **connection table**. When a permitted connection is established, its return traffic is allowed automatically because the firewall remembers it. This is the default behavior of essentially every modern firewall, and it changes how you write rules: you write one rule for the direction that initiates, and the responses take care of themselves.

The state table is worth understanding concretely. For TCP the firewall tracks handshake state and closes the entry on FIN/RST or timeout. For UDP, having no connection to track, it creates a pseudo-entry on the first packet and expires it after a short idle timeout — often 30 seconds. For ICMP it matches replies to requests. Two practical consequences: state tables are finite, so a device under heavy connection load can exhaust one; and long-idle TCP sessions get silently evicted, which is the actual cause of many "the application drops after fifteen minutes of inactivity" tickets.

**Application-layer / next-generation.** Inspects beyond the header — identifying that traffic on 443 is a particular application, matching URLs, or decrypting TLS at the boundary to inspect payloads. More visibility, more cost, and more policy consequences: TLS interception means the firewall holds a private key and sees plaintext, which is a decision with legal and privacy weight, not merely a technical one.

**Proxy.** Terminates the connection and makes its own on the client's behalf. The client never talks to the server directly. Strong control and detailed logging; higher latency and application compatibility limits.

**Host-based firewall.** Runs on the endpoint itself. The only mechanism that constrains two hosts on the same subnet, and therefore an essential part of segmentation rather than an alternative to it. Its weakness is that it is administered on the machine it protects, so a fully compromised host can change its own rules — which is why host rules complement network rules and do not replace them.

**Web application firewall.** Sits in front of a specific web application and filters HTTP-layer abuse. Adjacent to this course; know the term and that it is not a substitute for a network firewall.

## Anatomy of a rule

Whatever the vendor, a rule carries the same fields:

| Field | Meaning | Common trap |
| --- | --- | --- |
| Order / ID | Position in the list; the engine matches top-down | Correct rule in the wrong position does nothing |
| Source | Address, range, or object group | `any` when a `/24` would do |
| Destination | Address, range, or object group | `any` in a permit rule is rarely correct |
| Service / port | Protocol and destination port | Permitting a whole port range to cover one port |
| Action | allow, deny, drop, reject | Choosing silently based on habit rather than design |
| Logging | Whether matches are recorded | Off, so nobody can tell whether the rule ever fires |
| Comment / owner / ticket | Why it exists and who asked | Blank, which makes the rule immortal |
| Schedule / expiry | Time-bound applicability | Absent, so temporary rules are permanent |

The last two columns are the ones that separate a maintainable rule set from an archaeological site. A rule with no stated owner and no stated reason cannot be safely removed by anyone in five years, so it never is, and the rule set only ever grows.

### Deny versus drop versus reject

- **Drop** discards the packet silently. The sender sees a timeout and retransmits. Preferred for the internet-facing default rule: it gives an outside scanner no information and costs it time.
- **Reject** discards the packet and sends back an explicit refusal — a TCP RST or an ICMP administratively-prohibited message. The sender fails instantly. Preferred *inside* the network, because a fast, clear failure is far easier for your own users and helpdesk to diagnose than a thirty-second hang.

Make that choice deliberately per boundary and write down why. In lesson 02 you learned to tell these apart from the client side; this is the configuration setting that produces the difference.

## The two principles that govern ordering

### First match wins

The engine evaluates rules top to bottom and stops at the first match. Everything below a matching rule is irrelevant for that packet. Consequences:

- **Specific before general.** A narrow deny placed below a broad allow never fires.
- A rule can be **shadowed** — fully covered by an earlier rule so it can never match. Shadowed rules are dead code, and dead code in a rule set is dangerous because people read it and believe it.
- Order also affects performance on busy devices, since high-volume traffic matching a rule near the bottom is evaluated against everything above it. Correctness first, then performance.

Here is a shadowing example that gets shipped constantly:

```text
10  allow  10.20.30.0/24  ->  any            tcp 443    # staff web browsing
20  deny   10.20.30.0/24  ->  198.51.100.0/24 tcp 443   # block the bad range
```

Rule 20 is unreachable. Every packet it was meant to catch matched rule 10 first. Swap them and the intent is implemented. This kind of error does not announce itself: the rule is present, it looks right in a screenshot, and it does nothing.

### Default deny

The last rule in any zone-facing policy is **deny all, logged**. Everything not explicitly permitted is refused. The alternative — permit by default, deny specific known-bad things — is unmaintainable, because it requires you to enumerate everything harmful in advance, forever.

Most firewalls have an implicit deny at the end. Write an explicit one anyway, with logging turned on. The explicit version gives you a rule to count matches against, and "what is hitting the bottom of my policy?" is one of the most informative questions you can ask a firewall.

## Egress filtering: the half everyone skips

Inbound policy gets all the attention. Outbound policy is where a great deal of the defensive value actually is, because a compromised internal host has to reach *out* to be useful to anyone: to retrieve tooling, to receive instructions, to move data off your network.

A default-allow-outbound network gives all of that away. Reasonable egress policy for a user zone:

- **DNS to your internal resolvers only.** Everything else on 53 is denied and logged. This forces all name resolution through a place you can see and filter, and it turns "workstation queried an external resolver" into a signal.
- **HTTP/HTTPS via the proxy or the permitted path**, not from arbitrary hosts to arbitrary ports.
- **NTP to your internal time sources only.**
- **SMTP on 25 denied from everything except the mail gateway.** A workstation speaking SMTP directly to the internet is either a misconfiguration or something worse.
- **Everything else denied and logged**, including outbound SSH, RDP, and database ports.

Servers get an even tighter egress policy: they need updates, DNS, time, and their specific integrations, and nothing else. A file server has no legitimate reason to make outbound connections on arbitrary high ports.

Egress filtering is unpopular because it breaks things at first. Budget for that: run the policy in log-only mode for a week, read what would have been denied, add the legitimate flows as explicit permits with owners, then enforce.

## From requirement to rules: a worked example

**The requirement, as it arrives.** *"The new HR application needs to work. HR staff will use it from their laptops. It talks to a database. The vendor needs to get in to support it. Also it sends notification emails."*

That is how requirements actually arrive, and it is not yet implementable. The first job is to interrogate it into specifics.

**The requirement, after questions.**

- HR staff (in the internal user zone, `10.20.30.0/24`) reach the HR application server `10.20.40.22` over HTTPS on TCP 443.
- The application server reaches the database `10.20.50.11` on TCP 5432.
- The application server sends mail through the internal mail relay `10.20.40.30` on TCP 25.
- The vendor supports the application through the existing remote-access path, terminating in the VPN zone `10.20.20.0/24`, and needs SSH on TCP 22 to the application server only.
- Nothing else changes.

Note how many separate flows hid inside four sentences of prose, and note the questions that surfaced them: *which hosts, which ports, which direction, and who initiates.* Ask those four every time.

**The rules.** Written in a generic tabular form first, because that is the artifact you review with the requester:

```text
ID  Action  Source            Destination     Service    Log  Comment
--  ------  ----------------  --------------  ---------  ---  --------------------------------
10  allow   10.20.30.0/24     10.20.40.22     tcp/443    yes  HR staff to HR app (TCK-4471)
20  allow   10.20.40.22       10.20.50.11     tcp/5432   yes  HR app to HR database (TCK-4471)
30  allow   10.20.40.22       10.20.40.30     tcp/25     yes  HR app notifications via relay
40  allow   10.20.20.0/24     10.20.40.22     tcp/22     yes  Vendor support SSH, expires 2026-12-31
99  deny    any               any             any        yes  Default deny
```

Five things about this rule set are deliberate, and each is a place the naive version would have gone wider:

1. **No return-traffic rules.** The firewall is stateful; responses to permitted connections are allowed by the state table. Adding reverse rules would open genuinely new paths — a rule permitting `10.20.40.22 -> 10.20.30.0/24 tcp/443` would let a compromised application server initiate connections *to* staff laptops.
2. **The database rule's source is the application server, not the user subnet.** HR staff never reach 5432. If the requirement had been implemented as "HR staff need the HR system," someone would have permitted `10.20.30.0/24 -> 10.20.50.11 tcp/5432` and quietly demolished the data zone boundary from lesson 03.
3. **The vendor rule's destination is one host, not the server zone.** And it has an expiry date in the comment, so the annual review has something to act on.
4. **Mail goes to the relay, not to the internet.** The application server does not get outbound 25 to `any`.
5. **Logging is on for every rule**, including the permits. Permit logs are how you later answer "did this ever get used?" — which is how rules eventually get removed.

**What the sloppy version looks like.** For contrast, here is the same requirement implemented in a hurry:

```text
10  allow   10.20.30.0/24     10.20.40.0/24   any        no   HR app
20  allow   10.20.40.0/24     10.20.50.0/24   any        no   database
30  allow   any               10.20.40.22     tcp/22     no   vendor
99  deny    any               any             any        yes
```

Rule 10 gives every user access to every port on every server. Rule 20 gives every server full access to the entire data zone. Rule 30 exposes SSH to the internet. Nothing is logged, nothing is dated, and nothing records who asked. Every one of those is the *same* rule as the good version with one field widened, which is exactly why this failure mode is so common: it works, the ticket closes, and the damage is invisible until someone audits it.

### The same policy in open-source syntax

You should be able to recognize rules in the forms you will meet on real hosts. `nftables`, filtering inbound on the application server itself:

```bash
nft add table inet filter
nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'

# established and related return traffic
nft add rule inet filter input ct state established,related accept
nft add rule inet filter input ct state invalid drop
nft add rule inet filter input iif lo accept

# HR staff to the application over HTTPS
nft add rule inet filter input ip saddr 10.20.30.0/24 tcp dport 443 \
  log prefix \"hr-app-https \" accept

# vendor support SSH from the VPN zone only
nft add rule inet filter input ip saddr 10.20.20.0/24 tcp dport 22 \
  log prefix \"hr-app-ssh \" accept
```

The `policy drop` on the chain is the default deny, stated once at the top rather than as a final rule. The `ct state established,related accept` line is the stateful shortcut that makes return traffic work; without it, and with a drop policy, this host would send packets and never receive replies. `ct state invalid drop` discards packets that do not belong to any tracked connection.

The older `iptables` form of the same idea, which you will still find everywhere:

```bash
iptables -P INPUT DROP
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -s 10.20.30.0/24 -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -s 10.20.20.0/24 -p tcp --dport 22 -j ACCEPT
```

Note that `-A` appends, so **the order you type the commands is the order the rules evaluate in**. Adding a deny after an allow that already covers the traffic accomplishes nothing — the same first-match trap as before, now with the added hazard that it is easy to append in the wrong sequence during a late-night change.

## Objects, groups, and keeping a rule set readable

Real rule sets do not contain raw addresses. They contain **objects**: named definitions such as `HR-APP-SERVER = 10.20.40.22`, `USER-ZONE = 10.20.30.0/24`, `DB-POSTGRES = tcp/5432`. Rules reference the names.

This matters for more than aesthetics. When the HR server is readdressed, you change one object rather than hunting through forty rules and missing one. And a rule reading `allow USER-ZONE -> HR-APP-SERVER : HTTPS` can be reviewed by someone who does not have your addressing plan memorized, which is most of the people who will ever review it.

Two cautions. Groups grow: a group named `ADMIN-WORKSTATIONS` that started with three entries and now has twenty-six has silently widened every rule that references it, and nothing about the rules changed. Audit group membership, not just rules. And avoid nesting groups more than a level or two deep, because the effective scope of a rule stops being readable at a glance — which defeats the purpose.

## Rule lifecycle

Rule sets rot. They rot in a specific, predictable way: additions are urgent and removals are optional. A discipline that prevents it:

**Change control.** Every rule change has a request, a business justification, a named owner, and a ticket reference recorded in the rule comment. Emergency changes are permitted and get a retroactive ticket within one business day — no exceptions, because "we'll document it later" is how the untracked rules got there.

**Test before enforce, where you can.** Add permits in log-only or monitor mode first when the platform supports it, confirm the expected traffic matches and nothing unexpected does, then enforce.

**Verify after.** Confirm two things, always: the intended traffic now works, **and** an adjacent unintended path still fails. Testing only the first half is the most common verification error in this discipline. If you permitted TCP 443 to one host, check that 443 to its neighbour is still refused and that 8443 to the same host is still refused.

**Periodic review.** At least annually, walk the rule set and ask of each rule: does the owner still exist, does the justification still hold, has it matched any traffic in the last ninety days? Hit counters answer the last question, which is why logging on permit rules is worth its cost.

**Look for the four decay patterns.**

- **Shadowed rules** — unreachable because an earlier rule covers them
- **Redundant rules** — fully contained by another rule, so removing them changes nothing
- **Overly permissive rules** — `any` in a field that could be specific
- **Orphaned rules** — the server was decommissioned two years ago and the permit remains

## Common mistakes, collected

- Permitting a **port range** because the documentation listed one, when the application uses three ports in it.
- Writing rules against **DNS names that resolve dynamically**, so the effective policy changes without a change request.
- Permitting **ICMP everywhere** or **denying ICMP entirely**; both are wrong, and the second breaks path MTU discovery as covered in lesson 02.
- Forgetting **IPv6**. A policy that only filters IPv4 on a dual-stack network is half a policy, and the unfiltered half is the one nobody is watching.
- Leaving **management interfaces reachable from the user zone**. The firewall's own admin interface is an asset in the management zone like any other.
- **Testing only the allow case** after a change.
- Placing a rule set on the edge firewall that duplicates what should be enforced between internal zones, and concluding the internal traffic is covered.

## Practice

Everything here belongs on your own lab machines.

**Exercise 1 — Translate a requirement.** A stated requirement arrives: *"The warehouse scanning app on tablets in the warehouse Wi-Fi zone (`10.20.65.0/24`) needs to reach the inventory service on `10.20.40.31` over HTTPS. The inventory service reads and writes the inventory database on `10.20.50.14` using MySQL. Warehouse supervisors, who are on ordinary staff laptops in `10.20.30.0/24`, need the inventory service's web reporting page, also HTTPS. Nobody in the warehouse should reach anything else internal. The inventory service needs OS updates from the internal patch server `10.20.40.5` on 443."*

Produce a rule table with the columns from this lesson — ID, action, source, destination, service, log, comment — implementing exactly that and nothing more, ending with an explicit logged default deny. Then write, underneath, the four questions you would have had to ask if this requirement had arrived as one vague sentence, and identify one flow in the list above that a careless implementer would widen and how.

**Exercise 2 — Find the ordering bug.** Given this rule set, state which rules can never match and why, then rewrite the set in correct order:

```text
10  allow  any             10.20.40.0/24  tcp/443
20  deny   10.20.65.0/24   10.20.40.0/24  any
30  allow  10.20.30.0/24   10.20.50.11    tcp/3306
40  deny   any             10.20.50.0/24  any
50  allow  10.20.40.31     10.20.50.14    tcp/3306
99  deny   any             any            any
```

For each problem, say whether it is a shadowed rule, a redundant rule, an overly permissive rule, or a rule that contradicts the segmentation principles from lesson 03.

**Exercise 3 — Build and verify it.** On a lab VM running a host firewall, implement Exercise 1's policy as far as your lab allows, using `nftables` or `ufw` with a default-drop input policy, a stateful established/related accept, and logging on each rule.

Then verify, from a second lab VM, and record the evidence for each:

1. The permitted flow succeeds — capture the handshake.
2. The **same source to a different port** on the same destination fails.
3. A **different source** to the permitted port fails.
4. Your default-deny rule logged both failures — show the log lines.

Write a short verification note stating what you tested, what you observed, and one sentence naming a path you did *not* test that a reviewer should check.

**Exercise 4 — Audit a rule set for decay.** Take the rule set you built and deliberately add three defects: one shadowed rule, one rule with `any` where a `/24` belongs, and one rule with no comment or owner. Trade rule sets with a classmate if you can, or set yours aside for a day. Then audit it as if you had never seen it: list each finding, its category, its risk in one sentence, and the exact change that fixes it.
