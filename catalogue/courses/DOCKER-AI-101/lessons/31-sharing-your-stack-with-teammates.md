---
lesson_id: DOCKER-AI-101-31
course_id: DOCKER-AI-101
pathway: ai-developer
title: Sharing Your Stack with Teammates
order: 31
kind: lesson
competency_ids:
  - D5-S5-C01
objectives:
  - Commit compose.yaml and document volume setup so a teammate can reproduce
    the stack
  - Treat the Compose file as the shareable definition of the whole development
    environment
---

## The Compose file is the environment definition

A lockfile pins your Python packages. `compose.yaml` pins something larger: which services exist, which images and versions they run, how they are wired together, where their data lives, and what configuration they expect. Treat it as the authoritative description of the development environment, and setup instructions stop being prose that rots in a README.

That only works if the file is committed and complete.

## What belongs in the repository

```text
compose.yaml          # the stack definition
.env.example          # every variable, documented, no real values
.dockerignore
api/Dockerfile
api/requirements.txt  # pinned
README.md             # the short runbook below
```

And what must not: `.env`, model weights, database contents, anything under a volume. Those are data, not definition.

## Pin what you depend on

A shared file that says `image: ollama/ollama` gives your teammate whatever version happens to be latest on the day they pull, which is exactly the drift containers exist to prevent. Pin deliberately:

```yaml
services:
  ollama:
    image: ollama/ollama:0.5.4
  chroma:
    image: chromadb/chroma:0.5.23
```

Do the same for base images in your Dockerfiles and for every entry in `requirements.txt`.

## Document the volumes

This is the step most teams skip, and it is the one that turns a clean clone into a confusing failure. Named volumes are empty on a new machine, so anything Docker cannot recreate on its own needs an instruction. In practice that means the model pulls and any seed data.

A README runbook of five lines is usually enough:

```markdown
## Running locally

1. `cp .env.example .env` and fill in any hosted API keys.
2. `docker compose up --build -d`
3. `docker compose exec ollama ollama pull llama3.2`
4. `docker compose exec ollama ollama pull nomic-embed-text`
5. Open http://localhost:8000/health — expect `{"docs": 0}`.

Data lives in the `ollama-models` and `chroma-data` volumes.
`docker compose down` keeps them; `down --volumes` deletes them and you
will re-download roughly 3 GB.
```

Say the size out loud. "This first run downloads about 3 GB" is the difference between a colleague waiting patiently and a colleague assuming it has hung.

Better still, make the steps executable — a `make setup` target or a short `scripts/setup.sh` that runs the pulls — so the documentation cannot drift from the commands.

## Review it like code

The Compose file changes behaviour for everyone on the team, so put it through the same review as source. A new published port, a removed volume, a changed image tag, a new required environment variable — each of those will affect a colleague's next `up`, and each deserves a sentence in the pull request. When you add a variable, add it to `.env.example` in the same commit; a variable that exists only in your local `.env` is a broken build for everybody else.

## Practice

1. Pin every image tag in your `compose.yaml` and every package version in `requirements.txt`.
2. Write `.env.example` listing every variable your stack reads, with empty values for secrets.
3. Write the five-step runbook for your own stack, including the volume note and the approximate download size.
4. Test it honestly: `docker compose down --volumes`, delete your `.env`, then follow your own instructions from the top and fix anything that was missing.
