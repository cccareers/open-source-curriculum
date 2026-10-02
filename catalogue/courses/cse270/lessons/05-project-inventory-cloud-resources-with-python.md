---
lesson_id: cse270-05
course_id: cse270
pathway: cloud-support-engineer
title: 'Project: Inventory Cloud Resources with Python'
order: 5
kind: project
competency_ids:
  - D4-S1-C01
objectives:
  - Write Python scripts that query and manage cloud resources through a provider CLI or SDK
---

## The goal

Write one Python script that inventories a cloud account, reports the resources that fail a policy you define, and can optionally remediate them.

The deliverable is a report first and a fix second. That order is deliberate: an inventory that nobody trusts is worse than no inventory, so most of the requirements below are about the report being complete and correct, and only two are about changing anything.

Budget two hours. The script itself is perhaps forty lines of real logic. Pagination, missing fields, and the second run are where the time goes.

## Choosing your policy

Pick one policy that can be evaluated from data the provider will give you, against the account you used in cse203. It must:

- **Span at least two resource types**, so that answering it requires correlating two lists rather than reading one. The relationship is the point.
- **Have a clear pass and fail** for every resource, decidable from fields in the API response.
- **Have a safe remediation** — a tag, a label, a stop, or an annotation. Nothing irreversible.

Workable policies: volumes not attached to any running instance; snapshots whose source volume no longer exists; instances with no owner tag, cross-referenced against the tag policy; public IP addresses not associated with anything; storage buckets with no lifecycle rule; security groups referenced by no network interface; container images in a registry with no deployment referencing them.

State your policy in one sentence at the top of your README before writing code. "Every attached volume must belong to an instance that still exists" is a policy. "Clean up storage" is not.

## Requirements

**R1 — One Python file, run directly.** A single `.py` file with a shebang, a module docstring stating the policy, a `main(argv)` that returns an integer, and the `if __name__ == "__main__": sys.exit(main())` guard. The file must be importable without executing the work.

**R2 — `argparse` for every input.** At minimum: a required flag identifying the account, project, or subscription with no default; a threshold flag with `type=int` where your policy has one; `--dry-run`; `--verbose`. Nothing about the environment is hard-coded and there are no interactive prompts. `--help` documents every flag with its default.

**R3 — Cloud access is one wrapper.** All provider access goes through a single function or client wrapper. If you shell out, it uses `subprocess.run` with an argument **list**, `capture_output=True`, `text=True`, an explicit non-zero status check that raises an error naming the command and the captured stderr, and a `timeout`. `shell=True` appears nowhere in the file. If you use the SDK, the equivalent single client-construction point applies.

**R4 — Every list call is fully paginated.** Every resource listing follows page tokens until exhausted. Demonstrate this by running with a deliberately small page size and showing in the debug log that more than one page was fetched, with the final count matching what the provider's console reports.

**R5 — At least two resource types are correlated.** The second list is loaded into a `set` or `dict` keyed by id and used for membership or lookup. A nested loop that re-queries the API per resource is not acceptable — it is quadratic and it will rate-limit you.

**R6 — Missing fields do not crash the run.** Optional fields are read with `.get()` and handled explicitly. A resource missing the field your policy inspects is reported as `unknown`, not silently passed and not crashed on. Prove this: find or create one resource with the field absent and show the run completing.

**R7 — Time comparisons are timezone-aware UTC.** Any age or cutoff logic parses API timestamps into aware datetimes and compares against `datetime.now(timezone.utc)`. No naive datetimes anywhere in the file.

**R8 — The report goes to standard output as data.** A CSV with a header row, one row per resource evaluated, including at minimum the resource id, its type, the policy verdict (`pass`, `fail`, or `unknown`), and the field values the verdict was based on. Redirecting standard output to a file must produce a valid CSV with no log lines in it.

**R9 — Diagnostics go to standard error via `logging`.** Configured with a timestamp and level. The first line records the parsed parameters including dry-run state. `--verbose` raises the level to debug and reveals the per-page and per-call lines. A summary line at the end reports counts of evaluated, passed, failed, unknown, changed, and errored.

**R10 — Remediation is behind a dry run.** Every mutating call is routed through one helper that, in dry-run mode, logs a description containing the real resource id and makes no change. Default behaviour when neither flag is given must be the safe one — state in the README which it is and make the code match.

**R11 — Remediation is idempotent.** Running the real remediation twice leaves the same end state, and the second run reports zero changes and exits 0. Achieve it by checking state, not by swallowing an "already applied" error.

**R12 — Per-resource failures are isolated.** An exception on one resource is caught, logged with `log.exception` so the traceback is preserved, counted, and the loop continues. The run exits 1 if anything failed and 0 otherwise. A bare `except:` and an `except Exception: pass` appear nowhere in the file.

**R13 — Retries are narrow.** Retry logic, if present, applies only to rate-limit and 5xx responses, uses exponential backoff with jitter, has a bounded attempt count, and logs each retry. Permission errors, not-found, and malformed requests are never retried.

**R14 — Reproducible environment.** A `requirements.txt` is committed listing pinned versions of everything imported that is not in the standard library, generated from a virtual environment. If you use only the standard library plus a CLI, commit the file with a comment saying so and state the CLI version your script expects.

**R15 — A README of one page.** The policy in one sentence; how to create the environment and install dependencies; the exact command for the report; the exact command for the remediation; every flag; the exit codes; and a short paragraph on what the script deliberately does not touch.

## Constraints

- **Python 3, one file.** No second module, no package layout, no `setup.py` or `pyproject.toml`, no entry-point registration. This is a script, not a distributable application.
- **No web framework, no test framework requirement, no ORM, no database.** The output is a CSV file.
- **No Bash.** The previous project was the Bash deliverable. A shell wrapper around this script earns nothing.
- **No pipeline, scheduler, or serverless invocation.** The script is run by a human. Those come later.
- **No infrastructure-as-code tooling.**
- **No credentials in the repository.** No key, token, or connection string in the file, in `requirements.txt`, or in the committed CSV output. The script inherits an already-authenticated session or reads a credential from an environment variable it does not log.
- **Non-production resources only,** and remediation must be reversible by hand in under a minute.
- **No output the script cannot explain.** Every row in the CSV must be traceable to a rule stated in your README.

## Definition of done

- Running the report against your account produces a CSV on standard output with a header row and one row per evaluated resource.
- The counts in the summary line add up: evaluated equals passed plus failed plus unknown.
- The resource count matches the provider console, proving pagination is complete.
- A small `--page-size` run shows more than one page fetched in the debug log.
- At least two resource types are fetched and correlated through a `set` or `dict` lookup.
- A resource missing the inspected field is reported as `unknown` and the run completes.
- Redirecting standard output yields a clean CSV; the log still appears on the terminal.
- `--dry-run` names real resource ids and changes nothing.
- The real remediation works, and an immediate second run reports zero changes and exits 0.
- A forced failure on one resource is logged with a traceback, counted, does not stop the run, and produces exit 1.
- `shell=True`, bare `except:`, and naive datetimes appear nowhere in the file.
- `requirements.txt` is committed and a clean virtual environment built from it runs the script.
- The README fits on one page and contains both run commands verbatim.

## How you will be assessed

The competency is automating a cloud task with a correct script, and here "correct" is mostly about completeness of the read. A reviewer will run your script against their own sandbox using only your README, compare your resource count against the console, and look specifically for the first-page-only bug — an inventory that reports 100 of 340 resources is confidently wrong, which is the worst kind of wrong for a tool people will trust.

After that, the code is read for the safety properties: one cloud-access wrapper, list-form subprocess calls, isolated per-resource failures, a genuine dry run, and a second run that changes nothing. A script that produces a beautiful report and crashes on the one resource with a missing tag has not met the bar, because that resource is exactly the one your policy exists to find.

Expect one question in review that the README does not answer — for instance, what your script would do if a resource were deleted between the list call and the remediation call.

## Hints

**Save one page of real JSON to a file and work from it.** Iterating on field names against a live API is slow and rate-limited. Dump it, read it properly, and note every field that is missing from at least one record.

**The provider console's count is your test oracle.** Check it before you write the pagination loop, so you know the number you are trying to reach.

**Make the page size small deliberately.** Set it to 5 while developing. If your loop is broken you will see it immediately instead of discovering it in an account that happened to fit in one page.

**Build the id lookup once, outside the loop.** If you find yourself calling the API inside a `for` over resources, stop and hoist it — that shape is what R5 is written to prevent.

**Late-binding closures will bite you.** If you collect remediation actions as lambdas and run them afterwards, bind the loop variable as a default argument. Otherwise every action targets the last resource.

**Log the parameters first and the summary last.** The two lines that make a run reconstructable a week later are the arguments it received and the counts it produced.

**Decide what `unknown` means before you code it.** A resource you cannot evaluate is a finding, not a pass. Reporting it as passing is how policy scripts create false confidence.

**Test the empty account.** Point it at a project with none of your resource type. It should print a header row, a summary of zeros, and exit 0.

## What to hand in

1. The repository URL with the script, `requirements.txt`, and the README committed.
2. The CSV output from a real report run, with the console count you compared it against noted alongside.
3. A terminal transcript of a `--verbose` run showing more than one page fetched.
4. A `--dry-run` transcript naming real resource ids, followed by the real remediation run and an immediate second run showing zero changes.
5. A transcript of the forced single-resource failure showing the traceback, the continued run, the summary counts, and the exit code.
