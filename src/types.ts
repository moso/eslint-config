/* eslint-disable perfectionist/sort-modules */
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint, Linter } from 'eslint';
import type { ConfigWithExtends } from 'eslint-flat-config-utils';
import type { Options as VueBlocksOptions } from 'eslint-processor-vue-blocks';

import type { RuleOptions as Rules } from './typegen';

export type Awaitable<T> = Promise<T> | T;
export type FilePath = Readonly<string>;
export type FunctionalEnforcement = 'lite' | 'none' | 'recommended' | 'strict';
export type GlobPatterns = string[];
export type ProjectMode = 'application' | 'library' | 'none';

type PluginConfig<T = Record<string, never>> = boolean | (OptionsOverrides & T);

type ReactAdditionalComponents = {
    as: string;
    attributes: Array<{
        as: string;
        defaultValue?: string;
        name: string;
    }>;
    name: string;
};

export type ConfigOptions = {
    /**
     * Enable ESLint comments.
     *
     * @see https://eslint-community.github.io/eslint-plugin-eslint-comments
     * @default true
     */
    comments?: PluginConfig;

    /**
     * Enforce import best practices
     *
     * @see https://github.com/9romise/eslint-plugin-import-lite
     * @default true
     */
    imports?: PluginConfig;

    /**
     * Enable JSDoc support.
     *
     * @default false
     */
    jsdoc?: PluginConfig;

    /**
     * Enforce Promises best practices.
     *
     * @see https://github.com/eslint-community/eslint-plugin-promise
     */
    promise?: PluginConfig;

    /**
     * Enable regex rules.
     *
     * @see https://ota-meshi.github.io/eslint-plugin-regexp
     * @see https://github.com/BrainMaestro/eslint-plugin-optimize-regex
     * @default true
     */
    regexp?: PluginConfig;

    /**
     * Enable test support.
     *
     * @default true
     */
    test?: PluginConfig;

    /**
     * Options for eslint-plugin-unicorn.
     *
     * @default true
     */
    unicorn?: PluginConfig;
};

export type CoreOptions = {
    /**
   * Extend the global ignores.
   *
   * Passing an array to extends the ignores.
   * Passing a function to modify the default ignores.
   *
   * @default []
   */
    // ignores?: OptionsIgnores | string[];
    ignores?: string[];

    /**
     * Files that contain ignore patterns.
     *
     * @example ['.gitignore']
     */
    ignoresFiles?: GlobPatterns;

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
    lessOpinionated?: boolean;

    /**
     * What are we linting?
     */
    mode?: ProjectMode;

    /**
     * Root of the project directory.
     *
     * @example 'import.meta.dirname'
     */
    projectRoot?: FilePath;
};

export type FrameworkOptions = {
    /**
     * Enable Astro support.
     *
     * @default auto-detect based on the dependencies
     */
    astro?: boolean | OptionsOverrides;

    /**
     * Enable NextJS support.
     *
     * @default auto-detect based on the dependencies
     */
    nextjs?: boolean | OptionsOverrides;

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
    componentExts?: GlobPatterns;
};

export type OptionsConfig = ConfigOptions &
    CoreOptions &
    FrameworkOptions &
    LanguageOptions &
    OptionsComponentExts &
    StyleOptions;

export type OptionsFiles = {
    /**
     * Override the `files` option to provide custom globs,
     */
    files?: GlobPatterns;
};

export type OptionsFunctional = {
    /**
     * Level of Functional enforcement,
     *
     * @see https://github.com/eslint-functional/eslint-plugin-functional
     * @default 'lite'
     */
    functionalEnforcement?: FunctionalEnforcement;

    /**
     * Functional ignore pattern.
     *
     * Defines patterns to ignore in the Functional plugin.
     *
     * @example ['^[mM]ut_']
     */
    ignoreNamePattern?: GlobPatterns;
};

export type OptionsHasTypeScript = {
    typescript?: boolean;
};

export type OptionsIgnoreFiles = {
    /**
     * Files that contains ignore patterns.
     *
     * @default ['.gitignore']
     */
    ignoreFiles: GlobPatterns;
};

export type OptionsIgnores =
    | NonNullable<Linter.Config['ignores']>
    | {
        extend: boolean;
        files: NonNullable<Linter.Config['ignores']>;
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
     * @default 'none'
     */
    mode: 'application' | 'library' | 'none';
};

export type OptionsNode = OptionsOverrides & {
    files?: GlobPatterns;
    hasReact?: boolean;
    hasTypeScript?: boolean;
    module?: boolean;
    strict?: boolean;
};

export type OptionsOverrides = {
    overrides?: TypedFlatConfigItem['rules'];
};

export type OptionsPerfectionist = OptionsOverrides & {
    perfectionist?: boolean;
};

export type OptionsProjectRoot = {
    projectRoot?: FilePath;
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
     *
     */
    additionalComponents?: ReadonlyArray<ReactAdditionalComponents>;
    additionalHooks?: string;
    additionalHooksWithType?: Record<string, ReadonlyArray<string>>;
    nextjs?: boolean;

    /**
     * Overrides for accessibility rules.
     */
    overridesA11y?: TypedFlatConfigItem['rules'];

    reactRefresh?: {
        allowConstantExport?: boolean;
    };
    remix?: boolean;
};

export type OptionsStylistic = {
    stylistic?: boolean | StylisticConfig;
};

export type OptionsTypeScript = ((OptionsOverrides & OptionsTypeScriptParserOptions)
    | (OptionsOverrides & OptionsTypeScriptWithTypes));

export type OptionsTypeScriptErasableOnly = {
    /**
     * Enable erasable syntax only rules.
     * This can be disabled individually, or through `lessOpinionated: false`
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
    filesTypeAware?: GlobPatterns;

    /**
     * Glob patterns for files that should not be type aware.
     *
     * @default ['**\/*.md\/**', '**\/*.astro/*.ts']
     */
    // ignoresTypeAware?: GlobPatterns | undefined;

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
    projectRoot?: FilePath;

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
        : T extends PluginConfig<infer U>
            ? U extends Record<string, never>
                ? OptionsOverrides
                : OptionsOverrides & U
            : NonNullable<T>;

export type StyleOptions = {
    /**
     * Enforce functional programming.
     *
     * Default activation depends on `lessOpinionated`. Can also be turned on or off explicitly.
     *
     * @example 'none', 'lite', 'recommended', or 'strict'
     * @see https://github.com/eslint-functional/eslint-plugin-functional
     * @default 'lite'
     */
    functional?: boolean | FunctionalEnforcement | (OptionsFunctional & OptionsOverrides);

    /**
     * Enable Perfectionist support.
     *
     * @see https://perfectionist.dev
     * @default true
     */
    perfectionist?: boolean | OptionsOverrides;

    /**
     * Enable stylistic rules.
     *
     * @see https://eslint.style
     * @default true
     */
    stylistic?: boolean | (OptionsOverrides & StylisticConfig);
};

export type StylisticConfig = Omit<Pick<StylisticCustomizeOptions, 'experimental' | 'indent' | 'jsx' | 'quotes' | 'semi'>, 'indent'> & {
    indent?: 'tab' | number;
};

export type TypedFlatConfigItem = Omit<(ConfigWithExtends | Linter.Config), 'plugins' | 'rules'> & {
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
