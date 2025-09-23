import { runTest } from '../tests';
import module from './prefer-early-return';

runTest({
    module,
    invalid: [
        {
            code: 'function foo() { if (foo) bar(); }',
            errors: [{ messageId: 'preferEarlyReturn' }],
            options: [{ maximumStatements: 0 }],
            output: 'function foo() { if (!(foo)) return;\nbar(); }',
        },
        {
            code: 'function foo() { if (foo) { bar(); baz(); } }',
            errors: [{ messageId: 'preferEarlyReturn' }],
            output: 'function foo() { if (!(foo)) return;\nbar(); baz(); }',
        },
    ],
});
