---
lesson_id: DOCKER-AI-101-18
course_id: DOCKER-AI-101
pathway: ai-developer
title: What is Ollama and Why Container It?
order: 18
kind: lesson
competency_ids:
  - D5-S10-C01
objectives:
  - Explain what Ollama does and why it suits local LLM serving on consumer
    hardware
  - Weigh the portability and reproducibility gains of running Ollama in a
    container
---

## What Ollama is

Ollama is a local model server. It downloads quantized open-weight models — Llama 3, Mistral, Phi-3, Gemma and others — stores them in a local cache, and exposes an HTTP API on port `11434` that your application calls. It handles the parts that are tedious to do yourself: fetching weights, loading them into memory, applying the right chat template for each model family, unloading a model when it goes idle, and offering an OpenAI-compatible endpoint so existing client code mostly works unchanged.

The reason it suits consumer hardware is quantization. A 7B-parameter model at full 16-bit precision needs roughly 14 GB just for weights; quantized to 4 bits it needs closer to 4 GB, which fits alongside everything else on a 16 GB laptop. Ollama distributes models in this quantized form by default, so `ollama pull llama3` gives you something that will actually run.

## Local serving against a hosted API

This is the same decision from the workflow lesson, made concrete.

Running Ollama locally means **no prompt leaves your machine**, which settles a lot of privacy conversations before they start. It means **no per-token cost**, so the twentieth iteration of a prompt is as free as the first. It means **offline capability** and no rate limits. And it means **version stability** — `llama3:8b` does not silently change beneath you.

A hosted API gives you much stronger models, no memory pressure, and throughput a laptop cannot approach. That remains true, and for the hardest reasoning in a product it usually wins.

The productive pattern is to develop against a local model and keep the option of switching. Because both speak HTTP, and because Ollama exposes an OpenAI-compatible route, the difference between the two can be one environment variable in a container.

## Why put it in a container

Ollama installs natively in a couple of clicks, so containerizing it is a real choice with real costs.

**In favour.** The container pins the Ollama version alongside your application's version, so a teammate's stack behaves like yours. It becomes one service in a Compose file rather than a separate install step in a README — the whole stack starts with one command. It keeps your host clean, with the model cache in a named volume you can inspect or delete deliberately. And it is the form the service will take if it ever runs on a Linux server.

**Against.** On macOS this is the honest caveat: containers run inside Docker Desktop's Linux VM, which has no access to Apple's Metal GPU. A natively installed Ollama on an M-series Mac uses the GPU and is substantially faster; the same model inside Docker runs on CPU only. On Linux with an NVIDIA GPU the container can use it, and on Windows through WSL 2 the situation is better than on macOS.

So the guidance is unglamorous but clear. If you are optimizing raw tokens per second on a Mac, install Ollama natively and let your containerized app reach it on the host. If you are optimizing reproducibility and one-command startup for a team, containerize it and accept CPU inference with a small model. The next lessons take the containerized path, because the skills transfer either way.

## Practice

1. List three characteristics of a project that would make local Ollama the right choice over a hosted API, drawn from privacy, cost, offline use, and control.
2. Now list two that would push you the other way.
3. Decide for one project of your own whether Ollama belongs in a container or on the host, and write two sentences justifying it on your actual hardware.
