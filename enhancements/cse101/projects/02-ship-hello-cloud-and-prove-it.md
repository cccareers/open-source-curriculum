---
course_id: cse101
project_id: cse101-x02
title: "Ship hello-cloud and Prove It Serves Traffic"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - cse101-03
  - cse101-08
  - cse101-09
objectives:
  - Deploy a simple application to a cloud environment and verify it is serving traffic
  - Explain how virtualization, containers, and serverless functions divide physical hardware into usable compute
  - Explain a cloud concept or a cloud bill to a non-technical customer in plain language
competency_ids:
  - D1-S1-C02
  - D2-S1-C02
  - D5-S1-C01
---

## Scenario

Talbot & Vine's contractor wants a dry run before moving the project-tracking app: take the `hello-cloud` service from lesson 08, prove it is deployable, prove from outside that it serves traffic, and leave behind a runbook and a verification script the studio could re-run after any future deployment. The owner also wants a two-paragraph note explaining what was deployed and what it would cost per month, in plain language.

## What you will build / produce

- `app.py`, `requirements.txt`, `Dockerfile` — lesson 08's app, with the `${PORT}`-aware start command.
- `verify.sh` — a script that takes a base URL and an expected version and produces the evidence pack.
- `EVIDENCE.md` — the output of `verify.sh` against local and (optionally) cloud targets, plus the outside-network check.
- `RUNBOOK.md` — the nine-section runbook from lesson 08.
- `OWNER-NOTE.md` — plain-language summary for the owner (answer first, one cost number, what happens next).
- `teardown-checklist.md` — every resource created and how you confirmed it was deleted.

## Before you start (prerequisites, starter files or data)

- Docker and `curl`; `dig` (from `bind-utils`/`dnsutils`) for the DNS check.
- `requirements.txt` containing `flask` and `gunicorn` (pin versions you tested).
- **Two paths.** *Local path* (no account): run the container on Docker and expose it to another device on your network or through a temporary tunnel your instructor approves. *Cloud path*: any provider's managed container service with a free allowance. Before creating anything on the cloud path, create a budget alert at a small amount (for example the smallest whole-currency amount the console allows) and screenshot it. Free-tier allowances change; read the provider's free-tier page on the day and record what it said.

## Milestones

1. **Make it deployable.** Implement the five readiness rules. Confirm `docker run -e PORT=9090 -p 9090:9090 ...` serves on 9090 — this proves the port truly comes from the environment.
2. **Break it on purpose.** Rebuild with `--bind 127.0.0.1:${PORT}`; record what `curl` from the host reports. Restore.
3. **Write `verify.sh`** (sketch below) and run it against `http://localhost:8080`.
4. **Deploy.** Local path: run detached with `--restart unless-stopped`. Cloud path: push the image (build for the target architecture, e.g. `docker buildx build --platform linux/amd64`), create the service with `APP_VERSION` and `APP_ENV` set, and use the platform-generated HTTPS hostname.
5. **Verify from outside.** Run `verify.sh` against the public URL; load it from a phone on mobile data; find your own request in the platform log viewer (cloud path) or `docker logs` (local path).
6. **Roll forward and back.** Deploy `APP_VERSION=1.0.1` with a changed `GREETING`, verify, roll back to 1.0.0, verify again, record time from decision to verified.
7. **Explain it.** Write `OWNER-NOTE.md`, under 200 words, including the monthly cost figure and what drives it.
8. **Tear down.** Delete the service, the image in the registry, any generated load balancer or certificate, and the budget alert only after confirming the cost console shows nothing accruing.

## Acceptance criteria

- [ ] Service starts on whatever `PORT` is supplied and binds `0.0.0.0`.
- [ ] `verify.sh` exits 0 against the deployed target and non-zero when the service is stopped.
- [ ] `/version` matches the version you deployed, before and after rollback.
- [ ] 20 sequential requests: all 200, with median and worst latency reported.
- [ ] Evidence of one load from a network you do not control (time, device, network).
- [ ] Runbook lets a classmate deploy a one-line change without asking you anything (record their notes).
- [ ] Owner note leads with the answer, contains a number, and uses no unexplained jargon.
- [ ] Teardown checklist complete; cloud path includes a post-teardown cost-console screenshot.

## Automated checks (coding courses) / Evidence checklist (non-coding)

```bash
#!/usr/bin/env bash
# usage: ./verify.sh https://hello.example.app 1.0.0
set -uo pipefail
BASE=${1:?base url}; WANT=${2:?expected version}; fail=0
ok(){ echo "PASS  $1"; }; bad(){ echo "FAIL  $1"; fail=1; }

HOST=$(echo "$BASE" | sed -E 's#^https?://([^/:]+).*#\1#')
if [ "$HOST" != "localhost" ]; then
  [ -n "$(dig +short "$HOST")" ] && ok "DNS resolves: $(dig +short "$HOST" | head -1)" || bad "DNS does not resolve"
fi

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")
[ "$code" = 200 ] && ok "GET / -> 200" || bad "GET / -> $code"

curl -s "$BASE/healthz" | grep -q '"status": *"ok"' && ok "healthz ok" || bad "healthz not ok"

got=$(curl -s "$BASE/version" | sed -E 's/.*"version": *"([^"]+)".*/\1/')
[ "$got" = "$WANT" ] && ok "version $got" || bad "version $got, wanted $WANT"

if [[ "$BASE" == https://* ]]; then
  curl -sv "$BASE/" -o /dev/null 2>&1 | grep -qi 'SSL certificate verify ok' \
    && ok "TLS certificate verifies" || bad "TLS verification not confirmed"
fi

times=$(for i in $(seq 1 20); do curl -s -o /dev/null -w '%{http_code} %{time_total}\n' "$BASE/"; done)
non200=$(echo "$times" | awk '$1!=200' | wc -l | tr -d ' ')
[ "$non200" = 0 ] && ok "20/20 requests 200" || bad "$non200 of 20 requests not 200"
echo "$times" | awk '{print $2}' | sort -n | awk '{a[NR]=$1} END{print "median " a[int((NR+1)/2)] "s, worst " a[NR] "s"}'

[ $fail -eq 0 ] && echo "VERIFIED" || { echo "NOT VERIFIED"; exit 1; }
```

The TLS line depends on curl's verbose wording, which varies by TLS backend; if it fails on a valid certificate, replace it with `curl -sS --fail "$BASE/healthz"` (which fails on an invalid certificate by default) and note the change.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Deployability | Port or bind hard-coded | All five readiness rules met and demonstrated | Each rule's broken symptom recorded with exact error text |
| Verification | "It works in my browser" | `verify.sh` passes from outside and fails when stopped | Adds a check that the response comes from the new revision during rollout |
| Rollback | Not attempted | Rolled back and re-verified, time recorded | Rollback rehearsed twice with time reduced and steps tightened in runbook |
| Communication | Jargon-heavy or no number | Owner note answer-first with a cost figure and driver | Includes what the studio must still do itself, per the responsibility line |
| Cost safety | No teardown evidence | Teardown checklist complete | Budget alert created before deployment and shown in evidence |

## Stretch goals
- Deploy the same image to a second provider's managed container service and write a three-row Rosetta comparison of what differed.
- Add a deliberately failing `/healthz` (environment flag) and show how the platform's health check removes the instance.
- Measure cold-start latency after scale-to-zero, if your platform scales to zero.

## Reflection prompts
- Which of the nine deployment steps would you most likely skip under time pressure, and what would it cost you?
- What did the outside-network check reveal that a local check could not?
- Where in your owner note did you have to translate a term, and what words did you choose?

## Instructor notes (common pitfalls, how to adapt for time)
- ARM laptops pushing to x86 hosts produce `exec format error`; `docker buildx --platform` fixes it.
- Learners forget to delete registry images and generated load balancers; the checklist must include "resources the platform created on your behalf".
- The local path is fully acceptable for assessment of verification and runbook skills; only the outside-network check needs a reachable URL.
- Short on time: drop milestone 6 and the stretch goals.
