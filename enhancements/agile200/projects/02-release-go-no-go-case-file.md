---
course_id: agile200
project_id: agile200-x02
title: "Release Go/No-Go Case File: Accounts v1.0"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - agile200-07
  - agile200-09
  - agile200-10
objectives:
  - Verify a release and hand it over with accurate documentation
  - Keep a defect database a team can actually use
  - Present finished work and run a retrospective
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
  - D4-S1-C03
  - D2-S1-C01
  - D2-S1-C04
  - D1-S1-C03
---

## Scenario

It is Thursday of week 3 on the accounts capstone (signup, login, password reset), the same team as project agile200-x01. The demo is Friday at 10:00. The product owner messages you: "Everything's green, right? Let's tag v1.0 tonight." You open the evidence. It is mostly green, but not entirely. Your job is to make an honest go/no-go call with evidence, fix what can be fixed in the documentation, and present the decision in five minutes.

## What you will build / produce

1. A completed **release checklist** (lesson 09 template) with every line marked Pass, Fail, or Accepted-risk, and the evidence named for each.
2. A **triage update** on the three open defects: confirm or correct severity and priority, with one-sentence justifications.
3. A **corrected README** (setup section) and a **known-issues** list.
4. A one-paragraph **release verification conclusion** (go, no-go, or go-with-conditions), plus, if you accept any risk, a **risk-acceptance note** the product owner must agree to.
5. A **five-minute spoken briefing** to the product owner (role-played), following the lesson 10 delivery habits.

## Before you start (prerequisites, starter files or data)

Case file (treat as the real state of the project):

**Regression run on the release build** (`main` at commit `a41c9e2`, built in release mode):

```text
✔ signup creates an account (3 ms)
✔ signup rejects an invalid email (1 ms)
✔ DEF-01 regression: refuses a duplicate email address (1 ms)
✔ login succeeds with valid credentials (2 ms)
✔ DEF-02 regression: rejects a blank password (1 ms)
✔ password reset sends a token (4 ms)
✖ password reset token expires after 30 minutes (2 ms)
  AssertionError: expected link to be rejected at 31 minutes, was accepted
ℹ tests 7  ℹ pass 6  ℹ fail 1
```

**Smoke test** passed on the dev environment on Tuesday; it has not been run against the release build.

**Open defects:**

| ID | Title | Severity (as filed) | Priority | Status |
|---|---|---|---|---|
| DEF-07 | Password reset link still works after 30 minutes | Minor | Low | New |
| DEF-08 | Login button text is clipped at 200% zoom | Major | Medium | Confirmed |
| DEF-09 | README setup step says `npm run seed`, script is now `npm run db:seed` | Trivial | Low | New |

**Git log (last 4 on main):**

```text
a41c9e2 Merge pull request #31 from sam/reset-expiry-config
9b2d0f1 hotfix: bump reset token TTL env default   (pushed directly to main, no PR)
77c3e10 Merge pull request #30 from priya/zoom-layout
5e8a2b4 Merge pull request #29 from you/def-02-regression
```

**`.env.example`** contains `RESET_TOKEN_TTL_MINUTES=30`; `src/config.js` reads `process.env.RESET_TOKEN_TTL ?? 1440`.

## Milestones

1. Fill in the release checklist line by line from the evidence. Do not infer a Pass that the evidence doesn't show.
2. Diagnose the failing reset test from the case file alone. Hint: compare the env variable name in `.env.example` with the one in `config.js`, and the default value. Write the diagnosis in the lesson 08 diagnosis/recommendation format.
3. Re-triage DEF-07, DEF-08 and DEF-09. Is "Minor" honest for a reset link that stays valid for 24 hours? Link DEF-07 to the failing test and to commit `9b2d0f1`.
4. Note the source-control finding: a direct push to `main` skipped review (lesson 09, "Following source-control practice through to release").
5. Fix the README and write the known-issues list.
6. Write the conclusion and, if needed, the risk-acceptance note. Rehearse, then deliver the five-minute briefing to a partner playing the product owner, who pushes back at least twice ("It's just one test", "The demo doesn't use password reset").

## Acceptance criteria

- [ ] Every checklist line has a status and names its evidence; "smoke test against the release build" is not marked Pass.
- [ ] The diagnosis identifies the variable-name mismatch (`RESET_TOKEN_TTL_MINUTES` vs `RESET_TOKEN_TTL`) and the 1440-minute fallback as the likely cause, and recommends a fix plus a test that guards the config.
- [ ] DEF-07 is re-rated with a security-aware justification (a reset link valid for 24 hours is an account-takeover window).
- [ ] The unreviewed direct push is recorded as a release-process finding, with a recommendation.
- [ ] The README setup step is corrected and verified literally (written as the exact command sequence).
- [ ] The conclusion states go, no-go, or go-with-conditions; cites numbers (6/7 passing, open defects by severity); and, if conditional, names who accepted which risk.
- [ ] The briefing leads with the decision, stays under five minutes, and answers both pushbacks with evidence, not opinion.

## Automated checks (coding courses) / Evidence checklist (non-coding)

- [ ] Completed release checklist (document or spreadsheet)
- [ ] Updated defect records for DEF-07, DEF-08 and DEF-09, each with a justification and links
- [ ] Diagnosis/recommendation note for the reset failure
- [ ] Corrected README excerpt and known-issues list
- [ ] Release verification conclusion (and risk-acceptance note if used)
- [ ] Partner's written feedback on the briefing (two specific points)

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Evidence discipline | Marks lines Pass from memory or assumption | Every status is tied to named evidence; gaps are stated | Also lists the evidence still needed and how long it takes to collect |
| Diagnosis | Says "test is flaky" or "reset is broken" | Finds the env-name mismatch and fallback; recommends a fix and a test | Explains why the dev environment passed (a local `.env` with the right name) |
| Triage honesty | Leaves severities as filed | Re-rates DEF-07 with a security justification; severity is kept separate from priority | Proposes a time-boxed fix that changes the call to go |
| Communication | Opens with detail; caves to pushback | Leads with the decision; answers pushback with evidence | Offers the product owner a clear choice with the consequences of each |

## Stretch goals

- Write the 15-minute fix plan (rename the variable, add a config test, re-run regression and smoke on a new tag) and estimate whether it fits before 10:00.
- Draft the "known issues" slide for Friday's demo.

## Reflection prompts

- Which piece of evidence were you most tempted to treat as a pass without checking? Why?
- How did you separate "the demo doesn't use it" (priority) from "how bad is it if it ships" (severity)?

## Instructor notes (common pitfalls, how to adapt for time)

- Expected strong answer: no-go as-is; go-with-conditions only if DEF-07 is fixed and verified (it is quick) and the smoke test is run on the release build. DEF-08 can ship as a documented known issue, depending on the team's accessibility bar. Accept a well-argued alternative.
- Pitfalls: treating the failing test as flaky and re-running it; rating DEF-07 Minor because "it's just a timeout"; skipping the direct push to `main` because "the PR after it merged fine".
- Short on time: drop the briefing and grade the written conclusion.
- Team adaptation: one person plays the product owner, one the developer who pushed `9b2d0f1`, and one leads the call.
