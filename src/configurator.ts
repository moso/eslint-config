import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { isPackageExists } from 'local-pkg';

import {
    comments,
    disables,
    ignores,
    imports,
    javascript,
    jsdoc,
    jsonc,
    jsx,
    node,
    perfectionist,
    react,
    sortPackageJson,
    sortTsconfig,
    stylistic,
    test,
    typescript,
    unicorn,
    vue,
    yaml,
} from './configs';
import { getOverrides, interopDefault, isInEditorEnv, resolveSubOptions } from './utils';

import type { Linter } from 'eslint';
import type { Awaitable, ConfigNames, OptionsConfig, TypedFlatConfigItem } from './types';

const flatConfigProps = [
    'languageOptions',
    'linterOptions',
    'name',
    'processor',
    'plugins',
    'rules',
    'settings',
] satisfies (keyof TypedFlatConfigItem)[];

const VuePackages = [
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
    options: OptionsConfig & Omit<TypedFlatConfigItem, 'files'> = {},
    ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> => {
    const {
        componentExts = [],
        gitignore: enableGitignore = true,
        jsx: enableJsx = true,
        react: enableReact = ReactPackages.some((x) => isPackageExists(x)),
        typescript: enableTypeScript = isPackageExists('typescript'),
        unicorn: enableUnicorn = true,
        vue: enableVue = VuePackages.some((x) => isPackageExists(x)),
    } = options;

    let isInEditor = options.isInEditor;
    if (isInEditor == null) {
        isInEditor = isInEditorEnv();
        if (isInEditor) {
            // eslint-disable-next-line no-console
            console.log('[@moso/eslint-config] Detected running in editor, some rules are disabled.');
        }
    }

    const stylisticOptions = options.stylistic === false
        ? false
        : typeof options.stylistic === 'object'
            ? options.stylistic
            : {};

    if (stylisticOptions && !('jsx' in stylisticOptions)) stylisticOptions.jsx = enableJsx;

    const configs: Awaitable<TypedFlatConfigItem[]>[] = [];

    if (enableGitignore) {
        if (typeof enableGitignore !== 'boolean') {
            configs.push(interopDefault(import('eslint-config-flat-gitignore')).then((x) => [x({
                name: 'moso/gitignore',
                ...enableGitignore,
            })]));
        } else {
            configs.push(interopDefault(import('eslint-config-flat-gitignore')).then((x) => [x({
                name: 'moso/gitignore',
                strict: false,
            })]));
        }
    }

    const typescriptOptions = resolveSubOptions(options, 'typescript');
    const tsconfigPath = 'tsconfigPath' in typescriptOptions ? typescriptOptions.tsconfigPath : undefined;

    // Base configs
    configs.push(
        ignores(options.ignores),
        javascript({ overrides: getOverrides(options, 'javascript') }),
        comments(),
        node(),
        jsdoc({ stylistic: stylisticOptions }),
        imports({ stylistic: stylisticOptions }),
        perfectionist(),
    );

    if (enableUnicorn) configs.push(unicorn(enableUnicorn === true ? {} : enableUnicorn));

    if (enableVue) componentExts.push('vue');

    if (enableJsx) configs.push(jsx());

    if (enableTypeScript) {
        configs.push(typescript({
            ...typescriptOptions,
            componentExts,
            overrides: getOverrides(options, 'typescript'),
        }));
    }

    if (stylisticOptions) {
        configs.push(stylistic({
            ...stylisticOptions,
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'stylistic'),
        }));
    }

    if (options.test ?? true) configs.push(test({ overrides: getOverrides(options, 'test') }));

    if (enableVue) {
        configs.push(vue({
            ...resolveSubOptions(options, 'vue'),
            overrides: getOverrides(options, 'vue'),
            stylistic: stylisticOptions,
            typescript: !!enableTypeScript,
        }));
    }

    if (enableReact) {
        configs.push(react({
            ...typescriptOptions,
            overrides: getOverrides(options, 'react'),
            tsconfigPath,
        }));
    }

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

    if (options.yaml ?? true) {
        configs.push(yaml({
            overrides: getOverrides(options, 'yaml'),
            stylistic: stylisticOptions,
        }));
    }

    configs.push(
        disables(),
    );

    if ('files' in options)
        throw new Error('[@moso/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');

    // User can optionally pass a flat config item to the first argument
    // We pick the known keys as ESLint would do schema validation
    const fusedConfig = flatConfigProps.reduce((acc, key) => {
        if (key in options) acc[key] = options[key] as any;
        return acc;
    }, {} as TypedFlatConfigItem);
    if (Object.keys(fusedConfig).length) configs.push([fusedConfig]);

    let composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>();

    composer = composer.append(
        ...configs,
        ...userConfigs as any,
    );

    if (isInEditor) {
        composer = composer.disableRulesFix([
            'unused-imports/no-unused-imports',
            'no-only-tests/no-only-tests',
            'prefer-const',
        ], {
            builtinRules: () => import(['eslint', 'use-at-your-own-risk'].join('/')).then((x) => x.builtinRules),
        });
    }

    return composer;
};
