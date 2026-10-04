---
course_id: ai102
media_id: ai102-v02
type: video-script
title: "From Chat Prompt to Workflow Function: The Two Contracts"
format: hybrid
target_runtime: "7 min"
related_lessons:
  - ai102-08
  - ai102-07
objectives:
  - Embed a prompt inside an automation step so the model receives clean input and returns output the next step can consume
competency_ids:
  - D2-S1-C02
  - D1-S1-C02
---

## Purpose

After watching, the learner can write an input contract and an output contract for an AI step before writing any prompt prose, and can name the guards that stop a bad model output from reaching the database.

## Audience and prerequisites

Apprentices who have finished ai101 (structured prompting) and ai102 lessons 03-07. They've built the Northgate intake automation and a router, but haven't yet put a model inside it.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then a split screen. Left: a chat window where a user types "shorter please" after a long answer. Right: a workflow diagram, trigger -> AI step -> router, with no person in it. | "In a chat window, you're the quality control. If the answer's too long, you say shorter. If it's in the wrong format, you ask again. Put that same prompt inside an automation and you've gone. It runs four hundred times this month on inputs you've never seen, and the next step reads the output without anyone checking it first." |
| 0:30 | Title card. | "From chat prompt to workflow function: the two contracts." |
| 0:38 | Diagram: the AI step drawn as a box with an arrow in labelled "input contract" and an arrow out labelled "output contract". | "Inside a workflow, a model call is a function. It has an input contract, which says exactly what it receives, and an output contract, which says exactly what it has to return. Write both of those before you write a word of the prompt, and the prompt nearly writes itself." |
| 1:00 | Screen: a raw email body with HTML tags, a quoted reply chain starting "On Tue, ... wrote:", a three-line signature including "Head of Complaints", and a legal footer. Each part is struck through in turn. | "Start with input. Here's what actually arrives from the inbox: HTML, a quoted reply chain, a signature block, and a legal footer. The model will read every word of that. A signature that says Head of Complaints can push a classifier towards complaint. So clean it up before you send it. Strip the markup, cut the reply chain at the first 'On ... wrote' line, and drop the footers you already know about." |
| 1:35 | Checklist builds on screen: "Clean markup", "Truncate to a budget + flag", "Missing field -> filter out or [not provided]", "Untrusted text inside delimiters", "Normalise formats". | "Then four more things. Truncate to a character budget, set a flag when you do, and tell the model the text might be cut short. If a field's missing, either filter the run out or send an explicit 'not provided'. Never send an empty string after 'Summarise the following'. Put customer text inside clear delimiters and label it as data, not instructions. And normalise dates and names wherever you can." |
| 2:15 | The cleaned payload JSON from lesson 08 (`ticket_id: REQ-2026-0184`, `body_truncated: false`) appears. | "Here's the result. Every field the model needs, nothing it doesn't, with names and types you chose. That's your input contract made concrete." |
| 2:35 | Screen: a model response starting "Sure! Here's a summary of that request:" with a router filter below it set to `category = complaint`, showing a red "no match". | "Now output. If the next step is a router, prose is a problem. Routers match exact strings. The day the model opens with 'Certainly!' instead of 'Sure!', your text-parsing filter quietly stops matching, and nothing in the run errors." |
| 2:55 | The lesson 08 output JSON appears; four callouts animate onto `category`, `confidence`, `needs_human`, and the key names. | "So pin the shape down. JSON, a fixed set of keys. Branch values come from a closed list, with an escape value of 'other', so 'not on the list' is a legal answer and not something the model invents. A confidence number and a needs_human flag, so uncertain cases go to a person. No key the workflow won't use, because every key costs tokens and gives the model another chance to be wrong. And name the keys to match your database fields." |
| 3:40 | The six-part prompt skeleton from lesson 08 scrolls slowly, with each heading (SYSTEM, TASK, DATA, OUTPUT FORMAT, RULES, EXAMPLES) highlighted as it's named. | "With both contracts written, the prompt is six parts in a fixed order: role, task, delimited data, output format, rules, and a few examples picked to cover the edge cases. Look at how much of it is about boundaries rather than wording: what comes in, what goes out, and what happens at the edges." |
| 4:15 | Diagram: AI step -> "Parse (error path)" -> "Validate" -> router. Three bad outputs drop into the pipeline in turn: (1) text wrapped in a code fence, (2) `"category": "refund"`, (3) `confidence: 0.4, needs_human: false`. Each is caught at a labelled gate and diverted to an "Exceptions / reviewer queue" box. | "Then assume the model will break the contract sometimes, and put guards in front of your database. First, turn on the platform's structured-output or JSON mode if it has one. Second, strip any code fence and parse on an error path, so bad JSON lands in Exceptions and doesn't crash the run. Third, validate with ordinary workflow conditions. Is the category in my list? Is the confidence between zero and one? If the confidence is under my threshold, force needs_human to true. Anything that fails goes to a human. None of it gets written into your Requests table." |
| 5:10 | Callout: "Max output length". Show a JSON object cut off mid-string with an ellipsis, then a parse error. | "One setting people get wrong is maximum output length. Set it, because it caps a runaway cost. But if the model hits the cap, the answer just gets cut off, possibly halfway through the JSON. The only reason you'll hear about it is that your parse step fails, which is one more reason the parse step needs an error path." |
| 5:35 | Terminal: `node score.mjs data/eval-set.json data/outputs.json`. Output lists E01 ok, E02 ok, E03 unparseable, E04 ok, E05 contract_violation low_confidence_not_escalated, then the summary block. | "Finally, you can't test an AI step by trying it twice. This is the checker from project x02 running on five sample cases. Case three came back as prose wrapped around JSON. Case five is an injection attempt, and the model went along with it: it classified the message as billing and didn't escalate. The contract check caught it anyway, because low confidence without escalation breaks the rules." |
| 6:15 | Screen: a two-row table comparing "before" and "after" with category accuracy, unparseable count, and cost per 1,000 runs. Values are shown as `__` placeholders. | "Build twenty or more labelled cases, write the expected answers before you run anything, and re-run the whole set every time you change the prompt or the model. Change one thing at a time. Then the before-and-after numbers tell you whether the change actually helped, and what it costs." |
| 6:45 | Recap card: "Input contract. Output contract. Guards before the database. An eval set you re-run." | "Input contract. Output contract. Guards in front of the database. And an evaluation set you actually re-run. That's the step from a prompt that works in chat to a prompt you can depend on in a workflow." |

## On-screen assets and B-roll

- The lesson 08 cleaned payload, output JSON, and six-part triage prompt, typeset in a monospace font at 18 pt or larger.
- A synthetic messy email (no real names beyond the course's fictional Northgate/Dana Okafor).
- Pipeline diagram with three gates (structured mode, parse, validate).
- Terminal recording from the ai102-x02 harness.
- Avoid naming specific model versions or showing a vendor's model picker; both change often. Refer to "a smaller model tier" and "the platform's structured-output mode".

## Accessibility

- Captions burned in, plus a transcript (narration above).
- Strikethrough edits in the email segment are also spoken ("we cut the reply chain"), and use a strikethrough line, not colour alone.
- Pipeline gates are labelled with words ("Parse", "Validate"). Diverted items show a downward arrow plus the label "to Exceptions".
- Terminal output is held for at least 3 seconds, and each result word ("ok", "unparseable") is read aloud.

## Check for understanding

1. Why does an AI step whose output feeds a router need enumerated values with an explicit `other`? *Answer: routers match exact strings. Without a closed list, a new phrasing is an unhandled case. `other` makes "doesn't fit" a legal, routable answer, not an invented category.*
2. The model returns `{"category":"billing", ..., "confidence":0.55, "needs_human":false}` and your threshold is 0.7. What should the workflow do? *Answer: treat it as a validation failure. Force or route it to human review and don't trust `needs_human: false` from the model.*
3. You set maximum output length to 50 tokens and the JSON needs about 120. What happens, and how will you know? *Answer: the output is cut off mid-JSON. You only find out because the parse step fails, so it must sit on an error path that records an exception.*
