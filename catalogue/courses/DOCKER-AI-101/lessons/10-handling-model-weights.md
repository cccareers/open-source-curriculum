---
lesson_id: DOCKER-AI-101-10
course_id: DOCKER-AI-101
pathway: ai-developer
title: Handling Model Weights
order: 10
kind: lesson
competency_ids:
  - D5-S6-C02
  - D5-S10-C01
objectives:
  - Compare baking model weights into an image against mounting them at runtime
  - Choose a weights strategy appropriate to local development versus team
    sharing
---

## Two places weights can live

Model files are the largest thing in an AI project and the least like source code. A 7B model quantized to 4 bits is roughly 4 GB; an embedding model is a few hundred megabytes. You have two options, and the choice shapes the whole workflow.

**Bake them in.** `COPY models/ /app/models/` puts the weights inside the image.

**Mount them at runtime.** Leave the image weightless and attach the files when the container starts:

```bash
docker run --rm \
  -v ai-models:/app/models \
  -p 8000:8000 ai-demo:0.1
```

## The tradeoff

| | Baked in | Mounted at runtime |
| --- | --- | --- |
| Image size | +4 GB and up | Unchanged, tens to hundreds of MB |
| Build time | Long; every rebuild re-copies | Fast |
| Registry push/pull | Slow and expensive | Fast |
| Reproducibility | Total — the image *is* the model version | Depends on what is in the volume |
| First run on a new machine | Works offline immediately | Must download or copy weights first |
| Swapping models | Rebuild the image | Change a flag or volume |
| Licensing | You are redistributing the weights | You are not |

Baking in is genuinely attractive for one case: an immutable, offline, versioned artifact where "which model was this?" must have exactly one answer. It is how you would ship a small classifier to an air-gapped machine.

For everything else, mounting wins during development. You iterate on code far more often than on weights, and a 4 GB layer turns every rebuild into a chore. Mounting also keeps a licensed model out of any image you might push to a registry — an underrated legal detail.

## Choosing per situation

**Local development:** mount. Use a named volume so the weights survive `docker rm`, and let the container download the model on first start if the runtime supports it. This is exactly how the Ollama lessons later in this course handle it.

**Sharing with a team:** mount, and make the download reproducible. Commit a small script or a documented `ollama pull llama3` step, and pin the exact model tag. Your teammates fetch several gigabytes once, from a source designed to serve them, rather than through a container registry.

**Shipping a fixed artifact:** bake in — small models only, and only when the version guarantee is worth the size.

A middle path is worth knowing: pull the weights during the build into a cached layer, so the image carries them but a code change does not re-download them. It gives you the reproducibility of baking with less rebuild pain, at full image size.

## Practice

1. Create a named volume with `docker volume create ai-models`, then start a container with `-v ai-models:/app/models` and write a placeholder file into `/app/models` from inside it.
2. Remove the container, start a new one with the same volume, and confirm the file is still there.
3. Write a short recommendation for a project of your own: bake or mount, with two reasons drawn from the table above.
