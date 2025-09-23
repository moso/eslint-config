import { runTest } from '../tests';
import module from './no-import-from-dist';

const valids = [
    'import xxx from \'a\'',
    'import \'b\'',
    'import \'package/dist/foo.css\'',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'import a from \'../dist/a\'',
            errors: [{ messageId: 'noImportFromDist' }],
        },
        {
            code: 'import \'../dist/b\'',
            errors: [{ messageId: 'noImportFromDist' }],
        },
        {
            code: 'import b from \'dist\'',
            errors: [{ messageId: 'noImportFromDist' }],
        },
        {
            code: 'import c from \'./dist\'',
            errors: [{ messageId: 'noImportFromDist' }],
        },
    ],
});
