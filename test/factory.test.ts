import path from 'node:path';

import { ESLint } from 'eslint';
import { it, vi } from 'vitest';

import { astro } from '../src/configs';
import { StylisticConfigDefaults } from '../src/configs/stylistic';
import { moso } from '../src/factory';
import { full, off } from '../src/presets';

import type { Linter } from 'eslint';

import type { OptionsConfig, OptionsIgnores, TypedFlatConfigItem } from '../src/types';

type ConfigPreset = {
    configs: OptionsConfig;
    name: string;
};

const configPresets: ReadonlyArray<ConfigPreset> = [
    {
        configs: {},
        name: 'default',
    },
    {
        configs: off,
        name: 'full-off',
    },
    {
        configs: full,
        name: 'full-on',
    },
    {
        configs: {
            ignores: {
                gitignore: true,
                ignoreTypeScript: true,
                userIgnores: false,
            },
        },
        name: 'ignores',
    },
    {
        configs: {
            lessOpinionated: true,
        },
        name: 'less-opinionated',
    },
    {
        configs: {
            typescript: false,
            vue: true,
        },
        name: 'js-vue',
    },
    {
        configs: {
            isInEditor: true,
        },
        name: 'is-in-ide',
    },
    {
        configs: {
            astro: true,
            e18e: {
                moduleReplacements: false,
            },
            functional: 'strict',
            ignores: {
                gitignore: false,
                userIgnores: 'custom-ignored/**',
            },
            isInEditor: false,
            jsonc: true,
            nextjs: false,
            react: true,
            stylistic: {
                indent: 'tab',
                quotes: 'backtick',
                semi: false,
            },
            tailwind: true,
            typescript: false,
        },
        name: 'astro-react-strict',
    },
    {
        configs: {
            baseline: 2023,
            functional: true,
            ignores: {
                gitignore: '.gitignore',
                userIgnores: ['custom-ignored/**'],
            },
            isInEditor: true,
            mode: 'library',
            nextjs: true,
            node: {
                strict: true,
            },
            tailwind: {
                config: 'tailwind.config.cjs',
                version: 3,
            },
        },
        name: 'library-mode',
    },
    {
        configs: {
            baseline: 'newly',
            ignores: {
                gitignore: ['.gitignore'] as OptionsIgnores['gitignore'],
                userIgnores: (builtInGlobs) => [...builtInGlobs, 'fn-ignored/**'],
            },
            isInEditor: false,
            mode: 'application',
            node: {
                files: undefined,
                module: true,
                strict: true,
            },
            typescript: {
                disableTypeAwareRules: true,
            },
        },
        name: 'application-mode',
    },
    {
        configs: {
            baseline: {
                baseline: 'widely',
            },
            functional: {},
            isInEditor: false,
            jsdoc: true,
            jsonc: true,
            mode: 'library',
            node: {
                files: undefined,
                strict: true,
            },
            stylistic: false,
            tailwind: {
                entryPoint: 'src/styles/app.css',
            },
            vue: {
                sfcBlocks: false,
            },
        },
        name: 'stylistic-off',
    },
    {
        configs: {
            astro: {
                a11y: true,
            },
            e18e: true,
            isInEditor: false,
            jsx: {
                a11y: true,
            },
            lessOpinionated: true,
            react: {
                additionalHooks: '',
            },
            typescript: {
                projectRoot: path.resolve(import.meta.dirname, '..'),
            },
        },
        name: 'less-opinionated-type-aware',
    },
];

const ignoreConfigs: ReadonlySet<string> = new Set(['moso/ignores', 'moso/javascript/setup']);

const serializeName = (value: string | Readonly<Linter.Parser | Linter.Processor>): string => (
    typeof value === 'string' ? value : (value.meta?.name ?? 'unknown')
);

const unserializableParserOptions = new Set([
    'parser',
    'projectRoot',
    'projectService',
    'tsconfigRootDir',
]);

const serializeLanguageOptions = (languageOptions: Linter.LanguageOptions): Record<string, unknown> => {
    const {
        globals: _globals,
        parser,
        parserOptions,
        ...rest
    } = languageOptions;

    return {
        ...rest,
        ...(parser !== undefined && { parser: serializeName(parser) }),
        ...(parserOptions !== undefined && {
            parserOptions: Object.fromEntries(
                Object.entries(parserOptions).filter(([key]) =>
                    !unserializableParserOptions.has(key)),
            ),
        }),
    };
};

const serializeConfigPresets = (configs: TypedFlatConfigItem[]): unknown[] => configs.map((config) => {
    if (config.name !== undefined && ignoreConfigs.has(config.name)) return '--ignored--';

    const {
        languageOptions,
        plugins,
        processor,
        rules,
        ...rest
    } = config;

    return {
        ...rest,
        ...(plugins !== undefined && { plugins: Object.keys(plugins) }),
        ...(languageOptions !== undefined && { languageOptions: serializeLanguageOptions(languageOptions) }),
        ...(processor !== undefined && { processor: serializeName(processor) }),
        ...(rules !== undefined && {
            rules: Object.entries(rules).map(([rule, value]) => (value === 'off' || value === 0 ? `- ${rule}` : rule)),
        }),
    };
});

const collectParserOption = (configs: ReadonlyArray<Linter.Config>, key: string): unknown[] =>
    configs.reduce<unknown[]>((mut_values, config) => {
        const parserOptions: unknown = config.languageOptions?.parserOptions;
        if (typeof parserOptions !== 'object' || parserOptions === null) return mut_values;

        for (const [name, value] of Object.entries(parserOptions as Record<string, unknown>))
            if (name === key) mut_values.push(value);

        return mut_values;
    }, []);

it.concurrent.for(configPresets)('factory $name', async ({ configs, name }, { expect }) => {
    const config = await moso(configs);
    await expect(serializeConfigPresets(config))
        .toMatchFileSnapshot(`./__snapshots__/factory/${name}.snap.js`);
});

it.concurrent.for(configPresets)('eslint accepts factory $name', async ({ configs }, { expect }) => {
    const eslint = new ESLint({ overrideConfig: await moso(configs), overrideConfigFile: true });
    await expect(eslint.calculateConfigForFile('scratch.ts')).resolves.not.toThrow();
});

it('builds a config when called with no arguments', async ({ expect }) => {
    await expect(moso()).resolves.toSatisfy((configs: Linter.Config[]) => configs.length > 0);
});

it('prefers `typescript.projectRoot` over the deprecated top-level `projectRoot` and warns', async ({ expect, onTestFinished }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    onTestFinished(() => warn.mockRestore());

    const configs = await moso({
        projectRoot: 'deprecated-root',
        typescript: { projectRoot: import.meta.dirname },
    });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('`projectRoot` option is deprecated');

    const rootDirs = collectParserOption(configs, 'tsconfigRootDir');

    expect(rootDirs.length).toBeGreaterThan(0);
    expect(new Set(rootDirs)).toEqual(new Set([import.meta.dirname]));
});

it('throws when the global options contain `files`', async ({ expect }) => {
    await expect(moso({ files: ['**/*.ts'] } as never))
        .rejects.toThrow('should not contain the "files" property');
});

it('warns and uses the deprecated top-level `projectRoot` when `typescript.projectRoot` is absent', async ({ expect, onTestFinished }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    onTestFinished(() => warn.mockRestore());

    const configs = await moso({ projectRoot: import.meta.dirname });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('`projectRoot` option is deprecated');

    const rootDirs = collectParserOption(configs, 'tsconfigRootDir');

    expect(rootDirs.length).toBeGreaterThan(0);
    expect(new Set(rootDirs)).toEqual(new Set([import.meta.dirname]));
});

it('merges user `projectService` options when `useDefaultDefaultProject` is false', async ({ expect }) => {
    const configs = await moso({
        isInEditor: false,
        typescript: {
            parserOptions: { projectService: { defaultProject: './tsconfig.test.json' } },
            projectRoot: import.meta.dirname,
            useDefaultDefaultProject: false,
        },
    });

    const services = collectParserOption(configs, 'projectService')
        .filter((service) => typeof service === 'object' && service !== null);

    expect(services.length).toBeGreaterThan(0);

    for (const service of services) {
        expect(service).toMatchObject({
            defaultProject: './tsconfig.test.json',
            loadTypeScriptPlugins: false,
        });
        expect(service).not.toHaveProperty('allowDefaultProject');
    }
});

it('disables the project service when `parserOptions.projectService` is false', async ({ expect }) => {
    const configs = await moso({
        typescript: {
            parserOptions: { projectService: false },
            projectRoot: import.meta.dirname,
        },
    });

    const services = collectParserOption(configs, 'projectService');

    expect(services.length).toBeGreaterThan(0);
    expect(services.every((service) => service === false)).toBe(true);
});

it('astro enables the JSX accessibility plugin when `a11y` is set', async ({ expect }) => {
    const [strict, recommended] = await Promise.all([
        astro({
            a11y: true,
            files: ['**/*.astro'],
            overridesA11y: { 'jsx-a11y/alt-text': 'off' },
            stylistic: StylisticConfigDefaults,
            typescript: true,
        }),
        astro({
            a11y: true,
            files: ['**/*.astro'],
            lessOpinionated: true,
            stylistic: false,
            typescript: false,
        }),
    ]);

    for (const configs of [strict, recommended]) {
        expect(configs[0].plugins).toHaveProperty('jsx-a11y');
        expect(Object.keys(configs[1].rules ?? {}).some((rule) =>
            rule.startsWith('astro/jsx-a11y/'))).toBe(true);
    }

    expect(strict[1].rules?.['jsx-a11y/alt-text']).toBe('off');
});
