---
lesson_id: DOCKER-AI-101-13
course_id: DOCKER-AI-101
pathway: ai-developer
title: Running Containers
order: 13
kind: lesson
competency_ids:
  - D5-S6-C01
  - D5-S2-C01
objectives:
  - Run containers in interactive and detached modes and name them deliberately
  - Start, stop, and remove containers as part of a daily development loop
---

## Interactive or detached

A container is a process, and like any process you start from a terminal you can run it in the foreground or in the background.

**Interactive** attaches your terminal to the container, which is what you want for a shell or a one-off script:

```bash
docker run -it --rm python:3.11-slim bash
```

`-i` keeps stdin open, `-t` allocates a pseudo-TTY so you get a usable prompt with line editing. They are nearly always used together as `-it`. Type `exit` and the process ends, so the container stops.

**Detached** starts the container in the background and prints its id, which is what you want for a server:

```bash
docker run -d --name ollama -p 11434:11434 ollama/ollama
```

`-d` returns your prompt immediately. The container keeps running until its main process exits or you stop it.

## Name your containers

Without `--name`, Docker invents something like `nostalgic_bhaskara`. That is fine for throwaways and terrible for anything you will reference again — every later command becomes a copy-paste from `docker ps`.

```bash
docker run -d --name rag-api -p 8000:8000 acme/rag-api:0.3.1
```

Now `docker logs rag-api`, `docker exec -it rag-api bash`, and `docker stop rag-api` all read clearly. Names are unique per machine, so you must remove an old container before reusing its name — which is itself a useful guard against running two copies by accident.

## The daily loop

```bash
docker ps                 # what is running
docker ps -a              # including stopped containers
docker stop rag-api       # graceful: SIGTERM, then SIGKILL after a grace period
docker start rag-api      # restart the same container, writable layer intact
docker restart rag-api
docker rm rag-api         # delete a stopped container
docker rm -f rag-api      # stop and delete in one step
```

Two flags shape how much cleanup you do later. `--rm` deletes the container as soon as it exits — ideal for experiments, wrong for anything whose filesystem you might want to inspect afterwards. `--restart unless-stopped` brings a service back up after a crash or a Docker Desktop restart, which is convenient for a model server you want always available.

Stopped containers cost almost nothing but they accumulate. `docker container prune` removes all of them at once.

## Foreground, backgrounded, stopped

The mental model maps onto ordinary process control. Running without `-d` is like running a command in the foreground; pressing `Ctrl+C` sends an interrupt to the container's main process and it stops. Running with `-d` is like appending `&`. `docker attach` and `docker logs -f` are the two ways back to a detached container's output — `attach` connects your terminal to the process, while `logs -f` only follows the stream and is much safer, because `Ctrl+C` during an `attach` can kill the service.

## Practice

1. Start an interactive container: `docker run -it --rm python:3.11-slim bash`. Inside it, run `ls /`, `python --version`, and `ps aux`. Note how few processes exist. Exit.
2. Start a detached named container: `docker run -d --name web -p 8080:80 nginx`. Confirm with `docker ps` and open `localhost:8080`.
3. Stop it, list it with `docker ps -a`, start it again, then remove it with `docker rm -f web`.
4. Run the same nginx command twice without stopping the first. Read the error about the name conflict and resolve it.
