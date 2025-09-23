import process from 'node:process';

import { isPackageExists } from 'local-pkg';

import type { SharedConfig } from '@typescript-eslint/utils/ts-eslint';

import type { RuleOptions } from './typegen';
import type {
    Awaitable,
    FilePath,
    OptionsConfig,
    ResolvedOptions,
    TypedFlatConfigItem,
} from './types';

export const combine = async (
    ...configs: ReadonlyArray<Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>>
): Promise<TypedFlatConfigItem[]> => {
    const resolved = await Promise.all(configs.map(async (config) => config));
    return resolved.flat();
};

export const checkFilePath = async (path: string): Promise<FilePath | undefined> => {
    if (!path || typeof path !== 'string') await Promise.reject(new Error('FilePath must be a non-empty string'));
    if (path.trim() !== path) await Promise.reject(new Error('FilePath cannot have leading/trailing whitespace'));

    return path;
};

export const interopDefault = async <T>(value: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> => {
    const resolved = await value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (resolved as any).default ?? resolved;
};

export const isInGitHooksOrLintStaged = (): boolean => (
    Boolean(process.env.GIT_PARAMS) ||
    Boolean(process.env.VSCODE_GIT_COMMAND) ||
    Boolean(process.env.npm_lifecycle_script?.startsWith('lint-staged')) ||
    false
);

export const isInEditorEnv = (): boolean => {
    if (Boolean(process.env['CI'])) return false;

    if (isInGitHooksOrLintStaged()) return false;

    return (
        Boolean(process.env.VSCODE_PID) ||
        Boolean(process.env.VSCODE_CWD) ||
        Boolean(process.env.JETBRAINS_IDE) ||
        Boolean(process.env.VIM) ||
        Boolean(process.env.NVIM) ||
        false
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normalizeRules = (rules: Record<string, any>): Record<string, any> => (
    Object.fromEntries(
        Object.entries(rules).map(([key, value]) => [key, typeof value === 'string' ? [value] : value]),
    )
);

export const resolveSubOptions = <K extends keyof OptionsConfig>(
    options: Readonly<OptionsConfig>,
    key: K,
): ResolvedOptions<OptionsConfig[K]> => (
    typeof options[key] === 'boolean' || typeof options[key] === 'string' ? {} : (options[key] ?? {})
) as ResolvedOptions<OptionsConfig[K]>;

export const getOverrides = (
    options: Readonly<OptionsConfig>,
    key: keyof OptionsConfig,
): (Partial<Record<string, SharedConfig.RuleEntry>> & RuleOptions) => {
    const sub = resolveSubOptions(options, key);
    return ('overrides' in sub ? sub.overrides : {}) ?? {};
};

const scopeURL = import.meta.dirname;
const isPackageInScope = (name: string): boolean => isPackageExists(name, { paths: [scopeURL] });

export const ensurePackages = async (packages: Array<string | undefined>): Promise<void> => {
    if (Boolean(process.env['CI']) || !process.stdout.isTTY) return;

    const missingPackages = packages.filter((x) => typeof x === 'string' && !isPackageInScope(x)) as string[];
    if (missingPackages.length === 0) return;

    const prompt = await import('@clack/prompts');
    const result = await prompt.confirm({
        message: missingPackages.length === 1
            ? `${missingPackages[0]} is required. Do you want to install it?`
            : `These packages are required: ${missingPackages.join(', ')}.\nDo you want to install them?`,
    });

    if (result !== false) await import('@antfu/install-pkg').then(async (x) => x.installPackage(missingPackages, { dev: true }));
};

export const loadPackages = async <T extends string[]>(packageIds: T): Promise<{ [K in keyof T]: unknown }> => {
    const missing = packageIds.filter((id) => !isPackageExists(id));

    if (missing.length > 0) await ensurePackages(missing);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return Promise.all(packageIds.map(async (id) => interopDefault(import(id)))) as any;
};

declare global {
    // eslint-disable-next-line vars-on-top, @typescript-eslint/naming-convention
    var __ESLINT_PLUGIN_MEMO__: Record<string, unknown> | undefined;
};

/**
 * Memoize plugins and configs.
 *
 * @throws TypeError
 * @see https://github.com/SukkaW/eslint-config-sukka/blob/master/packages/shared/src/memoize-eslint-plugin.ts
 */
export const memoize = <T>(fn: NonNullable<T>, key?: string): T => {
    let mut_key = key;
    if (typeof mut_key !== 'string') {
        if (typeof fn === 'function' && typeof fn.toString === 'function')
            mut_key = fn.toString();
         else
            // eslint-disable-next-line functional/no-throw-statements
            throw new Error('memoize() requires a key!');
    }

    globalThis.__ESLINT_PLUGIN_MEMO__ ??= {};
    globalThis.__ESLINT_PLUGIN_MEMO__[mut_key] ??= fn;
    return globalThis.__ESLINT_PLUGIN_MEMO__[mut_key] as T;
};

export const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);
