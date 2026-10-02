---
lesson_id: ai201-08
course_id: ai201
pathway: prompt-engineer
title: Intelligent Email Triage and Routing
order: 8
kind: lesson
competency_ids:
  - D3-S1-C03
objectives:
  - Build an email triage workflow that classifies, routes, and drafts responses under human review
---

## The shared inbox problem

A shared inbox is where a business's inbound work arrives undifferentiated. Someone opens it each morning and performs three separate jobs at once: working out what each message is, deciding who should handle it, and answering the easy ones. Those three jobs have different automation profiles, and the first step in building triage is to stop treating them as one.

**Classification** is structured interpretation over text — a good fit for an AI step. **Routing** is a rule over the classification result — plain logic, no model. **Drafting a response** is generation, and it is the part with teeth, because a wrong draft that reaches a customer is a public mistake made in your company's name.

So this lesson builds classification and routing to run automatically, and drafting to run into a review queue. **No message this workflow produces is sent to a customer without a person approving it.** That is not a phase-one caution to be relaxed later; it is the design.

## Inbox triggers and their sharp edges

Email triggers have failure modes that no other trigger has, and every one of them has burned somebody.

**Auto-reply loops.** Your workflow replies to an address that auto-replies, which triggers your workflow again. At two messages per second this is noticed quickly and remembered forever. Defences, all of them: never act on messages whose headers indicate automation (`Auto-Submitted`, `X-Auto-Response-Suppress`, a `List-*` header, a `Precedence: bulk` header); never reply to addresses matching `no-reply`, `noreply`, `mailer-daemon`, `postmaster`, or `bounces`; and hard-cap outbound messages per thread per day in a counter you check before sending.

**Threading.** A reply on an existing case is not a new case. Match on the `In-Reply-To` and `References` headers first, then on a case token you put in the subject line (`[CASE-2026-0311-0142]`), then on sender plus normalized subject within a window. A triage workflow that opens a new case for every reply produces a queue nobody can work.

**Your own mail.** Filter out messages sent by your own workflow and by internal senders, or the loop closes from the inside.

**Attachments and forwards.** A forwarded complaint contains two messages; the classifier will happily categorize the wrapper. Strip quoted history before classification (cut at the first `On <date>, <name> wrote:` or `-----Original Message-----` boundary) and classify only the new text, while keeping the full body on the record.

**Dedupe.** Use the `Message-ID` header as the natural key. Mail systems redeliver.

## Designing the taxonomy

The taxonomy is the most consequential design artifact here, and it is the one people rush. Three rules.

**Categories must be mutually exclusive and collectively exhaustive.** If a message can legitimately be two categories, your reviewers will disagree with each other and you will never be able to measure accuracy. Merge or split until each message has exactly one right answer.

**Priority is a separate dimension from category.** "Urgent" is not a category. A billing question and a service outage can both be urgent; they go to different teams. Model them as independent fields.

**Include an explicit `other` bucket, and watch it.** A taxonomy with no escape forces the classifier to squeeze messages into wrong categories. The `other` pile is your feedback loop: when it exceeds roughly 10% of volume, or when one theme dominates it, you have found the category you are missing.

A workable starting taxonomy for a service business:

| category | definition | queue | sla_hours |
| --- | --- | --- | --- |
| `quote_request` | Asking for pricing on new work | `quotes` | 8 |
| `order_status` | Asking about existing work in progress | `ops` | 4 |
| `billing_question` | Invoices, payments, statements | `billing` | 24 |
| `complaint` | Expressing dissatisfaction with delivered work | `service_lead` | 2 |
| `document_submission` | Sending a document with no question attached | `ops` | 24 |
| `vendor_or_sales` | Inbound sales, partnership, recruiting | `archive` | none |
| `other` | Anything not clearly the above | `triage_review` | 8 |

Write a one-line definition per category and two or three real example messages per category. Those examples are simultaneously your prompt's few-shot material, your reviewers' guide, and your evaluation set's specification. If two people cannot label your test set the same way, no model can.

## The classification step

One call, strict JSON, closed vocabulary, per-field confidence, and an explicit rationale the reviewer can read.

```text
You classify inbound customer email for a freight services company.

Return only this JSON object:
{
  "category": "quote_request" | "order_status" | "billing_question" | "complaint" |
              "document_submission" | "vendor_or_sales" | "other",
  "category_confidence": 0.0-1.0,
  "priority": "low" | "normal" | "high",
  "priority_reason": "<short phrase>",
  "sentiment": "positive" | "neutral" | "negative",
  "entities": {
    "order_reference": string|null,
    "invoice_number": string|null,
    "requested_date": "YYYY-MM-DD"|null,
    "company": string|null
  },
  "requires_human": true|false,
  "rationale": "<one sentence, maximum 25 words, citing what in the message decided it>"
}

Category definitions:
- quote_request: asks for pricing or availability for work not yet ordered.
- order_status: asks about work already booked or in progress.
- billing_question: concerns an invoice, payment, statement, or refund.
- complaint: expresses dissatisfaction with work delivered or service received.
- document_submission: sends a document or form with no question attached.
- vendor_or_sales: inbound sales, partnership, recruiting, or marketing.
- other: does not clearly fit any category above.

Rules:
- Exactly one category. If two fit, choose the one the sender most wants acted on.
- If no category clearly fits, use "other" with confidence below 0.5. Do not force a fit.
- Set an entity to null when the message does not state it. Never infer.
- Set requires_human true if the message mentions legal action, a regulator, a data
  breach, personal injury, a safety incident, cancelling the account, or a person by
  name in a grievance. When in doubt, set it true.
- priority high requires a stated deadline within 48 hours, an active service failure,
  or a complaint. Otherwise normal or low.
- Judge only the message text provided. Do not use prior knowledge of the company.

Message (quoted history removed):
{{clean_body}}

Subject: {{subject}}
From domain: {{sender_domain}}
Known customer: {{is_known_customer}}
```

The `requires_human` field is a hard override, deliberately separate from confidence. Some messages must reach a person regardless of how confidently the model classified them, and that list should be conservative and reviewed by whoever carries the legal risk. Keyword pre-screening in plain logic complements it: run a regex for the same terms before the model call and set the flag if either the rules or the model raise it. Two independent detectors, `OR`-ed.

`rationale` costs you a sentence of output and buys reviewers the ability to spot a systematically wrong reason. When ten rationales all say "mentions invoice," you learn your classifier is keying on a word rather than an intent.

## Routing

Routing is pure logic over the classification output, expressed as an ordered table where the first match wins. Order matters: the overrides come first.

```text
1. requires_human = true                       -> queue: service_lead,   sla: 1h,  draft: none
2. category_confidence < 0.70                  -> queue: triage_review,  sla: 4h,  draft: none
3. category = complaint                        -> queue: service_lead,   sla: 2h,  draft: acknowledge_only
4. category = vendor_or_sales                  -> queue: archive,        sla: -,   draft: none
5. category = quote_request, priority = high   -> queue: quotes_priority,sla: 2h,  draft: full
6. category = quote_request                    -> queue: quotes,         sla: 8h,  draft: full
7. category = order_status, order_reference set-> queue: ops,            sla: 4h,  draft: full
8. category = order_status                     -> queue: ops,            sla: 4h,  draft: clarify
9. category = billing_question                 -> queue: billing,        sla: 24h, draft: full
10. anything else                              -> queue: triage_review,  sla: 8h,  draft: none
```

Three things this table encodes that a nest of branches would hide. **Low confidence routes to humans without any draft**, because a draft written from a wrong classification is worse than no draft — it anchors the reviewer. **Complaints get an acknowledgement draft only**, never a substantive answer, because the substantive answer requires facts and judgement the workflow does not have. **The last row is a default with an owner and a clock**, so nothing is ever unrouted.

Routing writes `queue`, `owner`, `sla_due_at`, and `draft_mode` onto the case record and advances the status to `awaiting_review`. Nothing has been sent.

## Drafting under review

The draft step is a separate call from classification, receives the classification result as input, and is given only the facts the workflow actually holds.

```text
You draft a reply for a human agent to review, edit, and send. You are not sending it.

Inputs:
- The customer's message
- The classification result
- Approved policy snippets retrieved for this category
- Known facts about this customer from our systems (may be empty)

Rules:
- Use only the policy snippets and known facts provided. Never state a price, a date,
  a lead time, a policy, or a commitment that is not in your inputs.
- When the reply needs a fact you were not given, insert a bracketed placeholder such
  as [CONFIRM PICKUP DATE] rather than inventing it. Placeholders are expected and
  welcome; invented facts are not.
- Do not apologize on the company's behalf for something not established in the inputs.
- Do not offer a refund, discount, credit, exception, or escalation commitment.
- Length: under 150 words. Plain sentences. Match the customer's formality.
- End with the next concrete step and who will take it.
- Output only the message body. No subject line, no signature block.

Customer message:
{{clean_body}}

Classification:
{{classification_json}}

Policy snippets:
{{retrieved_snippets}}

Known customer facts:
{{customer_facts_json}}
```

The placeholder rule is the most important line in that prompt. It converts the model's most dangerous instinct — filling a gap with something plausible — into a visible marker a reviewer must resolve. Enforce it downstream: a draft containing no placeholder where a required fact was missing from the inputs is a draft to distrust, and a bracketed placeholder that reaches the send step is a blocking error.

**Design the reviewer's screen for a person working a queue at speed.** Side by side: the customer's message with quoted history collapsed, the classification with its confidence and rationale, the retrieved policy snippets with their source, and the editable draft. Four actions, all one click: **send as-is**, **edit and send**, **reclassify** (which re-runs routing and drafting), and **escalate**. Show the SLA clock. Show whether this is a repeat contact on the same case.

Then capture everything. The reviewer's action, the final text sent, and the diff between draft and sent text. That diff is your improvement dataset, and reading twenty of them will tell you more about your prompt than any amount of theorizing. If reviewers consistently delete your opening sentence, delete it from the prompt.

Send only from the reviewed record, gated on `status = approved`, with an idempotency check on the outbound message ID so a replayed run cannot send twice. Write the sent message and its ID back onto the case.

## Measuring triage

Four numbers, reviewed weekly:

**Classification accuracy** against a held-out labeled set of at least 200 messages, reported per category. Aggregate accuracy hides the category that is failing. Watch for the classic pattern where a rare category has excellent precision and terrible recall — the model almost never picks it, and when it does it is right.

**Edit rate and edit distance** on drafts. A high edit rate with small edits means the draft is useful and the tone is off. A low edit rate with occasional huge edits is the dangerous shape: reviewers are rubber-stamping, and the rare bad draft is going out.

**Time to first response**, median and 90th percentile, against your pre-automation baseline. This is the number the business cares about.

**Misroute rate**, measured by counting reassignments between queues. Reassignments are recorded by the humans doing them and cost nothing extra to measure.

Re-measure after any change to the taxonomy, the prompt, or the model. And keep sampling the `other` bucket by hand — it is where your next category is hiding.

## Practice

Build a triage workflow over a corpus you assemble yourself. Use your own historical mail with names redacted, or write a realistic corpus by hand.

1. **Build the corpus.** At least 40 messages spanning every category, including 5 replies on existing threads, 3 forwards with quoted history, 2 auto-replies, 1 bounce, 3 that legitimately belong in `other`, and 2 that must trip `requires_human`. Hand-label every one; that is your ground truth.
2. **Prove your taxonomy is real.** Have a second person label 20 of the messages independently using only your category definitions. Compute agreement. Below roughly 85%, fix the definitions before touching the model — the taxonomy is the defect.
3. **Build intake** with `Message-ID` dedupe, automation-header filtering, no-reply address filtering, thread matching to existing cases, and quoted-history stripping. Prove the auto-reply and the bounce are filtered before any model call.
4. **Build classification** with the strict JSON contract, closed vocabulary, `requires_human` override, and rationale. Add the independent keyword pre-screen and confirm both detectors are `OR`-ed.
5. **Implement the ordered routing table**, including the low-confidence row, the complaint acknowledge-only row, and the default row. Verify first-match-wins by feeding it a message that satisfies rows 1, 3, and 6.
6. **Build the drafting step** with the placeholder rule and retrieved policy snippets. Then attack it: send a message asking for a price you did not supply, and confirm you get a placeholder rather than a number. If you get a number, tighten the prompt and re-test.
7. **Build the review queue** with all four reviewer actions, the SLA clock, and captured draft-versus-sent diffs. Gate sending on `status = approved` with an outbound idempotency check, and prove a replayed run does not send twice.
8. **Measure.** Report per-category accuracy across your labeled corpus, the confusion pairs (which category gets mistaken for which), and the edit rate on 10 drafts reviewed by a real person. Name the single worst category and the one change you would make to fix it.
