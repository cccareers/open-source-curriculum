---
lesson_id: net110-01
course_id: net110
pathway: cybersecurity-support-technician
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Almost every control you will ever be asked to configure — a firewall rule, a sensor, a tunnel, a certificate — is an argument about which traffic is allowed to exist. To make that argument well you have to be able to read the traffic first. This course teaches you to do both, in that order: read the network honestly, then shape it deliberately, then watch what you shaped.

You will start with a defender's refresher on addressing, ports, and protocol behavior, because everything after it is written in those same four terms — address, port, protocol, direction. From there you will design zones that match assets to trust levels, write firewall rules that implement a stated requirement without quietly opening a second path, place an intrusion detection or prevention sensor where it can actually see what it is meant to see, build the controlled exceptions to segmentation that remote access requires, and choose encryption and key handling for data both moving and sitting still.

The course is taught vendor-neutrally. You will see generic rule tables, open-source rule and signature syntax, and protocol-level concepts rather than any one appliance's menus, because the vendor in front of you on the job is not the one you would have practiced on anyway. Every lab activity belongs on your own lab network — virtual machines you own, addresses you control. The whole posture of this course is defensive: you are learning to describe traffic accurately and to constrain it correctly, which is a different skill from breaking things, and a more employable one.

## Objectives

- Read addressing, ports, and protocol behavior well enough to say what a captured network conversation is doing
- Design a segmented network that places each asset in a zone matching its trust level
- Write and order firewall rules that implement a stated access requirement without opening unintended paths
- Choose detection or prevention placement for an IDS/IPS sensor and interpret the alerts it produces
- Select and configure a remote-access or site-to-site VPN appropriate to a stated requirement
- Choose encryption and key-handling appropriate to data in transit and data at rest

## Prerequisite Knowledge

- cyb100 Introduction to Cybersecurity, or equivalent familiarity with security vocabulary and risk basics

## Course Content

1. Course Overview
2. Networking Refresher for Defenders
3. Secure Network Architecture and Segmentation
4. Firewalls and Rule Design
5. Intrusion Detection and Prevention
6. VPNs and Remote Access
7. Encryption in Transit and at Rest
8. Project: Traffic Monitoring and Anomaly Triage
9. Project: Secure Network Design for a Branch Office
