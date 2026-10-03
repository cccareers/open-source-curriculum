---
course_id: net110
project_id: net110-x01
title: "HR Application Segmentation Lab: Build the Chokepoint, Prove the Denies"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - net110-03
  - net110-04
  - net110-02
objectives:
  - Design a segmented network that places each asset in a zone matching its trust level
  - Write and order firewall rules that implement a stated access requirement without opening unintended paths
competency_ids:
  - D2-S1-C01
  - D1-S1-C05
---

## Scenario

Lesson 04's worked example turned a vague request — *"the new HR application needs to work"* — into four flows on the `10.20.<zone>.<host>` plan from lesson 03. On paper it is right. Your team lead wants it **proved**: a reproducible lab in which the HR application's zones exist, a single router container is the only chokepoint between them, and an automated check shows that every intended flow works **and** every adjacent unintended flow fails. The check will be re-run after every rule change, so it has to be scriptable, not a screenshot.

## Scope and authorization

- Everything runs as containers on **your own machine**, on private Docker networks using the lesson's RFC 1918 addresses. Nothing is exposed to your LAN or the internet (no published ports).
- The probe script only connects to containers you created. Do not point it, or any scanner, at a network you do not own or administer.
- If you adapt this to a school or employer lab, get written permission naming the hosts and the time window first.

## What you will build / produce

1. A four-zone lab (VPN, Users, Servers, Data) defined in `compose.yaml`, with one router container routing between them.
2. An `nftables` forward policy on the router implementing lesson 04's HR rule set: default drop, stateful return traffic, logged permits, nothing wider than the requirement.
3. A passing run of `verify.py`, which tests ten flows and prints PASS/FAIL per flow, including whether each block was a **drop** (timeout) or a **reject** (refused) — the lesson 02 distinction.
4. A one-page verification note (what was tested, what was observed, which path you did *not* test).

## Before you start

- Lessons 02 ("Three outcomes worth telling apart"), 03 ("Step 4 — Write the zone-to-zone matrix"), 04 ("From requirement to rules").
- Docker Engine or Docker Desktop with Compose v2; Python 3.9+ on the host.
- Starter files below. Every server listens on **every** port the tests use, so a blocked result can only come from the firewall, never from a closed port. That is deliberate: it is the only way "refused" and "timeout" tell you something about policy.

### Starter: `listener.py` (mounted into every server container)

```python
import socket, sys, threading
def serve(port):
    s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", port)); s.listen()
    while True:
        c, _ = s.accept(); c.sendall(b"ok\n"); c.close()
for p in map(int, sys.argv[1:]):
    threading.Thread(target=serve, args=(p,), daemon=True).start()
threading.Event().wait()
```

### Starter: `compose.yaml`

```yaml
x-host: &host
  image: python:3.12-alpine
  cap_add: [NET_ADMIN]
  volumes: ["./listener.py:/listener.py:ro"]
networks:
  vpn:     {ipam: {config: [{subnet: 10.20.20.0/24}]}}
  users:   {ipam: {config: [{subnet: 10.20.30.0/24}]}}
  servers: {ipam: {config: [{subnet: 10.20.40.0/24}]}}
  data:    {ipam: {config: [{subnet: 10.20.50.0/24}]}}
services:
  router:
    image: alpine:3.20
    cap_add: [NET_ADMIN]
    sysctls: {net.ipv4.ip_forward: "1"}
    volumes: ["./router.nft:/router.nft:ro"]
    command: sh -c "apk add --no-cache nftables >/dev/null && nft -f /router.nft && sleep infinity"
    networks:
      vpn: {ipv4_address: 10.20.20.254}
      users: {ipv4_address: 10.20.30.254}
      servers: {ipv4_address: 10.20.40.254}
      data: {ipv4_address: 10.20.50.254}
  hr-staff:   # an HR laptop
    <<: *host
    networks: {users: {ipv4_address: 10.20.30.41}}
    command: sh -c "ip route add 10.20.0.0/16 via 10.20.30.254; sleep infinity"
  vendor:     # vendor support session landing in the VPN zone
    <<: *host
    networks: {vpn: {ipv4_address: 10.20.20.15}}
    command: sh -c "ip route add 10.20.0.0/16 via 10.20.20.254; sleep infinity"
  hr-app:
    <<: *host
    networks: {servers: {ipv4_address: 10.20.40.22}}
    command: sh -c "ip route add 10.20.0.0/16 via 10.20.40.254; python3 /listener.py 22 443 8443"
  file-srv:
    <<: *host
    networks: {servers: {ipv4_address: 10.20.40.20}}
    command: sh -c "ip route add 10.20.0.0/16 via 10.20.40.254; python3 /listener.py 22 443 445"
  hr-db:
    <<: *host
    networks: {data: {ipv4_address: 10.20.50.11}}
    command: sh -c "ip route add 10.20.0.0/16 via 10.20.50.254; python3 /listener.py 22 5432"
```

The more-specific `10.20.0.0/16` route sends inter-zone traffic to the router, while the container's own subnet stays directly connected — so `hr-app` and `file-srv` can still reach each other without crossing the chokepoint, exactly like two hosts on one real VLAN (lesson 03, "Host-based firewalls").

### Starter: `router.nft` (you complete it)

```nft
flush ruleset
table inet fw {
  chain forward {
    type filter hook forward priority 0; policy drop;
    ct state established,related accept
    ct state invalid drop
    # TODO: one rule per permitted flow from lesson 04, each with a log prefix
    # TODO: decide drop vs reject for inside boundaries and write it explicitly
    log prefix "fw-default-deny " counter
  }
}
```

## Milestones

1. **Matrix first (45 min).** Write the four-zone matrix (VPN, Users, Servers, Data) for the HR requirement, every cell a permit or a dash, with a one-sentence justification per permit.
2. **Bring up the lab with the starter policy (30 min).** `docker compose up -d`. Run `verify.py`. Every ALLOW test should fail — the default drop is working. Keep this output; it is your "before" evidence.
3. **Write the rules (1.5 h).** Implement only the permits in your matrix. Reload with `docker compose exec router nft -f /router.nft`. Use `meta l4proto tcp` with `ip saddr`/`ip daddr`/`tcp dport` matches.
4. **Choose drop vs reject (30 min).** Lesson 04 recommends reject inside the network. Add `reject with tcp reset` for TCP traffic from Users and VPN before the final drop, or justify keeping silent drops. Re-run and confirm the block mode changed from `timeout` to `refused`.
5. **Break it on purpose (45 min).** Replace your users→hr-app rule with the "sloppy version" from lesson 04 (`10.20.30.0/24 -> 10.20.40.0/24 any`). Re-run `verify.py`, record which tests now fail, then restore. This is the evidence that the check catches widening.
6. **Read the logs (30 min).** `docker compose exec router dmesg | grep fw-` (or `nft monitor` in a second terminal while re-running `verify.py`). Show one permit log line and one default-deny line.
7. **Write the verification note (45 min).**

## Acceptance criteria

- [ ] `python3 verify.py` prints `ALL CHECKS PASSED`.
- [ ] No rule in `router.nft` uses a whole zone as a destination where a single host is required.
- [ ] No return-traffic rules; the note says why (stateful `ct state established,related`).
- [ ] Every permit carries a `log prefix` naming the flow and a comment with an owner/ticket; the vendor rule carries an expiry date in its comment.
- [ ] The note includes the "sloppy version" run showing at least three tests failing.
- [ ] The note names one path not tested (for example, IPv6, or `hr-app` to `file-srv` on the same subnet, which never crosses the router).

## Automated checks

`verify.py` runs a TCP connect probe *inside* each source container with `docker compose exec`, so the traffic genuinely originates in that zone.

```python
#!/usr/bin/env python3
import subprocess, sys
PROBE = ("import socket,sys\n"
         "s=socket.socket();s.settimeout(3)\n"
         "try:\n s.connect((sys.argv[1],int(sys.argv[2])));print('open')\n"
         "except ConnectionRefusedError: print('refused')\n"
         "except (socket.timeout, TimeoutError, OSError): print('timeout')\n")
# (source container, destination, port, expected, why)
TESTS = [
    ("hr-staff", "10.20.40.22", 443,  "ALLOW", "HR staff to HR app (rule 10)"),
    ("hr-staff", "10.20.40.22", 8443, "BLOCK", "same host, adjacent port"),
    ("hr-staff", "10.20.40.22", 22,   "BLOCK", "staff must not SSH to the app"),
    ("hr-staff", "10.20.40.20", 443,  "BLOCK", "adjacent host, same port"),
    ("hr-staff", "10.20.50.11", 5432, "BLOCK", "two hops, never one: no user to DB"),
    ("hr-app",   "10.20.50.11", 5432, "ALLOW", "app tier to DB (rule 20)"),
    ("hr-app",   "10.20.50.11", 22,   "BLOCK", "app tier gets DB port only"),
    ("vendor",   "10.20.40.22", 22,   "ALLOW", "vendor SSH to the one app server (rule 40)"),
    ("vendor",   "10.20.40.20", 22,   "BLOCK", "vendor must not reach other servers"),
    ("vendor",   "10.20.50.11", 5432, "BLOCK", "vendor must not reach data zone"),
]
fails = 0
for src, dst, port, want, why in TESTS:
    out = subprocess.run(["docker", "compose", "exec", "-T", src, "python3", "-c", PROBE, dst, str(port)],
                         capture_output=True, text=True).stdout.strip() or "error"
    ok = (out == "open") if want == "ALLOW" else (out in ("refused", "timeout"))
    mode = {"refused": "reject", "timeout": "drop"}.get(out, "")
    print(f"{'PASS' if ok else 'FAIL'}  {src:8} -> {dst}:{port:<5} expected {want:5} got {out:8} {mode:6} {why}")
    fails += not ok
print("\nALL CHECKS PASSED" if not fails else f"\n{fails} CHECK(S) FAILED"); sys.exit(1 if fails else 0)
```

A BLOCK test passes on either `refused` or `timeout`; the extra column tells you which mechanism produced it, so you can confirm your drop-versus-reject decision actually took effect.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Zone matrix | Cells missing or "any" permits | Complete, deny-by-default, justified | Adds a Mgmt zone row and a jump-host permit, with tests |
| Rule narrowness | Zone-wide destinations or port ranges | Single hosts and single ports per flow | Uses named sets (`define`) as objects, per lesson 04 |
| Verification | Allow cases only | All ten tests pass, including blocks | Adds tests of your own for every dash in the matrix that crosses the router |
| Drop vs reject | Not considered | Decision stated and observed | Different decisions per boundary, each justified |
| Evidence | Screenshots only | Script output, log lines, sloppy-run comparison | Hit counters (`nft list ruleset`) used to show which rules fired |

## Stretch goals

- Add a Management zone (`10.20.10.0/24`) with a jump host; permit SSH from the jump host only and add tests proving Users cannot reach it.
- Add IPv6 (`fd00:20:30::/64` etc.) to the networks and show that an IPv4-only policy leaves an open path — then close it, since `inet` tables cover both families.
- Add a Suricata container on the router's servers interface and confirm it sees only permitted traffic (bridges to lesson 05).

## Reflection prompts

1. `hr-app` and `file-srv` can talk freely on the same subnet. Which lesson 03 mechanism would stop that, and why can't the router?
2. Which single widened field in the sloppy version did the most damage, measured by failed tests?
3. When would you prefer a silent drop over a reject, and on which boundary in this lab?

## Instructor notes

- **Verified while drafting (2026-10-02, Docker Desktop on macOS):** using the reference rules below plus `ip saddr { 10.20.20.0/24, 10.20.30.0/24 } meta l4proto tcp reject with tcp reset` before the final log line, `verify.py` printed `ALL CHECKS PASSED`. Blocks from Users and VPN came back `refused` (reject), and the app-tier-to-DB SSH block came back `timeout` (drop), which shows the milestone 4 distinction working.
- **Docker networking caveat:** on some Linux hosts, `br_netfilter` passes bridged traffic through the host's iptables FORWARD chain; Docker's default rules accept intra-bridge traffic, so the lab works, but a host firewall such as `firewalld` may interfere. Docker Desktop (macOS/Windows) runs inside a VM and works as written. Test once on your lab image before class.
- Learners frequently forget that blocked tests will *also* pass if the router container is not forwarding at all. Milestone 2's "every ALLOW fails" and milestone 3's "ALLOW passes" together prove the router is the path.
- Reference rules for the three permits (instructor copy only): `ip saddr 10.20.30.0/24 ip daddr 10.20.40.22 tcp dport 443 log prefix "hr-app-https " accept`, `ip saddr 10.20.40.22 ip daddr 10.20.50.11 tcp dport 5432 log prefix "hr-app-db " accept`, `ip saddr 10.20.20.0/24 ip daddr 10.20.40.22 tcp dport 22 log prefix "vendor-ssh " accept comment "expires 2026-12-31"`.
- Shorter (3 h) version: provide `router.nft` with the permits written, and grade milestones 4–7 only.
