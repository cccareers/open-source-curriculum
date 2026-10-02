---
lesson_id: DOCKER-AI-101-05
course_id: DOCKER-AI-101
pathway: ai-developer
title: Installing Docker Desktop
order: 5
kind: lesson
competency_ids:
  - D5-S5-C01
objectives:
  - Install and verify Docker Desktop on macOS (Apple Silicon) or Windows
  - Confirm a working setup by running a hello-world container
---

## Installing on macOS (Apple Silicon)

Download Docker Desktop from `docker.com`, choosing the **Apple Silicon** build — not the Intel one. Open the `.dmg`, drag Docker to Applications, and launch it. The first start takes a minute while it creates the Linux VM that will host your containers, and it will ask for your password once to install a privileged helper.

When the whale icon in the menu bar stops animating, the engine is running.

## Installing on Windows

Download Docker Desktop for Windows and let the installer enable the **WSL 2** backend, which is the supported option. If WSL 2 is not present, the installer will prompt you to install it, and Windows will need a restart. After the restart, launch Docker Desktop and wait for the engine to report that it is running.

## Verify the installation

Two commands. The first proves the client and engine can talk; the second proves a container can actually run.

```bash
docker version
docker run --rm hello-world
```

`docker version` prints a **Client** block and a **Server** block. If the server block is missing or you see "Cannot connect to the Docker daemon", Docker Desktop is not running — start it and wait.

`hello-world` pulls a tiny image, starts it, prints a paragraph confirming the whole pipeline worked, and exits. The `--rm` flag removes the finished container so it does not clutter your list.

Confirm Compose is available too — it ships with Docker Desktop as a subcommand, not a separate binary:

```bash
docker compose version
```

Note the space: modern Compose is `docker compose`, not the old `docker-compose` script you will still see in older tutorials.

## Give the VM enough room

Open **Settings → Resources**. Containers can only use what the Linux VM has, and the default allocation is often smaller than an LLM needs. On a 16 GB machine, allocating 8 GB of memory to Docker is a reasonable starting point; on 8 GB, allocate what you can spare and expect to use smaller models. Apply and restart when you change it.

## Why this counts as environment management

Docker Desktop is the one thing every collaborator installs; after that, your project's environment is defined by files in your repository rather than by installation instructions in a README. That is the same reproducibility goal as a lockfile, moved up a level: instead of pinning packages and hoping the system libraries match, you pin the entire filesystem.

## Practice

1. Install Docker Desktop for your platform and confirm `docker version` prints both a Client and a Server block.
2. Run `docker run --rm hello-world` and read the output paragraph — it narrates the same pull, create, start, exit sequence from the previous lesson.
3. Run `docker compose version` and record it. Then open Settings → Resources, note the current memory allocation, and raise it if your machine can spare more.
4. Quit Docker Desktop entirely and run `docker ps`. Read the error carefully so you recognize it later, then start Docker Desktop again.
