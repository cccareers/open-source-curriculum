---
lesson_id: net260-01
course_id: net260
pathway: cybersecurity-support-technician
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

This is the capstone of the pathway, and it moves your work off equipment you can walk up to. In a cloud environment there is no cable to unplug and no server room door to badge into; almost everything an attacker can do, and everything you can do to stop them, happens through an API call made with an identity. That single shift reorders most of what you already know, and the course is built around it.

You will start by drawing the line between what the provider secures and what your employer secures, because every later question in the course is read off that line. From there you work outward through the controls in order of blast radius: identity first, then network isolation, then data and keys, then the compute and container workloads themselves, then the logs that tell you when one of those controls failed. The second half moves up the stack to the application — assessing a running one for the vulnerability classes that show up on every findings list — and then into the pipeline and the deployment process that produce your infrastructure in the first place.

Everything here is provider-neutral. AWS, Azure, and Google Cloud are treated as three instances of the same small set of ideas, and you will see the same control written three ways more than once, because the job you are being prepared for rarely lets you pick which one you get. Your role throughout is the one the pathway has been building toward: you assist with cloud security. You apply controls someone else designed, verify that they are actually in force, spot the ones that are not, and hand a clear finding to the person who can act on it. Every hands-on activity in this course runs against your own lab account or an instructor-provided target, with authorization stated before you begin.

## Objectives

- State who is responsible for each layer of a cloud workload under IaaS, PaaS, and SaaS, and what that leaves the customer to secure
- Apply least-privilege identity and access policy to a cloud account and detect over-permissive grants
- Configure cloud network isolation for a stated workload using virtual networks, subnets, and security groups
- Choose encryption and key management options that meet a stated data protection requirement in the cloud
- Harden cloud compute and container workloads against the misconfigurations that cause most cloud incidents
- Detect unauthorized access in cloud audit logs and route the signal to a responder
- Assess a deployed application for common vulnerability classes and record the findings
- Insert automated security checks into a delivery pipeline at the stage where each is effective
- Deploy an application to a cloud environment using repeatable, reviewed configuration

## Prerequisite Knowledge

- cyb100 Introduction to Cybersecurity
- net110 Network Security Fundamentals
- cyb130 Access Control and Identity Management
- cyb210 Endpoint Security and Malware Defense
- cyb120 Threat Analysis and Incident Response
- cyb150 Security Compliance and Risk Management

## Course Content

1. Course Overview
2. Cloud Shared Responsibility
3. Cloud Identity and Access Management
4. Securing Cloud Networks
5. Data Protection and Encryption in the Cloud
6. Workload and Container Hardening
7. Cloud Logging and Monitoring
8. Application Security Assessment
9. DevSecOps: Security in the Pipeline
10. Secure Deployment and Configuration Management
11. Project: Cloud Security Posture Review
12. Project: Secure Deployment Pipeline
