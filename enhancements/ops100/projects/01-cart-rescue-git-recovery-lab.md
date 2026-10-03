---
course_id: ops100
project_id: ops100-x01
title: "Cart Rescue: Revert a Bad Push and Recover a Deleted Fix"
kind: supplementary-project
status: draft
hours_estimate: 4
difficulty: core
related_lessons:
  - ops100-03
  - ops100-04
objectives:
  - Use Git to record, inspect, and recover work
  - Work on a shared repository using branches, merges, and pull requests
competency_ids:
  - D4-S1-C01
  - D1-S1-C04
---

## Scenario

It's Monday morning on the cart team. Over the weekend a teammate pushed "Hardcode tax rate for promo weekend" straight to the shared `main`, and the tax test now fails. Worse, on Friday you deleted your local `fix/cart-quantity` branch by mistake, before pushing it; it held the "Fix cart total ignoring quantity for out-of-stock items" commit from lesson 03. Your job: undo the bad change on shared `main` *without rewriting history*, recover your fix from the reflog, bring it up to date with `main`, prove the tests pass, and push it for review.

## What you will build / produce

- A repaired shared remote (`origin.git`) with a revert commit on `main` and your recovered `fix/cart-quantity` branch.
- `rescue-notes.md`: the exact commands you ran, in order, with one line each on *why* (especially why `revert` and not `reset`), plus the Slack-style message you would post to the teammate (lesson 04 communication habits).

## Before you start (prerequisites, starter files or data)

- Lessons 03 and 04; Git 2.28+ (for `--initial-branch`) and Node 18+.
- Save the setup script below as `setup-cart-rescue.sh` and run `bash setup-cart-rescue.sh`. It creates `cart-rescue-lab/` with `origin.git` (the shared remote), `teammate/` (ignore it), and `work/` (your clone, where you do everything). It unsets your name and email inside `work/`, so set your own with `git config user.name` / `user.email` first.

```bash
#!/usr/bin/env bash
# Builds the "cart rescue" lab: a shared remote (origin.git) and your clone (work/).
set -euo pipefail
LAB="${1:-$PWD/cart-rescue-lab}"
rm -rf "$LAB" && mkdir -p "$LAB" && cd "$LAB"
git init --quiet --bare --initial-branch=main origin.git
git clone --quiet origin.git work 2>/dev/null
cd work
git config user.name "Setup Bot"
git config user.email "setup-bot@example.com"
mkdir -p src
cat > package.json <<'JSON'
{ "name": "cart-rescue", "private": true, "type": "module",
  "scripts": { "test": "node --test" } }
JSON
cat > src/cart.js <<'JS'
export function calculateTotal(items, taxRate = 0.08) {
  let subtotal = 0;
  for (const item of items) {
    const qty = item.inStock ? item.quantity : 1;
    subtotal += item.price * qty;
  }
  return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}
JS
git add . && git commit --quiet -m "Add cart module with calculateTotal" -m "First version of the cart total used by /cart and /checkout."
cat > src/cart.test.js <<'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal } from './cart.js';

test('applies the default 8% tax', () => {
  assert.equal(calculateTotal([{ price: 10, quantity: 2, inStock: true }]), 21.6);
});
JS
git add . && git commit --quiet -m "Add cart total tax test" -m "Pins the default tax rate so a change to it fails loudly."
git push --quiet -u origin main 2>/dev/null
BASE=$(git rev-parse HEAD)
# Your earlier fix, made on a branch that then got deleted by mistake.
git switch --quiet -c fix/cart-quantity
sed -i.bak 's/const qty = item.inStock ? item.quantity : 1;/const qty = item.quantity;/' src/cart.js && rm src/cart.js.bak
cat >> src/cart.test.js <<'JS'

test('counts out-of-stock items at their real quantity', () => {
  const items = [{ price: 5, quantity: 3, inStock: false }];
  assert.equal(calculateTotal(items, 0), 15);
});
JS
git add . && git commit --quiet -m "Fix cart total ignoring quantity for out-of-stock items" -m "Out-of-stock items were counted at quantity 1 regardless of the
cart's quantity field, inflating totals on partial restocks."
git switch --quiet main
git branch --quiet -D fix/cart-quantity
# A teammate pushes a bad change straight to the shared main from their own clone.
cd "$LAB"
git clone --quiet origin.git teammate
cd teammate
git config user.name "Teammate"
git config user.email "teammate@example.com"
sed -i.bak 's/taxRate = 0.08/taxRate = 0/' src/cart.js && rm src/cart.js.bak
git commit --quiet -am "Hardcode tax rate for promo weekend" -m "Temporary: promo weekend is tax-free."
git push --quiet origin main 2>/dev/null
cd "$LAB/work"
git config --unset user.name; git config --unset user.email
echo "Lab ready: $LAB/work (shared remote: $LAB/origin.git)"
```

## Milestones

1. In `work/`: `git fetch`, then `git log --oneline origin/main` and `git show` the newest commit. Explain in your notes what changed and why it breaks the tax test.
2. Bring `main` up to date and `git revert` the bad commit. Give the revert a summary line plus a body explaining why. Run `npm test`; push `main`.
3. `git reflog`: find "commit: Fix cart total ignoring quantity…". Create `fix/cart-quantity` at that hash with `git switch -c`.
4. Bring the reverted `main` into your branch (`git merge main`), resolve anything that conflicts, run `npm test` (both tests must pass), and push the branch with `-u`.
5. Run the automated check (below). Write the message to your teammate: what you found, what you did, and what they should do instead next time (a feature flag or a branch and PR).

## Acceptance criteria

- [ ] The bad commit is still in `origin/main`'s history (no force-push, no reset of shared history).
- [ ] `origin/main` has a `Revert "Hardcode tax rate…"` commit and `src/cart.js` defaults to `taxRate = 0.08` again.
- [ ] `origin/fix/cart-quantity` exists, contains the recovered fix commit, and has `origin/main` as an ancestor.
- [ ] Both tests pass on `fix/cart-quantity`.
- [ ] Every commit you authored has a summary line of at most 72 characters and a body.
- [ ] Your clone is clean with no conflict markers.
- [ ] `rescue-notes.md` explains each command and includes the teammate message.

## Automated checks (coding courses) / Evidence checklist (non-coding)

Save as `check-cart-rescue.test.mjs` next to `cart-rescue-lab/` and run `node --test check-cart-rescue.test.mjs` (or set `CART_LAB=/path/to/cart-rescue-lab`). It only *reads* the lab repositories. On a fresh lab it reports 2 passing and 5 failing checks; after a correct rescue, all 7 pass (verified in this pass with Git and Node 24).

```javascript
// Run from anywhere:  CART_LAB=/path/to/cart-rescue-lab node --test check-cart-rescue.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LAB = process.env.CART_LAB || path.resolve('cart-rescue-lab');
const WORK = path.join(LAB, 'work');
const ORIGIN = path.join(LAB, 'origin.git');
const FIX = 'fix/cart-quantity';
const SETUP_EMAILS = new Set(['setup-bot@example.com', 'teammate@example.com']);

const git = (args, dir = WORK) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
const remote = (args) => git(['--git-dir', ORIGIN, ...args], LAB);
const ok = (fn) => { try { fn(); return true; } catch { return false; } };

const badCommit = () => remote(['log', 'main', '--format=%H', '--grep=^Hardcode tax rate']).split('\n')[0];

test('shared main was not rewritten: the bad commit is still in its history', () => {
  const bad = badCommit();
  assert.ok(bad, 'could not find "Hardcode tax rate for promo weekend" on origin/main - was history rewritten?');
  assert.ok(ok(() => remote(['merge-base', '--is-ancestor', bad, 'main'])));
});

test('shared main undoes the bad change with a revert commit', () => {
  const subjects = remote(['log', 'main', '--format=%s', '-n', '5']);
  assert.match(subjects, /^Revert "Hardcode tax rate/m, 'expected a Revert commit on origin/main');
  assert.match(remote(['show', 'main:src/cart.js']), /taxRate = 0\.08/, 'origin/main still has the 0% tax default');
});

test(`${FIX} was recovered and pushed`, () => {
  assert.ok(ok(() => remote(['rev-parse', '--verify', `refs/heads/${FIX}`])), `origin has no branch ${FIX}`);
  const subjects = remote(['log', FIX, '--format=%s']);
  assert.match(subjects, /^Fix cart total ignoring quantity for out-of-stock items$/m);
});

test(`${FIX} is up to date with the reverted main`, () => {
  assert.ok(ok(() => remote(['merge-base', '--is-ancestor', 'main', FIX])),
    `origin/main is not an ancestor of ${FIX}; bring main into your branch and push again`);
});

test(`the test suite passes on ${FIX}`, () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cart-rescue-'));
  for (const f of ['package.json', 'src/cart.js', 'src/cart.test.js']) {
    fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
    fs.writeFileSync(path.join(tmp, f), remote(['show', `${FIX}:${f}`]) + '\n');
  }
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT; // let the inner run print its own report
  const out = execFileSync(process.execPath, ['--test', '--test-reporter=tap'],
    { cwd: tmp, encoding: 'utf8', env });
  // execFileSync throws if any test fails (non-zero exit code)
  assert.match(out, /^# pass 2$/m, 'expected both the tax test and the out-of-stock test');
});

test('your own commits follow the summary-line-plus-body convention', () => {
  const log = remote(['log', 'main', FIX, '--no-merges', '--format=%ae%x1f%s%x1f%b%x1e']);
  const mine = log.split('\x1e').map(r => r.trim()).filter(Boolean)
    .map(r => r.split('\x1f')).filter(([email]) => !SETUP_EMAILS.has(email));
  assert.ok(mine.length >= 1, 'no commits by you found on origin');
  for (const [, subject, body] of mine) {
    assert.ok(subject.length <= 72, `summary too long (${subject.length}): ${subject}`);
    assert.ok(body && body.trim().length > 0, `commit has no body: ${subject}`);
  }
});

test('local clone is clean and free of conflict markers', () => {
  assert.equal(git(['status', '--porcelain']), '', 'working tree has uncommitted changes');
  assert.equal(ok(() => git(['grep', '-n', '-E', '^(<<<<<<<|>>>>>>>) '])), false, 'conflict markers found');
});
```

## Rubric

| Criterion | Developing | Meets | Exceeds |
|---|---|---|---|
| Safe undo | Used `reset` or force-push on shared `main` | Revert commit with a clear message; history intact | Notes explain what would have broken for teammates with `reset` |
| Recovery | Re-typed the fix by hand | Recovered the original commit from the reflog | Explains reflog limits (local only, expiry) and how to avoid needing it |
| Branch hygiene | Branch behind `main` or tests failing | Branch merged with `main`, tests pass, pushed with upstream | Uses `git log --graph --oneline --all` output as evidence in notes |
| Communication | No teammate message | Clear, blame-free message with what happened and what to do next | Proposes a team convention (protected `main`, flags) with reasoning |

## Stretch goals

- Open a pull request from `fix/cart-quantity` on a real hosted copy of the lab and write the description in the lesson 05 format.
- Redo the lab using `git rebase main` instead of merge for step 4, then explain in your notes when each is appropriate on a branch others may have pulled.

## Reflection prompts

- At what moment would panic have led you to the wrong command? What did you check first instead?
- What would you have done if the reflog no longer had the fix commit?

## Instructor notes (common pitfalls, how to adapt for time)

- Pitfalls: running commands in `teammate/` instead of `work/`; `git reset --hard origin/main~1` followed by `push --force` (the check catches this); forgetting to set user name/email after setup; searching `git log` instead of `git reflog` for the deleted commit.
- The merge in step 4 is normally clean (the two edits are on different lines of `cart.js`); if a learner edits `cart.js` by hand first they will get a real conflict, which is good practice.
- A reference solution exists (revert on `main`, `git switch -c fix/cart-quantity <reflog hash>`, `git merge main`, push); keep it out of learner hands.
- Short on time: skip the teammate message and the commit-body check.
