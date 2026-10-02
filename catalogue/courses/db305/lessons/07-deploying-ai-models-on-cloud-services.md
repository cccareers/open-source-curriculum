---
lesson_id: db305-07
course_id: db305
pathway: prompt-engineer
title: Deploying AI Models on Cloud Services
order: 7
kind: lesson
competency_ids:
  - D5-S1-C04
objectives:
  - Configure and deploy an AI model or endpoint on a cloud service with sane
    defaults for access and scaling
---

## What deploying a model means here

"Deploy a model" sounds like it involves servers. For a prompt engineer it almost never does. What you are deploying is an **endpoint**: a stable URL, with a credential, that accepts a request and returns a model's output, configured with defaults for who may call it and how much traffic it will take.

You are not training anything. You are not provisioning graphics hardware. You are choosing a hosted model, giving it a named configuration inside a cloud account your organization already has, locking down access to it, and handing the resulting URL to a workflow. That is the job, and it is a configuration job.

There are three ways to end up with such an endpoint, and knowing which one you are in prevents most confusion.

**A model provider's own API.** You sign up with the model vendor, get a key, and call their public endpoint. Fastest to start, nothing to deploy, and your organization's data leaves for a vendor you contracted with directly.

**A managed model service inside a cloud platform.** Amazon Bedrock on AWS, Azure AI Foundry on Azure, Vertex AI on Google Cloud. You select a model from a catalog and create a *deployment* of it in a region of your cloud account. You get an endpoint that is yours, billed through your existing cloud account, inside your existing identity and networking setup.

**A model you host yourself** on machines you rent. Full control, and it brings hardware sizing, scaling, and patching with it. Out of scope for this pathway and, for most teams, a decision to be made by people who own infrastructure.

This lesson is about the middle option, because it is where the interesting configuration decisions live and because it is what "setting up AI infrastructure" usually means in a business that already has a cloud account.

## When the managed cloud route is worth it

The provider API is simpler. Choose the cloud route only for a stated reason, and be able to name it:

- **Data residency.** The endpoint runs in a region you pick, so requests and any logged content stay in a jurisdiction the business is required to keep them in.
- **Contractual and compliance posture.** Your existing cloud agreement, its data-processing terms, and its audit evidence already cover the account.
- **Identity integration.** Access is granted through the same identity system that governs everything else you run, so joiners and leavers are handled by an existing process rather than a shared key in a document.
- **Private networking.** The endpoint can be reachable only from inside your network rather than from the open internet.
- **One bill and one quota conversation.** Spend appears in the same place as the rest of the platform, under the same budget alerts.
- **Model choice under one interface.** The catalog usually offers several vendors' models behind a comparable API, which makes switching a configuration change rather than a rewrite.

If none of those apply, the provider API is a perfectly professional answer and you should say so rather than build ceremony nobody asked for.

## The vocabulary

Every platform in this space uses the same six concepts under different names. Learn the concepts; translate the names when you arrive.

**Region.** The geographic location the endpoint runs in. It determines latency, which models are available, and where data is processed. Pick for data residency first, latency second, and expect the model catalog to differ between regions — the newest model often lands in a handful of regions before the rest.

**Model and version.** The specific model, at a specific version. This is the single most important thing to pin. A deployment pointed at a floating "latest" alias will change under your prompts without a deployment on your side, and your carefully evaluated behaviour changes with it.

**Deployment.** Your named instance of that model, with its own configuration. The name is what your workflow calls, which means you can point `orders-extractor-prod` at a new model version without touching a single workflow.

**Capacity or throughput mode.** How much traffic the deployment will accept. Two families: **on-demand**, where you pay per token and share a pool subject to quotas, and **provisioned**, where you reserve throughput and pay for it whether you use it or not. On-demand is right for almost everything you will build; provisioned is for sustained, predictable, latency-sensitive volume.

**Quota.** The account-level ceiling on tokens or requests per minute, usually per region and per model. Quota is not the same as capacity: you can configure a deployment your account's quota will not let you actually use, and you will discover it as throttling under load.

**Content filtering.** A configurable safety layer that can block inputs or outputs. It has real behaviour implications — a filter tuned for a consumer product will block clinical or legal text that your workflow legitimately handles — so check its setting rather than inheriting it.

## Choosing what to deploy

Deployment is the last step, not the first. Two decisions precede it, and both are cheap to get right and expensive to revisit.

**Which model.** Cloud catalogs list many, at very different prices and sizes, and the largest is rarely the right answer for a bounded task like extraction or classification. Shortlist two or three that are available in your region, then decide with evidence rather than with the datasheet: run the same twenty real inputs through each and compare the outputs against what a person says is correct. A model that costs a tenth as much and is equally right on your task is the correct choice, and you will only know that by trying it.

**Which region.** Answer three questions in this order. Are you required to keep this data in a jurisdiction? Is the model you shortlisted actually offered there? Where do the callers run? Data residency wins over latency when they conflict, and a model that is not offered in your required region means going back to the shortlist rather than quietly relaxing the requirement.

Write both answers down before you create anything. A deployment whose region nobody can justify is one you cannot defend in a review, and moving it later means a new endpoint, new credentials, and a change to every caller.

## One worked example

Here is a single concrete deployment, on Azure AI Foundry. Everything about it maps to the equivalent on Bedrock or Vertex AI; only the nouns change.

The configuration you are choosing amounts to this:

```json
{
  "deployment_name": "orders-extractor-prod",
  "model": "chat-model-mini",
  "model_version": "2026-01-15",
  "region": "uksouth",
  "throughput_mode": "on_demand",
  "tokens_per_minute_limit": 120000,
  "content_filter_policy": "default",
  "network_access": "selected_networks",
  "auth_mode": "managed_identity",
  "diagnostic_logging": "enabled"
}
```

Once created, calling it is an ordinary HTTP request of the shape you already know:

```http
POST /v1/deployments/orders-extractor-prod/chat/completions?api-version=2026-01-01 HTTP/1.1
Host: acme-ai-uksouth.inference.azure.com
Authorization: Bearer eyJhbGciOi...   (short-lived token from the managed identity)
Content-Type: application/json

{
  "messages": [
    { "role": "system", "content": "You extract delivery instructions and return only JSON." },
    { "role": "user", "content": "Driver must call ahead. Gate code 4417." }
  ],
  "max_tokens": 400,
  "temperature": 0,
  "response_format": { "type": "json_object" }
}
```

And the response carries the two things you will care about operationally — the output, and the token counts that become your cost line:

```json
{
  "id": "cmpl-9x2h…",
  "model": "chat-model-mini-2026-01-15",
  "choices": [
    { "index": 0, "finish_reason": "stop",
      "message": { "role": "assistant",
                   "content": "{\"call_ahead\":true,\"access_code\":\"4417\",\"confidence\":0.91}" } }
  ],
  "usage": { "prompt_tokens": 212, "completion_tokens": 24, "total_tokens": 236 }
}
```

Three details in that request are deliberate and are the ones people get wrong.

The URL names **the deployment**, not the model. That indirection is the whole point: swapping to a newer model version is a change to `orders-extractor-prod`, made once, with no workflow edited.

`temperature` is **0** because this is an extraction task with one correct answer. Deployment-time defaults exist on most platforms, but set determinism-critical parameters explicitly on the request too — a default you did not set is a default someone else can change.

`finish_reason` is checked, not ignored. `"stop"` means the model finished; `"length"` means it hit `max_tokens` mid-output, which for a JSON response means truncated, unparseable JSON. Treating a truncated response as a parse failure without noticing why leads to a week of prompt tuning against a limit that needed raising.

## Access: the part that gets audited

An endpoint with a shared key pasted into six workflows is the most common finding in a real review. Do better on four fronts.

**Prefer platform identity over keys.** Every major cloud lets a service authenticate as itself — a managed identity, a service account, an assumed role — instead of holding a static secret. The credential is issued short-lived and rotated by the platform, so there is nothing to leak and nothing to rotate manually. Use it whenever your workflow runs somewhere that supports it.

**When you must use keys, treat them like passwords.** One key per consumer, never one shared key for everything, so you can revoke one caller without stopping the rest. Keys live in the platform's secret store, referenced by name. Rotation is scheduled and rehearsed, which is why endpoints issue two keys: rotate the second, move consumers, then rotate the first.

**Grant the narrowest role that works.** The role that lets a workflow call the endpoint is not the role that lets it create or delete deployments. Give the workflow the caller role only. Nobody needs the administrator role to run an extraction.

**Restrict the network where you can.** Default network access on most services is "any client with a valid credential, from anywhere". Narrowing that to your organization's networks, or to a private endpoint, means a leaked credential alone is not enough. It is usually one setting.

Then check the logging question explicitly, because it surprises people: what does the platform retain of your prompts and responses, for how long, and can you turn it off? A workflow handling personal data with full request logging enabled has quietly created a second copy of that data in a place nobody has assessed.

## Scaling defaults that are actually sane

You are not writing an autoscaling policy. You are setting a handful of numbers, and these defaults are defensible for a first production deployment.

**Rate limit on the deployment.** Set an explicit tokens-per-minute or requests-per-minute ceiling rather than leaving it at the account maximum. It caps the blast radius when a looping workflow starts hammering it, and it protects your other deployments sharing the same quota.

**Concurrency in the caller.** Your workflow should send a bounded number of simultaneous requests. Start low — two to four — and raise it only with evidence. Unbounded parallelism is the fastest route to throttling, and it converts a fast job into a slow one.

**Retry with backoff, and honour the throttle signal.** A throttled call returns `429` with a retry hint, exactly as in lesson 03. Exponential backoff with jitter, a maximum of about five attempts, then fail loudly. Never retry a `400` — a malformed request will be malformed again.

**Timeouts on both sides.** Set a request timeout that reflects the work: a short extraction should time out in 30 seconds, not sit for five minutes holding a workflow slot. Make sure the timeout is shorter than your workflow platform's own step limit, so you handle the failure rather than the platform killing the run.

**Queue rather than crash.** For batch work, put the items in a queue or a staging table and drain it at a controlled rate, as you did with paginated pulls. A queue with a modest rate absorbs a spike; a loop firing everything at once does not.

**Know your cold-start situation.** On-demand shared endpoints generally have none. Deployments that scale to zero do, and the first request after idle can be seconds slower — which matters if a person is waiting and not at all if a batch is running overnight.

## Pin your configuration, and write it down

A deployment is a set of decisions that must be reconstructible by someone who is not you. Keep a one-page configuration sheet in version control beside the workflow:

| Setting | Value | Why |
| --- | --- | --- |
| Deployment name | `orders-extractor-prod` | Referenced by the extraction workflow |
| Model and version | `chat-model-mini`, `2026-01-15` | Pinned; evaluated on 11 March |
| Region | `uksouth` | Data residency requirement |
| Throughput | On-demand, 120k tokens/min | Peak observed 38k; headroom without reserving |
| Auth | Managed identity, caller role only | No static keys in the workflow |
| Network | Selected networks | Endpoint not reachable from the public internet |
| Request defaults | `temperature 0`, `max_tokens 400`, JSON mode | Deterministic extraction |
| Content filter | Default | Reviewed; no legitimate content blocked in the 200-record sample |
| Logging | Metrics on, prompt content off | Notes contain personal data |
| Owner | Automation team | Who to page |

Two entries deserve emphasis. **Pin the model version** and record the date you evaluated it, so that when a vendor announces a retirement you know exactly what must be re-evaluated. And **record the content filter decision** with the evidence, because "the AI refused" tickets are otherwise unanswerable.

## Environments, promotion, and rollback

Deploy the same model at least twice: once for development and once for production, with different names, different credentials, and ideally different quota.

```text
orders-extractor-dev   -> lower rate limit, verbose logging, freely changed
orders-extractor-prod  -> production limits, restricted access, changed only by promotion
```

That separation buys you the ability to change something without an audience. Promotion is then a defined act: run your evaluation set against dev, compare against the recorded baseline, update the configuration sheet, change prod, and watch it.

Rollback needs to exist before you need it. Because the workflow calls a deployment name rather than a model, you have two clean options: keep the previous version deployed under a second name and repoint the workflow, or change the deployment back to the previous version. Either way, write down the exact steps and the expected time, and rehearse it once. A rollback plan you have never executed is a hypothesis.

Do not change two things at once. A new model version and a rewritten prompt on the same day means you cannot attribute the difference, and attributing differences is the entire subject of the next lesson.

## Smoke-test before you hand it over

A deployment that returned one successful response in a console is not a deployment anyone should build on. Run six checks, in this order, and keep the output.

1. **The happy path, from the caller.** One real record, sent by the workflow using the workflow's own credential — not by you in a browser using yours. Those are different identities and only one of them matters.
2. **The wrong credential.** Call with a revoked or absent credential and confirm you get a clean `401` rather than a hang or a confusing error the workflow will mishandle.
3. **A malformed request.** Send an invalid body and confirm a `400` with a message naming the problem, and that your workflow routes it to the no-retry branch.
4. **A deliberate throttle.** Push past the rate limit you set and confirm you receive `429` and that your backoff engages rather than compounding.
5. **A long input.** Send an input near the largest you expect and confirm it completes inside your timeout and does not truncate the response.
6. **Cold behaviour.** Leave it idle for whatever your platform's idle period is, then call it and record the latency. If it is materially slower, that is a number your callers need to know.

Then check what the endpoint recorded of all that. Open the platform's logs and confirm they contain what you expected and nothing you did not — particularly no prompt content if you turned content logging off.

## What it costs

On-demand pricing is per token, with input and output priced differently and output usually several times more expensive. Two numbers per run tell you almost everything: `prompt_tokens` and `completion_tokens`, both returned in the response.

Estimate before you deploy, from a real sample rather than a guess:

```text
runs per day                 4,000
average prompt tokens          900   (system + instructions + one order note)
average completion tokens      120   (a small JSON object)
daily token volume       3.6M input, 0.48M output
```

Then multiply by the published rate for the exact model and version, and sanity-check it against the business value of the workflow. If it costs more than the manual process it replaces, that is a finding to raise now, not after launch.

Provisioned throughput inverts the arithmetic: you pay a fixed rate for reserved capacity, which is cheaper only above a break-even volume you should calculate rather than assume. Set a budget alert on the account either way, and add per-run token counts to your workflow's logs, because a per-run cost you cannot compute is a per-run cost you cannot manage. Turning those logs into a monitored, optimized system is the next lesson.

## Practice

Use a cloud account you are permitted to use — a personal free tier, a sandbox subscription, or an organization account with a mentor's approval. If you genuinely cannot get one, do the whole exercise against a model provider's API and complete every step that still applies, marking the ones you could not.

1. **Choose and justify.** Write one paragraph naming which of the three routes you are taking and which specific reason from the list above justifies it. "It seemed more professional" is not a reason.
2. **Deploy one endpoint.** Create a named deployment of a specific model at a pinned version, in a region you can justify, with an explicit rate limit rather than the account maximum.
3. **Call it from a workflow.** Wire your extraction workflow to the deployment name. Confirm the response and record `prompt_tokens`, `completion_tokens`, and end-to-end latency for ten runs.
4. **Lock down access.** Use platform identity if available; otherwise create a dedicated key held in a secret store. Assign the narrowest role that works, then prove the restriction by attempting an administrative action with the workflow's credential and showing it is refused.
5. **Restrict the network** if your platform allows it, and demonstrate that a call from outside the permitted network fails.
6. **Handle throttling.** Set the deployment's rate limit deliberately low, fire enough concurrent requests to trigger `429`, and show your backoff working in the logs. Then set concurrency and the limit to sane values and re-run cleanly.
7. **Handle truncation.** Set `max_tokens` low enough to truncate a JSON response, confirm `finish_reason` is `length`, and add a check that treats it as a distinct failure rather than a parse error.
8. **Write the configuration sheet** using the table above, filling every row including the reason column.
9. **Practise rollback.** Deploy a second version under a second name, repoint the workflow, verify it works, then roll back. Time both directions and record the steps as a runbook someone else could follow.
