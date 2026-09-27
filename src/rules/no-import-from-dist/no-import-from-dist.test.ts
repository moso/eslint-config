import { runTest } from '../tests';
import module from './no-import-from-dist';

const valids = [
    'import xxx from \'a\'',
    'import \'b\'',
    'import \'package/dist/foo.css\'',
    'require(\'package/dist/helpers\')',
    'require()',
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
        {
            code: 'const d = require(\'../dist/d\')',
            errors: [{ messageId: 'noImportFromDist' }],
        },
        {
            code: 'require(\'dist\')',
            errors: [{ messageId: 'noImportFromDist' }],
        },
    ],
});
