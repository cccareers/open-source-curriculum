---
lesson_id: cse203-01
course_id: cse203
pathway: cloud-support-engineer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You have seen what the cloud is and what the service models promise. This course is where you start building on it. By the end you will have stood up a working environment — machines running an application, a private network carrying its traffic, storage and a database holding its data — and then rebuilt that same environment from a file you can read, review, and hand to somebody else.

The order matters and it is deliberate. You build the first version by hand, clicking and typing, because a person who has never sized an instance or opened a port cannot read a change that does either. Only once the pieces are familiar do you meet the argument for writing them down as code, and then the tool that does it. Everything here is provider-agnostic in principle: pick one cloud, do the work on it, and learn the shape of the thing rather than the layout of one vendor's console.

This is also the course where you start thinking about a customer rather than a lab exercise. A cloud support engineer is usually the person asked why the deployment failed, why the bill went up, or whether the thing that worked last week can be recreated exactly. Each lesson closes with hands-on work, and the course closes with a deployment you produce entirely from version-controlled code.

## Objectives

- Provision and manage cloud virtual machines sized for a defined workload
- Configure a virtual private cloud with subnets and security groups for a deployed application
- Select cloud storage and managed database services that fit a workload's durability and access needs
- Explain the principles that make infrastructure declarative, reproducible, and reviewable
- Define and update infrastructure with Terraform, including state, variables, and modules
- Right-size and autoscale provisioned resources against demand and cost
- Deploy a multi-tier environment for a customer entirely from version-controlled code

## Prerequisite Knowledge

- Completed Introduction to Cloud Computing (cse101) or equivalent working knowledge of cloud service models
- Comfortable at a command line and with basic git version control

## Course Content

1. Course Overview
2. Provisioning and Managing Virtual Machines
3. Cloud Networking for Deployed Workloads
4. Storage and Managed Databases
5. Infrastructure as Code Principles
6. Declaring Infrastructure with Terraform
7. Scaling and Optimizing Provisioned Resources
8. Project: Deploy a Multi-Tier Environment from Code
