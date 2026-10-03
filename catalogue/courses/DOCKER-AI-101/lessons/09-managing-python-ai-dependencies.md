---
lesson_id: DOCKER-AI-101-09
course_id: DOCKER-AI-101
pathway: ai-developer
title: Managing Python AI Dependencies
order: 9
kind: lesson
competency_ids:
  - D5-S5-C01
objectives:
  - Install large AI packages (torch, transformers, llama-cpp-python)
    efficiently in a Docker build
  - Pin dependencies so the image builds reproducibly on any machine
---

## Heavy packages need deliberate installs

`pip install torch` can pull hundreds of megabytes. `transformers` drags in tokenizers and safetensors. `llama-cpp-python` compiles C++ unless a matching wheel exists. Left alone, these turn a build into a coffee break and an image into several gigabytes.

Three habits fix most of it.

**Do not keep pip's cache.** Every downloaded wheel stays in `~/.cache/pip` and gets committed into the layer.

```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

**Ask for the right build.** On `linux/amd64`, the default PyTorch wheel on PyPI bundles CUDA libraries and is enormous. On a laptop with no NVIDIA GPU you want the CPU build, which is a fraction of the size. (The CUDA wheel would still run on the CPU; you would just be shipping gigabytes of GPU libraries you never use.)

```dockerfile
RUN pip install --no-cache-dir \
      --extra-index-url https://download.pytorch.org/whl/cpu \
      torch==2.4.1
```

The saving depends on architecture. On an Apple Silicon Mac your images are `linux/arm64` by default, and the gap between the default and CPU wheels there may be much smaller — but a teammate or a server building for `amd64` will feel the full difference. Pinning the CPU index keeps the build the same on both. Measure rather than assume: compare the two builds with `docker images`.

**Upgrade pip once, quietly.** `RUN pip install --no-cache-dir --upgrade pip` at the top avoids a warning banner in every later step and occasionally fixes wheel resolution.

## Pinning for reproducibility

An unpinned requirement is a promise that today's build and next month's build produce the same image. They will not.

```text
torch==2.4.1
transformers==4.44.2
fastapi==0.115.0
uvicorn==0.30.6
```

Exact `==` pins for every direct dependency are the minimum. Better still, generate a fully resolved file that pins transitive dependencies too — `pip freeze > requirements.lock.txt` after a known-good install, or a tool such as `pip-compile` or `uv pip compile` that produces a lockfile from a short list of top-level requirements. Copy the lockfile into the image and install from that.

Pinning is also what makes layer caching useful: if the requirements file has not changed, Docker reuses the installed layer instead of downloading torch again. Ordering the Dockerfile to exploit that is the subject of the next lesson.

## A worked dependency stage

```dockerfile
FROM python:3.11-slim

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.lock.txt .
RUN pip install --no-cache-dir -r requirements.lock.txt
```

`PYTHONDONTWRITEBYTECODE` keeps `.pyc` files out of the image; `PYTHONUNBUFFERED` makes your logs appear immediately in `docker logs` instead of sitting in a buffer.

If a package genuinely has no wheel for `linux/arm64` and must compile, install the toolchain and remove it in the same layer so the compiler does not ship:

```dockerfile
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential cmake \
 && pip install --no-cache-dir llama-cpp-python==0.3.1 \
 && apt-get purge -y build-essential cmake \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*
```

## Practice

1. Build an image installing `torch` from PyPI's default index, note the size, then rebuild with the CPU index URL above and compare.
2. Take an existing project, install it in a clean container, run `pip freeze`, and save the output as `requirements.lock.txt`.
3. Rebuild from the lockfile and confirm the versions inside the container with `docker run --rm <image> pip list`.
