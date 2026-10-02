---
lesson_id: agile100-05
course_id: agile100
pathway: quality-assurance-software-engineer
title: Sprint Planning and the Sprint Test Plan
order: 5
kind: lesson
competency_ids:
  - D1-S1-C02
  - D4-S1-C04
  - D5-S1-C03
objectives:
  - Plan a sprint's testing work against scope and delivery dates
---

## What sprint planning decides

Sprint planning is a ceremony, usually held on the first day of the sprint, where the team looks at the top of the refined backlog (Lesson 04's output) and commits to what it will deliver by the sprint's end. Two questions get answered: **what** are we building this sprint (the sprint goal and the stories that support it), and **how** will the team accomplish it (breaking stories into tasks).

For a QA engineer, sprint planning is where "I'll test that" turns into a real plan with hours attached to it. Skipping this — treating testing as something that happens automatically after coding, with no dedicated time — is the single most common way testing gets squeezed out when a sprint runs behind schedule.

## Estimation, briefly

Most Scrum teams size stories in **story points** — a relative measure of effort/complexity/risk, not hours, often using a Fibonacci-like scale (1, 2, 3, 5, 8, 13). A story is "bigger" not because it takes literally more hours but because it's more complex, more uncertain, or touches more of the system. As a QA engineer, you contribute to sizing conversations by naming what makes something harder to *test*, not just harder to build — a story touching three integrated systems is harder to verify even if the code change itself is small.

Whatever unit your team uses, the goal is the same: agree on a shared sense of "how big is this," so the team doesn't overcommit the sprint.

## Building the sprint test plan

A sprint test plan is a short, working document — not a formal audit artifact — that answers five questions for the sprint you just committed to:

1. **Scope** — which stories, and which acceptance criteria within them, need verification this sprint?
2. **Approach** — for each story, how will it be tested? Manual click-through, an existing automated suite, both?
3. **Environment and data** — what test environment, accounts, and data does verification need, and is it ready?
4. **Schedule** — when in the sprint does each story become testable (usually: after a developer marks it ready), and how much time is reserved for it?
5. **Risks** — what could make testing slip — a dependency on another team, an environment that's been flaky, a story likely to need rework?

### Sprint test plan skeleton

```text
SPRINT TEST PLAN — Sprint <N>, <start date> to <end date>

Sprint goal: <one sentence, copied from planning>

Scope
  - STORY-101: Wishlist save/remove          [AC1, AC2, AC3]
  - STORY-104: Out-of-stock storefront hide  [AC1, AC2]
  - STORY-108: Fix search index config bug   [regression only]

Approach
  - STORY-101: manual, new feature, no existing automated coverage
  - STORY-104: manual for AC1/AC2, add to smoke-test checklist after
  - STORY-108: regression pass on search — confirm fix + no new breaks

Environment & data
  - Staging environment, refreshed <date>
  - Test accounts: 1 logged-in customer, 1 guest, 1 warehouse-clerk role
  - Needs: at least 5 SKUs with quantity > 0 to test the out-of-stock flow

Schedule
  - Day 1-2: developers building; QA finalizes test cases from AC (Lesson 04's output)
  - Day 3: STORY-108 testable first (smallest, fastest to build) — test then
  - Day 4: STORY-101, STORY-104 testable — test as each is marked ready
  - Day 5: regression pass, defect verification, review prep (Lesson 08)

Risks
  - STORY-104 depends on a warehouse-service API another team owns; if their
    change slips, our test can't start until it lands
  - Staging environment was flaky twice last sprint; have a rollback plan for
    test data if it happens again
```

Producing a document like this — clear sections, dated, readable by a teammate without you in the room — is another instance of D1-S1-C02 (using office tools to produce a real workplace document), the same competency Lesson 04 introduced for test-case tables. The format matters less than the habit of writing it down before the sprint starts, not reconstructing it from memory on day 4.

## Fitting the plan to the delivery date (D4-S1-C04)

The schedule section above isn't decoration — it's the part that actually answers "will testing be done by the delivery date?" Two practical techniques keep it honest:

- **Test what's testable first, not what's biggest first.** In the worked example, STORY-108 (a small bug fix) is scheduled to test on Day 3, before the two bigger stories are even code-complete, because it'll be ready sooner. Waiting until everything is "done" to start any testing is how testing gets crushed against the deadline.
- **Reserve time for defects, not just for first-pass verification.** If you plan every hour of the sprint for first-time testing and a defect turns up on Day 4, there's no slack to retest the fix. A simple rule of thumb: assume at least one round of retest for any story likely to have a defect, and don't schedule testing time at 100% capacity.

If, partway through the sprint, it becomes clear the plan won't fit the delivery date — say, STORY-104's dependency really does slip — that's information to raise immediately (standup, Lesson 06), not something to quietly absorb by skipping verification. A test plan that silently shrinks under deadline pressure is worse than no plan, because it looks like coverage happened when it didn't.

## Giving planning input, not just receiving assignments (D5-S1-C03)

Sprint planning is a discussion, not a one-way assignment of tickets. As the person who will verify this work, you're expected to speak up when:

- A story's scope looks bigger than its estimate accounts for (e.g., "this touches three pages, not one — the estimate may be light").
- Two stories in the same sprint touch the same area of the code and could interact in ways neither AC anticipated.
- The sprint is already full and a "quick" story is being added on top — say so before committing, not after the sprint slips.

This is the same "input on requirements, designs, schedules, or potential problems" competency from Lesson 04's refinement work, applied one ceremony later, to the schedule itself rather than to individual acceptance criteria.

## Capacity: how much testing actually fits

A sprint test plan is only realistic if it's built against your actual available hours, not an idealized full week. A few things eat into capacity that are easy to forget when a plan is drafted quickly:

- **Standups and ceremonies themselves** take time out of every day — five 15-minute standups plus planning and review/retro isn't huge, but it's not zero either.
- **Waiting time.** If a story isn't code-complete until Day 3, the hours between Day 1 and Day 3 aren't testing hours for that story, even though they're inside the sprint window. A test plan that counts them as available capacity will look fine on paper and fail in practice.
- **Interruptions.** Answering a developer's question about a defect, pairing to reproduce something tricky, or re-testing a fix that came back faster than expected all take real time that a plan built purely from "5 days × 8 hours" won't account for.

A more honest capacity estimate discounts the nominal week — a common starting rule of thumb is to plan against roughly 60-70% of nominal hours as truly available testing time, and adjust as you learn your team's actual rhythm sprint over sprint. Getting this wrong in the optimistic direction is exactly how a test plan quietly turns into "test whatever we have time for at the end," which Lesson 08 will show you is a bad position to present in a sprint review.

## Practice

Using the sprint test plan skeleton above as your template, write a sprint test plan for a hypothetical one-week sprint with these three committed stories:

- STORY-201: "Add password-reset email flow" (new feature, no existing test coverage)
- STORY-205: "Fix pagination bug on order-history page" (bug fix, small)
- STORY-209: "Redesign checkout button styling" (visual-only change, low risk)

Fill in all five sections (Scope, Approach, Environment & data, Schedule, Risks), and in your Schedule section, justify in one sentence why you chose the testing order you chose — which story gets tested first, and why.
