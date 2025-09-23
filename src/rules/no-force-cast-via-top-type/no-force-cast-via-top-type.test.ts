import { runTest } from '../tests';
import module from './no-force-cast-via-top-type';

const valids = [
    'const foo = bar as any',
    'const foo = bar as unknown',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'const foo = bar as any as Baz',
            errors: [
                {
                    messageId: 'noForceCast',
                    data: { type: 'any' },
                },
            ],
        },
        {
            code: 'const foo = bar as unknown as Baz',
            errors: [
                {
                    messageId: 'noForceCast',
                    data: { type: 'unknown' },
                },
            ],
        },
    ],
});
