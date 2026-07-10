# `@moso/no-import-from-dist`

Prevent importing modules located in the `dist` folder.

## Rule Details

Imports that reach into a `dist/` directory bypass a package's public entry point and couple your code to build artifacts: compiled output that may be stale locally, differ between builds, or disappear when the package restructures. This rule reports any import or `require` whose specifier is `dist`, starts with `./dist`/`../dist`, or contains a `/dist/` segment.

## Examples

### ❌ Incorrect

```js
import a from '../dist/a';
import b from 'dist';
import c from 'some-pkg/dist/helpers';
```

### ✅ Correct

```js
import a from '../src/a';
import b from 'some-pkg';
```

## When Not To Use It

If a dependency genuinely only ships consumable files under `dist/` with no exports mapping (rare with modern packages), disable the rule for that import with an inline comment rather than globally.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-dist.ts
