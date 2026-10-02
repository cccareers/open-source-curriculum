---
lesson_id: net260-12
course_id: net260
pathway: cybersecurity-support-technician
title: "Project: Secure Deployment Pipeline"
order: 12
kind: project
competency_ids:
  - D6-S1-C04
  - D6-S1-C03
objectives: []
---

## Goal

Project 11 assessed an environment somebody else built. This one is the other half: you build the machinery that keeps an environment secure as it changes, and then you prove it works by assessing what it produces.

Your task is to deliver a **secure deployment pipeline** for a small containerized web application, running in your own lab cloud account, and then to **assess the deployed application** and demonstrate that your pipeline either caught what you found or is incapable of catching it — and to say honestly which.

That second half is the point of pairing the two competencies here. It is easy to build a pipeline with five green checkmarks that stops nothing. The deliverable is not a pipeline; it is a pipeline plus the evidence that each gate works, plus an honest account of the vulnerability classes no gate can reach.

## The application

Your instructor provides a small containerized web application with a database, a handful of API endpoints, at least two user roles, and a deliberately imperfect security posture. If none is provided, any small open-source web application with a Dockerfile and a dependency manifest will do — an intentionally vulnerable teaching application is a good choice, and if you use one, say so in your report, because it changes how your findings should be read.

You are not required to write or fix application code. Where a finding requires a code change, you report it with a specific remediation and route it to the owning developer, exactly as you would at work. Where a finding can be closed by configuration, infrastructure, or a pipeline gate — which is more of them than people expect — you fix it yourself.

## Authorization

Everything in this project runs in **your own lab or sandbox cloud account** and against **your own deployment of the provided application**. Nothing else. Produce the authorization record before you start and make it the first page of your report:

```text
PROJECT AUTHORIZATION
Cloud environment: <your lab account / subscription / project id>
Application target: <your own deployed instance, hostname and environment>
Scope:   Build, deploy, configure, and assess the above. Assessment covers
         all paths of the application you deployed.
Out of scope: Any host, account, or application not listed; the provider's
         control plane; any third-party service the application calls;
         denial of service and load testing of any kind; any system belonging
         to an employer, a classmate, or a third party.
Window:  <start> to <end>
Authorized by: <instructor>, written
Builder/assessor: <you>
Data handling: seeded test data only; no real personal data at any point.
```

The application you assess must be one you deployed yourself into your own account. This is not a formality — it is the condition that makes the assessment lawful and the reason this project can ask you to do it at all.

## Requirements

### Part A — Build the pipeline

Deliver a working pipeline, defined as code and committed to your repository, that takes a commit through to a running deployment in your lab environment. It must implement, at minimum, the following gates at the stages where each is effective.

```text
STAGE         REQUIRED GATE                          BLOCKS
commit/PR     secret detection over full history,    yes
              with redacted output
commit/PR     software composition analysis on the   yes, on fixable
              dependency manifest                    critical/high
commit/PR     infrastructure-as-code scan over your  yes
              declared infrastructure
commit/PR     at least one custom policy-as-code     yes
              rule enforcing an organizational
              requirement from lessons 03-06
build         container image build, image scan,     yes
              SBOM generation
build         image signing                          n/a (produces artifact)
pre-deploy    image signature verification           yes
post-deploy   DAST against your deployed instance    no — raises a ticket
```

Each gate needs a written, defensible rule — what exactly fails the build — recorded as a policy file in the repository rather than as thresholds scattered through the pipeline definition.

### Part B — Secure the pipeline itself

The pipeline is production. Demonstrate all of the following:

- **No long-lived cloud credential anywhere in CI.** The pipeline authenticates to your cloud account by workload identity federation. Show the trust configuration.
- **A scoped deployment identity.** The role the pipeline assumes is scoped to what the deployment actually needs, and its trust condition names your repository *and* the branch. Show that a run from another branch cannot assume the production-equivalent role.
- **Third-party actions and modules pinned by commit hash or version digest**, not by mutable tag.
- **Branch protection** on the branch that deploys: required review, required status checks, no self-approval, no force push.
- **Pipeline activity logged**, with the run, the actor, the artifact digest, and the target environment recoverable after the fact.

### Part C — Deploy repeatably

The infrastructure the application runs on is declared as code, following lesson 10:

- reusable modules with per-environment variable files, and the same module code deploying to each environment
- remote state that is encrypted, versioned, locked, and separate per environment
- no secrets in any declaration or state file; secrets referenced or platform-generated
- resources tagged with owner, data classification, and the deploying commit
- the network isolation from lesson 04 and the workload hardening from lesson 06 expressed in the declaration, not applied by hand

Deploy to at least two environments and **promote the artifact by digest**, not by rebuilding from source.

### Part D — Assess what you deployed

Now assess your own running application using the lesson 08 method: use it as a user, map the surface, run the automated passes, triage them ruthlessly, and do the manual work for the classes tools cannot reach — broken access control between two seeded accounts, and at least two multi-step business-logic workflows.

Report at least **six verified findings**, each in the lesson 08 format. At least one must be a class that no automated tool on your pipeline could have found, and at least one must have its severity changed by cloud context drawn from lessons 02 to 07.

### Part E — Close the loop

This is the section that makes the project a capstone rather than two exercises stapled together. For **every** finding from Part D, answer three questions:

```text
1. Did any gate in my pipeline catch this?   If yes: which, at which stage,
                                             and paste the build output.
2. If not, COULD a gate catch it?            If yes: which check, at which
                                             stage, what rule, and what it
                                             would cost in build time and
                                             false positives.
3. If no gate could ever catch it, say so    And state what non-automated
   plainly.                                  control covers it instead:
                                             design review, manual assessment
                                             cadence, runtime detection.
```

Then implement at least one improvement identified by question 2, and prove it works by reintroducing the defect on a branch and capturing the failed build.

Question 3 is not an admission of failure. Recognizing that broken access control is structurally invisible to a scanner — and proposing the human control that covers it — is a more mature answer than pretending a tool will handle it.

## Deliverables

**D1 — The repository.** Pipeline definition, infrastructure as code, policy files, and a README that explains how to run it. Submitted as the repository itself or as an export.

**D2 — Gate evidence table.** For every gate: the defect you deliberately introduced, the stage that caught it, the exact error message a developer sees, and the time from push to feedback. A gate with no evidence row is treated as not implemented.

**D3 — Application assessment report.** In the lesson 08 format: authorization, scope and method, coverage statement referencing your surface map, at least six verified findings, the automated findings you discarded and why, and an explicit "not tested" section.

**D4 — Loop-closure analysis.** The Part E table for every finding, plus the implemented improvement with its before-and-after build output.

**D5 — Change record.** One complete change record in the lesson 10 format for the pipeline improvement you implemented in Part E: reason linked to a finding, commit and plan, gate results, risk and blast radius, approval by someone who is not the author, execution details naming the identity used, verification evidence, and a rehearsed rollback with a measured time to restore.

## Constraints

**Everything runs in your own lab account against your own deployment.** No exceptions, no "quick look" at anything else.

**Every gate must be proven to fail.** A gate you have never seen reject something is a gate you cannot claim. The five defects to introduce, at minimum: a fake credential in a file, a dependency pinned to a version with a known fixable critical vulnerability, an infrastructure declaration that opens a management port to `0.0.0.0/0`, a container image running as root, and an unsigned image at deploy time.

**No secret ever appears in a build log, a state file, a declaration, or the repository history.** If one does — including a test value you meant to remove — treat it as compromised: rotate it, check the audit log for use from an unexpected source, then clean the history. Document that you did, in that order. A pipeline that leaks a secret while checking for secrets fails the project.

**Blocking rules must be defensible, and written down.** "Fails on high severity" is not a rule. "Fails on critical or high severity with a fix available in a component we ship" is. Every rule needs the exception path from lesson 09: named approver, written justification, automatic ticket, expiry date, granted per-finding.

**Triage before you report.** Raw scanner output is not a finding. Show the raw count and the triaged count with your aggregation and false-positive reasoning, as in lesson 08.

**Feedback time is a graded property.** Record the wall-clock time from push to feedback for each blocking gate. If your commit-stage gates take longer than about five minutes in total, explain what you would move to a later stage and why.

**Redact everything.** No credentials, tokens, keys, or unredacted records in any deliverable, including screenshots.

**Time-box.** Seven hours. Roughly: two and a half hours on the pipeline and its gates, one and a half on infrastructure and deployment, two on the assessment, one on loop closure and writing.

## Definition of done

- The authorization record is the first page of D3 and its scope matches what you actually did.
- A commit flows end to end: gates, build, sign, verify, deploy, post-deploy scan — with a run link or log for a successful pass.
- All eight required gates exist, each with a written rule in a policy file.
- D2 shows every gate failing on a deliberate defect, with the developer-facing error message and the feedback time.
- The pipeline holds no long-lived cloud credential; the trust configuration is shown, and a run from a non-deploying branch demonstrably cannot assume the deployment role.
- Third-party actions and modules are pinned by hash or digest; branch protection is configured and shown.
- Infrastructure is declared as code with encrypted, versioned, locked, per-environment remote state, and no secret in any declaration or state file.
- The same module code deploys to two environments and the artifact is promoted by digest; you can show the running digest is identical across both.
- D3 reports at least six verified findings in the standard format, including at least one no tool could have found and at least one whose severity changed because of cloud context.
- D4 answers all three loop-closure questions for every finding, with at least one implemented improvement proven by a failed build on a reintroduced defect.
- D5 is a complete change record with an approver who is not you and a rollback you actually executed and timed.
- No secret appears anywhere in any artifact, log, or history.
- You can state, in two sentences, which classes of vulnerability your pipeline will never catch and what covers them instead.

## Hints

**Build the pipeline empty first.** Get a commit to flow end to end with no security gates at all, confirm the deployment works, then add gates one at a time. Debugging a broken deployment and a misconfigured scanner simultaneously wastes an hour you will want later.

**Turn every gate on in report-only mode first**, exactly as lesson 09 describes, then switch to blocking once you know the finding rate. You will discover that at least one tool has a default configuration that would block every build forever.

**Federated identity is the highest-value thirty minutes in this project.** Do it before you write any gate. It removes the most commonly stolen credential in existence, and once it is working, the rest of the pipeline is simpler because there is no secret to plumb through.

**Pin everything by digest on the first pass.** Base images, third-party actions, IaC modules. Retrofitting pinning across a working pipeline is tedious and easy to do incompletely.

**Give the DAST run an authenticated session.** An unauthenticated scan sees the login page and almost nothing else. Most of the application's surface is behind authentication, and a scan that never logged in has covered maybe a tenth of what you deployed.

**Seed two test accounts before you assess anything.** Broken access control cannot be tested with one account, it is the highest-severity class you are likely to find, and no tool will find it for you.

**Escalate SSRF, and check the metadata setting before you decide the severity.** If your instance permits the legacy metadata service, an SSRF in the application is a stolen cloud credential and the finding is critical. If you enforced token-required metadata and a hop limit in your Part C declaration, the same flaw is materially less severe — and you get to say so, with the line of infrastructure code as evidence. This is the single best demonstration in the project that you understand how the layers interact.

**Expect Part E to be uncomfortable.** Most people find that their carefully built pipeline caught two of their six findings. That is the normal and correct result, and reporting it honestly is worth more than a pipeline that appears to catch everything. The gap between what automation catches and what an assessment finds is the reason your role exists.

**Write the two-sentence answer early.** "Which classes will my pipeline never catch, and what covers them instead?" If you draft that in the first hour, it will shape what you build. If you leave it to the end, it becomes a paragraph you wrote to satisfy a checklist.
