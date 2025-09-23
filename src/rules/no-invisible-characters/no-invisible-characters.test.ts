import { runTest } from '../tests';
import module from './no-invisible-characters';

const valids = ['ABC', 'false'];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: '"\uDB40\uDD00example\uDB40\uDD00"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"\\u{E0100}example\\u{E0100}"',
        },
    ],
});
