import { loadPackages, memoize } from '../utils';

import type { ESLint } from 'eslint';

import type {
    OptionsOverrides,
    RequiredOptionsStylistic,
    TypedFlatConfigItem,
} from '../types';

export const jsdoc = async (
    options: Readonly<OptionsOverrides & Required<RequiredOptionsStylistic>>,
): Promise<TypedFlatConfigItem[]> => {
    const { overrides, stylistic } = options;

    const [jsdocPlugin] = (await loadPackages(['eslint-plugin-jsdoc'])) as [ESLint.Plugin];

    const stylisticEnabled = stylistic === false ? 'off' : 'error';

    return [
        {
            name: 'moso/jsdoc',
            plugins: {
                'jsdoc': memoize(jsdocPlugin, 'eslint-plugin-jsdoc'),
            },
            rules: {
                'jsdoc/check-access': 'warn',
                'jsdoc/check-alignment': stylisticEnabled,
                'jsdoc/check-indentation': 'warn',
                'jsdoc/check-line-alignment': 'error',
                'jsdoc/check-param-names': 'error',
                'jsdoc/check-property-names': 'error',
                'jsdoc/check-types': 'error',
                'jsdoc/empty-tags': 'warn',
                'jsdoc/implements-on-classes': 'warn',
                'jsdoc/multiline-blocks': stylisticEnabled,
                'jsdoc/no-bad-blocks': [
                    'warn',
                    {
                        ignore: [
                            'ts-check',
                            'ts-expect-error',
                            'ts-ignore',
                            'ts-nocheck',
                            'vue-ignore',
                        ],
                    },
                ],
                'jsdoc/no-defaults': 'warn',
                'jsdoc/no-undefined-types': ['warn', { disableReporting: true }],
                'jsdoc/require-asterisk-prefix': 'warn',
                'jsdoc/require-description': 'warn',
                'jsdoc/require-hyphen-before-param-description': 'warn',
                'jsdoc/require-jsdoc': 'off',
                'jsdoc/require-param-name': 'error',
                'jsdoc/require-property-description': 'warn',
                'jsdoc/require-property-name': 'warn',
                'jsdoc/require-returns-check': 'error',
                'jsdoc/require-throws': 'warn',
                'jsdoc/require-yields-check': 'error',
                'jsdoc/tag-lines': [
                    'warn',
                    'never',
                    {
                        applyToEndTag: false,
                        startLines: 1,
                        tags: { example: { lines: 'always' } },
                    },
                ],

                ...overrides,
            },
        },
    ];
};
