import fs from 'node:fs/promises';

import { flatConfigsToRulesDTS } from 'eslint-typegen/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';

import {
    combine,
    comments,
    imports,
    javascript,
    jsdoc,
    jsonc,
    jsx,
    node,
    perfectionist,
    react,
    sortPackageJson,
    stylistic,
    test,
    typescript,
    unicorn,
    vue,
    yaml,
} from '../../src';

const configs = await combine(
    {
        plugins: {
            '': {
                rules: Object.fromEntries(builtinRules.entries()),
            },
        },
    },
    comments(),
    imports(),
    javascript(),
    jsx(),
    jsdoc(),
    jsonc(),
    node(),
    perfectionist(),
    react(),
    sortPackageJson(),
    stylistic(),
    test(),
    typescript(),
    unicorn(),
    vue(),
    yaml(),
);

const configNames = configs.map((x) => x.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, { includeAugmentation: false });

dts += `
// Names of all the configs
export type ConfigNames = ${configNames.map((x) => `'${x}'`).join(' | ')}
`;

await fs.writeFile('src/typegen.d.ts', dts);
