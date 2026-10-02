---
lesson_id: cse270-03
course_id: cse270
pathway: cloud-support-engineer
title: 'Project: Automate a Routine Task with Bash'
order: 3
kind: project
competency_ids:
  - D4-S1-C01
objectives:
  - Write Bash scripts that automate repetitive cloud operations tasks safely
---

## The goal

Pick one routine cloud task you currently do by hand, and replace it with a single Bash script that a colleague could run without you in the room.

That is the entire deliverable, and it is narrow on purpose. You are not building a tool suite, a menu, or a framework. You are taking one chore — the kind that takes four minutes and gets done twelve times a month — and turning it into a script that is safe enough to hand over.

Budget two hours. Most of the difficulty is not the automation; it is the safety work around it. If you find yourself an hour in with a working script and nothing else, you are roughly on schedule, because the requirements below are mostly about the second hour.

## Choosing your task

You choose the task, against the provider account you used in cse203. It has to satisfy four properties:

- **Repetitive.** Something genuinely done more than once, not invented for this exercise.
- **Read-then-act.** The script must query the cloud for current state and then do something with the result. A script that only prints a list is too small.
- **Has a destructive or mutating step.** Something is created, changed, tagged, stopped, or deleted. This is what the dry-run and idempotency requirements have to bite on.
- **Small enough to finish.** One resource type, one operation. If describing it takes more than two sentences, cut it down.

Workable examples, any of which is a fine choice: delete snapshots or images older than N days, keeping the most recent N; stop compute instances tagged `env=dev` outside working hours; apply a required tag to every resource of one type that is missing it; empty and remove object-storage buckets matching a naming prefix; deregister instances that have been in a failed state for more than an hour; expire old versions in a container or artifact registry.

Write your chosen task down in one sentence at the top of your README before you write any code. If you cannot, the task is not scoped yet.

## Requirements

Numbered so a reviewer can grade them one at a time. Each states what must be true, not how to type it.

**R1 — One executable script.** A single file, named for the task in kebab case with a `.sh` extension, with the executable bit set and committed that way. It begins with `#!/usr/bin/env bash`, then `set -euo pipefail`, then an `IFS` assignment. No other language, no second script, no sourced library file.

**R2 — Every input is an argument.** No environment name, project id, region, resource name, threshold, or account identifier is hard-coded anywhere in the file. All are supplied as command-line flags. There is no default value for whichever flag identifies the environment or account being acted on — the script refuses to run without it.

**R3 — Inputs are validated before anything is called.** Required flags present; numeric flags matched against a numeric pattern; unknown flags rejected. Any of these failures prints a message to standard error, prints usage, and exits with a non-zero status distinct from the status used for a work failure. Document both codes in the README.

**R4 — `--help` prints real usage.** Every flag listed with a one-line description saying whether it is required and what it defaults to. A reader must be able to run the script correctly from `--help` alone, without opening the source.

**R5 — The script proves it is authenticated before it acts.** A cheap identity check runs first, and its failure produces a clear message naming what the operator should do about it. Discovering you were not logged in three API calls into a delete loop is not acceptable.

**R6 — Cloud data is read as JSON and parsed with a real parser.** The provider CLI is invoked with a machine-readable output format, and fields are selected with `jq` (or an equivalent structured tool). No `grep`, `cut`, `awk`, or `sed` against the CLI's human-readable table output anywhere in the file.

**R7 — Iteration is line-safe.** Resources are iterated with `while IFS= read -r ...` fed by process substitution, not by an unquoted command substitution in a `for` loop. Zero matching resources produces zero iterations, a summary line, and exit 0 — not an error and not an empty-string iteration.

**R8 — Every expansion is quoted.** Every variable expansion, command substitution, and array expansion in the file is double-quoted, except where you have written a comment on that line explaining why it is not. `shellcheck` reports zero warnings on the committed file; a suppression is allowed only with a comment justifying it.

**R9 — A dry-run mode exists and is genuinely safe.** A `--dry-run` flag routes every mutating or destructive call through a helper that prints the exact command instead of executing it. In dry-run mode the script makes no state change of any kind. Each printed line is a complete command with real resource identifiers substituted in — specific enough that a reviewer could copy one and run it.

**R10 — The script is idempotent.** Running it twice in a row against the same account produces the same end state, and the second run reports that there is nothing to do and exits 0. Achieve this by checking current state and acting only on the difference — never by catching and ignoring an "already exists" error.

**R11 — Failure of one item does not abort the run.** If the operation fails for one resource, the script logs the failure, continues to the next resource, and exits non-zero at the end with the failure count in the summary. A run where every item succeeded exits 0.

**R12 — Logging is timestamped and on standard error.** Every diagnostic line carries a UTC timestamp and a level. The first line records the parsed parameters, including whether this is a dry run. One line is emitted per resource acted on or skipped, naming it. The last line is a summary with counts of processed, changed, skipped, and failed. Nothing diagnostic goes to standard output.

**R13 — Temporary state is cleaned up on every exit path.** If the script writes a temp file or takes a lock, a `trap` on `EXIT` removes it — so it is cleaned up on success, on error, and on interrupt. Demonstrate the interrupt case.

**R14 — A README of one page.** The task in one sentence; the exact command to run it in dry-run mode; the exact command to run it for real; every flag; the exit codes; and one short "what this script will never do" paragraph listing the blast radius you deliberately bounded.

## Constraints

- **Bash only.** No Python, no PowerShell, no provider-specific scripting service. Python arrives in the next lesson; using it here does not earn credit.
- **One file.** No helper library, no config file, no `.env` file read by the script.
- **No infrastructure code.** No Terraform, CloudFormation, Bicep, or equivalent. The script calls the provider CLI directly.
- **No pipeline, no scheduler, no serverless.** The script is run by a human at a terminal. Automating its invocation is later coursework and is out of scope here.
- **No credentials in the repository, ever.** No key, token, connection string, account id you would not publish, or path to a private key file. The script inherits the caller's already-authenticated session.
- **Non-production resources only.** Run this against a sandbox, dev project, or resources you created for this exercise. If you have any doubt about the blast radius, you have not finished the dry-run work.
- **No interactive prompts.** The script does not stop and ask a question. Anything it needs comes from a flag. A script that blocks on input cannot be automated later.

## Definition of done

Every statement must be true and independently checkable by a reviewer holding only your repository.

- The script runs end to end with `--dry-run` and makes no change; its output lists complete, real commands.
- The script runs end to end for real and performs the task correctly.
- An immediate second real run reports nothing to do and exits 0.
- Omitting a required flag produces a usage message on standard error and the documented non-zero exit code.
- Passing a non-numeric value to a numeric flag is rejected before any cloud call is made.
- Running with zero matching resources prints a summary and exits 0.
- `shellcheck` reports zero warnings.
- `#!/usr/bin/env bash` and `set -euo pipefail` are both present on the committed file, and the file is executable.
- No hard-coded environment, account, project, region, or credential appears anywhere in the file.
- Every log line has a UTC timestamp and a level, and every one goes to standard error.
- The final summary reports counts, and a run with a failed item exits non-zero.
- Interrupting the script with Ctrl-C leaves no temp file or lock behind.
- The README fits on one page and contains both run commands verbatim.

## How you will be assessed

The competency being observed is automating a cloud task with a correct script. Correct here means two things at once, and they are weighted equally.

The first is that it does the job. A reviewer will run your script against their own sandbox using only your README, and it must work.

The second is that it is safe to hand over. That is graded from the requirements above, as evidence: the dry run is inspected for specificity, the second run is checked for idempotency, `shellcheck` is run, and the script is read for unquoted expansions and hard-coded environments. A script that performs the task perfectly but hard-codes a project id, or that fails on its second run, does not pass — the failure mode being tested here is precisely the script that works for its author and nobody else.

Expect one question in review that your README does not answer, such as what happens if the provider CLI times out on the fourth of ten resources, or how somebody would tell from your output that the run was a dry run.

## Hints

**Write `--dry-run` before you write the delete.** Building it in afterwards means testing the destructive path first, which is how sandbox accounts get emptied.

**Test your `jq` filter against a saved file.** Dump the JSON once, then iterate on the expression locally. It is faster, and it stops you hammering the API while you get a selector wrong six times.

**`set -e` and a `while` loop that reports failures need care.** A bare failing command aborts the script. Put the call inside an `if`, or append `|| true` and inspect the status yourself — that is how R11 and `set -e` coexist.

**Piping into `while` loses your counters.** `... | while read` runs the loop in a subshell, so the counts you increment inside it are gone afterwards. Use `done < <(...)` instead. This bug looks like the summary always printing zeros.

**Make the empty case your first test, not your last.** Point the script at a filter that matches nothing on day one. Half the ways this project goes wrong are visible there.

**Idempotency is a query, not a `try`.** Ask what state the resource is in and skip it if it is already right. Suppressing an "already exists" error passes a demo and fails a review.

**Log the parameters on line one.** When a run misbehaves a week later, the first question is always what arguments it was given, and the answer should be in the output rather than in someone's memory.

**Watch for a mismatch between your filter and your action.** Selecting by age and deleting by name is a classic off-by-one waiting to happen; make sure the identifier you act on came from the same record you filtered.

## What to hand in

1. The repository URL, with the executable script and the README committed.
2. A terminal transcript of a `--dry-run` run with real resources matched.
3. A terminal transcript of the real run, immediately followed by the second run showing nothing to do.
4. The `shellcheck` output showing zero warnings.
5. A transcript of one failure case — a missing required flag or an invalid numeric value — showing the message and the exit code.
