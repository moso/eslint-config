/* eslint-disable perfectionist/sort-modules */
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint, Linter } from 'eslint';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { ConfigWithExtends } from 'eslint-flat-config-utils';
import type { Options as VueBlocksOptions } from 'eslint-processor-vue-blocks';

import type { GLOB_EXCLUDE } from './globs';
import type { RuleOptions as Rules } from './typegen';

export type Awaitable<T> = Promise<T> | T;
export type ProjectMode = 'application' | 'library' | 'none';
// export type Rules = Record<string, Linter.RuleEntry<any> | undefined> & RuleOptions;

export type ConfigOptions = {
    /**
     * Enable ESLint comments.
     *
     * @see https://eslint-community.github.io/eslint-plugin-eslint-comments
     * @default true
     */
    comments?: boolean | OptionsOverrides;

    /**
     * Enable options for e18e.
     *
     * @see https://github.com/e18e/eslint-plugin
     *
     * @default true
     */
    e18e?: boolean | OptionsE18e;

    /**
     * Enforce import best practices
     *
     * @see https://github.com/9romise/eslint-plugin-import-lite
     * @default true
     */
    imports?: boolean | OptionsOverrides;

    /**
     * Enable JSDoc support.
     *
     * @default false
     */
    jsdoc?: boolean | OptionsJSDoc;

    /**
     * Enforce Promises best practices.
     *
     * @see https://github.com/eslint-community/eslint-plugin-promise
     */
    promise?: boolean | OptionsOverrides;

    /**
     * Enable regex rules.
     *
     * @see https://ota-meshi.github.io/eslint-plugin-regexp
     * @see https://github.com/BrainMaestro/eslint-plugin-optimize-regex
     * @default true
     */
    regexp?: boolean | OptionsOverrides;

    /**
     * Enable test support.
     *
     * @default true
     */
    test?: boolean | OptionsOverrides;

    /**
     * Options for eslint-plugin-unicorn.
     *
     * @default true
     */
    unicorn?: boolean | OptionsOverrides;
};

export type CoreOptions = {
    /**
     * Extend the global ignores.
     *
     * Passing an array to extends the ignores.
     * Passing a function to modify the default ignores.
     */
    ignores?: boolean | OptionsIgnores;

    /**
     * Control to disable some rules in editors.
     *
     * @default auto-detect based on the process.env
     */
    isInEditor?: boolean;

    /**
     * Disables opinionated rules.
     *
     * Configs disabled entirely:
     * - Functional programming
     * - Perfectionist
     *
     * @default false
     */
    lessOpinionated?: OptionsLessOpinionated['lessOpinionated'];

    /**
     * What are we linting?
     */
    mode?: ProjectMode;

    /**
     * Root of the project directory.
     *
     * @example 'import.meta.dirname'
     */
    projectRoot?: OptionsProjectRoot['projectRoot'];
};

export type FrameworkOptions = {
    /**
     * Enable Astro support.
     *
     * @default auto-detect based on the dependencies
     */
    astro?: boolean | OptionsAstro;

    /**
     * Enable NextJS support.
     *
     * @default auto-detect based on the dependencies
     */
    nextjs?: boolean | OptionsNextJS;

    /**
     * Enforce NodeJS best practice.
     *
     * @default true
     */
    node?: boolean | OptionsNode;

    /**
     * Enable React support.
     *
     * @default auto-detect based on the dependencies
     */
    react?: boolean | OptionsReact;

    /**
     * Enable Vue support.
     *
     * @default auto-detect based on the dependencies
     */
    vue?: boolean | OptionsVue;
};

export type LanguageOptions = {
    /**
     * Core rules. Can't be disabled.
     */
    javascript?: OptionsOverrides;

    /**
     * Enable JSON/JSON5/JSONC support.
     *
     * @default true
     */
    jsonc?: boolean | OptionsOverrides;

    /**
     * Enable JSX related rules.
     *
     * Pass an object to enable JSX accessibility
     *
     * @default true
     */
    jsx?: boolean | OptionsJSX;

    /**
     * Enable TOML support.
     *
     * @default true
     */
    toml?: boolean | OptionsOverrides;

    /**
     * Enable TypeScript support.
     *
     * Pass an object to enable TypeScript language server support.
     *
     * @default auto-detect based on the dependencies
     */
    typescript?: boolean | OptionsTypeScript;

    /**
     * Enable YAML support.
     *
     * @default true
     */
    yaml?: boolean | OptionsOverrides;
};

export type OptionsComponentExts = {
    /**
     * Additional extensions for components.
     *
     * @example ['vue']
     *
     * @default []
     */
    componentExts?: string[];
};

export type OptionsConfig = ConfigOptions &
    CoreOptions &
    FrameworkOptions &
    LanguageOptions &
    OptionsComponentExts &
    StyleOptions;

export type OptionsAstro = OptionsOverrides & {
    /**
     * Enable accessibility support via JSX accessibility plugin.
     * Helps checking for a11y issues in `.astro`-files, as well as `.jsx` and `.tsx`-files when enabled.
     *
     * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
     * @default false
     */
    a11y?: boolean;

    /**
     * Overrides for accessibility rules.
     */
    overridesA11y?: TypedFlatConfigItem['rules'];
};

export type OptionsE18e = OptionsOverrides & {
    /**
     * Include modernization rules
     *
     * @see https://github.com/e18e/eslint-plugin#modernization
     * @default true
     */
    modernization?: boolean;

    /**
     * Include module replacements rules
     *
     * @see https://github.com/e18e/eslint-plugin#module-replacements
     * @default type === 'library' && isInEditor
     */
    moduleReplacements?: boolean;

    /**
     * Include performance improvements rules
     *
     * @see https://github.com/e18e/eslint-plugin#performance-improvements
     * @default true
     */
    performanceImprovements?: boolean;
};

export type OptionsFiles = {
    /**
     * Override the `files` option to provide custom globs,
     */
    files?: string[];
};

export type OptionsFunctional = {
    /**
     * Level of Functional enforcement,
     *
     * @see https://github.com/eslint-functional/eslint-plugin-functional
     * @default 'lite'
     */
    functionalEnforcement?: 'lite' | 'none' | 'recommended' | 'strict';

    /**
     * Functional ignore pattern.
     *
     * Defines patterns to ignore in the Functional plugin.
     *
     * @example ['^[mM]ut_']
     */
    ignoreNamePattern?: string[];

    /**
     * Functional ignore typings pattern
     *
     * Currently disabled
     */
    // ignoreTypePattern?: string[];
};

export type OptionsHasTypeScript = {
    typescript?: boolean;
};

export type OptionsIgnores = OptionsOverrides & {
    /**
     * Append `.gitignore` to the ignore files?
     *
     * @see https://github.com/antfu/eslint-config-flat-gitignore
     * @default true
     */
    gitignore?: boolean | string | FlatGitignoreOptions;

    /**
     * Ignore TypeScript
     */
    ignoreTypeScript?: boolean;

    /**
     * User ignores.
     *
     * If not provided, or set to `false`, only the built-in globs in `GLOBS_EXCLUDE` will be used.
     *
     * If user provides a `string` or `string[]`, it will be appended to the built-in globs.
     *
     * If user provides a `function`, it will be called with the built-in globs as the first argument,
     * and the return value will be used as the final globs. This is the only way to disable the built-in globs.
     */
    userIgnores?: false | string | ReadonlyArray<string> | ((builtInGlobs: typeof GLOB_EXCLUDE) => string[]);
};

export type OptionsIsInEditor = {
    /**
     * Are we inside an IDE or editor?
     * Used to activate the helper `disablesRulesFix()` that make defined fixable rules non-fixable.
     *
     * This is applied to the following rules:
     * - `prefer-const`
     * - `test-no-only-tests`
     * - `unused-imports/no-unused-imports`
     *
     * The rules will still be applied when you run ESLint in a terminal or through Lint Staged.
     * Can be disabled by setting this to false in your eslint config.
     */
    isInEditor?: boolean;
};

export type OptionsJSDoc = OptionsHasTypeScript & OptionsOverrides;

export type OptionsJSX = OptionsOverrides & {
    /**
     * Enable accessibility support via JSX accessibility plugin.
     * Helps checking for a11y issues in `.jsx` and `.tsx`-files when enabled.
     *
     * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
     * @default false
     */
    a11y?: boolean;

    /**
     * Overrides for accessibility rules.
     */
    overridesA11y?: TypedFlatConfigItem['rules'];
};

export type OptionsLessOpinionated = {
    /**
     * Disables heavily opinionated rules.
     *
     * @default false
     */
    lessOpinionated?: boolean;
};

export type OptionsMode = {
    /**
     * Define project mode.
     * Helpful for applications or libraries such as this.
     * 99.99% of times, this should not be necessary to set.
     *
     * @default 'none'
     */
    mode: 'application' | 'library' | 'none';
};

export type OptionsNextJS = OptionsOverrides & {
    /**
     * Grants the Next.js config access to mode to disable certain
     * rules depending on project mode.
     */
    mode?: OptionsMode['mode'];

    /**
     * Allows for specifying the root directory if Next.js isn't installed
     * in the root directory. Helpful for monorepos.
     *
     * @see https://nextjs.org/docs/app/api-reference/config/eslint#specifying-a-root-directory-within-a-monorepo
     * @default undefined
     */
    rootDir?: string;
};

export type OptionsNode = OptionsOverrides & {
    /**
     * Override the `files` option to provide custom globs,
     */
    files?: OptionsFiles['files'];

    /**
     * Check if React is detected.
     *
     * @default false
     */
    hasReact?: boolean;

    /**
     * Check if module is detected.
     *
     * @default false
     */
    module?: boolean;

    /**
     * Strict option.
     * Will enable stricter rules within the Node config.
     *
     * @default false
     */
    strict?: boolean;

    /**
     * Check if TypeScript is detected.
     * Will enable certain TypeScript rules and disable
     * the NodeJS counter-parts.
     *
     * @default false
     */
    typescript?: boolean;
};

export type OptionsOverrides = {
    /**
     * Add overrides to a config.
     * This is the main `overrides` sink typed correctly.
     */
    overrides?: TypedFlatConfigItem['rules'];
};

export type OptionsPerfectionist = OptionsOverrides & {
    perfectionist?: boolean;
};

export type OptionsProjectRoot = {
    projectRoot?: Readonly<string>;
};

export type OptionsReact = OptionsOverrides & {
    /**
     * Enable accessibility support via JSX accessibility plugin.
     * Helps checking for a11y issues in `.jsx` and `.tsx`-files when enabled.
     *
     * @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
     * @default false
     */
    a11y?: boolean;

    /**
     * Additional hooks to be added to `react-hooks`.
     *
     * @see
     * @default undefined
     */
    additionalHooks?: string;

    /**
     * Enable Next.js support.
     * Next.js is auto-detected
     *
     * @default auto-detect
     */
    nextjs?: boolean;

    /**
     * Overrides for accessibility rules.
     */
    overridesA11y?: TypedFlatConfigItem['rules'];

    /**
     * Configuration for React Refresh.
     * Plugin is auto-detected.
     *
     * @default false
     */
    reactRefresh?: {
        allowConstantExport?: boolean;
    };
};

export type OptionsStylistic = {
    stylistic?: boolean | StylisticConfig;
};

export type OptionsTypeScript = OptionsOverrides & OptionsTypeScriptErasableOnly & OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes;

export type OptionsTypeScriptErasableOnly = {
    /**
     * Enable erasable syntax only rules.
     * This can be disabled individually, or through `lessOpinionated: true`
     *
     * @see https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only
     * @default true
     */
    erasableOnly?: boolean;
};

export type OptionsTypeScriptParserOptions = {
    /**
     * Glob patterns for files that should be type-aware.
     *
     * @default ['**\/*.{dts,ts,tsx}']
     */
    filesTypeAware?: string[];

    /**
     * Glob patterns for files that should not be type aware.
     *
     * @default ['**\/*.md\/**', '**\/*.astro/*.ts']
     */
    ignoresTypeAware?: string[];

    /**
     * Additional parser options for TypeScript.
     */
    parserOptions?: Partial<ParserOptions>;
};

export type OptionsTypeScriptWithTypes = {
    /**
     * An easy way to disable type-aware rules.
     */
    disableTypeAwareRules?: boolean;

    /**
     * Override type-aware rules.
     */
    overridesTypeAware?: TypedFlatConfigItem['rules'];

    /**
     * When this options is provided, type-aware rules will be enabled.
     *
     * @see https://typescript-eslint.io/linting/typed-linting/
     */
    projectRoot?: OptionsProjectRoot['projectRoot'];

    /**
     * Unsafe severity options.
     */
    unsafe?: 'error' | 'off' | 'warn';

    /**
     * Any easy way to disable the default project.
     * Has no effect if `parserOptions.projectService` is set.
     *
     * @default true
     */
    useDefaultDefaultProject?: boolean;
};

export type OptionsVue = OptionsOverrides & {
    /**
     * Enable accessibility support via Vue accessibility plugin.
     * Helps checking for a11y issues in `.vue`-files when enabled.
     *
     * @see https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility
     *
     * @default false
     */
    a11y?: boolean;

    /**
     * Overrides for accessibility rules.
     */
    overridesA11y?: TypedFlatConfigItem['rules'];

    /**
     * Create virtual files for Vue SFC blocks to enable linting.
     *
     * @see https://github.com/antfu/eslint-processor-vue-blocks
     *
     * @default true
     */
    sfcBlocks?: boolean | VueBlocksOptions;
};

export type RequiredOptionsStylistic = {
    stylistic: false | Required<StylisticConfig>;
};

export type ResolvedOptions<T> = T extends boolean
    ? never
    : T extends string
        ? never
        : NonNullable<T>;

export type StyleOptions = {
    /**
     * Enforce functional programming.
     *
     * Default activation depends on `lessOpinionated`. Can also be turned on or off explicitly.
     *
     * @example 'none', 'lite', 'recommended', or 'strict'
     * @see https://github.com/eslint-functional/eslint-plugin-functional
     *
     * @default 'lite'
     */
    functional?: boolean | OptionsFunctional['functionalEnforcement'] | (OptionsFunctional & OptionsOverrides);

    /**
     * Enable Perfectionist support.
     *
     * @see https://perfectionist.dev
     *
     * @default true
     */
    perfectionist?: boolean | OptionsOverrides;

    /**
     * Enable stylistic rules.
     *
     * @see https://eslint.style
     *
     * @default true
     */
    stylistic?: boolean | (OptionsOverrides & StylisticConfig);
};

export type StylisticConfig = Omit<Pick<StylisticCustomizeOptions, 'experimental' | 'indent' | 'jsx' | 'quotes' | 'semi'>, 'indent'> & {
    indent?: 'tab' | number;
};

export type TypedFlatConfigItem = Omit<(ConfigWithExtends | Linter.Config), 'ignores' | 'plugins' | 'rules'> & {
    /**
     * Extend the global ignores within `FlatConfigItem` and `Linter.Config`.
     *
     * Accepts a `string[]` (standard ESLint flat config) or `OptionsIgnores`.
     */
    ignores?: boolean | OptionsIgnores | ReadonlyArray<string>;

    /**
     * Custom config name of each item
     */
    name?: string;

    /**
     * An object containing a name-value mapping of plugin names to plugin objects. When `files` is specified, these plugins are only available to the matching files.
     *
     * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
     */
    plugins?: Record<string, Readonly<ESLint.Plugin | TSESLint.FlatConfig.Plugin>>;

    /**
     * An object containing name-value mapping of rules to use.
     */
    rules?: (Rules & TSESLint.FlatConfig.Config['rules']);
};

export { type ConfigNames, type RuleOptions as Rules } from './typegen.d';
