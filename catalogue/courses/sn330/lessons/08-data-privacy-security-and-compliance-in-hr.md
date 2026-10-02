---
lesson_id: sn330-08
course_id: sn330
pathway: servicenow-implementation-specialist
title: Data Privacy, Security, and Compliance in HR
order: 8
kind: lesson
competency_ids:
  - D4-S1-C04
  - D1-S1-C03
objectives:
  - Apply access controls and data-privacy practices that keep sensitive HR data restricted
---

## The stakes are different here

Every access-control lesson you have had until now was about correctness. This one is about consequence. An over-permissive ACL on an incident table means someone reads about a printer outage. An over-permissive ACL on an HR case table means an employee's colleague reads their harassment complaint, their disability accommodation, their disciplinary record, or their salary.

HR data routinely includes categories that data-protection regimes treat as special: health information, disability and accommodation records, union membership, ethnicity and diversity data collected for reporting, criminal-record checks, immigration status, and compensation. These are not "sensitive" as a matter of etiquette. In most jurisdictions the legal basis for processing them is narrower, the retention limits are tighter, and a breach is separately reportable.

So the working posture for an HRSD implementer is: **default to denial, separate by structure rather than by condition, and prove every access decision by testing it as the person, not as an administrator.**

This lesson also covers authentication, because access control that rests on a weak identity layer is theater. Knowing who someone is precedes deciding what they may see.

## Structure first: separation is the strongest control

Recall the architecture lesson: each COE has its own case table in its own scoped application. That structure is not an organizational nicety, it is the primary security control, and it is worth understanding why it beats the alternative.

Suppose all HR cases lived in one table and you restricted employee relations cases with a condition — "you may read this row unless its category is employee relations." That control has to be correct in every ACL, every list view, every report, every export, every related list, and every script that queries the table with an elevated context. One missed path leaks. Worse, the leak is usually invisible: nobody notices they can see something they should not until it matters.

Separate tables invert the default. An HR agent with no role on the employee relations table cannot read those rows through *any* path — list, search, report, related list, or scripted query in a user context. There is nothing to get right on each occasion, because the denial is structural.

The practical rule: **when a population must never see a category of case, give that category its own table in its own scope.** Use conditions only to narrow access *within* a population that already has legitimate access to the table.

Restricted caller access, which governs whether code in one scope may reach data in another, is the enforcement mechanism at the code level. Grant those privileges deliberately and review them. A broadly granted cross-scope privilege quietly re-creates the shared-table problem you paid for the structure to avoid.

## The role model

HRSD ships a layered role model, and using it as intended saves an enormous amount of custom ACL work.

**A basic HR role** is held by anyone who interacts with the HR applications beyond pure self-service — it grants the ability to see HR-related UI, not to read cases.

**Reader and writer roles per COE** grant list and read access, and create/update access, on that COE's case table. This is the workhorse pair. An agent in HR shared services holds the shared services writer role and nothing on employee relations.

**Administrative roles per application** grant configuration rights over the COE's own configuration records — templates, services, criteria — without granting platform administration.

**A profile-reading role** governs who may read HR profile data at all, separately from case access.

Design guidance:

**Grant roles through groups, never directly to users.** Group membership is auditable, reviewable, and removable in one action when someone changes job. Direct role grants are how an implementation ends up with fourteen people who have employee relations access and no record of why.

**One group per team and function, not one group for "HR".** A single "HR Users" group that carries every COE role is the most common real-world failure, and it is usually created during implementation "just to get testing done."

**Manager access is not an HR role.** Managers legitimately need to see *some* things about *their own* reports — an onboarding case they are participating in, the status of a request they submitted. That is expressed as a condition on a specific table for a specific relationship, not as a role that grants a manager access to HR cases generally. Be extremely precise about this requirement, because "managers should be able to see their team's cases" from a stakeholder almost always means something much narrower than it sounds, and implementing it literally is a breach waiting to happen.

**Nobody gets platform administrator to do their HR job.** If an HR configuration task requires the admin role, the role model is wrong.

## Access control lists on HR data

Within a table the population may reach, ACLs do the fine-grained work. The rules of the platform's ACL engine apply unchanged; what is HR-specific is which conditions you write.

Remember the evaluation model: an operation on a field requires the field-level ACL *and* the table-level ACL to permit it; the most specific matching rule applies; and a rule grants only if its roles, its condition, and its script all pass. Access is additive across matching rules at the same specificity but the absence of any permitting rule is a denial. Design toward "there is exactly one rule that grants this, and I can name it."

The conditions that recur in HR:

**Subject-person self-access.** An employee may read a case where they are the subject. Note carefully: read, on a defined field set — not write, and not on every field. An employee should not be able to read the internal work notes on their own employee relations case.

**Requester access.** The person who opened a case can see the case they opened, which is not the same rule as subject access and can differ when a manager opens a case for a report.

**Assignment access.** The assigned agent and members of the assignment group can work the case. Where a case moves between groups, decide whether the previous group retains read access; usually it should not.

**Participation access.** Someone assigned an *HR task* on a case needs the task, and only the task. This is how a facilities coordinator completes a desk request without ever reading the HR case it came from. If your design requires them to read the case, redesign it.

**Field-level restriction.** Even inside a table its population may read, some fields deserve their own rules — compensation figures, national identifiers, medical detail, disciplinary outcome. Write field ACLs for these explicitly. A common pattern is that the writer role can read the case but only a smaller role can read the sensitive field group.

**Attachments.** Attachments carry the most sensitive content in most HR implementations — medical certificates, legal correspondence, identity documents — and they have their own access model. Do not assume that restricting the case restricts its attachments; verify it, on a real record, as a real user.

A discipline worth adopting: for every ACL you write, write down in its description *which requirement it satisfies*. Six months later, the question is never "what does this rule do" but "may I safely delete it," and only the requirement answers that.

## Authentication: who is this person?

Access control assumes identity. Three decisions define the identity layer of an HRSD implementation.

**Federate employee authentication.** Employees should reach the Employee Center through the organization's identity provider using SAML or OpenID Connect single sign-on, not through instance-local passwords. This matters for HR specifically because it means an employee's access dies when their corporate identity is disabled — which is the offboarding control from lesson 6 actually working. Local accounts survive offboarding unless someone remembers to disable them, and someone will not.

**Require stronger authentication for HR agents.** The population that can read thousands of employees' HR records should be subject to multi-factor authentication, and where the platform supports adaptive controls, to policies that consider network location and device. The general employee population needs single sign-on; the agent population needs single sign-on plus a second factor.

**Govern the non-human identities.** The HRIS integration account in the next lesson is an identity too, and it is usually the most powerful one in the implementation. It should be a dedicated service account with only the roles the integration needs, credentials stored in the platform's credential store rather than in a script, no interactive login, and a rotation schedule. An integration account with the admin role is the most common serious finding in an HRSD security review.

Two supporting practices: keep a small, named, monitored set of break-glass local administrator accounts for the day federation fails, and make sure the pre-hire access approach from lesson 6 has an expiry. Temporary access that nobody expires is permanent access.

## Data-privacy practices beyond access control

Access control answers "who may read this." Privacy asks three further questions.

**Should we hold this at all?** Data minimization is the cheapest privacy control there is: a field you did not collect cannot leak. Challenge intake forms that ask for a national identifier, a date of birth, or a medical diagnosis when the process does not need it. A leave request needs dates and a category; it rarely needs a diagnosis, and where a medical certificate is required, it should be an attachment on a restricted record rather than free text in a description field that will be quoted into an email.

**Where does it end up?** Sensitive data leaks through the side channels far more often than through the front door. Audit these:

- *Notification bodies*, which is why lesson 7 insisted on linking rather than restating.
- *Reports and dashboards*, especially exports and scheduled report emails.
- *Lower environments.* A production clone into development hands every developer the entire employee population's HR data. Sensitive data must be masked or scrambled on clone; this is a configuration decision made before the first clone, not after.
- *Attachments*, as above.
- *Free-text fields*, where agents paste things no schema anticipated.

**How long do we keep it?** Retention is a real requirement, not an aspiration. Different categories have different periods — recruitment records, disciplinary records, and payroll-adjacent records often differ, and they differ by jurisdiction. Implement retention as a scheduled process that acts on a documented policy, and make the policy visible in the implementation rather than in a document nobody reads. Where erasure is required by law on request, know in advance which tables hold personal data for a given person, because assembling that list under a thirty-day deadline is miserable.

**Prove what happened.** Enable auditing on the sensitive tables and fields so that changes are attributable. Where the platform can record read access to particularly sensitive records, use it for the most restricted COEs — knowing who *looked* is the control that matters for investigation records, where the risk is a curious insider rather than an external attacker. Review those logs on a schedule; an unexamined log is evidence after the fact, not a control.

Finally, **geography**. Multinational implementations run into data-residency and cross-border transfer requirements. The controls available range from instance location to domain separation for genuinely separate legal entities. You are unlikely to decide this alone, but you must know to raise it during design, because it is architectural and cannot be retrofitted cheaply.

## Access reviews and drift

Access models are correct on go-live day and wrong eighteen months later, because people move. The agent who covered employee relations for three months during a vacancy keeps the role for four years. The implementation partner's test accounts are still active. The "temporary" group created to unblock testing has nine members.

Two configured practices contain this.

**Periodic access review.** On a schedule — quarterly for the most restricted COEs, annually for the rest — generate the list of who holds each HR role and route it to the role's owner for confirmation. What matters is that the owner has to affirmatively confirm each person rather than ignore a report. Remove anyone not confirmed.

**Leaver and mover triggers.** Offboarding should remove HR roles as part of the lifecycle event, and an internal transfer should trigger a review of the roles the person held in their old job. This is the transfer lifecycle event doing security work, and it is far more reliable than a quarterly review, because it fires on the event that caused the problem.

Alongside these, keep the population of privileged accounts small and reviewed: platform administrators, HR administrators, and the integration service accounts. A short, current list of who can see everything is one of the few security artifacts an auditor will ask for by name.

## Compliance obligations and how they land in configuration

You are not the organization's privacy lawyer, and you should not pretend to be. But you are the person who turns a legal obligation into a working control, and knowing the shape of the common obligations lets you ask the right questions during design.

**Lawful basis and purpose limitation.** Data collected for one purpose should not quietly be used for another. In configuration this mostly means: do not build a report or an integration that repurposes sensitive data without asking whether the purpose is covered. Diversity data collected for aggregate reporting must not become a field an agent can see on a case.

**Subject access.** An employee may be entitled to a copy of the personal data held about them. In practice this means someone must be able to find every record about a person across HR cases, tasks, profiles, attachments, and audit history. Design an implementation where that is a query, not an archaeology project.

**Erasure and rectification.** Correction is straightforward; erasure is not, because HR data frequently must be retained for other legal reasons. The realistic implementation answer is anonymization of what can be anonymized, with a documented list of what is retained and why.

**Breach notification.** Regimes commonly require notification within a tight window. That window is the reason auditing and access logging matter: the questions asked in an incident are what was accessed, by whom, and when, and the answer must be available in hours.

**Sector and regional overlays.** Health-adjacent data, financial-sector background screening, works-council consultation requirements in parts of Europe, and country-specific employment-records legislation all add constraints. Ask early which apply; several of them constrain *architecture*, not just configuration.

The implementer's professional obligation here is narrow and firm: **raise these in design, get the answers in writing from someone accountable, and build to the answer.** Do not decide a retention period yourself, and do not let a project silently defer the question — a deferred privacy decision becomes an unowned one.

## Testing: the access matrix

Security you have not tested as the affected user is a hypothesis. Build an access matrix and run it every release.

Rows are personas: employee (self), employee (someone else's record), people manager (own report), people manager (not their report), HR shared services agent, employee relations agent, total rewards agent, HR administrator, facilities coordinator with an assigned task, integration service account, and an inactive former employee.

Columns are objects: their own HR case, another employee's HR case in the general COE, an employee relations case, a total rewards case, the HR profile of another employee, a sensitive field group, an attachment on a restricted case, a manager-only knowledge article, and a report over the case tables.

Fill in the expected value for every cell **before** testing. Then test with impersonation and fill in the actual. Every divergence is a finding; the ones where actual is more permissive than expected are the ones that stop a release.

Test the paths, not just the form. A denial on the form means nothing if the record is readable through a list, a report, global search, a related list on another record, or an export. Check at least list, search, and report for anything you believe is restricted.

And test the negative side of offboarding: disable a test user in the identity provider and confirm they can no longer reach the portal at all.

## Practice

Work in a development instance with at least two HR COEs configured and a set of test users covering the personas above. Do not use the admin account for any verification step.

1. **Write the access requirements down first.** For your implementation, produce a short statement of who may read each COE's cases, who may read HR profiles, and what a manager may see about a direct report. Get it to one page. Every ACL you write afterward must trace to a line in it.

2. **Build the group and role model.** Create groups for at least three teams and grant COE roles through those groups only. Verify with a report or list that no user in your test set holds an HR role granted directly.

3. **Prove structural separation.** As an HR shared services agent, attempt to reach an employee relations case five ways: direct URL, list view, global search, a report over HR tables, and a related list from the subject person's record. All five must fail. Record the result of each; if any succeeded, fix it before continuing.

4. **Implement self-access and prove its limits.** Write the ACL that lets an employee read their own case in the portal. Then confirm, as that employee, that they can read the employee-facing comments and cannot read the work notes. Note which rule produced each outcome.

5. **Restrict a field group.** Choose a sensitive field on an HR case or profile — compensation is a good choice — and write field-level ACLs so that agents who can read the record cannot read that field. Verify as an agent, and verify that the field is also absent from a list view and from an export.

6. **Test attachments specifically.** Attach a document to a restricted case and attempt to retrieve it as a user who cannot read the case. Record what happened. If the attachment was reachable, describe the control you added.

7. **Run the full access matrix.** Build the matrix described above with your own personas and objects, predict every cell, test every cell by impersonation, and report the divergences. Include at least one cell you expected to fail and that passed, or explain how you satisfied yourself there were none.

8. **Design the authentication layer.** In a page or less, specify: the authentication method for employees, the additional controls for HR agents, the configuration of the HRIS integration account, and the break-glass arrangement. For each, state what it protects against. Then identify one thing in your current instance that violates your own specification.

9. **Audit the side channels.** Review your notifications, one report, and your instance-clone configuration for sensitive-data exposure. List every place sensitive HR data could leave the restricted population, and state the fix for each.

10. **Write a retention position.** Choose two categories of HR record from your build and state a retention period, the trigger that starts the clock, and how you would implement the deletion or anonymization. Note explicitly what you would need a legal or HR stakeholder to confirm.
