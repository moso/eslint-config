import { runTest } from '../tests';
import module from './prefer-strict-number-guards';

runTest({
    module,
    valid: [
        // use-direct-operands / guard-derived-value
        'const x = a / b;',
        'const x = a / 2;',
        'const span = max - min; const x = total / span;',
        'const w = (frameWidth * imageHeight) / imageWidth;',

        // guard-array-index
        'const v = values[index] ?? 0;',
        'const v = values[index]!;',
        'const v = values[0];',
        'const v = record[\'key\'];',
        'const v = obj[someName];',
        'values[index] = 1;',

        // write-explicit-condition
        'const w = width === 0 ? 1 : width;',
        'const label = name || \'unknown\';',

        // check-parse-result
        'const n = Number.isFinite(raw) ? raw * 2 : 0;',
        'const n = Math.max(0, size);',

        // encode-input-rule
        'function f(columnCount: number) { console.assert(columnCount >= 1); return 100 / columnCount; }',
        'function f(columnCount: number) { return 100 / Math.max(1, columnCount); }',
        'function f(label: string) { return 100 / other; }',
        'const f = (columnCount: number) => 100 / Math.floor(columnCount);',

        // disabled guards do not fire
        { code: 'const x = total / (oldMax - oldMin);', options: [{ guards: ['check-parse-result'] }] },
        { code: 'const w = frameWidth / (imageWidth / imageHeight);', options: [{ guards: ['guard-derived-value'] }] },
        { code: 'const w = width || 1;', options: [{ guards: ['guard-array-index'] }] },
        { code: 'const n = Math.max(...sizes);', options: [{ guards: ['write-explicit-condition'] }] },
        { code: 'function f(items: Array<number>, index: number) { return items[index]; }', options: [{ guards: ['write-explicit-condition'] }] },
    ],
    invalid: [
        {
            code: 'const x = total / (oldMax - oldMin);',
            errors: [{ messageId: 'guardDerivedValue' }],
        },
        {
            code: 'const x = total % (oldMax + oldMin);',
            errors: [{ messageId: 'guardDerivedValue' }],
        },
        {
            code: 'const w = frameWidth / (imageWidth / imageHeight);',
            errors: [{ messageId: 'useDirectOperands' }],
        },
        {
            code: 'function f(columnCount: number) { return 100 / columnCount; }',
            errors: [{ messageId: 'encodeInputRule' }],
        },
        {
            code: 'function f(values: Array<number>, columnCount: number) { return values[columnCount]; }',
            errors: [{ messageId: 'encodeInputRule' }],
        },
        {
            code: 'function f(items: Array<number>, index: number) { return items[index]; }',
            errors: [{ messageId: 'guardArrayIndex' }, { messageId: 'encodeInputRule' }],
        },
        {
            code: 'const v = values[i + 1];',
            errors: [{ messageId: 'guardArrayIndex' }],
        },
        {
            code: 'const v = values[Math.floor(offset)];',
            errors: [{ messageId: 'guardArrayIndex' }],
        },
        {
            code: 'const v = values[columnIndex];',
            errors: [{ messageId: 'guardArrayIndex' }],
            options: [{ guards: ['guard-array-index'] }],
        },
        {
            code: 'const w = width || 1;',
            errors: [{ messageId: 'writeExplicitCondition' }],
        },
        {
            code: 'const n = parseInt(raw) * 2;',
            errors: [{ messageId: 'checkParseResult' }],
        },
        {
            code: 'const n = Number(raw) / total;',
            errors: [{ messageId: 'checkParseResult' }],
        },
        {
            code: 'const n = Math.max(...sizes);',
            errors: [{ messageId: 'checkParseResult' }],
        },
        {
            // A seed argument does not prove the spread is non-empty - intentional strictness.
            code: 'const n = Math.max(0, ...sizes);',
            errors: [{ messageId: 'checkParseResult' }],
        },
        {
            code: 'const x = total / (oldMax - oldMin);',
            errors: [{ messageId: 'guardDerivedValue' }],
            options: [{ guards: ['guard-derived-value'] }],
        },
    ],
});
