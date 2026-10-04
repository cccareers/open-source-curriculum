---
lesson_id: sn350-05
course_id: sn350
pathway: servicenow-implementation-specialist
title: The Risk Register and Risk Assessment
order: 5
kind: lesson
competency_ids:
  - D10-S1-C05
objectives:
  - Build a risk register with a scoring methodology and run a risk assessment against it
---

## Risk is a different shape from compliance

Compliance is a closed question. Somebody wrote down a requirement, you either meet it or you do not, and the evidence settles it. Risk is an open question: what could go wrong, how likely is it, how bad would it be, and is that acceptable to the people accountable for the answer. There is no external document to consult. The organization has to decide.

That difference drives every design choice in Risk Management. Because the answers are judgments, the application's job is to make judgments **consistent, attributable, and comparable**. A risk register where one business unit rates everything "high" because they are cautious and another rates the same exposure "medium" because they are optimistic is worse than no register, because it produces a ranked list that ranks nothing. Most of the implementation effort in this lesson goes into the scoring methodology, not into the records.

The parallel to Lesson 3's chain is close enough to be useful:

```text
Compliance                          Risk
----------------------------------  ----------------------------------
Authority Document / Citation       (no external source; the org decides)
Policy Statement                    Risk Statement      reusable "what could go wrong"
Control Objective                   Risk Framework      how it is scored and rated
Control  = objective × entity       Risk = statement × entity, owned, scored
Attestation                         Risk Assessment     periodic re-scoring
Issue                               Risk Response       accept, mitigate, transfer, avoid
```

Same template-plus-scope pattern. You do not author risks one at a time; you author a **risk statement** once and instantiate it against entities.

## Risk statements and the register

A risk statement is a library entry describing a category of exposure in reusable language. The most durable format is cause, event, consequence:

> **Because** privileged accounts are not consistently removed at separation, **an unauthorized actor may retain administrative access**, **resulting in** undetected modification of financial records.

Three parts, each doing work. The cause tells you what to mitigate. The event is what you would detect. The consequence is what makes it worth money, and it is the part that lets a risk be compared to an unrelated risk during prioritization.

Bad risk statements share recognizable defects, and you will see all of them in a customer's existing spreadsheet:

- **The bare noun.** "Cybersecurity." Not a risk; a topic. Unscoreable, unownable, unmitigable.
- **The missing control.** "We do not have multi-factor authentication." That is a control gap, not a risk. The risk is what the gap could cause. Register control gaps as issues; register their consequences as risks.
- **The certainty.** "Our backup restores have never been tested." If it is true today, it is a finding, not an uncertainty. Risk is about what might happen.
- **The consequence with no event.** "Reputational damage." Damage from what?

A **risk** is a statement instantiated against an entity: this exposure, on this service, owned by this person, scored this way, in this state. That instantiation is what makes the register operable — it produces an owner who can actually do something, and it lets the same statement carry different scores in different parts of the business, which is usually the truth.

The register's fields beyond the score: risk owner (a named person with budget or authority, never a group inbox), state, category or taxonomy, related controls, related issues, and the response. Categories matter more than they look: the taxonomy is how the register gets summarized to the board, and retrofitting a taxonomy across three hundred risks is miserable. Choose it before you load anything, keep it shallow (eight to twelve top-level categories is plenty), and align it to how the organization already talks about itself.

## The scoring methodology

Scoring is where implementations succeed or fail. The framework defines the scales, the matrix, and the arithmetic, and once records exist it is expensive to change, because changing a scale retroactively invalidates every historical score.

### Scales

Two scales, likelihood and impact, each with a small number of ordered levels — five is the common choice. The critical design rule: **every level gets a written definition with a real-world anchor**, not just a word.

```text
LIKELIHOOD (per year, unless the risk states otherwise)
5  Almost certain   Expected more than once in the next 12 months
4  Likely           More likely than not within 12 months
3  Possible         Plausible within 12 months; has occurred in this industry
2  Unlikely         Would be surprising within 12 months; no recent precedent
1  Rare             Would require an unusual combination of failures

IMPACT (worst credible single occurrence)
5  Severe     Regulatory enforcement, or loss above the board threshold,
              or a customer-facing outage beyond the contractual maximum
4  Major      Reportable finding, or loss above the executive threshold,
              or a multi-hour outage of a revenue service
3  Moderate   Internal escalation, contained financial loss, degraded service
2  Minor      Absorbed by normal operations, no external visibility
1  Negligible Noise
```

Two things to notice. Likelihood carries a **time horizon** — without one, "likely" is meaningless, and two raters will use different windows. Impact is defined against the **worst credible** single occurrence, not the worst imaginable and not the average, because "worst imaginable" ratchets everything to 5 and "average" hides tail risk. Where the organization has real thresholds — a materiality number, a contractual outage cap — anchor to them rather than inventing new ones.

Many programs add a third dimension. The most useful is a **control effectiveness** or vulnerability factor, because it is the bridge back to the compliance work from Lessons 3 and 4: the difference between inherent and residual risk is exactly the controls that exist and operate.

### The matrix

The matrix maps a likelihood-impact pair to a rating band. It is not simply the product, though the product is a common default.

```json
{
  "scale": { "likelihood_max": 5, "impact_max": 5 },
  "bands": [
    { "name": "Critical", "min": 20, "max": 25, "escalation": "Executive committee, monthly" },
    { "name": "High",     "min": 12, "max": 19, "escalation": "Risk committee, quarterly" },
    { "name": "Moderate", "min": 6,  "max": 11, "escalation": "Business unit, quarterly" },
    { "name": "Low",      "min": 1,  "max": 5,  "escalation": "Accept and monitor" }
  ],
  "overrides": [
    { "when": "impact = 5", "minimum_band": "High",
      "reason": "Severe impact is never below High regardless of likelihood." }
  ]
}
```

That override is the design detail most first implementations miss. A rare event with severe impact scores 5 on a multiplicative matrix and lands in "Low", which is how organizations end up with an unmanaged tail risk sitting politely at the bottom of a list. Decide the shape of the matrix deliberately: a pure product, a hand-tuned band map, or a product with floor rules. Write down which and why.

The other half of the matrix is the **appetite and tolerance** statement: which bands the organization accepts without action, which require a plan, and which require escalation. A matrix without an appetite statement produces ratings nobody has to act on.

### Inherent, residual, and the arithmetic

- **Inherent risk** is the score before considering controls. It answers "why do we bother."
- **Residual risk** is the score after considering the controls that actually exist and operate. It answers "how are we doing."
- The gap between them is the value the control environment claims to deliver — and if a control fails its attestation, the residual score should be recomputed rather than left standing.

A simple, explainable derivation:

```javascript
// Residual score from inherent score, discounted by measured control effectiveness.
// effectiveness: 0..1, derived from the results of the controls linked to this risk.
function residualScore(inherentLikelihood, impact, effectiveness) {
  // Controls reduce likelihood; impact is treated as unchanged unless a
  // control is explicitly an impact-reducing control (e.g. tested restore).
  var reduced = inherentLikelihood * (1 - effectiveness);
  var residualLikelihood = Math.max(1, Math.round(reduced));
  return residualLikelihood * impact;
}

// Worked: inherent likelihood 4, impact 5, controls measured 60% effective.
// reduced = 1.6 -> residualLikelihood = 2 -> residual = 10 (Moderate),
// down from inherent 20 (Critical). And under the override rule above,
// impact 5 floors the band at High. Residual = 10, band = High.
```

Two lessons live in that comment. Controls usually reduce *likelihood*, not impact — a firewall does not make a breach less expensive, it makes it less probable — and treating impact as reducible is how residual scores become fiction. And the override still applies after the arithmetic, which is why floors are worth more than they cost.

Whatever formula you configure, hold it to one standard: **a risk owner must be able to explain their own score without opening the tool**. Opaque weighted models with eleven inputs produce numbers nobody defends in a committee meeting, and undefended numbers get overridden verbally, at which point the register is decorative.

## Running a risk assessment

An assessment is the periodic act of scoring or re-scoring risks, and it uses the same assessment engine as attestations. Configure it as a cycle, not an event.

**Scope.** Which risks are in this cycle. Usually all risks in a business unit, or all risks above a band, or all risks whose last assessment is older than the required interval. Scope by query, not by hand-picked list, so the cycle is repeatable.

**Respondent.** The risk owner scores; a risk practitioner or committee reviews. Independent review is what keeps scales calibrated across business units, and it is the only practical defense against rating drift.

**Instrument.** For a mature program, the respondent supplies likelihood and impact directly against the published scales. For a less mature one, an indirect questionnaire — several factual questions whose answers are weighted into a score — produces more consistent results, because people answer facts more honestly than they self-rate. Indirect scoring costs you explainability, so the weightings must be published.

**Cadence.** Tie it to the band. Critical risks reassessed quarterly, high semi-annually, everything else annually, plus an event trigger: a material incident, a failed control, a significant change to the entity. Event-driven reassessment is what stops the register describing last year's organization.

**Result handling.** A completed assessment writes the score, stamps the date and the assessor, moves the risk state, and — the part implementations forget — **preserves the previous score**. Trend is the most valuable output a register produces. A risk that has been "High" for three years while the mitigation plan was repeatedly deferred is a governance story that a snapshot cannot tell.

## Aggregation: from many risks to one number

Somebody will ask for the organization's risk position as a single figure, or at least as a figure per business unit. Aggregation is how the register answers, and it is easy to do dishonestly.

The two defensible approaches:

**Worst-case roll-up.** A parent's rating is the highest rating among its children. Simple, conservative, and impossible to game downward. Its weakness is insensitivity: a unit with one Critical risk and a unit with one Critical and forty High risks both read Critical.

**Distribution reporting.** Do not roll up to one rating at all; report the count in each band, per unit, and trend it. Less satisfying to an executive who wanted one number, and considerably more truthful.

The approach to refuse is **averaging scores**. Averaging a Critical with nine Lows produces a comfortable Moderate, which is the exact opposite of what risk management is for. If you are pushed toward a single index, build it from counts weighted heavily toward the top bands, publish the weighting, and pair it with the distribution so the composition is always visible beside the composite.

Aggregation depends on structure, which is why the taxonomy and the entity hierarchy matter. Risks roll up along two dimensions at once — organizationally, through business units, and functionally, through the risk category — and a register that supports only one of them will be asked for the other. Model both from the start: the entity carries the organizational path, the category carries the functional one.

## Migrating an existing register

Almost every customer already has a register in a spreadsheet, and it is never a clean import. Treat it as evidence of what the organization currently believes, and reconcile.

A workable sequence:

1. **Do not import first.** Build the framework, the taxonomy, and the statement library before touching the spreadsheet. Importing first means the old data defines the model, and the old data is the reason they hired you.
2. **Sort the rows into three piles.** Genuine risks, control gaps disguised as risks, and topics. Only the first pile becomes risks; the second becomes issues, and the third becomes a conversation.
3. **Consolidate.** Registers accumulate near-duplicates written by different people in different years. Twelve rows about access control usually collapse to two statements instantiated against six entities.
4. **Rescore rather than convert.** Old ratings were produced under a different, usually undocumented, methodology, so mapping them arithmetically to your new scales imports the inconsistency you are trying to remove. Rescore against the new definitions in the first assessment cycle, and keep the old rating in a reference field for continuity of conversation.
5. **Report the shrinkage honestly.** A register going from 240 rows to 70 risks looks to a sponsor like something was lost. Prepare the explanation before they see the number: nothing was dropped, it was classified — here are the rows that became issues, the ones that merged, and the ones that were topics.

A note on quantitative methods. Beyond the qualitative matrix, more advanced approaches express risk in monetary terms with distributions of loss rather than ordinal bands, and the platform's risk applications extend in that direction. That is a legitimate maturity step and it is out of scope for this course. What matters at your level is not to blend the two carelessly: a five-point ordinal scale is not a currency, the difference between a 4 and a 5 is not a fixed quantity, and multiplying ordinals produces a number that ranks but does not measure. Say so when someone starts adding up scores.

## Risk response

Every risk in the register ends up in one of four responses, and the register should force the choice rather than allow a null:

- **Mitigate.** Reduce likelihood or impact by implementing or strengthening controls. This links back to the compliance model: the mitigation *is* a control, and its attestation results feed the residual score.
- **Transfer.** Insurance, or a contractual shift to a third party. Note that transfer moves financial consequence and rarely moves accountability; regulators generally do not accept transferred responsibility.
- **Avoid.** Stop doing the activity. Rare, and usually a business decision rather than a risk decision.
- **Accept.** Live with it, explicitly.

**Risk acceptance** deserves careful configuration because it is the response most open to abuse. A properly configured acceptance has: an accepting authority whose seniority is a function of the band (a Critical risk cannot be accepted by a team lead), a documented rationale, a compensating measure where one exists, and — non-negotiably — an **expiry date**. An acceptance without expiry is how a temporary decision becomes permanent policy without anyone deciding. When it expires, the risk returns to the register for a fresh decision. Automating that approval chain and the expiry follow-up is Lesson 8's work; configure the record structure and the approval requirement here so the automation has something to drive.

### Worked example: building Northwind's register

Northwind Health, continuing from Lesson 4.

1. **Taxonomy first.** Nine categories agreed with the risk committee: technology resilience, information security, third-party, financial reporting, regulatory, clinical operations, data quality, people, and change execution.
2. **Framework.** Five-by-five, definitions anchored to their existing materiality threshold and their contractual availability commitment, product-based matrix with a floor rule at impact 5, appetite statement approved by the committee.
3. **Statements.** Eleven statements written in cause-event-consequence form, drawn from their incident history and their two authority documents rather than from a generic library. Generic libraries are a starting point, never a delivery.
4. **Instantiation.** The information security and technology resilience statements are scoped to the entity types built for compliance in Lesson 6, so risks land on the same services the controls do. The financial reporting statements are scoped to the finance application entity only.
5. **Linkage.** The privileged access risk is linked to the quarterly access review control from Lesson 4. When that control's attestation fails, effectiveness drops and residual risk recomputes upward, visibly, without anyone filing anything.
6. **First cycle.** Owners score, the practitioner group reviews, three ratings are challenged and revised, and the calibration conversation those three revisions produce is worth more to the program than the other sixty scores combined.

## Practice

Use a developer instance with Risk Management available.

1. **Write the framework.** Produce a one-page methodology document containing both five-level scales with anchored definitions, the matrix band map, at least one floor or override rule with its justification, and the appetite statement. It has to be usable by a business owner who has never seen the tool.

2. **Five statements.** Write five risk statements in cause-event-consequence form for an organization of your choice, drawn from at least three of your taxonomy categories. Then write two deliberately defective statements, one for each of two different defects from the list in this lesson, and annotate the defect and its practical consequence.

3. **Instantiate and score.** Create risks from at least three statements against at least two entities each, so you have six or more register entries. Score inherent likelihood and impact against your scales, link at least one risk to a control from Lesson 4, and compute residual using your published derivation. Show the arithmetic for one risk by hand and confirm the tool agrees.

4. **Run an assessment cycle.** Configure and launch an assessment scoped by query rather than by list. Complete it as the owner for at least two risks, review as the practitioner, and confirm that the previous score is preserved and the assessment date and assessor are stamped.

5. **Accept a risk, properly.** Record an acceptance on one Moderate risk with an accepting authority, rationale, compensating measure, and a 90-day expiry. Then write, in three sentences, what must happen on day 91 and what would go wrong in a real program if nothing did.

6. **Break your own matrix.** Find a likelihood-impact pair whose band you consider indefensible under your current configuration. Change the matrix to fix it, then list every risk already in your register whose band changed as a result — and explain why that list is the reason to settle the framework before loading the register.

## Check your understanding

1. "We do not have multi-factor authentication." Risk, issue, or topic?
2. Why must likelihood carry a time horizon?
3. A risk scores likelihood 1, impact 5. Without a floor rule, where does it land on a product matrix, and why is that a problem?
4. Why should a risk acceptance always have an expiry?

*Answers:* (1) A control gap, so an issue; its consequence may be a risk. (2) Without one, raters use different windows and "likely" means different things. (3) Score 5, Low; a rare catastrophic exposure sits unmanaged at the bottom of the list. (4) Without expiry, a temporary decision becomes permanent policy without anyone deciding.
