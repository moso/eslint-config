import { dedent } from 'ts-dedent';

import { runTest } from '../tests';
import module from './prefer-reduce-over-chaining';

const valids = [
    '[].reduce(() => {}, 0)',
    '[].map(() => {})',
    '[].filter(() => {})',
    '[].reduce(() => {}, 0).sort()',
    '[].filter(() => {}).every(() => true)',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: '[].map(() => {}).filter(() => {}, 0)',
            errors: [{ messageId: 'preferReduceOverChaining' }],
        },
        {
            code: '[].filter(() => {}).map(() => {}, 0)',
            errors: [{ messageId: 'preferReduceOverChaining' }],
        },
        {
            code: dedent `
                []
                .map(() => {})
                .reduce(() => {}, 0)
            `,
            errors: [{ messageId: 'preferReduceOverChaining' }],
        },
        {
            code: dedent `
                arr
                .reduce(() => {}, 0)
                .map(() => {})
            `,
            errors: [{ messageId: 'preferReduceOverChaining' }],
        },
        {
            code: dedent `
                arr
                .map(() => {})
                .filter(() => {}, 0)
            `,
            errors: [{ messageId: 'preferReduceOverChaining' }],
        },
    ],
});
