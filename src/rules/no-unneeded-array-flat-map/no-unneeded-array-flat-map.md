# `@moso/no-unneeded-array-flat-map`

Disallow `Array#flatMap((x) => x)` when simpler alternatives exist.

## Rule Details

`flatMap` with an identity callback is just `flat()` with an extra function call per element. This rule detects identity callbacks in both expression form (`(x) => x`) and block form (`(x) => { return x }`, `function (x) { return x }`) and auto-fixes the call to `.flat()`.

## Examples

### ❌ Incorrect

```js
[].flatMap((x) => x);
[].flatMap((x) => { return x });
[].flatMap(function (x) { return x });
```

### ✅ Correct

```js
[].flat();

// Non-identity callbacks are what flatMap is for
[].flatMap((x) => [x, x]);
[].flatMap((x) => x + 1);
```

## When Not To Use It

No real reason to disable it - the fix is behavior-preserving for identity callbacks. Note it only inspects inline function callbacks; a named identity function passed by reference (`.flatMap(identity)`) is deliberately not flagged.

## Attributes

- Type: Suggestion
- [ ] :white_check_mark: Stylistic
- [x] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/array/no-unneeded-flat-map
