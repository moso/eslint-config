# `@moso/no-invisible-characters`

Disallow invisible characters.

## Rule Details

Zero-width and other invisible Unicode characters (zero-width space, soft hyphen, variation selectors, tag characters, ...) are indistinguishable from normal code in most editors, yet change string comparisons, identifiers, and regexes at runtime - accidentally via copy-paste, or deliberately as an obfuscation vector. This rule scans every token and comment against a generated invisible-character pattern and reports matches. The fixer rewrites them as visible escape sequences (`a\u200Bb`) so intent is explicit.

## Examples

### ❌ Incorrect

```js
// The string contains a RAW U+200B (ZERO WIDTH SPACE) - invisible in the
// editor, but 'a<U+200B>b' !== 'ab' at runtime
const label = 'a<U+200B>b';
```

### ✅ Correct

```js
// The fixer output: the invisible character is a visible escape sequence
const label = 'a\u200Bb';
```

## When Not To Use It

Fixtures that test Unicode handling itself may need raw invisible characters - disable per-file there. Everywhere else, keep it on; like `no-bidi`, this is a supply-chain/security guard.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [x] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/unicode/no-invisible
