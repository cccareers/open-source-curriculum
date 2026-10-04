---
course_id: sn290
project_id: sn290-x01
title: "Northwind Knowledge and Catalog Permission Audit"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - sn290-05
  - sn290-02
objectives:
  - Surface the Knowledge Base and Service Catalog through the portal with the correct permissions
competency_ids:
  - D6-S1-C04
  - D6-S1-C01
---

## Scenario

Northwind Regional Health (the client from the course project) has two audiences on the `nwsc` portal: **clinical staff** (nurses and physicians at the hospital and six clinics) and **facilities staff**. Compliance has raised a concern: a draft article titled "Controlled substance cabinet override codes" was reportedly visible to a facilities contractor through portal search. The service desk manager wants you to (1) build the knowledge and catalog permission model properly, and (2) produce an audit pack proving who can see what, through every path: listing, search, and direct URL.

## What you will produce

- A `Northwind Clinical` knowledge base and a `Northwind Facilities` knowledge base, each with two categories and at least three published articles. One clinical article is marked restricted to a smaller group.
- Reusable user criteria: `NW - All staff`, `NW - Clinical staff`, `NW - Pharmacy`, `NW - Contractors`.
- One catalog category with three catalog items, one restricted to clinical staff.
- An impersonation matrix covering four test users across eight checks each.
- A short audit memo with findings and fixes.

## Before you start (prerequisites, starter data)

- A Personal Developer Instance (PDI) with your `nwsc` portal from the course project, or the `dev290` practice portal from lessons 2 to 5.
- Create four test users (prefix `nw.`): `nw.nurse` (group *NW Clinical*), `nw.pharmacist` (groups *NW Clinical* and *NW Pharmacy*), `nw.facilities` (group *NW Facilities*), `nw.contractor` (group *NW Facilities* and *NW Contractors*). Give none of them admin; give them no roles unless a step needs one.
- A current update set named `NWSC-PERM-001 Permission model`.

## Milestones

1. **Design before building (20 min).** Fill in this grid on paper first. Rows: each knowledge base, the restricted article, each catalog item. Columns: Can read / Cannot read (or Available for / Not available for), with the criteria you intend to attach. Rule: grant broadly, carve out with deny.
2. **Build the criteria once.** Create the four user criteria records, each based on groups. Do not create per-attachment criteria.
3. **Wire the knowledge bases.**
   - `Northwind Clinical`: Can read = `NW - Clinical staff`; Cannot read = `NW - Contractors`.
   - `Northwind Facilities`: Can read = `NW - All staff`.
   - The restricted article "Controlled substance cabinet override codes" (use harmless placeholder text): article-level Can read = `NW - Pharmacy`.
   - Create one more clinical article and leave it in **draft**, to prove state gating.
4. **Wire the catalog.** In a category `Northwind Requests`, create three simple items (no variables needed): "Replacement badge" (no restriction), "Clinical cart repair" (Available for = `NW - Clinical staff`), "Contractor site access" (Available for = `NW - Contractors`).
5. **Point the portal.** Decide whether the `nwsc` portal's Knowledge base field should be set (single-department portal) or left empty (company-wide). Northwind's portal serves both audiences, so the expected answer is to leave it empty and rely on criteria. Write one sentence defending your choice.
6. **Run the matrix.** For each test user, impersonate, open the portal at `/nwsc`, and record each check in the matrix below. Use the direct URLs you captured as admin for the restricted article, the draft article, and each item.
7. **Fix and re-run.** Any cell that does not match your design is a finding. Fix the cause (criteria, state, page, or a search source) and re-run the *whole* matrix, because criteria are shared.
8. **Write the audit memo.**

## Acceptance criteria

- [ ] Four reusable user criteria exist and every knowledge base, article, and item restriction uses them; no single-use criteria.
- [ ] `nw.contractor` cannot see any `Northwind Clinical` article through any path, even though they match no clinical grant and do match a deny.
- [ ] Only `nw.pharmacist` can open the restricted article, by listing, search, and direct URL.
- [ ] The draft article is invisible to every test user through every path.
- [ ] Catalog items appear only to entitled users on the category page, in search, and by direct item URL.
- [ ] The full matrix was run at least twice (before and after fixes), with both versions kept.
- [ ] All configuration is captured in the update set.

## Evidence checklist

- [ ] The design grid from milestone 1 (photo or table).
- [ ] The completed matrix (template below), before and after fixes.
- [ ] Screenshots for three cells: the restricted article *opening* for `nw.pharmacist`, and the same direct URL for `nw.nurse` and `nw.contractor` showing it is not available.
- [ ] Output of this background script (System Definition > Scripts - Background), which lists every criteria attachment you created so a reviewer can compare it against the design grid. The many-to-many table names below are the commonly used ones; confirm them on your PDI (open a Can read related list entry and check the table in the URL) and adjust if different.

```javascript
function dump(table, parentField, label) {
  var gr = new GlideRecord(table);
  gr.addQuery('user_criteria.name', 'STARTSWITH', 'NW - ');
  gr.query();
  while (gr.next()) {
    gs.info(label + ' | ' + gr.getDisplayValue(parentField) + ' | ' + gr.getDisplayValue('user_criteria'));
  }
}
dump('kb_uc_can_read_mtom', 'kb_knowledge_base', 'KB can read');
dump('kb_uc_cannot_read_mtom', 'kb_knowledge_base', 'KB cannot read');
dump('sc_cat_item_user_criteria_mtom', 'sc_cat_item', 'Item available for');
```

- [ ] The update set's captured-record list (or exported XML).
- [ ] The audit memo (one page): the original concern, the root cause you would look for in the real incident (draft visibility, a search source querying without permission checks, or a missing deny), what you built, and the before/after matrix summary.

Matrix template (one row per user):

| User | KB home lists Clinical? | Clinical article via search | Restricted article by URL | Draft article by URL | Facilities article via category page | "Clinical cart repair" on category page | "Clinical cart repair" by URL | "Contractor site access" on category page |
|---|---|---|---|---|---|---|---|---|
| nw.nurse | | | | | | | | |
| nw.pharmacist | | | | | | | | |
| nw.facilities | | | | | | | | |
| nw.contractor | | | | | | | | |

Expected results (fill in yours first, then compare): nurse sees clinical but not restricted; pharmacist sees all clinical including restricted; facilities sees no clinical; contractor sees no clinical and is the only one who sees "Contractor site access"; nobody sees the draft.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Permission design | Criteria created per attachment; deny not used | Four reusable criteria; grant broadly, deny to carve out | Design grid anticipates the contractor double-membership case before testing |
| Verification | Listings checked only | All three paths (listing, search, direct URL) per user | Matrix re-run after every change, with diffs noted |
| Portal decisions | Knowledge base field set or cleared without reason | Choice defended in one sentence | Explains how the choice would change for a separate clinical-only portal |
| Audit memo | Describes what was built | Links findings to root causes and fixes | A compliance reviewer could re-run the checks from the memo alone |

## Stretch goals

- Add a custom search source for "My open requests" and prove in the matrix that it never returns another user's request.
- Add a related-knowledge placement on the "Clinical cart repair" item page and confirm `nw.facilities` never sees clinical articles there either.

## Reflection prompts

- Why is "the link is hidden" not evidence that a permission works?
- `nw.contractor` is in both Facilities and Contractors. Which rule in lesson 5 decided what they could see?
- What would you check first if a user reported seeing an article title in search but getting "not found" on click?

## Instructor notes (common pitfalls, how to adapt for time)

- Learners frequently test as admin and declare success. Require impersonation screenshots that show the impersonated user's name.
- The empty "Can read" behavior differs from what learners expect; lesson 5 tells them to test it rather than assume. Encourage one learner to deliberately create a knowledge base with an empty Can read list and report what their PDI does.
- User criteria results can be cached per session. If a change seems not to apply, end impersonation and impersonate again before concluding it failed.
- For a 2-hour version, drop the catalog half and the Facilities knowledge base.
