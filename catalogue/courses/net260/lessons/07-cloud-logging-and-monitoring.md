---
lesson_id: net260-07
course_id: net260
pathway: cybersecurity-support-technician
title: Cloud Logging and Monitoring
order: 7
kind: lesson
competency_ids:
  - D6-S1-C02
  - D1-S1-C04
objectives:
  - Detect unauthorized access in cloud audit logs and route the signal to a
    responder
---

## Now you know what normal looks like

This lesson is placed after the five that built the environment, and the placement is the point. You cannot recognize an abnormal control-plane call until you know what a normal one looks like — and you have now spent five lessons making normal ones. Every policy you narrowed, every security group you wrote, every key you created, every image you deployed produced an audit record. This lesson teaches you to read them.

The premise is simple and powerful: **in a cloud account, almost every consequential action is an API call, and almost every API call is logged with the identity that made it, the source it came from, the parameters it carried, and whether it succeeded.** That is a level of visibility no on-premises environment gives you for free. An attacker who compromises a credential and starts exploring leaves a trail of calls that is, in principle, completely visible.

In principle. In practice the trail is buried in millions of routine records, the interesting fields are inconsistently named across providers, and the alert that would have caught it was never written. That gap — between "the evidence exists" and "someone acted on it" — is where your job lives.

## The log types, and the one that matters most

Every provider produces roughly the same families. Learn the family, then the local name.

```text
FAMILY              WHAT IT RECORDS        AWS            Azure              Google Cloud
Control plane /     Every management API   CloudTrail     Activity Log       Cloud Audit Logs
management          call: create, modify,  (management    (+ Entra ID audit  (Admin Activity)
                    delete, policy change  events)        logs)
Identity / sign-in  Authentications, MFA,  CloudTrail     Entra ID sign-in   Cloud Audit Logs
                    federation, failures   (STS, console) logs               (login events)
Data plane          Reads and writes of    CloudTrail     Storage/diagnostic Data Access audit
                    the data itself        data events    logs               logs
Network flow        Connections accepted   VPC Flow Logs  NSG Flow Logs      VPC Flow Logs
                    and rejected
Resource / app      What the workload      CloudWatch     Azure Monitor      Cloud Logging
                    itself emits           Logs           Logs
```

Three things to internalize about this table.

**The control-plane log is the one that matters most.** It is the record of who changed the environment. Turn it on for every region and every account, not just the ones you use — an attacker will happily create resources in a region nobody watches precisely because nobody watches it.

**Data-plane logging is usually off by default, and it is voluminous and billable.** This is a genuine decision, not an oversight: logging every object read in a large bucket produces enormous volume. Enable it selectively, on the data that would matter in a breach — the PHI bucket, the payroll store, the key service. Without it you cannot answer the single question that determines whether an incident is a breach: *did they actually read the data?*

**Sign-in logs may live somewhere else entirely.** On Azure in particular, identity events are in the Entra ID logs rather than the resource Activity Log, and a team that only wired up the Activity Log has no visibility into authentication at all. Check for this specifically.

## Protecting the log before you read it

An attacker's first move after gaining privilege is often to stop the recording. Your log configuration therefore needs to survive an attacker who holds administrative permissions in the account they compromised.

The standard pattern, and it is the same three ideas everywhere:

**Ship logs out of the account that produces them.** A central, dedicated log archive account or project, which the workload accounts can write to and cannot read, modify, or delete. Compromising production then gets you no ability to alter the record of what you did there.

**Make the archive immutable.** Object lock, write-once retention, or immutable storage policy, set for the retention period the compliance work in cyb150 established. Even the log account's own administrators cannot shorten it.

**Deny tampering by explicit policy at the organization scope.** Recall from lesson 03 that an explicit deny beats every allow, at every level below it:

```json
{
  "Sid": "NoOneMayDisableOrAlterAuditLogging",
  "Effect": "Deny",
  "Action": [
    "cloudtrail:StopLogging",
    "cloudtrail:DeleteTrail",
    "cloudtrail:UpdateTrail",
    "cloudtrail:PutEventSelectors"
  ],
  "Resource": "*"
}
```

Applied at the organization level, that survives a fully compromised account administrator. Azure's equivalent is a management-group policy denying modification of diagnostic settings; Google Cloud's is an organization policy plus log sink protections at the folder level.

And from lesson 05: the log archive is encrypted with a key whose administration belongs to the security team, not to the platform team whose credentials might be the ones that get stolen.

Finally, **alert on the act of tampering itself.** "Audit logging was disabled" is one of the highest-fidelity alerts you will ever write. It has almost no legitimate cause and an unmistakable malicious one.

## Reading a record

Here is a control-plane record, lightly trimmed. This shape is AWS's; the fields have direct counterparts everywhere.

```json
{
  "eventTime": "2026-07-19T02:41:07Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "CreateAccessKey",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.88",
  "userAgent": "aws-cli/2.15.30 Python/3.11.8 Linux/5.15",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::111122223333:assumed-role/ci-deployer/build-8814",
    "sessionContext": { "attributes": { "mfaAuthenticated": "false" } }
  },
  "requestParameters": { "userName": "svc-backup" },
  "responseElements": { "accessKey": { "accessKeyId": "AKIA...", "status": "Active" } },
  "errorCode": null,
  "readOnly": false,
  "managementEvent": true
}
```

Six fields carry nearly all the signal, and you should read them in this order every time:

1. **`userIdentity`** — who. Human, role, or machine? Assumed role, and if so from what? Was MFA used?
2. **`eventName`** — what. Is this a read or a change? Is it a change to a *security* control?
3. **`sourceIPAddress`** — from where. Corporate range, known workload, cloud provider IP, residential, anonymizing service, unfamiliar country?
4. **`eventTime`** — when. Working hours for this identity, or 02:41?
5. **`errorCode`** — did it work. A long run of failures followed by a success is a story.
6. **`userAgent`** — how. Console, official CLI, an SDK, or a tool name you do not recognize.

Now read the record above with those six. A CI deployment role — a machine identity — created a new access key for a different service account, at 02:41, from an address outside any known build infrastructure, without MFA, using a CLI rather than the pipeline's SDK. Every field individually is legal. Together they describe an attacker who obtained the CI role's credentials and is establishing persistence with a credential that will survive the CI role being rotated.

That is the skill. Not "is this call allowed" — it was allowed, that is why it succeeded — but **does this combination fit the pattern of the identity that made it.**

## What unauthorized access looks like

Attackers in cloud accounts follow a recognizable sequence, and each stage has a signature.

### Stage 1: Initial access

```text
SIGNAL                                       WHY IT MATTERS
Console sign-in without MFA                  Should be structurally impossible
Sign-in from an unusual country or ASN       Especially for a machine identity,
                                             which should have ONE source
Impossible travel between sign-ins           Two sessions, geographically
                                             incompatible with elapsed time
A long-dormant identity suddenly active      Nobody woke it up on purpose
Root / global admin authentication           Near-zero legitimate frequency
Failed sign-ins in volume, then a success    Password spray that landed
```

The strongest single detection in this stage is not about geography at all: **a machine identity used from an unexpected source.** A human's location is genuinely variable. A CI pipeline's identity should originate from exactly one place, forever. When it does not, that is nearly always a leaked credential and nearly never a false positive.

### Stage 2: Discovery

A credential arrives with unknown permissions, so the attacker enumerates. In the log this looks like a burst of read-only calls across many services from a principal that normally touches two:

```text
02:44:11  GetCallerIdentity        ci-deployer  203.0.113.88   success
02:44:13  ListUsers                ci-deployer  203.0.113.88   success
02:44:14  ListRoles                ci-deployer  203.0.113.88   success
02:44:16  ListAttachedUserPolicies ci-deployer  203.0.113.88   success
02:44:19  ListBuckets              ci-deployer  203.0.113.88   success
02:44:22  DescribeInstances        ci-deployer  203.0.113.88   success
02:44:24  ListSecrets              ci-deployer  203.0.113.88   AccessDenied
02:44:26  DescribeDBInstances      ci-deployer  203.0.113.88   success
02:44:31  GetBucketPolicy          ci-deployer  203.0.113.88   success
```

Note `GetCallerIdentity` first. It answers "who am I," which a legitimate deployment already knows. It is one of the most reliably suspicious first calls in cloud security, and combined with breadth in the following seconds it is a strong detection.

Note also the `AccessDenied`. **Access-denied events are your most underused signal.** Legitimate automation rarely attempts what it is not permitted to do; it was built to do a specific job. A principal generating denials across services it has never touched is either broken or being driven by someone who does not know what it can do. Both are worth a look, and this is also the feedback loop lesson 03 told you to watch after narrowing a policy.

### Stage 3: Persistence and privilege escalation

```text
CreateAccessKey / creating credentials for another identity
CreateUser, CreateRole, AttachRolePolicy, PutUserPolicy
Modifying a role's trust policy to allow an external account
Creating or altering an identity provider / federation trust
Adding an external principal to a resource policy or key policy
Creating a login profile for a service account
```

Every item on that list is a security-relevant change, they are all rare in a mature environment, and they are all things that automation does through a pipeline rather than ad hoc. This category deserves alerting on the *event class*, not on a threshold.

The trust-policy modification is worth calling out because it is quiet and devastating: changing a role so that a principal in an attacker-controlled account may assume it creates a permanent back door that looks like ordinary configuration and survives credential rotation entirely.

### Stage 4: Defense evasion

```text
StopLogging / DeleteTrail / disabling diagnostic settings
Deleting or modifying log sinks and export configurations
Disabling the provider's threat detection service
Deleting flow logs
Modifying alert rules or notification destinations
Deleting a customer-managed key or its rotation schedule
```

Highest-fidelity category in the entire log. Alert on all of it, page on most of it.

### Stage 5: Impact

```text
Making a bucket or storage container public
Sharing a snapshot with an external account
Adding an external account to a key policy
Large-volume data-plane reads outside the normal pattern
Bulk deletion of resources or backups
Creating expensive compute in an unused region (cryptomining)
```

Two of these are exfiltration methods that never touch your network path, which is why lesson 04's isolation does not detect them: **sharing a snapshot** and **making a bucket public** both move data using the provider's own machinery. Only the control-plane log sees them.

## Detections worth writing

Alert quality is the whole discipline. An alert that fires 200 times a day is a filter someone will disable. Build in tiers.

```yaml
# Tier 1 — page a human. Rare, unambiguous, high impact.
- name: audit-logging-disabled
  match: eventName in [StopLogging, DeleteTrail, UpdateTrail]
  severity: critical
  route: page on-call security

- name: root-or-global-admin-used
  match: userIdentity.type == Root OR role == GlobalAdministrator
  severity: critical
  route: page on-call security

- name: role-trust-extended-to-external-account
  match: eventName == UpdateAssumeRolePolicy
         AND new_principal.account NOT IN org_accounts
  severity: critical
  route: page on-call security

- name: storage-made-public
  match: eventName in [PutBucketAcl, PutBucketPolicy, DeletePublicAccessBlock]
         AND result grants principal "*"
  severity: critical
  route: page on-call security

# Tier 2 — ticket for review within the shift.
- name: machine-identity-from-new-source
  match: userIdentity is service principal
         AND sourceIPAddress NOT IN identity.known_sources(90d)
  severity: high
  route: SOC queue

- name: credential-created-for-another-identity
  match: eventName in [CreateAccessKey, CreateLoginProfile]
         AND requestParameters.userName != caller.userName
  severity: high
  route: SOC queue

- name: discovery-burst
  match: count(distinct eventName where readOnly==true) > 15
         by principal within 5m
         AND principal.baseline_distinct_events(30d) < 5
  severity: high
  route: SOC queue

- name: access-denied-burst
  match: count(errorCode == AccessDenied) > 10
         by principal within 10m
  severity: medium
  route: SOC queue

# Tier 3 — daily digest. Context, not urgency.
- name: new-principal-created
- name: security-group-opened-to-any-source
- name: key-policy-modified
```

Three techniques are doing the work here and they generalize beyond these examples.

**Baseline per identity, not globally.** `machine-identity-from-new-source` and `discovery-burst` both compare a principal against its own history. A global threshold is either noisy for busy identities or blind for quiet ones; a per-identity baseline is neither.

**Alert on rare event classes, not on volume.** Trust-policy changes and logging changes are rare by nature. You do not need a threshold; the event itself is the signal.

**Sequence beats singleton.** One `GetCallerIdentity` is nothing. `GetCallerIdentity` followed by fifteen distinct list calls in ninety seconds from a principal that normally makes three kinds of call is a compromised credential being explored. Most real detections are correlations, and this is where the provider's own threat detection services — which apply behavioral analytics across exactly these logs — earn their place alongside your hand-written rules.

## Routing the signal, which is the part being assessed

Detection that stops at a dashboard is not detection. The objective for this lesson ends with "and route the signal to a responder," because in your role that is usually the deliverable: you are the person who sees it and hands it on in a form someone can act on immediately.

The pipeline, end to end:

```text
Provider audit logs (all accounts, all regions)
    -> central immutable log archive account
    -> SIEM / log analytics workspace (normalized, correlated with identity
       context, network flow logs, and the provider's threat detection findings)
    -> detection rules, tiered
    -> Tier 1: page the on-call responder
       Tier 2: ticket in the SOC queue with full context attached
       Tier 3: daily digest reviewed at the morning stand-up
    -> the incident response process from cyb120 takes over
```

A cloud-specific wrinkle worth stating: **the first containment action for a cloud incident is usually an identity action, not a network action.** You do not unplug anything. You disable the credential, revoke active sessions, and — because short-lived tokens issued before the revocation remain valid until they expire — attach a deny policy to the principal so that existing sessions stop working immediately. That is the cloud equivalent of pulling the cable, and it is worth knowing before the night you need it.

The handoff artifact, which is what you actually produce:

```text
SECURITY EVENT HANDOFF
Ref:        SEC-2261                Raised: 2026-07-19 06:12Z
Raised by:  A. Nkemelu              Severity: CRITICAL
Detection:  machine-identity-from-new-source, then discovery-burst, then
            credential-created-for-another-identity (3 rules, 1 principal)

WHAT HAPPENED
Between 02:41 and 02:58Z the CI role ci-deployer was used from 203.0.113.88,
an address with no prior use by this identity in 90 days and outside the
build platform's published ranges. The session performed 19 distinct
read-only calls across IAM, storage, and RDS within 4 minutes, generated 3
AccessDenied events against the secrets service, then created a new access
key for the unrelated identity svc-backup. No MFA on the session.

EVIDENCE
  Log archive query: saved search "SEC-2261-timeline" (log account, 7d range)
  Key records: 02:41:07 CreateAccessKey (userName svc-backup)
               02:44:11-02:44:31 discovery sequence, 19 events
               02:57:44 GetSecretValue AccessDenied x3
  Source: 203.0.113.88, ASN unrelated to the build platform, no prior use
  Data plane: NO data-access log on the PHI bucket, so we CANNOT currently
              say whether records were read. This is the top open question.

WHAT I HAVE ALREADY DONE (pre-authorized containment)
  - Deactivated the new access key on svc-backup (02:41 key), 06:09Z
  - Preserved: exported the relevant log range to the evidence store

WHAT I HAVE NOT DONE (needs a decision)
  - Not disabled ci-deployer. Disabling it stops all deployments including
    hotfixes. Recommend disabling; asking first.
  - Not revoked existing sessions for ci-deployer. Recommend session-revocation
    deny policy, since the stolen token is valid until it expires.

RECOMMENDED NEXT STEPS
  1. Revoke sessions and rotate the ci-deployer credential
  2. Enable data-access logging on the PHI bucket immediately (we are blind)
  3. Determine how the credential leaked: build logs, repo, developer endpoint
  4. Audit every credential created in the last 30 days for similar patterns

ROUTED TO: J. Ferreira, on-call security responder, paged 06:12Z, acknowledged
           06:14Z. Handover call scheduled 06:30Z.
```

What makes that handoff good is not the detection. It is the four things underneath: the evidence is preserved and reproducible, the containment already taken is stated explicitly, the containment *not* taken is stated with the reason and a recommendation, and the gap in visibility is named rather than hidden. A responder can act on it in two minutes. That is the standard.

## Practice

All work runs in your own lab or sandbox account or against instructor-provided log data, with authorization confirmed before you begin. Analyze only logs you have been authorized to access.

**Exercise 1 — Triage records.**

For each record below, state: benign, suspicious, or malicious; which of the six fields decided it; and what one additional query you would run to confirm.

```text
a. userIdentity=Root, eventName=ConsoleLogin, MFA=true, 09:12 local, office IP
b. userIdentity=svc-etl, eventName=ListBuckets, 03:00, from the app subnet,
   a call this identity has never made before
c. userIdentity=a.reyes(human), eventName=CreateAccessKey for a.reyes, office
   IP, 14:20, MFA=true
d. userIdentity=ci-deployer, eventName=UpdateAssumeRolePolicy adding principal
   from account 999988887777, 11:04, from the build platform range
e. userIdentity=s.begum, 47 x ConsoleLogin failures then 1 success, 3 countries
   in 20 minutes
f. userIdentity=svc-backup, eventName=ModifySnapshotAttribute sharing a
   snapshot with account 999988887777, 02:15
```

**Exercise 2 — Verify the log configuration.**

In your lab account, audit the logging setup against this checklist and write a finding for each gap: control-plane logging on in every region; logs delivered to a separate account or project; archive immutable with a stated retention; archive key administered by someone other than the platform team; an organization-scope deny on log tampering; data-plane logging enabled on at least one sensitive store; sign-in and identity events captured; flow logs enabled on the production network. Include the exact query or command you used to verify each.

**Exercise 3 — Write and tune three detections.**

Write three detection rules in the YAML style above: one Tier 1 rare-event rule, one Tier 2 per-identity baseline rule, and one Tier 2 sequence rule. For each, state the malicious behavior it catches, the legitimate activity most likely to trigger it falsely, and the specific tuning you would apply to suppress that false positive without blinding the rule. Then generate the triggering activity in your own lab and paste the resulting log evidence.

**Exercise 4 — Reconstruct an intrusion.**

Your instructor provides an exported log range containing a simulated compromise. Produce a timeline that identifies the initial access, the discovery phase, the persistence mechanism, any defense evasion, and the impact, citing the specific records that support each stage. Then answer the question that decides severity: did the attacker read data, and what in the logs proves your answer — including the case where the answer is "we cannot tell, and here is the logging gap that caused that."

**Exercise 5 — Route it.**

From your Exercise 4 timeline, write the complete Security Event Handoff in the format above. It must include: the detections that fired, a plain-language narrative, reproducible evidence references, containment already taken, containment deliberately not taken with the reason and your recommendation, named open questions and visibility gaps, and the responder you routed it to with a timestamp. Then have a classmate read only your handoff and tell you what they would do first. If they have to ask you a question before acting, revise it.

## Check your understanding

1. Of the six fields, which one is most decisive when the identity is a CI pipeline role, and why?
2. Why is "audit logging was disabled" one of the highest-fidelity alerts you can write?
3. A responder asks whether patient records were read during an incident. What log must have been enabled beforehand to answer, and what do you write if it was not?

**Answers:** (1) `sourceIPAddress` — a machine identity should come from a fixed, known source, so a new source is almost always a leaked credential. (2) It has almost no legitimate cause and an unmistakable malicious one. (3) Data-plane (data-access) logging on that store; if it was off, state plainly that you cannot determine whether data was read and name the gap as a finding.
