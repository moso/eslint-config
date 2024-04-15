import { interopDefault } from '@/utils';

import type { TypedFlatConfigItem } from '@/types';

export const comments = async (): Promise<TypedFlatConfigItem[]> => {
    const eslintComments = await interopDefault(import('eslint-plugin-eslint-comments'));

    return [
        {
            name: 'moso/eslint-comments/rules',
            plugins: {
                comments: eslintComments,
            },
            rules: {
                'comments/no-aggregating-enable': 'error',
                'comments/no-duplicate-disable': 'error',
                'comments/no-unlimited-disable': 'error',
                'comments/no-unused-enable': 'error',
            },
        },
    ];
};
