---
lesson_id: DOCKER-AI-101-16
course_id: DOCKER-AI-101
pathway: ai-developer
title: Publishing Ports
order: 16
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Publish container ports to expose an inference API or UI to the host machine
  - Diagnose the common failure of a service listening inside the container but
    unreachable from the host
---

## Containers have their own network

A container gets its own network namespace, which means its own set of ports. A service listening on port 8000 inside the container is not reachable from your browser until you **publish** the port.

```bash
docker run -d --name rag-api -p 8000:8000 acme/rag-api:0.3.1
```

The `-p` flag reads `host:container`. Traffic arriving at port 8000 on your Mac is forwarded to port 8000 inside the container. The two numbers need not match, which is how you run several services that all default to the same port:

```bash
docker run -d --name api-a -p 8000:8000 acme/rag-api:0.3.1
docker run -d --name api-b -p 8001:8000 acme/rag-api:0.3.1
```

Both containers still think they are on 8000. You reach them at `localhost:8000` and `localhost:8001`.

Useful variants:

```bash
-p 127.0.0.1:8000:8000    # only reachable from this machine, not the local network
-P                        # publish every EXPOSEd port to a random high host port
```

`EXPOSE` in the Dockerfile documents the port; it publishes nothing. `-p` is what actually opens the door.

## The failure you will hit

You start the container, `docker ps` shows it running, and `curl localhost:8000` returns "connection reset" or hangs. Work through it in this order.

**1. Is the process bound to `0.0.0.0`?** This is the single most common cause. A server bound to `127.0.0.1` inside the container is listening on the *container's* loopback interface, which the published port cannot reach. Frameworks default to loopback, so you must say otherwise:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Streamlit needs `--server.address 0.0.0.0`; Flask's development server needs `--host=0.0.0.0`.

**2. Did you publish at all?** `docker ps` shows a `PORTS` column. If it reads `8000/tcp` with no `->`, the port is exposed but not published. Restart with `-p`.

**3. Do the numbers line up?** `-p 8000:8080` forwards host 8000 to container 8080. If the app listens on 8000, nothing is there.

**4. Is the process actually up?** `docker logs rag-api` will show a crash on startup. A running container with a dead server is possible if the main process is a supervisor.

**5. Is the host port already taken?** Docker refuses to start with a bind error naming the port. Pick another host port or stop whatever holds it.

## Practice

1. Run your service with `-p 8000:8000` and confirm `curl http://localhost:8000` works.
2. Change the bind address to `127.0.0.1` inside the container, restart, and reproduce the failure. Read the `PORTS` column in `docker ps` while it is broken.
3. Fix it by binding `0.0.0.0`, then start a second copy on host port 8001 and confirm both respond.
4. Deliberately publish to a port already in use and read the error Docker prints.
