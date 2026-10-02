---
lesson_id: cse220-01
course_id: cse220
pathway: cloud-support-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You have deployed cloud infrastructure. Now you have to answer the question that follows a deployment forever: is it working, and if it is not, why not? That question arrives at three in the afternoon from a customer who says the site is slow, and it arrives at three in the morning from a pager, and in both cases the only honest answer comes from evidence you set up in advance.

This course builds that evidence and then teaches you to use it under pressure. You will decide what is worth measuring before you measure anything, collect it, read it, put it on a screen, and turn the important parts of it into alerts that wake a person only when a person is genuinely needed. Then you will point all of it at a real fault and work the fault down through the network, storage, and compute layers until you can name the cause. Finally you will do that with a clock running and other people watching, which is a different skill, and you will write down what happened so the next person does not start from nothing.

Everything here is deliberately vendor-neutral. The three major clouds give the same ideas three different names and three different consoles, and chasing a console is how people learn a product instead of a discipline. You will learn signals, thresholds, query patterns, and process, and you will see where each one lands in the major providers so you can sit down in front of any of them and know what you are looking for.

## Objectives

- Choose the signals that tell you whether a cloud service is healthy
- Configure monitoring and log collection for a cloud service
- Analyze logs and metrics to locate a performance bottleneck
- Build a dashboard that answers whether a service is healthy at a glance
- Define alerts with thresholds that page a human only when action is required
- Isolate a fault across the network, storage, and compute layers of a cloud service
- Act correctly in the first thirty minutes of a service outage
- Document troubleshooting steps and escalate an unresolved issue to the right team

## Prerequisite Knowledge

- Completed Introduction to Cloud Computing (cse101) or equivalent working knowledge of cloud service models
- Completed Cloud Infrastructure Deployment & Management (cse203) or equivalent experience provisioning cloud compute, network, and storage
- Comfortable reading command-line output and plain-text log files

## Course Content

1. Course Overview
2. Signals, Metrics, and Logs
3. Setting Up Cloud Monitoring
4. Reading Logs to Find Bottlenecks
5. Building Service Health Dashboards
6. Designing Actionable Alerts
7. Troubleshooting Across Network, Storage, and Compute
8. Responding to an Outage
9. Documentation, Escalation, and Postmortems
10. Project: Run a Simulated Incident End to End
