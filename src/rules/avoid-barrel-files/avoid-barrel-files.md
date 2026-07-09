# `@moso/avoid-barrel-files`

Disallow *authoring* barrel files in your project.

## Rule Details

Barrel files (modules that mostly re-export other modules) force the module loader to resolve, load, and evaluate every re-exported file whenever anything imports the barrel - even when only one export is needed. This slows down startup, bloats bundles that cannot tree-shake perfectly, and creates import cycles. This rule counts re-exports (`export { a } from`, `export * from`, and re-exported import specifiers) and reports the module once it reaches the configured threshold.

## Examples

### ❌ Incorrect

```js
// index.js - 3+ re-exports make this a barrel
export { a } from './a';
export { b } from './b';
export { c } from './c';
```

### ✅ Correct

```js
// Import directly from the source module instead
import { a } from './a';
import { b } from './b';

// Inline exports of actual implementations are fine
export const helper = () => 1;
```

## Options

| Option                                    | Type     | Default | Description                                                           |
| ----------------------------------------- | -------- | ------- | --------------------------------------------------------------------- |
| `amountOfExportsToConsiderModuleAsBarrel` | `number` | `3`     | Minimum number of re-exports before a module counts as a barrel file. |

## When Not To Use It

Disable it for a package's deliberate public entry point (`src/index.ts`), where a single import surface is the point - this repo does exactly that with a scoped override. Note the rule only counts *re-exports*: files with many inline `export const` declarations are not flagged.

## Attributes

- Type: Suggestion
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [x] :bulb: Suggestions
- [x] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/thepassle/eslint-plugin-barrel-files/blob/main/docs/rules/avoid-barrel-files.md
