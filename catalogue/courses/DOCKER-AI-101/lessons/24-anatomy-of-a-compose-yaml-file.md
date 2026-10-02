---
lesson_id: DOCKER-AI-101-24
course_id: DOCKER-AI-101
pathway: ai-developer
title: Anatomy of a compose.yaml File
order: 24
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Read and write the services, networks, volumes, and environment sections of
    a compose.yaml
  - Map each Compose concept back to the docker run flags it replaces
---

## The whole file

A Compose file is YAML with a handful of top-level keys. Two of them do almost all the work.

```yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-models:/root/.ollama
    restart: unless-stopped

  api:
    build: ./api
    ports:
      - "8000:8000"
    volumes:
      - ./api:/app
    environment:
      OLLAMA_HOST: http://ollama:11434
      LOG_LEVEL: debug
    depends_on:
      - ollama

volumes:
  ollama-models:
```

Save it as `compose.yaml` in your project root. Modern Compose does not want a `version:` key — it is obsolete and will produce a warning.

## Reading it as docker run flags

Every key maps to something you already know.

**`services:`** — each entry is one container. The key (`ollama`, `api`) is the service name, which becomes the container's hostname on the shared network and replaces `--name`.

**`image:`** — the image to pull, exactly as in `docker run <image>`.

**`build:`** — build from a Dockerfile instead. `build: ./api` means "the directory `./api` is the build context". The longer form lets you name a different Dockerfile:

```yaml
    build:
      context: ./api
      dockerfile: Dockerfile.dev
```

Use `image:` or `build:`, or both — with both, the built image is tagged with the given name.

**`ports:`** — a list of `"host:container"` strings. Same as `-p`. Quote them; `5432:5432` is safe but some pairs are parsed as sexagesimal numbers if unquoted.

**`volumes:`** — same `source:target` grammar as `-v`. A bare name (`ollama-models:/root/.ollama`) is a named volume and **must** be declared in the top-level `volumes:` block. A path starting with `.` or `/` (`./api:/app`) is a bind mount and needs no declaration.

**`environment:`** — replaces `-e`. Either mapping form (`KEY: value`) or list form (`- KEY=value`).

**`depends_on:`** — start order only. It waits for the container to *start*, not for the service inside to be *ready*, which is a distinction that causes real confusion. Your application should retry its first connection rather than assume the dependency is listening.

**`restart: unless-stopped`** — the same restart policy flag.

**`volumes:` at the top level** — declares named volumes so Compose creates them. This is the block people forget, and the error message names the missing volume.

## Networks

There is no `networks:` block above, and usually there does not need to be. Compose creates a default network for the project and attaches every service to it, so `api` can reach `http://ollama:11434` by name with no configuration. Declare networks explicitly only when you want to isolate groups of services from each other.

Check your file before running it:

```bash
docker compose config
```

That prints the fully resolved configuration with variables substituted, and fails loudly on a syntax error.

## Practice

1. Take two of the `docker run` commands you wrote in the previous lesson and translate them into a `compose.yaml`, mapping each flag to its key.
2. Run `docker compose config` and read the resolved output — note what Compose filled in that you did not write.
3. Deliberately remove the top-level `volumes:` block, run `docker compose config` again, and read the error.
4. Add an `environment:` entry to one service and confirm it appears in the resolved config.
