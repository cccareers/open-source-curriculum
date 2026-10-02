---
lesson_id: cse203-02
course_id: cse203
pathway: cloud-support-engineer
title: Provisioning and Managing Virtual Machines
order: 2
kind: lesson
competency_ids:
  - D2-S1-C02
objectives:
  - Provision and manage cloud virtual machines sized for a defined workload
---

## What a cloud virtual machine actually is

A cloud virtual machine is a slice of somebody else's server, presented to you as though it were a whole computer. Underneath, in a data centre you will never see, there is a physical machine — a *host* — with a large number of physical CPU cores and a lot of RAM. A layer of software called a **hypervisor** runs directly on that host and divides it up, presenting each division as a complete machine with its own CPUs, memory, disks, and network interfaces. Your operating system boots inside one of those divisions and, for the most part, cannot tell the difference.

That is the whole trick, and almost every practical consequence follows from it.

**You are sharing hardware with strangers.** The hypervisor enforces the boundary — your instance cannot read another tenant's memory — but you are still competing for physical resources. On most instance types this is invisible. On the cheap, burstable types it is not, and you will meet that in the sizing section.

**The machine is a configuration, not an object.** When you "create" a virtual machine, you are not assembling hardware. You are writing down a set of choices — this much CPU, this much memory, boot from this image, attach this disk, place it in this network — and asking the platform to instantiate them. That distinction is what makes the rest of this course possible: a thing that is fully described by a configuration can be described in a file, and a thing described in a file can be recreated. Hold onto it, because lesson 05 turns it into an argument.

**It appears in about a minute and disappears just as fast.** The provisioning that used to mean a purchase order, a delivery, and a rack visit is now an API call. This is the single largest behavioural change the cloud asks of you. A machine that takes six weeks to obtain gets nursed for five years. A machine that takes ninety seconds to obtain should be thrown away and rebuilt the moment it misbehaves. Practitioners call this the *pets versus cattle* distinction, and it drives the operational habits later in this lesson.

**It is billed by the second, while it is running.** Not while it is useful — while it is running. An instance somebody spun up for a test in March and forgot about is still charging in July. As a support engineer you will be the one asked to explain that line on the invoice.

Terminology differs by provider and the differences are cosmetic. AWS calls the running unit an *EC2 instance*, Azure calls it a *virtual machine*, Google Cloud calls it a *Compute Engine instance*. This lesson says "instance" throughout and means all three.

## Choosing the right compute abstraction

Before you size a virtual machine, be sure a virtual machine is what the workload wants. The platform offers a ladder of abstractions, and each rung hands more responsibility to the provider in exchange for less control.

**Virtual machines.** You get a whole operating system. You choose the distribution, you install the packages, you own the patching, you own the process supervision, and you own whatever runs at boot. Everything runs, because it is just a computer — legacy software, an agent that needs kernel modules, a database that wants raw disk access, a licensed application that checks the host id.

**Containers.** A container is a packaged application plus its dependencies, isolated by the *host's* kernel rather than by a hypervisor. There is no guest operating system inside it, which is why a container starts in under a second and a virtual machine takes a minute. What you hand the platform is an image — the application, its libraries, its configuration — and the platform runs copies of it. Containers are the right choice when the unit you care about is the application rather than the machine, when you want identical behaviour from a developer laptop through to production, and when you want to run many small services densely on the same hardware. What they do not remove is the machine underneath: unless you use a fully managed container service, containers run *on* virtual machines that somebody — you — still has to size and patch.

**Serverless functions.** You supply a function and an event that triggers it. There is no machine and no container in your mental model at all; the platform creates execution capacity when a request arrives and destroys it afterwards, and you pay per invocation and per millisecond of execution. This is the right choice for spiky, short, stateless work. It is the wrong choice for anything long-running, anything with a large in-memory cache to warm up, or anything that must respond in single-digit milliseconds on the first call after an idle period. Lesson 07 returns to serverless as a demand-fitting and cost tool once you have infrastructure code to attach it to.

The honest decision procedure is a short one. Ask what the unit of deployment is. If it is a machine that hosts several things, or software that assumes an operating system it can modify, provision a virtual machine. If it is one application with a clean process boundary and a build pipeline that can produce an image, containers are usually better, and you will still need machines to run them on unless you buy a managed runtime. If it is a piece of logic that runs briefly in response to an event and holds no state between calls, take the function.

For the rest of this lesson the answer is the virtual machine, because that is what the course's running example needs and because it is the abstraction whose moving parts are all visible.

## Sizing an instance for a defined workload

"Sized for a defined workload" is the objective, and both halves are load-bearing. You cannot size anything until somebody defines the workload, and the most common failure in this task is not arithmetic — it is accepting a request like "we need a server for the new app" and provisioning against a guess.

Get four numbers or estimates before you choose anything:

1. **Concurrency.** How many requests, jobs, or users at once, at peak — not on average. Averages hide the only moment that matters.
2. **Memory working set.** How much RAM the process actually holds. A runtime with a 2 GB heap ceiling needs more than 2 GB of machine, because the operating system, the agent, and the page cache all want some.
3. **CPU shape.** Is the work steady, bursty, or occasional? Is it parallel across cores, or one hot thread that no amount of extra vCPUs will help?
4. **Disk and network behaviour.** How much data is read and written per second, and how much crosses the network. This is the dimension people forget, and it is the one that most often turns out to be the real limit.

Providers group instances into **families** that trade these dimensions against each other. The names differ; the categories do not:

- **General purpose** — a balanced ratio, commonly around 4 GB of memory per vCPU. The correct default when you do not yet know.
- **Compute optimized** — roughly 2 GB per vCPU, faster clocks. For encoding, simulation, and heavy request processing.
- **Memory optimized** — 8 GB per vCPU and upward. For caches, in-memory analytics, and database engines.
- **Storage optimized** — locally attached high-throughput disks. For workloads that read and write far more than they compute.
- **Accelerated** — GPUs or other accelerators, for training and inference. Expensive, and only correct when the software actually uses the accelerator.
- **Burstable** — the cheap tier, and the one that surprises people. A burstable instance is guaranteed only a fraction of a core's throughput continuously; it accrues credits while idle and spends them to run at full speed. Under sustained load the credits run out and the instance is throttled to its baseline, which can be as little as ten or twenty percent of a core. It is excellent for a low-traffic site or a build agent. It is a bad choice for anything that must be fast at 3 p.m. every weekday, and "the server suddenly got slow after two hours" is very often exactly this.

Within a family, instances come in sizes that roughly double: large, xlarge, 2xlarge, and so on, with price scaling in step. Because the ratio holds across sizes, moving up a size doubles memory *and* CPU whether or not you needed both.

Two habits keep sizing honest.

**Measure, do not guess.** If a comparable workload already runs somewhere, look at its actual CPU utilisation, memory in use, disk throughput, and network throughput at peak, and size from those. A brand-new workload gets a defensible starting guess and a review date, not a permanent decision.

**Size for peak, then plan to change it.** In a data centre you bought for the worst hour of the year and lived with the waste. In the cloud you can start small, watch, and resize. Resizing a single instance means stopping it, changing the type, and starting it again — a few minutes of downtime and no data loss if the root disk persists. That is a small enough operation that over-provisioning "just in case" is no longer a defensible instinct. Lesson 07 makes the same argument with autoscaling, where the machine count changes rather than the machine size.

A worked example. A customer asks you to host an internal ticketing application: about 60 staff, peak maybe 25 concurrent users, a runtime configured with a 1.5 GB heap, a separate managed database so no data lives on the machine, and a nightly report that pegs one core for twenty minutes. Concurrency is low, the working set is small, and the CPU pattern is idle with one predictable spike. Memory says at least 4 GB. Two vCPUs handle 25 users comfortably. The nightly spike is real load for twenty minutes, which rules out the smallest burstable size — but a mid-range burstable instance accrues credits all day while idle and has plenty to spend at 2 a.m. So: general purpose or burstable, 2 vCPU, 4 GB, with a note in the ticket that the burstable choice depends on the machine staying idle during the day, and a review after a month of real metrics. That last clause is what separates a sizing decision from a sizing guess.

## Provisioning: the choices you are actually making

Every provider's create-instance flow asks the same questions in a different order. Learn the questions and the console stops mattering.

**Region and zone.** A *region* is a geographic location; an *availability zone* is one isolated failure domain within it, with its own power and networking. Choose the region for latency to your users, for data residency requirements, and for price — regions cost different amounts. Choose the zone only when you care, and care when the workload needs to survive a single facility failing. A single instance lives in exactly one zone; surviving a zone outage means more than one instance, which is lesson 07's business.

**Image.** The template the root disk is created from: an operating system, sometimes with software pre-installed. Providers publish maintained images for the major distributions; you can also build your own, which is how organisations bake an agent, a hardening baseline, and a runtime into a known starting point. Always record which image id you used. "Latest Ubuntu LTS" is not a reproducible statement — it means something different in March than it did in January.

**Instance type.** The sizing decision from the previous section.

**Storage.** A root volume, sized in gigabytes, with a performance class. General-purpose SSD is the sane default. The two things to decide deliberately are whether the volume is deleted when the instance is terminated (usually yes for a replaceable machine, and *think* before you accept the default on anything holding data) and whether encryption at rest is enabled (yes, always; it is free and turning it on later means recreating the volume). Additional data volumes can be attached, detached, and moved to another instance, which is why data you care about belongs on one rather than on the root disk. Lesson 04 goes into storage properly.

**Network placement.** Which private network and which subnet the instance's interface lives in, whether it gets a public address, and which security groups apply. Lesson 03 owns all of this. For now: put it somewhere you can reach it, and know that "somewhere you can reach it" is a design decision you are about to learn to make properly.

**Access.** An SSH key pair for Linux, or a Windows administrator credential. You provide the public key at creation; the private key stays with you and the provider never has it. If you lose it, you do not recover the machine — you rebuild it. Modern platforms also offer an agent-based session service that brokers a shell through the provider's control plane, which avoids exposing a management port to the internet at all. Prefer it where it exists.

**Identity.** An instance can be given a role that grants it API permissions without any credential being stored on it. This is the single most important security habit in cloud compute: an application on the instance requests a short-lived token from the instance metadata service, and there is never a long-lived key on disk to be stolen. Never paste an access key into a configuration file on a virtual machine.

**Tags.** Key-value labels. Tag every instance with at least an owner, an environment, and a purpose. This feels like paperwork on day one and becomes the only way to answer "whose is this and can we delete it?" on day two hundred.

**Start-up configuration.** A script or configuration document the instance runs on first boot. `cloud-init` is the vendor-neutral standard and every major provider's Linux images support it — which makes it one of the few pieces of provisioning you can write once and use anywhere:

```yaml
#cloud-config
package_update: true
packages:
  - nginx
  - unzip
write_files:
  - path: /var/www/html/index.html
    content: |
      <h1>ticketing app placeholder</h1>
runcmd:
  - systemctl enable --now nginx
```

Paste that into the user-data field on any provider and a freshly booted instance serves a page. Keep boot scripts short and idempotent. Anything longer than about thirty lines is a sign the work belongs in a pre-built image or a configuration management tool instead.

Here is the same provisioning done from a command line. This example is the AWS CLI, named explicitly because the flags are vendor-specific:

```bash
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.small \
  --key-name support-eng-key \
  --subnet-id subnet-0123456789abcdef0 \
  --security-group-ids sg-0123456789abcdef0 \
  --user-data file://cloud-init.yaml \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ticketing-app},{Key=env,Value=dev}]'
```

The equivalent on Azure is `az vm create` with `--image`, `--size`, `--admin-username`, `--vnet-name`, and `--custom-data`; on Google Cloud it is `gcloud compute instances create` with `--image-family`, `--machine-type`, `--subnet`, and `--metadata-from-file user-data=`. Same seven decisions, three spellings. When you meet a fourth cloud, look for the seven.

Notice what this command is not: repeatable in any useful sense. It is a shell line in somebody's history with three opaque identifiers in it. Remember that feeling — it is the entire motivation for lesson 05.

## Managing the instance after it exists

**Connecting.** For Linux, SSH with the private key that matches the public key you supplied:

```bash
ssh -i ~/.ssh/support-eng-key.pem ubuntu@203.0.113.24
```

The default username comes from the image, not from you — `ubuntu`, `ec2-user`, `admin`, and `azureuser` are all common, and "permission denied (publickey)" is far more often a wrong username than a wrong key. Never permit password authentication, and never share a private key between people; give each person their own.

**Lifecycle states, and what each one costs.** Every provider has some version of the same five:

- *Running* — you pay for compute and storage.
- *Stopped* — the machine is shut down, the root volume persists, you pay for storage but not compute. Public addresses that were not explicitly reserved are usually lost and a new one is assigned at next start. Stopping non-production instances outside working hours is often the fastest cost win available to you.
- *Rebooted* — an operating-system restart, same machine, same disks, same addresses.
- *Terminated* (or *deleted*) — gone. Volumes marked delete-on-termination go with it. There is no undo.
- *Hibernated*, on some platforms — memory contents written to disk and restored on start, so the application resumes rather than starting cold.

**Backing up and rebuilding.** A *snapshot* is a point-in-time copy of a volume. An *image* is a bootable template, usually built from a snapshot of a root volume. The two operations you should be able to perform without hesitating are: take a snapshot before any risky change, and build an image from a working instance so a replacement can be launched from it. Snapshots are also how you move a machine between zones — snapshot the volume, create a volume from the snapshot in the target zone, attach it to a new instance there.

**Patching and configuration.** An instance is a computer and it needs the same care as any other: security updates applied, a supported operating system version, and a known configuration. There are two philosophies and you should be able to name both. *Mutable* infrastructure updates the running machine in place, typically with a patch service or a configuration management tool. *Immutable* infrastructure never patches anything — it builds a new image with the update in it, launches new instances from that image, moves traffic, and destroys the old ones. Immutable is the direction the industry has moved because it produces machines whose state you can predict from their image id. It also depends on being able to recreate an instance on demand, which is exactly what lessons 05 and 06 give you.

**Watching cost.** Three habits, in order of how much money they save: stop what is not being used, right-size what is oversized, and commit to a discount plan for what is genuinely steady-state. All three require tags, because you cannot attribute a cost you cannot label.

**Cleaning up.** Terminating an instance rarely removes everything. Detached volumes, snapshots, reserved public addresses, and images all outlive the machine and all keep billing. Make a habit of checking for orphans after any teardown; a customer's "why is this account still costing money after we shut everything down" ticket is almost always one of those four.

## Practice

Provision, manage, and dispose of one virtual machine sized against a stated workload. Use whichever cloud provider your programme has given you access to; do the work in a non-production account and stay inside any free tier limits you have been given.

The stated workload: an internal document-conversion service. Twelve staff use it, peak concurrency is four simultaneous conversions, each conversion needs about 700 MB of memory and one core for roughly forty seconds, and the service is idle overnight and at weekends. No data is stored on the machine.

1. Write your sizing decision **before** you open the console: family, vCPU count, memory, and one sentence per choice tying it to a number in the workload description. State explicitly whether you chose a burstable type and why the credit model does or does not suit this pattern.
2. Create an SSH key pair and confirm the private key is stored with permissions no wider than `600`. Do not reuse a key you already use elsewhere.
3. Write a `cloud-init.yaml` that updates packages, installs a web server, and writes a placeholder page identifying the machine's purpose.
4. Provision the instance from the command line rather than the console, with your chosen type, your key, your cloud-init file, and tags for owner, environment, and purpose. Save the exact command you ran.
5. Connect over SSH. Confirm from inside the machine that the CPU count and memory match what you ordered — `nproc` and `free -h` on Linux. If they do not, work out why before continuing.
6. Verify the boot script ran by requesting your placeholder page, and find the cloud-init log on disk to see what it did.
7. Attach a second data volume of at least 5 GB, format and mount it, write a file to it, then unmount and detach it. Reattach it and confirm the file is still there.
8. Take a snapshot of that data volume and record how long it took and what it will cost per month.
9. Stop the instance. Record what changed: is the public address the same on restart, is the data on the root volume still there, and what are you still being billed for while it is stopped. Start it again and confirm your findings.
10. Build an image from the instance, launch a second instance from that image with no cloud-init at all, and confirm the placeholder page is already there. This is immutable infrastructure in miniature.
11. Resize the original instance one size up, start it, and confirm the new CPU and memory from inside the machine. Note the total downtime.
12. Terminate both instances. Then audit the account for what survived — volumes, snapshots, images, reserved addresses — and delete anything you no longer need. List what you found.
13. Write a short handover note, no more than 250 words, of the kind you would attach to a customer ticket: the workload as stated, the size you chose and why, what you would measure before revisiting the choice, and the cost of leaving the instance running around the clock versus stopping it outside working hours.

**Deliverable:** the sizing note, your `cloud-init.yaml`, the provisioning command, the results of steps 9 through 12 including the orphan audit, and the handover note.
