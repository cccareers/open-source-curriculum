---
lesson_id: DOCKER-AI-101-21
course_id: DOCKER-AI-101
pathway: ai-developer
title: Choosing Models for Low-Memory Hardware
order: 21
kind: lesson
competency_ids:
  - D2-S5-C01
objectives:
  - Choose a model and quantization level (Q4, Q8) appropriate to 8-16 GB of RAM
  - Reason about the capability, speed, and memory tradeoffs of smaller
    quantized models
---

## The memory arithmetic

Two numbers decide whether a model runs on your laptop: parameter count and quantization level.

A rough rule for the weights alone:

- **16-bit (unquantized):** parameters × 2 bytes. A 7B model needs about 14 GB.
- **8-bit (Q8):** parameters × 1 byte. About 7 GB.
- **4-bit (Q4):** parameters × 0.5 bytes. About 3.5 to 4 GB.

Then add overhead. The key-value cache for the context window, the runtime itself, and headroom for the operating system add roughly 1 to 2 GB, more if you use a long context. And in Docker, the ceiling is not your machine's RAM — it is the memory allocated to Docker Desktop's Linux VM.

That gives a practical budget:

| Docker VM memory | Comfortable choice |
| --- | --- |
| 4 GB | 1B–3B at Q4 (`llama3.2:1b`, `gemma2:2b`) |
| 8 GB | 3B–7B at Q4 (`llama3.2`, `phi3:mini`, `mistral`) |
| 12–16 GB | 7B–8B at Q4 or Q8 (`llama3.1:8b`) |

Exceed the budget and the container is killed — the `Exited (137)` from the debugging lesson, with no traceback to explain it.

## What quantization costs

Quantization stores each weight with fewer bits. Q8 is close to indistinguishable from the full-precision model for most tasks. Q4 is a real but usually modest quality drop: slightly weaker at multi-step reasoning, precise arithmetic, and long structured outputs; largely fine for summarizing, extraction, classification, drafting, and question answering over retrieved text.

Speed moves the other way. Local inference on CPU is memory-bandwidth-bound, so a smaller file means fewer bytes read per token and a faster response. Q4 is typically noticeably quicker than Q8 of the same model, and a 3B model is dramatically quicker than an 8B one.

## Choosing well

The productive way to reason is by task, not by leaderboard.

**A larger model earns its memory** when the task needs multi-step reasoning, code generation of any length, or nuanced instruction-following.

**A smaller model is the better choice** when the task is narrow — classification, extraction, routing, rewriting, summarizing text you supply — or when you need speed for a tight development loop, or when several services must share the machine. In a retrieval setup, much of the difficulty is moved into the retrieval step, and a 3B model reading good context often beats an 8B model guessing.

Ollama tags encode both dimensions: `llama3.2:3b` names the size, and a suffix such as `llama3.1:8b-instruct-q4_K_M` names the quantization. A bare tag like `llama3.2` resolves to a sensible Q4 default.

Start smaller than you think you need, measure whether the output is good enough, and move up only when it is not. On a laptop the constraint is real, and choosing a model you can actually run beats admiring one you cannot.

## Practice

1. Check Docker Desktop's memory allocation, then compute your budget with the formula above and name the largest model size you should attempt.
2. Pull two models of different sizes, for example `llama3.2:1b` and `llama3.2`. Send the same prompt to each and compare response time and quality.
3. Watch `docker stats ollama` during a request and record peak memory for each model.
4. Write one sentence recommending a model for a document-classification feature, justifying the size in terms of capability, speed, and memory.
