---
lesson_id: sn350-02
course_id: sn350
pathway: servicenow-implementation-specialist
title: Governance, Risk, and Compliance on the Platform
order: 2
kind: lesson
competency_ids:
  - D10-S1-C05
objectives:
  - Explain what an integrated risk management program does and which platform applications support it
---

## Three questions a GRC program answers

Strip away the acronyms and a governance, risk, and compliance program exists to answer three questions on demand, for anyone with standing to ask:

1. **What are we obliged to do?** Which laws, regulations, contracts, standards, and internal policies apply to us, and what specifically do they require.
2. **What could go wrong?** Which uncertainties could stop us meeting an objective or an obligation, how bad would that be, and who owns doing something about it.
3. **Can we prove any of this?** Not "do we believe we are compliant," but "can we hand a skeptical outsider a dated, attributable record showing the control operated as designed."

Governance is the first question plus the decision rights around it. Risk is the second. Compliance is the third. The word *integrated* in Integrated Risk Management is the claim that these should not be three separate spreadsheets owned by three separate teams who discover each other's existence during an audit. They share the same organizational structure, the same asset inventory, the same people, and very often the same evidence. A control that proves you meet a regulatory citation is frequently the same control that mitigates an operational risk. Integration means recording that fact once.

This is why GRC lands on a platform like ServiceNow rather than in a dedicated point tool. The platform already knows the organization: the CMDB knows the services and the assets, the user tables know the people and the groups, ITSM knows the changes and the incidents. A control that says "privileged access is reviewed quarterly" needs to know which systems have privileged access, and that answer already lives in the CMDB. A risk that says "unplanned change causes customer-facing outage" wants to be evidenced by change records that already exist. GRC on the platform is largely the work of connecting an obligation model to data the platform already holds.

## What sits inside Integrated Risk Management

Integrated Risk Management is a product family, not a single application. The pieces this course covers:

**Policy and Compliance Management** is the obligation side. It holds authority documents (the external or internal source of a requirement), citations (the individual requirements inside them), policies and policy statements (your organization's response), control objectives, and controls (a policy statement applied to something specific). It is where the answer to "what are we obliged to do, and can we prove we do it" is modeled. Lessons 3 and 4 live here.

**Risk Management** is the uncertainty side. It holds risk statements (a library of things that could go wrong), risks (a statement applied to something specific, with an owner and a score), assessment methodologies, risk responses, and risk acceptances. Lesson 5 lives here.

**Audit Management** is the assurance side. It holds audit engagements, audit scoping, audit tasks, working papers, evidence requests, and findings. It is deliberately a lighter presence in this course, at supporting depth in Lesson 9, because the implementation work is mostly configuration of an engagement lifecycle rather than a new data model.

Underneath all three sits a shared **GRC core**. This is the part that surprises people who expect three unrelated applications. Entities and entity types (the "what is this about" layer), issues, indicators, attestations, and the task framework are common services. A failed compliance control and a failed risk indicator both raise the same kind of issue record. An attestation questionnaire is the same machinery whether the respondent is confirming a control operates or confirming a risk assessment is still valid. When you learn the core once, you have learned three-quarters of every IRM application, including ones this course does not cover.

Those uncovered ones are real and you should know they exist so you do not accidentally promise them: Vendor Risk Management, Business Continuity Management, Operational Resilience, and Privacy Management are separate applications in the same family. They are **out of scope here**. If a stakeholder asks for third-party risk questionnaires or a business impact analysis, that is a different implementation with its own hours, and saying so early is part of the job.

## The shared core, table by table

You do not need to memorize table names, but you do need to recognize the shape, because almost every configuration decision you make in this course is really a decision about one of these:

```text
Entity / Profile      the thing an obligation or a risk is about
Entity Type           a filtered population of entities (e.g. "PCI-scoped servers")
Content               the obligation text: authority documents, citations
Policy / Statement    the organization's stated response
Control Objective     what good looks like, independent of who does it
Control               objective + entity, owned, tested, with a state
Risk Statement        a reusable "what could go wrong"
Risk                  statement + entity, owned, scored
Indicator             an automated or manual test that returns pass or fail
Attestation           a questionnaire sent to a person on a schedule
Issue                 something failed; here is the remediation
```

Read that list top to bottom and you have the spine of the course. Lessons 3 through 5 build the model. Lesson 6 makes the entity layer real using the CMDB. Lesson 7 tests it continuously. Lesson 8 automates the human loops. Lesson 9 handles failure. Lesson 10 reports on all of it.

The single most important structural idea is the **template-plus-scope pattern**, and it repeats everywhere. You never author a hundred controls by hand. You author one control objective and point it at an entity type that resolves to a hundred entities, and the application generates a hundred controls. You author one risk statement and scope it to a class of services. You author one indicator template and attach it to every control derived from a given objective. If you find yourself hand-creating records in bulk during an implementation, you have almost certainly missed the template.

## Where a GRC deployment meets governance and security standards

A GRC implementation is held to the standards it is built to enforce, and reviewers notice when it is not. Aligning the deployment itself to enterprise governance and security policy is a real design activity, not paperwork. Five areas matter most.

**Data sensitivity.** GRC data is among the most sensitive on the platform. A risk register is a curated list of the organization's weakest points with severity ratings attached. Audit findings name systems and sometimes people. Policy exceptions are effectively a list of where the rules are currently not being followed and until when. Default table access is never the right answer. Plan roles before you plan records: separate administrators from practitioners, practitioners from read-only consumers, and internal audit from everybody, because audit independence is compromised the moment an auditor can edit the control they are testing. The platform ships role families along the lines of a GRC administrator, per-application administrator and user roles, and reader roles; your job is to map them to real groups and to justify each mapping in writing.

**Separation of duties.** The person who owns a control should not be the sole person who attests that it works, and neither of them should be the person who closes the resulting issue unverified. This is a configuration decision expressed through group membership, assignment rules, and approval steps, and it is the first thing an external auditor tests about your GRC tool itself.

**Change control on the configuration.** GRC configuration is application configuration and belongs in the same promotion discipline as anything else you build: developed in a sub-production instance, captured in update sets or a scoped application, reviewed, and promoted. Content is the tricky part. Authority document libraries, citation trees, and policy text are *data*, not configuration, and they do not travel in an update set by default. Decide deliberately, per record type, whether it is promoted, imported, or authored directly in production under a documented approval, and write that decision down. "We hand-typed the citation tree into production" is an audit finding waiting to happen.

**Scoping and integration boundaries.** IRM applications are scoped applications. Cross-scope access is explicit, which is a feature: it forces you to declare when a global business rule reaches into risk data. When you integrate an external evidence source or a third-party scanning tool, that integration gets an account, a role, and a documented scope, not the administrator role and a shrug.

**Retention and traceability.** Evidence has a required retention period, usually set by the authority document rather than by your storage preferences. Deleting an attestation response because the table got large is a compliance failure. Design for retention up front: attachments, audit history on key tables, and a documented archive strategy.

### The operating model behind the roles

Access design goes wrong when it is derived from the tool's role list instead of from how the organization actually divides accountability. The common structure separates three kinds of responsibility, and mapping it to groups early makes every later decision easier:

- **The people who own and operate the thing.** Service owners, application owners, infrastructure teams. They own controls, answer attestations, and fix issues. In the tool they need to see and act on their own records and very little else. They are also the largest population and the least interested in GRC, which is why deriving their assignments from data rather than asking them to self-serve matters so much.
- **The people who design and oversee the program.** The compliance and risk practitioners. They author policies, objectives, statements, and frameworks, review responses, and chase. They need broad read and targeted write.
- **The people who provide independent assurance.** Internal audit. They need broad read and write access only to their own engagement records. Their independence is a configuration property, and Lesson 9 returns to it.

Two consequences worth designing for immediately. First, the largest user population never logs in voluntarily — their entire experience is a task or an attestation arriving in a queue they already watch, which is an argument for integrating GRC work into the platform's existing task surfaces rather than sending people to a separate application. Second, the practitioner group is small and will become a bottleneck if every routine decision routes through them; identify early which approvals genuinely need them and which can be delegated to the owning function.

### A worked framing example

Northwind Health, a mid-size healthcare payer, asks you to implement GRC. Their obligations: a financial reporting regime driving IT general controls, an information security standard their largest customer requires by contract, and an internal acceptable-use and access policy set the CISO already wrote. They have three previous attempts living in spreadsheets and a well-maintained CMDB covering their revenue-generating services.

The right first-pass reading:

- The financial reporting regime and the security standard become **authority documents**, loaded as content, with their requirements as **citations**. You are not teaching anyone the regime; you are loading it.
- The CISO's existing documents become **policies** with **policy statements**. They already exist in Word; the implementation work is structuring them so a statement can be mapped to citations from both authority documents at once. That mapping is where the "integrated" savings appear: one access review control satisfies two obligations.
- "What could go wrong" is initially empty, and that is normal. Risk arrives in Lesson 5 after there is something concrete to hang it on.
- The CMDB gives you the **entity** layer. Their revenue services are already modeled, so control scoping can be driven by a filter rather than by a manual list.
- Their three spreadsheets are a migration question, not a design question. Treat them as evidence of what the organization already believes about its controls, and reconcile rather than import blindly.

Notice what is not in that reading: no framework training, no promise of vendor risk, and no assumption that a control exists just because a policy says it should.

## Sequencing a first implementation

Order the work so that each stage produces something the next stage can point at.

1. **Roles, groups, and scope decisions first.** Cheap to do early, expensive to retrofit after records exist.
2. **Entity model second, even if roughly.** Everything attaches to entities; a placeholder is better than nothing.
3. **Compliance model third.** Authority documents, citations, policies, statements, objectives.
4. **Controls and attestations fourth.** This is the first point at which the program produces evidence, and it is the first thing a sponsor will ask to see.
5. **Risk fifth.** Once there are controls, risk mitigation has something to reference.
6. **Indicators, automation, issues, reporting.** The operating layer.

Resist the very common request to start with the executive dashboard. A dashboard built before there is a data model shows fabricated numbers to the people least able to detect that they are fabricated, and it sets an expectation of maturity the program has not earned.

## Practice

Work these against a personal developer instance with the IRM applications available, or on paper if you do not have one yet. The deliverable is a written plan, not records.

1. **Application mapping.** For Northwind Health as described above, write a one-page mapping table with three columns: the obligation or need in the sponsor's own words, the IRM application that serves it, and the core record type where it will live. Include at least two rows that you explicitly mark out of scope, and say why.

2. **Role and access design.** Draft a role-to-group mapping for Northwind covering, at minimum: a GRC administrator, a compliance practitioner, a risk owner population, an internal auditor, and an executive read-only consumer. For each, state one thing that role must be able to do and one thing it must be prevented from doing. Then name the specific separation-of-duties conflict you consider most likely at this organization and the configuration that prevents it.

3. **Promotion plan.** List every category of GRC record you expect to create in the next three months and classify each as configuration (travels in an update set or scoped application), content (imported or loaded, with a documented source), or operational data (created in production by users). Flag any category where you are unsure, and write the question you would ask the customer to resolve it.

4. **Push back on a request.** The sponsor asks for a "vendor risk score for our top fifty suppliers" in the same 40 hours. Write a three-sentence response that states what is in scope, names the application that would actually be required, and offers a concrete next step that does not commit the current project.

## Check your understanding

1. Which IRM application holds authority documents and controls, which holds risk statements and acceptances, and which holds engagements and working papers?
2. A stakeholder asks for third-party questionnaires in this project. What do you say?
3. Why should internal auditors not be able to edit the controls they test?
4. Why is building the executive dashboard first a mistake?

*Answers:* (1) Policy and Compliance Management; Risk Management; Audit Management. (2) That is Vendor Risk Management, a separate application and implementation; name it and offer a next step without committing the current scope. (3) Audit independence is compromised the moment an auditor can edit what they test. (4) It shows fabricated numbers before a data model exists and sets an expectation of maturity the program has not earned.
