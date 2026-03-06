/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { it } from 'vitest';

import { moso } from '../src/factory';
import { full, off } from '../src/presets';

import type { OptionsConfig, TypedFlatConfigItem } from '../src/types';

type ConfigPreset = {
    configs: OptionsConfig;
    name: string;
};

const configPresets: ReadonlyArray<ConfigPreset> = [
    {
        name: 'default',
        configs: {},
    },
    {
        name: 'full-off',
        configs: off,
    },
    {
        name: 'full-on',
        configs: full,
    },
    {
        name: 'less-opinionated',
        configs: {
            lessOpinionated: true,
        },
    },
    {
        name: 'js-vue',
        configs: {
            typescript: false,
            vue: true,
        },
    },
    {
        name: 'is-in-ide',
        configs: {
            isInEditor: true,
        },
    },
];

const ignoreConfigs: ReadonlyArray<string> = ['moso/ignores', 'moso/javascript/setup'];

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const serializeConfigPresets = (configs: TypedFlatConfigItem[]) => configs.map((config) => {
    if (config.name !== undefined && ignoreConfigs.includes(config.name)) return '--ignored--';

    const mut_clone = { ...config } as any;
    if (config.plugins) mut_clone.plugins = Object.keys(config.plugins);

    if (config.languageOptions) {
        if (config.languageOptions.parser !== undefined) {
            if (typeof config.languageOptions.parser !== 'string') {
                mut_clone.languageOptions.parser = (config.languageOptions.parser as any).meta?.name ??
                    (config.languageOptions.parser as any).name ??
                    'unknown';
            }
        }
        delete mut_clone.languageOptions.globals;
        if (config.languageOptions.parserOptions !== undefined) {
            delete mut_clone.languageOptions.parserOptions.parser;
            delete mut_clone.languageOptions.parserOptions.projectService;
            delete mut_clone.languageOptions.parserOptions.projectRoot;
        }
    }

    if (config.processor !== undefined)
        if (typeof config.processor !== 'string') mut_clone.processor = (config.processor as any).meta?.name ?? 'unknown';

    if (config.rules !== undefined) {
        mut_clone.rules = Object.entries(config.rules)
            .map(([rule, value]) => {
                if (value === 'off' || value === 0) return `- ${rule}`;
                return rule;
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mut_clone;
});

configPresets.map(({ name, configs }) =>
    it.concurrent(`factory ${name}`, async ({ expect }) => {
        const config = await moso(configs);
        await expect(serializeConfigPresets(config))
            .toMatchFileSnapshot(`./__snapshots__/factory/${name}.snap.js`);
    }));
