import { runTest } from '../tests';
import module from './no-invisible-characters';

const valids = ['ABC', 'false'];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: '"\u{E0100}example\u{E0100}"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"\\u{E0100}example\\u{E0100}"',
        },
        {
            code: '"a\u{200B}b"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"a\\u200Bb"',
        },
        {
            code: '"a\u{AD}b"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"a\\u00ADb"',
        },
    ],
});
