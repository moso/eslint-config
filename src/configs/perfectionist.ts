import { interopDefault } from '@/utils';

import type { TypedFlatConfigItem } from '@/types';

/**
 * Optional perfectionist plugin for props and items sorting.
 *
 * @see https://github.com/azat-io/eslint-plugin-perfectionist
 */
export const perfectionist = async (): Promise<TypedFlatConfigItem[]> => {
    const perfectionistPlugin = await interopDefault(import('eslint-plugin-perfectionist'));

    return [
        {
            name: 'moso/perfectionist/setup',
            plugins: {
                perfectionist: perfectionistPlugin,
            },
        },
    ];
};
