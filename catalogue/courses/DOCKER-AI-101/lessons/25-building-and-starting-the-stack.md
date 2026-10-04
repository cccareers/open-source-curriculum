---
lesson_id: DOCKER-AI-101-25
course_id: DOCKER-AI-101
pathway: ai-developer
title: Building and Starting the Stack
order: 25
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Bring a stack up and down with docker compose up --build and docker compose
    down
  - Understand what state persists across a down/up cycle and what does not
---

## Up

From the directory holding `compose.yaml`:

```bash
docker compose up --build
```

Compose builds any service with a `build:` key, pulls any image it does not have, creates the project network and the declared volumes, starts every service, and streams all their logs into your terminal prefixed with the service name. `Ctrl+C` stops the stack.

Variations you will use constantly:

```bash
docker compose up -d              # detached; prompt returns
docker compose up -d --build      # rebuild, then detach
docker compose up api             # just this service and what it depends on
docker compose ps                 # what is running in this project
docker compose stop               # stop containers, keep them
docker compose start              # start them again
```

**`--build` is the flag to internalize.** Without it, Compose reuses an image it has already built, so a change to your Dockerfile or your `requirements.txt` is silently ignored. If a code change is not taking effect, that is the first thing to check. (Source changes on a bind mount are a different matter — those apply live and need no rebuild.)

## Down

```bash
docker compose down
```

This stops and removes the containers and removes the project network. It is the tidy end of a session, and it is safe: **it does not delete named volumes.**

The variants differ sharply in how much they destroy:

```bash
docker compose down             # containers + network
docker compose down --volumes   # ALSO deletes named volumes
docker compose down --rmi local # ALSO deletes images built by this project
```

`--volumes` is the destructive one. On a stack with an Ollama model cache it discards several gigabytes and the next `up` re-downloads everything. Reach for it only when you genuinely want a clean database.

## What survives a down and up

Knowing which side of the line each thing falls on saves a lot of confusion.

**Survives:**

- Named volumes — model caches, vector store data, anything you declared under top-level `volumes:`.
- Bind-mounted host directories — they are your files and Compose never touches them.
- Built images — cached, which is why the second `up --build` is fast.

**Does not survive:**

- Anything written to a container's own filesystem outside a volume. Files created in `/tmp`, packages installed via `docker exec`, logs written to a path inside the container: all gone.
- The containers themselves, and their environment. A container is recreated fresh from the image and the current `compose.yaml`.
- The project network, and any per-container state such as in-memory caches.

The design rule follows directly: **every piece of state you want to keep must be on a declared volume.** If losing it after `docker compose down` would hurt, it needs a volume entry.

## Practice

1. Bring your two-service stack up with `docker compose up --build` and watch the interleaved log output. Stop it with `Ctrl+C`.
2. Bring it up detached, then use `docker compose ps` to confirm both services.
3. Write a file into a volume-backed path and another into a non-volume path inside a container. Run `docker compose down`, then `up` again, and check which file survived.
4. Change a line in your Dockerfile, run `docker compose up -d` without `--build`, and confirm nothing changed. Then run it with `--build` and confirm it did.

## Check your understanding

1. After `docker compose down`, you run `docker compose up -d`. Is the `llama3.2` model you pulled yesterday still available? What about the package you installed with `docker compose exec api pip install rich`?
2. You add `httpx` to `api/requirements.txt` and run `docker compose up -d`. The API crashes with `ModuleNotFoundError: httpx`. Why, and what is the fix?
3. Which single command would make the next `up` re-download every model?

*Answers:* (1) The model is still there, because it lives in the `ollama-models` named volume. The `pip install` is gone, because the container was recreated from the image. (2) Without `--build`, Compose reused the old image; run `docker compose up -d --build`. (3) `docker compose down --volumes`.
