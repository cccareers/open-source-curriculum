---
course_id: sn102
project_id: sn102-x01
title: "Vendor Escalation: Build It, Read It, Lock It"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - sn102-04
  - sn102-05
objectives:
  - Explain how tables, records, fields, and table extension organize data on the platform
  - Explain how users, groups, roles, and access controls determine who can see and change a record
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
  - D1-S1-C03
---

## Scenario
In lesson 4 you reverse-engineered a "Vendor Escalation" table somebody else built. In lesson 5 you designed its access model on paper. The finance team has now asked you to stand up a working prototype in your personal developer instance (PDI) so they can try it before anyone builds the real thing in a client development instance. You will build the table, prove you understand what it inherited, and then lock it down exactly as the lesson 5 requirements say — and prove the lock works by impersonation, not by assertion.

## What you will build / produce
- A table **Vendor Escalation** (`u_vendor_escalation`) that extends `task`, with two custom fields: **Vendor** (reference to `core_company`) and **Commercial terms** (string, 4000).
- Three test users, two groups, two roles, and nine access control rules implementing the lesson 5 requirements.
- An evidence pack (screenshots + a short written explanation) and the output of a read-only verification script.

## Before you start (prerequisites, starter files or data)
- A PDI with demo data, signed in as `admin` (lesson 9 project complete).
- Know how to reach `sys_db_object.list`, `sys_dictionary.list`, `sys_user_group.list`, `sys_user_role.list`, `sys_security_acl.list` from the navigator filter (lesson 3).
- **Elevated role:** creating or editing ACLs requires the `security_admin` role to be *elevated* for your session. As admin, open your user menu (avatar) and choose **Elevate role** (label may read "Elevate Roles"), tick `security_admin`, and confirm. Elevation lasts for the session only. If you do not see the option, see Instructor notes.
- Work in the **Global** application scope (check the application picker / scope indicator in the banner).

## Milestones
1. **Create the table.** System Definition > Tables > New. Label `Vendor Escalation`; name will auto-fill as `u_vendor_escalation`. Set **Extends table** to `Task`. Leave "Create module" checked so a menu entry is created. Save. Do not add fields yet.
2. **Read what you inherited — before adding anything.** Open the **Columns** related list on the new table record. Count the columns. Then open `sys_dictionary.list`, filter `Table is u_vendor_escalation`, and count again. Write two sentences explaining why the two numbers differ (the Columns list shows inherited `task` fields; the dictionary filtered to your table shows only fields *defined* on it).
3. **Add the two custom fields.** From the table record, add `Vendor` (Reference → `core_company`) and `Commercial terms` (String, max length 4000). Confirm both now appear in `sys_dictionary.list` filtered to your table.
4. **Make and read records.** Type `u_vendor_escalation.form`, create two escalations with different vendors (pick companies from demo data). Note the auto-generated number — record its prefix, and write one sentence on where the number came from (the inherited `number` field plus a number-maintenance record). Then open `task.list`, add the **Task type** column, filter `Task type is Vendor Escalation`, and confirm your two records appear in the parent table.
5. **Dot-walk.** On `u_vendor_escalation.list`, build a filter `Vendor.Country is <a country present in your demo companies>`. Add a dot-walked column **Vendor > City** via Configure > List Layout. Save the filter as "Escalations by vendor country".
6. **Build the access model (groups first).**
   - Roles: `u_vendor_management`, `u_vendor_management_admin` (descriptions required).
   - Groups: **Vendor Management** (gets `u_vendor_management`), **Vendor Management Leads** (gets `u_vendor_management_admin` and `u_vendor_management`).
   - Users: `vm.agent` (member of Vendor Management), `vm.lead` (member of Vendor Management Leads), `plain.employee` (no groups, no roles). **No direct role grants.**
7. **Create the ACLs** (System Security > Access Control (ACL) > New, with `security_admin` elevated). Creating the table may already have generated default ACLs for it — open `sys_security_acl.list` filtered `Name starts with u_vendor_escalation`, record what exists, and **deactivate (do not delete)** any auto-generated rule that would contradict your design. Then build:

   | Type | Operation | Name | Requires role | Condition |
   |---|---|---|---|---|
   | record | create | `u_vendor_escalation` (None) | — | — |
   | record | create | `u_vendor_escalation.*` | — | — |
   | record | read | `u_vendor_escalation` (None) | `u_vendor_management` | — |
   | record | read | `u_vendor_escalation.*` | — | — |
   | record | read | `u_vendor_escalation` (None) | — | Opened by **is (dynamic)** Me |
   | record | write | `u_vendor_escalation` (None) | `u_vendor_management` | — |
   | record | write | `u_vendor_escalation.*` | `u_vendor_management` | — |
   | record | delete | `u_vendor_escalation` (None) | `u_vendor_management_admin` | — |
   | record | read | `u_vendor_escalation.u_commercial_terms` | `u_vendor_management` | — |

   Note the two separate read rules on the same name: the platform grants read if **either** passes. That is evaluation point 5 from lesson 5.
8. **Prove it by impersonation.** Before each impersonation, write your prediction. Then impersonate each user and record: can they open the list, how many rows they see, can they create, can they edit Short description, can they see Commercial terms, can they delete. `plain.employee` should create one escalation of their own during the test so the "opened by me" rule has something to show.
9. **Debug one denial.** As admin, turn on **Debug Security Rules** (System Security > Debugging), then impersonate `plain.employee`, open the escalation they created, and read the debug output for `u_vendor_escalation.u_commercial_terms`. Record the rule name and which part failed (role, condition, or script). Turn debugging off.
10. **Run the verification script** below and paste its output into your evidence pack.

## Acceptance criteria
- [ ] `u_vendor_escalation` exists and its **Extends table** is `task`.
- [ ] Exactly two custom fields are defined on the table, with the specified types and reference target.
- [ ] Both test records appear in `task.list` when filtered by Task type.
- [ ] Every role reaches a user through a group; no user has a direct role grant for the two new roles.
- [ ] Impersonation results match the expected matrix in the Evidence checklist.
- [ ] Written explanation correctly distinguishes inherited fields from defined fields and record-level from field-level ACLs.

## Evidence checklist
- [ ] Screenshot: table record showing Name, Label, Extends table.
- [ ] Column counts from milestone 2 and the two-sentence explanation.
- [ ] Screenshot: dictionary list filtered to the table showing the two custom fields.
- [ ] Record numbers of both escalations, and a screenshot of `task.list` showing them with Task type visible.
- [ ] Screenshot: saved dot-walk filter with breadcrumb and Vendor > City column visible.
- [ ] Screenshots: both group records with Roles related list; each test user's Roles list showing *Inherited = true*.
- [ ] Screenshot: `sys_security_acl.list` filtered to `u_vendor_escalation`, showing name, operation, active, and roles columns (including any auto-generated rules you deactivated).
- [ ] Impersonation results table (expected values below):

  | User | List rows | Create | Edit short desc. | See Commercial terms | Delete |
  |---|---|---|---|---|---|
  | plain.employee | own records only (others removed by security) | Yes | No | No | No |
  | vm.agent | all | Yes | Yes | Yes | No |
  | vm.lead | all | Yes | Yes | Yes | Yes |

- [ ] Security debug finding: rule name + failed part.
- [ ] Output of the verification script, showing every line as PASS.

### Verification script (read-only)
Run as admin in **System Definition > Scripts - Background** (scope: global). It changes nothing; it only reads and prints.

```javascript
function check(label, ok) { gs.print((ok ? 'PASS  ' : 'FAIL  ') + label); }

// 1. Table extends task
var t = new GlideRecord('sys_db_object');
t.addQuery('name', 'u_vendor_escalation');
t.query();
var hasTable = t.next();
check('table u_vendor_escalation exists', hasTable);
if (hasTable) check('extends task', t.super_class.name.toString() == 'task');

// 2. Exactly two custom fields defined on the table (ignore the collection row)
var d = new GlideRecord('sys_dictionary');
d.addQuery('name', 'u_vendor_escalation');
d.addQuery('element', 'STARTSWITH', 'u_');
d.query();
check('two custom u_ fields defined (found ' + d.getRowCount() + ')', d.getRowCount() == 2);

// 3. Records visible through the parent table
var tk = new GlideRecord('task');
tk.addQuery('sys_class_name', 'u_vendor_escalation');
tk.query();
check('escalations visible via task (found ' + tk.getRowCount() + ')', tk.getRowCount() >= 2);

// 4. No direct grants of the new roles
var ur = new GlideRecord('sys_user_has_role');
ur.addQuery('role.name', 'IN', 'u_vendor_management,u_vendor_management_admin');
ur.addQuery('inherited', false);
ur.query();
check('no direct grants of vendor roles (found ' + ur.getRowCount() + ')', ur.getRowCount() == 0);

// 5. Field-level ACL on commercial terms exists and is active
var acl = new GlideRecord('sys_security_acl');
acl.addQuery('name', 'u_vendor_escalation.u_commercial_terms');
acl.addQuery('operation.name', 'read');
acl.addActiveQuery();
acl.query();
check('active field read ACL on u_commercial_terms', acl.hasNext());
```

Scripting is not a sn102 objective — you are running, not writing, this script. Read it line by line and match each check to a milestone.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Table and extension | Table exists but does not extend task, or fields wrong | Table extends task, two fields correct, records visible in `task.list` | Also explains `sys_class_name` and why inherited fields are not in the filtered dictionary |
| Access model hygiene | Any direct role grant | All roles via groups; ACLs match the design table | Deactivated conflicting auto-generated ACLs and documented why |
| Testing by impersonation | Results asserted, not shown | Full matrix with predictions and screenshots | Explains every mismatch between prediction and result |
| Debugging | No debug evidence | Rule name and failed part identified | Also identifies which *other* rule granted access to the rest of the record |
| Explanation | Vague or incorrect terms | Correct use of table, field, record, extension, ACL, role | Concise enough for a non-technical finance stakeholder |

## Stretch goals
- Add a **Status** choice field with three choices and use `sys_choice.list` to show label vs stored value.
- Redesign both existing record-read grants so Vendor Management Leads can see escalations *only* for vendors in their own country (condition with dot-walk); exclude leads from the unconditional agent grant and constrain the opened-by grant too. Adding another read ACL would only add access. Predict, then test.
- Open the Schema Map for `u_vendor_escalation` and annotate the screenshot with which arrows are extension and which are references.

## Reflection prompts
- Which of the 20-odd fields on your new table did you get "for free," and which one would you have forgotten to build yourself?
- Why does `plain.employee` see a "rows removed by security constraints" message instead of an empty list, and what platform feature from lesson 5 would change that?
- If the finance team asked for "Commercial terms hidden on the form only," what would you tell them, and why?

## Instructor notes (common pitfalls, how to adapt for time)
- **Elevation is the #1 blocker.** Learners create an ACL, cannot save it, and assume they are wrong. If the Elevate role option is missing, check that `admin` holds `security_admin` (it does on a standard PDI). Menu labels vary by release — not verified on the current PDI release.
- **Auto-generated ACLs.** Depending on release and settings, creating a table can create default CRUD ACLs tied to an auto-created role (e.g. `u_vendor_escalation_user`). Learners who skip milestone 7's inventory get confusing impersonation results. Not verified per release.
- **Self-service users and task ACLs.** `plain.employee` creating a record through `u_vendor_escalation.form` works only if no other rule (e.g. inherited `task` rules) blocks it; if it fails, debug the deciding record/field create ACL and adjust the prototype rules until the required create test passes; do not waive the acceptance criterion. Confirm `opened_by` defaults to the current user on creation.
- **Time-box:** for a 3-hour version, skip milestones 5 and 9 and the stretch goals.
- Remind learners this is a *prototype in their own PDI*; in client work this table would be built in a scoped application (sn201).
