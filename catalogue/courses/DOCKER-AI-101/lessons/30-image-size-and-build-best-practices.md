---
lesson_id: DOCKER-AI-101-30
course_id: DOCKER-AI-101
pathway: ai-developer
title: Image Size and Build Best Practices
order: 30
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Apply image-size, config, and sharing best practices that keep an AI Docker
    workflow reproducible for a team
  - Use multi-stage builds and .dockerignore to keep AI images lean
---

## Why size matters

A 6 GB image is slow to build, slow to push, slow for a teammate to pull, and slow to start on any host that does not already have the layers. AI images bloat easily — a GPU build of PyTorch, a compiler toolchain, a pip cache, a stray `.venv` — so a little discipline keeps the workflow pleasant.

Measure before optimizing:

```bash
docker images
docker history acme/rag-api:0.3.1
docker system df
```

`docker history` shows the size each instruction contributed, which usually names the culprit immediately.

## .dockerignore first

The cheapest win. Everything in the build context is sent to the engine and anything a `COPY .` sweeps up ships in the image.

```text
.git
.venv
__pycache__/
*.pyc
models/
data/
notebooks/
.env
tests/
```

Excluding `.env` is a security requirement, not an optimization.

## Multi-stage builds

A multi-stage build compiles or installs in one stage and copies only the result into a clean final stage, leaving the toolchain behind:

```dockerfile
FROM python:3.11-slim AS builder
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The final image has the installed packages and none of the compiler. When every dependency installs from a wheel there is little to gain, so reach for this when something in your requirements actually compiles.

## The habits that keep an image lean

- **Pick the right wheel.** The CPU build of PyTorch instead of the CUDA default is often the single largest saving available on a laptop-targeted image.
- **`--no-cache-dir` on every pip install.** Pip's cache is dead weight in a layer.
- **Clean in the same layer you dirty.** `apt-get install ... && rm -rf /var/lib/apt/lists/*` in one `RUN`; a separate `RUN rm` deletes nothing, because the earlier layer still holds the files.
- **Do not bake model weights** unless you need the immutability. Mount them or let the runtime download into a volume.
- **Pin the base image and the dependencies.** `python:3.11-slim` and exact `==` versions, so today's image and next quarter's are the same image.
- **Order for the cache.** Dependencies before source, so a code edit rebuilds one small layer.
- **Never bake a secret.** `docker history` reveals every `ENV`; configuration arrives at run time.

Together these are what make an image genuinely reproducible for a team: pinned inputs, no machine-specific residue, no secrets, and small enough that pulling it is not an event.

## Practice

1. Run `docker history` on your API image and identify the three largest layers.
2. Add a `.dockerignore` covering `.git`, `.venv`, `__pycache__`, and `.env`. Rebuild and compare the reported build context size and the final image size.
3. Convert a build that installs `build-essential` into the two-stage form above and compare `docker images` before and after.
4. Confirm with `docker history --no-trunc` that no credential appears in any layer.
