import process from 'node:process';

import { isPackageExists } from 'local-pkg';

import type { SharedConfig } from '@typescript-eslint/utils/ts-eslint';
import type { ESLint } from 'eslint';

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

let mut_globalIgnoreCount = 0;

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
        name: (name ?? `globalIgnores ${mut_globalIgnoreCount++}`),
        ignores: ignorePatterns as ReadonlyArray<string>,
    };
};

/**
 * Await a value and unwrap its `default` export when present.
 *
 * Smooths over the CJS/ESM interop difference where `import()` of a CJS
 * module yields `{ default: ... }` while an ESM module may not.
 *
 * @param value - A module (or promise of one) whose default export should be unwrapped.
 * @returns The default export when one exists, otherwise the resolved value itself.
 */
export const interopDefault = async <T>(value: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> => {
    const resolved = await value;
    return ((resolved as Record<string, unknown>).default ?? resolved) as T extends { default: infer U } ? U : T;
};

/** Whether ESLint is running from a git hook or lint-staged rather than an editor. */
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
 * Normalize a factory option that accepts `boolean | string | object`
 * down to its object form.
 *
 * @param options - The full factory options object.
 * @param key - The option key to resolve.
 * @returns The option's object form; `{}` when the option was a boolean, string, or absent.
 */
export const resolveSubOptions = <K extends keyof OptionsConfig>(
    options: Readonly<OptionsConfig>,
    key: K,
): ResolvedOptions<OptionsConfig[K]> => (
    typeof options[key] === 'boolean' || typeof options[key] === 'string' ? {} : (options[key] ?? {})
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

const scopeURL = import.meta.dirname;

/** Whether `name` resolves from this package's own directory (not the consumer's cwd). */
const isPackageInScope = (name: string): boolean => isPackageExists(name, { paths: [scopeURL] });

/** Whether an install prompt could ever be shown: a TTY outside CI. */
const isInteractive = (): boolean => {
    if (Boolean(process.env.CI)) return false;
    return process.stdout.isTTY;
};

/**
 * Offer to install missing packages through an interactive prompt.
 * No-op in CI or when stdout is not a TTY.
 *
 * @param packages - Package names to check and offer for installation.
 */
const ensurePackages = async (packages: ReadonlyArray<string>): Promise<void> => {
    if (!isInteractive()) return;

    const missingPackages = packages.filter((x) => !isPackageInScope(x));
    if (missingPackages.length === 0) return;

    const prompt = await import('@clack/prompts');
    const result = await prompt.confirm({
        message: missingPackages.length === 1
            ? `${missingPackages[0]} is required. Do you want to install it?`
            : `These packages are required: ${missingPackages.join(', ')}.\nDo you want to install them?`,
    });

    if (result === true) {
        const { installPackage } = await import('@antfu/install-pkg');
        await installPackage(missingPackages, { dev: true });
    }
};

/**
 * Dynamically import a list of packages, unwrapping default exports.
 *
 * In interactive sessions, missing packages trigger an install prompt first
 * (see `ensurePackages`). Call sites destructure the result as a tuple:
 * `const [plugin] = (await loadPackages(['pkg'])) as [Type]`.
 *
 * @param packageIds - Package names to import, in order.
 * @returns The imported modules (default exports unwrapped), in input order.
 */
export const loadPackages = async (packageIds: ReadonlyArray<string>): Promise<unknown[]> => {
    // Existence checks cost a fs resolution each; skip them entirely when no prompt could ever be shown
    if (isInteractive()) {
        const missing = packageIds.filter((id) => !isPackageExists(id));
        if (missing.length > 0) await ensurePackages(missing);
    }

    return Promise.all(packageIds.map(async (id): Promise<unknown> => interopDefault(import(id))));
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
 * @param plugin - The plugin instance to register when the key is unseen.
 * @param key - Stable identifier; must be identical everywhere the same package is registered.
 * @returns The first instance ever registered under `key`.
 * @see https://github.com/SukkaW/eslint-config-sukka/blob/master/packages/shared/src/memoize-eslint-plugin.ts
 */
export const memoize = <T extends ESLint.Plugin>(plugin: T, key: string): T => {
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
