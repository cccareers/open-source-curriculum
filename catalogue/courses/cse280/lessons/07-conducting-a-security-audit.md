---
lesson_id: cse280-07
course_id: cse280
pathway: cloud-support-engineer
title: Conducting a Security Audit and Remediating Findings
order: 7
kind: lesson
competency_ids:
  - D7-S1-C02
objectives:
  - Conduct a periodic security audit and drive its findings to remediation
---

## Switching seats

Everything so far has been about building. This lesson is about inspecting, and the change is more than a change of activity — it is a change of stance. When you build, your instinct is to make things work. When you audit, your instinct has to become: *how would I demonstrate that this is not true?*

That stance is learnable, and the fastest way to learn it is to audit something you built yourself and find three things wrong with it.

A quick separation of terms, because they are used loosely and mean different things to the people who commission them:

- A **vulnerability scan** looks for known weaknesses in software: unpatched versions, known-bad configurations. Automated, continuous, cheap.
- A **penetration test** is an authorized attempt to break in. It answers "could an attacker achieve this?" and is performed by specialists under a scope agreement.
- A **security audit** checks the environment against a defined set of criteria and produces findings with evidence. It answers "does this match what we said we do?"
- **Continuous monitoring** is the automated, ongoing version of an audit's mechanical checks.
- An **external audit** is the same activity performed by an independent party whose opinion carries weight with third parties.

This lesson is about the third one, performed internally, by you, on a periodic cadence. It is the control that catches the drift between the controls you mapped in lesson 04 and what is actually running. Note the practical relationship: a good internal audit is a rehearsal. Everything you find and fix before the external auditor arrives is a finding that never appears in a report a customer reads.

## Scoping: the part that decides whether the audit is useful

An unscoped audit produces either a hundred trivial observations or a vague sense of unease. Four decisions, made and written down before you look at anything.

**Criteria.** What are you auditing *against*? This must be a specific, existing document: your control mapping from lesson 04, a benchmark such as the CIS Benchmarks for your provider, your own written policies, or a customer's security addendum. "General good practice" is not criteria, because it makes every finding arguable. The criteria set is what turns your opinion into a measurement.

**Scope.** Which accounts, which regions, which workloads, which identities. Be explicit about exclusions too, and say why — "the sandbox account is excluded because it holds no customer data, verified by tag query on `data-classification`" is a scope statement an auditor can accept. "We didn't look at sandbox" is not.

**Period.** For anything about operation over time — reviews performed, patches applied, alerts responded to — you need a defined window. Point-in-time configuration checks are as of the audit date; period checks cover the window.

**Method and sampling.** Some checks run against the whole population; a script can evaluate every security group. Others sample, because you are not reading two thousand tickets. State the sample size and how you selected it. **Random selection matters** — if you sample the three offboardings you remember going smoothly, you have measured nothing. Pick with a method you can describe.

The scope statement, written before the work:

```text
AUDIT SCOPE — INT-2026-Q3-PROD
Criteria:    Internal control mapping v4 (controls ACC-01..09, NET-01..05,
             DATA-01..06, BCP-01..04); CIS Benchmark for the provider, level 1
Scope:       Production accounts prod-app and prod-data, all regions.
             Excluded: sandbox (no customer data — verified by tag query),
             corporate IT (owned by IT, audited separately)
Period:      2026-04-01 to 2026-06-30 for operational controls;
             configuration as at 2026-07-06
Method:      Automated config export and assertion for mechanical controls;
             sampling for human-operated controls — 5 changes, 3 offboardings,
             3 alerts, selected by random index over the period's records
Auditor:     M. Osei, Cloud Support (independent of prod-app deployment)
```

Note the last line. **Independence** is a real property even for an internal audit. Someone auditing their own configuration will unconsciously grade their own work. Where you cannot avoid auditing something you built, say so in the report — a stated conflict is manageable, a hidden one is not.

## Gathering evidence: automated first, then the part machines cannot see

The mechanical half is where cloud auditing is genuinely better than the paper equivalent, because the environment is queryable. Every provider offers a posture and configuration service:

- AWS Config for configuration state and history, Security Hub for aggregated findings against standards, IAM Access Analyzer for external access paths
- Azure Policy for compliance state, Microsoft Defender for Cloud for posture scoring and recommendations
- Google Cloud Security Command Center for findings, Organization Policy for constraint state

These give you two things. First, coverage — every resource, not a sample. Second, and more valuable for a period audit, **configuration history**: the ability to show not just that a setting is correct today but when it changed and what it was before. That is the difference between evidencing a point and evidencing a period, and it is the reason a configuration history service is one of the highest-value things to have enabled before you need it.

Pull the raw state yourself as well, because you want a dated artifact you control:

```bash
# Configuration snapshot — dated at collection, kept as evidence.
DATE=$(date -u +%Y-%m-%d)
aws configservice describe-compliance-by-config-rule \
  --output json > "evidence/${DATE}-config-rule-compliance.json"

aws ec2 describe-security-groups --output json \
  > "evidence/${DATE}-security-groups.json"

aws iam generate-credential-report >/dev/null && \
  aws iam get-credential-report --query Content --output text \
  | base64 --decode > "evidence/${DATE}-credential-report.csv"
```

The credential report in that last command is worth knowing about specifically: it lists every IAM user (and the root user), whether MFA is enabled, and how old every access key is, in one file. It answers three common findings at once. Know its blind spot, though: in an account where humans sign in through federation — which lesson 05 recommends — those people are not IAM users and do not appear in it at all. Pair it with an export of role assignments and the identity provider's own user and group listing, or you will audit the long-lived machine users thoroughly and the human population not at all.

Then a warning that matters more than the tooling. **A green dashboard is not an audit.** Automated posture tools check what they were built to check. They cannot tell you that the quarterly access review was performed by someone who had no idea what the roles did, that a documented procedure describes a system that was decommissioned last year, that the on-call engineer has no access to the runbook, or that a control your mapping claims is implemented was never actually built because the ticket got closed as a duplicate. Every one of those is a real finding and none of them appear in a posture score.

So the second half of evidence gathering is human, and it is done by asking and by trying:

- **Ask the owner to walk you through the control.** Not "is this done?" — invite a demonstration. "Show me how a new engineer gets production access." Watching the real path reveals the shortcut everyone actually uses.
- **Trace a transaction end to end.** Pick one change that went to production in the period and follow it: the ticket, the approval, the pull request, the pipeline run, the deployment record. Breaks in the chain are findings.
- **Test a claim.** If the control says the plaintext endpoint is closed, try it. If it says the alert fires, trigger it in a safe way and see whether anyone responded.
- **Read the exceptions.** Every accepted risk and compensating control from lesson 04 should be re-examined: is the justification still true, is the owner still here, has the review date passed?

## Writing a finding

A finding is a small piece of technical writing with a fixed structure, and the structure exists because each part answers a question a different reader will ask. Use it every time. The classic form has five elements, sometimes taught as condition, criteria, cause, effect, recommendation.

**Condition** — what you observed. Factual, specific, and free of interpretation. Include the resource identifiers, the timestamps, and how you observed it.

**Criteria** — what should be true, and where that comes from. This is the element amateurs skip, and skipping it is fatal, because a finding without criteria is just an opinion. Cite the control identifier, the policy section, or the benchmark item.

**Cause** — why it happened. Not blame; mechanism. "Created manually in the console during an incident, outside the infrastructure code, so no review applied." Cause is what makes the recommendation address the class rather than the instance.

**Effect** — what could result, and how bad. This is where the risk reasoning from lesson 04 goes: exposure, sensitivity of what is behind it, plausible scenario. Be proportionate. Findings that describe every issue as catastrophic get discounted wholesale.

**Recommendation** — what should be done. Specific enough to act on, and where possible addressing the cause as well as the symptom.

Plus the metadata that makes it trackable: an identifier, a severity, an owner, a due date, and a status.

A finished finding:

```text
FINDING INT-2026-Q3-004
Title:      Database tier permits inbound connections from any internet address
Severity:   Critical
Control:    NET-02 (network access minimum necessary); CIS Benchmark 5.2
Owner:      Platform team (D. Whitfield)
Due:        2026-07-13 (7 days — critical)
Status:     Open

CONDITION
Security group sg-0a41f9 ("db-tier"), attached to the appointments-db
instance in prod-data, contains an inbound rule permitting tcp/5432 from
0.0.0.0/0. Observed in the configuration export
evidence/2026-07-06-security-groups.json, line 412. Configuration history
shows the rule was added 2026-05-19 at 02:41 UTC by role prod-admin
(session user m.tan) and has been in place continuously for 48 days,
covering most of the audit period.

CRITERIA
Control NET-02 requires that every permitted inbound flow specifies a
specific port and a named group or prefix list as its source, with a
written justification. The rule specifies no source restriction and
carries an empty description field.

CAUSE
The rule was created in the console during incident INC-2210 to restore
service quickly, and was not reverted afterwards. The infrastructure code
in platform-repo does not contain this rule, so deployed state and code
have diverged; no drift detection is configured for this account, so the
divergence produced no signal.

EFFECT
The database holding patient names, phone numbers, and appointment times
is reachable from any host on the internet. Exploitation requires valid
credentials, and no unauthorized authentication was observed in the audit
period. However, the exposure removes a required layer of defence,
enables credential-stuffing and protocol-level attacks against the
database engine, and is inconsistent with commitments made in the
customer security addendum section 4.5.

RECOMMENDATION
1. Immediate: remove the rule; restore the app-tier and bastion source
   rules from platform-repo.
2. Structural: enable drift detection for prod-data and alert on any
   security group change made outside the pipeline.
3. Preventive: add an organization-level guardrail denying creation of
   inbound rules with source 0.0.0.0/0 on database ports.
4. Process: add a step to the incident closure checklist requiring
   emergency changes to be reverted or codified within 24 hours.
```

Read what the cause and recommendation do together. The condition is one rule; the cause is that emergency console changes leave no trail and nothing detects the divergence. Recommendations 2, 3 and 4 address the class. Fixing only the rule guarantees you write this finding again next quarter with a different security group identifier.

Two things to avoid in finding writing. **Do not editorialize** — "the team was careless" is not a finding, it is an accusation, and it makes the report about the author. **Do not bundle** — one condition per finding. A finding titled "various IAM issues" cannot be assigned, prioritized, or closed.

## Triage: deciding what matters

A first audit of an unaudited environment produces more findings than anyone can fix. Ranking them is the difference between a report that drives work and one that gets filed.

Severity should be reasoned, not felt. Score each finding on exposure, sensitivity, and blast radius:

| Question | Raises severity | Lowers severity |
| --- | --- | --- |
| Reachable from the internet? | Yes | Internal only, or requires existing access |
| Credentials required? | No | Yes, and strongly authenticated |
| What is behind it? | Restricted data, production | Internal data, non-production |
| How many resources? | Systemic, many | One, isolated |
| Detective coverage? | No logging or alerting | Logged and alerted |
| Duration in the period? | Whole period | Hours, already closed |

Turn that into a small, consistent scale with response times attached, and publish the scale so that severity is not renegotiated per finding:

```text
Critical  Exploitable now, restricted data or production exposed.   Fix ≤ 7 days
High      Serious weakness, or a compliance commitment not met.     Fix ≤ 30 days
Medium    Real weakness, mitigated by other controls.               Fix ≤ 90 days
Low       Hardening opportunity or documentation gap.               Next cycle
```

Then each finding gets one of the four decisions from lesson 04 — mitigate, transfer, avoid, accept — with an owner and a date. Two triage points specific to audit findings:

**A control that exists but was not evidenced is still a finding**, and it is a genuinely different one from a control that does not exist. Separate them, because the fix is different: one needs engineering, the other needs a record. Under a period examination, an unevidenced control fails exactly like a missing one, which is why lesson 10 exists.

**Repeat findings escalate.** A finding that appears in consecutive audits is worse than a new one of the same severity, because it demonstrates that the remediation process itself is not working. Track the audit of origin and say so in the report; "third consecutive quarter" is a sentence that gets attention when a severity label no longer does.

## Remediation, and closing a finding honestly

Remediation is not "someone fixed it". A finding is closed when four things are true.

**Fixed.** The change is made, through the normal change process, with a ticket that references the finding.

**Verified independently.** Somebody other than the person who made the change confirms the condition no longer holds, using the same test the audit used. Self-verification is how findings get closed while still true.

**Evidenced.** The verification produced a dated artifact: a re-run of the export showing the rule absent, a screenshot with a visible timestamp, a passing check in the posture tool. Attach it to the finding.

**Prevented.** Where possible, something now stops recurrence — a guardrail, a pipeline check, a test in the deployment. This is the step that converts an audit from an annual cleanup into an actual improvement.

The closure record:

```text
FINDING INT-2026-Q3-004 — CLOSURE
Status:        Closed
Remediated:    2026-07-08, change CHG-1903 (pipeline run 4471)
Action taken:  Rule removed; sg-db-tier redeployed from platform-repo at
               commit a91f2c7. App-tier and bastion source rules restored.
Verification:  Re-ran the NET-02 test procedure 2026-07-09.
               Evidence: evidence/2026-07-09-security-groups.json — no
               inbound rule with source 0.0.0.0/0 in prod-data.
               Verified by: A. Reyes (did not perform the change).
Prevention:    Drift detection enabled for prod-data (CHG-1904).
               Organization guardrail deployed denying 0.0.0.0/0 inbound on
               tcp/5432, tcp/3306, tcp/1433 (CHG-1907).
               Incident closure checklist updated (DOC-118).
Residual:      Guardrail applies to database ports only; broader port
               coverage tracked as INT-2026-Q3-004a, severity Low, due
               next cycle.
```

The residual line is a professional touch worth adopting. Partial remediation is normal; **partial remediation described as complete is a lie that surfaces at the worst possible moment**, which is when the same auditor tests the part you did not do.

When a finding genuinely cannot be remediated on schedule, the honest path is an **exception**: a written record of what will not be fixed, why, what compensating control is in place meanwhile, who accepted it, and when it will be revisited. An exceptions register is a sign of a mature programme. A pile of findings sitting at "in progress" for eleven months is a sign of the opposite, and an external auditor reads the difference immediately.

## Cadence, and the word "periodic"

The control you are implementing here is a *periodic* one, and periodicity is a commitment with the same properties as any other commitment you write down: an auditor will check that you met it, and missing your own stated cadence is a finding regardless of how good the audits you did perform were.

A workable rhythm has three tiers rather than one.

**Continuous**, automated: posture checks, configuration rules, and drift detection run constantly and raise findings as they occur. These are cheap, they cover the mechanical controls comprehensively, and their real value in a period audit is that they produce continuous evidence rather than a snapshot.

**Quarterly**, human: a scoped internal audit like the one in this lesson, plus the recurring human controls — the access review from lesson 05, the exceptions register walkthrough, the firewall rule review. Quarterly is the cadence most organizations settle on because it is frequent enough that a finding cannot sit unnoticed for most of an audit period, and infrequent enough that people can actually do it.

**Annual**, deep: the full pass against the complete control set, the disaster recovery test from lesson 08, the policy review, and the external examination if you have one.

Two triggers should also start an audit outside the calendar: a **material change** — a new region, a new account, an acquisition, a re-architecture, a new class of data — and an **incident**, because the conditions that allowed an incident are rarely unique to the system it happened in. An audit triggered by an incident should explicitly ask "where else is this true?", which is a question that finds more than the original incident did.

There is one more reason to run internal audits on a real cadence, and it is the most persuasive one to a sceptical manager. An external audit is enormously easier when an internal one ran last quarter. The evidence is already collected and indexed, the obvious findings are already closed, the owners already know what will be asked, and the conversation with the auditor is about substance rather than about locating files. Teams that skip internal audits do not save the work; they defer it into the least convenient week of the year and do it under someone else's clock. Treat every internal audit as a rehearsal, and treat the questions the external auditor asks that you had not thought of as the most valuable output of the whole engagement — they go straight into next quarter's scope.

## The report

Findings are the substance; the report is what makes them act-uponable. Keep it short and put the summary first, because the people who decide whether the work gets funded will read one page.

```text
INTERNAL SECURITY AUDIT — PRODUCTION ENVIRONMENT
Audit ID: INT-2026-Q3-PROD    Period: 2026-04-01 to 2026-06-30
Auditor:  M. Osei              Issued: 2026-07-10

SUMMARY
14 findings: 2 critical, 3 high, 6 medium, 3 low. Two findings are
repeats from INT-2026-Q2 (INT-2026-Q2-002, -009).

The environment's preventive controls for identity are materially sound.
The weaknesses cluster in two places: emergency changes made outside the
pipeline are not reverted or detected, and several implemented controls
have no evidence of operation across the period.

TOP THREE BY RISK
1. INT-2026-Q3-004 (Critical) — database tier open to the internet for
   48 days of the period.
2. INT-2026-Q3-001 (Critical) — service account static key unrotated for
   3 years, account-wide data access.
3. INT-2026-Q3-007 (High)  — no access review record for Q2; control
   ACC-04 claims quarterly.

SCOPE AND METHOD
[as scoped above]

LIMITATIONS
Change sampling covered 5 of 63 changes. Alert response testing covered
3 of 41 alerts. The auditor was not independent of control NET-04, which
they implemented in Q1; this finding was reviewed by A. Reyes.

FINDINGS
[full findings, ordered by severity]

APPENDIX — EVIDENCE INDEX
[filename, what it evidences, collection date, collector]
```

The limitations section is not weakness, it is credibility. An audit that claims complete coverage of everything is one nobody experienced will believe.

## Practice

You are auditing the production environment of the patient appointment reminder service. Assume the control mapping from lesson 04, the identity inventory from lesson 05, and the data inventory from lesson 06 are all in force as criteria. The observations available to you:

```text
OBSERVATIONS — collected 2026-07-06 unless noted
1.  sg-db-tier permits tcp/5432 from 0.0.0.0/0. Config history: added
    2026-05-19, present since.
2.  Service account svc-appointments holds a static access key created
    2023-06-02, never rotated. Policy grants account-wide data access.
3.  No access review record exists for the quarter. Control ACC-04 states
    quarterly reviews.
4.  Bucket acme-prod-exports has no default encryption and its policy
    permits both HTTP and HTTPS.
5.  Log group app-logs retains indefinitely; log entries on error include
    patient phone numbers.
6.  A former contractor's identity (m.tan, prod-admin) was still enabled
    6 days after their engagement ended. Policy states 1 business day.
7.  Of 5 sampled production changes, 2 have no linked approval; both were
    deployed during incidents.
8.  Drift detection is not enabled on either production account.
9.  The disaster recovery runbook (DOC-045) references a load balancer
    decommissioned in Q1.
10. An alert for break-glass account use exists and fired once in the
    period; no record of anyone responding.
11. Encryption at rest on appointments-db uses a provider-managed key.
    The customer addendum section 6.1 requires customer-managed keys for
    patient data.
12. Vendor identity vendor-monitoring (prod-read) has never been used and
    the trial ended last year.
```

**Exercise 1 — Write the scope statement.**

Before touching the observations, write the audit scope statement in the format above: criteria, scope with stated exclusions, period, method and sampling approach, and auditor with any independence caveat. One paragraph of prose is not acceptable — use the fielded form, because a scope statement is an artifact that gets attached to the report.

**Exercise 2 — Write three complete findings (the main artifact).**

Pick three observations of clearly different severity — at least one critical, one that is an evidence gap rather than a technical gap, and one that is a documentation or process gap. For each, write the full finding with all five elements plus the metadata, in the format shown. The cause element must address mechanism, and at least two of your recommendations must propose a preventive control that makes the class of problem structurally harder, not just the instance.

**Exercise 3 — Triage all twelve.**

Produce a triage table: finding, severity with the scoring reasoning in one line, decision (mitigate, transfer, avoid, accept), owner role, and due date derived from your severity scale. Publish your severity scale at the top of the table. At least one observation here should be resolved by *avoiding* rather than mitigating, and at least one is a strong candidate for a documented exception rather than a fix — identify both and defend the choice in one sentence each.

**Exercise 4 — Close one finding properly.**

Take your critical finding and write the closure record: action taken with a change reference, independent verification naming a different person and the test re-run, the dated evidence artifact produced, the prevention deployed, and any residual risk tracked as a new finding. Then write one sentence describing what would have to be true for you to *refuse* to close it.

**Exercise 5 — Write the one-page report.**

Produce the summary, top three by risk, scope, and limitations sections. The summary must contain a sentence identifying the *pattern* across findings rather than listing them — look at the twelve observations and find the two or three systemic causes underneath.

**Exercise 6 — Audit each other.**

Trade reports with a classmate. Play the role of the finding owner and push back on one finding as unfair or overstated. The author's job is to defend it using only the criteria element — not by arguing about how bad it feels. If the criteria element cannot carry the argument, the finding needs rewriting, and that is the lesson.
