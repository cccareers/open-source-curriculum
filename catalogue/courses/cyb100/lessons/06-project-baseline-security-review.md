---
lesson_id: cyb100-06
course_id: cyb100
pathway: cybersecurity-support-technician
title: "Project: Baseline Security Review of a Small Office"
order: 6
kind: project
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
  - D1-S1-C03
objectives: []
---

## The goal

Produce a **baseline security review** of a small business: a written document that tells an owner what they have, what could go wrong with it, what their existing protections are actually worth, what to do first, and what to do when something happens anyway.

You are not configuring anything. This is a paper exercise on purpose. A baseline review is the first genuine piece of security work most support technicians are trusted to produce, and it is produced with a description, a set of questions, and a keyboard — long before anyone hands a new technician credentials to a production system. The judgement is the deliverable.

Three judgements are being assessed, and they are the three things this course taught:

- Can you **identify threats and vulnerabilities** in an environment you have only been described?
- Can you **evaluate the controls that already exist** — say what property each protects and where it fails — rather than only listing what is missing?
- Can you **rate and treat risk, and contribute usable incident response material** that protects sensitive data?

Budget three hours. Two of them are writing. If you are ninety minutes in and still reading the client description, you are researching rather than deciding.

## The client

**Kestrel Property Management** manages 340 residential rental properties from a single first-floor office above a shop. Eighteen staff: two directors, six property managers, four maintenance coordinators, three accounts staff, two administrators, and a receptionist. They have never had a security review. One of the directors asked for one after a firm they know lost £41,000 to a fraudulent change of bank details.

**What they hold.** Tenant records — names, dates of birth, contact details, employment and income evidence, copies of passports and driving licences collected for right-to-rent checks, and bank details for rent collection. Landlord records — names, addresses, bank details for payouts, and contracts. Contractor records, including bank details. Around six years of accounts. Roughly 2,400 tenant files, of which about 900 are current.

**Where it lives.**

- A **property-management application** hosted by the software vendor and reached through a browser. Every member of staff has a login with a username and password. The two directors and the office administrator share a single administrator login, "because it's easier than remembering who has what." The vendor's contract has never been read by anyone currently working there.
- A **Windows file server** in a cupboard in the corridor, holding scanned identity documents, signed contracts, and the accounts spreadsheets. Every staff account is a member of one group with read and write access to everything on it. The cupboard is locked; the key hangs on a hook beside it.
- **Eighteen Windows laptops.** Staff take them home. Each user is a local administrator on their own machine "so they can install printer drivers." Disk encryption status is unknown.
- **Microsoft-hosted email**, reachable from anywhere with a username and password. Two property managers also have the mail account on their personal phones.
- A **shared mailbox**, `accounts@`, which four people access. It receives invoices from contractors and bank-detail change requests from landlords.
- A **cloud storage account** on a consumer file-sharing service, opened three years ago by a property manager to send large photo sets to landlords. Nobody knows how many links are still live or whether any point at folders containing identity documents.
- A **printer/scanner** in the main office used to scan identity documents; it emails the scan to whoever pressed the button. It has a web administration page, and its password is the factory default.
- A **guest wireless network** for visitors that is the same network the laptops and the server use. The password is on a laminated card at reception and was last changed when the office moved in 2019.

**How they work.**

- Contractor invoices arrive at `accounts@` as PDF attachments. An accounts clerk checks the amount against the job, then pays it. Bank details are taken from the invoice.
- Landlords occasionally email to change the account their rent payouts go to. Current process: the property manager forwards the email to accounts, who update the record.
- New staff get an account created by the office administrator by copying the permissions of whoever sat there before.
- Staff who leave are removed from the property-management application "when someone remembers." One director thinks two former employees may still have email.
- Backups: the file server copies itself nightly to a network drive in the same cupboard. The property-management data is the vendor's responsibility; nobody has asked what that means.
- Antivirus came with the laptops and shows a green tick. No one has logged into any console. There is no other monitoring, no log review, and no security training.
- There is no incident response plan. Asked what they would do if the file server were encrypted on a Friday evening, the director said, "call our IT guy, I suppose" — a one-person local firm with a permanent remote-access account on the server.

**What the directors have said.** *"We're not a bank. But we do hold a lot of people's passports, and I don't want that on the front page. Tell us the three things to do first, and tell us what they cost us in hassle, not just money."*

## Requirements

Numbered so a reviewer can grade them one at a time. Your document must contain all eight.

**R1 — Asset inventory and property ranking.** A table of Kestrel's assets covering data, systems, devices, people and knowledge, premises, and third parties. For each, rank confidentiality, integrity, and availability as high, medium, or low, with a short justification for the highest-ranked property. A reviewer must be able to check every later section against this table and find nothing you discussed that is not listed here.

**R2 — Findings.** At least **fourteen** findings, each written as one sentence a director could understand, with columns for the asset affected, the security property at risk, the vulnerability category, and a plausible threat actor or event. Your set must include at least one finding in each of: physical, third-party or supply chain, shadow IT, privilege, and detection capability. At least one finding must be a non-human threat. Anything the description does not tell you must be recorded as *not stated* rather than assumed in either direction.

**R3 — Control evaluation.** Kestrel is not defenceless. Take the **six** protections it does have — the locked cupboard, the antivirus, the nightly backup to the network drive, the vendor-hosted application, the amount-check on contractor invoices, and the firewall in the internet router — and evaluate each. For every one give: the asset and property it protects, its category (administrative, technical, physical), its function (preventive, detective, corrective, deterrent, compensating), and **the most realistic circumstance in which it does not do its job**, stated specifically. Then state for each whether it is adequate, partially adequate, or inadequate for the risk it is supposed to address, and say what "adequate" would look like. This section is where a review earns its fee; do not let it be shorter than R2.

**R4 — Risk register.** Turn your findings into at least **ten** risk statements in the form *[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]*. Rate each for likelihood and impact using the five-point scales from lesson 04, with **one sentence of justification for each rating**, and read a priority off the matrix. Present them ranked. State the twelve-month period your likelihood ratings assume.

**R5 — Treatment plan for the top six.** For each of your six highest-rated risks: the primary response (reduce, transfer, avoid, or accept), the specific action, a proposed owner by role, the estimated residual rating, and a review date. At least one must be **avoidance** and at least one must be **documented acceptance** written the way you would want it read back to you after an incident. For each, state in one sentence how the action addresses the actual weakness rather than an adjacent one.

**R6 — The three things to do first.** The directors asked for this explicitly. Give exactly three, ranked, each with: what it is, why it is ahead of the others, roughly what it costs in money and in friction for staff, and what would tell you within a month that it had worked. At least one of the three must not be a purchase.

**R7 — Incident response contribution.** Kestrel has no plan. Draft the starting pieces:

1. A **severity table** with three levels, each with two Kestrel-specific examples and a stated expectation of who is contacted and how quickly.
2. A **runbook** for *"a landlord's bank details were changed from an email that may not have come from the landlord"*, in numbered steps covering detection, containment, eradication, recovery, and communication. Mark the step that requires a director's authorization, and mark the step that must happen within the first hour.
3. A **runbook** for *"a staff member entered their email password into a fake login page."*
4. An **offline contact and escalation list** template, with a one-sentence note on why it is offline.

**R8 — What you could not see.** A short section listing every question you would need answered before this review could be considered complete, and why each matters. Minimum eight questions. This section is graded on honesty: a review that silently assumed the laptops were encrypted scores worse than one that says it does not know and explains what turns on the answer.

## Constraints

- **Paper only.** You are not to scan, probe, or test anything, and nothing in this project requires a lab. Recommendations may name categories of tooling; they may not name a specific product as the answer.
- **No network engineering.** You may write the finding "the guest network and the office network are the same network" and state the property at risk. You may not design the segmentation, specify firewall rules, or discuss protocols — that work belongs to the networking course later in this pathway.
- **No formal framework compliance work.** You may refer to the six framework functions to check your own coverage, and you should. You may not produce a control-by-control mapping against a published standard or write an audit finding; that is a later course.
- **Vendor-neutral.** Where a control depends on a capability the vendor may or may not offer — say, multi-factor authentication on the property-management application — treat its availability as a question for R8, not an assumption.
- **Plain language.** The primary reader is a director who manages property, not systems. Any sentence they would have to ask you to explain is a defect. A one-page technical appendix is allowed for detail that would break the flow.
- **Length.** Aim for eight to twelve pages including tables. Longer is not better; a review nobody finishes is a review nobody acts on.

## Definition of done

Your review is finished when all of the following are true:

1. All eight requirements are present and individually identifiable, in order.
2. Every finding in R2 traces to an asset listed in R1, and every risk in R4 traces to a finding in R2. A reviewer picking any risk at random can walk it backwards to an asset.
3. Every one of the six existing controls in R3 has a **specific** failure circumstance — "someone could misconfigure it" fails this test; "the backup drive is in the same cupboard and permanently connected, so anything that encrypts the server encrypts the backup" passes it.
4. Every likelihood and impact rating in R4 has its own justification sentence next to it.
5. The top six treatments in R5 include at least one avoidance and one documented acceptance, and no treatment names a product as the whole answer.
6. R6 contains exactly three items, ranked, each with a stated cost in friction as well as money, and at least one that is not a purchase.
7. Both runbooks in R7 are numbered, and a competent person who had never read your document could follow either one at 6 p.m. on a Friday.
8. R8 contains at least eight questions and does not contain the word "presumably."
9. Nowhere in the document have you asserted a fact the client description does not support.
10. A director could read the first page and act on it; a technician could read the whole thing and know what to do on Monday.

## Hints

**Start with R1 and R8 together.** As you build the asset table you will notice the questions you cannot answer. Write them straight into R8 as they occur — you will end with a better list than if you try to remember them at the end.

**Work the ten vulnerability categories deliberately.** Patching, misconfiguration, authentication, privilege, unprotected data, human factors, detection gaps, physical, third party, shadow IT. Ask all ten even where you expect nothing; the required spread in R2 is there because reviews written by technical people reliably under-report the physical and process findings, which is where Kestrel's most expensive risk actually lives.

**The invoice and bank-detail processes deserve as much of your attention as the server.** The loss that prompted this engagement was a payment-detail fraud, and Kestrel's current process has no verification step of any kind. That is a finding, a risk, a treatment, and probably a runbook. Note also that this risk needs no malware and no intrusion, which is worth saying to a director who expects the answer to be antivirus.

**Do not let R3 become a list of things Kestrel lacks.** Evaluating an existing control means taking it seriously first — saying what it does protect — and then finding the gap. The locked cupboard genuinely is a physical preventive control; the key on the adjacent hook is what makes it partially adequate. That structure, "here is what it buys you, here is where it stops," is the one to repeat six times.

**Watch for controls that are believed in more than they work.** The antivirus with the green tick and the nightly backup that has never been restored are both in this category, and they are more dangerous than an absence, because the organization thinks the risk is covered and stops looking.

**Identity documents change the impact arithmetic.** Passport and licence scans, income evidence, and bank details are exactly the material used for identity fraud against the individuals concerned. Impact ratings on anything touching that file server should reflect harm landing on 2,400 people, not just inconvenience to Kestrel — and one of your avoidance candidates is sitting right there in the 1,500 files belonging to former tenants that nobody has a reason to keep.

**Use the framework functions as a self-check before you submit.** Sort your R5 and R6 recommendations into govern, identify, protect, detect, respond, recover. If everything you proposed lands in protect, you have written the review of someone who has not yet noticed that Kestrel would not know anything had happened.

**Write R6 last and write it for the director.** Three items, ranked, in their language, with the hassle cost stated honestly. If your first item cannot be explained in two sentences to someone who manages property for a living, it is probably not the right first item.
