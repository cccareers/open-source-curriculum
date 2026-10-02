---
lesson_id: cyb150-08
course_id: cyb150
pathway: cybersecurity-support-technician
title: "Project: Policy Set Draft"
order: 8
kind: project
competency_ids:
  - D4-S1-C03
  - D4-S1-C01
objectives: []
---

## Goal

Draft a small, usable, traceable security policy set for Cedar Hollow Community Health that responds directly to the highest-rated risks in the register you built in project 07 and maps cleanly to framework requirements.

This is the second of three linked projects, and it does not start from a blank page. **Project 07 is its input**: every policy statement you write here must be traceable to a risk you rated, and the risks you ranked in your top five are the ones the policy set exists to address. **Project 09 is its consumer**: the gap report you write next will assess Cedar Hollow against a framework, and one of its central findings will be the difference between a policy that exists on paper and a control that operates in practice. Write these policies knowing you will be auditing them yourself in three hours.

Use the same organization, the same systems, the same people. If you have lost your register, rebuild the top five before starting.

## The situation

Angela Ruiz has taken your risk register to the Executive Director. Sam Okonjo has approved a small amount of work and given you a clear instruction and a clear limit:

> "The funder wants to see that we have policies. I want policies our staff can actually follow. We have 210 people, two of them in IT, and most of our clinical staff are with patients all day. Do not give me forty pages that we ignore. Give me the three that matter and tell me what they oblige us to do."

Cedar Hollow's existing policy library is a HIPAA policy template purchased in 2019. It is 60 pages, uses the phrase "as appropriate" 34 times, names a vendor that no longer exists, and has never been re-approved. Nobody has attested to it. Angela knows it is not defensible and would rather replace three parts of it well than revise all of it badly.

Cedar Hollow will be assessed against the **HIPAA Security Rule** and, at the funder's request, described using the **NIST Cybersecurity Framework**. Those are the two frameworks your traceability table must cover. ISO 27001 and SOC 2 are optional additional columns if you want the practice; nothing at Cedar Hollow requires them.

## Requirements

**1. Three policies, chosen and justified.** Select exactly three policies to draft. Before drafting, write a half-page selection rationale that names the specific risk IDs from project 07 each policy addresses and explains why these three beat the alternatives given Sam's constraint. A policy that does not trace to a top-rated risk needs a strong stated reason to be in the set.

**2. Full policy documents.** Each of the three carries:
- the complete header block: document ID, version, title, classification, owner role, approver role, effective date, next review date, and who it applies to
- purpose, in two or three sentences
- scope, including at least one **explicit exclusion** per policy
- numbered policy statements, one obligation each
- roles and responsibilities, by role title, never by person's name
- an exceptions section
- an enforcement section, with the employment-consequence wording marked as a placeholder for HR and legal review
- related documents
- a traceability table
- a revision history with the first row filled in

**3. Statement quality.** Across the three policies, at least **24 numbered statements** in total, and every statement must:
- use `must`, `must not`, `should`, or `may`, with the convention stated in the document
- carry exactly one obligation
- be testable — you must be able to name what you would inspect
- contain no product or vendor names; push those to a standard

At least **eight** statements across the set must specify a number: a time limit, a frequency, a version, a length, or a count.

**4. The violation test, applied and reported.** For every numbered statement, complete the sentence "This would be violated if…" with a concrete act by a named role. Deliver this as a separate check sheet. Report how many statements you had to rewrite after applying it — a set where nothing needed rewriting means the test was not applied honestly.

**5. Traceability tables.** Each policy ends with a table mapping every statement to: a NIST CSF Subcategory, a HIPAA Security Rule section, an internal control ID you assign, and a **risk ID from project 07**. Unverified identifiers are written as `unverified`, never guessed. After the tables, write two or three sentences reading the tables *down the columns* to name what your set does not cover.

**6. One supporting procedure.** Choose one policy statement that cannot work without a procedure and write that procedure: numbered steps, the role performing each step, the system of record, and the artifact each step produces. The last requirement is the important one — this procedure has to leave a trail that project 09 can audit.

**7. One standard.** Write one short standard beneath one of the policies, containing the technical specifics you deliberately kept out of the policy. Show that the policy still reads correctly without it.

**8. Rollout note.** Half a page for Angela: who must review this set before approval and what each reviewer is checking, who approves, how staff will be made aware and how attestation will be recorded, and what the trigger conditions for off-cycle review are.

## Constraints

- **You draft; the Security Officer approves.** Every approver field names a role and is unsigned. Nothing in this set is in force.
- **No legal drafting.** Disciplinary consequences, monitoring and employee-privacy provisions, data retention periods, and breach-notification timelines are not yours. Mark each as a placeholder with a note naming who must supply it. At least three such placeholders should appear across the set.
- **Written for 210 people, two of whom are in IT.** A statement that would require a full-time person Cedar Hollow does not have is a statement that will be ignored. Where you write an obligation that is heavier than the current staffing supports, say so in the rollout note and name what it depends on.
- **Do not retrain technical controls.** These are policies, not implementation guides. "Multi-factor authentication must be enabled for all accounts with access to the electronic health record" is a policy statement; three paragraphs about authenticator types belong in your standard, briefly.
- **No copying a published policy from another organization.** Their obligations are not Cedar Hollow's.
- **Every statement traces somewhere.** A statement with no risk ID and no framework reference is either a missing mapping or a statement that should not exist. Decide which and act.

## Definition of done

- [ ] Selection rationale naming risk IDs from project 07 for each of the three policies
- [ ] Three complete policy documents with every required section present
- [ ] At least 24 numbered statements total; each uses a defined obligation word and carries one obligation
- [ ] At least 8 statements specify a number
- [ ] No product or vendor names in any policy body
- [ ] At least one explicit scope exclusion per policy
- [ ] Violation-test check sheet covering every statement, with the rewrite count reported
- [ ] Traceability table per policy: NIST CSF, HIPAA section, internal control ID, project 07 risk ID
- [ ] Column-wise gap statement after the tables
- [ ] One supporting procedure, with the artifact produced by each step named
- [ ] One standard, with the parent policy shown to read correctly without it
- [ ] At least three legal or HR placeholders, each naming who supplies it
- [ ] Rollout note covering reviewers, approver, awareness, attestation, and off-cycle triggers
- [ ] All approver fields unsigned; all documents marked draft

## Hints

**Pick the three by coverage, not by familiarity.** Look at your top five risks and ask which policies would touch the most of them. At Cedar Hollow, access control tends to reach the EHR accounts, the departed clinicians, the flat file server permissions, and remote access from home computers all at once — four risks, one document. Compare that against candidates like acceptable use, remote access, vendor and third-party security, and incident response before choosing.

**Write the traceability table before the statements, not after.** Start from the risks and the HIPAA sections, list what each obliges, and let the statements fall out. Drafting first and mapping afterwards produces statements that trace to nothing and gaps you do not notice.

**The `§164.308` administrative safeguards are where most of your rows will land**, because Cedar Hollow's problems are procedural far more than technical. Workforce security, information access management, security awareness and training, and the sanction policy are all in there. Do not spend your whole table in `§164.312`.

**Remember the addressable-versus-required structure.** Where a statement implements an addressable specification, your policy is making the organization's documented decision about it — which is exactly what "addressable" requires. Note that in the traceability table. It is a strong answer for the funder and a real one for an assessor.

**Watch for the double obligation.** "Accounts must be disabled on termination and equipment must be returned" is two statements. So is "access must be reviewed and revocations completed". Splitting them is what lets project 09 score them separately, and the second half is usually the one that fails.

**Write one statement you know Cedar Hollow currently violates.** You should — several, in fact. That is the point. Note them in the rollout note as day-one gaps with owners, rather than softening the statement to make the organization compliant on paper the moment the policy is signed. Writing the policy down to current practice is the single most common failure in this project.

**Your procedure should produce evidence at every step.** Ticket, export, signature, timestamp. When you write project 09 you will be looking for exactly these artifacts, and you will notice immediately if a step produces nothing.
