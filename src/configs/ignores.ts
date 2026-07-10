import { GLOB_EXCLUDE, GLOB_TS, GLOB_TSX } from '../globs';
import { globalIgnores, loadPackages } from '../utils';

import type { OptionsIgnores, TypedFlatConfigItem } from '../types';

export const ignores = async (options: Readonly<OptionsIgnores>): Promise<TypedFlatConfigItem[]> => {
    const {
        gitignore,
        ignoreTypeScript,
        userIgnores,
    } = options;

    const [eslintConfigFlatGitIgnore] =
        (await loadPackages(['eslint-config-flat-gitignore'])) as
            [typeof import('eslint-config-flat-gitignore')['default']];

    const mut_configs: TypedFlatConfigItem[] = [];

    const mut_ignores: string[] = userIgnores === false || userIgnores === undefined
        ? [...GLOB_EXCLUDE]
        : typeof userIgnores === 'function'
            ? userIgnores(GLOB_EXCLUDE)
            : typeof userIgnores === 'string'
                ? [...GLOB_EXCLUDE, userIgnores]
                : [...GLOB_EXCLUDE, ...userIgnores];

    if (ignoreTypeScript) mut_ignores.push(GLOB_TS, GLOB_TSX);

    mut_configs.push(globalIgnores(mut_ignores, 'moso/ignores/globals'));

    if (typeof gitignore === 'boolean' && gitignore) {
        mut_configs.push(
            eslintConfigFlatGitIgnore({
                files: ['.gitignore'],
                name: 'moso/ignores/gitignore',
                strict: false,
            })
        );
    } else if (typeof gitignore === 'string' || Array.isArray(gitignore)) {
        mut_configs.push(
            eslintConfigFlatGitIgnore({
                files: gitignore,
                name: 'moso/ignores/gitignore',
                strict: false,
            }),
        );
    }

    return mut_configs;
};
