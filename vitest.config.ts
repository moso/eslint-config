import { defineConfig } from 'vitest/config';
import type { ViteUserConfig as UserConfig } from 'vitest/config';

const vitestConfig: UserConfig = defineConfig({
    test: {
        environment: 'node',
        exclude: ['eslint.config.ts', 'node_modules/**/*'],
        globals: true,
        include: ['src/rules/**/*.test.ts', 'test/**/*.test.ts'],
        pool: 'forks',
        reporters: 'dot',
        testTimeout: 30_000,
    },
});

export default vitestConfig;
