---
course_id: sn280
media_id: sn280-v02
type: video-script
title: "One Click, Three Records: Building a Catalog Item That Fulfils Itself"
format: screencast
target_runtime: "9 min"
related_lessons:
  - sn280-07
  - sn280-09
objectives:
  - Build catalog items, variables, and order guides that produce correct request and task records
  - Automate an ITSM process end to end with Flow Designer and business rules
competency_ids:
  - D2-S1-C04
  - D2-S1-C01
  - D2-S1-C05
---

## Purpose
After watching, the learner can build the lesson 7 "Request application access" item with data-driven variables, submit it, and trace REQ → RITM → SCTASK, then see a fulfilment flow derive the approver from data and branch on license availability.

## Audience and prerequisites
sn280 learners at lessons 7–9. PDI admin. A small custom table "Licensed Application" (name, owner → sys_user, available_licenses → integer, access levels) built beforehand; producer creates two rows: "PACS Viewer" (licenses 0) and "Rota Planner" (licenses 5).

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Email inbox full of "access please" threads, then Service Portal catalog. | "Northwind's worst process is access requests by email. Let's replace it with one catalog item that gives the requester a simple form and the fulfillers a complete, routed request." |
| 0:20 | Diagram: sc_cat_item → sc_request (REQ) → sc_req_item (RITM) → sc_task (SCTASK). | "Four tables to keep in your head. The item is what's offered. Checkout creates a request — REQ. Each item ordered becomes a requested item — RITM, the unit of fulfilment. And the work is catalog tasks — SCTASK." |
| 0:45 | Service Catalog > Catalog Definitions > Maintain Items > New. Name "Request application access", Category Access, short description in requester language. | "New item. Name it the way a nurse manager would say it. Category: Access — a requester's word, not an org chart's." |
| 1:10 | Variables: `application` (Reference to Licensed Application), `access_level` (Select Box), `access_for` (Reference sys_user, default `javascript:gs.getUserID()`), `business_justification` (Multi Line Text). | "Four variables, each earning its place. Application is a reference to our applications table — never free text. Access level. Access for, defaulting to me so managers can change it. And justification." |
| 1:50 | Catalog UI Policy: condition access_level is elevated → justification mandatory + visible; Reverse if false. | "Justification only matters for elevated access, so a catalog UI policy shows and requires it then — and hides it again if the level changes back. No script." |
| 2:20 | Catalog client script onChange on application — async GlideAjax to filter access_level options (show code briefly, guard isLoading/empty). | "Filtering the access levels by application genuinely needs logic, so that one is a catalog client script — asynchronous, guarded, and only for this." |
| 2:45 | Order it in Service Portal as a demo user for "Rota Planner", standard level. Confirmation shows REQ number. | "Order it as a requester. One click on Submit." |
| 3:05 | Open REQ → Requested Items related list → RITM; RITM shows Request, Item, Variables editor, Stage. | "The REQ is the envelope. Inside, one RITM — carrying the item, every answer in the variable editor, and a stage the requester can see." |
| 3:30 | Flow Designer: new flow "Application access fulfilment", Service Catalog trigger; Get Catalog Variables; Look Up Record on Licensed Application. | "Now make it fulfil itself. New flow, Service Catalog trigger. Get the catalog variables, then look up the application record — that's where the owner and license count live." |
| 4:05 | Ask for Approval: approver = Application record ▸ Owner (data pill). If rejected → Update RITM stage Request Cancelled, comments, End. | "Approval from the application's owner — a data pill, not a name. And the rejected branch first: cancel the item, tell the requester why, end. A flow that only handles yes strands every no." |
| 4:40 | If available_licenses > 0 → Create Catalog Task (Identity), Wait for task closed; Else → Procurement task, wait, then Identity task, wait. Update stage. | "Branch on license availability. Licenses free: one task to Identity. None: procurement first, then Identity. Each wait means the flow pauses until the task closes." |
| 5:20 | Activate; associate flow to the catalog item (Process Engine: Flow). | "Activate, and point the catalog item's process engine at the flow." |
| 5:40 | Submit two requests: Rota Planner (licenses 5) and PACS Viewer (0). Approve both as owners (impersonate). | "Two requests: one where licenses exist, one where they don't. Approve both as their owners." |
| 6:10 | Show SCTASKs: Rota → 1 Identity task; PACS → Procurement task only (Identity not yet). Flow execution details show waiting step. | "Rota Planner gets one identity task. PACS Viewer gets procurement first — and the execution details show exactly where it's waiting. That's the answer to 'where is my request?'" |
| 6:45 | Change owner on Rota Planner record to another user; submit a new request; approval goes to new owner. | "The test that separates good from adequate: change the owner on the application record, submit again — the approval goes to the new owner. No change to the item or the flow." |
| 7:15 | Close tasks; RITM Closed Complete; stage Completed; REQ closes. | "Close the tasks; the item completes, and the request closes with it." |
| 7:35 | Callout: where approvals, SLAs, tasks attach (RITM). | "Approvals and SLAs live on the RITM, work on SCTASKs. Put them on the REQ and one slow item makes the whole order look slow." |
| 8:00 | Recap: data-driven variables, UI policy before script, approver from data, unhappy path first, prove with the owner-change test. | "Data-driven variables, policies before scripts, approvers from data, unhappy paths first — and prove it by changing the data." |
| 8:30 | End card: "Try it: add the compliance second approval only for elevated access (lesson 12)." | "Your turn: add the second approval for elevated access, as a branch in the same flow." |

## On-screen assets and B-roll
- Pre-built Licensed Application table with two rows; demo users as owners.
- Flow Designer is reached via Workflow Studio on newer releases; producer must verify action names (Get Catalog Variables, Ask for Approval, Create Catalog Task, Wait For Condition) on the recording release.
- Diagram of the four tables.

## Accessibility
- Captions/transcript; each record number and stage spoken.
- Data pills described in words ("Application record, then Owner").
- Zoom on flow canvas; branches labelled with text, not only colour.

## Check for understanding
1. Why is the approver a data pill from the application record? — *So a new owner or application is a data change, not a flow change.*
2. Where should the SLA for this request attach, and why? — *The RITM; it is the unit the requester experiences.*
3. What did the PACS Viewer request show that Rota Planner did not? — *The no-license branch: a procurement task before the identity task, with the flow waiting between them.*
