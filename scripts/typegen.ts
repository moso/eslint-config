import fs from 'node:fs/promises';
import process from 'node:process';
import { flatConfigsToRulesDTS } from 'eslint-typegen/core';

import {
    astro,
    comments,
    functional,
    ignores,
    imports,
    javascript,
    jsdoc,
    jsonc,
    jsx,
    nextjs,
    node,
    perfectionist,
    promise,
    react,
    regexp,
    sortPackageJson,
    sortTsconfig,
    stylistic,
    test,
    toml,
    typescript,
    unicorn,
    vue,
    yaml,
} from '../src/configs';
import { checkFilePath, combine } from '../src/utils';

import type { Linter } from 'eslint';

const CURRENT_DIR = await checkFilePath(process.cwd());

const configs = (await combine(
    astro({
        files: [],
        overrides: undefined,
        parserOptions: {},
        stylistic: false,
        typescript: false,
    }),
    comments({
        overrides: undefined,
    }),
    functional({
        filesTypeAware: [],
        functionalEnforcement: 'none',
        ignoreNamePattern: [],
        mode: 'none',
        overrides: undefined,
        parserOptions: {},
        stylistic: false,
    }),
    ignores({
        ignoreFiles: [],
        ignores: [],
        projectRoot: CURRENT_DIR,
    }),
    imports({
        overrides: undefined,
        parserOptions: {},
        stylistic: false,
        typescript: false,
    }),
    javascript({
        functionalEnforcement: 'none',
        ignoreNamePattern: [],
        isInEditor: undefined,
        lessOpinionated: undefined,
        overrides: undefined,
        perfectionist: undefined,
    }),
    jsdoc({
        overrides: undefined,
        stylistic: false,
    }),
    jsonc({
        files: [],
        overrides: undefined,
        stylistic: false,
    }),
    jsx(),
    nextjs({
        files: [],
        overrides: undefined,
    }),
    node({
        files: [],
        hasReact: false,
        hasTypeScript: false,
        lessOpinionated: undefined,
        module: undefined,
        overrides: undefined,
        strict: false,
    }),
    perfectionist({
        lessOpinionated: undefined,
        overrides: undefined,
    }),
    promise({
        lessOpinionated: undefined,
        overrides: undefined,
        typescript: false,
    }),
    react({
        a11y: false,
        files: [],
        filesTypeAware: [],
        lessOpinionated: undefined,
        overrides: undefined,
        overridesA11y: undefined,
        overridesTypeAware: undefined,
        parserOptions: {},
        projectRoot: CURRENT_DIR,
        stylistic: false,
        typescript: false,
    }),
    regexp({
        overrides: undefined,
    }),
    sortPackageJson({
        overrides: undefined,
    }),
    sortTsconfig({
        overrides: undefined,
    }),
    stylistic({
        lessOpinionated: undefined,
        overrides: undefined,
        stylistic: {
            indent: 4,
            jsx: true,
            quotes: 'single',
            semi: true,
        },
        typescript: false,
    }),
    test({
        files: [],
        overrides: undefined,
    }),
    toml({
        files: [],
        overrides: undefined,
        stylistic: false,
    }),
    typescript({
        componentExts: [],
        files: [],
        filesTypeAware: [],
        functionalEnforcement: 'none',
        ignoreNamePattern: [],
        lessOpinionated: undefined,
        mode: 'none',
        overrides: undefined,
        parserOptions: {},
        projectRoot: CURRENT_DIR,
        stylistic: false,
        unsafe: 'off',
    }),
    unicorn({
        functionalEnforcement: 'none',
        lessOpinionated: undefined,
        overrides: undefined,
    }),
    vue({
        a11y: false,
        files: [],
        filesTypeAware: [],
        overrides: undefined,
        overridesA11y: undefined,
        overridesTypeAware: undefined,
        parserOptions: {},
        projectRoot: CURRENT_DIR,
        sfcBlocks: false,
        stylistic: false,
        typescript: false,
    }),
    yaml({
        files: [],
        overrides: undefined,
        stylistic: false,
    }),
)) as Linter.Config[];

const configNames = configs.map((x) => x.name).filter(Boolean) as string[];

const dts = await flatConfigsToRulesDTS(configs, { includeIgnoreComments: false });

const fullDts = `// @ts-nocheck\n
${dts}\n\n

// Names of all the configs\n
export type ConfigNames = ${configNames.map((x) => `'${x}'`).join(' | ')};
`;

await fs.writeFile('src/typegen.d.ts', fullDts);
