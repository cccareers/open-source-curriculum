---
course_id: dm350
project_id: dm350-x01
title: "Northlight Contact Export: Clean, Audit, and Segment"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: warm-up
related_lessons:
  - dm350-02
  - dm350-05
  - dm350-09
objectives:
  - Keep CRM data clean through import, deduplication, and field discipline
  - Segment an audience and personalize content for each segment
competency_ids:
  - D7-S1-C01
  - D5-S1-C02
---

## Scenario

It is 15 September. Ruth wants an "early access" email for the Year-End Close Sprint (lesson 10) to go to the best-fit contacts a week before the public launch. Before anyone writes copy, you have pulled a 20-row sample of the CRM export to check whether the data can support the segment. The sample is representative: whatever is wrong here is wrong across the 8,400 records.

## What you will produce

1. **Fill-rate audit** of every column, with a verdict per column in the lesson 02 format (and a note on any column whose fill rate is an artefact).
2. **Defect log**: every row with a problem, the problem, the lesson rule it breaks, and the fix.
3. **`cleaned.csv`** and **`hold.csv`** following lesson 02's import rules and merge rules.
4. **Segment definition** for "Sprint early access" in lesson 05's include/exclude format, and the list of rows that qualify.
5. **A three-branch conditional block** (agency/studio, solo, default) for the early-access email, each branch standing alone, with token fallbacks.

## Before you start

Reference date for engagement recency: **2026-09-15**. Dormant = no email engagement in 180+ days (before 2026-03-19). Schema and options are lesson 02's.

**`northlight_sample.csv`**

```csv
email,firstname,company_domain,business_type,country,lifecycle_stage,marketing_consent_status,original_source,last_email_engagement,created
sam.iyer@brightloom.co,Sam,brightloom.co,agency,United States,marketing_qualified,opted_in,organic_search,2026-09-02,2026-02-19
Sam.Iyer@Brightloom.co,Samuel,brightloom.co,creative agency,US,subscriber,,event,,2026-09-10
dara@paperkite.studio,dara,paperkite.studio,design_studio,United States,lead,opted_in,podcast,2026-08-21,2026-03-02
info@millfieldpartners.com,,millfieldpartners.com,agency,United States,subscriber,opted_in,event,,2026-09-10
lena.ortiz@ortizillustration.com,Lena,ortizillustration.com,solo_contractor,United States,lead,opted_in,organic_search,2026-07-30,2025-11-14
marco@fieldnotesdesign.co,Marco,fieldnotesdesign.co,design_studio,,lead,opted_in,referral,2026-09-05,2026-01-08
priya.n@harborandpine.com,Priya,harborandpine.com,unknown,United States,subscriber,opted_in,organic_search,2026-03-01,2025-02-11
j.wu@lanternpress.co,Jin,lanternpress.co,agency,United States,client,opted_in,referral,2026-09-08,2024-06-20
accounts@lanternpress.co,,lanternpress.co,agency,United States,subscriber,not_opted_in,direct,,2025-01-15
tomas@ledgerlyhq.com,Tomas,ledgerlyhq.com,other,United States,lead,opted_in,organic_search,2026-08-30,2026-05-05
ana@studiocobalt.io,Ana,studiocobalt.io,design_studio,United States,lead,opted_out,organic_search,2026-04-10,2025-09-09
ben.k@benkphoto.com,Ben,benkphoto.com,solo_contractor,United States,lead,opted_in,podcast,2025-12-01,2025-06-22
rae@northwindcreative.com,Rae,northwindcreative.com,agency,United States,disqualified,opted_in,organic_search,2026-06-14,2025-10-03
olu@olumedia.co.uk,Olu,olumedia.co.uk,agency,United Kingdom,lead,opted_in,podcast,2026-08-11,2026-04-18
kim@,Kim,,solo,United States,subscriber,,event,,2026-09-10
mvega+test@northlightbooks.com,Test,northlightbooks.com,,United States,subscriber,opted_in,direct,2026-09-09,2026-09-01
c.diaz@diazanddiaz.com,Carla,diazanddiaz.com,agency,United States,lead,opted_in,referral,2026-09-01,2026-07-12
hello@quietfoxstudio.com,,quietfoxstudio.com,design_studio,United States,lead,opted_in,organic_search,2026-08-25,2026-06-30
will@willowtype.com,Will,willowtype.com,solo_contractor,United States,former_client,opted_in,referral,2026-02-02,2023-03-15
nora@brightsidebooks.com,Nora,brightsidebooks.com,other,United States,lead,opted_in,organic_search,2026-09-04,2026-08-01
```

## Milestones
1. **Profile** each column: filled count, fill rate, and whether "filled" means "usable" (e.g. `unknown` is filled but not usable; `lifecycle_stage` is defaulted).
2. **Log defects** row by row. Expect at least ten.
3. **Merge** the Sam Iyer pair field by field using lesson 02's merge rules and write the surviving record.
4. **Clean** into `cleaned.csv` and `hold.csv` with a one-line reason per held row.
5. **Write the segment** with consent first, then compute which cleaned rows qualify and why each other row does not.
6. **Write the conditional block** with token fallbacks and a default branch written first.

## Acceptance criteria
- [ ] Fill rates are shown as counts and percentages, and at least one "high fill rate that measures nothing" is called out.
- [ ] The duplicate is found only after lowercasing emails, and the survivor is the older record with `original_source` and consent untouched.
- [ ] Role addresses (`info@`, `accounts@`, `hello@`), the invalid address, and the internal test record are held, not imported as marketing contacts.
- [ ] Missing consent on imported rows is treated as not eligible (lesson 09), never defaulted to opted in.
- [ ] Free-text values (`creative agency`, `solo`, `US`) are mapped to schema options before import.
- [ ] The segment is active, has an owner and review trigger, and states the dormant exclusion with the date arithmetic.
- [ ] Each conditional branch reads correctly on its own, and every token has a fallback.

## Evidence checklist
- Audit table, defect log, merged record, `cleaned.csv`, `hold.csv`, segment logic with the qualifying row list, conditional block, and a three-sentence note to Ruth on what the sample implies for the full database.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Data audit | Counts blanks only | Separates filled from usable; flags defaulted fields | Extrapolates the sample to the 8,400-record database with a stated caveat |
| Cleaning and merge | Deletes duplicates | Applies merge rules field by field; nothing write-once overwritten | Documents which values were discarded and why |
| Consent discipline | Emails anyone with an address | Consent first in the segment; blank consent held | Names the re-permission path for held rows |
| Segment logic | One combined expression | Separate include/exclude blocks, redundant exclusions kept | Reports which single rule excludes the most rows and what fixing it would recover |
| Personalization | Tokens without fallbacks | Three standalone branches with fallbacks | Default branch written first and strongest |

## Stretch goals
- Write the enrichment rule that would recover Marco (blank country) without guessing.
- Score each qualifying contact with lesson 03's v1 model and say whether any would be routed to an advisor.

## Reflection prompts
- Which defect, multiplied across 8,400 records, would cost Northlight the most sends?
- Where did the schema's `unknown` option help you, and where did it hide a problem?

## Instructor notes
Expected qualifying rows (after merging the Sam pair): **Sam Iyer, Dara (name re-cased), Lena Ortiz, Carla Diaz — 4 of 19 unique records.** Exclusion reasons: Marco — blank country; Priya — `unknown` business type and dormant (last engagement 2026-03-01 is 198 days before the reference date); Jin — client; accounts@ — role address and not opted in; Tomas, Nora — `other`; Ana — opted out; Ben — dormant (2025-12-01); Rae — disqualified; Olu — United Kingdom; kim@ — invalid; mvega+test — internal; hello@quietfoxstudio — role address; Will — former client. Fill-rate traps: `lifecycle_stage` and `original_source` are 100% because they are defaulted/required, which says nothing about accuracy; `business_type` counts `unknown` as filled. The Sam merge keeps `Sam`, `agency`, `marketing_qualified`, `organic_search`, consent `opted_in` with its original timestamp; `Samuel`, `creative agency`, `US` and the `event` source are discarded; both records' activities move to the survivor. The sample's 4-in-19 yield is a teaching point for lesson 10's "say no somewhere".
