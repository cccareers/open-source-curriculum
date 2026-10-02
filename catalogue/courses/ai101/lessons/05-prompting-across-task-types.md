---
lesson_id: ai101-05
course_id: ai101
pathway: prompt-engineer
title: Prompting Across Task Types
order: 5
kind: lesson
competency_ids:
  - D1-S1-C02
objectives:
  - Adapt prompting technique to the task type, including text generation,
    summarization, extraction, and image creation
---

## The skeleton stays, the emphasis moves

You now have a five-block prompt skeleton. This lesson is about the fact that different jobs load those blocks differently. For a summary, the constraint block carries the weight. For an extraction, the format block does. For an image, the context block turns into a description of a scene rather than a document. Same structure, different center of gravity.

Getting this wrong is the most common intermediate mistake: writing every prompt like a drafting prompt, then wondering why the extraction came back as a friendly paragraph.

Five task families cover the great majority of real work — **generation, summarization, extraction, transformation, and image creation** — and each one has a characteristic failure you can design against in advance.

## Generation: producing text that did not exist

You want a draft. The model has to supply the words; you have to supply everything that makes them yours.

The characteristic failure is **genericness**. Ask for "a job description for a warehouse supervisor" and you get a job description for every warehouse supervisor, which is to say nobody's. Generic output is almost never a model problem. It is a context problem, and the fix is specificity in three places: audience, source material, and what makes this instance different.

Weak:

```text
Write a job posting for a warehouse shift supervisor.
```

Improved:

```text
You are writing a job posting for a family-owned distribution company
with 40 staff across three sites. The reader is likely already working
in a warehouse and considering a step up.

Write a posting for a shift supervisor role.

Facts to use, and use only these:
- Reports to the site manager; supervises 8-12 staff per shift
- Rotating shifts including one weekend in three
- Required: two years warehouse experience, forklift certification
- Offered: paid certification renewal, and internal promotion is the
  normal path to site manager here

Constraints:
- 200-250 words
- Second person, plain language, no corporate cliches
- Do not state a salary figure; write "salary discussed at interview"
- Do not add any requirement not listed above

Format: one short opening paragraph, then "What you'll do",
"What you need", and "What we offer" as bulleted sections.
```

Sample output, opening only:

```text
If you're already running a warehouse floor and waiting for someone to
hand you the shift, this is that job. You'd supervise 8 to 12 people per
shift at one of our three sites, reporting to the site manager - and
most of our site managers started exactly where you're standing.
```

The instruction that does the most work is `use only these` facts, because it converts an invention task into a transformation task, which is where models are strongest.

Two more generation levers worth knowing. **Ask for options, not an answer** — `give me six openings, each taking a different angle, one line each` — because picking from six is faster than editing one and you can then say "expand number four". And **anchor the voice** by pasting two or three paragraphs of writing you want the output to sound like, labeled as a voice sample rather than as content.

## Summarization: shrinking text you supplied

Three questions determine everything: **for whom, how long, and what must survive.** Omit any of them and the model picks, usually badly.

The characteristic failure is **losing the thing that mattered**. A summary that is a fair proportional shrinking of a document is often useless, because the reader does not need proportion — they need the decision, the risk, or the number.

Weak:

```text
Summarize this.
```

Improved:

```text
Summarize the text between the <<<DOC>>> markers for a site manager who
must decide today whether to pause the rollout.

Requirements:
- Lead with the recommendation the document supports, if any
- Include every date and every dollar figure that appears
- Maximum 100 words
- If the document does not support a clear recommendation, say so in
  the first line rather than manufacturing one
- Use only information from the document; add nothing

<<<DOC>>>
[paste here]
<<<DOC>>>
```

Two variants worth having in your pocket:

**Extractive rather than abstractive.** `Return the five sentences from the document that best capture it, quoted exactly and in document order, with nothing added.` Because every word is copied, fabrication is nearly impossible and you can verify with a find-in-page. Excellent when accuracy beats readability.

**Layered.** `Give a one-sentence version, then a five-bullet version, then a 200-word version.` Readers self-select their depth, and you can see at a glance whether the one-sentence version is the thing you would have said — a fast quality signal.

For documents too large for the context window, the move is to summarize sections and then summarize the summaries. That is a chain, and lesson 06 builds it properly.

## Extraction: pulling structure out of prose

Here the format block is the whole game. You are not asking for writing; you are asking for data, and data has a shape you must specify exactly.

The characteristic failures are **shape drift** (a field appears one run and not the next), **invented values** for fields the source never mentioned, and **conversational padding** wrapped around the payload.

All three are preventable in the prompt. Specify the schema, name every field, state the type, state the null value, and forbid the padding:

```text
Extract order details from the text between the <<<TEXT>>> markers.

Return a single JSON object with exactly these keys, in this order:
- order_id: string
- customer_name: string
- order_date: string in YYYY-MM-DD format
- total_amount: number, no currency symbol
- currency: three-letter code
- items: array of objects, each with "name" (string) and
  "quantity" (integer)

Rules:
- If a value is not stated in the text, use null. Never guess or infer.
- Include every key even when the value is null.
- Return the JSON only. No markdown fences, no commentary.

<<<TEXT>>>
Hi - following up on order A-9931 for Dana Whitfield placed on
March 4th. That's 12 of the blue crates and 3 pallet jacks, comes to
1,847.50 all in.
<<<TEXT>>>
```

Sample output:

```text
{"order_id":"A-9931","customer_name":"Dana Whitfield","order_date":null,
"total_amount":1847.50,"currency":null,"items":[{"name":"blue crates",
"quantity":12},{"name":"pallet jacks","quantity":3}]}
```

Look at the two nulls, because they are the point. The text says "March 4th" with no year, and names no currency. A model without the `never guess` rule will cheerfully supply the current year and `USD`, and you will not notice, because both look right. The nulls are the prompt working.

Set temperature at or near `0` for extraction. You want the same input to produce the same object every time, and there is no creativity to be had here.

JSON is not the only choice. When the destination is a spreadsheet, ask for a markdown table or comma-separated rows with a stated header — a table is easier for a human to eyeball and paste, and easier to spot a missing column in. When the destination is another program, JSON wins, because a missing field is detectable rather than merely invisible.

Whichever you pick, **check the shape before you trust the contents**. Count the keys, or count the columns. An extraction that silently dropped a field will otherwise look completely normal right up until something downstream reads the wrong value out of the wrong position, and that failure is much harder to trace than an obvious refusal.

## Transformation: same content, different form

Rewriting for tone, changing reading level, translating, converting a format, expanding notes into prose, collapsing prose into a checklist. This is the highest-reliability family, because the content already exists and the output is checkable against the input by reading.

The characteristic failure is **silent content change** — a rewrite that improves the sentence and quietly drops a qualifier, softens a commitment, or turns "up to three days" into "three days". So the useful constraint is a preservation clause:

```text
Rewrite the paragraph below at a sixth-grade reading level.

Preserve every number, date, name, and conditional word ("may", "up to",
"if") exactly as written. If a sentence cannot be simplified without
changing its meaning, leave it as it is and mark it with [KEPT].
```

The `[KEPT]` marker is a small trick with a big payoff: it makes the model's difficulty visible instead of letting it resolve the difficulty by changing your meaning.

## Image creation: describing instead of instructing

Image models are prompted differently. They do not follow instructions the way a chat model does; they respond to **description**. "Make it look professional" gives them almost nothing. A described scene gives them everything.

Six components, roughly in order of impact:

1. **Subject** — what is in the frame, and what it is doing
2. **Setting** — where, and what is around it
3. **Composition** — shot distance, angle, what fills the frame
4. **Lighting** — source, direction, quality, time of day
5. **Style** — photograph, illustration, diagram, and in what manner
6. **Technical** — aspect ratio, orientation, and anything the tool exposes

Weak:

```text
A nice picture of a warehouse worker for our careers page.
```

Improved:

```text
Photograph of a warehouse supervisor in a high-visibility vest standing
at the end of a wide aisle of steel shelving, holding a tablet and
looking off-frame toward the loading bay. Mid-shot, waist up, slightly
low camera angle. Late afternoon light coming through high windows on
the left, warm, long shadows on the concrete floor. Realistic
documentary style, natural colors, shallow depth of field with the
shelving softly out of focus. Horizontal, 16:9.
```

Every clause is a decision that would otherwise be made for you.

Three habits. **Negative prompts**, where the tool supports them, remove recurring unwanted elements — `no text, no logos, no watermark` is a common baseline. **Change one thing per iteration**, exactly as with text prompts: alter the lighting, keep everything else, and compare. And **keep the prompts that worked**, because a house style is just a set of clauses you reuse; the same lighting and style block across ten images is what makes them look like a set.

A worked iteration, changing exactly one thing per pass, all else held fixed:

```text
Pass 1: ...late afternoon light through high windows on the left...
Pass 2: ...flat overhead fluorescent light, no windows...
Pass 3: ...single hard light source from behind the subject, silhouette...
```

Three images, one variable. You now know what the lighting clause controls in this tool, and that knowledge transfers to every image you make afterwards. Change three clauses at once and you have learned nothing, exactly as with text prompts.

Two limits to plan around. Text rendered inside images is unreliable — expect malformed words and set type in a real design tool afterwards. And counting is unreliable: "exactly five crates" often is not five. If a count matters, either crop it out of the brief or check every output.

### One source, four families

It helps to see how different the four text prompts look when pointed at the same material. Take a single customer complaint email:

| Family | What you ask for | Which block carries the weight | Temperature | Characteristic failure to guard against |
| --- | --- | --- | --- | --- |
| Summarization | 60 words for the shift manager, leading with what is blocked | Constraints | Low | Loses the thing that mattered |
| Extraction | JSON with site, systems, people blocked, first noticed | Format | `0` | Invented values, padding, shape drift |
| Transformation | The customer's paragraph rewritten as a neutral incident note | Constraints (preservation) | Low | Silent meaning change |
| Generation | A reply that acknowledges the issue and asks one question | Context and role | Moderate | Genericness, invented commitments |

Four prompts, one email, four different centres of gravity. Deciding which row you are on before you start writing is the practical skill this lesson is teaching — and noticing that these four are often wanted *together* is the setup for lesson 06.

## Where these land in real work

The families are not academic. Almost any workplace use case is one of them, or a short chain of them:

- **Customer support** — classify the ticket (extraction), draft the reply (generation), rewrite it for tone (transformation).
- **Meetings** — transcript to summary (summarization), summary to action items with owners and dates (extraction).
- **Recruiting** — posting from a brief (generation), resume to structured fields (extraction), rejection note rewritten for warmth (transformation).
- **Research** — condense long sources (summarization), pull comparable figures into a table (extraction).
- **Marketing** — variant copy (generation), the accompanying visual (image creation).
- **Operations** — free-text incident logs to a structured record (extraction), then a stakeholder note (summarization).

Naming the family before you write the prompt is the practical payoff of this lesson. It tells you immediately which block to invest in and which failure to write a constraint against.

## Practice

Use one document you have real access to — a long email thread, a policy page, a set of meeting notes — for exercises 1 to 3, so the comparison is fair.

1. **Run one source through four families.** Write and run four prompts against your document: a summary for a named decision-maker with a stated length; an extraction returning a specified JSON object with explicit nulls; a transformation rewriting one paragraph for a different audience with a preservation clause; and a generation task producing something new that uses only facts from the document. For each, state before running which failure mode you expect and which block you loaded to prevent it. Then report whether you were right.

2. **Force a null.** Take your extraction prompt and run it against a version of the document with one required field deliberately removed. If the model invents a value, revise the prompt until it returns your null value instead. Record both prompt versions and both outputs.

3. **Compare extractive and abstractive summaries.** Produce a five-quoted-sentence extractive summary and a 100-word abstractive one from the same source. Verify each claim in the abstractive version against the document and note anything present in the summary but not in the source. Write two sentences on when you would use each.

4. **Build an image in four passes.** Choose an image you actually need. Pass one: a single vague sentence. Pass two: add subject and setting detail. Pass three: add composition and lighting. Pass four: add style and aspect ratio. Save all four prompts and all four results. Then produce a fifth image changing exactly one clause from pass four, and write one sentence on what that clause controlled.
