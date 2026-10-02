---
lesson_id: alg100-02
course_id: alg100
pathway: quality-assurance-software-engineer
title: Computational Thinking and Problem Decomposition
order: 2
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Decompose a problem into steps a computer can follow
---

## What computational thinking actually is

Computational thinking is the habit of turning a fuzzy goal into a sequence of steps precise enough that a machine — which has no judgment, no context, and no ability to guess what you meant — can carry them out. Most bugs are not typos. They are places where a person skipped a step in their own reasoning, and the code faithfully reproduced the gap. Decomposition is how you close that gap before you ever type a line of code: you break "validate this order" or "find this user" into a small, ordered list of operations, each one so plain that there is only one way to read it.

This matters to you specifically because decomposition and test design are the same skill wearing different clothes. When you decompose a problem, you are enumerating the paths through it: the normal path, the paths where an input is missing, the paths where a value is out of range. When you later design test cases for that same piece of code, you are walking the identical list, just asking "does the code actually do what step 3 says?" instead of "what should step 3 say?" A developer who cannot decompose a problem writes code you cannot test with confidence, because nobody — including them — can say what the code is supposed to do at each stage.

## Steps a computer can follow

A "step a computer can follow" has three properties: it names a concrete action, it operates on a specific piece of data, and it has an unambiguous stopping point. "Handle the login" is not a step. "Check whether the password field is empty" is. The discipline is to keep decomposing until every step reads like an instruction you could hand to someone who has never seen the problem before and who will do exactly, and only, what you wrote.

Take a problem stated the way a product manager might state it: "Given a list of orders, tell me the total revenue from orders that were actually paid." Decomposed:

1. Start a running total at zero.
2. Look at each order, one at a time.
3. Check whether that order's status is `"paid"`.
4. If it is, add its amount to the running total.
5. If it is not, skip it and move to the next order.
6. After every order has been checked, report the running total.

Notice what this list buys you before a single line of JavaScript exists. It already answers the question "what happens if the list is empty?" (the loop simply never runs, and the total stays zero). It already answers "what happens to an order with no status field?" — badly, actually, because step 3 assumes a status always exists, which is exactly the kind of gap a decomposition is supposed to surface. Catching that now, on paper, is far cheaper than catching it after the function ships and someone's report is wrong by one silent order.

## Pseudocode as a rehearsal for both code and tests

Pseudocode is decomposition written down in a form close enough to real syntax that translating it to JavaScript is mechanical, but loose enough that you are not yet fighting semicolons. Here is the revenue steps above as pseudocode:

```
function totalPaidRevenue(orders):
    total = 0
    for each order in orders:
        if order.status equals "paid":
            total = total + order.amount
    return total
```

And here is the direct translation into JavaScript:

```javascript
function totalPaidRevenue(orders) {
  let total = 0;
  for (const order of orders) {
    if (order.status === "paid") {
      total += order.amount;
    }
  }
  return total;
}
```

The translation step is almost boring — which is the point. If moving from pseudocode to code feels effortless, the decomposition was doing real work. If it feels like you are inventing new logic halfway through, the decomposition was too shallow and you skipped a step, the same way you would in reasoning about a bug.

## From decomposition to equivalence classes

Here is where this lesson turns explicitly toward testing. When you decompose a problem, you are implicitly sorting every possible input into groups that get treated the same way by your steps. For `totalPaidRevenue`, the decomposition above treats orders in exactly two groups: orders whose status is `"paid"`, and orders whose status is anything else. That is already an equivalence-class partition — a division of the input space into buckets where every member of a bucket should produce the same kind of outcome.

Once you can see the buckets, you can see the seams between them, and the seams are where tests earn their keep. What happens right at a boundary, like an order whose `amount` is `0`? What happens to a bucket the decomposition never named, like an order object missing the `status` property entirely, or an `orders` array that is not an array at all? A decomposition that stops at "orders that are paid, and orders that are not" has already told you, before any code runs, that "orders with a malformed status field" is an untested third bucket hiding inside your second one. This is the core move you will use for the rest of the course and in every testing task afterward: read a piece of logic, ask what buckets it is sorting inputs into, and treat every seam between buckets as a candidate for a test case.

## A second worked example: decomposing a validation function

Consider a signup form that needs a function to decide whether a chosen username is acceptable. Stated loosely: "usernames must be between 3 and 20 characters, and can only contain letters, numbers, and underscores." Decomposed into steps:

1. Check whether the username's length is at least 3.
2. Check whether the username's length is at most 20.
3. Check whether every character in the username is a letter, a number, or an underscore.
4. If all three checks pass, the username is valid; otherwise it is not.

```javascript
function isValidUsername(username) {
  if (username.length < 3) return false;
  if (username.length > 20) return false;
  if (!/^[A-Za-z0-9_]+$/.test(username)) return false;
  return true;
}
```

Walking the steps as buckets: too short, too long, right length but with a disallowed character, and right length with only allowed characters. Each of the four steps is one decision, made on one piece of data, with one unambiguous outcome — that is what makes this decomposition trustworthy, and it is also, not coincidentally, close to a ready-made list of test cases: a 2-character name, a 21-character name, a name with a hyphen in it, and a name that should simply pass.

## Practice

Decompose the following requirement into a numbered list of steps, in the same style as the two examples above, and then translate your decomposition into a JavaScript function.

**Requirement:** Given a list of student exam scores (numbers from 0 to 100), write a function `letterGrade(score)` that returns `"A"` for 90 and above, `"B"` for 80 up to but not including 90, `"C"` for 70 up to but not including 80, and `"F"` for anything below 70.

1. Write out your decomposition as a numbered list of plain-language steps, the way `totalPaidRevenue` and `isValidUsername` were decomposed above.
2. Translate the decomposition into a `letterGrade(score)` function in JavaScript.
3. List the "buckets" your decomposition sorts scores into, and identify the exact boundary value between each pair of adjacent buckets (for example, the boundary between an `"F"` and a `"C"`).
4. Without writing any test code yet, write down in plain language the input you would use to check each boundary you identified — this is the same list you will use to actually test the function once the course gets to that stage.
