---
lesson_id: cse270-02
course_id: cse270
pathway: cloud-support-engineer
title: Shell Scripting for Cloud Operations
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
objectives:
  - Write Bash scripts that automate repetitive cloud operations tasks safely
---

## From a command you ran to a script somebody else can run

You already write Bash. Every time you type a provider CLI command with a couple of flags, pipe it into something, and read the result, you are writing a one-line Bash program. The step this lesson takes is small and consequential: putting those lines in a file, giving the file a name, and making it safe enough that a colleague can run it on a Friday afternoon without you standing behind them.

That last clause is the whole lesson. Getting a script to do the right thing once is easy — you already did it interactively, and copying the commands into a file mostly works. What makes operations scripting a distinct skill is everything that happens on the runs you are not watching: the run where a variable is empty, the run where the network call fails halfway, the run somebody starts twice because the first one looked stuck, the run against production when the author meant staging.

There is a ladder here, and it is worth having the shape of it in your head before you write anything.

![The progression from a one-off command to a safe automation: manual run, scripted run with a dry-run flag, idempotent re-runnable script, scheduled or event-triggered execution](./img/automation-safety-ladder.png)

Each rung removes a human from the loop and therefore has to add back a guarantee the human was providing. When you run a command by hand, *you* are the safety check — you notice the output looks wrong and you stop. A script has no instinct, so you build the instinct in: it refuses to continue after an error, it tells you what it would do before it does it, it produces the same end state whether it runs once or five times, and it says out loud what it did so somebody can reconstruct the run afterwards.

One orientation note before we start. Bash is not the only operations shell — Windows-centric estates commonly automate with PowerShell, and the concepts here transfer to it. This course teaches Bash and Python, and everything you are assessed on will be written in one of those two.

## The header that turns a file into a script

Start every script with the same four lines. They are not boilerplate; each one closes a specific failure mode.

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

`#!/usr/bin/env bash` finds Bash on the user's `PATH` rather than assuming `/bin/bash`. On several distributions and on macOS, `/bin/sh` is a different, older shell that does not support the syntax below; `env bash` avoids a class of bug where your script works for you and mysteriously fails for a teammate.

`set -e` exits the moment a command returns a non-zero status. Without it, a script that fails to fetch a resource list will happily continue to the next line and act on an empty list — which, for a delete loop, is either a no-op or a catastrophe depending on how the loop is written.

`set -u` turns any reference to an unset variable into an error instead of an empty string. This one line is the difference between `rm -rf "$TARGET_DIR/"` deleting a directory and deleting `/`. Empty-string expansion is the most expensive default in shell scripting, and `-u` switches it off.

`set -o pipefail` makes a pipeline fail if *any* stage fails, not just the last. `cloud storage list | grep backup` returns 0 when `cloud storage list` errors out and `grep` matches nothing, because `grep`'s status is all Bash reports by default. With `pipefail`, the error survives to where you can see it.

`IFS=$'\n\t'` narrows the word-splitting characters to newline and tab, removing the space. It means an unquoted expansion of a value containing spaces splits less surprisingly. It is a seatbelt, not a substitute for quoting, which is the next section.

Two idioms go with `set -e`. When you genuinely expect a command to fail, say so explicitly rather than disabling the option:

```bash
if ! cloud compute instance describe "$INSTANCE_ID" > /dev/null 2>&1; then
  echo "instance $INSTANCE_ID does not exist" >&2
  exit 1
fi
```

And when a command's failure is acceptable, absorb it deliberately with `|| true`, so the reader can see you meant it:

```bash
cloud logs delete --older-than 30d || true
```

## Quoting, or the bug that eats your bucket

If you take one habit from this lesson, take this one: **every variable expansion goes in double quotes** unless you have a specific reason it should not.

```bash
PREFIX="nightly backups"

rm -rf $PREFIX/          # deletes ./nightly and ./backups/ — two wrong things
rm -rf "$PREFIX"/        # deletes ./nightly backups/ — the thing you meant
```

Unquoted, Bash splits the value on whitespace and then expands any glob characters it finds. A resource name with a space in it, a tag value containing `*`, an empty variable that collapses to nothing at all — each turns one argument into a different number of arguments, and the command you are calling has no way to know it was mangled.

The same rule applies to command substitution and to arrays:

```bash
BUCKET_NAME="$(cloud storage bucket describe "$BUCKET_ID" --format value name)"
INSTANCES=("$@")
for instance in "${INSTANCES[@]}"; do
  echo "processing $instance"
done
```

`"${INSTANCES[@]}"` in quotes expands to one word per element, preserving spaces inside elements. `${INSTANCES[@]}` unquoted re-splits every element, and `"${INSTANCES[*]}"` joins them all into a single word. Only the first is what you want when passing a list along.

Two related habits. Use `--` before user-supplied values where the command supports it, so a value beginning with a dash is treated as data rather than a flag. And never build a command as a string and pass it to `eval`; if you need to construct arguments conditionally, build an array:

```bash
args=(compute instance list --region "$REGION")
if [[ -n "${TAG_FILTER:-}" ]]; then
  args+=(--filter "tag=$TAG_FILTER")
fi
cloud "${args[@]}"
```

Note `${TAG_FILTER:-}` — with `set -u` on, that is how you test a variable that may legitimately be unset without tripping the error.

## Arguments, defaults, and refusing to guess

An operations script that takes no arguments is a script that has its target hard-coded, which means somebody will copy it and edit the copy, and now you have two. Take the inputs on the command line, validate them, and fail loudly when one is missing.

```bash
usage() {
  cat >&2 <<'EOF'
Usage: prune-snapshots.sh --project <id> --keep <n> [--dry-run]

  --project   Cloud project or subscription to operate on (required)
  --keep      Number of most recent snapshots to retain (required)
  --dry-run   Print what would be deleted and exit without deleting
EOF
  exit 64
}

PROJECT=""
KEEP=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="${2:-}"; shift 2 ;;
    --keep)    KEEP="${2:-}";    shift 2 ;;
    --dry-run) DRY_RUN=true;     shift ;;
    -h|--help) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

[[ -n "$PROJECT" ]] || { echo "--project is required" >&2; usage; }
[[ "$KEEP" =~ ^[0-9]+$ ]] || { echo "--keep must be a whole number" >&2; usage; }
```

Three things are deliberate here. There is no default project — a script that defaults to *some* environment will eventually run against the wrong one, and an error message costs a second while a wrong-environment run costs an afternoon. `--keep` is validated as a number before it is used, because a typo that makes it empty would otherwise be interpreted as "keep zero". And `--dry-run` exists from the first draft, which we will come back to.

`exit 64` rather than `exit 1` follows the convention that 64 means "the caller used this wrong" as distinct from "the work failed". Any consistent scheme is fine as long as `0` means success and you document the rest; schedulers and pipelines make decisions on that number.

## Talking to the cloud from a script

Examples in this course use a generic `cloud` CLI so the shape of the work is visible without provider trivia. Your provider's real CLI differs in verbs and flags but not in structure — you will be running the same script against whichever provider you used in cse203, so translate as you go. The three things you need from any of them are the same:

**Ask for machine-readable output.** Every major CLI can emit JSON, and every one has a human-readable default table that will change format under you without warning. Never parse the table.

```bash
cloud compute instance list --format json > instances.json
```

**Select fields with a real tool.** `grep` and `cut` on JSON works until a value contains a comma. `jq` is the standard answer and is worth the twenty minutes it takes to learn:

```bash
cloud compute instance list --format json \
  | jq -r '.items[] | select(.state == "stopped") | .id'
```

`-r` strips the quotes so the output is usable as plain text. `select()` filters. The result is one id per line, ready to feed a loop.

**Read the credentials from the environment, never the file.** A script must not contain a key, and it must not read one out of a path only you have. Assume the caller has authenticated — an assumed role, a workload identity, an environment variable set by the pipeline — and check that assumption at the top:

```bash
if ! cloud auth whoami > /dev/null 2>&1; then
  echo "not authenticated; run 'cloud auth login' first" >&2
  exit 1
fi
```

## Looping over resources without surprises

The natural next step is iterating over the ids you selected. There is a right way and a tempting wrong way.

```bash
# Wrong: word-splits on spaces, breaks on empty output in ways you won't notice
for id in $(cloud compute instance list --format json | jq -r '.items[].id'); do
  echo "$id"
done

# Right: one line is one record, empty input is zero iterations
while IFS= read -r id; do
  echo "processing $id"
done < <(cloud compute instance list --format json | jq -r '.items[].id')
```

`IFS= read -r` reads a whole line without stripping whitespace and without interpreting backslashes. The `< <(...)` process substitution keeps the loop body in the current shell, so variables you set inside it — a counter, a failure flag — still exist afterwards. Piping into a `while` loop instead puts the loop in a subshell and silently discards those changes, which is a genuinely baffling bug the first time you meet it.

Do not loop over `ls` output, and do not loop over an unquoted glob when the directory might be empty; an unmatched glob expands to itself, so `for f in *.json` gives you a literal `*.json` to choke on.

## Dry run before destructive

Write the dry run first. Not after the script works — first. It costs three lines and it is the single highest-value habit in this course.

```bash
run() {
  if [[ "$DRY_RUN" == true ]]; then
    echo "DRY RUN: $*"
  else
    "$@"
  fi
}

run cloud compute snapshot delete "$snapshot_id" --project "$PROJECT"
```

`"$@"` executes the arguments as a command with no re-splitting and no `eval`. Every destructive call in the script goes through `run`, so a single flag flips the whole script into a preview. Defaulting `DRY_RUN` to `true` and requiring an explicit `--apply` is even safer, and is a reasonable house style for anything that deletes.

The rule to internalise: a script that can destroy something must be runnable in a mode that destroys nothing, and its output in that mode must be specific enough to review. `DRY RUN: would delete some snapshots` is useless. `DRY RUN: cloud compute snapshot delete snap-8842 --project acme-prod` is reviewable.

## Idempotency: safe to run twice

An idempotent script produces the same end state whether it runs once or ten times. This matters because retries happen — a scheduler fires twice, a pipeline is re-run after a network blip, an engineer runs it again because the first attempt scrolled off the screen.

The pattern is to check current state and act only on the difference, rather than acting unconditionally:

```bash
# Not idempotent: second run fails because the bucket already exists,
# and with set -e that failure aborts everything after it.
cloud storage bucket create "$BUCKET"

# Idempotent: create only if absent
if cloud storage bucket describe "$BUCKET" > /dev/null 2>&1; then
  echo "bucket $BUCKET already exists; nothing to do"
else
  run cloud storage bucket create "$BUCKET" --region "$REGION"
fi
```

Where a resource has to be built up over several steps, use a lock or a marker so a second concurrent run does not interleave with the first. `mkdir` is atomic and makes a serviceable lock:

```bash
LOCK_DIR="/tmp/prune-snapshots.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "another run is in progress" >&2
  exit 1
fi
trap 'rmdir "$LOCK_DIR"' EXIT
```

`trap ... EXIT` runs the cleanup on every exit path — success, error, or interrupt — which is exactly what a lock needs. Use the same mechanism to remove temporary files:

```bash
TMP="$(mktemp)"
trap 'rm -f "$TMP"; rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
```

## Saying what happened

The last requirement is that somebody can reconstruct the run afterwards from the output alone. Two conventions carry most of the weight: diagnostics go to standard error so they do not pollute a pipeline consuming your standard output, and every line is timestamped.

```bash
log() { printf '%s [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "${*:2}" >&2; }

log INFO "starting prune for project=$PROJECT keep=$KEEP dry_run=$DRY_RUN"
log WARN "snapshot $id has no creation timestamp; skipping"
log ERROR "delete failed for $id"
```

Log the parameters at the start, one line per resource acted on, and a summary at the end with counts. When the run is scheduled rather than watched, these lines are the only account of what happened.

## A complete script

Putting the pieces together — argument parsing omitted for length, everything else intact:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

log() { printf '%s [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "${*:2}" >&2; }
run() { if [[ "$DRY_RUN" == true ]]; then echo "DRY RUN: $*"; else "$@"; fi; }

main() {
  cloud auth whoami > /dev/null 2>&1 || { log ERROR "not authenticated"; exit 1; }
  log INFO "pruning snapshots in $PROJECT, keeping $KEEP most recent"

  local kept=0 deleted=0 failed=0
  while IFS= read -r id; do
    if (( kept < KEEP )); then
      kept=$((kept + 1))
      log INFO "keeping $id"
      continue
    fi
    if run cloud compute snapshot delete "$id" --project "$PROJECT"; then
      deleted=$((deleted + 1))
    else
      failed=$((failed + 1))
      log ERROR "delete failed for $id"
    fi
  done < <(cloud compute snapshot list --project "$PROJECT" --format json \
             | jq -r 'sort_by(.created) | reverse | .[].id')

  log INFO "done: kept=$kept deleted=$deleted failed=$failed"
  (( failed == 0 )) || exit 1
}

main "$@"
```

Read the last line of `main` again. The script exits non-zero if anything failed, because the caller — a person, a pipeline, or a scheduler — decides what to do about failure, and it can only decide if you tell it.

Before you consider a script finished, run `shellcheck` over it. It is a static analyser for shell scripts, it catches most of the quoting and word-splitting mistakes in this lesson mechanically, and it takes one command.

## Practice

Work against the provider account you used in cse203. Do the whole exercise in dry-run mode until step 5.

1. **Set up the skeleton.** Create `tag-audit.sh` with the shebang, `set -euo pipefail`, `IFS`, a `usage` function, and argument parsing for `--project <id>` (required), `--tag <key>` (required, no default), and `--dry-run`. Confirm it exits 64 with a usage message when `--project` is omitted, and that `--help` prints the same text.

2. **Query and select.** Add a call that lists compute instances in the project as JSON and pipes it through `jq` to produce the id of every instance that is *missing* the required tag key. Verify the `jq` filter on a saved JSON file first — `cloud compute instance list --format json > sample.json` — so you are not re-running the API call every time you get the expression wrong.

3. **Loop safely.** Iterate the ids with `while IFS= read -r id; do ... done < <(...)`, logging one timestamped line per instance to standard error. Deliberately test the empty case: point it at a project or filter that returns nothing and confirm the script prints its summary and exits 0 rather than erroring.

4. **Add the dry run and the destructive action.** Add the `run` helper and use it to apply the missing tag to each instance (`cloud compute instance tag set` or your provider's equivalent). Run with `--dry-run` and check that every printed line is a complete, reviewable command with real ids in it.

5. **Prove it is idempotent.** Run it for real, then run it again immediately. The second run must report zero instances to change and exit 0. If it does not, you are acting unconditionally somewhere — find it and add the state check.

6. **Break it on purpose.** Comment out `set -euo pipefail` and re-run with a deliberately misspelled variable name (`"$PROJEKT"`), then restore the line and re-run. Write two sentences in your notes describing the difference in what happened. Finally, run `shellcheck tag-audit.sh` and fix everything it reports.

## Check your understanding

1. `cloud storage list | grep backup` exits 0 even though the `cloud` call failed. Which option fixes that, and why? *(`set -o pipefail` — without it, a pipeline's status is the last command's status.)*
2. A counter incremented inside `cloud ... | while read -r id; do ...; done` is zero afterwards. Why, and what is the fix? *(The piped loop runs in a subshell; feed the loop with `done < <(...)` instead.)*
3. What makes a dry-run line "reviewable"? *(It is the complete command with real resource identifiers, specific enough to copy and run.)*
