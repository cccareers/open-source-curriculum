---
course_id: net260
media_id: net260-a01
type: animation-storyboard
title: "Implicit Deny, Explicit Deny, Allow: How a Cloud API Call Is Decided"
target_runtime: "100 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - net260-03
  - net260-07
objectives:
  - Apply least-privilege identity and access policy to a cloud account and detect over-permissive grants
competency_ids:
  - D6-S1-C01
  - D2-S1-C03
---

## Concept and misconception it fixes

Two misconceptions:

1. "If someone has an allow, they can do it." In fact an explicit deny anywhere wins. That's why an organization-scope deny on log tampering survives a compromised administrator.
2. "A grant on one resource group is the same as one on the subscription." In fact inheritance is additive and downward, so scope is the blast radius.

The animation walks one API call through lesson 03's five-step evaluation, then replays it with scope changes.

## Visual language

- An API call is a token labelled `principal · action · resource`.
- A scope tree is drawn as nested boxes: Organization ⊃ Account/Subscription/Project ⊃ Resource group/Folder ⊃ Resource.
- Policies are cards pinned to boxes, with three card types: ALLOW (rounded), DENY (octagon, like a stop sign), and conditions as a small tag on a card.
- Palette (Okabe-Ito): blue #0072B2 for allow, vermillion #D55E00 for deny, yellow #F0E442 for the card being evaluated, grey for implicit deny. Card shape carries the meaning without color.

## Scenes

| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8 s | Token `svc-exporter · s3:GetObject · clinic-exports/nightly/f.csv` enters a grey field labelled "IMPLICIT DENY". | Token drops in. | "Every call starts denied. Nothing is permitted until something permits it." |
| 2 | 14 s | Scope boxes light up from the resource upward; all cards attached to the principal and to each box (identity policy, bucket policy, inherited cards) fly to a table. | Cards collect. | "Gather every policy that applies: on the identity, on the resource, and everything inherited from above." |
| 3 | 10 s | The table is scanned for octagons; none match. The rounded ALLOW card `s3:GetObject on clinic-exports/nightly/*` with condition tag `SecureTransport=true` highlights. Its condition checks ✓ (the call arrived over TLS). | Scan; match glows blue. | "No explicit deny. One allow matches, and its condition holds. Allowed." |
| 4 | 12 s | Replay: same call over plain HTTP. The condition tag shows ✗; the allow no longer applies; result falls back to grey "implicit deny". | Condition tag flips. | "Same call over plain HTTP: the condition fails, so the allow doesn't apply. Back to implicit deny." |
| 5 | 16 s | New token: `ci-deployer · cloudtrail:StopLogging · *`. ci-deployer has an ALLOW `* on *` card. At the Organization box, an octagon card reads "Deny StopLogging, DeleteTrail…". The octagon slams over the allow. Result: DENY ✗. | Octagon drops from the top box. | "The CI role is an administrator. But a deny at the organization level wins, every time, at every scope below it. That's how logging survives a compromised admin." |
| 6 | 16 s | Scope comparison: two identical ALLOW cards "Contributor". One pinned on a single resource group (small box glows), the other on the subscription (entire tree glows). A counter shows "resources in reach: 12" vs. "1,840". | Glow spreads down the tree. | "Two grants that look identical in a list. One reaches twelve resources; the other, inherited downward, reaches eighteen hundred. Scope is blast radius." |
| 7 | 12 s | Escalation cameo: `svc-ops-launcher` has ALLOW `ec2:RunInstances` and `iam:PassRole` on `*`. It launches an instance token wearing the "admin role" badge; credentials flow back to it. | Instance pops up; badge transfers. | "No IAM-write permission at all, yet it can launch a machine with the admin role attached and borrow it. Effectively an administrator." |
| 8 | 12 s | Summary card with the five steps: Implicit deny → Gather (incl. inherited) → Explicit deny wins → Any allow? → Else deny. Plus: "Always record the scope." | Steps tick in. | "Implicit deny, gather everything, explicit deny wins, any allow permits, otherwise denied. And always record the scope." |

## Interaction variant

A step-through evaluator. The learner picks a principal, action, and resource, toggles TLS on or off, toggles an org-level deny, and moves a grant between scopes. The evaluator shows which card decided the outcome. Preload the five cases from lesson 03, Exercise 1, as challenge mode, with the answer revealed after the learner commits.

## Production notes

- Use AWS-style action names in the main pass. Add an optional caption track that maps the scope tree to Azure (management group > subscription > resource group) and Google Cloud (organization > folder > project).
- Service control policies have no `Principal`. Keep the org-deny card label generic ("organization policy: deny").
- Reuse the scope-tree asset in the lesson 11 posture-review briefing.
