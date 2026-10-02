---
lesson_id: node101-01
course_id: node101
pathway: software-developer
title: Course Overview
order: 1
kind: overview
competency_ids: []
objectives: []
---

## Description

You already know how to make a page do something in a browser. This course moves you to the other side of the connection: the machine that receives the request, decides what it means, and sends something back. That machine runs the same JavaScript you have been writing, on a runtime called Node, with a small framework called Express organizing the traffic.

The work is deliberately concrete. You will install the runtime and its package tooling, start a server that answers a real HTTP request, and then grow that server one responsibility at a time until it can route requests, run shared logic in front of them, serve both a rendered page and a JSON API, and record what went wrong when something fails.

By the end you will take that application off your laptop and put it somewhere with a public address, then prove it is serving traffic. Everything before the last lesson is preparation for that: a service nobody can reach is not finished.

## Objectives

- Set up a Node and Express project with the tooling a server needs
- Serve HTTP responses from an Express application
- Route requests to handlers using paths, parameters, and methods
- Compose middleware to handle cross-cutting request concerns
- Serve static assets and rendered views to a browser
- Build a JSON API that other clients can consume
- Handle and log errors so failures are diagnosable
- Prepare an Express application to run on a publicly accessible host

## Prerequisite Knowledge

- Comfortable writing JavaScript functions, objects, and arrays
- Completed JavaScript Projects (web102) or equivalent browser JavaScript experience
- Able to work at a command line and use git

## Course Content

1. Course Overview
2. The Node Runtime and npm
3. Serving HTTP with Express
4. Routing and Route Parameters
5. Middleware and the Request Pipeline
6. Static Assets and Rendered Views
7. Building a JSON API
8. Error Handling and Logging
9. Project: Publish a Public Express Site
