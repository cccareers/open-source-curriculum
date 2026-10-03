---
course_id: cse270
title: "Scripting & Automation for Cloud Operations — Enhancement Review"
reviewed_lessons: 10
status: draft
---

## Summary
A disciplined, safety-first automation course: every lesson repeats the same core guarantees (fail loudly, dry run first, idempotent, logged, honest exit codes) at a new level of autonomy — Bash, Python, pipeline, event-driven function — and the capstone tests whether they cohere into a toolkit. The biggest gap is that the lessons' generic `cloud` CLI **does not exist**, so no example can be run as written and every first attempt at a destructive loop happens against a real sandbox. Supplying a runnable fake CLI with acceptance tests, plus an emulated (moto/LocalStack) path for the serverless work, makes the safety habits testable before any account is touched. A few small factual and safety fixes were applied.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cse270-02 | "Practice" step 1 | `--tag <key>` described as "required, defaulting to nothing" — contradictory. | "required, no default". | Applied |
| cse270-04 | "The shape of an operations script" | `list[str] \| None` annotations require Python 3.10+; not stated. | Added version note and the `Optional[List[str]]` alternative. | Applied |
| cse270-06 | "The parts" — generic YAML | Generic YAML silently mixes GitHub Actions syntax (`${{ secrets.X }}`, `github.ref`) with a non-functional `uses: checkout@v4` (real form `actions/checkout@v4`). | Added a sentence explaining the borrowed shape and the real Actions form. | Applied |
| cse270-06 | "Practice" step 4 | Asked learners to `echo` the real sandbox credential to observe masking — leaks a real credential if masking fails, contradicting the lesson's own "never echo a secret". | Use a throwaway dummy secret for the echo test, then delete it. | Applied |
| cse270-08 | "Timeouts, memory, and cost" | `context.remaining_time_ms()` is not a real method on any major platform. | Comment naming the AWS Lambda method; generic call kept. | Applied |
| cse270-08 | "Triggers" YAML | `cron(0 19 * * ? *)` is AWS's six-field syntax, presented as generic. | Comment showing the standard five-field equivalent. | Applied |
| cse270-08 | "Practice" | No cleanup step; a five-minute schedule from step 2 was left firing. | Added step 9 "Clean up". | Applied |
| cse270-02 | "The header that turns a file into a script" | The `env bash` rationale mentions `/bin/sh`, which a `#!/bin/bash` shebang never uses; the real reasons are bash's location and macOS's bash 3.2 at `/bin/bash`. | Reword the rationale. | Proposed |
| cse270-02 | "A complete script" | `jq` filter `sort_by(.created) \| reverse \| .[].id` assumes a bare array, while every other example uses `.items[]`. | Make consistent (`.items \| sort_by(.created) \| reverse \| .[].id`). | Proposed |

## Depth and coverage gaps
- **No runnable CLI for the examples** ("Write Bash scripts that automate repetitive cloud operations tasks safely"; "Write Python scripts that query and manage cloud resources through a provider CLI or SDK"). Drafted as project x01: a ~90-line fake `cloud` with pagination, auth failure, and injected 503s, plus a pytest acceptance suite. Verified against a reference script during this pass (7/7 passing).
- **Testing serverless logic locally** ("Trigger operational work from events and schedules using serverless functions"). Lesson 08 recommends fixtures but never shows a test. Drafted as project x02 using moto; suite verified (6/6 passing on moto 5.2, Python 3.12).
- **Pipeline credential federation example** ("Automate a deployment with a continuous integration and delivery pipeline"). Lesson 06 recommends short-lived federated credentials (OIDC) but shows only a stored token; one annotated example (permissions `id-token: write` + provider role trust) would make the preferred path concrete. Mark provider-specific.
- **Infrastructure plan in the pipeline** ("Combine scripting, pipelines, and infrastructure code into a reusable operations toolkit"). The capstone requires a plan artifact on every PR; no lesson shows the YAML. A short worked job (`terraform plan -out`, `terraform show -no-color > plan.txt`, upload) would prevent the most common capstone stall. Could reuse cse203's Plan Guard (cse203-x02).
- **Exit-code scheme template** (capstone R4). Provide a one-table convention (0 ok, 1 work failure, 64 usage, 69 unavailable, 75 temporary failure) learners can adopt.

## Proposed additional projects
- **x01 — Offline Ops Lab: Test-Driven Scripts Against a Fake Cloud** (drafted, tested).
- **x02 — Night Shift: A Tested Scale-Down Function, Emulated First** (drafted, tested).
- Pipeline-on-a-laptop: run the lesson 06 workflow locally with a runner emulator (e.g. `act` for GitHub Actions) against x01's suite; flag that emulators differ from hosted runners.
- Toolkit adoption swap: two learners exchange capstone repos and time each other to a first dry run (R18 evidence).

## Video and animation opportunities
- **Dry run first: building a safe Bash script live** — lesson 02; screencast; the order of construction is the lesson. *Drafted: media/video-01-dry-run-first.md.*
- **What secret masking does and doesn't do** — lesson 06; screencast with a dummy secret. *Drafted: media/video-02-secret-masking.md.*
- **At-least-once delivery and the duplicate invocation** — lesson 08; explainer animation. *Drafted: media/animation-01-at-least-once.md.*
- **Pipeline stages as gates** — lessons 06/07; explainer animation showing a failed lint stopping deploy. *Drafted: media/animation-02-pipeline-gates.md.*
- Late-binding lambda bug — lesson 04; 60-second whiteboard; not drafted.

## Assessment ideas
- "Spot the unsafe line" quiz: ten Bash snippets, each with one defect (unquoted expansion, piped while, missing pipefail).
- Pagination trap item: given two JSON pages, what does a first-page-only script report?
- Pipeline YAML review: identify the deploy job with no branch condition and the secret scoped too widely.
- Cost arithmetic check for lesson 09 R15 with a worked answer key.

## Changes applied in this pass
- `02-shell-scripting-for-cloud-operations.md`, "Practice" step 1: fixed contradictory flag description.
- `02-shell-scripting-for-cloud-operations.md`: appended "Check your understanding".
- `04-python-for-cloud-automation.md`, "The shape of an operations script": Python 3.10 note.
- `04-python-for-cloud-automation.md`: appended "Check your understanding".
- `06-continuous-integration-and-delivery-pipelines.md`, "The parts": explained the borrowed GitHub Actions syntax.
- `06-continuous-integration-and-delivery-pipelines.md`, "Practice" step 4: dummy secret for the masking test.
- `08-event-driven-automation-with-serverless-functions.md`, "Triggers": cron syntax comment.
- `08-event-driven-automation-with-serverless-functions.md`, "Timeouts, memory, and cost": real method name comment.
- `08-event-driven-automation-with-serverless-functions.md`, "Practice": added step 9 cleanup.
- `08-event-driven-automation-with-serverless-functions.md`: appended "Check your understanding".

## Open questions for the course owner
- Should the fake `cloud` CLI (x01) be promoted into the course as an official starter asset, so lessons 02–05 are runnable out of the box?
- **Unverified**: whether LocalStack's free edition currently supports Lambda + EventBridge scheduled rules end to end (x02 keeps this optional); current GitHub Actions default shell flags for `run:` steps (believed `bash -e {0}` when no shell is specified, `-eo pipefail` when `shell: bash` is explicit) — worth stating precisely in lesson 06 once confirmed.
- **Pricing**: no provider rates are quoted in the enhancements; x02's cost note requires learners to label or cite every rate.
