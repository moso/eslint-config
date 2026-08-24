import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    checkFilePath,
    combine,
    flattenRules,
    getOverrides,
    globalIgnores,
    interopDefault,
    isInEditorEnv,
    memoize,
    resolveSubOptions,
} from '../src/utils';

import type { OptionsConfig, TypedFlatConfigItem } from '../src/types';

describe('combine', () => {
    it('flattens a mix of items, arrays, and promises', async () => {
        const single: TypedFlatConfigItem = { name: 'single' };
        const inArray: TypedFlatConfigItem = { name: 'in-array' };
        const promised: TypedFlatConfigItem = { name: 'promised' };

        const result = await combine(single, [inArray], Promise.resolve(promised));
        expect(result).toStrictEqual([single, inArray, promised]);
    });
});

describe('checkFilePath', () => {
    it('returns a valid path unchanged', () => {
        expect(checkFilePath('/some/path')).toBe('/some/path');
    });

    it('throws on an empty string', () => {
        expect(() => checkFilePath('')).toThrow('FilePath must be a non-empty string');
    });

    it('throws on leading/trailing whitespace', () => {
        expect(() => checkFilePath(' padded ')).toThrow('FilePath cannot have leading/trailing whitespace');
    });
});

describe('flattenRules', () => {
    it('merges rules from a flat config array in order', () => {
        expect(flattenRules([
            { rules: { 'no-alert': 'off', 'no-eval': 'off' } },
            { name: 'no-rules-here' },
            { rules: { 'no-eval': 'error' } },
        ])).toStrictEqual({ 'no-alert': 'off', 'no-eval': 'error' });
    });
});

describe('globalIgnores', () => {
    it('uses the explicit name when given', () => {
        expect(globalIgnores(['dist'], 'my-ignores')).toStrictEqual({
            ignores: ['dist'],
            name: 'my-ignores',
        });
    });

    it('auto-numbers the name when omitted', () => {
        const first = globalIgnores(['dist']);
        const second = globalIgnores(['dist']);

        expect(first.name).toMatch(/^globalIgnores \d+$/u);
        expect(second.name).toMatch(/^globalIgnores \d+$/u);
        expect(first.name).not.toBe(second.name);
    });

    it('throws a TypeError when patterns are not an array', () => {
        expect(() => globalIgnores('dist' as never)).toThrow(TypeError);
    });

    it('throws a TypeError on an empty array', () => {
        expect(() => globalIgnores([])).toThrow(TypeError);
    });
});

describe('interopDefault', () => {
    it('unwraps a default export', async () => {
        const inner = { rules: {} };
        await expect(interopDefault({ default: inner })).resolves.toBe(inner);
    });

    it('returns the resolved value itself without a default export', async () => {
        const module = { rules: {} };
        await expect(interopDefault(module)).resolves.toBe(module);
    });
});

describe('isInEditorEnv', () => {
    const envVars = [
        'CI',
        'GIT_PARAMS',
        'VSCODE_GIT_COMMAND',
        'npm_lifecycle_script',
        'VSCODE_PID',
        'VSCODE_CWD',
        'JETBRAINS_IDE',
        'VIM',
        'NVIM',
    ] as const;

    const stubAll = (overrides: Partial<Record<(typeof envVars)[number], string>> = {}): void => {
        for (const name of envVars) vi.stubEnv(name, overrides[name] ?? '');
    };

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('returns false in CI even when an editor var is set', () => {
        stubAll({ CI: 'true', VSCODE_PID: '123' });
        expect(isInEditorEnv()).toBe(false);
    });

    it('returns false in git hooks', () => {
        stubAll({ GIT_PARAMS: '1', VSCODE_PID: '123' });
        expect(isInEditorEnv()).toBe(false);
    });

    it('returns false for the VSCode git command', () => {
        stubAll({ VSCODE_GIT_COMMAND: 'commit', VSCODE_PID: '123' });
        expect(isInEditorEnv()).toBe(false);
    });

    it('returns false under lint-staged', () => {
        stubAll({ npm_lifecycle_script: 'lint-staged --concurrent false', VSCODE_PID: '123' });
        expect(isInEditorEnv()).toBe(false);
    });

    it.each(['VSCODE_PID',
'VSCODE_CWD',
'JETBRAINS_IDE',
'VIM',
'NVIM'] as const)(
        'returns true when only %s is set',
        (name) => {
            stubAll({ [name]: '1' });
            expect(isInEditorEnv()).toBe(true);
        },
    );

    it('returns false when no relevant var is set', () => {
        stubAll();
        expect(isInEditorEnv()).toBe(false);
    });
});

describe('resolveSubOptions', () => {
    it('resolves a boolean option to an empty object', () => {
        expect(resolveSubOptions({ jsonc: true }, 'jsonc')).toStrictEqual({});
    });

    it('returns the object form unchanged', () => {
        const options: OptionsConfig = {
            jsonc: {
                overrides: { 'jsonc/no-bigint-literals': 'off' },
            },
        };

        expect(resolveSubOptions(options, 'jsonc')).toBe(options.jsonc);
    });
});

describe('getOverrides', () => {
    it('returns an empty object when the option has no overrides key', () => {
        expect(getOverrides({ jsonc: {} }, 'jsonc')).toStrictEqual({});
    });

    it('returns the overrides object when given', () => {
        const overrides: TypedFlatConfigItem['rules'] = { 'jsonc/no-bigint-literals': 'off' };
        expect(getOverrides({ jsonc: { overrides } }, 'jsonc')).toBe(overrides);
    });

    it('returns an empty object for an explicit `overrides: undefined`', () => {
        const options: OptionsConfig = { jsonc: { overrides: undefined } };
        expect(getOverrides(options, 'jsonc')).toStrictEqual({});
    });
});

describe('memoize', () => {
    it('registers a plugin under a new key and returns it', () => {
        const plugin = { rules: {} };
        expect(memoize(plugin, 'test:memoize:register')).toBe(plugin);
    });

    it('returns the first instance for an already-registered key', () => {
        const first = { rules: {} };
        const second = { rules: {} };

        expect(memoize(first, 'test:memoize:dedupe')).toBe(first);
        expect(memoize(second, 'test:memoize:dedupe')).toBe(first);
    });
});
