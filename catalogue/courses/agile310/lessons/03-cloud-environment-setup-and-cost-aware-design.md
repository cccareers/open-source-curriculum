---
lesson_id: agile310-03
course_id: agile310
pathway: data-engineer
title: Cloud Environment Setup and Cost-Aware Design
order: 3
kind: lesson
competency_ids:
  - D6-S1-C01
  - D6-S1-C02
objectives:
  - Stand up a cloud data environment with sensible cost and access controls
---

## The account you are about to be given

The program hands you a cloud account with a spending limit. It is a real account with real billing behind it, and the limit exists because capstone accounts are where the memorable bills happen — a backfill loop that ran all weekend, a warehouse query scanning a full table hourly, a cluster nobody turned off. None of those are exotic mistakes. They are the normal consequence of building in an environment you have not set up deliberately.

This lesson is the setup. It is short because the work is small: an hour of decisions now buys you a month in which cost and access never become emergencies. The two competencies at stake are deploying and managing a cloud-based data solution — the environment itself, not just the code that runs in it — and choosing between serverless and containerised execution for each step of your workflow.

Everything here is provider-neutral in the naming, because the shapes are the same everywhere: a billing boundary, an identity system, a secrets store, a budget mechanism, a resource-labelling scheme, and at least two ways to run your own code. Your program will fix the provider; translate the names once at the start and the rest follows.

## One project, one boundary

Create a **dedicated project or account scope for the capstone**, separate from anything else you have in the same cloud. Every provider has this container — the thing that owns resources, aggregates their billing, and can be deleted in one action.

Two properties matter and both are about the boundary rather than the contents.

**Billing aggregates at the boundary.** A cost report scoped to your capstone answers "what does this pipeline cost?" without arithmetic. Mix it with other work and you will never get a trustworthy number, and Milestone 3 asks you for a cost figure.

**Deletion is atomic at the boundary.** At the end of the course you delete the container and everything inside it goes with it — including the resource you created at 2 a.m. in week two and forgot. Resources scattered across a shared account are the ones that keep billing.

Inside it, use exactly **one environment**. Real teams run development, staging, and production separately; a forty-hour capstone that tries to do the same spends its hours on plumbing. Use one environment, note it as a non-goal in your design document, and instead get the discipline that matters — every resource created by code that can be re-run.

Pick a **single region** and put everything in it. Cross-region data transfer is billed, often at rates that dwarf the storage itself, and a warehouse in one region reading object storage in another is one of the classic surprise line items. Choose the region nearest your data source or your reviewer, write it down, and never deviate.

## Identity: humans, workloads, and least privilege

There are two kinds of identity in your account and they need different treatment.

**Your human identity** is the account you sign in with. It has broad rights because you are the owner, so use it for administration and setup, not for running the pipeline. If your pipeline uses your personal credentials, you have learned nothing about production identity and your pipeline stops working the moment those credentials rotate.

**Workload identities** are the ones your jobs run as — service accounts, service principals, task roles, depending on the provider. Create one per pipeline stage, not one for everything:

| Identity | Needs | Must not have |
| --- | --- | --- |
| `ingest-runner` | write to the landing prefix; read the source secret | any warehouse write; any read of curated data |
| `transform-runner` | read landing and staging; create and write warehouse tables | write access to landing |
| `orchestrator` | invoke the two job identities; write logs | direct data access of any kind |

That table takes five minutes to write and it is most of what least privilege means in practice. The property worth internalising: **the transform identity cannot corrupt the raw layer**. Your landing zone is the thing you rebuild from when a transformation is wrong, so nothing downstream of it should be able to write to it. Grant write on the landing prefix to the ingest identity and read-only to everything else, and a whole class of unrecoverable mistake becomes impossible.

Give humans read access to everything and write access to as little as you can. Grant permissions to a group or role rather than to individuals, even when the group has one member — when your reviewer needs access in week four, you add them to a group instead of reconstructing a set of grants.

Finally, turn on **object versioning on the landing bucket** if the provider offers it, at least while you are developing. It is cheap at capstone volumes and it turns "I overwrote the raw data" from a restart into an inconvenience.

## Secrets never live in the repository

Your ingestion needs an API key, a database password, or a token. It goes in the provider's secret manager, is granted to exactly the workload identity that needs it, and is read at runtime.

```python
import os
from mycloud import secrets  # provider SDK, name varies

def source_api_key() -> str:
    # The secret NAME is configuration and can be committed.
    # The secret VALUE is fetched at runtime and never written to disk.
    name = os.environ["SOURCE_API_KEY_SECRET"]
    return secrets.access(name)
```

The rules are short and there are no exceptions worth making in a training account:

- Nothing secret in the repository, including in a notebook output cell or a commented-out line. Git remembers deleted lines.
- Nothing secret in a container image. Images get pushed to registries and shared.
- Nothing secret in a log line. Log the secret's *name*, never its value, and be careful with libraries that dump full request headers on error.
- Add a secret scanner to your pre-commit hooks. The five minutes it takes is worth it the one time it fires.

If your dataset needs no credentials at all — many public datasets do not — create one anyway for the exercise, even if it only holds a source base URL. You will need the pattern in the job.

## Budgets, alerts, and the four costs that bite

Set a **budget with alert thresholds before you create your first resource**. Every provider has this; it takes about three minutes. Set alerts at 50, 80, and 100 percent of the program's limit, sent to an address you actually read. A budget alert is not a cost control — it will not stop anything — but it converts a silent problem into a noisy one on the day it starts rather than at the end of the month.

Then know where the money goes. At capstone scale it is almost always one of four things.

**Warehouse query volume.** Most cloud-native warehouses bill either by bytes scanned or by compute time. Both punish the same habit: `SELECT *` against an unpartitioned table, repeatedly, from a scheduled job. This is the single largest avoidable cost in a capstone. Partition your large tables on the date column you filter by, select the columns you need, and check the estimated scan before running anything against the full history.

```sql
-- Scans every partition ever written.
SELECT * FROM fct_trip_daily;

-- Scans one day, and only the columns needed.
SELECT zone_id, trips, cancellations
FROM fct_trip_daily
WHERE trip_date = DATE '2026-03-01';
```

**Idle compute.** Anything that bills per hour while it exists — a cluster, a notebook instance, a managed database — is a meter running whether you are using it or not. If you provision one, put a note in your runbook about turning it off, and prefer options with auto-suspend.

**Egress.** Data leaving the provider's network, or crossing regions, is billed. Storage is cheap; moving it is not. This is why the single-region rule earns its place.

**Retries in a loop.** A failing job that retries forever is a cost bug as much as a reliability bug. Cap retries, use exponential backoff, and give scheduled jobs a maximum runtime so a hung run cannot bill overnight. You will build this properly in Milestone 3; set the ceiling now.

## Labels, so attribution is possible later

Apply a consistent label or tag set to every resource at creation:

```yaml
labels:
  project: capstone
  owner: <your-username>
  stage: ingest      # ingest | transform | orchestrate | serve
  managed_by: iac
```

Cost reports can group by label, which is how you answer "what does the ingestion stage cost per run?" — a question Milestone 3 asks you directly. Retro-fitting labels is tedious and always incomplete, and the resource you forget to label is invariably the expensive one.

## Serverless or container: choosing a shape per step

Your pipeline steps have to run somewhere, and in a modern cloud there are broadly two shapes available to you. Neither is better; they fail differently.

**Serverless functions** are a code handler the platform runs on demand. You bring code and a runtime version; the platform brings everything else. They start fast, cost nothing when idle, and scale out without you asking. In exchange they have a wall-clock timeout, limited memory and temp storage, a runtime you do not fully control, and a difficult story for large native dependencies.

**Containers** are an image you build, run as a task on a managed service. You control the base image, the system libraries, the exact dependency versions, and the runtime length. In exchange you own the image build, a registry, cold-start times measured in tens of seconds, and slightly more configuration.

The decision rule that holds up in practice:

| Step characteristic | Shape |
| --- | --- |
| Event-driven, short (a file landed, a webhook fired) | Serverless function |
| Small, frequent, few dependencies | Serverless function |
| Long-running batch job (minutes to hours) | Container task |
| Heavy or native dependencies, or a specific engine version | Container task |
| The step must run identically on your machine and in the cloud | Container task |
| Pure SQL transformation | Neither — run it in the warehouse |

That last row deserves emphasis. The cheapest compute for a transformation over data already in a warehouse is the warehouse itself. Pulling a hundred million rows out to a container to transform them and writing them back is a real pattern in real capstones and it is nearly always the wrong one. Push the work to where the data already is.

A typical capstone ends up with a small serverless function for API-triggered or event-driven ingestion, one container image for the batch ingestion job, SQL executed in the warehouse for the transformation layer, and a managed scheduler invoking all three. That is a defensible architecture and you can explain every choice with the table above.

A container that runs the same way locally and remotely is worth the effort for the ingestion job specifically, because that is the step you will debug most:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
ENTRYPOINT ["python", "-m", "src.ingest"]
```

Pin the base image tag and pin your dependency versions. An unpinned image that worked in week two and fails in week five, with no change from you, costs an evening and teaches nothing.

## Infrastructure as code, and why week four cares

Create resources with a script or an infrastructure-as-code tool, not by clicking. Even a plain shell script of provider CLI calls counts, as long as it is committed and re-runnable.

```bash
#!/usr/bin/env bash
set -euo pipefail

REGION="${REGION:?set REGION}"
BUCKET="${PROJECT}-landing"

cloud storage buckets create "$BUCKET" \
  --location="$REGION" \
  --uniform-bucket-level-access \
  --labels=project=capstone,stage=ingest,managed_by=iac
```

Three reasons this matters inside forty hours. Your reviewer can see exactly what exists without access to your console. When you break something, you re-run the script instead of reconstructing a week of clicks from memory. And at the end of the course, a create script with a matching teardown script means teardown is one command rather than an archaeology exercise.

Write the teardown script on the same day as the create script, while you still remember what you made. It should delete the whole project or account scope; anything else is guesswork.

## A setup checklist

Before you write pipeline code, all of this should be true:

- A dedicated project or account scope exists, in one named region, for the capstone only.
- A budget exists with alerts at 50, 80, and 100 percent, going to an address you read.
- Three workload identities exist with the narrow grants in the table above, and the raw landing prefix is write-restricted to the ingest identity.
- A landing bucket exists with versioning on and a label set applied.
- At least one secret is stored in the secret manager and readable by exactly one identity.
- A create script and a teardown script are committed and have both been run at least once.
- Your design document names, for every pipeline step, whether it runs serverless, in a container, or in the warehouse, with one line of reasoning.

## Practice

1. **Stand up the environment.** Work through the checklist above in your own account. Commit the create script; run the teardown script once to prove it works, then run create again. A teardown script that has never been executed is a hypothesis.
2. **Break least privilege on purpose.** Using the transform identity's credentials, try to write an object into the raw landing prefix. Capture the permission-denied error and paste it into your design document under the architecture section. Proving a control works is worth more than asserting it exists.
3. **Measure a scan.** Load a few days of your source into a warehouse table without partitioning. Run a single-day aggregate against it and record the bytes scanned or slot time. Recreate the table partitioned on the date column, run the identical query, and record the figure again. Put both numbers in your document — you will reuse them in Milestone 2.
4. **Write the compute-shape table** for your own pipeline: one row per step, with the shape chosen and one line of justification. Where you chose a container, say what specifically stops it being serverless.
5. **Containerise one step.** Build an image for your ingestion job, run it locally against a small slice of the source, then run the same image as a task in the cloud with a workload identity. Note the difference in start-up time; you will care about it when you set orchestration timeouts.
6. **Trigger your own budget alert.** Set a temporary budget of a currency unit or two so the alert fires, confirm the mail arrives, then restore the real threshold. An alert nobody has ever seen arrive is not a control.
