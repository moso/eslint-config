# `@moso/no-top-level-await`

Prevent using top-level await.

## Rule Details

Top-level `await` blocks the whole module graph while it resolves: every importer of the module (transitively) waits before *any* of its code runs, which hurts startup time and can deadlock circular imports. It also restricts the module to ESM-only consumers - `require()` of a module with top-level await throws. This rule reports `await` expressions that are not inside a function, tracked with an O(1) function-depth counter rather than ancestor walks.

## Examples

### ❌ Incorrect

```js
const data = await fetchData();
```

### ✅ Correct

```js
const main = async () => {
    const data = await fetchData();
};

void main();
```

## When Not To Use It

Runtime entry points that are never imported (CLI scripts, server bootstraps) and file types designed around top-level await are legitimate users.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-top-level-await.ts
