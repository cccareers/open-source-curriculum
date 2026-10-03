---
course_id: sn201
media_id: sn201-a01
type: animation-storyboard
title: "How the Platform Decides: ACL Evaluation for One Field"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - sn201-07
objectives:
  - Secure an application with roles and access control rules
competency_ids:
  - D1-S1-C03
---

## Concept and misconception it fixes
Lesson 7 references a diagram (`img/acl-evaluation-order.png`) that does not exist yet; this storyboard supplies it in motion and can be exported as a still for that slot. Misconceptions fixed: (1) "rules stack, so a general grant plus a specific denial means I get the grant" — no, the most specific matching level decides; (2) "within one rule, role OR condition" — no, role AND condition AND script; (3) "across rules at the same level, all must pass" — no, any one passing is enough; (4) "a field grant is enough" — no, the record-level pass must grant too.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- A **request token** (rounded pill) labelled `technician · write · work_order.total_cost`.
- Two vertical **ladders**: left "Field pass" with six rungs (`work_order.total_cost`, `task.total_cost`, `*.total_cost`, `work_order.*`, `task.*`, `*.*`); right "Record pass" with three rungs (`work_order`, `task`, `*`).
- Rungs with a matching ACL show a small card; rungs without one are dashed outlines.
- Grant: blue `#0072B2` with a check mark. Deny: vermillion `#D55E00` with an X. Not evaluated: grey `#999999` with a dash. Shape + icon always accompany color.
- Inside an ACL card, three slots: Role · Condition · Script, each lighting check/X independently.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 0–8s | Work order form, technician viewing; `total_cost` field outlined. Token appears. | Token lifts off the field. | "A technician tries to edit Total cost. Two questions get asked: may they touch this field, and may they touch this record?" |
| 2 | 8–20s | Field ladder appears. Token at top rung `work_order.total_cost`; a card is there: Role `manager`. | Token drops onto rung; Role slot shows X (technician lacks manager). Card turns vermillion. | "The field pass starts at the most specific name. There's a rule here, and it requires manager. Technician fails." |
| 3 | 20–32s | Lower rungs: `work_order.*` has a card: Role `technician` — would grant. | Token does **not** descend; lower rungs grey out with "not evaluated" dash. Caption arrow: "decided here". | "Notice what doesn't happen. There's a general rule further down that would grant technicians write — but the first level with a matching rule decides. Rules don't stack." |
| 4 | 32–42s | Result badge "Field pass: DENY". Reset. New token: `technician · write · work_order.short_description`. | Token checks rungs 1–3 (dashed, no rules), lands on `work_order.*`: card Role `technician` → check. | "Now Short description. No rule names that field on work order, task, or the wildcard table — so the search falls through to work order star. Technician passes." |
| 5 | 42–58s | Record ladder appears on the right. Rung `work_order` shows **two** cards side by side: (A) Role technician, Condition "Assigned to is me AND State not closed"; (B) Role manager. | Token lands; card A: Role check, Condition check (assigned to me), Script — (empty, auto-pass). Card A turns blue. Card B shows X but a bracket labels both "ANY one is enough". | "Then the record pass. Two rules match at this level. Inside a rule, role AND condition AND script must all pass. Across rules at the same level, one passing is enough." |
| 6 | 58–72s | Both pass badges combine into a gate: Field ✓ + Record ✓ → "WRITE ALLOWED". | Gate opens; token returns to form; field becomes editable. | "Both passes granted. The write is allowed." |
| 7 | 72–84s | Replay scene 5 with condition changed: work order assigned to someone else. | Card A Condition slot flips to X; whole card vermillion; record pass DENY; gate stays closed even though field pass was ✓. | "Change one fact — it's assigned to someone else — and the record pass fails. A field grant can't rescue it." |
| 8 | 84–90s | Summary card, four lines: "Most specific level decides" · "Inside a rule: AND" · "Same level: any one" · "Field AND record". | Lines appear one by one. | "Four rules. Every access surprise you meet is one of them." |

## Interaction variant (optional)
Step-through interactive: learner chooses user (requester / technician / manager), operation, and field; the ladders animate their own case. A "predict first" toggle hides the result until the learner commits an answer. Could be built in Rive or as an H5P branching scenario using exported frames.

## Production notes
- Rung order must match the corrected lesson 7 text: table.field → parent.field → *.field → table.* → parent.* → *.*.
- Use the facilities scope names exactly; the full table name is `x_acme_facilities_work_order` — show it once in scene 2, then abbreviate to `work_order` with an on-screen note.
- Export a still of scene 5 at 1600×900 as `acl-evaluation-order.png` for the lesson's image slot, with alt text matching the existing lesson alt text.
- Captions burned-in optional; SRT required. Pace each caption ≥ 3 s.
