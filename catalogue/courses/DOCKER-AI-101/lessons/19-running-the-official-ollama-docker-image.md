---
lesson_id: DOCKER-AI-101-19
course_id: DOCKER-AI-101
pathway: ai-developer
title: Running the Official Ollama Docker Image
order: 19
kind: lesson
competency_ids:
  - D5-S10-C02
  - D5-S6-C01
objectives:
  - Start the official Ollama Docker image, pull a model, and call its REST API
  - Verify the server is healthy from the host before wiring an application to it
---

## Start the server

The official image is `ollama/ollama` on Docker Hub. One command runs it:

```bash
docker run -d --name ollama \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  ollama/ollama
```

Every flag is doing work you have already met. `-d` detaches so the server keeps running. `--name ollama` gives you a handle for later commands. `-v ollama:/root/.ollama` puts the model cache on a named volume — the next lesson explains why that is not optional. `-p 11434:11434` publishes Ollama's port to your host so applications outside the container can reach it.

The image starts `ollama serve` by default. Nothing else needs configuring.

## Pull a model

The server starts empty. Pull a model into it with `docker exec`:

```bash
docker exec ollama ollama pull llama3.2
```

`llama3.2` is a 3B model at roughly 2 GB, which is a sensible first choice on a laptop. This downloads once into the volume. Confirm what is available:

```bash
docker exec ollama ollama list
```

## Verify from the host before you write any code

This is the step people skip and then spend an hour debugging their Python client. Check the server itself first.

```bash
curl http://localhost:11434
```

A healthy server replies `Ollama is running`. If you get connection refused, the container is not up or the port is not published — check `docker ps` and `docker logs ollama`.

Then confirm the model responds:

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Name three uses for a vector database.",
  "stream": false
}'
```

The response is JSON with a `response` field holding the generated text. Setting `"stream": false` makes it a single object; the default streams newline-delimited JSON chunks, which is what you want in an application but awkward to read in a terminal.

The chat endpoint takes a message list, and this is the one most applications use:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Explain quantization in two sentences."}],
  "stream": false
}'
```

Expect the first request after a pull to be slow — the model is being loaded into memory. Subsequent requests are faster until Ollama unloads an idle model.

There is also an OpenAI-compatible surface at `http://localhost:11434/v1`, which matters when you want to point an existing OpenAI client at your local server. The next lessons use it.

## The order that saves you time

Server up, model pulled, `curl` succeeds, *then* write the application. Each step has its own failure mode and its own diagnostic, and mixing them makes all three harder to see.

## Practice

1. Run the `docker run` command above and confirm the container is up with `docker ps`.
2. Pull `llama3.2` and list the models with `docker exec ollama ollama list`.
3. Verify health with `curl http://localhost:11434`, then send a real prompt to `/api/generate` with `"stream": false` and read the JSON.
4. Send the same prompt to `/api/chat` and compare the response shape.
5. Remove the `-p` flag, restart the container, and confirm `curl` now fails. Explain why in one sentence.
