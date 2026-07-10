import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

// Simulate a project where the `typescript` package resolves to 7.x,
// which ships no compiler API and cannot back typescript-eslint
vi.mock('local-pkg', async (importOriginal) => {
    const actual = await importOriginal<typeof import('local-pkg')>();

    return {
        ...actual,
        getPackageInfo: vi.fn(async (name: string) => (
            name === 'typescript'
                ? { name: 'typescript', rootPath: '', version: '7.0.2' }
                : actual.getPackageInfo(name)
        )),
    };
});

const { moso } = await import('../src/factory');

describe('typescript 7 gate', () => {
    it('throws with side-by-side instructions when typescript is enabled explicitly', async () => {
        await expect(moso({ typescript: true })).rejects.toThrow('@typescript/typescript6');
    });

    it('warns and degrades to JS-only linting when typescript is auto-detected', async ({ onTestFinished }) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        onTestFinished(() => warn.mockRestore());

        const configs = await moso({});

        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain('typescript@npm:@typescript/typescript6');
        expect(configs.some((config) => config.name?.startsWith('moso/typescript'))).toBe(false);
    });

    it('is not consulted at all when typescript is disabled explicitly', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await moso({ typescript: false });

        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });
});
