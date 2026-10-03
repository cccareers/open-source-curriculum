---
lesson_id: sn102-05
course_id: sn102
pathway: servicenow-implementation-specialist
title: Users, Roles, and Access Control
order: 5
kind: lesson
competency_ids:
  - D1-S1-C03
objectives:
  - Explain how users, groups, roles, and access controls determine who can see and change a record
---

## Who is asking?

Every request the platform handles begins with the same question: who is asking, and what are they allowed to do? The first half is **authentication**. The second half is **authorization**. They are different mechanisms, they fail in different ways, and confusing them is the most common cause of an implementer chasing the wrong problem for an afternoon.

Authentication establishes identity. Out of the box, an instance authenticates with a local username and password stored against the user record. Real organizations rarely leave it there. The common production pattern is **single sign-on** using SAML or OpenID Connect: the instance redirects the browser to the organization's identity provider, the identity provider authenticates the person and returns a signed assertion, and the instance matches that assertion to a user record and starts a session. **Multi-factor authentication** adds a second proof. **LDAP** is often used alongside SSO, not for login but to import and keep user and group records in step with the corporate directory. Integrations that are not people authenticate differently again — with a dedicated service-account user and, usually, OAuth rather than a password.

The detail to hold on to is that however a person authenticates, the result is the same: a session tied to one row in `sys_user`. Nothing downstream cares which mechanism produced it. Authorization is evaluated identically for a locally-authenticated user and an SSO user.

## Users, groups, roles

Three tables carry authorization, and the relationships between them are the whole model.

**Users** live in `sys_user`. Real people, plus service accounts for integrations. A user record has the identity fields you expect and a handful that matter operationally: **Active**, which is how you disable someone (you never delete a user, because their sys_id is referenced across thousands of records), **Locked out**, and **Web service access only**, which marks a service account that must never log in through the browser.

**Groups** live in `sys_user_group`. A group is a set of users with a shared purpose — "Network Support," "HR Benefits," "Change Advisory Board." Groups do two distinct jobs and it is worth separating them in your head:

1. **Assignment.** Work is assigned to a group, and members pick it up. The Assignment group field on every task points here.
2. **Permission.** Roles granted to a group are inherited by every member, so adding a person to the group grants them the roles.

A group can have a **parent** group, and roles granted to the parent are inherited by the members of its child groups. Membership itself does not flow upward: being in a child group does not make you a member of the parent for assignment purposes. Group records also carry a manager and an email address, so notification can be addressed to the group rather than to a list of people who will change.

**Roles** live in `sys_user_role`. A role is a named permission — `itil`, `catalog_admin`, `knowledge_manager`, `admin`. A role by itself does nothing; it is a label that access rules test for. Roles can **contain** other roles, which is how a broad role implies narrower ones. Granting `itil_admin` typically grants `itil` along with it, because containment is evaluated recursively.

A user can hold roles two ways: **directly**, granted on the user record, or **through a group**, inherited from a group they belong to. Both are visible on the user form, and the platform marks inherited roles as inherited.

Almost always, prefer the group. A person changing teams then means one membership change rather than an audit of eleven individual role grants. This is not a style preference — it is the difference between an access model you can review and one nobody can explain a year later.

Two roles deserve their own paragraph. **`admin`** can do essentially anything, including bypassing most access controls; it is not a job title, it is a dangerous tool, and production instances keep the list of holders short and reviewed. **`itil`** is the classic fulfiller role: it is what makes someone an agent who can be assigned work and can see and update task records. A person with no role at all is not powerless — they are a **self-service user**, who can raise their own requests and see their own records, and in most organizations that is the majority of the user base.

## Access control rules

Roles say what a person *is*. **Access control rules** — usually just called **ACLs** — say what may be done to *what*, and they are where authorization actually happens.

An ACL is a record. It has four parts:

- A **type and name**, which identify what is being protected. The common type is `record`, and the name is `table.field`. `incident.*` protects every field on incident. `incident.None` protects the record itself. `incident.description` protects one field. The wildcard `*` on either side is legal, and `*.*` is the global fallback.
- An **operation**: `read`, `write`, `create`, `delete`. Each operation is evaluated separately, which is why "I can see it but not edit it" is a completely normal state.
- A **required role list**. If it is empty, the rule does not test roles at all.
- A **condition** and an optional **script**, which test the record and the current user.

Evaluation follows rules that are worth memorizing, because they explain almost every access surprise you will meet:

1. **Deny by default.** If no ACL matches a table and operation at all, access is refused. Nothing is open because nobody thought about it.
2. **Most specific first.** The platform evaluates field-level rules before table-level rules, and the matching table's own rules before its parent's. `incident.description` is considered before `incident.*`, which is considered before `task.*`, which is considered before `*.*`.
3. **All parts of a matching rule must pass.** The role test **and** the condition **and** the script must all be satisfied. Any one failing fails the rule.
4. **Both the field and the record must permit the operation.** A field-level grant does not help if the record-level rule denies you.
5. **At the deciding level, one passing rule is enough.** If several ACLs match at the same, most specific level — two `read` rules on `incident`, say — you need to pass only one of them. That is how one rule can grant read to a role while another grants read to the record's caller.

Put those together and the behavior falls out. A self-service user opening an incident they reported sees the record because a rule grants read when the caller is the current user. They cannot see a colleague's incident because that same condition fails and nothing else grants them read. An `itil` user sees both, because a different rule grants read to the `itil` role with no record condition.

When access does not behave as you expect, the tool is the **security debug** feature, switched on from the **Debug Security Rules** module (under System Security > Debugging; System Diagnostics > Session Debug offers the same switch). Turn it on as an administrator *before* you impersonate, because the person you impersonate usually cannot reach the module. With it on, the platform annotates the page with which ACLs were evaluated and which passed or failed. Combined with impersonation, it turns a guessing game into a reading exercise: impersonate the person, turn on the debugger, open the record, read which rule denied you.

## The other layers around ACLs

ACLs are the core, but they are not the only thing shaping what a person sees. Three neighbours are worth recognizing so you do not mistake one for another.

**Query business rules** filter results before the ACLs ever run, by adding conditions to every query against a table. They are why a user can see zero rows in a list rather than seeing rows they cannot open. You will meet business rules properly in the automation lesson.

**Domain separation** partitions an instance's data so that one tenant of a shared service organization cannot see another's, with data visibility following the domain of the user. Managed service providers use it heavily. It is an architecture decision made once, not a per-record setting.

**UI policies and client-side rules** can make a field read-only or hidden on a form. They are a usability layer, not a security layer. A field hidden by a UI policy is still readable through a list, an export, or an integration if the ACL permits it. Never use a UI policy to protect data; use an ACL, and use the UI policy to make the form pleasant.

The general principle underneath all of this is **least privilege**: grant the narrowest permission that lets the person do the job, grant it to a group rather than a person, and review it. Every audit finding you will ever see about a ServiceNow instance is some version of that sentence.

## Worked example: designing access for a small team

A finance team wants a "Vendor Escalation" record type. The requirements, as stated by the business:

- Anyone in the company may raise an escalation.
- Only members of Vendor Management may work one.
- Only the Vendor Management manager may delete one.
- The commercial-terms field must be visible only to Vendor Management.

Translate each line into a mechanism.

*"Anyone may raise one"* is a `create` ACL on the table with no role required. It has no condition, because there is nothing about the person to test.

*"Only Vendor Management may work one"* is two kinds of rule. Write needs a record-level `write` ACL on `u_vendor_escalation` and a field-level `write` ACL on `u_vendor_escalation.*`, both requiring a `vendor_management` role — rule 4 says both the record and the field must permit the write. And a `read` ACL that grants read either to the same role or, with a condition, to the person who opened the record — otherwise the requester cannot see the thing they filed.

*"Only the manager may delete"* is a `delete` ACL requiring a narrower role, say `vendor_management_admin`, held by exactly one person through a group with one member.

*"The commercial-terms field is restricted"* is a field-level `read` ACL on `u_vendor_escalation.u_commercial_terms` requiring the `vendor_management` role. Because field rules are evaluated before table rules, this hides the field from the requester while leaving the rest of the record visible to them.

One practical note before you build any of this: creating or changing an ACL requires the `security_admin` role to be **elevated** for your session, even if you are an administrator. You will find **Elevate role** in your user menu.

Then the part beginners skip: create the roles, create the group, put the roles on the *group*, put the people in the group. Nobody gets a direct role grant. Now, when the team gains a member, the change is one line in one related list.

Finally, test it properly. Impersonate a plain employee and confirm they can create and see their own but not the commercial-terms field. Impersonate a Vendor Management member and confirm they can write. Impersonate someone in neither group who has never raised an escalation and confirm they cannot open any record; because there is no query business rule, the list shows a message that rows were removed by security constraints rather than looking genuinely empty. Turn on the security debugger for the case that surprises you.

## Practice

Use a personal developer instance. Nothing here needs demo data beyond what ships.

1. **Read a real user's access.** Open `sys_user.list`, pick a user with roles, and open the record. List their roles and mark each one as directly granted or inherited from a group. Then open one of those groups and confirm the role grant from the group's side.

2. **Trace a role containment chain.** Open `sys_user_role.list` and find `itil`. Look at which roles contain it and which roles it contains. Draw the chain. Write one sentence on what granting the containing role implies.

3. **Build the group properly.** Create a role and a group of your own. Grant the role to the group, not to any person. Add your own user to the group. Confirm on your user record that the role now shows as inherited. Then remove yourself from the group and confirm the role disappears.

4. **Read three ACLs.** Open the access control list (`sys_security_acl.list`) and filter to the incident table. Find one record-level `read` rule, one `write` rule, and one field-level rule. For each, write down its name, operation, required roles, and condition, and then state in plain English who it lets through.

5. **Prove least privilege with impersonation.** Impersonate a user with no roles. Try to open the incident list — note what you see. Try to create an incident through the self-service interface — note whether you can. Try to open an incident you did not report. Then impersonate an `itil` user and repeat all three. Record the differences in a small table.

6. **Debug a denial.** Pick one of the denials you produced in the previous exercise. With the same impersonation active, turn on the security debugger, reproduce the denial, and read the output to identify which ACL failed and on which of its parts — role, condition, or script. Write down the rule name.

7. **Authentication vs authorization.** In two or three sentences each, describe what would break if (a) the SSO identity provider went offline, and (b) somebody removed the `itil` role from a group of fulfillers. Say for each whether it is an authentication or an authorization failure and how you would tell from the symptom alone.

## Check your understanding

1. A user can open an incident but every field is read-only. Authentication or authorization problem? *Authorization. They are signed in (authentication worked); a `write` ACL is denying them.*
2. You hide a salary field with a UI policy. Is the data protected? *No. UI policies are usability only; the value can still be read through a list, export, or integration. Use a field-level `read` ACL.*
3. Two `read` ACLs exist on the same table: one requires `itil`, the other has the condition "Caller is me." A user without `itil` opens their own incident. Can they read it? *Yes. At the same level, passing either rule is enough.*
4. Why grant roles to groups rather than users? *A move between teams becomes one membership change, and the access model stays reviewable.*
