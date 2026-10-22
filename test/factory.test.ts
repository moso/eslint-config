import path from 'node:path';

import { ESLint } from 'eslint';
import { it, vi } from 'vitest';

import { astro, baseline } from '../src/configs';
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
            jsdoc: true,
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
            security: true,
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
                gitignore: { files: ['.gitignore'], strict: false } as OptionsIgnores['gitignore'],
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
            preact: {
                a11y: true,
                overridesA11y: {
                    'jsx-a11y/no-access-key': 'off',
                },
            },
            react: {
                additionalHooks: '',
            },
            typescript: {
                projectRoot: path.resolve(import.meta.dirname, '..'),
            },
        },
        name: 'less-opinionated-type-aware',
    },
    {
        configs: {
            e18e: {
                moduleReplacements: true,
            },
            isInEditor: false,
            nextjs: {
                rootDir: 'apps/web',
            },
            perfectionist: {
                overrides: {
                    'perfectionist/sort-objects': 'off',
                },
            },
            typescript: {
                unsafe: 'off',
            },
        },
        name: 'overrides-unsafe-rootdir',
    },
    {
        configs: {
            astro: false,
            baseline: true,
            isInEditor: false,
            jsdoc: true,
            mode: 'library',
            nextjs: false,
            react: false,
            svelte: false,
            unicorn: true,
            vue: false,
        },
        name: 'has-dom',
    },
    {
        configs: {
            isInEditor: false,
            svelte: true,
            typescript: true,
        },
        name: 'svelte',
    },
    {
        configs: {
            isInEditor: false,
            lessOpinionated: true,
            stylistic: false,
            svelte: {
                overrides: {
                    'svelte/no-at-html-tags': 'off',
                },
            },
            typescript: false,
        },
        name: 'svelte-js-less-opinionated',
    },
    {
        configs: {
            isInEditor: false,
            preact: true,
            typescript: {
                projectRoot: path.resolve(import.meta.dirname, '..'),
            },
        },
        name: 'preact-type-aware',
    },
    {
        configs: {
            isInEditor: false,
            lessOpinionated: true,
            preact: {
                overrides: {
                    '@eslint-react/no-array-index-key': 'off',
                },
            },
            stylistic: false,
            typescript: false,
        },
        name: 'preact-js-less-opinionated',
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

it('lints TypeScript without type information when no `projectRoot` is set', async ({ expect }) => {
    const eslint = new ESLint({ overrideConfig: await moso({ typescript: true }), overrideConfigFile: true });
    const code = 'type Gate = { enabled: boolean; toggle: () => void };\nconst state = { count: 0 };\nstate.count += 1;\nexport type { Gate };\n';

    await expect(eslint.lintText(code, { filePath: 'scratch.ts' })).resolves.toBeDefined();
});

it.concurrent.for([
    ['TypeScript', true, '<script lang="ts">\n    let { label }: { label: string } = $props();\n\n    let count = $state(0);\n\n    const increment = (): void => {\n        count += 1;\n    };\n</script>\n\n<button type="button" onclick={increment}>{label}: {count}</button>\n'],
    ['JavaScript', false, '<script>\n    export let label;\n\n    let count = 0;\n\n    const increment = () => {\n        count += 1;\n    };\n</script>\n\n<button type="button" on:click={increment}>{label}: {count}</button>\n'],
] as const)('lints idiomatic Svelte components in $lib (%s)', async ([, typescript, code], { expect }) => {
    const eslint = new ESLint({ overrideConfig: await moso({ isInEditor: false, svelte: true, typescript }), overrideConfigFile: true });

    await expect(eslint.isPathIgnored('src/lib/Counter.svelte')).resolves.toBe(false);

    const [result] = await eslint.lintText(code, { filePath: 'src/lib/Counter.svelte' });

    expect(result.messages).toEqual([]);
});

it('parses Svelte rune modules with the Svelte parser when TypeScript is enabled', async ({ expect }) => {
    const eslint = new ESLint({ overrideConfig: await moso({ svelte: true, typescript: true }), overrideConfigFile: true });

    const configs = await Promise.all(['src/lib/counter.svelte.ts', 'src/lib/counter.svelte.js'].map(
        async (filePath) => eslint.calculateConfigForFile(filePath) as Promise<Linter.Config>,
    ));

    for (const config of configs)
        expect((config.languageOptions?.parser as Linter.Parser).meta?.name).toBe('svelte-eslint-parser');
});

it('lets Svelte rune modules use `let` without the `mut_` prefix, while `svelte/prefer-const` still applies', async ({ expect }) => {
    const eslint = new ESLint({
        overrideConfig: await moso({
            functional: 'lite',
            isInEditor: false,
            svelte: true,
            typescript: true,
        }),
        overrideConfigFile: true,
    });

    const counter = 'export const increment = (): number => {\n    let count = $state(0);\n    count += 1;\n    return count;\n};\n';
    const neverReassigned = 'export const read = (): number => {\n    let count = $state(0);\n    return count;\n};\n';

    const [[runes], [unused], [plain]] = await Promise.all([
        eslint.lintText(counter, { filePath: 'src/lib/counter.svelte.ts' }),
        eslint.lintText(neverReassigned, { filePath: 'src/lib/counter.svelte.ts' }),
        eslint.lintText(counter.replace('$state(0)', '0'), { filePath: 'src/counter.ts' }),
    ]);

    expect(runes.messages).toEqual([]);
    expect(unused.messages.map((message) => message.ruleId)).toContain('svelte/prefer-const');
    expect(plain.messages.map((message) => message.ruleId)).toEqual(expect.arrayContaining(['@typescript-eslint/naming-convention', 'functional/no-let']));
});

it('lints idiomatic Preact components, and reports hooks misuse', async ({ expect }) => {
    const eslint = new ESLint({
        overrideConfig: await moso({
            isInEditor: false,
            preact: true,
            typescript: true,
        }),
        overrideConfigFile: true,
    });

    const counter = 'import { useState } from \'preact/hooks\';\n\ntype CounterProps = {\n    readonly label: string;\n};\n\nexport const Counter = ({ label }: CounterProps) => {\n    const [count, setCount] = useState(0);\n\n    return (\n        <button class="counter" style="font-weight: bold" type="button" onClick={ () => setCount(count + 1) }>\n            {label}: {count}\n        </button>\n    );\n};\n';
    const main = 'import { render } from \'preact\';\n\nimport { Counter } from \'./counter\';\n\nrender(<Counter label="Clicks" />, document.body);\n';
    const conditionalHook = counter.replace('    const [count, setCount] = useState(0);\n', '    if (label === \'\') return null;\n\n    const [count, setCount] = useState(0);\n');

    const [[component], [entry], [broken]] = await Promise.all([
        eslint.lintText(counter, { filePath: 'src/counter.tsx' }),
        eslint.lintText(main, { filePath: 'src/main.tsx' }),
        eslint.lintText(conditionalHook, { filePath: 'src/counter.tsx' }),
    ]);

    expect(component.messages).toEqual([]);
    expect(entry.messages).toEqual([]);
    expect(broken.messages.map((message) => message.ruleId)).toContain('react-hooks/rules-of-hooks');
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

it.concurrent.for<[OptionsConfig['security'], string, string]>([
    ['lite', 'warn', 'off'],
    [{}, 'error', 'off'],
    [{ severity: 'strict' }, 'error', 'error'],
])('resolves security %o', async ([security, evalSeverity, injectionSeverity], { expect }) => {
    const configs = await moso({ security });
    const rules = configs.find((config) => config.name === 'moso/security')?.rules;

    expect(rules?.['security/detect-eval-with-expression']).toBe(evalSeverity);
    expect(rules?.['security/detect-object-injection']).toBe(injectionSeverity);
});

it('baseline tolerates omitted type-aware globs in both modes', async ({ expect }) => {
    const untyped = await baseline({
        files: ['**/*.js'],
        typescript: true,
    });

    expect(untyped).toHaveLength(2);
    expect(untyped[1].files).toEqual(['**/*.js']);

    const typed = await baseline({
        files: ['**/*.js'],
        filesTypeAware: ['**/*.ts'],
        projectRoot: import.meta.dirname,
        typescript: true,
    });

    expect(typed).toHaveLength(3);
    expect(typed[2].ignores).toEqual([]);
});

it('baseline skips Web API checks only when `hasDOM` is false', async ({ expect }) => {
    const webApisOf = (config: TypedFlatConfigItem): unknown => {
        const entry = config.rules?.['baseline-js/use-baseline'];
        return Array.isArray(entry) ? (entry[1] as { includeWebApis: unknown }).includeWebApis : undefined;
    };

    const [node, browser] = await Promise.all([
        baseline({
            files: ['**/*.js'],
            hasDOM: false,
            typescript: true,
        }),
        baseline({
            files: ['**/*.js'],
            typescript: true,
        }),
    ]);

    expect(webApisOf(node[1])).toBe(false);
    expect(webApisOf(browser[1])).toEqual({ preset: 'auto' });
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
