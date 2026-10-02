---
lesson_id: DOCKER-AI-101-27
course_id: DOCKER-AI-101
pathway: ai-developer
title: Environment Variables and .env Files
order: 27
kind: lesson
competency_ids:
  - D5-S7-C01
  - D5-S8-C02
objectives:
  - Manage API keys and configuration with environment variables and .env files
    instead of hardcoding
  - Keep secrets out of images, source control, and logs while varying config
    per environment
---

## Never hardcode configuration

A hosted API key pasted into a Python file gets committed, pushed, and scraped. The same key written into a Dockerfile with `ENV` is worse, because anyone who can pull the image reads it back:

```bash
docker history --no-trunc acme/rag-api:0.3.1
```

Every layer command is right there. An image is not a safe place for a secret.

Configuration belongs in the environment, injected at run time.

## Three ways Compose supplies values

**Literal values in the file** — fine for anything non-secret:

```yaml
services:
  api:
    environment:
      LOG_LEVEL: debug
      OLLAMA_HOST: http://ollama:11434
```

**Pass through from your shell or the project `.env`** — the value is not in the committed file at all:

```yaml
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      LLM_MODEL: ${LLM_MODEL:-llama3.2}
```

`${VAR}` substitutes at parse time; `${VAR:-default}` supplies a fallback. Compose automatically reads a file named `.env` beside `compose.yaml` for these substitutions.

**Load a whole file into the container** with `env_file`:

```yaml
    env_file:
      - .env
```

The distinction matters. `.env` beside the compose file is read **by Compose** for `${...}` substitution; `env_file` hands variables **to the container**. Both are common and they are not the same mechanism.

## Keeping secrets out of source control

Two files, one committed and one not.

`.env.example` — committed, documents every variable, contains no real values:

```text
OPENAI_API_KEY=
LLM_MODEL=llama3.2
CHROMA_HOST=chroma
```

`.env` — real values, and it must be ignored everywhere:

```text
.env
.env.*
!.env.example
```

Put that in `.gitignore` **and** in `.dockerignore`, so a stray `COPY . .` cannot sweep the file into an image.

Reading them in code stays simple:

```python
import os
api_key = os.environ["OPENAI_API_KEY"]   # fails loudly if missing
log_level = os.environ.get("LOG_LEVEL", "info")
```

Prefer the bracket form for required secrets: a clear startup failure beats a confusing authentication error later.

## Keeping them out of logs

Secrets leak through output as often as through files.

- Never `print(config)` or log an entire settings object.
- Never log a full request that carries an `Authorization` header.
- Redact when you must show something: print the last four characters only.
- Remember that `docker compose config` prints resolved values, including substituted secrets — do not paste its output into an issue.
- Remember that `docker inspect` shows a container's environment to anyone on the machine.

## Varying config per environment

The same image should run in development and production with different values, never a different build. Point `LLM_BASE_URL` at `http://ollama:11434/v1` locally and at a hosted provider remotely; set `LOG_LEVEL` to `debug` locally and `info` remotely. The differences that break deployments are almost always environmental — a variable set locally and forgotten remotely, a hostname that only resolves on your laptop — so keeping every one of them in a single documented list is what makes the two environments comparable.

## Practice

1. Create `.env` and `.env.example` for your stack, and add `.env` to both `.gitignore` and `.dockerignore`.
2. Reference a variable in `compose.yaml` with `${VAR:-default}`, then run `docker compose config` to see the substitution.
3. Read the variable inside the container with `docker compose exec api env | grep VAR`.
4. Remove the variable from `.env`, restart, and confirm your code fails with a clear message rather than a confusing one.
