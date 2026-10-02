---
lesson_id: net260-06
course_id: net260
pathway: cybersecurity-support-technician
title: Workload and Container Hardening
order: 6
kind: lesson
competency_ids:
  - D6-S1-C01
objectives:
  - Harden cloud compute and container workloads against the misconfigurations
    that cause most cloud incidents
---

## The environment is safe enough to build in

Identity is scoped, the network is isolated, the data has a key. Now you put something in it: virtual machines, container images, serverless functions. This lesson is about hardening those workloads, and the framing is deliberately narrow — you are hardening against *misconfiguration*, because misconfiguration, not exploitation, is what causes the overwhelming majority of cloud incidents.

That is worth sitting with. The endpoint hardening you did in cyb210 was largely about defending a machine against malicious software: agents, patching, detection, response. All of that still applies to a cloud VM and none of it is repeated here. What is different in the cloud is a category of defect that has no on-premises equivalent, because on-premises a server does not come with an ambient identity that can call an API to delete a database.

The three defects that recur, in every environment, at every provider:

1. **An over-permissive workload identity.** The instance or container runs as something that can do far more than the application needs, so compromising the application compromises the account.
2. **Reachable metadata or credential endpoints.** The workload can retrieve its own credentials over a local HTTP endpoint, and so can anything that can make the workload issue a request on its behalf.
3. **Unpatched, unprovenanced, over-privileged images.** A container built from a base image nobody has updated in a year, running as root, with more capability than it needs.

Everything below is those three, in detail, plus the process that keeps them fixed.

Kubernetes cluster administration — control plane configuration, admission controllers, network policy objects, RBAC design — is named here and deliberately left out. It is a substantial discipline and this course does not have room to teach it honestly. What you *will* learn is what travels with the workload wherever it runs: the image, its provenance, its scan results, and its runtime configuration.

## Hardening a cloud virtual machine

Start with the ordinary case, because a lot of "cloud" is still a VM someone launched.

### The image it came from

A virtual machine is only as good as the image it was launched from. Three rules:

**Use a trusted image source.** A provider-published or vendor-published image, or one your organization built. Community and marketplace images from unverified publishers are an unvetted supply chain running with your identity attached. If a marketplace image is genuinely required, the publisher's identity and the image's update cadence belong in your record.

**Prefer minimal.** A minimal base image has fewer packages, which means fewer vulnerabilities to track, less attack surface, and fewer things to patch. Removing the compiler, the package manager, and the shell from a production host is not paranoia; it is a meaningful reduction in what an attacker can do after landing.

**Build golden images rather than patching in place.** A pipeline builds an image with current patches, your hardening baseline, and your agents; instances are replaced from the new image rather than upgraded. This is *immutable infrastructure* and it is the pattern the rest of this course assumes. The security value is that configuration drift stops accumulating: you know what is running because you know which image it came from, and the answer is not "whatever it has become since 2023."

### Patching, which is still yours

Say it again from lesson 02: on IaaS, the guest OS is yours. Every provider gives you a patch management service that inventories, schedules, and reports. Use it, and — the part that matters for audit — configure it to *report compliance*, so you can answer "what percentage of production instances are missing a critical patch" without SSHing anywhere.

Under immutable infrastructure, "patching" becomes "rebuild and redeploy," which is faster and more reliable, and it converts a patch backlog into an image-age metric. "No production image is more than 30 days old" is a policy you can actually verify.

### The identity attached to it

This is where lesson 03 attaches to lesson 06. A VM usually has an instance role, managed identity, or attached service account, and the application inside it inherits that identity automatically. If that identity can read every bucket in the account, then a file-read vulnerability in the application reads every bucket in the account.

So: one identity per workload, scoped to that workload's actual resources, verified against usage. Never reuse a role across services because it is convenient, and never attach an administrative role to an instance "temporarily."

### The metadata endpoint, specifically

Every cloud VM can query a link-local metadata endpoint — the well-known `169.254.169.254` address — to retrieve information about itself, including short-lived credentials for its attached identity. This is how workload identity works, and it is good.

It is also the mechanism behind one of the most consequential attack chains in cloud security. If an application is vulnerable to server-side request forgery — you will meet SSRF properly in lesson 08 — an attacker gets the application to fetch a URL of their choosing, points it at the metadata endpoint, and receives the workload's credentials in the response. No code execution required. From there the attacker holds a valid cloud credential and everything you did in lesson 03 decides how bad it gets.

The mitigations, and you should be able to check all four:

- **Require the modern, session-oriented metadata protocol** and disable the legacy one. AWS calls this IMDSv2 and it requires a `PUT` to obtain a token before any read, which a simple forged `GET` cannot perform. Azure and Google Cloud require a specific header on metadata requests for the same reason. Enforce it at the account or organization level so new instances cannot opt out.
- **Set the metadata response hop limit to 1** where the provider allows it, so a container on the host cannot reach the host's metadata service through a network hop.
- **Give containers their own identity** rather than letting them inherit the node's. A container that borrows the node identity gets the node's permissions, which are usually broader.
- **Block egress to the metadata address** from any process that has no business calling it.

### Everything else, briefly

Disk encryption on with the key you chose in lesson 05. No public IP unless the workload genuinely needs one. No public SSH or RDP; use the managed session service from lesson 04. Host logging and your endpoint agent installed by the image, not by hand. Deletion protection on anything whose loss would be an incident.

## Containers: what actually changes

A container is a process on a host with a restricted view of the filesystem, network, and process table. It is isolation, not a security boundary of the strength of a virtual machine. The practical implication is that container hardening is mostly about two things: **what is in the image** and **what the runtime is allowed to do**.

### Image provenance

Provenance is the chain of answers to "where did this image come from, and can I prove it."

**Pin the base image by digest, not by tag.** A tag is a mutable pointer. `FROM python:3.12-slim` today and next month are different images, which means your build is not reproducible and a compromised or simply changed upstream tag flows into production silently.

```dockerfile
FROM python:3.12-slim@sha256:0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9
```

That digest is content-addressed. It can only ever refer to those exact bytes.

**Know your base image's provenance.** Official images from the language or distribution project, or images your organization builds. `FROM someuser/python-fast:latest` pulled from a public registry is code from a stranger running with your workload identity.

**Sign your images and verify signatures before deployment.** Signing produces a cryptographic assertion that this image came out of your build pipeline; verifying at deploy time means an image that did not come from your pipeline cannot run. This is the control that stops an attacker who obtains registry push credentials from simply publishing a malicious image under your name.

**Generate a software bill of materials at build time.** An SBOM lists every component and version in the image. Its value is speed on the day a critical vulnerability is announced: "which of our 140 images contains this library" becomes a query rather than a week of investigation. Store it as a build artifact next to the image.

### Registry scanning

A container image is a filesystem full of packages, and packages have known vulnerabilities. Registry scanning compares the image contents against vulnerability databases. Every provider has one built into its registry; several good third-party scanners exist.

Scan at three points and understand why each is different:

```text
BUILD    Scan in the pipeline before push. Fastest feedback, and the only
         point where you can stop a bad image from existing. Fail the build
         on critical findings in the layers you control.

PUSH     Scan on entry to the registry. Catches anything pushed outside the
         pipeline, which should be nothing, which is exactly why you check.

CONTINUOUS  Re-scan images already in the registry, on a schedule. This is
         the one people skip and the one that matters most: an image that
         was clean at build time becomes vulnerable the day a CVE is
         published against a library it contains. Nothing about the image
         changed; the world did.
```

Then the part that turns scanning into security: **have a policy for what a finding means.** A scanner that reports 400 vulnerabilities on every image and blocks nothing trains people to ignore it. A workable policy is specific about severity, exploitability, reachability, and time:

```yaml
image_policy:
  block_deploy_if:
    - severity: CRITICAL
      fixed_version_available: true
    - severity: HIGH
      fixed_version_available: true
      exposure: internet-facing
    - unsigned: true
    - base_image_age_days: ">90"
  warn_if:
    - severity: HIGH
      fixed_version_available: false
  remediation_sla:
    critical: 7d
    high: 30d
    medium: 90d
  exception:
    requires: named owner, compensating control, expiry date
    max_duration: 90d
```

Two ideas in there are worth naming. **"Fixed version available" is the fairest gate** — blocking on a vulnerability with no available fix punishes a team for something they cannot do anything about, and the result is that they disable the gate. **Exceptions must expire.** A permanent exception is a decision to accept a risk forever, made by whoever was in a hurry that day.

### Runtime configuration

Now the image is trustworthy. What is the runtime allowed to do? These are the settings that decide whether a compromised container is contained or is a foothold on the host.

```yaml
# Provider-neutral runtime intent. Every orchestrator expresses these.
runAsNonRoot: true
runAsUser: 10001
readOnlyRootFilesystem: true
allowPrivilegeEscalation: false
privileged: false
capabilities:
  drop: ["ALL"]
  add: []            # add back only what is proven necessary, by name
hostNetwork: false
hostPID: false
hostIPC: false
volumes:
  - name: tmp
    emptyDir: {}     # writable scratch, since the root filesystem is read-only
resources:
  limits: { cpu: "500m", memory: "512Mi" }
```

What each one buys you:

**`runAsNonRoot` / `runAsUser`.** Root inside a container is, by default, root as far as several host-visible operations are concerned. Running as an unprivileged UID means a container escape starts from a much weaker position. Set the user in the image so nobody has to remember at deploy time:

```dockerfile
FROM python:3.12-slim@sha256:0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9
RUN useradd --uid 10001 --create-home --shell /usr/sbin/nologin appuser
WORKDIR /app
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=appuser:appuser . .
USER 10001
EXPOSE 8080
CMD ["python", "-m", "app"]
```

**`readOnlyRootFilesystem`.** Most compromise chains need to write something — a payload, a script, a modified binary. A read-only root filesystem breaks that step and costs almost nothing, since applications that need scratch space get a mounted writable volume.

**`allowPrivilegeEscalation: false` and dropping all capabilities.** Setuid binaries and Linux capabilities are the escalation path from an unprivileged container process to something more. Drop everything, add back only what is proven necessary. Most web applications need nothing.

**`privileged: false`.** A privileged container is, functionally, root on the host. There are legitimate uses — some monitoring agents, some storage drivers — and none of them is your application. Treat any privileged application container as a finding.

**No host namespaces.** `hostNetwork`, `hostPID`, and `hostIPC` each punch a hole in the isolation: host network sees the host's interfaces *and its metadata endpoint*, host PID sees and can signal every process on the machine.

**Resource limits.** A container with no memory limit can take down the host and every other workload on it. This is an availability control, but denial of service is a security outcome.

**Secrets are not environment variables in the image.** A secret baked into an image is in the registry, in every layer cache, and in every developer's laptop that pulled it. Secrets come from the platform's secret store at runtime, fetched with the workload identity. This is the same argument as lesson 03's static keys, one level up.

### The container's own identity

Same principle, one more time, because it is the most common serious finding in container environments: give each workload its own identity, scoped to what it needs. A container that inherits the node's identity gets the node's permissions, and node identities tend to be broad because they have to do infrastructure things. Every provider supports per-workload identity federation for containers; use it.

## Serverless, briefly

Functions remove the OS and the runtime from your responsibility and leave four things:

- **The execution role.** The single most important setting. Functions are small, so their permission needs are usually tiny and precisely knowable — which makes them the easiest place in your environment to achieve genuine least privilege, and an embarrassing place to fail at it.
- **Dependencies.** Your function's package includes libraries. They need the same scanning and the same currency as a container image.
- **Trigger configuration.** What may invoke this function? An open trigger is an unauthenticated entry point to whatever the execution role can do.
- **Secrets and environment variables.** Function environment variables are visible to anyone who can read the function's configuration. Sensitive values belong in the secret store, referenced.

## Verifying it, at scale

You cannot check these settings by hand across a real environment, and you should not try. Two mechanisms do the work.

**Posture management.** Every provider has a service that continuously evaluates resources against a benchmark and reports deviations — and third-party posture tools do the same across providers. The benchmark is usually a CIS Benchmark or the provider's own security recommendations, and it encodes exactly the checks in this lesson: public IPs, legacy metadata service enabled, unencrypted disks, privileged containers, unscanned images.

**Preventive policy.** Better than detecting a bad configuration is making it impossible. A policy engine that rejects a non-conforming resource at creation time — provider policy services, or a policy check in your pipeline, which is lesson 09 — converts a recurring finding into a structural impossibility.

The reporting artifact, which is what your role actually produces:

```text
WORKLOAD HARDENING REVIEW — clinic-prod
Reviewer: A. Nkemelu    Date: 2026-07-21
Authorization: SEC-2210, Platform Lead. Own lab/sandbox account only.
Baseline: CIS Benchmark for the provider, level 1, plus internal image policy.
Population: 6 VM instances, 11 container workloads, 4 functions.

F1 CRITICAL  Container "reporting-worker" runs privileged with hostPID true.
             Effect: container escape is host root; can read every other
             workload's memory and the node identity's credentials.
             Origin: added 8 months ago to let it read host disk metrics.
             Fix: remove privileged and hostPID; use the provider's node
             metrics agent instead. Owner: App Lead. Target: 7 days.
             Verify: re-run posture scan; expect zero privileged workloads.

F2 CRITICAL  3 VM instances allow the legacy metadata service.
             Effect: an SSRF anywhere in those apps yields cloud credentials.
             Fix: enforce token-required metadata; set hop limit 1; add an
             org policy denying instance creation with legacy metadata.
             Owner: Platform Lead. Target: 5 days.

F3 HIGH      Base image for 7 of 11 workloads is 14 months old; 9 critical
             CVEs with fixes available. No continuous registry scanning.
             Fix: rebuild from current digest-pinned base; enable scheduled
             re-scan; adopt image policy with 7d critical SLA.
             Owner: App Lead. Target: 14 days.

F4 HIGH      4 containers run as root (no USER in Dockerfile).
             Fix: add non-root USER to each image; set runAsNonRoot in the
             deployment. Owner: App Lead. Target: 14 days.

F5 MEDIUM    Function "notify-sms" execution role holds account-wide storage
             read; observed use is one bucket prefix.
             Fix: narrow per lesson 03 method. Owner: Platform. Target: 30 days.

F6 MEDIUM    Images are pushed by tag; no signing, no signature verification
             at deploy. Registry push credential is a static key.
             Fix: sign in pipeline, verify at deploy, replace push credential
             with federated identity. Owner: Platform. Target: 30 days.

ACCEPTED  Monitoring agent daemon runs privileged. Vendor requirement.
          Compensating: dedicated node pool, image signature verified,
          alert on any exec into the container. Accepted: D. Whitfield.
          Expires 2026-10-21.
```

## Practice

All work is performed in your own lab or sandbox account or against an instructor-provided target, with written authorization confirmed before you begin. Do not scan, probe, or attempt configuration changes anywhere else.

**Exercise 1 — Harden a Dockerfile.**

You are given this image definition. Rewrite it, then list every change you made with the specific risk each one removes.

```dockerfile
FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 python3-pip curl git build-essential
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
ENV DB_PASSWORD=Sup3rSecret!
EXPOSE 8080
CMD ["python3", "app.py"]
```

There are at least seven distinct defects. Your rewrite must pin the base image by digest, run as a non-root user, remove build tooling from the final image, and handle the credential correctly. Explain in one sentence why simply deleting the `ENV` line does not remove the secret from an image that has already been built and pushed.

**Exercise 2 — Write the runtime configuration.**

For the hardened image from Exercise 1, write the runtime configuration as a fenced YAML block covering user, root filesystem, privilege escalation, capabilities, host namespaces, resource limits, and how the database password is supplied at runtime. Then state which single setting you would remove first if the application genuinely could not start, and what compensating control you would add in its place.

**Exercise 3 — Close the metadata path.**

In your lab, launch an instance with the legacy metadata service permitted. From inside the instance, retrieve the workload credentials with a single unauthenticated request and record the exact request and the shape of the response (redact the values). Then enforce the token-required metadata protocol, set the hop limit, and repeat the request to show it fails. Write the three-sentence explanation you would give a developer about why this matters, connecting it to a server-side request forgery vulnerability in their application.

**Exercise 4 — Write and defend an image policy.**

Draft the image policy for the clinic environment as a fenced YAML block: block conditions, warn conditions, remediation SLAs by severity, and the exception process with its maximum duration. Then answer the two objections you will actually receive. A developer says the policy will block every deployment; a manager says a 7-day critical SLA is unrealistic. Give a specific, non-defensive response to each that does not involve weakening the policy to nothing.

**Exercise 5 — Run the review.**

Against your lab environment, run the provider's posture management service (or an equivalent benchmark scan) plus a registry scan of at least two images. Produce a Workload Hardening Review in the format above with at least five findings covering both VM and container workloads. Each finding needs severity, evidence, the effect stated as what an attacker gains, a specific fix, an owner, a target date, and a verification step. Include at least one accepted risk with compensating controls and an expiry date. Keep this artifact — project 11 builds directly on it.
