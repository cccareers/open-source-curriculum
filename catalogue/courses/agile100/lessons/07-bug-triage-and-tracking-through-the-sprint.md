---
lesson_id: agile100-07
course_id: agile100
pathway: quality-assurance-software-engineer
title: Bug Triage and Tracking Through the Sprint
order: 7
kind: lesson
competency_ids:
  - D2-S1-C01
  - D2-S1-C04
  - D3-S1-C05
objectives:
  - Track defects from discovery through verified closure
---

## Why the defect record is the job

Everything earlier in this course — reading the codebase, writing testable checks, planning the schedule, escalating in standup — exists to produce and act on defect records. A bug you found but didn't file might as well not exist; the team can't fix, prioritize, or even remember it. This lesson is about the full lifecycle: filing a defect well, tracking it through resolution, verifying the fix, and keeping the record of known defects useful for next time.

## The defect record: fields that matter

Whatever bug-tracking system your team uses (Jira, GitHub Issues, Linear, or something else), a well-formed defect has the same core fields regardless of tool:

```text
Title:        Short, specific, searchable — not "checkout broken"
Steps to
reproduce:    Numbered, exact, no assumed knowledge
Expected
result:       What should have happened
Actual
result:       What actually happened
Environment:  Browser/OS/build version/environment (staging, prod, etc.)
Severity:     Impact if unfixed (data loss, crash, cosmetic, etc.)
Priority:     Urgency to fix relative to other work
Attachments:  Screenshot, log excerpt, network trace — whatever proves it
Linked story: Which backlog item / AC this relates to, if any
```

### Worked example

```text
Title: Guest checkout returns 500 on payment submit (all guest users)

Steps to reproduce:
  1. While logged out, add any item to cart
  2. Proceed to checkout
  3. Enter valid payment info and click "Place Order"

Expected result: Order is created, confirmation page shown
Actual result:   500 Internal Server Error, no order created

Environment: staging (build #4021) and prod (build #4020), Chrome 126
Severity:  Critical — blocks all guest purchases
Priority:  P0 — fix before next deploy
Attachments: screenshot of 500 page; server log excerpt showing
             "TypeError: Cannot read properties of undefined (reading 'id')"
             at services/checkout.ts:88
Linked story: STORY-108 (search fix deployed this morning) — suspect
              related; needs confirmation
```

This is the same discipline as Lesson 06's escalation, formalized into the tracker: specific title, exact steps, clear severity, and evidence — not "checkout is broken sometimes," which nobody downstream can act on.

### Severity vs. priority — don't conflate them

Severity is about impact (how bad is it if it stays broken); priority is about urgency (how soon does it need fixing relative to everything else). A cosmetic bug on the highest-traffic page might be low severity but high priority; a severe bug in a feature nobody uses yet might be high severity but low priority. Getting these right — and not just defaulting everything to "critical" — is what makes a tracker trustworthy (see also Lesson 06's note on not crying wolf).

## Triage: sorting what comes in

Triage is the process of reviewing newly filed defects and deciding severity, priority, and who owns the fix. On many teams this happens as part of standup or a short dedicated slot. As the person who filed most defects, your job in triage is to have already done the hard part (clear repro, severity assessment) so the conversation is fast: confirm or adjust priority, assign an owner, and move on.

A defect that arrives well-formed (per the template above) triages in under a minute. A defect that arrives as "found a bug, will send details later" stalls the whole triage meeting while everyone waits.

## Tracking through resolution (D2-S1-C04)

Filing is the start of a lifecycle, not the end of your involvement. A typical defect state flow:

```text
New -> Confirmed -> In Progress -> Fixed -> Verified -> Closed
                                       |
                                       v
                                  Reopened (if verify fails)
```

Your responsibilities at each transition:

- **New → Confirmed**: you (or another QA) confirm the repro steps actually reproduce the issue before it's worked. An unconfirmed bug wastes a developer's time chasing something that might be user error or environment-specific.
- **In Progress → Fixed**: the developer marks it fixed and it comes back to you. Don't just trust the label — this is where verification happens.
- **Fixed → Verified**: re-run the original repro steps against the fix. If it passes, verify related areas too — a fix that touches shared code can introduce a new problem elsewhere (a quick regression check, not a full re-test).
- **Verified → Closed**: only after you've confirmed the fix, not when the developer says "should be fixed now."
- **→ Reopened**: if verification fails, the defect goes back to the developer (Reopened, then In Progress again). Reopen it with the same rigor as the original report — what you tried, what still fails, and any new information (the previous fix attempt might be relevant to the real cause).

The single most common failure in this loop is skipping straight from "developer says fixed" to "closed" without ever re-running the repro. Monitoring bug-resolution efforts means actually watching the pipeline — how long defects sit in each state, whether "fixed" reliably becomes "verified" or bounces back to "reopened" — not just filing and forgetting.

### A simple tracking view

A lightweight way to monitor a sprint's defects without fancy tooling — a spreadsheet or the tracker's own board view, sorted by state:

| ID | Title | Severity | State | Owner | Age (days) |
| --- | --- | --- | --- | --- | --- |
| BUG-142 | Duplicate wishlist entries | Medium | Verified | — | 3 |
| BUG-150 | Guest checkout 500 error | Critical | In Progress | @dev-han | 1 |
| BUG-151 | Out-of-stock badge delayed >1min | Low | New | — | 0 |

Watching the "Age" column is how you catch a defect quietly stalling — a Critical bug sitting In Progress for four days without movement is exactly the kind of thing to escalate in standup (Lesson 06), even if nobody's explicitly asked for a status update.

## Maintaining a database of known defects (D3-S1-C05)

Not every defect gets fixed this sprint. Some are deferred, some are accepted as known limitations, some are duplicates of something already tracked. A useful team doesn't lose track of these — it maintains them as a **known-defects database**: a running, searchable record separate from the active sprint's board, so:

- A tester who rediscovers the same bug next sprint can find it already filed, instead of re-reporting it as new.
- A developer picking up related code can check whether there's a known issue nearby before assuming their change introduced something.
- Anyone deciding release readiness can see the full list of accepted, unfixed issues, not just what's active this sprint.

Keeping this useful takes small, consistent habits: before filing, search for existing similar titles; when closing as duplicate, link to the original rather than just closing with no trace; when deferring a bug rather than fixing it, record *why* (not a priority, accepted risk, won't-fix) so the reasoning survives past the person who made the call.

## Practice

You find this bug while testing: on the order-history page, orders placed more than 90 days ago don't appear in the list, even though they exist in the database and the customer can see them in their email receipts.

1. Write a complete defect record for this bug using the template above, including a severity and priority judgment with one sentence justifying each.
2. Walk the defect through the full state flow (New → Confirmed → In Progress → Fixed → Verified → Closed) and, for each transition, write one sentence describing what you specifically would check or do before moving it to the next state.
3. Before filing, you check the known-defects database and find a closed bug from two sprints ago: "Order history pagination shows wrong page count," marked Fixed and Verified. Is your new bug a duplicate, related, or unrelated to that one? Justify your answer in one or two sentences.

## Check your understanding

1. A developer comments "should be fixed now" and moves BUG-150 to Fixed. What do you do before it can be Closed?
2. Classify severity and priority: the company logo is misaligned by a few pixels on the homepage the week of a major marketing launch.
3. You're about to file "Wishlist button unresponsive on mobile." What's the first thing you do, and why?

*Answers:* (1) Re-run the original repro steps against the fixed build, run a quick regression on nearby paths (e.g. logged-in checkout), and only then move it to Verified and Closed; if it still fails, reopen with what you tried and what still fails. (2) Low severity (cosmetic, nothing broken), high priority (highly visible at a critical moment). (3) Search the tracker and known-defects database for an existing report, so you link to it or add detail instead of creating a duplicate.
