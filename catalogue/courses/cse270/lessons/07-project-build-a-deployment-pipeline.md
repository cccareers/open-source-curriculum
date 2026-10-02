---
lesson_id: cse270-07
course_id: cse270
pathway: cloud-support-engineer
title: 'Project: Build a Deployment Pipeline'
order: 7
kind: project
competency_ids:
  - D4-S1-C03
objectives:
  - Automate a deployment with a continuous integration and delivery pipeline
---

## The goal

Build a working pipeline that takes a merged change to your automation repository and deploys it, with no human running a command.

The thing being deployed is small on purpose — the scripts you already wrote, placed somewhere a schedule or a colleague could reach them. The graded artifact is the pipeline: the triggers, the stage boundaries, the secret handling, and the evidence that a failure at any stage stops the deployment.

Budget two hours. The first green run takes twenty minutes. The rest goes to the failure cases, which is where the grading is.

## What you start from

A single git repository containing:

- The Bash script from the lesson 03 project, executable, with `set -euo pipefail`.
- The Python script from the lesson 05 project, with a committed `requirements.txt`.
- A README describing both.

If either script is unfinished, finish it first. A pipeline around a broken script produces a red build you cannot learn anything from.

## Choosing a platform and a deployment target

Use **GitHub Actions, Jenkins, or Azure DevOps** — whichever your organisation or your account gives you access to. Name your choice in the README. The requirements are written in platform-neutral terms; translating them into your platform's keys is part of the work.

The **deployment target** is a place your scripts land and can be run from. Anything genuinely reachable counts: an object-storage location holding a versioned bundle, a small virtual machine the pipeline copies files to, a container image pushed to a registry, or an artifact repository. Choose the cheapest one that lets you prove the deployed version changed.

Do not deploy to a serverless function. That is the next project, and doing it here means doing it twice.

## Requirements

**R1 — The pipeline definition is committed to the repository.** In the platform's conventional location. It is reviewable in a pull request like any other code, and it is the only definition — no step exists solely as a setting clicked in a web console. Where a console setting is unavoidable (a secret's value, an environment protection rule), the README names it.

**R2 — Two triggers, doing different things.** A pull request targeting the default branch runs the validation stages and deploys nothing. A push to the default branch runs validation *and* deploys. Both are demonstrated.

**R3 — At least four distinct stages.** Minimum: checkout plus lint, build, test, deploy. Each has a name a stranger can read, and the README states in one sentence what each stage guarantees. A stage that guarantees nothing must be removed.

**R4 — The lint stage runs `shellcheck` and a Python linter.** Both over the committed scripts. Both must pass on the final state of your repository. Deliberately introducing a lint error must fail this stage and prevent everything downstream from running.

**R5 — The environment is pinned and built from scratch.** The runner installs a pinned language version and installs Python dependencies from the committed `requirements.txt`. No step depends on a tool being preinstalled on the runner image unless the definition asserts its version first.

**R6 — The build stage produces an artifact, and later stages consume it.** The build assembles a bundle — an archive, an image, or a directory — and publishes it through the platform's artifact mechanism. The deploy stage downloads that artifact rather than checking the source out again. The artifact must be downloadable from the run summary.

**R7 — The test stage exercises the scripts without changing anything.** At minimum: each script runs with `--help` and exits 0, and the Python script runs in dry-run mode against a sandbox and exits 0. A non-zero exit from any of these fails the stage.

**R8 — The deploy stage is branch-conditional.** It declares a dependency on the validation stages and a condition on the default branch. A pull-request run must not execute it even though the definition is shared. Demonstrate both the skip and the run.

**R9 — The deploy stage really deploys.** After a successful run, the artifact is present at the target and identifiably the new version — a version string, a commit SHA in the filename or image tag, or a manifest the pipeline writes. A reviewer must be able to look at the target and tell which commit produced what is there.

**R10 — Credentials come from the platform's secret store.** No credential in the repository, in the pipeline definition, in the artifact, or in the log. Secrets are injected as environment variables and scoped to the deploy stage only. The validation stages must be unable to read the deployment credential — show this, by naming the scoping mechanism in the README.

**R11 — Nothing sensitive reaches the log.** No step echoes a secret, passes one as a command-line argument, or writes one into the artifact. Review the full job log of your final successful run and state in the README that you did.

**R12 — A failure at any stage stops the deployment.** Prove it three times, with three different failures: a lint error, a test failure, and a script that exits non-zero during deploy. In each case, downstream stages must not run, the run must be marked failed, and nothing may reach the target.

**R13 — The deploy is idempotent and re-runnable.** Re-running the deploy stage on the same commit succeeds and leaves the same end state. Two runs of the same commit produce no duplicate resources and no error.

**R14 — Timeouts and concurrency are set.** Every job declares a timeout. The deploy stage is protected so two runs cannot deploy concurrently to the same target. Name both mechanisms in the README.

**R15 — A one-page README section on the pipeline.** Which platform and why; each stage and the guarantee it provides; every secret and variable by name and purpose, never by value; how to read the logs; how long a full run takes; and how to get back to the previous deployed version if a deploy is bad — or an explicit statement that you have no rollback mechanism and what you would do instead. An honest "none, I would redeploy the previous tag by hand" is worth more than an invented procedure.

## Constraints

- **No manual step in the happy path.** Between merge and deployed artifact, nobody types anything. A manual *approval* gate before the deploy stage is allowed and encouraged; a manual command is not.
- **One repository, one pipeline definition file** — or the platform's idiomatic equivalent if it requires more than one.
- **No new scripts.** Deploy the two you already have. Writing a third to make the pipeline look busier is out of scope.
- **No serverless functions and no scheduled triggers.** Both are the next lesson's material.
- **No infrastructure-as-code stage.** The pipeline copies and configures; it does not provision an estate.
- **Non-production target, and no destructive action in the pipeline.** Nothing the pipeline runs may delete a resource it did not create.
- **Free tier or existing allocation only.** Nothing here needs a paid runner.
- **No secret in git history, ever.** If you commit one, rotate it, clean the history, and say so in the README.

## Definition of done

A reviewer with your repository URL, your pipeline's run history, and read access to your target can confirm all of the following.

- A pull request run executes the validation stages, skips deploy, and reports its status on the pull request.
- Merging that pull request triggers a run that executes validation and deploys.
- The run history contains at least four named stages with visible pass or fail status.
- `shellcheck` and the Python linter both run and both pass on the final repository state.
- The runner installs a pinned language version and installs from `requirements.txt`.
- The build stage's artifact is downloadable from the run summary, and the deploy stage consumed it.
- The test stage runs both scripts non-destructively and fails the run when one exits non-zero.
- The deployed artifact at the target identifies its source commit.
- Three separate failed runs exist, one per failure class in R12, each showing downstream stages not executed.
- Re-running the deploy stage on the same commit succeeds and produces no duplicate or error.
- No credential appears in the repository, the definition, the artifact, or any job log.
- Every job has a timeout; the deploy stage has concurrency protection.
- The README section covers all seven items in R15, including the rollback answer.

## How you will be assessed

The competency is building a working CI/CD pipeline, and "working" is judged on the failure paths as much as the success path.

A reviewer will open your run history and look for the shape of it: does a pull-request run differ from a main-branch run in the way you claimed, do the failed runs show downstream stages skipped rather than passed, is there evidence the artifact travelled between jobs rather than being rebuilt. Then they will read the definition for the two things that most often go wrong in a first pipeline — a deploy job with no branch condition, and a secret readable by a stage that has no business reading it.

Green on the happy path is roughly half the marks. The other half is R12 and R10: proving the pipeline stops, and proving the credential is scoped. A pipeline that deploys beautifully and would also deploy a commit that failed its tests has not met the objective, because the only thing a pipeline is for is refusing to do that.

Expect one review question your README does not answer, such as what happens if two people merge within thirty seconds of each other, or how you would tell whether a deployed artifact matches the commit it claims.

## Hints

**Get one trivial job green before writing any real stage.** A definition that only echoes a line proves the trigger, the file location, and your permissions all work. Debugging those three at the same time as a build is miserable.

**Push early and often on a branch.** Pipeline definitions are not testable locally in any satisfying way, and small commits make it obvious which change broke the run.

**Read the whole first failure message.** Most first-run failures are the file being in the wrong path, a missing permission on the workflow, or a step name that does not exist on your platform. None of them are interesting, and all of them are stated plainly in the log.

**Give the deploy stage its condition on the very first draft.** Adding it later means at least one pull request already deployed, and you will not notice unless you look.

**Put multi-line shell in a script file.** A four-line `run:` block is unlintable and untestable. Move it to `scripts/`, and it gets `shellcheck` coverage from R4 for free.

**Check what your runner sets for you.** Most set `-e` for `run` blocks but not `-u` or `pipefail`. If your script has its own header, this is handled; if you inlined shell, it is not.

**Tag the artifact with the commit SHA.** It costs one variable reference and it is the entire answer to "which version is deployed", which R9 asks and which you will be asked in review.

**Make the failure runs deliberately and keep them.** Do not clean up your red history. R12's evidence is those runs, and reproducing them later is more work than leaving them.

**Masking is not protection.** The runner masks the exact stored secret string. A secret you concatenated into a URL or split across lines prints in the clear. Assume anything you build from a secret is visible.

## What to hand in

1. The repository URL with the pipeline definition and the updated README committed.
2. A link to a passing pull-request run, showing deploy skipped.
3. A link to a passing main-branch run, showing deploy executed.
4. Links to three failed runs, one per failure class in R12.
5. Evidence from the target showing the deployed artifact and the commit it came from.
6. A link to the re-run of the deploy stage on the same commit, and a note on what you checked to confirm the end state was unchanged.
