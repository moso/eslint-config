import assert from 'node:assert/strict';

import {
    GLOB_ASTRO,
    GLOB_ASTRO_TS,
    GLOB_DTS,
    GLOB_JSX,
    GLOB_MARKDOWN,
    GLOB_MJS,
    GLOB_SRC,
    GLOB_SRC_EXT,
    GLOB_TESTS,
    GLOB_TS,
    GLOB_TSX,
    GLOB_TYPINGS,
    GLOB_VUE,
} from '../globs';
import { loadPackages } from '../tools';

import type { TypedFlatConfigItem } from '../types';

export const disables = async (): Promise<TypedFlatConfigItem[]> => {
    const [functionalPlugin] = await loadPackages(['eslint-plugin-functional']);

    return [
        {
            name: 'moso/disables/allow-default-export',
            files: [
                `**/config*.${GLOB_SRC_EXT}`,
                `**/{api,helpers,middleware,modules,pages,plugins,routes,views}/${GLOB_SRC}`,
                `**/{esbuild,farm,index,next,nuxt,rolldown,rollup,rspack,vite,webpack}.${GLOB_SRC_EXT}`,
                `${GLOB_MARKDOWN}/**`,
                '**/*.d.ts',
                '**/.prettierrc',
            ],
            rules: {
                'import-lite/no-default-export': 'off',
            },
        },
        {
            name: 'moso/disables/bin',
            files: ['**/bin/**/*', `**/bin.${GLOB_SRC_EXT}`],
            rules: {
                '@moso/no-import-from-dist': 'off',
                '@moso/no-import-node-modules-by-path': 'off',
            },
        },
        {
            name: 'moso/disables/cjs',
            files: ['**/*.js', '**/*.cjs'],
            rules: {
                '@typescript-eslint/no-require-imports': 'off',
            },
        },
        {
            name: 'moso/disables/cli',
            files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
            rules: {
                '@moso/no-top-level-await': 'off',

                'baseline-js/use-baseline': 'off',
                'no-console': 'off',
            },
        },
        {
            name: 'moso/disables/components',
            files: [GLOB_JSX, GLOB_TSX],
            rules: {
                'unicorn/no-anonymous-default-export': 'off',
            },
        },
        {
            name: 'moso/disables/config-files',
            files: [
                `**/*.config.${GLOB_SRC_EXT}`,
                `**/{esbuild,farm,index,next,nuxt,rolldown,rollup,rspack,vite,webpack}.${GLOB_SRC_EXT}`,
            ],
            rules: {
                '@moso/no-top-level-await': 'off',

                '@typescript-eslint/explicit-function-return-type': 'off',

                'no-console': 'off',
            },
        },
        {
            name: 'moso/disables/dts',
            files: ['**/*.d.?([cm])ts'],
            rules: {
                'no-restricted-syntax': 'off',

                '@eslint-community/eslint-comments/no-unlimited-disable': 'off',

                'import-lite/no-duplicates': 'off',

                'unused-imports/no-unused-vars': 'off',
            },
        },
        {
            name: 'moso/disables/github',
            files: ['**/ISSUES_TEMPLATE/**'],
            rules: {
                'unicorn/filename-case': 'off',
            },
        },
        {
            name: 'moso/disables/node-frameworks',
            files: [
                GLOB_ASTRO,
                GLOB_ASTRO_TS,
                GLOB_DTS,
                GLOB_JSX,
                GLOB_TS,
                GLOB_TSX,
                GLOB_VUE,
            ],
            rules: {
                'node/no-extraneous-import': 'off',
                'node/no-missing-import': 'off',
                'node/no-restricted-import': 'off',
            },
        },
        {
            name: 'moso/disables/node-typescript',
            files: [
                GLOB_DTS,
                GLOB_MJS,
                GLOB_TS,
                GLOB_TSX,
            ],
            rules: {
                'node/no-unsupported-features/es-syntax': 'off',
            },
        },
        {
            name: 'moso/disables/scripts',
            files: [`**/scripts/${GLOB_SRC}`],
            rules: {
                '@moso/no-top-level-await': 'off',

                'baseline-js/use-baseline': 'off',
                'no-console': 'off',

                '@typescript-eslint/explicit-function-return-type': 'off',

                'functional/no-conditional-statements': 'off',
                'functional/no-expression-statements': 'off',
                'functional/no-loop-statements': 'off',
                'functional/no-return-void': 'off',
                'functional/no-throw-statements': 'off',

                'node/no-sync': 'off',
                'node/no-unpublished-import': 'off',
            },
        },
        {
            name: 'moso/disables/tests',
            files: GLOB_TESTS,
            rules: {
                '@moso/no-top-level-await': 'off',

                'baseline-js/use-baseline': 'off',

                'e18e/prefer-static-regex': 'off',

                'no-unused-expressions': 'off',

                'jsdoc/require-jsdoc': 'off',

                'node/no-sync': 'off',
                'node/prefer-global/process': 'off',

                'regexp/no-super-linear-backtracking': 'off',

                'unicorn/consistent-function-scoping': 'off',
                'unicorn/prefer-module': 'off',

                '@typescript-eslint/consistent-type-definitions': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/no-unused-expressions': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/strict-boolean-expressions': 'off',
            },
        },
        {
            name: 'moso/disables/typings',
            files: [GLOB_TYPINGS],
            rules: {
                ...(assert.ok(!Array.isArray(functionalPlugin.configs.off)),
                functionalPlugin.configs.off.rules),

                'jsdoc/check-examples': 'off',
                'jsdoc/check-indentation': 'off',
                'jsdoc/check-line-alignment': 'off',
                'jsdoc/check-param-names': 'off',
                'jsdoc/check-property-names': 'off',
                'jsdoc/check-types': 'off',
                'jsdoc/check-values': 'off',
                'jsdoc/no-bad-blocks': 'off',
                'jsdoc/no-defaults': 'off',
                'jsdoc/require-asterisk-prefix': 'off',
                'jsdoc/require-description': 'off',
                'jsdoc/require-description-complete-sentence': 'off',
                'jsdoc/require-hyphen-before-param-description': 'off',
                'jsdoc/require-jsdoc': 'off',
                'jsdoc/require-param-name': 'off',
                'jsdoc/require-param': 'off',
                'jsdoc/require-property-name': 'off',
                'jsdoc/require-property': 'off',
                'jsdoc/require-returns-check': 'off',
                'jsdoc/require-returns': 'off',
                'jsdoc/require-throws': 'off',
                'jsdoc/require-yields-check': 'off',
                'jsdoc/tag-lines': 'off',
                'jsdoc/check-access': 'off',
                'jsdoc/empty-tags': 'off',
                'jsdoc/implements-on-classes': 'off',
                'jsdoc/no-multi-asterisks': 'off',
                'jsdoc/require-property-description': 'off',
                'jsdoc/require-returns-description': 'off',
                'jsdoc/check-alignment': 'off',
                'jsdoc/multiline-blocks': 'off',

                '@typescript-eslint/consistent-type-definitions': 'off',
                '@typescript-eslint/no-empty-object-type': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
            },
        },
    ];
};
