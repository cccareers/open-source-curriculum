---
course_id: db305
media_id: db305-v02
type: video-script
title: "The Gate Code That Wasn't There: Eight Checks on Model Output"
format: screencast
target_runtime: "7 min"
related_lessons:
  - db305-06
  - db305-02
objectives:
  - Apply validation, transformation, and storage practices that keep workflow data trustworthy
competency_ids:
  - D5-S1-C03
---

## Purpose
After watching, the learner can implement the eight model-output checks in order, retry once with the named error, and quarantine with the raw text when the retry fails.

## Audience and prerequisites
Apprentices who have written the extraction contract in db305-02. Watch before practice step 4 in db305-06.

## Script
| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Order note on screen: "Driver must call ahead. Gate code 4417. Tail lift needed, deliver 08:00-12:00." Beside it, a model reply with `"access_code": "4471"`, `"confidence": 0.93`. | "Here's a delivery note and the model's extraction. It looks perfect. Valid JSON, every key present, confidence point nine three. And the gate code is wrong. Four four seven one, not four four one seven. A driver is going to stand at a locked gate." |
| 0:30 | Text card: "A wrong answer arrives looking exactly like a right one." | "That's why model output is the boundary that needs validation most, and why it gets it least. We'll build eight checks, in order, and stop at the first failure." |
| 0:50 | Editor: `validate_extraction(text, note)` skeleton; checks 1–2: empty, then strip ```` ```json ```` fence and `json.loads`. | "Check one: a response exists. Check two: it parses. Models sometimes wrap JSON in a code fence, so strip that first, then parse. If parsing fails, that's a named failure: parse." |
| 1:20 | Checks 3–4: required keys from the contract; types: `confidence` must be a number, not the string "0.82"; times match `HH:MM`. | "Three: every required key from the contract is present. Four: every value has the declared type. A confidence of the string zero point eight two is a type failure." |
| 1:50 | Check 5: `if d["special_equipment"] not in {"tail_lift", "forklift", "none", None}: raise ExtractionError("vocabulary")`. Test case with `"Tail Lift"`. | "Five is the one that earns its keep: closed vocabulary. Tail lift with capitals and a space is not tail_lift. Don't normalise it away. If the model has started returning a different spelling, your prompt is drifting, and you want to know." |
| 2:25 | Check 6 and 7: `0 <= confidence <= 1`; `earliest_time <= latest_time`. | "Six: ranges. Confidence between zero and one. Seven: cross-field rules. The earliest delivery time can't be after the latest." |
| 2:45 | Check 8: `if d["access_code"] is not None and d["access_code"] not in note: raise ExtractionError("grounding")`. Run on the 4471 reply → `grounding`. | "And eight: grounding. The contract says the access code is copied exactly. So it must appear in the note as a substring. Four four seven one doesn't. Caught. This one check catches a large share of confident fabrication and it costs nothing." |
| 3:20 | Terminal: `python -m pytest -q -k each_check` → 8 parametrized tests pass, names shown: empty, parse, required, type, vocabulary, range, cross_field, grounding. | "Each check fails with its own name. That matters for what happens next." |
| 3:40 | Editor: `process_note`: first call; on `ExtractionError`, second call with prompt + "Your previous reply failed check 'grounding'. Return only valid JSON." | "On failure, retry once, with the specific error appended. Models are good at fixing a named problem." |
| 4:05 | Editor: after second failure, `insert into quarantine (order_id, error, raw_model_text)`. | "If the retry fails too, quarantine. Keep the raw model text: it's the evidence you need to fix the prompt. Never discard silently. Nobody files a ticket about the order that never arrived." |
| 4:30 | Editor: `ai_run_log` insert with `attempts`, `validation_result`, `prompt_version`, `model_version`, tokens. | "Record the outcome every time: validated_ok, validated_after_retry, or quarantined. The ratio between those three, over time, is your early warning that something upstream changed." |
| 5:00 | SQL: `select validation_result, count(*) from ai_run_log where prompt_version = 'extract-notes-v4' group by 1;` → ok 912, after_retry 61, quarantined 27. | "Here's a week of runs. About six percent needed a retry and under three percent were quarantined. If next week after_retry doubles with no change on our side, the vendor probably changed something." |
| 5:30 | Split: same note, stored row in `order_notes` with `extracted` JSON and `updated_at`. Run twice → `count(*) = 1`. | "Successes are upserted on the order id, so a re-run gives one row, not two." |
| 5:50 | Checklist slide of the eight checks. | "Exists, parses, required keys, types, vocabulary, ranges, cross-field, grounding. Retry once with the named error. Quarantine with the raw text. Log every run." |
| 6:20 | End card: "Project db305-x02". | "The project for this lesson gives you a 21-test suite. Make it pass, then run twenty of your own notes through it." |

## On-screen assets and B-roll
- `pipeline.py` and `tests/test_pipeline.py` from project db305-x02.
- The extraction contract from db305-02 as an overlay.
- Sample `ai_run_log` data (synthetic; label on screen as "illustrative numbers").

## Accessibility
- Captions; transcript including code.
- The 4471/4417 difference is read aloud digit by digit and shown with the differing digits underlined, not only colored.
- Font at least 18 pt.

## Check for understanding
1. The model returns `"special_equipment": "Forklift"`. Which check fails, and should you lowercase it? *Answer: vocabulary (check 5). Do not normalise; a changed spelling is a signal the prompt is drifting.*
2. Why keep the raw model text in quarantine? *Answer: it is the evidence needed to diagnose and fix the prompt.*
3. Which check catches an invented access code, and how? *Answer: grounding (check 8): a verbatim field must appear as a substring of the source note.*
