---
course_id: cyb100
project_id: cyb100-x02
title: "Rowan Veterinary Group: A Risk Register That Checks Itself"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - cyb100-03
  - cyb100-04
  - cyb100-05
objectives:
  - Identify common threats and vulnerabilities in a described network or information system
  - Rate a risk by likelihood and impact and choose a mitigation strategy for it
  - Match a monitoring or response task to the right category of security tooling and to the framework function it serves
competency_ids:
  - D1-S1-C01
  - D1-S1-C02
  - D1-S1-C04
---

## Scenario
Rowan Veterinary Group's three practice managers liked your lesson 04 work but want it in a form they can keep updating: a spreadsheet. Their worry, in their words: *"Last time someone kept a list like this, half the 'highs' were really mediums and nobody could say why."* You will rebuild your Rowan findings as a structured risk register (CSV) and run a small validator that catches the mechanical mistakes — misread matrix cells, missing justifications, acceptances with no owner or review date — so that human review time goes on the judgement, not the arithmetic.

## Scope and authorization
This is a paper-and-spreadsheet exercise about a fictional organization. You will not scan, probe, or connect to anything. The validator reads only the CSV file you write.

## What you will build / produce
1. `rowan-register.csv` with at least **10** risks, using exactly the columns below.
2. A one-page summary for the practice managers: top five risks, primary response for each, and the three capabilities to add first (each placed in a NIST CSF function, per lesson 05).
3. A passing run of `validate_register.py`.

Columns (header row, in this order):

| Column | Content |
|---|---|
| `id` | R01, R02, ... |
| `risk_statement` | *[threat actor or event] exploits [weakness] affecting [asset], resulting in [harm]* |
| `asset` | From your lesson 03 asset inventory |
| `property` | `C`, `I`, `A`, or a combination such as `CI` |
| `vuln_category` | One of lesson 03's ten categories |
| `likelihood` | Rare / Unlikely / Possible / Likely / Almost certain |
| `likelihood_why` | One sentence |
| `impact` | Negligible / Minor / Moderate / Major / Severe |
| `impact_why` | One sentence |
| `priority` | Your reading of the lesson 04 matrix: Low / Medium / High / Critical |
| `response` | Reduce / Transfer / Avoid / Accept |
| `action` | The specific action |
| `owner` | A role, e.g. "Practice manager, Clinic 2" |
| `csf_function` | Govern / Identify / Protect / Detect / Respond / Recover — the function the *action* serves |
| `residual_likelihood`, `residual_impact`, `residual_priority` | After treatment |
| `review_date` | YYYY-MM-DD |

## Before you start (prerequisites, starter files or data)
- Your lesson 03 Rowan findings table and lesson 04 ratings.
- Python 3.9+ (standard library only). Any spreadsheet tool that can export CSV (UTF-8).

## Milestones
1. Convert at least ten findings into risk statements. Include at least one non-human event (e.g., the X-ray machine's USB backup lost to a burst pipe or theft) and one involving card or client personal data.
2. Rate each risk with a justification sentence per rating. Read the priority off the matrix yourself — do not compute it.
3. Choose responses: at least one Avoid (hint: card details taken over the phone; the personal cloud email account) and at least one documented Accept.
4. Map each action to a CSF function and to a tool category or "no tool — policy".
5. Run the validator. Fix every ERROR; read every WARN and decide whether it is a real problem.
6. Write the one-page summary.

## Acceptance criteria
- [ ] ≥ 10 risks, every column filled.
- [ ] Every `priority` and `residual_priority` matches the lesson 04 matrix.
- [ ] Every justification is a full sentence that names something true of Rowan, not a restatement of the rating.
- [ ] At least one Avoid and one Accept; every Accept has an owner and a review date within 12 months.
- [ ] Residual priority never exceeds inherent priority; no residual is "Rare + Negligible" without a stated reason (residual risk is never zero).
- [ ] At least three different CSF functions appear in `csf_function`.
- [ ] `python3 validate_register.py rowan-register.csv` exits 0.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `validate_register.py`:

```python
#!/usr/bin/env python3
"""Validator for cyb100-x02 risk registers. Usage: python3 validate_register.py FILE.csv"""
import csv, sys, re, datetime

L = ["Rare", "Unlikely", "Possible", "Likely", "Almost certain"]
I = ["Negligible", "Minor", "Moderate", "Major", "Severe"]
# Lesson 04 matrix, rows = likelihood (Rare..Almost certain), cols = impact (Negligible..Severe)
M = [
    ["Low", "Low", "Low", "Medium", "High"],            # Rare
    ["Low", "Low", "Medium", "Medium", "High"],         # Unlikely
    ["Low", "Medium", "Medium", "High", "Critical"],    # Possible
    ["Low", "Medium", "High", "High", "Critical"],      # Likely
    ["Medium", "Medium", "High", "Critical", "Critical"],  # Almost certain
]
P = ["Low", "Medium", "High", "Critical"]
RESP = {"Reduce", "Transfer", "Avoid", "Accept"}
CSF = {"Govern", "Identify", "Protect", "Detect", "Respond", "Recover"}
REQ = ["id", "risk_statement", "asset", "property", "vuln_category", "likelihood",
       "likelihood_why", "impact", "impact_why", "priority", "response", "action", "owner",
       "csf_function", "residual_likelihood", "residual_impact", "residual_priority", "review_date"]

def cell(l, i):
    return M[L.index(l)][I.index(i)]

errors, warns = [], []
rows = list(csv.DictReader(open(sys.argv[1], newline="", encoding="utf-8-sig")))
missing = [c for c in REQ if c not in (rows[0].keys() if rows else [])]
if missing:
    sys.exit(f"ERROR: missing columns: {missing}")
if len(rows) < 10:
    errors.append(f"only {len(rows)} risks; need at least 10")

today = datetime.date.today()
for r in rows:
    rid = r["id"] or "?"
    short = [c for c in REQ if r[c] is None]
    if short:
        errors.append(f"{rid}: short row, missing {short}"); continue
    for c in REQ:
        if not r[c].strip():
            errors.append(f"{rid}: empty {c}")
    if r["likelihood"] not in L or r["impact"] not in I:
        errors.append(f"{rid}: likelihood/impact not on the lesson 04 scales"); continue
    if r["residual_likelihood"] not in L or r["residual_impact"] not in I:
        errors.append(f"{rid}: residual ratings not on the lesson 04 scales"); continue
    exp = cell(r["likelihood"], r["impact"])
    if r["priority"] != exp:
        errors.append(f"{rid}: priority '{r['priority']}' but matrix gives '{exp}'")
    rexp = cell(r["residual_likelihood"], r["residual_impact"])
    if r["residual_priority"] != rexp:
        errors.append(f"{rid}: residual_priority '{r['residual_priority']}' but matrix gives '{rexp}'")
    if r["residual_priority"] in P and r["priority"] in P and P.index(r["residual_priority"]) > P.index(r["priority"]):
        errors.append(f"{rid}: residual priority is higher than inherent")
    if (r["residual_likelihood"], r["residual_impact"]) == ("Rare", "Negligible") and r["response"] != "Avoid":
        warns.append(f"{rid}: residual Rare/Negligible - residual risk is never zero; justify or re-rate")
    if not re.search(r"\b(exploits?|uses?|causes?|through|via)\b", r["risk_statement"], re.I) \
            or not re.search(r"result", r["risk_statement"], re.I):
        warns.append(f"{rid}: risk_statement may not follow '[actor] exploits [weakness] ... resulting in [harm]'")
    for c in ("likelihood_why", "impact_why"):
        if len(r[c].split()) < 6:
            warns.append(f"{rid}: {c} is very short - is it a real justification?")
    if r["response"] not in RESP:
        errors.append(f"{rid}: response must be one of {sorted(RESP)}")
    if r["csf_function"] not in CSF:
        errors.append(f"{rid}: csf_function must be one of {sorted(CSF)}")
    try:
        d = datetime.date.fromisoformat(r["review_date"])
        if r["response"] == "Accept" and not (today <= d <= today + datetime.timedelta(days=366)):
            errors.append(f"{rid}: Accept needs a review date within the next 12 months")
    except ValueError:
        errors.append(f"{rid}: review_date must be YYYY-MM-DD")

resp = {r["response"] for r in rows}
for need in ("Avoid", "Accept"):
    if need not in resp:
        errors.append(f"register needs at least one {need}")
if len({r["csf_function"] for r in rows}) < 3:
    errors.append("actions cover fewer than 3 CSF functions - check Detect and Recover")

for w in warns: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"{len(rows)} risks, {len(errors)} errors, {len(warns)} warnings")
sys.exit(1 if errors else 0)
```

Expected output for a clean register:

```
10 risks, 0 errors, 0 warnings
```

Expected output when a matrix cell is misread (Possible × Major marked Medium):

```
ERROR R04: priority 'Medium' but matrix gives 'High'
10 risks, 1 errors, 0 warnings
```

The validator checks consistency, not judgement. A register can pass and still rate the X-ray machine's backup as Negligible impact — that is for the rubric.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Risk statements | Fragments ("unpatched PC") | Full sentence form with actor, weakness, asset, harm | Includes duration and data category in the harm, per lesson 04 refinements |
| Rating justification | Restates the rating | Names a Rowan-specific fact for each rating | Shows which factor (exposure, ease, how many people) drove the likelihood |
| Response choice | Reduce for everything | ≥ 1 Avoid and ≥ 1 documented Accept, each passing the three tests | Combines responses and names the primary one explicitly |
| Tool / function mapping | Product names | Category + CSF function for every action, including "no tool — policy" | Identifies Rowan's weakest function and argues spend toward it |
| Summary for managers | Technical jargon | Plain language, top five, three first actions | States friction cost of each first action, as Kestrel's directors asked for |

## Stretch goals
- Add a `sorted.csv` export ordered by priority then impact; explain why ties are broken by impact rather than likelihood (the matrix's deliberate asymmetry).
- Extend the validator to warn when `vuln_category` is "Missing patches" but the action contains no patch, replacement, or isolation verb — a crude check of lesson 04's "does the control address the actual weakness?" test.

## Reflection prompts
- Which WARN did you decide was *not* a problem, and why?
- Which risk did a peer rate differently from you? Whose justification was stronger?
- Which CSF function was empty before you started, and what does that say about Rowan?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners often treat the matrix as multiplication; the validator surfaces this quickly (e.g., Rare × Severe = High, not Low).
- Spreadsheet exports may add a BOM or use semicolons in some locales; the validator handles the BOM, not semicolons — ask learners to export "CSV UTF-8 (comma delimited)".
- Shorter version (2 h): provide six pre-written risk statements and have learners rate, treat, and validate.
- Keep the review-date window rule; it encodes lesson 04's "explicit, documented, owned, with a review date".
