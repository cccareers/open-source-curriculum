---
course_id: net260
media_id: net260-v02
type: video-script
title: "One SSRF, Two Severities: How IMDSv2 and a Scoped Role Change the Finding"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - net260-06
  - net260-08
objectives:
  - Harden cloud compute and container workloads against the misconfigurations that cause most cloud incidents
  - Assess a deployed application for common vulnerability classes and record the findings
competency_ids:
  - D6-S1-C01
  - D6-S1-C03
---

## Purpose

After watching, the learner can explain why server-side request forgery is escalated in cloud environments. They can verify an instance's metadata settings and write an SSRF finding that states both the application flaw and the infrastructure mitigation, with severity justified by cloud context.

## Audience and prerequisites

Apprentices on lessons 06 and 08. The demo runs on an instance in the presenter's own **lab** account. No application exploitation is shown. The "SSRF" is simulated by running `curl` on the instance itself, which is exactly the request a vulnerable application would be tricked into making.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head. Lower third: "Lab account only. Authorization: SEC-2274." | "An application that fetches a URL you give it is a modest bug in a data centre. In the cloud it can hand an attacker your credentials. Let's see why, and then see how two settings change the severity." |
| 0:25 | Diagram: user → app (`/import-avatar?url=`) → "fetch" arrow → `169.254.169.254`. | "Server-side request forgery means the server makes a request on your behalf to a place you choose. Every cloud VM has a link-local metadata address that hands out the workload's own credentials." |
| 0:55 | Screencast: SSH via managed session (Session Manager) into a lab instance launched with `http_tokens = optional`. Run `curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/`. Output: role name `clinic-app-role`. | "This lab instance allows the legacy metadata protocol. One plain GET returns the name of the attached role." |
| 1:30 | Run `curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/clinic-app-role`; the JSON response is shown with `AccessKeyId`, `SecretAccessKey`, `Token`, all **blurred**, and `Expiration` visible. | "A second GET returns temporary credentials. I've blurred them. If an application can be made to issue those two GETs, this is what comes back in its response: no code execution, just a URL." |
| 2:05 | Talking head. | "What happens next depends entirely on lesson 03: what that role can do. If it's the over-broad one from the hardening review, account-wide storage read, then this finding is critical." |
| 2:30 | Screencast: apply the lesson 10 Terraform `metadata_options { http_tokens = "required"; http_put_response_hop_limit = 1 }` (or `aws ec2 modify-instance-metadata-options --instance-id <id> --http-tokens required --http-put-response-hop-limit 1`). | "Now enforce token-required metadata, IMDSv2, and a hop limit of one. Same instance." |
| 3:00 | Repeat the plain GET. Response: `401 - Unauthorized`. | "The same plain GET now gets 401. A token is required, and getting one needs a PUT with a special header, which a simple 'fetch this URL' feature normally can't send." |
| 3:25 | Show the legitimate path: `TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')` then GET with `-H "X-aws-ec2-metadata-token: $TOKEN"` succeeds. | "The SDKs on the instance still work. They do the PUT first. Legitimate use is unchanged; the forged GET is dead." |
| 3:55 | Callout: "Hop limit 1 = a container on this host can't relay through to the host's metadata." Also: "Azure and Google Cloud require a `Metadata: true` / `Metadata-Flavor: Google` header." | "The hop limit stops a container on the host from reaching the host's metadata through an extra network hop. Azure and Google Cloud get similar protection by requiring a header on metadata requests." |
| 4:25 | Split screen: two finding cards side by side. Left: "SSRF in /import-avatar; legacy metadata allowed; role has account-wide storage read → CRITICAL". Right: "Same SSRF; IMDSv2 required, hop limit 1; role scoped to one bucket prefix → HIGH". | "Here's the point for your report. Same application bug, two environments. Left: legacy metadata plus a broad role, critical. Right: tokens required and the role scoped to one prefix, still high, because SSRF can reach other internal services, but not catastrophic. Lesson 08 tells you to say which situation you're in, with evidence." |
| 5:20 | Show the "CLOUD CONTEXT" section of a finding being typed, quoting the Terraform line as evidence. | "Cite the infrastructure line as evidence. 'metadata_options http_tokens required, commit 9f2c1ab.' That sentence connects three lessons, and it gets findings prioritized correctly." |
| 5:50 | Org-policy card: "Prevent the regression: deny instance launch without `http_tokens = required` (account/org policy or IaC policy-as-code)." | "Then make it stick. An org-level policy or a lesson 09 IaC rule that refuses any instance without required tokens turns this from a recurring finding into something that can't happen." |
| 6:20 | Talking head recap. | "SSRF plus legacy metadata is a stolen credential. Require tokens, set the hop limit, scope the role, and write the finding with both halves." |
| 6:45 | End card: "Now: lesson 06 Exercise 3." | — |

## On-screen assets and B-roll

- A single lab instance with a minimal role (`clinic-app-role`), launched with legacy metadata allowed, then hardened.
- All credential values blurred in post. Never show even expired credentials unblurred.
- Confirm current AWS CLI flag names (`modify-instance-metadata-options`) and the 401 response wording before recording.

## Accessibility

- Captions. Command output is read aloud in summary.
- Blurred regions are described ("access key value hidden").
- Finding cards use the words CRITICAL and HIGH in addition to color.

## Check for understanding

1. Why does requiring a session token defeat a basic SSRF against the metadata service? *Answer: obtaining a token needs a PUT with a specific header, which a simple URL-fetch feature cannot usually issue; a plain GET gets 401.*
2. What does a hop limit of 1 add? *Answer: it stops responses from travelling an extra network hop, so containers behind the host's network layer can't reach the host's metadata.*
3. An SSRF exists but metadata is hardened and the role is tightly scoped. Is it still a finding? *Answer: yes. It can still reach other internal endpoints. Severity drops, and the cloud-context section explains why.*
