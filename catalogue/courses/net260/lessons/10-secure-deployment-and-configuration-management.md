---
lesson_id: net260-10
course_id: net260
pathway: cybersecurity-support-technician
title: Secure Deployment and Configuration Management
order: 10
kind: lesson
competency_ids:
  - D6-S1-C04
  - D6-S1-C01
objectives:
  - Deploy an application to a cloud environment using repeatable, reviewed
    configuration
---

## The last teaching lesson, and the one that makes the others stick

Everything you have configured in this course was configured once. That is the problem.

A security group you tightened in lesson 04 can be widened by anyone with permission and a reason at four in the afternoon. A key policy from lesson 05 can be relaxed to unblock a job. A container's `privileged: false` from lesson 06 can be flipped by someone debugging. None of those changes is malicious, none is logged as an incident, and after eighteen months of them the environment no longer resembles the one you secured. That slow divergence has a name — **configuration drift** — and it is how carefully secured environments become the ones in the breach reports.

The remedy is not vigilance. It is to make the configuration a **declared, reviewed, version-controlled artifact**, and to make the deployed environment a consequence of that artifact rather than a place where changes accumulate. That is what this lesson is about, and it is why it closes the teaching sequence: it is the mechanism that keeps lessons 03 through 07 true a year from now.

Four properties define a secure deployment, and they are the assessment criteria for everything below:

**Repeatable.** Running it again produces the same environment. Not similar — the same.

**Reviewed.** A human other than the author saw the change before it took effect, and there is a record of who.

**Traceable.** For anything running in production, you can name the commit that put it there, the person who approved it, and the artifact it came from.

**Reversible.** There is a known-good previous state and a rehearsed path back to it.

## Infrastructure as code, and what it buys security

Declaring infrastructure in text — Terraform, OpenTofu, CloudFormation, Bicep and ARM, Deployment Manager, Pulumi, CDK — is now the default. The tool matters less than the discipline. What matters to you is the five specific things the discipline gives security, because these are the arguments you will make to get it adopted.

**Review before existence.** A change to a firewall rule arrives as a pull request. Someone reads it, comments on it, and approves or rejects it *before* the rule exists in the cloud. Compare that to a console change, which is reviewed by nobody and discovered later.

**Automated policy at the same moment.** Lesson 09's IaC scanning runs on that pull request. The misconfiguration never reaches an account.

**The declaration is the evidence.** An auditor asking "how do you know production denies public access on that bucket" gets the file, its history, and the approval record. This is a far better answer than a screenshot, and it is the form of evidence cyb150 taught you to prefer.

**Drift becomes visible.** You can compare declared against actual and get a list of differences. Without a declaration there is nothing to compare to, and "is production configured correctly" is unanswerable.

**Rebuild becomes possible.** Recovering an environment after a destructive incident is a `apply` rather than an archaeology project.

A change, as it should arrive for review:

```hcl
resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Only the app tier may reach Postgres (SEC-2210)"
}

resource "aws_s3_bucket_public_access_block" "exports" {
  bucket                  = aws_s3_bucket.exports.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.hardened.id
  instance_type          = "t3.small"
  subnet_id              = aws_subnet.private_app_a.id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.app.name

  metadata_options {
    http_tokens                 = "required"   # no legacy metadata service
    http_put_response_hop_limit = 1
  }

  root_block_device {
    encrypted  = true
    kms_key_id = aws_kms_key.clinic_prod_general.arn
  }

  tags = {
    data-classification = "internal"
    owner               = "platform"
    commit              = var.git_sha
  }
}
```

Read that as a security artifact rather than as infrastructure. Lesson 04's group-referenced rule with a ticket in its description. Lesson 05's customer-managed key on the volume. Lesson 06's metadata hardening and hop limit. Lesson 03's scoped instance profile. It is the whole course, in a file, reviewable in five minutes, and enforced on every apply.

## The parts people get wrong

### State is sensitive

Most IaC tools keep a state file mapping declared resources to real ones. It frequently contains resource identifiers, connection details, and — depending on the resources — secret values in plaintext.

So: remote state in an encrypted store with a customer-managed key, access restricted to the deployment identity and the platform team, versioning on so a corrupted state can be rolled back, locking enabled so two applies cannot race, and separate state per environment so a staging mistake cannot touch production. A state file in the repository is a finding; a state file in a public bucket is an incident.

### Secrets never live in the declaration

The configuration is in version control and version control is readable by everyone with repository access, including its entire history. Reference secrets; do not embed them.

```hcl
# Wrong — now in git history forever, and in the state file
resource "aws_db_instance" "clinic" {
  password = "Sup3rSecret!"
}

# Better — reference a secret the platform resolves at deploy time
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "clinic/prod/db-password"
}

# Best — the platform generates and rotates it; nobody ever sees it, and the
# application retrieves it at runtime with its workload identity
resource "aws_db_instance" "clinic" {
  manage_master_user_password = true
  master_user_secret_kms_key_id = aws_kms_key.clinic_prod_general.arn
}
```

The progression is the same one from lesson 03: eliminate the secret if you can, reference it if you cannot, and never store it where it will be copied.

### Modules are dependencies

A community IaC module is third-party code that creates resources in your account with your deployment identity. Pin it by version or commit hash, review it before adoption, and understand what it creates — modules frequently create IAM roles, and a module's convenience default may be a wildcard policy. This is the same supply-chain argument as lesson 06's base images and lesson 09's build actions, in its third costume.

## Environments and promotion

Three environments, one definition, different variables. The single most important rule is that **the same code deploys to all of them.** If production is described by a different file than staging, then staging tests nothing.

```text
infrastructure/
├── modules/
│   ├── network/          # the lesson 04 design, parameterized
│   ├── app-service/
│   └── data-store/
└── environments/
    ├── dev/     terraform.tfvars   instance_type = "t3.micro"  ...
    ├── staging/ terraform.tfvars   instance_type = "t3.small"  ...
    └── prod/    terraform.tfvars   instance_type = "t3.large"  ...
```

Environments should be separate accounts, subscriptions, or projects — not separate resource groups inside one account. Lesson 03's evaluation model is why: an account boundary is a hard authorization boundary that auditors understand and that no clever policy condition can accidentally erode. It also means a compromised development environment cannot reach production identities.

Promotion, and the rule that makes it meaningful: **promote the artifact, not the source.** The image that passed the pipeline's gates in staging is the exact image, by digest, that deploys to production. If production rebuilds from source, it is running something that was never tested, and every gate in lesson 09 verified a different artifact.

```yaml
promote:
  from: staging
  to: production
  artifact: registry.example.com/clinic-app@sha256:7f3c...   # digest, not tag
  requires:
    - staging_soak_hours: 24
    - all_pipeline_gates: passed
    - signature_verified: true
    - change_record: CHG-4471
    - approvals: 2          # neither may be the change author
```

The differences between environments are then confined to scale and to data, which is the second rule worth stating: **production data does not go to non-production.** If realistic data is needed, it is masked, tokenized, or synthetic. Copying the production database into staging moves restricted data into an environment with weaker controls and broader access, and it undoes lesson 05 completely.

## Deployment strategies, read as security controls

The deployment patterns are usually taught as availability techniques. They are also security controls, and it is worth being able to say why.

**Blue-green.** Two complete environments; traffic switches from old to new; the old stays up briefly. Security value: rollback is a traffic switch measured in seconds. When a deployment introduces a vulnerability, or when a compromise is traced to a specific release, "revert" is not a rebuild.

**Canary / progressive.** The new version takes a small percentage of traffic first, then more. Security value: a bad release, including one that opens a hole, is exposed to five percent of users rather than all of them, and automated rollback on error-rate signals catches it before it is general.

**Rolling.** Instances replaced in batches. Simplest, slowest to roll back, and worth naming its risk: for a while, two versions are live simultaneously, and if the change was a security fix then the vulnerable version is still serving traffic. Say so when the change is a security fix, and prefer a faster strategy for those.

**Immutable infrastructure**, underneath all three. Instances are never modified in place; they are replaced from a new image. This is lesson 06's golden image discipline, and it is what makes drift structurally impossible on the compute layer: a running instance cannot have accumulated changes, because nothing has ever changed it.

And the rollback rule that gets forgotten: **a rollback must be rehearsed.** A rollback plan that has never been executed is a paragraph, not a control. Practice it in staging on a schedule.

## Drift, and closing the loop

Even with everything above, drift happens. Someone makes an emergency console change during an incident and does not backport it. A provider changes a default. An auto-scaling process creates something the declaration does not know about.

Detect it by running a plan or diff on a schedule against every environment and alerting on any non-empty result:

```bash
terraform plan -detailed-exitcode -var-file=environments/prod/terraform.tfvars
# exit 0 = no drift, exit 2 = drift detected, exit 1 = error
```

Then triage. Each drift item is one of three things and the response differs:

```text
1. An unauthorized change.  Investigate it as a security event — correlate
   with the control-plane audit log from lesson 07 to find who made it, when,
   and from where. Then revert.

2. An authorized emergency change never backported.  Codify it: write the
   declaration, review it, apply, and the drift disappears legitimately.

3. Provider noise — a computed field, a default that changed.  Suppress it
   explicitly, with a comment saying why. Never suppress broadly.
```

The most valuable output of drift detection is not the reverting. It is the pattern. If the same rule drifts every month, the declaration does not match what operations actually needs, and the fix is to change the declaration or the process — not to keep reverting and quietly resenting the people who keep changing it.

Pair drift detection with the posture management scan from lesson 06 to close the loop completely. Drift detection answers *"does the environment match what we declared?"* Posture management answers *"is what we declared actually secure?"* You need both, because a declaration can be faithfully applied and still be wrong.

Which is exactly why the pipeline's IaC scan from lesson 09 sits between them: it evaluates the declaration against a published benchmark before it ever becomes an environment. Declaration reviewed by a benchmark, environment compared to declaration, environment compared to the benchmark again at runtime. Three checks, three different failure modes caught.

## Change records, and what an auditor will ask for

The last artifact of the taught course is the one that ties a running resource back to a human decision.

```text
CHANGE RECORD
Ref:            CHG-4471
Title:          Restrict clinic-db ingress to the app tier security group
Environment:    production
Requested by:   A. Nkemelu           Date raised: 2026-07-24
Reason:         Audit finding F2 (SEC-2210) — database reachable from 0.0.0.0/0

CHANGE
  Commit:       9f2c1ab (infrastructure/modules/network/security_groups.tf)
  Plan output:  attached, plan-CHG-4471.txt
                 1 to add, 1 to destroy, 0 to change
                 - removes ingress rule "allow-ops" (0.0.0.0/0 : 5432)
                 + adds ingress rule sourced from sg "clinic-app" : 5432
  Gates:        IaC scan pass · secret scan pass · policy check pass
  Artifact:     n/a (infrastructure only)

RISK
  Impact if wrong: operators lose direct database access from workstations.
  Mitigated by:    managed session service access to a bastion, verified
                   working 2026-07-23 in staging.
  Blast radius:    one security group in one account.

APPROVAL
  Reviewed by:  D. Whitfield (Platform Owner), 2026-07-24 10:12Z
  Approved by:  J. Ferreira (Security), 2026-07-24 10:40Z
  Note: neither approver is the change author.

EXECUTION
  Applied:      2026-07-24 11:03Z by the deployment pipeline, run #2291,
                federated identity role/deploy-clinic-prod (no static key)
  Verification: external connection attempt to 5432 from the lab — timed out
                (evidence: verify-CHG-4471.txt)
                app tier connection — succeeded
                flow logs show zero accepted external flows in the following 24h

ROLLBACK
  Method:       revert commit 9f2c1ab and apply; rehearsed in staging
                2026-07-23. Estimated time to restore: 4 minutes.
  Not required.

POST-CHANGE
  Drift check 2026-07-25 03:00Z: clean.
  Audit finding F2 closed with this record as evidence.
```

Read what that single page does. It closes an audit finding with evidence. It proves separation of duties — the author did not approve. It proves the deployment used a federated identity rather than a static key. It records verification that the control actually works rather than merely that it was applied. And it contains a rehearsed rollback.

That is the artifact your role produces, and it is what "deploying using repeatable, reviewed configuration" means in practice. It is also, almost word for word, what an auditor will ask you for.

## Practice

All deployment work runs in your own lab or sandbox account, or an instructor-provided environment, with authorization confirmed before you begin. Never apply configuration to an environment you do not own or have not been authorized to change.

**Exercise 1 — Declare the environment.**

Take the isolated network you built in lesson 04 and the hardened workload from lesson 06 and express the whole thing as infrastructure as code, structured as reusable modules with per-environment variable files for `dev` and `prod`. Requirements: identical module code for both environments; no secrets in any file; remote state configured with encryption, versioning, and locking, with separate state per environment; every resource tagged with owner, data classification, and the deploying commit. Submit the tree layout and the module for the network.

**Exercise 2 — Deploy it, twice.**

Apply to `dev`, then destroy it, then apply again from the same commit. Show that the second environment is equivalent to the first: compare resource inventories and explain every difference you find, including the ones that are legitimately expected. Then apply the same code to a second environment with only the variable file changed, and state exactly which properties differ and why each difference is acceptable.

**Exercise 3 — Break it and detect it.**

Make three changes directly in the cloud console, bypassing your configuration: widen a security group to `0.0.0.0/0`, remove an encryption setting, and add a permission to a role. Run drift detection and capture the output. For each drift item write: what changed, which of the three triage categories it falls into, the control-plane audit log record that identifies who made it and when (from lesson 07), and the specific remediation. Then remediate all three and show a clean drift run.

**Exercise 4 — Promote an artifact.**

Deploy the container image from lesson 09 to `dev`, then promote the same image by digest to your `prod` lab environment. Your promotion must verify the image signature before deploying, require an approval that is not yours, and record the change. Then demonstrate the guarantee: show that the digest running in `prod` is byte-identical to the one tested in `dev`, and explain in two sentences what would be untrue if `prod` had rebuilt from source instead.

**Exercise 5 — Write the change record and rehearse the rollback.**

Pick one security-relevant change — closing a finding from any earlier lesson — and produce a complete change record in the format above: reason linked to a finding, commit and plan output, gate results, risk with blast radius and mitigation, two approvers neither of whom is you, execution details naming the identity used, verification evidence that the control actually works, and a rollback method. Then actually execute the rollback in your lab, time it, and record the measured time to restore. A rollback you have not run does not go in the record as rehearsed.

## Check your understanding

1. `terraform plan -detailed-exitcode` returns 2 on the production schedule. What does that mean, and what is your first step for each of the three triage categories?
2. Why must production deploy the image by digest that was tested in staging rather than rebuilding from the same commit?
3. A state file is found in the application repository. Why is that a finding even if the repository is private?

**Answers:** (1) Drift detected. Unauthorized change: investigate it as a security event using the control-plane log, then revert. Authorized emergency change: codify it in the declaration. Provider noise: suppress it narrowly, with a comment. (2) A rebuild is a different artifact that no gate verified, so the gate results no longer describe what is running. (3) State often contains identifiers, connection details, and secret values in plaintext. Anyone with repository access, and the whole repository history, now holds them.
