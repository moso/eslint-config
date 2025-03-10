import { interopDefault } from '../utils';

import type { TypedFlatConfigItem } from '../types';

export const comments = async (): Promise<TypedFlatConfigItem[]> => {
    const eslintComments = await interopDefault(import('@eslint-community/eslint-plugin-eslint-comments'));

    return [
        {
            name: 'moso/eslint-comments/rules',
            plugins: {
                '@eslint-community/eslint-comments': eslintComments,
            },
            rules: {
                '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
                '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
                '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
                '@eslint-community/eslint-comments/no-unused-enable': 'error',
            },
        },
    ];
};
