---
lesson_id: de210-01
course_id: de210
pathway: data-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

So far you have written jobs and run them yourself. You opened a notebook, pointed a script at a source, watched the output land, and moved on. That works exactly once. The moment someone downstream depends on that output arriving every morning, correct and on time, the job stops being a script and becomes a service — one that has to survive a source going down at 3 a.m., a schema changing without warning, a partial write, a rerun of last Tuesday, and a colleague who needs to know where a number came from.

This course is about that transition. You will learn what an orchestrator actually promises that a scheduled shell command cannot, then build real automated pipelines: DAGs that express dependencies and recover from failure, ingestion tasks that pull from APIs, file drops, and source databases on a schedule without duplicating data, layered transformation models that are tested and documented, and validation gates that stop bad records before a consumer ever sees them. You will instrument what you build so that a failure or a late arrival announces itself, and you will practise the diagnosis loop that turns a red run into a fixed one.

The last stretch of the course widens the picture. You will trigger work from cloud events rather than a fixed clock, package pipeline steps so they run the same way on your laptop and in production, and finish by publishing lineage and documentation that lets someone else trace a single column in a dashboard all the way back to the row and the run that produced it. Everything is hands-on: each lesson ends with exercises you run against a real pipeline you keep extending.

## Objectives

- Describe what an orchestrator guarantees that a cron job does not
- Build an Airflow DAG with dependencies, retries, and idempotent tasks
- Automate scheduled ingestion from an API, a file drop, and a source database
- Implement layered dbt models with tests and documentation
- Add validation gates that stop bad data before it reaches a consumer
- Instrument a pipeline so that a failed or late run is detected and diagnosed quickly
- Trigger pipeline work from cloud events instead of a fixed schedule
- Publish lineage and documentation that lets a consumer trace a column back to its source

## Prerequisite Knowledge

- Big Data Processing with Spark & Hadoop (de201), or equivalent batch-processing experience
- Working SQL and Python, and comfort with Git-based workflows

## Course Content

1. Course Overview
2. Pipeline Architecture and Orchestration Concepts
3. Building DAGs with Apache Airflow
4. Automating Ingestion
5. Transformations with dbt
6. Validation and Testing in Pipelines
7. Monitoring, Alerting, and Debugging Runs
8. Cloud-Native and Event-Driven Pipelines
9. Lineage, Auditing, and Documentation
