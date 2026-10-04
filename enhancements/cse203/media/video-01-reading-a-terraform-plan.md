---
course_id: cse203
media_id: cse203-v01
type: video-script
title: "Reading a Terraform Plan Like a Reviewer"
format: screencast
target_runtime: "8 min"
related_lessons:
  - cse203-05
  - cse203-06
objectives:
  - Explain the principles that make infrastructure declarative, reproducible, and reviewable
  - Define and update infrastructure with Terraform, including state, variables, and modules
competency_ids:
  - D4-S1-C02
---

## Purpose
After watching, the learner can read a Terraform plan line by line, identify every create, in-place update, replace, and destroy, find the attribute that forces a replacement, and decide whether to approve.

## Audience and prerequisites
Apprentices who have completed lesson 05 and the first half of lesson 06 (`init`, `plan`, `apply`). The demo uses the lesson's `ticketing` project on the AWS provider against a lab account; the same reading skill applies to every provider.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Pull request page: title "Bump app instance size", diff shows one line `instance_type = "t3.small"` → `"t3.medium"`. | "Here's a pull request that changes one line. Looks harmless. The diff tells you what the author *intended*. The plan tells you what will actually *happen*. We review the plan." |
| 0:20 | Terminal: `terraform plan -var-file=dev.tfvars -out=tfplan`. Output scrolls; pause at the summary line `Plan: 0 to add, 1 to change, 0 to destroy.` | "Start at the bottom. One to change, nothing added, nothing destroyed. That matches a resize. Now read up to confirm *which* thing changes." |
| 0:45 | Highlight block: `# aws_instance.app will be updated in-place` with `~ instance_type = "t3.small" -> "t3.medium"`. | "Tilde means update in place. The resource keeps its identity. On most platforms a resize stops and starts the instance, so there's a short outage — the plan won't tell you that, the provider documentation will. Approve, with a note about timing." |
| 1:20 | New PR: "Move app to zone b". Plan summary: `Plan: 1 to add, 0 to change, 1 to destroy.` | "Second pull request: move the app instance to the other zone. Summary says one add, one destroy. On a change the author described as a *move*. Stop." |
| 1:40 | Highlight `-/+ resource "aws_instance" "app" {` and the line `~ subnet_id = "subnet-0aa…" -> "subnet-0bb…" # forces replacement`. | "Minus-slash-plus: replace. Destroy and recreate. And here's the most important comment Terraform ever prints: 'forces replacement', next to subnet_id. You can't move a running instance between subnets. Terraform will delete it and build a new one." |
| 2:20 | Side panel text: "Replace on a disposable instance behind an ASG = fine. Replace on a database or a volume = possible data-loss event: check backups first." | "Is that a problem? For a disposable app instance with nothing on its disk — no, as long as you accept the downtime or have `create_before_destroy`. On a database or a volume, that line can be a data-loss event. Whether you get the data back depends on what's configured — a final snapshot, retained backups, a recent volume snapshot — so verify those exist before you approve, and treat 'I think there's a backup' as no. The symbol is the same. The resource type decides." |
| 2:55 | Third PR: "Refactor network into module". Summary: `Plan: 9 to add, 0 to change, 9 to destroy.` | "Third one: a pure refactor, moving the network resources into a module. Nothing about the infrastructure is supposed to change. The plan says nine destroys." |
| 3:15 | Scroll: `# aws_subnet.public[0] will be destroyed` paired with `# module.network.aws_subnet.public[0] will be created`. | "Look at the addresses. Same subnet, new address — it moved inside `module.network`. Terraform matches resources by address, so it thinks the old one should die and a new one be born. On production, that's your whole network." |
| 3:45 | Editor: add `moved { from = aws_subnet.public  to = module.network.aws_subnet.public }`. Re-run plan: `No changes. Your infrastructure matches the configuration.` | "The fix is a `moved` block: tell Terraform the old address and the new one. Re-plan. No changes. That's what a refactor should look like." |
| 4:20 | Fourth PR, the lesson 05 example, all five lines visible under the summary `Plan: 2 to add, 1 to change, 2 to destroy.`: `+ security_group_rule.admin_ssh cidr_blocks = ["0.0.0.0/0"]`, `+ storage_bucket.exports versioning = false`, `~ instance.app_server instance_type = "t3.small" -> "t3.large"`, `- database.reporting_replica`, `- volume.legacy_uploads`. | "Last one, from lesson 05's review exercise. Two adds, one change, two destroys. Let's go line by line as the reviewer." |
| 4:40 | Annotations appear beside each line, top to bottom: BLOCK / ASK / OK / ASK / BLOCK. | "SSH open to the whole internet: block. Exports bucket with versioning off: ask why — at minimum it needs versioning and a lifecycle. Instance resize: fine. Destroying the reporting replica: ask who uses it and whether anything reads from it. Destroying a volume called legacy_uploads: block until someone proves the data is somewhere else." |
| 5:40 | Terminal: `terraform show -json tfplan \| jq '.resource_changes[] \| {address, actions: .change.actions}'`. | "Everything you just read is also machine-readable. This is the same plan as JSON — address and actions. That's how teams automate the boring half of review, and it's what the Plan Guard project builds." |
| 6:20 | Terminal: `terraform apply tfplan`. | "When you approve, apply the *saved* plan file. Then what runs is exactly what you reviewed — not a fresh plan that might have changed in the meantime." |
| 6:45 | Terminal: `terraform plan` → `No changes.` | "And immediately afterwards, plan again. It should be empty. If it isn't, your code and reality disagree, and that gap only grows." |
| 7:10 | Recap card: `+ create`, `~ update`, `-/+ replace (find 'forces replacement')`, `- destroy`. "Read the summary, read every line, stop at -/+ and - on anything holding data." | "Four symbols, one comment to hunt for, and one rule: never approve a replace or destroy you can't explain." |

## On-screen assets and B-roll
- Lab project from lesson 06 with four prepared branches (resize, zone move, module refactor, lesson-05 plan).
- For the lesson-05 plan, a hand-made fixture is fine; label it "illustrative plan" on screen.
- Terminal ≥ 18pt; plan colour output **plus** symbols visible (do not rely on red/green).

## Accessibility
- Captions; every plan line shown is read aloud.
- Annotations use text labels (BLOCK / ASK / OK) as well as colour.
- Provide the four plans as text files for screen-reader users.

## Check for understanding
1. A plan shows `-/+` on `aws_db_instance.main` with `# forces replacement` beside `engine_version`. Approve? *Answer: No — replacing a database destroys it; investigate an in-place upgrade path and confirm backups before anything is applied.*
2. Why apply `tfplan` instead of running `terraform apply` fresh? *Answer: So exactly the reviewed plan executes; a fresh apply re-plans and may differ.*
3. What tells Terraform that a resource has moved addresses rather than being replaced? *Answer: A `moved` block.*
