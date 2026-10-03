---
lesson_id: ai350-04
course_id: ai350
pathway: prompt-engineer
title: Data Privacy Law in Practice
order: 4
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Apply GDPR and CCPA obligations to a concrete AI workflow that processes
    personal data
---

## What this lesson is and is not

This lesson is not legal advice, and you are not going to become the person who decides what your organisation owes. Privacy law is jurisdictional, fact-specific, and changes; the interpretation belongs to counsel or a privacy officer, and your organisation's actual obligations are theirs to determine.

What you can do — and what nobody else in the building can do as well as you — is answer the factual questions that any privacy assessment depends on. Which personal data does this workflow touch? Where does it go? Who else receives it? How long does each copy live? Can we find and delete every copy for one individual? Is a machine making a decision about a person, and can a human intervene? A privacy lawyer who is handed accurate answers to those questions can do their job in an afternoon. Handed nothing, they will either block your project or approve something they do not understand, and both outcomes are bad.

So the goal here is **translation**: turning the obligations of the two regimes this pathway names — the EU's General Data Protection Regulation and California's consumer privacy law, commonly called CCPA and amended by CPRA — into checks you perform on a workflow. Other regimes exist and matter. Sector rules for health, education, and payment data, and newer AI-specific regulation such as the EU AI Act, are real and out of scope here; if your workflow touches those categories, the correct move is to stop and escalate rather than to reason from this lesson.

## Vocabulary you need to use correctly

Precision here is not pedantry. Using the wrong word to your privacy reviewer will get you the wrong answer.

**Personal data** (GDPR) and **personal information** (CCPA) both mean information relating to an identifiable person, and both are broader than builders expect. An email address, a phone number, an IP address, a customer id, a support ticket that mentions a named person, a voice recording, a photograph — all in scope. CCPA's definition is notably broad, covering information that could reasonably be linked to a household. A free-text field is personal data whenever a person is describable from it, which in support and sales workflows is nearly always.

**Special category data** (GDPR) covers health, racial or ethnic origin, political opinions, religious beliefs, trade union membership, biometrics, and sex life or orientation. CPRA has a parallel notion of **sensitive personal information**. Both carry heavier requirements. The AI-specific trap is inference: if your automation classifies free text into categories that amount to health or ethnicity, you may have created special category data that was not there before.

**Controller** (GDPR) is whoever decides why and how data is processed — usually your organisation. **Processor** is whoever processes it on the controller's instructions — usually your model vendor and your automation platform. CCPA's near-equivalent of a processor is a **service provider**, and the distinction matters because a transfer to a service provider under a proper contract is treated differently from a "sale" or "sharing" of personal information, which triggers opt-out rights. Whether sending data to a model vendor is a service-provider arrangement is a contract question, which is exactly why the DPA question in the vendor questionnaire mattered.

**Data subject** (GDPR) and **consumer** (CCPA) are the person the data is about, and both regimes give them enforceable rights.

**Processing** means essentially anything you do with the data, including storing it, sending it to a model, and logging it.

## The obligations, as workflow checks

Here is the translation table. Read the left column as the legal concept and the right column as the thing you inspect in your automation.

| Obligation | Regime | What you check in the workflow |
| --- | --- | --- |
| Lawful basis for processing | GDPR | Someone has recorded which basis applies (consent, contract, legal obligation, vital interests, public task, legitimate interests). You do not choose it; you make sure it is written down and that the workflow matches it. |
| Notice / transparency | Both | The privacy notice reflects what this workflow actually does, including that AI processing occurs and which categories of recipients receive data. CCPA requires notice at or before collection. |
| Purpose limitation | GDPR (and CPRA) | Data collected for support is not being reused to train a sales model or generate marketing copy without a fresh basis. |
| Data minimisation | GDPR (and CPRA) | The prompt contains only fields the task needs — the same deletion exercise from the previous lesson, now with a legal reason behind it. |
| Storage limitation / retention | Both | Every copy has a stated retention period and something actually enforces it. |
| Individual rights | Both | You can locate, export, correct, and delete one person's data across every copy, within the statutory window. |
| Opt-out of sale or sharing | CCPA/CPRA | If personal information goes to a third party outside a service-provider contract, an opt-out mechanism exists and your workflow honours it. |
| Limits on sensitive information | CPRA / GDPR | Special category or sensitive data is identified and handled under the stricter rules, or excluded. |
| Vendor contracts | Both | A data processing agreement (GDPR) or service-provider contract (CCPA) is in place with the model vendor and the automation platform. |
| International transfers | GDPR | Personal data leaving the EU/EEA has a lawful transfer mechanism; you supply the fact of where processing happens. |
| Records of processing | GDPR | Your data inventory feeds the organisation's processing record. |
| Automated decision-making | GDPR (Art. 22) | Where a decision is made solely by automation and has legal or similarly significant effects on someone, additional protections apply, including human involvement. You flag which decisions those are. |
| Security of processing | Both | The controls from the previous lesson, which are themselves a legal requirement, not just good practice. |
| Breach notification | GDPR (and state laws) | You know who to tell, and how fast, when personal data is exposed. GDPR's controller notification deadline is 72 hours from awareness, which is short. |

## Working a concrete example

Take a plausible workflow. A retail company runs an automation that reads inbound support email, retrieves the customer's order history from a database, sends the message and the history to a hosted model, generates a draft reply and a satisfaction-risk score, writes the score to the CRM, and mails the draft to a support agent for approval. Customers include people in California and in Germany.

Walk the privacy checkpoints in order.

**What personal data is involved?** From the inventory: name, email address, postal address, order history, free-text complaint, and a generated risk score. The complaint text is the risky one — a customer describing a medical reason for a return has just put special category data into your prompt. The risk score is personal data your organisation created, which means it is subject to access and correction rights like everything else.

**Who receives it?** The automation platform, the model vendor, the CRM, and the agent's mailbox. Four recipients, at least three of them third parties, all of which need a contract and all of which appear in your privacy notice's categories of recipients.

**Where does it go geographically?** If the model vendor processes in the United States and the customer is in Germany, there is an international transfer, and someone must have a transfer mechanism in place. Your job is to establish and document the fact of the transfer, not to select the mechanism.

**How long does each copy live?** Mailbox: indefinitely, unless someone set a policy. Run history: platform default, often thirty days. Vendor: whatever the questionnaire said. CRM: life of the account. Four different answers, only one of which anyone has ever consciously chosen. This is the most common finding in a real review.

**Can you satisfy a rights request?** Test it rather than assuming. This is the check that fails most often, so it deserves its own runbook.

```text
Deletion request runbook — "delete everything you have about me"

1. Identify the subject: match on email and customer id; note aliases
   (a second address used on one ticket) before you start.
2. List every location from the data inventory:
   [ ] CRM record and the generated risk score
   [ ] Support mailbox threads (inbound and the sent drafts)
   [ ] Automation platform run history for matching runs
   [ ] Any exported spreadsheet or debug table
   [ ] Retrieval corpus / vector store entries derived from their tickets
   [ ] Model vendor retained logs (raise a request per contract)
   [ ] Backups (record the schedule; deletion may be deferred to expiry)
3. Delete or anonymise in each, recording who did it and when.
4. Note the exceptions you are relying on (records kept for a legal or
   accounting obligation) and get them confirmed, not assumed.
5. Confirm to the requester within the statutory window and file the record.
```

Two locations on that list are the ones builders forget. **Retrieval corpora** are copies: when you embedded past tickets so the assistant could reference them, you created a derived store that a deletion request reaches. Design it so entries carry a customer id, or deletion becomes impossible without a full rebuild. And **the model vendor's retained logs** are outside your systems entirely; whether you can get them purged depends on the contract you checked in the previous lesson. If the answer is no, that constrains what data you may send — the requirement flows backwards into the design.

**Is a machine deciding something significant about a person?** In this example, no: the model drafts and scores, and an agent approves. That is the correct answer to be able to give, and it is a design decision you should be able to point at. If a later version auto-closes tickets or auto-denies refunds without review, the answer changes and so does the legal analysis. Flag it, escalate it, and note that the policy work in the next-but-one lesson is where you decide what the automation may decide.

## Four patterns that turn a workflow compliant

The example above generalises. Most privacy findings in AI workflows are fixed by one of four moves, and all four are things a builder can do without waiting for a legal opinion.

**Pseudonymise before the prompt.** Replace direct identifiers with tokens on the way in and restore them on the way out. The model sees "customer 8842 reports that their order arrived damaged"; your workflow holds the mapping. This does not take the data outside privacy law — pseudonymised data is still personal data under GDPR, because it can be re-linked — but it materially reduces what crosses the vendor boundary, shrinks what sits in your run history, and is often the difference between a workflow a reviewer approves and one they do not.

**Separate the sensitive step.** If one part of a workflow needs the full record and the rest does not, split it. A retrieval step that looks up an order can run entirely inside your systems; only the sanitised summary needs to reach the model. Builders default to assembling one large context because it is easier, and easier here means a larger exposure with no offsetting benefit.

**Make retention real.** A stated retention period that nothing enforces is worse than no policy, because it creates a documented claim you are not meeting. Configure the platform's run-history window, add a scheduled job that clears your own tables, and record the mailbox and CRM policies as facts rather than intentions. Then check once that a record older than the window has actually gone.

**Design for erasure at build time.** Retrofitting deletion is the expensive failure in this lesson. Every store your workflow creates — a log table, a summary record, an embedded document, a spreadsheet of results — should carry a subject reference from the day it is created, so that "find everything about this person" is a query rather than an archaeology project. Adding one column at build time costs nothing; adding it after two years of records costs a rebuild.

Underneath all four is one habit, and it is the same one the security lesson arrived at from a different direction: send less, keep less, know where it is. That convergence is not a coincidence. Privacy law largely codifies the practices that a careful engineer would adopt anyway, which is why the workflows that pass review most easily are usually the ones that were designed carefully rather than the ones that were documented heavily.

## Where the two regimes diverge, in practice

You do not need to be able to argue the differences, but you do need to notice when a fact matters to one and not the other.

GDPR is basis-first: you need a lawful reason before you process, transparency about it, and demonstrable accountability. It applies based on where the individuals are, not where your company is, which is why a small US company with European customers is in scope. Its rights include access, rectification, erasure, restriction, portability, and objection.

CCPA and CPRA are notice-and-choice-first: broadly, you may collect if you disclose, and the consumer's leverage is the right to know, delete, correct, opt out of sale or sharing, and limit use of sensitive information. Applicability is thresholded on business size and data volume, so a small business may fall outside it entirely — again, not your call.

The practical convergence is that both regimes reward the same engineering: collect less, say what you do, know where it went, be able to delete it, and keep a human in the loop for consequential decisions. If you build to those five, most of a privacy review becomes paperwork rather than rework.

## Practice

Work with a real workflow that processes personal data — yours if it qualifies, otherwise the retail support example above.

1. **Extend your data inventory with three privacy columns**: is this personal data (yes/no/possibly), is it special category or sensitive (yes/no), and what is the stated retention. Justify every "no" in the first column in a few words; unjustified "no" answers are where reviews find problems.
2. **Complete a recipient map.** List every party that receives personal data from this workflow, what they receive, whether a data processing agreement or service-provider contract exists, and where they process it. Mark unknowns as unknown.
3. **Write and dry-run the deletion runbook.** Adapt the runbook to your workflow's actual locations, then pick one real or test customer and physically walk it — open each location and confirm you can find their data. Record how long it took and which step failed or was impossible.
4. **Flag the automated decisions.** List every point where the workflow decides something about a person (routing, scoring, prioritising, approving, denying). For each, state whether a human reviews it before it takes effect and what the effect on the person would be if it were wrong.
5. **Write the escalation memo.** Half a page addressed to your privacy reviewer or manager containing: what the workflow does, the personal data it processes, the recipients and locations, the retention gaps you found, the deletion steps that do not currently work, and a numbered list of questions you need answered. Explicitly mark it as a request for a decision, not a proposal of one.

A good memo from this exercise is the single most professionally useful artifact in this course. It is also the thing that gets a project approved instead of shelved.

## Check your understanding

1. You replace customer names with tokens like "customer 8842" before the prompt. Is the prompt now free of personal data? *No. Pseudonymised data is still personal data under GDPR because your workflow can re-link it. It does reduce what crosses the vendor boundary and sits in logs.*
2. Which two locations on the deletion runbook do builders most often forget? *Retrieval corpora or vector stores derived from tickets, and the model vendor's retained logs.*
3. A later version of the workflow auto-denies refunds with no review. What changes in your privacy analysis, and what do you do? *It may now be a solely automated decision with significant effects on a person, which carries additional protections. Flag it and escalate to your privacy reviewer; do not decide it yourself.*
