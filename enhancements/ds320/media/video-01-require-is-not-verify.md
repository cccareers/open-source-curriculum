---
course_id: ds320
media_id: ds320-v01
type: video-script
title: "Encrypted Is Not Verified: sslmode=require vs verify-full"
format: screencast
target_runtime: "6 min"
related_lessons:
  - ds320-05
objectives:
  - Apply encryption in transit and at rest, and manage the keys that make it meaningful
competency_ids:
  - D5-S1-C01
---

## Purpose

After watching, the learner can explain why `sslmode=require` does not protect against interception, configure a client with `verify-full` and an explicit CA, and enforce TLS on the server with `hostssl`.

## Audience and prerequisites

ds320 learners who have read lesson 5's "Encryption in transit" section and can run Docker and `psql`.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Packet capture (Wireshark) of a PostgreSQL connection; payload shows unreadable TLS application data. | "This connection is encrypted. You can't read a byte of it. And it might still be going straight to an attacker. Let's see why." |
| 0:15 | Diagram: client, a box labelled "interceptor", server. | "Encryption answers 'can someone on the wire read this?'. Verification answers 'am I talking to the server I think I am?'. You need both." |
| 0:35 | Terminal: a local lab of two containers: `pg-real` with a certificate from `internal-ca`, and `pg-impostor` with a self-signed certificate, listening on the hostname `warehouse.internal` via a hosts-file alias. | "Lab setup: a real warehouse whose certificate is signed by our internal CA, and an impostor with a self-signed certificate answering on the same hostname. Everything here is local containers on your machine." |
| 1:00 | Run: `psql "postgresql://pipeline@warehouse.internal/warehouse?sslmode=require"` pointed at the impostor. It connects. `SELECT inet_server_addr();` shows the impostor's IP. | "With sslmode require, we connect to the impostor without a word of complaint. The traffic is encrypted, to the wrong party. Every query the pipeline sends, and every row it writes, now goes to them. (The impostor in this lab accepts any login; a real one would relay to the true server and read everything in between.)" |
| 1:30 | Lower-third: "require = encrypt, do not verify". | "Require means: encrypt, but accept any certificate. That's the trap the lesson warns about." |
| 1:45 | Run with `sslmode=verify-full&sslrootcert=./internal-ca.pem` against the impostor. Error: `certificate verify failed`. | "Now verify-full with our CA bundle. Refused: the impostor's certificate isn't signed by our CA." |
| 2:05 | Same command against `pg-real`. Connects. `SELECT ssl, version, cipher FROM pg_stat_ssl WHERE pid = pg_backend_pid();` returns `t | TLSv1.3 | TLS_AES_256_GCM_SHA384`. | "Against the real server it connects, and pg_stat_ssl confirms TLS 1.3 on this session." |
| 2:30 | Show `verify-ca` vs `verify-full`: connect to the real server by IP address with `verify-ca` (succeeds) and `verify-full` (fails hostname check). | "Verify-ca checks the chain but not the name. Verify-full also checks that the certificate names the host you asked for. In production, use verify-full." |
| 3:00 | Unset `sslmode` (default `prefer`); server configured with `ssl = off`. Connection succeeds; `pg_stat_ssl` shows `ssl = f`. | "And the default, prefer, will quietly fall back to plaintext if the server doesn't offer TLS. Leaving sslmode unset is a finding." |
| 3:25 | Editor: server `pg_hba.conf` with `hostssl all all 0.0.0.0/0 scram-sha-256` and no `host` lines; `postgresql.conf` with `ssl = on`. | "Now close the door from the server side. ssl on, and only hostssl lines in pg_hba. A client that tries plaintext is refused, no matter how it was configured." |
| 3:50 | Run `sslmode=disable` against real server: `no pg_hba.conf entry for host ... no encryption`. | "Plaintext attempt: rejected by the server. That's the mutual requirement the lesson asks for." |
| 4:10 | Talking-head overlay or text card: "Certificate expiry -> outage -> someone sets require -> silent exposure." | "Why does require show up in production? Usually a certificate expired, something broke, and someone 'fixed' it under pressure. Automate renewal and alert before expiry, and that pressure never arrives." |
| 4:35 | Checklist card: 1. Client: verify-full + sslrootcert. 2. Server: ssl=on, hostssl only. 3. Never unset sslmode. 4. Alert on cert expiry. 5. Record both outcomes as evidence. | "Five things. And for your ds320 evidence: capture both the refused and the successful connection. A denied attempt you can show is stronger than a setting you can describe." |
| 5:10 | End card linking to lesson 5 practice item 1. | "Now do practice item 1 in lesson 5 with your own lab." |

## On-screen assets and B-roll

- A `docker-compose.yml` with `pg-real` (cert issued by a local `internal-ca` generated with `openssl`), `pg-impostor` (self-signed), and a hosts alias. All certificates are throwaway lab material.
- Wireshark capture (pre-recorded) for the cold open.

## Accessibility

- Captions; all commands, config lines, and error messages provided as text.
- Success/failure shown with words ("CONNECTED", "REFUSED") in addition to green/red.
- Terminal at 18 pt minimum; error messages read aloud.

## Check for understanding

1. Why is `sslmode=require` vulnerable even though traffic is encrypted? *Answer: it does not verify the server certificate, so a party in the path can present any certificate, terminate TLS, and read or relay the traffic.*
2. What does `verify-full` check that `verify-ca` does not? *Answer: that the certificate's host name matches the host the client asked to connect to.*
3. Which server-side setting stops a misconfigured client from connecting in plaintext? *Answer: `ssl = on` with only `hostssl` entries (no `host` entries) in `pg_hba.conf`.*
