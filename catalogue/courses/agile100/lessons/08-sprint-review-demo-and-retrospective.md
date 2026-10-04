---
lesson_id: agile100-08
course_id: agile100
pathway: quality-assurance-software-engineer
title: Sprint Review, Demo, and Retrospective
order: 8
kind: lesson
competency_ids:
  - D1-S1-C03
  - D1-S1-C04
  - D2-S1-C02
objectives:
  - Demonstrate completed work and give useful retrospective input
---

## Two ceremonies, two very different audiences

The sprint's last day usually holds two distinct meetings back to back:

- **Sprint review (demo)** — the team shows stakeholders (Product Owner, sometimes wider — other teams, leadership) what was built this sprint. Outward-facing, about the product.
- **Retrospective** — the Scrum team alone (developers, QA, Product Owner, and Scrum Master, without outside stakeholders) reflects on how the sprint went as a *process* and agrees on what to change. Inward-facing, about the team.

They ask different questions — "what did we ship, and is it really done?" versus "how did we work, and how do we work better?" — and this lesson covers your distinct job in each.

## The sprint review: reporting what's verified, not just what's built

The temptation in a demo is to show the feature working and let that stand in for "it's done." Your job as the QA engineer is to make sure the review accurately separates three things, every time:

1. **What was built** — the feature exists and runs.
2. **What was verified** — which acceptance criteria you actually tested and confirmed pass.
3. **What was not verified** — anything out of scope for this sprint's testing, anything still open as a known defect, anything you didn't have time to check.

A demo that only shows (1) and lets the audience assume (2) is a disservice to everyone who will rely on that feature being correct. Saying "STORY-101 is built and demoed here; AC1 and AC2 are verified and passing; AC3 — the not-logged-in redirect — is still open as BUG-155, target fix next sprint" takes fifteen seconds and prevents the team from shipping on a false assumption of completeness.

### A short, structured verification report

Before the review, prepare a short summary — a slide, a shared doc, or just speaking notes — organized by story:

```text
STORY-101 (Wishlist save/remove)
  Verified: AC1, AC2 — passing
  Not verified: AC3 (logged-out redirect) — BUG-155 open, P1

STORY-104 (Out-of-stock storefront hide)
  Verified: AC1, AC2 — passing
  Not verified: none — full coverage this sprint

STORY-108 (Search index config fix)
  Verified: regression pass on search — no new issues found
```

This is the sprint test plan from Lesson 05 closing its loop: you scoped the testing work at the start of the sprint, and this report is proof of what actually happened against that scope.

## Delivering it as a clear oral presentation (D1-S1-C03)

The review is a spoken presentation, not a document someone reads silently — which means structure and pacing matter as much as content:

- **Lead with the summary, not the detail.** "Two of three committed stories are fully verified; one has an open defect blocking full sign-off" orients the room in one sentence before you walk through specifics.
- **Use plain, concrete language.** Say "the redirect to login doesn't happen" rather than "there's an edge case around unauthenticated interaction handling."
- **Show, don't just describe, when you can.** A ten-second screen recording or live click-through of the actual failure is more convincing and faster to understand than a verbal description of a bug.
- **Anticipate the obvious question and answer it before it's asked.** If a defect is open, say what the plan is (fix next sprint, already assigned, severity) rather than leaving "so... now what?" hanging.
- **Keep to time.** A review with five stories and unlimited per-story detail runs long and loses the room; know which detail is worth the room's time and which belongs in the tracker for anyone who wants to read further.

## Giving usability and functionality feedback (D2-S1-C02)

Beyond pass/fail against acceptance criteria, the review is also a natural moment to raise usability or functionality observations that weren't strictly "bugs" — the feature works as specified, but something about it could be better. This is feedback *to developers*, not a defect report, and it reads differently:

```text
Not a bug, but worth noting: the "Add to Wishlist" button and the
"Add to Cart" button use nearly identical styling on the product page.
In testing, I mis-clicked between them twice myself. Might be worth a
visual distinction before this ships more broadly.
```

Good feedback here is specific, framed around observed behavior (not personal preference), and actionable — it tells the developer exactly what you saw and leaves the decision about whether/how to act on it with them. "The wishlist feature feels clunky" gives a developer nothing to work with; the example above gives them something concrete to evaluate.

## The retrospective: process input, not product input

Where the review is about the product, the retrospective is about how the team worked to build it. A common, simple format:

```text
What went well?
What didn't go well?
What will we try differently next sprint?
```

As QA, you have a distinct vantage point on process friction that developers may not see directly:

- Did acceptance criteria arrive testable, or did refinement let vague ones through? (Ties back to Lesson 04.)
- Did the sprint test plan's schedule hold, or did testing get squeezed at the end because stories landed late? (Ties back to Lesson 05.)
- Did defects get triaged promptly, or did a critical bug sit unowned for days? (Ties back to Lesson 07.)
- Was the environment or test data ready when needed, or a recurring blocker?

Retrospective input works best framed the same way as defect and escalation reports throughout this course — specific and evidence-based, not a general complaint:

```text
Went well: Standup escalations worked — BUG-150 (checkout 500) got
picked up within the hour because it was flagged clearly first thing.

Didn't go well: Three of five stories didn't become testable until Day
4, which meant most verification happened in one day instead of being
spread across the sprint. The test plan assumed a more even schedule.

Try next time: Ask in planning for a rough "ready for QA" date per
story, not just a sprint-end date, so the test plan schedule reflects
reality instead of an assumption.
```

This is the same collaborative habit from Lesson 06 (D1-S1-C04) — working with the team, not around it — applied to improving the process itself rather than a single day's blocker.

## Practice

Sprint recap: your team committed to three stories this sprint. STORY-101 (wishlist) is fully verified and working. STORY-104 (out-of-stock hide) has one open defect: the "Out of Stock" badge sometimes takes up to 5 minutes to appear instead of the required 1 minute, tracked as BUG-160, P2. STORY-108 (search fix) is verified with no new issues. Testing this sprint ran late because two stories weren't code-complete until Day 4.

1. Write your sprint review verification summary (the "STORY-101 / STORY-104 / STORY-108" structured format above) for this sprint.
2. Write two to three sentences of spoken opening remarks for the review — the "lead with the summary" line plus enough context to orient the room in under 20 seconds when read aloud.
3. Write one retrospective note (What didn't go well) about the late code-complete dates, following the "specific and evidence-based" example format, and pair it with one concrete "try next time" suggestion.

## Check your understanding

1. A teammate opens the review with "Everything's done!" but STORY-101's AC3 is still open as BUG-155. What should the verification report say instead?
2. Is "The wishlist page feels clunky" useful review feedback? Rewrite it.
3. Which belongs in the review and which in the retrospective: (a) "BUG-160 means the out-of-stock badge can lag up to 5 minutes"; (b) "Two stories weren't testable until Day 4."

*Answers:* (1) Separate built, verified, and not verified: "STORY-101 is built; AC1 and AC2 are verified; AC3 is not verified, open as BUG-155, P1, target fix next sprint." (2) Not as written. Make it specific and observed, e.g. "In testing I mis-clicked between 'Add to Wishlist' and 'Add to Cart' twice because they look nearly identical; worth a visual distinction." (3) (a) is product status, so it goes in the review; (b) is process friction, so it goes in the retrospective.
