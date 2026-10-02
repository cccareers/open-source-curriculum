---
lesson_id: sn330-10
course_id: sn330
pathway: servicenow-implementation-specialist
title: 'Project: Implement an HR Onboarding Service'
order: 10
kind: project
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
  - D4-S1-C03
objectives: []
---

## Goal

Implement a working onboarding capability in a single development instance, end to end: a new hire's arrival creates a coordinated set of activities across HR, IT, and facilities; the hiring manager and the new hire can both see and act on what is theirs; and the new hire's first self-service experience in the Employee Center is complete on day one.

You are building for a fictional employer, **Meridian Logistics**, with roughly 4,000 employees across the United States, the United Kingdom, and India. Meridian hires about forty people a month, currently coordinated by one HR operations coordinator working from a spreadsheet and an email template. Their stated problem is not that onboarding fails — it is that it fails *quietly*: laptops arrive late, accounts are provisioned on day three, and nobody knows a step was missed until the new hire says so.

Your deliverable is a configured implementation plus a short written design document. This is an assembly project: it uses the case, knowledge, portal, and lifecycle event work from lessons 3 through 6, and it must respect the access model from lesson 8.

## Requirements

### 1. HR service and case foundation

- An **HR service** for onboarding, owned by an appropriate COE, with a default template that stamps service, category, assignment group, and a short description naming the new hire.
- Onboarding cases must route to the correct regional HR team based on the new hire's work country, with a defined fallback for a new hire whose country is missing or unrecognized.
- An SLA appropriate to the onboarding case, pausing when the case is awaiting information.
- At least one **conditional task** on the case — a task that exists for some new hires and not others — with the condition driven by profile or request data, not by an agent's judgment.

### 2. Lifecycle event

- An **onboarding lifecycle event** definition with a minimum of four activity sets, of which at least two are conditional.
- The always-on sets must cover, at minimum: pre-start provisioning, day one, and first thirty days.
- The conditional sets must include at least one triggered by an attribute of the new hire (relocation, work authorization sponsorship, or people-manager status).
- Every activity must have an explicit owner and a due date **anchored to the start date**, not a fixed calendar date.
- The event must use at least three different activity types, and at least one activity must be a **catalog request into a non-HR department's existing queue** rather than an HR task. IT equipment provisioning is the natural choice.
- At least one activity must be an employee-facing to-do, and at least one must be a policy acknowledgement that produces an auditable record.

### 3. Automation

- Flow Designer automation that reacts to the onboarding case or event, including at least one **approval** with a dynamically determined approver and a configured timeout path.
- Notifications covering, at minimum: the hiring manager when the event is created, the new hire at the point they gain access, and the HR coordinator on any escalation.
- One **before business rule** performing field derivation only. It must not create records or send email.

### 4. Employee Center

- Onboarding content published under an appropriate topic in the Employee Center taxonomy, discoverable both by browsing and by search.
- A **"New to Meridian"** experience: at minimum a topic containing the policy articles the new hire must read, the requests they are most likely to need in week one, and a link to their own onboarding activities.
- Targeting applied so that country-specific content reaches only the relevant new hires, **with an untargeted fallback** for anyone whose data does not match.
- The new hire must be able to see the status of their onboarding and complete their own to-dos from the portal.

### 5. Knowledge

- At least four knowledge articles supporting onboarding, of which at least two are country-restricted and one is an unrestricted overview.
- At least one manager-facing article in a manager-restricted knowledge base.
- Knowledge deflection configured so that a relevant article surfaces during at least one onboarding-adjacent request.

### 6. Access and data

- The hiring manager can see the onboarding case and activities for **their own** new hire, and cannot see those for anyone else's.
- The facilities and IT fulfillers can complete their assigned work **without read access to the HR case**.
- The new hire can see their own onboarding and nothing else.
- Imported worker attributes used by your criteria and routing (work country, employment type, manager) are treated as HRIS-owned and are read-only on the form.

## Constraints

- **Configuration over code.** Any script you write must be justified in the design document by naming the configuration approach you rejected and why. Expect to write very little.
- **No new base tables.** Use the HRSD tables. If you believe you need a new table, argue it in writing first.
- **No hard-coded people.** No named user in an approval, an assignment, or a criterion. Everything resolves from data.
- **Release-neutral.** Do not build against a named platform release or depend on a feature by version.
- **Out of scope, and to be left alone:** employee document management, HR agent workspace customization, and payroll processing. Where onboarding touches payroll, model the *handoff* only, as described in lesson 9.
- **No production data.** Test users are synthetic.
- **Every access claim must be demonstrated by impersonation**, not asserted. Administrator verification does not count.

## Definition of done

You are finished when all of the following are true and evidenced.

1. **The happy path runs.** Creating an onboarding event for a US full-time individual contributor with a start date four weeks out generates exactly the expected activity sets, with correct owners and correct relative due dates, and no activity is created already overdue.

2. **Conditionality is proven.** Four test hires — a standard US hire, a relocating hire, a hire requiring work-authorization sponsorship, and a people-manager hire — each generate the correct sets and only the correct sets. You have a table showing predicted versus actual for all four.

3. **Cross-department coordination works without data leakage.** An IT fulfiller and a facilities fulfiller each complete their assigned work while being demonstrably unable to open the HR case, verified by impersonation through list, search, and direct URL.

4. **The approval behaves on all four paths.** Approved, rejected, timed out then escalated, and the case where the approver is unavailable or is the subject. Each produces a defensible case state and the right notification.

5. **The date change is handled.** Moving a start date one week later and one week earlier on an open event produces documented, intentional behavior for open activities, completed activities, and overdue activities.

6. **The compressed timeline is handled.** A hire starting in three days does not silently produce activities that were due last week. Whatever your handling is — immediate due dates with escalation, or a warning to the coordinator — it is deliberate and observable.

7. **The new hire's first day works.** Impersonating the new hire in the Employee Center, you can see your onboarding status, complete a to-do, acknowledge a policy, read the country-correct articles, and submit one request — without seeing anyone else's data.

8. **The manager's view works and is bounded.** Impersonating the hiring manager, you can see your new hire's onboarding and act on your activities, and you cannot see another manager's new hire.

9. **The fallback path degrades gracefully.** A test hire with a missing work country still receives a usable onboarding: the unrestricted overview article, the always-on sets, and a data-quality task to someone who can fix it. Nobody sees an empty page.

10. **A failure is visible.** You have deliberately broken one thing — emptied an assignment group, rejected a blocking approval, or removed a manager from a profile — and can show where the failure surfaced and who would have found out.

11. **The design document exists.** Three to six pages covering: the COE and service design; the activity set table with conditions, anchors, owners, and activity types; the access model with the requirement each control satisfies; the automation inventory with the rule-versus-flow justification for each item; and a scope statement naming what you deliberately did not build.

12. **Nothing is hard-coded.** A reviewer can search your build for a named user in a criterion, an approval, or an assignment rule and find none.

## Hints

**Design on paper before you touch the instance.** The activity set table — set, condition, anchor, owner, activity type — is the single most valuable artifact in this project, and building without it produces a lifecycle event you cannot explain to a stakeholder. Reviewers of this project consistently find that the builds with the cleanest configuration are the ones where the table was written first.

**Set up your test population before you build anything.** Six synthetic hires covering the four conditional profiles plus one with deliberately missing data plus one non-standard employment type. Building against a single perfect test user is how implementations acquire the assumptions that break in production.

**Push conditions up to the activity set.** If you find yourself writing the same condition on eight activities, that is a set. This is the single highest-leverage design move in the whole project.

**Let other departments work in their own queues.** The instinct to create an HR task for the equipment order is strong and wrong. A catalog request into IT's existing process means IT works the way they already work and never needs HR access — which simultaneously solves your requirement 6.

**Anchor everything, then move the date to test it.** Relative dates that were never tested against a date change are relative dates that only look correct.

**Build the fallback before the targeting.** It is much easier to add restrictions to content that already has an unrestricted path than to discover, three test users later, that a whole population sees nothing.

**Impersonate constantly, not at the end.** Every access assumption you carry to the end of the build is an assumption you will have to unwind. Check as you go.

**When you reach for a script, stop and name the configuration you are avoiding.** Sometimes the answer is genuinely that no configuration expresses it — value translation with fifteen source codes, for instance, is a mapping table and a two-line lookup. But most of the time the reach for script is a shortcut past a service, a criterion, or an activity set you have not yet designed.

**Keep the scope line visible.** You will be tempted toward document management for the new hire's identity documents and toward a custom agent view for the coordinator. Both are out of scope here. Note them in the design document as recommendations rather than building them; recognizing and stating a scope boundary is part of what is being assessed.
