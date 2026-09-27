import { runTest } from '../tests';
import module from './prefer-strict-number-guards';

import type { Guard } from './prefer-strict-number-guards';

const allGuards: Guard[] = [
    'check-parse-result',
    'encode-input-rule',
    'guard-array-index',
    'guard-derived-value',
    'use-direct-operands',
    'write-explicit-condition',
];

runTest({
    module,
    valid: [
        // use-direct-operands / guard-derived-value
        'const x = a / b;',
        'const x = a / 2;',
        'const span = max - min; const x = total / span;',
        'const w = (frameWidth * imageHeight) / imageWidth;',

        // guard-array-index
        { code: 'const v = values[index] ?? 0;', options: [{ guards: allGuards }] },
        { code: 'const v = values[index]!;', options: [{ guards: allGuards }] },
        { code: 'const v = values[0];', options: [{ guards: allGuards }] },
        { code: 'const v = record[\'key\'];', options: [{ guards: allGuards }] },
        { code: 'const v = obj[someName];', options: [{ guards: allGuards }] },
        { code: 'values[index] = 1;', options: [{ guards: allGuards }] },
        { code: 'values[index]++;', options: [{ guards: allGuards }] },
        { code: 'delete values[index];', options: [{ guards: allGuards }] },

        // write-explicit-condition
        'const w = width === 0 ? 1 : width;',
        'const label = name || \'unknown\';',
        'const w = width || fallback;',

        // check-parse-result
        'const n = Number.isFinite(raw) ? raw * 2 : 0;',
        'const n = Math.max(0, size);',
        'const ok = parseInt(raw) > 2;',
        'const n = parseInt(raw);',
        'const s = parseInt(raw).toString();',
        'const v = parseInt(raw)[0];',

        // encode-input-rule
        { code: 'function f(columnCount: number) { console.assert(columnCount >= 1); return 100 / columnCount; }', options: [{ guards: allGuards }] },
        { code: 'function f(columnCount: number) { return 100 / Math.max(1, columnCount); }', options: [{ guards: allGuards }] },
        { code: 'function f(label: string) { return 100 / other; }', options: [{ guards: allGuards }] },
        { code: 'const f = (columnCount: number) => 100 / Math.floor(columnCount);', options: [{ guards: allGuards }] },
        { code: 'function f({ size }: { size: number }) { return 100 / size; }', options: [{ guards: allGuards }] },

        // the heuristic guards do not fire by default
        'const v = values[i + 1];',
        'const v = values[columnIndex];',
        'function f(columnCount: number) { return 100 / columnCount; }',
        'function f(items: Array<number>, index: number) { return items[index]; }',
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
            options: [{ guards: allGuards }],
        },
        {
            code: 'function f(values: Array<number>, columnCount: number) { return values[columnCount]; }',
            errors: [{ messageId: 'encodeInputRule' }],
            options: [{ guards: allGuards }],
        },
        {
            code: 'function f(items: Array<number>, index: number) { return items[index]; }',
            errors: [{ messageId: 'guardArrayIndex' }, { messageId: 'encodeInputRule' }],
            options: [{ guards: allGuards }],
        },
        {
            code: 'const v = values[i + 1];',
            errors: [{ messageId: 'guardArrayIndex' }],
            options: [{ guards: allGuards }],
        },
        {
            code: 'const v = values[Math.floor(offset)];',
            errors: [{ messageId: 'guardArrayIndex' }],
            options: [{ guards: allGuards }],
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
            code: 'const v = values[parseInt(raw)];',
            errors: [{ messageId: 'checkParseResult' }],
        },
        {
            code: 'function f(columnCount: number) { columnCount; return 100 / columnCount; }',
            errors: [{ messageId: 'encodeInputRule' }],
            options: [{ guards: allGuards }],
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
