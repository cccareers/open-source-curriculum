---
lesson_id: alg100-04
course_id: alg100
pathway: quality-assurance-software-engineer
title: Linear and Binary Search
order: 4
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Implement and compare linear and binary search
---

## Linear search: check everything, in order

Linear search is the search you would do with no assumptions about the data at all: start at the first element, compare it to what you're looking for, and if it doesn't match, move to the next one. Stop when you find a match or run out of elements.

```javascript
function linearSearch(items, target) {
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) {
      return i; // found it at this index
    }
  }
  return -1; // never found
}

const ids = ["DEF-101", "DEF-104", "DEF-102", "DEF-107"];
console.log(linearSearch(ids, "DEF-102")); // 2
console.log(linearSearch(ids, "DEF-999")); // -1
```

Linear search's entire advantage is that it makes no assumptions: the list can be in any order, of any length, and the function still works. Its cost scales directly with the size of the list — checking one more element in a list of 10 is nothing, but a list of 10 million means, in the worst case, 10 million comparisons before you know something isn't there. The worst case is also the common case for "confirm this value is absent," because absence can only be proven by checking everything.

## Binary search: exploit sorted order

Binary search trades that flexibility for speed, but it demands something in return: the data has to be sorted first. Given that guarantee, you don't need to check every element — you can eliminate half the remaining candidates with a single comparison, every time.

The idea: look at the middle element. If it's the target, you're done. If the target is smaller, the entire right half of the list can be discarded — a sorted list guarantees nothing bigger than the middle element lives on the left. If the target is larger, discard the left half instead. Repeat on whatever half remains.

```javascript
function binarySearch(sortedItems, target) {
  let low = 0;
  let high = sortedItems.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (sortedItems[mid] === target) {
      return mid;
    } else if (sortedItems[mid] < target) {
      low = mid + 1; // target must be to the right
    } else {
      high = mid - 1; // target must be to the left
    }
  }

  return -1; // low has crossed high — target isn't present
}

const sortedIds = ["DEF-101", "DEF-102", "DEF-104", "DEF-107", "DEF-110"];
console.log(binarySearch(sortedIds, "DEF-104")); // 2
console.log(binarySearch(sortedIds, "DEF-999")); // -1
```

Each pass through the loop throws away roughly half of what's left, so a list that would take a million comparisons to exhaust linearly takes about twenty with binary search. That difference is not a rounding error at scale — it is the difference between a lookup that's instant and one that's noticeably slow.

One trap hides in the example above. The `<` comparison on strings is alphabetical (character by character), not numeric. It works on `sortedIds` only because every id has the same number of digits. Once the tracker reaches `DEF-1000`, alphabetical order puts `"DEF-1000"` before `"DEF-101"`, and `"DEF-99" < "DEF-101"` is `false`. A binary search is only correct when the array is sorted by the *same* comparison the search uses. If the ids are sorted one way and searched another, the search quietly returns `-1` for ids that are present. If your ids vary in length, compare the numeric part (or zero-pad the ids, as in `DEF-0099`) for both the sort and the search.

## Tracing the steps

The picture below walks one search through a sorted array, showing where `low`, `mid`, and `high` land at each iteration as the candidate range halves.

![How binary search halves the candidate range on a sorted array, step by step, with the low, mid, and high pointers marked at each iteration](./img/binary-search-steps.png)

Trace it by hand once before trusting the code: at each step, `mid` is recomputed from the *current* `low` and `high`, not the original ones, which is exactly why the search range keeps shrinking instead of looping in place.

## Why the midpoint is where bugs hide

Binary search has a well-earned reputation as the textbook example of an algorithm that looks trivial and is easy to get subtly wrong, and almost every real bug in it lives in exactly one place: the boundary conditions around `mid`, `low`, and `high`. Get the loop condition wrong (`low < high` instead of `low <= high`) and the search misses the case where the target is the very last candidate remaining. Get the reassignment wrong (`low = mid` instead of `low = mid + 1`) and the loop can spin forever on a two-element range, because `mid` never moves past the element you just ruled out.

This is not a coincidence, and it is the reason this lesson exists in a course built around testing: the place in an algorithm where its internal boundaries sit is exactly the place a boundary-value test needs to probe. Boundary-value analysis — designing test cases around the edges of a range rather than its comfortable middle — is the testing-side mirror of the reasoning that makes binary search correct in the first place. If you can trace, by hand, what happens to `low`, `mid`, and `high` when the target is the first element, the last element, or absent entirely, you already have the exact test cases a good boundary-value analysis of this function would produce:

- target equal to the first element (`low` boundary)
- target equal to the last element (`high` boundary)
- target equal to the element exactly at the middle index
- target smaller than every element (search should terminate, not loop)
- target larger than every element (same)
- an empty array (`low` starts at `0`, `high` starts at `-1` — does the loop even run?)
- an array with exactly one element

Every one of those is a case where the *algorithm's* boundary condition and the *test's* boundary case are the same seam in the logic, approached from two directions.

## Comparing the two

| | Linear search | Binary search |
|---|---|---|
| Requires sorted input | No | Yes |
| Comparisons, worst case | Grows with the list size | Grows very slowly as the list grows |
| Works on any collection | Yes | Only ones you can index into and that are sorted |
| Simplicity | Very simple, hard to get wrong | Easy to get subtly wrong at the boundaries |

The practical decision is rarely "which is the better algorithm" in the abstract — it's "is this data sorted, and is it going to be searched enough times to justify sorting it and the extra care binary search demands." A one-off search through a short, unsorted list of defect ids should just use `linearSearch` or the array's own `.includes()`; a lookup table you'll query thousands of times over the life of a test run is worth sorting once and searching with `binarySearch` from then on.

## Practice

1. Implement `linearSearch` and `binarySearch` yourself (typing them out, not copying, builds the muscle memory for the boundary conditions) and confirm both return the correct index for a target present at the very first position and at the very last position of a sample array.
2. Deliberately introduce the off-by-one bug described above — change `low = mid + 1` to `low = mid` in your `binarySearch` — and run it against a two-element sorted array searching for the element at index 1. Describe what happens and why.
3. Using the seven boundary cases listed in this lesson, write out (in comments, no test framework needed yet) the exact input array and target for each case, and what the correct return value should be.
4. Given a sorted array of 1,000,000 defect ids, estimate — without running code — roughly how many comparisons `linearSearch` would need in the worst case versus `binarySearch`, and explain your reasoning in a sentence or two.

## Check your understanding

1. What single precondition must hold before `binarySearch` can be trusted, and what happens if it doesn't?
2. On an empty array, `high` starts at `-1`. Does the `while (low <= high)` loop body run? What does the function return?
3. Roughly how many comparisons does `binarySearch` need, at most, on a sorted list of 1,000 items?

**Answers:** (1) The array must be sorted by the same comparison the search uses. If it isn't, the search can discard the half that holds the target and return `-1` for a value that is present. It won't crash, so the bug is easy to miss. (2) No. `0 <= -1` is false, so the loop never runs and the function returns `-1`. (3) About 10, because 2 to the 10th power is 1,024, and each comparison halves the remaining range.
