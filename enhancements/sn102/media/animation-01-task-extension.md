---
course_id: sn102
media_id: sn102-a01
type: animation-storyboard
title: "One Table, Many Kinds of Work"
target_runtime: "80 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn102-02
  - sn102-04
objectives:
  - Explain how tables, records, fields, and table extension organize data on the platform
  - Describe the ServiceNow platform architecture and how instances, applications, and the core data model fit together
competency_ids:
  - D1-S1-C01
---

## Concept and misconception it fixes
Table extension is invisible in the interface: a learner sees an incident form and a change form and has no reason to think they share anything. Two misconceptions follow: (1) "each application has its own copy of fields like Assignment group," and (2) "`task.list` showing incidents and changes together is a special report." The animation shows a child table inheriting the parent's fields, adding its own, and a query on the parent returning rows of every child — each still knowing its class via `sys_class_name`.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Tables are rounded cards with a header (label + `technical_name`) and a column list.
- Inherited fields: blue `#0072B2` with a small chain-link icon. Fields a child adds: orange `#E69F00` with a "+" icon. Records/rows: neutral grey `#999999` strips. Query beam: bluish-green `#009E73` dashed line. (Okabe-Ito palette; every color is paired with an icon so meaning never depends on color alone.)
- Monospace for technical names; sentence case for labels.
- Background: off-white; minimum 4.5:1 contrast for all text.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0–8s | Incident form and Change form side by side, both showing Number, Short description, Assignment group, State. | The four shared fields pulse in sync on both forms. | "An incident and a change look different… but some fields keep showing up on both." |
| 2 | 8–18s | Forms fade to cards: `incident` card, `change_request` card. Above them, a new card drops in: `task` with fields number, short_description, state, priority, assignment_group, assigned_to, opened_at, work_notes. | `task` card lands; blue chain links draw down from `task` to each child card. | "That's because both extend one parent table: task. Task defines what any unit of work needs." |
| 3 | 18–30s | Inside `incident` card: blue rows (inherited) fly in from `task`; then orange rows appear: caller_id, category, impact, urgency. Same for `change_request`: risk, type, start_date, end_date. | Blue rows slide down along chains; orange rows pop in with "+" icon. | "Each child inherits every field from task — then adds only what it needs. Caller and category for incidents. Risk and planned dates for changes." |
| 4 | 30–40s | More children appear on the branch: `problem`, `sc_req_item`, `u_vendor_escalation` (dashed outline, labeled "built in your instance"). | Branches grow; the custom table inherits the same blue rows. | "Problem, requested item — and any table you build. Extend task, and your Vendor Escalation table gets numbers, states, and assignment for free." |
| 5 | 40–55s | Grey record strips appear under each child: INC0010001, CHG0030002, PRB0040003, a `u_vendor_escalation` row. Each strip has a small tag on the left reading its class (`sys_class_name`). | Strips stack into the children. | "Records are created on the child table. Every record carries a hidden field, sys class name, that says which kind of work it is." |
| 6 | 55–68s | Green dashed query beam from a box labeled `task.list  assignment_group = Network` hits the `task` card and fans out through every chain. | Beam travels down; matching strips from all children light up and fly into a single combined list at the bottom, each keeping its class tag. | "So when you query the parent — all open work for the Network group — you get every kind of task in one list. One query, not six." |
| 7 | 68–80s | Bottom list freezes. Caption cards: "Inherited: defined once on the parent" / "Added: defined on the child" / "Query the parent → get every child". | Gentle zoom out to show whole tree. | "Define once on the parent, add what's unique on the child, and query the parent to see it all. That's table extension." |

## Interaction variant (optional)
Step-through H5P "Course Presentation": the learner clicks a field on the incident card and is asked "Where is this field defined?" (task / incident). Correct answers reveal the chain. A final slide lets them pick a filter and predict which child records appear in `task.list` before the beam animates.

## Production notes
- Keep technical names accurate: `caller_id`, `start_date`, `end_date`, `sys_class_name`.
- Do not depict physical database storage (separate tables vs one flattened table); the platform's storage strategy varies and is not the point.
- Export at 1920×1080, 30 fps; provide captions file (SRT) and a text alternative that lists the scenes.
- Reuse the card components in sn201's data-model animation if produced, for visual continuity across the pathway.
