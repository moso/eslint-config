import { runTest } from '../tests';
import module from './avoid-barrel-files';

const valids = [
    'const a = 1; const b = 2; const c = 3; const d = 4;',
    `export { a } from 'a'; export { b } from 'b';`,
    `const a = 1; const b = 2; const c = 3; const d = 4; export { a } from 'a'; export { b } from 'b'; export { c } from 'c'; export { d } from 'd';`,
    `export type * from './a'; export type * from './b'; export type * from './c'; export type * from './d';`,
    `export type { a } from 'a'; export type { b } from 'b'; export type { c } from 'c'; export type { d } from 'd';`,
    `export { type a, type b, c } from 'mod';`,
    'export function foo() {}; export const bar = 1; export class Baz {}',
    'function foo() {} class Bar {} interface Baz {} type Qux = 1;',
    'export default function foo() {}',
    'export default createThing();',
    'export default foo;',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: `export { a } from 'a'; export { b } from 'b'; export { c } from 'c'; export { d } from 'd';`,
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: `export { a } from 'a'; export { b } from 'b'; export { c } from 'c';`,
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: `export * from './a'; export * from './b'; export * from './c'; export * from './d';`,
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: `export { a, b } from 'mod-1'; export { c, d } from 'mod-2';`,
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: `export { a } from 'a'; export { b } from 'b'; export { c } from 'c'; export { d } from 'd'; export { e } from 'e'; export { f } from 'f';`,
            options: [{ amountOfExportsToConsiderModuleAsBarrel: 5 }],
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: `const helper = () => {}; export { a } from 'a'; export { b } from 'b'; export { c } from 'c'; export { d } from 'd';`,
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
        {
            code: 'export default { a, b, c, d };',
            errors: [{ messageId: 'avoidBarrelFiles' }],
        },
    ],
});
