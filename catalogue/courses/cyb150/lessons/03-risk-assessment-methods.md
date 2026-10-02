---
lesson_id: cyb150-03
course_id: cyb150
pathway: cybersecurity-support-technician
title: Risk Assessment Methods
order: 3
kind: lesson
competency_ids:
  - D4-S1-C02
objectives:
  - Rate a risk by likelihood and impact and defend its priority against the rest of the register
---

## Why a framework is not enough

Lesson 02 gave you a way to answer "what does the rulebook require?" This lesson answers a harder question: "of everything the rulebook could be read to require, and everything the rulebook never mentioned, what should we fix first?"

No organization implements every control. Meridian Health Analytics has three people in security and a product roadmap that pays the salaries. The 93 controls in ISO Annex A and the thousand-odd in SP 800-53 are not a task list; they are a menu. Risk assessment is how you choose from it defensibly — and "defensibly" is the operative word, because the output is not a number, it is an argument that survives being challenged by a CTO who would rather spend the quarter on features.

That is also why frameworks demand risk assessment in their own right rather than leaving it to good practice. HIPAA's `§164.308(a)(1)(ii)(A)` requires an accurate and thorough risk analysis, and it is the single most-cited failure in enforcement actions. ISO 27001's clauses 6.1 and 8.2 require a documented risk assessment process and periodic execution of it. NIST CSF puts it in `ID.RA`. SOC 2 asks about it in `CC3`. The register you produce is itself evidence, which is a point most people miss until an auditor asks for it.

## Getting the vocabulary right

Precision here is not pedantry. Nearly every unusable risk register is unusable because these words were used interchangeably.

| Term | Definition | Meridian example |
| --- | --- | --- |
| **Asset** | Something with value to the organization | The production database holding PHI for 90 clinics |
| **Threat** | An actor or event with the potential to cause harm | A financially motivated ransomware crew |
| **Vulnerability** | A weakness that a threat could exploit | Domain admin accounts without phishing-resistant MFA |
| **Risk** | A *scenario*: threat exploits vulnerability, affecting asset, causing consequence | Ransomware operator phishes an admin credential, encrypts the production database, PHI unavailable for days and potentially exfiltrated |
| **Control** | A measure that reduces likelihood or impact | Hardware security keys for all privileged accounts |
| **Inherent risk** | The risk level before considering controls | — |
| **Residual risk** | The risk level with existing controls operating | — |
| **Risk appetite** | How much residual risk leadership will tolerate | Set by the CTO, not by you |

The one that matters most is the fourth. **A risk is a sentence with a consequence in it, not a noun.** "Ransomware" is not a risk. "Phishing" is not a risk. "No MFA" is not a risk — it is a vulnerability, and it may participate in six different risks with six different consequences. If your register entry does not contain a cause and an effect, nobody can rate it, because there is nothing to rate.

A usable format:

```text
[Threat source] may [action] by exploiting [weakness],
resulting in [consequence to a specific asset and to the business].
```

Compare a register you will meet in the wild with one you can defend:

- Bad: "Phishing."
- Bad: "Lack of encryption on backups."
- Bad: "Cloud misconfiguration risk."
- Good: "An external attacker may obtain a privileged administrator credential through a phishing campaign, exploiting the absence of phishing-resistant MFA on the four domain administrator accounts, resulting in full control of the production environment, encryption or exfiltration of PHI for approximately 90 clinic customers, and a reportable breach under HIPAA."

The good one takes four times as long to write and is the only one you can rate, assign, or defend. It also names the numbers — four accounts, ninety customers — that will end up driving the impact score.

## The two axes

Every risk gets two ratings: how likely the scenario is, and how bad it would be. The product orders your register.

The scales themselves matter less than whether everyone using them means the same thing by a 4. Unanchored scales produce registers where one analyst's "High" is another's "Medium", which is how a register becomes a document nobody trusts. Anchor every level in observable terms, publish the anchors with the register, and use the same anchors for the whole assessment.

**Likelihood, anchored:**

| Score | Label | Anchor |
| --- | --- | --- |
| 5 | Almost certain | Has occurred at Meridian in the last 12 months, or is expected multiple times a year |
| 4 | Likely | Has occurred at a comparable organization in our sector in the last year; expected within 12 months |
| 3 | Possible | Plausible within 1–3 years; the required attacker capability is common and the exposure exists |
| 2 | Unlikely | Requires a capable attacker plus a condition we do not currently have; expected less than once in 3 years |
| 1 | Rare | Requires a chain of events with no precedent we can find |

**Impact, anchored:**

| Score | Label | Data | Availability | Financial | Regulatory |
| --- | --- | --- | --- | --- | --- |
| 5 | Severe | PHI for >10,000 individuals exposed | Product down >24h | >$1M | Reportable breach; enforcement likely |
| 4 | Major | PHI for 500–10,000 exposed | Product down 8–24h | $250K–$1M | Reportable breach |
| 3 | Moderate | PHI for <500 exposed, or internal data | Degraded >4h | $50K–$250K | Notification assessment required |
| 2 | Minor | Non-sensitive internal data | Degraded <4h | $10K–$50K | Documented internally |
| 1 | Negligible | No sensitive data | No customer impact | <$10K | None |

Three notes on those anchors. First, the 500-individual threshold in the impact scale is not a number this course invented, but neither is it a rule you get to apply: whether an incident is a reportable breach and to whom is a determination for the privacy officer and counsel. The scale uses the threshold as a *severity band*, not as a legal conclusion. Second, availability anchors should be derived from the recovery time objectives the business has already stated for each system; business continuity and disaster recovery planning is its own discipline and is not taught in this course, but its outputs feed straight into this column. Third, when a scenario scores differently on different columns, take the highest and say which column drove it. A silent maximum is unarguable.

## Scoring, and the honest limits of the matrix

Multiply. Likelihood 4 × Impact 5 = 20. Band the results:

```text
20-25  Critical  Escalate immediately; treatment plan within 5 business days
12-16  High      Treatment plan within 30 days; named owner required
6-10   Medium    Scheduled treatment; review quarterly
1-5    Low       Accept or monitor; review annually
```

![A five by five likelihood and impact grid with the four risk bands shaded, showing where each of the six worked-example risks lands](./img/risk-heat-map.png)

Now the part most courses skip. **The multiplication is not mathematics, it is bookkeeping.** These are ordinal scales — a 4 is not twice a 2 — so the product has no real arithmetic meaning. It has an *ordering* meaning, and only roughly. That has three practical consequences.

Two risks that score 12 are not equal. A `3 × 4` and a `4 × 3` land in the same cell and demand different responses: the first is a rarer event with a worse outcome, the second is a more frequent event you can plan around. Never let the matrix hide which is which.

Ties are common and the score does not break them. When six risks score 12, the ranking among them comes from your written reasoning, not the grid: what is the cost of the fix, what else does it fix, how long does it take, does anything else depend on it.

And the matrix cannot see catastrophic tails. A `1 × 5` scores 5 and lands in Low. If that scenario is "the entire clinic customer base's PHI is exfiltrated and the company does not survive it", the band is wrong for the decision even though the arithmetic is right. Flag those separately and say so. A register that quietly buries an existential scenario in the Low band has failed at its only job.

This is also where the *defence* of a priority actually lives. When Marcus asks why the register puts one item above another, the answer is never "it scored 20." The answer is: here is the likelihood anchor and the evidence that placed it there, here is the impact column that drove the score, here is what makes it different from the item below it, and here is what changes the rating.

## Worked example: six risks at Meridian

Meridian's Q3 assessment. The evidence column is what makes each rating arguable rather than asserted.

| ID | Risk statement (abbreviated) | L | I | Score | Band |
| --- | --- | --- | --- | --- | --- |
| RISK-014 | External attacker phishes a domain admin credential, exploiting the lack of phishing-resistant MFA on 4 admin accounts, gains full production control, encrypts and exfiltrates PHI for ~90 clinics | 4 | 5 | 20 | Critical |
| RISK-015 | The billing vendor (a subservice organization with a data feed containing patient identifiers) suffers a breach, exposing Meridian customer PHI it holds | 3 | 4 | 12 | High |
| RISK-016 | A departing employee retains access to the nightly export bucket because offboarding is manual and access removal is not verified, and copies patient exports | 3 | 4 | 12 | High |
| RISK-017 | An unpatched internet-facing web server is exploited, giving a foothold in the DMZ; no PHI on that host | 4 | 3 | 12 | High |
| RISK-018 | A misdirected support email sends one clinic's appointment list to another clinic | 4 | 2 | 8 | Medium |
| RISK-019 | A regional cloud outage takes the product offline for longer than the 8-hour RTO committed in customer contracts | 2 | 4 | 8 | Medium |

Now the defence of the top three, which is the artifact that actually gets read.

**RISK-014, likelihood 4.** Not 5: Meridian has not had a successful admin-credential phish. Not 3: credential-phishing against health-sector administrators is documented repeatedly in the last year at comparable organizations, the four accounts use push-based MFA which is defeated by fatigue attacks, and Meridian's last simulated phishing exercise had an 11% click rate among engineering staff. The anchor for 4 says "has occurred at a comparable organization in the last year", and it has. **Impact 5**, driven by the data column: PHI for approximately 90 clinics is well over the severe threshold, and the availability and regulatory columns independently reach 5 as well. Score 20, Critical, and there is no argument about its position at the top.

**RISK-015 and RISK-016 both score 12, and they are not the same risk.** RISK-015 is inherited: the exposure lives inside another company, Meridian's visibility is limited to a contract and an annual SOC 2 report, and the treatment options are contractual rather than technical. RISK-016 is entirely within Meridian's control and the fix is a process change costing days, not quarters. Ranking RISK-016 above RISK-015 despite the identical score is defensible on exactly that basis, and the defence must be written into the register — a reader who sees only "12" and "12" will reorder them next quarter for no reason.

**RISK-017 also scores 12 and belongs below both.** Its impact rating of 3 is the ceiling only because no PHI sits on that host. That rating is a claim about network segmentation, and it is worth stating as such: *if segmentation between the DMZ and the data tier were found to be ineffective, this risk re-rates to impact 5 and score 20.* Ratings that depend on another control holding should always name that dependency. This is the sentence that turns a register into an argument.

**RISK-018, likelihood 4, impact 2.** Misdirected email happens; the anchor for 4 is met by Meridian's own ticket history, which records three such events in the last year. Impact is capped at 2 by volume — one clinic's daily appointment list — though note that this is the row where the numeric band and the legal question diverge most sharply, because a small disclosure of PHI to the wrong party may still require a notification assessment. The register flags it for the privacy officer rather than concluding anything.

## Inherent, residual, and what you are allowed to conclude

Rate a risk twice. **Inherent** assumes the controls are not there; **residual** reflects the controls as they actually operate today. The distance between them is the value your security programme delivers, which is a genuinely useful thing to be able to show a board.

The trap is rating residual risk against controls that exist on paper. If the quarterly access review has been performed once in the last year, the residual rating cannot claim the benefit of a quarterly access review. This is the hinge between this lesson and lesson 05: your residual ratings are only as good as your evidence that the controls operate. When you have no evidence, rate the residual risk as if the control were absent, and write the reason in the register.

## Treatment: four honest options

Every risk above the acceptance threshold gets a decision, and there are only four.

**Mitigate.** Implement or strengthen a control. The default. Record the specific control, the owner, and the target date, and re-rate residual risk after implementation, not before.

**Transfer.** Shift financial consequence to another party, typically insurance or a contractual indemnity. Note precisely what transfers: cyber insurance can pay for breach notification and forensics, and it cannot transfer the regulatory obligation, the operational disruption, or the reputational damage. Whether a given contract clause actually transfers a given liability is a legal question — flag it, do not answer it.

**Avoid.** Stop doing the thing that creates the risk. The most underrated option on the list. Meridian's support ticket system contains patient identifiers only because support staff paste them in; a workflow change that references appointments by internal ID removes an entire class of risk permanently, at no ongoing cost. Every time you consider a control that would need to be operated and evidenced forever, ask first whether the data or the process could simply not exist.

**Accept.** Decide the cost of treatment exceeds the risk, and live with it. Acceptance is legitimate. *Silent* acceptance is not. A valid acceptance record has five parts and is missing none of them:

```text
Risk ID          : RISK-019
Accepted by      : Marcus Hale, CTO          <- a named person with authority
Date accepted    : 2026-08-14
Rationale        : Multi-region failover is a two-quarter engineering programme;
                   current single-region design meets the 8h RTO in 3 of the last
                   4 provider incidents. Reassess after the Q1 platform work.
Expiry / review  : 2027-02-14                <- acceptance always expires
Compensating     : Documented manual failover runbook, tested semi-annually
```

Two limits on acceptance you must know. You cannot accept a risk on the organization's behalf — the accepting party must be someone who can bind the organization, and that is not a support technician. And some risks cannot be accepted at all: where a control is *required* by regulation or by an executed contract, non-implementation is not a risk decision, it is non-compliance, and it goes to compliance and counsel rather than into an acceptance record.

## Vendor and third-party risk

Meridian's risk surface does not stop at its own network. The billing vendor holds patient identifiers. The cloud provider holds everything. The email platform, the ticketing system, the analytics tool, and the contractor who maintains the reporting pipeline all touch something. In SOC 2 terms these are **subservice organizations**, and Meridian's own report must either *carve them out* (naming them and the controls it assumes they perform) or include them. Under HIPAA they need a Business Associate Agreement, and under GDPR-shaped questionnaires they will be called sub-processors.

Treat vendor risk as a category of entries in the same register, rated on the same scales — not as a separate document. What differs is the evidence available to you and the treatments open to you.

Tier vendors by what they can reach:

| Tier | Criterion | Diligence expected |
| --- | --- | --- |
| Critical | Stores or processes PHI, or an outage stops the product | Executed BAA or DPA; current SOC 2 Type II reviewed, including the exceptions section; annual security questionnaire; named relationship owner; breach-notification clause with a stated time limit |
| Important | Access to internal systems or non-PHI customer data | Security questionnaire; contract security terms; review at renewal |
| Standard | No sensitive data, no system access | Contract review only |

Two practices separate real vendor diligence from theatre. **Read the exceptions section of a vendor's SOC 2 report** rather than filing the cover page — a report with three qualified opinions is not the same as a clean one, and the whole point of receiving the report is the part that says what went wrong. And **check the report's period against your own**: a SOC 2 covering January to June, received in December, leaves half your year unevidenced, and the gap is closed with a bridge letter you have to ask for.

Treatments for vendor risk are mostly contractual and are mostly not yours to execute. Your job is to surface the exposure, produce the assessment, and route the contractual question. Recording "vendor to remediate" without a contractual mechanism to make them is not a treatment.

## Practice

Meridian's Q3 risk assessment is underway and Dana has handed you five raw items collected from staff interviews. They are in the state real inputs arrive in.

**Exercise 1 — Rewrite the risk statements.**

Each item below is unratable as written. Rewrite each as a full risk scenario in the `[threat] may [action] by exploiting [weakness], resulting in [consequence]` format. Where a fact is missing that you would need, write the assumption explicitly and name who would confirm it.

1. "Old servers."
2. "The interns have too much access."
3. "Backups."
4. "That analytics contractor."
5. "Someone will click something eventually."

**Exercise 2 — Rate all five.**

Using the anchored likelihood and impact scales from this lesson, assign a score to each rewritten risk. For every rating, write one sentence naming the anchor you matched and the evidence that put it there. A rating with no evidence sentence does not count. Produce the result as a register table with columns for ID, risk statement, L, I, score, and band.

**Exercise 3 — Defend a ranking against a challenge.**

At least two of your five risks will score identically. Rank them anyway, and write a short paragraph — the kind you would say out loud in a meeting — defending the order. Then Marcus pushes back: *"I think number 3 is overrated, we've never had that happen."* Write your reply. It should either concede and re-rate with a stated reason, or hold the rating by pointing at the anchor definition, and it must not simply repeat the score.

**Exercise 4 — Treat each risk.**

Assign one of mitigate, transfer, avoid, or accept to each of the five, with a one-line justification. Constraints: at least one must be a genuine candidate for **avoid**, and you must say what stops existing rather than what gets watched more closely. Exactly one must be an **accept**, written out in the five-part acceptance format with a named accepting party, a rationale, an expiry date, and a compensating measure. Then identify any item on your list that is *not* eligible for acceptance at all, and say why.

**Exercise 5 — Add the vendor row.**

The analytics contractor from item 4 works through a small consultancy with production read access. Write the register entry for this vendor as a risk, assign a tier from the table in this lesson, list the four artifacts you would request from the consultancy, and name the one question in this situation that you must route to Dana rather than resolve yourself.
