---
lesson_id: DOCKER-AI-101-03
course_id: DOCKER-AI-101
pathway: ai-developer
title: Containers vs. Virtual Machines
order: 3
kind: lesson
competency_ids:
  - D5-S6-C01
objectives:
  - Contrast containers with virtual machines in terms of isolation, startup
    time, and resource footprint
  - Explain why containers are lightweight enough for everyday laptops such as
    M-series Macs
---

## Two ways to isolate software

A **virtual machine** emulates a whole computer. The hypervisor gives it virtual CPUs, virtual disks, and virtual network cards, and inside that you install a complete guest operating system with its own kernel, init system, and background services. Isolation is very strong, because the guest genuinely believes it is a separate machine.

A **container** skips the guest operating system. It is just processes running on the host kernel, fenced off by kernel features — namespaces give the process its own view of the filesystem, network, and process table, and cgroups cap how much CPU and memory it may use. There is no second kernel to boot and no virtual hardware to emulate.

## What the difference costs you

| | Virtual machine | Container |
| --- | --- | --- |
| Boots | A full OS, tens of seconds | A process, well under a second |
| Disk | Gigabytes per guest OS | Megabytes over the shared base layers |
| Memory | Reserved up front for the guest | Only what the process uses |
| Isolation | Hardware-level, very strong | Kernel-level, strong but shared |
| Density | A handful per laptop | Dozens |

The practical consequence is that you stop treating an environment as precious. Starting a container to try a library, then deleting it, is as cheap as opening and closing a terminal tab. That changes how you work: you experiment more, because the cost of a clean slate approaches zero.

## Why this matters on an M-series Mac

Here is the nuance that trips people up. The Linux kernel that containers share does not exist on macOS, so Docker Desktop runs a single small Linux virtual machine in the background and puts all of your containers inside it. You are technically paying for one VM — but only one, no matter how many containers you run, and it starts when Docker Desktop starts rather than per project.

That single shared VM is why a laptop with 8 to 16 GB of RAM can comfortably run an LLM server, a vector database, and an API container at the same time. Ten virtual machines would not fit; ten containers do, because they share the kernel and the base image layers between them.

Two practical rules follow. First, give Docker Desktop a sensible memory allocation in its settings — the containers can only use what the VM has. Second, prefer images built for `linux/arm64` on Apple Silicon; an `amd64` image will still run under emulation, but slowly, which is very noticeable when a model is loading.

## Practice

1. Open Docker Desktop's settings and find the memory and CPU allocated to its Linux VM. Note the numbers — you will refer back to them when you size a model later in this course.
2. Write a two-column list contrasting what a VM duplicates and what a container shares. Include the kernel, the filesystem, and the process table.
3. Given a laptop with 16 GB of RAM, explain in a sentence why running four containers is realistic but running four virtual machines is not.
