import { runTest } from '../tests';
import module from './no-import-duplicates';

const valids = ['import { foo } from \'bar\''];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'import { a, b, a, a, c, a } from \'foo\'',
            errors: [
                { messageId: 'noImportDuplicates' },
                { messageId: 'noImportDuplicates' },
                { messageId: 'noImportDuplicates' },
            ],
            output: 'import { a, b,   c } from \'foo\'',
        },
        {
            code: 'import { a, a } from \'foo\'',
            errors: [{ messageId: 'noImportDuplicates' }],
            output: 'import { a } from \'foo\'',
        },
        {
            code: 'import { a, b, a } from \'foo\'',
            errors: [{ messageId: 'noImportDuplicates' }],
            output: 'import { a, b } from \'foo\'',
        },
    ],
});
