---
course_id: cyb150
media_id: cyb150-v01
type: video-script
title: "One Control, Five Frameworks: Parse, State, Crosswalk"
format: screencast
target_runtime: "7 min"
related_lessons:
  - cyb150-02
objectives:
  - Map a stated security requirement to the right control in NIST, ISO 27001, HIPAA, or SOC 2
competency_ids:
  - D4-S1-C01
---

## Purpose
After watching, the learner can parse a requirement into WHO/WHAT/SCOPE/FREQUENCY, write a falsifiable control statement, and build a crosswalk row, marking any identifier they have not verified.

## Audience and prerequisites
cyb150-02, through "What each of the four actually is". The demo uses a spreadsheet and the publications' own PDFs or web pages.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Email from a clinic customer, with the addendum clause highlighted: "...ensure that access to systems containing PHI is limited to workforce members whose role requires it, and shall review such access periodically." | "Meridian Health Analytics just got this clause from a clinic customer. Four different parties will ask about the same thing in four vocabularies: the customer, HIPAA, the SOC 2 auditor, and an ISO prospect. Let's answer all of them with one control." |
| 0:25 | Four-line parse template: WHO / WHAT / SCOPE / FREQUENCY. | "Step one: parse. Who is obligated? Meridian, as a business associate. What must be true? Two verbs: limit by role, and review. Scope?" |
| 0:45 | SCOPE line typed: "systems containing PHI — AMBIGUOUS: prod DB? export bucket? log platform? support tickets?" with a red "ASK" tag. FREQUENCY: "'periodically' — undefined; policy must supply". | "'Systems containing PHI' is where mapping goes wrong. Is it just the production database, or also the export bucket, the logs, and the support tickets where customers paste patient names? Don't decide that yourself. Flag it and ask Dana. And 'periodically' isn't a number, so our own policy has to supply one." |
| 1:30 | Email reply from Dana: "Scope = prod DB, nightly export bucket, support ticketing. Policy: quarterly." | "Dana confirms the scope, and our access control policy says quarterly." |
| 1:45 | Control statement MHA-AC-04 typed in full (from the lesson). | "Step two: write one framework-neutral control statement that can be proven false. Named individual accounts, assigned to role groups by the system owner. No shared accounts. Quarterly re-approval. Removal within one business day of termination and five of a role change." |
| 2:30 | The falsifiability test as a caption: "This is false if... a shared account exists / a quarter has no review record / a leaver is enabled on day 2." | "Test it. Can you describe an environment that would make this false? A shared login, a missed quarter, a leaver still enabled on day two. Yes. So it's a control statement, not a slogan like 'access is appropriately restricted'." |
| 3:05 | Crosswalk table with empty cells for CSF, 800-53, ISO, HIPAA, SOC 2. | "Step three: the crosswalk. The control exists once. Each framework just points at it." |
| 3:20 | Browser opens the NIST CSF 2.0 reference; search for PR.AA-05; the text is shown; the cell is filled. | "CSF 2.0: I'm looking it up, not remembering it. PR.AA-05: access permissions and authorizations are managed, incorporating least privilege. Filled." |
| 3:50 | 800-53 r5 catalog search; AC-2, AC-6, PS-4 filled. | "SP 800-53 revision 5: AC-2, account management; AC-6, least privilege; PS-4, personnel termination. Each checked in the catalog." |
| 4:20 | ISO 27001:2022 Annex A cell: A.5.15, A.5.18. The SOC 2 cell is typed as "CC6.x — unverified, confirm with compliance". | "ISO Annex A: 5.15 and 5.18. Now SOC 2. I'm fairly sure it's the CC6 family, but I don't have the criteria document open right now. So the cell says 'unverified, confirm with compliance.' That's honest and fixable. A confident wrong number would sail through review and land in front of an auditor." |
| 5:05 | HIPAA section § 164.308(a)(4) and § 164.312(a)(1) filled. A cursor hovers over "required vs addressable" with a note. | "HIPAA: information access management and technical access control. Note in the cell whether each specification is required or addressable. Addressable means the decision must be documented, not that it's optional." |
| 5:40 | Highlight on the numbers in MHA-AC-04: "1 business day", "5 business days", "quarterly". Caption: "From OUR policy, not from a framework". | "Notice what no framework gave us: the one-day window, the five-day window, the quarterly cadence. Those came from Meridian's own policy. And every number is a promise you'll be measured on, so don't write 'four hours' because it sounds strong." |
| 6:15 | Customer email again. Second highlighted question: "Do we need to notify patients about Tuesday's outage?" | "Last thing. When a question like this lands in your inbox ('do we need to notify patients?'), it isn't a mapping task. It's a legal determination. Reply with the facts, open a ticket, and route it to Dana." |
| 6:40 | Recap card: Parse · State · Crosswalk · Verify or mark unverified. | "Parse, state, crosswalk, verify. Now do Exercise 1 on the five requirements in your practice." |

## On-screen assets and B-roll
- The parse template, the control statement, and the crosswalk spreadsheet (same columns as the lesson's table).
- Screen captures of the official CSF 2.0 and SP 800-53 r5 references. Re-capture these at production time, because page layouts change.

## Accessibility
- Captions throughout. Every cell value is read aloud.
- The "ASK" and "unverified" tags are text labels as well as coloured.
- Browser zoom 150%. Searches are typed slowly and paused on results.

## Check for understanding
1. Why is "We have Okta" not a control statement? *It names a tool, not a falsifiable condition; the control must outlive the tool.*
2. What do you write in a crosswalk cell you have not verified? *"unverified, confirm with compliance". Never a plausible guess.*
3. Where did the "one business day" in MHA-AC-04 come from? *Meridian's own access control policy, not any framework.*
