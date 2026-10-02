---
lesson_id: ai350-01
course_id: ai350
pathway: prompt-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

By now you have built things that run without you. An automation reads a mailbox, a model summarises what it finds, a record is written, a customer gets a reply. That is genuinely useful, and it is also the point at which somebody else's data, somebody else's money, and your employer's reputation start passing through work you own. This course is about the controls that make that safe to keep running.

You will work as a practitioner, not as a security engineer or a lawyer. That means you will not be asked to break into anything, and you will not be asked to interpret statutes. You will be asked to look at a workflow you have already built and answer concrete questions about it: what could an attacker make this thing do, who can read its logs, what personal data is sitting in it and for how long, who could this system treat unfairly, what is it allowed to decide on its own, and how would you know if it started producing nonsense. Every lesson ends with you applying its control to a real automation.

Two boundaries are worth setting up front. This course is not legal advice — it teaches you to recognise obligations, gather facts, and ask counsel the right questions, and your organisation's lawyers decide what it actually owes. And "protecting AI" here means protecting the workflows and data around hosted models you rent from a vendor, because that is the system you control; attacking or defending model internals is a different discipline and is out of scope.

## Objectives

- Describe the threats specific to AI-powered systems, including prompt injection, data exfiltration, and model misuse
- Apply data-security practices to an AI workflow, covering secrets, least privilege, logging, and third-party model exposure
- Apply GDPR and CCPA obligations to a concrete AI workflow that processes personal data
- Identify bias and fairness risks in an AI automation and apply ethical AI principles to mitigate them
- Write a responsible-AI policy stating what an automation may decide, what a human must decide, and how decisions are recorded
- Monitor AI-generated content for misinformation and compliance risk and respond when monitoring fires

## Prerequisite Knowledge

- Completion of db305, or equivalent experience with data sources and deployed AI workflows
- Completion of ai201, or equivalent experience building business automations

## Course Content

1. Course Overview
2. Threats to AI-Powered Systems
3. Data Security in AI Workflows
4. Data Privacy Law in Practice
5. Bias, Fairness, and Ethical AI
6. Responsible-AI Policy for Automated Decisions
7. Monitoring AI Output for Misinformation and Compliance Risk
