# `@moso/no-bidi`

Detect and stop trojan source attacks.

## Rule Details

Unicode bidirectional (bidi) control characters (`U+061C`, `U+202A`–`U+202E`, `U+2066`–`U+2069`) can visually reorder source code so that what a reviewer reads differs from what the compiler executes - the "Trojan Source" attack (CVE-2021-42574). This rule scans every token and comment for bidi control characters and reports them. The fixer rewrites the characters as visible escape sequences (`\u202E`), HTML entities in JSX text, and adds the `u` flag when fixing regex literals.

## Examples

### ❌ Incorrect

```js
// The string contains a RAW U+202E (RIGHT-TO-LEFT OVERRIDE) character -
// invisible here, but it reorders how the code renders in an editor
const greeting = 'Hello<U+202E>World';
```

### ✅ Correct

```js
// The fixer output: the bidi character is a visible escape sequence
const greeting = 'Hello\u202EWorld';
```

## When Not To Use It

Only if your codebase legitimately embeds raw bidi control characters - for example fixtures that test bidi rendering itself. Even then, prefer escape sequences and disable the rule per-file rather than globally: this is a security rule.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [x] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/unicode/no-bidi
