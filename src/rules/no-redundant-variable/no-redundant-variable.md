# `@moso/no-redundant-variable`

Disallow redundant variables.

## Rule Details

A variable declared only to be returned on the next line adds a name without adding meaning. This rule reports the pattern and inlines the initializer into the `return`. The fixer is `await`-aware: outside `try` blocks it unwraps `await` (the no-return-await optimization - returned promises flatten identically for the caller) and preserves type annotations as an `as` cast; inside `try` blocks it keeps `return await` so `catch` still observes rejections.

## Examples

### ❌ Incorrect

```ts
function example() {
    const foo: string = 'bar';
    return foo;
}
```

### ✅ Correct

```ts
function example() {
    return 'bar' as string;
}

// Variables that are actually used are fine
function example2() {
    const foo = 'bar';
    use(foo);
    return foo;
}
```

## When Not To Use It

If you prefer named intermediate results as documentation (`const result = compute(); return result;`), this stylistic rule will fight that convention - disable it rather than suppressing case by case.

## Attributes

- Type: Problem
- [ ] :white_check_mark: Stylistic
- [x] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/no-redundant-variable
