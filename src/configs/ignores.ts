import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import { GLOB_EXCLUDE } from '../globs';
import { loadPackages } from '../utils';

import type {
    OptionsIgnoreFiles,
    OptionsIgnores,
    OptionsProjectRoot,
    TypedFlatConfigItem,
} from '../types';

export const ignores = async (
    options: Readonly<
        OptionsIgnoreFiles &
        OptionsProjectRoot &
        { ignores: OptionsIgnores }
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        ignoreFiles,
        ignores: ignoreOptions,
        projectRoot,
    } = options;

    const includeIgnoreFile = ignoreFiles.length === 0
        ? undefined
        : await loadPackages(['@eslint/compat']).then(([x]) => (x as typeof import('@eslint/compat')).includeIgnoreFile);

    const [extend, files] = Array.isArray(ignoreOptions)
        ? [true, ignoreOptions]
        : [ignoreOptions.extend, ignoreOptions.files];

    const ignoreFileConfigs = typeof projectRoot === 'string'
        ? (await Promise.all(
            ignoreFiles.map(async (file) => {
                assert(includeIgnoreFile !== undefined);
                const filePath = path.resolve(projectRoot, file);
                return fs
                    .access(filePath)
                    .then(() => includeIgnoreFile(filePath))
                    .catch(() => {
                        console.warn(`Ignore file "${filePath} not found.`);
                        return null;
                    });
            }),
        ))
        : undefined;

    const ignoreConfig = {
        name: 'eslint/ignores',
        ignores: extend
            ? [...GLOB_EXCLUDE, ...files]
            : [...files],
    };

    return [
        ignoreConfig,
        ...((ignoreFileConfigs
            ? [...ignoreFileConfigs.filter(<T>(v: null | T): v is T => v !== null)]
            : []) satisfies TypedFlatConfigItem[]
        ),
    ];
};
