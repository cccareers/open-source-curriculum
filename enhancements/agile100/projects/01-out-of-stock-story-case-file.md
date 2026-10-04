---
course_id: agile100
project_id: agile100-x01
title: "Case File: STORY-104 From Refinement to Review"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - agile100-04
  - agile100-05
  - agile100-07
  - agile100-08
objectives:
  - Turn a user story's acceptance criteria into testable checks
  - Plan a sprint's testing work against scope and delivery dates
  - Track defects from discovery through verified closure
  - Demonstrate completed work and give useful retrospective input
competency_ids:
  - D1-S1-C02
  - D5-S1-C03
  - D4-S1-C04
  - D2-S1-C01
  - D2-S1-C04
  - D2-S1-C02
---

## Scenario

You are the QA engineer on the same storefront team you have followed through Lessons 04 to 08. The team just finished a one-week sprint containing STORY-101 (wishlist save/remove), STORY-104 (out-of-stock storefront hide), and STORY-108 (search index config fix). Your lead wants a single, self-contained **case file** for STORY-104 that a new apprentice could read next quarter to see what "good QA work on one story" looks like from refinement to review.

The catch: STORY-104 did not go smoothly. Here is what you know from the tracker, the standup log, and the warehouse-service team's channel:

```text
STORY-104: Out-of-stock storefront hide (3 points)
As a warehouse clerk
I want to mark an inventory item as "out of stock"
So that the storefront stops showing it as available

AC1 (as first written in refinement):
  The storefront should update quickly when stock runs out.

AC2:
  Given an item marked "Out of Stock"
  When a customer tries to add it to their cart
  Then the "Add to Cart" button is disabled

Sprint facts:
  - Day 1: planning; STORY-104 depends on a warehouse-service API change
    owned by another team (listed as a risk in the sprint test plan).
  - Day 3: warehouse-service change lands half a day late.
  - Day 4 morning: STORY-104 marked "Ready for QA".
  - Day 4 afternoon: you observe the "Out of Stock" badge taking 3-5
    minutes to appear on staging. Filed as BUG-160.
  - Day 4 late: you also notice that a customer who already had the item
    in their cart before it went out of stock can still check out.
  - Day 5 morning: developer marks BUG-160 "Fixed" (cache TTL lowered).
  - Day 5: sprint review and retrospective.
```

Your job is to produce the artifacts a careful QA engineer would have produced at each step, plus an honest account of where the plan held and where it did not.

## What you will produce

A single folder (or shared doc with one section per artifact) named `STORY-104-case-file/` containing six artifacts:

1. `01-testability-review.md` - the refinement review of AC1 and AC2.
2. `02-test-cases.xlsx` (or `.csv` / doc table) - test-case table traced to AC.
3. `03-test-plan-slice.md` - the STORY-104 portion of the sprint test plan, including schedule and risks.
4. `04-defects.md` - two defect records (BUG-160 and the cart-checkout finding) and the BUG-160 lifecycle log.
5. `05-review-report.md` - the STORY-104 block of the sprint review verification report plus your spoken opening line.
6. `06-retro-note.md` - one evidence-based retrospective note with a paired "try next time".

## Before you start

- Complete Lessons 04, 05, 07, and 08 (or at least read their templates).
- Have the Lesson 04 test-case table, Lesson 05 sprint test plan skeleton, Lesson 07 defect template, and Lesson 08 verification report format open side by side. You must reuse those formats exactly; do not invent new ones.
- Any spreadsheet or document tool works. No code is required.

## Milestones

1. **Refinement review (45 min).** Run AC1 and AC2 through the three-question testability check (observable, specific, bounded). AC1 fails. Rewrite it in Given/When/Then form using the 1-minute requirement that appears in Lesson 04's practice story. Record which question(s) the original failed and why.
2. **Test cases (60 min).** Build the test-case table with at least five rows: one per AC, plus at least three edge cases marked "not in AC, added by QA". At least one edge case must be a boundary (for example, quantity goes from 1 to 0 versus from 0 to 0) and at least one must cover an item already sitting in a customer's cart.
3. **Test plan slice (45 min).** Write the STORY-104 lines for every section of the Lesson 05 skeleton. In Schedule, show the original plan (STORY-104 testable Day 4) and add a dated "Replan" line explaining what you did when the dependency slipped on Day 3. In Risks, state the dependency risk and what you would have said in standup on Day 3.
4. **Defect records and lifecycle (60 min).** File BUG-160 and a second defect for the cart-checkout finding using the full Lesson 07 template. Assign severity and priority separately, with one sentence justifying each. Then write a lifecycle log for BUG-160 from New to Closed (or Reopened), one line per transition, stating what you checked before moving it. Decide whether the second defect is in scope for STORY-104 or should be deferred, and record the reason in the known-defects style from Lesson 07.
5. **Review report and retro (45 min).** Write the STORY-104 block of the verification report (Verified / Not verified), a two-sentence spoken opener, and one retro note about the late dependency with a concrete "try next time".

## Acceptance criteria

- [ ] The rewritten AC1 names a concrete time limit and an observable on-screen state, and is in Given/When/Then form.
- [ ] Every test-case row traces to an AC ID or is explicitly marked "not in AC, added by QA".
- [ ] The test plan slice includes all five Lesson 05 sections and a dated replan entry.
- [ ] Both defect records include every Lesson 07 field; severity and priority differ in at least one record or the justification explains why they match.
- [ ] The BUG-160 lifecycle log never moves from Fixed to Closed without a Verified step that re-ran the original repro steps.
- [ ] The review report never describes an unverified AC as "done".
- [ ] The retro note cites a specific day and event from the sprint facts, not a general complaint.

## Evidence checklist

- [ ] Six artifacts, saved and dated, in one folder or doc.
- [ ] Original AC1 text quoted beside the rewrite.
- [ ] Test-case table with Pass/Fail and Actual result columns filled in for at least the AC rows (you may invent plausible results consistent with the sprint facts).
- [ ] BUG-160 lifecycle log with timestamps.
- [ ] Spoken opener recorded (phone audio is fine) or signed off by a peer who heard it.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Testability review | Flags AC1 as weak but rewrite is still vague | Rewrite is observable, specific, bounded | Also spots a weakness in AC2 (for example, it says nothing about items already in the cart) and proposes an extra AC for the PO to accept or reject |
| Test-case traceability | Rows exist but some do not map to AC | Every row maps to AC or is marked QA-added | Edge cases chosen for production risk, with a one-line rationale each |
| Planning against the date | Schedule ignores the slip | Replan line shows what moved and when it was raised | Replan protects retest time for BUG-160 and names what was cut or deferred |
| Defect records | Missing fields or severity equals priority by default | Complete, reproducible, justified severity/priority | Includes evidence (log line, screenshot description) and a clear in-scope/deferral decision |
| Honest reporting | "STORY-104 done" | Verified vs not verified stated per AC | Opener leads with the summary and pre-answers "so what now?" |
| Retro input | General complaint | Specific, evidence-based, paired suggestion | Suggestion is measurable next sprint (for example, "dependency ready-date confirmed in planning") |

## Stretch goals

- Write the Day 3 standup escalation for the dependency slip using the Lesson 06 four-part structure.
- Add a "usability feedback, not a bug" note (Lesson 08) about anything you noticed in the out-of-stock UI.
- Convert your test-case table into a smoke-test checklist that a teammate could run in under five minutes on the next sprint.

## Reflection prompts

- Which artifact would have saved the most time if it had been written one day earlier? Why?
- Where did you feel pressure to call something "done" that was not verified? What did you write instead?
- If the PO rejects your extra cart-checkout AC, what is the honest way to record that risk?

## Instructor notes

- **Common pitfalls:** learners rewrite AC1 as "within 1 minute" without naming what appears on screen; learners close BUG-160 on the developer's word; learners fold the cart-checkout finding into BUG-160 instead of filing it separately.
- **The cart-checkout finding is deliberately ambiguous.** Either "file and defer with a recorded reason" or "raise with the PO as a missing AC" is acceptable if justified. Silently ignoring it is not.
- **Time-boxing:** for a 2-hour version, drop milestone 3 and supply a pre-filled test plan slice for learners to critique instead.
- **Pairing variant:** one learner plays QA, another plays the developer who marks BUG-160 fixed; the developer may (privately) decide the fix only works for new items, so the QA learner's verification either catches it or does not.
