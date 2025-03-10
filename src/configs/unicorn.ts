import { interopDefault } from '../utils';

import type { OptionsUnicorn, TypedFlatConfigItem } from '../types';

export const unicorn = async (options: OptionsUnicorn = {}): Promise<TypedFlatConfigItem[]> => {
    const unicornPlugin = await interopDefault(import('eslint-plugin-unicorn'));

    return [
        {
            name: 'moso/unicorn/rules',
            plugins: {
                unicorn: unicornPlugin,
            },
            rules: {
                ...(options.allRecommended
                    ? unicornPlugin.configs.recommended.rules
                    : {
                        'unicorn/consistent-empty-array-spread': 'error',
                        'unicorn/error-message': 'error',
                        'unicorn/escape-case': 'error',
                        'unicorn/no-new-array': 'error',
                        'unicorn/no-new-buffer': 'error',
                        'unicorn/number-literal-case': 'error',
                        'unicorn/prefer-dom-node-text-content': 'error',
                        'unicorn/prefer-includes': 'error',
                        'unicorn/prefer-node-protocol': 'error',
                        'unicorn/prefer-number-properties': 'error',
                        'unicorn/prefer-string-starts-ends-with': 'error',
                        'unicorn/prefer-type-error': 'error',
                        'unicorn/throw-new-error': 'error',
                    }
                ),
            },
        },
    ];
};
