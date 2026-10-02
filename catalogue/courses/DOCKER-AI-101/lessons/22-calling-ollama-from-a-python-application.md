---
lesson_id: DOCKER-AI-101-22
course_id: DOCKER-AI-101
pathway: ai-developer
title: Calling Ollama from a Python Application
order: 22
kind: lesson
competency_ids:
  - D5-S10-C02
objectives:
  - Serve a local LLM with the official Ollama Docker image and call it from a
    Python application
  - Use the ollama Python library and OpenAI-compatible endpoints against a
    containerized server
---

## The ollama Python library

With the container running and a model pulled, an application is a few lines.

```bash
pip install ollama
```

```python
import ollama

client = ollama.Client(host="http://localhost:11434")

response = client.chat(
    model="llama3.2",
    messages=[
        {"role": "system", "content": "Answer in one short paragraph."},
        {"role": "user", "content": "What is a vector database for?"},
    ],
)

print(response["message"]["content"])
```

`host` is the important argument. The default is `http://localhost:11434`, which is correct when your script runs on the host and Ollama's port is published. When your script runs inside another container, `localhost` means *that* container — you would use the Ollama service's name instead, which is the subject of the networking lesson.

Streaming is a flag, and the response becomes an iterator:

```python
for chunk in client.chat(model="llama3.2", messages=messages, stream=True):
    print(chunk["message"]["content"], end="", flush=True)
```

Embeddings come from the same server, which is what a retrieval application needs:

```python
vec = client.embeddings(model="nomic-embed-text", prompt="containerized inference")
print(len(vec["embedding"]))
```

Pull that model first with `docker exec ollama ollama pull nomic-embed-text`.

## The OpenAI-compatible endpoint

Ollama also serves an OpenAI-shaped API at `/v1`, so code written against the OpenAI SDK works against your local server with two changed arguments:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # required by the client, ignored by Ollama
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Summarize what a container is."}],
)

print(response.choices[0].message.content)
```

This is the practical route to the local-or-hosted switch discussed earlier. Put `base_url` and `model` in environment variables and the same code runs against Ollama in development and a hosted provider in production, with no code change:

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["LLM_BASE_URL"],
    api_key=os.environ["LLM_API_KEY"],
)
model = os.environ["LLM_MODEL"]
```

Not every hosted feature exists on both sides — tool calling and structured output support vary by model — so verify the specific features you rely on rather than assuming full parity.

## Practical notes

Expect the first call after a pull to take several seconds while the model loads; keep a generous timeout. A `ConnectionError` almost always means the container is down or the port is not published, so re-run the `curl` health check from the earlier lesson before debugging Python. And a model name that is not pulled returns a clear error naming the model — pull it and retry.

## Practice

1. With the Ollama container running, install the `ollama` library and run the chat example above.
2. Convert it to streaming and print tokens as they arrive.
3. Rewrite the same call using the OpenAI SDK against `http://localhost:11434/v1`.
4. Move `base_url`, `api_key`, and `model` into environment variables read with `os.environ`, and run the script twice with different model values to prove the switch works.
