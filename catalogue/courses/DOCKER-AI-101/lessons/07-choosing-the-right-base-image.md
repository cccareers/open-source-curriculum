---
lesson_id: DOCKER-AI-101-07
course_id: DOCKER-AI-101
pathway: ai-developer
title: Choosing the Right Base Image
order: 7
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Select an appropriate Python base image (slim vs. full vs. Alpine) for an AI
    service
  - Explain the tradeoffs of image size against build friction for compiled
    Python packages
---

## The three candidates

Every Dockerfile starts with `FROM`, and for a Python AI service you are almost always choosing between three families.

**`python:3.11`** — the full Debian-based image. Around 1 GB before you install anything, but it carries a compiler toolchain and common headers, so packages that need to build from source usually just work.

**`python:3.11-slim`** — the same Debian base with documentation, locales, and build tooling stripped out. Roughly 150 MB. This is the right default for AI services.

**`python:3.11-alpine`** — built on Alpine Linux, around 50 MB. Tempting, and usually a mistake for AI work.

## Why Alpine hurts here

Alpine uses **musl** as its C library instead of **glibc**. The Python packaging ecosystem publishes prebuilt binary wheels — the `manylinux` wheels — that are compiled against glibc. On Debian-based images, `pip install torch` downloads a wheel and finishes in seconds. On Alpine, those wheels do not match, so pip falls back to building from source: you install a compiler, wait a very long time, and often hit a missing header anyway.

For `torch`, `transformers`, `numpy`, `scipy`, `pillow`, or `llama-cpp-python`, the 100 MB you save on the base image is repaid many times over in build time, image size from the added toolchain, and frustration. Alpine is a fine choice for a small Go binary or a pure-Python utility. It is a poor default for AI.

## Slim versus full

`slim` wins by default because the packages that matter ship wheels. The moment you hit a package with no wheel for your platform, you have two options rather than abandoning slim:

```dockerfile
FROM python:3.11-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*
```

Install the toolchain only if you need it, and clean the apt cache in the same `RUN` so the removal lands in the same layer. If the build gets genuinely painful, switching to the full `python:3.11` image is a legitimate trade — build friction is a real cost, and a working 1 GB image beats a broken 200 MB one.

## Pin the version, and mind the architecture

Use `python:3.11-slim`, not `python:latest`. An unpinned base means your image quietly changes Python versions on a rebuild, which is exactly the drift containers are supposed to prevent.

On Apple Silicon, Docker pulls the `linux/arm64` variant of the official Python images automatically. If you ever need an `amd64` image for a specific dependency, you can request it with `--platform linux/amd64`, but expect emulation and a noticeable slowdown.

## Practice

1. Build two trivial images, one `FROM python:3.11-slim` and one `FROM python:3.11-alpine`, each running `RUN pip install numpy`. Time both with `time docker build .` and compare with `docker images`.
2. Write down which one you would ship and why, in terms of build friction rather than final size alone.
3. Take a `requirements.txt` from a project of your own and predict, for each package, whether a prebuilt wheel exists. Verify by attempting the install in a slim-based image.
