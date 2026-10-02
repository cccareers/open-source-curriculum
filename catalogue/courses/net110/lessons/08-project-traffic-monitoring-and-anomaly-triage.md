---
lesson_id: net110-08
course_id: net110
pathway: cybersecurity-support-technician
title: 'Project: Traffic Monitoring and Anomaly Triage'
order: 8
kind: project
competency_ids:
  - D2-S1-C02
  - D1-S1-C04
objectives: []
---

## The goal

Produce a **triage report** on one working day of network activity from a network you did not design, identifying which conversations are anomalous, stating the evidence for each, and recommending what happens next.

You are not configuring anything in this project. The deliverable is a written report, because that is the artifact a support technician actually produces in this situation, and because a monitoring finding that cannot be communicated precisely does not exist. Two capabilities are being assessed:

- Can you **identify anomalous traffic** from flow and log evidence, distinguishing it from traffic that merely looks unfamiliar?
- Can you **apply the right tool or data source** to a monitoring question, and say why that source and not another?

Budget four hours. Roughly two on analysis, one on gathering corroborating evidence and ruling things out, one on writing. If you are three hours in and still reading records, stop and start writing — an incomplete report delivered is worth more than a complete one that never ships.

Your scope ends at a well-formed handoff. You are not running an incident, correlating across a SIEM, or performing containment; you are producing the observation that a responder acts on.

## The environment

**Meridian Freight Brokerage.** Ninety-two staff in one building, plus a warehouse annex. The network was segmented eighteen months ago along the lines you would recognize from lesson 03.

```text
10.14.10.0/24   Management        network gear, hypervisors, logging, backup console
10.14.20.0/24   DMZ               public website, mail gateway, VPN concentrator
10.14.30.0/24   Staff             workstations and laptops (DHCP)
10.14.40.0/24   Servers           file, print, directory, load-tracking application
10.14.50.0/24   Data              load-tracking database, accounting database
10.14.60.0/24   Devices           printers, cameras, badge readers, warehouse scanners
10.14.70.0/24   Guest Wi-Fi       visitors, internet only
10.14.80.0/24   Backup            backup appliance and its targets
```

**Known infrastructure facts**, from the runbook:

- Internal DNS resolvers: `10.14.40.10` and `10.14.40.11`. All internal hosts are configured to use them; the resolvers forward externally.
- Internal NTP: `10.14.40.10`.
- Patch/update server: `10.14.40.5`.
- Load-tracking application server: `10.14.40.22`. Its database is `10.14.50.11` on TCP 5432.
- Accounting database: `10.14.50.12` on TCP 1433. Reached only by the accounting application on `10.14.40.25`.
- File server: `10.14.40.20`, SMB.
- Backup appliance: `10.14.80.5`. Backup window is 01:00–04:00 nightly; it pulls from servers, and its traffic to `10.14.40.0/24` and `10.14.50.0/24` is expected and large.
- The mail gateway `10.14.20.30` is the only host permitted to send SMTP to the internet.
- The vulnerability scanner runs from `10.14.10.40`, on the first Tuesday of each month, 06:00–08:00.
- Business hours are 07:00–18:00 local. The date of this data is **Thursday, 12 March 2026** — not the first Tuesday of anything.

**DHCP lease extract** for the addresses appearing below:

```text
10.14.30.44   OPS-LT-0113    a4:83:e7:1c:90:22   lease 03/12 06:41 - 03/13 06:41
10.14.30.61   ACC-WS-0007    3c:22:fb:44:10:8e   lease 03/12 06:58 - 03/13 06:58
10.14.30.79   OPS-LT-0140    b8:27:eb:9a:33:71   lease 03/11 07:12 - 03/12 07:12
10.14.60.31   WH-SCAN-004    00:1b:63:84:45:e6   static reservation
10.14.60.18   CAM-DOCK-02    00:1b:63:84:11:c2   static reservation
```

## The evidence

### Extract A — connection records

Zeek-style. `orig` is the initiator. Times are local. `conn_state` follows the convention from lesson 02: `SF` normal establishment and teardown, `S0` attempt with no reply, `REJ` rejected, `RSTO` reset by originator.

```text
ts        id.orig_h     id.orig_p  id.resp_h       id.resp_p  proto  service  duration  orig_bytes  resp_bytes  conn_state
08:02:11  10.14.30.44   51203      10.14.40.22     443        tcp    ssl      42.10     18244       402118      SF
08:02:55  10.14.30.61   49882      10.14.40.20     445        tcp    smb      6.44      9120        1204338     SF
08:14:02  10.14.30.44   51771      203.0.113.201   443        tcp    ssl      1.04      1188        844         SF
08:19:02  10.14.30.44   51810      203.0.113.201   443        tcp    ssl      1.02      1190        844         SF
08:24:02  10.14.30.44   51844      203.0.113.201   443        tcp    ssl      1.03      1188        851         SF
08:29:02  10.14.30.44   51902      203.0.113.201   443        tcp    ssl      1.05      1191        844         SF
08:31:40  10.14.40.22   38112      10.14.50.11     5432       tcp    -        0.31      2210        18402       SF
08:33:12  10.14.30.79   52001      10.14.40.20     445        tcp    smb      3.10      4402        88210       SF
08:34:02  10.14.30.44   51955      203.0.113.201   443        tcp    ssl      1.02      1189        844         SF
09:41:08  10.14.30.61   50117      10.14.40.25     443        tcp    ssl      120.55    44210       2201884     SF
09:47:22  10.14.60.31   40221      10.14.40.22     443        tcp    ssl      0.88      1420        6602        SF
10:02:14  10.14.30.79   52288      10.14.40.21     445        tcp    -        0.00      0           0           S0
10:02:14  10.14.30.79   52289      10.14.40.22     445        tcp    -        0.00      0           0           S0
10:02:15  10.14.30.79   52290      10.14.40.23     445        tcp    -        0.00      0           0           S0
10:02:15  10.14.30.79   52291      10.14.40.24     445        tcp    -        0.00      0           0           S0
10:02:15  10.14.30.79   52292      10.14.40.25     445        tcp    -        0.00      0           0           S0
10:02:16  10.14.30.79   52293      10.14.40.26     445        tcp    -        0.00      0           0           S0
10:02:16  10.14.30.79   52294      10.14.40.27     445        tcp    -        0.00      0           0           S0
10:02:17  10.14.30.79   52295      10.14.50.11     445        tcp    -        0.00      0           0           S0
10:02:17  10.14.30.79   52296      10.14.50.12     445        tcp    -        0.00      0           0           S0
10:11:44  10.14.30.61   50402      10.14.50.12     1433       tcp    -        0.00      0           0           REJ
10:14:20  10.14.60.18   1024       198.51.100.14   23         tcp    -        0.00      0           0           S0
10:28:31  10.14.40.5    44120      192.0.2.60      443        tcp    ssl      88.20     14220       88402114    SF
11:05:09  10.14.30.44   52401      10.14.40.10     53         udp    dns      0.02      74          138         SF
11:05:11  10.14.30.44   52402      8.8.8.8         53         udp    dns      0.04      68          122         SF
11:22:40  10.14.20.30   35001      203.0.113.88    25         tcp    smtp     4.20      88210       1420        SF
12:40:02  10.14.30.44   53880      203.0.113.201   443        tcp    ssl      1.04      1188        844         SF
13:18:55  10.14.30.79   54100      10.14.40.20     445        tcp    smb      840.20    22488       0           RSTO
14:02:33  10.14.30.61   54882      10.14.40.25     443        tcp    ssl      95.40     38210       1880422     SF
15:44:12  10.14.30.79   55201      192.0.2.211     443        tcp    ssl      1802.30   4881220144  92104       SF
16:30:00  10.14.80.5    41002      10.14.40.20     445        tcp    smb      1210.40   8820        9928441022  SF
17:15:02  10.14.30.44   56003      10.14.40.22     443        tcp    ssl      12.80     8420        140228      SF
22:41:19  10.14.30.79   58221      192.0.2.211     443        tcp    ssl      2440.10   9928114002  188220      SF
```

### Extract B — DNS query log (internal resolvers)

```text
ts        client        query                                                        qtype  rcode
08:14:01  10.14.30.44   updates.contoso-office.example                               A      NOERROR
08:14:01  10.14.30.44   telemetry-eu.contoso-office.example                          A      NOERROR
09:40:58  10.14.30.61   accounting.meridian.internal                                 A      NOERROR
10:02:13  10.14.30.79   fileshare.meridian.internal                                  A      NOERROR
11:31:02  10.14.30.79   k7d92mfl3xq0zpb.sync-node.example                            TXT    NOERROR
11:31:03  10.14.30.79   n4b81wcy7ru2sha.sync-node.example                            TXT    NOERROR
11:31:03  10.14.30.79   q9z14vpe6ok5jdm.sync-node.example                            TXT    NOERROR
11:31:04  10.14.30.79   t2m73hgx1yn8clb.sync-node.example                            TXT    NOERROR
11:31:04  10.14.30.79   w6r58kaz4ie0qvf.sync-node.example                            TXT    NOERROR
12:02:11  10.14.30.61   printserver.meridian.internal                                A      NOERROR
14:12:40  10.14.30.44   cdn.contoso-office.example                                   A      NOERROR
15:43:59  10.14.30.79   backup-relay.sync-node.example                               A      NOERROR
16:02:00  10.14.30.61   invoices-portal.example                                      A      NOERROR
16:02:12  10.14.30.61   mail.meridian.internal                                       A      NOERROR
```

The DNS log above records **queries that reached the internal resolvers**. Extract A contains at least one lookup that did not.

### Extract C — IDS alerts

```text
03/12/2026-10:14:20.882110  [**] [1:2001219:5] POLICY Cleartext administrative
protocol attempt (Telnet) [**] [Classification: Potential Corporate Policy
Violation] [Priority: 2] {TCP} 10.14.60.18:1024 -> 198.51.100.14:23

03/12/2026-10:02:17.114338  [**] [1:2010935:3] SCAN Multiple SMB connection
attempts from single source [**] [Classification: Attempted Information Leak]
[Priority: 2] {TCP} 10.14.30.79 -> 10.14.40.0/24

03/12/2026-11:31:04.220145  [**] [1:2027863:4] DNS Large volume of TXT queries
to single domain [**] [Classification: Potentially Bad Traffic] [Priority: 2]
{UDP} 10.14.30.79:41022 -> 10.14.40.10:53

03/12/2026-15:44:12.900412  [**] [1:2013028:6] POLICY Outbound TLS session
exceeding size threshold [**] [Classification: Potential Corporate Privacy
Violation] [Priority: 3] {TCP} 10.14.30.79:55201 -> 192.0.2.211:443
```

### Extract D — firewall log excerpt (denies only)

```text
10:11:44  DENY  rule=99  10.14.30.61:50402  -> 10.14.50.12:1433  tcp
10:14:20  DENY  rule=61  10.14.60.18:1024   -> 198.51.100.14:23  tcp
10:02:14  DENY  rule=99  10.14.30.79:52288  -> 10.14.40.21:445   tcp
10:02:14  DENY  rule=99  10.14.30.79:52289  -> 10.14.40.22:445   tcp
10:02:15  DENY  rule=99  10.14.30.79:52290  -> 10.14.40.23:445   tcp
10:02:15  DENY  rule=99  10.14.30.79:52291  -> 10.14.40.24:445   tcp
10:02:15  DENY  rule=99  10.14.30.79:52292  -> 10.14.40.25:445   tcp
10:02:16  DENY  rule=99  10.14.30.79:52293  -> 10.14.40.26:445   tcp
10:02:16  DENY  rule=99  10.14.30.79:52294  -> 10.14.40.27:445   tcp
10:02:17  DENY  rule=99  10.14.30.79:52295  -> 10.14.50.11:445   tcp
10:02:17  DENY  rule=99  10.14.30.79:52296  -> 10.14.50.12:445   tcp
```

## Requirements

Numbered so a reviewer can grade them one at a time.

**R1 — A baseline statement.** Before analyzing anything, write a short description of what normal looks like on this network, derived from the runbook facts and the zone plan: which zones initiate to which, which large transfers are expected and when, which hosts are permitted to talk to the internet on which protocols. Half a page. Every later judgment must be traceable to something in here, and any anomaly you claim must be anomalous *against this statement*.

**R2 — A complete conversation inventory.** A table with one row per distinct conversation or conversation group in Extract A, with columns: initiator (address and hostname where derivable), responder, service, direction (north-south inbound, north-south outbound, or east-west), volume each way, outcome, and a one-word classification of **routine**, **needs context**, or **anomalous**. Every row in Extract A must be accounted for. Grouping the repeated five-minute connections into one row is correct and expected; say how many you grouped.

**R3 — Findings, with evidence.** For each conversation you classified as anomalous, write a finding containing:

- **What you observed**, in the narration form from lesson 02: endpoints, direction and initiator, service, volume and shape, timing and repetition, outcome.
- **Why it is anomalous**, stated against your R1 baseline — not against a general feeling.
- **Corroborating evidence** from at least one *other* extract. A finding supported by only one data source is weaker, and saying so is part of the job.
- **What you ruled out**, and how. Name the benign explanation you considered and the specific evidence that did or did not eliminate it.
- **Confidence**: high, medium, or low, with a one-sentence reason.
- **Recommended next step**, and who should take it.

There are **at least five** things in this data worth writing up. There are also conversations that look alarming and are not, and conversations that look mundane and are not. Getting the second kind right is worth more than volume.

**R4 — Tool and data-source justification.** For each finding, name the tool or data source you would use to advance the investigation one step further, and say in one sentence why that source and not another. Choose from, at minimum: full packet capture, flow records, DNS resolver logs, DHCP lease logs, NAT or firewall session logs, IDS alerts and the referenced packet, host-based logs, and asset inventory. At least one finding must require a source that is *not present* in the extracts, and you must say what you would ask for and why the existing evidence cannot answer the question.

**R5 — A false-positive analysis.** Identify at least two items in the evidence that a careless analyst would escalate and that you assess as routine. For each, state what makes it look alarming, the specific evidence that resolves it, and what would have to be different for your assessment to change.

**R6 — A gap analysis.** Name three things about this network's monitoring that this exercise revealed as blind spots, and for each say where you would place a sensor or which log source you would add, using the placement vocabulary from lesson 05. One of your three must be about traffic that never reached an enforcement or observation point at all.

**R7 — The handoff.** A summary of no more than 250 words, written for a shift lead who has ninety seconds. It must state: how many findings, which one is most urgent and why, what you recommend be done in the next hour, and what you could not determine with the evidence available. This is graded on precision, not on alarm.

## Constraints

- **Evidence only.** Every claim traces to a specific line in a specific extract, cited by timestamp. If you infer, label it as an inference.
- **No attribution to a cause you cannot support.** "Consistent with automated check-in behavior" is a defensible sentence. Naming a specific piece of malware from a flow record is not.
- **No containment recommendations you are not scoped to make.** Recommend; do not decide to disconnect a user's machine in a written report as though it were already done.
- **Distinguish the host from the person.** `OPS-LT-0140` behaving oddly is a statement about a machine. Statements about the human who uses it require evidence you do not have here, and writing them into a report has consequences.
- **Stay inside this course's scope.** You are producing observations and recommended next steps. Alert correlation across systems, case management, and the incident-response process are handled elsewhere in the pathway; note where your report hands off rather than performing that work.
- **Length.** The report should be four to seven pages including tables. Longer usually means you narrated instead of analyzing.

## Definition of done

Your report is finished when all of the following are true:

1. Every row in Extract A appears in your R2 inventory, with none unclassified.
2. Every hostname derivable from the DHCP extract is used in place of a bare address in your findings.
3. Every anomalous finding cites at least two extracts.
4. At least five findings, each with a ruled-out benign explanation and a stated confidence.
5. At least two false positives analyzed under R5, each with the specific evidence that resolves it.
6. At least one finding identifies traffic that **succeeded** and one identifies traffic that **failed**, and your report explains why the failed one still matters.
7. R4 names at least one data source not present in the extracts, with the question it would answer.
8. Three gaps under R6, at least one of which concerns a vantage point rather than a rule.
9. The R7 summary is under 250 words and names an explicit "cannot determine."
10. A colleague could act on any single finding without asking you a clarifying question.

## Hints

- **Work the method, in order.** Endpoints, direction, service, volume and shape, outcome, baseline comparison. The temptation is to jump to the biggest number in the table; the biggest number in this data is expected and documented.
- **Regularity is the strongest single signal available to you.** Humans are irregular. Look at the intervals between repeated conversations and measure them rather than eyeballing them.
- **Compare byte counts in both directions.** A large `orig_bytes` with a small `resp_bytes` is an upload, and an upload is a different story from a download of the same size.
- **Failed connections are evidence too.** An `S0` or a `REJ` tells you something was attempted and stopped. Nine of them in three seconds tells you something else entirely. A single `REJ` from a workstation to a database port is a small thing with a large implication — check the zone matrix.
- **Read the DNS log against the connection records.** A connection whose destination never appears as a resolved name is interesting. So is a resolution with no corresponding connection.
- **One host in this data does something legitimate that violates policy, and one does something that looks like policy violation and is a genuine problem.** Both deserve a finding; they deserve different recommendations.
- **Check what talked to a resolver that was not yours.** It is one line.
- **Not every device that misbehaves is compromised.** A device with a hardcoded vendor default is a procurement and configuration problem, and saying so precisely is more useful than escalating it as an intrusion.
- **The backup window is in the runbook.** So is the scanner schedule, and so is today's date. Read all three before you flag anything as "large transfer at an unusual hour."
- **When you cannot tell, say so and name the evidence you would need.** "Cannot determine from flow data; requires the packet capture referenced by SID 2013028" is a professional answer and demonstrates exactly the tool-selection judgment being assessed.
