---
lesson_id: cyb100-02
course_id: cyb100
pathway: cybersecurity-support-technician
title: Security Principles and Terminology
order: 2
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Explain confidentiality, integrity, and availability, and use them to describe what a security control is protecting
---

## Why the vocabulary comes first

A help desk ticket reads: *"The finance share is insecure."* That sentence contains no information. Insecure how? Can the wrong people read it, or can the wrong people change it, or does it keep going offline at month end? Those are three different problems with three different fixes, three different costs, and three different levels of urgency, and until someone separates them nobody can act.

Security has a small vocabulary that does that separating for you. Learn it properly once, and for the rest of your career you will be able to take a vague complaint and turn it into a statement someone can act on. Skip it, and you will spend years describing security work by the names of products, which is how people end up buying a tool that does not address the problem they had.

This lesson gives you two things. First, the properties that security exists to preserve. Second, a way to look at any security measure — a password rule, a locked door, a nightly backup, a log review — and say precisely what it is protecting, how it works, and where it stops working. That second skill is the point. Everything later in this pathway is a variation on it.

## The CIA triad

Three properties. Every security measure ever built protects at least one of them, and most protect exactly one well and the others incidentally.

### Confidentiality

**Confidentiality means information is available only to those authorized to have it.**

The word doing the work is *authorized*. Confidentiality is not secrecy — plenty of confidential information is known to hundreds of people. It is the property that the set of people who can see the information matches the set of people who are supposed to see it.

Confidentiality fails in two directions, and both count as failures:

- **Disclosure** — someone who should not see the data sees it. A misdirected email, a database dumped by an attacker, a laptop left in a taxi, a screen visible from a hallway, a spreadsheet emailed to the whole company instead of the payroll team.
- **Over-permission** — nobody has actually looked yet, but they could. A file share where "Everyone" has read access has already failed the confidentiality test, even if no one has opened it. This distinction matters enormously in real assessments: you do not get to wait for harm before calling it a finding.

What protects confidentiality: encryption (in storage and in transit), access control lists and permissions, authentication, physical locks, classification and labeling, screen privacy filters, secure disposal of paper and disks, and non-disclosure agreements. Notice that the list contains technology, physical objects, and paperwork. That is normal.

### Integrity

**Integrity means information and systems are accurate, complete, and changed only in authorized ways.**

Integrity is the property people underrate, because its failures are quiet. A stolen customer list is dramatic. A customer list where forty phone numbers were silently corrupted six months ago is worse in most practical senses, and nobody notices until the recall notices bounce.

Integrity covers more than malicious tampering. A transaction that was written twice, a file truncated by a full disk, a database restored from the wrong night's backup, and a configuration change made by an administrator who was not supposed to make it are all integrity failures. Some involve an attacker; some involve a tired person at 4:45 on a Friday. The property is the same either way, and this is why "who did it on purpose" is a separate question from "what property broke."

Integrity has a companion idea worth naming now: **non-repudiation**, the property that someone cannot credibly deny having done something. It is what audit logs and digital signatures buy you. If the finance system records that a payment was approved but not *who* approved it, the system has integrity of the record and no non-repudiation about the action, and in a dispute that gap is the whole problem.

What protects integrity: hashing and checksums, digital signatures, version control, change management processes, write permissions kept narrow, database constraints and transactions, input validation, audit logging, and backups you have actually tested restoring.

### Availability

**Availability means information and systems are usable when authorized people need them.**

Availability is the property that everyone in the organization understands without being taught, because when it fails they cannot work. It is also the property that security controls most often damage, which is why it belongs in the triad rather than being treated as an operations concern.

Availability fails from attack — a flood of traffic, ransomware encrypting the file server — and it fails from ordinary causes far more often: a power cut, a failed disk, an expired certificate, a full log partition, a botched update, a single person who is on holiday and holds the only credential. All of those are availability failures and all of them belong in a security review.

The measure of availability is not "up or down." It is stated as a target with a time window, and two more numbers matter for planning: how long a service may be down before the harm is unacceptable, and how much recent data the business can afford to lose if it must restore from a backup. You will meet those two as formal terms later in the pathway. For now, the habit to build is asking "for how long, and losing how much?" whenever anyone says a system must be available.

What protects availability: redundancy, backups and tested restores, capacity planning, patching, uninterruptible power, monitoring and alerting, documented recovery procedures, and vendor support contracts.

### The triad pulls against itself

This is the part that separates people who can recite the triad from people who can use it.

The three properties are in tension, and strengthening one usually costs you something on another:

| Change | Helps | Hurts |
| --- | --- | --- |
| Encrypt every laptop disk | Confidentiality | Availability — lose the key, lose the data |
| Require a second approver for every change | Integrity | Availability — nothing moves when one approver is out |
| Lock accounts after three failed logins | Confidentiality | Availability — a trivial way to lock out a whole team |
| Keep an open, editable shared drive | Availability | Confidentiality and integrity |
| Retain every log forever | Integrity, investigation | Confidentiality — a bigger pile of data to leak — and cost |

There is no configuration that maximizes all three. Security decisions are trades, and the useful question is never "is this secure?" but "which property are we buying, which are we spending, and is the exchange rate acceptable to whoever owns this system?" Say that out loud in a meeting and you will sound like someone who has done this before.

## Assets: the triad is always about something

"Confidentiality" on its own is an abstraction. It becomes concrete when attached to an **asset** — anything with value to the organization that is worth protecting.

Assets fall into a few groups, and beginners typically list only the first:

- **Data** — customer records, payroll, source code, contracts, credentials, backups.
- **Hardware** — servers, laptops, phones, switches, badge readers, the physical backup drives.
- **Software and services** — the accounting package, the cloud email tenant, the ticketing system, an API a partner depends on.
- **People and knowledge** — the one person who knows how the shipping integration works.
- **Reputation and relationships** — harder to inventory, first thing lost in a public breach.

For each asset, the three properties matter to different degrees, and stating that ranking is real analytical work. A public marketing website: availability high, integrity high (defacement is an integrity failure and a reputational event), confidentiality nearly irrelevant — it is published on purpose. An archive of signed employment contracts: confidentiality high, integrity high, availability low, because nobody needs it within the hour. A live payment terminal: all three high, which is why payment systems cost what they do.

Write that ranking down before you evaluate a single control. A control that strengthens the property the asset does not need is not a good control; it is an expense.

## What a security control actually is

A **security control** is a safeguard put in place to preserve one or more of those properties for one or more assets. That is the entire definition. It is deliberately broad: a firewall is a control, so is a policy document, so is a locked cabinet, so is the quarterly review meeting where someone checks who still has admin rights.

Controls are described along two independent axes. Both come up constantly, and mixing them up is the most common vocabulary error at this level.

### Axis one: category — what kind of thing is it?

- **Administrative** (sometimes *managerial*) — people and process. Policies, standards, procedures, hiring checks, security awareness training, an onboarding checklist, a documented approval workflow.
- **Technical** (sometimes *logical*) — implemented in hardware or software. Permissions, encryption, multi-factor authentication, antivirus, logging, automatic screen lock.
- **Physical** — things in the world. Locks, doors, badge readers, cameras, cable locks, a shredder, a server room with a cooling unit.

A mature environment has all three. If a security review produces a list of only technical controls, the review is incomplete, not the environment.

### Axis two: function — what does it do about an event?

- **Preventive** — stops the event happening. A door lock, a permission denial, mandatory MFA, input validation.
- **Detective** — tells you the event happened, or is happening. Audit logs, alerting, a camera recording, a file integrity monitor, the monthly access review.
- **Corrective** — restores things after the event. Restoring from backup, removing malware, revoking a compromised credential, a documented recovery runbook.
- **Deterrent** — discourages someone from trying. A visible camera, a warning banner at login, a policy with stated consequences. Deterrent controls act on a person's decision, not on the event.
- **Compensating** — an alternative used when the intended control is not feasible. The line-of-business application cannot support MFA, so it is reachable only from inside the office and every login is reviewed weekly. Compensating controls are legitimate and they are also where organizations quietly accumulate weakness, because the compensation is rarely as strong as the thing it replaced and is almost never revisited.

The two axes combine freely: a camera is a physical control that is both deterrent and detective. Multi-factor authentication is a technical preventive control. A security awareness program is an administrative preventive control. Being able to say both words about a control is a small skill that makes you noticeably more precise than the person who only says "we have cameras."

## Reading a control: the three-question method

Here is the routine to apply to any control you meet. It is the core skill of this lesson and the thing the practice exercise assesses.

1. **What property, on what asset?** Name the asset and name which of confidentiality, integrity, or availability this control preserves for it. If you cannot, either you do not understand the control or the control has no clear purpose — both are findings.
2. **Category and function?** Administrative, technical, or physical; preventive, detective, corrective, deterrent, or compensating.
3. **What is the failure mode?** Under what realistic circumstances does this control not do its job? Every control has an answer. A control whose failure mode nobody can state has not been thought about.

Question three is where the value is. Anyone can list controls. Reading the gap between what a control is assumed to do and what it actually does is the beginning of evaluating whether a control is adequate — and that is the competency this lesson is tagged to.

### Worked examples

**Nightly backup of the file server.** Property: availability of the file data, plus integrity in the sense that a known-good version exists to return to. Category and function: technical, corrective. Failure mode: the restore has never been tested, so nobody knows the backup is readable; or the backup is on a drive permanently connected to the same server, so anything that encrypts the server encrypts the backup; or it runs at 1 a.m. and the accounting system writes at 2 a.m., so the copy is always a day stale in the way that matters. Notice that the backup can be running perfectly every night and still be worthless.

**Full-disk encryption on laptops.** Property: confidentiality of everything on the laptop, and only when the laptop is powered off or locked. Category and function: technical, preventive. Failure mode: the machine is stolen while running and unlocked, in which case encryption contributes nothing; or the recovery keys are stored in a document on the same encrypted machines, which converts a confidentiality control into an availability risk.

**Multi-factor authentication on email.** Property: confidentiality of mailbox contents, and integrity of anything the account can change — remember that a compromised mailbox is also a tool for sending convincing instructions in the owner's name. Category and function: technical, preventive. Failure mode: the second factor is a code sent by text and the attacker persuades the phone carrier to move the number; or the user approves push prompts reflexively; or a legacy protocol on the same mailbox bypasses the requirement entirely.

**The visitor sign-in book at reception.** Property: mostly integrity of the record of who was in the building, supporting an investigation later; weakly confidentiality, by making an unescorted stranger conspicuous. Category and function: administrative and physical, detective and deterrent. Failure mode: nobody checks identification, the book records whatever the visitor writes, and the pages are never read unless something has already gone wrong.

**Quarterly access review.** Property: confidentiality and integrity, by removing permissions that outlived their reason. Category and function: administrative, detective. Failure mode: managers approve the list without reading it, which is the normal outcome when the list is 400 rows in a spreadsheet. A detective control that nobody reads is not a control; it is a task.

**RAID on the server's disks.** Property: availability, against a single disk failing. Category and function: technical, preventive. Failure mode: people believe it is a backup. It is not — RAID faithfully mirrors deletion, corruption, and ransomware to every disk instantly. This is the single most common control misunderstanding in small organizations and you will meet it in the field.

## The principles that decide how controls are arranged

The triad tells you what to protect. A handful of design principles tell you how to arrange the protection. Four are worth carrying out of this lesson.

**Least privilege.** Every account, process, and person gets the minimum access needed to do the job, and no more, for no longer than needed. The test is not "does this person need access to work here" but "does this person need *this* access to do *this* task." Least privilege is why a temporary contractor should have an expiry date on their account, and why administrators should have a separate day-to-day account for reading email. Its enemy is accumulation: people change roles and permissions are added but never subtracted, so after four years the office manager can read everything. That accumulation has a name — **privilege creep** — and finding it is one of the easiest wins in any review.

**Defense in depth.** Assume any single control will fail, and arrange controls in layers so that a failure is survived rather than fatal. Email filtering catches most phishing; awareness training catches some of what gets through; MFA blunts the credential that gets typed anyway; monitoring notices the unusual login; backups survive what all of it misses. The layers should also be *different in kind* — five controls that all fail to the same weak password are one control drawn five times.

**Separation of duties.** No single person should control every step of a sensitive process. The person who creates a supplier should not also be the person who approves payments to it. The point is not distrust; it is that a single-person process has no error correction and no evidence trail. Where the organization is too small to separate duties — a common, honest situation — the compensating control is usually detective: someone independent reviews after the fact.

**Secure defaults and fail-safe.** Start closed and open deliberately, rather than starting open and closing when someone complains. And decide in advance what a control does when it breaks. If the badge reader loses power, do the doors unlock so people can escape, or stay locked so nobody can enter? That is a genuine argument between availability and confidentiality, safety usually wins, and the important part is that someone decided rather than discovering the answer during a fire.

## Where this stops

Two boundaries, so you know what you are not yet expected to do. You are learning to say what property a control protects and where it plausibly fails. Testing a control rigorously enough to sign an audit finding — sampling evidence, tracing it to a requirement, judging it against a formal framework — is a later course. And describing controls that live in the network, such as segmentation and firewall rules, is deliberately left to the networking course; here it is enough to know that "restrict who can reach it at all" is a preventive technical control like any other.

## Practice

Work all three parts and produce one document. Part 2 is the graded core.

**Part 1 — Sort the property.** For each statement, name which of confidentiality, integrity, or availability has failed. Two of them break more than one; say which and why in a sentence.

1. A departing employee copies the client list to a personal drive on their last day.
2. A script that syncs inventory runs twice and every stock figure is doubled.
3. Ransomware encrypts the shared drive and the operations team cannot open any file.
4. A junior technician is given administrator rights "temporarily" in March and still has them in November.
5. An invoice PDF is altered in transit and the payment goes to a different bank account.
6. The only person who knows the certificate renewal process leaves, and the certificate expires six weeks later.

**Part 2 — Read six controls.** Below are six controls found at Harlow & Finch, a 30-person accounting firm you will meet again in lesson 03. For each, produce a four-line entry: the asset and the property protected; the category; the function; and the most realistic failure mode you can state, in one specific sentence. Generic answers like "someone might misconfigure it" score nothing — name the circumstance.

1. All staff must change their password every 60 days.
2. The server room door has a keypad; the code is written inside the supply cupboard.
3. Antivirus is installed on every workstation and reports to a console nobody has logged into since installation.
4. Client files are stored on a shared drive where every employee has read and write access, because "we all work on everything."
5. Wire transfers over £10,000 require a second partner's verbal confirmation by phone to a number in the client file.
6. The office backs up to a cloud service nightly and has never performed a restore.

Then answer, in one paragraph: **which two of these six are the weakest, and what would you change first?** Justify the ranking using the properties, not your instincts. A reviewer should be able to disagree with your ranking and find your reasoning stated.

**Part 3 — Rank an asset set.** For each of the five assets below, rank confidentiality, integrity, and availability as high, medium, or low for that asset, with one sentence of justification each. Then name one control you would expect to find protecting the highest-ranked property, and say what would make you doubt that control was working.

1. The firm's public website.
2. The client tax-return archive for the past seven years.
3. The email system.
4. The physical office door.
5. The spreadsheet the office manager uses to track holiday.

**Deliverable:** one document containing the six-item sort, the six control readings plus the ranking paragraph, and the asset table. Bring it to the next session — lesson 03 works on the same firm.

## Check your understanding

1. A file share grants "Everyone" read access, but the logs show nobody outside the finance team has opened it. Has confidentiality failed? *Yes — over-permission is already a failure; you do not wait for disclosure before calling it a finding.*
2. Name the category and function of a login warning banner. *Administrative in intent (it states policy and consequences), delivered technically; its function is deterrent — it acts on a person's decision, not on the event.*
3. A colleague says, "We're fine, the server has RAID." Which property does RAID protect, and what is the failure mode? *Availability against a single disk failing; it mirrors deletion, corruption, and ransomware to every disk instantly, so it is not a backup.*
