---
course_id: ai210
project_id: ai210-x01
title: "Applications Intake: Discovery-to-Requirements Case File"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ai210-02
  - ai210-03
  - ai210-08
objectives:
  - Run a discovery conversation that surfaces a client's real AI automation needs rather than their first stated request
  - Turn discovery findings into written requirements and success criteria a build can be judged against
competency_ids:
  - D4-S1-C01
  - D4-S1-C05
---

## Scenario
A regional nonprofit that administers a utility-bill assistance program has emailed your team one sentence: "We need AI to read incoming PDF applications." This is brief (c) from the ai210-02 practice. You have one 60-minute discovery slot with the program director (the sponsor) and the intake coordinator who processes applications today (the practitioner), plus a 20-minute follow-up call with the agency's compliance officer.

The stakes match the example ai210-02 uses for a high cost of being wrong: a wrong eligibility summary is a harm, not an annoyance. Your job is not to design the system. It is to find out what is really going on, write it down so both sides agree, and turn it into requirements and success criteria a build could be judged against.

## What you will build / produce
A case file of six artifacts:

1. A discovery session plan (adapted from the 90-minute plan in ai210-02, cut to 60 minutes).
2. Completed discovery notes in the ai210-02 notes template, from a live role-play.
3. A two-column request vs. need comparison, with evidence for each need.
4. A recap email to the client, under 200 words, ending with a request for corrections.
5. A solution requirements and success-criteria document using the full ai210-03 template (all 11 sections).
6. A stakeholder map in the ai210-08 table format, naming one quiet blocker and one late gate.

## Before you start (prerequisites, starter files or data)
- Complete ai210-02 and ai210-03. Read the stakeholder map section of ai210-08.
- Find two partners. One plays the program director, the other plays the intake coordinator (and later the compliance officer). If you only have one partner, they play both client roles in separate sessions. Running them separately is a technique from ai210-02 anyway.
- **Client role cards (give these to your partners, not to the interviewer).** Partners may add details, but must keep these facts and reveal each one only if asked a question that reaches it:

  **Program director card**
  - Wants "AI" because the board asked about it at the last meeting.
  - Believes the bottleneck is reading the PDFs.
  - Tracks one number: days from application received to decision. Currently averages 19 days and the funder's target is 10.
  - Will not mention, unless asked about the far end of the output, that rejected applicants have complained that nobody told them why.

  **Intake coordinator card**
  - Processes about 60 applications a week, rising to roughly 250 a week in the two weeks after the winter assistance window opens.
  - Reading the PDF takes about 4 minutes. Chasing missing documents (pay stubs, utility bill) by phone and email takes most of the time: about 40% of applications are incomplete on arrival.
  - Keeps a private spreadsheet of "who I'm waiting on", which is the real tracking system.
  - Roughly 1 in 6 applications are handwritten scans; some are in Spanish.
  - Hidden exception: households with a medical-equipment exemption skip the income check entirely, and only she knows the rule.

  **Compliance officer card**
  - Applicant data includes income and household members, including minors. It may not be sent to any service that has not passed the agency's vendor review.
  - Every denial must be signed by a named staff member. This is a policy requirement.
  - Will ask, unprompted, whether applicants are told AI was involved.

## Milestones
1. **Plan (45 min).** Write a 60-minute session plan with timings. Write down the five questions from the ai210-02 bank you most expect to need and why. Ask the client for artifacts in advance: a redacted sample application, a blank form, and the coordinator's tracking sheet.
2. **Discovery role-play (60 min).** Run the session. Open with "walk me through the last time this happened." Do not propose any solution. Keep request and need in two columns as you go.
3. **Compliance follow-up (20 min).** Run a separate short session with the compliance officer. Use the CONSEQUENCE AND RISK questions from the bank.
4. **Write up the same day (60 min).** Fill in the notes template from your notes alone. Leave blanks blank. Write the two-column comparison and the recap email. Send the email to your partners and have them mark every incorrect sentence.
5. **Requirements document (2 h).** Convert findings to at least 12 requirements, each with a Source entry. Prioritize so no more than half are Must. Write at least five success criteria (at least one quality, one experience, and one business criterion) and the failure criteria. The business criterion should use the days-to-decision measure with its 19-day baseline.
6. **Stakeholder map and review (45 min).** Build the stakeholder map. Then run a 15-minute document review with the "director". Send three specific questions in advance, then walk section 7 line by line. Record the version change that results.

## Acceptance criteria
- [ ] The session plan shows timings and lists what you will not do in the session (no scoping, no quoting).
- [ ] The notes template is complete apart from honest blanks, and the Stated request field quotes the client verbatim.
- [ ] The two-column comparison names an underlying need that is different from "read PDFs". The likely candidate is incomplete applications and document chasing. Each need cites session evidence.
- [ ] At least two of the three hidden facts on the role cards were surfaced: the medical-equipment exemption, the vendor-review data constraint, and the denial explanation gap for applicants.
- [ ] The recap email is under 200 words, lists open questions, and asks for corrections. The partners' count of incorrect sentences is recorded.
- [ ] The requirements document has all 11 sections. Sections 4, 8, 9, and 10 are not empty.
- [ ] Every requirement names something checkable and no requirement names a technology.
- [ ] At least one requirement covers the signed-denial rule, and at least one covers non-English or handwritten input.
- [ ] Each success criterion names the measure, threshold, sample, and judge. The business criterion has a baseline and a date.
- [ ] Failure criteria include a never-event, such as "no denial is issued without a named staff signature".
- [ ] The stakeholder map has at least six roles, including applicants as recipients of the output, and names a quiet blocker and a late gate.

## Evidence checklist
Submit a single folder or document containing:
- [ ] Session plan
- [ ] Raw notes (photo or scan is fine) and the completed notes template
- [ ] Two-column comparison
- [ ] Recap email, plus your partners' markup and the count of incorrect sentences
- [ ] Requirements document, version 1 and the version after review, with a version note
- [ ] Stakeholder map
- [ ] A one-paragraph self-score: which hidden facts you found, which you missed, and the question that would have found each missed fact

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Discovery technique | Proposes solutions or asks mostly yes/no questions; few concrete episodes | Opens with a recent episode, follows one application end to end, proposes nothing | Also reconciles the director's and coordinator's accounts as neutral questions, and catches the second audience (applicants) unprompted |
| Request vs. need | Need restates the request | Need is evidenced and differs from the request | Shows that part of the need can be met without AI (e.g. a missing-documents checklist on the form) and says so |
| Requirements quality | Requirements name technologies or cannot be traced | Testable, technology-free, traced to sources, honestly prioritized | Lists demoted Musts with reasons and records assumptions with owners |
| Success and failure criteria | Vague ("accurate summaries") | All four properties are present, with a baseline on the business criterion | Thresholds are anchored to the current-state error cost, and the sample size is credible for the threshold |
| Stakeholder alignment | Lists roles only | Records needs, timing, and likely objection for each role | Has a dated plan to bring in the late gate (compliance) in week one |
| Communication | Recap is long or unconfirmed | Recap is under 200 words, with corrections requested and counted | Correction count is low, and changes are reflected in the version notes |

## Stretch goals
- Run a "hostile sponsor" variant: the director insists the board has already approved a specific vendor tool. Keep the session in discovery mode without arguing.
- Add a one-page "where AI does not fit" note. Identify which steps are better served by a form change or a checklist, using the "Listen for where AI does not fit" guidance in ai210-02.
- Draft the recipient-facing question set you would use to interview two applicants about the denial explanation gap.

## Reflection prompts
- Which question in your session produced the most surprising answer, and was it an episode question or an opinion question?
- Where did the director's and the coordinator's accounts diverge? What would a solution built only from the director's account have got wrong?
- Which assumption in your requirements document worries you most, and who owns it?
- If the compliance officer had been left until week ten, which of your requirements would have been overturned?

## Instructor notes (common pitfalls, how to adapt for time)
- **Pitfall: accepting "read PDFs" as the need.** Most learners find the document-chasing problem only if they ask about the last application from start to finish. If nobody finds it, replay the first ten minutes and point at the moment the episode question was skipped.
- **Pitfall: proposing OCR or a model in the session.** Have the partners respond to any proposal by evaluating it enthusiastically. This shows how proposing ends discovery.
- **Pitfall: success criteria on tiny samples.** A criterion of 98% measured on 20 applications cannot be evidenced, because one error drops the score to 95%. Push learners toward a sample of 100 or more, or a lower threshold paired with review.
- **Partner briefing:** give partners the role cards at least ten minutes early and tell them to answer honestly but not volunteer.
- **To shorten to 3 hours:** drop milestone 3 and give the compliance facts as a written memo. Require only sections 1, 2, 4, 5, 7, and 8 of the requirements document.
- **To extend:** chain this case file into ai210-x02 by prototyping the intake coordinator's missing-documents screen instead of the draft-reply screen.
