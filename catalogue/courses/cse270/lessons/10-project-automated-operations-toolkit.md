---
lesson_id: cse270-10
course_id: cse270
pathway: cloud-support-engineer
title: 'Project: Automated Operations Toolkit'
order: 10
kind: project
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
  - D4-S1-C03
  - D4-S1-C04
objectives:
  - Combine scripting, pipelines, and infrastructure code into a reusable operations toolkit
---

## The goal

Bring everything in this course into one repository that another engineer could adopt: scripts they can run, infrastructure code the toolkit invokes, a pipeline that deploys it, and automation that runs without anybody watching.

The word doing the work in that sentence is **reusable**. Four things that each work in isolation are what you already have. A toolkit is those four things arranged so that somebody who has never met you can clone the repository, read one document, point it at their own account, and use it — and so that the next automation they add has an obvious place to go.

This is the only assessment in the course that requires all four competencies together, and it is graded on the seams between them as much as on the parts.

Budget four hours. Roughly: one to restructure and document what you have, one on the infrastructure code and the pipeline that invokes it, one on wiring the deployment and the schedules, and one on the evidence. If you spend the first hour writing new automation, you will not finish.

## What you start from

Everything you already built:

- **Lesson 03** — a Bash script that automates one routine task, with a dry run and idempotency.
- **Lesson 05** — a Python script that inventories resources against a policy and remediates.
- **Lesson 07** — a pipeline that lints, builds, tests, and deploys on merge.
- **Lesson 09** — a serverless function on a schedule and a resource event, with a cost argument.
- **From cse203** — the infrastructure code you wrote to provision resources declaratively, in Terraform, CloudFormation, Bicep, or your provider's equivalent.

Nothing in this project asks you to write a new automation from scratch. Every requirement below is about assembly, interfaces, and evidence.

## The infrastructure code, and what is being asked of it

Be clear on the boundary. **You are not authoring a new estate here.** Designing and building infrastructure declaratively was cse203's job. What this capstone asks is the thing that comes after: that your toolkit *invokes* infrastructure code as one of its operations, and that you can make a small, correct, declarative change to it through your pipeline rather than by hand.

Concretely, bring your cse203 definitions into this repository (or a directory in it) and make two things true. First, the toolkit can run the tool's plan and apply steps through a documented entry point, so provisioning is one of the operations the toolkit performs rather than a separate manual ritual. Second, at least one **update** to the existing definitions travels the full path — proposed in a pull request, planned automatically, reviewed by a human, applied by the pipeline.

The update should be small and declarative: a changed parameter, an added tag on existing resources, a new output, an adjusted size, one additional resource of a type already present. A one-line change that goes through the whole path correctly demonstrates the competency better than a large one that gets applied by hand.

If your cse203 work is not available, write the smallest declarative definition that provisions the resources your own automation acts on — a bucket, a tag policy, a role, a scale set. Small is correct here.

## Requirements

### Structure and reuse

**R1 — One repository with a legible layout.** Directories that say what they hold, in the shape of `scripts/`, `functions/`, `infrastructure/`, `pipelines/` or your platform's required location, `docs/`, and `fixtures/`. Every file is in exactly one place, and nothing lives at the root that is not a repository-level file.

**R2 — Every tool takes its target as a parameter.** No account id, project, subscription, region, environment name, resource name, or tag value is hard-coded anywhere — not in the scripts, not in the function, not in the infrastructure code, not in the pipeline. Everything is a flag, a variable, or a parameter file. A reviewer must be able to run every part against their own account by changing configuration, never source.

**R3 — Two environments are configured, not copied.** At least a non-production and a production configuration exist, expressed as two parameter or variable files rather than two copies of the code. The pipeline selects between them. If you only have one real account, the second configuration may point at a different project, prefix, or resource group — but it must be a separate configuration exercised at least once.

**R4 — One consistent interface across the tools.** Every command-line tool in the repository supports `--help` and a dry-run flag, uses the same flag name for the same concept, logs to standard error with timestamps and levels, and uses the same exit-code scheme. Document the scheme once in `docs/` and make every tool obey it. Inconsistency here is the single clearest signal that a repository is a pile rather than a toolkit.

**R5 — Safety properties hold everywhere.** Every script begins with `set -euo pipefail`; every Python entry point returns an exit status from `main`; every mutating operation is idempotent and available in dry-run mode; every destructive operation names what it will act on before it acts.

### Automation and quality

**R6 — Static analysis covers everything.** `shellcheck` over all shell, a Python linter over all Python, and the infrastructure tool's own validate or format check over the definitions. All three run in the pipeline and all three pass on the final state of the repository.

**R7 — A pipeline with distinct, named stages.** Minimum: lint, build, test, infrastructure plan, deploy to non-production, approval, deploy to production. Each stage's guarantee is documented in one sentence. Stages that guarantee nothing are removed.

**R8 — The infrastructure plan runs automatically on every pull request.** The plan output is published as an artifact and is readable by a reviewer before the change is merged. A plan that fails blocks the merge path.

**R9 — Applying infrastructure requires a human approval.** The apply step runs only after an explicit approval gate, only on the default branch, and only against one environment per run. Show the recorded approval on a real run.

**R10 — Deployment is branch-conditional and artifact-based.** Nothing deploys from a pull-request run. The deploy stages consume the artifact the build stage published rather than re-deriving it, and the deployed artifact identifies its source commit.

**R11 — The pipeline deploys the serverless function.** The function from lesson 09 is deployed by the pipeline, not by hand. Its schedules, event trigger, environment variables, timeout, memory, and identity all come from committed configuration.

**R12 — Every credential is scoped and stored properly.** No secret in the repository or in any log. Each stage receives only the credentials it needs, and the production credential is unreadable by any stage that does not deploy to production. Name the scoping mechanism in the documentation.

**R13 — A failure at any stage stops the path.** Demonstrate with at least two failure classes — one code failure and one infrastructure-plan failure — showing downstream stages skipped and nothing reaching the target.

### Operation

**R14 — The scheduled and event-driven automation runs from the deployed configuration.** After a pipeline deployment, the schedules fire and the event trigger fires, and their invocation logs show the configuration the pipeline set. This is the proof that the deployment path and the running automation are actually connected.

**R15 — The whole toolkit is idempotent.** Every part can be run twice safely: the scripts, the function, the pipeline, and the infrastructure apply. Demonstrate a repeat run of each and show that the second reports no change.

**R16 — A cost statement for the automation.** One page: what the toolkit costs to run per month, what it saves, and the arithmetic. Include the scheduled scale-down saving from lesson 09, the function's invocation cost, and the pipeline's build minutes. State whether the toolkit pays for itself and be honest if it does not — a small saving with a clear method is a better answer than an inflated one.

**R17 — A capacity paragraph.** For one workload the toolkit touches, state whether it should be served by serverless, by an autoscaled fleet, or by fixed capacity, and why — grounded in that workload's actual demand shape, not in general principles.

### Documentation

**R18 — A README that gets a stranger running in fifteen minutes.** What the toolkit does; the prerequisites; how to configure it for their account; the exact command to run each tool in dry-run mode; and where to look when something fails. Ten steps or fewer to a first successful dry run.

**R19 — A runbook per operation, in `docs/`.** One short document per automation: what it does, when it runs, what it changes, how to run it manually, how to disable it in a hurry, what its failure looks like, and who to tell. A person on call at two in the morning must be able to act from it.

**R20 — An architecture document with one diagram.** How a change travels from a commit to a deployed effect, and how an event travels from a resource change to an action. A committed diagram file or a described sequence in text is fine; a description that requires you to be present to explain it is not.

**R21 — An adoption guide.** The section that makes this a toolkit rather than your project: what someone must change to use it in a different account, what assumptions are baked in, what would need to be generalised next, and how to add a new automation so that it fits the conventions in R4. Half a page, written to someone who is not you.

## Constraints

- **Assemble, do not invent.** The scripts, function, pipeline, and infrastructure code come from earlier work in this course and cse203. Writing a fifth automation is out of scope and will cost you the requirements that are graded.
- **One repository.** Everything in it, with a real commit history showing the work.
- **Non-production targets for anything destructive.** "Production" in R3 and R9 may be a separate project or resource group. Nothing in this toolkit deletes a resource it did not create.
- **No new provider services.** Use what the course has covered. Adding a message bus, a container platform, or a configuration-management tool to look impressive will cost you time and earn nothing.
- **No monitoring or alerting product.** Logs and the platform's own records are the observability surface. Dashboards, alert routing, and on-call integration belong to cse220. The toolkit may emit toward them; it does not configure them.
- **No application code.** No web service, no user interface, no packaging for distribution. This is operational glue throughout.
- **Bash and Python only** for the scripts and the function.
- **No secret in git history, ever.** If one is committed, rotate it, clean the history, and record what happened.
- **Free tier or existing allocation only.**

## Definition of done

A reviewer with only your repository URL, read access to your pipeline history, and their own cloud account can confirm every item below.

**Structure**

- The repository layout matches R1 and every file is where the layout says it should be.
- A search for account ids, project names, regions, and resource names finds none of them in source.
- Two environment configurations exist, differing only in values, and both have been used.
- Every tool answers `--help`, supports a dry run, and follows one documented exit-code scheme.

**Quality**

- `shellcheck`, the Python linter, and the infrastructure validate step all run in the pipeline and all pass.
- Every shell script has `set -euo pipefail`; every Python entry point returns a status from `main`.

**Pipeline**

- The run history shows the named stages from R7, with a documented guarantee for each.
- A pull-request run publishes a readable infrastructure plan artifact and deploys nothing.
- A main-branch run deploys to non-production, pauses for a recorded approval, and then applies to production.
- The deployed artifact identifies its source commit.
- Two failed runs exist, one per failure class in R13, each showing downstream stages skipped.
- No credential appears in the repository, in any artifact, or in any job log.

**Operation**

- The serverless function was deployed by the pipeline, and its configuration in the console matches the committed configuration.
- A schedule fired on its own after that deployment, and its log shows the pipeline-set configuration.
- A resource change triggered an invocation naming that resource id.
- The infrastructure update travelled the full path: pull request, plan, approval, apply — with links to each.
- A repeat run of each script, the function, the pipeline, and the infrastructure apply reports no change.

**Documentation**

- A reviewer following the README reaches a successful dry run in fifteen minutes without asking you anything.
- Every automation has a runbook containing all seven items in R19.
- The architecture document shows both the commit path and the event path.
- The adoption guide states what must change for a different account and how to add a new automation.
- The cost statement shows its arithmetic and cites its rate source.
- The capacity paragraph reasons about one specific workload.

## How you will be assessed

Four competencies are observed here, and they are marked separately.

**Automating a cloud task with a correct script.** Graded from the scripts and the function: correctness, quoting and error handling, idempotency, dry runs, and whether the interfaces are consistent enough that knowing one tool tells you how to use the next.

**Defining and updating infrastructure declaratively.** Graded almost entirely from the infrastructure change that travelled the full path. A reviewer will read the pull request, the published plan, the approval, and the applied result, and check that the change was made in the definitions rather than in the console. A toolkit that provisions by clicking and merely stores some definitions alongside does not meet this.

**Building a working CI/CD pipeline.** Graded from the run history, with the weight on the boundaries: what a pull-request run does versus a main-branch run, what happens when a stage fails, whether the approval gate is real, and whether the artifact travelled rather than being rebuilt.

**Applying autoscaling and serverless to fit demand and cost.** Graded from the deployed automation running unattended, plus R16 and R17. The numbers must be real and the capacity reasoning must be about your workload.

Above all four sits the thing the capstone exists to test: whether this is a **toolkit** or a **portfolio**. The difference is visible in about five minutes. A toolkit has one convention applied everywhere, configuration separated from code, and documentation written for a stranger. A portfolio has four folders, four styles, three different flag names for the same idea, and a README that says "see the individual lessons". A reviewer will attempt to use your repository against their own account, and how far they get before they have to ask you a question is most of your grade.

Expect two review questions your documentation does not answer. Something like: which stage would have caught the failure you had last week, or what a colleague would have to change first to run this in a region you have never used.

## Hints

**Spend the first thirty minutes on the interface, not the code.** Decide the flag names, the exit codes, and the log format, write them in `docs/`, and then make the existing tools conform. Doing this last means touching every file twice.

**Move the hard-coded values out first.** Grep your own repository for your account id, your project name, and your region before you do anything else. That grep is also what a reviewer runs, so run it first.

**One configuration file per environment, loaded the same way everywhere.** The moment the script reads configuration differently from the function, R4 is gone and the toolkit gets a seam somebody will fall into.

**Get the plan artifact working before the apply.** A published plan on a pull request is the highest-value part of the infrastructure requirement and the easiest to demonstrate. Apply is downstream of it in both senses.

**Make the infrastructure change genuinely small.** A tag, a size, an output. R8 and R9 are about the path, and a large change makes the path harder to see and the plan harder to review.

**Approval gates need configuring before you can demonstrate one.** On most platforms it is an environment protection setting rather than a line of YAML. Find it early; discovering it at hour three is a bad surprise.

**Deploy the function from the pipeline before you rely on its schedule.** R14 is about the connection between the two, and a function deployed by hand that happens to have the right configuration does not demonstrate it.

**Write the runbooks while you build, not at the end.** The failure modes you hit today are the ones that belong in the runbook, and they are gone from memory by tomorrow.

**Keep the failed runs.** R13's evidence is your red history. Reproducing a failure on purpose later takes longer than leaving the original.

**Ask someone to run your README.** Fifteen minutes of a peer's time will find more documentation defects than an hour of your own reading, because you cannot un-know your own conventions.

**When the four-hour budget bites, cut features, not evidence.** A toolkit with three automations, a complete path, and full documentation scores far better than five automations with no plan artifact, no approval, and a thin README.

## What to hand in

1. The repository URL, with the layout, both environment configurations, all documentation, and a real commit history.
2. A link to the pull request containing the infrastructure change, with the published plan artifact attached to it.
3. A link to the main-branch run that deployed it, showing the recorded approval and the applied result.
4. Links to two failed runs, one per failure class in R13.
5. The invocation logs showing a schedule firing and an event firing after the pipeline deployment, with the configuration the pipeline set visible in them.
6. The repeat-run evidence for R15: one transcript or run link per component showing no change on the second run.
7. The cost statement and the capacity paragraph.
8. A note naming the one thing you would generalise next, and why you did not do it now.
