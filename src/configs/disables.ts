import { GLOB_SRC, GLOB_SRC_EXT } from '../globs';

import type { TypedFlatConfigItem } from '../types';

export const disables = (): TypedFlatConfigItem[] => {
    return [
        {
            files: [`**/scripts/${GLOB_SRC}`],
            name: 'moso/disables/scripts',
            rules: {
                'no-console': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
            },
        },
        {
            files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
            name: 'moso/disables/cli',
            rules: {
                'no-console': 'off',
            },
        },
        {
            files: ['**/bin/**/*', `**/bin.${GLOB_SRC_EXT}`],
            name: 'moso/disables/bin',
            rules: {
                'antfu/no-import-dist': 'off',
                'antfu/no-import-node-modules-by-path': 'off',
            },
        },
        {
            files: ['**/*.d.?([cm])ts'],
            name: 'moso/disables/dts',
            rules: {
                'eslint-comments/no-unlimited-disable': 'off',
                'import/no-duplicates': 'off',
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
                'no-console': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
            },
        },
    ];
};
