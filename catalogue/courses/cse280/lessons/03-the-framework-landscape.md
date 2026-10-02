---
lesson_id: cse280-03
course_id: cse280
pathway: cloud-support-engineer
title: "The Framework Landscape: SOC 2, HIPAA, GDPR, and NIST"
order: 3
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Distinguish SOC 2, HIPAA, GDPR, and NIST by what each governs and who it
    applies to
---

## Four rulebooks that are not the same kind of thing

People say "SOC 2, HIPAA, GDPR, and NIST" in one breath, as though they were four items on a shopping list. They are not comparable objects, and the first useful thing you can learn about them is what *category* each belongs to:

- **SOC 2** is an **audit and reporting standard**. It is a way of having an independent accounting firm examine your controls and publish an opinion about them. It is not a law. Nobody can require you to have one by statute; customers require it by contract.
- **HIPAA** is a **United States federal law** with implementing regulations, applying to a specific sector — healthcare — and to the organizations that handle health information on its behalf.
- **GDPR** is a **European data protection regulation** with direct legal force, applying based on whose personal data you process and where you offer goods and services, not on where your company is incorporated.
- **NIST** is a **standards body** that publishes **control catalogues and frameworks**. Its publications are voluntary in most contexts and mandatory in some — most notably in United States federal contracting, where a contract clause pulls them in.

That taxonomy alone answers a surprising fraction of real questions. "Do we need SOC 2?" is a sales and contract question. "Does HIPAA apply to us?" is a legal question about what your organization does. "Are we NIST compliant?" is often not a well-formed question at all, because NIST publishes many things and the asker usually means one specific one.

Your job here is not to become a compliance officer. It is to reach the level where you can hear a customer question, identify which rulebook is in play, know roughly what kind of evidence that rulebook wants, and route anything past that to the right person. This lesson is deliberately comparative — what each governs, who it applies to, what evidence it wants — and deliberately not clause by clause.

**A standing caution for this whole lesson.** Regulations and standards change: criteria get revised, guidance gets reissued, enforcement priorities shift, and the specific numbers in them — notification windows, retention periods, thresholds — are exactly the details most likely to be out of date in any summary, including this one. Nothing here is legal advice. When a specific number or deadline matters, the correct move is always "check the current text and confirm with counsel", and you will see that phrase repeatedly below because it is genuinely the answer.

## SOC 2

**Category.** An examination performed by an independent certified public accounting firm, against a set of criteria published by the American Institute of Certified Public Accountants. The output is a **report**, not a certificate. Saying "we are SOC 2 certified" is technically wrong, and compliance people notice; the correct phrasing is "we have a SOC 2 report" or "we completed a SOC 2 Type II examination."

**Who it applies to.** Nobody, by law. It applies to you when a customer's procurement process demands it, which for a business-to-business technology company is most enterprise deals. It is the dominant answer to "prove to me that you run a competent security programme" in North American software sales.

**What it governs.** Controls at a *service organization* — a company that provides services affecting its customers' systems or data — evaluated against the Trust Services Criteria. There are five criteria categories: **security** (always included, often called the common criteria), plus optionally **availability**, **confidentiality**, **processing integrity**, and **privacy**. Which of the optional ones are in scope is a business decision your company makes; an engineer should know which ones are in scope for their own company, because it determines whether, for example, your uptime and disaster recovery evidence is being examined at all.

**Type I versus Type II.** This distinction matters more to you than any other detail about SOC 2.

- A **Type I** report says the controls were *suitably designed* as of a single point in time. It is a snapshot.
- A **Type II** report says the controls *operated effectively over a period* — commonly somewhere between three and twelve months. It is a film.

Type II is what serious customers ask for, and it is what changes your daily life. Under Type II, it is not enough that MFA is enabled today. The auditor will sample dates across the whole period and ask you to show it was enabled then too, that new joiners got it, that leavers lost access within the window your own policy claims. **Continuity of evidence over a period** is the defining demand of SOC 2 Type II, and it is why lesson 10 treats evidence as a distinct artifact with its own rules.

**What evidence it wants.** Configuration exports, access review records with dates and reviewer names, tickets showing changes went through approval, onboarding and offboarding records, vendor review records, incident records, and — importantly — evidence that your own policies were followed. SOC 2 audits substantially against *your own written policy*. If your policy says access reviews happen quarterly and you did three in a year, that is a finding, even though nothing external required quarterly reviews in the first place. Writing a policy you cannot sustain is a self-inflicted wound.

**The provider relationship.** Your cloud provider will have its own SOC 2 (or equivalent) report. You can rely on it for the controls it covers — this is the inheritance from lesson 02 — but your auditor will want to see that you obtained it, reviewed it, and considered the complementary user entity controls it names. "We use a compliant cloud provider" is not a control. "We reviewed the provider's report on this date, noted these customer responsibilities, and here is how we address each" is.

## HIPAA

**Category.** United States federal law, with implementing rules issued by the Department of Health and Human Services. The parts an engineer meets most are the **Privacy Rule** (what may be used and disclosed), the **Security Rule** (safeguards for electronic protected health information), and the **Breach Notification Rule**.

**Who it applies to.** **Covered entities** — health plans, healthcare clearinghouses, and healthcare providers who transmit health information electronically in connection with certain transactions — and **business associates**, meaning organizations that create, receive, maintain, or transmit protected health information on behalf of a covered entity. A cloud company hosting a hospital's application is typically a business associate. A subcontractor of that company can be one too, which is how the obligation flows downhill.

Whether *your* organization is a covered entity or business associate for a given engagement is a legal determination. It is not one an engineer makes, and it can differ per customer.

**What it governs.** Protected health information: individually identifiable health information, in the hands of a covered entity or business associate. Note the two-part test — the data has to be identifiable *and* it has to be in the hands of a regulated party. The same phone number in a hospital's appointment system and in a pizza restaurant's system are treated completely differently, which is a useful thing to have internalized before you argue about whether a field is "sensitive."

**The instrument you will hear about constantly.** The **business associate agreement**. This is the contract that must be in place before protected health information flows to a business associate. Engineers encounter it as a gate: a customer cannot send you regulated data until one is signed, and your provider similarly offers one for its own services covering a defined list of services. The list is the trap — a provider's agreement typically covers only enumerated services, and using a service outside that list for regulated data is a real, common finding. Whether an agreement will be signed, and on what terms, is a legal and commercial decision, not yours.

**What evidence it wants.** The Security Rule is organized into administrative, physical, and technical safeguards, and it is deliberately less prescriptive than a control catalogue — several requirements are framed as things you must address in a way appropriate to your size and risk, with your reasoning documented. Two practical consequences for you:

1. A **documented risk analysis** is central. The regulation expects the organization to have assessed risks to the information and to have made and recorded decisions accordingly. That is why control selection in lesson 04 and finding triage in lesson 07 are taught as reasoning you write down, not as a checklist you tick.
2. Because some safeguards are addressable rather than rigidly specified, "we chose not to implement X and here is the documented, reasoned alternative" can be a legitimate position — and "we didn't do X and never wrote down why" never is.

Technical safeguards map onto things this course covers directly: access control, unique user identification, audit controls, integrity, transmission security, and encryption. Note that encryption's exact framing in the rule is one of those details people get wrong from memory — read the current text rather than repeating a summary, this one included.

**Breach notification.** There is a defined notification regime with obligations to individuals, to the regulator, and in some cases to media, with time limits and thresholds. Do not quote the clock from memory; the timings and the thresholds are precisely the details that get misremembered and misapplied. Your role in a suspected breach is to preserve evidence, report internally immediately, and let counsel and the compliance officer run the notification determination.

## GDPR

**Category.** A European Union regulation on the protection of personal data. It has direct legal force in EU member states; the United Kingdom operates a closely related regime of its own after leaving the EU, and a growing number of jurisdictions have laws built on similar concepts. Treat "GDPR" as shorthand for a family of data protection regimes with shared vocabulary rather than as one isolated law.

**Who it applies to.** Not "EU companies." It reaches organizations established in the EU, and also organizations outside it that offer goods or services to people in the EU or monitor their behaviour. That extraterritorial reach is why a company that has never had an office in Europe can still find itself in scope. Whether it applies to a given business is, again, a legal determination.

**The two roles.** This is the vocabulary you need most.

- A **controller** decides why and how personal data is processed.
- A **processor** processes personal data on the controller's instructions.

Your company hosting a customer's application is usually a processor for that customer's data and a controller for its own employee and prospect data — both at once, for different datasets. The obligations differ by role, and the contract between them — usually called a data processing agreement — is the instrument that sets the terms, including whether and how you may use sub-processors. A cloud provider you use to serve that customer is typically your sub-processor, and customers often have contractual rights to be told about sub-processor changes.

**What it governs.** Personal data, defined broadly — any information relating to an identified or identifiable person. Broader than most engineers expect: an IP address, a device identifier, or a pseudonymous user id can be personal data depending on context. There is a further category of **special category data** — health, biometrics, and others — with additional restrictions. If your instinct is "it's just a user id, it isn't personal data", check rather than assume.

**What is distinctive about it.** Three things shape engineering work:

1. **Data subject rights.** People can request access to their data, correction, deletion, portability, and can object to certain processing. These are not abstractions — they become engineering tickets with deadlines. If your architecture cannot locate every copy of one person's data, including in backups and logs and analytics pipelines, you cannot service the request. Design consequence: know where data lives before somebody asks you to delete it from everywhere.
2. **Principles that constrain design.** Purpose limitation, data minimisation, storage limitation, and accountability. In plain engineering terms: collect only what you need for a stated purpose, don't keep it forever, and be able to show your reasoning. "We log everything forever because storage is cheap" is a defensible engineering position and an indefensible privacy one.
3. **International transfers.** Moving personal data out of the region is governed, and the lawful mechanisms for doing so have changed more than once and are actively litigated. This is one of the areas where an engineer's job is purely factual — say precisely which regions data sits in and which services touch it — and the legality of the arrangement is entirely counsel's.

**What evidence it wants.** Records of processing activities, the data processing agreements themselves, evidence of the technical and organisational measures you claim (encryption, access control, pseudonymisation), records of how data subject requests were handled and how quickly, and breach records. There is a breach notification regime here too, with a short window and its own thresholds — again, check the current text and ask counsel rather than repeating a number.

**Penalties.** You will hear large figures quoted. Do not repeat them as fact in customer-facing writing, and never use them as a scare tactic in a training session. The framework's penalty structure is tiered and discretionary and the headline number is the ceiling, not the expectation.

## NIST

**Category.** The National Institute of Standards and Technology is a United States federal agency that publishes standards and guidance. It does not audit anyone and does not certify anyone. The confusion comes from people saying "NIST" when they mean one particular publication.

The three you are most likely to encounter:

- **The Cybersecurity Framework** — a high-level, voluntary organizing structure built around a small set of functions (identify, protect, detect, respond, recover, and in its more recent revision, govern). It is a way of organizing a security programme and communicating maturity, not a list of settings. Very common as a *conversation* framework with executives and boards.
- **SP 800-53** — a large catalogue of security and privacy controls, organized into families (access control, audit and accountability, contingency planning, and so on), with baselines. This is the heavyweight, used in United States federal systems and by anything mapping to federal authorization programmes.
- **SP 800-171** — a smaller set derived from 800-53, aimed at protecting a specific category of controlled but unclassified federal information when it sits in a non-federal organization's systems. It reaches ordinary companies through *contract clauses*, which is why a manufacturing supplier with no obvious government relationship can suddenly be in scope.

**Who it applies to.** Voluntarily, anyone who finds the structure useful. Mandatorily, United States federal agencies and, by contract flowdown, their contractors and often those contractors' suppliers.

**Why an engineer cares even when it is not mandatory.** NIST catalogues are the common language into which other frameworks are translated. When someone hands you a **crosswalk** — a mapping showing that one control satisfies requirements in several frameworks at once — the spine of that crosswalk is very often a NIST control identifier. Learning to read a control identifier like a family plus a number, and to look it up rather than guess at it, is a genuinely portable skill. It is also the reason lesson 04 teaches you to write control statements in a neutral form rather than in the wording of whichever framework asked first.

## The comparison, on one page

| | SOC 2 | HIPAA | GDPR | NIST publications |
| --- | --- | --- | --- | --- |
| What kind of thing | Audit/reporting standard | Sector law and rules | Data protection regulation | Voluntary framework and control catalogues |
| Force | Contractual | Statutory (US) | Statutory (EU/EEA, with similar regimes elsewhere) | Voluntary, or contractual flowdown |
| Triggered by | A customer demanding it | Handling protected health information as a covered entity or business associate | Processing personal data in scope of the regulation | Federal contract clause, or a deliberate choice |
| Scope of concern | Controls at a service organization | Protected health information | Personal data and individuals' rights | Whatever system the baseline is applied to |
| Key contract instrument | Customer contract; provider report reliance | Business associate agreement | Data processing agreement; transfer mechanisms | Contract clause |
| Output artifact | An auditor's report with an opinion | No certificate; compliance is a state you must be able to defend | No certificate; accountability must be demonstrable | A documented control implementation, sometimes assessed by a third party |
| Evidence emphasis | Operation of controls continuously over a period | Documented risk analysis and safeguards | Records of processing, rights handling, and measures | Control implementation traceable to catalogue identifiers |
| Where an engineer is most involved | Access reviews, change records, logging, availability evidence | Access control, audit controls, transmission security, encryption | Data location, deletion, minimisation, access control | Whatever the mapped controls say |

## Where they overlap, and why that is good news

The frameworks disagree about vocabulary and about who they bind. They agree remarkably closely about what a competently run system looks like. Every one of the four expects, in some wording:

- Only authorized people can reach the data, and access is reviewed
- Data is protected in transit and at rest
- Actions are logged and the logs are retained and reviewable
- Changes are controlled and traceable
- Incidents are detected, handled, and recorded
- The system can be recovered after a disaster
- Suppliers are assessed
- People are trained

That list is the actual syllabus of the rest of this course, and the overlap is why control mapping is worth doing properly *once*. A single well-implemented, well-evidenced access review satisfies a SOC 2 criterion, a HIPAA safeguard, a GDPR measure, and a NIST control family simultaneously. The efficient organization implements the control once, writes it down in neutral language, and maintains a crosswalk that points each framework's requirement at it. The inefficient organization implements it four times under four names, evidences it inconsistently, and fails at least one audit.

The one thing that genuinely does not overlap: **who the obligation runs to**. SOC 2 runs to your customer. HIPAA runs to a regulator and to individuals through a covered entity. GDPR runs to individuals and supervisory authorities. A NIST-based contract requirement runs to a contracting agency. When something goes wrong, that difference determines who must be told and by when — and that determination is not an engineering one.

## Routing: three worked examples

**A prospect asks: "Which of your data centres are HIPAA certified?"**
Two errors are embedded in the question. There is no HIPAA certification, and data centres are not the unit of analysis. The reply gives the facts and hands off cleanly: no such certification exists under HIPAA, our provider offers an agreement covering an enumerated list of services, the services in your proposed architecture are these, and the agreement question goes to our compliance team, who I have copied.

**An engineering manager asks: "We're SOC 2 now, so we're fine for our European customers, right?"**
No, and the reason is categorical rather than a matter of degree. A SOC 2 report is an opinion about your controls; it is not a lawful basis for processing personal data, it does not create a data processing agreement, and it says nothing about data subject rights or transfers. Route the European question to whoever owns privacy, and offer the useful engineering fact: much of the underlying control work is shared, so the gap is smaller than it looks — it is mostly contracts, records, and rights handling.

**A customer sends a 300-question security questionnaire.**
Split it. Questions about how the environment is configured are yours and you should answer them precisely and consistently. Questions about what the company commits to, whether a clause is acceptable, or whether a regulation applies are not yours. The most valuable habit here is building an internal answer library so that the same question gets the same answer from every engineer — inconsistent questionnaire answers across two deals are how a customer discovers that nobody actually knows.

## Practice

**Exercise 1 — Build the framework routing card (the main artifact).**

Produce a one-page reference card you would actually keep open while working the support queue. It must have a row per framework — SOC 2, HIPAA, GDPR, NIST — and these columns: *what kind of instrument it is*, *what triggers applicability*, *the contract instrument to ask about*, *two questions that are mine to answer*, *two questions I must route*, *who I route them to*. Write it in your own words. If a cell requires a specific number or deadline, write the hedge instead of the number, in a form you would be willing to send to a customer.

**Exercise 2 — Triage six inbound questions.**

For each, name the framework or frameworks implicated, state whether the question is engineering, compliance-officer, or counsel, and write the one-to-three-sentence reply you would send. Where the question rests on a false premise, correct the premise politely.

1. "Do you delete my data when I ask? How fast?"
2. "We need your Type II report and your penetration test results."
3. "Our government client requires 800-171 flowdown. Can you meet it?"
4. "Can our EU users' data stay in Europe?"
5. "Our clinic wants to send appointment data to your API starting Monday."
6. "You had an incident last week. Do you have to report it?"

**Exercise 3 — Write a crosswalk row.**

Take one control you can describe concretely — "multi-factor authentication is enforced for all administrative access" is a good one — and write a single crosswalk row that names, in neutral wording, the control statement, and then for each of the four frameworks a one-line note on why that framework cares about it and what evidence that framework would want. Where you are unsure of an exact criterion identifier, write "identifier to be confirmed with the compliance team" rather than inventing one. Inventing an identifier is the single most damaging thing you can do in a compliance document, because it looks authoritative and is unverifiable.

**Exercise 4 — Find the false certainty.**

Below are five statements an engineer might write in a customer email. For each, say whether it is safe to send as written, and if not, rewrite it. Then write one sentence explaining the general rule your rewrite follows.

1. "We're fully GDPR compliant."
2. "Our cloud provider is SOC 2 certified, so our infrastructure is covered."
3. "Under GDPR you have to report a breach within 72 hours."
4. "Encryption at rest is enabled on all databases in the production account, using provider-managed keys."
5. "HIPAA doesn't apply to us because we never see patient names."

Exchange the routing card from Exercise 1 with a classmate and test it against each other's Exercise 2 answers: if the card does not let a stranger route all six questions correctly, it is not finished.
