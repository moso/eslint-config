import { FlatConfigComposer } from 'eslint-flat-config-utils';
import { getPackageInfo, isPackageExists } from 'local-pkg';
import {
    astro,
    baseline,
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
    tailwind,
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
    GLOB_JS,
    GLOB_JSON,
    GLOB_JSON5,
    GLOB_JSONC,
    GLOB_JSX,
    GLOB_MARKDOWN,
    GLOB_ROOT_JS,
    GLOB_ROOT_JSX,
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
    OptionsBaseline,
    OptionsConfig,
    OptionsIgnores,
    OptionsProjectRoot,
    OptionsTailwind,
    OptionsTypeScript,
    OptionsTypeScriptParserOptions,
    OptionsTypeScriptWithTypes,
    ProjectMode,
    RequiredOptionsTailwind,
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
 * @param {OptionsConfig & TypedFlatConfigItem} [options={}] - Options for generating the ESLint configurations.
 * @param {Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]} userConfigs - User configurations to be merged with the generated configurations
 * @returns {Promise<TypedFlatConfigItem[]>} - The merged ESLint configurations
 */
export async function moso(
    options: Omit<TypedFlatConfigItem, 'files' | 'ignores'> & OptionsConfig = {},
    ...userConfigs: ReadonlyArray<Awaitable<Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]>>
): Promise<Linter.Config[]> {
    const {
        componentExts: componentExtsOption = [],
        isInEditor = isInEditorEnv(),
        jsdoc: jsdocOptions = false,
        jsonc: jsoncOptions = false,
        jsx: jsxOptions = true,
    } = options;

    if ('files' in options)
        throw new Error('[@moso/eslint-config] The first argument should not contain the "files" property as the options are supposed to be global. Place it in the second or later config instead.');

    const mut_packageExistsCache = new Map<string, boolean>();
    const packageExists = (name: string): boolean => {
        const cached = mut_packageExistsCache.get(name);
        if (cached !== undefined) return cached;

        const found = isPackageExists(name);
        mut_packageExistsCache.set(name, found);
        return found;
    };

    // eslint-disable-next-line functional/prefer-tacit -- the tacit form trips unicorn/no-array-callback-reference and keeps `.some`'s index/array arguments away from the unary cache
    const anyPackageExists = (names: ReadonlyArray<string>): boolean => names.some((x) => packageExists(x));

    // TypeScript 7.0 does not ship with a programmatic API.
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

    const typescriptOptions = typescriptUnsupported ? false : typescriptRequested;

    const astroOptions = options.astro ?? anyPackageExists(AstroPackages);
    const nextjsOptions = options.nextjs ?? anyPackageExists(NextJSPackages);
    const reactOptions = options.react ?? anyPackageExists(ReactPackages);
    const tailwindOptions = options.tailwind ?? packageExists('tailwindcss');
    const vueOptions = options.vue ?? anyPackageExists(VuePackages);

    const componentExts = vueOptions === false ? [...componentExtsOption] : [...new Set([...componentExtsOption, 'vue'])];

    const baselineOptions = options.baseline === false
        ? false
        : typeof options.baseline === 'object'
            ? options.baseline
            : (typeof options.baseline === 'string' || typeof options.baseline === 'number')
                ? { baseline: options.baseline as OptionsBaseline['baseline'] }
                : {};

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
            ? (options.functional.functionalEnforcement ?? 'lite')
            : options.functional
                ? 'recommended'
                : (options.functional === false || options.lessOpinionated === true)
                    ? 'none'
                    : 'lite';

    const hasTypeScript = Boolean(typescriptOptions);

    const ignoreOptions: OptionsIgnores = typeof options.ignores === 'object'
        ? options.ignores
        : {};

    const modeOptions: ProjectMode = typeof options.mode === 'string'
        ? options.mode
        : 'none';

    const perfectionistOptions = typeof options.perfectionist === 'boolean'
        ? options.perfectionist
        : options.lessOpinionated !== true;

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
        projectRoot: typescriptProjectRoot,
        unsafe: typescriptUnsafe,
        useDefaultDefaultProject,
        ...typescriptSubOptions
    } = resolveSubOptions(options, 'typescript') as
        OptionsTypeScript & OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes;

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- compat shim for the deprecated top-level option
    const deprecatedProjectRoot = options.projectRoot;

    if (deprecatedProjectRoot !== undefined)
        console.warn('[@moso/eslint-config] The top-level `projectRoot` option is deprecated. Move it inside the `typescript` options instead: `typescript: { projectRoot: import.meta.dirname }`.');

    const projectRootOptions: OptionsProjectRoot['projectRoot'] = typeof typescriptProjectRoot === 'string'
        ? checkFilePath(typescriptProjectRoot)
        : typeof deprecatedProjectRoot === 'string'
            ? checkFilePath(deprecatedProjectRoot)
            : undefined;

    const projectServiceUserConfig = {
        defaultProject: './tsconfig.json',
        loadTypeScriptPlugins: isInEditor,
        ...((typeof parserOptions?.projectService === 'object') && parserOptions.projectService),
    };

    const defaultFilesTypesAware = [GLOB_DTS, GLOB_TS, GLOB_TSX];

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
                                GLOB_ROOT_JS,
                                GLOB_ROOT_JSX,
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

    if (options.comments !== false) {
        mut_configs.push(
            comments({
                overrides: getOverrides(options, 'comments'),
            }),
        );
    }

    if (options.ignores !== false) {
        mut_configs.push(
            ignores({
                ...ignoreOptions,
                ...resolveSubOptions(options, 'ignores'),
            }),
        );
    }

    if (options.imports !== false) {
        mut_configs.push(
            imports({
                ...typescriptConfigOptions,
                files: [GLOB_DTS, GLOB_TS, GLOB_TSX],
                overrides: getOverrides(options, 'imports'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
            }),
        );
    }

    mut_configs.push(
        javascript({
            ...functionalConfigOptions,
            isInEditor,
            lessOpinionated: options.lessOpinionated,
            perfectionist: perfectionistOptions,
            overrides: getOverrides(options, 'javascript'),
        }),
    );

    if (options.node !== false) {
        mut_configs.push(
            node({
                files: [GLOB_SRC],
                hasReact: Boolean(reactOptions),
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'node'),
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'node'),
            }),
        );
    }

    if (options.promise !== false) {
        mut_configs.push(
            promise({
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'promise'),
                typescript: hasTypeScript,
            }),
        );
    }

    if (options.regexp !== false) {
        mut_configs.push(
            regexp({
                overrides: getOverrides(options, 'regexp'),
            }),
        );
    }

    if (options.unicorn !== false) {
        mut_configs.push(
            unicorn({
                files: [GLOB_SRC],
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'unicorn'),
            }),
        );
    }

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

    if (baselineOptions !== false) {
        mut_configs.push(
            baseline({
                ...baselineOptions,
                ...typescriptConfigOptions,
                files: [
                    GLOB_JS,
                    GLOB_JSX,
                    ...(astroOptions === false ? [] : [GLOB_ASTRO]),
                ],
                filesTypeAware: [GLOB_TS, GLOB_TSX],
                overrides: getOverrides(options, 'baseline'),
                projectRoot: projectRootOptions,
                typescript: hasTypeScript,
            }),
        );
    }

    if (astroOptions !== false) {
        mut_configs.push(
            astro({
                ...typescriptConfigOptions,
                files: [GLOB_ASTRO],
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'astro'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'astro'),
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
                ...functionalConfigOptions,
                ...typescriptConfigOptions,
                mode: modeOptions,
                overrides: getOverrides(options, 'functional'),
                stylistic: stylisticOptions,
            }),
        );
    }

    if (jsdocOptions !== false) {
        mut_configs.push(
            jsdoc({
                files: [GLOB_SRC],
                lessOpinionated: options.lessOpinionated,
                overrides: getOverrides(options, 'jsdoc'),
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'jsdoc'),
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
                ...resolveSubOptions(options, 'nextjs'),
            }),
        );
    }

    if (perfectionistOptions) {
        mut_configs.push(
            perfectionist({
                overrides: getOverrides(options, 'perfectionist'),
            }),
        );
    }

    if (reactOptions !== false) {
        mut_configs.push(
            react({
                ...typescriptConfigOptions,
                files: [GLOB_SRC],
                filesTypeAware: defaultFilesTypesAware,
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
                ...functionalConfigOptions,
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
                stylistic: stylisticOptions,
                unsafe: typescriptUnsafe ?? 'warn',
            }),
        );
    }

    if (vueOptions !== false) {
        mut_configs.push(
            vue({
                ...typescriptConfigOptions,
                files: [GLOB_VUE],
                overrides: getOverrides(options, 'vue'),
                sfcBlocks: true,
                stylistic: stylisticOptions,
                typescript: hasTypeScript,
                ...resolveSubOptions(options, 'vue'),
            }),
        );
    }

    if (tailwindOptions !== false) {
        const resolvedTailwind: OptionsTailwind = tailwindOptions === true ? {} : tailwindOptions;
        const tailwindConfigOptions: Omit<RequiredOptionsTailwind, 'overrides'> = 'entryPoint' in resolvedTailwind
            ? {
                config: undefined,
                entryPoint: resolvedTailwind.entryPoint,
                version: resolvedTailwind.version ?? 4,
            }
            : {
                config: resolvedTailwind.config ?? 'tailwind.config.js',
                entryPoint: undefined,
                version: resolvedTailwind.version ?? 3,
            };

        mut_configs.push(
            tailwind({
                ...tailwindConfigOptions,
                overrides: getOverrides(options, 'tailwind'),
                stylistic: stylisticOptions,
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

    mut_configs.push(disables(functionalEnforcement !== 'none'));

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
