import path from 'node:path';

import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { getPackageInfo, isPackageExists } from 'local-pkg';
import {
    astro,
    comments,
    disables,
    e18e,
    functional,
    ignores,
    imports,
    javascript,
    jsdoc,
    jsonc,
    jsx,
    nextjs,
    node,
    perfectionist,
    promise,
    react,
    regexp,
    sortPackageJson,
    sortTsconfig,
    stylistic,
    test,
    toml,
    typescript,
    unicorn,
    vue,
    yaml,
} from './configs';
import { StylisticConfigDefaults } from './configs/stylistic';
import {
    GLOB_ASTRO,
    GLOB_ASTRO_TS,
    GLOB_DTS,
    GLOB_JSON,
    GLOB_JSON5,
    GLOB_JSONC,
    GLOB_JSX,
    GLOB_MARKDOWN,
    GLOB_ROOT_DTS,
    GLOB_ROOT_JS,
    GLOB_ROOT_JSX,
    GLOB_ROOT_TS,
    GLOB_ROOT_TSX,
    GLOB_SRC,
    GLOB_TESTS,
    GLOB_TOML,
    GLOB_TS,
    GLOB_TSX,
    GLOB_VUE,
    GLOB_YAML,
} from './globs';
import {
    checkFilePath,
    getOverrides,
    isInEditorEnv,
    resolveSubOptions,
} from './utils';
import type { Linter } from 'eslint';
import type {
    Awaitable,
    ConfigNames,
    OptionsConfig,
    OptionsIgnores,
    OptionsProjectRoot,
    OptionsTypeScript,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    ProjectMode,
    TypedFlatConfigItem,
} from './types';

const AstroPackages = [
    'astro',
    '@astrojs/preact',
    '@astrojs/react',
    '@astrojs/vue',
];

const NextJSPackages = ['next'];

const ReactPackages = [
    '@astrojs/react',
    'gatsby',
    'next',
    'nextra',
    'react',
    'remix',
];

const VuePackages = [
    '@astrojs/vue',
    'nuxt',
    'vitepress',
    'vue',
];

/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options - Options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs - User configurations to be merged with the generated configurations
 * @returns {Promise<TypedFlatConfigItem[]>} - The merged ESLint configurations
 */
export async function moso(
    options: Omit<TypedFlatConfigItem, 'files'> & OptionsConfig,
    ...userConfigs: ReadonlyArray<Awaitable<Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]>>
): Promise<Linter.Config[]> {
    const {
        componentExts = [],
        isInEditor = isInEditorEnv(),
        jsdoc: jsdocOptions = false,
        jsonc: jsoncOptions = false,
        jsx: jsxOptions = true,
    } = options;

    const typescriptRequested = options.typescript ?? isPackageExists('typescript');
    const typescriptPackage = typescriptRequested === false ? undefined : await getPackageInfo('typescript');
    const typescriptVersion = typescriptPackage?.version;

    // TypeScript 7.0 does not ship with a programmatic API.
    // 7.1 will supposedly ship a new, different one, so @typescript-eslint currently cannot run against it.
    // Microsoft's supported setup is aliasing the `typescript` specifier to the 6.x compatibility package.
    // With the alias in place the resolved version reads 6.x and this gate passes
    const typescriptUnsupported = typescriptVersion !== undefined && Number(typescriptVersion.split('.')[0]) >= 7;

    if (typescriptUnsupported) {
        const message = `[@moso/eslint-config] TypeScript ${typescriptVersion} was detected, but TypeScript 7 does not ship a programmatic API, so @typescript-eslint (and therefore all TypeScript linting) cannot run against it.\n\n
            Install the TypeScript 6 compatibility package side-by-side via an npm alias:\n\n
                npm install -D typescript@npm:@typescript/typescript6\n\n
            Optionally keep TypeScript 7's own tsc available as "@typescript/native": "npm:typescript@^7.0.2".\n
            See https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0`;
        if (options.typescript !== undefined) throw new Error(message);
        console.warn(message);
    }

    const typescriptOptions = typescriptUnsupported ? false : typescriptRequested;

    const astroOptions = options.astro ?? AstroPackages.some((x) => isPackageExists(x));
    const nextjsOptions = options.nextjs ?? NextJSPackages.some((x) => isPackageExists(x));
    const reactOptions = options.react ?? ReactPackages.some((x) => isPackageExists(x));
    const vueOptions = options.vue ?? VuePackages.some((x) => isPackageExists(x));

    if (vueOptions !== false) componentExts.push('vue');

    if ('files' in options)
        throw new Error('[@moso/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');

    const e18eOptions = options.e18e === false
        ? false
        : typeof options.e18e === 'object'
            ? options.e18e
            : options.e18e === true
                ? {}
                : options.lessOpinionated === true
                    ? false
                    : {};

    const functionalEnforcement = typeof options.functional === 'string'
        ? options.functional
        : typeof options.functional === 'object'
            ? (options.functional.functionalEnforcement ?? 'recommended')
            : options.functional
                ? 'recommended'
                : (options.functional === false || options.lessOpinionated === true)
                    ? 'none'
                    : 'lite';

    const hasTypeScript = Boolean(typescriptOptions);

    const ignoreOptions: OptionsIgnores = typeof options.ignores === 'object'
        ? options.ignores
        : {};

    const modeOptions: ProjectMode = typeof options.mode === 'string' ? options.mode : 'none';

    const perfectionistOptions = typeof options.perfectionist === 'boolean'
        ? options.perfectionist
        : options.lessOpinionated !== true;

    const projectRootOptions: OptionsProjectRoot['projectRoot'] = typeof options.projectRoot === 'string'
        ? checkFilePath(options.projectRoot)
        : typeof options.typescript === 'object' && typeof options.typescript.projectRoot === 'string'
            ? checkFilePath(options.typescript.projectRoot)
            : undefined;

    const stylisticOptions = options.stylistic === false
        ? false
        : {
            ...StylisticConfigDefaults,
            jsx: typeof jsxOptions === 'boolean' ? jsxOptions : true,
            ...(typeof options.stylistic === 'object' && options.stylistic),
        };

    const {
        filesTypeAware,
        ignoresTypeAware,
        parserOptions,
        useDefaultDefaultProject,
        ...typescriptSubOptions
    } = resolveSubOptions(options, 'typescript') as
        OptionsTypeScript & OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes;

    const projectServiceUserConfig = {
        defaultProject: './tsconfig.json',
        loadTypeScriptPlugins: isInEditor,
        ...((typeof parserOptions?.projectService === 'object') && parserOptions.projectService),
    };

    const defaultFilesTypesAware = [GLOB_DTS, GLOB_TS, GLOB_TSX];

    const withRoot = (glob: string): string =>
        (projectRootOptions === undefined ? glob : path.join(projectRootOptions, glob));

    const typescriptConfigOptions: Required<OptionsTypeScriptParserOptions> = {
        ...typescriptSubOptions,
        filesTypeAware: filesTypeAware ?? defaultFilesTypesAware,
        ignoresTypeAware: ignoresTypeAware ?? [],
        parserOptions: {
            tsconfigRootDir: projectRootOptions,
            ...parserOptions,
            projectService:
                projectRootOptions === undefined || parserOptions?.projectService === false
                    ? false
                    : useDefaultDefaultProject === false
                        ? projectServiceUserConfig
                        : {
                            allowDefaultProject: [
                                withRoot(GLOB_ROOT_DTS),
                                withRoot(GLOB_ROOT_JS),
                                withRoot(GLOB_ROOT_JSX),
                                withRoot(GLOB_ROOT_TS),
                                withRoot(GLOB_ROOT_TSX),
                            ],
                            ...projectServiceUserConfig,
                        },
        },
    };

    const functionalConfigOptions = {
        functionalEnforcement,
        ignoreNamePattern: ['^[mM]ut_'],
        ...resolveSubOptions(options, 'functional'),
    };

    const mut_configs: Array<Awaitable<TypedFlatConfigItem[]>> = [
        comments({
            overrides: getOverrides(options, 'comments'),
        }),
        ignores({
            ...ignoreOptions,
            ...resolveSubOptions(options, 'ignores'),
        }),
        imports({
            ...typescriptConfigOptions,
            overrides: getOverrides(options, 'imports'),
            stylistic: stylisticOptions,
            typescript: hasTypeScript,
        }),
        javascript({
            ...functionalConfigOptions,
            isInEditor,
            lessOpinionated: options.lessOpinionated,
            perfectionist: perfectionistOptions,
            overrides: getOverrides(options, 'javascript'),
        }),
        node({
            hasReact: Boolean(reactOptions),
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'node'),
            typescript: hasTypeScript,
            ...resolveSubOptions(options, 'node'),
        }),
        promise({
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'promise'),
            typescript: hasTypeScript,
        }),
        regexp({
            overrides: getOverrides(options, 'regexp'),
        }),
        unicorn({
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'unicorn'),
        }),
    ];

    // Base configs
    if (stylisticOptions !== false) {
        mut_configs.push(
            stylistic({
                ...stylisticOptions,
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'stylistic'),
                typescript: hasTypeScript,
            }),
        );
    }

    if (astroOptions !== false) {
        mut_configs.push(
            astro({
                ...typescriptConfigOptions,
                files: [GLOB_ASTRO],
                overrides: getOverrides(options, 'astro'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
            }),
        );
    }

    if (e18eOptions !== false) {
        mut_configs.push(
            e18e({
                ...e18eOptions,
                isInEditor,
                lessOpinionated: options.lessOpinionated,
                mode: modeOptions,
                overrides: getOverrides(options, 'e18e'),
            })
        );
    }

    if (functionalEnforcement !== 'none') {
        mut_configs.push(
            functional({
                ...typescriptConfigOptions,
                ...functionalConfigOptions,
                mode: modeOptions,
                projectRoot: projectRootOptions,
                overrides: getOverrides(options, 'functional'),
                stylistic: stylisticOptions,
            }),
        );
    }

    if (jsdocOptions !== false) {
        mut_configs.push(
            jsdoc({
                overrides: getOverrides(options, 'jsdoc'),
                stylistic: stylisticOptions,
            }),
        );
    }

    if (jsoncOptions !== false) {
        mut_configs.push(
            jsonc({
                files: [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
                overrides: getOverrides(options, 'jsonc'),
                stylistic: stylisticOptions,
            }),
            sortPackageJson(),
            sortTsconfig(),
        );
    }

    if (jsxOptions !== false) {
        mut_configs.push(
            jsx({
                files: [GLOB_JSX, GLOB_TSX],
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'jsx'),
                stylistic: stylisticOptions,
                ...resolveSubOptions(options, 'jsx'),
            }),
        );
    }

    if (nextjsOptions !== false) {
        mut_configs.push(
            nextjs({
                files: [GLOB_SRC],
                mode: modeOptions,
                overrides: getOverrides(options, 'nextjs'),
            }),
        );
    }

    if (perfectionistOptions) {
        mut_configs.push(
            perfectionist({
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'perfectionist'),
            }),
        );
    }

    if (reactOptions !== false) {
        mut_configs.push(
            react({
                ...typescriptConfigOptions,
                files: [GLOB_JSX, GLOB_TS, GLOB_TSX],
                filesTypeAware: [
                    GLOB_DTS,
                    GLOB_JSX,
                    GLOB_TS,
                    GLOB_TSX,
                ],
                ignoresTypeAware: [GLOB_ASTRO_TS, `${GLOB_MARKDOWN}/**`],
                lessOpinionated: options.lessOpinionated,
                nextjs: Boolean(nextjsOptions),
                projectRoot: projectRootOptions,
                overrides: getOverrides(options, 'react'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'react'),
            }),
        );
    }

    if (options.test !== false) {
        mut_configs.push(
            test({
                files: GLOB_TESTS,
                isInEditor,
                overrides: getOverrides(options, 'test'),
            }),
        );
    }

    if (options.toml !== false) {
        mut_configs.push(
            toml({
                files: [GLOB_TOML],
                overrides: getOverrides(options, 'toml'),
                stylistic: stylisticOptions,
            }),
        );
    }

    if (typescriptOptions !== false) {
        mut_configs.push(
            typescript({
                ...functionalConfigOptions,
                ...typescriptConfigOptions,
                componentExts,
                files: [GLOB_SRC, ...componentExts.map((ext) => `**/*.${ext}`)],
                lessOpinionated: options.lessOpinionated,
                mode: modeOptions,
                overrides: getOverrides(options, 'typescript'),
                projectRoot: projectRootOptions,
                unsafe: 'warn',
            }),
        );
    }

    if (vueOptions !== false) {
        mut_configs.push(
            vue({
                ...typescriptConfigOptions,
                files: [GLOB_VUE],
                filesTypeAware: [
                    GLOB_TS,
                    GLOB_TSX,
                    GLOB_VUE,
                ],
                overrides: getOverrides(options, 'vue'),
                projectRoot: projectRootOptions,
                sfcBlocks: true,
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'vue'),
            }),
        );
    }

    if (options.yaml !== false) {
        mut_configs.push(
            yaml({
                files: [GLOB_YAML],
                overrides: getOverrides(options, 'yaml'),
                stylistic: stylisticOptions,
            }),
        );
    }

    mut_configs.push(disables());

    let mut_composer = new FlatConfigComposer<TypedFlatConfigItem, ConfigNames>().append(...mut_configs, ...userConfigs);

    if (isInEditor) {
        mut_composer = mut_composer.disableRulesFix([
            'unused-imports/no-unused-imports',
            'no-only-tests/no-only-tests',
            'prefer-const',
        ], {
            // eslint-disable-next-line @typescript-eslint/no-deprecated, unicorn/prefer-await -- ESLint 9+ deprecates builtinRules without offering a runtime replacement
            builtinRules: async () => import('eslint/use-at-your-own-risk').then((r) => r.builtinRules),
        });
    }

    return mut_composer.toConfigs();
};
