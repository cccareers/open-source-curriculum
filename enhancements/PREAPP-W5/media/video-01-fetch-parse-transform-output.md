---
course_id: PREAPP-W5
media_id: PREAPP-W5-v01
type: video-script
title: "From CRM Export to Monday's Follow-Up List"
format: screencast
target_runtime: "8 min"
related_lessons:
  - PREAPP-W5-03
objectives:
  - Explain what APIs are and use a script to pull and transform pipeline data
  - Order fetch, parse, transform, and output steps in a working data script
competency_ids:
  - D4-S2-C01
  - D4-S2-C02
---

## Purpose

After watching, a learner can build a four-step data script (fetch, parse, transform, output) that turns a CRM CSV export into `follow-ups.csv`, and can explain where an API would replace the fetch step.

## Audience and prerequisites

Week 5 participants who finished Lesson 2 (variables, arrays, objects, loops, `filter`, `map`). Bun is installed. The video uses a fake `contacts.csv`.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Talking head, then a spreadsheet with 400 rows scrolling. | "Yesterday you typed ten contacts into your file by hand. Your real pipeline has hundreds. Today the data comes from where it lives, and the script goes and gets it." |
| 0:15 | Four labeled boxes in a row: FETCH → PARSE → TRANSFORM → OUTPUT. | "Every data script you'll ever write does four things, in this order. Fetch: get the raw text. Parse: turn the text into objects. Transform: filter, count, sort — your judgment. Output: print it or write a file. One function each, so when something breaks, you know which box broke." |
| 0:45 | Editor (VS Code, font 20pt), empty `pipeline.ts`. Terminal below. Sidebar shows `contacts.csv`. Open the CSV in the editor: `name,company,status` / `Dana Ruiz,Sentinel Health,replied` / `Amir Patel,Northgate Bank,new` / `Joy Okafor,Sentinel Health,messaged` / `Luis Ortega,Harbor Credit Union,messaged`. | "Here's a CSV export. It's just text. One header row of column names, then one line per contact, values separated by commas." |
| 1:10 | Type: `import { readFileSync } from "node:fs";` / `const raw = readFileSync("contacts.csv", "utf8");` / `console.log(raw.trim().split(/\r?\n/).length - 1, "data rows");` Run: `bun run pipeline.ts`. Output: `4 data rows`. | "Fetch is a file read. Before I write anything else, I check it worked: four data rows. The header doesn't count, which is why I subtract one. And `/\r?\n/` splits on line breaks from both Mac and Windows exports — your CRM might use either." |
| 1:50 | Type the `toRows` function from the lesson. Highlight each line as it is explained. | "Parse. This is the densest code of the week, so slowly. Split into lines. The first line is the header — `head` — the rest are `lines`. Split the header on commas: those are the column names. Then for each line, pair each column name with the value in the same position, and `Object.fromEntries` builds an object from those pairs." |
| 2:40 | Add `const rows = toRows(raw); console.log(rows[0]);` Run. Output: `{ name: "Dana Ruiz", company: "Sentinel Health", status: "replied" }`. | "Print the first one. That's an object, exactly like yesterday's — so everything you learned yesterday works on it." |
| 3:00 | Add a row to the CSV: `Pat Lee,"Acme, Inc.",messaged`. Print that row; the object shows company `"Acme` and status ` Inc."` — the real status, `messaged`, is lost. Red box around it. | "Quick honesty check. A company with a comma in its name breaks this parser — it splits in the wrong place. That's a real limitation. Name it in your README. In production you'd use a CSV library." |
| 3:25 | Remove that row. Type the transform: `const stale = rows.filter((r) => r.status === "messaged").map((r) => ({ name: r.name, company: r.company }));` / `console.log(\`${stale.length} contacts are waiting on a follow-up.\`);` Run → `2 contacts are waiting on a follow-up.` | "Transform. This is the part that's yours. My rule: anyone in 'messaged' needs a follow-up. Yours might add touches or dates. Filter keeps the matching rows; map reshapes them to just name and company." |
| 4:10 | Type the output step with `writeFileSync`. Run → `Wrote 2 rows to follow-ups.csv`. Open `follow-ups.csv` in a spreadsheet app. | "Output. Printing proves it works; writing a file makes it useful to someone who doesn't run scripts. That opens in a spreadsheet. That's my Monday follow-up list, in under a second." |
| 4:45 | Diagram: the four boxes again; FETCH box swaps from a file icon to a cloud icon labeled "API." | "Now: APIs. An API is a documented way for one program to ask another for data. A door for software, not a screen for people. If your CRM has one, only the fetch box changes. Parse, transform, output — untouched." |
| 5:10 | Show the lesson's `pullContacts` function. Highlight `fetch`, the `Authorization` header, `res.ok`, `res.json()`. | "The request goes to an endpoint — an address. The header proves who you are. The status code tells you how it went. `res.ok` is true for any 200-something. If it's not, we throw an error and stop, loudly, instead of quietly reporting an empty pipeline." |
| 5:50 | Terminal: `CRM_TOKEN=wrongtoken bun run pipeline.ts` → `Error: Request failed with status 401`. | "Break it on purpose. Wrong token: 401 — your credentials are wrong. That's the API saying 'I don't know you.'" |
| 6:15 | Highlight `process.env.CRM_TOKEN`. Overlay: "Never type a key into your code." | "Notice the token comes from `process.env` — an environment variable — never typed into the file. Tomorrow this goes public on GitHub, and anything in the file goes with it." |
| 6:40 | Shuffled five lines on screen (from Lesson 3, Practice 6). They animate into the correct order. | "Last thing: the order. Read the file, check the response if it's an API, parse into rows, filter, write. Each step needs the one before it. That's Practice 6." |
| 7:15 | Talking head. | "Your turn: export your real contacts, build the four functions, write your own follow-up rule, and open the file in a spreadsheet. Your apprentice partner is right there." |
| 7:45 | End card. | — |

## On-screen assets and B-roll

- Fake `contacts.csv` (fictional names only).
- Editor at 20pt font or larger, high-contrast theme; terminal pane visible.
- Four-box FETCH/PARSE/TRANSFORM/OUTPUT diagram reused at 0:15, 4:45, and 6:40.
- Spreadsheet app showing `follow-ups.csv`.

## Accessibility

- Captions; every line of code typed on screen is read aloud or included verbatim in the transcript.
- Code typed at a readable pace, with pauses after each run; terminal output stays on screen at least 3 seconds.
- Error states are shown with a text label ("Error: …"), not only red color.
- Transcript includes the complete final `pipeline.ts`.

## Check for understanding

1. Your script prints `0 contacts are waiting on a follow-up`, but you know there are some. The CSV came from a Windows export, and you split on `"\n"`. What is likely wrong? **Answer:** Each line ends in an invisible `\r`, so the last column's value is `"messaged\r"`, not `"messaged"`. Split on `/\r?\n/`.
2. Moving from CSV to a live API, which of the four steps change? **Answer:** Fetch (and the parse step is done by `res.json()`). Transform and output stay the same.
3. What does status 401 mean, and what does `res.ok` protect you from? **Answer:** Credentials are wrong or missing. Checking `res.ok` stops the script with an error instead of letting a failed request look like an empty pipeline.
