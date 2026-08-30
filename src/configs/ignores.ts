import { GLOB_EXCLUDE, GLOB_TS, GLOB_TSX } from '../globs';
import { loadPackages } from '../tools';
import { globalIgnores } from '../utils';

import type { OptionsIgnores, TypedFlatConfigItem } from '../types';

export const ignores = async (options: Readonly<OptionsIgnores>): Promise<TypedFlatConfigItem[]> => {
    const { gitignore = true, ignoreTypeScript, userIgnores } = options;

    const [eslintConfigFlatGitIgnore] = await loadPackages(['eslint-config-flat-gitignore']);

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

    if (gitignore !== false) {
        mut_configs.push(
            eslintConfigFlatGitIgnore({
                name: 'moso/ignores/gitignore',
                strict: false,
                ...(typeof gitignore === 'string'
                    ? { files: [gitignore] }
                    : typeof gitignore === 'object'
                        ? gitignore
                        : { files: ['.gitignore'] }),
            }),
        );
    }

    return mut_configs;
};
