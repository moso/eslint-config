import fs from 'node:fs';
import process from 'node:process';
import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { isPackageExists } from 'local-pkg';

import {
    comments,
    ignores,
    imports,
    javascript,
    jsdoc,
    jsonc,
    markdown,
    node,
    perfectionist,
    react,
    sortPackageJson,
    sortTsconfig,
    stylistic,
    test,
    typescript,
    unicorns,
    vue,
    yaml
} from '@/configs';
import { interopDefault, getOverrides, resolveSubOptions } from '@/utils';

import type { Linter } from 'eslint';
import type { Awaitable, TypedFlatConfigItem, OptionsConfig } from '@/types';

const flatConfigProps: (keyof TypedFlatConfigItem)[] = [
    'files',
    'ignores',
    'languageOptions',
    'linterOptions',
    'processor',
    'plugins',
    'rules',
    'settings',
];

const VuePackages = [
    '@slidev/cli',
    'nuxt',
    'vitepress',
    'vue',
];

const ReactPackages = [
    'gatsby',
    'next',
    'nextra',
    'react',
    'remix',
];

/**
 * Construct an array of ESLint flat config items.
 */
export const moso = (
    options: OptionsConfig & TypedFlatConfigItem = {},
    ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any> | Linter.FlatConfig[]>[]
): FlatConfigComposer<TypedFlatConfigItem> => {
    const {
        componentExts = [],
        gitignore: enableGitignore = true,
        isInEditor = !!((process.env.VSCODE_PID || process.env.VSCODE_CWD || process.env.JETBRAINS_IDE || process.env.VIM) && !process.env.CI),
        react: enableReact = ReactPackages.some(x => isPackageExists(x)),
        typescript: enableTypeScript = isPackageExists('typescript'),
        vue: enableVue = VuePackages.some(x => isPackageExists(x)),
    } = options;

    const stylisticOptions = options.stylistic === false
        ? false
        : typeof options.stylistic === 'object'
            ? options.stylistic
            : {};

    if (stylisticOptions && !('jsx' in stylisticOptions)) stylisticOptions.jsx = options.jsx ?? true;

    const configs: Awaitable<TypedFlatConfigItem[]>[] = [];

    if (enableGitignore) {
        if (typeof enableGitignore !== 'boolean') {
            configs.push(interopDefault(import('eslint-config-flat-gitignore')).then(x => [x(enableGitignore)]));
        } else {
            if (fs.existsSync('.gitignore'))
                configs.push(interopDefault(import('eslint-config-flat-gitignore')).then(x => [x()]));
        }
    }

    // Base configs
    configs.push(
        ignores(),
        javascript({
            isInEditor,
            overrides: getOverrides(options, 'javascript'),
        }),
        stylistic(),
        comments(),
        node(),
        jsdoc({ stylistic: stylisticOptions }),
        imports({ stylistic: stylisticOptions }),
        unicorns(),

        // Optional plugin
        perfectionist(),
    );

    if (enableVue) componentExts.push('vue');

    if (enableReact) componentExts.push('react');

    if (options.jsonc ?? true) {
        configs.push(
            jsonc({
                overrides: getOverrides(options, 'jsonc'),
                stylistic: stylisticOptions,
            }),
            sortPackageJson(),
            sortTsconfig(),
        );
    }

    if (options.markdown ?? true) {
        configs.push(markdown({
            componentExts,
            overrides: getOverrides(options, 'markdown'),
        }));
    }

    if (enableReact) {
        configs.push(react({
            overrides: getOverrides(options, 'react'),
            typescript: !!enableTypeScript,
        }));
    }

    if (stylisticOptions) {
        configs.push(stylistic({
            ...stylisticOptions,
            overrides: getOverrides(options, 'stylistic'),
        }));
    }

    if (options.test ?? true) {
        configs.push(test({
            isInEditor,
            overrides: getOverrides(options, 'test'),
        }));
    }

    if (enableTypeScript) {
        configs.push(typescript({
            ...typeof enableTypeScript !== 'boolean'
                ? enableTypeScript
                : {},
            ...resolveSubOptions(options, 'typescript'),
            componentExts,
            overrides: getOverrides(options, 'typescript'),
        }));
    }

    if (enableVue) {
        configs.push(vue({
            ...resolveSubOptions(options, 'vue'),
            overrides: getOverrides(options, 'vue'),
            stylistic: stylisticOptions,
            typescript: !!enableTypeScript,
        }));
    }

    if (options.yaml ?? true) {
        configs.push(yaml({
            overrides: getOverrides(options, 'yaml'),
            stylistic: stylisticOptions,
        }));
    }

    // User can optionally pass a flat config item to the first argument
    // We pick the known keys as ESLint would do schema validation
    const fusedConfig = flatConfigProps.reduce((acc, key) => {
        if (key in options) acc[key] = options[key] as any;
        return acc
    }, {} as TypedFlatConfigItem);

    if (Object.keys(fusedConfig).length) configs.push([fusedConfig]);

    let pipeline = new FlatConfigComposer<TypedFlatConfigItem>();

    pipeline = pipeline.append(
        ...configs,
        ...userConfigs as any,
    );

    return pipeline;
};
