---
lesson_id: DOCKER-AI-101-11
course_id: DOCKER-AI-101
pathway: ai-developer
title: Layer Caching for Fast Rebuilds
order: 11
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Write a Dockerfile that packages a Python AI service with lean base images
    and cache-friendly layers
  - Order Dockerfile instructions so dependency layers are not reinstalled on
    every code change
---

## How the build cache decides

Every instruction in a Dockerfile produces a layer, and Docker caches them in order. Before running an instruction, it asks: is there a cached layer for this exact instruction, built on this exact parent layer? If yes, it reuses it. If no, it rebuilds — **and every instruction after it, because their parent changed.**

That cascade is the whole game. One cache miss near the top invalidates everything below.

For `COPY`, the cache key includes the contents of the files being copied. Change one character in one source file and that `COPY` layer misses.

## The wrong order

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`COPY . .` brings in your source code, so editing any Python file invalidates that layer — which invalidates the `pip install` below it. You reinstall torch because you fixed a typo in a docstring. On a laptop that is several minutes per edit.

## The right order

```dockerfile
FROM python:3.11-slim
WORKDIR /app

COPY requirements.lock.txt .
RUN pip install --no-cache-dir -r requirements.lock.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The rule: **order instructions from least likely to change to most likely to change.** Dependencies change weekly; source changes hourly. Copy only the requirements file, install, and copy the rest afterwards. Now a code edit misses the cache on the final `COPY` only, and the rebuild takes about a second.

## Keep noise out of the context

`COPY . .` also copies things you never wanted — `.git`, virtual environments, notebook checkpoints, downloaded weights — which bloats the image *and* causes spurious cache misses when they change. A `.dockerignore` beside the Dockerfile fixes both:

```text
.git
.venv
__pycache__/
*.pyc
models/
data/
.env
notebooks/.ipynb_checkpoints
```

Excluding `.env` is a security habit, not just a size one.

## Reading cache behaviour

Build output tells you what happened: a step marked `CACHED` was reused. Watch the line where caching stops — that is your first changed instruction, and everything below it is being redone.

If you need a clean build to prove reproducibility, `docker build --no-cache -t ai-demo:0.1 .` skips the cache entirely.

## Practice

1. Write the "wrong order" Dockerfile above, build it, edit one line of Python, and rebuild. Time it.
2. Reorder to the cache-friendly version, build once, make the same edit, and rebuild. Compare the times and find the `CACHED` markers in the output.
3. Add a `.dockerignore` excluding `.git` and `__pycache__`, rebuild, and note any change in the build context size Docker reports at the start.
