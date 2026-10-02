---
lesson_id: DOCKER-AI-101-14
course_id: DOCKER-AI-101
pathway: ai-developer
title: Persisting Models and Data with Volumes
order: 14
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Run AI containers with persistent model storage, live-mounted code, and
    published ports
  - Use named volumes so models and data survive container restarts
---

## Container filesystems are disposable

Everything a container writes goes into its thin writable layer, and `docker rm` deletes that layer. For a 4 GB model download or a vector database index, losing it is not a minor inconvenience — it is a twenty-minute re-download every time you recreate the container.

A **named volume** is storage managed by Docker that exists independently of any container. Containers come and go; the volume stays.

```bash
docker volume create ollama-models
docker volume ls
docker volume inspect ollama-models
```

## Mounting a volume

```bash
docker run -d --name ollama \
  -v ollama-models:/root/.ollama \
  -p 11434:11434 \
  ollama/ollama
```

The `-v` syntax is `<source>:<target>`. Because the source is a plain name rather than a path, Docker treats it as a named volume and creates it if it does not exist. Everything the container writes under `/root/.ollama` lands in the volume instead of the writable layer.

The longer `--mount` form does the same thing more explicitly, and is worth knowing because Compose files use the same vocabulary:

```bash
docker run -d --name ollama \
  --mount type=volume,source=ollama-models,target=/root/.ollama \
  -p 11434:11434 ollama/ollama
```

## Proving persistence

```bash
docker exec ollama ollama pull llama3
docker rm -f ollama
docker run -d --name ollama -v ollama-models:/root/.ollama -p 11434:11434 ollama/ollama
docker exec ollama ollama list
```

The model is still listed. The container was destroyed and rebuilt; the weights never moved.

Volumes are also shareable. Two containers can mount the same volume — an ingestion job and an API, for example, reading the same embedding index.

## Where volumes live, and cleaning up

A named volume lives inside Docker's own storage area, which on macOS is inside the Linux VM. You are not meant to browse it from Finder; that opacity is the point, because Docker handles permissions and portability for you. To read the contents, mount it into a throwaway container:

```bash
docker run --rm -v ollama-models:/data python:3.11-slim ls -la /data
```

Volumes outlive containers *and* they outlive your attention. Check disk usage and clean deliberately:

```bash
docker system df
docker volume prune        # removes volumes no container references
docker volume rm ollama-models
```

Be careful with `prune`. If your only copy of a downloaded model sits in an unreferenced volume, pruning deletes several gigabytes you will have to fetch again.

## Practice

1. Create a volume named `ai-data` and start a container with `-v ai-data:/data`. Write a file into `/data` from inside the container.
2. Remove the container with `docker rm -f`, start a fresh one with the same volume, and confirm the file survived.
3. Start a second container mounting `ai-data` at the same time and confirm both see the file.
4. Run `docker system df` and note how much space volumes are using on your machine.
