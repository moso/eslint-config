import process from 'node:process';

import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
    confirm: vi.fn(),
    installPackage: vi.fn(),
    isPackageExists: vi.fn(),
}));

vi.mock('local-pkg', async (importOriginal) => {
    const actual = await importOriginal<typeof import('local-pkg')>();

    return {
        ...actual,
        default: undefined,
        isPackageExists: mocks.isPackageExists,
    };
});

vi.mock('@clack/prompts', () => ({ confirm: mocks.confirm }));

vi.mock('@antfu/install-pkg', () => ({ installPackage: mocks.installPackage }));

const { loadPackages } = await import('../src/tools');

const ttyDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');

const setTTY = (value: boolean): void => {
    Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value });
};

const restoreTTY = (): void => {
    if (ttyDescriptor === undefined)
        Reflect.deleteProperty(process.stdout, 'isTTY');
     else
        Object.defineProperty(process.stdout, 'isTTY', ttyDescriptor);
};

describe('loadPackages', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
        restoreTTY();
    });

    it('imports without prompting when non-interactive', async () => {
        vi.stubEnv('CI', '1');
        setTTY(true);

        const [globalsModule] = await loadPackages(['globals']);

        expect(globalsModule).toHaveProperty('node');
        expect(mocks.isPackageExists).not.toHaveBeenCalled();
        expect(mocks.confirm).not.toHaveBeenCalled();
        expect(mocks.installPackage).not.toHaveBeenCalled();
    });

    it('imports without prompting when interactive and nothing is missing', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists.mockReturnValue(true);

        const [astroPlugin] = await loadPackages(['eslint-plugin-astro']);

        expect(astroPlugin).toHaveProperty('rules');
        expect(mocks.isPackageExists).toHaveBeenCalledWith('eslint-plugin-astro', expect.anything());
        expect(mocks.confirm).not.toHaveBeenCalled();
        expect(mocks.installPackage).not.toHaveBeenCalled();
    });

    it('skips the existence check entirely for hard dependencies', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists.mockReturnValue(false);

        const [globalsModule] = await loadPackages(['globals']);

        expect(globalsModule).toHaveProperty('node');
        expect(mocks.isPackageExists).not.toHaveBeenCalled();
        expect(mocks.confirm).not.toHaveBeenCalled();
        expect(mocks.installPackage).not.toHaveBeenCalled();
    });

    it('installs a single missing package after a confirmed prompt', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists.mockReturnValue(false);
        mocks.confirm.mockResolvedValue(true);

        const [astroPlugin] = await loadPackages(['eslint-plugin-astro']);

        expect(mocks.confirm)
        .toHaveBeenCalledExactlyOnceWith({
            message: 'eslint-plugin-astro is required. Do you want to install it?',
        });
        expect(mocks.installPackage)
        .toHaveBeenCalledExactlyOnceWith(
            ['eslint-plugin-astro'],
            { dev: true },
        );
        expect(astroPlugin).toHaveProperty('rules');
    });

    it('prompts with the plural message for several missing packages', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists.mockReturnValue(false);
        mocks.confirm.mockResolvedValue(true);

        await loadPackages(['eslint-plugin-astro', 'eslint-plugin-vue']);

        expect(mocks.confirm)
        .toHaveBeenCalledExactlyOnceWith({
            message: 'These packages are required: eslint-plugin-astro, eslint-plugin-vue.\nDo you want to install them?',
        });
        expect(mocks.installPackage)
        .toHaveBeenCalledExactlyOnceWith(
            ['eslint-plugin-astro', 'eslint-plugin-vue'],
            { dev: true },
        );
    });

    it('does not install when the prompt is declined', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists.mockReturnValue(false);
        mocks.confirm.mockResolvedValue(false);

        await loadPackages(['eslint-plugin-astro']);

        expect(mocks.confirm).toHaveBeenCalledOnce();
        expect(mocks.installPackage).not.toHaveBeenCalled();
    });

    it('skips the prompt when the package is present in scope', async () => {
        vi.stubEnv('CI', '');
        setTTY(true);
        mocks.isPackageExists
        .mockImplementation((_name: string, options?: object) =>
            options !== undefined,);

        const [astroPlugin] = await loadPackages(['eslint-plugin-astro']);

        expect(astroPlugin).toHaveProperty('rules');
        expect(mocks.confirm).not.toHaveBeenCalled();
        expect(mocks.installPackage).not.toHaveBeenCalled();
    });
});
