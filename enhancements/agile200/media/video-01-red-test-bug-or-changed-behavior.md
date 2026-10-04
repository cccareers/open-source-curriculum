---
course_id: agile200
media_id: agile200-v01
type: video-script
title: "Red Test: Real Bug or Changed Behavior?"
format: screencast
target_runtime: "7 min"
related_lessons:
  - agile200-06
  - agile200-07
objectives:
  - Write and maintain automated test scripts as the code changes
competency_ids:
  - D3-S1-C03
  - D3-S1-C04
  - D3-S1-C05
---

## Purpose

After watching, the learner can look at a failing automated test, decide on purpose whether it caught a real bug or is now testing outdated behavior, and make the right fix: change the code, or change the test in the same commit as the behavior change.

## Audience and prerequisites

QA apprentices in week 2 of the agile200 capstone. They have read Lesson 06 ("Maintaining tests as the code changes") and Lesson 07 (defect records and regression tests). They can run commands in a terminal and read basic JavaScript. Node.js 20 or newer is installed. The demo uses the starter project from supplementary project agile200-x01 (`signup-guard/`) with DEF-01 and DEF-02 already fixed, so all seven tests are green at the start.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: terminal, large font (at least 20 pt), dark-on-light theme. One line visible: `ℹ fail 1`. | "One test just went red. Before you touch anything, you need to answer one question: did we break something, or did the world change under this test? Get that wrong in one direction and you ship a bug. Get it wrong in the other and your test suite slowly stops testing anything." |
| 0:20 | Title card: "Red Test: Real Bug or Changed Behavior?" Subtitle: "agile200, Lesson 06". | "In the next seven minutes we'll do both cases on a real suite: one where the behavior changed on purpose, and one where a refactor broke something." |
| 0:30 | Editor, file tree visible: `src/accounts.js`, `support/fixtures.js`, `test/accounts.test.js`. | "This is the accounts module from the signup-guard project. Signup, login, and a test file with seven tests. Two of them are regression tests for defects we already fixed: DEF-01, duplicate emails, and DEF-02, a blank password that logged people in." |
| 0:50 | Terminal. Type `node --test --test-reporter=spec`. Output shows seven check marks and `ℹ pass 7`, `ℹ fail 0`. | "Baseline first. I'm running Node's built-in test runner with the spec reporter so the output is a readable tree. Seven pass, zero fail. Always know your baseline before you change anything, or you can't tell which change caused a failure." |
| 1:15 | Slide: product owner's message in a chat bubble: "The invalid-email error is unhelpful. New copy: 'Enter an email address like name@example.com'." Ticket ID beside it: "STORY: improve signup error copy". | "Case one. The product owner asked for new error copy on the signup form. That's a deliberate behavior change, and it's on the board as a story." |
| 1:35 | Editor, `src/accounts.js`. Change line `return { ok: false, error: 'Enter a valid email address' };` to `return { ok: false, error: 'Enter an email address like name@example.com' };`. The changed line is highlighted with a thick outline as well as color. | "I'll make the source change: one string in the signup function." |
| 1:50 | Terminal: `node --test --test-reporter=spec`. Output: `✖ rejects an invalid email`, then `ℹ pass 6`, `ℹ fail 1`. Scroll to the diff: `+ actual - expected`, with `+ error: 'Enter an email address like name@example.com'` and `- error: 'Enter a valid email address'`. | "One red test: 'rejects an invalid email.' Read the diff. Plus is what the code actually returned, minus is what the test expected. The test still expects the old message." |
| 2:15 | Split screen: left the diff, right a checklist titled "Bug or changed on purpose?" with three items: "1. Is there a ticket or decision that asked for this change? 2. Does the new behavior match that decision? 3. Is the test asserting the old behavior?" Each item gets a check mark and the word "Yes" as it is narrated. | "Three questions. Is there a ticket or decision that asked for this change? Yes, the product owner's story. Does the new behavior match the decision? Yes, the copy is exactly what was asked for. Is the test asserting the old behavior? Yes. Three yeses: this is the world changing under the test. We fix the test." |
| 2:45 | Editor, `test/accounts.test.js`. Change the assertion to `assert.deepEqual(result, { ok: false, error: 'Enter an email address like name@example.com' });`. | "Notice what I'm not doing. I'm not deleting the assertion, and I'm not swapping it for a check that `ok` is false and ignoring the message. The test still pins the exact message. It just pins the new one." |
| 3:05 | Terminal: `node --test --test-reporter=spec` shows `ℹ pass 7`. Then `git add src/accounts.js test/accounts.test.js` and `git commit -m "Update signup error copy per PO request; update test to match"`. | "Green. And the source change and the test change go in the same commit, with a message that says this was on purpose. Six weeks from now, someone reading the history can see the test changed because the product changed, not because somebody got annoyed at a red build." |
| 3:30 | Slide: "Case two: a refactor". Then editor showing a teammate's diff to `signup` in which the duplicate check block is deleted. Deleted lines are shown with a minus sign prefix and strikethrough, not only red color. | "Case two. A teammate tidied up the signup function. Their commit message says 'refactor: simplify signup, no behavior change.' Here's the diff. The duplicate-email check is gone." |
| 3:50 | Terminal: `node --test --test-reporter=spec`. Output: `✖ DEF-01 regression: refuses a duplicate email address`, `ℹ fail 1`. Diff shows actual `ok: true` with an account object, expected `ok: false, error: 'Email already registered'`. | "Red again, and this time it's the DEF-01 regression test. Run the same three questions. Is there a ticket asking for duplicates to be allowed? No. The commit literally says 'no behavior change.' Does the new behavior match any decision? No. This is a real bug. The test is doing exactly the job we wrote it for." |
| 4:25 | Tracker screen (any issue tracker; product name blurred): DEF-01 record. Status changes from `Closed` to `Reopened`. A comment is added: "Regressed by commit <hash>, 'refactor: simplify signup'. Caught by DEF-01 regression test." | "So we fix the code, not the test. And because DEF-01 came back, I reopen the defect record and link the commit that brought it back. That reopen is data. If one area keeps reopening, that's a signal about its coverage, which is exactly what Lesson 07 asks you to watch for." |
| 4:50 | Editor: restore the duplicate check in `signup`: `if (accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) { return { ok: false, error: 'Email already registered' }; }`. Terminal: `ℹ pass 7`. | "Put the check back, run the suite, seven green. Then someone other than me re-runs the original repro steps before DEF-01 goes back to Verified and Closed." |
| 5:15 | Slide: two columns. Left heading "Changed on purpose" with icon of a document: "Ticket or decision exists. Update the test in the same commit. Keep the assertion exact." Right heading "Real bug" with icon of a bug: "No decision asked for it. Fix the code. Reopen or file the defect. Leave the assertion alone." | "Here's the whole decision on one slide. Changed on purpose: there's a decision behind it, you update the test in the same commit, and the assertion stays exact. Real bug: nobody asked for it, you fix the code, you record it in the defect database, and you leave the assertion alone." |
| 5:45 | Slide: "The trap". Show a bad edit: `assert.equal(result.ok, false);` replacing the exact `deepEqual`. Label: "Loosened assertion: passes for the wrong reason." | "And here's the trap. Under deadline pressure it's tempting to make a red test green by loosening it. Change the exact match to 'ok is false' and the test passes for both the old message and the new one. It also passes for a message that says 'undefined'. That's how a suite quietly stops testing anything." |
| 6:15 | Back to the terminal with seven green tests. | "Every red test is a question. Answer it on purpose, write down the answer in your commit or your defect record, and your suite will still mean something in week three." |
| 6:35 | End card: "Try it: supplementary project agile200-x01, Milestones 4 and 5." | "To practice both cases yourself, open project x01 and do Milestones 4 and 5." |

## On-screen assets and B-roll

- The `signup-guard/` project from agile200-x01, with DEF-01 and DEF-02 already fixed (start state: 7 passing).
- A prepared git branch containing the teammate's "refactor" commit that deletes the duplicate check, so the recording does not depend on live typing.
- A mock product-owner chat message and a mock defect record for DEF-01 in any issue tracker. Blur the product name; the course does not mandate a tool.
- Two slides: the three-question checklist and the two-column decision summary.
- Record with Node 20 or newer. Output formatting differs slightly between Node versions, so re-record the terminal shots if the cohort's Node version changes.

## Accessibility

- Captions for all narration, plus caption text for terminal output that is read aloud (for example "fail 1").
- Terminal and editor at 20 pt or larger, high-contrast light theme.
- Pass and fail are never shown by color alone: the narration says "pass" and "fail", the runner's own check-mark and cross symbols are visible, and the summary counts are read aloud.
- Diff lines use `+` and `-` prefixes and strikethrough for deleted code in addition to red and green.
- Every visual-only moment (the chat message, the defect status change) is described in the narration.
- All terminal actions are typed commands, so keyboard-only learners can follow exactly. No mouse-only actions are required.

## Check for understanding

1. A test fails after a teammate changes a button label from "Log in" to "Sign in". There is a story on the board requesting the new label. What do you do?
   **Answer:** It is a change on purpose. Update the test to expect "Sign in", keep the assertion just as exact, and commit the test change together with the label change.
2. A regression test for a closed defect fails after a commit labelled "refactor, no behavior change". What are your next two actions?
   **Answer:** Treat it as a real bug. Fix the code (not the test), and reopen the defect record with a link to the commit that brought it back. After someone else verifies the fix, close it again.
3. Why is replacing `assert.deepEqual(result, { ok: false, error: '...' })` with `assert.equal(result.ok, false)` a risky way to make a red test green?
   **Answer:** It stops checking the message, so the test now passes for the old copy, the new copy, and wrong or empty messages. That hides the question the failure was asking.
