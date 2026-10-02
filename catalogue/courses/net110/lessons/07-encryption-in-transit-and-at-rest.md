---
lesson_id: net110-07
course_id: net110
pathway: cybersecurity-support-technician
title: Encryption in Transit and at Rest
order: 7
kind: lesson
competency_ids:
  - D2-S1-C05
objectives:
  - Choose encryption and key-handling appropriate to data in transit and data at rest
---

## The question this lesson answers

The VPN lesson raised a set of questions and deferred them: what is actually in that cipher suite, what does perfect forward secrecy mean, why is a certificate better than a shared secret, and where do the keys live? This lesson answers them, and then generalizes the answers to every place data sits or moves.

The framing to carry through: **encryption is a control against a specific adversary in a specific state.** Data in transit is protected against someone on the path. Data at rest is protected against someone who obtains the storage. Those are different adversaries, and a control that defeats one may be entirely irrelevant to the other. Full-disk encryption on a running server does nothing against an attacker with a shell on that server, because the disk is already unlocked and the operating system will cheerfully read files for them. This is not a flaw in disk encryption; it is a mismatch between the control and the threat, and recognizing that mismatch is the professional skill.

So every choice you make here has the same shape: **what data, in what state, against whom, and who holds the key?** The last part is the one that gets skipped, and it is the one that decides whether the encryption meant anything.

## The primitives, briefly

You need working knowledge, not cryptographic theory.

**Symmetric encryption** uses one key to encrypt and decrypt. Fast, suitable for bulk data. The problem it cannot solve alone is getting the key to the other party. The modern choices are **AES** (128 or 256-bit keys) and **ChaCha20**. Prefer **authenticated encryption with associated data (AEAD)** modes — **AES-GCM** or **ChaCha20-Poly1305** — which provide integrity along with confidentiality in one operation. Older modes such as AES-CBC require a separate integrity mechanism, and getting that combination right is a known source of subtle failures. If you have a choice, choose AEAD.

**Asymmetric encryption** uses a key pair: a public key that can be shared and a private key that must not be. Anyone can encrypt to the public key; only the private key decrypts. Reversed, the private key signs and anyone can verify with the public key, which is the basis of digital signatures and certificates. **RSA** (2048-bit minimum, 3072 or 4096 preferred for new deployments) and **elliptic curve** algorithms (ECDSA, Ed25519 — smaller keys, comparable strength, faster) are what you will meet. Asymmetric operations are far slower than symmetric, so they are used to establish keys and prove identity, not to encrypt bulk data.

**Hashing** is one-way: arbitrary input to a fixed-length digest, with no reverse operation. Used for integrity verification and, in specialized password-hashing forms, for credential storage. **SHA-256** and **SHA-384** are current; **MD5** and **SHA-1** are broken for security purposes and their presence in a configuration is a finding. Hashing is not encryption and does not protect confidentiality — a sentence worth being able to say clearly, because the terms get confused constantly.

**Key exchange** lets two parties agree on a shared secret over a channel someone is watching. **Diffie-Hellman**, usually in its elliptic-curve form (ECDHE), is the mechanism. The ephemeral variants — the "E" — generate fresh values per session, which is what provides **perfect forward secrecy**: an attacker who later obtains the server's long-term private key still cannot decrypt previously recorded sessions, because the session keys were never derived from it. PFS is the reason recorded traffic does not become readable years later, and it is non-negotiable in a modern configuration.

**The hybrid pattern** ties these together and is worth stating explicitly, because it recurs everywhere: use asymmetric cryptography to authenticate the parties and agree a symmetric key, then use symmetric cryptography for the data. TLS does it. IPsec does it. Encrypted storage does it in the form of envelope encryption, below.

## Data in transit

### What TLS provides

TLS gives you confidentiality, integrity, and authentication of the server — and optionally the client — for a connection. A handshake authenticates and establishes keys; the record layer then protects the data.

**TLS 1.3** is the current version and is meaningfully better than its predecessors, not merely newer. It removed every legacy cipher suite, made forward secrecy mandatory, made AEAD mandatory, and cut the handshake to one round trip. **TLS 1.2** remains acceptable when configured carefully with AEAD suites and ECDHE key exchange. **TLS 1.1, TLS 1.0, and every version of SSL are disabled**, without discussion — they carry known-broken constructions and their only remaining purpose is compatibility with software that should have been replaced.

A cipher suite name in TLS 1.2 encodes the whole arrangement:

```text
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    |     |        |            |
    |     |        |            +-- hash for the handshake / PRF
    |     |        +--------------- bulk encryption: AES-256 in GCM (AEAD)
    |     +------------------------ authentication: RSA certificate
    +------------------------------ key exchange: ephemeral ECDH (forward secrecy)
```

Read that left to right and you can judge a configuration at a glance: is the key exchange ephemeral, is the bulk cipher AEAD, is the hash current. TLS 1.3 simplified the naming — `TLS_AES_256_GCM_SHA384` — because the key exchange and authentication are negotiated separately and are always modern.

### Certificates and why they are trusted

A certificate binds an identity to a public key, signed by a certificate authority. Your system trusts a set of root CAs; a server presents a chain from its own certificate up to one of those roots, and the client validates every link.

What validation actually checks, and what each check catches:

- **Signature chain** to a trusted root — catches a certificate nobody vouched for.
- **Validity dates** — catches expired certificates. Expiry is the single most common TLS outage in existence, which is why certificates get monitored and automated.
- **Name match** — the requested hostname must appear in the **Subject Alternative Name** extension. Modern clients ignore the legacy Common Name field entirely; a certificate with the name only in CN will fail, and this surprises people every year.
- **Revocation status**, via CRL or OCSP — catches certificates withdrawn before expiry, for instance after a key compromise. Revocation checking is imperfect in practice, which is part of the argument for short certificate lifetimes.
- **Intermediate chain completeness** — a server that sends its own certificate but not the intermediate will validate on machines that happen to have cached the intermediate and fail on machines that have not. This produces the maddening "it works on my laptop" TLS ticket.

**Self-signed certificates** provide encryption but no third-party assurance of identity. They are fine for a lab and for internal services where you distribute the trust anchor yourself; they are not fine for anything users reach, because they train people to click through certificate warnings, which destroys the value of the warning everywhere else.

**Internal CAs** are the right answer for internal services at scale: you operate a CA, distribute its root to your managed devices, and issue short-lived certificates for internal hostnames. That makes the internal CA's private key one of the most sensitive objects in the organization, which brings us to key management.

**Mutual TLS** requires the client to present a certificate too. Useful for service-to-service authentication and for device authentication on a VPN. It shifts effort to certificate distribution and lifecycle, which is real work.

### Supporting controls

**HSTS** tells browsers to only ever use HTTPS for a domain, closing the window where a first plaintext request could be redirected. **Certificate transparency** logs issuance publicly so unexpected certificates for your domain can be detected. **Redirect all HTTP to HTTPS** and, where possible, do not answer on 80 at all except to redirect.

### Protocols to replace on sight

An inventory finding of any of these should produce a remediation ticket: **Telnet** (use SSH), **FTP** (use SFTP or FTPS), **HTTP** for anything non-public (use HTTPS), **SNMP v1/v2c** (use v3 with authentication and privacy), **LDAP** without TLS (use LDAPS or StartTLS), **SMB v1** (disable entirely), and unencrypted database connections (enable TLS on the connection string). Every one of these carries credentials or data in cleartext across your network, where — as lesson 02 established — a capture makes them readable.

### Checking a configuration

You can inspect a service's TLS posture directly:

```bash
# what the server presents: chain, names, validity, negotiated suite
openssl s_client -connect lab-app.internal:443 -servername lab-app.internal </dev/null

# just the identity and dates
openssl s_client -connect lab-app.internal:443 -servername lab-app.internal </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# does it still accept a version it should not?
openssl s_client -connect lab-app.internal:443 -tls1_1 </dev/null
```

That last command is a configuration check, not an attack: you are asking your own server whether it still accepts an obsolete protocol. A correctly configured server refuses the handshake. Run these against your own lab services.

## Data at rest

Now the second adversary: someone who obtains the storage. Match the control to how they might obtain it.

**Full-disk encryption** (LUKS on Linux, BitLocker on Windows, FileVault on macOS) encrypts an entire volume, unlocked at boot by a key held in a TPM, a passphrase, or both. It defeats **physical loss**: a stolen laptop, a decommissioned drive, a disk pulled from a rack. It does **not** defeat a live-system compromise, because the volume is unlocked while running. This is the highest-value, lowest-effort control for endpoints and it should be universal on portable devices — and its limits should be stated whenever someone cites it as protection against something else.

**File- or folder-level encryption** protects specific data with its own key, so it can remain encrypted while the rest of the system is running. Useful for archives, exports, and files leaving the organization.

**Database encryption** comes in layers with genuinely different properties:

- **Transparent data encryption (TDE)** encrypts database files on disk. Defeats stolen disks and stolen backups; invisible to applications; provides nothing against an attacker who can query the database, because the database decrypts for any authorized query.
- **Column or field-level encryption** encrypts specific sensitive columns, decrypted only by the application holding the key. Defeats a database compromise for those fields — a dumped table yields ciphertext. Costs: you cannot index or range-query encrypted columns normally, and the application now holds keys.
- **Application-level encryption** encrypts before the data ever reaches storage. The strongest arrangement and the most work, appropriate for the highest-sensitivity fields.

**Backup encryption** is not optional. Backups are complete copies of your data, often stored offsite, often on media that travels, and historically the least-protected copy in the organization. Encrypt them, and store the keys somewhere that survives the disaster the backups exist for — a key kept only on the system being restored is not a key.

**Object and cloud storage encryption** is typically on by default with provider-managed keys, which defeats physical media compromise and little else. Customer-managed keys give you revocation and separation from the storage provider's access. The detailed mechanics of cloud key services belong to the cloud networking course; the decision principle here is simply *who can decrypt without your involvement.*

**Removable media and mobile devices** get full-volume encryption, enforced by policy where the platform permits it.

## Key management, which is the actual hard part

Encryption algorithms are not where deployments fail. Key handling is. The whole security of the system reduces to the secrecy and availability of a much smaller secret, and that secret has a lifecycle.

**Generation.** Keys come from a cryptographically secure random source, at an appropriate length, on the system that will use them. A key generated by a weak random source is weak no matter how strong the algorithm.

**Storage.** Never in source code, never in a configuration file committed to a repository, never in a wiki or a ticket, never in email. Acceptable homes: a hardware security module (HSM), a platform key store (TPM, secure enclave), a managed key service, or a dedicated secrets manager with access control and audit logging. On a file system, a private key file is mode `600`, owned by the service account, and nothing else.

**Distribution.** Private keys ideally never move — generate them where they will be used, as you did in the WireGuard exercise. When something must be shared, use an out-of-band channel and a mechanism that does not leave a copy behind.

**Rotation.** Every key gets a defined lifetime and a rotation procedure that has been rehearsed. Short-lived TLS certificates with automated renewal are the mature pattern precisely because a procedure that runs every sixty days works, and a procedure that runs every two years does not.

**Revocation.** There must be a way to invalidate a key immediately when it is exposed — certificate revocation, removal of a peer entry, disabling a key version — and you must have tested it. Untested revocation is a plan, not a control.

**Escrow and recovery.** Encryption you cannot reverse when you need to is data loss. Disk encryption recovery keys must be escrowed centrally, backup keys must survive the site, and the recovery process must be documented and practiced. The organization that encrypted its backups and lost the key has achieved the same outcome as the ransomware it was defending against.

**Separation of duties.** The person who administers the data should not unilaterally control the keys. This is what makes key management a control rather than a formality, and it is the reason key access is logged separately.

**Envelope encryption** is the pattern that makes rotation practical at scale: data is encrypted with a **data encryption key (DEK)**, and the DEK is encrypted with a **key encryption key (KEK)** held in an HSM or key service. Rotating the KEK means re-encrypting a small number of DEKs rather than terabytes of data. Recognize this pattern; it is how essentially every storage encryption service is built.

## Choosing: a decision procedure

Given a body of data, answer in order.

1. **What is it and how sensitive?** Regulated (health, payment, personal), business-critical, internal, or public. Public data may need integrity and authenticity without confidentiality.
2. **What states does it exist in?** In transit between which parties, at rest on which systems, in backups, on endpoints, in logs. Data usually exists in more places than the first answer admits — logs and backups are the two most commonly forgotten.
3. **For each state, who is the adversary?** Someone on the network path, someone who steals a laptop, someone who obtains a backup tape, someone who compromises the application, an insider with database access. Name them; the name selects the control.
4. **Which control actually addresses that adversary?** Match honestly. Do not accept "the disk is encrypted" as an answer to "the application was compromised."
5. **Who holds the key, and what does that let them do?** If the storage provider holds it, they can decrypt. If the application holds it, an application compromise exposes the data. If a user holds it and loses it, the data is gone.
6. **What is the recovery path?** Before deployment, not after.

Applied to a clinic's patient records: **in transit** between workstation and application, TLS 1.3 with a certificate from the internal CA and forward secrecy; **in transit** between application and database, TLS on the database connection, which is frequently off by default; **at rest** in the database, TDE against stolen media plus field-level encryption on the small number of most sensitive fields against a database compromise; **at rest** in backups, encrypted with keys escrowed offsite; **on endpoints**, full-disk encryption with recovery keys escrowed centrally; and keys held in a managed service with logged access and an annual rotation that someone has actually performed.

## Failures you will encounter

- **"It's encrypted"** without a stated adversary. Ask which one, and check that the control matches.
- **Expired certificates**, because nobody monitored expiry. Monitor and automate.
- **Private keys in a Git repository.** Once committed, treat as compromised: rotate first, then clean history. Deleting the file in a later commit changes nothing.
- **Self-signed certificates in production**, teaching users to click through warnings.
- **Encryption in transit terminating too early** — TLS at a load balancer with cleartext behind it, on a network segment you have not treated as trusted.
- **Strong algorithms with a weak key**, such as a four-character pre-shared key or a passphrase from a wordlist.
- **Legacy protocol support left enabled** for a client that was decommissioned years ago.
- **No recovery path**, discovered during the recovery.
- **Backups excluded** from the encryption plan because they were owned by a different team.

## Practice

All work on your own lab systems and lab certificates.

**Exercise 1 — Assess and fix a TLS configuration.** Stand up a web service on a lab VM with TLS enabled, using a self-signed certificate to begin with.

1. Use `openssl s_client` to record the negotiated protocol version and cipher suite, the certificate subject, issuer, validity dates, and SAN entries.
2. Determine whether the server still accepts TLS 1.0 or 1.1, and whether it offers any non-AEAD or non-ephemeral suites.
3. Change the configuration to permit TLS 1.2 and 1.3 only, with ephemeral key exchange and AEAD suites only. Reload and re-run your checks.
4. Produce a before-and-after table with columns for protocol versions accepted, key exchange, bulk cipher, and forward secrecy, and one sentence per row saying what the change protects against.

**Exercise 2 — Certificate validation, hands on.** Create a small lab certificate authority. Issue a certificate for your lab service with a correct SAN entry, install your CA root on a lab client, and confirm the client validates the connection with no warning. Then, one at a time and restoring after each: issue a certificate with the hostname only in the Common Name; use a certificate whose validity has expired; and configure the server to omit the intermediate certificate from the chain. For each, record the exact client error and write one sentence naming the validation check that failed.

**Exercise 3 — Encrypt data at rest and reason about its limits.** On a lab VM, create an encrypted volume with LUKS (or the platform equivalent), place a test file on it, and mount it.

1. With the volume unlocked, read the file as an ordinary user with sufficient permissions. Note that you succeeded.
2. Unmount and lock the volume, then attempt to read the raw device and show that the contents are not recoverable.
3. Write three sentences: which adversary this control defeats, which adversary step 1 proves it does not defeat, and what additional control would address the second adversary for one specific field of the data.

**Exercise 4 — Write a key-handling plan.** For a fictional but concrete system — an internal application with a database, nightly backups to offsite storage, and staff laptops — produce a one-page plan with a row per key covering: what the key protects, how it is generated, where it is stored, who may access it, its rotation interval and procedure, its revocation procedure, and its escrow or recovery path. Finish with two sentences naming the single key whose compromise would be worst and what compensating control limits that damage.
