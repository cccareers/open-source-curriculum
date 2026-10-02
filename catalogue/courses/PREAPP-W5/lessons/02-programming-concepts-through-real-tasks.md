---
lesson_id: PREAPP-W5-02
course_id: PREAPP-W5
pathway: tech-pre-apprenticeship
title: Programming Concepts Through Real Tasks
order: 2
kind: lesson
competency_ids:
  - D4-S1-C01
  - D4-S1-C02
objectives:
  - Apply core programming concepts to contact-list tasks in TypeScript
  - Trace what a short program does and predict its output
---

## The task, before the code

Open your CRM and look at your pipeline. Somewhere in there is a question you answer by hand every morning: who did I message three days ago and never hear back from? How many of my contacts work at the twelve companies I actually care about? Which of my replies are still sitting in "replied" with no meeting booked?

You answer those by scrolling and counting. A program answers them the same way you would — it just does not get bored on row 200. That is the whole idea behind this lesson. Every concept below exists because a human doing pipeline work needs it.

Your instructor and your apprentice partner will have you working in one file all day. Create it now:

```bash
mkdir pipeline-tools && cd pipeline-tools
touch contacts.ts
bun run contacts.ts
```

If you are on Node instead of Bun, `npx ts-node contacts.ts` runs the same file. The file is empty, so nothing happens yet. That is fine — you now have a loop of write, run, look.

## Variables: a name for a value

A variable is a label you stick on a value so you can refer to it later. In TypeScript you declare one with `const` when the label will always point at the same value, and `let` when you intend to change it.

```ts
const myName = "Dana";
let messagesSentToday = 0;
messagesSentToday = messagesSentToday + 1;
console.log(`${myName} sent ${messagesSentToday} message(s).`);
```

Three things worth noticing. `console.log` prints to your terminal — it is how you see inside a running program. The backtick string is a *template literal*, and `${...}` drops a value into the middle of text. And TypeScript quietly worked out that `myName` holds a string and `messagesSentToday` holds a number; if you later tried `messagesSentToday = "seven"`, it would refuse before the program ever ran. That refusal is the "Type" in TypeScript, and it is the reason we teach it here rather than plain JavaScript: the editor catches your mistake while you are typing instead of at 6 a.m. in front of a hiring manager.

## Objects and arrays: shaping your contact list

A single contact has several facts attached to it. An **object** groups those facts under names:

```ts
const contact = {
  name: "Dana Ruiz",
  company: "Sentinel Health",
  status: "messaged",
  touches: 2,
};
console.log(contact.company);
```

Each `name: value` pair is a **property**, and you read one with a dot: `contact.company`. An **array** is an ordered list of things, written with square brackets. A contact list is an array of contact objects.

Because you will pass these around, give the shape a name with a `type`. Then TypeScript knows what a contact is everywhere in the file:

```ts
type Contact = {
  name: string;
  company: string;
  status: "new" | "messaged" | "replied";
  touches: number;
};

const contacts: Contact[] = [
  { name: "Dana Ruiz", company: "Sentinel Health", status: "replied", touches: 3 },
  { name: "Amir Patel", company: "Northgate Bank", status: "new", touches: 0 },
  { name: "Joy Okafor", company: "Sentinel Health", status: "messaged", touches: 1 },
];
```

`status: "new" | "messaged" | "replied"` is a union: the only three values allowed. Typo `"mesaged"` anywhere and the editor underlines it. `Contact[]` means "an array of Contact". `contacts.length` gives you the count — try printing it.

## Loops: doing the same thing to every row

A **loop** repeats a block of code once per item. The form you will use most is `for ... of`:

```ts
for (const c of contacts) {
  console.log(`${c.name} — ${c.status} (${c.touches} touches)`);
}
```

Read it out loud: "for each contact in contacts, call it `c`, and print this line." The loop body runs three times because the array has three items.

Now add a decision. An `if` statement runs its block only when a condition is true, and a counter variable survives across loop passes:

```ts
let replied = 0;
for (const c of contacts) {
  if (c.status === "replied") {
    replied = replied + 1;
  }
}
console.log(`${replied} of ${contacts.length} contacts have replied.`);
```

`===` compares two values; `=` assigns. Mixing them up is the single most common beginner bug, and TypeScript will not always save you.

## Functions: naming a piece of work

A **function** is a named block of code you can run whenever you want, with inputs (parameters) and an output (a return value). Write the follow-up rule once, and use it forever:

```ts
function needsFollowUp(c: Contact, maxTouches: number): boolean {
  return c.status === "messaged" && c.touches < maxTouches;
}

console.log(needsFollowUp(contacts[2], 3));
```

The parts: `needsFollowUp` is the name, `c: Contact` and `maxTouches: number` are the parameters with their types, `: boolean` promises the answer is true or false, and `return` hands the answer back to whoever called it. `&&` means "and" — both sides must be true.

Functions are how a script stays readable as it grows. When your instructor asks "where is the follow-up rule?", the answer is one place, not scattered across four loops.

## Array methods: filter and map

Arrays come with built-in functions that loop for you. Two carry most of the weight in real data work.

`filter` keeps only the items that pass a test, returning a new, shorter array. `map` transforms every item, returning a new array of the same length.

```ts
const queue = contacts.filter((c) => needsFollowUp(c, 3));
const names = queue.map((c) => c.name);
console.log(names.join(", "));
```

`(c) => ...` is an arrow function — a small unnamed function passed as an argument. `filter` calls it once per contact and keeps the ones that come back true. `join(", ")` glues an array of strings into one string.

Neither method changes `contacts`. That matters: your original data stays intact while you build views of it. Chain them and you have a report:

```ts
const sentinel = contacts
  .filter((c) => c.company === "Sentinel Health")
  .map((c) => `${c.name} (${c.status})`);
console.log(sentinel);
```

## Tracing: predicting output without running it

Reading code is a bigger part of this job than writing it. To trace a program, keep a small table of every variable and update it line by line, exactly as the machine would.

Trace this before you run it:

```ts
const touches = [0, 2, 3, 1];
let total = 0;
for (const t of touches) {
  if (t > 0) {
    total = total + t;
  }
}
console.log(total);
```

Pass 1: `t` is 0, condition false, `total` stays 0. Pass 2: `t` is 2, `total` becomes 2. Pass 3: `t` is 3, `total` becomes 5. Pass 4: `t` is 1, `total` becomes 6. Output: `6`.

When a program surprises you, the fix is almost never to stare harder. Drop a `console.log` inside the loop, print the variables you are unsure about, and let the program tell you where your mental model diverged.

## Practice

Work in `contacts.ts` with your apprentice partner. Run after every step.

1. Extend the `contacts` array to ten real entries pulled from your own CRM — real names, real companies, honest `status` and `touches` values.
2. Print one line per contact in the format `Name — Company — status`.
3. Count and print how many contacts sit in each of the three statuses. Use one loop and three counter variables.
4. Write `function staleQueue(all: Contact[], maxTouches: number): Contact[]` that returns the contacts needing follow-up. Print the names, comma-separated.
5. Use `map` to build an array of just the company names, then print how many distinct companies you are working. Ask your partner how they would remove duplicates before you look it up.
6. **Trace first, run second.** Write down the exact output you expect from this snippet, then run it and reconcile any difference with your partner.

```ts
const statuses = ["new", "messaged", "replied", "messaged"];
let count = 0;
for (const s of statuses) {
  if (s !== "new") count = count + 1;
}
console.log(`${count} contacts have been contacted at least once.`);
```
