---
lesson_id: cyb120-03
course_id: cyb120
pathway: cybersecurity-support-technician
title: Detection Sources, Logs, and Alert Triage
order: 3
kind: lesson
competency_ids:
  - D1-S1-C04
  - D2-S1-C02
objectives:
  - Triage an alert queue and decide which alerts become incidents
---

## The queue is the job

Lesson 02 said that an incident begins when someone decides an event is an incident. This lesson is about where that decision actually gets made: a queue of alerts, most of which are not incidents, some of which are, and none of which are labelled.

That is the honest shape of the work. A monitoring stack in a mid-sized organization produces somewhere between dozens and thousands of alerts a day. If every one got a full investigation, nothing would get investigated. If none did, the tooling would be decoration. Triage is the discipline of spending the right amount of attention on each item and being able to justify the split — and it is a skill in exactly the way that reading an X-ray is a skill: mostly pattern recognition built on a small number of principles, learned by doing it several hundred times.

Two things make triage learnable rather than mystical. First, the **sources** are finite: there are only so many kinds of telemetry, and each one answers a specific class of question. Second, the **procedure** is fixed: every alert gets the same first four questions, in the same order, no matter how exciting it looks. Get the sources into your head and the procedure into your hands, and the judgment develops on its own.

Everything in this lesson is vendor-neutral. You will meet a specific SIEM, endpoint tool, and network sensor at work, and their query languages differ. The *schema* they are querying is remarkably consistent, because it is dictated by what computers actually record. Learn the schema and you can pick up any product's syntax in a week.

## What the sources are, and what each one can tell you

Think of your telemetry as a set of witnesses. Each one saw part of the event, none saw all of it, and each has a characteristic blind spot. A responder's fluency is knowing, without looking it up, which witness to ask.

**Endpoint telemetry.** The richest source you have and the one that answers "what happened on the machine?" Modern endpoint tooling records process creation with the full command line and the parent process, file writes, network connections made by a specific process, module loads, service and scheduled-task creation, and script execution. It is the only source that can tie a network connection to *the program that made it*. Blind spot: it only covers hosts that have the agent, which never means all of them.

```text
timestamp=2026-03-10T14:02:11Z host=WKS-4471 user=CORP\j.ruiz
event=process_create pid=8812 ppid=6640
parent=WINWORD.EXE
image=powershell.exe
cmdline="powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4A..."
```

Two fields in that line carry almost all of its meaning. The parent process is a document editor and the child is a scripting host — an office application should almost never be the parent of a shell. And the command line requests hidden execution of an encoded command. Neither field is inherently malicious; together, on a finance workstation, they are the most useful line in the day's logs.

**Authentication and directory logs.** Answer "who logged in, from where, to what, and did it work?" This is the source for credential attacks, lateral movement, and account misuse. Fields that matter: account, source address, target system, logon type (interactive, network, remote-interactive, service), result, and failure reason.

```text
2026-03-10T14:07:03Z auth: result=FAILURE user=svc_backup src=10.14.9.22
  target=FS-02 logon_type=network reason=bad_password
2026-03-10T14:07:04Z auth: result=FAILURE user=svc_backup src=10.14.9.22
  target=FS-03 logon_type=network reason=bad_password
2026-03-10T14:07:06Z auth: result=SUCCESS user=svc_backup src=10.14.9.22
  target=FS-07 logon_type=network
```

Three lines and a story: one source address trying one service account against several file servers in seconds, then succeeding. The *rate* and the *fan-out* are the signal, not any single line.

**Network flow records.** Answer "who talked to whom, when, for how long, and how much?" Flow data does not include content, which makes it cheap enough to keep for a long time — and long retention is exactly what you need when you discover in March that something started in December. Flow is your workhorse for scoping.

```text
start=2026-03-10T14:03:00Z dur=0.42 proto=tcp
  src=10.14.7.51:52288 dst=198.51.100.44:443 pkts=12 bytes=3180
start=2026-03-10T14:04:00Z dur=0.39 proto=tcp
  src=10.14.7.51:52301 dst=198.51.100.44:443 pkts=11 bytes=3044
start=2026-03-10T14:05:00Z dur=0.44 proto=tcp
  src=10.14.7.51:52317 dst=198.51.100.44:443 pkts=12 bytes=3210
```

Notice what makes this suspicious without any knowledge of the destination: near-identical byte counts at a near-exact sixty-second cadence. Humans browsing produce ragged, bursty traffic. Machines checking in with a controller produce metronomic traffic. That pattern — **beaconing** — is one of the highest-value things you can learn to see in flow data, and it is visible with nothing but timestamps and byte counts.

**DNS logs.** Answer "what names did this host try to resolve?" DNS is the cheapest high-value log source in existence and the most commonly missing one. Almost everything resolves a name before it connects, including malicious code, so DNS often shows you the attempt even when the connection was blocked. It is also where you see algorithmically generated domains, unusually long labels, and lookups of names that no human typed.

**Web proxy and egress logs.** Answer "what URLs did this host request, with what user agent, and what came back?" Proxy logs give you the full request path, the response size, and the content type, which flow data cannot.

```text
2026-03-10T14:02:19Z proxy: user=j.ruiz src=10.14.7.51 method=GET
  url=hxxp://cdn-updates-cache[.]example/win/upd.ps1
  status=200 bytes=41229 ua="Mozilla/5.0" ctype=text/plain
```

The defanged notation (`hxxp`, brackets around the dot) is a professional convention: it renders a suspicious URL unclickable so nobody in the case thread accidentally visits it. Use it in every write-up.

**Intrusion detection and network security monitoring alerts.** Answer "did traffic match a known-bad pattern?" Signature-based detection is precise and narrow; it finds what someone has already described. Treat an IDS alert as a *pointer* to traffic worth examining, not as a verdict.

**Email gateway logs.** Answer "what arrived, from whom, with what attachment, and who clicked?" Since phishing remains the most common initial access vector you will meet, this is often where the timeline starts.

**Cloud and SaaS audit logs.** Answer "what did this identity do in the platform?" Console logins, API calls, permission changes, sharing links, mailbox rule creation, data exports. Two patterns here are worth memorizing because they are so common: a newly created inbox rule that moves messages to a rarely-read folder (a hallmark of business email compromise) and a sudden bulk download from a file-sharing platform.

**Application and database logs.** Answer questions the infrastructure cannot: which records were queried, which transaction was reversed, which admin function was invoked. Chronically under-collected, and the only source that can establish *what data* an attacker actually touched.

**People.** Users, help desk tickets, and outside parties. Do not treat this as a lesser source — a meaningful share of real incidents are first reported by a human being who noticed something felt wrong. "My mouse moved on its own" and "I got a password reset email I didn't ask for" are high-quality signals.

The habit to build: for any question you are asked during an incident, name the source that answers it before you start typing. "Did data leave?" is a flow-and-proxy question. "What program sent it?" is an endpoint question. "Who authorized the account?" is a directory question. Analysts who skip that step end up grepping the wrong log for twenty minutes.

## Making logs usable: time, normalization, and correlation

Raw logs from ten sources are not evidence; they are ten dialects. A few fundamentals turn them into something you can reason across.

**Time is the join key, so time must be trustworthy.** Every host that logs must synchronize its clock to a common time source, and every log you analyze should be normalized to UTC. This is not pedantry. A three-minute clock skew between an endpoint and a firewall will make an outbound connection appear to precede the process that created it, and a responder who does not know about the skew will construct a wrong story with complete confidence. Daylight-saving transitions are worse, because they are invisible: a local-time log crossing the change produces an hour that happens twice. Record times in UTC with an explicit offset, always, and note any host whose clock you have found to be wrong.

**Normalization** maps each source's field names onto a common vocabulary — one `src_ip` rather than `source_address`, `SourceIp`, `id.orig_h`, and `client`. Most SIEM platforms do this at ingest. You do not need to build it, but you do need to know it happened, because normalization can lose fields, and the field you want is sometimes only in the raw event. When an answer looks impossible, look at the raw record before you conclude the data does not exist.

**Enrichment** attaches context at ingest or at query time: which user an address belonged to at that moment, whether the host is a server or a laptop, its business criticality, the geolocation of an external address, whether the account is privileged. Enrichment is what turns "10.14.7.51 connected outbound" into "the finance manager's laptop connected outbound," and it is most of the difference between a fast triage and a slow one.

**Correlation** is the reason a SIEM exists: relate events across sources to produce a conclusion no single source supports. A failed-login burst, alone, is noise. A failed-login burst from one source followed within seconds by a success, followed by that account authenticating to three systems it has never touched, is a correlated detection. Every product spells this differently; the concept is universal and it is worth writing correlation rules out in plain language before worrying about syntax:

```text
Rule: Suspicious service-account spray
  WHEN  >= 10 auth failures for a single account
  FROM  a single source address
  WITHIN 60 seconds
  AND   followed by >= 1 auth success for that account from that source
  WITHIN 5 minutes
  THEN  alert, severity medium, enrich with account privilege level
        and the target host list
```

**Detection types, and what each costs you.** Signature detection matches known-bad specifics — a hash, a domain, a byte pattern. Precise, cheap to triage, blind to anything new. Behavioral or heuristic detection matches suspicious *patterns* — a document spawning a shell, a service account logging in interactively. Catches novel activity, produces more false positives. Anomaly detection flags statistical deviation from a learned baseline. Powerful in a stable environment and unusable in a chaotic one; be sceptical of anomaly alerts in the first weeks after any large change. Threshold detection fires on volume: N failures, N megabytes, N new hosts. Simple, effective, and trivially evaded by an attacker who goes slower than N.

Knowing which type produced an alert changes how you triage it. A signature hit means "this exact thing was seen before, verify it is really here." A behavioral hit means "this pattern is often bad, determine whether this instance is."

## The triage procedure

Every alert gets the same first four questions, asked in this order. The order matters: it stops you doing expensive work on an item that question one would have closed.

**1. Is it real?** Did the described thing actually happen? Confirm against a second, independent source. If the endpoint says the process ran, does the proxy or flow log agree the connection happened? If the two disagree, you have a question, not a fact — and a surprising number of alerts die right here, because the tool misparsed a field, a test was running, or the rule matched something structurally unlike what it was written for.

**2. Is it authorized?** Real does not mean bad. A vulnerability scanner triggering half the IDS in the building is real and authorized. A backup agent reading every file on a share at 2am is real and authorized. This question requires context you can only get by asking: check the change calendar, check the asset owner, check whether maintenance is running. The answer "yes, that's our new endpoint tool doing an inventory sweep" closes more alerts than any technical analysis.

**3. What is the blast radius if it is bad?** Before you go deep, establish stakes. Is the asset a kiosk in a lobby or the payroll database? Is the account a contractor's read-only login or a domain administrator? Is the data involved regulated? This question determines how much of your day the alert deserves and how fast anyone else needs to hear about it. Doing it *third* — rather than last, after an hour of analysis — is what separates efficient analysts from busy ones.

**4. What else looks like this?** Pivot on the strongest single fact in the alert and search everywhere for it. The strongest fact is usually one of: a file hash, an external address or domain, an account name, a distinctive command line, a parent-child process pair, or a user agent string. This is the question that turns "a workstation" into "eleven workstations," and skipping it is the most common cause of an incident that returns two weeks later.

Each alert then closes with one of four dispositions, and using precise language for them is worth the effort:

- **False positive.** The described activity did not occur, or the rule matched something structurally different from what it was meant to catch. This is a tuning problem — it goes on the tuning list.
- **Benign true positive.** The activity occurred exactly as described and is authorized or harmless. This is *not* a false positive, and calling it one damages your tuning: the rule worked correctly. Handle it with an exception or context enrichment, not by weakening the detection.
- **Suspicious, unresolved.** You cannot establish either way with the data available. Say so explicitly, record what you checked, and either escalate or set a follow-up with a defined trigger. "Unresolved" is an honest and legitimate disposition; silently closing it because the shift ended is not.
- **Incident.** It happened, it was not authorized, and it matters. Declare it, following lesson 02.

Whatever the disposition, write down the four answers. A closed alert with no reasoning is indistinguishable from an unexamined one — and when the same activity resurfaces in six weeks, the notes are what let you say "we saw this in March and it was the backup agent" in thirty seconds instead of two hours.

## Prioritizing the queue

You will rarely have a queue of one. Ordering it well is its own skill, and there are three principles.

**Order by impact times confidence, not by the tool's severity field.** The severity a product assigns is a factory default that knows nothing about your environment. A "critical" signature hit on an isolated test VM is less urgent than a "medium" behavioral alert on the domain controller. Ask two questions — how bad if it is true, and how likely is it true — and let the product's label be an input, not the answer.

**Cluster before you work.** Ten alerts referencing the same host, the same account, or the same external address are one investigation, not ten. Sort the queue by the entities involved and you will often find the day's work is four investigations wearing forty hats. This also prevents a specific failure: two analysts independently working two halves of the same intrusion and neither realizing it.

**Watch for the flood that hides something.** A sudden burst of low-value alerts is occasionally deliberate cover, and much more often a broken integration. Either way, a flood needs a different response from an alert: identify the cause of the *volume* first, suppress it at the source if it is noise, and only then return to the queue. And be aware of the specific danger of the very noisy rule — a detection firing 400 times a day gets ignored by everyone, so the one true positive inside it is invisible. Chronic noise is not an annoyance, it is a detection failure.

**Tuning is part of triage, not a separate project.** Every shift, one or two rules will show themselves to be systematically wrong. Write them down as you go — rule name, why it misfires, and what would fix it (a filter for a known-good process path, a raised threshold, an exception scoped to one host, or retirement). Then propose the change through whatever review your team uses. Tuning without review is how detection quietly disappears; nobody notices a rule that never fires.

## A worked triage

Here is the queue at the start of a shift. Read it before reading the analysis.

```text
ID    TIME(UTC)  RULE                                  ENTITY        SEV
A-101 13:58      IDS: outbound connection to newly     WKS-4471      med
                 registered domain
A-102 14:02      EDR: office application spawned       WKS-4471      high
                 script interpreter
A-103 14:03      Proxy: script file downloaded from    WKS-4471      low
                 uncategorized site
A-104 14:07      Auth: 12 failures then success for    FS-07         med
                 svc_backup from 10.14.9.22
A-105 14:11      DLP: 240 MB uploaded to personal      WKS-3307      high
                 cloud storage
A-106 14:15      AV: PUA detected and quarantined      WKS-0918      low
```

**Cluster first.** A-101, A-102, and A-103 all reference WKS-4471 within five minutes. That is one investigation, and its narrative writes itself in the right order: a script interpreter spawning from a document at 14:02:11 (A-102), then that script fetching a file from an uncategorized site at 14:02:19 (A-103, queued at 14:03), and an outbound connection to a new domain at 13:58 (A-101). Note that the timeline is not the alert order — A-101 is stamped earlier than the download it supposedly follows, which is either a clock skew to check or an earlier, separate connection. Either way you have found the first question worth asking.

**Now the four questions on the WKS-4471 cluster.** Real? Three independent sources agree — endpoint, proxy, and network sensor — so yes. Authorized? The host is a finance workstation, the change calendar is empty, and a document spawning a hidden encoded script has no benign explanation anyone can offer. Blast radius? Finance workstation with mapped access to the finance share; the user is not privileged, which caps it, but the data reachable is sensitive. What else looks like this? Search the environment for the destination address and the download URL. Suppose that search returns one more workstation with the same destination since 13:52Z on 10 March. The 13:51:07Z script launch on that host is established later in lesson 06.

That cluster is an incident. Declare it.

**A-105, the 240 MB upload,** is the one that should worry you next, and here the discipline of question two earns its keep. Real? The proxy confirms the volume and destination. Authorized? Check with the user's manager before assuming — and suppose the answer is that the user is a designer who routinely moves large asset files and has an approved exception. That is a *benign true positive*: the rule fired correctly, the activity happened, and it is sanctioned. It closes with a note recording the exception, and the tuning list gets an entry proposing that the exception be encoded so it stops costing an analyst twenty minutes a week. What it must not get is a shrug.

**A-104, the service-account spray,** is real and is not authorized: `svc_backup` should authenticate from the backup server, and 10.14.9.22 is a workstation. Blast radius is high, because a service account often has broad file access. What else looks like this? Search for every authentication by that account in the last thirty days and identify every source. At this stage, treat it as a second incident pending correlation with the workstation cluster; independence has not been established. Resolve 10.14.9.22 against the asset inventory before deciding whether to merge the cases. It is arguably more urgent — but note that it *looks* less exciting in the queue than A-105 did, which is precisely why the tool's severity field cannot be trusted as the ordering.

**A-106, the quarantined potentially-unwanted application,** is real, is not authorized by policy, and was successfully blocked. Blast radius is minimal. It closes as a low-priority policy item routed to desktop support, with one pivot first: check whether the same detection appears on other hosts, because the same PUA on forty machines is a software-distribution problem rather than a user problem.

The shift's initial output: two provisional incident records pending correlation, one benign true positive with a tuning proposal, one policy referral, and one open question about clock skew. Written down in that form, it takes a colleague ninety seconds to pick up where you left off.

## Watching network traffic on purpose

Triage is reactive; the queue brings you work. The other half of monitoring is going to look on purpose, and there are patterns in network traffic worth checking for even when nothing has alerted.

**Beaconing.** Regular, similarly-sized connections from one internal host to one external address. Sort flow records by source-destination pair, look at the distribution of intervals, and be suspicious of low variance. Real jitter exists in malicious tooling too, so look at the *shape* over hours rather than demanding perfect regularity.

**Long connections.** A single session open for many hours to an external address is unusual for most business traffic and normal for remote-access tooling — which is precisely the point.

**Volume asymmetry.** Ordinary browsing downloads far more than it uploads. A host that has sent ten times what it received deserves a question, especially outside business hours.

**Unusual destinations for the role.** A print server making outbound connections to the internet. A database host resolving external domains. Ask what the machine's job is and whether the traffic fits it.

**Protocol on the wrong port, and protocol mismatch.** Non-web traffic on 443, DNS-shaped traffic on a non-DNS port, or a connection whose declared protocol does not match its behavior. Any of these is worth a look.

**New-to-the-environment anything.** A first-seen external domain, a first-seen user agent string, a first-seen host-to-host pair inside the network. "First time we have ever observed this" is one of the most productive filters available, and it is cheap to compute if you retain flow and DNS data.

None of these is a verdict. Each is a question, and the answer is usually mundane — a new SaaS vendor, a software update service, a monitoring agent. But the habit of asking turns your logs from a place you look after an alert into a place you find things before one.

## Practice

**Exercise 1 — Map questions to sources.** For each question, name the single best log source, one corroborating source, and the field you would filter on. (a) Did any host contact 203.0.113.19 in the last 30 days? (b) Which program made that connection? (c) Did anyone open the attachment from the 08:40 email? (d) Was a mailbox forwarding rule created this week? (e) Which accounts authenticated from outside the country? (f) Did anyone read the customer table on Tuesday afternoon? (g) What names did WKS-4471 resolve between 13:50 and 14:10? For any question your lab environment could not currently answer, write one sentence naming the log source that is missing.

**Exercise 2 — Triage the queue.** Using the six alerts in this lesson, produce a written triage record for each one containing: the four questions with your answers, the disposition, the pivot you ran, and the single next action. Then re-order the queue as you would actually work it and justify the ordering in three sentences, referring to impact and confidence rather than to the tool's severity column.

**Exercise 3 — Find the beacon.** Your instructor will supply a flow-record extract covering one hour of a lab network. Identify every source-destination pair with more than ten connections, compute the interval between successive connections for each, and rank the pairs by how regular they are. Pick the top three and write, for each, one paragraph on whether the regularity is more likely automation you should expect or activity worth investigating — naming the additional source you would check to decide. Note explicitly which of them you *cannot* resolve from flow data alone.

**Exercise 4 — Write a correlation rule in plain language.** Choose one of these scenarios and write it in the WHEN/FROM/WITHIN/AND/THEN form used in this lesson, then list every field the rule depends on and which source supplies it, and finally list three benign situations that would trigger it and how you would exclude each. (a) A user account authenticating from two locations too far apart to be physically possible. (b) A host that has never used a remote-administration protocol suddenly using it against five internal hosts. (c) A large outbound transfer from a host within an hour of that host running a newly-seen executable.

**Exercise 5 — Normalize a mixed log set.** Take four log excerpts from different sources supplied by your instructor, each in its own format and at least one in local rather than UTC time. Produce a single normalized table with the columns: `utc_time`, `source`, `src_host`, `src_ip`, `user`, `action`, `target`, `result`, `raw_ref`. Convert all times to UTC, and add a column noting any record whose time you had to infer or correct. Then answer in writing: which single record changes meaning most once the times are aligned, and what wrong conclusion would a responder have drawn from the unaligned set?

**Exercise 6 — Build a tuning proposal.** Identify a detection rule in your lab environment that fires frequently and is almost always benign. Document it as a tuning proposal: rule name, sample of five recent firings, the common characteristic of the benign ones, the precise proposed change, what the change would *stop* detecting, and how you would verify after the change that the rule still catches the malicious case. The last two items are the ones that make it a proposal rather than a request to turn something off.

## Check your understanding

1. An alert fires because the backup agent read every file on a share at 02:00, exactly as designed. What is the disposition, and why is "false positive" wrong? *Benign true positive — the rule worked and the activity happened; it is authorized. Handle it with an exception or enrichment, not by weakening the rule.*
2. Why is "what is the blast radius?" asked third rather than last? *It sets how much time the alert deserves before you spend an hour on deep analysis of something low-stakes.*
3. Which log source would you ask "what program made this outbound connection?" *Endpoint telemetry — the only source that ties a network connection to the process that made it.*
