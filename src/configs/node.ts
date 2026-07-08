import assert from 'node:assert/strict';

import globals from 'globals';

import {
    GLOB_CJS,
    GLOB_DTS,
    GLOB_JS,
    GLOB_MJS,
    GLOB_TS,
    GLOB_TSX,
} from '../globs';
import { loadPackages, memoize } from '../utils';

import type { Linter } from 'eslint';

import type {
    OptionsLessOpinionated,
    OptionsNode,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

const npmjs = (packageName: string) => `https://npmjs.com/package/${packageName}`;

const restricedImports = [
    { name: 'assert', message: 'Please use assert/strict instead.' },
    { name: 'async-call-rpc', message: 'Please use async-call-rpc/full instead.' },
    { name: 'axios', message: npmjs('ky') },
    { name: 'clone-deep', message: `${npmjs('rfdc')} for Node.js / ${npmjs('klona')} for Browser.` },
    { name: 'date-fns', message: 'Please use date-fns/{submodule} instead.' },
    { name: 'date-fns/esm', message: 'Please use date-fns/{submodule} instead.' },
    { name: 'dayjs', message: npmjs('date-fns') },
    { name: 'deep-copy', message: `${npmjs('rfdc')} for Node.js / ${npmjs('klona')} for Browser.` },
    { name: 'fast-copy', message: `${npmjs('rfdc')} for Node.js / ${npmjs('klona')} for Browser.` },
    { name: 'idb/with-async-ittr-cjs', message: 'Please use idb/with-async-ittr instead.' },
    { name: 'lodash', message: 'https://es-toolkit.slash.page' },
    { name: 'lodash.clonedeep', message: `${npmjs('rfdc')} for Node.js / ${npmjs('klona')} for Browser.` },
    { name: 'lodash-unified', message: 'Do not import lodash-unified directly.' },
    { name: 'node:assert', message: 'Please use node:assert/strict instead.' },
    { name: 'node-fetch', message: `${npmjs('undici')} (preferred) or ${npmjs('node-fetch-native')}.` },
    { name: 'react-fast-compare', message: 'What\'s faster than a really fast deep comparison? No deep comparison at all.' },
    { name: 'rimraf', message: 'Use Node\'s built-in fs.rmdir and fs.rm API.' },
];

const renameNodeRules = (
    rules: ArrayLike<unknown> | Partial<Linter.Config> | Record<string, unknown>,
    from: string,
    to: string,
) => Object.fromEntries(
    Object.entries(rules).map(([key, value]) => [
        key.startsWith(`${from}/`) ? `${to}/${key.slice(from.length + 1)}` : key,
        value,
    ]),
);

export const node = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsNode &
        OptionsOverrides
    > = {},
): Promise<TypedFlatConfigItem[]> => {
    const { lessOpinionated, overrides } = options;

    const [nodePlugin] = (await loadPackages(['eslint-plugin-n'])) as [(typeof import('eslint-plugin-n'))['default']];

    return [
        {
            name: 'moso/node',
            plugins: {
                'node': memoize(nodePlugin, 'eslint-plugin-n'),
            },
            languageOptions: {
                globals: {
                    ...globals.node,
                },
            },
            settings: {
                node: {
                    version: '^22.22.2 || >=24',
                },
            },
            rules: {
                ...(assert.ok(!Array.isArray(nodePlugin.configs['flat/recommended'])),
                renameNodeRules(nodePlugin.configs['flat/recommended'].rules ?? {}, 'n', 'node')),

                'node/no-unpublished-import': 'warn',
                'node/prefer-global/process': options.hasReact ? 'off' : ['error', 'never'],
                'node/prefer-global/text-decoder': ['error', 'never'],
                'node/prefer-global/text-encoder': ['error', 'never'],
                'node/prefer-global/url-search-params': ['error', 'always'],

                ...(!lessOpinionated && {
                    'node/no-top-level-await': 'off', // `@moso/no-top-level-await` will take care of this

                    'node/callback-return': 'error',
                    'node/handle-callback-err': ['error', '^(err|error)$'],
                    'node/no-callback-literal': 'error',
                    'node/no-missing-require': 'off',
                    'node/no-mixed-requires': ['error', { allowCall: true, grouping: true }],
                    'node/no-new-require': 'error',
                    'node/no-path-concat': 'error',
                    'node/no-restricted-import': [
                        'error',
                        [
                            {
                                name: 'assert',
                                message: 'Please use assert/strict instead.',
                            },
                            {
                                name: 'node:assert',
                                message: 'Please use node:assert/strict instead.',
                            },
                        ],
                    ],
                    'node/no-restricted-require': options.typescript ? 'off' : ['error', [...restricedImports]],
                    'node/no-sync': 'error',
                    'node/prefer-global/buffer': ['error', 'never'],
                    'node/prefer-global/console': ['error', 'always'],
                    'node/prefer-promises/dns': 'error',
                    'node/prefer-promises/fs': 'error',
                }),

                ...overrides,
            },
        },
        ...((options.strict
            ? [
                {
                    name: 'moso/node/strict',
                    files: options.files ?? (
                        options.module
                            ? [GLOB_CJS]
                            : [GLOB_CJS, GLOB_JS]
                    ),
                    rules: {
                        strict: ['warn', 'global'],
                    },
                },
            ]
            : []) satisfies TypedFlatConfigItem[]
        ),
        {
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
            files: [GLOB_DTS, GLOB_TS, GLOB_TSX],
            rules: {
                'node/no-extraneous-import': 'off',
                'node/no-missing-import': 'off',
                'node/no-restricted-import': 'off',
            },
        },
    ];
};
