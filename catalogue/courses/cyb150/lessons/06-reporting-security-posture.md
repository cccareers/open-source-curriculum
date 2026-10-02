---
lesson_id: cyb150-06
course_id: cyb150
pathway: cybersecurity-support-technician
title: Reporting Security Posture
order: 6
kind: lesson
competency_ids:
  - D4-S1-C04
objectives:
  - Write a security posture report a non-technical stakeholder can act on
---

## Where the work becomes a decision

The four preceding lessons produced a pile of true things. Requirements were mapped. Risks were rated. Policies were written. Evidence was gathered. None of it changes anything until somebody with a budget reads a summary and decides something.

That summary is a **security posture report**, and writing one is a distinct skill from doing any of the work it describes. The most common failure in this pathway is not a technical failure; it is an excellent security team producing a monthly report that no executive reads, followed by a budget request that gets declined, followed by an incident that everyone agrees was foreseeable. The report was the control that failed.

A posture report that works answers three questions, in this order, and never buries any of them:

1. **How are we doing** — measured, not asserted.
2. **Compared to what** — a target, a prior period, a commitment, a peer.
3. **What do you need to decide** — the specific asks, with the consequence of not deciding.

If a reader finishes your report unable to answer any one of those, the report has failed even if every number in it is correct.

## Know who is reading

There is no such thing as *the* posture report. Write for a named audience with a specific decision authority, and change the report when the audience changes.

| Audience | Decides | Cares about | Length | Frequency |
| --- | --- | --- | --- | --- |
| Board / executive team | Budget, headcount, risk acceptance, whether to enter a market | Business consequence, trend, regulatory exposure, cost | 1 page + appendix | Quarterly |
| Department head (e.g. Engineering) | Team priorities, sprint capacity | Their own systems, their own overdue items | 1 page | Monthly |
| Customer or prospect | Whether to sign | Certifications, incidents, subprocessors, their data | Curated, reviewed by compliance | On request |
| Auditor | The opinion | Evidence, populations, exceptions | Structured artifacts, not narrative | During fieldwork |
| Security and IT team | Today's work | Detail, ticket IDs, hostnames | As long as needed | Weekly |

Two of those rows carry a warning. A report to a **customer or prospect** is an external representation of your employer's security posture and frequently becomes contractually significant; it goes through Dana and, when it makes commitments, through legal review. And a report to an **auditor** is not a report at all — it is the evidence package from lesson 05. Narrative summaries sent to auditors get treated as management assertions, which is not what you meant them to be.

This lesson teaches the executive report, because it is the hardest and because every other version is a simplification or an expansion of it.

## The structure

```text
1  HEADER          Title, period covered, prepared by, reviewed by,
                   classification, distribution list
2  BOTTOM LINE     One paragraph. The state of things and the single most
                   important fact. Written last, read first.
3  POSTURE         5-8 metrics, each with current value, target, prior period,
                   and direction
4  TOP RISKS       The top 5 from the register, with owner, trend, and due date
5  COMPLIANCE      Status against each framework or commitment that binds us
6  CHANGES         What moved since the last report, good and bad
7  DECISIONS       What you are asking this reader to decide, with consequence
                   and a date
8  APPENDIX        Detail for anyone who wants it. Nobody is required to.
```

Section 7 is the section beginners omit and executives look for first. A report with no asks reads as "no action required", which is rarely what you meant, and it trains the reader to skim the next one.

Section 2 is written last. You cannot summarise a report you have not finished, and the attempt produces a bottom line that is really an introduction.

## Metrics that carry information

A number alone tells a reader nothing. **Every metric needs a comparison** — a target, a previous value, or a commitment — because without one, no reader outside the security team can tell whether the number is good.

| Vanity metric | Why it is useless | Metric that informs |
| --- | --- | --- |
| "14,382 malicious emails blocked" | Volume of attempts, not effectiveness. Larger is not worse or better. It is scenery. | "Phishing simulation click rate: 6% this quarter, down from 11%; target under 5%. Two of six clicks were in Engineering." |
| "99.98% of endpoints have antivirus" | The 0.02% is the whole story and it is hidden by the rounding | "9 of 412 endpoints are not reporting to EDR for more than 7 days. 3 are in Engineering; all 3 have production access. Owner: IT. Due 2026-08-15." |
| "1,204 vulnerabilities remediated" | No denominator, no severity, no time | "Median time to remediate critical vulnerabilities on internet-facing systems: 11 days, against a 7-day policy commitment. Worst case in period: 34 days." |
| "Security training completed" | No population, no rate | "Annual security training completion: 388 of 412 workforce members (94%), target 100% by 2026-09-30. 24 outstanding, all contractors; escalated to their engagement managers." |
| "No breaches this quarter" | Absence of detection is not absence of events | "No confirmed security incidents involving customer data this quarter. Two events investigated and closed as non-incidents. Mean time to triage a security alert: 42 minutes." |

The pattern in the right-hand column is worth extracting, because it generalises to any metric you will ever be asked for:

```text
[measure]  [current value]  [against target/commitment]  [trend]  [who owns the gap]
```

Choose five to eight metrics and keep them stable across reports. A metric that changes definition every quarter destroys the trend, and the trend is where most of the value is. If a metric must change, say so explicitly and restate the prior period on the new basis.

Pick metrics that reflect commitments you have actually made. "Median time to remediate criticals: 11 days against a 7-day commitment" is powerful precisely because the 7 days came from Meridian's own vulnerability management standard. It converts a technical measure into a broken promise, which is a thing executives know how to act on.

## Writing for a reader who is not you

A CFO reading your report is intelligent, busy, and has no idea what a CVE is. Four habits carry most of the load.

**Translate to consequence, not mechanism.** Not "unauthenticated RCE in the edge proxy, CVSS 9.8." Instead: "A flaw in the software that handles incoming customer traffic would let an attacker run commands on that system without logging in. It is patched on 3 of 4 servers; the fourth is scheduled for Saturday's maintenance window."

**Quantify in the reader's units.** Clinics, patients, hours of downtime, dollars, contract commitments. "Approximately 90 clinic customers, covering roughly 340,000 patient records" lands. "The prod database" does not.

**Spell out the first use of any acronym, or cut it.** MFA, EDR, RTO, PBC, TSC. If a term appears once, replace it with plain words.

**Never send a number you cannot evidence.** Everything in section 3 must trace to an artifact from lesson 05. A metric you estimated will be the one you are asked about.

One structural habit matters more than any of these: **lead with the conclusion.** Security professionals are trained to build an argument and arrive at a finding. Executive readers read the first sentence of each section and stop. Put the finding first and the reasoning after it.

## The RAG trap

Almost every posture report uses red / amber / green status. Two failure modes, both fatal, both common.

**Green fatigue.** When everything is green every month, the report becomes wallpaper and the one month something turns amber, nobody notices because nobody is reading. If your report is all green, either your programme is genuinely finished, or your thresholds are set to flatter you. It is the second one.

**Undefined colours.** If "amber" means whatever the author felt that morning, the status is an opinion wearing a uniform. Define the thresholds in the report and hold to them, even when a red is inconvenient:

```text
GREEN  Metric at or better than target, or gap closes within the current period
AMBER  Metric off target, remediation owned and on a dated plan
RED    Metric off target with no owner or no plan, OR a commitment to a
       customer or regulator is currently not being met
```

Under those definitions a red is not a failure of the security team; it is a request for a decision, which is exactly what the report is for. Publish the definitions and a red becomes usable rather than embarrassing.

## A real-shaped posture report

Meridian, quarterly, to the executive team.

```text
MERIDIAN HEALTH ANALYTICS - SECURITY POSTURE REPORT
Period: 2026 Q2 (1 Apr - 30 Jun)          Classification: Internal - Confidential
Prepared by: M. Silva, IT & Security Support   Reviewed by: P. Raman, CISO
Approved for distribution by: D. Okafor, Compliance Manager
Distribution: Executive team, Board Audit Committee

1. BOTTOM LINE

Meridian's security posture improved this quarter and one commitment is not
being met. Privileged accounts moved to hardware-key authentication in May,
which closes our highest-rated risk. Our SOC 2 Type II examination is in
fieldwork with one self-reported deviation. However, we are not meeting our
own 7-day commitment for patching critical vulnerabilities on internet-facing
systems, currently running at a median of 11 days, and this commitment appears
in 14 signed customer agreements. Two decisions are requested in section 7.

2. POSTURE MEASURES

  MEASURE                                    NOW    TARGET   Q1     STATUS
  Privileged accounts on hardware keys       12/12  12/12    0/12   GREEN
  Median days to patch critical, external    11     7        14     AMBER
  Endpoints not reporting to endpoint
    protection for over 7 days               9/412  0        17/412 AMBER
  Quarterly access reviews completed
    on time                                  5/6    6/6      6/6    AMBER
  Security training completion               94%    100%     91%    AMBER
  Phishing simulation click rate             6%     <5%      11%    AMBER
  Confirmed incidents involving
    customer data                            0      0        0      GREEN
  Critical vendors with current
    assurance report on file                 7/9    9/9      6/9    AMBER

  GREEN: at or better than target. AMBER: off target, owned, dated plan.
  RED: off target with no owner or plan, or a customer/regulatory commitment
  currently unmet.

3. TOP RISKS

  ID        RISK (summary)                        RATING      OWNER   DUE
  RISK-017  Unpatched internet-facing systems      12 High     Platform 08-31
            could be exploited to reach internal   (was 12)
            networks. Patch timelines exceed our
            customer commitment.
  RISK-015  Billing vendor holds patient           12 High     Compliance 09-30
            identifiers; its assurance report      (was 12)
            expired in March and has not been
            renewed.
  RISK-016  Departing staff may retain access;     9 Medium    IT      08-15
            removal is manual and unverified.      (was 12)
  RISK-022  Two consultancy engineers access       12 High     Analytics 09-15
            production from unmanaged laptops
            under exception EXC-2026-011.
  RISK-019  A regional cloud outage would exceed   8 Medium    CTO     Accepted
            the 8-hour recovery commitment in                          to 2027-02
            customer contracts.

  RISK-014 (privileged account compromise) fell from 20 Critical to 6 Medium
  following the hardware key rollout and has left the top five.

4. COMPLIANCE STATUS

  HIPAA Security Rule (as business associate)  On track. Annual risk analysis
    refreshed in June. Two addressable specifications remain under review with
    the Security Officer.
  SOC 2 Type II (Security)                     In fieldwork with Kestrel
    Assurance, period 1 Jan - 30 Jun. 27 of 31 evidence requests delivered.
    One deviation self-reported: the Q2 access review for the support
    ticketing system was completed 11 days late. Report expected 2026-09.
  ISO 27001                                    Not pursued. A European prospect
    has requested it; a scoping decision is requested in section 7.
  Customer contractual commitments             14 agreements commit to a 7-day
    critical patch window for internet-facing systems. We are not meeting it.

5. CHANGES THIS QUARTER

  + Hardware-key authentication deployed to all 12 privileged accounts (May).
  + Endpoint protection coverage gap reduced from 17 devices to 9.
  + Access control policy POL-AC-01 revised to v2.1 and re-attested by 94%
    of workforce.
  - The billing vendor's assurance report lapsed in March; a replacement has
    been requested three times without response.
  - One access review completed late owing to a system owner transition.

6. WHAT WE ARE NOT REPORTING ON

  We have no measure of how quickly access is removed for departing
  contractors, because contractor offboarding is not currently tracked in a
  system of record. Section 7 asks for a decision on this.

7. DECISIONS REQUESTED

  D1. Patch window (owner: CTO, needed by 2026-08-15)
      We are not meeting the 7-day critical patch commitment in 14 customer
      agreements. Two options: fund a maintenance-window automation change
      (estimated 3 engineering weeks) to meet the commitment, or instruct
      Compliance to renegotiate the commitment to 14 days at renewal.
      If neither is chosen, we remain in breach of a signed commitment.

  D2. Billing vendor (owner: CTO and Compliance, needed by 2026-09-30)
      The billing vendor holds patient identifiers and has not provided a
      current assurance report for two quarters. Requesting authority to
      invoke the audit clause in the contract, or a decision to begin
      evaluating an alternative vendor.

  Noted for a future decision, not required now: whether to pursue ISO 27001
  certification for the European market. Compliance will bring a scoped
  proposal in Q3.

APPENDIX A  Risk register extract (full, 34 entries)
APPENDIX B  Metric definitions and evidence sources
APPENDIX C  Glossary
```

Six things in that report are doing deliberate work, and they are the transferable lessons.

**The bottom line contains the bad news.** It would have been easy to lead with the hardware key win and mention patching in section 4. Executives who later discover that a signed commitment was being missed while the report led with a success stop trusting the report, permanently.

**The patching metric is tied to a contract.** "11 days versus 7" is a technical fact. "11 days versus 7, and the 7 appears in 14 signed agreements" is a business fact with a decision attached. That translation is the whole skill.

**Risk ratings show movement.** `12 High (was 12)` and `9 Medium (was 12)` let a reader see the programme working without reading the register. RISK-014's departure from the top five is stated rather than left as a silent absence — a risk that vanishes without explanation reads as an error.

**Section 6 admits a blind spot.** Reporting what you cannot measure is a mark of a trustworthy report and it converts an invisible gap into an agenda item.

**Section 7 gives options and a consequence.** Not "we need more resources", but two named alternatives, a cost, an owner, a date, and what happens if nobody chooses. Executives decide between options; they do not generate them for you.

**The classification and distribution line is not decoration.** This report contains a list of your employer's unmitigated weaknesses with due dates. It is one of the most sensitive documents the organization produces. It does not go to a prospect, it does not go in a slide deck for an all-hands, and the customer-facing version is a different document written by Dana.

## Honesty under pressure

You will at some point be asked to soften a report. Sometimes crudely, more often as a reasonable-sounding edit: can we call that amber instead of red, can we move that to the appendix, does the board really need the vendor issue this quarter.

Hold three lines.

**Never report a status you cannot evidence.** Every colour traces to a metric and every metric traces to an artifact from lesson 05. When someone asks for green, ask what evidence would support it. Usually that ends the conversation.

**Never remove a decision request without a decision.** If an ask is dropped from the report, the risk it addressed does not go anywhere, and next quarter it appears again with three more months of age on it. If it is genuinely being deferred, say that: *"D2 deferred by CTO on 2026-07-30; risk remains at 12 High; revisit in Q3."* Deferral recorded is a legitimate outcome. Deletion is not.

**Do not editorialise about people.** "Engineering has ignored this for two quarters" is a sentence that ends your usefulness in the organization. "Nine endpoints remain out of compliance; owner: Engineering; third consecutive quarter" is the same information and is unanswerable.

And where a report would state or imply a legal conclusion — that an event was a reportable breach, that the organization is or is not in violation of a regulation, that a contract clause has been breached — write the facts and let Dana and counsel write the conclusion. Note the pattern in section 4 of the sample: "14 agreements commit to a 7-day window. We are not meeting it." Both sentences are facts. It does not say "we are in breach of contract", because that is a legal determination and not yours.

## Practice

It is the first week of October. Dana has asked you to produce Meridian's Q3 executive posture report. The raw material is below, in the state raw material actually arrives in.

```text
- 412 endpoints total. 4 not reporting to endpoint protection >7 days
  (was 9). 2 of the 4 have production access.
- Median days to patch critical internet-facing vulns: 8 (was 11).
  Policy and 14 customer agreements say 7.
- Training completion 401/415 (96.6%), target 100% by 2026-09-30 - missed.
  All 14 outstanding are contractors.
- Phishing sim click rate 7% (was 6%). Target <5%. Ran a harder template
  this quarter.
- Access reviews: 6 of 6 completed on time.
- Privileged accounts on hardware keys: 12/12 held.
- 1 security incident: a laptop stolen from a car in August, full-disk
  encrypted, remotely wiped, device had cached appointment data for
  one clinic. Investigated; the privacy officer's determination on
  notification is still open with counsel.
- SOC 2 Type II report issued 2026-09-18. Clean opinion except one
  exception: the late Q2 access review.
- Billing vendor still has not produced an assurance report. Now three
  quarters. Contract renews 2026-12-31.
- Critical vendors with current assurance report: 7/9.
- Consultancy exception EXC-2026-011 still open, expires 2027-03-31.
- 22,914 malicious emails blocked by the mail gateway.
- New: the European prospect signed, contingent on an ISO 27001
  certification within 18 months. Nobody has been assigned to it.
```

**Exercise 1 — Convert the metrics.**

Build section 3 of the report. Choose six to eight measures from the raw material, and for each give the current value, the target, the prior period, and a status colour using the definitions in this lesson. At least one item in the raw list is a vanity metric — identify it, exclude it, and say in one sentence why. At least one metric moved in the wrong direction for a defensible reason; report the movement honestly and explain the reason in the same line rather than hiding it.

**Exercise 2 — Write the bottom line.**

Write section 2: one paragraph, no more than six sentences, containing the most important fact in the material and at least one piece of bad news. Then write two alternative versions — one that buries the bad news and one that overstates it — and write two sentences on what each would cost you with this audience.

**Exercise 3 — Write the incident paragraph for a non-technical reader.**

Describe the stolen laptop for the executive team. Constraints: no jargon without a plain-language gloss; state what protected the data and what did not; state what remains open and who owns it; and do not state or imply whether this is a notifiable breach. Then write the one-sentence version you would put in a customer-facing summary, and say who has to approve that version before it leaves the building.

**Exercise 4 — Write two decision requests.**

Write section 7 with exactly two asks. Each must name an owner, a date, at least two options with a rough cost or effort, and the consequence of no decision. One of your two must address the ISO 27001 commitment, which currently has no owner, no budget, and an 18-month contractual clock.

**Exercise 5 — Re-cut it for a different reader.**

Take your finished report and produce a five-line version for the Head of Engineering. Only their items, only their decisions, no company-wide metrics they cannot influence. Then list three things from the executive report that must not appear in a version sent to a prospective customer, and say why for each.
