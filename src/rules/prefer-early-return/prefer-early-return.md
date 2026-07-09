# `@moso/prefer-early-return`

Prefer early returns over full-body conditional wrapping in function declarations.

## Rule Details

A function whose entire body is wrapped in one `if` hides its guard condition and indents everything a level deeper than needed. This rule reports function bodies consisting of a single `if` statement (without `else`) whose consequent exceeds the configured statement count, and rewrites them as a guard clause. The fixer negates the condition - unwrapping an existing `!` instead of double-negating - replaces the consequent with `return;`, and moves the body after the guard.

## Examples

### ❌ Incorrect

```js
const handle = (event) => {
    if (event.isValid) {
        prepare();
        process(event);
    }
};
```

### ✅ Correct

```js
const handle = (event) => {
    if (!event.isValid) return;

    prepare();
    process(event);
};

// if/else bodies are not reported
const branch = (flag) => {
    if (flag) a();
    else b();
};
```

## Options

| Option              | Type              | Default | Description                                                             |
| ------------------- | ----------------- | ------- | ----------------------------------------------------------------------- |
| `maximumStatements` | `integer` (min 0) | `1`     | How many statements the wrapped body may contain before the rule fires. |

## When Not To Use It

Teams that prefer single-exit functions (one `return` per function) should disable this - the rule is the opposite convention by design.

## Attributes

- Type: Problem
- [x] :white_check_mark: Stylistic
- [x] :wrench: Fixable
- [x] :bulb: Suggestions
- [x] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/prefer-early-return
