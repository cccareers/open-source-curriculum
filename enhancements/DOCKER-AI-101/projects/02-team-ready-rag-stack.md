---
course_id: DOCKER-AI-101
project_id: DOCKER-AI-101-x02
title: "Team-Ready Local RAG Stack"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: stretch
related_lessons:
  - DOCKER-AI-101-24
  - DOCKER-AI-101-25
  - DOCKER-AI-101-26
  - DOCKER-AI-101-27
  - DOCKER-AI-101-28
  - DOCKER-AI-101-29
  - DOCKER-AI-101-31
objectives:
  - Define and operate a multi-service AI stack (LLM, vector store, API/UI) with Docker Compose
  - Commit compose.yaml and document volume setup so a teammate can reproduce the stack
  - Manage API keys and configuration with environment variables and .env files instead of hardcoding
  - Diagnose a failing service by following its logs during startup
  - Apply image-size, config, and sharing best practices that keep an AI Docker workflow reproducible for a team
competency_ids:
  - D5-S6-C01
  - D5-S6-C02
  - D5-S10-C02
  - D5-S5-C01
  - D5-S7-C01
  - D5-S8-C02
  - D5-S9-C01
---

## Scenario
The `rag-stack` from the Full Stack Walkthrough works on your laptop. Last week a new teammate cloned it and lost a morning: the API crashed on first start because Chroma was not ready, `ollama/ollama` pulled a different version than yours, nobody told them to pull two models (about 3 GB), and they nearly committed their real `.env`. Your task is to make the stack **team-ready**. A colleague with only Docker Desktop and your repository should go from `git clone` to a correct answer from `/ask` by following a short runbook, with no messages to you.

## What you will build / produce
A `rag-stack/` repository containing:
- `compose.yaml` with every image tag pinned, named volumes declared, `ollama` and `chroma` health checks, and `api` depending on both with `condition: service_healthy`.
- `.env.example` documenting every `${VAR}` that `compose.yaml` reads, with no real secrets. `.env` is ignored in both `.gitignore` and `.dockerignore`.
- `scripts/setup.sh` (executable), which brings the stack up and pulls the models named in `.env`, so the documented steps cannot drift from the real ones.
- `README.md` with the five-step runbook from the Sharing lesson, including volume names and the approximate download size.
- `STARTUP-DIAGNOSIS.md`: a log excerpt from a deliberately broken startup, plus your one-paragraph root cause (see milestone 4).
- `tests/` containing the acceptance suite below, all passing.

## Before you start (prerequisites, starter files or data)
- Lessons 23–31 completed. You should have Docker Desktop with at least 8 GB of memory allocated.
- Starter: the lesson 29 files (`compose.yaml`, `api/Dockerfile`, `api/requirements.txt`, `api/main.py`).
- Python 3.8+ on the host, with `pip install pytest` (the tests use only the standard library otherwise).
- About 3 GB of free disk space for `llama3.2` and `nomic-embed-text`.

## Milestones
1. **Pin and declare.** Pin `ollama/ollama` and `chromadb/chroma` to explicit tags (keep Chroma's server and Python client on matching versions). Run `docker compose config` and fix every warning.
2. **Health-gate startup.** Add a `healthcheck` to `ollama` (for example `ollama list`) and to `chroma`. The Chroma image does not necessarily include `curl`, so find out what *is* available with `docker compose exec chroma sh -c 'command -v curl python python3'` and write the check with that. Switch `api.depends_on` to the long form with `condition: service_healthy`. Then run `docker compose down && docker compose up -d` five times; `api` must never exit.
3. **Config and secrets.** Move `LLM_MODEL` and `EMBED_MODEL` into `.env` with `${VAR:-default}` fallbacks. Add an optional `OPENAI_API_KEY` passthrough for a future hosted fallback. Write `.env.example`, and update `.gitignore` and `.dockerignore`.
4. **Break it on purpose, then diagnose.** Temporarily change `CHROMA_PORT` to `"8001"` (the *host* port), run `docker compose up -d`, and use `docker compose ps` and `docker compose logs --tail 50 api` to find the cause. Save the relevant log lines and your root-cause paragraph in `STARTUP-DIAGNOSIS.md`, then revert.
5. **Executable runbook.** Write `scripts/setup.sh`: `cp -n .env.example .env`, then `docker compose up -d --build --wait`, then `docker compose exec ollama ollama pull` for each model named in `.env`. Write the README runbook around it.
6. **Clean-room test.** Run `docker compose down --volumes`, delete `.env`, follow your own README from step 1, and run the full test suite. Better still, ask a classmate to do it on their machine and record what tripped them up.

## Acceptance criteria
- [ ] No service uses an untagged or `:latest` image.
- [ ] `ollama` and `chroma` define health checks, and `api` waits on `service_healthy` for both.
- [ ] Every named volume is declared, and the model cache and the vector index are on named volumes.
- [ ] `compose.yaml` contains no literal secret values; every `${VAR}` it references is listed in `.env.example`.
- [ ] `.env` is ignored by both Git and the Docker build context.
- [ ] `scripts/setup.sh` exists, is executable, and pulls the models.
- [ ] Live: `/health` responds, a stored document is retrieved as a source by `/ask`, and both the document count and the pulled models survive `docker compose down` followed by `docker compose up`.
- [ ] `STARTUP-DIAGNOSIS.md` quotes real log lines and names the cause as "the host-published port was used for container-to-container traffic" (or equivalent).

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_stack.py` and run it from the `rag-stack/` root.

- **Static checks only** (seconds; no models needed): `pytest tests -m "not live"`
- **Everything:** with the stack up and the models pulled, run `LIVE=1 pytest tests`
- **Including the down/up persistence test:** `LIVE=1 DESTRUCTIVE_OK=1 pytest tests`. This runs `docker compose down` and then `up` (without `--volumes`).

```python
# tests/test_stack.py — acceptance suite for DOCKER-AI-101-x02 "Team-Ready Local RAG Stack"
from __future__ import annotations

import json
import os
import re
import stat
import subprocess
import time
import urllib.request
import uuid
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
COMPOSE = ROOT / "compose.yaml"
API = os.environ.get("API_URL", "http://localhost:8000")
LIVE = os.environ.get("LIVE") == "1"

live = pytest.mark.skipif(not LIVE, reason="set LIVE=1 with the stack running")


def resolved_config() -> dict:
    out = subprocess.run(
        ["docker", "compose", "config", "--format", "json"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def http(method: str, path: str, body: dict | None = None, timeout: int = 180) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


# ---------- static checks ----------

def test_images_are_pinned():
    for name, svc in resolved_config()["services"].items():
        if "image" not in svc or "build" in svc:
            continue  # built locally; its base image is checked in project x01
        image = svc["image"]
        tag = image.rsplit(":", 1)[1] if ":" in image.split("/")[-1] else None
        assert tag and tag != "latest", f"service {name} uses an unpinned image: {image}"


def test_dependencies_are_health_gated():
    services = resolved_config()["services"]
    for dep in ("ollama", "chroma"):
        assert "healthcheck" in services[dep], f"{dep} has no healthcheck"
        cond = services["api"].get("depends_on", {}).get(dep, {}).get("condition")
        assert cond == "service_healthy", f"api must wait for {dep} with condition: service_healthy"


# Where each service keeps its state. Adjust the Chroma path if you pin a
# Chroma release that stores data elsewhere (check the image's docs).
STATE_DIRS = {"ollama": "/root/.ollama", "chroma": "/chroma/chroma"}


def test_state_lives_on_named_volumes():
    cfg = resolved_config()
    declared = set(cfg.get("volumes", {}))
    for svc, target in STATE_DIRS.items():
        named = [v for v in cfg["services"][svc].get("volumes", []) if v.get("type") == "volume"]
        assert any(v.get("target") == target for v in named), \
            f"{svc} must mount a named volume at {target}"
        for v in named:
            assert v["source"] in declared, f"volume {v['source']} is not declared at top level"


def test_no_literal_secrets_and_env_example_complete():
    text = COMPOSE.read_text()
    for line in text.splitlines():
        if re.search(r"(KEY|TOKEN|SECRET|PASSWORD)\s*[:=]", line, re.I):
            assert "${" in line, f"secret-looking value is hardcoded: {line.strip()}"
    referenced = set(re.findall(r"\$\{([A-Z0-9_]+)", text))
    example = (ROOT / ".env.example").read_text()
    documented = set(re.findall(r"^([A-Z0-9_]+)=", example, re.M))
    missing = referenced - documented
    assert not missing, f".env.example is missing: {sorted(missing)}"
    assert not re.search(r"sk-[A-Za-z0-9]{10,}", example), ".env.example contains what looks like a real key"


def test_env_is_ignored_everywhere():
    for ignore in (ROOT / ".gitignore", ROOT / "api" / ".dockerignore"):
        assert ignore.exists(), f"missing {ignore.relative_to(ROOT)}"
        text = ignore.read_text()
        assert re.search(r"^\.env$", text, re.M), f"{ignore.relative_to(ROOT)} must ignore .env"
        assert not re.search(r"^!(\*\*/)?/?\.env\s*$", text, re.M), \
            f"{ignore.relative_to(ROOT)} has a ! rule that re-includes .env"
    # Ask Git for the effective result after every ignore rule is applied.
    result = subprocess.run(["git", "check-ignore", "-q", ".env"], cwd=ROOT)
    assert result.returncode == 0, "git does not ignore .env (or rag-stack is not a git repository)"


def test_setup_script_is_executable_and_pulls_models():
    script = ROOT / "scripts" / "setup.sh"
    assert script.exists(), "scripts/setup.sh is missing"
    assert script.stat().st_mode & stat.S_IXUSR, "scripts/setup.sh is not executable"
    assert "ollama pull" in script.read_text(), "setup.sh must pull the models"


# ---------- live checks ----------

def ollama_models() -> set[str]:
    out = subprocess.run(["docker", "compose", "exec", "-T", "ollama", "ollama", "list"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return {line.split()[0] for line in out.splitlines()[1:] if line.strip()}


@live
@pytest.mark.live
def test_health_endpoint():
    body = http("GET", "/health")
    assert "docs" in body


@live
@pytest.mark.live
def test_store_then_ask_returns_source():
    doc_id = f"accept-{uuid.uuid4().hex[:8]}"
    http("POST", "/documents", {"id": doc_id,
         "text": "The Acme badge office is on floor 7 and opens at 08:30."})
    answer = http("POST", "/ask", {"question": "What floor is the Acme badge office on?"})
    assert doc_id in answer["sources"], f"stored doc not retrieved: {answer}"
    assert answer["answer"].strip(), "empty answer from the model"


@live
@pytest.mark.live
@pytest.mark.skipif(os.environ.get("DESTRUCTIVE_OK") != "1", reason="set DESTRUCTIVE_OK=1 to run down/up")
def test_documents_and_models_survive_down_up():
    before = http("GET", "/health")["docs"]
    assert before > 0, "add at least one document first"
    models_before = ollama_models()
    assert models_before, "pull the models first"
    subprocess.run(["docker", "compose", "down"], cwd=ROOT, check=True)
    subprocess.run(["docker", "compose", "up", "-d", "--wait"], cwd=ROOT, check=True)
    assert ollama_models() >= models_before, "the Ollama model cache did not survive down/up"
    for _ in range(60):
        try:
            assert http("GET", "/health")["docs"] == before
            return
        except (OSError, ValueError):
            time.sleep(2)
    pytest.fail("API did not come back after down/up")
```

Register the marker so pytest does not warn. Add `tests/pytest.ini` (or merge into an existing config):

```ini
[pytest]
markers =
    live: needs the running stack
```

**Evidence checklist (manual):**
- [ ] `STARTUP-DIAGNOSIS.md` with real log lines.
- [ ] A screenshot or a pasted terminal transcript of the clean-room run (milestone 6).
- [ ] If a classmate ran it: their notes, plus the commit that fixed what tripped them up.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Compose definition | Runs, but uses unpinned images or undeclared volumes | Static tests pass | Also isolates Chroma from the host (no published port) and explains in the README why that is safe |
| Startup reliability | `api` sometimes exits on the first `up` | Health-gated; five cold starts in a row succeed | Also adds application-level retry with backoff, and explains why both layers of protection are useful |
| Config and secrets | Values hardcoded or `.env` committed | `.env.example` complete; `.env` ignored everywhere | Required variables fail fast at startup with a clear message naming the missing variable |
| Diagnosis | Fix found by trial and error | Log lines quoted, with the correct root cause | Also lists the commands run in order and what each one ruled out |
| Reproducibility | Runbook missing steps | The clean-room run succeeds | A classmate's clean-room run succeeds, and the fixes they triggered are documented |

## Stretch goals
- Add a Streamlit UI as a fourth service that calls `api` by service name. Publish only the UI and the API.
- Add a `profiles: [native]` variant that points `OLLAMA_HOST` at `http://host.docker.internal:11434`. Compare the response latency of native and containerized Ollama on your machine.
- Add a GitHub Actions job that runs only the static tests on every pull request.

## Reflection prompts
- Which failure from the scenario would your teammate still hit if you had done only milestone 1? Only milestone 2?
- Why does `depends_on` with `service_healthy` not remove the need for retry logic in the application?
- Your Compose file is now part of code review. Which three kinds of changes to it deserve an explicit sentence in a pull request description?

## Instructor notes (common pitfalls, how to adapt for time)
- **Chroma health check:** the tools available inside the Chroma image vary between versions, which is why milestone 2 asks learners to inspect the image instead of copying a command. Expect learners to try `curl` first. Reward the inspection habit.
- **`docker compose config --format json`** needs a reasonably recent Compose v2. If it is unavailable on a lab machine, have learners update Docker Desktop rather than rewriting the tests.
- **`docker compose up --wait`** (used in `setup.sh` and the persistence test) blocks until the health checks pass. If a learner's health check never passes, `--wait` will time out, and that failure is itself a good teaching moment.
- **The first `/ask` is slow** while models load. The test helper allows 180 seconds.
- **Short on time:** drop milestone 6's classmate run and the destructive test. **Low-memory machines (8 GB):** use `llama3.2:1b` via `.env`. No test depends on the specific model.
