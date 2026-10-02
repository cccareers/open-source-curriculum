---
lesson_id: DOCKER-AI-101-06
course_id: DOCKER-AI-101
pathway: ai-developer
title: The Local AI Developer Workflow
order: 6
kind: lesson
competency_ids:
  - D5-S6-C02
  - D5-S10-C01
objectives:
  - Describe the model-to-container-to-shareable-application workflow for
    local-first AI development
  - Decide when containerizing a local AI project is worth the added complexity
---

## Model, container, application

Local-first AI work has a shape, and it repeats across projects.

**Pick a model.** You choose something that fits your machine — a quantized 7B or 3B model rather than a frontier hosted model — and you get it running with a serving tool such as Ollama. At this stage everything is on your laptop and nothing is shared.

**Wrap it in containers.** The serving process becomes one container, your application code becomes another, and any supporting service such as a vector database becomes a third. Model weights and indexes move into volumes so they survive restarts. What used to be a page of setup instructions becomes a file.

**Share the application.** The Compose file and the Dockerfiles go into your repository. A teammate clones it, runs one command, and gets the same stack — same model, same library versions, same ports. The unit you hand over stops being "my code plus a wiki page" and becomes "the environment".

## Local or hosted?

Containerizing does not decide where inference happens; it just makes either choice portable. The tradeoffs are worth stating plainly.

Running locally gives you **privacy** — no prompt or document leaves the machine, which can be decisive for regulated or confidential data. It gives **zero marginal cost**: after the download, a million tokens cost electricity. It gives **offline capability** and freedom from rate limits, and it gives **control**, since the model version cannot change under you.

A hosted API gives you **capability** that no laptop can match, **no local memory pressure**, and **elastic throughput** for many concurrent users. It costs money per token, sends your data to a third party, and depends on the network.

Most real projects mix the two: local models for development loops, bulk processing, and sensitive data; hosted models for the hardest reasoning steps or for production scale. Because both are reached over an HTTP API, a containerized application can switch between them by changing an environment variable.

## Is containerizing worth it here?

Containers cost you build time, disk space, and a layer of indirection when debugging. Weigh that honestly.

**Worth it when** more than one service is involved, when a teammate or a grader has to reproduce your setup, when the dependencies are heavy or compiled, when you need several projects with conflicting versions, or when the work will eventually be deployed.

**Probably not worth it when** you are writing a one-file script against a hosted API with two pure-Python dependencies, when you are exploring in a notebook that you will throw away, or when you are the only person who will ever run it and a virtual environment already works.

A useful rule: containerize at the moment you would otherwise start writing setup instructions for another human being.

## Practice

1. Take one AI project idea of your own and write down which of the three workflow stages it is currently at: model, container, or shareable application.
2. Decide whether it should call a local or hosted model. Justify the choice in two sentences using privacy, cost, latency, and capability.
3. Apply the "worth it" test above and write a one-paragraph verdict on whether to containerize it now, later, or not at all.
