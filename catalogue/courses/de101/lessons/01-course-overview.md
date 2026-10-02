---
lesson_id: de101-01
course_id: de101
pathway: data-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Every dashboard someone trusts, every model someone ships, and every report someone forwards to a board meeting sits on top of data that had to be moved, reshaped, and checked by somebody. That somebody is a data engineer. This course is your introduction to that work: how data is stored, how it gets from where it is produced to where it is used, and what it takes for the people downstream to believe the numbers.

You will start with the role itself and the people you build for, then learn to design the models that data lands in, query them with SQL, and reason about when a non-relational store is the better home. From there you move into movement: what a pipeline actually is, the difference between transforming before and after loading, and how to write an ingestion job that reads from files, web APIs, and databases without needing a human to babysit it. The course closes on quality, because a pipeline that delivers wrong data on time is worse than one that delivers nothing.

This is a breadth-first course, and it is deliberately tool-light. You will write SQL and Python by hand rather than leaning on a framework, because the later courses in this pathway add the frameworks and you will understand them far better if you have already done the work they automate. Expect to spend as much time in the practice exercises as in the reading — each one is a small piece of the job you are training for.

## Objectives

- Describe what a data engineer does and how the role relates to analysts, scientists, and software engineers
- Design a normalized transactional schema and a denormalized analytical model for the same subject area
- Write SQL that joins, filters, and aggregates data across several tables
- Choose between a relational store and a NoSQL store for a stated workload
- Explain the difference between ETL and ELT and when each is appropriate
- Build a repeatable ingestion job that reads from a file, an HTTP API, and a database
- Apply profiling and quality checks to a raw dataset before it is used downstream

## Prerequisite Knowledge

- Comfort with a command line, a text editor, and version control basics
- Introductory programming in Python or a comparable language

## Course Content

1. Course Overview
2. The Data Engineering Role
3. Data Modeling Foundations
4. Relational Databases and SQL
5. NoSQL Data Stores
6. ETL and ELT Pipelines
7. Ingesting Data from Multiple Sources
8. Data Quality Fundamentals
