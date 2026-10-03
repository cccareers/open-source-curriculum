---
course_id: se301
project_id: se301-x02
title: "One Deal, Three Platforms: Recording Harlan Freight in Salesforce, HubSpot, and GoHighLevel"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: stretch
related_lessons:
  - se301-02
  - se301-03
  - se301-04
  - se301-05
objectives:
  - Explain how a CRM models a sale — objects, records, stages, and their relationships
  - Work leads and opportunities through a Salesforce pipeline correctly
  - Manage contacts, deals, and activity in HubSpot
  - Operate pipelines and campaign automation in GoHighLevel
competency_ids:
  - D3-S1-C04
---

## Scenario

You are deciding which CRM **Waypoint Fleet Systems** (the Lesson 9 project company) should standardize on. Your manager wants evidence, not opinions, so you will record the same deal in all three platforms and report what each one keeps, collapses, or loses.

The deal comes from the Lesson 9 event feed, events 1, 4, 8, 9, and 16:
- Week 1: Dana Whitfield, Ops Manager at **Harlan Freight** (140 vehicles), submits a demo request.
- Week 2: demo held. Dana confirms the product addresses compliance reporting, names her VP as approver, and expects a decision in about six weeks. Scope is 140 vehicles.
- Week 3: the VP joins a call, confirms budget, and asks for a written proposal by end of week 4.
- Week 4: proposal sent at $54,000. Dana confirms receipt; it goes to the finance committee meeting in week 7.
- Week 6: the finance committee moves back one week.

## What you will produce

1. A one-page object map: for each platform, where the person, organization, sale, activities, and person-to-deal role live (Lesson 2 vocabulary map, completed from the live systems).
2. The deal recorded in all three platforms, with screenshots after each of the five events.
3. A comparison table: for each event, what you recorded, where, and what the platform forced, allowed, or could not represent.
4. A 600-word recommendation memo for Waypoint, naming one platform and the discipline you would have to impose by hand on it.

## Before you start

- Get access to a Salesforce Developer Edition org or Trailhead playground, a free HubSpot portal, and a GoHighLevel sub-account you're allowed to use for test data. Never use production systems. Use `example.com` addresses and phone numbers you control.
- If you can't get access to one platform, complete the other two and, for the missing one, write what you would have recorded and where, based on Lessons 3–5. Mark that column "not verified in a live system."
- Write your stage definition table (Lesson 7) before you start, and use the same stages in all three platforms.

## Milestones

1. **Object map (30 min).** Fill it in from the live systems, not from the lesson table.
2. **Event 1 (45 min, all three).** Salesforce: Lead, with status and source. HubSpot: Contact with a lifecycle stage and lead status. GoHighLevel: Contact with tags under your tag convention. No opportunity or deal yet.
3. **Event 4 (60 min).** Qualification is met. Salesforce: convert, matching an Account, and create the Opportunity. HubSpot: lifecycle stage to SQL and create the Deal. GoHighLevel: create the Opportunity in the pipeline. Record the VP as a second person with a role (contact role, association label, or your documented convention). Hold the stage if the technical evaluator wasn't present (see se301-v01).
4. **Events 8–9 (45 min).** Advance stages only when your exit criteria are met. Log activities against both the person and the deal. Set the amount and close date per your convention.
5. **Event 16 (15 min).** Move the close date once and note the push. Don't touch the stage.
6. **Compare and recommend (60 min).**

## Acceptance criteria

- [ ] No opportunity or deal exists before event 4 in any platform.
- [ ] The VP is recorded with a role in every platform, or a written convention is applied consistently where roles aren't supported.
- [ ] Every activity is associated with both the person and the deal where the platform allows it; where it doesn't, the gap is documented.
- [ ] Stages match your written exit criteria, and at least one held stage is recorded with its reason.
- [ ] The event 16 date push is recorded identically in intent across all three, with the stage unchanged.
- [ ] The comparison table names at least three distinctions that GoHighLevel collapses and at least two places where Salesforce enforces something the others leave to discipline.
- [ ] The memo recommends one platform and states one hand-imposed rule needed to make it work for Waypoint.

## Evidence checklist

- [ ] Object map
- [ ] 15 screenshots (5 events × 3 platforms), or documented gaps
- [ ] Comparison table
- [ ] Recommendation memo
- [ ] Your stage definition table

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Model understanding | Treats the platforms as different products with different concepts | Maps all five model objects correctly in each platform | Explains each collapsed distinction in terms of the market the platform was built for |
| Record correctness | Premature opportunities; free-text categories | Correct object at each event; picklists used | Field-mapping and association gaps found and documented with screenshots |
| Stage discipline | Stages follow activity | Stages follow written exit criteria | A held stage is defended in the memo as evidence of process integrity |
| Comparison quality | Opinion ("HubSpot is easier") | Evidence-based table per event | Identifies the single riskiest gap for a six-person buying committee on each platform |
| Recommendation | No clear choice | One platform plus one rule | Names what would change the recommendation (e.g., moving upmarket) |

## Stretch goals

- Add a speed-to-lead automation for event 1 in the platform you recommend, following the Lesson 6 spec format.
- Export the deal from each platform and rejoin the files on record ID; report what joined cleanly.

## Reflection prompts

- Which platform made it hardest to record the VP's role, and how did that change how you thought about the deal?
- Where did you most want to skip a step because the platform let you?

## Instructor notes

- Platform UIs and free-tier limits change often; check access paths before the cohort starts.
- Learners often create the HubSpot deal at event 1 because the form is right there. That is the premature opportunity Lesson 2 warns about.
- For a shorter session, do two platforms only.
