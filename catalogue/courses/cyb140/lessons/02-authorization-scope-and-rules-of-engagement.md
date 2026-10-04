---
lesson_id: cyb140-02
course_id: cyb140
pathway: cybersecurity-support-technician
title: Authorization, Scope, and Rules of Engagement
order: 2
kind: lesson
competency_ids:
  - D3-S1-C04
objectives:
  - Read and write the authorization and scope documents that make a security test lawful and bounded
---

## The only thing that separates a test from a crime

There is no technical difference between an authorized port scan and an unauthorized one. The packets are identical. The tool is identical. The output is identical. The entire difference is a document.

That sentence is worth sitting with, because it is unlike anything else you have learned in this pathway. When you hardened an endpoint in cyb210 or triaged an alert in cyb120, the legitimacy of what you were doing was obvious from the act itself. Nobody has ever been prosecuted for reading their own logs. In this course the act is not self-justifying. Connecting to a service you were not invited to connect to, enumerating what software it runs, and testing whether a known weakness is present is — in the absence of authorization — unauthorized access to a computer system, and in most jurisdictions that is a criminal offense rather than a civil one.

In the United States the governing statute is the Computer Fraud and Abuse Act, which turns on "access without authorization" or "exceeding authorized access." Notice what is absent from that phrasing: intent to profit, actual damage, or even successful access. The United Kingdom's Computer Misuse Act, Canada's Criminal Code provisions on unauthorized use of a computer, the EU directive on attacks against information systems, and most state-level equivalents are drafted the same way. Good intentions are not a defense. "I was going to tell them" is not a defense. "Nothing broke" is not a defense. In several well-documented cases, people who found and reported a genuine flaw were prosecuted anyway, because the finding was obtained by an act nobody had authorized.

This is why authorization comes first in this course, before a single technique, and why it gets more hours than any offensive topic. Your catalog competency is to *assist* in penetration testing and vulnerability assessments *under supervision*. The supervisor owns the engagement. But "my supervisor told me to" has limits as a defense, and it evaporates entirely the moment you touch something outside the scope you were handed. Your personal accountability is small, specific, and absolute: know what you are permitted to touch, know when you were permitted to touch it, and stop.

Everything you do in this course happens inside an instructor-provided lab. That lab is an isolated network segment containing deliberately vulnerable target systems that the training provider owns, running on infrastructure the training provider controls, covered by a written lab authorization you will be asked to acknowledge before you get credentials. That authorization is not a formality bolted on for realism. It is the same instrument, in miniature, that a real engagement runs on, and you are going to learn to read one by reading yours.

## Who can actually authorize a test

The most common authorization failure in the field is not a missing document. It is a document signed by someone who did not have the authority to sign it.

Authorization has to come from the party with the legal right to permit access to the system. Work out who that is by asking three questions in order.

**Who owns the asset?** Not who administers it, not who uses it, not who asked for the test — who owns it. An IT manager who runs a system on behalf of the business is usually not the owner. A department head who commissioned an application is usually not the owner either. In practice, authorization for a real engagement is signed by an officer of the organization or by someone holding a written delegation of authority from one, and the person signing must be able to state that they are authorized to bind the organization. If the person handing you a scope cannot answer "and who signed off on this?", you do not have authorization; you have an assignment.

**Who else's property does the test touch?** This is the question people forget. A modern system is rarely owned by one party. If the target application runs on a cloud provider's infrastructure, that provider has its own acceptable-use terms governing security testing on their platform — most now permit customer-initiated testing of the customer's own resources within stated limits, and all of them prohibit testing that affects the shared platform or other tenants. If the target uses a hosted content delivery network, an authentication provider, a payment processor, or a managed database, each of those is a separate party whose systems you have not been authorized to test. The domain name resolving to an address does not tell you who owns that address. Before an engagement begins, somebody verifies ownership of every address in scope, and that verification is part of the record.

**Whose data is in it?** A multi-tenant system holds other customers' data. A shared hosting environment holds other businesses' sites. A test that would expose or affect a third party's data is not authorized by the party you have a contract with, because that party cannot give away rights it does not hold.

An assistant is not the person who resolves these questions, but an assistant is very often the person who *notices* them, because the assistant is the one reading the target list line by line. Noticing is your job.

## The document set

Real engagements produce a stack of paper. You will not draft most of it, but you need to be able to read all of it and to say which document answers which question.

**The master services agreement (MSA) or contract.** The commercial relationship between the testing firm and the client: liability, insurance, indemnification, payment, confidentiality, term. It usually contains the clause that limits the tester's liability if something breaks, and the clause that obliges the tester to protect whatever they find. It rarely says anything technical.

**The statement of work (SOW).** What is being bought: the type of assessment, the number of targets, the timeframe, the deliverables, the price. The SOW is where "external network penetration test of 42 hosts, one web application, report and retest within 30 days" lives.

**The scope document or target list.** The enumerated, unambiguous list of what may be tested. This is the document you will spend the most time in.

**The rules of engagement (ROE).** How the test is conducted: windows, permitted and prohibited techniques, contacts, escalation, stop conditions, evidence handling. Some firms fold this into the SOW; keeping it separate is better practice because it changes more often.

**The authorization letter**, sometimes informally called the "get out of jail letter." A short signed statement naming the testing organization, the named testers, the systems authorized, the dates authorized, and the signatory's authority to grant it, with contact details for verification at any hour. Testers on site carry a copy. It exists so that when a security guard or a night-shift network engineer finds you doing something alarming, there is a piece of paper and a phone number that resolves it in two minutes rather than with law enforcement.

**The non-disclosure agreement (NDA).** What you may say about the client, the findings, and the engagement, to whom, and for how long. Findings from a penetration test are among the most sensitive documents an organization possesses — they are a list of exactly how to break in. Treat every artifact you generate as covered.

**Third-party notification and consent.** Where the test touches a hosting provider, a cloud platform, or a managed service, whatever notice or permission that provider requires, obtained in advance and filed with the rest.

A useful habit: for any engagement, be able to point at the document that answers each of these five questions — *Who said yes? What may I touch? When may I touch it? What may I not do? Who do I call when something goes wrong?* If any of the five has no document behind it, the engagement is not ready, and saying so is an entirely appropriate thing for an assistant to do.

## Anatomy of a scope

A scope document is a boundary drawn in a medium that has no natural boundaries. Written badly, it produces an argument after the fact; written well, it produces an unambiguous yes or no for every packet you send.

A workable scope has these parts.

**In-scope targets, enumerated exactly.** IP addresses and CIDR ranges, fully qualified domain names, application URLs including the base path, cloud account or subscription identifiers, mobile application package names, API endpoints. Not "the production environment." Not "the marketing website and related systems." The word *related* has no defensible meaning and should be struck wherever it appears.

**Explicit exclusions.** Addresses inside an in-scope range that must not be touched, hostnames that resolve into scope but belong elsewhere, systems too fragile to test, and anything owned by a third party. Exclusions must be as specific as inclusions. "Exclude legacy systems" is not an exclusion; a list of six addresses is.

**The perspective.** From where is the test conducted? Unauthenticated from the public internet, authenticated as a low-privilege user, from inside the corporate network as a plugged-in device, from inside a specific VLAN. The same target tested from two perspectives is two different engagements with two different result sets.

**Credentials and accounts provided.** Which accounts the testers get, at what privilege level, whether accounts may be created, and whether multi-factor enrollment is provided. A credentialed test finds far more than an uncredentialed one; a scope that promises credentialed coverage and provides no credentials will silently under-deliver.

**Depth of testing permitted.** Where on the ladder does the engagement stop? Enumerate and report only? Validate that a weakness is present without exploiting it? Exploit to prove impact, but take no further action? Exploit and pivot to demonstrate a full attack path? Each rung is a different authorization, and the difference between rungs two and three is the difference between "the service is running a version with a known flaw" and "we have a shell on your file server."

**Data handling.** What happens to data you encounter: whether it may be viewed, whether any of it may be copied into evidence, how it is stored, how it is encrypted, when it is destroyed, and what the tester does on discovering regulated data such as health records, payment card data, or personal information about identifiable people. The default professional position is: prove access, do not harvest. Retrieving one record to demonstrate exposure is evidence. Downloading the table is a second incident.

**Testing window.** Dates and times, with a time zone, and whether testing is permitted outside business hours, at weekends, or during a change freeze. A test conducted outside its window is unauthorized even if the target was in scope.

**Named testers.** Who is authorized. If your name is not on it, you are not authorized, whatever your supervisor said verbally.

**Source addresses.** The addresses the testing traffic will come from, so the client's defenders can distinguish the test from a real attack in their logs. This is also how you prove after the fact that a given event was or was not yours.

### A scope with defects

Read this fragment as it might arrive in a real inbox.

```text
SCOPE OF TESTING - ACME LOGISTICS EXTERNAL ASSESSMENT
In scope:  203.0.113.0/24, all acme-logistics.example subdomains,
           the customer portal, and related infrastructure.
Excluded:  production systems.
Window:    two weeks starting in October.
Notes:     please avoid causing any disruption.
```

Every line is a problem. `203.0.113.0/24` is 256 addresses, and nothing here says the client owns all 256 — the last time this went wrong publicly, a tester's range included an address that had been reassigned to an unrelated company. "All subdomains" is unbounded, changes daily, and routinely includes third-party services such as a hosted status page or a marketing automation platform that the client does not own. "The customer portal" has no URL. "Related infrastructure" authorizes nothing and everything. Excluding "production systems" while including the external range is self-contradictory, since the external range *is* production. "Two weeks starting in October" has no dates, no times, no time zone. "Please avoid causing any disruption" is a wish, not a rule; a rule names prohibited techniques.

Rewritten, the same intent becomes testable:

```text
SCOPE OF TESTING - ACME LOGISTICS EXTERNAL ASSESSMENT
In scope (verified owned by client, see ownership register v3):
  203.0.113.10-203.0.113.48   (39 addresses)
  portal.acme-logistics.example  (HTTPS 443, paths under /app)
  api.acme-logistics.example     (HTTPS 443, paths under /v2)
Excluded:
  203.0.113.22, 203.0.113.23    (legacy WMS, vendor-managed, no test)
  status.acme-logistics.example (third party, CNAME to statuspage vendor)
  *.mail.acme-logistics.example (third-party mail provider)
Perspective:  unauthenticated internet, plus authenticated as roles
              "driver" and "dispatcher" (credentials issued separately)
Depth:        validate and demonstrate; no lateral movement, no
              persistence, no modification or deletion of client data
Window:       2025-10-06 09:00 to 2025-10-17 17:00 America/New_York;
              no testing 2025-10-13 (change freeze)
Testers:      named in Appendix A
Source IPs:   198.51.100.14, 198.51.100.15
```

You can answer "may I send this packet?" from the second version. You cannot from the first. That is the whole test of a scope document.

## Rules of engagement

If the scope says *what*, the rules of engagement say *how*, and the ROE is where an assistant's day-to-day conduct is actually governed.

**Contacts and availability.** A primary technical contact, a business contact who can make a decision, and an emergency contact reachable during every hour of the testing window. Phone numbers, not just email. If the only contact is on a plane and something you did took a system down, the ROE has failed.

**Announced or unannounced.** Does the client's security operations team know the test is happening? In an announced test they do, and part of the value is watching their response. In an unannounced test they do not, and the test measures detection — but somebody senior does know, and there is a deconfliction procedure so that when the SOC opens an incident, one phone call establishes whether the traffic is the test.

**Deconfliction.** The procedure for answering "is this you?" in minutes. It depends on the tester's source addresses being recorded, on the tester keeping a timestamped activity log, and on both parties agreeing a code word or reference in advance. Deconfliction is the single most useful thing an assistant can be good at, because the assistant is usually the one holding the log.

**Permitted and prohibited techniques.** Written as a list, not as a sentiment. Typical prohibitions on a standard commercial engagement: no denial-of-service or resource-exhaustion testing; no social engineering of staff or customers; no physical intrusion; no testing of third-party providers; no modification or deletion of data; no installation of persistence; no interference with security monitoring; no testing outside the window. Note that the first three are prohibited on most engagements precisely because they require separate, explicit, differently-scoped authorization — and note that social engineering, physical testing, and wireless testing are out of scope for this course entirely.

**Handling of discovered credentials.** If a credential is found, may it be used? Against which systems? Password cracking is often restricted or prohibited outright, and where it is permitted it is done on the tester's own equipment against extracted material, with the material destroyed at the end of the engagement. In this course, credential attacks are not taught and not performed.

**Evidence and reporting standards.** What constitutes evidence for a finding, how screenshots are redacted, where artifacts are stored, and how the final report is transmitted. Encrypted delivery is normal. Emailing a penetration test report as an unencrypted attachment is a professional failure with a long tail.

**Retention and destruction.** How long the tester keeps engagement data, and the certificate of destruction that follows.

**Stop conditions.** Large enough to deserve their own section.

## Stop conditions, and what you actually do

A stop condition is a pre-agreed circumstance in which testing halts immediately and the tester picks up the phone. They exist because some discoveries change the nature of the engagement, and continuing to test through them makes things worse.

**Evidence of a prior or active compromise.** You find an unfamiliar service listening, a scheduled task nobody recognizes, or an artifact consistent with a real intrusion. Stop. This is now an incident, and incident response — which you studied in cyb120 — is a different process with different rules about evidence preservation. Continuing to test destroys the timeline, contaminates the artifacts, and may tip off an intruder who is watching. You stop testing that host, you touch nothing further, you notify your supervisor immediately, and the client's incident process takes over.

**A system becomes unstable.** A service stops responding, a queue backs up, error rates climb. Stop, note the exact time and the exact last action, and notify. Do not attempt to "fix" it — you are not authorized to change the system, and an undocumented remediation attempt makes the subsequent root-cause analysis impossible.

**Discovery of sensitive data.** Regulated personal data, health records, payment card data, credentials for a third party, or material suggesting criminal activity. Stop accessing it, record the minimum needed to establish that it is exposed, and escalate. Under no circumstances copy it out beyond what the ROE permits.

**Discovery that a target is out of scope.** An address responds that is not on the list, or an in-scope hostname resolves to infrastructure owned by someone else. Stop testing it, record it, and escalate for a written scope decision. This happens constantly and it is not a failure — the failure is continuing.

**A finding of critical severity.** Most ROEs require immediate notification of a critical issue rather than waiting for the report, because the client may need to act the same day.

**The client says stop.** No discussion, no "just finishing this scan." Stop.

For each of these, the assistant's procedure is identical and worth memorizing: **halt the activity, record the time and the last action taken, preserve what you have, notify the supervisor, and wait for a written instruction before resuming.** Waiting is the part people find hard. Do it anyway.

## Scope creep, and why it happens to careful people

Scope drift is rarely a decision. It is an accumulation of small technical facts that quietly move you across a line you cannot see.

A hostname in scope resolves to an address that is not. A web application in scope issues a redirect to a domain that is not. A load balancer in scope forwards to back-end hosts nobody listed. A wildcard DNS record makes every possible subdomain resolve, so an automated enumeration tool "discovers" thousands of hosts that do not exist and a few that belong to other people. A CIDR range in the scope document contains addresses the client stopped paying for last quarter. An application in scope calls a third-party API, and your test traffic reaches the third party. A shared hosting environment answers on the same address for forty other businesses. A scanning tool follows a link off-site because nobody set its boundary.

The defenses are all boring and all effective. Verify ownership of every address before the window opens rather than during it. Prefer enumerated addresses to CIDR ranges. Configure every tool's exclusion list *before* the first run and check that the tool actually honors it. Resolve every in-scope hostname yourself and compare the answers against the address list. Watch what your tools do rather than trusting their defaults. And when something unexpected answers, treat it as out of scope until a document says otherwise.

Your standing is fixed here and you should be comfortable stating it plainly: **an assistant never extends scope.** Not by a single host, not "just to confirm," not because the client's engineer said it was fine in a corridor. Scope changes are written, signed by whoever signed the original, and filed. A verbal expansion is not an expansion.

## The activity log

Everything above is enforced by one artifact: a contemporaneous, timestamped log of what you did.

The log is the record that proves the test stayed in scope, the record that resolves deconfliction, the record that lets somebody reproduce a finding, and the record that protects you personally if an unrelated outage happens to coincide with your test window. Keep it as you go. Reconstructing it afterwards from tool output is both unreliable and visibly unreliable.

A serviceable log line has: timestamp with time zone, operator, source address, target identifier, tool and version, the exact action or command, and the outcome. Anything the ROE flagged for notification gets a separate note recording who was told, when, and by what channel.

```text
2025-10-07 10:14:02 -0400 | j.okafor | 198.51.100.14 | 203.0.113.31
  | nmap 7.94 | service/version scan, TCP 1-1024
  | 4 open ports, output saved as scans/113-31-tcp.xml
2025-10-07 10:41:55 -0400 | j.okafor | 198.51.100.14 | 203.0.113.22
  | -- | responded to earlier ping sweep; host is on EXCLUSION list
  | NO FURTHER ACTION. Escalated to K. Bell 10:44 by phone.
```

The second entry is the one that matters. It records a boundary being reached and honored, and it is the difference between a professional record and a liability.

## Practice

All work in this practice happens on the instructor-provided lab range only. Do not point any tool at any address outside the range you were issued, and do not begin until you have acknowledged the lab authorization.

**Part 1 — Read your own authorization.** Obtain the written lab authorization for this course and answer, in one sentence each, citing the clause you got it from: Who granted the authorization, and what is their stated authority to grant it? Exactly which addresses and hosts are in scope? What is the testing window? Which techniques are prohibited? Who do you contact, and how, if a lab system stops responding? If any of the five questions cannot be answered from the document, say so — that is a real finding about your own paperwork.

**Part 2 — Redline a defective scope.** Take the "SCOPE OF TESTING — ACME LOGISTICS" fragment from this lesson. Produce a marked-up version listing every defect you can find, and for each one write (a) the specific ambiguity, (b) a plausible way it could lead to an unauthorized action, and (c) the replacement wording. Find at least eight defects. Do not simply copy the rewritten version in the lesson — write your own, and justify any place where you chose differently.

**Part 3 — Draft rules of engagement for the lab.** Write a one-to-two page ROE governing your own work in this course, using the section headings from this lesson: contacts, announced status, deconfliction, permitted and prohibited techniques, credential handling, evidence and data handling, retention, and stop conditions. It must contain at least six stop conditions, each written as an observable trigger followed by the exact action you will take. Real names and contact routes for your instructor and cohort, real lab addresses, real dates. You will be held to this document for the rest of the course.

**Part 4 — Stop-condition drill.** For each of the following, write the log entry you would record and the exact notification you would send, in under 80 words each. State the time you would stop, what you would preserve, and what you would not do.

1. A host in your lab range responds on a port with a service banner naming a remote administration tool that is not part of the lab build.
2. A scan you started five minutes ago has left one lab web application returning connection timeouts.
3. An in-scope lab hostname resolves to an address one digit outside your authorized range.
4. A lab file share contains a document that appears to hold real personal information about a named individual rather than lab-generated test data.
5. Your instructor sends a message reading only: "stop everything, now."

**Part 5 — Ownership verification.** You are given the in-scope line `203.0.113.0/24` and told the client owns it. Write the procedure you would follow, step by step, to verify that claim before the window opens — what public registration records you would consult, what you would ask the client to provide in writing, what you would do about addresses in the range that do not respond, and what you would do about an address in the range that responds with a certificate issued to a different organization. Then state, in one sentence, what you would do if the client refused to provide written confirmation.

**Deliverable:** one document containing Parts 1 through 5. It should be possible for a reviewer to hand your Part 3 ROE to another apprentice and have them work the rest of this course from it without asking a question.

## Check your understanding

1. Your supervisor tells you verbally to "add the staging server, it's fine". What do you do? *Nothing until a written scope change, signed by the original signatory, is filed. An assistant never extends scope.*
2. An in-scope hostname resolves to an address outside the listed range. May you test it? *No. Treat it as out of scope, log it, and escalate for a written decision.*
3. List the five things the assistant does at any stop condition. *Halt, record the time and last action, preserve what you have, notify the supervisor, and wait for written instruction.*
