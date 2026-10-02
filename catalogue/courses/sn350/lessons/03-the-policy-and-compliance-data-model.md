---
lesson_id: sn350-03
course_id: sn350
pathway: servicenow-implementation-specialist
title: The Policy and Compliance Data Model
order: 3
kind: lesson
competency_ids:
  - D10-S1-C05
objectives:
  - Model authority documents, citations, policies, and control objectives in the compliance application
---

## The chain from obligation to control

Policy and Compliance Management is built on one chain, and if you can draw it from memory you can implement most of the application:

```text
Authority Document   "ISO/IEC 27001:2022"           external or internal source
  └── Citation       "A.5.15 Access control"        one requirement, hierarchical
        │
        │  (many-to-many mapping)
        ↓
Policy               "Access Management Policy"     your organization's response
  └── Policy Statement "Privileged access is reviewed at least quarterly"
        ↓
Control Objective    "Quarterly privileged access review"   what good looks like
        ↓  (× entity or entity type)
Control              one per in-scope entity, owned, tested, stated
```

![The chain from authority document through citation, policy statement, and control objective to generated controls](./img/compliance-data-model.png)

Read it as a translation. The authority document and its citations are somebody else's words, and you do not edit them. The policy and its statements are your organization's words, written once and reused. The control objective is the operational restatement: what has to be true, phrased so it can be tested. The control is that objective applied to a specific thing, with a specific owner, in a specific state.

The value of separating these four layers only becomes obvious at scale. One policy statement about quarterly privileged access review may satisfy citations in three different authority documents at once. When a fourth regulation arrives, you map its citations to the statement you already have, and your control count does not change. When a regulation is superseded, you unmap it and the control survives because the internal policy still requires it. Organizations that skip the policy layer and map controls directly to citations end up with three near-identical controls, three attestations landing on the same manager in the same week, and a program the business resents.

## Authority documents and citations

An authority document is the container. Its useful fields are the ones that let you find it later and decide whether it still applies: name, type (regulation, standard, contract, internal), issuing body, version or edition, effective date, and a state so a superseded edition can be retired without being deleted.

Citations are the requirements inside it, and they are **hierarchical**. Real standards nest — a clause contains sub-clauses, a control family contains controls. The citation table carries a parent reference so the tree in the tool mirrors the tree in the document. Build the tree faithfully even where you plan to map only leaves, because auditors navigate by clause number, and a citation that cannot be found by its number is a citation nobody trusts.

Three ways content arrives, in descending order of preference:

**Prebuilt content packs.** Common regulations and standards are available as pre-structured content, sometimes with suggested mappings. When one exists, use it: hand-typing a control catalog with several hundred nested clauses is days of work and introduces transcription errors into the exact records auditors read most carefully.

**Import.** For a standard with no pack, or a customer-specific contract, load through an import set with a transform map. Model the source as a flat file with an explicit parent key, and let the transform resolve the hierarchy on a second pass or through a coalesce on the reference number.

```json
{
  "authority_document": "Northwind Customer Security Addendum v3",
  "reference": "A.5.15",
  "parent_reference": "A.5",
  "name": "Access control",
  "text": "Rules for physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.",
  "type": "requirement"
}
```

Two rules for the transform. Coalesce on the pair of authority document and reference, not on name, because names repeat across standards and references do not. And import the parents before the children, or run the hierarchy resolution as a separate step, or you will silently create orphans.

**Manual entry.** Correct for a short internal document, and only that.

Whatever the route, verify the load. A quick integrity check is worth more than a spot check of ten records:

```javascript
// Find citations whose parent_reference did not resolve to a real parent.
var orphans = [];
var cit = new GlideRecord('sn_compliance_citation');
cit.addQuery('source', AUTHORITY_DOC_SYS_ID);
cit.addNotNullQuery('u_parent_reference');
cit.addNullQuery('parent');
cit.query();
while (cit.next()) {
  orphans.push(cit.getValue('reference'));
}
gs.info('Unresolved citation parents: ' + orphans.length + ' -> ' + orphans.join(', '));
```

Run it after every load, including reloads of a new edition. A silent orphan means a requirement exists in the tool but is invisible in the place a reviewer would look for it.

## Policies and policy statements

A policy is your organization's governing document: an access management policy, an acceptable use policy, a change management policy. It carries an owner, a review cycle, an effective date, and a lifecycle state. Policy statements are the individually testable assertions inside it.

Two habits distinguish a good statement from a bad one.

**One assertion per statement.** "Privileged access is reviewed quarterly and terminated within 24 hours of separation" is two obligations with two different owners, two different evidence sources, and two different failure modes. Split it. When they are split, a failure is precise: the review happened, the deprovisioning did not.

**Written so a test is obvious.** Compare "Access shall be appropriately managed" with "Every account with administrative privilege on an in-scope system is reviewed and re-approved by the system owner at least once per calendar quarter." The second names the population, the actor, the action, and the frequency. You can build an indicator against it. You cannot build anything against the first.

Mapping runs between citations and policy statements as a many-to-many relationship. A statement may satisfy several citations across several authority documents; a citation may require several statements. Do the mapping deliberately and record the reasoning somewhere durable, because "why does this control exist" is the single most common question in an audit walkthrough, and the mapping is the answer.

The policy lifecycle matters as much as the content. A typical progression is draft, review, published, and retired, with an approval gate before publication and a mandatory review date after it. Retire rather than delete: an auditor examining a period two years ago needs the policy text that was in force *then*, not the current edition. Version the policy record and keep the retired version attached to the period it governed.

## Control objectives and controls

A control objective sits between the statement and the control, and beginners frequently ask why it exists at all. It exists because the policy statement is written in policy language and the control has to be written in operational language, and because one statement can require different operational behaviors on different classes of asset. "Privileged access is reviewed quarterly" produces one objective for directory-managed servers, where the review is against a group membership export, and a different objective for a SaaS application where the review is against an admin console list. Same policy statement, different objectives, different evidence.

A control objective carries the testable definition, the expected evidence, and the frequency. It does not carry an owner or a state, because it is a template.

The control is the instance. It is the objective applied to a **single entity**, and it carries the fields that make it operational: owner, state, test frequency, most recent test result, and links to attestations, indicators, and issues. This is where the template-plus-scope pattern from Lesson 2 pays off. You author one objective, attach it to an entity type, and the application generates one control per entity in that type. When a new server joins the entity type next month, a control for it appears without anyone filing a request. When one is decommissioned, its control retires along with it and the evidence for the period it existed stays behind.

That generated relationship is also the reason to get the entity layer right, which is Lesson 6's whole subject. Scope a control objective too broadly and you have generated three hundred controls with three hundred owners who did not ask for them, and the program dies of its own weight in the first attestation cycle. Scope it too narrowly and you have an audit gap.

Naming deserves a convention, decided once. Controls are read in lists of hundreds, usually by people scanning for their own. A workable pattern is objective name plus entity name, generated automatically, with the reference number of the primary citation available as a column rather than jammed into the title. Whatever you choose, apply it uniformly; inconsistent control naming is the most reliable visible symptom of an implementation that grew without a design.

### Worked example: one statement, two obligations

Northwind Health must satisfy an access control citation from their customer's security addendum and an IT general control from the financial reporting regime. Both are, in substance, "review who has privileged access, periodically, and prove it."

The modeling:

- Two authority documents, loaded separately, each keeping its own reference numbering.
- Citation `A.5.15` in one, citation `ITGC-AC-03` in the other.
- **One** policy: Access Management Policy, owned by the CISO, annual review cycle.
- **One** policy statement: every account with administrative privilege on an in-scope system is reviewed and re-approved by the system owner at least once per calendar quarter.
- Both citations mapped to that one statement.
- **Two** control objectives, because the evidence differs: one for directory-managed infrastructure, one for the finance application's native admin roles.
- Controls generated per entity from each objective.

The payoff is visible in one number: a single quarterly review by each system owner produces evidence for both obligations. If you had modeled citation-to-control directly you would have doubled the reviews and halved the goodwill.

## When the authority document changes

Standards get revised, regulations get amended, and contracts get renegotiated. A new edition arrives roughly every few years for most obligations, and how you handle it separates a model that lasts from one that gets rebuilt.

The wrong move is to edit the existing authority document in place. Doing so silently rewrites history: an audit covering last year now sees this year's requirements, and every control's justification quietly changes underneath it.

The right move is a **delta process**:

1. **Load the new edition as a new authority document**, versioned, with its own citation tree. Both editions now exist.
2. **Produce a mapping between editions.** Some citations are unchanged, some are renumbered, some are new, some are withdrawn. Content packs often supply this; where they do not, it is a manual pass and it is the real work of the upgrade.
3. **Re-map policy statements to the new citations.** Because your statements are yours, most of them survive untouched — which is the whole reason the policy layer exists. A renumbering in the standard becomes a mapping change, not a rewrite of your control environment.
4. **Analyze the genuinely new requirements.** These are the ones needing new statements, new objectives, and possibly new controls. Usually a small fraction of the total.
5. **Retire the old edition** with an effective-to date rather than deleting it, so historical periods still resolve.

The number that tells you whether your model is well built is how many *controls* change when an edition does. In a citation-to-control model, nearly all of them churn. In a properly layered model, almost none do. Set that expectation with the customer during design, because it is the clearest justification for the extra layer they will otherwise ask you to remove.

## Who owns which layer

The data model implies an operating model, and disagreements about ownership surface as data quality problems. Agree this before go-live:

- **Authority documents and citations** are owned by whoever tracks the organization's obligations — often legal, compliance, or a regulatory affairs function. They are loaded, not authored, and nobody else edits them.
- **Policies and policy statements** are owned by the subject-matter function: security policies by the CISO, financial controls policy by the controller. The compliance team facilitates; it does not author policy on the business's behalf.
- **The mapping between citations and statements** is owned by the compliance team, because it is the piece requiring knowledge of both sides, and because it is what gets defended in a walkthrough.
- **Control objectives** are owned jointly: compliance writes the testable definition, the operating function confirms it is executable.
- **Controls** are owned by whoever operates the thing being controlled. This is the ownership that must be derived from data rather than typed, and Lesson 6 is largely about making that derivation reliable.

The pattern to notice: the further down the chain you go, the further the ownership moves from the compliance team and toward the business. A program where compliance owns every layer is a program the business considers somebody else's project, and it will show up in your attestation completion rate within two cycles.

## Common modeling mistakes

- **Editing citation text to make it clearer.** Never. Citations are quotations. Clarify in the policy statement, which is yours.
- **One giant policy.** A policy the size of a book has one owner, one review date, and no meaningful state. Split by domain, aligned to who actually owns the subject.
- **Controls with no objective.** A hand-created control that came from nowhere cannot be regenerated, rescoped, or explained. Every control should trace upward.
- **Mapping everything to everything.** A statement mapped to forty citations usually means the statement is too vague. Tighten the statement.
- **Deleting superseded content.** Retire. Historical periods need the text that was in force at the time.

## Practice

Use a developer instance with Policy and Compliance Management available.

1. **Load an authority document.** Create an authority document for a short internal standard of your own invention with at least three top-level clauses and two sub-clauses under one of them. Load it by import set with a transform map rather than by hand, using a source file shaped like the sample above. Then run the orphan-citation check and show it returns zero.

2. **Write three policy statements.** For a policy of your choosing, write three statements that each pass the two habits test: one assertion, and testable. For each, write in one sentence what evidence would prove it operated. Then deliberately write one *bad* statement and annotate exactly which habit it breaks and what a tester would be unable to do.

3. **Map and justify.** Map each of your three statements to at least one citation from your loaded document. For one mapping, write a two-sentence justification of the kind you would read aloud in an audit walkthrough. For one citation you chose *not* to map, write why it is out of scope.

4. **Objective to control.** Create one control objective from your best statement. Attach it to two entities (any two records available to you) and confirm two controls are generated. Then change something about the objective's test definition and describe what does and does not propagate to the existing controls, and why that behavior is the right default for a live program.
