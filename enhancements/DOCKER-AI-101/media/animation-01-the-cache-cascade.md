---
course_id: DOCKER-AI-101
media_id: DOCKER-AI-101-a01
type: animation-storyboard
title: "The Cache Cascade"
target_runtime: "70 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - DOCKER-AI-101-11
objectives:
  - Order Dockerfile instructions so dependency layers are not reinstalled on every code change
  - Write a Dockerfile that packages a Python AI service with lean base images and cache-friendly layers
competency_ids:
  - D5-S6-C01
---

## Concept and misconception it fixes
**Misconception:** "Docker rebuilds only the line I changed." In reality, a cache miss at one step invalidates *every step after it*, because each step's cache key includes its parent. The animation makes the cascade visible: the same one-line source edit costs minutes with one ordering and a second with the other.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- Each Dockerfile step is a horizontal **block** stacked bottom-up like layers. The block label is the instruction text in monospace, for example `RUN pip install -r requirements.lock.txt`.
- Block height is proportional to time cost. The `pip install` block is much taller and carries a small "torch, transformers…" sublabel.
- Color-blind-safe states, Okabe-Ito palette, always paired with a text badge and a pattern:
  - **CACHED**: blue `#0072B2`, solid fill, ✓ badge, text "CACHED".
  - **REBUILD**: orange `#E69F00`, diagonal hatch pattern, ⟳ badge, text "REBUILD".
  - **Changed input**: vermillion `#D55E00` outline with a pulsing file icon.
- A small "source file" icon labeled `main.py` sits to the left, with a "requirements.lock.txt" icon below it.
- A stopwatch in the top-right corner shows accumulated rebuild time.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Empty stage. Title: "The Cache Cascade". Two Dockerfile listings fade in side by side, labeled **A: copy everything first** and **B: requirements first**. | The listings slide down and convert into block stacks. | "Two Dockerfiles. Same instructions. Different order." |
| 2 | 8s | Stack A from the bottom: `FROM`, `WORKDIR`, `COPY . .`, `RUN pip install` (tall), `CMD`. All blocks are blue and CACHED. | Blocks drop in one at a time with a soft thud. | "After a first build, every step is cached." |
| 3 | 7s | The `main.py` icon pulses vermillion and a "docstring edit" label appears. An arrow connects `main.py` to the `COPY . .` block. | The icon pulses, then the arrow draws. | "Now change one word in main.py." |
| 4 | 10s | `COPY . .` flips to orange/hatched REBUILD. Then `RUN pip install` flips, then `CMD`. | A domino flip, top-down, 0.4s apart. The stopwatch jumps to [4:00] as the tall block flips. | "COPY sees new content, so it misses. Every step after it has a new parent, so they miss too. Including pip install." |
| 5 | 5s | Freeze on stack A with a label: "1 edit → full reinstall". | Hold. | "One edit. Full reinstall." |
| 6 | 8s | Stack B from the bottom: `FROM`, `WORKDIR`, `COPY requirements.lock.txt .`, `RUN pip install` (tall), `COPY . .`, `CMD`. All CACHED. | Blocks drop in. The stopwatch resets to 0:00. | "Version B copies only the requirements file before installing." |
| 7 | 10s | The same `main.py` edit. The arrow goes to the `COPY . .` block, which now sits *above* pip install. The `COPY . .` and `CMD` blocks flip to REBUILD; everything beneath stays CACHED. | The domino flip stops before the tall block, with a small "bounce" on the pip install block to show it is untouched. Stopwatch: [0:01]. | "Same edit. The cascade starts after the expensive step, so pip install stays cached." |
| 8 | 8s | The `requirements.lock.txt` icon pulses with an "add httpx" label. The arrow goes to `COPY requirements.lock.txt .`; that block and everything above it flips. | Domino flip. The stopwatch climbs. | "Change a dependency, and it rebuilds from there. Exactly when it should." |
| 9 | 6s | Both stacks side by side, with the rule banner: "Least likely to change → most likely to change". | The banner wipes in. | "Order from least likely to change, to most likely." |

## Interaction variant (optional)
A step-through H5P or web interactive. The learner drags Dockerfile lines into an order, clicks either "edit main.py" or "edit requirements", and watches the cascade play out with a running time total. Challenge mode asks for the ordering with the lowest total time across a scripted week of 40 code edits and 1 dependency edit.

## Production notes
- Build in Motion Canvas using one reusable `Step` component with `state: 'cached' | 'rebuild'`. The flip is a 0.3s Y-axis rotation that swaps fill, pattern, and badge together.
- Strictly, `CMD` and `WORKDIR` only record metadata and don't add filesystem layers. They still take part in the cache chain, so showing them as blocks is accurate for this concept. Keep the "step" wording in the VO.
- Stopwatch values are illustrative; keep them in brackets in the script until they are matched to the real recording from video v02 so the two pieces agree.
- Export at 1920×1080, plus a 1080×1080 square cut for the lesson page. Provide captions and a one-paragraph text description for screen-reader users.
