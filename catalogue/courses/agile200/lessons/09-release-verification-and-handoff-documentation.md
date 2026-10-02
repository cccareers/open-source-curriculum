---
lesson_id: agile200-09
course_id: agile200
pathway: quality-assurance-software-engineer
title: Release Verification and Handoff Documentation
order: 9
kind: lesson
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
  - D4-S1-C03
objectives:
  - Verify a release and hand it over with accurate documentation
---

## What "ready to release" actually means

By this point in your capstone you have a test environment, a test strategy, an automated suite, and a defect database with a track record. Release verification is where all four come together into a single, defensible answer to the question "can we ship this?" — not a feeling, but a checklist you can point to. This lesson also covers the handoff: the documentation that lets someone who was not on your team pick up what you built.

## Following source-control practice through to release

Whatever version-control workflow your team has been using since the earlier courses (feature branches, pull requests, code review before merge) applies with extra weight at release time, because a mistake here ships to whoever's using the product. Before verifying a release:

- Confirm the release is built from the intended branch (typically your main/trunk branch, not a stray feature branch).
- Confirm every merge into it went through your team's review process — no last-minute direct pushes that skipped review to "just get it in."
- **Tag the release** in your version control system with a clear, consistent identifier (e.g., `v1.0.0` or a date-based tag) so this exact set of code is retrievable later, unambiguously, if you need to compare against it or roll back to it.
- Confirm the commit history is clean enough that someone else could read it and understand what shipped in this release versus what's still in progress.

## The release checklist

Use this as your release-level definition of done, building directly on the story-level DoD from Lesson 02:

```text
Release Checklist
- [ ] All in-scope charter items reached story-level Done
- [ ] Full regression suite passes (Lesson 05/06 test strategy and suite)
- [ ] Smoke test passes against the release build specifically,
      not just the dev environment
- [ ] No open Blocker or Critical defects (Lesson 07 defect database)
- [ ] Release branch built from reviewed, merged code only
- [ ] Release tagged in version control
- [ ] Documentation reviewed and current (see below)
- [ ] Rollback plan identified: what to do if the release must be reverted
```

Run the full regression suite one more time against the actual release build — not the environment you've been developing against day to day. A release that only ever ran the fast subset of tests can look green right up until the one thing you skipped turns out to matter.

## Reviewing the documentation

D4-S1-C02 asks you to review documentation for technical accuracy, compliance, and completeness — catching risk before it ships, not after a confused user files a defect about the docs themselves. At minimum, review:

- **README / setup instructions** — do the steps still match how the project actually runs, after three weeks of changes? Test them literally, the same way you tested your environment rebuild in Lesson 04.
- **API or feature documentation**, if you have any — does it describe what the software currently does, not what it did in week one?
- **Known issues / limitations** — an honest, current list, not a stale one.

Use a short review pass with specific checks rather than a general read-through:

```text
Documentation Review
- [ ] Setup steps tested literally, from a clean checkout
- [ ] Every documented feature matches current behavior
- [ ] No reference to removed or renamed features
- [ ] Known limitations section is current
- [ ] No sensitive values (real credentials, internal URLs) left in examples
```

Flag anything that fails as its own item — a documentation gap discovered at handoff is exactly the kind of risk this competency exists to catch before it reaches someone relying on the docs to get started.

## Handoff documentation

The handoff package is what lets someone who was not on your team — a future maintainer, an instructor grading the capstone, a new team member — understand and run what you built without asking you questions. Assemble:

- **What it is and what it does** — a short, plain-language summary, not marketing copy.
- **How to run it** — the tested setup steps from your documentation review.
- **How to test it** — a pointer to your test strategy and how to run the suite.
- **What's known to be broken or out of scope** — pulled from your charter's out-of-scope list and your defect database's still-open, lower-severity items.
- **How to report a problem** — where the defect database lives and how to file into it.

## Making the call

Verifying a release is ultimately a judgment: does the evidence in the checklist support shipping, or not? Write your conclusion down explicitly, with the evidence behind it — "release verified: regression suite passing (48/48), zero open Blocker/Critical defects, documentation reviewed and current" — rather than letting the decision live only in your head. If the checklist reveals a gap, the honest move is to say so and either fix it or explicitly accept and document the risk, not to quietly release anyway.

## Practice

Run your capstone's release checklist against your current build: execute the full regression suite against the actual release branch, confirm the defect database has no open Blocker or Critical items (triage and resolve any that do), and tag the release in version control. Complete a documentation review pass using the checklist above, testing your setup instructions literally from a clean checkout. Assemble the handoff package listed above as a single document, and write a one-paragraph release verification conclusion stating your go/no-go judgment and the specific evidence behind it.
