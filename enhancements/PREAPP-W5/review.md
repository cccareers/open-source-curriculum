---
course_id: PREAPP-W5
title: "Pathway Rotation: Software Development — Enhancement Review"
reviewed_lessons: 4
status: draft
---

## Summary

Week 5 is a well-paced, honest introduction to programming built on the learner's own data. The code is correct and the explanations are clear. This pass fixed four technical defects that would bite real learners: a Node run command that fails type-checking, a CSV parser that silently breaks on Windows line endings, a secret-scan check that every Path B learner would fail, and a "clean clone runs" requirement that the `.gitignore` setup made impossible.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| PREAPP-W5-02 | "The task, before the code" | `npx ts-node contacts.ts` type-checks by default and fails without `@types/node` once Lesson 3 adds `node:fs` and `process.env`; it also needs `typescript` installed | Replace with `npx tsx contacts.ts` (runs TypeScript without separate setup) and explain it | Applied |
| PREAPP-W5-02 | "Functions: naming a piece of work" | `contacts[2]` used before zero-based indexing is explained | Add a sentence on indexing and say what the line prints | Applied |
| PREAPP-W5-03 | "Path A: the CSV export" | `split("\n")` leaves `\r` on the last column for CRLF (Windows-style) exports, so comparisons like `r.status === "messaged"` silently fail. The row count `raw.split("\n").length - 1` is also off by one when the file ends with a newline, which most exports do | Use `trim().split(/\r?\n/)` in both places and explain why. Checked with Bun 1.3 on a CRLF sample, and type-checked with `tsc --strict` | Applied |
| PREAPP-W5-04 | "Definition of done" | `git log -p \| grep -i token` matches the learner's own `process.env.CRM_TOKEN` line, so every Path B learner fails a check meant to catch leaked secrets | Search for the first characters of the real token instead, and explain why the variable name is safe | Applied |
| PREAPP-W5-04 | "Hints" | Requirement 5 says a clean clone runs, but `contacts.csv` is gitignored and the script reads `"contacts.csv"`, so a clone crashes | Add a hint: either `cp contacts.sample.csv contacts.csv` in the README, or read the filename from `process.argv[2]` with the sample as default | Applied |
| PREAPP-W5-03 | Practice 6 | The ordering exercise mixes Path A (`readFileSync`) with a Path B line (`if (!res.ok) throw`), which do not belong in one script | Use one path's lines, or label the item "Path B only" | Proposed |
| PREAPP-W5-04 | "Write the .gitignore before your first commit" | Says you'd "start the repository over" after a leaked secret, but doesn't say to revoke (rotate) the token, which is the critical step | Add "revoke the token in the CRM first" | Proposed |
| PREAPP-W5-04 | "If you get stuck on authentication" | Personal access token setup is left to the instructor | Fine as is; consider linking GitHub's current docs, since the UI changes | Proposed |

## Depth and coverage gaps

- **No tests anywhere in the rotation**, though CONTRIBUTING.md asks coding projects to ship with learner-runnable tests. The supplementary project adds a six-test `bun test` suite (objective: "Apply core programming concepts to contact-list tasks in TypeScript").
- **No README example** for "Write a README a non-expert can use to understand and run the project." A 150-word model README for `pipeline-tools` would set the bar faster than the bullet list alone.
- **Tracing practice is one snippet.** Two or three more short traces with an `if/else` and a `filter` would better serve "Trace what a short program does and predict its output."
- **No reflection assigned** for the rotation; W7-02 relies on one. Added in the supplementary project.

## Proposed additional projects

- **Drafted:** `projects/01-funnel-report-script.md` — extend the Week 5 script to compute "reached at least" funnel counts, conversions, and the weakest stage, with a runnable `bun test` suite. A reference solution was written and passed 6/6 tests during authoring. This is the Software Development artifact for W7 and feeds the metrics story.
- Idea: "Duplicate Company Finder" — normalize company names ("Acme Inc", "ACME", "Acme, Inc.") and report likely duplicates; reuses W1's import-cleaning lesson.
- Idea: "Follow-up Due Date Calculator" — compute touch 2/3/4 due dates from W1's day 0/3/8/15 cadence using a `last_touch_date` column.

## Video and animation opportunities

- **From CRM export to Monday's follow-up list** (W5-03) — screencast building the four-step script, including the comma limitation and a deliberate 401. *Drafted: `media/video-01-fetch-parse-transform-output.md`.*
- **Where your files go: add, commit, push** (W5-04) — animation of folder → staging → history → GitHub, plus why a deleted secret stays in history. *Drafted: `media/animation-01-add-commit-push.md`.*
- Tracing a loop with a variable table (W5-02) — whiteboard; a table updated row by row is a natural fit for motion. Not drafted.
- Clean-clone test with a partner (W5-04) — short screencast. Not drafted.

## Assessment ideas

- **Trace items:** three snippets; predict output before running.
- **Bug hunt:** a CSV with CRLF endings and a comma inside a company name; learners explain both failures.
- **Git command ordering:** put `init`, `add`, `commit`, `remote add`, `push` in order and say what each moves.

## Changes applied in this pass

- `02-programming-concepts-through-real-tasks.md`, "The task, before the code": replaced `npx ts-node` with `npx tsx`, with an explanation.
- `02-programming-concepts-through-real-tasks.md`, "Functions: naming a piece of work": explained zero-based indexing and the expected output of `needsFollowUp(contacts[2], 3)`.
- `03-data-apis.md`, "Path A: the CSV export": changed both line splits to `/\r?\n/` (fixes CRLF exports and the off-by-one row count) and explained why.
- `04-version-control-shipping.md`, "Definition of done": replaced the `grep -i token` check with a search for the real token's characters.
- `04-version-control-shipping.md`, "Hints": added "Make the clean clone actually run" (sample file or `process.argv[2]`).

## Open questions for the course owner

- Is Bun the default runtime for every cohort machine? If Node is common, confirm `npx tsx` is allowed on lab networks (it downloads a package on first run). On Node 23.6+, `node contacts.ts` also runs TypeScript directly by stripping types; I did not add this because cohort Node versions are unknown.
- Should a `package.json` with `typescript` and `@types/node` be part of the starter? It would let learners run `tsc --noEmit` themselves (when checking edited snippets I needed `--skipLibCheck` because of an `@types/node` version mismatch with the installed TypeScript).
