---
lesson_id: DOCKER-AI-101-01
course_id: DOCKER-AI-101
pathway: ai-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

AI projects break on other people's machines more often than most software does. A model runtime wants one version of Python, a vision library wants a different build of a compiled dependency, and the weights live in a directory only you have. Containers fix that by shipping the environment along with the code, and this course teaches you to do it on the hardware you already own.

You will start with the concepts you need to reason about images and containers, then write Dockerfiles that package a Python AI service without waiting twenty minutes for every rebuild. From there you will run containers day to day — persisting model files, mounting your source for live editing, publishing ports, and reading logs when something misbehaves. A full module is devoted to serving local language models with the official Ollama image, including how to pick a quantized model that actually fits in 8 to 16 GB of RAM.

The course ends where real projects end up: a multi-service stack defined in a single Compose file, with an LLM server, a vector database, and an API or UI talking to each other by name. Everything here is designed to run on a laptop, including an Apple Silicon Mac, with no GPU and no CUDA setup required.

## Objectives

- Explain the reproducibility and isolation case for containerizing AI development work
- Write a Dockerfile that packages a Python AI service with lean base images and cache-friendly layers
- Run AI containers with persistent model storage, live-mounted code, and published ports
- Serve a local LLM with the official Ollama Docker image and call it from a Python application
- Define and operate a multi-service AI stack (LLM, vector store, API/UI) with Docker Compose
- Apply image-size, config, and sharing best practices that keep an AI Docker workflow reproducible for a team

## Prerequisite Knowledge

- Comfortable running commands in a terminal
- Basic Python familiarity (can read and run a simple script)

## Course Content

1. Course Overview
2. What is Docker?
3. Containers vs. Virtual Machines
4. Docker Architecture
5. Installing Docker Desktop
6. The Local AI Developer Workflow
7. Choosing the Right Base Image
8. Core Dockerfile Instructions
9. Managing Python AI Dependencies
10. Handling Model Weights
11. Layer Caching for Fast Rebuilds
12. Tagging and Sharing Images
13. Running Containers
14. Persisting Models and Data with Volumes
15. Bind Mounts for Live Development
16. Publishing Ports
17. Executing Commands and Inspecting Containers
18. What is Ollama and Why Container It?
19. Running the Official Ollama Docker Image
20. Persisting the Ollama Model Cache
21. Choosing Models for Low-Memory Hardware
22. Calling Ollama from a Python Application
23. Why Docker Compose for AI Stacks?
24. Anatomy of a compose.yaml File
25. Building and Starting the Stack
26. Docker Networking Between Services
27. Environment Variables and .env Files
28. Viewing and Filtering Logs
29. Full Stack Walkthrough
30. Image Size and Build Best Practices
31. Sharing Your Stack with Teammates
32. When to Move Beyond Docker Compose
