---
lesson_id: net110-02
course_id: net110
pathway: cybersecurity-support-technician
title: Networking Refresher for Defenders
order: 2
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Read addressing, ports, and protocol behavior well enough to say what a captured network conversation is doing
---

## Why a defender re-learns the network

You almost certainly met TCP/IP already, in a class that was trying to make a network *work*. This lesson is the same material with a different question attached. A network engineer asks "why isn't this reaching its destination?" A defender asks "what is this, who started it, and should it be happening at all?"

That change of question changes what you memorize. You will care less about subnet arithmetic and more about which side of a conversation opened it. Less about routing metrics, more about whether a host that has never spoken to the internet suddenly does, every ninety seconds, forever. The entire rest of this course — zones, firewall rules, sensor placement, tunnels, certificates — is written in the vocabulary you build here. A rule you cannot read is a rule you cannot audit, and an alert you cannot narrate is an alert you will either ignore or escalate blindly. Both are failures.

The target skill is narration. Given a capture, a flow record, or a log line, you should be able to say a plain English sentence: *"At 09:14, the finance workstation at 10.20.30.41 opened a TCP connection to 203.0.113.9 on port 443, sent 4 kilobytes, received 1.2 megabytes over eleven seconds, and closed cleanly."* Once you can produce that sentence reliably, judging whether it is normal becomes a question about your environment rather than a question about networking.

## The five facts that identify a conversation

Nearly every tool you will touch — firewalls, flow collectors, IDS sensors, proxy logs — identifies traffic by the same five fields, usually called the **5-tuple**:

1. **Source IP address** — where it came from
2. **Source port** — the ephemeral port the initiator picked
3. **Destination IP address** — where it is going
4. **Destination port** — the service being asked for
5. **Protocol** — TCP, UDP, ICMP, and so on

Two more facts are not in the tuple but matter just as much to a defender:

- **Direction and initiator.** Which of the two endpoints sent the first packet. A workstation connecting outbound to a web server is ordinary; that same web server connecting inbound to the workstation is not.
- **Time and volume.** When it happened, how long it lasted, and how many bytes went each way.

Get in the habit of writing all seven down before you form an opinion. Most bad triage calls come from forming the opinion first.

## Addressing: who is talking

### IPv4 and CIDR

An IPv4 address is 32 bits, written as four decimal octets. A **prefix length** in CIDR notation says how many leading bits identify the network: `10.20.30.0/24` means the first 24 bits are the network, leaving 8 bits — 256 addresses, 254 usable — for hosts. `/16` is 65,536 addresses; `/25` is 128; `/32` is a single host.

You need CIDR fluency because rule sets and zone definitions are written in it. Three quick facts to keep loaded:

- The **network address** is all host bits zero (`10.20.30.0/24`), the **broadcast address** is all host bits one (`10.20.30.255`).
- A `/31` and `/32` are legal in rules and mean "this link" and "this host."
- `0.0.0.0/0` means **everything**. When you see it in a firewall rule as a source or destination, stop and read the rest of that rule very carefully. It is the single most common way a rule set becomes wider than its author intended.

**Private address ranges** (RFC 1918) will make up most of what you see inside an organization:

```text
10.0.0.0/8         10.0.0.0     – 10.255.255.255
172.16.0.0/12      172.16.0.0   – 172.31.255.255
192.168.0.0/16     192.168.0.0  – 192.168.255.255
```

Also worth recognizing on sight: `127.0.0.0/8` loopback (traffic that never leaves the host), `169.254.0.0/16` link-local (a host that failed to get a DHCP lease — a useful diagnostic), `224.0.0.0/4` multicast, and `100.64.0.0/10` carrier-grade NAT.

### IPv6, briefly but seriously

IPv6 addresses are 128 bits written as eight groups of four hex digits, with one run of zero groups collapsed to `::`. So `2001:db8:0:0:0:0:0:1` is `2001:db8::1`.

Defenders skip IPv6 at their peril, because modern operating systems enable it by default and prefer it when available. A network whose firewall and monitoring only understand IPv4 has a second, unwatched network running alongside the first. Recognize at least:

- `fe80::/10` — **link-local**, auto-configured, present on virtually every interface, does not route
- `fc00::/7` — **unique local**, the rough IPv6 equivalent of RFC 1918
- `2000::/3` — currently allocated **global unicast**, i.e. internet-routable
- `ff00::/8` — multicast

A host may have several IPv6 addresses at once, including temporary privacy addresses that rotate. That complicates attribution: the address alone is a weaker identifier than in IPv4, so you lean harder on the other evidence below.

### MAC addresses and ARP

Inside a single broadcast domain, delivery is by **MAC address** — 48 bits, written as six hex pairs, burned into (or spoofed onto) the network interface. **ARP** maps an IPv4 address to a MAC address by broadcasting "who has 10.20.30.1?" and trusting whichever host answers.

ARP has no authentication at all. It is trust-on-first-answer. A defender does not need to be able to abuse that; a defender needs to notice its symptoms: two different MAC addresses claiming one IP over a short window, a sudden burst of unsolicited (gratuitous) ARP replies, or a gateway IP whose MAC changed without a hardware change ticket to explain it. Those observations belong in your notes as *anomalies to escalate*, not conclusions.

### NAT, and why attribution is hard

**Network Address Translation** rewrites addresses as packets cross a boundary. The common case is many internal hosts sharing one public address, with the boundary device keeping a table of which internal host owns which translated source port.

The consequence for you is blunt: **outside the NAT boundary, every internal host looks like the same host.** If a threat feed tells you your public address contacted a known-bad destination at 14:32, the public address does not tell you *which* laptop did it. To answer that you need the boundary device's NAT/session log for that timestamp, plus the DHCP lease log to turn an internal IP into a machine name, plus your asset inventory to turn a machine name into a person and a location. Build the habit of asking for those three logs together — it is one of the most practically useful monitoring habits in this course.

## Ports and services

A port is a 16-bit number identifying which service on a host a conversation is for. Convention divides them:

- **0–1023, well-known** — the classic services, historically requiring privilege to bind
- **1024–49151, registered** — assigned to particular applications
- **49152–65535, ephemeral** — what a client picks at random for its own end of a connection

That last group gives you a free inference. In a connection between `10.20.30.41:52318` and `203.0.113.9:443`, the high random port is almost certainly the **client** and the low well-known port is the **server**. When your flow tool does not label direction, port numbers usually will.

Ports a support technician should know without looking up:

| Port | Protocol | Service | Defensive note |
| --- | --- | --- | --- |
| 22 | TCP | SSH | Encrypted admin access; inbound from the internet deserves scrutiny |
| 23 | TCP | Telnet | Plaintext admin access; should not exist on a modern network |
| 25 / 587 / 465 | TCP | SMTP (25 server-to-server relay; 587 and 465 client submission) | Outbound 25 from a workstation is almost never legitimate |
| 53 | UDP/TCP | DNS | Should go to your resolvers only; direct external DNS is a finding |
| 67 / 68 | UDP | DHCP | Server/client; rogue servers show up here |
| 80 | TCP | HTTP | Cleartext web; readable in capture |
| 88 | TCP/UDP | Kerberos | Domain authentication traffic |
| 123 | UDP | NTP | Time sync; drift breaks logging and certificates |
| 135 / 139 / 445 | TCP | RPC / NetBIOS / SMB | Windows file and admin traffic; heavy east-west use, common lateral-movement path |
| 161 | UDP | SNMP | Device management; v1/v2c community strings are cleartext |
| 389 / 636 | TCP | LDAP / LDAPS | Directory queries, plain and TLS |
| 443 | TCP | HTTPS | The default hiding place for everything, benign and not |
| 3306 / 5432 | TCP | MySQL / PostgreSQL | Database; should be reachable only from app tiers |
| 3389 | TCP | RDP | Remote desktop; internet-exposed RDP is a standing incident waiting to happen |
| 5985 / 5986 | TCP | WinRM | Windows remote management |

A port number is a *convention*, not a guarantee. Anything can listen on 443. That is why the protocol-behavior section below matters: the port tells you what a service claims to be, and the behavior tells you what it is.

## TCP: the shape of a conversation

TCP is connection-oriented, which is a gift to defenders because it means conversations have a beginning, a middle, and an end that you can see.

### The handshake

```text
client -> server   SYN              "I would like to talk"
server -> client   SYN, ACK         "Go ahead"
client -> server   ACK              "Confirmed"
```

Three packets, then data. The **initiator is whoever sent the SYN**, full stop. That single fact resolves most "who called whom" questions.

### Flags you will read

- **SYN** — open a connection
- **ACK** — acknowledging received data; set on nearly every packet after the handshake
- **PSH** — deliver buffered data to the application now
- **FIN** — I am done sending; a graceful close is a FIN and ACK in each direction
- **RST** — abrupt reset; the conversation is over immediately
- **URG** — urgent pointer, rare in practice

### Three outcomes worth telling apart

When a host tries to open a TCP connection, exactly one of three things happens, and each means something different:

1. **SYN answered with SYN-ACK** — a service is listening and accepted the connection.
2. **SYN answered with RST** — the host is reachable, but nothing is listening on that port. This is a *closed* port.
3. **SYN answered with nothing at all** — no response before timeout, usually followed by retransmitted SYNs at growing intervals. Something dropped the packet silently: a firewall rule, an ACL, or a host that is off. This is a *filtered* path.

You will use this constantly when verifying your own controls. After you write a deny rule in lesson 04, the correct evidence that it works is a timeout from the blocked side, not a refusal — and knowing the difference tells you whether your firewall is dropping (silent) or rejecting (RST), which is a design choice you will make deliberately.

### A worked handshake

Here is `tcpdump` output from a lab workstation reaching an internal web server:

```text
09:14:02.104318 IP 10.20.30.41.52318 > 10.20.40.15.443: Flags [S], seq 2145983221, win 64240, length 0
09:14:02.104902 IP 10.20.40.15.443 > 10.20.30.41.52318: Flags [S.], seq 3390118745, ack 2145983222, win 65160, length 0
09:14:02.104951 IP 10.20.30.41.52318 > 10.20.40.15.443: Flags [.], ack 1, win 502, length 0
09:14:02.106224 IP 10.20.30.41.52318 > 10.20.40.15.443: Flags [P.], seq 1:518, ack 1, length 517
09:14:02.131077 IP 10.20.40.15.443 > 10.20.30.41.52318: Flags [P.], seq 1:1461, ack 518, length 1460
09:14:11.902551 IP 10.20.30.41.52318 > 10.20.40.15.443: Flags [F.], seq 9214, ack 41338, length 0
09:14:11.903008 IP 10.20.40.15.443 > 10.20.30.41.52318: Flags [F.], seq 41338, ack 9215, length 0
```

Read it out loud, in order. `[S]` is the SYN, so `10.20.30.41` initiated. `[S.]` is SYN-ACK — the dot in tcpdump's notation is ACK. `[.]` alone is the bare ACK completing the handshake. `[P.]` packets carry data; the 517-byte first payload to port 443 is the size and shape of a TLS ClientHello. `[F.]` in both directions nine seconds later is a graceful close. Narration: *a workstation made a normal, short, successful HTTPS request to an internal server.*

Now contrast:

```text
11:47:19.220145 IP 10.20.30.41.41022 > 10.20.50.7.3389: Flags [S], seq 88213441, win 64240, length 0
11:47:20.221980 IP 10.20.30.41.41022 > 10.20.50.7.3389: Flags [S], seq 88213441, win 64240, length 0
11:47:22.226114 IP 10.20.30.41.41022 > 10.20.50.7.3389: Flags [S], seq 88213441, win 64240, length 0
```

Same SYN, same sequence number, retransmitted at roughly 1s, 2s, 4s. Nothing answered. Narration: *the workstation tried to open RDP to a server and the path is filtered or the host is down.* If you wrote the rule that filtered it, this is your proof of success. If you did not, it is a question for whoever owns that path.

## UDP, and why it is harder to reason about

UDP has no handshake, no sequence numbers, and no connection. A packet goes out; maybe a packet comes back. That has three consequences you should internalize:

- **There is no true "initiator" at the protocol level**, only the first packet you happened to see. Tools infer direction from timing and ports, and they can be wrong.
- **Source addresses are easy to forge**, because nothing has to be received to keep the exchange going. This is why UDP services that answer small questions with big answers get abused as amplifiers, and why a defender watching outbound UDP looks hard at request-to-response size ratios.
- **"Stateful" firewalling of UDP is a fiction with a timer.** The firewall remembers "10.20.30.41 sent to 8.8.8.8:53 thirty seconds ago" and allows a reply for a short window. Sizing that window is a real configuration decision you will meet in lesson 04.

The UDP services you will actually read are DNS, DHCP, NTP, SNMP, syslog, and increasingly QUIC on 443.

## The protocols you will read most

### DHCP

A client with no address broadcasts a Discover; a server Offers; the client Requests; the server Acknowledges. The result is a **lease**: this MAC address holds this IP for this long.

For monitoring, DHCP logs are the Rosetta Stone that turns "10.20.30.41 at 09:14" into "the laptop with MAC `a4:83:e7:...`, hostname `FIN-LT-0042`." Without them, IP-based history is unreliable, because the same address may have belonged to three machines in a week. Two anomalies to know: a DHCP Offer arriving from an address that is not your DHCP server (a rogue server, which can redirect DNS and default gateway), and a host that stopped renewing and self-assigned a `169.254.x.x` address.

### DNS

DNS is the single highest-value log source most organizations have, because virtually everything resolves a name before it does anything else.

A query names a record and a type; a response carries answers and a TTL. Types you will see: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias), **MX** (mail), **PTR** (reverse lookup), **TXT** (arbitrary text). **NXDOMAIN** means the name does not exist.

What a defender reads DNS for:

- **Where the query went.** Internal hosts should query internal resolvers. A workstation sending DNS straight to an external resolver bypasses your logging and filtering — that is a finding regardless of whether the destination is reputable.
- **NXDOMAIN volume.** A host generating a steady stream of failed lookups for names that look machine-generated is worth flagging.
- **Name length and entropy.** Very long labels with high-entropy content, queried in high volume to one domain, are the classic shape of data moving over DNS. You do not need to prove it; you need to notice it and hand it on.
- **TTL behavior.** Very short TTLs with answers that keep changing are a documented evasion pattern, though plenty of legitimate content delivery looks similar. Context decides.

### HTTP and TLS

Plain **HTTP** is fully readable in a capture: method, path, `Host` header, `User-Agent`, status code, and body. If you are seeing cleartext HTTP carrying anything that matters, that is itself the finding.

**TLS** encrypts the payload but not everything. From a capture of a TLS session you can still typically observe:

- The **Server Name Indication (SNI)** in the ClientHello, naming the site being requested (unless encrypted client hello is in use)
- The **server certificate** in TLS 1.2 — subject, issuer, validity dates
- The **protocol version and cipher suites offered**, which fingerprint the client software
- **Packet sizes, timing, and total volume**

That residue is enough to do a great deal of honest monitoring without decrypting anything. It is also why "it is encrypted" is not a reason to stop looking. Lesson 07 covers what TLS is actually guaranteeing; here, just know what stays visible.

### ICMP

ICMP is the control protocol: echo request/reply (ping), destination unreachable, time exceeded (which is how traceroute works), and fragmentation needed.

Two defender notes. First, ICMP carries arbitrary payload data, so unusually large or high-volume echo traffic to a single external host is worth a look. Second, **blocking all ICMP is a classic self-inflicted outage**: type 3 code 4, "fragmentation needed," is how path MTU discovery works, and dropping it produces connections that establish and then hang on large transfers. Filter ICMP thoughtfully, not totally.

## Two ways to see traffic

### Full packet capture

`tcpdump` and Wireshark record complete packets. You get everything — headers and payload — which is the most faithful evidence available and the most expensive. A busy link fills disks in hours, and captures contain whatever users typed, so capture is a privacy-relevant act governed by policy. Capture on your own lab network freely; on a production network, only with written authorization and a defined scope.

A capture filter that keeps the volume sane:

```bash
sudo tcpdump -i eth0 -n -s 0 -w /var/lab/capture.pcap \
  'host 10.20.30.41 and not port 22'
```

`-n` skips name resolution (so the capture does not generate its own DNS traffic), `-s 0` keeps full packets, `-w` writes a file for later analysis, and excluding port 22 keeps your own SSH session out of the recording.

### Flow records

**NetFlow, IPFIX, sFlow**, and Zeek's `conn.log` summarize each conversation into one record: the 5-tuple, start time, duration, bytes and packets each way, and a state. No payload. That is roughly a thousandth of the storage, which is why flow data is typically retained for months while captures are retained for days.

A Zeek-style connection record, field by field:

```text
ts=2026-03-04T09:14:02Z  uid=CqL3aP  id.orig_h=10.20.30.41  id.orig_p=52318
id.resp_h=203.0.113.9    id.resp_p=443  proto=tcp  service=ssl
duration=11.42  orig_bytes=4312  resp_bytes=1258804  conn_state=SF
```

`orig` is the initiator, `resp` is the responder — the tool has already answered the direction question for you. `service=ssl` is what the protocol analyzer decided the traffic actually is, which may differ from what the port implies; a mismatch between them is worth noticing. `duration`, `orig_bytes` and `resp_bytes` give you volume and asymmetry: 4 KB up, 1.2 MB down is a download. Reverse those numbers and you are looking at an upload, which is a different conversation entirely. `conn_state=SF` means a normal establishment and teardown; `S0` means a connection attempt with no reply (the filtered case above), `REJ` means it was rejected, `RSTO`/`RSTR` mean one side reset it.

Choose full capture when you need to prove exactly what was said and you know the scope; choose flow when you need to see patterns across weeks and many hosts. Most real monitoring is flow-first, capture-second.

## A method for narrating a conversation

Work in this fixed order. The order matters because it stops you from jumping to the interesting-sounding conclusion.

1. **Endpoints.** What are the two addresses, and what do you know about each? Internal or external? In your asset inventory or not?
2. **Direction.** Who initiated — SYN sender, or the `orig` field. Inbound, outbound, or east-west (internal to internal)?
3. **Service.** What port, and what does the protocol analyzer say the traffic actually is? Do they agree?
4. **Volume and shape.** Bytes each way, duration, and whether it happened once or repeatedly. Repetition at a fixed interval is the most consistently suspicious shape in network monitoring, because humans are irregular and scheduled software is not.
5. **Outcome.** Established and closed cleanly? Reset? Never answered?
6. **Baseline comparison.** Has this pair of hosts talked before? Does this host normally speak this protocol? Is this the hour it usually happens?

Only after all six do you form a view — and the view a support technician is asked for is usually one of three: *routine*, *needs context I do not have*, or *escalate now*. Getting comfortable with the middle answer is a professional skill. Deciding what happens after an escalation, how alerts are correlated across sources, and how an incident is run are covered later in the pathway; your job here is to make the observation precise enough that the next person does not have to redo it.

### Three flows, narrated

```text
A  10.20.30.41:49711 -> 10.20.40.20:445   tcp  dur=0.21  orig=1.1K resp=8.4K  SF
B  10.20.30.41:51002 -> 198.51.100.77:443 tcp  dur=1.02  orig=642  resp=511   SF   (repeats every 60.0s, 340 times)
C  10.20.30.41:52990 -> 10.20.40.15:22    tcp  dur=0.00  orig=0    resp=0     S0
```

**A** — internal workstation to internal file server on SMB, short, small, successful. Routine on a Windows network; you would want to know it is a file server the user is entitled to use, but nothing here is odd.

**B** — outbound HTTPS to an external host, tiny in both directions, almost identical every time, on a metronome-exact sixty-second interval, hundreds of times. The volume says no human is browsing; the regularity says a program is checking in. That may be a software update agent, a monitoring client, or something you do not want. This is the anomaly to escalate, and the reason to escalate is the *periodicity plus small symmetric payloads*, which you can state without guessing at the cause.

**C** — an SSH attempt to an internal server that got no answer at all. One of these is a mistyped hostname. Fifty of these to fifty different servers in ninety seconds is an internal host enumerating the network, and that is escalate-now territory.

## Baselines: the thing that makes anomalies visible

None of the above works without a sense of normal. "Anomalous" is a claim about *your* network, and it needs evidence.

A usable baseline for a small environment is not exotic. It is a written record of: which hosts exist and what each is for; which services each is expected to offer and consume; which external destinations are routinely contacted and by whom; and what the daily and weekly traffic shape looks like — business hours peak, overnight backup window, patch-day spike on the second Tuesday.

Build it from flow data over two to four weeks, and write down the exceptions you already know about, because half of triage is recognizing your own infrastructure. The backup server moving 400 GB at 02:00 is only alarming if nobody wrote down that it does that every night.

## Practice

Do all of this on your own lab network — virtual machines you created, on addresses you control. Do not capture traffic on a network you do not own or administer.

**Setup.** Two lab VMs on the same subnet: a client and a server running a web service on 443 and SSH on 22. Confirm you can reach both.

**Exercise 1 — Capture and narrate.** On the client, start a capture limited to the server:

```bash
sudo tcpdump -i eth0 -n -s 0 -w lab-narrate.pcap 'host <server-ip>'
```

Then, from the client, generate five conversations: load the web page twice, make one SSH connection and log out, resolve three hostnames, and attempt a connection to a port on the server where nothing is listening. Stop the capture and open it.

For **each** of the five, write the seven facts from this lesson (source IP, source port, destination IP, destination port, protocol, initiator, bytes each way) and then one plain-English sentence narrating it. Your sentence for the last one must correctly distinguish *closed* from *filtered* and state the evidence — RST or timeout — that told you which.

**Exercise 2 — Closed versus filtered, on purpose.** On the server, add a host firewall rule that **drops** traffic to one port and **rejects** traffic to another. From the client, attempt both. Capture the results and record, for each: what came back, how long it took, and how many times the client retransmitted. Write two sentences explaining how you would tell these two cases apart from flow records alone, where you cannot see individual flags.

**Exercise 3 — Build a two-day baseline.** Leave a flow-summarizing capture running on your lab client for two working sessions. Then produce a one-page baseline containing:

- Every external destination contacted, with how often and by which local process if you can determine it
- The five ports that carried the most bytes
- Any traffic that repeated at a fixed interval, with the interval measured

Finish by writing three sentences: one describing what "normal" looks like for this host, one naming the single thing in your own data you would have flagged if you saw it on a network you did not build, and one saying what additional log source — DHCP lease, NAT session, or DNS resolver log — you would request to identify the host behind an address, and why.

## Check your understanding

1. How many usable host addresses are in `10.20.40.0/25`, and what are its network and broadcast addresses?
2. A flow record reads `10.20.30.41:50212 -> 10.20.50.7:3389 tcp ... conn_state=REJ`. Narrate it in one sentence, including what `REJ` tells you.
3. A threat feed says your public address contacted a known-bad host at 14:32. Which three logs do you request to name the laptop and its user?
4. Why is blocking *all* ICMP a self-inflicted outage?

**Answers:** (1) 126 usable; network `10.20.40.0`, broadcast `10.20.40.127`. (2) The user-zone workstation `10.20.30.41` initiated an RDP connection to `10.20.50.7`, and the attempt was refused with a reset — the host is reachable but nothing accepted on 3389, or a firewall rejected it. (3) The NAT/session log for that timestamp, the DHCP lease log, and the asset inventory. (4) It drops "fragmentation needed" (type 3 code 4) messages, breaking path MTU discovery, so large transfers hang.
