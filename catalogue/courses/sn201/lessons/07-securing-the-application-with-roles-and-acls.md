---
lesson_id: sn201-07
course_id: sn201
pathway: servicenow-implementation-specialist
title: Securing the Application with Roles and ACLs
order: 7
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Secure an application with roles and access control rules
---

## What you have not secured yet

Your application works. A requester can log a job, a technician can work it, a manager can approve a contractor visit. Every one of those people is currently you, holding the admin role, and the application has no idea who anyone is.

Right now, in your instance:

- Any user who can reach the table can read every work order, including the ones with a note about an employee's medical accommodation.
- Any user can change `total_cost` after closure.
- The Technician view from lesson 4 hides fields, but a technician can switch views, open the list, or export to a spreadsheet and see everything.

That last point is the one to hold onto. **Views, UI policies, and forms are presentation. They are not security.** Hiding a field on a form removes it from one screen; it does not remove it from list views, exports, reports, the API, or a flow. Security on this platform is enforced in one place — access control rules — and everything else is convenience.

## Roles: naming jobs, not permissions

A **role** is a named bundle of authority. Users hold roles, and rules grant access to roles.

Three facts about roles are worth getting right immediately.

**Roles come from groups, in practice.** You *can* assign a role directly to a user, and you will while testing. In a real deployment, roles are attached to **groups** and users are put in groups, because group membership is something a service desk can manage and a role assignment usually is not. Your facilities application should define roles and then attach them to the Facilities Technicians and Facilities Managers groups.

**Roles contain other roles.** A role record has a list of contained roles, and holding the container grants all of them. This is how you build a hierarchy: `facilities_manager` contains `facilities_technician`, so every manager automatically has everything a technician has, and you never write a rule listing both.

**Scoped applications get scoped roles.** A role you create inside your application is named with your scope prefix — `x_acme_facilities.technician`. That prefix is not decoration; it tells anyone reading a rule which application owns the role.

The facilities role model:

| Role | Contains | Who holds it | What it means |
| --- | --- | --- | --- |
| `x_acme_facilities.requester` | — | Everyone, effectively | Can raise a job and see their own |
| `x_acme_facilities.technician` | requester | Facilities Technicians group | Can work assigned jobs |
| `x_acme_facilities.manager` | technician | Facilities Managers group | Full access, approvals, costs |

Notice the roles are named after *jobs*. Resist `x_acme_facilities.can_edit_cost` — the moment two different jobs both need to edit cost, that name becomes a lie, and permission-shaped role names multiply until nobody can say who is allowed to do what.

You will also meet platform roles. `admin` bypasses almost everything and is not a role your application should require. `itil` is the standard fulfiller role in ITSM. Your application's roles are yours; do not overload existing platform roles with your meaning.

## Access control rules

An **access control rule**, universally called an ACL, is the enforcement point. Every read, create, write, and delete on every record and every field passes through them.

An ACL record has five parts that matter:

**Type.** Almost always `record` for application work. Other types secure things like UI pages and processors.

**Operation.** `create`, `read`, `write`, `delete`. Each is evaluated separately, so read access does not imply write access.

**Name.** The target, written as `table.field`:

- `x_acme_facilities_work_order.None` — the **record-level** rule for the table. This is the one that decides whether the record is accessible at all.
- `x_acme_facilities_work_order.*` — the default rule for **any field** on the table that has no specific rule.
- `x_acme_facilities_work_order.total_cost` — a rule for **one field**.
- `*.*` — a global wildcard. Leave these alone; they are platform infrastructure.

**Requires role.** A list. Holding *any one* of the listed roles satisfies this part. An empty list means the role check passes for everyone.

**Condition and Script.** A condition builder filter, and an optional script that must evaluate to `true`. The script gets `current` and `answer`; setting `answer` to `true` or `false` is how it votes.

Here is the rule that decides everything else: **within a single ACL, the role check AND the condition AND the script must all pass.** They are combined with AND, not OR. An ACL with a role of `technician` and a condition of `Assigned to is me` grants access only to technicians looking at their own work.

## How the platform decides

![The order in which the platform evaluates field-level and record-level access control rules for a single field on a record](./img/acl-evaluation-order.png)

For a given operation on a given field of a given record, the platform works from most specific to least specific, in two passes.

**Field-level pass.** Look for a rule matching `table.field` exactly. If none exists, look for the same field on the parent tables (`task.field`), then on the wildcard table (`*.field`). Only then fall back to the any-field rules in the same order: `table.*`, then `task.*`, then `*.*`. The first level that has a matching rule decides the pass. Because your table extends Task, rules written on Task apply to your records too.

**Record-level pass.** Evaluate `table.None`, again walking up the hierarchy if there is nothing at your level.

Access is granted only if **both passes grant it.** A field is visible only if you can see the record *and* the field.

Two consequences follow, and both surprise people.

**The most specific matching rule wins its pass — it does not add to the others.** If `table.*` grants write to technicians and `table.total_cost` grants write only to managers, a technician cannot write `total_cost`. The specific rule replaced the general one for that field; it did not stack on top of it.

**If no rule matches at all, access is denied.** The platform defaults closed. If you create a table and no rule anywhere in its hierarchy covers it, nobody but admin sees it. Extending Task is what usually saves you here — task's rules apply — and that inheritance is worth being conscious of rather than lucky about.

## Writing the facilities rules

Design the security model as a table before you create a single record. This is the whole model:

| Operation | Target | Roles | Condition |
| --- | --- | --- | --- |
| create | `work_order.None` | requester | — |
| read | `work_order.None` | manager | — |
| read | `work_order.None` | technician | Assigned to is me OR Assignment group is one of my groups |
| read | `work_order.None` | requester | Requested by is me |
| write | `work_order.None` | technician | Assigned to is me AND State is not one of Closed Complete, Closed Incomplete |
| write | `work_order.None` | manager | — |
| delete | `work_order.None` | manager | — |
| write | `work_order.total_cost` | manager | — |
| read | `work_order.total_cost` | manager | — |
| write | `work_order.*` | technician | — |

Read that model as prose and check it says what you mean. A requester sees their own jobs and nothing else. A technician sees what they or their group are assigned, and can edit until it closes. A manager sees and does everything, and is the only person who can touch cost. Nobody except a manager can delete.

Note what the model does *not* do: it does not try to encode the closure-fields behaviour from lesson 4. That is presentation and belongs in the UI policy. Security answers "may this person do this at all," never "is this the right moment in the process."

Note also the redundancy that is not redundancy. There are three read rules on `.None`, one per role, because they carry different conditions. Multiple rules at the same specificity are evaluated together and access is granted if any of them passes — this is the one place the logic is OR rather than AND, and it is exactly what lets you express "managers see everything, technicians see theirs."

## Editing ACLs safely

The platform guards its own security configuration. Creating or modifying an ACL requires **elevated privilege** — the `security_admin` role, activated for the session through the elevate-role control rather than held permanently. If the option to create an ACL is missing, that is why.

Two habits make ACL work survivable:

**Change one rule at a time and test it.** ACL debugging is genuinely hard because a denial tells you nothing about which rule denied it. Ten new rules and a broken application is a very long afternoon.

**Use impersonation constantly.** Impersonating a user makes the platform evaluate every rule as that user, which is the only honest test. Build a test user for each role, put them in the right groups, and impersonate after every change. There is also a debug mode that annotates a form with which rule granted or denied each field; turn it on when a denial makes no sense, and turn it off before you forget.

## Application access: the other boundary

Separately from ACLs, each table you create carries **application access** settings, which govern the *scope* boundary from lesson 2 rather than the user:

- **Can read / Can create / Can update / Can delete** — whether other applications may perform these on your table at all.
- **Accessible from** — either *All application scopes* or *This application scope only*.
- **Allow configuration** — whether another application may add fields or rules to your table.

The conservative default for an application you intend to ship is *This application scope only*, opened deliberately where another application genuinely needs in. These settings and ACLs answer different questions: application access asks "may this **code** reach my table," ACLs ask "may this **person** reach this record." Both must pass.

## Authentication: who the user is in the first place

Every rule above assumes the platform knows who is asking. That is authentication, and it is configured at the instance level rather than inside your application — but you need to understand it, because it determines what identities your roles are attached to.

**Local authentication.** Credentials stored on the instance, in the user record. Fine for a development instance and for a handful of break-glass accounts. Not how an enterprise runs.

**LDAP.** The instance connects to a corporate directory over a connector, imports users and groups on a schedule, and can authenticate against the directory. This is a long-standing pattern for keeping the user table synchronised with the organisation. Note the two halves: *importing* identities and *authenticating* them are separate configurations, and it is common to import from LDAP while authenticating somewhere else.

**Single sign-on with SAML 2.0.** The instance trusts an external identity provider. The user hits the instance, is redirected to the provider, signs in there, and comes back with a signed assertion; the instance maps a field in that assertion — usually email or user name — to a user record. This is the dominant enterprise pattern. Setting it up means exchanging metadata and certificates with the identity provider and configuring an identity provider record on the instance. Crucially, **always keep a local admin login path available** while configuring SSO, or a bad certificate locks everyone out including you.

**Multiple provider SSO.** More than one identity provider active at once, which is what an organisation needs after an acquisition, or when employees and contractors authenticate differently.

**Multi-factor authentication.** A second factor after the password. It can be enabled instance-wide or required only of users holding sensitive roles.

**OAuth.** Token-based authentication for *applications* rather than people — an external system calling the instance, or the instance calling out. This belongs to the integration courses; know that it is the right answer for machine identity and that embedding a human's credentials in an integration is not.

For your application the practical implication is short: your roles attach to user and group records, and how those records get populated and authenticated is an instance decision made once. Design your security model so it survives that decision — which means depending on groups and roles, never on a hard-coded list of user names.

## Practice

Work in the `Facilities Work Orders` application. Elevate to `security_admin` when you need to create rules.

1. **Create the roles.** Create `requester`, `technician`, and `manager` in your application scope, with `manager` containing `technician` and `technician` containing `requester`. Verify the containment by opening the manager role and confirming the contained roles are listed.

2. **Attach roles to groups.** Add the roles to your Facilities Technicians and Facilities Managers groups from lesson 6. Create three test users — one requester, one technician in the technicians group, one manager — and confirm each shows the roles you expect on their user record.

3. **Write the record-level rules.** Implement every `.None` row of the table above. After each one, impersonate the affected user and check what changed. Expect the application to look broken partway through; that is what building security from denied-by-default feels like.

4. **Write the field-level rules.** Implement the `total_cost` and `*` rules. Impersonate a technician and confirm `total_cost` is invisible on the form *and* absent from the list column chooser *and* missing from an export.

5. **Prove that a view is not security.** Impersonate a technician, switch from the Technician view to the Default view, and confirm they still cannot see `total_cost`. Then write two sentences contrasting what the view did and what the ACL did.

6. **Test the condition, not just the role.** As a technician, open a work order assigned to a different technician outside your groups. Confirm it is inaccessible. Then have a manager assign it to you and confirm it becomes accessible without any rule change.

7. **Break it deliberately.** Add a role requirement to the `create` rule that none of your test users hold. Impersonate the requester and try to raise a job. Read the failure. Then use the security debug output to identify the rule that denied it, and fix it.

8. **Set application access.** Set `work_order` to be accessible from this application scope only. Then, from a global background script or another scope, attempt to read it and observe the result. Restore whatever setting your project needs.

9. **Document the authentication decision.** Write a short note for your application's documentation stating which authentication method a production deployment of this application should assume, why, and one risk that method introduces. Half a page. This is the kind of note a real implementation specialist is asked for constantly.

## Check your understanding

1. A technician switches to the Default view and still cannot see `total_cost`. Which mechanism is responsible? *The field-level read ACL; views only change presentation.*
2. `work_order.*` grants write to technicians; `work_order.total_cost` grants write to managers only. Can a technician write `total_cost`? *No. The more specific rule decides that field's pass; rules do not stack across levels.*
3. Three `read` rules exist on `work_order` (None) with different roles and conditions. How many must a user pass? *One. Rules at the same level combine with OR.*
4. What does application access control that ACLs do not? *Whether code in other scopes may reach the table at all, regardless of the user.*
