---
lesson_id: cse270-06
course_id: cse270
pathway: cloud-support-engineer
title: Continuous Integration and Delivery Pipelines
order: 6
kind: lesson
competency_ids:
  - D4-S1-C03
objectives:
  - Automate a deployment with a continuous integration and delivery pipeline
---

## When a script stops being run by a person

Every script you have written so far had you standing behind it. You chose the arguments, you read the output, and when something looked wrong you pressed Ctrl-C. A pipeline removes you from all three of those.

That removal is what makes pipelines a distinct topic rather than "scripts, but on a server". The moment a merge triggers a deployment, the guarantees have to come from the machinery instead of from your judgement. It must run the same way every time, from a clean environment, with credentials it was given rather than credentials that happened to be lying around, and it must be able to tell — mechanically, from a number — whether each step worked. You have already felt the absence of every one of those: the script that worked because your shell had a variable set, the one whose failure scrolled past, the one you were not sure was safe to run twice.

A pipeline is worth building when a change has to travel the same path more than a few times. The path is the point. Everybody can deploy on a good day; a pipeline is what makes the deployment identical on a bad one.

## The parts

Strip away vendor vocabulary and every system has the same five pieces.

A **runner** (also called an agent or executor) is the machine that does the work. A **pipeline definition** is a YAML file committed to your repository that says what to run. A **trigger** decides when it runs — a push, a pull request, a tag, a schedule, a manual click. A **job** is a unit of work that runs on one runner, and jobs can depend on other jobs. A **step** is one command inside a job.

Three products you will meet: **GitHub Actions**, where the file lives at `.github/workflows/` and jobs run on GitHub-hosted or self-hosted runners; **Jenkins**, where a `Jenkinsfile` describes stages and an agent executes them; and **Azure DevOps Pipelines**, with `azure-pipelines.yml` and its own agent pools. Their syntax differs and their words differ — Jenkins says "stage" where Actions says "job" — but the model above is the same in all three, which is why the examples in this lesson use a generic runner. Translate the keys; do not re-learn the concepts.

Here is the generic form used throughout. It borrows GitHub Actions' shape because it is the most widely seen, but drops the `actions/` owner prefix on `uses:` lines to stay neutral; in a real Actions workflow you would write `actions/checkout@v4`. Expressions such as `${{ secrets.X }}` and `github.ref` are likewise Actions syntax, and each platform has its own equivalent.

```yaml
name: deploy-inventory-tool

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Check out source
        uses: checkout@v4
      - name: Lint shell scripts
        run: shellcheck scripts/*.sh
```

`on` is the trigger. `jobs` maps a job name to a runner image and a list of steps. `uses` invokes a reusable action; `run` executes a shell command. Every product has an equivalent of each of these.

## The stages and what each one guarantees

The reason a pipeline is split into stages at all is that each stage buys you a specific guarantee, and the next stage is only allowed to start because the previous one holds.

![A deployment pipeline from commit through build, test, and approval to deploy, showing what each stage guarantees before the next one runs](./img/cicd-pipeline-stages.png)

**Checkout** guarantees the pipeline is operating on exactly the commit that triggered it, from a clean working copy, with no leftovers from a previous run.

**Lint and static check** guarantees the code is syntactically sound and free of the class of defect a tool can find for free. For this course that means `shellcheck` on the shell scripts and a Python linter on the Python. It runs first because it is the fastest way to fail.

**Build** guarantees a deployable artifact exists — a package, an image, a rendered configuration bundle, or simply a validated set of files. Everything downstream uses this artifact rather than re-deriving it, so what you tested is what you deploy.

**Test** guarantees the artifact behaves. In an operations repository this is usually small: does the script run with `--help`, does a dry run against a sandbox produce the expected output, does the infrastructure plan succeed.

**Deploy to a non-production environment** guarantees the deployment mechanism itself works, against real infrastructure, before it is pointed at anything that matters.

**Approval** guarantees a human agreed. It is not a technical check and it should not pretend to be; it is the point where accountability is recorded.

**Deploy to production** does the thing. Because everything above passed, this stage is allowed to be boring.

A stage that does not add a guarantee is ceremony, and ceremony gets skipped under pressure. If you cannot say in one sentence what a stage proves, delete it.

## Triggers and where they point

Get the trigger wrong and nothing else matters. The two you need:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

A **pull request** trigger runs the safe stages — lint, build, test — against the proposed merge and reports back on the pull request. Nothing is deployed. This is the feedback loop that catches problems while they are still cheap.

A **push to the main branch** trigger runs the full path including deployment. Because merging is the only way code reaches `main`, the pull-request run is a precondition for the deploy run, and you have a chain from proposal to production with a human review in the middle.

Two rules follow. Deployment jobs must be conditional on the branch, so a pull-request run can never deploy even if the workflow file is shared:

```yaml
  deploy-production:
    needs: [test, deploy-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
```

And pull requests from forks must not have access to deployment credentials. Every platform has a setting for this; find it and check it rather than assuming the default is safe.

## Clean environments and reproducible runs

The defining property of a good runner is that it starts empty. Every dependency your pipeline needs must be installed by the pipeline, from a version you pinned.

```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: checkout@v4
      - name: Install Python
        uses: setup-python@v5
        with:
          python-version: "3.12"
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Dry-run the inventory script against the sandbox
        run: ./inventory.py --project "$SANDBOX_PROJECT" --dry-run
```

`python-version: "3.12"` is pinned rather than "latest", and `requirements.txt` carries pinned versions, because the value of a clean environment evaporates if it fills up with whatever was newest that morning. This is where the "works on my machine" problem is finally settled: nobody's machine is involved.

Note the `run: |` block. Multi-line `run` steps execute in a shell, and everything from the Bash lesson applies to them — the quoting, the `set -euo pipefail`, all of it. Most runners execute each `run` block with `-e` already set, but not `-u` or `pipefail`. If a block is more than two lines, put it in a script file in your repository instead and call it from one line. Scripts can be linted, tested, and run locally; YAML blocks cannot.

## Secrets

A pipeline that deploys needs credentials, and this is the most dangerous part of the lesson.

The rules are short. Secrets are stored in the platform's secret store, never in the repository — not in the workflow file, not in a committed `.env`, not base64-encoded in a variable as if that were encryption. They are injected as environment variables at run time and referenced by name:

```yaml
      - name: Deploy
        env:
          CLOUD_TOKEN: ${{ secrets.CLOUD_DEPLOY_TOKEN }}
          CLOUD_PROJECT: ${{ vars.PRODUCTION_PROJECT }}
        run: ./scripts/deploy.sh --project "$CLOUD_PROJECT"
```

Scope them as narrowly as the platform allows: production credentials attached to the production environment only, so a job that is not deploying to production cannot read them. Prefer short-lived federated credentials — where the runner exchanges a signed identity token for a temporary cloud credential — over a long-lived key, because a key that never expires is a key you will eventually forget you issued.

Never `echo` a secret, never pass one as a command-line argument where it will appear in a process list or a log line, and never write one into an artifact. Runners mask known secret values in log output, but masking only works on the exact stored string — a secret you transformed, split, or embedded in a URL will print in full. If a credential is exposed, rotate it. A leaked secret is not fixed by deleting the log.

## Exit codes are the contract

A pipeline decides what happened from one number per step: zero means proceed, non-zero means stop. Everything you learned about exit statuses now has consequences.

This means the scripts from lessons 02 and 04 are the pipeline's sensors. A script that logs an error and exits 0 reports success, and the pipeline will cheerfully deploy on top of it. A script that exits non-zero because a resource was already in the desired state will fail a green build. Getting the status right in the script is what makes the pipeline trustworthy.

It also means diagnostics must go where the runner captures them. Runners capture standard output and standard error and interleave them into the job log; nothing written to a file on the runner survives the run unless you explicitly publish it. This is why the logging discipline from earlier lessons matters here — the job log is the only account of a run nobody watched.

## Passing work between jobs

Jobs typically run on separate runners with separate filesystems, so anything one job produces and another needs must be published as an **artifact**:

```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: checkout@v4
      - run: ./scripts/build-bundle.sh --out dist/
      - name: Publish bundle
        uses: upload-artifact@v4
        with:
          name: bundle
          path: dist/

  deploy-staging:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: download-artifact@v4
        with:
          name: bundle
```

`needs:` creates the dependency, and it is also what makes jobs without a dependency run in parallel. Publish your reports too — the CSV from the inventory script, the plan output, a dry-run transcript — because an artifact is reviewable after the fact and a log line scrolls.

## Idempotency, re-runs, and getting back

Pipelines get re-run. Someone clicks "re-run failed jobs" after a network blip; a release is re-triggered; two merges land within a minute. So the deployment step must be safe to execute twice, which is the idempotency requirement from lesson 02 arriving in a place where it is no longer optional.

Two more properties are worth building in from the start. **Concurrency control** stops two runs deploying to the same environment simultaneously — every platform has a mechanism, and without it a slow deploy and a fast one can land out of order. And a **way back** matters more than a fast way forward: know, before your first production deploy, whether you recover by re-running the pipeline against the previous commit, by redeploying a stored artifact, or by hand. Write it down. A pipeline with no rollback story is a pipeline that will eventually be rolled back by hand at the worst possible time.

Finally, keep the pipeline honest about time. Set a job timeout so a hung deployment fails instead of blocking the queue for six hours, and make the whole pull-request path fast enough that people wait for it rather than merging around it.

## Practice

Use a repository containing the Bash script from lesson 03 and the Python script from lesson 05. Work on a branch and open a real pull request. Any of the three named platforms is fine — this is where you translate the generic YAML into your chosen one.

1. **Get one job green.** Add a pipeline definition with a single `lint` job triggered on pull requests to `main`: check out the code, install `shellcheck`, and run it over your shell scripts. Push and confirm the run appears on the pull request. Then push a deliberate error, watch it fail, and fix it — you want to have seen red before you trust green.

2. **Add a pinned environment.** Add a `test` job that installs a pinned Python version, installs from `requirements.txt`, and runs your inventory script with `--help`. Nothing should depend on anything preinstalled on the runner.

3. **Split the trigger.** Add `push` to `main` alongside the pull-request trigger, then add a `deploy` job that depends on `lint` and `test` and is conditional on the branch being `main`. For now, make it echo the commit it would deploy. Open a pull request and confirm the deploy job does not run; merge it and confirm it does.

4. **Wire a real secret.** Store a sandbox credential in the platform's secret store, inject it as an environment variable in the deploy job only, and have the job run your Python script in dry-run mode against the sandbox. Confirm the credential is not visible anywhere in the job log or in the repository. Then add a *second*, throwaway secret whose value is a harmless dummy string (never the real credential), deliberately `echo` it, and observe what the runner masks — then echo it reversed or with a character inserted and observe what it does not. Delete the dummy secret afterwards.

5. **Publish an artifact.** Have the deploy job write its dry-run report to a file and upload it as a build artifact. Download it from the run summary and confirm the contents.

6. **Prove the exit-code contract.** Make your script exit non-zero on purpose — an invalid required flag is enough — and confirm the job fails, later jobs are skipped, and the pull request reports the failure. Then make it log an error but exit 0, and confirm the pipeline reports success anyway. Write two sentences on why the second case is more dangerous than the first.

7. **Re-run it.** Re-run the successful deploy job without changing anything. Confirm it succeeds again and leaves the same end state. If it does not, the step is not idempotent — fix the script, not the pipeline.
