---
lesson_id: cse203-08
course_id: cse203
pathway: cloud-support-engineer
title: 'Project: Deploy a Multi-Tier Environment from Code'
order: 8
kind: project
competency_ids:
  - D1-S1-C02
  - D2-S1-C02
  - D4-S1-C02
objectives:
  - Deploy a multi-tier environment for a customer entirely from version-controlled code
---

## The goal

A customer has an application. You are going to deploy it into a cloud environment that you can destroy completely and rebuild from a git repository, and then hand the whole thing over to somebody who was not in the room.

That is the deliverable, and the phrase carrying all the weight is *entirely from code*. A reviewer will clone your repository into an empty account, run your documented commands, and expect a working application at a URL. Nothing you fixed by hand exists in that account. Nothing you configured in a console survives. If a step only worked because you clicked something, the rebuild fails and so does the project.

The second half of the deliverable is the customer. You are not shipping infrastructure into a vacuum; you are assisting somebody with a working deployment of *their* application, and they will ask you what it costs, whether their data is safe, what happens when it breaks, and how they change something next month. A perfect environment with no handover is an unfinished job, and the handover is graded as heavily as the infrastructure.

Budget about two hours of focused work. That is deliberately tight, and it is achievable because most of the code already exists: lesson 06 gave you the network, the compute, and the storage as Terraform, and lesson 07 gave you the scaling. This project is the assembly, the proof, and the handover — not a fresh start.

## The customer scenario

Treat this as a ticket that landed on your queue.

> **Riverside Community Trust — request for deployment assistance**
>
> We have a small internal web application our staff use to log and track equipment loans. It is a standard web application that listens on port 8080, serves HTML pages to staff, and stores its records in a PostgreSQL database. Staff upload a photo of the equipment with each loan record; at the moment those photos are saved into a folder on the server, which we understand is a problem.
>
> Right now it runs on one machine under a desk in our office. We need it in the cloud. About 30 staff use it, mostly between 8 a.m. and 6 p.m. on weekdays, with a busy hour on Monday mornings. It must not be reachable from the public internet by anybody who is not our staff — we will supply the address range our office uses. Our board has asked what this will cost per month and what happens if it breaks. We have nobody technical on staff, so whatever you build, somebody else has to be able to run it after you have gone.

You may substitute any small web application you can actually run — one from an earlier course, an off-the-shelf container image, or a twenty-line placeholder that serves a page and writes a row to a database. The application is not what is being assessed. What is being assessed is the environment it runs in, the code that produces it, and the handover that goes with it.

## What you start from

The Terraform project you built in lesson 06 and extended in lesson 07: a VPC with public and private subnets across two availability zones, route tables and gateways, tier-scoped security groups, a launch template and autoscaling group, an object storage bucket with a lifecycle policy, and remote state with locking.

Reuse it. Rewriting from scratch is not evidence of anything and will eat your two hours.

## Requirements

Numbered so a reviewer can grade them one at a time. Each states what must be true, not how to type it.

**R1 — Everything is declared in Terraform.** Every resource in the deployment is created by `terraform apply`. No resource is created, configured, or repaired through a console or a one-off CLI command. `terraform plan` on the final committed code, against the deployed environment, reports no changes.

**R2 — The repository is the source of truth.** A git repository with real commit history containing all `.tf` files, `.terraform.lock.hcl`, the boot configuration, a `.tfvars` per environment, and a `.gitignore` that excludes state files, `.terraform/`, and any file containing a secret. No credential, password, key, or connection string appears anywhere in the repository or its history.

**R3 — Remote state, shared and locked.** State is held in a remote backend with locking and encryption at rest, keyed per environment. The state file is not in the repository.

**R4 — Three tiers, correctly placed.** A public entry point in the public subnets; the application tier in private subnets with no public addresses; the database in private or isolated subnets with no public endpoint. All three tiers span two availability zones.

**R5 — Security groups reference groups, not ranges.** Every rule permitting traffic between your own tiers uses another security group as its source. CIDR ranges appear only where traffic crosses a boundary you do not control — the customer's office range reaching the entry point, and nothing else. No rule permits `0.0.0.0/0` on any port. Every rule carries a description.

**R6 — The application tier is an autoscaling group.** Built from a launch template, spread across both zones, with a minimum of two instances, a maximum you can justify, a load-balancer health check, and a grace period derived from a measured boot-to-healthy time. Instance sizing is justified in writing against the stated workload.

**R7 — Instances are disposable.** No state of any kind lives on an application instance. Uploaded photos go to the object storage bucket; records go to the managed database; configuration arrives from the launch template and boot script. Terminating any instance loses nothing.

**R8 — A managed database, not a self-installed one.** Provisioned by Terraform in the private tier, with automated backups enabled and a stated retention, point-in-time recovery on, and a `lifecycle` block preventing accidental destruction.

**R9 — Object storage with a lifecycle policy.** A bucket for the uploaded photos, with public access blocked, versioning enabled, and a lifecycle policy whose ages you can justify against the customer's stated usage.

**R10 — No secrets on disk, ever.** The database credential lives in the provider's secrets manager. The application reads it at runtime using an instance role. No password is in the repository, in a `.tfvars` file, in a boot script, in an environment variable set by hand, or in your shell history.

**R11 — Access is restricted as the customer asked.** The application is reachable from the customer's stated office range and not from anywhere else. Use `203.0.113.0/24` as the office range for this exercise. Demonstrate both halves: reachable from a permitted source, and not reachable from an unpermitted one.

**R12 — The environment is parameterised.** The same configuration builds a `dev` and a `prod` environment differing only in the values supplied. At minimum, environment name, region, VPC CIDR, availability zones, instance type, and capacity bounds are variables. Every resource carries a common tag set including owner, environment, and a marker that it is Terraform-managed.

**R13 — The rebuild is proven, not asserted.** You must actually run `terraform destroy` and then `terraform apply` from the committed code, and end with a working application. Record the wall-clock time each took and any manual step you discovered was required. Discovering one is expected the first time; leaving it undocumented is the failure.

**R14 — A customer handover document exists.** `HANDOVER.md` in the repository, specified in its own section below. This is where the customer-assistance competency is graded.

## Constraints

- **Terraform only.** No shell scripts that call the cloud CLI to create resources, no console repairs, no "I will just fix that one thing manually". Boot-time configuration inside a machine via cloud-init is fine and expected; creating cloud resources any other way is not.
- **One cloud provider, your choice.** Do not attempt a multi-cloud deployment.
- **Stay inside your allocated account and any free-tier limits you have been given.** Where a required component has no free tier — a NAT gateway and a load balancer usually do not — build it, prove it, record the cost, and destroy it promptly. Leaving it running over a weekend is a real bill.
- **No CI/CD pipeline.** `terraform apply` is run by you, from a reviewed branch, at a keyboard. Pipeline configuration is cse270's work and earns no credit here.
- **No monitoring or alerting stack.** Use the metrics the platform gives you for the sizing and health-check decisions, and stop there. Dashboards, alert routing, and log aggregation belong to cse220.
- **No traffic analysis or firewall policy design beyond security groups.** Subnet-level ACLs stay at their defaults unless you can state a specific requirement. Encryption and firewall policy are cse280's territory.
- **No schema design or query work.** Provision the database, connect to it, prove the backup and restore path. What is inside it is not assessed.
- **Two hours.** If you are ninety minutes in and the network will not come up, go to the hints, then ask for help. Being stuck on a provider quirk is not a test of anything.

## Definition of done

Every statement below must be true and independently checkable by a reviewer holding only your repository URL and access to a clean account.

- `git clone`, supply variables, `terraform init`, `terraform apply` produces a working environment with no manual steps beyond those documented in `HANDOVER.md`.
- The application answers over HTTP from the permitted source range and returns a page a staff member could use.
- A request from outside the permitted range fails, with the failure mode recorded.
- Application instances have no public addresses; the database has no public endpoint; nothing is open to `0.0.0.0/0`.
- At least two application instances are running, in two different availability zones, registered healthy behind the entry point.
- Terminating one application instance by hand results in an automatic replacement, with the service available throughout. The recovery time is recorded.
- A photo uploaded through the application lands in object storage, not on an instance's disk, and is still retrievable after every instance has been replaced.
- The database has automated backups with a stated retention, point-in-time recovery enabled, and destruction protection in code.
- The bucket has public access blocked, versioning on, and a lifecycle policy with justified ages.
- No secret exists in the repository, its history, any `.tfvars`, any boot script, or state committed anywhere. The application obtains its database credential from the secrets manager at runtime.
- `terraform plan` against the deployed environment reports no changes.
- `terraform destroy` followed by `terraform apply` reproduces the working environment. Both timings are recorded.
- After the final `terraform destroy`, an account audit shows no surviving volumes, snapshots, reserved addresses, load balancers, or buckets that you did not deliberately retain.
- `HANDOVER.md` contains all nine items listed below.
- A sizing and cost note exists, with arithmetic.

## The handover document

`HANDOVER.md` is a real deliverable and it is where a reviewer marks whether you can assist a customer rather than merely operate a cloud. Write it for the Riverside Community Trust's office manager and for the contractor who will pick this up in six months. Assume the reader is competent and not technical.

It must contain:

1. **What was deployed**, in plain language, with a simple diagram. Three tiers, what each does, and where the customer's data lives. No provider jargon that is not immediately explained.
2. **How to rebuild it**, exactly: prerequisites, the commands in order, the variables that must be supplied, and how long it takes. Someone must be able to follow this without you.
3. **The monthly cost**, itemised by component, with the arithmetic shown and the assumptions stated. Include what is fixed regardless of traffic — the NAT gateway and the load balancer are usually the surprises — and give a figure for the environment running continuously and a figure with the non-production schedule applied.
4. **The sizing decision**, tying the instance type and the capacity bounds to the customer's stated 30 staff, weekday hours, and Monday peak.
5. **What happens when it breaks.** Be specific and honest: one instance fails, one availability zone fails, the database fails over, the whole region fails. For each, what recovers automatically, what needs a human, and roughly how long the customer is affected.
6. **The data guarantees.** Where each kind of data lives, how it is backed up, how far back a restore can go, how long a restore takes, and what is *not* protected. Name the durability and availability figures your provider publishes and say what they do not cover.
7. **How to make a change**, including the plan-review rule: what a plan showing a replacement or a destroy means, and which changes must never be approved without asking somebody.
8. **The access model.** Who can reach the application and from where, how an administrator reaches an instance, where the database credential lives, and what to do if it must be rotated.
9. **Known limits and what you would do next** with more time or budget. Being honest here is worth more than pretending the deployment is finished. If you have no disaster recovery beyond backups, say so.

Keep it under three pages. A handover nobody finishes reading is not a handover.

## How you will be assessed

Three competencies are observed, and they are marked separately.

**Assisting a customer to deploy an application in a cloud environment.** Graded largely from `HANDOVER.md` and from whether the environment actually serves the customer's stated need — the access restriction they asked for, the cost answer their board asked for, the "what if it breaks" answer, and whether a non-technical reader can act on your document. A technically excellent environment with a handover full of unexplained provider terminology fails this one.

**Provisioning and managing the right compute abstraction.** Graded from R6 and R7 and from your written sizing justification: whether the instance type follows from the stated workload, whether the capacity bounds are defensible, whether the grace period came from a measurement rather than a default, and whether the tier is genuinely disposable. The reviewer will terminate an instance and watch what happens.

**Defining and updating infrastructure declaratively.** Graded from the repository and from R1, R3, R12, and R13. The reviewer will read your code for parameterisation, for security groups referencing groups rather than ranges, for pinned versions, and for secrets. Then they will run `plan` and expect silence, and check that your destroy-and-rebuild evidence is real. A single resource that exists in the account but not in the code fails this competency regardless of how well the application runs.

Expect a question in review that you cannot answer by reading your own document aloud. Something like: which single component, if it failed, would take the whole application down; or what your plan would show if a colleague widened a security group in the console last night.

## Hints

**Build it in the order you learned it.** Network, then security groups, then storage and database, then compute, then scaling. Apply after each stage. A single first apply of forty resources that fails halfway is miserable to debug.

**Get one instance serving a page before you touch the autoscaling group.** Prove the boot script, the security group path, and the application start-up while there is exactly one machine to look at.

**The application will not start on the first autoscaling attempt.** It is almost always one of three things: the boot script failed silently, the instance role lacks permission to read the secret, or the health check is hitting a path the application does not serve. Check the cloud-init log on the instance first.

**Health check grace period is the most common expensive mistake.** Time an actual boot-to-healthy cycle with a stopwatch and add a comfortable margin. Too short and the group kills instances mid-boot forever.

**A private-subnet instance with no NAT route cannot download anything.** If your boot script hangs installing packages, that is why.

**Timeout means blocked, refused means arrived.** Use the diagnostic ladder from lesson 03 rather than changing things at random.

**Put `prevent_destroy` on the database before you run your first destroy**, not after. Also set the flag that skips the final snapshot deliberately, one way or the other, and know which you chose.

**Destroy will fail on a non-empty bucket** unless you have said what should happen. Decide, in code, whether teardown empties it — and think about whether that is what you want on a bucket holding a customer's photos.

**Run `terraform plan` immediately after every apply.** It should be empty. If it is not, something in your configuration does not match what the provider actually created, and that discrepancy will only get worse.

**Write `HANDOVER.md` as you build, not at the end.** The cost you looked up, the setting you had to change, the error that cost you twenty minutes — all of it is gone an hour later, and reconstructing it is how a handover turns vague.

**Destroy before you stop for the day.** Your code rebuilds it in minutes. That is the entire point, and the NAT gateway does not care that you went home.

## What to hand in

1. The repository URL, with `HANDOVER.md`, all Terraform code, `.terraform.lock.hcl`, and real commit history.
2. Evidence the application served a request from the permitted range, and evidence a request from outside it did not.
3. The instance-termination test: what you terminated, the recovery timeline, and proof the service stayed available.
4. The upload test: a photo in object storage, retrievable after instance replacement.
5. The database evidence: backup settings, and the result of a point-in-time restore test.
6. The `terraform plan` output showing no changes against the deployed environment.
7. The destroy-and-rebuild evidence with both timings and any manual step you found.
8. The final teardown audit listing what survived.
9. The sizing and cost note with its arithmetic.
