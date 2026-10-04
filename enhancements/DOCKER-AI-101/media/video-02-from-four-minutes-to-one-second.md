---
course_id: DOCKER-AI-101
media_id: DOCKER-AI-101-v02
type: video-script
title: "From Four Minutes to One Second: Layer Caching"
format: screencast
target_runtime: "6 min"
related_lessons:
  - DOCKER-AI-101-08
  - DOCKER-AI-101-11
objectives:
  - Order Dockerfile instructions so dependency layers are not reinstalled on every code change
  - Write a Dockerfile that packages a Python AI service with lean base images and cache-friendly layers
  - Read an existing Dockerfile and predict the image it produces
competency_ids:
  - D5-S6-C01
---

## Purpose
After watching, the learner can read a build log and find the first cache miss, and can reorder a Dockerfile so that a code edit rebuilds in seconds instead of reinstalling the heavy AI dependencies.

## Audience and prerequisites
Learners who have finished lessons 07–09. They have built at least one image. Use a machine with a warm base-image cache and a cold pip cache, so the first install is visibly slow. Recording note: the real timings vary by hardware and network. Record your own, and replace the numbers in brackets with what appears on screen.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Terminal. `time docker build -t rag-api:dev .` is already running. The build log scrolls through `RUN pip install` downloading `torch`. A timer overlay counts up. | "I changed one word in a docstring. One word. And Docker is reinstalling PyTorch. Again. This takes [four minutes] on my laptop, every single edit. By the end of this video, the same edit will rebuild in about a second, and the only change is copying the requirements file on its own before the install." |
| 0:25 | Title card. | "From four minutes to one second: layer caching." |
| 0:35 | `cat Dockerfile` showing the wrong order: `FROM`, `WORKDIR`, `COPY . .`, `RUN pip install ...`, `CMD`. | "Here's the Dockerfile. It looks reasonable: copy the project in, install the requirements, start the server. The problem is the order, and to see why, you need to know how Docker decides what to rebuild." |
| 0:55 | Overlay: the Dockerfile lines as a vertical stack of blocks. | "Docker treats each instruction as a step, built on top of the step before it. Before running a step, it asks one question: have I already built exactly this instruction, on exactly this parent? If yes, it reuses the cached result. If no, it rebuilds that step and every step below it, because their parent just changed." |
| 1:25 | Highlight `COPY . .`. A pulse shows "contents of every file" feeding into it. | "For COPY, 'exactly this instruction' includes the contents of the files being copied. COPY dot dot copies everything, including main.py. Change one character in main.py and this step misses the cache." |
| 1:45 | The blocks below `COPY . .` turn to a striped "rebuild" pattern, including `pip install`. | "And because pip install sits underneath it, pip install rebuilds too. Torch, transformers, all of it. Your docstring typo just cost you [four minutes]." |
| 2:05 | Terminal: `docker build --progress=plain -t rag-api:dev . 2>&1 \| grep -E '^#[0-9]+ (\[\|CACHED)'`. Output shows `[2/4] WORKDIR` → `CACHED`, and `[3/4] COPY . .` with no CACHED line. | "You don't have to guess. Build with progress equals plain and look for the word CACHED. Read top to bottom. The first step without CACHED is your first cache miss. Here it's COPY dot dot, which means everything after it ran again." |
| 2:35 | Edit the Dockerfile live: insert `COPY requirements.lock.txt .` before the install, change the install to use the lockfile, and move `COPY . .` below it. | "The fix: order instructions from least likely to change to most likely to change. Requirements change maybe weekly. Source code changes every few minutes. So copy only the requirements file, install, and then copy everything else." |
| 3:00 | Build once (slow, timer shown). Then edit the docstring and rebuild with `time`. The log shows `COPY requirements.lock.txt` CACHED and `RUN pip install` CACHED, with only `COPY . .` and the `CMD` after it no longer cached. Timer: [~1 s]. | "The first build after reordering still installs everything once. Now the same one-word edit... [about one second]. Look at the log: requirements CACHED, pip install CACHED. The final COPY misses, so it and the CMD after it are redone, but CMD only records metadata, so the only real work is copying your source." |
| 3:35 | Split screen: before [4:02] vs. after [0:01]. | "Same image, one extra COPY for the requirements file, and a different order. [Two hundred and forty] times faster for the edit you make fifty times a day." |
| 3:55 | Edit `requirements.lock.txt` to add `httpx==0.27.2`. Rebuild. The cache stops at the requirements COPY. | "And when you *do* change a dependency, the cache does the right thing: it misses at the requirements copy and reinstalls. That's exactly when it should." |
| 4:15 | Show the `.dockerignore` contents: `.git`, `.venv`, `__pycache__/`, `models/`, `.env`. Run a build and point at "transferring context: 4.2kB" (before: [1.3GB]). | "One more silent cache-buster: junk in the build context. A dot-git folder that changes on every commit, a venv, a downloaded model. Each one bloats the context and can trigger misses. A .dockerignore keeps them out, and keeps your .env file out of the image, which matters even more." |
| 4:45 | Pop quiz overlay: a Dockerfile with `ENV LOG_LEVEL=debug` right after `FROM`, followed by the pip install. "You change LOG_LEVEL daily. What happens?" A 3-second pause, then the answer. | "Quick check. This ENV line sits above pip install, and you change its value every day. What happens? ... Every change invalidates pip install. Volatile settings go at the bottom of the file, or better still, get passed in at run time with -e." |
| 5:15 | Closing card: "Least likely to change → most likely to change." Show the final Dockerfile. | "That's the whole game. One cache miss invalidates everything below it, so put the things that rarely change at the top and your source at the bottom. Next, take the Practice in the layer caching lesson and time it on your own machine." |

## On-screen assets and B-roll
- A demo repo with a `torch`-based `requirements.lock.txt`. Use the CPU wheel index from lesson 09 so the install is large but not absurd.
- The block-stack overlay (0:55–1:45) reuses the visual language of animation a01, "The Cache Cascade".
- Timer overlay graphics driven by the real `time` output, never simulated.

## Accessibility
- Captions and SRT. Read the important log words aloud ("CACHED", "first step without CACHED").
- The striped "rebuild" pattern also carries the text label "REBUILD", and cached blocks carry "CACHED", so the state never depends on color.
- Read the timer values aloud.
- Use a high-contrast terminal theme. Use the `grep` filter so the important lines are not lost in scrolling output.

## Check for understanding
1. Your build log shows `CACHED` for steps 1–3 and no `CACHED` from step 4 onward. What does step 4 tell you? *Answer: it is the first cache miss, the first instruction whose inputs changed. Everything after it rebuilt because its parent changed.*
2. Reorder these lines for the fastest code-edit rebuilds: `COPY . .`, `RUN pip install -r requirements.lock.txt`, `COPY requirements.lock.txt .`, `FROM python:3.11-slim`. *Answer: `FROM`, then `COPY requirements.lock.txt .`, then `RUN pip install ...`, then `COPY . .`.*
3. Why does excluding `.git` in `.dockerignore` help caching? *Answer: `.git` changes on every commit. If `COPY . .` includes it, that step misses even when no source file changed.*
