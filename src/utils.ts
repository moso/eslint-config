import process from 'node:process';

import type { Linter } from 'eslint';
import type { RuleOptions } from './typegen';
import type { Awaitable, OptionsConfig, TypedFlatConfigItem } from './types';

export const parserPlain = {
    meta: {
        name: 'parser-plain',
    },
    parseForESLint: (code: string) => ({
        ast: {
            body: [],
            comments: [],
            loc: { end: code.length, start: 0 },
            range: [0, code.length],
            tokens: [],
        },
        scopeManager: null,
        services: { isPlain: true },
        visitorKeys: {
            Program: [],
        },
    }),
};

export const combine = async (...configs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]): Promise<TypedFlatConfigItem[]> => {
    const resolved = await Promise.all(configs);
    return resolved.flat();
};

export const toArray = <T>(value: T | T[]): T[] => {
    return Array.isArray(value) ? value : [value];
};

export const interopDefault = async <T>(r: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> => {
    const resolved = await r;
    return (resolved as any).default || resolved;
};

export type ResolvedOptions<T> = T extends boolean ? never : NonNullable<T>;

export const resolveSubOptions = <K extends keyof OptionsConfig>(
    options: OptionsConfig,
    key: K,
): ResolvedOptions<OptionsConfig[K]> => {
    return typeof options[key] === 'boolean'
        ? {} as any
        : options[key] || {} as any;
};

export const getOverrides = <K extends keyof OptionsConfig>(
    options: OptionsConfig,
    key: K,
): Partial<Linter.RulesRecord & RuleOptions> => {
    const sub = resolveSubOptions(options, key);
    return {
        ...(options.overrides as any)?.[key],
        ...'overrides' in sub
            ? sub.overrides
            : {},
    };
};

export const isInGitHooksOrLintStaged = (): boolean => {
    return !!(false
        || process.env.GIT_PARAMS
        || process.env.VSCODE_GIT_COMMAND
        || process.env.npm_lifecycle_script?.startsWith('lint-staged')
    );
};

export const isInEditorEnv = (): boolean => {
    if (process.env.CI) return false;

    if (isInGitHooksOrLintStaged()) return false;

    return !!(false
        || process.env.VSCODE_PID
        || process.env.VSCODE_CWD
        || process.env.JETBRAINS_IDE
        || process.env.VIM
        || process.env.NVIM
    );
};
