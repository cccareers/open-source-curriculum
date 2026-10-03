---
lesson_id: ops100-08
course_id: ops100
pathway: quality-assurance-software-engineer
title: Turning DevTools Evidence into a Defect Report
order: 8
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C05
  - D3-S1-C02
objectives:
  - Turn what DevTools shows you into a defect report a developer can act on
---

## Evidence without a report is wasted work

The last two lessons built your ability to find things: a console error and its exact line, a failed network request, a Lighthouse finding with a measured number attached. None of that has any value to the team until it's written up somewhere a developer will actually see it, understand it, and be able to act on without redoing your investigation from scratch. This lesson is entirely about that translation — the point in the QA workflow where investigation becomes a written artifact.

A well-written defect report has two properties that matter more than any other: it is **reproducible** (someone else, following your steps exactly, sees the same problem) and **well-categorized** (it's filed with the right severity, the right component, and the right supporting evidence so it gets triaged correctly instead of sitting unread). D2-S1-C01 — using a bug-tracking system to document and report defects — is built on getting both of those right, consistently, every time.

## Anatomy of a defect report

Most bug-tracking systems (Jira, GitHub Issues, Linear, and similar tools all follow this shape even when their field names differ slightly) expect roughly the same structure:

```text
Title: Cart total does not update when quantity changes on /cart page

Environment:
  - Chrome 126, macOS
  - Staging (staging.example.com)
  - Reproduced on both desktop and mobile viewport widths

Steps to Reproduce:
  1. Add any item to the cart from the product page
  2. Navigate to /cart
  3. Change the quantity field from 1 to 3

Expected Result:
  Total updates to reflect price × 3

Actual Result:
  Total remains at the price for quantity 1

Evidence:
  - Console error at the moment the quantity field changes:
      Uncaught TypeError: Cannot read properties of undefined
        (reading 'price') at cart.js:58
  - Network tab: no request to /api/cart/update fires on quantity change
    (confirmed via Network panel, filtered to XHR, before/after the click)

Severity: High — checkout math is directly affected
Component: Cart
```

Every line in that report earns its place. The title is specific enough to be findable in a search later, not "cart bug." Environment states exactly what you tested, because a bug that only reproduces on mobile Safari is a different report than one that reproduces everywhere. Steps to Reproduce are numbered and literal — not "try adding items," but the exact clicks. Expected vs. Actual are stated separately and plainly, because "it's wrong" doesn't tell a developer what "right" would have looked like. And Evidence is exactly what lessons 06 and 07 taught you to gather: a console error with its file and line, and a Network panel observation showing what didn't happen that should have.

## Writing steps a stranger can follow exactly

The single most common defect-report failure is steps that only work because the reporter already knows things they didn't write down — an implicit precondition, a specific test account, a setting that has to be on first. Before you file, actually re-run your own steps from a clean state (a fresh page load, a fresh cart) and confirm they reproduce the bug on their own, with nothing assumed. If a step depends on something not obvious from the page itself — a particular test account, a feature flag, a specific screen size — say so explicitly in Environment or as an extra step. A report that doesn't reproduce for the developer who reads it gets deprioritized or bounced back to you, costing more time than writing it carefully the first time would have.

## Severity and categorization

"Well-categorized" means more than picking a dropdown value — it means the severity and component you choose actually reflect the defect's real impact, so triage can trust your judgment rather than double-checking every report. A rough, defensible scale:

- **Critical** — data loss, security exposure, or the core function of the product is unusable (checkout is broken for everyone).
- **High** — a major feature is broken or wrong for a meaningful set of users, with no reasonable workaround (the cart total example above).
- **Medium** — a real defect, but with a workaround, or affecting a smaller surface (a visual bug on one rarely used settings page).
- **Low** — cosmetic, or affects an edge case with minimal real-world impact.

Resist the instinct to mark everything High to be safe — a bug tracker where every issue is High severity is one where "High" has stopped meaning anything, and the genuinely urgent reports get lost in the noise. Categorize honestly, and say why in the report if the reasoning isn't obvious ("High because this affects checkout math, not just display").

## Escalating clearly to a senior team member

D2-S1-C05 — identifying issues through close monitoring and reporting them clearly to senior team members — is closely related to filing a report, but distinct: escalation is what you do when a finding needs a decision or attention faster than the normal bug-tracker queue provides, or when something you noticed doesn't cleanly fit a single filed defect yet (a pattern across several reports, a security concern, something that looks like it could be affecting production right now).

A good escalation is short, leads with the impact, and gives the recipient everything they need to decide what to do next without a follow-up question:

```text
Escalating — possible production issue, not yet confirmed

I'm seeing repeated 500 errors from /api/cart/update in the staging
Network tab over the last 20 minutes (screenshot attached), which
matches the pattern in three separate defect reports filed this
morning (CART-102, CART-104, CART-107). I haven't confirmed this is
also happening in production, but the error signature is identical.
Flagging now in case it's worth checking before end of day rather
than waiting for normal triage.
```

Notice what this does: states the finding, gives the concrete evidence, connects it to related reports already filed (which is only possible because those reports were written well enough to search and recognize), states clearly what's confirmed versus not, and states why it's being raised now rather than through the normal queue. Escalating vaguely ("something seems off with the cart, someone should look") wastes a senior teammate's time reconstructing what you already know; escalating with this much precision respects it.

## Practice

1. Using a bug you either encountered or intentionally reproduced in lesson 06 or 07 (or one your instructor provides), write a complete defect report following the template in this lesson: Title, Environment, Steps to Reproduce, Expected Result, Actual Result, Evidence, Severity, and Component.
2. Attempt to follow your own Steps to Reproduce exactly as written, from a clean/fresh state, without relying on anything you remember but didn't write down. Note any step you had to add or clarify.
3. Assign a severity to your report using the four-level scale above, and write one sentence justifying the level you chose.
4. Write a short escalation message (3–5 sentences) for a hypothetical situation where your defect report's symptom appears to be recurring or spreading — following the escalation example's structure: lead with impact, state your evidence, state what's confirmed vs. not, and state why you're raising it now.

## Check your understanding

1. Your steps say "Log in and go to the cart." What is missing for a stranger to reproduce it?
2. A typo in the footer of one settings page: which severity, and why?
3. What separates an escalation from simply filing a defect?

*Answers:* (1) Which account (and its cart state), which environment and URL, and any flag or viewport needed. (2) Low: cosmetic, small surface, no functional impact. (3) Urgency and scope: escalation is for findings that need a decision faster than normal triage, or a pattern across reports; it leads with impact and states what is confirmed versus not.
