# `@moso/prefer-reduce-over-chaining`

Prefer `.reduce()` over chaining `.map()` and `.filter()` methods.

## Rule Details

Every link in a `.map().filter()` chain allocates a fresh intermediate array and walks the whole input again. A single `.reduce()` (or one loop) produces the same result in one pass with one allocation. This rule reports higher-order array methods (`map`, `filter`, `flatMap`, `forEach`, `reduce`, `reduceRight`) chained onto the result of another one.

## Examples

### ❌ Incorrect

```js
const names = users
    .filter((user) => user.active)
    .map((user) => user.name);
```

### ✅ Correct

```js
const names = users.reduce((acc, user) => {
    if (user.active) acc.push(user.name);
    return acc;
}, []);

// Chaining onto non-higher-order methods is fine
values.reduce(sum, 0).toFixed(2);
```

## When Not To Use It

For small arrays in cold paths, the chained version can be easier to read and the performance difference is irrelevant - teams that value that readability over single-pass discipline should disable this rule.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/SukkaW/eslint-plugin-sukka/blob/master/src/rules/no-chain-array-higher-order-functions/index.ts
