---
lesson_id: alg100-03
course_id: alg100
pathway: quality-assurance-software-engineer
title: Arrays, Lists, and Maps in JavaScript
order: 3
kind: lesson
competency_ids:
  - D3-S1-C05
  - D5-S1-C02
objectives:
  - Choose a data structure that fits the data you are holding
---

## Why the shape of your data matters

A data structure is a decision about which operations are going to be cheap and which are going to be expensive. There is no structure that makes everything fast; every choice trades one kind of access for another. An array is fast to step through in order but slow to search by value. A map is fast to look something up by a key but does not remember the order you added things in unless you ask it to. Choosing the right structure is really choosing which of your operations matter most, and that choice shows up constantly once you are working with real records — including the record you will spend the rest of your career reading and writing: the defect.

A bug report is data. It has a stable identifier, a set of fields, relationships to other records (which build it appeared in, which test case found it, which other defects it duplicates), and it needs to support specific operations: look one up fast by its id, list all defects for a given build in the order they were filed, check whether a given id has already been logged. Every data structure in this lesson is a candidate shape for that record or for the fixture data you feed a test, and the right choice depends entirely on which operation you need to be fast.

## Arrays: ordered, indexed collections

An array in JavaScript is an ordered list, indexed from `0`, and it is the right structure whenever position or sequence is part of the meaning of the data.

```javascript
const defectsFoundInOrder = [
  "DEF-101: login button unresponsive on mobile",
  "DEF-102: checkout total rounds incorrectly",
  "DEF-103: password reset email never sent",
];

console.log(defectsFoundInOrder[0]); // the first defect found this session
defectsFoundInOrder.push("DEF-104: session timeout too short");
```

Arrays are cheap to append to at the end (`push`), cheap to read by position (`array[i]`), and cheap to walk in order (`for...of`, `.forEach`, `.map`, `.filter`). They are expensive to search by value — checking whether `"DEF-102: ..."` is already in the list means potentially looking at every element, an operation that gets slower as the array grows. If your dominant question is "what's the sequence of things that happened," an array is the shape you want; a session's log of test steps, a list of defects filed today in filing order, a queue of test cases waiting to run — all arrays.

## Objects and Maps: lookup by key

When the dominant question shifts from "what happened in order" to "give me the record for this specific id," a keyed structure beats an array outright. A plain object works for this:

```javascript
const defectsById = {
  "DEF-101": { severity: "high", status: "open", build: "4.2.0" },
  "DEF-102": { severity: "medium", status: "fixed", build: "4.2.0" },
};

console.log(defectsById["DEF-102"].status); // "fixed" — no scanning required
```

A `Map` does the same job with a slightly different contract, and is the better choice when keys are not always strings, when you need to know how many entries exist, or when insertion order matters for iteration:

```javascript
const defectsById = new Map();
defectsById.set("DEF-101", { severity: "high", status: "open" });
defectsById.set("DEF-102", { severity: "medium", status: "fixed" });

console.log(defectsById.get("DEF-101").severity); // "high"
console.log(defectsById.size); // 2
console.log(defectsById.has("DEF-999")); // false — cheap existence check
```

The reason this beats an array for lookup is not stylistic — it is structural. A `Map` (and a plain object, for string keys) is built so that `get`, `set`, and `has` do not need to inspect every entry to find the right one; the cost of a lookup does not grow the way it does when you scan an array with `.find()`. If your defect database's most common operation is "has this defect id already been logged, and if so what's its status," a map-shaped structure is the right call, not an array you `.find()` your way through.

## Sets: membership without duplicates

A `Set` answers exactly one question well: is this value already present? It automatically discards duplicates and gives you a cheap `.has()` check, which makes it the right shape for tracking which test cases have already run, or which defect ids have already been triaged this cycle, when you do not care about any data beyond the id itself.

```javascript
const triagedToday = new Set(["DEF-101", "DEF-103"]);

triagedToday.add("DEF-102");
console.log(triagedToday.has("DEF-101")); // true
triagedToday.add("DEF-101"); // no-op — already present
console.log(triagedToday.size); // 3, not 4
```

Reach for a `Set` instead of an array whenever the requirement contains the word "unique" or "already seen" and you do not need to store anything about the value except that it exists.

## Linked lists: when insertion order matters more than fast lookup

An array's weak point is inserting or removing something in the middle: every element after the insertion point has to shift over, which gets slower as the array grows. A linked list avoids that by giving up indexed access entirely — each element is a node holding a value and a pointer to the next node, so nothing has to shift, only a couple of pointers have to change.

```javascript
function makeNode(value) {
  return { value, next: null };
}

// A tiny linked list of defect ids reported this hour, oldest first.
const first = makeNode("DEF-101");
first.next = makeNode("DEF-102");
first.next.next = makeNode("DEF-103");

function toArray(head) {
  const result = [];
  let node = head;
  while (node !== null) {
    result.push(node.value);
    node = node.next;
  }
  return result;
}

console.log(toArray(first)); // ["DEF-101", "DEF-102", "DEF-103"]
```

You will not reach for a hand-built linked list often in application code — JavaScript's array already handles most sequential cases well enough — but the concept matters because it is the shape underneath things you will use constantly: a queue of pending test runs where items are added at one end and removed from the other, or a history of steps you might need to insert a missing one into without re-indexing everything after it. Recognizing "I need to insert or remove from the middle of a sequence a lot" as a linked-list-shaped problem, even if you implement it with an array in practice, is the actual skill.

## Choosing the shape for a defect record

Put the four structures side by side against a single scenario: you are building the in-memory store an automated tool uses while a test run is in progress. The tool needs to (a) list every defect found this run in the order it was found, (b) check instantly whether a given id has already been logged so it does not file a duplicate, and (c) look up a specific defect's full details by id when a step needs to update its status.

No single structure does all three well by itself, which is exactly the point: you combine them, each covering the operation it is fast at.

```javascript
const defectLog = [];              // array — the ordered history, (a)
const seenIds = new Set();         // set — instant duplicate check, (b)
const defectsById = new Map();     // map — fast lookup by id, (c)

function fileDefect(id, details) {
  if (seenIds.has(id)) return false; // already logged, skip
  defectLog.push(id);
  seenIds.add(id);
  defectsById.set(id, details);
  return true;
}
```

This is the habit to leave the lesson with: before you write a structure to hold data, name the operations you will actually perform on it, and pick — or combine — the structures that make those specific operations cheap.

## Practice

You are building a small in-memory store for a test-data fixture generator. The fixture generator needs to hold a pool of sample user records used across many tests, and it must support these operations efficiently: add a new sample user, check whether a given email address is already used by a sample user (to avoid duplicate fixtures), retrieve a sample user's full record by email, and produce the full list of sample users in the order they were added (for a debug report).

1. For each of the four operations above, name which data structure from this lesson (array, object/map, set, or a combination) makes that operation cheap, and explain why in one sentence.
2. Write a JavaScript module-level setup, similar to the `defectLog` / `seenIds` / `defectsById` example, that holds the sample-user pool using your chosen structures.
3. Write an `addSampleUser(email, record)` function that returns `false` without changes if the email is already used, and otherwise stores the record and returns `true`.
4. Write a short comment above your code explaining what would go wrong — in terms of speed, not correctness — if you instead stored the entire pool as a single array and used `.find()` for every lookup.
