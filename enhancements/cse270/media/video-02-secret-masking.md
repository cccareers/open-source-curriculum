---
course_id: cse270
media_id: cse270-v02
type: video-script
title: "What Secret Masking Does and Doesn't Do"
format: screencast
target_runtime: "6 min"
related_lessons:
  - cse270-06
  - cse270-07
objectives:
  - Automate a deployment with a continuous integration and delivery pipeline
competency_ids:
  - D4-S1-C03
---

## Purpose
After watching, the learner can store and scope a pipeline secret, explain exactly what log masking protects, and recognise three ways a secret leaks despite masking.

## Audience and prerequisites
Apprentices in lesson 06. Demo uses GitHub Actions (named, because the UI is specific) with a **dummy** secret whose value is `demo-NOT-A-REAL-KEY-7781`. No real credential appears at any point.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Repo settings → Secrets and variables → Actions → New repository secret: `DEMO_TOKEN = demo-NOT-A-REAL-KEY-7781`. | "This is a dummy secret. It looks like a key and grants nothing. Never run this demo with a real credential — the point is to watch things leak." |
| 0:25 | Workflow file: job `deploy` with `env: DEMO_TOKEN: ${{ secrets.DEMO_TOKEN }}` and `run: echo "token is $DEMO_TOKEN"`. | "The secret is injected as an environment variable for one step. Now the mistake everyone is told not to make: echo it." |
| 0:55 | Job log: `token is ***`. | "The runner masks it. Three stars. This is the feature people think protects them. It does — for exactly this case." |
| 1:20 | Step 2: `echo "$DEMO_TOKEN" \| rev`. Log shows `1877-YEK-LAER-A-TON-omed` in full. | "Reverse it, and it prints in full. Masking matches the exact stored string. Anything you transform is a different string." |
| 1:50 | Step 3: `echo "https://user:${DEMO_TOKEN}@example.test"` and `echo "$DEMO_TOKEN" \| base64`. Log: URL masked portion depends; base64 output in full. | "Base64 it — prints. Build it into something else and you're relying on luck. Encoding is not encryption, and the runner doesn't know your encoding." |
| 2:30 | Step 4: `curl -v -H "Authorization: Bearer $DEMO_TOKEN" https://example.test` (dummy endpoint) — verbose output shows header masked, but explain risk with a tool that splits lines. | "Verbose tools print headers. If a tool wraps or splits the value across lines, the exact-string match fails. Turn verbose off in pipelines that carry credentials." |
| 3:10 | Workflow file rewritten: secret moved to `environment: production` with protection rule; `lint` and `test` jobs show no `secrets.` references. | "Now the fix that actually matters: scope. Put the secret on the production environment, so only the deploy job can read it. The lint job can't leak what it never receives." |
| 3:50 | Diagram: runner exchanges OIDC token for a short-lived cloud credential; caption "provider-specific setup". | "Better still, don't store a long-lived key at all. Most platforms let the runner exchange a signed identity token for a temporary cloud credential. It expires in minutes. A key that never expires is a key you'll forget you issued." |
| 4:30 | Repo settings: delete `DEMO_TOKEN`. Actions run list: delete the demo runs. | "Clean up: delete the dummy secret and the demo runs. And remember — if a real secret ever leaks, deleting the log doesn't fix it. Rotation does." |
| 5:00 | Recap card: "Masking = exact string only. Scope secrets to the job that needs them. Prefer short-lived federated credentials. Leaked → rotate." | "Masking is a seatbelt, not a vault. Scope, short lifetimes, and rotation are the vault." |

## On-screen assets and B-roll
- A throwaway public or private test repository; never a real project repository.
- Prepared workflow file with four steps; the dummy value is visible in the narration on purpose.

## Accessibility
- Captions; log output is read aloud including the masked `***`.
- Provide workflow YAML as text.
- Diagram uses labelled boxes and arrows, no colour-only meaning.

## Check for understanding
1. Why did `rev` print the secret in full? *Answer: Masking matches only the exact stored string; a transformed value is a different string.*
2. Which change most reduces exposure: masking, scoping, or short-lived credentials? *Answer: Scoping and short-lived credentials; masking only hides exact echoes.*
3. A key appeared in a public log for ten minutes. What is the remedy? *Answer: Rotate it immediately; deleting the log does not undo exposure.*
