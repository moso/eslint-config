import { isPackageExists } from 'local-pkg';

import {
    astro,
    comments,
    disables,
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
    GLOB_DTS,
    GLOB_JSON,
    GLOB_JSON5,
    GLOB_JSONC,
    GLOB_JSX,
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
    loadPackages,
    resolveSubOptions,
} from './utils';

import type { Linter } from 'eslint';
import type {
    Awaitable,
    ConfigNames,
    OptionsConfig,
    OptionsTypeScript,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    ProjectMode,
    TypedFlatConfigItem,
} from './types';

const NextJSPackages = ['next'];

const ReactPackages = [
    'gatsby',
    'next',
    'nextra',
    'react',
    'remix',
];

const VuePackages = [
    'nuxt',
    'vitepress',
    'vue',
];

/**
 * Construct an array of ESLint flat config items.
 *
 * @param {OptionsConfig & TypedFlatConfigItem} options - Options for generating the ESLint configurations.
 * @param {ReadonlyArray<Awaitable<Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]>>} userConfigs - User configurations to be merged with the generated configurations
 * @returns {Promise<TypedFlatConfigItem[]>} - The merged ESLint configurations
 */
export async function moso(
    options: Omit<TypedFlatConfigItem, 'files'> & OptionsConfig,
    ...userConfigs: ReadonlyArray<Awaitable<Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]>>
): Promise<TypedFlatConfigItem[]> {
    const [FlatConfigComposer] = await loadPackages(['eslint-flat-config-utils']).then(
        ([a]) => [(a as typeof import('eslint-flat-config-utils')).FlatConfigComposer] as const,
    );

    const {
        astro: astroOptions = false,
        componentExts = [],
        ignores: ignoreOptions,
        ignoresFiles: ignoresFilesOptions = ['.gitignore'],
        isInEditor = isInEditorEnv(),
        jsdoc: jsdocOptions = false,
        jsonc: jsoncOptions = false,
        jsx: jsxOptions = true,
        nextjs: nextjsOptions = NextJSPackages.some((x) => isPackageExists(x)),
        projectRoot,
        react: reactOptions = ReactPackages.some((x) => isPackageExists(x)),
        test: testOptions = true,
        toml: tomlOptions = false,
        typescript: typescriptOptions = isPackageExists('typescript'),
        vue: vueOptions = VuePackages.some((x) => isPackageExists(x)),
        yaml: yamlOptions = false,
    } = options;

    if ('files' in options)
        throw new Error('[@moso/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');

    const validatedProjectRoot = typeof projectRoot === 'string' ? await checkFilePath(projectRoot) : undefined;

    const ignoreConfigOptions = Boolean(validatedProjectRoot);

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

    const modeOptions: ProjectMode = (typeof options.mode === 'string' && options.mode !== 'none')
        ? options.mode
        : 'none';

    const perfectionistOptions = typeof options.perfectionist === 'boolean'
        ? options.perfectionist
        : options.lessOpinionated !== false;

    const stylisticOptions = options.stylistic === false
        ? false
        : typeof options.stylistic === 'object'
            ? {
                ...StylisticConfigDefaults,
                jsx: jsxOptions,
                ...options.stylistic,
            }
            : StylisticConfigDefaults;

    const {
        filesTypeAware,
        parserOptions,
        useDefaultDefaultProject,
        ...typescriptSubOptions
    } = resolveSubOptions(options, 'typescript') as OptionsTypeScript & OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes;

    const projectServiceUserConfig = {
        defaultProject: './tsconfig.json',
        loadTypeScriptPlugins: isInEditor,
        ...typeof parserOptions?.projectService === 'object' ? parserOptions.projectService : undefined,
    };

    const defaultFilesTypesAware = [GLOB_DTS, GLOB_TS, GLOB_TSX];

    const typescriptConfigOptions: Required<OptionsTypeScriptParserOptions> = {
        ...typescriptSubOptions,
        filesTypeAware: filesTypeAware ?? defaultFilesTypesAware,
        parserOptions: {
            tsconfigRootDir: validatedProjectRoot,
            ...parserOptions,
            projectService:
                parserOptions?.projectService === false || options.projectRoot === undefined
                    ? false
                    : useDefaultDefaultProject === false
                        ? projectServiceUserConfig
                        : {
                            allowDefaultProject: [
                                GLOB_ROOT_DTS,
                                GLOB_ROOT_JS,
                                GLOB_ROOT_JSX,
                                GLOB_ROOT_TS,
                                GLOB_ROOT_TSX,
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

    const mut_configs: Array<Awaitable<TypedFlatConfigItem[]>> = [];

    // Base configs
    mut_configs.push(
        comments({
            overrides: getOverrides(options, 'comments'),
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
            hasTypeScript: Boolean(typescriptOptions),
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'node'),
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
            ...functionalConfigOptions,
            lessOpinionated: options.lessOpinionated,
            overrides: getOverrides(options, 'unicorn'),
        }),
    );

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

    if (functionalEnforcement !== 'none' || modeOptions === 'library') {
        mut_configs.push(
            functional({
                ...typescriptConfigOptions,
                ...functionalConfigOptions,
                mode: modeOptions,
                overrides: getOverrides(options, 'functional'),
                stylistic: stylisticOptions,
            }),
        );
    }

    if (ignoreConfigOptions) {
        mut_configs.push(
            ignores({
                ignores: ignoreOptions ?? [],
                ignoreFiles: ignoresFilesOptions,
                projectRoot: validatedProjectRoot,
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

    if (jsxOptions) {
        mut_configs.push(
            jsx({
                files: [GLOB_JSX, GLOB_TSX],
            }),
        );
    }

    if (nextjsOptions !== false) {
        mut_configs.push(
            nextjs({
                files: [GLOB_SRC],
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
                lessOpinionated: options.lessOpinionated,
                projectRoot,
                overrides: getOverrides(options, 'react'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'react'),
            }),
        );
    }

    if (stylisticOptions !== false) {
        mut_configs.push(
            stylistic({
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'stylistic'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
            }),
        );
    }

    if (testOptions !== false) {
        mut_configs.push(
            test({
                files: GLOB_TESTS,
                overrides: getOverrides(options, 'test'),
            }),
        );
    }

    if (tomlOptions !== false) {
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
                projectRoot,
                unsafe: 'warn',
            }),
        );
    }

    if (vueOptions !== false) {
        componentExts.push('vue');

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
                projectRoot,
                sfcBlocks: true,
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'vue'),
            }),
        );
    }

    if (yamlOptions) {
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            builtinRules: async () => import('eslint/use-at-your-own-risk').then((r) => r.builtinRules),
        });
    }

    return mut_composer;
}
