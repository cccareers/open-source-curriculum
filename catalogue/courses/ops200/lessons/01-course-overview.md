---
lesson_id: ops200-01
course_id: ops200
pathway: software-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

Everything you have built so far ran on your own machine, started by a command you typed. This course covers the distance between that and an application other people can use: how source code becomes a set of files worth deploying, how those files get to a server without anyone doing it by hand, and how you find out when something goes wrong afterwards.

You will work on one application the whole way through — a small front end and a Node API that ship together as a single release. Each lesson adds one layer to it. First the build that turns your source into deployable artifacts, then a task runner and environment-based configuration so the same build runs anywhere, then a pipeline that performs the whole thing automatically on every push, then the release itself with the documentation that makes it traceable, and finally the monitoring that tells you how it is behaving in front of real users.

The habits here are what separate a project from a product. A build nobody can reproduce, a config file with a password in it, a deploy only one person knows how to run, a change nobody wrote down, an outage nobody noticed — these are all ordinary failures on real teams, and every one of them is preventable with work you will do in the next sixteen hours.

## Objectives

- Produce the build artifacts and assets a website deploys
- Automate a repeatable build with a task runner and twelve-factor configuration
- Explain what each stage of a CI/CD pipeline guarantees
- Document a release so its changes can be traced
- Monitor a deployed application and report what it reveals

## Prerequisite Knowledge

- Completed at least one project-based course in this pathway
- Comfortable using git and a command line
- Able to run a local web application

## Course Content

1. Course Overview
2. Build Artifacts and Asset Pipelines
3. Task Runners and Twelve-Factor Configuration
4. CI/CD Pipelines
5. Deploying and Documenting a Release
6. Monitoring a Deployed Application
