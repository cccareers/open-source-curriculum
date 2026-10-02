---
lesson_id: cse101-03
course_id: cse101
pathway: cloud-support-engineer
title: Virtualization and the Compute Abstractions
order: 3
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Explain how virtualization, containers, and serverless functions divide
    physical hardware into usable compute
---

## The problem virtualization solves

Start with a physical server: two processors with sixteen cores each, 256 GB of memory, a few terabytes of fast disk, a pair of network cards. Now put one application on it. Measure the utilization over a month and you will find something embarrassing — average CPU somewhere around five to fifteen percent, memory half untouched, disk mostly idle. The machine cost the same whether it did that or nothing at all. It draws the same power, occupies the same rack space, and depreciates on the same schedule.

The obvious fix is to put ten applications on it. That fails for reasons that have nothing to do with capacity. Application A needs a library version that application B breaks on. Application C wants to bind port 443, and so does D. A crash in E takes the whole operating system down with it, and now all ten are gone. Team F needs to reboot for a kernel update at a time that would be an outage for everyone else. And nobody can honestly say that a bug in one application cannot read another's files, because they are all just processes with a filesystem in common.

So the real problem is not "how do we fit more work on one machine." It is: **how do we fit more work on one machine while keeping the workloads convincingly separate from each other?** Every compute abstraction in this lesson is an answer to that question, and they differ mainly in how much they separate and how much overhead the separation costs.

That question also has a business form, and it is the reason cloud providers exist at all. The provider buys machines at a scale you cannot, keeps them busy by pooling many customers' uneven demand onto shared hardware, and sells you a slice. Resource pooling from lesson 02 is exactly this. What you are renting when you rent cloud compute is a *subdivision* of a machine, and the three subdivisions on offer are virtual machines, containers, and functions.

![One physical server subdivided three ways: virtual machines on a hypervisor, containers sharing a kernel, and functions invoked per request](./img/compute-abstractions.png)

## Virtual machines and the hypervisor

A **hypervisor** is software that pretends to be hardware. It sits between the physical machine and one or more guest operating systems, and to each guest it presents what looks like a complete computer: some processors, some memory, a disk, a network card, a firmware. The guest OS boots on that fake hardware exactly as it would on real hardware, because as far as it can tell, it is real. Each of those pretend computers is a **virtual machine**.

There are two shapes of hypervisor and the difference matters when you read documentation.

**Type 1**, or bare-metal, runs directly on the hardware with no host operating system underneath. It *is* the operating system, and its only job is running guests. This is what every cloud provider uses, because there is no second OS taking a cut of the resources or adding a failure mode.

**Type 2**, or hosted, runs as an application inside a normal desktop OS. The virtualization software you might install on your laptop to run a Linux VM on a Mac is type 2. It is convenient and slower, and you will not meet it in a provider's fleet.

The hypervisor's core responsibilities, worth naming because they map onto things you will size and troubleshoot:

- **CPU scheduling.** Guests get **vCPUs** — virtual processors that the hypervisor schedules onto real cores. Modern processors have hardware virtualization support, so guest instructions mostly execute directly on the physical core rather than being interpreted, which is why VM CPU performance is close to bare metal. On many instance types one vCPU is one hardware *thread*, not one full core; two vCPUs may therefore be one core's worth of real throughput. Read the instance documentation rather than assuming.
- **Memory allocation.** Each guest gets a region of physical memory it believes starts at zero. Address translation is handled in hardware. Some platforms allow *overcommitment* — promising guests more memory in total than physically exists, betting they will not all use it at once. Cloud providers generally do not overcommit memory on standard instance types, which is part of what you pay for.
- **Device emulation.** Virtual disks and virtual network cards. A virtual disk is usually a volume in a networked storage system rather than a platter in the same chassis, which is why a cloud VM's disk can survive the VM being deleted, and why disk performance is a purchased number (IOPS and throughput) rather than a property of the hardware you happened to get.
- **Isolation.** Guests must not read each other's memory or see each other's traffic. This is the security boundary the provider owns under the shared responsibility model — and it is a strong one, which is exactly why the responsibility line in lesson 02 puts the hypervisor firmly on the provider's side.

### What you get and what you owe

A cloud virtual machine arrives as a booted operating system with an address and a way to log in. From that point:

- You choose the **machine image** — a snapshot of a disk containing an OS and whatever was baked in. Providers publish maintained images for common operating systems; you can build your own with your agents and dependencies already installed, which makes new instances start ready rather than start empty.
- You choose the **size**, from a menu of instance types. Types are grouped into *families* by their resource ratio: general purpose (balanced CPU to memory), compute optimized (more CPU per gigabyte, for encoding or simulation), memory optimized (for caches and large databases), storage optimized (for local high-throughput disk), and accelerated (with GPUs). Within a family, sizes usually scale linearly — double the size, double the vCPUs and memory, double the price.
- You own the **operating system from the kernel up**: patches, users, services, host firewall, log rotation, disk space, time synchronization, and the agents that report metrics back.
- You control the **lifecycle**: start, stop, reboot, resize (which requires a stop on most platforms), snapshot, and terminate. Billing for the compute normally stops when the VM stops; billing for the attached disk does not, because the disk still exists.

Virtual machines take tens of seconds to a few minutes to become useful — firmware, kernel, services, then your application. That is fast compared to buying a server and slow compared to everything else in this lesson, and it sets the floor on how quickly a VM-based system can respond to a traffic spike.

## Containers

Containers start from a different observation. If two applications both run on Linux, they do not actually need two Linux kernels. They need to not see each other's processes, files, network ports, or resource consumption. That is a much smaller requirement than a whole extra operating system, and the kernel can provide it directly.

A **container** is a set of processes running on the host kernel, with two kernel features applied:

- **Namespaces** control what the processes can *see*. A separate process namespace means the container's first process is PID 1 and it cannot see the host's processes. A mount namespace means it sees its own root filesystem. Network, user, hostname, and inter-process communication namespaces do the equivalent for those.
- **Control groups (cgroups)** control what the processes can *use*: CPU shares, a memory ceiling, I/O limits. Exceed the memory ceiling and the kernel kills the process — the notorious out-of-memory kill that shows up as a container restarting for no visible reason.

There is no guest operating system and no hypervisor in that description, and that is the whole performance story. A container starts in the time it takes to start a process, because that is all it is.

### Images and layers

A **container image** is a filesystem plus metadata about how to start the process. It is built from a text file of instructions, and each instruction produces a **layer** — a diff against the layer below. Layers are content-addressed and cached, so an unchanged layer is neither rebuilt nor re-uploaded.

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

Two things in that file are worth more attention than they usually get.

The order of `COPY` is a deliberate optimization. Dependencies are copied and installed *before* the application source is copied, so editing your code invalidates only the last layer. Reverse those two and every one-character change reinstalls every dependency.

The bind address is `0.0.0.0`, not `127.0.0.1`. Inside its network namespace, binding to loopback means nothing outside the container can reach the process — including the platform's health checker. This single line is responsible for an enormous share of "it works locally but the deployment says unhealthy" incidents, and you will meet it again in lesson 08.

You build the image once, push it to a **registry**, and every environment pulls that exact image. The identity of the artifact is a digest, so "the version in production" is an unambiguous statement rather than a hope about which commit was deployed. This is the property that makes containers worth the trouble: the thing you tested is byte-identical to the thing that runs.

```bash
# build, tag, and push — the same three verbs on every platform
docker build -t registry.example.com/team/api:1.4.2 .
docker push registry.example.com/team/api:1.4.2

# run it locally exactly as the platform will
docker run --rm -p 8080:8080 -e LOG_LEVEL=info registry.example.com/team/api:1.4.2
```

### What a container does not give you

Containers share the host kernel. A kernel vulnerability is therefore a boundary that can, in principle, be crossed — the isolation is real but weaker than a hypervisor's, which is why providers running untrusted customer containers put them inside lightweight virtual machines anyway. A container also cannot run a different kernel from its host: a Linux container needs a Linux host, and an image built for one processor architecture will not run on another. "Exec format error" on deploy almost always means an image built on an ARM laptop was pushed to an x86 host, or the reverse.

Containers are also, by default, **ephemeral**. Write a file inside a running container and it disappears when that container is replaced, which happens on every deployment and every crash. Anything that must survive goes to a mounted volume or, far more often in cloud, to a storage or database service outside the container entirely. Lesson 05 covers where.

Finally, one container is not a system. Real deployments run many replicas across many machines and need something to decide where they go, restart the failed ones, and route traffic to the healthy ones. That is **orchestration**, and every provider sells a managed orchestration service. This course goes no further into it than knowing the word — the pathway covers it later.

## Serverless functions

The third subdivision drops the idea of a running server entirely. You supply a function: a piece of code with an entry point, some dependencies, and a configuration for how much memory it gets and how long it may run. You attach it to a **trigger** — an HTTP request, a file appearing in storage, a message on a queue, a timer. The platform runs your function when the trigger fires, and charges you for the time it ran.

"Serverless" is a bad name and everyone knows it. There are servers. You do not provision, size, patch, or scale them, and you do not pay for them when your code is not running. That is the actual claim.

```python
def handler(event, context):
    """Invoked once per uploaded object. Stateless by construction."""
    key = event["object"]["key"]
    size = event["object"]["size_bytes"]
    if size > 25_000_000:
        return {"status": "skipped", "reason": "too large", "key": key}
    thumbnail = make_thumbnail(key)
    return {"status": "ok", "thumbnail": thumbnail}
```

The properties that follow from this model are strict, and they are the whole difficulty of working with it:

**Scaling is automatic and per-invocation.** A thousand simultaneous requests produce up to a thousand concurrent execution environments. Nobody configures that; there is nothing to configure. What you do configure is a concurrency *ceiling*, because a function that scales freely can overwhelm a downstream database that cannot.

**Cold starts.** The first invocation into a new execution environment must set that environment up — fetch your code, start the runtime, run your initialization. That added latency is a **cold start**, ranging from tens of milliseconds for a small script to several seconds for a heavy runtime with a large dependency tree. Once warm, an environment is reused for subsequent invocations, so cold starts are a small fraction of a busy function's calls and a large fraction of a rarely called one's.

**No durable local state.** The filesystem is temporary and the environment can vanish between calls. Global variables sometimes survive between invocations on a reused environment and sometimes do not — which makes them excellent for caching an expensive connection and catastrophic for anything correctness depends on.

**Hard limits.** Maximum execution duration, maximum memory, maximum payload size, maximum concurrency. All of them are real, all of them are enforced by termination, and a function that runs for twenty-five minutes is a workload in the wrong abstraction.

**Memory is the sizing dial.** On most platforms CPU is allocated in proportion to configured memory, so raising memory raises speed. This produces the counterintuitive result that a function with more memory can be *cheaper* — if doubling the memory more than halves the duration, the bill goes down. Tuning by measurement is worth doing for anything invoked often.

Functions fit event-driven, spiky, short, stateless work: resizing an uploaded image, validating a webhook, running a nightly report, gluing two services together. They fit long-running, latency-critical, or stateful work badly.

## Comparing the three

| | Virtual machine | Container | Serverless function |
| --- | --- | --- | --- |
| Isolation boundary | Hypervisor | Kernel namespaces + cgroups | Provider-managed, per invocation |
| Contains | A full guest OS | Processes + a filesystem image | A function and its dependencies |
| Start time | Tens of seconds to minutes | Under a second to seconds | Milliseconds warm; up to seconds cold |
| Typical lifetime | Weeks to years | Minutes to weeks | Milliseconds to minutes |
| You patch | OS and everything above | The image contents | Your code and its dependencies |
| Provider patches | Facility, hardware, hypervisor | The above plus host OS and runtime | Everything but your code |
| Scaling unit | An instance | A replica | An invocation |
| Scaling speed | Minutes | Seconds | Instant |
| Billing granularity | Per second, while running | Per second, per replica | Per invocation and per millisecond used |
| Cost when idle | Full price | Full price unless scaled to zero | Zero |
| Local state | Durable disk | Ephemeral by default | None |
| Service model (lesson 02) | IaaS | Between IaaS and PaaS | PaaS |

The last row is not decoration. Moving right along that table is moving up the shared responsibility stack: you trade control for work you no longer have to do. That is the same trade in both lessons, which is why they are adjacent.

### Choosing: the questions that actually decide it

Do not start from the abstraction. Start from the workload's properties, in roughly this order.

1. **Does it need a specific operating system, a kernel module, a licensed agent, or persistent local disk?** If yes, it is a virtual machine, and the rest of the questions are moot. Legacy software with an installer and a support contract lands here constantly.
2. **Is it event-driven, short, and stateless?** If yes, a function is likely cheapest and least work, especially at low or spiky volume.
3. **Is it a long-running service that must respond in milliseconds and scale in seconds?** Containers on a managed platform. This is the default for new web services and there is a reason.
4. **Is the load steady and high?** Steady load erodes the serverless cost advantage and, at large enough scale, makes reserved virtual machines cheapest. Elasticity you never use is elasticity you should not pay for.
5. **What does the team actually operate today?** An abstraction nobody on the team can debug at 2 a.m. is the wrong abstraction regardless of what the table says.

### Three worked decisions

**A nightly job that reads yesterday's orders and emails a summary.** Runs once, takes ninety seconds, needs no state between runs. A timer-triggered function. A virtual machine for this would be idle 99.9% of the day and still bill for all of it, and you would be patching an OS for the privilege.

**A public API serving 400 requests per second all day, with a 3× spike at lunch.** Containers behind a managed service, scaling on request concurrency. Functions would work, but at that steady volume the per-invocation charges are relentless and the cold-start tail hurts the latency percentiles you would be judged on. VMs would work too, but they scale in minutes and the lunch spike arrives in seconds.

**A vendor's inventory application distributed as an installer, requiring a specific OS build and a hardware license dongle emulator.** A virtual machine. It is not a container candidate — the vendor will not support it, and the installer expects an init system and a full filesystem. It is not remotely a function. This is the case people try hardest to modernize and should not; the right answer is a right-sized VM with a documented patch schedule.

### Right-sizing, briefly

Whichever abstraction you pick, the sizing routine is the same: start from a measurement, not a guess. Deploy something plausible, run realistic load, watch CPU, memory, and the latency percentiles, then adjust. Persistent CPU above roughly 70–80% means too small. Memory that climbs to a ceiling and stays there means too small, or a leak. CPU under 10% with comfortable memory means too big, and too big is a bill nobody is looking at. Lesson 07 turns those observations into money.

## Practice

**Part 1 — Read a machine's subdivision.** On any machine you control, run a container and observe the boundary directly.

1. Start a long-running container from a small base image and give it a memory limit: `docker run --rm -it --memory=256m alpine sh`.
2. Inside it, run `ps aux` and `hostname`. Note that the process list is nearly empty and the hostname is not your machine's. Name the two namespaces responsible.
3. Inside it, write a file to `/tmp`. Exit, start the same image again, and look for the file. Explain in one sentence what happened to it and why that is a design property rather than a bug.
4. From the host, run `docker stats` while the container runs and record CPU and memory. State which kernel feature produces the memory ceiling.
5. Try to allocate more than the limit inside the container and describe exactly how the failure presents.

**Part 2 — Build and reason about an image.** Write a Dockerfile for a minimal HTTP service in any language that returns `ok` on `GET /healthz` and listens on the port given by an environment variable, defaulting to 8080.

1. Order the instructions so that changing one line of application source does not reinstall dependencies. Then deliberately reverse that order, rebuild both, and record the two build times.
2. Bind to `0.0.0.0` and confirm you can reach it from the host with `curl`. Then change the bind to `127.0.0.1`, rebuild, and confirm you cannot. Write one sentence explaining what the platform's health checker would report in the second case.
3. Run `docker image history` on your image and write down which layer is largest and one change that would shrink it.

**Part 3 — Choose an abstraction, five times.** For each workload, name virtual machine, container, or function; give the two properties of the workload that decided it; and name the strongest argument for the runner-up and why it loses.

1. A PDF is uploaded to storage and must be scanned for viruses within a minute.
2. A customer-facing web application with steady weekday traffic and a nightly deploy.
3. A commercial database engine with a per-socket license and a vendor support contract.
4. A machine-learning training run that needs a GPU for six hours, twice a month.
5. A webhook receiver that gets fifteen requests a day, at unpredictable times, and must respond in under two seconds.

**Part 4 — Size one thing honestly.** Take the service you built in part 2, or any small service you have. Put load on it with any load-testing tool. Record CPU, memory, and p95 latency at three concurrency levels. Then state, in fewer than 150 words: the size you would provision, the measurement that justifies it, the scaling trigger you would set, and what evidence would make you change your mind. "It felt fine" is not a measurement.

**Deliverable:** a short report containing the container observations, the Dockerfile with both build times, the five abstraction decisions, and the sizing statement with its numbers.
