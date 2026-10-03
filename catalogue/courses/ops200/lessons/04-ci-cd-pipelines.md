---
lesson_id: ops200-04
course_id: ops200
pathway: software-developer
title: CI/CD Pipelines
order: 4
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Explain what each stage of a CI/CD pipeline guarantees
---

## What continuous integration is for

Two developers work for a week on separate branches. Both branches pass their own tests. Neither developer has run the other's code. On Friday they merge, and the combined result does not work — not because either change was wrong, but because nobody ever ran them together. The longer the branches lived, the more expensive the discovery.

**Continuous integration** is the practice of merging everyone's work into a shared branch frequently — at least daily — and having an automated system build and test the combined result every single time. The automation is what makes the practice possible: integrating ten times a day is only viable if verifying an integration is free.

**Continuous delivery** extends that. Every commit that passes the checks produces an artifact that is *proven deployable*, so a release is a decision rather than a project. **Continuous deployment** goes one step further and deploys automatically, with no human pressing anything. The three terms are used loosely in job postings; the distinction that matters day to day is whether a human approves the deploy, and that is a policy choice, not a tooling one.

What all three depend on is a **pipeline**: an ordered set of stages, run automatically, where each stage either passes or stops the line. The value of a pipeline is not that it saves typing. It is that it turns a set of good intentions into a set of guarantees, and that a guarantee enforced by a machine applies on the day everyone is in a hurry.

## The pipeline is a machine that does not know you

The single most useful mental model: **the pipeline runs on a fresh computer that has never seen your project.** Every run starts from an empty container. No `node_modules`, no `.env`, no global packages you installed a year ago and forgot, no half-built `dist` from yesterday.

That is the entire reason a pipeline catches things your laptop does not. "Works on my machine" is a statement about your machine's accumulated state, and the pipeline is a machine with no accumulated state at all. The two most common first failures are always the same: a dependency that was installed globally instead of being in `package.json`, and a file that exists locally but was never committed.

It also explains the constraints. The pipeline cannot read your `.env` — secrets have to be supplied deliberately, through the CI provider's secret store. It cannot ask you a question, so every command must be non-interactive. And it must be told which Node version to use, because the fresh machine has no opinion.

The work you did in lessons 02 and 03 was preparation for this. A committed lockfile, an `engines` field, a `verify` script, and configuration read from the environment are exactly what a stateless machine needs to reproduce your build.

## Anatomy of a workflow file

This course uses GitHub Actions, where a pipeline is a YAML file in `.github/workflows/`. GitLab CI, CircleCI, and Jenkins differ in syntax and agree on the concepts, so what you learn transfers.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    name: Lint, test, build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Check out the commit
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install from the lockfile
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload the web artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: web/dist
          retention-days: 7
```

Read the vocabulary off that file, because every CI system has the same four levels.

A **workflow** is the whole file. `on:` declares its **triggers** — here, any push to `main` and any pull request, which together mean every change is checked before merge and again after. A **job** is a unit that runs on one machine; `runs-on` picks the image. **Steps** run in order on that machine, and each is either `uses:` (a prebuilt action someone else wrote) or `run:` (a shell command). A step that exits non-zero fails the job and skips the rest — which is why lesson 03 insisted that your scripts report failure honestly.

Three supporting details are worth copying into every workflow you write. `concurrency` with `cancel-in-progress` kills the previous run when you push twice in a minute, so you are not waiting behind results you no longer care about. Once this workflow also deploys (later in this lesson), be careful: cancelling a run on `main` can stop a deploy halfway. A common pattern is to cancel only pull-request runs, with `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`, so runs on `main` queue instead of being cancelled. `timeout-minutes` stops a hung job from burning an hour. And `node-version-file: .nvmrc` means the pipeline and your laptop read the same file, so there is one answer to "which Node version" instead of two that drift apart.

## What each stage guarantees

The core skill here is being able to say, for any stage, what is true after it passes that was not true before. A stage that guarantees nothing is a stage to delete.

**Checkout.** *Guarantee: the machine holds exactly the commit under test, and nothing else.* Not your working directory, not the branch tip that may have moved — the specific SHA that triggered the run. This is what makes a result reproducible: a green check is attached to a commit, permanently.

**Environment setup.** *Guarantee: the declared runtime version is what runs.* Reading `.nvmrc` means an upgrade is a one-line commit reviewed like any other, not a surprise from a hosted image changing its default.

**Install.** *Guarantee: the dependency tree is exactly what the lockfile describes.* `npm ci` deletes any existing `node_modules`, installs the locked versions, and fails outright if the lockfile and `package.json` disagree. That failure is a feature — it catches the teammate who edited `package.json` without running an install. Never use `npm install` in a pipeline; it may silently resolve a newer version and test something other than what you will ship.

**Lint.** *Guarantee: the code satisfies the team's static rules.* Formatting, unused variables, banned patterns, obvious type mistakes. This stage protects reviewers' attention more than it protects correctness: nobody should spend a review comment on indentation when a machine can settle it.

**Test.** *Guarantee: the behavior covered by the suite still holds on the merged result.* Note both limits in that sentence. It guarantees only the behavior you actually wrote tests for, and it guarantees it for the integrated code rather than for either branch alone. A passing suite is not proof of correctness; it is proof that a specific set of known behaviors did not regress.

**Build.** *Guarantee: the source compiles to a complete artifact on a clean machine.* Plenty of code passes tests and fails to build — a missing dependency that only existed locally, a type error the test run skipped, an asset referenced but never committed. This stage is also where the artifact you will deploy comes into existence.

**Package and upload.** *Guarantee: the exact bytes that were tested are the bytes available to deploy.* This is the one people skip, and skipping it quietly breaks the whole chain. If the deploy job rebuilds from source, it is deploying something no stage in this run ever verified. Build once, then move that artifact forward.

**Deploy.** *Guarantee: a specific verified artifact is now running in a specific environment.* And it should record which artifact and which commit, so the running system can be traced back to a line of code. Lesson 05 is about making that record.

**Post-deploy check.** *Guarantee: the newly released version answers.* A smoke test against the deployed URL, checking a health endpoint and a couple of critical paths. Without it, a deploy stage tells you the upload succeeded, not that the application works.

![The ordered stages of a CI/CD pipeline, showing what each stage guarantees and where the build artifact is created and reused](./img/pipeline-stages.png)

Two systemic guarantees sit on top of the individual ones. **Every change takes the same path** — there is no manual route to production that skips a stage, and that is what makes the guarantees meaningful. And **the pipeline is the record**: each run is a timestamped, permanently linked account of what was checked, on which commit, with what result.

## Splitting jobs, and passing the artifact along

Jobs run in parallel by default, which is what you want for independent checks, and `needs:` expresses the dependencies that do exist.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: release-${{ github.sha }}
          path: |
            web/dist
            api/src
            package.json
            package-lock.json
```

`lint` and `test` now run at the same time, and `build` waits for both. Feedback on a lint error arrives in under a minute instead of behind a five-minute test suite.

The cost of splitting is that each job is a separate machine and repeats checkout and install. `cache: npm` softens that by restoring the npm download cache keyed on the lockfile, but there is a real trade-off: three fast parallel jobs versus one job that installs once. For a repository this size, either is defensible. Choose deliberately rather than by habit.

Naming the artifact `release-${{ github.sha }}` is worth the extra characters. The artifact's name now contains the commit it was built from, so six weeks later you can look at a running deployment, read its version, and find the exact build.

## Gating the deploy

Not every run should deploy. A pull request must be verified and must not touch production; only what lands on `main` gets released.

```yaml
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: release-${{ github.sha }}
          path: release

      - name: Deploy to the platform
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: npx platform-cli deploy ./release --token "$DEPLOY_TOKEN"

      - name: Smoke test the deployed release
        run: |
          sleep 10
          curl --fail --silent --show-error https://events-board.example.com/health
```

Four mechanisms are doing the gating work.

`needs: build` means nothing deploys unless lint, test, and build all passed — dependencies are transitive.

The `if:` condition restricts this job to pushes on `main`. Pull request runs execute every other job and stop before this one. This is the line that separates continuous integration from continuous deployment, and it is the line you would change to require a human approval instead.

`environment: production` attaches the job to a named environment, which is where you configure required reviewers and environment-scoped secrets. Setting a manual approval on that environment converts continuous deployment into continuous delivery without touching the workflow file.

`secrets.DEPLOY_TOKEN` reads from the provider's encrypted store. Secrets are never in the repository — that is the same rule as lesson 03, enforced in a second place. Pass them as environment variables rather than interpolating them into a command string, so they cannot end up in a log or a process listing, and quote the variable. CI providers mask known secret values in output, but that is a safety net, not a design.

The smoke test at the end is short on purpose. `curl --fail` exits non-zero on a 4xx or 5xx, so an unhealthy release fails the run and the pipeline tells you within seconds. The `sleep` gives the platform a moment to swap traffic over; a real setup would poll with a timeout rather than guess.

## Reading a red build

A red pipeline is information, and reading it is a skill with a fixed order.

**Find the first failing step, not the last.** Later failures are usually consequences. Open the run, find the earliest red step, and expand it.

**Read the whole step output from the top.** The useful line is often above the final error — a warning about a missing peer dependency, a deprecation notice, a test that logged something unexpected before the failure.

**Decide which of three kinds of failure it is.** Either the code is genuinely broken, in which case fix the code. Or the pipeline's environment differs from yours, in which case the pipeline is usually right and your machine is carrying state — a missing dependency, an uncommitted file, a different Node version. Or the failure is unrelated to the change: a network timeout, a rate limit, a flaky test.

**Reproduce it locally the pipeline's way.**

```bash
rm -rf node_modules
npm ci
npm run verify
```

That approximates a fresh machine closely enough to catch most environment failures.

**Never fix a red build by disabling the check.** Skipping a test, adding a lint exception, or commenting out a step to get a merge through removes a guarantee permanently in exchange for a few minutes. If a test is genuinely wrong, fix or delete it deliberately and say so in the pull request. If you cannot work out the failure, ask — a red build blocking your merge is exactly the situation the team expects you to raise.

**Treat flakiness as a defect.** A test that fails once in ten runs teaches everyone to re-run the pipeline without reading it, and then a real failure gets re-run too. Open an issue against the flaky test rather than living with it.

## Keeping the pipeline worth having

A pipeline that takes forty minutes stops being run before merge. A pipeline that is red half the time stops being read. Both failures end with people working around the automation, so speed and reliability are correctness concerns, not conveniences.

Aim for pull request feedback in under ten minutes. Cache dependencies. Parallelize independent jobs. Keep slow, expensive checks — long end-to-end suites, security scans — on a nightly schedule rather than on every push:

```yaml
on:
  schedule:
    - cron: "0 3 * * *"
```

And finish the loop by making the checks required. In the repository's branch protection settings, mark the pipeline's jobs as required for merging into `main`. Until you do, everything in this lesson is advisory: a developer in a hurry can merge past a red build, and the guarantees you carefully assembled are only as strong as the busiest person's discipline.

## Practice

Build a working pipeline for the events board and prove each guarantee by breaking it.

1. Create `.github/workflows/ci.yml` with a single `verify` job that checks out, sets up Node from `.nvmrc`, runs `npm ci`, and runs `npm run verify`. Push it on a branch and open a pull request so it runs.
2. Confirm the run is green. Record the total wall-clock time and the time spent in the install step.
3. Break the lint rule you added in lesson 03, push, and confirm the run goes red. With the single `verify` step from item 1, look inside that step's log: the lint output should show the error, and the test and build scripts should never have started, because `verify` stops at the first failure. Screenshot or paste the step list into `NOTES.md`.
4. Change one dependency version in `package.json` without updating the lockfile and push. Capture the exact `npm ci` error and write one sentence on the guarantee that error is protecting.
5. Add a step that intentionally references a file you have not committed. Watch it fail, then explain in `NOTES.md` why your laptop did not catch it.
6. Split the workflow into parallel `lint` and `test` jobs plus a `build` job that `needs` both. Compare the new pull request feedback time to the single-job version and record both numbers.
7. Add `actions/upload-artifact` to the build job, naming the artifact after the commit SHA. Download the artifact from the run page and confirm its contents match what `npm run build` produces locally.
8. Add `concurrency` with `cancel-in-progress`, then push twice within thirty seconds and confirm the first run was cancelled.
9. Add a `deploy` job that `needs: build`, is gated with `if: github.ref == 'refs/heads/main'`, downloads the artifact, and — as a stand-in for a real deploy — prints the artifact's file listing and the commit SHA. Confirm it is skipped on your pull request and runs after merge.
10. Add a smoke-test step using `curl --fail`. A GitHub-hosted runner can't reach `localhost` on your laptop, so if you haven't deployed anywhere yet, use a public URL as a stand-in: `https://api.github.com/` returns 200 and `https://api.github.com/this-path-does-not-exist` returns 404. Point the step at the 404 path and confirm the job fails; point it at the 200 path and confirm it passes.
11. Add a repository secret and read it in a step through an `env:` block, printing only its length rather than its value. Explain in one sentence why the length is safe to print.
12. Enable branch protection on `main` requiring your pipeline's jobs to pass, then try to push directly to `main` and record what happens.
13. Write, in `NOTES.md`, one sentence per stage in your final pipeline stating what is guaranteed to be true once that stage passes.

**Deliverable:** a merged `.github/workflows/ci.yml` with parallel checks, artifact upload, and a gated deploy job; branch protection requiring it; and a `NOTES.md` containing your timing comparisons, the four failures you caused with their error output, and your per-stage guarantee list.

## Check your understanding

1. Your laptop's build passes and the pipeline's fails with `Cannot find module 'vite'`. Which is more likely to be right, and what is the usual cause?
2. What does the build stage guarantee that the test stage doesn't?
3. Why should the deploy job download the artifact instead of running `npm run build` again?
4. Which line in the workflow separates continuous integration from continuous deployment, and how would you turn this into continuous delivery without editing the workflow?

*Answers:* (1) The pipeline. The package is probably installed on your machine (globally, or left over in `node_modules`) but missing from `package.json` or the lockfile. (2) That the source turns into a complete artifact on a clean machine. Tests can pass while a missing dependency or uncommitted asset still breaks the build. (3) A rebuild produces bytes no stage in the run ever verified. Build once and move that artifact forward. (4) The deploy job's `if:` condition. Add a required reviewer to the `production` environment.
