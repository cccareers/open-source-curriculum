---
lesson_id: PREAPP-W5-03
course_id: PREAPP-W5
pathway: tech-pre-apprenticeship
title: Data & APIs
order: 3
kind: lesson
competency_ids:
  - D4-S2-C01
  - D4-S2-C02
objectives:
  - Explain what APIs are and use a script to pull and transform pipeline data
  - Order fetch, parse, transform, and output steps in a working data script
---

## What an API actually is

Yesterday your contact list was typed into the file by hand. That is fine for ten rows and useless for four hundred. Today the data comes from where it really lives — your CRM — and your script goes and gets it.

An **API** (application programming interface) is a documented way for one program to ask another program for something. Not a website for humans; a door for software. Your CRM has a screen you log into, and behind that screen the same data is available to any program that knows the address and is allowed in.

Four words cover almost everything you need this week:

- **Endpoint** — the address you ask, such as `https://api.example-crm.com/v1/contacts`. Different endpoints answer different questions.
- **Request** — what you send. It carries a method (`GET` to read, `POST` to create), the endpoint, and headers — extra lines of context, most importantly the one proving who you are.
- **Response** — what comes back. Usually a body of JSON text plus headers describing it.
- **Status** — a three-digit number on the response saying how it went. `200` fine, `201` created, `401` your credentials are wrong or missing, `404` no such endpoint, `429` you are asking too fast, `500` their server broke, not you.

Say it in outreach terms: the endpoint is the person's address, the request is your message, the response is their reply, and the status is whether it delivered, bounced, or got you blocked. Checking the status before you trust the body is the same instinct as checking a message actually sent before you log it.

**JSON** is the format almost all of them speak. It is the same shape as the objects and arrays from yesterday, written as text: curly braces for objects, square brackets for arrays, quoted keys.

```json
[
  { "name": "Dana Ruiz", "company": "Sentinel Health", "status": "replied" },
  { "name": "Amir Patel", "company": "Northgate Bank", "status": "new" }
]
```

## The four steps every data script runs

Whatever the source, the shape of the work is the same, and in this order:

1. **Fetch** — get the raw data as text, from a file on disk or over the network.
2. **Parse** — turn that text into objects and arrays your code can reach into.
3. **Transform** — filter, count, reshape, sort. This is where your judgment lives.
4. **Output** — print it, or write a new file someone else can use.

Keep them separate in your file, in that order, one function each. When something breaks — and it will — you can find out which of the four failed in about a minute.

## Path A: the CSV export

Most CRMs will hand you a CSV. Export your contacts to `contacts.csv` and drop it next to your script. A CSV is plain text: a header row of column names, then one line per record, values separated by commas.

**Fetch** is a file read:

```ts
import { readFileSync } from "node:fs";

const raw = readFileSync("contacts.csv", "utf8");
console.log(raw.trim().split(/\r?\n/).length - 1, "data rows");
```

**Parse** turns that text into an array of objects. Read this one slowly — it is the densest code in the week:

```ts
type Row = Record<string, string>;

function toRows(text: string): Row[] {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(",");
  return lines.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(cols.map((c, i): [string, string] => [c, cells[i] ?? ""]));
  });
}
```

`Record<string, string>` means "an object whose keys and values are all strings" — you do not know the column names ahead of time, so you cannot write a fixed type. `.trim()` drops the blank line at the end of the file. `split(/\r?\n/)` splits on line breaks whether the file uses Mac/Linux line endings (`\n`) or Windows line endings (`\r\n`) — many CRM exports use the Windows style, and splitting on `"\n"` alone leaves an invisible `\r` stuck to the last column, so if `status` is your last column, `r.status === "messaged"` silently fails on every row. `const [head, ...lines]` takes the first line as `head` and the rest as `lines`. `Object.fromEntries` builds an object from pairs, so a header of `name,company,status` and a line of `Dana Ruiz,Sentinel Health,replied` become one object with those three properties. `cells[i] ?? ""` supplies an empty string when a row is short.

This parser splits on every comma, so a company name containing a comma will break it. That is a real limitation, and naming it is more honest than pretending otherwise — in production you would reach for a CSV library.

## Path B: the live API

If your CRM exposes an API and your instructor has a key for you, fetch over the network instead. `fetch` is built into both Bun and modern Node, and it returns a promise — a value that is not ready yet. `await` waits for it, and `await` works inside a function marked `async` or at the top level of an ES module.

```ts
async function pullContacts(): Promise<Row[]> {
  const res = await fetch("https://api.example-crm.com/v1/contacts", {
    headers: { Authorization: `Bearer ${process.env.CRM_TOKEN ?? ""}` },
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as Row[];
}
```

The second argument to `fetch` carries the headers. `Authorization: Bearer ...` is how you prove who you are. `res.ok` is true for any 2xx status; when it is false, `throw` stops the script loudly instead of letting an empty result quietly look like an empty pipeline. `res.json()` parses the response body for you — the parse step, done by the library.

Read the token from `process.env`, never from a line in your file. Tomorrow you publish this repository to the internet, and a key typed into your code goes public with it.

## Transform: the part that is actually yours

Now the data is objects, and yesterday's tools work unchanged:

```ts
const rows = toRows(raw);
const stale = rows
  .filter((r) => r.status === "messaged")
  .map((r) => ({ name: r.name, company: r.company }));
console.log(`${stale.length} contacts are waiting on a follow-up.`);
```

Counting by group is the other transform you will want constantly:

```ts
const byCompany: Record<string, number> = {};
for (const r of rows) {
  byCompany[r.company] = (byCompany[r.company] ?? 0) + 1;
}
console.log(byCompany);
```

The first time a company appears there is no count yet, so `?? 0` starts it at zero.

## Output: leave something behind

Printing proves it works. Writing a file makes it useful to someone who does not run scripts:

```ts
import { writeFileSync } from "node:fs";

const lines = ["name,company", ...stale.map((s) => `${s.name},${s.company}`)];
writeFileSync("follow-ups.csv", lines.join("\n") + "\n");
console.log(`Wrote ${stale.length} rows to follow-ups.csv`);
```

That file opens in a spreadsheet. It is your Monday morning follow-up list, generated in under a second, and it is the thing you will demo.

## Practice

Build `pipeline.ts` alongside your apprentice partner. Keep the four steps in four separate functions.

1. Export your real contacts from your CRM to `contacts.csv`. Print the header row and the number of data rows to confirm the fetch step works before writing anything else.
2. Implement `toRows` and print the first parsed object. Confirm the property names match your header exactly.
3. Write a transform that produces your follow-up queue, using your own rule for what "needs a follow-up" means. Print the count.
4. Build a count-by-company report and print it. Which three companies are you most invested in?
5. Write the queue to `follow-ups.csv` and open it in a spreadsheet.
6. **Order the steps.** Order the CSV path: `writeFileSync(...)`, `const rows = toRows(raw)`, `const raw = readFileSync(...)`, `const stale = rows.filter(...)`. Then order the API path: `writeFileSync(...)`, `const rows = await res.json()`, `const res = await fetch(...)`, `const stale = rows.filter(...)`, `if (!res.ok) throw ...`. Explain each dependency; the response check belongs only to the API path.
7. If you have API credentials, replace the CSV fetch-and-parse pair with `const rows = await pullContacts();`. It already parses JSON; do not pass its result to `toRows`. Keep transform and output unchanged. The URL above is a placeholder: use your instructor's documented endpoint, authentication scheme, response shape, and pagination rules. Then break it on purpose: use a wrong token and read the status you get back.
