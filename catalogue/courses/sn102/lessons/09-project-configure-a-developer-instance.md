---
lesson_id: sn102-09
course_id: sn102
pathway: servicenow-implementation-specialist
title: "Project: Configure a Developer Instance"
order: 9
kind: project
competency_ids:
  - D1-S1-C02
  - D1-S1-C03
objectives: []
---

## Goal

Stand up your own personal developer instance, configure it so it is usable and recognizably yours, and build a small, correct access model on it. When you finish, you will have the working environment that every remaining course in this pathway assumes you have, and you will have proved — with evidence, not assertion — that you can navigate an instance, adjust its settings, and reason about who is allowed to see and change a record.

This is a configuration exercise, not an implementation exercise. You are not building an application. You are furnishing the workshop you will build in for the next two years.

## Requirements

Work through the four parts in order. Part 4 depends on part 3.

### Part 1 — Get an instance and prove it is yours

1. Request a personal developer instance from the ServiceNow developer program using your own account.
2. Sign in as the administrator account you are given and change the password to something you will not lose. Record the instance URL, the admin username, and the password somewhere you can retrieve them, because a hibernated instance you cannot sign in to is worthless.
3. Confirm the instance is a working platform instance by reaching each of these using only the navigator filter box, and capturing evidence of each: the Incident list, the Users list, the Groups list, the Roles list, and the Tables list.

### Part 2 — Configure the instance and your own preferences

4. Set your own user preferences correctly: time zone, date and time format, and at least one display preference such as list density or theme. Your time zone must be your real one.
5. Complete your own user record: first name, last name, email, and title. This matters more than it looks — it is the record every ACL you write will be evaluated against.
6. Change one cosmetic system property so the instance identifies itself. Setting the instance banner or system name to something you recognize is enough. Note the property's name.
7. Personalize the incident list layout so it shows, at minimum: Number, Short description, Caller, Priority, State, Assignment group, and Opened. Order them so the columns you would read first are leftmost.
8. Build a filter on the incident list with at least three conditions, one of which dot-walks through a reference field. Save it with a clear name.

### Part 3 — Build a small access model

You are setting up access for a fictional internal team called **Workshop Support**.

9. Create a group named Workshop Support. Give it a description and a manager.
10. Create a role named for the group's fulfillers — for example, `workshop_agent`. Write a description that says what the role is for.
11. Grant the role to the **group**, not to any individual user.
12. Create two users: one who will be a member of Workshop Support, and one who will not be a member of anything. Give them names you can tell apart at a glance. Neither may hold any role granted directly.
13. Add the first user to the Workshop Support group. Confirm on that user's record that the role now appears as inherited rather than direct.

### Part 4 — Test the access model by impersonation

14. Impersonate the group member. Record what the navigator shows them, whether they can open the incident list, and what the record count is.
15. Impersonate the user with no group and no roles. Record the same three observations.
16. Produce a short comparison of the two, and state which mechanism from the access-control lesson explains each difference you observed.
17. Pick one denial you produced and, with the same impersonation active, turn on the security debugger. Reproduce the denial and identify by name the access control rule that refused it and which part of that rule failed — role, condition, or script.

## Constraints

- **Work only in your own personal developer instance.** Nothing in this project may be done in a shared, client, or classroom instance.
- **Do not modify anything you did not create**, with the single exception of your own user record, your own preferences, the one cosmetic system property, and the incident list layout and filter. In particular, do not edit or deactivate any shipped access control rule, role, or business rule.
- **No scripting.** Every requirement here is achievable through configuration. If you find yourself writing code, you have chosen the wrong approach.
- **No new tables, applications, or automation.** Those belong to later courses.
- **Never grant a role directly to a user in this project.** Every role reaches a person through a group. This is the habit the project exists to build.
- Do not grant the `admin` role to either of the users you create.
- Keep your instance awake. Personal developer instances hibernate after a period of inactivity; wake yours before you start and do not leave the work half-finished across a long gap.

## Definition of done

You are finished when you can produce all of the following, as a short written submission with screenshots:

1. The instance URL, and a screenshot of the banner showing the identifying change you made in requirement 6, with the property name written beside it.
2. A screenshot of your own user record showing your completed profile, and a screenshot of your settings showing the time zone you set.
3. A screenshot of the personalized incident list showing all seven required columns in your chosen order.
4. A screenshot of the incident list with your saved filter applied, with the breadcrumb legible so all three conditions can be read, and one sentence naming which condition is the dot-walk and what it walks through.
5. A screenshot of the Workshop Support group record showing its roles related list with your role on it.
6. A screenshot of the member user's record showing the role present and marked as inherited, and a screenshot of the non-member's record showing no roles.
7. A comparison table of the two impersonations covering navigator contents, incident list access, and record count.
8. The name of the access control rule identified in requirement 17, which part of it failed, and one sentence explaining in plain English who that rule is designed to let through.
9. A closing paragraph, no more than six sentences, answering: why is granting the role to the group rather than the user the better design, and what would you have to do differently next month if you had granted it directly to five people?

Every item must be from your own instance. A screenshot of the documentation is not evidence that you configured anything.

## Hints

- If the developer program offers you a choice, take an instance with demo data. Several exercises are far easier to see with records already in the system, and every later course in this pathway assumes demo data is present.
- The navigator filter box shortcuts from lesson 3 will save you most of your clicks here: `sys_user.list`, `sys_user_group.list`, `sys_user_role.list`, `sys_properties.list`, `sys_security_acl.list`.
- Create the role before the group if you find the group form easier to complete in one pass; the order does not matter, but granting the role to the group does require both to exist.
- The roles related list on the group record is where requirement 11 happens. If you find yourself on a user form adding a role, stop — that is the direct grant the constraints forbid.
- The "inherited" marker in requirement 13 may take a moment to appear, and it is shown as a flag on the user's roles related list rather than as a separate section. If you do not see it, reload the record.
- For the impersonation comparisons, write down what you expect to see *before* you impersonate. Being wrong is the useful part; a prediction you never made teaches you nothing.
- The security debugger is switched on from the **Debug Security Rules** module (System Security > Debugging). Switch it on as yourself *before* you impersonate, because the user you impersonate cannot reach the module. Turn it off again when you are finished, because the annotations make ordinary work unreadable.
- If a user you created cannot sign in at all, check Active and Locked out on their record before you go looking at access control. Authentication failures and authorization failures look nothing alike once you know the difference, and this is the cheapest place to practice telling them apart.
- Take your screenshots as you go. Reconstructing evidence after the fact takes longer than capturing it did.
