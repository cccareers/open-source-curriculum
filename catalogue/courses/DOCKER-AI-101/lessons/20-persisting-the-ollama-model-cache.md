---
lesson_id: DOCKER-AI-101-20
course_id: DOCKER-AI-101
pathway: ai-developer
title: Persisting the Ollama Model Cache
order: 20
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Use a named volume so downloaded Ollama models survive container restarts
  - Avoid re-downloading multi-gigabyte models after every docker run
---

## Where Ollama keeps its models

Inside the container, Ollama stores everything under `/root/.ollama` — downloaded model blobs, manifests, and the key it uses to identify itself. Model blobs are the bulk: a 3B model is around 2 GB, an 8B model around 4.7 GB.

Without a volume, that directory lives in the container's writable layer. `docker rm` deletes it. So does recreating the container to change a flag, or upgrading the image, or running `docker system prune` in a tidying mood. Each time, every model has to be downloaded again.

## The fix is one flag

```bash
docker run -d --name ollama \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  ollama/ollama
```

`ollama:` names a Docker-managed volume. It is created on first use and then persists independently of any container.

Prove it works, because seeing it once is worth more than trusting it:

```bash
docker exec ollama ollama pull llama3.2
docker exec ollama ollama list

docker rm -f ollama

docker run -d --name ollama -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
docker exec ollama ollama list
```

The model is still there, instantly, with no download. The container was destroyed and replaced; the cache never moved.

## Choosing where the cache lives

A **named volume** is the right default. Docker manages the location, permissions work, and it survives everything except a deliberate `docker volume rm`.

A **bind mount** to a host directory is the alternative:

```bash
docker run -d --name ollama \
  -v "$HOME/.ollama":/root/.ollama \
  -p 11434:11434 ollama/ollama
```

This is worth knowing for one specific case: if you already run Ollama natively on your Mac, pointing the container at `$HOME/.ollama` lets both share one cache instead of storing every model twice. The cost is host-path coupling, so the command is no longer portable to a teammate's machine, and permission mismatches are possible.

## Managing the cache

Models accumulate quickly, and several 4 GB files add up faster than most people expect.

```bash
docker exec ollama ollama list      # what is stored
docker exec ollama ollama rm mistral  # remove one model
docker system df                    # how much space volumes use
docker volume inspect ollama
```

Remove models through `ollama rm` rather than by deleting files, so the manifests stay consistent.

Two cautions. `docker volume prune` deletes volumes no container currently references — if your Ollama container is removed at the time, the model cache qualifies. And upgrading the image with `docker pull ollama/ollama` then recreating the container is completely safe *because* the volume is separate; that is the same property that makes the whole pattern worthwhile.

## Practice

1. Start Ollama with a named volume and pull a model.
2. Destroy the container with `docker rm -f ollama`, recreate it with the same `-v` flag, and confirm with `ollama list` that no re-download occurs.
3. Now start a container **without** the volume flag, pull a model, remove the container, recreate it, and observe the empty list.
4. Run `docker system df` and record how much space your Ollama volume occupies.
