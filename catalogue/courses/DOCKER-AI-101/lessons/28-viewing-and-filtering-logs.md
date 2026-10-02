---
lesson_id: DOCKER-AI-101-28
course_id: DOCKER-AI-101
pathway: ai-developer
title: Viewing and Filtering Logs
order: 28
kind: lesson
competency_ids:
  - D5-S9-C01
objectives:
  - Use docker compose logs to observe and filter output across a multi-service
    stack
  - Diagnose a failing service by following its logs during startup
---

## One command, every service

```bash
docker compose logs
```

Compose collects stdout and stderr from every container in the project and prints them with a colored service-name prefix, so you can see the API's request and Ollama's response to it in one chronological stream. That interleaving is the main reason to read logs through Compose rather than per-container.

The flags you will use daily:

```bash
docker compose logs -f              # follow, live
docker compose logs --tail 100      # last 100 lines per service
docker compose logs -t              # timestamps
docker compose logs --since 5m      # recent only
docker compose logs -f api          # one service
docker compose logs -f api ollama   # two services
```

`-f --tail 50` is the combination worth memorizing: recent context, then live output, without scrolling through an hour of history.

For text searching, pipe it:

```bash
docker compose logs --no-color api | grep -i error
```

`--no-color` strips the escape codes that otherwise confuse `grep` and make saved output unreadable.

## Following a startup failure

A stack that will not come up has a specific diagnostic path.

```bash
docker compose ps
```

Read the `STATUS` column. A service that says `Exited (1)` failed; one that says `Restarting` is failing repeatedly under a restart policy, which floods the log with the same error every few seconds.

Then look at that service alone:

```bash
docker compose logs --tail 100 api
```

The last lines before the exit name the cause almost every time — `ModuleNotFoundError` means the dependency is not in the image, `Address already in use` means the port is taken, a connection error to `ollama` means it was not ready yet.

That last one deserves attention because it is the classic Compose race. `depends_on` waits for the dependency container to *start*, not for the service inside to be *ready*. Your API can come up, try to reach Ollama a fraction of a second too early, and exit. The log shows it clearly: Ollama's startup lines appear *after* the API's connection error.

The right fix is retry logic in your application. If you want Compose to help, add a health check and depend on the healthy condition:

```yaml
services:
  ollama:
    image: ollama/ollama
    healthcheck:
      test: ["CMD", "ollama", "list"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./api
    depends_on:
      ollama:
        condition: service_healthy
```

Two habits make all of this work. Set `PYTHONUNBUFFERED=1` so Python's output is not held in a buffer while you watch an empty log. And log to stdout, never to a file inside the container, because Docker captures stdout and a file in the writable layer vanishes with the container.

When logs are not enough, `docker compose exec api sh` puts you inside the container, and `docker stats` shows whether a service is being killed for memory rather than crashing on its own.

## Practice

1. Bring your stack up detached and run `docker compose logs -f --tail 20`. Send a request and watch it appear across services.
2. Break one service — remove a dependency from its `requirements.txt` and rebuild. Use `docker compose ps` and then `logs --tail 50` on that service alone to identify the cause.
3. Add `PYTHONUNBUFFERED=1`, rebuild, and compare how promptly log lines appear.
4. Add the health check above and confirm with `docker compose ps` that the dependent service now waits.
