/* eslint-disable no-template-curly-in-string */
import { runTest } from '../tests';
import module from './no-string-interpolation';

const valids = ['`${test.test()}`'];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: '`${test.\ntest()}`',
            errors: [{ messageId: 'noStringInterpolation' }],
        },
    ],
});
