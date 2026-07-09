# `@moso/no-string-interpolation`

Disallow simple string interpolation.

## Rule Details

Template-literal expressions that span multiple lines bury logic inside a string, where it is hard to read, format, and debug. This rule reports any interpolated expression whose source spans more than one line, nudging it into a named variable first.

## Examples

### ❌ Incorrect

```js
const message = `result: ${items
    .map((item) => item.name)
    .join(', ')}`;
```

### ✅ Correct

```js
const names = items.map((item) => item.name).join(', ');
const message = `result: ${names}`;

// Single-line interpolation is fine
const greeting = `Hello ${user.name}`;
```

## When Not To Use It

Codebases with heavy tagged-template usage (CSS-in-JS, SQL builders, GraphQL documents) often format multiline expressions inside templates intentionally - disable this stylistic rule there.

## Attributes

- Type: Suggestion
- [ ] :white_check_mark: Stylistic
- [ ] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/string/no-interpolation
