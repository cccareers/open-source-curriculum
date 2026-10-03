---
lesson_id: sn350-04
course_id: sn350
pathway: servicenow-implementation-specialist
title: Controls, Attestations, and Evidence
order: 4
kind: lesson
competency_ids:
  - D10-S1-C05
objectives:
  - Configure controls and attestations that produce audit-ready evidence on a schedule
---

## What "audit-ready" actually means

A control that everyone agrees is working produces nothing. A control that is *audit-ready* produces a record with five properties, and every configuration decision in this lesson exists to guarantee one of them:

- **Attributable.** A named person, not a group mailbox and not the system account, asserted something.
- **Dated.** The assertion is tied to a period, and the date it was made is not the date somebody backfilled it.
- **Specific.** It names what was examined, not "all systems."
- **Supported.** There is an artifact — an export, a screenshot, a ticket reference, a query result — attached to the assertion.
- **Reviewable.** Somebody other than the asserter looked at it, and that review is itself recorded.

Auditors do not fail organizations for having a control that failed. They fail organizations for being unable to demonstrate whether it operated. The distance between "we do review access quarterly" and "here are four dated, signed reviews with the account lists attached, one per quarter, reviewed by the control owner's manager" is the entire subject of this lesson.

## The control record and its lifecycle

A control is a control objective applied to one entity, and it carries the operational fields the objective could not: an owner, a state, a test frequency, the most recent result, and the links to the evidence produced.

The state model is roughly:

```text
Draft      -> being defined; not yet producing evidence
Attest     -> awaiting an attestation or test response for the current period
Monitor    -> attested and operating; indicators may be watching it continuously
Review     -> result received and awaiting reviewer sign-off, or due for periodic redesign
Retired    -> no longer applicable; history preserved
```

Two properties of that model matter more than the exact labels. First, **retired is not deleted**. A control that covered a decommissioned server still has to exist so that last year's evidence has something to hang from. Second, the state is driven by the test cycle, not set by hand. If practitioners are manually moving controls between states, the schedule is not configured, and the program will drift within two cycles.

Every control also carries an **effectiveness** or compliance result that rolls up. Roll-up is why control design has consequences far away from the control: an executive dashboard showing a policy as 94 percent compliant is computing that number from control results, and a control left in draft or with a null result is either dragging the number down or, worse, being silently excluded from it. Decide early how untested controls are treated in roll-up and document the decision, because the first executive who notices the discrepancy will ask.

### Designing a testable control

Before configuring anything, write four sentences about the control. If you cannot, the objective upstream is not ready.

1. **Population.** What exactly is being examined? "All accounts in the `Domain Admins` group on the in-scope directory" is a population. "Privileged access" is not.
2. **Test procedure.** What does the tester do, in enough detail that two testers get the same answer?
3. **Pass criterion.** What result counts as effective? Be explicit about tolerances: zero exceptions, or fewer than three exceptions all remediated within five business days.
4. **Evidence.** What artifact is attached, and who is capable of producing it?

That last question kills more controls than any other. A beautifully written control whose evidence can only be produced by one overloaded engineer is a control that will fail on availability rather than on substance.

## Attestations: asking a human on a schedule

An attestation is a questionnaire delivered to a named respondent on a schedule, with the response recorded against the control and the period. It is the platform's mechanism for the human half of control testing, and it is built on the same assessment engine used elsewhere on the platform, which means the pieces are familiar: a questionnaire made of questions with typed answers, a template, a schedule, and a respondent selection.

Configuring one well comes down to four decisions.

**Who is asked.** The control owner is the obvious answer and often the wrong one, because self-attestation by the person who operates the control is exactly the weakness auditors look for. Common patterns: the control owner attests and a second reviewer confirms; or the attestation goes to the asset owner while the control owner reviews. Where the respondent is derived from data — the assigned owner of the entity, say — derive it, so the attestation follows reality instead of a hard-coded name that left the company.

**What is asked.** Keep it short and answerable. A good attestation is three to six questions, most of them closed, with one free-text field for exceptions and a mandatory attachment when the answer is anything other than clean. Fifteen-question attestations get answered by pattern rather than by thought, and a pattern-answered attestation is negative evidence: it proves the organization is going through motions.

Question design that produces useful evidence:

```text
Q1 (choice)     Did you review the complete list of privileged accounts
                for this system for the period shown?      Yes / No
Q2 (attachment) Attach the account list you reviewed.       required when Q1 = Yes
Q3 (integer)    How many accounts were removed or downgraded as a result?
Q4 (text)       For any account retained that you would not grant today,
                state the account and the business justification.
Q5 (choice)     Do you confirm this response is complete and accurate?  Yes / No
```

Note what Q3 does. A quarterly review that always removes zero accounts is either a very tidy organization or a review nobody performed, and the number gives a reviewer and a later indicator something to notice.

**When it is asked.** Attestation frequency comes from the control objective, which got it from the policy statement, which got it from the citation. Do not invent frequencies. Two scheduling subtleties bite implementations: the **period** must be unambiguous (a Q1 attestation covers January through March, regardless of whether it is completed in April), and the **due date** must leave enough working time that respondents are not perpetually overdue. A due window shorter than the respondent's realistic turnaround manufactures a permanent overdue backlog and trains everyone to ignore the notifications.

**What happens on a bad answer.** An attestation that says "no" must produce something. The default and correct behavior is that it raises an issue, which is Lesson 9's subject. Configure it deliberately: which answers constitute failure, whether a partial failure fails the whole control, and who receives the resulting issue.

### Campaigns versus individual attestations

For a program of any size you do not schedule attestations one control at a time. You launch a **campaign**: all controls derived from a given objective, or all controls for a given entity type, attested in the same window with a common due date and a single progress view. Campaigns are what make a compliance calendar operable and give you one number to report — percent complete, with the laggards named. The mechanics of launching and chasing a campaign automatically belong to Flow Designer, and you will build exactly that in Lesson 8; here, configure the campaign definition and launch it manually so you understand what the automation is doing on your behalf.

## Design versus operation, and the sampling question

Auditors test controls two different ways, and a program that only supports one of them will be asked for the other at the worst moment.

**Test of design** asks whether the control, if performed exactly as written, would actually prevent or detect what it claims to. It is a one-time judgment, repeated when the control changes, and it is answered by reading the control definition and walking through it once. A control that requires the system owner to review access but gives them no way to see who has access fails a design test regardless of how diligently it is performed.

**Test of operating effectiveness** asks whether the control was actually performed, as designed, throughout the period. It is answered by evidence from every occurrence, or from a sample of them.

The platform supports both, but they configure differently. Design is a field and a review cycle on the control objective: a documented design conclusion, a date, and a reviewer, refreshed when the objective changes. Operation is the attestation and indicator machinery. Implementations that treat every control test as an operating test end up with controls that are diligently proven to perform a procedure that would not catch anything.

**Sampling** is the practical bridge. Where a control operates continuously or very frequently — every change approved, every new account provisioned — testing every occurrence is neither possible nor necessary, so the test examines a sample. Three configuration consequences:

- The **population** has to be defined and countable before the sample is drawn. "We reviewed 25 changes" means nothing without "out of 412 in the period."
- The **selection method** must be recorded. A sample the control owner chose is not a sample; it is a demonstration. Random or systematic selection, generated by the platform and recorded on the test, is defensible.
- The **sample size** follows the frequency and the risk, and it comes from the audit methodology rather than from convenience. Your job is to make the chosen size and its basis visible on the record.

Where the population is small enough, prefer testing all of it. An automated indicator over the complete population, which is what Lesson 7 builds, beats any sample — and being able to say "we tested 100 percent, continuously" is a materially stronger statement than "we tested 25 items in March."

## The compliance calendar

Attestations, control tests, and reviews all recur, and their combined schedule is a real artifact that has to be designed rather than emerging by accident. Two failure modes appear in every first implementation.

**Clustering.** Every quarterly control defaults to the same period boundaries, so all of them land on the last week of the quarter, which is also when the business is closing its books. Owners receive fifteen attestations in one week, answer them in one sitting, and the quality of every response drops. Stagger deliberately: not all quarterly controls need the same quarter start, and monthly controls can be spread across the month.

**Collision with the audit.** An audit engagement scoped to a period needs the evidence for that period to be complete. If your Q1 attestations are due 15 business days after quarter end and the auditor arrives on day 10, the evidence does not exist yet and the finding writes itself. Publish the calendar, share it with internal audit, and set due dates that leave a margin before the earliest plausible examination.

Maintain the calendar as data — frequencies and period definitions on the objectives, visible in one report — rather than as a spreadsheet somebody keeps. A calendar that only exists outside the platform will diverge from the schedules that are actually running, and the divergence is discovered by an auditor.

## Evidence that survives contact with an auditor

Evidence is attached to the attestation response, the control test result, or a dedicated evidence record depending on how the program is structured. What matters is less where it lives than that it satisfies the five properties at the top of this lesson. Practical rules:

**Attach the artifact, do not describe it.** "Reviewed in the admin console" is not evidence. An exported list with a timestamp is.

**Prefer artifacts the platform generates over artifacts a human assembles.** A saved report of accounts, run by a scheduled job and attached automatically, cannot be edited before submission. A spreadsheet a person built by hand can. Auditors weight these differently and so should you.

**Record the query, not just the result.** If the evidence is a query result, capture the query. A list of twelve accounts proves nothing unless the reviewer can see it was a list of all accounts.

**Never let evidence be the only copy.** Attachments on GRC records are a system of record for the program, not a replacement for the source system. If a source system's retention is 90 days and the citation demands seven years, the attachment is now the long-term record and its retention has to be designed accordingly.

**Set retention before go-live.** Retention is driven by the authority document. Write the retention period on the authority document record and derive downward, so that a program covering several obligations retains to the longest applicable period rather than to whichever the last person guessed.

### Worked example: the quarterly privileged access review

Continuing Northwind Health from Lesson 3, the objective is "quarterly privileged access review, directory-managed infrastructure."

- **Controls** generated one per in-scope server entity, owner derived from the CI's support group manager.
- **Attestation** on a quarterly schedule, period aligned to calendar quarters, due 15 business days after period end, respondent = entity owner, reviewer = compliance practitioner group.
- **Questions** as sketched above, with the account list attachment required.
- **Automatic evidence**: a scheduled report of current privileged group membership per server, generated on the first day of the attestation window and attached to the attestation as the population under review. The respondent reviews a list they did not compile, which is a materially stronger control than asking them to produce one.
- **Failure path**: any "no" on Q1 or Q5, or any Q4 entry left unjustified, raises an issue assigned to the compliance practitioner group.
- **Roll-up**: control effectiveness is set from the reviewed response, not from submission, so an unreviewed response does not read as a pass.

One design note worth internalizing: the strongest part of that configuration is not the questionnaire, it is the pre-attached population report. Where you can make the platform produce the evidence, the human is confirming rather than assembling, and the control gets both cheaper and more credible at the same time.

## Practice

Use a developer instance with Policy and Compliance Management available. Build on the policy and objective you created in Lesson 3 if you have them.

1. **Write the four sentences.** For one control objective, write the population, test procedure, pass criterion, and evidence artifact. Then have a peer (or your own second pass, a day later) try to execute the test procedure from the words alone and note every ambiguity they hit. Rewrite until there are none.

2. **Build an attestation.** Configure a questionnaire of no more than six questions for that control, including at least one required attachment and one numeric question whose answer would let a reviewer detect a rubber-stamped response. Attach it to a schedule with an explicit period definition and a due window you can defend.

3. **Run one cycle.** Trigger the attestation against at least two controls, respond as the intended respondent on one and deliberately fail the other, and follow what each produces: control state, stored result, and whatever the failing one raises. Write down what happened at each step, including anything that did *not* happen that you expected to.

4. **Evidence audit.** Take the evidence produced by your passing attestation and grade it against the five properties. For every property it does not satisfy, name the specific configuration change that would fix it. Then answer, in writing: if this instance were wiped and rebuilt from backup in three years, would this evidence still mean anything, and what would it depend on?

## Check your understanding

1. Name the five properties of audit-ready evidence.
2. Why ask "how many accounts were removed" in a quarterly access review attestation?
3. What is the difference between a test of design and a test of operating effectiveness?
4. Why pre-attach a platform-generated account list to the attestation?

*Answers:* (1) Attributable, dated, specific, supported, reviewable. (2) A review that always removes zero accounts may be a rubber stamp, and the number gives a reviewer something to notice. (3) Design asks whether the control, performed as written, would catch the problem; operation asks whether it was actually performed throughout the period. (4) The respondent confirms a list they did not compile, which is cheaper and more credible than asking them to assemble one.
