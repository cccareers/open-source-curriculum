---
lesson_id: agile200-07
course_id: agile200
pathway: quality-assurance-software-engineer
title: The Defect Database, Triage, and Regression Suites
order: 7
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C04
  - D3-S1-C05
objectives:
  - Keep a defect database a team can actually use
---

## Why a defect needs a record, not just a fix

When you find a bug in the middle of building something, the fastest thing to do is fix it and move on. Do that every time and three weeks from now nobody — including you — can answer basic questions a QA process needs answered: how many defects has this project had, what kind, how severe, how long did they take to resolve, and did any of them come back. A defect database is what turns "we fixed some bugs" into evidence. This lesson covers filing a defect properly, triaging it, tracking it to resolution, and folding it into your regression suite so it never quietly regresses.

## What a defect record needs

Use your cohort's bug-tracking system (an issue tracker is the general shape — the same tool you've been using for your sprint board in Lesson 03 likely supports this directly). Every defect record needs these fields, at minimum:

```text
Defect Record
- ID:              auto-assigned by the tracker
- Title:           short, specific, states the wrong behavior
- Steps to reproduce: numbered, exact, starting from a known state
- Expected result: what should have happened
- Actual result:   what happened instead
- Environment:     where it was found (which test environment, browser, data state)
- Severity:        Blocker / Critical / Major / Minor / Trivial
- Priority:        how soon it should be fixed, relative to other work
- Status:          New -> Confirmed -> In Progress -> Fixed -> Verified -> Closed
- Linked ticket:    the sprint-board ticket doing the fix, once triaged
```

The single most common defect-filing mistake is a vague title and vague steps: "login is broken" tells the next person nothing. "Login form accepts a blank password and logs the user in" is reproducible, specific, and immediately actionable. Write every defect as if the person fixing it has never seen the bug and cannot ask you a follow-up question.

```text
Bad:  Title: "Signup broken"
      Steps: "Tried to sign up, didn't work"

Good: Title: "Signup form allows duplicate email addresses"
      Steps:
        1. Go to /signup
        2. Enter an email already registered to an existing account
        3. Fill in the remaining fields validly and submit
      Expected: Form shows "Email already registered" and does not create an account
      Actual:   A second account is created with the same email
      Environment: Local test environment, seed data user "test.user@example.com"
```

## Severity vs. priority

These are two different judgments and conflating them is a common triage mistake:

- **Severity** is about impact if the defect is never fixed — does it crash the app, corrupt data, block the most-important-path from Lesson 02? That is fixed by the facts of the bug, not by opinion.
- **Priority** is about *when* it gets worked, relative to everything else on the board — which can differ from severity. A cosmetic typo on your homepage (low severity) might get high priority right before a demo; a rare crash in a feature nobody uses yet (high severity) might sit at lower priority for now if nothing depends on that feature this sprint.

## Triage: turning a report into a plan

Triage is the short, regular process of looking at every "New" defect and deciding severity, priority, and where it goes next. Run it at least twice a week — do not let defects pile up unreviewed, and do not triage alone if you have teammates; a second perspective catches severity misjudgments. A triage pass asks, for each new defect:

1. Is it reproducible? If not, mark it and ask the reporter for more detail before doing anything else.
2. What's the severity, honestly — not inflated because you're annoyed at it, not deflated because you don't want to deal with it?
3. Does it belong in this sprint, or a later one? If later, it goes back to the sprint board's Backlog with the defect linked.
4. Is it actually a duplicate of something already filed? Search before filing yourself, and check on your own triage pass too.

## Tracking to resolution

A defect isn't done when someone says "I fixed it" — it's done when it's **verified**: someone other than the fixer confirms, against the original steps to reproduce, that the actual result now matches the expected result. This is the same "monitor bug-resolution efforts and track outcomes" discipline from Lesson 03's board, applied specifically to defects: your weekly outcomes log should show defects opened and defects resolved as separate numbers, and "resolved" should mean verified-closed, not just marked-fixed by whoever wrote the fix.

## Maintaining the database of known defects

Beyond the individual records, the defect database as a whole is a reusable asset — a **database of known test defects** that helps the team avoid repeat problems and speeds up future testing. Two habits keep it useful rather than becoming a graveyard of stale tickets:

- **Tag defects by area** (e.g., "auth," "checkout," "profile") so a pattern — one area producing far more defects than others — becomes visible instead of buried across dozens of individual tickets. An area with a disproportionate defect count is a signal to revisit its test coverage, not just its code.
- **Close the loop with the regression suite.** Every defect above "Minor" severity that gets fixed should get a corresponding automated test (built using Lesson 06's skills) that would have caught it, added to your regression suite before the defect is marked Closed. This is what prevents the same bug from quietly coming back two weeks later — a "known defect" that regresses without anyone noticing is the single worst outcome a defect database is supposed to prevent.

## Practice

File at least five defects in your bug-tracking system using the record template above, each with specific, reproducible steps — at least two should come from running your test suite or manually exercising the app, not from invented examples. Triage all five: assign severity and priority to each, and decide (with a teammate if you have one) which belong in the current sprint. Pick one Major-or-higher defect, fix it, write an automated regression test that would have caught it, and move the defect through Fixed to Verified once someone other than you confirms the fix. Update your weekly outcomes log from Lesson 03 with this sprint's opened/resolved defect counts.
