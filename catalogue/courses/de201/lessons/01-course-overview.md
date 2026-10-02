---
lesson_id: de201-01
course_id: de201
pathway: data-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Up to now you have worked with data that fits on one machine. A database on a laptop, a query planner you can reason about, a table you can scan end to end while you wait. This course is about what changes when the dataset no longer fits, when reading it once takes an hour, and when the only way forward is to split the work across many machines that fail independently and talk to each other over a network.

You will learn the two halves of that story together. The storage half explains how a large file is chopped into blocks, spread across a cluster, and replicated so a dead disk does not cost you data. The compute half explains how an engine turns your code into thousands of small tasks, why moving data between machines is the expensive part, and how to write jobs that move as little of it as possible. Spark is the engine you will actually type against, with PySpark as the API; Hadoop's file system and resource manager give you the ground the engine stands on.

By the end you will be able to read a large dataset, reshape and enrich it, engineer analytical features over it without ever pulling it onto one machine, choose a storage layout that makes the next query cheap, open a job's execution metrics and say why it is slow, and keep a job running continuously against a stream of new events. The work is hands-on throughout, and the course closes with a lab where you build one pipeline that exercises all of it.

## Objectives

- Explain how a distributed file system stores and replicates a large dataset
- Predict which operations in a job will trigger a shuffle and why that matters
- Write Spark DataFrame code that reads, transforms, and writes a large dataset
- Engineer analytical features over a distributed dataset without collecting it to one machine
- Choose a file format, partition layout, and compression codec for a given query pattern
- Diagnose a slow or failing Spark job from its execution metrics and fix the root cause
- Build a streaming job that consumes from Kafka and writes results continuously

## Prerequisite Knowledge

- SQL & NoSQL Databases (de102), or equivalent fluency with SQL and query plans
- Working knowledge of Python or Scala

## Course Content

1. Course Overview
2. Distributed Storage and the Hadoop Ecosystem
3. Partitions, Shuffles, and Parallelism
4. Spark Fundamentals and the Execution Model
5. Transformation and Feature Engineering at Scale
6. Storage Formats and Compression
7. Tuning Spark Jobs for Scale
8. Streaming with Kafka and Structured Streaming
9. Big Data Processing Lab
