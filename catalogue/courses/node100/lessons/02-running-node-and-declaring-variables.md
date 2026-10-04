---
lesson_id: node100-02
course_id: node100
pathway: quality-assurance-software-engineer
title: Running Node and Declaring Variables
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Run JavaScript with Node and declare variables with the right scope
---

## Why a QA engineer needs Node, not just a browser

Everything you have written in JavaScript so far probably ran inside a browser tab, reacting to clicks and page loads. Node runs the exact same language, but on its own, from a terminal, with no page around it. That distinction matters for the work ahead of you: as a QA engineer you will rarely be testing things by clicking around — you will be writing small scripts that run a program, check its output, and report pass or fail, all without a human watching. Node is the runtime those scripts live in.

Every lesson from here forward asks you to write code that will eventually be *tested*, either by you in lesson 07 or by tooling later in your career. That changes how you should think about even the smallest line of code. A script that only ever runs once, by hand, on your machine, can get away with sloppy habits. A script meant to be checked automatically cannot — it needs predictable inputs, predictable outputs, and variables that mean exactly one thing for as long as they exist.

## Running your first script

Node ships as a command-line program. Once it is installed, you can run any `.js` file by passing its path to the `node` command:

```bash
node hello.js
```

Given a file `hello.js` containing:

```javascript
console.log("Hello from Node");
```

running that command prints `Hello from Node` to your terminal and exits. There is no browser, no HTML page, no DOM — just your code and the terminal it prints to. This is the shape almost every tool you build as a QA engineer will take: a script, run from the command line, that does something and reports what happened.

Node also has an interactive mode called the REPL (Read-Eval-Print Loop). Typing `node` with no file opens a prompt where you can type one line of JavaScript at a time and see its result immediately:

```bash
$ node
> 2 + 2
4
> "test" + "ing"
'testing'
```

The REPL is useful for quick experiments — checking how an expression behaves before you commit it to a file — but it is not where real scripts live. Anything you want to run again, share, or eventually test belongs in a `.js` file.

## Declaring variables: `let`, `const`, and why `var` is off the table

JavaScript gives you three keywords for declaring a variable: `var`, `let`, and `const`. This course uses only `let` and `const`. `var` is still legal JavaScript, and you will see it in old code, but it has a scoping rule — it ignores block boundaries like `{ }` and "leaks" out of `if` statements and loops — that produces exactly the kind of surprising, hard-to-predict behavior a QA engineer's code cannot afford. Predictable scope is not a style preference here; it is a testability requirement, because a variable that behaves differently depending on where you read it is a variable you cannot write a reliable check against.

`const` declares a variable whose binding cannot be reassigned after it is set:

```javascript
const maxRetries = 3;
maxRetries = 5; // TypeError: Assignment to constant variable.
```

`let` declares a variable that can be reassigned:

```javascript
let attemptCount = 0;
attemptCount = attemptCount + 1; // fine
```

Default to `const`. Reach for `let` only when you know the value has to change — a counter, an accumulator, something being reassigned in a loop. This habit alone eliminates a whole category of bugs: a value that changes only where you can see it, because you deliberately chose the keyword that allows it to.

## Block scope: what `{ }` actually means

`let` and `const` are **block-scoped**: a variable declared inside a pair of curly braces `{ }` — whether that is an `if` block, a loop, or a function body — exists only inside that block. Once you cross the closing `}`, the variable is gone.

```javascript
if (true) {
  const message = "inside the block";
  console.log(message); // "inside the block"
}

console.log(message); // ReferenceError: message is not defined
```

That error is not a bug in your code — it is the language protecting you. A variable declared for one purpose, inside one block, cannot be accidentally read or reused somewhere else. Compare that to `var`, which would let `message` leak out of the `if` block entirely, silently available (and silently wrong) later in the file.

Block scope also means each pass through a loop can get its own independent variable:

```javascript
const values = [10, 20, 30];

for (let i = 0; i < values.length; i = i + 1) {
  const doubled = values[i] * 2;
  console.log(doubled);
}

// i and doubled do not exist out here
```

`i` and `doubled` are freshly scoped to each iteration of the loop's block. You will lean on this constantly once you start writing loops in the next lesson.

## Naming variables for a reader who is checking your work

A variable name is documentation. When you write `const x = getUserCount();`, the next person reading the code — including future you, running an assertion against this function — has to go read the function to know what `x` means. Compare that to `const userCount = getUserCount();`: the name alone tells a reader (or a test) what value they should expect back.

This matters more in QA-adjacent code than almost anywhere else, because the whole point of a test script is that someone other than the original author needs to understand quickly what a piece of code is supposed to produce. Favor full words over abbreviations, and name a variable after what it *holds*, not how you plan to use it:

```javascript
// Harder to verify at a glance
const d = 86400;

// Immediately checkable
const secondsPerDay = 86400;
```

## Primitive types you will declare constantly

Node gives you the same primitive types you already know from browser JavaScript: strings, numbers, booleans, `null`, and `undefined`. You will declare all of them with `let` or `const`:

```javascript
const toolName = "log-checker";      // string
const version = 2;                    // number
const isEnabled = true;               // boolean
let lastError = null;                 // null: explicitly "no value yet"
let result;                           // undefined: declared, not yet assigned
```

`null` and `undefined` look similar but mean different things, and the difference matters once you start writing checks against these values. `undefined` means "nothing has been assigned here" — it is the state of a variable you declared but haven't set. `null` means "a value was deliberately set to represent nothing" — you chose it on purpose, usually to say "no result yet" or "not applicable." Getting into the habit of using `null` deliberately, rather than leaving things `undefined` by accident, will make your later assertion scripts far easier to write, because you will always know which one to expect.

## Practice

Create a file named `variables.js` and write the following, running it with `node variables.js` after each step to check your work:

1. Declare a `const` named `toolName` holding the string `"line-counter"`, and a `const` named `version` holding the number `1`. Log both with `console.log`.
2. Declare a `let` named `linesProcessed` initialized to `0`. Write a small block (an `if (true) { }` is fine for this exercise) that declares a `const` named `batchSize` set to `50` *inside* the block, and reassigns `linesProcessed` to `linesProcessed + batchSize` inside that same block. Log `linesProcessed` after the block closes.
3. Immediately after the block, try to `console.log(batchSize)` and run the file. Read the exact error Node prints, and add a one-line comment above that log explaining, in your own words, why the error happens.
4. Declare a `let` named `lastResult` and set it to `null` to represent "no result computed yet." Reassign it to the number `42` and log it. Add a comment noting the difference in meaning between what `lastResult` held before and after the reassignment.

## Check your understanding

1. You write `const retries = 3;` and later `retries = retries + 1;`. What happens when you run the file, and which keyword should you have used?
2. A variable is declared with `let` inside an `if` block. Can code after the block's closing `}` read it? Why does that protect you?
3. Your function returns `undefined` for one input and `null` for another. Which one suggests a deliberate "no result" and which suggests a value that was never assigned?

*Answers:* (1) Node throws `TypeError: Assignment to constant variable.`; use `let` because the value has to change. (2) No: `let` and `const` are block-scoped, so the variable cannot leak out and be misread later. (3) `null` is the deliberate "nothing"; `undefined` usually means nothing was ever assigned, which is often a bug worth reporting.
