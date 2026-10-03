---
lesson_id: dm350-09
course_id: dm350
pathway: digital-marketer
title: Privacy, Consent, and Data Governance in a CRM
order: 9
kind: lesson
competency_ids:
  - D7-S2-C01
objectives:
  - Handle consent, retention, and data-subject requests in a CRM lawfully
---

## Read This First

This lesson is an orientation, not legal advice. It teaches you the shape of the obligations a marketer runs into, the vocabulary to discuss them, and the operational habits that keep a CRM defensible. It does not tell you what the law requires of your organization, and it cannot: the rules differ by where your contacts live, what sector you operate in, and how your business uses the data, and the text of these regimes changes. Every rule of thumb below must be checked against the current text and against advice from someone qualified to give it before it becomes a policy.

What you are responsible for is different from what a lawyer is responsible for. You are responsible for knowing when to ask, for building systems that can honour whatever answer you get, and for not creating problems that are expensive to unwind. A marketer who says "I'm not sure — let me check before we import that list" is doing the job correctly.

## Two Regimes, One Posture

Two frameworks come up constantly. Learn what each is *about*, not its section numbers.

**GDPR** is the European Union's general data protection regulation; the United Kingdom operates a closely related regime. Its organizing idea is that processing someone's personal data requires a **lawful basis** — you must be able to name a legitimate reason you are allowed to do this at all. Consent is one such basis and it is the one marketing usually relies on for email. Consent under this regime has to be freely given, specific, informed, and unambiguous, which in practice means an unchecked box, plain wording, a real choice, and a record of what was agreed. It applies based on where the *individual* is, not where your company is, so a US firm with subscribers in Europe is inside its scope. It grants people rights over their data: to know what you hold, to get a copy, to have it corrected, to have it deleted, to object to marketing.

**CCPA**, as amended and extended in California, is built on a different instinct: notice and choice rather than prior permission. It focuses on telling people at the point of collection what you are collecting and why, and on giving them the right to know, to delete, to correct, and to opt out of the sale or sharing of their personal information. Several other US states have since adopted broadly similar frameworks with their own variations.

The difference that matters operationally is posture. Broadly, the European approach is **opt-in** — get permission first — and the Californian approach is **opt-out** — be transparent and honour refusals. That is a simplification, and it is the simplification that leads to the right architecture, because a system built to the stricter posture satisfies both.

That is the recommendation this lesson makes: **build to opt-in, everywhere, for everyone.** Not because it is legally required of every contact — it is not — but because a single consistent standard is enforceable, auditable, and cheap, whereas maintaining two standards inside one CRM means somebody eventually applies the wrong one to the wrong contact. Northlight has clients and prospects in California and about 200 contacts in the UK and EU from a podcast appearance. Running two rulebooks over one database for those two groups is how mistakes happen.

Two vocabulary items that will come up in meetings: the organization deciding *why and how* data is used is generally the **controller**, and a vendor processing it on that organization's instructions is generally a **processor** — which is why your CRM and email platform contracts include data processing terms. And "personal data" is broader than most marketers assume: an email address is personal data, and so is an IP address, a cookie identifier, and a behavioral profile attached to a person.

## Consent Is a Record, Not a Checkbox

Lesson 02 flagged that a boolean consent field is the wrong shape. Here is why. When someone asks you to demonstrate that a contact agreed to receive marketing, a `true` proves nothing. You need four things: **what** they agreed to, **when**, **how**, and **in what words**.

```json
{
  "email": "sam.iyer@brightloom.co",
  "marketing_consent_status": "opted_in",
  "consent_timestamp": "2026-02-19T14:32:11Z",
  "consent_source": "form:quarterly-close-checklist",
  "consent_wording_version": "v3-2026-01",
  "consent_ip": "recorded",
  "subscription_newsletter": "opted_in",
  "subscription_quarterly_campaign": "opted_in",
  "subscription_client_operational": "n/a",
  "last_consent_change": "2026-02-19T14:32:11Z",
  "opt_out_timestamp": null,
  "opt_out_source": null,
  "data_retention_review_date": "2029-02-19"
}
```

Four design choices there.

**`consent_wording_version` points at an archived copy of the exact text shown.** Wording changes; the record of what a specific person agreed to must not. Keep the versions in a document with dates.

**Subscriptions are separate from the overall status.** Someone can want the quarterly campaign and not the newsletter. Granularity is both a legal virtue and a commercial one, because the alternative to a granular opt-out is a total unsubscribe.

**Operational messages are marked `n/a`, not `opted_in`.** A booking confirmation or an invoice is not marketing; it does not need marketing consent and it must not be used as a delivery vehicle for marketing content. Keeping the two categories in different fields keeps the distinction honest.

**There is a retention review date on the record itself.** More on that below.

Then the crucial operational rule: **the opt-out must be as easy as the opt-in, and it must be honoured everywhere, quickly.** In practice that means one unsubscribe action removes the contact from every marketing workflow, list, and campaign, including ones built by someone else last year. If your unsubscribe only removes people from the list they were on when they clicked, you have a system that will re-email people who told you to stop.

## Every Entry Point Is a Consent Point

Audit them. At Northlight there are five, and a new marketer typically finds two of them are wrong.

```txt
  ENTRY POINT              CONSENT MECHANISM                        STATUS
  Checklist form           unchecked box, wording v3, stored        OK
  Fit call form            unchecked box, wording v3, stored        OK
  Site chatbot             explicit step with a real "no" option    OK (lesson 08)
  Conference imports       NOTHING - no consent column at all       BROKEN
  Advisor manual entry     nobody asks; the record is just created  BROKEN
```

The two broken ones are the two everybody has. The conference spreadsheet from lesson 02 is the classic: real people who handed over a business card at a stand, which is not the same as agreeing to receive a marketing programme. The defensible path is a single, plainly written invitation to opt in — and if they do not, they are not in the marketing database.

Manual entry by colleagues is the quieter problem, because it looks like nothing. An advisor creates a contact after a phone call, the record defaults to eligible, and it enters a nurture workflow that evening. The fix is architectural rather than educational: make `marketing_consent_status` a required field on creation with no marketing-eligible default, so the system asks the question every single time.

Two more habits worth fixing early. **Never pre-tick a box**, and never bundle consent to marketing into agreement to terms of service — permission bundled with something else is not freely given. And **state at the point of collection what you will send and how often**; that sentence is both a compliance nicety and, as lesson 07 showed, one of the more effective spam-complaint reducers available.

## The Decision Table

Most day-to-day questions are answerable from a table like this one. Build yours with your own counsel and keep it where the team can see it.

```txt
NORTHLIGHT - marketing data decision table (internal, reviewed annually)

  SCENARIO                          MAY WE EMAIL?   RETENTION      NOTES
  Downloaded a guide, opted in      yes, marketing  3 yrs from     review at 3 yrs
                                                    last activity
  Downloaded a guide, declined      no marketing;   1 yr           suppress from
  marketing                         delivery only                  all campaigns
  Business card at a conference     NO - not until  90 days to     then delete if
                                    they opt in     seek opt-in    no opt-in
  Purchased or rented list          NEVER           do not import  see lesson 07
  Existing client                   operational     7 yrs from     tax/records
                                    yes; marketing  engagement     rules drive
                                    only if opted   end            this - ask
  Former client, no opt-in          no marketing    7 yrs          suppress
  Fit call held, did not buy        yes if opted    2 yrs from     recycle path
                                    in                last contact
  Disqualified by an advisor        no              2 yrs          keep the
                                                                   suppression
  Unsubscribed                      never again     suppression    suppression
                                                    entry is       list is
                                                    permanent      permanent
  Hard bounced                      never again     permanent      technical
                                                    suppression    suppression
  Asked us to delete their data     no              delete;        see runbook
                                                    keep only the
                                                    suppression
                                                    entry
  Chat transcript, no email given   n/a             90 days        anonymous
                                                                   visitor data
```

Two things about that table are more important than its contents. It exists in one place, so nobody has to reconstruct the reasoning under pressure. And every row has a **retention** answer, not just a permission answer — which is the part marketers skip.

## Retention: Data You Keep Is Data You Must Defend

The instinct is to keep everything forever. Resist it, for three reasons.

Data you hold is data you are accountable for. Every record in the CRM is one you must be able to justify, secure, produce on request, correct, and delete. Twelve thousand contacts you will never email are twelve thousand liabilities and zero assets.

Old data is usually wrong data. Lesson 02 noted that a large share of a business list changes jobs each year. A four-year-old contact record is mostly fiction, and fiction that generates hard bounces, as lesson 07 showed.

And a retention schedule is the thing that makes a deletion request answerable. If you cannot say how long you keep things and why, you also cannot demonstrate that you deleted what you should have.

So: give every category of data a retention period tied to an event ("three years from last activity," not "three years"), write down the justification in one sentence, put a review date on the record as the schema above does, and automate the review — a monthly report of records past their review date, sent to a human who decides.

## Data Subject Requests

Someone emails and asks what you hold about them, or asks you to delete it. This is routine, it arrives more often than people expect, and it must not depend on who happens to open the inbox. Write the runbook.

```txt
DATA SUBJECT REQUEST RUNBOOK - Northlight

  0  INTAKE      Requests may arrive anywhere: privacy@, a reply to a
                 campaign, the chat widget, an advisor's inbox. Every
                 employee logs it to privacy@ the same day. No exceptions.

  1  LOG         Record: date received, requester, request type (access,
                 deletion, correction, opt-out, portability), and the
                 internal due date. Track it like a ticket, not an email.

  2  VERIFY      Confirm the requester is who they say they are, without
                 collecting more sensitive data to do it. Replying to the
                 address on file is usually enough for an email-based record.

  3  LOCATE      Search every system, not just the CRM: email platform,
                 chat transcripts, ads audiences, spreadsheets, the analytics
                 tool, and any vendor holding a copy. Keep a written
                 inventory of these systems - you cannot search what you
                 have forgotten you own.

  4  DECIDE      Some data may have to be kept for other reasons - accounting
                 and tax records are the common case. Deletion is not always
                 total. Where you keep something, record why.

  5  EXECUTE     Access: assemble a plain-language copy of what you hold.
                 Deletion: delete, then ADD a suppression entry (below).
                 Correction: fix it at source, then in every copy.
                 Opt-out: apply across every list and workflow, at once.

  6  RESPOND     In writing, in plain language, within your internal SLA and
                 within whatever the applicable regime requires - check the
                 current timeframe, do not rely on memory.

  7  CLOSE       Record what was done. This log is your evidence.

  INTERNAL SLA: acknowledge within 2 business days, complete within 20.
  Set your own SLA inside the legal deadline, never equal to it.
```

Step 5 contains the trap that catches nearly everyone, and it is worth stating on its own.

## The Deletion and Suppression Trap

Someone asks to be deleted. You delete the record thoroughly. Six weeks later marketing imports an event list, that person's address is on it, and they receive a campaign — from a company they explicitly told to erase them. This is worse than never having deleted them at all.

The resolution is that **suppression is not the same as deletion, and a suppression entry must survive a deletion.** After honouring a deletion request you keep the minimum needed to ensure you never contact that person again — typically a hashed or otherwise minimized record of the address on a permanent do-not-contact list, and nothing else. No name, no behavior, no profile.

Verify that your platform does this, because platforms differ. Some maintain the suppression automatically; some do not, and delete the unsubscribe record along with the contact. Test it with a real deletion before you find out the hard way.

The same principle covers the unsubscribe list. It is permanent, it is never "cleaned," and it is applied before every send — which is why lesson 06 put suppression at the top of every workflow rather than the bottom.

## Vendors, Access, and Everyday Governance

Three smaller habits that carry most of the remaining risk.

**Know where the data goes.** Your CRM, email platform, chat tool, analytics, and any AI feature all hold or transmit personal data, sometimes across borders. Keep a written inventory of these systems, what each holds, and the data terms in each contract — and ask specifically, before enabling a new AI capability, whether your data is used to train anyone else's model. That question belongs in the evaluation rubric from lesson 08, and it is one of the few items on it that cannot be undone later.

**Collect less.** Every field on lesson 03's form audit that had no downstream use was also a privacy liability. Minimization is not an ethical luxury; it is the cheapest possible compliance strategy, because data you never collected requires no consent, no retention rule, and no deletion.

**Limit access.** Not everyone needs to export the whole database. Role-based permissions and a habit of not keeping local spreadsheet copies remove a whole category of incident. The most common real-world breach in a small company is not an attacker; it is an export sitting in someone's downloads folder.

And the situation you will actually face: somebody asks for something you should not do. Ruth forwards a purchased list of 3,000 agency owners and asks you to run the quarter-close campaign to it. The answer is no, and the useful version of no has three parts — what the risk is in business terms (the deliverability damage from lesson 07, plus a compliance exposure nobody can size in advance), what you will do instead (a re-permission approach, or spending the same money on the capture path from lesson 03), and an offer to get a definitive answer from someone qualified. "We should check with counsel first" is a complete and professional sentence.

## Practice

1. **Design the consent record.** Write the full set of consent-related properties you would add to a CRM for a business of your choosing, in the JSON format above, with a one-line definition of each. Include at least two subscription types and one operational category that is explicitly not marketing. Then write the exact wording you would put next to the checkbox, and say where the archived version of that wording would live.

2. **Audit the entry points.** List every way a contact could enter Northlight's CRM, based on lessons 02, 03, and 08. For each, state the consent mechanism, whether it is adequate, and — for the inadequate ones — the specific change that fixes it. Say which of your fixes is architectural and which relies on people remembering.

3. **Fill in the decision table.** Take the table above and add five rows it is missing: a webinar attendee from a co-hosted event with a partner, a contact who replied to a cold email from an advisor, a client's employee added by that client, someone who filled in a form with an obviously fake name, and a contact who opted out and then filled in a new form six months later. For each, decide the email answer and the retention period, and write the one-sentence justification. Mark any row where you would want counsel to confirm.

4. **Write the runbook for your own context.** Adapt the seven-step runbook to a business you know. Name the systems that would have to be searched in step 3 — all of them, including spreadsheets — and set an internal SLA. Then write the plain-language reply you would send to someone requesting deletion, in under 150 words.

5. **Rehearse the trap.** Describe, step by step, exactly what your system does when a contact requests deletion and then their address appears on an imported list three months later. If the answer is "they get emailed," fix the design until it is not. Then write the two-sentence answer you would give Ruth when she asks why the deleted contact is still on a list somewhere.
