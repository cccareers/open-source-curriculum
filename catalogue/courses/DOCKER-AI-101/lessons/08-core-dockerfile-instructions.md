---
lesson_id: DOCKER-AI-101-08
course_id: DOCKER-AI-101
pathway: ai-developer
title: Core Dockerfile Instructions
order: 8
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Use FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, and CMD to define a working image
  - Read an existing Dockerfile and predict the image it produces
---

## A complete Dockerfile, instruction by instruction

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MODEL_NAME=llama3
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

That is a working image for a FastAPI service. Seven instructions do everything.

**`FROM`** names the base image every later instruction builds on. It must come first.

**`WORKDIR /app`** sets the working directory for all following instructions and for the container's process at runtime. It creates the directory if it does not exist. Use it instead of `RUN cd /app`, which would not persist — each `RUN` is its own shell.

**`COPY <src> <dest>`** copies from your build context (the directory you pass to `docker build`) into the image. Sources are relative to the context; destinations are relative to `WORKDIR`. Notice the file is copied twice here, deliberately, and the next lessons explain why.

**`RUN`** executes a command *at build time* and commits the result as a new layer. `pip install` belongs here. `--no-cache-dir` stops pip from leaving its download cache inside the layer.

**`ENV KEY=value`** sets an environment variable that is baked into the image and visible to the running process. It is for non-secret defaults — a model name, a log level, `PYTHONUNBUFFERED=1`. Never for API keys: anyone with the image can read it back with `docker history`.

**`EXPOSE 8000`** is documentation plus a hint to tooling. It declares which port the process listens on. It does **not** publish anything — you still need `-p` at run time.

**`CMD`** is the default command the container runs. It executes when the container starts, not when the image is built. Prefer the JSON array form (`CMD ["uvicorn", ...]`), which runs the binary directly; the string form wraps it in a shell and can swallow stop signals.

## Reading a Dockerfile

Given the file above, you should be able to predict: the image is Debian-based with Python 3.11; `/app` contains `requirements.txt`, the installed packages, and a copy of your source; `MODEL_NAME` is set; and starting a container launches uvicorn bound to all interfaces on port 8000.

That `--host 0.0.0.0` matters. A server bound to `127.0.0.1` inside a container is reachable only from inside that container — a failure you will meet again in the ports lesson.

## Practice

1. Create a directory with a one-route FastAPI app, a `requirements.txt` containing `fastapi` and `uvicorn`, and the Dockerfile above.
2. Build it: `docker build -t ai-demo:0.1 .` and read each step in the output back to the instruction that produced it.
3. Run it: `docker run --rm -p 8000:8000 ai-demo:0.1` and hit the route from your browser.
4. Change `CMD` to bind `--host 127.0.0.1`, rebuild, run, and observe the request failing. Change it back and explain why.
