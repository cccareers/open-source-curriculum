---
lesson_id: cyb120-06
course_id: cyb120
pathway: cybersecurity-support-technician
title: Digital Forensics Fundamentals
order: 6
kind: lesson
competency_ids:
  - D3-S1-C02
objectives:
  - Collect and analyze host and network artifacts without altering the evidence
---

## What first-responder forensics is, and is not

Digital forensics is a deep specialism. There are practitioners who reconstruct deleted files from unallocated disk blocks, who reverse engineer malicious code found only in memory, and who testify as expert witnesses. This lesson does not make you one of them, and it does not try.

What it makes you is a competent **first responder**: the person who arrives first, recognizes what evidence exists, collects it soundly, avoids destroying anything, analyzes the readily available artifacts to answer the questions the incident needs answered now, and knows the exact point at which to stop and call a specialist. That role is enormously valuable, because a specialist can work miracles with well-preserved evidence and can do nothing at all with evidence that was trampled in the first hour.

So the boundary of this lesson is explicit. In scope: sound acquisition, integrity verification, volatile and non-volatile collection, the host and network artifacts that are readily available and richly informative, and building a defensible timeline from them. Out of scope, and named as escalation paths: block-level file carving from unallocated space, deep memory reverse engineering, damaged-media recovery, mobile device extraction, and anything intended for expert testimony. When a case needs those, your job is to have preserved the material intact and to say so.

Lesson 05 gave you the record-keeping that makes evidence survive. This lesson is the handling that keeps it worth keeping. The two are inseparable: an acquisition without documentation is not evidence, and documentation of a botched acquisition is just a well-written record of a mistake.

## Four principles

**1. Every interaction changes the system.** You cannot examine a running computer without altering it. Logging in writes a logon record. Running a tool allocates memory and may write to disk. Plugging in a USB drive creates a device record. This is not a failure — it is physics. What separates sound practice from unsound is that the sound responder *knows* what their actions changed, causes the smallest change that gets the job done, and writes down every change they caused. An examiner who later finds your artifacts and can match them to your notes discards them from the analysis. An examiner who finds artifacts nobody documented has to treat them as possible attacker activity, and your investigation just acquired a phantom.

**2. Work on copies; protect the original.** The original evidence is acquired once, verified, stored, and then left alone. Everything else happens on verified working copies. If a working copy is corrupted or a tool damages it, you make another.

**3. Prove integrity with hashes, at every step.** Acquire, hash, record. Copy, rehash, verify, record. Lesson 05 covered the mechanics; here the point is that the hash is taken *as part of the acquisition*, not as an afterthought.

**4. Collect in order of volatility, and collect more than you think you need.** Evidence that will disappear first gets collected first. And you cannot go back: once a machine is rebuilt, whatever you did not take is gone. Storage is cheaper than a second incident you cannot explain.

## Order of volatility

Data has a lifespan. Some of it is measured in nanoseconds and some in years, and the acquisition order follows directly from that ordering.

![Digital evidence arranged from most volatile to least volatile, from CPU registers and cache through memory, network state, running processes, disk, and finally archived backups](./img/order-of-volatility.png)

From most to least volatile:

1. **Registers and CPU cache.** Gone instantly, not practically collectible, and not your concern.
2. **Memory contents (RAM).** Running processes, injected code, open network connections, decrypted data, credentials, clipboard, recently used commands. Lost completely on power-off, and degrading continuously while the machine runs. This is the highest-value volatile evidence and the most commonly lost.
3. **Network state on the host.** Active connections, listening ports, the ARP cache, the DNS resolver cache, routing table. Seconds to minutes of lifespan; captured as part of live collection.
4. **Running process and system state.** The process tree, loaded modules, open handles, logged-on users, scheduled tasks, services. Lost on reboot.
5. **Temporary file systems and swap.** Often cleared on reboot.
6. **Disk contents.** Survives power-off. Survives until overwritten — which for deleted content may be minutes on a busy system.
7. **Remote and central logs.** SIEM, firewall, proxy, directory logs. Survive on other systems, subject to their retention.
8. **Backups and archives.** Longest lived, and often the only source for the state of a system before the compromise.

Two practical implications. First, **if you are going to collect memory, collect it before anything else on that host** — including before running many of the tools that would tell you whether memory is worth collecting. Second, **do not power off a running host you intend to investigate** unless it is actively destroying data. The instinct to "pull the plug" costs you items 2 through 5 in their entirety.

## Live acquisition: the running machine

Live acquisition means collecting from a system while it runs. It is the only way to get volatile data and it is inherently a compromise: you must run software on the evidence system, which changes it.

**Prepare before you touch anything.** Have your tools on external, read-only media. Have your output destination ready — a prepared external drive or a network share — because writing collected data to the evidence system's own disk overwrites the unallocated space you might have wanted. Have a note-taking sheet open. And know your sequence before you start; improvising on a live compromised host is how mistakes happen.

**Photograph the screen first,** including any visible ransom note, error dialog, or open application, and note the time from a source you trust. This costs ten seconds and has rescued many investigations.

**Then, in order:**

1. **Memory capture.** A full physical memory image, written to external media, hashed on completion. Note the tool, the version, the start and end times, and the resulting size. Expect the capture to take several minutes and expect the image to be as large as the machine's RAM.
2. **Volatile system state.** Active network connections with their owning processes, listening ports, the process tree with full command lines and parent relationships, loaded modules, logged-on sessions, open files and shares, the ARP and DNS caches, the routing table, running services and scheduled tasks, and the system time compared against a trusted source. Each command's output is captured to external media with its own timestamp.
3. **Targeted file collection** if a full image is not going to happen immediately: event logs, the relevant user profile directories, browser history, and any specific files implicated in the alert.

**Record the clock offset.** Run a command that shows the system's own idea of the time and compare it to a trusted source, and write down the difference. Everything you later derive from that host's timestamps depends on this one line, and it takes five seconds to capture and is impossible to recover afterwards.

**Minimize and record your footprint.** Use as few tools as possible; prefer statically linked tools from your own media over the system's own binaries, which may have been replaced; and log every command you run with its exact time. A sensible practice is to keep a transcript of the entire live session.

**Know what live collection cannot promise.** On a deeply compromised host, the operating system itself may be lying to you — a rootkit can hide processes, files, and connections from the tools that ask the operating system for them. This is a reason to collect memory, which can reveal what the live tools were prevented from showing, and it is a reason to corroborate host claims against network evidence collected off the host. If the host says there is no connection and the firewall says there is, believe the firewall.

## Dead acquisition: imaging storage

Dead acquisition means capturing storage while the system is not running. It gives you a complete, stable, verifiable copy.

**A forensic image is bit-for-bit,** not a file copy. It includes deleted-but-not-overwritten content, slack space, and unallocated space, none of which a file copy captures. That completeness is the point, even though the deep analysis of those regions is a specialist's job — you preserve them for the specialist you might need.

**Write blocking.** When you attach evidence media to your workstation, something must prevent writes to it. Operating systems write to attached storage without being asked — mounting, indexing, and creating recovery files — and every one of those writes alters evidence. A hardware write blocker sits between the drive and your workstation and physically refuses write commands. Software write blocking is possible but is a configuration you must verify rather than assume. Record which you used and how you verified it.

**The process, in order:** document the device (make, model, serial, capacity, physical condition) and photograph it; attach it through the write blocker; hash the source device; create the image; hash the image; confirm the two match; record everything. If the source and image hashes differ, stop and investigate before doing anything else — do not simply try again and hope.

```text
Source device : SSD, serial S4K2NX0T512199, 512 GB, from WKS-4471
Write blocker : hardware, model WB-3, verified by attempted write - refused
Tool          : acquisition utility v3.4.2
Started       : 2026-03-11T15:04Z    Completed: 2026-03-11T15:52Z
Image         : IR-2026-0031-E002.dd  (512,110,190,592 bytes)
Source hash   : SHA-256 3f1c9b0d4a77e2f5c8ab1d6e90724c3fbb5a1e8d02c47f6a9b3d5e70118cc24a
Image hash    : SHA-256 3f1c9b0d4a77e2f5c8ab1d6e90724c3fbb5a1e8d02c47f6a9b3d5e70118cc24a
Verified      : MATCH, by M. Okafor at 15:56Z
```

**Image formats.** A raw image is a plain sector-for-sector copy: universally readable, uncompressed, and carrying no metadata of its own. A forensic container format compresses, stores case metadata inside the file, and embeds integrity checksums so corruption can be localized. Either is acceptable. What is not acceptable is a format your team's tooling cannot read.

**Triage collection versus full imaging.** Full imaging is slow and generates enormous volumes. For a laptop it may be an hour; for a large server array it may be impractical. **Triage collection** — gathering a defined set of high-value artifacts rather than everything — is legitimate and common, and it is often the right answer when you have forty hosts and one afternoon. Two rules make it defensible: decide and document the collection scope *before* you start, so the selection is a documented method rather than a series of ad-hoc choices; and state plainly in the record that a triage collection was performed and what it therefore cannot show. Where the case may become a legal matter, or where the host is central to the intrusion, full imaging is the safer choice.

**Special cases worth knowing exist.** Encrypted volumes are readable while the machine is running and unlocked, and are a very good reason not to power a machine off before capturing memory, which may hold the key. Virtual machines can often be preserved by suspending and copying the disk and memory state files, which is both faster and cleaner than in-guest acquisition. Servers with redundant storage arrays, mobile devices, and cloud-hosted systems each need approaches that are escalation territory rather than first-responder territory — recognize them and ask.

## Host artifacts and what each one proves

Now the analysis. The value of an artifact is not that it exists but that it supports a specific claim. Learn them as answers to questions.

**System and security event logs** answer *who logged in, what services started, what was installed, what was cleared*. They are the backbone of a host timeline. Two entries deserve special attention: a log-cleared event is itself a strong indicator, and a service-installed event is a very common persistence footprint.

**Process execution artifacts** answer *what ran on this machine, and when*. Operating systems keep several caches for performance reasons that incidentally record execution — application compatibility caches, prefetch-style launch caches, and per-user recent-execution stores. Their exact names and semantics differ by platform and version, and each has a quirk: some record the presence of a file rather than proof it executed, some record only the last run time, some are written only at shutdown. Use them together, and state which artifact each conclusion rests on.

**Persistence artifacts** answer *how would this survive a reboot*. Startup and run configuration entries, services, scheduled tasks, startup folders, logon scripts, and account-level autostart mechanisms. When you have found malicious execution, this is the next place you look, and the absence of persistence is itself a finding worth recording.

**File system metadata** answers *when was this file created, modified, accessed, and when did its metadata change*. Those four times are distinct and they tell different stories. A pattern worth knowing: a file whose metadata-change time is later than its modification time, or whose timestamps are suspiciously round or identical, may have been deliberately altered.

**User profile artifacts** answer *what did the person at the keyboard do*. Recently opened documents, typed paths, shell command history, downloads, and the contents of temporary directories. The temporary and download directories are where delivered payloads most often land.

**Browser artifacts** answer *what was requested from this machine's browser*: history with timestamps, downloads with their source URLs, cache, and cookies. For phishing cases the download record linking a file to the URL it came from is frequently the single most useful artifact on the disk.

**Account and authentication artifacts** answer *what identities exist and were used here*: local accounts and their creation times, group memberships, and cached credential material. An account created during the incident window is a strong finding.

**Application logs** answer questions the operating system cannot: what the mail client did, what the database served, what the web server was asked for.

Two cautions apply to all of it.

**Timestamps require interpretation.** Know the time zone the artifact stores and whether it stores UTC or local time. Know whether the value is when something *happened* or when it was *written*. And be aware that timestamps can be deliberately manipulated, so corroborate an important time claim against a second artifact — ideally one on a different system, since an attacker who controls the host does not control the firewall.

**Presence is not execution and execution is not intent.** A file on disk proves the file is on disk. Corroborate before you claim more.

## Network artifacts

Network evidence has a property that host evidence does not: it is collected on systems the attacker probably does not control, which makes it excellent corroboration.

**Full packet capture** is the richest and the most expensive. It contains everything on the wire, including payload where traffic is unencrypted. Retention is usually short — hours or days — so if a case may need it, request preservation *immediately*. Even where payload is encrypted, capture yields connection timing, sizes, and TLS handshake details.

**Flow records** give the connection-level summary: who, whom, when, how long, how much. Cheap enough to retain for months, which makes them the tool for establishing when activity actually began.

**DNS logs** are the highest value per byte in network forensics. They show intent — the name a process tried to resolve — even when the connection failed or was blocked.

**Proxy and gateway logs** give full URLs, methods, response codes, sizes, and user agents, plus, in an authenticated environment, the user.

**Firewall and perimeter logs** show what was allowed and denied at the boundary. Denied traffic matters: a host repeatedly attempting a blocked outbound connection is evidence of implanted code even though nothing succeeded.

**Volatile network state on the host** — active connections and their owning processes, plus the ARP and DNS caches — is what ties a network observation to a specific program.

Two habits. **Corroborate host claims with network evidence** whenever the finding matters. And **take the network side early**, because its retention is usually shorter than disk retention and requesting preservation is a phone call you can make before you have finished anything else.

## Building the timeline

A forensic timeline is a single chronological sequence assembled from every artifact you have, in one time zone, with the source of each entry attached. Building it is where the artifacts stop being a pile and become an account of what happened.

**Normalize everything to UTC**, applying each host's recorded clock offset. Do this once, at the start, and record the conversions you applied.

**Attach a source to every entry.** Same rule as lesson 05, for the same reason: an entry that cannot be traced to an artifact cannot be defended.

**Work outward from a known point.** You almost always have one anchor — the alert, the ransom note, the first beacon. Build backwards to find the origin and forwards to find the consequence. Backwards is where the value is, because the origin is what tells you the entry vector and the real start date.

**Look for the earliest evidence, then look earlier still.** The commonest error in incident timelines is treating the first *detected* event as the first event. Once you have a candidate origin, ask what would have preceded it and go looking specifically for that.

Here is a merged timeline from the case you have been following:

```text
All events below occurred on 2026-03-10; response began on 2026-03-11.
UTC time      Source                        Event
13:44:02  Mail gateway log             Message to r.singh@corp with
                                       attachment "Q1_reconciliation.docm"
13:51:07  EDR, WKS-2210                WINWORD.EXE spawned script host,
                                       encoded command line
13:51:19  Proxy log                    WKS-2210 GET
                                       cdn-updates-cache[.]example/win/upd.ps1
13:52:00  Flow records                 WKS-2210 -> 198.51.100.44:443 begins,
                                       60s cadence
13:58:41  Event log, WKS-2210          Scheduled task "OneDriveSyncMaintenance"
                                       created
14:01:55  Mail gateway log             Same message forwarded internally to
                                       j.ruiz@corp from r.singh
14:02:11  EDR, WKS-4471                WINWORD.EXE spawned script host,
                                       encoded command line
14:02:19  Proxy log                    WKS-4471 retrieves same stage-2 script
14:03:00  Flow records                 WKS-4471 -> 198.51.100.44:443 begins
14:06:44  Event log, WKS-4471          Scheduled task created, same name
14:07:03  Directory auth log, FS-07    svc_backup: 12 failures from 10.14.9.22
                                       (WKS-2210), then success at 14:07:06
14:19:02  File system, WKS-4471        finance_docs.zip created in
                                       user temp directory, 118 MB
14:31:40  Proxy log                    WKS-4471 POST to external file-sharing
                                       service, 118 MB, first ever use by
                                       this host
```

That table answers questions no single artifact could. The entry vector was an emailed document. **WKS-2210 was first**, and the second infection came from an internal forward — meaning a user, not the attacker, spread it, which changes both the containment logic and what you tell people. The service-account attempts came from WKS-2210, tying credential access to the first host. And collection of 118 MB was followed twelve minutes later by an upload of 118 MB, which is the correlation that converts "possible data access" into "probable data exfiltration" — the finding with the largest consequences in the entire case.

Note also what the timeline *lacks*, and say so explicitly in the record: nothing here proves what was inside the archive. That claim needs the file server's access logs, and if they do not exist, the honest report says the contents are inferred from the source directory rather than confirmed.

## Knowing when to stop

Escalate to a specialist, and preserve everything, when:

- The evidence needs recovery beyond readily available artifacts — deleted content from unallocated space, damaged or failing media, or a corrupted file system.
- The analysis needs code-level understanding of something found only in memory.
- The case is heading for court, an employment tribunal, a regulator, or an insurance dispute where the analysis will be formally challenged.
- The scope is beyond your capacity — dozens of hosts, or an environment where you cannot establish trust in the tooling.
- The systems are outside your competence: mobile devices, industrial control systems, or cloud platforms whose evidence model you do not know.
- You have found something you do not understand and your next step would be a guess.

Escalating early is cheap. Escalating after you have run six tools across the original evidence is expensive, and sometimes the specialist's first finding is what *you* did. The most professional sentence available to a first responder is: "I have preserved it, here is the chain of custody, here is exactly what I ran and when, and I stopped here."

## Practice

**Exercise 1 — Order the collection.** A workstation is running, showing a ransom note, with an active outbound connection. You have twenty minutes before the business demands the machine back. List, in order, everything you would collect, with the reason each item is where it is in the order and a note of what would be lost if you did the next item first. Then write the same list for the case where the machine has already been powered off by the user, and state precisely what is now unrecoverable.

**Exercise 2 — Acquire and verify.** In your lab, acquire a small virtual disk or a prepared USB image end to end: document the device, verify write blocking, hash the source, create the image, hash the image, and verify the match. Produce the complete acquisition record in the format shown in this lesson. Then deliberately alter one byte of your working copy, rehash, and document the discrepancy exactly as you would report it, including what you would do next.

**Exercise 3 — Artifact to claim.** For each claim, name the artifacts that would support it, say which single artifact is strongest and why, and name a second, independent source that would corroborate it. (a) A specific program executed on this host at a specific time. (b) A file was downloaded from a specific URL. (c) The attacker established persistence. (d) A user account was created by the attacker rather than by IT. (e) Data left the network. (f) The host's clock was wrong. (g) Event logs were cleared.

**Exercise 4 — Build the merged timeline.** Your instructor supplies artifact extracts from two hosts and three network sources, at least one in local time and at least one from a host with a known clock offset. Build a single merged UTC timeline with a source column, apply and record every time conversion, and write a 300-word narrative of what happened. Finish with a list of every claim in your narrative that rests on a single uncorroborated source.

**Exercise 5 — Document your own footprint.** Perform a live-collection sequence on a lab virtual machine, keeping a full transcript. Afterwards, identify every change *your own activity* made to that system — logon records, files written, devices attached, processes created — and write the section of the case record that discloses it. Then have a classmate examine the system without your notes and list the artifacts they attribute to "unknown activity"; compare the two lists and discuss what you failed to record.

**Exercise 6 — Draw the escalation line.** For each of five scenarios your instructor supplies, decide whether it is within first-responder scope or needs a specialist. For those needing escalation, write the handover: what you have preserved, the chain of custody, exactly what you ran and when, what you concluded, and the specific question you want the specialist to answer. Keep each handover under 250 words.

## Check your understanding

1. A running host is beaconing but not destroying data. Power off or network-isolate? *Network-isolate and leave it running; powering off destroys memory, network state, and running processes.*
2. What do you collect first from a running host, and what one-line measurement must you not forget? *Memory; and the clock offset against a trusted source.*
3. The host's own tools show no connection but the firewall log shows one. Which do you believe? *The firewall — it was collected on a system the attacker does not control. Record the discrepancy.*
