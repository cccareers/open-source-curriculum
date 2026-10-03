---
course_id: net260
project_id: net260-x02
title: "clinic-app Gate Harness: Prove Every Pipeline Gate Fails, Automatically"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - net260-09
  - net260-06
  - net260-12
objectives:
  - Insert automated security checks into a delivery pipeline at the stage where each is effective
  - Harden cloud compute and container workloads against the misconfigurations that cause most cloud incidents
competency_ids:
  - D6-S1-C04
  - D6-S1-C01
---

## Scenario

Lesson 09 says: "A gate you have never seen fail is a gate you cannot trust." Project 12 asks you to prove that once by hand. The clinic platform team wants something better, a **harness** that proves it on every change to the gate configuration. It starts from a clean copy of the `clinic-app` repository and checks that every gate passes. Then it injects one known defect at a time and checks that the right gate, and only that gate, fails. If someone "tunes" a gate into uselessness next quarter, the harness goes red.

Everything runs **locally in containers**. You need no cloud account and no CI service, so you can do this before you build your project 12 pipeline and then reuse the same gates in it.

## Scope and authorization

- All scanning targets are files and images **you create on your own machine**. No scanner is pointed at any remote host, registry, or account.
- The "leaked credential" defect is a **randomly generated fake** in AWS key format, created at run time inside a temporary directory and never committed. Never use a real credential as test data, even an expired one.
- The vulnerable dependency defect pins a library version with a published, fixed CVE (PyYAML 5.3.1, CVE-2020-14343, fixed in 5.4). It is never executed, only scanned.

## What you will build / produce

1. A fixture repository, `clinic-app/`, containing a tiny Flask app, `requirements.txt`, a non-root `Dockerfile`, and `infrastructure/network.tf` with one security group in the lesson 04 style.
2. `gates.yaml`: the written blocking rule for each gate, as lesson 09's "What exactly fails the build?" requires.
3. `prove_gates.py`: the harness below, passing.
4. A gate evidence table (defect, gate that caught it, exact developer-facing message, time to feedback), the same shape as project 12's D2.

## Before you start

- Lessons 06 ("Runtime configuration", "Registry scanning") and 09 ("The checks, one at a time", "Failing well").
- Docker, Python 3.9+, and network access to pull these images once: `ghcr.io/gitleaks/gitleaks`, `aquasec/trivy`, `bridgecrew/checkov`. **Pin each image by digest in `gates.yaml`** once you have pulled it. This is lesson 09's pinning argument applied to your own tooling.

### Fixture files

`clinic-app/app.py`:

```python
from flask import Flask
app = Flask(__name__)
@app.get("/health")
def health():
    return {"status": "ok"}
```

`clinic-app/requirements.txt` (clean; pin current fixed versions when you build it, and re-baseline if a new CVE appears, which is lesson 06's "the world changed" case):

```text
flask==3.0.3
pyyaml==6.0.2
```

`clinic-app/Dockerfile`:

```dockerfile
FROM python:3.12-slim
RUN useradd --uid 10001 --create-home --shell /usr/sbin/nologin appuser
WORKDIR /app
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=appuser:appuser app.py .
USER 10001
CMD ["python", "-m", "flask", "--app", "app", "run", "--host", "0.0.0.0", "--port", "8080"]
```

(Pin `FROM` by digest after your first pull, as lesson 06 requires.)

`clinic-app/infrastructure/network.tf`:

```hcl
resource "aws_security_group" "app" {
  name        = "clinic-app"
  description = "Application tier"
  vpc_id      = "vpc-00000000000000000"
}

resource "aws_vpc_security_group_ingress_rule" "app_from_lb" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = "sg-00000000000000000"
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
  description                  = "Only the load balancer may reach the app"
}
```

### `gates.yaml` (complete the rules and digests)

```yaml
secrets:
  tool: gitleaks
  blocks_on: "any finding; output redacted"
sca:
  tool: trivy fs
  blocks_on: "CRITICAL or HIGH with a fixed version available"
iac:
  tool: checkov
  blocks_on: "CKV_AWS_24 (22 open to 0.0.0.0/0), CKV_AWS_25 (3389 open to 0.0.0.0/0)"
image_user:
  tool: docker inspect
  blocks_on: "image config User is empty, 0, or root"
```

## The harness

`prove_gates.py` copies the fixture to a temporary directory for each scenario, applies the defect, runs all four gates, and asserts which ones fail. Adjust the image names to the digests you pinned.

```python
#!/usr/bin/env python3
import os, random, shutil, string, subprocess, sys, tempfile, time
FIXTURE = os.path.abspath("clinic-app")
IMG = {"gitleaks": "ghcr.io/gitleaks/gitleaks:latest",   # pin by digest
       "trivy": "aquasec/trivy:latest",                    # pin by digest
       "checkov": "bridgecrew/checkov:latest"}             # pin by digest

def run(cmd):
    t = time.time(); p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, round(time.time() - t, 1), (p.stdout + p.stderr)[-400:]

def gate_secrets(d):
    return run(["docker", "run", "--rm", "-v", f"{d}:/src", IMG["gitleaks"],
                "detect", "--no-git", "--source", "/src", "--redact", "--exit-code", "1"])
def gate_sca(d):
    return run(["docker", "run", "--rm", "-v", f"{d}:/src", IMG["trivy"], "fs", "--scanners", "vuln",
                "--severity", "CRITICAL,HIGH", "--ignore-unfixed", "--exit-code", "1", "/src"])
def gate_iac(d):
    return run(["docker", "run", "--rm", "-v", f"{d}:/src", IMG["checkov"], "-d", "/src/infrastructure",
                "--framework", "terraform", "--check", "CKV_AWS_24,CKV_AWS_25", "--compact", "--quiet"])
def gate_image_user(d):
    tag = "clinic-app-harness:" + os.path.basename(d).lower()
    rc, t, out = run(["docker", "build", "-q", "-t", tag, d])
    if rc: return rc, t, "build failed: " + out
    rc, t2, user = run(["docker", "inspect", "--format", "{{.Config.User}}", tag])
    uid = user.strip().split(":", 1)[0].strip()   # USER may be uid[:gid]; only the uid decides root
    bad = uid == "" or uid.lower() == "root" or (uid.isdigit() and int(uid) == 0)
    return (1 if bad else 0), t + t2, f"image user={user.strip()!r}"

GATES = {"secrets": gate_secrets, "sca": gate_sca, "iac": gate_iac, "image_user": gate_image_user}

def fake_aws_key():
    rnd = lambda n, a: "".join(random.choice(a) for _ in range(n))
    return ("AKIA" + rnd(16, string.ascii_uppercase + string.digits),
            rnd(40, string.ascii_letters + string.digits + "+/"))

def inject_secret(d):
    kid, sec = fake_aws_key()
    open(f"{d}/settings.py", "w").write(f'AWS_ACCESS_KEY_ID = "{kid}"\nAWS_SECRET_ACCESS_KEY = "{sec}"\n')
def inject_vuln_dep(d):
    open(f"{d}/requirements.txt", "a").write("pyyaml==5.3.1\n")
    s = open(f"{d}/requirements.txt").read().replace("pyyaml==6.0.2\n", ""); open(f"{d}/requirements.txt", "w").write(s)
def inject_open_ssh(d):
    open(f"{d}/infrastructure/ssh.tf", "w").write(
        'resource "aws_security_group" "bad" {\n  name = "bad"\n  description = "defect"\n'
        '  ingress {\n    from_port = 22\n    to_port = 22\n    protocol = "tcp"\n'
        '    cidr_blocks = ["0.0.0.0/0"]\n    description = "defect"\n  }\n}\n')
def inject_root_image(d):
    s = open(f"{d}/Dockerfile").read().replace("USER 10001\n", ""); open(f"{d}/Dockerfile", "w").write(s)

SCENARIOS = [("clean", None, set()),
             ("leaked credential", inject_secret, {"secrets"}),
             ("vulnerable dependency", inject_vuln_dep, {"sca"}),
             ("ssh open to the internet", inject_open_ssh, {"iac"}),
             ("container runs as root", inject_root_image, {"image_user"})]

failures = 0
print(f"{'scenario':28} {'gate':11} {'expect':7} {'got':5} {'secs':>5}  detail")
for name, inject, expect_fail in SCENARIOS:
    d = tempfile.mkdtemp(prefix="gate-"); shutil.copytree(FIXTURE, d, dirs_exist_ok=True)
    if inject: inject(d)
    for gate, fn in GATES.items():
        rc, secs, out = fn(d)
        want = "FAIL" if gate in expect_fail else "PASS"; got = "FAIL" if rc else "PASS"
        ok = want == got; failures += not ok
        print(f"{name:28} {gate:11} {want:7} {got:5} {secs:5}  {'' if ok else 'MISMATCH: ' + out.splitlines()[-1] if out else ''}")
    shutil.rmtree(d, ignore_errors=True)
print("\nALL GATES PROVEN" if not failures else f"\n{failures} MISMATCH(ES)"); sys.exit(1 if failures else 0)
```

The **clean** scenario matters as much as the defects. A gate that fails a clean repository will be disabled within a month (lesson 09, "Failing well"). If `clean` fails on `sca` because a new CVE was published against Flask, you have just watched the "continuous re-scan" case from lesson 06 happen. Update the pin, record it, and re-run.

## Milestones

1. **Fixture and clean run (1.5 h).** Create the fixture, pull and pin the three images, and get the `clean` scenario passing all four gates.
2. **Defects (1.5 h).** Run the full harness. For each MISMATCH, decide whether the gate rule or the injection is wrong. Fix the one that is wrong, and write down which it was.
3. **Read the messages (1 h).** For each defect, capture the exact developer-facing message. Ask whether a developer could fix the problem from that message alone. If not, write the wrapper message you would add (lesson 09, Exercise 4: "tell them how to fix it, not just what is wrong").
4. **Wire it in (1 h).** Add the harness as a job that runs whenever `gates.yaml` or the pipeline definition changes. A local Git pre-push hook is fine if you have no CI yet.
5. **Write up (1 h).** Gate evidence table, plus a paragraph on which classes from lesson 08 none of these gates can catch.

## Acceptance criteria

- [ ] `python3 prove_gates.py` prints `ALL GATES PROVEN`. Every defect fails exactly its own gate, and the clean scenario passes all four.
- [ ] All three tool images are pinned by digest in both `gates.yaml` and the harness.
- [ ] Gitleaks output is redacted. Check that the harness output does not contain the generated key.
- [ ] The evidence table lists each defect, the gate that caught it, the exact message, and time to feedback. If the commit-stage gates together take more than about five minutes, say what you would move later.
- [ ] The write-up names at least two lesson 08 classes no gate here can catch (for example broken access control and business-logic flaws) and the human control that covers them.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Gate rules | Thresholds scattered in commands | Rules written in `gates.yaml` and matched by the harness | The harness reads `gates.yaml` instead of duplicating it |
| Precision | Clean scenario fails one or more gates | Clean passes; each defect fails only its gate | Adds a "near miss" scenario (for example 22 open to `10.0.0.0/8`) that must pass |
| Supply chain | Tools pulled by `latest` | Tools pinned by digest | Image signature verification added as a fifth gate with a local registry and cosign key pair |
| Developer experience | Raw tool output only | Messages captured and assessed | Wrapper messages with fix instructions for each gate |
| Honesty | Claims full coverage | Names classes no gate catches | Maps each lesson 08 class to the gate or human control that covers it |

## Stretch goals

- Add a fifth gate for **signature verification**: run a local `registry:2` on `localhost:5000`, sign with `cosign sign --key`, verify with `cosign verify --key`, and add an "unsigned image" scenario.
- Add a custom policy-as-code gate (lesson 09, "write policies for your own organization's rules") with its own passing and failing fixture.
- Run the harness weekly with no code changes, and log the date when the clean scenario first fails because of a newly published CVE.

## Reflection prompts

1. Which gate was easiest to make pass on a defect by accident (a false negative), and how did the harness catch it?
2. The harness proves that each gate fails on one known defect. What does it *not* prove about that gate?
3. Who should own this harness: the security team or the platform team? Defend your answer using lesson 09's "Who fixes the finding?"

## Instructor notes

- **Verified while drafting (2026-10-02):** the harness ran end to end on Docker Desktop (macOS) and printed `ALL GATES PROVEN`. All 20 scenario/gate checks behaved as expected; the clean scenario's slowest gate (trivy) took about 15 s, including the database download. The images were the `latest` tags at that time: gitleaks `sha256:c00b6bd0…`, trivy `sha256:af6acf9a…`, checkov `sha256:617c76e3…`. Tool CLIs change, so re-run before each cohort. Newer gitleaks releases also offer `git` and `dir` subcommands alongside `detect`, so confirm which one your pinned version expects. Also re-confirm the checkov check IDs `CKV_AWS_24` and `CKV_AWS_25` should be re-confirmed.
- Gitleaks allowlists the documentation example key `AKIAIOSFODNN7EXAMPLE`. That is why the harness generates a random fake instead.
- Shorter version (3 h): provide the fixture and harness, and have learners write only `gates.yaml`, the evidence table, and the coverage paragraph.
