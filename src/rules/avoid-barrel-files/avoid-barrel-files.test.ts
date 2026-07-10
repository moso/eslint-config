import { runTest } from '../tests';
import module from './avoid-barrel-files';

const valids = [
    'const a = 1; const b = 2; const c = 3; const d = 4;',
    `export { a } from 'a'; export { b } from 'b'; export { c } from 'c';`,
    `const a = 1; const b = 2; const c = 3; const d = 4; export { a } from 'a'; export { b } from 'b'; export { c } from 'c'; export { d } from 'd';`,
    `export type * from './a'; export type * from './b'; export type * from './c'; export type * from './d';`,
    'export function foo() {}; export const bar = 1; export class Baz {}',
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
    ],
});
