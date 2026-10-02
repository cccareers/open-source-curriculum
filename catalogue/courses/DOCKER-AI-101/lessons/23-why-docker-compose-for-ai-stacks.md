---
lesson_id: DOCKER-AI-101-23
course_id: DOCKER-AI-101
pathway: ai-developer
title: Why Docker Compose for AI Stacks?
order: 23
kind: lesson
competency_ids:
  - D5-S6-C02
objectives:
  - Explain the multi-service coordination problem Docker Compose solves for
    local AI development
  - Recognize when a project has outgrown single docker run commands
---

## One command becomes five

A realistic local AI application is not one container. It is a model server, a vector database, and an API or UI — three processes, three images, three sets of flags. Started by hand it looks like this:

```bash
docker network create ai-net
docker run -d --name ollama --network ai-net -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
docker run -d --name chroma --network ai-net -v chroma-data:/chroma/chroma -p 8001:8000 chromadb/chroma:0.5.23
docker build -t rag-api:dev ./api
docker run -d --name api --network ai-net -p 8000:8000 -e OLLAMA_HOST=http://ollama:11434 -e CHROMA_HOST=chroma rag-api:dev
```

Everything about that is workable and nothing about it is maintainable. The problems compound:

- **It lives in your shell history, not your repository.** A teammate cannot run what they cannot see, so the knowledge migrates into a README that drifts out of date.
- **Order and wiring are manual.** You must remember to create the network first and to spell the environment variables the same way in two places.
- **Teardown is its own ritual.** Three `docker rm -f` commands plus a network removal, and forgetting one leaves a name conflict tomorrow.
- **Changing one thing means retyping everything.** Adding a flag to the API container means recalling its full command.
- **Rebuilds are separate from runs.** `docker build` and `docker run` are two habits you have to keep in sync.

## What Compose gives you

Docker Compose replaces the whole sequence with one declarative file, `compose.yaml`, and two commands:

```bash
docker compose up --build
docker compose down
```

The file describes the desired state — which services exist, which images or build contexts they come from, which ports, volumes, and environment variables each gets — and Compose makes reality match. It creates a private network automatically and puts every service on it, so containers reach each other by service name. It builds images that need building. It streams every service's logs into one view. It tears the whole thing down in one command.

Most importantly, the file is **committed to your repository**. The environment stops being tribal knowledge and becomes reviewable source, versioned alongside the code it runs.

## When you have outgrown docker run

You are past the threshold when any of these are true:

- More than one container has to be running for the application to work.
- Two containers need to talk to each other.
- You have written down a `docker run` command so you can paste it again.
- Someone else needs to reproduce your setup.
- You have a shell script that wraps several `docker run` commands — that script is a worse Compose file.

A single container with two flags does not need Compose. The moment a second service appears, it does.

## Practice

1. Write out, by hand, the full sequence of `docker run` commands your current or intended project would need. Count them.
2. Identify every piece of coupling between them: shared network, matching environment variable names, startup order.
3. Apply the threshold test above and state in one sentence whether the project has outgrown `docker run`.
