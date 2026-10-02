---
lesson_id: net260-11
course_id: net260
pathway: cybersecurity-support-technician
title: "Project: Cloud Security Posture Review"
order: 11
kind: project
competency_ids:
  - D6-S1-C01
  - D6-S1-C02
  - D2-S1-C03
objectives: []
---

## Goal

You are joining a small security team at a company that has been in the cloud for three years without a dedicated security function. Nobody has ever looked at the whole environment at once. Your task is to perform a **cloud security posture review** of an environment you did not build, and to deliver a report that a platform team can start working from on Monday morning.

This is the assessing half of the capstone. You are not designing anything and you are not fixing anything. You are answering three questions with evidence:

1. **What are we responsible for here, and what is the provider's?**
2. **Which controls that should be in force are not?**
3. **Is there any sign that someone has already taken advantage of that?**

The third question is what separates a posture review from a checklist. A configuration finding says "this door is unlocked." An audit-log finding says "and somebody walked through it on the nineteenth." Both belong in your report, and only one of them changes what happens next.

## The environment

Your instructor provides a target environment: either a prepared lab account you are given access to, or a set of exported configuration and log artifacts to work from. It is a small production-shaped environment for a clinic appointment service — roughly the shape used as the running example throughout this course — containing a mix of managed services, virtual machines, container workloads, storage, an identity configuration, and thirty days of audit logs.

It has been seeded with real defects. Some are obvious. Several are the quiet kind: a route table that makes a "private" subnet public, a role trust relationship extended to an unfamiliar account, a machine identity used from a source it has never used before. At least one chain of findings connects the infrastructure to an actual sequence of activity in the logs.

You are not told how many defects there are. Deciding when your coverage is adequate, and being able to say what you did *not* examine, is part of what is being assessed.

## Authorization, and the boundary you do not cross

Before you touch anything, produce the authorization record. It is the first page of your report.

```text
POSTURE REVIEW AUTHORIZATION
Target:        <account / subscription / project identifier>
Scope:         Configuration review, identity and access audit, and audit log
               analysis of the named environment only.
Out of scope:  Any account not named above; any third-party service; any
               production system belonging to a real organization; denial of
               service or load testing of any kind; exploitation of any
               vulnerability beyond what is required to confirm it exists;
               any change to the environment.
Read-only:     This review makes no configuration changes. Any change is
               proposed in the report and executed by the owning team.
Window:        <start> to <end>
Authorized by: <instructor / platform owner>, written
Reviewer:      <you>
Stop rule:     If anything degrades or behaves unexpectedly, stop and contact
               <named person> immediately.
```

The out-of-scope list is not boilerplate. This project is read-only. Confirming that a security group permits `0.0.0.0/0` on 5432 is configuration review. Connecting to that database from outside to prove it is reachable is a connectivity test that is only in scope if your instructor has explicitly authorized it against this specific target, and even then you record the authorization before you run it. Nothing in this project is performed against any system outside the environment you have been given.

## Requirements

Your report must cover all six areas below. Each carries a required artifact; a section without its artifact does not count as covered.

### 1. Shared responsibility position

Produce the Workload Responsibility Note for the environment, in the format from lesson 02. Every component named by exact service, mapped to IaaS, PaaS, or SaaS, with the provider column and the customer column broken into data, identity, configuration, and code. Check all four edges: keys, images, backup and restore, and any configuration exposing a network endpoint. Record your assumptions.

This section exists because every finding later in the report has to be *yours* to make. A finding against a layer the provider owns is a mistake that costs you credibility, and there is at least one component in the environment where the line is genuinely non-obvious.

### 2. Access control audit

A full access-control audit in the lesson 03 format. All five passes:

- wildcard and broad-role scan, with the **scope** of each grant recorded, not just its content
- escalation paths, including any indirect path through a deployment pipeline
- usage evidence over the available log window, distinguishing "granted" from "used"
- machine identity enumeration, with credential type and last use for every one
- comparison of human access against stated job function

Deliver a population count split human and machine, and a finding for every grant wider than the job requires. This is the largest single section of the report and the one most likely to contain the finding that matters most.

### 3. Network isolation review

Work the lesson 04 verification list: every public address justified or flagged; every `0.0.0.0/0` and `::/0` ingress rule; default networks in use; route tables read independently of firewall rules; data tier exposure; peering and hybrid links and what they make transitively reachable; flow logs enabled and delivered.

Include a current-state network diagram — a text diagram is fine — marking every path from the internet to a data store. If there is more than one such path, the second one is usually the interesting finding.

### 4. Data protection review

For every data store: encryption state, key tier (provider-managed, customer-managed, external, client-side), who holds administrative rights on the key and who holds use rights, TLS enforcement in policy rather than in intention, public-access settings, backup and snapshot configuration, and — specifically — who any snapshot is shared with.

Then produce the data-flow inventory from lesson 05: every location the sensitive dataset exists, including backups, replicas, extracts, and logs. State whether the key scoping supports the environment's stated revocation and retention requirements, and if it does not, say what would have to change.

### 5. Workload hardening review

A Workload Hardening Review in the lesson 06 format, covering both virtual machines and container workloads: image provenance and age, registry scanning state and findings, metadata service configuration, per-workload identity versus inherited node identity, and the runtime configuration settings — non-root, read-only root filesystem, privilege escalation, capabilities, host namespaces, resource limits.

Where the environment can be evaluated against a published benchmark, do so and report the deviations with their risk and remediation. Say which benchmark and which level you used; an unnamed benchmark is an opinion.

### 6. Log analysis — the part that makes this a security review

Two halves, and both are required.

**Logging configuration.** Work the lesson 07 checklist: control-plane logging in every region, delivery to a separate account or project, immutability and retention, key administration separated from the platform team, an organization-scope deny on log tampering, data-plane logging on sensitive stores, identity and sign-in events captured, flow logs on. Every gap is a finding, and every gap is also a limit on what you can conclude — record both.

**Log analysis.** Examine the available window for the signals from lesson 07: sign-ins without MFA, machine identities from unfamiliar sources, discovery bursts, access-denied bursts, credential creation for other identities, trust policy modifications, logging or detection changes, storage made public, snapshots shared externally, unusual data-plane volume.

Produce a timeline of anything you find. If your conclusion is that the activity in the window is benign, say so explicitly and cite what you checked — a clean result you can evidence is a legitimate and valuable finding. If your conclusion is that something happened, produce the Security Event Handoff from lesson 07 as a separate, standalone document.

## The deliverables

Three documents.

**D1 — Posture review report.** The main artifact. Structure:

```text
1.  Authorization and scope
2.  Executive summary            (see the constraint below)
3.  Method and coverage
4.  Shared responsibility position
5.  Findings                     (severity-ordered, not section-ordered)
6.  Log analysis and timeline
7.  Prioritized remediation plan
8.  Accepted risks
9.  Not examined
10. Evidence index
```

**D2 — Findings register.** A machine-readable table — CSV or a markdown table — with one row per finding: id, severity, category, affected resource, evidence reference, owner, target date, status. This is the artifact the platform team actually works from, and it must be able to stand alone.

**D3 — Security event handoff.** If your log analysis found something, the standalone handoff in the lesson 07 format, written so that a responder who has not read D1 can act on it in two minutes. If your analysis found nothing, submit instead a one-page statement of what you searched for, over what window, with what queries, and what would have to be true for you to have missed something.

## Constraints

**Read-only.** No configuration changes to the target. Every remediation is proposed, never applied.

**Findings, not tool output.** A pasted scanner report is not a finding. Every finding is triaged, verified, deduplicated, and written in the standard format: severity, affected resource, evidence, impact stated as what an attacker gains, specific remediation, owner, target date, and a verification step. "Apply least privilege" is not a remediation.

**Severity on a stated scale.** Name the scale in your method section and apply it consistently. Justify every critical.

**The executive summary is one page and contains no jargon.** It is written for a clinic operations director who does not know what an instance profile is. It must state the three things that matter most, what could happen if they are not addressed, and what you are asking for. If it needs a glossary, rewrite it.

**No more than fifteen findings in the main report.** If you have more, you have not prioritized. Aggregate the repetitive ones — thirty instances of a missing tag is one finding with a count — and put the remainder in an appendix. This constraint exists because a report nobody finishes reading changes nothing.

**Cite evidence that someone else can reproduce.** A query someone can re-run, an export in the evidence store, a screenshot with a timestamp. "I saw it in the console" is not evidence.

**Redact.** Never paste a credential, a key, a token, or an unredacted personal record into the report. Redact in evidence too — a screenshot in a report is a copy of the data.

**Time-box.** Seven hours. Roughly: one hour on responsibility mapping and scope, two on identity and access, one and a half on network, data, and workload, one and a half on logs, and one on writing. Coverage you did not achieve goes in the "not examined" section — an honest gap is professional, an unstated one is not.

## Definition of done

You are finished when all of the following are true.

- The authorization record is the first page and its scope matches what you actually did.
- The responsibility note names every component by exact service and no finding in the report targets a layer the provider owns.
- The access control audit reports a population count split human and machine, examines both, and includes at least one escalation path analysis.
- Every finding has: an id, a severity on the stated scale, the affected resource, reproducible evidence, impact expressed as what an attacker gains, a specific remediation, an owner, a target date, and a verification step.
- At least one finding is a **chain** — two or more individually moderate defects that combine into something severe — and the chain is explained in one paragraph a non-specialist can follow.
- The log analysis states its window, the signals searched for, and the queries used, and reaches an explicit conclusion rather than trailing off.
- Every gap in the logging configuration is recorded both as a finding and as a stated limit on your conclusions.
- The remediation plan is ordered by risk reduction per unit of effort, not by report section, and the top three items are things the platform team could genuinely start this week.
- The executive summary is one page, is free of jargon, and would make sense read aloud.
- The "not examined" section is present and honest.
- The findings register stands alone and every row traces to an evidence reference.
- No configuration in the target environment was changed.

## Hints

**Do the cheap high-yield checks first.** In the first thirty minutes: the most powerful credential's MFA status and whether it has an access key; every `0.0.0.0/0` ingress rule; every public IP; every public storage container; whether control-plane logging is on in every region. That handful of checks finds a startling proportion of what is wrong in most environments, and it tells you where to spend the rest of your time.

**Read route tables separately from firewall rules.** The seeded defect that catches most people is a subnet everyone calls private that has a default route to an internet gateway. The firewall rules look fine. The subnet is not private.

**Scope is where identity findings hide.** Two role assignments can look identical in a list and differ enormously in blast radius because one was made at the subscription or folder level and inherited downward. Record the scope of every grant, every time.

**Machine identities are where the findings are.** They outnumber humans, hold more permission, and nobody reviews them. Enumerate all of them before you finish with humans.

**Follow the pipeline.** If a deployment pipeline holds a broad role, then everyone who can merge to the deploy branch has that role. That is an access control finding even though it appears in no IAM console, and it is the single most commonly missed escalation path.

**Let the logs cross-check the configuration.** When you find a misconfiguration, go straight to the log and ask when it was introduced, by whom, and whether anything has used it since. That is how a configuration finding becomes either "theoretical" or "already exploited," and the report reads completely differently depending on the answer.

**Baseline before you judge.** Before deciding a source address is unusual for a machine identity, look at its history. The point is the *deviation*, not the address.

**Watch for the absence of things.** Missing data-plane logging is invisible unless you look for it deliberately, and it is often the reason a real incident cannot be scoped. The most important sentence in some reports is "we cannot determine whether the data was read, and here is why."

**Write the executive summary last, then check it against your findings register.** If the summary emphasizes something that is not in your top three findings, one of the two is wrong.

**Give every finding an owner.** A finding without a named owner is a complaint. If you genuinely do not know who owns something, that ambiguity is itself a finding — unowned resources do not get patched.
