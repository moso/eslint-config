import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import type { ViteUserConfig as UserConfig } from 'vitest/config';

const vitestConfig: UserConfig = defineConfig({
    test: {
        coverage: {
            exclude: [...coverageConfigDefaults.exclude, 'src/rules/index.ts'],
            include: ['src/**/*.ts'],
            reporter: ['html', 'lcov'],
        },
        exclude: ['eslint.config.ts', 'node_modules/**/*'],
        globals: true,
        include: ['src/rules/**/*.test.ts', 'test/**/*.test.ts'],
        isolate: false,
        reporters: 'dot',
        testTimeout: 60_000,
    },
});

export default vitestConfig;
