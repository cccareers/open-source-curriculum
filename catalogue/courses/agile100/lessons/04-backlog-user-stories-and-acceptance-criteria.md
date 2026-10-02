---
lesson_id: agile100-04
course_id: agile100
pathway: quality-assurance-software-engineer
title: Backlog, User Stories, and Acceptance Criteria
order: 4
kind: lesson
competency_ids:
  - D1-S1-C02
  - D5-S1-C03
objectives:
  - Turn a user story's acceptance criteria into testable checks
---

## The backlog: where work starts

The **product backlog** is the full, ordered list of everything the team might build — features, fixes, technical debt — ranked roughly by value. Nothing on it is committed to a sprint yet; it's a menu, not a plan. **Backlog refinement** ("grooming") is the recurring meeting where the team looks at items near the top of that list, before sprint planning, and makes sure they're ready to be picked up: clear, sized, and — critically for a QA engineer — testable.

This is the ceremony Lesson 02 flagged as your earliest touchpoint. The earlier an untestable requirement gets caught, the cheaper it is to fix. Fixing a vague acceptance criterion in refinement costs a sentence. Fixing it after a developer has built the wrong thing costs a rebuild.

## User stories: the unit of work

A user story is a short description of a feature from the perspective of who wants it, in a standard template:

```text
As a <role>
I want <capability>
So that <benefit>
```

Example:

```text
As a returning customer
I want to save items to a wishlist
So that I can find them again without re-searching
```

The template forces three things into the open: *who* benefits, *what* they can now do, and *why it matters*. A story missing the "so that" clause is a warning sign — if nobody can say why it matters, question whether it belongs on the backlog at all.

## Acceptance criteria: what "done" means

A story alone doesn't tell you when it's finished. **Acceptance criteria (AC)** are the specific, checkable conditions that must be true for the story to be considered complete. The most common format is **Given/When/Then**:

```text
Given <a starting state>
When <an action happens>
Then <an expected, observable outcome>
```

For the wishlist story above, acceptance criteria might read:

```text
AC1:
  Given I am logged in and viewing a product page
  When I click "Add to Wishlist"
  Then the item appears in my wishlist within 2 seconds
  And the button changes to "Saved"

AC2:
  Given an item is already in my wishlist
  When I click "Add to Wishlist" again
  Then no duplicate entry is created

AC3:
  Given I am not logged in
  When I click "Add to Wishlist"
  Then I am redirected to the login page
  And returning after login adds the item automatically
```

Notice each one is observable and specific — "appears within 2 seconds," "no duplicate entry," "redirected to login." Compare that to a criterion like "the wishlist should work well," which gives you nothing to check against. Part of your job in refinement (D5-S1-C03 — participating in design reviews, giving input on requirements) is catching criteria written like that and pushing the team to rewrite them before the story enters a sprint.

### A quick testability check

Before a story leaves refinement, run each of its acceptance criteria through three questions:

1. **Observable** — can I watch for this outcome directly (on screen, in a response, in a log), or does it require guessing at intent?
2. **Specific** — does it name a concrete value, state, or behavior, not an adjective like "good" or "fast"?
3. **Bounded** — does it cover one scenario, not "and also everything else should work"?

A criterion that fails any of these three needs to go back to the Product Owner for a rewrite, in refinement — not get silently interpreted by whoever builds it.

## From acceptance criteria to testable checks

Turning AC into checks is mechanical once the AC is well-written: each Given/When/Then becomes one test case, and each test case gets a clear pass/fail outcome. A simple template:

| Test ID | Related AC | Steps | Expected result | Actual result | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | Log in, view product, click "Add to Wishlist" | Item in wishlist within 2s; button reads "Saved" | | |
| TC-02 | AC2 | With item already saved, click "Add to Wishlist" again | No duplicate entry created | | |
| TC-03 | AC3 | While logged out, click "Add to Wishlist" | Redirected to login; item auto-added after login | | |

Notice this table has the same shape whether you build it in a spreadsheet, a shared doc, or a lightweight test-management tool — the point isn't the software, it's the discipline of one row per checkable condition, traceable back to the AC it came from. Producing a document like this — clean, organized, ready for a teammate to read — is exactly the "use common office tools to produce documents and spreadsheets" competency (D1-S1-C02) in practice: the deliverable of your refinement work isn't a feeling that you understood the story, it's an artifact someone else can use.

## Edge cases the AC doesn't say out loud

Well-written acceptance criteria describe the happy path and the most important alternate paths, but they rarely enumerate every edge case. Part of turning AC into testable checks is adding the checks a careful reader would ask for, even when nobody wrote them down: What happens with an empty required field? What happens right at a boundary (exactly 2.0 seconds, the 2-second limit)? What happens if the same action fires twice quickly (double-click)? What happens with no network connection?

Add these as your own test cases, but mark them distinctly (e.g. a note "not in AC, added by QA") so the Product Owner can confirm they're worth covering rather than have them silently expand the story's scope.

## Common testability failures, and how to fix them

Seeing a handful of bad-to-good rewrites side by side makes the three-question check easier to apply on real stories:

| Weak AC | Why it fails | Rewritten |
| --- | --- | --- |
| "The page should load quickly." | Not specific — "quickly" isn't a number. | "The page's main content is visible within 2 seconds on a standard broadband connection." |
| "Errors are handled gracefully." | Not observable — "gracefully" isn't something you can watch for. | "An invalid email submission shows the message 'Enter a valid email address' beneath the field, and the form does not submit." |
| "The export feature works for all report types." | Not bounded — one criterion trying to cover every case. | Split into one AC per report type, each with its own expected output. |

Pattern-matching against this table during refinement is faster than re-deriving the three questions from scratch every time — most untestable criteria fail for one of these three reasons, and most fixes follow the same shape: replace the vague adjective with a number or a named, observable state.

## Practice

Take this story and its acceptance criteria:

```text
As a warehouse clerk
I want to mark an inventory item as "out of stock"
So that the storefront stops showing it as available

AC1:
  Given an item with quantity > 0
  When I set its quantity to 0
  Then the storefront listing shows "Out of Stock" within 1 minute

AC2:
  Given an item marked "Out of Stock"
  When a customer tries to add it to their cart
  Then the "Add to Cart" button is disabled
```

1. Run each AC through the three-question testability check above. Are both acceptance criteria observable, specific, and bounded? If not, rewrite the weak one.
2. Build a test-case table (using the template above) with at least three rows: one per AC, plus at least one edge case you identified yourself that the AC doesn't cover.
3. For your added edge case, write one sentence explaining what could go wrong in production if nobody tested it.
