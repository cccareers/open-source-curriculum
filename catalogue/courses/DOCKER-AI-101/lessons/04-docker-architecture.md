---
lesson_id: DOCKER-AI-101-04
course_id: DOCKER-AI-101
pathway: ai-developer
title: Docker Architecture
order: 4
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Identify the roles of the Docker Engine, images, containers, and registries
  - Trace what happens between typing docker run and a process starting in a
    container
---

## The four moving parts

**The Docker Engine** is the background daemon that does the real work: building images, starting and stopping containers, managing networks and volumes. On macOS and Windows it lives inside Docker Desktop's Linux VM. The `docker` command you type is only a client; it sends your request to the engine over a local socket and prints what comes back.

**An image** is the immutable package — layered filesystem plus metadata such as the default command, exposed ports, and environment variables. Images are identified by a name and tag, like `python:3.11-slim` or `ollama/ollama:latest`.

**A container** is an image plus a writable layer plus a running process. It has a lifecycle: created, running, exited, removed.

**A registry** is where images are stored and shared. Docker Hub is the default public one; teams often add a private registry. `docker pull` downloads from a registry, `docker push` uploads to it.

## What happens when you type docker run

```bash
docker run --rm -p 8000:8000 --name demo python:3.11-slim python -c "print('hello')"
```

Step by step, the engine:

1. **Resolves the image.** Is `python:3.11-slim` already in the local image cache? If not, it contacts the registry and pulls the layers it is missing. Layers already present from another image are reused, not re-downloaded.
2. **Creates the container.** It stacks the image's read-only layers, adds a thin writable layer on top, and records the configuration you asked for — the name `demo`, the port mapping, the command to run.
3. **Sets up isolation.** New namespaces give the container its own filesystem root, network interface, and process tree. The port publish rule that forwards host port 8000 to container port 8000 is installed.
4. **Starts the process.** Your command becomes PID 1 inside the container. Its stdout and stderr stream back to your terminal, and `docker logs` can replay them.
5. **Cleans up.** When PID 1 exits, the container stops. Because you passed `--rm`, the writable layer is deleted too; without it, the stopped container lingers until you run `docker rm`.

The rule worth memorizing: **a container lives exactly as long as its main process.** A container that "exits immediately" almost always ran a command that finished, not a server that stayed up.

## Seeing the parts

```bash
docker images          # images in the local cache
docker ps              # running containers
docker ps -a           # including exited ones
docker info            # what the engine says about itself
```

## Practice

1. Run `docker pull python:3.11-slim`, then `docker images`, and note the size. Pull it a second time and observe that nothing is downloaded.
2. Run the `docker run` command above. Then run it again without `--rm` and use `docker ps -a` to find the exited container. Remove it with `docker rm demo`.
3. Run `docker run --rm python:3.11-slim echo hi` and explain in one sentence why the container stopped on its own.

## Check your understanding

1. You run `docker run -d python:3.11-slim python -c "print('hi')"`. A second later `docker ps` shows nothing. Is something broken?
2. You pull `python:3.11-slim`, then pull another image built on the same Debian base. Why is the second download smaller than its listed size?
3. Which part of Docker actually starts the container: the `docker` command you typed, or something else?

*Answers:* (1) No. The main process printed and exited, so the container stopped; `docker ps -a` shows it as `Exited (0)`. (2) Layers already in the local cache are reused, not re-downloaded. (3) The Docker Engine. The `docker` CLI is only a client that sends the request over a local socket.
