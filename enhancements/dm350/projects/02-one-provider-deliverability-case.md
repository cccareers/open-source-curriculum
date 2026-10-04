---
course_id: dm350
project_id: dm350-x02
title: "The One-Provider Problem: A Deliverability Case File"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - dm350-07
objectives:
  - Diagnose email deliverability and performance problems and fix them
  - Read open, click, bounce, and unsubscribe metrics correctly
competency_ids:
  - D5-S1-C03
---

## Scenario

February. Northlight's list is healthy again after the October recovery in lesson 07. Then the February newsletter's open rate drops from 33% to 24% with no change in bounces or complaints. Ruth asks whether the new subject-line style is to blame. Last week the operations team moved invoicing to a new billing tool and asked IT to "tighten email security".

You have the send log split by recipient provider and the current DNS records. Work lesson 07's triage path to a diagnosis and a fix plan.

## What you will produce
1. The **February report** recomputed with denominators, and a **per-provider table** (open rate, click rate, CTOR) for January and February.
2. A **triage walk**: each of lesson 07's seven steps, what you checked, what it showed.
3. A **DNS finding**: what each record does, what changed, why it explains the pattern.
4. A **fix plan** naming who does what, in what order, and what you will watch to confirm recovery.
5. A **reply to Ruth** under 120 words.

## Before you start
Providers are anonymised as A, B, C to avoid dating the exercise to any one company's current rules.

**`send_log_jan_feb.csv`**
```csv
month,provider,delivered,unique_opens,unique_clicks,unsubscribes,complaints
jan,A,2410,820,62,5,1
jan,B,1630,520,38,4,1
jan,C,980,330,24,2,0
feb,A,2420,830,63,6,1
feb,B,1640,35,3,1,0
feb,C,990,340,25,2,1
```

**`dns_records.txt`** (northlightbooks.com)
```txt
SPF   (Jan) "v=spf1 include:_spf.google.com include:servers.example-esp.net ~all"
SPF   (Feb) "v=spf1 include:_spf.google.com include:billing.example-invoices.com -all"
DKIM  esp1._domainkey.northlightbooks.com  -> REMOVED in Feb cleanup ("unused?")
DMARC (Jan) "v=DMARC1; p=none; rua=mailto:dmarc@northlightbooks.com"
DMARC (Feb) "v=DMARC1; p=quarantine; rua=mailto:dmarc@northlightbooks.com"
Email platform sends from: newsletter@northlightbooks.com
  envelope sender: bounce.example-esp.net
```

**`dmarc_report_excerpt.txt`** (aggregate report from provider B, Feb)
```txt
source: servers.example-esp.net   count: 1,640
  spf: pass (domain bounce.example-esp.net)  dkim: none
  dmarc: fail (no aligned pass)   disposition: quarantine
```

## Milestones
1. Recompute January and February totals, open rate, click rate, CTOR with denominators; then split by provider.
2. Walk the triage path; stop at the step that localises the problem.
3. Read the DNS changes and the DMARC report; explain the mechanism in plain language.
4. Write the fix plan in order of safety; state what you would *not* do (e.g. loosen DMARC to `none` permanently).
5. Reply to Ruth.

## Acceptance criteria
- [ ] Totals reconcile: Feb delivered 5,050 (platform-reported), opens 1,205, clicks 91.
- [ ] Per-provider table shows B's February open rate near 2% while A and C held, and CTOR is computed per provider.
- [ ] The diagnosis cites triage step 6 (one provider only) and links it to authentication rather than copy.
- [ ] The learner explains that "delivered" in the platform does not mean inbox, and that the DMARC report shows provider B quarantining accepted messages rather than rejecting them.
- [ ] The DKIM removal and the root-domain SPF edit are both identified. SPF still passes for the external envelope domain, which does not align with northlightbooks.com; the root-domain edit cannot change that result. Missing custom DKIM leaves no aligned pass.
- [ ] The fix restores DKIM signing for northlightbooks.com first, audits SPF for each actual envelope domain and, if an aligned custom return path is configured, authorizes the platform there, and keeps DMARC at a monitoring or quarantine policy until reports are clean.
- [ ] Subject lines are explicitly ruled out with evidence (A and C opens unchanged).

## Evidence checklist
Recomputed report, per-provider table, triage walk, DNS explanation, fix plan with owners, reply to Ruth.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Metric literacy | Uses platform percentages as given | Recomputes with denominators; CTOR per provider | Notes why B's CTOR is unreliable at 35 opens |
| Triage discipline | Jumps to copy | Walks steps in order and stops at step 6 | Explains which steps were ruled out and how |
| Authentication understanding | "DNS is broken" | Explains SPF, DKIM, DMARC alignment and policy for this case | Notes forwarding behaviour and why DKIM is the more robust fix |
| Fix plan | Single action | Ordered steps, owners, watch metrics | Includes a change-control rule so DNS edits are reviewed with marketing |
| Communication | Technical jargon to Ruth | Plain reply with cause and timeline | Names the billing-tool change as the trigger without blaming a person |

## Stretch goals
- Estimate how many February clicks and fit-call bookings were lost, using January's provider B rates as the counterfactual, and label it an estimate.
- Draft the internal "DNS change checklist" that would have prevented this.

## Reflection prompts
- What made this look like a content problem at first glance?
- Which single number in the log most quickly ruled out the subject line?

## Instructor notes
Key arithmetic: Jan delivered 5,020, opens 1,670 (33.3%), clicks 124 (2.5%), CTOR 7.4%. Feb delivered 5,050, opens 1,205 (23.9%), clicks 91 (1.8%). Provider B Feb: 35 / 1,640 = 2.1% opens vs Jan 31.9%; A and C unchanged (about 34%). The DMARC report shows B quarantining all 1,640 accepted messages, consistent with the delivered count and low engagement. Some recipients may open mail in spam; tracked opens alone do not establish inbox placement. The changed root-domain SPF record does not govern bounce.example-esp.net, so restoring its include alone cannot repair alignment. Fix order: re-publish DKIM key and re-enable custom signing; audit SPF at the actual envelope domain (check lookup count), and configure an aligned custom return path if adding SPF alignment; keep quarantine while fixing, then review stronger enforcement once aggregate reports show legitimate sources aligned. Do not let learners propose sending from a different domain as the fix.

Authentication reference for this case: [IETF RFC 9989, sections 4.4.2 and 4.7](https://www.rfc-editor.org/rfc/rfc9989.html) explain the MAIL FROM identity used for SPF alignment and the quarantine policy.
