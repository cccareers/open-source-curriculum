---
lesson_id: ai102-11
course_id: ai102
pathway: prompt-engineer
title: Authentication and Credential Management
order: 11
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Configure and manage credentials for connected tools without exposing secrets
---

## The part that outlives the build

Every integration you have made so far rested on a credential. You clicked "connect," a window opened, you signed in, and the platform stored something on your behalf. That something is now the reason your automations work — and it is the single most common cause of a working system quietly breaking six months later, and the most consequential thing in your build if it leaks.

Three failure stories, all ordinary. An automation runs for a year and then stops overnight, because it was authorised by an employee who left and whose account was deactivated. A team's chat channel fills with error messages because a token expired and nobody had a note of when it would. A repository, a screenshot in a support ticket, or a text field in a database contains an API key that grants full write access to a production system, and nobody knows how long it has been there.

None of these are exotic. They are the default outcome of connecting things without a policy. This lesson is that policy.

Start from one framing: **a credential is an identity, not a setting.** When your workflow calls an API, the other system does not see "an automation." It sees a user or an application, with that identity's permissions, and it records the action under that name. Every question below follows from taking that seriously — whose identity is this, what may it do, how long does it last, who else can use it, and how do we take it away.

## The schemes you will meet

Five authentication schemes cover almost everything in no-code work. You need to recognise each, know where the credential goes in the request, and know its failure mode.

**API key.** A long random string, sent in a header or a query parameter.

```text
Authorization: Bearer sk_live_9f2a...        (common)
X-API-Key: 9f2a...                           (also common)
?api_key=9f2a...                             (avoid where possible)
```

Simple and durable. Usually does not expire, which is convenient and is also the problem — a leaked key works forever until someone revokes it. Prefer keys sent in headers over keys in query strings, because URLs end up in server logs, browser history, and referrer headers in a way that headers do not.

**HTTP Basic.** A username and password encoded into a header. Rare in modern APIs and worth flagging when you meet it, because it usually means the credential is a real account password with a human's full permissions.

**OAuth 2 — authorisation code flow.** The scheme behind almost every "Connect your account" button. You are redirected to the provider, you approve a specific list of **scopes**, and the platform receives an access token plus a refresh token. The access token is short-lived and the refresh token renews it automatically. This is the best available option for connecting a user's account to a platform, because the platform never sees the password, the permissions are explicit, and the grant can be revoked from the provider's side.

The catch is the one from the story above: the grant belongs to **the person who clicked approve**. Their permissions bound it, their departure ends it.

**OAuth 2 — client credentials flow.** No user at all. An application id and secret are exchanged for a token that represents the *application*. This is what you want for a system-to-system integration, when the provider offers it, because there is no human account in the chain.

**Signed requests.** The caller computes an HMAC over the request using a shared secret, as in the previous lesson's inbound verification. The secret itself never travels, which is its advantage. It is more work to configure and less common in no-code.

Two related mechanisms are worth naming even though they are not authentication. **Service accounts** — a non-human account in the destination system, created specifically to be used by integrations — solve the ownership problem for products that do not offer client credentials. And **scoped tokens**, where the provider lets you create a key limited to particular resources or actions, are how you narrow the blast radius when the API is all you have.

## Where the credential lives

Every platform stores connections in a credential vault, and the important thing to know is the boundary of that vault.

In a prebuilt connector, you authorise once and the platform stores the token encrypted. You cannot read it back, which is a feature: it means a colleague who opens your workflow can *use* the connection without *seeing* the secret. Use prebuilt connectors wherever they exist, precisely for this.

In an HTTP step from lesson 09, you have to supply the header yourself, and this is where people go wrong. Typing the key directly into the header field puts a plaintext secret into the workflow definition — visible to anyone who can open the workflow, present in any export, and captured in screenshots. Both platforms provide a way to avoid it: Make lets you create a **custom connection or keychain entry** and reference it, and the list-shaped platform offers **stored authentication** attached to a custom request. Use those. Where a platform genuinely offers nothing, treat that as a finding to raise rather than a reason to paste the key.

The places a secret must never be, stated plainly, because each has happened to someone:

- In a field of a database record, or a note, or a task description.
- In a workflow's name, description, or a comment on a step.
- In a URL as a query parameter, when a header is available.
- In a chat message, a support ticket, a screenshot, or a screen recording.
- In a spreadsheet of "our API keys," shared with the team.
- In a personal password manager only, with no organisational copy — which is the same problem as the departing employee, arriving later.

Where a secret does need to be shared between people, the answer is a team password manager or a secrets vault, with an entry per credential recording what it is for, who owns it, and when it was created.

## Scope: give it the least it needs

When you authorise a connection, you are usually shown a list of permissions, and the default is to click through. Read them instead, and ask a specific question about each: does the automation you are building actually need this?

The reasoning is straightforward. A leaked read-only key exposes data. A leaked write key lets an attacker change data. A leaked admin key lets them change permissions and delete audit trails. The difference between those outcomes is a checkbox you clicked in twenty seconds.

Practically, this means a small amount of discipline at connection time.

**One connection per purpose, not one connection for everything.** A workflow that reads a calendar should hold a calendar-read connection, not a full-account grant that also covers mail and files. When the provider allows several scoped keys, create several.

**Read-only wherever the workflow only reads.** A surprising fraction of integrations never write, and the ones that do usually write to one place.

**Separate credentials for development and production.** A test workflow should not be able to touch live data. Where the provider offers a sandbox, use its credentials; where it does not, use a separate account or a scoped key limited to test resources. Name them so nobody confuses them: `booking-api — PROD (write)` and `booking-api — TEST (write)`.

**Name every connection so its scope is legible in a list.** Platforms show connections as a list of names, often shared across a workspace. `dana@northgate.example` tells the next person nothing. `Bookings API — prod — read+write bookings only — owner: ops team` tells them what they are about to reuse.

**Do not reuse a connection across environments or teams because it is already there.** Reuse is how a test workflow ends up writing production records.

## Ownership, or the departing-employee problem

Ask, for every connection in your build: **if this person left tomorrow, what breaks?**

The answer is usually "everything they connected." OAuth grants belong to a user account; when the account is deactivated, the grant dies with it. API keys created under a personal account often go the same way.

Three mitigations, best first.

**Use a service account.** Create a dedicated non-human account in the destination system — `automation@yourcompany.example` — give it exactly the permissions the automations need, and authorise every connection from it. Its mailbox goes to a shared inbox or a team alias, its password lives in the team vault, and its multi-factor authentication is registered to a shared device or a vault-backed authenticator. Nobody's departure affects it. This is the single highest-value practice in this lesson, and it is usually skipped because it takes an hour to set up.

**Use client-credentials OAuth or an organisation-owned API key** where the provider offers one, which achieves the same thing without a fake user.

**At minimum, record ownership.** A table with one row per connection: what system, what scheme, whose identity, what scopes, which workflows depend on it, where the secret is stored, when it was created, when it expires. That table is what makes an offboarding checklist possible instead of a scavenger hunt.

Note that even a service account needs an owning *team*, or it becomes an orphan nobody dares touch. Record a team, not a person.

## Expiry, rotation, and renewal

Credentials end. Design for it rather than discovering it.

**Short-lived access tokens with refresh tokens** renew themselves, and the failure mode is subtler: the refresh token itself can expire after a period of disuse, or be invalidated by a password change or a provider policy. A connection that has not run for two months may be dead.

**API keys** typically do not expire, which means they should be **rotated on a schedule** anyway — a key that has been valid for three years has had three years of opportunities to leak. Rotate at least annually, and immediately whenever someone with access leaves.

**Rotation without downtime** follows a fixed sequence, and it is worth writing down because doing it out of order causes an outage:

1. Create the new credential alongside the old one; most providers allow two active keys.
2. Update the connection in the platform to the new value.
3. Run one workflow using it and confirm success in the run history.
4. Confirm from the provider's usage log that the old key is no longer being used.
5. Revoke the old credential.
6. Update your connection register with the new creation date.

Skipping step 4 is how you discover a second workflow you had forgotten about.

**Monitor for expiry** rather than waiting for failure. Two mechanisms: record the expiry date in the connection register and run a scheduled workflow that alerts thirty days ahead; and treat a `401` from any step as a distinct, high-priority alert rather than a generic error, since an authentication failure means "a human must act now" and no amount of retrying will help. That is the branch you built in lesson 09.

## When a secret leaks

Assume it will happen once in your career, and know the sequence so it takes ten minutes rather than a day of debate.

**Revoke first, investigate second.** The instinct is to work out how bad it is before acting. Reverse it: a revoked key cannot be misused while you investigate, and re-creating one costs minutes. Revoke, then look.

**Then, in order:** issue a replacement and update the connections that used it; check the provider's audit or usage log for activity you cannot account for, over the whole period the secret was exposed; remove the secret from wherever it leaked, remembering that deleting a chat message or a commit does not remove it from history or from anyone's screenshot; tell whoever needs to know internally, and follow your organisation's process if customer data may be involved; and write down the specific mechanism that allowed it, because "we will be more careful" is not a fix and the same mechanism will produce the same leak.

The most common mechanisms in no-code work, and their fixes: a key typed into an HTTP header field and then exported or screen-shared (use the platform's credential store); a key in a spreadsheet shared too widely (use a vault); a key in a URL captured in logs (use a header); and a workflow duplicated to a personal account for testing, carrying the production connection with it (use separate test credentials).

## An access and offboarding routine

Two recurring habits turn all of the above from knowledge into practice.

**A quarterly access review.** Open the platform's connections list and, for every entry, answer four questions: is anything still using this; is the scope still the minimum; is the owner still here; and when was it last rotated. Delete unused connections — an unused credential is pure risk with no benefit. Then do the same in the destination systems, where you will typically find keys the platform no longer knows about.

**An offboarding checklist that includes automations.** When someone leaves, standard practice covers email and file access. It rarely covers "which automations run under their identity," and that is the gap this lesson exists to close. Your connection register makes it a five-minute task: filter to that person, reauthorise each connection from the service account, verify each affected workflow runs, and only then deactivate their account. Doing it in the other order means finding the affected workflows by watching them fail.

Add one more artefact to the handover documentation you will write in lesson 15: for each connection, what it is, who owns it, what breaks without it, and how to re-establish it. Someone will need that at a bad moment.

## Practice

Use the platforms, base, and API from lessons 03 through 10.

1. **Build the connection register.** Create a table with one row per credential in your build, with columns for system, auth scheme, identity used, scopes granted, where the secret is stored, workflows depending on it, created date, expiry or rotation due date, and owning team. Fill it in completely for every connection you currently have. Note any row where you cannot answer a column, because those are your findings.

2. **Classify every scheme.** For each connection, state which of the five schemes it uses, where in the request the credential travels, and whether it expires. Verify at least two of these by inspecting an actual request rather than assuming.

3. **Move a plaintext secret into a credential store.** Take the HTTP step from lesson 09 with its `Authorization` header, move the key into your platform's connection or keychain mechanism, and reference it. Then export or share the workflow and confirm the secret is not in the exported definition.

4. **Reduce a scope and prove the reduction.** Take one connection authorised with broad permissions and re-create it with the minimum the workflow needs. Run the workflow to show it still works. Then attempt an operation outside the new scope and record the exact error you receive.

5. **Set up a service account.** Create a non-human account in one destination system, grant it only what the automations need, store its credentials in a shared vault, and re-authorise at least one connection from it. Run the workflow, then simulate the departure by disabling your personal account's access to that system and show the workflow still runs.

6. **Separate test from production.** Create distinct credentials for a test and a production target, name both to the convention in this lesson, and point a duplicate of one workflow at the test credential. Demonstrate that the test copy cannot write to production data, and describe what would have happened had you duplicated the workflow without changing the connection.

7. **Rotate a key with no downtime.** Follow the six-step sequence on a real API key. Capture evidence at each step, including the provider's usage log showing the old key going quiet before you revoked it. Report how long it took and which step you were tempted to skip.

8. **Handle a `401` deliberately.** Corrupt a credential, run the workflow, and show that the failure is caught, is not retried, produces a distinct high-priority alert naming the connection, and lands in the exceptions table. Restore it and confirm recovery.

9. **Run a leak drill.** Pick one credential and walk the full response sequence on paper against a real timeline: exactly where would you revoke it, where is the replacement issued, which workflows need updating, where is the provider's audit log, and who is told. Then run steps one and two for real on a low-value test key and time it.

10. **Do a quarterly review now.** Go through every connection in both platforms and answer the four review questions. Delete what is unused, and write a short list of the changes you made and the two riskiest items remaining in your build.
