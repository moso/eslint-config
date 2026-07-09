# `@moso/no-force-cast-via-top-type`

Disallow casting a type `T` to unrelated or incompatible type `Q` via `T as any as Q`.

## Rule Details

The double cast `x as any as Q` (or `x as unknown as Q`) launders any value into any type, silencing the compiler exactly where it was trying to protect you. It hides real type mismatches, survives refactors unnoticed, and turns type errors into runtime errors. This rule reports every cast whose target type is reached through an intermediate `any`/`unknown` cast.

## Examples

### ❌ Incorrect

```ts
const foo = bar as any as Baz;
const foo = bar as unknown as Baz;
```

### ✅ Correct

```ts
// Fix the types so the direct cast is valid
const foo = bar as Baz;

// Or narrow honestly at runtime
const foo = isBaz(bar) ? bar : fallback;
```

## When Not To Use It

At genuine type-system boundaries where two structurally-incompatible type worlds must meet (e.g. adapting a third-party library's types), a targeted inline disable with a justification comment is more honest than turning the rule off.

## Attributes

- Type: Problem
- [x] :white_check_mark: Recommended
- [ ] :wrench: Fixable
- [x] :bulb: Suggestions
- [ ] :gear: Configurable
- [x] :thought_balloon: Requires type information

---

Inspired by: https://dimensiondev.github.io/eslint-plugin/src/rules/type/no-force-cast-via-top-type
