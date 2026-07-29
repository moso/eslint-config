# `@moso/prefer-strict-number-guards`

Enforce the syntactic patterns that keep numeric code analyzable.

## Rule Details

[Freerange](https://github.com/chenglou/freerange) is a static range analyser for TypeScript `number`s. It walks the TypeScript compiler API to track each number's minimum, maximum, integer-ness and whether it can be `NaN` or `Infinity` across function calls, and it uses that to catch division by zero, out-of-bounds indexes and silent `NaN` propagation.

ESLint cannot reproduce any of that. What *is* portable is Freerange's "Writing Analyzable TypeScript" guidance: the syntactic patterns that make numeric code provable in the first place, each carrying an audit code. This rule enforces that syntactic subset. It is strictness guidance, not a range prover - it proves nothing about actual values, and a file that passes it is not thereby free of division by zero. Thus, if you wish true, strict number tracking, use Freerange. This rule is a humble attempt to help you "stay within the lines".

| Guard | Flags | Audit code |
| ----- | ----- | ---------- |
| `checkParseResult`       | An unchecked `parseInt`/`parseFloat`/`Number` result, or `Math.max`/`Math.min` over a spread. | `check-parse-result` |
| `encodeInputRule`        | A `: number` parameter used raw as a divisor or an index. | `encode-input-rule` |
| `guardArrayIndex`        | A computed index read that is neither `??`-defaulted nor `!`-asserted. | `guard-array-index` |
| `guardDerivedValue`      | A division or remainder whose divisor is an unnamed calculation. | `guard-derived-value` |
| `useDirectOperands`      | A division whose divisor is itself a division. | `use-direct-operands` |
| `writeExplicitCondition` | A `\|\|` fallback to a number, which also swallows a legitimate `0`. | `write-explicit-condition` |

## Examples

### ❌ Incorrect

```ts
// use-direct-operands: the inner ratio can round to zero
const w = frameWidth / (imageWidth / imageHeight);

// guard-derived-value: nothing says the span is non-zero
const x = total / (oldMax - oldMin);

// encode-input-rule (opt-in): the parameter carries no stated rule
function scale(columnCount: number) {
    return 100 / columnCount;
}

// guard-array-index (opt-in): the element may be `undefined`
const v = values[index];

// write-explicit-condition: a width of `0` silently becomes `1`
const w = width || 1;

// check-parse-result: `NaN` and `-Infinity` propagate silently
const n = parseInt(raw) * 2;
const largest = Math.max(...sizes);
```

### ✅ Correct

```ts
const w = (frameWidth * imageHeight) / imageWidth;

const span = oldMax - oldMin;
const x = span === 0 ? 0 : total / span;

function scale(columnCount: number) {
    console.assert(columnCount >= 1);
    return 100 / columnCount;
}

// ...or normalise at the use site
function scaleLoosely(columnCount: number) {
    return 100 / Math.max(1, columnCount);
}

const v = values[index] ?? 0;

const w = width === 0 ? 1 : width;

const parsed = parseInt(raw);
const n = Number.isFinite(parsed) ? parsed * 2 : 0;
const largest = sizes.length === 0 ? 0 : Math.max(...sizes);
```

## Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `guards` | `string[]` | `['check-parse-result', 'guard-derived-value', 'use-direct-operands', 'write-explicit-condition']` | Which audit codes to enforce. Listing a subset disables every guard that is not in the list. The heuristic `encode-input-rule` and `guard-array-index` are off by default. |

```ts
// Only the two division guards
'@moso/prefer-strict-number-guards': ['error', { guards: ['guard-derived-value', 'use-direct-operands'] }]

// All six guards, including the heuristic opt-in ones
'@moso/prefer-strict-number-guards': [
    'error',
    {
        guards: [
            'check-parse-result',
            'encode-input-rule',
            'guard-array-index',
            'guard-derived-value',
            'use-direct-operands',
            'write-explicit-condition',
        ],
    },
]
```

## When Not To Use It

Two of the guards are heuristics, because the rule reads syntax only:

- `guard-array-index` decides whether a computed property is an index by its shape: arithmetic, a `Math.*` call, or a name like `i`, `idx`, `index` or anything ending in `Index`/`Idx`. Without type information `record[key]` and `array[i]` are the same syntax, so this both misses real indexes held in differently-named variables and flags map lookups whose key happens to be named `index`.
- `write-explicit-condition` only sees the literal `value || <number>` form. A fallback that goes through a variable or a function call reads as ordinary logic and is not reported.

`guard-array-index` and `encode-input-rule` are off by default for exactly that reason - opt in per-project by listing all six guards once the naming conventions line up. `checkParseResult` also flags `Math.max(0, ...sizes)`, where the seed argument does in fact dominate an empty spread; that is intentional strictness, since the rule cannot prove the seed is reached.

Codebases without meaningful numeric work, or ones already running Freerange itself over the whole tree, gain little from this rule.

## Attributes

- Type: Problem
- [ ] :white_check_mark: Stylistic
- [ ] :wrench: Fixable
- [ ] :bulb: Suggestions
- [x] :gear: Configurable
- [ ] :thought_balloon: Requires type information

---

Inspired by: https://github.com/chenglou/freerange
