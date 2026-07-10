import { runTest } from '../tests';
import module from './no-unneeded-array-flat-map';

runTest({
    module,
    valid: [
        '[].flatMap((x) => x + 1)',
        '[].flatMap((x) => [x, x])',
        '[].flatMap(fn)',
        '[].flat()',
    ],
    invalid: [
        {
            code: '[].flatMap((x) => x)',
            errors: [{ messageId: 'noUnneededArrayFlatMap' }],
            output: '[].flat()',
        },
        {
            code: '[].flatMap((x) => { return x })',
            errors: [{ messageId: 'noUnneededArrayFlatMap' }],
            output: '[].flat()',
        },
        {
            code: '[].flatMap(function (x) { return x })',
            errors: [{ messageId: 'noUnneededArrayFlatMap' }],
            output: '[].flat()',
        },
    ],
});
