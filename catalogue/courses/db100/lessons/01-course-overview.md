---
lesson_id: db100-01
course_id: db100
pathway: software-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Every application you have written so far has kept its data in variables that vanish the moment the process stops. This course moves that data somewhere durable, shared, and strict: a relational database, where the shape of the information is declared up front and the database itself refuses to store anything that contradicts it.

The work is concrete from the second lesson onward. You will install PostgreSQL, model a small community events board as tables, keys, and relationships, and load it with data. From there you will spend most of the course querying it — filtering and sorting single tables first, then combining tables with joins and collapsing them into counts and totals, which is what almost every report anyone asks you for turns out to be.

The last two lessons are about a database that already exists and already has people depending on it, which is the situation you will actually walk into on a team. You will add the constraints that keep data correct, normalize a messy table into a clean one, change a schema without breaking the application reading from it, and then write the document that lets a teammate work against your schema without asking you a single question.

## Objectives

- Model a domain as tables, keys, and relationships
- Retrieve data from a relational database with SQL
- Combine and summarize data across tables with joins and aggregation
- Apply constraints and normalization to keep data correct through change
- Document a schema so a teammate can work against it

## Prerequisite Knowledge

- Comfortable working at a command line
- Basic programming experience in any language

## Course Content

1. Course Overview
2. Relational Foundations and Data Modeling
3. Querying with SQL
4. Joins and Aggregation
5. Constraints, Normalization, and Schema Change
6. Documenting a Schema for the Team
