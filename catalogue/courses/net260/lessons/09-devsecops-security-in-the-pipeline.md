---
lesson_id: net260-09
course_id: net260
pathway: cybersecurity-support-technician
title: "DevSecOps: Security in the Pipeline"
order: 9
kind: lesson
competency_ids:
  - D6-S1-C04
objectives:
  - Insert automated security checks into a delivery pipeline at the stage
    where each is effective
---

## Stop finding the same thing twice

Lesson 08 ended with a report: nine findings, verified, routed. Now ask the uncomfortable question. In six months, after those nine are fixed and a hundred more commits have shipped, how many of the same nine classes will be back?

If nothing changed except the fixes, the answer is most of them. A manual assessment is a photograph of one moment. The code moves every day; the assessment happens twice a year; and the gap between them is where every finding you already know how to spot gets reintroduced by someone who was not in the room.

DevSecOps is the answer to that, and its core idea is unglamorous: **take the checks a human performs occasionally and make them run automatically, every time, at the earliest stage where they can work.**

Two principles follow, and they explain nearly every design decision in this lesson.

**Shift left.** The cost of a defect rises with how late you find it. A secret caught before it is committed costs a minute. The same secret caught in production costs a credential rotation, an audit log review, an incident record, and possibly a disclosure. Nothing about the defect changed; only when you found it.

**Fast feedback beats thorough feedback.** A check that runs in twenty seconds and catches eighty percent of a class is worth more than one that runs in forty minutes and catches ninety-five, because the twenty-second check runs on every commit and the forty-minute check gets disabled the first sprint it blocks a release. Design for the check that survives.

And a caution that keeps this honest: automated checks find *known classes of known problems*. They will not find the broken access control from lesson 08, because no scanner knows which patient belongs to whom. Pipeline security does not replace assessment; it removes the noise floor so that assessment time is spent on the things only a human can find.

## The pipeline as a series of gates

![Security checks placed at each stage of a delivery pipeline, from pre-commit through post-deployment](./img/pipeline-security-gates.png)

```text
STAGE            CHECKS THAT BELONG HERE           FEEDBACK   BLOCKS?
pre-commit       secret detection                  seconds    local only
                 formatting / lint

commit / PR      secret detection (full history)   1-3 min    yes
                 SAST (changed files)
                 SCA (dependency manifest)
                 IaC configuration scanning
                 code review by a human

build            SAST (full)                       3-10 min   yes
                 container image build + scan
                 SBOM generation
                 artifact signing

pre-deploy       image signature verification      seconds    yes
                 policy check against benchmark
                 deployment plan review (diff)
                 secrets present and resolvable

deploy           progressive rollout
                 smoke tests

post-deploy      DAST against the deployed app     10-40 min  no (ticket)
                 cloud posture scan
                 continuous registry re-scan       scheduled  no (ticket)
                 runtime detection (lesson 07)
```

The rightmost column is the one people get wrong. Everything up to and including pre-deploy is a **gate**: it fails the build. Everything after deployment is a **detector**: it raises a ticket. The reason is timing, not importance. A DAST run takes forty minutes and needs a deployed application; putting it in the blocking path means every release waits forty minutes, so within a month it will be running "nightly" and, a month later, not at all.

## The checks, one at a time

### Secret detection — earliest, cheapest, highest value

A credential committed to a repository is the single most reliable way to lose a cloud account. Public repositories are scraped continuously by automated tooling; the time between a push and the first use of a leaked key is frequently measured in minutes.

Scan at two places for two different reasons. Pre-commit, on the developer's machine, so the secret never enters history at all. And in CI, on the full history, because pre-commit hooks are advisory — a developer can skip them, and one eventually will.

```yaml
- name: Secret scan
  run: |
    gitleaks detect \
      --source . \
      --log-opts="--all" \
      --redact \
      --exit-code 1
```

Note `--redact`. A secret scanner that prints the secret it found into a build log has moved the secret into a *second* system, one that often has broader read access than the repository. This is a genuine and common own-goal.

The critical operational point, and it is the one people miss: **when this check fires, removing the commit is not remediation.** Git history is distributed; the value has been pushed, fetched, and cached. The secret must be treated as compromised. Rotate it, then check the audit log from lesson 07 for any use of it from an unexpected source, then clean the history. In that order.

### Software composition analysis — your dependencies

Lesson 08 introduced SCA as an assessment tool. In the pipeline it becomes continuous. It runs at PR time against the dependency manifest, which is fast because it is a lookup rather than an analysis.

```yaml
- name: Dependency scan
  run: |
    trivy fs \
      --scanners vuln \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --exit-code 1 \
      .
```

`--ignore-unfixed` again, for the same reason as lesson 06: blocking a team on a vulnerability with no available fix teaches them to disable the gate. And run SCA on a schedule as well as on commit, because a dependency that was clean on Monday is vulnerable on Thursday when a CVE is published, with no change on your side.

### Static analysis — your own code

SAST reads source and flags dangerous patterns: unsanitized input reaching a query, unsafe deserialization, weak cryptographic primitives, hardcoded credentials.

Its problem is noise. Run it unconfigured on a mature codebase and you get thousands of findings, most of them not exploitable, and the team's rational response is to ignore all of them. Two techniques make it survivable:

**Baseline the existing findings and gate only on new ones.** Everything present today becomes a backlog to burn down on its own schedule; the gate fails only on findings introduced by this change. The team can always merge, and the code gets monotonically better.

**Scan only changed files at PR time**, full scan nightly.

```yaml
- name: SAST (differential)
  run: |
    semgrep ci \
      --config auto \
      --baseline-commit "$(git merge-base origin/main HEAD)" \
      --error
```

You are not expected to write application code in this course. You are expected to configure this gate, interpret its output, and defend its thresholds — which is precisely the DevSecOps support role.

### Infrastructure-as-code scanning — the highest-value check in a cloud pipeline

This is the one that matters most for the environment you built in lessons 03 to 06, and it is the one most often missing.

If your infrastructure is declared as code — and lesson 10 will insist it is — then every misconfiguration you have learned to find is present *in a text file, before it exists in the cloud*. A public bucket, an open security group, an unencrypted volume, a legacy metadata service, an over-permissive role: all of them are visible in the plan.

```yaml
- name: IaC scan
  run: |
    checkov \
      --directory infrastructure/ \
      --framework terraform \
      --compact \
      --soft-fail-on LOW,MEDIUM
```

The tools — Checkov, tfsec, Terrascan, KICS, provider-native policy validators — encode the same benchmarks the posture management service from lesson 06 applies at runtime. The difference is timing, and it is a big difference. Posture management tells you that you have a public bucket. IaC scanning tells you that you are *about to create* one, and refuses.

That is the shift-left argument in its purest form: the same check, moved earlier, converts an incident into a failed build.

Beyond the generic benchmark, write policies for your own organization's rules using a policy-as-code engine:

```rego
package clinic.storage

deny[msg] {
  bucket := input.resource.aws_s3_bucket[name]
  bucket.tags["data-classification"] == "restricted"
  not input.resource.aws_s3_bucket_server_side_encryption_configuration[name]
  msg := sprintf(
    "Bucket '%v' is classified restricted and must use the PHI customer-managed key",
    [name]
  )
}
```

That rule enforces the key-scoping decision from lesson 05 automatically, forever, on every future change, without anyone remembering it. Turning a policy document into a rule that runs is the most durable thing you can do for a control.

### Container image scanning and signing

Lesson 06 defined the image policy. The pipeline is where it is enforced.

```yaml
- name: Build image
  run: docker build -t "$REGISTRY/clinic-app:$GIT_SHA" .

- name: Scan image
  run: |
    trivy image \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --exit-code 1 \
      "$REGISTRY/clinic-app:$GIT_SHA"

- name: Generate SBOM
  run: |
    syft "$REGISTRY/clinic-app:$GIT_SHA" \
      -o spdx-json > sbom.spdx.json

- name: Push and sign
  run: |
    docker push "$REGISTRY/clinic-app:$GIT_SHA"
    cosign sign --yes "$REGISTRY/clinic-app:$GIT_SHA"
    cosign attest --yes --predicate sbom.spdx.json \
      --type spdxjson "$REGISTRY/clinic-app:$GIT_SHA"
```

Two things to notice. The image is tagged with the commit hash, never `latest` — so every running container traces to exactly one commit, which is what makes incident response tractable. And signing happens *after* scanning passes, so the signature means "this image came from our pipeline and passed our gates," which is a much stronger statement than "this image came from our pipeline."

### Verification at deploy

The signature is worthless unless something checks it. At deploy time, verify:

```yaml
- name: Verify image provenance
  run: |
    cosign verify \
      --certificate-identity-regexp "^https://github.com/clinic-org/" \
      --certificate-oidc-issuer https://token.actions.githubusercontent.com \
      "$REGISTRY/clinic-app:$GIT_SHA"
```

This is the control that defeats an attacker who steals registry push credentials. They can push an image; they cannot produce a valid signature from your pipeline's identity; the deployment refuses it.

### Post-deployment detectors

DAST against the deployed staging environment, the cloud posture scan from lesson 06, continuous registry re-scanning, and the runtime detections from lesson 07. All ticket rather than block, all authorized against your own environments.

## The pipeline's own security

Here is the part that separates someone who has read about DevSecOps from someone who has secured a pipeline: **the pipeline is production.** It holds credentials, it deploys to your accounts, and — as lesson 03's escalation-path analysis showed — anyone who can change what it runs can do anything it can do.

The checklist:

**No long-lived cloud credentials in CI.** Use workload identity federation so the CI system exchanges its own short-lived token for cloud credentials. This single change eliminates the most commonly stolen secret in existence.

```yaml
permissions:
  id-token: write     # request an OIDC token
  contents: read      # and nothing else

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::111122223333:role/deploy-clinic-staging
      aws-region: us-east-1
```

**Scope the deployment role narrowly, and per environment.** A staging pipeline that holds a production-capable role has erased the boundary between the environments. Separate roles, separate trust conditions — including a condition on the repository *and the branch*, so a pull request from a fork cannot assume the deployment role.

**Pin your build actions and plugins by commit hash, not by tag.** A third-party action referenced by a mutable tag is arbitrary code you have agreed to run with your pipeline's permissions, and a compromised upstream tag is a supply-chain compromise of everything you build. This is exactly lesson 06's digest-pinning argument, applied to the build system.

**Protect the branch that deploys.** Required review, required status checks, no force push, and no self-approval. If the pipeline deploys from `main`, then merge rights to `main` are production access rights and belong in the access-control audit from lesson 03.

**Isolate build runners.** Ephemeral runners that are destroyed after each job; no shared caches between untrusted builds; be deliberate about running any workflow triggered by an unreviewed external contribution.

**Log the pipeline.** Who ran what, against which environment, with which artifact. This is the record that answers "who deployed this" during an incident, and it belongs in the same archive as lesson 07's audit logs.

## Failing well

Every gate needs an answer to three questions before you turn it on, and if you cannot answer them the gate will be disabled within a month.

**What exactly fails the build?** Not "high severity findings" — that is a category, not a rule. "Critical or high severity, with a fix available, in a component we ship" is a rule. Write it as a policy file in the repository, reviewed like any other change.

**What is the exception path?** There will be a legitimate emergency where a hotfix must ship past a gate. If you have not designed that path, someone will invent it under pressure, and their version will be disabling the check. A designed exception has a named approver, a written justification, an automatic ticket, and an expiry date. It is granted per-finding, never per-pipeline, and it never lasts longer than 90 days.

**Who fixes the finding?** The team that owns the code, not the security team. A gate that routes work to a central team creates a queue, and a queue creates pressure to bypass. The security role is to run the gate, tune it, and help — not to become the bottleneck.

A rollout that works, and the ordering matters:

1. Turn the check on in **report-only** mode. Nothing blocks. Measure the true finding rate and the false positive rate for two weeks.
2. Tune. Baseline the existing backlog, suppress the noise with documented reasons, and set thresholds you can defend with the numbers you just collected.
3. **Block on new findings only.** The team can always merge; the code only improves.
4. Burn the baseline down on an agreed schedule.
5. Lower the threshold when the numbers say you can.

Turning a noisy gate straight to blocking is the classic way to lose the whole program in a week, and it is almost always done by someone who is technically correct about the risk.

## Practice

All pipeline and deployment work runs against your own lab or sandbox account and your own repository, or an instructor-provided environment, with authorization confirmed before you begin.

**Exercise 1 — Place the checks.**

For each check below, state the pipeline stage where it belongs, whether it blocks or tickets, its expected runtime, and one sentence on why it does not belong one stage earlier or later.

```text
secret detection · SCA · SAST · IaC configuration scan · container image scan ·
SBOM generation · image signing · signature verification · DAST ·
cloud posture scan · continuous registry re-scan
```

Then name the two checks on that list that would have caught findings from your lesson 08 assessment, and the two classes of finding from that assessment that **no** check on this list could ever have caught.

**Exercise 2 — Build the pipeline.**

In your own repository, implement a pipeline with at least five security stages: secret detection over full history with redaction, SCA on the dependency manifest, IaC scanning over your lesson 04 network configuration, container image build with scanning and SBOM generation, and image signing with verification at deploy. Commit the pipeline definition. Include the full file in your submission with a comment on each stage stating what it blocks on.

**Exercise 3 — Prove each gate fails.**

A gate you have never seen fail is a gate you cannot trust. For each of your five stages, introduce a deliberate defect in a branch, capture the build output showing the failure, then remove it. The five defects should be: a fake credential in a file, a dependency pinned to a version with a known critical CVE, a security group rule opening 22 to `0.0.0.0/0`, a container image running as root, and an unsigned image at deploy time. Present a table of defect, stage that caught it, time to feedback, and the exact error message.

**Exercise 4 — Write a custom policy.**

Write one policy-as-code rule that enforces an organization-specific requirement from an earlier lesson — for example, that any resource tagged `data-classification: restricted` must use the designated customer-managed key, or that no compute instance may be created with the legacy metadata service permitted. Include the rule, a passing example, a failing example, and the exact message a developer sees. The message must tell them how to fix it, not just what is wrong.

**Exercise 5 — Design the rollout and the exception path.**

Your organization wants SAST enabled on a five-year-old codebase that has never been scanned. Write the rollout plan: report-only period and what you will measure, baselining approach, the precise blocking rule you will eventually enforce, and the timeline. Then write the exception process as a short procedure: who approves, what justification is required, maximum duration, what is created automatically, and what happens on expiry. Finally, write the three-sentence response you would give to a manager during an outage who asks you to turn the gate off entirely to get a fix out — an answer that ships the fix without deleting the control.
