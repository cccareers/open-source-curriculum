---
lesson_id: ai201-06
course_id: ai201
pathway: prompt-engineer
title: Document Generation and Assembly
order: 6
kind: lesson
competency_ids:
  - D3-S1-C02
objectives:
  - Generate documents from structured data using templates and AI-written sections
---

## Templates first, model second

Businesses generate documents constantly: proposals, statements of work, engagement letters, quotes, onboarding packets, renewal notices. The work is mostly assembly — the same structure, the same clauses, different facts. The temptation with a capable language model is to hand it the facts and ask for the whole document. Resist it.

A generated document has three kinds of content, and only one of them belongs to the model:

1. **Fixed text.** Clauses whose wording is the point: liability limits, payment terms, confidentiality, governing law, regulatory notices. Someone with authority approved this exact wording. It must appear byte-for-byte, every time.
2. **Merged fields.** Facts from your data: client name, dates, quantities, prices, totals. These are substituted, never written. A price the model typed is a price nobody quoted.
3. **Generated prose.** The parts that genuinely vary with the situation: a scope narrative, an executive summary, a tailored description of the approach. This is the model's job, and it is usually 10 to 20 percent of the page count.

The architecture follows directly:

```text
structured data -> template selection -> deterministic merge
                -> AI sections (bounded) -> assembly -> human review -> render/store
```

The most common production failure in document automation is a model that "improved" a fixed clause. It will helpfully rewrite a limitation of liability into something friendlier, and it will do it once in every few hundred documents, which is exactly often enough that nobody catches it. **The defence is structural: never send fixed clauses to the model at all.** If the model does not have the clause, it cannot rewrite it.

## The data contract

Define the document's input as a schema before you write the template. Every placeholder in the template maps to a field, and every field has a type, a source, and a rule for being absent.

```json
{
  "document_type": "statement_of_work",
  "template_version": "sow-v4",
  "client": {
    "legal_name": "Northwind Freight LLC",
    "entity_type": "LLC",
    "jurisdiction": "Ohio",
    "contact_name": "Dana Reyes",
    "contact_email": "dana.reyes@example.com",
    "billing_address": "1400 Canal St, Columbus, OH 43215"
  },
  "engagement": {
    "start_date": "2026-04-01",
    "end_date": "2026-09-30",
    "currency": "USD",
    "total_value": 84000.00,
    "payment_terms_days": 30,
    "billing_cadence": "monthly"
  },
  "scope": {
    "deliverables": [
      {"name": "Intake automation", "description": "Automated routing of inbound freight quote requests", "hours": 120},
      {"name": "Reporting pack", "description": "Weekly operations report with narrative", "hours": 40}
    ],
    "exclusions": ["Data migration from legacy TMS", "On-site training"],
    "assumptions": ["Client provides API credentials within 5 business days"]
  },
  "flags": {
    "includes_personal_data": true,
    "international_transfer": false,
    "requires_insurance_certificate": true
  }
}
```

The `flags` block is doing real work: it selects clauses. `includes_personal_data` pulls in the data-processing addendum; `requires_insurance_certificate` pulls in the insurance clause. Clause selection is a rule over flags, never a model judgement — a document is either legally required to contain a clause or it is not, and that is not a question with a confidence score.

Handle absent fields explicitly. Three policies, chosen per field:

- **Block.** Missing `client.legal_name` stops generation. The document is invalid without it.
- **Placeholder.** Missing `contact_name` renders as a visible marker such as `[CONTACT NAME]` that a reviewer cannot miss. Never render an empty string where a name belongs.
- **Omit section.** Missing `scope.exclusions` drops the exclusions heading entirely rather than printing an empty list.

Silent blanks are the enemy. A document that reads "payment due within  days" will get signed by someone skimming.

## Template structure and clause selection

Keep the template as a versioned artifact with named blocks. Whatever rendering technology you use — a document API, a merge tool, or Markdown you convert — the logical structure is the same:

```text
[BLOCK: header]            fixed + merged
[BLOCK: parties]           fixed + merged
[BLOCK: background]        GENERATED (max 120 words)
[BLOCK: scope_narrative]   GENERATED (max 250 words)
[BLOCK: deliverables]      merged table, deterministic
[BLOCK: exclusions]        merged list, omit if empty
[BLOCK: fees]              merged, deterministic arithmetic
[BLOCK: payment_terms]     FIXED clause library: pt-net30 | pt-net45
[BLOCK: liability]         FIXED clause lib-std-v2
[BLOCK: data_processing]   FIXED clause dpa-v3, include if flags.includes_personal_data
[BLOCK: insurance]         FIXED clause ins-v1, include if flags.requires_insurance_certificate
[BLOCK: signature]         fixed + merged
```

Three disciplines around this:

**Version the template and stamp the version into the document.** `template_version: sow-v4` goes on the record and, ideally, in the document footer. When counsel updates a clause, you need to know which documents already went out under the old wording.

**Keep the clause library separate from the template.** One clause, one identifier, one owner, one approval date. Templates reference clauses by ID. This is what makes "update the liability clause everywhere" a five-minute job instead of a search across 40 templates.

**Compute all money in the workflow.** Line-item totals, subtotals, taxes, the grand total. The model never sees an arithmetic task. Then assert: `sum(deliverables.hours * rate) == engagement.total_value`, and fail generation if it does not hold. The data contract above has no `rate` field yet; add one — a single hourly rate from your rate card, or a rate per deliverable — before you write the assertion. With one rate of 525.00, the 160 hours above reconcile to 84,000.00 exactly. A document whose line items do not sum to its total is the kind of error that ends up in a dispute.

## Prompting the generated sections

Generate each section in its own call, with only the data that section needs. Separate calls are easier to constrain, easier to validate, easier to regenerate individually when a reviewer rejects one paragraph, and cheaper than repeatedly resending a whole document.

```text
You write the SCOPE NARRATIVE section of a statement of work.

Audience: the client's operations lead, who is not technical.
Length: 150-250 words, 2-3 paragraphs. Plain prose. No headings, no bullets, no lists.

You will be given a JSON object of deliverables, exclusions, and assumptions.

Hard rules:
- Describe only the deliverables provided. Never add a deliverable, a phase, a
  technology, or a timeline that is not in the input.
- Never state a price, an hour count, a date, or a percentage. Those appear elsewhere
  in the document and must not be duplicated here.
- Do not promise an outcome, a performance level, or a business result. Describe what
  will be built and how the work proceeds.
- Mention the exclusions explicitly in the final paragraph, in the client's own terms.
- Do not use the words "guarantee", "ensure", "fully compliant", or "best in class".
- Write in the third person about "the engagement". Do not address the reader as "you".

Input:
{{scope_json}}
```

Notice what that prompt forbids. **No numbers** avoids a figure in the prose contradicting the fees table — a real and expensive class of bug. **No promised outcomes** keeps generated prose from creating obligations nobody priced; "we will reduce your handling time by 40%" in a scope narrative is a commitment. **No banned words** targets the specific vocabulary that turns marketing copy into a warranty.

Validate every generated section before assembly:

- Word count within the stated range.
- Contains no digits, if the section forbids numbers (a simple pattern check).
- Contains none of the banned words.
- Contains no placeholder artifacts such as `[insert`, `TODO`, `as an AI`, or an unfilled merge token.
- Every deliverable name in the input appears somewhere in the narrative, and no proper noun appears that is not in the input.

That last check — proper nouns not present in the input — is the cheapest hallucination detector available for document work. Failing any check means one regeneration attempt with the failure named, then a hard stop into the review queue with the failure attached. Never assemble a document around a section that failed validation.

Here is a validated section produced from the scope data above:

```text
The engagement delivers two components for Northwind Freight. The first is an intake
automation that receives inbound freight quote requests, classifies them, and routes
them to the appropriate internal queue, replacing the manual sorting the operations
team performs today. The second is a reporting pack that produces a recurring
operations summary combining the team's own figures with a written narrative.

Work proceeds in sequence. The intake automation is built and placed into review-only
operation first, so the team can compare its output against their own handling before
it takes on live routing. The reporting pack follows, drawing on the data the intake
automation records.

The engagement excludes data migration from the client's legacy transport management
system and on-site training. Both are available under a separate agreement.
```

Check it against the prompt's rules: no digits, no dates, no prices, no promised outcome, both deliverables named, exclusions stated in the final paragraph in the client's own terms, third person throughout. Every one of those is a mechanical assertion your validators can run, which is exactly why the rules were written that way.

## Regeneration, batches, and packets

Three practical situations the simple flow does not cover.

**A reviewer rejects one section.** Regenerate only that section, with the reviewer's rejection reason appended to the prompt as an additional constraint, then reassemble. Keep both versions and the reason. Never regenerate the whole document — the reviewer already approved the rest, and a fresh generation of an approved section quietly invalidates that approval.

**Batch generation.** Producing 200 renewal letters is a different job from producing one contract. Generate into a review batch rather than 200 individual queue items, let the reviewer sample rather than read every one, and validate mechanically across the whole batch: every document has the same fixed clauses, every merge field is populated, no document contains a placeholder artifact. Route only the outliers to full reading. The sampling rate is a business decision tied to what a wrong letter costs, and it should be written down like any other threshold.

**Document packets.** Many processes produce several related documents at once — a proposal, a schedule, and an authorization form. Generate them from one input object so the shared facts cannot diverge, assemble them into one review item, and add a cross-document assertion: the total in the proposal equals the total in the authorization, the dates agree, the legal entity name is identical everywhere. Cross-document inconsistency is embarrassing in a way single-document errors are not, because the reader sees both.

## Assembly, review, and storage

Assembly merges the fixed blocks, merged fields, and validated generated sections in template order, then renders to the delivery format. Keep the assembled source and the rendered output; keep the input JSON; keep the generated sections separately with the prompt version that produced them. That triple is what lets you answer "why does this document say that?" months later.

**The review gate is mandatory and it is not a formality.** Every generated document that will reach a customer, create an obligation, or move money is reviewed by a person before it leaves. Design the reviewer's screen deliberately, because a reviewer given a 12-page PDF and an approve button will click approve:

- Show the generated sections **highlighted and separated** from fixed text. The reviewer's attention belongs on the 15% the model wrote.
- Show the **input data alongside** the document, so facts can be checked against their source without opening another system.
- Show a **diff against the previous version** of the template's fixed text, so a clause change is visible rather than assumed.
- Offer three outcomes, not two: **approve**, **edit and approve**, **reject with reason**.
- Capture edits. A reviewer's rewrite of a generated paragraph is the single most valuable signal you have about a bad prompt. Store the before and after.

Tier the approver by risk, using rules over the same flags: contract value above a threshold routes to a senior approver; any document with the data-processing addendum routes additionally to whoever owns privacy. Encode the tiers in a table like the routing table from the data lesson, and give every tier an SLA and a queue an aging alert watches.

On approval, render, store to the document system with a deterministic name and path (`sow/2026/northwind-freight/SOW-2026-0412-v1.pdf`), write the resulting file ID back onto the case record, and advance the status. On rejection, the reason goes back to the case record and the run stops — never auto-regenerate and resubmit into the same queue, or a bad prompt will produce an infinite review loop.

## Practice

Build a document generator for a real template you can obtain — a statement of work, a quote, an offer letter, a service agreement, or an engagement summary. Redact anything sensitive before you use it.

1. **Deconstruct the template** into a block list, tagging each block as fixed, merged, or generated. Extract the fixed clauses into a clause library with an ID, an owner, and a version for each. Your generated blocks should be a minority of the document; if they are not, re-read the source and reclassify.
2. **Write the data contract** as a JSON schema with a `flags` block driving conditional clause inclusion, plus an absent-field policy (block, placeholder, or omit) for every field.
3. **Build the merge and arithmetic** deterministically, including at least one computed total, and add an assertion that line items reconcile to the total. Prove the assertion by feeding it a deliberately inconsistent input and confirming generation stops.
4. **Write and tune the prompt** for one generated section with explicit length, forbidden content, banned words, and a no-numbers rule. Run it against five different input records.
5. **Build the section validators**: word count, digit check, banned words, placeholder artifacts, and the proper-noun check against the input. Then attack your own generator — craft one input designed to make the model invent a deliverable, and show what your validators do about it.
6. **Prove the clause safety property.** Confirm by inspection of your workflow that fixed clause text is never included in any prompt payload. Then generate 10 documents and diff every fixed block against the clause library. Zero drift is the only passing result.
7. **Build the review gate** with highlighted generated sections, the input data visible, three outcomes, and captured edits. Route two of your ten documents to a senior approver using a value threshold rule.
8. **Run the loop with a real reviewer.** Have someone review three generated documents without your help. Record every edit they make, and rewrite one prompt rule in response to what they changed. Report the rule you changed and why.
