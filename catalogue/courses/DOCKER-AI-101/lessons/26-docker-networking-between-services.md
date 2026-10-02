---
lesson_id: DOCKER-AI-101-26
course_id: DOCKER-AI-101
pathway: ai-developer
title: Docker Networking Between Services
order: 26
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Explain how Compose services reach each other by service name on a shared
    network
  - Configure an application container to talk to Ollama or a vector database by
    hostname
---

## Service names are hostnames

Compose creates a private network for the project and attaches every service to it. On that network, Docker runs an embedded DNS server that resolves each **service name** to that container's IP address.

So in this file:

```yaml
services:
  ollama:
    image: ollama/ollama
    volumes:
      - ollama-models:/root/.ollama

  chroma:
    image: chromadb/chroma:0.5.23
    volumes:
      - chroma-data:/chroma/chroma

  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      OLLAMA_HOST: http://ollama:11434
      CHROMA_HOST: chroma
      CHROMA_PORT: "8000"

volumes:
  ollama-models:
  chroma-data:
```

the `api` container reaches the model server at `http://ollama:11434` and the vector store at `chroma:8000`. No IP addresses, no `links`, no configuration — the names in `services:` are the names you connect to.

In your application, read them from the environment rather than hardcoding:

```python
import os, ollama, chromadb

llm = ollama.Client(host=os.environ["OLLAMA_HOST"])
vectors = chromadb.HttpClient(
    host=os.environ["CHROMA_HOST"],
    port=int(os.environ["CHROMA_PORT"]),
)
```

## Container ports, not host ports

This is the mistake that costs the most time. Note that `api` talks to Chroma on port **8000**, the port Chroma listens on *inside* its container — even if you also published it to the host as `8001:8000`.

Publishing is only for traffic coming from your Mac. Container-to-container traffic goes directly over the project network and ignores port mappings entirely. A service that only other services need does not have to publish anything at all.

The corollary: **`localhost` inside a container means that container.** `http://localhost:11434` from the `api` container is the API container's own loopback, where nothing is listening. This is the single most common Compose networking bug, and the fix is always the same — use the service name.

## Reaching the host

Occasionally you want the reverse: a container calling something running natively on your Mac, such as a natively installed Ollama that has GPU access. Docker Desktop provides a special hostname for that:

```yaml
    environment:
      OLLAMA_HOST: http://host.docker.internal:11434
```

That single change switches your stack between containerized and native Ollama without touching code.

## Diagnosing it

```bash
docker compose exec api sh
# inside the container:
getent hosts ollama
curl http://ollama:11434
curl http://chroma:8000/api/v1/heartbeat
```

If the name does not resolve, the two services are not on the same network — usually because one is in a different Compose project or an explicit `networks:` block separated them. If it resolves but the connection is refused, the service is not listening yet, or it is bound to its own loopback rather than `0.0.0.0`, or you used the host-published port by mistake.

## Practice

1. Build the three-service file above and bring it up. From the `api` container, `curl http://ollama:11434` and confirm the response.
2. From the same shell, try `curl http://localhost:11434` and observe the failure. Explain it in one sentence.
3. Publish Chroma as `"8001:8000"`, then confirm the host reaches it at `localhost:8001` while `api` still uses `chroma:8000`.
4. Switch `OLLAMA_HOST` to `http://host.docker.internal:11434` and describe what would need to be true on your machine for it to work.
