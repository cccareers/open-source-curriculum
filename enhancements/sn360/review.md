---
course_id: sn360
title: "Customer Service Management (CSM) Implementation — Enhancement Review"
reviewed_lessons: 11
status: draft
---

## Summary

A practical, well-sequenced course that keeps one customer (Northwind Manufacturing: parent plus Rivergate and Ashcroft plants, contacts Dana, Sunil, Priya) running from the data model through routing and measurement, with strong emphasis on server-side enforcement and access control. The fixes needed are a few factual slips in table names and state values that would break learners' code. The biggest opportunity is hands-on verification of the entitlement chain and of integration failure handling. Both are described well but not practiced against a concrete scenario.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| sn360-02 | "The two supported customer models" | Says both `customer_contact` and `csm_consumer` extend `sys_user`. As far as I know only `customer_contact` does; consumers link to a user record. | Corrected wording, with an instruction to confirm on the release. | Applied (verify) |
| sn360-06 | "Bases, categories, and where the boundary goes" | Named `kb_knowledge` as the knowledge base table "organized under `kb_knowledge_base`". This is reversed: bases are `kb_knowledge_base`, articles are `kb_knowledge`. | Corrected. | Applied |
| sn360-06 | "User criteria" (code) | Advanced user criteria script uses `gs.getUserID()`. Platform guidance is to use the supplied `user_id` variable, because criteria are cached and may be evaluated for another user. | Added guidance to use `user_id`, with a pointer to check docs. Code left unchanged pending owner review. | Applied (text) / Proposed (code) |
| sn360-07 | "Wiring a topic to the platform" (code) | `NOT IN '6,7'` commented "resolved, closed"; on CSM cases Closed is commonly 3 and 7 is Cancelled, so closed cases would be returned. | Changed to `'3,6,7'` with comment "closed, resolved, cancelled - confirm". | Applied (verify) |
| sn360-03 | "The state model" | Shipped CSM state model also includes Cancelled; the lesson later treats cancellation as a design choice. Learners may not realize Cancelled already exists. | Add one sentence noting the shipped Cancelled state when verified. | Proposed |
| sn360-05 | "The access model" | Names "a base customer role, and an elevated customer administrator role" without role names; lesson 2 names `sn_customerservice.customer`. Be consistent. | Name both roles after verification. | Proposed |
| sn360-02 to 10 | End of lesson | No self-check. | Added "Check your understanding" with answers to all nine content lessons. | Applied |

## Depth and coverage gaps

- **Entitlement chain verification** (objective: "Configure entitlements and service contracts that drive customer-facing SLAs"): lesson 4 lists five verifications; project x01 turns them into a proof pack with script and ATF evidence.
- **Integration failure drill** (objective: "Integrate CSM with a CRM or support tool and handle synchronization failures safely"): the "six ugly cases" are listed but not scaffolded; x02 provides tables, scenarios, replay, alerting, and reconciliation.
- **PDI setup:** lessons say "with the CSM plugins active" but not which, and Virtual Agent / AWA availability on PDIs varies. Add a setup note once confirmed.
- **Capstone naming:** sn360-11 uses "Meridian Instruments", sn350-11 "Meridian Logistics" (freight), sn330 "Meridian Logistics" (HR, different size). Pathway learners will be confused; consider distinct names.
- **Capstone competencies:** sn360-11 lists D3-S1-C01, C02, C04; it does not exercise C03 (Virtual Agent) or C05 (integration), which is fine. The supplementary projects cover C05.
- **Misconception:** that a widget filter or a VA reference-input filter is a security control. Lessons 5 and 7 say it isn't; video v01 demonstrates it.

## Proposed additional projects

- **x01 Northwind Entitlement and SLA Proof Pack** (drafted): parent inheritance, specific-beats-general lookup, no-match path, pause and genuine-response stop, ATF tests.
- **x02 Northwind CRM Contact Sync: Surviving a Bad Night** (drafted): idempotent scripted REST upsert, 422 rejections, error table, replay, alert threshold, reconciliation, six-scenario log.
- *Idea:* "Northwind replacement-part topic": the second VA topic from lesson 7 practice, end to end with a flow and entitlement-gated availability.
- *Idea:* "Routing shadow week": compute assignments into a field for a week of seeded cases and compare with manual assignments (lesson 8 rollout step 1).
- *Idea:* "Monthly service review pack": the six-indicator Northwind dashboard from lesson 10 with backfill and a broken-collection drill.

## Video and animation opportunities

- **Filters shape, access controls decide** — sn360-05 — screencast; the URL-tampering demonstration only works on screen. *Drafted: media/video-01.*
- **Building "Where is my case?"** — sn360-07 — screencast of the designer. *Drafted: media/video-02.*
- **First matching queue wins** — sn360-08 — animation; queue evaluation order and the Premium vs German conflict. *Drafted: media/animation-01.*
- **The entitlement chain** — sn360-04 — animation of a case walking contact > account > parent > contract > SLA, with specific-beats-general. Not drafted.
- **Resolved vs Closed and the reopen rate** — sn360-03 — short explainer. Not drafted.
- **Idempotent upsert and replay** — sn360-09 — animation of a duplicate webhook and a replayed error row. Not drafted.

## Assessment ideas

- Transition table exercise: fill a from/to matrix for the case lifecycle with conditions; spot the state with no exit.
- Entitlement lookup puzzles: five cases, predict the winning entitlement.
- Portal security checklist quiz with screenshots.
- KPI critique: given a 20-tile dashboard, keep six and justify.

## Changes applied in this pass

- `02-csm-architecture-accounts-contacts-and-products.md`, "The two supported customer models": corrected the claim that `csm_consumer` extends `sys_user`.
- `02-csm-architecture-accounts-contacts-and-products.md`, end: added "Check your understanding".
- `03-case-management-configuration.md`, end: added "Check your understanding".
- `04-entitlements-contracts-and-customer-slas.md`, end: added "Check your understanding".
- `05-the-customer-service-portal.md`, end: added "Check your understanding".
- `06-knowledge-and-communities-for-self-service.md`, "Bases, categories, and where the boundary goes": corrected knowledge table names.
- `06-knowledge-and-communities-for-self-service.md`, "User criteria": added `user_id` guidance for advanced criteria scripts.
- `06-knowledge-and-communities-for-self-service.md`, end: added "Check your understanding".
- `07-virtual-agent-and-conversational-automation.md`, "Wiring a topic to the platform": corrected excluded state values to include Closed (3).
- `07-virtual-agent-and-conversational-automation.md`, end: added "Check your understanding".
- `08-advanced-work-assignment-and-case-routing.md`, end: added "Check your understanding".
- `09-integrating-csm-with-crm-and-support-tools.md`, end: added "Check your understanding".
- `10-measuring-customer-service-performance.md`, end: added "Check your understanding".

## Open questions for the course owner

- Confirm CSM case state values on the target release (New 1, Open 10, Awaiting Info 18, Resolved 6, Closed 3, Cancelled 7 is my understanding). Lessons 3 and 7 depend on them.
- Confirm `csm_consumer` relationship to `sys_user` on the target release.
- Confirm the user criteria `user_id` guidance and update the lesson 6 sample code accordingly.
- Which CSM, Virtual Agent, and AWA plugins should PDI learners activate, and are all available on PDIs?
- Service contract table in the lesson 6 sample (`ast_contract` vs `ast_service_contract`) and the case `entitlement` field name used in project x01's script.
- Shipped customer role names (base and customer admin) for lesson 5.
- How account-wide case visibility for a contact (Dana) is configured on the target release (contact role vs responsibility vs a field), for video v01's demo.
- Capstone client naming across sn330, sn350, and sn360 ("Meridian ...").
