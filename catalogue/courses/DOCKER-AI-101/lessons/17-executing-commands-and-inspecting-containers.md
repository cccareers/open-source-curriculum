---
lesson_id: DOCKER-AI-101-17
course_id: DOCKER-AI-101
pathway: ai-developer
title: Executing Commands and Inspecting Containers
order: 17
kind: lesson
competency_ids:
  - D5-S2-C01
  - D5-S9-C01
objectives:
  - Debug a running container with docker exec and docker logs
  - Inspect container state to diagnose why a service is failing or misbehaving
---

## Get inside a running container

`docker exec` starts an additional process in a container that is already running. The most useful form opens a shell:

```bash
docker exec -it rag-api bash
```

Now you are at a prompt inside the container's filesystem and can use ordinary terminal skills: `ls /app` to see what actually got copied, `cat requirements.txt` to check what the image believes it installed, `env` to see the environment variables the process received, `ps aux` to see which processes are running, `pip list` to confirm versions.

Slim images have `bash`; some minimal images only have `sh`. If `bash` is not found, try `docker exec -it rag-api sh`. Slim images also leave out `ps` and `curl`, so expect `command not found` for those. Install them temporarily with `apt-get update && apt-get install -y procps curl` while you diagnose, knowing the install disappears with the container.

You can also run a single command without a shell, which is ideal for scripting:

```bash
docker exec rag-api python -c "import torch; print(torch.__version__)"
docker exec ollama ollama list
```

Remember that `exec` changes only the container's writable layer. Installing a package this way disappears the moment the container is recreated — use it to diagnose, then fix the Dockerfile.

## Read the logs

A container's logs are whatever its main process wrote to stdout and stderr. Docker captures them, so you can read them after the fact.

```bash
docker logs rag-api            # everything so far
docker logs -f rag-api         # follow, like tail -f
docker logs --tail 50 rag-api  # the last 50 lines
docker logs -t rag-api         # with timestamps
docker logs --since 10m rag-api
```

Two habits make logs useful for AI services. Set `PYTHONUNBUFFERED=1` in the image so Python does not hold output in a buffer while you stare at an empty log. And log to stdout rather than to a file inside the container, because a file in the writable layer disappears with the container while stdout is captured for you.

## Diagnose a failing service

Work outward from the symptom.

```bash
docker ps -a                 # is it running, or did it exit? what is the exit code?
docker logs --tail 100 rag-api   # what did it say before dying?
docker inspect rag-api       # full configuration as JSON
docker stats rag-api         # live CPU and memory
```

`docker ps -a` showing `Exited (1)` means the process failed; the last lines of the log almost always name the reason — a missing module, a bad path, a port already bound. `Exited (137)` is the one to recognize in AI work: the process was killed with SIGKILL, and on a laptop that usually means it exceeded the memory Docker Desktop's VM has. Loading a model too large for the allocation produces exactly this, with no Python traceback to explain it. Exit code 137 only says "SIGKILL", though. You also get it after `docker kill`, or when `docker stop` gives up on a process that ignored SIGTERM. Confirm a memory kill before you shrink the model:

```bash
docker inspect --format '{{ .State.OOMKilled }}' rag-api   # true means the memory limit killed it
```

`docker inspect` is verbose but authoritative. Filter it rather than reading it whole:

```bash
docker inspect --format '{{ .State.ExitCode }}' rag-api
docker inspect --format '{{ json .Config.Env }}' rag-api
```

`docker stats` shows memory climbing in real time, which tells you whether a model load is going to fit before it gets killed.

## Practice

1. Start your service detached, then `docker exec -it` into it and verify with `env` and `pip list` that the configuration matches what the Dockerfile intended.
2. Break the app on purpose — import a module that is not installed — restart it, and use `docker ps -a` plus `docker logs --tail 50` to identify the cause without guessing.
3. Run `docker stats` while the container starts and record peak memory.
4. Use `docker inspect --format` to print the container's exit code and its environment variables.
