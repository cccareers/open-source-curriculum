---
course_id: cyb210
project_id: cyb210-x02
title: "Harbor Ridge Mail Authentication Lab"
kind: supplementary-project
status: draft
hours_estimate: 5
difficulty: core
related_lessons:
  - cyb210-05
objectives:
  - Configure email authentication and filtering to block spoofed, malicious, and unwanted mail
competency_ids:
  - D5-S1-C04
  - D5-S1-C02
---

## Scenario

**Harbor Ridge Medical Group** (`harborridge.example`) is preparing to move from DMARC `p=none` to enforcement. Last month an accounts-payable clerk received a message that displayed `ap@harborridge.example` in the From line and asked for a change of bank details — the same pattern as lesson 05's worked example. The IT director wants the full authentication stack staged and checked in a lab **before** anyone touches production DNS. You will run a private authoritative DNS server in a container, publish the records you designed in lesson 05's Practice, Part 1, and prove them correct with an automated checker. Then you will read a set of synthetic headers and aggregate-report rows and decide what each one means.

## Scope and authorization

- Everything runs on your own machine in containers on a private Docker network. The zone `harborridge.example` uses the reserved `.example` top-level domain, which is never delegated on the public internet, so nothing you publish can affect real mail.
- **Do not edit any real organization's DNS** as part of this project, including your own personal domain, unless you own it and accept the risk of breaking your own mail.
- All headers and reports are synthetic and supplied below; no live phishing messages or URLs are used.

## What you will build / produce

1. A zone file for `harborridge.example` containing SPF, one DKIM selector, DMARC (both the first-step and final-state versions, in two zone variants), and null-sender records for `parked.harborridge.example`.
2. A running authoritative DNS container serving that zone.
3. A passing run of the acceptance checker below.
4. A two-page **enforcement readiness memo**: the records, the lookup count, the rollout schedule with advance criteria, and your verdicts on the synthetic evidence.

## Before you start

- Lesson 05 completed, especially "SPF", "DKIM", "DMARC", and "The rollout ladder".
- Docker (or Podman) installed; `dig` available (package `dnsutils` or `bind-tools`).
- Python 3.9+ with `dnspython` and `cryptography` (`pip install dnspython cryptography`).
- Generate a 2048-bit DKIM key pair in the lab: `openssl genrsa -out sel2026a.key 2048` and `openssl rsa -in sel2026a.key -pubout -outform DER | base64 -w0` (on macOS use `base64` without `-w0`). The base64 output is the `p=` value. Never commit the private key anywhere.

## Milestones

1. **Write the zone (1 h).** Use this skeleton and complete it. The `include:` targets are fictional vendor names from lesson 05; for the checker's lookup count to be meaningful, publish a stub SPF record for each include target. The lab server is authoritative only for `harborridge.example`, so give each stub a stand-in name inside that zone and point the include at it: for example, the relative name `_spf.mailhost` (which becomes `_spf.mailhost.harborridge.example.`) → `"v=spf1 ip4:192.0.2.0/24 -all"`, used as `include:_spf.mailhost.harborridge.example`. Note in your memo that production records use the vendor's real include name.

   ```dns
   $ORIGIN harborridge.example.
   $TTL 300
   @   IN SOA ns1 hostmaster 2026010101 3600 600 86400 300
   @   IN NS  ns1
   ns1 IN A   172.30.0.53
   @   IN TXT "v=spf1 ... -all"
   sel2026a._domainkey IN TXT "v=DKIM1; k=rsa; p=..."
   _dmarc IN TXT "v=DMARC1; p=none; rua=mailto:dmarc-agg@harborridge.example"
   parked IN TXT "v=spf1 -all"
   _dmarc.parked IN TXT "v=DMARC1; p=reject"
   ```

   Note: long TXT values over 255 characters (a 2048-bit DKIM key) must be split into multiple quoted strings inside one record, e.g. `( "v=DKIM1; k=rsa; p=MIIBIjAN..." "...IDAQAB" )`. This is a frequent production mistake.
2. **Serve it (30 min).** Run CoreDNS or BIND in a container on a user-defined network, for example:

   ```bash
   docker network create --subnet 172.30.0.0/24 mail-lab
   docker run -d --name ns1 --net mail-lab --ip 172.30.0.53 \
     -v "$PWD/zones:/zones" -v "$PWD/Corefile:/Corefile" coredns/coredns -conf /Corefile
   dig @172.30.0.53 harborridge.example TXT +short
   ```

   with a `Corefile` of `harborridge.example { file /zones/db.harborridge.example }`. (On macOS Docker Desktop, container IPs are not reachable from the host; publish port 53/udp to a high host port such as 5353 and use `dig -p 5353 @127.0.0.1`.)
3. **Check it (30 min).** Run the acceptance checker against both zone variants (first step and final state).
4. **Read the evidence (1 h).** Complete the evidence table below.
5. **Write the memo (1.5 h).**

## Acceptance criteria

- [ ] Exactly one `v=spf1` record at the apex, ending in `-all` (final state) and consuming ≤ 10 DNS lookups, with the count stated.
- [ ] DKIM selector record present, `k=rsa`, key ≥ 2048 bits.
- [ ] First-step DMARC: `p=none` with `rua=`. Final-state DMARC: `p=reject`, `sp=reject`, `rua=` retained.
- [ ] `parked.harborridge.example` publishes `v=spf1 -all` and DMARC `p=reject`.
- [ ] Every synthetic artifact in the evidence table has a verdict and a remediation.
- [ ] The memo states the advance criterion for each rollout rung and a rollback action.

## Automated checks

`check_mailauth.py` — run as `python3 check_mailauth.py 172.30.0.53 53 final` (or `... none` for the first-step zone).

```python
#!/usr/bin/env python3
import sys, base64, dns.resolver
from cryptography.hazmat.primitives.serialization import load_der_public_key  # pip install cryptography

server, port, stage = sys.argv[1], int(sys.argv[2]), sys.argv[3]
r = dns.resolver.Resolver(configure=False); r.nameservers = [server]; r.port = port
D = "harborridge.example"
fails = []

def txt(name):
    try:
        return [b"".join(rr.strings).decode() for rr in r.resolve(name, "TXT")]
    except Exception:
        return []

def spf_lookups(domain, depth=0):
    recs = [t for t in txt(domain) if t.startswith("v=spf1")]
    if len(recs) != 1:
        fails.append(f"{domain}: expected 1 SPF record, found {len(recs)}"); return 0
    count = 0
    for term in recs[0].split()[1:]:
        mech = term.lstrip("+-~?").split(":")[0].split("=")[0]
        if mech in ("include", "a", "mx", "ptr", "exists", "redirect"):
            count += 1
            if mech in ("include", "redirect") and depth < 10:
                count += spf_lookups(term.split(":", 1)[-1].split("=", 1)[-1], depth + 1)
    return count

apex = [t for t in txt(D) if t.startswith("v=spf1")]
n = spf_lookups(D)
print(f"SPF: {apex}  lookups={n}")
if n > 10: fails.append(f"SPF lookup count {n} exceeds 10 (permerror)")
if stage == "final" and apex and not apex[0].endswith("-all"):
    fails.append("Final-state SPF must end in -all")

dk = txt(f"sel2026a._domainkey.{D}")
if not dk: fails.append("DKIM selector sel2026a missing")
else:
    tags = dict(p.strip().split("=", 1) for p in dk[0].split(";") if "=" in p)
    bits = load_der_public_key(base64.b64decode(tags["p"])).key_size
    print(f"DKIM: k={tags.get('k')} bits={bits}")
    if tags.get("k", "").strip() != "rsa": fails.append(f"DKIM k= should be rsa, found {tags.get('k')!r}")
    if bits < 2048: fails.append(f"DKIM key is {bits} bits; use 2048")

dm = txt(f"_dmarc.{D}")
tags = dict(p.strip().split("=", 1) for p in dm[0].split(";") if "=" in p) if dm else {}
print(f"DMARC: {tags}")
if "rua" not in tags: fails.append("DMARC rua= missing (you lose your reports)")
want = {"none": {"p": "none"}, "final": {"p": "reject", "sp": "reject"}}[stage]
for k, v in want.items():
    if tags.get(k) != v: fails.append(f"DMARC {k}= should be {v} at stage '{stage}'")

if txt(f"parked.{D}") != ["v=spf1 -all"]: fails.append("parked: null SPF missing")
pdm = txt(f"_dmarc.parked.{D}")
if not pdm or "p=reject" not in pdm[0]: fails.append("parked: DMARC p=reject missing")

print("\nFAILED:\n - " + "\n - ".join(fails) if fails else "\nALL CHECKS PASSED")
sys.exit(1 if fails else 0)
```

The checker deliberately counts lookups recursively through `include:` — that is how receivers evaluate the ten-lookup limit, and it is the check most often skipped in real deployments.

## Evidence checklist

Complete this table in your memo. All artifacts are synthetic.

| # | Artifact | Your verdict | Remediation |
|---|---|---|---|
| 1 | `Authentication-Results: spf=pass smtp.mailfrom=bounce.newsletter-tool.example; dkim=pass header.d=newsletter-tool.example; dmarc=fail header.from=harborridge.example` from a marketing campaign the communications team says they sent | | |
| 2 | Aggregate row: source `198.51.100.41`, count 96, `spf=pass`, `dkim=fail`, header_from `harborridge.example` | | |
| 3 | Aggregate row: source `192.0.2.80`, count 18, `spf=fail`, `dkim=pass`, header_from `harborridge.example`; reverse DNS shows a university mail forwarder | | |
| 4 | Aggregate row: source `203.0.113.150`, count 5,210, `spf=fail`, `dkim=fail`, header_from `harborridge.example` | | |
| 5 | `From: "Dr. Elena Ortiz, Medical Director" <eortiz.md@freemail.example>` — SPF, DKIM, and DMARC all pass for `freemail.example` | | |

Expected answers for instructors: (1) forgotten legitimate sender — configure the vendor to DKIM-sign with `d=harborridge.example` or a delegated subdomain before enforcement; (2) the monitoring appliance — legitimate, SPF-aligned so DMARC passes, but add DKIM signing or accept SPF-only; (3) forwarding artifact — DKIM survives, DMARC passes on DKIM alignment, no action; (4) spoofer — exactly what enforcement will stop; (5) display-name impersonation — DMARC cannot help; this needs the impersonation control and external-sender banner from lesson 05's filtering section.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Record correctness | Checker fails | Checker passes on both stages | Records also include MTA-STS/TLS-RPT stubs with explanation |
| Lookup budgeting | Count not stated | Count stated and under 10 | Explains a flattening or subdomain strategy for headroom |
| Evidence reading | Treats SPF/DKIM pass as trust | Correct verdicts for all five | Explains which filtering control catches #5 and its false-positive risk |
| Rollout plan | Dates only | Advance criteria and rollback per rung | Names the aggregate-report signal that would trigger rollback |

## Stretch goals

- Add a Postfix + OpenDKIM container pair that signs a test message with your selector, and verify the signature with `opendkim-testmsg` or Python `dkimpy` against your lab DNS.
- Add a second selector and walk through a key rotation, showing both keys published during the grace period.

## Reflection prompts

1. Why does the checker fail the final stage if `rua=` is missing, even though enforcement would still work?
2. Artifact #5 passes every authentication check. What does that tell you about the limits of the three-record stack?

## Instructor notes

- The most common failure is two `v=spf1` records after a learner "adds" a vendor. Let the checker catch it.
- Learners on macOS frequently lose time on container networking; give them the port-publishing variant up front.
- `pct=` is still widely supported, but the DMARC revision in progress at the IETF ("DMARCbis") replaces it; see review.md open questions before teaching it as permanent.
