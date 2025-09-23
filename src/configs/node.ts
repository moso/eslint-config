import globals from 'globals';

import { GLOB_CJS, GLOB_JS } from '../globs';
import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

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
    { name: 'rimraf', message: 'Use Node\'s built-in fs.rmdir and fm.rm API.' },
];

export const node = async (
    options: Readonly<
        OptionsLessOpinionated &
        OptionsNode &
        OptionsOverrides
    > = {},
): Promise<TypedFlatConfigItem[]> => {
    const { lessOpinionated, overrides } = options;

    const [nodePlugin] = (await loadPackages(['eslint-plugin-n'])) as [ESLint.Plugin];

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
            rules: {
                'node/callback-return': 'error',
                'node/handle-callback-err': ['error', '^(err|error)$'],
                'node/no-callback-literal': 'error',
                'node/no-deprecated-api': 'error',
                'node/no-exports-assign': 'error',
                'node/no-extraneous-import': 'off',
                'node/no-extraneous-require': 'off',
                'node/no-missing-import': 'off',
                'node/no-missing-require': 'off',
                'node/no-mixed-requires': ['error', { allowCall: true, grouping: true }],
                'node/no-new-require': 'error',
                'node/no-path-concat': 'error',
                'node/no-process-exit': 'error',
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
                'node/no-restricted-require': options.hasTypeScript ? 'off' : ['error', [...restricedImports]],
                'node/no-sync': 'error',
                'node/no-unpublished-import': 'warn',
                'node/prefer-global/buffer': ['error', 'never'],
                'node/prefer-global/console': ['error', 'always'],
                'node/prefer-global/process': options.hasReact ? 'off' : ['error', 'never'],
                'node/prefer-global/text-decoder': ['error', 'never'],
                'node/prefer-global/text-encoder': ['error', 'never'],
                // 'node/prefer-global/url': ['error', 'never'],
                'node/prefer-global/url-search-params': ['error', 'never'],
                'node/prefer-promises/dns': 'error',
                'node/prefer-promises/fs': 'error',
                'node/process-exit-as-throw': 'error',

                ...(!lessOpinionated && {
                    'node/no-top-level-await': 'error',
                    'node/no-unsupported-features/es-syntax': 'off',
                }),

                ...overrides,
            },
        },
        ...((options.strict === false
            ? []
            : [
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
            ]) satisfies TypedFlatConfigItem[]
        ),
    ];
};
