---
lesson_id: cse203-05
course_id: cse203
pathway: cloud-support-engineer
title: Infrastructure as Code Principles
order: 5
kind: lesson
competency_ids:
  - D4-S1-C02
objectives:
  - Explain the principles that make infrastructure declarative, reproducible, and reviewable
---

## What is wrong with what you have been doing

Over the last three lessons you built a real environment: instances sized against a workload, a VPC with public and private subnets across two zones, security groups scoped by tier, a bucket with a lifecycle policy, a managed database with backups. It works. It is also, in a specific and important sense, unusable.

Ask yourself six questions about it.

**Can you build it again?** Not something like it — *it*, with the same CIDR blocks, the same rules, the same lifecycle ages. From memory, in the same order, without missing the setting you changed on the third attempt. Probably not, and the fact that you were taking notes is the tell: you were manually maintaining a record because the system does not keep one.

**Can somebody else build it?** The tacit knowledge is in your head. A colleague following your notes will produce something similar, and the differences will be invisible until one of them causes an incident.

**Can you tell what changed last Tuesday?** Cloud audit logs will tell you that an API call was made, by whom. They will not give you a readable before-and-after of your environment's shape, and nobody reads them proactively.

**Could anyone have reviewed the change before it happened?** A change made in a console has no artefact to review. It is proposed and executed in the same click. Every other part of the profession — application code, database migrations, network changes — treats "somebody else looks at this first" as basic hygiene, and console changes escape it entirely.

**Is production the same as staging?** Almost certainly not. Two environments built by hand at different times by different people always drift apart, and the differences surface as the worst kind of bug: it works in staging.

**Can you delete it cleanly?** You already found out in the practice sections that you cannot, quite. Orphaned volumes, snapshots, and reserved addresses survive because nothing holds the full list of what belongs to this environment.

Every one of those is the same problem wearing a different hat: **the environment exists, but no description of it exists.** Infrastructure as code is the practice of writing the description first and letting a tool make reality match. Everything else in this lesson follows from that one move.

## Declarative and imperative

There are two ways to describe a piece of infrastructure and the difference decides most of what follows.

**Imperative** means listing the steps. A shell script that calls the provider's CLI is imperative:

```bash
aws ec2 create-vpc --cidr-block 10.42.0.0/16
aws ec2 create-subnet --vpc-id vpc-abc --cidr-block 10.42.1.0/24
aws ec2 run-instances --image-id ami-123 --instance-type t3.small --subnet-id subnet-xyz
```

This is a genuine improvement on clicking — it is written down, it can be committed, and somebody can read it. But it answers the question "what do I do?" rather than "what should exist?", and that limitation is fatal in three ways. Run it twice and you get two VPCs, because it has no notion of "already done". Run it after somebody has changed one setting by hand and it neither notices nor corrects. And to *change* something you must write a second script of update commands, which means the repository accumulates a history of edits rather than a statement of the current shape. Reading fourteen scripts in order to work out what exists is not meaningfully better than reading the console.

**Declarative** means describing the end state and letting the tool work out the steps. Lesson 06 teaches this language properly; for now, read it as an illustration of the shape:

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "ticketing-prod"
    env  = "prod"
  }
}
```

Nothing there is an instruction. It is a statement: a VPC with this range and these tags should exist. The tool compares that statement to reality and decides for itself whether to create it, change it, or leave it alone. Ask for the same thing twice and the second run does nothing, because the desired state is already true.

That property is **idempotence**, and it is the reason declarative tools can be run safely and repeatedly. An idempotent operation has the same result whether it runs once or a hundred times. `mkdir -p` is idempotent; `mkdir` is not. Applying a declarative configuration is idempotent by construction, which is what makes "run it again" a reasonable response to almost any uncertainty — and "run it again" is not a reasonable response to an imperative script.

The second consequence of describing end state is that **the file is always a complete, current description**. To change the instance type you edit the line that says the instance type. There is no changelog of commands to replay; there is one document that says what should be true now, and git holds every previous version of it. That is what makes a configuration readable by somebody joining the team on Monday.

## The properties you get

Six practical properties fall out of writing infrastructure down declaratively, and being able to name them is the point of this lesson.

**Reproducibility.** The same configuration produces the same infrastructure, in a new region, a new account, or after a total loss. Disaster recovery stops being a document describing what somebody would do and becomes a command somebody runs. Building an identical copy for a second customer becomes an afternoon.

**Reviewability.** A change to infrastructure becomes a diff in a pull request. Somebody else reads "this security group rule is changing from the load balancer's group to `0.0.0.0/0`" *before* it is true, and says no. This is the property teams underestimate most and value most once they have it, because the review catches the class of mistake that no amount of care prevents.

**Version control.** Every state the environment has ever been in is a commit, with an author, a timestamp, and a message. "When did the database become publicly accessible, and who did it" changes from a forensic exercise into `git log`.

**Drift detection.** Because the tool knows what should exist, it can tell you when reality disagrees. This is the property with no manual equivalent at all — there is no way to ask a console "is anything different from how it was designed?"

**Disposability.** A described environment can be destroyed completely and rebuilt on demand, because the description includes everything that belongs to it. Ephemeral test environments, per-branch review environments, and honest cost control all depend on it, and so does the orphan problem from lessons 02 through 04.

**Documentation that cannot rot.** Architecture diagrams and wiki pages describe the past. The configuration describes the present, because if it did not, the infrastructure would not match it. It is the only documentation with a mechanism forcing it to stay true.

## State: the tool's record of what it made

A declarative tool needs to answer a question every time it runs: *of the things I could create, which ones have I already created?* Without an answer it cannot distinguish "this resource does not exist yet" from "this resource exists and needs a change" from "this resource used to be in the configuration and should now be deleted".

Some tools ask the cloud, because the cloud keeps the record for them — this is how AWS CloudFormation and Azure Bicep work, with the provider tracking a deployment on its own side. Terraform, being provider-agnostic, keeps its own record: a **state file** mapping each resource in your configuration to the real identifier of the thing it created.

You will meet the mechanics in lesson 06. The principle to take now is that **state is what turns a description into a managed resource**. Three consequences follow and they are all operational:

- **State is authoritative and losing it hurts.** With no state, the tool believes nothing exists and will happily create a second copy of everything.
- **State must be shared.** If two engineers each hold a private copy, they will each believe they own the environment and will overwrite one another. Shared, locked, remote state is not an optimisation; it is what makes the tool usable by more than one person.
- **State can contain sensitive values.** Anything the provider returns — including generated passwords — may be recorded in it. State is treated as a secret, stored encrypted, and never committed to the repository.

Removing a resource block from your configuration means the tool sees a resource in state that is no longer desired, and it will **destroy** it. That is the correct behaviour and it is also how people delete production databases. Deleting a block is a destructive act; the plan step is what makes it a visible one.

## The plan step, and why it is the review artefact

The workflow of every declarative infrastructure tool has the same three phases, whatever they are called: read the configuration, compare it against what exists, and propose a set of changes — then, separately, execute them.

That middle output is a **plan**: a list saying what will be created, what will be changed, what will be replaced, and what will be destroyed. It is generated before anything happens, it can be produced by someone with read-only access, and it is the single most valuable artefact in the practice.

Four distinctions in a plan are worth learning to read now, before you meet the syntax.

**Create** is the safe one. **Change in place** modifies an attribute of an existing resource — adding a tag, widening a security group — without disturbing it. **Replace** means the attribute you changed cannot be modified on a live resource, so the tool will destroy the existing one and create a new one. That is the line to stop at. Changing an availability zone, a subnet, or in many cases the base image forces replacement, and a replaced database or a replaced volume is a data-loss event unless you have planned for it. **Destroy** is what happens to anything removed from the configuration.

The discipline is simple to state and requires actual professional nerve to hold: **read the plan before every apply, and never approve one containing a replace or destroy you cannot explain.** A plan that says "3 to add, 0 to change, 0 to destroy" on a change you believed was a tag edit means your understanding and the tool's do not match, and the tool is right.

This is also what makes the pull request meaningful. A reviewer reading a diff sees the intent; a reviewer reading the attached plan sees the consequence. Mature teams post the plan into the pull request automatically and treat it as part of the change.

## Drift, and what you do about it

**Drift** is any difference between what the configuration declares and what is actually running. It happens for ordinary reasons: somebody fixed an outage at 2 a.m. through the console, a provider changed a default, another tool modified a tag, or a resource was created by hand and never adopted.

Drift is detected by running the tool and reading the plan on unchanged configuration. If the plan is empty, reality matches the declaration. If it is not, something has changed underneath you, and the plan tells you exactly what.

You then choose between three responses, and choosing well is the judgement being taught:

1. **Re-apply.** The manual change was wrong or temporary; let the tool put things back. Correct for a security group somebody widened during troubleshooting.
2. **Amend the code.** The manual change was right and should become permanent. Update the configuration to match reality, get it reviewed, and apply so the two agree. Correct for the 2 a.m. fix that genuinely solved the problem.
3. **Import.** The resource is real and useful but was never managed. Bring it into state so future plans account for it. Correct when adopting an environment somebody built by hand — which is most real adoptions.

What you must not do is leave it. Unreconciled drift compounds silently, and the moment it hurts is always the moment someone applies an unrelated change and the tool "helpfully" reverts a fix nobody documented.

The cultural counterpart is the rule that makes all of this hold: **once an environment is managed by code, changes to it are made in code.** Console access to a managed production environment should be read-only for everyday work, with a break-glass path for emergencies that comes with an obligation to reconcile afterwards. A team that allows casual console edits to a code-managed environment gets the costs of both approaches and the benefits of neither.

## What does not belong in the code

Three things, and each has a correct home.

**Secrets.** Passwords, API keys, and certificates never go in the repository, in plain text or in a comment or in a variables file that somebody will commit by accident. They live in the provider's secrets manager, and the configuration references them. Anything committed to git is permanent — rotating a leaked secret is the only real remedy, and cleaning history is a consolation prize.

**Application data.** Infrastructure code creates the database; it does not contain its rows. Nothing in the code should be capable of being the only copy of a customer's data.

**Anything that changes per environment.** Region, instance size, CIDR range, and environment name are inputs, not literals. The same configuration should build development, staging, and production, differing only in the values it is given. That is what makes staging a real rehearsal for production instead of a different system with a similar name.

## The tool landscape, briefly

You are learning **Terraform**, because it is provider-agnostic, is the most widely used tool in the field, and teaches the concepts in their general form. Two adjacent names deserve one sentence each so you recognise them: **AWS CloudFormation** is AWS's own declarative service with state managed by AWS, and **Azure Bicep** is Microsoft's domain-specific language over Azure Resource Manager templates. Both do the same job for a single provider. Neither is taught in this course.

One distinction is worth more than the tool names. **Provisioning** tools create and manage cloud resources — the machine, the network, the database. **Configuration management** tools such as Ansible, Chef, and Puppet configure the inside of a machine once it exists — packages, files, services. They overlap at the edges and they answer different questions, and the modern default is to provision declaratively and keep the inside of the machine as simple as possible, ideally baked into an image so there is nothing left to configure. The cloud-init file you wrote in lesson 02 is the small, sane end of that spectrum.

Also worth naming so you do not mistake it for this: **continuous integration and deployment** is the automation that decides *when* infrastructure code runs, who approves it, and how it reaches production. That is a real and necessary layer, and it belongs to cse270. This course stops at a human running the tool from a reviewed branch.

## Practice

No new infrastructure in this lesson. The work is to demonstrate the gap that infrastructure as code exists to close, using the environment you built by hand in lessons 02 through 04.

1. **Write the inventory.** Produce a complete list of every resource you created in the previous three practice sections: VPC, subnets, route tables, gateways, security groups and every rule, instances, volumes, snapshots, images, buckets, lifecycle rules, the database, and anything else. For each, record its identifier and every setting you deliberately chose. Do it from your notes first, then check against the console and mark every item you missed. The count of things you missed is the finding.
2. **Estimate the rebuild.** Write down, honestly, how long it would take you to rebuild that environment from scratch and get it working, and list three settings you are not confident you could reproduce exactly.
3. **Find the drift.** Compare your notes from lessons 02 through 04 against what is actually in your account now. Every difference is drift you created within a fortnight, on an environment you built yourself, while paying attention. Write down each one and how it happened.
4. **Classify each drift item** as re-apply, amend, or import, and give a one-sentence reason for each choice.
5. **Rewrite one imperative script as a declaration.** Take the provisioning command from lesson 02 and write, in plain English or pseudo-configuration, the equivalent *statement of desired state*. Then answer: what does the imperative version do if you run it twice, and what does the declarative version do?
6. **Review a change.** Below is a change proposed by a colleague to a running production environment. Write a code review of it: what would you approve, what would you block, and what would you ask for before approving? Assume it is presented to you as a pull request with a plan attached.

   ```text
   Plan: 2 to add, 1 to change, 2 to destroy.

     + security_group_rule.admin_ssh
         port         = 22
         cidr_blocks  = ["0.0.0.0/0"]
     + storage_bucket.exports
         versioning   = false
     ~ instance.app_server
         instance_type = "t3.small" -> "t3.large"
     - database.reporting_replica
     - volume.legacy_uploads
   ```

7. **Write the change policy.** In no more than 300 words, draft the rule your team would adopt for a code-managed environment: who may change infrastructure and how, what happens during an incident when the console is the only fast option, what is required afterwards, and what is required before any apply reaches production. Name the specific plan outcomes that must stop a review.
8. **Argue the other side.** Write one paragraph making the strongest honest case *against* adopting infrastructure as code for a two-person team managing three servers, and one paragraph answering it. A practice you cannot argue against is one you do not understand.

**Deliverable:** the resource inventory with missed items marked, the rebuild estimate, the drift list with classifications, the declarative rewrite, the written code review of the plan above, the change policy, and the two paragraphs from step 8.

## Check your understanding

1. You run the same declarative configuration twice with no edits. What should the second run do, and what is that property called? *(Nothing — idempotence.)*
2. A plan for what you believed was a tag change shows `-/+` on a database. What do you do? *(Stop. A replace on a database is a data-loss event; find the attribute marked `forces replacement` and understand it before anything is applied.)*
3. Someone fixed an outage at 2 a.m. by editing a security group in the console, and the fix was correct. Which drift response fits, and why not re-apply? *(Amend the code; re-applying would revert a correct fix.)*
