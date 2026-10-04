---
course_id: ai101
project_id: ai101-x01
title: "Site 2 Ticket Triage Pipeline"
kind: supplementary-project
status: draft
hours_estimate: 6
difficulty: core
related_lessons:
  - ai101-06
  - ai101-07
  - ai101-08
objectives:
  - Call a hosted model API from a simple script and describe when fine-tuning or a tuned system prompt is the right adaptation
  - Apply few-shot examples and multi-step prompt chains to tasks a single prompt cannot do well
competency_ids:
  - D1-S1-C05
  - D1-S1-C03
---

## Scenario

The support team for ShiftLine — the scheduling app used by shift managers at three warehouse sites — gets a few hundred messages a day. Last week a calmly worded message about the Site 2 handheld scanners sat in the NORMAL pile for three hours while an angry message about report formatting got escalated. The team lead wants the URGENT / NORMAL / LOW standard from lesson 06 ("urgent means the customer is blocked from working, not how upset they sound") applied consistently, overnight, to a CSV export of the day's messages, with anything URGENT or uncertain flagged for a person to check first thing.

You already have the fifty-line classifier script from lesson 08. It has no few-shot examples, no retry, no timeout, and no validation that the label is one of the three allowed words — the lesson called those "the next three things you would add". This project adds them, and adds tests so you can prove the script behaves correctly **without spending a cent on API calls**.

## What you will build / produce

- `triage.py` — a small Python module that:
  - builds a request payload with a system prompt and few-shot examples sent as alternating `user` / `assistant` turns;
  - reads the label out of the nested response, refusing truncated (`stop_reason: max_tokens`) or out-of-set answers;
  - retries rate-limited calls with exponential backoff (1 s, 2 s, 4 s…) and a cap on attempts;
  - estimates cost from the `usage` block;
  - processes a CSV of tickets and writes a labelled CSV plus a token and cost summary.
- `test_triage.py` — the offline test suite below, passing.
- `DECISION.md` — half a page answering: at what volume and accuracy gap would you move from this tuned system prompt plus few-shot block to fine-tuning, and what would you measure first?

## Before you start (prerequisites, starter files or data)

- Python 3.8 or later and `pip install pytest`. No other packages are required; the real HTTP call uses the standard library, as in lesson 08.
- The lesson 08 script ("A script you can actually run") as your starting point.
- The few-shot examples from lesson 06 ("Few-shot: showing instead of telling").
- Optional for milestone 5 only: an API key **with a spending limit set**, stored in an environment variable — never in the file.
- A `tickets.csv` with columns `ticket_id,message`. Write at least 15 rows yourself in the style of the lesson examples (Site 2 scanners, night-shift login, invoice logo, notification email), including at least three angry-but-not-blocked and three calm-but-blocked messages.

**Design rule that makes the tests possible:** your code never calls the network directly. Every function that needs the model takes a `send` argument — a function that accepts a payload dict and returns the response dict. In production you pass a real `http_send`; in tests you pass a fake. `send` raises `triage.RateLimited` when the provider returns HTTP 429.

## Milestones

1. **Build the request.** Write `build_payload(message, model) -> dict`. Temperature `0`, a small `max_tokens` (the tests allow 1–20), the system prompt naming all three labels, and at least three few-shot pairs as alternating `user` / `assistant` messages before the real message. Cover all three labels and do not end on your rarest class.
2. **Read the response safely.** Write `extract_label(response) -> str`. Normalize whitespace, case, and a trailing full stop. Raise `TruncatedResponse` if `stop_reason` is `max_tokens`; raise `InvalidLabel` for anything outside the set. This is lesson 06's "validate between steps".
3. **Classify with a null path and retry.** Write `classify(message, send, model, max_attempts=3, sleep=time.sleep) -> dict` returning `label`, `needs_review`, `input_tokens`, `output_tokens`. A truncated or invalid answer becomes `label: None` with `needs_review: True` — never a guess. URGENT is always `needs_review: True` (the human gate from lesson 06). Retry `RateLimited` with waits of 1, 2, 4… seconds, re-raising after `max_attempts`.
4. **Batch and cost.** Write `estimate_cost(input_tokens, output_tokens, input_price, output_price)` (prices per million tokens) and `run_batch(src_csv, out_csv, send, model, input_price, output_price) -> dict` writing `ticket_id,label,needs_review` (`true` / `false`) and returning totals.
5. **One real run (optional, needs a key).** Write `http_send(payload)` using `urllib.request` as in lesson 08, with a timeout, converting HTTP 429 into `RateLimited`. Run your 15+ tickets once. Record the token totals and the cost at your provider's current published prices; project monthly cost at 300 tickets a day.
6. **Evaluate.** Hand-label your tickets *before* looking at model output (lesson 07). Report the pass rate, and list every disagreement with a one-line reason. Make one change (add, swap, or reorder one example) and re-run.

## Acceptance criteria

- [ ] `python -m pytest -q` passes with no network access and no API key set.
- [ ] No API key, token, or secret appears anywhere in the submitted files.
- [ ] Few-shot examples cover all three labels, include at least one angry-but-not-blocked and one calm-but-blocked message, and use identical formatting.
- [ ] Truncated and out-of-set answers produce `label` empty and `needs_review` true — never a substituted label.
- [ ] Output CSV has exactly one row per input row, in input order.
- [ ] Cost report shows input tokens, output tokens, and dollars, with the price source and date noted.
- [ ] `DECISION.md` names the adaptation rung (lesson 08 ladder) and the measurement you would take before moving up a rung.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `test_triage.py` next to `triage.py` and run `python -m pytest -q`. The model call is replaced by `FakeSend`, so the suite runs offline and costs nothing.

```python
# test_triage.py -- runs offline; no API key and no network needed.
import csv

import pytest

import triage


def fake_response(text, stop_reason="end_turn", input_tokens=40, output_tokens=2):
    """Build a dict shaped like a Claude API /v1/messages response."""
    return {
        "content": [{"type": "text", "text": text}],
        "stop_reason": stop_reason,
        "usage": {"input_tokens": input_tokens, "output_tokens": output_tokens},
    }


class FakeSend:
    """Stands in for the HTTP call. Returns queued responses or raises queued errors."""

    def __init__(self, *outcomes):
        self.outcomes = list(outcomes)
        self.payloads = []

    def __call__(self, payload):
        self.payloads.append(payload)
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


# --- Milestone 1: the request ------------------------------------------------

def test_payload_has_the_five_fields_and_classification_settings():
    payload = triage.build_payload("Site 2 scanners are offline", model="test-model")
    assert payload["model"] == "test-model"
    assert payload["temperature"] == 0
    assert 1 <= payload["max_tokens"] <= 20
    assert "URGENT" in payload["system"] and "LOW" in payload["system"]
    assert payload["messages"][-1] == {"role": "user", "content": "Site 2 scanners are offline"}


def test_few_shot_examples_alternate_roles_and_cover_every_label():
    payload = triage.build_payload("anything", model="m")
    shots = payload["messages"][:-1]
    assert len(shots) >= 6 and len(shots) % 2 == 0
    assert [m["role"] for m in shots] == ["user", "assistant"] * (len(shots) // 2)
    labels = {m["content"] for m in shots if m["role"] == "assistant"}
    assert labels == {"URGENT", "NORMAL", "LOW"}
    # Lesson 06: do not end on the rarest class -- here, do not end on LOW.
    assert shots[-1]["content"] != "LOW"


# --- Milestone 2: reading the response --------------------------------------

@pytest.mark.parametrize("raw,expected", [("URGENT", "URGENT"), (" normal\n", "NORMAL"), ("Low.", "LOW")])
def test_extract_label_normalizes(raw, expected):
    assert triage.extract_label(fake_response(raw)) == expected


def test_extract_label_rejects_truncated_output():
    with pytest.raises(triage.TruncatedResponse):
        triage.extract_label(fake_response("URG", stop_reason="max_tokens"))


def test_extract_label_rejects_labels_outside_the_set():
    with pytest.raises(triage.InvalidLabel):
        triage.extract_label(fake_response("Sure! This one is urgent."))


# --- Milestone 3: classify with validation and retry -----------------------

def test_urgent_is_flagged_for_human_review():
    result = triage.classify("No one on the night shift can log in.", FakeSend(fake_response("URGENT")), model="m")
    assert result["label"] == "URGENT"
    assert result["needs_review"] is True


def test_normal_is_not_flagged():
    result = triage.classify("Invoice PDF still shows the old logo.", FakeSend(fake_response("NORMAL")), model="m")
    assert result == {"label": "NORMAL", "needs_review": False, "input_tokens": 40, "output_tokens": 2}


def test_invalid_label_becomes_null_and_needs_review():
    result = triage.classify("hmm", FakeSend(fake_response("Probably fine?")), model="m")
    assert result["label"] is None
    assert result["needs_review"] is True


def test_rate_limit_is_retried_with_exponential_backoff():
    waits = []
    send = FakeSend(triage.RateLimited(), triage.RateLimited(), fake_response("LOW"))
    result = triage.classify("Where do I change my notification email?", send, model="m", sleep=waits.append)
    assert result["label"] == "LOW"
    assert waits == [1, 2]
    assert len(send.payloads) == 3


def test_retries_are_capped():
    send = FakeSend(*[triage.RateLimited() for _ in range(10)])
    with pytest.raises(triage.RateLimited):
        triage.classify("x", send, model="m", max_attempts=3, sleep=lambda s: None)
    assert len(send.payloads) == 3


# --- Milestone 4: cost and the batch run ------------------------------------

def test_cost_matches_the_lesson_08_worked_example():
    # 1,200 input + 400 output at $3 / $15 per million tokens = $0.0096
    assert triage.estimate_cost(1200, 400, 3.0, 15.0) == pytest.approx(0.0096)


def test_batch_writes_one_row_per_ticket_and_totals_tokens(tmp_path):
    src = tmp_path / "tickets.csv"
    out = tmp_path / "labelled.csv"
    src.write_text(
        "ticket_id,message\n"
        "T1,Site 2 scanners are offline - nothing is being received\n"
        "T2,quick q - where do I change my notification email?\n"
        "T3,Invoice PDF has our old logo on it\n",
        encoding="utf-8",
    )
    send = FakeSend(fake_response("URGENT"), fake_response("LOW"), fake_response("NORMAL"))
    summary = triage.run_batch(src, out, send, model="m", input_price=3.0, output_price=15.0)

    rows = list(csv.DictReader(out.open(encoding="utf-8")))
    assert [r["ticket_id"] for r in rows] == ["T1", "T2", "T3"]
    assert [r["label"] for r in rows] == ["URGENT", "LOW", "NORMAL"]
    assert [r["needs_review"] for r in rows] == ["true", "false", "false"]
    assert summary["input_tokens"] == 120 and summary["output_tokens"] == 6
    assert summary["cost_usd"] == pytest.approx(triage.estimate_cost(120, 6, 3.0, 15.0))
```

To see the suite fail first (recommended), create an empty `triage.py` and run it: every test should fail with an `AttributeError`. Implement milestone by milestone until the suite is green.

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Request construction | Missing settings or examples sent as one big user message | All five fields set deliberately; few-shot as role pairs covering all labels | Examples chosen to fix measured errors, with a note on why each is there |
| Response handling | Prints or parses the whole object; no truncation check | Label read from the nested field; truncation and invalid labels go to the null path | Logs raw text for every null so failures can be reviewed later |
| Reliability | No retry, or infinite retry | Capped exponential backoff on 429, timeout on the real call | Distinguishes retryable from non-retryable errors (e.g. 401 fails fast) |
| Cost reasoning | No token or cost figures | Totals and per-call cost computed from `usage`; monthly projection | Compares cost with and without the few-shot block, with the quality trade-off measured |
| Evaluation | No hand labels, or labels written after seeing output | Pass rate on 15+ hand-labelled tickets with reasons for each miss | One controlled change re-measured; result reported even if worse |
| Adaptation decision | Recommends fine-tuning without evidence | Places the task on the lesson 08 ladder with a reason | States the volume, accuracy gap, and measurement that would justify the next rung |

## Stretch goals

- Turn the script into a two-step chain: a cheap step that labels, and — only for `needs_review` rows — a second step that extracts `systems_affected` and `people_blocked` as JSON (lesson 06 worked chain), with its own validation and tests.
- Add a `--dry-run` flag that prints the payload and an estimated input token count (characters ÷ 4) without calling anything.
- Measure how much of each call's input tokens the few-shot block accounts for, and what three examples instead of five does to accuracy and cost.

## Reflection prompts

- Which of your tickets did you and the model disagree on, and was the model wrong or was your standard unstated?
- If your test suite passes but the real run labels badly, what does that tell you about what the tests do and do not cover?
- Where in this pipeline would a wrong answer be most expensive, and is your human review gate in that place?

## Instructor notes (common pitfalls, how to adapt for time)

- **Most common bug:** reading `response["content"]` or printing the whole object instead of `content[0]["text"]`. The tests catch it.
- **Second most common:** treating `"Urgent."` or `" urgent\n"` as invalid. Normalization is part of milestone 2; the parametrized test covers it.
- Learners without programming experience can be given the reference function signatures and asked to complete only the bodies; pair-programming milestones 1–2 works well.
- If no learner has an API key, skip milestone 5 entirely; every acceptance criterion except the cost report can be met offline, and the cost report can use the lesson 08 worked numbers.
- For a 3-hour version, do milestones 1–3 only and drop the batch and decision memo.
- The tests deliberately do not check the exact wording of the system prompt or the exact examples, so learners have room to design them.
