---
lesson_id: net110-05
course_id: net110
pathway: cybersecurity-support-technician
title: Intrusion Detection and Prevention
order: 5
kind: lesson
competency_ids:
  - D1-S1-C05
  - D1-S1-C04
objectives:
  - Choose detection or prevention placement for an IDS/IPS sensor and interpret the alerts it produces
---

## Where this control fits

A firewall answers a question about *permission*: is this conversation allowed to happen? An intrusion detection or prevention system answers a question about *content and pattern*: given that this conversation is allowed, does it look like something bad?

That is why this lesson follows the firewall lesson rather than preceding it. A sensor watching a flat, unfiltered network is drowning — it sees every conversation the network can produce and has no way to say which ones were supposed to exist. A sensor watching traffic that policy has already narrowed is looking at a smaller, better-defined stream, and its alerts mean more. Segmentation and filtering are what make detection affordable.

Two decisions define this lesson. **Placement**: where in the network does the sensor sit, and does it sit *in* the traffic path or beside it? And **interpretation**: when it produces an alert, what does the alert actually claim, how do you check the claim, and what do you do next? The pathway teaches alert correlation and the full incident-response workflow elsewhere; your responsibility here ends at a well-formed, evidence-backed handoff.

## IDS versus IPS

The distinction is entirely about whether the device can stop traffic.

An **IDS** (intrusion detection system) observes and reports. Traffic reaches its destination regardless of what the sensor thinks. It typically receives a *copy* of traffic, so it is out of the data path and cannot cause an outage or add latency, and it cannot break an application by misjudging it. What it produces is knowledge, after the fact — sometimes milliseconds after, sometimes minutes.

An **IPS** (intrusion prevention system) sits **inline**: traffic passes through it, and it can drop packets, reset connections, or block a source. It stops things. It also becomes a component whose failure is your outage and whose false positive is a broken business application.

Neither is "better." The choice follows from three questions:

1. **What is the cost of a false positive here?** On a link carrying clinical systems or payment processing, a wrongly dropped connection may be worse than a briefly undetected probe. On a guest network, dropping aggressively costs almost nothing.
2. **What is the cost of latency and of the device failing?** An inline device is a chokepoint. Size it, and decide its failure behavior.
3. **Is anyone available to act on an alert?** A detection-only sensor whose alerts nobody reads on a Saturday provides no protection on a Saturday. If the environment has no round-the-clock response, prevention on the highest-confidence rules earns its keep.

The mature answer is usually **both, in different places, tuned differently**: prevention on a small set of high-confidence, low-false-positive signatures at the perimeter, and detection on a much broader rule set internally where a wrong drop would be expensive.

### Fail-open and fail-closed

For any inline device you must decide what happens when it dies or is overwhelmed.

- **Fail-open** — traffic passes unfiltered. Availability preserved, protection lost.
- **Fail-closed** — traffic stops. Protection preserved, availability lost.

This is a business decision that you should never make silently. Write it down, per link, alongside who agreed to it. A hardware bypass unit or a bypass-capable network card is what implements fail-open for a physical link; without one, an inline appliance losing power is fail-closed whether you intended it or not.

## Network-based and host-based sensors

**NIDS/NIPS** watch network traffic. Strengths: one sensor covers many hosts, including devices that cannot run an agent — the cameras, printers, and medical devices from lesson 03. Limits: it sees only what crosses its vantage point, it cannot read encrypted payloads without decryption, and it does not know what happened *on* the host.

**HIDS/HIPS** run on the endpoint. They see process execution, file changes, local logs, and — critically — application data *before* encryption and *after* decryption. Limits: an agent per host, no coverage of unmanaged devices, and a fully compromised host can lie about itself.

They cover each other's gaps. Where you can only have one, the network sensor gives broader coverage for less effort; where the crown-jewel assets are, host sensors are worth the administrative cost.

## Getting traffic to the sensor

An out-of-band sensor needs a copy of the traffic, and how you produce that copy determines what it can see.

**SPAN / port mirroring.** The switch copies traffic from chosen ports or VLANs to a monitor port. Cheap, no new hardware, reconfigurable in software. Two real limitations: the mirror port can be oversubscribed — mirroring two gigabit ports onto one gigabit monitor port means packets are dropped, and the switch drops them silently — and mirroring is a low-priority function that the switch will abandon under load. SPAN is fine for moderate volumes and untrustworthy at line rate.

**Network TAP.** A passive hardware device spliced into the link that copies every frame. It cannot be oversubscribed in the same way, it does not consume switch resources, and it does not drop under load. It costs money and it requires touching the physical link. For a link whose visibility genuinely matters, a TAP is the correct answer.

**Inline.** The IPS is a hop in the path. No copying involved; it sees everything on that link because everything must go through it.

**Host agent.** No network plumbing at all; the sensor is on the endpoint.

![Diagram of sensor placement options: an inline IPS at the internet edge, an out-of-band IDS fed by a TAP on the DMZ link, and a SPAN-fed IDS watching the inter-zone chokepoint](./img/ids-sensor-placement.png)

## Choosing placement

Placement is a question about vantage point: *what conversations do I need to see, and where do all of them pass?*

**Outside the perimeter firewall.** Sees everything aimed at you, including all the noise the firewall is about to discard. Enormous alert volume, low signal, and mostly useful for research or for measuring what the internet is doing to you. Rarely the right place for an operational sensor.

**Inside the perimeter firewall.** Sees traffic that survived policy. Far less noise, and every alert is about traffic that was actually permitted — which makes each one worth more. This is the standard first sensor location, and it is the one to argue for if you can only have one.

**On the DMZ segment.** Watches your internet-facing services specifically. High value because these are the systems strangers are allowed to talk to. Traffic to them is often TLS-encrypted, so plan for what you can see — connection metadata, certificate details, request patterns, volumes — and consider a host sensor on the servers themselves for the payload view.

**At the inter-zone chokepoint.** Watches east-west traffic between the zones you built in lesson 03. This is where lateral movement becomes visible: a user-zone workstation probing the server zone, a device zone host attempting to reach data. Historically neglected, disproportionately valuable, and only possible because you built chokepoints.

**In front of a specific critical asset.** A dedicated sensor on the database segment or in front of the payment system. Narrow scope, so you can tune it aggressively and run prevention on it with confidence.

**On endpoints.** Where encryption defeats network inspection and where you need to see what the traffic actually caused.

A sane build-out order for a small organization: inside the perimeter first, then the inter-zone chokepoint, then the DMZ, then host agents on crown jewels. Each step answers a question the previous step raised.

### Placement mistakes worth naming

- **Placing a sensor where asymmetric routing splits a conversation.** If the request goes one way and the reply returns by another path, the sensor sees half a conversation, cannot reassemble the session, and will both miss real events and invent false ones. Verify that your vantage point sees both directions.
- **Placing a sensor inside a NAT boundary and reporting the translated address.** Alerts that all name the firewall's address as the source are nearly useless. Place the sensor where original addresses are visible, or make sure you can correlate with NAT session logs.
- **Ignoring encryption in the plan.** A sensor pointed at a link carrying 95 percent TLS, configured with payload signatures only, will report almost nothing and be pronounced useless. Decide up front whether this vantage point is for payload inspection or metadata analysis.
- **Oversubscribed SPAN.** Silent packet loss produces silent detection gaps, and nothing in the alert console tells you.

## How sensors decide: three detection methods

**Signature / rule-based.** Matches traffic against patterns describing known-bad content or behavior: a byte string, a URI pattern, a certificate detail, a protocol anomaly. Precise, explainable, and fast to triage because the rule says what it thinks it found. It only catches what someone has already written a rule for, and rules go stale, so the feed must be updated continuously.

**Anomaly-based.** Builds a model of normal — which hosts talk, on which ports, in what volume, at what hours — and alerts on departures. Can surface things nobody has ever written a rule for. It requires a learning period, it is only as good as the "normal" it learned (if the baseline period contained a compromise, the compromise is now normal), and its alerts are inherently vaguer: *this is unusual* is a weaker statement than *this matched a known pattern*, and it puts more interpretation work on you.

**Protocol / stateful analysis.** Knows how a protocol is supposed to behave and flags violations: a command sequence in the wrong order, a field longer than the specification permits, a protocol on a port that is not that protocol. Excellent at catching novel abuse of known protocols. Legitimate but sloppy implementations trigger it, so it needs environment-specific tuning.

Real deployments use all three. Note that the second and third are what let you detect anything on an encrypted link, since neither strictly requires payload contents.

## Reading a rule

You will not write many signatures, but you must be able to read one well enough to judge an alert. Here is a Suricata-style rule in the common syntax:

```text
alert tcp $HOME_NET any -> $EXTERNAL_NET 443 ( \
    msg:"POLICY Outbound TLS to known suspect hosting range"; \
    flow:established,to_server; \
    threshold:type limit, track by_src, count 1, seconds 300; \
    classtype:policy-violation; \
    sid:9000101; rev:2; )
```

Read it in pieces:

- **`alert`** — the action. Others are `drop` (inline only), `reject`, and `pass` (explicitly allow, skipping later rules).
- **`tcp $HOME_NET any -> $EXTERNAL_NET 443`** — the header: protocol, source, source port, direction, destination, destination port. `$HOME_NET` and `$EXTERNAL_NET` are variables you define at deployment; **getting `$HOME_NET` wrong is the single most common configuration error in this technology**, because a rule that says "from my network to outside" is meaningless if the sensor's idea of "my network" is wrong. Every directional rule silently misbehaves.
- **`msg`** — the human-readable claim. This is what lands in the alert. Notice it says *suspect hosting range*, not *malware*. Precise `msg` text is a kindness to whoever triages.
- **`flow:established,to_server`** — only match on established connections in the client-to-server direction. Flow conditions cut false positives dramatically.
- **`threshold`** — rate limiting, so one noisy source does not generate ten thousand identical alerts.
- **`classtype`** — a category used for prioritization.
- **`sid`** and **`rev`** — the unique rule identifier and its revision. Record the `sid` in every ticket; it is how anyone else finds the exact rule you were looking at.

Content-matching rules add `content` and `pcre` options that describe the bytes to look for. You need to recognize them; writing your own detection content is a later specialization.

## Interpreting an alert

An alert is a **hypothesis with evidence attached**, not a verdict. Treat it as such and your triage will be better than most.

### Read these fields first

- **Timestamp** and whether alerts repeat, and on what interval
- **Signature name and SID** — the exact claim
- **Source and destination**, with direction and which is internal
- **Ports and protocol**
- **Classification and priority** — the vendor's opinion, and only that
- **The packet or flow reference** — the actual evidence

### A worked alert

```text
02/14/2026-03:12:47.114338  [**] [1:9000101:2] POLICY Outbound TLS to known
suspect hosting range [**] [Classification: Potential Corporate Privacy
Violation] [Priority: 2] {TCP} 10.20.30.41:51002 -> 198.51.100.77:443
```

Step by step:

1. **What is the literal claim?** A host in `$HOME_NET` opened TLS to an address in a range the rule author flagged. That is all. It does not claim malware, and it does not claim compromise.
2. **Who is the internal host?** `10.20.30.41` is in the user zone from lesson 03. Consult DHCP leases and asset inventory to name the machine and its user. If this had been an address inside a NAT boundary, this step would require the NAT session log.
3. **Direction and initiator?** Internal to external, internal initiating. An outbound connection from a workstation, which is ordinary in form.
4. **Is it repeating?** Query the flow data for this pair. If you find the pattern from lesson 02 — 642 bytes out, 511 bytes back, every 60.0 seconds, 340 times — you have found the thing that actually matters, and it is not in the alert. **The alert is the pointer; the flow record is the evidence.**
5. **What else does this host do?** Any other alerts, any recent authentication oddities, any new outbound destinations in the last week?
6. **Can it be explained?** Check whether the destination belongs to a known vendor, a software update service, or a monitoring product the organization runs. A large fraction of alerts resolve here and should.
7. **Write the finding.** Host, user, timestamp, signature and SID, the observed pattern with numbers, what you ruled out, and your confidence. Then escalate according to your organization's process.

That final artifact is the deliverable. "Suspicious traffic from a laptop" is not a handoff; "Workstation FIN-LT-0042 (user J. Alvarez, 10.20.30.41) has made 340 connections to 198.51.100.77:443 at exact 60-second intervals since 02/13 22:41, 642 bytes out and 511 bytes back each time, matching SID 9000101; destination is not in our vendor allow-list and the host has no scheduled task we can identify" is one.

### True and false, positive and negative

- **True positive** — real event, alert fired. The system working.
- **False positive** — benign traffic, alert fired. The dominant cost of running this technology, and the reason tuning is a permanent job.
- **True negative** — benign traffic, no alert. Invisible and constant.
- **False negative** — real event, no alert. The dangerous one, and the one you cannot count directly. This is why detection is layered and why "no alerts" is never proof of "nothing happened."

The unpleasant arithmetic: on a network of a thousand hosts, even a very low false-positive *rate* produces a large false-positive *count*, because the volume of benign traffic is enormous. Analysts stop reading consoles that cry wolf, and a console nobody reads has a detection rate of zero regardless of its rule set. Tuning is not housekeeping; it is what keeps the control functional.

## Tuning

The goal is that every alert reaching a human is worth a human's attention.

**Set `$HOME_NET` and friends correctly.** Before anything else. Include every internal range, including IPv6 and your VPN pools.

**Enable the rule categories that match your environment.** A network with no industrial control systems does not need those rules loaded. Fewer, relevant rules beat everything-on.

**Suppress by source or destination** when a specific known-good host legitimately triggers a rule — the vulnerability scanner is the classic case. Suppress narrowly: this SID, from this address. Broad suppression is how real events get discarded.

**Threshold noisy rules** so repeats collapse into a countable event rather than thousands of lines.

**Write pass rules sparingly**, and always with a comment explaining what business flow they exist for and who approved it. A pass rule is a hole in your detection, exactly as an allow rule is a hole in your firewall, and it deserves the same lifecycle discipline: owner, reason, review date.

**Tune iteratively, and keep records.** Run in detection mode, read a week of alerts, categorize each as true positive, false positive, or policy noise, then adjust. Every change gets documented — what you suppressed, why, and when it should be revisited. Undocumented tuning is indistinguishable from a detection gap.

**Before enabling prevention on any rule**, run it in alert-only mode long enough to be confident, then convert only the rules whose false-positive rate you have measured. Turning on `drop` for a whole rule set at once is a reliable way to create an outage and get the technology removed.

## What a sensor cannot do

Say these out loud when someone proposes an IDS as the answer to a risk:

- **It cannot read encrypted payloads** without interception. Plan for metadata-based detection or host agents.
- **It cannot see traffic that does not cross its vantage point** — including traffic between two hosts on the same switch, which is exactly the traffic lateral movement uses. Hence chokepoints, and hence host sensors.
- **It cannot keep up with a link faster than its hardware**, and when it falls behind it drops traffic, usually quietly. Monitor the sensor's own drop counters; a sensor you do not monitor is a sensor you cannot trust.
- **It does not detect what no rule describes and no baseline covers.**
- **It does not respond.** It alerts. Response is a human process with a defined workflow, and that workflow is taught later in this pathway.

## Practice

All exercises on your own lab network only.

**Exercise 1 — Choose placement and defend it.** For each situation, state where you would place a sensor, whether it runs as IDS or IPS, how traffic reaches it (SPAN, TAP, inline, or host agent), what its fail behavior should be if inline, and one thing it will *not* be able to see. Two to four sentences each.

1. A clinic wants to know if a workstation ever attempts to reach the patient database directly, in violation of the zone matrix from lesson 03.
2. A retailer's payment processing segment must block known exploitation attempts against the payment application in real time. Downtime costs revenue per minute.
3. A small firm's only requirement is knowing whether anything on the internal network is contacting known-suspect internet destinations. There is no security staff outside business hours.
4. An office has eleven IP cameras that cannot run any agent and whose vendor forbids firmware changes.

**Exercise 2 — Deploy a sensor and read its output.** On a lab VM, install an open-source IDS (Suricata or Snort) with a community rule set. Then:

1. Set `$HOME_NET` to your lab subnet and confirm it, and explain in one sentence what would go wrong if you left it at the default.
2. Point the sensor at the interface carrying traffic between two of your lab VMs.
3. Generate ordinary traffic between them — web requests, DNS lookups, a file transfer.
4. Trigger a rule safely: many rule sets ship a test signature that matches a harmless string, or you can enable a policy rule that matches plaintext HTTP or an outdated TLS version, then produce that traffic yourself.
5. Capture the resulting alerts and, for one of them, write out all seven fields from the "read these fields first" list.

**Exercise 3 — Interpret and hand off.** Using the alert you produced, write a triage note containing: the literal claim of the signature (with SID), the internal host identified by name as well as address, the direction and initiator, whether the pattern repeats and at what interval, at least one corroborating piece of flow evidence you gathered yourself, what you ruled out, your assessment as *routine*, *needs more context*, or *escalate*, and your confidence in one sentence. Keep it under 200 words. The test of a good note is that a colleague could act on it without asking you a single question.

**Exercise 4 — Tune, and document the cost.** Identify one rule in your deployment that fires on traffic you know is benign in your lab. Write a suppression or threshold for it, scoped as narrowly as you can, apply it, and confirm the noise stops while other alerts still appear. Then write three sentences: what you suppressed, what detection capability you gave up by doing so, and what would have to change for you to remove the suppression.

## Check your understanding

1. You can deploy only one network sensor. Where does the lesson say to put it, and why there rather than outside the perimeter firewall?
2. A Suricata deployment produces almost no alerts for traffic leaving the network, even for test signatures. What configuration value do you check first?
3. An alert names `198.51.100.77` and SID 9000101. What is "the alert is the pointer; the flow record is the evidence" asking you to do next?
4. Your SPAN port mirrors two busy 1 Gb/s ports onto one 1 Gb/s monitor port. What failure will you not see in the alert console?

**Answers:** (1) Inside the perimeter firewall — it sees only traffic that survived policy, so every alert concerns permitted traffic and the noise is far lower. (2) `$HOME_NET` (and `$EXTERNAL_NET`); if "my network" is wrong, every directional rule misbehaves. (3) Query flow data for the host pair to find the pattern — repetition, interval, byte counts — and identify the internal host from DHCP and inventory. (4) Silent packet drops at the oversubscribed mirror port, producing detection gaps; monitor the sensor's and switch's drop counters.
