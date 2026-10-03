---
course_id: DOCKER-AI-101
media_id: DOCKER-AI-101-v01
type: video-script
title: "localhost Is Not Who You Think"
format: screencast
target_runtime: "7 min"
related_lessons:
  - DOCKER-AI-101-16
  - DOCKER-AI-101-26
objectives:
  - Diagnose the common failure of a service listening inside the container but unreachable from the host
  - Explain how Compose services reach each other by service name on a shared network
  - Configure an application container to talk to Ollama or a vector database by hostname
competency_ids:
  - D5-S6-C01
---

## Purpose
After watching, the learner can tell the two directions of container networking apart and fix each one on the first try. Host to container needs a published port and a `0.0.0.0` bind. Container to container needs the service name and the *container* port.

## Audience and prerequisites
Learners who have finished lessons 13–16 and 23–25. They can run `docker run` with `-p` and bring up a Compose stack. Screen setup: a terminal on the left and a browser on the right, at a font size of 18pt or larger.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open. Browser shows `localhost:8000` with "This site can't be reached". The terminal shows `docker ps` with `rag-api` **Up 12 seconds**. | "The container is up. Docker says so. And your browser says nothing is there. If you've been here, this video is for you. There are exactly two directions traffic can flow with containers, and the word 'localhost' means something different in each one." |
| 0:20 | Title card: "localhost Is Not Who You Think". A simple diagram: a Mac rectangle containing a container rectangle, each with its own "localhost" label. | "Here's the idea for the whole video. Every container has its own network, with its own localhost. Your Mac has a different one. Most networking bugs come from forgetting which one you're standing in." |
| 0:40 | Terminal: `cat api/Dockerfile`. Highlight the `CMD` line with `--host 127.0.0.1`. | "Direction one: from your Mac into a container. Here's our rag-api Dockerfile, and here's the bug. Uvicorn is bound to 127.0.0.1. That's loopback, but whose loopback? The container's." |
| 1:00 | Type: `docker ps --format 'table {{.Names}}\t{{.Ports}}'`. Output: `rag-api   0.0.0.0:8000->8000/tcp`. | "The port is published: host 8000 forwards to container 8000. So traffic does arrive inside the container. It arrives on the container's network interface, not on its loopback, and nothing is listening there." |
| 1:25 | Type: `docker exec rag-api python -c "import urllib.request as u; print(u.urlopen('http://127.0.0.1:8000/livez').read())"`. Output: `b'{"status":"ok"}'`. | "Proof. From *inside* the container, localhost works fine. The server is healthy. It's just facing the wrong way. One note: I'm using Python here instead of curl, because the slim Python image doesn't include curl." |
| 1:50 | Edit the Dockerfile `CMD` to `--host 0.0.0.0`. Type: `docker build -t rag-api:dev . && docker rm -f rag-api && docker run -d --name rag-api -p 8000:8000 rag-api:dev`. Refresh the browser: JSON appears. | "Bind to 0.0.0.0, meaning 'every interface in this container'. Rebuild, recreate, refresh. There it is. Rule one: a server in a container must listen on 0.0.0.0, and the port must be published with -p." |
| 2:20 | On-screen checklist builds line by line: 1. Bound to 0.0.0.0? 2. PORTS shows `->`? 3. Numbers line up? 4. Process alive (`docker logs`)? 5. Host port free? | "When host-to-container fails, walk this list in order. Bind address. Published, so look for the arrow in the PORTS column. Matching numbers. A live process. A free host port. Five checks, under a minute." |
| 2:50 | Section card: "Direction two: container to container". Terminal: `cat compose.yaml` showing ollama, chroma (`8001:8000`), and api with `OLLAMA_HOST: http://localhost:11434`. | "Direction two is the one that catches people in Compose. Our api needs to call Ollama. Somebody wrote OLLAMA_HOST as localhost 11434. That works when you run the script on your Mac. Watch what happens in the stack." |
| 3:15 | `docker compose up -d`, then `docker compose logs --tail 5 api`. The log shows `ConnectError: [Errno 111] Connection refused` for `localhost:11434`. | "Connection refused. Inside the api container, localhost is the api container. Ollama isn't in there. It's next door." |
| 3:35 | Type: `docker compose exec api getent hosts ollama`. Output: `172.18.0.3   ollama`. | "Compose gives every project a private network with built-in DNS. Every service name is a hostname on that network. Ask the container to resolve 'ollama' and it gets an IP address straight back." |
| 3:55 | Edit compose.yaml to `OLLAMA_HOST: http://ollama:11434`. `docker compose up -d`. Logs are clean. | "So the fix is the service name. Change one line, run up again, and Compose recreates the api with its new environment. Clean logs." |
| 4:15 | Highlight Chroma's `ports: "8001:8000"` and the api's `CHROMA_PORT: "8001"`. | "Now the subtler one. Chroma is published to the host on 8001. Someone set the api's CHROMA_PORT to 8001 as well, because that's the number they use from the browser." |
| 4:35 | Logs: connection refused on `chroma:8001`. Animate an arrow from api to chroma that bypasses the `8001→8000` mapping box entirely. | "Refused again. Port publishing is a door between your Mac and a container. Container-to-container traffic never goes through that door. It travels straight across the project network to the port Chroma actually listens on, which is 8000." |
| 5:00 | Edit to `CHROMA_PORT: "8000"`. Up. Then delete Chroma's `ports:` block entirely and run up again. The api still works. | "Use the container port. And here's the payoff: if only other services need Chroma, you don't have to publish it at all. Fewer open ports, same behavior." |
| 5:30 | Split-screen summary table. Left column, "From your Mac": `localhost:<published host port>`; needs `-p`; needs `0.0.0.0`. Right column, "From another container": `<service-name>:<container port>`; publishing is irrelevant; needs `0.0.0.0`. | "Two directions, two rules. From your Mac: localhost and the published host port. From another container: the service name and the container port. Both need the server bound to 0.0.0.0." |
| 6:00 | Bonus. `OLLAMA_HOST: http://host.docker.internal:11434`, with a Mac icon showing natively installed Ollama. | "One bonus direction: a container calling something running natively on your Mac, like an Ollama install with GPU access. Docker Desktop gives you a special name for the host, host.docker.internal. That's a one-line switch between containerized and native Ollama." |
| 6:30 | Closing card: "localhost = the container you're standing in." | "If you remember one sentence, make it this one: localhost means the container you're standing in. Ask 'where am I standing?' before you type a URL, and most networking bugs disappear." |

## On-screen assets and B-roll
- The `rag-stack` repository from lesson 29, plus a pre-broken branch (`video-01-broken`) containing the three planted faults: the `127.0.0.1` bind, `localhost` in `OLLAMA_HOST`, and `CHROMA_PORT: "8001"`.
- Add a `/livez` route to `main.py` for the demo, matching project x01.
- Two diagrams in the same visual language as animation a02: the Mac box with a nested container box, and the project network with three service boxes.
- Summary table graphic (00:05:30) exported as a PNG for the lesson page.

## Accessibility
- Burned-in captions plus an SRT file. Read every command aloud as it is typed, for example "docker ps, format table names and ports".
- Never signal state by color alone. Every error frame has the words "Connection refused" visible and read aloud, and the arrows in diagrams are labeled "host → container" and "container → container".
- Terminal at 18pt or larger in a high-contrast theme. Keep the cursor and typed text on screen for at least 2 seconds before running a command.
- The audio description track describes the diagram arrows and which box each arrow passes through.
- All demos are run from the keyboard. No mouse-only interactions.

## Check for understanding
1. Your FastAPI container is `Up`, `docker ps` shows `0.0.0.0:8000->8000/tcp`, but the browser can't connect. What is the most likely cause? *Answer: the server is bound to `127.0.0.1` inside the container. Bind to `0.0.0.0`.*
2. In Compose, `vector` is published as `"9001:8000"`. What URL should the `api` service use? *Answer: `http://vector:8000`, the service name and the container port.*
3. True or false: a service that only other containers call must still be published with `ports:`. *Answer: false. Publishing only matters for traffic from the host.*
