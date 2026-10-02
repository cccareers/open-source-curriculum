---
lesson_id: cse280-04
course_id: cse280
pathway: cloud-support-engineer
title: Mapping Requirements to Cloud Controls
order: 4
kind: lesson
competency_ids:
  - D3-S1-C02
  - D7-S1-C01
objectives:
  - Map a written compliance requirement to a specific, testable cloud control
---

## The hinge of the whole course

Lesson 02 told you where your obligations begin. Lesson 03 told you which rulebook is talking. This lesson is where prose becomes configuration.

A compliance requirement arrives as a sentence written by someone who has never seen your architecture:

> "The entity restricts logical access to information assets to authorized personnel."

You cannot deploy that sentence. You cannot test it. You cannot screenshot it. Somebody has to turn it into things that exist in a cloud account and can be checked — and in most organizations that somebody is a cloud support engineer, because nobody else in the conversation knows what a security group is.

That translation is called **control mapping**, and doing it well is the difference between a compliance programme that is real and one that is a spreadsheet of aspirations. This lesson teaches the method, applies it to two worked examples end to end, and treats one of them — network access restriction — in depth, because firewall and access-control policy is where the translation from prose to configuration is most concrete.

One framing note before the method. When you write a firewall rule in this lesson, you are writing it as a **compliance control**: deny by default, every allowance justified in writing, reviewed on a cadence, and evidenced. You are not doing network design. Choosing subnet layouts, routing, peering, and load balancer topology belongs to cse203. Here the network is a place where an obligation gets enforced.

## The anatomy of a requirement

Requirements are written in a register that hides their structure. Pull each one apart before you do anything else. Four questions:

1. **Who is obligated?** ("The entity", "the covered entity", "the processor.") Usually your organization, sometimes a sub-processor, occasionally a customer — and if it is the customer's obligation, the correct control might be documentation telling them so.
2. **What must be true?** The obligation proper. Strip the throat-clearing and get to the verb: *restricts*, *encrypts*, *reviews*, *retains*, *notifies*.
3. **Over what scope?** ("Information assets", "systems containing customer data", "production environments.") Scope is where mapping goes wrong most often, and it is worth arguing about early — a requirement that applies to production only, versus to every environment including a developer's sandbox, is two enormously different pieces of work.
4. **Under what condition or frequency?** ("At least annually", "upon termination", "prior to granting access.") If there is a frequency, it will become a recurring task with its own evidence trail.

Try it on the example:

```text
Requirement: "The entity restricts logical access to information assets
              to authorized personnel."

Who       : our organization
What      : restrict logical access
Scope     : information assets — AMBIGUOUS, must be pinned down
Condition : implied continuous; no stated frequency
```

Notice the flag on scope. "Information assets" could mean the production database, or it could mean the production database plus the source repository plus the CI system plus the analytics warehouse plus the ticketing system. You do not guess. You ask the compliance officer what asset inventory the requirement is being read against, and you record the answer in the mapping. An assumption written down and confirmed is a control; an assumption made silently is a future finding.

The same discipline applies to a requirement that arrives damaged — excerpted mid-sentence, badly scanned, or pasted out of a spreadsheet with the end cut off. Do not complete it from memory or from what it probably said. Ask for the source document. A mapping built on an invented requirement will be implemented, evidenced, and wrong, and it will look entirely convincing until an auditor pulls the original.

## The five-column method

Every mapping row has the same five parts. If a row is missing one, it is not finished.

```text
REQUIREMENT  →  CONTROL  →  IMPLEMENTATION  →  TEST  →  EVIDENCE
   (prose)    (statement)   (configuration)  (how to    (what you
                                              check)     keep)
```

![How one written framework requirement decomposes into named cloud controls, the configuration that implements each, and the evidence each produces](./img/requirement-to-control-mapping.png)

**Requirement** is the source text, quoted, with its origin — which framework, which document, which version. Never paraphrase in this column; paraphrase is how a requirement quietly drifts into something easier.

**Control statement** is your neutral, framework-independent sentence describing what will be true. It is written in the present tense, it names a subject, and it is falsifiable. This is the column people write worst. Compare:

- Bad: "We use IAM." (Not a claim. Nothing can disprove it.)
- Bad: "Access is appropriately managed." ("Appropriately" is doing all the work and means nothing testable.)
- Bad: "We have a tool called CloudGuard." (A tool is not a control. Tools get replaced; the control outlives them.)
- Good: "Human access to production is granted only through named individual accounts belonging to a role group, and every role group's membership is reviewed at least quarterly by the system owner."

The good one names who (humans, not services), what (named individual accounts, role groups), and a frequency, and every part of it can be checked and found false.

**Implementation** is the actual configuration: which service, which setting, which resource, in which account. This is where provider names finally appear.

**Test** is a procedure a competent stranger could run to determine whether the control statement is true right now. If you cannot write the test, your control statement is not specific enough — go back and fix the control statement rather than fudging the test.

**Evidence** is what you keep to prove the control operated. Not "we checked" — the artifact. A configuration export with a date. A ticket with an approver. A signed review record. Lesson 10 is about producing these properly; here you only need to name what the artifact will be.

### One control, many frameworks

Write the control statement in neutral wording, then point every framework's requirement at it. That is the crosswalk from lesson 03, and this is why it works: the control exists once, in the environment, and the frameworks are just different questions being asked about the same thing.

```text
Control: ACC-04  Human access to production is granted only through named
                 individual accounts in role groups, reviewed quarterly.

Satisfies:
  SOC 2   — logical access criteria (identifier confirmed with compliance)
  HIPAA   — access control and unique user identification safeguards
  GDPR    — technical and organisational measures limiting access
  NIST    — access control family
```

Note the hedge on the SOC 2 identifier. Never invent a criterion or control number to make a row look complete. "To be confirmed with compliance" is honest and fixable; a wrong identifier is a lie that survives review because it looks like knowledge.

## Worked example 1: restricting logical access

Requirement as above. Scope confirmed with the compliance officer as: the production cloud account, the production database, and the object storage bucket holding exports.

| Field | Content |
| --- | --- |
| **Requirement** | "The entity restricts logical access to information assets to authorized personnel." Source: customer security addendum, section 4.2. |
| **Control statement** | ACC-04. Human access to the production account is granted only through named individual identities federated from the corporate directory, assigned to role groups by job function; no shared credentials exist; group membership is reviewed at least quarterly by the system owner and access is removed within five business days of a role change or departure. |
| **Implementation** | Identity federation from the corporate directory to the cloud provider's identity service; three role groups (`prod-read`, `prod-operate`, `prod-admin`) mapped to provider roles; local console users disabled; a break-glass account held in the password vault with MFA and alerting on use. |
| **Test** | 1. List all identities with access to the production account; confirm each maps to a current employee in the directory. 2. Confirm zero enabled local users other than the documented break-glass account. 3. Pick three people who changed role or left in the period; confirm access removal within five business days. 4. Confirm the most recent review record is within the last quarter. |
| **Evidence** | Quarterly access review record signed by the system owner; identity inventory export dated; offboarding tickets for the sampled leavers; alert configuration for break-glass use. |

Notice how much the control statement had to add that the requirement did not say: federation, no shared credentials, a five-day removal window, a quarterly cadence. Those numbers came from somewhere — your organization's own policy — and that is the correct source. The requirement set the direction; your policy set the parameters; the control makes both true and checkable.

Notice also the risk this creates. Every number you write into a control statement is a number you will be audited against. Promising a two-day removal window when the process realistically takes five is not ambition, it is a manufactured finding. Write what you can sustain.

## Worked example 2: network access restriction as a compliance control

Requirement, from the same addendum:

> "Network access to systems processing customer data is restricted to the minimum necessary sources, ports, and protocols, and permitted flows are documented and reviewed."

This is the requirement that turns into firewall and access-control rules. Cloud providers expose the same idea under different names: security groups and network ACLs on AWS, network security groups on Azure, VPC firewall rules on Google Cloud. The mechanics differ; the compliance posture does not.

### The compliance posture, in five commitments

1. **Deny by default.** The baseline is that nothing is permitted. Every allowed flow is an exception someone made deliberately. Most cloud security groups are already deny-by-default for inbound; the discipline is not to undo that with a broad rule.
2. **Minimum necessary, on three axes.** Source, port, protocol. A rule that narrows the port but leaves the source as the entire internet has narrowed nothing that matters.
3. **Every rule carries a justification.** A rule with no recorded reason cannot be reviewed, because nobody can tell whether the reason still holds. In practice this means the description field is mandatory, and it says *why*, not *what*.
4. **Reference groups, not addresses, where the platform allows it.** Allowing the application tier's security group to reach the database beats allowing a hard-coded address range, because it survives the instances being replaced and it states the intent.
5. **Reviewed on a cadence, with the review recorded.** Rules accumulate. The one added "temporarily" for a vendor's proof of concept in March is still there in November unless somebody looks.

### The before state

An audit of a real-looking environment finds this on the database tier:

```text
DIRECTION  PROTOCOL  PORT RANGE  SOURCE            DESCRIPTION
inbound    tcp       5432        0.0.0.0/0         (none)
inbound    tcp       22          0.0.0.0/0         "ssh"
inbound    all       all         10.0.0.0/8        "internal"
outbound   all       all         0.0.0.0/0         (none)
```

Four rules, four separate problems.

Row 1 exposes the database port to the entire internet. Whatever else is true, the requirement's "minimum necessary sources" is not satisfied, and this is a finding regardless of whether authentication is strong — the requirement is about network reachability, not about whether the attacker gets in.

Row 2 exposes administrative access to the entire internet, with a description that restates the port instead of justifying it.

Row 3 looks tidier and is arguably worse, because it is invisible. "Internal" as a justification means nothing: a very large private range with all ports open means anything that gets a foothold anywhere in that range reaches the database on every port. Lateral movement is exactly the scenario this control exists to constrain.

Row 4 is the one people skip. Unrestricted outbound is how data leaves and how compromised hosts reach a command server. Frameworks that ask about protecting data from unauthorized disclosure will ask about egress; many teams have never thought about it.

### The after state

```text
DIRECTION  PROTOCOL  PORT   SOURCE / DESTINATION       DESCRIPTION (justification)
inbound    tcp       5432   sg-app-tier                "App tier reads/writes customer
                                                        records. Owner: platform team.
                                                        Ticket CHG-1841. Review: 2027-01."
inbound    tcp       5432   sg-bastion                 "Break-glass DBA access via bastion
                                                        only, MFA enforced at bastion.
                                                        Owner: DBA. Ticket CHG-1842."
outbound   tcp       443    pl-provider-storage        "Nightly export to backup bucket over
                                                        the provider's private endpoint.
                                                        Owner: platform team. CHG-1799."
outbound   tcp       443    sg-secrets-endpoint        "Credential retrieval at startup.
                                                        Owner: platform team. CHG-1799."
(implicit) deny      all    all                        Default deny both directions.
```

Direct SSH to the database is gone entirely; administrative access now goes through a bastion where the multi-factor check happens and the session can be logged. Egress is enumerated. Every rule names an owner, a change ticket, and — for the ones that need it — a review date.

Expressed as infrastructure code, which is how it should actually be maintained, the same intent looks like this:

```yaml
security_group: db-tier
description: "Database tier. Deny by default; every rule justified below."
ingress:
  - protocol: tcp
    port: 5432
    source_security_group: app-tier
    description: "App tier reads/writes customer records. CHG-1841. Owner: platform."
  - protocol: tcp
    port: 5432
    source_security_group: bastion
    description: "Break-glass DBA access. MFA at bastion. CHG-1842. Owner: dba."
egress:
  - protocol: tcp
    port: 443
    destination_prefix_list: provider-object-storage
    description: "Nightly export to backup bucket. CHG-1799. Owner: platform."
  - protocol: tcp
    port: 443
    destination_security_group: secrets-endpoint
    description: "Credential retrieval at startup. CHG-1799. Owner: platform."
```

Keeping rules in code rather than in a console does three things for compliance at once: the change history is the evidence of who approved what and when, the review can be a pull request, and drift between the intended state and the actual state becomes detectable.

### The mapping row

| Field | Content |
| --- | --- |
| **Requirement** | "Network access to systems processing customer data is restricted to the minimum necessary sources, ports, and protocols, and permitted flows are documented and reviewed." Source: customer security addendum, section 4.5. |
| **Control statement** | NET-02. All security groups protecting systems that process customer data deny by default; each permitted inbound and outbound flow specifies a single protocol, a specific port, and a named group or prefix list as its source or destination, carries a written justification naming an owner and change ticket, and is reviewed at least every six months with the review recorded. |
| **Implementation** | Security groups defined in infrastructure code in the platform repository; no console-created rules; provider config rules alerting on any rule permitting `0.0.0.0/0` inbound on any port, and on administrative ports from any source outside the bastion group. |
| **Test** | 1. Export all security group rules for the production account. 2. Assert no inbound rule has a source of `0.0.0.0/0` or `::/0`. 3. Assert no rule spans a port range wider than one port unless justified in its description. 4. Assert every rule has a non-empty description containing a change ticket reference. 5. Assert the code in the repository matches the deployed state. 6. Confirm a review record exists dated within six months. |
| **Evidence** | Dated rule export; the config rule's compliance history over the period; the merged pull request for the last review; the review record naming the reviewer. |

Two things about that test column are worth naming. First, it is mechanical — steps 2, 3 and 4 are things a script can assert, which is what makes this control cheap to check monthly rather than annually. Second, step 6 is a different *kind* of test: it checks that a human activity happened, and the only possible evidence is a record a human produced. Most controls have both kinds, and forgetting the human half is the more common failure.

An export you can actually run against, for the test:

```bash
# Export current rules for the production account as evidence and as test input.
aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=vpc-prod" \
  --output json > evidence/2026-07-27-prod-sg-rules.json
```

The filename is not incidental. Evidence that is not dated at the point of collection is evidence you will not be able to place in an audit period six months from now.

## Choosing which controls to build: risk-based selection

You will never have the budget or the hours to implement everything a framework could be read to want. Control selection is a judgement call, and making that judgement explicitly is the discipline sometimes called risk management. Two cautions before the method: this is an engineering triage practice as taught here, not a formal enterprise risk programme, and the formal risk-assessment competency is not one this course claims — it is recorded as a proposed addition to the catalogue. Use this to make sensible decisions and to write them down, and escalate the formal determination.

The judgement rests on two questions per gap: **how likely is this to be exploited or to fail?** and **how bad is it if it does?** Likelihood is driven by exposure — is it reachable from the internet, does it require credentials, how many people could trip it. Impact is driven by what is behind it — how sensitive the data is, how many records, whether the failure is recoverable.

Ranking the four broken firewall rules from the example on those two axes:

| Gap | Likelihood | Impact | Priority |
| --- | --- | --- | --- |
| Database port open to the internet | High — internet-reachable, scanned constantly | High — all customer records | 1 |
| Admin port open to the internet | High — same | High — full host control | 1 |
| Unrestricted outbound | Medium — needs a foothold first | High — exfiltration path | 2 |
| Broad internal allow-all | Medium — needs a foothold first | High — lateral movement to data | 2 |

Once ranked, each gap gets a decision, and there are only four honest ones:

- **Mitigate** — implement the control. The default and the usual answer.
- **Transfer** — move the risk to another party, typically by contract or insurance. Rarely available to an engineer, and it never transfers the operational consequence.
- **Avoid** — stop doing the thing that creates the risk. Underrated. Deleting a dataset you do not need removes every control obligation attached to it, permanently and for free.
- **Accept** — decide the cost of the control exceeds the risk, and record that decision with a named accepting owner and a review date.

Acceptance is legitimate. Silent acceptance is not. The difference is a written record with a name on it, because an accepted risk with an owner is a governance decision, and an accepted risk without one is just an unfixed problem with better vocabulary. Note too that some risks cannot be accepted by an engineer at all — where a legal or contractual obligation is at stake, the acceptance decision belongs to whoever can bind the organization.

When you genuinely cannot implement the intended control, the fallback is a **compensating control**: something different that addresses the same underlying risk, documented as such, with an explanation of why the primary control is impractical and why the substitute is adequate. A legacy system that cannot support modern authentication might be compensated by placing it behind a bastion that can, with session recording. Auditors accept compensating controls when the reasoning is written down and honest, and reject them when they are a label stuck on doing nothing.

## Four ways mapping goes wrong

**Mapping to a tool instead of a control.** "Requirement satisfied by our posture management product." The product is an implementation detail. When it is replaced next year, every row that named it becomes stale, and nobody can tell what the control was supposed to achieve.

**Control statements that cannot be false.** "Access is managed appropriately." "Data is protected." If you cannot describe an environment that would fail the statement, the statement is decorative.

**Scope drift.** The requirement says "systems processing customer data" and the mapping quietly narrows it to "the production database", leaving the analytics copy, the support tooling, and the export bucket unmapped. Write the asset list into the row and get it confirmed.

**Evidence that does not survive the period.** A screenshot taken the week before the audit proves the control was true that week. For a period examination it proves almost nothing. Prefer evidence that is generated continuously — configuration history, alert records, ticket trails — over evidence you have to go and manufacture.

## Practice

The scenario is the patient appointment reminder service from lesson 02: a web front end on managed container hosting, an application tier on virtual machines, a managed database holding patient names and phone numbers, an object storage bucket of nightly exports, a third-party SMS provider, and staff logins through cloud-provider identity with some long-lived script keys.

**Exercise 1 — Build the control mapping (the main artifact).**

Produce a mapping table with the five columns from this lesson, one row per requirement, for all five requirements below. Every control statement must be falsifiable, every test must be runnable by someone who has never seen your environment, and every evidence cell must name a specific artifact rather than an activity.

1. "Network access to systems processing customer data is restricted to the minimum necessary sources, ports, and protocols, and permitted flows are documented and reviewed."
2. "Logical access to information assets is restricted to authorized personnel and reviewed periodically."
3. "Customer data is protected against unauthorized disclosure while in transit over public networks."
4. "Changes to production systems are authorized, tested, and traceable to a requester."
5. "Access granted to third parties is limited to what is necessary for the service provided."

Where a requirement's scope is ambiguous, do not resolve it silently: add an `Assumption` note to the row stating how you read it and who you would confirm it with.

**Exercise 2 — Write the firewall ruleset.**

For requirement 1, write the actual rule table for the database tier and for the application tier — direction, protocol, port, source or destination, and a justification naming an owner and a ticket reference. Then write the same thing as infrastructure code in a fenced block. Both tiers must be deny-by-default in both directions, and the SMS provider integration must appear as an explicit egress rule rather than as unrestricted outbound. State in one sentence, for each tier, what you deliberately did *not* allow and why.

**Exercise 3 — Write the test script outline.**

For your NET-02-equivalent control, write the numbered test procedure and then the command or query for each mechanical step. Mark clearly which steps a script can assert and which require a human record. Name the evidence file each step produces, with a dated filename convention.

**Exercise 4 — Rank and decide.**

You have found six gaps in this environment: the database port open to the internet, long-lived script keys that have never been rotated, no encryption configured on the exports bucket, no review record for firewall rules in eighteen months, unrestricted outbound from the application tier, and a vendor test rule allowing a partner's address range full access to the application tier. Rank all six by likelihood and impact in a table, then write a one-line decision for each: mitigate, transfer, avoid, or accept. Any accept must name the accepting owner, the reason, and a review date. At least one of these six should be a candidate for *avoid* rather than *mitigate* — find it and say why.

**Exercise 5 — Break a classmate's mapping.**

Trade Exercise 1 artifacts. For each of your classmate's five rows, try to describe an environment that would pass their test while violating the requirement. Every time you succeed, their control statement or test needs tightening. Return the mapping with your counterexamples written in.
