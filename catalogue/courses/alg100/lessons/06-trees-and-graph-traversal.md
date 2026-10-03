---
lesson_id: alg100-06
course_id: alg100
pathway: quality-assurance-software-engineer
title: Trees and Graph Traversal
order: 6
kind: lesson
competency_ids:
  - D3-S1-C02
  - D5-S1-C02
objectives:
  - Traverse a tree or graph structure
---

## Trees and graphs are the shape of "things connected to other things"

A tree is a structure where each item has exactly one parent (except a single root, which has none) and any number of children — a folder containing subfolders, an HTML element containing child elements, an org chart. A graph is more general: items (called nodes) connect to other items (via edges) with no restriction that each one has a single parent, which lets you model things like "this module imports that module" where imports can point in any direction and even form cycles.

You've already been working with a tree without naming it that way: the DOM. Every element on a page has a parent element (except `<html>`, whose parent is the `document` itself) and any number of children, which is exactly a tree's definition. You'll also meet its cousin, the dependency graph, later in this lesson: which files import which other files. Both structures need the same core skill — traversal, meaning visiting every node reachable from a starting point, in some deliberate order, without visiting any node twice.

## Depth-first traversal: go deep before you go wide

Depth-first traversal follows one branch as far down as it goes before backing up and trying the next one — the same instinct as reading a folder tree by opening each folder fully before moving to the next sibling folder.

```javascript
const componentTree = {
  name: "App",
  children: [
    {
      name: "Header",
      children: [{ name: "Logo", children: [] }, { name: "NavMenu", children: [] }],
    },
    {
      name: "Main",
      children: [{ name: "LoginForm", children: [] }],
    },
  ],
};

function depthFirst(node, visit) {
  visit(node);
  for (const child of node.children) {
    depthFirst(child, visit);
  }
}

const visited = [];
depthFirst(componentTree, (node) => visited.push(node.name));
console.log(visited);
// ["App", "Header", "Logo", "NavMenu", "Main", "LoginForm"]
```

Notice the shape of the recursion: `depthFirst` visits a node, then immediately hands off to each child before returning to try the next sibling. That's what produces the "go all the way down `Header`'s branch before starting `Main`'s branch" order in the output.

## Breadth-first traversal: go wide before you go deep

Breadth-first traversal visits every node at the current depth before moving to the next depth — level by level, like reading an org chart one rank at a time. It needs a queue (a first-in-first-out list: items come out in the same order they went in) instead of the call stack that depth-first's recursion relies on. The call stack is the list of function calls that haven't returned yet, and it is last-in-first-out:

```javascript
function breadthFirst(root, visit) {
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift(); // take from the front
    visit(node);
    for (const child of node.children) {
      queue.push(child); // add to the back
    }
  }
}

const visited = [];
breadthFirst(componentTree, (node) => visited.push(node.name));
console.log(visited);
// ["App", "Header", "Main", "Logo", "NavMenu", "LoginForm"]
```

Compare the two outputs on the same tree: depth-first finishes all of `Header`'s descendants before touching `Main`, while breadth-first visits both of `App`'s direct children (`Header`, `Main`) before descending into either one's children. Same tree, same starting point, genuinely different order — and which order you want depends entirely on the question you're asking.

A note on scale: `queue.shift()` removes the first element and moves every remaining element down by one index. That's fine for a component tree of a few hundred nodes. On very large structures, a common fix is to leave the array alone and advance a `head` index instead (`const node = queue[head++]`). The recursive `depthFirst` has its own limit. Each level of nesting adds a call to the stack, so a structure tens of thousands of levels deep can throw `RangeError: Maximum call stack size exceeded`. Real DOM trees are rarely that deep, but generated data and long dependency chains can be.

## Walking the DOM to isolate a failure

Here's the direct link to the rest of this pathway: when a page renders wrong and you need to find which element is responsible, you are traversing a tree to isolate a failure — the exact competency this lesson is tagged against. Say a visual regression test reports that some element on the page has an unexpected background color, and you need to find which one, starting from the root.

```javascript
function findElementWithStyle(root, predicate) {
  if (predicate(root)) {
    return root;
  }
  for (const child of root.children) {
    const found = findElementWithStyle(child, predicate);
    if (found !== null) {
      return found;
    }
  }
  return null;
}

// Given a DOM-like tree of elements, each with a `styles` object:
const culprit = findElementWithStyle(
  pageRoot,
  (el) => el.styles.backgroundColor === "#ff00ff"
);
```

This is depth-first traversal doing real diagnostic work: rather than eyeballing the rendered page and guessing, you walk the tree systematically, checking each node against the condition that describes the failure, and stop at the first match. The same pattern generalizes past styling — walking a tree of log entries looking for the first one at `ERROR` level, walking a config file's nested sections looking for the setting that overrode a default, walking a component tree looking for the one whose props don't match what a parent passed down. In every case, the traversal is the same shape: visit a node, check whether it explains the symptom, and if not, hand off to its children — which is precisely "reviewing configuration files, logs, or code to locate a breakdown's source," just expressed as code instead of as a manual habit.

`pageRoot` above stands for a plain-object tree shaped like `componentTree`, but with a `styles` object on each node. A real browser DOM has two differences worth knowing before you run this in DevTools. First, an element's child elements are in `element.children`, which you can loop over with `for...of`, as the code above does. Second, inline `element.style` only shows styles set directly on that element. To see what is actually rendered, read `getComputedStyle(element).backgroundColor`, which returns the color in `rgb()` form (`"rgb(255, 0, 255)"`), not as `"#ff00ff"`. A predicate that compares against the hex string will never match, and the search will report `null` even though the culprit is on screen. So check that your predicate can match at all before you trust a "not found" result.

Breadth-first traversal earns its keep in the same kind of diagnosis when depth is a hint. If you know the failing element is near the top of the page structurally — a header issue, not something buried six layers deep in a modal — breadth-first will find it in fewer steps than depth-first would, because it checks every shallow node before descending into anything.

## Traversing a graph: dependency chains

A graph relaxes the tree's "one parent" rule, and the most common graph a working developer touches is a dependency graph: which module imports which other modules. Because a graph can have cycles (`a.js` imports `b.js`, which imports `a.js`), a naive recursive walk can loop forever unless you track what you've already visited.

```javascript
const imports = {
  "app.js": ["auth.js", "router.js"],
  "auth.js": ["api.js"],
  "router.js": ["auth.js"], // auth.js is reachable two ways — no problem, but don't revisit it
  "api.js": [],
};

function depthFirstGraph(startNode, graph, visit) {
  const seen = new Set();

  function walk(node) {
    if (seen.has(node)) {
      return; // already visited — skip, or a cycle would loop forever
    }
    seen.add(node);
    visit(node);
    for (const next of graph[node] ?? []) {
      walk(next);
    }
  }

  walk(startNode);
}

const order = [];
depthFirstGraph("app.js", imports, (m) => order.push(m));
console.log(order);
// ["app.js", "auth.js", "api.js", "router.js"]
```

If `auth.js` is broken and a test needs to know everything that could be affected, this same traversal — starting from `auth.js` and walking outward through whatever imports it — answers "what's downstream of this failure" instead of "what does this depend on." There's one catch: `imports` stores edges in the "depends on" direction, so walking it from `auth.js` only reaches `api.js`. To walk "imported by" edges, build the reversed graph first and run the same `depthFirstGraph` over it:

```javascript
function reverseGraph(graph) {
  const importedBy = {};
  for (const node of Object.keys(graph)) importedBy[node] ??= [];
  for (const [node, deps] of Object.entries(graph)) {
    for (const dep of deps) {
      (importedBy[dep] ??= []).push(node);
    }
  }
  return importedBy;
}

const affected = [];
depthFirstGraph("auth.js", reverseGraph(imports), (m) => affected.push(m));
console.log(affected);
// ["auth.js", "app.js", "router.js"]
```
The `seen` set is what makes graph traversal safe where tree traversal didn't need one: a tree can never revisit a node by construction, but a graph can, and forgetting to track visited nodes is the single most common bug in graph-walking code — an infinite loop that looks, from the outside, exactly like a hang.

## Practice

You're given a tree describing a page's component structure, where each node has a `name` and a `children` array (as in `componentTree` above), plus each node has a `hasError` boolean flag somewhere in the tree set to `true` on exactly one node.

1. Write a depth-first function `findFirstError(root)` that returns the *name* of the first node encountered with `hasError === true`, using the traversal-with-a-predicate pattern from `findElementWithStyle`.
2. Write a breadth-first version of the same search, `findFirstErrorBFS(root)`, and construct a tree where the two functions return different node names — prove to yourself that traversal order genuinely changes the answer, not just the path taken to it.
3. Extend the `imports` graph example with a cycle of your own (two files that import each other) and confirm your `depthFirstGraph` walk terminates instead of looping, by tracing through what the `seen` set contains at each step.
4. In two or three sentences, describe a real debugging scenario from your own experience (or a plausible one) where you would want breadth-first traversal over depth-first, and explain why the shallow-first order helps.

## Check your understanding

1. Which data structure does breadth-first traversal depend on, and which order does it take items out in?
2. Why does `depthFirstGraph` need a `seen` set when `depthFirst` on `componentTree` did not?
3. You know the broken element is inside the page header, two levels below the root. Which traversal will usually reach it in fewer visits, and why?

**Answers:** (1) A queue, which is first-in-first-out: nodes come out in the order they were added, so the traversal finishes one level before starting the next. (2) A tree gives every node exactly one parent, so there is only one path to each node. A graph can have several paths to the same node, or a cycle, so without `seen` the walk revisits nodes and can loop forever. (3) Breadth-first. It checks every shallow node before going deeper, so it reaches level two without first walking every deep branch of earlier siblings.
