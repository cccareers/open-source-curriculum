---
lesson_id: sn250-02
course_id: sn250
pathway: servicenow-implementation-specialist
title: JavaScript Fundamentals for the Platform
order: 2
kind: lesson
competency_ids:
  - D7-S1-C01
objectives:
  - Write JavaScript variables, control flow, functions, objects, and arrays that run on the ServiceNow platform
---

## Why a language lesson comes first

Every server-side script you will write in this course — business rules, script includes, scheduled jobs, Scripted REST APIs — is JavaScript. The platform gives you objects to work with, but it does not write the loops, the conditions, or the functions that hold them together. That is your job, and it is the part that most often breaks.

This lesson is deliberately about the language, not about records. You will use exactly one platform call, `gs.info()`, as a way to print things and see what happened. Everything else is core JavaScript that would behave the same in any engine. When the next lesson introduces GlideRecord, you want the only new thing on the screen to be GlideRecord.

## Where your code runs

The platform executes JavaScript in two very different places.

**On the server**, inside the instance, with full access to the database. Business rules, script includes, scheduled jobs, flow action scripts, and Scripted REST API resources all run here. Server-side script is where the real work happens in this course.

**In the browser**, in the user's session, with access to the form on screen and no direct access to the database. Client scripts and UI policy scripts run here. Lesson 5 covers them.

The server-side engine runs in one of two modes. Scripts that live in the **global** scope run under a long-standing legacy mode that supports roughly the ECMAScript 5 language: `var`, `function`, and the ES5 array methods, but not `let`, `const`, arrow functions, or template literals. Scripts inside a **scoped application** can opt into a modern engine that supports current JavaScript syntax. Because you cannot always predict which scope a snippet will end up in, this lesson teaches the ES5-safe form first and flags the modern equivalent when there is one. Code written in the ES5-safe style runs correctly everywhere on the platform; code written with modern syntax will throw a syntax error the moment someone pastes it into a global business rule.

The place to experiment is **Scripts - Background** (in the platform navigator, under System Definition). It runs a script on the server immediately and prints whatever you send to `gs.info()`. Use a sub-production instance. A background script has no undo.

```javascript
gs.info('hello from the server');
gs.info('two plus two is ' + (2 + 2));
```

## Statements, comments, and the semicolon

A JavaScript program is a sequence of statements, each ending in a semicolon. The language will insert semicolons for you in most cases, and relying on that is how people produce bugs that only appear after a script is minified or reformatted. Type the semicolons.

```javascript
// a single-line comment

/*
  a block comment — use these for the header of a script
  explaining what it does and why it exists
*/

var greeting = 'hello';
gs.info(greeting);
```

## Variables

A variable is a name bound to a value. In ES5-safe code you declare it with `var`:

```javascript
var ticketCount = 0;
var assignee = 'abel.tuter';
var isEscalated = false;
```

`var` declarations are **function-scoped**, not block-scoped. That surprises people:

```javascript
function report() {
  if (true) {
    var inner = 'visible outside the if';
  }
  gs.info(inner); // works — prints the value
}
```

They are also **hoisted**: the declaration is moved to the top of the function, though the assignment stays where you wrote it. So reading a `var` before its assignment gives you `undefined` rather than an error. The practical rule is to declare every variable at the top of the function it belongs to, which makes the hoisting invisible because you have done it by hand.

In a scoped application that supports modern syntax, prefer `let` (block-scoped, reassignable) and `const` (block-scoped, not reassignable):

```javascript
const MAX_RETRIES = 3;
let attempts = 0;
```

Name variables for what they hold. `gr`, `x`, and `temp` are the three names most likely to be in a script nobody can maintain. `incidentCount`, `openIncidents`, and `escalationThreshold` cost you three seconds of typing and save a successor twenty minutes.

## Types and the string problem

JavaScript has a small set of primitive types — string, number, boolean, `null`, `undefined` — plus objects (which include arrays and functions). `typeof` tells you which one you have.

```javascript
gs.info(typeof 'abel');   // string
gs.info(typeof 42);       // number
gs.info(typeof true);     // boolean
gs.info(typeof undefined);// undefined
gs.info(typeof {});       // object
gs.info(typeof []);       // object  (arrays report as object)
gs.info(typeof null);     // object  (a famous language wart)
```

The single most important type fact on this platform: **values you read out of a record arrive as strings**, even when the field is a number, a boolean, or a reference. That means the following is a real bug you will write at least once:

```javascript
var priority = '2';        // as if read from a record
if (priority + 1 === 3) {
  gs.info('never printed'); // '2' + 1 is the string '21'
}
gs.info(parseInt(priority, 10) + 1); // 3 — convert first
```

Convert deliberately. `parseInt(value, 10)` for whole numbers (always pass the radix `10`), `parseFloat(value)` for decimals, and an explicit comparison such as `value === 'true'` for booleans that arrived as text.

## Truthiness, equality, and coercion

Every value is either truthy or falsy when used in a condition. The falsy values are `false`, `0`, `''` (empty string), `null`, `undefined`, and `NaN`. Everything else is truthy — including the string `'false'` and the string `'0'`, which is another reason string-typed record data bites.

JavaScript has two equality operators. `==` converts types before comparing; `===` does not.

```javascript
gs.info(1 == '1');   // true  — coerced
gs.info(1 === '1');  // false — different types
gs.info(0 == '');    // true  — surprising and rarely what you meant
gs.info(null == undefined); // true
```

Use `===` and `!==` everywhere. If you need a loose comparison, write the conversion out so the next reader can see it.

## Operators and building strings

Arithmetic is conventional: `+ - * / %`, plus `++` and `--`. The `+` operator also concatenates strings, and if either operand is a string the whole expression becomes a string. Compound assignment (`+=`, `-=`) works as expected.

Logical operators are `&&` (and), `||` (or), `!` (not). Both `&&` and `||` short-circuit — they stop evaluating as soon as the answer is known — which gives you the common default-value idiom:

```javascript
var shortDescription = input || 'No description provided';
```

In ES5-safe code, build strings with concatenation:

```javascript
gs.info('Assigned ' + count + ' tasks to ' + assignee + '.');
```

In a modern-syntax scoped application you can use template literals instead, with backticks and `${}` placeholders. They read better; just remember they are not available globally.

## Working with strings

More platform script manipulates strings than does anything else, because every field value arrives as one. Strings are immutable — every method returns a *new* string and leaves the original alone, which is the source of the single most common string bug:

```javascript
var name = '  Abel Tuter  ';
name.trim();          // returns the trimmed value and throws it away
gs.info('[' + name + ']');   // still '  Abel Tuter  '

name = name.trim();   // correct — assign the result
gs.info('[' + name + ']');   // '[Abel Tuter]'
```

The methods you will reach for:

| Method | Returns |
| --- | --- |
| `length` (a property, no parentheses) | number of characters |
| `toUpperCase()` / `toLowerCase()` | a case-converted copy |
| `trim()` | a copy with leading/trailing whitespace removed |
| `indexOf(sub)` | position of `sub`, or `-1` |
| `substring(start, end)` | the characters between two positions |
| `slice(start, end)` | the same, but accepts negative positions |
| `replace(a, b)` | a copy with the **first** `a` replaced |
| `split(sep)` | an array |
| `charAt(i)` | one character |

Two traps. `replace` with a plain string replaces only the first occurrence — to replace them all you need a regular expression with the global flag, `text.replace(/,/g, ';')`. And case-insensitive comparison is not built in: lower-case both sides yourself.

```javascript
function equalsIgnoreCase(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase();
}
```

The `String(value || '')` wrapper in that function is a habit worth forming. It survives being handed `null`, `undefined`, or a number, and every one of those will happen.

Regular expressions get their own mention because they are how you validate a format. A pattern between slashes, `.test(value)` for a yes/no answer:

```javascript
var ticket = /^INC\d{7}$/;          // INC followed by exactly seven digits
gs.info(ticket.test('INC0010023')); // true
gs.info(ticket.test('INC123'));     // false

var email = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
gs.info(email.test('abel@example.com')); // true
```

Keep patterns short and comment what they mean in English. A regular expression nobody can read is a bug waiting for its moment.

## Working with numbers

There is one number type. Integers and decimals are the same thing, which means decimal arithmetic is approximate — `0.1 + 0.2` is not exactly `0.3`. For currency, work in whole units (cents, pence) or round at the point of display.

```javascript
gs.info(parseInt('42px', 10));   // 42  — stops at the first non-digit
gs.info(parseInt('px42', 10));   // NaN — does not start with a digit
gs.info(parseFloat('3.75'));     // 3.75
gs.info(Number('42'));           // 42  — stricter: the whole string must be a number
gs.info(Number('42px'));         // NaN

gs.info(isNaN(parseInt('abc', 10)));  // true — the only safe way to test for NaN
gs.info((3.14159).toFixed(2));        // '3.14' — a STRING, not a number

gs.info(Math.round(4.5));   // 5
gs.info(Math.floor(4.9));   // 4
gs.info(Math.ceil(4.1));    // 5
gs.info(Math.max(3, 9, 1)); // 9
gs.info(Math.abs(-7));      // 7
```

`NaN` — "not a number" — is what you get from failed arithmetic, and it is contagious: any expression containing it produces `NaN`. It is also the one value not equal to itself, so `x === NaN` is always false and `isNaN(x)` is the test. When a calculation produces `NaN` somewhere far downstream, the cause is nearly always a `parseInt` on an empty field near the start.

## Control flow

`if` / `else if` / `else` is the workhorse. Always use braces, even for a one-line body — a braceless `if` is where a later edit goes wrong.

```javascript
function priorityLabel(priority) {
  var p = parseInt(priority, 10);
  if (p === 1) {
    return 'Critical';
  } else if (p === 2) {
    return 'High';
  } else if (p === 3) {
    return 'Moderate';
  }
  return 'Low';
}
```

`switch` is clearer when you are matching one value against many fixed options. Every case needs a `break` or execution falls through to the next case — occasionally useful, usually a bug.

```javascript
function slaHours(priority) {
  switch (priority) {
    case '1': return 4;
    case '2': return 8;
    case '3': return 24;
    default:  return 72;
  }
}
```

The ternary operator is a compact `if`/`else` that produces a value. Use it for a single simple choice and never nest it.

```javascript
var state = isEscalated ? 'Escalated' : 'Normal';
```

## Loops

The classic counting loop:

```javascript
var names = ['abel', 'beth', 'carol'];
for (var i = 0; i < names.length; i++) {
  gs.info('name ' + i + ' is ' + names[i]);
}
```

`while` runs while a condition holds, and `do...while` runs its body once before testing. Both need an escape route — every loop you write should have something inside it that can eventually make the condition false. An infinite loop in a background script will consume a worker thread until the transaction is cancelled.

```javascript
var attempts = 0;
while (attempts < 3) {
  attempts++;
}
```

`break` leaves the loop immediately; `continue` skips to the next iteration.

`for...in` iterates the **keys of an object**. Do not use it on an array — the keys come back as strings, and the order is not guaranteed.

```javascript
var counts = { critical: 2, high: 5, low: 11 };
for (var key in counts) {
  if (counts.hasOwnProperty(key)) {
    gs.info(key + ' = ' + counts[key]);
  }
}
```

The `hasOwnProperty` guard keeps inherited properties out of the loop. In modern-syntax scopes, `for...of` iterates array *values* directly and needs no guard.

## Functions

A function packages a piece of behaviour behind a name, takes inputs, and returns a result. Small functions with clear names are the difference between a script include somebody reuses and one they rewrite.

```javascript
function fullName(first, last) {
  if (!first && !last) {
    return '';
  }
  return (first + ' ' + last).trim();
}

gs.info(fullName('Abel', 'Tuter')); // Abel Tuter
```

Points that matter in practice:

- A function that does not `return` anything returns `undefined`.
- Missing arguments are `undefined`, not an error. Default them at the top: `if (limit === undefined) { limit = 10; }`.
- Extra arguments are ignored, and are also available in the `arguments` object.
- Functions are values. You can store one in a variable, pass it to another function, and return it — that is what a **callback** is.

```javascript
function each(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i], i);
  }
}

each(['a', 'b'], function (value, index) {
  gs.info(index + ': ' + value);
});
```

A function also remembers the variables that were in scope where it was defined. That is a **closure**, and it is how you build a counter or hide a private helper:

```javascript
function makeCounter() {
  var count = 0;
  return function () {
    count++;
    return count;
  };
}

var next = makeCounter();
gs.info(next()); // 1
gs.info(next()); // 2
```

Closures are also the basis of the module pattern you will meet in the script include lesson, where a function returns an object of public methods while keeping its helpers private.

## The immediately-invoked function

You will see this wrapper on almost every platform script, including the business rules and flow actions later in this course:

```javascript
(function () {
  var count = 0;
  // ...work...
})();
```

A function is defined and called in the same expression. Nothing inside it is visible outside, which matters because several platform script contexts share a namespace: two background scripts, or two rules running in the same transaction, can otherwise collide on a variable called `gr`.

The pattern also lets you pass in configuration and read the call site as documentation:

```javascript
(function run(dryRun, limit) {
  gs.info('dryRun=' + dryRun + ' limit=' + limit);
  // ...
})(true, 100);
```

Adopt it for anything longer than a few lines. It costs two lines and removes an entire category of surprise.

## Objects

An object is an unordered bag of key/value pairs. It is the shape you reach for whenever a thing has several named attributes.

```javascript
var summary = {
  number: 'INC0010023',
  priority: 2,
  assignee: 'abel.tuter',
  tags: ['network', 'urgent']
};

gs.info(summary.number);       // dot access
gs.info(summary['priority']);  // bracket access — required for dynamic keys

summary.state = 'In Progress'; // add a property
delete summary.assignee;       // remove one
gs.info(summary.missing);      // undefined, not an error
```

Values can be anything, including other objects and functions, so objects nest to whatever depth your data needs. Guard nested access, because reading a property *of* `undefined` throws:

```javascript
if (payload && payload.result && payload.result.id) {
  gs.info(payload.result.id);
}
```

`JSON.stringify(object)` turns an object into a string, and `JSON.parse(text)` turns a string back into an object. You will use both constantly once integrations appear.

```javascript
var text = JSON.stringify(summary);
gs.info(text);
var back = JSON.parse(text);
gs.info(back.priority);
```

`JSON.stringify` is also the fastest way to see what is inside something in a log line, because concatenating an object into a string only ever gives you `[object Object]`.

## Arrays

An array is an ordered list, indexed from zero, with a `length` property.

```javascript
var queue = ['first', 'second', 'third'];
gs.info(queue.length);   // 3
gs.info(queue[0]);       // first
gs.info(queue[queue.length - 1]); // third — the last element
```

The methods worth memorising:

| Method | Does |
| --- | --- |
| `push(v)` / `pop()` | add / remove at the end |
| `unshift(v)` / `shift()` | add / remove at the front |
| `indexOf(v)` | position of a value, or `-1` if absent |
| `slice(a, b)` | a copy of part of the array; does not modify it |
| `splice(i, n)` | removes `n` items at `i`; **does** modify it |
| `join(sep)` | array to string |
| `split(sep)` | string to array (a string method) |
| `sort()` | sorts in place, as strings unless you pass a comparator |

`indexOf` gives you a readable membership test, and `join`/`split` are how you move between a comma-separated field value and a list you can loop over:

```javascript
var watchList = 'abel,beth,carol';
var watchers = watchList.split(',');
if (watchers.indexOf('beth') !== -1) {
  gs.info('beth is watching');
}
watchers.push('dave');
gs.info(watchers.join(','));
```

The ES5 iteration methods are available in both engine modes and make loops much easier to read:

```javascript
var priorities = [1, 3, 2, 1, 4];

priorities.forEach(function (p) { gs.info(p); });

var doubled = priorities.map(function (p) { return p * 2; });

var urgent = priorities.filter(function (p) { return p <= 2; });

var total = priorities.reduce(function (sum, p) { return sum + p; }, 0);

gs.info(urgent.join(',') + ' / total ' + total);
```

`map` returns a new array of the same length, `filter` returns a shorter one, and `reduce` collapses the array to a single value. None of the three modify the original.

### Copying, and the thing that surprises everyone

Primitives are copied by **value**; objects and arrays are copied by **reference**. Assigning an object to a second variable does not duplicate it — both names point at the same thing.

```javascript
var a = { count: 1 };
var b = a;
b.count = 99;
gs.info(a.count);   // 99 — one object, two names

var list = [1, 2, 3];
var alsoList = list;
alsoList.push(4);
gs.info(list.length); // 4

var copy = list.slice();  // a real copy of an array
copy.push(5);
gs.info(list.length);     // still 4
```

The same rule explains why a function that modifies an object it was passed changes the caller's object, while one that reassigns a number parameter changes nothing outside itself. When you want a genuine copy of a plain object, `JSON.parse(JSON.stringify(obj))` is the blunt, dependable way to get one.

## Errors

A script that throws in a business rule can abort a user's save. Handle what you can predict and let the rest fail loudly rather than silently.

```javascript
function parsePayload(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    gs.error('Could not parse payload: ' + e.message);
    return null;
  }
}
```

`throw new Error('message')` raises your own error, which is the right move when a function is called with arguments it cannot work with. What you must not do is wrap an entire script in a `try` with an empty `catch`: that converts a visible failure into a silent one, and someone will spend a day finding it.

## Style, and writing script somebody else can fix

Platform script is read far more often than it is written, usually by someone under time pressure who did not write it. A few habits cost nothing and change how maintainable your work is.

**Declare intent at the top.** Three lines of block comment saying what the script does, why it exists, and who asked for it. The "why" is the part nobody can reconstruct later.

**One job per function.** If the function name needs "and" in it, it is two functions.

**Return early.** A guard clause at the top — `if (!record) { return ''; }` — keeps the body of the function at one level of indentation. Deeply nested conditions are where logic errors hide.

**Name booleans as questions.** `isActive`, `hasApproval`, `canClose`. Then `if (canClose)` reads as English.

**Do not reuse a variable for two purposes.** A variable called `result` that holds a count, then a string, then an array, is three variables wearing one name.

**Prefer explicit over clever.** The compact version of an expression is not the better version if the reader has to work out what it does. You are not being paid by the character.

**Format consistently.** Two-space or four-space indentation, one statement per line, braces on the same line as the statement. Which convention hardly matters; consistency does.

Finally, the pitfalls from this lesson collected as a checklist, because you will hit every one of them:

- Assuming a value is a number when it arrived as a string.
- Using `==` where `===` was meant.
- Calling a string method and not assigning the result.
- Treating `'false'` or `'0'` as falsy — both are truthy strings.
- Reading a property of something that is `undefined`.
- Using `for...in` on an array.
- Forgetting that `NaN` is not equal to anything, including itself.
- Writing a loop with no way for its condition to become false.

## Worked example: a small reporting helper

Here is everything in this lesson in one script. It takes a list of plain objects that stand in for task records, groups them by assignee, and prints a summary. Run it in a background script and read it line by line.

```javascript
var tasks = [
  { number: 'INC001', assignee: 'abel',  priority: '1', active: true },
  { number: 'INC002', assignee: 'beth',  priority: '3', active: true },
  { number: 'INC003', assignee: 'abel',  priority: '2', active: false },
  { number: 'INC004', assignee: 'carol', priority: '1', active: true },
  { number: 'INC005', assignee: 'abel',  priority: '4', active: true }
];

function isUrgent(task) {
  return parseInt(task.priority, 10) <= 2;
}

function groupByAssignee(list) {
  var groups = {};
  list.forEach(function (task) {
    var who = task.assignee;
    if (!groups[who]) {
      groups[who] = { total: 0, urgent: 0, numbers: [] };
    }
    groups[who].total++;
    groups[who].numbers.push(task.number);
    if (isUrgent(task)) {
      groups[who].urgent++;
    }
  });
  return groups;
}

function report(list) {
  var activeOnly = list.filter(function (task) { return task.active === true; });
  var groups = groupByAssignee(activeOnly);
  var lines = [];

  for (var who in groups) {
    if (groups.hasOwnProperty(who)) {
      var g = groups[who];
      lines.push(who + ': ' + g.total + ' active (' + g.urgent + ' urgent) [' + g.numbers.join(' ') + ']');
    }
  }

  lines.sort();
  return lines.join('\n');
}

gs.info('\n' + report(tasks));
```

Trace what each piece contributes. `filter` narrows the list without touching the original. `groupByAssignee` builds an object whose keys are discovered at runtime, which is why it uses bracket access. `parseInt` with a radix protects the comparison from string-typed priorities. `forEach` replaces a counting loop that had nothing to count. And the final `sort` on an array of strings is safe precisely because they are strings.

## Practice

Work in a sub-production instance, in Scripts - Background. Write ES5-safe code — `var` and `function` only — so your work runs in any scope.

1. **Types and conversion.** Declare `var raw = '07';`. Print `raw + 3`, `parseInt(raw, 10) + 3`, `raw == 7`, and `raw === 7`. Write a one-line comment beside each explaining the result in your own words.

2. **A function with a guard.** Write `describeTask(number, priority)` that returns a string like `INC0010023 is High priority`. It must return `'Unknown task'` when `number` is missing or empty, and must treat a priority that is not `1`, `2`, or `3` as `Low`. Call it five times, including once with no arguments at all, and confirm nothing throws.

3. **Strings.** Write `normalizeName(raw)` that takes something like `'  aBEL   tuter '`, trims it, collapses the internal whitespace to a single space, and returns it in title case (`Abel Tuter`). It must return `''` for `null`, `undefined`, and an empty string. Prove that it does by calling it with all three.

4. **Numbers and NaN.** Write `safeInt(value, fallback)` that returns the whole-number value of `value`, or `fallback` when the conversion produces `NaN`. Test it with `'7'`, `'7px'`, `'px7'`, `''`, `null`, and `3.9`, and write the result of each in a comment.

5. **A pattern.** Write `isTicketNumber(text)` using a regular expression that accepts `INC` followed by exactly seven digits and rejects everything else, including lower case and a correct prefix with six or eight digits. Add a one-line comment explaining the pattern in English.

6. **Loops and arrays.** Starting from the string `'network,urgent,after-hours,network'`, split it into an array, remove duplicates into a new array using `indexOf`, sort the result, and print it as a comma-separated string. Do it once with a counting `for` loop and once with `forEach`, and keep both versions.

7. **Objects.** Build an array of at least six plain objects representing change requests, each with `number`, `risk` (`'high'`, `'moderate'`, `'low'`), and `approved` (boolean). Write `countByRisk(list)` that returns an object like `{ high: 2, moderate: 3, low: 1 }`, counting only approved changes. Print it with `JSON.stringify`.

8. **Reduce.** Using the same list, use `reduce` to produce a single string listing the numbers of the high-risk changes, separated by `' | '`. Do not use `map`, `filter`, or a `for` loop.

9. **Fail well.** Write `safeParse(text)` that returns the parsed object, or `null` after logging with `gs.error` if the text is not valid JSON. Call it with `'{"a":1}'` and with `'{a:1}'`, and show that the script continues after the bad call.

10. **Read your own bug.** Deliberately write a script with an infinite `while` loop, but put a counter and a `break` at 1000 iterations in it from the start. Then write a short comment explaining what would have happened on a production instance without that guard.
