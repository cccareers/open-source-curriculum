---
lesson_id: ops100-05
course_id: ops100
pathway: quality-assurance-software-engineer
title: Pull Requests, Code Review, and Documentation Review
order: 5
kind: lesson
competency_ids:
  - D1-S1-C04
  - D4-S1-C02
  - D5-S1-C03
objectives:
  - Review a change and its documentation for accuracy and completeness
---

## The pull request as a review surface

A pull request (PR) — sometimes called a merge request — is a request to merge one branch into another, packaged with the full diff, a description, and a place for comments. It exists because merging code straight into `main` with no second set of eyes is how avoidable defects reach production. For a QA engineer, the PR is one of the most important places you work: it's where you read a change *before* it ships, alongside whatever documentation describes it, and where your read of both can stop a problem before it costs anyone else time.

Opening one on a GitHub-style host typically looks like:

```bash
git push origin fix/cart-quantity
```

Then, from the hosting platform's web interface, you open a pull request from your branch into `main`, giving it a title and description. A good PR description states what changed, why, and how a reviewer can verify it — for example, which manual steps or automated tests confirm the fix. A PR with only a title and no description forces every reviewer to reconstruct that context from the diff alone, which is slower and more error-prone for everyone, including you when you return to it in six months.

## Reading a diff like a reviewer, not an author

When you review someone else's PR, you're reading a diff: a display of exactly which lines were added, removed, or changed, usually with removed lines in red and added lines in green.

```diff
- const total = item.price * item.quantity;
+ const total = item.inStock ? item.price * item.quantity : 0;
```

Reading a diff well is different from reading finished code. You are not just asking "does this make sense" — you are asking a sharper set of questions:

- **Does this change do what the PR description claims it does?** A description and a diff that don't match is itself a finding worth raising.
- **What does this change *not* handle?** The diff above zeroes the total for out-of-stock items — does it also need to handle a quantity of zero, or a negative price from a data error? A reviewer's job is partly to notice the case the author didn't.
- **Is there a test covering this change?** If the diff touches logic but no test file changed alongside it, that's worth asking about directly.
- **Would this make sense to someone with no memory of writing it?** Confusing variable names, missing comments on non-obvious logic, or an unexplained magic number are all legitimate review comments, not nitpicks.

This is where D1-S1-C04 and code review meet: reviewing well is a form of effective team communication, not gatekeeping. The goal is a better change landing, not a scorecard on the author.

## Reviewing documentation alongside the code

D4-S1-C02 — reviewing software documentation for technical accuracy, compliance, and completeness — belongs in the same pass as the code review, not a separate one. Most real changes touch documentation somewhere: a README describing setup, an API reference describing an endpoint's parameters, inline comments, or a changelog entry. When a PR changes behavior but leaves documentation unchanged (or changes documentation that doesn't match the code), that mismatch is itself a defect — arguably a more damaging one than a small code bug, because the documentation is what the next person trusts instead of re-reading the whole implementation.

Review documentation with the same three lenses the competency names:

- **Technical accuracy.** Does the documented behavior match what the code in this PR actually does? If a doc says an API parameter is optional and the code now requires it, that's a real, reportable discrepancy.
- **Compliance.** Does the documentation follow the team's required format — license headers, required sections in a README, a changelog entry format? Some of these requirements exist for legal or audit reasons, not just tidiness.
- **Completeness.** Does the documentation cover every case the code now handles? A new error code returned by an endpoint that's undocumented will surface later as a confused support ticket, not a clean bug report.

Concretely, that means opening any `.md` file, docstring, or comment the diff touches and reading it against the code changes line by line — the same way you'd trace a bug report against the code that supposedly causes it.

## Giving review feedback that gets acted on

A comment like "this is wrong" tells the author nothing actionable. A useful review comment states what you observed, why it matters, and — where you can — what you'd suggest instead:

```text
This returns 0 for out-of-stock items, but what happens if `quantity`
is negative (e.g. a data-entry error upstream)? Right now it would
still multiply through. Worth an explicit guard, or is that validated
elsewhere before this function runs?
```

Notice the tone: a question, not an accusation, and a concrete scenario rather than a vague concern. Distinguish blocking issues (this must change before merge — a real bug, a security gap, a broken test) from suggestions (this would be nicer, but isn't required) — most review tools let you mark the difference explicitly, and doing so respects the author's time.

## Participating in design reviews

D5-S1-C03 extends this same skill earlier in the process: participating in a design review, before code exists, to give input on requirements, designs, schedules, or potential problems. The habits are the same ones you're building in code review — asking what a design doesn't yet handle, checking a proposal against what you know about the product's actual constraints, and raising concerns as concrete questions rather than vague unease.

A useful design-review contribution from a QA perspective often sounds like:

- "How would we verify this works, once it's built? What would the test for the edge case where the cart is empty look like?"
- "This assumes the API always returns a result within 200ms — what's the plan if it doesn't?"
- "The schedule has this shipping the same week as the checkout redesign — do we have a plan for testing both together?"

These are exactly the questions a QA engineer is positioned to ask that a purely feature-focused proposal often misses — not because the designer or developer wasn't thoughtful, but because "how do we know it works" and "what happens when timing doesn't cooperate" are the two questions QA specializes in.

## Practice

1. Find a real, merged pull request on any public GitHub repository (ask your instructor for a suggestion if you'd like one). Read its description and its diff, then write three review comments you would have left — at least one about the code, and at least one about whether its documentation (README, comments, or docstrings) matches what the diff actually does.
2. Open your own pull request from a branch you created in an earlier lesson (or a new small change). Write a description that states what changed, why, and how a reviewer can verify it.
3. Swap PRs with a partner (or review your own with fresh eyes after a break) and leave at least one blocking comment and one suggestion, each written the way this lesson describes — a concrete observation plus a question or recommendation, not a bare judgment.
4. Imagine you're in a design review for a new "save for later" cart feature, and the proposal doesn't mention what happens if a saved item goes out of stock before the user returns to it. Write the question you would raise, in the tone this lesson recommends.
