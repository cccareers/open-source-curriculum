---
course_id: se301
title: "CRM System Mastery & Sales Automation — Enhancement Review"
reviewed_lessons: 9
status: draft
---

## Summary

A well-architected course that teaches the CRM model first and then three platforms as "the same model in different vocabulary," with excellent platform-neutral material on automation specs, hygiene, and forecasting. I re-checked the twelve-deal forecast arithmetic; every number is correct except one concentration sentence (fixed). The biggest opportunities are (1) modeled screen demos of good vs. weak record entry, since the skill is procedural, and (2) a rehearsal of defending a forecast to a skeptical manager before the capstone.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| se301-08 | "Step 7 — the risks the arithmetic does not show" | "The four commit deals are 100% of the commit number, and one of them ($120,000, Calder) is 20% of it." Calder is 43% of the $280,000 open commit; 20% only of the $590,000 commit forecast including closed. | Rewrote to state both figures explicitly. | Applied |
| se301-08 | "The worked calculation" | Vale (Aug 15) and Cobalt (Aug 29) dates are only valid if "today" is before them; the lesson never states today's date, and the hygiene lesson says past dates on open deals are always defects. | State "It is week three of the quarter (mid-July)" at the top of the worked calculation. | Proposed |
| se301-05 | "Opportunities: pipelines, stages, and status" | Status values (Open/Won/Lost/Abandoned) and the agency/sub-account/snapshot model are correct as of this review, but GoHighLevel changes quickly; "Contacts" vs. newer "Companies" object availability varies. | Add a dated "verified as of" note; owner to re-verify each term. | Proposed |
| se301-04 | "Sequences and workflows" | Sequences/workflows/association labels are paid-tier features; the free-portal practice (Ex. 5c active list) may also be tier-limited. | Add a one-line fallback for free-tier learners on Ex. 5. | Proposed |
| se301-03 | "Practice" | Trailhead playgrounds and Developer Edition availability/terms change; not verified in this pass. | Re-verify before each cohort. | Proposed |
| All lessons | End of lesson | No self-check. | Added "Check your understanding" to se301-02 through se301-08. | Applied |

## Depth and coverage gaps

- **Modeled record entry.** Learners read about two-sided activity association and exit-criteria discipline but never watch it done. Drafted se301-v01 for "Explain how a CRM models a sale — objects, records, stages, and their relationships" and "Apply CRM hygiene rules that keep pipeline data trustworthy".
- **Forecast defense.** Lesson 8's artifact is excellent; there is no practice of presenting it to a skeptic. Drafted se301-x01 for "Produce a defensible forecast from CRM opportunity data".
- **Visualizing the forecast funnel.** The six-step calculation is dense; drafted se301-a01.
- **Data model for multi-person deals in GoHighLevel.** Lesson 5 says to compensate "with discipline" but gives no worked convention. A sample convention (shared tag + custom "role" field + pinned opportunity note) would help "Operate pipelines and campaign automation in GoHighLevel".
- **Automation testing log example.** Lesson 6 asks for expected-vs-actual test tables but shows none filled in; one worked example for spec 1 would help "Design an automation or workflow that removes manual steps from a sales process".
- **HubSpot-specific worked deal.** Lesson 4 uses Priya/Calder; tie it explicitly to the same Calder deal used in Lessons 2–3 so learners can compare one deal across platforms (supports "Manage contacts, deals, and activity in HubSpot").

## Proposed additional projects

- **Drafted — se301-x01** `projects/01-mock-pipeline-review-forecast-call.md`: seeded-defect hygiene audit plus a recorded mock pipeline review with a skeptical manager persona.
- Not yet drafted — **Automation spec review board**: learners swap Lesson 6 specs and must find an unhandled case in each; then build and test.
- **Drafted — se301-x02** `projects/02-one-deal-three-platforms.md`: record the Harlan Freight deal (Lesson 9 events 1, 4, 8, 9, 16) in Salesforce, HubSpot, and GoHighLevel and recommend one platform with evidence.
- Idea: **Duplicate detective** — a seeded contact list with 15 near-duplicates; merge plan with survivor rationale.

## Video and animation opportunities

- **Drafted — se301-v01** "After the Call: Logging Harlan Freight Badly and Well" (se301-02, se301-07), screencast on a generic CRM mock-up.
- **Drafted — se301-a01** "From $1.25M Pipeline to a $690K Forecast" (se301-08), Manim.
- **Drafted — se301-v02** "Spec Before You Build: The Welcome Message That Sent Five Times" (se301-06), whiteboard on trigger vs. condition and the four most-skipped spec sections. (Covers the planned "Trigger vs. Condition" concept; the separate animation remains an idea.)
- Not yet drafted — animation: "Trigger vs. Condition" showing a bulk edit mass-enrolling 200 deals vs. a field-change trigger enrolling one (se301-06). Motion makes the event/state distinction visible.
- Idea: screencasts of lead conversion in Salesforce (field mapping trap) and lifecycle vs. lead status in HubSpot — vendor UIs change, so produce close to cohort start.

## Assessment ideas

- Vocabulary-map drag-and-drop: match ten concepts to each platform's term.
- Stage-criteria critique: twelve candidate exit criteria; learner marks valid/invalid with reason (buyer-based, verifiable, binary).
- Auto-checked forecast spreadsheet with parameterized deals.

## Changes applied in this pass

- `catalogue/courses/se301/lessons/08-forecasting-from-the-crm.md`, "Step 7 — the risks the arithmetic does not show": corrected Calder's share of commit.
- Added "Check your understanding" to `02-how-a-crm-models-a-sale.md`, `03-working-leads-and-opportunities-in-salesforce.md`, `04-contacts-deals-and-activity-in-hubspot.md`, `05-pipelines-and-campaigns-in-gohighlevel.md`, `06-designing-sales-automation-and-workflows.md`, `07-crm-hygiene-and-stage-discipline.md`, `08-forecasting-from-the-crm.md`.

## Open questions for the course owner

- Platform specifics (Salesforce forecast categories and lead conversion behavior, HubSpot tiering, GoHighLevel legacy Campaigns/Triggers, 10DLC requirements) were consistent with my knowledge but not verified against current vendor documentation in this pass.
- Should the course state a "today" date for the Lesson 8 worked pipeline?
- Names reused across the pathway (Dana Whitfield, Priya, Calder, Meridian) with different roles — intentional continuity or accidental?
