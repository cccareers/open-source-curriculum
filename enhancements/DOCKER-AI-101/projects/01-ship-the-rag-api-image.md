---
course_id: DOCKER-AI-101
project_id: DOCKER-AI-101-x01
title: "Ship the rag-api Image"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: core
related_lessons:
  - DOCKER-AI-101-07
  - DOCKER-AI-101-08
  - DOCKER-AI-101-09
  - DOCKER-AI-101-11
  - DOCKER-AI-101-12
  - DOCKER-AI-101-30
objectives:
  - Write a Dockerfile that packages a Python AI service with lean base images and cache-friendly layers
  - Use multi-stage builds and .dockerignore to keep AI images lean
  - Tag images meaningfully and push them to Docker Hub or a private registry
  - Apply image-size, config, and sharing best practices that keep an AI Docker workflow reproducible for a team
competency_ids:
  - D5-S6-C01
  - D5-S5-C01
---

## Scenario
Your team at Acme is standardizing on the `rag-api` FastAPI service from the full-stack walkthrough. Right now it lives as a folder plus a Dockerfile that "works on my machine." Before anyone else depends on it, the tech lead has set a bar: the image must be lean, rebuild in seconds after a code edit, carry no secrets, run anywhere with configuration passed in at run time, and be published under a meaningful version tag. Your job is to ship `acme/rag-api:0.1.0` (under your own Docker Hub or GHCR namespace) that passes the team's acceptance script.

## What you will build / produce
- `api/Dockerfile`: slim, pinned base image; dependency layer before source; no build toolchain in the final image (multi-stage if anything compiles).
- `api/.dockerignore`, which excludes `.git`, virtual environments, caches, `models/`, `data/`, and `.env`.
- `api/requirements.lock.txt`, with every line pinned with `==`.
- A small change to `api/main.py`: a dependency-free `GET /livez` route that returns `{"status": "ok"}`, plus **lazy** creation of the Ollama and Chroma clients, so the container can start even when those services are not up yet. (This also removes the cold-start race described in the walkthrough.)
- A pushed image, tagged with a semantic version and the short Git SHA.
- `check_image.sh` passing (provided below).

## Before you start (prerequisites, starter files or data)
- Lessons 07–12 and 30 completed. Docker Desktop running.
- Starter files: copy `api/main.py`, `api/requirements.txt`, and `api/Dockerfile` from the Full Stack Walkthrough lesson into a new folder `rag-api-ship/api/`.
- A Docker Hub account (free) or GHCR access.
- The acceptance script below saved as `rag-api-ship/check_image.sh` and made executable (`chmod +x check_image.sh`).

## Milestones
1. **Baseline.** Build the walkthrough Dockerfile unchanged as `rag-api:baseline`. Record its size (`docker images`) and the three largest layers (`docker history`). Edit one line of `main.py`, rebuild, and record the rebuild time.
2. **Make it start without dependencies.** Move `chromadb.HttpClient(...)`, `get_or_create_collection(...)`, and `ollama.Client(...)` into a function that runs on first use (for example with `functools.lru_cache`), and add `GET /livez`. Run the container with dummy hostnames (`-e CHROMA_HOST=nowhere ...`) and confirm `/livez` answers.
3. **Lock dependencies.** Install in a clean container, `pip freeze` into `requirements.lock.txt`, and install from the lockfile.
4. **Lean and cache-friendly.** Order the Dockerfile least-to-most volatile. Add `.dockerignore`. Add `PYTHONUNBUFFERED=1` and `PYTHONDONTWRITEBYTECODE=1`. If any requirement compiles, convert to a two-stage build so `gcc` is absent from the final image.
5. **Prove it.** Run `./check_image.sh` until every check passes. Compare the size and rebuild time with your baseline.
6. **Tag and push.** `docker tag` the image as `<you>/rag-api:0.1.0` and `<you>/rag-api:<git-sha>`, push both, then `docker rmi` locally and pull it back to confirm the round trip.

## Acceptance criteria
- [ ] The base image is a pinned `python:3.x-slim` tag (never `latest`, never Alpine).
- [ ] The final image is under the size budget (default 600 MB; your instructor may adjust it).
- [ ] After a source-only edit, the `pip install` step is reported as `CACHED`.
- [ ] Every line of `requirements.lock.txt` is pinned with `==`.
- [ ] `.dockerignore` excludes `.env` and `.git`, and no `.env` file exists inside the image.
- [ ] `docker history --no-trunc` and the image's `Config.Env` contain no API keys, tokens, or passwords.
- [ ] No C compiler in the final image.
- [ ] The container starts with configuration passed only via `-e`, and `GET /livez` returns 200.
- [ ] The image is pushed under a semantic version tag *and* a Git SHA tag; `latest`, if present, is only an alias.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `check_image.sh` beside the `api/` folder. It needs only Docker, Bash, and `curl` on the host. Run it with `./check_image.sh`, or override the defaults with `IMAGE=me/rag-api:0.1.0 MAX_MB=500 ./check_image.sh`.

```bash
#!/usr/bin/env bash
# Acceptance checks for DOCKER-AI-101-x01 "Ship the rag-api Image".
set -uo pipefail

CTX="${CTX:-./api}"
IMAGE="${IMAGE:-rag-api:acceptance}"
MAX_MB="${MAX_MB:-600}"
PORT="${PORT:-18000}"
NAME="rag-api-acceptance-$$"
FAILED=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILED=1; }
cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  [ -f "$CTX/main.py.acceptance-bak" ] && mv "$CTX/main.py.acceptance-bak" "$CTX/main.py"
  [ -f "$CTX/.env.acceptance-sentinel" ] && rm -f "$CTX/.env" "$CTX/.env.acceptance-sentinel"
}
trap cleanup EXIT

# 0. Plant a fake secret so we can prove .env never reaches the image.
if [ ! -e "$CTX/.env" ]; then
  echo "OPENAI_API_KEY=sk-acceptance-sentinel" > "$CTX/.env"
  touch "$CTX/.env.acceptance-sentinel"
fi

# 1. Static Dockerfile checks
FROM_LINE=$(grep -Ei '^FROM ' "$CTX/Dockerfile" | tail -1)
if echo "$FROM_LINE" | grep -Eq 'python:3\.[0-9]+(\.[0-9]+)?-slim'; then pass "final stage uses a pinned python:3.x-slim base"
else fail "final stage base is not python:3.x-slim ($FROM_LINE)"; fi
if grep -Eiq '^FROM .*(:latest|alpine)' "$CTX/Dockerfile"; then fail "Dockerfile uses :latest or alpine"; else pass "no :latest or alpine base"; fi

LOCK="$CTX/requirements.lock.txt"
if [ -f "$LOCK" ] && ! grep -Ev '^\s*(#|$|--)' "$LOCK" | grep -vq '=='; then pass "every requirement is pinned with =="
else fail "requirements.lock.txt missing or has unpinned lines"; fi

if [ -f "$CTX/.dockerignore" ] && grep -Eq '^\.env$' "$CTX/.dockerignore" && grep -Eq '^\.git/?$' "$CTX/.dockerignore"; then
  pass ".dockerignore excludes .env and .git"
else fail ".dockerignore must list .env and .git"; fi

# 2. Build
if docker build -q -t "$IMAGE" "$CTX" >/dev/null; then pass "image builds"; else fail "image builds"; exit 1; fi

# 3. Size budget
BYTES=$(docker image inspect "$IMAGE" --format '{{.Size}}')
MB=$((BYTES / 1000 / 1000))
if [ "$MB" -le "$MAX_MB" ]; then pass "image size ${MB} MB <= ${MAX_MB} MB"; else fail "image size ${MB} MB > ${MAX_MB} MB"; fi

# 4. Cache behaviour after a source-only edit
cp "$CTX/main.py" "$CTX/main.py.acceptance-bak"
echo "# cache probe $(date +%s)" >> "$CTX/main.py"
OUT=$(docker build --progress=plain -t "$IMAGE" "$CTX" 2>&1)
mv "$CTX/main.py.acceptance-bak" "$CTX/main.py"
STEP=$(echo "$OUT" | grep -E '^#[0-9]+ \[[^]]*\] RUN .*pip install' | tail -1 | awk '{print $1}')
if [ -n "$STEP" ] && echo "$OUT" | grep -q "^$STEP CACHED"; then pass "pip install layer is CACHED after a code edit"
else fail "pip install layer was rebuilt after a code-only edit (check instruction order)"; fi
docker build -q -t "$IMAGE" "$CTX" >/dev/null   # rebuild from the restored source

# 5. Secrets
HIST=$(docker history --no-trunc --format '{{.CreatedBy}}' "$IMAGE")
ENVS=$(docker image inspect "$IMAGE" --format '{{json .Config.Env}}')
if echo "$HIST $ENVS" | grep -Eiq '(api_key|secret|token|password)=[^ "]+|sk-'; then fail "possible secret baked into image history or ENV"
else pass "no secrets in history or ENV"; fi
if docker run --rm --entrypoint sh "$IMAGE" -c 'test ! -e /app/.env && ! grep -rqs acceptance-sentinel /app'; then pass ".env not copied into the image"
else fail ".env (or its contents) found inside the image"; fi

# 6. No toolchain in the final image
if docker run --rm --entrypoint sh "$IMAGE" -c '! command -v gcc >/dev/null 2>&1 && ! command -v cc >/dev/null 2>&1'; then pass "no C compiler in final image"
else fail "compiler present in final image (use a multi-stage build)"; fi

# 7. Starts with run-time config only, /livez answers
docker run -d --name "$NAME" -p "$PORT:8000" \
  -e OLLAMA_HOST=http://nowhere:11434 -e CHROMA_HOST=nowhere -e CHROMA_PORT=8000 \
  -e LLM_MODEL=placeholder -e EMBED_MODEL=placeholder "$IMAGE" >/dev/null
OK=0
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$PORT/livez" 2>/dev/null | grep -q '"ok"'; then OK=1; break; fi
  sleep 1
done
if [ "$OK" -eq 1 ]; then pass "container starts and GET /livez returns ok"
else fail "GET /livez did not answer within 30s"; docker logs --tail 30 "$NAME"; fi

echo
if [ "$FAILED" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; fi
exit "$FAILED"
```

**Publishing evidence (manual).** Paste the output of the following into `SUBMISSION.md`:

```bash
docker push <you>/rag-api:0.1.0 && docker push <you>/rag-api:$(git rev-parse --short HEAD)
docker rmi <you>/rag-api:0.1.0 && docker pull <you>/rag-api:0.1.0
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Base image choice | Full or Alpine image with no justification | Pinned `python:3.x-slim` | Pinned slim image, plus a written note explaining why it was chosen over full and Alpine for these packages |
| Layer ordering and cache | Source copied before install; every edit reinstalls | `pip install` is `CACHED` after a code edit | Also explains, using the build log, exactly which step is the first cache miss and why |
| Image size | Over budget with no explanation | Under budget | Under budget, with a before/after table from `docker history` showing where the savings came from |
| Secrets and config | Secrets in `ENV` or `.env` copied into the image | No secrets; config via `-e` at run time | Also documents every variable the image reads in a `.env.example` |
| Startup robustness | Crashes when Chroma/Ollama are absent | `/livez` answers without dependencies | Dependency errors are returned as clear 503s from `/ask` instead of crashing the process |
| Tagging and sharing | Only `latest` | Semver plus Git SHA tags, pushed and pulled back | Multi-arch push (`linux/amd64,linux/arm64`) verified with `docker buildx imagetools inspect` |

## Stretch goals
- Publish a multi-architecture image with `docker buildx build --platform linux/amd64,linux/arm64 --push`, and confirm a teammate on the other architecture can run it.
- Swap the full `chromadb` package for a lighter HTTP-only client, if one is available for your Chroma server version. Measure the size difference, and confirm the client and server versions are compatible.
- Add a non-root `USER` to the final stage and confirm the container still starts.

## Reflection prompts
- Which single change gave the biggest size reduction, and how did you find it?
- After this project, how long does a code-only rebuild take compared with the baseline? Why?
- If a teammate pulls `0.1.0` six months from now, what is guaranteed to be identical, and what still depends on their machine (hint: models, volumes, architecture)?

## Instructor notes (common pitfalls, how to adapt for time)
- **Most common failure:** the cache check fails because `COPY . .` comes before `pip install`, or because the learner copies `requirements.txt` but installs from `requirements.lock.txt` (or vice versa).
- **Size budget:** the full `chromadb` package is heavy. 600 MB is a starting budget for a slim base on arm64. Measure a reference solution on your lab hardware and set `MAX_MB` accordingly before you publish the budget to learners.
- The script plants a sentinel `.env` only if none exists and removes it afterwards. It also restores `main.py` after the cache probe, even on failure (`trap`).
- The cache check parses BuildKit's `--progress=plain` output (`#N CACHED`). It requires BuildKit, which is the default in current Docker Desktop.
- **Short on time:** skip milestone 6 (publishing) and grade only `check_image.sh`. **Extra time:** require the multi-arch stretch goal.
