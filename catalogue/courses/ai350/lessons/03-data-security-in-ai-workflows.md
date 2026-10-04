---
lesson_id: ai350-03
course_id: ai350
pathway: prompt-engineer
title: Data Security in AI Workflows
order: 3
kind: lesson
competency_ids:
  - D6-S1-C02
objectives:
  - Apply data-security practices to an AI workflow, covering secrets, least
    privilege, logging, and third-party model exposure
---

## Start with an inventory, not a control

The instinct after a threat model is to start bolting on protections. Resist it for one hour. You cannot protect data you have not listed, and almost every AI workflow contains more sensitive data than its builder remembers putting there — because the model step tends to receive a whole record when it needed one field.

So the first artifact is a **data inventory**: one row for every distinct piece of data that enters, moves through, or leaves your workflow. Fill it in by walking the flow diagram you drew in the previous lesson, step by step, writing down what is actually in the payload rather than what you intended to put there. Open a real run history and read it; you will find surprises.

```text
| Data element      | Source        | Sensitivity | Sent to model? | Stored where            | Retention | Owner  |
|-------------------|---------------|-------------|----------------|-------------------------|-----------|--------|
| Customer email    | Inbound mail  | Personal    | Yes            | Run history, CRM        | 30d / life| Support|
| Customer name     | CRM lookup    | Personal    | Yes            | Run history, CRM        | 30d / life| Support|
| Invoice amount    | Billing API   | Confidential| Yes            | Run history             | 30d       | Finance|
| Account notes     | CRM lookup    | Confidential| Yes            | Run history             | 30d       | Support|
| Payment card last4| Billing API   | Regulated   | No             | Billing system only     | n/a       | Finance|
| Model draft reply | Model vendor  | Confidential| n/a            | Run history, mailbox    | 30d / life| Support|
| API key (CRM)     | Platform vault| Secret      | No             | Platform vault          | rotate 90d| You    |
```

Four columns do most of the work. **Sensitivity** forces a judgement call — a workable four-level scale is public, internal, personal, and regulated. **Sent to model?** is the column that changes designs, because it makes visible how much of the record crosses a vendor boundary for no reason. **Stored where** catches the copies you forgot: run histories, debug spreadsheets, error channels. **Retention** is the column nobody can answer on the first pass, which tells you something.

The rule that falls out of the inventory is the one to internalise: **the cheapest security control available to you is not sending the data.** Before any of the practices below, delete rows from your prompt. A triage classifier needs the message text; it does not need the account balance, the customer's address, or the internal notes. Every field you remove eliminates an exfiltration path, a vendor exposure, a log entry, and a privacy obligation simultaneously.

## Secrets: the identity behind every step

You already know the mechanics of connecting a tool and where a platform stores that connection. The security question is different: **who is your automation, and what happens when that identity is stolen or leaves?**

Four rules cover the practice.

**Secrets live in the platform's credential store, and nowhere else.** Use a supported credential vault or protected connector connection. A Make data store or an Airtable field is an ordinary data store, not a secrets vault. A key belongs in the connector configuration, never in a text field, a formula, a code step's literal string, a spreadsheet cell, a comment, or a prompt. The reason is not tidiness: those locations are copied, exported, screenshotted, and shared with people who need the workflow but not the key.

**Never put a secret in a prompt.** This is the AI-specific version of the rule and it is violated constantly. Anything in the prompt goes to the vendor, lands in your run history, and can be echoed back by the model. If a workflow "needs" a token in the prompt so the model can call something, the design is wrong — the workflow should make the call.

**One identity per workflow, owned by the organisation.** Automations authorised with a personal account inherit that person's permissions and die when they leave. Use a service account or a dedicated integration user with its own credential, owned by a team, with the owner recorded somewhere findable.

**Rotate on a schedule and on every departure.** Write the rotation interval and the last rotation date into your inventory. Ninety days is a common default. Also rotate immediately whenever a key might have been seen — a screenshot, a shared export, an ex-contractor's access.

Keep a small register alongside the inventory:

```text
| Credential     | Identity used        | Scopes granted        | Stored in       | Rotated    | Owner |
|----------------|----------------------|-----------------------|-----------------|------------|-------|
| CRM API key    | svc-automation@corp  | read:contacts         | Platform vault  | 2026-05-02 | You   |
| Model API key  | org billing account  | inference only        | Platform vault  | 2026-04-18 | You   |
| Mailbox OAuth  | svc-support@corp     | read, send-as support | Platform vault  | n/a (OAuth)| Ops   |
```

A note on where this bites in no-code platforms specifically. The platforms you work in are built for sharing — that is their value — and sharing is exactly what a secret must not do. Three recurring traps. A **shared workspace or team plan** often means every member can open every connection and every run history, and connections rarely show who authorised them. A **duplicated or exported scenario** may carry configuration to wherever it is sent, so treat exports as sensitive artifacts and check what a template actually contains before you import someone else's. And a **spreadsheet or database used as a configuration table** — a very natural pattern when you have been building with Airtable — becomes a secrets store the moment somebody puts a key in a field, at which point every view, share link, and CSV export of that table is a disclosure. If a workflow genuinely needs a key that the platform's credential store cannot hold, that is a design problem to escalate, not a cell to fill in.

## Least privilege, applied to an automation

Least privilege means each identity holds the narrowest permissions that let the workflow succeed, and nothing more. It is the control that converts a total compromise into a contained one.

Ask three questions of every connection:

**What scopes did I actually grant?** Most people accept whatever the connect dialog offered. Go back and look. A triage workflow that only reads and replies does not need permission to delete records or manage users. Where the vendor offers granular scopes or read-only tokens, take them.

**What can this identity reach beyond the workflow?** An API key with account-wide access can read every record in the system, not just the ones your automation touches. Where the platform supports it — Airtable base-scoped tokens, database users limited to one schema, per-table permissions — scope the identity to the data the workflow needs.

**Which steps could cause irreversible harm, and are they gated?** Sending to a customer, publishing, deleting, refunding, and writing to a system of record are the ones to look at. Least privilege at the workflow level means the model proposes and a constrained step disposes: the model returns a category and a draft, and a downstream step with a fixed recipient and a validated field set performs the action. This is the same conclusion the injection example reached from the other direction, which is a good sign.

Apply the same thinking to the humans. Who can open the automation and read its run history? On most no-code platforms, "everyone in the workspace" is the default answer, and the run history contains every prompt you ever sent. Restrict workspace membership, use folders or team permissions where the platform offers them, and treat the run history as a data store subject to the inventory above — because it is one.

## Logging: enough to debug, not enough to leak

Logs are where security-conscious builders leak the most data, because logging feels harmless and is enormously useful. Resolve the tension by deciding, in advance, what each log line may contain.

The default for an AI workflow should be **log the metadata, not the content**. You almost always need: timestamp, workflow and step identifier, run id, model and version, token counts and latency, the classification or decision produced, whether a validation check failed, and an outcome. You almost never need the full customer message stored for thirty days.

Where you genuinely need content — usually to debug prompt quality — apply a redaction rule set before it is written:

```text
| Rule | Pattern / field                 | Action                              |
|------|---------------------------------|-------------------------------------|
| R1   | Email addresses                 | Replace with hash of the address     |
| R2   | Phone numbers                   | Mask all but last 2 digits           |
| R3   | Named fields: ssn, dob, card_*  | Drop entirely, never log             |
| R4   | Full prompt body                | Redact content first; then 200 chars + original length         |
| R5   | Model response                  | Log full text only if flagged for review |
| R6   | Any field marked Regulated      | Drop entirely, never log             |
| R7   | Credentials, tokens, auth headers| Drop entirely, never log            |
```

Three more logging practices matter specifically for AI work. **Set a retention period and enforce it** — platform run histories often have a configurable window, and a scheduled cleanup can trim any log table you own. **Log the decision, not just the text**, because when you are asked six months from now why a customer was routed a particular way, the classification and the model version answer the question and the prose does not. And **never route raw model output into a shared chat channel** for error alerting; send the run id and let whoever needs the content open it in a permissioned place.

There is a real tension here with the monitoring you will build later in the course: you cannot review output you did not keep. Resolve it deliberately rather than by accident — keep flagged and sampled outputs under the redaction rules, in a restricted location, for a stated period, and discard the rest.

## Third-party model exposure

Everything above is inside your perimeter. The moment a prompt leaves for a hosted model, you are relying on a contract and a configuration rather than on anything you control. This is the exposure that most distinguishes an AI workflow from an ordinary one, and it is the one your organisation's reviewers will ask about first.

Answer these questions for every model vendor in your stack, in writing, with a date and a source:

```text
| # | Question                                                        | Answer | Evidence (doc + date) |
|---|-----------------------------------------------------------------|--------|-----------------------|
| 1 | Is our input used to train or improve their models? Can we opt out?|      |                       |
| 2 | How long is input and output retained, and can it be reduced?     |        |                       |
| 3 | Who at the vendor can access retained content, and under what process? |   |                       |
| 4 | In which countries or regions is data processed?                  |        |                       |
| 5 | Which subprocessors are involved, and are we notified of changes?  |        |                       |
| 6 | Is there a data processing agreement in place, and who signed it? |        |                       |
| 7 | Is data encrypted in transit and at rest on their side?           |        |                       |
| 8 | What are the deletion commitments if we terminate?                |        |                       |
| 9 | Do the terms differ between the consumer app, the business tier, and the API? |  |          |
```

Question nine catches the most common real mistake. On many platforms, pasting a document into the consumer chat product and sending the same document through the paid API sit under different terms with different retention and training defaults. Teams often evaluate on the consumer product, confirm "the terms are fine," and then never re-check when they move to the API — or, worse, an employee keeps using the consumer product for real customer data because that is where they learned it.

Two practices follow. **Configure the account before you build**: turn off training on your data where a toggle exists, set the shortest retention the plan allows, choose the regional endpoint if your data has residency requirements, and restrict who holds keys. **Then match data class to destination.** A short table on the wall settles a hundred future arguments:

```text
Public / internal data      -> any approved model vendor
Personal data               -> only vendors with a signed DPA and training disabled
Regulated data              -> not sent to a general-purpose model without a named approval
Secrets / credentials       -> never, under any circumstance
```

Two closing notes. First, "approved vendor" has to be a real list that someone maintains, or your organisation will accumulate shadow AI tools that no one has reviewed — the personal account, the browser extension, the plugin somebody installed. Ask who maintains the list; if the answer is nobody, that is a finding worth raising. Second, several of the questions above are also the raw material for the privacy work in the next lesson: lawful handling of personal data depends on knowing where it goes, how long it stays, and who else touches it. Do this table properly now and the next lesson gets much easier.

## Pulling it together: a control set, not a control

The five practices above are worth restating as a sequence, because their order is not arbitrary and applying them out of order wastes effort.

You **inventory** first, because every later decision needs to know what data exists and how sensitive it is. You **minimise** second, because deleting a field is cheaper than protecting it and removes work from every subsequent step. You **scope identities** third, because that determines the blast radius when something does go wrong. You **constrain logging** fourth, since logs are the copy that outlives the run. And you **assess the vendor** last, because by then you know exactly which data classes you are asking them to hold, which turns a vague question — "are they secure?" — into an answerable one: "do their terms permit us to send this specific category of data, and can we get it deleted?"

Two failure patterns are worth naming so you can recognise them in your own work. The first is **protecting the wrong thing**: elaborate care around the model API key while a spreadsheet of customer records sits in a shared folder feeding the same workflow. The inventory prevents this, which is why it comes first. The second is **the one-time review** — a careful assessment at launch that nothing revisits, while the workflow accretes new steps, new fields, and new destinations for a year. Set a re-check trigger instead of a date: any new data source, any new external destination, any new credential, and any change of vendor or plan tier means the inventory and the vendor questionnaire get reopened. Ten minutes then is worth a great deal more than a thorough review that is eighteen months stale.

Finally, be realistic about your authority. Several controls in this lesson are not yours to implement — you cannot sign a data processing agreement, you probably cannot create a service account, and you may not be able to change a workspace's membership. Your job is to identify the gap precisely, name who owns the fix, and write it down. An apprentice who arrives at a review with an accurate inventory, a specific list of what they fixed themselves, and a short list of what they need someone else to fix is doing the job correctly.

## Practice

Continue with the same workflow you threat-modelled in the previous lesson.

1. **Build the data inventory.** Open an actual run history and complete every column of the inventory table for every data element that appears. Do not work from memory or from the design document — work from the payload. Mark each element public, internal, personal, or regulated.
2. **Delete something.** Identify at least one field you are sending to the model that the task does not need. Remove it from the prompt, re-run the workflow, and confirm the output quality is unchanged. Record what you removed and what it eliminated from the inventory.
3. **Fill in the credential register.** List every credential the workflow uses, whose identity it is, what scopes it holds, and when it was last rotated. Flag any credential owned by a personal account or holding broader scopes than the workflow needs, and write the specific change you would make.
4. **Write your redaction rule set.** Adapt the seven-rule table to your workflow's actual fields, then implement at least one rule — a truncation, a masked field, or a dropped field — in the step that writes your logs or debug records.
5. **Complete the vendor questionnaire.** Answer all nine questions for the model vendor you use, citing the specific documentation page and the date you read it. Where you cannot find an answer, write "unknown — need to ask" and name who you would ask. An honest unknown is a valid deliverable; a guess is not.
6. **Summarise.** In one paragraph, state which single change from this lesson most reduced your workflow's exposure, and which exposure you cannot fix yourself and will have to escalate.

## Check your understanding

1. Why does the inventory come before any other control? *Because every later choice — what to minimise, how to scope identities, what to log, what to ask the vendor — depends on knowing what data exists and how sensitive it is.*
2. A workflow "needs" an API token in the prompt so the model can call a service. What is wrong, and what is the fix? *Anything in the prompt goes to the vendor, the run history, and can be echoed back. The workflow, not the model, should make the call using a credential from the platform's credential store.*
3. Your team evaluated a model vendor's consumer chat product and found the terms acceptable. Why is that not enough before sending customer data through the API? *Consumer, business, and API tiers often have different retention and training terms; question 9 of the vendor questionnaire must be answered for the tier you actually use.*
