# `@moso/no-import-node-modules-by-path`

Prevent importing modules from the `node_modules` folder by relative or absolute path.

## Rule Details

Reaching into `node_modules` by path (`../node_modules/foo`) sidesteps the module resolver entirely: it breaks under hoisting differences, pnpm's isolated layout, and workspace setups, and it ignores the package's `exports` map. This rule reports both `import` declarations and `require()` calls whose specifier contains a `node_modules` path segment.

## Examples

### ❌ Incorrect

```js
import a from '../node_modules/a';
const c = require('../node_modules/c');
```

### ✅ Correct

```js
import a from 'a';
const c = require('c');
```

## When Not To Use It

Practically never. Debugging scripts that intentionally probe an installed package's internals can use an inline disable.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-node-modules-by-path.ts
