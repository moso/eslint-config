import { runTest } from '../tests';
import module from './no-redundant-variable';

runTest({
    module,
    valid: [
        'function example() { const foo = \'bar\'; use(foo); return foo }',
        'function example() { const foo = \'bar\'; return foo + \'baz\' }',
        'function example() { const [foo] = bar; return foo }',
        'function example() { return \'bar\' }',
    ],
    invalid: [
        {
            code: 'function example() { const foo: string = \'bar\'; return foo }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'function example() {  return (\'bar\') as string }',
        },
        {
            code: 'async function example() { const foo: string = await bar; return foo }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'async function example() {  return (bar) as Promise<string> }',
        },
        {
            code: 'async function example() { try { const foo = await bar; return foo } catch {} }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'async function example() { try {  return await bar } catch {} }',
        },
        {
            code: 'const example = () => { const foo: string = \'bar\'; return foo }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'const example = () => {  return (\'bar\') as string }',
        },
        {
            code: 'const example = async () => { const foo: string = await bar; return foo; }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'const example = async () => {  return (bar) as Promise<string>; }',
        },
        {
            code: 'const example = async () => { try { const foo = await bar; return foo } catch {} }',
            errors: [{ messageId: 'noRedundantVar' }],
            output: 'const example = async () => { try {  return await bar } catch {} }',
        },
    ],
});
