---
lesson_id: sn102-03
course_id: sn102
pathway: servicenow-implementation-specialist
title: Navigating and Configuring the Instance
order: 3
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Navigate an instance and configure the system settings, lists, and preferences an implementer uses daily
---

## Getting your bearings

An instance can feel overwhelming for about a week and then feels small forever, because almost all of it is the same three screens repeated: a **navigator** to find things, a **list** to see many records, and a **form** to see one record. Learn those three and the ten thousand modules stop being ten thousand things.

Sign in and look at the top of the window. The **banner** carries the instance's identity, global search, and your profile menu. The profile menu is where you find settings, and — much more importantly for an implementer — where you find **Impersonate User**, which lets you see the instance exactly as another person sees it. You will use impersonation constantly once you get to access control, because it is the only honest way to test whether a permission change worked.

The **navigator** is where you find applications and modules. On the classic interface it runs down the left of the window; on instances using the Next Experience header (the default on new personal developer instances) the same menus open from **All**, **Favorites**, and **History** in the top bar. Either way it has two parts worth knowing: **All**, which lists every application and module you have access to, and **Favorites**, which lists the ones you pinned. Some instances also show a History tab holding recently-visited records. At the top of the navigator is a filter box, and that box is the single most useful control in the product.

Type into the filter box and the menu narrows as you type. Type `incident` and you get the Incident application and its modules. But the filter box also accepts two shortcuts that experienced implementers use more than the menu itself:

- `<table_name>.list` opens the list view of any table directly, whether or not a menu module exists for it. `sys_user.list`, `task.list`, `sys_db_object.list`.
- `<table_name>.form` opens a blank new-record form for that table.

This matters because most tables in the platform have no menu module at all. There is no navigator entry for the table that stores form layouts, but there is a table, and `.list` gets you to it.

Global search, in the banner, searches record data across configured tables — knowledge articles, catalog items, incidents. Do not confuse it with the navigator filter, which searches the *menu*. New implementers reliably type a table name into global search, get nothing useful, and conclude the platform is broken.

## Lists: seeing many records at once

Open any list — `incident.list` is a good one on a demo instance — and take it apart.

The **breadcrumb** sits just under the title and reads left to right as the filter currently applied. `All > Active = true > Priority = 1 - Critical` means two conditions are in force. Click any segment to strip the filter back to that point. Click **All** to remove everything. The breadcrumb is a control, not a label.

The **column headers** do three jobs. Clicking one sorts by that column. Clicking the small funnel or the header's context menu offers per-column filtering and grouping. Right-clicking a header opens the personalization options, including **Configure > List Layout**, where you choose which columns appear and in what order.

The **condition builder** opens from the funnel icon at the far left of the breadcrumb row. This is the real filtering tool. You choose a field, an operator, and a value, and you add rows with **AND** or **OR**. Two things about it are worth learning early. First, conditions read against the *current* table plus anything it points to: the dot-walk. If Incident has a Caller field pointing at `sys_user`, the field picker will let you drill from Caller into the user's Department, so "all incidents whose caller is in Finance" is one condition and no export to a spreadsheet. Second, once a filter is built you can save it, and a saved filter can be private, shared with a group, or made global.

Every row has a **context menu**, reached by right-clicking the row or clicking the small icon at the left of the row. From there you can open the record, copy a link to it, and — if you have the rights — update it in place. Selecting several rows with the checkboxes and then using the context menu gives you actions across all of them.

At the bottom of a list is **pagination** and the record count. At the top right, the **personalize list** gear and the **export** menu. Exporting to CSV, Excel, PDF, or XML is a normal, supported action, and the export honors your current filter and column layout exactly. That is worth knowing because "run me a quick report" is very often just a filtered list and an export.

Finally, lists are directly editable. Double-clicking a cell in an editable column opens an inline editor. Save the cell and the record is saved. Be careful: this is a real update, with all the automation that a form save would trigger.

## Forms: seeing one record

Click a record's number and you land on a form. The form is a rendering of one row.

The **header** has the record's title, the form context menu (the icon at the top left, sometimes called the hamburger), and the action buttons — typically Save, Update, and Delete, plus whatever buttons the application adds. **Save** keeps you on the record; **Update** saves and returns you to the list. That distinction sounds trivial and will save you dozens of misclicks.

The **body** shows fields, arranged in **sections** and often across **tabs**. Field types you will meet immediately:

- **String** — plain text, single or multi-line.
- **Choice** — a dropdown with a fixed set of options.
- **Reference** — a pointer to a row in another table. It shows a magnifying glass and offers type-ahead. Reference fields are how the relational structure of the platform surfaces in the interface.
- **Date/Time**, **True/False**, **Integer**, **Duration** — as they sound.
- **Journal** — an append-only field, such as Work Notes or Additional Comments. You cannot edit a journal entry you already saved; you can only add another. This is deliberate and it is why journals are trustworthy in an audit.

Mandatory fields are marked, and the platform refuses to save without them. Read-only fields are shown flat rather than in an input box.

Below the form body are **related lists**: other records that point at this one. On an incident you might see attached knowledge articles, child tasks, and affected configuration items. A related list is a list view, so everything you learned above — filtering, personalizing columns, context menus — works there too.

The **activity stream** (also called the activity formatter) shows the record's history: field changes, comments, and work notes in time order. It is the first place to look when someone asks "who changed this and when?"

Right-clicking the form header opens the form's own context menu. Two entries there matter now. **Copy sys_id** gives you the record's unique 32-character identifier, which every record in the platform has and which is what URLs actually use. **Configure > Form Layout** lets you change which fields appear on the form and where — a configuration change, saved to the instance, visible to everyone who uses that form view.

## Settings and preferences

The gear or profile icon in the banner opens **Settings**. Most of what is in there is a *personal preference*: it changes the instance for you and nobody else. Time zone, date format, list row density, accessibility options, and theme all live here. Personal preferences are stored as records in a preferences table, which is a nice early example of "configuration is data."

Two settings deserve special mention.

**Time zone** is not cosmetic. The platform stores date-time values in UTC and displays them in the viewing user's time zone. If your instance shows an incident opened at 09:00 and a colleague in another country sees 17:00, nothing is wrong. Set your time zone correctly and remember the rule when you are reading timestamps in someone else's screenshot.

**Impersonation**, reached from the profile menu, switches your session to another user. Everything — navigator contents, list results, form fields, buttons — is then evaluated as that person. End impersonation from the same menu. Impersonating is logged.

Beyond personal preferences sit **system properties**, which change the instance for everyone. These live in a table you reach with `sys_properties.list`, and they control things like the instance name shown in the banner, the number of rows a list shows by default, and whether certain features are enabled. Properties are powerful and unglamorous; a wrong value in the wrong property can affect every user at once. In this course you look at them and, at most, change cosmetic ones on your own developer instance.

The **System Administration** and **System Definition** menus in the navigator are where the instance's own furniture lives: users, groups, roles, tables, dictionary entries, scheduled jobs. You will not configure most of it in this course. Knowing which menu it is under is the point.

## Worked example: from question to answer in four clicks

Someone asks: *"How many active critical incidents does the Network team have, and can I get that as a spreadsheet?"*

1. In the navigator filter box, type `incident.list` and press Enter. You are on the incident list with whatever filter you last used, which is why the breadcrumb matters — click **All** to clear it.
2. Open the condition builder. Add `Active` `is` `true`. Add a second row: `Priority` `is` `1 - Critical`. Add a third: `Assignment group` `is` `Network`. Run the filter. The breadcrumb now reads back your three conditions and the footer shows the count. That is the number.
3. Right-click the header of the column you want a breakdown by — **Category**, say — and choose **Group By**, or right-click a header and use **Configure > List Layout** to add columns the requester will want, such as Opened and Assigned to.
4. Use the list's context menu to **Export > CSV**. The export contains exactly the rows and columns on screen.

Then, because you will be asked this again next week, save the filter with a clear name and share it with the group. The whole exchange took no configuration, no report builder, and no script.

## Practice

You need a signed-in instance for this. A personal developer instance with demo data is ideal; you will set one up formally in the course project, and you can do that lesson early if you prefer.

1. **Navigator drills.** Using only the navigator filter box, reach each of these in turn and note the technical table name shown in the list title: the Incident list, the Users list, the Groups list, and the Roles list. Then open a blank new incident form using the `.form` shortcut. Write down the two shortcuts from memory afterwards.

2. **Build and save a filter.** On the incident list, build a filter with at least three conditions, including one that dot-walks through a reference field (for example, a condition on the caller's department or location). Save the filter with a name of your choosing. Clear the breadcrumb, then re-apply your saved filter to confirm it works.

3. **Personalize a list.** Using **Configure > List Layout**, remove one column you do not care about and add two you do. Reorder them so the most important column is second. Then group the list by Assignment group and note how the display changes.

4. **Read a record properly.** Open any incident. Identify, and write down: one reference field, one choice field, one journal field, one related list, and the most recent entry in the activity stream. Then open the form context menu and copy the record's sys_id. Paste it somewhere and look at its length.

5. **Set your preferences and prove one of them matters.** In Settings, set your time zone to something several hours away from your real one. Return to the incident list and look at the Opened column. Change the time zone back. In one sentence, explain what the platform actually stored versus what it displayed.

6. **Impersonate.** Impersonate a user who is not an administrator — a demo instance will have several. Look at the navigator and count roughly how many applications you can now see compared to before. Open the incident list and note whether the record count changed. End the impersonation. Write two sentences on why this is the correct way to test a permissions question and why asking the user "can you still see it?" is not.
