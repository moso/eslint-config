import { dedent } from 'ts-dedent';

import { runTest } from '../tests';
import module from './no-top-level-await';

const valids = [
    'async function foo() { await bar() }',
    dedent `
      const a = async () => {
          await bar()
      }
    `,
    'async function foo() { for await (const x of stream) { use(x) } }',
    'async function foo() { await using res = getRes() }',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'await foo()',
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: dedent `
              function foo() {}
              await foo()
            `,
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: dedent `
              const a = {
                  foo: await bar()
              }
            `,
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: 'for await (const x of stream) { use(x) }',
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
        {
            code: 'await using res = getRes()',
            errors: [{ messageId: 'noTopLevelAwait' }],
        },
    ],
});
