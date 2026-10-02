---
lesson_id: cyb150-07
course_id: cyb150
pathway: cybersecurity-support-technician
title: "Project: Risk Register for a Small Organization"
order: 7
kind: project
competency_ids:
  - D4-S1-C02
objectives: []
---

## Goal

Produce a complete, defensible security risk register for Cedar Hollow Community Health, and be able to defend the top five entries against challenge.

This is the first of three linked projects. The register you build here is the input to project 08, where you will draft policies that respond to the risks you rate highest, and to project 09, where you will assess Cedar Hollow against a framework and report the gaps. Do not treat this as a throwaway exercise: you are producing the first third of one coherent compliance package, and weak risk statements written now will make both later projects harder. Keep your file.

## The organization

**Cedar Hollow Community Health** is a nonprofit primary-care network. It is a **covered entity** under HIPAA.

```text
Six clinics across one county, plus a small administrative office
210 staff: 145 clinical, 40 administrative, 25 part-time or per-diem
~40,000 active patients
IT staff: two people, both generalists. No dedicated security role.
The Compliance & Privacy Officer, Angela Ruiz, is also the HR Director
  and holds the Security Officer designation. She has no security background.
The Executive Director, Sam Okonjo, is the only person who can commit budget.
```

Systems and data:

```text
EHR                  Hosted by a vendor (CloudChart). All clinical records.
                     Staff sign in with a username and password; the vendor
                     supports MFA but Cedar Hollow has not enabled it.
Billing              Outsourced to Ridge Revenue Partners, who receive a
                     nightly file of patient demographics and visit codes.
                     A business associate agreement was signed in 2019 and
                     has not been reviewed since.
File server          On-premises at the administrative office. Holds scanned
                     intake forms, staff records, incident reports, and
                     twelve years of accumulated files nobody has reviewed.
                     Everyone in "Domain Users" can read most of it.
Email                Cloud-hosted. MFA enabled for administrators only.
Endpoints            180 Windows laptops and desktops, 22 tablets used in
                     exam rooms. Antivirus is the operating system default.
                     No central management for the tablets.
Network              One flat network per clinic, joined by site-to-site VPN.
                     Guest Wi-Fi shares the clinic network at two sites.
Backups              File server backs up nightly to a network drive in the
                     same building. Last restore test: unknown.
                     The EHR vendor states it backs up; nobody has verified.
Remote access        A handful of clinicians use a remote desktop gateway
                     from personal home computers.
```

Recent history and pressures:

```text
- A grant funder has asked for evidence of a "current security risk analysis"
  as a condition of a renewal worth 12% of annual revenue.
- The cyber insurance renewal questionnaire arrives in ten weeks.
- Eight months ago, a front-desk employee at the north clinic fell for an
  invoice-payment phishing email. No patient data was involved; $4,100 was
  lost and recovered. No formal investigation was performed.
- Two clinicians left in the last quarter. IT does not know whether their
  EHR accounts were disabled; there is no offboarding checklist.
- The 2019 HIPAA risk analysis exists as a six-page vendor PDF with no
  risk ratings and no owners.
```

You are the security support technician, three months into the role, and the only person in the organization who has been trained to do this. Angela has asked you for a register she can put in front of the funder and use for the insurance questionnaire.

## Requirements

**1. Scales, published with the register.** Define a five-point likelihood scale and a five-point impact scale, each level anchored in terms specific to Cedar Hollow. Impact must have at least four columns: patient data, clinical operations, financial, and regulatory. Anchor them to this organization's real numbers — 40,000 patients, six clinics, a nonprofit budget — not to a generic template. State your banding thresholds.

**2. At least fourteen risks.** Every entry must be written as a full scenario in the form `[threat source] may [action] by exploiting [weakness], resulting in [consequence to a named asset and to the organization]`. A register entry that is a noun phrase does not count toward the fourteen.

Your fourteen must include at least:
- three risks arising from the EHR or clinical workflow
- two **third-party or vendor** risks, at least one concerning Ridge Revenue Partners
- two risks arising from people or process rather than technology
- one risk concerning the availability or recoverability of data
- one risk that exists because of something nobody has verified, rather than something known to be broken

**3. Ratings with evidence.** Every risk carries a likelihood score, an impact score, a product, and a band. Every score carries a one-sentence justification naming the anchor level it matched and the fact that placed it there. A score with no justification sentence is incomplete. Where the driving factor is one impact column, say which.

**4. Inherent and residual.** For at least six risks, rate both inherent and residual risk, and state which existing control accounts for the difference. Where you have no evidence that a control operates, rate the residual as if the control were absent and say so — that judgement is itself a finding.

**5. Top five, defended.** Rank the register, then write one paragraph per top-five risk defending its position. Each paragraph must say why it sits above the risk below it, name what would change the rating, and name any other control the rating depends on. At least two of your top five will score the same; your paragraphs must break the tie on grounds other than the score.

**6. Treatments.** Assign mitigate, transfer, avoid, or accept to every risk, with a named owner role and a target date for anything above Medium.
- At least one must be **avoid**, and it must name what stops existing.
- Exactly one must be **accept**, written in the five-part format: risk ID, accepting party, date, rationale, expiry, compensating measure.
- Identify at least one risk that is **not eligible for acceptance** and say why.

**7. Vendor entries.** For each vendor risk, tier the vendor, list the specific artifacts you would request, and state which treatments are technical and which are contractual.

**8. Assumptions log.** A separate list of every fact you had to assume, what you assumed, and who at Cedar Hollow would confirm it. This is graded as heavily as the register.

## Constraints

- **You draft; Angela approves.** The register is a recommendation until the Security Officer signs it. Include an approval block with owner, approver, date, and next review date — unsigned.
- **No legal conclusions.** Do not state whether any scenario would constitute a reportable breach, whether Cedar Hollow is in violation of HIPAA, or whether the 2019 business associate agreement is adequate as a contract. Where a risk turns on one of these, write the technical facts and flag the question for the Privacy Officer and counsel. At least two of your entries should carry such a flag.
- **Do not invent facts.** If the brief does not tell you something, it goes in the assumptions log. Inventing a patch cadence or a backup retention period to make a rating look tidy defeats the whole exercise.
- **No control implementation.** This project does not design or configure anything. Naming "enable MFA on the EHR" as a treatment is in scope; explaining how to configure it is not.
- **Business continuity is out of scope as a discipline.** You will rate availability and recoverability risks, and you will reference the absence of a tested restore. You are not writing a continuity plan.
- **Plain artifacts.** A table or a structured text block. No slideware.

## Definition of done

- [ ] Likelihood and impact scales defined, anchored to Cedar Hollow, published with the register
- [ ] Banding thresholds stated
- [ ] At least 14 risks, every one written as a full scenario with a consequence
- [ ] Category minimums met: 3 EHR/clinical, 2 vendor (one being Ridge), 2 people/process, 1 availability, 1 unverified-condition
- [ ] Every rating has an evidence sentence naming the anchor matched
- [ ] At least 6 risks rated inherent and residual, with the differentiating control named
- [ ] Top five ranked with a defending paragraph each, including at least one tie broken on non-score grounds
- [ ] Every risk has a treatment, an owner role, and — above Medium — a target date
- [ ] One genuine avoid; exactly one accept in the five-part format; one non-acceptable risk identified with reasoning
- [ ] Vendor entries tiered, with artifact requests and technical/contractual treatments separated
- [ ] Assumptions log complete, with a named confirmer for each assumption
- [ ] At least two entries flagged for legal or privacy determination rather than answered
- [ ] Unsigned approval block present
- [ ] No entry states a legal conclusion

## Hints

**Start from the assets, not from a threat list.** Walk the systems block: EHR, billing feed, file server, email, endpoints, network, backups, remote access. For each, ask what an attacker or an accident could do to it and what that would cost this organization specifically. That produces better coverage than starting from a list of attack types, and it produces scenarios rather than nouns.

**The "nobody has verified" requirement is where the interesting risks are.** Cedar Hollow does not know whether two departed clinicians still have EHR accounts. It does not know whether its backups restore. It does not know whether the EHR vendor's backup claims are true. Unverified is a different state from broken, and rating it honestly — usually with a wide confidence range and a note that the rating cannot be tightened without evidence — is a mark of real skill.

**Watch the impact ceiling on the file server.** It is easy to under-rate an on-premises file server because it is not the EHR. Twelve years of scanned intake forms readable by every domain user is one of the highest-impact findings in this environment.

**The backup drive is in the same building as the file server.** Say what that means for two different scenarios, not one.

**The phishing incident from eight months ago is evidence for a likelihood rating.** Use it. An anchor that says "has occurred at this organization in the last 12 months" is met by a documented event, and citing it will do more to persuade the Executive Director than any framework reference.

**Look for the avoid candidate in the data nobody needs.** Ask which of Cedar Hollow's data or data flows could simply stop existing. Twelve years of unreviewed scans and a nightly demographic file that may contain more fields than the biller actually needs are both worth examining.

**Write the top-five paragraphs last and out loud.** If a defence does not survive being said aloud to an imagined Executive Director who wants to spend the money on a nurse practitioner instead, it will not survive the real one.
