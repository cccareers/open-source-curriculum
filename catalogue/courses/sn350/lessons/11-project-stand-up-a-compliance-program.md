---
lesson_id: sn350-11
course_id: sn350
pathway: servicenow-implementation-specialist
title: "Project: Stand Up a Compliance Program"
order: 11
kind: project
competency_ids:
  - D10-S1-C05
  - D9-S1-C01
objectives: []
---

## Goal

Stand up a small but complete compliance program on a single instance, from an obligation nobody has modeled yet to a dashboard an executive could read, and demonstrate that it operates.

Complete means every link in the chain exists and connects: an authority document with citations, a policy with statements mapped to those citations, control objectives scoped to a real entity population, generated controls with owners, one attestation cycle that produced evidence, one automated indicator, one issue that was raised, remediated, and independently verified, and a dashboard whose access is restricted correctly. Small means one obligation and one entity population. You are being assessed on whether the chain holds under questioning, not on volume.

## Scenario

Meridian Logistics is a regional freight company with roughly 900 employees. Their largest customer has imposed an information security addendum as a contractual condition of renewal, and the customer's audit team will test compliance in six months. Meridian has never run a formal compliance program.

What they have: a reasonably maintained CMDB covering their production estate, ITSM in daily use, a security manager who has written several internal policies in a document repository, and a spreadsheet of "controls" assembled last year by a departed consultant.

What they need first, per the security manager: demonstrable control over privileged access to the systems supporting the customer's freight-tracking service, because that is the clause the customer's auditors have already said they will test.

Invent whatever additional detail you need, and write down what you invented.

## Requirements

**1. Model the obligation.**
Create an authority document representing the customer security addendum, with at least six citations, of which at least two are children of another. Load it by import with a transform map rather than by hand, and prove afterwards that no citation's parent failed to resolve.

**2. Write the organization's response.**
Create one policy with at least four policy statements. Each must be a single assertion, written so that a test is obvious. Map every statement to at least one citation, and leave at least one citation deliberately unmapped with a written justification for why it is out of scope.

**3. Define scope from the CMDB.**
Build one entity type as a dynamic filter resolving to the population supporting the freight-tracking service. Reconcile the generated population against the list you assert the business would give you, and record every difference as either a CMDB defect or a scoping misunderstanding. Before going further, run a scoping health check and fix, or explicitly accept with a reason, every entity that has no derivable owner.

**4. Generate controls.**
Create at least two control objectives from your statements and scope them to the entity type so controls are generated rather than hand-created. Every control must have a derived owner and follow a stated naming convention.

**5. Produce evidence on a schedule.**
Configure one attestation for one control objective: no more than six questions, at least one required attachment, and at least one numeric question capable of exposing a rubber-stamped response. Run one cycle against at least three controls. Answer at least one honestly-passing and one failing.

**6. Monitor continuously.**
Build one automated indicator with a staleness guard that returns unknown rather than pass when its source data is missing. Attach it to the controls from one objective and configure it to raise an issue only after two consecutive failures.

**7. Automate one human loop.**
Implement one scheduled flow with an idempotency guard: either the policy review sweep or the attestation campaign launch with its respondent pre-check. Prove the guard by running it twice and showing the second run creates nothing. Give it an explicit failure path that a human would actually see.

**8. Close the loop.**
Force a failure, and take the resulting issue through triage, root cause classification, at least one tactical and one systemic remediation task, independent verification, and closure with evidence attached. The tactical fix must be verified by the indicator passing, not by an assertion.

**9. Report it.**
Build one dashboard with at least four widgets: at least two operational widgets filtered dynamically to the logged-in user, and at least two executive widgets, one of which shows a percentage with its denominator and untested items counted separately from failed ones. Run the row-count diagnostic on your heaviest widget before publishing.

**10. Secure it.**
Implement one query-time restriction with a deny-by-default branch, then open the dashboard as four different personas: administrator, compliance practitioner, a control owner belonging to one group, and a user with no group membership. Record what each sees.

## Constraints

- **Scope discipline.** Policy and Compliance Management and Risk Management only, with Audit Management at supporting depth. Vendor risk, business continuity, operational resilience, and privacy are out of scope. If the scenario tempts you toward them, write down the temptation and decline it.
- **Release-neutral.** Describe capabilities by their current product names. Do not pin your design to a named family release.
- **No framework teaching.** The authority document is data. Do not produce training material about the standard it represents.
- **Template-plus-scope, always.** No hand-created controls. If you created records in bulk by hand, you missed a template and the requirement is not met.
- **Everything traces upward.** Every control reaches a control objective, a policy statement, and a citation. Any record that cannot be traced is a defect.
- **Nothing is deleted.** Superseded and retired records are retired, not removed.
- **Evidence is attached, not described.** An assertion that a review happened is not evidence.
- **No hard-coded people.** Owners, respondents, and approvers are derived from data. A named person in a filter is a defect.
- **Time box.** Roughly two hours of build on top of the work you already have from Lessons 3 through 10. Reuse aggressively; this project is an integration exercise, not a rebuild.

## Definition of done

You are done when all of the following are true and you can demonstrate each one live:

- [ ] The authority document loads with a correct citation hierarchy and the orphan check returns zero.
- [ ] Every policy statement maps to at least one citation, and one citation is unmapped with a written reason.
- [ ] The entity type is a filter, not a list, and its reconciliation against the business list is documented difference by difference.
- [ ] Every entity in scope has a derivable owner, or its absence is explicitly accepted in writing.
- [ ] Controls were generated, not typed, and every control traces upward to a citation in at most three hops.
- [ ] One attestation cycle completed with at least three responses, at least one attachment, and at least one failure.
- [ ] The indicator returns unknown when its source data is emptied, and raises exactly one issue after two consecutive failures — not two issues, not zero.
- [ ] The scheduled flow is idempotent on a second run, and its failure path produces something a human sees.
- [ ] One issue is closed with a classified root cause, both a tactical and a systemic task, verification by indicator, and attached evidence.
- [ ] The dashboard's operational widgets show different content to two different test users without any per-user report copies existing.
- [ ] A user with no group membership sees nothing on the restricted table rather than everything.
- [ ] The heaviest widget's row count is recorded, and any widget above the threshold has been moved to collected scores or narrowed.
- [ ] A short handover note exists listing: what you invented about Meridian, every scope decision and its justification, every entity type filter and the agreement behind it, and the promotion classification (configuration, content, or operational data) of every record type you created.

## Hints

- **Build the entity type before the controls.** Everything downstream inherits the scope, and rescoping after generation is the most expensive mistake available in this project.
- **Write the four sentences first.** Population, test procedure, pass criterion, evidence artifact. If you cannot write them for a control objective, do not configure it yet.
- **Make the platform produce the evidence.** A pre-attached population report turns the respondent from an assembler into a confirmer, and it is the single highest-value hour in this project.
- **Break your own indicator before you trust it.** Empty the source table. If the result is pass, you have built a control that reports success when it is blind.
- **Guard every sweep in the query, not in a script step.** The condition "and no open task exists" belongs where a reviewer can see it on the flow's face.
- **One issue per problem.** Test the reuse branch by failing three times, not once.
- **Test as a low-privilege user early.** Access surprises found at the end mean rebuilding widgets; found at the start, they are a filter change.
- **Show the denominator everywhere.** The first executive question about any percentage is "out of how many," and the second is "what is untested."
- **When you are tempted to add a fifth objective, add a second test user instead.** Depth of proof beats breadth of records, and the demonstration is what is being assessed.
