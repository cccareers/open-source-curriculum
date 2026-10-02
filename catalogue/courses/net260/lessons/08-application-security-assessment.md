---
lesson_id: net260-08
course_id: net260
pathway: cybersecurity-support-technician
title: Application Security Assessment
order: 8
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Assess a deployed application for common vulnerability classes and record
    the findings
---

## Up the stack, and inside the boundary

Six lessons of infrastructure. Identity is scoped, the network is segmented, the data has a key, the workloads are hardened, the logs are watched. An attacker who wants in now has one obvious remaining door, and it is the one you deliberately left open: the application, listening on 443, reachable from the internet, by design.

Application security assessment is the discipline of finding the weaknesses in that application before someone else does. In your role it has a specific and bounded shape, so be clear about it up front.

**What you are doing:** assessing a deployed, running application against the common vulnerability classes, using authorized tooling and careful manual verification, and producing findings a developer can act on.

**What you are not doing:** writing the application, performing line-by-line manual secure code review, or conducting a penetration test. Penetration testing is a distinct discipline with its own rules of engagement, and it belongs to cyb140. Here you are looking for the well-known classes, confirming them safely, and writing them up.

### The authorization boundary, stated once and meant

Everything in this lesson runs against **your own lab or sandbox application, or a target your instructor has explicitly provided for this purpose**, with written authorization in place before you send the first request. Not a site you found. Not a vendor's product you are evaluating. Not another team's staging environment at your employer, however reasonable that seems.

The reason is not squeamishness. Unauthorized testing is a crime in most jurisdictions regardless of intent, it is career-ending, and the fact that you meant well is not a defense. The professional habit — and it is a habit, formed now — is that the first artifact of any assessment is the written authorization, and it is quoted at the top of the report.

A minimal authorization record, which you will produce in the practice:

```text
ASSESSMENT AUTHORIZATION
Target:        clinic-lab.internal (lab environment only), all paths under /
Out of scope:  Any host not listed; the provider's own control plane; any
               third-party service the application integrates with; denial of
               service and load testing of any kind; any modification or
               deletion of data outside the seeded test accounts.
Window:        2026-07-22 09:00Z to 2026-07-24 17:00Z
Authorized by: D. Whitfield, Platform Owner (written, ticket SEC-2274)
Tester:        A. Nkemelu
Contact:       If anything degrades, stop and call +NN NNNN NNNN immediately.
Data handling: Any real-looking data encountered is not exported; screenshots
               redacted; evidence stored in the assessment evidence store only.
```

## The classes worth knowing

The industry reference is the OWASP Top 10, which groups the most consequential web application weaknesses. It is a list of *categories*, not a checklist of bugs, and the categories are what you carry from one application to the next. Here are the ones you will actually meet, with what each looks like from the outside and how a cloud environment changes it.

### Broken access control

The largest category, and the one that produces the most real breaches. The application authenticates you correctly and then fails to check whether *you* are allowed to see *this specific thing*.

The everyday version has an ugly acronym — IDOR, insecure direct object reference — and a simple shape: a URL or request body carries an identifier of somebody's record, and changing that identifier returns somebody else's record. `/api/patients/4471` works, and so does `/api/patients/4472`, which belongs to a different person.

Other shapes in the same family: a privileged endpoint like `/admin/users` that is merely unlinked rather than protected; an API that enforces authorization on the read path but not on the delete path; a client-side role check with no server-side equivalent, so hiding a button hides nothing.

Detection is inherently manual, which is why this class is under-found by scanners. Automated tools do not know that patient 4471 belongs to Alice and 4472 belongs to Bob. You need two authorized test accounts and the discipline to try each account's identifiers against the other's session. In your lab, seed exactly that: two users, each with their own record, and check every object-referencing endpoint both ways.

### Cryptographic failures

Sensitive data exposed because it was transmitted or stored without adequate protection. From the outside this looks like: an endpoint reachable over plain HTTP; a login form posting to HTTP; missing HSTS so the first request is downgradeable; TLS terminating at the load balancer with the internal hop in the clear; session tokens or record identifiers in URL query strings, where they land in logs and referrer headers; and sensitive fields returned in an API response the client never displays but anyone can read.

The cloud angle from lesson 05: this is the class where "the bucket had encryption at rest enabled" turns out to be irrelevant, because the data was served by an authorized path.

### Injection

Untrusted input reaching an interpreter with enough structure to change the command's meaning: SQL, operating system commands, LDAP, template engines. Cross-site scripting is grouped here too — injection into the browser's interpreter.

From the outside, injection reveals itself through error messages that leak query structure, response differences on structurally interesting input, and reflected content that comes back rendered rather than escaped. Confirm safely: a reflected-XSS check that pops a benign marker in your own lab browser session is proof enough for a finding. You do not need to demonstrate data extraction, and on a real target you must not — proving a vulnerability exists is the assessment's job; exploiting it fully is not.

### Insecure design and business logic flaws

Weaknesses no scanner will ever find because the code works exactly as written and the design is wrong. A password reset that reveals whether an address is registered. A multi-step checkout where step three can be requested without step two. A rate limit on login but not on the reset endpoint. A refund flow that accepts a negative quantity.

Finding these requires understanding what the application is *for*, which is why the first hour of any assessment is spent using the application as a normal user before testing anything.

### Security misconfiguration

The class this course has been circling for six lessons, at the application layer: default credentials still active; verbose stack traces returned to the client; directory listing enabled; an admin console or a debug endpoint exposed; a framework's development mode on in production; permissive CORS with `Access-Control-Allow-Origin: *` on an authenticated API; missing security headers.

Fast, cheap, high yield, and the most commonly automated part of an assessment.

### Vulnerable and outdated components

Your application depends on dozens of libraries and each has a version with published vulnerabilities. This connects directly to lesson 06: the same scanning discipline applied to container images applies to application dependencies, and the tool category is software composition analysis. Lesson 09 puts it in the pipeline.

The judgement to apply, and the reason a raw scanner report is not a finding: **a vulnerable version present is not the same as a vulnerable version reachable.** A deserialization flaw in a library your application only uses for date formatting is a lower priority than a request-parsing flaw in the framework that handles every inbound request. Say which you have.

### Identification and authentication failures

Weak or absent MFA, no lockout or rate limiting on login, session identifiers that do not rotate after authentication, sessions that never expire, password reset tokens that are guessable or long-lived, and credentials accepted over an unauthenticated channel.

### Software and data integrity failures

Trusting an artifact whose origin you cannot prove. Loading a script from a third-party CDN with no integrity check; auto-updating from an unverified source; deserializing untrusted data. Lesson 06's image signing was this class at the infrastructure layer; lesson 09 addresses it in the pipeline.

### Security logging and monitoring failures

The application does not record authentication failures, access-control denials, or high-value actions — or it records them somewhere no one reads. Lesson 07 gave you the control-plane view; this is the same argument one layer up, and it is a legitimate finding in its own right. "We cannot tell whether this was exploited" is a consequence you should be writing down.

### Server-side request forgery

The application fetches a URL supplied by the user. In an ordinary data center this is a modest problem. **In a cloud environment it is one of the most severe findings available,** because — as lesson 06 showed — the workload's credentials are retrievable from a link-local metadata endpoint over plain HTTP, and an SSRF turns into a stolen cloud credential with no code execution required.

So SSRF gets escalated in any cloud-hosted application, and the finding should always be written with both halves: the application flaw *and* the infrastructure mitigation state. "SSRF in the avatar-import endpoint; the instance permits the legacy metadata service; therefore this yields the workload's credentials, which currently hold account-wide storage read." That single sentence connects three lessons and is exactly the kind of finding that gets prioritized.

## How you actually assess

### The tool categories

```text
SAST   Static analysis of source code. Finds injection and unsafe API use
       without running anything. Noisy. Belongs in the pipeline (lesson 09).
       Not this lesson's method — the app here is a running black box.

SCA    Software composition analysis. Inventories dependencies and matches
       them to known vulnerabilities. Cheap, accurate, high value.

DAST   Dynamic testing against the RUNNING application. Crawls, sends
       requests, observes responses. Finds misconfiguration, missing headers,
       reflected injection, and TLS problems well. Finds access-control and
       business-logic flaws badly, because it cannot know the rules.

IAST/  Instrumented and runtime-protection approaches. Know the terms.
RASP

MANUAL Authorized human testing with a proxy, driven by understanding of the
       application. The only way to find access-control and logic flaws.
```

The practical shape of an assessment is: SCA for the dependency picture, DAST for breadth, manual for the classes DAST cannot reach, and a configuration review of the surrounding cloud resources using lessons 03 to 06.

### The sequence

1. **Confirm authorization and scope.** In writing. First artifact, every time.
2. **Use the application as a user.** An hour, minimum. Every role you have been given an account for. You cannot find a logic flaw in a workflow you do not understand.
3. **Map the surface.** Every endpoint, every parameter, every role, every place a file is uploaded, every place a URL is accepted, every place an identifier appears in a request. Write it down; this map is what makes your coverage claim credible.
4. **Run the cheap automated passes.** SCA against the dependency manifest, DAST against the running app in an authenticated and an unauthenticated pass, a TLS and header check.
5. **Triage the automated output ruthlessly.** Most DAST findings are informational, duplicated, or false. A report you forward unfiltered destroys your credibility with the development team once and permanently.
6. **Manual testing for the classes tools miss.** Access control between your two authorized accounts, business logic, and the specific role boundaries the application claims to enforce.
7. **Verify every finding you intend to report.** Reproduce it. Capture the request and response. A finding you cannot reproduce is a hypothesis.
8. **Assess the cloud context.** For every application finding, ask what lessons 02 to 07 change about its severity. An SSRF next to a legacy metadata service is critical; the same SSRF where metadata is locked down and the workload identity is scoped to one bucket is high but not catastrophic. Say which situation you are in.
9. **Write it up and route it.**

### Triage, worked

A DAST run against the lab clinic app returns 214 findings. What survives?

```text
RAW                                        DISPOSITION
41  "Cookie without SameSite attribute"    -> 1 finding, aggregated, LOW
38  "Missing security header" (X-Frame,
     CSP, etc.), same 3 headers repeated
     across every path                     -> 1 finding, aggregated, MEDIUM
52  "Information disclosure: server
     version in banner"                    -> 1 finding, aggregated, LOW
44  "Possible SQL injection" on the same
     search parameter, 44 payload variants -> 1 finding, verified, HIGH
19  "Cross-domain JavaScript inclusion"
     for the analytics tag                 -> 1 finding, integrity, MEDIUM
14  "Reflected XSS" — 12 are the same
     parameter, 2 do not reproduce         -> 1 finding verified HIGH,
                                              2 discarded as false positives
6   "Directory browsing enabled" on /docs  -> 1 finding, MEDIUM
0   access-control findings                -> DAST cannot see them; found 2
                                              manually, both HIGH/CRITICAL

214 raw  ->  9 reported findings, each verified, each reproducible.
```

That reduction *is* the professional skill. The 214 number impresses nobody; the nine findings get fixed.

## Writing the finding

A finding is a work order. If a developer has to come back and ask a question before starting, the finding failed.

```text
FINDING A-03
Title:     Any authenticated user can read any patient record
Severity:  CRITICAL
Class:     Broken access control (OWASP A01) — insecure direct object reference
Component: GET /api/v1/patients/{id}   (clinic-lab.internal)
Authorization: SEC-2274, lab environment, in-scope target

DESCRIPTION
The endpoint verifies that the request carries a valid session but does not
verify that the session's user is entitled to the record identified by {id}.
Any authenticated user — including the self-registration role, which anyone can
obtain — can enumerate identifiers and read every record in the system.

EVIDENCE (reproducible, lab only, seeded test accounts)
  Test account A: user_a@lab.local, owns record 4471
  Test account B: user_b@lab.local, owns record 4472

  Request (session cookie for account B):
      GET /api/v1/patients/4471 HTTP/1.1
      Host: clinic-lab.internal
      Cookie: session=<account B session>

  Response: 200 OK, full record for account A, including name, date of birth,
  and appointment history. Screenshot evidence/A-03-response.png (redacted).

  Identifiers are sequential integers; 4400-4480 all return 200 for account B.
  No rate limiting observed on this endpoint.

IMPACT
Full disclosure of every patient record to any account that can register.
Sequential identifiers make bulk extraction trivial. This is a reportable
breach of the record classification set in the data inventory (lesson 05).

CLOUD CONTEXT
The application's data-access logging is NOT enabled on the backing store, so
if this were exploited in production we could not currently determine which
records were read. That gap is raised separately as A-07.

REMEDIATION
Enforce an ownership or role check on the server for every object-referencing
endpoint, not only this one. Prefer deriving the accessible record set from the
session rather than trusting a client-supplied identifier. Consider opaque,
non-sequential identifiers as defense in depth — but note this alone does not
fix the vulnerability, it only slows enumeration.

VERIFICATION AFTER FIX
Repeat the cross-account request with both accounts in both directions; expect
403. Confirm the denial is logged. Re-test the remaining 6 endpoints listed in
the surface map that take a record identifier.

Owner: App Lead      Target: 3 days      Status: open
```

Three details make that finding good. It states the authorization and the lab scope. Its evidence is reproducible by someone who is not you. And it separates the vulnerability from the mitigation-that-is-not-a-fix, which prevents the very common outcome where a team randomizes the identifiers, declares it closed, and remains fully vulnerable to anyone who has a valid identifier.

Severity should follow a stated scale — most organizations use CVSS, and cyb150 gave you the risk vocabulary. Whatever you use, say which, and apply it consistently. A report where severity is vibes is a report that gets argued with instead of acted on.

## Practice

Every exercise below runs against your own lab application or an instructor-provided target only, inside a written authorization that you produce first. No exercise in this lesson is to be performed against any other system, including systems belonging to your employer, and no denial-of-service or load testing is in scope at any point.

**Exercise 1 — Write the authorization and scope.**

Produce the assessment authorization record for your lab target in the format above: target and in-scope paths, explicit out-of-scope list, window, authorizing person and ticket, tester, emergency stop contact, and data-handling rules. Then write the two sentences you would say to a manager who asks you to "just take a quick look" at a production system that is not in this document.

**Exercise 2 — Map the attack surface.**

Using the application as a normal user for at least an hour across every role you have accounts for, produce a surface map: every endpoint, its method, the roles that should be able to call it, every parameter that carries an identifier, every file upload, and every place the application accepts a URL. Mark the three endpoints you consider highest risk and say why. This map is your coverage evidence, and every later exercise references it.

**Exercise 3 — Run the automated passes and triage them.**

Run an SCA scan against the dependency manifest and a DAST scan against the running lab application, both authenticated and unauthenticated. Report the raw count, then the triaged count, with a table like the worked example showing what you aggregated, what you verified, and what you discarded as a false positive with the reason. For the SCA output, additionally separate "vulnerable version present" from "vulnerable code path reachable" for your top five dependency findings, and explain how you decided.

**Exercise 4 — Find what the tools cannot.**

Using two authorized test accounts, test every identifier-carrying endpoint in your surface map for broken access control in both directions, and test at least two multi-step workflows for logic flaws. Document your method, your coverage against the map, and your results — including the endpoints that correctly denied you, because a negative result you can evidence is part of the report.

**Exercise 5 — Produce the assessment report.**

Write the complete report for your lab target. It must contain: the authorization record; scope and method; a coverage statement referencing the surface map; at least six verified findings in the format above, each with class, severity on a stated scale, reproducible evidence, impact, cloud context drawn from lessons 02 to 07, remediation, a verification step, an owner and a target date; a section for automated findings you discarded and why; and an explicit "not tested" section. At least one finding must be a class that DAST could not have found, and at least one must have its severity changed — up or down — by the cloud context. Keep this report; project 12 assesses an application you have deployed yourself.
