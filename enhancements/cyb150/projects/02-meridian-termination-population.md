---
course_id: cyb150
project_id: cyb150-x02
title: "Meridian PBC-005/006: A Complete Population and an Honest Exception"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - cyb150-05
  - cyb150-04
objectives:
  - Collect the evidence an auditor needs to confirm that a control operates as written
competency_ids:
  - D4-S1-C05
  - D4-S1-C01
---

## Scenario
Kestrel Assurance's SOC 2 Type II fieldwork at Meridian Health Analytics (lesson 05) has reached two linked requests:

- **PBC-005:** a complete listing of everyone terminated during 1 January – 30 June 2026.
- **PBC-006:** for the termination population, evidence of access removal and its date.

The control is `MHA-AC-06`, implementing POL-AC-01 statement 3.7: *access must be disabled within one business day of the effective end date.*

A helpful colleague has already "pulled the leavers" into a spreadsheet for you. Dana Okafor wants the package by Wednesday, and she wants it right rather than fast.

## Scope and authorization
This uses synthetic exports only. Nothing is queried from a live HR system or identity provider. In real work, extracting HR data needs the data owner's approval, and the extract is handled as confidential personal data: stored in the audit evidence location, never on a personal device, and shared only with the auditor through the agreed channel.

## What you will build / produce
1. `population.csv`: the PBC-005 population, from the **system of record**, with its filter stated.
2. `exceptions.csv` (`account,termination_date,deadline,disabled_utc,result`): every termination where the control did not operate as written. `result` is `LATE` or `NOT DISABLED`.
3. `manifest.txt`: the package file names, following lesson 05's convention `<CONTROL-ID>_<PERIOD>_<short-description>_<capture-date>.<ext>`.
4. `cover-note.md`: source, filter, record count, extracted by and when, the business-day calendar you applied, the deviation statement, and any observations.
5. A draft message to the control owner and Dana reporting the exceptions *before* the auditor finds them.

## Before you start (prerequisites, starter files or data)
Lessons 04 and 05. Any spreadsheet tool or Python 3.

Meridian's business-day calendar excludes weekends and US federal holidays. The 2026 holidays inside the period are 1 Jan, 19 Jan, 16 Feb, 25 May, and 19 Jun. Verify these against the official US OPM calendar before you rely on them.

`hr_terminations.csv` (HR system of record export):
```text
employee_id,name,account,termination_date
50112,A Brennan,abrennan,2026-01-09
50147,C Duarte,cduarte,2026-01-30
50160,E Fischer,efischer,2026-02-13
50188,G Haddad,ghaddad,2026-02-27
50203,I Jovanovic,ijovanovic,2026-03-20
50219,K Lindqvist,klindqvist,2026-04-03
50231,M Nakamura,mnakamura,2026-04-17
50244,O Petrov,opetrov,2026-05-08
50250,Q Rahman,qrahman,2026-05-22
50266,S Tanaka,stanaka,2026-06-05
50271,U Varga,uvarga,2026-06-19
50290,W Xu,wxu,2026-06-30
```

`idp_audit.csv` (identity provider audit log, disable events, UTC):
```text
timestamp_utc,account,action,actor
2026-01-12T15:02:11Z,abrennan,user.disable,itsupport-msilva
2026-02-02T09:41:00Z,cduarte,user.disable,itsupport-msilva
2026-02-13T17:30:44Z,efischer,user.disable,itsupport-jkoh
2026-03-04T10:12:09Z,ghaddad,user.disable,itsupport-msilva
2026-03-23T08:55:31Z,ijovanovic,user.disable,itsupport-jkoh
2026-04-06T16:20:00Z,klindqvist,user.disable,itsupport-msilva
2026-05-11T11:03:27Z,opetrov,user.disable,itsupport-jkoh
2026-05-26T09:14:52Z,qrahman,user.disable,itsupport-msilva
2026-06-08T13:47:18Z,stanaka,user.disable,itsupport-jkoh
2026-06-22T10:05:40Z,uvarga,user.disable,itsupport-msilva
2026-07-01T09:30:02Z,wxu,user.disable,itsupport-jkoh
2026-03-02T12:00:00Z,contractor-bi2,user.disable,itsupport-msilva
```

`colleague_list.csv` (the helpful spreadsheet; do not trust it):
```text
account,termination_date
abrennan,2026-01-09
cduarte,2026-01-30
efischer,2026-02-13
ghaddad,2026-02-27
ijovanovic,2026-03-20
klindqvist,2026-04-03
opetrov,2026-05-08
qrahman,2026-05-22
stanaka,2026-06-05
uvarga,2026-06-19
wxu,2026-06-30
```

## Milestones
1. **Population first.** Compare the colleague's list with the HR export. Write down what is missing and why a hand-built list fails the completeness test (lesson 05, "Populations and samples").
2. **Compute deadlines.** For each termination, find the next business day after the end date, using the stated calendar.
3. **Match removals.** Join each termination to its disable event. Classify each as on time, `LATE`, or `NOT DISABLED`.
4. **Find the stray.** One disable event has no HR record. Decide what it is (an observation about contractor offboarding, not a PBC-006 exception) and record it in the cover note rather than dropping it.
5. **Write the deviation statement.** Write it factually, without characterizing anyone ("no disable event exists for mnakamura as of extraction", not "IT forgot").
6. **Escalate.** Write the same-day message to the control owner and Dana: what you found, what may still be enabled *right now*, and the decision they need to make. The audit log only shows that no disable event exists; it does not prove the account is enabled today. Ask the identity team to confirm the account's current state in the IdP (in this synthetic exercise, report it as "no disable event found; current state unverified"). An account confirmed enabled today is a live risk as well as an audit exception.
7. **Run the checker.**

## Acceptance criteria
- [ ] The population matches the HR system of record exactly (12 records).
- [ ] The exceptions are exactly the terminations that missed the rule under the stated calendar, each with its deadline.
- [ ] Every manifest name follows the convention.
- [ ] The cover note states source, filter, record count, extractor, calendar, deviation, and the contractor observation.
- [ ] The escalation message goes out the same day, names the account with no disable event as a possible immediate risk, and asks for its current state to be confirmed (reported as unverified until it is).
- [ ] Nothing was altered, back-dated, or omitted to make the result look better.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `check_pbc006.py` and run `python3 check_pbc006.py hr_terminations.csv population.csv exceptions.csv manifest.txt cover-note.md`:

```python
#!/usr/bin/env python3
"""cyb150-x02 acceptance check for the PBC-005/PBC-006 package.
Usage: python3 check_pbc006.py hr_terminations.csv population.csv exceptions.csv manifest.txt cover-note.md"""
import csv, re, sys
hr_f, pop_f, exc_f, man_f, cover_f = sys.argv[1:6]
fails = []
hr = {r["account"]: r["termination_date"] for r in csv.DictReader(open(hr_f))}
pop_rows = list(csv.DictReader(open(pop_f, encoding="utf-8-sig")))
pop_accts = [r["account"] for r in pop_rows]
dups = sorted({a for a in pop_accts if pop_accts.count(a) > 1})
if dups: fails.append(f"population has duplicate rows for {dups}")
if len(pop_rows) != len(hr): fails.append(f"population has {len(pop_rows)} rows; the HR system of record has {len(hr)}")
pop = {r["account"]: r["termination_date"] for r in pop_rows}
missing, extra = set(hr) - set(pop), set(pop) - set(hr)
if missing: fails.append(f"population incomplete - missing {sorted(missing)} (did you trust a hand-made list?)")
if extra: fails.append(f"population has records not in the HR system of record: {sorted(extra)}")
for a in set(hr) & set(pop):
    if hr[a] != pop[a]: fails.append(f"{a}: termination date altered ({pop[a]} vs HR {hr[a]})")

exc_rows = list(csv.DictReader(open(exc_f, encoding="utf-8-sig")))
exc_accts = [r["account"] for r in exc_rows]
dups = sorted({a for a in exc_accts if exc_accts.count(a) > 1})
if dups: fails.append(f"exceptions has duplicate rows for {dups}")
exc = {r["account"]: r for r in exc_rows}
EXPECTED = {"ghaddad": "LATE", "mnakamura": "NOT DISABLED"}   # with weekends + US federal holidays excluded
for a, res in EXPECTED.items():
    if a not in exc: fails.append(f"missing exception for {a}")
    elif exc[a].get("result", "").strip().upper() != res: fails.append(f"{a}: result should be {res}")
for a in set(exc) - set(EXPECTED):
    hint = " (2026-05-25 is a US federal holiday - check your business-day calendar)" if a == "qrahman" else ""
    fails.append(f"{a} reported as an exception but met the one-business-day rule{hint}")
DEADLINE = {"ghaddad": "2026-03-02", "mnakamura": "2026-04-20"}   # next business day after the end date
DISABLED = {"ghaddad": "2026-03-04T10:12:09Z", "mnakamura": ""}      # from idp_audit.csv
for a, r in exc.items():
    for k in ("termination_date", "deadline", "result"):
        if not r.get(k, "").strip(): fails.append(f"{a}: exception row missing {k}")
    if a in hr and r.get("termination_date", "").strip() and r["termination_date"].strip() != hr[a]:
        fails.append(f"{a}: exception termination_date {r['termination_date']} does not match HR {hr[a]}")
    if a in DEADLINE and r.get("deadline", "").strip() and r["deadline"].strip() != DEADLINE[a]:
        fails.append(f"{a}: deadline {r['deadline']} is wrong under the stated calendar")
    if a in DISABLED and (r.get("disabled_utc") or "").strip() != DISABLED[a]:
        want = DISABLED[a] or "empty (no disable event in the log)"
        fails.append(f"{a}: disabled_utc should be {want}")

name = re.compile(r"^CC\d\.\d+_2026-(H1|Q[12])_[a-z0-9-]+_\d{4}-\d{2}-\d{2}\.(csv|pdf|md|json)$")
files = [l.strip() for l in open(man_f) if l.strip()]
if len(files) < 4: fails.append("manifest should list at least 4 artifacts (population, IdP log export, exceptions, cover note)")
for f in files:
    if not name.match(f): fails.append(f"manifest filename breaks the convention: {f}")
cover = open(cover_f).read().lower()
for k in ("source", "filter", "record count", "extracted by", "deviation"):
    if k not in cover: fails.append(f"cover note missing '{k}'")
if "contractor-bi2" not in cover: fails.append("cover note should mention the IdP disable with no HR record (contractor-bi2) as an observation, not hide it")
for m in fails: print("FAIL", m)
print("ALL CHECKS PASSED" if not fails else f"{len(fails)} problem(s)")
sys.exit(1 if fails else 0)
```

Expected output on a correct package: `ALL CHECKS PASSED`. If you build the population from the colleague's list, you will see:

```text
FAIL population incomplete - missing ['mnakamura'] (did you trust a hand-made list?)
```

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Population completeness | Uses the colleague list | Uses the system of record and states the filter | Proposes the auditor's cross-check (HR population vs. IdP disable log, both directions) |
| Exception accuracy | Weekend or holiday errors | Correct deadlines, calendar stated | Explains why stating the calendar is part of the evidence, not a detail |
| Professional honesty | Exceptions softened or buried | Self-reported deviation with facts only | Separates the audit exception from the live risk and routes each to the right owner |
| Package hygiene | Ad-hoc file names | Convention followed; cover note complete | Evidence log row for each artifact, as in lesson 05 |

## Stretch goals
- Write the PBC-006 sample response, assuming Kestrel samples five records including `ghaddad`.
- Draft the management response for the exception (what happened, why, what changes, by when, by whom) for Dana to edit.

## Reflection prompts
- The missing record in the colleague's list was also the most serious exception. Why is that pattern common, and not a coincidence?
- If someone asked you to "just disable mnakamura and leave it out of the package", what would you say, and who would you copy?

## Instructor notes (common pitfalls, how to adapt for time)
- Two traps are deliberate. The colleague's list omits the one never-disabled account. And `qrahman` looks late if you forget the 25 May holiday.
- `efischer` was disabled *before* the end date. That is fine for the control, but worth discussing: was the employee locked out on their last afternoon?
- Shorter version (2 h): give learners the deadlines column and focus on population completeness and the escalation message.
