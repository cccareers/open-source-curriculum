---
lesson_id: cse101-08
course_id: cse101
pathway: cloud-support-engineer
title: Deploying Your First Cloud Application
order: 8
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Deploy a simple application to a cloud environment and verify it is serving
    traffic
---

## What a deployment actually is

A deployment is the act of taking an artifact that works somewhere you control and making it run somewhere you do not, reachable by people who are not you. Every difficult part of it comes from that second half of the sentence. The code rarely changes. What changes is that the machine is not yours, the port is not yours to choose, the filesystem will not persist, the configuration has to arrive from outside, and the only way you will ever see what happened is whatever the platform decided to show you.

This lesson is the first time the previous six compose. You will pick a compute abstraction (lesson 03), give the deployment identity narrow permissions (lesson 06), put persistent data somewhere that is not the instance (lesson 05), keep one eye on what it costs (lesson 07), and know exactly which failures are yours and which are the platform's (lesson 02). And because the competency here is *assisting a customer* in deploying, there is a seventh thing: doing all of it while somebody watches, asks questions, and needs to be able to repeat it after you leave.

Scope, stated plainly: one small application, one provider, one environment, made publicly reachable and verified. Networking beyond what that requires — private networks, subnets, security group design — belongs to a later course in this pathway, and so do pipelines, monitoring, and compliance. What you build here is the baseline everything else is added to.

## Making the application deployable

Most first deployments fail for reasons that have nothing to do with the cloud. They fail because the application was written assuming things a hosted environment does not provide. Fix these five before you touch a console, and the deployment itself becomes routine.

**1. The port comes from the environment.** The platform decides which port your process should listen on and tells you through an environment variable. Hard-coding 3000 means the health checker knocks on the wrong door and concludes your app is dead.

**2. Bind to all interfaces, not loopback.** Inside a container or a managed instance, `127.0.0.1` is reachable only from inside. Bind `0.0.0.0`. This is the same trap from lesson 03 and it is worth meeting twice, because it accounts for a startling share of "the deploy says unhealthy but it works on my laptop."

**3. Configuration comes from the environment, secrets come from a secrets service.** Anything that differs between your laptop and production — database host, bucket name, log level, feature flags — is read from environment variables. Anything sensitive is fetched from the platform's secrets store at startup, or injected by the platform. Nothing sensitive is in the repository, ever, including in the history.

**4. The application is stateless and its logs go to standard output.** Nothing important is written to local disk, because local disk vanishes on every restart, deployment, and scale event. Sessions go to a shared store, uploads go to object storage. Logs are written to stdout and stderr as lines, and the platform collects them; an application writing to `/var/log/app.log` inside a container is writing to a file nobody will ever read.

**5. There is a health endpoint.** A trivial route the platform can call to decide whether this instance should receive traffic. It returns quickly, needs no authentication, and does not depend on anything slow.

Here is a complete deployable application that satisfies all five. It is small on purpose — the point is the deployment, not the app.

```python
import os
import time
import logging
import sys
from flask import Flask, jsonify

logging.basicConfig(stream=sys.stdout, level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')

app = Flask(__name__)
STARTED_AT = time.time()

# 1 + 3: port and config from the environment, with a local-only fallback.
PORT = int(os.environ.get("PORT", "8080"))
ENVIRONMENT = os.environ.get("APP_ENV", "local")
GREETING = os.environ.get("GREETING", "Hello from the cloud")


@app.get("/")
def index():
    return f"{GREETING} ({ENVIRONMENT})\n", 200


# 5: health endpoint — fast, unauthenticated, no dependencies.
@app.get("/healthz")
def healthz():
    return jsonify(status="ok", uptime_seconds=round(time.time() - STARTED_AT, 1)), 200


@app.get("/version")
def version():
    return jsonify(version=os.environ.get("APP_VERSION", "dev"), environment=ENVIRONMENT), 200


if __name__ == "__main__":
    logging.info("starting on port %s in environment %s", PORT, ENVIRONMENT)
    # 2: bind all interfaces, not loopback.
    app.run(host="0.0.0.0", port=PORT)
```

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

ENV PORT=8080
EXPOSE 8080
# Shell form so ${PORT} is read at start-up, not baked in at build time.
CMD exec gunicorn --bind "0.0.0.0:${PORT:-8080}" --access-logfile - app:app
```

Note `--access-logfile -`, which sends the access log to stdout. That one flag is the difference between a deployment you can debug and one you cannot.

Note also that the start command reads `PORT` from the environment rather than hard-coding `8080`. A `CMD` written as a JSON array does not expand variables, so `["gunicorn", "--bind", "0.0.0.0:8080", ...]` would quietly ignore whatever port the platform assigns — rule 1 broken in the one line that matters. The `exec` keeps gunicorn as process 1 so it receives the platform's shutdown signal. One more detail: under gunicorn, the `if __name__ == "__main__":` block in `app.py` never runs, so the "starting on port" log line comes from gunicorn's own start-up output ("Listening at: http://0.0.0.0:8080"), not from your code. If you want your own configuration summary in the logs, log it at module level instead.

Before deploying anything, run it exactly as the platform will:

```bash
docker build -t hello-cloud:1.0.0 .
docker run --rm -p 8080:8080 -e PORT=8080 -e APP_ENV=local -e APP_VERSION=1.0.0 hello-cloud:1.0.0

curl -i http://localhost:8080/
curl -i http://localhost:8080/healthz
```

If it does not work in a container on your own machine, it will not work on theirs, and debugging it locally is free.

## Choosing where it runs

Reading straight off lesson 03: this is a long-running request/response web service with no special OS requirement and no local state. That points at a managed container platform or a managed application platform. A virtual machine would work and buys you an operating system to patch for no benefit. A serverless function would work for a very low-traffic version of this and adds cold-start latency and an awkward fit for a persistent web framework.

The neutral shape of the decision, for any provider:

| If the application… | Deploy it as | Because |
| --- | --- | --- |
| Needs a specific OS, agent, or local disk | Virtual machine | Nothing else gives you the OS |
| Is a long-running HTTP service in a container | Managed container service | Scales in seconds, no OS to patch |
| Is source code with no container, on a common runtime | Managed application platform | Build and run handled for you |
| Is a short event-driven handler | Serverless function | Pay per invocation, zero when idle |

All three major providers sell every row of that table (lesson 04's Rosetta table names them). Pick the row from the application's properties, then look up the product.

## The deployment sequence

The steps are the same everywhere; only the commands differ. Learn the sequence, look up the syntax.

| Step | What happens | What goes wrong |
| --- | --- | --- |
| 1. Prepare the identity | A deployment principal with narrow permissions | Using a personal admin credential |
| 2. Choose a region | Near users, priced acceptably, service available | Deploying somewhere the service does not exist |
| 3. Create the target | The service, app, or instance that will run the code | Wrong size, wrong runtime version |
| 4. Supply configuration | Environment variables and secret references | Missing variable; secret pasted as plain text |
| 5. Ship the artifact | Push an image, or push source for the platform to build | Wrong architecture; build succeeds locally, fails remotely |
| 6. Expose it | A public endpoint, with TLS, optionally a custom name | Endpoint created but not public; certificate not ready |
| 7. Verify | Prove from outside that it serves traffic | Checking localhost and calling it done |
| 8. Observe | Confirm logs and metrics arrive | Logs going to a file inside the container |
| 9. Record | Runbook, rollback plan, cost note | Nothing written down; only you can repeat it |

### Step 1 — the deployment identity

Do not deploy with an administrator credential, and especially do not do it on a customer's account where a mistake is theirs to live with. Create a deployment principal that can do exactly the deployment: push to the registry, update the one service, read the one secret. It cannot create identities, cannot delete storage, cannot touch anything it does not deploy. That is the `deploy-pipeline` role from lesson 06, and this is the moment it earns its keep.

Prefer a role or workload identity over a stored key. If a static key is truly unavoidable, it lives in the platform's secrets service and gets a rotation date.

### Step 2 — the region

Three inputs: latency to the actual users, whether the law requires the data to stay somewhere specific, and price. A fourth in practice — not every service exists in every region, and discovering that after you have created six other resources there is a bad afternoon. Check the service's regional availability table first.

### Steps 3 through 5 — create, configure, ship

The interface choice from lesson 04 applies. Use the console the first time so you can see what the platform is doing, then immediately reproduce it with the command line, because the CLI form is what you will put in the runbook. A click path is not a procedure; nobody can review it, and it stops being true when the interface is redesigned.

Configuration and artifact are separate on purpose. The image is built once and promoted through environments unchanged; only the environment variables differ. If you must rebuild the image to deploy to a different environment, something that should have been configuration got compiled in.

### Step 6 — exposing it

For a first deployment, keep this minimal. Managed application and container platforms will hand you a generated public hostname with a valid certificate already attached. Use it. That is a real, verifiable public endpoint, and it is enough to satisfy the objective.

If a custom domain is required: create the platform's endpoint, add a DNS record pointing your name at it, request or attach a certificate, and wait. Two things bite here, both of them time rather than logic. DNS propagation means the name may resolve for you and not for the customer for some minutes. Certificate issuance frequently requires the DNS record to be in place first, so an ordering mistake produces a certificate stuck in "pending validation" for reasons the console will not explain. Neither is an emergency; both look like one if you did not expect them.

## Verifying it serves traffic

This is the half of the objective people skip, and skipping it is how you tell a customer something is live when it is not. "Deployed" is a status in a console. "Serving traffic" is an observation from outside.

Verify in this order, and keep the output.

```bash
# 1. Does the name resolve, and to what?
dig +short app.example.com

# 2. Does it answer over TLS, with a valid certificate and the right status?
curl -iv https://app.example.com/ 2>&1 | head -40

# 3. Is the health endpoint healthy?
curl -i https://app.example.com/healthz

# 4. Is the running version the one you just shipped?
curl -s https://app.example.com/version

# 5. Does it hold up over more than one request?
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" https://app.example.com/
done
```

Then the four checks a command line cannot make:

- **Open it in a browser.** Confirm no mixed-content or certificate warnings.
- **Load it from a network that is not yours** — a phone on mobile data, or a colleague elsewhere. A URL that resolves only inside your office or only in your browser cache is not published. Record who checked, from where, and when.
- **Find your request in the platform's log view.** Not in a terminal you left running — in the interface the customer will use at 2 a.m. Confirm the startup line, an access line, and that a deliberately triggered error appears with a stack.
- **Check the metrics pane** shows non-zero requests and a plausible latency.

Only when all of that is true is the deployment done. Write the evidence down; it is what you attach to the ticket.

## When it does not work

A first deployment fails in a small number of ways. This table is close to exhaustive for a simple web service.

| Symptom | Most likely cause | First check |
| --- | --- | --- |
| Health check fails, container keeps restarting | Bound to `127.0.0.1`, or wrong port | The bind address in the start command and the `PORT` variable |
| Platform reports "exec format error" | Image built for a different CPU architecture | Build for the target platform explicitly |
| Container exits immediately, code 0 | The start command is not a long-running process | The final command in the image |
| Container exits, code 137 | Killed for exceeding its memory limit | The configured memory ceiling versus actual usage |
| 502 or 503 from the public endpoint | No healthy instances behind it | Instance health status, then the application logs |
| App starts then crashes on first request | Missing environment variable or unreachable dependency | The startup log line listing configuration |
| "Access denied" calling another service | Deployment or runtime identity lacks a permission | The denial message: it names principal, action, resource |
| Public endpoint times out | Not actually exposed publicly, or wrong port mapped | The service's ingress setting and target port |
| Certificate error in a browser | Certificate not issued yet, or name mismatch | Certificate status and the exact hostname on it |
| Works for you, not for the customer | DNS not propagated, or a cached old record | Resolve the name from an outside resolver |
| Deploy succeeds, old version still served | Cached image tag, or traffic not shifted to the new revision | The `/version` endpoint, then the platform's revision list |
| Nothing in the logs at all | Logging to a file inside the container | Where the process writes its output |

Three habits make the difference between grinding through that table and diagnosing quickly.

**Read the error text completely.** Platform error messages are usually specific and usually accurate. The number of hours lost to skimming past a message that named the exact missing variable is enormous.

**Change one thing at a time.** Under pressure the urge is to change four settings and redeploy. When it then works, you have learned nothing and cannot write the runbook.

**Reproduce locally when you can.** Most of the table above reproduces with `docker run` on your own machine in seconds, for free, with no deployment cycle in between.

### Rolling back

Before you deploy, know how to undo it. On modern platforms the answer is usually "shift traffic back to the previous revision," which is fast and safe. On a virtual machine it may be "redeploy the previous artifact," which is slower. Either way, the rollback is part of the deployment plan, decided beforehand, not improvised during the incident.

Two rules. Roll back first, diagnose second — the customer's outage should not last as long as your investigation. And a rollback that has never been executed is a hypothesis; test it once during the deployment, deliberately, while nothing is wrong.

### Cleaning up

If this was a demonstration or a test, delete it. Lesson 07 explains why: idle resources bill quietly. Delete the compute, the load balancer, the disks, the images in the registry, and check for anything the platform created on your behalf. Leaving a customer with a $40/month charge for a demo they forgot about is a bad first impression that arrives thirty days later.

## Assisting a customer through it

The competency is not "deploy an application." It is "assist a customer in deploying an application," which is a different job with its own failure modes.

**Establish whose hands are on the keyboard, explicitly.** Two legitimate modes: you drive with them watching, or they drive with you guiding. Guided is slower and teaches; driving is faster and teaches nothing. Ask which they want, say what you are choosing and why, and never quietly switch mid-session. And be clear about authority — you are acting inside their account, and every action is attributable to the credential they gave you.

**Confirm prerequisites before you start, out loud.** An account with a payment method attached; a principal with sufficient permission; the artifact building successfully somewhere; a decision about the region; the domain name, if there is one, and who can edit its DNS. Half of all stalled deployment sessions stall on the last item, forty minutes in, because the person who controls DNS is on holiday. Ask at minute one.

**Narrate as you go.** Say what you are about to do, do it, say what you observed. "I'm setting the port variable to 8080 to match the container's listener — if these disagree the health check fails, which is the most common first-deployment error." That sentence costs three seconds and teaches something reusable.

**Distinguish what you are configuring from what the provider does.** Lesson 02's line, in conversation. "The platform handles the operating system and the certificate; the port, the variables, and the image are ours. That's why this failure is on our side to fix."

**Set expectations on time and on cost.** "This usually takes about an hour, and certificate issuance can add fifteen minutes we can't speed up." And: "This configuration will cost roughly this much a month; here's what drives it." Nobody wants to learn either of those afterwards.

**Leave a runbook.** The deliverable is not the running application, it is the running application plus the ability to do it again without you. A minimal runbook:

1. What this application is, and where it runs — service, region, account.
2. The exact commands to build and deploy, copy-pasteable.
3. Every environment variable, what it does, and where its value comes from.
4. The public URL, plus the three verification commands and their expected output.
5. Where the logs and metrics are, with links.
6. How to roll back, in exact steps.
7. Known limitations and what is deliberately not configured yet.
8. Approximate monthly cost and the main driver.
9. Who owns it and who to contact.

**Confirm understanding before you close.** Ask them to deploy a trivial change themselves — edit the greeting, redeploy, verify — while you watch. If they can, you are done. If they cannot, the runbook has a gap and you have just found it for free.

## Practice

**Part 1 — Make it deployable and prove it locally.** Take the sample application above, or write an equivalent in a language you prefer. It must read its port from the environment, bind all interfaces, read at least two configuration values from the environment, log to stdout, and expose `/healthz` and `/version`.

1. Containerize it and run it locally with the environment variables set.
2. Capture `curl -i` output for `/`, `/healthz`, and `/version`.
3. Deliberately break each of the five readiness rules in turn — bind to loopback, hard-code the port, write logs to a file, write a file to local disk and restart, remove the health endpoint — and record the exact symptom each produces. This is the single most useful hour in this lesson.

**Part 2 — Deploy it.** Using free-tier resources on any one provider, deploy your application to a public endpoint. You choose the compute abstraction; justify the choice in two sentences using lesson 03's criteria. Capture, for each of the nine sequence steps: what you did, the command or the console path, and the outcome. Where you used the console, write the equivalent CLI command underneath — you will need it for part 4.

**Part 3 — Verify from outside and evidence it.** Produce a verification pack containing:

- `dig` output for the hostname.
- `curl -iv` output showing a valid certificate and a 200.
- `/healthz` and `/version` responses, with the version matching what you deployed.
- Twenty timed requests with status codes and durations, plus the median and worst.
- A screenshot or transcript of your own request located in the platform's log viewer.
- A record of one successful load from a network that is not yours, with time, device, and network noted.
- One deliberately induced failure — stop the service or break a variable — showing what the public endpoint returns and what the logs show. Then restore it.

**Part 4 — Write the runbook.** Write the nine-section runbook described above for what you deployed. Then hand it to somebody who has not seen your work and ask them to deploy a one-line change using only the runbook. Record every place they got stuck, and revise. Submit both versions. The diff between them is the graded artifact.

**Part 5 — Guided-deployment role play.** With a partner playing a non-technical business owner who wants their app online today, run a 20-minute guided session in which *they* type. Beforehand, write your prerequisite checklist. Afterwards, write up: which prerequisite was missing or nearly missing; one moment you had to explain a cloud concept and the words you used; one point where you were tempted to take the keyboard and what you did instead; and the monthly cost figure you gave them and how you arrived at it.

**Part 6 — Roll back and clean up.** Deploy a second version with a visible change. Verify it is live via `/version`. Then roll back to the first version and verify again, recording how long the rollback took from decision to verified. Finally, delete every resource you created and produce a checklist of what you deleted, including anything the platform created on your behalf. Confirm in the cost console that nothing is still accruing.

**Deliverable:** one document containing the local proof and the five broken-rule symptoms, the nine-step deployment record with CLI equivalents, the verification pack, both runbook versions, the role-play write-up, and the rollback timing with the cleanup checklist.
