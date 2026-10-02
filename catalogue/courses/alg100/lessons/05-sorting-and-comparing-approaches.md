---
lesson_id: alg100-05
course_id: alg100
pathway: quality-assurance-software-engineer
title: Sorting and Comparing Approaches
order: 5
kind: lesson
competency_ids:
  - D5-S1-C02
objectives:
  - Implement a sort and explain what it costs
---

## Why sorting is worth implementing by hand

JavaScript's built-in `.sort()` will sort an array for you, and in real code you should almost always use it rather than hand-rolling your own. This lesson has you implement two sorting algorithms anyway, because the goal isn't to produce a sort you'll ship — it's to build the habit of looking at an algorithm and asking "how does its cost grow as the input grows," which is the single most useful question you can ask about any piece of code you're about to test. A function that's correct on ten items and unusably slow on ten thousand is still a defect; you just won't catch it by staring at the code, only by reasoning about its cost or measuring it.

Two sorting algorithms make a good pair for this because they sit at opposite ends of the cost spectrum and get there by fundamentally different strategies: bubble sort compares neighbors repeatedly, and merge sort splits the problem in half and conquers each half separately.

## A quadratic sort: bubble sort

Bubble sort's idea is the simplest one available: walk the array comparing each pair of neighbors, swapping them if they're out of order, and repeat the whole walk until a pass finishes with no swaps at all.

```javascript
function bubbleSort(items) {
  const arr = [...items]; // don't mutate the caller's array
  let swapped = true;

  while (swapped) {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
  }

  return arr;
}

console.log(bubbleSort([5, 3, 8, 1, 9, 2]));
// [1, 2, 3, 5, 8, 9]
```

Trace what happens on a 6-element array: the first full pass compares 5 pairs and can move the largest remaining value all the way to the end. The second pass compares 5 pairs again (a small optimization would shrink this, but the version above doesn't bother) to place the next-largest value. In the worst case — an array sorted backwards — this takes roughly one pass per element, and each pass costs roughly one comparison per element, so the total work grows with the *square* of the array's size. Double the input from 1,000 elements to 2,000, and the work roughly quadruples, not doubles. That's what "quadratic cost" means in practice: the algorithm gets disproportionately slower as the input grows, and the effect compounds — a tenfold increase in input size means roughly a hundredfold increase in work.

## A divide-and-conquer sort: merge sort

Merge sort takes a completely different approach: instead of repeatedly comparing neighbors across the whole array, it splits the array in half, sorts each half (by calling itself), and then merges the two already-sorted halves back together in a single pass.

```javascript
function mergeSort(items) {
  if (items.length <= 1) {
    return items; // an array of 0 or 1 elements is already sorted
  }

  const mid = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, mid));
  const right = mergeSort(items.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // one side may still have leftover elements — append them as-is,
  // they're already sorted relative to each other
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}

console.log(mergeSort([5, 3, 8, 1, 9, 2]));
// [1, 2, 3, 5, 8, 9]
```

The `merge` step is the part worth tracing by hand: given two already-sorted arrays, it only ever needs to look at the front of each one to know which value comes next overall, so merging two sorted halves costs an amount of work proportional to their combined length — no re-scanning, no re-comparing values it's already placed. The `mergeSort` function halves the problem at every level of recursion (6 elements becomes two runs of 3, which become runs of 1 or 2), and there are roughly as many halving levels as there are times you can divide the array size by 2 before reaching 1. Multiplying "work per level" (proportional to the array size) by "number of levels" (proportional to how many times you can halve the array) gives a total cost that grows much more gently than bubble sort's — commonly written as "n log n" rather than "n squared." Doubling the input roughly doubles the work, plus a little extra for the one additional halving level, instead of roughly quadrupling it.

## Comparing the two approaches

| | Bubble sort | Merge sort |
|---|---|---|
| Strategy | Repeatedly compare and swap neighbors | Split in half, sort each half, merge |
| Cost as input grows | Grows with the square of the size | Grows only slightly faster than the size itself |
| Extra memory used | None beyond the array itself | Needs extra arrays for the halves and the merge |
| Simplicity to trace by hand | Very easy | A little harder — recursion plus a merge step |

Neither is universally "better." Bubble sort's cost makes it a poor choice for anything but small arrays or teaching, but its simplicity means there's almost nowhere for a bug to hide. Merge sort scales far better but has more moving parts — the split point, the recursive base case, the merge's two leftover-appending loops — and each of those moving parts is a place where an off-by-one or a missed leftover case could produce a subtly wrong result on a specific shape of input, like an array with duplicate values or an odd number of elements.

## What "cost" buys you as a developer

Being able to look at `bubbleSort` and say "this is going to struggle past a few thousand elements" before you ever run it, purely from reading the nested loop, is the same skill as reading a database query and predicting it will be slow before you run it against production-sized data. It lets you make a deliberate tradeoff — bubble sort is completely fine for sorting the six columns of a settings panel, and completely wrong for sorting a defect table with two hundred thousand rows — instead of discovering the cost the hard way when something that worked fine in a demo grinds to a halt in front of a real dataset.

## Practice

1. Implement `bubbleSort` and `mergeSort` yourself by typing them out, then run both on the same array of at least 10 unsorted numbers and confirm they produce identical, correctly sorted output.
2. Add a counter that increments every time your `bubbleSort` performs a comparison (the `arr[i] > arr[i + 1]` check), and run it on three inputs of increasing size — for example arrays of length 10, 20, and 40, each already sorted in reverse order. Record the comparison count for each and describe, in a sentence or two, how the counts relate to each other.
3. Do the same for `mergeSort`: count comparisons inside `merge`, run it on the same three input sizes, and compare how its comparison counts grow against `bubbleSort`'s.
4. In two or three sentences, explain why an array that is already sorted is close to a best case for `bubbleSort` (with the `swapped` flag in place) but not meaningfully faster for `mergeSort`.
