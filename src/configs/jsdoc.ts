import { interopDefault } from '../utils';

import type { OptionsStylistic, TypedFlatConfigItem } from '../types';

export const jsdoc = async (options: OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> => {
    const { stylistic = true } = options;

    const jsdocPlugin = await interopDefault(import('eslint-plugin-jsdoc'));

    return [
        {
            name: 'moso/jsdoc/rules',
            plugins: {
                jsdoc: jsdocPlugin,
            },
            rules: {
                'jsdoc/check-access': 'warn',
                'jsdoc/check-param-names': 'warn',
                'jsdoc/check-property-names': 'warn',
                'jsdoc/check-types': 'warn',
                'jsdoc/empty-tags': 'warn',
                'jsdoc/implements-on-classes': 'warn',
                'jsdoc/no-defaults': 'warn',
                'jsdoc/no-multi-asterisks': 'warn',
                'jsdoc/require-param-name': 'warn',
                'jsdoc/require-property': 'warn',
                'jsdoc/require-property-description': 'warn',
                'jsdoc/require-property-name': 'warn',
                'jsdoc/require-returns-check': 'warn',
                'jsdoc/require-returns-description': 'warn',
                'jsdoc/require-yields-check': 'warn',

                ...stylistic
                    ? {
                        'jsdoc/check-alignment': 'warn',
                        'jsdoc/multiline-blocks': 'warn',
                    }
                    : {},
            },
        },
    ];
};
