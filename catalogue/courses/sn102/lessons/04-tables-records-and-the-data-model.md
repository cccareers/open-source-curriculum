---
lesson_id: sn102-04
course_id: sn102
pathway: servicenow-implementation-specialist
title: Tables, Records, and the Data Model
order: 4
kind: lesson
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
objectives:
  - Explain how tables, records, fields, and table extension organize data on the platform
---

## Tables, records, fields

A **table** is a definition of a kind of thing. A **record** is one of that thing. A **field** is one piece of information about it. If you have ever used a spreadsheet, the table is the sheet, the record is the row, and the field is the column.

The vocabulary in ServiceNow is worth being precise about, because two names exist for almost everything:

- Every table has a **label** (what humans read, such as "Incident") and a **name** (what the platform uses, such as `incident`). The name is lowercase, uses underscores, and never changes. You type the name in the navigator; you read the label in the interface.
- Every field likewise has a **label** ("Short description") and a **name** (`short_description`).
- Every record has a **sys_id**: a 32-character hexadecimal string that uniquely identifies it. Not the incident number — the number is a friendly, human-facing field. The sys_id is the real identity, it is what reference fields store, and it is what appears in URLs.

Open any list and you are looking at a table. Open a record and you are looking at one row of it. This is the whole model, and it does not get more complicated as you go up; it only gets wider.

Five fields exist on essentially every record, added by the platform without anyone configuring them: `sys_id`, `sys_created_on`, `sys_created_by`, `sys_updated_on`, and `sys_updated_by`. You will use them more than you expect. "Who touched this and when" is answerable on any record on the platform.

## The dictionary: tables about tables

Here is the idea that separates people who use ServiceNow from people who can implement on it. **The definitions of the tables are themselves stored in tables.**

- `sys_db_object` holds one record per table in the instance. Its rows describe the incident table, the user table, and itself.
- `sys_dictionary` holds one record per field. Each row says which table the field belongs to, its name and label, its type, its maximum length, whether it is mandatory, whether it is read-only, and its default value.
- `sys_choice` holds the options for choice fields — one row per option, with a label, a stored value, and a sequence.

Together these are called **the dictionary**. When you add a field to a table through the interface, what actually happens is that a record is inserted into `sys_dictionary`, and the platform adjusts the underlying database to match. You are not editing a schema file. There is no schema file.

Two consequences follow immediately. First, you can *browse* the data model. Typing `sys_db_object.list` gives you every table in the instance, filterable and sortable like any other list. Typing `sys_dictionary.list` and filtering on Table equals `incident` gives you every field on the incident table with its type and settings — far faster than clicking through a form and guessing. Second, because dictionary entries are records, everything you know about records applies: they have a sys_id, they are audited, and they can be packaged and moved between instances.

The tool you will actually reach for most is the **Tables** module under System Definition, which opens the table list, and from a table record the **Columns** related list, which is the dictionary filtered for you. There is also a **Schema Map**, which draws a table and everything it points to as a diagram — useful the first time you meet an unfamiliar application.

## Field types worth knowing

The type of a field determines how it is stored, how it is displayed, and what you can filter on. A representative sample:

| Type | Stores | Notes |
| --- | --- | --- |
| String | Text | Has a max length; long descriptions use a large max length |
| Choice | A short value from a fixed list | Displays a label, stores a value; the two differ |
| Reference | A sys_id from another table | The relational backbone |
| True/False | A boolean | Filters as `is true` |
| Date/Time | An instant, stored in UTC | Displayed in the viewer's time zone |
| Integer / Decimal | Numbers | |
| Duration | An elapsed time | Used heavily by SLAs |
| Journal | Append-only entries | Work notes, comments; entries are never edited |
| List | Multiple sys_ids from another table | A many-valued reference |
| Glide List / Watch list | Multiple users | |

**Choice fields have two values and this catches everyone once.** The State field on an incident might display "In Progress" while storing `2`. When you filter, you pick the label. When you write a condition somewhere deeper in the platform, you may see the value. Neither is wrong; they are two faces of one field.

**Reference fields are the important ones.** A reference field stores a sys_id and displays whatever the target table designates as its display value. The Caller field on an incident stores a 32-character string and shows you "Abel Tuter." Because the platform knows the field points at `sys_user`, it can offer type-ahead, it can render a preview when you hover, and — critically — it can let you filter and report across the relationship without a join you have to write.

That last capability is called **dot-walking**. In the condition builder, a reference field expands so you can select fields on the *referenced* record. `Caller.Department` is a legal condition on the incident list. You can go further: `Caller.Department.Manager` walks two references. In a list layout you can add a dot-walked column and see the caller's location beside the incident. When you meet scripting later in the pathway, dot-walking looks the same in code. Learning it here, in a filter, is learning it everywhere.

## Table extension

Most tables on the platform do not stand alone. A table can **extend** another table, and when it does it inherits every field the parent defines and can add its own.

The canonical example is `task`. The task table defines what any unit of work needs: `number`, `short_description`, `description`, `state`, `priority`, `assignment_group`, `assigned_to`, `opened_by`, `opened_at`, `closed_at`, `work_notes`. Then:

- `incident` extends `task` and adds `caller_id`, `category`, `subcategory`, `severity`, `urgency`, `impact`, and resolution fields.
- `problem` extends `task` and adds cause and workaround fields.
- `change_request` extends `task` and adds `risk`, `type`, `start_date`, `end_date`, and an implementation plan.
- `sc_req_item` (a requested item) extends `task` and adds a pointer to the catalog item that produced it.
- HR cases and customer service cases extend `task` through their own intermediate tables.

The database side of this is worth one sentence: however the platform physically stores a hierarchy (for `task` it usually keeps parent and children together in one physical table; other hierarchies use other strategies), querying the parent returns rows of every child, and each row records its own class in a field called `sys_class_name`. That is why `task.list` shows incidents and change requests side by side, each row knowing what it is.

Extension is not only for work. `cmdb_ci` is the base for configuration items and extends into `cmdb_ci_computer`, `cmdb_ci_server`, `cmdb_ci_appl`, and many more. `sys_user` does not extend anything but is referenced by nearly everything.

The implementer's instinct to build here is: **extend when the new thing genuinely is a kind of the parent thing**, because you get the parent's fields, the parent's automation, and the parent's reporting for free. Create a standalone table when it is not. A "Facilities Request" is a kind of task. A "Building Floor Plan" is not.

## Relationships beyond extension

Extension is an *is-a* relationship. The platform also needs *has-a* relationships, and there are three shapes.

**One-to-many** is a plain reference field on the many side. Each incident has one caller; a user can be the caller on many incidents. There is no field on the user record listing their incidents — instead the incident table has a `caller_id` field, and the user form shows a related list built by looking backwards through it. That is what a related list is: a list of records that point at the record you are looking at.

**Many-to-many** needs a third table whose rows each hold two references. A knowledge article can apply to many incidents and an incident can cite many articles, so a relationship table holds one row per pairing. You will see these on forms as related lists with an **Edit** button that opens a slushbucket.

**Parent-child within one table** is a reference field pointing at the same table. `task` has a `parent` field pointing at `task`. That is how a change request holds change tasks and how an incident can hold child incidents.

## Worked example: reading an unfamiliar table

You are handed an instance and told a team uses "Vendor Escalations." Nobody can tell you how it is built. Here is the sequence that answers it in about five minutes, using nothing but navigation.

1. Type `sys_db_object.list` in the navigator. Filter on **Label** `contains` `escalation`. You find a table with label "Vendor Escalation" and name `u_vendor_escalation`. The `u_` prefix tells you it was created in this instance rather than shipped by ServiceNow.
2. Open the table record. Look at the **Extends table** field. It reads `task`. You now already know it has a number, a state, a priority, an assignment group, and work notes, and that it will appear in task-level reporting.
3. Scroll to the **Columns** related list. Skim the field names and types. You spot `u_vendor`, a Reference to `core_company`, and `u_breach_date`, a Date/Time. Those two fields plus the inherited task fields are the whole story.
4. Type `u_vendor_escalation.list` to see the actual records. Open one. Confirm the form shows the inherited fields and the two custom ones.
5. In the condition builder, dot-walk from `u_vendor` into the company's own fields to build "all open escalations for vendors in a given country." You never had to ask anyone.

That sequence — table list, extends, columns, records, dot-walk — works on every table in the platform, including ones you build.

## Practice

Use a personal developer instance with demo data.

1. **Browse the dictionary.** Open `sys_dictionary.list` and filter to `Table` `is` `incident`. Sort by Type. Write down one field of each of these types: string, choice, reference, date/time, journal. For the reference field, note which table it points at.

2. **Prove that a choice field has two values.** Open an incident and note the displayed State. Then, in the dictionary or through the choice list (`sys_choice.list`, filtered to the incident table and the state field), find the stored value behind that label. Write both down.

3. **Map the task family.** Open the table record for `task` and look at its **Extended by** information, or filter `sys_db_object.list` on `Extends table` `is` `Task`. List at least six tables that extend it. Pick two and, for each, name two fields it adds that the other does not have.

4. **Dot-walk twice.** On the incident list, build a filter that reaches two references deep — for example, incidents whose caller's department has a specific manager, or whose configuration item belongs to a specific company. Then add a dot-walked column to the list layout so the referenced value is visible on screen.

5. **Read a related list backwards.** Open a user record and find a related list of records that point at that user. Then find the field on the *other* table that creates that relationship. Write one sentence explaining where the relationship is actually stored.

6. **Design decision.** For each of the following, decide whether you would extend `task`, extend `cmdb_ci`, or create a standalone table, and justify it in one sentence each: (a) a request to have a new laptop provisioned, (b) a record of a printer on the third floor, (c) a list of the office's parking-space assignments, (d) a security incident that must be worked, assigned, and closed.

## Check your understanding

1. You filter `sys_dictionary.list` to `Table is incident` and do not see `assignment_group`. Is the field missing? *No. It is defined on `task`, so its dictionary entry belongs to `task`; incident inherits it. The table's Columns related list shows inherited fields as well.*
2. The incident State shows "In Progress." A colleague's filter in a script says `state=2`. Are they looking at different things? *No. 2 is the stored value; "In Progress" is the label of the same choice.*
3. What does a reference field actually store? *The sys_id of the target record. It displays the target table's display value.*
4. Why does one query on `task` return incidents, problems, and changes? *They extend `task`, so querying the parent returns every child's rows; `sys_class_name` tells you which kind each row is.*
