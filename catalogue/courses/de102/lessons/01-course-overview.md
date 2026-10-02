---
lesson_id: de102-01
course_id: de102
pathway: data-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You already know, from de101, that databases exist and roughly what they are for. This course is where that survey turns into skill. Over forty hours you will design schemas that refuse to hold bad data, write the kind of SQL that answers real analytical questions, and then take the same queries apart to find out why they are slow and what to do about it. PostgreSQL is the engine you will spend the most time in, with MySQL differences pointed out wherever the two diverge in a way that would trip you up on the job.

The second half of the course leaves the relational world deliberately. MongoDB and Cassandra do not enforce joins, keys, or a single correct schema, and that changes how you model: you design around the queries you intend to run rather than around the entities you happen to have. You will build a document model and a wide-column table from access patterns, then measure and tune the read and write paths that result.

Everything here is hands-on. Each lesson ends with exercises you run against a local database, and most of them ask you to measure something before and after a change rather than take a rule of thumb on faith. Distributed query engines, pipeline orchestration, and database security each belong to a later course in this pathway; here the subject is the database itself and the queries you send it.

## Objectives

- Model a relational schema whose integrity is enforced by keys and constraints
- Write analytical SQL using joins, subqueries, common table expressions, and window functions
- Explain how an isolation level changes what a concurrent transaction can observe
- Choose an index type and column order that a given query can actually use
- Read an execution plan and name the operator responsible for a slow query
- Partition a large table so that queries prune the partitions they do not need
- Design a MongoDB document model and a Cassandra table around their access patterns
- Diagnose and reduce read and write latency in a NoSQL deployment

## Prerequisite Knowledge

- Data Engineering Fundamentals (de101), or equivalent experience writing single-table and simple join queries
- Ability to run a local database with Docker or a package manager

## Course Content

1. Course Overview
2. Relational Modeling in PostgreSQL and MySQL
3. Advanced SQL: Joins, Subqueries, and Window Functions
4. Transactions, Isolation, and Concurrency
5. Indexing Strategies
6. Reading Query Execution Plans
7. Partitioning and Storage Layout
8. Document and Wide-Column Stores
9. Tuning NoSQL Reads and Writes
