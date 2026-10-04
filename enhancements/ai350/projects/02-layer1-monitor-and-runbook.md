---
course_id: ai350
project_id: ai350-x02
title: "Layer-1 Monitor and Response Runbook for the Triage Assistant"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ai350-06
  - ai350-07
objectives:
  - Monitor AI-generated content for misinformation and compliance risk and respond when monitoring fires
  - Write a responsible-AI policy stating what an automation may decide, what a human must decide, and how decisions are recorded
competency_ids:
  - D6-S1-C04
  - D6-S1-C05
---

## Scenario
The retail company from ai350-04 has just had the incident described at the end of ai350-07: a weekly sample found a reply quoting a 60-day return window when the policy says 30, and a search found eleven more. The corpus has been fixed. Your manager now wants two things before the triage assistant goes back to automatic sending: deterministic layer-1 checks that would have blocked those replies, and a one-page runbook and decision-rights table that say who does what next time.

## What you will build / produce
1. `monitor.py` with three functions:
   - `run_layer1(output, source, customer_input, allow_domains) -> set[str]` — returns the IDs of the rules from the ai350-07 rule set that fire: M01 (URL domain not on allow list), M02 (email or phone in output that is not in the customer's input), M03 (a price, SKU, ISO date, or "N days" figure in the output that does not appear in the source text), M05 (advice phrases such as "you should invest" or "diagnose"), M07 (output under 20 or over 400 words).
   - `decide(fired: set[str]) -> str` — returns `"block"` if any High-severity rule fired, `"flag"` if only lower-severity rules fired, `"pass"` otherwise. Use the severities in the ai350-07 table.
   - `escape_rate(reviews: list[dict]) -> float | None` — defects divided by outputs reviewed; `None` when nothing was reviewed.
2. A decision-rights table (ai350-06 format) for the triage assistant with at least eight decisions, including "send reply automatically" and "honour an incorrect return window already quoted to a customer".
3. A one-page response runbook (ai350-07, step 6 of Practice) naming the pause switch, the S1/S2/S3 definitions, and who is notified for each.
4. A rehearsal log: you walk the runbook against the 60-day incident and record where you had to guess.

## Before you start (prerequisites, starter files or data)
- Python 3.10+ and `pytest`.
- Source text the tests use (the system of record for this exercise): *"Returns policy (current): items may be returned within 30 days of delivery. Order 8842: Desk lamp, SKU LMP-220, delivered 2026-07-02, price $49.00."*
- Your decision record format from ai350-06, if you completed that practice.

## Milestones
1. **Read the rule set again (20 min).** Copy M01, M02, M03, M05, M07 and their severities into a comment block at the top of `monitor.py`.
2. **Implement M01 and M02 (60 min).** Regular expressions are fine. Make sure the customer's own address does not trip M02.
3. **Implement M03, the traceability check (75 min).** Extract specifics from the output and check each one appears in the source. This is the rule that would have caught the 60-day reply.
4. **Implement M05, M07, `decide`, and `escape_rate` (45 min).** Run the full suite.
5. **Write the decision-rights table (45 min).** Tier every decision and name the human role for every medium and high row.
6. **Write and rehearse the runbook (60 min).** Time yourself walking the 60-day incident. Fix every step where you hesitated.

## Acceptance criteria
- [ ] `python -m pytest -q` passes all tests below.
- [ ] A reply quoting "60 days" against the 30-day source is blocked, not merely flagged.
- [ ] `decide` uses the severities from the ai350-07 table, and block always wins over flag.
- [ ] Decision-rights table has at least eight rows, each with a tier and a rule; every medium/high row names a human role.
- [ ] Runbook fits on one page and names an actual pause switch location.
- [ ] Rehearsal log records the time taken and at least one runbook fix.

## Automated checks (coding courses) / Evidence checklist (non-coding)
Save as `tests/test_monitor.py` and run `python -m pytest -q` from the project root.

```python
# tests/test_monitor.py  -- run with:  python -m pytest -q
import pytest
from monitor import run_layer1, decide, escape_rate

SOURCE = ("Returns policy (current): items may be returned within 30 days of delivery. "
          "Order 8842: Desk lamp, SKU LMP-220, delivered 2026-07-02, price $49.00.")
INPUT = "Hi, I'm Dana Reyes (dana.reyes@example.com). Order 8842 arrived damaged."
ALLOW = {"help.example-retail.com"}

def fired(output):
    return run_layer1(output, source=SOURCE, customer_input=INPUT, allow_domains=ALLOW)

def test_clean_reply_passes():
    out = ("Hi Dana, I'm sorry your desk lamp (SKU LMP-220) arrived damaged. You can return it "
           "within 30 days of delivery, and we will send a replacement as soon as it is "
           "scanned. Start here: https://help.example-retail.com/returns")
    assert fired(out) == set()
    assert decide(set()) == "pass"

def test_M01_unapproved_domain_blocks():
    out = "Start your return at https://returns-portal.example.net/8842 within 30 days."
    assert "M01" in fired(out)
    assert decide(fired(out)) == "block"

def test_M02_contact_not_in_input_blocks():
    out = "I've copied our partner at audit@partner-review-mail.example on this."
    assert "M02" in fired(out)

def test_M02_customer_own_address_is_fine():
    assert "M02" not in fired("We'll email the label to dana.reyes@example.com within 30 days.")

def test_M03_stale_return_window_blocks():
    # the lesson's incident: the corpus had an old 60-day page; the policy says 30
    out = "No problem - you have 60 days to return it."
    assert "M03" in fired(out)
    assert decide(fired(out)) == "block"

def test_M03_invented_price_and_sku():
    assert "M03" in fired("Your refund of $59.00 for SKU LMP-999 is on its way.")

def test_M05_advice_phrase_routes_to_reviewer():
    assert "M05" in fired("Honestly, you should invest the refund in something sturdier.")

def test_M07_length_only_flags():
    assert fired("OK.") == {"M07"}
    assert decide({"M07"}) == "flag"

def test_block_wins_over_flag():
    assert decide({"M07", "M01"}) == "block"

def test_escape_rate():
    reviews = [{"defect": False}] * 27 + [{"defect": True}] * 3
    assert escape_rate(reviews) == pytest.approx(0.10)
    assert escape_rate([]) is None
```

Expected result once complete: `10 passed`.

## Rubric
| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Rule implementation | Some rules fire on the wrong inputs | All five rules behave as the suite expects | Adds two more rules from the ai350-07 table (for example M04, M06) with tests |
| Traceability (M03) | Checks only prices | Checks prices, SKUs, dates, and day counts against the source | Explains false positives (for example "24 hours") and how a reviewer would tune them |
| Decision rights | Tiers assigned without reasons | Tiers match the ai350-06 criteria, humans named by role | Records deliberate downgrades with a reason, and states review capacity |
| Runbook | Generic steps | Severity, containment, notification, correction, all specific to this workflow | Includes a timed rehearsal and a revised version |
| Metrics | Escape rate computed only | Escape rate plus a stated baseline | Block-rate precision tracked on a labelled sample |

## Stretch goals
- Add M14: given a stored `model_version` and `prompt_version`, return `"run_regression"` when either changes.
- Build a ten-case regression set (including the 60-day reply and the paired cases from ai350-05) and a script that runs `run_layer1` over it.
- Write the decision record (ai350-06 JSON) for every `block` and test that it contains no raw email address.

## Reflection prompts
- The root cause of the 60-day incident was a stale corpus page, not the model. Which of your rules would detect the next stale page fastest?
- Which of your rules will cause the most false alarms, and what will reviewers do if they get tired of it?
- Who in your organisation actually has the authority to decide whether to honour the incorrect window?

## Instructor notes (common pitfalls, how to adapt for time)
- Learners often write M03 as "numbers in output must be in the source" and then fail on the order number itself appearing in different formats. Encourage a small, explicit set of specific patterns rather than all digits.
- M02 phone regexes tend to match order numbers; the suite does not test this, so ask learners to add their own test for it.
- Short on time: skip the decision-rights table and focus on code plus runbook (about 4 hours).
- No-code variant: implement M01, M03, and M05 as filter steps and submit screenshots of held runs; the runbook and table are unchanged.
