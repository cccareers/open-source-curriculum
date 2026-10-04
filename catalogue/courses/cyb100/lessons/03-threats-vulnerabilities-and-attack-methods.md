---
lesson_id: cyb100-03
course_id: cyb100
pathway: cybersecurity-support-technician
title: Threats, Vulnerabilities, and Attack Methods
order: 3
kind: lesson
competency_ids:
  - D1-S1-C01
objectives:
  - Identify common threats and vulnerabilities in a described network or information system
---

## Four words that are not synonyms

In ordinary conversation "threat," "vulnerability," "exploit," and "attack" are used interchangeably. In this job they are four distinct things, and keeping them apart is what lets you produce a finding somebody can fix.

- A **threat** is a potential cause of harm to an asset. It is a *possibility*, and it exists whether or not you are exposed to it. Ransomware is a threat. A disgruntled employee is a threat. A burst pipe above the server cupboard is a threat.
- A **threat actor** is the person or group behind a deliberate threat. Not all threats have actors — flood and hardware failure do not — but the ones that do behave differently depending on who is behind them.
- A **vulnerability** is a weakness in an asset or its surroundings that a threat could take advantage of. Unpatched software. A password of `Summer2024!`. A door propped open with a fire extinguisher. Vulnerabilities are *yours*, which is the useful part: you cannot remove the threat of ransomware from the world, but you can remove the weaknesses it needs.
- An **exploit** is the specific technique or code that turns a vulnerability into an actual effect, and an **attack** is somebody using it.

The relationship reads in one direction: *a threat actor uses an exploit against a vulnerability to harm an asset*. Break any link and the harm does not happen. That sentence is the whole logic of defensive work, and it is why security reviews spend their time on the vulnerability link — it is the one inside your control.

Two more terms complete the set. An **attack vector** is the route in: an email attachment, a login page reachable from the internet, a USB stick in the car park, a supplier's remote-access account. The **attack surface** is the sum of all vectors — everything about a system that is exposed to something you do not control. "Reduce the attack surface" means remove exposure you were not using, and it is the cheapest security advice that exists.

This lesson is entirely defensive. You are learning to recognize what attackers do so you can find the weaknesses they rely on before they do. No offensive tooling appears here; that comes later in the pathway, under authorization and with rules of engagement.

## Who attacks, and why it changes what you look for

Knowing the category of actor you are realistically facing changes which weaknesses matter. Sort them by three attributes — motivation, resources, and persistence.

**Opportunistic and unskilled attackers.** Individuals using tools and scripts somebody else wrote, scanning the internet indiscriminately for anything answering. Low resources, no interest in you specifically. They find you because you were reachable and unpatched, not because you were chosen. The overwhelming majority of small-organization incidents start here, which is why unglamorous hygiene — patching, no default credentials, nothing needlessly exposed — removes most of your real exposure.

**Organized criminal groups.** Financially motivated, well resourced, professionalized. They run ransomware operations, business email compromise, and payment fraud as businesses, with support staff and negotiators. They target by *sector and size*, not by name: a mid-sized firm with poor backups and money moving through it is a category, and you might be in it.

**Insiders.** Anyone with legitimate access: employees, contractors, cleaners, former staff whose accounts still work. Split them in two, because the defenses differ. **Malicious insiders** act deliberately — taking client lists to a competitor, sabotage before resignation. **Negligent insiders** cause the majority of insider harm without intent — emailing the wrong attachment, reusing a password, sharing a link publicly to make a task easier. Insiders are the hardest category because your perimeter controls are all behind them; least privilege, separation of duties, and logging are what remain.

**Hacktivists.** Ideologically motivated, aiming at publicity or disruption — defacement, data leaks, denial of service. Impact is often reputational rather than financial, and targeting follows what the organization is publicly associated with.

**Nation-state actors.** Very high resources, very high patience, strategic objectives — espionage, positioning inside infrastructure, intellectual property. Most small organizations are not a target, but many are a *route* to one: you may be interesting because you are a supplier to someone interesting.

**Competitors and other opportunists.** Industrial espionage exists, usually through recruitment of insiders rather than technical intrusion.

And the categories that are not people at all — **hardware failure, software defects, natural events, and simple accident.** They belong on the threat list because they harm the same assets in the same three ways. A review that lists only human adversaries will miss the flood risk and the failing disk, and those cause more downtime than anything else on the page.

## Where vulnerabilities actually come from

When you are asked to identify vulnerabilities in a described environment, work this list. It is short enough to memorize and it covers most of what you will find.

**Missing patches and unsupported software.** The single most productive category. Vendors publish fixes for known defects; every day between publication and installation is a window in which the weakness is public knowledge. Worse than a slow patch cycle is software that no longer *receives* patches — an operating system past its end-of-support date, an application whose vendor is out of business. Known defects get catalogued publicly with identifiers so that everyone can talk about the same weakness; you will meet the naming and severity-scoring schemes properly in the tooling lesson.

**Misconfiguration.** Software that is capable of being secure, set up so it is not. Default administrative credentials never changed. Storage left readable to anyone with the link. A service listening to the whole internet when only the office needed it. Debug or verbose modes left on in production. Permissions granted to "Everyone" because it was quicker. Misconfiguration is the category that grows silently, because nothing breaks when it happens.

**Weak authentication.** Short, guessable, or reused passwords. Shared accounts where several people use one login, which destroys non-repudiation as well. No second factor on anything reachable from outside. Service accounts with passwords that have not changed in six years and are pasted in a scheduled task.

**Excessive privilege.** Users who are local administrators on their own machines. Everyone in one group that can read everything. Accounts of people who left, still enabled. Contractor accounts with no expiry. This is the privilege creep from lesson 02, viewed as an attacker sees it: whatever the account can reach, the attacker can reach the moment they have it.

**Unprotected data.** Sensitive data stored or sent without encryption. Backups on a drive in the same room as the server. Test environments loaded with a copy of real customer records and secured like a test environment. Data kept far longer than any business reason justifies — you cannot lose what you deleted on schedule.

**Human factors.** People are not a vulnerability in the insulting sense; they are the part of the system that can be persuaded. Lack of awareness training, no way to report a suspicious email, a culture where questioning an urgent instruction from a senior person is uncomfortable, and processes that create rushed decisions all create exposure.

**Missing detection and response capability.** If logging is off, or logs exist and no one reads them, or there is no plan for what to do at 6 p.m. on a Friday, then every other weakness lasts longer. "We would not know" is a legitimate and serious finding.

**Physical exposure.** Unlocked server cupboards, network sockets in a public waiting area, unattended unlocked screens, printed documents left on the printer, disks thrown in the bin.

**Third parties and the supply chain.** Your suppliers' weaknesses become yours when they hold your data or have access to your systems. A managed IT provider with remote access to every client is a concentrated target for exactly that reason. Software you install inherits its vendor's build security.

**Shadow IT.** Tools adopted by a team without anyone's knowledge — a free file-sharing account, a personal cloud drive, an unsanctioned messaging app carrying client information. You cannot protect, patch, or back up something you do not know exists.

## How attacks are delivered

You need to recognize the common methods well enough to spot the weaknesses they depend on. Depth on malware behavior belongs to the endpoint course; depth on network-level attacks belongs to the networking course. What follows is the map.

**Social engineering** manipulates a person into acting against their own organization's interest. The family is large: **phishing** by mass email, **spear phishing** aimed at a named individual using details about them, **whaling** aimed at executives, **vishing** by phone, **smishing** by text message, **pretexting** where the attacker builds a plausible false story ("IT here, we're testing the VPN"), **baiting** with something desirable like a found USB stick, and **tailgating** where someone follows an employee through a door they did not badge. Business email compromise deserves its own mention: the attacker gets into or convincingly imitates a real mailbox and sends an ordinary-looking instruction to change bank details. There is no malware to detect and the email is genuine or nearly so; the only reliable control is the process one — verify changes to payment details out of band, on a number you already held.

Every social-engineering attack leans on the same levers: **urgency, authority, fear, and helpfulness.** Teaching people to notice the levers works better than teaching them to spot spelling mistakes, because the spelling has improved.

**Credential attacks.** **Brute force** tries many passwords against one account and is noisy. **Password spraying** tries one common password against many accounts, staying under lockout thresholds, and is the version that actually works. **Credential stuffing** replays username and password pairs stolen from some other breached service, and works because people reuse passwords. **Keylogging** and **credential phishing** collect them directly. **Session hijacking** and MFA-fatigue prompting are how attackers work around a second factor rather than through it. The weaknesses these depend on: reuse, no second factor, no lockout or alerting on failures, and no monitoring of successful logins from implausible places.

**Malicious software.** Learn the families by behavior, not by brand. A **virus** attaches to a file and needs a user to run it. A **worm** spreads by itself across a network. A **trojan** is something the user wanted, carrying something they did not. **Ransomware** encrypts data and demands payment, and increasingly also steals the data first so that refusing to pay still hurts. **Spyware** and **infostealers** harvest information quietly, browser-stored passwords above all. A **rootkit** hides the attacker's presence from the system's own reporting. A **botnet** client rents your machine out. **Fileless** techniques abuse tools already present on the machine, which is why "no file was downloaded" is not reassurance.

**Input and application attacks.** Where software accepts input and treats it as instructions rather than data, an attacker can rewrite what the program does — **injection** attacks against databases and command interpreters, **cross-site scripting** which delivers attacker content to another user's browser, and file uploads that are executed rather than stored. The underlying vulnerability is always the same shape: untrusted input crossing into a place where it has power.

**Interception.** Traffic that is not encrypted can be read or altered by anything on its path — a hostile wireless access point, a compromised device on the same network. The vulnerability is the missing encryption, not the attacker's cleverness.

**Denial of service.** Exhausting a resource — bandwidth, connections, CPU, disk — until legitimate users cannot be served. **Distributed** versions use many machines at once. This is a pure availability attack, and it is worth remembering that a badly written internal report query can produce the identical symptom with no attacker at all.

**Physical and removable media.** Devices plugged in, machines stolen, screens photographed, documents taken from a bin. Cheap, effective, and frequently forgotten in reviews written by technical people.

## The phases of an intrusion

Serious intrusions are not a single event. They unfold in stages over days or months, and that is good news: each stage is a chance to notice and interrupt. Learning the sequence defensively means learning where your detection could sit.

![The phases of an intrusion, from reconnaissance through to impact, with the defensive opportunity available at each phase](./img/intrusion-phases-defensive-opportunities.png)

| Phase | What the attacker is doing | Where you can interrupt |
| --- | --- | --- |
| Reconnaissance | Gathering public information: staff names, email format, technologies, suppliers | Limit what is published; be alert to unusual enquiries |
| Initial access | Getting a first foothold — phishing, stolen credentials, an exposed unpatched service | Email filtering, MFA, patching, removing needless exposure |
| Execution and persistence | Running code and arranging to survive a reboot or a password change | Endpoint protection, alerting on new scheduled tasks and new accounts |
| Privilege escalation | Turning a normal account into an administrative one | Least privilege, separate admin accounts, patching |
| Lateral movement | Moving from the first machine to the ones that matter | Segmentation, unique local credentials, monitoring internal logins |
| Collection and exfiltration | Gathering data and sending it out | Data-at-rest controls, alerting on large or unusual outbound transfers |
| Impact | Encryption, destruction, fraud, publication | Tested offline backups, out-of-band payment verification, a rehearsed plan |

Two lessons come out of this table. First, **the earliest phases are the cheapest to defend and the least visible**, which is why organizations under-invest in them. Second, an attacker who is stopped at phase five has still been in your environment for phases one to four, and the incident does not begin at the moment you noticed it — a point that matters enormously when you get to investigation later in the pathway.

## A method for reviewing a described environment

You will repeatedly be handed a description of an organization and asked what is wrong with it. Do it in this order, every time, so you do not just list the things you happen to find interesting.

1. **Inventory the assets.** Data, systems, devices, people, premises, and third parties. You cannot find a weakness in something you have not listed.
2. **Mark what each asset needs.** The confidentiality, integrity, and availability ranking from lesson 02. This is what stops you writing findings about things nobody cares about.
3. **Trace every way in.** For each asset ask: who can reach this, from where, and using what credential? Include the routes nobody mentions — the supplier's remote access, the ex-employee's account, the office wireless, the printer.
4. **Walk the vulnerability categories.** Patching, misconfiguration, authentication, privilege, unprotected data, human factors, detection gaps, physical, third party, shadow IT. Ten questions. Ask them all, even the ones you expect to come up empty.
5. **Name a plausible threat for each weakness.** A vulnerability nobody could realistically use is worth recording and not worth panicking about. Pairing weakness with actor is what makes the finding credible — and it is exactly the input the next lesson turns into a risk rating.
6. **Note what you could not see.** "No information was provided about backups" is a finding, phrased honestly. Never assume a control exists because it would be sensible.

### Worked example

*Harlow & Finch is a 30-person accounting firm in one office. Client tax records live on a Windows file server in a cupboard off the main room; the cupboard door is usually open because the server runs hot. Every employee is in one security group with read and write access to all client folders. Staff log into email from home with a username and password. Two partners approve wire transfers; the second approval is given verbally on the phone. An external IT contractor has a permanent remote-access account. The office wireless password is on a card at reception for visitors, and it is the same network the workstations use. The reception PC still runs an operating system whose vendor support ended two years ago, because the appointment-booking software will not run on anything newer. Backups go to a cloud service nightly. Nobody reviews any logs.*

Working the method:

**Assets.** Client tax records (confidentiality and integrity high, availability medium); the file server; the email system (compromise of a mailbox enables fraud, so integrity of instructions matters as much as confidentiality); the payment approval process; workstations; the reception PC; the physical office; the IT contractor as a third party.

**Findings, paired with a plausible actor.**

1. *Flat permissions on all client folders.* Every employee can read and alter every client's records. One phished employee gives an external criminal the entire client base; a departing employee can copy everything. Confidentiality and integrity.
2. *Email without a second factor, reachable from the internet.* Credential stuffing or spraying by an opportunistic attacker gives mailbox access; mailbox access enables business email compromise against the firm's own clients.
3. *Payment approval by phone.* Better than nothing, and its strength depends entirely on whether the partner dials a number they already held or the one in the request. Unstated in the description — record it as a question, not an assumption.
4. *Unsupported operating system on reception.* Publicly known defects with no fix available, on a machine sitting in the same network as everything else. Any opportunistic malware that reaches it has a permanent foothold.
5. *Guest and workstation traffic on one wireless network, password on a card.* Anyone in the waiting area is inside. This is a segmentation problem; the fix belongs to the networking course, the finding belongs here.
6. *Server cupboard propped open.* Physical access to the server and, incidentally, a heat and hardware-failure risk — an availability threat with no attacker in it at all.
7. *Permanent contractor remote access.* Standing privilege, held by a third party, probably shared among their staff. If the contractor is breached, so is Harlow & Finch.
8. *No log review.* Every finding above lasts longer than it needs to, and after an incident nobody can say what happened.
9. *Backups untested and their location unknown.* Recorded as a gap in information: if the backup is reachable with the same administrator credentials as the server, the ransomware scenario has no recovery path.

Nine findings, each naming a weakness, an asset, a property, and a realistic actor. None of them required a tool. That is the skill.

## Two mistakes to avoid

**Listing scary attacks instead of local weaknesses.** "They could be targeted by a nation-state actor" is not a finding. "The reception PC is unsupported and on the same network as the file server" is. Write about what is true of this environment.

**Assuming the control exists because it would be obvious.** The description above never mentions antivirus. The temptation is to assume a firm like this has it. Do not — write "not stated" and ask. Half of real assessment work is noticing what was left out.

## Practice

**Part 1 — Sort the four words.** For each item, state whether it is a threat, a threat actor, a vulnerability, or an attack vector. Some are arguable; where you think it is, say why in a sentence.

1. Ransomware.
2. A shared administrator password used by four people.
3. An email attachment.
4. A former employee whose account is still active.
5. A flood.
6. Software three major versions behind.
7. A supplier's remote-access account.
8. An organized criminal group specializing in payment fraud.

**Part 2 — Review a described environment.** Apply the six-step method to the following organization and produce a findings table with the columns: *finding*, *asset affected*, *property at risk*, *plausible threat actor*, *vulnerability category*. Aim for at least ten rows, and include at least one non-human threat and at least one physical finding.

*Rowan Veterinary Group runs three clinics and a small out-of-hours service. Patient and owner records, including card payment details taken over the phone, are held in a practice-management system hosted by the software vendor; every vet and nurse logs in with a username and password, and the three practice managers share one administrator login. Each clinic has a Windows PC at reception, a laptop in the consulting room, and a networked printer/scanner. Appointment reminders are sent from a personal cloud email account set up by a receptionist four years ago because the official system was "too slow." X-ray images are stored on a machine in the back office that has not been updated since it was installed, on the vendor's instruction. Staff use their own phones to access a group messaging app where clinical questions and occasionally client names are discussed. Backups are made by copying the X-ray machine's folder to a USB drive that lives in the desk drawer beside it. The out-of-hours service is subcontracted to a partner practice, whose vets are given logins to the main system that are never removed. There is no security training, and no one has been asked to review a log.*

For each row, write the finding as one sentence that a non-technical practice manager could understand.

**Part 3 — Trace an intrusion.** Choose three of your findings from Part 2 and, for each, write a short paragraph describing a realistic sequence of intrusion phases in which that weakness is used — which phase it serves, what the attacker would do immediately before and after, and at which phase Rowan would most plausibly have noticed. This is a defensive reasoning exercise: describe the phases at the level of the table in this lesson, not as instructions.

**Deliverable:** one document with the eight-item sort, the findings table, and the three traces. You will re-use the findings table in lesson 04 — do not throw it away.

## Check your understanding

1. "A shared administrator password used by four people" — threat, threat actor, vulnerability, or attack vector? *Vulnerability: a weakness in your environment (and it destroys non-repudiation).*
2. Why does password spraying succeed where brute force fails? *It tries one common password against many accounts, staying under per-account lockout thresholds.*
3. Rewrite "They could be targeted by a nation-state" as a usable finding about Harlow & Finch. *Example: "The reception PC runs an unsupported operating system on the same network as the client file server, so any opportunistic malware that reaches it has a permanent foothold." A finding describes a local weakness, not a frightening actor.*
