---
course_id: net260
media_id: net260-v01
type: video-script
title: "02:41, ci-deployer, CreateAccessKey: Reading a Control-Plane Record Like a Responder"
format: screencast
target_runtime: "8 min"
related_lessons:
  - net260-07
  - net260-03
objectives:
  - Detect unauthorized access in cloud audit logs and route the signal to a responder
competency_ids:
  - D6-S1-C02
  - D1-S1-C04
---

## Purpose

After watching, the learner can read a control-plane audit record in the six-field order from lesson 07 and judge whether it fits the identity that made it. They can recognise the discovery, persistence, and evasion signatures, and they can state the first identity-based containment step.

## Audience and prerequisites

Apprentices on lesson 07, after lesson 03. The records are AWS-shaped. Narration names the Azure and Google Cloud counterparts once.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Black screen, a single JSON record fades in (lesson 07's `CreateAccessKey` record). | "This call was allowed. It succeeded. Every field in it is legal. And it's the moment an attacker made sure they'd survive you rotating the credential they stole. Let's read it the way a responder does." |
| 0:20 | Title card: "Six fields, in order: who, what, from where, when, did it work, how." | "Lesson 07 gives you an order. Who, what, from where, when, did it work, how. The order matters, because 'who' changes how you read everything else." |
| 0:40 | Highlight `userIdentity`: `AssumedRole … ci-deployer/build-8814`, `mfaAuthenticated: false`. | "Who: an assumed role, ci-deployer. A machine identity, the CI pipeline. No MFA, which is normal for a machine. So the next question is whether this machine is behaving like itself." |
| 1:10 | Highlight `eventName: CreateAccessKey`, `requestParameters.userName: svc-backup`. | "What: CreateAccessKey. A change, and a change to a security control. And look at requestParameters: the key is for svc-backup, a different identity. A pipeline that deploys the clinic app has no reason to mint keys for the backup service." |
| 1:45 | Highlight `sourceIPAddress: 203.0.113.88`. Side panel: "ci-deployer known sources (90d): build platform ranges only." | "From where: 203.0.113.88. A human's location varies. A pipeline's identity should come from one place, forever. This address has never been used by this identity in ninety days. That alone is the strongest signal on the page." |
| 2:20 | Highlight `eventTime: 02:41:07Z`. | "When: 02:41. Builds can run at night, so on its own this is weak. Together with the source address, it isn't." |
| 2:35 | Highlight `errorCode: null`, `userAgent: aws-cli/2.15.30 …`. | "Did it work: yes, no error. How: the AWS CLI. The real pipeline uses the SDK inside the deploy job, so this client doesn't fit the identity. The user agent can't tell you whether a person or a job ran it; confirm against the pipeline configuration and job logs before you write that down." |
| 3:00 | Summary overlay: "Every field legal. Combination wrong." | "Not one of these fields breaks a rule. The combination doesn't fit the identity. That's the whole skill: not 'is this allowed', but 'does this fit who did it'." |
| 3:20 | Screencast: log query tool (CloudTrail Lake / Athena / any SIEM) running a filter for `userIdentity.arn LIKE '%ci-deployer%' AND sourceIPAddress = '203.0.113.88'`, sorted by time. Results show 02:44:11 GetCallerIdentity, then ListUsers, ListRoles, ListBuckets, DescribeInstances, ListSecrets (AccessDenied)… | "Now widen out. Same principal, same source, the whole window. Three minutes after the key creation: GetCallerIdentity. 'Who am I?' A real deployment already knows. Then a burst of list calls across IAM, storage, compute, and an AccessDenied on secrets." |
| 4:10 | Highlight the AccessDenied row. | "Access-denied events are your most underused signal. Automation is built for one job and doesn't try things it can't do. Someone exploring a stolen credential does." |
| 4:35 | Stage ladder graphic from lesson 07: Initial access → Discovery → Persistence → Evasion → Impact; the three observed events placed on it. | "Put it on the ladder. Initial access: a machine identity from a new source. Discovery: the burst. Persistence: a new key for another identity. Next you'd watch for evasion: StopLogging, deleting flow logs. That's why the organization-level deny on CloudTrail tampering exists; flow-log deletion needs its own control, such as denying ec2:DeleteFlowLogs too." |
| 5:15 | Side-by-side: "Azure: Activity Log + Entra ID sign-in logs" / "Google Cloud: Admin Activity audit logs". | "On Azure, the same story spans the Activity Log and the Entra ID sign-in logs, and you need both wired up. On Google Cloud, the Admin Activity audit log. The field names change; the six questions don't." |
| 5:40 | Containment card: 1. Deactivate the new svc-backup key. 2. Attach a deny policy to ci-deployer to kill existing sessions. 3. Rotate / move ci-deployer to workload identity federation. | "Containment in the cloud starts with identity, not the network. Deactivate the key they created. Then, because tokens issued before you rotate stay valid until they expire, attach a deny policy to the role so existing sessions stop now. Long term, ci-deployer shouldn't have a static key at all. That was finding F1 in lesson 03." |
| 6:30 | The Security Event Handoff from lesson 07 scrolls; highlight "WHAT I HAVE NOT DONE" and "Data plane: NO data-access log… CANNOT currently say". | "Then route it. The handoff states what you did, what you didn't do and why, and the gap. Here the gap is that data-access logging was off on the PHI bucket, so nobody can say whether records were read. Name that gap. Don't hide it." |
| 7:20 | Recap: "Who · What · Where · When · Worked? · How" and "Machine identity + new source = look now." | "Six fields, in order. A machine identity from a new source means you look now. And the first move is an identity move." |
| 7:45 | End card: "Now: Exercise 1, triage six records." | — |

## On-screen assets and B-roll

- The record and discovery sequence from lesson 07, verbatim (documentation IP `203.0.113.88`, account `111122223333`).
- Any log query UI from a **lab account** or instructor-provided log export. Do not record a production console.
- Stage-ladder graphic, reused in animation `net260-a01`'s end card.

## Accessibility

- Captions. Each highlighted field is read aloud with its value.
- Highlights use outlines plus labels. The ladder stages are numbered.
- The query text is also given in the transcript, in full.

## Check for understanding

1. Why is `sourceIPAddress` more decisive for `ci-deployer` than for a human user? *Answer: a machine identity should come from a fixed, known source; a new source is nearly always a leaked credential, while human locations legitimately vary.*
2. What does `GetCallerIdentity` followed by many distinct list calls suggest? *Answer: someone discovering what an unfamiliar credential can do, which is the discovery stage after initial access.*
3. Why attach a deny policy instead of only rotating the credential? *Answer: short-lived session tokens issued before rotation stay valid until they expire; an explicit deny stops them immediately.*
