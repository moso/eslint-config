import { GLOB_SRC, GLOB_SRC_EXT } from '../globs';

import type { TypedFlatConfigItem } from '../types';

export const disables = (): TypedFlatConfigItem[] => [
    {
        files: [`**/scripts/${GLOB_SRC}`],
        name: 'moso/disables/scripts',
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@moso/no-top-level-await': 'off',
            'no-console': 'off',
        },
    },
    {
        files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
        name: 'moso/disables/cli',
        rules: {
            '@moso/no-top-level-await': 'off',
            'no-console': 'off',
        },
    },
    {
        files: ['**/*.d.?([cm])ts'],
        name: 'moso/disables/dts',
        rules: {
            '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
            'no-restricted-syntax': 'off',
            'unused-imports/no-unused-vars': 'off',
        },
    },
    {
        files: ['**/*.js', '**/*.cjs'],
        name: 'moso/disables/cjs',
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: [`**/*.config.${GLOB_SRC_EXT}`, `**/*.config.*.${GLOB_SRC_EXT}`],
        name: 'moso/disables/config-files',
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-console': 'off',
        },
    },
];
