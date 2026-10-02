---
lesson_id: cyb210-01
course_id: cyb210
pathway: cybersecurity-support-technician
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Almost every intrusion you will ever work on touches an endpoint. Somebody's laptop opened the attachment, somebody's server was running the unpatched service, somebody's workstation is where the ransomware note appeared. Networks and identity systems get the architecture diagrams, but the endpoint is where an attack becomes real, and it is where a support technician is expected to notice, contain, and clean up. This course is about that work.

You will start with the agent that watches the endpoint, because everything after it is read through the telemetry that agent produces — a detection you cannot interpret is worse than no detection at all. From there you move to what the agent is watching for, learning to classify a malware sample by what it *does* rather than what a vendor named it, and to write down the indicators it leaves behind. Then you close the holes it came through: prioritizing a patch backlog that is always larger than the maintenance window, and configuring the mail authentication and filtering controls that stop the majority of initial access before an endpoint is ever touched. Two projects finish the course, and they are the two artifacts an endpoint technician is actually asked to produce — a containment runbook a colleague can follow under pressure, and an evidence-based triage report a decision maker can act on.

Two boundaries are worth stating up front. First, everything here is defensive and lab-scoped: malware analysis happens on instructor-supplied samples inside an isolated, non-networked virtual machine, and at no point does this course write, modify, or distribute malicious code. Second, this is not a product course. Endpoint detection and response, antivirus, patch management, and mail security are taught as capability categories with generic and open-source illustrations, so that the skill survives your employer switching vendors — which they will.

## Objectives

- Deploy and tune endpoint protection so that it detects malicious behavior without burying the analyst in false positives
- Classify a malware sample by its observed behavior and name the indicators it leaves on an endpoint
- Prioritize a patch backlog using severity, exposure, and business impact
- Configure email authentication and filtering to block spoofed, malicious, and unwanted mail

## Prerequisite Knowledge

- cyb100 Introduction to Cybersecurity
- net110 Network Security Fundamentals
- cyb130 Access Control and Identity Management

## Course Content

1. Course Overview
2. Endpoint Protection and EDR
3. Malware Behavior and Triage
4. Patch and Vulnerability Management
5. Email Security and Phishing Defense
6. Project: Endpoint Containment Runbook
7. Project: Malware Triage Lab Report
