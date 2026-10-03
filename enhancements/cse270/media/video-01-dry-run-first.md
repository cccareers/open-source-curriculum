---
course_id: cse270
media_id: cse270-v01
type: video-script
title: "Dry Run First: Building a Safe Bash Script Live"
format: screencast
target_runtime: "9 min"
related_lessons:
  - cse270-02
  - cse270-03
objectives:
  - Write Bash scripts that automate repetitive cloud operations tasks safely
competency_ids:
  - D4-S1-C01
---

## Purpose
After watching, the learner can build a cloud operations script in the safe order — header, arguments, auth check, dry run, read-then-act loop, idempotency, logging — and demonstrate each guarantee with a test run.

## Audience and prerequisites
Apprentices starting lesson 02. Uses the fake `cloud` CLI from project cse270-x01 so every command runs on screen with no account. Terminal plus editor side by side.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal: a one-liner `for id in $(cloud compute instance list --project sandbox --format json \| jq -r '.items[].id'); do cloud compute instance tag set $id owner=unassigned --project sandbox; done`. | "Here's how most automation starts: a one-liner that worked once. We're going to turn it into something a colleague can run on a Friday afternoon. And we're going to write the part that destroys things last." |
| 0:25 | Editor: new file `tag-audit.sh` with the three-line header. | "Line one finds bash on the PATH. Line two is three seatbelts: stop on error, error on unset variables, fail a pipeline if any stage fails. Line three narrows word-splitting." |
| 1:00 | Terminal demo: `echo "rm -rf $TARGET_DIR/"` with and without `set -u`. | "Here's why `-u` matters. With an unset TARGET_DIR, this expands to `rm -rf /`. With `-u`, the script stops instead. That one line is the cheapest insurance you will ever buy." |
| 1:40 | Editor: argument parsing with `--project`, `--tag`, `--dry-run`, `usage` exiting 64. Terminal: run with no args → usage, `echo $?` → 64. | "Every input is a flag. No default project — a script that defaults to *some* environment will eventually hit the wrong one. Exit 64 means 'you called me wrong', different from 'the work failed'." |
| 2:30 | Editor: `cloud auth whoami` check. Terminal: set `"authenticated": false` in state, run → clear error, exit 1. | "Check you're logged in before you act. Finding out three calls into a loop is how half-finished runs happen." |
| 3:00 | Editor: the `run()` helper. | "Now the dry run — before any mutating call exists. Every change goes through `run`. In dry-run mode it prints the exact command. Otherwise it executes the arguments as given, no eval, no re-splitting." |
| 3:40 | Editor: the `while IFS= read -r id; do ... done < <(cloud ... \| jq ...)` loop with the `select((.tags // {}) \| has($t) \| not)` filter. | "Read, then act. JSON from the CLI, filtered with jq — never grep a table. The filter handles an instance with no tags key at all, which is exactly the record that breaks naive filters. And the loop reads from process substitution, so our counters survive." |
| 4:40 | Terminal: `./tag-audit.sh --project sandbox --tag owner --dry-run`. Output: five `DRY RUN: cloud compute instance tag set i-002 owner=unassigned --project sandbox` lines. | "Dry run. Every line is a complete, real command. A reviewer could copy one and run it. That's what 'reviewable' means." |
| 5:20 | Terminal: same with `--project empty`. Summary `changed=0`, exit 0. | "Empty case next — test it first, not last. Zero matches should be zero iterations and a clean exit, not an error and not a loop over an empty string." |
| 5:50 | Terminal: real run, then immediate second run. Second shows `changed=0`. | "Now for real. Then again, immediately. The second run finds nothing to do. That's idempotency, and we got it by asking for current state — not by ignoring 'already exists' errors." |
| 6:40 | Side-by-side: piped `\| while read` version prints `changed=0` after a real run. | "Here's the classic bug. Pipe into `while` and the loop runs in a subshell — the counter you incremented is gone. The summary lies. Process substitution fixes it." |
| 7:20 | Editor: `log()` to stderr with UTC timestamps; terminal shows stdout empty when redirected. | "Logs go to standard error, timestamped. Standard output stays clean for data. When this runs on a schedule, these lines are the only record that it happened." |
| 7:50 | Terminal: `shellcheck tag-audit.sh` → no output. Then `pytest -q` from x01 → `7 passed`. | "Shellcheck catches the quoting mistakes mechanically. And the acceptance suite proves every guarantee we just demonstrated, in three seconds." |
| 8:30 | Recap card: Header → Args → Auth → Dry run → Read-then-act → Idempotent → Log → Exit status. | "Header, arguments, auth, dry run, read-then-act, idempotent, logged, honest exit code. In that order, every time." |

## On-screen assets and B-roll
- Fake `cloud` CLI and `seed.json` from cse270-x01; reset state between takes with `cp seed.json state.json`.
- Editor and terminal at ≥18pt; highlight changed lines with a box outline.

## Accessibility
- Captions; every command and its output are read aloud.
- Provide the final script and all commands as a text file.
- Highlights use outline boxes, not colour alone.

## Check for understanding
1. Why write `run()` before writing the tag command? *Answer: So the destructive path is never exercised before the preview path exists.*
2. What does exit code 64 tell a scheduler that exit 1 does not? *Answer: The caller invoked the script incorrectly, as opposed to the work failing.*
3. A second real run tags the same instances again. What is missing? *Answer: A state check — the script is acting unconditionally instead of on the difference.*
