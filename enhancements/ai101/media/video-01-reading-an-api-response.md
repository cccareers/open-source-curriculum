---
course_id: ai101
media_id: ai101-v01
type: video-script
title: "One Request, One Response: Reading What the API Sends Back"
format: screencast
target_runtime: "7 min"
related_lessons:
  - ai101-08
  - ai101-02
objectives:
  - Call a hosted model API from a simple script and describe when fine-tuning or a tuned system prompt is the right adaptation
competency_ids:
  - D1-S1-C05
---

## Purpose

After watching, the learner can send one request to a hosted model API, find the generated text inside the nested response, read `stop_reason` and `usage`, recognize a truncated answer, and turn the token counts into a cost estimate.

## Audience and prerequisites

Prompt Engineer apprentices who have finished lessons 02–07 and are starting lesson 08. No programming experience assumed; they need a terminal and an API key with a spending limit (or they can follow along without running anything). The script uses the Claude API request shape shown in lesson 08; a closing segment shows where the OpenAI chat completions shape differs.

**Production note:** the model identifier is shown as `<model-id>` on screen and in narration, exactly as in the lesson. Before recording, the producer substitutes a current model id from the provider's documentation and checks that the header version and field names below still match current docs (see `review.md`, Open questions). Token counts in the script are illustrative; re-record the overlay numbers from the real run.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Cold open: split screen. Left, a chat window with "The scanners at Site 2 are all offline." and the reply "URGENT". Right, an empty terminal. | "Everything you've done in this course so far went through a chat window. Underneath, that window is just sending a web request and drawing the reply on the screen. In the next seven minutes we're going to send that same request ourselves — and read every part of what comes back." |
| 0:20 | Title card: "One request, one response." Lesson 08 badge. | "This is the skill that turns a prompt you trust into something you can run five hundred times." |
| 0:30 | Terminal. Type slowly: `export ANTHROPIC_API_KEY="..."` — the key itself is blurred and the shell history is cleared after. Caption: "Never paste a real key on screen." | "First, the key. It's a password that bills your account, so it lives in an environment variable, not in the script and never in a screenshot. Notice I've blurred mine. Before you do anything else, set a spending limit in your provider's console." |
| 0:55 | Editor showing `request.sh`: the curl command from lesson 08 with `"max_tokens": 300`, `"temperature": 0`, the triage system prompt, and the single Site 2 user message. Each field highlights as it is named. | "Here's the whole request. Five fields matter. `model` — which model, by its exact id; that changes over time, so keep it in one place. `max_tokens` — a ceiling on the reply length, not a length instruction. `temperature` — the same dial from lesson 02, set to zero because this is classification. `system` — our standing instructions, the role and constraints blocks from lesson 04. And `messages` — the conversation, as a list of turns, each with a role and content." |
| 1:40 | Zoom on `messages`. Animate a second and third turn sliding in, then sliding out. Caption: "The API is stateless." | "One thing surprises everybody. The API remembers nothing between calls. If you want a second turn, you send the first turn again along with it. The chat window has been doing that for you all along — which is why long chats cost more each turn." |
| 2:05 | Run the curl command. Raw JSON prints on one line. Pause. Then pipe through a pretty-printer so it reformats. | "Let's send it. That wall of text is the response. Let's make it readable." |
| 2:20 | Pretty-printed response from lesson 08: `id`, `role`, `model`, `content: [{"type": "text", "text": "URGENT"}]`, `stop_reason: "end_turn"`, `usage: {input_tokens: 42, output_tokens: 3}`. A highlight box draws around `content`. | "The answer is not at the top. It's inside `content`, which is a list, and the first item in that list has a `text` field. So the path to the word URGENT is content, zero, text. If you've ever printed a whole response and wondered why it looks like a filing cabinet, this is why." |
| 2:50 | Highlight `stop_reason: "end_turn"`. Caption: "end_turn = finished naturally". | "Next: `stop_reason`. `end_turn` means the model reached its own end-of-turn signal — the healthy ending from lesson 02. Check this field every time, and in a minute you'll see why." |
| 3:05 | Highlight `usage`. Overlay: "42 in · 3 out". | "And `usage` — the invoice. Forty-two input tokens, three output tokens, counted exactly. This is where cost stops being a guess." |
| 3:20 | Back in the editor. Change the user message to "Explain in detail why scanners at a warehouse site might go offline." and change `max_tokens` to `5`. | "Now let's break it on purpose. I'll ask a question that needs a long answer, and give it room for only five tokens." |
| 3:35 | Run. Response shows a text fragment such as "Scanners at a warehouse" and `stop_reason: "max_tokens"`. Red outline around both. | "Look at the text — it just stops. And look at `stop_reason`: `max_tokens`. That means *we* cut it off. The model didn't lose the thread; we hit the ceiling. If that fragment were half a JSON object, your next step would fail to parse it, and you'd probably blame the model. The fix is a higher cap or a shorter request, not a new prompt." |
| 4:10 | Side-by-side: truncated response vs. the lesson 02 slide "Where the loop stops". | "This is the second ending from lesson 02 — a length cap — and this field is how you tell it apart from the first." |
| 4:25 | Calculator overlay. Type: `42 / 1,000,000 × 3 = 0.000126` and `3 / 1,000,000 × 15 = 0.000045`. Total `$0.000171`. Caption: "Illustrative prices: $3 / $15 per million tokens. Look up current prices." | "Now the arithmetic. Using the lesson's illustrative prices — three dollars per million input tokens, fifteen per million output — this call cost about seventeen thousandths of a cent. That sounds like nothing." |
| 4:55 | Overlay: `× 20,000 calls/day × 30 days`. Result about `$103/month`. | "Multiply by volume before you form an opinion. Twenty thousand of these a day is roughly a hundred dollars a month. Change the prompt so each call carries a thousand more input tokens of examples, and that number moves a lot. The `usage` block is how you find out." |
| 5:20 | Editor: the lesson 08 Python script. Highlight `result["content"][0]["text"]`, the `usage` lines, and the absence of any `stop_reason` check. Add, live, three lines: `if result["stop_reason"] == "max_tokens": label = None`. | "Here's the same thing in the lesson's Python script. It reads the text from the right place and adds up the tokens. What it doesn't do yet is check `stop_reason`. Three lines fixes that: if the reply was truncated, don't trust the label — mark it for a person." |
| 5:50 | Split screen comparing the two provider shapes. Left: Claude API — `x-api-key` header, `system` field, `content[0].text`, `stop_reason`. Right: OpenAI chat completions — `Authorization: Bearer` header, system as first message with role `system`, `choices[0].message.content`, `finish_reason` (`stop` / `length`). | "If you use a different provider, the ideas are identical and the names move. For the OpenAI chat completions endpoint: the key goes in an Authorization header, the system prompt is the first message, the text lives at choices, zero, message, content, and the field that tells you about truncation is `finish_reason`, where `length` means you hit the cap. Learn the shape once." |
| 6:25 | Recap card with four bullets: "Text is nested · stop_reason tells you why it ended · usage is the invoice · the API is stateless". | "Four things to take away. The text is nested. `stop_reason` tells you whether you got the whole answer. `usage` is your invoice. And the API remembers nothing you don't send it." |
| 6:45 | End card: "Next: lesson 08 practice 1 — make one call and read the whole response." | "Now do it yourself: lesson 08, practice one. Print the whole response, find those four things by name, then set `max_tokens` to five and watch the stop reason change." |

## On-screen assets and B-roll

- Terminal and editor recordings at 1920×1080, font size 20+ for code, a high-contrast theme.
- `request.sh` (the lesson 08 curl command with `<model-id>` replaced at record time) and `classify.py` (the lesson 08 script).
- A JSON pretty-printer step (for example `python3 -m json.tool`) so learners see the formatted response.
- Highlight boxes and callout labels for `content`, `stop_reason`, `usage`.
- Calculator overlay graphic for the cost segment, with the "illustrative prices" caption visible the whole time it is on screen.
- Two-column comparison graphic for the provider differences.
- Blur mask for the API key and any account identifiers in the console.

## Accessibility

- Burned-in optional captions plus a separate caption file; all code shown on screen is also read aloud or provided as a downloadable text file.
- Highlight boxes use both color and a thick dashed outline with a text label ("TEXT", "STOP REASON", "USAGE"), so meaning does not depend on color.
- The truncation moment is described in narration ("the text just stops"), not only shown in red.
- Keystrokes are typed at a readable pace and every command is visible on screen for at least three seconds after it runs.
- No flashing transitions; zooms are slow (≥ 400 ms).

## Check for understanding

1. **A response comes back with `stop_reason: "max_tokens"` and your JSON parser throws an error. What happened, and what is your first fix?**
   Answer: the output hit the `max_tokens` ceiling and was cut off mid-object, so it is not valid JSON. Raise `max_tokens` (or ask for a shorter output) and add a check that treats truncated responses as failures rather than parsing them. Rewriting the prompt is not the first fix.
2. **You send a second request containing only "Now draft a reply." and the model has no idea what ticket you mean. Why?**
   Answer: the API is stateless. Each call contains only what you send; to continue a conversation you must resend the earlier turns in `messages`.
3. **A call uses 1,200 input and 400 output tokens. At illustrative prices of $3 and $15 per million, what does it cost, and what is the monthly cost at 200 calls a day?**
   Answer: $0.0036 + $0.0060 = $0.0096 per call; about $1.92 a day, roughly $58 a month (the lesson 08 worked example).
