import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore';
import type { ParserOptions } from '@typescript-eslint/parser';
import type { Options as VueBlocksOptions } from 'eslint-processor-vue-blocks';
import type { Linter } from 'eslint';
import type {
    EslintCommentsRules,
    EslintRules,
    ImportRules,
    JsoncRules,
    MergeIntersection,
    NRules,
    Prefix,
    RenamePrefix,
    RuleConfig,
    VitestRules,
    VueRules,
    YmlRules,
} from '@antfu/eslint-define-config';
import type { RuleOptions as JSDocRules } from '@eslint-types/jsdoc/types';
import type { RuleOptions as TypeScriptRules } from '@eslint-types/typescript-eslint/types';
import type { RuleOptions as UnicornRules } from '@eslint-types/unicorn/types';
import type { Rules as AntfuRules } from 'eslint-plugin-antfu';
import type { StylisticCustomizeOptions, UnprefixedRuleOptions as StylisticRules } from '@stylistic/eslint-plugin';

export type WrapRuleConfig<T extends { [key: string]: any }> = {
    [K in keyof T]: T[K] extends RuleConfig ? T[K] : RuleConfig<T[K]>;
};

export type Awaitable<T> = T | Promise<T>;

export type Rules = WrapRuleConfig<
    MergeIntersection<
        RenamePrefix<TypeScriptRules, '@typescript-eslint/', 'ts/'> &
        RenamePrefix<VitestRules, 'vitest/', 'test/'> &
        RenamePrefix<YmlRules, 'yml/', 'yaml/'> &
        RenamePrefix<NRules, 'n/', 'node/'> &
        Prefix<StylisticRules, 'style/'> &
        Prefix<AntfuRules, 'antfu/'> &
        JSDocRules &
        ImportRules &
        EslintRules &
        JsoncRules &
        VueRules &
        UnicornRules &
        EslintCommentsRules &
        {
            'test/no-only-tests': RuleConfig<[]>
        }
    >
>;

export type TypedFlatConfigItem = Omit<Linter.FlatConfig, 'plugins'> & {
    /**
     * Custom name of each config item
     */
    name?: string;

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
    sfcBlocks?: boolean | VueBlocksOptions

    /**
     * Vue version. Apply different rules set from `eslint-plugin-vue`.
     *
     * @default 3
     */
    vueVersion?: 2 | 3
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
     * Glob patterns to match TypeScript files.
     */
    filesTypeAware?: string[];
};

export interface OptionsTypeScriptWithTypes {
    /**
     * When this option is enabled, type-aware rules will be enabled.
     * @see https://typescript-eslint.io/linting/typed-linting/
     */
    tsconfigPath?: string | string[];
};

export interface OptionsHasTypeScript {
    typescript?: boolean;
};

export interface StylisticConfig extends Pick<StylisticCustomizeOptions, 'indent' | 'quotes' | 'jsx' | 'semi'> {};

export interface OptionsStylistic {
    stylistic?: boolean | StylisticConfig;
};

export interface OptionsOverrides {
    overrides?: TypedFlatConfigItem['rules'];
};

export interface OptionsIsInEditor {
    isInEditor?: boolean;
};

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
    stylistic?: boolean | (StylisticConfig & OptionsOverrides)


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
     * Automatically rename plugins in the config.
     *
     * @default true
     */
    autoRenamePlugins?: boolean;


    /**
     * Provide overrides for rules for each integration.
     *
     * @deprecated use `overrides` option in each integration key instead
     */
    overrides?: {
        javascript?: TypedFlatConfigItem['rules'];
        jsonc?: TypedFlatConfigItem['rules'];
        markdown?: TypedFlatConfigItem['rules'];
        react?: TypedFlatConfigItem["rules"];
        stylistic?: TypedFlatConfigItem['rules'];
        test?: TypedFlatConfigItem['rules'];
        typescript?: TypedFlatConfigItem['rules'];
        vue?: TypedFlatConfigItem['rules'];
        yaml?: TypedFlatConfigItem['rules'];
    };
};
