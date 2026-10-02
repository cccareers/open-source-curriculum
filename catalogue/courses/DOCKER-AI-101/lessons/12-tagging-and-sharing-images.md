---
lesson_id: DOCKER-AI-101-12
course_id: DOCKER-AI-101
pathway: ai-developer
title: Tagging and Sharing Images
order: 12
kind: lesson
competency_ids:
  - D5-S6-C01
  - D5-S5-C01
objectives:
  - Tag images meaningfully and push them to Docker Hub or a private registry
  - Explain how a shared image gives teammates an identical runtime environment
---

## Anatomy of an image name

```text
registry/namespace/repository:tag
ghcr.io/acme/rag-api:0.3.1
```

Omit the registry and Docker assumes Docker Hub. Omit the tag and it assumes `latest` — which is a plain tag with no special meaning, not "the newest version". It is simply the one people forget to move.

Tag at build time or afterwards:

```bash
docker build -t acme/rag-api:0.3.1 .
docker tag acme/rag-api:0.3.1 acme/rag-api:latest
```

A tag is a label pointing at an image; one image can carry several.

## Tagging that means something

Pick a scheme and hold to it.

- **Semantic versions** (`0.3.1`) for anything a teammate depends on. Immutable once pushed: never rebuild and re-push the same version with different contents.
- **Git commit SHAs** (`rag-api:9f2c1ab`) when you need to trace a running container back to exact source. Cheap and unambiguous.
- **`latest` as a convenience alias only.** Never as the thing production or a teammate's Compose file pins to, because it changes under them and destroys the reproducibility you built the image for.
- **Environment or variant suffixes** (`0.3.1-cpu`) when you publish more than one build of the same version.

## Pushing

```bash
docker login
docker push acme/rag-api:0.3.1
```

For a private registry, log in to that host and include it in the tag:

```bash
docker login ghcr.io
docker tag acme/rag-api:0.3.1 ghcr.io/acme/rag-api:0.3.1
docker push ghcr.io/acme/rag-api:0.3.1
```

Docker pushes layers, not whole images, and skips any the registry already has. A code-only change usually uploads a few megabytes even for a large image — another payoff from ordering your Dockerfile well.

Before you push anything, check that no secret is baked in. `docker history <image>` shows the command behind each layer, so an API key set with `ENV` is readable by anyone who can pull it.

## What a teammate gets

```bash
docker pull acme/rag-api:0.3.1
docker run --rm -p 8000:8000 acme/rag-api:0.3.1
```

They do not install Python. They do not resolve dependencies. They do not discover that your `torch` build differs from theirs. The image is a frozen filesystem, so the interpreter, the library versions, and the system packages are identical to yours by construction — the same guarantee a lockfile gives for packages, extended to everything beneath them.

One caveat on Apple Silicon: an image built on your `arm64` Mac will not run natively on a colleague's `amd64` machine. For a genuinely portable image, build both with Buildx:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t acme/rag-api:0.3.1 --push .
```

## Practice

1. Tag one of your images with a semantic version and inspect the result with `docker images`.
2. Create a free Docker Hub account, `docker login`, and push it under your own namespace.
3. Delete the local image with `docker rmi`, pull it back, and run it — confirming the round trip works.
4. Run `docker history` on the image and confirm no credential appears in any layer command.
