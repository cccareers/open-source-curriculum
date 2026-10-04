---
course_id: DOCKER-AI-101
media_id: DOCKER-AI-101-a02
type: animation-storyboard
title: "Where Your Bytes Live"
target_runtime: "90 sec"
suggested_tool: "Motion Canvas"
related_lessons:
  - DOCKER-AI-101-14
  - DOCKER-AI-101-15
  - DOCKER-AI-101-20
  - DOCKER-AI-101-25
objectives:
  - Distinguish bind mounts from named volumes and pick the right one per use case
  - Understand what state persists across a down/up cycle and what does not
  - Avoid re-downloading multi-gigabyte models after every docker run
competency_ids:
  - D5-S6-C01
---

## Concept and misconception it fixes
**Misconception:** "A container is like a little computer, so the things I put in it stay there." In fact, a container's writable layer is deleted with the container. Only named volumes, which Docker manages, and bind mounts, which are your host files, outlive it. The animation follows three files through `docker rm`, `docker compose down`, and `docker compose down --volumes`, so learners can see which files survive each command.

## Visual language (shapes, colors with color-blind-safe palette, labels)
- **Mac**: a large rounded rectangle, labeled "Your Mac". Inside it, a dashed rectangle labeled "Docker Desktop Linux VM".
- **Container**: a box inside the VM, labeled `ollama`. It has a striped **image** base (read-only, padlock icon) with a thin **writable layer** strip on top, labeled "writable layer".
- **Named volume**: a cylinder inside the VM, outside the container, labeled `ollama-models`.
- **Bind mount**: a folder icon on the Mac, *outside* the VM, labeled `./api`. A tube runs from the folder into the `api` container.
- Three file tokens, each with a distinct **shape** as well as color (Okabe-Ito):
  - Square, sky blue `#56B4E9`: `llama3.2` (2 GB) in the volume.
  - Circle, bluish green `#009E73`: `main.py` in the bind mount.
  - Triangle, orange `#E69F00`: `/tmp/scratch.txt` in the writable layer.
- Destruction is shown with a dissolve plus a "deleted" label. Survival is shown with a ✓ badge plus a "kept" label.

## Scenes
| # | Duration | Frame description | Motion | Caption / VO |
|---|---|---|---|---|
| 1 | 8s | Mac → VM → `ollama` container (image base + writable layer). Title: "Where Your Bytes Live". | Boxes nest in from the outside to the inside. | "Every byte a container writes has to live somewhere. Where it lives decides whether it survives." |
| 2 | 10s | `docker exec ollama ollama pull llama3.2` appears in a terminal strip. With **no volume**, the square token lands in the writable layer. | The token falls into the thin strip, which bulges to show "2 GB". | "Pull a model with no volume, and those two gigabytes land in the container's writable layer." |
| 3 | 8s | `docker rm -f ollama`. | The container dissolves. The square token dissolves with it, labeled "deleted". | "Remove the container, and the model goes with it. Next run: download it again." |
| 4 | 12s | Rewind. Run with `-v ollama-models:/root/.ollama`. The cylinder appears beside the container, and a pipe connects `/root/.ollama` to it. The pull now sends the square token into the cylinder. | The pipe draws, then the token travels through it into the cylinder. | "Now mount a named volume at the model path. The same pull writes into the volume, which Docker keeps outside the container." |
| 5 | 8s | `docker rm -f ollama`, then `docker run ... -v ollama-models:...`. | The container dissolves while the cylinder stays put with a ✓ "kept" badge. A new container fades in and the pipe reconnects. | "Destroy the container. The volume doesn't move. A new container plugs into it, and the model is just there." |
| 6 | 14s | Switch to Compose: a `compose.yaml` strip appears declaring `ollama` (with the `ollama-models` volume) and `api`, and `docker compose up -d` recreates `ollama` as a Compose-managed container. Run `docker compose exec ollama ollama pull llama3.2` to populate the new Compose volume (show the square token arriving in its cylinder). Add the `api` container. The `./api` folder on the Mac connects by a tube. The circle token `main.py` sits in the Mac folder and *appears* in the container through the tube. | The tube draws across the VM boundary, slightly slower, with a small "crosses VM boundary" label. | "Now let Compose manage the stack, so it owns the ollama container and its volume. Your code is different. You edit it on your Mac, so you bind-mount it. The container sees your actual files, not a copy." |
| 7 | 6s | Inside `api`, a process writes `/tmp/scratch.txt`; the triangle token lands in the writable layer. | The token drops in. | "And anything written anywhere else lands in the writable layer." |
| 8 | 10s | `docker compose down`. | Both containers dissolve. The triangle: deleted. The square in the cylinder: kept. The circle in the Mac folder: kept. A ✓ / deleted tally appears. | "Compose down removes containers and the network. Volumes stay. Your bind-mounted files were never Docker's to delete. Only the writable layer is lost." |
| 9 | 10s | `docker compose down --volumes`, with a warning-sign icon. | The cylinder dissolves, labeled "deleted: re-download 2 GB". The circle in the Mac folder is still kept. | "Add --volumes and the named volume goes too. That's the one that costs you a re-download." |
| 10 | 8s | Summary panel with three rows: writable layer (lost on rm and down), named volume (kept unless `--volumes` / `volume rm` / `prune`), bind mount (your files; Docker never deletes them). Rule: "If losing it would hurt, put it on a volume." | Rows slide in. | "If losing it after down would hurt, it needs a volume." |

## Interaction variant (optional)
A scrubbable timeline with command buttons (`docker rm`, `compose down`, `compose down --volumes`, `docker volume prune`). Learners first predict which tokens survive by clicking them, then press play to check. This works as an H5P "Image Hotspots + Timeline" or a small web component. Score the predictions.

## Production notes
- Keep the shapes and colors consistent with the networking diagram in video v01, which uses the same Mac → VM nesting.
- Show model sizes as illustrative labels taken from the lessons: `llama3.2` at about 2 GB.
- Reveal `docker volume prune` only in the interactive variant, with a caution note that matches lesson 14: prune deletes volumes that no container references, so it can delete a cache whose container is currently removed.
- From scene 6 onward everything is Compose-managed; scenes 8–9 only hold because Compose created the containers and the volume. Compose prefixes volume names with the project name (for example `rag-stack_ollama-models`), so it creates its own volume rather than reusing the standalone one from scenes 4–5. Keep the short label on screen, but don't imply the earlier `docker run` volume carries over.
- The "crosses VM boundary" label in scene 6 supports the macOS bind-mount performance note in lesson 15. Keep it subtle.
- Provide captions, an audio description of each token's fate, and a static PNG of the summary panel (scene 10) for the lesson page.
