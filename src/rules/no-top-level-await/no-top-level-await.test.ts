import { dedent } from 'ts-dedent';

import { runTest } from '../tests';
import module from './no-top-level-await';

const valids = [
    'async function foo() { await bar() }',
    dedent `
        const a = async () => {
            await bar()
        }
    `,
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'await foo()',
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: dedent `
                function foo() {}
                await foo()
            `,
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: dedent `
                const a = {
                    foo: await bar()
                }
            `,
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
    ],
});
