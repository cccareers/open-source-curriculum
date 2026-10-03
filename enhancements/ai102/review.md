---
course_id: ai102
title: "No-Code & Low-Code AI Integration — Enhancement Review"
reviewed_lessons: 16
status: draft
---

## Summary

ai102 is unusually strong: every lesson is concrete, uses one consistent running scenario (the Northgate content-agency intake: Client Requests sheet -> Requests table -> channel notice, Dana Okafor, REQ-2026-0184, `Source Row Id`), and threads idempotency, dead-lettering, and credentials through every layer. The biggest problems are (1) a few vendor-billing facts that are now wrong or stale (Zapier Formatter steps do not count as tasks; Make now bills in credits rather than operations) and (2) the capstone (ai102-16) asks for 26 requirements in a "six hour" budget, which is not realistic. The biggest opportunity is runnable, offline evidence for the webhook/API lessons and a reusable output-contract checker for the AI step, which this pass drafts as supplementary projects.

## Clarity issues

| Lesson | Location (heading) | Issue | Fix | Status |
|---|---|---|---|---|
| ai102-03 | "The trigger-and-action model" | "task-producing run" is presented as a Zapier term; it is not one, and "every action step that runs costs one task" ignores built-in steps that do not count. | Reworded: a run is just a run; billing counts successful action steps, with Filter/Paths/Formatter as documented exceptions. | Applied |
| ai102-03 | "Field mapping in practice" | Says the Formatter step "costs a task". Zapier's current task-usage help page lists Filter and Paths as non-counting, and Zapier's own guidance says Formatter is also free. | Corrected the parenthetical and added "check the current task-usage page". | Applied |
| ai102-04 | "Building the same automation" | "Where the previous lesson would add a Formatter action costing a task, Make does it inline for free" repeats the same error. | Reframed the advantage as fewer steps to maintain, not task cost. | Applied |
| ai102-02, ai102-04 | "The axes that actually differentiate tools"; vocabulary table | Make's billing unit is described only as "operation". Since 27 Aug 2025 Make bills in **credits** (1 operation = 1 credit for non-AI modules; AI features consume credits by tokens). | Added one sentence in each lesson; kept "operation" as the counting concept. | Applied |
| ai102-07 | "Retries: when trying again is the right answer" | The example retry config shows exponential backoff, but Make's Break directive retries at a fixed interval. A learner will look for a setting that does not exist. | Added a sentence: Break gives fixed-interval retries; exponential spacing needs a different design or must be documented as a deviation. | Applied |
| ai102-08 | "Configuring the step, and paying for it" | "Maximum output length ... fails loudly rather than silently truncating your JSON" is backwards: hitting the cap *is* the truncation; it only fails loudly if a parse step catches it. | Rewrote the paragraph. | Applied |
| ai102-09 | "What a REST API is" | Lists idempotent methods but says nothing about `PATCH`, which learners use heavily in the lesson. | Added a sentence: `PATCH` is not guaranteed idempotent. | Applied |
| ai102-09 | "Configuring the HTTP step" | The `replace()` example escapes double quotes only; newlines and backslashes also break a raw JSON body (and exercise 6 tests a newline). | Added a sentence naming all three characters. | Applied |
| ai102-09 | "Configuring the HTTP step" | `"external_ref": "{{1.\`Source Row Id\`}}"` maps from module 1 (the sheet trigger), which has no `Source Row Id` column; in lesson 04 the key came from `{{1.__ROW_NUMBER__}}`. | Make the source of the key consistent with lesson 04 (or map from the created record). Left for the owner because module numbering in this example is implicit. | Proposed |
| ai102-10 | "Verifying that the request is genuine" | Says the sender hashes "the request body", but the example header (`t=...,v1=...`) is a timestamped scheme where the signed string normally includes the timestamp. Example signature is 48 hex chars; HMAC-SHA256 hex is 64. "Compare" omits the constant-time caveat. | Clarified the signed string, fixed the sample length, noted that the sender's docs define the exact string. | Applied |
| ai102-12 | "Persona, tone, and the rules that constrain it" | NEVER item "Mention that you are an AI model, a vendor, or a version" can be read as "hide that you are a bot", which contradicts the greeting, lesson 14's Disclosure setting, and bot-disclosure rules in several jurisdictions. | Reworded to "Name the underlying model, vendor, or version" plus "never deny being automated". | Applied |
| ai102-16 | "The goal" | "Budget six hours" for 26 requirements, two platforms, a deployed bot, a handoff with a real human, and a 13-section handover. Realistically this is 20-30 hours of work. `hours_estimate: 6` in course.json has the same problem. | Owner decision: raise the hours (course.json change, out of scope for this pass) or make R19-R21 and R25-R26 cumulative from lessons 12-15 artefacts. | Proposed |
| ai102-16 | "Constraints" | "No application code" conflicts with lesson 10, which says HMAC in Zapier "typically needs a small code step". | State explicitly that a Zapier learner meets R17 with shared secret + callback-fetch, or permit a single code step for HMAC only. | Proposed |
| ai102-01 | "Description" | Overview has no time map, no tool/account list, and no note on free-plan limits. | Add a short "What you need" list (spreadsheet, Zapier free, Make free, a no-code DB, a chat destination, a chatbot platform with a knowledge source). | Proposed |

## Depth and coverage gaps

- **No runnable evidence for webhooks/HTTP** (objective: "Receive and send events with webhooks, including verifying and shaping an inbound payload"). Lessons 09-10 describe signature verification and dedupe well, but a learner has no way to generate a correctly signed event or a forged one. Drafted as project ai102-x01 with an offline Node harness.
- **AI step output contract is described but never checked mechanically** (objective: "Embed a prompt inside an automation step so the model receives clean input and returns output the next step can consume"). Drafted as project ai102-x02 with a contract/eval checker.
- **Make's Break retries and incomplete executions** (objective: "Add branching, filters, retries, and explicit error paths so an automation behaves predictably when a step fails"): the lesson should show where "store incomplete executions" must be enabled; without it Break does not park anything. Exact setting label should be verified before adding.
- **Zapier's equivalent error tooling** is thin ("expresses less of this structurally"). Zapier has added error-handling paths on steps; worth a verified paragraph (see Open questions).
- **Lesson 05 formula examples** use Airtable-flavoured syntax without saying so; a one-line note ("syntax shown is Airtable-style; other platforms differ") would help learners on Baserow/NocoDB/SmartSuite.
- **Lesson 13 retrieval**: no misconception block on "a higher relevance threshold is always safer" or "more chunks = better answers"; both are addressed in prose but would benefit from a worked numeric example (3 questions x 3 thresholds).
- **Lesson 15 cost**: the arithmetic skeleton leaves rates as `[look up]`, correctly. Add a fully worked example with clearly fictional round-number rates so learners practise the multiplication before plugging real prices.
- **Misconceptions not named anywhere**: "routes in a Make router run in parallel" (named, good); "a 200 from my webhook means the work succeeded" (implied); "temperature 0 means deterministic" (named in lesson 08, good). Add the first-delivery/ack misconception to lesson 10's check block (done).

## Proposed additional projects

- **ai102-x01 — Signed Booking Webhook: Verify, Deduplicate, Shape** (drafted, `projects/01-signed-booking-webhook.md`). Runnable Node harness: local mock receiver + signer + `node:test` suite (forged, stale, duplicate, malformed, happy path).
- **ai102-x02 — Triage Step Contract and Evaluation Harness** (drafted, `projects/02-triage-contract-eval-harness.md`). Runnable checker that validates exported AI-step outputs against the output contract and scores them against a labelled set.
- Booking API sync with pagination and rate-limit handling against a local mock (lesson 09) — not drafted.
- Connection register + rotation drill as an evidence portfolio (lesson 11) — not drafted.
- "Two-platform bake-off": same intake built in Zapier and Make, measured unit counts at 1 / 5 / 20 line items (lessons 03-04) — not drafted.
- Grounded FAQ bot with a 40-question eval set and refusal-log categorisation (lesson 13) — not drafted; overlaps the capstone.

## Video and animation opportunities

- **Webhooks: answer fast, verify, deduplicate** — ai102-10. Hybrid whiteboard + terminal. Motion helps show the ack/retry race. **Drafted:** `media/video-01-webhooks-verify-dedupe.md`.
- **From chat prompt to workflow function: the two contracts** — ai102-08. Hybrid. **Drafted:** `media/video-02-ai-step-two-contracts.md`.
- **The bundle multiplier** — ai102-04. Explainer animation: one bundle becomes three, operation counter ticks. **Drafted:** `media/animation-01-bundle-multiplier.md`.
- **At-least-once delivery and the duplicate** — ai102-10 (matches the course asset `webhook-handshake.png`). Explainer animation. **Drafted:** `media/animation-02-at-least-once-delivery.md`.
- Router routes run top-to-bottom, not in parallel — ai102-04. Short animation.
- Grounding pipeline: where errors come from (retrieval vs prompt) — ai102-13. Explainer animation.
- Rotation without downtime, six steps — ai102-11. Whiteboard.
- Conversation flow with escalation exits (matches `chatbot-conversation-flow.png`) — ai102-12. Animated diagram.

## Assessment ideas

- Lessons 02, 03, 04, 07, 08, 09, 10, 11, 13, 15 now end with a "Check your understanding" block; these can seed an item bank.
- Unit-count estimation item: give a Make scenario screenshot with bundle counts and ask for the operation (credit) total; give the same flow as a Zap and ask for tasks (with Formatter/Filter excluded).
- Status-code triage drill: 12 HTTP responses, learner marks retry / alert / dead-letter.
- Webhook forensic item: four header/body pairs, learner identifies forged, stale, duplicate, genuine (directly supported by the x01 harness).
- Rubric for the chatbot design document (lesson 12) with rows per document section; the 12-section template already gives the structure.
- Capstone (ai102-16) checklist could be converted to a reviewer form with evidence links per requirement.

## Changes applied in this pass

- `02-the-no-code-and-low-code-landscape.md`, "The axes that actually differentiate tools": added note that Make now bills in credits (1 operation = 1 credit for non-AI modules; AI features consume credits by tokens). Added "Check your understanding".
- `03-your-first-automation-in-zapier.md`, "The trigger-and-action model": removed the non-standard "task-producing run" term; stated that Filter, Paths, and Formatter steps do not count as tasks per Zapier's task-usage page. "Field mapping in practice": corrected "(it costs a task)". Added "Check your understanding".
- `04-scenarios-modules-and-routers-in-make.md`, after the vocabulary table: added credits note. "Building the same automation": corrected the Formatter-costs-a-task comparison. Added "Check your understanding".
- `07-logic-branching-and-error-paths.md`, "Retries": added that Make's Break directive retries at a fixed interval, so exponential spacing is a design target that must be built or documented as a deviation. Added "Check your understanding".
- `08-adding-an-ai-step-to-an-automation.md`, "Configuring the step, and paying for it": rewrote the maximum-output-length paragraph (hitting the cap truncates; the parse step is what makes it loud). Added "Check your understanding".
- `09-connecting-tools-with-rest-apis.md`, "What a REST API is": added `PATCH` idempotency note. "Configuring the HTTP step": added that newlines and backslashes also need escaping. Added "Check your understanding".
- `10-webhooks-receiving-and-sending-events.md`, "Verifying that the request is genuine": clarified that timestamped schemes sign timestamp + body, that the sender's docs define the exact string, fixed sample signature to 64 hex chars, and noted comparison caveat. Added "Check your understanding".
- `11-authentication-and-credential-management.md`: added "Check your understanding".
- `12-designing-a-business-chatbot.md`, "Persona, tone, and the rules that constrain it": reworded the AI-disclosure NEVER item so it cannot be read as concealing automation.
- `13-grounding-a-chatbot-in-your-own-content.md`: added "Check your understanding".
- `15-testing-cost-and-reliability.md`: added "Check your understanding".

## Open questions for the course owner

1. **Capstone time budget.** ai102-16 says six hours and course.json says `hours_estimate: 6`. Should hours rise, or should the capstone explicitly reuse artefacts from lessons 12-15 (design doc, eval sets, test table, handover) so the six hours is assembly only?
2. **"No application code" vs HMAC.** Lesson 10 says Zapier needs a code step for HMAC; lesson 16 forbids application code. Decide the policy.
3. **Make billing in credits.** Verified on Make's help center (credits replaced operations 27 Aug 2025; 1:1 for non-AI modules). Should "operation" be kept as the teaching term throughout (current approach) or should lessons 02/04/15 be revised to "credits"? Also, do polling checks that find nothing still consume a credit on all triggers? Lesson 04 says "on some connectors"; re-verify.
4. **Zapier task counting.** Zapier help (task-usage page) lists Filter and Paths as non-counting; Zapier's blog says Formatter is also free and that "premium" steps may count differently. Re-check before publishing, and consider whether AI-by-Zapier steps count differently.
5. **Unverified UI labels** (not changed in this pass): Zapier run statuses "Held", "Delayed"; Zapier "stored authentication attached to a custom request" (Zapier's newer per-app "API Request" actions may be the better reference); Make "Choose where to start"; Make "Crypto or tools module" for HMAC (Make's built-in `sha256()` function may accept a key for HMAC — verify); Make custom webhook options for capturing headers and the raw body; Make "Break" settings labels; "evaluate all states as errors" toggle in Make's HTTP module.
6. **Polling intervals** ("1 to 15 minutes depending on plan", lessons 02-03) and **API rate limits** ("single-digit requests per second per base", lesson 05) are plan-dependent and change; keep as ranges, re-verify annually.
7. **Competency ID collision.** `D2-S1-C01`/`D2-S1-C02` in `ai-developer.json` mean token concepts, not no-code building. ai102's pathway is prompt-engineer, so mappings are correct, but any cross-pathway report keyed only on ID will mis-map.
8. **Image assets.** Lessons 10 and 12 reference `./img/webhook-handshake.png` and `./img/chatbot-conversation-flow.png`; the lessons folder has no `img/` directory. Animation storyboard a02 can double as the source for the first.
9. **Lesson 09 `external_ref` mapping** (see Clarity table): confirm the intended source module for the key.
