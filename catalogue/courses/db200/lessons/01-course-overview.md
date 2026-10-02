---
lesson_id: db200-01
course_id: db200
pathway: software-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You have already built a relational database. You know how to split a domain into tables, protect it with keys and constraints, normalize away duplication, and pull the pieces back together with joins. That skill is not being replaced here. This course adds the other half of the picture: the stores that deliberately give up some of what you learned in exchange for something else, and the judgment to know when that trade is worth making.

The work starts with a survey, because "NoSQL" is not one thing — it is four quite different families of store that share little except a decision not to be a relational database. From there you will meet the vocabulary the industry uses to argue about distributed data, learn to design documents backwards from the queries your application will actually run, and then write real code against one document store until the abstractions have calluses on them.

The course closes with a written recommendation rather than another feature. In a working team, the person who can build against MongoDB is useful; the person who can say out loud why this workload belongs in Postgres and that one does not, and defend it on cost, operations, and technical grounds, is the one who gets asked. That is the skill this course is aimed at.

## Objectives

- Compare the NoSQL data-store families and the workloads each suits
- Explain the consistency and availability trade-offs described by CAP
- Model data around an application's access patterns
- Build an application feature against a document database
- Justify a data-store choice on technical and operational grounds

## Prerequisite Knowledge

- Completed Relational Databases (db100) or equivalent SQL experience
- Comfortable reading and writing JSON

## Course Content

1. Course Overview
2. The NoSQL Families and Their Feature Sets
3. CAP Theorem and Consistency Trade-offs
4. Modeling for Access Patterns
5. Building Against a Document Database
6. Project: Choose and Justify a Data Store
