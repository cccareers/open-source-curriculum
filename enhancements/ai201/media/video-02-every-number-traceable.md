---
course_id: ai201
media_id: ai201-v02
type: video-script
title: "Every Number Traceable: The Report Number-Check Guard"
format: hybrid
target_runtime: "6 min"
related_lessons:
  - ai201-05
objectives:
  - Produce an automated report that assembles data, adds AI-generated narrative, and delivers on a schedule
competency_ids:
  - D3-S1-C01
---

## Purpose

After watching, the learner can build and test a guard that fails a report run when the AI narrative contains any number not present in the metrics object. They will also know the two tokenizing traps (digits inside names like `p90`, and comma-formatted figures) that let a naive guard pass wrong figures.

## Audience and prerequisites

Apprentices working through lesson ai201-05 who have built, or are about to build, the assemble and narrate steps. They should be able to read a short Python function. If the platform has a code step, the same function can go there. If not, it can run as a small external function the workflow calls.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then cut to a weekly ops report in an email client. One sentence is highlighted: "Requests received rose 13%." | "This report went to an operations lead on a Monday. Every figure in it was right except one. The model wrote 13 percent. The metrics object said 12.6. Nobody noticed. Then it was quoted in a staffing meeting." |
| 0:20 | Title card. | "Lesson 05's rule is that the model explains numbers and never produces them. Today we enforce that rule in code." |
| 0:28 | The lesson 05 metrics object on screen, with `deltas.requests_received_pct: 12.6` boxed. | "Here's the input: the metrics object from the assemble step. The delta was computed in the workflow, so it's 12.6. The narrate prompt says every number must appear verbatim. Prompts are instructions, not guarantees, so we check." |
| 0:50 | Editor. Type the first version: `re.findall(r"\d+(?:\.\d+)?", text)`. | "First attempt: pull every number out of the narrative and every number out of the metrics JSON, then compare. Here's the obvious regular expression." |
| 1:10 | Run it on the good narrative from lesson 05. Output: `unmatched: []`. Then run it on a bad sentence: "Quotes had 90 open in week 11." Output: `unmatched: []`. | "Run it on the good narrative and it passes. Fine. Now try a sentence that's plainly wrong: 'Quotes had 90 open in week 11.' Neither figure is in the metrics, and it still passes. Why?" |
| 1:25 | Print the allowed set from an abridged metrics object (report ID, received, p90 only): `[11.0, 31.2, 90.0, 412.0, 2026.0]`. Highlight `p90_cycle_hours` and `W11` in the JSON. | "Look at what the naive pattern pulled out of the metrics object. 90 comes from the key name 'p90 cycle hours'. 11 comes from the report ID, 'W11'. Digits inside names went into the allowed list, so any narrative can use 90 or 11 and get through. That's the dangerous kind of guard, the kind that passes things it should catch." |
| 1:40 | Edit the pattern to `(?<![A-Za-z0-9.])\d+(?:\.\d+)?`. Rerun: the bad sentence now returns `[90.0, 11.0]`. | "So we say a number can't start right after a letter, a digit, or a decimal point. That's this lookbehind. The digits inside names drop out of both sides, and the bad sentence fails the way it should." |
| 2:00 | Second trap: narrative contains "1,412". Show it splitting into 1 and 412. | "Second trap: thousands separators. '1,412' splits into 1 and 412, and 412 is in the metrics, so a wrong figure can pass. We strip commas before matching. In a locale that uses commas as decimal points, fix this in the assemble step by formatting numbers one way everywhere." |
| 2:25 | Final code on screen (below). | "Here's the whole guard. Ten lines." |
| 2:35 | Code: see "On-screen assets", listing 1. | "`numbers_in` strips commas and returns every standalone number as a float, so 5.4 and 5.40 compare equal. `unmatched_numbers` collects every number that appears anywhere in the serialized metrics object, then returns the narrative numbers that aren't in it. An empty list means pass." |
| 3:00 | Terminal: run against the good narrative. Output `[]`. Run against the bad one. Output `[13.0]`. | "Good narrative: empty list. The 13 percent narrative: 13 comes back as unmatched. That's the bug from the cold open, caught before delivery." |
| 3:20 | Workflow diagram: assemble, narrate, guard, then a branch. "Pass" goes to deliver. "Fail" goes to one retry, then fallback: a numbers-only report with the note "narrative withheld". | "In the workflow, the guard sits between narrate and deliver. On a fail, log the narrative, retry once, and if it still fails, send the numbers-only report with a line saying the narrative was withheld. A bare table is better than a fabricated figure." |
| 3:50 | Talking head. | "Two honest limits. First, this guard checks that numbers exist in the object. It doesn't check that they're attached to the right metric. 'Quotes had 21 open' passes even though 21 belongs to support. Second, it can't see numbers written as words: 'roughly two hundred'. You cover the second by adding a prompt rule to write all figures as digits. For the first, you sample narratives by hand each week." |
| 4:25 | Practice step 5 from lesson 05 on screen. | "Lesson 05, practice step 5, asks you to break it on purpose. Hand the model a metrics object with a field missing and see whether it invents the figure." |
| 4:40 | Terminal: metrics object with `median_cycle_hours` deleted. The narrative says "Median cycle time was 5.1 hours." The guard returns `[5.1]`. | "Here's what that looks like. I removed the median. The model wrote 5.1 anyway, because the prior period's 4.9 was still there and it filled the gap. The guard catches it. That's your evidence for step 5." |
| 5:05 | Test file on screen (listing 2). | "Last thing: turn each of these cases into a test, so the guard can't quietly regress when someone 'simplifies' the regex." |
| 5:25 | Recap overlay: numbers in code only; guard between narrate and deliver; fallback to numbers-only; known limits plus weekly sample. | "Arithmetic happens in the workflow. The model narrates. The guard checks every figure. When the guard fails, send a smaller true report, not a bigger false one." |
| 5:50 | End card. | "Build it, break it, and bring the failing narrative to your review." |

## On-screen assets and B-roll

Listing 1, the guard (tested on Python 3.8):

```python
import json, re

NUM = re.compile(r"(?<![A-Za-z0-9.])\d+(?:\.\d+)?")

def numbers_in(text):
    return [float(n) for n in NUM.findall(text.replace(",", ""))]

def unmatched_numbers(narrative, metrics):
    allowed = set(numbers_in(json.dumps(metrics)))
    return [n for n in numbers_in(narrative) if n not in allowed]
```

Listing 2, the regression tests (pytest):

```python
from guard import numbers_in, unmatched_numbers

METRICS = {"report_id": "ops-weekly-2026-W11",
           "headline": {"requests_received": 412, "p90_cycle_hours": 31.2},
           "comparison": {"deltas": {"requests_received_pct": 12.6}},
           "thresholds_breached": [{"metric": "p90_cycle_hours", "threshold": 24}]}

def test_metric_names_are_not_figures():
    assert numbers_in("p90 for W11 was 31.2") == [31.2]

def test_traceable_narrative_passes():
    text = "Overall p90 reached 31.2 hours, above the 24-hour threshold; received rose 12.6% to 412."
    assert unmatched_numbers(text, METRICS) == []

def test_rounded_or_invented_figures_fail():
    assert unmatched_numbers("Received rose 13% to 1,412.", METRICS) == [13.0, 1412.0]
```

- The lesson 05 metrics object and sample narrative, typeset.
- Workflow diagram of assemble, narrate, guard, and deliver, with the fallback branch.
- The cold-open email mock-up, with a fictional company and no real names.

## Accessibility

- Captions throughout. When a regex is on screen, narration explains what it does in plain words. Viewers are never expected to parse it visually.
- Highlighted tokens ("p90", "1,412") are also underlined and called out by name in the narration, not by color alone.
- Terminal output at 18pt minimum, on a high-contrast theme, and each output is read aloud ("empty list", "13 comes back as unmatched").
- Code listings are provided as text in the video description so screen-reader users get them in full.

## Check for understanding

1. Why does the naive pattern `\d+(?:\.\d+)?` let a wrong narrative through? **Answer:** It extracts digits from names inside the metrics object, like `p90_cycle_hours` and `W11`. Then 90 and 11 count as allowed figures, so a narrative that invents "90 open" passes.
2. The narrative says "support had 21 open" but the metrics object has support at 21 open and also a different queue at 21 SLA breaches. The narrative wrongly attributes a figure, yet the guard passes. Why, and what covers it? **Answer:** The guard only checks that each number exists somewhere in the object, not which metric it belongs to. A scheduled human sample of narratives covers attribution errors.
3. The guard fails twice in a row on Monday's run. What should be delivered? **Answer:** The numbers-only report with a note that the narrative was withheld, plus a log of the failing narrative. Sending nothing is wrong, because silence looks like a broken scheduler.
