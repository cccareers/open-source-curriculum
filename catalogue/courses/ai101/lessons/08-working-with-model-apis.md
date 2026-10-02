---
lesson_id: ai101-08
course_id: ai101
pathway: prompt-engineer
title: Working with Model APIs
order: 8
kind: lesson
competency_ids:
  - D1-S1-C05
objectives:
  - Call a hosted model API from a simple script and describe when fine-tuning
    or a tuned system prompt is the right adaptation
---

## The same model, without the chat window

Everything you have prompted so far went through a chat interface. Underneath, that interface is doing something simple: packaging your message into a web request, sending it to the provider's servers, and rendering what comes back. An **API** — an application programming interface — is that same door, opened directly for your own program.

This matters for four reasons, none of which is that scripts are cooler than chat windows.

**Repetition.** Five hundred tickets is not a thing you paste one at a time.
**Reproducibility.** The API exposes settings the chat window hides — the model version, the temperature, the system prompt — so a run is a thing you can specify exactly and repeat.
**Integration.** The output has to land somewhere: a spreadsheet, a database, another program.
**Measurement.** The response tells you precisely how many tokens you spent. Guessing at cost stops.

You do not need to be a programmer for this lesson. You need to be able to read a short script and change the strings inside it, which is a different and much smaller skill.

## What a request contains

Every provider's chat API takes roughly the same five things. Here is the shape, using the Claude API's `/v1/messages` endpoint:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "<model-id>",
    "max_tokens": 300,
    "temperature": 0,
    "system": "You are a support triage assistant. Reply with one word.",
    "messages": [
      {"role": "user", "content": "The scanners at Site 2 are all offline."}
    ]
  }'
```

Read it field by field, because these five fields are the entire interface and they are the same everywhere:

- **`model`** — which model, by exact identifier. Providers publish these; they change over time, which is why lesson 03 told you to keep the id in one place you can edit.
- **`max_tokens`** — a ceiling on the *response* length. It is a safety valve against runaway output and a cost cap, not a length instruction. Set it too low and your answer gets cut off mid-sentence; ask for brevity in the prompt as well.
- **`temperature`** — exactly the sampling control from lesson 02, now as a number you set rather than a default you inherit.
- **`system`** — the standing instructions from lesson 04, in their own field.
- **`messages`** — the conversation, as an ordered list of objects with a `role` (`user` or `assistant`) and `content`.

That last one is the field that surprises people, so state it plainly: **the API is stateless.** It remembers nothing between calls. A multi-turn conversation exists only because you send the whole history every time:

```json
"messages": [
  {"role": "user", "content": "Summarize this ticket: ..."},
  {"role": "assistant", "content": "Scanners offline at Site 2..."},
  {"role": "user", "content": "Now draft a reply."}
]
```

The chat window has been doing this for you all along. Knowing it explains why long conversations cost more each turn — you are resending everything — and it tells you how to build a chain from lesson 06: each step is its own fresh call, and you decide exactly what history it gets.

The OpenAI API's `/v1/chat/completions` endpoint differs in details — an `Authorization: Bearer` header instead of `x-api-key`, and the system instruction sent as the first entry in `messages` with `"role": "system"` — but the five ideas are identical. Learn the shape once.

## What comes back

A response is JSON. Trimmed to the parts you will actually read:

```json
{
  "id": "msg_01ABC...",
  "role": "assistant",
  "model": "<model-id>",
  "content": [
    {"type": "text", "text": "URGENT"}
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 42,
    "output_tokens": 3
  }
}
```

Three fields deserve attention.

**The text is nested.** It is not at the top level; it is inside a list. In the Claude API it is `content[0].text`; in the OpenAI API it is `choices[0].message.content`. Every beginner's first error is printing the whole object and wondering why it looks like that.

**`stop_reason` tells you why generation ended.** `end_turn` means the model finished naturally. `max_tokens` means **you truncated it** — the answer is incomplete and any parsing you do downstream is operating on a fragment. Check this field. Silent truncation is a genuinely nasty bug, because a cut-off JSON object fails to parse in a way that looks like a model quality problem.

**`usage` is the invoice.** Input tokens and output tokens, counted exactly. This is where cost stops being a guess.

## Keys, and not leaking them

An API key is a credential that bills your account. Treat it like a password with a spending limit attached.

Never paste it into a script you will share, commit it to a repository, or put it in a document. Instead, put it in an environment variable and read it from there:

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

```python
import os
api_key = os.environ["ANTHROPIC_API_KEY"]
```

Keys leak most often through screenshots, pasted code in chat, and files committed to version control by accident. If one leaks, rotate it — revoke the old key and issue a new one — immediately, and check your usage dashboard. Set a spending limit on the account before you write your first script, not after your first surprise.

Two more habits. Use a separate key per project so you can revoke one without breaking everything. And know your organization's rule about what data may leave the building before you send a customer record to a third-party API — that constraint from lesson 03 is not decorative.

## A script you can actually run

Fifteen lines that reads a list of tickets, classifies each, and writes the results to a file:

```python
import json
import os
import urllib.request

API_KEY = os.environ["ANTHROPIC_API_KEY"]
MODEL = "<model-id>"

SYSTEM = (
    "You classify support messages as URGENT, NORMAL, or LOW. "
    "URGENT means the customer cannot do their work. "
    "Reply with the single label word and nothing else."
)

def classify(message: str) -> dict:
    body = json.dumps({
        "model": MODEL,
        "max_tokens": 10,
        "temperature": 0,
        "system": SYSTEM,
        "messages": [{"role": "user", "content": message}],
    }).encode("utf-8")

    request = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "content-type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())

tickets = [
    "No one on the night shift can log in.",
    "Where do I change my notification email?",
    "Invoice PDF still shows the old logo.",
]

total_in = total_out = 0
for ticket in tickets:
    result = classify(ticket)
    label = result["content"][0]["text"].strip()
    total_in += result["usage"]["input_tokens"]
    total_out += result["usage"]["output_tokens"]
    print(f"{label:<7} | {ticket}")

print(f"\ntokens: {total_in} in, {total_out} out")
```

Sample output:

```text
URGENT  | No one on the night shift can log in.
LOW     | Where do I change my notification email?
NORMAL  | Invoice PDF still shows the old logo.

tokens: 186 in, 9 out
```

Notice what carried over from earlier lessons. `temperature` is `0` because this is classification. The system prompt is the role and constraints block. `Reply with the single label word and nothing else` is the same anti-padding instruction from lesson 04, and here it is load-bearing: `max_tokens` is 10, so a chatty model would be truncated.

Notice also what the script does not do. There is no retry, no timeout handling, and no validation that the label is one of the three allowed words. Those are the next three things you would add, and the third is the between-step validation from lesson 06.

## Cost and latency, concretely

Providers bill per token, with **input and output priced separately and output typically several times more expensive**. Published prices are usually quoted per million tokens and change often, so treat any number you see — including the illustrative ones here — as something to look up rather than memorize.

The calculation you should be able to do from memory:

```text
cost per call = (input_tokens  / 1,000,000) x input_price
              + (output_tokens / 1,000,000) x output_price

monthly cost  = cost per call x calls per month
```

Worked, with illustrative prices of $3 per million input tokens and $15 per million output:

```text
Per call:  1,200 input + 400 output
           (1200 / 1e6) x 3   = $0.0036
           (400  / 1e6) x 15  = $0.0060
           total                $0.0096  - about one cent

At 200 calls/day:  ~$1.92/day    ~$58/month
At 20,000/day:     ~$192/day     ~$5,760/month
```

Same prompt, same penny, two completely different conversations with whoever approves budgets. **Always multiply by volume before forming an opinion.**

Four levers, in the order worth trying:

1. **Cut input tokens.** Long system prompts and pasted examples are paid for on every call. A few-shot block that is not earning its accuracy is pure recurring cost.
2. **Cut output tokens.** They are the expensive side. `Reply with the label only` is a cost optimization as much as a formatting one.
3. **Drop a capability tier** for the mechanical steps of a chain, then re-run your test set from lesson 07 to confirm quality actually held.
4. **Use a batch endpoint** where the provider offers one. Work you can wait hours for is often meaningfully cheaper.

Latency behaves differently. Response time scales mostly with *output* length, since tokens are generated one at a time — a 2,000-token answer takes many times longer than a 50-token one, largely regardless of input size. If a person is waiting, **streaming** (receiving tokens as they are produced) does not reduce total time but transforms the experience, because reading starts immediately. For batch work, latency barely matters; run requests concurrently and go and do something else.

Two operational realities to plan for: providers enforce **rate limits** and will reject requests with an HTTP 429 when you exceed them, and any network call can fail transiently. The standard response to both is retry with exponential backoff — wait one second, then two, then four — with a cap on attempts. Every provider SDK has this built in, which is a decent argument for using one.

## When to fine-tune, and when not to

**Fine-tuning** means taking an existing model and continuing its training on your own examples, producing a private variant whose default behavior has shifted toward your data. It is a real technique with a narrow, specific set of jobs — and the most common mistake in the field is reaching for it to solve a problem it does not touch.

Start with the honest ladder of adaptations, cheapest first:

1. **A better prompt.** Blocks, constraints, escape hatches. Free, instant, reversible.
2. **A tuned system prompt.** The same, but promoted to a standing, versioned instruction shared across every call in a product. This is the step most teams skip, and it solves an astonishing proportion of "we need to fine-tune" problems. It is editable in seconds, testable against your evaluation set, and costs nothing but the tokens.
3. **Few-shot examples.** Demonstration for tacit standards. Costs tokens on every call.
4. **A chain.** Decomposition for tasks one call does badly.
5. **Retrieval** — fetching your own documents and putting them in the context at request time. This is the answer for anything involving *your* facts, and it is what people usually mean when they wrongly say fine-tuning.
6. **Fine-tuning.** Last, and only for the right shape of problem.

What fine-tuning is genuinely good at:

- **Style, format, and tone at volume**, where the standard is tacit and your few-shot block has grown large. Baking those examples into the weights removes them from every prompt, which cuts both cost and latency.
- **Consistency on a narrow, repetitive task** — the same classification or transformation, thousands of times, where you have plenty of labeled history.
- **Moving down a tier.** Sometimes a fine-tuned small model matches a large model on one specific task at a fraction of the price. This is the strongest economic case.

What fine-tuning does **not** do, and this is the part to remember:

- **It does not add knowledge reliably.** Facts trained in this way surface inconsistently and cannot be updated without retraining. Your policies, prices, and records belong in the context window via retrieval, not in the weights.
- **It does not fix hallucination.** A model tuned on your data will fabricate in your house style.
- **It does not rescue a task the base model cannot do at all.** Tuning shifts defaults; it does not confer a missing capability.
- **It does not remove the need for evaluation.** You still need the test set from lesson 07 — now you need it more, because you have a second thing that can regress.

The costs are real: hundreds to thousands of *clean, consistent* labeled examples, the training run itself, and — the one people forget — **ongoing maintenance**, because when the provider releases a better base model, your tuned variant does not automatically inherit the improvement. You are choosing to own something.

So the decision rule is short. **Fine-tune when the task is narrow and high-volume, the standard is tacit rather than statable, prompting has genuinely plateaued against a measured evaluation set, and the economics of moving to a smaller model justify the maintenance.** Everything else — and it is most things — is a prompt, a system prompt, a chain, or retrieval.

## Practice

You need an API key with a spending limit set. If you cannot get one, complete exercises 3 and 4 and do 1 and 2 on paper against the request and response shapes above.

1. **Make one call and read the whole response.** Using curl or the Python script above, send a single request and print the entire JSON object. Identify by name: where the text lives, the stop reason, the input token count, and the output token count. Then set `max_tokens` to `5`, re-run a request that needs a longer answer, and record what `stop_reason` becomes.

2. **Automate a prompt you already trust.** Take a working prompt from lesson 04 or 05 and run it over at least ten real inputs from a file, writing the results out. Set temperature deliberately and say why you chose it. Report the total input and output tokens, then compute cost per call and projected monthly cost at 100, 5,000, and 50,000 calls per day using your provider's current published prices.

3. **Cut the cost in half.** Take the run from exercise 2 and reduce total token spend by at least 40% without losing quality. Use at least two of the four levers. Verify quality with your evaluation set from lesson 07 and report the before-and-after pass rate alongside the before-and-after token counts. If quality dropped, say so and say which lever caused it.

4. **Write the adaptation decision.** For each scenario, name the rung of the ladder you would choose and defend it in three sentences, including the one measurement you would take first. (a) Support replies must always follow a house voice nobody has successfully written down, across 30,000 messages a month. (b) The assistant must answer questions about a policy handbook that changes monthly. (c) Outputs are correct but too long and inconsistently formatted. (d) A cheap model classifies 200,000 documents a day at 84% accuracy against your test set, and you need 95%.
