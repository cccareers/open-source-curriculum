---
course_id: cse280
media_id: cse280-v01
type: video-script
title: "\"Are You HIPAA Compliant?\" — Answering What's Yours, Routing What Isn't"
format: talking-head
target_runtime: "6 min"
related_lessons:
  - cse280-02
  - cse280-03
objectives:
  - Explain how the shared responsibility model divides compliance obligations between a cloud provider and its customer
  - Distinguish SOC 2, HIPAA, GDPR, and NIST by what each governs and who it applies to
competency_ids:
  - D7-S1-C01
---

## Purpose
After watching, the learner can answer a compliance question from a customer by giving the technical facts that are theirs to give, correcting a false premise, and routing the legal or commercial part to a named role — without ever saying "yes, we're compliant."

## Audience and prerequisites
Apprentices in lessons 02–03. Presenter on camera with simple lower-third graphics; one split-screen of an email being drafted. Uses the patient appointment reminder service.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Email on screen: "We're moving our patient scheduling app to your platform. Are you HIPAA compliant?" | "This email will land in your queue. There's a one-word answer, and it's the most expensive word in cloud compliance: 'yes.'" |
| 0:20 | Presenter. Lower third: "A provider's certification covers the provider's controls." | "Your cloud provider has audit reports covering their data centres, hypervisors, and staff. Real, valuable — and silent about the bucket you left public or the admin account four people share. Those are yours." |
| 0:50 | Graphic: three columns (IaaS, PaaS, SaaS), bottom rows provider; "Identity" and "Data" rows highlighted as Customer in every column with the word CUSTOMER. | "The line moves with the service model. But two rows never move: who can reach the data, and what the data is. No purchase transfers those." |
| 1:25 | Lower third: "HIPAA is a law. There is no HIPAA certification." | "Now the false premise. HIPAA isn't a certificate you hold. It's a US law that applies to covered entities and their business associates. Whether you're a business associate for this customer is a legal determination — not yours, not your manager's." |
| 2:00 | Lower third: "SOC 2 = an auditor's report, not a certificate. GDPR = EU establishment or qualifying activities directed at people in the Union. NIST = publishes frameworks; certifies no one." | "Same shape for the others. SOC 2 is an auditor's report. GDPR covers processing in the context of an EU establishment, regardless of where the people are. Without an EU establishment, it can cover processing related to offering goods or services to people in the Union or monitoring their behaviour there. Ask counsel to determine scope. NIST publishes catalogues and certifies nobody. Get the category right and half the question answers itself." |
| 2:40 | Split screen: drafting the reply. Sentence 1 appears. | "So what do you send? Start with what's genuinely yours: the facts. 'Here's how the platform protects data: TLS enforced in transit with the minimum version our security policy sets — I'll quote the exact version from the current configuration, not from memory — encryption at rest with customer-managed keys for patient data, access by named role groups with MFA, all logged.'" |
| 3:15 | Sentence 2 appears. | "Then the instrument, without promising it: 'Our provider offers a business associate agreement covering a defined list of services. The services in your proposed architecture are these.'" |
| 3:40 | Sentence 3 appears, with a CC line showing "Compliance Officer". | "Then the route, with a name and a time: 'Whether we'll sign an agreement with you, and on what terms, is a decision for our compliance team. I've copied Dana, who'll reply by Thursday, and I'll stay on the thread for anything technical.'" |
| 4:15 | Presenter. Lower third: "Give the fact. Decline the determination. Name the route." | "Three moves. Give the fact. Decline the determination, with the reason. Name the route and the date. Notice what you never wrote: 'we are compliant.'" |
| 4:45 | Graphic: four questions with "mine / route" tags — "Where is my data stored?" (mine, then route the 'is it lawful' part), "Is my data encrypted?" (mine, with specifics), "Can you send your SOC 2 report?" (route, under NDA via compliance), "Are we covered for GDPR if we sign?" (route to privacy/counsel). | "Quick round. Where's my data stored? Yours — every region, every copy, including backups and the SMS provider. Is it lawful? Counsel. Encrypted? Yours — with specifics, never just 'yes.' Your SOC 2 report? Compliance team, under NDA. Covered for GDPR if we sign? Counsel and privacy." |
| 5:30 | Presenter. | "Routing isn't dodging. A good handoff note means the compliance officer can answer in five minutes. A bad one — 'customer asking about HIPAA, please advise' — means nobody can." |
| 5:50 | End card: "Lesson 02, Exercise 3: route four inbound questions." | "Now route four of your own." |

Scope reference: [GDPR Article 3, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).

## On-screen assets and B-roll
- Email mock-up; the reply builds sentence by sentence.
- Responsibility table graphic reused from lesson 02's `compliance-responsibility-split.png` concept.
- Example names (Dana, Thursday) are fictional placeholders.

## Accessibility
- Captions; all on-screen text is spoken.
- Table highlight uses the word CUSTOMER and bold borders, not colour alone.
- Provide the final reply email as text.

## Check for understanding
1. Why is "Our provider is SOC 2 certified, so our infrastructure is covered" wrong twice? *Answer: SOC 2 yields a report, not a certificate; and the provider's report covers the provider's controls, not your configuration.*
2. Which part of "Does patient data ever leave the country?" is yours? *Answer: The factual enumeration of every region and copy; legality goes to counsel.*
3. Name the three moves of a routed answer. *Answer: Give the fact, decline the determination with the reason, name the route and a date.*
