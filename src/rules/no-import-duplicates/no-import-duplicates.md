# `@moso/no-import-duplicates`

Fix duplicates of imports.

## Rule Details

Reports import specifiers that appear more than once inside the same import declaration and removes the duplicates, including the dangling comma - whether the duplicate sits in the middle or at the end of the specifier list.

## Examples

### ❌ Incorrect

```js
import { a, b, a } from 'foo';
import { a, a } from 'foo';
```

### ✅ Correct

```js
import { a, b } from 'foo';
```

## When Not To Use It

There is no legitimate reason to import the same binding twice in one declaration; keep this rule on. If you use `import-lite/no-duplicates` or similar for *cross-declaration* duplicates, the two complement each other - this rule handles duplicates *within* a single declaration.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [x] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/import-dedupe.md
