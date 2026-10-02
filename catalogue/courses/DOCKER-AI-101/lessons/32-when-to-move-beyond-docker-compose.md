---
lesson_id: DOCKER-AI-101-32
course_id: DOCKER-AI-101
pathway: ai-developer
title: When to Move Beyond Docker Compose
order: 32
kind: lesson
competency_ids:
  - D5-S8-C01
  - D5-S6-C02
objectives:
  - Recognize the signals that a workload needs Kubernetes, Cloud Run, or a
    managed inference platform
  - Describe how local Compose skills transfer to hosted deployment targets
---

## What Compose is not for

Docker Compose runs containers on **one machine**. That is its scope, and within it it is excellent. The signals that you have left that scope are concrete rather than philosophical.

**You need more than one machine.** Traffic or memory demand exceeds a single host. Compose has no notion of scheduling work across servers.

**You need it to stay up without you.** Compose restart policies handle a crashed container; they do not handle a failed host, a rolling upgrade with no downtime, or automatic rescheduling elsewhere.

**You need to scale a service up and down with load.** `docker compose up --scale api=3` exists, but there is no autoscaling and no load balancing beyond what you build yourself.

**You need real secret management.** `.env` files are fine on a laptop. A production system wants a secret store with rotation, access control, and an audit trail.

**Several teams need to share infrastructure** with quotas, network policies, and role-based access.

**Releases need to be safe.** Health-gated rollouts, canaries, and one-command rollback are deployment concerns Compose does not address.

## Where you go instead

**A container host** — Cloud Run, Fly.io, Render, Azure Container Apps, AWS App Runner. You hand over an image and some configuration and get HTTPS, autoscaling, and managed rollouts. For a single containerized API this is usually the right next step, and it is a small jump from where you are: your Dockerfile is already the deliverable.

**Kubernetes** — the answer when you genuinely have many services across many machines and need declarative scheduling, self-healing, and fine-grained networking. It is a substantial operational commitment; adopting it for three containers on one node costs far more than it returns.

**A managed inference platform** — Bedrock, Vertex AI, Together, Baseten, or a hosted model API. Worth it when serving the model is the hard part: GPU capacity, batching, and scaling are someone else's problem, and you keep the container workflow for everything around it.

Local LLM serving is the piece that transfers least directly. A quantized model on your laptop's CPU is a development convenience; production inference at scale usually means GPUs or a hosted endpoint. Because your application talks HTTP to an OpenAI-compatible URL, that swap is a configuration change rather than a rewrite — which is precisely why the earlier lessons put the base URL in an environment variable.

## What transfers

Almost everything else, because the vocabulary is shared.

- Your **image** is the deployment artifact on every platform named above. Kubernetes, Cloud Run, and App Runner all consume the thing your Dockerfile already produces.
- **Environment-based configuration** is exactly how hosted platforms are configured; the variables you put in `compose.yaml` become platform settings or Kubernetes ConfigMaps.
- **Volumes** become persistent volume claims or managed storage.
- **Service-name networking** becomes Kubernetes Services and platform-managed service discovery — the same idea, more machinery.
- **Health checks** become liveness and readiness probes, often with the same command.
- **Logs on stdout** are what every platform's log aggregation collects.

A Compose file is close enough to a small Kubernetes deployment that reading one after the other is mostly a translation exercise. Stay on Compose until a specific signal from the first list appears, then move only the piece that needs moving.

## Practice

1. Review your own stack against the six signals and state which, if any, apply today.
2. Pick the smallest platform that would meet your real needs and justify the choice in three sentences.
3. Map each part of your `compose.yaml` — image, ports, environment, volumes, depends_on — to its equivalent on that platform.
4. Identify the one part of your stack that would not transfer directly and describe how you would replace it.
