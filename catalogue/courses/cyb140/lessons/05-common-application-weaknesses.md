---
lesson_id: cyb140-05
course_id: cyb140
pathway: cybersecurity-support-technician
title: Common Application Weaknesses
order: 5
kind: lesson
competency_ids:
  - D6-S1-C03
objectives:
  - Identify common web application vulnerability classes and describe the evidence that confirms each one
---

## Why applications are a different problem

Everything in lesson 04 rested on a comparison: the scanner knows what a vulnerable version looks like, it observes what is running, and it matches. That model works for infrastructure because infrastructure is largely made of software somebody else wrote, published, and versioned.

Applications break the model. The code was written for this organization, it exists in one copy, and nobody has published a signature for it. There is no CVE for "the invoice page lets a customer read another customer's invoice." A scanner can tell you the framework version and the TLS configuration; it cannot tell you that the authorization check on one endpoint was omitted, because it does not know what that endpoint is supposed to allow. Application assessment is therefore an exercise in reading *behavior* — what the application does when you interact with it in a way its designers did not plan for — rather than reading version strings.

That shift changes what you are accountable for. In infrastructure work your evidence is a version, a configuration value, or a check result. In application work your evidence is a **request and the response it produced**, plus an explanation of why that response demonstrates a weakness. A screenshot of a scanner's claim is not evidence about an application. The request/response pair is.

Everything in this lesson is worked against the instructor-provided, intentionally vulnerable web applications on the isolated lab range, under the lab authorization and your rules of engagement. These applications exist to be found wanting; they hold no real data and belong to the training provider. Nothing here is to be attempted against any application you do not own or have not been authorized in writing to test — and note that "the site has a public login page" is not authorization, any more than an unlocked door is an invitation.

Two scope boundaries also carry over from the course plan. Your depth ceiling is **identify and evidence**, not exploit: you establish that a weakness exists and capture proof, and you stop. And **fixing** these weaknesses — secure coding patterns, framework-level controls, pipeline integration — belongs to net260, not here. Your product is a well-evidenced finding and a recommendation, not a patch.

## The taxonomy you will be asked about

The OWASP Top 10 is a periodically republished list of the most significant web application security risk categories, assembled from contributed data and practitioner survey. It is not a checklist, not a standard, and not a complete list of things that can go wrong. It is a *shared vocabulary*, and that is exactly why it matters to you: when a report says "broken access control" or a client asks "are we covered for the OWASP Top 10," you need to know precisely what is being named.

The ten categories in the current edition, each with the question it really asks and the evidence that settles it.

**A01 Broken Access Control.** Does the application enforce, on the server, what each user is permitted to do and see? This category is first because it is found the most, and because the failure is almost always an omission rather than a mistake — a check that was never written on one endpoint out of forty. Its common shapes: an object identifier in a request that can be changed to reference another user's record and is not checked against the requester's entitlement; a privileged function reachable by requesting its address directly, with the only protection being that the link is not displayed; a permission enforced by the browser interface but not by the endpoint behind it. *Evidence:* two authenticated sessions for two different users, and a request made in user A's session that returns user B's data — with user B's data redacted in the screenshot down to whatever minimal marker proves the identity. Never more than one record.

**A02 Cryptographic Failures.** Is data that requires protection actually protected, in transit and at rest? Transport encryption missing, present but negotiating obsolete protocol versions or weak cipher suites, certificate problems, sensitive data returned in a response that should not contain it, secrets in client-side code or configuration files served to the browser, passwords stored with a fast or unsalted hash. *Evidence:* the negotiated protocol and cipher from a handshake, the certificate details, the raw response containing the data that should not be there, or the configuration setting itself.

**A03 Injection.** Does untrusted input reach an interpreter — a database, an operating system shell, a template engine, an LDAP directory, an XML parser — in a way that lets the input change the *structure* of the instruction rather than only its data? This is the classic category, and the underlying weakness is always the same one regardless of the interpreter: data and code travelling in the same channel with no separation. Cross-site scripting sits here too, where the interpreter is the victim's browser and the injected structure is script in a page. *Evidence:* a differential — a demonstration that the application's behavior changes in a way that only interpreter-level interpretation explains. In practice this is an error message revealing interpreter syntax, a response that changes in a controlled and repeatable way when structurally significant input is supplied, or a benign marker rendering where it should have been treated as text. Evidence stops at *demonstrating the boundary is not enforced*. You do not extract data, you do not enumerate a schema, and you do not run commands. This course does not provide payloads and you do not need them to meet the objective.

**A04 Insecure Design.** Is the weakness in the code, or in the plan? A design flaw cannot be patched by fixing a line — think a password reset flow whose security rests on an answer anyone can look up, a rate limit that does not exist anywhere in the design, or a workflow that trusts a value the client supplies because the original design never considered a hostile client. *Evidence:* a described flow, the assumption it depends on, and a demonstration that the assumption does not hold. This is the category scanners cannot touch at all.

**A05 Security Misconfiguration.** Is the platform set up the way the vendor and the organization intended? Default accounts left enabled, administrative interfaces exposed, directory listing enabled, verbose error pages returning stack traces and file paths, unnecessary features enabled, sample applications still installed, security headers absent, permissions on cloud storage wider than intended. *Evidence:* the setting, the response, or the page itself, captured directly.

**A06 Vulnerable and Outdated Components.** Does the application depend on third-party code with known flaws? This is the one category where the infrastructure model from lesson 04 still applies, and where a software composition analysis tool reading the dependency manifest does the work. *Evidence:* the component and version, where it was identified from, and the advisory that applies — plus, critically, whether the vulnerable function is actually reachable in this application. A vulnerable library that is never called is a hygiene issue, not an exposure, and saying so is what separates a useful report from a dependency dump.

**A07 Identification and Authentication Failures.** Can the application reliably establish who a user is, and keep that established? Session identifiers that do not change after login, sessions that never expire, tokens exposed in URLs, credential-guessing protections absent, recovery flows weaker than the login they protect, multi-factor enforcement that can be skipped by requesting a later step directly. *Evidence:* the observed session or token behavior, captured across the relevant requests. Note the boundary here: you evidence *that a protection is absent* — no lockout observed, session identifier unchanged across authentication — from observation of the mechanism. You do not conduct credential-guessing attacks, and this course does not teach them.

**A08 Software and Data Integrity Failures.** Does the application trust code or data whose origin it cannot verify? Updates fetched without signature verification, build pipelines that accept unverified dependencies, client-supplied serialized objects deserialized without validation. *Evidence:* the absent verification step, documented from configuration or observed behavior.

**A09 Security Logging and Monitoring Failures.** If something happened, would anyone know? Authentication failures unlogged, high-value actions unrecorded, logs held only locally, no alerting, timestamps without time zones, logs containing full credentials or personal data. *Evidence:* the log content — or its absence — after a known, authorized action you performed at a recorded time. This is the one category where your own test traffic is the instrument, and it is also the category where your incident response work in cyb120 is directly relevant: you already know what a responder needs, so you already know what is missing.

**A10 Server-Side Request Forgery.** Can a user cause the server to make a network request to a destination the user chooses? The weakness matters because the server sits somewhere the user does not — inside a network boundary, with credentials attached to its identity. *Evidence:* a demonstration that the server made a request to a destination you specified, captured at a listener you control inside the lab, plus the response behavior that distinguishes it from an ordinary failure.

Beyond the ten, learn **CWE** as the more precise language underneath: `CWE-89` for the SQL-specific case of injection, `CWE-79` for cross-site scripting, `CWE-639` for authorization bypass through a user-controlled key, `CWE-798` for hardcoded credentials. Report titles that carry a CWE are considerably easier to route to the right engineer than titles that carry only an OWASP category.

## Business logic: what no tool will find for you

The most valuable findings in an application assessment are usually the ones that require understanding what the application is *for*.

A discount code that can be applied twice. A quantity field that accepts a negative number and credits the account. A multi-step checkout whose final step can be requested before the payment step. A withdrawal limit checked in the browser before submission and not on the server. A support tool whose ticket viewer allows any employee to open any ticket, which is fine until a ticket contains a customer's full account details. A refund workflow that can be triggered on an order belonging to someone else because the order identifier is the only thing that identifies it.

None of these is a bug in the ordinary sense. Every one is the application doing exactly what it was written to do, in a sequence its author did not anticipate. No scanner will find them, because a scanner has no model of what "should" happen. Finding them requires the least technical and most demanding skill in this lesson: read the application's intended workflow, write down every assumption it appears to make, and then check each assumption individually.

Two habits generate these findings reliably. **Enumerate the assumptions.** For each step in a workflow: what does this step assume about the state the user is in, the values they supply, the order they arrive in, and the identity they hold? **Ask what happens out of order, out of range, and out of role.** What if this step is requested first? What if the value is negative, enormous, empty, or duplicated? What if a different user requests it?

## Evidence, and the principle of minimum necessary proof

Application findings live or die on the evidence, and application evidence has an ethical dimension that infrastructure evidence usually does not: the thing you are proving access to is somebody's data.

The governing principle is **prove existence, not extent**. A finding is confirmed when you have shown that the boundary is not enforced. It does not become more confirmed by showing that you could have taken more. Retrieving one record demonstrates broken access control; retrieving the table is a data breach that you caused, and it will be treated as one.

Concretely, that means an evidence package for an application finding contains:

- **The request**, in full: method, URL, headers relevant to the finding, parameters, and body — with session tokens and credentials masked.
- **The response**, or the part of it that carries the proof, with everything else redacted. A single field is usually enough.
- **The baseline**, meaning the same request made legitimately, so a reader can see the difference. A finding without a baseline is an assertion.
- **The account context**: which user, at what privilege level, in which session. Access control findings are meaningless without it.
- **Timestamps** with a time zone, matching your activity log.
- **Reproduction steps** written for someone who has not seen your screen.
- **Redaction applied before the artifact leaves the evidence store**, not before the report is sent. Reports get forwarded.

Where the finding involves regulated data — personal information, health records, payment card data — the ROE's stop condition applies before the evidence standard does. Capture the minimum that establishes exposure, stop, and escalate.

### Suspicion versus proof

A distinction worth writing on the inside of your eyelids. A scanner flagging a parameter as potentially injectable is a **candidate**. An error message that reveals database syntax is **suspicion** — good suspicion, worth pursuing, still not a finding. A repeatable, controlled behavioral difference that only interpreter-level interpretation explains, captured as request and response with a baseline, is a **finding**.

Reporting suspicion as proof is how testing firms lose clients. Reporting it honestly — as "potential, unable to validate, recommend code review of this parameter" — is entirely respectable and is often exactly what the client needs, because it routes the question to the people who can read the source. That handoff to secure code review is the boundary between this course and net260, and recognizing it is part of your job rather than a failure of it.

## Severity in an application context

CVSS was built for the infrastructure model and it fits applications awkwardly. A base score for "SQL injection" tells you almost nothing, because the same class of weakness ranges from trivial to catastrophic depending on facts CVSS's base metrics do not capture well.

Four questions do more work than the score.

**What data is behind it?** An injection into a public catalog search is not an injection into the billing database. Classify by the data the affected component can reach.

**What does it take to get there?** Unauthenticated and internet-facing is the top of the range. Authenticated as an ordinary user is a large step down but still serious, because ordinary users include anyone who can register. Authenticated as an administrator is often barely a finding at all, since an administrator is already trusted with the outcome.

**How many are affected?** One user's own record, or every record? Access control findings are especially prone to a low-looking severity concealing a total exposure, because the demonstration only ever shows one record.

**What else does it enable?** A single medium finding that provides the foothold for two other mediums is, in combination, a high. Chaining is where an experienced tester earns their fee, and even at your depth ceiling you can and should note the chain in the finding's impact section without executing it.

Where an application is subject to a regulatory regime — payment card data, health information, personal data under a privacy statute — the presence of that data raises the impact independently of the technical severity, and your report should name the regime rather than leaving the client to work it out.

## What an assistant actually does on an application test

Concretely, on a supervised web application engagement, the work assigned to an assistant looks like this.

You are given a **test checklist**, usually derived from the OWASP Web Security Testing Guide, mapping to the categories above. You work it methodically against the assigned functionality and record a result per test case: not applicable, no issue found, potential issue, or confirmed finding — with evidence attached for the last two. Coverage is your deliverable as much as findings are, because "we tested this and found nothing" is a claim the client is paying for.

You maintain the **request log** so any observed behavior can be traced back to what caused it. You **escalate immediately** anything the ROE flags — a critical finding, exposed personal data, evidence of an existing compromise. You **do not pivot**: an application finding that appears to offer access to the underlying host is escalated to the supervisor, who decides whether the scope permits going further. And you **redact as you capture**, because evidence collected sloppily cannot be cleaned up later.

## Practice

Every activity below targets only the instructor-provided, intentionally vulnerable applications on the isolated lab range. Confirm you are pointed at a lab address before each session, keep your activity log running, and apply your rules of engagement — including the stop conditions — exactly as written.

**Part 1 — Map the application.** For one assigned lab application, produce a functional map before testing anything: every page or endpoint you can reach, what it appears to do, what parameters it accepts, whether it requires authentication, and which of the roles you were issued can reach it. Mark the entry points where user-supplied data appears to influence a query, a file path, a rendered page, or an outbound request. Two pages maximum. This map is your coverage baseline for the rest of the exercise.

**Part 2 — Assumption inventory.** Choose one multi-step workflow in the application — registration, checkout, password reset, an approval chain. Write out the steps, and for each step list every assumption it makes about the user's state, the values supplied, the order of arrival, and the identity holding the session. Aim for at least fifteen assumptions. Then mark the three you consider most likely to be unenforced and say why.

**Part 3 — Category identification.** Working the lab application, identify at least one candidate for each of six different OWASP categories. For each, record: the category and a CWE, the functionality affected, exactly what you observed, whether it is a candidate, a suspicion, or a confirmed finding by the definitions in this lesson, and what additional evidence would move it up a level. You are not required to confirm all six — you are required to be accurate about which state each one is in.

**Part 4 — Evidence packets.** Build a complete evidence packet for three confirmed findings, from three different categories, meeting the full standard in this lesson: request, response, baseline, account context, timestamps, reproduction steps, redaction. At least one must be an access control finding demonstrated with two user sessions, and its evidence must contain exactly one record belonging to the other user, redacted to a single identifying marker. Anything larger than that fails the exercise regardless of the finding's quality.

**Part 5 — A logging finding.** At a recorded time, perform two authorized actions on the lab application: one ordinary successful login, and one failed login with an account you were issued. Then examine whatever logging the application exposes to you and write a finding — or a documented absence of one — covering: whether the events were recorded, what fields were present, whether the timestamps carry a time zone, whether anything sensitive appears in the log, and what a responder in a real incident would be unable to establish from it. Relate your answer explicitly to what you learned about response in cyb120.

**Part 6 — Severity and handoff.** Rate each of your three confirmed findings using the four questions in this lesson, and state a severity with the reasoning attached. Then identify one finding that you can characterize but not fully diagnose from the outside, and write the two-sentence handoff note requesting a secure code review of the specific component — naming what you observed, what you could not establish, and what the reviewer should look at.

**Deliverable:** one document containing Parts 1, 2, 3, 5, and 6, with the Part 4 packets as attachments. A reviewer must be able to determine, for any finding you report, whether it is proof or suspicion — and must find no data in your evidence beyond the minimum needed to establish the issue.
