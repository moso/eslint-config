import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        reporters: 'dot',
        environment: 'node',
        include: ['src/rules/**/*.test.ts'],
        exclude: ['eslint.config.ts', 'node_modules/**/*'],
    },
});
