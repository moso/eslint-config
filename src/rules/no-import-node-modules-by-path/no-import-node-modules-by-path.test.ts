import { runTest } from '../tests';
import module from './no-import-node-modules-by-path';

const valids = [
    'import xxx from \'a\'',
    'import \'b\'',
    'const c = require(\'c\')',
    'require(\'d\')',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'import a from \'../node_modules/a\'',
            errors: [{ messageId: 'noImportNodeModulesByPath' }],
        },
        {
            code: 'import \'../node_modules/b\'',
            errors: [{ messageId: 'noImportNodeModulesByPath' }],
        },
        {
            code: 'const c = require(\'../node_modules/c\')',
            errors: [{ messageId: 'noImportNodeModulesByPath' }],
        },
        {
            code: 'require(\'../node_modules/d\')',
            errors: [{ messageId: 'noImportNodeModulesByPath' }],
        },
    ],
});
