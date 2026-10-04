---
lesson_id: DOCKER-AI-101-15
course_id: DOCKER-AI-101
pathway: ai-developer
title: Bind Mounts for Live Development
order: 15
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Mount local source code into a container so changes apply without rebuilding
    the image
  - Distinguish bind mounts from named volumes and pick the right one per use
    case
---

## Editing code without rebuilding

Baking source into an image is right for shipping and painful for development: every edit means `docker build`, then `docker run`, then find your place again. A **bind mount** removes that loop by pointing a directory inside the container straight at a directory on your Mac or PC.

```bash
docker run --rm -it \
  -v "$(pwd)":/app \
  -w /app \
  -p 8000:8000 \
  ai-demo:0.1 \
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The source is a host path, so Docker treats it as a bind mount rather than a named volume — that is the only syntactic difference. `$(pwd)` supplies an absolute path, which works on every Docker version. Recent versions also accept a relative path that starts with `./`, but a bare name such as `app:/app` is always read as a *named volume* called `app`, not as your `app` folder — a quiet mistake that leaves you editing files the container never sees. `--reload` tells uvicorn to restart when a file changes, so saving a file in your editor updates the running service within a second.

The image still supplies Python and the installed dependencies. Only your source is coming from the host.

## Bind mount or named volume?

| | Bind mount | Named volume |
| --- | --- | --- |
| Source | A path you choose on the host | Storage Docker manages |
| You edit it directly | Yes, in your normal editor | Not conveniently |
| Portable across machines | No — the path must exist | Yes |
| Typical use | Source code during development | Model weights, databases, caches |
| Performance on macOS | Slower, files cross the VM boundary | Native speed inside the VM |

The heuristic: **bind mounts for things a human edits, named volumes for things a program writes.** A working AI stack usually uses both at once — your application code bind-mounted, the model cache and vector store on named volumes.

## Things that bite

**The mount hides what was underneath.** If the image has `/app/app/main.py` baked in and you mount over `/app`, the image's copy is invisible while the mount is active. That is usually what you want, but it explains "my changes appear but the file I added in the Dockerfile vanished".

**Dependencies do not come along.** Installing a package inside a bind-mounted directory does not update the image. Add it to `requirements.txt` and rebuild.

**macOS performance.** Bind mounts on Docker Desktop cross into the Linux VM, so a directory with thousands of small files — `node_modules`, a `.venv`, a big dataset — is noticeably slow. Keep bind mounts scoped to source, and put heavy data on named volumes.

**Read-only when you can.** Appending `:ro` prevents the container from modifying host files, which is a sensible default for mounting a dataset or a config directory:

```bash
docker run --rm -v "$(pwd)/data":/data:ro ai-demo:0.1 python ingest.py
```

## Practice

1. Run your FastAPI image with `-v "$(pwd)":/app` and `--reload`. Edit a route's response in your editor, save, and refresh the browser without rebuilding.
2. Add a new file on the host and confirm it appears via `docker exec <name> ls /app`.
3. Mount a data directory with `:ro`, then try to write to it from inside the container and read the error.
4. State in one sentence which of your project's directories belongs on a bind mount and which belongs on a named volume.
