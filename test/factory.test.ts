import { it, vi } from 'vitest';

import { moso } from '../src/factory';
import { full, off } from '../src/presets';

import type { Linter } from 'eslint';

import type { OptionsConfig, TypedFlatConfigItem } from '../src/types';

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
                Object.entries(parserOptions).filter(([key]) => !unserializableParserOptions.has(key)),
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

it.concurrent.for(configPresets)('factory $name', async ({ configs, name }, { expect }) => {
    const config = await moso(configs);
    await expect(serializeConfigPresets(config))
        .toMatchFileSnapshot(`./__snapshots__/factory/${name}.snap.js`);
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

    const rootDirs = configs.flatMap((config) => {
        const parserOptions: unknown = config.languageOptions?.parserOptions;
        return typeof parserOptions === 'object' &&
            parserOptions !== null &&
            'tsconfigRootDir' in parserOptions &&
            typeof parserOptions.tsconfigRootDir === 'string'
            ? [parserOptions.tsconfigRootDir]
            : [];
    });

    expect(rootDirs.length).toBeGreaterThan(0);
    expect(new Set(rootDirs)).toEqual(new Set([import.meta.dirname]));
});
