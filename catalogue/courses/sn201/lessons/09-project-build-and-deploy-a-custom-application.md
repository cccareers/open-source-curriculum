---
lesson_id: sn201-09
course_id: sn201
pathway: servicenow-implementation-specialist
title: 'Project: Build and Deploy a Custom Application'
order: 9
kind: project
competency_ids:
  - D1-S1-C01
  - D7-S1-C02
  - D10-S1-C02
objectives: []
---

## Goal

Build and deploy a new scoped application, from an empty scope to a packaged release, without being told what the tables are.

Everything in lessons 2 through 8 was demonstrated on the facilities work order example, and you followed along. This project gives you a different business problem in the same shape and asks you to make every design decision yourself: what the tables are, which one extends Task, what the states are, where the logic goes, what the roles are, and how it moves. The point is not to produce a large application. It is to produce a small one where every choice was deliberate and you can defend it.

## The business problem

The IT service desk lends equipment — laptops, projectors, conference speakerphones, mobile hotspots — to employees for short periods. Today the process is a shared spreadsheet and a cupboard.

Here is how the service desk manager describes the work, in her words. Read it the way you read the facilities description in lesson 3: underline the nouns, and notice where a requirement implies a wait.

> "An employee asks to borrow something for a date range. We check whether we have one free. If they want it for more than two weeks, or if it's one of the expensive items, their manager has to approve it first. Otherwise we just book it. When they collect it we record who handed it over and what condition it was in. When they bring it back we record the condition again, and if it's damaged we raise a note about it. Anything that's more than three days overdue, I want to know about every morning. Oh — and the loans register has people's names against equipment, so the desk agents should only see the loans for their own site, not everybody's."

That is the entire specification. It is deliberately as vague as a real one.

## Requirements

Your application must satisfy all of the following. Each maps to a lesson; the mapping is given so you can go back, not so you can copy.

**Scope and structure (lesson 2)**

1. A scoped application with your own prefix, a real description, and a version number you set deliberately.
2. All application artifacts owned by that scope. Nothing important in Global.

**Data model (lesson 3)**

3. At least three tables, at least one of which extends an appropriate base table, with a written justification for the extension.
4. At least one reference field pointing at a platform table you did not build.
5. At least one one-to-many relationship rendered as a related list.
6. A state model with numeric, gapped values and exactly one terminal state per outcome.
7. No repeated value stored as free text anywhere.

**Interface (lesson 4)**

8. A default form organised into sections that match the order the work is done in.
9. At least one additional view for a distinct audience, selected automatically by a view rule.
10. At least two UI policies, each with On load and Reverse if false set correctly.

**Logic (lesson 5)**

11. At least one `before` business rule that derives or stamps a value on the record being saved.
12. At least one `after` business rule that affects a different record.
13. At least one client script — `onChange` or `onSubmit` — with the correct guards.
14. For each of the above, a one-line note saying why that mechanism and not the one above it in the decision table.

**Automation (lesson 6)**

15. One flow implementing the approval branch of the process, with a trigger condition, an approval step, and both outcomes handled.
16. One scheduled flow implementing the overdue notification.
17. Log steps in both, and clean execution details for at least one successful run of each.

**Security (lesson 7)**

18. At least three application roles, named after jobs, with containment where it makes sense.
19. Record-level ACLs for create, read, write, and delete, with at least one condition-based rule implementing the site restriction the manager asked for.
20. At least one field-level ACL protecting something that not everyone should see.
21. Evidence of testing by impersonation, not by reasoning.

**Deployment (lesson 8)**

22. The whole application captured in a named, described update set, or committed to a linked source control repository — ideally both.
23. A plan for any reference data the application needs that an update set will not carry.
24. A release note covering what the application does, its version, its dependencies, the data plan, and a back-out plan.

## Constraints

These are the boundaries of the exercise. Working inside them is part of the assessment.

- **Low-code first.** Every requirement that a UI policy, data policy, reference qualifier, or flow can satisfy must be satisfied that way. Script only where configuration genuinely cannot reach.
- **Scripts stay single-purpose.** No script include, no reusable server-side class, no shared script library. If you find yourself wanting one, write down why and stop — that instinct is correct, and sn250 is where you act on it.
- **No Service Portal or custom front end.** The platform's standard forms and lists are the interface.
- **No integrations.** Nothing leaves the instance except platform notifications. No Scripted REST API, no outbound call.
- **No automated tests.** Manual verification, documented.
- **No release names.** Write your documentation so it is correct on any current instance.
- **Time box.** This is a two-hour build on top of skills you already have. If a requirement is taking you a long time, the design is probably fighting you — go back to the data model rather than pushing through.

## Definition of done

You are done when all of the following are true. Check them literally; do not check them from memory.

1. A user with only the requester-equivalent role can create a loan request and can see their own requests and no one else's.
2. A desk agent can see and work the loans for their own site, and cannot see another site's.
3. A request that meets the approval criteria stops and waits for an approver; one that does not is booked without waiting.
4. Approving and rejecting both produce the correct end state, and the rejection reason is visible on the record.
5. The overdue flow runs on its schedule and produces output naming the correct records — verified by making a record overdue on purpose.
6. Every state in your state model is reachable, and every terminal state can actually be reached by a normal user.
7. Opening a saved record shows the same field arrangement as the record it was saved in — no UI policy fires that should not, and none fails to fire that should.
8. The field-level ACL holds when the protected field is viewed on a list, on a form, and in an export.
9. The application's update set previews cleanly on a second instance, or its repository can be applied to a clean instance, and the application works there after the move.
10. Your release note is complete enough that someone else could deploy the application without asking you a question.
11. Every design decision in the deliverables list below has a written justification of at least one sentence.

## Deliverables

Submit five things.

1. **The application**, on your development instance, at the version you set.
2. **A one-page data model description** — each table, its parent if any, its fields with types, and each relationship stated as a sentence.
3. **A decision log** — one line per non-obvious choice, in the form "I used X rather than Y because Z." Aim for eight to twelve lines. This is the deliverable your reviewer will read most closely.
4. **A security model table** — operation, target, roles, condition — in the format from lesson 7, with a note on which rows you verified by impersonation and as whom.
5. **The release note and the update set XML** (or the repository URL and commit hash).

## Hints

**Start with the sentences, not the tables.** Re-read the manager's description and underline every noun and every verb before you open the platform. The nouns that have facts attached are tables. The verbs that imply waiting are flow steps. Twenty minutes here saves an hour later.

**"Do we have one free?" is a data model question.** There is a difference between a *kind* of equipment and a *specific item*. If two people can borrow "a projector" at once, you have modelled the wrong thing. Decide whether the application tracks item types, individual items, or both, and be able to say why.

**Which table should extend Task?** The loan request is assigned to someone, has a state, and gets worked and closed. The equipment item is not any of those things. Only one of your tables is task-shaped.

**The approval condition has two clauses.** "More than two weeks" and "expensive item." One is derivable from dates on the request; the other is a fact about the equipment. That means your trigger condition needs to reach across a reference — which is exactly what dot-walking in a condition builder is for.

**Site restriction is a condition, not a role.** Do not create a role per site. Create one agent role and one ACL condition comparing the record's site to something on the current user. If your instance has no site field on the user record, use the location field or a group; say in your decision log what you used and why.

**Stamp the collection and return details in a `before` rule, not a client script.** Ask yourself what happens if a record is created by an import. That question is the whole reason server-side logic exists.

**Test the overdue flow by manufacturing an overdue record.** Set a due date three days in the past on a record that is still out, and run the scheduled flow manually. Waiting for tomorrow is not a test strategy.

**Build in a named update set from the very first click.** Retrofitting an update set around work you have already done is possible and unpleasant. Check the indicator before you create the application, not after.

**When you finish, delete a test record and see what happens.** Whatever breaks is something you did not think about, and finding it yourself is worth more than being told.
