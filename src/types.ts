import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { Options as VueBlocksOptions } from 'eslint-processor-vue-blocks';

import type { ConfigNames, RuleOptions } from './typegen';

export type Awaitable<T> = T | Promise<T>;

export interface Rules extends RuleOptions {};

export type { ConfigNames };

export type TypedFlatConfigItem = Omit<Linter.Config<Linter.RulesRecord & Rules>, 'plugins'> & {
    // Relax plugins type limitation, as most of the plugins did not have correct type info yet.
    /**
     * An object containing a name-value mapping of plugin names to plugin objects. When `files` is specified, these plugins are only available to the matching files.
     *
     * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
     */
    plugins?: Record<string, any>;
};

// export type UserConfigItem = FlatConfigItem | Linter.FlatConfig;

export interface OptionsFiles {
    /**
     * Override the `files` option to provide custom globs
     */
    files?: string[];
};

export interface OptionsVue extends OptionsOverrides {
    /**
     * Create virtual files for Vue SFC blocks to enable linting.
     *
     * @see https://github.com/antfu/eslint-processor-vue-blocks
     * @default true
     */
    sfcBlocks?: boolean | VueBlocksOptions;
};

export type OptionsTypeScript =
    (OptionsTypeScriptWithTypes & OptionsOverrides)
    | (OptionsTypeScriptParserOptions & OptionsOverrides);

export interface OptionsComponentExts {
    /**
     * List of file extensions that are considered as components.
     *
     * @example ['vue']
     * @default []
     */
    componentExts?: string[];
};

export interface OptionsTypeScriptParserOptions {
    /**
     * Provide custom parser options for TypeScript.
     */
    parserOptions?: Partial<ParserOptions>;

    /**
     * Glob patterns for files that should be type-aware.
     * @default ['**\/*.{ts,tsx}']
     */
    filesTypeAware?: string[];

    /**
     * Glob patterns for files that should not be type-aware.
     * @default ['**\/*.md\/**']
     */
    ignoresTypeAware?: string[];
};

export interface OptionsTypeScriptWithTypes {
    /**
     * When this option is enabled, type-aware rules will be enabled.
     * @see https://typescript-eslint.io/linting/typed-linting/
     */
    tsconfigPath?: string;

    /**
     * Override type-aware rules.
     */
    overridesTypeAware?: TypedFlatConfigItem['rules'];
};

export interface OptionsHasTypeScript {
    typescript?: boolean;
};

export interface OptionsStylistic {
    stylistic?: boolean | StylisticConfig;
};

export interface StylisticConfig extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'jsx' | 'semi'> {};

export interface OptionsOverrides {
    overrides?: TypedFlatConfigItem['rules'];
};

export interface OptionsUnicorn {
    /**
     * Include all rules recommended by `eslint-plugin-unicorn`
     *
     * @default false
     */
    allRecommended?: boolean;
};

export interface OptionsIsInEditor {
    isInEditor?: boolean;
}

export interface OptionsConfig extends OptionsComponentExts {
    /**
     * Enable gitignore support.
     *
     * Passing an object to configure the options.
     *
     * @see https://github.com/antfu/eslint-config-flat-gitignore
     * @default true
     */
    gitignore?: boolean | FlatGitignoreOptions;

    /**
     * Disable some opinionated rules.
     *
     * Including:
     * - Perfectionist
     *
     * @default false
     */
    lessOpinionated?: boolean;

    /**
     * Core rules. Can't be disabled.
     */
    javascript?: OptionsOverrides;

    /**
     * Enable TypeScript support.
     *
     * Passing an object to enable TypeScript Language Server support.
     *
     * @default auto-detect based on the dependencies
     */
    typescript?: boolean | OptionsTypeScript;

    /**
     * Enable JSX related rules.
     *
     * Currently only stylistic rules are included.
     *
     * @default true
     */
    jsx?: boolean;

    /**
     * Options for eslint-plugin-unicorn.
     *
     * @default true
     */
    unicorn?: boolean | OptionsUnicorn;

    /**
     * Enable test support.
     *
     * @default true
     */
    test?: boolean | OptionsOverrides;

    /**
     * Enable Vue support.
     *
     * @default auto-detect based on the dependencies
     */
    vue?: boolean | OptionsVue;

    /**
     * Enable JSONC support.
     *
     * @default true
     */
    jsonc?: boolean | OptionsOverrides;

    /**
     * Enable linting for **code snippets** in Markdown.
     *
     * For formatting Markdown content, enable also `formatters.markdown`.
     *
     * @default true
     */
    markdown?: boolean | OptionsOverrides;

    /**
     * Enable Perfectionist support.
     *
     * @see https://perfectionist.dev
     * @default true
     */
    perfectionist?: boolean | OptionsOverrides;

    /**
     * Enable React support.
     *
     * @default auto-detect based on the dependencies
     */
    react?: boolean | OptionsOverrides;

    /**
     * Enable stylistic rules.
     *
     * @default true
     */
    stylistic?: boolean | (StylisticConfig & OptionsOverrides);

    /**
     * Enable YAML support.
     *
     * @default true
     */
    yaml?: boolean;

    /**
     * Control to disable some rules in editors.
     * @default auto-detect based on the process.env
     */
    isInEditor?: boolean;

    /**
     * Provide overrides for rules for each integration.
     *
     * @deprecated use `overrides` option in each integration key instead
     */
    overrides?: {
        javascript?: TypedFlatConfigItem['rules'];
        jsonc?: TypedFlatConfigItem['rules'];
        markdown?: TypedFlatConfigItem['rules'];
        perfectionist?: TypedFlatConfigItem['rules'];
        react?: TypedFlatConfigItem['rules'];
        stylistic?: TypedFlatConfigItem['rules'];
        test?: TypedFlatConfigItem['rules'];
        typescript?: TypedFlatConfigItem['rules'];
        vue?: TypedFlatConfigItem['rules'];
        yaml?: TypedFlatConfigItem['rules'];
    };
};
