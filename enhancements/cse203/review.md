---
course_id: cse203
title: "Cloud Infrastructure Deployment & Management — Enhancement Review"
reviewed_lessons: 8
status: draft
---

## Summary
A rigorous, well-sequenced course: build by hand (02–04), feel the pain (05), codify it (06), then scale and cost it (07) before a destroy-and-rebuild capstone with a real customer handover (08). The writing is precise and the practice is genuinely job-shaped. The biggest opportunity is a **zero-cost, automatically checkable** path: almost every practice section needs billable components (NAT gateway, load balancer, managed database), and there is no offline way for a learner or reviewer to check Terraform for the course's own rules (security groups referencing groups, no public ingress, versioned buckets, tags everywhere). Several small factual and logical errors were fixed in place.

## Clarity issues
| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| cse203-03 | "Practice" step 9 | Said a request from the bastion to the app on 8080 "should succeed", but the lesson's own `app-sg` only allows 8080 from `lb-sg`; the second half of the step (remove rule from `lb-sg`, test from another instance) was muddled. | Rewritten: expect failure, add a described temporary rule from `bastion-sg`, retry, remove, explain why the source group decided it. | Applied |
| cse203-06 | "State" — remote backend | `use_lockfile = true` requires Terraform 1.10+, but the lesson's version pin is `>= 1.6.0`. | Added a sentence naming the version requirement and the older `dynamodb_table` pattern. | Applied |
| cse203-07 | "Scaling policies" Terraform | Only a scale-to-zero schedule was shown, with no morning scale-up and no time zone (recurrences default to UTC). Practice step 9 asks for both directions. | Added `morning_up` schedule, `time_zone` on both, and a paragraph on the pairing and UTC trap. | Applied |
| cse203-07 | "Serverless functions as a demand-fitting tool" | Arithmetic error: at the lesson's own rate, 50 M × 200 ms × 512 MB is ≈ $83 compute + ≈ $10 requests, not "several hundred dollars". Conclusion unchanged. | Corrected figure and added a sensitivity sentence (duration/memory multiply the cost). | Applied |
| cse203-08 | R5 and R11 | "No rule permits 0.0.0.0/0 on any port" conflicts with default allow-all egress needed for NAT; R11 asks learners to prove reachability from `203.0.113.0/24`, a documentation range nobody can send from. | R5 now says inbound; R11 adds the learner's own `/32` via a list variable. | Applied |
| cse203-07 | "Scaling policies" | "Nine lines of policy" no longer matches the expanded example. | Change to "A few short blocks". | Applied |
| cse203-02 | "Provisioning" CLI example | Uses `t3.small` (2 vCPU / 2 GiB) right after a worked example concluding 2 vCPU / 4 GB; learners may copy it. | Add a comment: "`t3.small` shown for syntax; use the type your sizing note chose". | Proposed |
| cse203-04 | "Storage classes" | "Crossover is roughly one read per object per month" is stated without derivation and depends on object size and provider. | Either show the arithmetic for one provider or soften to "depends on object size and retrieval price — compute it". | Proposed |

## Depth and coverage gaps
- **Offline policy checking of Terraform** ("Define and update infrastructure with Terraform, including state, variables, and modules"; "Explain the principles that make infrastructure declarative, reproducible, and reviewable"). Lesson 05 argues the plan is the review artefact but never shows `terraform show -json`. Machine-reading a plan is how teams enforce the rules in lessons 03–04; drafted as project x02.
- **LocalStack / plan-only path** ("Configure a virtual private cloud with subnets and security groups for a deployed application"). VPC, subnet, route-table, security-group and S3 resources can be applied to LocalStack with `tflocal`, giving a free rehearsal before the billable run; drafted as project x01.
- **Native `import` blocks and `moved` blocks** ("Define and update infrastructure with Terraform, including state, variables, and modules"). Lesson 06 step 13 shows module extraction producing a destroy/create plan and calls it dangerous, but does not teach the fix: `moved { from = ..., to = ... }` blocks (Terraform 1.1+) make the refactor a no-op. One paragraph would close the loop. Similarly, `import` blocks (1.5+) let imports be planned and reviewed.
- **Connection-limit worked example** ("Select cloud storage and managed database services that fit a workload's durability and access needs"). Lesson 04 warns about connection ceilings but shows no arithmetic: e.g. 6 instances × 4 workers × pool of 10 = 240 connections against a small instance's limit.
- **Database credential retrieval at boot** ("Deploy a multi-tier environment for a customer entirely from version-controlled code"). The capstone requires reading the secret at runtime via instance role, but no lesson shows a snippet. A short cloud-init fragment calling the secrets CLI into a root-only file (or the app reading it via SDK) would prevent the most common R10 failure.

## Proposed additional projects
- **x01 — Riverside Network Rehearsal on LocalStack** (drafted): apply the two-tier VPC, security groups and bucket to an emulator with `tflocal`, then run plan-JSON acceptance checks.
- **x02 — Plan Guard: Block Dangerous Terraform Plans** (drafted): Python checker over `terraform show -json` fixtures, with pytest; fails on replace/destroy of protected types and public ingress.
- Import-and-adopt drill: a hand-built LocalStack bucket and security group adopted with `import` blocks until `plan` is empty.
- Module refactor with `moved` blocks: extract the network module with zero-change plan as the acceptance test.
- Cost note peer review: swap HANDOVER cost sections and check each other's arithmetic against cited prices.

## Video and animation opportunities
- **Reading a Terraform plan like a reviewer** — lessons 05/06; screencast; the symbols `+ ~ - -/+` and `# forces replacement` are best taught by watching someone stop at the right line. *Drafted: media/video-01-reading-a-terraform-plan.md.*
- **Timeout means blocked, refused means arrived** — lesson 03; screencast; the six-step connectivity ladder with real `curl`/`nc` output. *Drafted: media/video-02-timeout-vs-refused.md.*
- **A request's path through the two-tier VPC** — lesson 03; explainer animation; routing vs security groups is invisible. *Drafted: media/animation-01-request-path-two-tier-vpc.md.*
- **The autoscaling lag** — lesson 07; explainer animation; why a 90-second spike beats a 5-minute scale-out. *Drafted: media/animation-02-the-autoscaling-lag.md.*
- `count` index shift vs `for_each` keys — lesson 06; short animation; not drafted.
- Point-in-time recovery restores into a new instance — lesson 04; whiteboard; not drafted.

## Assessment ideas
- Plan-reading quiz: ten plan excerpts, learner labels each create/update/replace/destroy and says approve/block.
- CIDR drill: ten subnetting items using `cidrsubnet` outputs and usable-address counts per provider.
- Security group puzzle: given rules and a source, predict allow/timeout/refused.
- Capstone rubric addition: score HANDOVER section 5 ("what happens when it breaks") on specificity of recovery time per failure scope.

## Changes applied in this pass
- `03-cloud-networking-for-deployed-workloads.md`, "Practice" step 9: corrected expected outcome and made the test sequence coherent.
- `03-cloud-networking-for-deployed-workloads.md`: appended "Check your understanding".
- `05-infrastructure-as-code-principles.md`: appended "Check your understanding".
- `06-declaring-infrastructure-with-terraform.md`, "State": added Terraform 1.10 requirement for `use_lockfile` and the `dynamodb_table` alternative.
- `06-declaring-infrastructure-with-terraform.md`: appended "Check your understanding".
- `07-scaling-and-optimizing-provisioned-resources.md`, "Scaling policies": added paired morning schedule, `time_zone`, and explanation.
- `07-scaling-and-optimizing-provisioned-resources.md`, "Scaling policies": added `lifecycle { ignore_changes = [min_size, desired_capacity] }` so `terraform apply` does not undo the schedules; replaced "Nine lines of policy" with "A few short blocks".
- `07-scaling-and-optimizing-provisioned-resources.md`, "Serverless functions as a demand-fitting tool": corrected the 50 M invocation figure.
- `08-project-deploy-a-multi-tier-environment.md`, R5: inbound-only wording and egress note.
- `08-project-deploy-a-multi-tier-environment.md`, R11: testable permitted-source instruction.

## Open questions for the course owner
- **Unverified**: exact Terraform version that introduced S3 `use_lockfile` (believed 1.10 GA; experimental earlier); whether the AWS provider pin `~> 5.0` should move to `~> 6.0` given provider 6.x is current; LocalStack community coverage of NAT gateway and ALB resources (the x01 brief keeps them optional for this reason).
- **Pricing**: the lesson 07 rate (~$17 per million GB-seconds, ~$0.20 per million requests) and "$15 for a small instance" are illustrative and not re-verified; NAT gateway and load balancer hourly prices are deliberately not quoted anywhere in the enhancements.
- Should the capstone allow a LocalStack rehearsal as evidence for R1/R12 when a learner has no cloud budget, with the billable rebuild (R13) done once under supervision?
