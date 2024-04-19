import { OptionsConfig } from '@/types';
import type { Awaitable } from '@/types';

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
            type: 'Program',
        },
        scopeManager: null,
        services: { isPlain: true },
        visitorKeys: {
            Program: [],
        },
    }),
};

export const toArray = <T>(value: T | T[]): T[] => {
    return Array.isArray(value) ? value : [value];
}

export const interopDefault = async <T>(
    r: Awaitable<T>
): Promise<T extends { default: infer U } ? U : T> => {
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
        : options[key] || {};
};

export const getOverrides = <K extends keyof OptionsConfig>(
    options: OptionsConfig,
    key: K,
) => {
    const sub = resolveSubOptions(options, key);
    return {
        ...(options.overrides as any)?.[key],
        ...'overrides' in sub
        ? sub.overrides
        : {},
    };
};
