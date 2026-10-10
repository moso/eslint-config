import { getPackageInfo } from 'local-pkg';

import {
    GLOB_DTS,
    GLOB_ROOT_JS,
    GLOB_ROOT_JSX,
    GLOB_TS,
    GLOB_TSX,
} from './globs';
import { checkFilePath, resolveSubOptions } from './utils';

import type { OptionsConfig, ResolveTypeScriptEnvironment, TypeScriptContext } from './types';

/**
 * Resolve whether TypeScript and type-aware linting are on, once, for every config.
 *
 * @param options - The full factory options object.
 * @param environment - The factory's `isInEditor` value and cached package probe.
 * @returns The resolved TypeScript context.
 */
export const resolveTypeScript = async (
    options: Readonly<OptionsConfig>,
    environment: Readonly<ResolveTypeScriptEnvironment>,
): Promise<TypeScriptContext> => {
    const { isInEditor, packageExists } = environment;

    // TypeScript 7.0 does not currently ship with a programmatic API.
    // 7.1 will supposedly ship a new, different one, so @typescript-eslint currently cannot run against it.
    // Microsoft's supported setup is aliasing the `typescript` specifier to the 6.x compatibility package.
    // With the alias in place the resolved version reads 6.x and this gate passes
    const typescriptRequested = options.typescript ?? packageExists('typescript');
    const typescriptPackage = typescriptRequested === false ? undefined : await getPackageInfo('typescript');
    const typescriptVersion = typescriptPackage?.version;

    const typescriptUnsupported = typescriptVersion !== undefined && Number(typescriptVersion.split('.')[0]) >= 7;

    if (typescriptUnsupported) {
        const message = `[@moso/eslint-config] TypeScript ${typescriptVersion} was detected, but TypeScript 7 does not ship a programmatic API, so @typescript-eslint (and therefore all TypeScript linting) cannot run against it.\n\nInstall the TypeScript 6 compatibility package side-by-side via an npm alias:\n\n    npm install -D typescript@npm:@typescript/typescript6\n\nOptionally keep TypeScript 7's own tsc available as "@typescript/native": "npm:typescript@^7.0.2".\nSee https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0`;
        if (options.typescript !== undefined) throw new Error(message);
        console.warn(message);
    }

    const typescriptOptions = !typescriptUnsupported && typescriptRequested;
    const enabled = typescriptOptions !== false;

    const {
        filesTypeAware,
        ignoresTypeAware,
        overridesTypeAware,
        parserOptions,
        projectRoot,
        useDefaultDefaultProject,
    } = resolveSubOptions(options, 'typescript');

    const tsconfigRootDir = projectRoot === undefined ? undefined : checkFilePath(projectRoot);

    const projectServiceUserConfig = {
        defaultProject: './tsconfig.json',
        loadTypeScriptPlugins: isInEditor,
        ...((typeof parserOptions?.projectService === 'object') && parserOptions.projectService),
    };

    const projectService = tsconfigRootDir !== undefined && parserOptions?.projectService !== false && (
        useDefaultDefaultProject === false
            ? projectServiceUserConfig
            : {
                allowDefaultProject: [
                    GLOB_ROOT_JS,
                    GLOB_ROOT_JSX,
                ],
                ...projectServiceUserConfig,
            }
    );

    return {
        enabled,
        filesTypeAware: filesTypeAware ?? [GLOB_DTS, GLOB_TS, GLOB_TSX],
        ignoresTypeAware: ignoresTypeAware ?? [],
        overridesTypeAware: overridesTypeAware ?? {},
        parserOptions: {
            tsconfigRootDir,
            ...parserOptions,
            projectService,
        },
        typeAware: enabled && projectService !== false,
    };
};
