---
lesson_id: DOCKER-AI-101-29
course_id: DOCKER-AI-101
pathway: ai-developer
title: Full Stack Walkthrough
order: 29
kind: lesson
competency_ids:
  - D5-S6-C02
  - D5-S10-C02
objectives:
  - Define and operate a multi-service AI stack (LLM, vector store, API/UI) with
    Docker Compose
  - Assemble Ollama, ChromaDB, and a FastAPI or Streamlit front end into one
    working compose.yaml
---

## The stack

Three services, one file: Ollama serving a local model, ChromaDB storing embeddings, and a FastAPI application that answers questions using both.

```text
rag-stack/
├── compose.yaml
├── .env
├── .env.example
└── api/
    ├── Dockerfile
    ├── requirements.txt
    └── main.py
```

## compose.yaml

```yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-models:/root/.ollama
    restart: unless-stopped

  chroma:
    image: chromadb/chroma:0.5.23
    ports:
      - "8001:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      IS_PERSISTENT: "TRUE"
      ANONYMIZED_TELEMETRY: "FALSE"
    restart: unless-stopped

  api:
    build: ./api
    ports:
      - "8000:8000"
    volumes:
      - ./api:/app
    environment:
      OLLAMA_HOST: http://ollama:11434
      CHROMA_HOST: chroma
      CHROMA_PORT: "8000"
      LLM_MODEL: ${LLM_MODEL:-llama3.2}
      EMBED_MODEL: ${EMBED_MODEL:-nomic-embed-text}
    depends_on:
      - ollama
      - chroma

volumes:
  ollama-models:
  chroma-data:
```

Every piece is something you have already met. Named volumes keep the model cache and the vector index across restarts. Ports are published only where the host needs access — the API for your browser, Ollama and Chroma for inspection. The bind mount on `./api` lets you edit code without rebuilding. Service names become hostnames, and Chroma is reached on its **container** port 8000 even though the host sees it on 8001.

## api/Dockerfile

```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

Requirements are copied before the source so a code edit does not reinstall dependencies, and uvicorn binds `0.0.0.0` so the published port reaches it.

```text
fastapi==0.115.0
uvicorn==0.30.6
ollama==0.3.3
chromadb==0.5.23
```

## api/main.py

```python
import os
import chromadb
import ollama
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

llm = ollama.Client(host=os.environ["OLLAMA_HOST"])
chroma = chromadb.HttpClient(
    host=os.environ["CHROMA_HOST"],
    port=int(os.environ["CHROMA_PORT"]),
)
collection = chroma.get_or_create_collection("docs")

MODEL = os.environ["LLM_MODEL"]
EMBED = os.environ["EMBED_MODEL"]


def embed(text: str) -> list[float]:
    return llm.embeddings(model=EMBED, prompt=text)["embedding"]


class Doc(BaseModel):
    id: str
    text: str


class Question(BaseModel):
    question: str


@app.get("/health")
def health():
    return {"ollama": os.environ["OLLAMA_HOST"], "docs": collection.count()}


@app.post("/documents")
def add_document(doc: Doc):
    collection.add(ids=[doc.id], documents=[doc.text], embeddings=[embed(doc.text)])
    return {"stored": doc.id}


@app.post("/ask")
def ask(q: Question):
    hits = collection.query(query_embeddings=[embed(q.question)], n_results=3)
    context = "\n\n".join(hits["documents"][0])
    reply = llm.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"Answer using only this context:\n{context}"},
            {"role": "user", "content": q.question},
        ],
    )
    return {"answer": reply["message"]["content"], "sources": hits["ids"][0]}
```

## Operating it

```bash
docker compose up --build -d
docker compose exec ollama ollama pull llama3.2
docker compose exec ollama ollama pull nomic-embed-text
docker compose logs -f api
```

If `api` exits on the very first `up` with a connection error to `chroma` or `ollama`, you have hit the startup race from the logs lesson: `main.py` connects to Chroma when the module loads, and the short `depends_on` form waits only for the container to *start*. `docker compose up -d` again usually succeeds because the other services are now ready. The durable fixes are the ones from that lesson: a `healthcheck` with `condition: service_healthy`, retry logic around the first connection. `restart: on-failure` alone is insufficient here: uvicorn runs with `--reload`, so its supervisor can stay alive when the application subprocess fails to import; no container exit means no restart.

Pulling models is a one-time step: the weights land in the `ollama-models` volume and survive every later `down` and `up`.

Then exercise it:

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/documents \
  -H "Content-Type: application/json" \
  -d '{"id":"d1","text":"Named volumes let Docker data survive container removal."}'

curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"How is data kept between container restarts?"}'
```

Shut it down with `docker compose down`. The containers and network go; the model cache and the indexed documents stay, because both live on named volumes.

## Practice

1. Build the stack exactly as written and get `/health` responding.
2. Pull both models, add three documents, and ask a question whose answer is only in one of them.
3. Run `docker compose down`, then `up -d`, and confirm via `/health` that the document count survived.
4. Swap `LLM_MODEL` in `.env` to a different pulled model, restart the `api` service, and compare the answers.
