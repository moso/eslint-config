import { interopDefault } from '../utils';

import type { TypedFlatConfigItem } from '../types';

export const node = async (): Promise<TypedFlatConfigItem[]> => {
    const nodePlugin = await interopDefault(import('eslint-plugin-n'));

    return [
        {
            name: 'moso/node/rules',
            plugins: {
                node: nodePlugin,
            },
            rules: {
                'node/handle-callback-err': ['error', '^(err|error)$'],
                'node/no-deprecated-api': 'error',
                'node/no-exports-assign': 'error',
                'node/no-new-require': 'error',
                'node/no-path-concat': 'error',
                'node/prefer-global/buffer': ['error', 'never'],
                'node/prefer-global/process': ['error', 'never'],
                'node/process-exit-as-throw': 'error',
            },
        },
    ];
};
