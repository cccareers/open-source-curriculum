---
course_id: cse101
media_id: cse101-v02
type: video-script
title: "\"Deployed\" Is Not \"Serving Traffic\": Verifying From Outside"
format: screencast
target_runtime: "8 min"
related_lessons:
  - cse101-08
objectives:
  - Deploy a simple application to a cloud environment and verify it is serving traffic
competency_ids:
  - D1-S1-C02
---

## Purpose
After watching, the learner can run the five outside-in verification checks on a deployed web service, read each result, and recognise the three most common first-deployment failures from their symptoms.

## Audience and prerequisites
Apprentices working through lesson 08. Assumes Docker installed and the `hello-cloud` sample built locally. The demo uses a local container and a platform-generated HTTPS hostname; the provider is not named on screen, and any managed container platform will look similar.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Console page showing a green "Deployed" badge next to a service named `hello-cloud`. | "This badge says deployed. That's a status in a console. It doesn't tell you a single customer can reach this thing. Let's prove it from the outside." |
| 0:15 | Terminal, large font. `docker run --rm -p 8080:8080 -e PORT=8080 -e APP_VERSION=1.0.0 hello-cloud:1.0.0` then `curl -i http://localhost:8080/healthz`. Output: `HTTP/1.1 200 OK` and `{"status":"ok","uptime_seconds":3.2}`. | "Step zero happens before the cloud: run it locally exactly as the platform will. Port from the environment, version from the environment. Health check returns 200. If this fails here, it will fail there, and debugging it here is free." |
| 0:45 | Split screen. Edit Dockerfile CMD to `--bind "127.0.0.1:${PORT:-8080}"`, rebuild, rerun, `curl` shows `curl: (52) Empty reply from server` or `Connection reset by peer`. | "Watch what one word does. I'll bind to 127.0.0.1 instead of 0.0.0.0. Inside the container, the app is listening. From outside — nothing. That's exactly what the platform's health checker sees, and it's why so many first deployments say 'unhealthy' while working fine on a laptop. Put it back to 0.0.0.0." |
| 1:30 | Terminal: `dig +short hello-abc123.example.app` → an IP address. | "Now the deployed version. Check one: does the name resolve? If dig returns nothing, nobody can reach you, no matter what the console says." |
| 1:50 | `curl -iv https://hello-abc123.example.app/ 2>&1 \| head -40`. Highlight lines: `SSL certificate verify ok`, `subject: CN=...`, `HTTP/2 200`. | "Check two: does it answer over TLS, with a valid certificate and a 200? I'm looking for three lines: certificate verify OK, the hostname on the certificate matching the one I asked for, and the status code." |
| 2:30 | `curl -i https://.../healthz` → 200 + JSON. | "Check three: the health endpoint. Fast, no authentication, no dependencies." |
| 2:45 | `curl -s https://.../version` → `{"environment":"prod","version":"1.0.0"}`. | "Check four, the one people skip: is the running version the one I just shipped? A deploy can succeed while traffic still goes to the old revision. This endpoint settles it in one line." |
| 3:05 | The 20-request loop from lesson 08. Output: twenty lines like `200 0.143`. | "Check five: more than one request. Twenty in a row. I want twenty 200s and latencies that look like each other. One 502 in twenty usually means one unhealthy instance behind the load balancer." |
| 3:40 | Phone screen recording (mobile data icon visible) loading the URL. Caption with time and network. | "Then the checks a terminal can't do. Load it from a network that isn't mine — here, a phone on mobile data. I write down the time, the device, and the network. A page that only loads from my office isn't published." |
| 4:10 | Platform log viewer, filtered to the last 5 minutes; highlight gunicorn's `Listening at: http://0.0.0.0:8080` line and an access line `GET /version 200`. | "Find your own request in the platform's log viewer — the one the customer will use at 2 a.m., not a terminal I left open. There's the start-up line from gunicorn, and there's my request to /version." |
| 4:40 | Metrics pane showing a small request-count bump and a latency line. | "Metrics pane: non-zero requests, plausible latency. Now — and only now — it's done." |
| 5:00 | Title card: "Three failures, three symptoms". | "Let's break it three ways so you recognise the symptoms." |
| 5:10 | Platform event log: container restarting repeatedly, "health check failed on port 8080". | "One: health check fails, container keeps restarting. Check the bind address and the PORT variable first. Nearly always one of those two." |
| 5:40 | Deploy event: `exec format error`. | "Two: exec format error. This image was built on an ARM laptop and the host is x86. Rebuild with `docker buildx build --platform linux/amd64`." |
| 6:05 | Container exits with code 137 in the event list. | "Three: exit code 137. The kernel killed the process for exceeding its memory limit — the cgroup ceiling from lesson 03. Compare the configured memory with what the app actually uses." |
| 6:35 | Back to terminal: `./verify.sh https://hello-abc123.example.app 1.0.0` → list of PASS lines and `VERIFIED`. | "Do this often enough and you'll script it. Here's a verification script that runs all five checks and fails loudly. Attach its output to the ticket — that's your evidence." |
| 7:10 | Console: deleting the service, the registry image; cost console showing no running resources. | "And if this was a demo: delete it. The service, the image, anything the platform created for you. Then check the cost console. A forgotten demo is a bill that arrives thirty days later." |
| 7:40 | End card listing the five checks. | "Resolve, TLS and status, health, version, many requests. Then a foreign network, the log viewer, the metrics. That's what 'serving traffic' means." |

## On-screen assets and B-roll
- Terminal at 18pt minimum, light-on-dark with high contrast; commands typed live, outputs pre-checked.
- Placeholder hostname `hello-abc123.example.app` — replace with the real generated hostname at recording, then delete the service.
- Phone screen capture with mobile-data indicator visible.
- `verify.sh` from project `cse101-x02`.

## Accessibility
- Captions; every command is also read aloud and provided in a downloadable text file.
- Highlights on terminal output use a box outline plus bold, not colour alone.
- All demos are keyboard-driven; no mouse-only interactions are required to follow along.
- Describe the phone screen verbally ("the page loads, showing 'Hello from the cloud (prod)'").

## Check for understanding
1. The console says "Deployed" but `/version` returns `0.9.0`. What happened and what do you check? *Answer: Traffic is still on the old revision (or an old tag was cached); check the platform's revision list and traffic split.*
2. Why bind `0.0.0.0` inside a container? *Answer: Loopback inside the container's network namespace is unreachable from outside it, including by the health checker.*
3. Name one check that cannot be done from your own terminal and why it matters. *Answer: Loading from a foreign network — proves DNS and routing work beyond your local cache and network.*
