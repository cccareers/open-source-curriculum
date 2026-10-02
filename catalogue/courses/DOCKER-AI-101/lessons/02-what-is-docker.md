---
lesson_id: DOCKER-AI-101-02
course_id: DOCKER-AI-101
pathway: ai-developer
title: What is Docker?
order: 2
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Explain the reproducibility and isolation case for containerizing AI
    development work
  - Describe the dependency and environment-drift problems Docker solves for
    Python AI projects
---

## The problem Docker actually solves

You install `torch`, then a tutorial needs a different version. A colleague clones your repo and `pip install -r requirements.txt` fails on a package that has to compile against a system library they do not have. Six weeks later your own project stops working because Homebrew upgraded Python underneath it. That slow drift between "the environment I built this in" and "the environment it runs in now" is what makes AI work feel fragile, and it is worse here than in most software because AI dependencies are large, compiled, fast-moving, and often pinned to specific Python versions.

Docker attacks the problem by moving the boundary. Instead of shipping only your code and a list of things the other machine must already have, you ship the filesystem too: the interpreter, the libraries, the system packages, the environment variables, and the command that starts your service.

## Images and containers

Two words do most of the work in Docker, and confusing them is the most common beginner mistake.

An **image** is a read-only package: a stack of filesystem layers plus metadata saying which command to run. It is built once and does not change. Think of it as the recipe plus the ingredients, frozen.

A **container** is a running instance of an image. Docker takes the image, adds a thin writable layer on top, and starts a process inside it with its own filesystem view, its own network interface, and its own process table. You can start ten containers from one image; each gets its own writable layer and none of them can see the others' files.

That distinction is what buys you reproducibility. Because the image is immutable, everyone who runs it starts from byte-identical dependencies. Because the container is isolated, an experiment that installs something strange cannot damage your laptop's Python or your other projects. Deleting a container discards its writable layer and leaves the image untouched, so "start over clean" costs seconds instead of an afternoon.

## What this buys an AI developer

- A teammate runs one command and gets your exact `transformers` and `torch` build, on a different operating system.
- Two projects needing incompatible versions of the same library coexist without virtual-environment gymnastics.
- The thing you tested locally is, layer for layer, the thing that runs on a server later.
- A broken dependency experiment is thrown away with `docker rm`, not debugged.

Docker is not free. Images take disk space, builds take time, and there is a new vocabulary to learn. The rest of this course is about paying that cost cheaply.

## Practice

1. Install nothing yet — instead, open a project you have worked on recently and list every assumption it makes about the machine: Python version, system libraries, model files on disk, environment variables. Write them down.
2. For each item, note whether a fresh laptop would have it. That list is exactly what a container image would need to carry.
3. In two or three sentences, explain to a peer the difference between an image and a container using your own project as the example.
