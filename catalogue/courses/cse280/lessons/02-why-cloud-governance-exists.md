---
lesson_id: cse280-02
course_id: cse280
pathway: cloud-support-engineer
title: Why Cloud Governance Exists
order: 2
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Explain how the shared responsibility model divides compliance obligations
    between a cloud provider and its customer
---

## The question that starts every governance conversation

A customer emails your support queue: *"We're moving our patient scheduling app to your platform. Are you HIPAA compliant?"*

There is a tempting answer, and it is wrong. The tempting answer is "yes" — because your company has a certificate, or because your cloud provider's website lists HIPAA on a compliance page. The reason it is wrong is the single most expensive misunderstanding in cloud compliance, and it is the thing this entire course is built around:

**A cloud provider's certification covers the provider's controls. It says nothing about how you configured your account.**

Amazon, Microsoft, and Google all publish audit reports and attestations covering their data centres, their hypervisors, their physical access procedures, their internal personnel screening. Those reports are real and they matter. They also do not cover the storage bucket you left readable by anyone on the internet, the database you provisioned without encryption, or the administrator account you shared between four people. Those are yours. If a regulator or an auditor comes asking, the provider's certificate will not answer for them.

Getting this line right — knowing exactly where the provider's obligation stops and yours starts — is the first competency of the course, and everything after it depends on the line being drawn correctly.

## Three words people use interchangeably and shouldn't

Before the model itself, three words. You will hear them used as synonyms in casual conversation, and treating them as synonyms will cost you clarity when you are trying to work out who does what.

**Security** is the practice of protecting systems and data from harm. It is a technical and operational discipline. A system can be secure and be totally undocumented.

**Compliance** is the practice of satisfying an external obligation — a law, a regulation, a contract, a standard — and being able to demonstrate that you satisfy it. Compliance is about *provability* as much as about the underlying protection. A system can be secure and non-compliant, because nobody can prove it is secure. Less comfortably, a system can be compliant and insecure, because the obligation asked for something weaker than the actual threat.

**Governance** is the practice of deciding what the organization's rules are, assigning who owns them, and making sure they are actually followed over time. Governance is the machinery that produces security and compliance rather than either of them individually. When someone says "we need cloud governance", they usually mean: right now nobody knows who is allowed to create what, in which account, with which settings, and nobody would notice if it changed.

For a support engineer, the practical distinction is this. Security questions are usually "is this configured safely?" Compliance questions are usually "can we show that this was configured safely, continuously, for the last twelve months?" Governance questions are usually "what stops someone from changing it tomorrow?" Different questions, different evidence, and frequently different people who own the answer.

## The shared responsibility model, read as a compliance instrument

You met the shared responsibility model in cse101 as a way of understanding what a cloud service does for you. Here you meet it again as a *legal and audit instrument*, which is a different reading of the same diagram.

The standard formulation splits the world in two:

- **Security *of* the cloud** — the provider's job. Physical facilities, hardware, the hypervisor and host operating system, the provider's own network backbone, the managed service software itself, the provider's employees and their access.
- **Security *in* the cloud** — the customer's job. What you deploy, how you configure it, who you grant access to, what data you put in it, how you encrypt it, and how you monitor it.

The compliance reading adds a third category that the marketing diagrams tend to skip, and it is the one that matters most in an audit:

- **Shared or "customer responsibility to configure" controls** — cases where the provider supplies the capability and you are responsible for turning it on, setting it correctly, and proving you did. Encryption at rest is the classic example. The provider builds the key management service; whether your database actually uses it is entirely your doing.

![A compliance obligation traced down through the shared responsibility model, showing which parts the provider's own certification covers and which parts remain the customer's to evidence](./img/compliance-responsibility-split.png)

### The line moves with the service model

The most common error after "the provider's certificate covers me" is assuming the split is fixed. It is not. It slides depending on what kind of service you bought.

| Layer | Infrastructure service (virtual machines) | Platform service (managed database, managed app runtime) | Software service (a finished application) |
| --- | --- | --- | --- |
| Physical and facilities | Provider | Provider | Provider |
| Host and hypervisor | Provider | Provider | Provider |
| Guest operating system, patching | **Customer** | Provider | Provider |
| Runtime and middleware | **Customer** | Provider | Provider |
| Application code | **Customer** | **Customer** | Provider |
| Network and firewall configuration | **Customer** | **Customer** (usually reduced) | Provider |
| Identity, roles, permissions | **Customer** | **Customer** | **Customer** |
| Data: what it is, where it goes, who sees it | **Customer** | **Customer** | **Customer** |
| Encryption configuration | **Customer** | Shared | Shared |

Read the bottom three rows again. Identity and data are the customer's responsibility at *every* service model. There is no cloud purchase that transfers responsibility for who can see your data. That is why lessons 05 and 06 of this course sit where they do: they are the two control families you can never outsource, no matter how managed the service is.

Two worked consequences:

*You move a workload from virtual machines to a managed database.* You have just handed the provider guest OS patching and database engine patching. Several audit findings you used to own — "critical OS patches applied within the defined window" — become the provider's, evidenced through their audit report rather than through your patch logs. That is a real reduction in your compliance burden and a legitimate reason to prefer managed services in a regulated environment. What you did *not* hand over: who has database credentials, whether the data is encrypted with a key you control, and whether the database is reachable from the internet.

*You adopt a third-party monitoring product.* You have not reduced your responsibility; you have added a supplier. Now some of your data lives with a company whose controls you did not audit. This is the vendor or third-party risk problem, and it is why security questionnaires exist — the questionnaire you receive from a customer is the same questionnaire you should be sending to your own vendors.

## Inheritance, carve-outs, and the controls nobody owns

When an auditor evaluates your environment, they will want to know which of your controls are *inherited* from the provider and which are *yours*. Inheritance is a legitimate and expected answer — nobody expects you to audit a data centre you have never been inside. But inheritance has rules.

**Inherited controls** are ones the provider operates on your behalf. You evidence them not by showing your own configuration but by referencing the provider's audit report for the relevant period. Physical access to the facility, media destruction, and environmental controls are typically inherited outright.

**Carve-outs** are the mirror image. A provider's audit report will often explicitly state that certain controls are *not* covered, or are covered only for named services. The single most common trap: the provider's report covers a defined list of services, and the exotic service you adopted last month may not be on it. If a service is out of scope of the provider's report, you cannot inherit anything from it, and you will need a different answer for the auditor.

**Complementary user entity controls** are the ones the provider's report will name explicitly as *your* job — the report itself says, in effect, "our controls only work if the customer also does the following." Enabling multi-factor authentication for privileged users, configuring logging, restricting network access. If you have never read that section of a provider audit report, it is the most useful thing you will read this month, because it is a pre-written list of your obligations from the party best positioned to know them.

The controls that hurt in an audit are the ones nobody owns: the customer assumed the provider had it, the provider's report says the customer has it, and the result is a gap that has been open for the entire audit period with nothing to show for it. Half of the value of drawing an explicit responsibility split is that it makes those gaps visible before an auditor finds them.

## The governance lifecycle, and where a support engineer sits in it

Governance is often drawn as a loop, and the loop is worth memorizing because it tells you what artifact you owe at each stage.

```text
1. Define      A rule is written down.               Artifact: policy, standard
2. Implement   The rule becomes configuration.       Artifact: control, IaC, setting
3. Monitor     Drift from the rule is detected.      Artifact: alert, posture report
4. Evidence    Operation is recorded over time.      Artifact: log export, screenshot, ticket
5. Assess      Someone checks against the rule.      Artifact: audit finding
6. Remediate   The gap is closed and verified.       Artifact: change record, retest
      (back to 1 — the rule may need to change too)
```

A cloud support engineer touches every stage of this loop, but rarely owns stage 1. You are usually handed a rule someone else wrote and asked to make it true and provable in a cloud account. That is stages 2 through 6, and it is the bulk of this course: lesson 04 is stage 2, lessons 05 and 06 are stage 2 for the two heaviest control families, lesson 07 is stages 5 and 6, and lesson 10 is stage 4.

## Who owns what, and how to route a question you should not answer

Compliance work has more roles in it than engineering work does, and a great deal of avoidable damage comes from an engineer answering a question that was not theirs.

- **Legal counsel** owns interpretation of law and contract. Does this regulation apply to us? What does this contract clause obligate us to do? What must we tell a regulator and when? Are we allowed to move this data to that country? These are legal determinations. You do not make them, and neither does your manager.
- **The compliance officer or privacy officer** owns the organization's compliance programme: which frameworks are in scope, what the policies say, who talks to auditors, and what gets committed to a customer in writing.
- **The security team** owns threat modelling, security architecture, and incident response leadership.
- **Engineering and cloud support — you** own implementing controls in the environment, gathering evidence, finding and fixing configuration gaps, and explaining accurately what the environment does.
- **The external auditor** is independent and does not work for you. Their job is to test, not to advise. Treat them politely, answer precisely, and never volunteer speculation.

The routing skill matters as much as the technical skill, and it is very learnable. Three phrases will carry you a long way:

> "I can tell you exactly how the system is configured. Whether that satisfies the regulation is a question for our compliance officer, and I'll get it to them today."

> "I don't want to guess at a legal answer. Let me connect you with the right person and stay on the thread so the technical detail is accurate."

> "I can confirm that setting is enabled and I can send you the evidence. I'm not able to confirm what our contract commits us to."

Notice what all three do. They give the customer something real and immediate — the technical fact, which is genuinely yours to give — while declining the part that is not yours, without sounding evasive and without leaving the customer stranded. Notice also what none of them do: none says "yes, we're compliant."

### The specific answers to the specific questions you will get

**"Are you HIPAA compliant?"** Compliance is a property of an organization and a workload, not of a platform. The honest structure of an answer: our platform provides the following technical safeguards, here is what we will and will not sign, and here is the compliance contact who can walk through the rest. The contract instrument itself is a legal document; do not opine on whether one will be signed.

**"Can you send me your audit report?"** Almost always yes, and almost always under a non-disclosure agreement, through the compliance team, not as an email attachment from you. Provider audit reports are usually available to customers through the provider's own compliance portal under similar terms.

**"Where exactly is my data stored?"** This one *is* largely yours, and you should be able to answer it precisely: which regions the primary data sits in, which regions backups and replicas sit in, and which supporting services touch it. Lesson 06 covers how to get that answer right. The moment the question becomes "is that lawful for our data", it goes to counsel.

**"Is my data encrypted?"** Yours, and you should answer with specifics rather than a yes: in transit with what minimum protocol version, at rest with which key management arrangement, and who can access the keys. "Yes" alone is a non-answer that an informed customer will immediately push back on.

## Reading a requirement without inventing what it says

One habit to build now, because it will save you repeatedly. Compliance requirements arrive as text — often badly photocopied, often excerpted, sometimes truncated. When a requirement is incomplete or ambiguous, the correct response is to flag it, not to fill it in.

An invented interpretation is worse than an open question, because the open question gets escalated and the invention gets implemented. If a customer's questionnaire asks about "encryption of PHI at rest per our standard" and does not attach the standard, you ask for the standard. You do not guess which cipher they meant and build to your guess. The same applies to a requirement that ends mid-sentence in a scanned PDF: get the original.

The same discipline applies to hedging. Regulations change, and specific numbers change with them — notification windows, retention periods, thresholds for when an obligation kicks in. Even where you have read a number, write it as "the framework specifies a short notification window; confirm the current text with counsel" rather than stating the number as settled fact in a customer-facing document. Being usefully approximate and clearly sourced beats being confidently wrong.

## Practice

You are the cloud support engineer for a company running a patient appointment reminder service. The architecture is:

- A web front end on managed container hosting
- An application tier on customer-managed virtual machines
- A managed relational database holding patient names, phone numbers, and appointment times
- Object storage holding nightly database exports
- A third-party SMS provider that receives the phone number and the message text
- Cloud-provider identity for staff logins, with a handful of long-lived access keys used by scripts

**Exercise 1 — Build the responsibility split (the main artifact).**

Produce a table with these columns: `Control area`, `Owner (provider / customer / shared)`, `Why`, `How it is evidenced`. Cover at least these twelve control areas: physical data centre access, hypervisor patching, guest OS patching on the application tier, database engine patching, database encryption at rest, key custody, TLS configuration on the front end, network exposure of the database, staff account MFA, service account key rotation, backup retention of the nightly exports, and data sent to the SMS provider.

For each row where you wrote "shared", add a sentence naming precisely which half is yours. A row that says "shared" without that sentence is not finished — "shared" is where audit gaps live.

**Exercise 2 — Find the unowned control.**

At least two of the twelve areas above are ones a team in this situation typically assumes the provider handles when it does not. Identify them, write one sentence on the consequence if that assumption goes unchallenged for a full audit period, and write the one-line question you would ask to confirm ownership, addressed to the right role.

**Exercise 3 — Route four inbound questions.**

For each of the following, write (a) the part of the answer that is genuinely yours to give, (b) the part that is not and who owns it, and (c) the actual sentence you would send. Keep each response under 120 words.

1. "Are you HIPAA compliant?"
2. "Our security team needs your SOC 2 report by Friday."
3. "Does patient data ever leave the country?"
4. "If we sign with you, are we covered for GDPR?"

**Exercise 4 — Write the routing record.**

Pick the question from Exercise 3 that you routed away, and write the internal handoff note that goes with it: what was asked, by whom, what technical facts you have already confirmed, what determination you are asking for, and by when. This note is a real artifact — a compliance officer who receives a good one can answer in five minutes, and one who receives "customer asking about HIPAA, please advise" cannot.

Swap all four artifacts with a classmate. Their job is to find one row in your responsibility table where the owner is wrong or the evidence column would not survive being asked "show me."
