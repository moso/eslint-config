import {
    afterAll,
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
    isPackageExists: vi.fn(),
    nodeRecommended: { rules: undefined as Record<string, unknown> | undefined },
}));

vi.mock('local-pkg', async (importOriginal) => {
    const actual = await importOriginal<typeof import('local-pkg')>();

    return {
        ...actual,
        default: undefined,
        isPackageExists: mocks.isPackageExists,
    };
});

vi.mock('eslint-plugin-n', async (importOriginal) => {
    const actual = await importOriginal<typeof import('eslint-plugin-n')>();

    return {
        default: {
            ...actual.default,
            configs: {
                ...actual.default.configs,
                'flat/recommended': mocks.nodeRecommended,
            },
        },
    };
});

const { node, react, vue } = await import('../src/configs');

describe('framework detection through local-pkg', () => {
    beforeEach(() => {
        vi.stubEnv('CI', '1');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    afterAll(() => {
        globalThis.__ESLINT_PLUGIN_MEMO__?.delete('eslint-plugin-n');
    });

    it('react allows the Remix export names when a Remix package is installed', async () => {
        mocks.isPackageExists.mockImplementation((name: string) => name.startsWith('@remix-run/'));

        const configs = await react({
            files: ['**/*.jsx'],
            nextjs: false,
            stylistic: false,
            typescript: false,
        });

        const rules = configs.find((config) => config.name === 'moso/react/rules')?.rules;
        const [, options] = (rules?.['react-refresh/only-export-components'] ?? []) as [unknown, { allowExportNames: string[] }];

        expect(options.allowExportNames).toEqual(expect.arrayContaining(['action', 'loader', 'ErrorBoundary']));
        expect(options.allowExportNames).not.toContain('generateMetadata');
    });

    it('vue emits the Nuxt config items when nuxt is installed', async () => {
        mocks.isPackageExists.mockImplementation((name: string) => name === 'nuxt');

        const configs = await vue({
            files: ['**/*.vue'],
            filesTypeAware: [],
            ignoresTypeAware: [],
            parserOptions: {},
            sfcBlocks: false,
            stylistic: false,
            typescript: false,
        });

        const names = configs.map((config) => config.name);

        expect(names).toContain('moso/nuxt/rules');
        expect(configs.find((config) => config.name === 'moso/nuxt/rules')?.rules?.['vue/multi-word-component-names']).toBe('off');
    });

    it('node renames only `n/`-prefixed preset rules', async () => {
        mocks.nodeRecommended.rules = { 'n/no-path-concat': 'error', 'unprefixed/rule': 'warn' };

        const configs = await node({});
        const rules = configs.find((config) => config.name === 'moso/node/rules')?.rules ?? {};

        expect(rules['node/no-path-concat']).toBe('error');
        expect(rules['unprefixed/rule']).toBe('warn');
        expect(rules).not.toHaveProperty('n/no-path-concat');
    });

    it('node tolerates a plugin preset without rules', async () => {
        mocks.nodeRecommended.rules = undefined;

        const configs = await node({});
        const rules = configs.find((config) => config.name === 'moso/node/rules')?.rules ?? {};

        expect(rules['node/no-unpublished-import']).toBe('warn');
    });
});
