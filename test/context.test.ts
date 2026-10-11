import { expect, it } from 'vitest';

import { resolveTypeScript } from '../src/context';
import {
    GLOB_DTS,
    GLOB_ROOT_JS,
    GLOB_ROOT_JSX,
    GLOB_TS,
    GLOB_TSX,
} from '../src/globs';

import type { OptionsConfig, ResolveTypeScriptEnvironment, TypeScriptContext } from '../src/types';

type Case = {
    environment?: Partial<ResolveTypeScriptEnvironment>;
    expected: TypeScriptContext;
    name: string;
    options: OptionsConfig;
};

const projectRoot = import.meta.dirname;

const environment = (overrides: Readonly<Partial<ResolveTypeScriptEnvironment>> = {}): ResolveTypeScriptEnvironment => ({
    isInEditor: false,
    packageExists: () => true,
    ...overrides,
});

const untyped: TypeScriptContext = {
    enabled: true,
    filesTypeAware: [GLOB_DTS, GLOB_TS, GLOB_TSX],
    ignoresTypeAware: [],
    overridesTypeAware: {},
    parserOptions: { projectService: false },
    typeAware: false,
};

const defaultProjectService = {
    allowDefaultProject: [GLOB_ROOT_JS, GLOB_ROOT_JSX],
    defaultProject: './tsconfig.json',
    loadTypeScriptPlugins: false,
};

it.for<Case>([
    {
        expected: { ...untyped, enabled: false },
        name: 'is disabled by `typescript: false`',
        options: { typescript: false },
    },
    {
        environment: { packageExists: () => false },
        expected: { ...untyped, enabled: false },
        name: 'is disabled when the typescript package is absent',
        options: {},
    },
    {
        expected: untyped,
        name: 'lints without type information by default',
        options: { typescript: true },
    },
    {
        expected: {
            ...untyped,
            parserOptions: { projectService: defaultProjectService, tsconfigRootDir: projectRoot },
            typeAware: true,
        },
        name: 'turns type-aware on with `projectRoot`',
        options: { typescript: { projectRoot } },
    },
    {
        expected: {
            ...untyped,
            parserOptions: {
                projectService: { defaultProject: './tsconfig.json', loadTypeScriptPlugins: false },
                tsconfigRootDir: projectRoot,
            },
            typeAware: true,
        },
        name: 'drops `allowDefaultProject` when `useDefaultDefaultProject` is false',
        options: { typescript: { projectRoot, useDefaultDefaultProject: false } },
    },
    {
        expected: {
            ...untyped,
            parserOptions: { projectService: false, tsconfigRootDir: projectRoot },
        },
        name: 'stays untyped when `parserOptions.projectService` is false',
        options: { typescript: { parserOptions: { projectService: false }, projectRoot } },
    },
    {
        expected: {
            ...untyped,
            parserOptions: {
                projectService: { ...defaultProjectService, loadTypeScriptPlugins: true },
                tsconfigRootDir: projectRoot,
            },
            typeAware: true,
        },
        name: 'merges a user `projectService` over the defaults',
        options: { typescript: { parserOptions: { projectService: { loadTypeScriptPlugins: true } }, projectRoot } },
    },
    {
        environment: { isInEditor: true },
        expected: {
            ...untyped,
            parserOptions: {
                projectService: { ...defaultProjectService, loadTypeScriptPlugins: true },
                tsconfigRootDir: projectRoot,
            },
            typeAware: true,
        },
        name: 'loads TypeScript plugins in the editor',
        options: { typescript: { projectRoot } },
    },
    {
        expected: {
            ...untyped,
            filesTypeAware: ['a'],
            ignoresTypeAware: ['b'],
            overridesTypeAware: { 'x/y': 'off' },
        },
        name: 'carries the type-aware globs and overrides through',
        options: { typescript: { filesTypeAware: ['a'], ignoresTypeAware: ['b'], overridesTypeAware: { 'x/y': 'off' } } },
    },
])('resolveTypeScript $name', async ({ environment: overrides, expected, options }) => {
    await expect(resolveTypeScript(options, environment(overrides))).resolves.toEqual(expected);
});

it('resolveTypeScript rejects a padded `projectRoot`', async () => {
    await expect(resolveTypeScript({ typescript: { projectRoot: ' padded ' } }, environment()))
        .rejects.toThrow('leading/trailing whitespace');
});
