import process from 'node:process';

import type { SharedConfig } from '@typescript-eslint/utils/ts-eslint';
import type { ESLint, Linter } from 'eslint';

import type { RuleOptions } from './typegen';
import type {
    Awaitable,
    OptionsConfig,
    ResolvedOptions,
    TypedFlatConfigItem,
} from './types';

/**
 * Resolve and flatten any mix of (awaitable) config items or arrays
 * into a single flat array of config items.
 *
 * Useful for composing the factory output with custom config fragments.
 *
 * @param configs - Config items, arrays of items, or promises of either.
 * @returns A single flat array with every item resolved.
 */
export const combine = async (
    ...configs: ReadonlyArray<Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>>
): Promise<TypedFlatConfigItem[]> => {
    const resolved = await Promise.all(configs.map(async (config) => config));
    return resolved.flat();
};

/**
 * Validate a user-supplied file path before it is handed to the TypeScript
 * project service as `tsconfigRootDir`.
 *
 * @param path - The path to validate.
 * @returns The path, unchanged, when it passes validation.
 * @throws Error when the path is empty or carries leading/trailing whitespace.
 */
export const checkFilePath = (path: string): string => {
    if (!path) throw new Error('FilePath must be a non-empty string');
    if (path.trim() !== path) throw new Error('FilePath cannot have leading/trailing whitespace');

    return path;
};

/**
 * Merge the `rules` of a shared flat-config array into a single rule map.
 *
 * Plugins ship their presets as an array (a setup item, then one item per rule layer),
 * this keeps only the rules so they can be spread into a config item
 * that declares its own `files`, `plugins`, and parser.
 *
 * @param configs - A plugin's exported flat config array.
 * @returns Every config's rules merged in order.
 */
export const flattenRules = (configs: ReadonlyArray<Linter.Config>): NonNullable<Linter.Config['rules']> =>
    configs.reduce<NonNullable<Linter.Config['rules']>>((acc, config) => Object.assign(acc, config.rules), {});

/**
 * Auto-numbering for unnamed `globalIgnores` items.
 */
const nextGlobalIgnoresName = ((): (() => string) => {
    const mut_counter = { count: 0 };
    return () => `globalIgnores ${String(mut_counter.count++)}`;
})();

/**
 * Build a global-ignores config item (an item with only `ignores`,
 * which ESLint applies to the entire run).
 *
 * @param ignorePatterns - Glob patterns to ignore; must contain at least one entry.
 * @param name - Config item name; auto-numbered when omitted.
 * @returns A flat config item carrying only the ignore patterns.
 * @throws TypeError when `ignorePatterns` is not a non-empty array.
 */
export const globalIgnores = (ignorePatterns: ReadonlyArray<string>, name?: string): TypedFlatConfigItem => {
    if (!Array.isArray(ignorePatterns)) throw new TypeError('`ignorePatterns` must be an array');
    if (ignorePatterns.length === 0) throw new TypeError('`ignorePatterns` must contain at least one pattern');

    return {
        name: name ?? nextGlobalIgnoresName(),
        ignores: ignorePatterns as ReadonlyArray<string>,
    };
};

/**
 * Await a value and unwrap its `default` export when present.
 *
 * Smooths over the CJS/ESM interop difference where `import()` of a CJS module
 * yields `{ default: ... }` while an ESM module may not.
 *
 * @param value - A module (or promise of one) whose default export should be unwrapped.
 * @returns The default export when one exists, otherwise the resolved value itself.
 */
export const interopDefault = async <T>(value: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> => {
    const resolved = await value;
    return ((resolved as Record<string, unknown>).default ?? resolved) as T extends { default: infer U } ? U : T;
};

/**
 * Whether ESLint is running from a git hook or lint-staged rather than an editor.
 */
const isInGitHooksOrLintStaged = (): boolean => (
    Boolean(process.env.GIT_PARAMS) ||
    Boolean(process.env.VSCODE_GIT_COMMAND) ||
    Boolean(process.env.npm_lifecycle_script?.startsWith('lint-staged'))
);

/**
 * Detect whether ESLint is running inside an editor/IDE integration.
 *
 * Used to make selected fixable rules non-fixable in editors (so half-written
 * code is not auto-mangled on save) while keeping them fixable in terminals,
 * git hooks, and CI.
 *
 * @returns `true` only for editor processes outside CI, git hooks, and lint-staged.
 */
export const isInEditorEnv = (): boolean => {
    if (Boolean(process.env.CI)) return false;

    if (isInGitHooksOrLintStaged()) return false;

    return (
        Boolean(process.env.VSCODE_PID) ||
        Boolean(process.env.VSCODE_CWD) ||
        Boolean(process.env.JETBRAINS_IDE) ||
        Boolean(process.env.VIM) ||
        Boolean(process.env.NVIM)
    );
};

/**
 * Normalize a factory option that accepts `boolean | string | number | object`
 * down to its object form.
 *
 * @param options - The full factory options object.
 * @param key - The option key to resolve.
 * @returns The option's object form; `{}` when the option was a boolean, string, number, or absent.
 */
export const resolveSubOptions = <K extends keyof OptionsConfig>(
    options: Readonly<OptionsConfig>,
    key: K,
): ResolvedOptions<OptionsConfig[K]> => (
    typeof options[key] === 'object' ? options[key] : {}
) as ResolvedOptions<OptionsConfig[K]>;

/**
 * Extract the `overrides` rule map from a factory option, regardless of
 * whether the option was given as a boolean, string, or object.
 *
 * @param options - The full factory options object.
 * @param key - The option key whose overrides should be extracted.
 * @returns The user's rule overrides for that config; `{}` when none were given.
 */
export const getOverrides = (
    options: Readonly<OptionsConfig>,
    key: keyof OptionsConfig,
): (Partial<Record<string, SharedConfig.RuleEntry>> & RuleOptions) => {
    const sub = resolveSubOptions(options, key);
    return ('overrides' in sub ? sub.overrides : {}) ?? {};
};

declare global {
    // eslint-disable-next-line vars-on-top
    var __ESLINT_PLUGIN_MEMO__: Map<string, ESLint.Plugin> | undefined;
}

/**
 * Return one shared instance per plugin key, registering `plugin` on first use.
 *
 * Node's module cache already deduplicates imports; this exists for the cases
 * it cannot cover (duplicated module copies, user configs registering the same
 * plugin), where ESLint throws `Cannot redefine plugin` for same-name plugins
 * with different references. Stored realm-wide on `globalThis` so duplicated
 * copies of this package still share one store.
 *
 * @see https://github.com/SukkaW/eslint-config-sukka/blob/master/packages/shared/src/memoize-eslint-plugin.ts
 *
 * @param plugin - The plugin instance to register when the key is unseen.
 * @param key - Stable identifier; must be identical everywhere the same package is registered.
 * @returns The first instance ever registered under `key`.
 */
export const memoize = <T extends ESLint.Plugin>(plugin: T, key: string): T => {
    // eslint-disable-next-line unicorn/no-global-object-property-assignment
    globalThis.__ESLINT_PLUGIN_MEMO__ ??= new Map<string, ESLint.Plugin>();

    const mut_memo = globalThis.__ESLINT_PLUGIN_MEMO__;
    const existing = mut_memo.get(key);
    if (existing !== undefined) return existing as T;

    mut_memo.set(key, plugin);
    return plugin;
};

/**
 * HTML inline non-void elements, used by the Vue config for
 * `vue/singleline-html-element-content-newline` exceptions.
 *
 * Manually migrated from eslint-plugin-vue after the plugin stopped exporting it.
 *
 * @see https://github.com/vuejs/eslint-plugin-vue/blob/master/lib/utils/inline-non-void-elements.json
 */
export const vueInlineElements: ReadonlyArray<string> = [
    'a',
    'abbr',
    'audio',
    'b',
    'bdi',
    'bdo',
    'canvas',
    'cite',
    'code',
    'data',
    'del',
    'dfn',
    'em',
    'i',
    'iframe',
    'ins',
    'kbd',
    'label',
    'map',
    'mark',
    'noscript',
    'object',
    'output',
    'picture',
    'q',
    'ruby',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'svg',
    'time',
    'u',
    'var',
    'video',
];
