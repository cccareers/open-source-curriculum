---
lesson_id: ds320-01
course_id: ds320
pathway: data-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

By this point in the pathway you can build a pipeline that moves data from a source system into a warehouse, schedule it, monitor it, and recover it when it fails. This course is about the rules that pipeline has to obey. Governance and security are not a separate discipline bolted on afterwards by someone else — they are constraints on the work you already do, and they arrive as concrete engineering tasks: tag this column, revoke that grant, rotate that key, prove this record was deleted.

You will start with the governance program itself, so that every control later in the course has an owner and a reason. From there you will translate GDPR and CCPA into obligations that map onto real tables and real storage buckets, classify a dataset and grant access to it according to least privilege, encrypt it in transit and at rest with keys you can actually manage, and turn the lineage you built in the previous course into evidence an auditor will accept.

One thing to be clear about before you begin: this is engineer-facing governance, not legal training, and nothing here is legal advice. Your job is to implement and evidence the controls your organization's legal and privacy people decide are required, and to tell them honestly what the data actually contains. The course closes with a project in which you write and configure a complete data-protection plan for a single enterprise data asset.

## Objectives

- Explain what a data governance program owns and who is accountable for each part
- Map GDPR and CCPA obligations onto the data a pipeline actually holds
- Classify a dataset and grant access according to least privilege
- Apply encryption in transit and at rest, and manage the keys that make it meaningful
- Produce lineage and audit evidence that answers a regulator's or auditor's question

## Prerequisite Knowledge

- Data Pipeline Automation & ETL Best Practices (de210), or equivalent experience operating a pipeline in production
- Familiarity with relational and cloud storage from earlier pathway courses

## Course Content

1. Course Overview
2. Data Governance Foundations
3. Privacy Regulation in Practice
4. Classification and Access Control
5. Encryption and Key Management
6. Data Lineage and Audit Trails
7. Securing an Enterprise Data Asset
