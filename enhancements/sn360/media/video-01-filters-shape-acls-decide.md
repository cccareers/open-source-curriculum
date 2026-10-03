---
course_id: sn360
media_id: sn360-v01
type: video-script
title: "Filters Shape, Access Controls Decide: Securing the Customer Portal"
format: screencast
target_runtime: "7 min"
related_lessons:
  - sn360-05
  - sn360-02
objectives:
  - Customize the customer service portal so external customers can serve themselves securely
competency_ids:
  - D3-S1-C02
  - D6-S1-C01
---

## Purpose

After watching, the learner can show why a widget filter is not a security control, write and test a case read rule that gives Sunil his own cases, Dana her account family's cases, and Priya nothing of Rivergate's, and prove it by editing a sys_id in the URL while impersonating.

## Audience and prerequisites

Learners on lesson 5 with the Northwind model from lesson 2 and a PDI with CSM activated. Demo instance has Sunil's case on Rivergate already created.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Customer portal case list as Priya (Ashcroft): only her cases. | "Priya from the Ashcroft plant sees only her cases. Looks secure. Watch this." |
| 0:10 | As admin in another tab, copy the sys_id of Sunil's Rivergate case. As Priya, edit the case detail URL, replacing the `sys_id` parameter. | "I take the record ID of a case from Rivergate, and paste it into Priya's case detail URL." |
| 0:25 | Version A (deliberately broken demo instance): the case opens. Overlay text "Leak". | "On this deliberately broken instance, it opens. The list was filtered. The record was not protected." |
| 0:40 | Title card. | "Filters shape. Access controls decide." |
| 0:45 | Widget instance options showing a filter `contact=javascript:gs.getUserID()`. | "That list was built with a filter on the widget. A filter decides what a page shows. It does not decide what a user may retrieve." |
| 1:05 | Diagram: request arrives -> ACL on `sn_customerservice_case` -> allowed rows -> widget filter -> page. | "Every path to a record goes through access control first: the portal, the API, a reference lookup, a crafted URL. Filters only act on what is left." |
| 1:30 | Requirements slide: Sunil: own cases. Priya: own cases. Dana: all cases in Northwind and child accounts. Nobody: other customers. | "Here is Northwind's design from lesson 2. Sunil and Priya see their own. Dana, with account-wide visibility, sees the whole Northwind family." |
| 1:50 | Show the shipped CSM case read rules on the case table (filter ACL list by table and operation read; highlight rules for the customer role). | "CSM ships read rules for customer roles. Start by reading them, not writing your own. Find which conditions they use for contact, account, and hierarchy, and whether your contact-role design plugs into them." |
| 2:30 | Contact record for Dana: show the setting/role you chose for account-wide visibility (note: labels vary by release). | "Dana's account-wide visibility is data on her contact record. The access rule reads it. No per-user code." |
| 2:50 | If the shipped rules do not meet the design: show a custom read ACL with a condition script outline: `answer = current.contact == gs.getUserID() || (userHasAccountWideRole && accountInFamily(current.account));` with the helper in a Script Include. | "If you must extend, keep the condition readable and put the account-family logic in one Script Include that every rule shares." |
| 3:30 | Fixed instance. Impersonate Priya; repeat the sys_id edit. Portal shows the record is not available. | "Same attack, fixed instance. Priya pastes the Rivergate ID. Not available. And it failed because of the access rule, not because the link was missing." |
| 3:55 | Impersonate Dana: case list shows Rivergate and Ashcroft cases. Impersonate Sunil: only his. | "Dana sees the family. Sunil sees his own." |
| 4:15 | REST API Explorer as Priya's session (or a test user with the same role): GET on the case table with `sysparm_query=number=CS...`. Result: empty. | "Now leave the UI. A customer session can call the table API. Same question, same answer: nothing." |
| 4:45 | Create-case form, installed product field: show reference qualifier limiting to the user's account install base. Then type another account's serial: no match. | "Reference fields leak too. The installed product picker must only offer this account's install base. Test by typing another customer's serial." |
| 5:15 | Lesson 5 six-item checklist on screen, ticking each with words "Pass" or "Fail". | "Before go-live, run the six-item checklist: guest pages, sys_id pages, internal widgets removed not hidden, attachments, knowledge base selection, reference qualifiers." |
| 6:00 | Recap. | "Filters shape. Access controls decide. Test by URL, by API, and by reference field, as every contact role." |
| 6:30 | End card. | "Lesson 5 practice step 3 next." |

## On-screen assets and B-roll

- Two demo instances or a toggled ACL to show broken and fixed states (never demonstrate on a customer instance).
- Request-flow diagram; six-item checklist slide.
- Persona overlay with the impersonated contact's name and account.

## Accessibility

- Captions and transcript; URLs and sys_id edits narrated step by step.
- "Leak" and "Not available" outcomes stated aloud and shown as text, not color.
- Code shown at large size and read aloud.

## Check for understanding

1. Priya's case list shows only her cases. Why is that not proof she cannot read Sunil's case? *Answer: the list is shaped by a widget filter; only access controls decide what she can retrieve via URL, API, or references.*
2. Where should Dana's account-wide visibility be configured? *Answer: as data on her contact (role/visibility setting) read by the case access rules, not as a per-user script or widget filter.*
3. Name three paths to test besides the portal list. *Answer: direct URL with a sys_id, the table API, and reference field lookups (also attachments).*
