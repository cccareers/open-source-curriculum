---
course_id: cyb150
project_id: cyb150-x01
title: "Cedar Hollow Register, Machine-Checked: Preparing for the Funder Review"
kind: supplementary-project
status: draft
hours_estimate: 3
difficulty: warm-up
related_lessons:
  - cyb150-03
  - cyb150-07
objectives:
  - Rate a risk by likelihood and impact and defend its priority against the rest of the register
competency_ids:
  - D4-S1-C02
---

## Scenario
Angela Ruiz at Cedar Hollow Community Health (project 07) will put your register in front of the grant funder and the cyber-insurance underwriter. Before it leaves her desk, she wants a mechanical pass to catch the defects reviewers spot first: unrated noun phrases, arithmetic and banding errors, acceptances with no expiry, missing category coverage, and statements that slip into legal conclusions. This project converts your project 07 register into a structured CSV and runs it through a checker, so that human review time goes on the judgement: the anchors, the tie-breaks, and the top-five defence.

This is a **supplement to project 07, not a replacement**. The checker cannot tell whether your ratings are right. It can only tell whether the register is internally consistent and complete.

## Scope and authorization
This is a paper exercise about a fictional organization. No systems are touched. If you later adapt the checker for a real register, the register is a confidential document (a list of the organization's weaknesses), so store and share it under that classification.

## What you will build / produce
1. `register.csv`: your project 07 register in the columns below, with at least 14 risks.
2. A short `checker-notes.md`: each FAIL you fixed and what it taught you, and every WARN-level judgement the checker *cannot* make that you checked by hand.
3. A passing run of `check_register.py`.

Columns: `id, statement, category, L, L_why, I, I_why, driver_column, score, band, inherent_L, inherent_I, treatment, owner, target_date, accept_by, accept_date, accept_rationale, accept_expiry, compensating, legal_flag`.

- `category` uses one or more of `ehr-clinical`, `vendor`, `people-process`, `availability`, `unverified`, separated by `;`.
- `driver_column` is the impact column that set I: `patient data`, `clinical operations`, `financial`, or `regulatory`.
- `L`/`I` are your **residual** ratings. `inherent_L`/`inherent_I` are filled for at least six risks.
- `legal_flag` is `yes` where the risk turns on a determination for the Privacy Officer or counsel.
- Bands use lesson 03's thresholds: 20–25 Critical, 12–16 High, 6–10 Medium, 1–5 Low. If your project 07 scale states different thresholds, edit `band()` in the checker to match and say so in your notes.

## Before you start (prerequisites, starter files or data)
Your project 07 register (or at least its top five, rebuilt), lesson 03, and Python 3.9+.

## Milestones
1. Transcribe the register into the CSV. Do not "fix" anything yet; you want to see what the checker finds.
2. Run the checker and record every FAIL in `checker-notes.md` *before* fixing it.
3. Fix the defects. Where a fix changes a rating or a band, update your top-five defence paragraphs too.
4. Do the manual pass the checker cannot do. For each top-five risk, confirm the justification names an anchor *level* and a Cedar Hollow fact (the 40,000 patients, the phishing event eight months ago, the two departed clinicians). Confirm that any tie between equal scores is broken on non-score grounds.
5. Re-run the checker until it passes.

## Acceptance criteria
- [ ] `check_register.py register.csv` prints `ALL CHECKS PASSED`.
- [ ] `checker-notes.md` lists every original FAIL and the change made.
- [ ] The manual pass covers anchors, tie-breaks, and the dependency notes ("this rating assumes X holds").
- [ ] Exactly one acceptance, signed off by a role that can bind Cedar Hollow (the Executive Director), with an expiry date.

## Automated checks (coding courses) / Evidence checklist (non-coding)
`check_register.py`:

```python
#!/usr/bin/env python3
"""cyb150-x01 register checker. Usage: python3 check_register.py register.csv"""
import csv, re, sys, datetime
rows = list(csv.DictReader(open(sys.argv[1], newline="", encoding="utf-8-sig")))
COLS = ["id", "statement", "category", "L", "L_why", "I", "I_why", "driver_column", "score", "band",
        "inherent_L", "inherent_I", "treatment", "owner", "target_date",
        "accept_by", "accept_date", "accept_rationale", "accept_expiry", "compensating", "legal_flag"]
if not rows or any(c not in rows[0] for c in COLS):
    sys.exit("header must contain: " + ",".join(COLS))
def band(s):  # lesson 03 thresholds
    return "Critical" if s >= 20 else "High" if s >= 12 else "Medium" if s >= 6 else "Low"
F = []
CATS = {"ehr-clinical": 3, "vendor": 2, "people-process": 2, "availability": 1, "unverified": 1}
for r in rows:
    i = r["id"]
    st = r["statement"].lower()
    if not (re.search(r"\bmay\b", st) and "exploiting" in st and "resulting in" in st):
        F.append(f"{i}: statement is not '[threat] may [action] by exploiting [weakness], resulting in [consequence]'")
    try:
        L, I_, S = int(r["L"]), int(r["I"]), int(r["score"])
    except ValueError:
        F.append(f"{i}: L, I, score must be integers"); continue
    if not (1 <= L <= 5 and 1 <= I_ <= 5): F.append(f"{i}: L and I must be 1-5")
    if S != L * I_: F.append(f"{i}: score {S} != {L}x{I_}")
    if r["band"] != band(L * I_): F.append(f"{i}: band {r['band']} should be {band(L * I_)}")
    for k in ("L_why", "I_why"):
        if len(r[k].split()) < 8: F.append(f"{i}: {k} too short - name the anchor and the fact")
    if r["driver_column"] not in {"patient data", "clinical operations", "financial", "regulatory"}:
        F.append(f"{i}: driver_column must name the impact column that drove I")
    if r["inherent_L"] and r["inherent_I"]:
        try:
            iL, iI = int(r["inherent_L"]), int(r["inherent_I"])
        except ValueError:
            F.append(f"{i}: inherent_L and inherent_I must be integers")
        else:
            if not (1 <= iL <= 5 and 1 <= iI <= 5): F.append(f"{i}: inherent_L and inherent_I must be 1-5")
            elif iL * iI < S: F.append(f"{i}: residual exceeds inherent")
    t = r["treatment"].lower()
    if t not in {"mitigate", "transfer", "avoid", "accept"}: F.append(f"{i}: bad treatment {t}")
    if not r["owner"]: F.append(f"{i}: owner role missing")
    if band(S) in {"High", "Critical"} and t != "accept" and not re.fullmatch(r"\d{4}-\d\d-\d\d", r["target_date"]):
        F.append(f"{i}: above Medium needs a target_date")
    if t == "accept":
        for k in ("accept_by", "accept_date", "accept_rationale", "accept_expiry", "compensating"):
            if not r[k].strip(): F.append(f"{i}: accept record missing {k}")
        if "executive director" not in r["accept_by"].lower():
            F.append(f"{i}: accept_by must be the Executive Director, the role that can bind Cedar Hollow")
        try:
            if datetime.date.fromisoformat(r["accept_expiry"]) <= datetime.date.fromisoformat(r["accept_date"]):
                F.append(f"{i}: acceptance expiry must be after acceptance date")
        except ValueError:
            F.append(f"{i}: accept dates must be YYYY-MM-DD")
    if re.search(r"\b(is|constitutes|would be) a (reportable )?breach\b|\bin violation of\b|\bnon-?compliant with hipaa\b", st):
        F.append(f"{i}: statement draws a legal conclusion - state facts and set legal_flag instead")
if len(rows) < 14: F.append(f"only {len(rows)} risks; need >= 14")
for c, n in CATS.items():
    got = sum(c in r["category"].lower().split(";") for r in rows)
    if got < n: F.append(f"category '{c}': {got} risk(s), need >= {n}")
if not any("ridge" in r["statement"].lower() for r in rows): F.append("need a vendor risk concerning Ridge Revenue Partners")
tr = [r["treatment"].lower() for r in rows]
if "avoid" not in tr: F.append("need at least one avoid")
if tr.count("accept") != 1: F.append(f"need exactly one accept (found {tr.count('accept')})")
if sum(bool(r["inherent_L"] and r["inherent_I"]) for r in rows) < 6: F.append("need inherent ratings for >= 6 risks")
if sum(r["legal_flag"].strip().lower() in {"yes", "y", "true"} for r in rows) < 2: F.append("need >= 2 risks flagged for Privacy Officer/counsel")
for m in F: print("FAIL", m)
print(f"{len(rows)} risks: " + ("ALL CHECKS PASSED" if not F else f"{len(F)} problem(s)"))
sys.exit(1 if F else 0)
```

Expected output on a consistent register: `14 risks: ALL CHECKS PASSED` (the count is your number of risks). A typical first-run failure:

```text
FAIL R01: band High should be Critical
FAIL R07: statement draws a legal conclusion - state facts and set legal_flag instead
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Internal consistency | Multiple arithmetic or band errors | Checker passes | Notes explain *why* each original error happened (e.g. treating a 1×5 as Low without a tail-risk flag) |
| Justification quality (manual) | Restates the score | Names anchor level plus a Cedar Hollow fact | Names the control each rating depends on, and what would re-rate it |
| Treatment discipline | Every risk "mitigate" | One genuine avoid, one valid accept, one non-acceptable risk identified | The avoid names what stops existing (e.g. the twelve years of unreviewed scans) |
| Legal boundary | Statements conclude "breach" or "violation" | Facts only; ≥ 2 flagged for the Privacy Officer and counsel | Flags carry the specific question being routed |

## Stretch goals
- Add a WARN for any `1×5` or `2×5` risk without the word "tail" or "existential" in a note column. This is lesson 03's "matrix cannot see catastrophic tails".
- Export the top five as the one-page summary Angela will hand the funder.

## Reflection prompts
- Which FAIL surprised you most, and what habit would have prevented it?
- Name one thing the checker passed that a skeptical funder would still question.

## Instructor notes (common pitfalls, how to adapt for time)
- The legal-conclusion check is a simple pattern match and will miss paraphrases. Treat it as a prompt for discussion, not a guarantee.
- Learners sometimes satisfy "exactly one accept" by changing a real acceptance to mitigate. Ask what changed in the risk, not just in the cell.
- 90-minute version: transcribe only the top eight risks and relax the 14-risk and category checks.
