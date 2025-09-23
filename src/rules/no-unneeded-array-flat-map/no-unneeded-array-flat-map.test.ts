import { runTest } from '../tests';
import module from './no-unneeded-array-flat-map';

runTest({
    module,
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
