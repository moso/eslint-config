# `@moso/no-import-from-dist`

Prevent importing modules located in the `dist` folder.

## Rule Details

Imports that reach into your own `dist/` directory couple your code to build artifacts: compiled output that may be stale locally or differ between builds. This rule reports any import or `require` whose specifier is `dist` or is a relative path containing a `/dist/` segment (such as `./dist` or `../dist/a`). Bare package specifiers like `some-pkg/dist/helpers` are deliberately not reported - for some dependencies a `dist` path is the only published entry.

## Examples

### ❌ Incorrect

```js
import a from '../dist/a';
import b from 'dist';
const c = require('../dist/c');
```

### ✅ Correct

```js
import a from '../src/a';
import b from 'some-pkg';
import c from 'some-pkg/dist/helpers';
```

## When Not To Use It

If a dependency genuinely only ships consumable files under `dist/` with no exports mapping (rare with modern packages), disable the rule for that import with an inline comment rather than globally.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [ ] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-dist.ts
